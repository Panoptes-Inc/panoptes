# Phase PD-26 — PD-02B Axis / Order Versioning Decision Review

Date: 2026-08-21  
Phase type: Product Decision Review / Documentation only  
Approval evidence: `NOT_PROVIDED`

## 1. Scope

PD-25のHybrid Versioning Proposalを、Snapshot lineage、historical interpretation、compatibility、migration、Backend ownership、PD-02B closureの観点で最終Reviewした。Product Owner承認、Source、schema、Formula、Radar、Rails、BFF、OpenAPI変更は行わない。

## 2. Previous State

PD-02 / PD-02B=`NEEDS_DISCOVERY`、VersioningとPD-02B close readiness=`DECISION_READY / NOT_APPROVED`。Axis semantic identity/orderはDECIDED、Backend Wire ID / PD-02C / PD-02Dは`BLOCKED`だった。

## 3. Snapshot / Compatibility Input

Snapshot lineage=`KNOWN_PARTIALLY_ORDER_SENSITIVE / OLC-F MIXED`、risk=`HIGH`、production canonical persistence=`NOT_IMPLEMENTED`。Mockにはlabel identity、positional array、runtime order、Radar index couplingがあり、Axis/Definition/Order/Formula/Schema lineage metadataはない。

## 4. Historical Interpretation Review

Formal Proposalを支持する。Historical Snapshot / Analysis Resultを将来のDefinition、Canonical Order、Formula、Pipelineで暗黙再解釈せず、生成時のsemantic/calculation/execution/order contextを識別可能にする。Current stylingとcurrent semanticsを分離する。`READY_FOR_DECISION / NOT_APPROVED`。

## 5. Hybrid Version Architecture Review

V-3 HybridをFinal Proposalとする。`axisContractVersion`、`formulaVersion`、`snapshotSchemaVersion`、`analysisPipelineVersion`、actual `orderProfile`/ordered IDs、Backend Contract version boundaryを分離する。Single versionとFully Granular versionは採用しないProposal。`READY_FOR_DECISION / NOT_APPROVED`。

## 6. Axis Contract Scope

Set、Canonical IDs/Labels、semanticに関係するShort Label governance、Definitions、Included/Excluded、Cross-Axis Boundaries、Canonical Order、Multi-Axis Evidence、Primary/Supporting concept、Observable Evidence Boundaryを含む。Formula、schema、wire、pipeline、actual UI order、CSSは含めない。`READY_FOR_DECISION / NOT_APPROVED`。

## 7. Order Version Strategy

Canonical OrderはAxis Contractへ含め、独立`canonicalOrderVersion`をprimaryにしない。Order changeはnew Axis Contract + `PRESENTATION_COMPATIBILITY_CHANGE`、positional historyでは`MIGRATION_REQUIRED`候補。`READY_FOR_DECISION / NOT_APPROVED`。

## 8. Actual Order Profile

Canonical domain defaultと、Snapshot/Radar/legacy dataが実際に使用したorderを分離する。Actual orderは`orderProfile`またはexplicit ordered Canonical IDsでlineage化する。`READY_FOR_DECISION / NOT_APPROVED`。

## 9. Formula Version

FormulaはAxis Contractから独立する。Weight、normalization、aggregation、submetric、formula-level threshold変更はnew `formulaVersion`。Compatibility contractなしの異version scoreは直接比較不可候補。`READY_FOR_DECISION / NOT_APPROVED`。

## 10. Snapshot Schema Version

Persisted shape、field/identity representation、array→object、metadata/completeness structureを`snapshotSchemaVersion`で管理しsemantic/formulaから分離する。`READY_FOR_DECISION / NOT_APPROVED`。

## 11. Pipeline Version Boundary

Extraction、model/provider、prompt family、rules、pipeline behaviorを`analysisPipelineVersion`候補で識別する。BoundaryはDecision-ready、具体registry/fieldsはAnalysis/Data + Backend/Architectureへhandoffする。`READY_FOR_DECISION / NOT_APPROVED`。

## 12. Version Identifier

Primary identifierはimmutable positive integerをFinal Proposalとする。Human-facing release label/fingerprintは補助metadata候補。`READY_FOR_DECISION / NOT_APPROVED`。

## 13. SemVer Assessment

SemVerは各contractでmajor/minor/patch運用を要求し、compatibility classを別metadataで表せるためprimary IDに採用しないProposal。`READY_FOR_DECISION / NOT_APPROVED`。

## 14. Published Immutability

ACTIVE/published contract contentはimmutable。Meaning、Identity、Boundary、Orderを変える場合はnew version。Pure typo/format/meaning-preserving wordingだけをaudited erratum候補とする。`READY_FOR_DECISION / NOT_APPROVED`。

## 15. Version Lifecycle

`DRAFT → ACTIVE → DEPRECATED → RETIRED`をFinal Proposalとする。Deprecated/Retiredもhistorical reconstruction用metadata/read resolutionを保持する。`READY_FOR_DECISION / NOT_APPROVED`。

## 16. Current Contract v1

決定済みFormal 6 Axis semantic contractのみをAxis Contract Version 1 / ACTIVEとするProposal。Formula、Snapshot Schema、Pipeline、Backend Contract v1を自動確定しない。`PRODUCT_CONTRACT_V1_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`。

## 17. Compatibility Classes

`COMPATIBLE`、`PRESENTATION_COMPATIBLE`、`SEMANTICALLY_INCOMPATIBLE`、`SCORE_INCOMPARABLE`、`MIGRATION_REQUIRED`、`UNSUPPORTED`、`UNKNOWN`をFinal Proposalとする。`BREAKING_IDENTITY_CHANGE`はCanonical ID変更のchange typeとして併記する。`READY_FOR_DECISION / NOT_APPROVED`。

## 18. Label Change

Noncanonical typo/formatはcompatible erratum候補。Canonical Label renameはnew Axis Contract + legacy label mapping候補。意味の変更有無をreviewする。

## 19. ID Change

Canonical ID変更は`BREAKING_IDENTITY_CHANGE + SEMANTICALLY_INCOMPATIBLE + MIGRATION_REQUIRED`をdefaultとし、new Axis Contractを要求するProposal。

## 20. Axis Set Change

Add/remove/merge/splitは`SEMANTICALLY_INCOMPATIBLE + MIGRATION_REQUIRED`、new Axis ContractをdefaultとするProposal。

## 21. Definition Change

D-1 Editorialはcompatible erratum候補、D-2 Clarificationはcompatibility review/new contract candidate、D-3 Boundary・D-4 Expansion・D-5 Narrowingはsemantic incompatible/new contractとする。

## 22. Order Change

Canonical Order reorderはAxis Contract changeで、semantic score identityが同じならpresentation compatibility change。Positional historyではmigration required。Actual order profileを参照する。

## 23. Formula Change

Formula/weight/normalization変更はnew formulaVersion、default `SCORE_INCOMPARABLE`。Calibration/compatibility contractがある場合だけ例外。

## 24. Schema Change

Persisted structure変更はnew snapshotSchemaVersion。必要に応じread mapping、lazy/eager migrationを選び、semantic versionを不必要に上げない。

## 25. Legacy Migration Rules

Known source schema + known identity + known order profileが確認できる場合だけautomatic mappingを許可する。Unknown/ambiguous dataをcurrent contractへguessしない。`READY_FOR_DECISION / NOT_APPROVED`。

## 26. funnelStrength Migration

`funnelStrength`はCanonical aliasではない。Known legacy schema/versionに限定して`userFlowQuality`へのread compatibility mappingを許可し、global alias化しない。

## 27. Label / Short Label Migration

Japanese labelはknown exact label contract、Short Labelはknown legacy sourceに限定してCanonical IDへtranslateする。Fuzzy/global identity lookupは禁止Proposal。

## 28. Positional Migration

Known source schemaとknown order profileが必須。Order不明のarrayはautomatic migrationせず`MANUAL_REVIEW`または`UNSUPPORTED`。

## 29. Legacy Order Profile

`LEGACY_UI_ORDER_V1 = valueProposition → userFlowQuality → differentiationClarity → informationHierarchy → trustStructure → decisionSupport`をmigration-only profileとするProposal。Canonical Orderではない。`READY_FOR_DECISION / NOT_APPROVED`。

## 30. Snapshot Compatibility

`STRICT_SEMANTICS / CURRENT_PRESENTATION`をFinal Proposalとする。Historical interpretationは生成時version、current stylingは許可、order-sensitive viewはexplicit order resolutionを要求する。`READY_FOR_DECISION / NOT_APPROVED`。

## 31. Radar Compatibility

Standalone historical viewは生成時actual orderを使用可能。Cross-Snapshot comparisonはCanonical IDでalignし、同一explicit orderへ揃え、異order polygonを無注記で直接比較しない。PD-24/25のHIGH riskに直接対応するためRadar ComparabilityをPD-26 Approval ScopeとPD-02B Close Criteriaへ含める。`READY_FOR_DECISION / NOT_APPROVED`。

## 32. Cross-Version Comparison

Formula差はcompatibility/calibrationなしにdirect comparison不可。Definition D-1のみcompatible候補、D-2はreview/warning、D-3/4/5はunsupported default。Axis Set差はmapping付きintersection-onlyまたはunsupported。Order差のみならIDs/Definition/Formula compatible時にsemantic comparison可能で、Radarは共通orderへnormalizeする。

## 33. Migration Categories

`NO_MIGRATION`、`READ_COMPATIBILITY_MAPPING`、`LAZY_MIGRATION`、`EAGER_MIGRATION`、`RECOMPUTE_REQUIRED`、`MANUAL_REVIEW`、`UNSUPPORTED`をFinal Proposalとする。`READY_FOR_DECISION / NOT_APPROVED`。

## 34. Source of Truth

Version registry/persisted lineageのSource of TruthはRails/business backend + PostgreSQL、またはdeploy同期済みversioned configurationとするarchitecture directionを支持する。Frontend local stateを唯一のownerにしない。

## 35. Product / Backend Boundary

PD-02Bはversion semantics、change classes、historical/compatibility/migration rules、Contract v1を所有する。PD-02C/BackendはDB/API fields、wire、validation、persistence、mapper/registry implementationを所有する。`READY_FOR_DECISION / NOT_APPROVED`。

## 36. Backend Wire Handoff

Canonical semantic IDsは6/6 DECIDED。Wire ID/casing/serializationはPD-02C responsibilityとし、PD-02B RemainingからhandoffするProposalを支持する。`PD-02C_HANDOFF_RECOMMENDED / READY_FOR_DECISION / NOT_APPROVED`。Implementationは引き続き`BLOCKED`。

## 37. PD-02B Close Criteria

Historical Principle、Hybrid Architecture、Axis Contract Scope、Order Profile、Formula/Schema separation、Pipeline Boundary、Integer ID、Published Immutability/Lifecycle、Current Contract v1、Compatibility Classes、Migration Rules、Snapshot/Radar Compatibility、Backend Wire handoffの14 Decision群を承認条件とする。Backend field/schema implementationはPD-02Cへhandoff可能。

## 38. Product Owner Approval

Approval Evidence=`NOT_PROVIDED`。Decision OwnerはProduct Owner、承認日は未記録。承認例「PD-02BのAxis / Order Versioning Proposalを承認する。」は将来入力例でありEvidenceではない。各Decisionの個別承認・却下・差戻しを許可する。

## 39. Decision Readiness

17 Decision対象はすべて`READY_FOR_DECISION / NOT_APPROVED`。Pipeline BoundaryとBackend Wire ownershipもboundary Decisionとしてreadyだが、implementationは別Phase。Product Decisionへ昇格していない。

## 40. PD-02B Close Readiness

`DECISION_READY / BLOCKED_BY_PRODUCT_OWNER_APPROVAL`。Radar ComparabilityをClose Criteriaへ含めたため、Versioning package承認だけでRadarを除外した場合はPD-02Bをcloseしない。承認後にPD-27で`DECIDED / COMPLETE`可否を正式判定する。

## 41. Remaining

Product Owner approval、Decision Owner/date record、Version fields/registry、Snapshot/Backend schema、migration/Radar implementation、Formula contents、PD-02D completenessが残る。PD-02B / PD-02=`NEEDS_DISCOVERY`、PD-02C / PD-02D=`BLOCKED`を維持する。

## 42. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-25 Versioning Discovery](./83-pd02b-axis-order-versioning-discovery.md)
- [PD-24 Snapshot Lineage Workshop](./82-pd02b-snapshot-order-lineage-evidence-workshop.md)
- [PD-23 Canonical Order Approval](./81-pd02b-canonical-order-explicit-product-owner-approval-record.md)
- [PD-20 Definitions Approval](./78-pd02b-remaining-five-axis-definitions-explicit-approval-record.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [API Boundary](../architecture/api-boundary.md)
