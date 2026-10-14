# Phase B-3B SurveyModal refactor result

## Implementation summary

The 455-line `SurveyModal.svelte` was reduced to a 29-line compatibility facade. Question schema, typed answers, controller/state machine, navigation/progress, pure validation, result/error mapping, callback service, modal lifecycle and presentation components now have separate owners.

## Changed files

- `src/lib/components/ComponentsBase/SurveyModal.svelte`
- `src/lib/components/ComponentsBase/PanoptesSiteHeader.svelte`（survey link に `aria-expanded` を追加）
- `src/lib/features/survey/index.ts`
- `src/lib/features/survey/types.ts`
- `src/lib/features/survey/schema/survey-questions.ts`
- `src/lib/features/survey/navigation/survey-navigation.ts`
- `src/lib/features/survey/validation/survey-validation.ts`
- `src/lib/features/survey/state/survey-state-machine.ts`
- `src/lib/features/survey/state/survey-controller.ts`
- `src/lib/features/survey/services/survey-service.ts`
- `src/lib/features/survey/utils/survey-result-mapper.ts`
- `src/lib/features/survey/utils/survey-error-mapper.ts`
- `src/lib/features/survey/utils/survey-focus.ts`
- `src/lib/features/survey/components/SurveyModalFrame.svelte`
- `src/lib/features/survey/components/SurveyForm.svelte`
- `src/lib/features/survey/components/SurveyQuestionList.svelte`
- `src/lib/features/survey/components/SurveyNavigation.svelte`
- `src/lib/features/survey/components/SurveyFeedback.svelte`
- `tests/unit/survey-feature.test.ts`
- this audit and `docs/architecture/survey-feature-map.md`

No production file was deleted. No Rails or OpenAPI file was changed.

## Line counts and responsibilities

| Unit | Lines | Responsibility |
|---|---:|---|
| old `SurveyModal.svelte` | 455 | all responsibilities |
| new facade | 29 | props, controller subscription, composition |
| `SurveyModalFrame.svelte` | 62 | dialog lifecycle and shell |
| `SurveyQuestionList.svelte` | 67 | schema-driven question UI |
| `SurveyForm.svelte` | 31 | form composition and invalid focus |
| `SurveyNavigation.svelte` | 14 | submit control |
| `survey-controller.ts` | 136 | answers and state transitions |
| `survey-validation.ts` | 79 | pure validation |

## Compatibility and UI impact

- `open` bind and optional `onSubmit` props are unchanged.
- Callback payload keys and normalization are unchanged.
- Four questions, choices, order, required/optional behavior, button text, success/error text, classes, colors, spacing, modal dimensions, animation and responsive CSS are preserved.
- Close/reopen still preserves answers; no reset is performed on close.
- No API was invented. Submission remains callback-only and succeeds without a callback.
- Accessibility was strengthened with labelled/described dialog semantics, focus trap/restore, field `aria-invalid`/`aria-describedby`, `alert`/`status`, and `aria-busy`, without redesigning the UI.

## Tests

`tests/unit/survey-feature.test.ts` contains 15 tests covering required/optional answers, single/multiple choice, invalid options, normalization, unknown question, next/back/final/progress, answer retention, validation-before-submit, duplicate-submit prevention, completed/failed retry, reset and destroy-after-async behavior.

Component-test choice: **B (not introduced in this phase)**. The repository has Vitest but no DOM/component test environment or Svelte Testing Library. Adding that dependency and test harness solely for this refactor would exceed the requested minimum scope. Pure/controller tests plus an actual browser exercise cover the critical behavior; a shared component-test foundation should be introduced as a dedicated quality task.

## Browser verification

An ephemeral, public local QA page was used and removed after the test. The in-app browser verified:

- modal renders as `role=dialog` with the expected title and four questions;
- body scrolling is locked while open and restored after close;
- blank submit shows the existing required message;
- select/text/email values survive Escape close and reopen;
- callback runs with `{"purpose":"strategy","projectType":"SaaS","comment":"導線を改善したい","email":"test@example.com"}`;
- completion status shows the existing success text;
- no browser console errors occurred.

The production header entry remains unchanged. The root page contains other survey links inside product preview content, so browser selectors must scope the actual banner when separately testing that entry.

## Quality results

`npm run quality` completed with exit code 0 (2026-08-07).

- Svelte check: 0 errors / 0 warnings
- ESLint: 0 errors / 60 warnings (baseline 67; Survey files 0)
- Format check: pass
- OpenAPI: pass, 18 operations / 18 unique operation IDs
- Vitest: 8 files / 73 tests passed
- Auth smoke: 5 scenarios passed
- Production build: pass, 500 SSR modules / 517 client modules
- Client secret boundary: pass, 67 build files scanned
- Route smoke: pass for all expected status codes
- Unresolved imports: 0
- Circular dependency introduced: none found by build/import graph execution

## Remaining work

- Decide the real persistence/API contract before adding any Survey endpoint.
- Add a reusable Svelte component-test environment in a separate quality phase.
- Define version/timestamp and migration policy only when persisted submissions exist.
- If multi-page or conditional questions are introduced, extend schema/controller tests before UI changes.

## Next component

`LoginModal.svelte` is the next recommended large component (approximately 449 lines), followed by `ContactModal.svelte` (approximately 431 lines). Their auth/contact side effects require separate scope and should not be mixed into B-3B.
