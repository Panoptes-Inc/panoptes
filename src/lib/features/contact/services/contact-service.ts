import type { ContactPayload, ContactSubmitter } from '../types';

// B-3D preserves the existing callback-only contract; there is no Contact API or persistence target.
export async function submitContact(payload: ContactPayload, submitter?: ContactSubmitter): Promise<void> {
	await submitter?.(payload);
}
