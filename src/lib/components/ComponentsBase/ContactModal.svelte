<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import ContactForm from '$lib/features/contact/components/ContactForm.svelte';
	import ContactModalFrame from '$lib/features/contact/components/ContactModalFrame.svelte';
	import { createContactController } from '$lib/features/contact/state/contact-controller';
	import type { ContactSubmitter } from '$lib/features/contact/types';

	let { open = $bindable(false), onSubmit }: { open?: boolean; onSubmit?: ContactSubmitter } = $props();
	const controller = createContactController();
	let snapshot = $state(controller.snapshot);

	$effect(() => controller.setSubmitter(onSubmit));
	onMount(() => controller.subscribe((nextSnapshot) => (snapshot = nextSnapshot)));
	onDestroy(controller.destroy);
</script>

{#if open}
	<ContactModalFrame onClose={() => (open = false)}>
		<ContactForm {snapshot} onField={controller.setField} onSubmit={controller.submit} />
	</ContactModalFrame>
{/if}
