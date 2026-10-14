# Module 04 — Feature / UI / Layout Boundary

Updated: 2026-10-05 — Phase TB-05  
Status: `COMPLETE / READY_FOR_M05`  
Difficulty: `FOUNDATION`  
Prerequisite: `M01 — Panoptes Overall Architecture`, `M02 — Svelte / SvelteKit`, `M03 — Component Taxonomy`  
Parent: [Panoptes Technical Bootcamp](../panoptes-technical-bootcamp.md)  
Primary Standard: [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)

## 1. Learning goals

このModuleを終えたLearnerは、次を判断できる。

1. Feature、UI / Presentation、Layout / Shellがそれぞれ所有する責務。
2. Canonical、Feature、Presentation、Transient stateのowner。
3. ControllerとCommandをFeatureが所有する理由。
4. Data Down / Callback UpでUIとownerを分離する方法。
5. Page、Feature、Composite、Layoutのcoordinationの違い。
6. UI→API、Layout→Feature Command等の越境を検出し、正しいownerへ戻す方法。
7. 名前やcomponent sizeではなくownershipから分類する方法。

M03でCategoryは確定済みである。M04ではTaxonomyを変えず、Category間でstate、command、compositionがどう流れるかを具体化する。

## 2. Boundaryとは何か

Boundaryは、処理を別fileへ分けることではない。「誰が決定し、誰が変更し、誰が結果を表示するか」というownership contractである。

### なぜ必要か

- **Change isolation:** Business flow変更とvisual変更を別のownerへ閉じ込める。
- **Reuse:** UIを特定use case、route、storeから切り離す。
- **Testability:** Controller、mapping、presentationを異なる粒度で検証する。
- **Readability:** Codeを見たとき、side effectとstate mutationの入口を予測できる。
- **Business rule leakage prevention:** Frontend表示ロジックがRailsのcanonical ruleを複製しない。
- **State ownership clarity:** 同じstateを複数箇所が勝手に更新することを防ぐ。

Componentを小さくすること自体は目的ではない。100行でも複数ownerが混ざれば分離候補であり、300行でも一つのcohesive presentation責務なら直ちに分割する根拠にはならない。

## 3. Canonical boundary at a glance

| Concern | Feature | UI / Presentation | Layout / Shell |
| --- | --- | --- | --- |
| Composition | use-case child coordination | props-based render / local composition | persistent chrome / children arrangement |
| State | feature lifecycle、request/mutation state | presentation/transient state | route-family chrome/context state |
| Controller | create / own / invoke | import・ownしない | feature controllerをownしない |
| Command | typed use caseとしてinvoke | typed callbackでintentを返す | feature commandをexecuteしない |
| Mapping | server/domain→view model | display formattingのみ | route/context shapingのみ |
| Loading/error | request lifecycle、retry/cancel intent | supplied stateを表示 | global navigation/session shellのみ |
| Business logic | Rails resultをorchestrate | 所有しない | 所有しない |

```text
Route Entry -> Page Entry -> Feature -> Composite -> UI -> Primitive
                 Layout wraps Page Entry

data / state ------------------------------->
interaction intent <---------------- callback
```

## 4. Feature responsibility

Featureは「大きい画面」ではなく、一つのuse caseのFrontend ownerである。

### Feature owns

- use-case orchestration。
- feature stateとrequest/mutation lifecycle。
- controller作成、mount/destroy、cleanup。
- typed command invocation。
- server/domain responseからdisplay-safe view-modelへのmapping。
- child coordination、loading/error/retry/cancel intent。
- stale result、abort、polling等のFrontend runtime coordination。

### Feature must not own

- Rails business rule、canonical eligibility、authorization、formula。
- global navigation frameやroute-family chrome。
- unrelated Featureのprivate state。
- generic UI appearance/accessibility ruleの再定義。
- raw Rails URLやserver-only secret。

### なぜFeatureがownerなのか

User Actionを実際のuse caseへ変換するには、複数のpresentation child、state、async result、error、cleanupを一つのlifecycleで調整する必要がある。UIへ分散すると同じcommandが複数箇所から呼ばれ、Layoutへ置くとroute family全体へ不要なside effectが広がる。

`PanoptesShellPage`はcontrollerを作り、複数storeとview modelを読み、create/retry/confirm/select等をchild callbackへ接続するためFeature Orchestratorである。`SignUpForm`はSignup controller、form state、submit/resend、navigation、cleanupを所有するためFeatureである。

## 5. UI / Presentation responsibility

UIは受け取ったstateを理解可能・操作可能な形で表示し、User intentをownerへ返す。

### UI owns

- HTML/renderingとvisual state。
- semantic HTML、accessible name、keyboard/focus等のaccessibility。
- formatting、tone、presentation mapping。
- hover、pressed、expanded、temporary input等のlocal interaction。
- typed callback emission。

### UI must not own

- API/Clientへの直接access。
- business authorizationやeligibility判断。
- Feature command invocation。
- canonical Project/Job/Snapshot/Role state。
- unrelated Feature間のorchestration。
- Feature storeの直接mutation。

Buttonが`onclick`を持つことはuse-case ownershipを意味しない。`PanoptesTabNav`はtab IDを`onChange`へ返すだけで、tab選択後に何をload/mutateするかを決めない。

`PanoptesAnalysisSurface`はruntime/presentation propsを受け、表示branchを選び、`onCreate`、`onRetry`、`onConfirm`等をchildへ渡す。Analysis commandをimportしないためpresentation compositionである。

## 6. Layout / Shell responsibility

Layoutはroute familyにわたって持続するstructural ownerである。

### Layout owns

- persistent Header、navigation、sidebar、frame。
- global/route-family spacing、width、shared CSS。
- verified contextのdistribution。
- nested Page childrenのarrangement。
- global navigation/session shellのloading/error。

### Layout must not own

- feature-specific controller/command。
- Analysis executionやdomain state orchestration。
- Page固有use caseやbusiness workflow。
- canonical business rule。
- 将来用の空pass-through boundary。

### Framework LayoutとReusable structural shell

- SvelteKit `+layout.svelte`はframework route treeでchildrenを包む。
- Reusable structural shellは複数pageで同じframeを提供するComponent。Target placementは`src/lib/layouts`。

現行`src/routes/app/+layout.svelte`はpersistent App Header、shell sizing/spacing、`/app`だけのTop Hero、children arrangementを所有する。Analysis controllerやcommandは持たない。

Headerは常にLayout所有ではない。App Headerはroute-family persistentなのでLayout、Marketing Header/HeroはMarketing Page compositionなので`MarketingLandingPage`所有である。

## 7. State Ownership Model

### 7.1 Four state classes

| State class | Canonical owner | Frontend holder / mutation path | Examples |
| --- | --- | --- | --- |
| Canonical / Server State | Rails + persisted backend | Client responseをFeature/controller/storeがprojectionとして保持。Command→Client→BFF→Railsでmutation | Project、AnalysisJob、Snapshot、Role、workflow、canonical score |
| Feature State | Feature controller/store、単一ownerならFeature component | Feature action/controllerだけがmutation | polling、bootstrap、request status、selected project workflow |
| Presentation State | UI/Compositeまたはpure view-model | props/derived/local state。canonical stateを変更しない | formatted percentage、tone、selected visual、render mode |
| Transient State | interactionに最も近いUI/Composite/Page | localをdefault。複数child coordination時だけFeatureへlift | modal open、hover/focus、expanded、draft input |

### 7.2 Panoptes examples

| State | Owner | Reasoning |
| --- | --- | --- |
| selected tab | nearest presentation composition。現行Shellでは複数surfaceを切り替えるFeature-level local state | canonical business stateではなくrender selection |
| modal open | modal trigger/nearest composition。複数childから制御する場合だけFeatureへlift | transient interaction |
| analysis result / Snapshot | Rails/DBがcanonical owner。Feature/storeはdisplay projection | reload・multi-client・historyに耐えるauthorityが必要 |
| analysis request loading | Feature controller/action | async use case lifecycle、retry/cancelと結び付く |
| spinner visibility | UIがFeatureのloading stateからderive | visual representationのみ |
| current Organization membership | Railsがcanonical。SvelteKit serverがverified active selectionを配布 | Client selectionをauthorization authorityにしない |
| validation message | UIは表示、Feature/controllerはclient validationとserver error mappingを調整 | message表示とvalidation outcomeを分離 |
| Job progress | Railsがcanonical progress、Feature runtime storeがprojection、UIがbar/text表示 | server transitionをFrontendで捏造しない |

Stateを持つだけではFeatureにならない。Modal openはUI、Header compact stateはLayout/UI、request statusはFeature、Job statusはRails authorityである。

## 8. Controller / Command ownership

### 8.1 Controllerとは

ControllerはFeature lifecycleとasync coordinationをまとめるFrontend ownerである。

Panoptes標準で扱うもの:

- mount/destroy、cleanup/abort。
- polling、retry、reconnect。
- multiple async branch。
- stale-result protection。
- 複数store/state transition。
- Feature command coordination。

Controllerはmarkup、CSS、raw HTTP、Product copyを所有しない。

### 8.2 Commandとは

CommandはUser intentをtyped use caseへ変換する操作である。

- typed input/outputを持つ。
- Organization-scopedなら`organizationId`を明示inputにする。
- `AbortSignal`やclient injectionを許容しtest可能にする。
- transport detailはClientへ委譲する。
- global storeやresponseからscopeを推測しない。

### 8.3 Canonical flow

```text
UI interaction
  -> typed callback / intent
  -> Feature handler / Controller
  -> Command
  -> Client
  -> SvelteKit BFF
  -> Rails

Rails response
  -> Client validation/error mapping
  -> Controller / Feature state
  -> View Model / props
  -> UI rendering
```

Featureがcontroller/commandを所有すると、authorization、transport、presentationを混ぜずにuse-case entryを一か所へ集められる。Command詳細はM06、BFFはM07で扱う。

## 9. Data Down / Callback Up

### Standard

```text
Owner
  -> data / state / view model as props
  -> Child UI

Child UI
  -> typed callback with intent payload
  -> Owner-side handler
```

Callbackはtransport action名よりdomain/user intentを表す。`onRetry()`、`onSelectProject(projectId)`、`onUpdateTaskStatus(taskId, status)`のように、必要なpayloadだけを返す。

### Repository trace

1. `PanoptesShellPage`がstore/selectorsからrender dataを用意する。
2. `PanoptesShellMainSurface`へruntime、Snapshot、selection、typed callbacksを渡す。
3. MainSurfaceはrender modeに応じて`PanoptesAnalysisSurface`やSnapshot surfaceへprops/callbackをforwardする。
4. `PanoptesAnalysisSurface`はRetry button等のintentを`onRetry`で返す。
5. Feature ownerが`controller.retryAnalysis`を実行する。

UIが直接store mutation/API callを行う場合、Step 4と5が一つになり、presentationを再利用・isolated testしにくくなる。Callback patternはeventを増やすためではなく、mutation authorityをownerへ戻すために使う。

## 10. Page / Compositeとの境界

| Owner | Coordinationの単位 | Example | Must not become |
| --- | --- | --- | --- |
| Page Entry | route固有section order、Feature assembly、Header/Hero where page-owned | `MarketingLandingPage` | use-case controller、raw transport |
| Feature | use case、request/mutation、controller、view model | `PanoptesShellPage`、`SignUpForm` | Rails rule、global shell |
| Composite | cohesive presentation child群、callback forwarding | `PanoptesShellMainSurface`、Roadmap Phase Card | command/API owner |
| Layout | route-family persistent frame/context/children | App `+layout.svelte` | Feature lifecycle |

Pageへuse-case orchestrationを詰めると、URLとbusiness interactionが密結合し、別routeから同じFeatureを使えなくなる。CompositeをFeature化すると、presentation childがtransport/state mutationへ依存し、props/callback contractが崩れる。

見た目の複雑さやchild数ではなく、何を決定するかで判定する。

## 11. Representative repository cases

| Case | Classification | Owns | Does not own | Dependencies | State owner |
| --- | --- | --- | --- | --- | --- |
| `src/routes/app/+layout.svelte` | Layout | App Header、spacing、Top Hero condition、children | analysis command/controller | Header/Hero/UI、route data | route-family presentation |
| `MarketingLandingPage.svelte` | Page Entry | Marketing Header/Hero section composition | Signup/analysis use-case lifecycle | page components/UI | minimal page state |
| `PanoptesShellPage.svelte` | Feature Orchestrator | controller、stores projection、view model、command callbacks | Rails rule、global navigation | controller/mapping/Composite/UI | Feature + lifted presentation state |
| `panoptes-shell-controller-adapter.ts` | Feature controller adapter | dependency wiring、organization validation、Feature actions | markup/CSS/raw Product copy | commands/actions/client interfaces | Feature lifecycle mutation path |
| `SignUpForm.svelte` | Feature | controller、form/use-case state、submit/resend、navigation、cleanup | server authorization、generic field rendering details | Signup controller/UI children | Feature form state |
| `PanoptesShellMainSurface.svelte` | Composite | render branch、props/callback forwarding | controller、store、API | Analysis/Snapshot UI surfaces | supplied presentation state only |
| `PanoptesAnalysisSurface.svelte` | Composite / presentation | analysis step composition、callback forwarding | analysis command、Job transition | frame/step UI | supplied runtime projection |
| `StrategyAnalysisRoadmapPhaseCard.svelte` | Composite | task/status child composition、selected visual、callback forwarding | task command、business workflow | Strategy UI children | local presentation projection |
| `PanoptesTabNav.svelte` | UI / Presentation | accessible tab-like buttons、active styling、onChange intent | tab workflow/store mutation | props/native buttons | supplied/local presentation |

これは限定sampleであり、全Component Boundary auditではない。

## 12. Boundary violation patterns

| Violation | Why problematic | Correct owner | Refactoring direction |
| --- | --- | --- | --- |
| UI → API: Card/Button内で`fetch` | presentationがtransport、loading/error、authへ結合 | Feature Command + Client | UIは`onSelect/onSubmit`、Featureがcommand invoke |
| UI → Feature Store Mutation | mutation入口が分散し、invariant/stale guardを迂回 | Feature Controller/Action | UIはtyped payloadをcallback。Ownerがstore mutation |
| Layout → Feature Command | route family mount/navigationがuse case side effectを起こす | Feature | Layoutはcontext/childrenを渡し、Page/Featureがcommand開始 |
| Page → Business Rule | URL componentがeligibility/formulaの正本になる | Rails | PageはFeature assembly、Rails decisionをFeature経由で表示 |
| Feature → Rails Rule Duplication | BackendとFrontendが異なる結果を出す | Rails canonical rule | Featureはserver resultをorchestrateし、display mappingだけ行う |
| Composite → Use-case Owner | reusable sectionがcontroller/API/storeへ依存 | Feature | Compositeへview model + callbacksを渡し、side effectを上へ移す |

### Example: UI → API

```ts
// violation: presentation buttonがtransportを所有
async function retry() {
  await fetch('/api/panoptes/v1/jobs/retry', { method: 'POST' });
}
```

```text
UI onRetry()
  -> Feature controller.retryAnalysis()
  -> typed command/client
```

### Example: Layout → Feature Command

Layoutのmount時に「画面が開いたからanalysisを開始する」と実装すると、同じLayout配下の全page、navigation、remountがbusiness side effectになりうる。Layoutはverified contextをPage/Featureへ渡し、開始条件はFeature use caseとして明示する。

## 13. Naming traps

- **`PanoptesShellPage`:** Shell/Pageという名前でもFeature Orchestrator。
- **Header:** App HeaderはLayout-owned、Marketing HeaderはPage-owned。常にLayoutではない。
- **Form:** `SignUpForm`はcontroller/submit/resendを持つFeature。Form tagがあるだけのfield groupはUI/Compositeになりうる。
- **Surface/Panel/Card:** 見た目名からUIと決めない。Command/controller/state ownerを調べる。
- **Store import:** Storeをimportできることと、そのComponentがmutation ownerであることは別。

## 14. Dependency direction as a boundary rule

```text
Route Entry -> Page Entry -> Feature -> Composite -> UI -> Primitive
Layout -> Page children / UI / Primitive / approved context
```

### Forbidden reverse dependencies

- UI → Feature / Layout。
- Feature → Route Entry / Layout。
- Layout → Feature controller/command。
- Shared UI → Feature store/domain service。

FeatureはClient/API abstractionへ依存できるが、UIへtransport detailを渡さない。Layoutはapproved auth/contextを配布できるが、Feature mutationを始めない。Contextやstoreへ変更してもowner迂回は正当化されない。

## 15. Decision heuristic — この処理はどこへ置くか

1. **Canonical business decisionか？**  
   Yes → Rails。例: Analysis eligibility、Role authorization、Job transition。
2. **一つのuse caseのrequest/mutation/child coordinationか？**  
   Yes → Feature。例: retry Analysis、Signup submit。
3. **Route familyで持続するstructure/contextか？**  
   Yes → Layout。例: App Header、family shell width。
4. **Route固有のsection order/Feature assemblyか？**  
   Yes → Page Entry。例: Marketing Header + two Heroes。
5. **複数UIのpresentation-oriented compositionか？**  
   Yes → Composite。例: Roadmap Phase Card。
6. **Rendering、a11y、local interactionか？**  
   Yes → UI。例: tab buttons、status display。
7. **Semantics-neutralで安定した最小contractか？**  
   Yes → Primitive candidate。複数consumerとcontractを確認してから抽出。

複数に当てはまる場合は、external side effect、controller、canonical state mutationを持つownerを上位責務として選び、presentation部分を下位へ分離する。

## 16. Common misunderstandings

### 「Stateを持つのでFeature」

UIのopen/hover/input、Layoutのnavigation stateもstateである。Stateの意味とlifecycleで判断する。

### 「Event handlerがあるのでFeature」

UIはnative eventをtyped callbackへ変換できる。Commandを実行するownerかが境界。

### 「大きいComponentなのでFeature」

Sizeはsignalにすぎない。大きなpure presentationはComposite/UI、小さなcommand ownerはFeatureになりうる。

### 「HeaderはLayout」

Persistent route-family HeaderはLayout。Page固有HeaderはPage Entry ownerになりうる。

### 「FormはUI」

Fields表示だけならUI。Controller、submit/resend、async lifecycleを持てばFeature。

### 「Storeをimportしているので正しいFeature」

Store mutation authorityがそのComponentにあるかを確認する。UI/Compositeからの直接mutationは越境。

### 「Pageがuse-case owner」

Pageはroute-specific composition。Use caseはFeatureへ委譲する。

### 「Featureがbusiness rule owner」

FeatureはRails resultをorchestrateする。Canonical business decisionはRails。

## 17. Practice

### 17.1 Knowledge Check

1. Boundaryとfile分割の違いは何か。
2. Featureが所有するstateとUIが所有するstateを一つずつ挙げよ。
3. LayoutがFeature controllerを所有してはいけない理由は何か。
4. UIがcallbackを持ってもFeatureにならない理由は何か。
5. ControllerとCommandの違いは何か。
6. Page EntryとFeatureのcoordination単位はどう違うか。
7. Loading stateは常にUI ownerか。
8. FrontendがRails business ruleを複製してはいけない理由は何か。

### 17.2 Ownership Exercise

次を最も適切なownerへ分類する。

1. AnalysisJobの正式status。
2. Polling timerとretry/backoff presentation coordination。
3. Progress barの幅とtone。
4. App Headerのfixed positioning。
5. Signup email draft。
6. Active Organization membership。
7. Strategy task status更新intent。
8. Modal open。
9. Marketing Heroのsection order。
10. Projectを再分析可能かというcanonical eligibility。

### 17.3 Violation Detection

次のどこが越境かを答える。

```ts
// A: UI Card
async function onClick() {
  await fetch('/api/panoptes/v1/projects/1/reanalyze', { method: 'POST' });
}
```

```ts
// B: App +layout.svelte
onMount(() => analysisController.start());
```

```ts
// C: Composite
onclick={() => projectStore.update(markCompleted)}
```

```ts
// D: +page.svelte
const canAnalyze = plan === 'pro' && usage < 100;
```

```ts
// E: Feature
const canonicalScore = observations.reduce(calculateOfficialFormula, 0);
```

### 17.4 Refactoring Exercise

一つのCardが次をすべて行っている。

- API fetch。
- loading/error state。
- score formatting。
- retry button。
- global store mutation。
- HTML/CSS。

Feature / Composite / UI / Clientへ責務を分け、data/callback flowを示す。

### 17.5 Architecture Explanation

> なぜPanoptesではUIから直接Commandを呼ばず、typed callbackでFeature ownerへintentを返すのか。

Change isolation、reuse、testability、state mutation authority、error/retry lifecycleを含めて説明する。

## 18. Answers / Explanation Guide

### 18.1 Knowledge Check要点

1. Boundaryはdecision/mutation ownerのcontract、file分割は実装手段。
2. Feature: request/polling status。UI: open/pressed/temporary input。
3. Route family lifecycleとuse case side effectが結合し、全child routeへ影響するため。
4. Callbackはintent emissionであり、command/lifecycle ownershipではないため。
5. Controllerはlifecycle/async/state coordination、Commandはtyped use-case operation。
6. Pageはroute/section/Feature assembly、Featureはuse-case lifecycle。
7. Request loadingはFeature、spinner表示はUI。意味によって分かれる。
8. Backendと異なる判断、security bypass、version driftを起こすため。

### 18.2 Ownership回答

1. Rails canonical state。
2. Feature controller。
3. UI/presentation mapping。
4. App Layout。
5. Signup Featureまたはnearest field UI。Submit coordinationはFeature。
6. Rails canonical、SvelteKit serverはverified selection distribution。
7. UI/Compositeがcallbackでemitし、Featureがcommand invoke。
8. nearest UI/Composite。複数child coordination時のみlift。
9. Marketing Page Entry。
10. Rails。

### 18.3 Violation回答

- **A:** UI→API。`onRetry` callbackへ変え、Feature→Command→Clientへ移す。
- **B:** Layout→Feature Controller。Page/Feature lifecycleへ移す。
- **C:** Composite→Feature Store Mutation。typed callbackでownerへ返す。
- **D:** Page→Business Rule。Rails decisionをFeature経由で受ける。Pageはcomposeのみ。
- **E:** Feature→Canonical Formula Duplication。Rails formula resultを受け、Featureはdisplay mappingだけ行う。

### 18.4 Refactoring回答例

```text
UI Card
  owns: HTML/CSS、formatted props表示、onRetry emission

Composite
  owns: Card + Error/Loading child composition、callback forwarding

Feature
  owns: request status、retry handler、view-model mapping、state update coordination

Client
  owns: BFF path、transport validation、safe error mapping

Flow:
Feature view model -> Composite -> UI
UI onRetry -> Composite forward -> Feature handler -> Command/Client
```

Global store mutationはFeature controller/actionへ集約する。Canonical scoreはRailsから受け、formattingだけをview model/UIへ渡す。

### 18.5 Architecture Explanation回答例

UIがCommandを直接呼ぶと、presentation componentがrequest state、retry、authorization context、store mutationまで知る必要があり、別Featureで再利用しにくくなる。また複数のbuttonやCardが同じmutationを独立実行すると、loading/error/stale resultのauthorityが分散する。UIはtyped callbackでUser intentと必要なpayloadだけを返し、Feature ownerがcontrollerとCommandを通して一つのlifecycleとして処理する。これによりUIをprops/callbackだけでtestでき、Feature側ではcommand、error、retry、state transitionをまとめて検証できる。Canonical business decisionはさらにRailsへ委譲する。

## 19. Completion Criteria

| Criterion | Result |
| --- | --- |
| 1. Boundary purpose explained | `PASS` |
| 2. Feature responsibility explained | `PASS` |
| 3. UI responsibility explained | `PASS` |
| 4. Layout responsibility explained | `PASS` |
| 5. State ownership explained | `PASS` |
| 6. Controller/Command ownership explained | `PASS` |
| 7. Data Down / Callback Up explained | `PASS` |
| 8. Boundary violation patterns explained | `PASS` |
| 9. Representative repository mapping included | `PASS` |
| 10. Exercises + answers included | `PASS` |

M04 Authoring DoD: `10 / 10 PASS`  
Module status: `COMPLETE / READY_FOR_M05`

このstatusは教材artifactの完成を示す。Learner assessment合格、全Component Boundary audit、Source migration完了を意味しない。

## 20. Handoff to M05

次は`M05 — Directory Structure`。M03/M04で確定したCategoryとownershipを、Route、Page、Feature、Layout、Shared UI、Primitive、Previewのcanonical placementとmigration ruleへ写像する。

## References

- [Panoptes Technical Bootcamp](../panoptes-technical-bootcamp.md)
- [M01 Panoptes Overall Architecture](./01-panoptes-overall-architecture.md)
- [M02 Svelte / SvelteKit](./02-svelte-sveltekit.md)
- [M03 Component Taxonomy](./03-component-taxonomy.md)
- [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)
- [Panoptes Shell Flow](../../architecture/panoptes-shell-flow.md)
- [Frontend Route Ownership](../../architecture/frontend-route-ownership.md)

