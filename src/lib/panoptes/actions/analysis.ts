import { get } from 'svelte/store';
import {
  adaptFrontendPollProgress,
  resolveAnalysisPollingDecision
} from '$lib/features/analysis-job/adapter/analysis-job-adapter';
import { panoptesApiClient } from '../api/client';
import { createAnalysisPollingController } from '../polling/analysis-polling-controller';
import {
  buildProjectDetailProgressState,
  buildRuntimeProgressState,
  shouldApplyProgressPayload
} from '../domain/runtime-progress';
import { networkStore } from '../stores/network';
import { projectDetailStore } from '../stores/projects';
import { analysisRuntimeStore } from '../stores/runtime';
import { sessionUiStore } from '../stores/session';
import type {
  PanoptesCreateAnalysisResult,
  PanoptesInferenceDraft,
  PanoptesPollProgressResult,
  Uuid
} from '../types';
import { failureCodeToMessage, normalizePanoptesError } from '../utils/errors';
import { projectStatusToDisplayState } from '../utils/guards';
import { generateIdempotencyKey } from '../utils/idempotency';
import {
  mergeProjectSummaryPatch,
  refreshProjectList,
  resetRuntimeForNewJob,
  selectProject,
  setProjectDetailFromResponse,
  syncRuntimeWithProjectDetail
} from './projects';
import { pushToast } from './network';

function isValidHttpUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function resolvePollingInterval(): number {
  const runtime = get(analysisRuntimeStore);
  const network = get(networkStore);
  if (!network.online || network.apiReachability === 'unreachable') return 10000;
  if (typeof document !== 'undefined' && document.hidden) return 10000;
  if (runtime.runtimeStatus === 'waiting_for_inference_confirmation') return 6000;
  if (network.apiReachability === 'degraded') return 8000;
  return runtime.pollingIntervalMs ?? 2500;
}

function canPollActiveJob(): boolean {
  const runtime = get(analysisRuntimeStore);
  return Boolean(runtime.activeProjectId && runtime.activeJobId) &&
    !['completed', 'failed', 'idle'].includes(runtime.runtimeStatus);
}

export function updateInferenceDraft(patch: Partial<PanoptesInferenceDraft>): void {
  analysisRuntimeStore.update((store) => ({
    ...store,
    inferenceDraft: store.inferenceDraft ? { ...store.inferenceDraft, ...patch } : store.inferenceDraft
  }));
}

export function applyProgressUpdate(payload: PanoptesPollProgressResult): void {
  const runtime = get(analysisRuntimeStore);
  if (!shouldApplyProgressPayload(runtime, payload)) {
    return;
  }

  analysisRuntimeStore.update((store) => buildRuntimeProgressState(store, payload));
  projectDetailStore.update((store) => buildProjectDetailProgressState(store, payload));

  mergeProjectSummaryPatch(payload.projectSummary.projectId, payload.projectSummary);
}

export async function reconcileOnCommitSuccess(projectId: Uuid): Promise<void> {
  const detail = await panoptesApiClient.getProjectDetail(projectId);
  if (!detail.project.currentSnapshotId) {
    throw new Error('Commit reconciliation completed without current snapshot id.');
  }

  setProjectDetailFromResponse(detail);
  syncRuntimeWithProjectDetail(detail);
  mergeProjectSummaryPatch(projectId, detail.projectSummary);

  analysisRuntimeStore.update((store) => ({
    ...store,
    runtimeStatus: 'completed',
    pollingStatus: 'stopped',
    terminalReason: 'completed',
    canConfirmInference: false,
    confirmMutationStatus: 'idle'
  }));
  sessionUiStore.update((store) => ({
    ...store,
    mainSurfaceMode: 'snapshot_view',
    globalBlockingAction: null
  }));
}

const pollingController = createAnalysisPollingController<PanoptesPollProgressResult>({
  canPoll: canPollActiveJob,
  isOnline: () => get(networkStore).online,
  getDelayMs: resolvePollingInterval,
  request: async () => {
    const runtime = get(analysisRuntimeStore);
    if (!runtime.activeProjectId || !runtime.activeJobId) {
      throw new Error('Polling requested without an active analysis job.');
    }
    const payload = await panoptesApiClient.pollAnalysisProgress({
      projectId: runtime.activeProjectId,
      analysisJobId: runtime.activeJobId,
      knownProgressPercent: runtime.progressPercent,
      knownStepIndex: runtime.serverConfirmedStepIndex
    });
    return adaptFrontendPollProgress(payload);
  },
  handleResult: async (payload) => {
    networkStore.update((store) => ({
      ...store,
      apiReachability: 'reachable',
      lastCheckedAt: new Date().toISOString()
    }));
    applyProgressUpdate(payload);

    if (payload.progressState.status === 'partially_completed') {
      pushToast('warning', '一部の分析結果のみ利用できます。');
    }
    if (payload.currentSnapshotReady) {
      await reconcileOnCommitSuccess(payload.projectSummary.projectId);
      return 'stop';
    }
    if (resolveAnalysisPollingDecision(payload.progressState.status, payload.currentSnapshotReady) === 'stop') {
      if (payload.progressState.errorCode) {
        pushToast('error', failureCodeToMessage(payload.progressState.errorCode));
      }
      return 'stop';
    }
    return 'continue';
  },
  handleError: (error) => {
    const normalized = normalizePanoptesError(error);
    networkStore.update((store) => ({
      ...store,
      apiReachability: 'degraded',
      lastCheckedAt: new Date().toISOString()
    }));
    analysisRuntimeStore.update((store) => ({ ...store, pollingStatus: 'backoff' }));
    pushToast('warning', normalized.message);
    return 'continue';
  },
  handleTimeout: () => {
    networkStore.update((store) => ({
      ...store,
      apiReachability: 'degraded',
      lastCheckedAt: new Date().toISOString()
    }));
    analysisRuntimeStore.update((store) => ({ ...store, pollingStatus: 'backoff' }));
    pushToast('warning', '分析状態の取得がタイムアウトしました。再試行します。');
    return 'continue';
  },
  onScheduled: (delayMs) => {
    analysisRuntimeStore.update((store) => ({
      ...store,
      pollingStatus: delayMs > 4000 ? 'backoff' : 'polling'
    }));
  },
  onStopped: () => {
    analysisRuntimeStore.update((store) => ({ ...store, pollingStatus: 'stopped' }));
  }
});

export function stopPolling(): void {
  pollingController.stop();
}

export function scheduleNextPoll(): void {
  pollingController.schedule();
}

export function pollActiveJobStatus(): Promise<void> {
  return pollingController.runNow();
}

export function syncActivePolling(): Promise<void> {
  return pollingController.sync();
}

export async function createAndStartAnalysis(input: {
  targetUrl: string;
  projectName?: string;
}): Promise<PanoptesCreateAnalysisResult | null> {
  const session = get(sessionUiStore);
  if (session.createFlowStatus === 'submitting') return null;

  if (!isValidHttpUrl(input.targetUrl)) {
    sessionUiStore.update((store) => ({
      ...store,
      createFlowStatus: 'failed'
    }));
    pushToast('error', 'URL は http:// または https:// から入力してください。');
    return null;
  }

  sessionUiStore.update((store) => ({
    ...store,
    createFlowStatus: 'submitting',
    globalBlockingAction: 'creating_project'
  }));

  try {
    const result = await panoptesApiClient.createAndStartAnalysis({
      targetUrl: input.targetUrl,
      projectName: input.projectName?.trim() || new URL(input.targetUrl).hostname.replace(/^www\./, ''),
      idempotencyKey: generateIdempotencyKey('create_analysis'),
      preserveCurrentSelection: true
    });

    await refreshProjectList('refreshing');
    await selectProject(result.project.projectId);
    resetRuntimeForNewJob(result.project.projectId, result.analysisJob);
    mergeProjectSummaryPatch(result.project.projectId, result.projectSummary);

    sessionUiStore.update((store) => ({
      ...store,
      createFlowOpen: false,
      createFlowStatus: 'idle',
      globalBlockingAction: null,
      mainSurfaceMode: 'analysis_flow'
    }));

    await syncActivePolling();
    return result;
  } catch (error) {
    const normalized = normalizePanoptesError(error);
    sessionUiStore.update((store) => ({
      ...store,
      createFlowStatus: 'failed',
      globalBlockingAction: null
    }));
    pushToast('error', normalized.message);
    return null;
  }
}

export async function confirmInference(): Promise<boolean> {
  const runtime = get(analysisRuntimeStore);
  if (!runtime.activeProjectId || !runtime.activeJobId || !runtime.inferenceDraft || !runtime.canConfirmInference) {
    return false;
  }

  analysisRuntimeStore.update((store) => ({
    ...store,
    confirmMutationStatus: 'submitting',
    canConfirmInference: false
  }));

  try {
    const response = await panoptesApiClient.confirmInference({
      projectId: runtime.activeProjectId,
      analysisJobId: runtime.activeJobId,
      inferredIndustry: runtime.inferenceDraft.inferredIndustry,
      inferredStructureType: runtime.inferenceDraft.inferredStructureType,
      inferredSiteScale: runtime.inferenceDraft.inferredSiteScale,
      userOverrideNote: null
    });

    analysisRuntimeStore.update((store) => ({
      ...store,
      runtimeStatus: 'running',
      visibleStep: response.uiStepPanel.visibleStep,
      visibleStepIndex: response.uiStepPanel.visibleStepIndex,
      serverConfirmedPhase: response.uiStepPanel.serverConfirmedPhase,
      serverConfirmedStepIndex: response.uiStepPanel.serverConfirmedStepIndex,
      progressPercent: response.progressState.progressPercent,
      statusMessage: response.progressState.statusMessage,
      canConfirmInference: false,
      confirmMutationStatus: 'idle',
      lastProgressEventAt: response.progressState.updatedAt
    }));

    projectDetailStore.update((store) => {
      if (!store.latestAnalysisJob || store.latestAnalysisJob.analysisJobId !== response.analysisJob.analysisJobId) {
        return store;
      }
      return {
        ...store,
        latestAnalysisJob: response.analysisJob,
        project: store.project ? { ...store.project, projectStatus: 'analyzing' } : store.project
      };
    });

    mergeProjectSummaryPatch(runtime.activeProjectId, {
      latestJobStatus: response.analysisJob.status,
      latestProgressPhase: response.analysisJob.progressPhase,
      latestProgressStepIndex: response.analysisJob.progressStepIndex,
      latestProgressPercent: response.analysisJob.progressPercent,
      latestStatusMessage: response.analysisJob.statusMessage,
      projectStatus: 'analyzing'
    });

    pushToast('success', '推定結果を確定しました。競合分析へ進みます。');
    scheduleNextPoll();
    return true;
  } catch (error) {
    const normalized = normalizePanoptesError(error);
    analysisRuntimeStore.update((store) => ({
      ...store,
      canConfirmInference: true,
      confirmMutationStatus: 'failed'
    }));
    pushToast('error', normalized.message);
    return false;
  }
}

export async function reanalyzeCurrentProject(): Promise<boolean> {
  const project = get(projectDetailStore).project;
  const runtime = get(analysisRuntimeStore);
  if (!project) return false;
  if (runtime.activeProjectId === project.projectId && runtime.runtimeStatus !== 'completed' && runtime.runtimeStatus !== 'failed' && runtime.runtimeStatus !== 'idle') {
    return false;
  }

  try {
    const response = await panoptesApiClient.reanalyzeProject(project.projectId, generateIdempotencyKey('reanalyze'));
    projectDetailStore.update((store) => {
      if (!store.project || store.project.projectId !== response.project.projectId) return store;
      return {
        ...store,
        project: response.project,
        latestAnalysisJob: response.analysisJob,
        derivedDisplayState: projectStatusToDisplayState({
          projectStatus: response.project.projectStatus,
          currentSnapshotId: response.project.currentSnapshotId,
          latestAnalysisJobId: response.project.latestAnalysisJobId
        })
      };
    });
    mergeProjectSummaryPatch(project.projectId, response.projectSummary);
    resetRuntimeForNewJob(project.projectId, response.analysisJob);
    pushToast('info', '再分析を開始しました。既存 snapshot を保持したまま進行します。');
    await syncActivePolling();
    return true;
  } catch (error) {
    const normalized = normalizePanoptesError(error);
    pushToast('error', normalized.message);
    return false;
  }
}
