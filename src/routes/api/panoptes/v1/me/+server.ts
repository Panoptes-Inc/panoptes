import { proxyRailsGet } from '$lib/server/rails/client';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = (event) => proxyRailsGet(event, '/api/v1/me');
