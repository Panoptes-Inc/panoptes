# Phase B-3Q Marketing / App Route Ownership Analysis

更新日: 2026-08-18

## Conclusion

- `/`、`/lp`、`/plan`はsource・load・metadata・renderが同一だった。Product上のURL intentは不明なためredirectや削除は行わず、`MarketingLandingPage`へ共通compositionだけを集約した。Alias classificationは`UNKNOWN_PRODUCT_INTENT`、technical decisionは`SHARE_CANONICAL_PAGE`である。
- `/app`と`/app/analysis`は同じ`PanoptesShellEntryPage`を同じOrganization IDで描画し、active tabやruntimeにroute差がない。ただしSearch UIが`/app/analysis`へ明示遷移するため、Product intentを推測せず`UNKNOWN_PRODUCT_INTENT`として別routeを保持する。
- Header ownershipはroute familyごとの`MIXED_INTENTIONAL`である。MarketingはPage-owned canonical composition、Appは`app/+layout`、その他routeは必要な場合のみPageが所有する。Root layoutへは移動しない。
- Landingのdummy graphは`PRODUCTION_PREVIEW`であり、actual operational App Shellではない。ただし実Snapshot表示componentを大量に再利用する。Decisionは`EXTRACT_PREVIEW_SURFACE`候補、implementationはvisual baseline後へdeferする。
- `/app/login/settings`はnavigation sourceがなく、Svelte starter本文だけを表示する`TEMPORARY_ROUTE`である。削除・rename・実装はProduct decision待ちとする。

## Route file inventory

All routes inherit `src/routes/+layout.server.ts` and `src/routes/+layout.svelte`. Root server load supplies `authenticated`、`userEmail`、`activeOrganizationId`; root layout owns favicon、global CSS、children only.

| Route | Page | Route layout | Page/server load | Main component | Auth | Organization | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | `routes/+page.svelte` | root | root layout server | `MarketingLandingPage` | public | none | canonical Marketing composition |
| `/lp` | `routes/lp/+page.svelte` | root | root layout server | `MarketingLandingPage` | public | none | no internal navigation source |
| `/plan` | `routes/plan/+page.svelte` | root | root layout server | `MarketingLandingPage` | public | none | no internal navigation source |
| `/app` | `routes/app/+page.svelte` | `app/+layout.svelte` | root layout server | `PanoptesShellEntryPage` | required | active membership | App top also receives conditional Top Hero |
| `/app/analysis` | `routes/app/analysis/+page.svelte` | app + pass-through analysis layout | root layout server | `PanoptesShellEntryPage` | required | active membership | Search CTA navigation target; render still identical to `/app` |
| `/app/login/settings` | route-local starter page | app layout | root layout server | none | required | active membership | unlinked temporary scaffold |
| `/login` | route-local page | root | root layout server | `SignUpForm` login mode | public | none | callback/sign-out notices |
| `/organization/select` | route-local page | root | page server load/action | none | required | selection boundary | membership selection form |
| `/admin` | route-local page | root | root layout server | Admin wrapper | system admin | none | Header not rendered |

There are no `+page.ts` or `+layout.ts` files for the target routes. `/organization/select` is the only target with `+page.server.ts`; root is the only shared `+layout.server.ts`.

## Exact duplicate comparison

### Marketing routes

Before B-3Q, the three source files were byte-identical and each directly imported/rendered Header, Primary Hero, and Secondary Hero. They had:

- identical inherited load data;
- no route-specific `<svelte:head>` metadata;
- identical auth policy (`public / organization none`);
- identical rendered order;
- no internal navigation source for `/lp` or `/plan`.

After B-3Q, the three route wrappers remain byte-identical but duplicate composition is reduced to one `MarketingLandingPage` render. This preserves B-3F Page ownership: route Pages own the Marketing feature entry; the root layout still owns no Hero/Header.

Classification:

- Source: `EXACT` before and after.
- Product alias: `UNKNOWN_PRODUCT_INTENT`.
- Technical composition: `SHARE_CANONICAL_PAGE`.
- Redirect/deletion: `PRODUCT_DECISION_REQUIRED`.

### App routes

`/app/+page.svelte` and `/app/analysis/+page.svelte` are byte-identical. Both:

- import the same `PanoptesShellEntryPage`;
- pass `data.activeOrganizationId`;
- inherit the same App layout, auth and Organization policy;
- start `PanoptesShellPage.activeTab` at `strategy`;
- do not inspect the route pathname in the Shell;
- create no route-specific analytics or metadata distinction.

`PanoptesAnalysisStartSearchBar` explicitly executes `goto('/app/analysis')`. This is evidence of navigation intent, but not enough to infer the intended screen behavior. `/app/analysis` is therefore not redirected or removed.

Classification:

- Source: `EXACT`.
- Shared implementation: existing canonical `PanoptesShellEntryPage`.
- Product alias: `UNKNOWN_PRODUCT_INTENT`.
- Current behavior: separate routes / same composition.

## Route alias patterns considered

| Pattern | Marketing | App | Decision |
| --- | --- | --- | --- |
| Shared Page component | safe | already present through Shell Entry | selected for composition only |
| Redirect | Product meaning unknown | `/app/analysis` is a navigation target | prohibited in B-3Q |
| Server-level alias | no current need | no current need | not selected |
| Separate route / same composition | preserves URLs | preserves navigation intent | retained |

## Navigation sources

| Route | Navigation source | Result |
| --- | --- | --- |
| `/` | Header About link | active public entry |
| `/lp` | none found in current `src` | direct URL only |
| `/plan` | none found in current `src` | direct URL only |
| `/app` | Header App TOP link | authenticated/Organization guard applies |
| `/app/analysis` | `PanoptesAnalysisStartSearchBar` `goto` | only target route with explicit feature navigation |
| `/app/login/settings` | none found | direct URL only; temporary scaffold |
| `/login` | Header login CTA and auth redirects | active auth entry |
| `/organization/select` | auth/Organization redirect | active policy entry |
| `/admin` | no standard nav; direct URL | system-admin guard applies |

Header links for `/app/survey`、`/app/contact`、`/app/share` are intercepted or currently have no matching route; they do not establish target-route aliases.

## Header reachability and ownership

| Route | Header rendered | Owner | Duplicate risk | Decision |
| --- | --- | --- | --- | --- |
| `/` | once | `MarketingLandingPage` invoked by Page | none | keep Page-family ownership |
| `/lp` | once | same | none | keep |
| `/plan` | once | same | none | keep |
| `/login` | none | n/a | none | keep route-local auth UI |
| `/app` | once | `app/+layout.svelte` | none | keep persistent App layout ownership |
| `/app/analysis` | once | inherited App layout | none | keep |
| `/app/login/settings` | once | inherited App layout | none | route itself remains deferred |
| `/organization/select` | none | n/a | none | keep policy-focused route |
| `/admin` | none | n/a | none | keep Admin composition isolated |

Ownership classification is `MIXED_INTENTIONAL`: one shared component is owned by the Marketing Page composition and App layout for different persistence scopes. Moving it to root layout would incorrectly add Header to Login、Organization、Admin and would violate B-3F.

## Header responsibilities

| Concern | Present | Current owner / note |
| --- | --- | --- |
| Branding | yes | Header logo |
| Navigation | yes | route-aware global links |
| CTA | yes | Survey/Contact links and login/logout action |
| Auth | yes | boolean prop selects login versus logout |
| User identity/state | no | email/profile not rendered |
| Organization | no | no Organization state or selector |
| Responsive navigation | yes | local CSS hides later items below 980px |
| Modal state | yes | Survey/Contact open state and mutual exclusion |
| External link | no | current links are internal paths |
| Route-aware state | yes | `$page.url.pathname` active styles |

The component mixes navigation、auth CTA、modal orchestration and substantial CSS, but B-3Q does not force a split. Decision is `KEEP_CURRENT`; a dedicated Header responsibility audit remains a candidate.

## B-3F consistency

B-3F established:

```text
Root layout = global CSS / favicon / children
Marketing Page = Header / Primary Hero / Secondary Hero
```

B-3Q keeps that boundary. `MarketingLandingPage` is the Page-owned feature composition, not a layout. It renders Header → Primary → Secondary once and introduces no wrapper DOM or visual values.

## Landing Hero → Dummy Shell dependency

```text
MarketingLandingPage
├─ LandingHeroPrimarySection
│  └─ dummy/AppTopDummy wrapper
│     └─ AppTopDummy
│        └─ PanoptesAppShellDummy (industry preview)
└─ LandingHeroSecondarySection
   └─ dummy/AppResultsDummy wrapper
      └─ AppResultsDummy
         └─ PanoptesAppShellDummy (competitor preview)
```

`PanoptesAppShellDummy` does not import `PanoptesShellPage`, its BFF client, controller or polling. It does reuse actual presentation components including Snapshot tabs, project sidebar, Header Meta and Tab Nav with dummy payloads. It is therefore a Marketing preview, not the operational App Shell, but its dependency breadth is real production cost.

## Production Dummy classifications

| Component | Classification | Reason |
| --- | --- | --- |
| `dummy/AppTopDummy` | `COMPATIBILITY_WRAPPER` | pass-through alias used by Primary Hero |
| `dummy/AppResultsDummy` | `COMPATIBILITY_WRAPPER` | pass-through alias used by Secondary Hero |
| root `AppTopDummy` | `PRODUCTION_PREVIEW` | configures dummy shell for app-top visual |
| root `AppResultsDummy` | `PRODUCTION_PREVIEW` | configures dummy shell for results visual |
| `PanoptesAppShellDummy` | `PRODUCTION_PREVIEW` | controllerless preview shell using dummy data |
| `HeaderDummy` | `PRODUCTION_PREVIEW` | preview-only Header inside dummy shell |
| `SearchBarDummy` | `PRODUCTION_PREVIEW` | preview-only search surface |

None is classified `LEGACY` solely because its name contains Dummy.

## Marketing Preview versus Actual App

| Concern | Marketing Preview | Actual App |
| --- | --- | --- |
| Entry | Landing Hero | `/app` / `/app/analysis` |
| Shell | `PanoptesAppShellDummy` | `PanoptesShellPage` |
| Data | `dummySnapshot` and dummy metadata | Organization-scoped client/runtime stores |
| Controller/BFF | none | Shell controller/actions/BFF boundary |
| Snapshot presentation | reuses actual display components | actual display components |
| Purpose | visual product preview | operational Product UI |

Decision: `EXTRACT_PREVIEW_SURFACE` is the target direction, but visual comparison and preview field requirements are needed first. Immediate extraction is deferred.

## `/app/login/settings`

- Route name implies login/settings responsibility.
- Rendered content is untouched Svelte starter copy and external documentation link.
- No auth callback、logout、settings component、form or navigation source references it.
- It is production reachable and inherits App auth/Organization guards and App Header.

Classification: `TEMPORARY_ROUTE`. Delete、rename、redirect and Product implementation are all deferred.

## Ownership map

```text
Root layout
├─ global CSS / favicon
├─ root auth/session load
└─ children

Marketing route Page (/ /lp /plan)
└─ MarketingLandingPage
   ├─ PanoptesSiteHeader
   ├─ Primary Hero → production preview
   └─ Secondary Hero → production preview

App layout (/app/*)
├─ PanoptesSiteHeader
├─ conditional PanoptesTopHero at /app
└─ children
   ├─ /app Page → PanoptesShellEntryPage
   ├─ /app/analysis Page → PanoptesShellEntryPage
   └─ /app/login/settings Page → temporary scaffold
```

## Page / Layout / Feature boundary

| Layer | Allowed current ownership | B-3Q result |
| --- | --- | --- |
| Layout | global bootstrap or persistent route-family shell | root and App layout unchanged |
| Page | route-specific composition, metadata and feature entry | Marketing routes delegate to one feature entry; App routes retain entry wrappers |
| Feature | reusable feature UI/composition | `MarketingLandingPage` owns shared Marketing composition |
| Component | cohesive UI and local interaction | Header/Hero/Shell components unchanged |

## Decisions

| Subject | Decision |
| --- | --- |
| Marketing routes | `SHARE_CANONICAL_PAGE` composition; route URLs retained |
| Marketing alias meaning | `UNKNOWN_PRODUCT_INTENT` / Product Decision Required |
| App routes | separate routes using existing shared Shell entry |
| App alias meaning | `UNKNOWN_PRODUCT_INTENT`; `/app/analysis` navigation evidence retained |
| Header ownership | `MIXED_INTENTIONAL / KEEP_CURRENT` |
| Landing preview dependency | `EXTRACT_PREVIEW_SURFACE`, deferred implementation |
| `/app/login/settings` | `TEMPORARY_ROUTE`, Product decision required |

## Product Decision Required

- Whether `/lp` and `/plan` are public aliases, campaign URLs, future distinct pages or legacy routes.
- Whether `/app/analysis` should open a distinct analysis mode/tab or remain the same Shell URL alias.
- Whether `/app/login/settings` should be implemented, renamed, redirected or deleted.
- Which fields/interactions the Marketing preview must retain before extracting a smaller preview surface.
- Whether Header navigation labels/routes and modal ownership are the intended Product contract.

## Technical debt

- Marketing route wrappers remain exact, but composition duplication is removed.
- App route wrappers remain exact due separate SvelteKit route entries and unresolved Product intent.
- `/app/analysis/+layout.svelte` is a pass-through layout with no current distinct responsibility.
- Landing preview imports a broad real presentation subtree.
- Header mixes navigation、auth CTA、modal orchestration and responsive CSS.
- `/app/login/settings` is an unlinked production scaffold.

## Next actions

Recommended next backlog task is **Duplicate code / duplicate component confirmation**, focused on compatibility wrappers and route-entry duplication after the ownership decisions above. Recommended Phase B-3R is **Compatibility Wrapper and Route Entry Consolidation Audit**. A Header responsibility audit and Marketing preview-surface extraction are alternatives, each requiring tighter visual/Product evidence.

