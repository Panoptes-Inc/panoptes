# Phase B-2 Implementation Record

実施日: 2026-08-07

## 実装内容

- Competitor View Modelに`url`、`insightLines`、`actionLines`を追加
- Competitor詳細buttonからexpanded detailを開閉可能にした
- expanded detailへ外部URL、観察insight、推奨actionを追加
- 既存の最大2件比較interactionを維持
- Self View Modelのaction candidate sourceを`self.actionCards`に限定
- Self component propsからStrategy payload依存を除去
- View Model回帰テスト5件を追加
- Vitestで`$lib`を解決するaliasを追加
- 移植不要9件、移植完了2件の旧component計11件を削除

## 変更ファイル

- Competitor正本: `CompetitorAnalysisTab.svelte`、`CompetitorAnalysisExpandedCard.svelte`、`CompetitorAnalysisCompareStage.svelte`、`competitor-analysis-view-model.ts`
- Self正本とSnapshot接続: `SelfAnalysisTab.svelte`、`self-analysis-view-model.ts`、`PanoptesSelfTab.svelte`、`PanoptesSnapshotSurface.svelte`
- Test設定・回帰test: `vitest.config.js`、`tests/unit/snapshot-view-model.test.ts`
- Architecture・audit: `frontend-active-graph.md`、`snapshot-component-map.md`、`20-component-cleanup-backlog.md`、`21-snapshot-component-comparison.md`、`snapshot-field-mapping.csv`、本書
- 削除: Competitor 2件、Industry 6件、Self 3件の旧Snapshot component

## 移植した要素

| Domain | 要素 | 移植元 | 移植先 |
|---|---|---|---|
| Competitor | URL | `card.url` | `CompetitorAnalysisCardViewModel.url` → expanded link |
| Competitor | insight list | `card.insightLines` | `viewModel.insightLines` → expanded list |
| Competitor | action list | `card.actionBullets` | `viewModel.actionLines` → expanded list |
| Competitor | detail open/close | legacy conditional panel | `detailCompetitorId` + expanded card |
| Self | analysis action責務 | `self.actionCards` | evaluation/recommendation view model |

## 移植しなかった要素

- Legacy固有のborder radius、spacing、旧layout: 現行Feature UIを正本とするため
- hard-coded AI summary: 現行payloadのinsight/summaryを優先
- Screenshot / confidence: 現行domain/APIにfieldがなく、要件化もされていないため`ADD_TO_API_LATER`
- tooltip/modal/accordion/loading UI: 旧11件にも固有要件がなく、Snapshot containerの状態管理を維持

## 削除component

Competitor 2件、Industry 6件、Self 3件の合計11件。完全な一覧は`docs/architecture/snapshot-component-map.md`に記録した。

## Test

`tests/unit/snapshot-view-model.test.ts`に以下を追加した。

- Competitor URL / insight / action / score / radar mapping
- Competitor empty cards
- Industry 6 sectionのdomain object保持
- Self score / radar / action source境界
- Self partial/empty collection

## Visual確認

- in-app browserでdevelopment previewへの接続を試みたが、localhost URL policyにより実画面確認は継続不能だった
- 代替としてDOM、CSS、component構造、breakpoint、overflow、text wrappingを確認
- Competitor詳細の条件分岐、button/link、mobile 1 column ruleを確認
- Industry/Selfは全fieldのrender pathを確認
- 本格的なScreenshot比較はB-3 backlogへ送った

## Quality結果

- `npm run quality`: 成功（exit code 0）
- ESLint: error 0 / warning 69（baseline 93以下）
- unresolved import: 0
- tests: 6 files / 37 tests passed
- production build: 成功
- Rails/OpenAPI変更: なし

## 未解決事項

- OpenAPIのSnapshot payloadはtyped section化前のgeneric object
- ScreenshotとSelf confidenceは要件化された場合にAPI contract判断が必要
- `SelfAnalysisStrategyRecommendation*`という内部名は責務とずれ始めており、B-3で名称整理候補
- 本格的visual regression基盤は未導入

## Phase B-3 backlog

1. `SignUpForm.svelte`（1,127行）の表示、入力状態、認証orchestration、timer/DOM処理を分離
2. `SelfAnalysisStrategyRecommendation*`をSelf action candidateに改名するか判断
3. Snapshot payloadのOpenAPI typed schema化
4. Screenshot / confidence要件の有無を決定
5. component visual regression基盤の導入

Strategy Plan Rail 2件のproduct decisionは、指示どおりB-3の責務分割より後まで保留する。
