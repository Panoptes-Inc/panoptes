<script lang="ts">
	import { page } from '$app/stores';
	import { SignUpForm } from '$lib/features/auth/signup';

	const callbackFailed = $derived($page.url.searchParams.get('error') === 'callback_failed');
	const signedOut = $derived($page.url.searchParams.get('message') === 'signed_out');
</script>

<svelte:head>
	<title>ログイン | Panoptes</title>
</svelte:head>

<main class="auth-page">
	<section class="auth-card" aria-labelledby="login-heading">
		<h1 id="login-heading">Panoptesへログイン</h1>
		{#if callbackFailed}
			<p class="auth-notice error">認証を完了できませんでした。もう一度ログインしてください。</p>
		{:else if signedOut}
			<p class="auth-notice">ログアウトしました。</p>
		{/if}
		<SignUpForm mode="login" />
	</section>
</main>

<style>
	.auth-page {
		min-height: 100dvh;
		display: grid;
		place-items: center;
		padding: 96px 20px 40px;
		background: #f5f5f8;
	}

	.auth-card {
		width: min(100%, 560px);
	}

	.auth-card h1 {
		margin: 0 0 20px;
		text-align: center;
		font-size: 24px;
		color: #24242d;
	}

	.auth-notice {
		margin: 0 0 16px;
		padding: 10px 12px;
		border-radius: 8px;
		background: #eef8f1;
		color: #245f35;
		font-size: 14px;
	}

	.auth-notice.error {
		background: #fff0f0;
		color: #9b2c2c;
	}
</style>
