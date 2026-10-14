# Phase PD-4 — PD-01 Route Intent Discovery

実施日: 2026-08-20  
対象: `/`、`/lp`、`/plan`、`/app`、`/app/analysis`  
Phase種別: Product Discovery（source変更なし）

## 1. 結論

PD-01全体のstatusは`NEEDS_DISCOVERY`を維持する。ただし、調査結果は次の2群に分かれる。

- Marketing route intent: `NEEDS_DISCOVERY`。3 routeの実装は同一で、canonical、campaign、pricing、公開済みURLの根拠はrepository内にない。
- App route intent: `READY_FOR_DECISION`。`/app`には検索開始面、`/app/analysis`には分析開始後の遷移先という内部証拠がある。ただし、pathnameからtabやsnapshotを復元する契約はない。

本Phaseではredirect、route削除・rename、metadata、navigation、analytics、App stateを変更していない。Architectureの「URLを維持し、Product Decisionまで意味を推測しない」という境界とも整合する。

## 2. Current routes

| Route | Public / Protected | Layout | Page / feature entry | Load・Auth・Organization |
| --- | --- | --- | --- | --- |
| `/` | Public | root layout | `MarketingLandingPage` | root loadのsession情報のみ。route固有loadなし |
| `/lp` | Public | root layout | `MarketingLandingPage` | `/`と同じ。route固有loadなし |
| `/plan` | Public | root layout | `MarketingLandingPage` | `/`と同じ。route固有loadなし |
| `/app` | Protected | root + App layout | `PanoptesShellEntryPage` | authenticationとactive Organization membershipが必要 |
| `/app/analysis` | Protected | root + App layout | `PanoptesShellEntryPage` | `/app`と同じ。専用child layout/loadなし |

root `+layout.server.ts`は全routeへ`authenticated`、`userEmail`、`activeOrganizationId`を渡す。Marketing 3 routeはpublic policyに明示され、App 2 routeはdefault protected policyによりauthenticationとactive Organization membershipを要求する。

## 3. Current behavior

### Marketing

`src/routes/+page.svelte`、`src/routes/lp/+page.svelte`、`src/routes/plan/+page.svelte`は同一内容で、同じ`MarketingLandingPage`へ`authenticated`を渡す。feature entryの描画順は次のとおりである。

1. `PanoptesSiteHeader`
2. `LandingHeroPrimarySection`
3. `LandingHeroSecondarySection`

3 route間にcontent、Header、Hero、props、page-specific data、query/campaign parameter処理の差はない。route名から`/lp`をcampaign用、`/plan`をpricing用と推測することはできるが、route名はProduct intentの証拠にはしない。

### App

`src/routes/app/+page.svelte`と`src/routes/app/analysis/+page.svelte`は同一内容で、同じ`activeOrganizationId`を`PanoptesShellEntryPage`へ渡す。entryは同じfallback snapshotとcontroller/store bootstrapを使い、Shellの初期tabはどちらも`strategy`である。

ただし総描画構成は完全同一ではない。App layoutがpathnameを確認し、`/app`だけに`PanoptesTopHero`と検索開始UIを描画する。`/app/analysis`ではTop Heroを描画せず、同じShell surfaceを表示する。このため正確な分類は`CURRENT_SHELL_RUNTIME_STATE_EQUIVALENT`であり、presentation compositionには差がある。

初期状態の比較:

| State | `/app` | `/app/analysis` | Route差 |
| --- | --- | --- | --- |
| active tab | `strategy` | `strategy` | なし |
| project | 同じbootstrap | 同じbootstrap | なし |
| selected snapshot | 同じfallback/runtime | 同じfallback/runtime | なし |
| query | pathnameから設定しない | pathnameから設定しない | なし |
| search state | routeから復元しない | routeから復元しない | なし |
| Top Hero / search entry | 表示 | 非表示 | あり（App layout） |

## 4. Navigation evidence

| Route | Repository内のentry source | 判定 |
| --- | --- | --- |
| `/` | Site Headerの「パノプテスについて」 | `KNOWN` |
| `/lp` | `href`、`goto`、`redirect`、Header/Footer/CTAの参照なし | `UNKNOWN`（内部導線なし） |
| `/plan` | `href`、`goto`、`redirect`、Header/Footer/CTAの参照なし | `UNKNOWN`（内部導線なし） |
| `/app` | Header「アプリTOP」、login/signup/callbackのdefault・fallback destination | `KNOWN` |
| `/app/analysis` | `PanoptesAnalysisStartSearchBar`の成功後`goto('/app/analysis')` | `KNOWN` |

`/app/analysis`は単なる到達不能aliasではない。一方、そのnavigation sourceだけでは独立したanalysis mode、initial tab、共有URL契約まで承認されたことにはならない。

## 5. SEO evidence

確認範囲は`<title>`、meta description、canonical、sitemap、robots、OpenGraph、Twitter card、structured data、link referenceである。

- target 5 routeにはroute固有`<title>`、description、canonical、OpenGraph、Twitter card、structured dataがない。
- root layoutはfaviconとglobal CSS、App layoutはfavicon/font resourceを所有するだけである。
- sitemap file/routeは確認できない。
- `static/robots.txt`は全crawlerに対して`Disallow:`が空であり、明示的なcrawl禁止はない。
- `/`、`/lp`、`/plan`をSEO上区別するmetadataはない。
- `/lp`、`/plan`へのrepository内link referenceはない。
- App routeにも`noindex`指定は確認できない。protectedであることとSEO policyが定義済みであることは同義ではない。

外部index状況、Search Console、backlink、既存canonical、公開済みURLはrepositoryから確認できないため`EXTERNAL_EVIDENCE_REQUIRED`である。

## 6. Campaign evidence

campaign constants、UTM固有処理、`/lp`専用content、landing固有tracking、ad campaign documentは確認できなかった。dummy analysis seedにある`campaign_prelaunch`は入力fixtureのsource labelであり、`/lp`のroute intentを示さない。

判定: `NO_REPOSITORY_EVIDENCE`。広告管理画面、配信済みURL、Marketing運用資料、CRM attributionの確認が必要である。「存在しない」とは断定しない。

## 7. Analytics evidence

GA/GTM、gtag、PostHog、Segment、Mixpanel、Amplitude、route mapping、pathname pageview、pageview naming、route別event schemaはapp source/package内に確認できなかった。domain documentの「analytics」は分析Product機能または将来instrumentationを指し、route tracking evidenceではない。

判定: `NO_REPOSITORY_EVIDENCE`。本Phaseでanalytics implementationは追加していない。

## 8. App deep-link evidence

| Requirement | Current evidence | Status |
| --- | --- | --- |
| URLによるroute到達 | `/app/analysis` routeが存在し、認証後に描画可能 | `KNOWN` |
| analysis開始後の遷移 | Search Bar成功後に`goto('/app/analysis')` | `KNOWN` |
| login後のreturn | safe return flowが`/app/analysis` pathnameを保持可能 | `KNOWN` |
| reload / bookmark | route単位ではSvelteKit/Auth flowで再到達可能 | `PARTIAL` |
| pathname → tab/state | mappingなし。両routeとも`strategy`開始 | `UNKNOWN` |
| project/snapshot/query復元 | route由来の復元なし | `UNKNOWN` |
| browser back/forward | generic route history以外のstate契約なし | `UNKNOWN` |
| share link | audience、安定性、権限、復元対象が未定義 | `UNKNOWN` |

## 9. Route Intent Matrix

| Route | Current Behavior | Internal Entry | Product Purpose | SEO | Analytics | Deep-link | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | public共通Marketing composition | Headerあり | public/product topを示唆するがcanonical未承認 | metadata差なし、canonical不明 | 実装証拠なし | public URLとして技術的に到達可能 | `PARTIAL` |
| `/lp` | `/`と同一 | なし | route名以外のcampaign/alias/legacy根拠なし | metadata差なし、外部公開不明 | 実装証拠なし | 外部利用不明 | `UNKNOWN` |
| `/plan` | `/`と同一 | なし | route名以外のpricing/plan根拠なし | metadata差なし、外部公開不明 | 実装証拠なし | 外部利用不明 | `UNKNOWN` |
| `/app` | protected Shell、Top Hero/searchあり | Header・Auth defaultあり | App home / new-analysis entryを支持 | private想定は推測。noindex未定義 | 実装証拠なし | route/reloadは可能、state契約なし | `PARTIAL` |
| `/app/analysis` | protected同一Shell、Top Heroなし | Search成功後の`goto`あり | post-analysis destinationを支持 | private想定は推測。noindex未定義 | 実装証拠なし | route/returnはあり、state復元なし | `PARTIAL` |

`LEGACY_SUSPECTED`や`FUTURE_INTENT_SUSPECTED`は採用しない。該当routeをlegacy/futureとする根拠がroute名以外にないためである。

## 10. Route lifecycle matrix

| Route group | Owner | Purpose / Audience | Entry | Lifecycle | SEO / Analytics / Deep-link | Removal condition |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | `OWNER_REQUIRED`（推奨 Product Owner/PM） | public Marketing候補 | Header | 未決定 | Marketing/SEO/Analytics確認要 | canonical決定と外部URL監査後のみ |
| `/lp` | `OWNER_REQUIRED`（Product + Marketing） | campaign/alias/legacyいずれも未確認 | 内部導線なし | 未決定 | 外部campaign証拠要 | 広告・bookmark・backlink確認と承認後のみ |
| `/plan` | `OWNER_REQUIRED`（Product + Marketing） | pricing/future/aliasいずれも未確認 | 内部導線なし | 未決定 | plan content/SEO証拠要 | 公開URL確認と承認後のみ |
| `/app` | `OWNER_REQUIRED`（Product Owner/PM） | authenticated App entry候補 | Header/Auth default | closed beta前に確定 | analytics/deep-link要件未定 | App IA決定後のみ |
| `/app/analysis` | `OWNER_REQUIRED`（Product Owner/PM） | post-analysis/deep-link候補 | Search成功後 | closed beta前に確定 | state/share contract未定 | deep-link利用と移行方針承認後のみ |

## 11. Options

### Marketing

- **M-A:** `/`をcanonicalとし、`/lp`・`/plan`を将来redirect候補にする。
- **M-B:** 3 routeを同一compositionの別public entryとして維持し、用途と計測名を定義する。
- **M-C:** 将来Product purposeごとにcontent、metadata、navigationを差別化する。
- **M-D:** 外部証拠不足のため現状維持し、調査完了まで決定しない。

現時点の扱いはM-Dであり、recommendationではなくDiscovery上の安全境界である。

### App

- **A-A:** `/app`をcanonical App home/new-analysis entry、`/app/analysis`をanalysis destination/deep-linkとして正式分離する。
- **A-B:** 2 routeを同一semantic aliasとして維持する。
- **A-C:** `/app/analysis`を将来廃止候補にする。
- **A-D:** IA決定まで現状維持する。

## 12. Decision proposal — App sub-item only

| Field | Proposal |
| --- | --- |
| Question | `/app`と`/app/analysis`を異なる正式URL roleとして定義するか |
| Options | A-A formal separation / A-B semantic alias / A-C future deprecation / A-D hold |
| Recommendation | **A-A**。ただし今回はURL roleだけを決め、initial tab/state contractは別承認にする |
| Evidence | `/app`だけのTop Hero/search、Header/Authの`/app` entry、Search成功後の`goto('/app/analysis')` |
| Tradeoffs | URL意味が明確になる一方、現在はShell初期stateが同一であり、将来distinct state・analytics・metadata契約が必要になる |
| Migration impact | 決定時点は文書化のみ。behavior変更は別implementation phaseでreview/testを伴う |
| Required approval | Product Owner/PM。Engineering consulted。Analytics/Support/Securityはdeep-link/share要件に応じてconsulted |

Codexは本Proposalを`DECIDED`にしない。App sub-itemだけが`READY_FOR_DECISION`であり、承認・Decision Date・selected optionは空欄のままである。

## 13. Evidence gaps converted to Product Owner questions

1. 公開Marketingのcanonical URLは`/`か。
2. `/lp`はgeneric alias、campaign landing、将来差別化pageのどれか。具体的なcampaign ownerとcampaign IDはあるか。
3. `/plan`はPricing/Plan pageとしてreleaseする予定があるか。content ownerと時期はいつか。
4. `/lp`・`/plan`をindex対象にするか。canonical、sitemap、robots方針は何か。
5. 広告、メール、SNS、bookmark、backlink、配布資料で既に公開された3 route URLはあるか。
6. Marketing各routeのpageview名、conversion event、UTM attribution、retention期間は何か。
7. `/app`をcanonical App home/new-analysis entryと定義するか。
8. `/app/analysis`を安定したpost-analysis URLおよびbookmark/share対象とするか。
9. `/app/analysis` reload時にanalysis tab、project、snapshot、queryのどこまで復元すべきか。
10. browser back/forwardで検索開始前後のどの状態へ戻すべきか。
11. share linkのaudience、Organization境界、有効期限、権限エラーUXは何か。
12. 各routeのaccountable owner、review date、廃止条件は何か。

## 14. Decision readiness and timing

| Sub-item | Readiness | Timing | Reason |
| --- | --- | --- | --- |
| Marketing canonical/campaign/plan | `NEEDS_DISCOVERY` | `BEFORE_PUBLIC_INDEXING`、campaign launch前 | 外部公開・SEO・campaign証拠がrepository外 |
| App URL roles | `READY_FOR_DECISION` | `BEFORE_CLOSED_BETA` | entryと遷移の内部証拠があり、選択肢比較が可能 |
| App state restoration/share | `NEEDS_DISCOVERY` | `BEFORE_CLOSED_BETA` | pathname→state、share/security契約がない |

PD-01全体は最も未成熟な必須sub-itemに合わせて`NEEDS_DISCOVERY`を維持する。

## 15. Standardization impact

| Area | Impact | Boundary |
| --- | --- | --- |
| Route Entry taxonomy | `NON_BLOCKING` | entry component/shared compositionは既に整理済み |
| Page taxonomy | `NON_BLOCKING` | thin route entry方針は現状維持可能 |
| Route semantic naming | `PARTIAL` | `/lp`、`/plan`、`/app/analysis`の意味確定までsemantic ruleを保留 |
| Navigation rules | `PARTIAL` | canonical/alias/deep-link決定が対象routeの規則をblock |
| Redirect/metadata lifecycle | `BLOCKING`（対象routeのみ） | Product/SEO承認なしに実装不可 |
| Directory/Design Token/Tailwind/Responsive | `NON_BLOCKING` | PD-01と独立 |

Frontend Standardization全体は`PARTIAL`であり、全面blockではない。

## 16. Architecture consistency

`frontend-route-ownership.md`、`frontend-structure-policy.md`、`frontend-active-graph.md`の事実記述と矛盾は確認できなかった。route URL維持、composition共有、Product Decisionまでredirectを行わないという既存Architecture Decisionを変更していない。そのためArchitecture文書の修正は不要と判断した。

## 17. Recommended next action

1. Product Owner/PM、Marketing/SEO/Analytics、Engineeringで上記12問をreviewする。
2. 先にApp sub-itemのA-A〜A-Dを選び、OwnerとDecision Dateを記録する。
3. MarketingはSearch Console、広告/CRM、公開済みURL、backlink、campaign ownerを収集してからM-A〜M-Dを比較する。
4. 承認後にだけ、redirect/metadata/navigation/analytics/state変更を独立implementation phaseとして計画する。

代替follow-upは、PD-02 Score/Common Axes data dictionary discovery、またはPD-04 Rails Snapshot workflow contract discoveryである。

## 18. Quality results

- `npm run check`: exit 0、Svelte 0 errors / 0 warnings
- `npm run lint`: exit 0、ESLint 0 errors / 38 warnings
- `npm run format:check`: exit 0
- `npm run check:openapi`: exit 0、18 / 18 operations
- 指示書の`check:inventory` scriptはpackageに存在しないため、現行正本`npm run check:frontend-inventory`を実行: exit 0、unresolved import 0、cycle 0、inventory stale 0
- `npm run test`: exit 0、22 files / 257 tests PASS
- `npm run build`: exit 0
- `npm run test:secrets`: exit 0、63 build files PASS
- `npm run test:smoke`: exit 0、production/public・protected route期待値PASS
- `npm run quality`: exit 0（auth smokeを含む全pipeline PASS）

source、route、Rails、BFF、OpenAPI schemaは変更していない。初回のsandbox内Vitest/smokeはfilesystem制限によりVite configをloadできなかったため、同じcommandを承認済みのsandbox外実行で再確認しPASSした。これはapplication failureではない。

## 19. References

- [Product Decision Register](../product/product-decision-register.md)
- [PD-1 Product Decision Backlog Review](./59-product-decision-backlog-review.md)
- [B-3Q Route Ownership Refactor](./54-phase-b3q-route-ownership-refactor.md)
- [B-3R Compatibility Consolidation](./55-compatibility-wrapper-route-entry-analysis.md)
- [Frontend Route Ownership](../architecture/frontend-route-ownership.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Frontend Active Graph](../architecture/frontend-active-graph.md)
- [Frontend Inventory Summary](../inventory/frontend-inventory-summary.md)
- [Development Log](../DEVELOPMENT_LOG.md)
