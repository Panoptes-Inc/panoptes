<script lang="ts">
	import type { SignUpFieldErrors } from '../types';

	let {
		errorMessage,
		message,
		fieldErrors,
		canResend,
		loading,
		resendCooldown,
		onResend
	}: {
		errorMessage: string;
		message: string;
		fieldErrors: SignUpFieldErrors;
		canResend: boolean;
		loading: boolean;
		resendCooldown: number;
		onResend: () => void;
	} = $props();
</script>

{#each Object.entries(fieldErrors) as [field, error] (field)}
	<span class="sr-only" id={`signup-${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}-error`}>{error}</span>
{/each}

{#if errorMessage}
	<p class="msg err" role="alert">{errorMessage}</p>
{/if}
{#if message}
	<p class="msg ok" role="status">{message}</p>
{/if}
{#if canResend}
	<div class="resend-row">
		<button type="button" class="resend-btn" onclick={onResend} disabled={loading || resendCooldown > 0}>
			{#if loading}
				送信中...
			{:else if resendCooldown > 0}
				{resendCooldown}秒後に再送できます
			{:else}
				確認メールを再送
			{/if}
		</button>
	</div>
{/if}

<style>
	.msg { margin: 0; font-size: 13px; line-height: 1.5; }
	.msg.err { color: #d34900; }
	.msg.ok { color: #245e35; }
	.resend-row { display: flex; justify-content: flex-end; }
	.resend-btn { border: 1px solid rgba(106, 92, 255, 0.35); background: rgba(106, 92, 255, 0.1); color: #2f2b45; border-radius: 999px; padding: 8px 12px; font-size: 12px; }
	.resend-btn:disabled { opacity: 0.6; cursor: not-allowed; }
	.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
