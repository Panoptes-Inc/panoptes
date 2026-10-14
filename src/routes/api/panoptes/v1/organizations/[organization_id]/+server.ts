import { proxyActiveOrganizationRailsGet } from '$lib/server/rails/client';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) =>
	proxyActiveOrganizationRailsGet(
		event,
		event.params.organization_id,
		`/api/v1/organizations/${encodeURIComponent(event.params.organization_id)}`
	);
