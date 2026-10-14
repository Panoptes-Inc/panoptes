import { redirect, type RequestHandler } from '@sveltejs/kit';
import { safeReturnTo } from '$lib/auth/redirect';
import { exchangeSupabaseAuthCode } from '$lib/server/auth/session';

export const GET: RequestHandler = async ({ locals, url }) => {
	const code = url.searchParams.get('code');
	const next = safeReturnTo(url.searchParams.get('next'));

	if (!(await exchangeSupabaseAuthCode(locals.supabase, code))) {
		redirect(303, '/login?error=callback_failed');
	}

	redirect(303, next);
};
