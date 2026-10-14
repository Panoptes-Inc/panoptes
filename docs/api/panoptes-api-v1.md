# Panoptes Rails API v1 Contract

Status: implementation前draft

関連文書: [API境界](../architecture/api-boundary.md) / [現行API棚卸し](../audit/16-api-contract-inventory.md) / [Job状態機械](analysis-job-state-machine.md) / [OpenAPI draft](openapi-draft.yaml)

## Base and naming

- Base path: `/api/v1`
- Media type: `application/json`
- Wire field: `snake_case`
- ID: UUID string
- Timestamp: UTC RFC 3339、例`2026-08-07T03:04:05Z`
- NullableはOpenAPIに明記し、欠落と`null`を区別する。
- Money/Decimalを将来追加する場合はJSON numberではなくdecimal stringを使う。

Rails/OpenAPIから生成するtypeはtransport専用とし、BFFでcamelCase domain/view modelへ変換する。Svelte componentへraw responseを直接渡さない。

## Authentication and Organization

全業務endpointは`Authorization: Bearer <Supabase access token>`を必要とする。RailsがJWTを独立検証し、`sub`からUserをmappingする。BFFが送るemail、role、Organization claimを無検証で信用しない。

Organization scoped resourceはpathの`organization_id`をcanonical scopeとする。RailsはOrganizationMemberをDBから取得し、nested resourceが同じOrganizationに属することを確認する。

- 未認証・invalid JWT: 401
- Organization membershipなし、または別Organization resource: 404
- 同一Organization内でRole不足: 403

## Common request headers

```http
Authorization: Bearer <token>
Accept: application/json
Content-Type: application/json
X-Request-Id: <uuid>
X-Correlation-Id: <uuid-or-safe-id>
Idempotency-Key: <uuid-or-safe-id>  # commandのみ
```

`X-Panoptes-Organization-Id`は任意の診断用であり、pathと不一致なら400。認可には使用しない。

## Response envelope

Success:

```json
{
	"data": {},
	"meta": {
		"request_id": "2a05485b-90ee-4ac6-9eb8-97251667dd19"
	}
}
```

Collection metadata:

```json
{
	"data": [],
	"meta": {
		"request_id": "...",
		"page": { "cursor": null, "next_cursor": null, "has_more": false }
	}
}
```

Error:

```json
{
	"error": {
		"code": "PROJECT_NOT_FOUND",
		"message": "Project was not found.",
		"details": {},
		"request_id": "2a05485b-90ee-4ac6-9eb8-97251667dd19",
		"retryable": false
	}
}
```

`message`は安全な既定言語文。UIは原則`code`をlocalized messageへmappingする。stack、SQL、token、internal URL、provider raw errorは返さない。validation detailはfieldとmachine codeのallowlistだけを返す。

## HTTP status policy

| Status | Usage                                                                         |
| ------ | ----------------------------------------------------------------------------- |
| 200    | read/update成功、idempotent replay                                            |
| 201    | 同期的resource作成                                                            |
| 202    | AnalysisJob受付。非同期完了ではない                                           |
| 204    | bodyなしのcancel/archive成功に将来使用可                                      |
| 400    | malformed JSON/header/path整合性不正                                          |
| 401    | token欠落・無効・期限切れ                                                     |
| 403    | 同一Organization内のRole/plan policy不足                                      |
| 404    | resource不存在または別Organizationで秘匿                                      |
| 409    | stale version、既存running job、idempotency payload不一致、invalid transition |
| 422    | field/domain validation不成立                                                 |
| 429    | rate limit。`Retry-After`を付与                                               |
| 500    | Rails内部障害。詳細非公開                                                     |
| 502    | Worker/upstreamから不正response                                               |
| 503    | DB/queue/Auth key取得等の一時障害                                             |
| 504    | Railsが待つ同期upstream timeout。長時間Worker timeoutはJob statusで表す       |

ValidationはJSON自体が不正なら400、構文は正しいがfield/domain rule違反なら422。非同期analysis作成は202とし、`AnalysisJob`とpoll URLを返す。

## Idempotency

対象はProject+AnalysisJob作成、reanalyze、Strategy selection/generation、Roadmap mutation、billing、Worker result commit、webhookである。

- Header: `Idempotency-Key`
- Format: 8〜128文字、`[A-Za-z0-9._:-]`
- Scope: Organization ID + authenticated actor + operation
- Retention initial proposal: 24時間。billing/webhookはprovider要件に従い延長
- Railsはcanonical payload hash、status、responseを保存する。
- 同じkey・同じpayloadは元responseを再生する。
- 同じkey・異なるpayloadは409 `IDEMPOTENCY_KEY_REUSED`。
- retry中に処理中なら409 `IDEMPOTENCY_IN_PROGRESS`または同じJobを返す。

## Pagination

Collectionはopaque cursor paginationを使う。

- Query: `page[cursor]`, `page[limit]`
- Default 20、maximum 100
- Stable order: `created_at DESC, id DESC`
- Response: `meta.page.next_cursor`, `has_more`

## MVP endpoints

### Project

| Method | Path                                                                   | Purpose                                                            | Status |
| ------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------ | ------ |
| GET    | `/organizations/{organization_id}/projects`                            | Project一覧                                                        | 200    |
| GET    | `/organizations/{organization_id}/projects/{project_id}/bootstrap`     | Project、latest Job、committed Snapshot、Strategy/Roadmap view取得 | 200    |
| POST   | `/organizations/{organization_id}/projects/analysis-jobs`              | URLからProjectを作成して初回AnalysisJob発行                        | 202    |
| POST   | `/organizations/{organization_id}/projects/{project_id}/analysis-jobs` | 既存Projectのreanalyze                                             | 202    |

Create request:

```json
{
	"project": {
		"name": "Example",
		"target_url": "https://example.com"
	}
}
```

ResponseはProjectとAnalysisJobを返す。`preserve_current_selection`はUI concernなのでRails contractへ含めない。

### AnalysisJob

| Method | Path                                                                                      | Purpose               | Status       |
| ------ | ----------------------------------------------------------------------------------------- | --------------------- | ------------ |
| GET    | `/organizations/{organization_id}/analysis-jobs/{analysis_job_id}`                        | canonical Job状態取得 | 200          |
| POST   | `/organizations/{organization_id}/analysis-jobs/{analysis_job_id}/inference-confirmation` | 推定確認              | 200          |
| POST   | `/organizations/{organization_id}/analysis-jobs/{analysis_job_id}/cancel`                 | cancel要求            | 202または200 |

Job responseには`status`、`phase`、0〜100の`progress_percent`、`retry_count`、`retryable`、`error`、`committed_snapshot_id`、timestampsを含める。UI固有のstep panelやruntime storeはBFFで生成する。

Inference confirmation request:

```json
{
	"inferred_industry": "...",
	"inferred_structure_type": "...",
	"inferred_site_scale": "...",
	"user_override_note": null,
	"lock_version": 3
}
```

古いJob、確認済み、lock version不一致は409。Railsはparameter allowlistを使用する。

### AnalysisSnapshot

| Method | Path                                                                               | Purpose                       | Status    |
| ------ | ---------------------------------------------------------------------------------- | ----------------------------- | --------- |
| GET    | `/organizations/{organization_id}/analysis-snapshots/{snapshot_id}`                | committed Snapshot取得        | 200       |
| GET    | `/organizations/{organization_id}/projects/{project_id}/analysis-snapshots/latest` | Project最新committed Snapshot | 200 / 404 |

Snapshot APIはcommitted resourceだけを返す。中間Worker payload、storage内部key、prompt、provider responseは返さない。巨大payloadは将来section endpointへ分割可能だが、MVPでは現行UI互換の集約viewを許可する。

### StrategyPlan and Roadmap

| Method | Path                                                                                 | Purpose          | Status |
| ------ | ------------------------------------------------------------------------------------ | ---------------- | ------ |
| GET    | `/organizations/{organization_id}/analysis-snapshots/{snapshot_id}/strategy-plans`   | proposal一覧     | 200    |
| PUT    | `/organizations/{organization_id}/projects/{project_id}/selected-strategy`           | StrategyPlan選択 | 200    |
| GET    | `/organizations/{organization_id}/strategy-plans/{strategy_plan_id}/roadmap`         | Roadmap取得      | 200    |
| PATCH  | `/organizations/{organization_id}/roadmaps/{roadmap_id}/phase-tasks/{phase_task_id}` | task status更新  | 200    |

Strategy selection request:

```json
{
	"strategy_plan_id": "uuid",
	"lock_version": 2
}
```

PhaseTask request:

```json
{
	"task_status": "in_progress",
	"reason": null,
	"lock_version": 5
}
```

StrategyPlanは`generated | reviewed | approved | superseded`のlifecycleを持つ。AI提案を選択しただけで`approved`とはみなさない。人の選択・編集・承認actorとtimestampを保存する。

### Usage

現行clientに`GET /api/usage/current`があるが未使用のためPhase A-5 MVP OpenAPIから除外する。header表示やplan limit UIを接続する際にRails Usage APIとして追加する。

## Timeout and retry

- GETはBFFで10秒timeout、502/503/504に限りjitter付き最大2回。
- Mutationは25秒timeout。Idempotency-Keyがある場合だけtransport failure後の安全な再照会・retryを許可する。
- 401/403/404/409/422は自動retryしない。
- 429は`Retry-After`に従う。
- Analysis処理自体のtimeoutはHTTP 504ではなくJobの`timed_out` terminal stateで返す。

## Contract ownership

OpenAPIがwire contractの正本である。Rails model、current TypeScript type、mock fixtureのいずれも単独の正本にはしない。

推奨生成フロー:

1. `docs/api/openapi-draft.yaml`を更新する。
2. CIでOpenAPI lint/validationとbreaking diffを実行する。
3. TypeScript transport typeを生成する。
4. Rails request specとresponse schema validationを実行する。
5. BFF mapperでtransportからdomain/view modelへ変換する。

生成物は例として`src/lib/generated/panoptes-api-v1.ts`へ置き、手編集禁止headerを付ける。code generatorはRails着手時にOpenAPI Generator、Orval、openapi-typescript等を比較して固定する。
