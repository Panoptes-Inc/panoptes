# SurveyModal 責務分析（Phase B-3B）

## 現行機能の目的

`SurveyModal` は、ヘッダーの「アンケート」から開く、Panoptes の利用目的と改善要望を集めるプロダクトフィードバック用フォームである。質問内容から市場調査・利用目的ヒアリングの性格も持つが、onboarding、waitlist、Organization 登録の一部であることはコードから断定できない。

## 分割前の契約

- 呼び出し元: `PanoptesSiteHeader.svelte` の1箇所
- 公開 props: `open`（bindable）、`onSubmit`（任意 callback）
- callback payload: `{ purpose, projectType, comment, email }`
- 表示: 4問を同時に表示する1ページ式
- 必須: `purpose`、`comment`、`email`
- 任意: `projectType`
- 正規化: 前後空白を除去し、email を小文字化
- 保存: fetch、localStorage、Supabase、Rails API は使わず、任意の `onSubmit` callback に渡すだけ
- close/reopen: 回答を保持
- 完了表示: `ご回答ありがとうございます。開発の参考に活用します。`

## 分割前の責務表

| 責務 | 分割前の位置 | State | Side effect | 外部依存 | 移動先 |
|---|---|---|---|---|---|
| 質問・選択肢 | `SurveyModal.svelte` | なし | なし | なし | `schema/survey-questions.ts` |
| 回答 | 同上 | 4個の `$state` | なし | なし | controller / `types.ts` |
| step・progress | 実質なし（全問同時表示） | なし | なし | なし | `navigation/survey-navigation.ts`（1ページを明示） |
| validation | submit handler | error message | なし | RegExp | `validation/survey-validation.ts` |
| submit | submit handler | loading/success/error | callback 実行 | `onSubmit` | controller / `services/survey-service.ts` |
| result mapping | submit handler | なし | なし | なし | `utils/survey-result-mapper.ts` |
| modal close | component | `open` | focus/scroll | DOM | `SurveyModalFrame.svelte` |
| keyboard/focus | component | element ref | event listener | DOM | frame / `utils/survey-focus.ts` |
| UI | component markup/CSS | なし | なし | Svelte | `components/*` |

## Question schema と answer model

質問 schema は discriminated union とし、`single_choice`、`multiple_choice`、`text`、`email` を表現する。現在の質問は次の4件で、順序・文言・選択肢は変更していない。

1. `purpose`: single choice、必須
2. `projectType`: text、任意
3. `comment`: multiline text、必須
4. `email`: email、必須

回答は `Record<SurveyQuestionId, SurveyAnswerValue>` とし、IDを `'purpose' | 'projectType' | 'comment' | 'email'` に限定した。値は `string | string[] | null` で、`any` や無制限な `Record<string, unknown>` は使用しない。

## State と validation

controller は `idle → answering → validating → submitting → completed/failed` を明示する。回答、field error、表示メッセージ、page、progress、遷移可否を snapshot として公開する。validation は required、既知 option、multiple choice 上限、text 長、email、未知 question を純粋関数で検査する。

現行は1ページ式なので、`surveyPageCount = 1`、progress は100%、next/back UIは表示しない。将来の複数ページ化に必要な計算だけをUI外に置き、今回の画面挙動は変えていない。

## Side effect・保存・modal

- 保存 service は任意 callback の呼び出しだけを担当する。callback が無い場合も従来どおり成功する。
- Survey API、Rails、OpenAPI、Supabase、localStorage は追加していない。
- modal frame が body scroll lock、初期 focus、Escape、overlay/close、focus trap、focus restore、ARIA dialog を担当する。
- controller は duplicate submit を拒否し、destroy 後の非同期完了通知を抑止する。
- close は reset を呼ばないため、未送信・送信済み回答とも reopen 時に保持する。

## 分割方針と未確定事項

既存 `ComponentsBase/SurveyModal.svelte` は互換 facade と composition root として残す。内部は `features/survey` の公開入口から利用可能にし、内部 utility は非公開とする。

未確定事項は、回答の永続保存先、回答 version・submittedAt、Survey API、onboarding との関係、条件分岐質問、複数ページ化である。いずれも推測実装していない。
