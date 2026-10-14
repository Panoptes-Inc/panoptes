# Panoptes Architecture Notes

This document describes the current implementation structure of Panoptes after Step 1 to Step 6.

It is not an ideal future architecture document.
It is a guide for how the current codebase is organized, where responsibilities live today, and what rules we should keep so the MVP can continue safely.

## 1. Current Overall Structure

Panoptes is currently organized around this flow:

1. `hero/search` remains the top entry on `/app`
2. a persistent shell is mounted below it
3. the shell handles project list, project switching, analysis flow, failed state, and snapshot dashboard
4. raw state is stored in Svelte stores
5. render decisions are derived in selectors
6. async orchestration is handled in actions
7. pure transition and patch logic is being moved into domain helpers
8. API access is centralized in the API layer
9. mock API and preview dummy data are separated, but now share more snapshot structure

The most important current rule is:

- `/app` keeps `hero/search + persistent shell`
- the shell stays mounted during project switching and analysis flow transitions
- backend mode must not silently fall back to mock success

## 2. Directory and File Responsibilities

### Routes

- `src/routes/app/+page.svelte`
  - main `/app` entry
  - keeps `hero/search` at the top and mounts the shell below
- `src/routes/app/analysis/+page.svelte`
  - analysis route entry
  - also uses the shell entry component
- `src/routes/app/dev/ui/+page.svelte`
  - preview route for UI adjustment and dummy display
- `src/routes/dev/analysis-preview/+page.svelte`
  - dev-only route for standalone analysis-loading UI preview
  - injects mock loading stages without touching the production analysis flow

### Shell and Main UI

- `src/lib/components/ComponentsBase/PanoptesShellEntryPage.svelte`
  - shell entry wrapper
  - injects dummy fallback only at the entry layer
- `src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte`
  - main shell surface
  - renders project list, analysis flow, snapshot tabs, failed state, and toast stack
- `src/lib/components/ComponentsBase/Panoptes/*`
  - shell subcomponents for analysis, shared UI, project list, and snapshot tabs
- `src/lib/components/analysis/*`
  - analysis-loading preview components
  - split between a shared loading shell and stage-driven inner content

### Domain Tab UI

- `src/lib/components/ComponentsBase/Competitor/*`
  - competitor tab UI
- `src/lib/components/ComponentsBase/industry/*`
  - industry tab UI
- `src/lib/components/ComponentsBase/industry/shared/*`
  - reusable industry leaf components used only by the industry tab
- `src/lib/components/ComponentsBase/Self/*`
  - self tab UI
- `src/lib/components/ComponentsBase/Strategy/*`
  - strategy tab UI and strategy-specific view-model mapping

### Stores

- `src/lib/panoptes/stores/session.ts`
  - shell-level session state
- `src/lib/panoptes/stores/projects.ts`
  - project summaries and project detail state
- `src/lib/panoptes/stores/runtime.ts`
  - active analysis runtime state
- `src/lib/panoptes/stores/strategy.ts`
  - strategy selection and task UI state
- `src/lib/panoptes/stores/network.ts`
  - reachability state
- `src/lib/panoptes/stores/notifications.ts`
  - toast queue state

### Selectors

- `src/lib/panoptes/selectors/presentation.ts`
  - derived render decisions
  - decides whether UI should show empty state, analysis flow, failed state, or snapshot dashboard

### Actions

- `src/lib/panoptes/actions/analysis.ts`
  - create analysis
  - poll progress
  - confirm inference
  - reanalyze
  - reconcile snapshot readiness
- `src/lib/panoptes/actions/projects.ts`
  - list projects
  - select project
  - hydrate project detail
  - keep stable view during switching
- `src/lib/panoptes/actions/strategy.ts`
  - select strategy card
  - update roadmap task status
- `src/lib/panoptes/actions/network.ts`
  - reachability and notification helpers

### Domain Helpers

- `src/lib/panoptes/domain/runtime-progress.ts`
  - pure progress mapping and runtime transition logic extracted from `analysis.ts`
- `src/lib/panoptes/domain/project-sync.ts`
  - pure project detail to store patch logic extracted from `projects.ts`
- `src/lib/panoptes/domain/strategy-snapshot.ts`
  - pure snapshot selection and phase task patch logic extracted from `strategy.ts`

### API

- `src/lib/panoptes/api/client.ts`
  - single API entry point
  - backend or mock selection
  - backend mode must not silently degrade into mock mode

### Mock API

- `src/lib/panoptes/api/mock-backend.ts`
  - mock API facade
  - owns load/save state and mock API surface
- `src/lib/panoptes/api/mock/state.ts`
  - shared mock state types
- `src/lib/panoptes/api/mock/snapshot-factory.ts`
  - shared snapshot payload factory
- `src/lib/panoptes/api/mock/runtime-ticker.ts`
  - mock job tick and transition logic

### Preview and Dummy

- `src/lib/db/dummy/panoptes_dummy_ui.ts`
  - preview-facing dummy adapter
  - builds dummy project summaries, preview runtime, and preview wrapper data
  - now uses shared snapshot factory for final snapshot assembly
- `src/lib/mock/mockAnalysisLoadingState.ts`
  - stage-based mock state for standalone analysis-loading preview
  - used only by `/dev/analysis-preview`
- `src/lib/db/dummy/*.json`
  - dummy seed source

## 3. Responsibility Split by Layer

### UI

- render data
- handle local interactions
- keep layout and component structure
- do not own heavy transition logic

### Actions

- call API
- orchestrate async flow
- update stores in the correct order
- keep guarantees such as stale job ignore and safe project switching

### Domain

- pure functions only
- no store access
- no API access
- no component knowledge
- calculate progress transitions, snapshot patches, and store patch payloads

### API

- central place for backend/mock mode selection
- central place for contract normalization

### Mock

- provide a mock implementation of the same API contract
- keep facade stable
- move heavy mock generation logic into helper modules

### Preview

- support UI debugging and design adjustment
- keep preview-only wrappers and convenience data
- should not leak preview concerns into core shell logic

### Stores

- hold raw state only
- avoid adding derived render decisions here

### Selectors

- compute render mode and presentation decisions from raw state
- keep dashboard readiness logic centralized

## 4. What Improved in Step 1 to Step 6

### Step 1 and Step 2

- `/app` shell entry was unified
- toast stack was restored
- `PanoptesShellPage.svelte` no longer directly depends on dummy source
- dummy fallback injection moved to the entry layer

### Step 3

- pure progress mapping and runtime transition logic were extracted from `analysis.ts`
- `analysis.ts` is now closer to async orchestration only

### Step 4

- pure detail-to-store sync logic was extracted from `projects.ts`
- pure strategy snapshot patch logic was extracted from `strategy.ts`

### Step 5

- `mock-backend.ts` stopped owning all snapshot generation and tick logic directly
- snapshot creation moved to `mock/snapshot-factory.ts`
- job tick and transition logic moved to `mock/runtime-ticker.ts`
- mock state types moved to `mock/state.ts`

### Step 6

- preview dummy snapshot assembly moved closer to the same source of truth as mock API snapshots
- `panoptes_dummy_ui.ts` now builds the final snapshot through `snapshot-factory.ts`
- shape drift risk between preview UI and mock API was reduced

### Strategy UI consolidation

- strategy tab UI was moved under `src/lib/components/ComponentsBase/Strategy/*`
- `Panoptes/snapshot/strategy` remains a thin wrapper only
- duplicate `ComponentsBase/Strategy/industry` was removed
- reusable industry leaf components now live under `src/lib/components/ComponentsBase/industry/shared/*`

## 5. Current Remaining Structural Issues

- `PanoptesShellPage.svelte` still has some controller-like logic and can be thinned further
- `mock-backend.ts` still owns `loadState`, `saveState`, and mock detail assembly
- `panoptes_dummy_ui.ts` still contains preview-only section builders for competitor, industry, self, and strategy
- `session.ts` likely still contains state that is not cleanly bounded by clear readers
- some seed and mock text data still contain encoding noise, which makes reading harder

These are real issues, but they are not a reason to stop MVP implementation now.

## 6. Rules for Future Implementation

### What can go into `.svelte`

- local UI state
- simple event handlers
- lightweight presentational mapping
- composition of existing view-model data

### What should not go into `.svelte`

- API contract normalization
- snapshot generation
- progress transition logic
- cross-store patch calculation
- polling state machine logic

### Actions rules

- actions should own async ordering
- actions should call API and stores
- actions should not contain large pure calculation blocks if those blocks can move into `domain/`

### Domain rules

- domain helpers must be pure
- domain helpers must not import stores
- domain helpers must not call API
- domain helpers should return patch payloads or computed next state

### Mock rules

- keep mock facade stable
- move generation logic into `src/lib/panoptes/api/mock/`
- avoid duplicating snapshot shape logic between mock and preview

### Preview rules

- preview-only wrappers stay in `src/lib/db/dummy/`
- preview can override display content
- preview should reuse shared snapshot shape generation whenever possible

### Store rules

- stores hold raw state
- selectors derive UI decisions
- do not add state unless the read path is clear

### Naming rules

- use domain-prefixed names
- examples: `Panoptes*`, `Competitor*`, `Industry*`, `Self*`, `Strategy*`

### `/app` composition rule

- do not remove `hero/search + persistent shell`
- do not remount the shell during project switching

### Backend mode rule

- backend mode must not silently fall back to mock success

## 7. Areas We Should Not Touch Casually Right Now

- `src/lib/panoptes/api/client.ts`
  - current backend/mock policy is intentional
- `src/lib/panoptes/selectors/presentation.ts`
  - current readiness logic protects state guarantees
- `src/lib/panoptes/actions/analysis.ts`
  - polling and monotonic progress guarantees are sensitive
- `/app` route composition
  - current shell persistence rule is fixed

These areas can be changed later, but only with clear intent and careful verification.

## 8. Good Next Improvement Candidates

### Priority 1

- thin `PanoptesShellPage.svelte` further by moving controller-style logic out of the component

### Priority 2

- reduce remaining heavy responsibilities in `mock-backend.ts`

### Priority 3

- move more preview snapshot source logic behind shared helpers, especially strategy plan and phase task generation

### Priority 4

- clean up write-only or weakly-bounded session state

### Priority 5

- isolate or remove clearly unused legacy components after reference verification

## Quick Mental Model

If you are unsure where something should go, use this order:

1. If it renders UI, it goes in components
2. If it controls async flow, it goes in actions
3. If it is pure calculation, it goes in domain
4. If it calls backend or mock, it goes in api
5. If it is dev-only preview support, it goes in dummy/preview
6. If it is raw app state, it goes in stores
7. If it decides what UI mode to render from state, it goes in selectors

This is the current working architecture for Panoptes.
It is intentionally incremental, and it should be extended without breaking the current responsibility boundaries.
