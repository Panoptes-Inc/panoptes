# Panoptes Codex Implementation Brief v3.4

## 0. Purpose

This brief is the implementation handoff prompt for Codex.
Its purpose is to let Codex implement Panoptes MVP safely and consistently without breaking the architectural assumptions already fixed in the specs.

This brief is not a product spec rewrite.
It is an execution contract for implementation.

---

## 1. High-Level Goal

Implement the Panoptes MVP frontend and integration layer based on the already-defined architecture.

The implementation must preserve all stability constraints already decided in the design documents, especially:

- no destructive UI resets during project switching
- no stale job response corruption
- no progress regression
- no false ready state before committed snapshot exists
- no loss of prior snapshot during reanalysis
- center white analysis panel must remain mounted and only change internal content
- server-confirmed milestones must drive step transitions
- `/app` must operate as a persistent shell under the hero/search entry surface
- mock fallback must not silently replace real backend behavior once backend mode is enabled

The implementation target is not "invent a better architecture."
The target is "faithfully implement the existing architecture with production-safe guards."

---

## 2. Canonical Source of Truth

Codex must treat the following as canonical and must not silently override them with alternative design choices.

Priority order:

1. Panoptes Master Spec v3.4 StrategyOS DB Feed Integrated
2. Panoptes MVP Spec Final Reviewed v1.0
3. Panoptes DB Migration v3.3 Complete
4. Panoptes Types / Zod v3.3 Complete
5. Panoptes API Contract v3.3 Complete
6. Panoptes Frontend State Machine / Store Design v3.3 Complete
7. Panoptes Svelte Store Skeleton v3.3 Complete

If implementation pressure reveals ambiguity, Codex should resolve it by preserving these documents’ intent, not by inventing a conflicting shortcut.

---

## 3. Primary Implementation Objective

Codex should implement the frontend and API integration so that the following flow works safely:

1. user inputs analysis URL
2. create-and-start-analysis API is called with idempotency key
3. project is created and job starts
4. central white panel enters target scan
5. panel auto-advances only when backend confirms milestone
6. inference review step appears and waits for confirmation
7. user confirms inference
8. competitor analysis progresses
9. industry analysis progresses
10. strategy synthesis progresses
11. snapshot commit completes
12. dashboard renders only after committed current snapshot exists
13. if reanalysis starts later, old snapshot remains visible until new commit succeeds

This is the core happy path and must be made robust before optional enhancements.

---

## 4. Product Surface Requirements

### 4.1 `/app` top composition
`/app` top is confirmed as:

- existing hero/search as the top entry surface
- persistent app shell mounted below it

Intent:

- hero/search remains the new-analysis entry point
- shell remains the stable operating surface for project list, selected project, analysis flow, and snapshot dashboard
- shell should stay mounted across project hydration, create flow, and switching
- the product should not hard-replace hero/search with the shell; both coexist with different roles

### 4.2 Shell behavior
The shell is responsible for:

- project list
- selected project view
- analysis flow rendering
- failed state rendering
- snapshot dashboard rendering
- safe switching between states

The shell must not be destructively reset during create or project switching.

---

## 5. Non-Negotiable Guardrails

Codex must not violate any of the following.

### 5.1 Project switching
- Do not blank the main surface immediately when a different project is selected.
- Keep the last stable rendered project view visible while new project detail hydrates.
- If switch hydration fails, revert to the last stable project view.
- Shell must remain mounted while project detail changes.

### 5.2 Create flow
- Opening the `+` flow is UI-only.
- Do not destroy existing project view until create-and-start-analysis succeeds.
- Use idempotency key for create requests.
- Disable duplicate submit while create is in flight.

### 5.3 Progress updates
- Only accept progress events matching both active project id and active job id.
- Ignore stale or mismatched job updates silently.
- Step index must be monotonic and must not move backward.
- Terminal runtime state must not revert to active.

### 5.4 Ready state
- `ready` state requires actual committed `current_snapshot_id`.
- `completed` job status alone is not enough.
- Never render dashboard as ready if snapshot pointer is not committed.

### 5.5 Reanalysis
- If a stable snapshot already exists, keep it rendered during reanalysis.
- Reanalysis progress should appear as overlay / sidecar / banner, not destructive replacement.
- If reanalysis fails, keep old snapshot active.

### 5.6 White analysis panel
- The white panel frame must stay mounted.
- Only the internal content changes by step.
- Step transitions come from backend-confirmed state, not local timers alone.
- Avoid flicker, collapse, or full remount on every step change.

### 5.7 Commit success handling
- On snapshot commit success, refresh project detail.
- Treat ready state as valid only after detail confirms the new current snapshot.
- If commit reconciliation fails, do not fake success.

### 5.8 Mock fallback policy
- Do not silently fall back to mock when backend mode is enabled.
- Mock is allowed only in explicit dev-only mode controlled by a clear flag.
- Backend failure must surface as backend failure, not fake mock success.
- Especially do not preserve mock fallback for create-and-start-analysis or poll-status once backend integration is active.

---

## 6. Technical Scope for Codex

Codex should implement the following layers in order.

### Layer A. Core store and selector structure
Implement and wire:

- session UI store
- project collection store
- project detail store
- analysis runtime store
- strategy UI store
- network store
- notification store
- derived selectors for render state and panel presentation

### Layer B. Action layer
Implement and wire:

- refreshProjectList
- selectProject
- createAndStartAnalysis
- applyProgressUpdate
- confirmInference
- reconcileOnCommitSuccess
- reanalyzeProject
- network reconcilers
- polling start / stop / backoff scheduling

### Layer C. API integration layer
Implement actual API client wrappers that conform to the existing API contract.
Do not redesign endpoint semantics unless required by real backend mismatch.

### Layer D. UI integration
Bind stores into Svelte components so that:

- `/app` top keeps hero/search as entry and shell as persistent operating surface
- strategy route shell stays stable during switching
- white panel reflects runtime state
- right project list remains usable
- dashboard consumes current snapshot or last stable snapshot correctly
- reanalysis overlay appears only when appropriate

### Layer E. Basic verification
Implement testable checkpoints for stale-job rejection, project-switch safety, reanalysis safety, shell persistence, and backend-vs-mock separation.

---

## 7. Backend / Mock Integration Rule

Codex should assume the following rollout rule.

### 7.1 When mock may exist
Mock may exist only for explicit development scaffolding.

### 7.2 When mock must be disabled
Once the following real backend routes are confirmed working in backend mode, silent mock fallback must be disabled:

- project list
- project detail
- create-and-start-analysis
- poll status

Recommended disable sequence:

1. disable mock fallback for project list and project detail
2. disable mock fallback for create-and-start-analysis
3. disable mock fallback for poll status
4. disable mock fallback for inference confirm / reanalysis after backend parity

### 7.3 Forbidden hybrid behavior
The following is forbidden:

- backend request fails
- app silently returns mock success
- UI continues as if backend truth existed

This breaks snapshot guarantees, progress guarantees, and stale-job guarantees.

---

## 8. What Codex Should Not Do

Codex must not do the following unless explicitly instructed.

- do not replace the architecture with a different state management approach
- do not introduce optimistic ready rendering before snapshot commit is confirmed
- do not merge project selection and create flow into a destructive single transition
- do not remove monotonic step guards
- do not rely on local timers as truth for progress advancement
- do not silently rename domain concepts that are already fixed in the specs
- do not flatten away the distinction between current snapshot and last stable snapshot
- do not remove idempotency handling
- do not make the panel remount every step
- do not discard old snapshot on reanalysis start
- do not silently switch backend mode into mock mode on errors
- do not remove the hero/search + shell dual-role composition of `/app`

Codex should optimize implementation details, not change core behavior.

---

## 9. Expected Project Structure

Codex may begin from the single-file store skeleton, but the final implementation should preferably be split into focused files.

Recommended structure:

- `src/lib/panoptes/stores/session.ts`
- `src/lib/panoptes/stores/projects.ts`
- `src/lib/panoptes/stores/runtime.ts`
- `src/lib/panoptes/stores/strategy.ts`
- `src/lib/panoptes/stores/network.ts`
- `src/lib/panoptes/stores/notifications.ts`
- `src/lib/panoptes/actions/projects.ts`
- `src/lib/panoptes/actions/analysis.ts`
- `src/lib/panoptes/actions/network.ts`
- `src/lib/panoptes/api/client.ts`
- `src/lib/panoptes/selectors/presentation.ts`
- `src/lib/panoptes/utils/guards.ts`
- `src/lib/panoptes/utils/errors.ts`
- `src/lib/panoptes/utils/idempotency.ts`

Codex may adapt file boundaries slightly, but guard logic should stay centralized.

---

## 10. State Behavior Requirements

Codex must preserve the following render behavior.

### 10.1 Main surface modes
Allowed main render modes:

- empty state
- analysis flow
- failed state
- snapshot dashboard

Behavior:
- empty project without snapshot => empty state
- active analysis without stable snapshot => analysis flow
- failed analysis without stable snapshot => failed state
- committed snapshot exists => snapshot dashboard
- reanalysis over committed snapshot => snapshot_dashboard + overlay

### 10.2 Runtime progression
Expected analysis progression:

- target_scan
- inference_review
- competitor_analysis
- industry_analysis
- strategy_synthesis
- committing_snapshot
- completed

`visibleStep` is authoritative for panel content.

### 10.3 Failure behavior
- initial analysis failure without snapshot must show deterministic failed state
- reanalysis failure with stable snapshot must preserve dashboard and show recoverable failure overlay/banner
- malformed or stale progress payload should not crash the UI

---

## 11. API Behavior Assumptions

Codex should assume these behaviors unless the real backend contract proves otherwise.

- create analysis returns project + job
- project detail returns project + current snapshot + latest analysis job
- poll status returns job progress for one project/job pair
- confirm inference resumes paused analysis
- reanalyze creates a new job tied to same project
- committed snapshot id may appear in poll response or become visible after detail refetch

If backend behavior differs, Codex should adapt the client carefully while keeping the frontend guarantees intact.

---

## 12. Error Handling Requirements

Codex should implement user-safe and developer-useful error handling.

Required behavior:

- normalize API errors
- keep stable UI visible on recoverable failures
- use toasts for transient failures
- avoid dumping raw backend errors into user-facing UI
- log unexpected payload problems in a traceable way
- do not let polling errors wipe runtime state
- back off polling on degraded connectivity
- do not hide backend outages behind mock data when backend mode is enabled

---

## 13. Minimum Acceptance Checklist

Codex implementation is acceptable only if all of the following are true.

### Project switching
- selecting another project does not instantly blank the main view
- failed project hydration returns to last stable view
- shell remains mounted during switching

### Create flow
- double submit does not create duplicate analysis jobs
- create failure preserves existing project context

### Progress handling
- stale job updates do not mutate active analysis UI
- out-of-order earlier step updates do not regress current step

### White panel
- panel frame remains mounted across analysis steps
- step transitions are driven by backend milestones

### Ready state
- dashboard ready state requires committed snapshot pointer
- completed job without committed snapshot does not render as ready

### Reanalysis
- old snapshot remains visible during reanalysis
- reanalysis failure preserves old snapshot
- reanalysis success swaps to new snapshot only after successful reconciliation

### Network / polling
- polling stops on terminal state
- reconnect path reconciles selection safely

### Backend mode
- no silent mock fallback in backend mode
- backend errors remain visible as backend errors

---

## 14. Recommended Codex Work Sequence

Use this order.

1. implement guard utilities and shared helpers
2. implement raw stores
3. implement derived selectors
4. implement API client wrappers
5. implement project actions
6. implement analysis actions
7. implement polling controller
8. bind strategy route shell
9. bind white panel presentation
10. bind dashboard / overlay behavior
11. run through acceptance checklist
12. refactor file split only after behavior is stable

This order matters because guard correctness is more important than cosmetic component decomposition.

---

## 15. Prompt Template for Codex

Use the following instruction style when giving this work to Codex.

---

Implement Panoptes MVP based on the provided architecture documents.
Do not redesign the architecture.
Faithfully implement the existing store, selector, action, polling, and rendering behavior.

Preserve these non-negotiable guarantees:
- keep last stable project view visible during project switching
- ignore stale job responses using project id + job id matching
- keep progress monotonic
- require committed current snapshot before rendering ready dashboard
- preserve old snapshot during reanalysis
- keep white analysis panel frame mounted and only change internal content
- drive step transitions from server-confirmed milestones only
- keep `/app` as hero/search entry plus persistent shell below
- do not silently fall back to mock when backend mode is enabled

Implementation priority:
1. guard utilities
2. stores
3. derived selectors
4. API client wrappers
5. project actions
6. analysis actions
7. polling controller
8. component binding

Do not remove idempotency handling.
Do not fake ready state.
Do not destructively reset UI during project switching or reanalysis.
Do not silently replace backend truth with mock responses.

Return code changes in a clean, split-file structure where guard logic remains centralized.
Document any unavoidable backend mismatches explicitly instead of silently changing the contract.

---

## 16. Final Note

Yes, the current specification set is strong enough to hand to Codex for implementation, especially for the frontend orchestration layer.

The biggest implementation risk is not “missing ideas.”
The biggest risk is Codex making simplifying assumptions that break the stability guarantees.

That is why this brief exists.
It should be given together with the actual spec documents so Codex treats the architecture as fixed and implements inside those boundaries.

