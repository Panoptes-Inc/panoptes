# Module 06 — State / Controller / Command

Status: `COMPLETE / READY_FOR_M07`  
Phase: `TB-07`  
Prerequisites: `M01`, `M02`, `M03`, `M04`, `M05`  
Primary standards: [Frontend Structure Policy](../../architecture/frontend-structure-policy.md), [Frontend Standardization Plan](../../architecture/frontend-standardization-plan.md)

## 1. 学習目標（Learning goals）

このModuleを終えた学習者は、Panoptes Frontendについて次の内容を説明し、判断できます。

1. Persistent/Server/Feature/Presentation/Transient/Derived stateを区別する。
2. Stateのcanonical ownerとFrontend holderを区別する。
3. Controller、Store、View Model、Command、Clientの役割を分ける。
4. UI interactionからRails response表示までのflowを追跡する。
5. Loading/error、technical retry、business reanalysisを混同しない。
6. 現行実装、承認済みTarget、Deferredな分離を区別する。

本Moduleは既存standardと代表実装を教材化します。Command architectureの再設計、全Feature state audit、Source変更は行いません。

## 用語ガイド

- **State（状態）:** 画面や処理が現時点でどのような状況にあるかを表す値。
- **Controller:** Feature内のstate更新、入力処理、command呼び出し、子Component間の調整をまとめる役割。
- **Command:** 「分析を開始する」など、状態を変える意図を明示した操作。
- **Derived state（派生状態）:** 既存の状態から計算できる値。別の正本として重複保存しない。
- **State owner:** その状態を最終的に確定・変更できる主体。値を表示している場所とownerは同じとは限らない。

## 2. Stateとは何か

Stateは、時間、ユーザーの操作、Serverの応答、実行環境によって変わり、その後の表示・判断・処理に影響する値です。

たとえば次はすべてstateだが、同じownerではありません。

- Databaseへ保存されたProject。
- Railsが確定したAnalysisJob status。
- Frontendが現在読み込んでいるSnapshot projection。
- Requestが進行中かを示す`loading`。
- 選択中のtab。
- Modalが開いているか。
- 入力途中のURL。
- 他stateから計算した`canSubmit`。

重要なのは、画面に値が表示されていることと、Frontendがその値のSource of Truthであることは別という点です。

```text
Displayed by Frontend != Canonically owned by Frontend
```

### 一般的な分類

| 種類               | 意味                                                 | Typical persistence                              |
| ------------------ | ---------------------------------------------------- | ------------------------------------------------ |
| Persistent state   | process/reloadを越えて保持するbusiness data          | Database/backend                                 |
| Server state       | serverから取得し、serverがauthorityを持つdata        | Backend。Frontendはcache/projectionを保持        |
| Feature state      | 一つのuse caseのrequest/lifecycle/coordination state | Frontend lifecycle中。必要ならserver stateへ接続 |
| Presentation state | 表示方法、選択、formattingに関するstate              | Component/Composite lifecycle                    |
| Transient state    | 一時的interactionに最も近いstate                     | Local componentをdefault                         |
| Derived state      | 他stateから再計算できる値                            | 原則として別canonical valueにしない              |

永続化される状態とServerが返す状態は、重なることが多くても同じではありません。Serverの応答には、一時的なrequestのmetadataも含まれる可能性があります。この分類で、誰が変更でき、どこまで信頼でき、いつ消える値なのかを明確にします。

## 3. Panoptes State Model

M04で確定したFrontend ownership modelは4層です。Derived stateはこの4層の既存値から生成されるprojectionとして扱います。

| 状態の分類               | Canonical owner                                          | Frontend holder / mutation path                                                                   | 例                                                                                       |
| ------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Canonical / Server State | Rails + persistent backend                               | Client resultをFeature/controller/storeがprojectionとして保持。MutationはCommand→Client→BFF→Rails | Project、AnalysisJob、Snapshot、Role、workflow、canonical score、Organization membership |
| Feature State            | Feature controller/store、単一ownerならFeature component | Feature action/controllerがmutation                                                               | bootstrap、polling、request status、selected project workflow、command progress          |
| Presentation State       | UI/Compositeまたはpure view model                        | props/derived/local state。canonical stateを変更しない                                            | display label、tone、render mode、selected visual                                        |
| Transient State          | interactionに最も近いUI/Composite/Page                   | localをdefault。複数child coordination時だけFeatureへlift                                         | modal open、hover/focus、expanded、draft input                                           |

### Concrete examples

| 値                              | 管理・決定の責任を持つ主体                                 | Frontendでの意味                                                         |
| ------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| AnalysisJobの正式status         | Rails                                                      | Store/runtime modelはresponse projectionでありauthorityではない          |
| Snapshot metadata/content       | Rails/DB                                                   | Featureがrender用に保持し、UIへpropsで渡す                               |
| `runtimeStatus`, polling state  | Feature runtime                                            | Server statusをadapter/controller/actionがFrontend lifecycleへ写像した値 |
| selected tab                    | nearest presentation owner。現ShellではFeature-level local | 表示surfaceの選択でありbusiness truthではない                            |
| modal/create sheet open         | nearest coordinating Feature/UI                            | transient interaction                                                    |
| current Organization membership | Rails                                                      | SvelteKit/BFF/Featureはverified resultを利用するだけ                     |
| Signup form draft               | Signup Feature/field UI                                    | submit前のlocal Feature state                                            |
| `mainSurfaceRenderMode`         | derived presentation                                       | Project/runtime stateから再計算する表示projection                        |

## 4. Derived State

Derived stateは、既存stateから決定的に計算できる値です。

```text
source state -> pure calculation -> derived state
```

Examples:

- `loading` = statusが`submitting`または`resending`か。
- `canSubmit` = required inputs、validation、request stateから導出。
- `selectedCount` = selected itemsの長さ。
- `displayLabel` = canonical statusをpresentation wordingへmapping。
- `mainSurfaceRenderMode` = project detailとanalysis runtimeから導出。

### 保存しすぎない理由

元の値と派生値を別々に更新すると、片方の更新漏れによって矛盾が生じます。

```text
status = "submitting"
loading = false          # contradiction
```

元の値だけを更新し、派生値を再計算すれば、値の食い違いを減らせます。ただし、計算の負荷が大きい場合、過去の値自体に業務上の意味がある場合、Serverが確定値として返す場合は、単なる表示用の派生値ではない可能性があります。

### Svelte 5との関係

現行Repositoryでは二つの仕組みが確認できます。

- Component/runes stateの`$derived`。`PanoptesShellPage`の`reanalyzeDisabled`、`headerMeta`、Signupの`isLogin`等。
- Svelte storeの`derived(...)`。`mainSurfaceRenderMode`、`currentRenderableSnapshot`、`whitePanelPresentation`等。

どちらも「計算可能な値をもう一つのmutation authorityにしない」という原則を支えます。`$derived`を使っただけで値がbusiness-safeになるわけではなく、元のcanonical meaningはRails contractに従います。

## 5. State ownership rule

Stateのownerは「一番近いComponent」や「最初に値を作ったfile」だけで決めません。次を順に確認します。

1. **誰が変更理由を知っているか。** User interactionか、request lifecycleか、business transitionか。
2. **誰がlifecycleを所有するか。** mount/destroy、polling、abort、navigationを誰が管理するか。
3. **Canonical sourceは誰か。** Reloadや別clientでも同じであるべきならbackend authorityが必要か。
4. **誰が複数childをcoordinationするか。** Localで足りるか、Featureへliftすべきか。
5. **Persistenceは必要か。** Component破棄後も保持すべきか。
6. **Authorization/Organization boundaryが関係するか。** Frontend selectionをauthorityにできないか。

### Lift only when needed

Modalの開閉や入力途中の値は、原則として使う場所の近くで管理します。複数の子Componentが同じ状態を参照・更新し、Featureの一連の処理とも結び付く場合だけ、管理を上位へ引き上げます。Storeは共有の手段であり、管理責任を決める根拠ではありません。

## 6. Controller contract

Panoptes FrontendのControllerは、Featureの開始から終了までの流れと、その間の動作を調整する役割です。Rails/MVCのBackend Controllerとは異なります。

### Controller owns

- Feature mount/start/destroy、cleanup/abort。
- Polling、retry、reconnect、stale-result protection。
- Feature state transitionのcoordination。
- Command/Action invocation。
- Server resultをFeature state/view-model flowへ接続すること。
- Loading/error stateを一つのuse-case lifecycleとして調整すること。
- Child callbackをFeature operationへ接続すること。

### Controller does not own

- Rails business rule、authorization truth、database transaction。
- Persistent canonical state。
- Raw HTML/CSS、visual styling、Product copy。
- Global Layout/navigation responsibility。
- HTTP transportの細部。

### Repository shape

Controllerを巨大なclassにする必要はありません。現行`createPanoptesShellController`は、関数の外側の値を保持するclosureと、必要な処理を外から渡す依存性注入で構成されています。`mount`、`start`、`retryBootstrap`、`createProject`、`retryAnalysis`などを返します。AdapterがAction、Store、Clientとの接点を渡すため、Controllerの中心となる処理はUIやHTTPの詳細から分離されています。

Signupでは`createSignUpController`がform state、validation、submit/resend、navigation、cleanupをcoordinationします。実装形態は異なっても、Feature lifecycle ownerという役割は共通します。

## 7. Store, Controller, and View Model

| 概念                  | Primary question                       | 担当すること                                    | Does not automatically own                 |
| --------------------- | -------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| Store                 | 何をreactively保持するか               | state container、subscription                   | lifecycle、use-case、business rule         |
| Controller            | いつ何を実行し、どうcoordinationするか | lifecycle、behavior、commands、state transition | persistence truth、visual styling          |
| View Model / Selector | UIへ何をどの形で見せるか               | pure mapping、derived presentation              | side effect、transport、canonical mutation |

`analysisRuntimeStore`はruntime valuesを保持するが、自分でpolling開始条件やretry behaviorを決めません。`PanoptesShellController`とactions/polling controllerがbehaviorをcoordinationします。`presentation.ts`のselectorsはstoresからrender modeやlabelをderiveするが、serverをmutationしません。

Storeだけではuse-case orchestrationになりません。逆に、単一Feature component内で十分なstateを、標準化のためだけにglobal storeへ移す必要もありません。

## 8. Command contract

CommandはUser/Feature intentをtyped business operationとして表現するFrontend boundaryです。

```text
Command = what operation the Feature wants
Client  = how the request is transported
Rails   = whether/how the business transition is accepted
```

### Command owns

- Operation intentとtyped input/output。
- FeatureからClient invocationへの接続。
- `AbortSignal`、client injection等のtest可能なboundary。
- 承認済み範囲のsafe result/error normalization。
- Organization-scoped operationならexplicit `organizationId` input。

### Command does not own

- Canonical eligibility/authorization decision。
- Database transaction、official workflow transition、formula。
- UI rendering/local state。
- Raw provider errorをUIへ露出すること。
- Global storeやresponseからOrganization scopeを推測すること。

### CURRENT implementation terminology

現行Panoptes runtimeでは、`src/lib/panoptes/actions/analysis.ts`等のAction functionsがCommand相当のoperation intent、store updates、polling coordinationを同じmoduleで担う箇所があります。たとえば`createAndStartAnalysis`、`confirmInference`、`reanalyzeCurrentProject`が実在します。

これはCURRENTの実装形態であり、「全Featureが独立`commands/`とpure command contractへ移行済み」という意味ではありません。教材では次のように読みます。

- Function名とinput/outputからoperation intentを追う。
- Client callからtransport boundaryを分けて読む。
- Store mutation/polling coordinationは現行Action/Controller responsibilityとして認識する。
- 将来分離が必要でも、本Moduleでarchitectureを再設計しない。

## 9. Command vs API Client

ClientはHTTP transport contractを所有します。

| Command / Action                                   | Client                                              |
| -------------------------------------------------- | --------------------------------------------------- |
| `createAndStartAnalysis`を実行したい               | canonical BFF endpointへtyped requestを送る         |
| Feature stateをloadingへ進め、resultをcoordination | method/path/header/timeout/response assertionを扱う |
| safe errorをFeature lifecycleへ返す                | raw transport/provider errorをsafe errorへmapping   |
| operationの成功後に次のFeature actionへ接続        | UIやFeature stateを知らない                         |

現行`canonical-bff-client.ts`はsame-origin base `/api/panoptes/v1`、typed response assertion、timeout/AbortSignal、safe error boundaryを持ちます。Command/Actionは「分析開始」「推論確定」等を表し、ClientのURLやHTTP detailsをUIへ漏らしません。

## 10. UI → Controller → Command flow

Canonical flow:

```text
User Interaction
  -> UI typed callback
  -> Feature owner handler
  -> Controller
  -> Command / current Action
  -> Client
  -> SvelteKit BFF
  -> Rails

Rails response
  -> BFF / Client validation
  -> Command / current Action
  -> Controller / Feature state
  -> View Model / Derived state
  -> UI props
```

### Current Analysis retry trace

1. `PanoptesAnalysisFailureState`のbuttonが`onRetry` intentをemitする。
2. `PanoptesAnalysisSurface`と`PanoptesShellMainSurface`がcallbackをforwardする。
3. `PanoptesShellPage`が`controller.retryAnalysis`を渡している。
4. Controllerはcurrent projectの有無を判断し、`reanalyze` Actionを呼ぶかcreate flowを開く。
5. `reanalyzeCurrentProject` ActionがClientを呼び、responseをstoresへ反映し、pollingを同期する。
6. Selectors/view modelが更新stateをUI propsへ写像する。

UIが直接Command/fetch/store mutationを行うと、operation lifecycle、error/retry、authorization context、state mutation authorityがpresentationへ分散します。Callbackは単なるevent forwardingではなく、intentを正しいownerへ戻すboundaryです。

## 11. Server canonical boundary

Frontend Controller/Command/StoreはBusiness Source of Truthではありません。

### Frontend may

- User intentをtyped operationとして送る。
- Client-side input formatを早期検証する。
- Request/loading/error lifecycleをcoordinationする。
- Rails responseをdisplay-safe view modelへmappingする。
- 操作中の重複clickを抑止する。

### Rails owns

- AuthorizationとOrganization access decision。
- Canonical eligibility。
- AnalysisJob transition。
- Snapshot commit/history。
- Official score/formula/workflow。
- Persistent transaction outcome。

たとえばFrontendで`plan === 'premium'`ならAnalysis可能と確定してはいけません。UIを無効化するpresentation hintは使えても、Railsが同じoperationを再検証し、canonical outcomeを返す必要があります。

Organizationの境界も同様です。Frontendで選択したIDは要求する対象を示す入力であり、所属を証明するものではありません。現行`loadOrganizationBoundary`はClientの結果を検証しますが、最終的な認可の判断はRailsにあります。

## 12. Loading, error, partial, and retry

### Technical request stateとBusiness lifecycleを分ける

| 種類               | 例                                                                                         | Owner / meaning                                    |
| ------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Request state      | `idle`, `loading/submitting`, `success`, `failed`                                          | Feature Controller/Actionの一回のrequest lifecycle |
| Polling state      | `polling`, `backoff`, `stopped`                                                            | Frontend technical execution                       |
| Business lifecycle | `queued`, `running`, `awaiting_confirmation`, `completed`, `partially_completed`, `failed` | Railsが確定するAnalysisJob state                   |
| UI representation  | spinner、warning、failed panel、partial notice                                             | UI Regulationに従うpresentation                    |

`loading`はrequestの処理中を表しますが、AnalysisJobが業務上のrunning状態にあるとは限りません。HTTP requestが完了してJobがqueuedになった場合、requestのloadingは終わっても分析処理は続きます。

`partial`や`limited`はgeneric technical failureに潰しません。`partially_completed`は利用可能な結果と不足を持つProduct outcomeであり、単なるfetch failureとは異なります。

### Retryの種類

```text
technical retry       = 同じtechnical attemptを再試行する
bootstrap retry       = Frontend初期化を再実行する
business reanalysis   = 新しいAnalysis operation/Jobを開始する
```

- Polling timeout後のbackoff/retryはtechnical execution。
- `retryBootstrap`は失敗したFeature bootstrapの再実行。
- `reanalyzeCurrentProject`は既存Snapshotを保持しつつ新しい分析を開始するbusiness operation。

したがって`retry != new business operation`。現行Controller method名`retryAnalysis`はUI intentを受けるが、current projectがある場合はbusiness reanalysisへ接続するため、実際のsemanticsを追って読む必要があります。Queue retry、idempotency、AnalysisJob retry policyの詳細は後続Moduleへ送ります。

## 13. CURRENT / TARGET / DEFERRED

| 状態       | Meaning in this Module                                                                       |
| ---------- | -------------------------------------------------------------------------------------------- |
| `CURRENT`  | Repositoryで実装を確認できるstate/store/controller/action/client/callback flow               |
| `TARGET`   | Structure Policyで承認済みのownershipとdependency direction                                  |
| `DEFERRED` | 個別Featureへの全面適用、Action/Command分離、未実装backend/operation、migration/verification |

### Current

- Panoptes Shell controllerとdependency adapter。
- Analysis/Project/Strategy actions、runtime/project/session/strategy stores。
- Canonical BFF client boundary。
- Presentation selectorsとcallback-only UI surfaces。
- Signup controllerとSvelte runes form state。

### Target

- UI→callback→Feature owner→Controller→typed Command→Client→BFF→Rails。
- Store mutationはFeature Action/Controllerを経由。
- Organization scopeはexplicit inputとserver verification。
- Canonical business decisionはRails。

### Deferred

- 全Featureを同じController/Command形へ移行すること。
- 現行`actions`を個別`commands/`へ再配置・分離すること。
- Rails/Queue/Workerの後続business implementation。
- 全state ownership auditとruntime browser verification。

「標準として決まっている」と「全Featureへ実装済み」は同義ではありません。

## 14. Representative repository mapping

以下は限定確認した11例であり、Repo-wide state/controller auditではありません。

| Source                                                                    | 状態の管理元                                                | Controllerの責務                                                   | Command・操作の責務                                                     | 正本                                             | 状態                                                      |
| ------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| `ComponentsBase/Panoptes/PanoptesShellPage.svelte`                        | Feature-level local + subscribed store projection           | Controller mount、callbacks接続、derived view data                 | Controller methodへintentを渡す                                         | Project/Job/SnapshotはRails                      | `CURRENT`, component placement migration deferred         |
| `features/panoptes-shell/controller/panoptes-shell-controller.ts`         | bootstrap statusをclosure内保持                             | mount/destroy、abort、reconnect、bootstrap、operation coordination | injected dependenciesをintent methodへ束ねる                            | Rails resultをdependency経由で受ける             | `CURRENT = TARGET responsibility`                         |
| `features/panoptes-shell/controller/panoptes-shell-controller-adapter.ts` | Store stateを読むがauthorityではない                        | concrete actions/stores/client boundaryをinject                    | Analysis/Project/Strategy actionsへ接続                                 | Rails/BFF                                        | `CURRENT = TARGET placement`                              |
| `panoptes/actions/analysis.ts`                                            | runtime/project/session storeをFeature projectionとして更新 | polling、result reconciliationも現状同居                           | `createAndStartAnalysis`, `confirmInference`, `reanalyzeCurrentProject` | Rails AnalysisJob/Project/Snapshot               | `CURRENT action/command-equivalent`; finer split deferred |
| `panoptes/api/canonical-bff-client.ts`                                    | stateを所有しない                                           | controllerではない                                                 | typed HTTP、timeout/abort、response assertion、安全なerror              | BFF/Rails response                               | `CURRENT client boundary`                                 |
| `panoptes/stores/runtime.ts`                                              | Frontend runtime projection                                 | behaviorを所有しない                                               | operationなし                                                           | Rails statusをadapter/actionがprojection化       | `CURRENT store container`                                 |
| `panoptes/stores/projects.ts`                                             | Project list/detailのFrontend projection                    | behaviorを所有しない                                               | operationなし                                                           | Rails Project/Snapshot                           | `CURRENT store container`                                 |
| `panoptes/selectors/presentation.ts`                                      | stateをcanonical保存しない                                  | controllerではない                                                 | operationなし                                                           | input storesのmeaningに従う                      | `CURRENT derived view model`                              |
| `Panoptes/analysis/PanoptesAnalysisSurface.svelte`                        | supplied props + presentation branch                        | controllerを持たない                                               | `onConfirm/onRetry`等のintent callbackのみ                              | supplied Feature/Rails projection                | `CURRENT callback-only UI`                                |
| `features/auth/signup/state/signup-controller.svelte.ts`                  | Signup form/request stateをcoordination                     | validate、submit/resend、navigation、cleanup                       | Auth/Waitlist service operationsへ接続                                  | Supabase/BFF result。Authorization truthはserver | `CURRENT Feature controller`                              |
| `features/auth/signup/state/signup-form-state.svelte.ts`                  | `$state`でform/transient/request stateを保持                | cooldown helper以外のuse-case transportを持たない                  | operationなし                                                           | DraftはFrontend、account outcomeはserver         | `CURRENT state holder`                                    |

## 15. Decision heuristic — このロジックはどこか

1. **Persistent/canonical business truthか？**  
   → Rails/backend。例: AnalysisJob status、membership、Snapshot commit。
2. **Use-case lifecycle/coordinationか？**  
   → Feature Controller。例: bootstrap、polling sync、cleanup。
3. **User intentを表すtyped operationか？**  
   → Command。現行ではAction functionが相当する場合があります。
4. **HTTP method/path/timeout/response validationか？**  
   → Client。
5. **複数consumerが購読するreactive Feature valueか？**  
   → Feature Store。Mutation authorityはController/Action。
6. **表示・local interactionだけか？**  
   → UI/Composite state。
7. **既存stateから再計算できるか？**  
   → Derived state/view model。別canonical mutationを作りません。

複数に見える場合は、side effect、lifecycle、canonical mutationを所有する責務を先に分離し、presentationをprops/callback側へ残します。

## 16. Common misunderstandings

### 「Store = Controller」

Storeはcontainer、Controllerはbehavior/lifecycle。Storeがあるだけではpollingやcleanupは定義されません。

### 「Frontend Controller = Backend Controller」

Frontend ControllerはUI Feature lifecycle owner。Rails Controller/API layerとはprocess、authority、responsibilityが異なります。

### 「Command = API Client」

Commandは「何をするか」、Clientは「どうtransportするか」。同じfunctionに混在するCURRENT実装があっても概念境界は別。

### 「UI event handler = Command」

`onclick={() => onRetry()}`はintent emission。Canonical operationをcoordinationするCommandではありません。

### 「Frontend state = canonical business state」

StoreはRails responseのprojection/cache。Reload、別client、authorizationに耐えるauthorityはBackend。

### 「Derived stateは全部保存する」

Sourceとの二重mutationが矛盾を生みます。計算可能ならderiveします。

### 「loading = business lifecycle」

Request loadingとAnalysisJob runningは別。HTTP完了後もasync Jobは継続する可能性があります。

### 「Featureがbusiness ruleを決める」

FeatureはRails resultをorchestrateします。Eligibility、authorization、official transitionはRails。

### 「API responseをUIが直接解釈すればよい」

Client assertion、adapter、Feature mappingを経てdisplay-safe contractへします。UIがraw provider statusやerrorからcanonical outcomeを作りません。

## 17. Practice

### 17.1 Knowledge Check

1. Server stateをFrontend Storeが保持しても、StoreがSource of Truthにならない理由は何か。
2. Feature stateとPresentation stateの違いを例で説明してください。
3. ControllerとStoreはどう違うか。
4. CommandとClientはどう違うか。
5. Derived stateを別々にmutationする危険は何か。
6. Request loadingとAnalysisJob statusはどう違うか。
7. ControllerがRails authorization ruleを持てない理由は何か。
8. UI callbackはCommandそのものか。

### 17.2 Ownership Exercise

次を最も適切なownerへ分類します。

1. Organization membershipのactive判定。
2. AnalysisJobの`partially_completed` status。
3. Polling timerとbackoff。
4. Retry buttonのpressed/focus state。
5. Signup email draft。
6. `mainSurfaceRenderMode`。
7. Snapshotの正式commit結果。
8. create requestの`submitting` state。
9. selected tab。
10. HTTP timeout処理。

### 17.3 Flow Trace

次を、Failure UIの「再試行」clickから更新画面表示までの順に並べてください。

- Client/BFF request。
- UI callback。
- Derived selector/view model更新。
- Rails operation/response。
- Controller handler。
- Store/Feature state update。
- Action/Command-equivalent invocation。
- UI props/render。

### 17.4 Violation Detection

```ts
// A: presentation component
onclick={async () => {
  const response = await fetch('/api/panoptes/v1/jobs/1/retry');
  analysisRuntimeStore.set(await response.json());
}}
```

```ts
// B: store helper
export const canAnalyze = derived(planStore, ($plan) => $plan.name === 'premium');
// この値をauthorization truthとしてrequestを許可する
```

```ts
// C: command
if (membership.role !== 'owner') throw new Error('Forbidden');
// Railsへ送らず、この判定だけで正式拒否する
```

```ts
// D: component
let loading = $state(false);
let status = $state<'idle' | 'submitting'>('idle');
// 両方を別々のhandlerで更新する
```

各例の越境、正しいowner、修正方向を答えてください。

### 17.5 Design Exercise — Start Analysis

「UserがAnalysisを開始する」機能を次へ分けます。

- UI。
- Feature Controller。
- Command。
- Client。
- Rails。
- Feature State / Store。
- Derived View Model。

Organization scope、loading/error、idempotency intent、response表示も含めます。

## 18. Answers / Explanation Guide

### 18.1 Knowledge Check要点

1. Storeはserver responseのFrontend projectionで、reload/他client/persistence/authorizationを確定できないため。
2. Feature stateはrequest/polling等のuse-case lifecycle、Presentation stateはselected visual/modal open等の表示interaction。
3. Storeはreactive container、Controllerはlifecycle・behavior・operation coordination。
4. Commandはoperation intent、ClientはHTTP transport。
5. Sourceとderived valueの同期漏れで矛盾する。
6. Loadingは一回のtechnical request、Job statusはRailsが確定するasync business lifecycle。
7. Client改変で迂回でき、Backend transaction/role/current dataと一貫しないため。
8. いいえ。Callbackはintentをownerへ返すboundaryで、CommandはFeature側のtyped operation。

### 18.2 Ownership回答

1. Rails。Frontendはverified resultを保持。
2. Rails/AnalysisJob canonical state。
3. Feature Controller/polling controller。
4. Nearest UI。
5. Signup Feature/field UI。Submit lifecycleはController。
6. Derived presentation selector。
7. Rails/DB。
8. Feature Controller/Action state。
9. Nearest presentation owner。現ShellではFeature local。
10. Client transport boundary。Retry coordinationはController。

### 18.3 Flow Trace回答

```text
UI callback
  -> Controller handler
  -> Action/Command-equivalent invocation
  -> Client/BFF request
  -> Rails operation/response
  -> Store/Feature state update
  -> Derived selector/view model update
  -> UI props/render
```

Errorの場合もClient safe error→Action/Controller error state→UI representationというowner chainを維持します。

### 18.4 Violation回答

- **A:** UI→fetch/store mutation。UIは`onRetry`だけをemitし、Controller→Command/Action→Clientへ移す。
- **B:** Store/Frontend→authorization truth。値はpresentation hintには使えても、Railsがeligibility/authorizationを再判定する。
- **C:** Command→canonical authorization decision。Client-side guardはUX最適化に限定し、operationをRailsへ送りserver outcomeをauthorityにする。
- **D:** Duplicate derived state。`loading`を`status`から`$derived`するか、単一state machineにする。

### 18.5 Design Exercise回答例

```text
UI
  emits onStartAnalysis({ targetUrl, projectName })

Feature Controller
  owns duplicate-submit guard, request lifecycle, cleanup, result coordination

Command
  receives explicit organizationId + typed input + idempotency intent
  invokes Client and returns normalized result/error

Client
  sends typed same-origin BFF request with timeout/AbortSignal

SvelteKit BFF / Rails
  revalidates session + Organization scope
  Rails decides authorization/eligibility and creates canonical Project/AnalysisJob

Feature State / Store
  holds submitting/error and returned Project/Job projection

Derived View Model
  maps request + Job state to button disabled, progress surface, safe labels

UI
  renders props and emits retry/cancel/confirm intent
```

Frontend URL format validationやduplicate click抑止は可能だが、Analysis eligibilityやJob transitionはRailsが確定します。Technical request failureとbusiness rejectionは別error contractとして表示します。

## 19. Completion Criteria

| Criterion                               | Result |
| --------------------------------------- | ------ |
| 1. State fundamentals explained         | `PASS` |
| 2. Panoptes state classes explained     | `PASS` |
| 3. ownership rule explained             | `PASS` |
| 4. derived state explained              | `PASS` |
| 5. Controller responsibility explained  | `PASS` |
| 6. Command responsibility explained     | `PASS` |
| 7. UI→Controller→Command flow explained | `PASS` |
| 8. Server canonical boundary explained  | `PASS` |
| 9. Representative mapping included      | `PASS` |
| 10. Exercises + answers included        | `PASS` |

M06 Authoring DoD: `10 / 10 PASS`  
Module status: `COMPLETE / READY_FOR_M07`

このstatusは教材artifactの完成を示します。Learner assessment合格、全FeatureへのController/Command適用、Backend business implementation、Source migration完了を意味しません。

## 20. Handoff to M07

次は`M07 — BFF`。M06のCommand/Client boundaryを前提に、SvelteKit BFFがsession/cookie、Organization boundary、Rails proxy、安全なresponse/error shapingをどう担当し、なぜbusiness Source of Truthにならないかを学びます。

## References

- [Panoptes Technical Bootcamp](../panoptes-technical-bootcamp.md)
- [M01 Panoptes Overall Architecture](./01-panoptes-overall-architecture.md)
- [M02 Svelte / SvelteKit](./02-svelte-sveltekit.md)
- [M03 Component Taxonomy](./03-component-taxonomy.md)
- [M04 Feature / UI / Layout Boundary](./04-feature-ui-layout-boundary.md)
- [M05 Directory Structure](./05-directory-structure.md)
- [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)
- [Frontend Standardization Plan](../../architecture/frontend-standardization-plan.md)
