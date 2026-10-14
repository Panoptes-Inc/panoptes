import type { RequestEvent } from '@sveltejs/kit';
import { activeOrganizationCookieName } from '../../auth/constants';
import type { AuthProviderAdapter } from './provider';
import {
	anonymousAuthContext,
	isOrganizationRole,
	type OrganizationMembership,
	type RequestAuthContext
} from './types';

type PanoptesAppMetadata = {
	system_admin?: unknown;
	developer?: unknown;
	organization_memberships?: unknown;
};

function bearerToken(event: RequestEvent): string | null {
	const authorization = event.request.headers.get('authorization');
	if (authorization?.startsWith('Bearer ')) return authorization.slice(7).trim() || null;
	return null;
}

function membershipsFromMetadata(value: unknown): OrganizationMembership[] {
	if (!Array.isArray(value)) return [];

	return value.flatMap((membership) => {
		if (!membership || typeof membership !== 'object') return [];
		const organizationId = Reflect.get(membership, 'organization_id');
		const role = Reflect.get(membership, 'role');
		if (typeof organizationId !== 'string' || !isOrganizationRole(role)) return [];
		return [{ organizationId, role }];
	});
}

export class SupabaseAuthAdapter implements AuthProviderAdapter {
	async resolve(event: RequestEvent): Promise<RequestAuthContext> {
		const token = bearerToken(event);
		if (!event.locals.supabase) return anonymousAuthContext();

		const { data, error } = token
			? await event.locals.supabase.auth.getUser(token)
			: await event.locals.supabase.auth.getUser();
		if (error || !data.user) return anonymousAuthContext();

		const metadata = data.user.app_metadata as PanoptesAppMetadata;
		const memberships = membershipsFromMetadata(metadata.organization_memberships);
		const requestedOrganizationId = event.cookies.get(activeOrganizationCookieName) ?? null;
		const activeOrganizationId = memberships.some(
			(membership) => membership.organizationId === requestedOrganizationId
		)
			? requestedOrganizationId
			: memberships.length === 1
				? memberships[0].organizationId
				: null;

		return {
			user: {
				id: data.user.id,
				email: data.user.email
			},
			memberships,
			activeOrganizationId,
			isSystemAdmin: metadata.system_admin === true,
			isDeveloper: metadata.developer === true,
			provider: 'supabase'
		};
	}
}
