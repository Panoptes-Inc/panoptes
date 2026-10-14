import type {
  IsoDateString,
  PanoptesAnalysisJob,
  PanoptesAnalysisSnapshotPayload,
  PanoptesInferenceDraft,
  PanoptesProjectRecord,
  PanoptesTaskTransition,
  PanoptesUsageState,
  Uuid
} from '../../types';

export type MockFailureMode = 'none' | 'url_unreachable' | 'industry_analysis_failed' | 'snapshot_commit_failed';
export type MockAnalysisJobStatus = PanoptesAnalysisJob['status'] | 'commit_failed';

export type StoredJob = Omit<PanoptesAnalysisJob, 'status'> & {
  status: MockAnalysisJobStatus;
  phaseStartedAt: IsoDateString;
  failureMode: MockFailureMode;
  inferenceDraft: PanoptesInferenceDraft | null;
};

export type IdempotencyEntry = {
  key: string;
  endpoint: 'create' | 'reanalyze';
  payloadSignature: string;
  projectId: Uuid;
  analysisJobId: Uuid;
};

export type MockState = {
  projects: PanoptesProjectRecord[];
  jobs: StoredJob[];
  snapshots: PanoptesAnalysisSnapshotPayload[];
  taskTransitions: PanoptesTaskTransition[];
  idempotencyEntries: IdempotencyEntry[];
  usage: PanoptesUsageState;
};
