import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { createCanonicalBffClient } from './canonical-bff-client';
import { createMockOrganizationBoundaryClient } from './mock-organization-boundary-client';

export const organizationBoundaryClient =
	dev && env.PUBLIC_USE_MOCK_API === 'true'
		? createMockOrganizationBoundaryClient()
		: createCanonicalBffClient();
