<script>
	import SignUpModal from '$lib/components/SignUpModal.svelte';

	let isModalOpen = $state(false);

	function openModal() {
		isModalOpen = true;
	}
</script>

<button class="analyze-button" type="button" onclick={openModal}>
	<span class="analyze-text">事前登録を行う</span>
</button>

<SignUpModal bind:open={isModalOpen} mode="signup" />

<style>
	.analyze-button {
		--r: 999px;
		--padX: 32px;
		--padY: 10px;
		--gap: 1px;
		--ring: 1px;

		border: none;
		padding: var(--padY) var(--padX);
		border-radius: var(--r);
		background: transparent;
		position: relative;
		isolation: isolate;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.analyze-button::before {
		content: '';
		position: absolute;
		inset: calc(-1 * (var(--gap) + var(--ring)));
		border-radius: inherit;
		background: linear-gradient(45deg, #564aff, #ff6200, #bcb7ff, #ff6200, #564aff);
		background-size: 300% 300%;
		background-position: 0% 50%;
		padding: var(--ring);
		-webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
		-webkit-mask-composite: xor;
		mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
		mask-composite: exclude;
		z-index: -1;
		pointer-events: none;
		animation: glow 12s linear infinite;
	}

	.analyze-text {
		text-align: center;
		display: inline-block;
		font-size: 16px;
		font-weight: 400;
		font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
		background: linear-gradient(90deg, #6a5cff, #ff7a18);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		filter: drop-shadow(0 0 10px rgba(106, 92, 255, 0.28))
			drop-shadow(0 0 10px rgba(255, 122, 24, 0.22));
	}

	.analyze-button:hover .analyze-text {
		filter: drop-shadow(0 0 14px rgba(106, 92, 255, 0.35))
			drop-shadow(0 0 14px rgba(255, 122, 24, 0.3));
	}

	@keyframes glow {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>
