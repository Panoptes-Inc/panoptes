import { dev } from '$app/environment';
import { redirect, type RequestHandler } from '@sveltejs/kit';
import { clearLocalAuthCookies } from '$lib/server/supabase-cookies';
import { terminateLocalSupabaseSession } from '$lib/server/auth/session';

export const POST: RequestHandler = async (event) => {
	await terminateLocalSupabaseSession(event.locals.supabase);
	clearLocalAuthCookies(event, !dev);
	redirect(303, '/login?message=signed_out');
};
