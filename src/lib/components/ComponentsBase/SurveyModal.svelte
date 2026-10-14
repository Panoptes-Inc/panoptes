<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import SurveyForm from '$lib/features/survey/components/SurveyForm.svelte';
	import SurveyModalFrame from '$lib/features/survey/components/SurveyModalFrame.svelte';
	import { createSurveyController } from '$lib/features/survey/state/survey-controller';
	import type { SurveySubmitter } from '$lib/features/survey/types';

	let { open = $bindable(false), onSubmit }: { open?: boolean; onSubmit?: SurveySubmitter } = $props();
	const controller = createSurveyController();
	let snapshot = $state(controller.snapshot);

	$effect(() => controller.setSubmitter(onSubmit));
	onMount(() => controller.subscribe((nextSnapshot) => (snapshot = nextSnapshot)));
	onDestroy(controller.destroy);

	function closeModal() {
		open = false;
	}
</script>

{#if open}
	<SurveyModalFrame onClose={closeModal}>
		<SurveyForm
			{snapshot}
			onAnswer={controller.setAnswer}
			onSubmit={controller.submit}
		/>
	</SurveyModalFrame>
{/if}
