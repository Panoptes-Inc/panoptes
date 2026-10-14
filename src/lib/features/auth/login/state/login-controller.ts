import { safeReturnTo } from '$lib/auth/redirect';
import type {
	LoginAuthenticator,
	LoginControllerResult,
	LoginCredentials,
	LoginStatus
} from '../types';

type LoginControllerOptions = {
	authenticate: LoginAuthenticator;
	navigate: (path: string) => Promise<void>;
	returnTo: () => string | null;
	resolvePath?: (path: string) => string;
};

export function createLoginController(options: LoginControllerOptions) {
	let status: LoginStatus = 'idle';
	let destroyed = false;

	async function submit(credentials: LoginCredentials): Promise<LoginControllerResult> {
		if (destroyed) return { ok: false, reason: 'destroyed' };
		if (status === 'submitting') return { ok: false, reason: 'busy' };
		status = 'submitting';

		const authResult = await options.authenticate(credentials);
		if (destroyed) return { ok: false, reason: 'destroyed' };
		if (authResult.ok === false) {
			status = authResult.code === 'rate_limited' ? 'rate_limited' : 'failed';
			return { ok: false, reason: 'auth', code: authResult.code };
		}

		const safeTarget = safeReturnTo(options.returnTo(), '/app');
		const target = options.resolvePath ? options.resolvePath(safeTarget) : safeTarget;
		try {
			await options.navigate(target);
		} catch {
			if (destroyed) return { ok: false, reason: 'destroyed' };
			status = 'failed';
			return { ok: false, reason: 'auth', code: 'network_error' };
		}

		if (destroyed) return { ok: false, reason: 'destroyed' };
		status = 'authenticated';
		return { ok: true };
	}

	function destroy() {
		destroyed = true;
	}

	return { get status() { return status; }, submit, destroy };
}

export type LoginController = ReturnType<typeof createLoginController>;
