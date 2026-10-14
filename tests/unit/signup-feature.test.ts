import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLoginController } from '../../src/lib/features/auth/login/state/login-controller';
import { createCooldownController } from '../../src/lib/features/auth/signup/state/cooldown';
import {
	beginSignUpOperation,
	validationFailureStatus
} from '../../src/lib/features/auth/signup/state/signup-state-machine';
import {
	loginWithPassword,
	resendSignupConfirmation,
	signUpWithPassword,
	type SignUpAuthGateway
} from '../../src/lib/features/auth/signup/services/signup-service';
import { joinWaitlist } from '../../src/lib/features/auth/signup/services/waitlist-service';
import { mapAuthError } from '../../src/lib/features/auth/signup/utils/signup-error-mapper';
import { safeSignupRedirect } from '../../src/lib/features/auth/signup/utils/safe-signup-redirect';
import { validateSignUpForm } from '../../src/lib/features/auth/signup/validation/signup-schema';

const validValues = {
	email: ' User@Example.com ',
	password: 'password123',
	confirmPassword: 'password123',
	siteUrl: 'https://example.com',
	agreed: true,
	turnstileToken: 'test-token'
};

function authGateway(overrides: Partial<SignUpAuthGateway> = {}): SignUpAuthGateway {
	return {
		signUp: vi.fn().mockResolvedValue({
			data: { session: null, user: { id: 'user-1', identities: [{}] } },
			error: null
		}),
		signInWithPassword: vi.fn().mockResolvedValue({
			data: { session: { access_token: 'test' } },
			error: null
		}),
		resend: vi.fn().mockResolvedValue({ data: {}, error: null }),
		...overrides
	};
}

describe('signup validation', () => {
	const context = {
		mode: 'signup' as const,
		hasSupabaseConfig: true,
		hasTurnstileSiteKey: true,
		turnstileReady: true
	};

	it('normalizes valid signup input', () => {
		const result = validateSignUpForm(validValues, context);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.values.email).toBe('user@example.com');
			expect(result.values.normalizedSiteUrl).toBe('https://example.com');
		}
	});

	it.each([
		[{ ...validValues, email: 'invalid' }, 'email'],
		[{ ...validValues, confirmPassword: 'different' }, 'confirmPassword'],
		[{ ...validValues, agreed: false }, 'agreed'],
		[{ ...validValues, turnstileToken: '' }, 'turnstile']
	])('rejects invalid input without contacting a provider', (values, expectedField) => {
		const result = validateSignUpForm(values, context);
		expect(result.ok).toBe(false);
		if (result.ok === false) expect(result.field).toBe(expectedField);
	});
});

describe('login validation', () => {
	const context = {
		mode: 'login' as const,
		hasSupabaseConfig: true,
		hasTurnstileSiteKey: false,
		turnstileReady: false
	};

	it('normalizes a valid email without applying signup-only requirements', () => {
		const result = validateSignUpForm({ ...validValues, email: ' User@Example.com ' }, context);
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.values.email).toBe('user@example.com');
	});

	it.each([
		[{ ...validValues, email: 'invalid' }, 'email'],
		[{ ...validValues, password: '' }, 'password']
	])('rejects invalid login values', (values, expectedField) => {
		const result = validateSignUpForm(values, context);
		expect(result.ok).toBe(false);
		if (result.ok === false) expect(result.field).toBe(expectedField);
	});
});

describe('signup auth service', () => {
	it('maps session and confirmation signup success', async () => {
		const session = await signUpWithPassword(
			authGateway({
				signUp: vi.fn().mockResolvedValue({
					data: { session: {}, user: { id: 'user-1', identities: [{}] } },
					error: null
				})
			}),
			{
				email: 'user@example.com',
				password: 'password123',
				captchaToken: 'token',
				websiteUrl: null
			}
		);
		const confirmation = await signUpWithPassword(authGateway(), {
			email: 'user@example.com',
			password: 'password123',
			captchaToken: 'token',
			websiteUrl: null
		});
		expect(session).toMatchObject({ ok: true, state: 'session_created' });
		expect(confirmation).toMatchObject({ ok: true, state: 'confirmation_required' });
	});

	it.each([
		['user_already_exists', 'already_registered'],
		['over_email_send_rate_limit', 'rate_limited']
	])('maps provider code %s', async (providerCode, expectedCode) => {
		const result = await signUpWithPassword(
			authGateway({
				signUp: vi
					.fn()
					.mockResolvedValue({ data: { session: null, user: null }, error: { code: providerCode } })
			}),
			{
				email: 'user@example.com',
				password: 'password123',
				captchaToken: 'token',
				websiteUrl: null
			}
		);
		expect(result).toMatchObject({ ok: false, code: expectedCode });
	});

	it('maps network failures without exposing provider errors', async () => {
		const result = await signUpWithPassword(
			authGateway({ signUp: vi.fn().mockRejectedValue(new Error('secret provider detail')) }),
			{
				email: 'user@example.com',
				password: 'password123',
				captchaToken: 'token',
				websiteUrl: null
			}
		);
		expect(result).toEqual({ ok: false, code: 'network_error', retryable: true });
	});

	it('requires an established login session', async () => {
		const result = await loginWithPassword(
			authGateway({
				signInWithPassword: vi.fn().mockResolvedValue({ data: { session: null }, error: null })
			}),
			{ email: 'user@example.com', password: 'password123' }
		);
		expect(result).toEqual({ ok: false, code: 'service_unavailable', retryable: true });
	});

	it('maps login session success and stable provider failures', async () => {
		await expect(
			loginWithPassword(authGateway(), { email: 'user@example.com', password: 'password123' })
		).resolves.toEqual({ ok: true, sessionCreated: true });
		await expect(
			loginWithPassword(
				authGateway({
					signInWithPassword: vi.fn().mockResolvedValue({
						data: { session: null },
						error: { message: 'Invalid login credentials: provider detail' }
					})
				}),
				{ email: 'user@example.com', password: 'wrong' }
			)
		).resolves.toEqual({ ok: false, code: 'invalid_credentials', retryable: false });
	});

	it('maps login provider throws to a network failure', async () => {
		const result = await loginWithPassword(
			authGateway({ signInWithPassword: vi.fn().mockRejectedValue(new Error('provider secret')) }),
			{ email: 'user@example.com', password: 'password123' }
		);
		expect(result).toEqual({ ok: false, code: 'network_error', retryable: true });
	});

	it('maps resend rate limits', async () => {
		const result = await resendSignupConfirmation(
			authGateway({
				resend: vi
					.fn()
					.mockResolvedValue({ data: {}, error: { code: 'over_email_send_rate_limit' } })
			}),
			{ email: 'user@example.com' }
		);
		expect(result).toBe('rate_limited');
	});
});

describe('login controller', () => {
	function loginController(
		authenticate = vi.fn().mockResolvedValue({ ok: true, sessionCreated: true }),
		returnTo = '/app/analysis'
	) {
		const navigate = vi.fn().mockResolvedValue(undefined);
		const controller = createLoginController({
			authenticate,
			returnTo: () => returnTo,
			navigate
		});
		return { controller, navigate, authenticate };
	}

	it('starts idle', () => {
		const { controller } = loginController();
		expect(controller.status).toBe('idle');
		controller.destroy();
	});

	it('prevents duplicate submit and redirects safely after an established session', async () => {
		let resolveLogin: ((value: { ok: true; sessionCreated: true }) => void) | undefined;
		const authenticate = vi.fn(
			() =>
				new Promise<{ ok: true; sessionCreated: true }>((resolve) => {
					resolveLogin = resolve;
				})
		);
		const { controller, navigate } = loginController(authenticate);
		const credentials = { email: 'user@example.com', password: 'password123' };
		const first = controller.submit(credentials);
		expect(controller.status).toBe('submitting');
		await expect(controller.submit(credentials)).resolves.toEqual({ ok: false, reason: 'busy' });
		expect(authenticate).toHaveBeenCalledTimes(1);
		resolveLogin?.({ ok: true, sessionCreated: true });
		await first;
		expect(controller.status).toBe('authenticated');
		expect(navigate).toHaveBeenCalledWith('/app/analysis');
		controller.destroy();
	});

	it.each([
		['Invalid login credentials', 'failed'],
		['Email not confirmed', 'failed'],
		['Too many requests', 'rate_limited']
	])('maps login failure %s without exposing provider text', async (providerMessage, status) => {
		const code = mapAuthError({ message: providerMessage });
		const { controller, navigate } = loginController(
			vi.fn().mockResolvedValue({ ok: false, code, retryable: code === 'rate_limited' })
		);
		const result = await controller.submit({ email: 'user@example.com', password: 'password123' });
		expect(controller.status).toBe(status);
		expect(result).toEqual({ ok: false, reason: 'auth', code });
		expect(navigate).not.toHaveBeenCalled();
		controller.destroy();
	});

	it('uses the safe fallback for an external redirect', async () => {
		const { controller, navigate } = loginController(undefined, 'https://evil.example');
		await controller.submit({ email: 'user@example.com', password: 'password123' });
		expect(navigate).toHaveBeenCalledWith('/app');
		controller.destroy();
	});

	it('maps navigation failure without exposing its error', async () => {
		const navigate = vi.fn().mockRejectedValue(new Error('router detail'));
		const controller = createLoginController({
			authenticate: vi.fn().mockResolvedValue({ ok: true, sessionCreated: true }),
			returnTo: () => '/app',
			navigate
		});
		await expect(
			controller.submit({ email: 'user@example.com', password: 'password123' })
		).resolves.toEqual({ ok: false, reason: 'auth', code: 'network_error' });
		expect(controller.status).toBe('failed');
		controller.destroy();
	});

	it('does not publish async completion after destroy', async () => {
		let resolveLogin: ((value: { ok: true; sessionCreated: true }) => void) | undefined;
		const { controller, navigate } = loginController(
			vi.fn(
				() =>
					new Promise<{ ok: true; sessionCreated: true }>((resolve) => {
						resolveLogin = resolve;
					})
			)
		);
		const pending = controller.submit({ email: 'user@example.com', password: 'password123' });
		controller.destroy();
		resolveLogin?.({ ok: true, sessionCreated: true });
		await pending;
		expect(controller.status).toBe('submitting');
		expect(navigate).not.toHaveBeenCalled();
	});
});

describe('waitlist service', () => {
	it.each([
		[
			{ ok: true, data: { code: 'JOINED', message: 'joined' } },
			{ ok: true, code: 'JOINED' }
		],
		[
			{ ok: true, data: { code: 'ALREADY', message: 'already' } },
			{ ok: true, code: 'ALREADY' }
		],
		[
			{ ok: true, data: { code: 'FULL', message: 'full' } },
			{ ok: true, code: 'FULL' }
		],
		[
			{ ok: false, code: 'WAITLIST_FAILED' },
			{ ok: false, code: 'WAITLIST_FAILED' }
		]
	])('maps waitlist payloads', async (payload, expected) => {
		const fetchFn = vi.fn().mockResolvedValue({ status: 200, json: async () => payload });
		const result = await joinWaitlist(
			{ email: 'user@example.com', websiteUrl: null, pagePath: '/login', turnstileToken: 'token' },
			fetchFn
		);
		expect(result).toMatchObject(expected);
	});

	it('marks network failures retryable', async () => {
		const result = await joinWaitlist(
			{ email: 'user@example.com', websiteUrl: null, pagePath: '/login', turnstileToken: 'token' },
			vi.fn().mockRejectedValue(new Error('offline'))
		);
		expect(result).toEqual({ ok: false, code: 'WAITLIST_NETWORK', retryable: true });
	});
});

describe('form state and utilities', () => {
	afterEach(() => vi.useRealTimers());

	it('prevents a double submit and represents partial success', () => {
		expect(beginSignUpOperation('idle', 'submitting')).toBe('submitting');
		expect(beginSignUpOperation('submitting', 'submitting')).toBeNull();
		expect(beginSignUpOperation('partial_success', 'submitting')).toBe('submitting');
	});

	it('tracks Turnstile waiting separately', () => {
		expect(validationFailureStatus('turnstile')).toBe('turnstile_waiting');
		expect(validationFailureStatus('email')).toBe('failed');
	});

	it('counts down once and cleanup prevents later ticks', () => {
		vi.useFakeTimers();
		const ticks: number[] = [];
		const cooldown = createCooldownController((remaining) => ticks.push(remaining));
		cooldown.start(2);
		vi.advanceTimersByTime(1000);
		cooldown.destroy();
		vi.advanceTimersByTime(5000);
		expect(ticks).toEqual([2, 1, 0]);
	});

	it('keeps redirects on the same origin app path', () => {
		expect(safeSignupRedirect('/app/analysis')).toBe('/app/analysis');
		expect(safeSignupRedirect('https://evil.example')).toBe('/app');
	});

	it('maps provider details to stable UI codes', () => {
		expect(mapAuthError({ message: 'Invalid login credentials' })).toBe('invalid_credentials');
		expect(mapAuthError({ message: 'sensitive internal detail' })).toBe('unknown_error');
	});
});
