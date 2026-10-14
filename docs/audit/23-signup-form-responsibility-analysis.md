# SignUpForm Responsibility Analysis

調査日: 2026-08-07  
対象: 分割前1,131行の`src/lib/components/ComponentsBase/SignUpForm.svelte`

## 分割前の責務

| 責務 | 分割前のコード位置 | State | Side Effect | 外部依存 | 推奨移動先 |
|---|---:|---|---|---|---|
| 入力値 | 45-60、741-847 | email、password、confirm、URL、同意、表示切替 | bind | Svelte form | `signup-form-state.svelte.ts` / `SignUpFields` |
| validation | 163-248、681-730 | errorMsg | なし | regex | `signup-schema.ts` |
| Supabase signup/login/resend | 381-415、465-679 | loading、message、resend | Auth network、cookie session | Supabase browser client | `signup-service.ts` |
| waitlist | 334-375、627-658 | partial success message | POST `/api/waitlist/join` | fetch | `waitlist-service.ts` |
| Turnstile | 25-39、62-161、801-803 | token、ready、widget ID | script、DOM、widget callback | Cloudflare Turnstile | `TurnstileField` / controller |
| cooldown | 66、117-121、255-276 | resendCooldown | interval | browser timer | `cooldown.ts` |
| redirect | 173-176、571-575 | なし | goto、invalidate | SvelteKit、location | `safe-signup-redirect.ts` / controller |
| focus / DOM | 75-161 | container | document、window | browser DOM | Turnstile controller / `signup-focus.ts` |
| error mapping | 187-248 | errorMsg | なし | Supabase error shape | `signup-error-mapper.ts` |
| UI rendering | 734-1,131 | disclosure、password visibility | submit/click | legal text、button | composition component群 |

## 分割前の状態とlifecycle

- Propsは`mode?: 'signup' | 'login'`のみ。callback、slot、snippet、外部bindはない。
- `$state`は入力、表示、送信、feedback、再送、Turnstileを含む16個。
- `$derived`はlogin判定、`$effect`はpropからactive modeへの同期。
- `onMount`がTurnstile script/widgetを生成し、cleanupでwidgetをremove。
- `onDestroy`が再送intervalをclear。
- browser APIは`window`、`document`、`setTimeout`、`setInterval`。
- duplicate submitはbutton disabled中心で、command入口の明示的guardはなかった。

## 確認した既存仕様

- Loginは`signInWithPassword`後にsession存在を確認し、安全な`returnTo`へ遷移する。
- SignupはSupabase成功後にwaitlistへ登録する。両方の成功は必須ではなく、waitlist失敗はpartial successとして案内する。
- email確認redirectは`/auth/callback?next=/app`。callback後のOrganization未選択処理は既存server guardに委ねる。
- 既存account、未確認email、rate limit、SMTP制限で確認メール再送を案内する。
- cooldownは60秒。mode切替とunmountでclearする。
- Turnstileはsignup時のみ必要で、tokenをSupabaseとwaitlistへ渡し、waitlist試行後にresetする。
- passwordは8文字以上、確認一致、URLは任意だがHTTP(S)、規約同意必須。

## 問題と分割方針

異なる変更理由を持つprovider I/O、waitlist契約、CAPTCHA lifecycle、timer、validation、DOM focus、表示が同一componentに集中していた。UIがprovider error shapeとwaitlist responseを直接解釈し、状態booleanの組合せも増えていた。

分割後はUIをcompositionに限定し、Svelte rune state、pure validation/state machine、Auth/waitlist service、Turnstile controller、error/redirect/focus utilityへ依存方向を一方向化する。Supabase SDK型はservice境界より外へ出さない。

## 未確定事項

- repository内に`POST /api/waitlist/join`のroute実装がなく、production owner、timeout、retry policyは確定できない。今回clientの既存呼出順序は維持した。
- account確認状態を問い合わせるAPIはなく、既存のconfirmation status関数も常にunknownだった。再送結果を正本とした。
- session付きsignup時もwaitlist登録と既存feedbackを維持した。即時Organization選択へ遷移するかは別のproduct decision。
- Turnstileの実network/widget動作は公開site keyと外部scriptを要するため、unit testではcontroller境界までとする。
