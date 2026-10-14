import type { RequestEvent } from '@sveltejs/kit';
import type { RequestAuthContext } from './types';

export interface AuthProviderAdapter {
	resolve(event: RequestEvent): Promise<RequestAuthContext>;
}
