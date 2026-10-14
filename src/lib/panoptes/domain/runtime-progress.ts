import { isTerminalFrontendJobStatus } from '$lib/features/analysis-job/mapping/analysis-job-status';
import type {
  PanoptesAnalysisJob,
  PanoptesAnalysisJobStatus,
  PanoptesAnalysisRuntimeStore,
  PanoptesPollProgressResult,
  PanoptesProjectDetailStore,
  PanoptesRuntimeStatus,
  PanoptesTerminalReason
} from '../types';
import {
  clampMonotonicProgress,
  projectStatusToDisplayState,
  shouldAcceptMonotonicStep,
  shouldApplyRuntimeTransition,
  shouldIgnoreStaleUpdate
} from '../utils/guards';

export function resolveRuntimeStatusFromProgress(payload: PanoptesPollProgressResult): PanoptesRuntimeStatus {
  if (payload.runtimeState.runtimeState === 'awaiting_confirmation') {
    return 'waiting_for_inference_confirmation';
  }

  if (payload.runtimeState.runtimeState === 'running' && payload.progressState.status === 'completing') {
    return 'committing_snapshot';
  }

  if (payload.runtimeState.runtimeState === 'running' && payload.progressState.progressPhase === 'target_scan') {
    return 'bootstrapping';
  }

  if (payload.runtimeState.runtimeState === 'running') {
    return 'running';
  }

  if (payload.runtimeState.runtimeState === 'completed') {
    return 'completed';
  }

  if (payload.runtimeState.runtimeState === 'failed') {
    return 'failed';
  }

  return 'idle';
}

export function isTerminalProgressStatus(status: PanoptesAnalysisJobStatus): boolean {
  return isTerminalFrontendJobStatus(status);
}

export function shouldApplyProgressPayload(
  currentRuntime: PanoptesAnalysisRuntimeStore,
  payload: PanoptesPollProgressResult
): boolean {
  if (
    shouldIgnoreStaleUpdate({
      activeProjectId: currentRuntime.activeProjectId,
      activeJobId: currentRuntime.activeJobId,
      activeAnalysisSessionId: currentRuntime.activeAnalysisSessionId,
      incomingProjectId: payload.progressState.projectId,
      incomingJobId: payload.progressState.analysisJobId,
      incomingAnalysisSessionId: payload.progressState.analysisSessionId
    })
  ) {
    return false;
  }

  if (!shouldAcceptMonotonicStep(currentRuntime.serverConfirmedStepIndex, payload.progressState.progressStepIndex)) {
    return false;
  }

  return shouldApplyRuntimeTransition(currentRuntime.runtimeStatus, resolveRuntimeStatusFromProgress(payload));
}

export function resolveTerminalReasonFromProgressStatus(
  status: PanoptesAnalysisJobStatus,
  currentReason: PanoptesTerminalReason | null,
  errorCode: PanoptesPollProgressResult['progressState']['errorCode'] = null
): PanoptesTerminalReason | null {
  if (status === 'completed') return 'completed';
  if (status === 'partially_completed') return 'partially_completed';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'timed_out') return 'timed_out';
  if (status === 'failed' && errorCode === 'snapshot_commit_failed') return 'commit_failed';
  if (status === 'failed') return 'analysis_failed';
  return currentReason;
}

export function buildRuntimeProgressState(
  currentRuntime: PanoptesAnalysisRuntimeStore,
  payload: PanoptesPollProgressResult
): PanoptesAnalysisRuntimeStore {
  const progressStatus = payload.progressState.status;

  return {
    ...currentRuntime,
    activeAnalysisSessionId: payload.progressState.analysisSessionId,
    runtimeStatus: resolveRuntimeStatusFromProgress(payload),
    visibleStep: payload.uiStepPanel.visibleStep,
    visibleStepIndex: payload.uiStepPanel.visibleStepIndex,
    serverConfirmedPhase: payload.uiStepPanel.serverConfirmedPhase,
    serverConfirmedStepIndex: payload.uiStepPanel.serverConfirmedStepIndex,
    progressPercent: clampMonotonicProgress(currentRuntime.progressPercent, payload.progressState.progressPercent),
    statusMessage: payload.progressState.statusMessage,
    inferenceDraft: payload.inferenceDraft ?? currentRuntime.inferenceDraft,
    canConfirmInference: progressStatus === 'awaiting_confirmation',
    confirmMutationStatus: progressStatus === 'awaiting_confirmation' ? 'idle' : currentRuntime.confirmMutationStatus,
    pollingStatus: isTerminalProgressStatus(progressStatus) ? 'stopped' : currentRuntime.pollingStatus,
    pollingIntervalMs: progressStatus === 'awaiting_confirmation' ? 6000 : 2500,
    lastProgressEventAt: payload.progressState.updatedAt,
    terminalReason: resolveTerminalReasonFromProgressStatus(
      progressStatus,
      currentRuntime.terminalReason,
      payload.progressState.errorCode
    )
  };
}

export function buildLatestAnalysisJobProgressState(
  currentJob: PanoptesAnalysisJob | null,
  payload: PanoptesPollProgressResult
): PanoptesAnalysisJob | null {
  if (!currentJob) return currentJob;

  return {
    ...currentJob,
    status: payload.progressState.status,
    progressPhase: payload.progressState.progressPhase,
    progressStepIndex: payload.progressState.progressStepIndex,
    progressPercent: clampMonotonicProgress(currentJob.progressPercent, payload.progressState.progressPercent) ?? 0,
    statusMessage: payload.progressState.statusMessage,
    errorCode: payload.progressState.errorCode,
    errorMessage: payload.progressState.errorMessage,
    inferenceLocked: payload.progressState.inferenceLocked,
    inferenceConfirmedAt: payload.progressState.inferenceConfirmedAt,
    finishedAt: payload.progressState.finishedAt,
    updatedAt: payload.progressState.updatedAt
  };
}

export function buildProjectDetailProgressState(
  currentDetail: PanoptesProjectDetailStore,
  payload: PanoptesPollProgressResult
): PanoptesProjectDetailStore {
  if (!currentDetail.project || currentDetail.project.projectId !== payload.projectSummary.projectId) {
    return currentDetail;
  }

  const project = {
    ...currentDetail.project,
    projectStatus: payload.projectSummary.projectStatus,
    currentSnapshotId: payload.projectSummary.currentSnapshotId,
    latestAnalysisJobId: payload.projectSummary.latestAnalysisJobId,
    latestAnalysisSessionId: payload.projectSummary.latestAnalysisSessionId,
    currentStrategyPlanId: payload.projectSummary.currentStrategyPlanId,
    selectedStrategyKey: payload.projectSummary.selectedStrategyKey,
    strategyStatusLabel: payload.projectSummary.strategyStatusLabel,
    updatedAt: payload.projectSummary.updatedAt
  };

  return {
    ...currentDetail,
    project,
    latestAnalysisJob: buildLatestAnalysisJobProgressState(currentDetail.latestAnalysisJob, payload),
    derivedDisplayState: projectStatusToDisplayState({
      projectStatus: project.projectStatus,
      currentSnapshotId: project.currentSnapshotId,
      latestAnalysisJobId: project.latestAnalysisJobId
    })
  };
}
