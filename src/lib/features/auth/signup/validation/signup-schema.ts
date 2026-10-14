import type { SignUpField, SignUpFieldErrors, SignUpFormMode, SignUpValues } from '../types';

export type SignUpValidationContext = {
	mode: SignUpFormMode;
	hasSupabaseConfig: boolean;
	hasTurnstileSiteKey: boolean;
	turnstileReady: boolean;
};

export type SignUpValidationResult =
	| { ok: true; values: SignUpValues & { email: string; normalizedSiteUrl: string | null } }
	| { ok: false; field: SignUpField | null; fieldErrors: SignUpFieldErrors; message: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
	return value.trim().toLowerCase();
}

export function normalizeOptional(value: string, maxLength: number): string | null {
	const trimmed = value.trim();
	return trimmed ? trimmed.slice(0, maxLength) : null;
}

export function isValidEmail(value: string): boolean {
	return emailPattern.test(value);
}

export function isValidWebsiteUrl(value: string): boolean {
	return !value.trim() || /^https?:\/\/.+/i.test(value.trim());
}

function invalid(field: SignUpField | null, message: string): SignUpValidationResult {
	return { ok: false, field, fieldErrors: field ? { [field]: message } : {}, message };
}

export function validateSignUpForm(
	values: SignUpValues,
	context: SignUpValidationContext
): SignUpValidationResult {
	if (!context.hasSupabaseConfig) {
		return invalid(
			null,
			'Supabaseの環境変数が未設定か不正です。PUBLIC_SUPABASE_URL（http/https）と PUBLIC_SUPABASE_ANON_KEY を確認してください。'
		);
	}

	const email = normalizeEmail(values.email);
	if (!isValidEmail(email)) return invalid('email', '有効なメールアドレスを入力してください。');
	if (!values.password) return invalid('password', 'パスワードを入力してください。');

	if (context.mode === 'login') {
		return { ok: true, values: { ...values, email, normalizedSiteUrl: null } };
	}

	if (values.password.length < 8) {
		return invalid('password', 'パスワードは8文字以上で入力してください。');
	}
	if (values.password !== values.confirmPassword) {
		return invalid('confirmPassword', '確認用パスワードが一致しません。');
	}
	if (!isValidWebsiteUrl(values.siteUrl)) {
		return invalid('siteUrl', '自社サイトURLは http:// または https:// から始めてください。');
	}
	if (!values.agreed) {
		return invalid('agreed', '利用規約とプライバシーポリシーへの同意が必要です。');
	}
	if (!context.hasTurnstileSiteKey) {
		return invalid(
			'turnstile',
			'TurnstileのSite Keyが未設定です。PUBLIC_TURNSTILE_SITE_KEY を設定してください。'
		);
	}
	if (!context.turnstileReady) {
		return invalid('turnstile', 'CAPTCHAの初期化中です。少し待ってから再実行してください。');
	}
	if (!values.turnstileToken) {
		return invalid('turnstile', 'CAPTCHA認証を完了してください。');
	}

	return {
		ok: true,
		values: { ...values, email, normalizedSiteUrl: normalizeOptional(values.siteUrl, 1024) }
	};
}
