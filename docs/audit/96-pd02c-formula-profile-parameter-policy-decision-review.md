# Phase PD-38 — PD-02C Formula Profile / Parameter Policy Decision Review

Date: 2026-08-24  
Decision: PD-02C Formula Profile / Parameter Policy  
Status: `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`  
Exact Formula Parameters: `NOT_DECIDED`  
Implementation: `NOT_IMPLEMENTED`

## 1. Review Scope and Approval Status

PD-37のParameter Policy Candidateを、承認済みCandidate C Architecture、PD-02B Hybrid Versioning、Observation Contract、PD-02D dependencyに照らしてreviewした。Product OwnerのApproval Evidenceは`NOT_PROVIDED`であり、本PhaseではPolicyを`DECIDED`へ変更しない。

Exact Weight、ratio、normalization parameter、threshold、business rounding value、Missing/Partial処理、Dataset構築、Backend/Worker実装はApproval Scope外である。

## 2. Review Dispositions

| Area | Disposition | Review result |
| --- | --- | --- |
| Structural/Numeric/Presentation/Calibration taxonomy | `DECIDE NOW` | method、value、display、fitted valueを分離 |
| Parameter authority boundary | `DECIDE NOW` | Product/Analysis、Dataset/Statistics、PD-02D、Presentationへ責務分離 |
| Product Owner preference-only numeric decision | `REJECT` | weight/ratioの十分な根拠ではない |
| Equal/Eligibility-aware baseline status | `DECIDE NOW` | `UNCALIBRATED CALIBRATION BASELINE` |
| Equal baseline profile values | `KEEP AS CALIBRATION CANDIDATE` | 最適値/production approvedとみなさない |
| Equal→calibrated Submetric weight direction | `DECIDE NOW` | non-equal production weightはcalibration後 |
| Expert-only primary default | `REJECT` | biasと再現性risk |
| Canonical Order-derived Axis weight | `REJECT` | Order≠Weight≠Importance≠Priority |
| Equal/no-explicit Axis weight baseline | `KEEP AS CALIBRATION CANDIDATE` | v1 calibration starting point |
| Non-dynamic fixed Layer fusion direction | `DECIDE NOW` | stability/comparabilityを優先 |
| Fixed ratio values including 0.55/0.45 | `KEEP AS CALIBRATION CANDIDATE` | Exact ratioは未承認 |
| Dynamic fusion | `DEFER` | confidence/completeness calibration後に再審査 |
| Typed/Submetric-specific normalization | `DECIDE NOW` | profile-managed method family |
| One-size-fits-all normalization | `REJECT` | type/unit/denominator semanticsを破壊 |
| Exact method assignment/parameters | `KEEP AS CALIBRATION CANDIDATE` | dataset/evaluation待ち |
| Dataset representativeness + held-out evaluation | `DECIDE NOW` | calibration minimum requirement |
| Observable rubric + multi-reviewer + blind pairwise | `DECIDE NOW` | primary Ground Truth policy |
| External outcome as primary Ground Truth | `REJECT` | Axis observable-site semanticsと不整合 |
| Threshold and rounding taxonomies | `DECIDE NOW` | Product/eligibility/confidence/UI、storage/business/presentationを分離 |
| Confidence separate / Crawl Coverage separate | `DECIDE NOW` | v1 score modifierにしない |
| Confidence gate/modifier/calibration | `DEFER` | evidence/threshold不足 |
| Eligibility treatment | `DEFER TO PD-02D` | Profileはstate referenceのみ保持 |
| formulaVersion canonical identity | `DECIDE NOW` | immutable Profile revisionsを一意解決 |
| Published mutation | `REJECT` | historical reconstructionを破壊 |
| Silent parameter substitution | `REJECT` | unsupported/unknownを隠す |
| Industry-specific Profile in v1 | `DEFER` | dataset不足、overfit、version explosion |
| Global baseline for v1 | `DECIDE NOW` | Context weightsはcalibration後 |
| Limited Context Hybrid | `KEEP AS CALIBRATION CANDIDATE` | future segmented evidence待ち |
| Logical registry + explainability metadata | `DECIDE NOW` | exact DB/JSONはdefer |

## 3. Final Parameter Policy Proposal

Panoptes v1 Formula Parameter Policyは次をFinal Proposalとする。

1. Equal/Eligibility-awareはuncalibrated baselineであり最適値ではない。
2. Non-equal Weightはrepresentative calibrationとversioned approval後だけproduction candidateにする。
3. NormalizationはValue Type/Submetric別に選び、一律methodを禁止する。
4. v1 Layer fusionはnon-dynamic fixed policyとし、Exact ratioは別Decisionとする。
5. ConfidenceはSeparate Quality Indicatorとし、Crawl Coverageをscoreへ直接混入しない。
6. Published Formula/Profileはimmutableで、formulaVersionをhistorical comparison上のCanonical Formula Identityとする。
7. 未承認・未Calibration・unknown parameterのsilent fallbackを禁止する。
8. v1はGlobal baselineとし、Industry/Context-specific profileはdeferする。
9. Missing/Partial eligibility treatmentはPD-02Dへ委譲する。
10. Exact parameterにはdataset、evaluation、rationale、approval、effective lineageを要求する。

## 4. Parameter Taxonomy and Authority Proposal

- Structural: aggregation/normalization/eligibility/fusion method。
- Numeric: weight/ratio/cap/slope/midpoint/threshold。
- Presentation: display rounding/clamp/layout/color等のscore非変更parameter。
- Calibration: Dataset/EvaluationからfitされるNumeric/Structural selection。

Architecture/method familyはProduct Decision + Analysis/Data Contract、Numeric valueはCalibration Dataset + Statistical Evaluation + Domain Review、Eligibility treatmentはPD-02D、technical storage precisionはBackend constraint、display-only ruleはPresentation Contractを主根拠とする。Product OwnerはAccountableだが、好みだけをnumeric evidenceにしない。

## 5. Initial Baseline and Weight Policy Proposal

Candidate A Equal/Eligibility-awareを`UNCALIBRATED CALIBRATION BASELINE`として扱う。Baselineにもimmutable Formula/Profile identity、calibration status、limitationsを付け、calibration後は既存versionを上書きしない。

Submetric WeightはEqual baseline→Calibration-derived laterをPolicy方向とする。Non-equal weightはrubric alignment、multi-reviewer ground truth、held-out performance、stability/sensitivity、bias reviewを満たした場合だけproduction candidateとする。

AxisはCanonical Orderからweightを導出せず、v1 baselineではequal/eligible-axisまたはno explicit Axis Weightを候補とする。Exact choice/valueはCalibration Candidateである。

## 6. Internal / Visual Fusion Proposal

v1はnon-dynamic fixed fusion policyを優先する。Exact ratioは未決定で、Fixed Equal、Fixed Unequal、Calibration-derived Fixedを`KEEP AS CALIBRATION CANDIDATE`とする。0.55/0.45は`UNAPPROVED CANDIDATE`を維持する。

Dynamic fusion、confidence/completeness adjustmentはhistorical comparability、gaming、calibration、implementation complexityが高いため`DEFER`する。承認ratioがないOverall production scoreをsilent生成しない。

## 7. Normalization Method and Parameter Proposal

BOOLEAN、COUNT、NUMBER、RATIO、ENUM、TEXT、SEMANTIC_CLASSIFICATION、STRUCTUREDのValue TypeとSubmetric semanticsに応じてbinary、ratio、linear、capped linear、logistic、robust、semantic class mappingをprofileで選ぶ。一律Normalizationは`REJECT`する。

Parameterをstatic、profile-specific、calibration-derived、dataset-specificへ分類する。Dataset version変更だけでpublished parameterを暗黙変更せず、semantic changeはnew Profile revision + new Formula Versionでpublishする。Exact assignment/valueは未決定である。

## 8. Calibration Dataset, Ground Truth, and Human Evaluation Proposal

Calibration Datasetはindustry、site/business type、company size、B2B/B2C、sales motion、page volume、content density、Internal/Visual availability、crawl availabilityを代表し、provenance、duplicate/leakage control、training/tuning/held-out split、rubric/versionを持つことをminimum candidateとする。

Ground TruthはObservable-site rubric + multi-reviewer evaluation + blind pairwise comparisonをPrimary、expert adjudicationをSupporting、CTR/CVR/sales outcomeをSecondary Validationとする。Single reviewerまたはexternal outcomeだけをGround Truthにしない。Reviewer disagreement、agreement metric、adjudication、uncertaintyをlineageへ保持する。

## 9. Threshold and Rounding Policy Proposal

Product Interpretation、Formula Eligibility、Confidence/Quality、UI Color Thresholdを別Contractとし、同一thresholdを兼用しない。Eligibility thresholdはPD-02D、UI thresholdはscore semanticsを変えない限りPresentation側で扱う。

Storage Precision、Business Rounding、Presentation Roundingを分離する。Internal/storage precisionを維持し、Presentation roundingだけではFormula Versionを変更しない。Canonical scoreへ作用するBusiness roundingはFormula Version対象である。

## 10. Confidence, Coverage, and Eligibility Proposal

Confidenceは承認済みArchitectureどおりSeparate Quality Indicatorを維持し、Weight Modifier、Eligibility Gate、Dynamic Fusion、threshold/calibrationは`DEFER`する。

Product/Content CoverageはSubmetric candidate、Observation/Crawl Coverageはquality/completeness metadataとする。`crawl不足 ≠ product quality低下`を正式原則候補とする。

Formula Profileは`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`のrule referenceを持つが、state別score treatmentはPD-02Dへ委譲し、Parameter Policy側で先決しない。

## 11. Formula Version and Immutability Proposal

Published `formulaVersion`をhistorical comparison上のCanonical Formula Identityとし、使用したimmutable Profile revisionsを一意に解決する。Profile reference/versionを第二の比較Source of Truthにしない。

Weight、ratio、normalization/aggregation/eligibility/fusion、business threshold/roundingのsemantic changeはnew Profile revision + new Formula Version候補である。Published Formula/Profileは`IMMUTABLE`で、calibration後もmutationせずhistorical reconstruction metadataを保持する。

## 12. Fallback and Silent Substitution Proposal

Equal/Eligibility-awareはtemporary calibration baselineであり、approved production optimumではない。Non-equal weight、unapproved fusion ratio、semantic mapping、context-specific weightをCalibrationなしでproductionへsilent採用しない。

Parameterが未承認、未Calibration、不明、適用不能の場合はsilent substitutionせず、`UNCALIBRATED / UNSUPPORTED / UNKNOWN / NOT_APPLICABLE`等を明示可能にする。Exact status enumは別Contractで決められるが、silent fallback prohibition自体は`DECIDE NOW` Proposalとする。

## 13. Global / Context / Industry Profile Proposal

v1はGlobal baselineを採用候補とする。Industry-specific Profileはdataset不足、overfit、version explosion、explainability complexityにより`DEFER`する。Global Core + limited contextual applicability rulesは将来の`KEEP AS CALIBRATION CANDIDATE`であり、Context Profileを無制限に増やさない。

Context-specific Weightはsegmented representative dataset、profile selection provenance、held-out improvement、cross-context comparability reviewなしに採用しない。

## 14. Parameter Registry and Explainability Proposal

Logical Registryはidentity、formulaVersion、lifecycle、Axis/Submetric refs、normalization、aggregation、weights、applicability、fusion、calibration lineage、approval/effective metadataを保持可能にする。

各Parameter/Profileへsource、rationale、Calibration Dataset version/fingerprint、evaluation result、approvedAt、approvedBy role、effectiveFrom、change reason、compatibility、limitations、supersedesを保持する。Exact JSON/DB/OpenAPIは未決定である。

## 15. Deferred and Rejected Items

Deferred: Exact Submetric/Axis Weight、Internal/Visual ratio、normalization parameter、threshold、business rounding value、Missing/Partial treatment、Dataset construction、confidence calibration、dynamic fusion、Dedup/double-count、Industry/Context profiles、DB/JSON/OpenAPI、Rails/Worker implementation。

Rejected: Product Owner preference-only numeric decision、Expert-only primary default、Canonical Order-derived weight、one-size normalization、external outcome-only ground truth、published mutation、silent parameter substitution、uncalibrated non-equal/context weightのproduction default。

## 16. Readiness and Remaining PD-02C

Formula Profile / Parameter Policyは`REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`。Approval Evidenceがないため`DECIDED`へ変更しない。Exact Formula Parameters=`NOT_DECIDED`、Implementation=`NOT_IMPLEMENTED`。

PD-02CとPD-02 parentは`NEEDS_DISCOVERY`、PD-02Dは`BLOCKED`を維持する。Remaining:

- Exact Formula Parameter calibration
- Internal / Visual exact fusion profile
- Formula Version concrete representation
- Backend Wire Contract
- DB / OpenAPI Contract
- Formula provenance wire representation
- PD-02D Missing / Partial eligibility treatment

## 17. References

- [PD-37 Parameter Policy Discovery](./95-pd02c-formula-profile-parameter-policy-discovery.md)
- [PD-36 Architecture Approval](./94-pd02c-axis-formula-architecture-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Formula Specification v2.1](../../src/lib/db/role/panoptes_formula_spec_v_2_1_precision_hardened.md)
- [Development Log](../DEVELOPMENT_LOG.md)
