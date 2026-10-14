import type { PanoptesAnalysisJobStatus } from '$lib/panoptes/types';
import {
  CANONICAL_ANALYSIS_JOB_STATES,
  type AnalysisJobRuntimeStatus,
  type CanonicalAnalysisJobState
} from '../types';

const CANONICAL_STATE_SET = new Set<string>(CANONICAL_ANALYSIS_JOB_STATES);

const CANONICAL_TERMINAL_STATE_SET = new Set<CanonicalAnalysisJobState>([
  'completed',
  'failed',
  'cancelled',
  'timed_out',
  'partially_completed'
]);

const FRONTEND_TERMINAL_STATUS_SET = new Set<PanoptesAnalysisJobStatus>([
  'completed',
  'failed',
  'cancelled',
  'timed_out',
  'partially_completed'
]);

export function isCanonicalAnalysisJobState(value: unknown): value is CanonicalAnalysisJobState {
  return typeof value === 'string' && CANONICAL_STATE_SET.has(value);
}

export function mapCanonicalStateToRuntimeStatus(state: CanonicalAnalysisJobState): AnalysisJobRuntimeStatus {
  if (state === 'awaiting_confirmation') return 'awaiting_confirmation';
  if (state === 'completed') return 'completed';
  if (state === 'partially_completed') return 'partially_completed';
  if (state === 'failed') return 'failed';
  if (state === 'cancelled') return 'cancelled';
  if (state === 'timed_out') return 'timed_out';
  return 'running';
}

export function isTerminalCanonicalAnalysisJobState(state: CanonicalAnalysisJobState): boolean {
  return CANONICAL_TERMINAL_STATE_SET.has(state);
}

export function isTerminalAnalysisRuntimeStatus(status: AnalysisJobRuntimeStatus): boolean {
  return status !== 'running' && status !== 'awaiting_confirmation';
}

export function isTerminalFrontendJobStatus(status: PanoptesAnalysisJobStatus | null): boolean {
  return status !== null && FRONTEND_TERMINAL_STATUS_SET.has(status);
}

export function isTerminalMockJobStatus(status: string): boolean {
  return isTerminalFrontendJobStatus(status as PanoptesAnalysisJobStatus) || status === 'commit_failed';
}
