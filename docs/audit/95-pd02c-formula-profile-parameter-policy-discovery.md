# Phase PD-37 — PD-02C Formula Profile / Parameter Policy Discovery

Date: 2026-08-24  
Decision: PD-02C Formula Profile / Parameter Policy  
Status: `DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`  
Architecture: `DECIDED / APPROVED`  
Exact Formula Parameters: `NOT_DECIDED`  
Implementation: `NOT_IMPLEMENTED`

## 1. Scope and Evidence Boundary

承認済みCandidate C Architectureを前提に、Formula/Profileが管理すべきparameter、authority、initial baseline、calibration、versioning、immutability、fallback、registry、explainabilityを整理した。Exact Weight、ratio、cap、slope、midpoint、threshold、rounding digits、Missing/Partial score treatmentは決定していない。

Formula Specification v2.1の0.55/0.45、market profile、threshold、confidence formulasは`DOCUMENTED_CANDIDATE / UNAPPROVED`であり、parameter正本へ昇格しない。Calibration Datasetの収集・評価、Source、Backend、Worker、OpenAPI実装も行っていない。

## 2. Parameter Taxonomy

| Taxonomy | Examples | Contract / version implication |
| --- | --- | --- |
| Structural Parameter | aggregation method、normalization method、eligibility behavior、fusion method | score semanticsを変えるためFormula/Profile contract対象 |
| Numeric Parameter | weight、ratio、cap、floor、slope、midpoint、percentile、threshold | valueと根拠、scale/unitをimmutable profileへ固定 |
| Presentation Parameter | display rounding、presentation clamp、label/color boundary | scoreを変えない限りFormula Version対象外 |
| Calibration Parameter | fitted cap/slope/distribution、calibrated weight/threshold | dataset/evaluation lineageと新versionが必要 |

Structural choiceとNumeric valueを分離し、method approvalだけからparameter valueを推測しない。Business rounding/thresholdはFormula semantics、UI-only rounding/colorはPresentation semanticsとして分離する。

## 3. Parameter Authority

| Parameter area | Primary evidence/authority candidate | Guardrail |
| --- | --- | --- |
| Architecture/method family | Product + Analysis/Data Formula Contract | Product preferenceだけでnumeric valueを決めない |
| Weight/ratio/normalization parameter | Calibration Dataset + Statistical Evaluation + domain review | reproducibility、bias、held-out evaluationを要求 |
| Applicability/eligibility | PD-02D Product Contract + Formula reference | missingを0へ暗黙変換しない |
| Semantic class mapping | rubric + multi-reviewer evaluation + classifier calibration | model outputをground truthにしない |
| Technical bounds/storage precision | Analysis/Data + Backend technical constraint | Product score meaningを技術都合で変更しない |
| Presentation rounding/clamp/color | Presentation Rule + Design/Product review | canonical scoreをmutationしない |
| Published release | Product Owner approval with Analysis/Data recommendation | dataset/version/rationaleを記録 |

Decision Owner、Analysis/Data Owner、Backend/API/Architecture Owner、Product Design/Frontendの役割はDecision Reviewで正式化する。Product Owner単独の好みをweight/ratioの根拠にしない。

## 4. Initial Baseline Policy

Candidate A Equal / Eligibility-aware Baselineは`UNCALIBRATED CALIBRATION BASELINE`候補とする。Equalは「最適」「重要度が同じ」というProduct claimではなく、非恣意的な比較開始点である。

- baselineにもimmutable Formula/Profile versionとstatusを付ける。
- calibrated/approved production profileと明示区別する。
- calibration後は既存versionを上書きせずnew versionを生成する。
- unapproved baselineをproduction-trustworthy scoreとして表示しない。
- historical artifactは生成時baseline versionを保持する。

## 5. Submetric Weight Policy

| Option | Explainability | Bias risk | Data / cost | Versioning | Finding |
| --- | --- | --- | --- | --- | --- |
| A: Initial Equal | High | hidden equal-importance assumption | Low | simple | calibration baseline候補 |
| B: Expert-defined | Medium–High | expert/authority bias | Medium | rationale必須 | evidence seed候補、final根拠には不足 |
| C: Calibration-derived | Medium | dataset bias/overfit | High | dataset lineage必須 | target policy候補 |
| D: Equal baseline → calibrated | High | staged risk control | High over time | clear transition | `RECOMMENDED` |

推奨PolicyはD。Non-equal weightはobservable rubric、multi-reviewer evaluation、held-out stability、sensitivity analysisを通じて採用候補とする。

## 6. Axis and Layer Weight Policy

Canonical Order ≠ Weight ≠ Importanceを維持する。6 Axisはconceptually independentであり、positionからweightを導出しない。

Axis/Layer候補:

- equal/eligible-axis mean: uncalibrated baseline candidate。
- no direct Axis Weight: Axisを個別表示し、Overall/Layerだけ別policyで扱う候補。
- global profile-specific weights: evidenceが揃った場合のversioned candidate。
- context/calibration-derived weights: dataset/overfit/version complexityが高くdefer candidate。

v1初期方針候補はglobal equal/eligible baselineであり、non-equal Axis/Layer weightはcalibration前に採用しない。

## 7. Internal / Visual Fusion Policy

| Candidate | Explainability / stability | Calibration | Risk / complexity | Finding |
| --- | --- | --- | --- | --- |
| Fixed Equal | High | symmetry baselineだけ | evidence差を表せない | calibration candidate |
| Fixed Unequal | High | rationale/evaluation必須 | unsupported bias | 0.55/0.45は未承認維持 |
| Calibration-derived Fixed | High–Medium | representative data必須 | dataset drift | preferred target candidate |
| Dynamic | Low–Medium | confidence/completeness calibration必須 | gaming、comparability、complexity | v1 defer |

推奨Policyはnon-dynamic fixed fusionをv1対象とし、valueはDecision/Calibration後にversioned profileへ固定する。承認ratioがない状態のOverall production scoreは`UNSUPPORTED`とし、equal fusionはcalibration baseline候補に限定する。

## 8. Normalization Method Policy

| Observation value type | Method candidates | Policy finding |
| --- | --- | --- |
| BOOLEAN | direct binary、eligible binary ratio | presenceとqualityを混同しない |
| COUNT | denominator-aware ratio、capped linear、robust | raw count単独を避ける |
| NUMBER | linear、capped linear、logistic、robust | unit/direction/rangeをprofile化 |
| RATIO | bounded ratio、linear/range mapping | denominator unknownを0にしない |
| ENUM | versioned class mapping | registry/rubric lineage必須 |
| TEXT | direct numeric scoreにしない | derived semantic Observationへ送る |
| SEMANTIC_CLASSIFICATION | versioned semantic class mapping | labeled calibration、confidence別管理 |
| STRUCTURED | typed feature derivation後にnormalize | untyped JSONを直接score化しない |

全typeへ一律normalizationを適用せず、Submetric Profileがmethod family、direction、denominator/reference requirementを宣言する。

## 9. Normalization Parameter Policy

- `static`: mathematical bounds、unit constraints、closed enum semantics等。意味がcontract上固定できるもの。
- `profile-specific`: direction、cap/floor policy、method selection、applicable reference type。
- `calibration-derived`: cap、slope、midpoint、percentile、class boundary、reference distribution。
- `dataset-specific`: fitted distribution/sample metadata。Published profileからdataset versionを参照し、runtimeで暗黙再推定しない。

Calibration-derived valueはdataset fingerprint/version、sample scope、evaluation result、effective lifecycleを伴う。Live dataset変化でpublished score semanticsを自動変更しない。

## 10. Calibration Dataset Requirements

Datasetは少なくともindustry、site/business type、company size、B2B/B2C、self-service/enterprise、page volume、content density、Internal/Visual availability、crawl completenessを層別化できる必要がある。

さらにPanoptes target market representativeness、minority/context coverage、time period、data provenance、duplicate/leakage control、training/tuning/held-out split、review rubric/version、historical reconstructionを要求候補とする。Industry-specific profileは各segmentで十分なsampleとheld-out evidenceがあるまで作らない。

## 11. Ground Truth and Human Evaluation

Primary calibration targetはobservable-site rubricに基づくmulti-reviewer evaluationとblind pairwise comparisonの組み合わせを推奨する。単一Product Owner評価や単一expertだけをground truthにしない。

- rubric-based scoring: Axis Definitionとobservable boundaryへ整合。
- multi-reviewer consensus: reviewer biasを低減。
- blind pairwise comparison: absolute scale driftを検出。
- expert adjudication: unresolved disagreementを理由付きで処理。
- external outcomes: CTR/CVR/revenueはsecondary validation candidateであり、Axis meaningの中心ground truthにしない。

Reviewer disagreementは消去せず、raw ratings、agreement metric、adjudication、uncertaintyをcalibration lineageへ保持する。

## 12. Threshold Policy

| Threshold type | Purpose | Version boundary |
| --- | --- | --- |
| Product interpretation | score band/meaning | Product/Formula semantic change候補 |
| Formula eligibility | input inclusion/gate | PD-02D + Formula Version対象候補 |
| Confidence/quality | warning/review/recalculation | v1はScoreから分離。quality policy version候補 |
| UI color/presentation | visual emphasis | score meaningを変えない限りPresentation対象 |

各thresholdにunit、direction、inclusive/exclusive boundary、unknown behavior、source/rationaleを要求する。Exact bandsは未決定である。

## 13. Rounding and Precision Policy

- Storage Precision: canonical calculation/reconstructionに必要なprecisionを保持する。
- Business Rounding: canonical scoreやcomparisonへ作用する場合だけFormula Contract/Version対象。
- Presentation Rounding: UI表示だけに適用し、stored/calculated scoreを変更しない。

Initial recommendationはintermediate/internal precisionを保持し、UI表示だけを別Presentation Ruleで丸めること。Exact digitsとbusiness rounding pointは未決定である。

## 14. Confidence and Coverage Parameter Policy

Confidenceは承認済みv1 ArchitectureどおりSeparate Quality Indicatorを維持し、baselineではScore Weight Modifierに使わない。将来のquality flag、manual review、recalculation requirement、eligibility gateはcalibration evidenceとversioned policyを条件とする。

Product/Content CoverageはSubmetric candidate、Observation/Crawl Coverageはquality/completeness metadataとして分離する。Crawl coverageを直接weight modifierにすると「収集不足=Product品質低下」になるriskがあるためv1 baselineでは採用しない。

## 15. Eligibility Dependency

Formula Profileは`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`を参照できるeligibility rule referenceを持つ。各stateのexclude、include、renormalize、penalty、fallbackはPD-02Dで決定する。PD-37ではeligibility behaviorのparameter slotとversion/provenance requirementだけを確認する。

## 16. Versioning and Immutability Policy

Published `formulaVersion`は計算全体が参照するimmutable release identityとし、適用するimmutable Axis/Profile revisionsを一意に解決する。Profile version/referenceをformulaVersionと競合する第二の比較正本にしない。

- Weight、ratio、normalization/aggregation/eligibility/fusion、business threshold/rounding変更はnew Formula Version candidate。
- Axis-specific parameter changeはnew Profile revisionを作り、それを参照するnew Formula Versionとしてpublishする。
- Published Formula/Profileはmutation禁止。Lifecycleは既存Hybrid Versioning方針と整合し、historical reconstruction metadataを保持する。
- Calibration Dataset更新だけでactive versionを自動変更しない。

## 17. Fallback Policy

- Equal/Eligibility-aware Candidate A: `TEMPORARY CALIBRATION BASELINE`候補。
- Simple type-safe ratio normalization: denominator/rangeがcontractで確定したSubmetricだけのbaseline候補。
- Unapproved ratio、semantic mapping、context weight: production scoreとして`UNSUPPORTED`。

Fallbackをsilent production defaultにしない。Formula/Profile status、calibration status、limitations、quality indicatorを明示し、approved production profileがないoutputは非表示またはunsupportedとする候補をDecision Reviewへ送る。

## 18. Industry-specific and Global / Context Profiles

Industry-specific profileはdomain fitを高め得るが、overfitting、explainability、sample requirement、version explosion、cross-industry comparability riskが高い。v1採用は`DEFER CANDIDATE`。

比較結果:

- Global Profile: explainability/versioningに強くv1 baseline向き。
- Context Profile: fitは高いがclassification/calibration/version complexityが高い。
- Hybrid: Global Core/Profile + limited contextual applicability rules。approved Architectureと最も整合する将来候補。

推奨初期方針はGlobal baseline。Context/Industry-specific weightは十分なsegmented datasetとselection provenanceが揃うまで導入しない。

## 19. Parameter Registry Candidate

Logical registry candidate:

```text
FormulaProfile
  identity / version / lifecycle
  formulaVersion reference
  axisContractVersion
  axis / layer / context scope
  submetric references
  normalization method + parameter references
  aggregation + weight references
  applicability references
  fusion references
  calibration lineage
  approval / effective metadata
```

Exact JSON、DB Schema、OpenAPIは作らない。Registryはimmutable published record、validation、profile resolution、historical reconstructionを支える必要がある。

## 20. Explainability Metadata

Parameter/Policyごとにsource、rationale、authority/owner role、calibration dataset version/fingerprint、evaluation method/result、approvedAt、approvedBy role、effectiveFrom、lifecycle status、change reason、supersedes/compatibility、known limitationsを保持する候補とする。

ユーザー説明用には「どのEvidence/Ruleが寄与したか」、監査用には「なぜこのparameter/versionが選ばれたか」を分離して再構成可能にする。

## 21. Recommended Initial Policy

1. Candidate A Equal/Eligibility-awareをuncalibrated baselineとしてのみ使う。
2. Typed/Submetric-specific normalizationを使い、一律methodを禁止する。
3. v1 Fusionはnon-dynamic fixed policyを対象とし、ratioはcalibration/approval待ちとする。
4. ConfidenceとCrawl CoverageをScoreから分離する。
5. Non-equal Weight、dynamic fusion、context profileはcalibration前に採用しない。
6. Formula/Profileをimmutable/versionedにし、dataset・rationale・approval lineageを保持する。
7. Unsupported/unapproved parameterでproduction scoreをsilent生成しない。
8. Missing/Partial eligibility treatmentはPD-02Dから参照する。

## 22. Backend Handoff

Backend ContractはformulaVersion、profile reference/version、parameter source、normalization/aggregation/weight/fusion/applicability references、calibration lineage、status/lifecycle/effective metadataを運べる必要がある。Exact field/schemaは未決定である。

## 23. Readiness and Next Review

Formula Profile / Parameter Policyは`DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`。Taxonomy、authority、baseline、calibration、version/immutability、fallback、context、registry、explainabilityを比較可能な状態にしたためである。

Exact Formula Parametersは`NOT_DECIDED`、PD-02CとPD-02 parentは`NEEDS_DISCOVERY`、PD-02Dは`BLOCKED`、Implementationは`NOT_IMPLEMENTED`を維持する。次はPD-38候補としてFormula Profile / Parameter Policy Decision Reviewを推奨する。

## 24. References

- [PD-36 Architecture Approval](./94-pd02c-axis-formula-architecture-explicit-product-owner-approval-record.md)
- [PD-35 Architecture Review](./93-pd02c-axis-formula-architecture-decision-review.md)
- [PD-34 Formula Candidate Discovery](./92-pd02c-axis-formula-candidate-discovery.md)
- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Formula Specification v2.1](../../src/lib/db/role/panoptes_formula_spec_v_2_1_precision_hardened.md)
- [Development Log](../DEVELOPMENT_LOG.md)
