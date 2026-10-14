<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { env as publicEnv } from '$env/dynamic/public';
	import SignUpBtn from '$lib/components/ComponentsBase/SignUpBtn.svelte';
	import SignUpFeedback from '$lib/features/auth/signup/components/SignUpFeedback.svelte';
	import SignUpFields from '$lib/features/auth/signup/components/SignUpFields.svelte';
	import TermsAgreement from '$lib/features/auth/signup/components/TermsAgreement.svelte';
	import TurnstileField from '$lib/features/auth/signup/components/TurnstileField.svelte';
	import { createSignUpController } from '$lib/features/auth/signup/state/signup-controller.svelte';
	import type { SignUpFormMode } from '$lib/features/auth/signup/types';
	import { focusInvalidSignUpField } from '$lib/features/auth/signup/utils/signup-focus';
	import { browserOrigin } from '$lib/features/auth/signup/utils/safe-signup-redirect';

	let { mode = 'signup' }: { mode?: SignUpFormMode } = $props();
	let formElement: HTMLFormElement | null = $state(null);
	let activeMode = $state<SignUpFormMode>(untrack(() => mode));
	const turnstileSiteKey = publicEnv.PUBLIC_TURNSTILE_SITE_KEY ?? '';
	const controller = createSignUpController({
		mode: untrack(() => mode),
		turnstileSiteKey,
		pagePath: () => $page.url.pathname,
		returnTo: () => $page.url.searchParams.get('returnTo'),
		origin: browserOrigin,
		navigate: async (path) => {
			await goto(resolve(path as '/'), { invalidateAll: true });
		}
	});
	const formState = controller.state;
	const isLogin = $derived(activeMode === 'login');

	$effect(() => {
		const nextMode = mode === 'login' ? 'login' : 'signup';
		if (nextMode !== untrack(() => activeMode)) {
			activeMode = nextMode;
			untrack(() => formState.setMode(nextMode));
		}
	});
	onDestroy(controller.destroy);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		await controller.submit();
		focusInvalidSignUpField(formElement, formState.invalidField);
	}

	function switchMode(nextMode: SignUpFormMode) {
		if (formState.loading) return;
		formState.setMode(nextMode);
		activeMode = nextMode;
	}
</script>

<form
	bind:this={formElement}
	class="signup-form"
	onsubmit={handleSubmit}
	aria-label={isLogin ? 'ログインフォーム' : 'サインアップフォーム'}
	aria-busy={formState.loading}
>
	<h2>{isLogin ? 'ログイン' : '事前登録'}</h2>

	<SignUpFields
		{isLogin}
		bind:email={formState.email}
		bind:password={formState.password}
		bind:confirmPassword={formState.confirmPassword}
		bind:siteUrl={formState.siteUrl}
		bind:showPassword={formState.showPassword}
		bind:showConfirm={formState.showConfirm}
		disabled={formState.loading}
		errors={formState.fieldErrors}
	/>

	{#if !isLogin}
		<TurnstileField
			siteKey={turnstileSiteKey}
			resetKey={formState.turnstileResetKey}
			describedBy={formState.fieldErrors.turnstile ? 'signup-turnstile-error' : undefined}
			onToken={(token) => (formState.turnstileToken = token)}
			onReady={(ready) => (formState.turnstileReady = ready)}
		/>
		<TermsAgreement
			bind:agreed={formState.agreed}
			bind:showTerms={formState.showTerms}
			bind:showPrivacyPolicy={formState.showPrivacyPolicy}
			disabled={formState.loading}
			invalid={Boolean(formState.fieldErrors.agreed)}
		/>
	{:else}
		<div class="helper-row">
			<a class="forgot-link" href={resolve('/')}>パスワードをお忘れですか？</a>
		</div>
	{/if}

	<SignUpFeedback
		errorMessage={formState.errorMessage}
		message={formState.message}
		fieldErrors={formState.fieldErrors}
		canResend={formState.canResend}
		loading={formState.loading}
		resendCooldown={formState.resendCooldown}
		onResend={() => void controller.resend()}
	/>

	<SignUpBtn
		type="submit"
		label={formState.loading
			? isLogin
				? 'ログイン中...'
				: '登録中...'
			: isLogin
				? 'ログインする'
				: '登録する'}
		disabled={formState.loading}
	/>

	<div class="switch-row">
		<button
			type="button"
			class="switch-btn"
			onclick={() => switchMode(isLogin ? 'signup' : 'login')}
			disabled={formState.loading}
		>
			{isLogin
				? '初めての方はこちら（新規登録）'
				: 'すでにアカウントをお持ちの方（ログイン）'}
		</button>
	</div>
</form>

<style>
	.signup-form { width: min(420px, 100%); display: grid; gap: 12px; }
	h2 { margin: 0 0 8px; font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; font-size: 30px; font-weight: 500; letter-spacing: 0.08em; color: #2e2b38; }
	.helper-row { display: flex; align-items: center; justify-content: center; margin-top: -2px; font-size: 13px; color: #5d5a6d; }
	.forgot-link { color: #5d5a6d; text-decoration: none; }
	.forgot-link:hover { text-decoration: underline; }
	.switch-row { display: flex; justify-content: center; }
	.switch-btn { border: 0; background: transparent; color: #4d4961; font-size: 13px; text-decoration: underline; }
	.switch-btn:disabled { opacity: 0.6; text-decoration: none; }
</style>
