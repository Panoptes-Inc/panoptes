import type { OrganizationBoundaryClient } from './canonical-bff-client';

export function createMockOrganizationBoundaryClient(): OrganizationBoundaryClient {
	return {
		async getOrganization({ organizationId }) {
			return {
				id: organizationId,
				name: 'Panoptes Development',
				slug: 'panoptes-development',
				status: 'active',
				membership: { id: 'mock-membership', role: 'organization_admin', status: 'active' }
			};
		},
		async getCurrentMembership({ organizationId }) {
			return {
				id: 'mock-membership',
				organization_id: organizationId,
				user_id: 'mock-user',
				role: 'organization_admin',
				status: 'active'
			};
		}
	};
}
