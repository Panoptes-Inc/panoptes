# AnalysisJob Runtime Mapping Audit

Status: Phase B-3J canonical frontend boundary

## 1. Conclusion

Canonical API modelと現行Panoptes UI modelは同一typeにせず、`Canonical API response -> AnalysisJob adapter -> runtime model -> polling/store/UI`を正本とする。Canonical BFFは未接続のため、B-3Jでは変換境界とpure testを実装し、現行legacy/mock pollingも公開frontend statusへ正規化してから判定する。

## 2. Canonical States

```text
queued
preparing
crawling
capturing
internal_analysis
awaiting_confirmation
visual_analysis
llm_analysis
finalizing
completed
failed
cancelled
timed_out
partially_completed
```

Canonical terminalは`completed / failed / cancelled / timed_out / partially_completed`。`awaiting_confirmation`はnon-terminal business pauseである。Rails、OpenAPI、state machineは変更していない。

## 3. Frontend State Inventory

| Frontend State | Used Where | Source | Canonical Equivalent | Action |
| --- | --- | --- | --- | --- |
| `idle` | UI runtime/store | no active job | none | UI-onlyとして維持 |
| `queued` | job status | legacy/mock response | `queued` | public job statusとして維持 |
| `running` | job/runtime | legacy/mock + UI | 中間phase | UIへ圧縮 |
| `bootstrapping` | UI runtime | `target_scan` projection | queued/preparing/crawling/capturing | UI-onlyとして維持 |
| `awaiting_confirmation` | job/pipeline | API/mock | same | 6秒polling、confirmation可 |
| `waiting_for_inference_confirmation` | UI runtime | store projection | `awaiting_confirmation` | UI-only alias |
| `completing` | job status | legacy/mock | `finalizing` | compatibility alias |
| `committing_snapshot` | UI runtime | store projection | `finalizing` | UI-only alias |
| `completed` | job/runtime | API/mock | `completed` | terminal |
| `partially_completed` | public job/runtime adapter | canonical | same | terminal、warning、Snapshot semantics TBD |
| `failed` | job/runtime | API/mock | `failed` | terminal、existing retry UI |
| `cancelled` | job status | API/mock | `cancelled` | terminal、existing failed presentation |
| `timed_out` | public job/runtime adapter | canonical | same | terminal、existing failed/retry presentation |
| `commit_failed` | mock stored job only | mock ticker fixture | canonical `failed` + error code | mock境界で`failed`へ変換 |

Productionの`PanoptesAnalysisJobStatus`から`commit_failed`を除き、`timed_out`と`partially_completed`を追加した。`commit_failed`はMock stored typeにだけ残る。

## 4. Canonical to Runtime Mapping

| Canonical | Runtime status | Runtime phase | Terminal | Confirmation |
| --- | --- | --- | ---: | ---: |
| `queued` | `running` | `queued` | No | No |
| `preparing` | `running` | `preparing` | No | No |
| `crawling` | `running` | `crawling` | No | No |
| `capturing` | `running` | `capturing` | No | No |
| `internal_analysis` | `running` | `internal_analysis` | No | No |
| `awaiting_confirmation` | `awaiting_confirmation` | same | No | Yes |
| `visual_analysis` | `running` | `visual_analysis` | No | No |
| `llm_analysis` | `running` | `llm_analysis` | No | No |
| `finalizing` | `running` | `finalizing` | No | No |
| `completed` | `completed` | `completed` | Yes | No |
| `failed` | `failed` | `failed` | Yes | No |
| `cancelled` | `cancelled` | `cancelled` | Yes | No |
| `timed_out` | `timed_out` | `timed_out` | Yes | No |
| `partially_completed` | `partially_completed` | same | Yes | No |

UI state machineにcanonicalの中間stateを増やさず、runtime `status=running`とcanonical `phase`を分離した。

## 5. Adapter Responsibilities

- Canonical statusのallow-list検証。
- Runtime status / canonical phaseの分離。
- `progress_percent`を0〜100へ安全にclamp。
- `started_at / finished_at / updated_at`のoptional mapping。
- APIの`retryable`をそのまま保持し、frontendでbackend retry policyを作らない。
- terminal、confirmation、partial、committed Snapshot ID、failure categoryの導出。
- Provider/server raw statusやraw messageをUIに出さない。
- Unknown/malformedをterminal `failed` + safe messageへ変換し、diagnostic codeをcallbackへ残す。

OpenAPIにないlocalized status message、analysis session ID、visible stepはcanonical adapterで推測生成しない。

## 6. `timed_out`

- Canonical/Frontend runtimeともterminal。
- Pollingは即時停止。HTTP polling request自体の30秒timeoutとは別概念。
- 現行UIでは`failed`表示に安全にprojectionし、`job_timed_out`の固定messageを使う。
- Existing reanalysis actionとの整合のみ行い、backend retryabilityはAPI値から補完しない。
- Stale job/session guardを通過した結果だけを適用する。

## 7. `partially_completed`

- Canonical/Frontend runtimeともterminal、polling停止。
- Mappingは正式対応し、現行UIではcompleted-compatible surface + warning toastに留める。
- `committed_snapshot_id`はruntime modelに保持するが、Project `current_snapshot_id`更新方針は推測しない。
- Snapshotのusable section、warning内容、retry/reanalysis product policyはTBD。

**Frontend mapping supported / Business semantics TBD.**

## 8. `commit_failed`

Final decision: `MOCK_ONLY + MAP_TO_FAILED`.

- `StoredJob`だけが`commit_failed`を保持できる。
- Mock response作成時に`failed + snapshot_commit_failed`へ変換。
- Public `PanoptesAnalysisJobStatus`から削除。
- Canonical adapterは`commit_failed`をunknownとしてfailed-safe mappingする。
- Rails/OpenAPI/canonical stateには追加しない。

## 9. Terminal and Polling

Terminal判定は`analysis-job-status.ts`の共通helperへ集約した。

```text
API / Mock result
  -> boundary adapter
  -> public frontend status
  -> stale/monotonic guard
  -> terminal helper
  -> store update
  -> continue / stop
```

`running / queued / completing`は2.5秒、`awaiting_confirmation`は6秒で継続。Canonical terminal 5 stateは停止する。Polling controller自体はraw API stateを解釈しない。

## 10. Progress

Canonical adapterが読むのはOpenAPIに存在する`progress_percent`、`phase`、timestamps、retryable、error、committed Snapshot IDだけである。`phase`がcanonical state外のsubphaseならraw値をUIへ流さず、validated statusをfallback phaseとする。

## 11. Organization Scope

Adapterはresponse内の`organization_id`をmappingするだけで、global state、selected organization、projectからOrganization IDを推測しない。RequestのOrganization scope、membership、resource authorizationはfuture canonical BFF/command boundaryの責務とする。

## 12. Mock Boundary

```text
Mock fixture / StoredJob (commit_failed allowed)
  -> adaptMockAnalysisJob
  -> public PanoptesAnalysisJob (failed + snapshot_commit_failed)
  -> same store / polling / UI
```

Mock-only fieldsとstatusをcanonical adapterへ混入させない。

## 13. Deferred

- Canonical `/api/panoptes/v1` business BFFとの実接続。
- Organization-scoped command/requestとresponse ID照合。
- `partially_completed`のSnapshot昇格、usable section、warning detail、retry policy。
- Canonical `phase` subphaseとPanoptes visible stepの正式mapping。
- Adapter diagnosticのproduction observability接続。
