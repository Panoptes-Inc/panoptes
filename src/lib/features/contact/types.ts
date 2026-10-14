export type ContactField = 'name' | 'email' | 'company' | 'message';

export type ContactPayload = {
	name: string;
	email: string;
	company: string;
	message: string;
};

export type ContactValues = ContactPayload;
export type ContactFieldErrors = Partial<Record<ContactField, string>>;
export type ContactStatus = 'idle' | 'editing' | 'validating' | 'submitting' | 'completed' | 'failed';
export type ContactSubmitter = (payload: ContactPayload) => void | Promise<void>;

export type ContactSnapshot = {
	values: ContactValues;
	fieldErrors: ContactFieldErrors;
	status: ContactStatus;
	errorMessage: string;
	successMessage: string;
	canSubmit: boolean;
};
