import { submitContact } from '../services/contact-service';
import type {
	ContactField,
	ContactSnapshot,
	ContactStatus,
	ContactSubmitter,
	ContactValues
} from '../types';
import { validateContact } from '../validation/contact-validation';

export const contactSuccessMessage = '送信しました。担当者よりご連絡します。';
export const contactFailureMessage = '送信に失敗しました。時間をおいて再度お試しください。';

export function createContactController(initialSubmitter?: ContactSubmitter) {
	let values: ContactValues = { name: '', email: '', company: '', message: '' };
	let status: ContactStatus = 'idle';
	let fieldErrors: ContactSnapshot['fieldErrors'] = {};
	let errorMessage = '';
	let successMessage = '';
	let submitter = initialSubmitter;
	let destroyed = false;
	const listeners = new Set<(snapshot: ContactSnapshot) => void>();

	function currentSnapshot(): ContactSnapshot {
		return {
			values: { ...values },
			fieldErrors: { ...fieldErrors },
			status,
			errorMessage,
			successMessage,
			canSubmit: status !== 'submitting'
		};
	}

	function notify() {
		if (destroyed) return;
		const next = currentSnapshot();
		for (const listener of listeners) listener(next);
	}

	function subscribe(listener: (snapshot: ContactSnapshot) => void): () => void {
		if (destroyed) return () => undefined;
		listeners.add(listener);
		listener(currentSnapshot());
		return () => listeners.delete(listener);
	}

	function setField(field: ContactField, value: string) {
		if (destroyed || status === 'submitting') return;
		values = { ...values, [field]: value };
		status = 'editing';
		fieldErrors = { ...fieldErrors, [field]: undefined };
		errorMessage = '';
		notify();
	}

	async function submit(): Promise<{ ok: boolean; firstInvalidField: ContactField | null }> {
		if (destroyed || status === 'submitting') return { ok: false, firstInvalidField: null };
		status = 'validating';
		fieldErrors = {};
		errorMessage = '';
		successMessage = '';
		notify();

		const validation = validateContact(values);
		if (validation.valid === false) {
			status = 'failed';
			fieldErrors = validation.fieldErrors;
			errorMessage = validation.message;
			notify();
			return { ok: false, firstInvalidField: validation.field };
		}

		status = 'submitting';
		notify();
		try {
			await submitContact(validation.payload, submitter);
			if (destroyed) return { ok: false, firstInvalidField: null };
			status = 'completed';
			successMessage = contactSuccessMessage;
			notify();
			return { ok: true, firstInvalidField: null };
		} catch {
			if (destroyed) return { ok: false, firstInvalidField: null };
			status = 'failed';
			errorMessage = contactFailureMessage;
			notify();
			return { ok: false, firstInvalidField: null };
		}
	}

	function setSubmitter(nextSubmitter?: ContactSubmitter) {
		submitter = nextSubmitter;
	}

	function destroy() {
		destroyed = true;
		listeners.clear();
	}

	return { get snapshot() { return currentSnapshot(); }, subscribe, setField, submit, setSubmitter, destroy };
}

export type ContactController = ReturnType<typeof createContactController>;
