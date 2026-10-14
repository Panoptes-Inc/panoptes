# Landing Wave Architecture

## Dependency direction

```text
LandingHeroPrimarySection
├─ LandingHeroPrimaryVisual
│  ├─ PRIMARY_WAVE_CONFIG
│  ├─ createLandingHeroSvgIds
│  └─ mountLandingHeroWaveAnimation
└─ AppTopDummy

LandingHeroSecondarySection
├─ LandingHeroSecondaryVisual
│  ├─ SECONDARY_WAVE_CONFIG
│  ├─ createLandingHeroSvgIds
│  └─ mountLandingHeroWaveAnimation
└─ AppResultsDummy

landing-hero-wave.ts
├─ pure geometry / path generation
├─ instance SVG ID factory
├─ GSAP timeline / ticker / gradient lifecycle
├─ reduced-motion gate
└─ idempotent cleanup
```

Section → Visual → shared animation helperの一方向依存とする。Shared helperはSvelte component、copy、preview、routeを参照しない。

## Ownership

| Unit              | Responsibility                                          |
| ----------------- | ------------------------------------------------------- |
| Primary Section   | Primary visualとAppTopDummyの配置                       |
| Secondary Section | Secondary visualとAppResultsDummyの配置                 |
| Primary Visual    | 左向きSVG、Primary copy、Primary gradient direction     |
| Secondary Visual  | 右反転SVG、Secondary copy、Secondary gradient direction |
| Shared helper     | geometry、phase、animation lifecycle、ID、cleanup       |
| Config            | Heroごとのanimation parameter                           |

## Animation flow

```text
Svelte onMount
  -> matchMedia(reduced motion)
     -> reduce: no animation / no registered side effect
     -> normal:
        -> headline timeline
        -> ticker registration
        -> boundary + A/B path update
        -> gradient tween

Svelte destroy
  -> remove ticker
  -> kill timeline
  -> kill gradient tween
  -> repeated cleanup is a no-op
```

## SVG instance IDs

Each Visual calls `$props.id()` once at component top-level and passes it to `createLandingHeroSvgIds`。Factoryはtitle、description、shape、clip、3 gradientsの8 IDを返す。`href`、`fill: url(#...)`、`clip-path`、`aria-labelledby`は同じID objectだけを参照する。

## Config boundary

Primary / Secondary configは別exportである。現在値はどちらも次のとおり。

| Parameter         | Value |
| ----------------- | ----: |
| amplitude         |    62 |
| waves             |   1.6 |
| flow speed        |   0.4 |
| pin point width   |  0.06 |
| intro duration    |  1.4s |
| gradient offset   |   300 |
| gradient duration |    6s |

Visual差分を消すためにconfigを共有objectへまとめない。将来値が分岐してもanimation coreは同じまま維持する。

## Out of scope

- Responsive layout、breakpoint、Mobile overflow
- Hero copy、gradient color、SVG coordinate redesign
- Page / Layout ownership
- Tailwind、Design Token

## References

- [Shared analysis](../audit/34-landing-wave-shared-analysis.md)
- [Implementation record](../audit/35-phase-b3g-landing-wave-refactor.md)
- [Landing route ownership](./landing-route-ownership.md)
