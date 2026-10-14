import type {
	CanonicalOrganization,
	CanonicalOrganizationMembership,
	OrganizationBoundaryClient
} from '$lib/panoptes/api/canonical-bff-client';
import { PanoptesApiError } from '$lib/panoptes/utils/errors';

export type ActiveOrganizationBoundary = {
	organization: CanonicalOrganization;
	membership: CanonicalOrganizationMembership;
};

export async function loadOrganizationBoundary(
	input: { organizationId: string | null; signal?: AbortSignal },
	client: OrganizationBoundaryClient
): Promise<ActiveOrganizationBoundary> {
	const organizationId = input.organizationId?.trim();
	if (!organizationId) {
		throw new PanoptesApiError('An active organization is required.', {
			code: 'missing_organization',
			status: 422
		});
	}

	const [organization, membership] = await Promise.all([
		client.getOrganization({ organizationId, signal: input.signal }),
		client.getCurrentMembership({ organizationId, signal: input.signal })
	]);

	if (organization.id !== organizationId || membership.organization_id !== organizationId) {
		throw new PanoptesApiError('The requested resource was not found.', {
			code: 'organization_scope_mismatch',
			status: 404
		});
	}
	if (organization.status !== 'active' || membership.status !== 'active') {
		throw new PanoptesApiError('The organization membership is not active.', {
			code: 'inactive_organization_membership',
			status: 403
		});
	}

	return { organization, membership };
}
