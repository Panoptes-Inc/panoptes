# Panoptes Shell Flow

**Status:** Phase B-3I canonical frontend flow  
**Scope:** `/app`、`/app/analysis`、Shell controller、stores、polling、Snapshot surface

## 1. Ownership

| Layer              | Owner responsibility                                        | Must not own                       |
| ------------------ | ----------------------------------------------------------- | ---------------------------------- |
| Route guard        | Auth、active Organization membership、secure default        | Shell UI state、analysis polling   |
| Entry wrapper      | fallback Snapshot注入                                       | bootstrap/polling/action           |
| Shell Page         | composition、store subscription、UI transient、event wiring | raw fetch、timer、response parsing |
| Main Surface       | render mode、Analysis/Snapshot composition                  | API、store mutation、polling       |
| Shell Controller   | lifecycle、bootstrap gate、reconnect、command orchestration | markup/style、raw HTTP             |
| Controller Adapter | existing action/storeをcontroller dependencyへ接続          | Product UI                         |
| Actions / Domain   | API command、store transition、error mapping                | Page composition                   |
| Polling Controller | schedule、overlap、timeout、stale/cleanup                   | Snapshot markup                    |
| API Client         | same-origin request、contract key mapping、mock switch      | UI selection                       |
| Stores / Selectors | server/UI state正本、presentation derivation                | Browser event lifecycle            |

## 2. Route and Render Flow

```text
/app OR /app/analysis
  -> Auth + Organization guard
  -> PanoptesShellEntryPage
       fallbackSnapshot
  -> PanoptesShellPage
       UI transient: activeTab / competitor / create drafts
       Store projections: project / runtime / strategy / session
  -> PanoptesShellMainSurface
       empty_state
       analysis_flow
       failed_state
       snapshot_dashboard + optional overlay
  -> PanoptesSnapshotSurface / PanoptesAnalysisSurface
```

`/app`と`/app/analysis`は同じShell canonicalを共有する。Route差で別controllerやduplicate pollingは作らない。

## 3. Bootstrap Data Flow

```text
onMount
  -> controller.mount
       -> attach online/offline listeners
       -> controller.start (single in-flight promise)
            -> hydrated stores?
               YES -> syncActivePolling
               NO  -> bootstrapPanoptesShell
                        -> API client.listProjects
                        -> projectCollectionStore
                        -> preferred project
                           session -> localStorage -> first item
                        -> API client.getProjectDetail
                        -> projectDetailStore
                        -> analysisRuntimeStore
                        -> sessionUiStore
                        -> syncActivePolling
```

Bootstrapはauth/Organizationを取得しない。protected routeが先に検証する。Business dataのOrganization scopeはfuture canonical BFF contractで補完する。

## 4. Polling Flow

```text
create / reanalyze / select project / reconnect / bootstrap
  -> syncActivePolling
  -> AnalysisPollingController.runNow
       -> canPoll? / online? / inFlight?
       -> API client.pollAnalysisProgress
       -> timeout race (30s)
       -> progress payload
            -> stale job/session guard
            -> runtime + project + collection stores
            -> terminal?
               completed snapshot -> reconcile detail -> stop
               failed/cancelled/commit_failed -> stop
               active -> schedule next
       -> error/timeout -> degraded + toast + backoff
```

Polling interval:

```text
foreground/reachable  2.5s
awaiting confirmation 6s
degraded              8s
offline/hidden        10s
```

Requestは重複実行しない。`stop`/destroy後のlate resultはgenerationで無視する。Server-side `timed_out`と`partially_completed`のUI mappingは未実装であり、canonical contract接続前の必須課題である。

## 5. Command Flow

```text
Child event
  -> Page callback
  -> Shell Controller command
  -> Existing action
  -> API client
  -> Store transition
  -> Selector / mapping
  -> Child props
```

Commands:

- create project + start analysis
- retry / reanalyze
- confirm inference
- select project
- select strategy
- select phase/task
- update task status
- open/close create flow
- update inference draft

## 6. Snapshot Selection Flow

```text
projectDetailStore + analysisRuntimeStore
  -> currentRenderableSnapshot selector
       active reanalysis + stable snapshot -> lastStableSnapshot
       otherwise currentSnapshot -> lastStableSnapshot
  -> Page fallback only when selector returns null
  -> strategy/competitor mapping
  -> Main Surface
  -> Snapshot Surface props
```

明示的なSnapshot履歴選択UIはなく、`selectedSnapshotId`も存在しない。Current/stable/fallbackはpresentation selectorの責務である。

## 7. Error and Cleanup Flow

```text
API error
  -> normalizePanoptesError / action-specific message
  -> store mutation state
  -> toast or failed surface

route destroy
  -> network listener detach
  -> polling timer clear
  -> generation increment
  -> late response ignored
```

Raw error objectをPage/childへ渡さない。Bootstrap total failureはcontroller statusへ記録されるが、B-3Iでは新しいerror UIを追加していない。

## 8. Dependency Rules

Allowed:

```text
Route -> Entry -> Page -> Feature View / Controller Adapter
Controller Adapter -> Pure Controller + Actions/Stores
Actions -> Domain + API Client + Stores
Polling Adapter -> Pure Polling Controller
Selectors/Mapping -> Types/Stores
```

Forbidden:

```text
Main Surface -> API Client
Page -> raw fetch / Rails URL / Supabase business query
Pure Controller -> SvelteKit environment / API client
Polling Controller -> Svelte component
Domain -> Page/View
```

## 9. Related Canonical Documents

- [Frontend Active Graph](./frontend-active-graph.md)
- [API Boundary](./api-boundary.md)
- [Analysis Job State Machine](../api/analysis-job-state-machine.md)
- [Responsibility Analysis](../audit/38-panoptes-shell-responsibility-analysis.md)
- [B-3I Refactor Record](../audit/39-phase-b3i-panoptes-shell-refactor.md)
