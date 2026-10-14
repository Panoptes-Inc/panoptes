# Phase A-5 現行API・外部I/O棚卸し

実施日: 2026-08-07

関連文書: [API境界](../architecture/api-boundary.md) / [API v1契約](../api/panoptes-api-v1.md) / [Job状態機械](../api/analysis-job-state-machine.md) / [OpenAPI draft](../api/openapi-draft.yaml) / [Rails backlog](17-rails-implementation-backlog.md)

## 結論

現行コードで確認した外部I/Oは、Panoptes業務API client 9操作、waitlist 1操作、Supabase browser Auth 3操作、Supabase server Auth 3操作の合計16操作である。これとは別にOrganization選択のSvelteKit form actionが1操作ある。

指示書の前提は「API client 8 endpoint」だったが、実コードには`getUsageState`を含む9メソッドがある。8メソッドは現行UIから到達し、`getUsageState`だけが未使用である。Panoptes業務APIに対応するSvelteKit `+server` routeは0本で、Mock無効時の9パスはすべて未実装である。したがってproductionでは業務APIが接続済みとは判断できない。

## 到達経路

```text
PanoptesShellPage / PanoptesAnalysisStartSearchBar
  -> actions (projects / analysis / strategy)
  -> panoptesApiClient
  -> development opt-in: mockPanoptesApiClient + localStorage
  -> otherwise: 現在存在しない /api/* route
```

`PanoptesShellPage`は`/app`と`/app/analysis`の両方から到達する。actionはUI event、poll timer、online復帰をcommandへ変換し、store更新とtoastを行う。selectorは表示状態だけを導出し、外部I/Oは行わない。

## Panoptes業務API client一覧

| ID | Method / Current path | Caller / Trigger | Request → Response | Mock | Usage | Auth / Organization | Current error handling | Future owner / Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P01 | GET `/api/project/list` | `refreshProjectList`; shell bootstrap・refresh | none → `{items: ProjectSummary[]}` | `mock-backend.ts`; localStorage | 使用中 | 現在headerなし・scopeなし | network/invalid envelope/API errorをtoast | BFF→Rails。`GET /api/v1/organizations/{org}/projects`へ変更 |
| P02 | GET `/api/project/{projectId}` | `selectProject`, commit reconcile | path project ID → `ProjectDetailView` | 同上 | 使用中 | 現在ownership未検証 | failure時stable selectionを復元 | BFF→Rails。bootstrap viewとして統合維持 |
| P03 | POST `/api/project/create-and-start-analysis` | 検索バー・create modal | URL/name/idempotency/preserve selection → Project+Job | 同上、idempotency再生あり | 使用中・MVP必須 | 現在認証・orgなし | URL client validation、失敗toast | BFF→Rails。ProjectとJobのtransactional command。202 |
| P04 | GET `/api/analysis/{jobId}/progress` | 2.5秒poll、確認待ち6秒、degraded最大10秒 | project ID・既知progress/step → Progress/UI/runtime/summary | tickで擬似遷移 | 使用中・MVP必須 | 現在project IDをqueryで自己申告 | 5xx等をbackoff、stale payloadを無視 | BFF→Rails。canonical Job statusをBFFで現行viewへ変換 |
| P05 | POST `/api/project/{projectId}/inference/confirm` | inference確認button | job ID・推定3項目・note → Job/Progress/UI | stale jobを409 | 使用中・MVP必須 | 現在ownership未検証 | mutation lock、失敗時再操作可 | BFF→Rails。job subresource、409 stale |
| P06 | POST `/api/project/{projectId}/reanalyze` | reanalyze button | project ID・idempotency → Project+Job | idempotency・running競合あり | 使用中 | 現在bodyにもproject ID重複 | toast、stable snapshot維持 | BFF→Rails。P03と同じAnalysisJob createへ統合 |
| P07 | POST `/api/project/{projectId}/strategy/select` | strategy選択 | snapshot ID・strategy key → selected plan/tasks/summary | local state更新 | 使用中 | 現在org/ownershipなし | optimisticではなく成功後反映 | BFF→Rails。StrategyPlan selection command、409 stale |
| P08 | POST `/api/strategy/task/update-status` | roadmap task操作 | task ID・status・reason → task/transition | transition履歴あり | 使用中 | project/orgがpathにない | mutation status・toast | BFF→Rails。Roadmap PhaseTask PATCHへ変更 |
| P09 | GET `/api/usage/current` | 呼出箇所なし | none → usage view | fixture | 未使用・将来候補 | 現在scopeなし | client共通処理のみ | Rails Usage owner。MVPから除外またはheader表示接続時に追加 |

### 共通client挙動

- Request objectを再帰的にsnake_case化し、responseをcamelCase化する。
- 現行成功envelopeは`{ok: true, data}`、失敗は`{ok: false, error}`を期待する。
- `projectDisplayState`等の旧aliasをclientで補正しており、contract driftを示している。
- timeout、AbortSignal、retry回数、correlation ID、Authorization、Organization ID、Idempotency headerは未実装。
- POSTのidempotency keyは現在body内にある。
- mockは`dev && PUBLIC_USE_MOCK_API === 'true'`だけで有効になり、production fallbackはない。

## Actions・Stores・Selectors

### Actions / Commands

- `projects.ts`: list、detail、選択IDのlocalStorage永続化、bootstrap、再接続reconcile。
- `analysis.ts`: create/reanalyze、poll開始・停止、inference confirm、commit後detail再取得。
- `strategy.ts`: StrategyPlan選択、PhaseTask status更新。
- `network.ts`: browser online/offline、API reachability、toast。

poll timerはmodule内に1本だけ保持し、terminal時に停止する。Job・Project・AnalysisSession ID不一致、step逆行、progress逆行をguardで拒否する。一方、AbortControllerはなく、page非表示、Organization切替、複数mount時のin-flight request中止は未実装である。

### Stores

| Store | 正本としてよい範囲 | 正本にしてはいけない範囲 |
| --- | --- | --- |
| session UI | 選択・modal・panelの一時UI状態 | Project ownership、active Organization |
| project collection/detail | 最後に取得したviewとstable snapshot | DB永続状態、他端末更新 |
| analysis runtime | polling・表示step・mutation状態 | 正式なJob状態遷移 |
| strategy UI | 選択中plan/phase/task | approved StrategyPlan・PhaseTask履歴 |
| network/notification | reachability・toast | backend availabilityの監視正本 |

`panoptes.selected_project_id`はlocalStorageに保存されるが、単なる選択候補である。Railsは必ずOrganization membershipとresource ownershipを再検証する。mock backendの`panoptes.mvp.state.v1`もdevelopment fixtureであり、正式データではない。

### Selectors

`presentation.ts`はempty/analyzing/failed/snapshot表示、stable snapshot優先、overlay、Strategy/Roadmap表示を導出する。server contractを変更せず表示を保つため、BFFでcanonical API responseを既存view modelへ変換する。

## その他の外部I/O

| ID | Operation | Caller / route | Usage | Owner / Recommendation |
| --- | --- | --- | --- | --- |
| W01 | POST `/api/waitlist/join` | `SignUpForm` signup後 | 呼出中だが対応routeなし | BFF内部endpoint。Turnstile secret検証とwaitlist永続化はserver側。Rails業務APIとは分離 |
| A01 | Supabase `signInWithPassword` | Login form | 使用中 | Supabase Auth browser client |
| A02 | Supabase `signUp` | Signup form | 使用中 | Supabase Auth。callbackをBFFが処理 |
| A03 | Supabase `resend` | Signup form | 使用中 | Supabase Auth。rate limitをUI向けへmapping |
| A04 | Supabase `getUser` | `hooks.server.ts`経由adapter | 全request | Supabase Auth server検証・refresh |
| A05 | Supabase `exchangeCodeForSession` | GET `/auth/callback` | 使用中 | SvelteKit Auth BFF |
| A06 | Supabase `signOut(local)` | POST `/auth/logout` | 使用中 | SvelteKit Auth BFF |
| O01 | Organization選択form action | `/organization/select?/default` | 使用中 | SvelteKit内部。Rails導入後はmembership再検証が必要 |

Turnstile script取得も外部network I/Oだが、Panoptes API contractではなくsecurity widget assetとして扱う。

## 分類

- A 現行MVP必須: P01〜P08、A01〜A06、O01。
- B 将来必要だが未接続: P09、Project CRUD/historyの一部、cancel、pagination。
- C Mock専用: localStorage backend、runtime ticker、snapshot factory、fixture latency。
- D 未使用・重複: P09のclient呼出、client alias normalization。削除はせず移行時に判定する。
- E BFF内部: Supabase cookie/session、callback/logout、active Organization解決、waitlist、Rails error shaping。
- F Worker契約: crawl/capture/analyze/result commit event。browserには公開しない。

## Mockと正式contractの主要差分

1. MockはOrganization membership・resource ownershipを検証しない。
2. MockのJobは時間経過をbrowserでtickし、Queue/Worker transactionを再現しない。
3. 現行statusは`running`へ複数phaseを畳み、timeout/partial completionを持たない。
4. Mock idempotencyはlocalStorage内で一部commandだけを対象にする。
5. Snapshotは巨大なUI view modelで、永続domain・metadata・generated contentの境界がない。
6. Error code、HTTP status、request ID、validation details、retryableの共通形が未統一。
7. 現行relative endpointにはBFF実体がない。

MockをRails contractの正本にはしない。正式OpenAPIを正本とし、mock adapterまたはcontract fixtureをそのschemaへ追従させる。

## 推奨統合順

1. SvelteKitにBFF transportと共通error mappingを追加する。
2. RailsでJWT検証、User mapping、Organization membershipを先に実装する。
3. P01/P02のread contractを接続する。
4. P03/P04/P05をAnalysisJob state machineと同時に接続する。
5. committed Snapshot取得を接続する。
6. Strategy selectionとPhaseTask mutationを接続する。
7. 現行client pathを一度に全面置換せず、method単位でBFF routeへ切り替える。

## 未確定事項

- Supabase projectのJWT issuer・audience・JWKS URLの実値。
- Rails internal/base URL、deployment topology、service-to-service認証の要否。
- Organization IDのUUID規約とSystemAdmin support sessionの承認方式。
- Analysisの各worker phase、partial result公開条件、timeout SLA。
- Project archive/history、Usage/plan limit、waitlistの最終owner。
- OpenAPI code generation toolとRails serializer/validatorの選定。
