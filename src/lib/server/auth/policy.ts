import { hasActiveOrganizationMembership, type RequestAuthContext } from './types';
export { safeReturnTo } from '../../auth/redirect';

export type RouteAccessPolicy = {
	authentication: 'public' | 'required';
	organization: 'none' | 'active-membership';
	requiredSystemRole?: 'system-admin' | 'system-admin-or-developer';
	developmentOnly?: boolean;
};

export type AccessDecision =
	| { outcome: 'allow' }
	| { outcome: 'redirect'; location: '/login' | '/organization/select' }
	| { outcome: 'deny'; status: 403 }
	| { outcome: 'not-found'; status: 404 };

const publicRouteIds = new Set(['/', '/lp', '/plan', '/login', '/auth/callback']);

export function routeAccessPolicy(routeId: string | null, pathname: string): RouteAccessPolicy {
	if (pathname === '/api/panoptes/v1' || pathname.startsWith('/api/panoptes/v1/')) {
		return { authentication: 'required', organization: 'none' };
	}

	if (pathname === '/app/dev/ui' || pathname.startsWith('/app/dev/ui/')) {
		return {
			authentication: 'required',
			organization: 'none',
			requiredSystemRole: 'system-admin-or-developer',
			developmentOnly: true
		};
	}

	if (pathname === '/dev/analysis-preview' || pathname.startsWith('/dev/analysis-preview/')) {
		return {
			authentication: 'required',
			organization: 'none',
			requiredSystemRole: 'system-admin-or-developer',
			developmentOnly: true
		};
	}

	if (pathname === '/admin' || pathname.startsWith('/admin/')) {
		return {
			authentication: 'required',
			organization: 'none',
			requiredSystemRole: 'system-admin'
		};
	}

	if (routeId === '/organization/select') {
		return { authentication: 'required', organization: 'none' };
	}

	if (routeId === '/auth/logout') {
		return { authentication: 'required', organization: 'none' };
	}

	if (routeId !== null && publicRouteIds.has(routeId)) {
		return { authentication: 'public', organization: 'none' };
	}

	return { authentication: 'required', organization: 'active-membership' };
}

export function evaluateRouteAccess(input: {
	context: RequestAuthContext;
	policy: RouteAccessPolicy;
	isDevelopment: boolean;
}): AccessDecision {
	const { context, policy, isDevelopment } = input;

	if (policy.developmentOnly && !isDevelopment) return { outcome: 'not-found', status: 404 };
	if (policy.authentication === 'public') return { outcome: 'allow' };
	if (!context.user) return { outcome: 'redirect', location: '/login' };

	if (policy.requiredSystemRole === 'system-admin' && !context.isSystemAdmin) {
		return { outcome: 'deny', status: 403 };
	}

	if (
		policy.requiredSystemRole === 'system-admin-or-developer' &&
		!context.isSystemAdmin &&
		!context.isDeveloper
	) {
		return { outcome: 'deny', status: 403 };
	}

	if (policy.organization === 'active-membership') {
		if (context.memberships.length === 0) {
			return { outcome: 'redirect', location: '/organization/select' };
		}
		if (!context.activeOrganizationId) {
			return { outcome: 'redirect', location: '/organization/select' };
		}
		if (!hasActiveOrganizationMembership(context)) return { outcome: 'deny', status: 403 };
	}

	return { outcome: 'allow' };
}
