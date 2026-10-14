import { z } from 'zod';

/**
 * Panoptes TypeScript / Zod Complete v3.3
 * ------------------------------------------------------------
 * Source of truth alignment:
 * - Panoptes_Master_Spec_v3_3_Stability_Hardened.txt
 * - Panoptes_DB_Migration_v3_3_Complete.sql
 *
 * Intent:
 * - Frontend / backend / DB contract を単一ファイルで揃える
 * - nullable / stale job / step monotonic / project shell state を型で固定する
 * - Svelte UI, API handlers, worker, DB adapter の境界で共通利用する
 */

// ============================================================
// 1. Primitive helpers
// ============================================================

export const UuidSchema = z.string().uuid();
export const IsoDateTimeSchema = z.string().datetime({ offset: true });
export const NonBlankStringSchema = z.string().trim().min(1);
export const UrlSchema = z.string().url();
export const NormalizedUrlSchema = z.string().trim().min(1);
export const JsonValueSchema: z.ZodTypeAny = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema)
  ])
);

export const NullableUuidSchema = UuidSchema.nullable();

// ============================================================
// 2. Canon enums
// ============================================================

export const MemberRoleSchema = z.enum(['owner', 'admin', 'member', 'viewer']);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

export const PlanCodeSchema = z.enum(['free', 'starter', 'growth', 'enterprise']);
export type PlanCode = z.infer<typeof PlanCodeSchema>;

export const ProjectStatusSchema = z.enum([
  'ready',
  'creating',
  'queued',
  'analyzing',
  'awaiting_confirmation',
  'completing',
  'completed',
  'failed',
  'empty'
]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const AnalysisJobStatusSchema = z.enum([
  'queued',
  'running',
  'awaiting_confirmation',
  'completing',
  'completed',
  'failed',
  'cancelled',
  'commit_failed'
]);
export type AnalysisJobStatus = z.infer<typeof AnalysisJobStatusSchema>;

export const ProgressPhaseSchema = z.enum([
  'target_scan',
  'inference_review',
  'competitor_analysis',
  'industry_analysis',
  'strategy_synthesis'
]);
export type ProgressPhase = z.infer<typeof ProgressPhaseSchema>;

export const SnapshotStatusSchema = z.enum(['draft', 'committing', 'committed', 'failed']);
export type SnapshotStatus = z.infer<typeof SnapshotStatusSchema>;

export const StrategyStatusLabelSchema = z.enum([
  'not_started',
  'improving',
  'stable',
  'rework_required'
]);
export type StrategyStatusLabel = z.infer<typeof StrategyStatusLabelSchema>;

export const PhaseCodeSchema = z.enum(['day_30', 'day_60', 'day_90']);
export type PhaseCode = z.infer<typeof PhaseCodeSchema>;

export const PhaseTaskStatusSchema = z.enum(['todo', 'in_progress', 'blocked', 'done', 'cancelled']);
export type PhaseTaskStatus = z.infer<typeof PhaseTaskStatusSchema>;

export const AuditActionSchema = z.enum([
  'waitlist_approval',
  'admin_action',
  'project_delete',
  'reanalysis_trigger',
  'strategy_selection',
  'task_status_change'
]);
export type AuditAction = z.infer<typeof AuditActionSchema>;

export const VisibleStepSchema = z.enum([
  'target_scan',
  'inference_review',
  'competitor_analysis',
  'industry_analysis',
  'strategy_synthesis'
]);
export type VisibleStep = z.infer<typeof VisibleStepSchema>;

export const ConfidenceLabelSchema = z.enum(['high', 'medium', 'low']);
export type ConfidenceLabel = z.infer<typeof ConfidenceLabelSchema>;

export const PipelineFailureCodeSchema = z.enum([
  'url_unreachable',
  'crawl_failed',
  'inference_failed',
  'inference_confirmation_expired',
  'competitor_discovery_failed',
  'competitor_insufficient',
  'competitor_analysis_partial_failure',
  'industry_analysis_failed',
  'strategy_generation_failed',
  'snapshot_commit_failed',
  'job_cancelled',
  'stale_job_ignored',
  'unknown_error'
]);
export type PipelineFailureCode = z.infer<typeof PipelineFailureCodeSchema>;

export const ApiErrorCodeSchema = z.enum([
  'validation_error',
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'stale_job',
  'invalid_transition',
  'already_running',
  'rate_limited',
  'quota_exceeded',
  'server_error'
]);
export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

// ============================================================
// 3. Step mapping / monotonic helpers
// ============================================================

export const STEP_INDEX_BY_PHASE = {
  target_scan: 1,
  inference_review: 2,
  competitor_analysis: 3,
  industry_analysis: 4,
  strategy_synthesis: 5
} as const satisfies Record<ProgressPhase, 1 | 2 | 3 | 4 | 5>;

export const STEP_ORDER: readonly VisibleStep[] = [
  'target_scan',
  'inference_review',
  'competitor_analysis',
  'industry_analysis',
  'strategy_synthesis'
] as const;

export function phaseToStepIndex(phase: ProgressPhase): 1 | 2 | 3 | 4 | 5 {
  return STEP_INDEX_BY_PHASE[phase];
}

export function isStepForwardOnly(prev: number, next: number): boolean {
  return next >= prev;
}

// ============================================================
// 4. Core record schemas (DB-aligned)
// ============================================================

export const OrgSchema = z.object({
  org_id: UuidSchema,
  org_name: NonBlankStringSchema,
  slug: z.string().trim().min(1).nullable(),
  plan_code: PlanCodeSchema,
  is_active: z.boolean(),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema
});
export type Org = z.infer<typeof OrgSchema>;

export const OrgMemberSchema = z.object({
  org_member_id: UuidSchema,
  org_id: UuidSchema,
  user_id: UuidSchema,
  role: MemberRoleSchema,
  is_active: z.boolean(),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema
});
export type OrgMember = z.infer<typeof OrgMemberSchema>;

export const OrgUsageMonthlySchema = z.object({
  org_usage_monthly_id: UuidSchema,
  org_id: UuidSchema,
  usage_month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  analysis_run_count: z.number().int().nonnegative(),
  llm_input_tokens: z.number().int().nonnegative(),
  llm_output_tokens: z.number().int().nonnegative(),
  screenshot_count: z.number().int().nonnegative(),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema
});
export type OrgUsageMonthly = z.infer<typeof OrgUsageMonthlySchema>;

export const SiteEntitySchema = z.object({
  site_entity_id: UuidSchema,
  normalized_url: NormalizedUrlSchema,
  canonical_host: NonBlankStringSchema,
  canonical_domain: z.string().trim().min(1).nullable(),
  robots_checked_at: IsoDateTimeSchema.nullable(),
  robots_status_code: z.number().int().nullable(),
  reachability_status: z.string().trim().min(1).nullable(),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema
});
export type SiteEntity = z.infer<typeof SiteEntitySchema>;

export const ProjectRecordSchema = z.object({
  project_id: UuidSchema,
  org_id: UuidSchema,
  site_entity_id: NullableUuidSchema.optional().default(null),
  project_name: NonBlankStringSchema,
  target_url: UrlSchema,
  normalized_target_url: NormalizedUrlSchema,
  project_status: ProjectStatusSchema,
  current_snapshot_id: NullableUuidSchema.optional().default(null),
  latest_analysis_job_id: NullableUuidSchema.optional().default(null),
  latest_analysis_session_id: NullableUuidSchema.optional().default(null),
  current_strategy_plan_id: NullableUuidSchema.optional().default(null),
  strategy_status_label: StrategyStatusLabelSchema.nullable().optional().default(null),
  selected_strategy_key: z.string().trim().min(1).nullable().optional().default(null),
  archived_at: IsoDateTimeSchema.nullable().optional().default(null),
  created_by: UuidSchema.nullable().optional().default(null),
  updated_by: UuidSchema.nullable().optional().default(null),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema
});
export type ProjectRecord = z.infer<typeof ProjectRecordSchema>;

export const AnalysisJobRecordSchema = z.object({
  analysis_job_id: UuidSchema,
  project_id: UuidSchema,
  org_id: UuidSchema,
  analysis_session_id: UuidSchema,
  idempotency_key: NonBlankStringSchema,
  status: AnalysisJobStatusSchema,
  progress_phase: ProgressPhaseSchema,
  progress_step_index: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  progress_percent: z.number().min(0).max(100),
  status_message: z.string().trim().min(1).nullable().optional().default(null),
  error_code: PipelineFailureCodeSchema.nullable().optional().default(null),
  error_message: z.string().trim().min(1).nullable().optional().default(null),
  inference_locked: z.boolean().optional().default(false),
  inference_confirmed_at: IsoDateTimeSchema.nullable().optional().default(null),
  started_at: IsoDateTimeSchema.nullable().optional().default(null),
  finished_at: IsoDateTimeSchema.nullable().optional().default(null),
  created_by: UuidSchema.nullable().optional().default(null),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema
}).superRefine((value, ctx) => {
  if (phaseToStepIndex(value.progress_phase) !== value.progress_step_index) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'progress_step_index must match progress_phase'
    });
  }
});
export type AnalysisJobRecord = z.infer<typeof AnalysisJobRecordSchema>;

export const AnalysisProgressEventSchema = z.object({
  analysis_progress_event_id: UuidSchema,
  analysis_job_id: UuidSchema,
  project_id: UuidSchema,
  phase: ProgressPhaseSchema,
  step_index: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  percent: z.number().min(0).max(100),
  message: z.string().trim().min(1),
  event_payload: z.record(z.string(), JsonValueSchema).nullable().optional().default(null),
  created_at: IsoDateTimeSchema
}).superRefine((value, ctx) => {
  if (phaseToStepIndex(value.phase) !== value.step_index) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'step_index must match phase' });
  }
});
export type AnalysisProgressEvent = z.infer<typeof AnalysisProgressEventSchema>;

export const AnalysisSnapshotHeaderSchema = z.object({
  analysis_snapshot_id: UuidSchema,
  project_id: UuidSchema,
  analysis_job_id: UuidSchema,
  org_id: UuidSchema,
  snapshot_status: SnapshotStatusSchema,
  version_label: NonBlankStringSchema,
  selected_strategy_key: z.string().trim().min(1).nullable().optional().default(null),
  target_url: UrlSchema,
  normalized_target_url: NormalizedUrlSchema,
  site_name: z.string().trim().min(1).nullable().optional().default(null),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema,
  committed_at: IsoDateTimeSchema.nullable().optional().default(null)
});
export type AnalysisSnapshotHeader = z.infer<typeof AnalysisSnapshotHeaderSchema>;

export const AnalysisSnapshotPayloadSchema = z.object({
  analysis_snapshot_payload_id: UuidSchema,
  analysis_snapshot_id: UuidSchema,
  target_scan_payload: z.record(z.string(), JsonValueSchema).nullable().optional().default(null),
  inference_payload: z.record(z.string(), JsonValueSchema).nullable().optional().default(null),
  competitor_payload: z.record(z.string(), JsonValueSchema).nullable().optional().default(null),
  industry_payload: z.record(z.string(), JsonValueSchema).nullable().optional().default(null),
  strategy_payload: z.record(z.string(), JsonValueSchema).nullable().optional().default(null),
  meta_payload: z.record(z.string(), JsonValueSchema).nullable().optional().default(null),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema
});
export type AnalysisSnapshotPayload = z.infer<typeof AnalysisSnapshotPayloadSchema>;

export const StrategyPlanRecordSchema = z.object({
  strategy_plan_id: UuidSchema,
  analysis_snapshot_id: UuidSchema,
  strategy_key: NonBlankStringSchema,
  title: NonBlankStringSchema,
  summary: NonBlankStringSchema,
  score: z.number().nullable().optional().default(null),
  priority_rank: z.number().int().positive().nullable().optional().default(null),
  is_selected: z.boolean(),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema
});
export type StrategyPlanRecord = z.infer<typeof StrategyPlanRecordSchema>;

export const PhaseTaskRecordSchema = z.object({
  phase_task_id: UuidSchema,
  strategy_plan_id: UuidSchema,
  phase_code: PhaseCodeSchema,
  title: NonBlankStringSchema,
  description: z.string().trim().min(1).nullable().optional().default(null),
  sort_order: z.number().int().nonnegative(),
  task_status: PhaseTaskStatusSchema,
  owner_label: z.string().trim().min(1).nullable().optional().default(null),
  due_hint: z.string().trim().min(1).nullable().optional().default(null),
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema
});
export type PhaseTaskRecord = z.infer<typeof PhaseTaskRecordSchema>;

export const PhaseTaskTransitionRecordSchema = z.object({
  phase_task_transition_id: UuidSchema,
  phase_task_id: UuidSchema,
  from_status: PhaseTaskStatusSchema.nullable(),
  to_status: PhaseTaskStatusSchema,
  changed_by: UuidSchema.nullable().optional().default(null),
  reason: z.string().trim().min(1).nullable().optional().default(null),
  created_at: IsoDateTimeSchema
});
export type PhaseTaskTransitionRecord = z.infer<typeof PhaseTaskTransitionRecordSchema>;

export const AuditLogRecordSchema = z.object({
  audit_log_id: UuidSchema,
  org_id: UuidSchema,
  project_id: UuidSchema.nullable().optional().default(null),
  action: AuditActionSchema,
  actor_user_id: UuidSchema.nullable().optional().default(null),
  payload: z.record(z.string(), JsonValueSchema).nullable().optional().default(null),
  created_at: IsoDateTimeSchema
});
export type AuditLogRecord = z.infer<typeof AuditLogRecordSchema>;

// ============================================================
// 5. Domain payload schemas used inside snapshot payload
// ============================================================

export const InferenceCandidateSchema = z.object({
  label: NonBlankStringSchema,
  confidence: ConfidenceLabelSchema,
  evidence: z.array(NonBlankStringSchema).default([])
});
export type InferenceCandidate = z.infer<typeof InferenceCandidateSchema>;

export const InferenceReviewPayloadSchema = z.object({
  inferred_industry: InferenceCandidateSchema,
  inferred_structure_type: InferenceCandidateSchema,
  inferred_site_scale: InferenceCandidateSchema,
  can_edit_before_confirm: z.boolean().default(true),
  locked_after_confirm: z.boolean().default(true)
});
export type InferenceReviewPayload = z.infer<typeof InferenceReviewPayloadSchema>;

export const CompetitorCardSchema = z.object({
  site_name: NonBlankStringSchema,
  domain: NonBlankStringSchema,
  url: UrlSchema,
  rank: z.number().int().positive(),
  fit_reason: z.string().trim().min(1),
  internal_score: z.number().min(0).max(100).nullable().optional().default(null),
  visual_score: z.number().min(0).max(100).nullable().optional().default(null),
  overall_score: z.number().min(0).max(100).nullable().optional().default(null)
});
export type CompetitorCard = z.infer<typeof CompetitorCardSchema>;

export const IndustryStructurePayloadSchema = z.object({
  market_structure_summary: NonBlankStringSchema,
  dominant_patterns: z.array(NonBlankStringSchema).default([]),
  whitespace_opportunities: z.array(NonBlankStringSchema).default([]),
  notable_clusters: z.array(NonBlankStringSchema).default([])
});
export type IndustryStructurePayload = z.infer<typeof IndustryStructurePayloadSchema>;

export const StrategyOptionSchema = z.object({
  strategy_key: NonBlankStringSchema,
  title: NonBlankStringSchema,
  summary: NonBlankStringSchema,
  fit_score: z.number().min(0).max(100).nullable().optional().default(null),
  rationale: z.array(NonBlankStringSchema).default([])
});
export type StrategyOption = z.infer<typeof StrategyOptionSchema>;

// ============================================================
// 6. Project shell / display safety schemas
// ============================================================

export const ProjectShellBaseSchema = z.object({
  project_id: UuidSchema,
  project_name: NonBlankStringSchema,
  target_url: UrlSchema,
  project_status: ProjectStatusSchema,
  current_snapshot_id: NullableUuidSchema,
  latest_analysis_job_id: NullableUuidSchema,
  latest_analysis_session_id: NullableUuidSchema,
  current_strategy_plan_id: NullableUuidSchema,
  selected_strategy_key: z.string().trim().min(1).nullable().optional().default(null),
  strategy_status_label: StrategyStatusLabelSchema.nullable().optional().default(null),
  updated_at: IsoDateTimeSchema
});

export const ProjectDisplayStateSchema = z.discriminatedUnion('display_state', [
  ProjectShellBaseSchema.extend({
    display_state: z.literal('empty'),
    current_snapshot_id: z.null(),
    latest_analysis_job_id: z.null(),
    project_status: z.enum(['empty', 'creating'])
  }),
  ProjectShellBaseSchema.extend({
    display_state: z.literal('analyzing'),
    latest_analysis_job_id: UuidSchema,
    project_status: z.enum(['queued', 'analyzing', 'awaiting_confirmation', 'completing'])
  }),
  ProjectShellBaseSchema.extend({
    display_state: z.literal('failed'),
    latest_analysis_job_id: NullableUuidSchema,
    project_status: z.literal('failed')
  }),
  ProjectShellBaseSchema.extend({
    display_state: z.literal('ready'),
    current_snapshot_id: UuidSchema,
    project_status: z.enum(['ready', 'completed'])
  })
]);
export type ProjectDisplayState = z.infer<typeof ProjectDisplayStateSchema>;

export const SelectedProjectViewSchema = z.object({
  selected_project_id: UuidSchema.nullable(),
  should_preserve_current_selection_during_create: z.boolean().default(true),
  pending_created_project_id: UuidSchema.nullable().default(null),
  visible_panel_project_id: UuidSchema.nullable().default(null)
});
export type SelectedProjectView = z.infer<typeof SelectedProjectViewSchema>;

// ============================================================
// 7. UI progress / animated central panel contracts
// ============================================================

export const UiStepPanelStateSchema = z.object({
  visible_step: VisibleStepSchema,
  visible_step_index: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  server_confirmed_phase: ProgressPhaseSchema,
  server_confirmed_step_index: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  progress_percent: z.number().min(0).max(100),
  status_message: NonBlankStringSchema,
  can_auto_advance: z.boolean().default(true),
  panel_transition_locked: z.boolean().default(false),
  preserve_container_mount: z.literal(true).default(true),
  preserve_min_height: z.literal(true).default(true)
}).superRefine((value, ctx) => {
  if (value.visible_step_index < value.server_confirmed_step_index) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'visible_step_index cannot lag behind server_confirmed_step_index after commit'
    });
  }
  if (value.server_confirmed_step_index !== phaseToStepIndex(value.server_confirmed_phase)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'server_confirmed_step_index must match server_confirmed_phase'
    });
  }
});
export type UiStepPanelState = z.infer<typeof UiStepPanelStateSchema>;

export const PipelineRuntimeStateSchema = z.discriminatedUnion('runtime_state', [
  z.object({
    runtime_state: z.literal('idle'),
    project_id: UuidSchema,
    analysis_job_id: z.null(),
    current_phase: z.null(),
    current_step_index: z.null(),
    failure: z.null()
  }),
  z.object({
    runtime_state: z.literal('running'),
    project_id: UuidSchema,
    analysis_job_id: UuidSchema,
    current_phase: ProgressPhaseSchema,
    current_step_index: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    failure: z.null()
  }),
  z.object({
    runtime_state: z.literal('awaiting_confirmation'),
    project_id: UuidSchema,
    analysis_job_id: UuidSchema,
    current_phase: z.literal('inference_review'),
    current_step_index: z.literal(2),
    failure: z.null()
  }),
  z.object({
    runtime_state: z.literal('failed'),
    project_id: UuidSchema,
    analysis_job_id: UuidSchema.nullable(),
    current_phase: ProgressPhaseSchema.nullable(),
    current_step_index: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).nullable(),
    failure: z.object({
      code: PipelineFailureCodeSchema,
      message: NonBlankStringSchema,
      recoverable: z.boolean()
    })
  }),
  z.object({
    runtime_state: z.literal('completed'),
    project_id: UuidSchema,
    analysis_job_id: UuidSchema,
    current_phase: z.literal('strategy_synthesis'),
    current_step_index: z.literal(5),
    failure: z.null()
  })
]);
export type PipelineRuntimeState = z.infer<typeof PipelineRuntimeStateSchema>;

// ============================================================
// 8. View models
// ============================================================

export const ProjectSummaryViewSchema = z.object({
  project_id: UuidSchema,
  org_id: UuidSchema,
  project_name: NonBlankStringSchema,
  target_url: UrlSchema,
  normalized_target_url: NormalizedUrlSchema,
  project_status: ProjectStatusSchema,
  display_state: z.enum(['empty', 'analyzing', 'failed', 'ready']),
  current_snapshot_id: NullableUuidSchema,
  latest_analysis_job_id: NullableUuidSchema,
  latest_analysis_session_id: NullableUuidSchema,
  current_strategy_plan_id: NullableUuidSchema,
  selected_strategy_key: z.string().trim().min(1).nullable().optional().default(null),
  strategy_status_label: StrategyStatusLabelSchema.nullable().optional().default(null),
  latest_progress_phase: ProgressPhaseSchema.nullable().optional().default(null),
  latest_progress_step_index: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).nullable().optional().default(null),
  latest_progress_percent: z.number().min(0).max(100).nullable().optional().default(null),
  latest_status_message: z.string().trim().min(1).nullable().optional().default(null),
  latest_error_code: PipelineFailureCodeSchema.nullable().optional().default(null),
  updated_at: IsoDateTimeSchema,
  created_at: IsoDateTimeSchema
});
export type ProjectSummaryView = z.infer<typeof ProjectSummaryViewSchema>;

export const AnalysisProgressStateViewSchema = z.object({
  project_id: UuidSchema,
  analysis_job_id: UuidSchema,
  analysis_session_id: UuidSchema,
  status: AnalysisJobStatusSchema,
  progress_phase: ProgressPhaseSchema,
  progress_step_index: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  progress_percent: z.number().min(0).max(100),
  status_message: NonBlankStringSchema,
  error_code: PipelineFailureCodeSchema.nullable().optional().default(null),
  error_message: z.string().trim().min(1).nullable().optional().default(null),
  inference_locked: z.boolean(),
  inference_confirmed_at: IsoDateTimeSchema.nullable().optional().default(null),
  started_at: IsoDateTimeSchema.nullable().optional().default(null),
  finished_at: IsoDateTimeSchema.nullable().optional().default(null),
  updated_at: IsoDateTimeSchema
});
export type AnalysisProgressStateView = z.infer<typeof AnalysisProgressStateViewSchema>;

export const ProjectDetailViewSchema = z.object({
  project: ProjectRecordSchema,
  project_summary: ProjectSummaryViewSchema,
  latest_job: AnalysisJobRecordSchema.nullable(),
  current_snapshot_header: AnalysisSnapshotHeaderSchema.nullable(),
  current_snapshot_payload: AnalysisSnapshotPayloadSchema.nullable(),
  strategy_plans: z.array(StrategyPlanRecordSchema),
  phase_tasks: z.array(PhaseTaskRecordSchema),
  recent_progress_events: z.array(AnalysisProgressEventSchema),
  runtime_state: PipelineRuntimeStateSchema,
  ui_step_panel: UiStepPanelStateSchema.nullable()
});
export type ProjectDetailView = z.infer<typeof ProjectDetailViewSchema>;

// ============================================================
// 9. API envelope
// ============================================================

export const ApiErrorSchema = z.object({
  code: ApiErrorCodeSchema,
  message: NonBlankStringSchema,
  field_errors: z.record(z.string(), z.array(NonBlankStringSchema)).optional(),
  retryable: z.boolean().default(false)
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiSuccessEnvelope = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({ ok: z.literal(true), data: dataSchema });

export const ApiErrorEnvelopeSchema = z.object({ ok: z.literal(false), error: ApiErrorSchema });
export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;

// ============================================================
// 10. Request / response contracts
// ============================================================

export const StartAnalysisRequestSchema = z.object({
  org_id: UuidSchema,
  project_name: NonBlankStringSchema,
  target_url: UrlSchema,
  normalized_target_url: NormalizedUrlSchema.optional(),
  idempotency_key: NonBlankStringSchema,
  auto_select_after_create: z.boolean().default(false),
  preserve_current_selection: z.boolean().default(true)
});
export type StartAnalysisRequest = z.infer<typeof StartAnalysisRequestSchema>;

export const StartAnalysisResponseSchema = z.object({
  project: ProjectRecordSchema,
  project_summary: ProjectSummaryViewSchema,
  analysis_job: AnalysisJobRecordSchema,
  runtime_state: PipelineRuntimeStateSchema,
  selection_hint: z.object({
    selected_project_id_should_change: z.boolean(),
    selected_project_id: UuidSchema.nullable(),
    pending_created_project_id: UuidSchema.nullable()
  })
});
export type StartAnalysisResponse = z.infer<typeof StartAnalysisResponseSchema>;

export const ConfirmInferenceRequestSchema = z.object({
  project_id: UuidSchema,
  analysis_job_id: UuidSchema,
  inferred_industry: NonBlankStringSchema,
  inferred_structure_type: NonBlankStringSchema,
  inferred_site_scale: NonBlankStringSchema,
  confirmed_at_client: IsoDateTimeSchema.optional(),
  user_override_note: z.string().trim().min(1).max(2000).nullable().optional().default(null)
});
export type ConfirmInferenceRequest = z.infer<typeof ConfirmInferenceRequestSchema>;

export const ConfirmInferenceResponseSchema = z.object({
  analysis_job: AnalysisJobRecordSchema,
  progress_state: AnalysisProgressStateViewSchema,
  ui_step_panel: UiStepPanelStateSchema
});
export type ConfirmInferenceResponse = z.infer<typeof ConfirmInferenceResponseSchema>;

export const GetProjectListRequestSchema = z.object({
  org_id: UuidSchema,
  include_archived: z.boolean().default(false),
  limit: z.number().int().positive().max(200).default(50),
  cursor: z.string().trim().min(1).nullable().optional().default(null)
});
export type GetProjectListRequest = z.infer<typeof GetProjectListRequestSchema>;

export const GetProjectListResponseSchema = z.object({
  items: z.array(ProjectSummaryViewSchema),
  next_cursor: z.string().trim().min(1).nullable().default(null)
});
export type GetProjectListResponse = z.infer<typeof GetProjectListResponseSchema>;

export const GetProjectDetailRequestSchema = z.object({
  project_id: UuidSchema
});
export type GetProjectDetailRequest = z.infer<typeof GetProjectDetailRequestSchema>;

export const GetProjectDetailResponseSchema = ProjectDetailViewSchema;
export type GetProjectDetailResponse = z.infer<typeof GetProjectDetailResponseSchema>;

export const PollAnalysisStatusRequestSchema = z.object({
  project_id: UuidSchema,
  analysis_job_id: UuidSchema.optional(),
  known_progress_percent: z.number().min(0).max(100).optional(),
  known_step_index: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional()
});
export type PollAnalysisStatusRequest = z.infer<typeof PollAnalysisStatusRequestSchema>;

export const PollAnalysisStatusResponseSchema = z.object({
  progress_state: AnalysisProgressStateViewSchema,
  ui_step_panel: UiStepPanelStateSchema,
  runtime_state: PipelineRuntimeStateSchema,
  project_summary: ProjectSummaryViewSchema,
  current_snapshot_ready: z.boolean(),
  stale_response_ignored: z.boolean().default(false)
});
export type PollAnalysisStatusResponse = z.infer<typeof PollAnalysisStatusResponseSchema>;

export const RetryAnalysisRequestSchema = z.object({
  project_id: UuidSchema,
  idempotency_key: NonBlankStringSchema,
  retry_from_phase: ProgressPhaseSchema.optional(),
  reason: z.string().trim().min(1).max(1000).nullable().optional().default(null)
});
export type RetryAnalysisRequest = z.infer<typeof RetryAnalysisRequestSchema>;

export const RetryAnalysisResponseSchema = z.object({
  project: ProjectRecordSchema,
  analysis_job: AnalysisJobRecordSchema,
  runtime_state: PipelineRuntimeStateSchema,
  project_summary: ProjectSummaryViewSchema
});
export type RetryAnalysisResponse = z.infer<typeof RetryAnalysisResponseSchema>;

export const ReanalyzeProjectRequestSchema = z.object({
  project_id: UuidSchema,
  idempotency_key: NonBlankStringSchema,
  reason: z.string().trim().min(1).max(1000).nullable().optional().default(null)
});
export type ReanalyzeProjectRequest = z.infer<typeof ReanalyzeProjectRequestSchema>;

export const ReanalyzeProjectResponseSchema = RetryAnalysisResponseSchema;
export type ReanalyzeProjectResponse = z.infer<typeof ReanalyzeProjectResponseSchema>;

export const SelectStrategyRequestSchema = z.object({
  project_id: UuidSchema,
  analysis_snapshot_id: UuidSchema,
  strategy_key: NonBlankStringSchema
});
export type SelectStrategyRequest = z.infer<typeof SelectStrategyRequestSchema>;

export const SelectStrategyResponseSchema = z.object({
  project: ProjectRecordSchema,
  selected_strategy_plan: StrategyPlanRecordSchema,
  phase_tasks: z.array(PhaseTaskRecordSchema),
  project_summary: ProjectSummaryViewSchema
});
export type SelectStrategyResponse = z.infer<typeof SelectStrategyResponseSchema>;

export const UpdatePhaseTaskStatusRequestSchema = z.object({
  phase_task_id: UuidSchema,
  to_status: PhaseTaskStatusSchema,
  reason: z.string().trim().min(1).max(1000).nullable().optional().default(null)
});
export type UpdatePhaseTaskStatusRequest = z.infer<typeof UpdatePhaseTaskStatusRequestSchema>;

export const UpdatePhaseTaskStatusResponseSchema = z.object({
  phase_task: PhaseTaskRecordSchema,
  transition: PhaseTaskTransitionRecordSchema
});
export type UpdatePhaseTaskStatusResponse = z.infer<typeof UpdatePhaseTaskStatusResponseSchema>;

// ============================================================
// 11. Frontend guards / derived helpers
// ============================================================

export function assertProjectDisplayState(input: unknown): ProjectDisplayState {
  return ProjectDisplayStateSchema.parse(input);
}

export function canRenderSnapshot(project: Pick<ProjectRecord, 'current_snapshot_id'>): boolean {
  return project.current_snapshot_id !== null;
}

export function isTerminalJobStatus(status: AnalysisJobStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'cancelled' || status === 'commit_failed';
}

export function shouldIgnoreStaleStatusUpdate(
  latestAnalysisJobId: string | null,
  incomingAnalysisJobId: string
): boolean {
  return latestAnalysisJobId !== null && latestAnalysisJobId !== incomingAnalysisJobId;
}

export function shouldAdvanceVisibleStep(
  currentVisibleStep: VisibleStep,
  serverConfirmedPhase: ProgressPhase
): boolean {
  return phaseToStepIndex(serverConfirmedPhase) > phaseToStepIndex(currentVisibleStep);
}

export function nextVisibleStep(currentVisibleStep: VisibleStep): VisibleStep {
  const index = STEP_ORDER.indexOf(currentVisibleStep);
  return STEP_ORDER[Math.min(index + 1, STEP_ORDER.length - 1)]!;
}

export function projectStatusToDisplayState(project: {
  project_status: ProjectStatus;
  current_snapshot_id: string | null;
  latest_analysis_job_id: string | null;
}): ProjectDisplayState['display_state'] {
  if (project.current_snapshot_id) return 'ready';
  if (project.project_status === 'failed') return 'failed';
  if (['queued', 'analyzing', 'awaiting_confirmation', 'completing'].includes(project.project_status)) return 'analyzing';
  return 'empty';
}

export function createInitialUiStepPanelState(statusMessage = '分析対象URLを分析中です…'): UiStepPanelState {
  return UiStepPanelStateSchema.parse({
    visible_step: 'target_scan',
    visible_step_index: 1,
    server_confirmed_phase: 'target_scan',
    server_confirmed_step_index: 1,
    progress_percent: 0,
    status_message: statusMessage,
    can_auto_advance: true,
    panel_transition_locked: false,
    preserve_container_mount: true,
    preserve_min_height: true
  });
}

// ============================================================
// 12. Event stream contracts (polling / SSE / websocket)
// ============================================================

export const AnalysisProgressMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('progress'),
    project_id: UuidSchema,
    analysis_job_id: UuidSchema,
    phase: ProgressPhaseSchema,
    step_index: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    percent: z.number().min(0).max(100),
    status_message: NonBlankStringSchema,
    at: IsoDateTimeSchema
  }),
  z.object({
    type: z.literal('awaiting_confirmation'),
    project_id: UuidSchema,
    analysis_job_id: UuidSchema,
    phase: z.literal('inference_review'),
    step_index: z.literal(2),
    inference_payload: InferenceReviewPayloadSchema,
    at: IsoDateTimeSchema
  }),
  z.object({
    type: z.literal('completed'),
    project_id: UuidSchema,
    analysis_job_id: UuidSchema,
    analysis_snapshot_id: UuidSchema,
    strategy_plan_id: UuidSchema.nullable(),
    at: IsoDateTimeSchema
  }),
  z.object({
    type: z.literal('failed'),
    project_id: UuidSchema,
    analysis_job_id: UuidSchema.nullable(),
    error_code: PipelineFailureCodeSchema,
    error_message: NonBlankStringSchema,
    recoverable: z.boolean(),
    at: IsoDateTimeSchema
  })
]);
export type AnalysisProgressMessage = z.infer<typeof AnalysisProgressMessageSchema>;

// ============================================================
// 13. Canon UI copy keys (optional but useful for i18n)
// ============================================================

export const UiCopyKeySchema = z.enum([
  'status.target_scan',
  'status.inference_review',
  'status.competitor_analysis',
  'status.industry_analysis',
  'status.strategy_synthesis',
  'error.url_unreachable',
  'error.competitor_insufficient',
  'error.snapshot_commit_failed',
  'action.retry',
  'action.confirm_and_start',
  'action.edit_assumptions'
]);
export type UiCopyKey = z.infer<typeof UiCopyKeySchema>;

// ============================================================
// 14. Canon example validators
// ============================================================

export function parseProjectSummaryList(input: unknown): ProjectSummaryView[] {
  return z.array(ProjectSummaryViewSchema).parse(input);
}

export function parseProjectDetail(input: unknown): ProjectDetailView {
  return ProjectDetailViewSchema.parse(input);
}

export function parseStartAnalysisRequest(input: unknown): StartAnalysisRequest {
  return StartAnalysisRequestSchema.parse(input);
}

export function parseAnalysisStatusResponse(input: unknown): PollAnalysisStatusResponse {
  return PollAnalysisStatusResponseSchema.parse(input);
}

// ============================================================
// 15. Suggested frontend invariants
// ============================================================

export const FrontendInvariantNotes = {
  preserveSelectedProjectDuringCreate:
    'When + is pressed, keep selected_project_id unchanged until create succeeds and explicit selection intent is resolved.',
  doNotUnmountCentralPanel:
    'Keep the central white panel mounted; swap inner content only.',
  ignoreStaleJobMessages:
    'Any progress/update whose analysis_job_id !== latest_analysis_job_id must not mutate active UI state.',
  commitSnapshotLast:
    'Treat current_snapshot_id as authoritative only after snapshot commit success is confirmed by server.',
  progressIsMonotonic:
    'Never render a lower step index or lower committed phase than the latest server-confirmed milestone.'
} as const;

