import type { LoginResult, ResendOutcome, SignUpResult } from '../types';
import { mapAuthError, providerErrorCode, providerErrorMessage } from '../utils/signup-error-mapper';

type ProviderResult<T> = Promise<{ data: T; error: unknown | null }>;

export type SignUpAuthGateway = {
	signUp: (credentials: {
		email: string;
		password: string;
		options: {
			captchaToken: string;
			emailRedirectTo?: string;
			data?: { website_url: string };
		};
	}) => ProviderResult<{
		session: unknown | null;
		user: { id?: string; identities?: unknown[] | null } | null;
	}>;
	signInWithPassword: (credentials: {
		email: string;
		password: string;
	}) => ProviderResult<{ session: unknown | null }>;
	resend: (input: {
		type: 'signup';
		email: string;
		options?: { emailRedirectTo: string };
	}) => ProviderResult<unknown>;
};

export async function signUpWithPassword(
	auth: SignUpAuthGateway,
	input: {
		email: string;
		password: string;
		captchaToken: string;
		emailRedirectTo?: string;
		websiteUrl: string | null;
	}
): Promise<SignUpResult> {
	try {
		const { data, error } = await auth.signUp({
			email: input.email,
			password: input.password,
			options: {
				captchaToken: input.captchaToken,
				...(input.emailRedirectTo ? { emailRedirectTo: input.emailRedirectTo } : {}),
				...(input.websiteUrl ? { data: { website_url: input.websiteUrl } } : {})
			}
		});
		if (error) {
			const code = mapAuthError(error);
			return { ok: false, code, retryable: code === 'rate_limited' || code === 'network_error' };
		}

		return {
			ok: true,
			state: data.session ? 'session_created' : 'confirmation_required',
			userId: data.user?.id ?? null,
			looksLikeExistingUser:
				Array.isArray(data.user?.identities) && data.user.identities.length === 0
		};
	} catch {
		return { ok: false, code: 'network_error', retryable: true };
	}
}

export async function loginWithPassword(
	auth: SignUpAuthGateway,
	input: { email: string; password: string }
): Promise<LoginResult> {
	try {
		const { data, error } = await auth.signInWithPassword(input);
		if (error) {
			const code = mapAuthError(error);
			return { ok: false, code, retryable: code === 'rate_limited' || code === 'network_error' };
		}
		if (!data.session) return { ok: false, code: 'service_unavailable', retryable: true };
		return { ok: true, sessionCreated: true };
	} catch {
		return { ok: false, code: 'network_error', retryable: true };
	}
}

export async function resendSignupConfirmation(
	auth: SignUpAuthGateway,
	input: { email: string; emailRedirectTo?: string }
): Promise<ResendOutcome> {
	try {
		const { error } = await auth.resend({
			type: 'signup',
			email: input.email,
			...(input.emailRedirectTo ? { options: { emailRedirectTo: input.emailRedirectTo } } : {})
		});
		if (!error) return 'resent';

		const code = providerErrorCode(error);
		const message = providerErrorMessage(error);
		if (mapAuthError(error) === 'rate_limited') return 'rate_limited';
		if (mapAuthError(error) === 'smtp_blocked') return 'smtp_blocked';
		if (
			code === 'email_exists' ||
			code === 'otp_disabled' ||
			/already confirmed|already verified|has been confirmed|has already been verified/.test(message)
		) {
			return 'already_confirmed';
		}
		return 'failed';
	} catch {
		return 'failed';
	}
}
