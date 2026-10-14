<script lang="ts">
	import type { SurveyFieldErrors } from '../types';
	let { errorMessage, successMessage, fieldErrors }: { errorMessage: string; successMessage: string; fieldErrors: SurveyFieldErrors } = $props();
</script>

{#each Object.entries(fieldErrors) as [questionId, error] (questionId)}
	<span class="sr-only" id={`survey-${questionId}-error`}>{error}</span>
{/each}
{#if errorMessage}<p class="notice error" role="alert">{errorMessage}</p>{/if}
{#if successMessage}<p class="notice success" role="status">{successMessage}</p>{/if}

<style>
	.notice { margin: 0; font-size: 13px; line-height: 1.5; }
	.notice.error { color: #c43030; }
	.notice.success { color: #2f7f52; }
	.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
