# Phase B-3I Panoptes Shell Refactor

## 1. Result

`PanoptesShellPage`を`ACTIVE_CANONICAL`と確認し、`SPLIT_BOTH`を実施した。Pageからbootstrap/network/polling/action orchestrationをcontrollerへ、render分岐をMain Surfaceへ、header/selection計算をpure mappingへ移した。既存store、action、UI、Rails/OpenAPI/Auth/Organization guardは正本として維持した。

## 2. Implementation

### Page / View

- `PanoptesShellPage.svelte`を336行から178行へ縮小。
- Snapshot Surfaceの重複markupをMain Surface内snippetへ統合。
- Page-local stateはactive tab、selected competitor、create draftだけに限定。
- Layout、color、spacing、typography、tab/modal/card designは変更なし。

### Controller / Bootstrap

- Pure Shell controllerとproduction adapterを分離。
- Duplicate bootstrapをsingle in-flight promiseで防止。
- Bootstrap statusをidle/loading/ready/failedで保持。
- Network reconnect、project/create/retry/confirm/strategy/task commandをcontrollerへ集約。
- Pure controllerがSvelteKit env/API clientをimportしないためunit test可能。

### Polling

- Timerとrequest lifecycleを`analysis-polling-controller.ts`へ抽出。
- Overlap request防止、30秒request timeout、late result無視、destroy cleanupを追加。
- Background tabを10秒backoffへ変更。
- Existing interval、progress mapping、toast、stable Snapshot保持を維持。

## 3. Line Count

### Before

| File | Total | Script | Markup | Style | Comments |
| --- | ---: | ---: | ---: | ---: | ---: |
| `PanoptesShellPage.svelte` | 336 | 178 | 106 | 52 | 0 |

### After

| File | Total | Script | Markup | Style | Comments |
| --- | ---: | ---: | ---: | ---: | ---: |
| `PanoptesShellPage.svelte` | 178 | 77 | 64 | 37 | 0 |
| `PanoptesShellMainSurface.svelte` | 154 | 79 | 64 | 11 | 0 |
| Pure Shell controller | 134 | — | — | — | 0 |
| Controller adapter | 61 | — | — | — | 0 |
| Shell view mapping | 60 | — | — | — | 0 |
| Polling controller | 146 | — | — | — | 0 |

行数を別fileへ移したことではなく、View、orchestration、environment adapter、polling lifecycle、pure mappingを独立変更可能にしたことを成果とする。

## 4. New Files

- `src/lib/features/panoptes-shell/components/PanoptesShellMainSurface.svelte`
- `src/lib/features/panoptes-shell/controller/panoptes-shell-controller.ts`
- `src/lib/features/panoptes-shell/controller/panoptes-shell-controller-adapter.ts`
- `src/lib/features/panoptes-shell/mapping/shell-view-model.ts`
- `src/lib/panoptes/polling/analysis-polling-controller.ts`
- `tests/unit/panoptes-shell-controller.test.ts`
- `tests/unit/analysis-polling-controller.test.ts`
- `docs/audit/38-panoptes-shell-responsibility-analysis.md`
- `docs/architecture/panoptes-shell-flow.md`
- `docs/audit/39-phase-b3i-panoptes-shell-refactor.md`

## 5. Modified Files

- `src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte`
- `src/lib/panoptes/actions/analysis.ts`
- `docs/DEVELOPMENT_LOG.md`

## 6. State / Error / Cleanup

- Server stateはexisting project/runtime storesへ維持。
- UI transientはPage、session/strategy UI stateはexisting storesへ維持。
- Raw API errorはPageへ渡さず、existing normalization/toastを使用。
- Polling request timeoutはjobのcanonical `timed_out`へ変換せず、client request failureとしてbackoff/retryする。
- Route destroyでlistener detach、timer stop、late update無視を行う。

## 7. Tests

追加したcontroller tests:

- Bootstrap success / partial / total failure / duplicate start / explicit retry。
- Network/polling cleanup。
- Selected competitor stale reconciliation、strategy task mapping。
- Create/retry action dispatch。
- Polling start / active continue / completed / failed / cancelled。
- Request timeout、overlap防止、offline retry、stale result無視、destroy cleanup。

Final result: 13 test files / 128 tests passed。

## 8. Browser Verification

Development-only `member` mock authとopt-in mock APIを使用し、production guardを迂回せず確認した。

| Check | Result |
| --- | --- |
| Anonymous `/app` | `/login?returnTo=%2Fapp`へredirect |
| `/app` initial Snapshot | PASS |
| Tab switch | Competitor/Strategy切替 PASS |
| Project/Snapshot selection | Panoptes Demo→Nova HR→New Project PASS |
| Reanalysis action | Stable Snapshot維持 + overlay開始 PASS |
| Polling | progress継続→awaiting confirmation→confirm→completedでoverlay停止 PASS |
| Empty state | New ProjectでSnapshotなし/開始CTA PASS |
| `/app/analysis` | Same canonical Shellをrender、PASS |
| Route transition | `/app`→`/app/analysis` PASS |
| Console error/warning | 0 |
| Browser polling error | 未確認。mockにerror fixtureがなく、pure controller testで検証 |

## 9. Quality

| Gate | Result |
| --- | --- |
| `npm run check` | PASS、0 errors / 0 warnings |
| `npm run lint` | PASS、0 errors / 60 warnings |
| `npm run format:check` | PASS |
| `npm run check:openapi` | PASS、18 operations / 18 unique operationIds |
| `npm run test` | PASS、13 files / 128 tests |
| `npm run build` | PASS、exit 0 |
| `npm run test:secrets` | PASS、65 build files |
| `npm run test:smoke` | PASS |
| `npm run quality` | PASS、exit 0 |
| Local import graph | 239 files、unresolved 0、cycle 0 |

`test:smoke`ではproduction境界として`/app`と`/app/analysis`が303、development-only routeが404であることを確認した。Shell本体の操作はSection 8のdevelopment-only mock browser確認で補完した。

## 10. Contract Changes

- Rails: 変更なし。
- OpenAPI: 変更なし。
- Supabase Auth / Organization guard: 変更なし。
- Canonical AnalysisJob state: 変更なし。

## 11. Deferred

- Canonical job stateとfrontend mock/runtime statusの完全mapping。
- BFF canonical business endpointへの接続。
- `AbortSignal`によるnetwork request cancellation。
- Bootstrap専用error/retry UI。
- Component test/browser E2E/visual regressionの自動化。
- Responsive/mobile/design変更。

## 12. References

- [Responsibility Analysis](./38-panoptes-shell-responsibility-analysis.md)
- [Panoptes Shell Flow](../architecture/panoptes-shell-flow.md)
- [Frontend Active Graph](../architecture/frontend-active-graph.md)
- [Analysis Job State Machine](../api/analysis-job-state-machine.md)
