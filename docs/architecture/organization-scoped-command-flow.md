# Organization-scoped Command Flow

## Canonical production flow

```text
Svelte route server load
  verified activeOrganizationId
        |
        v (explicit prop)
Panoptes Shell UI
        |
        v
Feature command: loadOrganizationBoundary({ organizationId, signal })
        |
        v
OrganizationBoundaryClient / CanonicalBffClient
        |
        v
/api/panoptes/v1/organizations/{organizationId}
/api/panoptes/v1/organizations/{organizationId}/memberships/me
        |
        v
SvelteKit BFF
  verifies session + active organization equality + membership
        |
        v
Rails API
  revalidates JWT + user + organization membership/role
        |
        v
Rails models / DB
```

The browser-provided organization ID is a requested scope, never trusted authority. A cross-organization request is hidden as 404 at both applicable boundaries; insufficient role is 403.

## Ownership

| Layer             | Owns                                                               | Must not own                             |
| ----------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| Route server load | verified active organization selection from auth context           | business response parsing                |
| Page/Shell        | explicit propagation and rendering                                 | Rails URL, raw fetch, scope inference    |
| Feature command   | operation input, scope consistency, active-state validation        | global organization lookup, HTTP details |
| Client            | canonical BFF paths, envelope parsing, error mapping, cancellation | UI state, Rails internal URL             |
| SvelteKit BFF     | session/token forwarding, active-org gate, timeout, safe response  | mock fallback, final Rails authorization |
| Rails             | JWT/user/membership/role authorization and domain data             | frontend state                           |

## Mock flow

```text
UI -> Feature command -> OrganizationBoundaryClient interface -> development MockClient
```

The mock adapter receives the same explicit `organizationId`. Selection is allowed only in development with the opt-in public flag. UI code contains no mock branch, and canonical errors do not fall back.

## Cancellation and stale data

- Shell destroy aborts the organization bootstrap signal.
- Switching organization requires destroying/aborting the old lifecycle before starting the new scoped command.
- The client reports caller cancellation as `request_aborted` and its own deadline as `request_timeout`.
- Canonical AnalysisJob `timed_out` remains a domain state after a successful HTTP response.
- Project switching and polling will use the same signal flow when the corresponding Rails endpoints are implemented.

## AnalysisJob and partial results

The B-3J adapter remains the sole canonical AnalysisJob-to-runtime mapper. `partially_completed` is terminal, stops polling, can preserve/display the committed evidence snapshot, emits a warning, and allows reanalysis. It must not automatically become a Strategy source. B-3K adds no alternate state parsing or strategy pipeline.
