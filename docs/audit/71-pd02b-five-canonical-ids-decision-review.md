# Phase PD-13 — PD-02B Five Canonical IDs Decision Review

Date: 2026-08-20  
Status: Completed / `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`  
PD-02B overall: `NEEDS_DISCOVERY`

## 1. Scope

Formal Common 6 AxisのうちPD-12で`READY_FOR_DECISION`となった価値訴求、情報階層、信頼構造、差別化明確性、意思決定支援の5 IDとFrontend/Product Domain ID formatをDecision Reviewした。導線強度は対象外。Source、fixture、type、order、Backend contractは変更していない。

## 2. Evidence

- PD-8は5 keysを`KEEP_CANDIDATE`、`funnelStrength`を`RENAME_CANDIDATE`とした。
- PD-11でFormal Axis Set、Canonical Labels、Short Label Policy、Semantic Equivalence、Self/Competitor Common Identityが明示承認された。
- PD-12で5 keysのsemantic fit、stability、ambiguity、migration costを評価し`READY_FOR_DECISION`とした。
- 5 keysはFrontend fixture/mappingに存在するが、Backend Wire IDまたはcross-layer enumではない。
- Phase PD-13指示書にはFive Canonical IDs Proposalまたは各IDを承認するProduct Ownerの明示文がない。

## 3. ID format

| Option | Assessment |
| --- | --- |
| F-A `camelCase` | TypeScript property、既存candidate key、Frontend metadata、低migration costに整合。推奨 |
| F-B `snake_case` | Backend wire/persistence候補にはなり得るがFrontend domain慣行と不一致 |
| F-C `kebab-case` | object property accessと既存ecosystemに不利 |

Recommendation: `camelCase`。Approval evidenceは`NOT_PROVIDED`、final statusは`READY_FOR_DECISION`。Frontend / Product Domain formatだけを対象としBackend Wire ID formatは決めない。

## 4. valueProposition decision

| Item | Result |
| --- | --- |
| Axis / Label | Value Proposition / 価値訴求 |
| Options | VP-A `valueProposition`; VP-B `valueCommunication`; VP-C `valueCommunicationClarity` |
| Evidence | value communication、problem-solution、benefit、offer |
| Recommendation | VP-A `valueProposition` |
| Rationale | Product conceptを安定して表し、label変更にも耐える。伝達対象であることはDefinitionで補足可能 |
| Product Owner decision | `NOT_PROVIDED` |
| Final status | `READY_FOR_DECISION` |
| Migration | 現行candidate keyと一致。承認時も`NO_IMMEDIATE_RENAME_REQUIRED` |
| Backend Wire ID | `BLOCKED` |

## 5. informationHierarchy decision

| Item | Result |
| --- | --- |
| Axis / Label | Information Hierarchy / 情報階層 |
| Options | IH-A `informationHierarchy`; IH-B `contentHierarchy`; IH-C `informationStructure` |
| Evidence | heading hierarchy、section order、content grouping、navigation information |
| Recommendation | IH-A `informationHierarchy` |
| Rationale | contentだけに限定せず、information structure一般よりもhierarchy評価を明示する |
| Product Owner decision | `NOT_PROVIDED` |
| Final status | `READY_FOR_DECISION` |
| Migration | `NO_IMMEDIATE_RENAME_REQUIRED` candidate |
| Backend Wire ID | `BLOCKED` |

## 6. trustStructure decision

| Item | Result |
| --- | --- |
| Axis / Label | Trust Structure / 信頼構造 |
| Options | TS-A `trustStructure`; TS-B `trustSignals`; TS-C `credibilityStructure`; TS-D `trustEvidence` |
| Evidence | proof、authority、credibility、FAQ、trust signals |
| Recommendation | TS-A `trustStructure` |
| Rationale | signal/evidenceの有無だけでなく信頼形成要素の組合せと配置を包含する |
| Product Owner decision | `NOT_PROVIDED` |
| Final status | `READY_FOR_DECISION` |
| Migration | `NO_IMMEDIATE_RENAME_REQUIRED` candidate |
| Backend Wire ID | `BLOCKED` |

## 7. differentiationClarity decision

| Item | Result |
| --- | --- |
| Axis / Label | Differentiation Clarity / 差別化明確性 |
| Short label | 差別化 |
| Options | DC-A `differentiationClarity`; DC-B `competitiveDifferentiation`; DC-C `positioningClarity`; DC-D `distinctivenessClarity` |
| Evidence | unique claim、positioning、message distinctiveness |
| Recommendation | DC-A `differentiationClarity` |
| Rationale | differenceの存在だけでなく明確に伝わることを表し、canonical labelと直接整合する |
| Product Owner decision | `NOT_PROVIDED` |
| Final status | `READY_FOR_DECISION` |
| Migration | `NO_IMMEDIATE_RENAME_REQUIRED` candidate |
| Backend Wire ID | `BLOCKED` |

## 8. decisionSupport decision

| Item | Result |
| --- | --- |
| Axis / Label | Decision Support / 意思決定支援 |
| Short label | 意思決定 |
| Options | DS-A `decisionSupport`; DS-B `decisionReadiness`; DS-C `decisionEnablement`; DS-D `decisionClarity` |
| Evidence | pricing、comparison、friction reduction、readiness、decision information |
| Recommendation | DS-A `decisionSupport` |
| Rationale | readinessという結果状態やclarityだけに限定せず、判断材料と摩擦削減を包含する |
| Product Owner decision | `NOT_PROVIDED` |
| Final status | `READY_FOR_DECISION` |
| Migration | `NO_IMMEDIATE_RENAME_REQUIRED` candidate |
| Backend Wire ID | `BLOCKED` |

## 9. Funnel exclusion

導線強度はDecision scope外である。`funnelStrength`は`RENAME_CANDIDATE / NOT_CANONICAL`、第一代替候補`userFlowQuality`は`PROPOSED / NEEDS_DISCOVERY`。CTA progression、internal navigation、major path、stage coverage、page transition、conversion pathを含む一方、acquisition funnel、conversion analytics、full journey、actual decision outcomeを含まない境界の正式Definitionが必要である。

## 10. Product Owner approval

Approval evidence: `NOT_PROVIDED`。例示された「PD-02BのFive Canonical IDs Proposalを承認する」または各IDの個別承認は今回の入力にない。CodexのRecommendationを承認として扱わず、Decision Owner identityとDecision Dateも記録しない。

Recommended accountable owner: Product Owner。Joint Decision responsibility: Analysis/Data Owner。Backend/API、FrontendはConsulted。

## 11. Per-axis status

| Subject | Before | Review recommendation | Final |
| --- | --- | --- | --- |
| ID format `camelCase` | Proposal | Approve | `READY_FOR_DECISION` |
| `valueProposition` | `READY_FOR_DECISION` | KEEP / Approve | `READY_FOR_DECISION` |
| `informationHierarchy` | `READY_FOR_DECISION` | KEEP / Approve | `READY_FOR_DECISION` |
| `trustStructure` | `READY_FOR_DECISION` | KEEP / Approve | `READY_FOR_DECISION` |
| `differentiationClarity` | `READY_FOR_DECISION` | KEEP / Approve | `READY_FOR_DECISION` |
| `decisionSupport` | `READY_FOR_DECISION` | KEEP / Approve | `READY_FOR_DECISION` |
| Funnel Axis ID | `NEEDS_DISCOVERY` | Excluded | `NEEDS_DISCOVERY` |

5 IDは個別Decisionであり、1件を差し戻しても他を承認できる。

## 12. 1 Axis = 1 ID policy

同一Axisに複数Canonical IDsを持たせず、Canonical ID、Canonical Label、Short Labelを分離するPolicyを推奨する。Legacy/fixture keyはcanonical identityではなくcompatibility mappingとする。Approval evidenceがないためPolicy statusは`READY_FOR_DECISION`であり`DECIDED`ではない。

## 13. Legacy key impact

5 recommended IDsは既存candidate keysと一致するため、承認された場合も即時renameは不要である。正式metadata model導入時にfixture/mappingの意味とconsumerを再確認する。`funnelStrength`は将来のCanonical ID決定後にcompatibility mappingが必要となる可能性がある。今回source変更はしない。

## 14. Backend boundary

Backend Wire IDは`BLOCKED`を維持する。Product/Frontend Canonical IDが決まってもRails/OpenAPIが同じstringを使うかはPD-02Cの別Decisionである。Frontend candidate keysをBackend enum/schemaへ昇格しない。

## 15. Order boundary

Canonical Orderは`NEEDS_DISCOVERY`。IDの列挙順、表の行順、fixture property orderをProduct orderとして扱わない。

## 16. Definition boundary

正式Axis Definitionsは`NEEDS_DISCOVERY`。5 IDのsemantic evidenceとPD-12 adjacent-axis boundariesは参照可能だが、definition本文、included/excluded evidence、examplesは未承認。導線軸ではDefinitionがCanonical IDの`BLOCKING_DEPENDENCY`である。

## 17. Versioning

Axis meaning version、formula version、schema version、Snapshot lineageの関係は`NEEDS_DISCOVERY`。Canonical ID承認だけからversion fieldやmigration ruleを実装しない。

## 18. Standardization impact

明示承認がないため今回新たに解禁されたstandardizationはない。PD-11で解禁済みのCommon Axis identity/label planningだけを維持する。

5 IDとformatが将来承認された場合、canonical metadata keys、shared domain Axis identifier type、canonical/short label lookup、stable accessibility identifiers、Self/Competitor mapping alignment、generic Axis-aware presentation contractのplanningを追加解禁できる。Funnel ID、canonical order、Backend enum/schema、formula/threshold、semantic colors、missing contract、versioned schemaは引き続き禁止する。

## 19. Remaining

- Product Ownerによる5 ID、`camelCase`、1 Axis = 1 ID Policyの明示承認・却下・差戻し。
- Funnel Axis Definition Evidence WorkshopとCanonical ID Decision。
- Canonical Order、Axis Definitions、Versioning、Backend Wire ID。
- PD-02C formula/backendとPD-02D missing/partial contract。

PD-02B overallとPD-02 parentは`NEEDS_DISCOVERY`を維持する。推奨次Product DecisionはFive Canonical IDs Explicit Product Owner Approval。承認入力後の推奨次PhaseはPD-14 Explicit Product Owner Approval Record。Alternative AはFunnel Axis Definition Evidence Workshop、Alternative BはPD-02D Missing / Partial Score Contract Discovery。

Quality result: `npm run quality` exit 0。Svelte check 0 errors / 0 warnings、ESLint 0 errors / 38 warnings、OpenAPI 18/18、Frontend Inventory unresolved imports 0 / cycles 0、22 files / 257 tests、production build、auth smoke、route smoke、client secret boundary 63 build filesがPASSした。

## 20. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-8 Canonical Axis Identity Discovery](66-pd02b-canonical-axis-identity-discovery.md)
- [PD-11 Explicit Product Owner Approval Record](69-pd02b-explicit-product-owner-approval-record.md)
- [PD-12 Canonical ID & Funnel Naming Discovery](70-pd02b-canonical-id-funnel-naming-discovery.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Development Log](../DEVELOPMENT_LOG.md)
