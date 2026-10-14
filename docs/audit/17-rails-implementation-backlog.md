# Rails API Implementation Backlog

Status: Phase A-5 proposal

関連文書: [現行API棚卸し](16-api-contract-inventory.md) / [API境界](../architecture/api-boundary.md) / [API v1契約](../api/panoptes-api-v1.md) / [OpenAPI draft](../api/openapi-draft.yaml)

規模目安: S=0.5〜2日、M=3〜5日、L=1〜2週、XL=分割必須。Rails app、DB、Queue、Workerは未作成のため、日数は設計比較用でありcommitmentではない。

| ID | Priority | Purpose | Dependencies | Acceptance criteria | Risk | Size |
| --- | --- | --- | --- | --- | --- | --- |
| R00 | P0 | Rails API-only基盤、環境設定、health、JSON logging | deployment方針 | `/up`とversioned route、secret server-only、request ID log、CI起動 | hosting/adapter未決 | M |
| R01 | P0 | OpenAPI validationとrequest/response schema gate | R00、A-5 draft | CIでYAML/lint/breaking diff、Rails request specがschema検証 | generator選定 | M |
| R02 | P0 | Supabase JWT verifier | R00、issuer/audience/JWKS設定 | signature/iss/aud/exp/nbf/kid rotation test、fail closed、token非logging | JWKS障害・clock skew | L |
| R03 | P0 | User mapping | R02 | `(provider, subject)` unique、email変更でidentity不変、無効User拒否 | account merge | M |
| R04 | P0 | Organization schema | R00 | Organization UUID、status、timestamps、archive policy | tenant lifecycle | M |
| R05 | P0 | OrganizationMember・Role policy | R03,R04 | membership DB正本、Role enum/policy、別org 404、role不足403 | policy漏れ | L |
| R06 | P0 | SystemAdmin/support session境界 | R05 | org roleと分離、理由/期限/actor audit、通常Userが自己申告不能 | 高権限誤用 | L |
| R07 | P0 | BFF→Rails auth/org integration contract | R02,R05、SvelteKit BFF | Bearer再検証、path org正本、request/correlation ID、Rails URL/token非公開 | 二重認可の不一致 | L |
| R08 | P0 | Common envelope/error/status mapping | R00,R01 | 全endpointで共通success/error、internal detail masking、retryable | 既存UI互換 | M |
| R09 | P0 | Idempotency store/middleware | R03,R05 | org+actor+operation scope、payload hash、replay、異payload409、concurrency test | storage肥大化 | L |
| R10 | P1 | Project model・policy | R05 | Organization scoped CRUD read、URL/name validation、archive、lock_version | URL policy | L |
| R11 | P1 | Project list/bootstrap endpoints | R08,R10 | P01/P02相当、cursor pagination、別org 404、OpenAPI request specs | aggregate query性能 | L |
| R12 | P1 | AnalysisJob model/state machine | R05,R09,R10 | canonical enum、transition guard、terminal不変、progress単調、audit | 状態爆発 | L |
| R13 | P1 | AnalysisJob create/reanalyze commands | R09,R10,R12 | transactionでProject/Job/idempotency/outbox、202、running競合409 | duplicate job | L |
| R14 | P1 | Inference confirmation/cancel | R12 | stale/lock conflict409、確認後resume、cancel race test | race condition | M |
| R15 | P1 | Queue outbox・publisher | R12,R13、Queue選定 | DB commit後delivery、duplicate safe、correlation/attempt IDs | dual write | L |
| R16 | P1 | Worker job contract | R15、Python team | signed/trusted schema、org/project/job/attempt一致、versioning、fixture test | contract drift | M |
| R17 | P1 | Worker URL/SSRF policy | R16 | scheme/port/DNS/redirect/private IP/metadata防御test | DNS rebinding | L |
| R18 | P1 | Worker result commit endpoint/consumer | R12,R15,R16 | stale attempt拒否、schema/ownership確認、idempotent commit | forged/replayed result | L |
| R19 | P1 | AnalysisSnapshot schema・Object Storage metadata | R18 | immutable snapshot、artifact checksum、storage key非公開、org scope | payload size | L |
| R20 | P1 | Atomic Snapshot promotion | R12,R19 | finalizing→completedとProject current snapshotをtransaction更新、stable snapshot保持 | partial commit | L |
| R21 | P1 | Job polling endpoint | R12,R20 | canonical status/progress/error/sequence、ETag任意、terminal test | hot polling load | M |
| R22 | P1 | SvelteKit BFF transport/mappers | R07,R08,R11,R21 | timeout/abort/retry、snake/camel、legacy view mapping、no secret exposure | client drift | L |
| R23 | P1 | Panoptes client endpoint段階移行 | R22 | P01〜P06をBFFへ接続、mock opt-in維持、UI挙動不変 | cutover regression | L |
| R24 | P2 | StrategyPlan domain/lifecycle | R05,R19 | generated/reviewed/approved/superseded、actor/timestamp、snapshot linkage | AI/人編集混同 | L |
| R25 | P2 | Strategy selection endpoint | R09,R10,R24 | selected plan transaction、stale lock409、audit | concurrent selection | M |
| R26 | P2 | Roadmap・PhaseTask domain | R24 | phase/task ordering、status transition、lock_version、history | flexible schema | L |
| R27 | P2 | Roadmap read/update endpoints | R08,R09,R26 | P07/P08相当、task mutation、別org/ownership test | mass assignment | M |
| R28 | P2 | Strategy/Roadmap BFF移行 | R22,R25,R27 | current UI contract維持、mock/formal contract差分解消 | view mapping | M |
| R29 | P2 | UsageRecord・plan limit | R05,R12 | atomic reservation/commit、rate limitとplan limit区別、P09判断 | billing整合性 | L |
| R30 | P2 | AuditLog | R03,R05 | actor/org/resource/action/result/correlation、append-only、masking | 個人情報 | L |
| R31 | P2 | Rate/body/response limits | R07,R10 | per-user/org endpoint limit、413、429 Retry-After | false positive | M |
| R32 | P2 | Observability/SLO | R15,R21,R30 | latency/error/queue age/job duration dashboards、alert、token masking | cardinality | M |
| R33 | P2 | Contract test matrix | R01以降 | TS BFF、Rails request、mock fixture、Worker event、error/auth/org tests | fixture陳腐化 | L |
| R34 | P3 | Project archive/history APIs | R10,R30 | product要件確定後だけ追加 | MVP scope増大 | M |
| R35 | P3 | Realtime評価 | R21,R32 | polling負荷実測後にSSE/WebSocket/Realtime ADR | premature complexity | M |
| R36 | P0 | Production secret/deployment boundary | R00,R02 | Rails/Worker secretをfrontend CIへ渡さずrotation runbook・scanner | credential exposure | M |

## 最初の着手順

最初のimplementation sliceは`R00 → R01 → R02 → R03 → R04 → R05 → R07 → R08`とする。ここで「認証済みUserが、自分のOrganization scoped read endpointをRailsから取得し、別Organizationは404になる」vertical sliceを完成させる。

次に`R09 → R10 → R11`でProject read/bootstrapを接続する。QueueやWorkerを先に作らない。identity・membership・error contract・idempotencyがない状態で非同期処理を始めると、後から全endpointとjob messageを壊すためである。

その後`R12〜R23`でAnalysisJobからcommitted Snapshotまでを一貫して実装し、最後にStrategy/Roadmapへ進む。

## Definition of done for each endpoint

- OpenAPI operationとschemaがある。
- Rails request specでsuccess、401、403、cross-org 404、validation、conflictを確認する。
- policy scopeとstrong parametersがある。
- request/correlation IDをresponse/log/auditへ渡す。
- token、secret、sensitive payloadをlogしない。
- mutationはidempotency/concurrency/lockを検討する。
- BFF contract testとUI error mappingがある。
- mockを使う場合は同じcontract fixtureで検証する。
- timeout・retryable・cache policyが明示される。
