import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { error, json, redirect, type Handle } from '@sveltejs/kit';
import {
	evaluateRouteAccess,
	isMockAuthScenario,
	MockAuthAdapter,
	routeAccessPolicy,
	shouldUseMockAuth,
	SupabaseAuthAdapter
} from '$lib/server/auth';
import { createSupabaseServerClient } from '$lib/server/supabase';

const supabaseAuth = new SupabaseAuthAdapter();

async function resolveRequestAuth(event: Parameters<Handle>[0]['event']) {
	const mockEnabled = env.PANOPTES_ENABLE_MOCK_AUTH === 'true';
	const scenario = env.PANOPTES_MOCK_AUTH_SCENARIO ?? '';

	if (
		shouldUseMockAuth({ isDevelopment: dev, enabled: mockEnabled }) &&
		isMockAuthScenario(scenario)
	) {
		return new MockAuthAdapter(scenario).resolve(event);
	}

	return supabaseAuth.resolve(event);
}

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient(event);
	event.locals.auth = await resolveRequestAuth(event);

	const policy = routeAccessPolicy(event.route.id, event.url.pathname);
	const decision = evaluateRouteAccess({
		context: event.locals.auth,
		policy,
		isDevelopment: dev
	});
	const isApiRequest = event.url.pathname === '/api' || event.url.pathname.startsWith('/api/');

	if (decision.outcome === 'not-found') error(404, 'Not found');
	if (decision.outcome === 'deny') {
		if (isApiRequest) return json({ error: 'forbidden' }, { status: 403 });
		error(403, 'You do not have permission to access this resource');
	}
	if (decision.outcome === 'redirect') {
		if (isApiRequest) {
			const status = decision.location === '/login' ? 401 : 403;
			return json(
				{ error: status === 401 ? 'unauthorized' : 'organization_membership_required' },
				{ status }
			);
		}

		const returnTo = encodeURIComponent(`${event.url.pathname}${event.url.search}`);
		redirect(303, `${decision.location}?returnTo=${returnTo}`);
	}

	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});

	if (policy.authentication === 'required' || event.locals.auth.user) {
		response.headers.set('cache-control', 'private, no-store');
		response.headers.set('pragma', 'no-cache');
	}

	return response;
};
