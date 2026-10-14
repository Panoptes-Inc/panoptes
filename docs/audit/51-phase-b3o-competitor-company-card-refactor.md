# Phase B-3O Competitor Company Card Refactor

## Implementation

`CompetitorAnalysisCompanyCard` remains the production canonical compact summary Card. B-3O applies `SPLIT_MAPPING`, not a view split or merge:

- preserves six public props and parent-owned selection/compare state;
- moves the 24-degree Company ring formula into the existing B-3M presentation module;
- renames the Expanded ring helper explicitly and preserves its 30-degree formula;
- shares safe clamp/gradient construction, score percentage formatting, and compare labels;
- adds semantic identity heading, accessible score name, and pressed states;
- leaves layout, CSS values, Product metrics, callbacks, and parent compare policy unchanged.

## Before / after

| Surface | Before | After | Script | Markup | Style | Comments |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Company Card | 261 | 289 | 27 | 62 | 200 | 0 |
| Competitor presentation mapping | 68 | 99 | 99 | 0 | 0 | 0 |

The Card grows because accessible attributes and readable formatted markup are explicit. Its logical responsibility narrows: inline formula/label/percentage mapping has left the view. No small render component was created merely to reduce line count.

## Reuse result

| Candidate | Result |
| --- | --- |
| Score clamp/gradient construction | shared internally |
| Company ring | explicit 24-degree helper |
| Expanded ring | explicit 30-degree helper |
| Score-bar width | shared pure helper |
| Compare label | shared pure helper |
| Full score view | kept separate |
| Company/Expanded Card | kept separate |
| Six-axis view | Expanded-only; kept separate |

The ring formula difference is fixed by tests as current behavior, not declared Product-correct.

## New files

- `tests/unit/competitor-company-card.test.ts`
- `docs/audit/50-competitor-company-card-analysis.md`
- `docs/audit/51-phase-b3o-competitor-company-card-refactor.md`

## Changed files

- `src/lib/components/ComponentsBase/Competitor/cards/CompetitorAnalysisCompanyCard.svelte`
- `src/lib/components/ComponentsBase/Competitor/data/competitor-card-presentation.ts`
- `src/lib/components/ComponentsBase/Competitor/detail/CompetitorAnalysisExpandedMetrics.svelte`
- `tests/unit/competitor-expanded-card.test.ts`
- `docs/inventory/frontend-inventory-summary.md`
- `docs/DEVELOPMENT_LOG.md`

## Tests

Twelve Company-specific tests cover:

- 24° Company versus 30° Expanded legacy/current formula difference;
- zero, low, high, and non-finite ring inputs;
- score-bar 0–100 percentage formatting;
- detail/compare labels for selected/compared presentation;
- normal and fallback company identity;
- long company/service names;
- aggregate Company scores versus separate six-axis detail model;
- URL normalization remaining in the canonical view model;
- view-model score clamping.

The complete suite passes: 19 test files / 238 tests.

Callback wiring remains `onOpenDetail(card.competitorId)` and `onOpenCompare(card.competitorId)`; its type path is checked by Svelte check and canonical flow by build/smoke. The repository does not yet have a Svelte interaction-rendering harness.

## Browser verification

Browser verification unavailable. Setup and documented troubleshooting completed, but the available controllable browser list was empty. Company Cards, selected/compared/detail interactions, long/fallback fixtures, Desktop/Tablet/Mobile layout, and console state are not claimed as visually verified. Pure formula/mapping regression, Svelte check, auth/route smoke, and production build are the substitutes.

## Quality

- `npm run check`: PASS, 0 diagnostics.
- `npm run lint`: PASS, 0 errors / 38 warnings.
- `npm run format:check`: PASS.
- `npm run check:openapi`: PASS, 18 operations / 18 unique operation IDs.
- `npm run test`: PASS, 19 files / 238 tests.
- `npm run build`: PASS.
- `npm run test:secrets`: PASS.
- `npm run test:smoke`: PASS.
- `npm run quality`: PASS.
- unresolved imports: 0; dependency cycles introduced: 0.

All B-3O-touched files other than the unchanged dynamic external-link warning in the separate Expanded Card shell are warning-free. No intentional visual redesign was made.

## Scope protection

No Rails, BFF, OpenAPI, AnalysisJob, Organization boundary, Supabase Auth, common axis registry/component, shared score component, Product formula convergence, Strategy semantics, Tailwind, Design Token, or directory-wide migration was performed.

## Remaining

- Product decision for the 24°/30° ring difference.
- Determine whether the currently unreachable Company `compared=true` presentation remains part of the parent/grid contract.
- Browser E2E/visual regression and responsive width/height cleanup.
- Future tokenization of duplicated score/surface/selection CSS without merging Product-distinct views.
