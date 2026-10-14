import type { AuthErrorCode, LoginResult } from '../signup/types';

export type LoginCredentials = { email: string; password: string };
export type LoginStatus = 'idle' | 'submitting' | 'authenticated' | 'failed' | 'rate_limited';
export type LoginControllerResult =
	| { ok: true }
	| { ok: false; reason: 'busy' | 'destroyed' }
	| { ok: false; reason: 'auth'; code: AuthErrorCode };
export type LoginAuthenticator = (credentials: LoginCredentials) => Promise<LoginResult>;
