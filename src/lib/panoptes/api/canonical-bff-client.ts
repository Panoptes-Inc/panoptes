import { PanoptesApiError } from '../utils/errors';

export const PANOPTES_BFF_BASE_PATH = '/api/panoptes/v1';

export type CanonicalOrganization = {
	id: string;
	name: string;
	slug: string;
	status: string;
	membership: { id: string; role: string; status: string };
};

export type CanonicalOrganizationMembership = {
	id: string;
	organization_id: string;
	user_id: string;
	role: string;
	status: string;
};

export type CanonicalHealth = { status: 'ok'; service: string };

export type CanonicalCurrentUser = {
	id: string;
	supabase_user_id: string;
	email: string | null;
	status: string;
	system_admin: boolean;
};

export type OrganizationBoundaryClient = {
	getOrganization: (input: {
		organizationId: string;
		signal?: AbortSignal;
	}) => Promise<CanonicalOrganization>;
	getCurrentMembership: (input: {
		organizationId: string;
		signal?: AbortSignal;
	}) => Promise<CanonicalOrganizationMembership>;
};

export type CanonicalBffClient = OrganizationBoundaryClient & {
	getHealth: (input?: { signal?: AbortSignal }) => Promise<CanonicalHealth>;
	getCurrentUser: (input?: { signal?: AbortSignal }) => Promise<CanonicalCurrentUser>;
	listOrganizations: (input?: { signal?: AbortSignal }) => Promise<CanonicalOrganization[]>;
};

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function statusCode(status: number): string {
	return (
		{
			401: 'UNAUTHENTICATED',
			403: 'FORBIDDEN',
			404: 'NOT_FOUND',
			409: 'CONFLICT',
			422: 'VALIDATION_FAILED',
			429: 'RATE_LIMITED',
			503: 'UPSTREAM_UNAVAILABLE'
		} as Record<number, string>
	)[status] ?? (status >= 500 ? 'SERVER_ERROR' : 'REQUEST_FAILED');
}

function statusMessage(status: number): string {
	if (status === 401) return 'Authentication is required.';
	if (status === 403) return 'The requested operation is not permitted.';
	if (status === 404) return 'The requested resource was not found.';
	if (status === 409) return 'The request conflicts with the current resource state.';
	if (status === 422) return 'The request could not be validated.';
	if (status === 429) return 'The request limit has been reached.';
	if (status === 503) return 'The application service is unavailable.';
	return 'The Panoptes request failed.';
}

async function parsePayload(response: Response): Promise<unknown> {
	try {
		return await response.json();
	} catch {
		return null;
	}
}

function assertOrganization(value: unknown): CanonicalOrganization {
	if (
		!isRecord(value) ||
		typeof value.id !== 'string' ||
		typeof value.name !== 'string' ||
		typeof value.slug !== 'string' ||
		typeof value.status !== 'string' ||
		!isRecord(value.membership) ||
		typeof value.membership.id !== 'string' ||
		typeof value.membership.role !== 'string' ||
		typeof value.membership.status !== 'string'
	) {
		throw new PanoptesApiError('Panoptes BFF returned an invalid organization.', {
			code: 'invalid_response'
		});
	}
	return value as CanonicalOrganization;
}

function assertMembership(value: unknown): CanonicalOrganizationMembership {
	if (
		!isRecord(value) ||
		typeof value.id !== 'string' ||
		typeof value.organization_id !== 'string' ||
		typeof value.user_id !== 'string' ||
		typeof value.role !== 'string' ||
		typeof value.status !== 'string'
	) {
		throw new PanoptesApiError('Panoptes BFF returned an invalid membership.', {
			code: 'invalid_response'
		});
	}
	return value as CanonicalOrganizationMembership;
}

function assertHealth(value: unknown): CanonicalHealth {
	if (!isRecord(value) || value.status !== 'ok' || typeof value.service !== 'string') {
		throw new PanoptesApiError('Panoptes BFF returned an invalid health response.', {
			code: 'invalid_response'
		});
	}
	return value as CanonicalHealth;
}

function assertCurrentUser(value: unknown): CanonicalCurrentUser {
	if (
		!isRecord(value) ||
		typeof value.id !== 'string' ||
		typeof value.supabase_user_id !== 'string' ||
		!(typeof value.email === 'string' || value.email === null) ||
		typeof value.status !== 'string' ||
		typeof value.system_admin !== 'boolean'
	) {
		throw new PanoptesApiError('Panoptes BFF returned an invalid user response.', {
			code: 'invalid_response'
		});
	}
	return value as CanonicalCurrentUser;
}

function assertOrganizations(value: unknown): CanonicalOrganization[] {
	if (!Array.isArray(value)) {
		throw new PanoptesApiError('Panoptes BFF returned an invalid organization collection.', {
			code: 'invalid_response'
		});
	}
	return value.map(assertOrganization);
}

export function createCanonicalBffClient(options: {
	fetcher?: Fetcher;
	timeoutMs?: number;
} = {}): CanonicalBffClient {
	const fetcher = options.fetcher ?? ((input, init) => fetch(input, init));
	const timeoutMs = options.timeoutMs ?? 15_000;

	async function get<T>(
		path: string,
		parse: (value: unknown) => T,
		signal?: AbortSignal
	): Promise<T> {
		const controller = new AbortController();
		let requestTimedOut = false;
		const forwardAbort = () => controller.abort(signal?.reason);
		signal?.addEventListener('abort', forwardAbort, { once: true });
		const timeout = setTimeout(() => {
			requestTimedOut = true;
			controller.abort();
		}, timeoutMs);

		try {
			const response = await fetcher(`${PANOPTES_BFF_BASE_PATH}${path}`, {
				method: 'GET',
				headers: { accept: 'application/json' },
				signal: controller.signal
			});
			const payload = await parsePayload(response);
			if (!response.ok) {
				const error = isRecord(payload) && isRecord(payload.error) ? payload.error : null;
				throw new PanoptesApiError(statusMessage(response.status), {
					code: typeof error?.code === 'string' ? error.code : statusCode(response.status),
					status: response.status,
					retryable:
						typeof error?.retryable === 'boolean'
							? error.retryable
							: response.status === 429 || response.status >= 500
				});
			}
			if (!isRecord(payload) || !('data' in payload)) {
				throw new PanoptesApiError('Panoptes BFF returned an invalid response envelope.', {
					code: 'invalid_response',
					status: response.status
				});
			}
			return parse(payload.data);
		} catch (error) {
			if (error instanceof PanoptesApiError) throw error;
			if (signal?.aborted) {
				throw new PanoptesApiError('The Panoptes request was aborted.', {
					code: 'request_aborted'
				});
			}
			if (requestTimedOut) {
				throw new PanoptesApiError('The Panoptes request timed out.', {
					code: 'request_timeout',
					retryable: true
				});
			}
			throw new PanoptesApiError('The Panoptes service could not be reached.', {
				code: 'network_error',
				retryable: true
			});
		} finally {
			clearTimeout(timeout);
			signal?.removeEventListener('abort', forwardAbort);
		}
	}

	return {
		getHealth: (input = {}) => get('/health', assertHealth, input.signal),
		getCurrentUser: (input = {}) => get('/me', assertCurrentUser, input.signal),
		listOrganizations: (input = {}) => get('/organizations', assertOrganizations, input.signal),
		getOrganization: ({ organizationId, signal }) =>
			get(`/organizations/${encodeURIComponent(organizationId)}`, assertOrganization, signal),
		getCurrentMembership: ({ organizationId, signal }) =>
			get(
				`/organizations/${encodeURIComponent(organizationId)}/memberships/me`,
				assertMembership,
				signal
			)
	};
}
