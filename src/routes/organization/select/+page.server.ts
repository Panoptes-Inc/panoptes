import { dev } from '$app/environment';
import { error, redirect } from '@sveltejs/kit';
import { safeReturnTo } from '$lib/server/auth';
import { activeOrganizationCookieName } from '$lib/auth/constants';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => ({
	memberships: locals.auth.memberships,
	activeOrganizationId: locals.auth.activeOrganizationId,
	returnTo: safeReturnTo(url.searchParams.get('returnTo'))
});

export const actions: Actions = {
	default: async ({ cookies, locals, request, url }) => {
		const formData = await request.formData();
		const organizationId = formData.get('organizationId');

		if (
			typeof organizationId !== 'string' ||
			!locals.auth.memberships.some((membership) => membership.organizationId === organizationId)
		) {
			error(403, 'Organization membership is required');
		}

		cookies.set(activeOrganizationCookieName, organizationId, {
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			path: '/'
		});

		redirect(303, safeReturnTo(url.searchParams.get('returnTo')));
	}
};
