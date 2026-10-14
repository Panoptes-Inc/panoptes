# Phase FS-02 — Component Taxonomy

Date: 2026-09-14  
Status: `COMPLETED / APPROVED`  
Source Changes: `NONE`  
Next Phase: `FS-03 Feature / UI / Layout Boundary`

## Scope and method

[October Parent](../architecture/frontend-standardization-plan.md)と[Frontend Structure Policy](../architecture/frontend-structure-policy.md)を正本に、Frontend ComponentのPrimary Category、責務、禁止事項、依存、再利用範囲、state、business logic allowanceを正式化した。

既存Inventoryから代表16 filesだけを確認した。全107 componentの再分類、inventory recount、Repo-wide Source調査、directory migrationは行っていない。

## Canonical taxonomy decision

Canonical TaxonomyはPrimary Role 8種とcross-cutting qualifierで構成する。

| Reviewed term | Canonical treatment | Decision |
| --- | --- | --- |
| Route-level | Canonical名は`Route Entry`。URL/data framework boundaryに限定 | `APPROVED_WITH_CONSTRAINTS` |
| Page Entry | Route EntryとFeature compositionを接続 | `APPROVED` |
| Layout | Canonical名は`Layout / Shell`。persistent structureを持つ場合のみ | `APPROVED_WITH_CONSTRAINTS` |
| Feature | use-case compositionとFrontend orchestration | `APPROVED` |
| Composite | cohesiveなchild composition。command/transportなし | `APPROVED_WITH_CONSTRAINTS` |
| UI | Canonical名は`UI / Presentation`。props中心 | `APPROVED` |
| Primitive | UIの最小semantics-neutral subtype | `APPROVED_WITH_CONSTRAINTS` |
| Preview | deterministic preview/Fixture composition | `APPROVED_WITH_CONSTRAINTS` |
| Domain-specific reusable | Primary Categoryとしては不採用。Reuse Scope Qualifierとして承認 | `REJECTED` |

Primary Categoryは常に1つだけ付ける。`domain-specific`、`cross-feature`、`route-family`、`preview`等はscopeまたはmodeを補足し、Primary Roleを二重化しない。

## Category contract

| Category | Purpose / may own | Must not own | Allowed dependencies | Reuse scope | State ownership | Frontend logic allowance |
| --- | --- | --- | --- | --- | --- | --- |
| Route Entry | URL、typed data/params、entry選択 | orchestration、raw fetch、business mapping | route types、Page Entry | 1 URL contract | route data only | data forwarding |
| Page Entry | route contextとpage composition | raw transport、business rule | Feature、Composite、UI、Primitive、typed command | route family | minimal page UI | composition、command invocation |
| Layout / Shell | persistent Header/nav/spacing/context | page固有content、use-case orchestration、空layout | rendered children、UI、Primitive、approved context | route family | persistent family UI | structural composition |
| Feature | use case、view model、controller/command coordination | direct Rails/BFF、他feature内部state、canonical rules | feature controller/command/mapping、Composite、UI、Primitive | feature | use-case UI/lifecycle | mapping、orchestration、command invocation |
| Composite | cohesive child composition | transport、command、business rule | same-feature Composite、UI、Primitive | feature/domain | local selection/expanded state | props adaptation、callback forwarding |
| UI / Presentation | props表示、native interaction、a11y | API/store、business mutation、canonical formula/threshold | Primitive、presentation types/helpers | same semantics consumers | component-local UI | formatting、presentation mapping |
| Primitive | semantics-neutral minimum UI | domain model/copy、Feature/Composite dependency | native/platform、Token | cross-feature candidate | ephemeral only | native interaction、a11y、Token styling |
| Preview | deterministic product preview | runtime store/controller、BFF fallback/mutation | pure Feature surfaces、Composite、UI、Primitive、Fixture | preview only | preview-local | deterministic composition |

依存の基本方向は次のとおり。

```text
Route Entry
  -> Page Entry
  -> Feature
  -> Composite
  -> UI / Presentation
  -> Primitive
```

Layout / ShellはPage Entryを包み、UI/Primitiveへ依存できる。Previewはpure surfaceをcompositionできるがruntime依存を持たない。下位Categoryから上位Category、UIからFeature、FeatureからRoute/Layout、Primitiveからdomainへの依存は禁止する。

Business Logicの正本はRails。Frontendはpresentation logic、local interaction、composition、display-safe view-model mapping、typed command invocationを所有できる。

## Representative code validation

| Category | Existing examples | Validation |
| --- | --- | --- |
| Route Entry | `src/routes/+page.svelte`、`src/routes/app/+page.svelte` | typed dataを受けてPage Entryを1つrender。orchestrationなし |
| Page Entry | `MarketingLandingPage.svelte`、`PanoptesShellEntryPage.svelte` | route family compositionまたはroute context/default inputをFeatureへ接続 |
| Layout / Shell | `src/routes/+layout.svelte`、`src/routes/app/+layout.svelte` | global bootstrap、persistent App Header/Hero、children ownership |
| Feature | `SignUpForm.svelte`、`PanoptesShellPage.svelte` | controller、form/use-case state、store、command coordinationを所有 |
| Composite | `SelfAnalysisOverviewPanel.svelte`、`StrategyAnalysisRoadmapPhaseCard.svelte` | cohesive children、section order、callback forwarding、local selection |
| UI / Presentation | `PanoptesTabNav.svelte`、`CompetitorAnalysisCompanyCard.svelte` | props/view model表示、native buttons、presentation-derived state |
| Primitive | `SignUpBtn.svelte`、`AppLogo.svelte`を境界例として確認 | 前者はAuth固有default/style、後者はBrand固有で、現状はUI。semantics-neutral Primitiveの正例とはしない |
| Preview | `AppTopDummy.svelte`、`AppResultsDummy.svelte` | deterministic presetを`PanoptesAppShellDummy`へ渡しruntime accessなし |
| Domain-specific qualifier | `CompetitorAnalysisCompanyCard.svelte`、`StrategyAnalysisRoadmapPhaseCard.svelte` | PrimaryはUI/Composite、reuse scopeだけCompetitor/Strategy domain |

Primitiveは概念を承認するが、限定sample内にcanonicalな汎用Primitive正例は確認できなかった。新しいPrimitiveを作成する根拠にはせず、複数consumerでsemantics-neutral contractが確認できた場合だけ抽出する。

## Ambiguous cases

| Component | Competing categories | Decision / reason | FS-03 handoff |
| --- | --- | --- | --- |
| `MarketingLandingPage` | Page Entry / Composite | Page Entry。3 marketing URLのpage composition owner | Header/Heroのpage state boundary |
| `PanoptesShellEntryPage` | Page Entry / Feature wrapper | Page Entry。route inputをShell featureへ接続 | fallback inputとroute state境界 |
| `PanoptesShellPage` | Layout/Shell / Feature | Feature Orchestrator。controller、stores、create commandを所有 | Layoutに残すpersistent responsibilityとの分離 |
| `StrategyAnalysisRoadmapPhaseCard` | Composite / UI | Composite。TaskList/StatusActionsを合成しlocal selectionをforward | Compositeが持てるcallback/state上限 |
| `SignUpBtn` | Primitive / UI | UI。Auth固有default labelとvisual contractを持つ | Primitive抽出条件。FS-04移動は未決定 |

名前や配置だけではCategoryを決めない。判定順はprimary responsibility → composition depth → state ownership → reuse scopeとする。同率の場合は、外部副作用とstateを所有する方を上位Categoryとして選ぶ。

## Structure Policy consistency

feature-centric、direct canonical imports、no new ComponentsBase、Layoutのpersistent responsibility、Featureのuse-case composition、UIのpresentation boundary、Rails Business Logic、No Big Bangと整合する。

既存Policyの`PanoptesShellPage` Layout/Shell例だけは実装責務と一致しなかったため、Featureへ訂正した。Architecture原則の変更ではなく、name-based classificationを避けるためのexample correctionである。Exact directory placementはFS-04へ送る。

## Definition of Done

| # | Requirement | Result |
| ---: | --- | --- |
| 1 | Canonical taxonomy defined | PASS |
| 2 | Category responsibilities defined | PASS |
| 3 | Prohibited ownership defined | PASS |
| 4 | Dependency direction defined | PASS |
| 5 | Representative examples validated | PASS |
| 6 | Ambiguous cases isolated | PASS |
| 7 | No conflict with Structure Policy | PASS（example correction 1件） |
| 8 | FS-03 handoff ready | PASS |

FS-02 DoDは**8 / 8 PASS**。

## FS-03 handoff

FS-03ではTaxonomyを再定義せず、Feature/UI/Layoutのowns/must-not-ownを次の論点で具体化する。

- Route Layout、Page Entry、Feature Orchestrator間のpersistent stateとlifecycle。
- command invocation、controller/store、callback forwardingの許容境界。
- FeatureからComposite/UIへ渡すView Modelとevent contract。
- Header/Hero、Shell、modal等のcomposition owner。
- allowed/forbidden import directionと例外process。

## Verification

Parent/Policy/Audit/LogのStatusとhandoffを直接確認した。DoDは8/8 PASS、Parent Closure Criterion 1はPASS、残り9件はPENDING。代表16 filesはすべて存在し、更新4文書のMarkdown参照先ファイル欠落0、競合marker 0だった。

Git metadataが存在しないためGit差分検証は行えず、対象文書を直接確認した。Source変更、build、test、quality、inventory recountは実行していない。
