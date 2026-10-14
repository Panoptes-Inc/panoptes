import type { SurveyQuestionId } from '../types';

const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusFirstSurveyError(form: HTMLFormElement | null, questionId: SurveyQuestionId | null): void {
	if (!form || !questionId) return;
	form.querySelector<HTMLElement>(`[data-survey-question="${questionId}"]`)?.focus();
}

export function trapSurveyDialogFocus(event: KeyboardEvent, dialog: HTMLElement): void {
	if (event.key !== 'Tab') return;
	const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
	if (focusable.length === 0) {
		event.preventDefault();
		dialog.focus();
		return;
	}
	const first = focusable[0];
	const last = focusable[focusable.length - 1];
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}
