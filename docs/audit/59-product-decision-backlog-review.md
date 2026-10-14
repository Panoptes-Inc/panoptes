# Phase PD-1 — Product Decision Backlog Review

実施日: 2026-08-18

## Scope

Phase B-3Tで`PRODUCT_DECISION`へ分離したPD-01〜PD-05を、Product判断に進められる粒度へ整理した。Source、UI、route、Frontend Architecture、Rails、BFF、OpenAPIは変更していない。Product仕様を推測せず、Product Decision Registerを新しい親成果物とした。

## Evidence

- B-3Tのfinal inventory、closure review、Frontend Structure Policy、Development Log
- 現行route/page/layoutと内部navigation
- Self/Competitorのaxis label・順序・score presentation helper/test
- production非到達のStrategy Plan Rail/Card
- AnalysisJob runtime adapterの`partially_completed`投影
- `/app/login/settings`のroute content、auth境界、内部導線

Evidence分類は次の通りである。

- `KNOWN`: source、test、既存正本文書から直接確認可能
- `UNKNOWN`: Product/Business/Backendの未提示意図
- `ASSUMPTION`: 判断材料に使用しない仮説
- `NEEDED`: 次回reviewまでに収集すべきEvidence

## Review Result

| ID | Title | Status | Owner | Timing | Primary block |
|---|---|---|---|---|---|
| PD-01 | Route Intent | `NEEDS_DISCOVERY` | `OWNER_REQUIRED` — Product Owner/PM候補 | `BEFORE_CLOSED_BETA` | route lifecycle、SEO/analytics |
| PD-02 | Score / Common Axes Contract | `NEEDS_DISCOVERY` | `OWNER_REQUIRED` — Product + Analysis/Data候補 | `BEFORE_FRONTEND_STANDARDIZATION` | shared axes、semantic score contract |
| PD-03 | Strategy Plan Rail | `NEEDS_DISCOVERY` | `OWNER_REQUIRED` — Product/Strategy候補 | `CAN_DEFER` | DEFER 2 files、Strategy IA |
| PD-04 | partially_completed Snapshot Workflow | `BLOCKED` | `OWNER_REQUIRED` — Product + Backend/API候補 | `BEFORE_BACKEND_CONNECTION` | Snapshot/Strategy/usage contract |
| PD-05 | Settings Route Lifecycle | `READY_FOR_DECISION` | `OWNER_REQUIRED` — Product Owner候補 | `NOW` | temporary production route cleanup |

`DECIDED`、`DECISION_SCHEDULED`、`DEFERRED`に進めた項目はない。

## PD-01 — Route Intent

### Current behavior

`/`、`/lp`、`/plan`は同一Marketing compositionを使い、route固有metadata・analytics差や`/lp`・`/plan`への内部導線は確認できない。`/app`と`/app/analysis`は同じShell entryを使うが、App Top Heroは`/app`のみで、Search UIは`/app/analysis`へ遷移する。

### Questions and options

Marketing URLがcanonical/alias、campaign、将来別Page、legacy、保持必須URLのどれか、App URLがalias/deep-link/別state entryのどれかをProductが決める。選択肢は、固有用途の明文化、canonical+redirect、期限付き現状維持である。

### Evidence gap, owner, timing, blocking

SEO、campaign、analytics、Product IA、future navigation/deep-linkが不足する。Product Owner/PMをAccountable候補とし、closed beta前に判断する。route lifecycle・metadata・semantic namingをblockするが、現行compositionは維持できる。

## PD-02 — Score / Common Axes Contract

### Current behavior

SelfとCompetitorは近い6概念を表示するが、長短labelと順序が異なる。UIはscoreをclampし、Company/Expanded Cardのring accentも24度/30度で異なる。既存testは現行presentationの回帰防止であり、Product formulaの承認Evidenceではない。

### Questions and options

canonical ID・正式名称・順序・short label・scale・rounding/clamp・欠損・tone・total/layer関係・visualization formulaを決める。選択肢は、canonical ID+surface label、完全統一、surface固有軸+明示mappingである。

### Evidence gap, owner, timing, blocking

Product data dictionary、formula owner、Backend schema、実データ例が必要である。Product + Analysis/DataのJoint Decisionを推奨する。score/axis semantic standardization前に判断し、一般token・taxonomyは先行可能とする。

## PD-03 — Strategy Plan Rail

### Current behavior

Plan Rail/Cardは互いにのみ参照され、production callerがない。Project/site、day、progress、priority、fit score、status等を持つ一方、現行StrategyにはRoadmap/Project Railと30/60/90 task表現がある。Inventory上は2件とも`DEFER`である。

### Questions and options

target use case、Roadmapとの差、navigation、approval、用語、将来releaseを確認する。候補は`KEEP_AS_FUTURE_FEATURE`、`MERGE_CONCEPTUALLY_WITH_ROADMAP`、`REDEFINE`、`REMOVE`、`DEFER_FOR_PRODUCT_DESIGN`である。

### Evidence gap, owner, timing, blocking

Product brief/prototypeがないため`NEEDS_DISCOVERY`とし、暫定的に`DEFER_FOR_PRODUCT_DESIGN`を推奨する。Product/Strategy owner候補が、対象directoryの標準化または削除前に再審査する。production behaviorはblockしない。

## PD-04 — partially_completed Snapshot Workflow

### Current behavior

Frontendは`partially_completed`をterminalとしてpollingを止め、completed互換表示とwarningへ投影し、reanalysisを許容する。Project current Snapshot更新は推測せず、Strategy sourceへの自動昇格も行わない。

### Questions and options

partial Snapshotの保存・履歴・比較・手動承認・欠損layer・retry・quality通知・usage/billingを決める。候補は、閲覧可能だがStrategy利用不可、provenance付き手動昇格、SnapshotへcommitせずJob結果のみ、の3案である。

### Evidence gap, owner, timing, blocking

Rails Snapshot/AnalysisJob/usage/retry/lineage/approval contractがないため`BLOCKED / BACKEND CONTRACT REQUIRED`である。Product + Backend/API + Analysis/StrategyのJoint Decisionが必要で、Backend connectionとclosed beta前に解消する。

## PD-05 — Settings Route Lifecycle

### Current behavior

`/app/login/settings`はstarter scaffoldを表示し、内部導線がない。直接URLではprotected App layoutのauth/Organization境界を継承するが、owner・purpose・review date・removal criteriaがない。

### Questions and options

Settingsを予定するか、URLを維持するか、account/organization/authのどのscopeかを決める。Option Aは機能承認までroute削除、Bは期限・owner付きtemporary保持、Cは正式featureとして再定義である。

### Evidence gap, owner, timing, blocking

settings roadmapと外部bookmark/link有無の確認は必要だが、選択肢提示に必要な技術Evidenceは揃っているため`READY_FOR_DECISION`とした。Product Ownerが`NOW`判断し、owner・purpose・期限が示せない場合はOption Aを推奨する。削除は本Phaseでは実施していない。

## Decision Dependency Graph

```text
PD-01 -> Product IA / SEO / Analytics -> route lifecycle / metadata / naming
PD-02 -> Product metric / Analysis domain / Backend schema -> axes mapping / semantic tokens / score UI
PD-03 -> Strategy IA / Product Design -> keep / merge / redefine / remove -> DEFER cleanup
PD-04 -> Rails AnalysisJob / Snapshot / usage / lineage -> Product workflow -> BFF / client / Strategy promotion
PD-05 -> Product / Auth / Organization ownership -> remove / temporary retain / formal feature route
```

Architectureやstandardizationは決定結果を利用する側であり、Product semanticsを決定する側ではない。循環依存は確認されていない。

## Frontend Standardization Impact

| Area | Result | Detail |
|---|---|---|
| Component taxonomy | `NON_BLOCKING` | generic taxonomyは進行可能 |
| Directory | `PARTIAL` | PD-03/PD-05対象は処遇決定まで保留 |
| Design Token | `PARTIAL` | 基礎tokenは可能、PD-02 semantic score tokenは保留 |
| Tailwind | `NON_BLOCKING` | 独立して計画可能 |
| Responsive | `NON_BLOCKING` | baselineは進行可能 |
| UI Regulation | `PARTIAL` | score、partial state、temporary route exposureに影響 |
| Naming | `PARTIAL` | route/axis/plan/settings semanticsに影響 |

October Frontend Standardizationは全面停止しない。Product意味を含まない基礎作業を進め、上表の限定領域をdecision checkpointにする。

## Recommended Decision Order

1. PD-05 — Evidence availabilityとproduction exposure
2. PD-01 — closed beta前のURL/SEO/analytics
3. PD-02 — score/axis standardization dependency
4. PD-04 — Backend contract discoveryと共同判断（並行開始可）
5. PD-03 — production非到達のため期限付きで後順位

## Artifacts and Parent Relationship

- Product Decisionの親成果物: [Product Decision Register](../product/product-decision-register.md)
- Phase固定監査: 本書
- 閉鎖済みFrontend InventoryにはRegisterへのreferenceのみ追加し、closure statusとinventory情報は再オープンしていない。
- `frontend-standardization-plan.md`は本Phaseでは作成していない。

## Changes

- `docs/product/product-decision-register.md`を新規作成
- `docs/audit/59-product-decision-backlog-review.md`を新規作成
- `docs/inventory/frontend-inventory-summary.md`へRegister referenceのみ追加
- `docs/DEVELOPMENT_LOG.md`へPhase PD-1要約を追記

Source、UI、route、Frontend Architecture、Rails、BFF、OpenAPI変更は0件である。

## Validation

- `npm run quality`: PASS（exit 0）
- `npm run check`: Svelte errors 0 / warnings 0
- `npm run lint`: ESLint errors 0 / warnings 38
- `npm run format:check`: PASS
- `npm run check:openapi`: PASS（18 operations / 18 unique operation IDs）
- `npm run check:frontend-inventory`: PASS（124 reusable、119 active canonical、DEFER 2、unresolved imports 0、cycles 0）
- `npm run test`: 22 files / 257 tests PASS
- `npm run test:auth-smoke`: 5 scenarios PASS
- `npm run build`: PASS
- `npm run test:secrets`: PASS（64 build files）
- `npm run test:smoke`: 11 routes PASS

指示書の`check:inventory`に相当する現行script名は`check:frontend-inventory`であり、`quality`にも同名で組み込まれている。初回sandbox実行ではVitest config解決時の上位directory read制限で停止したため、通常権限で同一commandを再実行し、exit 0を確認した。

## Remaining

- 5件すべてDecision Ownerの明示割当が必要
- PD-05のProduct Owner判断
- PD-01 route intent discovery
- PD-02 data dictionary/formula contract discovery
- PD-04 Rails/API contract discovery
- PD-03 Product Design reviewと再開条件/期限
- October Standardization parent artifactは別Phaseで作成
