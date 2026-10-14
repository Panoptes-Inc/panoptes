import { safeReturnTo } from '$lib/auth/redirect';

export function safeSignupRedirect(returnTo: string | null): string {
	return safeReturnTo(returnTo, '/app');
}

export function signupEmailRedirect(origin: string | undefined): string | undefined {
	if (!origin) return undefined;
	return `${origin}/auth/callback?next=${encodeURIComponent('/app')}`;
}

export function browserOrigin(): string | undefined {
	return typeof window === 'undefined' ? undefined : window.location.origin;
}
