-- Panoptes DB Migration v3.3 Complete
-- Target: PostgreSQL 15+ / Supabase-compatible
-- Purpose:
--   - Panoptes Master Specification v3.3 Stability Hardened に準拠した基盤スキーマ
--   - project / snapshot / analysis_job / progress / strategy task を安全に保持
--   - stale job overwrite 防止、step単調増加、snapshot commit 整合性を DB 側でも補強
-- Notes:
--   - snake_case canon
--   - server-only write を前提にしており、RLS は read中心に定義
--   - 直接 UPDATE ではなく helper function の利用を推奨

begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

-- =========================================================
-- 1. Shared helpers
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.panoptes_phase_to_step_index(p_phase text)
returns integer
language sql
immutable
as $$
  select case p_phase
    when 'target_scan' then 1
    when 'inference_review' then 2
    when 'competitor_analysis' then 3
    when 'industry_analysis' then 4
    when 'strategy_synthesis' then 5
    else null
  end
$$;

create or replace function public.panoptes_step_index_matches_phase(p_phase text, p_step integer)
returns boolean
language sql
immutable
as $$
  select public.panoptes_phase_to_step_index(p_phase) = p_step
$$;

-- =========================================================
-- 2. Enums
-- =========================================================

create type public.member_role as enum (
  'owner',
  'admin',
  'member',
  'viewer'
);

create type public.plan_code as enum (
  'free',
  'starter',
  'growth',
  'enterprise'
);

create type public.project_status as enum (
  'ready',
  'creating',
  'queued',
  'analyzing',
  'awaiting_confirmation',
  'completing',
  'completed',
  'failed',
  'empty'
);

create type public.analysis_job_status as enum (
  'queued',
  'running',
  'awaiting_confirmation',
  'completing',
  'completed',
  'failed',
  'cancelled',
  'commit_failed'
);

create type public.progress_phase as enum (
  'target_scan',
  'inference_review',
  'competitor_analysis',
  'industry_analysis',
  'strategy_synthesis'
);

create type public.snapshot_status as enum (
  'draft',
  'committing',
  'committed',
  'failed'
);

create type public.strategy_status_label as enum (
  'not_started',
  'improving',
  'stable',
  'rework_required'
);

create type public.phase_code as enum (
  'day_30',
  'day_60',
  'day_90'
);

create type public.phase_task_status as enum (
  'todo',
  'in_progress',
  'blocked',
  'done',
  'cancelled'
);

create type public.audit_action as enum (
  'waitlist_approval',
  'admin_action',
  'project_delete',
  'reanalysis_trigger',
  'strategy_selection',
  'task_status_change'
);

-- =========================================================
-- 3. Org / member / plan / usage
-- =========================================================

create table public.orgs (
  org_id uuid primary key default gen_random_uuid(),
  org_name text not null,
  slug citext unique,
  plan_code public.plan_code not null default 'free',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_orgs_updated_at
before update on public.orgs
for each row execute function public.set_updated_at();

create table public.org_members (
  org_member_id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(org_id) on delete cascade,
  user_id uuid not null,
  role public.member_role not null default 'member',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index idx_org_members_user_id on public.org_members(user_id);
create index idx_org_members_org_active on public.org_members(org_id, is_active);

create trigger trg_org_members_updated_at
before update on public.org_members
for each row execute function public.set_updated_at();

create table public.org_usage_monthly (
  org_usage_monthly_id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(org_id) on delete cascade,
  usage_month date not null,
  analysis_run_count integer not null default 0 check (analysis_run_count >= 0),
  llm_input_tokens bigint not null default 0 check (llm_input_tokens >= 0),
  llm_output_tokens bigint not null default 0 check (llm_output_tokens >= 0),
  screenshot_count integer not null default 0 check (screenshot_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, usage_month)
);

create trigger trg_org_usage_monthly_updated_at
before update on public.org_usage_monthly
for each row execute function public.set_updated_at();

-- =========================================================
-- 4. Site entity
-- =========================================================

create table public.site_entities (
  site_entity_id uuid primary key default gen_random_uuid(),
  normalized_url text not null unique,
  canonical_host text not null,
  canonical_domain text,
  robots_checked_at timestamptz,
  robots_status_code integer,
  reachability_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_site_entities_host on public.site_entities(canonical_host);

create trigger trg_site_entities_updated_at
before update on public.site_entities
for each row execute function public.set_updated_at();

-- =========================================================
-- 5. Projects
-- =========================================================

create table public.projects (
  project_id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(org_id) on delete cascade,
  site_entity_id uuid references public.site_entities(site_entity_id) on delete set null,
  project_name text not null,
  target_url text not null,
  normalized_target_url text not null,
  project_status public.project_status not null default 'empty',
  current_snapshot_id uuid null,
  latest_analysis_job_id uuid null,
  latest_analysis_session_id uuid null,
  current_strategy_plan_id uuid null,
  strategy_status_label public.strategy_status_label null,
  selected_strategy_key text null,
  archived_at timestamptz null,
  created_by uuid null,
  updated_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_projects_target_url_not_blank check (length(btrim(target_url)) > 0),
  constraint chk_projects_normalized_target_url_not_blank check (length(btrim(normalized_target_url)) > 0)
);

create index idx_projects_org_id on public.projects(org_id);
create index idx_projects_org_updated_at on public.projects(org_id, updated_at desc);
create index idx_projects_org_status on public.projects(org_id, project_status);
create index idx_projects_latest_analysis_job_id on public.projects(latest_analysis_job_id);
create index idx_projects_current_snapshot_id on public.projects(current_snapshot_id);
create index idx_projects_latest_analysis_session_id on public.projects(latest_analysis_session_id);

create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

-- URL単位の重複を完全禁止まではしないが、同一org内の同一URL多重乱立は抑える
create unique index uq_projects_org_normalized_url_active
on public.projects(org_id, normalized_target_url, coalesce(archived_at, 'infinity'::timestamptz));

-- =========================================================
-- 6. Analysis jobs
-- =========================================================

create table public.analysis_jobs (
  analysis_job_id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(project_id) on delete cascade,
  org_id uuid not null references public.orgs(org_id) on delete cascade,
  analysis_session_id uuid not null default gen_random_uuid(),
  job_generation integer not null,
  job_status public.analysis_job_status not null default 'queued',
  progress_phase public.progress_phase not null default 'target_scan',
  progress_step_index integer not null default 1 check (progress_step_index between 1 and 5),
  progress_percent numeric(5,2) null check (progress_percent is null or (progress_percent >= 0 and progress_percent <= 100)),
  is_waiting_user_confirmation boolean not null default false,
  waiting_correction_payload jsonb,
  started_at timestamptz not null default now(),
  phase_started_at timestamptz not null default now(),
  phase_completed_at timestamptz null,
  finished_at timestamptz null,
  failure_code text null,
  failure_message text null,
  failure_payload jsonb null,
  idempotency_key text null,
  retry_of_job_id uuid null references public.analysis_jobs(analysis_job_id) on delete set null,
  triggered_by uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_analysis_jobs_phase_step_match check (public.panoptes_step_index_matches_phase(progress_phase::text, progress_step_index)),
  constraint chk_analysis_jobs_waiting_vs_status check (
    (job_status = 'awaiting_confirmation' and is_waiting_user_confirmation = true)
    or
    (job_status <> 'awaiting_confirmation')
  )
);

create unique index uq_analysis_jobs_project_generation
on public.analysis_jobs(project_id, job_generation);

create unique index uq_analysis_jobs_project_idempotency
on public.analysis_jobs(project_id, idempotency_key)
where idempotency_key is not null;

create unique index uq_analysis_jobs_session_id
on public.analysis_jobs(analysis_session_id);

create index idx_analysis_jobs_project_started_desc
on public.analysis_jobs(project_id, started_at desc);

create index idx_analysis_jobs_project_status
on public.analysis_jobs(project_id, job_status, started_at desc);

create index idx_analysis_jobs_org_id on public.analysis_jobs(org_id);

create trigger trg_analysis_jobs_updated_at
before update on public.analysis_jobs
for each row execute function public.set_updated_at();

create or replace function public.panoptes_enforce_analysis_job_update()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    -- step monotonic rule
    if new.progress_step_index < old.progress_step_index then
      raise exception 'progress_step_index cannot decrease (% -> %)', old.progress_step_index, new.progress_step_index;
    end if;

    -- phase/step consistency
    if not public.panoptes_step_index_matches_phase(new.progress_phase::text, new.progress_step_index) then
      raise exception 'progress_phase and progress_step_index mismatch: %, %', new.progress_phase, new.progress_step_index;
    end if;

    -- terminal guard
    if old.job_status in ('completed', 'failed', 'cancelled', 'commit_failed') then
      if new.job_status <> old.job_status
         or new.progress_step_index <> old.progress_step_index
         or new.progress_phase <> old.progress_phase then
        raise exception 'terminal analysis_job cannot be mutated';
      end if;
    end if;

    -- finished_at consistency
    if new.job_status in ('completed', 'failed', 'cancelled', 'commit_failed') and new.finished_at is null then
      new.finished_at := now();
    end if;

    if new.job_status = 'awaiting_confirmation' then
      new.is_waiting_user_confirmation := true;
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_analysis_jobs_enforce_update
before update on public.analysis_jobs
for each row execute function public.panoptes_enforce_analysis_job_update();

-- =========================================================
-- 7. Progress events
-- =========================================================

create table public.analysis_progress_events (
  analysis_progress_event_id uuid primary key default gen_random_uuid(),
  analysis_job_id uuid not null references public.analysis_jobs(analysis_job_id) on delete cascade,
  project_id uuid not null references public.projects(project_id) on delete cascade,
  org_id uuid not null references public.orgs(org_id) on delete cascade,
  analysis_session_id uuid not null,
  progress_phase public.progress_phase not null,
  progress_step_index integer not null check (progress_step_index between 1 and 5),
  progress_percent numeric(5,2) null check (progress_percent is null or (progress_percent >= 0 and progress_percent <= 100)),
  event_kind text not null,
  event_message text null,
  event_payload jsonb null,
  created_at timestamptz not null default now(),
  constraint chk_analysis_progress_events_phase_step_match check (public.panoptes_step_index_matches_phase(progress_phase::text, progress_step_index))
);

create index idx_analysis_progress_events_job_created_at
on public.analysis_progress_events(analysis_job_id, created_at asc);

create index idx_analysis_progress_events_session_created_at
on public.analysis_progress_events(analysis_session_id, created_at asc);

-- =========================================================
-- 8. Snapshot header / payload
-- =========================================================

create table public.analysis_snapshot_headers (
  snapshot_id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(project_id) on delete cascade,
  org_id uuid not null references public.orgs(org_id) on delete cascade,
  source_analysis_job_id uuid not null references public.analysis_jobs(analysis_job_id) on delete restrict,
  analysis_session_id uuid not null,
  snapshot_status public.snapshot_status not null default 'draft',
  snapshot_version integer not null,
  target_url text not null,
  normalized_target_url text not null,
  industry_label text null,
  structure_type_label text null,
  site_scale_label text null,
  inference_confidence_overall numeric(5,2) null check (inference_confidence_overall is null or (inference_confidence_overall >= 0 and inference_confidence_overall <= 100)),
  analysis_started_at timestamptz not null,
  analysis_finished_at timestamptz null,
  committed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, snapshot_version),
  unique (source_analysis_job_id)
);

create index idx_snapshot_headers_project_created_desc
on public.analysis_snapshot_headers(project_id, created_at desc);

create index idx_snapshot_headers_project_status
on public.analysis_snapshot_headers(project_id, snapshot_status, created_at desc);

create trigger trg_snapshot_headers_updated_at
before update on public.analysis_snapshot_headers
for each row execute function public.set_updated_at();

create table public.analysis_snapshot_payloads (
  snapshot_payload_id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null unique references public.analysis_snapshot_headers(snapshot_id) on delete cascade,
  payload_schema_version text not null default 'v1',
  competitors_payload jsonb not null,
  industry_payload jsonb not null,
  self_payload jsonb not null,
  strategy_payload jsonb not null,
  panoai_context_payload jsonb not null,
  engine_summary_payload jsonb not null,
  ui_view_payload jsonb not null,
  created_at timestamptz not null default now(),
  constraint chk_snapshot_payload_objects check (
    jsonb_typeof(competitors_payload) = 'object'
    and jsonb_typeof(industry_payload) = 'object'
    and jsonb_typeof(self_payload) = 'object'
    and jsonb_typeof(strategy_payload) = 'object'
    and jsonb_typeof(panoai_context_payload) = 'object'
    and jsonb_typeof(engine_summary_payload) = 'object'
    and jsonb_typeof(ui_view_payload) = 'object'
  )
);

-- =========================================================
-- 9. Strategy plan / phase tasks / transitions
-- =========================================================

create table public.strategy_plans (
  strategy_plan_id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.analysis_snapshot_headers(snapshot_id) on delete cascade,
  project_id uuid not null references public.projects(project_id) on delete cascade,
  org_id uuid not null references public.orgs(org_id) on delete cascade,
  selected_strategy_key text null,
  selected_strategy_title text null,
  strategy_status_label public.strategy_status_label null,
  recommended_strategy_payload jsonb not null,
  plan_summary_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (snapshot_id)
);

create index idx_strategy_plans_project_id on public.strategy_plans(project_id);
create trigger trg_strategy_plans_updated_at
before update on public.strategy_plans
for each row execute function public.set_updated_at();

create table public.phase_tasks (
  phase_task_id uuid primary key default gen_random_uuid(),
  strategy_plan_id uuid not null references public.strategy_plans(strategy_plan_id) on delete cascade,
  snapshot_id uuid not null references public.analysis_snapshot_headers(snapshot_id) on delete cascade,
  project_id uuid not null references public.projects(project_id) on delete cascade,
  org_id uuid not null references public.orgs(org_id) on delete cascade,
  phase_code public.phase_code not null,
  task_order integer not null check (task_order >= 1),
  task_title text not null,
  task_detail text null,
  task_status public.phase_task_status not null default 'todo',
  due_at timestamptz null,
  started_at timestamptz null,
  completed_at timestamptz null,
  blocked_reason text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (strategy_plan_id, phase_code, task_order)
);

create index idx_phase_tasks_project_phase on public.phase_tasks(project_id, phase_code, task_order);
create index idx_phase_tasks_project_status on public.phase_tasks(project_id, task_status);
create trigger trg_phase_tasks_updated_at
before update on public.phase_tasks
for each row execute function public.set_updated_at();

create or replace function public.panoptes_enforce_phase_task_update()
returns trigger
language plpgsql
as $$
begin
  if new.task_status = 'in_progress' and new.started_at is null then
    new.started_at := now();
  end if;

  if new.task_status = 'done' and new.completed_at is null then
    new.completed_at := now();
  end if;

  if new.task_status <> 'done' and old.task_status = 'done' then
    new.completed_at := old.completed_at;
  end if;

  return new;
end;
$$;

create trigger trg_phase_tasks_enforce_update
before update on public.phase_tasks
for each row execute function public.panoptes_enforce_phase_task_update();

create table public.phase_task_transitions (
  phase_task_transition_id uuid primary key default gen_random_uuid(),
  phase_task_id uuid not null references public.phase_tasks(phase_task_id) on delete cascade,
  project_id uuid not null references public.projects(project_id) on delete cascade,
  org_id uuid not null references public.orgs(org_id) on delete cascade,
  old_status public.phase_task_status,
  new_status public.phase_task_status not null,
  changed_by uuid null,
  transition_note text null,
  created_at timestamptz not null default now()
);

create index idx_phase_task_transitions_task_created_at
on public.phase_task_transitions(phase_task_id, created_at desc);

create or replace function public.panoptes_log_phase_task_transition()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.task_status is distinct from old.task_status then
    insert into public.phase_task_transitions (
      phase_task_id,
      project_id,
      org_id,
      old_status,
      new_status,
      changed_by
    ) values (
      new.phase_task_id,
      new.project_id,
      new.org_id,
      old.task_status,
      new.task_status,
      null
    );
  end if;
  return new;
end;
$$;

create trigger trg_phase_tasks_log_transition
after update on public.phase_tasks
for each row execute function public.panoptes_log_phase_task_transition();

-- =========================================================
-- 10. Audit
-- =========================================================

create table public.audit_logs (
  audit_log_id uuid primary key default gen_random_uuid(),
  org_id uuid null references public.orgs(org_id) on delete cascade,
  project_id uuid null references public.projects(project_id) on delete cascade,
  actor_user_id uuid null,
  action public.audit_action not null,
  target_table text null,
  target_id uuid null,
  action_payload jsonb null,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_org_created_desc on public.audit_logs(org_id, created_at desc);
create index idx_audit_logs_project_created_desc on public.audit_logs(project_id, created_at desc);

-- =========================================================
-- 11. FK backfills that require forward references
-- =========================================================

alter table public.projects
  add constraint fk_projects_current_snapshot
  foreign key (current_snapshot_id)
  references public.analysis_snapshot_headers(snapshot_id)
  on delete set null;

alter table public.projects
  add constraint fk_projects_latest_analysis_job
  foreign key (latest_analysis_job_id)
  references public.analysis_jobs(analysis_job_id)
  on delete set null;

alter table public.projects
  add constraint fk_projects_current_strategy_plan
  foreign key (current_strategy_plan_id)
  references public.strategy_plans(strategy_plan_id)
  on delete set null;

-- =========================================================
-- 12. Core safety functions
-- =========================================================

-- 最新job generation を採番して analysis_job を作る helper
create or replace function public.panoptes_create_analysis_job(
  p_project_id uuid,
  p_org_id uuid,
  p_triggered_by uuid default null,
  p_idempotency_key text default null,
  p_retry_of_job_id uuid default null
)
returns public.analysis_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project public.projects;
  v_next_generation integer;
  v_existing public.analysis_jobs;
  v_job public.analysis_jobs;
begin
  select * into v_project
  from public.projects
  where project_id = p_project_id
    and org_id = p_org_id
  for update;

  if not found then
    raise exception 'project not found for org';
  end if;

  if p_idempotency_key is not null then
    select * into v_existing
    from public.analysis_jobs
    where project_id = p_project_id
      and idempotency_key = p_idempotency_key;

    if found then
      return v_existing;
    end if;
  end if;

  select coalesce(max(job_generation), 0) + 1
    into v_next_generation
  from public.analysis_jobs
  where project_id = p_project_id;

  insert into public.analysis_jobs (
    project_id,
    org_id,
    job_generation,
    job_status,
    progress_phase,
    progress_step_index,
    progress_percent,
    triggered_by,
    idempotency_key,
    retry_of_job_id
  ) values (
    p_project_id,
    p_org_id,
    v_next_generation,
    'queued',
    'target_scan',
    1,
    null,
    p_triggered_by,
    p_idempotency_key,
    p_retry_of_job_id
  ) returning * into v_job;

  update public.projects
  set latest_analysis_job_id = v_job.analysis_job_id,
      latest_analysis_session_id = v_job.analysis_session_id,
      project_status = 'queued'
  where project_id = p_project_id;

  return v_job;
end;
$$;

-- analysis_job progress を安全更新
create or replace function public.panoptes_update_analysis_job_progress(
  p_analysis_job_id uuid,
  p_job_status public.analysis_job_status,
  p_progress_phase public.progress_phase,
  p_progress_step_index integer,
  p_progress_percent numeric default null,
  p_failure_code text default null,
  p_failure_message text default null,
  p_failure_payload jsonb default null,
  p_is_waiting_user_confirmation boolean default false,
  p_waiting_correction_payload jsonb default null,
  p_event_kind text default null,
  p_event_message text default null,
  p_event_payload jsonb default null
)
returns public.analysis_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.analysis_jobs;
  v_project public.projects;
begin
  select * into v_job
  from public.analysis_jobs
  where analysis_job_id = p_analysis_job_id
  for update;

  if not found then
    raise exception 'analysis_job not found';
  end if;

  if v_job.job_status in ('completed', 'failed', 'cancelled', 'commit_failed') then
    return v_job;
  end if;

  update public.analysis_jobs
  set job_status = p_job_status,
      progress_phase = p_progress_phase,
      progress_step_index = p_progress_step_index,
      progress_percent = p_progress_percent,
      failure_code = p_failure_code,
      failure_message = p_failure_message,
      failure_payload = p_failure_payload,
      is_waiting_user_confirmation = p_is_waiting_user_confirmation,
      waiting_correction_payload = p_waiting_correction_payload,
      phase_started_at = case
        when progress_phase is distinct from p_progress_phase then now()
        else phase_started_at
      end,
      phase_completed_at = case
        when progress_phase is distinct from p_progress_phase then now()
        else phase_completed_at
      end,
      finished_at = case
        when p_job_status in ('completed', 'failed', 'cancelled', 'commit_failed') then coalesce(finished_at, now())
        else null
      end
  where analysis_job_id = p_analysis_job_id
  returning * into v_job;

  update public.projects
  set project_status = case p_job_status
        when 'queued' then 'queued'
        when 'running' then 'analyzing'
        when 'awaiting_confirmation' then 'awaiting_confirmation'
        when 'completing' then 'completing'
        when 'completed' then 'completed'
        when 'failed' then 'failed'
        when 'commit_failed' then 'failed'
        when 'cancelled' then 'failed'
        else project_status
      end
  where project_id = v_job.project_id
    and latest_analysis_job_id = v_job.analysis_job_id;

  if p_event_kind is not null then
    insert into public.analysis_progress_events (
      analysis_job_id,
      project_id,
      org_id,
      analysis_session_id,
      progress_phase,
      progress_step_index,
      progress_percent,
      event_kind,
      event_message,
      event_payload
    ) values (
      v_job.analysis_job_id,
      v_job.project_id,
      v_job.org_id,
      v_job.analysis_session_id,
      p_progress_phase,
      p_progress_step_index,
      p_progress_percent,
      p_event_kind,
      p_event_message,
      p_event_payload
    );
  end if;

  return v_job;
end;
$$;

-- snapshot を atomic に commit。
-- current_snapshot_id は latest_analysis_job_id 一致時のみ更新。
create or replace function public.panoptes_commit_snapshot(
  p_analysis_job_id uuid,
  p_target_url text,
  p_normalized_target_url text,
  p_industry_label text,
  p_structure_type_label text,
  p_site_scale_label text,
  p_inference_confidence_overall numeric,
  p_competitors_payload jsonb,
  p_industry_payload jsonb,
  p_self_payload jsonb,
  p_strategy_payload jsonb,
  p_panoai_context_payload jsonb,
  p_engine_summary_payload jsonb,
  p_ui_view_payload jsonb,
  p_recommended_strategy_payload jsonb,
  p_plan_summary_payload jsonb,
  p_phase_tasks_payload jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.analysis_jobs;
  v_project public.projects;
  v_snapshot_id uuid;
  v_strategy_plan_id uuid;
  v_next_snapshot_version integer;
  v_task jsonb;
begin
  select * into v_job
  from public.analysis_jobs
  where analysis_job_id = p_analysis_job_id
  for update;

  if not found then
    raise exception 'analysis_job not found';
  end if;

  select * into v_project
  from public.projects
  where project_id = v_job.project_id
  for update;

  if not found then
    raise exception 'project not found';
  end if;

  -- stale job overwrite prevention
  if v_project.latest_analysis_job_id is distinct from v_job.analysis_job_id then
    raise exception 'stale job cannot commit snapshot';
  end if;

  update public.analysis_jobs
  set job_status = 'completing',
      progress_phase = 'strategy_synthesis',
      progress_step_index = 5,
      progress_percent = coalesce(progress_percent, 100)
  where analysis_job_id = p_analysis_job_id;

  update public.projects
  set project_status = 'completing'
  where project_id = v_project.project_id
    and latest_analysis_job_id = v_job.analysis_job_id;

  select coalesce(max(snapshot_version), 0) + 1
    into v_next_snapshot_version
  from public.analysis_snapshot_headers
  where project_id = v_project.project_id;

  insert into public.analysis_snapshot_headers (
    project_id,
    org_id,
    source_analysis_job_id,
    analysis_session_id,
    snapshot_status,
    snapshot_version,
    target_url,
    normalized_target_url,
    industry_label,
    structure_type_label,
    site_scale_label,
    inference_confidence_overall,
    analysis_started_at,
    analysis_finished_at,
    committed_at
  ) values (
    v_project.project_id,
    v_project.org_id,
    v_job.analysis_job_id,
    v_job.analysis_session_id,
    'committing',
    v_next_snapshot_version,
    p_target_url,
    p_normalized_target_url,
    p_industry_label,
    p_structure_type_label,
    p_site_scale_label,
    p_inference_confidence_overall,
    v_job.started_at,
    now(),
    null
  ) returning snapshot_id into v_snapshot_id;

  insert into public.analysis_snapshot_payloads (
    snapshot_id,
    competitors_payload,
    industry_payload,
    self_payload,
    strategy_payload,
    panoai_context_payload,
    engine_summary_payload,
    ui_view_payload
  ) values (
    v_snapshot_id,
    p_competitors_payload,
    p_industry_payload,
    p_self_payload,
    p_strategy_payload,
    p_panoai_context_payload,
    p_engine_summary_payload,
    p_ui_view_payload
  );

  insert into public.strategy_plans (
    snapshot_id,
    project_id,
    org_id,
    recommended_strategy_payload,
    plan_summary_payload
  ) values (
    v_snapshot_id,
    v_project.project_id,
    v_project.org_id,
    p_recommended_strategy_payload,
    p_plan_summary_payload
  ) returning strategy_plan_id into v_strategy_plan_id;

  if jsonb_typeof(p_phase_tasks_payload) = 'array' then
    for v_task in
      select value from jsonb_array_elements(p_phase_tasks_payload)
    loop
      insert into public.phase_tasks (
        strategy_plan_id,
        snapshot_id,
        project_id,
        org_id,
        phase_code,
        task_order,
        task_title,
        task_detail,
        task_status,
        due_at,
        blocked_reason
      ) values (
        v_strategy_plan_id,
        v_snapshot_id,
        v_project.project_id,
        v_project.org_id,
        (v_task->>'phase_code')::public.phase_code,
        coalesce((v_task->>'task_order')::integer, 1),
        coalesce(v_task->>'task_title', 'Untitled task'),
        v_task->>'task_detail',
        coalesce((v_task->>'task_status')::public.phase_task_status, 'todo'),
        nullif(v_task->>'due_at', '')::timestamptz,
        v_task->>'blocked_reason'
      );
    end loop;
  else
    raise exception 'p_phase_tasks_payload must be json array';
  end if;

  -- commit完了順序: payload/plan/task → snapshot_status → project.current_snapshot_id → job completed
  update public.analysis_snapshot_headers
  set snapshot_status = 'committed',
      committed_at = now()
  where snapshot_id = v_snapshot_id;

  update public.projects
  set current_snapshot_id = v_snapshot_id,
      current_strategy_plan_id = v_strategy_plan_id,
      project_status = 'completed'
  where project_id = v_project.project_id
    and latest_analysis_job_id = v_job.analysis_job_id;

  update public.analysis_jobs
  set job_status = 'completed',
      progress_phase = 'strategy_synthesis',
      progress_step_index = 5,
      progress_percent = 100,
      is_waiting_user_confirmation = false,
      phase_completed_at = now(),
      finished_at = now()
  where analysis_job_id = v_job.analysis_job_id;

  return v_snapshot_id;
exception
  when others then
    update public.analysis_jobs
    set job_status = 'commit_failed',
        failure_code = coalesce(failure_code, 'snapshot_commit_failed'),
        failure_message = sqlerrm,
        finished_at = now()
    where analysis_job_id = p_analysis_job_id;

    update public.projects
    set project_status = 'failed'
    where project_id = (select project_id from public.analysis_jobs where analysis_job_id = p_analysis_job_id)
      and latest_analysis_job_id = p_analysis_job_id;

    raise;
end;
$$;

-- strategy selection を project current state に反映
create or replace function public.panoptes_select_strategy(
  p_project_id uuid,
  p_strategy_plan_id uuid,
  p_selected_strategy_key text,
  p_selected_strategy_title text,
  p_strategy_status_label public.strategy_status_label default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.strategy_plans
  set selected_strategy_key = p_selected_strategy_key,
      selected_strategy_title = p_selected_strategy_title,
      strategy_status_label = p_strategy_status_label
  where strategy_plan_id = p_strategy_plan_id
    and project_id = p_project_id;

  update public.projects
  set current_strategy_plan_id = p_strategy_plan_id,
      selected_strategy_key = p_selected_strategy_key,
      strategy_status_label = p_strategy_status_label
  where project_id = p_project_id;
end;
$$;

-- =========================================================
-- 13. Derived views
-- =========================================================

create or replace view public.project_summary_view as
select
  p.project_id,
  p.org_id,
  p.project_name,
  p.target_url,
  p.current_snapshot_id,
  p.latest_analysis_job_id,
  aj.job_status as latest_job_status,
  (p.current_snapshot_id is not null) as has_snapshot,
  p.project_status as project_display_state,
  aj.progress_phase as current_progress_phase,
  greatest(1, (current_date - p.created_at::date) + 1) as day_count,
  p.strategy_status_label,
  p.created_at,
  p.updated_at
from public.projects p
left join public.analysis_jobs aj
  on aj.analysis_job_id = p.latest_analysis_job_id;

create or replace view public.analysis_progress_state_view as
select
  aj.analysis_job_id,
  aj.project_id,
  aj.analysis_session_id,
  aj.job_status,
  aj.progress_phase,
  aj.progress_step_index,
  aj.progress_percent,
  aj.phase_started_at,
  aj.phase_completed_at,
  aj.is_waiting_user_confirmation,
  aj.failure_code,
  aj.failure_message,
  (aj.job_status in ('completed', 'failed', 'cancelled', 'commit_failed')) as is_terminal
from public.analysis_jobs aj;

-- =========================================================
-- 14. RLS: read-safe default, write server-only
-- =========================================================

alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.org_usage_monthly enable row level security;
alter table public.site_entities enable row level security;
alter table public.projects enable row level security;
alter table public.analysis_jobs enable row level security;
alter table public.analysis_progress_events enable row level security;
alter table public.analysis_snapshot_headers enable row level security;
alter table public.analysis_snapshot_payloads enable row level security;
alter table public.strategy_plans enable row level security;
alter table public.phase_tasks enable row level security;
alter table public.phase_task_transitions enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_active_org_member(p_org_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.org_members om
    where om.org_id = p_org_id
      and om.user_id = auth.uid()
      and om.is_active = true
  )
$$;

-- read policies
create policy orgs_select_member on public.orgs
for select using (public.is_active_org_member(org_id));

create policy org_members_select_member on public.org_members
for select using (public.is_active_org_member(org_id));

create policy org_usage_select_member on public.org_usage_monthly
for select using (public.is_active_org_member(org_id));

create policy site_entities_select_via_project_member on public.site_entities
for select using (
  exists (
    select 1
    from public.projects p
    where p.site_entity_id = site_entities.site_entity_id
      and public.is_active_org_member(p.org_id)
  )
);

create policy projects_select_member on public.projects
for select using (public.is_active_org_member(org_id));

create policy analysis_jobs_select_member on public.analysis_jobs
for select using (public.is_active_org_member(org_id));

create policy analysis_progress_events_select_member on public.analysis_progress_events
for select using (public.is_active_org_member(org_id));

create policy snapshot_headers_select_member on public.analysis_snapshot_headers
for select using (public.is_active_org_member(org_id));

create policy snapshot_payloads_select_member on public.analysis_snapshot_payloads
for select using (
  exists (
    select 1
    from public.analysis_snapshot_headers sh
    where sh.snapshot_id = analysis_snapshot_payloads.snapshot_id
      and public.is_active_org_member(sh.org_id)
  )
);

create policy strategy_plans_select_member on public.strategy_plans
for select using (public.is_active_org_member(org_id));

create policy phase_tasks_select_member on public.phase_tasks
for select using (public.is_active_org_member(org_id));

create policy phase_task_transitions_select_member on public.phase_task_transitions
for select using (public.is_active_org_member(org_id));

create policy audit_logs_select_member on public.audit_logs
for select using (org_id is not null and public.is_active_org_member(org_id));

-- server-only write: クライアントからの insert/update/delete は許可しない
-- 必要な書き込みは security definer function 経由 or service_role 経由で行う

-- =========================================================
-- 15. Helpful comments
-- =========================================================

comment on table public.projects is 'Panoptes project root. current_snapshot_id is nullable by design.';
comment on column public.projects.current_snapshot_id is 'Must remain null until snapshot payload / strategy_plan / phase_tasks commit succeeds.';
comment on table public.analysis_jobs is 'One analysis execution. progress_step_index must be monotonic.';
comment on table public.analysis_snapshot_headers is 'One committed analysis result per snapshot.';
comment on function public.panoptes_commit_snapshot(uuid,text,text,text,text,text,numeric,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb) is 'Atomic snapshot commit with stale job guard.';

commit;
