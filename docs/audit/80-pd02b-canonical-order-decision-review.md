# Phase PD-22 — PD-02B Canonical Order Decision Review

更新日: 2026-08-20  
Status: `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`  
Source changes: none

## 1. Scope

PD-21でDecision-readyとなったCanonical Order Necessity、Semantics、Candidate A、Non-Meaning、Domain boundaries、OP-B、Radar / Snapshot、OM-Bを最終reviewし、Product Ownerが個別に承認・却下・差戻しできるFinal Proposalへ固定する。Order Versioning、Snapshot lineage解決、Formula、Weight、Threshold、Backend Wire / schema、Missing / Partial、Source migrationは決定しない。

## 2. Previous State

- PD-02 / PD-02B / Canonical Order: `NEEDS_DISCOVERY`
- Formal Axis Set / Labels / Canonical IDs / Definitions: `DECIDED`
- Necessity / Semantics / Candidate A / OP-B: `READY_FOR_DECISION / NOT_APPROVED`
- Versioning: `NEEDS_DISCOVERY`
- Backend Wire ID / PD-02C / PD-02D: `BLOCKED`

## 3. Order Taxonomy

Domain Canonical、UI Display、Analysis Processing、Evidence Collection、User Decision Journey、Storytellingの6種類を維持する。Canonical ProposalはDomain Canonicalのみであり、他5種類を混同しない。

## 4. Canonical Order Necessity Review

Final Proposalは`YES`。Formal Common 6 Axisをdocumentation、domain metadata、Product contract planning、default representation、cross-feature communicationで一貫して列挙するため、Domain defaultを1つ持つ価値がある。すべてのUIを固定する目的ではない。Statusは`READY_FOR_DECISION / NOT_APPROVED`。

## 5. Canonical Order Semantics Review

Final Proposalは`DOMAIN_CONCEPTUAL_ORDER`。serialization-neutralなProduct Domain上のstandard conceptual ordering / default representational orderとする。`READY_FOR_DECISION / NOT_APPROVED`。

## 6. Candidate A Review

`valueProposition → informationHierarchy → userFlowQuality → trustStructure → differentiationClarity → decisionSupport`。Historical Product listingとPD-20のFormal Axis listingに整合し、feature-specific UIやJourneyへ依存しないため第一推奨とする。「valueからdecisionへ必ず進む」という因果モデルは採用理由に含めない。

## 7. Candidate B Review

`valueProposition → differentiationClarity → trustStructure → informationHierarchy → decisionSupport → userFlowQuality`。User Decision Journeyとして理解しやすいが、non-linear behaviorを直線化し、Domain Canonical Orderとしては因果性を示唆するため非推奨。

## 8. Candidate C Review

`valueProposition → informationHierarchy → differentiationClarity → trustStructure → decisionSupport → userFlowQuality`。Information-to-Actionの説明順としては成立するがRepository evidenceが弱く、Storytelling OrderとDomain Orderを混同するため代替候補に留める。

## 9. Candidate D Review

`informationHierarchy → valueProposition → differentiationClarity → trustStructure → decisionSupport → userFlowQuality`。Analysis-first perspectiveが強く、Product Domainの標準順としては非推奨。

## 10. Candidate E Review

`valueProposition → userFlowQuality → differentiationClarity → informationHierarchy → trustStructure → decisionSupport`。Self / Competitor / preview IndustryのActive UI baselineであり現行比較には有効だが、Product rationaleは`UNKNOWN`。Canonical Domain Orderには採用せず、migration baselineとして保持する。

## 11. Recommended Order

Candidate AをFinal Proposalとし、`READY_FOR_DECISION / NOT_APPROVED`とする。RecommendationはProduct Owner approvalではなく、本PhaseではSource、UI、Radar、fixtureを並べ替えない。

## 12. Non-Meaning Contract

Canonical OrderはAxis importance、Product priority、Score / Formula weight、causal dependency、analysis maturity、User Journey stage、mandatory UI order、Analysis Processing Order、Evidence Collection Order、Backend serialization position、rankingを意味しない。このBoundaryもApproval Scopeの一部とする。

## 13. Domain vs UI

Domain OrderはUI Display Orderを直接強制しない。UIはdefault planning inputとして参照できるが、feature-specific UX理由がある場合はexplicit overrideを利用できる。Current UI orderは別Implementation Decisionまで維持する。

## 14. Domain vs Journey

User behaviorはnon-linearであり、Canonical Orderをconversion funnel、必須行動順、causal sequenceとして扱わない。Journey-specific presentationは別orderとして明示する。

## 15. Domain vs Formula

Canonical Orderをscore calculation、weight lookup、eligibility、threshold、rankingへ利用しない。FormulaはCanonical IDによるexplicit mappingを用い、array index変更でsemanticsが変化しない設計とする。

## 16. Domain vs Processing

Analysis Processing Orderはengine / jobの技術実装上の独立概念である。Canonical Order変更がanalysis execution orderを暗黙に変更してはならない。

## 17. Domain vs Evidence Collection

Evidence Collection Orderはcrawler、parser、analysis workerがEvidenceを取得・処理する順であり、Domain Canonical Orderの責務ではない。

## 18. Domain vs Backend

Backend/APIでAxis意味をarray positionへ依存させない。Canonical IDで識別するProposalを維持するが、Backend Wire ID、schema、serialization formatは`BLOCKED`で、本Phaseでは実装しない。

## 19. Override Policy

OP-B「Domain default + explicit feature override」をFinal Proposalとし、`READY_FOR_DECISION / NOT_APPROVED`とする。Overrideにはreason、owner、explicit configuration、affected feature、accessibility consideration、comparison impact、review / removal criteriaを要求する。array insertion、object iteration、fixture順、component内hard-codeによるimplicit overrideは禁止候補とする。

## 20. Existing UI Migration Boundary

Canonical Orderが将来承認されてもSelf / Competitor / Industry UIを即時reorderしない。Current Active UIは既存baselineであり、Standardization / UI Decision、visual regression、comparison migration planを伴う別Implementation Phaseで扱う。

## 21. Radar Impact

Radar Axis orderの変更は同一scoreでもpolygon shapeを変えるvisual regressionである。Canonical OrderのapprovalとRadar reorderを同一変更として扱わない。

## 22. Radar Comparability

同一comparison context内のSelf / Competitor / Industryは同じAxis Orderを使用し、異なるorderのpolygonを直接比較しないPolicyをFinal Proposalに含めるEvidenceは十分である。ただし今回のProduct Owner approval scopeとは分離し、`READY_FOR_DECISION / NOT_APPROVED`を維持する。

## 23. Snapshot Lineage

`SNAPSHOT_ORDER_LINEAGE_UNKNOWN`を維持する。Canonical ID / order versionのないlabel-bearing positional arrayが存在するため、Existing Snapshot Migrationは`BLOCKED / NOT_PLANNED`。別Evidence Workshopで永続化・再描画・original order preservationを確認する。

## 24. Accessibility

Canonical Orderはaccessibility planning referenceにできるがmandatory DOM orderではない。Feature側でvisual order、DOM order、screen-reader order、keyboard traversal、legend mappingの整合を確認する。Override時はaccessibility impactを記録する。

## 25. Documentation Policy

Product / Architecture / Analysis documentationでFormal Common 6 Axisを標準列挙する場合はCanonical Orderをdefaultとし、Journey、Storytelling、Formulaなど別順を使う場合は目的を明記するProposalとする。

## 26. Metadata Representation

OM-Bのordered Canonical ID listをsingle source of truthとするFinal Proposalは`READY_FOR_DECISION / NOT_APPROVED`。Axis identity metadataとorder listは分離できるが、numeric `order`とordered listを同時に正本化しない。本PhaseではSourceへ追加しない。

## 27. Versioning Dependency

Order変更がProduct semantic version、presentation contract、snapshot compatibilityのどれに該当するかは未決定。Order Versioningは`NEEDS_DISCOVERY`を維持し、Canonical Order approvalから自動推論しない。

## 28. Product Owner Approval

Approval Evidenceは`NOT_PROVIDED`。Product Owner本人による「PD-02BのCanonical Order Proposalを承認する」等の明示文が存在する場合のみ、該当項目を`DECIDED`へ移行する。承認文例、推薦、review完了をactual approvalとして扱わない。個別承認・差戻しを許可する。

## 29. Decision Readiness

| Decision | Proposal | Status |
| --- | --- | --- |
| Necessity | YES | `READY_FOR_DECISION / NOT_APPROVED` |
| Semantics | DOMAIN_CONCEPTUAL_ORDER | `READY_FOR_DECISION / NOT_APPROVED` |
| Candidate A | V → I → F → T → Df → Ds | `READY_FOR_DECISION / NOT_APPROVED` |
| Override | OP-B | `READY_FOR_DECISION / NOT_APPROVED` |
| Metadata | OM-B | `READY_FOR_DECISION / NOT_APPROVED` |
| Radar Comparability | same order in same comparison context | `READY_FOR_DECISION / NOT_APPROVED` |

Canonical Order overall、PD-02B、PD-02はProduct Owner未承認のため`NEEDS_DISCOVERY`を維持する。

## 30. PD-02C / PD-02D Impact

PD-02CはFormula / Weight / Eligibility / ThresholdをCanonical IDへmappingし、order indexを利用しない。PD-02DもMissing / PartialをCanonical ID単位で扱い、position-based semanticsを禁止する。両Decisionは`BLOCKED`を維持する。

## 31. Standardization Impact

明示承認後にplanning levelで解禁可能なのはCanonical Order metadata、documentation normalization、explicit override schema、canonical-order-aware test / fixture contract、shared default presentation planningである。Source reorder、Radar migration、Snapshot migration、Versioning、Backend schema、Formula、Weight、Threshold、Missing / Partialは引き続き未解禁である。

## 32. Remaining

- Product OwnerによるNecessity、Semantics、Candidate A、OP-B、OM-Bの個別明示承認
- Radar Comparability Policyの承認
- Snapshot Order Lineage Evidence Workshop
- Order Versioning Discovery
- Backend Wire ID / PD-02C / PD-02D

明示承認が得られた場合のみPD-23 Canonical Order Explicit Product Owner Approval Recordを推奨する。代替AはSnapshot Order Lineage Evidence Workshop、代替BはVersioning Discovery。

## 33. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-21 Discovery](./79-pd02b-canonical-order-discovery.md)
- [PD-20 Approval Record](./78-pd02b-remaining-five-axis-definitions-explicit-approval-record.md)
- [PD-17 Funnel Approval](./75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Development Log](../DEVELOPMENT_LOG.md)

## Quality Result

- `npm run check`: PASS（0 errors / 0 warnings）
- `npm run lint`: PASS（0 errors / 38 warnings）
- `npm run format:check`: PASS
- `npm run check:openapi`: PASS（18 operations / 18 unique operationIds）
- `npm run check:frontend-inventory`: PASS（components 107、features 17、reusable 124、ACTIVE_CANONICAL 119、unresolved imports 0、cycles 0）
- `npm run test`: PASS（22 files / 257 tests）
- `npm run test:auth-smoke`: PASS（5 cases）
- `npm run build`: PASS
- `npm run test:secrets`: PASS（63 build files scanned）
- `npm run test:smoke`: PASS（10 routes）
- `npm run quality`: PASS（exit 0）
