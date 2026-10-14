# Phase PD-53 — PD-01 Marketing Route Intent Decision Review

実施日: 2026-09-07  
Phase種別: Product Decision Review / Documentation-only  
Review status: `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`

## 1. Conclusion

PD-52のRepository Evidence、既存Product Decision、External Evidenceをreviewした結果、PD-01 Marketing Route branchのProduct PrincipleはProduct Ownerの明示承認を待つFinal Proposalへ固定できる。

- Marketing Route Intent: `READY_FOR_APPROVAL / NOT_APPROVED`
- Canonical / SEO Policy: `READY_FOR_APPROVAL / NOT_APPROVED`
- Campaign / Analytics Boundary: `READY_FOR_APPROVAL / NOT_APPROVED`
- Marketing Route Branch Closure Proposal: `READY_FOR_APPROVAL / NOT_APPROVED`
- PD-01 Parent: `PARTIALLY_READY`

本Phaseは承認ではない。`/lp`・`/plan`のduplicated renderingをcanonical architectureとして恒久維持しないPrincipleはApproval Scopeに含めるが、remove、redirect、repurposeの具体処置はexternal footprint確認後へ送る。PD-01Aは変更せず、PD-01Bは`NEEDS_DISCOVERY`のまま分離する。

## 2. Decision disposition

| # | Subject | Disposition | Review result |
| ---: | --- | --- | --- |
| 1 | Root `/` Intent | `DECIDE_NOW` | `/` = Public Product Marketing Home |
| 2 | Marketing / App Boundary | `DECIDE_NOW` | public communicationとauthenticated operationを分離 |
| 3 | Public URL Hierarchy | `DECIDE_NOW` | primary=flat、collections=sectional、campaign=managed exception |
| 4 | Public / Private Classification | `DECIDE_NOW` | 4 logical classesを採用候補。exact enum実装はdefer |
| 5 | Canonical URL Principle | `DECIDE_NOW` | one resource / one canonical public URL |
| 6 | Alias / Duplicate Route Policy | `DECIDE_NOW` | duplicated public renderingをcanonical defaultにしない |
| 7 | Redirect Principle | `DECIDE_NOW` | permanent/temporary moveを意味で分離 |
| 8 | Campaign URL Principle | `DECIDE_NOW` | canonical destination + attribution default |
| 9 | Attribution Boundary | `DECIDE_NOW` | source/medium/campaignをconceptual coreとする |
| 10 | Marketing / Product Analytics Boundary | `DECIDE_NOW` | acquisition/conversionとproduct usageを分離 |
| 11 | Metadata Ownership | `DECIDE_NOW` | Marketing default、route resource-specific、App private policy |
| 12 | Canonical Ownership | `DECIDE_NOW` | resource declares identity、shared layer generates/validates |
| 13 | Route Stability | `DECIDE_NOW` | public URL変更にmigration planを要求 |
| 14 | Login / Auth Entry Intent | `DECIDE_NOW` | `/login` = AUTH_PUBLIC_ENTRY |
| 15 | Future Content Extensibility | `DECIDE_NOW` | sectional collectionsを許容 |
| 16 | `/lp` / `/plan` disposition boundary | `DECIDE_NOW + DEFER` | duplicate非正本化は今決め、exact dispositionはdefer |
| 17 | PD-01 Marketing Contract | `DECIDE_NOW` | Section 14をFinal Proposalとする |
| 18 | PD-01 Parent readiness impact | `KEEP_AS_DEPENDENCY_STATUS` | ParentはPD-01BによりPARTIALLY_READY |

### Rejected directions

- Root `/`をApp redirectへ変える。
- authenticated stateによってRootのresource identityやmain intentを変える。
- 同一resourceのduplicated renderingを恒久的なpublic architectureとする。
- internal alias/component wrapperをpublic URL migrationのdefaultにする。
- UTM等を独立canonical content identityとして扱う。
- robots.txtや`noindex`をprivate content securityの正本にする。
- MarketingとProductのevent taxonomy/data purposeを無条件に1つへ統合する。

### Implementation details kept outside Product Decision

301/308の選択、Svelte metadata API、canonical helper shape、sitemap generation、`noindex`のmeta/header方式、analytics SDK/vendor、parameter capture、consent mechanismは`KEEP_AS_IMPLEMENTATION_DETAIL`または後続handoffとする。

## 3. Root `/` Final Proposal

`/`を**Public Product Marketing Home**とする。

- Panoptes Productのprimary public entry。
- Product explanation、features/use cases/pricingへのnavigation、trust、lead generation、signup/login entryを担う。
- authenticated stateでRoot Intentを変更しない。
- auth stateはCTA destination/labelの補助に限定し、MarketingをProduct runtime stateのSource of Truthにしない。

Option AをFinal Proposalとする。Option BのApp redirect、Option Cのstate-dependent resource identity、Option Dの別domainはrejectする。ただしOption CのうちCTAだけをauth-awareにすることはRoot Intentを変えないpresentation detailとして許容する。

## 4. Marketing / App Boundary

| Boundary | Marketing — Public Product Communication | App — Authenticated Product Operation |
| --- | --- | --- |
| Owns | explanation、features、pricing、use cases、trust、company/product info、lead/auth entry | analysis、workspace、results、Organization operations、settings、authenticated workflows |
| State | route/content intent、campaign/referral、local UI | user、Organization、AnalysisJob、Snapshot、Product runtime |
| SEO goal | approved resourcesをpublicly discoverableにする | search indexingをProduct goalにしない |
| Analytics purpose | acquisition、campaign、CTA、lead、signup conversion | execution、feature usage、engagement、retention、operations |

既存PD-01Aをそのまま参照する。

- `/app` = App Home / Analysis Entry。
- `/app/analysis` = Analysis-focused Workspace / Result Entry。
- shared runtime + distinct route semantics。

## 5. Public URL Hierarchy Final Direction

- Stable primary resourcesはflat structureを基本とする。`/`、将来承認される`/pricing`、`/features`、`/about`、`/contact`等。
- 増加するcollectionsは`/use-cases/*`、`/resources/*`、`/docs/*`、`/reports/*`等のsectional structureを許容する。
- campaign routeはmanaged exceptionで、無制限に増やさない。
- Exact route set、route naming、content launch orderは`MARKETING_HANDOFF`であり、本Decisionでrouteを作らない。

## 6. Public / Private Classification Final Proposal

| Logical class | Contract meaning | Current/future candidate |
| --- | --- | --- |
| `PUBLIC_INDEXABLE` | public resource valueとexplicit canonical/metadataを持つ | `/`、承認済みMarketing resources |
| `PUBLIC_NON_INDEXABLE` | public accessは必要だがsearch landingではない | callback/error/temporary utility |
| `AUTH_PUBLIC_ENTRY` | authentication開始用のpublic entry。Product operationではない | `/login`、将来承認されたsignup entry |
| `AUTHENTICATED_PRIVATE` | authentication/authorization必須、indexing非目標 | `/app`、`/app/analysis`、Organization/Admin boundaries |

Conceptは`DECIDE_NOW`。TypeScript enum、route manifest、middleware表現はDEFERする。

## 7. Canonical / SEO Final Proposal

1. One resource / one canonical public URL。
2. `PUBLIC_INDEXABLE` resourceはexplicit canonical identityを持つ。
3. canonical resourceはself-referencing canonicalをv1 baselineとする。
4. internal links、sitemap、canonical identityを揃える。
5. duplicate public routeをdefault architectureにしない。
6. campaign attribution parameterはcanonical identityを変えない。
7. authenticated App routesは`AUTHENTICATED_PRIVATE`とし、authentication/authorizationを保護の正本、non-indexingを補助Policyとする。
8. public URL identity変更時はredirect migrationを要求する。

Self-canonicalの例外はexplicit policy、owner、理由を必要とする。Exact metadata implementationはDEFERする。

## 8. Alias / Duplicate and `/lp` / `/plan` Boundary

Current factsは変更しない。

- `/`、`/lp`、`/plan`は同じcontentをrenderする。
- `/lp`・`/plan`は`DUPLICATED_RENDERING / UNKNOWN_PRODUCT_INTENT`である。
- redirect、rewrite、legacy compatibilityとは確認されていない。

Final Principleは、同一resourceの複数public URLによるduplicated renderingをcanonical architectureとして維持しないことである。ただし`/lp`・`/plan`のexact dispositionは本Approval Scope外とする。

| Route | Lifecycle status | Not decided |
| --- | --- | --- |
| `/lp` | `NEEDS_EXTERNAL_FOOTPRINT_CHECK` | remove / redirect / repurpose、target、status |
| `/plan` | `NEEDS_EXTERNAL_FOOTPRINT_CHECK` | remove / redirect / repurpose、pricing future intent、target、status |

このstatusはMarketing branchのApproval blockerではなく、変更実装前のgateである。

## 9. External Footprint Handoff

`/lp`・`/plan`の変更前に、Search index/Search Console、backlinks、ads、campaign materials、QR、external documents、analytics traffic、bookmark運用、current internal referencesを確認する。

- Evidenceがあればequivalent destinationとmigration periodを決める。
- Evidence未取得を利用なしと解釈しない。
- `/plan`をdistinct pricing resourceへrepurposeする場合はcontent owner、launch intent、metadata、canonicalを別途承認する。
- この調査は`IMPLEMENTATION_PREREQUISITE`であり、Marketing ContractのProduct Owner承認をblockしない。

## 10. Redirect and Route Stability Final Proposal

- permanent identity moveにはpermanent redirectを使う。
- temporary moveにはtemporary redirectを使う。
- public migrationのdefaultとしてinternal aliasやduplicate renderingを使わない。
- Exact 301/308、framework API、cache policy、monitoring、retention期間はimplementation policyとする。
- Public Marketing URLはsearch index、backlink、campaign、QR、bookmark、external documentから参照されるstable identityとして扱い、breaking changeにはowner、equivalent destination、redirect、monitoring planを要求する。

## 11. Campaign / Attribution Final Proposal

- defaultは**Canonical Product Page + Standardized Attribution Parameters**。
- Marketing Attributionのconceptual coreは`source`、`medium`、`campaign`。
- `content`、`term`等は必要に応じて許容する。
- dedicated campaign routeはdistinct content、clear owner、measurement、lifecycle、expiry、canonical/redirect planがある場合だけのmanaged exception。
- `Campaign Attribution Parameter != Content Identity`。UTM等付きURLを新しいcanonical resourceとして扱わない。
- attribution captureとcanonical identityを分離する。

Exact UTM key/value taxonomy、case policy registry、vendor、SDK、capture mechanismは`ANALYTICS_HANDOFF`である。

## 12. Marketing / Product Analytics Boundary Final Proposal

| Marketing Analytics | Product Analytics |
| --- | --- |
| acquisition、campaign、landing、CTA、lead、signup conversion | analysis execution、feature use、engagement、retention、Product/Organization operations |

同じvendorを採用することは許容するが、同一event taxonomy、identity、retention、data purposeへ無条件に統合しない。anonymous-to-authenticated linking、PII、consent、retentionはPrivacy Approvalなしに実装しない。

## 13. Metadata and Canonical Ownership Final Proposal

| Concern | Logical owner |
| --- | --- |
| default Marketing metadata | Marketing layout/boundary |
| resource-specific title/description/social/canonical identity | individual public Route / Resource |
| absolute canonical URL generation and validation | shared Marketing SEO layer |
| private/non-indexable intent | App boundary/server response policy |
| auth entry policy | Auth route boundary |

Canonical identityはRoute/Resourceが明示し、utilityがpathname/contentから勝手に推論しない。Shared layerはorigin normalization、absolute URL生成、validation、renderingを担う。Exact Svelte implementationはDEFERする。

## 14. PD-01 Marketing Contract — Final Approval Candidate

| Contract area | Final Proposal |
| --- | --- |
| Marketing Route Intent | Public Product Communication。Product runtime stateを所有しない |
| Root Route Intent | `/` = Public Product Marketing Home |
| Marketing / App Boundary | public communicationとauthenticated operationを分離 |
| Public / Private Classification | 4 logical classesを採用 |
| Canonical URL Principle | one public resource / one canonical URL、self-canonical baseline |
| Alias / Duplicate Policy | duplicated public renderingをcanonical defaultにしない |
| Campaign URL Principle | canonical destination + attribution default、dedicated routeはmanaged exception |
| Analytics Boundary | Marketing acquisition/conversionとProduct usage/operationsを分離 |
| Metadata Ownership | Marketing default、Route resource-specific、App private policy |
| Canonical Ownership | Resource declares identity、shared SEO layer generates/validates |
| Route Stability | public URL changeにmigration/redirect planを要求 |
| Auth Entry | `/login` = AUTH_PUBLIC_ENTRY。将来signupも承認後に同class候補 |
| App Boundary | PD-01Aを参照し、再定義しない |

Statusは`FINAL_PROPOSAL / READY_FOR_APPROVAL / NOT_APPROVED`。Product Ownerの明示承認前はDecisionではない。

## 15. Login, Signup, and Future Content

- `/login`はMarketingとAuthenticated Appの境界にある`AUTH_PUBLIC_ENTRY`とし、Authenticated Product Routeとは扱わない。
- 現在独立`/signup` routeはないため存在を仮定しない。将来承認・実装する場合は`AUTH_PUBLIC_ENTRY`候補とする。
- use cases、resources、documentation、reports、case studies等をsectional collectionとして追加可能にするが、具体的route、copy、keyword/content strategyは本Decisionに含めない。

## 16. Existing Decision Consistency

- PD-01Aのroute role、shared runtime、distinct semanticsを変更しない。
- Marketing Page-owned Header、App Layout-owned Headerを変更しない。
- thin route entries、feature-centric composition、compatibility wrapper policyと整合する。
- `/lp`・`/plan`のcurrent behaviorを事実として保持し、Product Principleとfuture implementationを区別する。
- PD-52 External Evidence Recordを継承し、外部EvidenceをPanoptes Product Decisionとして扱わない。

## 17. PD-01B Dependency and Parent Status

PD-01B App Deep-link / State Restoration Contractは`NEEDS_DISCOVERY`を維持する。pathname/query state、reload/history、bookmark/share、Organization/permission、stale resource behaviorをMarketing Contractへ混ぜない。

Marketing Route branchだけはApproval待ちへ進めるが、PD-01 Parentは`PARTIALLY_READY`を維持し、Parent Closureを行わない。Marketing branchが承認されても、PD-01B完了前にParentを`COMPLETE`へしない。

## 18. Deferred / Handoff Ledger

| Class | Items | Marketing branch approval blocker |
| --- | --- | --- |
| `IMPLEMENTATION_HANDOFF` | redirect implementation、metadata、canonical rendering、sitemap、route manifest、external footprint check | no |
| `ANALYTICS_HANDOFF` | vendor、exact UTM taxonomy、event schema、capture/identity mapping | no |
| `PRIVACY_HANDOFF` | consent、PII、retention、anonymous/authenticated linking | no |
| `MARKETING_HANDOFF` | content strategy、keyword strategy、exact public route set、owners/schedule | no |
| `PRODUCT_DECISION_HANDOFF` | PD-01B、`/plan` future pricing intent、signup/onboarding intent when introduced | no for Marketing Contract; PD-01B blocks Parent closure |

## 19. Approval Scope and Closure Proposal

Product OwnerへのApproval Requestは次の単一packageとする。

1. Section 14のPD-01 Marketing Contract。
2. `/lp`・`/plan`のduplicate renderingをcanonical architectureとして維持しないPrinciple。
3. exact dispositionを`NEEDS_EXTERNAL_FOOTPRINT_CHECK`としてimplementation前へdeferするBoundary。
4. Section 18のDeferred / Handoff Ledger。
5. Marketing Route branchを`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`とするClosure Proposal。

承認後もSource変更は自動発生しない。Approval Evidence、Decision Owner、Approval Dateが明示された後にだけDecision Recordを作成する。

## 20. Readiness

| Area | Status | Reason |
| --- | --- | --- |
| Marketing Route Intent | `READY_FOR_APPROVAL / NOT_APPROVED` | root、boundary、hierarchy、auth intentをFinal Proposal化 |
| Canonical / SEO Policy | `READY_FOR_APPROVAL / NOT_APPROVED` | principle、self-canonical、duplicate/private/migrationをFinal Proposal化 |
| Campaign / Analytics Boundary | `READY_FOR_APPROVAL / NOT_APPROVED` | default/exception、attribution identity、analytics separationをFinal Proposal化 |
| Marketing Route Branch Closure | `READY_FOR_APPROVAL / NOT_APPROVED` | exact implementationをtyped handoffへ分離し、approval blockerなし |
| PD-01 Parent | `PARTIALLY_READY` | PD-01Bが`NEEDS_DISCOVERY`でParent Closure不可 |

## 21. Source and Quality Boundary

- Documentation-only。
- Source、route、redirect、metadata、canonical、sitemap、analytics、Rails、OpenAPIは変更していない。
- Repo-wide discoveryおよびExternal Research再実施は行っていない。
- Full quality gateは実行しない。docs-only scope、Register/Audit/Log status、PD-52 external references、Markdown links、Prettierを確認する。

## References

- [PD-52 External Evidence Review](./110-pd01-marketing-route-intent-external-evidence-review.md)
- [PD-01A App Route Role Decision](./63-pd01a-app-route-role-decision.md)
- [PD-01 Route Intent Discovery](./62-pd01-route-intent-discovery.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Frontend Route Ownership](../architecture/frontend-route-ownership.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Development Log](../DEVELOPMENT_LOG.md)
