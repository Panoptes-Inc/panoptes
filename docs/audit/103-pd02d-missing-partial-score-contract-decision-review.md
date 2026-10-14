# Phase PD-45 — PD-02D Missing / Partial Score Contract Decision Review

Date: 2026-08-24  
Decision: PD-02D Missing / Partial Score Contract  
Review Status: `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`  
Treatment Model B: `READY_FOR_APPROVAL / NOT_APPROVED`  
PD-02D Closure Proposal: `READY_FOR_APPROVAL / NOT_APPROVED`  
Exact Thresholds / Required Sets: `NOT_DECIDED`  
Implementation: `NOT_IMPLEMENTED`

## 1. Review Scope and Disposition

PD-44のDiscovery CandidateをProduct Ownerが承認可能なv1 Contract Proposalへ整理した。承認済みObservation completeness、Formula Architecture、Parameter Policy、Formula Version/Backend Wireを変更しない。

| Subject | Disposition |
| --- | --- |
| Completeness semantics and zero separation | `DECIDE NOW` |
| Completeness / Eligibility / Score State separation | `DECIDE NOW` |
| Missing / N/A / Unknown / Failure / Partial policy | `DECIDE NOW` |
| Hybrid denominator and Model B framework | `DECIDE NOW` |
| Quality, comparability, explainability, PD-04 boundary | `DECIDE NOW` |
| Model A strict rule | `KEEP AS PROFILE-SPECIFIC RULE` |
| Exact Evidence set, counts, coverage thresholds | `KEEP AS PROFILE-SPECIFIC RULE / DEFER CALIBRATION` |
| Model C coverage-adjusted scoring | `DEFER UNTIL CALIBRATION` |
| Generic Missing penalty / direct Partial penalty | `REJECT` |
| Silent deterministic or one-layer fallback | `REJECT` |
| Physical JSON/DB/OpenAPI and implementation | `DEFER / IMPLEMENTATION DETAIL` |

Product Owner Approval Evidenceはまだ提供されていない。PD-02Dを`DECISION_COMPLETE`へ変更しない。

## 2. Completeness Contract Final Proposal

承認済み5 statesを維持する。

- `PRESENT`: 対象入力/Observation/resultが正常に得られた。
- `MISSING`: 十分に観測された対象範囲で期待Product Evidenceが存在しない。
- `NOT_APPLICABLE`: Context上、評価対象ではない。
- `UNKNOWN`: 存在有無または評価可能性を確定できない。
- `PARTIAL`: 対象の一部だけ観測・計算できた。

Completenessは入力・Observation・resultの状態であり、Score valueやProduct qualityを意味しない。`value=0 ≠ MISSING ≠ UNKNOWN ≠ NOT_APPLICABLE ≠ PARTIAL`を正式原則とする。上位Completenessはinput lineage、required/eligible set、coverage、Profile ruleからsummaryし、単純なenum優先順位で決めない。

## 3. Eligibility Contract Final Proposal

Calculation EligibilityをCompletenessとは別Contractとする。Logical enum Proposal:

- `ELIGIBLE`
- `INELIGIBLE`
- `CONDITIONALLY_ELIGIBLE`
- `UNDETERMINED`

CompletenessからEligibilityへ機械的な1対1変換をしない。Versioned Formula/Profile ruleがEvidence Role、Context、coverage、required setを評価し、Eligibility rule referenceをlineageへ保持する。

## 4. Score State Final Proposal

Logical Score State Proposal:

- `CALCULATED`
- `NON_CALCULATED`

`NON_CALCULATED`ではscore valueを持たず、explicit reasonを要求する。Reason Proposal:

- `INSUFFICIENT_INPUT`
- `UNKNOWN_INPUT`
- `TECHNICAL_FAILURE`
- `NOT_APPLICABLE`
- `UNSUPPORTED_FORMULA`
- `INCOMPATIBLE_VERSION`
- `MISSING_PROFILE_REVISION`
- `REQUIRED_LAYER_UNAVAILABLE`
- `ELIGIBILITY_UNDETERMINED`

Reason拡張方式、wire field名、error taxonomyとのmappingはTechnical Contractへdeferする。0、neutral、last-known scoreを`NON_CALCULATED`へ代入しない。

## 5. MISSING Policy Final Proposal

MISSINGは十分に観測されたscopeにおけるProduct-side absenceであるが、自動0または自動Penaltyではない。Score consequenceはSubmetric definition/Profileが明示する。

CTA absence等、意味のあるabsenceはexplicit negative ObservationまたはSubmetric semantic mappingとしてFormulaへ渡せる。Pricing absence等はContextによりnegative、alternative evidence、N/A、UNKNOWNがあり得る。Generic Missing Penaltyを`REJECT`する。

## 6. NOT_APPLICABLE Policy Final Proposal

N/AはbaselineとしてEligibility=`INELIGIBLE`とし、eligible expected denominatorから除外する。0 score、neutral score、observed scoreを生成しない。

Context判定を確定できない場合はN/Aへ推測変換せず、UNKNOWN/UNDETERMINEDを使用する。Exact applicability ruleとContext ProfileはProfile-specific ruleとしてdeferする。

## 7. UNKNOWN and Technical Failure Policy

UNKNOWNをScoreへ0として投入しない。Required inputがUNKNOWNなら`NON_CALCULATED`候補、Optional/Conditional inputならProfileが許す場合だけcalculationを継続し、coverage/quality低下とreasonを保持する。Reanalysis candidate signalを持てる。

Crawler、Browser、Vision、Semantic/LLM failureはProduct quality evidenceではない。`UNKNOWN`または`PARTIAL` + `TECHNICAL_FAILURE` reasonとして扱い、MISSING、0、negative evidenceへsilent conversionしない。Technical Failureへのdirect Score Penaltyを`REJECT`する。

## 8. PARTIAL Policy Final Proposal

PARTIALを次で表現する。

```text
completeness = PARTIAL
reason
coverage context
affected input / scope lineage
```

ReasonごとのCompleteness enumを増殖させない。PARTIAL自体へのdirect numeric penaltyを`REJECT`し、conditional eligibility、coverage gate、separate quality metadata、calculation limitationで扱う。Coverage-adjusted numeric scoringはCalibration後のnew Profile revision + new formulaVersion候補へdeferする。

## 9. Product Absence / Failure Boundary

| Situation | Contract classification |
| --- | --- |
| Observed Product absence | `MISSING` candidate |
| Technical/Observation failure | `UNKNOWN` or `PARTIAL` + technical reason |
| Insufficient scope | `UNKNOWN` or `PARTIAL` + coverage |
| Context excludes metric | `NOT_APPLICABLE` |
| Partial evidence | `PARTIAL` |

相互にsilent conversionしない。MISSING確定には対象scopeが十分観測済みであることを説明可能にする。

## 10. Required Evidence Role Final Proposal

Definition-time Evidence Roleとして次を持てるContractとする。

- `REQUIRED`
- `OPTIONAL`
- `CONDITIONAL`
- `NOT_APPLICABLE`

Evidence Role、runtime Completeness、Calculation Eligibilityを分離する。Submetric/ProfileがRoleをversion管理し、Context-dependent requirementを解決する。Exact Evidence setはProfile設計/Calibrationへdeferする。

## 11. Hybrid Denominator Final Proposal

Hybrid Denominator Modelをv1 Proposalとする。

- Expected Coverage Denominator: 対象Contextのeligible expected set。
- Numeric Aggregation Contributors: Formula/Profile ruleでcalculated contributorとして許可された入力。
- N/Aはeligible expected setから除外する。
- UNKNOWN/PARTIAL/Failureをobserved-only denominatorから消して完全に見せない。
- required/eligible/calculated countsとcoverageを別保持する。

Fixed denominator、Eligible denominatorだけ、Observed denominatorだけをv1 defaultにしない。特にObserved-only denominatorを`REJECT AS V1 DEFAULT`とする。

## 12. Submetric Treatment Final Proposal

Type/Profile-specific Eligibility-aware Calculationをv1 frameworkとする。

1. ProfileがRequired/Optional/Conditional/N/A inputを解決する。
2. Required conditionを満たす。
3. Eligibleかつcalculated contributorとして許可されたinputだけを数値集約する。
4. coverage/quality/reason/input countsをScoreと別保持する。
5. Required condition不足では`NON_CALCULATED`とする。

Strict complete-onlyは必要なSubmetricのlocal Profile policyとして保持する。Exact coverage threshold、required set、normalization/aggregation parameterは未決定である。

## 13. Axis Treatment Final Proposal

Axisはrequired Submetric条件を満たした上でeligible calculated Submetricsをversioned Profileにより集約する。required、eligible、calculated counts、Completeness、Coverage、Qualityを別保持する。

Minimum eligible count、minimum coverage、Submetric-specific required setはProfile-specific ruleとして許可するが、Exact valueはCalibrationへdeferする。

## 14. Layer Treatment Final Proposal

Internal/Visual Layerはeligible Axis aggregationをbaselineとする。Required Axis set、minimum coverage、minimum eligible countをLayer Profileで定義可能にする。

InternalとVisualで同じlogical frameworkを使うが、required set/coverage ruleはLayer-specific Profileで異なり得る。Canonical OrderをWeightにせず、silent exclusion/fallbackを行わない。

## 15. Overall Treatment Final Proposal

Normal Overall Scoreは両Required Layerがcalculatedかつeligibleで、approved Fusion Profileを解決できる場合に生成する。

One-layer Overallを許可する場合はexplicit Formula Profile、explicit formulaVersion、visible limitation/quality stateを要求する。Available Layerへのsilent weight redistribution、unapproved ratio、last-known Layer代入を`REJECT`する。Required Layer unavailableでは`NON_CALCULATED / REQUIRED_LAYER_UNAVAILABLE`候補とする。

## 16. Partial / Provisional Score Handling

Partial inputから計算したScoreをcomplete Scoreと無標識で同一表示しない。

Logical Score Stateは`CALCULATED`を維持しつつ、Completeness=`PARTIAL`、reason、coverage、limitationsを必須化してlimited calculationを表現する。Product-facing labelは`PROVISIONAL / PARTIAL / CALCULATED_WITH_LIMITATIONS`候補としてPresentation Contractへhandoffする。

Required conditionを満たさない場合はlimited calculationでなく`NON_CALCULATED`とする。

## 17. Quality Separation Final Proposal

```text
Product Quality Score
  ≠ Observation Quality
  ≠ Completeness
  ≠ Confidence
  ≠ Crawl Coverage
```

Quality/Coverage不足をProduct Quality Scoreへ暗黙反映しない。Product/Content Coverage自体が明示Submetricの場合だけScore contributorになり得る。ConfidenceやCrawl CoverageをCalibration/approvalなしにweight modifierへしない。

## 18. Semantic and Mixed Observation Handling

Semantic Observation生成失敗は`UNKNOWN + TECHNICAL_FAILURE`候補で、MISSING、0、negative evidenceへ変換しない。

Deterministic/Semanticの一方だけ利用可能な場合はProfile-defined eligibility ruleを要求する。明示許可があればconditional calculation + PARTIAL/limitations、許可がなければNON_CALCULATED。Silent deterministic fallbackを`REJECT`する。

## 19. Unsupported Historical Contract

Unknown formulaVersion、unsupported legacy Axis、incompatible Observation Schema、unresolved Profile RevisionではScoreを推測・再計算しない。`NON_CALCULATED`とexplicit unsupported/incompatible reasonを使用する。

Generation-time Scoreが存在する場合は値とlineageをmutationせず、compatibility metadataとともに保持する。

## 20. Reanalysis Signal

Score ContractはUNKNOWN、PARTIAL、TECHNICAL_FAILURE、incomplete required inputsに対するoptional reanalysis candidate signalとreason/scopeを持てる。N/Aまたは意味のあるProduct absenceでは自動推奨しない。

Trigger、retry/new Job、UI、billing、replacement、retentionはPD-04責務である。

## 21. Snapshot and Strategy Boundary

Materialized SnapshotはScore value/Score State、Completeness、Eligibility、Reason、Coverage、Quality metadata、Formula lineage、input lineageを保持可能にする。

`Score Calculation Eligibility ≠ Snapshot Eligibility ≠ Strategy Source Eligibility`を正式境界Proposalとする。PD-02DはScore Calculation Eligibilityだけを所有する。Snapshot current promotion/lifecycle、Strategy promotion、reanalysis/history/usage/billingはPD-04へ残す。

## 22. Historical Comparability Final Proposal

Partial/limited ScoreとComplete Scoreを自動比較可能にしない。比較には最低限、formulaVersion、Treatment/Profile compatibility、Completeness、Coverage contextを確認する。

Explicit compatibilityがあり、required set/treatmentが互換で、coverage limitationが比較意味を破壊しない場合だけquality caveat付き比較候補とする。それ以外は`SCORE_INCOMPARABLE`または`UNKNOWN`を使用する。

## 23. Explainability Contract Final Proposal

Score Resultは最低限次から、Scoreが出た・出なかった・limitedである理由を説明可能にする。

- Score State
- Completeness and reason
- Eligibility and rule reference
- affected level / canonical identity / Layer
- required / eligible / calculated counts
- Coverage and Quality metadata
- formulaVersion / resolved Profile
- input lineage
- optional reanalysis candidate signal

## 24. PD-02D Logical Contract Final Proposal

```text
ScoreResultElement
  identity / level / subject / layer
  scoreState: CALCULATED | NON_CALCULATED
  score: present only when CALCULATED
  completeness: PRESENT | MISSING | NOT_APPLICABLE | UNKNOWN | PARTIAL
  completenessReason
  eligibility: ELIGIBLE | INELIGIBLE | CONDITIONALLY_ELIGIBLE | UNDETERMINED
  eligibilityRuleReference
  required / eligible / calculated summaries
  coverage / separate quality metadata
  limitations when calculated from partial inputs
  input lineage
  formulaVersion / resolved Profile references
  calculatedAt where applicable
  optional reanalysis candidate signal
```

Exact JSON、field casing、nullability、enum extension strategy、DB/OpenAPI representationはTechnical Contractへdeferする。

## 25. Treatment Model Disposition

| Model | Disposition | Role |
| --- | --- | --- |
| A Strict Complete-only | `KEEP AS LOCAL PROFILE POLICY` | Required Submetric/Layerのstrict gate |
| B Eligibility-aware Calculation + Separate Quality Metadata | `APPROVAL CANDIDATE / READY_FOR_APPROVAL` | PD-02D v1 framework |
| C Coverage-adjusted Scoring | `DEFER UNTIL CALIBRATION` | Calibration Evidenceとnew Formula Versionが必要 |

Model BはProduct correctness、explainability、technical robustness、Observation Contract/Formula Architecture整合のバランスが最も良い。Model Aを全体defaultにせず、Model Cをuncalibrated production defaultにしない。

## 26. PD-02D Closure Proposal

Missing/Partial Score ContractとTreatment Model B、PD-04 handoff boundaryがProduct Ownerに承認されればPD-02Dを`DECISION_COMPLETE`とする。

Exact coverage threshold、minimum counts、required Evidence set、per-Submetric rule、Calibration Dataset、coverage-adjusted scoring、physical schema、implementationをPD-02D Closure blockerにしない。これらはProfile/Calibration/Technical Implementationへhandoffする。

Product Owner承認なしにClosureしない。

## 27. PD-02 Parent Closure Impact

PD-02A=`DECIDED`、PD-02B=`DECIDED / COMPLETE`、PD-02C=`DECISION_COMPLETE`である。PD-02DがApproval後に`DECISION_COMPLETE`となれば、定義済みPD-02A〜D sub-decisionsはすべてdecision-completeになる。

その時点でPD-02 parentを自動`COMPLETE`にせず、`READY_FOR_CLOSURE_REVIEW`へ進め、sub-decision scope、deferred calibration/implementation、PD-04 separation、Frontend/API handoffを確認するProposalとする。

現在はPD-02D未承認のためPD-02 parent=`NEEDS_DISCOVERY`を維持する。

## 28. Decision Readiness

| Decision | Readiness | Approval |
| --- | --- | --- |
| PD-02D Missing / Partial Score Contract | `READY_FOR_APPROVAL` | `NOT_APPROVED` |
| Treatment Model B | `READY_FOR_APPROVAL` | `NOT_APPROVED` |
| PD-02D Closure Proposal | `READY_FOR_APPROVAL` | `NOT_APPROVED` |

Exact calibration/value/threshold不足はlogical policy approvalのblockerではない。追加Evidence blockerは確認されなかった。

## 29. Deferred / Non-goals

- Exact coverage threshold / minimum counts
- Exact Evidence required set and per-Submetric rule
- Exact Weight / Formula parameter / Calibration Dataset
- Coverage-adjusted scoring and numeric penalty
- Exact Product-facing limited Score label
- Snapshot lifecycle / current promotion
- Strategy promotion / reanalysis / history / usage / billing
- Exact JSON/DB/OpenAPI
- Rails/Worker/BFF/Frontend implementation

## 30. Status and Next Phase

PD-45は`COMPLETED / REVIEWED`。PD-02D Contract、Model B、Closure Proposalは`READY_FOR_APPROVAL / NOT_APPROVED`。PD-02Dは`READY_FOR_APPROVAL`、PD-02 parentは`NEEDS_DISCOVERY`を維持する。

次PhaseはProduct Ownerの明示承認が得られた場合のみPD-46 `PD-02D Missing / Partial Score Contract Explicit Product Owner Approval Record`を推奨する。未承認または一部差戻しなら対象Proposalのみ再Reviewする。

## 31. Validation and References

Documentation-onlyとしてparent/audit/log statusとMarkdown referencesを同期する。Repo-wide discovery、Source/Formula変更、Rails/Worker/Snapshot/OpenAPI/DB変更、full quality gateは行わない。

- [PD-44 Discovery](./102-pd02d-missing-partial-score-contract-discovery.md)
- [PD-43 Readiness Review](./101-pd02d-pd04-dependency-discovery-readiness-review.md)
- [PD-42 Formula / Wire Approval](./100-pd02c-formula-version-backend-wire-contract-explicit-product-owner-approval-record.md)
- [PD-39 Parameter Policy Approval](./97-pd02c-formula-profile-parameter-policy-explicit-product-owner-approval-record.md)
- [PD-36 Formula Architecture Approval](./94-pd02c-axis-formula-architecture-explicit-product-owner-approval-record.md)
- [PD-33 Observation Contract Approval](./91-pd02c-observation-output-contract-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Development Log](../DEVELOPMENT_LOG.md)
