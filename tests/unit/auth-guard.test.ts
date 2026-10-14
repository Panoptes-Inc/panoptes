import { describe, expect, it } from 'vitest';
import { createMockAuthContext, shouldUseMockAuth } from '../../src/lib/server/auth/mock';
import {
	evaluateRouteAccess,
	routeAccessPolicy,
	safeReturnTo
} from '../../src/lib/server/auth/policy';
import { anonymousAuthContext, type RequestAuthContext } from '../../src/lib/server/auth/types';

function decide(pathname: string, context: RequestAuthContext, isDevelopment = false) {
	return evaluateRouteAccess({
		context,
		policy: routeAccessPolicy(pathname, pathname),
		isDevelopment
	});
}

describe('server route authorization', () => {
	it('redirects an unauthenticated user away from app and admin routes', () => {
		expect(decide('/app', anonymousAuthContext())).toEqual({
			outcome: 'redirect',
			location: '/login'
		});
		expect(decide('/admin', anonymousAuthContext())).toEqual({
			outcome: 'redirect',
			location: '/login'
		});
	});

	it('allows an organization member into app routes', () => {
		expect(decide('/app', createMockAuthContext('member'))).toEqual({ outcome: 'allow' });
	});

	it('lets Rails remain the organization source of truth for BFF reads', () => {
		const unaffiliated = createMockAuthContext('unaffiliated');
		expect(decide('/api/panoptes/v1/organizations', unaffiliated)).toEqual({ outcome: 'allow' });
	});

	it('redirects a multi-organization member without an active organization to selection', () => {
		const member = createMockAuthContext('member');
		expect(decide('/app', { ...member, activeOrganizationId: null })).toEqual({
			outcome: 'redirect',
			location: '/organization/select'
		});
	});

	it('routes a user without organization membership to the dedicated state', () => {
		expect(decide('/app', createMockAuthContext('unaffiliated'))).toEqual({
			outcome: 'redirect',
			location: '/organization/select'
		});
	});

	it('rejects an active organization that is not in the verified memberships', () => {
		const member = createMockAuthContext('member');
		expect(decide('/app', { ...member, activeOrganizationId: 'org-other' })).toEqual({
			outcome: 'deny',
			status: 403
		});
	});

	it('allows only a system admin into the admin route', () => {
		expect(decide('/admin', createMockAuthContext('member'))).toEqual({
			outcome: 'deny',
			status: 403
		});
		expect(decide('/admin', createMockAuthContext('system-admin'))).toEqual({ outcome: 'allow' });
	});

	it('hides dev routes in production before applying role checks', () => {
		expect(decide('/app/dev/ui', createMockAuthContext('system-admin'))).toEqual({
			outcome: 'not-found',
			status: 404
		});
	});

	it('allows an explicit developer fixture on dev routes only in development', () => {
		expect(decide('/dev/analysis-preview', createMockAuthContext('developer'), true)).toEqual({
			outcome: 'allow'
		});
	});

	it('never enables mock authentication in production', () => {
		expect(shouldUseMockAuth({ isDevelopment: false, enabled: true })).toBe(false);
		expect(shouldUseMockAuth({ isDevelopment: true, enabled: false })).toBe(false);
		expect(shouldUseMockAuth({ isDevelopment: true, enabled: true })).toBe(true);
	});

	it('prevents an external return URL from becoming an open redirect', () => {
		expect(safeReturnTo('https://example.com')).toBe('/app');
		expect(safeReturnTo('//example.com')).toBe('/app');
		expect(safeReturnTo('/\\example.com')).toBe('/app');
		expect(safeReturnTo('/app/analysis')).toBe('/app/analysis');
	});
});
