<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { trapContactDialogFocus } from '../utils/contact-focus';

	let { onClose, children }: { onClose: () => void; children: Snippet } = $props();
	let dialog: HTMLDivElement;

	onMount(() => {
		const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		queueMicrotask(() => dialog.focus());

		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				event.preventDefault();
				onClose();
				return;
			}
			trapContactDialogFocus(event, dialog);
		}
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			document.body.style.overflow = previousOverflow;
			previousFocus?.focus();
		};
	});
</script>

<div class="overlay" role="presentation">
	<button class="overlay-close" type="button" aria-label="閉じる" onclick={onClose}></button>
	<div class="modal" role="dialog" aria-modal="true" aria-labelledby="contact-title" aria-describedby="contact-reply-copy" tabindex="-1" bind:this={dialog}>
		<button class="close-button" type="button" aria-label="閉じる" onclick={onClose}>
			<img src="/icons/close.svg" alt="" />
		</button>
		<section class="info-pane">
			<img src="/logo/panoptes-logo.svg" alt="" class="brand-logo" />
		</section>
		<section class="form-pane">
			<h3 id="contact-title">お問い合わせ</h3>
			{@render children()}
		</section>
	</div>
</div>

<style>
	.overlay { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 20px; background: rgba(12, 10, 24, 0.44); backdrop-filter: blur(5px); animation: overlayIn 0.24s ease-out; }
	.overlay-close { position: absolute; inset: 0; border: none; background: transparent; }
	.modal { position: relative; width: min(1200px, 100%); min-height: min(620px, calc(100dvh - 40px)); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.7); background: rgba(227, 224, 234, 0.9); box-shadow: 0 34px 70px rgba(7, 2, 20, 0.45); display: grid; grid-template-columns: minmax(320px, 1fr) minmax(420px, 1fr); animation: modalIn 0.28s ease-out; }
	.close-button { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border: none; border-radius: 999px; display: flex; align-items: center; justify-content: center; background: rgba(248, 247, 251, 0.9); cursor: pointer; }
	.close-button img { width: 14px; height: 14px; }
	.info-pane { display: grid; align-content: center; justify-items: center; gap: 10px; padding: 56px 44px; background: linear-gradient(130deg, rgba(255, 255, 255, 0.5), rgba(240, 236, 248, 0.35)); }
	.brand-logo { width: min(360px, 100%); height: auto; }
	.form-pane { display: grid; align-content: center; gap: 10px; padding: 42px 52px 36px; }
	h3 { width: 100%; margin: 0 0 10px; color: #2f2d39; text-align: center; font: 500 24px/1.4 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; letter-spacing: 0.02em; }
	@media (max-width: 880px) { .modal { grid-template-columns: 1fr; min-height: auto; max-height: calc(100dvh - 40px); overflow-y: auto; } .info-pane { padding: 28px 20px 10px; } .brand-logo { width: min(260px, 70%); } .form-pane { padding: 12px 20px 24px; } }
	@media (max-width: 560px) { .overlay { padding: 12px; } .form-pane { padding: 10px 14px 20px; } }
	@keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
	@keyframes modalIn { from { opacity: 0; transform: translateY(12px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
</style>
