# Phase PD-35 — PD-02C Axis Formula Architecture Decision Review

Date: 2026-08-24  
Decision: PD-02C Axis Formula Architecture  
Status: `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`  
Implementation: `NOT_IMPLEMENTED`

## 1. Review Scope and Approval Status

PD-34の3 Candidateを、承認済みObservation Output Contract v1、PD-02B Versioning方針、PD-02D dependencyに照らしてreviewした。Product OwnerのApproval Evidenceは`NOT_PROVIDED`であり、本PhaseではArchitectureを`DECIDED`へ変更しない。

Final CandidateはCandidate C `Layer-first Common Core + Axis-specific Versioned Profiles`。Candidate AはC内のdefault/fallback/initial calibration profile候補、Candidate Bはv1 Architectureとして`REJECT`する。

## 2. Review Dispositions

| Area | Disposition | Review result |
| --- | --- | --- |
| Candidate C architecture direction | `DECIDE NOW` | Common Core + versioned Axis profiles + Layer-first + late fusion |
| Common Core boundary | `DECIDE NOW` | eligibility hook、typed handling、normalization/aggregation envelope、Layer、provenance、version、explainability |
| Axis-specific profile boundary | `DECIDE NOW` | Submetric set、normalization/aggregation method、weight/applicability refsをCore外でversion管理 |
| Submetric-boundary normalization | `DECIDE NOW` | typed Observationをprofile-defined normalized Submetricへ変換 |
| Exact normalization methods/parameters | `KEEP AS PROFILE CANDIDATE` | binary、ratio、coverage、capped linear、robust、semantic mapping |
| Eligibility-aware aggregation framework | `DECIDE NOW` | completeness-aware hookを要求するがstate別score処理は決めない |
| Candidate A equal/eligible mean | `KEEP AS PROFILE CANDIDATE` | Candidate Cのdefault/fallback/initial calibration baseline |
| Future weighted profiles | `KEEP AS PROFILE CANDIDATE` | calibrationとversion lineageを条件に許可 |
| Layer-first processing | `DECIDE NOW` | Observation→Submetric→AxisまでInternal/Visualを分離 |
| Layer Score + Overall late fusion | `DECIDE NOW` | Layerを先に算出し、Overallで初めて統合 |
| 0.55 Internal / 0.45 Visual | `KEEP AS PROFILE CANDIDATE` | `UNAPPROVED CANDIDATE`維持 |
| Confidence separation | `DECIDE NOW` | v1はSeparate Quality Indicator。score modifierにしない |
| Confidence gate/modifier | `DEFER` | calibration/threshold後に再審査 |
| Coverage distinction | `DECIDE NOW` | score対象coverageとcrawl/quality coverageを分離 |
| Deterministic/Semantic separation | `DECIDE NOW` | derived semanticを許可。HYBRID Observation/LLM-only Axis Scoreは禁止 |
| Multi-Axis provenance | `DECIDE NOW` | evidence reuse + semantic aspect separation + lineage保持 |
| Dedup/cap/double-count policy | `DEFER` | Exact algorithm/limitは未決定 |
| Explainability/provenance/version principles | `DECIDE NOW` | historical reconstructionまで要求 |
| Candidate B Axis-first Unified Fusion | `REJECT` | Layer lineage、explainability、auditability、Contract整合が弱い |

## 3. Final Architecture Candidate

```text
Internal Observations              Visual Observations
        ↓                                  ↓
Internal normalized Submetrics    Visual normalized Submetrics
        ↓                                  ↓
Internal Axis Scores              Visual Axis Scores
        ↓                                  ↓
Internal Layer Score              Visual Layer Score
                 ↓ late fusion ↓
                  Overall Score
```

Common Coreが計算envelope、identity、Layer preservation、provenance、version/explainability requirementを定義し、Axis-specific ProfileがSubmetric setとAxis固有のnormalization/aggregation configurationを定義する。

## 4. Common Core Proposal

6 Axis共通Coreへ次を含めるFinal Proposalとする。

- Observation eligibility情報を受け取るhook
- approved typed value handling envelope
- Submetric boundaryでのnormalization contract
- Submetric→AxisおよびAxis→Layer aggregation framework
- Internal/Visual Layer preservationとOverall late fusion
- calculation provenanceとversion references
- Score→Submetric→Observation→Evidenceのtraceability
- missing/partial reasonとhistorical scoreを説明・再現できるrequirement

Axis固有Submetric、normalization method、weight、applicability ruleをCommon Coreへhard-codeしない。

## 5. Axis-specific Versioned Profile Proposal

ProfileはAxis Definitionそのものではなく、決定済みAxis semanticsをscoreへ投影するFormula configurationである。候補内容はSubmetric set、normalization method/reference、aggregation method、weight configuration、applicability rule references。Exact value/parameterはApproval Scope外とする。

Profile changeがscore semanticsを変える場合はnew `formulaVersion`またはそのFormula versionが参照するimmutable profile revisionを必要とする。Axis meaningの変更は`axisContractVersion`であり、Formula profileと混同しない。

## 6. Atomic Observation → Submetric Architecture

Observation Typeとtyped valueに適したprofile-defined normalizationを行い、Submetricを共通0–100 scaleへ変換するArchitectureをFinal Proposalとする。binary ratio、denominator-aware count/ratio、coverage、capped linear、robust normalization、semantic class mappingはprofile candidateであり、Exact method/parameterは未決定である。

Raw Observationを一律に0–100へ変換せず、Submetric definitionがunit、direction、denominator、reference、semantic class mappingを所有する。Presentation clampはBusiness normalizationではない。

## 7. Submetric → Axis Architecture

Eligibility-aware aggregation frameworkをFinal Proposalとする。Candidate AのEqual Mean / eligible meanはCandidate C内のdefault/fallback/initial calibration profile候補とし、独立した最終Architectureにはしない。将来はcalibration根拠とversion lineageを伴うweighted profileを許可する。

Weight未確定でもArchitecture boundaryは承認可能である。Common Coreはeligible inputsとdenominatorを受け取れることだけを要求し、`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`の除外・再正規化・penaltyはPD-02Dで決める。

## 8. Internal / Visual, Layer Score, and Late Fusion

Internal/VisualをObservation、Submetric、Axis Scoreまで別系統で保持する。途中統合を行わず、6 AxisからInternal Layer ScoreとVisual Layer Scoreを個別に算出し、Overallで初めてlate fusionする。

Layer Scoreのbaselineはeligible-axis mean profile候補、将来拡張はversioned weighted layer profile。Canonical OrderはWeight/importanceを意味しない。Overallのexact ratio、confidence/completeness adjustment、dynamic weightingは未決定で、0.55/0.45は`UNAPPROVED CANDIDATE`を維持する。

## 9. Confidence and Coverage Policy Proposal

v1 ArchitectureではConfidenceをScoreの直接Weight Modifierにせず、Separate Quality IndicatorとするFinal Proposalとする。Calibration後のEligibility GateまたはWeight Modifierは`DEFER`し、採用時はFormula Version変更対象とする。

Coverageは次の2種類を分離する。

- Product qualityを直接測るcoverage Submetric: profile定義によりdirect score componentとなり得る。
- Crawl completeness / observation availability: quality metadataまたはeligibility input。content weaknessへ自動変換しない。

## 10. Semantic / Deterministic and Multi-Axis Rule

Deterministic ObservationとSemantic Observationを分離し、必要な場合はdeterministic inputを参照するderived semantic Observationを生成する。HYBRID ObservationとLLM-only Axis Scoreはv1 Architectureから`REJECT`する。

Evidence reuse=`ALLOWED`、semantic aspect=`MUST_BE_SEPARATED`をFormulaでも維持する。`evidenceId`、`semanticAspect`、`derivedFromObservationIds`を保持し、後続dedup/contribution policyを適用可能にする。Contribution cap、dedup algorithm、double-count preventionは`DEFER`する。

## 11. Explainability Principle

Final Proposalは最低限次を満たす。

- Axis Scoreからinput Observation/Evidenceまで追跡可能
- Submetric、Axis、Layer、Overallの各contributionを追跡可能
- Formula/Profile/Axis/Pipeline/Observation versionsを識別可能
- Missing/Partial/coverage理由を説明可能
- historical scoreを生成時contractで再現可能
- semantic judgmentをclassifier/rationale/provenanceへ遡及可能

## 12. Formula Provenance Proposal

Minimum logical contract:

- `formulaVersion`
- `axisContractVersion`
- `observationSchemaVersion`
- `analysisPipelineVersion`
- Axis profile reference/version
- normalization/aggregation/fusion profile references
- input Observation IDs / Submetric IDs
- completeness / coverage context
- `calculatedAt`
- output identity、Axis ID、Layer、raw/normalized distinction
- AnalysisJob / Score artifact / Snapshot linkage

Exact field name、JSON shape、DB/OpenAPI representationは未決定である。

## 13. Formula Version Boundary

New Formula Version対象ProposalはWeight、Normalization method/parameter/reference、Aggregation、Eligibility handling、Confidence handling、score-level threshold、business rounding、Layer fusion、Axis profile behaviorのsemantic changeである。

CSS、display-only formatting、presentation safety clamp、label layout、formula-preserving refactorはFormula Version対象外とする。Axis meaning changeはAxis Contract、persisted shape changeはSnapshot/Backend schema lineageへ分離する。

## 14. Backend Handoff

Architecture承認後のBackend ContractはformulaVersion、profile references、Submetric Score、Axis Score、Internal/Visual Axis Score、Layer Scores、Overall Score、raw/normalized distinction、provenance、completeness、coverage、input lineageを運ぶ必要がある。

Organization/Project/AnalysisJob/Snapshot ownership、immutable historical reconstruction、registry/profile resolution、validationも必要になるが、DB Schema、JSON Schema、OpenAPI、Rails/Worker実装は本Proposalに含めない。

## 15. Deferred and Rejected Items

Deferred: Exact Submetric/Axis Weight、Internal/Visual ratio、normalization parameter、threshold、rounding constant、Missing/Partial treatment、confidence calibration/gate/modifier、dedup、double-count cap、DB/JSON/OpenAPI、Rails/Worker implementation。

Rejected from v1 Architecture: Candidate B Axis-first Unified Fusion、early Layer fusion、HYBRID Observation、LLM-only Axis Score、array/position identity、Presentation clampのBusiness Formula化。

## 16. Approval Proposal and Readiness

Product Owner Approval Scope:

1. Common Core
2. Axis-specific Versioned Profiles
3. Layer-first processing
4. Layer Score後のOverall late fusion
5. Explainability requirement
6. Formula provenance requirement
7. Formula Version boundary
8. Deterministic/Semantic separation
9. ConfidenceをSeparate Quality Indicatorとするv1 direction
10. Eligibility/Missing/PartialをPD-02Dへ分離するboundary

Axis Formula Architectureは`READY_FOR_APPROVAL / NOT_APPROVED`。PD-02CとPD-02 parentは`NEEDS_DISCOVERY`、PD-02Dは`BLOCKED`、Implementationは`NOT_IMPLEMENTED`を維持する。

## 17. References

- [PD-34 Formula Candidate Discovery](./92-pd02c-axis-formula-candidate-discovery.md)
- [PD-33 Observation Contract Approval](./91-pd02c-observation-output-contract-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Formula Specification v2.1](../../src/lib/db/role/panoptes_formula_spec_v_2_1_precision_hardened.md)
- [Development Log](../DEVELOPMENT_LOG.md)
