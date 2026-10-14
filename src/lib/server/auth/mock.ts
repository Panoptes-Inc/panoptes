import type { RequestEvent } from '@sveltejs/kit';
import type { AuthProviderAdapter } from './provider';
import { anonymousAuthContext, type RequestAuthContext } from './types';

export type MockAuthScenario =
	'anonymous' | 'member' | 'unaffiliated' | 'system-admin' | 'developer';

const mockOrganizationId = 'org-panoptes-development';

export function isMockAuthScenario(value: string): value is MockAuthScenario {
	return ['anonymous', 'member', 'unaffiliated', 'system-admin', 'developer'].includes(value);
}

export function createMockAuthContext(scenario: MockAuthScenario): RequestAuthContext {
	if (scenario === 'anonymous') return anonymousAuthContext();

	const isMember = scenario === 'member';

	return {
		user: {
			id: `mock-${scenario}`,
			email: `${scenario}@panoptes.local`
		},
		memberships: isMember
			? [{ organizationId: mockOrganizationId, role: 'organization_admin' }]
			: [],
		activeOrganizationId: isMember ? mockOrganizationId : null,
		isSystemAdmin: scenario === 'system-admin',
		isDeveloper: scenario === 'developer',
		provider: 'mock'
	};
}

export function shouldUseMockAuth(input: { isDevelopment: boolean; enabled: boolean }): boolean {
	return input.isDevelopment && input.enabled;
}

export class MockAuthAdapter implements AuthProviderAdapter {
	constructor(private readonly scenario: MockAuthScenario) {}

	async resolve(_event: RequestEvent): Promise<RequestAuthContext> {
		return createMockAuthContext(this.scenario);
	}
}
