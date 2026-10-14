# Landing Route Ownership

更新日: 2026-08-18（Phase B-3Q）

## Canonical ownership

```text
root +layout
├─ favicon
├─ global app.css
└─ children
   ├─ / +page ─┐
   ├─ /lp +page ├─ MarketingLandingPage
   └─ /plan +page ┘  ├─ PanoptesSiteHeader
                     ├─ LandingHeroPrimarySection
                     └─ LandingHeroSecondarySection
```

## Ownership matrix

| Concern                 | Root Layout  | `/` Page     | `/lp` Page   | `/plan` Page |
| ----------------------- | ------------ | ------------ | ------------ | ------------ |
| favicon                 | Owner        | -            | -            | -            |
| global CSS              | Owner        | -            | -            | -            |
| children / route outlet | Owner        | -            | -            | -            |
| Marketing feature entry | -            | Owner        | Owner        | Owner        |
| Header                  | -            | Via feature  | Via feature  | Via feature  |
| Primary Hero            | -            | Via feature  | Via feature  | Via feature  |
| Secondary Hero          | -            | Via feature  | Via feature  | Via feature  |
| Footer                  | 現行実装なし | 現行実装なし | 現行実装なし | 現行実装なし |

`/lp`と`/plan`専用layoutは存在しない。LayoutはPage固有Heroをimportしない。

## Rules

1. Landing HeroはPage contentであり、rootまたはroute layoutから暗黙注入しない。
2. 1 Page内の順序はcanonical `MarketingLandingPage`を介してHeader → Primary → Secondaryとする。
3. 同じHeroをLayoutとPageの両方からrenderしない。
4. 共通Shellが将来必要になっても、HeroはPage側の明示compositionに残す。
5. Footerを追加する場合は、全route共通かPage固有かを先に判断する。現状はFooterを追加しない。

## Verification boundary

`tests/unit/landing-route-ownership.test.ts`がroot layout非所有、3 Pageのfeature entry各1回、canonical compositionのHeader/Hero各1回を検査する。Visual、SVG、animation、responsiveの正本はHero component側にあり、このroute ownership文書の対象外である。

## References

- [Phase B-3F audit](../audit/33-landing-hero-layout-ownership.md)
- [Landing Hero component map](./landing-hero-component-map.md)
- [Frontend route ownership](./frontend-route-ownership.md)
