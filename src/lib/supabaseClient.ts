import { browser } from '$app/environment';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

function isValidHttpUrl(value: string) {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

export const hasSupabaseConfig = Boolean(
	PUBLIC_SUPABASE_URL && PUBLIC_SUPABASE_ANON_KEY && isValidHttpUrl(PUBLIC_SUPABASE_URL)
);

const fallbackUrl = 'https://example.supabase.co';
const fallbackAnonKey = 'public-anon-key-not-configured';

const clientOptions = {
	auth: {
		persistSession: browser,
		autoRefreshToken: browser,
		detectSessionInUrl: browser
	}
};

function createSupabaseClientSafely() {
	const url = hasSupabaseConfig ? PUBLIC_SUPABASE_URL : fallbackUrl;
	const anonKey = hasSupabaseConfig ? PUBLIC_SUPABASE_ANON_KEY : fallbackAnonKey;

	try {
		return createClient(url, anonKey, clientOptions);
	} catch {
		return createClient(fallbackUrl, fallbackAnonKey, clientOptions);
	}
}

export const supabase = createSupabaseClientSafely();
