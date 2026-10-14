import type { RequestAuthContext } from '$lib/server/auth/types';
import type { SupabaseClient } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Locals {
			auth: RequestAuthContext;
			supabase: SupabaseClient | null;
		}
	}
}

export {};
