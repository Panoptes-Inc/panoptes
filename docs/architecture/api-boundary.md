# Panoptes API Boundary

Status: Phase A-5 design draft

関連文書: [現行API棚卸し](../audit/16-api-contract-inventory.md) / [API v1契約](../api/panoptes-api-v1.md) / [Job状態機械](../api/analysis-job-state-machine.md) / [OpenAPI draft](../api/openapi-draft.yaml)

## Target architecture

```text
Browser / Svelte UI
  | same-origin cookie + CSRF-protected request
  v
SvelteKit BFF
  | Supabase Bearer token + request/correlation ID
  | canonical Organization path
  v
Rails API / PostgreSQL
  | transaction + signed/trusted job message
  v
Queue -> Python Worker -> Object Storage
  | immutable result reference + completion command
  v
Rails commit -> committed AnalysisSnapshot
```

## Responsibility and trust boundaries

| Layer          | Owns                                                                                                                                                      | Must not own/trust                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Svelte UI      | input、temporary selection、render state、poll scheduling                                                                                                 | membership、Role、Job transition、billing、resource ownership     |
| SvelteKit BFF  | SSR、Supabase cookie確認、access token転送、active Organization解決、Rails URL秘匿、UI response/error shaping、CSRF/private cache                         | 業務Roleの正本、Project rule、Usage limit、Job state machine      |
| Rails          | User mapping、OrganizationMember、Role、Project、AnalysisJob、Snapshot metadata、Strategy、Roadmap、Usage、Audit、authorization、idempotency、transaction | browser store、BFFが送るuser/email/role claimの無検証利用         |
| PostgreSQL     | transactional source of truth、outbox/idempotency/audit                                                                                                   | long-running crawl/LLM execution                                  |
| Queue          | delivery、attempt metadata、visibility timeout                                                                                                            | final Job status・authorization                                   |
| Python Worker  | URL/SSRF検証、fetch、Chromium、screenshot、analysis、object upload、result submission                                                                     | User権限、membership、billing、任意DB更新、final state transition |
| Object Storage | immutable artifact・generated payload                                                                                                                     | authorization decision。accessはRails発行の短期URL等で制御        |

## BFF public surface

Browserはsame-originの`/api/panoptes/v1/...`だけを呼ぶ。BFFは対応するRails `/api/v1/organizations/{organization_id}/...`へ転送する。Rails URL、service credential、raw upstream error、Supabase tokenをbrowserへ返さない。

BFFは次だけを行う。

- `event.locals.auth`のauthenticated状態を確認する。
- active Organizationが暫定membershipに含まれることを確認する。
- Supabase access tokenを取得する前に`getUser()`検証が成功していることを要求する。
- Railsへtoken、canonical Organization ID、request metadataを渡す。
- timeout、response size、JSON envelopeを検査し、安全なUI errorへmappingする。
- protected responseを`private, no-store`とする。

BFFで一度許可してもRailsはJWT、membership、Role、resource ownershipを毎回再検証する。

## Authentication recommendation

推奨は「SvelteKit BFFがSupabase access tokenをBearerとしてRailsへ転送し、RailsがJWTを独立検証する」方式である。

```text
Cookie -> BFF getUser() success
       -> same requestのaccess token取得
       -> Authorization: Bearer <token>
       -> Rails JWT verification
       -> User mapping by provider + subject
```

Railsの検証条件:

- 許可したalgorithmだけを使う。
- issuer、audience、expiry、not-before、subjectを検証する。
- Supabase JWKSをHTTPSから取得し、短時間cacheし、unknown `kid`時だけ安全に再取得する。
- JWKS障害時はlast-known-good cacheの有効期限内だけ利用し、それ以外は401/503でfail closedする。
- email、Organization、roleはidentity hintであり認可根拠にしない。
- `(provider, subject)`でRails Userへmappingする。

この方式は独自token exchangeより実装面が単純で、Supabaseから別IdPへ変更する場合もRailsのverifier adapterを差し替えられる。将来BFFとRails間がpublic networkを跨ぐ場合は、User Bearerに加えてmTLSまたは短命service identityを追加する。BFFが署名したuserId/roleだけをRailsが信頼する方式は禁止する。

## Organization context

Rails APIのcanonical scopeはpathとする。

```text
/api/v1/organizations/{organization_id}/projects
```

理由はresource hierarchyが明示され、route/policy/log/OpenAPIでscopeを強制しやすいためである。BFFはbrowserの任意headerをそのまま転送せず、serverで検証したactive OrganizationからRails pathを構築する。

`X-Panoptes-Organization-Id`は必須の認可入力にはしない。診断用に送る場合もpathと一致しなければ400とし、Railsはpath IDについてmembershipを再確認する。body内のOrganization IDは原則禁止し、nested resourceから導出する。

別Organization resourceへのアクセスは存在を漏らさない404、同じOrganization内でRole不足なら403とする。SystemAdminのcross-organization supportは通常membershipを迂回させず、理由・期限・対象Organizationを持つ明示的support sessionとしてauditする。

Worker job messageにはRailsが確定したOrganization ID、Project ID、AnalysisJob ID、attempt IDだけを含める。Workerから返された各IDが発行済みjobと一致しなければcommitしない。

## Request headers

| Header                       | Generator                                     | Trust / logging                              | Public                   |
| ---------------------------- | --------------------------------------------- | -------------------------------------------- | ------------------------ |
| `Authorization: Bearer`      | BFFがSupabase sessionから取得                 | Railsが完全検証。値はlog禁止                 | browser responseへ非公開 |
| `X-Request-Id`               | 各hop。BFFは受信値をallowlist検証または再生成 | 1 requestの追跡。response metaへ返せる       | Yes, tokenなし           |
| `X-Correlation-Id`           | BFFがuser operation単位で生成                 | polling/queue/workerを横断。長さ・文字種制限 | Yes                      |
| `X-Panoptes-Organization-Id` | BFF、任意の診断用                             | path一致をRailsが確認。認可正本ではない      | No need from browser     |
| `Idempotency-Key`            | UI command開始時に生成、BFFが形式検証         | org+actor+operationでscope。log可            | mutationのみ             |
| `Accept`                     | BFF                                           | `application/json`                           | Yes                      |
| `Content-Type`               | BFF                                           | JSON mutationだけ                            | Yes                      |

Request/Correlation IDにはUUIDまたは`[A-Za-z0-9._-]`、最大128文字を許可し、改行を拒否する。Authorization、cookie、URL query token、secret、raw analysis contentはlogへ出さない。

## Data flow

### Read

1. UIがBFFのProject bootstrapを要求する。
2. BFFがsession・active Organizationを確認する。
3. RailsがJWT・membership・resource ownershipを再確認する。
4. Railsがdomain dataを返す。
5. BFFが既存`PanoptesProjectDetailView`へ変換する。
6. UI storeはlast stable viewとして保持する。

### Analysis command

1. UIがIdempotency-Key付きでcreate/reanalyzeを要求する。
2. Railsがmembership、Role、plan limit、URL formatを検証する。
3. Project/AnalysisJob/idempotency/outboxを同一transactionで保存して202を返す。
4. Queue consumerがWorkerへtrusted contractを渡す。
5. WorkerはSSRF防御後にartifactをObject Storageへ保存し、結果参照をRailsへ返す。
6. Railsがattempt・job・organization整合性を確認してSnapshotをtransactional commitする。
7. pollingはcommitted snapshot IDを観測して終了する。

Workerの中間結果は`stable`ではない。UIが表示し続けるstable snapshotは直前のcommitted snapshotである。新結果はRails transaction完了後だけ`current_snapshot_id`へ昇格する。

## Timeout and retry ownership

| Layer       | Policy                                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------------------- |
| Browser→BFF | read 15秒、mutation 30秒を初期値。AbortSignalをpage/organization/job切替で中止。GETだけ最大2回jitter retry      |
| BFF→Rails   | connect 2秒、read 10秒、command 25秒を初期値。GETの502/503/504だけ最大2回。POSTはIdempotency-Keyなしでretry禁止 |
| Rails       | DB statement/lock timeout、transaction短時間化、outboxでqueue publishを分離                                     |
| Worker      | fetch/Chromium/LLM/storageごとにdeadline。attempt上限とexponential backoffをQueueで管理                         |

全layerが同時に多数回retryしない。BFFがretryしたresponseをbrowserが再retryする場合も合計attempt budgetを定義する。429は`Retry-After`を尊重し、plan limitは429ではなく403または422の非retryable domain errorとして区別する。

## CSRF, CORS and cache

- Browserはsame-origin BFFだけを呼び、Railsはpublic browser CORSを許可しない。
- BFF mutationはPOST/PATCH/DELETE、SameSite cookie、SvelteKit origin checkを使用する。cross-origin要件が生じた時点でCSRF tokenを追加する。
- GETは副作用を持たない。
- Authenticated/BFF responseは`Cache-Control: private, no-store`を基本とする。
- Object artifactはRails認可後の短期signed URLを使い、Organizationを跨いで共有しない。

## API versioning and compatibility

- Rails public contractはpath versioning `/api/v1`。
- `v1`内ではfield追加を原則backward compatibleとし、既存field削除・意味変更・enum縮小を禁止する。
- breaking changeは`/api/v2`または十分な移行期間を伴う新fieldで行う。
- OpenAPIをcontract sourceとし、Rails request spec、BFF contract test、mock fixture validationで同じschemaを検証する。
- generated transport typesとdomain type/view modelを分離する。generated fileを手編集しない。
- Rails先行でadditive deploy、次にBFF/UI、最後にdeprecated field削除の順にdeployする。

## Security checklist

- JWT issuer/audience/expiry/key rotationを検証する。
- Railsでmembership・Role・ownershipを再確認する。
- strong parametersとserializer allowlistでmass assignment・sensitive field露出を防ぐ。
- Project URLはWorkerでも再検証し、private/link-local/metadata address、redirect、DNS rebindingを防ぐ。
- request/body/artifact size、rate、plan usageを制限する。
- Idempotency payload hash不一致は409、replay responseは元status/bodyを返す。
- Worker callbackは署名・nonce・timestampまたはprivate queue identityを検証する。
- AuditLogへactor、Organization、resource、action、result、correlation IDを記録する。
