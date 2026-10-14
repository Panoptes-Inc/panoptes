import type {
  PanoptesAnalysisJob,
  PanoptesAnalysisJobStatus,
  PanoptesFailureCode,
  PanoptesPollProgressResult
} from '$lib/panoptes/types';
import {
  isCanonicalAnalysisJobState,
  isTerminalFrontendJobStatus,
  isTerminalAnalysisRuntimeStatus,
  mapCanonicalStateToRuntimeStatus
} from '../mapping/analysis-job-status';
import type {
  AnalysisJobAdapterDiagnostic,
  AnalysisJobAdapterOptions,
  AnalysisJobFailureCategory,
  AnalysisJobRuntimeModel,
  AnalysisJobRuntimeStatus,
  CanonicalAnalysisJobState
} from '../types';

const FRONTEND_JOB_STATUSES = new Set<PanoptesAnalysisJobStatus>([
  'queued',
  'running',
  'awaiting_confirmation',
  'completing',
  'completed',
  'failed',
  'cancelled',
  'timed_out',
  'partially_completed'
]);

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function boundedPercent(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function reportDiagnostic(diagnostic: AnalysisJobAdapterDiagnostic, options: AnalysisJobAdapterOptions): void {
  options.onDiagnostic?.(diagnostic);
}

function safeFailure(
  diagnostic: AnalysisJobAdapterDiagnostic,
  options: AnalysisJobAdapterOptions
): AnalysisJobRuntimeModel {
  reportDiagnostic(diagnostic, options);
  return {
    id: null,
    organizationId: null,
    projectId: null,
    status: 'failed',
    phase: null,
    progressPercent: null,
    updatedAt: null,
    startedAt: null,
    finishedAt: null,
    retryable: false,
    terminal: true,
    confirmationRequired: false,
    partial: false,
    committedSnapshotId: null,
    failure: {
      category: 'contract_error',
      code: null,
      message: '分析状態を確認できませんでした。'
    },
    diagnostic
  };
}

function resolveFailureCategory(status: AnalysisJobRuntimeStatus): AnalysisJobFailureCategory | null {
  if (status === 'failed') return 'server_failure';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'timed_out') return 'timeout';
  if (status === 'partially_completed') return 'partial_result';
  return null;
}

function resolveSafeMessage(status: AnalysisJobRuntimeStatus): string | null {
  if (status === 'failed') return '分析を完了できませんでした。';
  if (status === 'cancelled') return '分析はキャンセルされました。';
  if (status === 'timed_out') return '分析がタイムアウトしました。';
  if (status === 'partially_completed') return '一部の分析結果のみ利用できます。';
  return null;
}

export function adaptCanonicalAnalysisJob(
  input: unknown,
  options: AnalysisJobAdapterOptions = {}
): AnalysisJobRuntimeModel {
  if (!isRecord(input)) return safeFailure('malformed_response', options);
  if (!('status' in input)) return safeFailure('missing_status', options);
  if (!isCanonicalAnalysisJobState(input.status)) return safeFailure('unknown_status', options);

  const id = optionalString(input.id);
  const organizationId = optionalString(input.organization_id);
  const projectId = optionalString(input.project_id);
  const updatedAt = optionalString(input.updated_at);
  if (!id || !organizationId || !projectId || !updatedAt) {
    return safeFailure('malformed_response', options);
  }

  const canonicalState = input.status;
  const status = mapCanonicalStateToRuntimeStatus(canonicalState);
  const category = resolveFailureCategory(status);
  const error = isRecord(input.error) ? input.error : null;
  const phase = isCanonicalAnalysisJobState(input.phase) ? input.phase : canonicalState;

  return {
    id,
    organizationId,
    projectId,
    status,
    phase,
    progressPercent: boundedPercent(input.progress_percent),
    updatedAt,
    startedAt: optionalString(input.started_at),
    finishedAt: optionalString(input.finished_at),
    retryable: input.retryable === true,
    terminal: isTerminalAnalysisRuntimeStatus(status),
    confirmationRequired: canonicalState === 'awaiting_confirmation',
    partial: canonicalState === 'partially_completed',
    committedSnapshotId: optionalString(input.committed_snapshot_id),
    failure:
      category === null
        ? null
        : {
            category,
            code: optionalString(error?.code),
            message: resolveSafeMessage(status)!
          },
    diagnostic: null
  };
}

function normalizeFrontendStatus(value: unknown): {
  status: PanoptesAnalysisJobStatus;
  errorCode?: PanoptesFailureCode;
  errorMessage?: string;
} {
  if (value === 'timed_out') {
    return {
      status: 'timed_out',
      errorCode: 'job_timed_out',
      errorMessage: '分析がタイムアウトしました。'
    };
  }
  if (FRONTEND_JOB_STATUSES.has(value as PanoptesAnalysisJobStatus)) {
    return { status: value as PanoptesAnalysisJobStatus };
  }
  if (value === 'commit_failed') {
    return {
      status: 'failed',
      errorCode: 'snapshot_commit_failed',
      errorMessage: '分析結果の保存中に問題が発生しました。'
    };
  }
  return {
    status: 'failed',
    errorCode: 'unknown_error',
    errorMessage: '分析状態を確認できませんでした。'
  };
}

export function adaptMockAnalysisJob(
  job: Omit<PanoptesAnalysisJob, 'status'> & { status: string }
): PanoptesAnalysisJob {
  const normalized = normalizeFrontendStatus(job.status);
  return {
    ...job,
    status: normalized.status,
    errorCode: normalized.errorCode ?? job.errorCode,
    errorMessage: normalized.errorMessage ?? job.errorMessage
  };
}

export function adaptFrontendPollProgress(payload: PanoptesPollProgressResult): PanoptesPollProgressResult {
  const normalized = normalizeFrontendStatus(payload.progressState.status);
  const status = normalized.status;
  const failed = status === 'failed' || status === 'cancelled' || status === 'timed_out';
  const completed = status === 'completed' || status === 'partially_completed';
  const awaitingConfirmation = status === 'awaiting_confirmation';

  return {
    ...payload,
    progressState: {
      ...payload.progressState,
      status,
      errorCode: normalized.errorCode ?? payload.progressState.errorCode,
      errorMessage: normalized.errorMessage ?? payload.progressState.errorMessage
    },
    runtimeState: {
      ...payload.runtimeState,
      runtimeState: failed
        ? 'failed'
        : completed
          ? 'completed'
          : awaitingConfirmation
            ? 'awaiting_confirmation'
            : payload.runtimeState.runtimeState,
      failure: failed
        ? {
            code: normalized.errorCode ?? payload.progressState.errorCode ?? 'unknown_error',
            message: normalized.errorMessage ?? payload.progressState.errorMessage ?? '分析を完了できませんでした。',
            recoverable: true
          }
        : payload.runtimeState.failure
    },
    projectSummary: {
      ...payload.projectSummary,
      latestJobStatus: status,
      latestErrorCode: normalized.errorCode ?? payload.projectSummary.latestErrorCode
    }
  };
}

export function mapCanonicalStateToFrontendStatus(state: CanonicalAnalysisJobState): PanoptesAnalysisJobStatus {
  if (state === 'queued') return 'queued';
  if (state === 'awaiting_confirmation') return 'awaiting_confirmation';
  if (state === 'finalizing') return 'completing';
  if (
    state === 'completed' ||
    state === 'failed' ||
    state === 'cancelled' ||
    state === 'timed_out' ||
    state === 'partially_completed'
  ) {
    return state;
  }
  return 'running';
}

export function resolveAnalysisPollingDecision(
  status: PanoptesAnalysisJobStatus,
  currentSnapshotReady: boolean
): 'continue' | 'stop' {
  return currentSnapshotReady || isTerminalFrontendJobStatus(status) ? 'stop' : 'continue';
}
