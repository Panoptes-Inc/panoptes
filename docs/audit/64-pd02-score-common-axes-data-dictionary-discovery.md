# Phase PD-6 — PD-02 Score / Common Axes Data Dictionary Discovery

実施日: 2026-08-20  
Status: Completed / PD-02 `NEEDS_DISCOVERY`  
Source change: none

## 1. Scope

Self、Competitor、Industry、Strategy、Snapshot、dummy/mock/preview、types、mapping、OpenAPI/BFF/Railsにあるscore/axis evidenceを調査した。正式名称、formula、threshold、weight、ranking、eligibility、color、Backend schemaは決定・変更していない。

## 2. Evidence

主なsourceは`panoptes/types.ts`、Self/Competitor/Strategy view models、presentation helpers、mapping-aligned dummy seed、deterministic Snapshot factory、legacy preview fixture、regression testsである。過去B-3M/N/O auditsは現行behaviorの保存根拠として使用し、Product承認とは扱っていない。

## 3. Axis inventory

明示的な6軸定義/order setは5件、order variantは4件確認した。current production Self/Competitorは同じorder Aだが、Phase指示のProduct candidate order、mock Industry、mock Selfで順序が異なる。

Candidate 6 keysは`valueProposition`、`funnelStrength`、`differentiationClarity`、`informationHierarchy`、`trustStructure`、`decisionSupport`。dummy seed/mappingとSelf augmented fixtureにはあるが、cross-layer canonical IDではない。

## 4. Label variants

Selfは`差別化明確性`・`意思決定支援`、Competitorは`差別化`・`意思決定`。mock Selfは`差別化指数`・`信頼根拠`を持ち、gapには`信頼補強`もある。Industry fixtureは6 full labelsへ`平均`を付ける。axis/metric exact labelsは16、gap variant込みで17 unique strings。

## 5. ID inventory

6 candidate keysは`FRONTEND_FIXTURE_CANDIDATE`。Production payloadのradar/metricsはlabel-drivenで、OpenAPI enum、Rails field、BFF validationはない。判定は`NO_CANONICAL_ID`。

## 6. Scale inventory

- Axis/Aggregate/Fit display: 0–100前提。
- Deltas/expected lift: signed number、formal boundsなし。
- Market pressure/coordinates: 0–1 normalized、common scoreではない。
- Ring: 0–360° visualization。
- Progress/count/rank/string: separate operational/preview values。

TSは主に`number`でinteger/rangeを保証せず、decimal/roundingは未決定。Strategy plan fitはnullable。

## 7. Formula inventory

Pure presentationはclamp、percentage、score×3.6°、radar polar geometry。Product logic suspectedはCompetitor aggregate→6 axes fixed offsets、Self−8 benchmark fallback/empty68/threshold、Strategy gap→fit/improvement/progress、legacy preview派生である。

## 8. Tone/threshold inventory

Self gapはsign、Self technology labelは75/60、Industry toneはfixture directまたはaxis index、score ring/barはmetric固定色。共有good/warning/bad contractはない。

## 9. Missing values

Self/Competitor presentation helperはnon-finiteを0へ安全化する箇所がある。Self missing keyは0、source absentはbadge/radar/breakdown fallback、empty benchmarkは68。Competitor/Strategy view-modelはNaN contractが弱い。Missingとzeroを区別する正式contractはない。

## 10. Self

Aggregate overall/internal/visual、label-driven radar、breakdown、signed gapを持つ。Candidate IDsはaugmented dummy deltaだけ。`self.actionCards`は改善候補へmappingされるがscoreからStrategy proposalを生成しない。

## 11. Competitor

Company/Expandedはoverall/internal/visualを共有する。Companyはaggregateのみ、Expanded axesは3 aggregate scoresから合成。Ringはmain angle共通、Company +24°、Expanded +30°。

## 12. Strategy

Common-axis collectionはなくimpact stringsのみ。fitIndex、nullable fitScore、priority、improvement、progressは別metric。Self/Competitor scoreの暗黙aggregationはないが、view-modelにformula-like heuristicsがある。

## 13. Snapshot

一つのFrontend Snapshot payloadへ各feature固有shapeが共存する。共通axis object、ID enum、scale/formula version、completeness metadataはない。現在のproduction business APIはunavailableで、実データcontractではない。

## 14. Backend

OpenAPI 18 operations、Canonical BFF、Rails schema/model/serializer、BFF response assertionにscore/axis/metric/fit schemaはない。判定は`BACKEND_CONTRACT_REQUIRED`。

## 15. Fixture

mapping-aligned JSON、dummy mapping、deterministic factory、legacy dummy cardsでshape/formulaが異なる。すべてPreview/Mock/Test evidenceでありProduct/Backend contractではない。

## 16. Mapping

Self/Competitor/Strategy view modelsはpresentation mappingとProduct-logic-like derivationが混在する。純presentation helperは局所共有可能だが、label registry、threshold、aggregation、common score componentはDecision前に統合しない。

## 17. Decision questions

Data Dictionaryに正式ID、名称、short label、order、scale、decimal、rounding、missing、overall/layer、tone、visualization、cross-feature reuse、Backend ownership、partialの15問を記録した。

## 18. Readiness

- `READY_FOR_DECISION`: display scale、presentation angle/clamp boundary。
- `NEEDS_DISCOVERY`: naming、ID、order、formula/weight/threshold、tone。
- `BLOCKED`: Backend ownership/schema、missing/partial contract。
- PD-02 overall: `NEEDS_DISCOVERY`。

推奨OwnerはProduct Owner + Analysis/Data OwnerのJoint Decision。Backend/API、Design、Frontend consulted。

## 19. Standardization impact

Canonical label/ID/order、semantic score colors、shared threshold、missing/partial regulationは`BLOCKING`。Shared visual score/axis componentは`PARTIAL`。Generic spacing/radius/typography/surface、responsive、accessibility、directory taxonomy、Tailwind mechanicsは`NON_BLOCKING`だが、未決定semantic colorを固定しない。

## 20. Remaining

- 実データ例でcandidate ID/label/order mappingをreview。
- overall/layer/formula/weight/eligibility ownerの決定。
- Backend schema/version/provenance/completeness。
- missing/partial/PD-04 connection。
- 24°/30°、Competitor offset、Self/Strategy heuristicsの処遇。

## 21. Quality results

- `npm run check`: PASS（0 errors / 0 warnings）
- `npm run lint`: PASS（0 errors / 38 warnings）
- `npm run format:check`: PASS
- `npm run check:openapi`: PASS（18 operations / 18 unique operationIds）
- `npm run check:frontend-inventory`: PASS（unresolved imports 0 / cycles 0）
- `npm run test`: PASS（22 files / 257 tests）
- `npm run build`: PASS
- `npm run test:secrets`: PASS（63 build files）
- `npm run test:smoke`: PASS（production routes expected status、dev-only routes 404）
- `npm run quality`: PASS（exit 0。`test:auth-smoke`を含む）

詳細と正本は[Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)を参照する。
