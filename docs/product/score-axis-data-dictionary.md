# Panoptes Score / Axis Data Dictionary

更新日: 2026-08-24（Phase PD-48）  
Decision: PD-02 Score / Common Axes Contract  
Parent Status: `DECIDED / COMPLETE`  
Closure Disposition: `CLOSE_WITH_DEFERRED_ITEMS`  
Decided Sub-decisions: PD-02A `DECIDED`、PD-02B `DECIDED / COMPLETE`、PD-02C `DECISION_COMPLETE`、PD-02D `DECISION_COMPLETE`  
Remaining Sub-decision: none

## Purpose

Panoptesに現在存在するscore、axis、label、scale、display formula、fallback、type、fixture、Backend境界をEvidenceベースで記録する。本書はPD-02 detailの親成果物であり、正式名称、formula、threshold、weight、ranking、eligibility、color semantics、Backend schemaを決定しない。

## Scope

- Production UI: Self、Competitor、Industry、Strategy、Snapshot surface。
- Mapping/presentation: view model、label mapping、ring/bar/radar、tone、fallback。
- Data: `PanoptesAnalysisSnapshotPayload`、dummy seed、mock snapshot factory、preview fixture、tests。
- Backend boundary: Canonical BFF、OpenAPI、Rails model/serializer/schema。
- Excluded: label/formula/type統合、component/CSS変更、Backend/OpenAPI実装。

## Decision Status

| Decision | Subject                               | Status               | Decision date |
| -------- | ------------------------------------- | -------------------- | ------------- |
| PD-02    | Score / Common Axes Contract          | `DECIDED / COMPLETE` | 2026-08-24    |
| PD-02A   | Display Scale & Presentation Boundary | `DECIDED`            | 2026-08-20    |
| PD-02B   | Canonical Axis Identity               | `DECIDED / COMPLETE` | 2026-08-21    |
| PD-02C   | Score Formula & Backend Contract      | `DECISION_COMPLETE`  | 2026-08-24    |
| PD-02D   | Missing / Partial Score Contract      | `DECISION_COMPLETE`  | 2026-08-24    |

PD-02Aの承認根拠はPhase PD-7指示書が4 Decisionを承認対象として提示し、Product Decision Registerへ`PD-02A = DECIDED`と記録するよう明示したことである。Phase PD-7時点ではPD-02Aだけを決定し、親PD-02やPD-02B/C/Dを閉じなかった。PD-02BはPhase PD-27で`DECIDED / COMPLETE`、PD-02CはPhase PD-42で`DECISION_COMPLETE`、PD-02DはPhase PD-46で`DECISION_COMPLETE`となった。Phase PD-48でProduct OwnerがDeferred Itemsの後続handoffを条件にParent Closureを明示承認し、PD-02 Parent=`DECIDED / COMPLETE`、Closure Disposition=`CLOSE_WITH_DEFERRED_ITEMS`となった。

## PD-02A Display Contract

1. Product-facing score / axisのFrontend標準表示尺度は0–100とする。
2. 0はminimum displayed score、100はmaximum displayed scoreを表す。`completely bad`、`perfect`等のProduct意味は定義しない。
3. これはFrontend display contractであり、Backendの保存尺度、raw input尺度、normalization semanticsを規定しない。
4. 数値labelは`score / 100`等を表示できるが、decimalとrounding ruleは未決定である。
5. signed delta、0–1 market/matrix coordinate、progress、count、rankは別value familyであり、本display contractへ混ぜない。

Option A（Standard Display Scale 0–100）を採用する。Self、Competitor、Industry fixture、Strategy fitのcurrent evidenceとring/bar/radarの既存変換が一貫して支持する。Option B（Feature-specific Display Scale）は、Product-facing scoreで異なるscaleを要求するEvidenceがなく、解釈と共有visualizationを不必要に分岐させるため不採用とする。

## Presentation Boundary

Boundary Option P-Aを採用する。Presentationは既知のProduct scoreを可視化のためだけに変換できる。Option P-BのようにFrontendがProduct valueをnormalize/correctすることは許可しない。

| Responsibility                 | Allowed / owned                                                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Presentation                   | `clamp(value, 0, 100)` for rendering、percentage width、ring angle、radar coordinate、finite-number safety、formatted display |
| Product / Analysis             | score meaning、formula、weight、threshold、axis semantics、missing meaning、normalization semantics、eligibility、ranking     |
| Backend/API（future contract） | raw/persisted scale、validation、schema/version、provenance、completeness boundary                                            |

### Clamp and raw value preservation

- `visualDisplayValue = clamp(value, 0, 100)`をvisual破綻防止のため許可する。
- Presentation clampはProduct score correctionではない。入力105をring 100%として描画しても、business/raw valueを100へ書き換えない。
- Presentation modelやcomponentからupstream value、store、payloadをmutationしない。
- out-of-range値のvalidation、logging、error policyはBackend/API contractへ残す。

### Visualization transformations

- Ring: `clampedScore * 3.6deg`を0–100から0–360°へのpresentation transformationとして許可する。
- Bar: clamped valueを0–100% widthへ変換することをpresentation responsibilityとする。
- Radar: axis maximum 100とし、clamped valueをradius/coordinateへ変換することをpresentation responsibilityとする。
- Non-finite: `NaN`、`Infinity`、`-Infinity`でcomponentを破綻させないことをUI safety requirementとする。0、`—`、hiddenのどれを表示するかは決めない。
- Numeric formatting: presentation responsibilityに含むが、decimal/rounding ruleは未決定のため共有規則を作らない。

Company 24°／Expanded 30° accent、Self 75/60 threshold、Competitor synthetic offset、Strategy fit derivation、feature別missing fallbackはhistorical behaviorとして維持する。PD-02AはこれらをProduct仕様として承認しない。

## Unresolved Product Semantics

- canonical axis ID、full/short label、order、cross-feature semantics。
- score formula、aggregation、weight、overall/layer relation、threshold、eligibility、ranking。
- decimal/rounding、semantic tone/color。
- missing/null/fallback/partialのbusiness meaningと`partially_completed` behavior。
- Backend schema、raw scale、validation、versioning、provenance。

## PD-02B / PD-02C / PD-02D Handoff

- PD-02B `Canonical Axis Identity` — `DECIDED / COMPLETE`。Axis Contract v1のIdentity、Meaning、Order、Versioningを承認済み。
- PD-02C `Score Formula & Backend Contract` — `DECISION_COMPLETE`。Architecture、Policy、Formula Version、Backend Wire logical contract、Ownership Option C、Closure Option Bを承認済み。Exact Parametersと実装は未完了。
- PD-02D `Missing / Partial Score Contract` — `DECISION_COMPLETE`。Model Bを`DECIDED / APPROVED / V1 DEFAULT TREATMENT MODEL`としてProduct Ownerが2026-08-24に承認した。

## PD-02B Canonical Axis Identity Discovery

Status: `NEEDS_DISCOVERY`。本節はDecision proposalを作るためのEvidenceであり、Product Owner承認済み6軸contractではない。

Repositoryには3種類のEvidence layerがある。

1. Active Frontend: Self/Competitorのcurrent label/order、dummy/mocksのcandidate key。
2. Current design documents: `panoptes_mvp_spec_final_reviewed_v_1_0.md`と`panoptes_master_spec_v_3_4_strategy_os_db_feed_integrated.md`は英語6軸をSelf/Competitor/Industry/Snapshotに安定利用する設計候補として記す。
3. Historical Archive: `Panoptes_Strategic_Engine_Complete_Spec_v1.txt`はsubmetric案を持つが、現行Product/Backend contractではない。

Design documentが自身をcanonicalと記していても、Product Decision Registerの承認を代替しない。以下ではcurrent design evidenceまたはhistorical definition candidateとして扱う。

### Candidate axis set and meaning evidence

| Candidate concept       | Current full-label candidate | What repository evidence appears to measure                                               | Evidence confidence                                                |
| ----------------------- | ---------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Value Proposition       | 価値訴求                     | heroでの価値明瞭性、problem/solution整合、benefit具体性、offer visibility                 | `LIKELY`。current copy + historical submetrics                     |
| Information Hierarchy   | 情報階層                     | heading構造、section順、navigation情報、content grouping                                  | `LIKELY`。fixture copy + historical submetrics                     |
| Funnel / Path Strength  | 導線強度                     | primary CTA、CTA progression、internal navigation、conversion path visibility             | `LIKELY`だが英語concept conflictあり                               |
| Trust Structure         | 信頼構造                     | social proof、case evidence、brand trust、FAQ objection handling                          | `LIKELY`。current trust/case copy + historical submetrics          |
| Differentiation Clarity | 差別化明確性                 | unique claim、competitive position、message distinctiveness、comparison support           | `LIKELY`。current differentiation copy + historical submetrics     |
| Decision Support        | 意思決定支援                 | pricing visibility、comparison support、decision friction reduction、conversion readiness | `LIKELY`。current comparison/decision copy + historical submetrics |

これらdescriptionはProduct meaningのEvidence draftであり正式definitionではない。特に`comparison support`がDifferentiationとDecision Supportの両方へ現れるため、境界と重複除去はProduct/Analysis reviewを要する。

### Label variant classification

| Label              | Primary source/location                    | Feature                        | Axis candidate             | Usage                       | Classification               | Short-label candidate | Conflict                                 |
| ------------------ | ------------------------------------------ | ------------------------------ | -------------------------- | --------------------------- | ---------------------------- | --------------------- | ---------------------------------------- |
| `価値訴求`         | Self definitions、dummy mapping、mock Self | Self/Industry                  | Value Proposition          | axis label                  | current full candidate       | no                    | none observed                            |
| `価値訴求平均`     | mock Snapshot factory                      | Industry                       | Value Proposition          | benchmark metric label      | fixture aggregate suffix     | no                    | presentation suffix                      |
| `情報階層`         | Self/Competitor、dummy、mock Self          | Self/Competitor/Industry       | Information Hierarchy      | axis label                  | current full candidate       | no                    | none observed                            |
| `情報階層平均`     | mock Snapshot factory                      | Industry                       | Information Hierarchy      | benchmark metric label      | fixture aggregate suffix     | no                    | presentation suffix                      |
| `導線強度`         | Self/Competitor、dummy、mock               | Self/Competitor/Industry       | Funnel / Path Strength     | axis/gap/impact label       | current full candidate       | no                    | English scope uncertain                  |
| `導線強度平均`     | mock Snapshot factory                      | Industry                       | Funnel / Path Strength     | benchmark metric label      | fixture aggregate suffix     | no                    | presentation suffix                      |
| `信頼構造`         | Self/Competitor、dummy                     | Self/Competitor/Industry       | Trust Structure            | axis/impact label           | current full candidate       | no                    | none observed                            |
| `信頼構造平均`     | mock Snapshot factory                      | Industry                       | Trust Structure            | benchmark metric label      | fixture aggregate suffix     | no                    | presentation suffix                      |
| `信頼根拠`         | mock Snapshot Self radar                   | Self fixture                   | Trust Structure            | alternate radar label       | fixture/legacy-like          | possible but weak     | may narrow structure to evidence         |
| `信頼補強`         | mock gap/tag/copy                          | Self/Industry/Strategy fixture | Trust-related action/theme | gap/action label            | presentation/action phrase   | no                    | not proven to be axis identity           |
| `差別化明確性`     | Self definitions、dummy、Industry mock     | Self/Industry                  | Differentiation Clarity    | axis/benchmark label        | current full candidate       | no                    | none observed                            |
| `差別化明確性平均` | mock Snapshot factory                      | Industry                       | Differentiation Clarity    | benchmark metric label      | fixture aggregate suffix     | no                    | presentation suffix                      |
| `差別化`           | Competitor definitions                     | Competitor                     | Differentiation Clarity    | radar axis label            | current abbreviation         | yes                   | semantics likely, not proven identical   |
| `差別化指数`       | mock Snapshot Self radar/impact            | Self fixture                   | Differentiation Clarity    | alternate axis/impact label | fixture/legacy-like          | no                    | `index` may imply different metric       |
| `意思決定支援`     | Self definitions、dummy、Industry mock     | Self/Industry                  | Decision Support           | axis/benchmark/impact label | current full candidate       | no                    | none observed                            |
| `意思決定支援平均` | mock Snapshot factory                      | Industry                       | Decision Support           | benchmark metric label      | fixture aggregate suffix     | no                    | presentation suffix                      |
| `意思決定`         | Competitor + mock Self                     | Competitor/Self fixture        | Decision Support           | radar axis label            | current abbreviation/fixture | yes                   | could denote outcome rather than support |

Count: 17 axis-related exact labels。`平均`6件はIndustry fixtureのaggregate presentation、`信頼補強`はaction/gap phrase、`信頼根拠`と`差別化指数`はfixture alternateでありcanonical identity候補から分離する。

### Semantic Equivalence Matrix

| Candidate Axis          | Self         | Competitor | Industry         | Fixture alternates | Semantic Equivalence                                                            |
| ----------------------- | ------------ | ---------- | ---------------- | ------------------ | ------------------------------------------------------------------------------- |
| Value Proposition       | 価値訴求     | 価値訴求   | 価値訴求平均     | 価値訴求           | `SAME_SEMANTICS` for base label; `平均` is aggregation presentation             |
| Information Hierarchy   | 情報階層     | 情報階層   | 情報階層平均     | 情報階層           | `SAME_SEMANTICS` for base label                                                 |
| Funnel / Path Strength  | 導線強度     | 導線強度   | 導線強度平均     | 導線強度           | Japanese label is `SAME_SEMANTICS`; English `funnelStrength` is `UNKNOWN` scope |
| Trust Structure         | 信頼構造     | 信頼構造   | 信頼構造平均     | 信頼根拠、信頼補強 | base label `SAME_SEMANTICS`; alternates `UNKNOWN/DIFFERENT_USAGE`               |
| Differentiation Clarity | 差別化明確性 | 差別化     | 差別化明確性平均 | 差別化指数         | full vs short `LIKELY_SAME`; `指数` is `UNKNOWN`                                |
| Decision Support        | 意思決定支援 | 意思決定   | 意思決定支援平均 | 意思決定           | full vs short `LIKELY_SAME`                                                     |

SelfとCompetitorは同じ6 position、同じaggregate inputから生成されるcurrent radar contractを使い、B-3N auditも長短label差以外をalignedと評価する。したがって`差別化`/`差別化明確性`と`意思決定`/`意思決定支援`はshort-label hypothesisとしてDecision-readyだが、Product meaningの明示承認前に`SAME_SEMANTICS`へ昇格しない。

### Canonical ID Candidate Review

| Candidate key            | Assessment         | Evidence / issue                                                           | Frontend-domain recommendation  |
| ------------------------ | ------------------ | -------------------------------------------------------------------------- | ------------------------------- |
| `valueProposition`       | `KEEP_CANDIDATE`   | current design docs、fixture、Self mappingが一致                           | retain as candidate             |
| `informationHierarchy`   | `KEEP_CANDIDATE`   | heading/section/navigation/grouping evidenceと整合                         | retain as candidate             |
| `funnelStrength`         | `RENAME_CANDIDATE` | conversion funnelを示す一方、現行意味はinternal navigation/pathwayまで含む | semantic naming review required |
| `trustStructure`         | `KEEP_CANDIDATE`   | evidence/proof/FAQを構造としてまとめる設計と整合                           | retain as candidate             |
| `differentiationClarity` | `KEEP_CANDIDATE`   | `差別化明確性`とmessage clarity evidenceに整合                             | retain as candidate             |
| `decisionSupport`        | `KEEP_CANDIDATE`   | pricing/comparison/friction reduction evidenceに整合                       | retain as candidate             |

`CANONICAL_PRODUCT_ID_PRESENT = NO`。Frontend domainでは既存TypeScriptとの整合からcamelCaseを推奨形式とするが、これはcandidate modelに限る。Backend/API wire formatのcamelCase/snake_case、enum、versioningはPD-02Cまで`BLOCKED`。Kebab-caseはprogrammatic object key/API fieldとして既存Evidenceがなく非推奨候補である。

### Order Inventory and Policy Options

| Variant | Sequence                                                          | Evidence/use                                                   | Classification                             |
| ------- | ----------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------ |
| P       | value → information → funnel → trust → differentiation → decision | current design docs、historical A1–A6、Phase Product candidate | Product-order candidate; unapproved        |
| A       | value → funnel → differentiation → information → trust → decision | active Self/Competitor、dummy mapped UI                        | current presentation order; intent unknown |
| B       | value → trust → information → differentiation → funnel → decision | mock Industry、seed record                                     | fixture-only order                         |
| C       | information → funnel → differentiation → decision → trust → value | mock Self radar                                                | fixture/legacy-like order                  |

| Option                                         | Assessment                                                       | Tradeoff                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| O-A: one Product canonical order               | strongest for cross-feature radar/comparison、metadata、Snapshot | existing A/B/C migration and Product approval required                      |
| O-B: identity only、feature order              | lowest migration cost                                            | same identity can appear unpredictably; cross-feature comparison weakens    |
| O-C: Product order + explicit feature override | supports justified surface needs                                 | override governance/versioning required; fixture drift may become permanent |

Recommendation: O-A。一つのcanonical orderを持ち、exact sequenceはPを第一候補としてProduct reviewする。Current design docsとhistorical A1–A6はPを反復するが、active Self/CompetitorはAなので、visualization都合だけでPへ確定または移行しない。O-Cは明示的なProduct/presentation理由がある場合のfallback、O-Bは非推奨。

### Label Contract Candidates

- `canonicalLabel`: 正式で省略しない日本語label。現在のfull 6 labelsをproposalとする。
- `shortLabel?`: narrow surface用の明示的optional metadata。同じaxis identityを維持し、別axisを作らない。
- Decision-ready short pairs: `差別化明確性` → `差別化`、`意思決定支援` → `意思決定`。意味の欠落許容をProduct/Designが承認する必要がある。
- `平均`はlabel metadataではなくIndustry aggregation contextで付与する。
- `信頼根拠`、`信頼補強`、`差別化指数`をshortLabelへ自動昇格しない。
- UI copy変更時もcanonical IDを維持することを設計原則候補とする。

### Axis Definition Gaps

正式descriptionは必要である。名称だけでは`funnelStrength`のnavigation/conversion範囲、DifferentiationとDecision Supportの`comparison support`重複、TrustのFAQ範囲が説明できない。最低限、definition、included evidence、excluded evidence、neighbor-axis boundary、exampleを各軸に必要とする。

Archive submetricはdraft inputとして利用できるが、そのまま正式definition/formulaへ昇格しない。FormulaはPD-02Cの責任である。

### Canonical Axis Object Draft（documentation only）

```text
AxisDefinition {
  id: FrontendDomainAxisIdCandidate
  canonicalLabel: string
  shortLabel?: string
  description: string
  order: number
  version?: string
}
```

`description`と`order`は正式contractに必須候補。`version`はmeaning changeとformula versionの関係が未定のため`NEEDS_DISCOVERY`。TypeScript、Backend、OpenAPIへは追加しない。

### Decision Proposals

| Decision               | Options                                          | Recommendation                  | Evidence                                        | Required approval                           |
| ---------------------- | ------------------------------------------------ | ------------------------------- | ----------------------------------------------- | ------------------------------------------- |
| Six-axis set           | current six / modify set / feature-specific sets | current sixを共通setとして採用  | current design docs + active/fixture recurrence | Product + Analysis/Data                     |
| Full/short label model | full only / full+short / feature-free labels     | full+optional governed short    | Self/Competitor two abbreviation pairs          | Product + Design + Analysis/Data            |
| Frontend ID form       | camelCase / snake_case / kebab-case              | camelCase candidate             | current TypeScript keys                         | Product + Analysis/Data; wire form excluded |
| Order policy           | O-A / O-B / O-C                                  | O-A、P sequence first candidate | design docs P vs active A                       | Product + Analysis/Data + Design            |
| Axis description       | name only / formal definition                    | formal definition required      | observed semantic overlap/ambiguity             | Product + Analysis/Data                     |

### PD-02B Decision Readiness

| Sub-area                   | Status            | Reason                                                                        |
| -------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| Axis Set                   | `DECIDED`         | Product Owner explicit approval on 2026-08-20                                 |
| Semantic Equivalence       | `DECIDED`         | Product Owner approved the two short-label pairs as the same Axis Identity    |
| Canonical Label            | `DECIDED`         | Product Owner approved the six formal Japanese labels                         |
| Short Label                | `DECIDED`         | Product Owner approved governed presentation aliases                          |
| Self / Competitor Identity | `DECIDED`         | Product Owner approved one Formal Common 6 Axis Identity across both features |
| Canonical ID               | `NEEDS_DISCOVERY` | five keep candidates; `funnelStrength` semantic mismatch unresolved           |
| Canonical Order            | `NEEDS_DISCOVERY` | policy recommendation exists but P/A conflict needs Product rationale         |
| Axis Definition            | `NEEDS_DISCOVERY` | only historical submetrics/current copy; formal boundaries absent             |
| Backend Wire ID            | `BLOCKED`         | PD-02C Backend/API schema dependency                                          |
| Versioning                 | `NEEDS_DISCOVERY` | meaning vs formula version relationship undefined                             |

PD-02B overall remains `NEEDS_DISCOVERY`。Decided sub-itemsはFormal Axis Set / Label Identityに限り、ID/order/definition/versioningを無理に確定しない。

### Product Owner Decision Questions

1. Panoptes正式6軸は現在候補の6つで正しいか。
2. `差別化`と`差別化明確性`は同じaxisか。
3. `意思決定`と`意思決定支援`は同じaxisか。
4. `導線強度`のEnglish canonical conceptは`funnelStrength`でよいか。
5. 正式full labelは何か。
6. Short labelを許可するか。
7. Canonical IDは何か。
8. Canonical orderを持つか。
9. Feature order overrideを許可するか。
10. 各axisに正式definitionを持つか。
11. Self/Competitor/Industryは同じaxis contractを使うか。
12. UI label変更時もcanonical IDを維持するか。
13. Backend/APIでも同じIDを使うか。
14. Axis contractにversionが必要か。

Owner recommendation: Product Owner + Analysis/Data OwnerのJoint Decision。Design、Frontend、Backend/APIをConsultedとし、CodexやFrontendだけをOwnerにしない。

### PD-9 Axis Set & Label Identity Decision Review

Review result: `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`。Phase PD-9指示書は下記の推奨案をDecision proposalとして提示するが、Product Ownerによる明示的な承認文、承認者名、Decision Dateを含まない。そのため、指示書の承認ルールに従い、推奨をProduct Decisionに読み替えず、4 sub-areasは`READY_FOR_DECISION`を維持する。

| Review item               | Recommended proposal                                                             | Review assessment                                                                                                                         | Decision status      |
| ------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Formal Axis Set           | AS-A: 現在の6軸をFormal Common Axis Setとする                                    | Self/Competitorのactive evidenceとIndustryの同一concept候補が支持。AS-Bよりstandardizationに適し、AS-Cを必要とする追加/削除evidenceはない | `READY_FOR_DECISION` |
| Canonical Japanese Labels | 価値訴求、情報階層、導線強度、信頼構造、差別化明確性、意思決定支援               | Full-label evidenceが繰り返し一致し、公式文書・metadata・full-label UIに使える                                                            | `READY_FOR_DECISION` |
| Short Label Policy        | governed presentation aliasとして許可                                            | canonical semanticsとidentityを変えず、狭いUI/chartに限る契約が明確                                                                       | `READY_FOR_DECISION` |
| Semantic Equivalence      | `差別化` = `差別化明確性`のshort label、`意思決定` = `意思決定支援`のshort label | Self/Competitorの同じ6 position/input contractとcurrent usageが支持                                                                       | `READY_FOR_DECISION` |

#### Options reviewed

- AS-A: current six-axis setをFormal Common Axis Setとする。推奨。既存evidenceを最も直接に表現し、Self/Competitor alignmentと将来のIndustry alignmentを支持する。
- AS-B: current six-axis setを暫定維持し、formal decisionを延期する。安全だが、label metadataとcross-feature identityのstandardizationは解禁できない。
- AS-C: six-axis set自体を再設計する。軸の追加・削除を要求するrepository evidenceがないため非推奨。

#### Proposed label contract

- `canonicalLabel`はProduct正式日本語名称であり、Data Dictionary、共通metadata、formal report、将来のBackend/API documentation、UI full-labelで優先する。
- `shortLabel`は同一Axis Identityに属するpresentation aliasであり、別axis・別concept・別scoreではない。
- 現在の登録候補は`差別化明確性` → `差別化`、`意思決定支援` → `意思決定`の2件だけとする。
- Featureが独自にshort labelを追加しない。新しい短縮はData DictionaryまたはProduct metadataの承認済み契約へ登録する。
- Data Dictionary、formal report、API documentation、Product Decisionでは`canonicalLabel`を優先する。本PhaseでUI表示は変更しない。

#### Cross-feature relation proposed for approval

- Self AnalysisとCompetitor Analysisは同じFormal Common 6 Axis Identityを参照する。同一化するのはAxis Identityだけで、score value、calculation、evidence、presentation、feature compositionは別contractのままとする。
- Industry Analysisは同じ6 axis conceptへ整合する方向とする。現在はfixture evidenceのため、real-data schema、Backend/API contract、canonical orderは本ReviewのDecisionに含めない。
- StrategyはCommon 6 Axisの直接consumerと定義しない。impact、fit、priority、progressは別metricのままとする。

#### Approval record

| Field                     | Value                                                                      |
| ------------------------- | -------------------------------------------------------------------------- |
| Decision owner            | Product Owner（Accountable）、Analysis/Data Owner（joint domain approval） |
| Product Owner approval    | `NOT_PROVIDED`                                                             |
| Selected option           | —                                                                          |
| Decision date             | —                                                                          |
| Axis Set sub-status       | `READY_FOR_DECISION`                                                       |
| Label Identity sub-status | `READY_FOR_DECISION`                                                       |
| PD-02B overall            | `NEEDS_DISCOVERY`                                                          |

Canonical ID、`funnelStrength`代替名、Canonical Order、Feature override、Axis Definition本文、Versioning、Backend Wire ID、formula、weight、threshold、missing/partial、semantic colorは本Reviewで決定しない。

### PD-10 Product Owner Approval Check

Approval result: `NOT_PROVIDED`。Phase PD-10指示書はDecision A–Gを承認対象とし、明示的なProduct Owner入力がある場合だけ`DECIDED`へ進めるよう要求する。しかし、本指示書には「PD-02BのAxis Set & Label Identity Proposalを承認する」または同等の承認文はない。

| Approval target                   | Proposal retained                                                         | Approval evidence | Final status         |
| --------------------------------- | ------------------------------------------------------------------------- | ----------------- | -------------------- |
| Formal Common Axis Set            | 価値訴求、情報階層、導線強度、信頼構造、差別化明確性、意思決定支援        | `NOT_PROVIDED`    | `READY_FOR_DECISION` |
| Canonical Japanese Labels         | 同上6 labelsを`canonicalLabel`とする                                      | `NOT_PROVIDED`    | `READY_FOR_DECISION` |
| Short Label Policy                | governed Presentation Aliasとして許可                                     | `NOT_PROVIDED`    | `READY_FOR_DECISION` |
| Semantic Equivalence              | `差別化` → `差別化明確性`、`意思決定` → `意思決定支援`の同一Axis Identity | `NOT_PROVIDED`    | `READY_FOR_DECISION` |
| Self / Competitor Common Identity | 同一Formal Common 6 Axis Identityを使用                                   | `NOT_PROVIDED`    | `READY_FOR_DECISION` |
| Industry direction                | 同一6 Axis Conceptへ整合                                                  | `NOT_PROVIDED`    | proposal maintained  |

#### Decision record

| Field                  | Value                                                  |
| ---------------------- | ------------------------------------------------------ |
| Product Owner approval | `NOT_PROVIDED`                                         |
| Approval wording       | —                                                      |
| Decision date          | —                                                      |
| Decision owner         | Product Owner（approval authority、not yet exercised） |
| Axis Set               | `READY_FOR_DECISION`                                   |
| Label Identity         | `READY_FOR_DECISION`                                   |
| PD-02B overall         | `NEEDS_DISCOVERY`                                      |

StrategyはFormal Common 6 Axisの直接consumerとして扱わず、impact、fit、priority、progressは別metricのままとする。Approvalが得られていないため、Common Axis metadata、canonical labels、governed short-label metadata、Self/Competitor label alignment、shared chart labels、axis accessibility naming、axis-aware component contractの実装・標準化はまだ解禁しない。

Canonical ID、`funnelStrength` rename、Canonical Order、Axis Definitions、Versioningは`NEEDS_DISCOVERY`、Backend Wire IDは`BLOCKED`。Candidate key、order、enum、Backend schema、formula、threshold、semantic color、missing-value UI contractは変更しない。

### PD-11 Explicit Product Owner Approval Record

Approval Evidence: 「PD-02BのAxis Set & Label Identity Proposalを承認する。」  
Approval Date: 2026-08-20  
Decision Owner: Product Owner  
Approval Status: `APPROVED`

| Approved decision                 | Decision record                                                              | Status               |
| --------------------------------- | ---------------------------------------------------------------------------- | -------------------- |
| Formal Common Axis Set            | 価値訴求、情報階層、導線強度、信頼構造、差別化明確性、意思決定支援           | `DECIDED`            |
| Canonical Japanese Labels         | 同上6 labelsを`canonicalLabel`とする                                         | `DECIDED`            |
| Short Label Policy                | governed presentation aliasとして許可し、feature-local arbitrary aliasを禁止 | `DECIDED`            |
| Semantic Equivalence              | `差別化` = `差別化明確性`、`意思決定` = `意思決定支援`の同一Axis Identity    | `DECIDED`            |
| Self / Competitor Common Identity | 同じFormal Common 6 Axis Identityを使用                                      | `DECIDED`            |
| Industry Direction                | 同じFormal Common 6 Axis Conceptへ整合するProduct方向性                      | `APPROVED_DIRECTION` |

#### Formal Axis and label contract

| Canonical Japanese label | Governed short label | Identity rule                                            |
| ------------------------ | -------------------- | -------------------------------------------------------- |
| 価値訴求                 | —                    | Formal Common Axis                                       |
| 情報階層                 | —                    | Formal Common Axis                                       |
| 導線強度                 | —                    | Formal Common Axis; English/domain ID remains unresolved |
| 信頼構造                 | —                    | Formal Common Axis                                       |
| 差別化明確性             | 差別化               | Same Axis Identity; presentation alias only              |
| 意思決定支援             | 意思決定             | Same Axis Identity; presentation alias only              |

Short Labelは別Axis、別Product Concept、別Score、別Formula、別Backend fieldを意味しない。新しいShort Labelは本Data Dictionaryまたは将来の正式Product metadataへgoverned aliasとして登録する。

Self AnalysisとCompetitor Analysisで共通化したのはAxis Identityだけである。Score values、formula、evidence、mapping、visualization、threshold、missing behavior、feature-specific compositionは別contractのままとする。Industry fixtureをBackend contractとして扱わない。StrategyはFormal Common 6 Axisの直接consumerとせず、impact、fit、priority、progressを別metricとして維持する。

#### Status and remaining boundary

| Area                 | Status             |
| -------------------- | ------------------ |
| PD-02 parent         | `NEEDS_DISCOVERY`  |
| PD-02B overall       | `NEEDS_DISCOVERY`  |
| Axis Set             | `DECIDED`          |
| Label Identity       | `DECIDED`          |
| Semantic Equivalence | `DECIDED`          |
| Short Label          | `DECIDED`          |
| Canonical ID         | `NEEDS_DISCOVERY`  |
| `funnelStrength`     | `RENAME_CANDIDATE` |
| Canonical Order      | `NEEDS_DISCOVERY`  |
| Axis Definitions     | `NEEDS_DISCOVERY`  |
| Versioning           | `NEEDS_DISCOVERY`  |
| Backend Wire ID      | `BLOCKED`          |

上記6 labelsの列挙順をCanonical Orderへ昇格しない。Candidate keysをcanonical IDへ昇格せず、特に`funnelStrength`は`RENAME_CANDIDATE`を維持する。

PD-02Cは決定済みFormal Axis Set / Labels / Semantic Equivalenceをscore対象のProduct Identityとして参照できる。ただしCanonical ID未決定のためBackend schema implementationはまだ開始しない。PD-02Dは6 Formal Common Axesをmissing / partial対象として参照できるが、null表現、fallback、partial completeness、`partially_completed`、Backend representationは未決定である。

承認によりCommon Axis metadata model、canonical Japanese label metadata、governed short-label metadata、Self/Competitor label alignment、shared chart label、axis accessibility naming、axis-aware component contractのplanningを解禁する。Canonical ID enum、key rename、`funnelStrength` rename、Canonical Order統一、Backend enum/schema、formula/threshold helper、semantic score color、missing-value UI、versioned Axis contractの実装は引き続き禁止する。

### PD-12 Canonical ID & Funnel Naming Discovery

本節はFrontend fixture keyをProductのCanonical IDへ自動昇格させるものではない。Repository evidenceからdomain-level ID候補をDecision Review可能な状態へ整理し、Product Owner承認まではsource、fixture、type、Backend contractを変更しない。

#### Canonical ID design principles and format

- 1 Axis IdentityにつきCanonical IDは1つとし、legacy/fixture keyはcanonical aliasにしない。
- IDは表示label・locale・feature・一時的な実装から独立し、Self / Competitor / Industryで共有可能なProduct conceptを表す。
- Frontend domain IDは既存TypeScript object keyと整合し、migration costが最小の`camelCase`を推奨する。`snake_case`は将来のwire/persistence候補になり得るが今回のBackend Wire IDでは決定しない。`kebab-case`はobject property accessと既存慣行に不利である。
- Canonical Japanese Label、Canonical ID、Short Label、将来のEnglish Display Labelは別metadataとする。

#### Candidate ID Matrix

| Canonical Label | Current Candidate        | Semantic Fit                                                                      | Stability | Ambiguity                                        | Recommendation                         | Readiness            |
| --------------- | ------------------------ | --------------------------------------------------------------------------------- | --------- | ------------------------------------------------ | -------------------------------------- | -------------------- |
| 価値訴求        | `valueProposition`       | Strong。価値、problem-solution、benefit、offerの伝達を包含                        | High      | Medium。product valueそのものとの混同余地        | `KEEP`。定義で「伝達された価値」を明記 | `READY_FOR_DECISION` |
| 情報階層        | `informationHierarchy`   | Strong。heading、section order、navigation information、content groupingに一致    | High      | Low–Medium。Information Architecture全体より狭い | `KEEP`                                 | `READY_FOR_DECISION` |
| 導線強度        | `funnelStrength`         | Partial。conversion pathは含むが内部回遊・遷移・CTA progression全体を表し切らない | Low       | High。analytics/conversion funnelへ過度に限定    | `RENAME`                               | `NEEDS_DISCOVERY`    |
| 信頼構造        | `trustStructure`         | Strong。proof、authority、credibility、FAQを組み合わせた構造に一致                | High      | Medium。単一trust signalとの境界は定義で補う     | `KEEP`                                 | `READY_FOR_DECISION` |
| 差別化明確性    | `differentiationClarity` | Strong。unique claim、positioning、distinctivenessに一致                          | High      | Low                                              | `KEEP`                                 | `READY_FOR_DECISION` |
| 意思決定支援    | `decisionSupport`        | Strong。pricing、comparison、friction reduction、readinessに一致                  | High      | Medium。導線そのものは含めない                   | `KEEP`                                 | `READY_FOR_DECISION` |

5件の`KEEP`はProduct Owner + Analysis/Data OwnerのDecision Proposalに進められる。Canonical ID全体は導線軸が未確定のため`NEEDS_DISCOVERY`を維持する。

#### Funnel semantic evidence

| Semantic candidate | Evidence                                                   | Classification |
| ------------------ | ---------------------------------------------------------- | -------------- |
| CTA                | presence、position/text redesign、progression logic        | `SUPPORTED`    |
| link structure     | related links、comparison/pricing page links               | `SUPPORTED`    |
| navigation         | navigation strength、回遊設計                              | `SUPPORTED`    |
| internal path      | likely primary paths、comparison phase path                | `SUPPORTED`    |
| conversion         | conversion path visibility、trust before conversion        | `SUPPORTED`    |
| user flow          | 「単体ページではなく流れ」、service → pricing → CTA        | `SUPPORTED`    |
| decision flow      | decision pageへ自然に移すが、decision material自体はAxis 6 | `PARTIAL`      |
| funnel             | conversion funnelは一部だがaxis全体ではない                | `PARTIAL`      |
| pathway            | page/path transitionを表す概念として適合                   | `SUPPORTED`    |
| journey            | customer journey全体を評価する明示証拠なし                 | `UNKNOWN`      |
| transition         | pricing page transition、stage transition                  | `SUPPORTED`    |

含む意味はCTA presence/progression、internal navigation/link structure、主要path、stage coverage、comparison/pricing transition、conversion path visibilityである。含まない、または未確認なのはtraffic acquisition funnel、conversion rate等の実績analytics、customer journey全体、実際の意思決定結果、trust evidenceの質、pricing/comparison contentの十分性、heading/content groupingである。

#### Funnel naming candidate comparison

| Option | Candidate                | Assessment                                                                                           |
| ------ | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| FN-A   | `funnelStrength`         | conversionを強く示しすぎ、navigation/user flowを狭める                                               |
| FN-B   | `navigationStrength`     | internal navigationには強いがCTA/stage/conversion pathを欠く                                         |
| FN-C   | `pathwayStrength`        | 範囲は近いがProduct IDとして抽象的で、`strength`も評価内容を説明しにくい                             |
| FN-D   | `conversionPathStrength` | conversion pathには正確だが非conversion回遊を狭める                                                  |
| FN-E   | `decisionPathStrength`   | Axis 6との衝突が大きい                                                                               |
| FN-F   | `userFlowStrength`       | 範囲は広いが`strength`がpresence/logic/visibilityを一括説明しにくい                                  |
| FN-G   | `journeyStrength`        | customer journey/analytics全体と誤解される                                                           |
| FN-H   | `flowStrength`           | engineering/data flowとも衝突し、修飾が不足                                                          |
| FN-I   | `userFlowQuality`        | Repositoryのpath、navigation、CTA progression、transition evidenceを最も均衡して表す。第一rename候補 |
| FN-J   | `navigationFlowQuality`  | 第二候補。navigationを明示するがconversion pathを弱める                                              |

`quality`はpresence、progression logic、visibility、stage coverageを包含できる。`effectiveness`は実績conversionや行動計測を暗示するため現証拠では採用しない。`userFlowQuality`はProposalであり、Axis DefinitionとProduct Owner承認なしにCanonical IDへ昇格しない。

#### Adjacent axis boundaries

- 導線強度 vs 意思決定支援: 前者は到達可能性、順序、移動、CTA/path visibilityを所有する。後者はpricing/comparison情報、選択材料、friction reduction、decision readinessを所有する。
- 情報階層 vs 意思決定支援: 前者はheading、section order、navigation information、content groupingを所有する。後者は意思決定に必要な情報の十分性を所有する。
- 価値訴求 vs 差別化明確性: 前者は価値・課題解決・便益・offerの伝達、後者は競合に対する固有性・positioning・message distinctivenessを所有する。
- 信頼構造 vs 意思決定支援: 前者はproof、authority、credibility、FAQ/objection handling、後者はpricing/comparisonとdecision frictionを所有する。Trust evidenceが判断を助けてもAxis Identityは信頼構造に残す。

#### Legacy key migration considerations

Canonical IDが現行keyと異なる場合は`mapping compatibility`を先に設け、旧keyを明示的なlegacy/migration aliasとしてcanonical metadataへ変換し、consumer移行とcontract test後に段階的に除去する。即時renameはfixture、Self delta、strategy expected lift等を同時に壊すため推奨しない。今回source変更は行わない。

#### Readiness, dependencies, and decision questions

- Per-axis: 5軸は`READY_FOR_DECISION`、導線軸は`NEEDS_DISCOVERY`。
- Axis Definition: 導線軸のincluded/excluded semanticsとAxis 6境界が`BLOCKING_DEPENDENCY`。他5軸でも正式定義は必要だがID候補Reviewのblockerではない。
- Canonical Order / Versioning: `NEEDS_DISCOVERY`のまま。Backend Wire ID: `BLOCKED`のまま。
- Decision owner: Product Owner + Analysis/Data Owner。Backend/API、FrontendはConsulted。

Product OwnerへのDecision Questions:

1. Canonical IDをEnglish domain IDとするか。
2. Frontend domain ID formatを`camelCase`とするか。
3. `valueProposition`をCanonical IDとして承認するか。
4. `informationHierarchy`をCanonical IDとして承認するか。
5. `trustStructure`をCanonical IDとして承認するか。
6. `differentiationClarity`をCanonical IDとして承認するか。
7. `decisionSupport`をCanonical IDとして承認するか。
8. `funnelStrength`をrenameするか。
9. 導線強度にCTA progressionを含めるか。
10. internal navigation/link structureを含めるか。
11. conversion pathを含めるがconversion analyticsは除外するか。
12. decision pageへの移動を含め、decision material自体はAxis 6へ分離するか。
13. 第一rename候補`userFlowQuality`をAxis Definition reviewへ進めるか。
14. Canonical IDとBackend Wire IDを同一にするかは別Decisionとするか。
15. Legacy keyはmapping compatibilityによる段階移行とするか。

5件のIDが決定すればcanonical axis metadata key、domain type、label lookup、accessibility ID、Self/Competitor mapping normalizationのplanningが追加で解禁可能になる。現時点ではID enum、fixture/type rename、canonical order、Backend schema、OpenAPI、formula、threshold、versioningの実装はblockedである。

### PD-13 Five Canonical IDs Decision Review

Review result: `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`。Phase PD-13指示書は5 IDと`camelCase`をDecision対象として提示したが、「Five Canonical IDs Proposalを承認する」または各IDを承認する明示文を含まない。従ってRecommendationをDecisionへ読み替えず、承認日・承認者を空欄のまま維持する。

#### ID format review

| Option | Format       | Assessment                                                                           | Status                             |
| ------ | ------------ | ------------------------------------------------------------------------------------ | ---------------------------------- |
| F-A    | `camelCase`  | TypeScript property、現行candidate keys、Frontend metadata、migration costと最も整合 | `RECOMMENDED / READY_FOR_DECISION` |
| F-B    | `snake_case` | Backend wire/persistenceでは候補だがFrontend domain慣行と不一致                      | Not selected                       |
| F-C    | `kebab-case` | property accessと既存ecosystemに不利                                                 | Not selected                       |

`camelCase`はFrontend / Product Domain Canonical ID formatのProposalであり、Backend Wire ID formatではない。明示承認がないため`DECIDED`にはしない。

#### Five Canonical ID review

| Axis                    | Canonical Label | Recommended ID           | Alternatives reviewed                                                        | Decision rationale                                                                                            | Approval evidence | Final status         |
| ----------------------- | --------------- | ------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------- |
| Value Proposition       | 価値訴求        | `valueProposition`       | `valueCommunication`, `valueCommunicationClarity`                            | value communication、problem-solution、benefit、offerを最も安定して包含。Definitionで「伝達された価値」を補う | `NOT_PROVIDED`    | `READY_FOR_DECISION` |
| Information Hierarchy   | 情報階層        | `informationHierarchy`   | `contentHierarchy`, `informationStructure`                                   | heading、section order、content grouping、navigation informationを包含し、content限定や構造一般化を避ける     | `NOT_PROVIDED`    | `READY_FOR_DECISION` |
| Trust Structure         | 信頼構造        | `trustStructure`         | `trustSignals`, `credibilityStructure`, `trustEvidence`                      | signalの有無だけでなくproof、authority、FAQを含む信頼形成の構造を表す                                         | `NOT_PROVIDED`    | `READY_FOR_DECISION` |
| Differentiation Clarity | 差別化明確性    | `differentiationClarity` | `competitiveDifferentiation`, `positioningClarity`, `distinctivenessClarity` | differenceの存在だけでなく、その明確な伝達を表しcanonical labelと直接整合                                     | `NOT_PROVIDED`    | `READY_FOR_DECISION` |
| Decision Support        | 意思決定支援    | `decisionSupport`        | `decisionReadiness`, `decisionEnablement`, `decisionClarity`                 | pricing、comparison、friction reduction、decision informationを最も広く包含                                   | `NOT_PROVIDED`    | `READY_FOR_DECISION` |

各IDは個別に承認・却下・差戻し可能であり、All-or-Nothing setではない。5件とも現行candidate keyと一致するため、承認された場合も`NO_IMMEDIATE_RENAME_REQUIRED`である。ただし正式metadata modelへ接続する際はfixture/mappingとのcontractを再確認する。

#### Decision policy and remaining boundaries

- `1 Axis = 1 Canonical ID`は推奨Policyとして`READY_FOR_DECISION`。複数のCanonical IDを恒久併存させず、legacy/fixture keyはcompatibility mappingとして分離する。
- Canonical ID / Canonical Label / Short Labelの3層分離を維持する。English Display Labelは別Decisionである。
- 導線強度は本Review対象外。`funnelStrength`は`RENAME_CANDIDATE / NOT_CANONICAL`、`userFlowQuality`は`PROPOSED / NEEDS_DISCOVERY`。
- Backend Wire IDは`BLOCKED`、Canonical Order・Axis Definitions・Versioningは`NEEDS_DISCOVERY`を維持する。
- PD-02B overallとPD-02 parentは`NEEDS_DISCOVERY`を維持する。
- 明示承認がないため新たに解禁されたstandardizationはない。PD-11で解禁済みのlabel/identity planningだけを維持する。
- 5 IDが将来承認された場合はcanonical metadata key、shared domain identifier type、canonical/short label lookup、stable accessibility identifier、Self/Competitor mapping alignment、generic axis-aware contractのplanningを追加解禁できる。
- Source key、enum、mapping、fixture、Svelte、chart、order、CSS/Tailwind、Rails、BFF、OpenAPIは変更しない。

### PD-14 Five Canonical IDs Explicit Product Owner Approval Record

Approval Evidence: 「PD-02BのFive Canonical IDs Proposalを承認する。」  
Approval Date: 2026-08-20  
Decision Owner: Product Owner  
Approval Status: `APPROVED`

#### Approved Canonical ID contract

| Formal Axis Identity    | Canonical Label | Short Label | Canonical ID             | Status    |
| ----------------------- | --------------- | ----------- | ------------------------ | --------- |
| Value Proposition       | 価値訴求        | —           | `valueProposition`       | `DECIDED` |
| Information Hierarchy   | 情報階層        | —           | `informationHierarchy`   | `DECIDED` |
| Trust Structure         | 信頼構造        | —           | `trustStructure`         | `DECIDED` |
| Differentiation Clarity | 差別化明確性    | 差別化      | `differentiationClarity` | `DECIDED` |
| Decision Support        | 意思決定支援    | 意思決定    | `decisionSupport`        | `DECIDED` |

Frontend / Product Domain Canonical ID Formatは`camelCase / DECIDED`。`1 Formal Axis Identity = 1 Canonical ID` Policyも`DECIDED`とする。Canonical IDはmachine/domain identity、Canonical Labelは正式日本語Product label、Short Labelはgoverned presentation aliasとして3層を分離する。

5 IDsは現行candidate keysと一致するため`NO_IMMEDIATE_RENAME_REQUIRED`である。ただし現行fixture/mappingを正式Canonical Contractとして認定したわけではない。正式metadata modelへの責任移行は別Standardization Phaseで設計する。異なるlegacy/fixture keyはcompatibility mapping、legacy alias、migration sourceとして扱い、複数Canonical IDsへ昇格しない。

#### Status and remaining boundary

| Area                     | Status                             |
| ------------------------ | ---------------------------------- |
| Canonical ID Format      | `DECIDED` — `camelCase`            |
| Five Canonical IDs       | `DECIDED` — 5 / 6 axes             |
| 1 Axis = 1 Canonical ID  | `DECIDED`                          |
| Funnel Axis Canonical ID | `NEEDS_DISCOVERY`                  |
| `funnelStrength`         | `NOT_CANONICAL / RENAME_CANDIDATE` |
| `userFlowQuality`        | `PROPOSED / NEEDS_DISCOVERY`       |
| Canonical ID overall     | `NEEDS_DISCOVERY` — 5 / 6 decided  |
| Canonical Order          | `NEEDS_DISCOVERY`                  |
| Axis Definitions         | `NEEDS_DISCOVERY`                  |
| Versioning               | `NEEDS_DISCOVERY`                  |
| Backend Wire ID          | `BLOCKED`                          |
| PD-02B overall           | `NEEDS_DISCOVERY`                  |
| PD-02 parent             | `NEEDS_DISCOVERY`                  |

導線強度は本承認対象外であり、`funnelStrength`を6つ目のCanonical IDへ自動昇格しない。`userFlowQuality`も未承認候補のままとする。上表の行順をCanonical Orderにしない。5 IDが決定しても正式definition本文、included/excluded evidence、adjacent-axis boundary、examples、meaning/formula/schema/lineage versionは未決定である。

#### Handoff and standardization impact

- PD-02Cは5 Canonical IDsをProduct Identityとして参照できる。ただしFunnel IDとBackend Wire ID未決定のためFull 6-axis Backend schema implementationは開始しない。
- PD-02DはFormal Axis Setと決定済み5 IDsを参照できる。Funnel ID、missing/partial representation、fallback、`partially_completed` semanticsは未決定。
- Planning解禁: canonical axis metadata key、5-axis stable domain identifiers、canonical/short label lookup、stable accessibility identifiers、Self/Competitor mapping alignment、generic axis-aware presentation contract、domain Axis type design。
- Source実装は別Phase。enum、type、metadata object、fixture/mapping rename、component migrationは今回行わない。
- 引き続き禁止: Funnel ID implementation、`funnelStrength` rename、Canonical Order統一、Backend enum/schema、formula/threshold helper、semantic score colors、missing-value UI、versioned axis contract。

### PD-15 Funnel Axis Definition Evidence Workshop

本節は導線強度のDefinitionとCanonical ID候補をDecision-readyにするDiscovery Recordであり、Product Decisionではない。Repository上に正式production score formulaはないため、documentation、production presentation、fixture、preview/test、legacy inputを区別して扱う。

#### Evidence classification

| Source class              | Confirmed evidence                                                                                                         | Use                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `PRODUCTION_PRESENTATION` | Self「主要ページ導線評価」、比較検討phase、主要導線再設計、Competitor導線強度/CTA actions                                  | Current user-facing meaning                         |
| `DOCUMENTATION`           | CTA/internal links observation、sticky CTA、navigation depth、CTA strength、comparison-route deficiency、CTA fragmentation | Design/semantic evidence、formulaではない           |
| `FIXTURE`                 | comparison/pricing paths、service→pricing→CTA、CTA position/wording、expected lift                                         | Concrete examples、単独でProduct definitionにしない |
| `PREVIEW`                 | 比較導線、導入検討phase、analysis subtitle                                                                                 | Preview semantics                                   |
| `TEST`                    | labels/order/CTA action regression                                                                                         | Current behavior preservation only                  |
| `LEGACY`                  | CTA presence/progression、internal navigation、conversion path visibility、primary paths、stage coverage                   | Historical input、current formulaではない           |
| `PRODUCTION_LOGIC`        | Canonical score formula/weights/threshold                                                                                  | `UNKNOWN / NOT_CONNECTED`                           |

#### Recommended Definition Draft

Canonical Label: 導線強度  
Definition: サイト上で次に取るべき行動が識別でき、CTA・内部リンク・ナビゲーション・ページ間遷移によって、主要な目的地点までの経路が途切れず接続されている度合い。実際のクリックや転換実績ではなく、ユーザーの移動を支える観測可能な構造の明確さ・接続性・連続性を評価する。  
Primary Evaluation Object: `User path / Page sequence`。Site structure、Page、UI elementsはそのEvidence。Conversion funnelはmajor pathの一類型であり主対象ではない。  
Status: `READY_FOR_DECISION / NOT_APPROVED`。

#### Included and excluded semantics

| Evidence                                                                            | Status / boundary                                                 |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| CTA existence、prominence、destination                                              | `INCLUDED`                                                        |
| CTA wording                                                                         | `PARTIAL` — action/destination clarityのみ。value claimは価値訴求 |
| internal links、page continuity、major path completeness、dead ends、stage coverage | `INCLUDED`                                                        |
| navigation hierarchy                                                                | `PARTIAL` — reachabilityは導線、grouping/orderは情報階層          |
| conversion path                                                                     | `INCLUDED` — major pathの一種、Axis全体を限定しない               |
| repeated/sticky CTA                                                                 | `PARTIAL` — availability/continuityへの寄与のみ                   |
| header/footer navigation                                                            | `INCLUDED` — major path reachability/dead-end回避部分             |
| CTR/CVR、session、attribution、lead/revenue、CRM/sales pipeline                     | `EXCLUDED`                                                        |
| off-site customer journey、intent prediction、actual decision outcome               | `EXCLUDED`                                                        |
| pricing/comparison content、trust quality、heading hierarchy、unique claim自体      | Other formal axes                                                 |

Structural boundary: `Observable Structural Support`を評価し、`Behavioral Performance`を評価しない。

#### Adjacent axis boundaries

- `informationHierarchy`: 情報のheading/order/grouping vs Funnel Axisのnext action/destination/reachability。
- `decisionSupport`: 進む判断材料 vs Funnel Axisの次へ進めるpath。
- `valueProposition`: value/benefit/offerの伝達 vs 価値理解後のnext action。
- `trustStructure`: proof/credibilityの質 vs trust materialへのpathとActionへの復帰。
- `differentiationClarity`: unique positioningの明確さ vs その理解を次Actionへ接続するpath。

#### Definition and examples

Candidate Aは`STRONG`だが「無理なく」をstructural evidenceへ限定する必要がある。Candidate Bはconversion-focusedで`TOO_NARROW`。Candidate Cは`STRONG_WITH_BOUNDARY`で、理解/比較の内容品質ではなくstage間接続へ限定する。Recommended DraftはAとCを統合しobservable structural supportを明記した。

Examples: service→pricing→CTA、major page→comparison page、明確なHero/section CTA destination、pricing page前後のnext action、case/FAQ/trust path、header major-task navigation、footer dead-end avoidance。  
Anti-examples: pricing内容、testimonial credibility、heading hierarchy、unique claim、actual conversion rate、attribution、CTA value claim、CRM stage。

#### Naming Candidate Matrix

| Candidate                                         | Fit                                              | Main risk                                     | Result                               |
| ------------------------------------------------- | ------------------------------------------------ | --------------------------------------------- | ------------------------------------ |
| `userFlowQuality`                                 | CTA/navigation/path/transitionを最も均衡して包含 | actual behavior/full journey/UX一般に読まれる | `RECOMMENDED / READY_FOR_DECISION`   |
| `siteFlowQuality`                                 | on-site structural scopeが明確                   | 一般的domain termとしてやや弱い               | Alternative A                        |
| `pathwayQuality`                                  | structural pathを表す                            | 抽象的                                        | Alternative B                        |
| `pathContinuity`                                  | continuityに正確                                 | CTA prominence/completenessを狭める           | Partial                              |
| `navigationQuality`                               | navigationに明確                                 | CTA/conversion pathを狭め、情報階層と近い     | Partial                              |
| `userFlowStrength`                                | scopeは広い                                      | `strength`がstructural qualityを説明しにくい  | Partial                              |
| `flowQuality`                                     | broad                                            | engineering/data flowと衝突                   | Reject                               |
| `funnelStrength`                                  | conversion pathには適合                          | conversion/analyticsへ狭める                  | `REJECT_AS_CANONICAL` recommendation |
| `conversionPathStrength` / `decisionPathStrength` | specific pathに適合                              | Axis 6と衝突、scope狭い                       | Reject                               |

`userFlowQuality`は`KEEP_CANDIDATE / READY_FOR_DECISION`。Definition metadataで`on-site`、`observable structural support`、`actual analytics excluded`を明示する。`funnelStrength`の正式statusはDecisionまで`NOT_CANONICAL / RENAME_CANDIDATE`を維持し、Source renameは行わない。

#### Readiness and decision questions

- Axis Definition: `READY_FOR_DECISION / NOT_APPROVED`。
- Canonical ID: `READY_FOR_DECISION / NOT_APPROVED`。Recommended candidateは`userFlowQuality`。
- PD-02B overall: `NEEDS_DISCOVERY`。
- Canonical Order / Versioning: `NEEDS_DISCOVERY`。Backend Wire ID: `BLOCKED`。
- Owner recommendation: Product Owner + Analysis/Data Owner。Consulted: Frontend、Backend/API、Design。

Decision Reviewでは、structural User Flow Quality定義、Funnel非限定、CTA/navigation/transition/header/footer/conversion-path inclusion、analytics/off-site journey exclusion、primary object、`quality`選択、`userFlowQuality`、Joint Owner、Backend semantic identity/wire分離を明示判断する。

### PD-16 Funnel Axis Definition & Canonical ID Decision Review

Review result: `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`。Phase PD-16指示書はDefinitionとCanonical IDをDecision対象として提示したが、「PD-02BのFunnel Axis Definition & Canonical ID Proposalを承認する」またはDefinition/IDの個別承認を含まない。RecommendationをDecisionへ読み替えず、Decision OwnerとApproval Dateは未記録とする。

#### Final Definition Proposal

Canonical Label: 導線強度  
Formal Definition Proposal: ユーザーが次に取るべき行動を識別でき、CTA・リンク・ナビゲーション・ページ遷移によって、主要な目的地点までの経路が途切れず接続されている度合い。  
Primary Evaluation Object: `User Path / Page Sequence`。  
Measurement Nature: `Observable Structural Support`。  
Behavioral Performance: `EXCLUDED`。  
Status: `READY_FOR_DECISION / NOT_APPROVED`。

Definition quality review:

- Observable web structureから評価可能で、CTR/CVR/session dataを要求しない。
- CTAだけ、navigationだけ、conversion funnelだけに限定されず、page sequenceとstage connectionを包含する。
- Content qualityは既存5 Formal Axesへ分離でき、future analysis logicのobservation inputsへ接続可能。
- Candidate Aを第一推奨とする。Candidate Bは`PARTIAL / TOO_NARROW`、Candidate Cは`STRONG_WITH_BOUNDARY`。

Included semanticsはCTA existence/placement/progression/destination clarity、internal links/navigation reachability、major path continuity、page transitions、next-action visibility、stage connection、dead-end avoidance、conversion path structure。Excluded semanticsはactual CTR/CVR、behavior/session analytics、attribution、revenue/lead quality、CRM/sales pipeline、off-site journey、actual outcomeである。

Adjacent boundaryは、情報のorder/grouping=`informationHierarchy`、判断材料=`decisionSupport`、value/benefit=`valueProposition`、proof/credibility=`trustStructure`、competitive uniqueness=`differentiationClarity`とし、Funnel Axisはそれらを通じたnext action/path connectionを所有する。

#### Canonical ID Decision Proposal

| Option                   | Assessment                                                                                                          | Result                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| UQ-A `userFlowQuality`   | CTA/navigation/page sequence/path continuityを包含。Definitionでactual behavior/full journey/UX一般の誤解を制御可能 | `RECOMMENDED / READY_FOR_DECISION` |
| UQ-B `siteFlowQuality`   | on-site scopeは明確だが一般的domain termとして弱い                                                                  | Alternative                        |
| UQ-C `pathwayQuality`    | pathを表すがwebsite/user contextが弱い                                                                              | Alternative                        |
| UQ-D `pathContinuity`    | structural continuityに明確だがCTA clarity/completenessを狭める                                                     | Partial                            |
| UQ-E `navigationQuality` | Web conceptとして明確だがCTA/conversion/page sequenceを狭める                                                       | Partial                            |
| UQ-F `flowQuality`       | 短いがdata/application flowと衝突しcontext不足                                                                      | Reject                             |

Recommended Canonical ID: `userFlowQuality`。`strength`は単純な量・強さを暗示する一方、評価対象はclarity、continuity、completeness、reachability、structural supportの複合qualityであるため使用しない。Canonical Labelとのliteral translationよりProduct semanticsを優先する。

`userFlowQuality` assessmentは`KEEP_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`。`funnelStrength`はconversion funnelへscopeを狭め、internal navigation/general path/structural qualityを表し切らないためCanonical IDとして`REJECT`を推奨する。正式状態は`NOT_CANONICAL / RENAME_CANDIDATE`を維持し、legacy/fixture migration sourceとしてのみ扱う。

#### Approval and remaining status

| Area                                               | Final status                        |
| -------------------------------------------------- | ----------------------------------- |
| Product Owner Approval Evidence                    | `NOT_PROVIDED`                      |
| Funnel Definition                                  | `READY_FOR_DECISION / NOT_APPROVED` |
| `userFlowQuality`                                  | `READY_FOR_DECISION / NOT_APPROVED` |
| `funnelStrength`                                   | `NOT_CANONICAL / RENAME_CANDIDATE`  |
| Canonical ID overall                               | `5 / 6 DECIDED / NEEDS_DISCOVERY`   |
| PD-02B / PD-02                                     | `NEEDS_DISCOVERY`                   |
| Canonical Order / other 5 Definitions / Versioning | `NEEDS_DISCOVERY`                   |
| Backend Wire ID                                    | `BLOCKED`                           |

DefinitionとIDは個別に承認・却下・差戻し可能で、All-or-Nothingではない。承認された場合だけCanonical ID全体を6 / 6 `DECIDED`へ変更し、`funnelStrength`をcanonical aliasにせず段階migrationを計画する。

明示承認がないため今回新たに解禁されたstandardizationはない。承認後はFull 6-axis metadata、Funnel metadata、Axis identifier union/type、label/accessibility lookup、Self/Competitor mapping、Industry alignment、fixture migration planningを解禁可能。Source rename/type/fixture/mapping/component/order、Backend schema、formula、missing/versioningは引き続き禁止する。

### PD-17 Funnel Axis Explicit Product Owner Approval Record

Approval Evidence: 「PD-02BのFunnel Axis Definition & Canonical ID Proposalを承認する。」  
Approval Date: 2026-08-20  
Decision Owner: Product Owner  
Approval Status: `APPROVED`

#### Decided Funnel Axis contract

| Field                     | Decided value                                                                                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical Label           | 導線強度                                                                                                                                          |
| Canonical ID              | `userFlowQuality`                                                                                                                                 |
| Formal Definition         | ユーザーが次に取るべきActionを識別でき、CTA・リンク・ナビゲーション・ページ遷移によって、主要な目的地点までの経路が途切れず接続されている度合い。 |
| Primary Evaluation Object | `User Path / Page Sequence`                                                                                                                       |
| Supporting Objects        | CTA、Link、Navigation、Page Transition、Stage-to-stage Connection                                                                                 |
| Measurement Nature        | `Observable Structural Support`                                                                                                                   |
| Behavioral Performance    | `EXCLUDED`                                                                                                                                        |
| Definition Status         | `DECIDED`                                                                                                                                         |
| Canonical ID Status       | `DECIDED`                                                                                                                                         |

Formal Included SemanticsはCTA existence/placement/progression/destination clarity、internal links/navigation reachability、major user path continuity、page-to-page transitions、next-action visibility、stage-to-stage connection、dead-end avoidance、conversion path structureとする。Conversion Pathは一部であり、Axis全体をConversion Funnelへ限定しない。

Formal Excluded Semanticsはactual CTR/CVR、session behavior、analytics-derived behavioral performance、attribution、revenue conversion、lead quality、CRM stage、sales pipeline、off-site customer journey、actual user decision outcomeとする。

Adjacent Axis BoundaryはPD-16 Proposalを正式採用する。情報の順序・grouping・structureは`informationHierarchy`、判断材料は`decisionSupport`、value/benefitは`valueProposition`、proof/credibilityは`trustStructure`、competitive uniquenessは`differentiationClarity`が所有する。`userFlowQuality`はそれらへの到達と、それらを通じたnext action/path connectionを所有する。

`userFlowQuality`はactual user behaviorを意味せず、Website上で観測可能なUser Path / Page Sequenceのcontinuity、reachability、next-action support、transition structure、structural completenessに限定する。Product semanticsをliteral translationより優先し、Canonical Labelに「強度」が含まれてもCanonical IDに`strength`を使用しない。

`funnelStrength`は`NOT_CANONICAL / RENAME_CANDIDATE / LEGACY_MIGRATION_SOURCE`とする。`userFlowQuality`のcanonical aliasではなく、将来migration時のcompatibility sourceに限る。Source rename、fixture migration、mapping migrationは本Phaseでは行わない。

#### Formal Common 6 Axis Canonical IDs

| Canonical Label | Canonical ID             | Status    |
| --------------- | ------------------------ | --------- |
| 価値訴求        | `valueProposition`       | `DECIDED` |
| 情報階層        | `informationHierarchy`   | `DECIDED` |
| 導線強度        | `userFlowQuality`        | `DECIDED` |
| 信頼構造        | `trustStructure`         | `DECIDED` |
| 差別化明確性    | `differentiationClarity` | `DECIDED` |
| 意思決定支援    | `decisionSupport`        | `DECIDED` |

Canonical ID overallは`5 / 6 DECIDED / NEEDS_DISCOVERY`から`6 / 6 DECIDED / DECIDED`へ遷移した。`camelCase`と`1 Formal Axis Identity = 1 Canonical ID` policyを維持する。

PD-02B overallとPD-02 parentは`NEEDS_DISCOVERY`を維持する。Canonical Order、他5軸のFormal Definitions、Versioningは`NEEDS_DISCOVERY`、Backend Wire IDは`BLOCKED`である。6-axis canonical metadata、common Axis identifier type、label/short-label lookup、stable accessibility identifiers、Self/Competitor mapping normalization、Industry alignment、Axis-aware presentation contract、Funnel legacy migrationのplanningは解禁するが、source implementation、Formula、Weight、Threshold、Semantic Color、Missing / Partial UI、Backend schema/wire、Versioned Axis Contractは未解禁とする。

### PD-18 Remaining Five Axis Definitions Discovery

Discovery status: `DISCOVERY_COMPLETE / AWAITING_DECISION_REVIEW`。本節は5軸のDefinition DraftをEvidenceベースでDecision-readyにするもので、Product Owner承認やDECIDEDへの遷移を行わない。PD-17で決定したFormal Labels、Canonical IDs、Display Scale、Presentation Boundary、Funnel Definitionは変更しない。

#### Common Definition Framework

各AxisはCanonical Label、Canonical ID、Definition Draft、Primary Evaluation Object、Measurement Nature、Included / Excluded Semantics、Observable Evidence、Adjacent Boundaries、Examples、Anti-examples、Unknowns、Decision Readinessを持つ。Evidenceは`OBSERVABLE_FROM_SITE`、`REQUIRES_EXTERNAL_DATA`、`BEHAVIORAL_ANALYTICS`、`UNKNOWN`へ分類し、後3分類をrepository evidenceなしでDefinitionへ含めない。同一DOM/contentが複数AxisのEvidenceになり得るが、評価観点を分離する。

#### `valueProposition` / 価値訴求

- **Definition Draft:** Product / Serviceが誰にどのような価値を提供し、どの課題・便益に応えるものかが、サイト上の主要なメッセージから明確に理解できる度合い。
- **Primary Evaluation Object:** `Value Messaging / Proposition Communication`。
- **Measurement Nature:** `OBSERVABLE_FROM_SITE`。
- **Included:** primary value claim、target problem、benefit、offer clarity、Hero messaging、service explanation、outcome proposition、customer relevance。
- **Excluded:** competitor difference、proof/credibility、pricing/comparison completeness、CTA path、actual customer outcome、actual conversion/traffic behavior。
- **Evidence:** active Self label/key、Hero/value copy、fixture `valueProposition` score/impact、historical `hero_value_clarity`、`problem_solution_alignment`、`benefit_specificity`、`offer_visibility`。Historical formula/weightは採用しない。
- **Boundary:** `differentiationClarity`は相対的な違い・選ぶ理由、`valueProposition`は絶対的な価値・便益・offerを所有する。
- **Examples:** 「工数を30%削減」、対象課題と解決方法を結ぶHero、誰向けで何が得られるかを示すservice explanation。
- **Anti-example:** 「競合唯一」だけを示し、提供価値や便益を説明しないmessage。
- **Readiness:** `READY_FOR_DECISION`。Absolute value communicationのevidenceが複数layerで一致し、隣接境界も分離可能。

#### `informationHierarchy` / 情報階層

- **Definition Draft:** ユーザーが情報の重要度と関係性を理解できるよう、内容が適切な順序・階層・グループで構成されている度合い。
- **Primary Evaluation Object:** `Content Structure / Information Hierarchy`。
- **Measurement Nature:** `OBSERVABLE_FROM_SITE`。
- **Included:** heading levels、section sequencing、grouping、information priority、content chunking、hierarchy clarity、related-information proximity、page structure。
- **Excluded:** CTA progression/path continuity、pricing completeness、proof credibility、differentiation content、actual user comprehension。
- **Evidence:** active Self/Competitor labels、section/heading presentation、fixture strengths、historical `heading_structure_clarity`、`section_order_logic`、`nav_information_clarity`、`content_grouping_coherence`。
- **Boundary:** `userFlowQuality`は次Action・destinationまでのpath、`decisionSupport`は判断情報の十分性を所有する。Navigationは情報の分類・階層という観点に限り本Axisへ含める。
- **Examples:** heading levelが内容関係を示す、重要情報から詳細へsectionが並ぶ、関連情報が一つのgroupにまとまる。
- **Anti-example:** Pricing sectionへのCTA到達性だけを評価すること。
- **Readiness:** `READY_FOR_DECISION`。Page/site双方に適用できるcontent structureとして定義し、navigation/pathとの観点分離が可能。

#### `trustStructure` / 信頼構造

- **Definition Draft:** ユーザーがProduct / Serviceまたは提供主体を信頼できると判断するための根拠・証拠・透明性が、サイト上で適切に提示・構成されている度合い。
- **Primary Evaluation Object:** `Trust Evidence / Credibility Structure`。
- **Measurement Nature:** `OBSERVABLE_FROM_SITE`。
- **Included:** social proof、authority、credentials、case evidence、testimonials、customer logos、company transparency、certifications、security/trust information、guarantees、credibility uncertaintyを減らすFAQ。
- **Excluded:** CTA path、generic pricing、feature comparison、value proposition、actual customer satisfaction、unsupported external reputation score。
- **Evidence:** active labels、case/logo/testimonial surfaces、fixture `trustStructure` score/impact、historical `social_proof_presence`、`case_evidence_strength`、`brand_identity_trust`、`faq_objection_handling`。
- **Boundary:** `decisionSupport`は選択条件・比較材料を所有する。FAQ/case studyはcontent purposeがcredibilityならTrust、choice/comparison readinessならDecision Supportとして評価する。
- **Examples:**顧客事例と成果根拠、認証・security情報、運営会社と責任主体の透明な表示。
- **Anti-example:** Pricing planの差だけを示し、信頼根拠を含まない比較表。
- **Readiness:** `READY_FOR_DECISION`。FAQを一律包含せずpurpose-basedに制限することで境界を確定可能。

#### `differentiationClarity` / 差別化明確性

- **Definition Draft:** 競合や代替選択肢と比較したときに、Product / Service固有の違い・独自性・選ぶ理由が明確に伝わる度合い。
- **Primary Evaluation Object:** `Competitive Positioning / Differentiating Message`。
- **Measurement Nature:** `OBSERVABLE_FROM_SITE`。
- **Included:** unique value、explicit comparison、distinctive feature、positioning、proprietary approach、specialization、differentiating claim、alternative framing。
- **Excluded:** generic benefit、trust proof、pricing completeness、CTA navigation、actual competitive performance、unsupported market superiority。
- **Evidence:** active full/short labels、Competitor comparison surfaces、fixture impact、historical `unique_claim_clarity`、`competitive_position_signal`、`message_distinctiveness`、`comparison_support`。
- **Boundary:** `valueProposition`は絶対的な価値、`differentiationClarity`は相対的な独自性・選択理由を所有する。同一messageでも両観点を別々に評価できる。
- **Examples:** 代替手段との明示比較、固有methodの説明、特定市場へのspecializationと選ぶ理由。
- **Anti-example:** 「業務を効率化する」というgeneric benefitだけのclaim。
- **Readiness:** `READY_FOR_DECISION`。Explicit comparisonを必須とせず、evidence-supportedなimplicit uniquenessも対象にできる。

#### `decisionSupport` / 意思決定支援

- **Definition Draft:** ユーザーが比較・選択・問い合わせ・契約などの判断を行うために必要な条件・選択肢・制約・プロセス情報が、サイト上で十分に提示されている度合い。
- **Primary Evaluation Object:** `Decision Information / Decision Readiness Support`。
- **Measurement Nature:** `OBSERVABLE_FROM_SITE`。
- **Included:** pricing availability、comparison、plan differences、scope、specifications、eligibility/conditions、choice-related FAQ、next-process information、risk/constraint disclosure、implementation information。
- **Excluded:** CTA destination/navigation path、pure trust evidence、generic benefit、actual decision outcome、behavioral conversion、off-site sales interaction。
- **Evidence:** active full/short labels、pricing/comparison/plan information、fixture impact、historical `pricing_visibility`、`compare_support`、`decision_friction_reduction`、`conversion_readiness`。
- **Boundary:** `userFlowQuality`は判断情報への/からのpath、`informationHierarchy`は配置構造、`trustStructure`はcredibility evidenceを所有する。非公開pricingを一律減点せず、business contextに必要な見積条件・process情報の十分性を評価する。
- **Examples:** plan差分と適用条件、見積processと必要情報、導入範囲・制約・契約条件。
- **Anti-example:** 問い合わせCTAの位置だけを評価すること。
- **Readiness:** `READY_FOR_DECISION`。Pricing必須ではなくcontextual sufficiencyとして定義することでB2B/non-public pricingにも適用可能。

#### Cross-Axis Boundary Matrix

| Evidence / Concept | `valueProposition`        | `informationHierarchy`  | `userFlowQuality`      | `trustStructure`        | `differentiationClarity` | `decisionSupport`                 |
| ------------------ | ------------------------- | ----------------------- | ---------------------- | ----------------------- | ------------------------ | --------------------------------- |
| Hero               | value/benefit claim       | heading/priority        | next CTA connection    | proof near claim        | unique positioning       | choice conditions                 |
| Navigation         | —                         | taxonomy/grouping       | reachability/path      | proofへの到達           | comparisonへの到達       | decision infoへの到達             |
| Pricing table      | offer/value context       | section/group structure | link/CTA transition    | guarantee/credibility   | relative positioning     | price/plan/condition completeness |
| Case study         | outcome proposition       | content structure       | case→next action path  | evidence/credibility    | distinctive capability   | selection material                |
| FAQ                | service/value explanation | grouping                | FAQ→action path        | credibility uncertainty | unique approach          | choice/condition uncertainty      |
| Comparison         | value difference context  | comparison structure    | comparison→action path | evidence quality        | relative uniqueness      | decision material completeness    |

Multi-Axis Evidenceを許可するが、同じEvidenceを使うことは同じAxisを意味しない。各Axisのsemanticとevaluation questionを分離する。Primary / Supporting Evidence分類は将来Formula設計へ接続可能だが、weightは決定しない。

各Axis 3件、合計15件のExamplesと、各Axis 1件、合計5件のAnti-examplesを記録した。5軸はいずれも個別evidenceと境界確認に基づき`READY_FOR_DECISION / NOT_APPROVED`とする。Product Owner + Analysis/Data OwnerのJoint Reviewを推奨し、Frontend、Backend/API、DesignをConsultedとする。

#### Decision Questions and Dependencies

Product Owner Reviewでは、absolute valueとdifferentiationの分離、Page/Site hierarchy scope、navigation taxonomy、FAQ/security/company transparency、explicit/implicit uniqueness、pricing非公開時のsufficiency、multi-axis evidence、Primary/Supporting分類、5 Definitionsの共通contract承認を個別確認する。

DefinitionsはCanonical Orderのsemantic sequence検討、PD-02Cのmeasurement/formula設計、PD-02Dのmissing-axis判定へ入力できる。ただしOrder、Formula、Weight、Missing semantics、Versioning、Backend Wire IDを本Phaseで決定しない。PD-02B / PD-02は`NEEDS_DISCOVERY`を維持する。

### PD-19 Remaining Five Axis Definitions Decision Review

Review status: `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`。Phase PD-19指示書には承認手続と承認文例があるが、Product Owner本人による現在の明示承認はない。Approval Evidence / Product Owner Decisionは`NOT_PROVIDED`、Decision OwnerとApproval Dateは未記録とする。RecommendationをApprovalへ読み替えない。

#### Final Definition Proposals

| Axis                                    | Final Definition Proposal                                                                                                         | Primary Evaluation Object                           | Final status                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------- |
| 価値訴求 / `valueProposition`           | Product / Serviceが誰にどのような価値を提供し、どの課題・便益に応えるものかが、サイト上の主要なメッセージから明確に伝わる度合い。 | `Value Messaging / Proposition Communication`       | `READY_FOR_DECISION / NOT_APPROVED` |
| 情報階層 / `informationHierarchy`       | ユーザーが情報の重要度と関係性を把握しやすいよう、情報が適切な順序・階層・グループで構成されている度合い。                        | `Content Structure / Information Hierarchy`         | `READY_FOR_DECISION / NOT_APPROVED` |
| 信頼構造 / `trustStructure`             | Product / Serviceまたは提供主体を信頼するための根拠・証拠・権威性・透明性が、サイト上で十分かつ適切に提示・構成されている度合い。 | `Trust Evidence / Credibility Structure`            | `READY_FOR_DECISION / NOT_APPROVED` |
| 差別化明確性 / `differentiationClarity` | 競合や他の選択肢と比較した際のProduct / Service固有の違い・独自性・選ぶ理由が明確に伝わる度合い。                                 | `Competitive Positioning / Differentiating Message` | `READY_FOR_DECISION / NOT_APPROVED` |
| 意思決定支援 / `decisionSupport`        | ユーザーが比較・選択・問い合わせ・契約などの判断を行うために必要な情報が、サイト上で十分かつ明確に提示されている度合い。          | `Decision Information / Decision Readiness Support` | `READY_FOR_DECISION / NOT_APPROVED` |

`valueProposition`はProductそのものの実価値やactual comprehensionを測らず、サイト上で伝達されたabsolute value、target problem、benefit、offerを評価する。Competitor difference、proof自体、CTA path、actual outcome/conversionを除外する。

`informationHierarchy`はobservable structural qualityとしてheading、section sequence、grouping、priority、chunking、related-information proximity、navigation taxonomyを含む。Path continuity、decision information sufficiency、proof quality、actual comprehension/interactionを除外する。

`trustStructure`はproof、testimonial、case、logo、credential、certification、authority、company transparency、security、guarantee、credibility-oriented FAQを含む。Generic pricing/benefit、pure comparison、CTA path、actual satisfaction/reputation/conversionを除外する。

`differentiationClarity`はunique claim、distinctive feature、positioning、proprietary approach、specialization、category differentiation、reason-to-choose、observable and supportable implicit uniquenessを含む。Generic benefit、proof自体、CTA path、pricing completeness、actual/unsupported superiorityを除外する。

`decisionSupport`はpricing availability、plan difference、comparison、specification、scope、condition、eligibility、process、implementation information、constraint/risk disclosure、decision-oriented FAQを含む。CTA destination/navigation、pure proof、generic value、actual decision/conversion、off-site sales interactionを除外する。Non-public pricingを自動的なlow scoreとせず、quote process、eligibility、scope、plan explanation等のcontextual sufficiencyを評価する。

#### Formal Cross-Axis Boundary Proposals

- `valueProposition` = Absolute Value。「何の価値があるか」。`differentiationClarity` = Relative Distinctiveness。「なぜ他ではなくこれか」。同一messageのmulti-axis利用は許可するが観点を分離する。
- `informationHierarchy` = 情報の配置・優先度・階層。`userFlowQuality` = 次Action / destinationへのpath、reachability。
- `informationHierarchy` = 判断情報の構造。`decisionSupport` = 判断情報の存在・十分性。
- `trustStructure` = 「信用してよいか」を支えるEvidence。`decisionSupport` = 「どれを選ぶか／契約するか」を支えるInformation。
- `decisionSupport` = 判断材料。`userFlowQuality` = 判断材料への到達と判断後の次Actionへのpath。

#### Policy Proposals

Multi-Axis Evidence Policyは`READY_FOR_DECISION / NOT_APPROVED`。同一DOM/content/pageを複数AxisのEvidenceとして利用できるが、各Axisで評価するsemantic aspectを明示する。Semantic reuseとFormula double countingを分離し、double-counting policyは`NOT_DECIDED`としてPD-02Cへ送る。

Primary / Supporting Evidence Policyはconceptとして`READY_FOR_DECISION / NOT_APPROVED`。各AxisでPrimary / Supporting Evidenceを区分可能とするが、weight、必須数、score contributionは決定せずPD-02Cへ送る。FAQはUI形式ではなくcontent purposeで分類し、Security FAQはTrust、Pricing FAQはDecision Support、navigation/general FAQは内容に応じて判断する。

Explicit competitor comparisonは`differentiationClarity`の必須条件にしない。明確で観測可能かつsupportableなpositioning、specialization、proprietary approachによるimplicit uniquenessをEvidenceとして許可する。Unsupported superiorityは除外する。

5 Definitionは個別承認・却下・差戻し可能でAll-or-Nothingではない。現時点のDefinition decided countはFunnelのみ`1 / 6 DECIDED`、残り`5 / 6 READY_FOR_DECISION / NOT_APPROVED`、Definition overallは`NEEDS_DISCOVERY`。Canonical Order / Versioningは`NEEDS_DISCOVERY`、Backend Wire IDは`BLOCKED`、PD-02B / PD-02は`NEEDS_DISCOVERY`を維持する。

明示承認後にのみFull 6-axis definition/help metadata、accessible descriptions、shared Axis Dictionary、Self/Competitor/Industry semantic mapping、cross-axis documentation、analysis evidence taxonomy planningを追加解禁できる。Source metadata/type/fixture/mapping/component/order、Formula、Weight、Threshold、Missing / Partial、Versioning、Backend schema/wireは引き続きblockedである。

### PD-20 Remaining Five Axis Definitions Explicit Product Owner Approval Record

Approval status: `APPROVED`。Approval Evidenceは「PD-02BのRemaining Five Axis Definitions Proposalを承認する。」、Approval Dateは2026-08-20、Decision OwnerはProduct Ownerである。PD-19 Final Proposalの5 Definitions、Primary Evaluation Objects、Included / Excluded Semantics、Formal Cross-Axis Boundaries、Multi-Axis Evidence Policy、Primary / Supporting Evidence concept、FAQ classification、Non-public Pricing treatment、Explicit / Implicit Differentiation treatment、Observable Evidence Boundaryを正式採用する。

#### Formal Common 6 Axis Semantic Contract

| Canonical Label | Canonical ID             | Formal Definition                                                                                                                                 | Definition status |
| --------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 価値訴求        | `valueProposition`       | Product / Serviceが誰にどのような価値を提供し、どの課題・便益に応えるものかが、サイト上の主要なメッセージから明確に伝わる度合い。                 | `DECIDED`         |
| 情報階層        | `informationHierarchy`   | ユーザーが情報の重要度と関係性を把握しやすいよう、情報が適切な順序・階層・グループで構成されている度合い。                                        | `DECIDED`         |
| 導線強度        | `userFlowQuality`        | ユーザーが次に取るべきActionを識別でき、CTA・リンク・ナビゲーション・ページ遷移によって、主要な目的地点までの経路が途切れず接続されている度合い。 | `DECIDED`         |
| 信頼構造        | `trustStructure`         | Product / Serviceまたは提供主体を信頼するための根拠・証拠・権威性・透明性が、サイト上で十分かつ適切に提示・構成されている度合い。                 | `DECIDED`         |
| 差別化明確性    | `differentiationClarity` | 競合や他の選択肢と比較した際のProduct / Service固有の違い・独自性・選ぶ理由が明確に伝わる度合い。                                                 | `DECIDED`         |
| 意思決定支援    | `decisionSupport`        | ユーザーが比較・選択・問い合わせ・契約などの判断を行うために必要な情報が、サイト上で十分かつ明確に提示されている度合い。                          | `DECIDED`         |

5 DefinitionsのPrimary Evaluation Objectsは順に`Value Messaging / Proposition Communication`、`Content Structure / Information Hierarchy`、`Trust Evidence / Credibility Structure`、`Competitive Positioning / Differentiating Message`、`Decision Information / Decision Readiness Support`として`DECIDED`。PD-19に記録したIncluded / Excluded Semanticsも正式contractとする。

#### Approved Boundaries and Policies

- ValueはAbsolute Value、DifferentiationはRelative Distinctiveness。
- Hierarchyはinformation arrangement、Flowはpath / reachability。
- Hierarchyはdecision information structure、Decisionはinformation existence / sufficiency。
- Trustはcredibility evidence、Decisionはchoice / contract information。
- Decisionはdecision material、Flowはmaterialへの到達とnext-action path。
- Multi-Axis Evidence Policyは`DECIDED`。同一observable evidenceのsemantic reuseを許可するが、Axisごとの評価観点を分離する。
- Evidence Semantic Reuseは`ALLOWED / DECIDED`。Formula Double Counting、Score Contribution、Weight、Deduplication Formula、Evidence Count Capは`NOT_DECIDED`でPD-02Cへ送る。
- Primary / Supporting Evidence conceptはPD-19の正式Approval Scopeに含まれていたため`DECIDED`。Weight、required count、score contribution、thresholdは`NOT_DECIDED`。
- FAQ Policyは`DECIDED`。UI形式ではなくcontent purposeで分類する。
- Non-public Pricing Policyは`DECIDED`。非公開であることを自動low scoreにせず、quote process、scope、eligibility、plan structure等のcontextual sufficiencyを評価対象にできる。
- Explicit / Implicit Differentiation Policyは`DECIDED`。明示比較を必須にせず、observable and supportableなimplicit uniquenessを許可する。
- Observable Evidence Boundaryは`DECIDED`。公開サイト上のcontent、messaging、structure、evidence、relationships、presentation contextを対象とし、actual behavior/comprehension/conversion/outcomeとunsupported external inferenceを除外する。

Definition decided countは`1 / 6`から`6 / 6`へ、Definition overallは`NEEDS_DISCOVERY`から`DECIDED`へ遷移した。Canonical IDsも`6 / 6 DECIDED`であり、Formal Common 6 AxisはIdentity + Meaningが6 / 6確定した。

Canonical OrderとVersioningは`NEEDS_DISCOVERY`、Backend Wire IDは`BLOCKED`、PD-02B / PD-02は`NEEDS_DISCOVERY`を維持する。PD-02CはIdentity + MeaningをFormula Discoveryのsemantic inputとして参照可能だがBackend Contract dependencyの`BLOCKED`を解除しない。PD-02DもCanonical ID / Label / Definitionを参照可能だがMissing / Partial Contractは`BLOCKED`を維持する。

Planning levelではfull semantic metadata、definition/help text、shared semantic dictionary、accessible descriptions、Self/Competitor/Industry semantic alignment、cross-axis documentation、evidence taxonomy、multi-axis evidence mapping、future formula input taxonomyを解禁する。Source metadata/type/fixture/mapping/UI、Canonical Order implementation、Formula、Weight、Threshold、double-count prevention、Semantic Color、Missing / Partial UI、Backend schema/wire、Versioned Axis Contractは未解禁である。

### PD-21 Canonical Order Discovery

Discovery status: `DISCOVERY_COMPLETE / AWAITING_DECISION_REVIEW`。Product Ownerの明示承認はなく、Canonical Orderは`NEEDS_DISCOVERY`を維持する。Canonical OrderをUI、processing、evidence acquisition、user journey、storytellingと同一視せず、serialization-neutralなProduct Domain上の標準概念列挙順として扱うProposalを作成した。

#### Order Type Definitions

| Order type                  | Definition                                            | Canonical relationship                     |
| --------------------------- | ----------------------------------------------------- | ------------------------------------------ |
| Domain Canonical Order      | Product Domainとして6軸を安定して列挙する標準概念順   | 推奨canonical semantics                    |
| UI Display Order            | feature / componentが画面上でAxisを表示・読み上げる順 | Domain defaultを参照可能。明示override候補 |
| Analysis Processing Order   | Engine / jobがAxisを計算・処理する順                  | Domain Orderから独立                       |
| Evidence Collection Order   | crawler / parser / analysisがEvidenceを取得する順     | Domain Orderから独立                       |
| User Decision Journey Order | ユーザーの非線形な理解・比較・判断・行動の概念順      | canonicalには不採用推奨                    |
| Storytelling Order          | report / presentationで説明する順                     | use caseごとに独立可能                     |

#### Existing Order Inventory

| Variant / Source                     | Sequence                                                        | Source type                               | Rationale                  | Current assessment                              |
| ------------------------------------ | --------------------------------------------------------------- | ----------------------------------------- | -------------------------- | ----------------------------------------------- |
| P: historical Product candidate      | value → information → flow → trust → differentiation → decision | `PRODUCT_PROPOSAL / LEGACY_DOCUMENTATION` | A1–A6と設計資料で反復      | Product rationaleは説明可能だが未承認           |
| A: Self                              | value → flow → differentiation → information → trust → decision | `PRODUCTION_PRESENTATION`                 | intent未記録               | active UI contract                              |
| A: Competitor                        | value → flow → differentiation → information → trust → decision | `PRODUCTION_PRESENTATION`                 | B-2 visual preservation    | Selfと同位置。short label 2件                   |
| A: Industry runtime / dummy Snapshot | value → flow → differentiation → information → trust → decision | `PREVIEW / FIXTURE_DERIVED_PRESENTATION`  | shared `AXIS_KEYS` mapping | production-like previewだがProduct specではない |
| B: Industry seed record              | value → trust → information → differentiation → flow → decision | `FIXTURE`                                 | `RATIONALE_UNKNOWN`        | object insertion order。runtimeはAへmap         |
| C: mock snapshot factory Self radar  | information → flow → differentiation → decision → trust → value | `MOCK / DEV_TEST`                         | `RATIONALE_UNKNOWN`        | label-bearing array。canonical evidenceではない |
| PD-20 documentation listing          | value → information → flow → trust → differentiation → decision | `DOCUMENTATION / PRODUCT_PROPOSAL`        | Formal Axis Setの既存列挙  | Candidate Aと一致。Order approvalではない       |

Strategyはraw common-six-axis collectionを持たず、impact stringsのsubset順だけを使うためCanonical Order evidenceにはしない。Current Snapshot typeは`radar`をlabel-bearing arrayとして保持し、Canonical ID / order versionを持たない。

#### Candidate Order Models

| Candidate                    | Order                                                           | Semantic rationale                                                     | Stability                            | UI neutrality              | Product fit                         | Recommendation                               |
| ---------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------ | -------------------------- | ----------------------------------- | -------------------------------------------- |
| A: Current Product Candidate | value → information → flow → trust → differentiation → decision | Valueからstructure/path/evidence/relative positionを経てdecisionへ列挙 | High。historical PとPD-20 docsで反復 | High                       | High                                | `RECOMMENDED / READY_FOR_DECISION`           |
| B: Decision Journey          | value → differentiation → trust → information → decision → flow | Why this → trust → understand → decide → act                           | Medium                               | Low。非線形journeyを直線化 | Medium                              | Not recommended as Domain Order              |
| C: Information-to-Action     | value → information → differentiation → trust → decision → flow | message/structureからdecision/actionへ説明                             | Medium                               | Medium                     | Medium–HighだがRepository根拠が弱い | Alternative                                  |
| D: Structural First          | information → value → differentiation → trust → decision → flow | analysis structureを先に置く                                           | Low–Medium                           | Low。Analysis寄り          | Low–Medium                          | Reject as Domain Order                       |
| E: Existing Active UI        | value → flow → differentiation → information → trust → decision | 現行Self/Competitor/preview alignment                                  | High for current UI                  | Medium。intent不明         | Medium                              | UI migration baseline。canonical理由には不足 |

Candidate Aは必然的なcausal sequenceやactual user journeyではなく、`DOMAIN_CONCEPTUAL_ORDER` / `default representational order`としてのみ推奨する。6軸はsemanticに独立し、Order変更でFormula、Weight、Backend meaning、missing判定が変化してはならない。

#### Necessity, Semantics, and Override Proposal

- Canonical Order Needed?: `YES_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`。主な価値はdocumentation consistency、metadata default、accessibility planning、radar comparability、fixture/test drift抑制。
- Recommended semantics: `DOMAIN_CONCEPTUAL_ORDER / READY_FOR_DECISION / NOT_APPROVED`。UI、User Journey、Analysis、Evidence Collection、Storytellingのhybridにしない。
- Recommended candidate: Candidate A / `READY_FOR_DECISION / NOT_APPROVED`。
- Override Policy: OP-B「Domain Orderをdefaultとし、feature-specific semanticsがある場合だけ明示理由付きoverride」/ `READY_FOR_DECISION / NOT_APPROVED`。
- Override候補条件: reason、owner、explicit configuration、accessibility impact、radar comparability、review conditionを記録し、implicit array orderに依存しない。

#### Metadata, Radar, Snapshot, and Accessibility Impact

Metadata representationはOM-Bのordered Canonical ID listをsingle source of truthとして推奨する。Axis metadataのnumeric `order`との二重管理は避ける。例示は`canonicalAxisOrder = [valueProposition, informationHierarchy, userFlowQuality, trustStructure, differentiationClarity, decisionSupport]`だが、本PhaseではSource追加しない。

RadarはAxis順でpolygon形状と比較知覚が変わる。現行Self / Competitor / preview IndustryはA順で一致するが、Candidate Aへ移行するとvisual shapeが変わる。将来は同一比較文脈のRadar defaultを統一し、override時は明示理由とvisual regressionを要求する。Sourceは変更しない。

Snapshot lineageは`SNAPSHOT_ORDER_LINEAGE_UNKNOWN`。Current `PanoptesSelfData.radar`はlabel-bearing positional arrayでCanonical ID / order versionがなく、mock Cとdummy Aが共存する。過去Snapshotを再描画する場合のorder preservation、ID mapping、order versionはVersioning / Backend Contractで確認する。

Accessibility reading orderはDomain Orderをdefault planning inputにできるが、DOM structureとtask flowが優先される。Documentationは原則Canonical Orderで列挙するProposalとし、別order利用時は目的を明示する。

#### Formula, Backend, Missing, and Versioning Boundaries

- Formula / WeightはCanonical IDへ明示的に紐付け、array indexをlookup keyにしない。
- Backend serializationは`score[0]`等のimplicit positional contractを避け、Canonical IDで識別するProposalとする。Backend Wire IDは`BLOCKED`。
- Missing / PartialもpositionではなくCanonical IDで識別するProposalとする。PD-02Dは`BLOCKED`。
- Order変更がProduct semantic changeかpresentation-only changeかはVersioning Phaseで決定する。Versioningは`NEEDS_DISCOVERY`。

#### Decision Readiness and Questions

Canonical Order Necessity、Semantics、Candidate A、Override Policyはすべて`READY_FOR_DECISION / NOT_APPROVED`。Product OwnerをAccountable、Analysis/Data、Frontend、Design、Backend/APIをConsultedとする。

Product Ownerには、必要性、Domain標準列挙順、UI defaultとの関係、override許可・理由必須化、Radar統一、documentation利用、User Journey / causal meaningの除外、Order versioning、Snapshot lineage metadata、positional Backend contract禁止、ordered ID listのsingle source化を確認する。

PD-02B / PD-02は`NEEDS_DISCOVERY`、Canonical Orderは`NEEDS_DISCOVERY`、Versioningは`NEEDS_DISCOVERY`、Backend Wire IDは`BLOCKED`を維持する。次PhaseはPD-22 Canonical Order Decision Reviewを推奨する。

### PD-22 Canonical Order Decision Review

Review status: `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`。PD-21のRepository evidence、Order taxonomy、Candidate A–E、override、Radar / Snapshot / accessibility / documentation影響を再評価し、Product Ownerが個別承認・却下・差戻しできるFinal Proposalへ正本化した。今回の入力にはProduct Owner本人の明示承認がないため、以下を`DECIDED`へ変更しない。

#### Final Decision Proposals

| Decision                  | Final proposal                                                                                                                       | Review result                       | Approval evidence |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | ----------------- |
| Canonical Order Necessity | `YES`。Formal Common 6 Axisをdocumentation、domain metadata、default representation、cross-feature communicationで安定列挙する       | `READY_FOR_DECISION / NOT_APPROVED` | `NOT_PROVIDED`    |
| Canonical Order Semantics | `DOMAIN_CONCEPTUAL_ORDER`。serialization-neutralなProduct Domain上のstandard conceptual ordering                                     | `READY_FOR_DECISION / NOT_APPROVED` | `NOT_PROVIDED`    |
| Canonical Order           | Candidate A: `valueProposition → informationHierarchy → userFlowQuality → trustStructure → differentiationClarity → decisionSupport` | `READY_FOR_DECISION / NOT_APPROVED` | `NOT_PROVIDED`    |
| Override Policy           | OP-B: Domain default + explicit feature override                                                                                     | `READY_FOR_DECISION / NOT_APPROVED` | `NOT_PROVIDED`    |
| Metadata Representation   | OM-B: ordered Canonical ID listをsingle source of truthとする                                                                        | `READY_FOR_DECISION / NOT_APPROVED` | `NOT_PROVIDED`    |

Candidate Aはhistorical Product listingと正式6-axis Semantic Contractの列挙に整合し、Journey / Analysis / feature固有の意味を持ち込まないため第一推奨とする。Candidate BはJourney-specific、Candidate CはStorytelling寄りの代替、Candidate DはAnalysis-firstで非推奨、Candidate Eは現行UI baselineとしてのみ保持する。「valueからdecisionへ必ず順番に進む」という因果モデルはRationaleに含めない。

#### Formal Non-Meaning Contract

Canonical OrderはAxis importance、Product priority、Score / Formula weight、causal dependency、analysis maturity、User Journey stage、mandatory UI order、Analysis Processing Order、Evidence Collection Order、Backend serialization position、rankingを意味しない。Formula / Weight / Eligibility / Threshold / MissingはCanonical IDによるexplicit mappingを使い、array indexへ意味を依存させない。

#### Domain Boundaries and Override

- UI Display Order: Domain Orderをdefault planning inputとして利用できるが強制しない。Current Self / Competitor / Industry UIは本Phaseで並べ替えない。
- User Decision Journey: user behaviorはnon-linearであり、Canonical Orderをjourneyとして扱わない。
- Analysis Processing / Evidence Collection: engine、crawler、parser、workerの実行・取得順から独立する。
- Backend: positional array contractを禁止候補とし、Canonical IDで識別する。Wire ID / schemaは未決定。
- Documentation: Formal Common 6 Axisの標準列挙にはCanonical Orderをdefault利用し、別orderにはpurposeを明記するProposalとする。
- Override: reason、owner、explicit configuration、affected feature、accessibility consideration、comparison impact、review / removal criteriaを必須候補とする。array insertion order、object iteration order、fixture順、component内hard-codeによるimplicit overrideは許可しないProposalとする。

#### Radar, Snapshot, Accessibility, and Metadata

Radar Order変更はpolygon shapeを変えるvisual regressionである。Self / Competitor / preview Industryは同一comparison context内で現在同じA順を使うため比較可能だが、Candidate A承認だけを理由に即時reorderしない。同一comparison contextでは同一Axis Orderを要求するRadar Comparability Policyは`READY_FOR_DECISION / NOT_APPROVED`であり、Product Owner approval scopeの外側に残す。

Snapshotは`SNAPSHOT_ORDER_LINEAGE_UNKNOWN`を維持し、既存Snapshot migrationは`BLOCKED / NOT_PLANNED`とする。Accessibilityではvisual、DOM、screen-reader、keyboard、legend mappingの整合をfeature側で確認し、Canonical Orderをmandatory DOM orderとはしない。

MetadataはAxis identity metadata（ID、canonical label、short label、definition）とordered Canonical ID listを分離できる。numeric `order`とordered listの二重正本は作らない。本Phaseでは`canonicalAxisOrder`をSourceへ追加しない。

#### Approval Scope and Readiness

Product Ownerへ提示するapproval scopeは、(1) Necessity=YES、(2) Semantics=`DOMAIN_CONCEPTUAL_ORDER`、(3) Candidate A、(4)非因果・非優先度・非Weight、(5)UI非強制、(6)OP-B、(7)Formula index非依存、(8)Backend position非依存、(9)documentation default、(10)OM-Bである。個別承認を許可し、承認されていない項目を一括で`DECIDED`へ上げない。

Approval後にplanning levelで新たに解禁可能なのはCanonical Order metadata、documentation normalization、explicit override schema、canonical-order-aware test / fixture contract、shared default presentation planningである。Source reorder、active Radar migration、Snapshot migration、Versioning、Backend Wire ID/schema、Formula、Weight、Threshold、Missing / Partialは引き続き未解禁である。

Canonical Order overallはProduct Owner未承認のため`NEEDS_DISCOVERY`、Versioningも`NEEDS_DISCOVERY`、Backend Wire ID / PD-02C / PD-02Dは`BLOCKED`、PD-02B / PD-02は`NEEDS_DISCOVERY`を維持する。次Phaseは明示承認が得られた場合のみPD-23 Canonical Order Explicit Product Owner Approval Recordを推奨する。未承認時の代替はSnapshot Order Lineage Evidence WorkshopまたはVersioning Discoveryである。

### PD-23 Canonical Order Explicit Product Owner Approval Record

Approval Evidence: 「PD-02BのCanonical Order Proposalを承認する。」  
Approval Date: 2026-08-20  
Decision Owner: Product Owner  
Approval Status: `APPROVED`

PD-22 Final Proposalの正式Approval Scopeに含まれるCanonical Order Necessity、Semantics、Candidate A、Non-Meaning Contract、Axis Independence、Domain boundaries、OP-B、Documentation Policy、Accessibility Boundary、OM-B、Numeric Order Policyを`DECIDED`へ移行する。PD-22でApproval Scope外へ分離したRadar Comparability Policyはこの承認文から自動昇格させない。

#### Approved Canonical Order Contract

| Decision                | Approved value                                                                                                          | Status                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Necessity               | Panoptes Formal Common 6 AxisはCanonical Orderを持つ                                                                    | `YES / DECIDED`                     |
| Semantics               | Product Domain上のstandard conceptual ordering                                                                          | `DOMAIN_CONCEPTUAL_ORDER / DECIDED` |
| Formal Order            | `valueProposition → informationHierarchy → userFlowQuality → trustStructure → differentiationClarity → decisionSupport` | `DECIDED`                           |
| Override Policy         | OP-B: Domain default + explicit feature override                                                                        | `DECIDED`                           |
| Metadata Representation | OM-B: ordered Canonical ID list as single source of truth                                                               | `DECIDED`                           |

Canonical Labelsの同順は、価値訴求 → 情報階層 → 導線強度 → 信頼構造 → 差別化明確性 → 意思決定支援である。Candidate Aはhistorical Product candidate orderと整合し、Feature-specific UI、User Journey、Analysis Processingへ依存せず、Formal Definitionsと矛盾しないstable conceptual listingとして採用した。

#### Approved Non-Meaning and Independence Contract

Canonical Orderはimportance、Product / Business / Feature priority、Score / Formula weight、ranking、causal dependency、analysis maturity、User Journey stage、mandatory UI order、Analysis Processing Order、Evidence Collection Order、Backend serialization positionを意味しない。6 Axesは独立した評価観点であり、前Axisの成立を後Axisの前提とするdependency graphではない。Statusは`DECIDED`。

#### Approved Boundaries and Override Policy

- UI: Domain Canonical OrderはUI Display Orderを強制しない。Current Self / Competitor / preview Industryのactive UI baselineは変更しない。
- Journey: User behaviorはnon-linearであり、Canonical OrderをUser Decision Journeyとして扱わない。
- Formula: Weight、Threshold、Eligibility、Score semantics、Rankingをorder indexからlookupせず、Canonical IDへexplicit mappingする。
- Processing / Collection: Engineの実行順、crawler / parser / workerのEvidence取得順から独立する。
- Backend: Axis identityをarray positionへ依存させない。ただしBackend Wire ID、schema、serialization formatは未決定。
- Override: OP-Bを採用し、reason、owner、explicit configuration、affected feature、UX / Product rationale、accessibility、comparison impact、review criteria、必要に応じremoval / convergence criteriaを記録する。
- 禁止: array insertion、object key iteration、fixture作成順への偶然依存、理由のないhard-code、無記録のfeature order、Canonical ID以外からのidentity推測、indexをAxis identityとして扱うこと。

#### Approved Documentation, Accessibility, and Metadata Policies

Formal Common 6 AxisをProduct / Architecture / Analysis documentationで標準列挙する場合はCanonical Orderを原則利用し、別Orderを使う場合はJourney、UI、Formula等の目的を明記する。AccessibilityではCanonical Orderをplanning referenceにできるがmandatory DOM orderとはせず、visual、DOM、screen-reader、keyboard、legend mappingの整合をFeature単位で確認する。両Policyは`DECIDED`。

Canonical Orderのprimary representationはOM-B ordered Canonical ID listとする。Axis metadataのnumeric `order`とordered listを2つのCanonical Source of Truthとして併存させない。将来はAxis identity metadata（id、canonicalLabel、shortLabel、definition、evidence metadata）とCanonical Order listを責務分離できる。本PhaseではSourceへ追加しない。

#### Radar, Snapshot, Versioning, and Handoff

Radar Order変更は`VISUAL_REGRESSION_RELEVANT`であり、Canonical Order承認だけではactive Radarを変更しない。PD-22でRadar Comparabilityは明示的にApproval Scope外へ分離されていたため、同一comparison contextでOrderを統一するPolicyは`READY_FOR_DECISION / NOT_APPROVED`を維持する。

Snapshotは`SNAPSHOT_ORDER_LINEAGE_UNKNOWN`、Existing Snapshot Migrationは`BLOCKED / NOT_PLANNED`を維持する。Order Versioningは`NEEDS_DISCOVERY`、Backend Wire ID / PD-02C / PD-02Dは`BLOCKED`、PD-02B / PD-02は`NEEDS_DISCOVERY`を維持する。

PD-02CはFormal Axis Set、6 Canonical IDs、6 Definitions、Canonical Orderを正式参照できるが、FormulaをOrder indexへ依存させない。PD-02DはMissing / PartialをCanonical ID単位で定義し、positionをidentityやcompletenessへ利用しない。

Planning levelではcanonicalAxisOrder design、6-axis documentation normalization、metadata + order model、explicit override schema、order-aware test / fixture contract、shared default presentation、accessibility review、Radar migration impact、Self / Competitor / Industry normalization assessmentを解禁する。Actual Source order / Radar / Snapshot migration、Versioning implementation、Formula、Weight、Threshold、Semantic Color、Missing / Partial、Backend Wire / schemaは未解禁である。

次PhaseはPD-24 Snapshot Order Lineage Evidence Workshopを第一推奨とし、そのEvidenceをPD-25 Axis / Order Versioning Discoveryへ渡す。正本EvidenceだけでSnapshotがOrder-sensitive historyを持たずVersioning判断へ影響しないと十分確認できる場合のみ、PD-24を省略してVersioning Discoveryへ進める。

### PD-24 Snapshot Order Lineage Evidence

#### Snapshot Types and Persistence Boundary

| Snapshot type                     | Classification            | Persistence / role                                                                 |
| --------------------------------- | ------------------------- | ---------------------------------------------------------------------------------- |
| `PanoptesAnalysisSnapshotPayload` | `PRODUCTION_PRESENTATION` | Frontend表示shape。canonical production persistence schemaではない                 |
| current / last stable Snapshot    | `PRODUCTION_PRESENTATION` | current resultと再分析中の安定表示                                                 |
| mock backend Snapshot             | `MOCK / PERSISTENCE`      | dev flag時のみ。browser localStorage `panoptes.mock.v3_3.state`、SSR module memory |
| dummy Snapshot                    | `FIXTURE / PREVIEW`       | deterministic preview fallback。Persistence Contractではない                       |
| OpenAPI `AnalysisSnapshot`        | `API_CONTRACT / DRAFT`    | integer `version` + generic `payload`。Rails未実装                                 |
| screenshot artifact               | `DOCUMENTATION / PLANNED` | 画像artifact。semantic Analysis Snapshotとは別                                     |

Canonical production Snapshot persistenceは`NOT_IMPLEMENTED`。Production business clientはunavailable clientで、Rails schema/routesにProject、AnalysisSnapshot、score/axis tableはなく、BFF canonical clientにもbusiness snapshot methodはない。Fixture / preview / dev localStorageをRails/PostgreSQL contractへ昇格しない。

#### Persisted Data Shape and Identity

Dev mockがJSON保存するFrontend payloadは`analysisSnapshotId`、`projectId`、`versionLabel`、`analyzedAt`、`siteName`、`meta`、`competitors`、`industry`、`self`、`strategy`、`panoai`、`strategyPlans`、`phaseTasks`を持つ。`schemaVersion`、`axisSetVersion`、`axisDefinitionVersion`、`canonicalOrderVersion`、`formulaVersion`、model/prompt version、per-axis completenessはない。

Axis identity / orderはfeatureごとに混在する。

| Surface    | Axis identity                                     | Order mechanism                                                | Lineage                         |
| ---------- | ------------------------------------------------- | -------------------------------------------------------------- | ------------------------------- |
| Self       | `radar[]`の日本語label。Canonical IDなし          | JSON array orderを暗黙保存し、view-modelが保持                 | `ORDER_IMPLICITLY_PERSISTED`    |
| Industry   | `rating.metrics[]`の日本語label。Canonical IDなし | mock payload order、previewはprivate `AXIS_KEYS` orderから生成 | `MIXED_FIXTURE_AND_ARRAY_ORDER` |
| Competitor | Snapshotにはaggregate scoresのみ                  | runtime fixed labels + aggregate由来6 points                   | `RUNTIME_RECONSTRUCTED`         |
| dummy seed | legacy named keys                                 | `AXIS_KEYS.map`でlabel arrayへ変換                             | `FIXTURE / PREVIEW`             |

`axisOrder`、`axisIds`、`orderVersion`は明示保存されない。ただしSelf / Industryのarray positionはRadar / metric displayへ影響するため、`Order not explicitly persisted`を`Order irrelevant`と解釈しない。

#### Legacy Key and Label Identity Risk

`funnelStrength`はdummy/preview named fieldとして存在し、mapperが`導線強度`へ変換する。Canonical production snapshotへ永続化されたEvidenceはないが、legacy fixture/JSONをmigration inputにする場合は`userFlowQuality`へのexplicit mappingが必要になる。

Dev mockのSelf / Industryは日本語labelをdataへ含みlocalStorageへ保存する。Self mockでは`差別化指数`、`意思決定`、`信頼根拠`等のalternate / short labelも実効identityになり得る。Label rename compatibility riskは`HIGH`候補であり、short labelをcanonical identityとして採用しない。

#### Radar Data Path and Order Coupling

- Self: Snapshot → project detail store → Shell main surface → Snapshot surface → Self tab → `createSelfAnalysisViewModel` → comparison panel → index-based polar coordinates。保存済み`radar[]`のorderを維持する。
- Competitor: Snapshot aggregate card → competitor view-model → `createCompetitorRadarPoints` → Radar chart → index-based polar coordinates。runtime constantがorderを決める。
- Parallelな`labels[]` / `scores[]`はないが、item/point indexが角度を決めるためlabel、score、positionはcoupleする。

Canonical Orderのvalue → information → flow → trust → differentiation → decisionと、current active orderのvalue → flow → differentiation → information → trust → decisionでは同じAxis scoreでもpolygon shapeが変わる。Radar reorderは`VISUAL_REGRESSION_RELEVANT`かつhistorical interpretation riskである。

#### Historical Comparison and Partial Snapshot

Active productにはarbitrary historical Snapshot selector、`selectedSnapshotId`、before/after Radar、timeline/diffはない。`currentSnapshot` / `lastStableSnapshot`は再分析中の表示安定化でありhistory comparisonではない。Mockに複数recordsがあることもProduct comparison contractではない。

`partially_completed`はFrontend runtimeでterminal warning付き表示が可能だが、partial-axis Snapshot fixture、per-axis completeness、保存policyはない。Partial SnapshotとAxis orderの関係は`UNKNOWN / PD-04 AND PD-02D DEPENDENCY`。

#### Version Metadata, Formula, and Definition Lineage

Axis / Order用のstatusは`NO_EXPLICIT_VERSION_METADATA`。Frontend `versionLabel`とOpenAPI draft integer `version`はaxis/order/schema/formula semanticsを定義しない。Formula、weight、normalization、analysis versionは`FORMULA_LINEAGE_NOT_TRACEABLE`、Formal Definition revisionは`DEFINITION_LINEAGE_NOT_TRACEABLE`。

#### Order Lineage Classification and Compatibility Risk

Snapshot Order Lineageは`SNAPSHOT_ORDER_LINEAGE_UNKNOWN`から`KNOWN_PARTIALLY_ORDER_SENSITIVE / OLC-F MIXED`へ更新する。

- Dev mock Self / Industry: label-bearing positional array orderを暗黙保存。
- Competitor: axis dataを保存せずruntime reconstruction。
- Canonical production persistence: `NOT_IMPLEMENTED`。
- Overall compatibility risk: `HIGH`。index geometry、label identity、alternate label、legacy key、version metadata不在、feature間の方式混在による。

この`HIGH`はmock/future migrationを含むrisk assessmentであり、未実装production databaseに既存recordがあるという意味ではない。

#### Migration Considerations and Persistence Options

Canonical Order導入時の候補はCanonical ID保存、explicit orderまたはversioned order resolution、schema/axis/definition/order/formula version、legacy label/key/order mapper、snapshot-specific rendering order、order-aware fixture/testである。今回実装しない。

| Option                                                 | Assessment                                                     |
| ------------------------------------------------------ | -------------------------------------------------------------- |
| OPERSIST-A explicit `axisOrder`                        | exact renderに強いがIDとの重複正本とvalidationが必要           |
| OPERSIST-B Canonical IDs + versioned semantic contract | stable identity中心の有力候補。Backend resolver/contractが必要 |
| OPERSIST-C current canonical orderで常時表示           | historical reinterpretation riskが高く非推奨候補               |
| OPERSIST-D schema次第でorder保存不要                   | future named semantic schema次第。現時点で根拠不足             |

採用Optionは未決定。Immutable Historical Interpretation Principleは`READY_FOR_DECISION / NOT_APPROVED`とし、後続Definition / Order変更で過去の意味を暗黙変更しない原則をProduct reviewへ送る。

#### Minimum Lineage Metadata Candidates

PD-25へ渡す候補は`schemaVersion`、`axisSetVersion`、`axisDefinitionVersion`、`canonicalOrderVersion`、`formulaVersion`、commit/created timestamp、present/missing Axis IDs、completeness stateである。Model/provider/prompt metadataはreproducibility requirementに応じるcandidateで、必須とは決めない。

#### Ownership, Versioning Readiness, and Dependencies

Product historyのsource of truth候補はRails/business backend + PostgreSQL Snapshot record + analysis artifact metadataであり、Frontend localStorage/storeをcanonical ownerにしない。Formal persistenceにはRails model/table、API schema、BFF mapping、organization scopeが必要である。

Axis / Order Versioning Discoveryは`PARTIALLY_READY`。PD-25は開始可能だが、final persistence design/implementationはBackend Contractにblockedされる。PD-02Cへformula/provenance version、PD-02Dへpresent/missing Axis IDsとcompleteness candidateを渡す。Radar ComparabilityはEvidenceが強まったが`READY_FOR_DECISION / NOT_APPROVED`を維持する。PD-02B / PD-02は`NEEDS_DISCOVERY`、Backend Wire ID / PD-02C / PD-02Dは`BLOCKED`のまま変更しない。

### PD-25 Axis / Order Versioning Discovery

#### Recommended Versioning Architecture

`V-3 HYBRID / READY_FOR_DECISION / NOT_APPROVED`を推奨する。

- Immutable `axisContractVersion`: Formal Axis Set、Canonical IDs、Canonical Labels、Definitions、Included/Excluded、Cross-Axis Boundaries、Canonical Order、Multi-Axis semantic rules、Primary/Supporting Evidence concept。
- Independent `formulaVersion`: Weight、normalization、aggregation、threshold、submetric等のscore calculation。
- Independent `snapshotSchemaVersion`: Persisted shape、required metadata、array/object representation、schema migration。
- Independent `analysisPipelineVersion`: Model、prompt、extractor、crawler、analysis engine revision。PD-02C / Analysis Architecture ownership候補。
- Actual order lineage: `orderProfileId/version`またはexplicit ordered Canonical IDs。Canonical Order versionと、実際にhistorical Radarが使用したfeature orderを同一視しない。
- Backend Contract/API version: wire casing、serialization、DB representation、API compatibility。Axis semantic versionから分離する。

V-1 Single Versionはsemantic/calculation/schema変更を区別できないため非推奨。V-2 Highly GranularはSet、Identity、Definition、Orderを個別version化してcoordinationとmetadataを増やすため過剰候補。HybridはAxis semanticsを一つのpublished contractへまとめつつ、score comparabilityとpersistence migrationを独立判定できる。

#### Version Domain Taxonomy

| Domain                | Responsibility                                  | Recommended version boundary                               |
| --------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| V-A Axis Set          | add/remove/merge/split                          | `axisContractVersion`                                      |
| V-B Axis Identity     | Canonical ID/semantic continuity                | `axisContractVersion`                                      |
| V-C Axis Definition   | meaning、included/excluded、cross-axis boundary | `axisContractVersion`                                      |
| V-D Canonical Order   | domain conceptual order                         | `axisContractVersion`。Actual feature orderはorder profile |
| V-E Formula           | calculation/weight/normalization/threshold      | independent `formulaVersion`                               |
| V-F Snapshot Schema   | persisted structure/migration                   | independent `snapshotSchemaVersion`                        |
| V-G Backend Contract  | API/serialization/DB                            | API/Backend contract version                               |
| V-H Analysis Pipeline | model/prompt/extraction/engine                  | independent `analysisPipelineVersion` candidate            |

#### Change Taxonomy

| Change                            | Classification                                 | Version / compatibility action                                                |
| --------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------- |
| non-canonical display typo        | `COMPATIBLE`                                   | audited erratum、semantic bumpなし候補                                        |
| Canonical Label rename            | `PRESENTATION_COMPATIBLE / MIGRATION_REQUIRED` | new Axis Contract + legacy label mapping                                      |
| Canonical ID rename               | `BREAKING_IDENTITY_CHANGE`                     | new Axis Contract + explicit ID mapping                                       |
| Axis add/remove/merge/split       | `SEMANTICALLY_INCOMPATIBLE`                    | new Axis Contract + migration/comparison policy                               |
| Definition D-1 Editorial          | `COMPATIBLE`                                   | audited erratum。Meaning不変が条件                                            |
| Definition D-2 Clarification      | `PRESENTATION_COMPATIBLE` candidate            | interpretation影響を追跡するnew Axis Contract候補                             |
| Definition D-3 Boundary           | `SEMANTICALLY_INCOMPATIBLE`                    | new Axis Contract                                                             |
| Definition D-4 Expansion          | `SEMANTICALLY_INCOMPATIBLE`                    | new Axis Contract                                                             |
| Definition D-5 Narrowing          | `SEMANTICALLY_INCOMPATIBLE`                    | new Axis Contract                                                             |
| Canonical Order reorder           | `PRESENTATION_COMPATIBILITY_CHANGE`            | new Axis Contract + actual order profile。Positional dataはmigration required |
| Formula change                    | `SCORE_INCOMPARABLE` candidate                 | new Formula version                                                           |
| Snapshot array→ID object          | `MIGRATION_REQUIRED`                           | new Snapshot Schema version                                                   |
| Backend serialization-only change | API compatibility class                        | Axis Contract unchanged                                                       |

#### Immutable Historical Interpretation Proposal

`READY_FOR_DECISION / NOT_APPROVED`。

Historical Snapshot / Analysis Resultは将来のAxis Definition、Order、Formula変更によって暗黙に再解釈されてはならず、生成時のsemantic、formula、order-sensitive presentation contextを識別可能にする。Current CSS/layoutでre-renderすることは許容候補だが、Axis identity、Definition、Formula、Order-sensitive geometryをcurrent contractへ無表示で読み替えない。

Published contract versionはimmutableを推奨する。Lifecycleは`DRAFT → ACTIVE → DEPRECATED → RETIRED`。Deprecated/Retired versionもHistorical read/resolveを継続可能にする。同一version番号のMeaning/ID/Label/Definition/Orderを書き換えない。Pure D-1 erratumはaudit recordとして付加可能だが、interpretationに影響する修正はnew versionとする。

#### Minimum Lineage Metadata Recommendation

Recommended Hybrid model候補：

- `snapshotSchemaVersion`
- `axisContractVersion`
- `formulaVersion`
- `analysisPipelineVersion`
- `orderProfileId/version`またはexplicit ordered Canonical IDs
- `createdAt` / committed timestamp
- PD-02Dが決める`presentAxisIds`、missing information、`completeness`

`canonicalOrderVersion`をAxis Contractと別のsemantic正本にすることは非推奨。ただしactual feature orderはCanonical Orderと異なるため、order profile/ordered IDsをSnapshot lineageとして分離する。Contract fingerprintはinteger version recordのintegrity補助候補で、primary identifierではない。

#### Version Identifier and Current Contract v1

Primary IDはimmutable positive integerを推奨。SemVerはmajor/minor/patch判断をnumberへ過度に埋め込み、Date versionは同期間revisionに弱く、hashはhuman explainabilityが低い。`v1`等のdisplay prefixは可能だがstored identityはinteger候補とする。

現在DECIDED済み6 Axis Set、IDs、Labels、Definitions、Canonical Order、semantic policiesは`PRODUCT_CONTRACT_V1_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`。正式v1発行にはProduct Owner approval、published immutable registry/record、owner、effective date、fingerprint候補が必要であり、本Phaseでは発行しない。

#### Compatibility Matrix

| Change                             | Axis Contract               | Order          | Formula    | Snapshot Schema      | Historical Risk | Version Action                    |
| ---------------------------------- | --------------------------- | -------------- | ---------- | -------------------- | --------------- | --------------------------------- |
| label typo                         | unchanged                   | unchanged      | unchanged  | unchanged            | low             | erratum/no semantic bump          |
| Canonical label rename             | changed                     | unchanged      | unchanged  | label mapping        | medium          | new Axis Contract                 |
| Canonical ID rename                | changed                     | ID mapping     | unchanged  | migration            | high            | new Axis Contract + mapping       |
| Definition clarification           | likely changed              | unchanged      | unchanged  | unchanged            | medium          | new Axis Contract candidate       |
| Definition expansion               | changed                     | unchanged      | reevaluate | unchanged            | high            | new Axis Contract                 |
| Axis add/remove/merge              | changed                     | changed        | reevaluate | changed              | high            | new Axis Contract + migration     |
| Order reorder                      | changed                     | changed        | unchanged  | positional mapping   | high visual     | new Axis Contract + order profile |
| Weight change                      | unchanged                   | unchanged      | changed    | version reference    | high comparison | new Formula version               |
| Normalization change               | unchanged                   | unchanged      | changed    | version reference    | high comparison | new Formula version               |
| Threshold change                   | unchanged                   | unchanged      | changed    | version reference    | medium/high     | new Formula version               |
| schema array→object                | unchanged                   | mapped         | unchanged  | changed              | high migration  | new Schema version                |
| `funnelStrength`→`userFlowQuality` | canonical meaning unchanged | legacy mapping | unchanged  | compatibility mapper | medium/high     | read mapping                      |

Compatibility classesは`COMPATIBLE`、`PRESENTATION_COMPATIBLE`、`SEMANTICALLY_INCOMPATIBLE`、`SCORE_INCOMPARABLE`、`MIGRATION_REQUIRED`、`UNSUPPORTED`、`UNKNOWN`をProposalとする。一つの変更へ複数classを付与可能。

#### Legacy and Positional Migration

- `funnelStrength`: `LEGACY_MIGRATION_SOURCE`。Canonical aliasへ昇格せず、Snapshot schema compatibility mapper/versioned legacy alias registryで`userFlowQuality`へ変換する。
- Japanese label identity: known schema/order profileのexact normalized label-to-ID mappingだけを許可。Unknown/duplicate/ambiguous labelをguessしない。
- Short label: presentation aliasのまま、known source/profile限定translationでCanonical IDへ変換する。Global fuzzy matchingは禁止候補。
- Positional arrays: source schema version + known legacy order profileがある場合だけindex-to-ID mapping。Unknown orderは`UNSUPPORTED / MANUAL_REVIEW`。
- `LEGACY_UI_ORDER_V1`: value → flow → differentiation → information → trust → decisionをmigration-only profile候補とする。Formal Canonical Orderではない。Mock factory等の別orderを同一profileへ混ぜない。

Migration categories候補は`NO_MIGRATION`、`READ_COMPATIBILITY_MAPPING`、`LAZY_MIGRATION`、`EAGER_MIGRATION`、`RECOMPUTE_REQUIRED`、`UNSUPPORTED / MANUAL_REVIEW`。Immutable originalを保つread mappingをdefault候補とする。

#### Radar and Snapshot Compatibility

Historical RadarはR-Aとして生成時orderでfaithful表示する。Cross-Snapshot comparisonはR-CとしてCanonical IDでscoreをalignし、双方へ同一の明示display orderを適用し、normalized comparisonであることを表示する。Current orderへ無表示変換するR-Bは非推奨。

Snapshot policyはSC-A Strict Historicalのsemantic/formula/order lineage preservationと、SC-Bのcurrent stylingを組み合わせた`STRICT_SEMANTICS / CURRENT_PRESENTATION`を推奨する。SC-C Always Current Interpretationは非推奨。

Radar Comparability Proposalは、同一comparison contextで同一Canonical ID set、同一明示display order、compatible Definition、compatible Formulaを要求し、差異がある場合はwarning/unsupportedとする。Statusは`READY_FOR_DECISION / NOT_APPROVED`。

#### Cross-Version Comparison Semantics

- Formula version差: calibration/normalization contractなしでは直接比較不可。
- Definition version差: D-1のみcompatible候補。D-2はwarning、D-3/4/5は直接比較不可候補。
- Axis Set差: explicit mapping下のintersection-onlyまたはunsupported。Missing Axisを0へ変換しない。
- Canonical Order差: IDs、Definition、Formulaがcompatibleならsemantic scoreはID-based比較可能。Radar visualは同一明示orderへnormalizeする。

#### Ownership Boundary and Backend Wire Assessment

Version registryのSource of TruthはRails/business backend + PostgreSQL、またはdeployと同期するversioned application configurationを候補とし、Frontendを唯一のownerにしない。

- PD-02B Product responsibility: 何をversion管理するか、Axis Contract scope、change/compatibility classes、Historical Interpretation Principle、Product migration semantics。
- PD-02C / Backend responsibility: field names、wire format/casing、DB schema、validation、registry persistence、BFF mapping、authorization、API compatibility。
- Analysis/Data + Backend: Formula/Pipeline registryの具体設計。

Canonical semantic IDsはPD-02Bで6/6決定済み。Backend Wire IDはsemantic identityではなくserialization/API/DB representationであり、`PD-02C_HANDOFF_RECOMMENDED / READY_FOR_DECISION`。明示Decisionまではstatusを`BLOCKED`から変更しない。

#### PD-02B Close Criteria and Decision Readiness

PD-02B semantic discoveryのclose criteria候補：

- Immutable Historical Interpretation Principle承認
- Hybrid Axis Contract Versioning Strategy承認
- Actual Order Profile / ordered IDs strategy承認
- Formula Version / Snapshot Schema Version separation承認
- Published Version Immutability / Lifecycle承認
- Current Contract v1 designation承認
- Compatibility Classes / cross-version policy承認
- Product-level migration policy承認
- Backend Wire ownership handoff明示

| Decision                            | Readiness                                     |
| ----------------------------------- | --------------------------------------------- |
| Immutable Historical Interpretation | `READY_FOR_DECISION / NOT_APPROVED`           |
| Axis Contract Hybrid Strategy       | `READY_FOR_DECISION / NOT_APPROVED`           |
| Order Profile Strategy              | `READY_FOR_DECISION / NOT_APPROVED`           |
| Formula Version Separation          | `READY_FOR_DECISION / NOT_APPROVED`           |
| Snapshot Schema Version Separation  | `READY_FOR_DECISION / NOT_APPROVED`           |
| Current Contract v1                 | `READY_FOR_DECISION / NOT_APPROVED`           |
| Published Version Immutability      | `READY_FOR_DECISION / NOT_APPROVED`           |
| Compatibility Classes / Policy      | `READY_FOR_DECISION / NOT_APPROVED`           |
| Backend Wire Ownership Handoff      | `READY_FOR_DECISION / BLOCKED_UNTIL_APPROVAL` |

PD-02B close readinessは`DECISION_READY / NOT_APPROVED`。PD-02B / PD-02は`NEEDS_DISCOVERY`を維持し、PD-02C / PD-02Dは`BLOCKED`を維持する。

#### Product Owner Questions

1. Historical Snapshotの意味をimmutableに保つか。
2. Axis Contractをversion管理するか。
3. Axis Set / Identity / Definition / Canonical Orderを一つのAxis Contractへまとめるか。
4. Canonical Orderとは別にactual order profile/ordered IDsをlineageへ持つか。
5. Formula Versionを独立させるか。
6. Snapshot Schema Versionを独立させるか。
7. Current 6-axis semantic contractをv1として発行するか。
8. Published versionをimmutableとするか。
9. Definition D-2 Clarificationでnew versionを発行するか。
10. Canonical Label-only変更でnew Axis Contract versionを発行するか。
11. Canonical ID renameをbreaking扱いするか。
12. Order reorderをsemantic score breakではなくpresentation compatibility changeとするか。
13. Different Formula Versionsをcalibrationなしで直接比較不可とするか。
14. Historical Radarは生成時order、comparisonはnormalized orderとするか。
15. `LEGACY_UI_ORDER_V1`をmigration-only profileとして保持するか。
16. Immutable original + read compatibility mappingをmigration defaultとするか。
17. Published Version Source of TruthをBackend側へ置くか。
18. Backend Wire ID ownershipをPD-02Cへhandoffするか。

### PD-26 Axis / Order Versioning Decision Review

#### Review Result and Approval Status

PD-25のHybrid Versioning ProposalをSnapshot lineage=`KNOWN_PARTIALLY_ORDER_SENSITIVE / OLC-F MIXED`、compatibility risk=`HIGH`、production canonical persistence=`NOT_IMPLEMENTED`を前提に最終Reviewした。Proposalは`REVIEWED / READY_FOR_DECISION / NOT_APPROVED`。Product Owner本人のApproval Evidenceは`NOT_PROVIDED`、Decision OwnerはProduct Owner、Approval Dateは未記録である。

承認例「PD-02BのAxis / Order Versioning Proposalを承認する。」は将来入力例であり、今回のApproval Evidenceではない。各Decisionは個別承認・却下・差戻し可能で、All-or-Nothingではない。

#### Final Decision Proposal

| Decision                            | Final Proposal                                                                                  | Review status                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------- |
| Immutable Historical Interpretation | Future Definition/Order/Formula/Pipelineで過去結果を暗黙再解釈しない                            | `READY_FOR_DECISION / NOT_APPROVED` |
| Version Architecture                | Hybrid: Axis Contract、Formula、Snapshot Schema、Pipeline、actual Order、Backend Contractを分離 | `READY_FOR_DECISION / NOT_APPROVED` |
| Axis Contract Scope                 | Set、IDs/Labels、Definitions、boundaries、Canonical Order、semantic evidence policies           | `READY_FOR_DECISION / NOT_APPROVED` |
| Canonical Order                     | Axis Contractへ含め、独立primary `canonicalOrderVersion`は持たない                              | `READY_FOR_DECISION / NOT_APPROVED` |
| Actual Order                        | `orderProfile`またはexplicit ordered IDsでlineage化                                             | `READY_FOR_DECISION / NOT_APPROVED` |
| Formula Version                     | Axis Contractから独立。異versionはcompatibility contractなしに直接比較不可                      | `READY_FOR_DECISION / NOT_APPROVED` |
| Snapshot Schema Version             | Persisted structure/identity/metadataを独立管理                                                 | `READY_FOR_DECISION / NOT_APPROVED` |
| Pipeline Boundary                   | Extraction/model/prompt/rulesをAxis semanticsから分離                                           | `READY_FOR_DECISION / NOT_APPROVED` |
| Version Identifier                  | Immutable positive integer                                                                      | `READY_FOR_DECISION / NOT_APPROVED` |
| Published Immutability              | Published content immutable。Meaning changeはnew version                                        | `READY_FOR_DECISION / NOT_APPROVED` |
| Lifecycle                           | `DRAFT → ACTIVE → DEPRECATED → RETIRED`                                                         | `READY_FOR_DECISION / NOT_APPROVED` |
| Current Contract v1                 | Current decided Formal 6 Axis semantic contractのみをAxis Contract 1候補                        | `READY_FOR_DECISION / NOT_APPROVED` |
| Compatibility Classes               | 7 classesをProduct contractとして採用                                                           | `READY_FOR_DECISION / NOT_APPROVED` |
| Migration Policy                    | Known schema/identity/orderだけautomatic mapping。Guess禁止                                     | `READY_FOR_DECISION / NOT_APPROVED` |
| Snapshot Compatibility              | `STRICT_SEMANTICS / CURRENT_PRESENTATION`                                                       | `READY_FOR_DECISION / NOT_APPROVED` |
| Radar Comparability                 | ID align + 同一explicit order。異order polygonを直接比較しない                                  | `READY_FOR_DECISION / NOT_APPROVED` |
| Backend Wire Handoff                | Wire/serialization ownershipをPD-02Cへhandoff                                                   | `READY_FOR_DECISION / NOT_APPROVED` |

#### Historical Interpretation and Presentation Boundary

Historical Semantic Interpretationは生成時のAxis Contract、Formula、Pipeline、actual order lineageを基準にする。Current UIでCSS/layoutを更新して再描画することは可能候補だが、current semanticsへの読み替えを意味しない。Axis meaning changeはhistorical Axis Contract、Formula changeはhistorical Formula version、Radar comparisonはexplicit shared orderを要求する。

#### Axis Contract / Formula / Schema / Pipeline Boundary

`axisContractVersion`にはFormal Set、Canonical IDs/Labels、semanticに関係するShort Label governance、Definitions、Included/Excluded、Cross-Axis Boundaries、Canonical Order、Multi-Axis Evidence、Primary/Supporting concept、Observable Evidence Boundaryを含める。Formula、Weight、Normalization、Threshold、Snapshot/DB/API schema、model/prompt、actual UI override、CSSは含めない。

`formulaVersion`はscore calculation/weight/normalization/aggregation/formula-level threshold、`snapshotSchemaVersion`はpersisted shape/identity/metadata/completeness structure、`analysisPipelineVersion`はextraction/model/provider/prompt family/rules/pipeline behaviorを識別する。Pipeline詳細はAnalysis/Data + Backend/Architecture、field/registry実装はPD-02Cへhandoffする。

#### Version Identifier, Immutability, Lifecycle, and v1

Primary version identifierはpositive integerとし、SemVerをprimaryにしない。Human-facing label/fingerprintは補助metadata候補。一度ACTIVE/publishedとなったcontentはimmutableで、Meaning、Boundary、Identity、Order変更はnew version。Pure typo/format/meaning-preserving wordingだけをaudited erratum候補とする。

Lifecycleは`DRAFT → ACTIVE → DEPRECATED → RETIRED`。Deprecated/Retiredもhistorical reconstruction用metadataを保持する。Current decided Formal 6 Axis Semantic Contractは`PRODUCT_CONTRACT_V1_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`で、Formula v1、Snapshot Schema v1、Pipeline v1、Backend Contract v1を自動確定しない。

#### Compatibility, Change Classification, and Cross-Version Comparison

Compatibility Classesは`COMPATIBLE`、`PRESENTATION_COMPATIBLE`、`SEMANTICALLY_INCOMPATIBLE`、`SCORE_INCOMPARABLE`、`MIGRATION_REQUIRED`、`UNSUPPORTED`、`UNKNOWN`。Canonical ID変更にはchange type `BREAKING_IDENTITY_CHANGE`も付ける。

- Noncanonical typo: compatible erratum candidate。Canonical Label rename: new Axis Contract + legacy mapping candidate。
- Canonical ID change: semantic incompatible + migration required。
- Axis add/remove/merge/split: semantic incompatible + migration required。
- Definition D-1: compatible erratum、D-2: compatibility review/new contract candidate、D-3/4/5: semantic incompatible。
- Canonical Order reorder: new Axis Contract + presentation compatibility change。Positional historyではmigration required。
- Formula change: new formulaVersion + score incomparable default。
- Persisted structure change: new snapshotSchemaVersion。

Formula差はcalibration/compatibilityなしに直接比較不可。Definition D-1のみcompatible候補、D-2はreview/warning、D-3/4/5はunsupported default。Axis Set差はmapping付きintersection-onlyまたはunsupported。Order差のみでIDs/Definition/Formulaがcompatibleならsemantic comparisonは可能だが、Radarは同一explicit orderへnormalizeする。

#### Legacy and Migration Policy

Migration categoriesは`NO_MIGRATION`、`READ_COMPATIBILITY_MAPPING`、`LAZY_MIGRATION`、`EAGER_MIGRATION`、`RECOMPUTE_REQUIRED`、`MANUAL_REVIEW`、`UNSUPPORTED`。Known source schema + known identity + known order profileが確認できる場合だけautomatic mappingを許可し、unknown/ambiguous dataをguessしない。

- `funnelStrength`: Canonical aliasではなく、known legacy schema/versionだけ`userFlowQuality`へread mapping。
- Japanese label: known exact label contractと必要なknown order profile下だけID mapping。Fuzzy matching禁止候補。
- Short label: known legacy sourceに限定し、global identity lookupへ使わない。
- Positional array: known schema + order profile必須。不明ならmanual review/unsupported。
- `LEGACY_UI_ORDER_V1`: value → flow → differentiation → information → trust → decisionのmigration-only profile。Canonical Orderではない。

#### Snapshot and Radar Compatibility

Snapshot policyは`STRICT_SEMANTICS / CURRENT_PRESENTATION`。Standalone historical Radarは生成時actual orderを使用可能。Cross-Snapshot comparisonはCanonical IDでalignし、同一explicit orderへ揃え、異order polygonを無注記で並べない。

Radar Comparabilityはactual order lineageとHIGH compatibility riskへ直接対応するため、PD-26 Approval ScopeとPD-02B Close Criteriaへ含めるReview結論とする。Statusは`READY_FOR_DECISION / NOT_APPROVED`。

#### Source of Truth and Backend Wire Handoff

Version registry/persisted lineageのSource of TruthはRails/business backend + PostgreSQL、またはdeploy同期済みversioned configurationをarchitecture directionとする。Frontend local stateを唯一のownerにしない。

PD-02Bはversion semantics、change classification、historical/compatibility/migration rules、Contract v1 designationを所有する。PD-02C/BackendはDB/API fields、wire representation、validation、persistence、mapper/registry implementationを所有する。

Canonical semantic IDsは6/6 DECIDED済みのため、Backend Wire ID/serializationをPD-02C ownershipへhandoffするProposalは`PD-02C_HANDOFF_RECOMMENDED / READY_FOR_DECISION / NOT_APPROVED`。Product Owner承認まではPD-02B blockerを除去せず、implementation statusも`BLOCKED`を維持する。

#### PD-02B Close Criteria and Readiness

Close CriteriaはHistorical Principle、Hybrid Architecture、Axis Contract Scope、Order Profile、Formula/Schema separation、Pipeline Boundary、Integer ID、Published Immutability/Lifecycle、Current Contract v1、Compatibility Classes、Migration Rules、Snapshot Compatibility、Radar Comparability、Backend Wire Handoffの14 Decision群とする。

PD-02B close readinessは`DECISION_READY / BLOCKED_BY_PRODUCT_OWNER_APPROVAL`。17 Decision対象はすべて`READY_FOR_DECISION / NOT_APPROVED`。Versioning overallは`REVIEWED / READY_FOR_DECISION / NOT_APPROVED`。PD-02B / PD-02=`NEEDS_DISCOVERY`、PD-02C / PD-02D=`BLOCKED`を維持する。

Approval後はPD-27 Explicit Product Owner Approval RecordでDecision scope、Owner、Date、Current Contract v1、Backend Wire handoff、Radar inclusion、PD-02B=`DECIDED / COMPLETE`可否を正式判定する。

### PD-27 Axis / Order Versioning Explicit Product Owner Approval Record

#### Approval Evidence and Decision Result

Product Ownerは2026-08-21に「PD-02BのAxis / Order Versioning Proposalを承認する。」と明示した。これをPhase PD-26の17 Decision対象に対する正式なApproval Evidenceとして記録し、各対象を`DECIDED`とする。

#### Axis Contract v1 and Versioning

Current decided Formal Common 6 Axis semantic contractを`Axis Contract v1 / ACTIVE`とする。ScopeはFormal Axis Set、Canonical IDs/Labels、Definitions、Included/Excluded、Cross-Axis Boundaries、Canonical Order、Multi-Axis Evidence policy、Observable Evidence Boundaryである。Formula、Snapshot Schema、Pipeline、Backend Wire Contract、actual UI order override、CSSは含めない。

Hybrid Version Architecture、positive integer identifier、published immutability、`DRAFT → ACTIVE → DEPRECATED → RETIRED` lifecycle、actual order lineageを`DECIDED`とする。Axis Contract、Formula、Snapshot Schema、Analysis Pipeline、actual order、Backend Contractは独立してversion/lineageを持つ。

#### Historical, Compatibility, Migration, and Radar

Immutable Historical Interpretationと`STRICT_SEMANTICS / CURRENT_PRESENTATION`を`DECIDED`とする。Historical resultは生成時contract/formula/pipeline/order lineageで解釈する。Compatibility 7 classesとMigration 7 categoriesを正式採用し、known schema/identity/orderだけautomatic mappingを許可する。Radar比較はCanonical IDでalignして同一explicit orderへ正規化し、異order polygonを無注記で直接比較しない。

#### Backend Handoff and Close

Backend Wire/serialization、DB/API fields、validation、persistence、mapper/registry implementationはPD-02C / Backendへ正式handoffする。このownership handoffによりPD-02B blockerを除去し、PD-26のClose Criteriaはすべて充足したため、Versioning overall=`DECIDED`、PD-02B=`DECIDED / COMPLETE`とする。

親PD-02はPD-02C / PD-02Dが未決定のため`NEEDS_DISCOVERY`を維持する。PD-02C / PD-02Dとsource implementationは`BLOCKED`のままで、本承認はFormula、Snapshot/DB/API schema、migration/Radar、Rails/BFF/OpenAPIの実装承認ではない。

### PD-28 PD-02C Score Formula / Backend Contract Discovery

#### Formula Evidence and Source of Truth

Formula Source of Truthは`MIXED`。Formula Specification v2.1とDisplay Metrics Mapping v1.0にはrobust benchmark、market profile、Internal/Visual weighted mean、overall 0.55/0.45 confidence-adjusted fusionの具体案があるが、Product Owner承認、runtime接続、Backend persistenceはない。

Frontend production surfaceはSnapshotから`overallScore`、Internal/Structure、Visual、Axis値を入力として受け、0–100 clamp、ring/radar geometry、percentage、fallbackを行う。これらは`PRESENTATION_ONLY`でProduct Formulaではない。Mock factoryとdummy seedはaggregate/Axis値を独立したseed/range/constantで生成し、Legacy previewはscore×0.84/0.76/0.68等を派生するが、いずれもFormula正本ではない。Rails/canonical BFF/OpenAPIにtyped score Formula Contractは実装されていない。

#### Score Hierarchy and Formula Readiness

Repositoryが裏付けるProduct思想はInternal/Visual observation二層、Formal Common 6 Axis、Internal/Visual/Overall outputである。Display Metrics MappingはAxis weighted mean→Internal/Visual、両layerのlate fusion→Overallという候補を持つ。ただしatomic observation/submetric→Canonical Axis scoreの式、eligibility、aggregation unitは`NOT_CONFIRMED`で、runtime aggregate/Axis値の階層整合も検証されない。

Axis Formula=`NEEDS_DISCOVERY`。Overall Formulaは0.55/0.45 confidence-adjusted fusionという具体候補があるため`READY_FOR_DECISION`だが、承認済みFormulaではない。Weight、Normalization、Threshold、Rounding、Missing/Partialを今回決定しない。

#### Formula Version and Historical Comparability

Weight/profile、Normalization、submetric→Axis変換、Axis/layer/overall Aggregation、Formula-level Threshold/eligibility/roundingのsemantic変更はnew formulaVersion候補とする。CSS、ring/radar geometry、percentage formatting、display safety clampのみの変更はFormula lineageへ混ぜない。Formula Version Contract=`READY_FOR_DECISION`。

現在のFrontend Snapshotは`versionLabel`だけを持ち、`formulaVersion`、`axisContractVersion`、`analysisPipelineVersion`、calculation provenanceを持たない。OpenAPI Snapshot `version`もFormula lineageではなくpayloadはuntypedである。現在のHistorical Comparabilityは`UNKNOWN / NOT_VERIFIABLE`で、compatibility/calibrationなしの異Formula scoreを直接比較しないPD-27方針を維持する。

#### Backend Requirements, PD-02D Boundary, and Readiness

Backend ContractはCanonical ID-based explicit mapping、raw/normalized score、Internal/Visual/Overall、`axisContractVersion` / `formulaVersion` / `analysisPipelineVersion`、Snapshot/order lineage、calculation provenance、completeness hookを運べる必要がある。Array indexをsemantic identityにしない。field名/schemaは未決定である。Backend Contract Requirements=`READY_FOR_DECISION`、Backend Wire Implementation=`READY_FOR_BACKEND_DISCOVERY`。

PD-02Cはscore definition/calculation/identity/version/provenanceを扱い、PD-02DはMissing/Partial/completeness/zero distinction/aggregation eligibilityを扱う。PD-02DへCanonical ID別score、raw/normalized/layer distinction、formulaVersion、present/missing Axis IDs、provenance、completeness hookをhandoffする。

PD-02Cのownership blockerは解除し、overallを`BLOCKED`から`NEEDS_DISCOVERY`へ移す。Axis Formula evidence chainが不足するため`READY_FOR_DECISION`またはcloseにはしない。親PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`を維持する。

### PD-29 PD-02C Axis Formula / Submetric Evidence Workshop

#### Evidence Boundary and Repository Support

Axis Contract v1の6 Formal DefinitionsとObservable Evidence Boundaryを基準に、Atomic ObservationとSubmetric候補を整理した。公開Webサイト上のcontent、DOM、link graph、page type、screenshot/presentation contextだけを対象とし、Actual CTR/CVR、sales/revenue、actual comprehension/outcome、unsupported external inferenceを除外する。

Production crawler / Observation Output Contract / typed atomic-submetric registryは`NOT_IMPLEMENTED / UNKNOWN`。Archived Crawlerはheading、CTA、form、FAQ、pricing、compare、trust/case blocks、section、internal links、page type、screenshot、flow summaryを抽出候補として記録するが`LEGACY / DOCUMENTED_CANDIDATE`である。Archived Strategic Engineの6軸×4 submetricsとnull除外weighted meanも`LEGACY`で、Formula正本ではない。

#### Axis Evidence Matrix

| Axis                     | Atomic Observation Candidates                                                                                               | Submetric Candidates                                                                                                         | Evidence Strength                                | Readiness                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------- |
| `valueProposition`       | Hero/primary claim、audience/problem/benefit/offer statements、first-view visibility、problem-solution co-occurrence        | Audience & Problem Clarity、Benefit Articulation、Offer Clarity、Problem-Solution Linkage、Primary Message Visibility        | semantic documentation strong; classifier absent | `READY_FOR_FORMULA_DISCOVERY` |
| `informationHierarchy`   | h1–h3 tree/skips、section order/grouping、chunk size、navigation taxonomy、proximity、first-view priority                   | Heading Structure Quality、Section Sequencing、Content Grouping、Priority Visibility、Information Proximity                  | strongest mechanical candidates                  | `READY_FOR_FORMULA_DISCOVERY` |
| `userFlowQuality`        | CTA/destination/status、internal link graph、navigation reachability、path continuity/dead ends、page stages/coverage       | Action Availability、Destination Validity、Navigation Reachability、Path Continuity、Dead-End Avoidance、Stage Coverage      | strong mechanical candidates                     | `READY_FOR_FORMULA_DISCOVERY` |
| `trustStructure`         | testimonial/case/logo/certification/credential/company/security/guarantee、credibility FAQ、placement/coverage              | Trust Evidence Coverage、Authority/Credential Evidence、Transparency Coverage、Assurance Evidence、Proof Visibility          | strong categories; authenticity excluded         | `READY_FOR_FORMULA_DISCOVERY` |
| `differentiationClarity` | unique/specialized/proprietary claims、positioning、reason-to-choose、distinctive feature、explicit comparison、consistency | Unique Claim Clarity、Specialization Signal、Proprietary Evidence、Relative Positioning、Reason-to-Choose Visibility         | semantic/category labels absent                  | `NEEDS_MORE_EVIDENCE`         |
| `decisionSupport`        | pricing context、plans/options/comparison、scope/spec/condition/process/constraint、FAQ、implementation/onboarding coverage | Commercial Context Coverage、Option Comparison、Scope & Condition Clarity、Process/Onboarding Clarity、Decision FAQ Coverage | contextual necessity evidence absent             | `NEEDS_MORE_EVIDENCE`         |

Atomic Observationは最小観測単位、Submetricは複数Atomic Observationsをsemantic evaluation questionへまとめる候補である。Presence、count、ratio、coverage、continuity、diversity、clarity proxy、structural quality、evidence strength proxyを区別し、候補を正式Submetricへ昇格しない。

#### Formula Spec and Cross-Axis Compatibility

Formula Spec v2.1はAxis weight profiles、Internal/Visual agreement、Axis→layer/overall方向を支えるが、Atomic→Submetric→Axis derivationを定義しないため`PARTIALLY_SUPPORTED`。`funnelStrength`はlegacy identityで、`userFlowQuality`のobservable path semanticsへ限定してmappingする。

Navigationはtaxonomy/grouping=Hierarchy、reachability=Flow。Case/testimonialはproof=Trust、benefit=Value、unique capability=Differentiation、selection material=Decision。Comparison/pricingはrelative uniqueness=Differentiation、material completeness=Decision、page connection=Flow、grouping=Hierarchy。FAQはUI形式でなくcredibility/security=Trust、pricing/condition/process=Decisionとして分類する。

Evidence reuse=`ALLOWED`、Semantic aspect=`MUST_BE_SEPARATED`を維持する。Formula double-count prevention、cap、Primary/Supporting weightは未決定である。

#### Gaps, Backend Requirements, and Status

不足はproduction observation implementation、canonical atomic/submetric identity、scope/denominator/coverage、Internal/Visual attribution、semantic labeled examples/calibration、visual measurement contract、confidence/provenance、dedup rule、PD-02D completenessである。

BackendはCanonical Axis/Submetric identity、atomic evidence type/value、URL/page/DOM/content/screenshot provenance、Internal/Visual layer、scope/denominator/coverage、pipeline/classifier version、Multi-Axis semantic aspect、link graph/path metadata、missingとzeroを分離するhookを保持できる必要がある。具体schemaは決めない。

Axis Formula overall=`NEEDS_MORE_EVIDENCE`、PD-02C=`NEEDS_DISCOVERY`、PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Backend Wire=`READY_FOR_BACKEND_DISCOVERY`を維持する。

### PD-30 PD-02C Differentiation / Decision Support Evidence Calibration Workshop

#### Differentiation Calibration

Generic ValueとRelative / Distinctive Valueを単語辞書で判定せず、contrast referent、specific mechanism/scope/audience、named/proprietary approach、specialization、reason-to-choose linkage、observable supportを組み合わせるRule Candidateを整理した。

| Evidence Strength | Calibration Candidate                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `STRONG`          | explicit contrast + specific differentiator + linked evidence、またはconcrete implicit differentiator + scope/mechanism + linked evidence |
| `MODERATE`        | concrete specialization/capability/reason-to-chooseがあるがcontrast/supportが限定的                                                       |
| `WEAK`            | 「高品質」「安心」「高機能」等のgeneric benefit、unsupported superlative、抽象的な「独自」だけ                                            |
| `AMBIGUOUS`       | specificに見えるがcategory baseline、scope、support、meaningが不明                                                                        |

Explicit comparisonはcomparison structure/statementを直接観測する。Implicit differentiationはspecialization、named/proprietary approach、unique capability、exclusive scope等が具体的に記載される場合の候補とし、市場優位を推測しない。

Atomic Observation候補はcompetitor/alternative reference、comparison structure、named methodology/proprietary claim、specialization/exclusive scope、unique capability、reason-to-choose、claim→evidence link、placement/cross-page occurrence。Submetric候補はDistinctiveness Specificity、Positioning Clarity、Reason-to-Choose Coverage、Comparative Support、Differentiation Evidence Support。`differentiationClarity=READY_FOR_FORMULA_DISCOVERY`。

#### Decision Support Calibration

Required Evidence Setは全サイト共通にせず、sales motion/product type/transaction pathのContext Profile候補で変える。Self-serviceはprice/plan/limits/trial、Enterprise B2Bはscope/quote/implementation/security/procurement、Professional Serviceはdeliverables/process/timeline/estimate、Complex/Regulatedはspec/eligibility/constraints/risk/supportをhigher-relevance candidateとする。固定required listやindustry taxonomyは決めない。

Non-public Pricingは、Case A=public price + context、Case B=non-publicだがquote/contact/scope/conditions/processが明確、Case C=priceも代替Decision Informationも不明、と分ける。Case Bをautomatic low/missingにせず、Case CはContext applicability確認後のgap候補とする。

Atomic Observation候補はpricing/plan/comparison、spec/scope/condition、eligibility、process、FAQ purpose、quote/contact、implementation/onboarding、contract/procurementとpage/link relationship。Submetric候補はCommercial Information Coverage、Option Comparison Support、Scope/Specification/Condition Clarity、Process/Implementation Transparency、Purchase/Inquiry Readiness、Risk/Objection Resolution Coverage。`decisionSupport=READY_FOR_FORMULA_DISCOVERY`。

#### Deterministic / Semantic Boundary and Readiness

Deterministic候補はsection/page/table/FAQ/contact/form/link presence、price/plan tokens、page type、destination/status、named method marker、claim/evidence proximity、coverage/count。Semantic候補はdistinctiveness、meaningful contrast、specific reason-to-choose、support relation、Context Profile、information sufficiency、FAQ purpose、pricing applicabilityである。

Backendは両者を分離し、source URL、DOM/content/screenshot/evidence span、rule/classifier/prompt/model/pipeline version、confidence/rationale、Context Profile、Applicability、capture timestampを再構成できる必要がある。具体schemaは決めない。

Calibration riskはgeneric claim/presence-onlyのfalse positive、implicit specialization/custom quote/distributed informationのfalse negative、Cross-Axis ambiguity、industry/page dependence、LLM dependence、claim veracity boundaryである。

PD-02Dへ`REQUIRED / OPTIONAL / NOT_APPLICABLE / UNKNOWN`候補、Non-public Pricing Case A/B/C、absentとnot applicable、partial coverage、unknown Context Profileをhandoffする。両軸ReadyによりAxis Formula overall=`READY_FOR_FORMULA_DISCOVERY`。PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Backend Wire=`READY_FOR_BACKEND_DISCOVERY`を維持する。

### PD-31 PD-02C Observation Output Contract Discovery

#### Existing State and Contract Gap

Master/MVP正本はInternal/Visual dual layerとObservation Bundle（site info、pages、internal/visual observations、flow summary）を要求するが、field-level canonical contractはない。Archived CrawlerのPageSnapshot/Bundleは`LEGACY / DOCUMENTED_CANDIDATE`。Frontend mockはObservationを介さずfinal Snapshotを直接生成し、Frontend result typeにatomic observation/provenanceはなく、OpenAPI Snapshot payloadはuntyped、Rails/Python WorkerにObservation model/validator/persistenceはない。

Existing Observation Output stateは`DOCUMENTED_CANDIDATE + MOCK / NOT_IMPLEMENTED_CANONICAL_CONTRACT`。

#### Identity and Core Fields

Observation instanceを示す`observationId`と、stable definition registryを示す`observationType`の2段階identityを必要候補とする。Formula mappingには`canonicalAxisId`、versioned `submetricId`、`semanticAspect`、原Evidence共有には`evidenceId`、derived resultには`derivedFromObservationIds`が必要である。

| Field group         | Required candidates                                                                      | Conditional / optional candidates                                                   |
| ------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Identity / mapping  | observationId、observationType、canonicalAxisId、submetricId、semanticAspect、evidenceId | derivedFromObservationIds                                                           |
| Value / measurement | typed value + valueType、measurementMode、layer、scope、sourceType                       | type-specific structured metadata                                                   |
| Provenance          | job/run、source artifact reference、capturedAt                                           | pageUrl/type、DOM selector/node、screenshot/bounding box                            |
| Quality             | completeness                                                                             | coverage/denominator、reason/applicability、semantic confidence/classifier metadata |
| Lineage             | axisContractVersion、analysisPipelineVersion、observationSchemaVersion                   | worker/model/prompt/rule version                                                    |

Pre-formula Observationに`formulaVersion`は`NOT_NEEDED`。Formula/Axis Score artifact側で保持する。Snapshot Schema VersionもObservation Schema Versionと分離する。

#### Value, Layer, Scope, and Provenance

Value type候補はBOOLEAN、COUNT、RATIO、ENUM、TEXT/LABEL、SEMANTIC_CLASSIFICATION、STRUCTURED。RATIOはnumerator/denominator、semantic classificationはconfidence/rationale、structured valueはlink graph/path/bounding-box等のtype-specific schemaを必要候補とする。

InternalはHTML/DOM/link/heading/structured content/metadata、Visualはscreenshot/spatial hierarchy/prominence/groupingを所有する。同一Evidenceを両Layerで観測した場合、同じevidence groupへ紐づく別Observationとして保持しLayerを潰さない。

Scope候補はSITE、PAGE、SECTION、COMPONENT、ELEMENT、LINK_GRAPH、PATH、SCREENSHOT。Provenanceはjob/run、URL/page、DOM/HTML artifact、screenshot/viewport/bounding box、evidence span、pipeline/worker/classifier lineageをObservation typeに応じて保持する。

#### Coverage, Completeness, Confidence, and Dedup

Coverage候補はobserved/eligible/total count、coverage ratio、scanned/expected page count。Expected unknownを0にしない。Completenessは`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`を必須候補とし、`COUNT=0 + PRESENT`と観測不能/対象外を分離する。Score処理はPD-02Dへhandoffする。

Deterministic observationはconfidence不要候補で、coverage/completeness/run statusを使う。Semantic/Hybridはconfidence source、classifier type、rule/prompt/model version、rationaleをconditional required候補とする。

Multi-Axis Evidenceは1つの`evidenceId`からAxis/Submetric/Semantic Aspect別Observationを生成する。同一CTAのDOM/VisualはLayer別Observation、LLM resultはderived Observationとして元IDsを参照する。Evidence fingerprint/dedup keyは候補化するが、正式Dedup AlgorithmとFormula double-count policyは決めない。

#### Worker / Backend Boundary and v1 Candidate

Python Workerはcrawl/capture、deterministic extraction、artifact生成、Internal/Visual/semantic candidateとinstance provenance出力を担う候補。Rails/BackendはOrganization/Job ownership、canonical validation、persistence/immutability、artifact association、registry resolution、dedup/aggregation orchestration、Formula handoffを担う候補とする。Frontend/BFFはraw observationを再計算しない。

Observation Output Contract v1 Candidateはidentity、Axis/Submetric/Semantic mapping、evidence references、typed value、measurement mode/layer/scope/source、provenance、conditional coverage、completeness、semantic confidence、version lineageを最小概念構造とする。

Observation Output Contract=`READY_FOR_DECISION`。Axis Formula overall=`READY_FOR_FORMULA_DISCOVERY`を維持する。PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Backend Wire=`READY_FOR_BACKEND_DISCOVERY`。

### PD-32 PD-02C Observation Output Contract Decision Review

#### Review and Approval Status

PD-31 v1 CandidateをProduct / Technical Contractとしてreviewした。Approval Evidenceは`NOT_PROVIDED`。Final Proposalは`REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`で、Product Owner + Analysis/Data Owner + Backend/API/Architecture Ownerの明示承認前に`DECIDED / ACTIVE`へ変更しない。

#### Decision Dispositions

`DECIDE NOW` Proposal:

- Instance Identity=`observationId`とDefinition Identity=`observationType`を分離し、Axis/Submetric/Evidence identityをinstance IDへencodeしない。
- Canonical Axis、versioned Submetric、Semantic Aspect、Evidenceへのmappingを個別に持つ。
- Typed value、`DETERMINISTIC / SEMANTIC`、`INTERNAL / VISUAL`、explicit Scope、conditional Provenanceを採用する。
- Coverage availabilityを明示し、Completeness 5 states、semantic conditional confidence、Multi-Axis shared evidence、dedup-capable references、3 version lineagesを持つ。
- Python Crawler/Capture、Vision/Semantic Analysis、Rails/Backend、Frontend/BFFのlogical responsibilityを分離する。

`KEEP AS CANDIDATE`: evidence group/fingerprint、coverage availability exact enum、worker/classifier component versions、Submetric/Observation registry implementation。

`DEFER`: Exact JSON property names/schema、ID format、DB/OpenAPI、Formula/Weight/Threshold、Missing/Partial処理、confidence scale、Dedup Algorithm、queue/deployment/retention。

`REJECT` from v1: embedded/composite identity、array positional identity、standalone LABEL type、arbitrary untyped STRUCTURED value、`HYBRID` measurement、pre-formula `formulaVersion`、Observation versionとしての`snapshotSchemaVersion`、Python crawler本体へのAI understanding混在、Frontend raw Observation再計算。

#### Core Contract Proposal

Core `REQUIRED` groupsはinstance/type identity、Axis/Submetric/Semantic mapping、evidence reference、typed value、measurement mode、layer、scope/source、provenance core、completeness、coverage availability、capturedAt、Axis/Pipeline/Observation Schema lineage。

`CONDITIONAL`はderived-from、crawl run、page URL/ID/type、DOM/HTML/screenshot/bounding-box/evidence-span refs、coverage metrics、semantic confidence/classifier metadata。`OPTIONAL`はevidence group/fingerprintとnonessential debug/display metadata。

Value TypesはBOOLEAN、COUNT、NUMBER、RATIO、ENUM、TEXT、SEMANTIC_CLASSIFICATION、STRUCTUREDの8 types。LABELはENUM/TEXTへ統合し、STRUCTUREDはbounded type-specific objectに限定する。

Measurement Modeは`DETERMINISTIC / SEMANTIC`。Hybrid resultはdeterministic Observationとderived semantic Observationへ分解する。Layerは`INTERNAL / VISUAL`の別Observationで、Layer aggregationはFormula責務。

ScopeはSITE、PAGE、SECTION、COMPONENT、ELEMENT、LINK_GRAPH、PATH、SCREENSHOT。Coverage availabilityはalways explicit、metricsはconditionalで、unknown denominatorを0にしない。

Completenessは`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`。Deterministic confidenceは原則不要、Semanticはconfidence/source/classifier/applicable version/rationaleをconditional requiredとする。

1 Evidence→multiple Observationsを採用し、各ObservationはAxis/Submetric/Semantic Aspectを分離する。Evidence IDとderived referenceを持つがDedup Algorithm/Formula double-countは決めない。

Version lineageはAxis Contract、Analysis Pipeline、Observation Schemaをrequired Proposalとする。Formula VersionはScore artifact側、Snapshot Schema VersionはSnapshot materialization側へ分離する。

#### Responsibility and Readiness

Python Crawler/Capture Workerはmechanical crawl/capture/extraction/provenance、Vision/Semantic Analysis Worker候補はderived classification、Rails/Backendはownership/validation/registry/persistence/orchestration/Formula handoff、Frontend/BFFはvalidated result consumptionを担当するProposalとする。

Observation Output Contract=`READY_FOR_APPROVAL / NOT_APPROVED`、Axis Formula overall=`READY_FOR_FORMULA_DISCOVERY`、PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`を維持する。

### PD-33 PD-02C Observation Output Contract Explicit Product Owner Approval

#### Approval Evidence and Status

Product Ownerから「PD-02CのObservation Output Contract v1 Proposalを承認する。」との明示承認を2026-08-24に受領した。Decision OwnerはProduct Ownerである。Observation Output Contractは`DECIDED / APPROVED`、version/statusは`v1 / APPROVED CONTRACT`へ遷移した。Implementationは`NOT_IMPLEMENTED`である。

#### Approved Contract Summary

- Identity: `observationId` instance identityと`observationType` stable definition identityを分離し、Axis/Submetric/Evidenceをinstance IDへ埋め込まない。
- Core: identity、Axis/Submetric mapping、Evidence ID、typed value、measurement mode、layer、scope/source、provenance、completeness、coverage availability、capturedAt、version lineage。type-specific fieldsはconditional。
- Values: BOOLEAN、COUNT、NUMBER、RATIO、ENUM、TEXT、SEMANTIC_CLASSIFICATION、bounded STRUCTURED。standalone LABEL/untyped JSONは不採用。
- Measurement / Layer: `DETERMINISTIC / SEMANTIC`、`INTERNAL / VISUAL`。HYBRIDは分割し、Layer aggregationはFormula責務。
- Provenance / Scope: Job/source artifact/capturedAt/pipelineをcoreとし、run/page/DOM/HTML/screenshot/viewport/bounding-box/evidence span/component lineageをconditionalとする。ScopeはSITE、PAGE、SECTION、COMPONENT、ELEMENT、LINK_GRAPH、PATH、SCREENSHOT。
- Coverage / Completeness: availabilityを明示しunknown denominator≠0。`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`を区別する。
- Multi-Axis / Versioning: Evidence reuseを許可しsemantic aspectを分離する。Axis Contract、Analysis Pipeline、Observation Schema lineageを保持し、Formula VersionとSnapshot Schema Versionを分離する。
- Responsibility: Mechanical Crawler/Capture、Vision/Semantic、Python Worker、Rails、Frontend/BFFのlogical boundaryを採用する。実装/topologyは別Decisionである。

#### Remaining Boundary

Axis Formula overall=`READY_FOR_FORMULA_DISCOVERY`、PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`を維持する。残るPD-02C項目はExact Axis Formula、Atomic→Submetric→Axis aggregation、Internal/Visual contribution、Formula Version、Backend Wire/DB/OpenAPI Contract、Formula provenanceである。

Weight、normalization、threshold、rounding、layer ratio、missing/partial scoring、confidence calibration、dedup algorithm、exact JSON、DB schema、OpenAPI、Worker/Rails implementationは未決定・未実装である。

### PD-34 PD-02C Axis Formula Candidate Discovery

#### Formula Hierarchy and Normalization Boundary

承認済みObservation Output Contract v1を入力に、Formula hierarchyを`Atomic Observation → normalized Submetric → layer-specific Axis → Internal / Visual Layer Score → Overall late fusion`として整理した。Normalizationは主にSubmetric boundaryでmeasurement type別に行い、Axis aggregation後の一律補正は避ける候補とする。0–100 Display Contractを維持するが、Presentation Safety clampをBusiness Formulaへ混ぜない。

Atomic→Submetricはbinary ratio、denominator付きcount/ratio/coverage、linear/capped/logistic/robust normalization、versioned semantic class mappingの候補を持つ。Submetric→AxisはEqual Mean、Weighted Mean、Coverage-adjusted Mean、Eligibility-aware Mean、Deterministic/Semantic Hybridを比較し、Eligibility-aware baseline + explicit versioned profileを第一候補とした。

#### Layer, Quality, and Integration Findings

Internal/VisualはLayer別Axis/Layer Scoreを保持し、最後に統合するOption AがObservation Contractと最も整合する。0.55/0.45は`DOCUMENTED_CANDIDATE / NOT_APPROVED`を維持する。Canonical OrderはWeightを意味しない。

Confidenceは初期Formulaへ直接混ぜずSeparate Quality Indicatorを第一候補とし、CoverageもSubmetricがcoverage自体を測る場合を除きeligibility/quality metadataを優先する。Semanticはdeterministic Observationを参照するderived Observationとして分離し、最終Submetricまでlineageを保持する。

#### Architecture Candidates and Readiness

- Candidate A: Layer-first Equal / Eligibility-aware Baseline。安全なinitial default/fallback。
- Candidate B: Axis-first Unified Fusion。Layer lineageを失いやすく非推奨。
- Candidate C: Layer-first Common Core + Axis-specific versioned profiles。Candidate Aをdefault profileとして内包し、`RECOMMENDED FOR DECISION REVIEW`。

Formula provenance minimumはformulaVersion、axisContractVersion、observationSchemaVersion、analysisPipelineVersion、input Observation/Submetric IDs、normalization/aggregation/fusion profile、eligibility/completeness/coverage references、output identity、job/snapshot association、calculatedAtである。

Axis Formula Candidate=`READY_FOR_DECISION_REVIEW`。Exact Weight/Threshold/Parameter/ratio、Missing/Partial処理、confidence calibration、dedup、exact Backend schemaは未決定である。PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`を維持する。

### PD-35 PD-02C Axis Formula Architecture Decision Review

#### Review Disposition

Candidate C `Layer-first Common Core + Axis-specific Versioned Profiles`をFinal Proposalとした。Product OwnerのApproval Evidenceは`NOT_PROVIDED`で、statusは`REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`。Candidate AはC内のdefault/fallback/initial calibration profileとして`KEEP AS PROFILE CANDIDATE`、Candidate B Axis-first Unified FusionはLayer lineage、explainability、auditability、Observation Contract整合の弱さからv1 Architectureとして`REJECT`する。

#### Architecture Final Proposal

- Common Core: eligibility hook、typed value handling、Submetric normalization boundary、aggregation framework、Layer preservation、provenance、version、explainability requirements。
- Axis Profiles: Submetric set、normalization/aggregation method、weight configuration、applicability referencesをversioned profileとしてCore/Axis Definitionから分離。
- Atomic→Submetric: type/profile-defined normalizationで共通0–100 Submetricへ変換。Exact method/parameterは未決定。
- Submetric→Axis: eligibility-aware framework。Equal/eligible meanはdefault/fallback profile候補、weighted profileは将来calibration候補。
- Layer: Internal/VisualをObservation→Submetric→Axisまで分離し、Layer Score後にOverallへlate fusion。
- Confidence: v1はSeparate Quality Indicator。Gate/modifierはdefer。
- Coverage: score対象coverageとcrawl/observation quality coverageを分離。
- Semantic: derived semantic Observationを許可し、HYBRID Observation/LLM-only Axis Scoreを拒否。
- Multi-Axis: Evidence reuse + semantic aspect separation + lineageを維持し、dedup/cap/double-countはdefer。

ExplainabilityはObservation/Evidence、Submetric、Axis、Layer、Overall contribution、Formula/Profile/Axis/Pipeline/Observation versions、Missing/Partial/coverage reason、historical reconstructionを追跡可能にすることを要求する。

Formula VersionはWeight、Normalization、Aggregation、Eligibility、Confidence handling、score threshold、business rounding、Layer fusion、Axis profile behaviorのsemantic changeを対象とする。CSS、display-only format、presentation clamp、label layoutは対象外である。

#### Readiness and Remaining Boundary

Axis Formula Architecture=`READY_FOR_APPROVAL / NOT_APPROVED`。Exact Weight/ratio/parameter/threshold/rounding、Missing/Partial処理、confidence calibration、dedup/double-count、DB/JSON/OpenAPI、Rails/Worker実装は未決定・未実装。PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`を維持する。

### PD-36 PD-02C Axis Formula Architecture Explicit Product Owner Approval

#### Approval Evidence and Status

Product Ownerから2026-08-24に「PD-02CのAxis Formula Architecture Proposal（Candidate C）を承認する。」との明示承認を受領した。Decision OwnerはProduct Ownerである。Axis Formula Architectureは`DECIDED / APPROVED`、Candidate Cは`APPROVED ARCHITECTURE`へ遷移した。Implementation=`NOT_IMPLEMENTED`、Exact Formula Parameters=`NOT_DECIDED`である。

#### Approved Architecture Contract

- Candidate C: Layer-first Common Core + Axis-specific Versioned Profiles。
- Hierarchy: Atomic Observation → Normalized Submetric → Layer-specific Axis Score → Internal/Visual Layer Score → Overall late fusion。
- Common Core: eligibility hook、typed handling、normalization/aggregation framework、Layer preservation、provenance/version/explainability。
- Axis Profiles: Submetric set、normalization/aggregation method、weight、applicability refs。Axis Definitionとは別Contract。
- Atomic→Submetric: profile-defined normalizationで共通Scaleへ変換。Exact method/parameterは未決定。
- Submetric→Axis: eligibility-aware framework。Candidate Aをdefault/fallback/initial calibration profile候補として保持。
- Layer/Overall: Internal/VisualをAxisまで別系統で保持し、Layer Score後にlate fusion。Exact ratioは未決定、0.55/0.45は`UNAPPROVED CANDIDATE`。
- Confidence: v1はSeparate Quality Indicator。Gate/modifier/calibrationはdefer。
- Coverage: Product/Content CoverageとObservation/Crawl Coverageを分離。
- Semantic: Derived Semantic Observationを許可し、HYBRID Observation/LLM-only Axis Scoreを不採用。
- Multi-Axis: Evidence reuse + semantic aspect separation + lineageを維持。dedup/cap/double-countはdefer。
- Explainability/Provenance: Score→Evidence trace、Layer contribution、versions、completeness/coverage/Missing reason、historical reconstructionを要求。

Formula VersionはWeight、Normalization、Aggregation、Eligibility、Confidence handling、score threshold、business rounding、Layer fusion、Axis/Profile behaviorのsemantic changeを対象とする。CSS、display-only format、layout、presentation clampは対象外である。

Candidate A=`KEEP AS PROFILE CANDIDATE`、Candidate B=`REJECTED FOR V1`を確定した。PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`を維持する。残件はFormula parameter/profile policy、Exact normalization、Internal/Visual fusion profile、Formula Version concrete contract、Backend Wire/DB/OpenAPI、Formula provenance wire representationである。

### PD-37 PD-02C Formula Profile / Parameter Policy Discovery

#### Parameter Taxonomy and Authority

Formula ParameterをStructural、Numeric、Presentation、Calibrationへ分類した。Architecture/method familyはProduct + Analysis/Data Formula Contract、Weight/ratio/normalization parameterはCalibration Dataset + Statistical Evaluation + domain review、EligibilityはPD-02D、technical precisionはBackend constraint、display-only ruleはPresentation Contractをauthority候補とする。Product Owner単独の好みをnumeric valueの根拠にしない。

#### Baseline, Calibration, and Normalization

Candidate A Equal/Eligibility-awareは`UNCALIBRATED CALIBRATION BASELINE`候補であり、最適値またはequal importanceのProduct claimではない。Submetric WeightはEqual baseline→Calibration-derived laterを推奨し、non-equal Weightにはrubric、multi-reviewer、held-out stability、sensitivity evidenceを要求する。

NormalizationはBOOLEAN、COUNT、NUMBER、RATIO、ENUM、TEXT、SEMANTIC_CLASSIFICATION、STRUCTUREDごとにmethodを選ぶ。Static bounds、profile-specific method/direction、calibration-derived cap/slope/midpoint/percentile、dataset-specific reference distributionを分離し、一律normalizationとlive datasetによる暗黙parameter変更を禁止する候補とした。

Calibration Datasetはindustry/site/business/company size、B2B/B2C、self-service/enterprise、page volume/content density、Layer/crawl availabilityを層別化し、representativeness、provenance、leakage control、held-out split、rubric/versionを必要とする。Ground Truthはobservable-site rubric + multi-reviewer + blind pairwiseを主軸とし、CTR/CVR/revenueはsecondary validationに限定する。

#### Fusion, Quality, Eligibility, and Versioning

Internal/Visual Fusionはv1でnon-dynamic fixed policyを対象とし、ratioはcalibration/approval待ち。0.55/0.45は`UNAPPROVED CANDIDATE`。Dynamic fusionはdeferする。ConfidenceはSeparate Quality Indicator、Crawl Coverageはquality/completeness metadataを維持し、Score modifierにしない。

Profileは5 Completeness statesを参照するeligibility rule referenceを持つが、state別score treatmentはPD-02Dで決める。Published Formula/Profileはimmutableとし、Formula Versionが適用Profile revisionsを一意に解決する。Profile versionを第二の比較正本にせず、semantic parameter変更はnew Profile revision + new Formula Versionでpublishする候補とした。

#### Fallback, Context, Registry, and Readiness

Equal/Eligibility-awareはtemporary calibration baseline、contractで範囲が確定したsimple normalizationだけbaseline候補、unapproved ratio/semantic/context weightはproductionで`UNSUPPORTED`とする。v1はGlobal baselineを優先し、Industry/Context profileはsegmented datasetが揃うまでdefer。Registryはidentity/version/lifecycle、Axis/Submetric、normalization/aggregation/weights/applicability/fusion、calibration/approval/effective metadataを保持するlogical candidateとする。

Formula Profile / Parameter Policy=`DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`。Exact Formula Parameters=`NOT_DECIDED`、PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Implementation=`NOT_IMPLEMENTED`を維持する。

### PD-38 PD-02C Formula Profile / Parameter Policy Decision Review

#### Review Status and Final Proposal

PD-37 Candidateをreviewし、Formula Profile / Parameter Policyを`REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`とした。Approval Evidenceは`NOT_PROVIDED`であり、Product Owner承認なしに`DECIDED`へ変更しない。

Final Proposal:

1. Equal/Eligibility-awareは`UNCALIBRATED CALIBRATION BASELINE`。
2. Non-equal Weightはrepresentative calibrationとversioned approval後だけproduction candidate。
3. NormalizationはValue Type/Submetric別。One-size normalizationを拒否。
4. v1 Layer fusionはnon-dynamic fixed policy。Exact ratioは未決定、0.55/0.45は`UNAPPROVED CANDIDATE`。
5. ConfidenceはSeparate Quality Indicator、Crawl Coverageはquality metadata。
6. Published Formula/Profileはimmutable、formulaVersionはCanonical Formula Identity。
7. 未承認/未Calibration/unknown parameterのsilent fallbackを禁止。
8. v1はGlobal baseline、Industry/Context Profileはdefer。
9. Eligibility treatmentはPD-02Dへ委譲。
10. Exact parameterにはdataset/evaluation/rationale/approval/effective lineageを要求。

#### Policy Boundaries

ParameterはStructural/Numeric/Presentation/Calibrationに分類する。Architecture/methodはProduct + Analysis/Data、Numeric valueはDataset + Statistical Evaluation + Domain Review、EligibilityはPD-02D、displayはPresentation Ruleをauthority候補とし、Product Ownerの主観だけでWeight/ratioを決めない。

Ground TruthはObservable-site rubric + multi-reviewer + blind pairwiseをPrimary、expert adjudicationをSupporting、external outcomeをSecondary Validationとする。ThresholdはProduct/Eligibility/Confidence/UI、RoundingはStorage/Business/Presentationへ分離する。

Formula Versionがimmutable Profile revisionsを一意に解決し、Profile versionを第二の比較正本にしない。Published mutation、Canonical Order由来Weight、Expert-only primary default、external outcome-only ground truth、silent substitutionをReject Proposalとした。

Candidate A equal baseline、Exact fixed ratio、normalization assignment、non-equal weight、limited Context Hybridは`KEEP AS CALIBRATION CANDIDATE`。Dynamic fusion、confidence gate/modifier、Industry-specific Profile、Exact parameters/schema/implementationは`DEFER`。

Formula Profile / Parameter Policy=`READY_FOR_APPROVAL / NOT_APPROVED`、Exact Formula Parameters=`NOT_DECIDED`。PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Implementation=`NOT_IMPLEMENTED`を維持する。

### PD-39 PD-02C Formula Profile / Parameter Policy Explicit Product Owner Approval

#### Approval Evidence and Final Status

Product Ownerから2026-08-24に「PD-02CのFormula Profile / Parameter Policy Proposalを承認する。」との明示承認を受領した。Decision OwnerはProduct Ownerである。Formula Profile / Parameter Policyは`DECIDED / APPROVED`へ遷移した。Exact Formula Parameters=`NOT_DECIDED`、Implementation=`NOT_IMPLEMENTED`を維持する。

#### Approved v1 Policy

- Core: Calibration-first、Typed Normalization、Non-dynamic Fusion、Confidence/Observation Quality Separation、Immutable Versions、Silent Fallback Prohibition、Global Baseline。
- Taxonomy: Structural、Numeric、Presentation、Calibration。
- Authority: Method=Product + Analysis/Data、Numeric=Dataset + Statistics + Domain Review、Eligibility=PD-02D、Display=Presentation Rule。主観のみのProduction Numeric決定は禁止。
- Baseline: Equal/Eligibility-aware=`UNCALIBRATED CALIBRATION BASELINE`。最適値/Calibration済み値ではない。
- Weight: Equal baseline→representative calibration→必要な場合だけnon-equal。Canonical Order≠Weight≠Importance≠Priority。
- Fusion: v1はnon-dynamic fixed direction。Exact ratio未決定、0.55/0.45=`UNAPPROVED CANDIDATE`、dynamic=defer。
- Normalization: Value Type/Submetric別。One-size不採用。Dataset更新だけでpublished parameterを暗黙変更しない。
- Calibration: representative Dataset + provenance/leakage control/held-out。Ground Truthはobservable rubric + multi-reviewer + blind pairwise、external outcomeはsecondary。
- Threshold/Rounding: Product/Eligibility/Confidence/UIとStorage/Business/Presentationを分離。
- Confidence/Coverage: ConfidenceはSeparate、Crawl Coverageはquality metadata。`crawl不足 ≠ product quality低下`。
- Eligibility: Profileは5 statesを参照し、Score TreatmentはPD-02Dへ委譲。
- Version/Immutability: formulaVersionをCanonical Formula Identityとし、immutable Profile revisionを一意解決。Published mutation禁止。
- Fallback: 未承認/未Calibration/Unknown parameterのsilent substitution禁止。
- Context: v1 Global baseline。Industry-specific=`DEFER`、limited Context Hybrid=future candidate。
- Registry/Explainability: logical registryとsource/rationale/dataset/evaluation/approval/effective/change/compatibility/limitations metadataを保持可能にする。

Exact Weight、ratio、normalization parameter、threshold、rounding value、Missing/Partial、Dataset構築、confidence calibration、dynamic fusion、dedup/double-count、schema/OpenAPI、Rails/Worker実装は承認対象外である。

PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`を維持する。残件はExact Parameter Calibration、Internal/Visual Exact Fusion、Formula Version concrete representation、Backend Wire/DB/OpenAPI、Formula provenance wire、PD-02D Eligibility Treatmentである。

### PD-40 PD-02C Formula Version / Backend Wire Contract Discovery

#### Current Implementation Boundary

現行OpenAPIはAnalysisJobとuntyped `AnalysisSnapshot.payload`を持つがformula/score lineageはなく、Snapshot `version`はformulaVersionではない。RailsはUser/Organization/Membership基盤のみでProject/AnalysisJob/Snapshot/Formula/Score persistenceは`NOT_IMPLEMENTED`。よって本Phaseはlogical contractのみを対象とした。

#### Formula Identity and Registry

Published `formulaVersion`をCanonical Formula Identityとし、immutable positive integerを第一候補とする。Lifecycleは`DRAFT → ACTIVE → DEPRECATED → RETIRED`候補。formulaVersionからArchitecture、axisContractVersion、immutable Axis/Profile revisions、Submetrics、Normalization/Aggregation/Weight/Layer Fusion/Eligibility refs、Calibration lineage、compatibility/approval/effective metadataを一意解決する。

Formula RegistryはRails canonical ownership候補。Profile revisionはsubordinate identityでformulaVersionが固定し、Historical Comparisonの第二Source of Truthにしない。Uncalibrated/未承認manifestをACTIVE production Formulaとしてsilent resolveしない。

#### Score and Wire Hierarchy

HierarchyはRaw Observation → normalized Submetric Score → Internal/Visual Axis Score → Internal/Visual Layer Score → Overall Score → Presentation Value。Raw/normalized/derived/presentationを分離し、Unified Axis Scoreを途中生成しない。

Root `scoreResultId`と各Submetric/Axis/Layer/Overall resultのlogical identityを候補化した。Exact UUID/composite representationは未決定だが、array indexはidentityにしない。各resultはformulaVersion、canonical IDs/Layer、input result/Observation refs、Profile/Normalization/Aggregation/Fusion refs、completeness/eligibility/coverage context、calculatedAtを必要に応じて保持する。

Formula provenanceはformulaVersion、axisContractVersion、observationSchemaVersion、analysisPipelineVersion、resolved refs、Observation/Submetric inputs、AnalysisJob、conditional Snapshot、result identities、quality/completeness、calculatedAtを最小候補とする。

#### Job, Snapshot, Compatibility, and Ownership

Score ResultはOrganization-scoped AnalysisJobへ必ず属し、Snapshot commit前にも存在可能。Snapshotはgeneration-time Formula/Axis/Observation/Pipeline、actual Axis/order、completeness、Score Result lineageを保持し、Current Formulaでsilent再解釈しない。

Formula Version差は自動compatibleにせず、明示compatibility/calibrationがなければ`SCORE_INCOMPARABLE / UNKNOWN`をdefault候補とする。0–100 scale一致だけでは比較可能性を証明しない。

Calculation ownershipはOption C「Worker calculation engine + Rails canonical orchestration/validation/registry/persistence」を推奨する。BFFはauth/org-scoped proxy、Frontendはvalidated consumption/presentation/explanationを担当し、Formula Business Logicを持たない。

#### Readiness and Closure Assessment

Formula Version Contract=`DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`、Backend Wire Logical Contract=`DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`。PD-02C closureはOption Bを推奨し、Architecture/Policy/Version/Wire logical contract承認までをDecision-complete条件、Exact Calibration/Schema/Implementationを後続handoffとする。ただし現時点では未承認のためPD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`を維持する。

### PD-41 PD-02C Formula Version / Backend Wire Contract Decision Review

#### Final Proposal

Published immutable positive integer `formulaVersion`を唯一のCanonical Formula Identityとし、Architecture、Axis Contract、immutable Profile revisions、Submetrics、Normalization/Aggregation/Weight/Fusion/Eligibility、Calibration、compatibility/approval metadataを一意解決するimmutable Manifestとする。Rails-owned `FormulaDefinition` Registryを正本とし、Profile revisionはsubordinate resolution identityであって第二のHistorical Comparison Source of Truthにはしない。

Backend logical hierarchyはRaw Observation → Normalized Submetric → Internal/Visual Axis → Internal/Visual Layer → Overall → Presentationとする。Root `scoreResultId`とchild logical identitiesを要求し、array index identity、Presentation値のCanonical保存、Current FormulaによるHistorical resultのsilent reinterpretを不採用とする。

Formula provenance、Organization-scoped AnalysisJob anchor、generation-time Snapshot lineage、explicit compatibility taxonomy、5 completeness states、Separate Quality Indicatorを正式Proposal化した。Formula Version差は明示compatibilityなしに比較可能と推測しない。

Calculation ownershipはOption C「Worker calculation engine + Rails canonical orchestration/registry/validation/persistence」をFinal Proposalとする。BFFはauth/sessionとOrganization-scoped transport、Frontendはvalidated result consumption/explanation/presentationを担当し、Formula Business Logicを持たない。

#### Decision Boundary and Readiness

- Formula Version Contract: `READY_FOR_APPROVAL / NOT_APPROVED`
- Backend Wire Logical Contract: `READY_FOR_APPROVAL / NOT_APPROVED`
- Formula Calculation Ownership Option C: `READY_FOR_APPROVAL / NOT_APPROVED`
- PD-02C Closure Option B: `READY_FOR_APPROVAL / NOT_APPROVED`

Exact Weight/Ratio/Normalization/Threshold、Calibration Dataset、Missing/Partial Treatment、physical ID、Exact JSON/DB/OpenAPI、実装はdeferする。Physical schema、field nesting/casing、endpoint、table分割、runtime topologyはimplementation detailである。

Closure Option Bでは上記4 Proposal承認後にPD-02Cを`DECISION_COMPLETE`とし、Exact Calibration/Schema/ImplementationとPD-02D Treatmentを後続へhandoffする。Product Owner承認は未提供のため、現時点ではPD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Exact Parameters=`NOT_DECIDED`、Implementation=`NOT_IMPLEMENTED`を維持する。

### PD-42 PD-02C Formula Version / Backend Wire Contract Explicit Product Owner Approval

Product Ownerから2026-08-24に「PD-02CのFormula Version / Backend Wire Contract Proposal、Formula Calculation Ownership Option C、およびPD-02C Closure Option Bを承認する。」との明示承認を受領した。

#### Approved Contracts

- Formula Version Contract=`DECIDED / APPROVED`。Published immutable positive integer formulaVersionをCanonical Formula Identityとし、immutable ManifestからArchitecture、Axis Contract、Profile revisions、Submetrics、Normalization/Aggregation/Weight/Fusion/Eligibility、Calibration、Compatibility/Approval metadataを一意解決する。
- Backend Wire Logical Contract=`DECIDED / APPROVED`。Logical root `AnalysisScoreResult`にidentity、Organization/AnalysisJob、optional Snapshot、Formula lineage、Submetric/Axis/Layer/Overall、completeness、quality、provenance、calculatedAtを保持可能にする。
- Formula Calculation Ownership Option C=`DECIDED / APPROVED`。Worker calculation engineとRails canonical orchestration/registry/validation/persistenceを分離する。
- PD-02C Closure Option B=`DECIDED / APPROVED`。Logical/Architecture/Policy contract承認までを設計棚卸しClosureとし、Calibration、physical schema、実装を後続handoffとする。

Score hierarchy、root/child logical identity、Formula provenance、Organization-scoped AnalysisJob anchor、generation-time Snapshot lineage、Historical reconstruction、explicit compatibility、5 completeness states、Separate Quality Indicator、Rails/Worker/BFF/Frontend責務境界を正式Contractとした。

#### Status and Remaining Boundary

PD-02C=`DECISION_COMPLETE`。Implementation=`NOT_IMPLEMENTED`、Exact Formula Parameters=`NOT_DECIDED`、Calibration=`NOT_PERFORMED`であり、Decision CompleteはProduction Implementation Completeを意味しない。PD-02 parentはPD-02D未完了のため`NEEDS_DISCOVERY`を維持する。

PD-02DはPD-02C待ちを解消したが、PD-04の`partially_completed` Snapshot commit/history/promotion/retry/usageとRails canonical Job/Snapshot workflowが未解決のため`BLOCKED / PD-04_BACKEND_WORKFLOW_DEPENDENCY`を維持する。新規PD-02D Discoveryは開始しない。

### PD-43 PD-02D / PD-04 Dependency and Discovery Readiness Review

Canonical AnalysisJobの14 statesとterminal 5 states、PD-42のcompleteness/status/reason/coverage carrier、Score Result identity/provenanceはPD-02D開始に必要なsemantic inputとして充足している。

Observation-level PARTIAL、Axis-level PARTIAL、AnalysisJob `partially_completed`、partial Snapshot stateは別概念である。Product absence、Observation failure、scope unknown、not applicable、partialも原因別に扱い、technical failureをabsenceや0 scoreへsilent collapseしない。Exact reason taxonomyとScore TreatmentはPD-02D自身のDiscovery対象である。

Snapshot commit/current promotion、Strategy Source promotion、reanalysis/history/usage/billingはPD-04固有のProduct workflowである。PD-02Dに必要なのはScore ResultがSnapshot前にも存在し、materialize時にcompleteness/reason/formula lineageを失わないlogical boundaryまでで、Exact persistenceやpromotion Decisionは不要である。

旧`PD-02D → PD-04全体`依存を解除した。Formula eligibilityはPD-02D、Snapshot/Strategy promotion eligibilityはPD-04と分離する。PD-02DはPD-04を待たず開始でき、PD-04はPD-02Dを将来consumerとして参照できるためcircular dependencyはない。

Status:

- PD-02D=`READY_FOR_DISCOVERY`
- PD-04=`READY_FOR_DISCOVERY / NON_BLOCKING_TO_PD-02D`
- PD-02 parent=`NEEDS_DISCOVERY`
- Recommended Option=`OPTION A — START PD-02D DISCOVERY`

PD-04A〜D（Job outcome、Snapshot lifecycle、Strategy promotion、reanalysis/history/usage）はDiscovery workstream候補として整理したが、現時点では正式sub-decisionへ分割しない。

### PD-44 PD-02D Missing / Partial Score Contract Discovery

承認済みCompleteness `PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`の意味を変更せず、Observation→Submetric→Axis→Layer→Overallの伝播とScore Treatment候補を整理した。

#### Candidate Boundaries

- `value=0`は正常取得/計算された有効値。Missing、Unknown、N/A、Technical Failureの代替にしない。
- Completeness、Calculation Eligibility、Score State、reason、coverage、qualityを分離する。
- Eligibility candidateは`ELIGIBLE / INELIGIBLE / CONDITIONALLY_ELIGIBLE / UNDETERMINED`。
- Score State candidateは`CALCULATED / NON_CALCULATED`。Non-calculatedへ0、neutral、last-known値を代入しない。
- Product absenceはMISSING候補、Technical/Semantic failureはUNKNOWNまたはPARTIAL + reason候補。Scopeが十分でない状態からProduct absenceを推測しない。
- N/Aは0/neutralでなくeligible denominator除外を推奨候補とする。
- PARTIALはenumを増殖させず`PARTIAL + reason + coverage`で表現し、direct penaltyを課さない。

#### Hierarchy and Denominator

SubmetricはModel B Eligibility-aware partial calculationをframework候補とし、Type-specific Profile ruleを組み合わせる。Axis/Layerはrequired conditionを満たしたeligible calculated inputsを集約し、eligible/required/calculated countsとcoverageを別保持する。

Overallは両Layerがeligible/calculatedならapproved Fusion Profileでlate fusionする。One-layer Overall、available Layerへのweight再配分、fallbackは明示Profile/new formulaVersionなしに生成しない。Partial Overallを計算する場合は通常complete scoreと区別できるprovisional/partial表示候補とする。

DenominatorはHybridを推奨候補とする。Applicableなeligible expected setをcoverage母数にし、Profileが許すcalculated contributorsをnumeric aggregationへ使う。Observed-only denominatorで欠損を隠さない。

#### Model and Readiness

- Model A Strict Complete-only: required inputの局所policy候補。
- Model B Eligibility-aware Calculation + Separate Quality Metadata: `RECOMMENDED / NOT_APPROVED`。
- Model C Coverage-adjusted Scoring: Crawl不足とProduct qualityを混ぜるriskがあり、Calibrationまでdefer。

Logical Candidateはidentity/level、Score State/value、Completeness/reason、Eligibility/rule、required/eligible/calculated summaries、coverage、quality/confidence、input lineage、formulaVersion/Profile、calculatedAt、optional reanalysis signalを組み合わせる。Exact JSON/enum/threshold/required set/per-Submetric treatmentは未決定。

PD-02D=`DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`。PD-02 parent=`NEEDS_DISCOVERY`、PD-04=`READY_FOR_DISCOVERY / NON_BLOCKING_TO_PD-02D`を維持する。

### PD-45 PD-02D Missing / Partial Score Contract Decision Review

PD-44 CandidateをFinal Proposal化した。Approval Evidenceは`NOT_PROVIDED`であり、Product Owner承認なしに`DECISION_COMPLETE`へ変更しない。

#### Final Contract Proposal

- Completenessは`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`を維持し、Score valueやProduct qualityと分離する。
- Eligibilityは`ELIGIBLE / INELIGIBLE / CONDITIONALLY_ELIGIBLE / UNDETERMINED`をCompletenessから分離し、Profile rule referenceを保持する。
- Score Stateは`CALCULATED / NON_CALCULATED`。Non-calculatedではvalueなし + explicit reasonとする。
- MISSINGはProduct absenceだが自動0/Penaltyではない。Generic Missing PenaltyをRejectし、meaningful absenceだけexplicit semantic mappingを許す。
- N/Aは0/neutralでなくeligible expected denominatorから除外する。
- UNKNOWN/Technical Failureは0/MISSING/negative evidenceへ変換せず、required inputならnon-calculated候補とする。
- PARTIALはreason + coverage + lineageで表現し、direct numeric penaltyをRejectする。
- Evidence Role=`REQUIRED / OPTIONAL / CONDITIONAL / NOT_APPLICABLE`をruntime Completeness/Eligibilityと分離する。
- Hybrid Denominatorを採用Proposalとし、eligible expected setとnumeric calculated contributorsを分離する。

SubmetricはType/Profile-specific Eligibility-aware Calculation、Axis/Layerはrequired条件を満たしたeligible calculated contributorsのaggregationをProposalとする。Overallは両Required Layer + approved Fusion Profileをnormal条件とし、silent one-layer fallback/weight redistributionをRejectする。

Partial calculationはScore State=`CALCULATED`、Completeness=`PARTIAL`、reason/coverage/limitationsで表現し、complete Scoreと無標識で同一表示しない。Quality、Completeness、Confidence、Crawl CoverageをProduct Scoreから分離する。

Model dispositions:

- Model A=`KEEP AS LOCAL PROFILE POLICY`
- Model B=`APPROVAL CANDIDATE / READY_FOR_APPROVAL`
- Model C=`DEFER UNTIL CALIBRATION`

#### Readiness and Closure

PD-02D Contract、Treatment Model B、PD-02D Closure Proposalはいずれも`READY_FOR_APPROVAL / NOT_APPROVED`。Approval後はPD-02D=`DECISION_COMPLETE`とするProposalで、Exact thresholds/required sets/calibration/schema/implementationはClosure blockerにしない。

PD-02D承認後はPD-02A〜Dがdecision-completeになるため、PD-02 parentを自動Completeにせず`READY_FOR_CLOSURE_REVIEW`へ進める。現在はPD-02 parent=`NEEDS_DISCOVERY`を維持する。

### PD-46 PD-02D Explicit Product Owner Approval Record

Approval Evidence: 「PD-02DのMissing / Partial Score Contract Proposal、Treatment Model B、およびPD-02D Closure Proposalを承認する。」  
Approval Date: 2026-08-24  
Decision Owner: Product Owner

PD-45 Final Proposalを正式承認した。Completeness、Eligibility、Score State、Missing/N/A/Unknown/Failure/Partial、Required Evidence Role、Hybrid Denominator、Submetric/Axis/Layer/Overall、limited calculation、quality separation、comparability、explainability、logical contractをPD-02D Contractとする。

Model A=`KEEP AS LOCAL PROFILE POLICY`、Model B=`DECIDED / APPROVED / V1 DEFAULT TREATMENT MODEL`、Model C=`DEFER UNTIL CALIBRATION`とする。PD-02D Closure Proposalも承認され、PD-02D=`DECISION_COMPLETE`となった。

Implementation=`NOT_IMPLEMENTED`、Exact Thresholds/Required Sets=`NOT_DECIDED`、Calibration=`NOT_PERFORMED`、physical JSON/DB/OpenAPIとRails/Worker/Frontend implementationはdeferredである。PD-04はSnapshot/Strategy lifecycle、reanalysis/history/usage/billingのOwnerを維持する。

PD-02A〜Dがdecision-completeとなったため、PD-02 parent=`READY_FOR_CLOSURE_REVIEW`へ更新する。Parentは自動`COMPLETE`にせず、次Phaseでscope、handoff、deferred事項をclosure reviewする。

### PD-47 PD-02 Parent Closure Review

PD-02 Parent scopeをPD-02A〜Dの承認正本で照合した。Common 6 Axis identity/label/definition/boundary/order/versioning、Observation Contract、Formula Architecture/Parameter Policy/Formula Version/Backend Wire、Missing/Partial/Eligibility TreatmentはDecision上すべて閉じている。

Contract chainは`Axis Contract → Observation Contract → Submetric / Formula Architecture → Formula Version / Backend Wire → Missing / Partial Treatment → AnalysisScoreResult`としてidentity、version lineage、Completeness、Eligibility、provenance、Score Stateを矛盾なく接続する。

Residual itemsは`VALIDATION_HANDOFF`、`IMPLEMENTATION_HANDOFF`、`PD-04_HANDOFF`、`PRESENTATION_HANDOFF`へ分類でき、`CLOSURE_BLOCKER`は0件である。推奨判定は`CLOSE_WITH_DEFERRED_ITEMS`。

Product OwnerによるPD-02 Parent Closure Proposalの明示承認はまだ提供されていないため、Parentを`DECIDED / COMPLETE`へ進めず、`READY_FOR_CLOSURE_APPROVAL`とする。Exact Parameters=`NOT_DECIDED`、Calibration=`NOT_PERFORMED`、Implementation=`NOT_IMPLEMENTED`を維持する。

### PD-48 PD-02 Parent Closure Explicit Product Owner Approval Record

Approval Evidence: 「PD-02 Common 6 Axis / Score Contract Parent Decisionを、Deferred Itemsを後続Phaseへ引き継ぐ条件でClosureすることを承認する。」  
Closure Date: 2026-08-24  
Decision Owner: Product Owner

PD-47の`CLOSE_WITH_DEFERRED_ITEMS`を正式承認した。PD-02 ParentのCanonical statusを`DECIDED / COMPLETE`、補助statusを`CLOSED_WITH_DEFERRED_ITEMS`とし、Closure blocker countは0件とする。

Axis Contract v1=`ACTIVE`、PD-02A=`DECIDED`、PD-02B=`DECIDED / COMPLETE`、PD-02C=`DECISION_COMPLETE`、PD-02D=`DECISION_COMPLETE`を維持する。Contract chain、独立version責務、published immutability、historical silent reinterpret禁止もClosure後の正式要件として残す。

Deferred Ledgerは`VALIDATION_HANDOFF`、`IMPLEMENTATION_HANDOFF`、`PD-04_HANDOFF`、`PRESENTATION_HANDOFF`の4分類を維持する。Exact Formula Parameters=`NOT_DECIDED`、Calibration=`NOT_PERFORMED`、Implementation=`NOT_IMPLEMENTED`であり、Parent Decision Completeは検証・実装完了を意味しない。

### Dependencies and Standardization Impact

- PD-02B → PD-02C: canonical ID/definitionがformula output、Backend schema、Snapshot axis objectの前提になる。
- PD-02B → PD-02D: missing/partial contractはmissingになったaxis identityを必要とする。
- PD-02Aの0–100 display contractは維持し、Identity/formulaと混ぜない。
- PD-02B決定後に解禁可能: canonical axis type、shared label metadata/component、shared radar ordering、Self/Competitor presentation consolidation、将来のaxis-specific token key。
- 現在はblocked: source label/key/order変更、shared canonical axis component、axis semantic color、Backend enum/schema、formula helper。

## Status Definitions

| Status                          | Meaning                                                        |
| ------------------------------- | -------------------------------------------------------------- |
| `CURRENT_PRODUCT_CANDIDATE`     | Product思想として候補だが未承認                                |
| `CURRENT_PRESENTATION_BEHAVIOR` | 現在の表示を構成する事実。Product仕様ではない                  |
| `FRONTEND_FIXTURE_CANDIDATE`    | fixture/mappingでmachine keyがあるがcanonical contractではない |
| `PRESENTATION_ONLY`             | clamp、angle、CSS width等の安全な表示変換                      |
| `PRODUCT_LOGIC_SUSPECTED`       | formula/threshold/aggregationらしいがOwner承認がない           |
| `FRONTEND_ONLY_CURRENTLY`       | Frontend type/fixtureだけに存在                                |
| `BACKEND_CONTRACT_REQUIRED`     | canonical API/Rails ownershipが必要                            |
| `UNKNOWN`                       | repository evidenceで確定できない                              |

## Current Axis Candidates

指示書で提示された次の6概念を`CURRENT_PRODUCT_CANDIDATE`として扱う。正式名称・ID・順序ではない。

| Candidate concept       | Full-label candidate | Frontend fixture key candidate | Status                       |
| ----------------------- | -------------------- | ------------------------------ | ---------------------------- |
| Value proposition       | 価値訴求             | `valueProposition`             | `FRONTEND_FIXTURE_CANDIDATE` |
| Information hierarchy   | 情報階層             | `informationHierarchy`         | same                         |
| Funnel strength         | 導線強度             | `funnelStrength`               | same                         |
| Trust structure         | 信頼構造             | `trustStructure`               | same                         |
| Differentiation clarity | 差別化明確性         | `differentiationClarity`       | same                         |
| Decision support        | 意思決定支援         | `decisionSupport`              | same                         |

これら6 keyはdummy seed、dummy mapping、Selfのaugmented fixture typeに存在する。しかし`PanoptesSelfData.radar`、Competitor radar、Industry metricsはlabel-drivenで、OpenAPI/BFF/Railsには同じID contractがない。したがって`CANONICAL_ID_PRESENT = NO`、`CANDIDATE_KEYS_PRESENT = YES`である。

## Axis Inventory

明示的な6軸定義・順序setは5件確認した。seed objectのproperty orderは表示順として数えず、mapping利用を別記する。

| Location                                           | Feature                       | Axis ID               | Label                    | Order | Value Type              | Scale                                  | Source             |
| -------------------------------------------------- | ----------------------------- | --------------------- | ------------------------ | ----- | ----------------------- | -------------------------------------- | ------------------ |
| `dummy/panoptes_dummy_ui.ts` `AXIS_KEYS/LABELS`    | Self/Industry fixture mapping | 6 candidate keys      | full 6 labels            | A     | number                  | axis/benchmark 0–100想定、delta signed | Fixture/Mapping    |
| `Self/data/self-analysis-overview-presentation.ts` | Self                          | same 6 candidate keys | full 6 labels            | A     | key + number            | 0–100 display、delta signed            | Component/Mapping  |
| `Competitor/data/competitor-card-presentation.ts`  | Competitor                    | `NO_CANONICAL_ID`     | 4 full + 2 short labels  | A     | `{label,value}`         | 0–100 clamped                          | Derived/Hard-coded |
| `mock/snapshot-factory.ts` Industry metrics        | Industry                      | `NO_CANONICAL_ID`     | full labels + `平均`     | B     | `{label,value,tone}`    | fixture integer 0–100                  | Fixture            |
| `mock/snapshot-factory.ts` Self radar              | Self mock                     | `NO_CANONICAL_ID`     | full/short/alternate mix | C     | `{label,self,industry}` | fixture integer 0–100                  | Fixture            |

### Axis Order Inventory

| Order       | Sequence                                                                    | Used by                                                  |
| ----------- | --------------------------------------------------------------------------- | -------------------------------------------------------- |
| Candidate P | 価値訴求 → 情報階層 → 導線強度 → 信頼構造 → 差別化明確性 → 意思決定支援     | Phase指示のProduct candidateのみ                         |
| A           | 価値訴求 → 導線強度 → 差別化(明確性) → 情報階層 → 信頼構造 → 意思決定(支援) | Self definitions、Competitor、dummy mapped Self/Industry |
| B           | 価値訴求 → 信頼構造 → 情報階層 → 差別化明確性 → 導線強度 → 意思決定支援     | mock Industry metrics、seed benchmark record order       |
| C           | 情報階層 → 導線強度 → 差別化指数 → 意思決定 → 信頼根拠 → 価値訴求           | mock factory Self radar                                  |

順序variantは4件。Aが現在のSelf/Competitor production presentationで一致するが、正式順序とは認定しない。

## Axis Label Variants

| Concept               | Observed labels                                            | Classification                                           |
| --------------------- | ---------------------------------------------------------- | -------------------------------------------------------- |
| Value proposition     | `価値訴求`、`価値訴求平均`                                 | full / fixture aggregate                                 |
| Information hierarchy | `情報階層`、`情報階層平均`                                 | full / fixture aggregate                                 |
| Funnel strength       | `導線強度`、`導線強度平均`                                 | full / fixture aggregate                                 |
| Trust structure       | `信頼構造`、`信頼構造平均`、`信頼根拠`、`信頼補強`         | full / fixture aggregate / alternate fixture / gap label |
| Differentiation       | `差別化明確性`、`差別化明確性平均`、`差別化`、`差別化指数` | full / fixture aggregate / short / alternate fixture     |
| Decision support      | `意思決定支援`、`意思決定支援平均`、`意思決定`             | full / fixture aggregate / short                         |

明示的な6軸・metric labelsは16 unique strings。gap badgeの`信頼補強`を含むaxis-related labelは17。`情報設計`、`訴求一貫性`、`回遊設計`、`技術基盤`はSelf breakdown項目であり、common six axesに混ぜない。fallbackの`指標`、`差分指標 N`もcanonical labelではない。

## Axis ID Inventory

| ID                       | Locations                                                                | Contract level               |
| ------------------------ | ------------------------------------------------------------------------ | ---------------------------- |
| `valueProposition`       | dummy seed/mapping、Self augmented delta、Strategy expected lift fixture | `FRONTEND_FIXTURE_CANDIDATE` |
| `funnelStrength`         | same                                                                     | same                         |
| `differentiationClarity` | same                                                                     | same                         |
| `informationHierarchy`   | same                                                                     | same                         |
| `trustStructure`         | same                                                                     | same                         |
| `decisionSupport`        | same                                                                     | same                         |

No shared exported domain enum、OpenAPI enum、Rails attribute、BFF validatorが存在する。Competitor/Industry/Snapshotのproduction-facing typeはIDを持たないため、上記を正式採用しない。

## Score Scale Inventory

| Value family                         | Current range/shape           | Integer/float                | Nullable/optional                      | Boundary                                |
| ------------------------------------ | ----------------------------- | ---------------------------- | -------------------------------------- | --------------------------------------- |
| Self/Competitor aggregate and axes   | display 0–100                 | TSはnumber、fixtureはinteger | core type required                     | view-model/presentation clamp           |
| Industry axis metrics/confidence     | fixture 0–100                 | number                       | required in type                       | Frontend fixture only                   |
| Strategy `fitIndex`                  | display 0–100                 | number                       | required                               | view-model/presentation clamp           |
| Strategy plan `fitScore`             | 0–100 candidate               | number                       | `number \| null`                       | frontend domain type only               |
| Axis delta / expected lift           | signed number                 | fixture integer              | partial key record / strings in output | no formal bounds                        |
| Market pressure / matrix coordinates | 0–1 normalized                | float                        | required in fixture                    | not score/axis contract                 |
| CSS ring angle                       | 0–360° main angle plus accent | float                        | derived                                | `PRESENTATION_ONLY`                     |
| progress/usage/distribution          | percent/count/rank/string     | mixed                        | mixed                                  | operational or preview; not common axes |

Current UI strongly assumes 0–100 for axis and aggregate display, but TypeScript `number` does not enforce integer/range and no Backend schema confirms it. Decimal policyとrounding policyは`UNKNOWN`。

## Overall / Layer Score Inventory

| Field/concept                                              | Feature                  | Current meaning                                         | Formula evidence                    | Status                    |
| ---------------------------------------------------------- | ------------------------ | ------------------------------------------------------- | ----------------------------------- | ------------------------- |
| `overallScore`                                             | Self/Competitor          | displayed overall score                                 | calculation absent                  | `FRONTEND_ONLY_CURRENTLY` |
| `internalScore` / `structureScore`                         | Self                     | internal/structure display score; alias fallback exists | relation to overall absent          | layer-like, `UNKNOWN`     |
| `internalStructureScore`                                   | Competitor               | internal structure bar                                  | relation to overall absent          | layer-like, `UNKNOWN`     |
| `visualScore`                                              | Self/Competitor          | visual display score                                    | relation to overall absent          | layer-like, `UNKNOWN`     |
| `industryBenchmarkScore`                                   | Self view model          | rounded mean of displayed industry rows; empty=68       | explicit frontend formula           | `PRODUCT_LOGIC_SUSPECTED` |
| `fitIndex`                                                 | Strategy                 | strategy fit index                                      | source calculation absent           | separate Strategy metric  |
| `fitScore`                                                 | Strategy plan            | plan suitability candidate                              | source calculation absent、nullable | separate Strategy metric  |
| `priorityScore`                                            | Strategy seed            | priority label/input fixture                            | calculation absent                  | fixture only              |
| structure stability/differentiation slack/opportunity/risk | Industry/seed            | named fixture scores                                    | contract absent                     | fixture-specific          |
| preview `score`                                            | legacy dummy score cards | preview card overall                                    | generated 61–91                     | preview only              |

`overall = layer aggregation`、weight、eligibility、rankの正式式は存在しない。

## Presentation Formula Inventory

| Location                     | Formula                        | Classification                  | Note                                         |
| ---------------------------- | ------------------------------ | ------------------------------- | -------------------------------------------- |
| Competitor ring helper       | `clamp(score,0,100) * 3.6deg`  | `PRESENTATION_ONLY`             | main score angle                             |
| Company Card ring            | main angle + 24° violet accent | `CURRENT_PRESENTATION_BEHAVIOR` | rationale unknown                            |
| Expanded Card ring           | main angle + 30° violet accent | same                            | 24/30差はProduct未承認                       |
| Self dual ring               | outer/inner clamp × 3.6deg     | `PRESENTATION_ONLY`             | center overallは数値表示のみ                 |
| Strategy fit gauge           | clamp × 3.6deg                 | `PRESENTATION_ONLY`             | fitIndex ring                                |
| Radar geometry               | `(value / 100) * radius`       | `PRESENTATION_ONLY`             | Self radius92、Competitor radius66           |
| Competitor benchmark polygon | `axis value - 14`              | `PRODUCT_LOGIC_SUSPECTED`       | benchmark meaning未定義                      |
| percentage bar               | clamp score + `%`              | `PRESENTATION_ONLY`             | Competitor helper is reusable within feature |

Company 24°とExpanded 30°はhistorical/current behaviorを保存するだけで`PRODUCT_SPEC`ではない。

## Formula-like Logic Inventory

| Location                                 | Current formula                                              | Classification             |
| ---------------------------------------- | ------------------------------------------------------------ | -------------------------- |
| Competitor `createCompetitorRadarPoints` | overall−4、internal、overall−8、visual、internal−6、visual+6 | `PRODUCT_LOGIC_SUSPECTED`  |
| Self radar fallback                      | breakdown scoreをself、score−8をindustry                     | `PRODUCT_LOGIC_SUSPECTED`  |
| Self industry benchmark                  | row averageを`Math.round`、empty=68                          | `PRODUCT_LOGIC_SUSPECTED`  |
| Self technology label                    | score ≥75 `安定`、≥60 `要確認`、else `改善余地あり`          | `PRODUCT_LOGIC_SUSPECTED`  |
| Strategy previous fit                    | `fitIndex - clamp(round(abs(gap)*2),4,14)`                   | `PRODUCT_LOGIC_SUSPECTED`  |
| Strategy improvement                     | `clamp(round(abs(gap)*2+14),8,36)`                           | `PRODUCT_LOGIC_SUSPECTED`  |
| Strategy plan progress                   | fitScore/fitIndexを12–100へclamp                             | `PRODUCT_LOGIC_SUSPECTED`  |
| Legacy preview dummy                     | score×0.84/0.76/0.68、rank/delta派生                         | `LEGACY / Preview fixture` |
| dummy Industry                           | normalized×100、score÷4/÷3                                   | `Fixture presentation`     |

これらをProduct formulaの正本にしない。正式formula、weight、threshold、eligibilityはProduct + Analysis/Data + Backend Decisionを要する。

## Tone / Threshold Inventory

| Surface                  | Mapping                                                    | Current status                            |
| ------------------------ | ---------------------------------------------------------- | ----------------------------------------- |
| Self gap badge           | value ≥0 `positive`、<0 `negative`                         | sign-based presentation; zero is positive |
| Self technology check    | ≥75 / ≥60 / lowerの3 label                                 | `PRODUCT_LOGIC_SUSPECTED`                 |
| Industry rating          | fixtureが`orange/violet/orange-soft/violet-soft`を直接保持 | value thresholdなし                       |
| dummy Industry mapping   | axis index 0–1 orange、2–3 violet、4–5 orange-soft         | hard-coded fixture presentation           |
| Company/Expanded ring    | orange main、violet fixed accent、neutral remainder        | continuous; score thresholdなし           |
| internal/visual bars     | orange/violet fixed by metric kind                         | thresholdなし                             |
| Strategy fit/improvement | orange/violet fixed visual                                 | thresholdなし                             |

`good/warning/bad`の共有contractやcanonical score semantic colorsはない。

## Missing Value Behavior

| Case                               | Current behavior                              | Risk/status                         |
| ---------------------------------- | --------------------------------------------- | ----------------------------------- |
| Self non-finite numeric            | clamp lower bound 0                           | display-safe                        |
| Competitor ring/bar non-finite     | presentation helper maps to 0                 | display-safe                        |
| Competitor view-model non-finite   | simple `Math.min/max`; `NaN` remains possible | malformed runtime not fully guarded |
| Strategy non-finite                | simple clamp; `NaN` contractなし              | `UNKNOWN`                           |
| Self `axisDeltaScores` missing key | `?? 0`                                        | missingとneutralを区別しない        |
| Self delta source absent           | gap badge parse → radar difference            | precedence-based fallback           |
| Self radar absent                  | breakdown first6; industry=self−8             | synthetic heuristic                 |
| Self metric rows empty             | industry benchmark 68                         | hard-coded fallback                 |
| malformed labels                   | `指標`、`項目`、`差分指標 N`                  | presentation fallback               |
| Strategy plan fit                  | `fitScore ?? fitIndex`                        | nullをparent fitへfallback          |
| empty arrays                       | several surfaces render empty/omit            | feature-dependent                   |

Missingを0へ変換する箇所があり、`missing != zero`を表せない。正式missing表示（`—`/N/A/hidden）、nullable contract、partial completenessは未決定。

## Feature-by-Feature Contract

### Self

- Typed input: `overallScore`、`structureScore`、`visualScore`、label-driven `radar`、`breakdown`。
- Augmented dummy input: `internalScore?`、`axisDeltaScores?: Partial<Record<SelfAnalysisAxisKey, number>>`。
- Current common-axis order A、full labels。
- Gap precedence: keyed delta → parsed gap badge → radar self−industry。
- Action cards map to improvement candidates only。scoreからStrategy proposal/approvalを生成しない。
- Overall/internal/visual/benchmark/axis gapの意味・formula関係は未定義。

### Competitor

- Typed card shares`overallScore`、`internalStructureScore`、`visualScore` between Company/Expanded。
- Companyはaggregate 3 scores、Expandedはsame aggregates + 6-axis radar。
- Radarはraw axis payloadではなく3 aggregate scoresから固定offsetで合成される。
- Company/Expanded ring main formulaは同じだがaccent 24°/30°。
- Compare/evidence/actionsはscore formulaを所有しない。

### Industry

- `rating.metrics`は`{label,value,tone}`でIDなし。
- dummy mapped dataはcandidate keysからfull labelsを生成するが、mock factoryは別orderと`平均`labelsを直書きする。
- confidence、distribution、position coordinatesはcommon-axis scoreと別概念。

### Strategy

- Common-axis raw score collectionは持たない。`impact`はlabel strings。
- `fitIndex`、nullable plan `fitScore`、priority/progress/improvement等はcommon-axisと別metric。
- Self/Competitor scoreをStrategy scoreとして直接import/aggregateしていない。
- view-modelのgap→fit/improvement派生はProduct logic suspectedで、Backend formulaではない。

### Snapshot / Analysis Result

- `PanoptesAnalysisSnapshotPayload`内にCompetitor aggregate、Industry metrics、Self aggregate/radar、Strategy fitが共存する。
- 共通`axes` object、axis ID enum、score metadata、scale/version、completeness、formula versionはない。
- production canonical business APIは未接続で、current Snapshotはmock/dummy contract。

## Frontend / Backend Boundary

| Layer                           | Evidence                                        | Classification              |
| ------------------------------- | ----------------------------------------------- | --------------------------- |
| Frontend `panoptes/types.ts`    | score fieldsとlabel arrays                      | `FRONTEND_ONLY_CURRENTLY`   |
| Canonical BFF client            | health/user/organization/membershipのみ         | score contractなし          |
| Business client                 | productionでは`business_api_unavailable`        | score contract未接続        |
| OpenAPI 18 operations           | score/axis/metric/fit fieldなし                 | score schemaなし            |
| Rails models/schema/serializers | auth/user/organization基盤のみ、score matchなし | score contractなし          |
| BFF response mapping            | score/axis assertion/mappingなし                | `BACKEND_CONTRACT_REQUIRED` |

Backend classification: `BACKEND_CONTRACT_REQUIRED`。現状を`IMPLEMENTED_BACKEND_CONTRACT`とは扱わない。

## Fixture / Preview Boundary

| Source                         | Shape                                                     | Classification                               |
| ------------------------------ | --------------------------------------------------------- | -------------------------------------------- |
| mapping-aligned JSON seed      | candidate keys、aggregate、delta、benchmark、fit/priority | Preview/dummy fixture                        |
| `panoptes_dummy_ui.ts`         | seed → current Snapshot payload                           | development fixture mapping                  |
| deterministic snapshot factory | typed mock Snapshot、alternate labels/orders              | development mock API                         |
| `dummy-score-cards.js`         | score、rank、metric breakdown formulas                    | legacy preview only                          |
| tests                          | current behavior/regression expectations                  | test-only evidence; Product approvalではない |

Fixture shapeをProduct仕様またはBackend schemaとして採用しない。

## Type Definitions

| Type/const                                | Location                           | Note                                |
| ----------------------------------------- | ---------------------------------- | ----------------------------------- |
| `PanoptesCompetitorCard`                  | `panoptes/types.ts`                | 3 required aggregate scores         |
| `PanoptesIndustryData.rating.metrics`     | same                               | label/value/tone、IDなし            |
| `PanoptesSelfData`                        | same                               | aggregate、radar、breakdown、IDなし |
| `PanoptesStrategyPlan`                    | same                               | nullable `fitScore`、nullable rank  |
| `PanoptesStrategyData`                    | same                               | `fitIndex`、gap、string impacts     |
| `SelfAnalysisAxisKey` / definitions       | Self presentation                  | 6 candidate keys/full labels        |
| `AugmentedSelfSource`                     | Self view model                    | optional partial keyed deltas       |
| Self view-model row/card types            | Self view model                    | presentation-specific               |
| Competitor view-model/radar types         | Competitor view model/presentation | presentation-specific、label-driven |
| Strategy overview/improvement/rail models | Strategy view model                | presentation/derived metrics        |
| dummy `AxisKey`                           | dummy mapping                      | private fixture key union           |

重複typeとinline shapesは存在するが、本Phaseでは統合しない。

## Mapping Functions

| Function/group                      | Role                                       | Boundary                             |
| ----------------------------------- | ------------------------------------------ | ------------------------------------ |
| `createSelfAnalysisViewModel`       | clamp、fallback、gap precedence、benchmark | mixed presentation + suspected logic |
| `createCompetitorAnalysisViewModel` | aggregate clamp、text/URL fallback         | presentation mapping                 |
| `createCompetitorRadarPoints`       | aggregate→6 axes fixed offsets             | `PRODUCT_LOGIC_SUSPECTED`            |
| Competitor ring/percentage helpers  | safe clamp、angle、CSS percentage          | pure presentation candidate          |
| `createStrategyAnalysisViewModel`   | fit/improvement/progress derivation        | mixed; suspected logic               |
| dummy Snapshot mapping              | seed keys/labels→typed payload             | fixture boundary                     |
| deterministic Snapshot factory      | generated current mock result              | mock API boundary                    |
| legacy dummy score mapping          | synthetic detail metrics/rank              | preview legacy                       |

## Shared Helper Candidates

- Safe numeric clamp/non-finite fallback、percentage string、polar geometry are pure presentation candidates only when they do not embed Product thresholds or labels。
- Competitor ring constructor is feature-shared but 24°/30° public helpers remain separate。
- Canonical label registry、common score component、tone threshold helper、axis aggregation helperはPD-02決定前に作らない。

## partially_completed

AnalysisJob runtimeは`partially_completed`をterminalとして扱うが、Snapshot payloadにper-axis completeness、missing reason、quality flag、formula versionはない。一部Axis欠損の実例・fixtureも確認できない。

判定: `UNKNOWN / BACKEND_CONTRACT_REQUIRED`。PD-04のSnapshot persistence/usable section Decisionと共同確認するが、PD-04自体は本Phaseで決めない。

## Decision Readiness

| Sub-area                          | Readiness         | Reason                                                 |
| --------------------------------- | ----------------- | ------------------------------------------------------ |
| Axis naming                       | `NEEDS_DISCOVERY` | full/short/alternate/aggregate labelsが混在            |
| Axis ID                           | `NEEDS_DISCOVERY` | candidate keysはあるがcanonical cross-layer IDなし     |
| Axis order                        | `NEEDS_DISCOVERY` | 4 order variants                                       |
| Display scale                     | `DECIDED`         | PD-02A: Frontend display 0–100。decimal policyは未決定 |
| Presentation angle/clamp boundary | `DECIDED`         | PD-02A: visualization-only clamp/transformを許可       |
| Product formula/weight/threshold  | `NEEDS_DISCOVERY` | suspected frontend heuristics、formula owner不明       |
| Backend ownership/schema          | `BLOCKED`         | canonical business API/schema未実装                    |
| Missing/partial values            | `BLOCKED`         | Backend completeness + PD-04 semanticsが必要           |
| Tone/color semantics              | `NEEDS_DISCOVERY` | sign/index/metric固定色が混在、共有thresholdなし       |

PD-02全体は`NEEDS_DISCOVERY`を維持する。

## Standardization Impact

| Area                                             | Impact         | Boundary                                            |
| ------------------------------------------------ | -------------- | --------------------------------------------------- |
| semantic score colors/tokens                     | `BLOCKING`     | tone/threshold Product Decision待ち                 |
| canonical axis labels/ID/order                   | `BLOCKING`     | naming/ID/order Decision待ち                        |
| shared score/axis component                      | `PARTIAL`      | visual primitive検討可、semantic API統合は停止      |
| UI regulation for missing/partial                | `BLOCKING`     | Backend/PD-04 contract待ち                          |
| generic spacing/radius/typography/surface tokens | `NON_BLOCKING` | score semanticsと独立                               |
| generic responsive/accessibility                 | `NON_BLOCKING` | numeric label、accessible name、reflowは進行可      |
| Tailwind mechanics                               | `NON_BLOCKING` | ただしsemantic token決定より先にscore色を固定しない |
| directory/component taxonomy                     | `NON_BLOCKING` | Product formulaを含む統合だけ避ける                 |

PD-02Aによりgeneric score container、percentage/ring visualization、radar max scale、visual clamp helper、score layout tokenの検討が解禁された。ただしhelper/componentはraw valueをmutationせずProduct formulaを含まないこと。Canonical axis component/label/order、semantic score color、quality badge、threshold tone、missing-value UI、Product formula helperは引き続き`BLOCKING`である。

## Product Decision Questions

1. 正式Axis IDはcandidate 6 keysか、別のsnake_case/backend IDか。
2. 正式6軸名称は何か。
3. Surface別short label（差別化/意思決定）を許可するか。
4. 正式表示順はP/A/B/Cのどれか、または別順か。
5. ~~canonical score scaleは0–100か。~~ PD-02AでFrontend display scale 0–100と決定。Backend raw scaleは未決定。
6. decimalを許可するか。
7. input保存、API、表示それぞれのrounding ruleは何か。
8. missing valueをnull/unknown/zeroのどれとして扱い、UIは`—`/N/A/hiddenのどれか。
9. `overallScore`は何を意味し、どのlayer/weightから算出するか。
10. internal/structure/visual等の正式layer scoreは存在するか。
11. tone thresholdはProduct仕様か、Surface固有presentationか。
12. 3.6°と0–100 radar coordinateはPD-02AでPresentationと決定。24°/30°accentとbenchmark offsetは未決定。
13. Self/Competitor/Industryで同じaxis contractを使うか。
14. BackendがID、scale、formula version、completenessをcanonical所有するか。
15. `partially_completed`時の欠損軸、overall、Strategy昇格をどう扱うか。

推奨OwnerはProduct Owner + Analysis/Data OwnerのJoint Decision。Backend/API Owner、Design、FrontendをConsultedとする。

## Unknowns

- canonical axis ID/name/order/description、score formula/weight/eligibility。
- overallとlayerの関係、decimal/rounding、threshold/tone。
- Backend persistence/API versioning、formula version、provenance。
- missing/partial completeness、`partially_completed`との関係。
- 24°/30°accent、Competitor offset、Self/Strategy heuristicのProduct妥当性。

## Recommended Next Action

次はPD-04 `partially_completed Snapshot Workflow`のFull Discoveryを推奨する。Snapshot lifecycle/current promotion、Strategy Source promotion、reanalysis/history/usage/billingをPD-02の閉じたScore Contract境界から分離して扱う。

## References

- [Product Decision Register](./product-decision-register.md)
- [PD-02 Discovery Audit](../audit/64-pd02-score-common-axes-data-dictionary-discovery.md)
- [PD-02A Decision Audit](../audit/65-pd02a-display-scale-presentation-boundary-decision.md)
- [PD-02B Identity Discovery Audit](../audit/66-pd02b-canonical-axis-identity-discovery.md)
- [PD-02B Axis Set / Label Identity Decision Review](../audit/67-pd02b-axis-set-label-identity-decision.md)
- [PD-02B Product Owner Approval Check](../audit/68-pd02b-product-owner-approval-decision-record.md)
- [PD-02B Explicit Product Owner Approval Record](../audit/69-pd02b-explicit-product-owner-approval-record.md)
- [PD-02B Canonical Order Explicit Approval](../audit/81-pd02b-canonical-order-explicit-product-owner-approval-record.md)
- [PD-02B Snapshot Order Lineage Evidence Workshop](../audit/82-pd02b-snapshot-order-lineage-evidence-workshop.md)
- [PD-02B Axis / Order Versioning Discovery](../audit/83-pd02b-axis-order-versioning-discovery.md)
- [PD-02B Axis / Order Versioning Decision Review](../audit/84-pd02b-axis-order-versioning-decision-review.md)
- [PD-02B Axis / Order Versioning Explicit Product Owner Approval Record](../audit/85-pd02b-axis-order-versioning-explicit-product-owner-approval-record.md)
- [PD-02C Score Formula / Backend Contract Discovery](../audit/86-pd02c-score-formula-backend-contract-discovery.md)
- [PD-02C Axis Formula / Submetric Evidence Workshop](../audit/87-pd02c-axis-formula-submetric-evidence-workshop.md)
- [PD-02C Differentiation / Decision Support Evidence Calibration](../audit/88-pd02c-differentiation-decision-support-evidence-calibration.md)
- [PD-02C Observation Output Contract Discovery](../audit/89-pd02c-observation-output-contract-discovery.md)
- [PD-02C Observation Output Contract Decision Review](../audit/90-pd02c-observation-output-contract-decision-review.md)
- [PD-02C Observation Output Contract Explicit Product Owner Approval Record](../audit/91-pd02c-observation-output-contract-explicit-product-owner-approval-record.md)
- [PD-02C Axis Formula Candidate Discovery](../audit/92-pd02c-axis-formula-candidate-discovery.md)
- [PD-02C Axis Formula Architecture Decision Review](../audit/93-pd02c-axis-formula-architecture-decision-review.md)
- [PD-02C Axis Formula Architecture Explicit Product Owner Approval Record](../audit/94-pd02c-axis-formula-architecture-explicit-product-owner-approval-record.md)
- [PD-02C Formula Profile / Parameter Policy Discovery](../audit/95-pd02c-formula-profile-parameter-policy-discovery.md)
- [PD-02C Formula Profile / Parameter Policy Decision Review](../audit/96-pd02c-formula-profile-parameter-policy-decision-review.md)
- [PD-02C Formula Profile / Parameter Policy Explicit Product Owner Approval Record](../audit/97-pd02c-formula-profile-parameter-policy-explicit-product-owner-approval-record.md)
- [PD-02C Formula Version / Backend Wire Contract Discovery](../audit/98-pd02c-formula-version-backend-wire-contract-discovery.md)
- [PD-02C Formula Version / Backend Wire Contract Decision Review](../audit/99-pd02c-formula-version-backend-wire-contract-decision-review.md)
- [PD-02C Formula Version / Backend Wire Contract Explicit Product Owner Approval Record](../audit/100-pd02c-formula-version-backend-wire-contract-explicit-product-owner-approval-record.md)
- [PD-02D / PD-04 Dependency and Discovery Readiness Review](../audit/101-pd02d-pd04-dependency-discovery-readiness-review.md)
- [PD-02D Missing / Partial Score Contract Discovery](../audit/102-pd02d-missing-partial-score-contract-discovery.md)
- [PD-02D Missing / Partial Score Contract Decision Review](../audit/103-pd02d-missing-partial-score-contract-decision-review.md)
- [PD-02D Missing / Partial Score Contract Explicit Product Owner Approval Record](../audit/104-pd02d-missing-partial-score-contract-explicit-product-owner-approval-record.md)
- [PD-02 Parent Closure Review](../audit/105-pd02-parent-closure-review.md)
- [PD-02 Parent Closure Explicit Product Owner Approval Record](../audit/106-pd02-parent-closure-explicit-product-owner-approval-record.md)
- [Competitor Company Card Audit](../audit/50-competitor-company-card-analysis.md)
- [Competitor Expanded Card Audit](../audit/46-competitor-expanded-card-analysis.md)
- [Self Overview Audit](../audit/48-self-analysis-overview-panel-analysis.md)
- [Strategy Roadmap Audit](../audit/44-strategy-roadmap-phase-card-analysis.md)
- [AnalysisJob Runtime Mapping](../audit/40-analysis-job-runtime-mapping.md)
- [Snapshot Comparison](../audit/21-snapshot-component-comparison.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [MVP Spec Final Reviewed](../../src/lib/db/role/panoptes_mvp_spec_final_reviewed_v_1_0.md)
- [Master Spec v3.4](../../src/lib/db/role/panoptes_master_spec_v_3_4_strategy_os_db_feed_integrated.md)
- [Historical Strategic Engine Axis Draft](../../src/lib/db/role/Archive/Panoptes_Strategic_Engine_Complete_Spec_v1.txt)
