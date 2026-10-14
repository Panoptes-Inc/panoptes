<script>
	import { page } from '$app/stores';
	import favicon from '$lib/assets/favicon.svg';
	import PanoptesSiteHeader from '$lib/components/ComponentsBase/PanoptesSiteHeader.svelte';
	import PanoptesTopHero from '$lib/components/ComponentsBase/top/hero/PanoptesTopHero.svelte';

	function normalizePath(pathname) {
		if (!pathname) return '/';
		if (pathname === '/') return '/';
		return pathname.replace(/\/+$/, '') || '/';
	}

	let { children, data } = $props();
	const currentPath = $derived(normalizePath($page.url.pathname));
	const isTopPage = $derived(currentPath === '/app');
	const isAboutPage = $derived(currentPath.startsWith('/app/about'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="app-header">
	<PanoptesSiteHeader authenticated={data.authenticated} />
</div>

<main class="app-main" class:about-page={isAboutPage}>
	<div class="app-shell" class:about-shell={isAboutPage}>
		{#if isTopPage}
			<PanoptesTopHero />
		{/if}

		{@render children()}
	</div>
</main>

<style>
	.app-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 79;
	}

	.app-main {
		min-height: 100dvh;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		height: auto;
		padding-top: 88px;
		padding-bottom: 40px;
		padding-inline: 0;
	}

	.app-main.about-page {
		min-height: auto;
		height: auto;
	}

	.app-shell {
		width: min(1680px, 100%);
		display: flex;
		flex-flow: column;
		gap: 40px;
	}

	.app-shell.about-shell {
		width: 100%;
		max-width: none;
		gap: 0;
	}

	@media (max-width: 720px) {
		.app-main {
			padding-top: 80px;
			padding-bottom: 24px;
		}
	}
</style>
