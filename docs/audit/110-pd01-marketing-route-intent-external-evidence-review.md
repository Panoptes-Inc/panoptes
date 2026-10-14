# Phase PD-52 — PD-01 Marketing Route Intent External Evidence Review

実施日: 2026-09-07  
Phase種別: Research / Documentation-only  
Decision status: `READY_FOR_DECISION_REVIEW / NOT_APPROVED`

## 1. Conclusion

PD-01 Marketing Route Intentは、Product Ownerが候補Contractを比較できる`READY_FOR_DECISION_REVIEW`へ進める。推奨候補は、`/`をPublic Product Marketing Home、`/app`を既決定のAuthenticated App Home / Analysis Entryとして分離し、同じMarketing resourceを表すURLは1つのcanonical identityへ集約するモデルである。

ただし本PhaseはDecisionでも実装でもない。`/lp`・`/plan`のSearch Console、広告、CRM、backlink、bookmark、配布資料での利用実績は確認できていない。したがって両routeの削除・redirectは承認後も外部URL footprint確認を実装前条件とする。PD-01 Parentは、Marketing candidateはreview可能だがPD-01B App Deep-link / State Restoration Contractが未調査のため`PARTIALLY_READY`である。

## 2. Evidence separation

### A. Repository Evidence

- `/`、`/lp`、`/plan`の3つのroute entryはbyte-identicalで、同じ`MarketingLandingPage`を同じpropsで描画する。
- `MarketingLandingPage`はHeader、Primary Hero、Secondary Heroを所有する。root layoutはglobal CSS、favicon、childrenだけを所有する。
- 3 routeにroute固有title、description、canonical、Open Graph、analytics、campaign parameter処理はない。`/lp`・`/plan`への内部導線もない。
- `static/robots.txt`は全crawlerへ空の`Disallow`を返す。sitemapは既存PD-4監査で未確認、App routeに`noindex`はない。
- `/login`はpublic auth entryでtitleを持ち、signup/login両modeを持つ`SignUpForm`のlogin modeを描画する。独立した`/signup` routeはない。
- `/app`・`/app/analysis`は認証とactive Organization membershipが必要で、App layoutがHeaderを所有する。
- Marketing aliasはredirect/rewriteではなく、独立routeから同一contentをrenderする`DUPLICATED_RENDERING`である。

### B. Existing Panoptes Product Decisions

- PD-01Aで`/app`はApp Home / Analysis Entry、`/app/analysis`はAnalysis-focused Workspace / Result Entryと決定済みである。
- distinct route semanticsとshared runtimeは両立する。Marketing decisionからApp runtimeの分割を推測しない。
- B-3Q〜B-3SでMarketing Page-owned Header、App Layout-owned Header、thin route entry、feature-centric composition、意味のないcompatibility aliasを増やさない方針が確立済みである。
- PD-01Bのstate restoration、bookmark、share、browser history契約は未決定である。

### C. External Evidence

- Googleは重複・類似contentから代表URLを選ぶ。redirectと`rel="canonical"`はstrong signal、sitemap inclusionはweak signalで、canonical preferenceは絶対命令ではない。
- canonical page自身にもself-referencing canonicalを置き、internal linkとsitemapをcanonical URLへ揃えることが推奨される。
- 恒久的な移転にはserver-side 301/308、将来戻す可能性がある場合はtemporary redirectを使う。
- `noindex`はcrawlerがresponseを取得できる場合にのみ有効で、private/confidential contentの保護にはpassword/authenticationが必要である。robots.txtはcanonicalizationにも機密保護にも使わない。
- Google Analyticsのmanual campaign taggingでは`utm_source`、`utm_medium`、`utm_campaign`が中核で、`utm_id`、`utm_source_platform`、`utm_content`、`utm_term`等を用途に応じて使う。値はcase-sensitiveで、一貫した命名が必要である。
- Slack、Notion、HubSpotの公式siteを2026-09-07に観察すると、Marketing rootと、pricing/features/use-case/resource等のpublic category、およびlogin/get-started entryが分かれている。これは有力例の共通patternであり、Panoptesの正解を証明する標準ではない。

## 3. Existing route inventory

| Route | Current intent/evidence | Access | Indexable candidate | Ownership | Alias / redirect |
| --- | --- | --- | --- | --- | --- |
| `/` | common Marketing composition。Header内のpublic entryあり | public | `YES_CANDIDATE` | root layout + Page-owned `MarketingLandingPage` | duplicated with `/lp`・`/plan`; no redirect |
| `/lp` | route名以外のcampaign intentなし | public | `UNKNOWN` | same | duplicated render; no internal entry |
| `/plan` | route名以外のpricing intentなし | public | `UNKNOWN` | same | duplicated render; no internal entry |
| `/login` | login、signup UIへのauth entry | public | `PUBLIC_NON_INDEXABLE_CANDIDATE` | route Page | auth callback/logout destination |
| `/organization/select` | Organization selection policy entry | authenticated | `NO` | route Page/server | auth flow redirect target |
| `/app` | App Home / Analysis Entry（PD-01A） | authenticated + Organization | `NO` | App layout + App Page | no alias decision |
| `/app/analysis` | Analysis-focused Workspace / Result Entry（PD-01A） | authenticated + Organization | `NO` | same | distinct semantics/shared runtime |

`/admin`もauthenticated privateであるが、Marketing IAの対象ではない。Auth policyとSEO policyは別層であり、現行の認証guardだけからmetadata実装済みとは扱わない。

## 4. Root `/` options

| Option | User expectation | SEO / discoverability | Campaign use | Authenticated UX | Complexity | Assessment |
| --- | --- | --- | --- | --- | --- | --- |
| A: Primary Corporate / Product Marketing Home | root URLの一般的期待と一致 | 1つのstable public identityを作りやすい | root + UTMを利用可能 | CTAだけauth-awareにできる | low | **Recommended candidate** |
| B: Product Entry / App redirect | returning userには短い | public explanationを失い、rootのindexable contentをなくす | acquisition landingとして弱い | direct | low | current public Landingと不整合 |
| C: Marketing + Auth State adaptive entry | visitor別CTAは自然 | main content/canonicalが状態で変わると説明と検証が複雑 | usable | state coupling risk | medium/high | root semanticsはAに固定し、CTA adaptationだけ許容候補 |
| D: separate marketing domain/subdomain | boundaryは明確 |移転・domain authority・運用が増える | usable | clear | high | Panoptes固有evidenceなし |

Option Aをroot identityとし、認証状態はCTA destination/labelの補助に限定する。Marketing pageがauthenticated Product StateのSource of Truthを持つモデルは採用しない。

## 5. Marketing / App boundary

| Boundary | Marketing/Public | Authenticated App |
| --- | --- | --- |
| Purpose | product explanation、use cases、pricing、trust、company/product info、lead generation、auth entry | analysis、workspace、results、Organization-scoped operations、将来settings |
| State | campaign/referralとlocal presentation state | authenticated user、Organization、job/snapshot/product state |
| SEO | approved pagesをexplicit metadata/canonical付きでindexable | authenticated contentはindex対象外候補 |
| Analytics | acquisition、campaign、CTA、signup conversion | analysis execution、feature use、retention、business usage |
| Source of truth | content/route intent | Rails/BFF/Auth/Organization domain state |

Marketing CTA intent candidateは、未認証の「ログイン」は`/login`、新規登録はdedicated public signup entryが承認された時だけそのURL、authenticated primary CTAは`/app`である。現行に`/signup` routeはないためURLを発明しない。Dedicated onboardingの必要性とexact UXは別Decisionとする。

## 6. Public URL hierarchy

v1は「stable primary pagesはflat、増加するcollectionはsectional、campaign-specific routeは例外」とする候補が最も単純である。

```text
/
├─ /features       # approved when distinct content exists
├─ /pricing        # approved when plan/pricing intent exists
├─ /about
├─ /contact
├─ /use-cases/*    # scalable collection
├─ /resources/*    # docs/reports/case studies/blog family
└─ /login          # auth public entry, not product content

/app               # authenticated product boundary
└─ /app/analysis
```

これはroute作成指示ではない。meaningful distinct resourceだけがstable URLを持ち、campaign routeはowner、purpose、expiry、canonical、measurement、redirect targetが揃う場合に限る。

## 7. Canonical / alias / redirect findings

- 同一Marketing resourceには1つのcanonical public URLを与える。
- canonical pageはself-referenceし、duplicate variantは同じcanonicalへ向ける。internal linksとsitemapもcanonicalだけを参照する。
- `/lp`・`/plan`が独自content/intentを持たないと承認された場合、保持したまま同じHTMLを返すより、外部利用監査後のpermanent server-side redirectが候補である。
- `/plan`が将来pricing resourceになるなら、同一contentのままindexableにせず、distinct content/metadata/ownerが揃うまでnon-canonical lifecycleを定める。
- temporary campaign pageを残す間のtemporary redirect、rewrite、duplicated renderingはそれぞれ意味が異なる。Svelte component wrapperはURL canonicalization手段ではない。
- public URL変更はbacklink、bookmark、campaign creative、email、QR、Search indexを壊し得るため、App内部routeよりmigration/redirectの安定性要件が高い。

## 8. Authenticated route SEO

`/app`・`/app/analysis`・Organization selection・Adminは`AUTHENTICATED_PRIVATE`候補で、検索流入用contentではない。auth/authorizationが機密保護の正本であり、`noindex`はdefense-in-depthのindexing policy候補にすぎない。robots.txtでblockするとcrawlerが`noindex`を読めない場合があるため、robotsだけへ依存しない。

Public `/login`はauthentication入口だがMarketing contentではないため`AUTH_PUBLIC_ENTRY / PUBLIC_NON_INDEXABLE`候補である。canonicalの有無より先にnoindex policyを明示する。SSR/redirect/error responseのどの段階でもprivate contentを未認証へ返さないことはSecurity scopeとして継続する。

## 9. Campaign URL and attribution comparison

| Model | SEO | Analytics | Operations / expiry | Recommendation |
| --- | --- | --- | --- | --- |
| A: canonical product page + UTM | canonical identityを増やさない | standard attributionに適合 | lowest | default candidate |
| B: dedicated `/campaign/*` | distinct valueがなければduplicate risk | route + UTMで比較可 | owner/expiry/redirect必須 | durable distinct campaign contentのみ |
| C: temporary landing route | index policy/canonicalを明示要 | experimentには有効 | cleanup debtが高い | time-boxed exception |
| D: external marketing platform | cross-domain canonical/consent/data連携要 | vendor依存 | vendor governance必要 | capability gapがある場合だけ |

UTM等のquery parameterはcampaign attributionであり、通常はcontent identityではない。canonicalはclean destination URLを指す候補とする。ただしparameterを除去するredirectやclient navigationを行う前にattributionを確実に取得する必要がある。Google Analyticsを採用するDecisionではなく、`source / medium / campaign`のcase-sensitive naming registry、owner、retention、consent/privacy reviewが必要というLogical policyである。

## 10. Analytics boundary

`Marketing Attribution != Authenticated Product Analytics`をContract候補とする。前者はacquisition、campaign、landing、CTA、signup funnelを、後者はanalysis execution、feature use、retention、Organization-scoped business usageを扱う。共通のanonymous-to-authenticated journey分析が必要でも、identity stitching、PII、consent、retentionは別Privacy/Analytics Decisionなしに実装しない。

## 11. B2B SaaS IA pattern evidence

| Official product site | Observed public categories | Product/auth separation | Relevance limit |
| --- | --- | --- | --- |
| Slack | root product explanation、features、pricing、resources | Get started / sign-in entryをpublic contentと区別 | Panoptes URL名を決めない |
| Notion | Product、use cases、Resources、Pricing、Log in、Get free | Marketing navigationからauth/product entryへ分離 | large mature IAをそのまま採用しない |
| HubSpot | Products、Solutions/use cases、Pricing、Resources、Log in/Get started | `app.hubspot.com` entryをmarketing siteから分離 | multi-product構造はPanoptes v1より複雑 |

3例に共通するのは、rootをpublic product explanationへ使い、meaningful categoryをstable navigationへ置き、login/get-startedをProduct entryとして分ける構造である。これはpattern evidenceであり、ranking効果やPanoptes固有のcustomer expectationを証明しない。

## 12. Public / private classification candidate

| Class | Meaning | Panoptes candidate |
| --- | --- | --- |
| `PUBLIC_INDEXABLE` | standalone public value、explicit metadata/canonical、internal discovery | `/`、将来承認されたfeatures/pricing/use-case/resource |
| `PUBLIC_NON_INDEXABLE` | public accessは必要だがsearch landingではない | temporary campaign、callback/error utility |
| `AUTH_PUBLIC_ENTRY` | auth開始用public UI。indexabilityは別指定 | `/login`、将来承認された`/signup` |
| `AUTHENTICATED_PRIVATE` | auth/authorization必須、search対象外 | `/app`、`/app/analysis`、`/organization/select`、`/admin` |

Exact enumはDecision Reviewで確定する。

## 13. Metadata and canonical ownership candidate

| Concern | Logical owner |
| --- | --- |
| site name、default description/social fallback、origin normalization | Marketing SEO config/utility invoked by root/Marketing boundary |
| title、description、canonical identity、social image for a resource | route Page/route metadata contract |
| canonical URL construction/validation | shared Marketing SEO utility; route supplies approved identity |
| private/noindex default | App layout/server response policy |
| login/callback utility policy | Auth route family |

Route configだけではcontent intentを表しにくく、各Pageだけにabsolute URL生成を重複させると不整合が起きる。したがって「route declares identity + shared utility validates/renders」が候補である。Exact SvelteKit implementationはDEFERする。

## 14. Recommended Marketing Route Model — candidate only

1. `/` = `Public Product Marketing Home`、Panoptesのprimary public canonical candidate。
2. meaningful distinct contentだけをstable public routeとして追加する。v1 primary pageはflat、collectionsはsectional。
3. `/login` = public auth entry、`/app` = authenticated App Home / Analysis Entry。
4. `/app/analysis` = PD-01AのAnalysis-focused Workspace / Result Entryを維持する。
5. `/lp`・`/plan`は現状`DUPLICATED_RENDERING / UNKNOWN_PRODUCT_INTENT`。Decisionとexternal footprint auditなしに削除・redirectしない。

## 15. Recommended Canonical / SEO Policy — candidate only

- one canonical public URL per Marketing resource。
- canonical pageはself-referencing canonical、internal linksとsitemapはcanonicalへ統一。
- meaningless duplicate aliasは利用実績を監査してpermanent redirect。
- campaign query parametersは新しいcanonical identityを作らない。
- authenticated/private routesはauthを正本とし、explicit non-indexing policyを重ねる。
- public Marketing metadataをroute intentごとに明示し、JavaScriptだけでoriginal HTMLと異なるcanonicalへ変更しない。
- breaking public URL changeにはdestination equivalence、permanent redirect、monitoring、retention期間を定める。

## 16. Recommended Campaign / Analytics Policy — candidate only

- canonical page + standardized attribution parametersをdefaultとする。
- dedicated campaign routeはdistinct content、owner、measurement、expiry、canonical/redirect planがある場合だけ作る。
- attribution metadataとcontent identityを分離し、parameter cleanup前にattributionをcaptureする。
- Marketing acquisitionとProduct usage analyticsを別event taxonomy/data purposeとして扱う。
- vendor、cookie consent、PII、identity stitching、retention、CRM連携は別DecisionへDEFERする。

## 17. PD-01 Contract Candidate

| Contract field | Candidate |
| --- | --- |
| Marketing Route Intent | Public explanation、trust、lead/auth entry。Product runtime stateを所有しない |
| Root Route Intent | `/` = Public Product Marketing Home |
| Public / Private Boundary | Marketing/Auth entryとauthenticated Organization-scoped Appを分類・分離 |
| Canonical URL Principle | one resource / one canonical public identity |
| Campaign URL Principle | canonical destination + attribution parameter default。dedicated routeはmanaged exception |
| Analytics Boundary | acquisition/conversionとauthenticated product usageを目的・taxonomyで分離 |
| App Route Boundary | PD-01Aをそのまま参照し、再定義しない |

Statusは`PROPOSED / NOT_APPROVED`。Source behaviorを変更する効力はない。

## 18. Existing Decision consistency

- PD-01Aの`/app`、`/app/analysis`、shared runtime、distinct semanticsを変更しない。
- Marketing Page-owned / App Layout-owned Headerを維持できる。
- thin route entryとfeature-centric compositionを維持できる。
- B-3Sの「Product Decision前にredirect/canonicalを推測しない」に従い、本Phaseでは候補文書化だけを行う。
- compatibility wrapper policyとURL redirectを混同せず、meaningless alias duplicationを増やさない方向は整合する。

## 19. Open questions and closure impact

| Question | PD-01 Marketing Decision blocker | Implementation blocker |
| --- | --- | --- |
| `/`をprimary public homeとして承認するか | yes | yes |
| `/lp`・`/plan`に既存campaign/backlink/bookmarkがあるか | no（conditional decision可） | yes, before redirect/removal |
| `/plan`を将来pricing pageにするか | yes for its lifecycle | yes |
| exact sitemap entries/generation | no | yes before public SEO rollout |
| analytics vendor/event schema | no for boundary | yes for instrumentation |
| UTM naming owner/taxonomy | no for principle | yes before campaign launch |
| cookie consent、PII、retention、identity stitching | no for route intent | yes before analytics rollout |
| exact content/keyword strategy | no | separate Marketing work |
| PD-01B state/share contract | no for Marketing subdecision | yes for PD-01 Parent closure |

## 20. Decision readiness

| Area | Status | Reason |
| --- | --- | --- |
| Marketing Route Intent | `READY_FOR_DECISION_REVIEW` | root/boundary/options/tradeoffsを比較可能。external footprintはconditional implementation gate |
| Canonical / SEO Policy | `READY_FOR_DECISION_REVIEW` | Google一次資料がlogical policyを支持。Panoptes implementationは未実施 |
| Campaign / Analytics Boundary | `READY_FOR_DECISION_REVIEW` | vendor-neutral boundaryとdefault/exception modelを比較可能 |
| PD-01 Parent | `PARTIALLY_READY` | Marketing reviewは可能だがPD-01Bは`NEEDS_DISCOVERY` |

推奨次Phaseは**PD-53 — PD-01 Marketing Route Intent Decision Review**。Product OwnerがMarketing model、`/`、`/lp`、`/plan` lifecycle、canonical/SEO、campaign/analytics boundaryを承認候補としてreviewする。明示承認なしに`DECIDED`へ進めない。

## 21. External Evidence Record

External Evidenceは一般的なSearch/Analytics guidanceまたは他社siteの観察であり、Panoptes Product Decisionではない。

| Source | Publisher | URL | Accessed Date | Supported Claim |
| --- | --- | --- | --- | --- |
| URL canonicalization | Google Search Central | <https://developers.google.com/search/docs/crawling-indexing/canonicalization> | 2026-09-07 | duplicate clusterからrepresentative URLが選ばれ、canonical preferenceはhintである |
| Specify canonical URLs | Google Search Central | <https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls> | 2026-09-07 | redirect/canonical/sitemapのsignal強度、self-reference、internal link一貫性 |
| Redirects and Google Search | Google Search Central | <https://developers.google.com/search/docs/crawling-indexing/301-redirects> | 2026-09-07 | permanent/temporary redirectの用途とserver-side優先 |
| Block indexing with noindex | Google Search Central | <https://developers.google.com/search/docs/crawling-indexing/block-indexing> | 2026-09-07 | noindexの効果とrobots.txt blockとの非両立 |
| Control what you share | Google Search Central | <https://developers.google.com/search/docs/crawling-indexing/control-what-you-share> | 2026-09-07 | confidential/private contentにはpassword protectionが必要 |
| Build and submit a sitemap | Google Search Central | <https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap> | 2026-09-07 | sitemapにはpreferred canonical URLを掲載し、sitemapはhintである |
| JavaScript SEO basics | Google Search Central | <https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics> | 2026-09-07 | unique metadata、HTML canonical、crawlable linkのJS site guidance |
| Campaign URL builders | Google Analytics Help | <https://support.google.com/analytics/answer/10917952> | 2026-09-07 | UTM fields、case sensitivity、consistent campaign naming |
| Traffic-source dimensions | Google Analytics Help | <https://support.google.com/analytics/answer/11242870> | 2026-09-07 | manual taggingとsource/medium/campaign dimension mapping |
| Slack official site | Slack | <https://slack.com/> | 2026-09-07 | Marketing root、features/pricing、get-started entryの現行例 |
| Notion official site | Notion | <https://www.notion.com/> | 2026-09-07 | Product/use cases/resources/pricingとlogin entryの現行例 |
| HubSpot official site | HubSpot | <https://www.hubspot.com/> | 2026-09-07 | Products/solutions/pricing/resourcesとapp login separationの現行例 |

## 22. Scope and validation

- Changed: this audit、Product Decision Register、Development Log only。
- Not changed: `src`、routes、redirects、metadata、sitemap、analytics、cookies、CRM、Rails、OpenAPI、copy、design。
- Repo-wide discoveryは行わず、PD-01対象routes/auth policy/Headerと既存B-3Q〜B-3S/PD-4/PD-5正本だけを確認した。
- Full quality gateは指示どおり未実行。docs-only diff、status/reference/citation整合を検査する。

## References

- [Product Decision Register](../product/product-decision-register.md)
- [PD-01 Route Intent Discovery](./62-pd01-route-intent-discovery.md)
- [PD-01A App Route Role Decision](./63-pd01a-app-route-role-decision.md)
- [B-3Q Marketing / App Route Ownership](./53-marketing-app-route-ownership-analysis.md)
- [B-3R Compatibility / Route Entry Analysis](./55-compatibility-wrapper-route-entry-analysis.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Frontend Route Ownership](../architecture/frontend-route-ownership.md)
- [Development Log](../DEVELOPMENT_LOG.md)
