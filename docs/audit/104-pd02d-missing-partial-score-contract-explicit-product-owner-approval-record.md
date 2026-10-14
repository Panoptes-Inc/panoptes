# Phase PD-46 — PD-02D Missing / Partial Score Contract Explicit Product Owner Approval Record

Date: 2026-08-24  
Decision Owner: Product Owner  
PD-02D Contract: `DECIDED / APPROVED`  
Treatment Model B: `DECIDED / APPROVED / V1 DEFAULT TREATMENT MODEL`  
PD-02D Closure: `DECIDED / APPROVED`  
PD-02D Status: `DECISION_COMPLETE`  
PD-02 Parent: `READY_FOR_CLOSURE_REVIEW`  
Implementation: `NOT_IMPLEMENTED`  
Exact Thresholds: `NOT_DECIDED`  
Calibration: `NOT_PERFORMED`

## 1. Approval Evidence

Product Ownerから次の明示承認を受領した。

> 「PD-02DのMissing / Partial Score Contract Proposal、Treatment Model B、およびPD-02D Closure Proposalを承認する。」

- Approval Date: 2026-08-24
- Decision Owner: Product Owner
- Approved subjects: PD-45のMissing / Partial Score Contract Proposal、Treatment Model B、PD-02D Closure Proposal

このEvidenceにより、3対象を未承認Proposalから正式Decisionへ変更する。承認対象外のExact threshold、Calibration、physical schema、implementationを決定済みとは扱わない。

## 2. Approved Completeness, Eligibility, and Score State

- Completenessは`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`。入力、Observation、Resultの完全性状態であり、Score value、Product quality、Eligibilityそのものではない。
- `0 ≠ MISSING ≠ UNKNOWN ≠ NOT_APPLICABLE ≠ PARTIAL`を正式原則とする。
- Calculation Eligibilityは`ELIGIBLE / INELIGIBLE / CONDITIONALLY_ELIGIBLE / UNDETERMINED`。Formula/Profile Rule、Required Evidence Role、runtime stateから解決し、Completenessから1対1変換しない。
- Score Stateは`CALCULATED / NON_CALCULATED`。`NON_CALCULATED`はnumeric valueを持たず、logical reasonを保持する。Reasonのphysical enum representationは後続実装へ渡す。

## 3. Approved Missing, N/A, Unknown, Failure, and Partial Policies

- MISSINGは十分に観測されたscope内のProduct-side Evidence Absenceである。Automatic 0/Penaltyではなく、Score影響はexplicit negative ObservationまたはSubmetric semantic mappingで明示する。Generic Missing Penaltyは`REJECT`。
- NOT_APPLICABLEはEligibility=`INELIGIBLE`をbaselineとし、0/neutral scoreを生成せず、eligible expected denominatorから除外する。
- UNKNOWNは0やProduct absenceへ変換しない。Required inputでは`NON_CALCULATED`候補、Optional/Conditional inputではProfileが明示許可した場合だけlimited calculationを許す。
- Technical Failureは`UNKNOWN`または`PARTIAL + technical reason`とし、MISSING、0、negative evidence、automatic penaltyへ変換しない。Direct numeric penaltyは`REJECT`。
- PARTIALはstate、reason、coverage、lineageで表し、direct numeric penaltyを課さない。Conditional eligibility、coverage gate、separate quality metadataを使い、coverage-adjusted numeric scoringはCalibration後へdeferする。
- Product Absence、Technical Failure、Scope Unknown、Context Not Applicable、Partial Evidenceを相互にsilent conversionしない。

## 4. Approved Evidence Role and Hybrid Denominator

- Definition-time Evidence Roleは`REQUIRED / OPTIONAL / CONDITIONAL / NOT_APPLICABLE`。Runtime Completeness/Eligibilityから分離する。
- Exact Required Evidence SetはProfile/Calibration責務とする。
- Hybrid Denominator Modelを承認する。Expected Coverage DenominatorとNumeric Aggregation Contributor Setを分離し、observed-only denominatorでMissing/Unknownを隠さない。

## 5. Approved Calculation Treatment

- SubmetricはType/Profile-specific Eligibility-aware Calculationをv1 frameworkとする。Required条件不足では`NON_CALCULATED`。Strict Complete-onlyは必要なSubmetricのlocal Profile Policyとして許容する。
- Axisはrequired Submetric条件を満たしたeligible calculated Submetricsを集約し、required/eligible/calculated counts、Completeness、Coverage、Qualityを別保持する。
- Internal/Visual LayerはEligible Axis Aggregationをbaselineとし、required set/minimum count/coverageはVersioned Profileで定義可能にする。
- Normal Overall ScoreはRequired Internal Layer、Required Visual Layer、Approved Fusion Profileが利用可能な場合に生成する。One-layer Overallはexplicit Profile/Version/limitationを要求し、silent fallbackを`REJECT`する。
- Limited calculationは`CALCULATED + PARTIAL + reason / coverage / limitations`で表し、Complete Scoreと無標識で同一表示しない。Exact Presentation Labelは`DEFER`。

## 6. Approved Quality and Failure Boundaries

`Product Quality Score ≠ Observation Quality ≠ Completeness ≠ Confidence ≠ Crawl Coverage`を正式原則とする。

- Generic Missing PenaltyとPARTIAL statusへのdirect penaltyは`REJECT`。
- Semantic Observation failureは`UNKNOWN + TECHNICAL_FAILURE reason`とし、MISSING、0、negative evidenceへ変換しない。
- Deterministic/Semanticの一方だけが利用可能な場合、Profileの明示許可がある場合だけconditional calculationを許す。それ以外は`NON_CALCULATED`。Silent deterministic fallbackは`REJECT`。
- Unknown formulaVersion、unsupported legacy Axis、incompatible Observation Schema、unresolved Profile Revisionでは推測・再計算せず、`NON_CALCULATED + explicit reason`を保持する。
- UNKNOWN、PARTIAL、TECHNICAL_FAILURE、Required input不足にはoptional reanalysis candidate signalを保持可能にする。実workflowはPD-04が所有する。

## 7. Snapshot, Strategy, Comparability, and Explainability

- Snapshot materializationはScore State/value、Completeness、Eligibility、Reason、Coverage、Quality、Formula/Input lineage、limitationsを保持可能にする。Lifecycle/current promotionはPD-04へhandoffする。
- `Score Calculation Eligibility ≠ Snapshot Eligibility ≠ Strategy Source Eligibility`。PD-02DはScore Calculation Eligibility、PD-04はSnapshot/Strategy lifecycleを所有する。
- Partial/Limited ScoreとComplete Scoreを自動比較可能としない。formulaVersion、Profile/Treatment compatibility、Completeness、Coverage contextのexplicit compatibility evidenceを要求する。
- Score ResultはScore State、Completeness、Eligibility、Reason、affected level、required/eligible/calculated counts、Coverage、Quality、Formula Version、Profile、Input lineageから、算出・非算出・limitedの理由を説明可能にする。

## 8. Approved Logical Contract

PD-02D Logical Contractは次を持つ。

- identity / level
- Score State / value
- Completeness / reason
- Eligibility / rule reference
- required / eligible / calculated summaries
- Coverage / Quality Metadata / limitations
- Formula / Profile lineage
- Input lineage
- optional reanalysis signal

Exact JSON、DB、OpenAPI representationは未決定である。

## 9. Treatment Model Disposition

| Model | Final status | Role |
| --- | --- | --- |
| A Strict Complete-only | `KEEP AS LOCAL PROFILE POLICY` | Required Submetric等の局所Profile rule |
| B Eligibility-aware Calculation + Separate Quality Metadata | `DECIDED / APPROVED / V1 DEFAULT TREATMENT MODEL` | PD-02D v1 default |
| C Coverage-adjusted Scoring | `DEFER UNTIL CALIBRATION` | Calibration後のFormula候補 |

## 10. PD-04 Boundary

Snapshot current promotion/lifecycle、Strategy promotion、reanalysis workflow、history retention、usage/billingはPD-04責務を維持する。PD-02Dの承認はこれらのProduct workflowや実装を承認しない。

## 11. Closure and Parent Reassessment

Missing / Partial Score Contract、Treatment Model B、PD-04 responsibility boundaryの承認により、PD-02Dを`DECISION_COMPLETE`とする。

PD-02A=`DECIDED`、PD-02B=`DECIDED / COMPLETE`、PD-02C=`DECISION_COMPLETE`、PD-02D=`DECISION_COMPLETE`となり、定義済みPD-02A〜DのProduct child decisionsはdecision-completeである。したがってPD-02 parentを`READY_FOR_CLOSURE_REVIEW`へ進める。

PD-02 parentは自動`COMPLETE`にしない。次PhaseのParent Closure Reviewでsub-decision scope、deferred calibration/implementation、PD-04 separation、Frontend/API handoffを確認する。

## 12. Non-completion and Deferred Items

- Implementation: `NOT_IMPLEMENTED`
- Exact Thresholds / minimum counts / Required Evidence Set: `NOT_DECIDED`
- Exact Formula Parameters / Calibration Dataset / Formula Calibration: `NOT_DECIDED / NOT_PERFORMED`
- Model C / Presentation Label: `DEFERRED`
- PD-04 workflows、Exact JSON/DB/OpenAPI、Rails/Worker/Frontend implementation: `DEFERRED`

## 13. Scope and Validation

Approval-only / Documentation-onlyとして、Source、Formula、Rails、Worker、DB、OpenAPI、Snapshot implementationを変更せず、repo-wide discoveryとfull quality gateを実施しない。Approval Evidence、PD-02D/parent status、parent artifacts、audit/log、Markdown referencesのみを同期する。

## 14. References

- [PD-45 Decision Review](./103-pd02d-missing-partial-score-contract-decision-review.md)
- [PD-44 Discovery](./102-pd02d-missing-partial-score-contract-discovery.md)
- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Development Log](../DEVELOPMENT_LOG.md)
