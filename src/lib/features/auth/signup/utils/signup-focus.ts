import type { SignUpField } from '../types';

export function focusInvalidSignUpField(form: HTMLFormElement | null, field: SignUpField | null): void {
	if (!form || !field || field === 'turnstile') return;
	form.querySelector<HTMLElement>(`[data-signup-field="${field}"]`)?.focus();
}
