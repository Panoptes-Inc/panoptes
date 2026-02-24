<script>
	let { label = 'ログイン', type = 'submit', disabled = false } = $props();
</script>

<button class="signup-btn" type={type} {disabled}>
	{label}
</button>

<style>
	.signup-btn {
		width: 100%;
		height: 46px;
		border: 1px solid #f5f3ff;
		border-radius: 999px;
		background: linear-gradient(90deg, #ff7a18 0%, #ff6200 100%);
		color: #ffffff;
		font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
		font-size: 14px;
		font-weight: 500;
		letter-spacing: 0.04em;
		transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
	}

	.signup-btn:hover:enabled {
		transform: translateY(-1px);
		box-shadow: 0 8px 20px rgba(255, 98, 0, 0.35);
	}

	.signup-btn:active:enabled {
		transform: translateY(0);
	}

	.signup-btn:disabled {
		opacity: 0.65;
	}
</style>
