import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { CookieOptionsWithName } from '@supabase/ssr';
import { supabaseAuthCookieName } from '$lib/auth/constants';

export { supabaseAuthCookieName } from '$lib/auth/constants';

export const supabaseUrl = (PUBLIC_SUPABASE_URL ?? '').trim();
export const supabaseAnonKey = (PUBLIC_SUPABASE_ANON_KEY ?? '').trim();
export const hasSupabaseConfig =
	supabaseUrl.length > 0 && supabaseAnonKey.length > 0 && /^https?:\/\//.test(supabaseUrl);

export function supabaseCookieOptions(secure: boolean): CookieOptionsWithName {
	return {
		name: supabaseAuthCookieName,
		path: '/',
		sameSite: 'lax',
		httpOnly: false,
		secure
	};
}
