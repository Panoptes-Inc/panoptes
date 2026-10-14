# Phase B-3A Signup Refactor

実施日: 2026-08-07

## 実装内容

- `SignUpForm.svelte`を1,131行から143行へ縮小し、compositionとcommand呼出へ限定
- Field、legal consent、Turnstile、feedbackを4つの責務componentへ分離
- rune form stateと明示status、pure state machine、単一cooldown timerを導入
- validation、normalization、error mapping、safe redirect、focusをpure utilityへ分離
- Supabase signup/login/resendをPanoptes result型へ変換するserviceを導入
- waitlist fetchとresponse mappingをserviceへ分離
- Turnstile scriptの重複load防止、widget reset/remove、unmount後callback防止をcontroller化
- route importを`$lib/features/auth/signup` public entryへ変更

## 変更ファイル

- Composition: `src/lib/components/ComponentsBase/SignUpForm.svelte`
- Public API: `src/lib/features/auth/signup/index.ts`、`types.ts`
- UI: `components/SignUpFields.svelte`、`TermsAgreement.svelte`、`TurnstileField.svelte`、`SignUpFeedback.svelte`
- State: `state/signup-form-state.svelte.ts`、`signup-state-machine.ts`、`cooldown.ts`、`signup-controller.svelte.ts`
- Services: `services/signup-service.ts`、`waitlist-service.ts`
- Turnstile: `turnstile/turnstile-controller.ts`
- Pure utilities: `validation/signup-schema.ts`、`utils/signup-error-mapper.ts`、`safe-signup-redirect.ts`、`signup-focus.ts`
- Consumer: `src/routes/login/+page.svelte`
- Test: `tests/unit/signup-feature.test.ts`
- Docs: responsibility analysis、architecture map、本書

## 分割後の行数

| File | Lines |
|---|---:|
| `SignUpForm.svelte` | 143 |
| 最大UI child `TurnstileField.svelte` | 86以下 |
| state controller | 198以下 |
| Auth service | 111 |
| waitlist service | 50 |

すべて目安（Form 300、child 250）以下。小さな表示断片ではなく変更理由単位で分割した。

## Test

`tests/unit/signup-feature.test.ts`へ21件を追加した。

- 正常入力、email不正、password不一致、同意なし、Turnstile未完了
- signup session成功、確認待ち、既存account、rate limit、network failure
- login session欠落、resend rate limit
- waitlist success、duplicate、full、failure、retryable network error
- double submit guard、partial successからの再試行、Turnstile waiting status
- cooldown tickとdestroy cleanup
- safe redirect、provider error mapping

Component testing libraryは未導入のためcomponent testは追加していない。Svelte check、SSR/production build、`/login` route smokeとブラウザー確認でcompositionのrenderを検証する。

## UI／挙動

DOMの主要入力順、class、色、spacing、typography、CTA文言、responsive条件、Supabase→waitlistの順序、partial success、再送cooldownを維持した。追加した利用者向け変化は、fieldとerrorのARIA関連付け、form busy、status/alert、validation error fieldへのfocus、Turnstile代替説明である。

Supabase providerの未知な内部messageは直接表示せず、既存の汎用日本語messageへ安定化した。SSR Auth、callback、logout、Organization guard、Rails、OpenAPIには変更を加えていない。

## Quality結果

- `npm run quality`: exit code 0
- Svelte check: 0 errors / 0 warnings
- ESLint: 0 errors / 67 warnings（開始時69以下、Signup変更ファイルは0 warnings）
- Test: 7 files / 58 tests passed（Signup新規21件）
- OpenAPI: 18 operations / 18 unique operationIds
- production build、Auth smoke、secret boundary、7 route smoke: 成功
- unresolved import: 0、新規循環依存: 0
- 実ブラウザー: `/login` render、login/signup相互切替、主要field、CTA、console error 0を確認

## 未解決事項

- `/api/waitlist/join`のserver route、永続化owner、timeout/retry仕様はrepository内で未実装
- Turnstileを含む外部network E2Eとvisual regression基盤は未導入
- signup直後にsessionが作成された場合のOrganization導線は既存仕様を維持し、自動redirectは追加していない

## 次に分割すべきcomponent

次は`SurveyModal.svelte`（455行）を、question schema／回答state／validation／modal UIへ分離する。Tailwind移行やLoginModal全面分割は行わない。
