# Phase A-3 Auth・Role・Organization境界

実施日: 2026-08-06

## 結論

SvelteKitのserver hookで、Authentication、Authorization、Organization scopeを別々に評価する暫定境界を導入した。未認証または判断材料が不足する場合は許可しないsecure defaultである。

これは完成版の認証基盤ではない。SvelteKitは入口の拒否、SSR context、将来のRails連携契約を担当し、最終的な業務認可とデータscopeはRailsでも必ず再検証する。

## 調査で確認した既存実装

- `src/lib/supabaseClient.ts`にbrowser向けSupabase clientがある。
- `SignUpForm.svelte`は`signUp`、`signInWithPassword`、signup email再送をbrowserから直接実行する。
- Supabase browser clientのsessionをSvelteKit serverへ渡すcookie bridgeはなかった。
- callback route、server-side auth helper、`hooks.server.ts`、`event.locals` auth contextはなかった。
- password reset専用route、server OTP callback、logout処理は確認できなかった。
- Organization、membership、roleの実行時正本はなかった。`company`は主に表示データ、既存`session` storeはUI状態であり認可の正本ではない。
- `/admin`、`/app`、dev routeはすべてserver guardなしで到達可能だった。

browserのlocalStorageだけではSSR requestを認証できないため、既存browser sessionをserver認証済みとは扱っていない。

## 正式用語とAuth Context

- `User`: 認証された人物
- `Session`: serverで検証可能な認証状態
- `Organization`: 契約、データ、認可の境界
- `OrganizationMember`: UserとOrganizationの所属関係
- `Role`: Organization内の権限区分
- `SystemAdmin`: Panoptes運営側の管理者。Organization roleとは分離する

Organization roleは次の固定値を使用する。

- `organization_owner`
- `organization_admin`
- `analyst`
- `project_manager`
- `viewer`
- `guest`

`company`、`tenant`、`workspace`はOrganizationの同義語として認可に使用しない。既存画面上の名称変更は今回行っていない。

requestごとに`event.locals.auth`へ次を設定する。

```ts
type RequestAuthContext = {
  user: AuthenticatedUser | null;
  memberships: OrganizationMembership[];
  activeOrganizationId: string | null;
  isSystemAdmin: boolean;
  isDeveloper: boolean;
  provider: 'anonymous' | 'mock' | 'supabase';
};
```

`isDeveloper`はdev route用のsystem-level capabilityであり、Organization roleではない。

## Auth Provider Adapter

`AuthProviderAdapter`を境界として、`SupabaseAuthAdapter`と`MockAuthAdapter`を実装した。

### Supabase adapter

- `Authorization: Bearer`または`panoptes_access_token` cookieのaccess tokenをSupabase `getUser(token)`でserver検証する。
- token未設定、Supabase未設定、期限切れ、検証失敗はanonymousとして扱う。
- server clientはrequest間のsession共有を避けるため、session永続化、自動refresh、URL session検出を無効化している。
- 検証後の`app_metadata`だけから暫定的に`system_admin`、`developer`、`organization_memberships`を読む。user metadataやquery parameterは認可に使わない。
- `panoptes_organization_id` cookieは、検証済みmembershipに含まれる場合だけactive Organizationとして採用する。

期待する暫定app metadata:

```json
{
  "system_admin": false,
  "developer": false,
  "organization_memberships": [
    { "organization_id": "org-id", "role": "analyst" }
  ]
}
```

現在のbrowser loginは`panoptes_access_token` cookieを作らないため、Supabase SSR連携が完了するまではbrowserでログインしただけではprotected routeへ入れない。localStorageからの暗黙fallbackは行わない。

### Mock adapter

次の両方を満たす場合だけ有効になる。

1. SvelteKitのdevelopment buildである
2. private環境変数`PANOPTES_ENABLE_MOCK_AUTH=true`が明示され、`PANOPTES_MOCK_AUTH_SCENARIO`が有効なfixture名である

fixtureは`anonymous`、`member`、`unaffiliated`、`system-admin`、`developer`。productionでは環境変数が設定されてもmockへfallbackしない。query parameter、browser localStorage、公開環境変数からroleを昇格できない。

## Route Access Matrix

| Route | Public | Auth | Org Member | Required Role | Dev Only | Production |
| --- | ---: | ---: | ---: | --- | ---: | --- |
| `/` | Yes | No | No | - | No | Enabled |
| `/lp` | Yes | No | No | - | No | Enabled |
| `/plan` | Yes | No | No | - | No | Enabled |
| `/login` | Yes | No | No | - | No | Enabled |
| `/organization/select` | No | Yes | No | Authenticated user | No | Enabled |
| `/app` | No | Yes | Yes | Any member | No | Enabled |
| `/app/analysis` | No | Yes | Yes | Any member | No | Enabled |
| `/app/login/settings` | No | Yes | Yes | Any member | No | Enabled |
| `/admin` | No | Yes | No | SystemAdmin | No | Enabled |
| `/app/dev/ui` | No | Yes | No | SystemAdmin or Developer | Yes | 404 |
| `/dev/analysis-preview` | No | Yes | No | SystemAdmin or Developer | Yes | 404 |

将来追加されるrouteは、明示的にpublic登録されない限りAuth＋active Organization membershipが必要になる。単なるナビゲーション非表示ではなく、server hookがpage render前に拒否する。

### 応答方針

- browser page未認証: `/login?returnTo=...`へ303
- role不足: 403
- membershipなしまたはactive Organization不一致: 403
- membershipはあるがactive Organization未選択: `/organization/select`へ303
- productionのdev route: 404
- API/BFF未認証: JSON 401
- API/BFF role・Organization不足: JSON 403

route-level membership不足は利用者へ状態を説明できる403とした。将来のRails resource endpointで別Organizationのresource IDが指定された場合は、存在漏えいを避けるため404を返す方針を推奨する。

## Organization境界

- active Organization IDをclient入力だけで信用しない。
- Organization選択actionは、`event.locals.auth.memberships`との一致をserverで確認してからHttpOnly、SameSite=Lax cookieへ保存する。
- active Organizationがmembershipに含まれない場合は403。
- URL、request body、storeのOrganization IDは認可の正本にしない。
- SystemAdminのOrganization非所属操作は自動許可せず、明示された運用support機能として別途設計する。
- Rails APIへは検証済みUserとOrganization contextをserver側から渡し、Railsでも再検証する。
- AnalysisJobからPython WorkerへもOrganization IDを引き継ぐ必要がある。

## 暫定Role Matrix

| 操作 | Owner | Org Admin | Analyst | PM | Viewer | Guest | SystemAdmin |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Organization設定 | Yes | Limited | No | No | No | No | Support only |
| メンバー管理 | Yes | Yes | No | No | No | No | Support only |
| Project作成 | Yes | Yes | Yes | Yes | No | No | Support only |
| 分析実行 | Yes | Yes | Yes | Yes | No | No | Support only |
| 分析閲覧 | Yes | Yes | Yes | Yes | Yes | Limited | Support only |
| 戦略編集 | Yes | Yes | Yes | Yes | No | No | Support only |
| 課金管理 | Yes | Limited | No | No | No | No | No |
| Panoptes管理画面 | No | No | No | No | No | No | Yes |

今回コードへ強制したのは、Organization membership、active Organization整合性、SystemAdmin、dev capabilityのroute境界までである。各業務操作の細粒度role enforcementはRails API実装時に確定する。

## `/admin`防御

`/admin`はserver hookで最優先に判定する。

- 未認証はloginへredirect
- 一般Organization memberは403
- `isSystemAdmin === true`だけ許可
- mock SystemAdminはdevelopment＋明示fixture限定
- productionで判断材料がなければdeny

Admin UIは既存dummy表示のままで、backend管理操作は実装していない。将来のAdmin APIもRailsでSystemAdminを再検証する。

## Dev・mockのproduction隔離

- `/app/dev/ui`と`/dev/analysis-preview`はproductionで404。
- dev route判定はnavigation表示ではなくserver hookで行う。
- `PUBLIC_USE_MOCK_API=true`であっても、Panoptes mock APIはSvelteKit development時だけ有効になるよう変更した。
- production buildのAuthはMock adapterへfallbackしない。
- production smokeで両dev routeの404を検証する。

## Test

既存5件にAuth境界10件を追加し、合計15 testsが成功した。追加した検証:

1. anonymousの`/app`拒否
2. anonymousの`/admin`拒否
3. Organization memberの`/app`許可
4. active Organization未選択時のselection redirect
5. membershipなしの拒否
6. 別Organization IDの拒否
7. 一般memberの`/admin`拒否とSystemAdminの許可
8. production dev routeの404
9. development Developer fixtureのdev route許可
10. production mock fallback禁止とopen redirect防止

外部Supabase、本番DB、Rails APIには接続していない。

## 品質ゲート結果

| Gate | Result |
| --- | --- |
| `npm run check` | 0 errors / 0 warnings |
| `npm run lint` | 0 errors / 93 warnings |
| `npm run format:check` | 成功 |
| `npm run test` | 2 files / 15 tests成功 |
| `npm run build` | 成功 |
| production smoke `/` | 200 |
| production smoke `/app`, `/app/analysis`, `/admin` | 303 to `/login` |
| production smoke dev routes | 404 |
| `npm run quality` | 終了コード0 |

Phase A-3変更による新規lint warningはなく、総数は93件のままである。

## Rails側で必要な二重認可

1. access tokenまたはSvelteKitからのservice credentialを検証し、Userを確定する。
2. requestごとにOrganization membershipとactive OrganizationをDBから再検証する。
3. URL/bodyのOrganization IDを信用せず、queryをOrganization IDでscopeする。
4. project、analysis job、snapshot、strategy、billingの親Organization一致を検証する。
5. actionごとにRole Matrixを強制する。
6. SystemAdminとOrganization roleを別テーブル・claim・policyとして扱う。
7. cross-organization resourceは404、明示的な権限不足は403とする基準を統一する。
8. audit logへactor、Organization、resource、action、resultを記録する。
9. Python WorkerへOrganization IDを渡し、job結果保存時にも一致を再検証する。

SvelteKit guardだけで業務データを保護したとは判断しない。

## 未実装・security残課題

- Supabase browser sessionとHttpOnly server cookieの正式な同期
- login成功後のserver session確立、returnTo遷移、logout、token refresh
- email callback、password reset、OTP callback
- Organization membershipとSystemAdminのDB正本
- Rails APIとresource-level authorization
- CSRF、session rotation、失効、replay対策の正式設計
- Admin backend機能と監査log
- Organization作成・招待・切替の完成UI
- dev fixtureの運用ルールと秘密情報管理
- component/E2E testによる実browser session検証

## 次の推奨作業

1. Supabase SSR cookie adapterを導入し、login/callback/logout/refreshをserver sessionへ接続する。
2. Rails側でOrganizationMember、Role、SystemAdminの正本とpolicyを実装する。
3. SvelteKit BFFからRailsへ検証済みAuth/Organization contextを渡す契約を定義する。
4. cross-organization IDOR、期限切れsession、role変更直後、招待中memberのintegration testを追加する。
5. Admin APIとaudit logを実装した後に、`/admin`を本番利用可能と判断する。

## 変更ファイル

- `src/app.d.ts`
- `src/hooks.server.ts`
- `src/lib/server/auth/types.ts`
- `src/lib/server/auth/provider.ts`
- `src/lib/server/auth/mock.ts`
- `src/lib/server/auth/supabase.ts`
- `src/lib/server/auth/policy.ts`
- `src/lib/server/auth/index.ts`
- `src/routes/+layout.svelte`
- `src/routes/login/+page.svelte`
- `src/routes/organization/select/+page.server.ts`
- `src/routes/organization/select/+page.svelte`
- `src/lib/panoptes/api/client.ts`
- `scripts/smoke-routes.mjs`
- `tests/unit/auth-guard.test.ts`
- `docs/audit/14-auth-organization-boundary.md`
