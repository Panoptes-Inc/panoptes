<script lang="ts">
	import type { ContactField, ContactFieldErrors, ContactValues } from '../types';

	let { values, errors, disabled, onField }: {
		values: ContactValues;
		errors: ContactFieldErrors;
		disabled: boolean;
		onField: (field: ContactField, value: string) => void;
	} = $props();
</script>

<label class="field">
	<span class="required">お名前</span>
	<input id="contact-name" data-contact-field="name" value={values.name} oninput={(event) => onField('name', event.currentTarget.value)} disabled={disabled} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} placeholder="お名前" autocomplete="name" />
</label>
<label class="field">
	<span class="required">メールアドレス</span>
	<input id="contact-email" data-contact-field="email" type="email" value={values.email} oninput={(event) => onField('email', event.currentTarget.value)} disabled={disabled} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} placeholder="メールアドレス" autocomplete="email" />
</label>
<label class="field">
	<span>会社名</span>
	<input id="contact-company" data-contact-field="company" value={values.company} oninput={(event) => onField('company', event.currentTarget.value)} disabled={disabled} aria-invalid={Boolean(errors.company)} aria-describedby={errors.company ? 'contact-company-error' : undefined} placeholder="会社名" autocomplete="organization" />
</label>
<label class="field">
	<span class="required">お問い合わせ内容</span>
	<textarea id="contact-message" data-contact-field="message" value={values.message} oninput={(event) => onField('message', event.currentTarget.value)} disabled={disabled} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} placeholder="お問い合わせ内容" rows="5"></textarea>
</label>

<style>
	.field { display: grid; gap: 5px; color: #4a4756; font: 500 13px/1.4 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; }
	.required::after { content: ' *'; color: #b13f57; }
	input, textarea { width: 100%; box-sizing: border-box; border: 1px solid rgba(87, 78, 111, 0.25); border-radius: 8px; padding: 11px 13px; color: #2f2d39; background: rgba(255, 255, 255, 0.78); font: 400 14px/1.5 inherit; outline: none; transition: border-color 0.18s, box-shadow 0.18s; }
	input:focus, textarea:focus { border-color: #7662a5; box-shadow: 0 0 0 3px rgba(118, 98, 165, 0.13); }
	input[aria-invalid='true'], textarea[aria-invalid='true'] { border-color: #b13f57; }
	textarea { resize: vertical; min-height: 104px; }
	:disabled { cursor: wait; opacity: 0.7; }
</style>
