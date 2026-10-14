# LoginModal 到達性・責務監査（Phase B-3C）

## 結論

`src/lib/components/ComponentsBase/LoginModal.svelte` は **LEGACY_DUPLICATE** と判定した。production、dev route、test、dynamic import、barrel exportのいずれからも参照されず、現在のHeaderは`/login`へ直接遷移する。正式なLogin UIは`/login`が描画する`SignUpForm mode="login"`であり、Supabase browser Auth、SSR cookie、server guardへ接続されている。

## 到達性

| 確認点 | 結果 |
|---|---|
| production route | 参照0、到達不能 |
| Header | `href="/login"`。Modalを開かない |
| `/login` | `SignUpForm mode="login"`を利用。Modal参照なし |
| dynamic import | 0 |
| test | 0 |
| dev route | 0 |
| barrel export | 0 |
| documentation | 過去inventoryにはHeaderからreachableとの記録があるが現行コードと不一致 |
| 類似実装 | `/login`＋Signup featureが正式実装 |

## `/login`・Signup featureとの関係

`/login`はcallback failure／signed-out noticeを表示し、正式フォームをLogin modeで構成する。フォームはSignup featureのfield、validation、state、controller、Auth service、error mapper、safe redirectを共有する。password loginは`loginWithPassword`の1実装だけがSupabase `signInWithPassword`を呼び、sessionが無ければ成功扱いしない。

旧Modalは`onLogin` callbackだけを呼び、callbackが無い場合は認証せず閉じていた。provider errorの生messageもそのまま表示でき、SSR session、safe redirect、Organization guardへ接続されていなかった。

## 分割前責務

| 責務 | 旧Modalの実装 | State | Side effect | 外部依存 | 正本／処理先 |
|---|---|---|---|---|---|
| modal表示 | `LoginModal.svelte` | `open` | DOM表示 | Svelte | 不要のため削除 |
| email/password | 同上 | local `$state` | なし | なし | `SignUpFields.svelte` |
| validation | component内 | error text | なし | RegExp | `signup-schema.ts`（pure） |
| password login | `onLogin` callback | loading | 任意callback | 親任せ | `loginWithPassword` |
| signup切替 | `onSignUp` callback | なし | 任意callback | 親任せ | `SignUpForm` mode切替 |
| password reset | なし | なし | なし | なし | 未実装のまま |
| redirect | なし | なし | なし | なし | Login controller＋`safeReturnTo` |
| error mapping | raw `Error.message` | error text | なし | provider漏洩可能 | `signup-error-mapper.ts` |
| loading | component内boolean | local | button disable | なし | form state＋Login controller |
| focus/Escape/overlay/scroll | component内 | element ref | DOM/window | browser DOM | Modal廃止により不要 |

## Modal固有要素の移植判断

- password表示切替: 正式フォームに既に存在する。
- signup切替: 正式フォームに既に存在する。
- `autocomplete=email/current-password`: 正式フォームに存在する。
- remember checkbox: callback payloadに含めるだけでcookie/session設定には反映されず、仕様も無いため移植しない。
- Modal frame、overlay、Escape: 現行プロダクトにLogin Modalの入口が無いため移植しない。

以上から固有の必要interactionはなく、削除条件を満たす。削除後もHeader、`/login`、callback、logout、server guardは変更しない。

## 正式な責任境界

Loginの認証・redirect・重複送信・destroy境界をフレームワーク非依存の`features/auth/login/state/login-controller.ts`へ抽出した。UI validationとform stateは既存Signup featureを共有し、provider I/Oは既存`loginWithPassword`だけを使用する。PageとModalの二重実装は解消された。

## Password reset／OTP

password resetは正式フォームに「パスワードをお忘れですか？」リンクだけがあり、現在は`/`を指す未接続UIである。`resetPasswordForEmail`、reset callback route、OTP／verifyOtp実装は見つからない。仕様未確定のため今回接続していない。email confirmation resendはSignup featureに実装済みだが、password resetやOTPとは別責務である。

## 未確定事項

- password resetの正式route、callback、UX
- session永続期間を変更する「ログイン状態を保持する」仕様
- Login Modalを将来再導入するプロダクト要件

将来Modalが必要になった場合も、`SignUpForm mode="login"`または共有Login Formを包むfacadeとし、別のSupabase login実装を作らない。
