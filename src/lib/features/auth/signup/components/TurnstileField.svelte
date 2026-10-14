<script lang="ts">
	import { onMount } from 'svelte';
	import { mountTurnstile } from '../turnstile/turnstile-controller';

	let {
		siteKey,
		resetKey = 0,
		describedBy,
		onToken,
		onReady
	}: {
		siteKey: string;
		resetKey?: number;
		describedBy?: string;
		onToken: (token: string) => void;
		onReady: (ready: boolean) => void;
	} = $props();

	let container: HTMLDivElement;
	let widget: Awaited<ReturnType<typeof mountTurnstile>> | null = null;
	let lastResetKey = 0;

	onMount(() => {
		let disposed = false;
		if (!siteKey) return;
		void mountTurnstile(container, siteKey, {
			onToken: (nextToken) => {
				if (!disposed) onToken(nextToken);
			},
			onUnavailable: () => {
				if (!disposed) onToken('');
			}
		})
			.then((mounted) => {
				if (disposed) {
					mounted.destroy();
					return;
				}
				widget = mounted;
				onReady(true);
			})
			.catch(() => {
				if (!disposed) onReady(false);
			});

		return () => {
			disposed = true;
			onReady(false);
			onToken('');
			widget?.destroy();
			widget = null;
		};
	});

	$effect(() => {
		if (resetKey !== lastResetKey) {
			lastResetKey = resetKey;
			onToken('');
			widget?.reset();
		}
	});
</script>

<div class="turnstile-wrap" aria-label="CAPTCHA認証" aria-describedby={describedBy}>
	<div bind:this={container}></div>
	<span class="sr-only">不正な自動送信を防ぐためのCAPTCHA認証です。</span>
</div>

<style>
	.turnstile-wrap {
		display: flex;
		justify-content: center;
		margin-top: 2px;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
