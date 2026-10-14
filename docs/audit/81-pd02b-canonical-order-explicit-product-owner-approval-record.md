# Phase PD-23 — PD-02B Canonical Order Explicit Product Owner Approval Record

更新日: 2026-08-20  
Status: `APPROVED / DECIDED`  
Source changes: none

## 1. Scope

PD-22で`READY_FOR_DECISION / NOT_APPROVED`となったCanonical Order ProposalへのProduct Owner明示承認を正式記録し、Approval Scope内のDecisionを`DECIDED`へ移行する。新しいDiscovery、Source実装、UI / Radar / Snapshot migration、Versioning、Formula、Backend、Missing / Partialは行わない。

## 2. Previous State

- PD-02 / PD-02B / Canonical Order overall: `NEEDS_DISCOVERY`
- Necessity、Semantics、Candidate A、OP-B、OM-B: `READY_FOR_DECISION / NOT_APPROVED`
- Radar Comparability: `READY_FOR_DECISION / NOT_APPROVED`
- Snapshot Lineage: `SNAPSHOT_ORDER_LINEAGE_UNKNOWN`
- Order Versioning: `NEEDS_DISCOVERY`
- Backend Wire ID / PD-02C / PD-02D: `BLOCKED`

## 3. Product Owner Approval Evidence

正式Evidenceは「PD-02BのCanonical Order Proposalを承認する。」である。Codex RecommendationではなくProduct Owner本人の明示Approvalとして扱う。

## 4. Approval Date

2026-08-20。

## 5. Decision Owner

Product Owner。

## 6. Canonical Order Necessity Decision

Panoptes Formal Common 6 AxisはCanonical Orderを持つ。Documentation、domain metadata、semantic dictionary、default representation、cross-feature communication、test / fixture planning、accessibility planningで安定列挙する。`YES / DECIDED`。

## 7. Canonical Order Semantics Decision

Canonical OrderはProduct Domain上のstandard conceptual orderingである。Semanticsは`DOMAIN_CONCEPTUAL_ORDER / DECIDED`。

## 8. Formal Canonical Order

1. `valueProposition` — 価値訴求
2. `informationHierarchy` — 情報階層
3. `userFlowQuality` — 導線強度
4. `trustStructure` — 信頼構造
5. `differentiationClarity` — 差別化明確性
6. `decisionSupport` — 意思決定支援

Statusは`DECIDED`。

## 9. Candidate A Rationale

Historical Product candidate orderと整合し、Feature-specific UI、User Journey、Analysis Processingへ依存せず、Documentation上安定し、Formal Axis Definitionsと矛盾しないためCandidate Aを採用した。ValueからDecisionへ必ず進む因果モデルは採用理由に含めない。

## 10. Non-Meaning Contract

Canonical Orderはimportance、Product / Business / Feature priority、Score / Formula weight、ranking、causal dependency、analysis maturity、User Journey stage、mandatory UI order、Analysis Processing Order、Evidence Collection Order、Backend serialization positionを意味しない。`DECIDED`。

## 11. Axis Independence

Formal Common 6 Axisは独立した評価観点である。Canonical OrderはAxis dependency graphではなく、前Axisの成立を後Axisの前提にしない。`DECIDED`。

## 12. Domain vs UI Boundary

Domain Canonical OrderはUI Display Orderを強制しない。UIはlayout、visual hierarchy、interaction、responsive design、feature semantics、comparison requirementsに応じて別orderを採用できるが、Canonical Orderとは別責務として管理する。`DECIDED`。

## 13. Override Policy

OP-B「Domain default + explicit feature override」を正式採用する。Feature-specific Orderが必要な場合のみ明示overrideを許可する。`DECIDED`。

## 14. Override Requirements

Overrideにはreason、owner、explicit configuration、affected feature、UX / Product rationale、accessibility consideration、comparison impact、review criteria、必要に応じremoval / convergence criteriaを記録する。Array insertion、object key iteration、fixture順への偶然依存、理由のないhard-code、無記録のfeature order、Canonical ID以外からのidentity推測、index identityは禁止方針とする。

## 15. Existing UI Baseline

Current Self / Competitor / preview Industryは`valueProposition → userFlowQuality → differentiationClarity → informationHierarchy → trustStructure → decisionSupport`を使う。Canonical Orderとは異なるが、本Phaseでは変更しない。Canonical Order approvalはimmediate UI migrationではない。

## 16. Domain vs Journey Boundary

Canonical OrderはUser Decision Journeyを表さない。User behaviorはnon-linearであり、認知・理解・信頼・比較・判断・行動の必須順序を意味しない。`DECIDED`。

## 17. Domain vs Formula Boundary

Canonical OrderをFormula identity、Weight / Threshold lookup、Eligibility、Score semantics、Rankingへ利用しない。FormulaはCanonical ID-based explicit mappingとする。実FormulaはPD-02Cで決定する。Boundaryは`DECIDED`。

## 18. Domain vs Processing Boundary

Analysis Processing OrderはCanonical Orderから独立し、Canonical Order変更でEngineの実行順を自動変更しない。`DECIDED`。

## 19. Domain vs Evidence Collection Boundary

Crawler、parser、worker、analysis pipelineのEvidence取得順はCanonical Orderから独立する。`DECIDED`。

## 20. Domain vs Backend Boundary

Backend/API ContractでAxis意味をarray positionへ依存させず、Canonical IDでidentityを明示する。Boundaryは`DECIDED`だが、Backend Wire ID、schema、serialization formatは`BLOCKED`のまま未決定。

## 21. Radar Impact

Radar chartはAxis Orderによってpolygon形状が変わるため、Radar reorderは`VISUAL_REGRESSION_RELEVANT`である。Canonical Order approvalだけではRadarを即変更しない。

## 22. Radar Comparability Status

PD-22では同一comparison context内でAxis Orderを統一するPolicyをCanonical Order Approval Scopeの外側へ明示分離していた。したがって今回の一般承認文では昇格させず、`READY_FOR_DECISION / NOT_APPROVED`を維持する。

## 23. Snapshot Lineage

`SNAPSHOT_ORDER_LINEAGE_UNKNOWN`を維持する。Existing Snapshot rewrite、migration、historical visual reinterpretationは行わず、Existing Snapshot Migrationは`BLOCKED / NOT_PLANNED`とする。

## 24. Accessibility Boundary

Canonical Orderはaccessibility planning referenceにできるがmandatory DOM orderではない。Visual、DOM、screen-reader、keyboard、legend mappingの整合をFeature単位で確認する。`DECIDED`。

## 25. Documentation Policy

Formal Common 6 AxisをProduct / Architecture / Analysis documentationで標準列挙する場合はCanonical Orderを原則利用する。別OrderにはJourney、UI、Formula等の目的を明記する。`DECIDED`。

## 26. Metadata Representation

OM-Bのordered Canonical ID listをCanonical Orderのsingle source of truthとして採用する。将来はAxis identity metadataとOrder listを分離できる。本PhaseではSourceへ追加しない。`DECIDED`。

## 27. Numeric Order Policy

Axis metadataのnumeric `order`とordered Canonical ID listを2つのCanonical Source of Truthとして併存させない。Primary representationはordered ID listとする。`DECIDED`。

## 28. Canonical Order Overall Status

Canonical Order overallは`NEEDS_DISCOVERY`から`DECIDED`へ移行した。Necessity=`YES`、Semantics=`DOMAIN_CONCEPTUAL_ORDER`、Order=Candidate A、Override=OP-B、Metadata=OM-Bが正式確定した。

## 29. Versioning Dependency

Canonical OrderとOrder Versioningを分離する。Order変更時のcompatibility、Snapshot lineage、Radar history、documentation / metadata version、semantic vs presentation change classificationは未決定で、Order Versioningは`NEEDS_DISCOVERY`。

## 30. PD-02C Handoff

PD-02CはFormal Axis Set、6 Canonical IDs、6 Definitions、Canonical Orderを正式参照できる。Formula、Weight、Threshold、EligibilityはOrder indexへ依存させずCanonical ID-based mappingとする。PD-02Cは`BLOCKED`を維持する。

## 31. PD-02D Handoff

PD-02DはMissing / Partial semanticsをCanonical ID単位で定義し、Canonical Order positionをmissing / partial / completeのidentityへ利用しない。PD-02Dは`BLOCKED`を維持する。

## 32. Standardization Impact

Planning levelでcanonicalAxisOrder design、6-axis documentation normalization、metadata + order model、explicit override schema、order-aware test / fixture contract、shared default presentation、accessibility review、Radar migration impact、Self / Competitor / Industry normalization assessmentを解禁する。Source constant、array / Radar / fixture / mapping reorder、UI / Snapshot migration、Versioning implementation、Formula、Weight、Threshold、Semantic Color、Missing / Partial、Backend Wire / schemaは未解禁である。

## 33. Remaining

- Radar Comparability Policy: `READY_FOR_DECISION / NOT_APPROVED`
- Snapshot Order Lineage: `UNKNOWN`
- Order Versioning: `NEEDS_DISCOVERY`
- Backend Wire ID / PD-02C / PD-02D: `BLOCKED`
- PD-02B / PD-02: `NEEDS_DISCOVERY`

次PhaseはPD-24 Snapshot Order Lineage Evidence Workshopを第一推奨とし、そのEvidenceをPD-25 Axis / Order Versioning Discoveryへ渡す。SnapshotがVersioning判断へ影響しない正本Evidenceが十分な場合のみPD-24を省略できる。

## 34. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-22 Decision Review](./80-pd02b-canonical-order-decision-review.md)
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
