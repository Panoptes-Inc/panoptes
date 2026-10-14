import { isTerminalFrontendJobStatus } from '$lib/features/analysis-job/mapping/analysis-job-status';
import type {
  PanoptesAnalysisJob,
  PanoptesAnalysisJobStatus,
  PanoptesPipelineRuntimeState,
  PanoptesProjectDisplayState,
  PanoptesProjectRecord,
  PanoptesProjectStatus,
  PanoptesRuntimeStatus,
  PanoptesStrategyPhase,
  PanoptesUiStepPanelState,
  PanoptesVisibleStep,
  PanoptesVisibleStepIndex
} from '../types';

export const PANOPTES_STEP_INDEX_BY_PHASE: Record<PanoptesVisibleStep, PanoptesVisibleStepIndex> = {
  target_scan: 1,
  inference_review: 2,
  competitor_analysis: 3,
  industry_analysis: 4,
  strategy_synthesis: 5
};

export const PANOPTES_VISIBLE_STEP_ORDER: PanoptesVisibleStep[] = [
  'target_scan',
  'inference_review',
  'competitor_analysis',
  'industry_analysis',
  'strategy_synthesis'
];

export const PANOPTES_STRATEGY_PHASE_ORDER: PanoptesStrategyPhase[] = ['day_30', 'day_60', 'day_90'];

export function phaseToStepIndex(phase: PanoptesVisibleStep): PanoptesVisibleStepIndex {
  return PANOPTES_STEP_INDEX_BY_PHASE[phase];
}

export function strategyPhaseToDayLabel(phase: PanoptesStrategyPhase): string {
  switch (phase) {
    case 'day_30':
      return '30日プラン';
    case 'day_60':
      return '60日プラン';
    case 'day_90':
      return '90日プラン';
  }
}

export function strategyPhaseToObjective(phase: PanoptesStrategyPhase): string {
  switch (phase) {
    case 'day_30':
      return '導線の土台を整える';
    case 'day_60':
      return '比較検討を前に進める';
    case 'day_90':
      return '差別化を定着させる';
  }
}

export function projectStatusToDisplayState(input: {
  projectStatus: PanoptesProjectStatus;
  currentSnapshotId: string | null;
  latestAnalysisJobId: string | null;
}): PanoptesProjectDisplayState {
  if (input.currentSnapshotId) return 'ready';
  if (input.projectStatus === 'failed') return 'failed';
  if (['queued', 'analyzing', 'awaiting_confirmation', 'completing', 'completed'].includes(input.projectStatus)) {
    return 'analyzing';
  }
  return 'empty';
}

export function canRenderCommittedSnapshot(project: Pick<PanoptesProjectRecord, 'currentSnapshotId'> | null): boolean {
  return Boolean(project?.currentSnapshotId);
}

export function isTerminalJobStatus(status: PanoptesAnalysisJobStatus | null): boolean {
  return isTerminalFrontendJobStatus(status);
}

export function isTerminalRuntimeStatus(status: PanoptesRuntimeStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'idle';
}

export function resolveRuntimeStatusFromJob(job: PanoptesAnalysisJob | null): PanoptesRuntimeStatus {
  if (!job) return 'idle';
  if (job.status === 'failed' || job.status === 'cancelled' || job.status === 'timed_out') return 'failed';
  if (job.status === 'partially_completed') return 'completed';
  if (job.status === 'completed') return 'completed';
  if (job.status === 'awaiting_confirmation') return 'waiting_for_inference_confirmation';
  if (job.status === 'completing') return 'committing_snapshot';
  return job.progressPhase === 'target_scan' ? 'bootstrapping' : 'running';
}

export function shouldIgnoreStaleUpdate(input: {
  activeProjectId: string | null;
  activeJobId: string | null;
  activeAnalysisSessionId?: string | null;
  incomingProjectId: string;
  incomingJobId: string;
  incomingAnalysisSessionId?: string | null;
}): boolean {
  if (input.activeProjectId !== input.incomingProjectId) return true;
  if (input.activeJobId !== input.incomingJobId) return true;
  if (
    input.activeAnalysisSessionId &&
    input.incomingAnalysisSessionId &&
    input.activeAnalysisSessionId !== input.incomingAnalysisSessionId
  ) {
    return true;
  }
  return false;
}

export function shouldAcceptMonotonicStep(currentStepIndex: number | null, incomingStepIndex: number | null): boolean {
  if (incomingStepIndex === null) return true;
  if (currentStepIndex === null) return true;
  return incomingStepIndex >= currentStepIndex;
}

export function clampMonotonicProgress(currentProgress: number | null, incomingProgress: number | null): number | null {
  if (incomingProgress === null) return currentProgress;
  if (currentProgress === null) return incomingProgress;
  return Math.max(currentProgress, incomingProgress);
}

export function shouldApplyRuntimeTransition(
  currentRuntimeStatus: PanoptesRuntimeStatus,
  incomingRuntimeStatus: PanoptesRuntimeStatus
): boolean {
  if (!isTerminalRuntimeStatus(currentRuntimeStatus) || currentRuntimeStatus === 'idle') {
    return true;
  }

  return currentRuntimeStatus === incomingRuntimeStatus;
}

export function shouldPreserveStableSnapshot(runtimeStatus: PanoptesRuntimeStatus): boolean {
  return runtimeStatus !== 'idle' && runtimeStatus !== 'completed' && runtimeStatus !== 'failed';
}

export function createInitialUiStepPanelState(statusMessage = '分析対象 URL を解析中です'): PanoptesUiStepPanelState {
  return {
    visibleStep: 'target_scan',
    visibleStepIndex: 1,
    serverConfirmedPhase: 'target_scan',
    serverConfirmedStepIndex: 1,
    progressPercent: 0,
    statusMessage,
    canAutoAdvance: true,
    panelTransitionLocked: false,
    preserveContainerMount: true,
    preserveMinHeight: true
  };
}

export function createRuntimeStateFromJob(projectId: string, job: PanoptesAnalysisJob | null): PanoptesPipelineRuntimeState {
  if (!job) {
    return {
      runtimeState: 'idle',
      projectId,
      analysisJobId: null,
      currentPhase: null,
      currentStepIndex: null,
      failure: null
    };
  }

  if (job.status === 'failed' || job.status === 'cancelled' || job.status === 'timed_out') {
    return {
      runtimeState: 'failed',
      projectId,
      analysisJobId: job.analysisJobId,
      currentPhase: job.progressPhase,
      currentStepIndex: job.progressStepIndex,
      failure: {
        code: job.status === 'timed_out' ? 'job_timed_out' : (job.errorCode ?? 'unknown_error'),
        message: job.errorMessage ?? job.statusMessage,
        recoverable: true
      }
    };
  }

  if (job.status === 'completed') {
    return {
      runtimeState: 'completed',
      projectId,
      analysisJobId: job.analysisJobId,
      currentPhase: 'strategy_synthesis',
      currentStepIndex: 5,
      failure: null
    };
  }

  if (job.status === 'awaiting_confirmation') {
    return {
      runtimeState: 'awaiting_confirmation',
      projectId,
      analysisJobId: job.analysisJobId,
      currentPhase: 'inference_review',
      currentStepIndex: 2,
      failure: null
    };
  }

  return {
    runtimeState: 'running',
    projectId,
    analysisJobId: job.analysisJobId,
    currentPhase: job.progressPhase,
    currentStepIndex: job.progressStepIndex,
    failure: null
  };
}
