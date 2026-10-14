import type { ContactField, ContactFieldErrors, ContactPayload, ContactValues } from '../types';

export type ContactValidationResult =
	| { valid: true; payload: ContactPayload }
	| { valid: false; field: ContactField; fieldErrors: ContactFieldErrors; message: string };

export const requiredContactMessage = '必須項目を入力してください。';
export const invalidContactEmailMessage = 'メールアドレスの形式が正しくありません。';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeContactValues(values: ContactValues): ContactPayload {
	return {
		name: values.name.trim(),
		email: values.email.trim().toLowerCase(),
		company: values.company.trim(),
		message: values.message.trim()
	};
}

export function validateContact(values: ContactValues): ContactValidationResult {
	const payload = normalizeContactValues(values);
	const fieldErrors: ContactFieldErrors = {};
	if (!payload.name) fieldErrors.name = requiredContactMessage;
	if (!payload.email) fieldErrors.email = requiredContactMessage;
	if (!payload.message) fieldErrors.message = requiredContactMessage;

	const requiredField = (['name', 'email', 'message'] as const).find((field) => fieldErrors[field]);
	if (requiredField) return { valid: false, field: requiredField, fieldErrors, message: requiredContactMessage };
	if (!emailPattern.test(payload.email)) {
		return {
			valid: false,
			field: 'email',
			fieldErrors: { email: invalidContactEmailMessage },
			message: invalidContactEmailMessage
		};
	}
	return { valid: true, payload };
}
