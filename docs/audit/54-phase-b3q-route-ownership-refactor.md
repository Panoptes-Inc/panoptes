# Phase B-3Q Route Ownership Refactor

更新日: 2026-08-18

## Implementation

The three Marketing routes now delegate their shared Header/Hero composition to `src/lib/features/landing/components/MarketingLandingPage.svelte`.

```text
Before
/, /lp, /plan Page
└─ Header + Primary Hero + Secondary Hero (repeated in each source)

After
/, /lp, /plan Page
└─ MarketingLandingPage
   └─ Header + Primary Hero + Secondary Hero
```

No route, redirect, metadata, auth policy, Header/Hero component, styling, copy, SVG, animation or rendered order changed. The new composition adds no DOM wrapper.

`/app` and `/app/analysis` were not rewritten: both already use the same canonical `PanoptesShellEntryPage`, and `/app/analysis` has a distinct navigation source whose Product behavior is not defined. `/app/login/settings` remains unchanged.

## Before / after

| Concern | Before | After |
| --- | --- | --- |
| Marketing direct composition copies | 3 | 1 canonical composition |
| Marketing route URLs | `/`, `/lp`, `/plan` | unchanged |
| Header per Marketing route | 1 | 1 |
| Primary Hero per Marketing route | 1 | 1 |
| Secondary Hero per Marketing route | 1 | 1 |
| App routes | same Shell entry | unchanged |
| Redirects | none | none added |
| Product navigation | existing | unchanged |
| Reusable Svelte components | 126 | 127 |
| Production reachable | 121 | 122 |

## Changed / new files

- New canonical Marketing composition: `src/lib/features/landing/components/MarketingLandingPage.svelte`.
- Updated route wrappers: `src/routes/+page.svelte`、`src/routes/lp/+page.svelte`、`src/routes/plan/+page.svelte`.
- Updated existing Landing ownership regression test and added route ownership regression tests.
- Extended production route smoke to cover `/lp`、`/plan`、`/organization/select` and `/app/login/settings`.
- Regenerated both component inventory CSVs.
- Added Phase audits and route ownership architecture; updated Active Graph、Landing ownership、parent inventory and Development Log.
- Added no Rails/BFF/OpenAPI/Auth/Organization source changes.

## Route behavior

- Marketing routes retain separate public URLs and identical current output.
- `/app` and `/app/analysis` retain required authentication and active Organization membership.
- `/app/analysis` remains the `PanoptesAnalysisStartSearchBar` target but does not gain inferred analysis-tab behavior.
- `/app/login/settings` remains an authenticated/Organization-scoped Svelte starter scaffold with no internal navigation source.

## Tests

Regression coverage verifies:

- three Marketing wrappers delegate once to the canonical composition;
- canonical Header → Primary → Secondary order;
- `/app` and `/app/analysis` exact wrapper equivalence;
- absence of inferred analysis-specific active tab;
- pass-through analysis layout;
- unchanged settings scaffold;
- current navigation-source evidence;
- explicit Landing → dummy preview chain;
- B-3F root layout and one-Hero ownership;
- inventory counts, wrapper classification, unresolved import and cycle invariants.

Tests describe the current state as `current route alias behavior preservation`; they do not assert that Product aliases should remain identical forever.

## Quality

- `npm run check`: PASS, 0 errors / 0 warnings.
- `npm run lint`: PASS, 0 errors / 38 warnings.
- `npm run format:check`: PASS.
- `npm run check:openapi`: PASS, 18 / 18.
- `npm run check:frontend-inventory`: PASS, unresolved 0 / cycles 0 / stale 0.
- `npm run test`: PASS, 21 files / 251 tests.
- `npm run build`: PASS.
- `npm run test:secrets`: PASS.
- `npm run test:smoke`: PASS.
- `npm run quality`: PASS, exit 0.

## Remaining

- Product decisions for Marketing aliases、`/app/analysis` semantics and `/app/login/settings`.
- Smaller Marketing preview-surface extraction with visual regression evidence.
- Dedicated `PanoptesSiteHeader` responsibility audit if Header remains the highest-impact concentration.
- Compatibility wrapper consolidation after caller ownership is stable.
