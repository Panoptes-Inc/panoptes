# Module 10 — Auth / Authorization / Organization

Status: `COMPLETE / READY_FOR_M11`  
Phase: `TB-11`  
Difficulty: `INTERMEDIATE`  
Prerequisites: `M01`–`M09`

## 1. Learning goals

このModuleを終えたLearnerは、次を説明・判断できる。

1. AuthenticationとAuthorizationを区別する。
2. Browser cookie、Supabase session、SvelteKit server context、Rails JWT検証を追跡する。
3. Organization、Membership、Role、Resource ownershipを区別する。
4. Route Guard、BFF context guard、Rails Business Authorizationの強さを比較する。
5. Multi-tenant resource accessをsubject/resource/action/contextで評価する。
6. deep-link、current Organization、safe return-toをauthorization proofと混同しない。
7. CURRENTとTARGET/DEFERREDを分けて安全な設計判断をする。

## 2. Authentication fundamentals

Authentication（AuthN）は「誰であるか」を確認すること。

| Term | Meaning |
| --- | --- |
| Identity | Userを識別するsubject |
| Login | identity providerへ認証情報を提示するflow |
| Session | 認証後の継続的なserver/browser context |
| Cookie | Browserがrequestへ付ける保存・transport mechanism |
| Token | identity/claimsを検証可能な形で伝えるcredential |
| Logout | local session/cookieを終了・破棄するoperation |

PanoptesではSupabase/Auth Providerがidentityを認証し、SvelteKit serverがcookie/sessionをrequest contextへ解決し、RailsがBearer JWTをもう一度検証してPanoptes Userへmapする。

重要:

```text
Authentication successful != all resources authorized
```

Login済みであることは、全Organization、Project、AnalysisJob、Snapshotへアクセスできることを意味しない。

## 3. Authorization fundamentals

Authorization（AuthZ）は「そのidentityが、そのresourceに、そのactionを、そのcontextで実行してよいか」を判断すること。

| Element | Question | Example |
| --- | --- | --- |
| Subject | 誰が | User A |
| Resource | 何へ | Organization XのProject Y |
| Action | 何を | read / update / startAnalysis |
| Context | どの条件で | active membership、role、resource state |

AuthorizationはIDだけでは判断できない。たとえばUser AがOrganization Xに属し、Project YもXに属し、roleが`startAnalysis`を許可し、Project stateも開始可能であることを確認して初めてoperationを許可できる。

## 4. CURRENT Panoptes identity flow

```text
Browser
  -> Supabase Auth / session cookies
  -> SvelteKit hooks.server.ts
  -> SupabaseAuthAdapter.resolve(event)
  -> event.locals.auth
  -> Route/BFF context guard
  -> server-side Supabase getSession()
  -> Authorization: Bearer <access token>
  -> Rails Authentication concern
  -> SupabaseJwtVerifier
  -> UserMapper -> Current.user
  -> OrganizationAuthorization
  -> DB Membership / Organization / role
```

1. SvelteKitはrequestごとにserver Supabase clientを作る。
2. `getUser()`でproviderへUserを検証し、request-local auth contextを構築する。
3. Route policyがauthentication、active Organization context、system role等の入口条件を評価する。
4. BFFがserver sessionからaccess tokenを取得し、RailsへBearerとして転送する。
5. Railsはtokenをtrust済みとはみなさず、signature、issuer、audience、expiration等を検証する。
6. RailsはSupabase subjectをPanoptes Userへmapし、suspended/deleted Userを拒否する。
7. Organization endpointはDB上のactive Membership、active Organization、required roleを確認する。

Supabaseがidentityを証明しても、Panoptes resourceのbusiness permissionまでは証明しない。

## 5. Session and cookie boundary

### Browser / SvelteKit

Supabase SSR cookieのread/writeはserver cookie adapterを通る。adapterはprovider supplied optionsを維持しつつ`path: '/'`とenvironmentに応じた`secure`を設定する。実装から確認できないcookie属性を推測しない。

Active Organization cookieはselection actionが次で設定する。

- `httpOnly: true`
- `sameSite: 'lax'`
- production相当で`secure: true`
- `path: '/'`

このcookieはUI/BFFのselected contextであり、Rails DB membershipの証明ではない。

### Callback / expiration / logout

- Callbackはauthorization codeをserver-sideでsessionへ交換する。
- Session/tokenが欠落・期限切れ・不正ならprotected accessを許可しない。
- Logoutはprovider local sign-outを試み、失敗時もlocal Supabase/active Organization cookiesをclearする。
- Callback・logout・selectionは303 redirectを使う。

Client JavaScriptがaccess tokenやsecretを不必要に直接扱うと、XSS exposure、transport duplication、責務分散が増える。Panoptes Clientはsame-origin BFFを呼び、serverがsession tokenを扱う。

## 6. Organization, Membership, and tenant boundary

OrganizationはPanoptesのbusiness/tenant boundaryである。

```text
User
  <-> OrganizationMembership
  <-> Organization
```

- User: authenticated subjectに対応するPanoptes identity。
- Organization: tenant/business scope。
- Membership: UserとOrganizationの所属関係。

CURRENT Rails schemaではMembershipは`user_id`と`organization_id`をFKで結び、pairをUNIQUEにする。statusは`active / invited / suspended`。Organizationも`active / suspended`を持つ。

Membership rowの存在だけでは不十分である。CURRENT Rails authorizationはactive Membershipとactive Organizationの両方をqueryする。

## 7. Membership vs Role

```text
Membership = どのOrganizationに所属するか
Role       = その所属またはsystem scopeでどの権限levelか
```

CURRENT Rails Organization Membership roles:

- `owner`
- `organization_admin`
- `analyst`
- `project_manager`
- `viewer`
- `guest`

Organization read rolesは上記から`guest`を除いた集合。SystemRoleはCURRENTで`system_admin`のみである。

SvelteKit request contextのmetadata role vocabularyには`organization_owner`があり、Rails Membershipは`owner`を使う。両者は別の確認済み表記であり、教材上で勝手に同一canonical valueへ変換しない。Production metadata/DB synchronization contractとmappingは検証・明文化が必要なhandoffである。

Roleだけで全Authorizationが決まるとは限らない。operation、resource owner Organization、resource state、plan/eligibility等も判断要素になる。

## 8. Resource ownership

TARGET resource chain:

```text
User
  -> active OrganizationMembership
  -> active Organization
  -> Organization-owned Project
  -> Project-owned AnalysisJob
  -> Job-produced Snapshot
```

Operationでは少なくとも次を確認する。

1. Userがauthenticatedか。
2. Userにactive Membershipがあるか。
3. ResourceがどのOrganizationに属するか。
4. Membership Organizationとresource Organizationが一致するか。
5. Roleがactionを許可するか。
6. Resource state上、そのactionが可能か。

FKはresource relationを守れるが、actorのpermissionは証明しない。Project/AnalysisJob/Snapshotのphysical schemaとauthorization policyは未実装である。

## 9. Route Guard

Route Guardはroute familyへ入る前提を早期評価する。

CURRENT SvelteKit policyの例:

| Surface | Entry policy |
| --- | --- |
| `/`, `/lp`, `/plan`, `/login`, `/auth/callback` | public |
| `/api/panoptes/v1/*` | authentication required |
| `/organization/select`, `/auth/logout` | authentication required |
| `/admin/*` | authentication + system admin |
| `/app/dev/ui`, `/dev/analysis-preview` | development only + system admin/developer |
| other protected page | authentication + active Organization membership context |

Page requestではlogin/Organization selectionへredirectし、API requestでは401/403 JSONを返す。Guard後のauthenticated responseにはprivate/no-storeが設定される。

Route GuardはUXとentry controlとして有用だが、個別resource/actionのBusiness Authorizationではない。

## 10. BFF context guard

BFFが確認できるもの:

- server auth contextとsession/tokenの存在・User一致。
- active Organization contextの存在。
- requested Organization IDとactive Organization IDの整合。
- same-origin endpoint、method、path等のtransport contract。
- obvious malformed input。

CURRENTのOrganization proxyはactive contextがなければ403、requested Organizationがactive IDと異なれば404を返す。その後でもRailsへBearerを送り、RailsがDB authorizationを再実行する。

```text
BFF check PASS != Rails authorization PASS
```

BFF metadataやcookieはstaleになり得る。RailsのDB membership/resource decisionを省略しない。

## 11. Rails Business Authorization

Railsが最終authorityとして確認するもの:

- verified token claimsとmapped Panoptes User。
- User status。
- active Membership。
- active Organization。
- required role。
- TARGETではresource-derived Organization、operation permission、resource state。

CURRENT `OrganizationAuthorization`は、`Current.user.organization_memberships.active`を起点にactive Organizationへjoinし、requestのOrganization IDをqueryする。見つからなければ404、required roleを満たさなければ403とする。

悪い方向:

```text
Project.find(params[:id])
-> authenticatedなら返す
```

良い方向:

```text
verified Current.user
-> resourceからowner Organizationをderive
-> active Membership / role / action / stateを検証
-> authorized resourceだけ返す
```

Exact policy/service patternはProject実装時に決める。教材だけで新しいpolicy frameworkを発明しない。

## 12. Authentication Provider vs Application Authorization

| Boundary | Owns | Does not own |
| --- | --- | --- |
| Supabase/Auth Provider | login、identity、session/token発行 | Panoptes Project/Job/Snapshot permission |
| SvelteKit/BFF | cookie/session、route entry、safe proxy、request context | canonical business permission |
| Rails | application authorization、membership/resource/action/state | Browser session UX |
| PostgreSQL | Membership/resource relationとintegrity | context-sensitive permission decision |
| Frontend | authorized resultの表示、visibility hint | enforcement |

External identity providerのmetadataはrequest contextに使えても、Panoptes business permission truthを丸投げしない。

## 13. Organization selection

```text
selected Organization != authorization proof
```

CURRENT selection flow:

1. Server auth contextのMembership候補を表示する。
2. submitted Organization IDがcontext Membershipに含まれるか確認する。
3. HTTP-only active Organization cookieを設定する。
4. safe `returnTo`へredirectする。
5. BFFはrequested IDとの整合を確認する。
6. RailsはDBのactive Membership/Organization/roleを再確認する。

Active Organizationはnavigation/request contextを安定させるが、resource ownershipはresource自身からderiveする必要がある。Explicit resourceが別Organizationに属する場合、silent Organization switchを行わない。

## 14. Deep-link and current-resource contract

PD-01Bの承認済み方向:

```text
URL selector
  -> authenticated BFF
  -> Rails authorization / canonical resolution
  -> validated Frontend rendering
```

URL内のOrganization/Project/Job/Snapshot IDはselectorでありauthorization proofではない。

- identity-less `/app/analysis`: active Organizationのserver-authorized current。なければEntry/empty。
- explicit Job: process/outcome identity。
- explicit Snapshot: immutable historical resource。
- explicit resource failure: current/latest/別resourceへsilent fallbackしない。
- explicit resourceのOrganization: Railsがresourceからresolve/validateする。

```text
latest != current != Strategy source != historical Snapshot
```

Exact deep-link URL shape、current pointer endpoint、Project/Job/Snapshot Rails APIは`NOT_IMPLEMENTED`である。

## 15. Safe returnTo

Login/callback/Organization selection後に元のpageへ戻す場合もredirect targetをtrustしない。

CURRENT `safeReturnTo`は次を要求する。

- `/`で始まるsame-origin relative path。
- `//`で始まらない。
- backslashを含まない。
- URL解決後のoriginがPanoptes local baseと一致する。
- invalid時は`/app`へfallback。

Return後もresourceを再authorizationする。安全なredirect先であることと、そのresourceへのpermissionは別問題である。

## 16. 401 / 403 / 404

| Status | General meaning | CURRENT examples |
| --- | --- | --- |
| 401 | unauthenticated / invalid credential | BFF session欠落、Rails token欠落・不正・期限切れ |
| 403 | authenticatedだが許可なし | route/system role deny、required Organization role不一致 |
| 404 | resource不存在、またはscope情報を露出しないnot found | BFF active-org mismatch、Rails active Membership/Organizationなし |

404で秘匿するか403で明示するかはAPI/security contractで決める。教材から無条件な404 policyを新設しない。CURRENT実装では上記のspecific casesが確認できる。

## 17. Multi-tenant isolation

Organization AのUserがOrganization BのProject、AnalysisJob、Snapshotを取得・更新できないことがtenant isolationの基本である。

防御層:

1. Frontend: authorized responseだけ表示。ただしsecurity boundaryではない。
2. Route/BFF: sessionとselected scopeのobvious mismatchを早期拒否。
3. Rails: resource-derived Organization、Membership、role、action、stateをcanonicalに検証。
4. PostgreSQL: Organization/resource relationとFK/constraintを保持。
5. Query: authorized scopeからresourceを取得し、unscoped global lookup結果をそのまま返さない。

Frontend filteringだけでは、direct HTTP requestや改変IDを防げない。BFF guardだけでもstale metadataや別entry pathへの対策として不十分である。

## 18. Role and permission

RBACはroleへpermissionを結び付ける一般的なmodelである。ただしPanoptesのCURRENT canonical値は既存modelの範囲に限る。

- Organization role: `owner`, `organization_admin`, `analyst`, `project_manager`, `viewer`, `guest`。
- System role: `system_admin`。
- BFF development contextには`developer` flagもあるが、Rails SystemRole modelの値ではない。

Future capability matrix、Project-specific role、SSO group mapping等は未決定。教材例を理由にroleを追加しない。

## 19. CURRENT / TARGET / DEFERRED

| Area | CURRENT | TARGET | DEFERRED |
| --- | --- | --- | --- |
| Authentication | Supabase SSR、getUser、callback/logout、Rails JWT再検証 | production verified identity chain | staging/production integration evidence |
| Session/cookie | server cookie adapter、active-org HTTP-only cookie、BFF token forwarding | consistent secure deployment settings | provider cookie/rotation operational verification |
| Route guard | public/protected/admin/dev/active-org policies | all intended surfaces mapped | full route permission audit |
| Organization | User/Membership/Organization DB boundaryとread authorization | resource-derived tenant authorization | lifecycle/admin management |
| Roles | Rails Membership 6 values、SystemRole system_admin、BFF metadata vocabulary | explicit cross-boundary role mapping | future capability model |
| Resources | Organization read endpoints | Project/AnalysisJob/Snapshot authorization | schema/endpoints/policies |
| Deep-link | safe return-to、route protection | Model C current + explicit history | exact URL/current pointer/API implementation |
| Advanced auth | none confirmed | only after approved need | SSO、Passkey等 |

特にBFF `organization_owner`とRails `owner`は語彙が異なる。mappingまたはupstream metadata contractが別途確認されるまで、統一済みとは表現しない。

## 20. Representative repository mapping

以下は限定確認した12例であり、全Route permission/Auth監査ではない。

| Source | Classification | Owner | Input | Output | Status |
| --- | --- | --- | --- | --- | --- |
| `src/hooks.server.ts` | Route guard / auth context | SvelteKit | request/cookies/route | locals、redirect、401/403/404 | `CURRENT` |
| `src/lib/server/auth/supabase.ts` | Authentication adapter / selected org context | BFF server | Supabase User、metadata、cookie | `RequestAuthContext` | `CURRENT` |
| `src/lib/server/auth/policy.ts` | Route entry policy | SvelteKit | route、auth context、environment | allow/redirect/deny/not-found | `CURRENT` |
| `src/lib/server/supabase-cookies.ts` | Cookie adapter/cleanup | BFF server | provider cookie operations | set/delete cookie | `CURRENT` |
| `src/routes/auth/callback/+server.ts` + `auth/logout/+server.ts` | Session lifecycle | SvelteKit server | code/session + safe destination | exchange/sign-out/303 | `CURRENT` |
| `src/routes/organization/select/+page.server.ts` | Organization selection guard | SvelteKit server | Membership context、form ID | active-org cookie + safe redirect | `CURRENT` |
| `src/lib/server/rails/client.ts` | BFF session forwarding/context guard | BFF server | server session、requested org | Bearer Rails request/safe error | `CURRENT read proxy` |
| `rails/app/controllers/concerns/authentication.rb` | Rails Authentication | Rails | Authorization header | verified `Current.user` | `CURRENT` |
| `rails/app/services/auth/supabase_jwt_verifier.rb` | Token verification | Rails | Bearer JWT、JWKS/config | verified claims/error | `CURRENT` |
| `rails/app/services/auth/user_mapper.rb` | Application identity mapping | Rails | verified claims | active Panoptes User | `CURRENT` |
| `rails/app/controllers/concerns/organization_authorization.rb` | Organization Authorization | Rails | Current User、org ID、required roles | Current Organization/Membership or 403/404 | `CURRENT` |
| `rails/app/models/organization_membership.rb` + `system_role.rb` | Membership/Role vocabulary | Rails/PostgreSQL | persisted relation/status/role | scoped auth data | `CURRENT` |

Project/AnalysisJob/Snapshot authorizationは上表に実装例として含めない。logical TARGETでありCURRENT sourceがないためである。

## 21. Common misunderstandings

### 「Logged in = authorized」

Authenticationはsubject確認。各resource/actionのAuthorizationは別に必要。

### 「orgIdを知っている = member」

IDはselector。Railsがactive DB Membershipを検証する。

### 「URL resource ID = authorization proof」

Deep-linkはlookup intentでありpermission evidenceではない。

### 「Buttonを隠した = permission enforcement」

Frontend表示は回避可能。Railsが同じoperationを拒否できなければならない。

### 「BFF guardを通った = Rails auth不要」

BFF contextはstale/transport-specific。RailsがJWTとbusiness relationを独立検証する。

### 「Foreign key = access permission」

FKはrow relationの存在だけを守る。

### 「Roleだけで全Authorizationが決まる」

Resource ownership、action、state、eligibilityも必要になり得る。

### 「Auth ProviderがApplication Authorization owner」

Providerはidentity/session owner。Panoptes permissionはRails owner。

### 「Current Organization = resource ownership」

Current selectionはcontext。Explicit resourceのowner Organizationはresourceからderiveする。

### 「Deep-linkならguardを迂回できる」

すべてのentry pathでserver-side Authentication/Authorizationが必要。

## 22. Decision heuristic — どこで判断するか

1. Identityを確認するか。  
   → Auth Provider + server auth context。Railsも受領tokenを検証。
2. Browser session/cookieを扱うか。  
   → SvelteKit/BFF server。
3. Route familyへのentry条件か。  
   → SvelteKit Route Guard。
4. Active Organization contextのtransport整合か。  
   → BFF context guard。
5. DB上のOrganization Membershipか。  
   → RailsがPostgreSQL relationをquery。
6. Resource ownership、operation permission、business stateか。  
   → Rails。
7. Relation integrityか。  
   → PostgreSQL FK/constraint。
8. Authorized stateに応じたUI visibilityか。  
   → Frontend。ただしenforcementではない。

## 23. Practice

### 23.1 Knowledge Check

1. AuthenticationとAuthorizationの違いは何か。
2. Session cookieとaccess tokenは何を担うか。
3. MembershipとRoleの違いは何か。
4. Active Organization cookieがauthorization proofでない理由は何か。
5. Supabase login済みでもRailsがJWTを検証する理由は何か。

### 23.2 Classification Exercise

次をAuthN / AuthZ / Session / Relation Integrityへ分類する。

1. JWT signatureとexpirationを検証する。
2. UserがProjectをupdateできるか決める。
3. Login後のcookieをBrowserへ設定する。
4. ProjectのOrganization FKを守る。
5. Membership roleがrequired roleに含まれるか確認する。
6. Logout時にlocal cookieを削除する。

### 23.3 Request Trace

Login済UserがProject deep-linkへアクセスするflowを、Browser、hooks、BFF、Rails Authentication、Rails Authorization、PostgreSQL、Frontendの順に説明せよ。CURRENTとTARGETも明記する。

### 23.4 Tenant Isolation Exercise

User AはOrganization Aの`viewer`であり、Organization Bには所属しない。次を判断せよ。

1. Organization Aのread可能resourceを表示する。
2. Organization BのProject IDをURLへ入力する。
3. Organization AのAnalysisをstartする。
4. Organization AのSnapshot deep-linkを開く。

Role/action contractやresource実装が未決定なら、推測でallow/denyを確定しないこと。

### 23.5 Violation Detection

問題点を説明せよ。

1. Frontendでbuttonを隠したためRailsではpermissionを確認しない。
2. URLの`organization_id`をそのままtenant scopeにする。
3. BFF guardを通ったのでRails JWT/Membership確認を省略する。
4. FKが存在するのでUser accessを許可する。
5. Supabase login済みUserへ全Projectを返す。
6. `returnTo=https://evil.example`へredirectする。

### 23.6 Design Exercise — Snapshot deep-link

Snapshot deep-linkを開く際の責務を次へ分ける。

- Session
- BFF
- Rails Authentication
- Rails Authorization
- Organization/Resource relation
- Snapshot/current/history
- Frontend

## 24. Answers / Explanation Guide

### 24.1 Knowledge Check要点

1. AuthNはsubject確認、AuthZはsubject/resource/action/contextの許可判断。
2. CookieはBrowser/server session transport、tokenはprovider claimsを検証可能に伝えるcredential。どちらも単独でbusiness permissionを証明しない。
3. Membershipは所属relation、Roleはそのscopeのpermission level/vocabulary。
4. Cookieはclient-held selectionで、stale/改変可能性がありDB relation/resource ownershipではない。
5. Trust boundaryが異なり、Railsがcanonical application decisionの前にcredentialを独立検証するため。

### 24.2 Classification回答

1. AuthN。
2. AuthZ。
3. Session。
4. Relation Integrity。
5. AuthZ。
6. Session。

### 24.3 Request Trace回答

```text
Browser cookies + deep-link selector
  -> hooks resolves Supabase User and route entry
  -> BFF validates server session and forwards Bearer token
  -> Rails verifies JWT and maps Current.user
  -> Rails loads resource, derives Organization, checks active Membership/role/action/state
  -> PostgreSQL supplies canonical relation/data
  -> authorized response only is rendered by Frontend
```

CURRENTはOrganization readまで。Project/Snapshot deep-link resolutionとresource policyはTARGET/DEFERRED。

### 24.4 Tenant Isolation回答

1. Aのactive Membershipとread role、resource ownershipが確認できればallow候補。
2. BのMembershipがないためdeny/not-found。URL IDを知ることはpermissionではない。
3. `viewer`がstart可能かはCURRENT contractにないため断定不可。Rails operation policyが必要。
4. Snapshot implementationは未実装。Targetではresource-derived Organization、Membership、historical access policyを確認する。

### 24.5 Violation回答

1. UIをsecurity boundaryにしている。Rails enforcementが必要。
2. Request selectorをownership proofとしてtrustしている。
3. BFFとRailsのtrust boundaryを混同している。
4. IntegrityとAuthorizationを混同している。
5. AuthNだけで全resource AuthZを許可している。
6. Open Redirect。same-origin validationとfallbackが必要で、redirect後も再認可する。

### 24.6 Snapshot deep-link回答例

```text
SvelteKit
  resolves session and applies route entry guard
  validates same-origin navigation/return-to

BFF
  accepts explicit Snapshot selector
  forwards verified server session token through an explicit endpoint
  does not silently switch Organization or fallback to current/latest

Rails
  verifies JWT and maps User
  loads Snapshot, derives owner Organization through canonical relations
  checks active Membership, role, historical access policy
  returns authorized immutable Snapshot or explicit 401/403/404 outcome

Frontend
  renders validated historical state
  does not reinterpret it as current or Strategy source
```

Snapshot endpoint/schema/policyは未実装なので、これはapproved deep-link/ownership principlesに基づくTARGET exerciseである。

## 25. Completion Criteria

| Criterion | Result |
| --- | --- |
| 1. Authentication explained | `PASS` |
| 2. Authorization explained | `PASS` |
| 3. Session/cookie boundary explained | `PASS` |
| 4. Organization/Membership explained | `PASS` |
| 5. Role/resource ownership explained | `PASS` |
| 6. Route Guard vs Business Authorization explained | `PASS` |
| 7. multi-tenant isolation explained | `PASS` |
| 8. deep-link/current-org boundary explained | `PASS` |
| 9. representative repository mapping included | `PASS` |
| 10. exercises + answers included | `PASS` |

Authoring DoD: `10 / 10 PASS`。

これは教材artifactの完成を示す。Learner assessment合格、full permission audit、Project/AnalysisJob/Snapshot authorization実装、production Supabase integration verification、Production Readinessを意味しない。

## 26. Handoff to M11

Recommended next phase: `TB-12 — Module 11: API / OpenAPI`。

M11ではresource/operation、request/response、HTTP status/error、schema/version、implementationとの一致を扱う。本Moduleでは誰がrequestを行い、どのtrust boundaryでauthorizationするかまでを確定し、API contract本文を先取りしない。

## References

- [Panoptes Technical Bootcamp](../panoptes-technical-bootcamp.md)
- [M07 BFF](./07-bff.md)
- [M08 Rails Business Backend](./08-rails-business-backend.md)
- [M09 PostgreSQL / Source of Truth](./09-postgresql-source-of-truth.md)
- [Product Decision Register](../../product/product-decision-register.md)
- [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)
- [SvelteKit request hook](../../../src/hooks.server.ts)
- [Rails Authentication concern](../../../rails/app/controllers/concerns/authentication.rb)
- [Rails Organization Authorization concern](../../../rails/app/controllers/concerns/organization_authorization.rb)
