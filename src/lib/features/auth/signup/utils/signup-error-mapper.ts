import type { AuthErrorCode } from '../types';

export function providerErrorCode(error: unknown): string {
	if (error && typeof error === 'object' && 'code' in error) {
		const code = (error as { code?: unknown }).code;
		if (typeof code === 'string') return code.toLowerCase();
	}
	return '';
}

export function providerErrorMessage(error: unknown): string {
	if (error && typeof error === 'object' && 'message' in error) {
		const message = (error as { message?: unknown }).message;
		if (typeof message === 'string') return message.toLowerCase();
	}
	return '';
}

export function mapAuthError(error: unknown): AuthErrorCode {
	const code = providerErrorCode(error);
	const message = providerErrorMessage(error);
	if (code === 'over_email_send_rate_limit' || /rate limit|too many requests/.test(message)) {
		return 'rate_limited';
	}
	if (
		code === 'user_already_exists' ||
		code === 'email_exists' ||
		/already registered|already exists|email exists/.test(message)
	) {
		return 'already_registered';
	}
	if (code === 'email_not_confirmed' || /email not confirmed|confirm your email/.test(message)) {
		return 'email_not_confirmed';
	}
	if (code === 'invalid_credentials' || /invalid login credentials|invalid credentials/.test(message)) {
		return 'invalid_credentials';
	}
	if (code === 'email_address_not_authorized' || /email address not authorized|smtp/.test(message)) {
		return 'smtp_blocked';
	}
	return 'unknown_error';
}

export function authErrorMessage(code: AuthErrorCode, operation: 'signup' | 'login' | 'resend'): string {
	if (code === 'rate_limited') return '送信回数が多すぎます。少し待ってから再試行してください。';
	if (code === 'smtp_blocked') {
		return 'SupabaseのデフォルトSMTP制限でこの宛先に送れない可能性があります。Auth設定のSMTPと送信先制限を確認してください。';
	}
	if (code === 'email_not_confirmed') {
		return 'メール認証が未完了です。確認メールを再送してからログインしてください。';
	}
	if (code === 'invalid_credentials') return 'メールアドレスまたはパスワードが正しくありません。';
	if (code === 'network_error') {
		return '認証サービスへ接続できませんでした。時間をおいて再度お試しください。';
	}
	if (operation === 'login') return 'ログイン処理を完了できませんでした。時間をおいて再度お試しください。';
	if (operation === 'resend') return '確認メールの再送に失敗しました。';
	return 'アカウント作成に失敗しました。';
}
