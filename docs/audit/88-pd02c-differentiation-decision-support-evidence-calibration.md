# Phase PD-30 — PD-02C Differentiation / Decision Support Evidence Calibration Workshop

Date: 2026-08-24  
Decision: PD-02C Axis Formula Evidence Calibration  
Status: `CALIBRATION_COMPLETE / READY_FOR_FORMULA_DISCOVERY`

## 1. Scope and Evidence Boundary

`differentiationClarity`と`decisionSupport`だけを対象に、PD-20で決定済みのDefinition、Explicit/Implicit Differentiation、Non-public Pricing、Observable Evidence BoundaryをCalibration Rule Candidateへ分解した。Formula、Weight、Normalization、Threshold、Rounding、Eligibility、Missing/Partial、Backend schemaは決定していない。

Repositoryにはproduction Observation Output Contractやlabeled calibration datasetがない。Crawler/Strategic Engine文書は`LEGACY / DOCUMENTED_CANDIDATE`、Frontend fixture/mockは`FIXTURE / MOCK`であり、Product Formulaまたはground truthとして扱わない。

## 2. Differentiation Calibration Rules

Generic ValueとRelative / Distinctive Valueは単語辞書で判定せず、次の観点をEvidence Candidateとして組み合わせる。

| Aspect | Generic / weak candidate | Distinctive candidate |
| --- | --- | --- |
| Referent | 「高品質」「安心」「高機能」等のabsolute positive claimだけ | competitor、alternative、category baseline、従来方式とのcontrastが観測可能 |
| Specificity | benefit/outcomeだけでmechanism、scope、audienceが不明 | unique capability、specialization、exclusive scope、uncommon combinationが具体化 |
| Approach | 抽象的な「独自」「業界最高水準」 | named methodology、proprietary process/technologyと内容説明が存在 |
| Reason to choose | positive adjectiveだけ | specific capability/processから選ぶ理由へのcausal linkageがある |
| Support | claimだけ、または無関係なproof | specification、case、demo、method description等のobservable evidenceへ接続 |

Rule Candidateは「observable differentiator anchor + specific mechanism/scope + reason-to-choose relation」をDistinctive候補の最低構造とし、linked evidenceやexplicit contrastがある場合にEvidence Strengthを上げる。必要数やThresholdは決めない。

## 3. Explicit / Implicit Differentiation and Strength

- **Explicit:** competitor/alternative/category baselineと差異を直接記載する。Comparison tableやcontrast statementのpresenceはdeterministic、差異の意味・具体性はsemantic。
- **Implicit:** specialization、named/proprietary approach、unique capability、exclusive scope等が公開サイト上で具体的に観測できる。市場優位性を推測せず、stated scope/mechanismとEvidence linkageだけを評価候補にする。

| Strength candidate | Calibration description |
| --- | --- |
| `STRONG` | explicit contrast + specific differentiator + linked evidence、またはconcrete implicit differentiator + stated scope/mechanism + linked evidence |
| `MODERATE` | concrete specialization/capability/reason-to-chooseがあるがcontrastまたはsupportが限定的 |
| `WEAK` | generic benefit、unsupported superlative、抽象的な「独自」だけ |
| `AMBIGUOUS` | claimはspecificに見えるがcategory baseline、scope、support、意味が不明 |

正式Threshold、score contribution、外部市場での真のuniqueness判定は未決定である。

## 4. Differentiation Atomic Observations and Submetrics

Atomic Observation候補はcompetitor/alternative reference、comparison structure、named methodology/proprietary claim、specialization/exclusive scope statement、unique capability statement、reason-to-choose statement、claim→evidence link、claim placement/cross-page occurrenceである。

Submetric候補:

- Distinctiveness Specificity
- Positioning Clarity
- Reason-to-Choose Coverage
- Comparative Support
- Differentiation Evidence Support

`differentiationClarity`は`READY_FOR_FORMULA_DISCOVERY`。候補inputとsemantic boundaryは揃ったが、Formulaやclassifierは未決定である。

## 5. Decision Support Context Profiles

Required Evidence Setは全サイト共通にせず、公開サイトから観測できるsales motion、product/service type、transaction pathのContext Profile候補に応じて変える。

| Context candidate | Higher-relevance information candidates |
| --- | --- |
| Self-service SaaS / transactional | price、plan/options、feature limits、eligibility、trial/signup、billing/contract context |
| Enterprise B2B / custom quote | scope、qualification、quote/contact process、implementation、security/procurement、contract conditions |
| Professional service | service scope、deliverables、process、timeline、constraints、estimate/contact flow |
| Complex / regulated offering | specification、eligibility、constraints、risk/safety、implementation and support process |

Context classification自体にはEvidence、confidence、versioned semantic provenanceが必要である。固定required list、weight、industry taxonomyは決めない。

## 6. Non-public Pricing Calibration

- **Case A — Public pricing:** pricing/plan presenceに加え、scope、conditions、differencesが理解できるかを候補にする。価格表示だけで十分とはしない。
- **Case B — Non-public but guided:** quote/contact方法、対象scope、見積条件、implementation/contract process等が明確なら、非公開Pricingをautomatic low/missingにしない。Pricing disclosureは`OPTIONAL / NOT_APPLICABLE`候補、代替Decision Informationはpresent候補。
- **Case C — Non-public and unguided:** priceだけでなくquote/contact/condition/processも不明ならDecision Information gap候補。ただしContext applicabilityを確認してから扱う。

Atomic Observation候補はpricing section/value、plan/comparison table、spec/scope/condition、eligibility、process steps、FAQ purpose、quote/contact path、implementation/onboarding、contract/procurement informationと、それらのpage/link relationshipである。

## 7. Decision Support Submetrics and Readiness

Submetric候補:

- Commercial Information Coverage
- Option Comparison Support
- Scope / Specification / Condition Clarity
- Process / Implementation Transparency
- Purchase / Inquiry Readiness
- Risk / Objection Resolution Coverage

`decisionSupport`は`READY_FOR_FORMULA_DISCOVERY`。Context Profile、Applicability、代替EvidenceのRule Candidateが揃ったためFormula input discoveryへ進めるが、Required/Optional/Not Applicableの正式PolicyはPD-02Dへhandoffする。

## 8. Deterministic / Semantic Split and Provenance

**Deterministic candidates:** section/page/table/FAQ/contact/form/link presence、price/plan tokens、page type、link destination/status、named method marker、claim/evidence proximity、coverage/count。

**Semantic candidates:** claimがdistinctiveか、contrastがmeaningfulか、reason-to-chooseがspecificか、Evidenceがclaimをsupportするか、Context Profile、informationのsufficiency/clarity、FAQ purpose、pricing applicability。

Backendはdeterministic observationとsemantic judgmentを別record/field boundaryで保持し、source URL、DOM/content/screenshot reference、evidence span、rule/classifier/prompt/model/pipeline version、confidence、rationale、Context Profile、Applicability、capture timestampを再構成できる必要がある。具体schemaは未決定である。

## 9. Calibration Risks, Handoff, and Readiness

- False positive: generic superlative、comparison table/price/FAQのpresenceだけを高評価する。
- False negative: explicit comparisonのないconcrete specialization、custom-quote B2B、複数pageへ分散したinformationを見落とす。
- Semantic ambiguity: Value vs Differentiation、Trust vs Decision、Flow vs Decisionのaspect混同。
- Industry/page dependence: Required informationとevidence scopeがsales motion、product type、page setで変わる。
- LLM dependence: distinctiveness、support、contextual sufficiencyにはsemantic judgmentが必要。
- Veracity boundary: 公開claimの存在・support structureは観測できるが、真実性、市場優位、actual outcomeは保証できない。

PD-02Dへ`REQUIRED / OPTIONAL / NOT_APPLICABLE / UNKNOWN`候補、Case A/B/C、absentとnot applicableの区別、partial coverage、unknown Context Profileをhandoffする。Policyとaggregation treatmentは決めない。

両軸がReadyとなったためAxis Formula overall=`READY_FOR_FORMULA_DISCOVERY`へ更新する。PD-02CとPD-02 parentは`NEEDS_DISCOVERY`、PD-02Dは`BLOCKED`、Backend Wireは`READY_FOR_BACKEND_DISCOVERY`を維持する。

## 10. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-29 Axis/Submetric Workshop](./87-pd02c-axis-formula-submetric-evidence-workshop.md)
- [PD-20 Definitions Approval](./78-pd02b-remaining-five-axis-definitions-explicit-approval-record.md)
- [Formula Specification v2.1](../../src/lib/db/role/panoptes_formula_spec_v_2_1_precision_hardened.md)
- [Display Metrics Mapping v1.0](../../src/lib/db/role/panoptes_display_metrics_mapping_spec_v_1_0.md)
- [Archived Crawler Specification](<../../src/lib/db/role/Archive/Panoptes Python Crawler Implementation Specificati.txt>)
- [Archived Strategic Engine v1](../../src/lib/db/role/Archive/Panoptes_Strategic_Engine_Complete_Spec_v1.txt)
- [Development Log](../DEVELOPMENT_LOG.md)
