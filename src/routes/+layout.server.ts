import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => ({
	authenticated: locals.auth.user !== null,
	userEmail: locals.auth.user?.email ?? null,
	activeOrganizationId: locals.auth.activeOrganizationId
});
