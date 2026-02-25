<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
	import SignUpBtn from '$lib/components/SignUpBtn.svelte';
	import { hasSupabaseConfig, supabase } from '$lib/supabaseClient';
	import termsText from '$lib/components/利用規約.txt?raw';
	import privacyPolicyText from '$lib/components/プライバシーポリシー.txt?raw';

	type FormMode = 'signup' | 'login';
	type WaitlistJoinCode = 'JOINED' | 'ALREADY' | 'FULL' | 'INVALID';
	type WaitlistJoinResult = {
		ok: boolean;
		code: WaitlistJoinCode;
		message: string;
	};
	type ResendOutcome = 'resent' | 'already_confirmed' | 'rate_limited' | 'smtp_blocked' | 'failed';
	type WaitlistApiResponse =
		| { ok: true; data: WaitlistJoinResult | null }
		| { ok: false; code?: string; message?: string; errorCodes?: string[] };

	type TurnstileApi = {
		render: (
			container: HTMLElement,
			options: {
				sitekey: string;
				theme?: 'light' | 'dark' | 'auto';
				size?: 'normal' | 'compact' | 'flexible';
				callback?: (token: string) => void;
				'expired-callback'?: () => void;
				'error-callback'?: () => void;
			}
		) => string;
		reset: (widgetId?: string) => void;
		remove?: (widgetId: string) => void;
	};

	let { mode = 'signup' }: { mode?: FormMode } = $props();

	let activeMode = $state<FormMode>('signup');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let siteUrl = $state('');
	let agreed = $state(false);
	let showTerms = $state(false);
	let showPrivacyPolicy = $state(false);
	let showPassword = $state(false);
	let showConfirm = $state(false);
	let loading = $state(false);
	let message = $state('');
	let errorMsg = $state('');
	let canResend = $state(false);
	let resendCooldown = $state(0);
	let lastEmailForResend = $state('');

	let turnstileToken = $state('');
	let turnstileReady = $state(false);
	let turnstileContainer = $state<HTMLDivElement | null>(null);
	let turnstileWidgetId = $state<string | null>(null);
	let cooldownTimer: ReturnType<typeof setInterval> | null = null;

	const isLogin = $derived(activeMode === 'login');
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	$effect(() => {
		activeMode = mode === 'login' ? 'login' : 'signup';
	});

	function getTurnstile() {
		return (window as Window & { turnstile?: TurnstileApi }).turnstile;
	}

	onMount(() => {
		let disposed = false;

		async function bootTurnstile() {
			if (!PUBLIC_TURNSTILE_SITE_KEY || !turnstileContainer) return;
			await ensureTurnstileScript();
			const turnstile = getTurnstile();
			if (disposed || !turnstileContainer || !turnstile) return;

			turnstileWidgetId = turnstile.render(turnstileContainer, {
				sitekey: PUBLIC_TURNSTILE_SITE_KEY,
				theme: 'light',
				size: 'normal',
				callback: (token: string) => {
					turnstileToken = token;
				},
				'expired-callback': () => {
					turnstileToken = '';
				},
				'error-callback': () => {
					turnstileToken = '';
				}
			});

			turnstileReady = true;
		}

		void bootTurnstile();

		return () => {
			disposed = true;
			const turnstile = getTurnstile();
			if (turnstileWidgetId && turnstile?.remove) {
				turnstile.remove(turnstileWidgetId);
			}
		};
	});

	onDestroy(() => {
		if (cooldownTimer) {
			clearInterval(cooldownTimer);
		}
	});

	async function ensureTurnstileScript() {
		if (getTurnstile()) return;

		const existing = document.querySelector<HTMLScriptElement>(
			'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
		);
		if (existing) {
			await waitForTurnstileReady();
			return;
		}

		await new Promise<void>((resolve, reject) => {
			const script = document.createElement('script');
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.async = true;
			script.defer = true;
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('TURNSTILE_SCRIPT_LOAD_FAILED'));
			document.head.appendChild(script);
		});

		await waitForTurnstileReady();
	}

	async function waitForTurnstileReady() {
		let attempts = 0;
		while (!getTurnstile() && attempts < 50) {
			await new Promise((resolve) => setTimeout(resolve, 50));
			attempts += 1;
		}
	}

	function resetTurnstile() {
		turnstileToken = '';
		const turnstile = getTurnstile();
		if (turnstileWidgetId && turnstile) {
			turnstile.reset(turnstileWidgetId);
		}
	}

	function normalizeEmail(value: string) {
		return value.trim().toLowerCase();
	}

	function normalizeOptional(value: string, maxLength: number) {
		const trimmed = value.trim();
		if (!trimmed) return null;
		return trimmed.slice(0, maxLength);
	}

	function getEmailRedirectTo() {
		if (typeof window === 'undefined') return undefined;
		return `${window.location.origin}/`;
	}

	function isValidEmail(value: string) {
		return emailPattern.test(value);
	}

	function isValidWebsiteUrl(value: string) {
		if (!value.trim()) return true;
		return /^https?:\/\/.+/i.test(value.trim());
	}

	function getErrorMessage(error: unknown, fallback: string) {
		if (error && typeof error === 'object' && 'message' in error) {
			const messageFromError = (error as { message?: unknown }).message;
			if (typeof messageFromError === 'string' && messageFromError.length > 0) {
				return messageFromError;
			}
		}
		return fallback;
	}

	function getErrorCode(error: unknown) {
		if (error && typeof error === 'object' && 'code' in error) {
			const code = (error as { code?: unknown }).code;
			if (typeof code === 'string') return code.toLowerCase();
		}
		return '';
	}

	function isRateLimited(messageText: string, code = '') {
		return code === 'over_email_send_rate_limit' || /rate limit|too many requests|over_email_send_rate_limit/i.test(messageText);
	}

	function isAlreadyRegistered(messageText: string, code = '') {
		return (
			code === 'user_already_exists' ||
			code === 'email_exists' ||
			/already registered|user already registered|already exists|email exists/i.test(messageText)
		);
	}

	function isEmailNotConfirmed(messageText: string, code = '') {
		return code === 'email_not_confirmed' || /email not confirmed|confirm your email/i.test(messageText);
	}

	function isInvalidCredentials(messageText: string, code = '') {
		return code === 'invalid_credentials' || /invalid login credentials|invalid credentials|invalid email or password/i.test(messageText);
	}

	function isEmailNotAuthorizedByDefaultSmtp(messageText: string, code = '') {
		return code === 'email_address_not_authorized' || /email address not authorized|not authorized|smtp/i.test(messageText);
	}

	function isAlreadyConfirmed(messageText: string, code = '') {
		return (
			code === 'email_exists' ||
			code === 'otp_disabled' ||
			/already confirmed|already verified|has been confirmed|has already been verified/i.test(messageText)
		);
	}

	function resetNotices() {
		errorMsg = '';
		message = '';
	}

	function clearCooldown() {
		if (cooldownTimer) {
			clearInterval(cooldownTimer);
			cooldownTimer = null;
		}
		resendCooldown = 0;
	}

	function startCooldown(seconds = 60) {
		resendCooldown = seconds;
		if (cooldownTimer) {
			clearInterval(cooldownTimer);
		}

		cooldownTimer = setInterval(() => {
			resendCooldown = Math.max(0, resendCooldown - 1);
			if (resendCooldown === 0 && cooldownTimer) {
				clearInterval(cooldownTimer);
				cooldownTimer = null;
			}
		}, 1000);
	}

	function ensureSupabaseConfigured() {
		if (!hasSupabaseConfig) {
			errorMsg =
				'Supabaseの環境変数が未設定か不正です。PUBLIC_SUPABASE_URL（http/https）と PUBLIC_SUPABASE_ANON_KEY を確認してください。';
			return false;
		}
		return true;
	}

	function ensureTurnstileReady() {
		if (!PUBLIC_TURNSTILE_SITE_KEY) {
			errorMsg = 'TurnstileのSite Keyが未設定です。PUBLIC_TURNSTILE_SITE_KEY を設定してください。';
			return false;
		}
		if (!turnstileReady) {
			errorMsg = 'CAPTCHAの初期化中です。少し待ってから再実行してください。';
			return false;
		}
		if (!turnstileToken) {
			errorMsg = 'CAPTCHA認証を完了してください。';
			return false;
		}
		return true;
	}

	function switchMode(nextMode: FormMode) {
		if (loading || activeMode === nextMode) return;
		activeMode = nextMode;
		resetNotices();
		canResend = false;
		lastEmailForResend = '';
		showTerms = false;
		showPrivacyPolicy = false;
		clearCooldown();
		password = '';
		confirmPassword = '';
		showPassword = false;
		showConfirm = false;
	}

	function toggleTerms() {
		const next = !showTerms;
		showTerms = next;
		if (next) {
			showPrivacyPolicy = false;
		}
	}

	function togglePrivacyPolicy() {
		const next = !showPrivacyPolicy;
		showPrivacyPolicy = next;
		if (next) {
			showTerms = false;
		}
	}

	async function joinWaitlistWithCaptcha(normalizedEmail: string, websiteUrl: string | null) {
		try {
			const response = await fetch('/api/waitlist/join', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: normalizedEmail,
					source: 'coming-soon',
					pagePath: $page.url.pathname,
					websiteUrl,
					turnstileToken
				})
			});

			const payload = (await response.json().catch(() => null)) as WaitlistApiResponse | null;
			if (!payload || payload.ok !== true) {
				const failed = (payload ?? {}) as { code?: string; message?: string; errorCodes?: string[] };
				return {
					ok: false as const,
					code: failed.code ?? 'WAITLIST_FAILED',
					message: failed.message ?? 'waitlist registration failed',
					errorCodes: failed.errorCodes ?? []
				};
			}

			return {
				ok: true as const,
				data: payload.data
			};
		} catch {
			return {
				ok: false as const,
				code: 'WAITLIST_NETWORK',
				message: 'network error',
				errorCodes: [] as string[]
			};
		}
	}

	async function fetchConfirmationStatus(_normalizedEmail: string): Promise<boolean | null> {
		return null;
	}

	async function sendSignupResend(normalizedEmail: string): Promise<{ outcome: ResendOutcome; message: string }> {
		const emailRedirectTo = getEmailRedirectTo();
		const { error } = await supabase.auth.resend(
			emailRedirectTo
				? {
						type: 'signup',
						email: normalizedEmail,
						options: { emailRedirectTo }
					}
				: {
						type: 'signup',
						email: normalizedEmail
					}
		);

		if (!error) {
			return { outcome: 'resent', message: '' };
		}

		const code = getErrorCode(error);
		const text = (error.message ?? '').toLowerCase();
		if (isRateLimited(text, code)) {
			return { outcome: 'rate_limited', message: error.message ?? '' };
		}
		if (isEmailNotAuthorizedByDefaultSmtp(text, code)) {
			return { outcome: 'smtp_blocked', message: error.message ?? '' };
		}
		if (isAlreadyConfirmed(text, code)) {
			return { outcome: 'already_confirmed', message: error.message ?? '' };
		}

		return { outcome: 'failed', message: error.message ?? '' };
	}

	async function handleExistingAccount(normalizedEmail: string) {
		const status = await fetchConfirmationStatus(normalizedEmail);
		if (status === true) {
			message = 'このメールアドレスは既に確認済みです。再送せずログインしてください。';
			canResend = false;
			lastEmailForResend = '';
			clearCooldown();
			return;
		}

		const resendResult = await sendSignupResend(normalizedEmail);
		if (resendResult.outcome === 'resent') {
			message = '未確認アカウントのため確認メールを再送しました。メールを確認してください。';
			canResend = true;
			lastEmailForResend = normalizedEmail;
			startCooldown(60);
			return;
		}

		if (resendResult.outcome === 'already_confirmed') {
			message = 'このメールアドレスは既に確認済みです。再送は不要です。ログインしてください。';
			canResend = false;
			lastEmailForResend = '';
			clearCooldown();
			return;
		}

		if (resendResult.outcome === 'rate_limited') {
			errorMsg = '送信回数が多すぎます。少し待ってから再試行してください。';
			canResend = true;
			lastEmailForResend = normalizedEmail;
			startCooldown(60);
			return;
		}

		if (resendResult.outcome === 'smtp_blocked') {
			errorMsg =
				'SupabaseのデフォルトSMTP制限でこの宛先に送れない可能性があります。Auth設定のSMTPと送信先制限を確認してください。';
			canResend = true;
			lastEmailForResend = normalizedEmail;
			return;
		}

		errorMsg = resendResult.message || '確認メールの再送に失敗しました。';
		canResend = true;
		lastEmailForResend = normalizedEmail;
	}

	async function resendConfirm() {
		resetNotices();

		if (!ensureSupabaseConfigured()) return;
		if (resendCooldown > 0) return;

		const normalizedEmail = normalizeEmail(lastEmailForResend || email);
		if (!isValidEmail(normalizedEmail)) {
			errorMsg = '有効なメールアドレスを入力してください。';
			return;
		}

		loading = true;
		try {
			const status = await fetchConfirmationStatus(normalizedEmail);
			if (status === true) {
				message = 'このメールアドレスは既に確認済みです。再送は不要です。ログインしてください。';
				canResend = false;
				lastEmailForResend = '';
				clearCooldown();
				return;
			}

			const resendResult = await sendSignupResend(normalizedEmail);
			if (resendResult.outcome === 'resent') {
				lastEmailForResend = normalizedEmail;
				message = '確認メールを再送しました。メール内のリンクから認証を完了してください。';
				canResend = true;
				startCooldown(60);
				return;
			}

			if (resendResult.outcome === 'already_confirmed') {
				message = 'このメールアドレスは既に確認済みです。再送は不要です。ログインしてください。';
				canResend = false;
				lastEmailForResend = '';
				clearCooldown();
				return;
			}

			if (resendResult.outcome === 'rate_limited') {
				errorMsg = '送信回数が多すぎます。少し待ってから再試行してください。';
				canResend = true;
				lastEmailForResend = normalizedEmail;
				startCooldown(60);
				return;
			}

			if (resendResult.outcome === 'smtp_blocked') {
				errorMsg =
					'SupabaseのデフォルトSMTP制限でこの宛先に送れない可能性があります。Auth設定のSMTPと送信先制限を確認してください。';
				canResend = true;
				lastEmailForResend = normalizedEmail;
				return;
			}

			errorMsg = resendResult.message || '確認メールの再送に失敗しました。';
			canResend = true;
			lastEmailForResend = normalizedEmail;
		} catch (error) {
			errorMsg = getErrorMessage(error, '確認メールの再送に失敗しました。');
		} finally {
			loading = false;
		}
	}

	async function submitLogin(normalizedEmail: string) {
		loading = true;

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email: normalizedEmail,
				password
			});

			if (error) {
				const msg = (error.message ?? '').toLowerCase();
				const code = getErrorCode(error);

				if (isEmailNotConfirmed(msg, code)) {
					errorMsg = 'メール認証が未完了です。確認メールを再送してからログインしてください。';
					canResend = true;
					lastEmailForResend = normalizedEmail;
					return;
				}

				if (isInvalidCredentials(msg, code)) {
					errorMsg = 'メールアドレスまたはパスワードが正しくありません。';
					return;
				}

				errorMsg = error.message || 'ログインに失敗しました。';
				return;
			}

			message = 'ログインしました。';
			canResend = false;
			lastEmailForResend = '';
			clearCooldown();
			password = '';
			showPassword = false;
		} catch (error) {
			errorMsg = getErrorMessage(error, 'ログインに失敗しました。');
		} finally {
			loading = false;
		}
	}

	async function submitSignUp(normalizedEmail: string) {
		loading = true;

		try {
			const emailRedirectTo = getEmailRedirectTo();
			const websiteUrl = normalizeOptional(siteUrl, 1024);
			// Password hashing is handled by Supabase Auth; this app never writes plaintext passwords to custom tables.
			const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
				email: normalizedEmail,
				password,
				options: {
					captchaToken: turnstileToken,
					...(emailRedirectTo ? { emailRedirectTo } : {}),
					...(websiteUrl ? { data: { website_url: websiteUrl } } : {})
				}
			});

			if (signUpError) {
				const msg = (signUpError.message ?? '').toLowerCase();
				const code = getErrorCode(signUpError);

				if (isAlreadyRegistered(msg, code)) {
					await handleExistingAccount(normalizedEmail);
					return;
				}

				if (isRateLimited(msg, code)) {
					errorMsg = '送信回数が多すぎます。少し待ってから再試行してください。';
					canResend = true;
					lastEmailForResend = normalizedEmail;
					startCooldown(60);
					return;
				}

				if (isEmailNotAuthorizedByDefaultSmtp(msg, code)) {
					errorMsg =
						'SupabaseのデフォルトSMTP制限でこの宛先に送れない可能性があります。Auth設定のSMTPと送信先制限を確認してください。';
					return;
				}

				errorMsg = signUpError.message || 'アカウント作成に失敗しました。';
				return;
			}

			const waitlistResult = await joinWaitlistWithCaptcha(normalizedEmail, websiteUrl);
			resetTurnstile();

			if (!waitlistResult.ok) {
				if (waitlistResult.code === 'CAPTCHA_FAILED') {
					message = 'アカウントは作成しましたが、CAPTCHA検証に失敗したためウェイトリスト登録は未完了です。';
				} else if (waitlistResult.code === 'CAPTCHA_REQUIRED') {
					message = 'アカウントは作成しましたが、CAPTCHA未入力のためウェイトリスト登録は未完了です。';
				} else if (waitlistResult.code === 'RATE_LIMITED') {
					message = 'Too many attempts. Please wait a minute and try again.';
				} else {
					message = 'アカウントは作成しました。ウェイトリスト登録のみ失敗したため、後で再試行してください。';
				}
				canResend = true;
				lastEmailForResend = normalizedEmail;
				password = '';
				confirmPassword = '';
				showPassword = false;
				showConfirm = false;
				return;
			}

			const waitlistCode = waitlistResult.data?.code ?? null;
			if (waitlistCode === 'FULL') {
				message = 'アカウントは作成しましたが、現在ウェイトリストは上限に達しています。';
			} else if (waitlistCode === 'INVALID') {
				message = 'アカウントは作成しましたが、ウェイトリスト情報に不正があり登録できませんでした。';
			} else {
				const looksLikeExistingUser =
					Array.isArray(signUpData.user?.identities) && signUpData.user.identities.length === 0;
				if (looksLikeExistingUser) {
					await handleExistingAccount(normalizedEmail);
					return;
				}
				message = 'アカウントを作成しました。確認メールのリンクから認証を完了してください。';
			}

			canResend = true;
			lastEmailForResend = normalizedEmail;
			password = '';
			confirmPassword = '';
			showPassword = false;
			showConfirm = false;
		} catch (error) {
			errorMsg = getErrorMessage(error, 'アカウント作成に失敗しました。');
		} finally {
			loading = false;
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		resetNotices();
		canResend = false;

		if (!ensureSupabaseConfigured()) return;

		const normalizedEmail = normalizeEmail(email);
		email = normalizedEmail;

		if (!isValidEmail(normalizedEmail)) {
			errorMsg = '有効なメールアドレスを入力してください。';
			return;
		}

		if (!password) {
			errorMsg = 'パスワードを入力してください。';
			return;
		}

		if (isLogin) {
			await submitLogin(normalizedEmail);
			return;
		}

		if (password.length < 8) {
			errorMsg = 'パスワードは8文字以上で入力してください。';
			return;
		}

		if (password !== confirmPassword) {
			errorMsg = '確認用パスワードが一致しません。';
			return;
		}

		if (!isValidWebsiteUrl(siteUrl)) {
			errorMsg = '自社サイトURLは http:// または https:// から始めてください。';
			return;
		}

		if (!agreed) {
			errorMsg = '利用規約とプライバシーポリシーへの同意が必要です。';
			return;
		}

		if (!ensureTurnstileReady()) {
			return;
		}

		await submitSignUp(normalizedEmail);
	}
</script>

<form class="signup-form" onsubmit={handleSubmit} aria-label={isLogin ? 'ログインフォーム' : 'サインアップフォーム'}>
	<h2>{isLogin ? 'ログイン' : '事前登録'}</h2>

	<div class="field-wrap required">
		<input
			type="email"
			bind:value={email}
			placeholder="メールアドレス"
			autocomplete="email"
			disabled={loading}
			required
		/>
	</div>

	<div class="field-wrap required">
		<input
			type={showPassword ? 'text' : 'password'}
			bind:value={password}
			placeholder={isLogin ? 'パスワード' : 'パスワード（8文字以上）'}
			autocomplete={isLogin ? 'current-password' : 'new-password'}
			disabled={loading}
			required
		/>
		<button
			class="toggle-eye"
			type="button"
			aria-label="パスワード表示切り替え"
			onclick={() => (showPassword = !showPassword)}
		>
			<img src={showPassword ? '/icons/PW_eye.svg' : '/icons/PW_eye_close.svg'} alt="" />
		</button>
	</div>

	{#if !isLogin}
		<div class="field-wrap required">
			<input
				type={showConfirm ? 'text' : 'password'}
				bind:value={confirmPassword}
				placeholder="確認用パスワード"
				autocomplete="new-password"
				disabled={loading}
				required
			/>
			<button
				class="toggle-eye"
				type="button"
				aria-label="確認用パスワード表示切り替え"
				onclick={() => (showConfirm = !showConfirm)}
			>
				<img src={showConfirm ? '/icons/PW_eye.svg' : '/icons/PW_eye_close.svg'} alt="" />
			</button>
		</div>

		<div class="field-wrap">
			<input
				type="url"
				bind:value={siteUrl}
				placeholder="自社サイトURL（任意）"
				autocomplete="url"
				disabled={loading}
			/>
		</div>

		<div class="turnstile-wrap">
			<div bind:this={turnstileContainer}></div>
		</div>
	{/if}

	{#if !isLogin}
		<section class="onboarding-legal" aria-label="登録前の確認事項">
			<p class="onboarding-title">登録前に利用規約とプライバシーポリシーをご確認ください。</p>
			<div class="legal-toggle-row">
				<button
					type="button"
					class="legal-toggle"
					aria-expanded={showTerms}
					onclick={toggleTerms}
				>
					{showTerms ? '利用規約を閉じる' : '利用規約を読む'}
				</button>
				<button
					type="button"
					class="legal-toggle"
					aria-expanded={showPrivacyPolicy}
					onclick={togglePrivacyPolicy}
				>
					{showPrivacyPolicy ? 'プライバシーポリシーを閉じる' : 'プライバシーポリシーを読む'}
				</button>
			</div>

			{#if showTerms}
				<div class="legal-panel" role="region" aria-label="利用規約全文">
					<h3>利用規約</h3>
					<pre class="legal-text">{termsText}</pre>
				</div>
			{/if}

			{#if showPrivacyPolicy}
				<div class="legal-panel" role="region" aria-label="プライバシーポリシー全文">
					<h3>プライバシーポリシー</h3>
					<pre class="legal-text">{privacyPolicyText}</pre>
				</div>
			{/if}
		</section>
	{/if}

	<div class="helper-row">
		{#if isLogin}
			<a class="forgot-link" href="/">パスワードをお忘れですか？</a>
		{:else}
			<label>
				<input type="checkbox" bind:checked={agreed} disabled={loading} />
				利用規約とプライバシーポリシーに同意する
			</label>
		{/if}
	</div>

	{#if errorMsg}
		<p class="msg err">{errorMsg}</p>
	{/if}

	{#if message}
		<p class="msg ok">{message}</p>
	{/if}

	{#if canResend}
		<div class="resend-row">
			<button type="button" class="resend-btn" onclick={resendConfirm} disabled={loading || resendCooldown > 0}>
				{#if loading}
					送信中...
				{:else if resendCooldown > 0}
					{resendCooldown}秒後に再送できます
				{:else}
					確認メールを再送
				{/if}
			</button>
		</div>
	{/if}

	<SignUpBtn
		type="submit"
		label={loading ? (isLogin ? 'ログイン中...' : '登録中...') : (isLogin ? 'ログインする' : '登録する')}
		disabled={loading}
	/>

	<div class="switch-row">
		{#if isLogin}
			<button type="button" class="switch-btn" onclick={() => switchMode('signup')} disabled={loading}>
				初めての方はこちら（新規登録）
			</button>
		{:else}
			<button type="button" class="switch-btn" onclick={() => switchMode('login')} disabled={loading}>
				すでにアカウントをお持ちの方（ログイン）
			</button>
		{/if}
	</div>
</form>

<style>
	.signup-form {
		width: min(420px, 100%);
		display: grid;
		gap: 12px;
	}

	h2 {
		margin: 0 0 8px;
		font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
		font-size: 30px;
		font-weight: 500;
		letter-spacing: 0.08em;
		color: #2e2b38;
	}

	.field-wrap {
		position: relative;
	}

	.field-wrap.required::after {
		content: '*';
		position: absolute;
		top:24%;
		right: 16px;
		transform: translateY(-50%);
		font-size: 18px;
		color: #ff7a18;
		pointer-events: none;
	}

	input {
		box-sizing: border-box;
		width: 100%;
		height: 48px;
		border: 1px solid rgba(117, 109, 146, 0.24);
		border-radius: 999px;
		padding: 0 52px 0 18px;
		background: rgba(255, 255, 255, 0.95);
		color: #2d2d33;
		font-size: 14px;
		font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
	}

	input::placeholder {
		color: #9a98a8;
	}

	input:focus-visible {
		outline: 2px solid rgba(106, 92, 255, 0.5);
		outline-offset: 1px;
	}

	input:disabled {
		opacity: 0.75;
	}

	.toggle-eye {
		position: absolute;
		top: 50%;
		right: 12px;
		transform: translateY(-50%);
		border: 0;
		background: transparent;
		padding: 0;
		width: 24px;
		height: 24px;
		display: grid;
		place-items: center;
	}

	.toggle-eye img {
		width: 18px;
		height: 18px;
	}

	.turnstile-wrap {
		display: flex;
		justify-content: center;
		margin-top: 2px;
	}

	.onboarding-legal {
		display: grid;
		gap: 8px;
		padding: 10px 12px;
		border-radius: 12px;
		justify-content: center;
	}

	.onboarding-title {
		display: flex;
		justify-content: center;
		margin: 0;
		font-size: 12px;
		line-height: 1.5;
		color: #4e4a61;
	}

	.legal-toggle-row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.legal-toggle {
		border: 1px solid rgba(106, 92, 255, 0.32);
		border-radius: 999px;
		padding: 6px 11px;
		font-size: 12px;
		font-weight: 300;
		background: rgba(106, 92, 255, 0.08);
		color: #ffffff;
	}

	.legal-panel {
		border: 1px solid rgba(117, 109, 146, 0.2);
		border-radius: 10px;
		padding: 10px;
		background: rgba(255, 255, 255, 0.95);
		max-height: 180px;
		overflow: auto;
	}

	.legal-panel h3 {
		margin: 0 0 8px;
		font-size: 13px;
		color: #2f2c3d;
	}

	.legal-text {
		margin: 0;
		white-space: pre-wrap;
		font-size: 12px;
		line-height: 1.6;
		color: #38344b;
	}

	.helper-row {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: -2px;
		font-size: 13px;
		color: #5d5a6d;
	}

	.helper-row label {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.helper-row input[type='checkbox'] {
		width: 18px;
		height: 18px;
		padding: 0;
	}

	.forgot-link {
		color: #5d5a6d;
		text-decoration: none;
	}

	.forgot-link:hover {
		text-decoration: underline;
	}

	.msg {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
	}

	.msg.err {
		color: #d34900;
	}

	.msg.ok {
		color: #245e35;
	}

	.resend-row {
		display: flex;
		justify-content: flex-end;
	}

	.resend-btn {
		border: 1px solid rgba(106, 92, 255, 0.35);
		background: rgba(106, 92, 255, 0.1);
		color: #2f2b45;
		border-radius: 999px;
		padding: 8px 12px;
		font-size: 12px;
	}

	.resend-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.switch-row {
		display: flex;
		justify-content: center;
	}

	.switch-btn {
		border: 0;
		background: transparent;
		color: #4d4961;
		font-size: 13px;
		text-decoration: underline;
	}

	.switch-btn:disabled {
		opacity: 0.6;
		text-decoration: none;
	}
</style>
