# Phase PD-39 — PD-02C Formula Profile / Parameter Policy Explicit Product Owner Approval Record

Date: 2026-08-24  
Decision: PD-02C Formula Profile / Parameter Policy  
Status: `DECIDED / APPROVED`  
Exact Formula Parameters: `NOT_DECIDED`  
Implementation: `NOT_IMPLEMENTED`

## 1. Approval Evidence

Product Ownerから2026-08-24に次の明示承認を受領した。

> PD-02CのFormula Profile / Parameter Policy Proposalを承認する。

Decision OwnerはProduct Ownerである。承認対象はPD-38 Final ProposalのParameter決定・変更・version管理原則であり、Exact Weight、ratio、normalization parameter、threshold、rounding value、Missing/Partial処理、Dataset構築、Backend/Worker実装を含まない。

## 2. Approved Core Policy

Panoptes v1 Formula Profile / Parameter Policyとして次を正式承認する。

- Calibration-first
- Typed / Submetric-specific Normalization
- Non-dynamic Layer Fusion
- Confidence / Observation Quality Separation
- Immutable Formula / Profile Versions
- Silent Fallback Prohibition
- Global Baseline for v1
- Eligibility treatmentをPD-02Dへ委譲

## 3. Approved Parameter Taxonomy and Authority

ParameterをStructural、Numeric、Presentation、Calibrationへ分類する。

- Architecture / Method: Product Decision + Analysis/Data Contract。
- Numeric Parameter: Calibration Dataset + Statistical Evaluation + Domain Review。
- Eligibility treatment: PD-02D。
- Presentation-only parameter: Presentation Rule。

Product OwnerはDecision Ownerだが、主観だけでWeight、ratioその他のProduction Numeric Parameterを決定しない。

## 4. Approved Initial Baseline and Weight Policy

Equal / Eligibility-aware Baselineを`UNCALIBRATED CALIBRATION BASELINE`とする。これは最適値またはcalibrated production valueではなく、temporary baselineとinitial calibration referenceである。BaselineにもFormula/Profile identity、calibration status、limitationsを付け、historical reconstructionを可能にする。

Submetric WeightはEqual baseline→representative calibration→必要な場合のみnon-equal WeightというDirectionを採用する。Non-equal WeightはCalibration Evidenceとversioned approvalなしにProduction defaultへ昇格しない。

Canonical Order ≠ Weight ≠ Importance ≠ Priorityを維持する。Axisはequal/eligible-axisまたはno explicit Axis WeightをCalibration Baseline候補とし、non-equal Axis Weightはcalibration/versioned Formulaなしに採用しない。

## 5. Approved Internal / Visual Fusion Policy

v1はNon-dynamic Fixed Fusion Directionを採用する。Dynamic weightingはdeferする。Exact ratio、calibration-derived ratio、confidence adjustment、completeness adjustmentは未決定で、0.55 Internal / 0.45 Visualは`UNAPPROVED CANDIDATE`を維持する。

承認ratioがない状態でOverall production scoreをsilent生成しない。

## 6. Approved Normalization Policy

NormalizationはValue Type + Submetric Definitionに応じて選択し、一律Normalizationを採用しない。Binary、ratio、linear、capped linear、logistic、robust、semantic class mappingはmethod候補であり、Exact assignmentは未決定である。

Parameterをstatic、profile-specific、calibration-derived、dataset-specificへ分類可能にする。Calibration Dataset更新だけでpublished Formula Parameterを暗黙変更せず、semantic changeではnew Profile revision + new Formula Versionを作成する。

## 7. Approved Calibration Dataset, Ground Truth, and Human Evaluation Policy

Calibration Datasetにはindustry、business/site type、company size、B2B/B2C、sales motion、page volume、content density、Internal/Visual availability、crawl availabilityの代表性と、provenance、leakage control、held-out evaluationを要求するPolicyを採用する。

Primary Ground TruthはObservable-site rubric、multi-reviewer evaluation、blind pairwise comparison。Expert adjudicationはSupporting、CTR/CVR/sales outcome等はSecondary Validationとする。External outcomeまたはsingle reviewerだけをPrimary Ground Truthにしない。Reviewer disagreementもCalibration lineageへ保持可能にする。

## 8. Approved Threshold and Rounding Taxonomy

Product Interpretation、Formula Eligibility、Confidence/Quality、UI Color Thresholdを別Contractとし、同一thresholdを複数責務へ流用しない。Exact thresholdは未決定である。

Storage Precision、Business Rounding、Presentation Roundingを分離する。内部精度を保持し、Presentation Roundingだけの変更ではFormula Versionを変更しない。Canonical score semanticsへ作用するBusiness RoundingはFormula Version対象である。

## 9. Approved Confidence, Coverage, and Eligibility Boundary

Confidenceはv1でSeparate Quality Indicatorを維持する。Weight Modifier、Eligibility Gate、Dynamic Fusion、Confidence Threshold、Calibration Methodはdeferする。

Product/Content CoverageはSubmetric componentになり得る。Observation/Crawl CoverageはQuality/Completeness Metadataとして扱い、`crawl不足 ≠ product quality低下`を正式原則とする。

Formula Profileは`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`を参照可能にするが、state別Score TreatmentはPD-02Dへ委譲し、Parameter Policy側で独自決定しない。

## 10. Approved Formula Version and Immutability Policy

Published `formulaVersion`をhistorical comparison上のCanonical Formula Identityとする。formulaVersionは実際に使用したimmutable Profile revisionを一意に解決し、Profile reference/versionを第二の比較Source of Truthにしない。

Published Formula/Profileは`IMMUTABLE`。Calibration後の変更はexisting version mutationではなくnew Profile revision + new Formula Versionで行い、historical reconstructionを維持する。

## 11. Approved Fallback and Context Policy

Equal/Eligibility-awareはtemporary calibration baselineである。Non-equal weight、unapproved fusion ratio、semantic mapping、context-specific weightをCalibration/ApprovalなしにProduction defaultへしない。

未承認・未Calibration・Unknown Parameterを既知の別Parameterへsilent substitutionしない。Unsupported、Unknown、Uncalibrated、Not Applicable状態を隠してScore生成しない。Exact status contractは未決定である。

Industry-specific Profilesはv1で`DEFER`。v1はGlobal Baseline Directionとし、将来はGlobal Core + Limited Contextual Applicability Rulesをcandidateとする。Context-specific Weight/ProfileはCalibration Evidenceなしに導入しない。

## 12. Approved Registry and Explainability Direction

Logical Formula/Profile Registryはidentity、formulaVersion、lifecycle、Axis/Submetric references、normalization、aggregation、weights、applicability、fusion、calibration lineage、approval/effective metadataを保持可能にする。

Formula/Profile/Parameterはsource、rationale、Calibration Dataset version、evaluation result、approvedAt、approvedBy role、effectiveFrom、change reason、compatibility、limitations、supersedesを保持可能にする。Exact JSON/DB schemaは未決定である。

## 13. Status Transition and Deferred Items

Formula Profile / Parameter Policyは`REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`から`DECIDED / APPROVED`へ遷移した。Exact Formula Parameters=`NOT_DECIDED`、Implementation=`NOT_IMPLEMENTED`を維持する。

Deferred:

- Exact Submetric / Axis Weight
- Exact Internal / Visual Ratio
- Exact Normalization Parameter / Threshold / Business Rounding Value
- Missing / Partial Score Treatment
- Calibration Dataset Construction / Confidence Calibration
- Dynamic Fusion / Dedup / Double-count Rule
- Industry / Context Profile implementation
- DB / JSON Schema / OpenAPI
- Rails / Worker implementation

## 14. PD-02C Status and Remaining Work

PD-02CとPD-02 parentは`NEEDS_DISCOVERY`、PD-02Dは既存の`BLOCKED`を維持する。Policy承認だけでPD-02Cをcompleteにしない。

Remaining:

- Exact Formula Parameter Calibration
- Internal / Visual Exact Fusion Profile
- Formula Version Concrete Representation
- Backend Wire Contract
- DB / OpenAPI Contract
- Formula Provenance Wire Representation
- PD-02D Eligibility Treatment

## 15. Validation and References

Approval-only / Documentation-onlyとしてApproval Evidence、Approval Date、Decision Owner、status transition、approved/deferred boundaries、parent/audit/log referencesを確認した。Source、Rails、Worker、OpenAPI変更およびfull quality gate実行は行っていない。

- [PD-38 Parameter Policy Decision Review](./96-pd02c-formula-profile-parameter-policy-decision-review.md)
- [PD-37 Parameter Policy Discovery](./95-pd02c-formula-profile-parameter-policy-discovery.md)
- [PD-36 Architecture Approval](./94-pd02c-axis-formula-architecture-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Development Log](../DEVELOPMENT_LOG.md)
