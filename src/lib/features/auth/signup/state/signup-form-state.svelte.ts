import type {
	SignUpField,
	SignUpFieldErrors,
	SignUpFormMode,
	SignUpStatus,
	SignUpValues
} from '../types';
import { createCooldownController } from './cooldown';
import { beginSignUpOperation, isSignUpBusy, validationFailureStatus } from './signup-state-machine';

export function createSignUpFormState(initialMode: SignUpFormMode) {
	let activeMode = $state<SignUpFormMode>(initialMode);
	let status = $state<SignUpStatus>('idle');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let siteUrl = $state('');
	let agreed = $state(false);
	let showTerms = $state(false);
	let showPrivacyPolicy = $state(false);
	let showPassword = $state(false);
	let showConfirm = $state(false);
	let message = $state('');
	let errorMessage = $state('');
	let fieldErrors = $state<SignUpFieldErrors>({});
	let invalidField = $state<SignUpField | null>(null);
	let canResend = $state(false);
	let resendCooldown = $state(0);
	let lastEmailForResend = $state('');
	let turnstileToken = $state('');
	let turnstileReady = $state(false);
	let turnstileResetKey = $state(0);

	const cooldown = createCooldownController((remaining) => {
		resendCooldown = remaining;
	});

	function resetNotices() {
		message = '';
		errorMessage = '';
		fieldErrors = {};
		invalidField = null;
	}

	function setMode(nextMode: SignUpFormMode) {
		if (state.loading || activeMode === nextMode) return;
		activeMode = nextMode;
		status = 'idle';
		resetNotices();
		canResend = false;
		lastEmailForResend = '';
		showTerms = false;
		showPrivacyPolicy = false;
		cooldown.clear();
		password = '';
		confirmPassword = '';
		showPassword = false;
		showConfirm = false;
	}

	function begin(nextStatus: 'submitting' | 'resending'): boolean {
		const acceptedStatus = beginSignUpOperation(status, nextStatus);
		if (!acceptedStatus) return false;
		status = acceptedStatus;
		resetNotices();
		if (nextStatus === 'submitting') canResend = false;
		return true;
	}

	function finish(nextStatus: SignUpStatus) {
		status = nextStatus;
	}

	function fail(nextMessage: string, nextStatus: SignUpStatus = 'failed') {
		errorMessage = nextMessage;
		status = nextStatus;
	}

	function validationFailed(field: SignUpField | null, errors: SignUpFieldErrors, nextMessage: string) {
		fieldErrors = errors;
		invalidField = field;
		errorMessage = nextMessage;
		status = validationFailureStatus(field);
	}

	function values(): SignUpValues {
		return { email, password, confirmPassword, siteUrl, agreed, turnstileToken };
	}

	function resetTurnstile() {
		turnstileToken = '';
		turnstileResetKey += 1;
	}

	function clearSensitiveFields() {
		password = '';
		confirmPassword = '';
		showPassword = false;
		showConfirm = false;
	}

	const state = {
		get activeMode() { return activeMode; },
		get isLogin() { return activeMode === 'login'; },
		get status() { return status; },
		get loading() { return isSignUpBusy(status); },
		get email() { return email; }, set email(value: string) { email = value; },
		get password() { return password; }, set password(value: string) { password = value; },
		get confirmPassword() { return confirmPassword; }, set confirmPassword(value: string) { confirmPassword = value; },
		get siteUrl() { return siteUrl; }, set siteUrl(value: string) { siteUrl = value; },
		get agreed() { return agreed; }, set agreed(value: boolean) { agreed = value; },
		get showTerms() { return showTerms; }, set showTerms(value: boolean) { showTerms = value; },
		get showPrivacyPolicy() { return showPrivacyPolicy; }, set showPrivacyPolicy(value: boolean) { showPrivacyPolicy = value; },
		get showPassword() { return showPassword; }, set showPassword(value: boolean) { showPassword = value; },
		get showConfirm() { return showConfirm; }, set showConfirm(value: boolean) { showConfirm = value; },
		get message() { return message; }, set message(value: string) { message = value; },
		get errorMessage() { return errorMessage; }, set errorMessage(value: string) { errorMessage = value; },
		get fieldErrors() { return fieldErrors; },
		get invalidField() { return invalidField; },
		get canResend() { return canResend; }, set canResend(value: boolean) { canResend = value; },
		get resendCooldown() { return resendCooldown; },
		get lastEmailForResend() { return lastEmailForResend; }, set lastEmailForResend(value: string) { lastEmailForResend = value; },
		get turnstileToken() { return turnstileToken; }, set turnstileToken(value: string) { turnstileToken = value; },
		get turnstileReady() { return turnstileReady; }, set turnstileReady(value: boolean) { turnstileReady = value; },
		get turnstileResetKey() { return turnstileResetKey; },
		setMode,
		begin,
		finish,
		fail,
		validationFailed,
		resetNotices,
		values,
		resetTurnstile,
		clearSensitiveFields,
		startCooldown: cooldown.start,
		clearCooldown: cooldown.clear,
		destroy: cooldown.destroy
	};

	return state;
}

export type SignUpFormState = ReturnType<typeof createSignUpFormState>;
