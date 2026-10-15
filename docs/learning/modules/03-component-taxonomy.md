# Module 03 — Component Taxonomy

Updated: 2026-10-05 — Phase TB-04  
Status: `COMPLETE / READY_FOR_M04`  
Difficulty: `FOUNDATION`  
Prerequisite: `M01 — Panoptes Overall Architecture`, `M02 — Svelte / SvelteKit`  
Parent: [Panoptes Technical Bootcamp](../panoptes-technical-bootcamp.md)  
Primary Standard: [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)

## 1. 学習目標（Learning goals）

このModuleを終えた学習者は、次の内容を説明し、判断できます。

1. Component Taxonomyがdirectory整理ではなく、責務と依存を揃えるcontractである理由。
2. Panoptesの8つのCanonical Category。
3. 各Categoryが所有できるstate、composition、commandと、禁止される責務。
4. Component名や現在の配置ではなく、primary responsibilityから分類する方法。
5. Route Entry、Page Entry、Layout/Shell、Featureの違い。
6. Composite、UI、Primitive、Previewの違い。
7. `PanoptesShellPage`がLayoutではなくFeature Orchestratorである理由。

Taxonomy自体はFS-02で承認済みです。M03は再設計をせず、既存contractをコード読解に使える形へ教材化します。

## 用語ガイド

- **Taxonomy（分類体系）:** Componentを見た目ではなく、主な役割に基づいて分類するための共通ルール。
- **Primary Category:** 一つのComponentへ割り当てる主分類。複数の性質があっても、最も重要な責務で決める。
- **Responsibility（責務）:** そのComponentが決定・保持・実行してよい仕事の範囲。
- **Contract（契約）:** 入力、出力、許される依存、禁止事項について、利用側と実装側が共有する約束。
- **Reuse scope（再利用範囲）:** 一つのFeature内だけで使うか、複数Featureから共用できるかという適用範囲。

## 2. Component Taxonomyとは何か

Component Taxonomyは、Frontendの要素を「何を管理・決定し、何へ依存してよいか」で分類する共通の用語体系です。

分類の目的はlabelを付けることではありません。次の判断を安定させることにあります。

- stateやcommandをどこへ置くか。
- どの方向のimportを許可するか。
- どこまでreuseしてよいか。
- Componentが大きくなったとき、何を分離するか。
- 同じ見た目のComponentをshared化してよいか。
- Route、Layout、Feature、presentationを混同していないか。

同じ`.svelte` ファイルでも、担当する役割は異なります。数行のRoute Entryと数百行のFeature Orchestratorを、どちらも単に「Svelte Component」と呼ぶと、何を決める権限があるのかが見えなくなります。

### Primary Categoryは一つ

各Componentには、主な責務に基づくCategoryを一つ割り当てます。`domain-specific`、`cross-feature`、`route-family`、`preview-only`などは、適用範囲や利用形態を補足する属性です。これらを追加しても、Primary Categoryを複数にするわけではありません。

`Domain-specific reusable`は独立Categoryではありません。たとえばStrategy domain内で再利用されるComponentでも、Primary CategoryはFeature、Composite、UIのいずれかです。

## 3. Panoptes Canonical Taxonomy

Canonical Primary Categoryは次の8種です。

```text
Route Entry
  -> Page Entry
  -> Feature
  -> Composite
  -> UI / Presentation
  -> Primitive

Layout / Shell wraps Page Entry
Preview composes pure surfaces and deterministic fixtures
```

| 分類              | 一言で表すと                                     |
| ----------------- | ------------------------------------------------ |
| Route Entry       | SvelteKitのURL/data boundary                     |
| Page Entry        | Route contextとpage compositionの接続owner       |
| Layout / Shell    | route familyで持続するstructural frame           |
| Feature           | 一つのuse caseをorchestrateするowner             |
| Composite         | cohesiveなpresentation child群のcomposition      |
| UI / Presentation | props中心の表示とlocal interaction               |
| Primitive         | semantics-neutralな最小UI contract               |
| Preview           | runtimeから切り離されたdeterministic composition |

## 4. Category contracts

### 4.1 Contract overview

| 分類              | 目的                               | 担当すること                                                                            | 担当してはいけないこと                                                  | 許可する依存先                                               | 主に扱う状態                   | 再利用範囲              | 代表例                                                          |
| ----------------- | ---------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------ | ----------------------- | --------------------------------------------------------------- |
| Route Entry       | URL/data framework boundary        | typed route data/params forwarding、entry selection                                     | use-case orchestration、raw fetch、business mapping                     | generated route types、Page Entry                            | route dataのみ                 | 1 URL contract          | `src/routes/+page.svelte`、`src/routes/app/+page.svelte`        |
| Page Entry        | routeとfeature compositionを接続   | route context注入、page-level composition、必要なcommand entry                          | raw transport、canonical business rule                                  | Feature、Composite、UI、Primitive                            | minimal page UI                | route family            | `MarketingLandingPage`、`PanoptesShellEntryPage`                |
| Layout / Shell    | persistent structural frame        | Header/nav、family spacing、approved context、children arrangement                      | page固有content、use-case command、business/domain state                | rendered children、UI、Primitive                             | persistent route-family UI     | route family            | root/app `+layout.svelte`                                       |
| Feature           | use case owner                     | controller lifecycle、feature state、view-model、command invocation、child coordination | direct Rails/BFF transport、canonical business rule、他Feature内部state | feature controller/command/mapping、Composite、UI、Primitive | use-case/lifecycle state       | owning feature          | `PanoptesShellPage`、`SignUpForm`                               |
| Composite         | cohesive child composition         | section order、props adaptation、callback forwarding、local selection                   | API/transport、command execution、business rule                         | same-feature Composite、UI、Primitive                        | local selection/expanded state | feature/domain          | `SelfAnalysisOverviewPanel`、`StrategyAnalysisRoadmapPhaseCard` |
| UI / Presentation | props中心の表示/操作               | formatting、native interaction、a11y、presentation state                                | API、store、business mutation、canonical formula/threshold              | Primitive、presentation helper/type                          | component-local UI             | same semantic contract  | `PanoptesTabNav`、`CompetitorAnalysisCompanyCard`、`SignUpBtn`  |
| Primitive         | semantics-neutral minimum contract | native wrapper、a11y、Token styling、ephemeral interaction                              | domain copy/model、Feature/Composite依存、business state                | platform/native API、Token                                   | ephemeralのみ                  | cross-feature candidate | 限定sample内にcanonical正例なし                                 |
| Preview           | deterministic preview              | fixed contract、fixture、preview-local state                                            | runtime store/controller、BFF fallback、production mutation             | pure Feature surface、Composite、UI、Primitive、Fixture      | preview-local                  | preview only            | `AppTopDummy`、`AppResultsDummy`                                |

### 4.2 なぜ責務を分けるのか

上位Categoryほど、URL、page、use caseなどの具体的な事情を扱います。下位Categoryが扱う範囲は、propsと表示上の契約へ絞られます。この依存関係を守ると、下位Componentを別のFeatureでも安全に利用でき、業務上の変更がUIの末端まで広がりにくくなります。

Business Logicの正本はRailsです。Featureであっても、Frontendが担当できるのは、表示上の判断、局所的な操作、Componentの構成、安全に表示できる形式への変換、型付きcommandの呼び出しまでです。

## 5. Route Entry

Route EntryはSvelteKitがURLへ結び付けるframework boundaryです。

```text
src/routes/**/+page.svelte
  -> Page Entry / canonical composition
```

### Owns

- generated route data/paramsの受取。
- URL固有のentry selection。
- verified contextをPage Entryへ渡すこと。

### Must not own

- raw API fetch。
- controller implementation。
- large feature markup。
- business response mappingやformula。

`src/routes/+page.svelte`はroot layout dataの`authenticated`を`MarketingLandingPage`へ渡します。`src/routes/app/+page.svelte`は`activeOrganizationId`をApp Page Entryへ渡します。薄いことは欠点ではありません。URL/data contractを持つため、透明component wrapperとは別物です。

## 6. Page Entry

Page EntryはRoute Entryから受けたcontextを、Featureやpage-level compositionへ接続します。

### Owns

- route contextの注入。
- page section order、Header/Hero ownership where applicable。
- Feature assemblyとpage-level composition。
- 明示された範囲のcommand entry。

### Featureとの違い

Page Entryの変更理由は「このpageをどう構成するか」。Featureの変更理由は「このuse caseをどう遂行するか」です。

`MarketingLandingPage`は3つのmarketing URLが共有するHeader、Primary Hero、Secondary Heroのpage composition ownerなのでPage Entryです。`PanoptesShellEntryPage`はroute input/default fallbackをShell Featureへ接続するためPage Entryです。どちらもcontroller lifecycleやbusiness command群を所有しません。

## 7. Layout / Shell

Layout / ShellはPageを包むpersistent structural compositionです。

### Owns

- globalまたはroute-family bootstrap。
- verified auth/session contextの配布。
- persistent Header/navigation/frame。
- family spacing、shared CSS、children arrangement。

### Must not own

- Feature commandやcontroller。
- page固有use-case orchestration。
- domain business state。
- 将来用途だけの空pass-through layer。

### Framework LayoutとReusable Shell

- **Framework `+layout.svelte`:** SvelteKit route treeのboundary。`src/routes`に置く。
- **Reusable structural shell:** 複数pageで同じstructural frameを使うComponent。Targetでは`src/lib/layouts`。

現行root Layoutはglobal CSS/headとchildrenを、App Layoutはpersistent Header、route-family spacing、`/app`だけのTop Heroを所有します。Feature state/controllerを持ちません。

`Shell`という名前はCategoryを保証しません。Use-case orchestrationを持つShellはFeatureになり得ます。

## 8. Feature

Featureは一つのuse caseまたは変更理由のFrontend orchestration ownerです。

### Owns

- Feature stateとlifecycle。
- controller作成/cleanup。
- typed command invocation。
- server/domain responseからview-modelへのmapping。
- child間coordination、loading/error/retry intent。

### Must not own

- raw Rails URLやserver-only secret。
- canonical authorization/business rule。
- 他Featureのprivate state。

`PanoptesShellPage`はcontroller、複数store、Snapshot mapping、analysis/create/retry等のcallback wiringを所有します。`SignUpForm`はSignup controller、form/use-case state、submit/resend、navigation coordinationを所有します。どちらも見た目を構成するだけではなく、use caseを進めるためFeatureです。

## 9. Composite

Compositeは、複数のUIや子Componentを、表示上の目的がまとまった一つのsectionへ組み合わせます。

### Owns

- child orderとsection composition。
- props adaptation。
- callback forwarding。
- expanded/selected等のlocal presentation state。

### Featureとの違い

Compositeはuse-case ownerではありません。API、client、command、business transitionを実行せず、上位ownerから受けたdataとcallbackでchildを調整します。

`SelfAnalysisOverviewPanel`はSummaryとEvidenceを並べる。`StrategyAnalysisRoadmapPhaseCard`はTaskListとStatusActionsを合成し、local selected表示とcallback forwardingを行います。後者がtask status callbackを持っていても、commandを自分でimport/executeしないためFeatureではありません。

## 10. UI / Presentation

UI / Presentationはprops中心のrenderingとlocal interactionを担当します。

```text
data/state: Parent -> UI
interaction intent: UI -> typed callback -> Owner
```

### Owns

- accessible markup。
- display formatting。
- native interaction。
- hover/open/pressed等のpresentation state。
- typed callback emission。

### Must not own

- API/client/store access。
- business mutationやauthorization。
- canonical score formula/threshold。

`PanoptesTabNav`はtabsとactive stateを受け、button clickを`onChange`で返します。`CompetitorAnalysisCompanyCard`はview modelを表示し、detail/compare intentをcallbackで返します。どちらもuse-caseの結果を決定しません。

## 11. Primitive

Primitiveは、Productや業務領域に固有の意味を持たない、最小限で安定したUI契約です。

候補はgeneric button、input、icon wrapper等だが、見た目が小さいだけではPrimitiveになりません。

### Required boundary

- domain copy/modelを知らない。
- Feature/Compositeへ依存しない。
- accessibility/native behaviorとToken適用が中心。
- 複数consumerで同じsemantic/interaction contractが確認できる。

FS-02の限定sampleではcanonicalな汎用Primitive正例を確認できませんでした。

- `SignUpBtn`はdefault labelとAuth固有visual contractを持つため、現状はUI。
- `AppLogo`はPanoptes brand asset/copyへ依存するため、現状はUI。

PrimitiveというCategoryは承認済みですが、分類の空欄を埋めるために無理に抽出しません。業務に固有の意味を持たない契約が定まり、複数の利用元が成立した時点で検討します。

## 12. Preview

Previewはdeterministic fixture/presetを使い、Product surfaceを安定して見せるためのcompositionです。

### Owns

- fixed initial state。
- preview contractとfixture。
- preview-only selection。

### Must not own

- runtime controller/store。
- production BFF fallback。
- production mutation。
- actual Organization scopeの推測。

`AppTopDummy`と`AppResultsDummy`はpreset propsを`PanoptesAppShellDummy`へ渡すdeterministic compositionです。PreviewがActual Appとpure presentation surfaceを共有することは可能だが、runtime controllerへ接続してはいけません。

## 13. Dependency direction

### Allowed default

```text
Route Entry
  -> Page Entry
  -> Feature
  -> Composite
  -> UI / Presentation
  -> Primitive

Layout / Shell
  -> Page children + UI + Primitive + approved context

Preview
  -> pure Feature surface / Composite / UI / Primitive + Fixture
```

### Forbidden examples

- `UI -> Feature`: reusable presentationがuse caseへ逆依存する。
- `Primitive -> domain model`: semantics-neutral contractでなくなる。
- `Feature -> Route Entry`: FeatureがURL/framework ownerへ依存する。
- `Feature -> Layout`: use caseがpersistent frameを制御する。
- `Layout -> Feature controller/command`: route family lifecycleへuse caseが漏れる。
- `Preview -> runtime controller/BFF`: deterministic previewがproduction side effectを持つ。

上位から下位への依存であっても、不要な内部ファイルのimportや、他Featureの内部実装へ直接入り込むimportは許可されません。依存方向の規則は、その方向なら何でもimportしてよいという意味ではありません。

## 14. Classification heuristic

迷った場合は次の順で判定します。

1. **Purpose:** このfileがなくなると、URL、page composition、persistent frame、use case、presentationのどれが失われるか。
2. **Framework boundary:** `src/routes`でURL/data contractを持つか。持つならRoute EntryまたはFramework Layout候補。
3. **Ownership:** controller、command、request lifecycle、server response mappingを所有するか。所有するならFeature候補。
4. **State:** route data、persistent family UI、feature lifecycle、local selection、ephemeral presentationのどれか。
5. **Composition depth:** Page全体、use-case child群、cohesive presentation section、単一UI contractのどれを構成するか。
6. **Side effect:** API/commandを自ら呼ぶか、callbackをforwardするだけか。
7. **Runtime mode:** deterministic fixture/previewか、actual runtimeか。
8. **Reuse/semantics:** domain/brand copyを持つか、semantics-neutralか。利用回数では決めない。

複数の分類が同じ程度に当てはまる場合は、外部への副作用や状態の管理責任を持つ役割を主分類にします。名前、行数、現在のdirectoryは判断材料にはなりますが、それだけで分類を決めません。

## 15. Ambiguous cases

| Component                          | First impression | Actual responsibility                                             | Final classification     | 判断の理由                                                    |
| ---------------------------------- | ---------------- | ----------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------- |
| `MarketingLandingPage`             | Composite        | Marketing route familyのHeader/Hero/page section owner            | **Page Entry**           | route contextを受け、page全体compositionを所有する            |
| `PanoptesShellEntryPage`           | Feature wrapper  | route/default inputをShell Featureへ接続                          | **Page Entry**           | use-case controllerを持たず、Page→Feature boundaryになる      |
| `PanoptesShellPage`                | Layout / Shell   | controller、複数store、mapping、commands、child coordination      | **Feature Orchestrator** | persistent frameではなくanalysis use case lifecycleを所有する |
| `StrategyAnalysisRoadmapPhaseCard` | UI Card          | TaskList/StatusActionsのcohesive compositionとcallback forwarding | **Composite**            | commandを実行せず、local selectionとsection compositionに限定 |
| `SignUpBtn`                        | Primitive Button | Auth固有default labelとvisual contract                            | **UI / Presentation**    | semantics-neutralではなくSignup/Login contextを持つ           |

### Domain-specific reusable qualifier

`StrategyAnalysisRoadmapPhaseCard`はPrimary CategoryがCompositeで、Reuse Scope QualifierがStrategy domain-specificです。`CompetitorAnalysisCompanyCard`はPrimaryがUIで、QualifierがCompetitor domain-specificです。Qualifierを付けてもFeature/API依存は許可されません。

## 16. Important correction — PanoptesShellPage

`PanoptesShellPage`という名前だけを見ると、route familyを包むLayout/Shellに見える。しかし、実装責務は次の通りです。

- `createDefaultPanoptesShellController`を作成しmountする。
- Project、analysis runtime、session、strategy、notification storeを購読する。
- Snapshot/view modelをderivedする。
- create/retry/confirm/select/update等のFeature interactionをcontrollerへ接続する。
- `PanoptesShellMainSurface`へview stateとcallbacksを渡す。

これはpersistent Header/navigation/children arrangementではなく、Panoptes analysis use caseのorchestrationです。したがってPrimary Categoryは**Feature Orchestrator**。

対照的に`src/routes/app/+layout.svelte`はHeader、family spacing、pathnameに基づくTop Hero、children arrangementを持ち、Feature commandを実行しないためLayoutです。

この訂正はTaxonomy変更ではありません。旧exampleをname-based classificationからresponsibility-based classificationへ直したものです。

## 17. Directory connection

| 分類                       | 正式な配置先                                                       | 現行の状態                                                  |
| -------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------- |
| Route Entry                | `src/routes/**/+page.svelte`                                       | `CURRENT`                                                   |
| Framework Layout           | `src/routes/**/+layout.svelte`                                     | `CURRENT`                                                   |
| Page Entry                 | `src/lib/features/<feature>/pages`                                 | `TARGET`。現Page Entryの一部は`components`/`ComponentsBase` |
| Feature                    | `src/lib/features/<feature>`                                       | `PARTIAL CURRENT`。一部Feature ownerはlegacy location       |
| Reusable Layout/Shell      | `src/lib/layouts`                                                  | `TARGET`。directory未作成                                   |
| Feature-local Composite/UI | `src/lib/features/<feature>/components`                            | `PARTIAL CURRENT`                                           |
| Stable cross-feature UI    | `src/lib/ui/components`                                            | `TARGET`。directory未作成                                   |
| Primitive                  | `src/lib/ui/primitives`                                            | `TARGET`。directory未作成、canonical正例未確定              |
| Preview                    | owning featureの`preview/fixtures`、dev exposureは`src/routes/dev` | `TARGET/PARTIAL`。現行Dummyはlegacy location                |

DirectoryはTaxonomyを決めません。TaxonomyとBoundaryがplacementを決めます。FS-04 targetは承認済みだが、migrationは未完了であり、M03ではfile移動を行いません。

## 18. Representative code mapping

| Category / case    | File                                                                  | Observed responsibility                               |
| ------------------ | --------------------------------------------------------------------- | ----------------------------------------------------- |
| Route Entry        | `src/routes/+page.svelte`                                             | route dataをMarketing Page Entryへ渡す                |
| Layout             | `src/routes/app/+layout.svelte`                                       | persistent Header/spacing/Hero condition/children     |
| Page Entry         | `src/lib/features/landing/components/MarketingLandingPage.svelte`     | Marketing page composition                            |
| Page Entry         | `src/lib/components/ComponentsBase/PanoptesShellEntryPage.svelte`     | route/default inputをFeatureへ接続                    |
| Feature            | `src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte` | controller/store/command/view-model coordination      |
| Feature            | `src/lib/components/ComponentsBase/SignUpForm.svelte`                 | Signup controller/form lifecycle/submit coordination  |
| Composite          | `Self/overview/SelfAnalysisOverviewPanel.svelte`                      | Summary/Evidence composition                          |
| Composite          | `Strategy/roadmap/StrategyAnalysisRoadmapPhaseCard.svelte`            | task/status child composition、callback forwarding    |
| UI                 | `Panoptes/shared/PanoptesTabNav.svelte`                               | props render、accessible native interaction、callback |
| UI                 | `Competitor/cards/CompetitorAnalysisCompanyCard.svelte`               | domain view-model presentationとintent callback       |
| Primitive boundary | `SignUpBtn.svelte`、`loop/AppLogo.svelte`                             | smallだがAuth/Brand semanticsがありUI                 |
| Preview            | `AppTopDummy.svelte`、`AppResultsDummy.svelte`                        | deterministic preset composition                      |

確認対象はこの限定sampleであり、全107 Componentの分類結果ではありません。

## 19. よくある誤分類

### 「名前にPageがあるのでPage Entry」

Page Entryかはpage composition/route contextを所有するかで決めます。Feature Orchestratorにも歴史的に`Page`名が残る可能性があります。

### 「Shellという名前なのでLayout」

Persistent structural shellならLayout。Controller/command/use-case stateを持つならFeature。

### 「複数Componentを使うのでFeature」

Childを組み合わせるだけでcommandを持たなければCompositeかPage Entryの可能性があります。

### 「2箇所で使うのでShared UI」

利用回数ではなく、責務、Product semantics、lifecycle、interaction/accessibility contractが同じかで決めます。

### 「CallbackがあるのでFeature」

UI/Compositeはcallbackでintentを返してよい。Callback先のcommandをownershipするかが境界になります。

### 「Storeを使うので必ずFeature」

Store利用だけでは分類できません。ただしShared UIがFeature storeを直接読むのは依存違反のsignalです。

### 「ReusableなのでPrimitive」

Domain-specific UIも再利用できます。Primitiveにはsemantics-neutralな最小contractが必要です。

### 「現在ComponentsBaseにあるのでshared」

`ComponentsBase`はlegacy bucket。現在の配置はcanonical responsibilityを保証しません。

## 20. Practice

### 20.1 Knowledge Check

1. Taxonomyをfile名やdirectoryではなく責務で決める理由は何か。
2. Route EntryとPage Entryの違いは何か。
3. LayoutとFeatureのstate ownershipの違いは何か。
4. Compositeがcallbackを持ってよいのにcommandを実行してはいけない理由は何か。
5. UIが持てるstateと持てないstateを一つずつ挙げてください。
6. Primitiveにdomain copyを置かない理由は何か。
7. Previewがruntime BFFへ接続してはいけない理由は何か。
8. Domain-specific reusableがPrimary Categoryではない理由は何か。

### 20.2 Classification Exercise

次をPrimary Categoryへ分類し、所有責務を一文で示す。

1. `src/routes/+page.svelte`
2. `src/routes/app/+layout.svelte`
3. `MarketingLandingPage.svelte`
4. `PanoptesShellEntryPage.svelte`
5. `PanoptesShellPage.svelte`
6. `SelfAnalysisOverviewPanel.svelte`
7. `StrategyAnalysisRoadmapPhaseCard.svelte`
8. `PanoptesTabNav.svelte`
9. `SignUpBtn.svelte`
10. `AppTopDummy.svelte`

### 20.3 Reasoning Exercise

> `PanoptesShellPage`は多数のchildを包み、名前にもShell/Pageがある。それでもLayout/Page EntryではなくFeatureなのはなぜか。

回答にはcontroller、store、command、lifecycle、persistent structureの違いを含めます。

### 20.4 Design Exercise

次の新規要件をどのCategoryへ置くか判断し、allowed dependencyも書く。

1. `/reports`からverified paramsをReports pageへ渡す3行のfile。
2. Marketing page全体でHeaderとHeroとCTA sectionを並べるcomponent。
3. Analysis retry command、loading/error、child coordinationを持つowner。
4. Score summary、evidence list、action rowをprops/callbackだけで組み合わせるsection。
5. `aria-pressed`を持つsemantics-neutral icon toggle。複数Featureで同じcontractを使う。
6. Fixed fixtureでResult screenを表示し、APIを一切呼ばないdev composition。

## 21. Answers / Explanation Guide

### 21.1 Knowledge Check要点

1. 名前/配置はlegacyやmigrationの影響を受けるが、責務がstate/command/dependencyを決めるため。
2. Route EntryはURL/data framework boundary、Page Entryはroute contextとpage compositionのowner。
3. Layoutはpersistent family UI/context、Featureはuse-case lifecycle/request/mutation state。
4. Compositeはintentをownerへ返すpresentation boundaryで、command ownershipを持つとuse caseと再利用境界が混ざるため。
5. 持てる: open/selected等のpresentation state。持てない: canonical Job/Role/Score state。
6. Domain semanticsを持つとcross-feature minimum contractでなくなるため。
7. Determinismとside-effect-free preview contractを壊し、production mutationを誤作動させるため。
8. Reuse範囲はFeature/Composite/UIいずれにも付く属性で、責務Categoryを表さないため。

### 21.2 Classification回答

1. Route Entry。
2. Layout / Shell。
3. Page Entry。
4. Page Entry。
5. Feature Orchestrator。
6. Composite。
7. Composite。
8. UI / Presentation。
9. UI / Presentation。Primitiveではない。
10. Preview。

### 21.3 Reasoning回答例

`PanoptesShellPage`は単にchildrenをpersistent frameへ配置するのではなく、Feature controllerを生成してmountし、Project・Analysis・Session・Strategy等のstoreを購読し、Snapshot view modelを導出し、create/retry/confirm/select commandをchild callbackへ接続します。これはAnalysis use caseのstateとlifecycleのownershipです。Layoutが持つべきHeader、family spacing、verified context配布、children arrangementとは変更理由が異なるため、名前にShell/PageがあってもFeature Orchestratorに分類します。

### 21.4 Design Exercise回答

1. **Route Entry**。Generated route typesとReports Page Entryへ依存。
2. **Page Entry**。Feature/UI/Primitiveをpage-levelにcompose。
3. **Feature**。Controller/command/mappingとlower presentation categoryへ依存。
4. **Composite**。Same-feature UI/Primitiveへ依存しcallbackをforward。
5. **Primitive candidate**。Native/platform/Tokenだけへ依存。ただし複数consumerのsemantic contractを確認して承認する。
6. **Preview**。Fixtureとpure presentation surfaceへだけ依存。

## 22. Completion Criteria

| Criterion                                  | Result |
| ------------------------------------------ | ------ |
| 1. Taxonomy purpose explained              | `PASS` |
| 2. 8 canonical categories explained        | `PASS` |
| 3. responsibilities/prohibitions explained | `PASS` |
| 4. dependency direction explained          | `PASS` |
| 5. classification heuristic defined        | `PASS` |
| 6. ambiguous cases explained               | `PASS` |
| 7. PanoptesShellPage correction explained  | `PASS` |
| 8. directory mapping explained             | `PASS` |
| 9. representative code mapping included    | `PASS` |
| 10. exercises + answers included           | `PASS` |

M03 Authoring DoD: `10 / 10 PASS`  
Module status: `COMPLETE / READY_FOR_M04`

このstatusは教材artifactの完成を示します。Learner assessment合格、全Component分類、Directory migration完了を意味しません。

## 23. Handoff to M04

次は`M04 — Feature / UI / Layout Boundary`。M03のCategoryを再定義せず、state、controller、command、callback、loading/error、Header/Hero/Shell、import方向を具体的なownership ruleとして学びます。

## References

- [Panoptes Technical Bootcamp](../panoptes-technical-bootcamp.md)
- [M01 Panoptes Overall Architecture](./01-panoptes-overall-architecture.md)
- [M02 Svelte / SvelteKit](./02-svelte-sveltekit.md)
- [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)
- [FS-02 Component Taxonomy](../../audit/122-fs02-component-taxonomy.md)
- [October Frontend Standardization Plan](../../architecture/frontend-standardization-plan.md)
