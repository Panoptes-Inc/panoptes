# Phase PD-28 — PD-02C Score Formula / Backend Contract Discovery

Date: 2026-08-21  
Decision: PD-02C Score Formula / Backend Contract  
Status: `DISCOVERY_COMPLETE / NEEDS_DISCOVERY`

## 1. Scope

Axis Contract v1を入力に、Frontendのscore derivation、Formula文書、Snapshot payload、BFF/OpenAPI/Rails境界を対象限定で調査した。Formula、Weight、Threshold、Normalization、Missing/Partial、Backend schema、DB/API実装は決定・変更していない。

## 2. Current Formula Evidence

| Evidence | Classification | Finding |
| --- | --- | --- |
| Formula Specification v2.1 | `DOCUMENTATION` | robust benchmark、market profile、Internal/Visual fusion、overall候補を定義。Product Owner承認・runtime接続・persistenceなし |
| Display Metrics Mapping v1.0 | `DOCUMENTATION` | Internal/Visual weighted meanとoverall 0.55/0.45 confidence-adjusted fusionを表示metricへ対応付け |
| Snapshot factory / dummy seed | `MOCK / FIXTURE` | overall、Internal、Visual、Axis値を独立したseed/range/constantとして生成。相互Formulaなし |
| Self/Competitor view model | `PRESENTATION_ONLY` | 0–100 clamp、fallback、percentage/ring/radar geometry。Product Formulaではない |
| Competitor radar synthesis | `PRESENTATION_ONLY / UNKNOWN` | aggregateから固定offsetで6点を合成。canonical Axis Formulaではない |
| Legacy dummy score cards | `LEGACY / PREVIEW` | score×0.84/0.76/0.68等のpreview derivation。production formulaではない |
| Production Backend | `NOT_IMPLEMENTED` | Rails、canonical BFF、OpenAPIにtyped score/axis Formula Contractなし |

Formula Source of Truthは`MIXED`。承認・実装・lineageが揃ったsingle canonical sourceは存在しない。

## 3. Score Hierarchy

RepositoryはInternal observationとVisual observationの二層、6 Axis、Internal/Visual/Overall outputをProduct思想として記録する。Display Metrics MappingはInternal/Visual scoreを各layerのAxis score weighted mean、overallを両layerのlate fusionとする候補を持つ。

ただしatomic observation/submetricから各Canonical Axis scoreを算出する式、eligibility、aggregation unitは存在しない。よって現時点の階層は`Observation / atomic evidence → Axis score = NOT_CONFIRMED`、`Axis score → Internal / Visual layer = DOCUMENTED_CANDIDATE`、`Internal / Visual → Overall = DOCUMENTED_CANDIDATE`である。runtimeではaggregateとAxis値が独立入力され、階層整合は検証されない。

## 4. Formula Version

PD-27により`formulaVersion`はAxis Contractから独立し、異version scoreはcompatibility/calibration contractなしに直接比較不可である。次をscore semanticsへ影響させる変更はnew formulaVersion候補とする。

- Canonical ID別Weight/profileまたはweight selection rule
- raw→normalized scoreのNormalization / Clamp
- submetric/atomic evidenceからAxis scoreへの変換・aggregation
- Axis→Internal/Visual、Internal/Visual→Overallのaggregation/fusion
- Formula-level Threshold、eligibility、rounding

CSS、ring/radar geometry、percentage formatting、display safety clampのみの変更はFormula lineageへ混ぜない。Formula registry、immutable identifier、score artifactへのversion参照、calculation provenance、calibration/compatibility metadataが必要だが、具体schemaは未決定である。Formula Version Contractは`READY_FOR_DECISION`。

## 5. Backend Contract Requirements

将来Backend Contractは少なくとも以下のrequirementを満たす必要がある。field名・schemaは今回決定しない。

- Axis scoreを6 Canonical IDsで明示識別し、array indexをsemantic identityにしない。
- raw score、normalized/display score、Internal/Visual layer、Overallを区別する。
- `axisContractVersion`、`formulaVersion`、`analysisPipelineVersion`、必要なSnapshot schema/order lineageをscore artifactへ関連付ける。
- Formula registry参照、適用weight/profile、calculation timestamp/job/snapshot、input/evidence参照等のprovenanceを再構成可能にする。
- Completeness/missing relationを運べる境界を用意するが、意味と処理はPD-02Dへ委ねる。
- Organization / Project / AnalysisJob / Snapshot境界を維持し、validationとimmutable historical reconstructionをBackend側で担保する。

Requirementsは`READY_FOR_DECISION`。OpenAPIの`AnalysisSnapshot.payload`は現在untyped aggregate objectで、Railsにscore model/serializer/schemaはなく、canonical business clientもunavailableである。Backend Wire implementationは`READY_FOR_BACKEND_DISCOVERY`であり、implementation-readyではない。

## 6. Historical Comparability

Frontend `PanoptesAnalysisSnapshotPayload`には`versionLabel`があるが、`formulaVersion`、`axisContractVersion`、`analysisPipelineVersion`、calculation provenanceはない。OpenAPIのSnapshot `version`もFormula lineageを表さず、payloadはuntypedである。したがって現在のSnapshotからFormula lineageを追跡できず、異Snapshot scoreのsemantic comparabilityは`UNKNOWN / NOT_VERIFIABLE`である。

後続Contractは生成時Formula lineageをimmutableに保持し、同一Formulaまたは明示calibration/compatibility contractを確認できないscoreの直接比較を禁止する必要がある。

## 7. PD-02D Boundary

PD-02Cはscore identity、calculation、aggregation、version/provenance、Backend transport requirementを扱う。PD-02DはAxis欠損、Partial、completeness、missing reason、zeroとの区別、aggregation eligibilityを扱う。

PD-02Dへ、Canonical ID別score representation、raw/normalized/layer distinction、formulaVersion、present/missing Axis IDs、calculation provenance、aggregationに必要なcompleteness hookをhandoffする。Missingを0とみなすか、partialを再正規化するかは決めない。

## 8. Readiness

| Area | Result |
| --- | --- |
| Formula Source of Truth | `MIXED` |
| Axis Formula | `NEEDS_DISCOVERY` |
| Overall Formula | `READY_FOR_DECISION` |
| Formula Version Contract | `READY_FOR_DECISION` |
| Backend Contract Requirements | `READY_FOR_DECISION` |
| Backend Wire Implementation | `READY_FOR_BACKEND_DISCOVERY` |
| PD-02C overall | `NEEDS_DISCOVERY` |
| PD-02 parent | `NEEDS_DISCOVERY` |

PD-02Cの旧`BLOCKED`はBackend Wire ownership handoffにより解除する。ただしAxis Formulaのevidence chainが不足するためcloseまたはDecision Reviewへは進めない。

## 9. Remaining

- 6 Canonical Axisごとのatomic observation/submetric、Internal/Visual contribution、eligibilityをEvidence Workshopで定義する。
- Formula Spec v2.1とDisplay Metrics Mapping v1.0のProduct Owner / Analysis-Data authority、旧`funnelStrength`から`userFlowQuality`への整合をreviewする。
- Overall 0.55/0.45 confidence-adjusted fusion、market profile、normalization、rounding、thresholdを個別Decision対象にする。
- Backend field/schema、registry、persistence、validation、OpenAPIを後続Backend Discoveryで設計する。
- PD-02DでMissing / Partial aggregation contractを決める。

## 10. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-27 Approval Record](./85-pd02b-axis-order-versioning-explicit-product-owner-approval-record.md)
- [Formula Specification v2.1](../../src/lib/db/role/panoptes_formula_spec_v_2_1_precision_hardened.md)
- [Display Metrics Mapping v1.0](../../src/lib/db/role/panoptes_display_metrics_mapping_spec_v_1_0.md)
- [MVP Spec Final Reviewed v1.0](../../src/lib/db/role/panoptes_mvp_spec_final_reviewed_v_1_0.md)
- [OpenAPI Draft](../api/openapi-draft.yaml)
- [Development Log](../DEVELOPMENT_LOG.md)
