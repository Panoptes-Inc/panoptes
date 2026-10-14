<script lang="ts">
	import type { ContactFieldErrors } from '../types';

	let { errors, errorMessage, successMessage }: { errors: ContactFieldErrors; errorMessage: string; successMessage: string } = $props();
</script>

{#each Object.entries(errors) as [field, message] (field)}
	{#if message}<span id={`contact-${field}-error`} class="sr-only">{message}</span>{/if}
{/each}
{#if errorMessage}<p class="feedback error" role="alert">{errorMessage}</p>{/if}
{#if successMessage}<p class="feedback success" role="status">{successMessage}</p>{/if}
<p id="contact-reply-copy" class="reply-copy">担当者より2営業日以内にご返信します。</p>

<style>
	.feedback, .reply-copy { margin: 0; text-align: center; font: 400 13px/1.5 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; }
	.error { color: #a72f49; }
	.success { color: #2b7452; }
	.reply-copy { color: #696576; }
	.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
