# Rails Phase R-1 implementation record

Date: 2026-08-07

## Outcome

An API-only Rails application now exists in `rails/`, backed by PostgreSQL and independently validating Supabase JWTs. The implemented surface is limited to health, current user, organizations, and current membership. SvelteKit has authenticated read-only BFF routes for the same surface.

## Implemented changes

- Pinned Ruby 3.4.10 and Rails 8.1.3.x; generated a minimal API-only application and removed generated cache/queue/cable/storage/job/mailer facilities outside R-1.
- Added PostgreSQL UUID migrations, constraints, models, development-only seed records, fixtures, and identity/organization tests.
- Added bearer parsing, issuer/audience/expiry/nbf/signature verification, UUID subject validation, bounded JWKS retrieval, cache, stale grace, unknown-`kid` refresh, and rotation tests.
- Added UUID-based local user mapping and separate organization membership/system-admin records.
- Added common JSON envelopes, request/correlation IDs, sensitive-value filtering, no-store responses, and 401/403/404 behavior.
- Added the five `/api/v1` endpoints and documented them in the OpenAPI draft.
- Added SvelteKit `/api/panoptes/v1` BFF endpoints, server-only Rails URL/timeout settings, token/user matching, error passthrough, and retryable 503 mapping without mock fallback.
- Added Dockerfile, PostgreSQL Compose setup, Rails quality script, and Rails CI workflow.

## Security decisions

- Email, JWT metadata roles, browser organization IDs, and BFF assertions are not authorization sources.
- Unaffiliated and inactive organization lookups return the same 404.
- `guest` can inspect its own membership but receives 403 for organization detail.
- No service-role key, Rails key, or real Supabase secret was created or committed. The generator-created local Rails master key/credentials ciphertext were removed because R-1 has no credentials payload.
- Production configuration validation fails closed for missing/invalid Supabase JWT settings; database startup requires a usable `DATABASE_URL`.

## Verification

- PostgreSQL migration: applied successfully in the containerized test database.
- Rails tests: 18 runs, 71 assertions, 0 failures, 0 errors.
- RuboCop: 42 files, 0 offenses.
- Brakeman: 0 warnings.
- Frontend unit tests: 5 files, 32 tests passed.
- Svelte check: 0 errors and 0 warnings.
- Bundler Audit: current ruby-advisory-db, no vulnerabilities found.
- OpenAPI validator: 18 operations, 18 unique operation IDs, no unresolved references.
- Frontend full `npm run quality`: exit 0; type check 0 errors/warnings, format pass, 32 unit tests pass, auth/route smoke pass, production build pass, client secret scan pass.
- Frontend ESLint still reports the pre-existing 93 warnings (0 errors); none are in the R-1 BFF files.
- Rails production Docker image: built successfully from the pinned runtime and lockfile.
- Final image runtime user: UID 1000 (`rails`), not root.
- Production eager-load boot: `PanoptesApi` booted successfully with validated placeholder configuration.
- Compose runtime smoke: PostgreSQL healthy; Rails returned 200 from `/api/v1/health` after entrypoint migration preparation. Verification containers were stopped afterward; the local development volume was preserved.
- Production eager-load boot check exposed and corrected an initializer ordering issue; the JWT configuration validation now runs after application eager loading.
- Randomized test order exposed error-subclass autoload coupling; common API errors are now loaded explicitly at application boot.

## Deliberately not implemented

Project, AnalysisJob, Snapshot, strategy, queue/worker, crawler, LLM execution, billing, write APIs, role administration, invitations, and production deployment are unchanged design/backlog items.

## File inventory

- Rails foundation: `rails/Gemfile`, `rails/Gemfile.lock`, `rails/.ruby-version`, `rails/config/application.rb`, environment/database/routes/initializer configuration, and API-only generated boot files.
- Runtime: `rails/Dockerfile`, `rails/compose.yaml`, `rails/.dockerignore`, `rails/.env.example`, `rails/bin/docker-entrypoint`, and `rails/bin/quality`.
- Boundary implementation: `rails/app/controllers/**`, `rails/app/errors/api_error.rb`, `rails/app/models/**`, `rails/app/services/auth/**`, and `rails/lib/panoptes_request_context.rb`.
- Persistence: `rails/db/migrate/20260807000000_create_identity_and_organization_boundary.rb`, `rails/db/schema.rb`, and `rails/db/seeds.rb`.
- Rails verification: `rails/test/fixtures/**`, `rails/test/support/jwt_fixture.rb`, and the model/service/integration tests under `rails/test`.
- SvelteKit BFF: `src/lib/server/rails/client.ts`, five routes under `src/routes/api/panoptes/v1`, and the BFF policy branch in `src/lib/server/auth/policy.ts`.
- Frontend verification/config: `tests/unit/rails-bff.test.ts`, `tests/unit/auth-guard.test.ts`, `tests/stubs/private-env.ts`, `vitest.config.js`, and root `.env.example`.
- Contract/automation: `docs/api/openapi-draft.yaml`, `scripts/validate-openapi.mjs`, and `.github/workflows/rails-quality.yml`.
- Documentation: `docs/rails/01-foundation.md`, `02-authentication.md`, `03-organization-authorization.md`, and this audit record.

Generator-created `config/master.key`, `config/credentials.yml.enc`, mailer views, and unused queue/cache/cable/job/storage files were removed. No Project or AnalysisJob implementation was added.

## Follow-up

1. Configure real production Supabase issuer/audience/JWKS URL and deployment secrets.
2. Add deployment-level TLS/network policy between SvelteKit and Rails and production observability.
3. Implement audited membership/role administration before exposing write operations.
4. Begin the next Rails business phase from the existing OpenAPI backlog, retaining organization-scoped loading and request-level contract tests.
5. Add edge rate limiting and production network policy; R-1 deliberately relies on the deployment edge and does not add an in-process limiter or browser-to-Rails CORS path.
