# Phase B-3M Competitor Expanded Card Refactor

## Implementation

The production-reachable `CompetitorAnalysisExpandedCard` remains the canonical component and retains its public props and callback behavior. The implementation separates metrics and evidence rendering, centralizes pure Competitor presentation mapping, strengthens the existing safe external-link boundary, and adds regression coverage without changing Product meaning or visual values.

## Before / after

| File/surface | Total | Script | Markup | Style | Comments |
| --- | ---: | ---: | ---: | ---: | ---: |
| Expanded Card before | 373 | 20 | 98 | 255 | 0 |
| Expanded Card after | 148 | 20 | 41 | 85 | 0 |
| New Expanded Metrics | 184 | 9 | 50 | 125 | 0 |
| New Evidence Sections | 96 | 11 | 26 | 59 | 0 |
| New pure presentation mapping | 68 | 68 | 0 | 0 | 0 |

Aggregate lines are not the goal and increase because each responsibility has an explicit interface and scoped style boundary. The outcome is narrower ownership: the Card is composition, Metrics is score/radar presentation, Evidence is summary/insight/action presentation, and mapping is pure data normalization.

## New files

- `src/lib/components/ComponentsBase/Competitor/data/competitor-card-presentation.ts`
- `src/lib/components/ComponentsBase/Competitor/detail/CompetitorAnalysisExpandedMetrics.svelte`
- `src/lib/components/ComponentsBase/Competitor/detail/CompetitorAnalysisEvidenceSections.svelte`
- `tests/unit/competitor-expanded-card.test.ts`
- `docs/audit/46-competitor-expanded-card-analysis.md`
- `docs/audit/47-phase-b3m-competitor-expanded-card-refactor.md`

## Changed files

- `CompetitorAnalysisExpandedCard.svelte`: reduced to shell/header/badge/child/footer composition; safe link metadata and keyed badges.
- `CompetitorAnalysisRadarChart.svelte`: keyed existing radar collection loops.
- `competitor-analysis-view-model.ts`: delegates axis construction and external URL normalization to pure mapping.
- `docs/inventory/frontend-inventory-summary.md`: B-3M decision, debt, handoff, counts, references, and next target.
- `docs/DEVELOPMENT_LOG.md`: chronological B-3M summary and quality baseline.

## Preserved contract

- `card`, `compared`, `onOpenDetail`, and `onOpenCompare` props and defaults.
- URL, insights, actions, detail toggle, compare toggle, fallbacks, score formulas, axes, labels, copy, section order, responsive values, and styling values from the B-2 canonical surface.
- Observed insight versus recommended Snapshot action versus formal Strategy boundaries.
- Parent ownership of expanded and compared state.

The only intended behavior hardening is that malformed, credential-bearing, and non-HTTP(S) URLs no longer render as external links. Safe HTTP(S) navigation remains a new-tab action with `noopener noreferrer`.

## Tests

`tests/unit/competitor-expanded-card.test.ts` adds 10 cases covering:

- six-axis order and score clamping;
- ring mapping at low/high values;
- HTTP/HTTPS URL preservation and malformed/unsafe URL rejection;
- B-2 URL/insight/action/badge/score/axis preservation;
- missing/invalid URL and empty/malformed fallback data;
- long text preservation;
- detail/compare action-label mapping contract.

The repository total is 17 test files / 214 tests, all passing.

## Browser verification

Not executed. The required in-app browser connection was initialized and retried according to its troubleshooting guidance, but the available browser list was empty. Therefore Desktop/Tablet/Mobile visual, interaction, and console verification are not claimed. Pure mapping/action-contract tests, route smoke, Svelte check, and production build are the documented substitutes.

## Quality

- `npm run check`: PASS, 0 diagnostics.
- `npm run lint`: PASS, 0 errors / 50 warnings (B-3L: 54).
- `npm run format:check`: PASS.
- `npm run check:openapi`: PASS, 18 operations / 18 unique operation IDs.
- `npm run test`: PASS, 17 files / 214 tests.
- `npm run build`: PASS.
- `npm run test:secrets`: PASS.
- `npm run test:smoke`: PASS.
- `npm run quality`: PASS.
- unresolved imports: 0; dependency cycles: 0.

The dynamic external HTTP(S) link still triggers one existing `svelte/no-navigation-without-resolve` warning because the rule cannot distinguish normalized external destinations. It is not suppressed; the mapping boundary and link attributes are tested. No changed file introduces an error.

## Scope protection

No Rails, BFF, OpenAPI, AnalysisJob, Organization boundary, Supabase Auth, Strategy Plan Rail/Card, Product formula, Tailwind, Design Token, layout, copy, or intentional visual change was made.

## Remaining

- Browser E2E/visual regression once a controllable authenticated browser fixture is available.
- Product decision for global six-axis terminology/order and formal score formula ownership.
- Later frontend standardization of score tokens, typography, spacing, responsive behavior, and Competitor component taxonomy/directory policy.
- A dedicated Svelte component-rendering test harness remains a frontend quality task.
