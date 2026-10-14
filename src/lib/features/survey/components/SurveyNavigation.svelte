<script lang="ts">
	let { submitting, canSubmit }: { submitting: boolean; canSubmit: boolean } = $props();
</script>

<button class="submit-button" type="submit" disabled={!canSubmit}>
	{submitting ? '送信中...' : '送信する'}
</button>

<style>
	.submit-button { height: 50px; border: 1px solid #ff7a18; border-radius: 999px; background: linear-gradient(90deg, #6f66ff 0%, #564aff 100%); color: #fff; font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; font-size: 15px; font-weight: 600; letter-spacing: 0.04em; transition: transform 0.18s ease, filter 0.18s ease, opacity 0.18s ease; }
	.submit-button:hover:enabled { transform: translateY(-1px); filter: brightness(1.04); }
	.submit-button:disabled { opacity: 0.72; }
	@media (max-width: 560px) { .submit-button { height: 46px; } }
</style>
