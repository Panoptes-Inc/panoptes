# Landing Hero Component Map

## Active composition

```text
Landing page (`/`, `/lp`, `/plan`)
├─ PanoptesSiteHeader
├─ LandingHeroPrimarySection
│  ├─ LandingHeroPrimaryVisual
│  │  └─ landing-hero-wave animation/geometry
│  └─ AppTopDummy
└─ LandingHeroSecondarySection
   ├─ LandingHeroSecondaryVisual
   │  └─ landing-hero-wave animation/geometry
   └─ AppResultsDummy
```

Phase B-3FでHero ownershipを各`+page.svelte`へ移した。Root layoutはfavicon、global CSS、childrenだけを所有し、`/lp`と`/plan`の重複layoutは削除済みである。詳細は[Landing Route Ownership](./landing-route-ownership.md)を参照する。

## Meaning boundary

- Primary: product promise / transition into Panoptes、market research acceleration、App top preview
- Secondary: competitor-analysis value proposition、AI interpretation story、results preview
- 共通: 1980×1200 wave canvas、mirrored gradients、GSAP intro/ticker/gradient、typography scale
- 非共通: copy、orientation、embedded product preview、preview side

PrimaryとSecondaryは連続するが意味は異なるため、現在は別Sectionを正本とする。全体mergeよりvisual primitiveの小さな共通化が適切である。

## Hero implementation map

```text
LandingHeroPrimarySection (composition / 31 lines)
├─ LandingHeroPrimaryVisual (SVG semantics + markup / 210 lines)
│  └─ mountLandingHeroWaveAnimation(PRIMARY config)
└─ AppTopDummy

LandingHeroSecondarySection (composition / 30 lines)
├─ LandingHeroSecondaryVisual (SVG semantics + markup / 225 lines)
│  └─ mountLandingHeroWaveAnimation(SECONDARY config)
└─ AppResultsDummy (existing product preview)

landing-hero-wave.ts (220 lines)
├─ pure wave geometry
├─ shape path mapping
├─ Primary / Secondary config
├─ SVG instance ID factory
└─ GSAP lifecycle + idempotent cleanup + reduced motion
```

Visual componentはSVGそのものをrootにするため、元のDOM sibling orderとstacking contextを保持する。

## Shared core and remaining candidates

| Concern                       | Current owner                | Future action           |
| ----------------------------- | ---------------------------- | ----------------------- |
| wave geometry                 | shared helper                | 共通化完了              |
| GSAP timeline/ticker/gradient | shared helper                | 共通化完了              |
| instance SVG IDs              | shared factory + each Visual | 一意化完了              |
| font sizes/weights            | 両Visual scoped CSS          | Design Token phase      |
| gradient colors/shadows       | 各Visual / Section           | Design Token phase      |
| viewport adaptation           | 未実装                       | responsive design phase |

## Decoration ownership

- SVG paths、clip、gradients、headline/copyはVisualが所有
- absolute positioning、zoom、shadowを含むproduct preview compositionはSectionが所有
- path計算とanimation side effectはhelperが所有
- decoration片を個別componentにはしない

## Responsive ownership

現状は両Sectionともmedia queryなし。SVGは`width: 100%`で比例縮小し、previewはabsolute percentage positioning + fixed `zoom: 0.6`である。Mobile overflow等を小手先で修正せず、Primary/Secondaryを同時に扱うresponsive phaseへ送る。

## Design Token / Tailwind backlog

- orange/purple gradient palette
- white textとpreview background
- 240/40/24px typography scale
- 500/300/700 font weights
- 0.1em letter spacing
- preview radius/shadow
- left/right/bottom offsets
- breakpointとresponsive preview scale

B-3Gでも上記のvisual値、breakpoint、copy、image designを変更していない。
