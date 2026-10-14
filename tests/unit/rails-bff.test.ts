import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { env } from '$env/dynamic/private';
import { proxyActiveOrganizationRailsGet, proxyRailsGet } from '../../src/lib/server/rails/client';
import type { RequestAuthContext } from '../../src/lib/server/auth/types';

const auth: RequestAuthContext = {
	user: { id: '11111111-1111-4111-8111-111111111111' },
	memberships: [],
	activeOrganizationId: null,
	isSystemAdmin: false,
	isDeveloper: false,
	provider: 'supabase'
};

function event(fetcher: typeof fetch, sessionUserId = auth.user!.id, authContext = auth) {
	return {
		request: new Request('http://localhost/api/panoptes/v1/me', {
			headers: { 'x-request-id': 'request-bff-123' }
		}),
		locals: {
			auth: authContext,
			supabase: {
				auth: {
					getSession: vi.fn().mockResolvedValue({
						data: {
							session: { access_token: 'supabase-access-token', user: { id: sessionUserId } }
						},
						error: null
					})
				}
			}
		},
		fetch: fetcher
	} as never;
}

describe('Rails BFF client', () => {
	beforeEach(() => {
		env.PANOPTES_RAILS_API_URL = 'http://rails.internal:3000';
		env.PANOPTES_RAILS_API_TIMEOUT_MS = '1000';
	});

	afterEach(() => {
		delete env.PANOPTES_RAILS_API_URL;
		delete env.PANOPTES_RAILS_API_TIMEOUT_MS;
	});

	it('forwards the verified session token and request context server-side', async () => {
		const fetcher = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ data: { id: 'user-1' }, meta: {} }), {
				status: 200,
				headers: { 'content-type': 'application/json' }
			})
		);

		const response = await proxyRailsGet(event(fetcher), '/api/v1/me');
		const [url, init] = fetcher.mock.calls[0]!;
		expect(String(url)).toBe('http://rails.internal:3000/api/v1/me');
		expect(init.headers.authorization).toBe('Bearer supabase-access-token');
		expect(init.headers['x-request-id']).toBe('request-bff-123');
		expect(response.status).toBe(200);
	});

	it.each([401, 403, 404])('preserves a Rails %s authorization response', async (status) => {
		const fetcher = vi
			.fn()
			.mockResolvedValue(new Response(JSON.stringify({ error: { code: 'BOUNDARY' } }), { status }));

		const response = await proxyRailsGet(event(fetcher), '/api/v1/me');
		expect(response.status).toBe(status);
		expect(await response.json()).toEqual({ error: { code: 'BOUNDARY' } });
	});

	it('rejects a cookie session that does not match the independently verified user', async () => {
		const fetcher = vi.fn();
		const response = await proxyRailsGet(
			event(fetcher, '22222222-2222-4222-8222-222222222222'),
			'/api/v1/me'
		);

		expect(response.status).toBe(401);
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('maps an unavailable Rails service to a retryable 503 without mock fallback', async () => {
		const response = await proxyRailsGet(
			event(vi.fn().mockRejectedValue(new TypeError('connection refused'))),
			'/api/v1/me'
		);
		const body = await response.json();

		expect(response.status).toBe(503);
		expect(body.error).toMatchObject({ code: 'UPSTREAM_UNAVAILABLE', retryable: true });
	});

	it('aborts a Rails request at the configured timeout', async () => {
		env.PANOPTES_RAILS_API_TIMEOUT_MS = '100';
		const fetcher = vi.fn((_url, init: RequestInit) => {
			return new Promise<Response>((_resolve, reject) => {
				init.signal?.addEventListener('abort', () =>
					reject(new DOMException('Aborted', 'AbortError'))
				);
			});
		});

		const response = await proxyRailsGet(event(fetcher as typeof fetch), '/api/v1/me');
		expect(response.status).toBe(503);
		expect((await response.json()).error.code).toBe('UPSTREAM_UNAVAILABLE');
	});

	it('forwards an explicitly requested active organization', async () => {
		const scopedAuth: RequestAuthContext = {
			...auth,
			memberships: [{ organizationId: 'org-1', role: 'viewer' }],
			activeOrganizationId: 'org-1'
		};
		const fetcher = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
		const response = await proxyActiveOrganizationRailsGet(
			event(fetcher, auth.user!.id, scopedAuth),
			'org-1',
			'/api/v1/organizations/org-1'
		);

		expect(response.status).toBe(200);
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it('hides a cross-organization request with 404 before Rails forwarding', async () => {
		const scopedAuth: RequestAuthContext = {
			...auth,
			memberships: [{ organizationId: 'org-1', role: 'viewer' }],
			activeOrganizationId: 'org-1'
		};
		const fetcher = vi.fn();
		const response = await proxyActiveOrganizationRailsGet(
			event(fetcher, auth.user!.id, scopedAuth),
			'org-2',
			'/api/v1/organizations/org-2'
		);

		expect(response.status).toBe(404);
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('requires a verified active organization membership', async () => {
		const fetcher = vi.fn();
		const response = await proxyActiveOrganizationRailsGet(
			event(fetcher),
			'org-1',
			'/api/v1/organizations/org-1'
		);

		expect(response.status).toBe(403);
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('checks the verified session before exposing organization boundary state', async () => {
		const scopedAuth: RequestAuthContext = {
			...auth,
			memberships: [{ organizationId: 'org-1', role: 'viewer' }],
			activeOrganizationId: 'org-1'
		};
		const fetcher = vi.fn();
		const response = await proxyActiveOrganizationRailsGet(
			event(fetcher, 'different-session-user', scopedAuth),
			'org-2',
			'/api/v1/organizations/org-2'
		);

		expect(response.status).toBe(401);
		expect(fetcher).not.toHaveBeenCalled();
	});
});
