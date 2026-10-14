# 重複・未使用・仮実装

## 確認済みの完全重複

- 空ファイル: root、`/lp`、`/plan`の3 pageと、`Contact.svelte`、`Login.svelte`、`SignUp.svelte`、`SignUpModal.svelte`。
- `src/routes/app/+page.svelte` と `src/routes/app/analysis/+page.svelte` は同一。
- `src/routes/lp/+layout.svelte` と `src/routes/plan/+layout.svelte` は同一。
- rootに`AppTopDummy.svelte`/`AppResultsDummy.svelte` wrapperがあり、`dummy/`配下にもwrapperと実体がある。

## 到達不能コンポーネント（25件）

### 旧/空/parts wrapper

- `Contact.svelte`、`Login.svelte`、`SignUp.svelte`、`SignUpModal.svelte`
- `SignUpForm.svelte`、root `SignUpBtn.svelte`
- `parts/input/signupform/SignUpForm.svelte`、`parts/button/signup/SignUpBtn.svelte`（relative importも誤り）

### 現行snapshotに似た未接続実装

- `PanoptesCompetitorCard.svelte`、`PanoptesCompetitorDetailPanel.svelte`
- `PanoptesIndustryDistributionPanel.svelte`、`MarketTypeCard`、`OpportunityPanel`、`PositionPanel`、`RatingPanel`、`SignalPills`
- `PanoptesSelfActionPanel.svelte`、`RadarPanel.svelte`、`ScorePanel.svelte`

これらは名称上は現行snapshot UIですが、実際のtab wrapperは旧 `CompetitorAnalysisTab`、`IndustryAnalysisTab`、`SelfAnalysisTab` をimportしています。見た目比較後にどちらを正本とするか決める必要があります。

### その他

- admin leaf components 4件はwrapper以外から参照されず、wrapperは対応するroot実体が存在しない。
- `StrategyAnalysisPlanRail.svelte`は未接続。内部の`StrategyAnalysisPlanRailCard`だけがdead subgraphで参照される。

## 未使用TS/JS候補

- `competitor-analysis-dummy.ts`、`industry-analysis-dummy.ts`、`self-analysis-dummy.ts`
- `panoptes_dummy_seed_v1_1_mapping_aligned.ts`
- `Panoptes_Types_Zod_v3_3_Complete.ts`（942行。Zod本体packageも未導入）
- `src/lib/index.js`
- `src/lib/mocks/dummy-score-cards.js`
- `src/lib/stores/analysis-feed.js`

静的importがないことは確認済みですが、削除判断にはGit履歴、外部tool参照、生成元確認が必要です。

## mock/dummy/preview

- browser mock API: `src/lib/panoptes/api/mock-backend.ts` + `api/mock/*`
- app fallback dummy: `src/lib/db/dummy/panoptes_dummy_ui.ts`
- legacy mock: `src/lib/mock`、`src/lib/mocks`、`src/lib/stores/analysis-feed.js`
- dev pages: `/app/dev/ui`、`/dev/analysis-preview`

4系統があり、production fallback・development fixture・visual reference・legacy sampleの区分がありません。`fixtures/`と`dev-only/`へ用途別に分け、production importを禁止するのが妥当です。

## static asset

source文字列参照がないassetは`/acce/*`、`cursor/not-allowed.png`、`logo/panoptes-mark.svg`、`logo/panoptes.svg`。`robots.txt`は直接参照不要なので未使用扱いにはしません。削除前にCSS/SVG内部参照とデプロイ仕様を確認してください。

## 統合候補

1. root/lp/plan layoutを単一marketing layoutへ。
2. `/app`と`/app/analysis`の同一entryをroute設計として一本化。
3. modalのoverlay、focus、body scroll lock、form feedbackを共通Dialog/FormFieldへ。
4. snapshot直下のPanoptes* panelと旧domain tabの二重系統を比較して正本化。
5. admin wrapperを廃止し、実体の配置を一箇所に固定。
# Historical baseline notice

This file is the initial duplicate/unused audit and includes components removed by B-1/B-2/B-3C. Current classifications and candidates are maintained in [`52-frontend-active-graph-resync.md`](./52-frontend-active-graph-resync.md) and the parent [`frontend-inventory-summary.md`](../inventory/frontend-inventory-summary.md).

