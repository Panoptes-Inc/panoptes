# AnalysisJob State Machine

Status: Phase A-5 canonical draft

関連文書: [API境界](../architecture/api-boundary.md) / [API v1契約](panoptes-api-v1.md) / [OpenAPI draft](openapi-draft.yaml)

## Canonical states

```text
queued
  -> preparing
  -> crawling
  -> capturing
  -> internal_analysis
  -> awaiting_confirmation
  -> visual_analysis
  -> llm_analysis
  -> finalizing
  -> completed
```

Terminal alternatives:

```text
failed | cancelled | timed_out | partially_completed
```

`awaiting_confirmation`は非terminalのbusiness pauseである。解析対象の推定を利用者が確認する現在のMVPフローに必要なため、例示されたpipelineへ明示的に追加する。

## State definitions

| State                 | Owner       | Meaning                                | Next                                                                           |
| --------------------- | ----------- | -------------------------------------- | ------------------------------------------------------------------------------ |
| queued                | Rails/Queue | transaction committed、未取得          | preparing, cancelled, timed_out, failed                                        |
| preparing             | Worker      | URL・policy・attempt初期化             | crawling, failed, cancelled, timed_out                                         |
| crawling              | Worker      | HTML/resource取得                      | capturing, failed, partially_completed, cancelled, timed_out                   |
| capturing             | Worker      | Chromium/screenshot                    | internal_analysis, failed, partially_completed, cancelled, timed_out           |
| internal_analysis     | Worker      | structure/content推定                  | awaiting_confirmation, visual_analysis, failed, partially_completed, timed_out |
| awaiting_confirmation | Rails       | immutable draft提示、利用者入力待ち    | visual_analysis, cancelled, timed_out, failed                                  |
| visual_analysis       | Worker      | screenshot/visual評価                  | llm_analysis, failed, partially_completed, timed_out                           |
| llm_analysis          | Worker      | insight/strategy proposal生成          | finalizing, failed, partially_completed, timed_out                             |
| finalizing            | Rails       | result整合性確認とSnapshot transaction | completed, partially_completed, failed                                         |
| completed             | Rails       | committed Snapshotがcurrentへ昇格      | terminal                                                                       |
| failed                | Rails       | 必須成果をcommitできない               | terminal、明示retryで新attempt/job                                             |
| cancelled             | Rails       | cancel受理、以後結果をcurrentへしない  | terminal                                                                       |
| timed_out             | Rails       | deadline超過                           | terminal、policyによりretryable                                                |
| partially_completed   | Rails       | 明示した欠損を伴うcommitted Snapshot   | terminal                                                                       |

Queue/Workerは最終状態を直接決定しない。Worker eventを受けたRailsがexpected current state、attempt ID、Organization/Project/Job整合性を確認し、transactionでtransitionする。

## Transition rules

- 通常は表のnext stateだけを許可する。
- 同じstateの重複eventはidempotent no-opとしてよい。
- 古いattempt、別job、別organization、現在stateより前のeventは`stale`としてauditし、状態を戻さない。
- terminal stateから別stateへ遷移しない。再実行は新AnalysisJobまたは新attemptとして表現する。
- cancelは`queued`から`finalizing`まで要求可能。ただしcommit transaction開始後は409または完了後の新jobとして扱う。
- `partially_completed`はoptional sectionが欠損しても安全にcommitted Snapshotを作れる場合だけ。Projectの`current_snapshot_id`を更新するかはproduct policyで明示する。
- Jobの`status`とProjectのsummary/current snapshot更新は同一transactionまたはoutbox整合性で行う。

## Progress contract

- `progress_percent`: integer 0〜100、同じattempt内で単調非減少。
- `phase`: pipelineの現在phase。statusと同一でもよいが将来subphaseを許容する。
- `status_message`: serverのmachine-safe summary。localized UI文言の正本にはしない。
- `retry_count`: 現在job内のWorker attempt再試行回数。
- `retryable`: 現在terminal errorに対して利用者が再実行可能か。
- `updated_at`: Railsがaccepted transitionを保存した時刻。
- `sequence`: Jobごとの単調増加event sequenceを推奨する。

UIはprogressを単調にclampできるが、Rails値を改変して永続正本にはしない。

## Cancellation and timeout

Cancel requestは即座にWorker停止を保証しない。

1. Railsが`cancel_requested_at`とactorを保存する。
2. Queue/Workerへcancel signalを送る。
3. Workerは安全な境界で停止する。
4. Railsが`cancelled`へ確定する。
5. cancel後に届いた結果はartifact cleanup対象とし、current Snapshotへcommitしない。

Jobには全体deadline、各attemptには個別deadlineを持たせる。HTTP polling timeoutとJob `timed_out`を混同しない。

## Retry

- transient fetch/LLM/storage failureは同一jobの新attemptとして自動retry可能。
- invalid URL、policy violation、membership/plan limit、schema不正はretryしない。
- retryはexponential backoff + jitter、最大回数、total deadlineを持つ。
- attempt eventは`attempt_id`と`sequence`を必須にし、前attemptの遅延結果を拒否する。
- 利用者の「再分析」は新しいAnalysisJobと新しいIdempotency scopeを作る。

## Stable and committed Snapshot

- committed Snapshot: Rails transactionが完了し、immutable payload/metadataが参照可能な正式resource。
- stable Snapshot: UIが新Job中も表示し続ける最後のcommitted Snapshot。
- working/partial artifact: Worker処理中の内部成果。browser APIには公開しない。

`finalizing`中は既存stable Snapshotを維持する。新Snapshotはpayload整合性、artifact参照、Job/Project/Organization一致を確認してからcommitし、そのtransactionでProjectの`current_snapshot_id`を更新する。

## Error model

Job error:

```json
{
	"code": "CRAWL_FAILED",
	"message": "The target could not be analyzed.",
	"retryable": true,
	"failed_phase": "crawling"
}
```

provider raw message、URL内部解決先、prompt、stackは含めない。詳細はserver log/AuditLogへcorrelation ID付きで保存する。

## Existing frontend mapping

現行TypeScriptは`queued | running | awaiting_confirmation | completing | completed | failed | cancelled | commit_failed`を使う。全面変更を避けるため、BFF mapperで次の互換変換を行う。

| Canonical Rails                  | Existing frontend status | Existing visible phase                           |
| -------------------------------- | ------------------------ | ------------------------------------------------ |
| queued                           | queued                   | target_scan                                      |
| preparing / crawling / capturing | running                  | target_scan                                      |
| internal_analysis                | running                  | inference_review                                 |
| awaiting_confirmation            | awaiting_confirmation    | inference_review                                 |
| visual_analysis                  | running                  | competitor_analysis                              |
| llm_analysis                     | running                  | industry_analysis または strategy_synthesis      |
| finalizing                       | completing               | strategy_synthesis                               |
| completed                        | completed                | strategy_synthesis                               |
| failed                           | failed                   | 最後のphase                                      |
| cancelled                        | cancelled                | 最後のphase                                      |
| timed_out                        | failed                   | 最後のphase、`errorCode=job_timed_out`へ追加予定 |
| partially_completed              | completed互換 + warning  | strategy_synthesis。専用status追加を推奨         |

現行`commit_failed`はcanonicalでは`failed` + `error.code=SNAPSHOT_COMMIT_FAILED`へ統合する。現行failure enumとcanonical error codeの対応表はBFFに置き、Rails enumをUIへ直接散布しない。

## Polling policy

MVPはpollingを継続する。

- active: 2.5秒を初期値。
- awaiting confirmation: 6秒。
- network degraded: exponential backoff、最大30秒、jitter。
- document hidden: 15〜30秒または停止し、visible復帰時に即時1回。
- terminal: 停止。
- Organization/Project/Job切替とcomponent destroy: timerとin-flight fetchをabort。
- responseはJob ID、Organization ID、attempt/sequence、updated_atを比較しstaleを拒否。

SSE/WebSocket/Supabase Realtimeは将来候補であり、Phase A-5の必須実装ではない。
