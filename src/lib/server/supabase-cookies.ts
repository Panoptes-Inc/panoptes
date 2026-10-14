import type { CookieOptions } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import { activeOrganizationCookieName, supabaseAuthCookieName } from '../auth/constants';

type CookieEvent = Pick<RequestEvent, 'cookies' | 'setHeaders'>;

export function createSupabaseCookieAdapter(event: CookieEvent, secure: boolean) {
	return {
		getAll: () => event.cookies.getAll(),
		setAll: (
			cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>,
			headers: Record<string, string>
		) => {
			for (const { name, value, options } of cookiesToSet) {
				event.cookies.set(name, value, { ...options, path: '/', secure });
			}
			if (Object.keys(headers).length > 0) event.setHeaders(headers);
		}
	};
}

export function clearLocalAuthCookies(event: Pick<RequestEvent, 'cookies'>, secure: boolean): void {
	for (const cookie of event.cookies.getAll()) {
		if (
			cookie.name === supabaseAuthCookieName ||
			cookie.name.startsWith(`${supabaseAuthCookieName}.`)
		) {
			event.cookies.delete(cookie.name, { path: '/', secure, sameSite: 'lax' });
		}
	}

	event.cookies.delete(activeOrganizationCookieName, {
		path: '/',
		secure,
		sameSite: 'lax'
	});
}
