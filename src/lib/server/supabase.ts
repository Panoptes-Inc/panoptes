import { dev } from '$app/environment';
import { createServerClient } from '@supabase/ssr';
import type { RequestEvent } from '@sveltejs/kit';
import {
	hasSupabaseConfig,
	supabaseAnonKey,
	supabaseCookieOptions,
	supabaseUrl
} from '$lib/supabase/config';
import { createSupabaseCookieAdapter } from './supabase-cookies';

type CookieEvent = Pick<RequestEvent, 'cookies' | 'setHeaders'>;

export function createSupabaseServerClient(event: CookieEvent) {
	if (!hasSupabaseConfig) return null;

	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookieOptions: supabaseCookieOptions(!dev),
		cookies: createSupabaseCookieAdapter(event, !dev)
	});
}
