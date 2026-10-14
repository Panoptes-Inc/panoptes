import { resolve } from '$app/paths';
import { hasSupabaseConfig, supabase } from '$lib/supabaseClient';
import { createLoginController } from '../../login/state/login-controller';
import { authErrorMessage } from '../utils/signup-error-mapper';
import { signupEmailRedirect } from '../utils/safe-signup-redirect';
import { isValidEmail, validateSignUpForm } from '../validation/signup-schema';
import { loginWithPassword, resendSignupConfirmation, signUpWithPassword } from '../services/signup-service';
import type { SignUpAuthGateway } from '../services/signup-service';
import { joinWaitlist } from '../services/waitlist-service';
import { createSignUpFormState } from './signup-form-state.svelte';
import type { SignUpFormMode } from '../types';

type ControllerOptions = {
	mode: SignUpFormMode;
	turnstileSiteKey: string;
	pagePath: () => string;
	returnTo: () => string | null;
	origin: () => string | undefined;
	navigate: (path: string) => Promise<void>;
	auth?: SignUpAuthGateway;
	fetchFn?: typeof fetch;
	hasAuthConfig?: boolean;
};

export function createSignUpController(options: ControllerOptions) {
	const state = createSignUpFormState(options.mode);
	const auth = options.auth ?? (supabase.auth as unknown as SignUpAuthGateway);
	const fetchFn = options.fetchFn ?? fetch;
	const authConfigured = options.hasAuthConfig ?? hasSupabaseConfig;
	let destroyed = false;
	const loginController = createLoginController({
		authenticate: (credentials) => loginWithPassword(auth, credentials),
		navigate: options.navigate,
		returnTo: options.returnTo,
		resolvePath: (path) => resolve(path as '/')
	});

	function enableResend(email: string) {
		state.canResend = true;
		state.lastEmailForResend = email;
	}

	async function handleResendOutcome(email: string, existingAccount: boolean) {
		const outcome = await resendSignupConfirmation(auth, {
			email,
			emailRedirectTo: signupEmailRedirect(options.origin())
		});
		if (destroyed) return;

		if (outcome === 'resent') {
			state.message = existingAccount
				? '未確認アカウントのため確認メールを再送しました。メールを確認してください。'
				: '確認メールを再送しました。メール内のリンクから認証を完了してください。';
			enableResend(email);
			state.startCooldown(60);
			state.finish('awaiting_confirmation');
			return;
		}
		if (outcome === 'already_confirmed') {
			state.message = 'このメールアドレスは既に確認済みです。再送は不要です。ログインしてください。';
			state.canResend = false;
			state.lastEmailForResend = '';
			state.clearCooldown();
			state.finish('success');
			return;
		}

		enableResend(email);
		if (outcome === 'rate_limited') {
			state.startCooldown(60);
			state.fail(authErrorMessage('rate_limited', 'resend'), 'rate_limited');
			return;
		}
		if (outcome === 'smtp_blocked') {
			state.fail(authErrorMessage('smtp_blocked', 'resend'));
			return;
		}
		state.fail(authErrorMessage('unknown_error', 'resend'));
	}

	async function submitLogin(email: string, password: string) {
		const result = await loginController.submit({ email, password });
		if (destroyed) return;
		if (result.ok === false) {
			if (result.reason !== 'auth') return;
			if (result.code === 'email_not_confirmed') enableResend(email);
			state.fail(authErrorMessage(result.code, 'login'), result.code === 'rate_limited' ? 'rate_limited' : 'failed');
			return;
		}

		state.message = 'ログインしました。';
		state.canResend = false;
		state.lastEmailForResend = '';
		state.clearCooldown();
		state.password = '';
		state.showPassword = false;
		state.finish('success');
	}

	async function submitSignUp(values: ReturnType<typeof state.values> & { normalizedSiteUrl: string | null }) {
		const result = await signUpWithPassword(auth, {
			email: values.email,
			password: values.password,
			captchaToken: values.turnstileToken,
			emailRedirectTo: signupEmailRedirect(options.origin()),
			websiteUrl: values.normalizedSiteUrl
		});
		if (destroyed) return;

		if (result.ok === false) {
			if (result.code === 'already_registered') {
				await handleResendOutcome(values.email, true);
				return;
			}
			if (result.code === 'rate_limited') {
				enableResend(values.email);
				state.startCooldown(60);
			}
			state.fail(
				authErrorMessage(result.code, 'signup'),
				result.code === 'rate_limited' ? 'rate_limited' : 'failed'
			);
			return;
		}

		const waitlist = await joinWaitlist(
			{
				email: values.email,
				websiteUrl: values.normalizedSiteUrl,
				pagePath: options.pagePath(),
				turnstileToken: values.turnstileToken
			},
			fetchFn
		);
		if (destroyed) return;
		state.resetTurnstile();

		if (!waitlist.ok) {
			if (waitlist.code === 'CAPTCHA_FAILED') {
				state.message = 'アカウントは作成しましたが、CAPTCHA検証に失敗したためウェイトリスト登録は未完了です。';
			} else if (waitlist.code === 'CAPTCHA_REQUIRED') {
				state.message = 'アカウントは作成しましたが、CAPTCHA未入力のためウェイトリスト登録は未完了です。';
			} else if (waitlist.code === 'RATE_LIMITED') {
				state.message = 'Too many attempts. Please wait a minute and try again.';
			} else {
				state.message = 'アカウントは作成しました。ウェイトリスト登録のみ失敗したため、後で再試行してください。';
			}
			enableResend(values.email);
			state.clearSensitiveFields();
			state.finish('partial_success');
			return;
		}

		if (waitlist.code === 'FULL') {
			state.message = 'アカウントは作成しましたが、現在ウェイトリストは上限に達しています。';
			state.finish('partial_success');
		} else if (waitlist.code === 'INVALID') {
			state.message = 'アカウントは作成しましたが、ウェイトリスト情報に不正があり登録できませんでした。';
			state.finish('partial_success');
		} else if (result.looksLikeExistingUser) {
			await handleResendOutcome(values.email, true);
			return;
		} else {
			state.message = 'アカウントを作成しました。確認メールのリンクから認証を完了してください。';
			state.finish(result.state === 'confirmation_required' ? 'awaiting_confirmation' : 'success');
		}

		enableResend(values.email);
		state.clearSensitiveFields();
	}

	async function submit(): Promise<void> {
		if (destroyed || state.loading) return;
		state.resetNotices();
		state.finish('validating');
		const validation = validateSignUpForm(state.values(), {
			mode: state.activeMode,
			hasSupabaseConfig: authConfigured,
			hasTurnstileSiteKey: Boolean(options.turnstileSiteKey),
			turnstileReady: state.turnstileReady
		});
		if (validation.ok === false) {
			state.validationFailed(validation.field, validation.fieldErrors, validation.message);
			return;
		}
		state.email = validation.values.email;
		if (!state.begin('submitting')) return;
		if (state.isLogin) {
			await submitLogin(validation.values.email, validation.values.password);
			return;
		}
		await submitSignUp(validation.values);
	}

	async function resend(): Promise<void> {
		if (destroyed || state.loading || state.resendCooldown > 0 || !state.begin('resending')) return;
		const email = (state.lastEmailForResend || state.email).trim().toLowerCase();
		if (!isValidEmail(email)) {
			state.validationFailed('email', { email: '有効なメールアドレスを入力してください。' }, '有効なメールアドレスを入力してください。');
			return;
		}
		await handleResendOutcome(email, false);
	}

	function destroy() {
		destroyed = true;
		loginController.destroy();
		state.destroy();
	}

	return { state, submit, resend, destroy };
}
