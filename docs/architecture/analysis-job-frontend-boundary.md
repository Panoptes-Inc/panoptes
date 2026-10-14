# AnalysisJob Frontend Boundary

Status: Phase B-3J

## 1. Canonical Flow

```text
Organization-scoped Canonical BFF (future connection)
  -> Canonical AnalysisJob response
  -> adaptCanonicalAnalysisJob
       - validate state and required identity
       - map status / phase / progress / timestamps
       - derive terminal / confirmation / partial / failure category
       - fail safely on unknown or malformed values
  -> AnalysisJobRuntimeModel
  -> polling decision helper
  -> existing Panoptes store projection
  -> Panoptes Shell / analysis flow / Snapshot surface
```

B-3Jはadapterまでを実装し、Canonical BFFへのrequest接続は行っていない。

## 2. Current Legacy Flow

```text
Panoptes API client (same-origin legacy path)
  -> PanoptesPollProgressResult
  -> adaptFrontendPollProgress
  -> stale / monotonic guard
  -> runtime + project stores
  -> resolveAnalysisPollingDecision
  -> continue / stop
  -> UI
```

Polling controllerはtimer、overlap、timeout、cleanupのみを所有し、raw statusの意味を知らない。

## 3. Mock Flow

```text
Mock StoredJob
  - public statuses
  - mock-only commit_failed
  -> adaptMockAnalysisJob
       commit_failed -> failed + snapshot_commit_failed
  -> public PanoptesAnalysisJob / ProgressResult
  -> same frontend adapter, store, polling and UI
```

Mock-only statusはMock backend moduleの外へ出さない。

## 4. Runtime Model

```ts
type AnalysisJobRuntimeStatus =
	| 'running'
	| 'awaiting_confirmation'
	| 'completed'
	| 'partially_completed'
	| 'failed'
	| 'cancelled'
	| 'timed_out';
```

Runtime modelはcanonical `phase`を別fieldで保持する。UIの`bootstrapping / committing_snapshot / waiting_for_inference_confirmation`は引き続きpresentation projectionであり、backend state machineの複製ではない。

## 5. Dependency Direction

```text
features/analysis-job/types
  <- mapping/analysis-job-status
  <- adapter/analysis-job-adapter

panoptes/api/mock
  -> mock adapter only

panoptes/actions/analysis
  -> frontend boundary adapter
  -> polling controller
  -> stores/domain

Page / component
  -> stores and view model
  X raw API model
  X canonical enum branching
```

Rules:

- Canonical API typeとUI/store typeをaliasしない。
- Page/componentはcanonical raw valueを解釈しない。
- Terminal判定を個々のaction/store/componentにhard-codeしない。
- AdapterはOrganization IDを推測しない。
- Unknown valueをcompletedとして扱わない。

## 6. Terminal Flow

```text
completed / failed / cancelled / timed_out / partially_completed
  -> terminal=true
  -> polling stop
  -> stale response guard remains active
  -> existing safe UI projection
```

`partially_completed`のbusiness semanticsとSnapshot policyはadapterから分離し、BFF本接続前に決定する。

## 7. Organization Boundary

```text
Route guard
  -> authenticated organization context
  -> future BFF command path / authorization
  -> canonical response organization_id
  -> adapter mapping only
```

Adapterはauthorizationを代替しない。Organization IDのrequest scopeとresponse resource照合はfuture BFF/command layerが所有する。
