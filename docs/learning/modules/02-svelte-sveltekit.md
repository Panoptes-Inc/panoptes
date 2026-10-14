# Module 02 — Svelte / SvelteKit

Updated: 2026-10-05 — Phase TB-03  
Status: `COMPLETE / READY_FOR_M03`  
Difficulty: `FOUNDATION`  
Prerequisite: `M01 — Panoptes Overall Architecture`  
Parent: [Panoptes Technical Bootcamp](../panoptes-technical-bootcamp.md)

## 1. Learning goals

このModuleを終えたLearnerは、次を説明できる。

1. Svelte componentとSvelteKit application frameworkの違い。
2. Svelte 5のprops、reactive state、derived state、effect、binding、callback、snippetの役割。
3. `+page`、`+layout`、server load、form action、`+server.ts`の責務。
4. SSR、hydration、client-side navigation、CSRの関係。
5. PanoptesのRoute Entry、Page Entry、Feature、UI、Layoutがどう接続するか。
6. Frontend local stateとRails canonical business stateの違い。
7. secret、session、authorization、business ruleをclient componentへ置かない理由。

Svelte/SvelteKit全機能の網羅は目的にしない。Panoptesで現在使う概念と、責務境界を読むために必要な概念へ限定する。

## 2. Svelteとは何か

Svelteは`.svelte` componentをbrowserで動くJavaScript、DOM update、CSSへcompileするUI technologyである。Componentは主に次を組み合わせる。

- `<script>`: props、state、derived value、event handler、lifecycle。
- markup: HTML、child component、条件分岐、list、snippet。
- `<style>`: component-local styling。

Svelte componentはURL routing、server authentication、API contract、database transactionを自動的に提供しない。それらはSvelteKitや別backendの責務である。

### 2.1 Component

Componentはpropsを受け取り、stateから表示を作り、interaction intentをcallback等でownerへ返す。小ささではなく、責務と変更理由が境界になる。

```svelte
<script lang="ts">
	let { label, onSelect }: { label: string; onSelect: () => void } = $props();
</script>

<button onclick={onSelect}>{label}</button>
```

この例はlabelの表示とclick通知を行うが、APIを呼ぶかどうかは決めない。

### 2.2 Props

Svelte 5では`$props()`からparent入力を受ける。Panoptesではdata/stateをparentからchildへ渡し、UIはtyped callbackでinteraction intentを上げるのがdefaultである。

Propsはchildが自由に所有するstateではない。Parentから更新されうるため、必要なくlocal copyへ複製すると同期ずれを作る。

### 2.3 Reactive state — `$state`

`$state`はcomponentまたは`.svelte.ts` state owner内のreactive mutable stateを表す。

Panoptesの例:

- active tab
- temporary form input
- selected competitor
- modal visibility
- loading presentation

`$state`へProject、Job、Role等を保持しても、それはFrontend projection/cacheであり、canonical business stateへ昇格しない。

### 2.4 Derived state — `$derived`

`$derived`は他のreactive inputから計算できる値を表す。手動同期より、同じSourceから都度導出する。

`PanoptesShellPage`では、render対象Snapshot、fallback状態、header metadata、reanalyze disabled状態等をderivedとして作る。`app/+layout.svelte`ではpathnameから`isTopPage`を導出する。

Pure calculationは`$effect`ではなく`$derived`またはplain functionを優先する。

### 2.5 Side effect — `$effect`

`$effect`はreactive dependencyの変化に応じ、browser上で外部状態やimperative処理へ作用する。DOM integration、external widget、owner controllerとの同期等に使える。

Panoptesの例:

- Snapshot変化時にcontrollerへ同期する。
- Turnstileのbrowser widget lifecycleを調整する。

`$effect`はSSR中に実行するdata loadや、pure derived valueの代用品ではない。Effectのcleanup、再実行、dependencyを意識する。

### 2.6 Event / callback

Panoptes標準はtyped callback propである。

```text
data/state: Parent -> Child
interaction intent: Child -> typed callback -> Owner
```

`PanoptesShellMainSurface`は`onRetry`、`onConfirm`、`onSelectProject`等を受け取り、render branchに応じてchildへ渡す。UIはcontrollerやAPIを直接importせず、ownerがcommand orchestrationを行う。

### 2.7 Conditional / list rendering

- `{#if ...}{:else if ...}{/if}`: stateに応じた表示。
- `{#each items as item (key)}`: list表示。安定したkeyを指定するとidentityを保ちやすい。

条件分岐はpresentation decisionに使う。Roleやeligibility等のbusiness decisionをmarkupだけで正本化しない。

### 2.8 `bind:`と`$bindable`

`bind:value`、`bind:checked`、`bind:this`は値やDOM referenceを接続する。Child propをparentからbind可能にする場合、Svelte 5では`$bindable`を明示する。

PanoptesのSignupではfield componentが`$bindable`なform valueを受け、form ownerと同期する。Bindingは便利だが、ownershipが曖昧になる場合はvalue + callbackを使う。Server stateや複数Feature間stateをtwo-way bindingで共有しない。

### 2.9 Lifecycle

- `onMount`: componentがbrowser DOMへmountされた後の処理。server renderでは実行されない。必要ならcleanup functionを返す。
- `onDestroy`: component破棄時のcleanup。
- `$effect`: reactive browser-side lifecycle。

`PanoptesShellPage`は`onMount(controller.mount)`でcontroller lifecycleを開始し、controllerがcleanupを返せる構造を持つ。`SignUpForm`は`onDestroy(controller.destroy)`でresourceを解放する。

### 2.10 Snippet / children

Svelte 5のsnippetは再利用可能なmarkup blockで、`{@render ...}`で描画する。

- Root/App layoutは`children` snippetを`$props()`で受け、`{@render children()}`でnested routeを描画する。
- `PanoptesShellMainSurface`は`{#snippet snapshotSurface()}`で重複するSnapshot compositionをまとめる。

旧来のslot知識だけで読まず、現Repositoryのchildren/snippet patternを優先する。

### 2.11 Svelte storeとの共存

Svelte 5でrunesを使っても、Svelte storeは利用できる。Panoptesではlocal interactionにrunes、複数component/controllerから購読するruntime/project/session stateにstoreが残る。Component内の`$storeName`はstore valueへのauto-subscriptionであり、rune名ではない。

Storeを使う理由は共有lifecycleと購読であり、canonical backend stateのownershipではない。

## 3. SvelteKitとは何か

SvelteKitはSvelte componentを使い、routing、server load、request handler、form action、SSR、client navigation、build/runtime boundaryを構成するapplication frameworkである。

| Concern                      | Svelte                    | SvelteKit                                 |
| ---------------------------- | ------------------------- | ----------------------------------------- |
| UI component                 | yes                       | Svelte componentをrouteへ配置             |
| Reactivity                   | runes、stores             | load dataとcomponentへ接続                |
| File-based routing           | no                        | `src/routes`                              |
| Server request lifecycle     | no                        | hooks、server load、actions、`+server.ts` |
| SSR / hydration / navigation | component単体では決めない | route単位でorchestrate                    |
| Business backend             | no                        | PanoptesではBFFまで。Railsを代替しない    |

したがって、`Svelte = Panoptes frontendのすべて`でも、`SvelteKit = Rails business backend`でもない。

## 4. SvelteKit file roles

| File                | General role                             | Panoptesでの境界                                             |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| `+page.svelte`      | URLに対応するroute component             | thin Route Entry。Page Entry/Featureへcontextを渡す          |
| `+page.ts`          | pageのuniversal `load`                   | initial SSRとclient navigationの双方で動きうる。secret禁止   |
| `+page.server.ts`   | server-only page `load` / form `actions` | cookie、session、secure validation、redirect等               |
| `+layout.svelte`    | nested routesを包むpersistent UI         | root/app shell、Header、shared structure、children rendering |
| `+layout.ts`        | layoutのuniversal `load`                 | public/universal data。secretやserver-only SDKは禁止         |
| `+layout.server.ts` | server-only layout `load`                | verified auth/session/Organization contextの初期配布         |
| `+server.ts`        | HTTP endpoint handler                    | Auth callback/logoutまたはsame-origin BFF/API boundary       |
| `hooks.server.ts`   | request全体のserver hook                 | session/auth解決、route policy、server-side deny/redirect    |

Panoptesの現Route treeには`+page.ts`や`+layout.ts`の代表実装はない。概念は理解するが、不要なuniversal loadを新設しない。

### 4.1 `load`

`load`はroute表示に必要なdataを準備する。

- Server loadはserverだけで実行し、cookie、private environment、server-only clientへアクセスできる。
- Universal loadは初回SSR時にはserver、client navigation時にはbrowserでも実行されうるため、secretを置かない。
- Layout dataはnested page/layoutへ渡る。Page componentは`data` propとして受け取る。

Current root `+layout.server.ts`は`event.locals.auth`からauthenticated、email、active Organization IDを返す。

### 4.2 Form actions

Form actionは`+page.server.ts`でform POSTをserver-sideに処理する仕組みである。PanoptesのOrganization selectionはdefault actionでform dataを読み、membershipを検証し、HTTP-only cookieを設定してsafe return先へredirectする。

これはclient componentだけでcookie/authorizationを決めるより安全で、JavaScript enhancementの有無とserver authorityを分離できる。すべてのmutationをform actionへ統一する必要はなく、API/BFF commandとの使い分けはuse caseで決める。

### 4.3 `error` / `redirect`

Server load、action、request handlerはSvelteKitの`error`や`redirect`でHTTP outcomeを表現できる。これらはframework control flowとしてrequestを終了するため、一般例外として不用意にcatchしない。

Current Organization actionはmembership不一致を403、成功を303 redirectとする。Auth callback/logoutも`+server.ts`でredirectする。

### 4.4 `+server.ts`

`+server.ts`はHTTP methodごとのhandlerを公開する。Panoptesでは次の2種類がある。

- Auth callback/logout等のSvelteKit-owned server endpoint。
- `/api/panoptes/v1/...`としてRailsへ接続するsame-origin BFF endpoint。

`+server.ts`に置いたという理由だけでbusiness ruleのSource of Truthにはならない。

## 5. Panoptes Route / Page / Layout mapping

### 5.1 Route roles

| Route           | Product role                              | SvelteKit entry                        | Composition owner                               |
| --------------- | ----------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| `/`             | Public Product Marketing Home             | `src/routes/+page.svelte`              | `MarketingLandingPage`                          |
| `/app`          | App Home / Analysis Entry                 | `src/routes/app/+page.svelte`          | shared `PanoptesShellEntryPage` / Feature Shell |
| `/app/analysis` | Analysis-focused Workspace / Result Entry | `src/routes/app/analysis/+page.svelte` | same shared entry / Feature Shell               |

`/app`と`/app/analysis`はProduct上のroleが異なるが、同じruntime compositionを共有する。Route fileを消して一つのURLにすることとは別問題である。

### 5.2 Route EntryとPage Entry

```text
URL / SvelteKit generated types
  -> +page.svelte (Route Entry)
  -> Page Entry / canonical composition
  -> Feature
  -> UI
```

- **Route Entry:** framework URL/data boundary。params/dataをtypedに受け、composition ownerへ渡す。
- **Page Entry:** route contextをFeature compositionへ接続するowner。
- **Feature:** controller、view-model、command、feature stateを所有する。

Current App routeは数行で`data.activeOrganizationId`を`PanoptesShellEntryPage`へ渡す。数行でもURL/data boundaryとして意味があり、無意味なcomponent wrapperと同一ではない。

### 5.3 Root Layout

Root `+layout.server.ts`がverified auth contextを配布し、root `+layout.svelte`はglobal CSS、favicon、children renderingを所有する。Header/Heroやfeature commandは所有しない。

### 5.4 App Layout

`app/+layout.svelte`はApp route familyで持続するHeader、shell width/spacing、`/app`だけのTop Heroを所有する。pathnameからpresentation conditionをderivedするが、Analysis commandやRails business ruleは持たない。

Layoutの責務はpersistent structureである。名称に`Shell`が含まれていても、controllerやuse-case orchestrationを持つ`PanoptesShellPage`はFeature ownerでありFramework Layoutではない。

### 5.5 Marketing Page

Root `/` routeはauthenticated dataを`MarketingLandingPage`へ渡す。Marketing HeaderとHeroはPage-owned compositionであり、root Layoutへ重複配置しない。

## 6. Server / Client boundary

| Server側候補                       | Client側候補                               |
| ---------------------------------- | ------------------------------------------ |
| cookie/session読取・設定           | click/input/modal/tab等のinteraction       |
| private environment / secret       | transient/presentation state               |
| Supabase server client             | typed responseのrendering                  |
| initial verified auth context      | semantic navigation                        |
| route authorization / redirect     | AbortSignalによるUI lifecycle cancellation |
| BFF proxy / Rails token forwarding | callbackによるintent通知                   |
| server form action                 | local validationとaccessible feedback      |

### なぜSecretをClientへ置かないか

Browser bundleとnetwork requestはUserから観測・変更できる。Public environment value以外のsecret、service credential、private Rails URLをclient codeへ含めない。

### なぜBusiness AuthorizationをClientへ置かないか

Buttonを隠すことはUXでありauthorizationではない。Userはrequestを直接作れるため、SvelteKit server boundaryとRailsがserver-sideで拒否できなければならない。

### Current request guard

`src/hooks.server.ts`はrequestごとにSupabase/mock auth adapterを解決し、route policyを評価してnot-found、deny、redirectをserver-sideで決める。Root server loadはその結果を`locals.auth`から読む。Client navigationでも、保護data/APIへのserver requestはこのboundaryを通るため、navigationそのものがauthorization bypassにはならない。

## 7. Rendering model

### SSR

Initial requestでserverがroute loadとSvelte componentからHTMLを生成する。初期表示、metadata、server-verified context配布に有効である。SSR中はbrowser DOM API、`window`、browser-only effectへ依存できない。

### Hydration

Browserがserver-generated HTMLへSvelteのevent handlerとreactive behaviorを接続する。HTMLが表示済みでも、hydration前はclient interactionが完全に有効とは限らない。

### Client-side navigation

Hydration後、SvelteKitは該当link navigationでdocument全体のreloadを避け、必要なloadとcomponent更新を行える。Nested Layoutはroute family内で再利用されるため、persistent Header/Shellに適する。

### CSR

Browserでcomponentをrender/updateする側面。Panoptesのform、tab、modal、analysis progress等はclient interactionを使うが、application全体がclient-onlyという意味ではない。

PanoptesはSSRでinitial route/auth contextを受け、hydration後にclient interactionを行い、BFF/Railsへserver authorityを委譲するhybrid構成である。Exact performance tuningやroute別prerender/CSR strategyは後続へ送る。

## 8. State / Props / Callback model

| State class                     | Example                                                  | Owner                     | Source of Truth boundary                                  |
| ------------------------------- | -------------------------------------------------------- | ------------------------- | --------------------------------------------------------- |
| Local / presentation            | modal、tab、temporary input、password visibility         | Component / UI owner      | browser lifecycle内のみ                                   |
| Feature state                   | controller lifecycle、view-model、analysis UI projection | Feature                   | server responseをorchestrateするがcanonical ownerではない |
| Shared frontend state           | selected project、runtime projection、notification       | approved store/controller | 複数consumer向けcache/projection                          |
| Server/canonical business state | Project、AnalysisJob、Snapshot、Role、workflow           | Rails + PostgreSQL        | Frontendから直接確定しない                                |

### Props direction

Parentはdataとcallbackをchildへ渡す。Childがpropsの意味を変更したり、Organization scopeを推測したりしない。

### Callback direction

Child UIは`onRetry()`、`onSelectProject(id)`等でintentを通知する。Feature ownerがvalidation、command、client invocation、state updateを調整する。

### Bindingの限定利用

Form ownerとfield componentが一つのlocal form lifecycleを共有するときは`$bindable`を使える。API response、Role、Job status等をbindingだけで更新しない。

### Frontend stateをDB代わりにしない

Frontend stateはreload、複数tab、stale response、User改変の影響を受ける。Business stateのmutationはFeature command→Client→BFF→Railsを通し、Rails/DB responseをFrontend projectionへ反映する。

## 9. SvelteKit BFFとの関係

```text
Svelte component / Feature
  -> typed Client
  -> SvelteKit +server.ts (BFF)
  -> Rails API
```

| SvelteKit BFF                       | Rails                                               |
| ----------------------------------- | --------------------------------------------------- |
| Browser-facing same-origin boundary | Canonical business backend                          |
| cookie/session確認                  | JWT、membership、Role、resource authorization再検証 |
| access token forwarding             | business rule / workflow / transaction              |
| Rails URLとraw errorを隠す          | canonical Project/Job/Snapshot state                |
| timeout/envelope/safe error shaping | persistent stateをPostgreSQLへcommit                |

Current BFFにはidentity/Organizationのread endpointがある。Production Analysis business endpointは未接続である。M02では境界だけを理解し、request/error/idempotencyの詳細はM07/M08/M09へ送る。

## 10. Directory mapping

| Directory                           | Svelte/SvelteKit上の意味                                          | Current / Target                     |
| ----------------------------------- | ----------------------------------------------------------------- | ------------------------------------ |
| `src/routes`                        | file-based Route Entry、Framework Layout、server load/action、BFF | `CURRENT`                            |
| `src/lib/features/<feature>`        | Feature、controller、mapping、feature-local component             | `CURRENT`。target modelの中心        |
| `src/lib/layouts`                   | reusable structural shell。SvelteKit `+layout`とは別              | `TARGET`。現在directory未作成        |
| `src/lib/ui/components`             | stable cross-feature presentation                                 | `TARGET`。現在directory未作成        |
| `src/lib/ui/primitives`             | semantics-neutral primitive                                       | `TARGET`。現在directory未作成        |
| `src/lib/components/ComponentsBase` | legacy migration source / current canonicalが一部残る             | `CURRENT LEGACY`。新規配置先にしない |

承認済みDirectory Structureはmigration targetであり、全fileが移動済みという意味ではない。M02で移動は行わない。

## 11. Representative code mapping

| Representative                                                                                   | Role                                  | 読むポイント                                                                |
| ------------------------------------------------------------------------------------------------ | ------------------------------------- | --------------------------------------------------------------------------- |
| `src/hooks.server.ts`                                                                            | global server request boundary        | auth解決、route policy、server deny/redirect、private cache                 |
| `src/routes/+layout.server.ts`                                                                   | root server load                      | `locals.auth`からverified initial contextを返す                             |
| `src/routes/+layout.svelte`                                                                      | root Framework Layout                 | global CSS/headと`children` snippet。Featureなし                            |
| `src/routes/+page.svelte`                                                                        | Marketing Route Entry                 | `MarketingLandingPage`へroute dataを渡す                                    |
| `src/routes/app/+layout.svelte`                                                                  | App Framework Layout                  | persistent Header/shell、pathname-derived Top Hero、children                |
| `src/routes/app/+page.svelte` / `app/analysis/+page.svelte`                                      | App Route Entries                     | 別URL roleから同じPage/Feature entryへOrganization contextを渡す            |
| `src/routes/organization/select/+page.server.ts`                                                 | server load + form action             | membership検証、HTTP-only cookie、403/redirect                              |
| `src/routes/api/panoptes/v1/organizations/[organization_id]/+server.ts`                          | BFF endpoint                          | browser requestをserver-only Rails clientへ接続                             |
| `src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte`                            | Feature Orchestrator                  | `$props/$state/$derived/$effect`、controller lifecycle、callback wiring     |
| `src/lib/features/panoptes-shell/components/PanoptesShellMainSurface.svelte` / Signup components | Presentation + local form composition | callback-only interaction、snippet、if、bindable field、accessible feedback |

これらは代表例であり、全Svelte fileの適合宣言ではない。

## 12. よくある誤解

### 「Svelteがroutingやbackendまで全部行う」

Svelteはcomponent/UI technologyである。Routingとserver lifecycleはSvelteKit、canonical business backendはRailsが担当する。

### 「SvelteKitがあるのでRailsは不要」

PanoptesのSvelteKit serverはBFF。Browser transport/session boundaryであり、business ruleやcanonical stateの正本ではない。

### 「`+layout.svelte`へ共有したい処理を全部置く」

Layoutはpersistent structural responsibilityを持つ。Feature controllerやpage固有commandを置くとroute family全体へ不要なlifecycleを広げる。

### 「`+page.svelte`が画面なので全logicを置く」

Route fileはURL/data boundary。大きなuse caseはPage Entry/Featureへ委譲し、routeをthinに保つ。

### 「Storeや`$state`が最新ならSource of Truth」

Frontend stateはprojection。Project、Job、Snapshot、Roleのcanonical authorityはRails/DBにある。

### 「SSRならすべてserver-only」

SSRはinitial HTML生成。Hydration後は同じcomponentがbrowserでinteractionを持つ。Server-only dataは`.server` boundaryへ隔離する。

### 「Client-side navigationならserver guardを通らない」

保護load/API requestはserver boundaryで検証される。UI表示制御だけでauthorizationを代替してはいけない。

### 「`bind:`はstate ownershipを考えなくてよい仕組み」

Bindingは値の同期手段であり、ownerを消すものではない。Form-local以外はprops + typed callbackをdefaultにする。

## 13. Practice

### 13.1 Knowledge Check

1. SvelteとSvelteKitの役割の違いを説明せよ。
2. `$state`と`$derived`をどう使い分けるか。
3. `$effect`へserver data fetchingを置かない理由は何か。
4. `+page.server.ts`と`+page.ts`のsecurity boundaryの違いは何か。
5. SSRとhydrationは何が違うか。
6. SvelteKit BFFとRailsはどちらがbusiness authorizationを所有するか。
7. `$bindable`を使う適切な例と、不適切な例を一つずつ挙げよ。
8. Frontend storeがcanonical stateではない理由は何か。

### 13.2 Code Reading

次を`Route / Page Entry / Layout / Feature / UI / Server Boundary`から最も適切なprimary roleへ分類し、根拠を書く。

1. `src/routes/app/analysis/+page.svelte`
2. `src/routes/app/+layout.svelte`
3. `src/lib/components/ComponentsBase/PanoptesShellEntryPage.svelte`
4. `src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte`
5. `src/lib/features/panoptes-shell/components/PanoptesShellMainSurface.svelte`
6. `src/routes/organization/select/+page.server.ts`
7. `src/routes/api/panoptes/v1/organizations/[organization_id]/+server.ts`
8. `src/hooks.server.ts`

### 13.3 Trace — `/app/analysis`

次をinitial direct accessの順へ並べる。

- A. Root `+layout.server.ts`が`locals.auth`からlayout dataを返す。
- B. Browserがserver-generated HTMLをhydrateする。
- C. `hooks.server.ts`がauthとroute access policyを評価する。
- D. App `+layout.svelte`がHeader/structureとchildrenを描画する。
- E. `/app/analysis/+page.svelte`がOrganization IDをPage/Feature entryへ渡す。
- F. Shell FeatureがOrganization boundary clientを呼ぶ。
- G. BFF `+server.ts`がRailsへread requestをproxyする。
- H. RailsがJWT/membershipを再検証してresponseを返す。

追加問題：Hydration後のclient-side navigationになっても、G/Hを省略してよいか。

### 13.4 Design Exercise — どこへ置くか

`+page / +layout / Feature / UI / SvelteKit server / Rails`から選び、理由を書く。

1. Modalの開閉状態。
2. App route family全体のfixed Header。
3. Analysis開始buttonからtyped commandを組み立てる処理。
4. Buttonのlabelとdisabled表示。
5. HTTP-only active Organization cookieの設定。
6. UserがProjectを分析できるかという正式判定。
7. `/app/analysis`のroute dataをFeatureへ渡す薄いentry。

## 14. Answers / Explanation Guide

### 14.1 Knowledge Check要点

1. SvelteはUI component/reactivity、SvelteKitはrouting/server/rendering application framework。
2. Mutable owner stateは`$state`、他stateからpureに計算できる値は`$derived`。
3. Effectはbrowser lifecycleでありSSR data dependencyを満たさず、再実行/cleanupのside effectを伴うため。
4. `.server`はserver-only credential/cookieへアクセス可能。Universal fileはbrowserでも動きうるためsecret禁止。
5. SSRはserverでinitial HTML生成、hydrationはbrowserでevent/reactivityを接続。
6. Rails。BFFはtransport/session gateを持つがfinal business authorizationではない。
7. 適切: 一つのSignup form ownerとfield child。不適切: Job statusやRoleをUI childからtwo-way更新。
8. Reload/複数tab/stale/改変があり、transaction/constraint/authorization authorityを持たないため。

### 14.2 Code Reading回答

1. Route Entry。URL/data boundaryからshared entryへ接続。
2. Layout。App familyのpersistent Header/structureを所有。
3. Page Entry compatibility boundary。route contextとFeature Shellを接続。
4. Feature Orchestrator。controller、shared state projection、command callbacksを所有。
5. UI/Presentation。propsをrenderし、typed callbacksでintentを返す。
6. Server Boundary。server loadとform actionを所有。
7. SvelteKit BFF Server Boundary。same-origin requestをRailsへproxy。
8. Global Server Boundary。request auth、route policy、redirect/denyを処理。

### 14.3 Trace回答

基本順は`C -> A -> D/E -> B -> F -> G -> H`。DとEはSSR composition内で親Layoutがchild Pageを描画する関係であり、厳密なcomponent render schedulingを暗記する問題ではない。重要なのは、server auth/loadが先にauthorityを確立し、HTML後にhydrationし、Featureのserver data requestはBFF/Railsで再検証されることである。

Client-side navigationでもG/Hは省略しない。Navigationの表示体験がclient-sideでも、canonical resourceへのrequestとauthorizationはserver boundaryを通す。

### 14.4 Design Exercise回答例

1. **UI/Feature local state:** modal ownerのlifecycle内。
2. **`+layout`:** route family全体で持続するstructural chrome。
3. **Feature:** use-case orchestrationとcommand invocation。
4. **UI:** received stateのpresentation。
5. **SvelteKit server:** secure cookieとverified session context。Rails resource authorizationとは別。
6. **Rails:** membership、Role、resource、business ruleを合わせたcanonical decision。
7. **`+page`:** framework route dataをPage/Featureへ渡すRoute Entry。

## 15. Completion Criteria

| Criterion                           | Result |
| ----------------------------------- | ------ |
| 1. Svelte fundamentals explained    | `PASS` |
| 2. Svelte 5 concepts explained      | `PASS` |
| 3. SvelteKit fundamentals explained | `PASS` |
| 4. Route/Page/Layout explained      | `PASS` |
| 5. server/client boundary explained | `PASS` |
| 6. BFF relationship explained       | `PASS` |
| 7. rendering model explained        | `PASS` |
| 8. state/props/callback explained   | `PASS` |
| 9. repository mapping included      | `PASS` |
| 10. exercises + answers included    | `PASS` |

M02 Authoring DoD: `10 / 10 PASS`  
Module status: `COMPLETE / READY_FOR_M03`

このstatusは教材artifactの完成を示す。Learner assessment合格、全Svelte fileの標準適合、Directory migration完了を意味しない。

## 16. Handoff to M03

次は`M03 — Component Taxonomy`。M02のSvelte componentとSvelteKit framework fileの違いを前提に、Route Entry、Page Entry、Layout/Shell、Feature、Composite、UI、Primitive、Previewをprimary responsibilityで分類する。

## References

- [Panoptes Technical Bootcamp](../panoptes-technical-bootcamp.md)
- [M01 Panoptes Overall Architecture](./01-panoptes-overall-architecture.md)
- [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)
- [Frontend Route Ownership](../../architecture/frontend-route-ownership.md)
- [October Frontend Standardization Plan](../../architecture/frontend-standardization-plan.md)
- [Frontend Inventory Summary](../../inventory/frontend-inventory-summary.md)
