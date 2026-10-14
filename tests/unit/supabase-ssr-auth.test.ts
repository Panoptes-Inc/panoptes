import type { RequestEvent } from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vitest';
import { evaluateRouteAccess, routeAccessPolicy } from '../../src/lib/server/auth/policy';
import { SupabaseAuthAdapter } from '../../src/lib/server/auth/supabase';
import {
	exchangeSupabaseAuthCode,
	terminateLocalSupabaseSession
} from '../../src/lib/server/auth/session';
import {
	clearLocalAuthCookies,
	createSupabaseCookieAdapter
} from '../../src/lib/server/supabase-cookies';

function authEvent(input: { result: unknown; activeOrganizationId?: string }): RequestEvent {
	return {
		request: new Request('https://panoptes.local/app'),
		cookies: {
			get: vi.fn((name: string) =>
				name === 'panoptes_organization_id' ? input.activeOrganizationId : undefined
			)
		},
		locals: {
			supabase: {
				auth: {
					getUser: vi.fn().mockResolvedValue(input.result)
				}
			}
		}
	} as unknown as RequestEvent;
}

describe('Supabase SSR authentication boundary', () => {
	it('exchanges a valid PKCE callback code and safely rejects callback failures', async () => {
		const successClient = {
			auth: { exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }) }
		};
		const failedClient = {
			auth: { exchangeCodeForSession: vi.fn().mockResolvedValue({ error: new Error('invalid') }) }
		};

		await expect(exchangeSupabaseAuthCode(successClient, 'valid-code')).resolves.toBe(true);
		await expect(exchangeSupabaseAuthCode(failedClient, 'invalid-code')).resolves.toBe(false);
		await expect(exchangeSupabaseAuthCode(null, 'code')).resolves.toBe(false);
	});

	it('maps a verified cookie session to the Panoptes auth context', async () => {
		const event = authEvent({
			activeOrganizationId: 'org-a',
			result: {
				data: {
					user: {
						id: 'user-a',
						email: 'user@example.com',
						app_metadata: {
							organization_memberships: [{ organization_id: 'org-a', role: 'analyst' }]
						}
					}
				},
				error: null
			}
		});

		const context = await new SupabaseAuthAdapter().resolve(event);
		expect(context).toMatchObject({
			user: { id: 'user-a', email: 'user@example.com' },
			activeOrganizationId: 'org-a',
			provider: 'supabase'
		});
		expect(
			evaluateRouteAccess({
				context,
				policy: routeAccessPolicy('/app', '/app'),
				isDevelopment: false
			})
		).toEqual({ outcome: 'allow' });
	});

	it('treats an expired, malformed, or refresh-failed session as anonymous', async () => {
		const event = authEvent({
			result: { data: { user: null }, error: { message: 'invalid session' } }
		});

		await expect(new SupabaseAuthAdapter().resolve(event)).resolves.toMatchObject({
			user: null,
			provider: 'anonymous'
		});
	});

	it('writes refreshed SDK cookies and private no-store response headers', () => {
		const set = vi.fn();
		const setHeaders = vi.fn();
		const adapter = createSupabaseCookieAdapter(
			{
				cookies: { getAll: () => [], set } as never,
				setHeaders
			},
			true
		);

		adapter.setAll(
			[
				{
					name: 'panoptes-auth.0',
					value: 'refreshed-cookie-value',
					options: { sameSite: 'lax', maxAge: 3600 }
				}
			],
			{ 'cache-control': 'private, no-store' }
		);

		expect(set).toHaveBeenCalledWith(
			'panoptes-auth.0',
			'refreshed-cookie-value',
			expect.objectContaining({ path: '/', sameSite: 'lax', secure: true })
		);
		expect(setHeaders).toHaveBeenCalledWith({ 'cache-control': 'private, no-store' });
	});

	it('clears every auth chunk and the active organization on local logout', () => {
		const remove = vi.fn();
		const event = {
			cookies: {
				getAll: () => [
					{ name: 'panoptes-auth.0', value: 'a' },
					{ name: 'panoptes-auth.1', value: 'b' },
					{ name: 'unrelated', value: 'keep' }
				],
				delete: remove
			}
		} as unknown as Pick<RequestEvent, 'cookies'>;

		clearLocalAuthCookies(event, true);

		expect(remove).toHaveBeenCalledTimes(3);
		expect(remove).toHaveBeenCalledWith(
			'panoptes_organization_id',
			expect.objectContaining({ path: '/', secure: true })
		);
		expect(remove).not.toHaveBeenCalledWith('unrelated', expect.anything());
	});

	it('contains provider logout failures so local cookie cleanup can continue', async () => {
		const client = {
			auth: { signOut: vi.fn().mockRejectedValue(new Error('provider unavailable')) }
		};

		await expect(terminateLocalSupabaseSession(client)).resolves.toBeUndefined();
		expect(client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
	});
});
