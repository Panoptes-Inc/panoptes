# Phase B-3D ContactModal Refactor

## 判定と実装

- 分類: **ACTIVE_CANONICAL**
- 処置: 削除せず、既存ファイルを21行の互換facadeとして維持
- 正本: `src/lib/features/contact/` のcomponents/controller/validation/service/types/utils
- production caller: `PanoptesSiteHeader.svelte`
- Header変更: Contact linkに現在の開閉状態を表す`aria-expanded`を追加（表示差なし）

## 行数

| 対象 | 分割前 | 分割後 |
|---|---:|---:|
| `ContactModal.svelte` facade | 431 | 21 |
| `ContactForm.svelte` | - | 33 |
| `ContactFields.svelte` | - | 37 |
| `ContactFeedback.svelte` | - | 20 |
| `ContactModalFrame.svelte` | - | 61 |
| controller | - | 104 |
| validation | - | 38 |
| callback service | - | 6 |
| focus helper | - | 29 |

全て目標（facade 100行以下、Form 200行以下、Frame 100行以下）を満たす。

## 変更・削除

新規にContact feature 10ファイルとunit testを追加し、既存facadeとHeaderを変更した。ファイル削除はない。Rails、OpenAPI、Auth、Organization、Supabase schema、Survey、Tailwind、design tokenは変更していない。

## 契約とUI

- `open` bindable propと任意の`onSubmit` callbackを維持
- `{ name, email, company, message }` payload shapeを維持
- field順、文言、CTA、modal寸法、色、spacing、typography、breakpoint、animation、success表示、overlay/Escape closeを維持
- close/reopen時の入力保持を維持
- label、autocomplete、`aria-invalid`、`aria-describedby`、`aria-busy`、alert/status、focus trap/restoreを明示
- callbackの内部error messageは表示せず、安定した既存failure文言へmapping

## Test方針

**B: pure/controller test + browser validation** を選択した。既存プロジェクトにcomponent testing libraryがなく、Contactの意味ある分岐はpure validationとcontrollerで直接検証できるため、依存を追加せず既存Phase方針と揃えた。

Unit testはvalid、required、email invalid、message boundary（既存上限なし）、idle/editing、validation failure、callbackなしsuccess、submitting/duplicate、normalized payload、failure mapping、destroy後更新抑止をカバーする。

## 検証結果

| 検証 | 結果 |
|---|---|
| `npm run quality` | exit 0（最終再実行 66.3秒） |
| Svelte check | 0 errors / 0 warnings |
| ESLint | 0 errors / 60 warnings（baseline維持、Contact変更ファイルは0 warning） |
| format | pass |
| OpenAPI | 18 operations / 18 unique operationIds、pass |
| unit test | 9 files / 95 tests passed（Contact新規9 tests） |
| auth smoke | 5 scenarios passed |
| production build | pass、unresolved import 0 |
| secret boundary | 67 build files scanned、pass |
| route smoke | 7 routes passed |

Browserスキルで一時的なpublic QA harnessを用い、実componentを次の通り検証した。harnessと一時policy変更は検証後に削除した。

- modal render/open、4 field、reply文言、CTA
- blank submitの必須errorと最初のinvalid fieldへのfocus
- body scroll lock、Escape close、scroll復元
- close/reopen後の入力保持
- trim + email小文字化された4-field callback payload
- 成功文言、close後の呼び出しbuttonへのfocus restore
- HeaderのContact link/href/`aria-expanded` render
- browser console error 0

Component testing libraryは導入していない（方針B）。依存追加なしでpure/controller testと実ブラウザ確認を組み合わせた。

## 残課題

最大の問題は、production Headerが`onSubmit`を渡さず、保存・通知先が存在しないのに成功表示する点である。Contactの業務目的、担当、保存/通知、spam/rate-limit、privacy/consent、実routeの要否を決定し、別タスクでsubmission contractを実装する必要がある。

## 次対象

現行の行数再計測では`LandingHeroSecondarySection.svelte`が408行で最大の次候補である。production到達性と、markup/CSS主体か分割価値のある状態責務かを先に監査してから着手する。Contact APIやModal foundationをこのPhaseに混在させない。
