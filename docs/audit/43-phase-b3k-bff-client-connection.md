# Phase B-3K BFF Client Connection

## Implementation

- Added a typed canonical BFF client at the fixed browser base `/api/panoptes/v1` for all five implemented reads.
- Added an Organization feature command requiring explicit scope and validating organization/membership response consistency.
- Passed `activeOrganizationId` from verified route data through `/app` and `/app/analysis` into Shell bootstrap.
- Added BFF active-organization validation to both scoped read routes; Rails authorization remains unchanged.
- Added request timeout, `AbortSignal`, canonical envelope validation, safe error mapping, and route parameter encoding.
- Added a same-interface development mock boundary and prohibited production fallback.
- Replaced canonical-mode calls to nine unresolved legacy business paths with an explicit retryable 503 adapter.
- Preserved the B-3J AnalysisJob adapter and partial-result policy without changing canonical states.

## Connected operations

The canonical client supports health, current user, organization list, organization detail, and current membership. Shell bootstrap actively connects organization detail and membership. The other three are typed and tested existing reads but are not redundantly invoked by Shell.

## Deferred operations

Project list/detail, create/reanalysis, AnalysisJob read/poll/retry/cancel/confirmation, snapshot reads, usage, Strategy selection, and roadmap/task writes are DEFER. Their OpenAPI paths exist, but Rails application routes do not. No BFF façade or Rails endpoint was fabricated.

## Tests

Added coverage for canonical base/path encoding, five read paths, valid/malformed envelopes, 401/403/404/409/422/429/503, safe error messages, network failure, request timeout, caller abort, explicit/missing organization, cross-org response, organization switching, mock interface, no production fallback, BFF pre-forwarding gates, and Shell destroy abort. Existing adapter/polling tests continue to cover unknown state, `timed_out`, `partially_completed`, terminal stop, and stale result protection.

Automated result: 15 test files / 196 tests passed. The controllable-browser inventory was empty, so `/app` and `/app/analysis` could not be exercised interactively. The specified substitute passed: pure integration covers initial scope load, switching, stale-request abort, cross-org, 503/no-fallback, adapter and polling rules; route smoke covers application route responses.

## Files

New source files:

- `src/lib/panoptes/api/canonical-bff-client.ts`
- `src/lib/panoptes/api/mock-organization-boundary-client.ts`
- `src/lib/panoptes/api/organization-boundary-client.ts`
- `src/lib/panoptes/api/unavailable-canonical-business-client.ts`
- `src/lib/features/organization/organization-boundary.ts`

Changed source files:

- `src/lib/panoptes/api/client.ts`
- `src/lib/server/rails/client.ts`
- both organization-scoped BFF `+server.ts` files
- root `+layout.server.ts`
- `/app` and `/app/analysis` pages
- Shell Entry/Page/controller/adapter

Tests and documentation are listed in the phase change record and Development Log.

## Visual impact

No layout, spacing, typography, responsive, animation, Tailwind, token, Landing, or Strategy visual was changed. Only bootstrap data wiring and failure/cancellation boundaries changed.

## Remaining

- Implement the OpenAPI business routes in Rails as a separate backend phase.
- Then add organization-scoped project/job/snapshot clients and wire AbortSignal through project switch and polling requests.
- Add authenticated browser E2E fixtures for canonical success, 503, cross-org, partial, timeout, and stale-request scenarios.

## Quality

- `npm run check`: PASS (0 diagnostics)
- `npm run lint`: PASS (0 errors / 57 warnings; changed files add no warning)
- `npm run format:check`: PASS
- `npm run check:openapi`: PASS (18 operations / 18 operationIds)
- `npm run test`: PASS (15 files / 196 tests)
- `npm run build`: PASS
- `npm run test:secrets`: PASS
- `npm run test:smoke`: PASS
- `npm run quality`: PASS
- unresolved imports: 0; dependency cycles: 0
- Rails changes: none; OpenAPI changes: none
