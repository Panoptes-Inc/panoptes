import { browser } from '$app/environment';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const hasSupabaseConfig = Boolean(PUBLIC_SUPABASE_URL && PUBLIC_SUPABASE_ANON_KEY);

const fallbackUrl = 'https://example.supabase.co';
const fallbackAnonKey = 'public-anon-key-not-configured';

export const supabase = createClient(
	hasSupabaseConfig ? PUBLIC_SUPABASE_URL : fallbackUrl,
	hasSupabaseConfig ? PUBLIC_SUPABASE_ANON_KEY : fallbackAnonKey,
	{
		auth: {
			persistSession: browser,
			autoRefreshToken: browser,
			detectSessionInUrl: browser
		}
	}
);
