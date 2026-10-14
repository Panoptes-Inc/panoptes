# Contact Feature Map

## 正本と公開境界

- 互換/public facade: `src/lib/components/ComponentsBase/ContactModal.svelte`
- feature public API: `src/lib/features/contact/index.ts`
- production caller: `src/lib/components/ComponentsBase/PanoptesSiteHeader.svelte`
- submission extension point: 任意の`ContactSubmitter` callback

## 構造

```text
PanoptesSiteHeader
└─ ContactModal facade (open / onSubmit)
   ├─ ContactModalFrame
   │  └─ overlay, dialog, Escape, focus trap/restore, scroll lock
   └─ ContactForm
      ├─ ContactFields
      ├─ ContactFeedback
      └─ ContactController
         ├─ ContactValidation (pure)
         └─ ContactService
            └─ optional onSubmit callback only
```

## Data flow

```text
input event
  → controller.setField(field, raw value)
  → snapshot
  → ContactForm / ContactFields / ContactFeedback

submit
  → controller: validating
  → validateContact(values)
     ├─ invalid → fieldErrors + failed → first invalid fieldへfocus
     └─ valid → normalized ContactPayload
        → controller: submitting
        → submitContact(payload, optional callback)
           ├─ resolve / callbackなし → completed + success
           └─ reject → failed + 安定した一般向けerror
```

## State contract

`idle → editing → validating → submitting → completed | failed` を正本とする。`submitting`中は入力とsubmitを無効化し、二重送信を抑止する。facadeのcontroller instanceはmodalの表示条件より外側にあるため、閉じて再表示しても入力値を保持する。component破棄後は非同期完了をpublishしない。

## Validation contract

- required: `name`, `email`, `message`
- optional: `company`
- email: 最小の既存形式検査
- normalization: 全項目trim、email小文字化
- message length/category/consent: 既存仕様にないため追加しない

## I/O boundary

serviceは既存の任意callback呼び出しだけを担当する。ネットワーク、DB、メール送信は実装しない。Headerはcallbackを渡していないため、現行production flowに実I/Oはない。将来接続する場合も、payload/API/運用仕様を別タスクで確定してからこの境界へ接続する。

## Modal boundary

Contact固有Frame内でoverlay、Escape、body scroll lock、initial focus、focus trap、focus restore、dialog semanticsを扱う。Surveyとの全面的な共通Modal foundation化はB-3Dの範囲外とし、性急な抽象化を避ける。
