# Panoptes API Contract v3.3 Complete

Source alignment:
- Panoptes Master Specification v3.3 Stability Hardened
- Panoptes DB Migration v3.3 Complete
- Panoptes TypeScript / Zod v3.3 Complete

---

## 0. Role of this document

This document is the implementation contract for Panoptes MVP APIs.
It fixes the boundary between frontend, API server, worker, and database.

Primary goals:
- keep the URL-input → progress panel → snapshot completion flow stable
- prevent stale job overwrite, duplicate create, invalid progress rollback, and race conditions
- make the central white panel auto-advance only on server-confirmed milestones
- ensure every UI state can be restored from API + DB truth after refresh or reconnect

This contract is subordinate to the master spec, and operationalizes it.

---

## 1. Global contract rules

### 1.1 Naming
- Request / response JSON uses `snake_case`
- DB column names use `snake_case`
- Path parameters use lowercase snake or kebab only where framework constraints require it

### 1.2 Transport
- Content-Type: `application/json`
- UTF-8
- HTTPS only in production

### 1.3 Envelope
All endpoints return one of the following envelopes.

Success:
```json
{
  "ok": true,
  "data": {}
}
```

Error:
```json
{
  "ok": false,
  "error": {
    "code": "validation_error",
    "message": "Human-readable summary",
    "details": null,
    "request_id": "optional-trace-id"
  }
}
```

### 1.4 Error codes
Canonical `error.code` values:
- `validation_error`
- `unauthorized`
- `forbidden`
- `not_found`
- `conflict`
- `stale_job`
- `invalid_transition`
- `already_running`
- `rate_limited`
- `quota_exceeded`
- `server_error`

### 1.5 Authentication / authorization
- Every endpoint requires an authenticated org member except public waitlist flows
- Authorization is org-scoped
- The server must resolve the caller’s effective role before any write
- A project, job, snapshot, task, or strategy belonging to another org must be hidden as `not_found`

### 1.6 Request tracing
Every response may include a server-generated `request_id` in the error body and/or response header.
Recommended headers:
- `x-request-id`
- `x-idempotency-status`: `new | replayed | conflict`

### 1.7 Time format
All timestamps are ISO-8601 with timezone offset.
Example:
`2026-03-13T12:34:56+09:00`

### 1.8 Idempotency
The following write endpoints must accept `idempotency_key`:
- create-and-start-analysis
- analysis start retry / retry
- reanalyze

Rules:
- same authenticated user + same org + same endpoint + same idempotency_key within retention window returns the original successful response
- if payload differs for the same live idempotency key, return `409 conflict`
- create endpoints must never create duplicate projects or jobs due to double-click / network replay

### 1.9 Canonical visible steps
Panoptes user-facing flow has 5 fixed steps:
1. `target_scan`
2. `inference_review`
3. `competitor_analysis`
4. `industry_analysis`
5. `strategy_synthesis`

`progress_step_index` mapping:
- `target_scan` => 1
- `inference_review` => 2
- `competitor_analysis` => 3
- `industry_analysis` => 4
- `strategy_synthesis` => 5

### 1.10 Progress monotonicity
- `progress_step_index` must never decrease for the same `analysis_job_id`
- `progress_percent` should be non-decreasing within a job where available
- terminal job states are immutable except for server-side read-only enrichment

### 1.11 Stale protection
Frontend must ignore status / progress responses when either of these is true:
- `analysis_job_id` does not match the project’s current `latest_analysis_job_id`
- `analysis_session_id` does not match the currently active client session for that panel

Server must also block stale writes at commit boundaries.

---

## 2. Domain model summary used by the API

Important records surfaced by the API:
- `project`
- `project_summary`
- `analysis_job`
- `progress_state`
- `runtime_state`
- `snapshot_view_payload`
- `strategy_plan`
- `phase_task`
- `phase_task_transition`
- `usage_state`

Important nullable rule:
- `current_snapshot_id` is formally nullable
- a project with `current_snapshot_id = null` is valid and must render as `empty`, `analyzing`, or `failed`

Important job states:
- `queued`
- `running`
- `awaiting_confirmation`
- `completing`
- `completed`
- `failed`
- `cancelled`
- `commit_failed`

Important project display states:
- `empty`
- `analyzing`
- `failed`
- `ready`

---

## 3. Common response fragments

### 3.1 `project_summary`
Minimum fields expected by the shell and right-side project list:
```json
{
  "project_id": "uuid",
  "project_name": "Acme JP",
  "target_url": "https://example.com",
  "project_status": "analyzing",
  "project_display_state": "analyzing",
  "latest_analysis_job_id": "uuid",
  "current_snapshot_id": null,
  "selected_strategy_key": null,
  "last_failure_code": null,
  "last_failure_message": null,
  "updated_at": "2026-03-13T12:34:56+09:00"
}
```

### 3.2 `progress_state`
```json
{
  "project_id": "uuid",
  "analysis_job_id": "uuid",
  "analysis_session_id": "uuid",
  "job_status": "running",
  "progress_phase": "competitor_analysis",
  "progress_step_index": 3,
  "progress_percent": 48,
  "phase_started_at": "2026-03-13T12:34:56+09:00",
  "phase_completed_at": null,
  "is_waiting_user_confirmation": false,
  "failure_code": null,
  "failure_message": null,
  "is_terminal": false
}
```

### 3.3 `runtime_state`
Runtime-only UI helper state. This is not raw engine output.
```json
{
  "visible_step": "competitor_analysis",
  "visible_step_index": 3,
  "can_auto_advance_panel": true,
  "should_preserve_current_panel_mount": true,
  "stale_response_ignored": false,
  "current_snapshot_ready": false,
  "recommended_poll_interval_ms": 2500
}
```

### 3.4 `ui_step_panel`
Server-computed panel state for the central white panel.
```json
{
  "visible_step": "inference_review",
  "title": "業界・構造タイプ自動推定",
  "subtitle": null,
  "mode": "review",
  "primary_action": "start_competitor_analysis",
  "secondary_action": "correct_inference",
  "is_blocking": true,
  "is_transitioning": false
}
```

### 3.5 `snapshot_view_payload`
Dashboard payload from committed snapshot only.
Contains all tab-ready, precomputed display data:
- competitors
- industry
- self
- strategy
- panoai_context

The UI must not recalculate engine results from this payload.

---

## 4. Endpoint inventory

Required MVP endpoints:
- `POST /api/project/create`
- `POST /api/project/select`
- `POST /api/project/create-and-start-analysis`
- `POST /api/project/:project_id/inference/confirm`
- `POST /api/project/:project_id/inference/correct`
- `POST /api/analysis/start`
- `GET /api/analysis/:job_id`
- `GET /api/analysis/:job_id/progress`
- `GET /api/project/:project_id/dashboard`
- `POST /api/project/:project_id/strategy/select`
- `POST /api/project/:project_id/reanalyze`
- `POST /api/strategy/task/update-status`
- `GET /api/project/list`
- `GET /api/usage/current`

Recommended companion endpoints for resilience:
- `GET /api/project/:project_id`
- `POST /api/project/:project_id/retry`
- `POST /api/analysis/:job_id/cancel`
- `GET /api/project/:project_id/runtime-state`

---

## 5. Detailed endpoint contracts

## 5.1 POST `/api/project/create`

### Purpose
Create a project shell without starting analysis.
Used for advanced flows, drafts, or admin tooling.

### Request
```json
{
  "org_id": "uuid",
  "project_name": "Acme JP",
  "target_url": "https://example.com"
}
```

### Success `200`
```json
{
  "ok": true,
  "data": {
    "project": {
      "project_id": "uuid",
      "project_status": "empty",
      "current_snapshot_id": null
    },
    "project_summary": {
      "project_id": "uuid",
      "project_display_state": "empty"
    }
  }
}
```

### Notes
- `selected_project_id` must not change automatically just because shell creation succeeded
- safe even if project has no snapshot and no job

---

## 5.2 POST `/api/project/select`

### Purpose
Persist or synchronize project selection for the shell.
Optional server-backed selection state.

### Request
```json
{
  "project_id": "uuid",
  "selected_snapshot_id": null,
  "active_tab": "strategy"
}
```

### Success `200`
```json
{
  "ok": true,
  "data": {
    "selected_project_id": "uuid",
    "selected_snapshot_id": null,
    "active_tab": "strategy",
    "project_summary": {
      "project_id": "uuid",
      "project_display_state": "analyzing"
    }
  }
}
```

### Rules
- selecting a project with `current_snapshot_id = null` is valid
- UI must render nullable-safe shell instead of erroring

---

## 5.3 POST `/api/project/create-and-start-analysis`

### Purpose
Primary MVP entrypoint from URL input.
Atomically performs:
- project creation
- first analysis job issuance
- bootstrap crawl start

### Request
```json
{
  "org_id": "uuid",
  "project_name": "Acme JP",
  "target_url": "https://example.com",
  "normalized_target_url": "https://example.com/",
  "idempotency_key": "client-generated-uuid-or-hash",
  "auto_select_after_create": false,
  "preserve_current_selection": true
}
```

### Success `200`
```json
{
  "ok": true,
  "data": {
    "project": {
      "project_id": "uuid",
      "project_name": "Acme JP",
      "project_status": "queued",
      "current_snapshot_id": null,
      "latest_analysis_job_id": "uuid"
    },
    "project_summary": {
      "project_id": "uuid",
      "project_display_state": "analyzing",
      "current_snapshot_id": null,
      "latest_analysis_job_id": "uuid"
    },
    "analysis_job": {
      "analysis_job_id": "uuid",
      "analysis_session_id": "uuid",
      "job_status": "queued",
      "progress_phase": "target_scan",
      "progress_step_index": 1
    },
    "runtime_state": {
      "visible_step": "target_scan",
      "visible_step_index": 1,
      "can_auto_advance_panel": true,
      "should_preserve_current_panel_mount": true,
      "current_snapshot_ready": false,
      "recommended_poll_interval_ms": 2000
    },
    "selection_hint": {
      "selected_project_id_should_change": false,
      "selected_project_id": null,
      "pending_created_project_id": "uuid"
    }
  }
}
```

### Hard rules
- same idempotency key must not create duplicate project or duplicate first job
- server may return a replayed success for safe retries
- `current_snapshot_id` must remain null until commit succeeds
- the shell may choose not to switch selection immediately

### Typical error cases
- `409 conflict`: same target already being created under incompatible idempotency payload
- `429 rate_limited`
- `402/403 quota_exceeded` depending on billing model

---

## 5.4 POST `/api/project/:project_id/inference/confirm`

### Purpose
Resume pipeline after user accepts or edits inference review.
This corresponds to the second panel state.

### Request
```json
{
  "project_id": "uuid",
  "analysis_job_id": "uuid",
  "inferred_industry": "SaaS for support teams",
  "inferred_structure_type": "saas",
  "inferred_site_scale": "medium",
  "confirmed_at_client": "2026-03-13T12:34:56+09:00",
  "user_override_note": null
}
```

### Success `200`
```json
{
  "ok": true,
  "data": {
    "analysis_job": {
      "analysis_job_id": "uuid",
      "job_status": "running",
      "progress_phase": "competitor_analysis",
      "progress_step_index": 3
    },
    "progress_state": {
      "project_id": "uuid",
      "analysis_job_id": "uuid",
      "analysis_session_id": "uuid",
      "job_status": "running",
      "progress_phase": "competitor_analysis",
      "progress_step_index": 3,
      "is_waiting_user_confirmation": false,
      "is_terminal": false
    },
    "ui_step_panel": {
      "visible_step": "competitor_analysis",
      "mode": "loading",
      "is_blocking": true,
      "is_transitioning": true
    }
  }
}
```

### Error cases
- `409 stale_job` if analysis_job_id is not latest
- `409 invalid_transition` if job is not in awaiting confirmation state
- `410 conflict` or `409 conflict` when confirmation window expired, depending on implementation

---

## 5.5 POST `/api/project/:project_id/inference/correct`

### Purpose
Alternative to confirm flow when user intentionally edits inference values before continuing.

### Request
Same schema as confirm, but semantically requires modified values.

### Success
Same shape as confirm response.

### Rule
Server must store corrected values as authoritative pipeline inputs for the remainder of the job.

---

## 5.6 POST `/api/analysis/start`

### Purpose
Start analysis for an existing empty or failed project shell.
Secondary entrypoint.

### Request
```json
{
  "project_id": "uuid",
  "idempotency_key": "uuid",
  "reason": "manual_start"
}
```

### Success `200`
Returns the same core shape as retry / reanalyze:
- `project`
- `analysis_job`
- `runtime_state`
- `project_summary`

### Rules
- must fail with `already_running` if a non-terminal latest job already exists
- safe for a project with `current_snapshot_id = null`

---

## 5.7 GET `/api/analysis/:job_id`

### Purpose
Read analysis job detail.
Useful for worker dashboards or recovery.

### Success `200`
```json
{
  "ok": true,
  "data": {
    "analysis_job": {
      "analysis_job_id": "uuid",
      "project_id": "uuid",
      "analysis_session_id": "uuid",
      "job_status": "running",
      "progress_phase": "industry_analysis",
      "progress_step_index": 4,
      "progress_percent": 76,
      "failure_code": null,
      "failure_message": null,
      "started_at": "2026-03-13T12:34:56+09:00",
      "finished_at": null
    }
  }
}
```

---

## 5.8 GET `/api/analysis/:job_id/progress`

### Purpose
Primary polling endpoint during analysis.
Feeds the central white panel and background runtime state.

### Query parameters
Optional:
- `project_id`
- `known_progress_percent`
- `known_step_index`

### Success `200`
```json
{
  "ok": true,
  "data": {
    "progress_state": {
      "project_id": "uuid",
      "analysis_job_id": "uuid",
      "analysis_session_id": "uuid",
      "job_status": "running",
      "progress_phase": "industry_analysis",
      "progress_step_index": 4,
      "progress_percent": 77,
      "phase_started_at": "2026-03-13T12:34:56+09:00",
      "phase_completed_at": null,
      "is_waiting_user_confirmation": false,
      "failure_code": null,
      "failure_message": null,
      "is_terminal": false
    },
    "ui_step_panel": {
      "visible_step": "industry_analysis",
      "title": "業界構造を分析中です…",
      "mode": "loading",
      "is_blocking": true,
      "is_transitioning": false
    },
    "runtime_state": {
      "visible_step": "industry_analysis",
      "visible_step_index": 4,
      "can_auto_advance_panel": true,
      "should_preserve_current_panel_mount": true,
      "stale_response_ignored": false,
      "current_snapshot_ready": false,
      "recommended_poll_interval_ms": 2500
    },
    "project_summary": {
      "project_id": "uuid",
      "project_display_state": "analyzing",
      "current_snapshot_id": null
    },
    "current_snapshot_ready": false,
    "stale_response_ignored": false
  }
}
```

### Hard rules
- frontend auto-advances panel only from server-confirmed `visible_step`
- `progress_step_index` must be monotonic
- stale job responses must either be blocked server-side or marked with `stale_response_ignored = true`
- panel component should remain mounted; only inner content changes

### Terminal examples
Completed:
- `job_status = completed`
- `is_terminal = true`
- `current_snapshot_ready = true`
- `project_summary.current_snapshot_id != null`

Failure:
- `job_status = failed | cancelled | commit_failed`
- `is_terminal = true`
- `failure_code != null`
- `current_snapshot_ready` may remain false

---

## 5.9 GET `/api/project/:project_id`

### Purpose
Get project shell detail for restore after refresh, route transition, or reconnect.

### Success `200`
```json
{
  "ok": true,
  "data": {
    "project_id": "uuid",
    "project_status": "completed",
    "current_snapshot_id": "uuid",
    "latest_analysis_job_id": "uuid",
    "project_display_state": "ready",
    "last_failure_code": null,
    "last_failure_message": null
  }
}
```

---

## 5.10 GET `/api/project/:project_id/dashboard`

### Purpose
Return committed snapshot display payload for all tabs.
This is the canonical dashboard view endpoint.

### Success `200`
```json
{
  "ok": true,
  "data": {
    "project_summary": {
      "project_id": "uuid",
      "project_display_state": "ready",
      "current_snapshot_id": "uuid",
      "selected_strategy_key": "strategy_b"
    },
    "snapshot_view_payload": {
      "analysis_snapshot_id": "uuid",
      "snapshot_version": 3,
      "competitors": {},
      "industry": {},
      "self": {},
      "strategy": {},
      "panoai_context": {}
    }
  }
}
```

### Rules
- only committed snapshots are eligible
- if no committed snapshot exists, return `404 not_found` or a nullable-safe empty shell response depending on route policy
- UI must not derive engine metrics by itself from lower-level data

---

## 5.11 POST `/api/project/:project_id/strategy/select`

### Purpose
Adopt one strategy from the committed snapshot and persist it as current.

### Request
```json
{
  "project_id": "uuid",
  "analysis_snapshot_id": "uuid",
  "strategy_key": "strategy_b"
}
```

### Success `200`
```json
{
  "ok": true,
  "data": {
    "project": {
      "project_id": "uuid",
      "selected_strategy_key": "strategy_b"
    },
    "selected_strategy_plan": {
      "strategy_plan_id": "uuid",
      "strategy_key": "strategy_b",
      "is_selected": true
    },
    "phase_tasks": [
      {
        "phase_task_id": "uuid",
        "phase_code": "day_30",
        "task_status": "todo",
        "task_title": "Refine positioning hierarchy"
      }
    ],
    "project_summary": {
      "project_id": "uuid",
      "selected_strategy_key": "strategy_b"
    }
  }
}
```

### Rules
- selected strategy must belong to the provided committed snapshot
- changing selected strategy may regenerate or replace current phase task set depending on product policy
- server records audit log for strategy selection

---

## 5.12 POST `/api/project/:project_id/retry`

### Purpose
Retry a failed project from a phase-specific recovery point.

### Request
```json
{
  "project_id": "uuid",
  "idempotency_key": "uuid",
  "retry_from_phase": "industry_analysis",
  "reason": "temporary upstream failure"
}
```

### Success `200`
```json
{
  "ok": true,
  "data": {
    "project": {
      "project_id": "uuid",
      "project_status": "analyzing",
      "latest_analysis_job_id": "uuid"
    },
    "analysis_job": {
      "analysis_job_id": "uuid",
      "job_status": "queued",
      "progress_phase": "industry_analysis",
      "progress_step_index": 4
    },
    "runtime_state": {
      "visible_step": "industry_analysis",
      "visible_step_index": 4,
      "current_snapshot_ready": false
    },
    "project_summary": {
      "project_id": "uuid",
      "project_display_state": "analyzing"
    }
  }
}
```

### Retry policy mapping
- `bootstrap retry`
- `inference retry`
- `competitor crawl retry`
- `synthesis retry`
- `full reanalyze`

### Rules
- old failed snapshot remains intact unless replaced by a later successful commit
- old job terminal records remain immutable

---

## 5.13 POST `/api/project/:project_id/reanalyze`

### Purpose
Start a full new analysis run against an existing project.
Primary path after a completed snapshot already exists.

### Request
```json
{
  "project_id": "uuid",
  "idempotency_key": "uuid",
  "reason": "site updated after redesign"
}
```

### Success `200`
Same shape as retry response.

### Hard rules
- do not delete or unmount old snapshot immediately
- until new commit succeeds, dashboard may continue rendering the old committed snapshot while runtime state indicates new analysis is in progress
- new job becomes `latest_analysis_job_id`
- stale completion from the previous latest job must not overwrite the new run

---

## 5.14 POST `/api/strategy/task/update-status`

### Purpose
Update only a single task state in the 30/60/90 execution UI.

### Request
```json
{
  "phase_task_id": "uuid",
  "to_status": "in_progress",
  "reason": "owner started implementation"
}
```

### Success `200`
```json
{
  "ok": true,
  "data": {
    "phase_task": {
      "phase_task_id": "uuid",
      "task_status": "in_progress",
      "updated_at": "2026-03-13T12:34:56+09:00"
    },
    "transition": {
      "phase_task_transition_id": "uuid",
      "phase_task_id": "uuid",
      "from_status": "todo",
      "to_status": "in_progress",
      "changed_at": "2026-03-13T12:34:56+09:00"
    }
  }
}
```

### Rules
- server auto-records transition log
- invalid transitions may be blocked with `invalid_transition`
- no snapshot recalculation is performed here

---

## 5.15 GET `/api/project/list`

### Purpose
Return right-side project list for the shell.

### Query parameters
- `org_id`
- `include_archived=false`
- `limit=50`
- `cursor=null`

### Success `200`
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "project_id": "uuid",
        "project_name": "Acme JP",
        "project_display_state": "ready",
        "current_snapshot_id": "uuid",
        "latest_analysis_job_id": "uuid",
        "updated_at": "2026-03-13T12:34:56+09:00"
      },
      {
        "project_id": "uuid",
        "project_name": "New Prospect",
        "project_display_state": "analyzing",
        "current_snapshot_id": null,
        "latest_analysis_job_id": "uuid",
        "updated_at": "2026-03-13T12:35:10+09:00"
      }
    ],
    "next_cursor": null
  }
}
```

### Rules
- every card must be nullable-safe
- list response must support projects with no snapshot
- newly created project can be added immediately after create-and-start-analysis success

---

## 5.16 GET `/api/usage/current`

### Purpose
Return current plan / usage state for token- and run-based gating.

### Success `200`
```json
{
  "ok": true,
  "data": {
    "org_id": "uuid",
    "plan_code": "starter",
    "analysis_run_count_current_month": 14,
    "llm_input_tokens_current_month": 125400,
    "llm_output_tokens_current_month": 54420,
    "limits": {
      "analysis_runs": 50,
      "llm_input_tokens": 500000,
      "llm_output_tokens": 250000
    },
    "remaining": {
      "analysis_runs": 36,
      "llm_input_tokens": 374600,
      "llm_output_tokens": 195580
    }
  }
}
```

---

## 5.17 POST `/api/analysis/:job_id/cancel`

### Purpose
Optional resilience endpoint to stop a user-initiated in-flight run.

### Request
```json
{
  "reason": "user_started_newer_run"
}
```

### Success `200`
```json
{
  "ok": true,
  "data": {
    "analysis_job_id": "uuid",
    "job_status": "cancelled",
    "is_terminal": true
  }
}
```

### Rules
- if a newer job already exists, cancelling the older one is safe
- cancellation must not delete previous committed snapshot

---

## 6. UI auto-progress contract for the central white panel

### 6.1 Principle
The central white panel does not determine its next step by timer or frontend guesswork.
It advances only when API responses confirm a new `visible_step`.

### 6.2 Render contract
- keep panel root mounted
- replace internal content only
- avoid height-collapse between loading and review modes
- continue polling even during transition animation

### 6.3 Canonical panel sequence
1. `target_scan`
   - text: `分析対象URLを分析中です…`
2. `inference_review`
   - review card with inferred industry / structure / scale
   - CTA: confirm or correct
3. `competitor_analysis`
   - text: `競合を分析中です…`
4. `industry_analysis`
   - text: `業界構造を分析中です…`
5. `strategy_synthesis`
   - text: `競合×業界×自社の差分を分析中です…`
6. completion handoff
   - transition from blocking panel to dashboard / strategy-ready shell

### 6.4 Waiting state rule
When `is_waiting_user_confirmation = true`:
- panel enters blocking review mode
- automatic advance stops
- polling may continue at a slower interval for timeout / expiry awareness
- retry or correction actions are allowed according to server response

### 6.5 Completion handoff rule
The panel may disappear only when all are true:
- `job_status = completed`
- `is_terminal = true`
- `current_snapshot_ready = true`
- project summary reports non-null `current_snapshot_id`

Do not dismiss the panel on `completing` alone.

### 6.6 Failure handoff rule
If terminal failure occurs:
- keep panel mounted
- swap to failure mode
- show mapped failure message
- expose retry / reanalyze action according to `failure_code`

---

## 7. Failure canon

Canonical pipeline failure codes:
- `url_unreachable`
- `crawl_failed`
- `inference_failed`
- `inference_confirmation_expired`
- `competitor_discovery_failed`
- `competitor_insufficient`
- `competitor_analysis_partial_failure`
- `industry_analysis_failed`
- `strategy_generation_failed`
- `snapshot_commit_failed`
- `job_cancelled`
- `stale_job_ignored`
- `unknown_error`

Suggested user-facing mapping:

| failure_code | User-facing meaning | Suggested action |
|---|---|---|
| `url_unreachable` | 入力URLに到達できませんでした | URL確認 / retry |
| `crawl_failed` | 初回取得に失敗しました | bootstrap retry |
| `inference_failed` | 業界・構造推定に失敗しました | inference retry |
| `inference_confirmation_expired` | 推定確認の有効期限が切れました | retry from inference |
| `competitor_discovery_failed` | 競合候補の抽出に失敗しました | competitor retry |
| `competitor_insufficient` | 十分な競合候補を確保できませんでした | retry / correction |
| `competitor_analysis_partial_failure` | 一部競合の分析に失敗しました | continue / retry |
| `industry_analysis_failed` | 業界構造分析に失敗しました | retry from industry |
| `strategy_generation_failed` | 戦略統合に失敗しました | synthesis retry |
| `snapshot_commit_failed` | 保存処理の最後で失敗しました | commit retry / full retry |
| `job_cancelled` | 分析が中止されました | restart / reanalyze |
| `stale_job_ignored` | 古い分析結果は採用されませんでした | no action |
| `unknown_error` | 不明なエラーが発生しました | full reanalyze |

---

## 8. Race-condition and safety rules

### 8.1 Create flow safety
- clicking `+` must not alter `selected_project_id` by itself
- until create-and-start-analysis succeeds, current project remains mounted
- newly created project may appear in list while current detail pane stays unchanged

### 8.2 Job freshness safety
- every progress write must target the latest mutable job only
- commit operations must verify `latest_analysis_job_id == analysis_job_id`
- otherwise reject as stale

### 8.3 Snapshot commit safety
Commit order:
1. write snapshot payload draft
2. write strategy plans
3. write phase tasks
4. atomically set committed snapshot
5. update project `current_snapshot_id`
6. mark job `completed`

Failure after step 1–4 must not produce a false-ready UI state.

### 8.4 Reanalyze safety
- reanalysis does not immediately remove old committed snapshot
- dashboard can continue showing previous snapshot until new one commits
- only successful new commit updates `current_snapshot_id`

### 8.5 Polling safety
- overlapping poll responses are allowed
- frontend must discard late older responses
- recommended poll interval: 2–3 seconds during active analysis, 5–10 seconds during waiting review

### 8.6 Refresh / reconnect safety
After page refresh, the frontend must reconstruct the shell from:
1. `GET /api/project/:project_id`
2. if latest job is non-terminal, `GET /api/analysis/:job_id/progress`
3. if current snapshot exists, `GET /api/project/:project_id/dashboard`

---

## 9. HTTP status guidelines

Recommended mapping:
- `200 OK`: normal success
- `201 Created`: optional for pure create endpoints
- `400 Bad Request`: malformed request
- `401 Unauthorized`: not authenticated
- `403 Forbidden`: authenticated but lacks access or quota policy forbids
- `404 Not Found`: resource not visible in caller org scope
- `409 Conflict`: invalid transition, duplicate live idempotency, stale write, already running
- `410 Gone`: optional for expired confirmation windows
- `422 Unprocessable Entity`: semantic validation error
- `429 Too Many Requests`: throttled
- `500 Internal Server Error`: unknown server failure
- `503 Service Unavailable`: temporary upstream / worker unavailability

---

## 10. Frontend implementation obligations

The frontend must:
- treat API as source of truth for progress and panel state
- never compute next visible step from local timers alone
- never assume `current_snapshot_id` exists
- render nullable-safe project cards and detail shell
- ignore stale responses from older jobs / sessions
- keep central panel mounted through transitions
- continue polling during animation
- stop blocking mode only when snapshot-ready conditions are satisfied

The frontend must not:
- infer success purely from percent reaching 100
- infer commit success from `completing`
- clear old dashboard immediately on reanalyze
- downgrade progress step index due to late responses

---

## 11. Backend implementation obligations

The backend must:
- enforce job freshness before mutating progress or committing snapshots
- enforce monotonic `progress_step_index`
- return user-facing `progress_state` and `ui_step_panel`
- keep terminal job rows immutable
- guarantee idempotent create/retry/reanalyze
- record strategy selection and task transitions in audit / transition tables
- ensure dashboard returns only committed snapshot payloads

The backend must not:
- expose raw engine internals as dashboard contract
- overwrite `current_snapshot_id` from stale job completion
- mark project ready before committed snapshot exists

---

## 12. Minimum test matrix

### 12.1 Happy paths
- create-and-start-analysis → target_scan → inference_review → confirm → competitor_analysis → industry_analysis → strategy_synthesis → completed
- completed snapshot dashboard load
- strategy selection
- task status update

### 12.2 Failure paths
- unreachable URL
- inference timeout
- competitor insufficient
- industry analysis failure
- snapshot commit failure

### 12.3 Concurrency paths
- double-click create-and-start-analysis with same idempotency key
- double-click with different idempotency key but same project shell
- stale old job finishing after newer reanalysis starts
- two poll responses arriving out of order
- refresh during `industry_analysis`
- refresh during `completing`
- reanalyze while old dashboard remains visible

### 12.4 Nullable-safe paths
- project with no snapshot and no job
- project with failed latest job and old committed snapshot
- project with analyzing latest job and current_snapshot_id still null

---

## 13. Recommended implementation order

1. implement `create-and-start-analysis`
2. implement `analysis/:job_id/progress`
3. implement `project/:project_id/dashboard`
4. implement `inference/confirm`
5. implement `project/list`
6. implement `reanalyze` and `retry`
7. implement `strategy/select`
8. implement `task/update-status`
9. add cancel / runtime-state helpers

This order stabilizes the shell and white-panel experience first.

---

## 14. Final contract summary

The most important Panoptes API rules are:
- project creation and first analysis may be one atomic API
- `current_snapshot_id = null` is always legal
- panel auto-progress is server-confirmed, not guessed
- stale jobs never win
- committed snapshot is the only dashboard truth
- old snapshot remains visible during reanalysis until new commit succeeds
- task updates do not recalculate analysis
- every UI state must be restorable from API + DB truth

