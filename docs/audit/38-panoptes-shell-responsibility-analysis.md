# PanoptesShellPage Responsibility Analysis

**Phase:** B-3I  
**対象:** `src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte`  
**判定:** `ACTIVE_CANONICAL` / `SPLIT_BOTH`

## 1. 結論

`PanoptesShellPage`は`/app`と`/app/analysis`の両production routeから同じentry wrapperを経由して到達する現行Shell正本である。dev専用の`PanoptesAppShellDummy`は近似UIだがproduction routeの代替ではなく、duplicate canonicalではない。

分割前は336行で、Page compositionに加えてbootstrap判断、network reconnect、polling開始停止、project/analysis/strategy command、store-to-view mapping、Snapshot表示分岐を直接扱っていた。行数よりも、lifecycle orchestration、server state、UI transient、render compositionの変更理由が一fileに集中している点を問題と判断した。

最終方針は`SPLIT_BOTH`とし、Pageを次の役割へ限定した。

1. controllerを取得してmountする。
2. Svelte store/selectorを購読する。
3. Page-local UI transientを保持する。
4. mapping結果をheader/main surface/modalへ渡す。
5. UI eventをcontroller commandへ接続する。

## 2. Reachability

| Item | Result | Evidence |
| --- | --- | --- |
| Production route | Reachable | `/app`、`/app/analysis`の両方が`PanoptesShellEntryPage`をimport |
| `/app` | Active | `src/routes/app/+page.svelte` |
| `/app/analysis` | Active | `src/routes/app/analysis/+page.svelte` |
| Dynamic import | None | Static importのみ |
| Dev-only | No | production protected routeから到達 |
| Test reference before B-3I | None | B-3Iでcontroller/mapping testを追加 |
| Active wrapper | `PanoptesShellEntryPage.svelte` | dummy fallback snapshotを注入する薄いentry |
| Duplicate shell | None | `PanoptesAppShellDummy.svelte`はdev/preview用の別責務 |
| Documentation canonical | Yes | `frontend-active-graph.md`がprotected route正本として記録 |

**Classification:** `PanoptesShellPage = ACTIVE_CANONICAL`、`PanoptesShellEntryPage = ACTIVE_WRAPPER`。

## 3. 分割前の行数

計測方法は`<script>`/`</script>`、`<style>`/`</style>`を含むblock単位とし、残りをmarkupとした。空行も所属blockへ含める。

| Total | Script | Markup | Style | Comments |
| ---: | ---: | ---: | ---: | ---: |
| 336 | 178 | 106 | 52 | 0 |

Script 178行の中に、5 store群、presentation selector、3 action群、network lifecycle、bootstrap分岐、polling start/stop、8 command handler、view mappingが存在した。

## 4. Responsibility Map

| Responsibility | State before | Side Effect | External Dependency | Recommended / Final Owner |
| --- | --- | --- | --- | --- |
| bootstrap | Pageがstore状態を見て開始判断 | API/store更新 | projects action | Shell controller + projects action |
| active organization | Pageに明示stateなし | route前段でguard | SvelteKit auth context | Route guard / BFF。Pageへ追加しない |
| initial load | project list→detail→pollを開始 | API/store更新 | API client/actions | Shell controller + project action |
| project load | handlerがselect後にstrategy/poll同期 | API/store/localStorage | projects action | Shell controller command |
| analysis load | project detailからruntimeへ同期 | store更新 | project-sync domain | Existing actions/domain |
| snapshot load | detail current/lastStable/fallbackを選択 | None | presentation selector | Selector + Page mapping |
| polling | Pageがstart/syncを呼ぶ | timer/API/store | analysis action | Polling controller |
| polling stop | destroyとterminalで停止 | timer clear/store | analysis action | Polling controller + Shell cleanup |
| retry | Pageがproject有無で分岐 | API/modal/store | analysis/projects action | Shell controller command |
| selected snapshot | 明示IDなし。current/lastStable/fallbackを導出 | None | selector | Presentation selector |
| active tab | Page `$state` | None | Tab UI | Page UI transient |
| modal | open/statusはsession store、draftはPage | Store update | session store/projects action | Page draft + controller modal command |
| action dispatch | Page内8 handlers/callback | API/store | action群 | Shell controller |
| API mapping | Pageはraw responseをparseしない | None | API client/action/domain | Existing API/action/domain |
| error mapping | actionsがnormalize/toast | Toast/store | errors utility | Existing actions; bootstrap statusはcontroller |
| loading | collection/detail/runtime/session storeから導出 | None | stores/selectors | Stores + Main Surface |
| render composition | Pageに全条件とSnapshot markup重複 | None | UI components | Page + `PanoptesShellMainSurface` |
| usage state | Headerがsnapshot metaを表示 | None | Snapshot | Mapping。`getUsageState`はShell未使用 |

## 5. State Audit

### Page-local and reactive state

| State | Mechanism | Classification | Final owner |
| --- | --- | --- | --- |
| `fallbackSnapshot` | prop | server/entry fallback | Entry/Page boundary |
| `activeTab` | `$state` | UI transient | Page |
| `selectedCompetitorId` | `$state` | UI transient / selected entity | Page |
| `draftUrl` | `$state` | UI transient | Page |
| `draftName` | `$state` | UI transient | Page |
| fallback/current snapshot | `$derived` | server state projection | Selector/Page |
| fallback active | `$derived` | presentation state | Page |
| selected plan tasks | `$derived` + pure mapper | view model | Mapping |
| reanalysis disabled | `$derived` + pure mapper | orchestration presentation | Mapping |
| header meta | `$derived` + pure mapper | view model | Mapping |
| competitor/strategy sync | `$effect` | UI selection reconciliation | Controller + Page effect |

### Stores

| Store | Classification | Contents |
| --- | --- | --- |
| `projectCollectionStore` | server state | Project summaries/fetch status |
| `projectDetailStore` | server state | Project/current+stable Snapshot/latest Job/error |
| `analysisRuntimeStore` | orchestration/server projection | active job/progress/inference/polling |
| `sessionUiStore` | UI + orchestration state | selected project/modal/surface/mutation |
| `strategyUiStore` | UI + mutation state | selected plan/phase/task/mutation |
| `notificationStore` | UI transient | Toasts |

### Controller state

| State | Classification | Cleanup/stale rule |
| --- | --- | --- |
| `bootstrapStatus` | orchestration | idle/loading/ready/failed |
| `startPromise` | pending promise | duplicate startを同一promiseへ集約 |
| `detachNetwork` | subscription cleanup | route destroyで一度だけ実行 |
| `destroyed` | lifecycle guard | destroy後のbootstrap/reconnect反映を停止 |
| polling timer | orchestration | stop/destroy/terminalでclear |
| polling in-flight promise | pending promise | overlap requestを拒否 |
| polling generation | stale guard | stop/destroy後のlate resultを無視 |

`context`、`setInterval`、`AbortController`はShellに存在しない。Request timeoutは30秒のraceで扱い、現API clientが`AbortSignal`を受けないためnetwork request自体のabortは行わず、late resultをgeneration/raceで無視する。

## 6. Side-effect Audit

| Side effect | Before owner | Final owner | Decision |
| --- | --- | --- | --- |
| `fetch` | Pageにはなし | `panoptes/api/client.ts` | 維持 |
| API client invocation | actions | actions/polling adapter | Pageへ持たせない |
| BFF call | same-origin client | API client | Pageへ持たせない |
| `setTimeout` polling | analysis action module | polling controller | 抽出 |
| Request timeout | なし | polling controller | 30秒、backoff/retry |
| Network browser events | Pageがattach | Shell controller adapter | cleanup含め抽出 |
| Store subscriptions | Svelte auto subscription | Page/View | compositionに必要な範囲で維持 |
| Navigation | なし | なし | 変更なし |
| `localStorage` | projects action | projects action | selected projectのみ、Pageへ出さない |
| `sessionStorage` | なし | なし | 変更なし |
| `document` | なし | polling delay | hidden tabは10秒backoff |
| `window` | network/localStorage action | 同左 | Pageから除去 |
| Focus | なし | なし | 変更なし |
| Cleanup | Page内inline | controller/polling | detach/stop/stale ignore |

## 7. Bootstrap Flow

```text
Protected Route
  -> PanoptesShellEntryPage (fallback snapshot)
  -> PanoptesShellPage.onMount
  -> Shell Controller.start (duplicate guard)
      -> store hydrated?
         -> Yes: sync polling
         -> No: refresh project list
              -> session/localStorage/first projectを選択
              -> project detail取得
              -> runtime/store hydration
              -> sync polling
```

- Project list→preferred project→detail→pollingは依存関係があるため直列。
- Auth/OrganizationはShell mount前のroute guard責務で、Shellは認証requestを重複しない。
- `startPromise`により同一controllerのduplicate bootstrapを防止。
- Project list失敗はactionがtoastを出し、controllerは`failed`へmappingする。
- List成功・projectなし、またはdetail失敗はpartial resultとしてfallback/empty surfaceを維持する。
- Bootstrap retry methodはtest可能だが、UIに新しいerror designを追加しない条件のため専用buttonへ接続していない。

## 8. Polling Flow

Polling対象はactive Projectのactive AnalysisJob progressである。

| Item | Result after B-3I |
| --- | --- |
| Default interval | 2.5秒 |
| Awaiting confirmation | 6秒 |
| Degraded API | 8秒 |
| Offline/unreachable/hidden tab | 10秒 |
| Start | bootstrap、create、reanalyze、project select、reconnect |
| Stop | no active job、completed、failed、cancelled、commit_failed、snapshot commit、route destroy |
| Request timeout | 30秒後backoff。late responseを無視しretry |
| Request overlap | `inFlight`がある間は新requestを開始しない |
| Stale result | stop/destroy generationとjob/session guardで無視 |
| Background tab | polling間隔を10秒へbackoff |
| Network recovery | online listener→active selection再取得→poll sync |
| Cleanup | scheduled timer clear、listener detach、state update guard |

`setInterval`は使用せず、前requestのdecision後に次の`setTimeout`をscheduleする。

## 9. AnalysisJob State Alignment

Canonical contract:

```text
queued, preparing, crawling, capturing, internal_analysis,
awaiting_confirmation, visual_analysis, llm_analysis, finalizing,
completed, failed, cancelled, timed_out, partially_completed
```

Current frontend mock job status:

```text
queued, running, awaiting_confirmation, completing,
completed, failed, cancelled, commit_failed
```

| Difference | Current handling | Decision |
| --- | --- | --- |
| preparing〜llm_analysis | `running` + `progressPhase`/visible stepへ圧縮 | B-3Iではcontract変更なし |
| finalizing | `completing` / `committing_snapshot`表示 | UI aliasとして維持 |
| timed_out | frontend job unionに存在しない | API接続前にmapping追加が必要 |
| partially_completed | frontend job unionに存在しない | Product/UI表示判断が必要 |
| commit_failed | frontend mock固有 | UIではfailed terminalとして扱う |
| awaiting_confirmation | canonicalと対応 | polling継続、6秒interval |

B-3IではRails/OpenAPI/canonical stateを変更せず、差分を明示する。実BFF接続前にcanonical response→UI runtime mappingを独立taskとして実施する。

## 10. API / BFF Boundary

- PageからRails URL、Supabase business access、raw `fetch`、raw response parsingは行っていない。
- Page→Shell controller→existing actions→`panoptesApiClient`の方向へ統一した。
- `panoptesApiClient`はsame-origin pathとmock backendを切り替える。
- Current clientの`/api/project/...`等はlegacy/mock surfaceであり、A-5/R-1のcanonical `/api/panoptes/v1` BFFへ未接続である。
- Active Organizationはroute guardで検証されるが、Shell business requestへ明示Organization contextを渡す実装はまだない。
- Rails/OpenAPI/BFF endpointは今回変更していない。

## 11. Selected Snapshot / UI State

明示的な`selectedSnapshotId`は存在しない。表示Snapshotはselectorが次の優先順位で決める。

```text
reanalysis中のlastStableSnapshot
  -> currentSnapshot
  -> lastStableSnapshot
  -> entry fallbackSnapshot
```

Pageにはactive tab、selected competitor、create draftを残した。Selected project、strategy plan/phase/task、modal open/mutationは既存storeを正本とし、server stateとPage-local draftを区別した。

## 12. Final Structure

```text
Route
  -> PanoptesShellEntryPage (ACTIVE_WRAPPER)
      -> PanoptesShellPage (ACTIVE_CANONICAL / composition)
          -> Shell Controller Adapter
              -> Pure Shell Controller
              -> actions / stores
              -> Polling Controller
              -> API client / mock or BFF
          -> Shell View Model mapping
          -> PanoptesShellMainSurface
              -> Analysis Surface / Overlay
              -> Snapshot Surface
```

Dependency詳細は[Panoptes Shell Flow](../architecture/panoptes-shell-flow.md)を正本とする。

## 13. Deferred

- Canonical AnalysisJob stateの完全mapping (`timed_out` / `partially_completed`を含む)。
- Canonical BFF `/api/panoptes/v1`へのbusiness client接続。
- Active Organizationをbusiness requestへ渡す契約。
- `AbortSignal`対応と実network request cancel。
- Bootstrap failure専用UI、component testing library、visual regression。
- Responsive/mobile overflow、layout/design変更。

