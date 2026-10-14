# Phase PD-24 — PD-02B Snapshot Order Lineage Evidence Workshop

Date: 2026-08-20  
Phase type: Evidence Workshop / Documentation only  
Decision authority exercised: None

## 1. Scope

Snapshotの保存、取得、表示、Axis identity、Axis order、Radar再構築、version metadataをrepository evidenceから追跡した。Source、schema、fixture、Radar、Rails、BFF、OpenAPI、Formulaは変更していない。

## 2. Starting State

PD-02 / PD-02Bは`NEEDS_DISCOVERY`、Canonical Orderは`DECIDED`、Radar Comparabilityは`READY_FOR_DECISION / NOT_APPROVED`、Snapshot Order Lineageは`SNAPSHOT_ORDER_LINEAGE_UNKNOWN`、Order Versioningは`NEEDS_DISCOVERY`、Backend Wire ID / PD-02C / PD-02Dは`BLOCKED`だった。

## 3. Snapshot Definitions

| Repository concept | Classification | Meaning |
| --- | --- | --- |
| `PanoptesAnalysisSnapshotPayload` | `PRODUCTION_PRESENTATION` | Frontendが表示するanalysis result shape |
| `currentSnapshot` / `lastStableSnapshot` | `PRODUCTION_PRESENTATION` | 現在表示用と再分析中の安定表示用state |
| mock backend snapshot | `MOCK / PERSISTENCE` | dev flag時だけ使うJSON/localStorage record |
| `dummySnapshot` | `FIXTURE / PREVIEW` | deterministic preview fallback |
| OpenAPI `AnalysisSnapshot.payload` | `API_CONTRACT / DRAFT` | generic objectの未実装contract draft |
| historical spec/audit | `LEGACY / DOCUMENTATION` | current persistence contractではない |
| screenshot artifact | `DOCUMENTATION / PLANNED` | 画像artifact。semantic analysis Snapshotとは別 |

## 4. Source Inventory

主要Evidenceは`src/lib/panoptes/types.ts`、`api/mock/snapshot-factory.ts`、`api/mock/state.ts`、`api/mock-backend.ts`、`api/mock/runtime-ticker.ts`、`db/dummy/panoptes_dummy_ui.ts`、Self / Competitor view-modelとRadar component、project detail store、canonical/unavailable client、Rails schema/routes、OpenAPI draft、Snapshot architecture docsである。

## 5. Source Classification

Production表示型とstoreは存在するが、production business APIはunavailable clientへ接続される。永続化Evidenceはdev mockのlocalStorageだけであり、fixtureをproduction persistence contractとして扱わない。Railsはidentity / organization boundaryのみ、OpenAPIはdraft、snapshot history docsはarchitecture intentである。

## 6. Persistence Boundary

Canonical production Snapshot persistenceは`NOT_IMPLEMENTED`。dev mockはbrowserで`panoptes.mock.v3_3.state`へMockState全体をJSON保存し、SSRではmodule memoryを使う。Preview fixtureはmodule内データであり永続化ではない。Supabase、Rails、PostgreSQL、BFFによる実装済みSnapshot保存は見つからない。

## 7. Persisted Schema

Mockで保存されるpayloadは`analysisSnapshotId`、`projectId`、`versionLabel`、`analyzedAt`、`siteName`、`meta`、`competitors`、`industry`、`self`、`strategy`、`panoai`、`strategyPlans`、`phaseTasks`を持つ。`organizationId`、`analysisId`、`schemaVersion`、`axisVersion`、`orderVersion`、`formulaVersion`、`definitionVersion`、model/prompt version、per-axis completenessはない。OpenAPI draftの`version`とgeneric `payload`は実装済みschemaのEvidenceではない。

## 8. Axis Identity Persistence

方式は混在する。Self `radar[]`とIndustry `rating.metrics[]`は`label + value`を持つordered item arrayで、Canonical IDを持たない。Dummy seedにはnamed legacy keysがあるが表示payloadへlabel arrayとして変換される。Competitor snapshotはaggregate scoreだけで、6-axis identity/valueを保存しない。

## 9. Axis Order Persistence

`axisOrder`、`axisIds`、`orderVersion`等の明示fieldはない。ただしmockのSelf / Industry配列はJSON array orderを暗黙に保存する。これは`Order not explicitly persisted`であって`Order irrelevant`ではない。Competitorの6-axis orderはsnapshotに保存されない。

## 10. Runtime Reconstruction

Self view-modelは`source.radar.map`で保存済み順序とlabelを維持し、値をclampする。Dummy / previewはprivate `AXIS_KEYS` orderから配列を生成する。Competitorは`COMPETITOR_COMMON_AXIS_LABELS`の固定順とaggregate scoreから6点を合成する。`Object.entries()`による偶然のorder reconstructionはactive pathで確認していない。

## 11. Positional Contract Risk

Self RadarとCompetitor Radarはいずれもarray indexから角度・頂点座標を決める。Selfはlabel/valueが同一itemなのでparallel arraysではないが、item positionがgeometry semanticsになる。Competitorは固定label indexと合成式を対応させる。判定は`HIGH_COMPATIBILITY_RISK`候補である。

## 12. Legacy Funnel Key

`funnelStrength`はdummy/preview seedとmapperにnamed fieldとして存在し、`導線強度`へ変換される。Canonical production snapshotへ永続化されたEvidenceはない。将来fixtureやlegacy JSONをmigration inputにする場合は`userFlowQuality`へのexplicit mappingが必要だが、本Phaseでは追加しない。

## 13. Label / Short Label Risk

Dev mockでは日本語labelがSelf / Industry array itemに入り、localStorageへ保存されるため、presentation labelが実効identityを兼ねる。Self mockには`差別化指数`、`意思決定`、`信頼根拠`等のalternate / short labelも保存される。Canonical IDなしのlabel renameはcompatibility debtである。Competitor short labelsはruntime constantでありsnapshot identityとしては保存されない。

## 14. Radar Data Flow

SelfはSnapshot → project detail store → `PanoptesShellMainSurface` → `PanoptesSnapshotSurface` → Self tab → `createSelfAnalysisViewModel` → `SelfAnalysisComparisonPanel` → index-based polar coordinates。CompetitorはSnapshot aggregate card → competitor view-model → `createCompetitorRadarPoints` → Radar chart → index-based coordinates。Order確定点はSelfではpayload、Competitorではruntime constantである。

## 15. Radar Index Coupling

`labels[]`と`scores[]`のparallel arrayはない。ただしSelfでは各`{label,self,industry}` itemのindex、Competitorでは各generated pointのindexが角度を決めるため、label/value/positionがsemantic contractとしてcoupleする。

## 16. Radar Shape Risk

Canonical Orderはvalue → information → flow → trust → differentiation → decision、current active baselineはvalue → flow → differentiation → information → trust → decisionである。同じAxis scoreをindexだけ替えると各頂点の角度が変わりpolygon shapeも変わる。Canonical Order導入はidentity-preserving reorderとvisual regression reviewを必要とする。

## 17. Historical Comparison

Active productに任意のhistorical snapshotを選ぶstate、`selectedSnapshotId`、before/after Radar比較はない。`currentSnapshot`と`lastStableSnapshot`は再分析中の安定表示用であり履歴比較ではない。ただしmock保存済みSelf配列を将来current runtime orderへ変換すると過去のvisual meaningを再解釈するriskがある。

## 18. Snapshot Comparison Features

History、timeline、diff、previous snapshot selector、historical radarはactive production featureとして確認できない。Mockに複数snapshot recordはあるがUI comparison contractではない。比較に関するspec/audit記述は`DOCUMENTATION / FUTURE`として区別する。

## 19. Product Snapshot Contract

Frontendはcommitted Snapshotを表示し、再分析中はlast stable Snapshotを保持する。Production business adapterは未接続で、Rails canonical model/APIもない。したがってFrontend payloadを確定済みProduct persistence contractへ昇格しない。

## 20. Partial Snapshot Relation

Runtimeは`partially_completed`をterminal warning付き表示可能状態として扱うが、mock tickerはcompleted snapshotをcommitするだけでpartial-axis fixtureやcompleteness schemaはない。Partial SnapshotでどのAxis score/orderを保存するかは`UNKNOWN / PD-04 AND PD-02D DEPENDENCY`である。

## 21. Version Metadata

Axis / Order lineage用のexplicit metadataは`NO_EXPLICIT_VERSION_METADATA`。Frontendの`versionLabel`とOpenAPI draftのinteger `version`は存在するが、schema、axis set、definition、canonical order、formulaのどれをversioningするか定義されていない。

## 22. Formula Lineage

Snapshot scoreからformula、weight、normalization、analysis versionを追跡できない。`FORMULA_LINEAGE_NOT_TRACEABLE`。Formula自体は本PhaseのDecision対象外であり、PD-02Cへversion metadata requirementだけを渡す。

## 23. Definition Lineage

Snapshotが6 Formal Definitionsのどのrevisionに基づくかを示すfieldはない。現状は`DEFINITION_LINEAGE_NOT_TRACEABLE`。Definitionsが将来変わる場合、過去結果の意味を固定するためversioned semantic contractが必要かPD-25で判断する。

## 24. Order Lineage Classification

最終分類は`OLC-F MIXED / KNOWN_PARTIALLY_ORDER_SENSITIVE`。内訳はSelf / Industry mock=`ORDER_IMPLICITLY_PERSISTED_IN_LABEL_BEARING_ARRAYS`、Competitor=`RUNTIME_RECONSTRUCTED`、canonical production persistence=`NOT_IMPLEMENTED`である。単一の`ORDER_EXPLICITLY_PERSISTED`または`ORDER_INDEPENDENT`とは分類できない。

## 25. Compatibility Risk

総合判定は`HIGH`。根拠はindex-based Radar geometry、label-as-identity、alternate labels、legacy fixture key、explicit version不在、SelfとCompetitorで異なるlineage方式である。ただしこれはdev mock / future migration riskを含む評価であり、未実装のproduction snapshot databaseに既存データがあるとは主張しない。

## 26. Canonical Order Migration Risk

Canonical Orderをsourceへ導入する場合、Self配列のID付与、legacy label/key mapping、legacy order識別、snapshot-specific render order、schema/axis/order version、order-aware fixture/testが候補となる。Competitorはruntime-generated valuesの意味とorderを同時に固定する必要がある。Migration方法は未決定・未実装。

## 27. Explicit Order Persistence Options

| Option | Evidence-based assessment |
| --- | --- |
| OPERSIST-A explicit `axisOrder` | historical renderを直接再現しやすいが、Axis IDsとの重複正本とvalidationが必要 |
| OPERSIST-B Canonical IDs + versioned semantic contract | stable identityを中心にできる有力候補。version resolverとBackend contractが必要 |
| OPERSIST-C current orderで常時表示 | 過去意味を暗黙変更するため現Evidenceではhigh risk |
| OPERSIST-D schema次第で不要 | named semantic records等のfuture schema次第。現状は根拠不足 |

本Phaseでは採用Optionを決めない。

## 28. Immutable Historical Interpretation Principle

「後続のDefinition / Order変更で過去Snapshotの意味を暗黙変更しない」原則は`READY_FOR_DECISION / NOT_APPROVED`。Order-sensitive配列とversion metadata不在が必要性を強めるが、Product Owner承認なしに`DECIDED`へしない。

## 29. Minimum Lineage Metadata

PD-25のcandidateは`schemaVersion`、`axisSetVersion`、`axisDefinitionVersion`、`canonicalOrderVersion`、`formulaVersion`、commit/created timestamp、present/missing Axis IDsとcompleteness stateである。Model/provider/prompt metadataはreproducibility要件に応じるcandidateであり必須とは決めない。

## 30. Persistence Ownership

Product historyのsource of truth候補はRails/business backendとPostgreSQL上のSnapshot record、およびanalysis artifact metadataである。Frontend localStorage/storeはdev behaviorまたはpresentation cacheに限定すべきというarchitecture方向と整合する。正式Owner/schemaはBackend Contract reviewで決める。

## 31. Backend Dependency

正式lineage persistenceにはRails model/table、API schema、BFF mapping、authorization / organization scopeが必要である。Backend Wire IDは`BLOCKED`を維持する。PD-02B Versioningはsemantic metadataを定義できるが、transport/storage実装はBackend/API責務である。

## 32. PD-02C Impact

PD-02Cにはformula identity/version、normalization/weight revision、calculation provenanceをSnapshotから追跡可能にする要件候補を渡す。Formula、Weight、Aggregation値や方式は本Phaseで決めない。

## 33. PD-02D Impact

PD-02Dにはpresent Axis IDs、missing Axis IDs、completeness state、per-axis missing reason/qualityをlineage candidateとして渡す。`partially_completed`時の保存・表示・Strategy昇格 semanticsは`BLOCKED`のまま決めない。

## 34. Radar Comparability Impact

保存順とruntime順が混在し、order変更がpolygon shapeを変えるEvidenceにより、同一comparison contextのOrder統一Policyの必要性は強まった。Readinessは`READY_FOR_DECISION / NOT_APPROVED`を維持し、自動承認しない。

## 35. Snapshot Order Lineage Final Status

`SNAPSHOT_ORDER_LINEAGE_UNKNOWN`から`KNOWN_PARTIALLY_ORDER_SENSITIVE / OLC-F MIXED`へ更新する。限定条件としてcanonical production persistenceは`NOT_IMPLEMENTED`、dev mock lineageは既知、Competitorはruntime reconstructedであることを必ず併記する。

## 36. Versioning Readiness

Axis / Order Versioning Discoveryは`PARTIALLY_READY`。Risk、metadata gap、option、ownership dependencyはPD-25を開始できる水準だが、final persistence designとimplementationはBackend Contractにblockedされる。次PhaseはPD-25を推奨する。

## 37. Remaining

Immutable Historical Interpretation Principle、OPERSIST option、version semantics、migration policy、Radar Comparabilityは未決定。Canonical backend Snapshot schema、partial completeness、formula lineage、historical comparison UXも未実装・未決定である。Frontend Inventory parentは再openしない。

## 38. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-23 Approval Record](./81-pd02b-canonical-order-explicit-product-owner-approval-record.md)
- [PD-22 Decision Review](./80-pd02b-canonical-order-decision-review.md)
- [PD-21 Discovery](./79-pd02b-canonical-order-discovery.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Snapshot Component Map](../architecture/snapshot-component-map.md)
- [Panoptes Shell Flow](../architecture/panoptes-shell-flow.md)
- `src/lib/panoptes/types.ts`
- `src/lib/panoptes/api/mock/snapshot-factory.ts`
- `src/lib/panoptes/api/mock-backend.ts`
- `src/lib/panoptes/api/mock/runtime-ticker.ts`
- `src/lib/db/dummy/panoptes_dummy_ui.ts`
- `docs/api/openapi-draft.yaml`
- `rails/db/schema.rb`
- `rails/config/routes.rb`
