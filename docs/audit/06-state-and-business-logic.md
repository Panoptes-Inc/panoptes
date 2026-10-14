# 状態管理・業務ロジック

## 現行store

| store | 主な責務 |
|---|---|
| `session.ts` | selected project、create flow、画面mode、blocking action |
| `projects.ts` | project collection/detail、stable snapshot、hydration status |
| `runtime.ts` | analysis job、visible step、progress、polling、inference |
| `strategy.ts` | selected plan/phase/task、mutation status |
| `network.ts` | online/reachability |
| `notifications.ts` | toast queue |

全てmodule singletonの`writable`です。SSRでユーザー別状態を保持する用途には使われておらず、browser app stateとして利用されています。将来server loadでuser dataを扱う際は、module singletonへrequest固有データを書かない設計が必要です。

## action/domain/selector分離

- actions: API呼び出し、store更新、toast、poll timer、localStorage。
- domain: API payloadからstore stateを純粋変換。`project-sync`、`runtime-progress`、`strategy-snapshot`。
- selectors: 複数storeからrender mode、stable snapshot、選択task等をderived。

この分離はRails移行後も維持価値があります。ただしactionがglobal storeを直接更新するため、unit testと並列request制御が難しいです。service objectまたはdependency injection可能なcommand層にするとテストしやすくなります。

## analysis state machine

`analysis.ts`は単一module timerで2.5秒/6秒polling、4秒超をbackoff表示とし、terminalで停止します。`runtime-progress.ts`と`guards.ts`にstale response、step単調性、progress単調性、stable snapshot保持のルールがあります。

リスク:

- abort/timeoutがなく、遅いfetchがcomponent破棄後に完了し得る。
- retry回数上限・指数backoff・jitterがない。
- timerがmodule singletonなので複数shell mountや複数project同時監視に非対応。
- `PUBLIC_USE_MOCK_API`分岐がclient bundle時に確定し、mock/realの挙動差をaction層が吸収できない場合がある。

## UIに残るロジック

- `PanoptesShellPage`: bootstrap、network listener、polling、create/retry/confirm/project/strategy command。
- `SignUpForm`: Auth error分類、waitlist/CAPTCHA、resend cooldown、validation。
- domain view-model files: score clamp、label変換、fallback text、radar/roadmap構築。
- Landing hero: GSAP timelineとDOM animation。

## Railsへ移す責務

- Organization/User/Role/Permission、project ownership、subscription/usage、idempotencyの永続保証。
- Project/AnalysisJob/Strategy/Roadmap/Taskの状態遷移とvalidation。
- audit log、transaction、webhook、rate limit。
- API error codeとstate transitionの正本。

SvelteKitはcookie/session受け渡し、SSR用取得、Railsへのserver-side proxy、UI向けresponse shapingを担当し、UIは一時state・入力・optimistic presentationに限定します。crawler/Chromium/visual/LLM処理はPython workerへ分離し、Railsがjob orchestrationと永続状態を管理する構造が適切です。

