# Phase B-3K Organization-scoped BFF Client Analysis

## Scope and conclusion

The implemented Rails application exposes only the five R-1 identity reads. They are the only operations that can be connected now without inventing a backend contract. The former frontend business client used nine non-canonical same-origin paths for which no SvelteKit routes exist. Canonical production mode now fails those operations explicitly with a retryable 503 instead of sending requests to legacy paths or falling back to mock data.

## Current client inventory

This table records the state found before B-3K and the B-3K decision.

| Operation | Former endpoint | Caller | Organization scope | Former mode | BFF connected | Classification / action |
|---|---|---|---|---|---|---|
| project list | `GET /api/project/list` | `actions/projects.ts` | absent | mock or legacy HTTP | no route | DEFER; canonical Rails route missing |
| project detail | `GET /api/project/{id}` | project/analysis actions | absent | mock or legacy HTTP | no route | DEFER; canonical Rails route missing |
| create/start analysis | `POST /api/project/create-and-start-analysis` | `actions/analysis.ts` | absent | mock or legacy HTTP | no route | DEFER |
| analysis progress | `GET /api/analysis/{job}/progress` | polling action | project only | mock or legacy HTTP | no route | DEFER |
| inference confirmation | `POST /api/project/{project}/inference/confirm` | analysis action | project only | mock or legacy HTTP | no route | DEFER |
| reanalysis | `POST /api/project/{project}/reanalyze` | analysis action | project only | mock or legacy HTTP | no route | DEFER |
| strategy selection | `POST /api/project/{project}/strategy/select` | strategy action | project only | mock or legacy HTTP | no route | DEFER |
| task status update | `POST /api/strategy/task/update-status` | strategy action | absent | mock or legacy HTTP | no route | DEFER |
| usage state | `GET /api/usage/current` | client contract; no active caller found | absent | mock or legacy HTTP | no route | DEFER |

Retry and cancel are present in the OpenAPI draft but were not operations of the former `PanoptesApiClient`. Snapshot reads were embedded in project detail/progress payloads rather than represented by a dedicated client operation.

## Existing BFF inventory

| BFF path | Rails path | Authentication | Active-org validation | Response | Timeout / fallback | Classification |
|---|---|---|---|---|---|---|
| `GET /api/panoptes/v1/health` | `/api/v1/health` | SvelteKit session currently required | none | canonical envelope | BFF timeout -> 503; no mock | ADAPT_EXISTING |
| `GET /api/panoptes/v1/me` | `/api/v1/me` | verified Supabase session | none | canonical envelope | same | ADAPT_EXISTING |
| `GET /api/panoptes/v1/organizations` | `/api/v1/organizations` | verified Supabase session | none | canonical envelope | same | ADAPT_EXISTING |
| `GET /api/panoptes/v1/organizations/{organizationId}` | same Rails path | verified session | requested ID must equal verified active org and active membership | canonical envelope | same | CONNECT_NOW |
| `GET /api/panoptes/v1/organizations/{organizationId}/memberships/me` | same Rails path | verified session | same | canonical envelope | same | CONNECT_NOW |

The canonical browser client models all five reads. Shell bootstrap currently consumes the two organization-scoped reads. Rails independently checks membership, so the BFF check is not the authorization source of truth.

## Organization scope and trust boundary

- The route server load reads the already verified `locals.auth.activeOrganizationId`.
- The page passes it explicitly through Entry Page and Shell Page to the feature command.
- The command accepts `{ organizationId, signal }`; it does not inspect a global store and never derives request scope from a response.
- The BFF rejects a missing/invalid active membership with 403 and hides a mismatched requested organization with 404 before Rails forwarding.
- Rails performs its existing authentication, membership, status, and role checks again. Role insufficiency remains 403.
- The command also rejects a response whose organization IDs do not equal the requested scope.

## Error boundary

| Condition | Client classification |
|---|---|
| 401 | `UNAUTHENTICATED` (or safe canonical code), non-retryable |
| 403 | `FORBIDDEN`, non-retryable |
| 404 / cross-org | `NOT_FOUND` / `organization_scope_mismatch`, non-retryable |
| 409 | `CONFLICT`, non-retryable |
| 422 | `VALIDATION_FAILED`, non-retryable |
| 429 | `RATE_LIMITED`, retryable unless canonical envelope says otherwise |
| 503 / 5xx | `UPSTREAM_UNAVAILABLE` / server error, retryable |
| network failure | `network_error`, retryable |
| browser request timeout | `request_timeout`, retryable |
| caller cancellation | `request_aborted`, non-retryable |
| canonical job `timed_out` | AnalysisJob terminal state; never mapped to request timeout |

Provider/internal error messages are not surfaced by the browser client. Only a safe code, status, and retryability are retained.

## Mock and canonical boundary

Both adapters implement `OrganizationBoundaryClient`. The environment choice occurs once in the API composition module, not in UI code. Mock is available only when both `dev` and `PUBLIC_USE_MOCK_API=true`. Canonical failures never trigger mock fallback. The former nine-operation contract remains available to the development mock, while canonical mode uses an explicit unavailable adapter until Rails business endpoints exist.

## Abort policy

The canonical five-read client accepts `AbortSignal` and combines caller cancellation with a bounded request timeout. Shell lifecycle aborts the initial organization validation on destroy. A future canonical project/job client must extend the same rule to project change and each polling request. That connection is deferred because its Rails endpoints do not exist; fabricating request URLs in B-3K would violate the contract boundary.

## Gaps

- Rails implements 5 of the OpenAPI draft's 18 operations; the 13 project/job/snapshot/strategy operations remain unavailable.
- Project list/detail, AnalysisJob polling, snapshot reads, usage, retry/cancel, reanalysis, confirmation, strategy, and roadmap connections remain deferred.
- The AnalysisJob adapter is ready for canonical payloads, but no implemented Rails AnalysisJob read can feed it yet.
- Browser-visible bootstrap error/retry presentation remains the existing Shell behavior; no visual redesign was included.
