# Phase PD-18 — PD-02B Remaining Five Axis Definitions Discovery

更新日: 2026-08-20  
Status: `DISCOVERY_COMPLETE / AWAITING_DECISION_REVIEW`  
Source changes: none

## 1. Scope

`valueProposition`、`informationHierarchy`、`trustStructure`、`differentiationClarity`、`decisionSupport`のFormal Definition Draft、Primary Object、Included / Excluded Semantics、Observable Evidence、Adjacent Boundaries、Examples、Anti-examples、Decision Readinessを整理する。Canonical Order、Formula、Weight、Threshold、Normalization、Semantic Color、Versioning、Backend Wire ID、Missing / Partial contractは決定しない。

## 2. Starting State

Formal Common Axis Set、Canonical Labels、6 Canonical IDs、`camelCase`、1 Axis = 1 ID、0–100 Display Scale、Presentation Boundary、Funnel DefinitionはDECIDED。Funnel以外の5 Definitionは未決定。PD-02B / PD-02は`NEEDS_DISCOVERY`。

## 3. Common Definition Framework

各AxisをCanonical Label / ID、Definition Draft、Primary Evaluation Object、Measurement Nature、Included / Excluded、Observable Evidence、Boundaries、Examples、Anti-examples、Unknowns、Readinessで評価した。Evidenceは`OBSERVABLE_FROM_SITE`、`REQUIRES_EXTERNAL_DATA`、`BEHAVIORAL_ANALYTICS`、`UNKNOWN`へ分類する。Historical submetricsはsemantic evidenceであり、現行formula/weightではない。

## 4. `valueProposition` Evidence

Active Self label/key、Hero/value messaging、fixture scores/impact、design documents、historical `hero_value_clarity`、`problem_solution_alignment`、`benefit_specificity`、`offer_visibility`が、value communication、problem-solution、benefit、offerを支持する。Evidence classは`OBSERVABLE_FROM_SITE`。Actual outcome/conversionは支持しない。

## 5. `valueProposition` Definition

Definition Draft: 「Product / Serviceが誰にどのような価値を提供し、どの課題・便益に応えるものかが、サイト上の主要なメッセージから明確に理解できる度合い。」  
Primary Object: `Value Messaging / Proposition Communication`。  
Included: primary claim、target problem、benefit、offer、Hero、service explanation、outcome proposition、customer relevance。  
Excluded: competitor difference、proof、pricing/comparison completeness、CTA path、actual outcome/conversion/traffic。  
Readiness: `READY_FOR_DECISION / NOT_APPROVED`。

## 6. `informationHierarchy` Evidence

Active labels、heading/section presentation、fixture strengths、historical `heading_structure_clarity`、`section_order_logic`、`nav_information_clarity`、`content_grouping_coherence`が、order、hierarchy、grouping、priorityを支持する。Evidence classは`OBSERVABLE_FROM_SITE`。Actual comprehensionはBehavioral/Unknownである。

## 7. `informationHierarchy` Definition

Definition Draft: 「ユーザーが情報の重要度と関係性を理解できるよう、内容が適切な順序・階層・グループで構成されている度合い。」  
Primary Object: `Content Structure / Information Hierarchy`。  
Included: headings、section sequence、grouping、priority、chunking、proximity、page structure。  
Excluded: CTA progression/path、pricing sufficiency、proof credibility、differentiation content、actual comprehension。  
Readiness: `READY_FOR_DECISION / NOT_APPROVED`。

## 8. `trustStructure` Evidence

Active labels、case/logo/testimonial surfaces、fixture scores/impact、historical `social_proof_presence`、`case_evidence_strength`、`brand_identity_trust`、`faq_objection_handling`がproof、authority、credibility、transparencyを支持する。Evidence classは`OBSERVABLE_FROM_SITE`。Actual satisfaction/reputationは除外する。

## 9. `trustStructure` Definition

Definition Draft: 「ユーザーがProduct / Serviceまたは提供主体を信頼できると判断するための根拠・証拠・透明性が、サイト上で適切に提示・構成されている度合い。」  
Primary Object: `Trust Evidence / Credibility Structure`。  
Included: social proof、credentials、case/testimonial/logo、company transparency、certification、security、guarantee、credibility FAQ。  
Excluded: CTA path、generic pricing、feature comparison、value claim、actual satisfaction、unsupported external reputation。  
Readiness: `READY_FOR_DECISION / NOT_APPROVED`。

## 10. `differentiationClarity` Evidence

Active full/short labels、Competitor surfaces、fixture impact、historical `unique_claim_clarity`、`competitive_position_signal`、`message_distinctiveness`、`comparison_support`がunique claim、positioning、distinctivenessを支持する。Evidence classは`OBSERVABLE_FROM_SITE`。Actual competitive performanceは支持しない。

## 11. `differentiationClarity` Definition

Definition Draft: 「競合や代替選択肢と比較したときに、Product / Service固有の違い・独自性・選ぶ理由が明確に伝わる度合い。」  
Primary Object: `Competitive Positioning / Differentiating Message`。  
Included: unique value、comparison、distinctive feature、positioning、proprietary approach、specialization、alternative framing。  
Excluded: generic benefit、trust proof、pricing completeness、CTA path、actual performance、unsupported superiority。  
Readiness: `READY_FOR_DECISION / NOT_APPROVED`。

## 12. `decisionSupport` Evidence

Active full/short labels、pricing/comparison/plan content、fixture impact、historical `pricing_visibility`、`compare_support`、`decision_friction_reduction`、`conversion_readiness`がchoice information、conditions、process、friction reductionを支持する。Evidence classは`OBSERVABLE_FROM_SITE`。Actual decision/conversionは除外する。

## 13. `decisionSupport` Definition

Definition Draft: 「ユーザーが比較・選択・問い合わせ・契約などの判断を行うために必要な条件・選択肢・制約・プロセス情報が、サイト上で十分に提示されている度合い。」  
Primary Object: `Decision Information / Decision Readiness Support`。  
Included: pricing availability、comparison、plan differences、scope/specifications、conditions、choice FAQ、process、constraints、implementation information。  
Excluded: CTA destination/path、pure proof、generic benefit、actual outcome/conversion、off-site sales interaction。  
Readiness: `READY_FOR_DECISION / NOT_APPROVED`。

## 14. Cross-Axis Boundary Matrix

| Evidence / Concept | Value | Hierarchy | Flow | Trust | Differentiation | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| Hero | value/benefit | heading priority | CTA connection | nearby proof | positioning | conditions |
| Navigation | — | taxonomy/grouping | reachability | proof access | comparison access | decision-info access |
| Pricing | offer context | section structure | transition | guarantee | relative position | price/plan completeness |
| Case study | outcome proposition | content structure | next path | credibility | distinctive capability | selection material |
| FAQ | service explanation | grouping | action path | credibility uncertainty | unique approach | choice uncertainty |
| Comparison | value context | comparison structure | next path | evidence quality | relative uniqueness | material completeness |

## 15. Multi-Axis Evidence

同一Evidenceが複数Axisへ関係することを許可する。Customer caseはvalue outcome、trust evidence、distinctive capability、decision materialになり得る。ただし「同じEvidenceを使う = 同じAxis」ではない。各Axisのevaluation questionとsemantic ownershipを分離する。

## 16. Primary / Supporting Evidence

Primary / Supporting classificationは有用なcandidateである。例としてTrustのtestimonial/certificationはPrimary、company information/FAQはpurposeによりSupportingとなり得る。ただしclassificationとweightはFormula Decisionで確定し、本Phaseでは数値化しない。

## 17. Examples

- Value: 工数30%削減claim、課題→解決Hero、対象顧客と便益を示すservice説明。
- Hierarchy: heading関係、重要→詳細のsection order、related-content grouping。
- Trust: 実績根拠付きcase、certification/security、運営主体の透明性。
- Differentiation: 代替比較、固有method、specializationと選択理由。
- Decision: plan差分、見積process、scope/constraint/contract conditions。

合計15 examples。すべてrepository evidenceまたはconceptual exampleであることを区別して扱う。

## 18. Anti-examples

- Value: 独自性だけで価値・便益を示さないclaim。
- Hierarchy: CTA到達性だけの評価。
- Trust: 信頼根拠のないplan比較表。
- Differentiation: generic benefitだけのclaim。
- Decision: 問い合わせCTA位置だけの評価。

合計5 anti-examples。

## 19. Per-axis Readiness

| Axis | Readiness | Individual basis |
| --- | --- | --- |
| `valueProposition` | `READY_FOR_DECISION` | absolute value communicationとrelative differentiationを分離可能 |
| `informationHierarchy` | `READY_FOR_DECISION` | content structureとpath/decision sufficiencyを分離可能 |
| `trustStructure` | `READY_FOR_DECISION` | FAQ/caseをcontent purposeで境界付け可能 |
| `differentiationClarity` | `READY_FOR_DECISION` | explicit/implicit uniquenessをevidence requirement付きで定義可能 |
| `decisionSupport` | `READY_FOR_DECISION` | pricingをcontextual sufficiencyとしてB2Bにも適用可能 |

`NEEDS_DISCOVERY` definitions: 0。`BLOCKED` definitions: 0。すべて`NOT_APPROVED`であり、まとめて承認されたとは扱わない。

## 20. Product Owner Questions

Absolute valueとdifferentiation、Page/Site hierarchy scope、navigation taxonomy、FAQ/security/company transparency、explicit comparisonの必要性、implicit uniqueness、pricing非公開時の扱い、FAQのTrust/Decision併用、Multi-Axis Evidence、Primary/Supporting classification、5 Definitionsの共通contractを個別確認する。

## 21. Dependencies

Recommended OwnerはProduct Owner + Analysis/Data Owner。Frontend、Backend/API、DesignをConsultedとする。DefinitionはCanonical Order、PD-02C Formula、PD-02D Missing / Partial、Versioningの入力になる。Backend representationは別Decision。

## 22. Canonical Order Impact

5 DefinitionによりValue → Structure → Flow → Trust → Differentiation → Decision等のsemantic sequenceを検討できるが、本PhaseはOrderを決めない。Canonical Orderは`NEEDS_DISCOVERY`。

## 23. Formula Impact

Definitionsは「何を測るか」を確定する前提になるが、「どう数値化するか」は決めない。Historical submetric、weight、formulaをcanonical contractに採用しない。PD-02Cは引き続き未完了。

## 24. Missing / Partial Impact

PD-02DはDefinitionを使ってAxis missingの意味を検討できる。ただしmissing representation、null/fallback、completeness、`partially_completed` semanticsは本Phaseで決めない。

## 25. Remaining

- 5 DefinitionのProduct Owner + Analysis/Data Decision Review
- Canonical Order
- Versioning
- Backend Wire ID
- PD-02C Formula / Backend Contract
- PD-02D Missing / Partial Contract

PD-02B / PD-02は`NEEDS_DISCOVERY`を維持する。次Product Decision / PhaseはPD-19 Remaining Five Axis Definitions Decision Reviewを推奨する。Alternative AはAdditional Axis Definition Evidence Workshop、Alternative BはCanonical Order Discovery。

## 26. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-17 Funnel Approval Record](./75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)
- [PD-14 Five Canonical IDs Approval](./72-pd02b-five-canonical-ids-explicit-approval-record.md)
- [PD-12 Canonical ID Discovery](./70-pd02b-canonical-id-funnel-naming-discovery.md)
- [PD-8 Axis Identity Discovery](./66-pd02b-canonical-axis-identity-discovery.md)
- [PD-6 Score / Axis Discovery](./64-pd02-score-common-axes-data-dictionary-discovery.md)
- [Self Overview Audit](./48-self-analysis-overview-panel-analysis.md)
- [Competitor Expanded Audit](./46-competitor-expanded-card-analysis.md)
- [Snapshot Comparison](./21-snapshot-component-comparison.md)
- [Historical Strategic Engine Draft](../../src/lib/db/role/Archive/Panoptes_Strategic_Engine_Complete_Spec_v1.txt)
- [Development Log](../DEVELOPMENT_LOG.md)

## Quality Result

- `npm run check`: PASS（0 errors / 0 warnings）
- `npm run lint`: PASS（0 errors / 38 warnings）
- `npm run format:check`: PASS
- `npm run check:openapi`: PASS（18 operations / 18 unique operationIds）
- `npm run check:frontend-inventory`: PASS（reusable 124、ACTIVE_CANONICAL 119、unresolved imports 0、cycles 0）
- `npm run test`: PASS（22 files / 257 tests）
- `npm run build`: PASS
- `npm run test:secrets`: PASS（63 build files）
- `npm run test:smoke`: PASS
- `npm run quality`: PASS（exit 0。`test:auth-smoke`を含む）
