<script lang="ts">
	import ContactFeedback from './ContactFeedback.svelte';
	import ContactFields from './ContactFields.svelte';
	import { focusFirstContactError } from '../utils/contact-focus';
	import type { ContactField, ContactSnapshot } from '../types';

	let { snapshot, onField, onSubmit }: {
		snapshot: ContactSnapshot;
		onField: (field: ContactField, value: string) => void;
		onSubmit: () => Promise<{ ok: boolean; firstInvalidField: ContactField | null }>;
	} = $props();
	let form: HTMLFormElement;

	async function handleSubmit() {
		const result = await onSubmit();
		if (result.firstInvalidField) focusFirstContactError(form, result.firstInvalidField);
	}
</script>

<form bind:this={form} class="contact-form" novalidate aria-busy={snapshot.status === 'submitting'} onsubmit={(event) => { event.preventDefault(); void handleSubmit(); }}>
	<ContactFields values={snapshot.values} errors={snapshot.fieldErrors} disabled={!snapshot.canSubmit} {onField} />
	<ContactFeedback errors={snapshot.fieldErrors} errorMessage={snapshot.errorMessage} successMessage={snapshot.successMessage} />
	<button class="submit-button" type="submit" disabled={!snapshot.canSubmit}>
		{snapshot.status === 'submitting' ? '送信中…' : '送信する'}
	</button>
</form>

<style>
	.contact-form { display: grid; gap: 12px; }
	.submit-button { width: 100%; border: none; border-radius: 999px; padding: 13px 18px; color: #fff; background: linear-gradient(100deg, #54416f, #7b619c); box-shadow: 0 8px 18px rgba(57, 39, 83, 0.22); font: 500 14px/1.4 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; letter-spacing: 0.04em; cursor: pointer; }
	.submit-button:hover:not(:disabled) { filter: brightness(1.06); }
	.submit-button:disabled { cursor: wait; opacity: 0.72; }
</style>
