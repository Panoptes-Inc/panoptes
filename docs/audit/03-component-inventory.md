# コンポーネント棚卸し

全122件の行単位情報は [component-inventory.csv](./component-inventory.csv) に収録しています。usage countは静的importの直接参照数、current statusはrouteからの静的import graph到達性です。動的文字列importは検出されませんでした。

## 集計

| 分類 | 件数 | 主な領域 |
|---|---:|---|
| Domain | 66 | competitor / industry / self / strategy / snapshot |
| Feature | 22 | analysis / admin / project-list |
| Composite UI | 10 | modal、form、tab、sheet、toast |
| Layout | 8 | header、hero、shell |
| Page-local/Dev | 8 | dummy、preview |
| UI | 5 | その他 |
| Primitive | 3 | logo/button wrapper。汎用primitive層は実質未整備 |

到達可能97、到達不能25。直接参照0のコンポーネントは23件で、残り2件は到達不能subgraph内だけで参照されています。

## 主要コンポーネント

| component | 責務 | 主なstate/side effect | 課題 |
|---|---|---|---|
| `PanoptesShellPage.svelte` | app全体controller/layout | 5 stores、onMount、polling開始停止、project/strategy action | UI orchestrationが集中、336行 |
| `PanoptesSnapshotSurface.svelte` | 5 domain tabの切替 | props 20超 | callback/props drillingが深い |
| `PanoptesAnalysisSurface.svelte` | empty/loading/failure flow | runtime propsとcallback | overlayと通常surfaceの重複経路 |
| `PanoptesSiteHeader.svelte` | global navと3 modal | local `$state` | linkとmodal actionの意味が混在 |
| `SignUpForm.svelte` | signup/login/waitlist/legal/CAPTCHA | Supabase、fetch、DOM script、timer | 1,075行、到達不能、責務過多 |
| `LandingHeroPrimary/SecondarySection` | LP SVG animation | GSAP、複数onMount | 大規模、同系animation/style重複 |
| `AdminConsole.svelte`（root側） | admin tabs/data composition | local state、dummy data | child wrapper importsが壊れている |

## Svelte 5利用状況

- `$props`: 114 components
- `$state`: 13、`$derived`: 33、`$effect`: 6、`$bindable`: 3
- `{@render children()}`: 7 occurrences
- legacy `export let`、`$:`、`createEventDispatcher`、`<slot>`、`on:event`: 0

Svelte 4/5混在は確認されず、Svelte 5記法への統一度は高いです。一方、callback propの命名・型がcomponentごとにinline定義され、共有interfaceが少ないです。

## 大規模コンポーネント

- `SignUpForm.svelte`: 1,075行
- `SurveyModal.svelte`: 455行
- `LoginModal.svelte`: 449行
- `ContactModal.svelte`: 431行
- `StrategyAnalysisRoadmapPhaseCard.svelte`: 400行
- `LandingHeroSecondarySection.svelte`: 408行
- `LandingHeroPrimarySection.svelte`: 385行
- `PanoptesShellPage.svelte`: 336行

行数だけでなく、I/O、validation、state、DOM制御、複数画面状態を同時に持つものを優先分割対象とします。

## props設計

`PanoptesSnapshotSurface`、`PanoptesStrategyTab`、strategy/roadmap系でcallbackと選択状態のpropsが増えています。API response型を直接渡す箇所と、view-modelへ変換する旧domain componentが混在します。Rails移行時は `api/contracts -> domain model -> page view model -> component props` を分け、UIからtransport field名を遮断すべきです。

## テスト

全componentについて専用test fileは0件のためCSVの`test_status`は`none`です。
# Historical baseline notice

This file records the pre-B-1 inventory and is not the current source of truth. Phase B-3P regenerated the current inventory in [`frontend-component-inventory.csv`](./frontend-component-inventory.csv) and [`52-frontend-active-graph-resync.md`](./52-frontend-active-graph-resync.md).
