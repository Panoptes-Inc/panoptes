# Login feature map

## Canonical UI and flow

```text
PanoptesSiteHeader
  └─ /login
      └─ SignUpForm(mode="login")
          ├─ SignUpFields / SignUpFeedback / SignUpBtn
          ├─ signup-schema.ts (pure validation)
          └─ signup-controller.svelte.ts (UI orchestration)
              └─ login-controller.ts (submit guard + safe redirect)
                  └─ loginWithPassword (provider result boundary)
                      └─ Supabase browser auth.signInWithPassword
                          └─ @supabase/ssr cookie session
                              └─ hooks.server.ts / SupabaseAuthAdapter
                                  ├─ protected route guard
                                  └─ /organization/select when required
```

## Responsibility map

| Layer                           | Canonical owner                                                      |
| ------------------------------- | -------------------------------------------------------------------- |
| Login Page layout/notices       | `src/routes/login/+page.svelte`                                      |
| Login/Signup mode UI            | `ComponentsBase/SignUpForm.svelte`                                   |
| Fields/password visibility      | `features/auth/signup/components/SignUpFields.svelte`                |
| Pure email/password validation  | `features/auth/signup/validation/signup-schema.ts`                   |
| UI form state                   | `features/auth/signup/state/signup-form-state.svelte.ts`             |
| Login submit/redirect lifecycle | `features/auth/login/state/login-controller.ts`                      |
| Supabase password I/O           | `features/auth/signup/services/signup-service.ts::loginWithPassword` |
| Provider error normalization    | `features/auth/signup/utils/signup-error-mapper.ts`                  |
| Safe return target              | `src/lib/auth/redirect.ts`                                           |
| Browser cookie client           | `src/lib/supabaseClient.ts`                                          |
| SSR request authentication      | `hooks.server.ts`, `server/auth/supabase.ts`                         |
| OAuth/email callback            | `routes/auth/callback/+server.ts`                                    |
| Logout                          | `routes/auth/logout/+server.ts`                                      |
| Organization selection          | `routes/organization/select`                                         |

The Signup-named service and error mapper are shared historical locations. B-3C avoids a broad Auth directory migration; Login does not duplicate them.

## State boundaries

Login controller state is `idle | submitting | authenticated | failed | rate_limited`. It rejects duplicate submit, maps unsafe return targets to `/app`, reports navigation failure as stable `network_error`, and ignores async completion after destroy.

Form-level field errors, loading display and password visibility remain in the existing form state. Signup-only Turnstile, terms, waitlist and confirmation resend are not moved into Login controller.

## SSR cookie and Organization behavior

The browser client is created with `@supabase/ssr`. A successful password login must return a session before the Login service reports success. Navigation invalidates server data; subsequent requests are resolved by the server Supabase client and `SupabaseAuthAdapter`. Protected routes redirect authenticated users without an active Organization membership to `/organization/select`.

## Public API

`features/auth/login/index.ts` exports the Login controller and its public types. The UI public API remains `features/auth/signup::SignUpForm` with `mode="login"`. There is no LoginModal public API after B-3C.
