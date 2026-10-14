export const organizationRoles = [
	'organization_owner',
	'organization_admin',
	'analyst',
	'project_manager',
	'viewer',
	'guest'
] as const;

export type OrganizationRole = (typeof organizationRoles)[number];

export type AuthenticatedUser = {
	id: string;
	email?: string;
};

export type OrganizationMembership = {
	organizationId: string;
	role: OrganizationRole;
};

export type RequestAuthContext = {
	user: AuthenticatedUser | null;
	memberships: OrganizationMembership[];
	activeOrganizationId: string | null;
	isSystemAdmin: boolean;
	isDeveloper: boolean;
	provider: 'anonymous' | 'mock' | 'supabase';
};

export const anonymousAuthContext = (): RequestAuthContext => ({
	user: null,
	memberships: [],
	activeOrganizationId: null,
	isSystemAdmin: false,
	isDeveloper: false,
	provider: 'anonymous'
});

export function isOrganizationRole(value: unknown): value is OrganizationRole {
	return typeof value === 'string' && organizationRoles.includes(value as OrganizationRole);
}

export function hasActiveOrganizationMembership(context: RequestAuthContext): boolean {
	return (
		context.activeOrganizationId !== null &&
		context.memberships.some(
			(membership) => membership.organizationId === context.activeOrganizationId
		)
	);
}
