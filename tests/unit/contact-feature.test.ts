import { describe, expect, it, vi } from 'vitest';
import {
	contactFailureMessage,
	contactSuccessMessage,
	createContactController
} from '../../src/lib/features/contact/state/contact-controller';
import type { ContactSnapshot } from '../../src/lib/features/contact/types';
import {
	invalidContactEmailMessage,
	requiredContactMessage,
	validateContact
} from '../../src/lib/features/contact/validation/contact-validation';

function enterValidContact(controller: ReturnType<typeof createContactController>) {
	controller.setField('name', ' Panoptes User ');
	controller.setField('email', ' USER@Example.COM ');
	controller.setField('company', ' Example Inc. ');
	controller.setField('message', ' お問い合わせ本文 ');
}

describe('contact validation', () => {
	it('normalizes the historical four-field payload', () => {
		expect(
			validateContact({
				name: ' User ',
				email: ' USER@Example.COM ',
				company: ' Company ',
				message: ' Hello '
			})
		).toEqual({
			valid: true,
			payload: { name: 'User', email: 'user@example.com', company: 'Company', message: 'Hello' }
		});
	});

	it('requires name, email, and message while keeping company optional', () => {
		const missing = validateContact({ name: ' ', email: '', company: '', message: '\n' });
		expect(missing).toMatchObject({ valid: false, field: 'name', message: requiredContactMessage });
		expect(missing.valid === false && missing.fieldErrors).toMatchObject({
			name: requiredContactMessage,
			email: requiredContactMessage,
			message: requiredContactMessage
		});
		expect(
			validateContact({ name: 'User', email: 'user@example.com', company: '', message: 'Hello' })
				.valid
		).toBe(true);
	});

	it('rejects an invalid email and does not introduce a message length limit', () => {
		expect(
			validateContact({ name: 'User', email: 'invalid', company: '', message: 'Hello' })
		).toMatchObject({
			valid: false,
			field: 'email',
			message: invalidContactEmailMessage
		});
		expect(
			validateContact({
				name: 'User',
				email: 'user@example.com',
				company: '',
				message: 'x'.repeat(10000)
			}).valid
		).toBe(true);
	});
});

describe('contact controller', () => {
	it('starts idle, records edits, and retains values until its owner destroys it', () => {
		const controller = createContactController();
		expect(controller.snapshot.status).toBe('idle');
		controller.setField('message', 'keep across close and reopen');
		expect(controller.snapshot).toMatchObject({
			status: 'editing',
			values: { message: 'keep across close and reopen' }
		});
		controller.destroy();
	});

	it('stops before submission when validation fails', async () => {
		const submitter = vi.fn();
		const controller = createContactController(submitter);
		await expect(controller.submit()).resolves.toEqual({ ok: false, firstInvalidField: 'name' });
		expect(submitter).not.toHaveBeenCalled();
		controller.destroy();
	});

	it('preserves the existing callback-optional success behavior', async () => {
		const controller = createContactController();
		enterValidContact(controller);
		await expect(controller.submit()).resolves.toEqual({ ok: true, firstInvalidField: null });
		expect(controller.snapshot).toMatchObject({
			status: 'completed',
			successMessage: contactSuccessMessage
		});
		controller.destroy();
	});

	it('prevents duplicate submit and sends one normalized payload', async () => {
		let resolveSubmit: (() => void) | undefined;
		const submitter = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					resolveSubmit = resolve;
				})
		);
		const controller = createContactController(submitter);
		enterValidContact(controller);
		const first = controller.submit();
		await expect(controller.submit()).resolves.toEqual({ ok: false, firstInvalidField: null });
		resolveSubmit?.();
		await expect(first).resolves.toEqual({ ok: true, firstInvalidField: null });
		expect(submitter).toHaveBeenCalledTimes(1);
		expect(submitter).toHaveBeenCalledWith({
			name: 'Panoptes User',
			email: 'user@example.com',
			company: 'Example Inc.',
			message: 'お問い合わせ本文'
		});
		controller.destroy();
	});

	it('maps callback failures to a stable message without exposing the thrown error', async () => {
		const controller = createContactController(() =>
			Promise.reject(new Error('private backend detail'))
		);
		enterValidContact(controller);
		await controller.submit();
		expect(controller.snapshot).toMatchObject({
			status: 'failed',
			errorMessage: contactFailureMessage
		});
		expect(controller.snapshot.errorMessage).not.toContain('private backend detail');
		controller.destroy();
	});

	it('does not publish asynchronous completion after destroy', async () => {
		let resolveSubmit: (() => void) | undefined;
		const controller = createContactController(
			() =>
				new Promise<void>((resolve) => {
					resolveSubmit = resolve;
				})
		);
		enterValidContact(controller);
		const snapshots: ContactSnapshot[] = [];
		controller.subscribe((snapshot) => snapshots.push(snapshot));
		const pending = controller.submit();
		controller.destroy();
		resolveSubmit?.();
		await pending;
		expect(snapshots.at(-1)?.status).toBe('submitting');
	});
});
