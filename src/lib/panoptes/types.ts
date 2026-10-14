export type Uuid = string;
export type IsoDateString = string;

export type PanoptesProjectStatus =
  | 'ready'
  | 'creating'
  | 'queued'
  | 'analyzing'
  | 'awaiting_confirmation'
  | 'completing'
  | 'completed'
  | 'failed'
  | 'empty';

export type PanoptesAnalysisJobStatus =
  | 'queued'
  | 'running'
  | 'awaiting_confirmation'
  | 'completing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timed_out'
  | 'partially_completed';

export type PanoptesProjectDisplayState = 'empty' | 'analyzing' | 'failed' | 'ready';

export type PanoptesVisibleStep =
  | 'target_scan'
  | 'inference_review'
  | 'competitor_analysis'
  | 'industry_analysis'
  | 'strategy_synthesis';

export type PanoptesVisibleStepIndex = 1 | 2 | 3 | 4 | 5;

export type PanoptesRuntimeStatus =
  | 'idle'
  | 'bootstrapping'
  | 'waiting_for_inference_confirmation'
  | 'running'
  | 'committing_snapshot'
  | 'completed'
  | 'failed';

export type PanoptesTerminalReason =
  | 'analysis_failed'
  | 'commit_failed'
  | 'cancelled'
  | 'timed_out'
  | 'partially_completed'
  | 'completed';

export type PanoptesMainSurfaceRenderMode =
  | 'empty_state'
  | 'analysis_flow'
  | 'failed_state'
  | 'snapshot_dashboard';

export type PanoptesToastLevel = 'info' | 'success' | 'warning' | 'error';
export type PanoptesReachability = 'unknown' | 'reachable' | 'degraded' | 'unreachable';
export type PanoptesConfidenceLabel = 'high' | 'medium' | 'low';
export type PanoptesStrategyPhase = 'day_30' | 'day_60' | 'day_90';
export type PanoptesStrategyStatusLabel = 'not_started' | 'improving' | 'stable' | 'rework_required';
export type PanoptesPhaseTaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done' | 'cancelled';

export type PanoptesFailureCode =
  | 'url_unreachable'
  | 'crawl_failed'
  | 'inference_failed'
  | 'inference_confirmation_expired'
  | 'competitor_discovery_failed'
  | 'competitor_insufficient'
  | 'competitor_analysis_partial_failure'
  | 'industry_analysis_failed'
  | 'strategy_generation_failed'
  | 'snapshot_commit_failed'
  | 'job_timed_out'
  | 'job_cancelled'
  | 'stale_job_ignored'
  | 'unknown_error';

export type PanoptesInferenceDraft = {
  inferredIndustry: string;
  inferredStructureType: string;
  inferredSiteScale: string;
  industryConfidence: PanoptesConfidenceLabel;
  structureConfidence: PanoptesConfidenceLabel;
  scaleConfidence: PanoptesConfidenceLabel;
  notes: string[];
  canEdit: boolean;
  lockedAfterConfirm: boolean;
};

export type PanoptesProjectRecord = {
  projectId: Uuid;
  orgId: Uuid;
  projectName: string;
  targetUrl: string;
  normalizedTargetUrl: string;
  projectStatus: PanoptesProjectStatus;
  currentSnapshotId: Uuid | null;
  latestAnalysisJobId: Uuid | null;
  latestAnalysisSessionId: Uuid | null;
  currentStrategyPlanId: Uuid | null;
  selectedStrategyKey: string | null;
  strategyStatusLabel: PanoptesStrategyStatusLabel | null;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type PanoptesAnalysisJob = {
  analysisJobId: Uuid;
  projectId: Uuid;
  orgId: Uuid;
  analysisSessionId: Uuid;
  idempotencyKey: string;
  status: PanoptesAnalysisJobStatus;
  progressPhase: PanoptesVisibleStep;
  progressStepIndex: PanoptesVisibleStepIndex;
  progressPercent: number;
  statusMessage: string;
  errorCode: PanoptesFailureCode | null;
  errorMessage: string | null;
  inferenceLocked: boolean;
  inferenceConfirmedAt: IsoDateString | null;
  startedAt: IsoDateString | null;
  finishedAt: IsoDateString | null;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type PanoptesProjectSummary = {
  projectId: Uuid;
  orgId: Uuid;
  projectName: string;
  targetUrl: string;
  normalizedTargetUrl: string;
  projectStatus: PanoptesProjectStatus;
  displayState: PanoptesProjectDisplayState;
  currentSnapshotId: Uuid | null;
  latestAnalysisJobId: Uuid | null;
  latestAnalysisSessionId: Uuid | null;
  currentStrategyPlanId: Uuid | null;
  selectedStrategyKey: string | null;
  strategyStatusLabel: PanoptesStrategyStatusLabel | null;
  latestJobStatus: PanoptesAnalysisJobStatus | null;
  latestProgressPhase: PanoptesVisibleStep | null;
  latestProgressStepIndex: PanoptesVisibleStepIndex | null;
  latestProgressPercent: number | null;
  latestStatusMessage: string | null;
  latestErrorCode: PanoptesFailureCode | null;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type PanoptesUiStepPanelState = {
  visibleStep: PanoptesVisibleStep;
  visibleStepIndex: PanoptesVisibleStepIndex;
  serverConfirmedPhase: PanoptesVisibleStep;
  serverConfirmedStepIndex: PanoptesVisibleStepIndex;
  progressPercent: number;
  statusMessage: string;
  canAutoAdvance: boolean;
  panelTransitionLocked: boolean;
  preserveContainerMount: true;
  preserveMinHeight: true;
};

export type PanoptesPipelineRuntimeState = {
  runtimeState: 'idle' | 'running' | 'awaiting_confirmation' | 'failed' | 'completed';
  projectId: Uuid;
  analysisJobId: Uuid | null;
  currentPhase: PanoptesVisibleStep | null;
  currentStepIndex: PanoptesVisibleStepIndex | null;
  failure:
    | null
    | {
        code: PanoptesFailureCode;
        message: string;
        recoverable: boolean;
      };
};

export type PanoptesCompetitorCard = {
  competitorId: Uuid;
  companyName: string;
  serviceName: string;
  url: string;
  marketTypeLabel: string;
  internalStructureScore: number;
  visualScore: number;
  overallScore: number;
  fitReason: string;
  tags: string[];
  insightLines: string[];
  actionBullets: string[];
  detailSummary: string;
};

export type PanoptesIndustryInsight = {
  label: string;
  paragraphs: string[];
};

export type PanoptesIndustryData = {
  analyzedAt: string;
  signals: string[];
  marketType: {
    typeLabel: string;
    confidence: number;
    description: string;
    detail: string;
  };
  rating: {
    metrics: Array<{ label: string; value: number; tone: 'orange' | 'violet' | 'orange-soft' | 'violet-soft' }>;
    highlights: Array<{ title: string; accent: string; body: string }>;
    insight: PanoptesIndustryInsight;
  };
  position: {
    pressureLabel: string;
    cards: Array<{ title: string; lines: string[] }>;
    matrix: {
      pointLabel: string;
      pointX: number;
      pointY: number;
      xAxisLabels: [string, string];
      yAxisLabels: [string, string];
    };
    insight: PanoptesIndustryInsight;
  };
  distribution: {
    primary: {
      title: string;
      subLabel: string;
      value: number;
      descriptor: string;
      descriptorText: string;
      color: string;
    };
    secondary: Array<{ title: string; value: number; color: string }>;
    stats: Array<{ label: string; value: string }>;
    leaders: string[];
    insight: PanoptesIndustryInsight;
  };
  opportunity: {
    lanes: Array<{
      title: string;
      reason: string;
      gaps: string[];
      actions: string[];
    }>;
    summary: {
      battlefields: string[];
      priorities: string[];
    };
    insight: PanoptesIndustryInsight;
  };
};

export type PanoptesSelfData = {
  overallScore: number;
  typeLabel: string;
  structureScore: number;
  visualScore: number;
  gapBadges: string[];
  radar: Array<{ label: string; self: number; industry: number }>;
  strengths: string[];
  issues: string[];
  breakdown: Array<{ label: string; score: number; finding: string }>;
  aiSummary: string[];
  actionCards: Array<{
    title: string;
    rationale: string;
    impact: string;
    bullets: string[];
  }>;
};

export type PanoptesStrategyPlan = {
  strategyPlanId: Uuid;
  analysisSnapshotId: Uuid;
  strategyKey: string;
  title: string;
  summary: string;
  fitScore: number | null;
  priorityRank: number | null;
  isSelected: boolean;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type PanoptesPhaseTask = {
  phaseTaskId: Uuid;
  strategyPlanId: Uuid;
  phaseCode: PanoptesStrategyPhase;
  title: string;
  description: string | null;
  sortOrder: number;
  taskStatus: PanoptesPhaseTaskStatus;
  ownerLabel: string | null;
  dueHint: string | null;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
};

export type PanoptesTaskTransition = {
  phaseTaskId: Uuid;
  fromStatus: PanoptesPhaseTaskStatus | null;
  toStatus: PanoptesPhaseTaskStatus;
  reason: string | null;
  createdAt: IsoDateString;
};

export type PanoptesStrategyData = {
  fitIndex: number;
  currentTheme: string;
  structureRiskLabel: string;
  marketPressureLabel: string;
  industryGapDelta: number;
  aiSummary: string[];
  improvements: Array<{
    title: string;
    rankLabel: string;
    overview: string;
    rationale: string[];
    actions: string[];
    impact: string[];
  }>;
  planPhases: Array<{
    phase: PanoptesStrategyPhase;
    title: string;
    objective: string;
    progressLabel: string;
    progressCountLabel: string;
    nextAction: string;
    tasks: Array<{
      phaseTaskId: Uuid;
      status: PanoptesPhaseTaskStatus;
      title: string;
    }>;
  }>;
};

export type PanoptesPanoaiData = {
  summary: string;
  prompts: string[];
  contextNotes: string[];
};

export type PanoptesAnalysisSnapshotPayload = {
  analysisSnapshotId: Uuid;
  projectId: Uuid;
  versionLabel: string;
  analyzedAt: IsoDateString;
  siteName: string;
  meta: {
    tokenUsageRate: number;
    memoryLabel: string;
    projectDayCount: number;
    analyzedDateLabel: string;
  };
  competitors: {
    summaryTitle: string;
    summaryText: string;
    cards: PanoptesCompetitorCard[];
  };
  industry: PanoptesIndustryData;
  self: PanoptesSelfData;
  strategy: PanoptesStrategyData;
  panoai: PanoptesPanoaiData;
  strategyPlans: PanoptesStrategyPlan[];
  phaseTasks: PanoptesPhaseTask[];
};

export type PanoptesProjectDetailView = {
  project: PanoptesProjectRecord;
  projectSummary: PanoptesProjectSummary;
  latestJob: PanoptesAnalysisJob | null;
  currentSnapshot: PanoptesAnalysisSnapshotPayload | null;
  runtimeState: PanoptesPipelineRuntimeState;
  uiStepPanel: PanoptesUiStepPanelState | null;
};

export type PanoptesUsageState = {
  tokenUsageRate: number;
  memoryLabel: string;
  projectDayCount: number;
  projectDayMax: number;
  aiModeLabel: string;
  tokenModeLabel: string;
  projectStatusLabel: string;
};

export type PanoptesCreateAnalysisInput = {
  targetUrl: string;
  projectName: string;
  idempotencyKey: string;
  preserveCurrentSelection: boolean;
};

export type PanoptesCreateAnalysisResult = {
  project: PanoptesProjectRecord;
  projectSummary: PanoptesProjectSummary;
  analysisJob: PanoptesAnalysisJob;
  runtimeState: PanoptesPipelineRuntimeState;
};

export type PanoptesPollProgressInput = {
  projectId: Uuid;
  analysisJobId: Uuid;
  knownProgressPercent?: number | null;
  knownStepIndex?: PanoptesVisibleStepIndex | null;
};

export type PanoptesProgressState = {
  projectId: Uuid;
  analysisJobId: Uuid;
  analysisSessionId: Uuid;
  status: PanoptesAnalysisJobStatus;
  progressPhase: PanoptesVisibleStep;
  progressStepIndex: PanoptesVisibleStepIndex;
  progressPercent: number;
  statusMessage: string;
  errorCode: PanoptesFailureCode | null;
  errorMessage: string | null;
  inferenceLocked: boolean;
  inferenceConfirmedAt: IsoDateString | null;
  startedAt: IsoDateString | null;
  finishedAt: IsoDateString | null;
  updatedAt: IsoDateString;
};

export type PanoptesPollProgressResult = {
  progressState: PanoptesProgressState;
  uiStepPanel: PanoptesUiStepPanelState;
  runtimeState: PanoptesPipelineRuntimeState;
  projectSummary: PanoptesProjectSummary;
  inferenceDraft: PanoptesInferenceDraft | null;
  currentSnapshotReady: boolean;
  staleResponseIgnored: boolean;
};

export type PanoptesConfirmInferenceInput = {
  projectId: Uuid;
  analysisJobId: Uuid;
  inferredIndustry: string;
  inferredStructureType: string;
  inferredSiteScale: string;
  userOverrideNote: string | null;
};

export type PanoptesConfirmInferenceResult = {
  analysisJob: PanoptesAnalysisJob;
  progressState: PanoptesProgressState;
  uiStepPanel: PanoptesUiStepPanelState;
};

export type PanoptesReanalyzeResult = {
  project: PanoptesProjectRecord;
  projectSummary: PanoptesProjectSummary;
  analysisJob: PanoptesAnalysisJob;
  runtimeState: PanoptesPipelineRuntimeState;
};

export type PanoptesSelectStrategyInput = {
  projectId: Uuid;
  analysisSnapshotId: Uuid;
  strategyKey: string;
};

export type PanoptesSelectStrategyResult = {
  project: PanoptesProjectRecord;
  selectedStrategyPlan: PanoptesStrategyPlan;
  phaseTasks: PanoptesPhaseTask[];
  projectSummary: PanoptesProjectSummary;
};

export type PanoptesUpdateTaskStatusInput = {
  phaseTaskId: Uuid;
  toStatus: PanoptesPhaseTaskStatus;
  reason: string | null;
};

export type PanoptesUpdateTaskStatusResult = {
  phaseTask: PanoptesPhaseTask;
  transition: PanoptesTaskTransition;
};

export type PanoptesSessionUiStore = {
  selectedProjectId: Uuid | null;
  lastStableSelectedProjectId: Uuid | null;
  createFlowOpen: boolean;
  createFlowStatus: 'idle' | 'editing' | 'submitting' | 'failed';
  projectSwitchStatus: 'idle' | 'switching' | 'failed';
  rightPanelMode: 'project_list' | 'task_detail' | 'compact';
  mainSurfaceMode: 'dashboard' | 'analysis_flow' | 'snapshot_view';
  globalBlockingAction: null | 'creating_project' | 'switching_project' | 'committing_snapshot';
  pendingNavigationIntent:
    | null
    | {
        type: 'select_project';
        projectId: Uuid;
      };
};

export type PanoptesProjectCollectionStore = {
  items: PanoptesProjectSummary[];
  fetchStatus: 'idle' | 'loading' | 'refreshing' | 'failed';
  fetchedAt: IsoDateString | null;
};

export type PanoptesProjectDetailStore = {
  projectId: Uuid | null;
  hydrationStatus: 'idle' | 'loading' | 'ready' | 'failed';
  project: PanoptesProjectRecord | null;
  currentSnapshot: PanoptesAnalysisSnapshotPayload | null;
  lastStableSnapshot: PanoptesAnalysisSnapshotPayload | null;
  latestAnalysisJob: PanoptesAnalysisJob | null;
  derivedDisplayState: PanoptesProjectDisplayState;
  error:
    | null
    | {
        code: string;
        message: string;
      };
};

export type PanoptesAnalysisRuntimeStore = {
  activeProjectId: Uuid | null;
  activeJobId: Uuid | null;
  activeAnalysisSessionId: Uuid | null;
  runtimeStatus: PanoptesRuntimeStatus;
  visibleStep: PanoptesVisibleStep | null;
  visibleStepIndex: PanoptesVisibleStepIndex | null;
  serverConfirmedPhase: PanoptesVisibleStep | null;
  serverConfirmedStepIndex: PanoptesVisibleStepIndex | null;
  progressPercent: number | null;
  statusMessage: string | null;
  inferenceDraft: PanoptesInferenceDraft | null;
  canConfirmInference: boolean;
  confirmMutationStatus: 'idle' | 'submitting' | 'failed';
  pollingStatus: 'stopped' | 'polling' | 'backoff';
  pollingIntervalMs: number | null;
  lastProgressEventAt: IsoDateString | null;
  terminalReason: PanoptesTerminalReason | null;
};

export type PanoptesStrategyUiStore = {
  selectedStrategyPlanId: Uuid | null;
  selectedPhase: PanoptesStrategyPhase | null;
  selectedTaskId: Uuid | null;
  taskMutationStatus: 'idle' | 'saving' | 'failed';
  strategySelectionStatus: 'idle' | 'saving' | 'failed';
};

export type PanoptesNetworkStore = {
  online: boolean;
  apiReachability: PanoptesReachability;
  lastCheckedAt: IsoDateString | null;
};

export type PanoptesNotificationStore = {
  toasts: Array<{
    id: Uuid;
    level: PanoptesToastLevel;
    message: string;
    createdAt: IsoDateString;
  }>;
};

export type PanoptesApiClient = {
  listProjects(): Promise<{ items: PanoptesProjectSummary[] }>;
  getProjectDetail(projectId: Uuid): Promise<PanoptesProjectDetailView>;
  createAndStartAnalysis(input: PanoptesCreateAnalysisInput): Promise<PanoptesCreateAnalysisResult>;
  pollAnalysisProgress(input: PanoptesPollProgressInput): Promise<PanoptesPollProgressResult>;
  confirmInference(input: PanoptesConfirmInferenceInput): Promise<PanoptesConfirmInferenceResult>;
  reanalyzeProject(projectId: Uuid, idempotencyKey: string): Promise<PanoptesReanalyzeResult>;
  selectStrategy(input: PanoptesSelectStrategyInput): Promise<PanoptesSelectStrategyResult>;
  updateTaskStatus(input: PanoptesUpdateTaskStatusInput): Promise<PanoptesUpdateTaskStatusResult>;
  getUsageState(): Promise<PanoptesUsageState>;
};
