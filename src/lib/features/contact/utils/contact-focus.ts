import type { ContactField } from '../types';

const focusableSelector = 'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function focusFirstContactError(form: HTMLFormElement | null, field: ContactField | null): void {
	if (!form || !field) return;
	form.querySelector<HTMLElement>(`[data-contact-field="${field}"]`)?.focus();
}

export function trapContactDialogFocus(event: KeyboardEvent, dialog: HTMLElement): void {
	if (event.key !== 'Tab') return;
	const focusable = [...dialog.querySelectorAll<HTMLElement>(focusableSelector)].filter(
		(element) => !element.hasAttribute('hidden') && element.getClientRects().length > 0
	);
	if (focusable.length === 0) {
		event.preventDefault();
		dialog.focus();
		return;
	}
	const first = focusable[0];
	const last = focusable.at(-1)!;
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
	} else if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}
