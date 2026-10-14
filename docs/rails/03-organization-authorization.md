# Organization authorization boundary

## Canonical records

Rails PostgreSQL is the source of truth for organizations and permissions:

- `organizations`: active or suspended tenant record;
- `organization_memberships`: one user/organization membership with role and status;
- `system_roles`: separate global `system_admin` assignment;
- `users`: local identity keyed by Supabase UUID.

Supabase JWT metadata and SvelteKit cookies do not grant organization or system roles.

## Organization roles

| Role               | List organizations | Read organization | Read own membership |
| ------------------ | ------------------ | ----------------- | ------------------- |
| owner              | Yes                | Yes               | Yes                 |
| organization_admin | Yes                | Yes               | Yes                 |
| analyst            | Yes                | Yes               | Yes                 |
| project_manager    | Yes                | Yes               | Yes                 |
| viewer             | Yes                | Yes               | Yes                 |
| guest              | Yes                | No (403)          | Yes                 |

Only active memberships in active organizations are usable. Invited/suspended memberships and suspended organizations are excluded.

`system_admin` is modeled independently and currently reported by `/me`; R-1 does not use it to bypass tenant membership. Any later bypass must be an explicit, tested policy decision.

## Information-disclosure rules

- 401: authentication is missing, malformed, expired, or unverifiable.
- 403: the organization relationship is known but the role cannot perform that action, or the local user is disabled.
- 404: the organization does not exist, is suspended, or the current user lacks an active membership. These cases are intentionally indistinguishable.

Controllers never load an organization globally and then check membership. They query through the current user's active memberships and active organizations in one scope, set request-local `Current.organization`/`Current.membership`, and then apply the role rule. This prevents accidental cross-organization reads and avoids leaking tenant existence.

## Next authorization work

Before write APIs are introduced, add action-specific policy objects, audit events for role/membership changes, invitation lifecycle rules, and explicit system-admin operations. Project and analysis resources must carry `organization_id` and be loaded through the same tenant scope.
