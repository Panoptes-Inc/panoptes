# Phase B-3L Strategy Roadmap Phase Card Refactor

## Implementation result

`StrategyAnalysisRoadmapPhaseCard` remains the production canonical component. Its public props and callback contract are unchanged. B-3L applied the `SPLIT_VIEW_AND_MAPPING` decision:

- Card owns phase selection, shell, header, summary, and child composition.
- `StrategyAnalysisRoadmapTaskList` owns checklist/task rendering and checkbox interaction translation.
- `StrategyAnalysisRoadmapStatusActions` owns the selected task's status action surface.
- `roadmap-phase-presentation.ts` owns deterministic status labels, tones, action ordering, and checkbox transitions.
- `strategy-analysis-view-model.ts` continues to own domain-to-display mapping and now reuses the shared task-status label mapping.

No Product Contract or domain state was added. `StrategyAnalysisPlanRail` and `StrategyAnalysisPlanRailCard` were not changed.

## Before / after

| File | Before | After | Script | Markup | Style | Responsibility |
|---|---:|---:|---:|---:|---:|---|
| Phase Card | 400 | 169 | 24 | 48 | 97 | shell, header, summary, composition |
| Task List | absent | 223 | 25 | 52 | 146 | checklist/task view and UI event translation |
| Status Actions | absent | 56 | 18 | 15 | 23 | selected-task status controls |
| presentation mapping | absent | 62 | 62 | 0 | 0 | pure display mapping |

Comments are zero in all four files. The split increases aggregate physical lines because each Svelte child has explicit props and scoped CSS boundaries. The intended result is ownership separation, not aggregate line reduction. No tiny header/progress primitives were introduced.

## Changed files

New:

- `src/lib/components/ComponentsBase/Strategy/data/roadmap-phase-presentation.ts`
- `src/lib/components/ComponentsBase/Strategy/roadmap/StrategyAnalysisRoadmapTaskList.svelte`
- `src/lib/components/ComponentsBase/Strategy/roadmap/StrategyAnalysisRoadmapStatusActions.svelte`
- `tests/unit/strategy-roadmap-phase-card.test.ts`
- `docs/audit/44-strategy-roadmap-phase-card-analysis.md`
- `docs/audit/45-phase-b3l-strategy-roadmap-phase-card-refactor.md`
- `docs/inventory/frontend-inventory-summary.md`

Changed:

- `StrategyAnalysisRoadmapPhaseCard.svelte`
- `StrategyAnalysisRoadmapSection.svelte`
- `strategy-analysis-view-model.ts`
- `docs/DEVELOPMENT_LOG.md`

## Contract and visual preservation

- Phase Card's six props retain their names, types, optionality, and defaults.
- Phase selection, task selection, checklist toggle, status update, saving disablement, selected task, and selected phase behavior are preserved.
- All CSS values were moved with the relevant markup; no colors, spacing, typography, radius, shadow, breakpoint, or animation value was intentionally changed.
- Stable each-block keys and `aria-pressed` were added. These do not change Product behavior or visual design.
- No layout, responsive redesign, Tailwind, or Design Token work was included.

## Tests

Eight pure tests were added for:

- all status labels and tones;
- established status-action ordering;
- checklist status transitions;
- 30/60/90 order;
- task sorting, progress, checked, and active state;
- empty tasks;
- malformed optional display text;
- valid long task text.

The complete suite passes: 16 files / 204 tests.

## Browser verification

Browser verification unavailable. The browser runtime reported no controllable browser, so initial render, roadmap interaction, phase switching, task actions, long/empty visual fixtures, Desktop/Tablet/Mobile layout, and browser console were not marked confirmed.

The instructed substitute was used:

- pure mapping/regression tests: PASS;
- route/auth smoke: PASS;
- production build: PASS.

## Quality

- `npm run check`: PASS, 0 diagnostics
- `npm run lint`: PASS, 0 errors / 54 warnings
- `npm run format:check`: PASS
- `npm run check:openapi`: PASS, 18 operations / 18 operationIds
- `npm run test`: PASS, 16 files / 204 tests
- `npm run build`: PASS
- `npm run test:secrets`: PASS
- `npm run test:smoke`: PASS
- `npm run quality`: PASS
- unresolved imports: 0
- dependency cycles introduced: 0

Rails, BFF routes/contracts, OpenAPI, AnalysisJob states, Organization boundary, and Supabase Auth were not changed.

## Remaining

- Capture authenticated browser/visual baselines for normal, empty, long-text, selected, saving, and failed mutation states.
- Decide the 30/60/90 Product Contract and approval workflow before Roadmap write APIs.
- Address Strategy props drilling only after the Strategy contract and business read path are stable.
- Carry hard-coded Strategy colors, spacing, typography, and responsive behavior into the later standardization phase.
- Keep Strategy Plan Rail/Card deferred pending Product decision.
