<script lang="ts">
	import type { SurveyAnswerValue, SurveyAnswers, SurveyFieldErrors, SurveyQuestion, SurveyQuestionId } from '../types';

	let { questions, answers, errors, disabled, onAnswer }: {
		questions: readonly SurveyQuestion[];
		answers: SurveyAnswers;
		errors: SurveyFieldErrors;
		disabled: boolean;
		onAnswer: (questionId: SurveyQuestionId, value: SurveyAnswerValue) => void;
	} = $props();

	function stringValue(questionId: SurveyQuestionId): string {
		const value = answers[questionId];
		return typeof value === 'string' ? value : '';
	}

	function arrayValue(questionId: SurveyQuestionId): string[] {
		const value = answers[questionId];
		return Array.isArray(value) ? value : [];
	}

	function toggleMultiple(questionId: SurveyQuestionId, option: string, checked: boolean) {
		const values = arrayValue(questionId);
		onAnswer(questionId, checked ? [...values, option] : values.filter((value) => value !== option));
	}
</script>

{#each questions as question (question.id)}
	{#if question.type === 'single_choice'}
		<label class="field" for={`survey-${question.id}`}>
			<span>{question.title}</span>
			<select id={`survey-${question.id}`} data-survey-question={question.id} value={stringValue(question.id)} onchange={(event) => onAnswer(question.id, event.currentTarget.value)} {disabled} required={question.required} aria-invalid={Boolean(errors[question.id])} aria-describedby={errors[question.id] ? `survey-${question.id}-error` : undefined}>
				<option value="">選択してください</option>
				{#each question.options as option (option.value)}<option value={option.value}>{option.label}</option>{/each}
			</select>
		</label>
	{:else if question.type === 'multiple_choice'}
		<fieldset class="field" aria-describedby={errors[question.id] ? `survey-${question.id}-error` : undefined}>
			<legend>{question.title}</legend>
			{#each question.options as option (option.value)}
				<label class="choice"><input data-survey-question={question.id} type="checkbox" checked={arrayValue(question.id).includes(option.value)} onchange={(event) => toggleMultiple(question.id, option.value, event.currentTarget.checked)} {disabled} />{option.label}</label>
			{/each}
		</fieldset>
	{:else}
		<label class="field" for={`survey-${question.id}`}>
			<span>{question.title}</span>
			{#if 'multiline' in question && question.multiline}
				<textarea id={`survey-${question.id}`} data-survey-question={question.id} value={stringValue(question.id)} placeholder={'placeholder' in question ? question.placeholder : undefined} oninput={(event) => onAnswer(question.id, event.currentTarget.value)} {disabled} required={question.required} aria-invalid={Boolean(errors[question.id])} aria-describedby={errors[question.id] ? `survey-${question.id}-error` : undefined}></textarea>
			{:else}
				<input id={`survey-${question.id}`} data-survey-question={question.id} type={question.type === 'email' ? 'email' : 'text'} value={stringValue(question.id)} placeholder={'placeholder' in question ? question.placeholder : undefined} autocomplete={question.type === 'email' ? 'email' : undefined} oninput={(event) => onAnswer(question.id, event.currentTarget.value)} {disabled} required={question.required} aria-invalid={Boolean(errors[question.id])} aria-describedby={errors[question.id] ? `survey-${question.id}-error` : undefined} />
			{/if}
		</label>
	{/if}
{/each}

<style>
	.field { display: flex; flex-direction: column; gap: 8px; border: 0; padding: 0; margin: 0; }
	.field > span, legend { color: #423f50; font-size: 12px; font-weight: 700; }
	input, select, textarea { box-sizing: border-box; width: 100%; border: 1px solid rgba(117, 109, 146, 0.35); border-radius: 8px; background: rgba(255, 255, 255, 0.96); color: #2d2d33; font-size: 14px; font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; }
	input, select { padding: 8px 12px; min-height: 50px; }
	textarea { min-height: 120px; padding: 8px 12px; border-radius: 8px; resize: vertical; }
	input::placeholder, textarea::placeholder { color: #9a98a8; font-size: 12px; }
	input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid rgba(106, 92, 255, 0.45); outline-offset: 1px; }
	.choice { display: flex; align-items: center; gap: 8px; }
	.choice input { width: 18px; min-height: 18px; }
	@media (max-width: 560px) { input, select { height: 46px; } textarea { min-height: 150px; } }
</style>
