# LandingHeroSecondarySection 責務・CSS肥大監査

## 結論

到達性分類は **ACTIVE_DUPLICATE**、分割判定は **SPLIT_NOW** とした。`/`では正式なSecondary Heroとして1回描画される一方、`/lp`と`/plan`ではroot layoutと各route layoutの両方が同じPrimary/Secondaryをmountし、2回描画される。component自体は現行正本だが、active route compositionに重複がある。

408行の主因はCSSではなく、波形計算とGSAP lifecycleを含むscript 187行（45.8%）とinline SVG 163行（40.0%）である。styleは49行（12.0%）に留まるため、`STYLE_HEAVY_DEFER`ではなく、Section composition、animated visual、animation/geometryの自然な境界だけを分割した。

## 到達性・正本性

| 観点 | 結果 |
|---|---|
| production route | 到達可能 |
| `/` | root `+layout.svelte`から1回描画 |
| `/lp` | root layoutと`/lp/+layout.svelte`から2回描画 |
| `/plan` | root layoutと`/plan/+layout.svelte`から2回描画 |
| import元 | 上記3 layouts |
| dynamic import | なし |
| dev-only / test-only | なし |
| 類似component | `LandingHeroPrimarySection.svelte` |
| documentation | component inventoryがreachable / caller 3として記録 |

`/lp`と`/plan`の二重描画は今回の変更可能範囲外であり、route layout正本化へdeferした。分割後のSecondary SVG IDは`$props.id()`でinstanceごとに一意化したため、Secondary同士のSVG参照衝突は解消した。ただしPrimaryは固定IDのままで、`/lp`上に`heroFirstShapeA`等6件の重複IDが残る。

## Sectionの意味

SecondaryはPrimaryに続く **product overview / value proposition / results visual showcase** である。

- Primary: 「市場調査を数秒で」「意思決定を加速」を示す入口と`AppTopDummy`
- Secondary: 「AIで加速する競合分析」「背景のストーリーを読み解く」を示す説明と`AppResultsDummy`

左右反転した共通wave visualを使うが、copyと埋め込みproduct previewの意味は異なる。現時点でPrimaryとmergeせず、visual primitiveとanimation helperの将来共通化候補として扱う。

## 変更前の行数内訳

計測対象は408 physical lines。commentは各区分と重複計上する。

| 種別 | 行数 | 割合 |
|---|---:|---:|
| `<script>`（tag含む） | 187 | 45.8% |
| markup | 171 | 41.9% |
| `<style>`（tag含む） | 49 | 12.0% |
| trailing blank | 1 | 0.2% |
| inline SVG（markup内） | 163 | 40.0% |
| comments（重複計上） | 21 | 5.1% |

### Style 49行の責務分類

braces・blank・style tagは近接責務またはstructureへ割り当てた手動分類である。

| Style責務 | 行数 | 内容 |
|---|---:|---|
| layout | 17 | relative/absolute、width、zoom、left/bottom |
| typography | 18 | font-size、weight、letter-spacing |
| color / decoration | 10 | text color、background、radius、shadow |
| structure | 4 | style tag等 |
| spacing | 0 | 独立したmargin/paddingなし |
| responsive | 0 | media queryなし |
| animation | 0 | CSS animationなし、GSAP側 |
| pseudo element | 0 | なし |
| state style | 0 | なし |

## 責務分析

| 責務 | Markup | State | Interaction | Style量 | 独立変更 | 分割候補 |
|---|---|---|---|---:|---|---|
| Section composition | section + visual + preview | なし | なし | 小 | 高 | 親に維持 |
| English headline | SVG text/tspan | なし | GSAP intro | 中 | visualと同時 | Visual |
| Japanese copy | SVG text | なし | なし | 中 | copy変更時 | Visual |
| wave/gradient | SVG defs/path/use | ticker local state | GSAP/DOM | 中 | 高 | Visual + helper |
| results preview | `AppResultsDummy` | 子内部 | 子内部 | 小 | 高 | 既存componentをcomposition |
| CTA / badge / stats / navigation | なし | なし | なし | 0 | - | 作らない |

Decorationだけを細分化せず、SVGを1つの意味あるvisual blockとして保持した。

## State・side effect

変更前は`$state`、`$derived`、`$effect`、store、API、fetch、observer、scroll、mousemove、timerはない。一方で次のside effectがscriptへ混在していた。

- 2つの`onMount`
- GSAP timelineによるheadline intro
- `gsap.ticker`による毎frameの波形path更新
- gradient tween
- SVG querySelector / setAttribute

分割後はpure geometryとGSAP lifecycleを`landing-hero-wave.ts`へ移し、Visualの`onMount`はmount/cleanupだけを担当する。ticker、timeline、gradient tweenを全てcleanupする。reduced motion指定時はcontinuous animationを開始しない。

## Primaryとの比較

| 概念 | Primary | Secondary | 判定 |
|---|---|---|---|
| SVG viewBox | 1980×1200 | 1980×1200 | 重複 |
| wave geometry | 同一 | 同一 | helper共通化候補 |
| GSAP値 | intro/ticker/gradient同型 | 同型 | helper共通化候補 |
| orientation | left / `xMinYMin` | right反転 / `xMaxYMin` | variant |
| headline | Panoptes / See the unseen | Panoptes / AI-intelligence | 異なる |
| Japanese copy | 市場調査・意思決定 | 競合分析・story | 異なる |
| preview | AppTopDummy（右） | AppResultsDummy（左） | 異なる |
| CSS typography | ほぼ同一 | ほぼ同一 | token/Tailwind候補 |
| breakpoint | なし | なし | 共通の欠落 |

Primaryの全面変更は行わなかった。今回作成したwave helperへの移行と一意SVG ID化は、Primary専用の小規模追跡タスクとする。

## Responsive監査

既存componentにはmedia queryもbreakpointもない。

| 幅 | layout / order / visibility | typography / image | overflow実測 |
|---|---|---|---|
| Desktop 1440 | SVG 1440×872.72、preview左下 | 固定SVG typography、preview zoom 0.6 | scrollWidth 1440、横overflowなし |
| Tablet 768 | SVG 768×465.45、order不変 | preview 493.69×1216.44、y=-774.20 | 横overflowなし、previewが上方へ大きくはみ出す |
| Mobile 390 | SVG 390×236.36、order不変 | preview 437.78×2055.95、y=-1829.06 | scrollWidth 453、63px横overflow |
| Large desktop | width 100%で比例拡大 | 固定SVG座標とzoom | 専用breakpointなし |

変更前後の全実測値は一致した。既存のTablet/Mobile問題はresponsive redesign禁止のため修正していない。

## Visual / decoration

- 2つの波形pathとclipPath
- 3つのlinear gradient
- mirrored `<use>`
- gradient headlineと白いclipped headline
- absolute results preview、背景色、radius、二重shadow
- pseudo element、background image、外部SVG/image assetなし

component分割後もSVG rootはsectionの直接childであり、wrapper、stacking context、z-index、DOM順を増やしていない。

## Accessibility

変更前はSVGにaccessible name、title、description、reduced-motion分岐がなかった。分割時に次だけを追加した。

- SVGへ`role="img"`、一意な`title`/`desc`と`aria-labelledby`
- `$props.id()`によるSecondary SVG IDのinstance一意化
- `prefers-reduced-motion: reduce`時のanimation停止

copy、heading表示、keyboard操作、CTAは変更していない（このSectionにHTML heading/CTA/button/linkは存在しない）。

## 最終判定

**SPLIT_NOW**。理由は、style 12.0%に対し、domainとは独立したanimation/geometry side effectと意味的に独立したSVG visualが全体の大半を占めるため。装飾の細分化、token化、Tailwind化、breakpoint変更は行わない。

## Defer

- `/lp`・`/plan`のHero二重mountとlayout正本化
- Primaryの固定SVG ID衝突とshared wave helper移行
- Tablet/Mobileのpreview位置・overflow
- typography/color/spacingのDesign Token化
- Tailwind移行とresponsive設計
- 変更前後ともQA iframe load時に観測した`MutationObserver.observe` errorの発生元特定

