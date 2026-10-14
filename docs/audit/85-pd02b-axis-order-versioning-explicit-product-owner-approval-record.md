# Phase PD-27 — PD-02B Axis / Order Versioning Explicit Product Owner Approval Record

Date: 2026-08-21  
Decision: PD-02B Canonical Axis Identity / Axis & Order Versioning  
Status: `APPROVED / DECIDED / COMPLETE`

## 1. Approval Evidence

- **Approval Evidence:** 「PD-02BのAxis / Order Versioning Proposalを承認する。」
- **Approval Date:** 2026-08-21
- **Decision Owner:** Product Owner
- **Approval result:** Phase PD-26の17 Decision対象を一括承認したものとして記録する。

## 2. Approved Decisions

以下をすべて`DECIDED`とする。

1. Immutable Historical Interpretation
2. Hybrid Version Architecture
3. Axis Contract Scope
4. Canonical Order inclusion
5. Actual Order lineage
6. Formula Version separation
7. Snapshot Schema Version separation
8. Analysis Pipeline Boundary
9. Immutable positive-integer Version Identifier
10. Published Immutability
11. `DRAFT → ACTIVE → DEPRECATED → RETIRED` lifecycle
12. Current Contract v1 designation
13. Compatibility Classes
14. Migration Policy
15. `STRICT_SEMANTICS / CURRENT_PRESENTATION`
16. Radar Comparability
17. Backend Wire Handoff to PD-02C

## 3. Axis Contract v1

Current decided Formal Common 6 Axis semantic contractを`Axis Contract v1 / ACTIVE`とする。対象はFormal Axis Set、Canonical IDs/Labels、Definitions、Included/Excluded、Cross-Axis Boundaries、Canonical Order、Multi-Axis Evidence policy、Observable Evidence Boundaryである。

Formula、Snapshot/DB/API schema、Analysis Pipeline、Backend Wire Contract、actual UI order override、CSSはAxis Contract v1に含めない。Axis Contract v1の承認は、それらのv1や実装完了を意味しない。

## 4. Versioning Architecture

VersioningはHybrid Architectureを採用し、`axisContractVersion`、`formulaVersion`、`snapshotSchemaVersion`、`analysisPipelineVersion`、actual order lineage、Backend Contractを分離する。Canonical OrderはAxis Contractに含め、actual orderは`orderProfile`またはexplicit ordered IDsで記録する。

Primary version identifierはimmutable positive integerとする。ACTIVE/published contentはimmutableで、Meaning、Boundary、Identity、Order変更はnew versionを必要とする。Lifecycleは`DRAFT → ACTIVE → DEPRECATED → RETIRED`とし、historical reconstructionに必要なmetadataを保持する。

## 5. Historical Interpretation

Historical resultは生成時のAxis Contract、Formula、Pipeline、actual order lineageで解釈し、将来のDefinition、Order、Formula、Pipelineで暗黙に再解釈しない。Current stylingでの再描画は許容するが、historical semanticsの置換を意味しない。

Snapshot presentationは`STRICT_SEMANTICS / CURRENT_PRESENTATION`とする。Standalone historical Radarは生成時actual orderを使用できるが、比較時はCanonical IDでalignし、同一explicit orderへ正規化する。異orderのpolygonを無注記で直接比較しない。

## 6. Compatibility / Migration

Compatibility Classesは`COMPATIBLE`、`PRESENTATION_COMPATIBLE`、`SEMANTICALLY_INCOMPATIBLE`、`SCORE_INCOMPARABLE`、`MIGRATION_REQUIRED`、`UNSUPPORTED`、`UNKNOWN`とする。Canonical ID変更には`BREAKING_IDENTITY_CHANGE`を付与する。

Migrationは`NO_MIGRATION`、`READ_COMPATIBILITY_MAPPING`、`LAZY_MIGRATION`、`EAGER_MIGRATION`、`RECOMPUTE_REQUIRED`、`MANUAL_REVIEW`、`UNSUPPORTED`で分類する。Known schema、known identity、known order profileが確認できる場合だけautomatic mappingを許可し、unknown/ambiguous dataを推測しない。`LEGACY_UI_ORDER_V1`はmigration-only profileでありCanonical Orderではない。

## 7. Backend Wire Handoff

PD-02Bはversion semantics、change classification、historical/compatibility/migration rules、Axis Contract v1 designationを所有する。DB/API fields、wire representation、validation、persistence、mapper/registry implementationはPD-02CおよびBackendの責務へ正式にhandoffする。

この承認によりBackend Wire ownershipはPD-02Bのclose blockerではなくなる。ただしBackend Wire、version registry、Snapshot schema、Formula、migration/Radarのsource implementationは未着手で、PD-02Cを含む後続Decisionまでは`BLOCKED`を維持する。

## 8. PD-02B Close Result

PD-26で定義した14 Close Criteria群は、Radar ComparabilityとBackend Wire Handoffを含めてすべて満たされた。Versioning overallは`DECIDED`、Axis Contract v1は`ACTIVE`、PD-02Bは`DECIDED / COMPLETE`として正式に閉じる。

親PD-02はFormula / Backend Contract（PD-02C）とMissing / Partial Score Contract（PD-02D）が未決定のため`NEEDS_DISCOVERY`を維持する。PD-02BのcloseはPD-02全体のcloseやsource implementation完了を意味しない。

## 9. Remaining / Handoff

- PD-02C: Formula owner/version、Backend Wire/DB/API fields、registry/persistence/validationを決定する。
- PD-02D: Missing / Partial Score、completeness、`partially_completed`との関係を決定する。
- Implementation: Version constants、Snapshot schema、mapper、migration、Radar comparison、Formula、TypeScript/Svelte、Rails/BFF/OpenAPIは別Phaseで扱う。
- Source impact: 本Phaseはdocumentation onlyであり、application source、fixture、order、Rails、BFF、OpenAPIを変更していない。

## 10. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-26 Axis / Order Versioning Decision Review](./84-pd02b-axis-order-versioning-decision-review.md)
- [PD-25 Axis / Order Versioning Discovery](./83-pd02b-axis-order-versioning-discovery.md)
- [PD-24 Snapshot Order Lineage Evidence Workshop](./82-pd02b-snapshot-order-lineage-evidence-workshop.md)
- [Development Log](../DEVELOPMENT_LOG.md)
