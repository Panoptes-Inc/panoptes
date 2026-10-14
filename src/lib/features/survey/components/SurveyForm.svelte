<script lang="ts">
	import { surveyQuestions } from '../schema/survey-questions';
	import type { SurveyAnswerValue, SurveyQuestionId, SurveySnapshot } from '../types';
	import { focusFirstSurveyError } from '../utils/survey-focus';
	import SurveyFeedback from './SurveyFeedback.svelte';
	import SurveyNavigation from './SurveyNavigation.svelte';
	import SurveyQuestionList from './SurveyQuestionList.svelte';

	let { snapshot, onAnswer, onSubmit }: {
		snapshot: SurveySnapshot;
		onAnswer: (questionId: SurveyQuestionId, value: SurveyAnswerValue) => void;
		onSubmit: () => Promise<{ ok: boolean; firstInvalidQuestion: SurveyQuestionId | null }>;
	} = $props();
	let form: HTMLFormElement | null = $state(null);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		const result = await onSubmit();
		focusFirstSurveyError(form, result.firstInvalidQuestion);
	}
</script>

<form bind:this={form} class="survey-form" onsubmit={submit} aria-busy={snapshot.status === 'submitting'} novalidate>
	<SurveyQuestionList questions={surveyQuestions} answers={snapshot.answers} errors={snapshot.fieldErrors} disabled={snapshot.status === 'submitting'} {onAnswer} />
	<SurveyFeedback errorMessage={snapshot.errorMessage} successMessage={snapshot.successMessage} fieldErrors={snapshot.fieldErrors} />
	<SurveyNavigation submitting={snapshot.status === 'submitting'} canSubmit={snapshot.canSubmit} />
</form>

<style>
	.survey-form { display: grid; gap: 14px; }
</style>
