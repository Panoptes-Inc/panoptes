<script lang="ts">
	import type { SignUpFieldErrors } from '../types';

	let {
		isLogin,
		email = $bindable(''),
		password = $bindable(''),
		confirmPassword = $bindable(''),
		siteUrl = $bindable(''),
		showPassword = $bindable(false),
		showConfirm = $bindable(false),
		disabled,
		errors = {}
	}: {
		isLogin: boolean;
		email?: string;
		password?: string;
		confirmPassword?: string;
		siteUrl?: string;
		showPassword?: boolean;
		showConfirm?: boolean;
		disabled: boolean;
		errors?: SignUpFieldErrors;
	} = $props();
</script>

<div class="field-wrap required">
	<label class="sr-only" for="signup-email">メールアドレス</label>
	<input id="signup-email" data-signup-field="email" type="email" bind:value={email} placeholder="メールアドレス" autocomplete="email" {disabled} required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'signup-email-error' : undefined} />
</div>

<div class="field-wrap required">
	<label class="sr-only" for="signup-password">パスワード</label>
	<input id="signup-password" data-signup-field="password" type={showPassword ? 'text' : 'password'} bind:value={password} placeholder={isLogin ? 'パスワード' : 'パスワード（8文字以上）'} autocomplete={isLogin ? 'current-password' : 'new-password'} {disabled} required aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'signup-password-error' : undefined} />
	<button class="toggle-eye" type="button" aria-label="パスワード表示切り替え" onclick={() => (showPassword = !showPassword)}>
		<img src={showPassword ? '/icons/PW_eye.svg' : '/icons/PW_eye_close.svg'} alt="" />
	</button>
</div>

{#if !isLogin}
	<div class="field-wrap required">
		<label class="sr-only" for="signup-confirm-password">確認用パスワード</label>
		<input id="signup-confirm-password" data-signup-field="confirmPassword" type={showConfirm ? 'text' : 'password'} bind:value={confirmPassword} placeholder="確認用パスワード" autocomplete="new-password" {disabled} required aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'signup-confirm-password-error' : undefined} />
		<button class="toggle-eye" type="button" aria-label="確認用パスワード表示切り替え" onclick={() => (showConfirm = !showConfirm)}>
			<img src={showConfirm ? '/icons/PW_eye.svg' : '/icons/PW_eye_close.svg'} alt="" />
		</button>
	</div>

	<div class="field-wrap">
		<label class="sr-only" for="signup-site-url">自社サイトURL（任意）</label>
		<input id="signup-site-url" data-signup-field="siteUrl" type="url" bind:value={siteUrl} placeholder="自社サイトURL（任意）" autocomplete="url" {disabled} aria-invalid={Boolean(errors.siteUrl)} aria-describedby={errors.siteUrl ? 'signup-site-url-error' : undefined} />
	</div>
{/if}

<style>
	.field-wrap { position: relative; }
	.field-wrap.required::after { content: '*'; position: absolute; top: 24%; right: 16px; transform: translateY(-50%); font-size: 18px; color: #ff7a18; pointer-events: none; }
	input { box-sizing: border-box; width: 100%; height: 48px; border: 1px solid rgba(117, 109, 146, 0.24); border-radius: 999px; padding: 0 52px 0 18px; background: rgba(255, 255, 255, 0.95); color: #2d2d33; font-size: 14px; font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; }
	input::placeholder { color: #9a98a8; }
	input:focus-visible { outline: 2px solid rgba(106, 92, 255, 0.5); outline-offset: 1px; }
	input:disabled { opacity: 0.75; }
	.toggle-eye { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); border: 0; background: transparent; padding: 0; width: 24px; height: 24px; display: grid; place-items: center; }
	.toggle-eye img { width: 18px; height: 18px; }
	.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
