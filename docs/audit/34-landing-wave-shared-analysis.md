# Primary / Secondary Landing Wave共通化監査

## 結論

最終判断は **SHARE_ANIMATION_CORE** とした。PrimaryとSecondaryは、波形点生成、path生成、amplitude、waves、phase、flow speed、GSAP ticker、headline timeline、gradient tween、DOM attribute更新が同一だった。一方、SVGの向き、copy、gradient方向、preview、section配置は明確に異なるためVisual componentは統合しない。

Primaryに存在した固定6 IDは、Secondaryと同じ`$props.id()` + shared ID factoryへ移行した。通常routeではPhase B-3Fにより各Heroが1 instanceなので実衝突はなかったが、同一documentへPrimaryを2 instance mountするBrowser検証では6 IDすべてのcollisionを再現した。

## 変更前の重複度

| 項目 | Primary | Secondary | 共通化可能 |
|---|---|---|---|
| 波形点生成 | 30点、同じBezier control points | shared helper内で同一 | Yes |
| path生成 | Catmull-Rom、tension 1.22、A/B head | 同一helper | Yes |
| amplitude | 62 | 62 | config |
| frequency / waves | 1.6 | 1.6 | config |
| phase | `2π * waves * (1-u) - speed*t` | 同一 | Yes |
| animation speed | 0.4 | 0.4 | config |
| gradient更新 | translate 300、6秒、yoyo | 同一 | config |
| GSAP ticker | `deltaRatio()/60` | 同一 | Yes |
| DOM属性更新 | shape A/Bの`d`更新 | 同一 | Yes |
| headline timeline | opacity/y/stagger/duration/ease同一 | 同一 | Yes |
| lifecycle cleanup | tickerのみ解除 | ticker、timeline、gradient解除 | 共通化して修正 |
| reduced motion | 未対応 | helperで停止 | 共通化して修正 |

計算・animation lifecycleは実質100%重複していた。SVG markupはpath/defsの構造が近いが、左右反転、text anchor、copy行数、clip transform、gradient方向が異なるためVisual primitive統合は過剰と判断した。

## SVG ID監査

### Primary変更前

| Element | Fixed ID |
|---|---|
| path A | `heroFirstShapeA` |
| path B | `heroFirstShapeB` |
| clipPath | `heroFirstClip` |
| linearGradient 0 | `heroFirstPaint0` |
| linearGradient 1 | `heroFirstPaint1` |
| linearGradient 2 | `heroFirstPaint2` |

Primaryには`title`、`desc`、mask、filter、pattern、radialGradient IDはなかった。同一documentへ2 instancesをmountすると上記6件がすべてduplicateとなり、`querySelector`、`href`、`url(#...)`が先行instanceを参照する可能性があった。

### Secondary変更前

SecondaryはB-3Eで`$props.id()`を導入済みで、title、description、shape A/B、clip、paint 0/1/2の8 IDがinstance固有だった。

### 変更後

両Visualが`createLandingHeroSvgIds(instanceId)`を使用する。

```text
{instance}-title
{instance}-description
{instance}-shape-a
{instance}-shape-b
{instance}-clip
{instance}-paint-0
{instance}-paint-1
{instance}-paint-2
```

Svelteの`$props.id()`をcomponent top-levelで取得するため、SSRとhydrationで同じinstance ID contractを使用する。Primary / Secondary間、複数Primary間、複数Secondary間の名前空間はinstance prefixで分離される。

## 共通化判断

### 採用: SHARE_ANIMATION_CORE

Shared ownerは`src/lib/features/landing/animation/landing-hero-wave.ts`である。

- Pure wave geometry
- A/B shape path generation
- Primary / Secondaryの明示config
- SVG instance ID factory
- Headline GSAP timeline
- GSAP tickerとphase progression
- Gradient tween
- Reduced-motion gate
- Idempotent cleanup

Primary用とSecondary用configは現在同値だが、別objectとしてexportした。将来visual design上の差を戻す場合も、helperをforkせずconfigだけを変更できる。

### 不採用

- **SHARE_WAVE_MATHのみ:** Primaryのcleanup漏れとreduced-motion不一致が残るため不足。
- **SHARE_VISUAL_PRIMITIVE:** copy、orientation、gradient direction、preview sideまでvariant props化する過剰抽象化になる。
- **KEEP_SEPARATE:** 同一animation logicの二重保守を残す合理性がない。

## Visual差分

| Concern | Primary | Secondary |
|---|---|---|
| preserveAspectRatio | `xMinYMin` | `xMaxYMin` |
| wave orientation | left | mirrored right |
| headline | See the unseen | AI-intelligence |
| Japanese copy | 市場調査・意思決定 | 競合分析・story |
| preview | AppTopDummy / right | AppResultsDummy / left |
| gradient 1 direction | 0%→100% | 100%→0% |
| clip use transform | none | mirror transform |

これらは各Visual / Sectionに残した。Copy、CSS値、SVG座標、path初期値、gradient色は変更していない。

## GSAP lifecycle

共通mount flow:

1. `prefers-reduced-motion`を判定する。
2. headline timelineを生成する。
3. tickerを登録し、毎frame `deltaRatio()/60`でphaseを進める。
4. Instance IDでshape A/Bを解決し、`d` attributeを更新する。
5. gradient tweenを開始する。
6. Component destroy時にticker解除、timeline kill、gradient tween killを一度だけ実行する。

`createLandingHeroCleanup`は複数回呼ばれてもcleanupを1回だけ実行する。DOM nodeはtickごとにVisual root内から検索し、unmount後はticker自体が解除される。GSAP tickerのdelta ratioを維持し、hidden tab専用の独自timerやvisibility handlerは追加していない。

## MutationObserverとの関係

Primary、Secondary、shared helper、GSAP mount flowには`MutationObserver`の生成・参照がない。B-3E/B-3Fで観測されたerrorと今回のwave animation重複には直接関係がないため、原因を推測して修正していない。

## 残課題

- Landing HeroのTablet/Mobile responsive設計とMobile overflow。
- 既存`MutationObserver.observe` errorの発生元特定。
- Shared configが将来分岐した場合のvisual regression基準。
- Svelte component test / browser E2E / visual regressionの共通基盤。

