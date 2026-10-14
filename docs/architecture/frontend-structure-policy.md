# Panoptes Frontend Structure Policy

更新日: 2026-09-14（Phase FS-10 Explicit Product Owner Approval Record）  
Status: Frontend構造整理方針の正本

## 1. Purpose

本書はPanoptes FrontendのComponent、Feature、Route、Layout、Preview、View Model、Mapping、Controller、Command、Client、Stateの責任境界と依存方向を定める。B-3A〜B-3Rの実装・Active Graph・責務監査を根拠とし、一般論だけで既存構造を置き換えない。

この方針は新規コードへ即時適用し、既存コードは段階移行する。B-3S完了は全directory移動やrenameの完了を意味しない。

## 2. Architecture Principles

正本となるruntime flowは次の通り。

```text
Svelte UI
  -> Feature View Models / Commands
  -> Canonical Client
  -> SvelteKit BFF (/api/panoptes/v1)
  -> Rails Business API
```

| Layer   | Owns                                                             | Must not own                                   |
| ------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| UI      | 表示、local interaction、transient state                         | Rails URL、raw response、business formula      |
| Feature | feature composition、view model、command、controller             | cookie/session forwarding、Rails authorization |
| Client  | typed transport、error boundary、AbortSignal                     | UI state、production mock fallback             |
| BFF     | session/cookie、Organization boundary、Rails proxy、safe shaping | Product business source of truth               |
| Rails   | business state、authorization、formula/workflow source of truth  | browser presentation state                     |

Architectureは配置・依存・分離を決める。Productの表示意味、URL意味、formula、workflowは決めない。

## 3. Component Taxonomy

Primary Categoryは次の8種とする。file名や現行directoryではなく、primary responsibilityで判定する。

| Type | Purpose | May own | Must not own | Allowed dependencies | Reuse / state |
| --- | --- | --- | --- | --- | --- |
| Route Entry | SvelteKit URL/data boundary | typed route data/params受渡し、Page Entry選択 | feature orchestration、raw fetch、business mapping | route types、Page Entry | URL単位 / route dataのみ |
| Page Entry | routeとfeature compositionの接続 | route context注入、page-level composition、command invocation | raw transport、canonical business rule | Feature、Composite、UI、Primitive | route family / minimal page UI state |
| Layout / Shell | persistent screen/family structure | shared Header/navigation、family spacing、global/family lifecycle | page固有content、use-case orchestration、空pass-through | Page Entry children、UI、Primitive、approved context | route family / persistent UI state |
| Feature | 一つのuse caseまたは変更理由 | feature composition、view-model mapping、controller/command invocation、feature UI state | direct Rails/BFF transport、他feature内部state、canonical business rule | feature-local controller/command/mapping、Composite、UI、Primitive | feature内 / use-case UI state |
| Composite | cohesive child群のpresentation composition | section order、props adaptation、callback forwarding、local selection | transport、command実行、business rule、unrelated feature orchestration | same-feature Composite、UI、Primitive | feature/domain内 / local selectionのみ |
| UI / Presentation | props中心の表示と操作 | display formatting、native interaction、accessibility、presentation state | API、store、business mutation、canonical threshold/formula | Primitive、presentation-only types/helpers | semantic contract一致範囲 / component-local UI |
| Primitive | 最小のsemantics-neutral UI contract | native element wrapper、accessibility、Token適用、ephemeral interaction | domain copy/model、Feature/Composite依存、business state | platform/native API、Token | cross-feature候補 / ephemeral stateのみ |
| Preview | deterministicなpreview composition | preview contract、Fixture、固定initial state | runtime store/controller、BFF fallback、production mutation | Feature/Composite/UI/Primitiveのpure surface、Fixture | preview用途 / preview-local state |

`Domain-specific reusable`はPrimary CategoryではなくReuse Scope Qualifierとする。Feature、Composite、UIへ付与できるが、依存方向やbusiness logic許可を緩和しない。`Route-level`は曖昧なためcanonical labelに使わず、framework boundaryを`Route Entry`、route compositionを`Page Entry`と呼ぶ。

Business Logicの正本はRailsである。Frontendが所有できるのはpresentation logic、local interaction、composition、display-safe view-model mapping、typed command invocationまでとする。

「Page Entry」とSvelteKitの「Route Entry」は別物である。Route fileが数行でもframework boundaryとして意味があり、不要wrapperとは分類しない。

`PanoptesShellPage`はcontroller、複数store、command orchestrationを所有するため、現状のPrimary Categoryは`Feature`である。名称の`Shell`だけでLayoutへ分類しない。具体的なFeature/Layout state境界はPhase FS-03で扱う。

## 4. Route and Layout Policy

### Route Entry

```text
routes/x/+page.svelte
  -> feature Page Entry / canonical component
```

- route fileは薄くてよい。typed route data、params、URL固有entryの接続に限定する。
- 同じcompositionを複数URLが使う場合、compositionを共有しroute entryは残す。
- route sourceの同一性だけでredirect/deleteしない。
- route fileにraw fetch、controller実装、large markup、business mappingを置かない。

### Layout

Layoutが所有できるのはglobal bootstrap、検証済みsession/auth contextの配布、persistent route-family shell、shared navigation、family-wide CSSである。Page固有Hero、feature固有business logic、将来用途だけの空boundaryは禁止する。例外はroute-family chromeとしてownerと表示条件が明文化されたHeroだけで、現行App Top Heroが該当する。同じHeroをLayoutとPageの双方でrenderしない。load/context/CSS/auth/persistent UIを持たないchildren-only layoutは作らない。

### Header ownership

HeaderはGlobal Singletonではない。MarketingはPage-owned composition、Appはpersistent App layout-ownedという`MIXED_INTENTIONAL`を許可する。variant、navigation、modal/auth responsibilityが異なるためである。Headerの責務変更時はroute family ownerを明記し、共通visualだけを理由に所有場所を統一しない。

### Hero and Shell ownership

- HeroはPage Entry ownershipをdefaultとする。Marketing Primary/Secondary Heroは`MarketingLandingPage`が所有する。
- App Top Heroは既存route-family chromeとして`src/routes/app/+layout.svelte`が所有し、`/app`表示条件だけをLayoutで導出する。use-case stateやcommandをHero/Layoutへ置かない。
- SvelteKit Layoutはpersistent framework structure、Feature Shellはuse-case orchestrationである。`PanoptesShellPage`は名称にかかわらずFeature Orchestratorで、`PanoptesShellMainSurface`へview stateとcallbacksを渡す。
- Header/Hero/Shellのvisual component内部はpresentation/transient stateを持てるが、配置ownerのLayout/Page/Feature責務を引き取らない。

### Canonical Feature / UI / Layout boundary

| Concern | Feature | UI / Presentation | Layout / Shell |
| --- | --- | --- | --- |
| Composition | use-case child coordination | propsに基づくrender/local composition | persistent chrome、slot/children arrangement |
| State | feature lifecycle、request/mutation state | presentation/transient state | route-family chrome/context state |
| Controller | create/own/invoke | import/ownしない | feature controllerをown/invokeしない |
| Command | typed use-caseとしてinvoke | typed callbackでintentをemit | feature commandをexecuteしない |
| Mapping | server/domainからview model | display formattingのみ | route/context shapingのみ |
| Loading/error | request lifecycleとretry intent | supplied stateを表示しcallback emit | global navigation/session shellだけ |
| Business logic | Rails resultをorchestrate | 所有しない | 所有しない |

## 5. Feature Policy

`src/lib/features/<feature>`は一つのfeature変更理由を閉じ込める。

置いてよいもの:

- `components/`: feature固有view/composition。
- `controller/`または`state/`: lifecycle、async orchestration、state transition。
- `commands/`: explicit inputを受けるuse-case command。
- `mapping/`: domain/API modelからdisplay-safe view modelへのpure変換。
- `services/`: feature固有外部service adapter。canonical business transportはClientへ置く。
- `types.ts`: feature public contract。
- `utils/`, `validation/`: feature内だけで意味を持つpure rule。
- 対応test。repoでは現状root `tests/`をcanonical test locationとする。

`src/lib/components`へ残すのはfeature非依存のpresentation、既存canonicalで移動リスクが高いcomponent、段階移行待ちのlegacy componentである。新規feature compositionを`ComponentsBase`へ追加しない。

Featureのpublic entryは必要なexportだけを`index.ts`から公開できる。barrelは依存を隠すための大量再exportに使わず、feature外consumer向けの安定した少数entryに限定する。

## 6. ComponentsBase Decision

Decision: `GRADUAL_DEPRECATION`。

`ComponentsBase`は現在、Admin/Auth/Landing/Shell/Self/Competitor/Strategy/Industryのfeature composition、shared-looking UI、preview、fixture/data mapping、modal entryを含むlegacy bucketであり、単一domainでもUI primitivesだけでもない。

ルール:

1. 新規feature/componentのdefault placementにしない。
2. 現行canonical pathは一括移動しない。
3. 対象を機能変更で触る際、責務とconsumerが明確ならfeature/shared targetへ移す。
4. 移動は同一Phaseでimports/tests/docsを更新し、原則compatibility aliasを残さない。
5. Product未確定、visual baseline不足、cross-feature contract不明なら現位置を例外として維持する。

## 7. Preview Policy

| Term           | Meaning                                      | Production reachable | Runtime dependency                           |
| -------------- | -------------------------------------------- | -------------------: | -------------------------------------------- |
| Preview        | Product screenshot/Marketing表示用の決定的UI |              allowed | BFF/controller/runtime storeへ依存しない     |
| Fixture        | Preview/testへ渡す決定的入力data             |     data itself only | networkなし                                  |
| Mock           | API/transportの代替実装                      |        dev/test only | production canonical failureからfallback禁止 |
| Dummy          | 意味あるcontractを持たない一時placeholder    |          discouraged | none                                         |
| Actual Runtime | authenticated feature runtime                |                  yes | command/client/BFFを正規経路で利用           |

Production-reachable visualは`Preview`、test inputは`Fixture`、API substitutionは`Mock`と命名する。現在の`PanoptesAppShellDummy`、`HeaderDummy`、`SearchBarDummy`、`AppTopDummy`、`AppResultsDummy`は実態がPreview/preview fixtureでありlegacy namingとして記録するが、B-3Sではrenameしない。

Previewは専用contractとdeterministic fixtureを持ち、runtime BFF、runtime controller、Organization storeを利用しない。Actual Appとpure presentation componentを共有する場合は、同じ責務・Product semantics・interaction contractであることを先に確認する。Marketing PreviewからActual App Shellへ直接接続しない。

## 8. Wrapper and Canonical Import Policy

| Wrapper               | Permitted      | Naming/documentation                              | Removal criteria                   |
| --------------------- | -------------- | ------------------------------------------------- | ---------------------------------- |
| Route Entry Wrapper   | yes            | framework route名。URL intent記録                 | URL廃止/redirectのProduct決定後    |
| Feature Entry Wrapper | yes            | feature purposeを表す                             | 独自composition/contractが消えた時 |
| Compatibility Wrapper | exceptional    | canonical target、consumer、owner、期限を必須記録 | 全consumer移行、external risk 0    |
| Preview Alias Wrapper | discouraged    | presetを自身が所有する場合のみ                    | childへの透明透過になった時        |
| Legacy Wrapper        | temporary only | `legacy`理由、ticket、廃止条件                    | 参照0と回帰検証完了                |

Internal callerはcanonical component/helperを直接参照する。不要なalias layerを作らない。ただしroute entry、feature public entry、client interfaceなど意味のあるmodule boundaryは許可する。透明Compatibility Wrapperを常態化させない。

## 9. View Model and Mapping Policy

View Modelは`Domain/API model -> display-safe model -> Svelte UI`の一方向境界である。

含めてよいもの:

- label/date/percentage等のdisplay formatting。
- malformed/optional inputのsafe fallback。
- derived display state、normalized/keyed list、display order。
- safe external URL、tone/status presentation mapping。

含めないもの:

- API access、persistence、store mutation、async orchestration。
- canonical score formula、axis定義、business threshold、eligibility、usage calculation。
- Product不明値の推測補完。

Pure presentation helperはfeature mappingの近くに置く。複数featureで共有する前にProduct semanticsが同一と確認する。Competitorの24°/30°score ring差は同一metricでもformula理由が不明なため、clamp/gradient constructionだけ共有しpublic formulaは分ける現在判断を維持する。

## 10. Controller, Command, and Client Policy

### Controller

Controllerはasync orchestration、mount/destroy、polling、retry、abort、reconnect、feature command coordination、state transition、stale-result protectionを所有する。Componentから分離するsignalは、timer/network/browser lifecycle、複数store mutation、複数async branch、cleanup/abort、testすべきstate machineの存在である。markup、CSS、raw HTTP、Product copyは所有しない。

### Command

- typed input/outputを持つ。
- Organization-scoped commandは`organizationId`を必須inputとして明示する。
- `AbortSignal`とclient injectionを許容し、test可能にする。
- global storeやresponseからOrganization scopeを推測しない。
- commandはUI eventをuse caseへ接続し、transport detailをclientへ委譲する。

### Client

- typed request/response boundary、same-origin BFF base `/api/panoptes/v1`、`AbortSignal`、timeout、safe error mappingを持つ。
- provider/raw errorをUIへ露出しない。
- production canonical failureからmockへfallbackしない。
- Rails未実装endpointにlegacy pathを推測して送信しない。明示的unavailable errorとDEFERを用いる。
- cookie/session/Organization再検証はBFF/Railsへ委譲する。

### Invocation and callback boundary

- Controllerの作成・lifecycle・cleanupはFeature ownerが担当する。Layout、UI、Compositeはfeature controllerをimportしない。
- Command invocationはFeatureまたは明示Page Entryに限定し、UI/Compositeは`onRetry`、`onSelect`、`onSubmit`等のtyped callbackでintentを上げる。
- data/stateはownerからchildへ、interaction intentはcallbackでownerへ流す。callbackはdomain intentと必要なtyped payloadを表し、transport responseやstore mutationを隠さない。
- propsは局所treeのdefault。contextは安定したroute-family infrastructure、storeは複数component/lifecycleが同一feature stateを共有する場合だけ使用する。手段を変えてownerを迂回しない。
- loading/errorのcanonical reasonはBackend/Client/Controllerから受け、Featureがretry/cancel等のuse-caseへ接続する。UIは表示とcallback emissionに限定し、silent fallbackやbusiness outcomeを作らない。

## 11. State Ownership and Store Policy

| State class | Canonical owner | Frontend holder / mutation path | Example |
| --- | --- | --- | --- |
| Server / canonical state | Rails | Client resultをFeature controller/store/cacheが保持。mutationはCommand → Client → BFF → Rails | project、job、snapshot、role、workflow、canonical score |
| Feature state | Feature controller/store、単一ownerならFeature component | Feature action/controllerだけがmutation | polling、bootstrap、request status、selected project workflow |
| Presentation state | UI/Compositeまたはpure view-model mapping | props/derived state。canonical stateを変更しない | label、tone、formatted percentage、selected projection |
| Transient interaction state | interactionに最も近いUI/Composite/Page | local stateをdefault。複数child coordination時だけFeatureへlift | modal open、hover/focus、expanded、draft input |

Business decisionのSource of Truthは常にRailsであり、Frontend cache/storeはcanonical ownerではない。Storeは複数component/lifecycleから同じstateを購読・更新する必要がある場合だけ使う。単一componentのstateをglobal化せず、Organization scopeをstoreから推測しない。Store mutationはcommand/action/controllerを経由し、presentation componentから直接行わない。

## 12. Directory Target Policy

```text
src/
├─ routes/                              # SvelteKit framework boundary
│  └─ **/+page.svelte, +layout.svelte   # thin Route Entry / Framework Layout
└─ lib/
   ├─ features/<feature>/
   │  ├─ pages/                         # Page Entry
   │  ├─ components/                    # Feature / feature-local Composite・UI
   │  ├─ controller/, commands/, state/ # 必要なfeatureのみ
   │  ├─ mapping/                       # pure view-model mapping
   │  ├─ preview/, fixtures/            # 必要なfeatureのみ
   │  ├─ types.ts
   │  └─ index.ts                       # optional intentional public entry
   ├─ layouts/                          # reusable structural shells only
   ├─ ui/
   │  ├─ components/                    # stable cross-feature presentation
   │  └─ primitives/                    # semantics-neutral building blocks
   ├─ panoptes/                         # browser runtime/client abstraction
   └─ server/                           # server-only auth/BFF/Rails adapters
```

これはFS-04で承認したmigration targetであり、現行配置を移動済みとみなすものではない。`src/lib/components`と`src/lib/stores`はlegacy migration sourceであり、新規配置先にしない。`src/lib/panoptes`は現在のruntime/client boundaryとして維持し、将来featureごとへ再配置するかは重複とownershipが明確になった時に判断する。

Category mapping:

- Route Entryは`src/routes`、Page Entryは`src/lib/features/<feature>/pages`に置く。
- Framework `+layout`は`src/routes`、複数pageで再利用するstructural shellは`src/lib/layouts`に置く。Feature state/controllerを持つshellはowning featureに置く。
- Featureとfeature-local Composite/UIは`src/lib/features/<feature>`に置く。
- stable cross-feature UIだけを`src/lib/ui/components`、Product/domain semanticsを持たないPrimitiveだけを`src/lib/ui/primitives`に置く。
- Preview implementation/fixtureはowning feature、dev URL exposureは`src/routes/dev`等のRoute Entryに置く。
- Domain-specific reusableはdirectory layerにせず、owning feature内のReuse Scope Qualifierとして扱う。

Feature-localをdefaultとする。複数の独立featureで同じ責務・Product semantics・lifecycle・interaction/accessibility contractを持ち、Feature state/controller/command/API/authorizationへ依存しない場合だけshared UIへ昇格できる。利用回数2回またはsame visualだけではshared化しない。

`pages`、`controller`、`commands`、`state`、`preview`、`fixtures`は必要なfeatureだけが作る。空directoryや責務のないlayerを標準化のために追加しない。

## 13. Shared and Large Component Criteria

Shared化には次をすべて要求する。

- same responsibility。
- same Product semantics/formula。
- same lifecycle/state ownership。
- same interaction contract。
- shared化後の依存方向が正しい。

same visualだけでは不足する。共通化によるconditional propsやfeature switchが増えるなら別componentを維持する。

Large componentは行数だけで分割しない。責務集中、state ownershipの混在、side effects、mapping complexity、markup/CSS ownership、独立test可能性、reuse boundary、複数の変更理由を評価する。line countは監査開始のsignalに限る。

## 14. Naming and Migration Policy

- file/component名は責務とProduct概念を表す。内部実装方式や曖昧な`Base`/`Common`/`Dummy`をdefaultにしない。
- directoryはfeature/domainをlowercase kebab-caseで表す。既存`Self`/`Strategy`/`Competitor` casingはlegacy debt。
- Selfに残る`StrategyRecommendation`名はProduct意味と不一致、`PanoptesPanoaiTab`は命名一貫性要確認、`ComponentsBase`はlegacy bucketとして記録する。
- renameは`touch-and-migrate`または明示rename Phaseで行う。一括renameは禁止する。
- 原則compatibility aliasを作らず、workspace caller/import/test/docsを同時更新する。external consumerが確認された場合だけ期限付きaliasを許可する。
- migrationは`target定義 -> new code適用 -> touched legacyの限定移動 -> workspace consumer同時更新 -> 一時compatibility縮退 -> 検証・document同期`の順で行う。構造migrationとvisual/behavior変更を同一changeへ無理に混在させない。
- legacy/compatibility/deferred/framework constraintで即移動しない場合は、理由、owner、consumer/dependency、revisitまたは削除条件を記録する。

## 15. Import and Dependency Direction

Target direction:

```text
routes
  -> feature Page Entry / approved public entry
  -> layouts
features
  -> feature-local components / mapping / state
  -> ui components -> ui primitives
  -> panoptes API abstraction
layouts
  -> ui components / ui primitives

server routes
  -> src/lib/server
     -> Rails/Supabase server adapters
```

Rules:

- `Route Entry -> Page Entry -> Feature -> Composite -> UI / Presentation -> Primitive`をdefault directionとする。
- LayoutはPage Entryを包み、UI/Primitiveとapproved contextへ依存できるが、Feature controller/commandへ依存しない。
- feature間の直接deep importを避け、必要な安定contractだけをpublic entryから参照する。
- feature内部はdeep import可。shared componentはfeatureをimportしない。
- direct canonical file importをdefaultとする。`index.ts`は複数consumerへ安定したFeature contractを公開する場合だけexplicit named exportで使用し、短いpathや全件再exportのために作らない。
- feature public entryを宣言した場合、route/別featureはそのentryをcanonical pathとし、internal helperやserver-only moduleを公開しない。shared UI/Primitiveはdirect file importをdefaultとする。
- barrel exportは意図したpublic boundaryに限定し、wildcard barrel、duplicate re-export maze、cycle、ownership隠蔽を禁止する。
- client/UI codeは`src/lib/server`をimportしない。server-only moduleはbrowser-safe moduleを再exportしない。
- Presentation → BFF client、Shared UI → domain feature、Marketing Preview → Actual runtime controller、Client UI → server-only、Domain → Page/Viewを禁止する。
- 現行`features -> ComponentsBase`および`ComponentsBase -> features`は段階移行中の`PARTIAL`であり、新規cross-directionを増やさない。

## 16. Route Alias and Temporary Route Policy

`/`、`/lp`、`/plan`および`/app`、`/app/analysis`はProduct DecisionまでURLを維持する。compositionの正本化は可能だが、redirect、削除、behavior差、canonical metadataを推測しない。

Temporary routeはowner、purpose、production exposure、ticket/decision、review date、deletion criteriaを記録する。temporary routeは各inventory resync時に再評価し、無期限に「temporary」のまま放置しない。`/app/login/settings`はこのPolicyのlifecycle適用例として、PD-05 Option AによりPhase PD-3で削除済みである。

## 17. Accessibility, Responsive, and Design Token Policy

Structure段階のminimum accessibility rule:

- interactive UIはnative element優先。
- icon-only controlはaccessible nameを持つ。
- toggle/disclosureは`aria-pressed`/`aria-expanded`を状態と同期する。
- SVG data visualizationはtitle/labelを持つ。
- status/scoreはcolorだけで伝えない。
- collectionはstable keyを持つ。

Responsive責務は、component内部のcontent reflowをcomponent、route-family shell/gridをLayout、section order/hero flowをPageが所有する。BreakpointはDesign Token taxonomyに含めるが、exact name/value、mobile-first/desktop behavior、content priorityはFS-07で決め、Tailwindへの投影はFS-06/07で決める。

### Design Token Contract v1

Token taxonomyは`color / typography / spacing / sizing / radius / border / shadow / z-index / breakpoint / motion`とする。Sizing、z-index、breakpoint、motionは必要なcontractだけをToken化し、全px値、arbitrary layer、固有animationを無理にscaleへ含めない。

Raw/FoundationとSemanticを分離する。

```text
Raw:      --p-raw-{category}-{scale-key}
Semantic: --p-{category}-{role}-{variant?}-{state?}
```

- Rawはpalette、type/spacing scale等のvalue foundationであり、Token declarationからSemanticを構成する。Componentによる直接利用はdefaultで禁止する。
- Semanticは`text-primary`、`surface-default`、`border-subtle`、`action-primary`、`focus-ring`、`status-error`等のUI role/stateを表し、Componentが利用するpublic contractとする。
- semantic nameへ現在値、色名、px値を埋め込まない。Heading styleとDOM heading level、Spacing rhythmとComponent Sizingを分離する。
- hover、active、focus、disabled、selected、success、warning、errorは該当roleのsemantic variantとする。TokenがProduct判定やbusiness stateを決めない。

v1の実行時Source of Truthは、実装Phaseで配置する単一の`src/lib/ui/tokens.css`とする。CSS Custom Propertiesを用い、Tailwind config、Component local style、手書きTS objectを別正本にしない。JavaScript/SVG利用はCSS variable参照または明示adapterを使う。専用generatorは複数platform等の実需要が生じるまで導入しない。

Application rule:

- Shared UI/PrimitiveはSemantic tokenをdefaultとする。
- Feature UIはSemantic tokenとfeature-local compositionを使い、domain stateはmapping後にsemantic roleへ接続する。
- Layout/Pageはsurface、spacing、sizing、named layerと、FS-07承認後のbreakpointを使う。
- one-off visual effect、asset intrinsic size、algorithmic geometry、browser/framework constraint、temporary migration debtはhardcoded exceptionを許容する。
- exceptionはreason、owner、scope、exact value、review/removal conditionを記録し、反復した場合はToken candidateとして再審査する。

Migrationは`Contract -> tokens.css最小実装 -> new/touched component -> shared UI/Layout -> feature UI -> hardcoded debt縮退 -> Tailwind consumer接続`の順で行う。Big Bang、全px値のToken化、Token導入とvisual redesignの同時実施は禁止する。

Contract versionはdocument metadataで管理し、token名へversionを含めない。additive token、raw value adjustment、semantic reference change、rename/removal、meaning changeを区別する。Raw値変更もvisual validationを必要とし、semantic rename/removalはconsumer migrationと期限付きalias、meaning changeは新Tokenを必要とする。

### Tailwind Consumer Standard

TailwindはDesign Token Source of Truthではなく、`tokens.css -> Tailwind adapter -> semantic utility -> Component`のStyling Consumer / Utility Layerとする。`tokens.css`は承認済みcanonical pathだが、FS-06時点では未実装であり、Tailwind dependency/configも未導入である。

Token integration:

- Tailwind adapterはSemantic CSS Custom Propertyを参照し、Hex、px、shadow等のDesign値を複製しない。
- Componentは`bg-surface-default`、`text-primary`等のsemantic utilityをdefaultとし、Raw tokenやTailwind default paletteへの直接依存をPanoptes standardにしない。
- `bg-[var(--p-...)]`等の反復arbitrary参照でadapterを代替しない。
- 採用Tailwind version固有のconfig syntaxはImplementation Phaseで決めるが、consumer directionは変えない。
- 現行resetとPreflight相当をvisual validationなしで二重適用せず、global base ownerを一つにする。

Utilityはlayout、spacing/sizing、typography、semantic appearance、state、responsive、one-off compositionに分類する。State utilityはpresentation stateだけを表し、Product formula、authorization、workflow eligibilityをclassで計算しない。Conditional classはcomplete literalまたは静的mapを使い、scannerが検出できない文字列連結をdefaultにしない。

Styling ownership:

- UI/Primitiveはsemantic utilityとlocal interaction variantを所有する。
- Compositeはchild arrangementとcomposition spacingを所有する。
- Featureはfeature-specific layout/compositionだけを所有し、Design foundationを再定義しない。
- Layoutはpersistent frame/chromeとapproved responsive variantを所有する。
- raw class passthroughをComponent APIのdefaultにせず、意味あるtyped variantを優先する。`class` passthroughはPrimitive/structural extension pointでmerge orderと上書き範囲が明確な場合だけ許可する。

Arbitrary valueはasset intrinsic、algorithmic/generated、browser/framework constraint、approved one-off visual、temporary migration debtに限定する。reason、owner、scope、value、review/removal conditionを記録し、反復時はToken/custom utility/component候補として再審査する。

既存CSSとSvelte `<style>`は廃止しない。global reset/base、Token declaration、complex animation/keyframes、pseudo/complex selector、algorithmic style、Tailwindで可読性が悪化するlocal style、migration中legacy CSSを許容する。同一property/stateをutilityとlocal CSSで競合所有しない。

Class抽出は、stable semantic pattern、state/accessibility contract、shared component contract、または責務の可読性を根拠に行い、class数だけでは判断しない。Custom utility/variantはsemantic meaning、reuse need、Token整合を必須とし、Product固有意味をgeneric utilityへ混ぜない。

Responsive utilityはFS-07承認後のnamed breakpointを用い、base styleと差分variantを明示する。Exact breakpoint値、mobile-first behavior、content priorityはFS-07へ送る。

Migrationは`tokens.css実装 -> Tailwind adapter/reset owner接続 -> new code -> Shared UI/Layout -> touched Feature UI -> legacy CSS判定 -> hardcoded/arbitrary debt縮退`の順とし、既存画面の一括変換を禁止する。

### Responsive Contract v1

Mobile-firstをdefaultとし、Breakpointをdevice名ではなくlayout adaptation thresholdとして扱う。

| Name | Value | Semantic use |
| --- | ---: | --- |
| `sm` | `640px` | compact spacing/control/grid enhancement |
| `md` | `768px` | medium composition、form/modal、1→2 columns |
| `lg` | `1024px` | navigation、sidebar、major region split |
| `xl` | `1280px` | wide grid、dense analysis、desktop spacing |
| `2xl` | `1536px` | wide analytics density only |

Baseは`0〜639px`を扱う。`xs`は追加せず、`2xl`は通常Pageを無制限に拡張する用途にしない。既存`560 / 720 / 900 / 980 / 1180 / 1280 / 1600px`はmigration evidenceであり、closest breakpointへ機械変換しない。

Ownership:

- Componentはinternal wrap/stack、local gap、control sizing、redundant label、component-local overflow、chart minimum sizeを所有する。
- Composite/Featureはchild arrangement、dense region、summary/detail disclosureを所有する。
- Layoutはroute-family frame、global gutter/max-width/columns、persistent navigation/sidebarを所有する。
- Page Entryはmajor region composition、section order、Hero flow、page-level content priorityを所有する。
- Reusable Componentはroute名へ依存せず、異なるcontainerで使う場合はcontainer-aware layoutまたは明示variantを選べる。

狭幅のpriorityは`state/error/primary action -> summary/navigation -> supporting detail -> decorative`とする。Wrapをdefaultとし、Stackはminimum readable width未満、Collapseはsecondary detail、Local scrollはtable/chart/tabsの関係維持、Truncateはfull valueへの代替があるrepeated label、Hideはdecorative/redundantに限定する。CSS visual orderとDOM reading/focus orderを乖離させない。

Dense UI:

- Tableはsemantic structureを保ちcontainer-local horizontal scrollをdefault候補とする。
- Chart/radar/ringはminimum readable sizeを守り、summary/data tableまたはlocal scrollを使う。formula/geometryをResponsive都合で変更しない。
- Competitor card/gridはcontainer availabilityに応じてcolumnを縮退し、minimum card widthを守る。
- Analysis panel/Strategy viewはsummary-first、stack、progressive disclosureを使い、state/error/action/orderを保持する。
- Tabsはroot overflowを作らず、local scroll、wrap、approved compact selectorで全optionへ到達可能にする。

NavigationはMarketing HeaderをPage Entry、App HeaderをApp Layoutが所有する。Base/compactではmenu trigger、current location、primary actionを優先し、`lg`以上でexpanded/persistent navigationを候補とする。Linkをhideする場合は同じdestinationへの代替を必須とする。

Typography/SpacingはSemantic Tokenを用い、Breakpoint別arbitrary値を乱立させない。Fluid scaleはminimum/maximumと意図を持つToken contractへ接続する。Heading styleとDOM levelを分離する。

Viewport acceptance:

```text
320x568   narrow mobile
390x844   standard mobile
768x1024  tablet
1024x768  laptop
1440x900  desktop
1920x1080 wide desktop
```

Breakpoint変更対象は利用thresholdの1px below/atも確認する。Acceptanceはroot horizontal scroll、到達不能なprimary情報/action/navigation、overlap/clipping、reading/focus order不一致、unusable local scroll、fixed/sticky occlusionがないことを要求する。

Intentional horizontal scrollはtable/chart/tabs/dense railのlocal containerだけに許可し、keyboard/touch accessとoverflow cueを保つ。Fixed/min width、data visualization、intrinsic media、dense workspace、third-party widgetの例外はcontainer内で処理し、`reason / owner / viewport / behavior / risk / fallback / review condition`を記録する。

### UI Regulation v1

Visual consistencyは同じ意味・状態・操作に同じCanonical Component、Semantic Token、interaction patternを用いることで保つ。Featureはlocal compositionを所有できるが、color、typography、spacing、sizing、radius、border、shadowのfoundationを再定義しない。

Interaction:

- Navigationは`a`、actionは`button`をdefaultとし、clickable affordanceをcolor/cursorだけに依存させない。
- Hoverは補助とし、keyboard focusを視認可能にする。Active/pressedとselected/currentを分離する。
- Selected/currentはcontrol patternに合う`aria-current`、`aria-selected`、`aria-pressed`等を持つ。
- Disabledはnative semanticsと理由、Loadingは重複操作防止、label/progress、必要な`aria-busy`/statusを持つ。
- Business conditionはFeature/Backendが決め、UIは受け取ったpresentation stateを表現する。

Canonical stateは`loading / empty / no current analysis / success / warning / error or failed job / unavailable / forbidden / disabled / partial / limited / unsupported historical`を区別する。UIは欠損からstateを推測せず、Partial/Limitedを0、Empty、Successへ変換しない。Mappingはlabel、tone、icon、format、callback接続までを所有する。

Accessibility baseline:

- semantic HTML、全pointer actionのkeyboard access、logical focus order、visible focus、accessible name、associated form labelを必須とする。
- Panoptes内部基準としてcontrastは通常text 4.5:1以上、large text 3:1以上、meaningful UI/focus 3:1以上を目標とし、Token実装時に測定する。
- `prefers-reduced-motion`でnonessential motionを停止/短縮し、state/feedbackを静的にも理解可能にする。
- Primary touch targetは44×44 CSS px以上をdefaultとする。Dense/inline controlは24×24 CSS px以上または同等spacingと例外recordを要求する。
- Status、score、selected、errorをcolorだけで伝えず、urgent errorとpolite statusのannouncementを使い分ける。

ComponentはFS-02 categoryとownerに従う。新規作成前に対象scopeの`rg`、Inventory、owning feature/shared UIからCanonical Componentを確認し、同目的component、透明wrapper、新しい`ComponentsBase`を増やさない。

Token/Tailwind/Responsive compliance:

- Semantic Tokenをdefaultとし、Tailwindをconsumerとして扱う。Raw、arbitrary、hardcoded valueは追跡可能な例外に限定する。
- New/touched codeはstandardへ寄せ、未実装期間に別palette/utility systemを新正本化しない。
- Mobile-first、root horizontal scroll禁止、meaningful contentをhideしない、local scrollのreachability/cue、reading/focus order、FS-07 viewport acceptanceを守る。

Formはlabel、constraint、field-linked validation、safe error、disabled reason、loading/double-submit preventionを持つ。Destructive actionは対象/impactを明示し、重大・不可逆時だけproportional confirmationを使う。Product-specific eligibility/workflowをUI Regulationで決めない。

Feedbackはurgency、persistence、recoverability、required actionで選ぶ。Inlineはfield/section、Toastはnon-blocking short result、Banner/Page stateはpersistent degraded/partial issue、Blocking dialogはcontinuation不能または重大decisionに限定する。Critical error、Forbidden、PartialをToastだけで表現しない。

Motionはfeedback、hierarchy、transitionの理解を助ける場合だけ使用し、Motion Tokenとreduced-motionを守る。GSAP/SVG固有timelineはlocal owner、cleanup、route transition、reduced-motion behaviorを持つ。

Exceptionは`ID / excepted rule / reason/evidence / owner / scope / temporary or permanent / risk / fallback / approval / review trigger / removal criteria`を記録する。One-offを新standardへ自動昇格せず、反復時はRegulation改訂proposalとして審査する。

新規・大幅変更UIは`taxonomy/owner -> canonical reuse -> state contract -> Token/Tailwind -> Responsive -> Accessibility -> verification/exception`をreviewし、`PASS / PASS_WITH_TRACKED_EXCEPTION / BLOCKED`を記録する。Product意味が不明ならUIで補完せず該当decision ownerへ戻す。

## 18. Duplicate Prevention and Review Checklist

新規作成・PR前に以下を確認する。

1. `rg`とfrontend inventory CSVで同名・類似責務・既存helperを検索したか。
2. Active Graph上のparent/childとproduction/dev/preview到達性を確認したか。
3. canonical owner/import pathを特定したか。
4. shared条件4項目とProduct formula境界を満たすか。
5. route entry、feature entry、compatibility wrapperを混同していないか。
6. dependency direction、server/client boundary、Organization明示inputを守るか。
7. DEFER/exceptionには理由・owner・revisit conditionがあるか。
8. tests、inventory、architecture docsを同期したか。

## 19. Technical Debt and DEFER Policy

Technical debt recordは`Description / Risk / Priority / Dependency / Recommended Timing / Status`を必須にする。解消済み項目も`RESOLVED`として履歴を残す。

DEFER reasonは次のいずれかを必須とする。

- `PRODUCT_DECISION_REQUIRED`
- `BACKEND_DEPENDENCY`
- `VISUAL_BASELINE_REQUIRED`
- `ARCHITECTURE_DECISION_REQUIRED`
- `FUTURE_FEATURE`

DEFERにはowner、具体的blocker、再開条件を記録する。`StrategyAnalysisPlanRail`と`StrategyAnalysisPlanRailCard`はplan selectionとproject selectionの意味が確定するまで`PRODUCT_DECISION_REQUIRED`を維持する。

## 20. Exceptions

| Exception                                      | Reason                                | Owner                 | Revisit condition             |
| ---------------------------------------------- | ------------------------------------- | --------------------- | ----------------------------- |
| Marketing/App thin route entries               | framework URL contract                | Frontend + Product    | canonical URL/alias decision  |
| Marketing Page-owned / App Layout-owned Header | route-family lifecycleが異なる        | Frontend Architecture | Header variant/contract変更時 |
| `ComponentsBase` canonical imports             | big-bang移動リスク                    | Frontend Architecture | fileを機能変更で触る時        |
| production previewの`Dummy`名                  | visual/fixture contractを先に確定する | Marketing/Frontend    | preview naming Phase          |
| Strategy Plan Rail 2件                         | Product semantics未確定               | Product/Strategy      | plan/project selection決定    |

## 21. Decision Matrix

| Concern            | Current                                                 | Target                             | Migration                  | Timing            |
| ------------------ | ------------------------------------------------------- | ---------------------------------- | -------------------------- | ----------------- |
| `ComponentsBase`   | mixed legacy bucket                                     | feature/shared ownership           | gradual deprecation        | touch-and-migrate |
| `features`         | partially adopted                                       | feature composition/state/mapping  | new code first             | P0/P1             |
| Route Entry        | thin canonical entries                                  | framework boundary                 | keep                       | now               |
| Layout             | root/App valid、pass-through解消                        | persistent responsibility only     | review on addition         | P0                |
| Preview            | production-reachable legacy names                       | deterministic Preview/Fixture      | contract then rename       | dedicated Phase   |
| Wrapper            | production component wrapper 0                          | exceptional only                   | prevent/review             | P0                |
| Mapping/View Model | mixed feature/component data folders                    | feature-local pure mapping         | touch-and-migrate          | P1                |
| Controller         | Shell/Auth/Survey等で導入                               | side-effect orchestration boundary | add when criteria met      | P0/P1             |
| Command            | Organization明示境界あり                                | typed org-scoped use case          | backend availabilityに追従 | P1                |
| Client             | canonical identity client + unavailable business client | `/api/panoptes/v1` typed clients   | Rails contract後           | backend dependent |
| Store              | runtime stores + legacy global store                    | feature-scoped/minimum global      | no new global default      | P0/P1             |
| Naming/casing      | multiple legacy names                                   | responsibility/feature naming      | no alias by default        | P1/P2             |
| Design Token       | component-local hardcoded values                        | `src/lib/ui/tokens.css` semantic contract | new/touchedから段階適用 | FS-05後の実装Phase |
| Tailwind           | dependency/config未導入                                 | Token consumer / utility layer     | Token実装後に段階接続   | FS-06後の実装Phase |
| Responsive         | component-local breakpoints/fixed dense UI              | Responsive Contract v1             | owner単位・visual parity | FS-07後の実装Phase |
| UI Regulation      | patternごとに部分適用                                   | UI Regulation v1                   | new/touched + tracked remediation | FS-08後の実装Phase |

## 22. Migration Strategy

- **P0 — New code:** 本Policyを必須適用する。
- **P1 — Touched code:** 責務・import方向・命名を安全な範囲で移行し、test/docsを同時更新する。
- **P2 — Dedicated debt Phase:** preview rename、Header、directory casing等、横断影響のある明確なdebtだけを個別Phase化する。
- **P3 — Prohibited:** 全directory移動、全rename、全component再配置を一括実施しない。

No Big Bangの理由はregression risk、git blame/history喪失、import churn、feature delivery阻害、Product未確定項目の混入である。

## 23. Product Decision Boundary

Product Decision RegisterとのFS-09限定整合確認により、次を現行statusとして継承する。

- PD-01 Route Intentは`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`。
- PD-02 Score / Common Axes Contractは`DECIDED / COMPLETE`。Calibration、schema、formula implementation、presentationは承認済みhandoffであり、Decision未完了を意味しない。
- PD-04 partially_completed Snapshot Workflowは`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`。Implementationは未実装。
- PD-05 Settings temporary route removalは決定・実施済み。将来Settingsを追加する場合は新しいProduct Discovery/Decisionを必要とする。

現在のProduct Decision RequiredはPD-03 Strategy Plan Railのみであり、`NEEDS_DISCOVERY / DEFERRED_NON_BLOCKER`を維持する。`StrategyAnalysisPlanRail`と`StrategyAnalysisPlanRailCard`はPD-03再審査前に削除、移動、rename、Product化しない。

承認済みDecisionのimplementation handoffを、Frontend helper、responsive rule、directory migrationで再決定しない。

## 24. October Parent Artifact

[October Frontend Standardization Plan](./frontend-standardization-plan.md)をPhase FS-01で作成し、October標準化のParent / Source of Truthとして開始した。本PolicyとInventory Closure Handoffを正式Inputとし、具体的な標準と進捗はParentへ同期する。

Phase FS-09 Closure ReviewではFS-02〜08の7標準との矛盾なし、Criteria `PASS 9 / PENDING_NON_BLOCKER 1 / BLOCKED 0`、Closure blocker 0、推奨Disposition `CLOSE_WITH_DEFERRED_ITEMS`と評価した。

Phase FS-10でProduct Ownerの明示承認（Approval Date `2026-09-14`）を記録し、October Parentを`CLOSE_WITH_DEFERRED_ITEMS / CLOSED`として正式Closureした。Directory、Token、Tailwind、new/touched adoption、legacy CSS、Responsive、UI remediation、browser/accessibility verificationは後続handoffであり、`Deferred != Forgotten`を維持する。

Frontend Standardization ClosureはSource Migration CompletionまたはProduction Readinessを意味しない。PD-03 Strategy Plan Railの保護を維持し、正式次段階をPanoptes Technical Bootcampとする。Bootcamp教材はFS-10で作成していない。

## References

- [Frontend inventory summary](../inventory/frontend-inventory-summary.md)
- [Frontend active graph](./frontend-active-graph.md)
- [Frontend route ownership](./frontend-route-ownership.md)
- [Panoptes Shell flow](./panoptes-shell-flow.md)
- [B-3S evidence analysis](../audit/57-frontend-structure-policy-analysis.md)
- [B-3T parent closure review](../audit/58-frontend-inventory-parent-closure-review.md)
- [October Frontend Standardization Plan](./frontend-standardization-plan.md)
- [FS-02 Component Taxonomy](../audit/122-fs02-component-taxonomy.md)
- [FS-03 Feature / UI / Layout Boundary](../audit/123-fs03-feature-ui-layout-boundary.md)
- [FS-04 Directory Structure](../audit/124-fs04-directory-structure.md)
- [FS-05 Design Token Foundation](../audit/125-fs05-design-token-foundation.md)
- [FS-06 Tailwind Standard](../audit/126-fs06-tailwind-standard.md)
- [FS-07 Responsive Standard](../audit/127-fs07-responsive-standard.md)
- [FS-08 UI Regulation](../audit/128-fs08-ui-regulation.md)
- [FS-09 October Parent Closure Review](../audit/129-fs09-october-frontend-standardization-parent-closure-review.md)
- [FS-10 Explicit Product Owner Approval Record](../audit/130-october-frontend-standardization-explicit-product-owner-approval-record.md)
