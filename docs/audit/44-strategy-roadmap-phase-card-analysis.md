# Phase B-3L StrategyAnalysisRoadmapPhaseCard Responsibility Analysis

## Reachability and classification

| Item | Finding |
|---|---|
| Component | `src/lib/components/ComponentsBase/Strategy/roadmap/StrategyAnalysisRoadmapPhaseCard.svelte` |
| Classification | `ACTIVE_CANONICAL` |
| Production parent | `StrategyAnalysisRoadmapSection.svelte` |
| Production routes | `/app` and `/app/analysis` through the canonical Panoptes Shell and Strategy snapshot tab |
| Production chain | route -> Shell -> Main Surface -> Snapshot Surface -> Strategy Tab -> Strategy Analysis Tab -> Roadmap Section -> Phase Card |
| Children before B-3L | none |
| Dev reachability | Panoptes UI preview and dummy Shell reach the same Snapshot/Strategy chain |
| Test reference before B-3L | no dedicated Phase Card test; Strategy mapping was not covered in `snapshot-view-model.test.ts` |
| Duplicate | no same-responsibility duplicate found |
| Wrapper | not a wrapper |

The component is not test-only or dev-only. It is the single production Phase Card implementation and must not be merged with the Product-decision-pending `StrategyAnalysisPlanRail` or `StrategyAnalysisPlanRailCard`.

## Before line breakdown

| Segment | Lines |
|---|---:|
| Total | 400 |
| Script, including `<script>` boundary | 55 |
| Markup | 89 |
| Style, including `<style>` boundary | 256 |
| Comments | 0 |

The primary size driver was scoped CSS, followed by task/status markup. Line count alone was not the decision criterion; the split was justified because those sections also had separate input, interaction, mapping, and accessibility responsibilities.

## Responsibility inventory

| Responsibility | Current location before B-3L | State / Logic / UI | Risk | Action |
|---|---|---|---|---|
| Data input | Phase Card props | view-model data and callbacks | low | keep at composition boundary |
| Roadmap phase mapping | upstream `strategy-analysis-view-model.ts` | domain -> view model | medium; status label mapping partly duplicated in Card | split pure presentation mapping |
| Phase title / objective | Card header and summary | UI | low | keep in Card |
| Timeline / 30-60-90 phase | upstream phase order and view model | product/domain-derived display | medium if hard-coded again | do not duplicate in Card |
| Progress | preformatted labels and completion percentage | derived view data | low | keep display in Card; no new calculation |
| Task/action display | Card checklist markup | UI + callbacks | high concentration | split Task List view |
| Status display | inline tone and action labels | pure mapping + UI | medium duplication | split mapping and Status Actions view |
| Interaction | phase selection, task selection, task status update | callback dispatch | medium | keep composition in Card; child owns local click translation |
| Expanded/collapsed state | none | none | none | do not invent |
| Detail/modal connection | none | none | none | keep absent |
| Formatting | status labels, tones, checklist transition | pure mapping | medium | split mapping |
| Styling | all Card, summary, checklist, action CSS | UI | high concentration | colocate CSS with each extracted view |
| Responsive | one 1180px flex-basis rule | presentation | medium; behavior is not a full responsive policy | preserve, defer redesign |
| Accessibility | semantic buttons, checkbox label, disabled state | UI | selected state not programmatically exposed | add `aria-pressed`; preserve keyboard-native buttons |

## Props

| Prop | Type | Source | Responsibility | Keep / Refactor |
|---|---|---|---|---|
| `phaseCard` | `StrategyAnalysisRoadmapPhaseModel` | Roadmap Section from Strategy view model | display-ready phase, progress, tasks, active task | keep required; pass task subset to child |
| `selectedPhase` | `PanoptesStrategyPhase` | strategy UI state through Shell | identifies selected phase | keep required; derive `isSelected` only |
| `taskMutationStatus` | `idle \| saving \| failed`, default `idle` | strategy UI store/action flow | disables mutations while saving | keep optional; forward to interaction children |
| `onSelectPhase` | phase callback, default no-op | Shell controller/action | phase selection event | keep |
| `onSelectTask` | task ID callback, default no-op | Shell controller/action | active task selection | keep; Task List consumes it |
| `onUpdateTaskStatus` | task ID/status callback, default no-op | Shell controller/action | mutation intent only | keep; Task List and Status Actions consume it |

No prop duplicates server state. `phaseCard` is already a display model; the component does not receive raw API responses, Snapshot transport envelopes, or Organization scope.

## State classification

| State | Classification | Ownership |
|---|---|---|
| `phaseCard`, `selectedPhase`, mutation status | Derived View State input / orchestration input | parent/store owns; Card reads only |
| `isSelected` (`$derived`) | Local Derived View State | Card |
| active task | Derived View State inside `phaseCard` | upstream view model |
| checkbox target status | ephemeral interaction mapping | pure helper after B-3L |

Before and after B-3L there is no `$state`, `$effect`, local server cache, Business State, Server State, or owned Orchestration State in the Card.

## Side effects

There is no fetch, API client, store mutation, timer, animation frame, observer, browser global, storage, navigation, external link, or event listener registration. The only effects are callback invocations:

- selecting a phase;
- selecting a task;
- requesting a task-status update.

These are necessary UI events. The component does not perform the mutation itself. Task List preserves the established checkbox behavior of selecting the task first and then requesting `done`, or `todo` when it was already done.

## Data flow and domain boundary

```text
Committed Snapshot strategy + selected Strategy plan tasks
  -> StrategyAnalysisTab
  -> createStrategyAnalysisViewModel
  -> StrategyAnalysisRoadmapModel
  -> StrategyAnalysisRoadmapSection
  -> StrategyAnalysisRoadmapPhaseCard
  -> Task List / Status Actions
  -> UI callbacks
  -> Shell controller -> strategy action/store
```

Snapshot remains observed analysis evidence. Strategy remains the selected formal proposal. Roadmap remains the time-axis execution view derived from Strategy. Self Analysis or partial Snapshot data is not reinterpreted by this component, and B-3L adds no automatic Strategy promotion.

## 30 / 60 / 90 finding

The phase vocabulary is not locally invented by the Card. It comes from `PanoptesStrategyPhase`, `PANOPTES_STRATEGY_PHASE_ORDER`, Snapshot Strategy phase data, and the existing 90-day view-model calculation. This is the current Product Contract/model, not a Card-only temporary constant. B-3L preserves it. Any change to the meaning, duration, approval, or number of phases is `DEFER / Product Decision Required`.

## Mapping finding

Before B-3L, task display labels were in the Strategy view model while action labels, status colors, action ordering, and checkbox transitions were inline in the Card. These are deterministic display rules and qualify for `SPLIT_MAPPING`. They now live in `data/roadmap-phase-presentation.ts`, with the view model using the same task-label mapping.

Sorting, grouping, completion percentage, active-task fallback, phase fallback copy, and display-safe text conversion remain in `createStrategyAnalysisViewModel`; moving them into the visual component would reverse the desired domain -> view model -> UI direction.

## Render finding

The Card shell, phase header, summary, Task List, and Status Actions were independently meaningful. B-3L keeps shell/header/summary in the Card and extracts two cohesive child views:

```text
StrategyAnalysisRoadmapPhaseCard
  |- phase header / summary
  |- StrategyAnalysisRoadmapTaskList
  `- StrategyAnalysisRoadmapStatusActions
```

No smaller title/progress/row primitives were created because that would fragment the local UI without improving ownership.

## Style and responsive findings

- Colors, spacing, font sizes, radius, shadows, and gradients are hard-coded scoped CSS.
- Task and action styles were moved with their markup; values were not tokenized or converted to Tailwind.
- The existing 1180px rule changes child flex bases but the parent uses a row flow. A full Tablet/Mobile stacking policy is therefore not established here.
- Long task text uses normal wrapping; action buttons wrap. Extremely long unbroken tokens and narrow-screen layout still require browser/visual baselines.
- No layout, responsive, animation, typography, or visual value was intentionally changed.

Design Token, Tailwind, and responsive normalization are handed to the later frontend standardization phase.

## Accessibility findings

- Header, task, checkbox, and status controls are native buttons and remain keyboard operable.
- Saving state uses the native `disabled` attribute.
- The custom checkbox retains a descriptive `aria-label` and visible checked state.
- Selected phase, selected task, and active status now expose `aria-pressed` in addition to visual state.
- Status is conveyed by text as well as color.
- Task/phase loops now have stable keys.

No modal focus management or expansion semantics apply because this component has neither modal nor expanded/collapsed state.

## Split decision

Final decision: `SPLIT_VIEW_AND_MAPPING`.

The Card remains `ACTIVE_CANONICAL`. The split reduces its responsibility surface without changing props, callback semantics, Product Contract, Strategy meaning, Rails, BFF, OpenAPI, Auth, or Organization boundaries. `StrategyAnalysisPlanRail` and `StrategyAnalysisPlanRailCard` remain untouched and `DEFER`.

## Deferred

- Product decision on 30/60/90 semantics and future approval workflow.
- Responsive and visual regression work across Desktop/Tablet/Mobile.
- Design Token and Tailwind migration.
- Strategy props-drilling reduction at Snapshot/Strategy composition boundaries.
- Product decision for Strategy Plan Rail/Card.
