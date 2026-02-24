<script>
	import { page } from '$app/stores';
	import favicon from '$lib/assets/favicon.svg';
	import Logo from '$lib/components/Logo.svelte';
	import LaunchData from '$lib/components/LaunchData.svelte';
	import PreRegister from '$lib/components/PreRegister.svelte';
	let { children } = $props();

	import '../app.css';

	function normalizePath(pathname) {
		if (!pathname) return '/';
		if (pathname === '/') return '/';
		return pathname.replace(/\/+$/, '') || '/';
	}

	const currentPath = $derived(normalizePath($page.url.pathname));
	const isAppRoute = $derived(currentPath === '/app' || currentPath.startsWith('/app/'));

</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="launch-page">
	<Logo />
	<LaunchData />
	<PreRegister />
</div>

{@render children()}

<style>
.launch-page {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100dvh;

  background: linear-gradient(
    135deg,
    #471b00,
    #030027
  );

  background-size: 200% 200%;
animation: diagonalFlow 14s ease-in-out infinite alternate;
}

@keyframes diagonalFlow {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}
</style>
