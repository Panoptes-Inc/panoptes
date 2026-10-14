<script>
	import MarketingLandingPage from '$lib/features/landing/components/MarketingLandingPage.svelte';

	let { data } = $props();
</script>

<MarketingLandingPage authenticated={data.authenticated} />
