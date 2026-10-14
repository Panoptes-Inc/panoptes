# Phase B-3C Login refactor result

## Classification and outcome

- Classification: **LEGACY_DUPLICATE**
- Canonical Login UI: `/login` → `SignUpForm mode="login"`
- Old `LoginModal.svelte`: deleted after confirming production/dev/test/barrel references are all zero
- Old size: 449 lines; final size: 0 lines

The old Modal was callback-only and did not establish a Supabase/SSR session. Its useful interactions—password visibility, email/password fields and signup mode switch—already exist in the canonical form. Its remember checkbox had no session behavior and was not migrated.

## Implementation

- Added a framework-independent Login controller for submit status, duplicate-submit protection, safe redirect, navigation failure and destroy behavior.
- Wired the existing Signup form controller's Login mode to that controller.
- Kept `loginWithPassword` as the only Supabase password-login service.
- Retained existing pure validation, stable error mapper and SSR cookie client.
- Added destroy guards around the existing Signup/resend asynchronous boundaries.
- Did not add a Modal facade because no active caller requires one.

## Changed files

- deleted `src/lib/components/ComponentsBase/LoginModal.svelte`
- added `src/lib/features/auth/login/types.ts`
- added `src/lib/features/auth/login/state/login-controller.ts`
- added `src/lib/features/auth/login/index.ts`
- changed `src/lib/features/auth/signup/state/signup-controller.svelte.ts`
- changed `tests/unit/signup-feature.test.ts`
- added this audit, `27-login-modal-reachability-and-responsibility.md`, and `docs/architecture/login-feature-map.md`

No `/login` markup, Header behavior, Rails file or OpenAPI file was changed.

## Tests

Login additions cover normalized valid input, invalid email, empty password, session-required success, invalid credentials, provider/network failure, initial controller state, duplicate submit, successful safe redirect, unsafe redirect fallback, email-unconfirmed/rate-limit mapping, navigation failure and destroy-after-async suppression.

Component-test decision: **B — Pure/controller tests plus browser verification**. The repository still has no DOM component-test foundation. The canonical Login UI already composes tested pure/controller/service boundaries, and the browser exercise verifies rendered fields and behavior without adding a new dependency in this deletion/refactor phase.

## Browser verification

The local canonical route was exercised without submitting real credentials:

- Header Login link resolves to `/login`.
- `/login?returnTo=https://evil.example` renders the Login form and remains on the local route.
- email and password fields, password visibility toggle, Login CTA and Signup mode switch render and operate.
- Signup switch renders the existing Signup fields, CAPTCHA region and terms controls.
- `/login?error=callback_failed` renders the stable callback-failure notice and Login form.
- Native/pure validation prevents invalid email submission before provider I/O.
- Browser console errors: 0.

## UI and specification impact

The active `/login` UI, wording, input order, CTA, signup switch, color, spacing, typography, redirect contract and Supabase method are unchanged. An unreachable legacy UI was removed. Password reset and OTP remain unimplemented rather than being inferred.

## Quality result

`npm run quality` completed with exit code 0 on 2026-08-07.

- Svelte check: 0 errors / 0 warnings
- ESLint: 0 errors / 60 warnings; Login-related changed files: 0 warnings
- Format check: pass
- OpenAPI: 18 operations / 18 unique operation IDs
- Vitest: 8 files / 86 tests passed
- Auth smoke: 5 scenarios passed
- Production build: 501 SSR modules / 518 client modules, success
- Client secret boundary: 67 build files scanned, pass
- Route smoke: all expected statuses passed, including `/login` 200
- Unresolved imports: 0
- New circular dependency: none observed by check/build/test execution
- Production mock fallback: unchanged; mock Auth remains development-gated

## Remaining work

- Design and implement the password-reset route/callback as a separate Auth task.
- Decide whether a remember-session control has a real provider/cookie requirement.
- Introduce a shared Svelte component-test foundation in a dedicated quality phase.

## Next component

`ContactModal.svelte` (approximately 431 lines) is the next recommended large component. Its callback-only persistence and modal lifecycle should be audited before splitting.
