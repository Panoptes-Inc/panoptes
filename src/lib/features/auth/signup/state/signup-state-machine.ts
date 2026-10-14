import type { SignUpField, SignUpStatus } from '../types';

export function isSignUpBusy(status: SignUpStatus): boolean {
	return status === 'submitting' || status === 'resending';
}

export function beginSignUpOperation(
	current: SignUpStatus,
	next: 'submitting' | 'resending'
): SignUpStatus | null {
	return isSignUpBusy(current) ? null : next;
}

export function validationFailureStatus(field: SignUpField | null): SignUpStatus {
	return field === 'turnstile' ? 'turnstile_waiting' : 'failed';
}
