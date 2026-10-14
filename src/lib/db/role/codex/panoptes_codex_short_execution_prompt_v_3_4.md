# Panoptes Codex Short Execution Prompt v3.4

以下をそのまま Codex に渡してください。

---

Implement Panoptes MVP based on the provided architecture documents.
Do not redesign the architecture. Implement it faithfully.

Treat these documents as canonical, in this priority order:
1. Panoptes Master Spec v3.4 StrategyOS DB Feed Integrated
2. Panoptes MVP Spec Final Reviewed v1.0
3. Panoptes DB Migration v3.3 Complete
4. Panoptes Types / Zod v3.3 Complete
5. Panoptes API Contract v3.3 Complete
6. Panoptes Frontend State Machine / Store Design v3.3 Complete
7. Panoptes Svelte Store Skeleton v3.3 Complete
8. Panoptes Codex Implementation Brief v3.4

Primary goal:
Implement the frontend orchestration and integration layer so that this flow works safely:
- user inputs analysis URL
- create-and-start-analysis runs with idempotency key
- project and job are created
- white analysis panel enters target scan
- panel auto-advances only on server-confirmed milestones
- inference review waits for user confirmation
- competitor analysis progresses
- industry analysis progresses
- strategy synthesis progresses
- snapshot commit succeeds
- dashboard renders only after committed current snapshot exists
- reanalysis preserves old snapshot until new commit succeeds

`/app` composition is fixed as:
- existing hero/search remains the top entry surface
- persistent shell is mounted below hero/search
- shell is responsible for project list / selected project / analysis flow / failed state / snapshot dashboard
- shell must remain mounted during project switching and create flow transitions

Non-negotiable guarantees:
- keep last stable project view visible during project switching
- do not blank the main surface immediately on project switch
- if switch hydration fails, revert to last stable view
- opening the + flow is UI-only until create succeeds
- disable duplicate submit during create
- always use idempotency handling for create/reanalyze
- only accept progress updates matching active project id and active job id
- ignore stale job responses silently
- progress step must be monotonic and must never move backward within the same job
- terminal runtime state must not revert to active
- ready state requires committed current_snapshot_id
- completed job status alone is not enough for ready
- if a stable snapshot already exists, preserve it during reanalysis
- reanalysis failure must keep old snapshot active
- white panel frame must remain mounted; only internal content may change
- step transitions must come from server-confirmed milestones, not local timers alone
- on commit success, refetch/reconcile project detail before treating dashboard as ready
- do not silently fall back to mock when backend mode is enabled

Mock / backend policy:
- mock is allowed only in explicit dev-only mode
- once real backend routes are confirmed for project list, project detail, create-and-start-analysis, and poll status, disable silent mock fallback
- do not use backend failure => mock success behavior
- backend errors must remain backend errors in backend mode

Implement these layers in order:
1. guard utilities and shared helpers
2. raw stores
3. derived selectors
4. API client wrappers
5. project actions
6. analysis actions
7. polling controller
8. component binding
9. dashboard / overlay behavior
10. verification against edge cases

Recommended split-file structure:
- src/lib/panoptes/stores/session.ts
- src/lib/panoptes/stores/projects.ts
- src/lib/panoptes/stores/runtime.ts
- src/lib/panoptes/stores/strategy.ts
- src/lib/panoptes/stores/network.ts
- src/lib/panoptes/stores/notifications.ts
- src/lib/panoptes/actions/projects.ts
- src/lib/panoptes/actions/analysis.ts
- src/lib/panoptes/actions/network.ts
- src/lib/panoptes/api/client.ts
- src/lib/panoptes/selectors/presentation.ts
- src/lib/panoptes/utils/guards.ts
- src/lib/panoptes/utils/errors.ts
- src/lib/panoptes/utils/idempotency.ts

Do not do any of the following unless explicitly instructed:
- do not replace the architecture with another state management approach
- do not optimistically render ready dashboard before committed snapshot is confirmed
- do not remove monotonic step guards
- do not collapse current snapshot and last stable snapshot into one concept
- do not remount the white panel on every step
- do not destroy old snapshot at reanalysis start
- do not silently change API semantics without documenting the mismatch
- do not silently switch backend mode into mock mode on errors
- do not remove the hero/search + shell composition of `/app`

Minimum acceptance conditions:
- switching projects never destructively blanks stable UI
- create failure preserves current project context
- stale progress events never mutate active UI
- white panel remains mounted across step transitions
- completed without committed snapshot does not render ready dashboard
- reanalysis preserves old snapshot until successful reconciliation
- polling stops on terminal state
- reconnect safely reconciles project detail and runtime state
- backend mode never silently degrades into mock success

If you encounter ambiguity, preserve the intent of the canonical documents instead of inventing shortcuts.
If real backend behavior differs from the contract, adapt carefully and document the mismatch explicitly.

Return code in a clean split-file structure with centralized guard logic.
Also include a short implementation summary listing:
- files created/updated
- any unavoidable contract mismatches
- any TODOs that require human confirmation

実装は repo 直下の ARCHITECTURE_NOTES.md を前提に進めてください。
現在の責務境界を壊さず、必要最小限の変更で対応してください。
新しい責務分離や構造変更が発生する場合は、最後に ARCHITECTURE_NOTES.md の更新要否も指摘してください。

---

