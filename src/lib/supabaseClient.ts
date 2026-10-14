import { dev } from '$app/environment';
import { createBrowserClient } from '@supabase/ssr';
import {
	hasSupabaseConfig,
	supabaseAnonKey,
	supabaseCookieOptions,
	supabaseUrl
} from '$lib/supabase/config';

export { hasSupabaseConfig } from '$lib/supabase/config';

const fallbackUrl = 'https://example.supabase.co';
const fallbackAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder.placeholder';

export const supabase = createBrowserClient(
	hasSupabaseConfig ? supabaseUrl : fallbackUrl,
	hasSupabaseConfig ? supabaseAnonKey : fallbackAnonKey,
	{
		cookieOptions: supabaseCookieOptions(!dev)
	}
);
