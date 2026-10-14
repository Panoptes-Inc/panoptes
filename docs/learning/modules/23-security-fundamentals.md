# Module 23: Security Fundamentals

Status: `COMPLETE / READY_FOR_M24`  
Phase: `TB-24`  
Difficulty: `INTERMEDIATE`  
Prerequisites: `M01`–`M22`（direct curriculum dependencies: `M07`–`M15`, `M22`）

## 1. Learning goals

このModuleを終えたLearnerは、次を説明・判断できる。

1. SecurityをLogin機能ではなくCIA（Confidentiality、Integrity、Availability）を守るArchitecture/Process/Controlとして説明する。
2. PanoptesのAsset、Threat、Trust Boundaryを特定する。
3. Browser、BFF、Rails、DB、Queue、Worker、External Web/LLMを跨ぐDataを再検証する。
4. AuthenticationとAuthorizationを区別し、RailsをApplication Authorization Authorityとして扱う。
5. Organization-scoped resource accessをresource-derived authorizationで判断する。
6. Session/API/Secret/Data/Worker/Artifact/QueueのSecurity境界を説明する。
7. Logging、Audit、Lineage、Dependency/Supply Chainを区別する。
8. CURRENT control、TARGET Architecture、DEFERRED hardeningを混同しない。

本教材はDefensive Securityの基礎であり、penetration test、exploit手順、Production hardeningを行うものではない。

## 2. Security fundamentals

Securityは、次の性質を守るためのcontrolの組合せである。

| Property | Meaning in Panoptes |
| --- | --- |
| Confidentiality | Organization data、Session、Evidence、Secret等を権限のない主体へ漏らさない |
| Integrity | Job、Snapshot、Score、Membership、Audit等を不正・重複・改ざんから守る |
| Availability | API、Worker、Analysisをabuseやresource exhaustionから守り利用可能にする |

```text
Security != Login only
Security != Backend only
Security != one middleware
```

Securityは各境界のownerが継続して担う。

## 3. Asset model

Panoptesで守る代表Asset:

- User identity and Authentication context
- Organization / Membership / Role
- Project and AnalysisJob
- Analysis Result and Formula/version metadata
- Snapshot / History / Lineage
- Evidence / HTML / Screenshot / Artifact
- Session cookie / access token
- API、LLM、Storage、Database credentials
- Billing-related data and Usage records
- Security/Business Audit trail

AssetごとにConfidentiality、Integrity、Availabilityの重要度、owner、retention、authorized consumersが異なる。Exact data classification/retentionは承認済み範囲だけを使い、教材で新設しない。

## 4. Threat model

ThreatはAssetへ悪影響を与え得る事象である。

- unauthorized access
- cross-tenant data leakage
- privilege misuse
- malicious or malformed input
- session/token abuse
- data/result tampering
- duplicate side effects
- untrusted website behavior
- resource exhaustion
- secret leakage
- dependency/supply-chain compromise
- sensitive logging

Riskは「Threatがある」だけでなく、Asset、entry point、Trust Boundary、existing control、impact、likelihood、detection/recoveryから評価する。

## 5. Trust Boundary map

```mermaid
flowchart LR
    B[Browser<br/>Untrusted client]
    F[SvelteKit BFF<br/>Session/context boundary]
    R[Rails API<br/>Business auth/rules]
    D[(PostgreSQL<br/>Durable integrity)]
    Q[Queue<br/>Delivery boundary]
    W[Worker<br/>Technical executor]
    E[External Web<br/>Untrusted content]
    L[External LLM / Service<br/>External processor]

    B --> F --> R --> D
    R --> Q --> W
    W --> E
    W --> L
    W --> R
```

Boundaryを越えたDataは、上流で一度検証済みでも、受け取るownerが自分のcontractに対して再検証する。

## 6. Never trust the Browser

Browserから届く値はUser-controlled inputである。

- `organization_id`
- `project_id`
- role/plan/price/permission
- AnalysisJob status
- score/result metadata
- redirect destination
- hidden/disabled UI state

FrontendはUX validationとpresentationを担当できるが、Canonical Business TruthやAuthorization Proofにはならない。

```text
button hidden != permission enforced
client role     != canonical role
selected org    != authorization proof
```

RailsがIdentity、Membership、Resource ownership、Operation、Resource stateを再検証する。

## 7. Defense in Depth

一つのcontrolだけへ依存しない。

```mermaid
flowchart LR
    Req[Request]
    S[Session / Token validation]
    C[BFF context / route guard]
    A[Rails authentication + authorization]
    Q[Organization-scoped resource query]
    I[DB relation / constraint integrity]
    Req --> S --> C --> A --> Q --> I
```

各layerの役割:

- Frontend: impossible/unauthorized-looking actionを表示しないUX。
- BFF: Session context、route guard、explicit endpoint、safe transport。
- Rails: independent token verification、Business Authorization/Rule。
- DB: relation、constraint、transaction、durable integrity。

一層のbugやbypassが即cross-tenant leakへならないようにする。

## 8. Authentication

Authenticationは「誰か」を確認する。

CURRENT direction:

1. Supabase/Auth Providerがidentity/sessionを扱う。
2. SvelteKit serverがcookie/sessionからrequest contextを解決する。
3. BFFがaccess tokenをRailsへBearerとして転送する。
4. RailsがJWTを独立検証し、Canonical Userへmappingする。

Rails JWT verifierはtoken size、approved algorithm、`kid` shape、signature、issuer、audience、expiration、not-before、required claims、subject shapeを検証する。BFFでSessionを確認したからRails検証を省略してよいわけではない。

## 9. Authorization

Authorizationは「そのUserが、そのResourceへ、そのOperationを実行してよいか」を判断する。

RailsがApplication Authorization Authorityとして確認するもの:

- authenticated User
- active Organization Membership
- role
- Resource owning Organization
- requested operation
- Resource/Product state

```text
authenticated != authorized
```

Login済みでも、他OrganizationのProjectやSnapshotへアクセスできるわけではない。

## 10. Multi-tenant isolation

OrganizationはTenant Boundaryである。Organization AのUserがOrganization BのProject、AnalysisJob、Snapshot、Evidenceへアクセスできないことを各layerで支える。

必要なcontrol:

- request/auth context
- Rails authorization
- Organization-scoped query
- resource relation and integrity
- response/data isolation
- auditability

### Resource-derived authorization

URLやcookieのOrganization IDだけを信用しない。

```text
requested resource
-> owning Organization
-> active Membership and Role
-> permitted operation
```

Rails CURRENTのOrganization concernは`params[:organization_id]`に対し、active Membershipとactive Organizationをjoin/scoped queryで照合する。将来のnested resourceもresource ownershipからOrganizationを解決する。

## 11. Session and cookie security

Session/Cookieで考える基本:

- `HttpOnly`: Browser JSから不必要にcredentialを読ませない。
- `Secure`: HTTPS transportで送る。
- `SameSite`: cross-site送信範囲を制御する。
- expiry/refresh/rotation: 長期固定credentialを避ける。
- logout/revocation: local stateだけでなくprovider/session lifecycleを扱う。
- server-side handling: tokenをclient bundleへ埋め込まない。

Exact attributesはCURRENT implementation/configを優先し、未確認値を「設定済み」と断定しない。

### CSRF

Cookie-based authenticationではCross-Site Request Forgeryを考慮する。SameSite、Origin/Referer validation、architectureに応じたCSRF token等が候補になる。本教材では未決定controlを新しい正式Policyにしない。

## 12. XSS and output handling

Cross-Site Scriptingはuntrusted inputを実行可能contentとしてBrowserへ注入するriskである。

Panoptesで注意するもの:

- User-provided text
- External Web content
- HTML/DOM evidence
- LLM/provider output
- dynamic URL/attribute
- raw HTML rendering

Svelteのdefault escapingは重要なcontrolだが、FrameworkだけでXSSが完全解決するわけではない。Raw HTML、unsafe URL、third-party script、DOM API、sanitization boundaryを個別に確認する。

## 13. Input validation by boundary

| Layer | Validation responsibility |
| --- | --- |
| Frontend | UX、required/format、immediate feedback。Security enforcementではない |
| BFF | method/path/context、Session presence、transport shape、explicit proxy boundary |
| Rails | schema/application validation、Authorization、Business Rule、state transition |
| PostgreSQL | type、FK、unique/check、transaction等のdurable integrity |
| Worker | URL/content/size/type/timeout、artifact/result shape、technical provenance |

一度validateした値も、別Trust Boundaryでは受信側contractへ再検証する。

## 14. API security

M11と接続し、APIでは次を確認する。

- Authentication
- per-resource Authorization
- explicit endpoint/method
- input/schema validation
- safe status/error preservation
- sensitive response minimization
- request/correlation identity
- timeout/rate/resource limit concept
- no blind generic proxy

BFFはtransport boundaryであり、Rails Business Authorizationを代替しない。

### Mass assignment / over-posting

Client payloadを無条件にModelへ適用しない。Operationごとに許可fieldsを限定し、server-owned fields、Organization、role、status、billing/value等をClient入力から上書きさせない。

### ID enumeration / direct object access

Resource IDを知っていることはpermission proofではない。Deep-link/API requestごとにRailsがUser、Membership、owning Organization、operationを照合する。

### Error security

User-safe errorとinternal diagnosticsを分離する。Stack trace、DB detail、Secret、raw provider response、tokenをresponseへ出さない。BFF CURRENT clientはupstream failureをsafe messageとrequest IDへmappingする。

## 15. Secret management

Secret例:

- API keys
- Database credentials
- JWT/signing-related configuration
- External LLM credentials
- Storage credentials
- webhook secrets

SecretをClient bundle、public environment variable、repository、logへ含めない。Server-only runtimeとapproved Secret Storeを使う。

Environment variableも名前やbuild exposureを誤るとFrontendへ出る。Server-only/privateとpublic/client-exposedを区別し、toolingの規則を優先する。Exact Cloud Secret solutionはInfrastructure Moduleへhandoffする。

## 16. Least privilege

User、Service、Worker、DB accountへ必要最小限のpermissionだけを与える。

例:

- Crawl WorkerにBilling DB全権限は不要。
- Read-only operationへwrite privilegeは不要。
- Artifact accessを全Organizationへ公開しない。
- CI jobへProduction Secretを常時渡さない。

Permissionを役割、resource、operation、environment、期間で狭める。

## 17. PostgreSQL and durable integrity

PostgreSQLはpersistent data、relation、constraint、transactionを担う。Application Authorization AuthorityはRailsであり、Foreign KeyだけではAuthorizationにならない。

```text
FK proves relation integrity
FK does not prove requester permission
```

DB account/schema privilegeもDefense in Depthの一部だが、Exact DB role architectureは未決定なら本教材で新設しない。

## 18. Data protection and minimization

### In transit

TLS等でnetwork上の盗聴・改ざんriskを下げる。

### At rest

Database/Storage encryption等で保存媒体riskを下げる。

```text
encryption != authorization
TLS        != access control
```

暗号化されていても、不正Userへ正規APIがDataを返せば漏えいする。

必要のないSensitive Dataを収集・保存しない。External Web Evidenceではwhat/why/retention/accessを明確にする。Exact retention policyは未決定なら作らない。

## 19. Evidence and Artifact security

HTML、Screenshot、DOM、LLM output等は外部由来Dataであり、harmlessとは限らない。

Artifactで考えるもの:

- Organization/Job scope
- private access and authorization
- signed/short-lived access where applicable
- content type/size validation
- immutable identity and lineage
- retention/deletion policy
- response headers and rendering boundary

固定public URLへ無条件公開しない。Exact Object Storage designはTARGET/DEFERREDとして扱う。

## 20. Worker / External Web boundary

WorkerはUntrusted External Webへ接触する強いTrust Boundaryである。

代表risk:

- malicious HTML/JavaScript
- huge response/resource exhaustion
- redirect to unexpected destination
- private/internal network access
- malformed file/content type
- browser process abuse
- excessive CPU/memory/time
- poisoned Evidence passed downstream

```text
External URL != safe destination
Fetched content != trusted instruction
```

## 21. SSRF fundamentals

Worker/fetcherがURLへアクセスする場合、Server-Side Request Forgeryを考慮する。

Defensive concerns:

- private/internal addresses
- localhost
- cloud metadata endpoints
- DNS/redirect chain
- protocol/scheme restrictions
- response size/time limits
- network egress policy

具体的bypass techniqueやexploit手順は扱わない。URL validationだけでなくredirect後destinationとnetwork policyも重要である。

## 22. Worker and Chromium isolation

Defense candidates:

- process/container isolation
- restricted filesystem
- network/egress policy
- timeout
- CPU/memory/concurrency limits
- browser sandbox
- cleanup and artifact boundary

Chromiumではuntrusted JavaScript、browser process、sandbox、resource limits、cleanupを考える。`--no-sandbox`を安易なProduction defaultにしない。Exact runtime command/topologyはInfrastructure/Security implementationへdeferする。

## 23. External LLM boundary

External LLMへ送る前に次を確認する。

- what data is sent
- Organization/tenant context
- data minimization/redaction
- API secret handling
- prompt/application instruction separation
- provider response validation
- provider logging/retention policy
- result provenance/version

### Prompt injection

External Web contentはUntrusted Dataであり、ページ内instructionをSystem/Application instructionとして信用しない。Model outputもcandidate/derived Observationであり、Business Truthとして無検証採用しない。

## 24. Queue security and integrity

Queue messageにもJob identity、Organization/context、attempt/sequence、integrity、authorized producer/consumerの論点がある。

```text
Queue delivery != trusted Business Truth
Worker event   != canonical state transition
```

RailsがJob、attempt、current state、Organization、allowed transition、Result shapeを再検証する。

Retry/duplicate deliveryへのIdempotencyはReliabilityだけでなくIntegrityも守る。Double Usage、duplicate Snapshot、duplicate mutationを防ぐ。

## 25. Logging, Audit, and Lineage

| Concept | Question | Examples |
| --- | --- | --- |
| Logging | Systemがどう動いたか | request ID、error class、latency、technical event |
| Audit | 誰が何をいつどの対象へ行ったか | role change、important mutation、privileged action |
| Lineage | 何から何が作られたか | Evidence→Observation→Result→Snapshot |

Logへpassword、raw credential、access token、unnecessary personal/sensitive dataを出さない。Rails CURRENTではauthorization、cookie、password系、email、secret、token、JWT、key、OTP、SSN、card security code等をparameter filtering対象としている。

Debug usefulnessとsensitive leakage preventionを両立し、User-safe errorとinternal diagnosticsをcorrelation ID等で結ぶ。

Exact Audit event catalogは未決定なら作らない。

## 26. Dependency / Supply Chain

Panoptesはnpm package、Ruby gem、Python package、browser binary等へ依存する。

- trusted registry/source
- lockfile/version pinning
- vulnerability review
- update ownership/cadence
- build artifact provenance
- CI permissions/secrets
- browser/runtime update

Security updateは重要だが、無検証Production deployもしない。

```text
update -> test/compatibility review -> staged deploy -> monitor
```

具体的scanner/CI導入はM24 Testing / CI/CDへhandoffする。

## 27. Rate and resource abuse

API/Worker/External serviceはresource costを持つ。

- request rate limits
- concurrent AnalysisJob limits
- Queue depth/backpressure
- Worker timeout/CPU/memory limits
- response/artifact size limits
- retry budget
- provider quota/cost control

Exact quotaはBilling/Infrastructure/Product policyと接続して決める。本教材で数値を発明しない。

## 28. Fail closed vs fail open

Security-sensitive prerequisiteを確認できない場合、Fail Closedが適切な場面がある。

例:

- Session/Tokenを検証できない → protected resourceを返さない。
- Active Membershipを確認できない → Organization resourceを返さない。
- Business API未実装 → mock successへsilent fallbackしない。

ただしAvailability、recovery、User-safe explanationとのtradeoffがある。全failureを同じ403へするのではなく、401/403/404/503等のcontractを安全に使い分ける。

## 29. Security UX and Accessibility

Session expiration、Permission Denied、Reauthentication、Destructive Confirmation等をGeneric Errorへ潰さない。Userが何が起き、何をできるかを理解できるようにする。

Security UIもM22のAccessibility Contractへ従う。Keyboard/Screen Reader UserもAuth challenge、Error、Session expired、Forbidden stateを理解・操作できなければならない。

## 30. Threat scenario: cross-tenant Project request

Scenario: Organization AのUserが、Organization B所有のProject IDをrequestする。

```text
Browser request with project_id
-> BFF validates session/context and forwards explicit request
-> Rails independently authenticates JWT
-> Rails loads Project and derives owning Organization
-> Rails checks active Membership/Role for that Organization
-> mismatch
-> deny without disclosing sensitive resource detail
-> security-relevant result is logged/audited safely
```

重要:

- BrowserのOrganization IDをpermission proofにしない。
- BFF checkだけで完了しない。
- IDが存在することをunauthorized Userへ過剰に漏らさない。
- DB FKだけでRequester permissionを判断しない。

## 31. CURRENT / TARGET / DEFERRED

| Classification | Confirmed scope |
| --- | --- |
| CURRENT | Supabase server session context、SvelteKit route/BFF guard、safe return path policy、explicit BFF endpoints、Bearer forwarding、Rails JWT independent verification、User mapping、active Organization Membership/Role scope、safe BFF error、OpenAPI Bearer scheme、Rails sensitive parameter filteringがある。 |
| CURRENT caveat | CURRENT endpoints/controlは限定範囲で、Production AnalysisJob/Worker/Artifact/Queue全体のSecurity implementationやformal reviewを証明しない。BFF route guardはRails resource authorizationの代替ではない。 |
| TARGET | Resource-derived authorization、Production Worker isolation/egress/resource limits、private Artifact access、Queue producer/consumer/integrity、central Secret management、redacted structured logging、Security Audit、rate/abuse control。 |
| DEFERRED | SSO/Passkey、full threat modeling、penetration test、formal security review、Infrastructure-specific hardening、full retention/data classification、Production Worker/Queue/Artifact controls、dependency scanner policy。 |

Security Moduleの完成はProduction Security Readinessを意味しない。

## 32. Representative repository mapping

Repo-wide Security auditではなく、12 representative sourcesを限定確認した。

| Source | Trust boundary / Asset | Confirmed control | Owner / Status |
| --- | --- | --- | --- |
| `src/hooks.server.ts` | Browser→SvelteKit、Session/route | auth context、route policy、401/403、private no-store | BFF CURRENT |
| `src/lib/server/auth/policy.ts` | Route/Organization/System role | public/protected policy、active-membership、fail-closed decision | BFF CURRENT |
| `src/lib/server/auth/session.ts` | Session/logout | provider sign-out + local cookie cleanup boundary | BFF CURRENT |
| `src/lib/auth/redirect.ts` | Browser redirect input | safe return destination policy | Frontend/BFF CURRENT |
| `src/lib/server/rails/client.ts` | BFF→Rails、access token/API errors | Session identity match、Bearer forwarding、timeout、safe error、active-org mismatch deny | BFF CURRENT |
| `rails/app/controllers/concerns/authentication.rb` | Request→Rails identity | strict Bearer extraction、JWT verifier、Current User mapping | Rails CURRENT |
| `rails/app/services/auth/supabase_jwt_verifier.rb` | External token→Rails | algorithm/kid/signature/issuer/audience/time/claim/subject validation | Rails CURRENT |
| `rails/app/controllers/concerns/organization_authorization.rb` | User→Organization resource | active Membership/Organization scoped query、role check | Rails CURRENT |
| `rails/config/initializers/filter_parameter_logging.rb` | Logs / Sensitive data | credential/PII-related parameter filtering | Rails CURRENT |
| `docs/api/openapi-draft.yaml` | API contract | global Bearer JWT scheme、public health exception | Target/Current contract evidence |
| [M14 Worker / Chromium / Collection](./14-python-worker-chromium-collection.md) | Worker→External Web | isolation/SSRF/resource/artifact boundaries documented | TARGET; runtime not implemented |
| [Product Decision Register](../../product/product-decision-register.md) | Product authorization/data semantics | approved identity/Organization/Result decisions | Canonical decisions; implementation varies |

## 33. Common misunderstandings

| Misunderstanding | Correction |
| --- | --- |
| Login = Authorization | identityとresource permissionは別 |
| Hidden button = Security | Server-side enforcementが必要 |
| BFFを通る = trusted | Railsが独立検証する |
| URL ID = permission proof | resource-derived authorizationが必要 |
| FK = Authorization | relation integrityでありRequester permissionではない |
| TLS = Authorization | transport protectionとaccess controlは別 |
| Encryption = Access Control | encrypted dataでもauthorized response判定が必要 |
| Framework = XSS完全防止 | unsafe HTML/URL/third-party境界は残る |
| Queue message = Business Truth | Rails state/identity検証が必要 |
| Worker環境はtrusted | External Webへ接触する強いboundary |
| Screenshot/HTMLは無害 | untrusted content/artifactとして扱う |
| Loggingは多いほど安全 | Secret/PII leakageを避ける |
| SecurityはBackendだけ | Browser/BFF/Rails/DB/Worker/Operations全体 |
| Client validation = enforcement | UXでありRails/DB validationを代替しない |

## 34. Decision heuristic

1. Identityか → Auth Provider + Server verification。
2. Session/contextか → SvelteKit/BFF。
3. Resource permissionか → Rails。
4. Tenant relationか → Rails scoped query + DB relation。
5. Input semanticsか → Boundaryごとのvalidation。
6. Secretか → Server-side Secret Management。
7. External Web/LLMか → Worker isolation、validation、data minimization。
8. Durable integrityか → Rails transaction + PostgreSQL constraints。
9. Sensitive operation historyか → Audit。
10. Technical diagnosticsか → Redacted Logging + correlation。
11. Controlを確認できないか → riskに応じFail Closed。

## 35. Practice

### 0. Code Reading

代表mappingから`src/hooks.server.ts`、Rails Authentication concern、Organization Authorization concern、JWT verifier、parameter filterを辿り、「どのTrust Boundaryで、何を検証し、次のLayerへ何を渡すか」を表にせよ。

### A. Knowledge check

1. Confidentiality、Integrity、AvailabilityをPanoptes例で説明せよ。
2. SecurityがLogin機能だけではない理由を説明せよ。
3. Validationを各Boundaryで繰り返す理由を説明せよ。

### B. Trust Boundary exercise

Browser→BFF→Rails→DB→Queue→Worker→External Web/LLMで、各Boundaryのuntrusted input、owner、validationを列挙せよ。

### C. Authentication vs Authorization

次を分類せよ。

1. JWT signature/issuer/audienceを検証する。
2. UserがProjectを更新できるか判定する。
3. Active Membershipを確認する。
4. SessionからUser identityを解決する。

### D. Tenant isolation

Organization AのUserがOrganization BのSnapshot IDをrequestした。Browser、BFF、Rails、DBの役割を説明せよ。

### E. Validation exercise

Email format、API request shape、Project ownership、Foreign Key、External URL/response sizeをFrontend/BFF/Rails/DB/Workerへ分類せよ。

### F. Secret exercise

Access token、LLM API key、public site URL、Database password、request IDのうち、Client/public env/logへ出してはいけないものと理由を述べよ。

### G. Worker security exercise

External URL collection時のSSRF、redirect、resource limit、Browser isolation、Artifact access、Prompt Injection boundaryを説明せよ。

### H. Violation detection

1. Browser roleをそのままtrustする。
2. Hidden buttonだけでpermission制御する。
3. orgId cookieだけでresourceを許可する。
4. BFF AuthorizationだけでRails再検証しない。
5. Secretをpublic envへ置く。
6. Raw access tokenをlogへ出す。
7. External URLを無制限にWorker fetchする。
8. Artifactを固定public URLにする。
9. Queue messageだけでBusiness transitionを確定する。
10. Dependency updateを無検証deployする。

### I. Architecture explanation

「なぜPanoptesではSecurityを一箇所で守らずDefense in Depthで設計するのか」を、boundary、owner、failure containment、auditabilityの観点から説明せよ。

## 36. Answers / explanation guide

### 0. Code Reading

`hooks.server.ts`はFrontend server boundaryでSession/route policyを扱い、Rails Authentication concernとJWT verifierはBusiness API boundaryでtoken/identityを再検証する。Organization Authorization concernはresourceとMembership/Roleを結び、parameter filterはdiagnostic logへのcredential/sensitive value露出を抑える。いずれも単独でSecurity全体の正本になるのではなく、自Layerのcontrolを担当する。

### A. Knowledge check

ConfidentialityはTenant data/Secretを守ること、IntegrityはJob/Snapshot/Membershipを正しく保つこと、AvailabilityはAPI/Workerをabuseやfailureから利用可能にすること。Loginはidentity確認に過ぎず、Authorization、validation、isolation、data/operation controlsが別途必要。Boundaryごとにownerとassumptionが変わり、上流controlのbug/bypassを封じるため再検証する。

### B. Trust Boundary exercise

Browser inputはBFFがSession/transportを、RailsがJWT/Business authを、DBがintegrityを、Queue/RailsがJob identity/transitionを、WorkerがURL/content/resourceを、External LLM boundaryがdata minimization/output provenanceを確認する。

### C. Authentication vs Authorization

1と4はAuthentication。2と3はAuthorization（3はpermission判断のinput）。

### D. Tenant isolation

Browser IDはuntrusted。BFFはSession/contextを確認してexplicit requestを送る。RailsはJWTを再検証し、Snapshotからowning Organizationを導出してMembership/Roleを確認する。DB relationはownership linkを保証するが、Authorization decisionはRailsが行う。不一致はsafe denyする。

### E. Validation exercise

Email formatはFrontend UX + Rails canonical validation、request shapeはBFF/Rails、Project ownershipはRails、FKはDB、External URL/redirect/content sizeはWorkerで検証する。

### F. Secret exercise

Access token、LLM API key、Database passwordはClient/public env/logへ出さない。Public site URLとrequest IDは通常Secretではないが、context/PII policyを確認する。

### G. Worker security exercise

Destination/redirectを検証しprivate networkを防ぎ、timeout/size/CPU/memoryを制限し、Browserを隔離・cleanupする。ArtifactはTenant-scoped private accessとlineageを持たせる。External contentをLLM instructionとして信用せず、送信Dataとprovider policyを制限する。

### H. Violation detection

順にClient trust、UI-only auth、selected context誤用、single-layer enforcement、Secret exposure、credential leakage、SSRF/resource abuse、Artifact leakage、Queue trust/state integrity violation、Supply Chain/compatibility riskである。

### I. Architecture explanation

各boundaryではfailure modeとownerが異なる。Browser/BFF/Rails/DB/Workerそれぞれが自分のcontractを検証すれば、一層のbugやbypassを次の層で封じ、cross-tenant leakやtamperingのimpactを限定できる。複数controlとcorrelation/auditにより、preventionだけでなくdetection、investigation、recoveryも可能になる。

## 37. Completion criteria

| # | Criterion | Result |
| ---: | --- | --- |
| 1 | Security fundamentals explained | `PASS` |
| 2 | Asset/Threat/Trust Boundary explained | `PASS` |
| 3 | Defense in Depth explained | `PASS` |
| 4 | Authentication/Authorization boundary explained | `PASS` |
| 5 | Session/API/Tenant security explained | `PASS` |
| 6 | Secret/Data protection explained | `PASS` |
| 7 | Worker/External Web security explained | `PASS` |
| 8 | Logging/Audit/Supply Chain explained | `PASS` |
| 9 | Repository mapping + two diagrams included | `PASS` |
| 10 | Exercises + answers included | `PASS` |

M23 authoring result: `10 / 10 PASS`。教材完成はProduction Security Readiness、formal threat model、penetration test、Infrastructure/Worker hardeningの完成を意味しない。

## 38. M24 handoff

Recommended next phase: `TB-25 — Module 24: Testing / CI/CD`。

M24ではunit/contract/integration/E2E/visual/accessibility/security-oriented test、quality gate、CI/CD、deployment verificationを扱う。Pipeline実装やDependency scanner導入は教材作成と分離する。

## References

- [M07 BFF](./07-bff.md)
- [M08 Rails Business Backend](./08-rails-business-backend.md)
- [M09 PostgreSQL / Source of Truth](./09-postgresql-source-of-truth.md)
- [M10 Auth / Authorization / Organization](./10-auth-authorization-organization.md)
- [M11 API / OpenAPI](./11-api-openapi.md)
- [M13 Async Job / Queue / Retry / Idempotency](./13-async-job-queue-retry-idempotency.md)
- [M14 Python Worker / Chromium / Collection](./14-python-worker-chromium-collection.md)
- [M15 Snapshot / History / Lineage](./15-snapshot-history-lineage.md)
- [M22 UI Regulation / Accessibility](./22-ui-regulation-accessibility.md)
- [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)
- [Product Decision Register](../../product/product-decision-register.md)
