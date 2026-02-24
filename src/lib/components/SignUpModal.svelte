<script lang="ts">
	import SignUpForm from '$lib/components/SignUpForm.svelte';

	type FormMode = 'signup' | 'login';

	let { open = $bindable(false), mode = 'signup' }: { open?: boolean; mode?: FormMode } = $props();

	function closeModal() {
		open = false;
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) {
			closeModal();
		}
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if open}
	<div class="overlay" role="presentation">
		<button class="overlay-close" type="button" aria-label="閉じる" onclick={closeModal}></button>
		<div class="modal" role="dialog" aria-modal="true" aria-label="サインアップモーダル" tabindex="-1">
			<button class="close-button" type="button" aria-label="閉じる" onclick={closeModal}>
				<img src="/icons/close.svg" alt="" />
			</button>

			<section class="brand-pane" aria-hidden="true">
				<img src="/logo/panoptes-logo.svg" alt="" class="brand-logo" />
			</section>

			<section class="form-pane">
				<SignUpForm {mode} />
			</section>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: grid;
		place-items: center;
		padding: 20px;
		background: rgba(10, 6, 30, 0.55);
		backdrop-filter: blur(4px);
		animation: overlayIn 0.24s ease-out;
	}

	.overlay-close {
		position: absolute;
		inset: 0;
		border: none;
		background: transparent;
	}

	.modal {
		position: relative;
		width: min(990px, 100%);
		min-height: min(540px, calc(100dvh - 40px));
		border-radius: 10px;
		background: rgba(210, 206, 216, 0.8);
		box-shadow: 0 34px 70px rgba(7, 2, 20, 0.5);
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: 20px;
		padding: 42px;
		animation: modalIn 0.28s ease-out;
	}

	.close-button {
		position: absolute;
		top: 14px;
		right: 14px;
		width: 36px;
		height: 36px;
		border: none;
		border-radius: 999px;
		display: grid;
		place-items: center;
		background: rgba(248, 247, 251, 0.8);
	}

	.close-button img {
		width: 16px;
		height: 16px;
	}

	.brand-pane {
		display: grid;
		align-content: center;
		gap: 24px;
		padding-inline: 16px;
	}

	.brand-logo {
		width: min(360px, 100%);
		height: auto;
	}

	.brand-copy {
		margin: 0;
		font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
		font-size: clamp(28px, 3.5vw, 54px);
		font-weight: 300;
		letter-spacing: 0.12em;
		line-height: 1.2;
		opacity: 0.15;
		background: linear-gradient(120deg, #6a5cff 0%, #ff7a18 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.form-pane {
		display: grid;
		align-content: center;
	}

	@media (max-width: 900px) {
		.modal {
			grid-template-columns: 1fr;
			padding: 34px 20px 24px;
			min-height: auto;
		}

		.brand-pane {
			gap: 10px;
			justify-items: center;
			text-align: center;
		}

		.brand-copy {
			font-size: clamp(22px, 7vw, 34px);
		}
	}

	@keyframes overlayIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes modalIn {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.985);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
