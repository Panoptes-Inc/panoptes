# Supabase JWT authentication

## Trust boundary

Rails independently verifies the Supabase access token. A successful SvelteKit session check is not treated as proof by Rails, and the Rails API never accepts identity, email, role, or organization IDs asserted by the browser or BFF.

The BFF obtains the access token from the server-side Supabase cookie session only after `hooks.server.ts` has called Supabase `getUser`. Before forwarding, it requires the session user UUID to equal the verified request user UUID. The token is sent only in an `Authorization: Bearer` header to the fixed server-only `PANOPTES_RAILS_API_URL`.

## Verification rules

`Auth::SupabaseJwtVerifier` enforces all of the following:

- token size limit and three-part JWT parsing;
- algorithm allowlist (`ES256` and/or `RS256`; never `none` or HMAC);
- safe, bounded `kid`;
- signature verification using the configured HTTPS JWKS document;
- exact issuer and configured audience;
- required `sub`, `exp`, `iss`, and `aud` claims;
- `exp` and `nbf` time checks;
- UUID-form Supabase `sub`.

The unverified header is used only to choose an allowed algorithm and `kid`; no unverified claim authorizes a request.

## JWKS lifecycle

Keys are cached in process for `SUPABASE_JWKS_CACHE_TTL_SECONDS`. An unknown `kid` forces one refresh, enabling normal key rotation. A previously valid set may be used only within `SUPABASE_JWKS_STALE_TTL_SECONDS` when the JWKS endpoint is temporarily unavailable. The fixed URL must be HTTPS, contain no credentials, return at most 64 KiB and 20 keys, and answer within short connection/read timeouts.

Malformed or unverifiable tokens return 401. Expired tokens return 401 with `TOKEN_EXPIRED`. When no usable keyset exists because JWKS is unavailable, Rails returns retryable 503 rather than accepting the token.

## User mapping

`users.supabase_user_id` is the unique identity key. Email is optional profile data and is never used to find or merge users. A valid first request provisions the local user; later requests refresh safe profile data and `last_authenticated_at`. Suspended or deleted local users receive 403.

Secrets and bearer values are included in Rails parameter filtering. Application errors do not echo tokens, upstream URLs, exception messages, or backtraces.
