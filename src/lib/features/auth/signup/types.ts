export type SignUpFormMode = 'signup' | 'login';

export type SignUpStatus =
	| 'idle'
	| 'validating'
	| 'turnstile_waiting'
	| 'submitting'
	| 'resending'
	| 'awaiting_confirmation'
	| 'success'
	| 'partial_success'
	| 'rate_limited'
	| 'failed';

export type SignUpField = 'email' | 'password' | 'confirmPassword' | 'siteUrl' | 'agreed' | 'turnstile';
export type SignUpFieldErrors = Partial<Record<SignUpField, string>>;

export type SignUpValues = {
	email: string;
	password: string;
	confirmPassword: string;
	siteUrl: string;
	agreed: boolean;
	turnstileToken: string;
};

export type AuthErrorCode =
	| 'already_registered'
	| 'email_not_confirmed'
	| 'invalid_credentials'
	| 'rate_limited'
	| 'smtp_blocked'
	| 'network_error'
	| 'service_unavailable'
	| 'unknown_error';

export type SignUpResult =
	| {
			ok: true;
			state: 'session_created' | 'confirmation_required';
			userId: string | null;
			looksLikeExistingUser: boolean;
	  }
	| { ok: false; code: AuthErrorCode; retryable: boolean };

export type LoginResult =
	| { ok: true; sessionCreated: true }
	| { ok: false; code: AuthErrorCode; retryable: boolean };

export type ResendOutcome =
	| 'resent'
	| 'already_confirmed'
	| 'rate_limited'
	| 'smtp_blocked'
	| 'failed';

export type WaitlistJoinCode = 'JOINED' | 'ALREADY' | 'FULL' | 'INVALID';
export type WaitlistResult =
	| { ok: true; code: WaitlistJoinCode | null; message: string }
	| { ok: false; code: string; retryable: boolean };
