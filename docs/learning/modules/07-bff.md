# Module 07 — BFF

Status: `COMPLETE / READY_FOR_M08`  
Phase: `TB-08`  
Prerequisites: `M01`, `M02`, `M03`, `M04`, `M05`, `M06`  
Primary standards: [Frontend Structure Policy](../../architecture/frontend-structure-policy.md), [Frontend Standardization Plan](../../architecture/frontend-standardization-plan.md)

## 1. Learning goals

このModuleを終えたLearnerは、PanoptesのSvelteKit BFFについて次を説明・判断できる。

1. BFFをBusiness Backendと区別する。
2. Browser、Client、BFF、Railsの責務とtrust boundaryを説明する。
3. Cookie/session、route guard、Organization scope、Rails authorizationの関係を追跡する。
4. Safe request forwarding、response/error adaptation、redirect validationを判断する。
5. Server load、form action、`+server.ts`をuse caseで使い分ける。
6. 現行read-only BFFと、未実装のproduction business BFFを区別する。

本Moduleは既存BFFを限定確認して教材化する。Endpoint追加、BFF再設計、Security全監査は行わない。

## 2. BFFとは何か

BFF（Backend for Frontend）は、特定Frontendの利用形態に合わせたserver-side boundaryである。

一般に次を担当できる。

- Browserから使うsame-origin endpoint。
- Cookie/session等のserver-side credential handling。
- Frontend向けrequest/response transport adaptation。
- Backend endpoint detailの隔離。
- 必要な複数backend queryのaggregation。
- Browserへ返してよいsafe error/headerの制御。

ただし、BFFはBusiness Backendの別名ではない。

```text
BFF   = frontend-specific session / transport boundary
Rails = business / domain / authorization / persistence authority
```

BFF fileがserver上で動くこと、credentialへアクセスできること、Railsを呼べることは、business ruleのSource of Truthになれる根拠ではない。

## 3. Panoptes Architecture Position

Canonical target flow:

```text
Browser
  -> Svelte UI / Feature
  -> Command
  -> Frontend Client
  -> SvelteKit BFF (/api/panoptes/v1)
  -> Rails Business API
  -> PostgreSQL / Job system
```

Responseは逆方向へ戻る。

```text
Rails canonical response/error
  -> BFF status/body/header boundary
  -> Client validation/safe error
  -> Feature state / view model
  -> UI props/render
```

M01はこの全体地図、M02はSvelteKit server file、M06はCommand/Clientまでを扱った。M07はClientとRailsの間にあるbrowser-facing server boundaryを掘り下げる。

## 4. Why Panoptes uses a BFF

PanoptesでBFFを置く主な理由は次の通り。

1. **Server-only credential boundary** — private environmentやRails base URLをclient bundleへ出さない。
2. **Cookie/session handling** — Supabase SSR cookie/sessionをserver request lifecycleで解決する。
3. **Same-origin browser surface** — Browserは`/api/panoptes/v1`へアクセスし、internal Rails locationを知らない。
4. **Backend isolation** — Rails path/header/token forwardingのdetailをFrontend Feature/UIから分離する。
5. **Auth context preparation** — verified user context、active Organization contextをrequestへ接続する。
6. **Safe transport adaptation** — timeout、request/correlation ID、cache policy、安全なerror envelopeを扱う。

BFFを挟むだけでsecurityが自動的に成立するわけではない。Browser inputは依然untrustedであり、BFF routeの実装、header allowlist、redirect validation、Rails側再認可が必要である。

## 5. Responsibility map

| Layer              | Owns                                                                                                     | Must not own                                                              | Receives                              | Returns                          |
| ------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------- | -------------------------------- |
| Browser / Frontend | interaction、presentation、Feature/transient state、intent emission                                      | secret、business authorization truth、canonical transition                | user input、safe BFF response         | typed request/intent             |
| Command            | operation intent、typed input/output                                                                     | raw UI、cookie、business decision                                         | Feature intent                        | Client invocation/result         |
| Frontend Client    | same-origin path、timeout/abort、response assertion、safe client error                                   | session truth、business rule、UI state                                    | typed Command input                   | validated response/error         |
| SvelteKit BFF      | browser-facing route、cookie/session、approved route gate、safe Rails forwarding、transport adaptation   | canonical eligibility、DB transaction、Job transition、billing/plan truth | browser request + server auth context | safe HTTP response               |
| Rails              | business authorization、Organization/resource access、rules、state transition、persistence orchestration | browser presentation state                                                | authenticated command/query           | canonical resource/outcome/error |

### Failure ownership

- Browser/Clientはtimeout、abort、network failureを安全に表す。
- BFFはsession欠落、unsafe forwarding、upstream unavailableをfail closedで返す。
- Railsはvalidation、authorization、conflict、business transition failureを確定する。
- BFFはRailsのbusiness failureをsuccessへ書き換えない。

## 6. Auth / Cookie / Session boundary

### Current request lifecycle

```text
Browser request + Supabase cookies
  -> hooks.server.ts
  -> createSupabaseServerClient(event)
  -> SupabaseAuthAdapter.resolve(event)
  -> event.locals.auth / event.locals.supabase
  -> route policy / server load / action / BFF handler
```

`hooks.server.ts`はrequestごとにSupabase server clientを作り、Supabase `getUser`を通じてUser contextを解決する。Developmentで明示設定された場合だけmock auth adapterを使う。結果は`event.locals.auth`へ置かれ、route policyやserver endpointが利用する。

Root `+layout.server.ts`は`locals.auth`から次のinitial page contextを返す。

- `authenticated`。
- `userEmail`。
- `activeOrganizationId`。

これはFrontend表示・Feature inputに使うinitial verified contextであり、全business operationのauthorization証明書ではない。

### BFFからRailsへのcredential flow

Current `proxyRailsGet`は次を行う。

1. `locals.supabase`と`locals.auth.user`を確認する。
2. Server-side Supabase sessionからaccess tokenを取得する。
3. Session user IDとresolved auth user IDが一致することを確認する。
4. Rails requestへ`Authorization: Bearer ...`を付ける。
5. Railsがtokenとbusiness authorizationを独立検証する。

Client JSへprivate environmentやRails base URLを置かない。Browserが任意Bearer valueを送れる可能性も含め、BFFを通過したことだけをRailsがtrustしてはいけない。

### Cookie ownership

Supabase SSR cookieのread/writeはserver cookie adapterが担当する。Active Organization cookieはOrganization selection actionがmembership確認後にHTTP-only、SameSite Lax、root pathで設定する。CookieにIDが入っていてもmembership authorityにはならないため、auth adapter、BFF guard、Railsで再確認する。

## 7. Route Guard vs Business Authorization

| Boundary               | Question                                              | Current owner                     | Limit                                                 |
| ---------------------- | ----------------------------------------------------- | --------------------------------- | ----------------------------------------------------- |
| Route Guard            | このroute/API surfaceへ入れるか                       | `hooks.server.ts` + route policy  | 個別resource/operationのcanonical許可ではない         |
| BFF context guard      | Active Organization contextとrequest pathが整合するか | `proxyActiveOrganizationRailsGet` | Rails DB上の最終membership/resource authorityではない |
| Business Authorization | このUserがこのresource/operationを実行できるか        | Rails                             | Browser/BFF hintだけで省略しない                      |

例: `/app`へ入れたUserが、すべてのProjectを更新できるとは限らない。Route guardはscreen familyへの入口を守るが、Project ID、Organization ownership、role、current business stateはRailsがoperationごとに検証する。

Current API policyは`/api/panoptes/v1`をauthentication requiredにする。一方、Organization detail/membership routeはhandler側でactive Organizationとの一致も確認する。これらを通過しても、RailsはBearer JWTとDB membership/resource relationを再検証する。

## 8. Organization scope

PanoptesではOrganization scopeがUser sessionとは別に必要である。

### Current selection flow

1. `SupabaseAuthAdapter`がverified User metadataからmembershipsを組み立てる。
2. Active Organization cookieのIDがmembershipに含まれる場合だけactiveとして採用する。
3. Organization selection form actionはsubmitted IDが`locals.auth.memberships`にあるか検証する。
4. 検証後にactive Organization cookieを設定する。
5. Organization-scoped BFF routeはURL paramがactive IDと一致するか確認する。
6. BFFがBearer tokenをRailsへ渡し、Railsがmembership/resource accessを再検証する。

```text
Browser-provided org ID = requested scope
Browser/BFF active org  = prepared context
Rails authorization     = canonical access decision
```

IDがURL、header、body、cookieに存在することはauthorization evidenceではない。Mismatchを別Organizationの存在確認に利用されにくくするため、Current BFFはrequested IDとactive IDが異なる場合に404を返す。

## 9. Request forwarding

General target flow:

```text
Feature -> Command -> Client -> explicit BFF endpoint -> explicit Rails operation
```

BFFが扱うtransport concern:

- HTTP methodとexplicit path。
- 許可したrequest body/query。
- `Accept`、Authorization、request/correlation ID等のsafe headers。
- timeout/AbortSignal。
- server auth/session context。
- Active Organization context。
- cache policy。

### Current forwarding shape

Current BFFはread-onlyで、各`+server.ts`が固定Rails pathまたはencoded Organization IDを使い、`proxyRailsGet`へ明示的に接続する。HelperはBrowserからupstream URLを受け取らず、任意method/headerをそのまま転送しない。

これはblind generic proxyを避ける構造である。

```text
Good:  GET /api/panoptes/v1/me -> fixed /api/v1/me
Bad:   GET /api/proxy?url=https://arbitrary.example&headers=...
```

Business endpoint追加時も、allowlist/explicit route、input schema、body size、content type、Organization scopeをuse caseごとに定義する。Browser requestを無条件proxyしない。

## 10. Response adaptation and error handling

### Current response behavior

`proxyRailsGet`はRails responseについて次を行う。

- Bodyとupstream HTTP statusを保持する。
- `content-type`をsafeに設定する。
- `cache-control: private, no-store`を付ける。
- `x-request-id`、`x-correlation-id`をsafeに返す。
- Upstream接続/configuration failureをsafe 503へする。

Frontend `canonical-bff-client.ts`はBFF responseの`data` envelopeを検証し、malformed response、timeout、abort、network errorを`PanoptesApiError`へ変換する。

### Status meaning

|    Status | Typical meaning                                        | Boundary note                                                      |
| --------: | ------------------------------------------------------ | ------------------------------------------------------------------ |
|       401 | unauthenticated/session invalid                        | BFF/hookが返せる。Railsも独立認証する                              |
|       403 | authenticatedだがroute/context/operationを許可できない | Final business authorizationはRails                                |
|       404 | resourceなし、またはscope mismatchを秘匿               | BFF active-org mismatchでもCurrent利用                             |
|       409 | current resource stateとのconflict                     | Rails business outcomeをBFFがpreserveする想定                      |
|       422 | validation failure                                     | Input/business validation ownerに従う                              |
| 5xx / 503 | upstream/backend unavailable                           | Safe detail + retryable metadata。Secret/raw exceptionを漏らさない |

Current helperが自身で生成する主なstatusは401、403、404、503で、Railsから来た他statusはpreserveする。すべてをHTTP 200で包むと、cache、monitoring、Client retry、UI error distinctionが壊れる。

### Business meaningを書き換えない

```text
Rails: 403 Forbidden
BFF:   200 Success + hidden/empty data   # prohibited
```

BFFはtransport shapeをFrontend-compatibleにできるが、forbiddenをsuccess、partialをcomplete、conflictをvalidation successへ変えない。

## 11. Redirect boundary

Auth callbackやOrganization selectionでは、login前のdeep linkへ戻す必要がある。ただしquery parameterのURLをそのままredirectするとopen redirectになる。

Current `safeReturnTo`は次を要求する。

- `/`から始まるlocal path。
- `//`から始まらない。
- backslashを含まない。
- 固定baseに解決したoriginが同一。

不正なら`/app`等のfallbackへ戻す。

### Current examples

- `hooks.server.ts`: 未認証page requestを`/login?returnTo=...`へ303 redirect。API requestはredirectせず401 JSON。
- `/auth/callback`: Supabase code exchange後、validated `next`へ303 redirect。失敗はlogin errorへ。
- `/organization/select`: membership確認とcookie設定後、validated `returnTo`へ303 redirect。
- `/auth/logout`: local session/cookieをclearしloginへ303 redirect。

Redirect後もbusiness operationは再認可する。Login成功とdeep-link復帰は、resource access承認を意味しない。

## 12. Server load / form action / `+server.ts`

| SvelteKit mechanism                          | Best fit                                                 | Panoptes current example                               |
| -------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| `+layout.server.ts` / `+page.server.ts` load | Initial SSR向けverified context/data                     | Root auth context、Organization selection data         |
| `+page.server.ts` form action                | Form submission、server validation、cookie設定、redirect | Active Organization selection                          |
| `+server.ts`                                 | HTTP endpoint、auth callback/logout、same-origin BFF     | `/api/panoptes/v1/*`、`/auth/callback`、`/auth/logout` |

「server codeだから全部`+server.ts`」「page dataだからすべてload」ではない。SSR initial data、HTML form mutation、programmatic HTTP APIというconsumer/lifecycleの違いで選ぶ。

Universal `+page.ts`/`+layout.ts`はbrowserでも動きうるため、secretやserver-only SDKを置かない。

## 13. Command vs Client vs BFF vs Rails

| Layer   | Core question                                                         | Example                                       | Must not decide                                  |
| ------- | --------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------ |
| Command | User/Featureは何をしたいか                                            | Start Analysis                                | HTTP/cookie、official eligibility                |
| Client  | FrontendからどうBFFを呼ぶか                                           | same-origin fetch、timeout、schema assertion  | session truth、business transition               |
| BFF     | Browser requestをどうserver auth context付きでRailsへ安全に接続するか | Cookie/session、Bearer forwarding、safe proxy | Project access、plan eligibility、Job transition |
| Rails   | Operationを許可し、どうbusiness stateを変えるか                       | authorize、validate、transaction、enqueue     | Browser presentation state                       |

Clientはbrowser/runtimeで使うtransport abstractionでありserver endpointではない。BFFはserver endpointでありFrontend libraryではない。RailsはBFFのupstream Business Backendである。

## 14. BFF security boundary

最低限の原則:

- Browser-provided ID、role、authorization flagをtrustしない。
- Private environment、Rails base URL、server credentialをclient bundleへ出さない。
- Forwardするmethod/path/header/bodyをexplicitに決める。
- Arbitrary upstream URLを受けるgeneric proxyを作らない。
- Redirect destinationをsame-origin local pathへ制限する。
- Error responseからtoken、provider detail、stack、internal URLを漏らさない。
- Sensitive/authenticated responseへ`private, no-store`を適用する。
- BFFでauth contextを確認してもRailsがauthorizationを再検証する。
- Request/correlation IDは形式を検証し、なければserver側で生成する。

BFFはattack surfaceを減らすboundaryになりうるが、誤ったproxyや過信によって新しいattack surfaceにもなりうる。Security詳細は後続Moduleで扱う。

## 15. CURRENT / TARGET / DEFERRED

| Area                     | `CURRENT`                                                                           | `TARGET`                                                              | `DEFERRED`                                          |
| ------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------- |
| Auth/session             | Supabase SSR server client、hooks auth resolution、route policy、callback/logout    | Productionでserver-verified auth contextを一貫利用                    | staging/production integration verification         |
| Organization             | Selection action、active cookie、BFF active-org guard、Rails read authorization     | Resource/operationごとにRailsがscope再検証                            | Project/Job/Snapshot business resource endpoints    |
| BFF surface              | health、me、organizations、organization detail、current membershipの5 read endpoint | `/api/panoptes/v1`からexplicit Organization-scoped business APIへ接続 | Project、AnalysisJob、Snapshot、Strategy、Usage等   |
| Response/error           | Upstream status/body preservation、safe 401/403/404/503、request IDs                | Typed safe contract、business meaning preservation                    | 全business endpoint contract/verification           |
| Analysis production flow | Canonical business clientは明示的503 unavailable                                    | Command→Client→BFF→Rails→Job system                                   | Production business API/Queue/Worker implementation |

BFF contractが設計済みでも全APIがproduction実装済みとは限らない。Current Organization read flowを、Production Analysis flowの実装証拠として使わない。

## 16. Representative repository mapping

以下は限定確認した11例であり、全BFF endpoint/security auditではない。

| Source                                                                      | Responsibility                                                          | Input                        | Output                                   | Auth/session                                                   | Rails relation                          | Status               |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------- | ---------------------------------------- | -------------------------------------------------------------- | --------------------------------------- | -------------------- |
| `src/hooks.server.ts`                                                       | request auth解決、route policy、API deny/redirect、private cache        | Browser request/cookies      | `locals` contextまたはHTTP outcome       | Supabase/mock adapter                                          | Rails operation authorizationは行わない | `CURRENT`            |
| `src/routes/+layout.server.ts`                                              | Initial auth context配布                                                | `locals.auth`                | authenticated/email/active org page data | read-only context                                              | Rails proxyではない                     | `CURRENT`            |
| `src/routes/organization/select/+page.server.ts`                            | memberships表示、selection validation、active-org cookie、safe redirect | form org ID + `returnTo`     | HTTP-only cookie + 303、invalidは403     | verified locals membership                                     | Final resource authはRails              | `CURRENT`            |
| `src/routes/auth/callback/+server.ts`                                       | Supabase code exchangeとsafe next redirect                              | code + `next`                | session cookie flow + 303                | server Supabase client                                         | Railsとは直接通信しない                 | `CURRENT`            |
| `src/lib/server/auth/supabase.ts`                                           | User/membership metadataとactive cookieからrequest auth context構築     | request + Supabase `getUser` | `RequestAuthContext`                     | primary auth resolver                                          | RailsはJWT/DBを独立検証                 | `CURRENT`            |
| `src/lib/server/rails/client.ts`                                            | Session token、safe GET forwarding、timeout、IDs、safe error            | BFF event + internal path    | preserved upstream response/safe error   | server session required                                        | explicit Rails upstream client          | `CURRENT read proxy` |
| `api/panoptes/v1/health/+server.ts`                                         | fixed health read route                                                 | authenticated GET            | Rails health response                    | hook + proxy session                                           | `/api/v1/health`                        | `CURRENT`            |
| `api/panoptes/v1/organizations/+server.ts`                                  | User organizations read route                                           | authenticated GET            | Rails organizations response             | hook + proxy session                                           | `/api/v1/organizations`                 | `CURRENT`            |
| `api/panoptes/v1/organizations/[organization_id]/+server.ts`                | active-org scoped detail route                                          | path org ID                  | Rails organization response              | active membership/context guard                                | encoded org path、Rails reauth          | `CURRENT`            |
| `api/panoptes/v1/organizations/[organization_id]/memberships/me/+server.ts` | current membership read route                                           | path org ID                  | Rails membership response                | active membership/context guard                                | encoded org path、Rails reauth          | `CURRENT`            |
| `src/lib/panoptes/api/canonical-bff-client.ts`                              | Browser-side same-origin client、timeout/abort、response assertion      | typed read input             | typed data / safe client error           | Cookieはbrowser requestに伴う。Clientはsession truthを決めない | BFFだけを呼びRails URLを知らない        | `CURRENT client`     |

`/me`も5 read surfaceの一つとしてCURRENTだが、表は役割差が見える代表11例に限定した。

## 17. Decision heuristic — この処理はどこか

1. **Browser interaction/renderingか？**  
   → UI / Feature。
2. **Operation intentか？**  
   → Command。
3. **Frontend transport abstractionか？**  
   → Client。
4. **Cookie/session、same-origin route、safe forwardingか？**  
   → SvelteKit BFF。
5. **Business authorization、eligibility、workflow transitionか？**  
   → Rails。
6. **Persistent record/transaction/constraintか？**  
   → Rails / PostgreSQL。
7. **Initial page contextか、form/API endpointか？**  
   → Server load、form action、`+server.ts`をconsumerに応じて選ぶ。

例: Active Organization cookieを読むのはBFF/server concern。そのUserがProjectを更新できるか決めるのはRails。Button disabled表示はFrontend presentationである。

## 18. Common misunderstandings

### 「BFF = Rails」

BFFはFrontend-specific transport/session boundary、RailsはBusiness Backend。

### 「BFF = DB access layer」

BFFから直接DBへbusiness writeを行うとRails rule/transaction/authorizationを迂回する。PersistenceはRails経由。

### 「Route Guard = Business Authorization」

Route familyへ入れることと、個別resource operationを許可されることは別。

### 「org IDがrequestにある = authorized」

IDはrequested scopeにすぎない。Membership/resource relationをRailsが検証する。

### 「BFFを通った = trusted」

BFFもBrowser inputを受ける。Railsはtoken、membership、resource、transitionを再検証する。

### 「Client = BFF」

ClientはFrontend library、BFFはserver endpoint。

### 「BFFがplan eligibilityを決める」

Plan/usage/business stateの正本を持つRailsが決める。BFFは結果を運ぶ。

### 「Errorを全部200にする」

HTTP semantics、retry、cache、monitoring、UI distinctionを壊す。Statusとsafe bodyを維持する。

### 「BrowserからRails direct accessを前提にする」

Canonical Browser surfaceはsame-origin BFF。Rails endpoint/token detailをUIへ露出しない。

## 19. Practice

### 19.1 Knowledge Check

1. BFFとBusiness Backendの違いは何か。
2. Panoptesがsame-origin BFFを使う理由を三つ挙げよ。
3. Route guardを通過してもRails authorizationが必要な理由は何か。
4. Active Organization cookieがmembership proofにならない理由は何か。
5. ClientとBFFの違いは何か。
6. BFFがupstream 403を200へ変えてはいけない理由は何か。
7. Server load、form action、`+server.ts`をどう使い分けるか。
8. Current production Analysis BFFは実装済みか。

### 19.2 Responsibility Exercise

次をClient / BFF / Railsへ分類する。

1. Fetch timeoutとresponse schema assertion。
2. Supabase cookieからserver sessionを解決。
3. ProjectがOrganizationへ属するか検証。
4. `/api/panoptes/v1`をRails pathへ接続。
5. Analysis eligibilityを決定。
6. Raw upstream errorをsafe 503へする。
7. Database transactionでAnalysisJobを作る。
8. Browser向けtyped `PanoptesApiError`を作る。

### 19.3 Request Trace

Organization detail readを次の要素で順に並べる。

- Rails JWT/membership authorization。
- `canonical-bff-client`。
- `hooks.server.ts` auth context。
- Browser Feature/Command。
- Organization `+server.ts`。
- `proxyActiveOrganizationRailsGet`。
- Client response assertion。
- Feature/UI表示。

### 19.4 Security Violation Detection

```ts
// A: BFF
const organizationId = request.headers.get('x-org-id');
return proxyToRails(`/organizations/${organizationId}/projects`); // membership checkなし
```

```ts
// B: BFF
if (body.plan !== 'premium') return json({ allowed: false });
// Railsへ送らずAnalysis eligibilityを確定
```

```ts
// C: browser client
const railsSecret = PUBLIC_RAILS_SECRET;
```

```ts
// D: generic proxy
const target = url.searchParams.get('target');
return fetch(target!, { headers: request.headers });
```

```ts
// E: Rails
// BFFがorgを確認した前提でresource authorizationを省略
```

各例のriskと修正ownerを答える。

### 19.5 Design Exercise — Start Analysis API

「Analysis開始API」を次へ分割する。

- Command。
- Client。
- BFF。
- Rails。

Session、Organization scope、idempotency、validation、error、Job creationを含める。CURRENT/DEFERREDも明記する。

## 20. Answers / Explanation Guide

### 20.1 Knowledge Check要点

1. BFFはFrontend向けsession/transport、Railsはbusiness/domain/authorization/persistence authority。
2. Server credential、cookie/session、same-origin、Rails isolation、安全なresponse/error等。
3. Route accessはresource ownership/current business stateを証明しないため。
4. Browser cookieは改変・staleの可能性があり、DB membership/resource relationではないため。
5. ClientはFrontend transport abstraction、BFFはserver-side HTTP boundary。
6. Business denialを成功へ変え、Client/monitoring/cacheへ誤ったmeaningを与えるため。
7. Initial SSR contextはload、form mutation/cookie/redirectはaction、HTTP API/callbackは`+server.ts`。
8. いいえ。Currentは5 read surface。Production Analysis business APIはTarget/Deferredでcanonical clientは503 fail closed。

### 20.2 Responsibility回答

1. Client。
2. BFF/server auth layer。
3. Rails。BFFもcontext guardを行えるがfinal authorityではない。
4. BFF。
5. Rails。
6. BFF。
7. Rails/PostgreSQL。
8. Client。

### 20.3 Request Trace回答

```text
Browser Feature/Command
  -> canonical-bff-client
  -> hooks.server.ts auth context / route guard
  -> Organization +server.ts
  -> proxyActiveOrganizationRailsGet
  -> Rails JWT/membership/resource authorization
  -> BFF response preservation
  -> Client response assertion
  -> Feature/UI display
```

### 20.4 Security Violation回答

- **A:** Browser org IDをauthorityとして採用。Active context guardを行い、Railsでmembership/resourceを再認可する。
- **B:** BFFがbusiness eligibilityを所有。Railsへtyped commandを送りcanonical decisionを返す。
- **C:** Credentialをpublic bundleへ露出。Private environment/server-only BFFへ置く。
- **D:** SSRF、credential/header leakage、open proxy。Explicit route/path/method/header allowlistへ置き換える。
- **E:** Trust boundary誤認。RailsがJWT、Organization membership、resource ownership、operation policyを必ず検証する。

### 20.5 Design Exercise回答例

```text
Command
  input: explicit organizationId, targetUrl, projectName, idempotency intent
  owns: Start Analysis intent and typed result/error

Client
  POST same-origin /api/panoptes/v1/organizations/:id/analyses
  owns: timeout/abort, response assertion, safe client error

BFF
  resolves server session, checks requested vs active org context
  validates method/content type/body envelope and forwards safe headers/token/idempotency key
  preserves Rails status/business meaning, hides sensitive upstream detail

Rails
  validates JWT and DB membership/resource scope
  decides eligibility, validates canonical input, enforces idempotency
  transactionally creates Project/AnalysisJob and enqueues work

CURRENT: auth/session and Organization read proxy patterns
DEFERRED: production Project/AnalysisJob POST endpoint and Job system
```

BFF側のformat/body-size validationはtransport protectionであり、Rails canonical validationを置き換えない。

## 21. Completion Criteria

| Criterion                                          | Result |
| -------------------------------------------------- | ------ |
| 1. BFF fundamentals explained                      | `PASS` |
| 2. Panoptes BFF purpose explained                  | `PASS` |
| 3. Browser/BFF/Rails responsibilities explained    | `PASS` |
| 4. Auth/cookie/session boundary explained          | `PASS` |
| 5. Route Guard vs Business Authorization explained | `PASS` |
| 6. Organization scope explained                    | `PASS` |
| 7. Request/response adaptation explained           | `PASS` |
| 8. security/error boundary explained               | `PASS` |
| 9. representative repository mapping included      | `PASS` |
| 10. exercises + answers included                   | `PASS` |

M07 Authoring DoD: `10 / 10 PASS`  
Module status: `COMPLETE / READY_FOR_M08`

このstatusは教材artifactの完成を示す。Learner assessment合格、全BFF endpoint監査、Production Analysis API、Security review完了を意味しない。

## 22. Handoff to M08

次は`M08 — Rails Business Backend`。M07で確定したBFF/Rails境界を前提に、Railsがbusiness authorization、domain rule、transaction、canonical state transition、persistence orchestrationを所有する理由と現行/Target実装を学ぶ。

## References

- [Panoptes Technical Bootcamp](../panoptes-technical-bootcamp.md)
- [M01 Panoptes Overall Architecture](./01-panoptes-overall-architecture.md)
- [M02 Svelte / SvelteKit](./02-svelte-sveltekit.md)
- [M06 State / Controller / Command](./06-state-controller-command.md)
- [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)
- [Frontend Standardization Plan](../../architecture/frontend-standardization-plan.md)
