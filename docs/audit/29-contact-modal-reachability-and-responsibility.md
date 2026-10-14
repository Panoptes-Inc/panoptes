# ContactModal 到達性・責務監査（Phase B-3D）

## 結論

`src/lib/components/ComponentsBase/ContactModal.svelte` は **ACTIVE_CANONICAL** である。production/public UI の `PanoptesSiteHeader.svelte` が直接 import し、グローバルナビゲーションの「お問い合わせ」から開く唯一の実働 Contact UI である。別の正式 Contact route/Form は存在しないため、削除せず互換 facade として残し、内部責務を `src/lib/features/contact/` へ移した。

## 到達性

| 観点 | 調査結果 |
|---|---|
| production/public route | Header が使われる公開画面から到達可能 |
| Header | `PanoptesSiteHeader.svelte` が直接 import、`bind:open` で常時 mount |
| Footer / CTA / LP | 別の ContactModal 呼び出しなし |
| link | Header の `/app/contact` を `preventDefault()` して modal を開く |
| Contact route | 実在する `/app/contact` route なし。URLを直接開く正式導線ではない |
| dev / test | production callerとは別の importなし。`HeaderDummy.svelte` はリンクだけでmodalをimportしない |
| dynamic import | なし |
| barrel export | 分割前はなし。分割後は feature public API を追加したが、既存callerは互換facadeを直接利用 |
| documentation | 既存inventoryが reachable / caller 1 と記録し、正式modalとして扱っていた |
| 類似UI | 空の旧 `Contact.svelte` はB-1で削除済み。正式な別Formなし |

## Contactの目的

タイトル、項目、返信案内から **一般問い合わせ** と判断できる。導入相談、demo、営業、サポート、waitlist、資料請求を分類するcategoryはなく、どれかの専用フォームとは断定できない。複数用途の混在をコードからも区別できないため、用途や項目を変更していない。

## 送信・保存経路

```text
Contact UI
  → name/email/company/message のローカルvalidation
  → 任意の onSubmit(payload) callback
  → 保存先なし（Headerはcallbackを渡していない）
  → 通知先なし
  → callbackが未指定または正常終了ならsuccess表示
```

`fetch`、SvelteKit action、`+server`、Supabase insert、Rails API、Resend、SMTP、`mailto:`、console出力、localStorageは存在しない。したがって現在の公開導線は入力検証後に成功表示するだけで、問い合わせは永続化・通知されない。今回、架空のAPIや保存先は追加していない。

## Submission contract

```ts
type ContactPayload = {
  name: string;
  email: string;
  company: string;
  message: string;
};

type ContactSubmitter = (payload: ContactPayload) => void | Promise<void>;
```

全項目をtrimし、emailのみ小文字化してcallbackへ渡す。`company` は任意入力だが、既存shapeを守るため未入力時も空文字で含める。

## 責務監査

| 責務 | 分割前 | State | Side effect / 依存 | 処理方針 |
|---|---|---|---|---|
| modal表示 / overlay | `ContactModal.svelte` | `open` | DOM | `ContactModalFrame`へ分離 |
| name / email / company / message | 同上 | local strings | input DOM | `ContactFields` + controllerへ分離 |
| category | なし | なし | なし | 追加しない |
| validation | 同上 | errors | なし | pureな`contact-validation.ts`へ分離 |
| submit | 同上 | submitting | 任意callback | controllerとcallback-only serviceへ分離 |
| error / success | 同上 | booleans/text | callback結果 | 明示status + `ContactFeedback`へ分離 |
| Escape / focus / focus trap | 同上（一部未実装） | DOM focus | window/document | Frameとfocus helperへ分離・不足を補完 |
| scroll lock / restore | 同上 | body style | document | Frameへ分離 |

## 正本性と処理方針

既存パスを公開互換facadeとして維持し、唯一の正本実装を`src/lib/features/contact/`へ整理した。Headerのimportを一斉変更せず、既存の`open`/`onSubmit`契約を保つ。旧版・重複版・仮の保存実装は採用していない。削除した実装ファイルはなく、元の巨大componentの内容を責務単位へ移した。

## 未確定事項

- 問い合わせの業務カテゴリと運用担当者
- 保存先、通知先、再送、rate limit、spam対策、同意要件
- `/app/contact` を実routeにするか、modal用のfallback URLとして維持するか
- production向けの成功表示は、実I/O接続後にのみ出すべきか

