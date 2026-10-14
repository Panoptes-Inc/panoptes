# Phase A-4 Supabase SSR Cookie認証とSecret境界

実施日: 2026-08-06

## 結論

Supabaseのbrowser loginを`@supabase/ssr`のcookie sessionへ切り替え、SvelteKitのrequestごとのserver client、callback、refresh、logout、失効時のanonymous化を一つの経路へ統合した。`hooks.server.ts`は検証済みUserから`event.locals.auth`を構築してからroute guardを適用する。

これはRails側の最終的なOrganization membership・Role・SystemAdmin判定を実装したものではない。現時点のmembership claimは暫定入力であり、業務データの認可正本にはできない。

## 変更前と変更後

変更前は`@supabase/supabase-js`のbrowser clientがlocalStorage中心でsessionを保持し、SvelteKit serverから同じsessionを確認できなかった。Phase A-3のguardはserverで検証可能なsessionがない利用者をsecure defaultで拒否していた。

変更後の経路は次のとおり。

```text
Supabase Auth
  -> @supabase/ssr cookie
  -> request-scoped SvelteKit server client
  -> getUser()によるserver検証・必要時refresh
  -> Auth Provider Adapter
  -> event.locals.auth
  -> route guard
```

server clientはrequestごとに生成する。module singletonとしてcookie状態を共有しない。browser clientとserver clientは同じcookie名・属性を使い、SDKがaccess tokenとrefresh tokenの分割・chunk・更新を管理する。

## Browser clientとServer clientの責任

### Browser client

- public Supabase URLとpublic anon keyだけを使用する。
- password login、signup、確認メール再送を開始する。
- `createBrowserClient`が認証cookieを読み書きする。
- login成功時はsession確立を確認し、安全な同一origin pathへ遷移してserver dataを再取得する。
- Organization role、SystemAdmin、service-role処理は持たない。

### Server client

- `src/lib/server/supabase.ts`でrequestごとに生成する。
- SvelteKitの`cookies.getAll` / `cookies.set`を`@supabase/ssr`へ接続する。
- `getUser()`でSupabase Auth serverにUserを検証させ、検証失敗・期限切れ・provider障害はanonymousとして扱う。
- refreshでSDKから返ったcookieとcache headerをresponseへ反映する。
- callbackのcode exchangeとlogoutをserver routeで行う。
- client-visible moduleからimportできない`$lib/server`配下に置く。

## Cookie方針

Supabase session cookieの基底名は`panoptes-auth`とし、SDKによるchunk suffixを許容する。

| 属性 | Development | Production | 備考 |
| --- | --- | --- | --- |
| Path | `/` | `/` | callback・app・adminで共有 |
| SameSite | `Lax` | `Lax` | top-level callbackを許容しつつcross-site送信を制限 |
| Secure | No | Yes | local HTTP開発だけ例外 |
| HttpOnly | No | No | Supabase SSR SDKのbrowser refresh設計に従う |
| Max-Age | SDK管理 | SDK管理 | token refresh時を含めSDK値を上書きしない |

Supabase SSR cookieはbrowser SDKもrefresh tokenを扱う設計のためHttpOnlyへ独自変更していない。その代わり、tokenをlayout data・query・log・画面へ返さず、CSP/XSS対策と依存更新を継続課題とする。

`panoptes_organization_id`は別責務のPanoptes cookieであり、HttpOnly、SameSite=Lax、Path=/、production Secureとする。Supabase cookieへOrganization情報を混在させない。

callback・通常requestのrefreshではSDKの`setAll`結果を反映する。logoutでは全`panoptes-auth` chunkとactive Organization cookieを削除する。認証済み・protected responseおよびcookie更新responseは`Cache-Control: private, no-store`とする。

## Login・Callback・Refresh・Logout

### Login

`SignUpForm.svelte`のpassword loginは`signInWithPassword`後にsessionの存在を確認する。成功時は`returnTo`を`safeReturnTo`で検証し、外部URL、protocol-relative URL、backslashを拒否して既定の`/app`へ戻す。route guardがactive Organization未選択なら`/organization/select`へ送る。エラーはtokenやprovider内部詳細を含まない利用者向け文言へ変換する。

### Callback

`GET /auth/callback`はPKCE codeを`exchangeCodeForSession`へ渡す。signup確認メールのredirectもこのrouteへ統一した。成功時はcookieを更新して安全な`next`へ遷移し、code欠落・交換失敗時は`/login?error=callback_failed`へ遷移する。state・code verifierの検証はSupabase PKCE実装とcookie storageに委ね、独自に迂回しない。

### Refreshと期限切れ

`hooks.server.ts`はrequestの早い段階でrequest-scoped clientを作り、Auth Providerが`getUser()`を一度呼ぶ。SDKが必要と判断したときだけrefreshし、成功時のcookieをresponseへ反映する。失敗時はanonymousとなり、protected pageはloginへredirectされる。独自refresh loopや複数箇所のrefresh処理は追加していない。

### Logout

Headerのlogoutは`POST /auth/logout`へ送る。serverはSupabaseのlocal scope logoutを試行し、provider障害時でもlocal auth cookieとactive Organization cookieを削除して`/login`へ遷移する。GET logoutは用意せず、SvelteKitのorigin checkとSameSite=Laxを利用する。logout後のprotected responseはno-storeであり、再requestではguardによりloginへ戻る。

## Organization membership境界

AuthenticationはSupabaseの検証済みUserを正本とする。現在は検証済みUserの`app_metadata.organization_memberships`、`system_admin`、`developer`を暫定adapterでAuth Contextへ変換する。利用者が編集可能な`user_metadata`、query、localStorage、form入力からroleを採用しない。active Organization cookieも検証済みmembershipに含まれる場合だけ有効にする。

membershipが0件のUserは`/app`へ入れず`/organization/select`の専用状態へ送る。一般memberは`/admin`へ入れず、productionのdev routeは404、productionでMock Authへfallbackしない。

ただし`app_metadata`はRails DBの代替正本ではない。Rails導入時は同じAuth Provider境界の内側で、検証済みSupabase user IDを使ってOrganizationMember・Role・SystemAdminをDBから再取得し、resource単位でも再認可する。

## Service-role key調査

- browser/server実装、`src`、public env参照、package script、GitHub Actionsを検索した結果、`SUPABASE_SERVICE_ROLE_KEY`の利用・import・`PUBLIC_`定義はない。
- frontend CIへservice-role secretを注入していない。
- local `.env`にはservice-role設定が1件存在するが、現在のSvelteKit frontendは参照しない。値そのものは出力していない。
- local `.env`以外のworkspace textに、現在設定されている値と一致するものは0件だった。
- production build後にclient outputとclient-visible sourceを機械走査し、識別子および環境から渡された実値の混入を検出する`npm run test:secrets`を追加した。
- workspaceに`.git` metadataが存在しないため、Git履歴上の過去露出は確認不能。未露出とは断定しない。

現在不要なlocal service-role設定はfrontendの環境設定から外し、backend専用secret storeへ分離するべきである。値が過去にcommit、CI、chat、log、artifactへ渡った可能性を排除できない場合はSupabase側でrotationし、旧keyを失効させる。frontend CI・Vite public envへはrotation後も注入しない。

## TestとSmoke

外部Supabase本番環境には接続せず、adapter・fixtureで次を検証する。

- 検証済みsessionからAuth Contextを構築しprotected routeを許可する。
- expired・invalid sessionをanonymousとして拒否する。
- refresh時のSDK cookie更新とno-store headerを反映する。
- callback code exchangeの成功・失敗を扱う。
- unsafe redirectを拒否する。
- logout provider障害時にもlocal auth cookie chunkとactive Organization cookieを削除する。
- development mockでmember `/app`、unaffiliated、SystemAdmin `/admin`、Developer dev UIを確認する。
- production smokeでanonymous redirect、login public、dev route 404を確認する。
- build artifactへservice-role keyが含まれないことを機械検査する。

最終結果:

| Gate | Result |
| --- | --- |
| `npm run check` | 0 errors / 0 warnings |
| `npm run lint` | 0 errors / 93 warnings |
| `npm run format:check` | 成功 |
| `npm test` | 3 files / 21 tests成功 |
| `npm run test:auth-smoke` | 成功 |
| `npm run build` | 成功 |
| `npm run test:secrets` | client露出0件 |
| `npm run test:smoke` | 成功 |
| `npm run quality` | 成功 |

## ProductionとDevelopmentの差

- Developmentだけ明示的なprivate envでMock Authを有効化できる。
- ProductionではMock Authへfallbackせず、dev routeは404となる。
- Supabase cookieとOrganization cookieはproductionだけSecureを強制する。
- 実Supabase未設定時もproductionのprotected routeはdenyし、架空sessionを生成しない。

## 未解決事項とsecurity残課題

- 実Supabase環境を使うbrowser E2Eは未実施。redirect URL、email confirmation、refresh rotationをstagingで確認する必要がある。
- password resetとOTP専用UI・routeは未実装。callback基盤だけを共用可能にした。
- RailsのOrganizationMember・Role・SystemAdmin正本、resource-level authorization、cross-organization IDOR testは未実装。
- Supabase SSR cookieはHttpOnlyではないため、CSP、XSS対策、依存脆弱性管理が重要。`npm install`時点のproduction dependency auditは0件だがdev込みでは8件（low 1 / moderate 2 / high 5）が報告されている。
- local `.env`の不要なservice-role設定の分離と、履歴を取得できる本来のrepositoryでのsecret scanning・rotation判断が必要。
- logout endpointはPOSTとorigin checkに依存する。将来cookie方針やcross-origin構成を変える場合はCSRF tokenを再評価する。
- Supabase Auth障害時はsecure defaultでprotected routeを拒否するため、可用性設計と監視を別途整備する。

## Rails移行方針

1. Supabaseの検証済みuser IDだけをRailsへ渡し、Railsでもtokenを検証する。
2. Rails DBからOrganizationMember、Role、SystemAdminを毎requestまたは安全な短期cacheで解決する。
3. SvelteKitのactive OrganizationとRails側membershipを二重検証する。
4. project・analysis・snapshot等をOrganization IDでscopeし、他Organization resourceを404にする。
5. Auth Providerのclaim変換をRails response変換へ差し替え、route policyとUI contractを維持する。

## 変更ファイル

- `package.json`
- `package-lock.json`
- `.env.example`
- `.github/workflows/quality.yml`
- `src/app.d.ts`
- `src/hooks.server.ts`
- `src/lib/auth/constants.ts`
- `src/lib/auth/redirect.ts`
- `src/lib/supabase/config.ts`
- `src/lib/supabaseClient.ts`
- `src/lib/server/supabase.ts`
- `src/lib/server/supabase-cookies.ts`
- `src/lib/server/auth/index.ts`
- `src/lib/server/auth/policy.ts`
- `src/lib/server/auth/session.ts`
- `src/lib/server/auth/supabase.ts`
- `src/routes/+layout.server.ts`
- `src/routes/+layout.svelte`
- `src/routes/app/+layout.svelte`
- `src/routes/auth/callback/+server.ts`
- `src/routes/auth/logout/+server.ts`
- `src/routes/login/+page.svelte`
- `src/routes/organization/select/+page.server.ts`
- `src/lib/components/ComponentsBase/PanoptesSiteHeader.svelte`
- `src/lib/components/ComponentsBase/SignUpForm.svelte`
- `tests/unit/auth-guard.test.ts`
- `tests/unit/supabase-ssr-auth.test.ts`
- `scripts/smoke-auth-dev.mjs`
- `scripts/smoke-routes.mjs`
- `scripts/check-client-secrets.mjs`
- `docs/audit/15-supabase-ssr-auth.md`
