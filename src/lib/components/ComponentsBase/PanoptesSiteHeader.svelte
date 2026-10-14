<script lang="ts">
	import { page } from '$app/stores';
	import ContactModal from './ContactModal.svelte';
	import SurveyModal from './SurveyModal.svelte';

	let { authenticated = false }: { authenticated?: boolean } = $props();

	const aboutLabel = '\u30d1\u30ce\u30d7\u30c6\u30b9\u306b\u3064\u3044\u3066';
	const appTopLabel = '\u30a2\u30d7\u30eaTOP';
	const surveyLabel = '\u30a2\u30f3\u30b1\u30fc\u30c8';
	const contactLabel = '\u304a\u554f\u3044\u5408\u308f\u305b';
	const shareLabel = 'QR\u30b3\u30fc\u30c9\u3067\u30a2\u30d7\u30ea\u3092\u5171\u6709';
	const loginLabel = '\u30ed\u30b0\u30a4\u30f3';

	let isSurveyModalOpen = $state(false);
	let isContactModalOpen = $state(false);

	function normalizePath(pathname: string | null | undefined): string {
		if (!pathname) return '/';
		if (pathname === '/') return '/';
		return pathname.replace(/\/+$/, '') || '/';
	}

	const currentPath = $derived(normalizePath($page.url.pathname));

	function openSurveyModal(event: MouseEvent): void {
		event.preventDefault();
		isContactModalOpen = false;
		isSurveyModalOpen = true;
	}

	function openContactModal(event: MouseEvent): void {
		event.preventDefault();
		isSurveyModalOpen = false;
		isContactModalOpen = true;
	}
</script>

<header class="header">
	<div class="logo-area">
		<img src="/logo/panoptes-logo.svg" alt="Panoptes" class="app-logo" />
	</div>

	<div class="header-right">
		<nav class="header-menu" aria-label="global navigation">
			<a href="/" class:active={currentPath === '/'}>{aboutLabel}</a>
			<a href="/app" class:active={currentPath === '/app'}>{appTopLabel}</a>
			<a
				href="/app/survey"
				class:active={currentPath.startsWith('/app/survey')}
				aria-expanded={isSurveyModalOpen}
				onclick={openSurveyModal}
			>
				{surveyLabel}
			</a>
			<a
				href="/app/contact"
				class:active={currentPath.startsWith('/app/contact')}
				aria-expanded={isContactModalOpen}
				onclick={openContactModal}
			>
				{contactLabel}
			</a>
			<a href="/app/share" class:active={currentPath.startsWith('/app/share')}>{shareLabel}</a>
		</nav>

		{#if authenticated}
			<form method="POST" action="/auth/logout" class="auth-action">
				<button class="login-button" type="submit" aria-label="ログアウト" title="ログアウト">
					<img src="/icons/Login.svg" alt="" class="login-icon" />
					<span class="sr-only">ログアウト</span>
				</button>
			</form>
		{:else}
			<a class="login-button" href="/login" aria-label={loginLabel} title={loginLabel}>
				<img src="/icons/Login.svg" alt="" class="login-icon" />
				<span class="sr-only">{loginLabel}</span>
			</a>
		{/if}
	</div>
</header>

<SurveyModal bind:open={isSurveyModalOpen} />
<ContactModal bind:open={isContactModalOpen} />

<style>
	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 10px 16px;
		gap: 18px;
		min-height: 62px;
	}

	.logo-area {
		flex: 0 0 auto;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-left: auto;
		min-width: 0;
	}

	.header-menu {
		display: flex;
		gap: 32px;
		align-items: center;
		min-height: 48px;
		padding: 8px 48px;
		border-radius: 999px;
		position: relative;
		z-index: 0;
		isolation: isolate;
	}

	.header-menu::before,
	.header-menu::after {
		content: '';
		position: absolute;
		border-radius: inherit;
		z-index: -1;
	}

	.header-menu::before {
		inset: 0;
		background: linear-gradient(45deg, #564aff, #ff6200, #bcb7ff, #ff6200, #564aff);
		background-size: 400% 100%;
		background-position: 0% 50%;
		animation: glow 24s linear infinite;
	}

	.header-menu::after {
		inset: 2px;
		background-color: #fff;
	}

	@keyframes glow {
		0% {
			background-position: 0% 50%;
		}

		50% {
			background-position: 100% 50%;
		}

		100% {
			background-position: 0% 50%;
		}
	}

	.header-menu a {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 8px 16px;
		border-radius: 99px;
		text-decoration: none;
		font-size: 12px;
		white-space: nowrap;
		color: #2d2d2d;
		background: transparent;
		outline: none;
		z-index: 0;
		isolation: isolate;
		pointer-events: auto;
		transition:
			background 0.2s ease,
			color 0.15s ease,
			box-shadow 0.2s ease,
			transform 0.2s ease;
	}

	.header-menu a.active {
		background: linear-gradient(90deg, #dedbff, #edebff);
		color: #5a4eff;
	}

	.header-menu a:focus-visible:not(:hover)::before {
		content: '';
		position: absolute;
		inset: -4px;
		border-radius: inherit;
		background: linear-gradient(45deg, #564aff, #ff6200, #bcb7ff, #ff6200, #564aff);
		background-size: 300% 300%;
		animation: glow 12s linear infinite;
		padding: 2px;
		-webkit-mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		-webkit-mask-composite: xor;
		mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		mask-composite: exclude;
		z-index: -1;
		pointer-events: none;
	}

	.header-menu a:hover,
	.header-menu a:focus-visible:hover,
	.header-menu a.active:hover,
	.header-menu a.active:focus-visible:hover {
		background: linear-gradient(90deg, #564aff, #8b83ff);
		color: #fff;
	}

	.login-button {
		--ring: 2px;

		width: 88px;
		height: 40px;
		border-radius: 999px;
		position: relative;
		display: grid;
		place-items: center;
		text-decoration: none;
		isolation: isolate;
		pointer-events: auto;
		background: linear-gradient(135deg, #ff8d2f, #ff6200);
		box-shadow: 0 6px 18px rgba(255, 98, 0, 0.24);
		border: 0;
		cursor: pointer;
	}

	.auth-action {
		margin: 0;
	}

	.login-button::before {
		content: '';
		position: absolute;
		inset: calc(-1 * var(--ring));
		border-radius: inherit;
		background: linear-gradient(45deg, #564aff, #ff6200, #bcb7ff, #ff6200, #564aff);
		background-size: 300% 300%;
		background-position: 0% 50%;
		animation: glow 12s linear infinite;
		padding: var(--ring);
		-webkit-mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		-webkit-mask-composite: xor;
		mask:
			linear-gradient(#000 0 0) content-box,
			linear-gradient(#000 0 0);
		mask-composite: exclude;
		z-index: -1;
		pointer-events: none;
	}

	.login-button:hover {
		filter: brightness(1.04);
		transform: translateY(-1px);
	}

	.login-button:focus-visible {
		outline: none;
		box-shadow:
			0 0 0 3px rgba(86, 74, 255, 0.18),
			0 6px 18px rgba(255, 98, 0, 0.24);
	}

	.login-icon {
		width: 24px;
		height: 24px;
		display: block;
	}

	.app-logo {
		height: 46px;
		display: block;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 1280px) {
		.header-menu {
			gap: 22px;
			padding: 4px 30px;
		}

		.header-menu a {
			font-size: 11px;
			padding: 7px 12px;
		}
	}

	@media (max-width: 980px) {
		.header-menu a:nth-child(n + 5) {
			display: none;
		}

		.header-menu {
			gap: 14px;
			padding: 4px 20px;
		}
	}
</style>
