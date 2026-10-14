import { isTerminalFrontendJobStatus } from '$lib/features/analysis-job/mapping/analysis-job-status';
import type {
  PanoptesAnalysisJob,
  PanoptesAnalysisRuntimeStore,
  PanoptesProjectCollectionStore,
  PanoptesProjectDetailStore,
  PanoptesProjectDetailView,
  PanoptesProjectSummary,
  Uuid
} from '../types';
import { projectStatusToDisplayState, resolveRuntimeStatusFromJob } from '../utils/guards';

function resolveTerminalReasonFromJob(job: PanoptesAnalysisJob | null) {
  if (!job) return null;
  if (job.status === 'completed') return 'completed' as const;
  if (job.status === 'partially_completed') return 'partially_completed' as const;
  if (job.status === 'cancelled') return 'cancelled' as const;
  if (job.status === 'timed_out') return 'timed_out' as const;
  if (job.status === 'failed' && job.errorCode === 'snapshot_commit_failed') return 'commit_failed' as const;
  if (job.status === 'failed') return 'analysis_failed' as const;
  return null;
}

function resolvePollingStatusFromJob(job: PanoptesAnalysisJob): 'stopped' | 'polling' {
  return isTerminalFrontendJobStatus(job.status) ? 'stopped' : 'polling';
}

export function buildProjectCollectionWithUpsert(
  currentCollection: PanoptesProjectCollectionStore,
  summary: PanoptesProjectSummary
): PanoptesProjectCollectionStore {
  const index = currentCollection.items.findIndex((item) => item.projectId === summary.projectId);
  if (index === -1) {
    return {
      ...currentCollection,
      items: [summary, ...currentCollection.items]
    };
  }

  const items = [...currentCollection.items];
  items[index] = summary;
  return {
    ...currentCollection,
    items
  };
}

export function buildProjectCollectionWithPatch(
  currentCollection: PanoptesProjectCollectionStore,
  projectId: Uuid,
  patch: Partial<PanoptesProjectSummary>
): PanoptesProjectCollectionStore {
  return {
    ...currentCollection,
    items: currentCollection.items.map((item) => (item.projectId === projectId ? { ...item, ...patch } : item))
  };
}

export function buildProjectDetailStoreFromResponse(
  currentDetail: PanoptesProjectDetailStore,
  detail: PanoptesProjectDetailView
): PanoptesProjectDetailStore {
  return {
    projectId: detail.project.projectId,
    hydrationStatus: 'ready',
    project: detail.project,
    currentSnapshot: detail.currentSnapshot,
    lastStableSnapshot: detail.currentSnapshot ?? currentDetail.lastStableSnapshot,
    latestAnalysisJob: detail.latestJob,
    derivedDisplayState: projectStatusToDisplayState({
      projectStatus: detail.project.projectStatus,
      currentSnapshotId: detail.project.currentSnapshotId,
      latestAnalysisJobId: detail.project.latestAnalysisJobId
    }),
    error: null
  };
}

export function buildRuntimeStoreFromProjectDetail(
  currentRuntime: PanoptesAnalysisRuntimeStore,
  detail: PanoptesProjectDetailView,
  initialRuntimeState: PanoptesAnalysisRuntimeStore
): PanoptesAnalysisRuntimeStore {
  if (!detail.latestJob) {
    return {
      ...initialRuntimeState,
      activeProjectId: detail.project.projectId
    };
  }

  return {
    ...currentRuntime,
    activeProjectId: detail.project.projectId,
    activeJobId: detail.latestJob.analysisJobId,
    activeAnalysisSessionId: detail.latestJob.analysisSessionId,
    runtimeStatus: resolveRuntimeStatusFromJob(detail.latestJob),
    visibleStep: detail.latestJob.progressPhase,
    visibleStepIndex: detail.latestJob.progressStepIndex,
    serverConfirmedPhase: detail.latestJob.progressPhase,
    serverConfirmedStepIndex: detail.latestJob.progressStepIndex,
    progressPercent: detail.latestJob.progressPercent,
    statusMessage: detail.latestJob.statusMessage,
    canConfirmInference: detail.latestJob.status === 'awaiting_confirmation',
    confirmMutationStatus: 'idle',
    pollingStatus: resolvePollingStatusFromJob(detail.latestJob),
    pollingIntervalMs: detail.latestJob.status === 'awaiting_confirmation' ? 6000 : 2500,
    lastProgressEventAt: detail.latestJob.updatedAt,
    terminalReason: resolveTerminalReasonFromJob(detail.latestJob),
    inferenceDraft:
      currentRuntime.activeJobId === detail.latestJob.analysisJobId ? currentRuntime.inferenceDraft : null
  };
}

export function buildRuntimeStoreForNewJob(
  projectId: Uuid,
  job: PanoptesAnalysisJob,
  initialRuntimeState: PanoptesAnalysisRuntimeStore
): PanoptesAnalysisRuntimeStore {
  return {
    ...initialRuntimeState,
    activeProjectId: projectId,
    activeJobId: job.analysisJobId,
    activeAnalysisSessionId: job.analysisSessionId,
    runtimeStatus: resolveRuntimeStatusFromJob(job),
    visibleStep: job.progressPhase,
    visibleStepIndex: job.progressStepIndex,
    serverConfirmedPhase: job.progressPhase,
    serverConfirmedStepIndex: job.progressStepIndex,
    progressPercent: job.progressPercent,
    statusMessage: job.statusMessage,
    canConfirmInference: job.status === 'awaiting_confirmation',
    pollingStatus: resolvePollingStatusFromJob(job),
    pollingIntervalMs: job.status === 'awaiting_confirmation' ? 6000 : 2500,
    lastProgressEventAt: job.updatedAt
  };
}
