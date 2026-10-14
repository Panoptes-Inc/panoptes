# Phase PD-20 — PD-02B Remaining Five Axis Definitions Explicit Product Owner Approval Record

更新日: 2026-08-20  
Approval Status: `APPROVED`  
Source changes: none

## 1. Scope

PD-19 Final Proposalに対するProduct Ownerの明示承認を正式Decision Recordへ反映する。対象は5 Formal Definitions、Primary Evaluation Objects、Included / Excluded Semantics、Formal Cross-Axis Boundaries、Multi-Axis Evidence Policy、Primary / Supporting Evidence concept、FAQ classification、Non-public Pricing treatment、Explicit / Implicit Differentiation treatment、Observable Evidence Boundaryである。新規DiscoveryとSource実装は行わない。

## 2. Previous State

- PD-02 / PD-02B: `NEEDS_DISCOVERY`
- Funnel Definition: `DECIDED`
- Remaining Five Definitions: `READY_FOR_DECISION / NOT_APPROVED`
- Definition overall: `1 / 6 DECIDED / NEEDS_DISCOVERY`
- Canonical IDs: `6 / 6 DECIDED`
- Multi-Axis Evidence / Primary-Supporting concept: `READY_FOR_DECISION / NOT_APPROVED`

## 3. Approval Evidence

> PD-02BのRemaining Five Axis Definitions Proposalを承認する。

Codex recommendationではなく、Product Owner本人の明示Approvalとして記録する。

## 4. Approval Date

2026-08-20。

## 5. Decision Owner

Product Owner。

## 6. `valueProposition` Decision

Canonical Label: 価値訴求  
Canonical ID: `valueProposition`  
Primary Evaluation Object: `Value Messaging / Proposition Communication`

Formal Definition:

> Product / Serviceが誰にどのような価値を提供し、どの課題・便益に応えるものかが、サイト上の主要なメッセージから明確に伝わる度合い。

Target user/problem、problem-solution、benefit、value、offer、primary messaging、service/outcome/relevance communicationを含む。Competitorとの差異そのもの、trust proof、CTA/path、actual outcome/business result/conversion、siteから観測不能なinternal valueを除外する。Status: `DECIDED`。

## 7. `informationHierarchy` Decision

Canonical Label: 情報階層  
Canonical ID: `informationHierarchy`  
Primary Evaluation Object: `Content Structure / Information Hierarchy`

Formal Definition:

> ユーザーが情報の重要度と関係性を把握しやすいよう、情報が適切な順序・階層・グループで構成されている度合い。

Heading hierarchy、section sequence、grouping、priority、chunking、proximity、page structure、structureを対象とするnavigation taxonomyを含む。CTA progression、path continuity、pricing sufficiency、proof quality、differentiating message自体、actual comprehension/interactionを除外する。Status: `DECIDED`。

## 8. `trustStructure` Decision

Canonical Label: 信頼構造  
Canonical ID: `trustStructure`  
Primary Evaluation Object: `Trust Evidence / Credibility Structure`

Formal Definition:

> Product / Serviceまたは提供主体を信頼するための根拠・証拠・権威性・透明性が、サイト上で十分かつ適切に提示・構成されている度合い。

Social proof、testimonial、case、logo、authority、credential、certification、company transparency、security、guarantee、credibility FAQ、observable proofを含む。CTA/path、generic pricing/value、pure feature comparison、actual satisfaction/reputation/conversion、unsupported external reputationを除外する。Status: `DECIDED`。

## 9. `differentiationClarity` Decision

Canonical Label: 差別化明確性  
Canonical ID: `differentiationClarity`  
Short Label: 差別化  
Primary Evaluation Object: `Competitive Positioning / Differentiating Message`

Formal Definition:

> 競合や他の選択肢と比較した際のProduct / Service固有の違い・独自性・選ぶ理由が明確に伝わる度合い。

Unique claim/capability/feature、positioning、relative benefit、proprietary approach、specialization、category differentiation、reason-to-choose、observable implicit uniqueness、存在する場合のexplicit comparisonを含む。Generic benefit、proof自体、CTA/path、pricing completeness、actual competitive performance/market superiority、unsupported superiorityを除外する。Status: `DECIDED`。

## 10. `decisionSupport` Decision

Canonical Label: 意思決定支援  
Canonical ID: `decisionSupport`  
Short Label: 意思決定  
Primary Evaluation Object: `Decision Information / Decision Readiness Support`

Formal Definition:

> ユーザーが比較・選択・問い合わせ・契約などの判断を行うために必要な情報が、サイト上で十分かつ明確に提示されている度合い。

Contextually requiredなpricing、plan difference、comparison、specification、scope、condition、eligibility、process、implementation、constraint、risk-reduction、decision FAQ、objection resolutionを含む。CTA/path自体、pure proof、generic value、actual decision/conversion、off-site sales interaction、business model上公開不要なpricingを除外する。Status: `DECIDED`。

## 11. Funnel Definition Reference

`userFlowQuality`はPD-17で次のDefinitionを`DECIDED`済みである。

> ユーザーが次に取るべきActionを識別でき、CTA・リンク・ナビゲーション・ページ遷移によって、主要な目的地点までの経路が途切れず接続されている度合い。

PD-17のInformation Hierarchy、Decision Support、Value Proposition、Trust Structure、Differentiation boundariesと今回のDecisionsに矛盾はない。

## 12. Definition 6 / 6 Completion

Definition decided countは`1 / 6`から`6 / 6`へ遷移した。Definition overallは`NEEDS_DISCOVERY`から`DECIDED`へ遷移した。Canonical IDsも`6 / 6 DECIDED`であるため、Formal Common 6 AxisはIdentity + Meaningが6 / 6正式確定した。

## 13. Cross-Axis Boundaries

- Value = Absolute Value、Differentiation = Relative Distinctiveness。
- Hierarchy = information arrangement、Flow = path / reachability。
- Hierarchy = decision information structure、Decision = information existence / sufficiency。
- Trust = credibility evidence、Decision = choice / contract information。
- Decision = decision material、Flow = materialへの到達とnext-action path。

同一message/evidenceの複数Axis利用は許可するが、評価観点を分離する。Status: `DECIDED`。

## 14. Multi-Axis Evidence Policy

同一DOM element、content、page、observable evidenceを複数AxisのEvidenceとして参照できる。ただし各Axisで評価するsemantic aspectを明確に分離する。Evidence Semantic Reuse: `ALLOWED / DECIDED`。

## 15. Formula Double Counting Boundary

Semantic reuseとFormula double countingは別Decisionである。Formula Double Counting、Score Contribution、Weight、Deduplication Formula、Evidence Count Capは`NOT_DECIDED`であり、PD-02Cへ送る。

## 16. Primary / Supporting Evidence Status

PD-19 ScopeはPrimary / Supporting EvidenceをFinal Proposalの明示判断対象に含め、Section 16で`READY_FOR_DECISION / NOT_APPROVED`、Section 28でProduct Owner明示判断のremainingとして記録していた。今回のApprovalは「Remaining Five Axis Definitions Proposal」全体への承認であるためCase Aを適用し、Primary / Supporting Evidence conceptを`DECIDED`とする。

ただしWeight、required count、score contribution、thresholdはPD-19の承認対象外であり、`NOT_DECIDED`を維持する。

## 17. FAQ Policy

FAQというUI形式だけでAxisを決めず、content semantics / purposeで分類する。Security/credibility FAQはTrust候補、Pricing/condition FAQはDecision Support候補とし、複数観点ではMulti-Axis Policyを適用する。Status: `DECIDED`。

## 18. Non-public Pricing Policy

Pricing非公開を自動的な低評価としない。B2B等ではquote process、contact-based pricing、scope、eligibility、plan structure、procurement processによりDecision Supportが成立し得る。Formulaは決定しない。Status: `DECIDED`。

## 19. Explicit / Implicit Differentiation Policy

Explicit competitor comparisonを必須としない。公開サイト上で観測可能かつ裏付け可能なspecialization、proprietary approach、unique capability、distinctive positioningによるimplicit uniquenessをEvidenceとして許容する。Status: `DECIDED`。

## 20. Observable Evidence Boundary

公開サイト上で観測可能なcontent、messaging、structure、evidence、relationships、presentation contextをProduct Analysis Evidenceとして扱う。Actual user behavior、actual comprehension、actual conversion、actual business outcome、unsupported external inferenceはAxis Meaningへ含めない。Status: `DECIDED`。

## 21. Semantic Contract Summary

| Canonical Label | Canonical ID | Definition |
| --- | --- | --- |
| 価値訴求 | `valueProposition` | 誰にどのような価値を提供し、どの課題・便益に応えるかの伝達品質 |
| 情報階層 | `informationHierarchy` | 情報の順序・階層・groupingの構造品質 |
| 導線強度 | `userFlowQuality` | 次Actionと主要目的地点までのpath接続品質 |
| 信頼構造 | `trustStructure` | 信頼根拠・証拠・権威性・透明性の提示・構成品質 |
| 差別化明確性 | `differentiationClarity` | 相対的な違い・独自性・選ぶ理由の伝達品質 |
| 意思決定支援 | `decisionSupport` | 比較・選択・問い合わせ・契約に必要な情報の充足性 |

## 22. Canonical Order Handoff

Canonical Orderは`NEEDS_DISCOVERY`を維持する。現在の列挙順をCanonical Orderへ自動昇格しない。次DiscoveryではDomain Canonical Order、UI Display Order、Analysis Processing Order、Evidence Collection Order、User Decision Journey Order、Storytelling Orderを混同しない。

## 23. Versioning Handoff

Versioningは`NEEDS_DISCOVERY`を維持する。Definition Meaningが6 / 6確定したため、Axis Definition、Formula、Schema、Snapshot lineageのversion boundaryを今後検討可能である。

## 24. PD-02C Handoff

PD-02CはFormal Common 6 AxisのIdentityとMeaningを正式参照でき、Formula Discoveryのsemantic inputが揃った。ただしBackend Contract dependency、Formula、Weight、Aggregation、Threshold、double-countingは未解決で、PD-02Cの`BLOCKED`を解除しない。

## 25. PD-02D Handoff

PD-02Dは6 AxisすべてのCanonical ID、Canonical Label、Formal Definitionを正式参照できる。ただしMissing / Partial representation、null/fallback、completeness、`partially_completed` semanticsは未決定で、`BLOCKED`を維持する。

## 26. Standardization Impact

Planning levelでfull semantic metadata、definition/help text、shared semantic Axis Dictionary、accessible descriptions、Self/Competitor/Industry semantic alignment、cross-axis documentation、analysis evidence taxonomy、multi-axis evidence mapping、future formula input taxonomyを解禁する。

Source metadata/type/fixture/mapping/UI、Canonical Order implementation、Formula、Weight、Threshold、evidence weighting、double-count prevention、Semantic Color、Missing / Partial UI、Backend Wire ID/schema、Versioned Axis Contractは未解禁である。Frontend Inventoryは再オープンしない。

## 27. Remaining

- Canonical Order: `NEEDS_DISCOVERY`
- Versioning: `NEEDS_DISCOVERY`
- Backend Wire ID: `BLOCKED`
- PD-02C Formula / Backend Contract: `BLOCKED`
- PD-02D Missing / Partial Contract: `BLOCKED`
- PD-02B / PD-02: `NEEDS_DISCOVERY`

次Product Decision / PhaseはPD-21 PD-02B Canonical Order Discoveryを推奨する。Alternative AはVersioning Discovery、Alternative BはPD-02C Formula / Backend Contract dependency reviewとする。

## 28. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-19 Decision Review](./77-pd02b-remaining-five-axis-definitions-decision-review.md)
- [PD-18 Discovery](./76-pd02b-remaining-five-axis-definitions-discovery.md)
- [PD-17 Funnel Approval](./75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)
- [PD-14 Five IDs Approval](./72-pd02b-five-canonical-ids-explicit-approval-record.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Development Log](../DEVELOPMENT_LOG.md)

## Quality Result

- `npm run check`: PASS（0 errors / 0 warnings）
- `npm run lint`: PASS（0 errors / 38 warnings）
- `npm run format:check`: PASS
- `npm run check:openapi`: PASS（18 operations / 18 unique operationIds）
- `npm run check:frontend-inventory`: PASS（reusable 124、ACTIVE_CANONICAL 119、unresolved imports 0、cycles 0）
- `npm run test`: PASS（22 files / 257 tests）
- `npm run test:auth-smoke`: PASS（5 cases）
- `npm run build`: PASS
- `npm run test:secrets`: PASS（63 build files scanned）
- `npm run test:smoke`: PASS（10 routes）
- `npm run quality`: PASS（exit 0）
