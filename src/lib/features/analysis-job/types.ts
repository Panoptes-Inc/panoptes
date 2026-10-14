export const CANONICAL_ANALYSIS_JOB_STATES = [
  'queued',
  'preparing',
  'crawling',
  'capturing',
  'internal_analysis',
  'awaiting_confirmation',
  'visual_analysis',
  'llm_analysis',
  'finalizing',
  'completed',
  'failed',
  'cancelled',
  'timed_out',
  'partially_completed'
] as const;

export type CanonicalAnalysisJobState = (typeof CANONICAL_ANALYSIS_JOB_STATES)[number];

export type AnalysisJobRuntimeStatus =
  | 'running'
  | 'awaiting_confirmation'
  | 'completed'
  | 'partially_completed'
  | 'failed'
  | 'cancelled'
  | 'timed_out';

export type AnalysisJobFailureCategory =
  | 'server_failure'
  | 'cancelled'
  | 'timeout'
  | 'partial_result'
  | 'contract_error';

export type AnalysisJobAdapterDiagnostic =
  | 'missing_status'
  | 'unknown_status'
  | 'malformed_response';

export type AnalysisJobRuntimeModel = {
  id: string | null;
  organizationId: string | null;
  projectId: string | null;
  status: AnalysisJobRuntimeStatus;
  phase: CanonicalAnalysisJobState | null;
  progressPercent: number | null;
  updatedAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  retryable: boolean;
  terminal: boolean;
  confirmationRequired: boolean;
  partial: boolean;
  committedSnapshotId: string | null;
  failure: null | {
    category: AnalysisJobFailureCategory;
    code: string | null;
    message: string;
  };
  diagnostic: AnalysisJobAdapterDiagnostic | null;
};

export type AnalysisJobAdapterOptions = {
  onDiagnostic?: (diagnostic: AnalysisJobAdapterDiagnostic) => void;
};
