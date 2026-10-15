# Module 13 — Async Job / Queue / Retry / Idempotency

Status: `COMPLETE / READY_FOR_M14`  
Phase: `TB-14`  
Difficulty: `ADVANCED`  
Prerequisites: `M01`–`M12`

## 1. 学習目標（Learning goals）

このModuleを終えた学習者は、次の内容を説明し、判断できます。

1. 長時間処理をHTTP lifecycleから分離する理由と、AsyncがParallelを意味しないことを説明する。
2. Queue、Producer、Consumer、acknowledgement、lease/visibilityを説明する。
3. AnalysisJob、Queue Message、Attemptを別のidentityとして扱う。
4. Retry対象と非対象を分類し、RetryとReanalysisを区別する。
5. Idempotencyを「一度だけ実行」ではなく「business effectを重複させない性質」と説明する。
6. duplicate delivery、timeout、cancellation、DLQ、heartbeatを責務境界付きで説明する。
7. Rails、Queue、Workerのownerを区別する。
8. CURRENT、TARGET、DEFERREDを混同せず、安全な非同期設計を評価する。

## 用語ガイド

- **Async（非同期）:** HTTP responseを待たせ続けず、時間のかかる処理を別の実行単位へ渡す方式。
- **Queue:** 実行待ちのmessageを保持し、Workerへ配送する仕組み。業務状態の正本ではない。
- **Retry（再試行）:** 同じJobの処理を、失敗後にもう一度試すこと。
- **Attempt（試行）:** 一つのJobに対する個々の実行回。Jobそのものとは区別する。
- **Idempotency（冪等性）:** 重複配送やRetryが起きても、結果や副作用を不必要に重複させない性質。
- **DLQ（Dead Letter Queue）:** 通常のRetryでは処理できなかったmessageを隔離し、調査や再処理へつなげる置き場。

## 2. Sync vs Async

### 2.1 General model

```text
Synchronous:  request -> processing -> response
Asynchronous: request -> accepted/job identity -> background processing -> later status/result read
```

同期処理では、呼び出した側が処理の完了を待ちます。非同期処理では、要求の受付と実行の完了を分け、呼び出した側はJobの識別子を使って後から状態を取得します。

Panoptesのcrawl、Chromium capture、HTML extraction、internal/visual analysis、LLM processingは、外部依存・実行時間・失敗点が多い。これらを1回のHTTP lifecycleへ閉じ込めると、HTTP timeout後に処理が継続しているか、再送で二重実行されたか、途中経過や取消をどう扱うかが不明確になります。

> **Async != Parallel.** Asyncはcallerとcompletionの時間的分離であり、複数処理の同時実行を保証しない。1 Consumerで逐次処理しても非同期であり得る。

## 3. Queue fundamentals

Queueは、処理すべき仕事をProducer（仕事を登録する側）からConsumer（受け取って処理する側）へ引き渡す配送の仕組みです。

| Term               | 意味                                                          |
| ------------------ | ------------------------------------------------------------- |
| Producer           | 実行依頼をmessageとしてenqueueする側                          |
| Message            | Consumerへ渡すexecution delivery unit                         |
| Enqueue / Dequeue  | Queueへの投入 / 取得                                          |
| Consumer           | messageを受け取りtechnical executionを行う側                  |
| Acknowledgement    | 処理済みとしてdeliveryを完了させる通知                        |
| Visibility / lease | 処理中messageを一時的に他Consumerから隠す、または所有する概念 |
| Redelivery         | ack欠落やlease expiry等により同じmessageを再配送すること      |
| DLQ                | 通常retryで回復しないmessageを隔離する場所                    |

Queueは、messageの待機・配送・再配送を支えます。ただし、AnalysisJobの正式な状態、Organizationの認可、Usage、Result/Snapshotの由来を決める業務用DBではありません。

## 4. Producer / Consumer and dispatch

PanoptesのTarget責務は次の通りです。

- Rails: User intentを検証し、canonical AnalysisJobを永続化し、実行依頼をdispatchするProducer
- Queue: execution deliveryを仲介する仕組み
- Worker: messageを受け、crawl/capture/analysis等を実行するConsumer

```mermaid
sequenceDiagram
    actor User
    participant UI as Svelte UI / Feature
    participant BFF as SvelteKit BFF
    participant Rails as Rails Business API
    participant DB as PostgreSQL
    participant Q as Queue
    participant W as Python Worker

    User->>UI: Start analysis
    UI->>BFF: Command + idempotency key
    BFF->>Rails: Authenticated organization-scoped request
    Rails->>DB: Validate and persist AnalysisJob
    Rails-->>UI: 202 + AnalysisJob identity
    Rails->>Q: Dispatch execution message
    Q->>W: Deliver message
    W->>W: Crawl / capture / analyze
    W->>Rails: Technical facts / artifact references
    Rails->>DB: Validate transition and persist canonical outcome
    UI->>BFF: Poll/read status
    BFF->>Rails: Read canonical Job/Result
    Rails-->>UI: Status / eligible result
```

DB persist前にQueue送信だけ成功すると、messageはあるのにcanonical Jobがない状態になり得ます。逆にDB commit後のdispatchが失敗すると、Jobはあるのに実行されません。既存Target文書はtransaction + outboxを整合性候補として示すが、Production実装済みではありません。本Moduleでは新しい方式やQueue製品を決定しません。

## 5. AnalysisJob, Queue Message, Attempt

```text
AnalysisJob != Queue Message != Attempt
```

| 識別する対象    | 目的                                                     | 生存期間・個数の関係                                | 正本                                          |
| --------------- | -------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------- |
| AnalysisJob     | 1つのbusiness executionとcanonical lifecycle             | Reanalysisごとに新規。1 Jobに複数delivery/attempt可 | Rails/PostgreSQL                              |
| Queue Message   | technical executionを届ける単位                          | redeliveryで同一内容が複数回届き得る                | Queue delivery metadata。Business SoTではない |
| Attempt         | 同じJobをtechnicalに実行する1試行                        | Retryごとに増え得る                                 | TARGET concept。Production model未実装        |
| Idempotency key | 同一operation requestの重複business effectを防ぐ相関キー | operation scope内で再送に利用                       | server-side enforcementが必要                 |

`1 Job -> Attempt 1 -> Attempt 2 -> Attempt 3`はあり得ます。Retryはsame Jobのtechnical recoveryであり、Reanalysisはnew Job/new lineageのbusiness executionです。Queue retryが新しいAnalysisJobを勝手に作ってはなりません。

## 6. Delivery semantics

| Model         | Property                           | Risk / note                                                                 |
| ------------- | ---------------------------------- | --------------------------------------------------------------------------- |
| at-most-once  | 重複を抑えるが、失敗時に失われ得る | 未処理messageの喪失を許容できるかが重要                                     |
| at-least-once | 処理されるまで再配送し得る         | duplicate deliveryを前提にConsumerを安全化する                              |
| exactly-once  | 観測上1回の効果を目指す            | 分散境界全体の物理的一回実行は現実的に難しく、idempotent effect等で構成する |

Panoptesで採用する具体的な配送保証は未決定です。ただし、どの製品でもtimeout、networkの分断、受領確認の消失は起こり得るため、同じmessageが重複配送されないことを前提に正しさを設計しません。

## 7. Retry model

Retryは一時的なtechnical failureからsame AnalysisJobを回復させる再試行です。

| Candidate                          | Default classification | Reason                                                        |
| ---------------------------------- | ---------------------- | ------------------------------------------------------------- |
| temporary network timeout          | Retry candidate        | 一過性で回復し得る                                            |
| upstream 429 / temporary 5xx       | Retry candidate        | backoff後に回復し得る。ただし契約・期限を考慮                 |
| temporary browser crash            | Retry candidate        | 新しいtechnical attemptで回復し得る                           |
| recoverable infrastructure failure | Retry candidate        | 一過性なら再実行可能                                          |
| invalid URL/input                  | Do not retry           | 同じinputでは決定的に失敗する                                 |
| authorization denied               | Do not retry           | Business/security decisionでありtechnical retryでは解決しない |
| permanently unsupported target     | Do not retry           | capability/policy判断が必要                                   |
| malformed persisted payload        | Do not blindly retry   | poison messageの可能性。隔離・修復・調査が必要                |

一般的なpolicy要素はmax attempts、exponential backoff、jitter、retryable classification、whole-job deadlineです。無限retryはcapacity、cost、failure visibilityを損なう。具体値は本Phaseでは決めず、既存契約の設計値もProduction設定済みとは扱いません。

LLMのRetryでは、cost、rate limit、出力が一定とは限らない性質、Model・prompt・versionの由来も考慮します。同じpromptを再送しても同じ出力になるとは限らないため、通常のHTTP GETのRetryと同一視しません。

## 8. Idempotency model

Idempotency（冪等性）は、同じ操作を複数回試しても、正式な業務上の効果を重複させない性質です。

> **Idempotency != physical execution exactly once.** Worker codeが2回動いても、承認されるSnapshot、Usage、billing effect、canonical transitionは1つに保てる設計を目指す。

Panoptesで守る対象:

- duplicate Snapshot/current selectionを作らない
- technical attemptごとにBusiness Usageを重複消費しない
- billing effectを重複させない
- stale/duplicate lifecycle updateでterminal stateを上書きしない
- artifactをJob/attempt/versionと関連付け、canonical selectionを曖昧にしない

Frontendのidempotency key生成だけでは不十分です。Serverがscope、payload signature、保存済みresponse/effectを検証して初めてbusiness idempotencyになります。CURRENT mockは同一endpoint + key + payloadなら既存Project/Jobを返し、同じkeyで異なるpayloadなら409にするが、これはProduction enforcementの証拠ではありません。

## 9. Duplicate delivery and atomic claim

```mermaid
flowchart TD
    J[Canonical AnalysisJob X] --> M[Queue message for Job X]
    M -->|delivery 1| A[Worker A / Attempt A]
    M -->|lease expiry or ack loss| B[Worker B / Attempt B]
    A --> FA[Technical facts / artifacts A]
    B --> FB[Technical facts / artifacts B]
    FA --> G{Rails validates Job, attempt, sequence, state}
    FB --> G
    G -->|accepted once| E[One canonical business effect]
    G -->|duplicate / stale| I[Ignore or audit; no overwrite]
    E --> S[Canonical status / Snapshot / Usage]
```

Scenario: Worker AがJob Xを受信し、ack前にtimeoutします。lease expiry後にWorker Bへredeliveryされる。Aが遅れて結果を返す可能性もある。

防御候補:

- canonical Job/stateを実行前に確認する
- conditional update/lock等によるatomic claim
- lease/attempt ownershipを検証する
- Job/attempt/sequenceでstale eventを拒否する
- artifact naming/commitをidempotentまたはversionedにする
- terminal stateやcurrent Snapshotを無条件上書きしない

ここでいうclaimはtechnical execution ownershipです。M12のcanonical state setへ`processing`等の新stateは追加しません。exact lock/lease/schemaはDEFERREDです。

Queue arrival orderも常に保証されません。Attempt Aの古いresultがAttempt B成功後に届いても、Railsはidentity、sequence、現在state、Organizationを検証し、canonical stateを逆行させない。

## 10. Timeout and cancellation

### 10.1 Timeout levels

| Timeout                       | What expired                  | Canonical `timed_out`との関係                        |
| ----------------------------- | ----------------------------- | ---------------------------------------------------- |
| HTTP timeout                  | client/BFF/Rails request wait | Requestが切れただけでJob終了とは限らない             |
| Queue visibility/lease expiry | delivery ownership window     | redelivery契機になり得る。Job outcomeではない        |
| Worker step timeout           | crawl/capture/LLM等の1 step   | Retryable factかもしれない                           |
| Whole Job timeout             | Job全体の許容時間             | Railsがfacts/policyを評価し`timed_out`を確定する候補 |

Technical timeoutが発生しただけでWorker/Queueが即座にbusiness `timed_out`を決めません。canonical outcome ownerはRailsです。

### 10.2 Cooperative cancellation

Target flow:

```text
User cancel intent
-> Rails authenticates, authorizes, and records canonical cancellation decision/intent
-> Worker observes cancellation at checkpoints/flag/abort boundary
-> Worker stops when safe and reports technical fact
-> Rails finalizes cancelled outcome
```

Cancel clickはinstant process killではありません。cooperative cancellationはartifact/transaction境界を安全に終えやすい一方、checkpointまで遅延します。強制killは速いが、中間artifact、lease、外部request、整合性cleanupを残す危険があります。Production propagation mechanismは未実装です。

## 11. DLQ, poison message, heartbeat, and progress

DLQは、最大再試行回数を超えたmessageや、繰り返しても正常に処理できないと判断されたmessageを、通常の配送から隔離する運用の仕組みです。原因を調べ、修復したうえで、条件を確認しながら再投入するために使います。

Poison messageの例:

- malformed payload
- unsupported message schema
- deterministic parser crash
- 修復されない参照不整合

`DLQ != failed AnalysisJob list`です。DLQはdelivery failureの隔離先で、Business outcomeはRails/PostgreSQLへ残します。DLQ messageを無検証で再投入したり、`completed`へ変えたりしません。

| Signal                    | Answers                          | Must not be confused with   |
| ------------------------- | -------------------------------- | --------------------------- |
| Heartbeat / last activity | Worker/attemptが活動中か         | 進捗率、business success    |
| Progress checkpoint       | technical stepがどこまで進んだか | canonical lifecycleの決定権 |
| Job state                 | canonical lifecycleは何か        | process healthそのもの      |

Heartbeat欠落はstuck/crashの疑いを示すが、それだけで`failed`や`timed_out`を確定しません。exact interval、threshold、schemaはDEFERREDです。

## 12. Rails / Queue / Worker boundary

| 層（Layer） | 担当すること                                                                                                                              | 担当しないこと                                                                         | 失敗時の責務                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Rails       | Job creation、authorization、canonical lifecycle、retry eligibility/business policy、cancellation decision、terminal outcome、Usage/Audit | crawl/Chromiumの実行、delivery transport                                               | factを検証し、canonical persistenceとresponseを整合させる         |
| Queue       | delivery、buffering、redelivery、supported retry scheduling、lease/visibility metadata                                                    | Business authorization、canonical outcome、Snapshot/Usage truth                        | delivery failureを観測可能にし、exhausted messageを隔離可能にする |
| Worker      | technical attempt、crawl/capture/analysis、heartbeat/progress facts、artifact production、technical error classification                  | Business statusの無条件確定、Usage/billing decision、Organization authorization policy | retry-safeに実行し、identity付きfactsをRailsへ報告する            |
| PostgreSQL  | durable Job、business status、lineage、accepted Result/Snapshot、Usage/Audit                                                              | execution delivery                                                                     | transaction/constraintによりcanonical effectを保護する            |

Queueからmessageが消えてもAnalysisJob historyは残らなければなりません。QueueはDurable Business Databaseではありません。Worker successも、validation・eligibility・persistenceを経たProduct successと同義ではありません。

## 13. Artifact and Usage boundaries

Screenshot、HTML、extraction、analysis outputはRetryで複数生成され得る。必要な設計観点はdeterministic identity、versioned artifact、attempt association、canonical selectionです。exact object key/schemaはM14以降のWorker/lineage教材へhandoffします。

同様に、`Attempt count != Usage count`です。技術的なRetryのたびにBusiness Usageを加算すると、Systemの失敗によってユーザーへ重複請求する危険があります。何をUsageとして確定するかはRailsの業務policyが決め、詳細はBilling Moduleへ引き継ぎます。

## 14. CURRENT / TARGET / DEFERRED

| 分類     | Confirmed scope                                                                                                                                                                                                                                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CURRENT  | FrontendがAnalysis command用idempotency keyを生成する。mock clientがkey/payload signatureを保持し、same request replay/different payload conflictを模擬する。polling controllerはone in-flight、timeout/backoff、stop decisionを扱う。adapter/runtime projectionはterminal/stale updateを防御する。Production business clientは未接続時503でfail closedする。 |
| TARGET   | Railsがcanonical Job/business decisionを所有し、Queueがdelivery、Workerがtechnical executionを担当する。Job/attempt/sequence検証、idempotent commit、outbox等でdispatch/persistence consistencyを保護する方向が文書化されている。                                                                                                                             |
| DEFERRED | Production Queue製品/guarantee、Worker orchestration、Attempt persistence、claim/lease方式、retry具体値、DLQ、heartbeat、cancellation propagation、artifact identity、production server-side idempotency enforcement。                                                                                                                                        |

承認済み設計原則はProduction実装完了を意味しません。特にCURRENTのtimer pollingやmock runtime progressionはQueue/Worker実装ではありません。

## 15. Representative repository mapping

| Representative source                                                | Role                          | Job / Attempt / Queue relation            | Idempotency relevance                         | 状態                            |
| -------------------------------------------------------------------- | ----------------------------- | ----------------------------------------- | --------------------------------------------- | ------------------------------- |
| [M12 AnalysisJob Lifecycle](./12-analysis-job-lifecycle.md)          | canonical lifecycle教材       | JobとRetry/Reanalysisを定義               | terminal/state overwrite防止の前提            | Approved learning contract      |
| [AnalysisJob State Machine](../../api/analysis-job-state-machine.md) | lifecycle/event設計           | attempt/sequence、stale eventの概念       | duplicate same-state no-op、old event reject  | Target design;後続PD-04差分あり |
| [API Boundary](../../architecture/api-boundary.md)                   | system responsibility         | Rails→Queue→Worker、outbox候補            | Rails validation/transaction boundary         | Target design                   |
| [Panoptes API v1](../../api/panoptes-api-v1.md)                      | HTTP/API contract             | create/read/cancel/reanalyze境界          | Idempotency-Key replay/conflict draft         | Target draft                    |
| `src/lib/panoptes/utils/idempotency.ts`                              | client identity helper        | Queue/Attemptは扱わない                   | UUID-based keyを生成するだけ                  | CURRENT frontend                |
| `src/lib/panoptes/actions/analysis.ts`                               | Feature command orchestration | create/reanalyze、pollingを起動           | operationごとにkeyを付与                      | CURRENT frontend                |
| `src/lib/panoptes/polling/analysis-polling-controller.ts`            | HTTP status polling           | Queue consumerではない                    | one in-flight、timeout/backoffを制御          | CURRENT frontend                |
| `src/lib/panoptes/actions/network.ts`                                | reconnect UX                  | delivery retryではなくclient connectivity | Queue retryと区別する例                       | CURRENT frontend                |
| `src/lib/features/analysis-job/adapter/analysis-job-adapter.ts`      | canonical response projection | terminal stopをpresentationへ写像         | unknown/status不整合をfail safe               | CURRENT frontend                |
| `src/lib/panoptes/domain/runtime-progress.ts`                        | runtime update guard          | sequence-like monotonic projection        | stale/terminal overwriteを抑止                | CURRENT frontend                |
| `src/lib/panoptes/api/mock-backend.ts` / `mock/state.ts`             | browser-local mock            | time-based Job模擬。Queue/Attemptではない | key + payload signature replay/conflictを模擬 | CURRENT mock only               |
| `src/lib/panoptes/api/unavailable-canonical-business-client.ts`      | fail-closed boundary          | Production async backend未接続を明示      | mockへのsilent fallbackを防止                 | CURRENT frontend                |

## 16. Common misunderstandings

| Misunderstanding                     | Correction                                                        |
| ------------------------------------ | ----------------------------------------------------------------- |
| Async = Parallel                     | 受付と完了の分離。並列性は別軸                                    |
| Job = Queue Message                  | Jobはbusiness identity、messageはdelivery unit                    |
| Job = Attempt                        | 1 Jobに複数technical attemptsがあり得る                           |
| Retry = Reanalysis                   | Retryはsame Job recovery、Reanalysisはnew Job/lineage             |
| Retryならeffectも繰り返す            | effectはidempotently一度に保護する                                |
| Idempotency = codeが一度しか動かない | 複数実行されてもbusiness effectを重複させない                     |
| Queue = Source of Truth              | canonical Job/history/resultはRails/PostgreSQL                    |
| DLQ = failed Job一覧                 | delivery failureの隔離でありbusiness outcome storeではない        |
| Technical timeout = 即`timed_out`    | Railsがfacts/policyからcanonical outcomeを決める                  |
| Cancel = instant kill                | authorizationとcooperative stop/finalizationを伴う                |
| Heartbeat = Progress                 | activity signalとcompletion progressは別                          |
| Worker success = Product success     | Rails validation/persistence/eligibility後にProduct outcomeとなる |

## 17. Decision heuristic

1. Business execution identityか → AnalysisJob / Rails
2. Execution deliveryか → Queue
3. Technical executionか → Worker
4. Same Jobの一時障害回復か → Retry / Attempt
5. 新しいbusiness executionか → Reanalysis / new Job
6. Duplicate business effect防止か → Idempotency
7. Exhausted technical deliveryか → DLQ / operations
8. Canonical outcomeか → Rails

## 18. Practice

### A. Knowledge check

1. Panoptes AnalysisをHTTP requestから分離する理由を2つ挙げてください。
2. AsyncとParallelの違いを説明してください。
3. Queue acknowledgementとlease/visibilityは何を守るか。

### B. Classification

次を`Business identity`、`Delivery`、`Technical execution`、`Recovery`、`Operations signal`、`Canonical outcome`へ分類してください。

`AnalysisJob` / `Queue Message` / `Attempt` / `Retry` / `Reanalysis` / `DLQ` / `heartbeat` / `completed`

### C. Duplicate delivery

同じJob XがWorker A/Bへ届いた。Snapshot、Usage、artifact、status transitionについて守るべき条件を説明してください。

### D. Retryability

`network timeout` / `invalid URL` / `429` / `authorization denied` / `browser crash` / `malformed persisted payload`をRetry候補か分類し、理由を述べてください。

### E. Timeout and cancellation

HTTP timeout、Worker step timeout、whole Job timeoutを区別してください。またCancel requestからWorker停止、canonical outcome確定までowner順に並べよ。

### F. Violation detection

各設計の問題を説明してください。

1. Queue messageをcanonical Jobとして扱う。
2. RetryのたびにUsageを加算する。
3. duplicate Workerが両方current Snapshotを更新する。
4. Workerがauthorizationを見ずbusiness `failed`を確定する。
5. retry上限を設けない。
6. DLQ messageを検証せず`completed`へ戻す。

### G. Architecture explanation

「なぜat-least-once delivery環境ではidempotencyが重要なのか」を、Job/Message/Attemptを使って説明してください。

## 19. Answers and explanation guide

### A. Knowledge check

1. request timeoutから長時間処理を分離でき、progress/retry/cancellation/historyをcanonical Jobとして追跡できる。外部障害からの回復もrequest再送と切り離せる。
2. Asyncはcallerがcompletionを同期的に待たない構造、Parallelは複数executionが同時進行する構造である。
3. acknowledgementはdelivery完了を示す。lease/visibilityは処理中の一時所有を表すが、expiry/ack lossでredeliveryされ得るためidempotencyも必要である。

### B. Classification

- Business identity: AnalysisJob、Reanalysis（new Jobを作るbusiness action）
- Delivery: Queue Message
- Technical execution: Attempt
- Recovery: Retry
- Operations signal: DLQ、heartbeat
- Canonical outcome: completed

### C. Duplicate delivery

RailsはJob/attempt/sequence/current stateを検証し、accepted Snapshot/current pointer、Usage、terminal transitionを一度だけcommitします。artifactはattempt/versionへ関連付け、両方生成されてもcanonical selectionを一意にします。古い/重複resultはignoreまたはauditします。

### D. Retryability

- Retry candidate: network timeout、429（backoff/contract条件付き）、temporary browser crash
- Do not retry: invalid URL、authorization denied
- Blind retry禁止: malformed persisted payload。poison/schema defectとして隔離・調査する

### E. Timeout and cancellation

HTTP timeoutはrequest wait、step timeoutはtechnical subtask、whole Job timeoutはbusiness deadline評価対象です。Cancellationは`User -> Rails auth/authorization + decision -> Worker observes/checkpoints -> safe stop/fact report -> Rails canonical cancelled outcome`の順で考えます。

### F. Violation detection

1. delivery metadata消失でbusiness historyを失う。
2. infrastructure failureをUserへ重複計上する。
3. lineage/current pointerが競合し再現性を失う。
4. Workerがbusiness authorityを越境する。
5. poison messageがcapacity/costを無限消費する。
6. technical isolationをbusiness successへ無検証変換している。

### G. Architecture explanation

at-least-once deliveryではack lossやlease expiryにより同じJobのmessageが複数回届き、複数Attemptが動き得る。したがって「実行が1回」と仮定せず、Rails/PostgreSQL側でidentity、state、attempt/sequence、transactionを検証し、Snapshot、Usage、status等のcanonical business effectを一度に保護する必要があります。

## 20. Completion criteria

|   # | Criterion                                          | Result |
| --: | -------------------------------------------------- | ------ |
|   1 | Sync/Async distinction explained                   | `PASS` |
|   2 | Queue fundamentals explained                       | `PASS` |
|   3 | Job/Message/Attempt distinction explained          | `PASS` |
|   4 | Retry model explained                              | `PASS` |
|   5 | Idempotency explained                              | `PASS` |
|   6 | Duplicate delivery explained                       | `PASS` |
|   7 | Timeout/cancellation explained                     | `PASS` |
|   8 | DLQ/heartbeat concepts explained                   | `PASS` |
|   9 | Rails/Queue/Worker mapping + two diagrams included | `PASS` |
|  10 | Exercises + answers included                       | `PASS` |

M13 authoring result: `10 / 10 PASS`。これは教材完成の判定であり、Production Queue/Worker、retry、DLQ、heartbeat、cancellation/idempotency実装の完成判定ではありません。

## 21. M14 handoff

Recommended next phase: `TB-15 — Module 14: Python Worker / Chromium / Collection`。

M14ではWorker process、Chromium lifecycle、crawl/capture/collection、artifact production、resource/time limits、safe execution boundaryを扱います。Queue製品選定、Production実装、artifact/lineageの未決定事項は、そのModuleでも確認済みcontractを超えて確定しません。
