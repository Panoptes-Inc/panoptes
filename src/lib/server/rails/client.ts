import { env } from '$env/dynamic/private';
import { json, type RequestEvent } from '@sveltejs/kit';

const requestIdPattern = /^[A-Za-z0-9._:-]{8,128}$/;

function requestId(value: string | null): string {
	return value && requestIdPattern.test(value) ? value : crypto.randomUUID();
}

function errorResponse(
	status: number,
	code: string,
	message: string,
	requestIdValue: string,
	retryable = false
) {
	return json(
		{
			error: { code, message, details: {}, retryable },
			meta: { request_id: requestIdValue }
		},
		{ status, headers: { 'cache-control': 'private, no-store' } }
	);
}

function railsBaseUrl(): URL {
	const configured = env.PANOPTES_RAILS_API_URL;
	if (!configured) throw new Error('PANOPTES_RAILS_API_URL is not configured');

	const url = new URL(configured);
	if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
		throw new Error('PANOPTES_RAILS_API_URL is invalid');
	}
	return url;
}

export async function proxyRailsGet(
	event: Pick<RequestEvent, 'locals' | 'request' | 'fetch'>,
	path: string
): Promise<Response> {
	const outgoingRequestId = requestId(event.request.headers.get('x-request-id'));
	const correlationId = requestId(event.request.headers.get('x-correlation-id'));

	if (!event.locals.supabase || !event.locals.auth.user) {
		return errorResponse(401, 'UNAUTHENTICATED', 'Authentication is required.', outgoingRequestId);
	}

	const { data, error } = await event.locals.supabase.auth.getSession();
	const session = data.session;
	if (error || !session?.access_token || session.user.id !== event.locals.auth.user.id) {
		return errorResponse(401, 'UNAUTHENTICATED', 'Authentication is required.', outgoingRequestId);
	}

	let url: URL;
	try {
		url = new URL(path, railsBaseUrl());
	} catch {
		return errorResponse(
			503,
			'UPSTREAM_UNAVAILABLE',
			'The application service is unavailable.',
			outgoingRequestId,
			true
		);
	}

	const configuredTimeout = Number(env.PANOPTES_RAILS_API_TIMEOUT_MS ?? '5000');
	const timeoutMs = Number.isFinite(configuredTimeout)
		? Math.min(Math.max(configuredTimeout, 100), 30_000)
		: 5000;
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const upstream = await event.fetch(url, {
			method: 'GET',
			headers: {
				accept: 'application/json',
				authorization: `Bearer ${session.access_token}`,
				'x-request-id': outgoingRequestId,
				'x-correlation-id': correlationId
			},
			signal: controller.signal
		});
		const body = await upstream.text();
		return new Response(body, {
			status: upstream.status,
			headers: {
				'content-type': upstream.headers.get('content-type') ?? 'application/json',
				'cache-control': 'private, no-store',
				'x-request-id': upstream.headers.get('x-request-id') ?? outgoingRequestId,
				'x-correlation-id': upstream.headers.get('x-correlation-id') ?? correlationId
			}
		});
	} catch {
		return errorResponse(
			503,
			'UPSTREAM_UNAVAILABLE',
			'The application service is unavailable.',
			outgoingRequestId,
			true
		);
	} finally {
		clearTimeout(timeout);
	}
}

export async function proxyActiveOrganizationRailsGet(
	event: Pick<RequestEvent, 'locals' | 'request' | 'fetch'>,
	requestedOrganizationId: string,
	path: string
): Promise<Response> {
	const outgoingRequestId = requestId(event.request.headers.get('x-request-id'));
	const auth = event.locals.auth;
	if (!event.locals.supabase || !auth.user) {
		return errorResponse(401, 'UNAUTHENTICATED', 'Authentication is required.', outgoingRequestId);
	}
	const { data, error } = await event.locals.supabase.auth.getSession();
	if (
		error ||
		!data.session?.access_token ||
		data.session.user.id !== auth.user.id
	) {
		return errorResponse(401, 'UNAUTHENTICATED', 'Authentication is required.', outgoingRequestId);
	}
	const activeOrganizationId = auth.activeOrganizationId;
	const hasActiveMembership =
		activeOrganizationId !== null &&
		auth.memberships.some(
			(membership) => membership.organizationId === activeOrganizationId
		);

	if (!activeOrganizationId || !hasActiveMembership) {
		return errorResponse(
			403,
			'ACTIVE_ORGANIZATION_REQUIRED',
			'An active organization membership is required.',
			outgoingRequestId
		);
	}
	if (requestedOrganizationId !== activeOrganizationId) {
		return errorResponse(404, 'NOT_FOUND', 'The requested resource was not found.', outgoingRequestId);
	}

	return proxyRailsGet(event, path);
}
