# Module 11 — API / OpenAPI

Status: `COMPLETE / READY_FOR_M12`  
Phase: `TB-12`  
Difficulty: `INTERMEDIATE`  
Prerequisites: `M01`–`M10`

## 1. Learning goals

このModuleを終えたLearnerは、次を説明・判断できる。

1. APIをURLではなくsystem間contractとして説明する。
2. HTTP method、request、response、status、headerの意味を読む。
3. Frontend Client、BFF、Rails API、OpenAPI、business ruleを区別する。
4. success/error envelopeとvalidation/auth boundaryを追跡する。
5. OpenAPI operation、schema、security、operationIdを読む。
6. versioningとbackward compatibilityのriskを判断する。
7. CURRENT implementationとdraft TARGET contractを混同しない。

## 2. API fundamentals

APIはsystem間の明示的なcontractである。

| Term     | Meaning                                        |
| -------- | ---------------------------------------------- |
| Client   | APIを呼び出すconsumer                          |
| Server   | requestを受けcontractに従ってresponseを返す側  |
| Endpoint | methodとpathで識別される入口                   |
| Request  | path/query/header/body/auth contextを含む入力  |
| Response | status/header/bodyを含む結果                   |
| Method   | request intentのHTTP vocabulary                |
| Status   | transport/application outcomeの分類            |
| Body     | structured payload。PanoptesではJSONが基本     |
| Header   | media type、credential、request ID等のmetadata |

同じURLでもGETとPOSTは別operationになり得る。Body shape、required field、error、authorization、semantic meaningまで含めてcontractである。

## 3. HTTP fundamentals

| Method | General meaning                          | Safe | Idempotent    | Panoptes context                     |
| ------ | ---------------------------------------- | ---- | ------------- | ------------------------------------ |
| GET    | resource/read modelを取得                | Yes  | Yes           | CURRENT 5 read endpoint              |
| POST   | command、作成、action                    | No   | defaultではNo | TARGET Analysis作成・confirm・cancel |
| PUT    | resource/selectionを全体的・決定的に設定 | No   | Yes by intent | draft Strategy selection             |
| PATCH  | resourceの一部を変更                     | No   | operation次第 | draft Roadmap task更新               |
| DELETE | resourceを削除                           | No   | Yes by intent | CURRENT/draftに代表operationなし     |

Safeは「server stateを変更する目的ではない」、Idempotentは「同じrequestを複数回行っても意図した最終効果が同じ」という概念である。POSTもIdempotency-Keyやbusiness identityにより安全なreplay contractを設計できるため、`POST = 必ず非Idempotent`ではない。

## 4. Panoptes API position

```text
Frontend Feature / Controller
  -> Command or query intent
  -> Frontend Client
  -> SvelteKit BFF (/api/panoptes/v1)
  -> Rails Business API (/api/v1)
  -> Business rule / PostgreSQL
```

APIはTransport ContractでありBusiness Ruleそのものではない。

- Command: User/use-case intentを表す。
- Client: endpoint selection、serialization、timeout、parsingを扱う。
- BFF: Browser-facing same-origin contract、session、safe forwarding/adaptationを扱う。
- Rails API: business operation/resource contractを公開する。
- Rails business logic: authorization、rule、transition、transactionを決める。
- OpenAPI: wire contractをmachine-readableに記述する。

## 5. Endpoint and operation design

Endpointはresourceまたはbusiness operationへの入口である。

### Resource-oriented

```http
GET /organizations/{organization_id}
GET /organizations/{organization_id}/projects
```

Resource/read modelを取得する。

### Operation-oriented

```http
POST /organizations/{organization_id}/analysis-jobs/{analysis_job_id}/cancel
POST /organizations/{organization_id}/analysis-jobs/{analysis_job_id}/inference-confirmation
```

単純CRUDでは表しにくいbusiness intentを明示する。REST純粋主義より、authorization、idempotency、state transition、errorが明確であることを優先する。

CURRENT Rails routesは`health`、`me`、Organizations list/detail、current Membershipの5 GETだけ。Project、AnalysisJob、Snapshot、Strategy/Roadmapのpathはdraft TARGETであり、production実装済みではない。

## 6. Request contract

Request contractは入力場所と意味を分ける。

| Input           | Example                               | Meaning                                   |
| --------------- | ------------------------------------- | ----------------------------------------- |
| Path parameter  | `organization_id`                     | resource hierarchy/canonical scope        |
| Query parameter | `page[cursor]`, `page[limit]`         | draft collection navigation               |
| Header          | Authorization、Request/Correlation ID | credential/trace/transport metadata       |
| Body            | Project name、target URL              | mutation payload                          |
| Session context | Supabase server session               | BFF credential source。body fieldではない |

各fieldにはrequired/optional、type、allowed value、nullable、semantic meaningが必要である。`organization_id`がUUID stringであるだけでは、actorがそのOrganizationへアクセス可能とは限らない。

Panoptes draft convention:

- Rails base path: `/api/v1`。
- JSON wire field: `snake_case`。
- ID: UUID string。
- Timestamp: UTC RFC 3339。
- Organization scope: pathがcanonical。任意header/body IDをauthorization proofにしない。
- command: Idempotency-Keyを要求する候補。

## 7. Response contract

CURRENT Rails success envelope:

```json
{
	"data": {},
	"meta": {
		"request_id": "...",
		"correlation_id": "..."
	}
}
```

Collectionではdraft上`meta.page`へcursor等を追加する。ClientはHTTP成功だけでなく、`data` envelopeとresource shapeを検証する。

Rails internal modelをそのまま返さない理由:

- internal columnやcredentialを露出しない。
- DB refactorとwire contractを分離する。
- operationに必要なfieldだけを安定化する。
- historical/current/view modelの意味を明示する。
- snake_case transportからFrontend view modelへmappingできる。

```text
Database schema != API schema != Frontend view model
```

## 8. Status code contract

|      Status | Concept                                 | Panoptes usage                                      |
| ----------: | --------------------------------------- | --------------------------------------------------- |
|         200 | read/update成功、replay成功             | CURRENT GET、Target update                          |
|         201 | 同期的resource作成                      | future candidate                                    |
|         202 | 非同期operation受付                     | Target AnalysisJob create/cancel。完了ではない      |
|         204 | bodyなし成功                            | future cancel/archive候補                           |
|         400 | malformed request/header/path mismatch  | CURRENT missing parameter mapping等                 |
|         401 | unauthenticated/invalid token           | CURRENT BFF/Rails                                   |
|         403 | authenticatedだがpermission不足         | CURRENT role/context cases                          |
|         404 | not found/cross-tenant concealment      | CURRENT Organization scope cases                    |
|         409 | current stateとのconflict               | Target stale lock/idempotency/invalid transition    |
|         422 | syntactically validだがvalidation不成立 | CURRENT RecordInvalid mapping                       |
|         429 | rate limit                              | Target。Retry-Afterを使用                           |
|         500 | internal failure                        | CURRENT safe Rails handler                          |
| 502/503/504 | upstream/service/timeout category       | 503はCURRENT BFF upstream error。詳細はcontract依存 |

`202`はjob完了を意味しない。`200`でもpayload内に独自failure flagを埋めて全errorを成功扱いにしてはいけない。HTTP statusとmachine-readable error codeを両方使う。

## 9. Error contract

CURRENT Rails/OpenAPI shape:

```json
{
	"error": {
		"code": "FORBIDDEN",
		"message": "This action is not permitted.",
		"details": {},
		"retryable": false
	},
	"meta": {
		"request_id": "...",
		"correlation_id": "..."
	}
}
```

- `code`: UI・clientが分岐できるstable machine code。
- `message`: token、SQL、stack、provider raw detailを含めないsafe message。
- `details`: allowlisted validation/context detail。
- `retryable`: automatic/manual retry判断のhint。business ruleを置き換えない。
- `meta`: tracing用request/correlation ID。

Business errorとtechnical errorを分ける。Permission不足、invalid transition、validation failureはbusiness/application error。DB/queue/upstream unavailableやunhandled exceptionはtechnical errorである。

### Confirmed documentation drift

`panoptes-api-v1.md`のError JSON例は`request_id`を`error`内へ置くが、CURRENT Rails `ApplicationController`とOpenAPI `ErrorEnvelope`は`meta.request_id`を使う。現時点で三者が完全同期しているとは表現できない。本教材はCURRENT implementation/OpenAPI shapeを例示し、prose documentの同期を後続contract maintenanceへhandoffする。

## 10. Validation layers

| Layer                     | Owns                                           | Must not be mistaken for      |
| ------------------------- | ---------------------------------------------- | ----------------------------- |
| Frontend                  | UX feedback、input assistance                  | canonical business validation |
| Client                    | response envelope/resource assertion           | server authority              |
| BFF                       | method/path/content/session/context/size等     | eligibility/state transition  |
| OpenAPI/schema validation | wire shape/type/required/enum                  | full business correctness     |
| Rails                     | business/application validation、authorization | mere transport parsing        |
| PostgreSQL                | integrity constraints                          | application authorization     |

OpenAPIにrequired fieldがあることと、現在のplan/resource stateでoperation可能であることは別である。

## 11. Authentication and authorization in API

OpenAPI rootはBearer securityを宣言し、`/health`だけ`security: []`で上書きする。しかしsecurity schemaは「credentialの型と必要性」をdocumentするだけで、Rails authorization implementationではない。

Railsはrequestごとに次を確認する。

- JWT signature/issuer/audience/expiration。
- Panoptes User status。
- Organization Membership/status。
- Resource ownership。
- Role/action permission。
- Resource state。

CURRENT Rails `/api/v1/health`はauthentication before_actionをskipする。一方、CURRENT Browser-facing BFF `/api/panoptes/v1/*`のroute policyとproxy helperはhealthを含めauthenticationを要求する。この差はRails internal/public contractとBrowser-facing surfaceが1:1でない具体例である。

## 12. Client / Command / BFF / Rails contract

| Layer                | Owns                                                                          | Does not own                      |
| -------------------- | ----------------------------------------------------------------------------- | --------------------------------- |
| Command/query intent | use-case input/output、User intent                                            | HTTP/session/raw response         |
| Frontend Client      | BFF path/method、serialization、timeout/abort、response assertion             | canonical rule/session truth      |
| SvelteKit BFF        | Browser-facing endpoint、session/token、safe forwarding、transport adaptation | business outcome/state transition |
| Rails API            | business resource/operation contract、status/error response                   | Browser-local presentation        |
| OpenAPI              | machine-readable wire contract                                                | runtime implementation itself     |

BFFとRailsが1:1 proxyになる場合もあるが、常に同じではない。BFFはFrontend向けにcamelCase view modelへmappingしたり、複数readをcompositionしたりできる。ただし403を200へ変更する、PartialをCompletedへ意味変更する等のbusiness reinterpretationはしない。

CURRENT `canonical-bff-client.ts`はsame-origin BFFだけを呼び、timeout/abort/network errorを`PanoptesApiError`へ変換し、success `data` envelopeとOrganization/User/Membership shapeをruntime assertする。

## 13. OpenAPI fundamentals

OpenAPIはHTTP API contractをmachine-readableに記述する仕様である。

| Element                        | Meaning                             |
| ------------------------------ | ----------------------------------- |
| `paths`                        | endpoint paths                      |
| operation (`get`, `post`等)    | methodごとのcontract                |
| `parameters`                   | path/query/header input             |
| `requestBody`                  | body content/schema                 |
| `responses`                    | statusごとのresponse                |
| `schemas`                      | reusable data shape                 |
| `security` / `securitySchemes` | credential requirement              |
| `operationId`                  | operationのstable unique identifier |

Panoptes fileはOpenAPI `3.1.0`、API version `1.0.0-draft`。placeholder server URLを持つためdeployment hostの証拠にはならない。

## 14. CURRENT Panoptes OpenAPI profile

限定確認した現在値:

- 18 operations。
- 18 operationIds。
- 18 unique operationIds、duplicate 0。
- methods: GET、POST、PUT、PATCH。
- global `bearerAuth`、`/health` overrideなし認証。
- Organization、Project、AnalysisJobs、Snapshots、Strategy等のschema/pathを含む。

重要なstatus distinction:

```text
OpenAPI draft definition != Production implementation complete
```

CURRENT Rails routesは5 GETのみで、OpenAPI 18 operationsのうちProject/AnalysisJob/Snapshot/Strategy等はTarget contractである。OpenAPIはwire contractの正本候補/設計正本だが、statusが`draft`であり、request spec・BFF implementation・production verificationが未完了である。

## 15. operationId

`operationId`は各operationを一意に識別するstable nameである。

用途:

- generated client method名。
- documentation/reference。
- test/trace mapping。
- rename/breaking-change review。

重複するとgeneratorがmethodを上書き・renameしたり、operation参照が曖昧になる。Panoptes draftでは現在18/18 uniqueだが、これはendpoint実装やsemantic correctnessまで証明しない。

代表例:

- `getCurrentUserOrganization`
- `createProjectAnalysisJob`
- `getAnalysisJob`
- `getAnalysisSnapshot`
- `updateRoadmapPhaseTask`

## 16. Schema contract

OpenAPI schemaはobject、property、required、nullable、enum、array、format、additionalProperties等でwire shapeを定義する。

Panoptes例:

- `Uuid`: string + uuid format。
- `Timestamp`: string + date-time format。
- `ErrorEnvelope`: required `error`, `meta`。
- `OrganizationEnvelope`: required `data`, `meta`。
- `AnalysisJobStatus`: state enum。
- collection envelope: array data + metadata。

Nullableとfield欠落は同じではない。Enumへの値追加もconsumerがexhaustive switchを持つ場合はbreaking riskになる。

DB schemaはstorage最適化とintegrity、API schemaはconsumer contractを表す。全DB columnを公開せず、internal storage key、prompt/provider response、secret等を除外する。

## 17. Versioning and backward compatibility

Panoptes boundary:

- Browser-facing BFF: `/api/panoptes/v1`。
- Rails API: `/api/v1`。
- OpenAPI info version: `1.0.0-draft`。

Path `v1`はbackward-incompatible contract changeを管理するboundary。すべてのfield追加でv2へ上げるわけではない。

| Change                  | Typical compatibility                           |
| ----------------------- | ----------------------------------------------- |
| optional additive field | 多くの場合compatible。ただしstrict parserを確認 |
| required field追加      | existing request consumerにはbreaking           |
| enum value追加          | exhaustive consumerにはbreaking risk            |
| field removal/rename    | breaking                                        |
| type変更                | breaking                                        |
| semantic meaning変更    | shape不変でもbreaking                           |
| endpoint removal        | breaking                                        |

安全な方向はRails/OpenAPIでadditive deploy、BFF/UI対応、deprecation期間、最後にold field removal。Frontend/Backendが常にatomic deployされるとは仮定しない。

## 18. API response vs canonical business state

API responseはcanonical stateの表現であり、canonical stateそのものをFrontendが所有するという意味ではない。

```text
Rails decides and persists Job transition
  -> API represents accepted Job status
  -> BFF preserves/maps transport safely
  -> Frontend renders status
```

FrontendはJob responseを見て次のcanonical transitionを勝手に確定しない。OpenAPI enumもstate machine implementationではない。

## 19. Pagination, filtering, and sorting

Draft contractはProject collectionでopaque cursor paginationを定義する。

- `page[cursor]`
- `page[limit]`
- default 20、maximum 100。
- stable order proposal: `created_at DESC, id DESC`。
- response: `meta.page.next_cursor`, `has_more`。

CURRENT Organization listはRailsでname ascendingに並べた全件readで、pagination contractは実装されていない。Filtering/sortingの一般的な追加もAPI contract変更であり、query semanticsとauthorizationを明記する。

## 20. Idempotency boundary

Mutation retryでは同じintentが重複effectを起こし得る。Draftはcommand向け`Idempotency-Key`を定義する。

- format: 8–128文字、safe character set。
- scope: Organization + actor + operation。
- same key/same payload: original response replay候補。
- same key/different payload: 409。
- processing中: 409または同一Job response候補。

CURRENT BFF/Railsにはproduction Analysis mutation/idempotency storeがない。Queue/retry/idempotencyのexact contractはM12以降へhandoffする。

## 21. CURRENT / TARGET / DEFERRED

| Area           | CURRENT                                          | TARGET                                       | DEFERRED                                           |
| -------------- | ------------------------------------------------ | -------------------------------------------- | -------------------------------------------------- |
| Rails surface  | 5 GET: health/me/organizations/detail/membership | Organization-scoped business API             | Project/Job/Snapshot/Strategy/Usage implementation |
| BFF surface    | corresponding 5 same-origin GET routes           | explicit Browser-facing business endpoints   | mutation/CSRF/body limit contracts                 |
| Client         | typed/asserted Organization boundary reads       | generated/validated transport types + mapper | generator selection/migration                      |
| Response/error | `{data,meta}` / `{error,meta}` CURRENT           | schema-tested stable envelopes               | prose error-example drift resolution               |
| OpenAPI        | 3.1 draft、18 operations/18 unique IDs           | wire contract source + CI validation         | implementation/request spec completion             |
| Pagination     | draft Project cursor contract                    | stable authorized collection reads           | implementation/tuning                              |
| Idempotency    | design draft                                     | durable command replay contract              | DB/outbox/retention implementation                 |
| Versioning     | `/api/panoptes/v1` and `/api/v1`                 | additive v1 compatibility                    | breaking diff CI/migration policy execution        |

## 22. Contract trace — CURRENT Organization detail

```text
PanoptesShell controller dependency
  -> loadOrganizationBoundary({ organizationId })
  -> organizationBoundaryClient.getOrganization(...)
  -> canonical-bff-client GET
     /api/panoptes/v1/organizations/{encoded organizationId}
  -> SvelteKit +server.ts
  -> proxyActiveOrganizationRailsGet
     session + active Organization context check
  -> proxyRailsGet
     Authorization Bearer + request/correlation IDs
  -> Rails GET /api/v1/organizations/:organization_id
  -> routes.rb -> OrganizationsController#show
  -> Rails JWT + DB Membership/Role authorization
  -> render_success { data: Organization, meta }
  -> BFF preserves status/body + safe headers
  -> canonical-bff-client parses envelope and asserts Organization
  -> Feature verifies organization/membership scope
  -> Controller continues bootstrap or surfaces safe error
```

このtraceはCURRENTで追跡可能。ただしFeatureはOrganization detailとMembershipを並列取得して境界を検証する。Production Analysis command endpointの実装証拠にはならない。

## 23. Representative repository mapping

以下は限定確認した12例であり、全endpoint/OpenAPI operation監査ではない。

| Source                                                                  | Method/contract                     | Request                      | Response                                | Auth/owner               | Status                             |
| ----------------------------------------------------------------------- | ----------------------------------- | ---------------------------- | --------------------------------------- | ------------------------ | ---------------------------------- |
| `docs/api/openapi-draft.yaml`                                           | 18 operation machine-readable draft | parameters/body/security     | schemas/responses                       | wire contract draft      | `CURRENT document / mixed TARGET`  |
| `docs/api/panoptes-api-v1.md`                                           | v1 prose contract                   | headers/body/conventions     | envelope/status/error                   | Rails contract design    | `DRAFT; known error-example drift` |
| `docs/architecture/api-boundary.md`                                     | Browser/BFF/Rails trust boundary    | same-origin/Bearer/org path  | safe mapped response                    | layer owners             | `TARGET design + CURRENT subset`   |
| `rails/config/routes.rb`                                                | 5 GET route mappings                | path params                  | controller dispatch                     | Rails                    | `CURRENT`                          |
| `rails/app/controllers/application_controller.rb`                       | shared API envelope/error           | request context/errors       | `{data,meta}` / `{error,meta}`          | Rails                    | `CURRENT`                          |
| `rails/app/controllers/api/v1/organizations_controller.rb`              | GET list/detail                     | authenticated user/org ID    | Organization envelope                   | Rails business read      | `CURRENT`                          |
| `rails/app/errors/api_error.rb`                                         | machine error vocabulary            | error condition              | code/status/details/retryable           | Rails                    | `CURRENT`                          |
| `src/lib/panoptes/api/canonical-bff-client.ts`                          | 5 GET Browser client                | typed IDs/AbortSignal        | asserted data/PanoptesApiError          | Frontend transport       | `CURRENT`                          |
| `src/routes/api/panoptes/v1/organizations/+server.ts`                   | GET Organization list BFF           | session request              | Rails response                          | BFF/Rails                | `CURRENT`                          |
| `src/routes/api/panoptes/v1/organizations/[organization_id]/+server.ts` | GET Organization detail BFF         | path org ID                  | Rails response                          | active-org guard + Rails | `CURRENT`                          |
| `src/lib/server/rails/client.ts`                                        | safe GET proxy                      | server session/internal path | preserved upstream/safe 503             | BFF transport            | `CURRENT read-only`                |
| `src/lib/features/organization/organization-boundary.ts`                | Feature boundary query              | active Organization ID       | Organization + Membership or safe error | Feature consumer         | `CURRENT`                          |

## 24. Common misunderstandings

### 「API = URL」

Method、input/output schema、status、error、auth、semanticsまでがcontract。

### 「OpenAPI = implementation」

OpenAPIは記述。Route/controller/test/deployが存在しなければruntime featureではない。

### 「OpenAPI security = Authorization実装」

Security schemeはcredential requirementの宣言。Rails policy実装・DB queryを代替しない。

### 「DB schema = API schema」

Storage shapeとconsumer contractは別。internal fieldを無制限に公開しない。

### 「BFF API = Rails API」

対応することは多いが、surface、session、mapping、compositionが異なる。意味は勝手に変えない。

### 「HTTP 200なら常にbusiness success」

Contractに従う。Errorを200へ包む設計はstatus semanticsを壊す。

### 「Frontend validation = Business validation」

FrontendはUX。Railsがcanonical validationを再実行する。

### 「OpenAPIにある = Production ready」

Panoptesの18 operationsはdraftを含み、CURRENT Railsは5 GETのみ。

### 「POSTは必ず非Idempotent」

HTTP default semanticsだけでなくIdempotency-Key/business identityでreplay contractを設計できる。

## 25. Decision heuristic — これは何の責務か

1. User/use-case intentか。  
   → Command/query boundary。
2. Frontend transport、timeout、parsingか。  
   → Client。
3. Browser-facing same-origin server contractか。  
   → SvelteKit BFF。
4. Business resource/operation wire contractか。  
   → Rails API + OpenAPI。
5. Business rule/authorization/state transitionか。  
   → Rails implementation。
6. Durable state/integrityか。  
   → PostgreSQL。
7. Machine-readable shape/documentationか。  
   → OpenAPI。ただしruntime verificationが必要。

## 26. Practice

### 26.1 Knowledge Check

1. API contractはURL以外に何を含むか。
2. SafeとIdempotentの違いは何か。
3. `202 Accepted`がAnalysis完了を意味しない理由は何か。
4. OpenAPIとruntime implementationの違いは何か。
5. operationIdを一意にする理由は何か。

### 26.2 Contract Reading

OpenAPI `getCurrentUserOrganization`を読み、次を答える。

- method
- path
- path parameter
- success schema
- error response
- auth requirement

次に`createProjectAnalysisJob`を読み、CURRENT実装かTARGET draftかを答える。

### 26.3 Status Exercise

次のstatus conceptを選ぶ。

1. Tokenなし。
2. 同じOrganizationだがrole不足。
3. Cross-tenant resourceを秘匿。
4. Job createを非同期受付。
5. stale lock version。
6. Rails unhandled exception。

### 26.4 Responsibility Exercise

次をCommand / Client / BFF / Rails / OpenAPIへ分類する。

1. Start Analysis intentを表す。
2. AbortSignalとtimeoutを扱う。
3. Supabase session tokenをRailsへ転送する。
4. Analysis eligibilityを判断する。
5. Request/response schemaをmachine-readableに記述する。
6. HTTP errorをsafe UI errorへ変換する。

### 26.5 Contract Trace

Organization detail readを、Feature、Client、BFF route/proxy、Rails route/controller、response、Client assertionまで順に説明せよ。

### 26.6 Violation Detection

1. DB tableの全columnを自動JSON化する。
2. OpenAPIにBearer securityがあるためRails authを省略する。
3. Rails 403をBFFで200 + empty dataに変える。
4. 全errorをHTTP 200で返す。
5. 2 operationへ同じoperationIdを付ける。
6. required response fieldを予告なく削除する。

### 26.7 Design Exercise — Target Start Analysis API

教材Exerciseとして次を提案せよ。正式仕様にはしない。

- method/path concept
- request fields
- success status/response
- authentication/authorization
- idempotency
- error categories
- CURRENT/TARGET/DEFERRED

## 27. Answers / Explanation Guide

### 27.1 Knowledge Check要点

1. Method、path、headers、parameters/body、schema、status/error、auth、semantic meaning。
2. Safeはstate変更目的でないこと、Idempotentはreplay後の意図した効果が同じこと。
3. Requestを受理しJobを作成しただけで、Worker処理・Snapshot commitは後続だから。
4. OpenAPIはcontract記述、implementationはroute/controller/business/persistence/test/deploy。
5. Client generation、docs、trace、breaking-change referenceを曖昧にしないため。

### 27.2 Contract Reading回答

`getCurrentUserOrganization`:

- GET。
- `/organizations/{organization_id}`（server base `/api/v1`）。
- required UUID `organization_id`。
- `200 OrganizationEnvelope`。
- default `ErrorEnvelope`。
- global Bearer auth。

`createProjectAnalysisJob`はPOST、bodyとIdempotency-Key、202 responseを持つが、CURRENT Rails route/controllerは存在しないTARGET draft。

### 27.3 Status回答

1. 401。
2. 403。
3. CURRENT/approved policy上404候補。
4. 202。
5. 409。
6. safe 500。

### 27.4 Responsibility回答

1. Command。
2. Client。
3. BFF。
4. Rails。
5. OpenAPI。
6. Client/BFFの各consumer boundary。Business meaningはpreserveする。

### 27.5 Contract Trace回答

Feature controllerがOrganization boundary queryを呼び、Clientがencoded IDでsame-origin BFF GETを行う。BFFがsession/active orgを確認しBearer付きでRails GETへforward。RailsがJWT、Membership/Roleを確認して`{data,meta}`を返す。BFFはstatus/bodyをpreserveし、Clientがenvelope/resource shapeをassertしてFeatureへ返す。

### 27.6 Violation回答

1. Internal/sensitive field露出とDB/API coupling。
2. Documentationをruntime enforcementと誤認。
3. Authorization outcomeのbusiness meaningを書き換えている。
4. Cache、retry、monitoring、UI error distinctionを壊す。
5. Generated client/referenceが衝突する。
6. Breaking change。移行/additive deploy/version boundaryが必要。

### 27.7 Design Exercise回答例

```text
POST /organizations/{organization_id}/projects/analysis-jobs  # TARGET candidate

Request:
  project name / target URL
  Idempotency-Key header

Rails:
  authenticate User
  authorize Organization membership/role
  validate URL/plan/eligibility
  atomically create Project + AnalysisJob + usage/audit candidates

Response:
  202 Accepted
  Project + canonical AnalysisJob identity/status + meta

Errors:
  400 malformed transport
  401 unauthenticated
  403 unauthorized/plan policy depending approved contract
  404 cross-tenant/not found
  409 idempotency/current-state conflict
  422 field/domain validation
  503 temporary backend dependency failure
```

これは既存draftを読むExerciseであり、Production APIの実装・正式再承認ではない。Exact field、plan policy、idempotency persistence、queue/outboxはDEFERRED。

## 28. Completion Criteria

| Criterion                                     | Result |
| --------------------------------------------- | ------ |
| 1. API fundamentals explained                 | `PASS` |
| 2. HTTP contract explained                    | `PASS` |
| 3. Panoptes API architecture explained        | `PASS` |
| 4. request/response/status/error explained    | `PASS` |
| 5. validation/auth boundary explained         | `PASS` |
| 6. BFF/Rails/Client contract explained        | `PASS` |
| 7. OpenAPI fundamentals explained             | `PASS` |
| 8. versioning/compatibility explained         | `PASS` |
| 9. representative repository mapping included | `PASS` |
| 10. exercises + answers included              | `PASS` |

Authoring DoD: `10 / 10 PASS`。

これは教材artifactの完成を示す。Learner assessment合格、18 operation実装完了、OpenAPI lint/breaking diff実行、Production Readinessを意味しない。

## 29. Handoff to M12

Recommended next phase: `TB-13 — Module 12: AnalysisJob lifecycle`。

M12ではAnalysisJob state machine、terminal/non-terminal state、command/polling、failure/partial/cancel/timeoutを詳しく扱う。本ModuleではJob APIがstateのtransport表現であり、Frontend/OpenAPIがtransition authorityではないことまでを確定する。

## References

- [Panoptes Technical Bootcamp](../panoptes-technical-bootcamp.md)
- [M07 BFF](./07-bff.md)
- [M08 Rails Business Backend](./08-rails-business-backend.md)
- [M09 PostgreSQL / Source of Truth](./09-postgresql-source-of-truth.md)
- [M10 Auth / Authorization / Organization](./10-auth-authorization-organization.md)
- [Panoptes Rails API v1 Contract](../../api/panoptes-api-v1.md)
- [OpenAPI draft](../../api/openapi-draft.yaml)
- [API Boundary](../../architecture/api-boundary.md)
- [AnalysisJob State Machine](../../api/analysis-job-state-machine.md)
- [Rails routes](../../../rails/config/routes.rb)
- [Canonical BFF client](../../../src/lib/panoptes/api/canonical-bff-client.ts)
