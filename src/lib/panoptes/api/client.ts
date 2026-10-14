import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import type { PanoptesApiClient } from '../types';
import { mockPanoptesApiClient } from './mock-backend';
import { unavailableCanonicalBusinessClient } from './unavailable-canonical-business-client';

// Mock is a development-only adapter. Canonical mode never falls back when Rails is unavailable.
export const panoptesApiClient: PanoptesApiClient =
	dev && env.PUBLIC_USE_MOCK_API === 'true'
		? mockPanoptesApiClient
		: unavailableCanonicalBusinessClient;
