# Phase PD-54 — PD-01 Marketing Route Intent Explicit Product Owner Approval Record

Approval Date: 2026-09-07  
Decision Owner: Product Owner  
Phase種別: Approval-only / Documentation-only  
Final status: `DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`

## 1. Approval Evidence

Product Ownerから次の明示承認が提供された。

> 「PD-01のMarketing Route Intent / Canonical・SEO / Campaign・Analytics Proposal、およびMarketing Route Branch Closure Proposalを承認する。」

この承認はPD-53のFinal Proposal、Marketing Route Branch Closure Proposal、Deferred / Handoff Ledgerを対象とする。PD-01B、PD-01 Parent Closure、Source implementationの承認とは解釈しない。

## 2. Approval Result

| Scope | Result |
| --- | --- |
| Marketing Route Intent | `DECIDED / APPROVED` |
| Canonical / SEO v1 Policy | `DECIDED / APPROVED` |
| Campaign / Analytics v1 Policy | `DECIDED / APPROVED` |
| PD-01 Marketing Contract | `DECIDED / APPROVED` |
| Marketing Route Branch Closure | `APPROVED` |
| Marketing Route Branch | `DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS` |
| PD-01B | `NEEDS_DISCOVERY` |
| PD-01 Parent | `PARTIALLY_READY` |
| Implementation | `NOT_IMPLEMENTED` |

## 3. Approved Root and Boundary Contract

### Root Route Intent

`/` = **Public Product Marketing Home**。

- Panoptes Productのprimary public entry。
- Product explanation、features、pricing、use cases、trust、company/product information、lead generation、auth entryを担う。
- authenticated stateはRoot Intent自体を変更しない。
- auth stateによる差分はCTA補助に限定する。

### Marketing / App Boundary

| Marketing — Public Product Communication | App — Authenticated Product Operation |
| --- | --- |
| explanation、features、pricing、use cases、trust、company/product information、lead generation、auth entry | analysis、workspace、results、Organization operations、settings、authenticated workflows |

MarketingをAuthenticated Product StateのSource of Truthにしない。

### Existing App Decision

PD-01Aをそのまま維持する。

- `/app` = App Home / Analysis Entry。
- `/app/analysis` = Analysis-focused Workspace / Result Entry。
- shared runtime + distinct semantics。

本承認はPD-01Aを再定義しない。

## 4. Approved Public URL Architecture

### Hierarchy

- Primary Public Routesはflat structureをbaselineとする。
- 将来のuse-cases、resources、docs、reports、case-studies等はsectional collectionsとして追加可能とする。
- Campaign Routesはmanaged exceptionであり、default structureにしない。
- Exact route set、content、launch orderは未決定である。

### Logical Classification

次のconceptを承認する。

- `PUBLIC_INDEXABLE`
- `PUBLIC_NON_INDEXABLE`
- `AUTH_PUBLIC_ENTRY`
- `AUTHENTICATED_PRIVATE`

Exact enum、route manifest、TypeScript implementationはDEFERする。

### Route Stability

Public Marketing URLをstable external identityとして扱う。変更時はowner、equivalent destination、redirect plan、monitoring planを要求する。

## 5. Approved Canonical / SEO v1 Policy

1. One public resource / one canonical URL。
2. Public ResourceはCanonical Identityを明示的に持つ。
3. `PUBLIC_INDEXABLE` Resourceはself-referencing canonicalをv1 baselineとする。
4. canonical identity、internal links、sitemap、public route identityを整合させる。
5. Duplicate Public Routesをcanonical architectureのdefaultにしない。
6. Campaign parametersはCanonical Identityを変更しない。
7. Authenticated App Routesはprivate / non-indexableとする。
8. Public URL変更にはredirect migrationを要求する。

Authentication / AuthorizationがPrivate Content Protectionの正本である。`noindex`等は補助Policyであり、robots.txtのみへSecurityを依存しない。Self-canonicalの例外はexplicit policyがある場合だけ許容する。

## 6. Approved Alias / Duplicate and Redirect Policy

- 同一Public Resourceを複数URLで恒久的にduplicated renderingしない。
- duplicated public renderingをcanonical architectureのdefaultにしない。
- permanent moveはpermanent redirect、temporary moveはtemporary redirectを原則とする。
- internal alias / duplicate renderingをPublic URL Migrationのdefaultにしない。
- Exact 301 / 308、framework API、cache、monitoring、retentionはImplementation PolicyへDEFERする。

## 7. `/lp` / `/plan` Decision Boundary

| Route | Current lifecycle status | Approved principle | Not decided |
| --- | --- | --- | --- |
| `/lp` | `NEEDS_EXTERNAL_FOOTPRINT_CHECK` | duplicated renderingを将来canonical architectureとして維持しない | remove / redirect / repurpose、target、redirect status |
| `/plan` | `NEEDS_EXTERNAL_FOOTPRINT_CHECK` | duplicated renderingを将来canonical architectureとして維持しない | remove / redirect / repurpose、future pricing intent、target、redirect status |

変更実装前にSearch index、backlinks、ads、campaign materials、QR、external documents、analytics traffic、internal referencesを確認する。External Footprint未確認のまま削除・redirectを行わない。これはImplementation prerequisiteであり、承認済みMarketing ContractのClosure blockerではない。

## 8. Approved Campaign / Analytics v1 Policy

1. Canonical Product Page + Standardized Attribution Parametersをdefaultとする。
2. Dedicated Campaign Routeはdistinct content、explicit owner、lifecycle、expiry、redirect planを持つ場合だけmanaged exceptionとする。
3. `Campaign Attribution Parameter != Content Identity`。
4. UTM等付きURLを新しいCanonical Resourceとして扱わない。
5. attribution取得とCanonical Identityを分離する。
6. Marketing AnalyticsとProduct Analyticsを分離する。
7. Vendor-specific implementationはDEFERする。

Marketing Attributionのconceptual coreは`source`、`medium`、`campaign`であり、必要に応じて`content`、`term`等を許容する。Exact UTM taxonomyは未決定である。

### Analytics Boundary

| Marketing Analytics | Product Analytics |
| --- | --- |
| acquisition、campaign、CTA、lead、signup conversion | analysis execution、feature usage、engagement、retention、Product operations |

同一Event Taxonomyへ無理に統合しない。同じvendorを使う可能性まで禁止せず、vendor、identity、PII、consent、retentionは後続Decisionへ送る。

## 9. Approved Metadata and Canonical Ownership

| Concern | Logical owner |
| --- | --- |
| default marketing metadata | Marketing Boundary |
| resource-specific metadata and canonical identity | Public Resource Route |
| absolute canonical URL generation and validation | Shared Marketing SEO Layer |
| private / non-indexable intent | App Boundary |
| authentication entry intent | Auth Route Boundary |

Resource / RouteがCanonical Identityを宣言し、Shared Marketing SEO Layerがabsolute URLを生成・検証する。UtilityがCanonical Identityをpathnameやcontentから勝手に推論しない。Exact Svelte implementationはDEFERする。

## 10. Approved Login, Signup, and Future Content Direction

- `/login` = `AUTH_PUBLIC_ENTRY`。Authenticated Product Routeではなく、Marketing/PublicからAppへ入るAuth Entryとする。
- 現在独立した`/signup` routeは存在しないため、新規routeを仮定しない。将来正式導入された場合は`AUTH_PUBLIC_ENTRY`として扱える。
- Marketing Architectureはuse cases、resources、documentation、reports、case studies等のsectional collectionを許容する。
- Exact Content Strategy、Keyword Strategy、route追加は本Decision対象外である。

## 11. PD-01 Marketing Contract — Approved

| Contract area | Approved Decision |
| --- | --- |
| Marketing Route Intent | Public Product Communication。Product runtime stateを所有しない |
| Root Route Intent | `/` = Public Product Marketing Home |
| Marketing / App Boundary | public communicationとauthenticated operationを分離 |
| Public / Private Classification | 4 logical classes |
| Canonical URL Principle | one public resource / one canonical URL、self-canonical baseline |
| Alias / Duplicate Policy | duplicated public renderingをcanonical defaultにしない |
| Campaign URL Principle | canonical destination + attribution default、dedicated routeはmanaged exception |
| Analytics Boundary | Marketing acquisition/conversionとProduct usage/operationsを分離 |
| Metadata Ownership | Marketing default、Route resource-specific、App private policy |
| Canonical Ownership | Resource declares identity、shared layer generates/validates |
| Route Stability | public URL changeにmigration/redirect planを要求 |
| Auth Entry | `/login` = AUTH_PUBLIC_ENTRY。将来signupは別承認 |
| App Boundary | PD-01Aを参照し、再定義しない |

Status: `DECIDED / APPROVED`。

## 12. Marketing Route Branch Closure

Product OwnerはPD-53 Final ProposalとMarketing Route Branch Closure Proposalを明示承認した。

- Marketing Route Branch: `DECISION_COMPLETE`。
- Closure disposition: `CLOSED_WITH_DEFERRED_ITEMS`。
- Closure blocker count: 0。
- Deferred itemsはSection 14へ保持する。
- Decision CompleteはImplementation Completeを意味しない。

## 13. PD-01B and Parent Status

PD-01B App Deep-link / State Restoration Contractは`NEEDS_DISCOVERY`を維持する。pathname/query state、reload/history、bookmark/share、Organization/permission、stale resource behaviorを本Marketing Contractから推測しない。

`Marketing Route Branch Closure != PD-01 Parent Closure`。PD-01 Parentは`PARTIALLY_READY`を維持し、PD-01B完了前に`COMPLETE`へしない。

## 14. Deferred Ledger

DeferredはForgottenを意味しない。各項目はownerと再開条件を後続work itemで具体化する。

| Class | Deferred items | Reopen / implementation condition |
| --- | --- | --- |
| `IMPLEMENTATION_HANDOFF` | redirects、canonical、metadata、sitemap、route classification implementation、external footprint check | approved implementation planとtarget evidence |
| `ANALYTICS_HANDOFF` | analytics vendor、exact UTM taxonomy、event schema、capture | campaign/measurement owner決定前 |
| `PRIVACY_HANDOFF` | consent、PII、retention、anonymous/authenticated identity linking | privacy reviewとdata-purpose approval |
| `MARKETING_HANDOFF` | content strategy、keyword strategy、exact public route set | Marketing owner、content purpose、schedule決定時 |
| `PRODUCT_DECISION_HANDOFF` | PD-01B、`/plan` future intent、footprint後の`/lp`・`/plan` final disposition | respective Product discovery/review |

## 15. Implementation Boundary

- Decision status: `DECISION_COMPLETE`。
- Implementation status: `NOT_IMPLEMENTED`。
- Source changes: `NONE`。
- redirects、metadata、canonical、sitemap、analytics、privacy controlsは未実装。
- Approvalだけから具体的なroute/redirect/metadata behaviorを推測しない。

## 16. Source and Quality Boundary

- Approval-only / Documentation-only。
- Repo-wide discovery、External Research、新規Discoveryは行っていない。
- Source、route、redirect、metadata、canonical、sitemap、analytics、Rails、OpenAPIは変更していない。
- Full quality gateは実行しない。docs-only scope、Approval Evidence、Register/Audit/Log status、Deferred Ledger、Markdown links、Prettierを確認する。

## References

- [PD-53 Decision Review](./111-pd01-marketing-route-intent-decision-review.md)
- [PD-52 External Evidence Review](./110-pd01-marketing-route-intent-external-evidence-review.md)
- [PD-01A App Route Role Decision](./63-pd01a-app-route-role-decision.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Frontend Route Ownership](../architecture/frontend-route-ownership.md)
- [Development Log](../DEVELOPMENT_LOG.md)
