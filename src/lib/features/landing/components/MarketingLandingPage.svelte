<script lang="ts">
	import LandingHeroPrimarySection from '$lib/components/ComponentsBase/LandingHeroPrimarySection.svelte';
	import LandingHeroSecondarySection from '$lib/components/ComponentsBase/LandingHeroSecondarySection.svelte';
	import PanoptesSiteHeader from '$lib/components/ComponentsBase/PanoptesSiteHeader.svelte';

	let { authenticated = false }: { authenticated?: boolean } = $props();
</script>

<PanoptesSiteHeader {authenticated} />
<LandingHeroPrimarySection />
<LandingHeroSecondarySection />

