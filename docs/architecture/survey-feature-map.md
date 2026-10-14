# Survey feature map

## Component structure

```text
ComponentsBase/SurveyModal.svelte        compatibility facade / composition root
└─ features/survey/components/
   ├─ SurveyModalFrame.svelte            overlay, dialog, focus, keyboard, scroll
   └─ SurveyForm.svelte                  form composition
      ├─ SurveyQuestionList.svelte       schema-driven fields
      ├─ SurveyNavigation.svelte         submit/navigation controls
      └─ SurveyFeedback.svelte           alert/status messages
```

## Logic and dependency direction

```text
schema ─┐
types ──┼─> validation ─┐
        ├─> navigation ─┼─> controller ─> SurveyForm ─> SurveyModal facade
        └─> result map ─┤
callback ─> service ────┘

DOM focus utility ─> SurveyModalFrame
```

UI components do not own validation or persistence rules. The controller depends on pure schema/navigation/validation/mapping modules and the callback-only service. The service does not depend on UI or framework code.

## Data flow

1. `surveyQuestions` defines field order, type, requirement, options and presentation metadata.
2. `SurveyQuestionList` reports typed `(questionId, value)` changes.
3. The controller updates `SurveyAnswers` and publishes an immutable `SurveySnapshot`.
4. On submit, validation returns field errors or normalized answers.
5. `mapSurveyResult` creates the historical `{ purpose, projectType, comment, email }` payload.
6. `submitSurvey` invokes only the optional parent callback.
7. The controller publishes `completed` or `failed`; feedback renders `status` or `alert`.

## Public API

`src/lib/features/survey/index.ts` exports:

- `SurveyModal` (the compatibility component)
- `SurveyPayload`
- `SurveySubmitter`

Schema, controller, validation, service and DOM helpers remain internal implementation details. Existing callers can continue importing and binding `ComponentsBase/SurveyModal.svelte`; no caller migration is required in this phase.

## Current constraints

- One page, four questions, existing order and labels
- No conditional or automatic question advance
- No local or remote persistence
- No Survey endpoint in Rails/OpenAPI
- Answers survive close/reopen for the lifetime of the mounted component
