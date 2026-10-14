# Rails R-1 foundation

## Purpose and scope

`rails/` is the API-only Rails boundary for Panoptes. R-1 implements identity and organization reads only. Project, analysis job, queue, worker, crawler, billing, and LLM execution are intentionally outside this phase.

## Pinned runtime

- Ruby: 3.4.10 (`rails/.ruby-version` and `rails/Dockerfile`)
- Rails: `~> 8.1.3` (currently locked to 8.1.3.1)
- Bundler lockfile format: Bundler 2.6.9
- Database: PostgreSQL 17 in local Compose

Ruby 3.4 was selected instead of the newer Ruby 4 line to reduce ecosystem compatibility risk while retaining security support. Version selection was checked against the official [Ruby releases](https://www.ruby-lang.org/en/news/2026/) and [Rails releases](https://www.rubyonrails.org/releases) on 2026-08-07.

## Local startup

1. Copy `rails/.env.example` to an untracked environment file and replace the Supabase project values.
2. Run `docker compose -f rails/compose.yaml up --build` from the repository root.
3. Confirm `GET http://127.0.0.1:3000/api/v1/health`.

The Compose password is development-only. Production must supply `DATABASE_URL` and all Supabase JWT settings through the deployment secret store. Rails credentials keys, `.env` files, database data, and logs are ignored. No Supabase service-role key is used.

The image runs as the unprivileged `rails` user. Compose health-checks both PostgreSQL and the Rails health endpoint. R-1 keeps build tooling in the single image for a simple, reproducible quality gate; a later production-hardening phase may split build/runtime stages and remove development scanners from the runtime layer.

## Implemented API

| Method | Path                                                    | Authentication                   |
| ------ | ------------------------------------------------------- | -------------------------------- |
| GET    | `/api/v1/health`                                        | Public                           |
| GET    | `/api/v1/me`                                            | Bearer JWT                       |
| GET    | `/api/v1/organizations`                                 | Bearer JWT                       |
| GET    | `/api/v1/organizations/:organization_id`                | Bearer JWT + readable membership |
| GET    | `/api/v1/organizations/:organization_id/memberships/me` | Bearer JWT + active membership   |

Successful responses use `{ data, meta }`; failures use `{ error, meta }`. `meta.request_id` is always present. Valid incoming request/correlation IDs are propagated; invalid values are replaced before logging.

## Quality gates

`rails/bin/quality` runs Rails tests, RuboCop, Brakeman, and Bundler Audit. `.github/workflows/rails-quality.yml` runs the same boundary against PostgreSQL on pull requests and `main` pushes. The API contract remains at `docs/api/openapi-draft.yaml` and is validated by the frontend quality job.
