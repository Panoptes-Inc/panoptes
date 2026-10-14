# Phase B-3E Landing Secondary 実装記録

## 判定

- 到達性: **ACTIVE_DUPLICATE**（`/`は1回、`/lp`・`/plan`は2回描画）
- 分割: **SPLIT_NOW**
- 理由: 変更前408行のうちscript 187行、markup 171行、style 49行。CSS肥大ではなくanimation/geometryとSVG visualの責務混在

## 実装

- `LandingHeroSecondarySection.svelte`をcomposition専用へ変更
- `LandingHeroSecondaryVisual.svelte`へSVG markup/semantics/styleを移動
- `landing-hero-wave.ts`へpure geometryとGSAP lifecycleを移動
- tickerだけでなくtimeline/gradient tweenもcomponent破棄時にcleanup
- reduced motion対応
- Secondary SVG IDをinstanceごとに一意化
- pure geometry test 4件を追加

copy、gradient、path初期値、GSAP duration/ease/stagger、preview、position、zoom、shadow、font、spacingは維持した。

## 行数

| File | Before | After |
|---|---:|---:|
| `LandingHeroSecondarySection.svelte` | 408 | 30 |
| `LandingHeroSecondaryVisual.svelte` | - | 230 |
| `landing-hero-wave.ts` | - | 159 |
| wave unit test | - | 36 |

総行数削減自体を目的にせず、composition / visual / animation-geometry境界を明示した。

## Browser / visual regression

一時的なpublic QA harness内に1440px、768px、390pxのiframe viewportを作り、変更前後を同一条件で比較した。QA routeと一時policy/layout変更は検証後に削除した。

- Section、SVG、previewのx/y/width/heightが3幅すべて一致
- html scrollWidth/scrollHeightが一致
- wave、gradient、text wrapping、preview、stacking、overflowに視覚差なし
- SVG accessible nameを確認
- `/`のSecondary 1件、`/lp`と`/plan`の2件描画を確認
- Secondary SVG ID衝突は解消、Primaryの固定6 ID重複は残存

Screenshots:

- Before: `C:/Users/ibuki/.codex/visualizations/2026/08/06/019fd476-cce1-7d21-9ef5-97c551273e8e/landing-secondary-before.png`
- After: `C:/Users/ibuki/.codex/visualizations/2026/08/06/019fd476-cce1-7d21-9ef5-97c551273e8e/landing-secondary-after.png`

変更前後ともQA iframe load時に同じ`MutationObserver.observe` errorを観測した。今回の分割による増加ではないが、発生元は別途調査が必要。

## Quality

| Gate | Result |
|---|---|
| `npm run quality` | exit 0（65.1秒） |
| Svelte check | 0 errors / 0 warnings |
| ESLint | 0 errors / 60 warnings、変更ファイル0 warning |
| format | pass |
| OpenAPI | 18 operations / 18 unique operationIds、pass |
| test | 10 files / 99 tests passed（新規4 tests） |
| auth smoke | 5 scenarios passed |
| production build | pass、unresolved import 0 |
| secret boundary | 67 build files scanned、pass |
| route smoke | 7 routes passed |

Rails、OpenAPI、Auth、Contact、Strategy Plan Railは変更していない。新規循環依存はbuild/import graph上で検出されていない。

## UI変更

通常motion環境の意図的なvisual/copy/responsive変更なし。a11yとしてSVG accessible name、一意ID、reduced-motion停止だけを追加した。

## Defer

- route layout重複の解消
- Primaryのwave helper移行と固定SVG ID解消
- Tablet/Mobile preview overflow redesign
- Design Token / Tailwind / breakpoint設計
- MutationObserver errorの発生元調査

## 次対象

Landingの重複を閉じる観点では`LandingHeroPrimarySection.svelte`を次に監査し、Secondary helperへの安全な移行とSVG ID一意化を検討する。独立した大型component順位では`StrategyAnalysisRoadmapPhaseCard.svelte`（約400行）が次候補。
