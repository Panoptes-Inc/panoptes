import { describe, expect, it, vi } from 'vitest';
import {
	createCanonicalBffClient,
	type OrganizationBoundaryClient
} from '../../src/lib/panoptes/api/canonical-bff-client';
import { createMockOrganizationBoundaryClient } from '../../src/lib/panoptes/api/mock-organization-boundary-client';
import { loadOrganizationBoundary } from '../../src/lib/features/organization/organization-boundary';
import { PanoptesApiError } from '../../src/lib/panoptes/utils/errors';
import { unavailableCanonicalBusinessClient } from '../../src/lib/panoptes/api/unavailable-canonical-business-client';

const organization = {
	id: 'org/a',
	name: 'Example',
	slug: 'example',
	status: 'active',
	membership: { id: 'membership-1', role: 'viewer', status: 'active' }
};
const membership = {
	id: 'membership-1',
	organization_id: 'org/a',
	user_id: 'user-1',
	role: 'viewer',
	status: 'active'
};

function response(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

describe('canonical organization-scoped BFF client', () => {
	it('uses the canonical BFF base and encodes the explicit organization parameter', async () => {
		const fetcher = vi.fn().mockResolvedValue(response({ data: organization, meta: {} }));
		const client = createCanonicalBffClient({ fetcher });

		await client.getOrganization({ organizationId: 'org/a' });

		expect(fetcher.mock.calls[0]![0]).toBe('/api/panoptes/v1/organizations/org%2Fa');
		expect(fetcher.mock.calls[0]![1]).toMatchObject({ method: 'GET' });
	});

	it('parses organization and membership canonical envelopes', async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(response({ data: organization, meta: {} }))
			.mockResolvedValueOnce(response({ data: membership, meta: {} }));
		const client = createCanonicalBffClient({ fetcher });

		await expect(client.getOrganization({ organizationId: 'org/a' })).resolves.toEqual(
			organization
		);
		await expect(client.getCurrentMembership({ organizationId: 'org/a' })).resolves.toEqual(
			membership
		);
	});

	it('covers all five implemented canonical read routes', async () => {
		const user = {
			id: 'user-1',
			supabase_user_id: 'subject-1',
			email: null,
			status: 'active',
			system_admin: false
		};
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(
				response({ data: { status: 'ok', service: 'panoptes-rails-api' }, meta: {} })
			)
			.mockResolvedValueOnce(response({ data: user, meta: {} }))
			.mockResolvedValueOnce(response({ data: [organization], meta: {} }));
		const client = createCanonicalBffClient({ fetcher });

		await expect(client.getHealth()).resolves.toMatchObject({ status: 'ok' });
		await expect(client.getCurrentUser()).resolves.toEqual(user);
		await expect(client.listOrganizations()).resolves.toEqual([organization]);
		expect(fetcher.mock.calls.map((call) => call[0])).toEqual([
			'/api/panoptes/v1/health',
			'/api/panoptes/v1/me',
			'/api/panoptes/v1/organizations'
		]);
	});

	it('rejects malformed envelopes and response models', async () => {
		const missingEnvelope = createCanonicalBffClient({
			fetcher: vi.fn().mockResolvedValue(response({ organization }))
		});
		const malformedModel = createCanonicalBffClient({
			fetcher: vi.fn().mockResolvedValue(response({ data: { id: 'org/a' } }))
		});

		await expect(
			missingEnvelope.getOrganization({ organizationId: 'org/a' })
		).rejects.toMatchObject({ code: 'invalid_response' });
		await expect(malformedModel.getOrganization({ organizationId: 'org/a' })).rejects.toMatchObject(
			{ code: 'invalid_response' }
		);
	});

	it.each([
		[401, 'UNAUTHENTICATED', false],
		[403, 'FORBIDDEN', false],
		[404, 'NOT_FOUND', false],
		[409, 'CONFLICT', false],
		[422, 'VALIDATION_FAILED', false],
		[429, 'RATE_LIMITED', true],
		[503, 'UPSTREAM_UNAVAILABLE', true]
	])('maps HTTP %s separately from job state', async (status, code, retryable) => {
		const client = createCanonicalBffClient({
			fetcher: vi.fn().mockResolvedValue(response({ error: {} }, status))
		});

		await expect(client.getOrganization({ organizationId: 'org/a' })).rejects.toMatchObject({
			status,
			code,
			retryable
		});
	});

	it('preserves a safe canonical error code and retryability', async () => {
		const client = createCanonicalBffClient({
			fetcher: vi.fn().mockResolvedValue(
				response(
					{
						error: { code: 'USAGE_LIMIT_REACHED', message: 'provider secret', retryable: false }
					},
					429
				)
			)
		});

		await expect(client.getOrganization({ organizationId: 'org/a' })).rejects.toMatchObject({
			code: 'USAGE_LIMIT_REACHED',
			retryable: false,
			message: 'The request limit has been reached.'
		});
	});

	it('distinguishes a network error from request timeout', async () => {
		const networkClient = createCanonicalBffClient({
			fetcher: vi.fn().mockRejectedValue(new TypeError('offline'))
		});
		const timeoutClient = createCanonicalBffClient({
			timeoutMs: 5,
			fetcher: vi.fn(
				(_url, init) =>
					new Promise<Response>((_resolve, reject) =>
						init?.signal?.addEventListener('abort', () =>
							reject(new DOMException('Aborted', 'AbortError'))
						)
					)
			)
		});

		await expect(networkClient.getOrganization({ organizationId: 'org/a' })).rejects.toMatchObject({
			code: 'network_error'
		});
		await expect(timeoutClient.getOrganization({ organizationId: 'org/a' })).rejects.toMatchObject({
			code: 'request_timeout'
		});
	});

	it('forwards AbortSignal and classifies caller cancellation', async () => {
		const controller = new AbortController();
		const fetcher = vi.fn(
			(_url, init) =>
				new Promise<Response>((_resolve, reject) =>
					init?.signal?.addEventListener('abort', () =>
						reject(new DOMException('Aborted', 'AbortError'))
					)
				)
		);
		const request = createCanonicalBffClient({ fetcher }).getOrganization({
			organizationId: 'org/a',
			signal: controller.signal
		});

		controller.abort();
		await expect(request).rejects.toMatchObject({ code: 'request_aborted', retryable: false });
	});
});

describe('organization feature command', () => {
	function client(overrides: Partial<OrganizationBoundaryClient> = {}): OrganizationBoundaryClient {
		return {
			getOrganization: vi.fn(async () => organization),
			getCurrentMembership: vi.fn(async () => membership),
			...overrides
		};
	}

	it('requires organizationId instead of inferring it from response or global state', async () => {
		const boundaryClient = client();
		await expect(
			loadOrganizationBoundary({ organizationId: null }, boundaryClient)
		).rejects.toMatchObject({ code: 'missing_organization', status: 422 });
		expect(boundaryClient.getOrganization).not.toHaveBeenCalled();
	});

	it('passes the same explicit scope to both reads', async () => {
		const boundaryClient = client();
		await loadOrganizationBoundary({ organizationId: 'org/a' }, boundaryClient);

		expect(boundaryClient.getOrganization).toHaveBeenCalledWith({
			organizationId: 'org/a',
			signal: undefined
		});
		expect(boundaryClient.getCurrentMembership).toHaveBeenCalledWith({
			organizationId: 'org/a',
			signal: undefined
		});
	});

	it('maps a cross-organization response to 404 without adopting its scope', async () => {
		const boundaryClient = client({
			getOrganization: vi.fn(async () => ({ ...organization, id: 'org-b' }))
		});
		await expect(
			loadOrganizationBoundary({ organizationId: 'org/a' }, boundaryClient)
		).rejects.toMatchObject({ code: 'organization_scope_mismatch', status: 404 });
	});

	it('supports organization switching by aborting the stale request', async () => {
		const stale = new AbortController();
		const boundaryClient = client({
			getOrganization: vi.fn<OrganizationBoundaryClient['getOrganization']>(
				({ organizationId, signal }) => {
					if (organizationId === 'org-old') {
						return new Promise<never>((_resolve, reject) =>
							signal?.addEventListener('abort', () =>
								reject(new PanoptesApiError('aborted', { code: 'request_aborted' }))
							)
						);
					}
					return Promise.resolve({ ...organization, id: organizationId });
				}
			),
			getCurrentMembership: vi.fn(async ({ organizationId }) => ({
				...membership,
				organization_id: organizationId
			}))
		});
		const oldRequest = loadOrganizationBoundary(
			{ organizationId: 'org-old', signal: stale.signal },
			boundaryClient
		);
		stale.abort();

		await expect(oldRequest).rejects.toMatchObject({ code: 'request_aborted' });
		await expect(
			loadOrganizationBoundary({ organizationId: 'org-new' }, boundaryClient)
		).resolves.toMatchObject({ organization: { id: 'org-new' } });
	});

	it('keeps mock behavior behind the same explicit client interface', async () => {
		const result = await loadOrganizationBoundary(
			{ organizationId: 'org-mock' },
			createMockOrganizationBoundaryClient()
		);

		expect(result.organization.id).toBe('org-mock');
		expect(result.membership.organization_id).toBe('org-mock');
	});
});

describe('canonical and mock separation', () => {
	it('does not fall back to mock operations when canonical Rails business endpoints are absent', async () => {
		await expect(unavailableCanonicalBusinessClient.listProjects()).rejects.toMatchObject({
			code: 'business_api_unavailable',
			status: 503,
			retryable: true
		});
	});
});
