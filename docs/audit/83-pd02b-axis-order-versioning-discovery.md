# Phase PD-25 — PD-02B Axis / Order Versioning Discovery

Date: 2026-08-21  
Phase type: Product / Domain Contract Discovery  
Decision authority exercised: None

## 1. Scope

Formal Common 6 AxisのSet、Identity、Definition、Canonical Order、Formula、Snapshot schema、Backend contract、Analysis pipelineを別version domainとして整理し、historical interpretation、compatibility、migration、ownershipのDecision-ready proposalを作成した。Source、schema、Radar、fixture、Rails、BFF、OpenAPI、Formulaは変更していない。

## 2. Starting State

PD-02 / PD-02B=`NEEDS_DISCOVERY`、Snapshot lineage=`KNOWN_PARTIALLY_ORDER_SENSITIVE / OLC-F MIXED`、compatibility risk=`HIGH`、Versioning=`PARTIALLY_READY`。Canonical production persistenceは未実装、Radar ComparabilityとImmutable Historical Interpretation Principleは`READY_FOR_DECISION / NOT_APPROVED`、Backend Wire ID / PD-02C / PD-02Dは`BLOCKED`だった。

## 3. Version Domain Taxonomy

| Domain | Owns | Does not own |
| --- | --- | --- |
| V-A Axis Set | Axis追加・削除・統合・分割 | Formula、storage shape |
| V-B Axis Identity | Canonical IDとsemantic continuity | wire casing、display alias |
| V-C Axis Definition | meaning、included/excluded、cross-axis boundary | score calculation |
| V-D Canonical Order | domain conceptual ordering | mandatory UI / processing order |
| V-E Formula | weight、normalization、aggregation、threshold | Axis meaning |
| V-F Snapshot Schema | persisted shape、required fields、migration | Product semantics |
| V-G Backend Contract | API/serialization/DB representation | semantic identity decision |
| V-H Analysis Pipeline | model、prompt、extractor、engine revision | Formula definitionそのもの |

## 4. Single vs Multi Version

V-1 single versionはmetadataが少ないが、semantic、calculation、persistence変更を区別できず不採用候補。V-2 fully separateはlineageが明確だが、Set/Identity/Definitionの同時coordinationとSnapshot metadataが過剰。V-3 Hybridを推奨し、immutable `axisContractVersion`にAxis semantic contractをまとめ、`formulaVersion`、`snapshotSchemaVersion`、`analysisPipelineVersion`、actual order profileを分離する。

## 5. Axis Contract Scope

`axisContractVersion`候補はFormal Axis Set、Canonical IDs、Canonical Labels、Definitions、Included/Excluded、Cross-Axis Boundaries、Canonical Order、Multi-Axis semantic rules、Primary/Supporting Evidence conceptを含む。Formula、display scale implementation、Snapshot storage、Backend wire、model/prompt、feature-specific orderは含めない。

## 6. Axis Set Change

Axis追加・削除・統合・分割は`SEMANTICALLY_INCOMPATIBLE / MIGRATION_REQUIRED`。Axis Contractの新versionを必須候補とし、cross-version comparisonはexplicit mappingがなければunsupportedとする。

## 7. Identity Change

Canonical ID renameは意味不変でもAPI、Snapshot、mapping、fixture、analyticsへ影響するため`BREAKING_IDENTITY_CHANGE / MIGRATION_REQUIRED`。旧IDはcompatibility alias/mapping inputとして保持し、新しいAxis Contract versionを発行する。Backend wire表記変更だけならBackend Contract側の変更である。

## 8. Definition Change

| Class | Meaning | Proposed action |
| --- | --- | --- |
| D-1 Editorial | 意味不変のtypo/grammar | `COMPATIBLE`、audited erratum。semantic version bump不要候補 |
| D-2 Clarification | scopeを変えず曖昧さを低減 | `PRESENTATION_COMPATIBLE`だがanalysis interpretationへ影響し得るため新Axis Contract version候補 |
| D-3 Boundary | included/excluded/Axis ownership変更 | `SEMANTICALLY_INCOMPATIBLE`、new version |
| D-4 Expansion | scope拡張 | `SEMANTICALLY_INCOMPATIBLE`、new version |
| D-5 Narrowing | scope縮小 | `SEMANTICALLY_INCOMPATIBLE`、new version |

## 9. Order Change

Canonical Order reorderはAxis identity/definitionが同じならsemantic score meaningを変えないが、Radar、array payload、historical presentationへ影響する`PRESENTATION_COMPATIBILITY_CHANGE / MIGRATION_REQUIRED_WHEN_POSITIONAL`。Canonical OrderはAxis Contractに含めるためcontract versionを上げ、実際のSnapshot orderは別のorder profileまたはexplicit ordered IDsで追跡する案を推奨する。

## 10. Formula Change

Weight、normalization、aggregation、threshold、submetric変更は`SCORE_INCOMPARABLE`候補。Axis meaningと独立して`formulaVersion`を必須候補とする。異version scoreの直接比較はexplicit calibration/normalization contractがない限りunsupportedまたはwarning required。

## 11. Snapshot Schema Change

Array→ID object、label identity→Canonical ID、version metadata追加等はV-Fで管理する。Semantic contractとは分離したimmutable `snapshotSchemaVersion`を推奨する。Schema migrationは元recordのlineageを失わないread mapping、lazy/eager migrationのいずれかを明示する。

## 12. Backend Contract Change

API path/version、field name/casing、serialization、DB representationはV-G。Meaning不変のwire変更でAxis Contractを上げない。既存`/api/v1` policyはfield追加をcompatible、field削除・意味変更・enum縮小をbreakingとするが、Snapshot contractは未実装である。

## 13. Immutable Historical Interpretation

Proposal: Historical Snapshot / Analysis Resultは将来のAxis Definition、Order、Formula変更によって暗黙に再解釈されてはならず、生成時のsemantic/formula/order-sensitive contextを識別可能にする。Current stylingでre-renderすることとcurrent semanticsへ読み替えることを分離する。Statusは`READY_FOR_DECISION / NOT_APPROVED`。

## 14. Snapshot Lineage Requirements

Snapshotは生成時のAxis Contract、Formula、Schema、Analysis Pipelineと、actual ordered Axis IDs/order profile、timestampを解決可能にする。PD-02Dが決めるpresent/missing Axisとcompletenessもlineageへ接続する。Version labelやcreatedAtだけでは不十分である。

## 15. Minimum Metadata Models

| Model | Assessment |
| --- | --- |
| A: schema + axis contract + canonical order + formula + actual order/present axes | correctnessは高いがcanonical orderとcontractの重複に注意 |
| B: schema + axis contract + formula + timestamp + completeness | 簡潔だがactual legacy/override orderを復元できない |
| C: set + identity + definition + order + formula + pipeline + schema | granularだがcoordination/metadataが過剰 |
| Recommended Hybrid | `snapshotSchemaVersion`、`axisContractVersion`、`formulaVersion`、`analysisPipelineVersion`、`orderProfileId`またはexplicit ordered Axis IDs、`createdAt`、PD-02D completeness/present IDs |

## 16. Version Identifier Options

Immutable positive integerをprimary identifierとして推奨候補とする。SemVerはcompatible/breaking判断を番号へ過度に埋め込み、dateは同月複数revisionに弱く、hashはhuman explainabilityが低い。Contract fingerprintはinteger recordのintegrity/audit補助として有用だがprimary IDにしない。

## 17. Contract Immutability

Published versionはimmutableを推奨。Meaning、Canonical ID、Canonical Label、Definition、Canonical Orderを同じversion番号で書き換えない。D-1 editorial correctionは意味とmachine contractを変えないaudited erratumとして扱える候補だが、identity/interpretationへ影響する場合は新versionを発行する。

## 18. Version Lifecycle

`DRAFT → ACTIVE → DEPRECATED → RETIRED`を推奨。Deprecated/Retiredは新規生成可否を制御しても、Historical Snapshotのread/resolveを禁止しない。Lifecycle transitionとversion content mutationを分離する。

## 19. Current Contract v1 Assessment

決定済み6 Axis Set、IDs、Labels、Definitions、Canonical Order、semantic policiesは`PRODUCT_CONTRACT_V1_CANDIDATE / READY_FOR_DECISION`。正式v1発行にはProduct Owner approval、immutable registry/record、effective date、owner、fingerprint候補が必要。現Phaseでv1を発行しない。

## 20. Order Version Independence

Canonical Order専用versionをAxis Contractと並ぶ第二のsemantic正本にすることは非推奨。Canonical Order変更はAxis Contract versionへ含める。一方、actual feature/Snapshot orderはCanonical Orderと異なり得るため`orderProfileId/version`またはexplicit ordered Axis IDsを独立lineageとして保持する案を推奨する。

## 21. Formula Version Independence

`formulaVersion`はAxis Contractから必ず分離するProposal。Same Axis Meaning / Different Score Calculationを識別し、score comparabilityを判定するためである。Statusは`READY_FOR_DECISION / NOT_APPROVED`。

## 22. Analysis Model Version

Model、prompt、extractor、crawler、pipeline変更も結果へ影響し得る。`analysisPipelineVersion`をarchitecture/PD-02C ownership候補とし、必要ならmodel/provider/prompt fingerprintをそのregistry内に持つ。個別provider名をPD-02B semantic contractへ埋め込まない。

## 23. Compatibility Classes

`COMPATIBLE`、`PRESENTATION_COMPATIBLE`、`SEMANTICALLY_INCOMPATIBLE`、`SCORE_INCOMPARABLE`、`MIGRATION_REQUIRED`、`UNSUPPORTED`、`UNKNOWN`を採用Proposalとする。一つの変更へ複数classを付けられる。

## 24. Compatibility Matrix

| Change | Axis Contract | Order | Formula | Snapshot Schema | Historical Risk | Version Action |
| --- | --- | --- | --- | --- | --- | --- |
| non-canonical label typo | unchanged | unchanged | unchanged | unchanged | low | erratum / no semantic bump |
| Canonical label rename | changed | unchanged | unchanged | legacy label mapping | medium | new Axis Contract |
| Canonical ID rename | changed | ID mapping | unchanged | migration required | high | new Axis Contract + mapping |
| Definition clarification | likely changed | unchanged | unchanged | unchanged | medium | new Axis Contract candidate |
| Definition expansion/boundary | changed | unchanged | reevaluate | unchanged | high | new Axis Contract |
| Axis add/remove/merge | changed | changed | reevaluate | changed | high | new Axis Contract + migration |
| Order reorder | changed | changed | unchanged | positional mapping | high visual | new Axis Contract + order profile |
| Weight/normalization/threshold | unchanged | unchanged | changed | metadata reference | high comparison | new Formula version |
| schema array→object | unchanged | mapping | unchanged | changed | high migration | new Schema version |
| `funnelStrength`→`userFlowQuality` | unchanged canonical meaning | legacy mapping | unchanged | mapper/alias record | medium/high | read compatibility mapping |

## 25. Legacy funnelStrength

`funnelStrength`は`LEGACY_MIGRATION_SOURCE`でありCanonical aliasではない。Snapshot schema compatibility mapperまたはversioned legacy alias registryが`userFlowQuality`へ変換し、Axis Contract registryはcanonical IDだけを返す案を推奨する。

## 26. Japanese Label Migration

Known legacy schema/order profileの下でexact normalized label-to-ID mappingを行う。曖昧label、未知label、重複labelは推測せず`UNSUPPORTED / MANUAL_REVIEW`。Canonical label rename後も旧label mappingをversioned compatibility dataとして保持する。

## 27. Short Label Migration

Short/alternate labelはpresentation aliasでありidentityへ昇格しない。Known source/profileに限定したtranslation tableでCanonical IDへ変換し、global fuzzy matchingを禁止する。

## 28. Positional Array Migration

Array→ID record migrationにはsource schema versionとlegacy order profileが必要。既知orderならindex-to-ID mapping、未知orderなら値のsemantic mappingを断定せずunsupported/manual reviewとする。元payloadをimmutableに保持しread mappingを第一候補とする。

## 29. Legacy Order Profile

`LEGACY_UI_ORDER_V1 = value → flow → differentiation → information → trust → decision`をmigration-only profile候補とする。Formal Canonical Orderではなく、適用source、labels、schema、owner、effective rangeを限定する。Mock factoryの別orderは別profileまたはexplicit orderとして扱い、一括推測しない。

## 30. Radar Historical Compatibility

R-A historical viewは生成時orderで再表示しfaithful visualを保つ。R-C comparison viewはCanonical IDで値をalignし、双方に同一明示orderを適用してnormalized comparisonであることを表示する。R-B current orderへの無表示変換は非推奨。Historical viewとcomparison viewを別modeとして扱う。

## 31. Radar Comparability Policy

Proposal: 同一Radar comparison contextでは同一Canonical ID set、同一明示display order、compatible Axis Definition、compatible Formulaを要求し、異なる場合はwarning/unsupportedとする。`READY_FOR_DECISION / NOT_APPROVED`を維持する。

## 32. Snapshot Compatibility Policy

SC-Aのsemantic/formula/order lineage preservationとSC-Bのcurrent stylingを組み合わせた`STRICT_SEMANTICS / CURRENT_PRESENTATION`を推奨。過去semantic contextを保ち、CSS/layout等はcurrent UIで描画可能。Order-sensitive historical viewは生成時order、normalized comparisonは明示共通orderを使う。SC-C Always Current Interpretationは非推奨。

## 33. Cross-Version Comparison

- Formula version差: calibration/normalization contractなしでは直接比較不可。
- Definition version差: D-1のみcompatible候補。Clarificationはwarning、boundary/expansion/narrowingは直接比較不可候補。
- Axis Set差: explicit mapping下のintersection-onlyまたはunsupported。欠軸を0扱いしない。
- Order差: Canonical IDsとFormula/Definitionがcompatibleならsemantic valuesはID-based比較可能。Radarは同一明示orderへnormalizeする。

## 34. Migration Categories

`NO_MIGRATION`、`READ_COMPATIBILITY_MAPPING`、`LAZY_MIGRATION`、`EAGER_MIGRATION`、`RECOMPUTE_REQUIRED`、`UNSUPPORTED / MANUAL_REVIEW`を候補とする。Immutable originalを保つread mappingをdefault候補とし、meaningを復元できない場合に値をguessしない。

## 35. Source of Truth

Version registryの将来Source of TruthはRails/business backend + PostgreSQLまたはdeployと同期するversioned application configurationを候補とする。Snapshotが参照するpublished versionはimmutableかつBackendから解決可能にする。Frontendを唯一のVersion Contract ownerにしない。

## 36. Product vs Backend Responsibility

PD-02Bはversion対象、semantic scope、change/compatibility classes、historical principle、Product migration semanticsを所有する。PD-02C/Backendはfield名、wire format、DB schema、validation、registry persistence、BFF mapping、authorization、API compatibilityを所有する。Formula/pipelineの具体的version recordはAnalysis/Data + Backend責務である。

## 37. PD-02B Close Criteria

Product OwnerがHistorical Interpretation Principle、Hybrid Axis Contract strategy、Order profile strategy、Formula/Schema separation、Published immutability、Current Contract v1、Compatibility classes、Product-level migration policyを承認すればPD-02B semantic discoveryはclose-ready。Backend field implementationはPD-02Cへhandoff可能だが、Backend Wire ownership handoffをRegisterで明示する必要がある。

## 38. Backend Wire Ownership

Canonical semantic IDsはPD-02Bで6/6決定済み。Wire casing、enum、serialization、API/DB schemaはarchitecture上PD-02C/Backend責務であり、`PD-02C_HANDOFF_RECOMMENDED / READY_FOR_DECISION`。明示DecisionまではBackend Wire statusを`BLOCKED`のまま維持する。

## 39. Product Owner Questions

承認対象はHistorical immutability、Axis Contract versioning、Hybrid scope、Order profile、Formula/Schema分離、current contract v1、published immutability、Definition/Label change policy、ID rename breaking、Radar historical/normalized modes、cross-formula comparison、legacy profile、read mapping default、Backend source of truth、Backend Wire handoffである。質問全18件はData Dictionaryへ正本化した。

## 40. Decision Readiness

| Decision | Readiness |
| --- | --- |
| Immutable Historical Interpretation | `READY_FOR_DECISION / NOT_APPROVED` |
| Axis Contract Hybrid Strategy | `READY_FOR_DECISION / NOT_APPROVED` |
| Order Profile Strategy | `READY_FOR_DECISION / NOT_APPROVED` |
| Formula Version Separation | `READY_FOR_DECISION / NOT_APPROVED` |
| Snapshot Schema Version Separation | `READY_FOR_DECISION / NOT_APPROVED` |
| Current Contract v1 | `READY_FOR_DECISION / NOT_APPROVED` |
| Published Version Immutability | `READY_FOR_DECISION / NOT_APPROVED` |
| Compatibility Classes/Policy | `READY_FOR_DECISION / NOT_APPROVED` |
| Backend Wire Ownership Handoff | `READY_FOR_DECISION / BLOCKED_UNTIL_APPROVAL` |

## 41. Remaining

Product Owner approval、Version registry/field/schema、effective dates、fingerprint、legacy source detection、ambiguous data policy、Formula/pipeline registry、PD-02D completeness、Radar implementation、migration executionは未決定・未実装。PD-02B / PD-02は`NEEDS_DISCOVERY`を維持する。

## 42. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-24 Snapshot Lineage Workshop](./82-pd02b-snapshot-order-lineage-evidence-workshop.md)
- [PD-23 Canonical Order Approval](./81-pd02b-canonical-order-explicit-product-owner-approval-record.md)
- [PD-20 Definition Approval](./78-pd02b-remaining-five-axis-definitions-explicit-approval-record.md)
- [PD-17 Funnel Approval](./75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [API Boundary](../architecture/api-boundary.md)
- [Snapshot Component Map](../architecture/snapshot-component-map.md)
- [Analysis Job State Machine](../api/analysis-job-state-machine.md)
- [OpenAPI Draft](../api/openapi-draft.yaml)
