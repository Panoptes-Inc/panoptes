# Phase PD-14 — PD-02B Five Canonical IDs Explicit Product Owner Approval Record

Date: 2026-08-20  
Status: Completed / `APPROVED`  
PD-02B overall: `NEEDS_DISCOVERY`

## 1. Scope

PD-13で`READY_FOR_DECISION`を維持したFrontend/Product Domain ID format、5 Canonical IDs、`1 Axis = 1 Canonical ID` Policyに対するProduct Ownerの明示承認を正式Decision Recordへ反映した。新しいDiscoveryとSource実装は行っていない。導線強度のCanonical IDは対象外である。

## 2. Previous state

PD-02 parent、PD-02B overall、Canonical ID overallは`NEEDS_DISCOVERY`。`camelCase` format、`valueProposition`、`informationHierarchy`、`trustStructure`、`differentiationClarity`、`decisionSupport`、1 Axis = 1 ID Policyは`READY_FOR_DECISION`。Funnel Axis IDは`NEEDS_DISCOVERY`だった。

## 3. Approval Evidence

「PD-02BのFive Canonical IDs Proposalを承認する。」をProduct Owner本人の明示Approvalとして記録する。Codex Recommendationではない。

## 4. Approval Date

2026-08-20。

## 5. Decision Owner

Product Owner。Analysis/Data OwnerはConsulted / Joint Design Responsibility。Backend/APIとFrontendはConsulted。

## 6. Canonical ID Format

Frontend / Product Domain Canonical ID Formatを`camelCase / DECIDED`とする。TypeScript property、既存candidate keys、metadata利用、migration costに整合する。このDecisionはBackend Wire ID formatを決めない。

## 7. valueProposition

| Field | Decision |
| --- | --- |
| Axis | Value Proposition |
| Canonical Label | 価値訴求 |
| Canonical ID | `valueProposition` |
| Status transition | `READY_FOR_DECISION` → `DECIDED` |
| Evidence | value communication、problem-solution、benefit、offer |
| Migration | `NO_IMMEDIATE_RENAME_REQUIRED` |
| Backend Wire ID | `BLOCKED` |

## 8. informationHierarchy

| Field | Decision |
| --- | --- |
| Axis | Information Hierarchy |
| Canonical Label | 情報階層 |
| Canonical ID | `informationHierarchy` |
| Status transition | `READY_FOR_DECISION` → `DECIDED` |
| Evidence | heading hierarchy、section order、navigation information、content grouping |
| Migration | `NO_IMMEDIATE_RENAME_REQUIRED` |
| Backend Wire ID | `BLOCKED` |

## 9. trustStructure

| Field | Decision |
| --- | --- |
| Axis | Trust Structure |
| Canonical Label | 信頼構造 |
| Canonical ID | `trustStructure` |
| Status transition | `READY_FOR_DECISION` → `DECIDED` |
| Evidence | proof、authority、credibility、FAQ、trust signals |
| Migration | `NO_IMMEDIATE_RENAME_REQUIRED` |
| Backend Wire ID | `BLOCKED` |

## 10. differentiationClarity

| Field | Decision |
| --- | --- |
| Axis | Differentiation Clarity |
| Canonical Label | 差別化明確性 |
| Short Label | 差別化 |
| Canonical ID | `differentiationClarity` |
| Status transition | `READY_FOR_DECISION` → `DECIDED` |
| Evidence | unique claim、positioning、message distinctiveness |
| Migration | `NO_IMMEDIATE_RENAME_REQUIRED` |
| Backend Wire ID | `BLOCKED` |

## 11. decisionSupport

| Field | Decision |
| --- | --- |
| Axis | Decision Support |
| Canonical Label | 意思決定支援 |
| Short Label | 意思決定 |
| Canonical ID | `decisionSupport` |
| Status transition | `READY_FOR_DECISION` → `DECIDED` |
| Evidence | pricing、comparison、friction reduction、readiness、decision information |
| Migration | `NO_IMMEDIATE_RENAME_REQUIRED` |
| Backend Wire ID | `BLOCKED` |

## 12. 1 Axis = 1 ID Policy

`1 Formal Axis Identity = 1 Canonical ID / DECIDED`。同一Axisに複数Canonical IDsを恒久併存させない。Canonical ID、Canonical Label、Short Labelを別metadataとして維持する。

## 13. Legacy Policy

Canonical IDと異なるlegacy/fixture keyはcompatibility mapping、legacy alias、migration sourceとして扱うが、複数Canonical IDsにはしない。5 approved IDsは現行candidate keysと一致するため即時rename不要。ただし現行fixture/mappingを正式Canonical Contractとして認定せず、metadata modelへの責任移行を別Phaseで設計する。

## 14. Funnel exclusion

導線強度は本Decision対象外。`funnelStrength`は`NOT_CANONICAL / RENAME_CANDIDATE`、`userFlowQuality`は`PROPOSED / NEEDS_DISCOVERY`。5 ID承認から`funnelStrength`を6つ目へ自動採用しない。

## 15. Canonical ID status 5 / 6

| Axis | Canonical ID status |
| --- | --- |
| 価値訴求 | `valueProposition / DECIDED` |
| 情報階層 | `informationHierarchy / DECIDED` |
| 導線強度 | `NEEDS_DISCOVERY` |
| 信頼構造 | `trustStructure / DECIDED` |
| 差別化明確性 | `differentiationClarity / DECIDED` |
| 意思決定支援 | `decisionSupport / DECIDED` |

Canonical ID overallは5 / 6 `DECIDED`だが、6軸すべてが決まっていないため`NEEDS_DISCOVERY`を維持する。

## 16. PD-02B status

PD-02B overallは`NEEDS_DISCOVERY`を維持する。RemainingはFunnel Axis Canonical ID、Canonical Order、Axis Definitions、Versioning、Backend Wire ID。PD-02 parentもPD-02B remaining、PD-02C、PD-02Dが未完のため`NEEDS_DISCOVERY`。

## 17. Backend boundary

Backend Wire IDは`BLOCKED`。今回のProduct/Frontend IDsをRails/OpenAPIが同じstringで使用するかはPD-02Cの別Decisionである。PD-02Cは決定済み5 IDsをProduct Identityとして参照できるが、Funnel ID未決定のためFull 6-axis Backend schema implementationを開始しない。

PD-02DはFormal Axis Setと決定済み5 IDsを参照できる。Funnel ID、missing/partial representation、fallback、`partially_completed` semanticsは未決定である。

## 18. Order boundary

Canonical Orderは`NEEDS_DISCOVERY`。本書の列挙順、表の行順、fixture orderをProduct orderとして扱わない。

## 19. Definition boundary

正式Axis Definitionsは`NEEDS_DISCOVERY`。決定済み5 IDsについてもdefinition本文、included/excluded evidence、adjacent-axis boundary、examplesは別Decisionである。導線軸ではDefinitionがID決定の前提になる。

## 20. Versioning boundary

Axis meaning version、Formula version、Backend schema version、Snapshot lineage versionの関係は`NEEDS_DISCOVERY`。今回version fieldやmigration schemaを追加しない。

## 21. Standardization impact

Planningレベルで新たに解禁する:

- canonical axis metadata key。
- 5-axis stable domain identifiers。
- canonical/short label lookup model。
- stable accessibility identifier planning。
- Self / Competitor mapping alignment planning。
- generic axis-aware presentation contract planning。
- domain Axis type design planning。

Source implementationは別Phaseである。Funnel ID、`funnelStrength` rename、Canonical Order統一、Backend enum/schema、formula/threshold、semantic score colors、missing-value contract、versioned axis contractは引き続き禁止する。

## 22. Remaining

- Funnel Axis Definition Evidence WorkshopとCanonical ID Decision。
- Canonical Order、正式Axis Definitions、Versioning、Backend Wire ID。
- PD-02C formula/backend contractとPD-02D missing/partial contract。
- 承認済み5 IDsを正式metadata modelへ接続するStandardization implementation plan。

推奨次Product DecisionはPD-02B Funnel Axis Definition & Canonical ID。推奨次PhaseはPD-15 Funnel Axis Definition Evidence Workshop。Alternative AはPD-02B Canonical Order Discovery、Alternative BはPD-02D Missing / Partial Score Contract Discovery。

Quality result: `npm run quality` exit 0。Svelte check 0 errors / 0 warnings、ESLint 0 errors / 38 warnings、OpenAPI 18/18、Frontend Inventory unresolved imports 0 / cycles 0、22 files / 257 tests、production build、auth smoke、route smoke、client secret boundary 63 build filesがPASSした。

## 23. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-11 Axis Set / Label Approval](69-pd02b-explicit-product-owner-approval-record.md)
- [PD-12 Canonical ID Discovery](70-pd02b-canonical-id-funnel-naming-discovery.md)
- [PD-13 Five IDs Decision Review](71-pd02b-five-canonical-ids-decision-review.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Development Log](../DEVELOPMENT_LOG.md)
