<script lang="ts">
	import termsText from '$lib/components/ComponentsBase/parts/regal/利用規約.txt?raw';
	import privacyPolicyText from '$lib/components/ComponentsBase/parts/regal/プライバシーポリシー.txt?raw';

	let {
		agreed = $bindable(false),
		showTerms = $bindable(false),
		showPrivacyPolicy = $bindable(false),
		disabled,
		invalid = false
	}: {
		agreed?: boolean;
		showTerms?: boolean;
		showPrivacyPolicy?: boolean;
		disabled: boolean;
		invalid?: boolean;
	} = $props();

	function toggleTerms() {
		showTerms = !showTerms;
		if (showTerms) showPrivacyPolicy = false;
	}

	function togglePrivacyPolicy() {
		showPrivacyPolicy = !showPrivacyPolicy;
		if (showPrivacyPolicy) showTerms = false;
	}
</script>

<section class="onboarding-legal" aria-label="登録前の確認事項">
	<p class="onboarding-title">登録前に利用規約とプライバシーポリシーをご確認ください。</p>
	<div class="legal-toggle-row">
		<button type="button" class="legal-toggle" aria-expanded={showTerms} onclick={toggleTerms}>
			{showTerms ? '利用規約を閉じる' : '利用規約を読む'}
		</button>
		<button type="button" class="legal-toggle" aria-expanded={showPrivacyPolicy} onclick={togglePrivacyPolicy}>
			{showPrivacyPolicy ? 'プライバシーポリシーを閉じる' : 'プライバシーポリシーを読む'}
		</button>
	</div>

	{#if showTerms}
		<div class="legal-panel" role="region" aria-label="利用規約全文">
			<h3>利用規約</h3>
			<pre class="legal-text">{termsText}</pre>
		</div>
	{/if}
	{#if showPrivacyPolicy}
		<div class="legal-panel" role="region" aria-label="プライバシーポリシー全文">
			<h3>プライバシーポリシー</h3>
			<pre class="legal-text">{privacyPolicyText}</pre>
		</div>
	{/if}
</section>

<div class="helper-row">
	<label>
		<input data-signup-field="agreed" type="checkbox" bind:checked={agreed} {disabled} aria-invalid={invalid} aria-describedby={invalid ? 'signup-agreed-error' : undefined} />
		利用規約とプライバシーポリシーに同意する
	</label>
</div>

<style>
	.onboarding-legal { display: grid; gap: 8px; padding: 10px 12px; border-radius: 12px; justify-content: center; }
	.onboarding-title { display: flex; justify-content: center; margin: 0; font-size: 12px; line-height: 1.5; color: #4e4a61; }
	.legal-toggle-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
	.legal-toggle { border: 1px solid rgba(106, 92, 255, 0.32); border-radius: 999px; padding: 6px 11px; font-size: 12px; font-weight: 300; background: rgba(106, 92, 255, 0.08); color: #ffffff; }
	.legal-panel { border: 1px solid rgba(117, 109, 146, 0.2); border-radius: 10px; padding: 10px; background: rgba(255, 255, 255, 0.95); max-height: 180px; overflow: auto; }
	.legal-panel h3 { margin: 0 0 8px; font-size: 13px; color: #2f2c3d; }
	.legal-text { margin: 0; white-space: pre-wrap; font-size: 12px; line-height: 1.6; color: #38344b; }
	.helper-row { display: flex; align-items: center; justify-content: center; margin-top: -2px; font-size: 13px; color: #5d5a6d; }
	.helper-row label { display: inline-flex; align-items: center; gap: 8px; }
	.helper-row input { width: 18px; height: 18px; padding: 0; }
</style>
