# Phase PD-44 — PD-02D Missing / Partial Score Contract Discovery

Date: 2026-08-24  
Decision: PD-02D Missing / Partial Score Contract  
Discovery Status: `DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`  
Recommended Treatment Model: `MODEL B / RECOMMENDED / NOT_APPROVED`  
Exact Treatment Rules: `NOT_DECIDED`  
Implementation: `NOT_IMPLEMENTED`

## 1. Scope and Approved Inputs

PD-02Dが所有するMissing、Partial、Eligibility、Non-calculated Score Contractを、承認済みObservation Output Contract、Axis Formula Architecture、Formula Profile/Parameter Policy、Formula Version/Backend Wire Contractを変更せずに整理した。

Formula、Weight、Fusion Ratio、Calibration、physical JSON/DB/OpenAPI、Rails/Worker/BFF/Frontend実装は対象外である。PD-04のSnapshot current promotion、Strategy promotion、reanalysis workflow、usage/billingも本Contractに含めない。

## 2. Completeness Semantics Findings

承認済みCompleteness enumを維持する。

| State | Meaning | Does not mean |
| --- | --- | --- |
| `PRESENT` | 対象Observation/resultが正常に得られた | 高Score、良い品質 |
| `MISSING` | 観測可能な対象範囲で期待Evidenceが存在しない | Technical failure、必ず0点 |
| `NOT_APPLICABLE` | Context上、評価対象ではない | neutral score、0点 |
| `UNKNOWN` | 存在有無または評価可能性を確定できない | MISSING、0点 |
| `PARTIAL` | 対象の一部だけ観測・計算できた | Job `partially_completed`、自動Penalty |

CompletenessはObservation、Submetric、Axis、Layer、Overallで保持可能だが、上位stateは単純なenum優先順位で決めない。Required/eligible input、coverage、calculation policyに基づくsummaryとして導出し、入力lineageを残す。

## 3. Zero, Missing, and Score State

`value = 0`はPRESENTなObservationまたは正常に計算されたScoreの有効値である。MISSING、UNKNOWN、N/A、Technical Failureの代替値として0を使用しない。

次を独立させる。

```text
value / score
completeness state
calculation eligibility
score state
reason
quality / coverage
```

これにより`score=0 + PRESENT + CALCULATED`と`score absent + UNKNOWN + NON_CALCULATED`を区別できる。

## 4. Product Absence and Technical Failure

| Cause | Completeness candidate | Calculation handoff |
| --- | --- | --- |
| Product-side absence | `MISSING` | Submetric semanticsがabsenceをnegative evidenceと定義する場合だけ明示mapping候補 |
| Crawler/browser/vision/LLM failure | `UNKNOWN`または`PARTIAL` + technical reason | 0へ変換せず、required inputならnon-calculated候補 |
| Insufficient observed scope | `UNKNOWN`または`PARTIAL` + coverage | quality warning / conditional eligibility候補 |
| Context excludes metric | `NOT_APPLICABLE` | eligible denominatorから除外候補 |
| Partial extraction/classification | `PARTIAL` + reason + coverage | profile-defined conditional calculation候補 |

Technical failureをProduct absence、negative evidence、0 scoreとして扱わない。Product absenceとしてMISSINGを確定するには、対象scopeが十分観測済みであることを説明可能にする。

## 5. Eligibility Concept

CompletenessとCalculation Eligibilityを別Contractにする。Candidate enumは有用である。

- `ELIGIBLE`: Formula input/contributorとして利用可能。
- `INELIGIBLE`: ContextまたはContract上、計算対象外。
- `CONDITIONALLY_ELIGIBLE`: coverage、required set、Profile rule等の条件を満たす場合に利用可能。
- `UNDETERMINED`: Context、scope、failure等によりeligibilityを確定できない。

Completenessは観測・結果状態、EligibilityはFormula input可否を表す。同じCompletenessでもSubmetric semantics、Evidence Role、Context ProfileによりEligibilityが異なり得る。

## 6. Observation to Submetric Eligibility

| Completeness | Default direction candidate | Required caveat |
| --- | --- | --- |
| `PRESENT` | `ELIGIBLE` | type/value validationとProfile applicabilityを満たすこと |
| `MISSING` | semantic mappingまたは`INELIGIBLE`候補 | absenceがnegative evidenceか、単なる非存在かをSubmetric定義で明示 |
| `NOT_APPLICABLE` | `INELIGIBLE` | denominatorから除外し、neutral/0を生成しない |
| `UNKNOWN` | `UNDETERMINED` | 0投入禁止。requiredならnon-calculated、optionalならcoverage低下候補 |
| `PARTIAL` | `CONDITIONALLY_ELIGIBLE` | coverageとrequired evidence/profile ruleを評価 |

Exact ruleはSubmetric-specific versioned Profileで解決するCandidateとし、本Discoveryではthresholdやrequired listを決めない。

## 7. MISSING Semantics

MISSINGは常にnegativeではない。

- CTA absenceは`userFlowQuality`で意味のあるnegative evidence候補になり得る。
- Pricing absenceはsales motion/contextによりMISSING、N/A、または代替Decision Informationで充足し得る。
- Technical取得失敗はMISSINGではない。

Completeness=MISSINGとSemantic Score Consequenceを分離する。意味のあるabsenceはraw Observation valueを0へ書き換えるのでなく、Submetric definition/Profileがexplicit negative evidenceとしてmappingし、reasonとlineageを保持するCandidateを推奨する。Generic missing penalty parameterは非推奨である。

## 8. NOT_APPLICABLE Semantics

| Candidate | Assessment |
| --- | --- |
| N/A = 0 | Reject candidate。対象外を低品質へ変換する |
| N/A = neutral score | Reject candidate。未承認のneutral値をFormulaへ混入する |
| N/A = denominator exclusion | Recommended candidate。Eligibility-aware Architectureと整合 |

Context Profileが未確定ならN/Aを推測せずEligibility=`UNDETERMINED`またはCompleteness=`UNKNOWN`として扱う。N/A確定にはversioned applicability ruleとContext evidenceが必要である。

## 9. UNKNOWN Semantics

UNKNOWN候補原因はcrawl incomplete、parser failure、source unavailable、unsupported Observation type、Context classification failureである。

Default direction candidate:

- 0として投入しない。
- required inputならSubmetric/上位resultを`NON_CALCULATED`候補とする。
- optional inputならnumeric contributorから除外し、eligible expected coverage低下を保持する。
- Quality warningとreanalysis signalを持てる。
- UNKNOWNをobserved denominatorから隠して完全に見せない。

`UNKNOWN ≠ MISSING ≠ NOT_APPLICABLE`を維持する。

## 10. PARTIAL Semantics

PARTIAL enumをreason別に増殖させず、次のcompositionを推奨する。

```text
completeness = PARTIAL
reason
coverage context
affected scope / input IDs
```

Reason candidateはpartial observation coverage、page coverage、evidence extraction、semantic classification等。PARTIAL自体を直接Score penaltyにせず、Profile-defined eligibility、required set、coverage ruleを通じて計算可否を決め、Quality/Completenessを別保持する。

## 11. Non-calculated State Candidates

Score StateはCompletenessと別に最低限次を持てるCandidateとする。

- `CALCULATED`
- `NON_CALCULATED`

Reason candidate:

- `INSUFFICIENT_INPUT`
- `UNKNOWN_INPUT`
- `TECHNICAL_FAILURE`
- `NOT_APPLICABLE`
- `UNSUPPORTED_FORMULA`
- `INCOMPATIBLE_VERSION`
- `MISSING_PROFILE_REVISION`
- `REQUIRED_LAYER_UNAVAILABLE`
- `ELIGIBILITY_UNDETERMINED`

Exact enum、field name、reason hierarchyはDecision Review/OpenAPIへdeferする。`NON_CALCULATED`へ0、neutral値、last-known scoreをsilent代入しない。

## 12. Submetric Calculation Candidates

| Option | Strength | Risk / disposition |
| --- | --- | --- |
| A Strict complete-only | 単純で比較しやすい | optional inputや現実的coverageでscore availabilityが低い。Keep as required-submetric policy candidate |
| B Eligibility-aware partial | Architecture整合、availabilityとexplainabilityを両立 | coverageを隠すとobserved-only bias。Recommended framework |
| C Thresholded coverage | 品質下限を設けやすい | Exact thresholdにCalibrationが必要。Defer as Profile rule candidate |
| D Type-specific policy | Typed normalizationと整合 | 複雑性とProfile governanceが必要。Use inside Model B |

推奨はBを共通framework、DをSubmetric-specific Profile rule、A/Cをrequired/coverage gateとして組み合わせる方向。Exact compositionはDecision Reviewで承認し、thresholdはCalibrationへdeferする。

## 13. Axis Calculation Candidates

- All Submetrics required: high strictnessだがoptional/context-specific inputと不整合。
- Eligible Submetrics aggregation: approved Eligibility-aware Architectureに最も整合。
- Minimum eligible count/coverage: quality gate候補だがExact valueはCalibrationが必要。
- Submetric-specific required set: Required/Conditional Evidenceを反映できる推奨candidate。

Final candidateは、required Submetric条件を満たした上でeligible calculated Submetricsをversioned Profileで集約し、eligible/required/calculated countsとcoverageを別保持する。Observed inputだけを母数として完全に見せない。

## 14. Layer Calculation Candidates

Eligible-axis aggregationをbaseline candidateとする。Strict 6-axisは比較しやすいが、N/A/context/layer availabilityへの適応性が低い。Minimum eligible Axis/coverageまたはrequired Axis setはversioned Layer Profile candidateで、Exact count/thresholdは未決定である。

InternalとVisualは同じlogical frameworkを使えるが、required evidence、availability、coverage gateまで同一である必要はない。Layer-specific versioned Profileで違いを明示し、silent fallbackしない。

## 15. Overall Calculation Candidates

| Availability | Candidate treatment |
| --- | --- |
| Both Layers calculated and eligible | Approved Fusion Profileでlate fusion |
| Internal only | Default non-calculated。Single-layer Overallを許すなら明示Profile + new formulaVersionが必要 |
| Visual only | Default non-calculated。同上 |
| One Layer partial | Fusion Profileのrequired/coverage ruleを満たす場合だけconditional calculation候補 |
| Both partial | Strong quality warning付きconditional candidateまたはnon-calculated。Calibration/required rule待ち |
| Required Layer unavailable | `NON_CALCULATED / REQUIRED_LAYER_UNAVAILABLE`候補 |

未承認ratio、available Layerへのsilent weight redistribution、last-known Layer代入を行わない。

## 16. Partial Overall Labeling

Partial inputからOverallを計算する場合、通常Scoreと同じ意味で無標識表示することは誤認riskが高い。

- normal score + hidden quality metadata: reject candidate。
- normal score + visible quality metadata: possibleだが意味差を見落としやすい。
- provisional/partial score + visible completeness/coverage: recommended candidate。
- non-calculated: required conditionを満たさない場合のdefault。

Exact Product labelはDecision Review/Designへdeferするが、`CALCULATED + PARTIAL`を通常complete scoreと区別可能にする。

## 17. Quality and Score Boundary

```text
Product Quality Score
  ≠ Observation Quality
  ≠ Completeness
  ≠ Confidence
  ≠ Crawl Coverage
```

Observation/crawl不足をProduct低評価へ自動変換しない。Product/Content Coverage自体が明示Submetricである場合だけProduct Score contributorになり得る。Confidence/Quality/CoverageはEligibilityやwarningへ参照可能だが、Calibration/approvalなしにweight modifierへしない。

## 18. Required Evidence Roles

Submetric/ProfileはEvidence Roleを保持可能にするCandidateとする。

- `REQUIRED`
- `OPTIONAL`
- `CONDITIONAL`
- `NOT_APPLICABLE`

Evidence Roleはdefinition-time/applicability contract、Completenessはruntime observation state、Eligibilityはcalculation-time decisionである。Context-dependent Decision Supportではpricingを全siteでREQUIREDにせず、Context Profileによりalternative evidenceやN/Aを解決する。Unknown Contextでsilent default roleを選ばない。

Exact required listはAxis/Submetric Profile設計とCalibrationへdeferする。

## 19. Denominator Policy

| Policy | Strength | Risk |
| --- | --- | --- |
| Fixed denominator | cross-result形が一定 | N/A/context differenceを0相当に扱うrisk |
| Eligible denominator | applicabilityを反映 | unknown/failed inputを除外するとcoverageを過大表示し得る |
| Observed denominator | calculation availabilityが高い | 観測失敗を隠し、score inflation/比較不能risk |
| Hybrid | eligible expected setをcoverage母数、actual calculated contributorsをaggregationへ利用 | metadataとruleが複雑 |

Hybridを推奨Candidateとする。Applicabilityでeligible expected setを確定し、N/Aを除外する。Score aggregationはProfileが許すcalculated contributorsを使い、`calculated / eligible expected` coverage、required/unknown/partial countsを別保持する。Observed-only scoreをcompleteに見せない。

## 20. Missing and Partial Penalty

Generic Missing Penaltyは推奨しない。Product absenceがsemantic negativeである場合だけ、Submetric definition/Profileがexplicit negative evidence mappingを行う。Technical missing、unknown、failureへPenaltyを適用しない。

PARTIAL自体へのdirect penaltyも推奨しない。Candidate disposition:

- no direct penalty: recommended default。
- calculation eligibility/coverage gate: recommended mechanism。
- separate quality flag: required candidate。
- coverage-adjusted numeric score: Calibration Evidenceがないためdefer。

## 21. Semantic Failure and Mixed Observation Handling

Semantic Observation生成失敗はMISSINGではなく、`UNKNOWN + TECHNICAL_FAILURE reason`候補とする。Required semantic inputならSubmetricはnon-calculated、optional/conditionalならcoverage低下とconditional calculation候補。LLMが判断できないことをProduct absenceとして扱わない。

Deterministic/Semantic mixed Submetricでは次を候補化する。

- 両方requiredで片方unavailable: `PARTIAL + NON_CALCULATED`候補。
- Semantic optionalでDeterministicだけavailable: Profileが明示許可する場合のみ`CALCULATED + PARTIAL`候補。
- Alternative ruleがversioned Profileにある: explicit fallback candidate。
- Ruleがない: silent deterministic fallbackを禁止しnon-calculated。

## 22. Unsupported Historical Handling

Unknown formulaVersion、unsupported legacy Axis identity、incompatible observationSchema、missing Profile revisionではScoreを推測・再計算しない。

Score State=`NON_CALCULATED`、reason=`UNSUPPORTED_FORMULA / INCOMPATIBLE_VERSION / MISSING_PROFILE_REVISION`等を候補とし、original resultが存在する場合はgeneration-time value/lineageをmutationせずcompatibility metadataとともに保持する。

## 23. Reanalysis Signal

UNKNOWN、PARTIAL、TECHNICAL_FAILURE、INSUFFICIENT_INPUTはScore Contract上でreanalysis candidate signalを持てる。Candidateは`reanalysisRecommended`相当のbooleanだけでなくreason/source scopeを伴い、N/Aや意味のあるProduct absenceでは自動推奨しない。

Trigger、button、retry/new Job、billing、replacement、notificationはPD-04責務である。

## 24. Snapshot and Strategy Boundary

Snapshot materialization時に次を保持可能にする。

- Score value where calculated
- Completeness state
- Eligibility state
- Score State / non-calculated reason
- Quality/coverage metadata
- Formula/input lineage

`Score Calculation Eligibility ≠ Snapshot Eligibility ≠ Strategy Source Eligibility`を維持する。PD-02DはScore Calculation Eligibilityだけを所有する。Snapshot current promotion、Strategy promotion、reanalysis workflow、usage/billing、Snapshot lifecycle/history retentionはPD-04へ残す。

## 25. Historical Comparability

Partial/incomplete ScoreとComplete Scoreを自動的にdirectly comparableとしない。

Candidate policy:

- 同じformulaVersionだけでは十分でない。
- 同じProfile/required set/treatment ruleとcompatible completeness/coverage条件を確認する。
- 条件を満たす場合はquality caveat付き比較候補。
- Coverage/required input差がsemanticに影響する場合は`SCORE_INCOMPARABLE`候補。
- 不明な場合は`UNKNOWN`。

Exact compatibility threshold/policyはDecision Reviewへ送る。

## 26. Explainability Requirements

Missing/Partial/Non-calculated resultは最低限、次から「なぜScoreが出た／出なかったか」を説明可能にする。

- Completeness status and reason
- affected level and canonical identity
- Eligibility state/rule reference
- Score State / non-calculated reason
- required/eligible/calculated counts
- coverage context
- input Observation/Submetric/Axis identities
- Profile/Formula references and formulaVersion
- AnalysisJob / conditional Snapshot lineage
- quality/confidence references where applicable

## 27. Logical Contract Candidate

```text
ScoreResultElement
  identity
  level / canonical subject identity / layer
  scoreState: CALCULATED | NON_CALCULATED
  score: number only when CALCULATED
  completeness: PRESENT | MISSING | NOT_APPLICABLE | UNKNOWN | PARTIAL
  completenessReason
  eligibility: ELIGIBLE | INELIGIBLE | CONDITIONALLY_ELIGIBLE | UNDETERMINED
  eligibilityRuleReference
  required / eligible / calculated input summaries
  coverage context
  separate quality / confidence references
  input lineage
  formulaVersion / resolved Profile references
  calculatedAt where calculated
  optional reanalysis candidate signal
```

Exact JSON Schema、field naming、nullability、enum finalizationは行わない。Score valueは`CALCULATED`時だけ存在し、`NON_CALCULATED`へ0を入れないCandidateとする。

## 28. Treatment Model Comparison

| Model | Product correctness | Explainability | Robustness / availability | Calibration / comparison risk |
| --- | --- | --- | --- | --- |
| A Strict Complete-only | failureをScoreへ混ぜにくい | 単純 | optional/context inputでavailability低下 | complete setは比較しやすいがN/Aに弱い |
| B Eligibility-aware Calculation + Separate Quality | semantic/context distinctionに強い | counts/coverage/reasonで高い | partial dataに安全に対応可能 | explicit required/profile ruleとcomparability metadataが必要 |
| C Coverage-adjusted Scoring | 単一値availabilityが高い | penalty理由が複雑 | incompleteでも値を出しやすい | Crawl不足をProduct qualityへ混ぜるrisk、Calibration負荷大 |

Model Aはrequired Submetric/Layerの局所policyとして保持する。Model CはCalibration EvidenceなしにProduction採用せずdeferする。

## 29. Recommended Treatment Model

Model B `Eligibility-aware Calculation + Separate Quality Metadata`を`RECOMMENDED / NOT_APPROVED`とする。

Direction:

1. Completeness、Eligibility、Score Stateを分離する。
2. versioned ProfileがRequired/Optional/Conditional/N/Aとcalculation ruleを解決する。
3. required conditionを満たす場合だけeligible calculated inputsを集約する。
4. eligible expected setをcoverage母数にし、observed-only biasを隠さない。
5. Missing/Partialへgeneric direct penaltyを課さない。
6. Product absenceがsemantic negativeならexplicit Submetric mappingを使う。
7. Partial Overallはvisible provisional/partial labelingとQuality metadataを伴う。
8. One-layer Overallやfallbackは明示Formula/Profileなしに生成しない。

## 30. Decision Readiness and Next Phase

PD-02D Missing / Partial Score Contract=`DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`。5 states、cause boundary、eligibility、Score State、階層別calculation option、denominator、penalty、mixed/unsupported、Snapshot/Strategy boundary、logical contract、3 modelsを比較できたためである。

Model Bと各candidateは未承認で、Exact threshold、required set、reason enum、per-Submetric treatment、Overall rule、historical compatibilityは未決定である。PD-02 parentは`NEEDS_DISCOVERY`を維持する。次PhaseはPD-45 `PD-02D Missing / Partial Score Contract Decision Review`を推奨する。

## 31. Validation and References

Documentation-onlyとしてparent/audit/log statusとMarkdown referencesを同期する。Repo-wide discovery、Formula/Source変更、Rails/Worker/Snapshot/OpenAPI/DB変更、full quality gateは行わない。

- [PD-43 Readiness Review](./101-pd02d-pd04-dependency-discovery-readiness-review.md)
- [PD-42 Formula / Wire Approval](./100-pd02c-formula-version-backend-wire-contract-explicit-product-owner-approval-record.md)
- [PD-39 Parameter Policy Approval](./97-pd02c-formula-profile-parameter-policy-explicit-product-owner-approval-record.md)
- [PD-36 Formula Architecture Approval](./94-pd02c-axis-formula-architecture-explicit-product-owner-approval-record.md)
- [PD-33 Observation Contract Approval](./91-pd02c-observation-output-contract-explicit-product-owner-approval-record.md)
- [PD-30 Context Evidence Calibration](./88-pd02c-differentiation-decision-support-evidence-calibration.md)
- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Development Log](../DEVELOPMENT_LOG.md)
