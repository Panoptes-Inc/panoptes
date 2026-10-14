import { browser } from '$app/environment';
import { adaptMockAnalysisJob } from '$lib/features/analysis-job/adapter/analysis-job-adapter';
import type {
  IsoDateString,
  PanoptesAnalysisSnapshotPayload,
  PanoptesApiClient,
  PanoptesInferenceDraft,
  PanoptesPipelineRuntimeState,
  PanoptesProgressState,
  PanoptesProjectDetailView,
  PanoptesProjectRecord,
  PanoptesProjectSummary,
  PanoptesStrategyPhase,
  PanoptesTaskTransition,
  PanoptesUiStepPanelState,
  PanoptesUsageState,
  Uuid
} from '../types';
import { PanoptesApiError } from '../utils/errors';
import {
  createInitialUiStepPanelState,
  createRuntimeStateFromJob,
  projectStatusToDisplayState
} from '../utils/guards';
import { createClientCorrelationId } from '../utils/idempotency';
import { buildMockSnapshotPayload } from './mock/snapshot-factory';
import { tickAllMockJobs } from './mock/runtime-ticker';
import type { MockFailureMode, MockState, StoredJob } from './mock/state';

const MOCK_STORAGE_KEY = 'panoptes.mock.v3_3.state';
const DEMO_ORG_ID = 'org_demo_panoptes';

let memoryState: MockState | null = null;

function normalizeLegacyStrategyPhase(value: string): PanoptesStrategyPhase {
  if (value === '30') return 'day_30';
  if (value === '60') return 'day_60';
  if (value === '90') return 'day_90';
  return value as PanoptesStrategyPhase;
}

function migrateLegacyStrategyPhaseState(state: MockState): MockState {
  return {
    ...state,
    snapshots: state.snapshots.map((snapshot) => ({
      ...snapshot,
      strategy: {
        ...snapshot.strategy,
        planPhases: snapshot.strategy.planPhases.map((phase) => ({
          ...phase,
          phase: normalizeLegacyStrategyPhase(phase.phase)
        }))
      },
      phaseTasks: snapshot.phaseTasks.map((task) => ({
        ...task,
        phaseCode: normalizeLegacyStrategyPhase(task.phaseCode)
      }))
    }))
  };
}

function nowIso(): IsoDateString {
  return new Date().toISOString();
}

function createUuid(prefix = 'mock'): Uuid {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function hashString(source: string): number {
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function seededRange(seed: number, min: number, max: number, offset = 0): number {
  const span = max - min + 1;
  return min + ((seed + offset * 13) % span);
}

function pickBySeed<T>(seed: number, items: T[], offset = 0): T {
  return items[(seed + offset * 11) % items.length]!;
}

function hostFromUrl(targetUrl: string): string {
  try {
    return new URL(targetUrl).hostname.replace(/^www\./, '');
  } catch {
    return targetUrl.replace(/^https?:\/\//, '').split('/')[0] || 'example.com';
  }
}

function titleFromHost(host: string): string {
  return (
    host
      .split('.')
      .shift()
      ?.split(/[-_]/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ') || 'Panoptes Project'
  );
}

function inferDraftFromUrl(targetUrl: string): PanoptesInferenceDraft {
  const host = hostFromUrl(targetUrl).toLowerCase();

  if (host.includes('hr') || host.includes('recruit') || host.includes('talent')) {
    return {
      inferredIndustry: '人材 SaaS',
      inferredStructureType: '成熟 × 比較検討型',
      inferredSiteScale: '中規模',
      industryConfidence: 'high',
      structureConfidence: 'medium',
      scaleConfidence: 'medium',
      notes: ['比較導線が明確で、導入検討フェーズの情報量が厚い構造です。'],
      canEdit: true,
      lockedAfterConfirm: true
    };
  }

  if (host.includes('cosme') || host.includes('beauty') || host.includes('shop')) {
    return {
      inferredIndustry: 'D2C コスメ',
      inferredStructureType: 'ブランド主導 × 成熟安定型',
      inferredSiteScale: '成長中',
      industryConfidence: 'medium',
      structureConfidence: 'high',
      scaleConfidence: 'medium',
      notes: ['ブランド訴求が強く、比較表現より世界観設計が主導しています。'],
      canEdit: true,
      lockedAfterConfirm: true
    };
  }

  return {
    inferredIndustry: 'BtoB SaaS',
    inferredStructureType: '成熟 × 比較検討型',
    inferredSiteScale: '中規模',
    industryConfidence: 'high',
    structureConfidence: 'high',
    scaleConfidence: 'low',
    notes: ['導入メリット・比較導線・信頼補強が主要観察ポイントです。'],
    canEdit: true,
    lockedAfterConfirm: true
  };
}

function failureModeFromUrl(targetUrl: string): MockFailureMode {
  const lower = targetUrl.toLowerCase();
  if (lower.includes('fail-url') || lower.includes('unreachable')) return 'url_unreachable';
  if (lower.includes('fail-industry')) return 'industry_analysis_failed';
  if (lower.includes('fail-commit')) return 'snapshot_commit_failed';
  return 'none';
}

function createUsageState(): PanoptesUsageState {
  return {
    tokenUsageRate: 64,
    memoryLabel: '記憶稼働中',
    projectDayCount: 24,
    projectDayMax: 90,
    aiModeLabel: 'デフォルト',
    tokenModeLabel: '高負荷',
    projectStatusLabel: '未保存'
  };
}

function buildProjectRecord(targetUrl: string, projectName?: string): PanoptesProjectRecord {
  const host = hostFromUrl(targetUrl);
  const timestamp = nowIso();
  return {
    projectId: createUuid('project'),
    orgId: DEMO_ORG_ID,
    projectName: projectName?.trim() || titleFromHost(host),
    targetUrl,
    normalizedTargetUrl: targetUrl,
    projectStatus: 'empty',
    currentSnapshotId: null,
    latestAnalysisJobId: null,
    latestAnalysisSessionId: null,
    currentStrategyPlanId: null,
    selectedStrategyKey: null,
    strategyStatusLabel: null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

function buildStoredJob(project: PanoptesProjectRecord, idempotencyKey: string): StoredJob {
  const timestamp = nowIso();
  return {
    analysisJobId: createUuid('job'),
    projectId: project.projectId,
    orgId: project.orgId,
    analysisSessionId: createUuid('session'),
    idempotencyKey,
    status: 'running',
    progressPhase: 'target_scan',
    progressStepIndex: 1,
    progressPercent: 6,
    statusMessage: '分析対象 URL を分析中です…',
    errorCode: null,
    errorMessage: null,
    inferenceLocked: false,
    inferenceConfirmedAt: null,
    startedAt: timestamp,
    finishedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    phaseStartedAt: timestamp,
    failureMode: failureModeFromUrl(project.targetUrl),
    inferenceDraft: inferDraftFromUrl(project.targetUrl)
  };
}

function buildProjectSummary(project: PanoptesProjectRecord, latestJob: StoredJob | null): PanoptesProjectSummary {
  const publicJob = latestJob ? adaptMockAnalysisJob(latestJob) : null;
  return {
    projectId: project.projectId,
    orgId: project.orgId,
    projectName: project.projectName,
    targetUrl: project.targetUrl,
    normalizedTargetUrl: project.normalizedTargetUrl,
    projectStatus: project.projectStatus,
    displayState: projectStatusToDisplayState({
      projectStatus: project.projectStatus,
      currentSnapshotId: project.currentSnapshotId,
      latestAnalysisJobId: project.latestAnalysisJobId
    }),
    currentSnapshotId: project.currentSnapshotId,
    latestAnalysisJobId: project.latestAnalysisJobId,
    latestAnalysisSessionId: project.latestAnalysisSessionId,
    currentStrategyPlanId: project.currentStrategyPlanId,
    selectedStrategyKey: project.selectedStrategyKey,
    strategyStatusLabel: project.strategyStatusLabel,
    latestJobStatus: publicJob?.status ?? null,
    latestProgressPhase: latestJob?.progressPhase ?? null,
    latestProgressStepIndex: latestJob?.progressStepIndex ?? null,
    latestProgressPercent: latestJob?.progressPercent ?? null,
    latestStatusMessage: latestJob?.statusMessage ?? null,
    latestErrorCode: latestJob?.errorCode ?? null,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

function buildProgressState(job: StoredJob): PanoptesProgressState {
  const publicJob = adaptMockAnalysisJob(job);
  return {
    projectId: job.projectId,
    analysisJobId: job.analysisJobId,
    analysisSessionId: job.analysisSessionId,
    status: publicJob.status,
    progressPhase: job.progressPhase,
    progressStepIndex: job.progressStepIndex,
    progressPercent: job.progressPercent,
    statusMessage: job.statusMessage,
    errorCode: publicJob.errorCode,
    errorMessage: publicJob.errorMessage,
    inferenceLocked: job.inferenceLocked,
    inferenceConfirmedAt: job.inferenceConfirmedAt,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    updatedAt: job.updatedAt
  };
}

function buildUiStepPanel(job: StoredJob): PanoptesUiStepPanelState {
  return {
    ...createInitialUiStepPanelState(job.statusMessage),
    visibleStep: job.progressPhase,
    visibleStepIndex: job.progressStepIndex,
    serverConfirmedPhase: job.progressPhase,
    serverConfirmedStepIndex: job.progressStepIndex,
    progressPercent: job.progressPercent,
    statusMessage: job.statusMessage,
    canAutoAdvance: job.status !== 'awaiting_confirmation',
    panelTransitionLocked: job.status === 'awaiting_confirmation'
  };
}

function buildRuntimeState(projectId: string, job: StoredJob | null): PanoptesPipelineRuntimeState {
  return createRuntimeStateFromJob(projectId, job ? adaptMockAnalysisJob(job) : null);
}

function buildSnapshotPayload(project: PanoptesProjectRecord, draft: PanoptesInferenceDraft): PanoptesAnalysisSnapshotPayload {
  return buildMockSnapshotPayload(project, draft, {
    createUuid,
    hashString,
    hostFromUrl,
    nowIso,
    pickBySeed,
    seededRange,
    titleFromHost
  });
}



function createReadySeedProject(targetUrl: string, projectName: string) {
  const project = buildProjectRecord(targetUrl, projectName);
  const draft = inferDraftFromUrl(targetUrl);
  const job = buildStoredJob(project, createClientCorrelationId('seed'));
  const snapshot = buildSnapshotPayload(project, draft);
  const timestamp = nowIso();

  job.status = 'completed';
  job.progressPhase = 'strategy_synthesis';
  job.progressStepIndex = 5;
  job.progressPercent = 100;
  job.statusMessage = 'snapshot 保存が完了しました。';
  job.inferenceLocked = true;
  job.inferenceConfirmedAt = timestamp;
  job.finishedAt = timestamp;
  job.updatedAt = timestamp;

  project.projectStatus = 'ready';
  project.currentSnapshotId = snapshot.analysisSnapshotId;
  project.latestAnalysisJobId = job.analysisJobId;
  project.latestAnalysisSessionId = job.analysisSessionId;
  project.currentStrategyPlanId = snapshot.strategyPlans[0]?.strategyPlanId ?? null;
  project.selectedStrategyKey = snapshot.strategyPlans[0]?.strategyKey ?? null;
  project.strategyStatusLabel = 'improving';
  project.updatedAt = timestamp;

  return { project, job, snapshot };
}

function createInitialState(): MockState {
  const first = createReadySeedProject('https://panoptes-demo.example.com', 'Panoptes Demo');
  const second = createReadySeedProject('https://nova-hr.example.com', 'Nova HR Cloud');
  const emptyProject = buildProjectRecord('https://new-project.example.com', 'New Project');

  return {
    projects: [first.project, second.project, emptyProject],
    jobs: [first.job, second.job],
    snapshots: [first.snapshot, second.snapshot],
    taskTransitions: [],
    idempotencyEntries: [],
    usage: createUsageState()
  };
}

function loadState(): MockState {
  if (!browser) {
    if (!memoryState) memoryState = createInitialState();
    return memoryState;
  }

  const raw = window.localStorage.getItem(MOCK_STORAGE_KEY);
  return raw ? migrateLegacyStrategyPhaseState(JSON.parse(raw) as MockState) : createInitialState();
}

function saveState(state: MockState): MockState {
  const next = deepClone(state);
  if (browser) {
    window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(next));
  } else {
    memoryState = next;
  }
  return next;
}

function getLatestJob(state: MockState, projectId: Uuid): StoredJob | null {
  const project = state.projects.find((item) => item.projectId === projectId);
  if (!project?.latestAnalysisJobId) return null;
  return state.jobs.find((job) => job.analysisJobId === project.latestAnalysisJobId) ?? null;
}

function getSnapshot(state: MockState, snapshotId: Uuid | null): PanoptesAnalysisSnapshotPayload | null {
  if (!snapshotId) return null;
  return state.snapshots.find((snapshot) => snapshot.analysisSnapshotId === snapshotId) ?? null;
}

function tickAllJobs(state: MockState): MockState {
  return tickAllMockJobs(state, {
    createSnapshot: buildSnapshotPayload,
    inferDraftFromUrl,
    nowIso,
    nowMs: () => Date.now()
  });
}

function buildProjectDetail(state: MockState, projectId: Uuid): PanoptesProjectDetailView {
  const project = state.projects.find((item) => item.projectId === projectId);
  if (!project) {
    throw new PanoptesApiError('Project not found.', { code: 'not_found', status: 404 });
  }

  const latestJob = getLatestJob(state, projectId);
  return {
    project: deepClone(project),
    projectSummary: buildProjectSummary(project, latestJob),
    latestJob: latestJob ? deepClone(adaptMockAnalysisJob(latestJob)) : null,
    currentSnapshot: getSnapshot(state, project.currentSnapshotId),
    runtimeState: buildRuntimeState(projectId, latestJob),
    uiStepPanel: latestJob && (latestJob.status !== 'completed' || !project.currentSnapshotId) ? buildUiStepPanel(latestJob) : null
  };
}

function findIdempotentResponse(
  state: MockState,
  endpoint: 'create' | 'reanalyze',
  key: string,
  payloadSignature: string
): { project: PanoptesProjectRecord; job: StoredJob } | null {
  const entry = state.idempotencyEntries.find((item) => item.endpoint === endpoint && item.key === key);
  if (!entry) return null;
  if (entry.payloadSignature !== payloadSignature) {
    throw new PanoptesApiError('Idempotency conflict.', { code: 'conflict', status: 409 });
  }
  const project = state.projects.find((item) => item.projectId === entry.projectId);
  const job = state.jobs.find((item) => item.analysisJobId === entry.analysisJobId);
  if (!project || !job) {
    throw new PanoptesApiError('Idempotent resource not found.', { code: 'not_found', status: 404 });
  }
  return { project, job };
}

function appendIdempotencyEntry(
  state: MockState,
  endpoint: 'create' | 'reanalyze',
  key: string,
  payloadSignature: string,
  projectId: Uuid,
  analysisJobId: Uuid
): void {
  state.idempotencyEntries.unshift({
    key,
    endpoint,
    payloadSignature,
    projectId,
    analysisJobId
  });
}

export const mockPanoptesApiClient: PanoptesApiClient = {
  async listProjects() {
    const state = saveState(tickAllJobs(loadState()));
    const items = [...state.projects]
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map((project) => buildProjectSummary(project, getLatestJob(state, project.projectId)));
    return { items };
  },

  async getProjectDetail(projectId) {
    const state = saveState(tickAllJobs(loadState()));
    return buildProjectDetail(state, projectId);
  },

  async createAndStartAnalysis(input) {
    const state = saveState(tickAllJobs(loadState()));
    const signature = JSON.stringify({ targetUrl: input.targetUrl, projectName: input.projectName });
    const existing = findIdempotentResponse(state, 'create', input.idempotencyKey, signature);
    if (existing) {
      return {
        project: deepClone(existing.project),
        projectSummary: buildProjectSummary(existing.project, existing.job),
        analysisJob: deepClone(adaptMockAnalysisJob(existing.job)),
        runtimeState: buildRuntimeState(existing.project.projectId, existing.job)
      };
    }

    const project = buildProjectRecord(input.targetUrl, input.projectName);
    const job = buildStoredJob(project, input.idempotencyKey);
    const timestamp = nowIso();
    project.projectStatus = 'analyzing';
    project.latestAnalysisJobId = job.analysisJobId;
    project.latestAnalysisSessionId = job.analysisSessionId;
    project.updatedAt = timestamp;

    state.projects.unshift(project);
    state.jobs.unshift(job);
    appendIdempotencyEntry(state, 'create', input.idempotencyKey, signature, project.projectId, job.analysisJobId);
    saveState(state);

    return {
      project: deepClone(project),
      projectSummary: buildProjectSummary(project, job),
      analysisJob: deepClone(adaptMockAnalysisJob(job)),
      runtimeState: buildRuntimeState(project.projectId, job)
    };
  },

  async pollAnalysisProgress(input) {
    const state = saveState(tickAllJobs(loadState()));
    const project = state.projects.find((item) => item.projectId === input.projectId);
    const requestedJob = state.jobs.find((job) => job.analysisJobId === input.analysisJobId);
    if (!project || !requestedJob) {
      throw new PanoptesApiError('Analysis job not found.', { code: 'not_found', status: 404 });
    }

    const latestJob = getLatestJob(state, input.projectId) ?? requestedJob;
    const staleResponseIgnored = latestJob.analysisJobId !== requestedJob.analysisJobId;
    const responseJob = staleResponseIgnored ? requestedJob : latestJob;

    return {
      progressState: buildProgressState(responseJob),
      uiStepPanel: buildUiStepPanel(responseJob),
      runtimeState: buildRuntimeState(project.projectId, responseJob),
      projectSummary: buildProjectSummary(project, latestJob),
      inferenceDraft: responseJob.inferenceDraft,
      currentSnapshotReady: Boolean(project.currentSnapshotId && latestJob.status === 'completed'),
      staleResponseIgnored
    };
  },

  async confirmInference(input) {
    const state = saveState(tickAllJobs(loadState()));
    const project = state.projects.find((item) => item.projectId === input.projectId);
    const job = state.jobs.find((item) => item.analysisJobId === input.analysisJobId);
    if (!project || !job) {
      throw new PanoptesApiError('Analysis job not found.', { code: 'not_found', status: 404 });
    }
    if (project.latestAnalysisJobId !== input.analysisJobId || job.status !== 'awaiting_confirmation') {
      throw new PanoptesApiError('Inference confirmation is stale.', { code: 'stale_job', status: 409 });
    }

    const timestamp = nowIso();
    job.inferenceDraft = {
      ...(job.inferenceDraft ?? inferDraftFromUrl(project.targetUrl)),
      inferredIndustry: input.inferredIndustry,
      inferredStructureType: input.inferredStructureType,
      inferredSiteScale: input.inferredSiteScale
    };
    job.inferenceLocked = true;
    job.inferenceConfirmedAt = timestamp;
    job.status = 'running';
    job.progressPhase = 'competitor_analysis';
    job.progressStepIndex = 3;
    job.progressPercent = 12;
    job.statusMessage = '競合を分析中です…';
    job.updatedAt = timestamp;
    job.phaseStartedAt = timestamp;
    project.projectStatus = 'analyzing';
    project.updatedAt = timestamp;
    saveState(state);

    return {
      analysisJob: deepClone(adaptMockAnalysisJob(job)),
      progressState: buildProgressState(job),
      uiStepPanel: buildUiStepPanel(job)
    };
  },

  async reanalyzeProject(projectId, idempotencyKey) {
    const state = saveState(tickAllJobs(loadState()));
    const project = state.projects.find((item) => item.projectId === projectId);
    if (!project) {
      throw new PanoptesApiError('Project not found.', { code: 'not_found', status: 404 });
    }
    const latestJob = getLatestJob(state, projectId);
    if (
      latestJob &&
      latestJob.status !== 'completed' &&
      latestJob.status !== 'failed' &&
      latestJob.status !== 'cancelled' &&
      latestJob.status !== 'commit_failed'
    ) {
      throw new PanoptesApiError('Analysis already running.', { code: 'already_running', status: 409 });
    }

    const signature = JSON.stringify({ projectId });
    const existing = findIdempotentResponse(state, 'reanalyze', idempotencyKey, signature);
    if (existing) {
      return {
        project: deepClone(existing.project),
        projectSummary: buildProjectSummary(existing.project, existing.job),
        analysisJob: deepClone(adaptMockAnalysisJob(existing.job)),
        runtimeState: buildRuntimeState(existing.project.projectId, existing.job)
      };
    }

    const job = buildStoredJob(project, idempotencyKey);
    const timestamp = nowIso();
    project.projectStatus = 'analyzing';
    project.latestAnalysisJobId = job.analysisJobId;
    project.latestAnalysisSessionId = job.analysisSessionId;
    project.updatedAt = timestamp;
    state.jobs.unshift(job);
    appendIdempotencyEntry(state, 'reanalyze', idempotencyKey, signature, project.projectId, job.analysisJobId);
    saveState(state);

    return {
      project: deepClone(project),
      projectSummary: buildProjectSummary(project, job),
      analysisJob: deepClone(adaptMockAnalysisJob(job)),
      runtimeState: buildRuntimeState(project.projectId, job)
    };
  },

  async selectStrategy(input) {
    const state = saveState(tickAllJobs(loadState()));
    const project = state.projects.find((item) => item.projectId === input.projectId);
    const snapshot = state.snapshots.find((item) => item.analysisSnapshotId === input.analysisSnapshotId);
    if (!project || !snapshot) {
      throw new PanoptesApiError('Snapshot not found.', { code: 'not_found', status: 404 });
    }
    const selectedStrategyPlan = snapshot.strategyPlans.find((plan) => plan.strategyKey === input.strategyKey);
    if (!selectedStrategyPlan) {
      throw new PanoptesApiError('Strategy plan not found.', { code: 'not_found', status: 404 });
    }

    snapshot.strategyPlans = snapshot.strategyPlans.map((plan) => ({
      ...plan,
      isSelected: plan.strategyPlanId === selectedStrategyPlan.strategyPlanId,
      updatedAt: nowIso()
    }));
    project.currentStrategyPlanId = selectedStrategyPlan.strategyPlanId;
    project.selectedStrategyKey = selectedStrategyPlan.strategyKey;
    project.strategyStatusLabel = 'improving';
    project.updatedAt = nowIso();
    saveState(state);

    return {
      project: deepClone(project),
      selectedStrategyPlan: deepClone({ ...selectedStrategyPlan, isSelected: true }),
      phaseTasks: deepClone(snapshot.phaseTasks.filter((task) => task.strategyPlanId === selectedStrategyPlan.strategyPlanId)),
      projectSummary: buildProjectSummary(project, getLatestJob(state, project.projectId))
    };
  },

  async updateTaskStatus(input) {
    const state = saveState(tickAllJobs(loadState()));
    const snapshot = state.snapshots.find((item) => item.phaseTasks.some((task) => task.phaseTaskId === input.phaseTaskId));
    const phaseTask = snapshot?.phaseTasks.find((task) => task.phaseTaskId === input.phaseTaskId);
    if (!snapshot || !phaseTask) {
      throw new PanoptesApiError('Task not found.', { code: 'not_found', status: 404 });
    }

    const transition: PanoptesTaskTransition = {
      phaseTaskId: phaseTask.phaseTaskId,
      fromStatus: phaseTask.taskStatus,
      toStatus: input.toStatus,
      reason: input.reason,
      createdAt: nowIso()
    };
    phaseTask.taskStatus = input.toStatus;
    phaseTask.updatedAt = transition.createdAt;
    state.taskTransitions.unshift(transition);
    saveState(state);

    return {
      phaseTask: deepClone(phaseTask),
      transition
    };
  },

  async getUsageState() {
    const state = saveState(tickAllJobs(loadState()));
    return deepClone(state.usage);
  }
};

