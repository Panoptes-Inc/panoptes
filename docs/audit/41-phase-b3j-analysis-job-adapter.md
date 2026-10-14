# Phase B-3J AnalysisJob Adapter

## 1. Result

Canonical AnalysisJob responseとPanoptes UI runtimeの間にpure adapterを実装した。中間phaseは`running + canonical phase`に分離し、`timed_out`と`partially_completed`をterminalとして正式mapping、`commit_failed`をMock内部に限定した。

## 2. Implementation

- Canonical 14 statesのallow-listとruntime modelを追加。
- State、phase、progress、timestamps、retryability、terminal、confirmation、partial、failure、unknownをadapterでmapping。
- Unknown/missing/malformed responseをcrashさせずterminal failed-safeへ変換。
- Public frontend job unionに`timed_out / partially_completed`を追加し、`commit_failed`を削除。
- Mock stored jobのみ`commit_failed`を許可し、公開responseは`failed + snapshot_commit_failed`へ変換。
- Terminal helperを共通化し、guards、project sync、runtime progress、polling decisionから利用。
- Current polling responseをboundary adapterに通してからstore/polling decisionへ流す。

## 3. Files

### New

- `src/lib/features/analysis-job/types.ts`
- `src/lib/features/analysis-job/mapping/analysis-job-status.ts`
- `src/lib/features/analysis-job/adapter/analysis-job-adapter.ts`
- `src/lib/features/analysis-job/index.ts`
- `tests/unit/analysis-job-adapter.test.ts`
- `docs/audit/40-analysis-job-runtime-mapping.md`
- `docs/architecture/analysis-job-frontend-boundary.md`
- `docs/audit/41-phase-b3j-analysis-job-adapter.md`

### Modified

- `src/lib/panoptes/types.ts`
- `src/lib/panoptes/actions/analysis.ts`
- `src/lib/panoptes/domain/runtime-progress.ts`
- `src/lib/panoptes/domain/project-sync.ts`
- `src/lib/panoptes/utils/guards.ts`
- `src/lib/panoptes/utils/errors.ts`
- `src/lib/panoptes/api/mock/state.ts`
- `src/lib/panoptes/api/mock/runtime-ticker.ts`
- `src/lib/panoptes/api/mock-backend.ts`
- `docs/DEVELOPMENT_LOG.md`

## 4. State Mapping

- `queued/preparing/crawling/capturing/internal_analysis/visual_analysis/llm_analysis/finalizing -> running`
- `awaiting_confirmation -> awaiting_confirmation`
- `completed -> completed`
- `failed -> failed`
- `cancelled -> cancelled`
- `timed_out -> timed_out`
- `partially_completed -> partially_completed`
- Mock `commit_failed -> failed + snapshot_commit_failed`

## 5. Minimal UI Compatibility

- Existing running、confirmation、completed、failed surfaceは変更なし。
- `timed_out`はexisting failed/retry presentationへ安全にprojection。
- `partially_completed`はcompleted-compatible projection + warning toast。
- Layout、color、spacing、typography、card/tab/modal、responsiveは変更なし。

## 6. Tests

Adapter testは以下を検証する。

- Canonical 14 state mapping。
- Canonical/runtime/frontend terminal 5 state。
- Unknown、missing、malformed failed-safe。
- Progress clamp、timestamps、retryable、partial、committed Snapshot ID。
- Mock `commit_failed`隔離とcanonical adapterからの拒否。
- Running/queued/completing/confirmationでpolling継続。
- Completed/failed/cancelled/timed_out/partially_completedでpolling停止。
- Timed out/partial/confirmationのexisting runtime projection。

Final result: 14 test files / 171 tests passed。B-3J追加分は1 file / 43 tests。

## 7. Browser Verification

Development-only mock auth/APIで`/app`と`/app/analysis`を確認するためlocal serverは起動できたが、実行セッションで操作可能なBrowser接続が0件であり、実ブラウザ操作は未実施。Browser skillの接続手順に従って利用可能性を確認し、他のbrowser backendには切り替えなかった。一時serverは停止済み。

Pure integration testでrunning、awaiting confirmation、completed、failed、timed_out、partially_completed、retry可能なfailed presentationとpolling停止を検証し、production routeは`test:smoke`で代替確認する。Browser fixtureによるvisual/console確認はdefer。

## 8. Quality

| Gate | Result |
| --- | --- |
| `npm run check` | PASS、0 errors / 0 warnings |
| `npm run lint` | PASS、0 errors / 58 warnings |
| `npm run format:check` | PASS |
| `npm run check:openapi` | PASS、18 operations / 18 unique operationIds |
| `npm run test` | PASS、14 files / 171 tests |
| `npm run build` | PASS、exit 0 |
| `npm run test:secrets` | PASS、65 build files |
| `npm run test:smoke` | PASS |
| `npm run quality` | PASS、exit 0 |
| Local import graph | 243 files、unresolved 0、cycle 0 |

Route smokeは`/app`と`/app/analysis`の未認証response 303、development-only routeのproduction 404を確認した。

## 9. Contract / Scope

- Rails: 変更なし。
- OpenAPI: 変更なし。
- Canonical state machine: 変更なし。
- Canonical BFF本接続: 未実施。
- Organization guard/scope: 変更なし。
- Supabase、Landing、Contact、Survey、Strategy Plan Rail: 変更なし。

## 10. Deferred

- Canonical BFF本接続とOrganization-scoped command boundary。
- `partially_completed`のproduct semanticsとSnapshot昇格policy。
- Canonical phaseからPanoptes visible stepへの実BFF mapping。
- Adapter diagnosticのobservability接続。
- Browser E2E fixtureによるtimeout/partial/failed visual regression。

## 11. References

- [Runtime Mapping](./40-analysis-job-runtime-mapping.md)
- [Frontend Boundary](../architecture/analysis-job-frontend-boundary.md)
- [Canonical State Machine](../api/analysis-job-state-machine.md)
- [OpenAPI Draft](../api/openapi-draft.yaml)
- [Panoptes Shell Flow](../architecture/panoptes-shell-flow.md)
