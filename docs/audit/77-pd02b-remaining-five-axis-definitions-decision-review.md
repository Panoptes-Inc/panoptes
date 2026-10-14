# Phase PD-19 — PD-02B Remaining Five Axis Definitions Decision Review

更新日: 2026-08-20  
Status: `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`  
Source changes: none

## 1. Scope

PD-18でDecision-readyとなった`valueProposition`、`informationHierarchy`、`trustStructure`、`differentiationClarity`、`decisionSupport`のDefinition、Primary Object、Included / Excluded、boundaries、Multi-Axis Evidence、Primary / Supporting EvidenceをProduct Ownerが個別判断できるFinal Proposalへ整える。Order、Formula、Weight、Threshold、Normalization、Color、Missing / Partial、Versioning、Backend Wire/Schemaは対象外。

## 2. Previous State

PD-02 / PD-02Bは`NEEDS_DISCOVERY`。Funnel Definitionのみ`DECIDED`。残り5 Definitionsは`READY_FOR_DECISION / NOT_APPROVED`。Definition overallは`1 / 6 DECIDED / NEEDS_DISCOVERY`。Canonical IDsは6/6 DECIDED。

## 3. `valueProposition` Review

Value、target problem、benefit、offerを包含し、competitive difference、proof、CTA path、actual outcome/conversionを混同しない。Actual comprehensionではなく、site messagingから観測できるcommunication qualityを対象とする。Review result: `STRONG`。

## 4. `valueProposition` Proposal

Definition: 「Product / Serviceが誰にどのような価値を提供し、どの課題・便益に応えるものかが、サイト上の主要なメッセージから明確に伝わる度合い。」  
Primary Object: `Value Messaging / Proposition Communication`。  
Included: value claim、problem、benefit、offer、Hero、service/outcome/relevance communication。  
Excluded: competitor superiority、proof自体、CTA/navigation、actual outcome/conversion。  
Status: `READY_FOR_DECISION / NOT_APPROVED`。

## 5. `informationHierarchy` Review

Heading、section sequence、grouping、priority、chunking、navigation taxonomyをObservable Structural Qualityとして包含する。Actual comprehension/interactionは測定せず、FlowやDecision information sufficiencyと分離できる。Review result: `STRONG`。

## 6. `informationHierarchy` Proposal

Definition: 「ユーザーが情報の重要度と関係性を把握しやすいよう、情報が適切な順序・階層・グループで構成されている度合い。」  
Primary Object: `Content Structure / Information Hierarchy`。  
Included: heading、sequence、grouping、priority、chunking、proximity、page structure、taxonomy。  
Excluded: CTA/path、decision-information sufficiency、proof quality、actual comprehension/behavior。  
Status: `READY_FOR_DECISION / NOT_APPROVED`。

## 7. `trustStructure` Review

Proof、credibility、authority、transparency、case、certification、company/security informationを包含する。FAQは一律Trustにせず、credibility uncertaintyを減らす場合のみ含める。Actual satisfaction/reputationは除外する。Review result: `STRONG_WITH_PURPOSE_BOUNDARY`。

## 8. `trustStructure` Proposal

Definition: 「Product / Serviceまたは提供主体を信頼するための根拠・証拠・権威性・透明性が、サイト上で十分かつ適切に提示・構成されている度合い。」  
Primary Object: `Trust Evidence / Credibility Structure`。  
Included: proof、testimonial、case/logo、credential、certification、authority、transparency、security、guarantee、credibility FAQ。  
Excluded: CTA path、generic pricing/benefit、pure comparison、actual satisfaction/reputation/conversion。  
Status: `READY_FOR_DECISION / NOT_APPROVED`。

## 9. `differentiationClarity` Review

Competitor/alternative relation、unique claim、positioning、distinctiveness、proprietary approach、specialization、reason-to-chooseを包含できる。Explicit comparisonを必須にせず、observable and supportableなimplicit uniquenessを許可する。Review result: `STRONG`。

## 10. `differentiationClarity` Proposal

Definition: 「競合や他の選択肢と比較した際のProduct / Service固有の違い・独自性・選ぶ理由が明確に伝わる度合い。」  
Primary Object: `Competitive Positioning / Differentiating Message`。  
Included: unique claim/feature、comparison、positioning、proprietary approach、specialization、category differentiation、reason-to-choose、supportable implicit uniqueness。  
Excluded: generic benefit、proof自体、CTA、pricing completeness、actual/unsupported superiority。  
Status: `READY_FOR_DECISION / NOT_APPROVED`。

## 11. `decisionSupport` Review

Pricing、plan difference、comparison、specification、scope、condition、process、constraint、FAQを判断材料として包含する。Actual decision outcomeを意味せず、non-public pricingは自動減点しない。Review result: `STRONG_WITH_CONTEXT_BOUNDARY`。

## 12. `decisionSupport` Proposal

Definition: 「ユーザーが比較・選択・問い合わせ・契約などの判断を行うために必要な情報が、サイト上で十分かつ明確に提示されている度合い。」  
Primary Object: `Decision Information / Decision Readiness Support`。  
Included: pricing availability、plan/comparison、specification、scope、condition/eligibility、process、implementation、constraint/risk、decision FAQ。  
Excluded: CTA/path、pure proof、generic value、actual decision/conversion、off-site sales interaction。  
Status: `READY_FOR_DECISION / NOT_APPROVED`。

## 13. Cross-Axis Boundaries

- Value = Absolute Value、Differentiation = Relative Distinctiveness。
- Hierarchy = information arrangement、Flow = path/reachability。
- Hierarchy = decision information structure、Decision = information existence/sufficiency。
- Trust = evidence for credibility、Decision = information for choice/contract。
- Decision = decision material、Flow = access to material and next-action path。

## 14. Multi-Axis Evidence Policy

Proposal: 同一DOM/content/pageを複数AxisのEvidenceとして利用可能とする。ただし各Axisで評価するsemantic aspectを明示する。Case StudyはTrustのproof、Valueのbenefit、Differentiationのcapability、Decisionのselection materialになり得る。Status: `READY_FOR_DECISION / NOT_APPROVED`。

## 15. Double Counting Boundary

Evidence semantic reuseとFormula double countingは別問題である。本Reviewはsemantic reuseのみを対象とする。Score/weight上のdouble-counting ruleは`NOT_DECIDED`で、PD-02Cへ送る。

## 16. Primary / Supporting Evidence Assessment

Primary / Supporting区分はDefinition metadata conceptとしてevidenceが十分で、`READY_FOR_DECISION / NOT_APPROVED`とする。ただしweight、required count、score contributionは承認対象外でPD-02Cへ送る。

## 17. FAQ Treatment

FAQというUI形式ではなくcontent semanticsで分類する。Security/credibility FAQはTrust、Pricing/condition FAQはDecision Support、navigation/general FAQは内容と評価観点に従う。複数観点を持つ場合はMulti-Axis Policyを適用する。

## 18. Non-public Pricing Treatment

Pricing非公開を`decisionSupport`の自動low scoreにしない。B2Bではcontact-based pricing、quote process、eligibility、scope、plan explanationが十分ならDecision Supportを構成し得る。採点ruleはPD-02Cで決める。

## 19. Explicit / Implicit Differentiation

Competitor comparison tableを必須にしない。明確でobservableかつsupportableなpositioning、specialization、proprietary approachによるimplicit uniquenessをEvidenceとして許可する。Unsupported superiorityは除外する。

## 20. Observable Evidence Boundary

5 Definitionsはsite上のcontent、messaging、structure、evidence、relationship、presentation contextから評価する。Actual user behavior、actual comprehension/outcome、external performanceをDefinitionへ含めない。

## 21. Product Owner Approval

- Approval Evidence: `NOT_PROVIDED`
- Product Owner Decision: `NOT_PROVIDED`
- Decision Owner / Approval Date: 未記録

指示書中の承認例は手続説明であり、actual approvalではない。Codex recommendationをApprovalとして扱わない。

## 22. Per-axis Decision Result

| Definition | Review result | Product Owner decision | Final status |
| --- | --- | --- | --- |
| `valueProposition` | APPROVE推奨 | `NOT_PROVIDED` | `READY_FOR_DECISION / NOT_APPROVED` |
| `informationHierarchy` | APPROVE推奨 | `NOT_PROVIDED` | `READY_FOR_DECISION / NOT_APPROVED` |
| `trustStructure` | APPROVE推奨 | `NOT_PROVIDED` | `READY_FOR_DECISION / NOT_APPROVED` |
| `differentiationClarity` | APPROVE推奨 | `NOT_PROVIDED` | `READY_FOR_DECISION / NOT_APPROVED` |
| `decisionSupport` | APPROVE推奨 | `NOT_PROVIDED` | `READY_FOR_DECISION / NOT_APPROVED` |

各Definitionは個別承認・却下・差戻し可能でAll-or-Nothingではない。

## 23. Definition Overall Status

Funnel Definitionのみ`DECIDED`。Decided countは`1 / 6`、remainingは`5 / 6 READY_FOR_DECISION / NOT_APPROVED`、Definition overallは`NEEDS_DISCOVERY`。5件すべての明示承認後のみ`6 / 6 DECIDED / DECIDED`へ遷移できる。

## 24. Canonical Order Dependency

Canonical Orderは本Phaseで決定しない。Status: `NEEDS_DISCOVERY`。Definitions 6/6 DECIDED後のDiscoveryを推奨する。

## 25. Formula Dependency

承認後はPD-02Cが6 AxisのIdentity + Meaningを正式参照できる。ただしFormula、Weight、Aggregation、Threshold、double countingは未決定。

## 26. Missing / Partial Dependency

承認後はPD-02Dが「Axis missingとは何が欠けることか」をDefinition基準で検討できる。ただしrepresentation、null/fallback、completenessは別Decision。

## 27. Standardization Impact

現時点で新たにunblockされた項目はない。承認後は6-axis definition/help metadata、accessible descriptions、shared Axis Dictionary、Self/Competitor/Industry semantic alignment、cross-axis documentation、evidence taxonomy planningを解禁可能。Source implementation、Order、Formula、Missing / Partial、Versioning、Backend schema/wireはblocked。

## 28. Remaining

- 5 Definitions、Multi-Axis Evidence Policy、Primary / Supporting conceptのProduct Owner明示判断
- Canonical Order、Versioning、Backend Wire ID
- PD-02C Formula / Backend Contract
- PD-02D Missing / Partial Contract

PD-02B / PD-02は`NEEDS_DISCOVERY`。次Product Decision / PhaseはPD-20 Remaining Five Axis Definitions Explicit Product Owner Approval Recordを推奨する。Alternative AはAdditional Product Owner / Analysis-Data Review、Alternative BはCanonical Order Discovery。

## 29. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-18 Discovery](./76-pd02b-remaining-five-axis-definitions-discovery.md)
- [PD-17 Funnel Approval](./75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)
- [PD-14 Five IDs Approval](./72-pd02b-five-canonical-ids-explicit-approval-record.md)
- [PD-15 Funnel Evidence Workshop](./73-pd02b-funnel-axis-definition-evidence-workshop.md)
- [PD-12 ID Discovery](./70-pd02b-canonical-id-funnel-naming-discovery.md)
- [PD-8 Axis Identity Discovery](./66-pd02b-canonical-axis-identity-discovery.md)
- [PD-6 Score / Axis Discovery](./64-pd02-score-common-axes-data-dictionary-discovery.md)
- [Development Log](../DEVELOPMENT_LOG.md)

## Quality Result

- `npm run check`: PASS（0 errors / 0 warnings）
- `npm run lint`: PASS（0 errors / 38 warnings）
- `npm run format:check`: PASS
- `npm run check:openapi`: PASS（18 operations / 18 unique operationIds）
- `npm run check:frontend-inventory`: PASS（Reusable 124、ACTIVE_CANONICAL 119、unresolved imports 0、cycles 0）
- `npm run test`: PASS（22 files / 257 tests）
- `npm run test:auth-smoke`: PASS（5 cases）
- `npm run build`: PASS
- `npm run test:secrets`: PASS（63 build files scanned）
- `npm run test:smoke`: PASS（10 routes）
- `npm run quality`: PASS（exit 0）
