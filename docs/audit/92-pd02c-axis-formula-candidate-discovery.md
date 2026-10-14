# Phase PD-34 — PD-02C Axis Formula Candidate Discovery

Date: 2026-08-24  
Decision: PD-02C Axis Formula Candidate  
Status: `DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`  
Implementation: `NOT_IMPLEMENTED`

## 1. Scope and Evidence Boundary

Observation Output Contract v1を承認済み入力境界として、`Atomic Observation → Submetric → Axis → Internal / Visual → Overall`のFormula Architecture Candidateを整理した。Exact Weight、Threshold、Normalization Parameter、Formula constant、Internal/Visual ratio、Missing/Partial処理、Confidence threshold、DB/OpenAPI、Rails/Worker実装は決定していない。

Formula Specification v2.1とDisplay Metrics Mapping v1.0は`DOCUMENTED_CANDIDATE`であり、0.55 Internal / 0.45 Visual、market profile、confidence adjustment等を承認済みFormulaとして扱わない。Frontend clampは`PRESENTATION SAFETY`でありBusiness Formulaではない。

## 2. Formula Hierarchy Findings

| Layer | Candidate processing | Input requirements | Normalization | Completeness dependency | Provenance |
| --- | --- | --- | --- | --- | --- |
| A: Atomic → Submetric | type-aware rule、ratio/coverage、semantic mappingをSubmetric evaluationへ集約 | typed value、scope、layer、measurement mode、semantic aspect、evidence | 主にSubmetric boundary | Observation eligibility hookが必要 | input Observation IDs、rule/profile version |
| B: Submetric → Axis | eligible Submetricのmean/weighted mean。Layer別計算を優先 | canonical Axis/Submetric IDs、normalized score、eligibility、coverage | 0–100 Submetric outputをaggregation | applicable denominatorとpartial状態が必要 | Submetric inputs、weights/profile、aggregation result |
| C: Axis → Layer | 6つのlayer-specific Axis scoreをInternal/Visual別に集約 | Axis ID別score、layer、eligibility、completeness | 原則不要。Axisは既に0–100 | eligible Axis setが必要 | input Axis scores、layer aggregation profile |
| D: Layer → Overall | Internal/Visual late fusion | 両Layer score、availability、quality metadata | normalized weightsだけ | unavailable/partial layer treatmentが必要 | layer inputs、fusion profile、calculatedAt |

推奨hierarchyはLayerをAからCまで保持し、Dで初めてlate fusionする。これによりObservation Contractの`INTERNAL / VISUAL`分離、説明可能性、missing追跡を維持できる。

## 3. Atomic Observation → Submetric Candidates

| Observation/value nature | Candidate aggregation | Main guardrail |
| --- | --- | --- |
| BOOLEAN / presence | eligible unitのbinary ratio、またはrule-defined boolean mapping | presenceだけでqualityを断定しない |
| COUNT | denominator付きcount normalization、capped linear、robust reference normalization | raw count単独を高評価しない |
| RATIO | bounded ratio mapping、target/range-aware mapping | denominator availabilityを必須化 |
| NUMBER | linear、capped linear、logistic、robust reference mapping | unit、direction、rangeをSubmetric定義に固定 |
| Coverage | observed/eligible scopeによるcoverage scoring | crawl不足とcontent absenceを分離 |
| ENUM / classification | versioned class→score mapping | class registryとcalibration lineageが必要 |
| Semantic classification | calibrated mapping、またはsupporting evidence aggregation | confidenceを意味そのものと混ぜない |
| Mixed evidence | deterministic core + semantic supportの別ObservationをSubmetricで統合 | HYBRID Observationを作らない |

Weighted evidence aggregationは候補だが、Primary/Supporting classification、weight、cap、dedup ruleは未決定である。

## 4. Submetric → Axis Aggregation Comparison

| Model | Advantage | Disadvantage | Interpretability | Robustness / missing sensitivity | Complexity |
| --- | --- | --- | --- | --- | --- |
| Equal Mean | 最も単純で監査しやすい | importance差を表現できない | High | missing処理次第で歪む | Low |
| Weighted Mean | domain importanceを表現可能 | weight根拠とcalibrationが必要 | Medium–High | weight集中に敏感 | Medium |
| Coverage-adjusted Mean | evidence breadthを反映可能 | crawl qualityをscoreへ混入しやすい | Medium | coverage欠損に敏感 | Medium |
| Eligibility-aware Mean | N/Aを0にせずapplicable inputsで再正規化可能 | eligibility policyが未決定 | High | PD-02Dへ強く依存 | Medium |
| Deterministic/Semantic Hybrid | measurement nature別に監査・calibration可能 | fusion ruleが増える | Medium | semantic noiseを隔離可能 | High |

BaselineはEligibility-aware Mean、将来拡張は明示Weight Profileとする候補が最も説明しやすい。Coverageは原則quality/eligibility情報とし、Submetric definition自体がcoverageを評価する場合だけdirect score componentとする。

## 5. Axis Scale and Normalization

Display Contractの0–100を維持する。Raw Observationを一律0–100化せず、Submetric definitionがmeasurement natureに応じてnormalized 0–100を生成し、Axisは同一尺度のSubmetricを集約する構造を第一候補とする。

| Method | Suitable inputs | Finding |
| --- | --- | --- |
| Linear | bounded NUMBER、well-defined RATIO | range/directionが安定する場合のみ |
| Capped linear | COUNT、NUMBER | extreme countの過大寄与を抑える候補 |
| Logistic | saturationするCOUNT/NUMBER | parameter explainabilityとcalibrationが必要 |
| Robust normalization | population/benchmark-relative NUMBER/COUNT | reference population/versionが必要 |
| Ratio normalization | BOOLEAN aggregates、coverage、valid/eligible count | denominator unknownを0にしない |
| Class mapping | ENUM、SEMANTIC_CLASSIFICATION | versioned mappingとlabeled calibrationが必要 |

Observation-level normalizationはtype-specific primitiveに限定し、Axis aggregation-level normalizationは異質なSubmetricを後付けで補正するため非推奨候補とする。Business clamp/thresholdは未決定で、UI safety clampと分離する。

## 6. Eligibility and Completeness Dependency

FormulaはObservation/Submetricごとにeligibility情報を必要とする。`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`をFormula inputへ運ぶが、各stateのscore contribution、除外、再正規化、penaltyはPD-02Dで決める。

- `PRESENT`: candidate input。0というvalid valueを許容する。
- `NOT_APPLICABLE`: denominatorから除外する候補だが未決定。
- `MISSING / UNKNOWN`: 0へ変換せず、reasonとcoverageを保持する。
- `PARTIAL`: partial value、coverage、qualityを保持し、処理はPD-02Dへhandoffする。

## 7. Internal / Visual Contribution

| Option | Evaluation |
| --- | --- |
| A: Layer別Axis/Layer Scoreを作り最後に統合 | Observation Contractと最も整合。Layer別説明、quality、missing、再計算が可能。第一候補 |
| B: AxisごとにInternal/Visualを統合後、Layer scoreを表示用算出 | Axis scoreは簡潔だが、Layer scoreが派生表示となりlineageと意味が弱くなる |
| C: Atomic/Submetric段階でLayer統合 | Layer separationを早期に失い、confidence/coverage差とEvidence重複を追跡しにくい。非推奨 |

0.55/0.45は`DOCUMENTED_CANDIDATE / NOT_APPROVED`。Option Aの採用候補は具体ratioを承認するものではない。

## 8. Layer Aggregation and Overall Score

Internal/Visual Layer Scoreは、それぞれ6 Axisのeligible-axis meanまたは明示weight profileで算出する候補とする。Canonical Orderはlisting semanticsでありAxis importance/weightを意味しない。

Layer aggregation候補はequal mean、weighted mean、completeness-adjusted mean、eligible-axis mean。Baselineはeligible-axis mean、calibration後のextensionはversioned weighted profileである。

Overall候補はfixed weighted mean、configurable weighted mean、confidence-adjusted fusion、completeness-adjusted fusion。最も安全な初期候補はversioned fixed/configurable late-fusion profileであり、confidence/completenessによるweight変更はcalibrationとPD-02D決定後に限定する。

## 9. Confidence and Coverage Handling

Confidence candidates:

1. `Ignore in Score`: provenance/quality metadataのみ。最も安定した初期候補。
2. `Eligibility Gate`: calibration済みthresholdがある場合だけ候補。
3. `Weight Modifier`: score semanticsを複雑化し、low confidenceをlow valueと混同するriskが高い。
4. `Separate Quality Indicator`: Scoreと独立表示。第一候補。

Coverage candidates:

- Submetric definitionがcoverageそのものを測る場合はdirect score component。
- その他はeligibility conditionまたはindependent quality metadataを優先。
- generic weight modifierはcrawl不足をcontent weaknessとして減点するriskがあるため非推奨候補。

## 10. Semantic / Deterministic Integration

| Model | Finding |
| --- | --- |
| Unified Submetric | user-facing explanationは単純だがsource natureを内部lineageで維持する必要がある |
| Separate Submetrics | audit/calibrationに強いがAxisごとのSubmetric数とweight設計が増える |
| Derived Semantic Support | deterministic Observationを参照するderived semantic Observationを保持でき、承認済みContractに最も整合 |

推奨はDerived Semantic Supportを基本とし、最終Submetricでは各input contributionを追跡可能にする。LLM-only scoreやHYBRID Observationは採用しない。

## 11. Multi-Axis Evidence and Double-count Risk

Evidence reuseは`ALLOWED`、semantic aspect分離は`MUST_BE_SEPARATED`を維持する。同一Evidenceが複数Axisへ寄与するとoverall influenceが増えるため、Axis間相関、supporting evidenceの過大評価、derived chainの重複がriskとなる。

`evidenceId`、`semanticAspect`、`derivedFromObservationIds`はFormula provenanceと監査に利用可能である。正式なcontribution cap、dedup、primary/supporting weight、cross-axis double-count ruleはDecision対象として残す。

## 12. Formula Provenance Minimum Candidate

- `formulaVersion`
- `axisContractVersion`
- `observationSchemaVersion`
- `analysisPipelineVersion`
- input Observation IDsとinput Submetric IDs
- normalization profile ID/version
- aggregation/fusion profile ID/version
- applied eligibility、completeness、coverage state references
- output Axis ID/layerとraw/normalized score
- AnalysisJob/score artifact/Snapshot association
- `calculatedAt`

この最小集合によりScore→Submetric→Observation→Evidenceを辿り、historical formulaを再構成できる候補となる。

## 13. Formula Version Boundary

New `formulaVersion` candidate:

- Weightまたはprofile selection rule変更
- Normalization method/parameter/reference population変更
- aggregation/fusion変更
- eligibility handling変更
- confidenceをgate/modifierへ使う方法の変更
- scoreへ作用するthreshold変更
- persisted/canonical scoreへ作用するrounding変更
- Submetric contribution semantics変更

Formula Versionへ含めない候補はeditorial wording、formula-preserving refactor、logging/performance change、CSS/ring/radar geometry、presentation safety clamp、表示だけのformat/roundingである。UI label thresholdはscoreを変えない限りPresentation Contract側でversioningする。

## 14. Common vs Axis-specific Formula

| Model | Maintainability | Explainability | Versioning/Audit | Calibration | Finding |
| --- | --- | --- | --- | --- | --- |
| A: Common framework + Axis definitions | High | High | simple | Axis差を表現しにくい | baseline向き |
| B: Fully independent per Axis | Low | uneven | version explosion | flexibleだが高コスト | 非推奨 |
| C: Common core + Axis-specific profiles | Medium–High | High if profiles explicit | profile lineageが必要 | staged calibration可能 | 推奨 |

共通Coreはidentity、eligibility hook、0–100 Submetric contract、aggregation envelope、layer separation、provenanceを固定し、Axis別にSubmetric definition、normalization profile、将来のweight profileを持つ候補とする。

## 15. Formula Architecture Candidates

### Candidate A — Layer-first Equal / Eligibility-aware Baseline

Structure: type-aware Atomic mapping → normalized Submetric → Layer別eligible mean Axis → eligible mean Layer → versioned fixed late fusion。

- Strengths: 最小、説明可能、監査容易、Observation Contract/PD-02D hookと整合。
- Weaknesses: Submetric/Axis importance差とsemantic calibrationを表現しにくい。
- Implementation cost: Medium。
- Calibration difficulty: Low–Medium。
- Recommendation: safe baseline / fallback candidate。

### Candidate B — Axis-first Unified Fusion

Structure: Internal/Visual inputsをAxis内で統合 → unified Axis → Overall。Layer scoreは表示用に派生。

- Strengths: output shapeが単純。
- Weaknesses: Layer lineage、missing、confidence、説明可能性が弱く、Observation Contractとの整合が低い。
- Implementation cost: Medium。
- Calibration difficulty: Medium–High。
- Recommendation: not preferred。

### Candidate C — Layer-first Common Core + Axis-specific Profiles

Structure: Candidate AのLayer-first hierarchyを維持し、Axis別versioned normalization/aggregation profileと、将来calibrationされたSubmetric weightsを許可する。Overallはversioned late-fusion profile。

- Strengths: maintainability、Axis固有性、explainability、versioning、auditability、future calibrationのbalanceが最良。
- Weaknesses: profile registry、lineage、calibration governanceが必要。
- Implementation cost: High。
- Calibration difficulty: Medium–Highだが段階導入可能。
- Observation Contract compatibility: High。
- PD-02D compatibility: High。eligibility/completeness policyを外部hookとして受け取れる。
- Recommendation: `RECOMMENDED FOR DECISION REVIEW`。Candidate Aをinitial default profileとして内包する。

## 16. Backend Handoff Requirements

Backend Contractは少なくともformulaVersion、Canonical Axis ID別Score、Submetric Score、Internal/Visual Layer Score、Overall Score、raw/normalized distinction、input lineage、completeness、coverage、provenanceを運べる必要がある。

加えてnormalization/aggregation/fusion profile references、calculatedAt、AnalysisJob/Snapshot association、immutable historical reconstructionを支える境界が必要である。Exact JSON、DB columns、OpenAPI、Rails modelは未決定・未実装である。

## 17. Readiness and Next Review

Axis Formula Candidateは`READY_FOR_DECISION_REVIEW`。Candidate architecture、normalization boundary、Layer ownership、provenance/version boundaryを比較可能な状態になったためである。これはExact Formulaまたはparameterの承認準備完了を意味しない。

PD-02CとPD-02 parentは`NEEDS_DISCOVERY`、PD-02Dは`BLOCKED`を維持する。次はCandidate C/A/Bの採用・差戻し、confidence/coverageのscore非混入原則、Formula Version boundary、後続calibration scopeをreviewするPD-35候補を推奨する。

## 18. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-33 Observation Contract Approval](./91-pd02c-observation-output-contract-explicit-product-owner-approval-record.md)
- [PD-32 Observation Contract Review](./90-pd02c-observation-output-contract-decision-review.md)
- [PD-28 Formula Discovery](./86-pd02c-score-formula-backend-contract-discovery.md)
- [PD-29 Axis/Submetric Workshop](./87-pd02c-axis-formula-submetric-evidence-workshop.md)
- [PD-30 Calibration](./88-pd02c-differentiation-decision-support-evidence-calibration.md)
- [Formula Specification v2.1](../../src/lib/db/role/panoptes_formula_spec_v_2_1_precision_hardened.md)
- [Display Metrics Mapping v1.0](../../src/lib/db/role/panoptes_display_metrics_mapping_spec_v_1_0.md)
- [Development Log](../DEVELOPMENT_LOG.md)
