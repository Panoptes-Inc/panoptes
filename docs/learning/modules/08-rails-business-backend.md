# Module 08 — Rails Business Backend

Status: `COMPLETE / READY_FOR_M09`  
Phase: `TB-09`  
Prerequisites: `M01`, `M02`, `M03`, `M04`, `M05`, `M06`, `M07`  
Primary inputs: [Frontend Structure Policy](../../architecture/frontend-structure-policy.md), [Product Decision Register](../../product/product-decision-register.md)

## 1. Learning goals

このModuleを終えたLearnerは、PanoptesのRails API-only Backendについて次を説明・判断できる。

1. Rails/API-only/MVCの基本と、Panoptesで使われている構造を説明する。
2. RailsをCanonical Business Decision Ownerとする理由を説明する。
3. BFF requestからroute、authentication、authorization、controller、model/persistence、responseまでを追跡する。
4. Business rule、state transition、transaction、persistenceのownerを判断する。
5. RailsとWorker、UsageとBilling、JobとSnapshotを区別する。
6. Identity/OrganizationのCURRENTと、Analysis domainのTARGET/DEFERREDを区別する。

本Moduleは既存Railsと承認済みProduct contractを教材化する。Backend architectureの再設計、全Model/Controller監査、Source変更は行わない。

## 2. Rails / API-only fundamentals

Ruby on Railsはrouting、controller、model/Active Record、validation、migration、transaction、serialization/response等を組み合わせてserver applicationを構築するframeworkである。

### MVCをAPIとして読む

| Part               | General role                                                | Panoptes API-only context                                     |
| ------------------ | ----------------------------------------------------------- | ------------------------------------------------------------- |
| Route              | HTTP method/pathをhandlerへ接続                             | `rails/config/routes.rb`の`/api/v1/*`                         |
| Controller         | Request context、params、use-case entry、HTTP response      | `ActionController::API`を継承するJSON endpoint                |
| Model              | Persistent entityとassociation/validation/domain vocabulary | User、Organization、Membership、SystemRole                    |
| Service / use case | 複数modelや外部systemを跨ぐoperation                        | CURRENTではAuth service群。Analysis domain use caseはDEFERRED |
| Migration / schema | DB structure、foreign key、index、constraint                | Identity/Organization boundaryのみCURRENT                     |
| Response mapping   | Domain resultをAPI contractへ変換                           | CURRENTはcontroller hash + shared success/error envelope      |

API-only modeはHTML page renderingを主目的にせず、JSON APIとserver-side business/persistence concernへ集中する。Panoptesの`ApplicationController < ActionController::API`がこのboundaryを示す。

### API-onlyでもRailsがすること

- Request routingとparameter handling。
- Authentication/authorization。
- Domain validationとbusiness rule。
- Active Recordを通じたpersistence/transaction。
- Canonical state transition。
- JSON response/error contract。
- Queue/Workerへのbusiness orchestration（Target）。

API-onlyは「薄いproxy」や「DB CRUDだけ」を意味しない。

## 3. Panoptes architecture position

Canonical target flow:

```text
Browser
  -> Frontend Feature / Command
  -> Client
  -> SvelteKit BFF
  -> Rails Business API
  -> PostgreSQL / Queue
  -> Worker
```

Railsはこのflowの**Canonical Business Decision Owner**である。

```text
BFF decides:   requestをどう安全にRailsへ届けるか
Rails decides: operationを許可し、business stateをどう変えるか
Worker does:   許可されたtechnical workをどう実行するか
```

BFF route guardやFrontend validationは早期拒否・UX・transport protectionに役立つが、Rails authorization/business validationを置き換えない。

## 4. Rails responsibility map

### Rails owns

- Business authentication/authorization result。
- Organization membershipとresource ownership validation。
- Domain/business rule。
- Canonical resource stateとstate transition。
- Transaction boundaryとpersistence orchestration。
- AnalysisJob creation/orchestration、cancellation/outcome（Target）。
- Snapshot commit/promotion/current pointer（Target）。
- Usage entitlement/consumption decision（Target）。
- Audit-worthy business event（Target）。
- Safe API success/error contract。

### Rails must not own

- Browser interaction、modal/tab/input state。
- Visual rendering、CSS、responsive behavior。
- Chromium/crawl/screenshotのraw execution。
- LLM/visual analysisのprovider-specific execution detail。
- Queue deliveryそれ自体をbusiness completionとして扱うこと。

### Neighboring owners

| Concern                          | Owner                                                            |
| -------------------------------- | ---------------------------------------------------------------- |
| User interaction/presentation    | Frontend                                                         |
| Cookie/session/safe proxy        | SvelteKit BFF                                                    |
| Business decision/transition     | Rails                                                            |
| Durable records/constraints      | PostgreSQL                                                       |
| Crawl/capture/analysis execution | Worker                                                           |
| External charge/webhook          | Billing integration。Railsがbusiness policyとrecordをorchestrate |

## 5. CURRENT request lifecycle — Organization detail

現Repositoryでend-to-endに確認できる代表readはOrganization detailである。

```text
SvelteKit BFF GET /api/panoptes/v1/organizations/:organization_id
  -> Rails GET /api/v1/organizations/:organization_id
  -> Rails route
  -> OrganizationsController#show
  -> ApplicationController before_action
  -> Authentication#authenticate_request!
  -> SupabaseJwtVerifier
  -> UserMapper -> Current.user
  -> OrganizationAuthorization#load_current_organization!
  -> Active membership + Organization query + role check
  -> Current.organization / Current.membership
  -> controller response mapping
  -> { data, meta } JSON
  -> BFF -> Client -> Feature/UI
```

### What happens at each step

1. `routes.rb`がmethod/pathをcontroller actionへ接続する。
2. `Authentication` concernがBearer tokenを要求する。
3. `SupabaseJwtVerifier`がalgorithm、key ID、signature、issuer、audience、expiration等を検証する。
4. `UserMapper`がSupabase subjectをPanoptes Userへ対応させ、suspended/deleted Userを拒否する。
5. `OrganizationAuthorization`がactive membershipとactive OrganizationをDBで照合する。
6. Required roleを満たさなければ403、membershipがなければ404相当のdomain errorにする。
7. Controllerがauthorized resourceだけをJSON contractへ写像する。
8. `ApplicationController`がrequest/correlation metadataとprivate no-storeを付ける。

このflowはIdentity/Organization readのCURRENTであり、Project/AnalysisJobのproduction lifecycleが実装済みという証拠ではない。

## 6. Rails Controller responsibility

Rails ControllerはHTTPとbusiness use caseの入口である。

### May own

- Request/route parameterの受取り。
- Authentication/authorization concernの適用。
- Parameter validationの入口。
- Use-case/service invocation。
- ResultからHTTP status/response contractへのmapping。
- Request ID/correlation等のrequest context。

### Should not accumulate

- 長いbusiness state machine。
- 複数modelの複雑なtransaction orchestration。
- Provider-specific crawl/LLM code。
- 再利用すべきauthorization ruleの重複。
- UI presentation wording/visual state。

CURRENTのOrganizations controllerはqueryとsmall response mappingをaction/private methodで行う。規模が小さいため、この構造だけで不要なservice layerを発明する必要はない。Analysis開始のようにauthorization、usage、idempotency、Job creation、queue publishを跨ぐ場合は、Targetとして明示的use-case/service + transaction boundaryが必要になる。

```text
Small read: Controller + model scope can be sufficient
Complex write: Controller -> explicit use case/service -> transaction/models
```

## 7. Model responsibility

Rails Modelは「DB rowをRuby objectにしただけ」とは限らない。CURRENT modelは次を持つ。

- Associations: User→Membership→Organization。
- Enum vocabulary: status、role。
- Validation: required、length、format、uniqueness。
- Domain constant: `ORGANIZATION_READ_ROLES`。
- Small domain behavior: `system_admin?`、slug normalization。

一方、Modelへapplication workflowをすべて詰めるのも適切ではない。複数aggregate、external system、queue、usage、auditを跨ぐoperationはuse-case/serviceとtransactionでcoordinateし、Modelはentity invariantとassociationを支える。

PostgreSQL constraintも重要だが、Model/API authorizationの代替ではない。Unique indexやforeign keyはdata integrityを守れても、「このactorがoperationを実行できるか」は判断できない。

## 8. Authentication and authorization boundary

### Terms

| Term                    | Question                                 | CURRENT example                               |
| ----------------------- | ---------------------------------------- | --------------------------------------------- |
| Authentication          | 誰か                                     | Bearer JWT検証、Supabase subject→User mapping |
| Authorization           | 何をしてよいか                           | Membership role、SystemRole、resource access  |
| Organization membership | どのtenantに属するか                     | active Membership + active Organization query |
| Resource ownership      | 対象resourceがどのOrganizationに属するか | Project等でTarget実装が必要                   |
| Operation permission    | 現state/roleでその操作を許可するか       | Analysis開始/transition等でTarget実装が必要   |

### Current authorization pattern

`OrganizationAuthorization`は`Current.user.organization_memberships.active`から対象Organization IDを検索する。Browser/BFFが送ったOrganization IDをそのままtrustしない。Read roleが必要な`OrganizationsController#show`ではguestを除くrole setも確認する。

### Target resource chain

```text
Authenticated User
  -> active Organization Membership
  -> Organization-owned Project
  -> Project-owned AnalysisJob
  -> Job-produced Snapshot/Evidence
```

Railsはoperationごとにこのchainをresourceから辿り、requested ID、active context、DB ownership、role、current stateを検証する。BFF route guardを通ったことは、このchainの代わりにならない。

## 9. Business rule ownership

Business Ruleは、Product/domain上「何が許され、何を意味し、どの結果を成立させるか」を決める規則である。

Panoptes examples:

- User/OrganizationがAnalysisを開始可能か。
- Project/Job/Snapshotへアクセス可能か。
- Current stateから次のJob stateへ進めるか。
- ResultがSnapshot作成条件を満たすか。
- Partial resultをProduct Resultとして利用できるか。
- Reanalysisがnew Jobとして許可されるか。
- Usage entitlementを消費するか。
- Snapshotをcurrent/Strategy sourceへ昇格できるか。

Frontendで同じruleを表示hintとして計算する場合があっても、canonical decisionはRailsで再評価する。BFFはsession/transport contextを整えるが、plan eligibilityやJob outcomeを決めない。Workerはtechnical factsを返すが、Product outcomeへ確定しない。

## 10. Canonical AnalysisJob state transition

承認済みTarget contractの主経路:

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

Terminal outcomes:

- `completed`
- `failed`
- `cancelled`
- `timed_out`
- `partially_completed`

これは承認済みbusiness contractであり、CURRENT Rails codeにはAnalysisJob model/endpoint/state machineは存在しない。

### Why Rails owns transitions

- 現在stateとrequested transitionを一貫して読める。
- Authorization、idempotency、usage、Snapshot commitと同じtransaction boundaryへ接続できる。
- Worker retry/redeliveryをbusiness transitionの重複にしない。
- Terminal outcomeをaudit可能に確定できる。

Workerは`crawl completed`、`artifact uploaded`、`analysis failed`等のtechnical factを報告する。RailsがJob identity、attempt、current state、policy、result completenessを照合してbusiness stateをtransitionする。

Terminal Jobを同じidentityで`running`へ戻してreanalysisするのではなく、承認済みPD-04ではnew Job identityとlineageを使う。

## 11. Partial / failed outcome

PD-04の承認済みcontract:

| Outcome               | Meaning                                                                                         | Snapshot baseline                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `completed`           | Required processingを完了しvalidated Product Resultが成立                                       | Snapshot作成可。Policyによりcurrent promotion可                       |
| `partially_completed` | Usable validated Product Resultがあるがrequired processingの一部が未完了でlimitationsを説明可能 | Limited Snapshotは条件付き。自動current/Strategy source promotionなし |
| `failed`              | Valid Product Resultが成立しない                                                                | Formal Snapshot作成不可                                               |
| `cancelled`           | Cancellation terminal reason                                                                    | 途中artifactとProduct Snapshotを分離                                  |
| `timed_out`           | Timeout terminal reason                                                                         | 後からsilent partial rewriteしない                                    |

`partially_completed`はObservation/Axis/Score/SnapshotのPARTIALと同義ではなく、Job-level outcomeである。Frontend warningやWorker resultだけで確定せず、Railsがvalidated evidence/completeness policyに基づいてcanonical outcomeを保存するTargetである。

PD-04は`DECISION_COMPLETE`だがImplementationは`NOT_IMPLEMENTED`。Exact threshold、schema、retention、price等もDeferredである。

## 12. Transaction boundary

Transactionは、複数のpersistent changeを「全部成功するか、全部失敗するか」の一貫したunitへまとめる。

### Target Start Analysis transaction example

```text
authorize actor + Organization + Project
  -> validate eligibility/idempotency
  -> reserve/record usage decision if policy requires
  -> create AnalysisJob
  -> create outbox/enqueue intent
  -> create audit-worthy event
  -> commit
```

途中でJobだけ作られ、usageだけ消費され、queue messageだけ送られる状態を避ける。External queueへのpublishはDB transactionと完全に同一atomicityを持てないため、outbox等のpatternがTarget候補になるが、exact implementationは未決定である。

### Current boundary

CURRENT schemaはUser、Organization、Membership、SystemRoleに限られる。Foreign key、unique index、check constraintがdata integrityを支える。AnalysisJob/Usage/Snapshot/Auditのmulti-record transaction実装は存在しないため、教材例をCURRENTと表現しない。

## 13. Persistence orchestration — Rails vs PostgreSQL

```text
Rails:      何を、誰が、どの条件で、どのtransitionとして保存するか
PostgreSQL: committed durable data、constraint、transactionを保持する
```

PostgreSQLはforeign key、unique index、check constraintでinvalid dataを防ぐ。しかし、DB rowが存在するだけでaccess permissionを許可したり、latest rowをcurrent Snapshotと解釈したりしない。

RailsはProduct contractをDB operationへtranslateし、PostgreSQLはその結果をdurableに保持する。Physical schema、index、isolation、migrationはM09で詳しく扱う。

## 14. Rails vs Worker

| Concern                       | Rails                                              | Worker                                                  |
| ----------------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| Analysisを開始可能か          | decides                                            | does not decide                                         |
| Job identity/canonical status | owns                                               | receives scoped work and reports facts                  |
| Crawl/Chromium/screenshot     | requests/orchestrates                              | executes                                                |
| Internal/visual/LLM analysis  | defines approved work/result contract              | executes provider/technical steps                       |
| Artifact/evidence             | validates references/lineage and persists metadata | produces/uploads technical artifact                     |
| Final Product outcome         | commits                                            | must not self-authorize                                 |
| Usage/billing eligibility     | owns business policy                               | must not decide                                         |
| Retry                         | owns business retry/new Job policy                 | owns bounded technical attempt behavior within contract |

Workerが「LLM callに成功したのでJobをcompletedへ更新」「costが高いのでUserのplanを拒否」と決めると、authorization、usage、state machine、auditがtechnical runtimeへ漏れる。Workerはfacts/artifactsを返し、Railsがbusiness outcomeへ確定する。

## 15. Job orchestration

TargetでRailsが所有する方向:

- Job creationとunique identity。
- Canonical status/phase/progress acceptance。
- Worker dispatch contract。
- Cancellation requestとterminal decision。
- Timeout outcome。
- Business retry/new Job/reanalysis policy。
- Result completeness/eligibility。
- Snapshot commitとlineage。
- Usage decisionとaudit event。

Queueはdelivery/attemptを管理するが、Queue messageのack、retry count、visibility timeoutだけでbusiness completionを宣言しない。Retry、idempotency、outbox、dead-letter等はM12で扱う。

## 16. Snapshot boundary

SnapshotはAnalysis Resultのimmutable historical representationであり、mutable Project current stateと分ける。

```text
Project/Target        = mutable context
AnalysisJob           = process / outcome
Snapshot              = immutable historical result
current pointer       = mutable convenience selected by policy
Strategy source       = explicitly eligible source
```

重要な不等式:

```text
latest != current != Strategy source != historical Snapshot
```

Chronological latestを自動的にcurrentと解釈しない。Partial SnapshotはPD-04に従いautomatic current/Strategy promotionを行わない。Detailed history/lineage/versioningは後続Moduleへ送る。

## 17. Usage / Billing / Audit boundary

### Usage is not a Stripe charge

- **Usage decision:** Product entitlement/consumptionをどう数えるか。Rails business policy。
- **Billing charge:** Stripe等の外部providerで金銭transactionを行うこと。

PD-04はPlan-specific usage policyとusable-result baseline、Usage EntitlementとStripe chargeの分離を承認している。しかしexact unit/price/schema/implementationはDeferred。

### Audit

CURRENT Railsはrequest ID/correlation IDをresponse metaへ入れ、unhandled errorをsafeにlogする。これはoperational traceであり、business audit ledgerと同義ではない。

Analysis開始、authorization-sensitive mutation、Usage decision、Snapshot promotion、terminal outcome等はTargetでactor、Organization、resource、operation、before/after/outcomeを追跡できるaudit-worthy eventである。Business audit persistenceはまだ未実装。

## 18. Error handling

| Error class                     | Meaning                                 |                Typical HTTP boundary | Current status                  |
| ------------------------------- | --------------------------------------- | -----------------------------------: | ------------------------------- |
| Unauthenticated / invalid token | Actorを確立できない                     |                                  401 | `ApiError` subclassesあり       |
| Forbidden                       | Actorはいるがoperation不可              |                                  403 | CURRENT                         |
| Not found / scoped absence      | Resourceなし、またはscopeを秘匿         |                                  404 | Organization CURRENT            |
| Bad request                     | Required param等のrequest shape不正     |                                  400 | CURRENT shared handler          |
| Validation error                | Domain/model validation不成立           |                                  422 | CURRENT `RecordInvalid` mapping |
| Conflict / invalid transition   | Current business stateとoperationが競合 |            409等、API contractに従う | Analysis domain DEFERRED        |
| Worker/upstream failure         | Technical dependency failure            | Job outcomeまたは5xxをcontractで区別 | Analysis domain DEFERRED        |
| Internal error                  | Unhandled server defect                 |                             safe 500 | CURRENT shared handler          |

`ApplicationController`はsuccessを`{ data, meta }`、errorを`{ error: { code, message, details, retryable }, meta }`へ統一し、authenticated responseをprivate/no-storeにする。Unhandled exceptionではclassとrequest IDをserver logへ残し、stack/internal detailをresponseへ出さない。

Business errorとtechnical errorを混同しない。たとえば「plan上Analysis不可」はbusiness rejection、「Queue providerへ接続不能」はtechnical failure、「Workerが一部結果を返した」はPD-04 policyによりpartial outcome候補である。

## 19. CURRENT / TARGET / DEFERRED

| Area             | `CURRENT`                                                                   | `TARGET`                                                 | `DEFERRED`                                     |
| ---------------- | --------------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------- |
| Rails surface    | health、me、organizations、organization detail、membership readの5 endpoint | Organization-scoped business API                         | Project/Job/Snapshot/Strategy/Usage write/read |
| Authentication   | Supabase JWT verify、User mapping、Current context                          | 全business endpointで一貫適用                            | production operational validation/rotation     |
| Authorization    | Active Organization membershipとread roles                                  | Resource-derived Organization、operation permission      | Project/Job/Snapshot policies                  |
| Persistence      | User、Organization、Membership、SystemRole schema                           | canonical Project/Job/Snapshot/Evidence/Usage/Audit      | physical schema/migrations/retention           |
| Services         | Auth verifier/cache/mapper                                                  | Complex business use-case/service + transaction          | Analysis domain services                       |
| Job lifecycle    | Frontend adapter/contract文書のみ。Rails modelなし                          | canonical states/transitions、queue/worker orchestration | implementation、retry/idempotency/outbox       |
| Partial/Snapshot | PD-04 logical contract approved                                             | Rails outcome/Snapshot/promotion owner                   | threshold/schema/implementation                |
| Usage/Billing    | logical separation approved                                                 | Rails usage decision + billing integration boundary      | unit/price/Stripe implementation               |

Target ArchitectureやProduct Decisionの成立を、Rails code実装済みと読み替えない。

## 20. Representative repository mapping

以下は限定確認した11例であり、全Rails Model/Controller監査ではない。

| Source                                                                   | Responsibility                                                    | Business ownership                      | Persistence relation                   | Auth relation                | Status                              |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------- | -------------------------------------- | ---------------------------- | ----------------------------------- |
| `rails/config/routes.rb`                                                 | 5 read endpointのmethod/path mapping                              | ruleを持たないentry                     | none                                   | controllerへ接続             | `CURRENT`                           |
| `application_controller.rb`                                              | request context、success/error envelope、cache、exception mapping | shared API behavior                     | `RecordInvalid`等をmapping             | Authenticationをinclude      | `CURRENT`                           |
| `concerns/authentication.rb`                                             | Bearer token要求、claims→Current User                             | actor確立                               | UserMapperへ委譲                       | primary Rails auth gate      | `CURRENT`                           |
| `services/auth/supabase_jwt_verifier.rb`                                 | JWT signature/issuer/audience/expiry検証                          | token validity                          | JWKS cacheのみ                         | Authenticationから利用       | `CURRENT`                           |
| `services/auth/user_mapper.rb`                                           | Supabase subject→Panoptes User、suspended/deleted拒否             | identity status rule                    | User create/update、last authenticated | verified claims input        | `CURRENT`                           |
| `concerns/organization_authorization.rb`                                 | active membership/org、required role照合                          | Organization read authorization         | ActiveRecord membership query          | `Current.user`必須           | `CURRENT`                           |
| `api/v1/organizations_controller.rb`                                     | Organization list/detail queryとresponse mapping                  | authorized read behavior                | Membership/Organization read           | concernでshowをguard         | `CURRENT`                           |
| `models/organization_membership.rb`                                      | association、role/status、read role set、uniqueness               | membership vocabulary/invariant         | membership table                       | authorization queryに利用    | `CURRENT`                           |
| `models/organization.rb`                                                 | status、association、slug validation/normalization                | Organization invariant                  | organizations table                    | active scopeで利用           | `CURRENT`                           |
| `errors/api_error.rb`                                                    | stable code/status/details/retryable error vocabulary             | safe failure meaning                    | none                                   | auth/authz subclasses        | `CURRENT`                           |
| `db/migrate/20260807000000_create_identity_and_organization_boundary.rb` | UUID tables、FK、unique/check constraints                         | business authorizationではなくintegrity | PostgreSQL physical boundary           | identity/org recordsを支える | `CURRENT`; Analysis schema deferred |

## 21. Decision heuristic — この処理はどこか

1. **UI interaction/presentationか？**  
   → Frontend。
2. **Cookie/session/safe proxyか？**  
   → BFF。
3. **Business rule、authorization、canonical transitionか？**  
   → Rails。
4. **Durable storage、constraint、transaction mechanismか？**  
   → PostgreSQL。何を保存するかはRailsがorchestrate。
5. **Crawl、capture、technical analysisか？**  
   → Worker。
6. **External LLM executionか？**  
   → Worker/approved integration。Outcome authorityはRails。
7. **External billing provider operationか？**  
   → Billing integration。Entitlement/usage policyはRails。

例: ButtonをdisableするのはFrontend。Session token転送はBFF。Analysis eligibilityとJob作成はRails。Job rowをdurableに保持するのはPostgreSQL。Screenshot取得はWorker。

## 22. Common misunderstandings

### 「Rails Controller = 全Business Logic置き場」

ControllerはHTTP/use-case entry。Complex transaction/state machineはservice/use caseへ分離し、Model invariantと協働する。

### 「BFF = Business Backend」

BFFはsession/transport、Railsはbusiness authority。

### 「Model = DB rowだけ」

Association、validation、enum、domain vocabulary/invariantを持つ。ただしworkflow全部をModelへ詰めない。

### 「Worker = Business authority」

Workerはtechnical execution/facts。Railsがresultを検証しcanonical outcomeへcommitする。

### 「DB constraintだけでAuthorizationできる」

Constraintはdata integrity。Actor/resource/operation policyはRailsが判断する。

### 「Frontend validation = Business validation」

Frontend validationはUX/early feedback。Railsがuntrusted inputとcurrent stateを再検証する。

### 「Queue status = Business outcome」

Delivery/attemptとJob completed/failed/partialは別。Rails state machineがbusiness outcomeを確定する。

### 「Usage = Billing charge」

Entitlement/consumption decisionとStripe金銭transactionは別boundary。

### 「Latest = Current」

Chronological latest、policy-selected current、Strategy source、historical Snapshotは別identity/meaning。

## 23. Practice

### 23.1 Knowledge Check

1. API-only RailsとBFFの違いは何か。
2. Rails Controllerへすべてのbusiness logicを置かない理由は何か。
3. ModelとPostgreSQL constraintはそれぞれ何を守るか。
4. BFF route guard後もRails authorizationが必要な理由は何か。
5. RailsとWorkerのJob責務はどう違うか。
6. `partially_completed`と`failed`の違いは何か。
7. Snapshotとcurrent pointerの違いは何か。
8. Usage decisionとStripe chargeの違いは何か。

### 23.2 Responsibility Exercise

次をFrontend / BFF / Rails / PostgreSQL / Workerへ分類する。

1. Retry buttonの表示。
2. Supabase session tokenのRails転送。
3. Projectがrequested Organizationに属するか検証。
4. Unique idempotency recordを保持。
5. Chromium screenshotを取得。
6. AnalysisJobを`partially_completed`へ確定。
7. Snapshot current pointerを更新。
8. JSON response schemaをFrontendでassert。
9. DB foreign keyを強制。
10. LLM providerを呼びtechnical outputを返す。

### 23.3 Request Trace — Start Analysis

Target requestを次の要素で順に並べる。

- Rails route/controller。
- BFF request forwarding。
- Rails authentication/Organization/resource authorization。
- Business eligibility/idempotency validation。
- TransactionでJob/usage/audit/outbox intentを作成。
- Worker dispatch。
- Canonical response。
- Frontend Command/Client。

CURRENTでどこまで実装済みかも答える。

### 23.4 Authorization Exercise

User AはOrganization Xのviewer、Project PはOrganization Yに属する。BFF active cookieがXで、request bodyにはYとPが入っている。

1. BFFは何を確認できるか。
2. Railsは何をresourceから検証すべきか。
3. Project Pの存在を403/404のどちらで表すかは何に従うか。
4. DB rowが存在するだけでaccessを許可できるか。

### 23.5 State Transition Exercise

次を正当/不正/新Job必要へ分類する。

1. `queued -> preparing`。
2. `crawling -> capturing`。
3. `awaiting_confirmation -> visual_analysis`（authorized confirmation後）。
4. `completed -> running`。
5. `failed -> completed`（同じJob identity）。
6. `partially_completed -> finalizing`。
7. `failed`後のreanalysisを新Jobとして開始。

### 23.6 Violation Detection

- BFFでplan eligibilityを確定する。
- WorkerがStripe charge/usage消費を決める。
- Frontend StoreがJobをcanonical completedへ変更する。
- Rails Controllerにcrawl、LLM、transaction、serializationを全て直書きする。
- Project rowが存在するだけでaccessを許可する。

各違反のcorrect owner/refactoring directionを答える。

### 23.7 Design Exercise — Snapshot creation

「Analysis resultからSnapshotを作成する」をBFF、Rails、PostgreSQL、Workerへ分割する。Completed/Partial/Failed、lineage、current promotion、Strategy source、auditも考慮する。

## 24. Answers / Explanation Guide

### 24.1 Knowledge Check要点

1. BFFはFrontend session/transport、Railsはbusiness/authorization/persistence orchestration。
2. HTTP concernとdomain workflowが混ざり、transaction/test/reuse/変更局所性が悪化するため。
3. Modelはentity vocabulary/invariant/association、DB constraintはcommitted data integrity。
4. Browser/BFF contextはresource ownership、current state、operation permissionのauthorityではないため。
5. RailsはJob identity/state/outcome、Workerはcrawl/capture/analysis executionとfact report。
6. Partialはusable validated Result + explicit limitation、Failedはvalid Product Result不成立。
7. Snapshotはimmutable history、current pointerはpolicyで変更可能なconvenience reference。
8. UsageはProduct entitlement/consumption、chargeはexternal billing transaction。

### 24.2 Responsibility回答

1. Frontend。
2. BFF。
3. Rails。
4. PostgreSQL。作成/idempotency policyはRails。
5. Worker。
6. Rails。
7. Railsがpolicyを決め、PostgreSQLへ保存。
8. Frontend Client。
9. PostgreSQL。
10. Worker/approved integration。Railsがresultをcommit。

### 24.3 Request Trace回答

```text
Frontend Command/Client
  -> BFF request forwarding
  -> Rails route/controller
  -> Rails authentication + Organization/resource authorization
  -> business eligibility/idempotency validation
  -> transaction: Job + usage decision + audit/outbox intent
  -> commit / Worker dispatch
  -> canonical response
  -> BFF / Client / Frontend projection
```

CURRENTはIdentity/Organization readとJWT/membership boundaryまで。Analysis route、Job transaction、Queue/Worker dispatchはDEFERRED。

### 24.4 Authorization回答

1. BFFはsessionとrequested/active Organization contextの不一致を早期拒否できる。
2. RailsはJWT actor、active DB membership/role、Project Pから導くOrganization Y、operation permissionを検証する。
3. Approved API/security contractに従う。Cross-tenant existence leakageを避けるなら404 patternが候補だが、本Moduleで新規status policyは決めない。
4. できない。Existenceはauthorizationではない。

### 24.5 State Transition回答

1. 正当。
2. 正当。
3. 正当。Confirmation authorization/input validationが必要。
4. 不正。同じterminal Jobを戻さない。
5. 不正。Terminal outcomeをsilent rewriteしない。
6. 不正。Partialはterminal。
7. 新Job必要。Old identity/result/historyを保持する。

### 24.6 Violation回答

- EligibilityはRailsへ移す。BFFはsession/transportのみ。
- Workerはtechnical factsだけ返し、Usage/Billing policyはRails/integration boundaryへ戻す。
- Frontend Storeはprojection。Rails responseで更新する。
- ControllerをHTTP entryに絞り、business use case/transactionとWorker executionを分離する。
- Railsがactor→membership→resource Organization→operationを認可する。

### 24.7 Snapshot design回答例

```text
Worker
  returns scoped technical result, evidence/artifact references, completeness facts

Rails
  authenticates callback/attempt and locks canonical Job
  validates current state, result eligibility, completeness and lineage
  decides completed / partially_completed / failed
  decides whether Snapshot may be created and whether promotion is allowed

PostgreSQL transaction
  persists terminal Job outcome
  conditionally creates immutable Snapshot + evidence/lineage metadata
  updates current pointer only under approved policy
  records audit-worthy event

BFF
  does not create Snapshot; returns/fetches safe canonical Rails outcome for Browser
```

Completedはpolicy-driven promotion可。PartialはLimited Snapshot conditionalでautomatic current/Strategy promotionなし。Failed/cancelled/timed_outはFormal Snapshotを作らないbaseline。Physical schemaとthresholdはDEFERRED。

## 25. Completion Criteria

| Criterion                                     | Result |
| --------------------------------------------- | ------ |
| 1. Rails/API-only fundamentals explained      | `PASS` |
| 2. Rails business responsibility explained    | `PASS` |
| 3. request lifecycle explained                | `PASS` |
| 4. authorization boundary explained           | `PASS` |
| 5. business rule ownership explained          | `PASS` |
| 6. state transition ownership explained       | `PASS` |
| 7. transaction/persistence boundary explained | `PASS` |
| 8. Rails vs Worker explained                  | `PASS` |
| 9. representative repository mapping included | `PASS` |
| 10. exercises + answers included              | `PASS` |

M08 Authoring DoD: `10 / 10 PASS`  
Module status: `COMPLETE / READY_FOR_M09`

このstatusは教材artifactの完成を示す。Learner assessment合格、Production Analysis backend、Job/Queue/Worker、Snapshot/Usage schema実装完了を意味しない。

## 26. Handoff to M09

次は`M09 — PostgreSQL / Source of Truth`。M08のRails persistence orchestrationを前提に、PostgreSQL schema、constraint、transaction、identity、Organization isolation、Job/Snapshot lineage、current pointerをdurable data boundaryとして学ぶ。

## References

- [Panoptes Technical Bootcamp](../panoptes-technical-bootcamp.md)
- [M01 Panoptes Overall Architecture](./01-panoptes-overall-architecture.md)
- [M07 BFF](./07-bff.md)
- [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)
- [Product Decision Register](../../product/product-decision-register.md)
