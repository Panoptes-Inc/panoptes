# Panoptes Product Decision Register

更新日: 2026-09-14（Phase PD-62 Inventory Parent Approval）

## Purpose

本書は、Frontend Inventory Closure でArchitectureから分離されたProduct Decisionの親成果物である。現行実装を事実として固定し、Productの意味・URL・formula・workflowを実装都合から推測せず、決定責任者、必要なEvidence、期限、依存関係を追跡する。

このRegisterは仕様書ではない。`DECIDED`は、明示されたDecision Ownerの承認とDecision recordが揃った場合にのみ付与する。

## Decision Status Definitions

| Status                       | Definition                                                    |
| ---------------------------- | ------------------------------------------------------------- |
| `NEEDS_DISCOVERY`            | 選択肢を評価するProduct evidenceが不足している                |
| `PARTIALLY_READY`            | 一部sub-decisionはreview可能だが、親に未調査の必須項目が残る  |
| `READY_FOR_DECISION`         | 現状・選択肢・影響が揃い、Ownerの判断待ちである               |
| `DECISION_SCHEDULED`         | Ownerと判断日が確定している                                   |
| `DECIDED`                    | Ownerが選択肢を承認し、日付・理由・影響を記録済みである       |
| `READY_FOR_CLOSURE_REVIEW`   | 子Decisionが揃い、親Decisionのscopeとhandoffを最終確認できる  |
| `READY_FOR_CLOSURE_APPROVAL` | Closure reviewが完了し、Ownerの明示的な親Closure承認を待つ    |
| `DEFERRED`                   | Ownerが期限または再開条件を定めて延期した                     |
| `BLOCKED`                    | 外部契約・依存Evidenceがなく、Product判断だけでは進められない |

Evidenceは `KNOWN`、`UNKNOWN`、`ASSUMPTION`、`NEEDED` に区分する。Phase PD-1では仮説を `KNOWN` として扱わない。

## Active Decisions

### Phase PD-62 — Inventory Parent Explicit Product Owner Approval

- **Approval Evidence:** 「2026年8〜9月 Panoptes Frontend棚卸し・構造整理フェーズについて、Closure Criteriaを満たし、Closure Blockerが0件であることを確認したため、Deferred Itemsを後続Phaseへ引き継ぐ条件でCLOSE_WITH_DEFERRED_ITEMSとして正式Closureすることを承認する。」
- **Approval Date / Decision Owner / Record Created:** 2026-09-14 / Product Owner / 2026-09-14。
- **Final Inventory Parent Status:** `CLOSE_WITH_DEFERRED_ITEMS`、補助Status=`CLOSED`。Criteria 10/10 PASS、Inventory/Product Decision blocker 0。
- **Product handoff:** PD-01/02/04のClosure、PD-05のDecision、PD-03=`NEEDS_DISCOVERY / DEFERRED_NON_BLOCKER`を維持。Plan Rail 2件はProduct化・移動・削除前に再審査する。
- **Next:** October Frontend Standardization。Structure PolicyとDeferred Ledgerを正式Inputとし、standardization planはkickoffで作成する。
- **Reference:** [PD-62 Approval Record](../audit/120-aug-sep-frontend-inventory-parent-explicit-product-owner-approval-record.md)

### Phase PD-61 — Inventory Parent Closure Review linkage

- 8〜9月Frontend棚卸し・構造整理フェーズのClosure Criteriaは10/10 PASS、Closure blockerは0。
- Recommended Disposition=`CLOSE_WITH_DEFERRED_ITEMS`、Overall=`READY_FOR_APPROVAL / NOT_APPROVED`。Product Ownerの明示承認はまだ記録していない。
- PD-01/02/04のClosure、PD-05の実装済み判断、PD-03=`NEEDS_DISCOVERY / DEFERRED_NON_BLOCKER`を変更しない。
- Implementation/October handoffは既存Deferred Ledgerを継承し、Inventory Closureを実装完了へ拡張しない。
- [PD-61 Parent Closure Review](../audit/119-aug-sep-frontend-inventory-parent-closure-review.md)をClosure Proposalの正本とし、次はPD-62 Explicit Product Owner Approval Record。

### Phase PD-60 — Current Decision / Inventory Closure Summary

- **Count:** 正式PD ID=11（親5、子6）。Marketingは独立IDなしの承認済みBranch。Phase番号はDecision IDに計上しない。
- **Audit classification:** A CLOSED=3、B DECISION_COMPLETE_WITH_DEFERRED=7、C MUST_CLOSE=0、D IMPLEMENTATION主分類=0、E OCTOBER主分類=0、F FUTURE_PRODUCT_DECISION=1。D/Eの実作業はB等のhandoffに存在する。親5件だけならA=1/B=3/F=1。
- **Current statuses:** PD-01/01B/04とMarketingはDecision Complete、PD-02/02BはDECIDED / COMPLETE、PD-01A/02A/05はDECIDED、PD-02C/DはDecision Complete。PD-03のみNEEDS_DISCOVERY。
- **PD-03 disposition:** `DEFERRED_NON_BLOCKER`（棚卸し分類）。Product Status=`NEEDS_DISCOVERY`、timing=`CAN_DEFER`を維持。未承認・未Closure。Plan Rail 2件はDEFERを維持し、変更/移動/削除前にProduct reviewする。
- **Inventory:** Closure blocker=0、8〜9月全体=`READY_FOR_CLOSURE_REVIEW`。Frontend Inventoryの既存`CLOSE_WITH_DEFERRED_ITEMS`は変更しない。
- **Handoff:** Product、Validation/Calibration、Frontend Standardization、Backend/API、Worker/Analysis、SEO/Marketing、Analytics/Privacy、Billing/Stripe、Presentation、Test/Operationsの索引をAuditへ集約。個別Ledgerを正本として維持。
- **Next:** PD-61 8〜9月 Inventory Parent Closure Review。実装完了をClosure条件にしない。
- **Reference:** [PD-60 Matrix / Handoff / status gaps](../audit/118-remaining-product-decision-closure-audit.md)

### PD-01 — Route Intent

- **Status:** `DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`
- **Approval Evidence:** 「PD-01 App / Marketing Route Intent、App Deep-link / State Restoration Contract、およびPD-01 Parent Closure Proposalを、Deferred Itemsを後続Phaseへ引き継ぐ条件で承認する。」
- **Approval Date / Decision Owner:** 2026-09-14 / Product Owner。
- **Record Created Date:** 2026-09-14。
- **Closure:** `APPROVED`。Closure Blocker Count=0。Parent Contract=`DECIDED / APPROVED`。
- **Result:** PD-58のChild整合・Deferred handoffを含むParent ClosureをProduct Owner明示承認により正式記録した。
- **Parent Contract:** `/`=Public Product Marketing Home、`/app`=Home / Analysis Entry、`/app/analysis`=Analysis-focused Workspace / Result Entry。identity-less Analysisはserver-authorized current。public canonicalとauthenticated semantic URLを分離し、Model C、explicit immutable Snapshot、Rails authorization、no silent intent-changing fallbackを保持。
- **Consistency:** App/Marketing/public-private/campaign/Auth/Organization、PD-02 historical lineage、PD-04 immutable Snapshot/new Job lifecycle、Rails/BFF/Frontend ownershipを照合し矛盾なし。実装整合の検証ではない。
- **Deferred Ledger:** D01 Route、D02 SEO/Metadata、D03 Data/API、D04 Source、D05 Analytics、D06 Privacy、D07 Product、D08 Presentation、D09 Test/Operationsを正式Parent Handoffとして保持。全項目`DEFERRED_NON_BLOCKER`。[PD-59 Approval](../audit/117-pd01-parent-explicit-product-owner-approval-record.md)で承認を記録し、詳細・origin・再開条件は[PD-58 Parent Ledger](../audit/116-pd01-parent-closure-review.md#parent-deferred-ledger)を継承する。
- **Implementation:** `NOT_IMPLEMENTED`。Decision完了と実装完了を分離する。
- **Why decision is needed:** Marketing canonical URL、redirect、SEO metadata、campaign attribution、analytics、およびApp deep-link/state契約をArchitectureだけでは決められない。
- **Current behavior (`KNOWN`):** Marketing 3 routeは同一の`MarketingLandingPage`を描画し、route固有metadata・analytics差や`/lp`・`/plan`への内部導線はない。AppはPD-01Aにより`/app`をHome/Analysis Entry、`/app/analysis`をanalysis-focused entryと決定し、shared `PanoptesShellEntryPage`を許可した。
- **Decisions:** Marketing branchはPD-54で承認済み。`/`をPublic Product Marketing Home、one-resource/one-canonical、canonical destination + attribution defaultとする。App state/shareはPD-57でModel CとPD-01B Logical Contract / Closureを正式承認として記録した。
- **Evidence:** PD-01B Approval Evidence、Approval Date=2026-09-07、Decision Owner=Product OwnerをPD-57に記録済み。`/lp`・`/plan`の公開済みURL、Search Console、広告・CRM、bookmark/backlinkは従来どおりimplementation前のDeferred Evidence。
- **Dependencies:** Product/Marketing、SEO/Analytics、Frontend routing。
- **Blocking:** Parent Closure blocker=0、承認待ちは解消。`/lp`・`/plan`は`NEEDS_EXTERNAL_FOOTPRINT_CHECK`を維持し、変更前の確認をD09、dispositionをD01/D07へhandoff。
- **Owner:** Product Owner。Consulted: Marketing/SEO/Analytics、Engineering。
- **Decision timing:** Marketingは`BEFORE_PUBLIC_INDEXING`、PD-01Bはstateful deep-link/share公開前かつ`BEFORE_CLOSED_BETA`。
- **Recommended next action:** PD-60確認済み。PD-61 8〜9月 Inventory Parent Closure Reviewへhandoff。
- **Decision record:** PD-01A=`DECIDED`、Marketing Route BranchとPD-01B=`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`。PD-59でParent=`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`、Parent Closure=`APPROVED`。Source変更なし。
- **Inventory impact:** 主要Route / Navigation / Restoration Product Decisionを正式Closure。8〜9月棚卸し全体Closureは未実施。PD-03と残存handoffの確認を後続へ送る。
- **References:** [Route ownership](../architecture/frontend-route-ownership.md)、[B-3Q audit](../audit/54-phase-b3q-route-ownership-refactor.md)、[B-3T closure](../audit/58-frontend-inventory-parent-closure-review.md)

#### Phase PD-4 Discovery Review

- **Overall status:** `NEEDS_DISCOVERY`を維持する。Marketingは`NEEDS_DISCOVERY`、App URL roleは`READY_FOR_DECISION`、App state/share契約は`NEEDS_DISCOVERY`。
- **Marketing evidence (`KNOWN`):** `/`・`/lp`・`/plan`は同一Page/props/contentで、route固有load、metadata、campaign処理、analyticsはない。内部導線は`/`だけにあり、`/lp`・`/plan`にはない。
- **Marketing evidence (`UNKNOWN` / external):** canonical、index状況、広告・campaign・CRM attribution、公開済みURL、bookmark/backlink、`/plan`のPricing intent。
- **App evidence (`KNOWN`):** `/app`だけにTop Hero/search entryがあり、Header/Auth defaultも`/app`を指す。Search成功後は`goto('/app/analysis')`する。両routeのShell初期tab/project/snapshot/query/search stateは同一である。
- **Deep-link boundary:** `/app/analysis`はroute/reload/safe return単位では到達可能だが、pathname→tab/project/snapshot/query mappingとshare contractはない。
- **Owner:** `OWNER_REQUIRED`。Accountable候補はProduct Owner/PM。Marketing routeはMarketing/SEO/Analytics、App routeはEngineeringをconsultedとする。
- **Timing:** Marketing canonicalは`BEFORE_PUBLIC_INDEXING`かつcampaign launch前。App URL/deep-linkは`BEFORE_CLOSED_BETA`。
- **Standardization impact:** 全体`PARTIAL`。一般route/page taxonomyは`NON_BLOCKING`、対象routeのsemantic naming/navigationは`PARTIAL`、redirect/metadata lifecycleは承認まで対象限定で`BLOCKING`。
- **Next action:** Product Owner questionsへ回答し、App A-A〜A-Dを先に選択する。Marketingは外部SEO/campaign evidence収集後にM-A〜M-Dをreviewする。
- **Decision record:** 未決定。source、route、metadata、navigation、analytics、App stateの変更なし。
- **Reference:** [Phase PD-4 Route Intent Discovery](../audit/62-pd01-route-intent-discovery.md)

##### Route Intent Matrix

| Route           | Current behavior                  | Internal entry      | Product purpose                           | SEO / Analytics                   | Deep-link             | Status    |
| --------------- | --------------------------------- | ------------------- | ----------------------------------------- | --------------------------------- | --------------------- | --------- |
| `/`             | public共通Marketing               | Headerあり          | public/product topを示唆、canonical未承認 | route差・trackingなし             | public URL到達のみ    | `PARTIAL` |
| `/lp`           | `/`と同一                         | なし                | campaign/alias/legacy不明                 | route差・trackingなし、外部証拠要 | 不明                  | `UNKNOWN` |
| `/plan`         | `/`と同一                         | なし                | Pricing/planはroute名の示唆のみ           | route差・trackingなし、外部証拠要 | 不明                  | `UNKNOWN` |
| `/app`          | protected Shell + Top Hero/search | Header/Auth default | App home/new-analysis entryを支持         | trackingなし、SEO policy未定義    | route単位のみ         | `PARTIAL` |
| `/app/analysis` | protected同一Shell、Top Heroなし  | Search成功後goto    | analysis destinationを支持                | trackingなし、SEO policy未定義    | state復元/share未定義 | `PARTIAL` |

##### App Route Decision Proposal（PD-4 historical）

| Field             | Proposal                                                                       |
| ----------------- | ------------------------------------------------------------------------------ |
| Question          | `/app`と`/app/analysis`を異なる正式URL roleとして定義するか                    |
| Options           | A-A formal separation / A-B semantic alias / A-C future deprecation / A-D hold |
| Recommendation    | A-A。ただしURL roleのみを決め、initial state/share contractは別承認にする      |
| Evidence          | `/app`のTop Hero/search、Header/Auth entry、Search成功後の`/app/analysis`遷移  |
| Tradeoffs         | URL意味が明確になるが、将来distinct state・analytics・metadata契約が必要       |
| Migration impact  | 現時点は文書のみ。behavior変更は別implementation phase                         |
| Required approval | Phase PD-5でProduct OwnerがA-Aを承認済み                                       |

#### Phase PD-52 Marketing Route Intent External Evidence Review

- **Marketing Route Intent:** `READY_FOR_DECISION_REVIEW / NOT_APPROVED`。
- **Canonical / SEO Policy:** `READY_FOR_DECISION_REVIEW / NOT_APPROVED`。
- **Campaign / Analytics Boundary:** `READY_FOR_DECISION_REVIEW / NOT_APPROVED`。
- **PD-01 Parent:** `PARTIALLY_READY`。Marketing candidateはreview可能だが、PD-01Bは`NEEDS_DISCOVERY`。
- **Repository evidence (`KNOWN`):** `/`・`/lp`・`/plan`はbyte-identical route entryから同一Marketing contentをrenderし、route固有metadata、canonical、analytics、campaign処理、`/lp`・`/plan`内部導線はない。Marketing aliasはredirect/rewriteではなく`DUPLICATED_RENDERING`。
- **External evidence (`KNOWN`):** Google一次資料はone-resource/one-canonical、self-referencing canonical、canonical-only sitemap、恒久移転時のserver-side permanent redirect、private contentのauthentication保護を支持する。Google Analytics一次資料はUTM attributionとcase-sensitive naming consistencyを支持する。
- **Candidate (`NOT_APPROVED`):** `/`=`Public Product Marketing Home`。meaningful distinct public resourceだけにstable URLを与え、campaignはcanonical page + attribution parameterをdefault、dedicated routeをmanaged exceptionとする。Marketing acquisitionとauthenticated Product usage analyticsを分離する。
- **Conditional implementation gate:** `/lp`・`/plan`をredirect/removeする前にSearch Console、広告、CRM、backlink、bookmark、配布URLを確認する。証拠未取得を「利用なし」と扱わない。
- **Next action:** PD-53 Marketing Route Intent Decision Review。Product Ownerが明示承認するまでroute、redirect、metadata、sitemap、analyticsを変更しない。
- **Reference:** [Phase PD-52 External Evidence Review](../audit/110-pd01-marketing-route-intent-external-evidence-review.md)

#### Phase PD-53 Marketing Route Intent Decision Review

- **Review status:** `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`。
- **Marketing Route Intent:** `/`=`Public Product Marketing Home`。Marketing=`Public Product Communication`、App=`Authenticated Product Operation`。`READY_FOR_APPROVAL / NOT_APPROVED`。
- **Public URL model:** stable primary resourcesはflat、growing collectionsはsectional、campaign routeはmanaged exception。
- **Classification:** `PUBLIC_INDEXABLE`、`PUBLIC_NON_INDEXABLE`、`AUTH_PUBLIC_ENTRY`、`AUTHENTICATED_PRIVATE`のlogical conceptをFinal Proposal化。exact enum実装はDEFER。
- **Canonical / SEO:** one resource / one canonical public URL、public self-canonical baseline、internal link/sitemap整合、private App non-indexing、public URL変更時のredirect migrationをFinal Proposal化。
- **Campaign / Analytics:** canonical destination + standardized attributionをdefault、dedicated campaign routeをmanaged exceptionとし、Marketing acquisitionとProduct usage analyticsを分離するFinal Proposal。
- **`/lp` / `/plan`:** duplicated renderingをcanonical architectureとして維持しないPrincipleだけをApproval Scopeに含める。両routeは`NEEDS_EXTERNAL_FOOTPRINT_CHECK`。remove/redirect/repurpose、target/status、`/plan` future intentは未決定。
- **Marketing branch closure:** `READY_FOR_APPROVAL / NOT_APPROVED`。承認候補は`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`。External footprint、implementation、analytics、privacy、marketing contentはtyped handoff。
- **PD-01 Parent:** `PARTIALLY_READY`を維持。PD-01B=`NEEDS_DISCOVERY`のためParent Closureは行わない。
- **Next action:** 明示承認が得られた場合のみPD-54 Explicit Product Owner Approval Record。承認前にsource、route、redirect、metadata、sitemap、analyticsを変更しない。
- **Reference:** [Phase PD-53 Decision Review](../audit/111-pd01-marketing-route-intent-decision-review.md)

#### Phase PD-54 Marketing Route Intent Explicit Product Owner Approval Record

- **Approval Evidence:** 「PD-01のMarketing Route Intent / Canonical・SEO / Campaign・Analytics Proposal、およびMarketing Route Branch Closure Proposalを承認する。」
- **Approval Date / Owner:** 2026-09-07 / Product Owner。
- **Marketing Route Intent:** `/`=`Public Product Marketing Home`。Marketing=`Public Product Communication`、App=`Authenticated Product Operation`。`DECIDED / APPROVED`。
- **Canonical / SEO v1:** one public resource / one canonical URL、self-canonical baseline、internal link/sitemap整合、duplicate非default、private App non-indexing、public URL redirect migration。`DECIDED / APPROVED`。
- **Campaign / Analytics v1:** canonical destination + attribution default、dedicated routeはmanaged exception、attribution/content identity分離、Marketing/Product analytics分離。`DECIDED / APPROVED`。
- **Ownership / stability:** Resourceがcanonical identity、shared SEO layerが生成/検証。Marketing default metadata、Route resource-specific、App private policy。public URL変更にmigration planを要求。`DECIDED / APPROVED`。
- **`/lp` / `/plan`:** duplicated renderingをcanonical architectureとして維持しない。両routeは`NEEDS_EXTERNAL_FOOTPRINT_CHECK`。remove/redirect/repurpose、target/status、`/plan` future intentは未決定。
- **Marketing branch:** `DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`。Closure blocker count=0。
- **Implementation:** `NOT_IMPLEMENTED`。redirect、canonical、metadata、sitemap、analytics、privacy controlsは未実装。
- **PD-01 Parent:** `PARTIALLY_READY`を維持。PD-01B=`NEEDS_DISCOVERY`のためParent Closureは行わない。
- **Next action:** PD-55 PD-01B App Deep-link / State Restoration Contract Discovery。
- **Reference:** [Phase PD-54 Approval Record](../audit/112-pd01-marketing-route-intent-explicit-product-owner-approval-record.md)

#### Phase PD-55 PD-01B App Deep-link / State Restoration Contract Discovery

- **Status:** `COMPLETED / READY_FOR_DECISION_REVIEW`。Product Decisionは未承認。
- **Existing Route Semantics:** PD-01Aの`/app`=App Home / Analysis Entry、`/app/analysis`=Analysis-focused Workspace / Result Entry、shared runtime + distinct semanticsを維持する。
- **Current Evidence (`KNOWN`):** 両routeは同じShellへ`activeOrganizationId`だけを渡し、pathname/queryからresource、tab、Job、Snapshotを復元しない。tab、competitor、draftはlocal state。project preferenceはsession/localStorageに依存し、確認範囲ではOrganization-scopedではない。safe pathname/search return-toとserver-side Organization guardは存在する。
- **Contract Candidate (`PROPOSED / NOT_APPROVED`):** URLはstable selector、Railsはauthorization/canonical state、cacheはoptimization、Frontendはparse/navigation/presentationを所有する。explicit resource failureをlatest/current/別Organizationへsilent fallbackしない。
- **Restoration Model:** Model C — Hybrid Current Pointer + Explicit Historical Resourceを推奨する。`/app/analysis`単体はactive Organizationのserver-authorized current pointer、なければAnalysis Entry / empty state。chronological latestを意味しない。Job IDはprocess/outcome、Snapshot IDはimmutable historical resultを指す。
- **Organization / Share:** explicit resourceではresource-derived Organizationをbackendが検証する。cross-Organization silent switchを行わない。same-user bookmarkとsame-Organization internal shareをPD-01B候補とし、public shareは別Product Decision。
- **Readiness:** Deep-link Contract、State Restoration Contract、Ownership Boundary、PD-01B Overallはいずれも`READY_FOR_DECISION_REVIEW`。
- **Parent impact:** PD-01BがDecision Completeになれば、PD-01 Parentは`READY_FOR_CLOSURE_REVIEW`へ進められる。exact route schemaとimplementationはDecision Closure blockerにしない。
- **Next action:** PD-56 PD-01B App Deep-link / State Restoration Contract Decision Review。
- **Reference:** [Phase PD-55 Contract Discovery](../audit/113-pd01b-app-deeplink-state-restoration-contract-discovery.md)

#### Phase PD-56 PD-01B App Deep-link / State Restoration Contract Decision Review

- **Review status:** `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`。Product Owner Approval Evidence=`NOT_PROVIDED`。
- **Deep-link Final Proposal:** Authenticated stable resource/context/view selectorを、`URL -> authenticated BFF -> Rails authorization/canonical resolution -> Frontend render`で復元する。URLはauthorization proofではない。
- **Source hierarchy:** selectorはexplicit URL identity -> server current pointer -> Organization-scoped preference -> UI default。canonical fact authorityはauthenticated actor -> Rails canonical state -> persisted Job/Snapshot -> validated cache -> transient state。
- **Model disposition:** Model A=`REJECT AS CANONICAL MODEL`、Model B=`KEEP AS STRICT RESOURCE PATTERN`、Model C=`READY_FOR_APPROVAL`。
- **Model C / Route semantics:** `/app`はHome / Analysis Entryを維持しsilent redirectしない。identity-less `/app/analysis`はactive Organizationのserver-authorized current、なければEntry/empty。latestを意味しない。
- **Identity / history:** Project/Target=mutable context、Job=process/outcome、Snapshot=immutable history、current pointer=mutable convenience。Result IDとexact URL shapeはdefer。`latest != current != Strategy source != historical Snapshot`を維持する。
- **Organization / Auth:** explicit resourceはresource-derived/backend-authorized Organization。validated same-origin return-to後に再認可。authorized cross-org route scopeは許容、persistent switchはexplicit、silent switchは禁止。
- **Failure / history:** missing、forbidden、unsupported historical、unavailable等を区別し、explicit linkをcurrent/latest/別resourceへsilent fallbackしない。historical resourceをcurrent semanticsへreinterpretしない。
- **Ownership:** Rails=authorization/canonical state、BFF=session/transport/proxy、Frontend=URL navigation/validated rendering/transient state、cache=non-canonical optimization。
- **Closure Proposal:** Logical Contractの明示承認によりPD-01Bを`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`へ進める。exact schema、API/DB、implementation、public share、draft、UI、E2EはClosure blockerではない。
- **Readiness:** Deep-link、State Restoration、Ownership、Model C、Closure Proposal、PD-01B Overallはいずれも`READY_FOR_APPROVAL / NOT_APPROVED`。
- **Parent impact:** PD-01B承認後、PD-01 Parentは`READY_FOR_CLOSURE_REVIEW`へ進める。他のProduct Decision blockerは確認されていない。
- **Next action:** 明示承認受領時のみPD-57 Explicit Product Owner Approval Record。差戻し時は該当boundaryだけを再Reviewする。
- **Reference:** [Phase PD-56 Decision Review](../audit/114-pd01b-app-deeplink-state-restoration-contract-decision-review.md)

#### Phase PD-57 PD-01B App Deep-link / State Restoration Contract Explicit Product Owner Approval Record

- **Approval Evidence:** 「PD-01B App Deep-link / State Restoration Contract、Model C、およびPD-01B Closure Proposalを承認する。」
- **Approval Date / Decision Owner:** 2026-09-07 / Product Owner。記録日=2026-09-14。
- **Logical Contract:** Deep-link、Restoration、Ownership Boundaryを`DECIDED / APPROVED`として記録した。URL selector -> authenticated BFF -> Rails authorization/canonical resolution -> Frontend render。
- **Model dispositions:** A=`REJECT AS CANONICAL MODEL`、B=`KEEP AS STRICT RESOURCE PATTERN`、C=`DECIDED / APPROVED`。Model Cをv1 Default Restoration Modelとする。
- **Route / Identity:** `/app`=Home / Analysis Entry。identity-less `/app/analysis`=active Organizationのserver-authorized current、なければEntry/empty。Project=mutable context、Job=process/outcome、Snapshot=immutable history、current pointer=mutable relationship。Result ID ownershipとexact URLはdefer。
- **Restoration / Security:** Explicit resourceのOrganizationはRailsがresolve/validate。safe same-origin return-to後に再認可。URL identityはauthorization proofではない。silent Organization switch、silent intent-changing fallback、historical reinterpretを禁止。
- **State / Ownership:** meaningful URL stateとFrontend-local transient stateを分離。cacheはOrganization/resource scoped、version-awareなoptimization。Rails=canonical authority、BFF=auth/session/transport、Frontend=validated rendering/navigation。
- **PD-01B Closure:** `APPROVED`。最終Status=`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`。Closure blocker count=`0`。
- **PD-01 Parent:** `READY_FOR_CLOSURE_REVIEW`へ更新。Parent Closure自体は行わない。
- **Deferred Ledger:** ROUTE / IMPLEMENTATION、DATA / CONTRACT、SOURCE IMPLEMENTATION、PRODUCT、PRESENTATION、ANALYTICS / TESTの6分類。`Deferred != Forgotten`。
- **Implementation:** `NOT_IMPLEMENTED`。URL restoration、explicit Snapshot selection、Organization-scoped current pointer、canonical Rails resource endpointsは既知のImplementation Gap。Decision blockerにはしない。Source変更なし。
- **Next action:** PD-58 PD-01 Parent Closure Review。
- **Reference:** [PD-57 Approval Record / Deferred Ledger](../audit/115-pd01b-app-deeplink-state-restoration-contract-explicit-product-owner-approval-record.md)

#### Phase PD-58 PD-01 Parent Closure Review

- **Review Date / Status:** 2026-09-14 / `COMPLETED / READY_FOR_APPROVAL / NOT_APPROVED`。
- **Child summary:** PD-01A=`DECIDED`（PD-5）、Marketing=`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`（PD-54）、PD-01B=`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`（PD-57）。
- **Consistency:** Route role、public/private、canonical/semantic URL、campaign/analytics、Auth/Organization、current/latest/history、PD-02/PD-04、ownership、fallbackを照合しPASS。新規Product Designなし。
- **Criteria / blockers:** 8/8 PASS、未解決Product Contract Closure blocker=0。Parent最終承認は未取得。
- **Deferred:** Parent Ledger D01–D09へ重複整理。Marketingの旧PD-01B discovery handoffは完了扱い、content/keyword/route setを含む未完了handoffは保持。
- **Implementation:** `NOT_IMPLEMENTED`。`/lp`・`/plan`変更前のexternal footprintは必須、Parent Closureには非blocker。
- **Closure Proposal:** `DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`。Product Owner明示承認前には移行しない。
- **Approval Candidate（未承認）:** 「PD-01 App / Marketing Route Intent、App Deep-link / State Restoration Contract、およびPD-01 Parent Closure Proposalを、Deferred Itemsを後続Phaseへ引き継ぐ条件で承認する。」
- **Inventory impact:** PD-01承認後は主要Route Decision残件を閉じられる。PD-03=`NEEDS_DISCOVERY / CAN_DEFER`と各handoffは残るため、8〜9月棚卸し全体Closureは行わない。
- **Next:** 明示承認後PD-59 Parent Explicit Approval Recordを優先。
- **Reference:** [PD-58 Parent Closure Review / Ledger](../audit/116-pd01-parent-closure-review.md)

#### Phase PD-59 PD-01 Parent Explicit Product Owner Approval Record

- **Approval Evidence:** 「PD-01 App / Marketing Route Intent、App Deep-link / State Restoration Contract、およびPD-01 Parent Closure Proposalを、Deferred Itemsを後続Phaseへ引き継ぐ条件で承認する。」
- **Approval Date / Owner / Record Created Date:** 2026-09-14 / Product Owner / 2026-09-14。
- **Child status:** PD-01A=`DECIDED`、MarketingとPD-01B=`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`を維持。
- **Parent Contract:** Public Root、App Home、Analysis Workspace、public canonical/App semantic URL分離、Model C、backend認可、explicit immutable Snapshot、server current、no silent fallbackを`DECIDED / APPROVED`として記録。
- **Model:** A=`REJECT AS CANONICAL MODEL`、B=`KEEP AS STRICT RESOURCE PATTERN`、C=`DECIDED / APPROVED`を維持。
- **Consistency / Closure evidence:** Child承認3件、cross-branch、PD-02、PD-04整合、Ledger、implementation境界、今回明示承認の9項目を確認。PD-58のReviewを継承し再監査なし。
- **Closure:** Parent=`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`、Closure=`APPROVED`、blocker count=0。
- **Deferred / Implementation:** D01–D09を正式handoffとして保持。`/lp`・`/plan`=`NEEDS_EXTERNAL_FOOTPRINT_CHECK`。Implementation=`NOT_IMPLEMENTED`、Source=`NONE`。
- **Inventory / Next:** 棚卸し全体Closureは未実施。PD-60 Remaining Product Decision Closure AuditでPD-03と残存handoffを確認する。
- **Reference:** [PD-59 Parent Approval Record](../audit/117-pd01-parent-explicit-product-owner-approval-record.md)

#### PD-01A — App Route Role

- **Status:** `DECIDED`
- **Decision:** Option A-A — Distinct Semantic Routes, Shared Runtime。
- **`/app`:** Panoptes App Home / Analysis Entry。
- **`/app/analysis`:** Analysis-focused Workspace / Result Entry。これはRoute Roleであり、正式UI labelではない。
- **Architecture:** 両routeが同じ`PanoptesShellEntryPage`、runtime model、initial `strategy` tabを共有することを許可する。`Distinct Route Role != Distinct Runtime Architecture`。
- **Rationale:** `/app`だけがTop Hero/Searchを持ち、Header/Auth default entryでもある。Search成功後は`/app/analysis`へ明示的に遷移し、同routeではTop Heroを表示しない。A-Aが現在のpresentation/navigation evidenceを最も矛盾なく説明する。
- **Tradeoffs:** URL semanticsが明確になり将来deep-linkを拡張できる一方、現時点ではShell state差がなく、state restoration/share契約は残る。
- **Owner:** Product Owner（Phase PD-5指示でOption A-Aを明示承認）。Consulted: Engineering。
- **Decision Date:** 2026-08-20。
- **Implementation:** `NO_IMMEDIATE_SOURCE_CHANGE`。route、navigation、redirect、metadata、UI label、active tab、pathname mapping変更なし。
- **Exclusions:** tab/project/snapshot/query restoration、reload/bookmark/share、browser back/forward、stale resource behavior。
- **Revisit condition:** route-aware analysis stateまたはshare linkを設計するとき。Product IA変更なしにshared runtimeを分離しない。
- **References:** [PD-5 Decision Audit](../audit/63-pd01a-app-route-role-decision.md)、[PD-4 Discovery](../audit/62-pd01-route-intent-discovery.md)、[Route Ownership](../architecture/frontend-route-ownership.md)

#### PD-01B — App Deep-link / State Restoration Contract

- **Status:** `DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`
- **Logical Contract / Model C:** `DECIDED / APPROVED`。
- **Closure Approval:** `APPROVED`、Closure blocker count=`0`。
- **Approval Evidence:** 「PD-01B App Deep-link / State Restoration Contract、Model C、およびPD-01B Closure Proposalを承認する。」
- **Approval Date / Record Date:** 2026-09-07 / 2026-09-14。
- **Scope:** pathname/queryによるtab・project・snapshot・query復元、reload、bookmark、share、browser back/forward、stale/deleted resource、Organization/permission境界。
- **Implementation boundary:** PD-55/56のEvidenceではroute到達、Search navigation、safe returnは存在するが、URL-driven restorationとexplicit Snapshot選択は未実装。承認済みContractの実装Status=`NOT_IMPLEMENTED`。本Phaseでは再監査・実装していない。
- **Approved Contract:** Model C — Hybrid Current Pointer + Explicit Historical Resource。identity-less `/app/analysis`はserver-authorized current pointer、なければAnalysis Entry / empty。explicit Jobはprocess/outcome、explicit Snapshotはimmutable history。URLはselectorでありauthorization proofではなく、explicit failureをsilent fallbackしない。
- **Owner:** Product Owner。Consulted: Engineering、Security/Auth/Organization、Support/Analytics。
- **Timing:** `BEFORE_CLOSED_BETA`のうち、bookmark/shareまたはroute-aware state公開前。
- **Dependency:** stable resource identifier、Organization authorization、analysis lifecycle、share/privacy policy。
- **Relationship:** PD-01Aをblockしない。PD-01Aからdistinct runtimeやstate mappingを推測しない。
- **Next action:** Parent ClosureはPD-59で完了。exact URL schema、current pointer、DB/OpenAPI/endpoints/Result ID ownership、Rails/BFF/Frontend、public sharing、draft、UI/error mapping、analytics/E2EはDeferred Ledgerで追跡する。
- **References:** [PD-57 Approval Record / Deferred Ledger](../audit/115-pd01b-app-deeplink-state-restoration-contract-explicit-product-owner-approval-record.md)、[Phase PD-56 Decision Review](../audit/114-pd01b-app-deeplink-state-restoration-contract-decision-review.md)、[Phase PD-55 Contract Discovery](../audit/113-pd01b-app-deeplink-state-restoration-contract-discovery.md)

PD-01 ParentはPD-59で正式承認され`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`。Closure blocker=0。`Decision Complete != Implementation Complete`を維持し、棚卸し全体Closureは後続へ送る。

### PD-02 — Score / Common Axes Contract

- **Status:** `DECIDED / COMPLETE`
- **Closure disposition:** `CLOSE_WITH_DEFERRED_ITEMS / CLOSED_WITH_DEFERRED_ITEMS`
- **Closure metadata:** 2026-08-24、Decision Owner=Product Owner、Closure blocker count=0。
- **Decision result:** PD-02A〜DのDecision scopeと後続Validation/Implementation/PD-04/Presentation handoffを含むParent Closureが明示承認された。
- **Current contract (`KNOWN`):** Axis Contract v1、0–100 presentation boundary、Observation/Formula/Wire logical contract、Missing/Partial/Eligibility Treatment Model Bが承認済み。Exact Parametersは未決定、Calibrationとimplementationは未完了。
- **Deferred classes:** `VALIDATION_HANDOFF`、`IMPLEMENTATION_HANDOFF`、`PD-04_HANDOFF`、`PRESENTATION_HANDOFF`。
- **Dependencies:** Parent Decisionは完了。Calibration、physical schema、implementation、PD-04 workflowsは後続handoffでありClosure blockerではない。
- **Owner:** Product Owner（Accountable）。Consulted: Analysis/Data、Backend/API、Frontend/Product Design。
- **Decision timing:** Closed。Reopenは具体的なsemantic Product Decisionまたはapproved contract変更が必要な場合に限る。
- **Recommended next action:** PD-04 DecisionはPD-51で完了。Validation / Calibration、Registry/Wire/DB/OpenAPI、Formula実装、Presentationは承認済みLedgerに従う。
- **Decision record:** Product Ownerが2026-08-24にPD-47 `CLOSE_WITH_DEFERRED_ITEMS`を明示承認。Parent=`DECIDED / COMPLETE`。PD-02A=`DECIDED`、PD-02B=`DECIDED / COMPLETE`、PD-02C=`DECISION_COMPLETE`、PD-02D=`DECISION_COMPLETE`。Exact Parameters=`NOT_DECIDED`、Calibration=`NOT_PERFORMED`、Implementation=`NOT_IMPLEMENTED`。source formula/schema変更なし。
- **References:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)、[PD-27 Approval Record](../audit/85-pd02b-axis-order-versioning-explicit-product-owner-approval-record.md)、[B-3O analysis](../audit/50-competitor-company-card-analysis.md)、[B-3T closure](../audit/58-frontend-inventory-parent-closure-review.md)

#### Phase PD-6 Data Dictionary Discovery

- **Status:** `NEEDS_DISCOVERY`を維持する。正式label/formula/schemaを決定していない。
- **Detail parent artifact:** [Score / Axis Data Dictionary — Draft](./score-axis-data-dictionary.md)
- **Evidence (`KNOWN`):** Frontend fixture/mappingに6 candidate keysがある。Selfはfull labels、Competitorは`差別化`/`意思決定`のshort labelsを使う。5 definition sets、4 order variants、axis-related label variants 17件を確認した。Axis/Aggregate UIは0–100を前提にclampする。
- **Formula evidence:** ring/radarのangle/percentageはpresentation変換。Competitor aggregate→6 axes offset、Self benchmark fallback/threshold、Strategy fit/improvement derivationは`PRODUCT_LOGIC_SUSPECTED`でありProduct formulaにしない。
- **Backend dependency:** OpenAPI 18 operations、Canonical BFF、Rails schema/model/serializerにscore/axis contractがない。`BACKEND_CONTRACT_REQUIRED`。
- **Evidence gaps:** canonical ID/name/order、overall/layer関係、scale/decimal/rounding、formula/weight/eligibility、tone threshold、missing/partial completeness、formula version/provenance。
- **Decision questions:** 正式ID/名称/short label/order、0–100/decimal/rounding、missing、overall/layer、tone、visualization、cross-feature reuse、Backend ownership、`partially_completed`の15問をData Dictionaryへ記録した。
- **Owner:** `OWNER_REQUIRED`。Product Owner + Analysis/Data OwnerのJoint Decisionを推奨。Consulted: Backend/API、Design、Frontend。
- **Readiness:** display scaleとpresentation angle/clamp boundaryは`READY_FOR_DECISION`。naming/ID/order/formula/toneは`NEEDS_DISCOVERY`。Backend schemaとmissing/partialは`BLOCKED`。
- **Standardization impact:** canonical label/ID/order、semantic score colors、shared threshold、missing/partial regulationは`BLOCKING`。Shared visual componentは`PARTIAL`。generic tokens、responsive、accessibility、directory taxonomy、Tailwind mechanicsは`NON_BLOCKING`。
- **Next action:** candidate 6 keysと4 order variantsを実データ例へmappingし、Product/Analysis/Backendがscale、overall/layer、formula ownership、missing/completenessを埋めたDecision worksheetをreviewする。
- **Decision record:** 未決定。source、label、formula、threshold、type、fixture、Backend/BFF/OpenAPI変更なし。
- **References:** [PD-6 Audit](../audit/64-pd02-score-common-axes-data-dictionary-discovery.md)、[Company Card Audit](../audit/50-competitor-company-card-analysis.md)、[Self Audit](../audit/48-self-analysis-overview-panel-analysis.md)

#### Phase PD-7 PD-02A Display Scale & Presentation Boundary Decision

- **Parent status:** PD-02は`NEEDS_DISCOVERY`を維持する。
- **PD-02A status:** `DECIDED`（2026-08-20）。Phase PD-7指示書による明示的Decision。
- **Selected options:** Display Option A（Frontend standard display scale 0–100）とBoundary Option P-A（known Product scoreをvisualizationのためだけに変換）を採用する。
- **Decision 1:** Product-facing score/axisのFrontend表示尺度は0–100。0はminimum displayed、100はmaximum displayedであり、良否・完全性の意味は定義しない。
- **Decision 2:** Presentationはrendering safetyのため0–100 clampを行える。
- **Decision 3:** clamp、ring angle、percentage width、radar coordinate、finite-value safetyはbusiness/raw valueをmutationまたは再定義しない。
- **Decision 4:** aggregation、normalization semantics、weight、threshold、eligibility、rankingはPresentation外である。
- **Excluded:** decimal/rounding、missing meaning、semantic color、24°/30°accent、Self 75/60、Competitor synthetic offset、Strategy derivation、Backend raw scale/schema。
- **Sub-decisions:** PD-02B Canonical Axis Identity=`NEEDS_DISCOVERY`、PD-02C Score Formula & Backend Contract=`BLOCKED`、PD-02D Missing / Partial Score Contract=`BLOCKED`。
- **Standardization:** generic score container、percentage/ring visualization、radar max 100、visual clamp helper、score layout tokenは検討可能。Canonical axis、semantic colors/badges、threshold tone、missing UI、Product formula helperは未解禁。
- **Source impact:** Decision/documentation only。source、helper、type、CSS、fixture、Backend/BFF/OpenAPIを変更しない。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-7 Audit](../audit/65-pd02a-display-scale-presentation-boundary-decision.md)、[Frontend Structure Policy](../architecture/frontend-structure-policy.md)

#### Phase PD-8 PD-02B Canonical Axis Identity Discovery

- **Status:** `NEEDS_DISCOVERY`を維持する。Product Owner承認前にaxis identityを確定しない。
- **Discovery result:** Current design documents、active Self/Competitor、Industry/Self fixtureで同じ6 conceptが反復する。17 exact label variants、6 candidate keys、4 order variantsを再分類した。
- **Semantic evidence:** 価値訴求、情報階層、導線強度、信頼構造のbase labelはsurface間で`SAME_SEMANTICS`。`差別化`/`差別化明確性`と`意思決定`/`意思決定支援`は`LIKELY_SAME`のshort-label hypothesis。`信頼根拠`、`信頼補強`、`差別化指数`はfixture/action差として分離する。
- **Candidate IDs:** `valueProposition`、`informationHierarchy`、`trustStructure`、`differentiationClarity`、`decisionSupport`は`KEEP_CANDIDATE`。`funnelStrength`はnavigation/pathwayまで含むため`RENAME_CANDIDATE`。
- **Canonical ID:** cross-layer canonical IDは存在しない。Frontend domain formはcamelCaseを推奨候補とするが、Backend wire formは決めない。
- **Order:** P/A/B/Cの4 variants。O-A（one Product canonical order）を推奨しPをfirst sequence candidateとするが、active UIのAとの差にProduct rationaleがなく未決定。
- **Ready sub-items:** Axis Set、Semantic Equivalence、Canonical Label、Short Labelは`READY_FOR_DECISION`。
- **Unknown sub-items:** Canonical ID、Canonical Order、Axis Definition、Versioningは`NEEDS_DISCOVERY`。
- **Blocked sub-items:** Backend Wire IDはPD-02C依存で`BLOCKED`。
- **Owner:** Product Owner + Analysis/Data OwnerのJoint Decision。Consulted: Design、Frontend、Backend/API。
- **Dependencies:** PD-02BはPD-02Cのformula output/Backend schemaとPD-02Dのmissing-axis identityに先行する。PD-02Aの0–100 display contractは変更しない。
- **Decision timing:** ready 4 sub-itemsは次Reviewへ進める。ID/order/definitionは追加Evidence後、Backend wire IDはPD-02Cで扱う。
- **Standardization:** 決定後にcanonical axis type/label metadata/shared radar orderを解禁可能。現時点でsource label/key/order、semantic color、Backend enum、formula helperを変更しない。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-8 Audit](../audit/66-pd02b-canonical-axis-identity-discovery.md)、[Self Audit](../audit/48-self-analysis-overview-panel-analysis.md)、[Competitor Audit](../audit/46-competitor-expanded-card-analysis.md)

#### Phase PD-9 PD-02B Axis Set & Label Identity Decision Review

- **Review status:** `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`。Phase指示書は推奨Decisionを示すが、Product Ownerの明示承認、owner名、Decision Dateを含まないため`DECIDED`へ進めない。
- **PD-02B overall:** `NEEDS_DISCOVERY`を維持。Canonical ID、Canonical Order、Axis Definition、Versioningが残り、Backend Wire IDは`BLOCKED`。
- **Axis Set sub-status:** `READY_FOR_DECISION`。AS-A（現行6軸をFormal Common Axis Setとする）を推奨するが未承認。
- **Label Identity sub-status:** `READY_FOR_DECISION`。6 canonical Japanese labels、governed short-label policy、2 equivalence pairsを推奨するが未承認。
- **Formal label proposal:** 価値訴求、情報階層、導線強度、信頼構造、差別化明確性、意思決定支援。
- **Short-label proposal:** `差別化`は`差別化明確性`、`意思決定`は`意思決定支援`の同一Axis presentation aliasとする。Feature独自の新規短縮は許可しない。
- **Self / Competitor:** 同一Common 6 Axis Identityの採用を推奨。score、formula、evidence、presentationの同一化は含まない。
- **Industry:** 同一6 axis conceptへ整合する方向を推奨。fixture中心のためBackend/real-data schema/orderは未決定。
- **Strategy:** Common 6 Axisの直接consumerとして定義しない。
- **Decision Owner:** Product Owner（Accountable）+ Analysis/Data Owner（joint domain approval）。Consulted: Design、Frontend、Backend/API。
- **Decision Date:** —。Product Owner approval: `NOT_PROVIDED`。
- **Remaining:** Canonical ID、`funnelStrength` rename、Canonical Order、Feature override、Axis Definitions、Versioning、Backend Wire ID。
- **Dependencies:** Axis identity approvalはPD-02Cのformula output identityとPD-02Dのmissing-axis conceptを明確にするが、Backend schemaはCanonical ID決定まで閉じない。
- **Source impact:** documentation only。Svelte、TypeScript、label、fixture、mapping、radar、order、CSS、Rails、BFF、OpenAPIは変更しない。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-9 Audit](../audit/67-pd02b-axis-set-label-identity-decision.md)、[PD-8 Discovery](../audit/66-pd02b-canonical-axis-identity-discovery.md)

#### Phase PD-10 PD-02B Product Owner Approval Check

- **Approval status:** `NOT_PROVIDED`。指示書に承認対象と承認条件はあるが、Product Ownerの明示承認文はない。
- **Approval wording:** —。
- **Decision Date:** —。
- **Decision Owner:** Product Owner（approval authority）。Analysis/Data OwnerはConsulted / Joint Design Responsibility候補だが、Product Owner approvalを代替しない。
- **Axis Set Decision:** `READY_FOR_DECISION`維持。価値訴求、情報階層、導線強度、信頼構造、差別化明確性、意思決定支援の6軸proposalは不変。
- **Label Identity Decision:** `READY_FOR_DECISION`維持。6 canonical labels、governed Short Label Policy、2 semantic-equivalence pairsはproposalのまま。
- **Short Label Policy:** `差別化`は`差別化明確性`、`意思決定`は`意思決定支援`の同一Axis presentation aliasとする案。Feature-local arbitrary aliasは禁止する案。どちらも未承認。
- **Self / Competitor:** 同一Formal Common 6 Axis Identityを使う案を維持。score、calculation、evidence、mapping、visualization、threshold、missing behaviorは統一対象外。
- **Industry:** 同一6 Axis Conceptへ整合するProduct方向性をproposalとして維持。Backend schema、real-data contract、ID、order、formulaは未決定。
- **Strategy:** Formal Common 6 Axisの直接consumerとして定義しない。
- **PD-02B overall:** `NEEDS_DISCOVERY`維持。Canonical ID、`funnelStrength` rename、Canonical Order、Definitions、Versioningが残り、Backend Wire IDは`BLOCKED`。
- **Rationale:** Repository evidenceとPD-9 proposalはdecision-readyだが、Product Ownerの決定権限をCodexの推奨で代替しない。
- **Standardization:** 承認前のため新たな解禁はない。Source label/key/order、enum、component、Backend schema、formula/threshold、semantic color、missing-value UIは停止する。
- **PD-02C dependency:** score対象の6-axis proposalは参照可能だが、未承認かつCanonical ID未決定のためBackend schema implementationは開始しない。
- **PD-02D dependency:** six-axis missing/partial conceptはproposalとして参照できるが、schema、fallback、partial semantics、`partially_completed`は未決定。
- **Next review:** Product Ownerから明示承認文、owner identity、approval dateを受け取り、同じproposalをDecision Recordへ変更する。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-10 Audit](../audit/68-pd02b-product-owner-approval-decision-record.md)、[PD-9 Review](../audit/67-pd02b-axis-set-label-identity-decision.md)

#### Phase PD-11 PD-02B Explicit Product Owner Approval Record

- **Approval Evidence:** 「PD-02BのAxis Set & Label Identity Proposalを承認する。」
- **Approval Status:** `APPROVED`。
- **Approval Date:** 2026-08-20。
- **Decision Owner:** Product Owner。Analysis/Data OwnerはConsulted / Joint Design Responsibility。
- **Axis Set:** `READY_FOR_DECISION` → `DECIDED`。Formal Common Axis Setは価値訴求、情報階層、導線強度、信頼構造、差別化明確性、意思決定支援。列挙順はCanonical Orderではない。
- **Label Identity:** `READY_FOR_DECISION` → `DECIDED`。上記6つを正式`canonicalLabel`とする。
- **Short Label Policy:** `DECIDED`。Governed presentation aliasとして許可し、feature-local arbitrary aliasを禁止する。
- **Semantic Equivalence:** `DECIDED`。`差別化`は`差別化明確性`、`意思決定`は`意思決定支援`の同一Axis Identity / short label。
- **Self / Competitor:** 同じFormal Common 6 Axis Identityの利用を`DECIDED`。Score、formula、evidence、mapping、visualization、threshold、missing behaviorは統一しない。
- **Industry:** 同じFormal Common 6 Axis Conceptへ整合する方向を`APPROVED_DIRECTION`。FixtureをBackend contractにしない。
- **Strategy:** Formal Common 6 Axisの直接consumerにしない。
- **PD-02B overall:** `NEEDS_DISCOVERY`維持。Canonical ID、`funnelStrength` rename、Canonical Order、Definitions、Versioningが残り、Backend Wire IDは`BLOCKED`。
- **PD-02 parent:** `NEEDS_DISCOVERY`維持。PD-02B remaining、PD-02C、PD-02Dが未完。
- **PD-02C handoff:** Formal Axis Set / Labels / Semantic EquivalenceをProduct Identityとして参照可能。Canonical ID未決定のためBackend schema implementationはまだ開始しない。
- **PD-02D handoff:** 6 Formal Common Axesをmissing / partial対象として参照可能。Null、fallback、partial completeness、`partially_completed`、Backend representationは未決定。
- **Standardization:** Axis metadata、canonical/short label metadata、Self/Competitor alignment、shared chart labels、accessibility naming、axis-aware component contractのplanningを解禁。ID enum、key/order、Backend schema、formula/threshold、semantic color、missing UI、versioningは実装禁止を維持。
- **Source impact:** documentation only。Svelte、TypeScript、labels、fixture、mapping、order、radar/chart、CSS/Tailwind、Rails、BFF、OpenAPIは変更しない。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-11 Audit](../audit/69-pd02b-explicit-product-owner-approval-record.md)、[PD-10 Approval Check](../audit/68-pd02b-product-owner-approval-decision-record.md)

#### Phase PD-12 PD-02B Canonical ID & Funnel Naming Discovery

- **Scope:** Domain-level Canonical ID候補と`funnelStrength`のsemantic mismatchを調査。Canonical Order、正式Axis Definition本文、Versioning、Backend Wire ID、formula/weight/threshold、missing/partialは決定しない。
- **Existing candidate keys:** `valueProposition`、`informationHierarchy`、`funnelStrength`、`trustStructure`、`differentiationClarity`、`decisionSupport`。Frontend fixture/mapping candidateでありCanonical IDではない。
- **Format proposal:** Frontend domain IDは`camelCase`を推奨。Backend Wire ID formatは別Decisionとして`BLOCKED`を維持。
- **Per-axis readiness:** `valueProposition`、`informationHierarchy`、`trustStructure`、`differentiationClarity`、`decisionSupport`は`KEEP / READY_FOR_DECISION`。Product Owner approvalまでは未決定。
- **Funnel axis:** `funnelStrength`は`RENAME / NEEDS_DISCOVERY`。EvidenceはCTA、link/navigation、internal path、page transition、user flow、conversion pathを支持し、conversion funnelだけには限定しない。
- **Recommended replacement candidate:** `userFlowQuality`。`navigationFlowQuality`を第二候補とする。いずれもProposalであり決定ではない。
- **Boundary:** 導線軸は移動・順序・到達可能性・CTA/path visibility、意思決定支援はpricing/comparison材料・friction reduction・decision readinessを所有する。
- **Legacy policy proposal:** 1 Axis = 1 Canonical ID。異なる現行fixture keyはmapping compatibilityを経て段階移行し、canonical aliasとして複数維持しない。
- **PD-02B overall:** `NEEDS_DISCOVERY`維持。5 IDはDecision Review可能だが、導線軸のAxis Definitionが`BLOCKING_DEPENDENCY`。
- **Unchanged:** Canonical Order / Versioningは`NEEDS_DISCOVERY`、Backend Wire IDは`BLOCKED`。Source、type、fixture、label、order、Rails/BFF/OpenAPIは変更なし。
- **Owner:** Product Owner + Analysis/Data Owner。Consulted: Backend/API、Frontend。
- **Next review:** 5件のCanonical ID Decision Review。導線軸は独立したAxis Definition Evidence Workshopでincluded/excluded semanticsを承認可能にする。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-12 Audit](../audit/70-pd02b-canonical-id-funnel-naming-discovery.md)、[PD-11 Approval Record](../audit/69-pd02b-explicit-product-owner-approval-record.md)

#### Phase PD-13 PD-02B Five Canonical IDs Decision Review

- **Review status:** `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`。
- **Approval evidence:** `NOT_PROVIDED`。Phase指示書にFive Canonical IDsまたは各IDを承認する明示文はない。
- **Decision date / owner:** 未記録。Accountable候補はProduct Owner、Joint Decision責任はAnalysis/Data Owner。Backend/API、FrontendはConsulted。
- **ID format recommendation:** Frontend / Product Domainは`camelCase`。`READY_FOR_DECISION`を維持し、Backend Wire ID formatには適用しない。
- **Value Proposition:** `valueProposition`を推奨。Alternativesは`valueCommunication`、`valueCommunicationClarity`。Final statusは`READY_FOR_DECISION`。
- **Information Hierarchy:** `informationHierarchy`を推奨。Alternativesは`contentHierarchy`、`informationStructure`。Final statusは`READY_FOR_DECISION`。
- **Trust Structure:** `trustStructure`を推奨。Alternativesは`trustSignals`、`credibilityStructure`、`trustEvidence`。Final statusは`READY_FOR_DECISION`。
- **Differentiation Clarity:** `differentiationClarity`を推奨。Alternativesは`competitiveDifferentiation`、`positioningClarity`、`distinctivenessClarity`。Final statusは`READY_FOR_DECISION`。
- **Decision Support:** `decisionSupport`を推奨。Alternativesは`decisionReadiness`、`decisionEnablement`、`decisionClarity`。Final statusは`READY_FOR_DECISION`。
- **Decision granularity:** 5 IDは個別Decisionで、All-or-Nothingではない。
- **Identity policy:** `1 Axis = 1 Canonical ID`を推奨するが、明示承認がないため`READY_FOR_DECISION`。
- **Legacy impact:** 5 recommended IDsは現行candidate keysと一致するため承認時も`NO_IMMEDIATE_RENAME_REQUIRED`。正式metadata接続時にfixture/mappingを再評価する。
- **Funnel exclusion:** 導線軸は対象外。`funnelStrength`は`RENAME_CANDIDATE / NOT_CANONICAL`、`userFlowQuality`は`PROPOSED / NEEDS_DISCOVERY`。
- **Remaining boundaries:** Backend Wire ID=`BLOCKED`。Canonical Order、Axis Definitions、Versioning=`NEEDS_DISCOVERY`。
- **Overall:** PD-02BとPD-02 parentは`NEEDS_DISCOVERY`を維持する。
- **Standardization:** 新たな解禁なし。Source key/enum/mapping/fixture/order、Backend schema、formula/threshold、semantic color、missing/versioned contractは引き続き禁止。
- **Source impact:** documentation only。Frontend Inventory、Svelte/TypeScript、Rails/BFF/OpenAPI変更なし。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-13 Audit](../audit/71-pd02b-five-canonical-ids-decision-review.md)、[PD-12 Discovery](../audit/70-pd02b-canonical-id-funnel-naming-discovery.md)

#### Phase PD-14 PD-02B Five Canonical IDs Explicit Product Owner Approval Record

- **Approval Evidence:** 「PD-02BのFive Canonical IDs Proposalを承認する。」
- **Approval Status:** `APPROVED`。
- **Approval Date:** 2026-08-20。
- **Decision Owner:** Product Owner。Analysis/Data OwnerはConsulted / Joint Design Responsibility。
- **Canonical ID Format:** Frontend / Product Domain formatを`camelCase / DECIDED`とする。Backend Wire ID formatではない。
- **Value Proposition:** 価値訴求 → `valueProposition / DECIDED`。
- **Information Hierarchy:** 情報階層 → `informationHierarchy / DECIDED`。
- **Trust Structure:** 信頼構造 → `trustStructure / DECIDED`。
- **Differentiation Clarity:** 差別化明確性、short label 差別化 → `differentiationClarity / DECIDED`。
- **Decision Support:** 意思決定支援、short label 意思決定 → `decisionSupport / DECIDED`。
- **Identity Policy:** `1 Formal Axis Identity = 1 Canonical ID / DECIDED`。Legacy/fixture keyはcompatibility mappingであり複数Canonical IDではない。
- **Migration:** 5 IDsは現行candidate keysと一致するため`NO_IMMEDIATE_RENAME_REQUIRED`。現行fixture/mappingを正式metadata contractとして認定しない。
- **Funnel exclusion:** 導線軸は承認対象外。`funnelStrength`=`NOT_CANONICAL / RENAME_CANDIDATE`、`userFlowQuality`=`PROPOSED / NEEDS_DISCOVERY`。
- **Canonical ID overall:** `5 / 6 DECIDED`だが全体は`NEEDS_DISCOVERY`。
- **Remaining boundaries:** Canonical Order / Axis Definitions / Versioning=`NEEDS_DISCOVERY`、Backend Wire ID=`BLOCKED`。
- **PD-02B / PD-02:** 両方`NEEDS_DISCOVERY`を維持。
- **PD-02C handoff:** 決定済み5 IDsをProduct Identityとして参照可能。Funnel ID未決定のためFull 6-axis Backend schema implementationは開始しない。
- **PD-02D handoff:** Formal Axis Setと5 IDsを参照可能。Funnel ID、missing/partial representation、fallback、`partially_completed` semanticsは未決定。
- **Standardization:** metadata key、stable domain identifiers、label lookup、accessibility ID、Self/Competitor mapping alignment、axis-aware contract、domain typeのPlanningを解禁。Source実装は別Phase。
- **Source impact:** documentation only。Svelte/TypeScript/fixture/mapping/order/CSS/Tailwind/Rails/BFF/OpenAPI変更なし。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-14 Approval Record](../audit/72-pd02b-five-canonical-ids-explicit-approval-record.md)、[PD-13 Decision Review](../audit/71-pd02b-five-canonical-ids-decision-review.md)

#### Phase PD-15 PD-02B Funnel Axis Definition Evidence Workshop

- **Workshop status:** `DISCOVERY_COMPLETE`。Product Decision/approvalは行っていない。
- **Starting state:** 導線強度labelは`DECIDED`、Canonical IDは`NEEDS_DISCOVERY`。`funnelStrength`は`NOT_CANONICAL / RENAME_CANDIDATE`、`userFlowQuality`は`PROPOSED`。
- **Evidence result:** Current documentation、production presentation、fixture、preview/test、legacy inputsは、CTA・internal links・navigation・page transitionsによるon-site path supportへ収束する。Canonical production score formulaは`UNKNOWN / NOT_CONNECTED`。
- **Definition proposal:** 次Actionが識別でき、主要destinationまでのpathがCTA/link/navigation/page transitionで接続されている度合い。Actual click/conversionではなくobservable structural clarity/connectivity/continuityを評価する。
- **Primary object:** User path / Page sequence。Conversion funnelは一類型でありAxis全体ではない。
- **Included:** CTA、internal links、path continuity/completeness、dead ends、stage coverage、navigation reachability、conversion path。CTA wordingとsticky/repeated CTAは限定的。
- **Excluded:** CTR/CVR、session/attribution、lead/revenue、CRM/sales、off-site journey、intent prediction、actual outcomes。
- **Adjacent boundaries:** 情報構造、判断材料、value/trust/differentiation contentの質は各Formal Axisが所有し、Funnel Axisはnext actionとmovement pathを所有する。
- **Definition readiness:** `READY_FOR_DECISION / NOT_APPROVED`。
- **Canonical ID readiness:** `READY_FOR_DECISION / NOT_APPROVED`。Recommended candidateは`userFlowQuality`。
- **Legacy key:** `funnelStrength`はcanonical recommendationから除外するが、正式DecisionまでstatusとSourceを変更しない。
- **Owner:** Product Owner + Analysis/Data Owner。Consulted: Frontend、Backend/API、Design。
- **Dependencies:** Decision後にPD-02C/PD-02Dは6-axis domain identityを参照可能。Formula、wire ID、missing representationは別Decision。
- **Unchanged:** PD-02B / PD-02=`NEEDS_DISCOVERY`、Canonical Order / Versioning=`NEEDS_DISCOVERY`、Backend Wire ID=`BLOCKED`。
- **Source impact:** documentation only。Frontend Inventory、Svelte/TypeScript、fixture/mapping/order、Rails/BFF/OpenAPI変更なし。
- **Next review:** Funnel Axis Definition & Canonical ID Decision Review。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-15 Audit](../audit/73-pd02b-funnel-axis-definition-evidence-workshop.md)、[PD-14 Approval Record](../audit/72-pd02b-five-canonical-ids-explicit-approval-record.md)

#### Phase PD-16 PD-02B Funnel Axis Definition & Canonical ID Decision Review

- **Review status:** `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`。
- **Approval Evidence:** `NOT_PROVIDED`。DefinitionまたはCanonical IDの明示承認文はない。
- **Decision Owner / Date:** 未記録。推奨Joint OwnerはProduct Owner + Analysis/Data Owner。Frontend、Backend/API、DesignはConsulted。
- **Definition recommendation:** 次Actionを識別でき、CTA/link/navigation/page transitionにより主要destinationまでのpathが途切れず接続されている度合い。
- **Definition nature:** Primary object=`User Path / Page Sequence`、measurement=`Observable Structural Support`、Behavioral Performance=`EXCLUDED`。
- **Definition status:** `READY_FOR_DECISION / NOT_APPROVED`。
- **Canonical ID recommendation:** `userFlowQuality`。`strength`よりclarity/continuity/completeness/reachabilityを表す`quality`が適合。
- **ID status:** `userFlowQuality = KEEP_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`。
- **Legacy ID:** `funnelStrength = NOT_CANONICAL / RENAME_CANDIDATE`。Canonicalとしてreject推奨だが正式status/Sourceは変更しない。
- **Alternatives:** `siteFlowQuality`、`pathwayQuality`、`pathContinuity`、`navigationQuality`、`flowQuality`を比較済み。
- **Decision granularity:** DefinitionとCanonical IDは個別承認可能。
- **Canonical ID overall:** `5 / 6 DECIDED / NEEDS_DISCOVERY`を維持。
- **PD-02B / PD-02:** `NEEDS_DISCOVERY`を維持。
- **Remaining:** Canonical Order、other five Definitions、Versioning=`NEEDS_DISCOVERY`、Backend Wire ID=`BLOCKED`。
- **Dependencies:** 承認後、PD-02C/PD-02Dは6-axis domain identityを参照可能。Formula、Backend schema/wire ID、missing/partial representationは別Decision。
- **Standardization:** 明示承認がないため新規解禁なし。Source rename/type/fixture/mapping/component/order、Rails/BFF/OpenAPI変更なし。
- **Next review:** Funnel Axis Definition & Canonical ID Explicit Product Owner Approval。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-16 Audit](../audit/74-pd02b-funnel-axis-definition-canonical-id-decision-review.md)、[PD-15 Workshop](../audit/73-pd02b-funnel-axis-definition-evidence-workshop.md)

#### Phase PD-17 PD-02B Funnel Axis Explicit Product Owner Approval Record

- **Approval Evidence:** 「PD-02BのFunnel Axis Definition & Canonical ID Proposalを承認する。」
- **Approval Date:** 2026-08-20。
- **Decision Owner:** Product Owner。
- **Approval Status:** `APPROVED`。
- **Funnel Definition:** 「ユーザーが次に取るべきActionを識別でき、CTA・リンク・ナビゲーション・ページ遷移によって、主要な目的地点までの経路が途切れず接続されている度合い。」を`DECIDED`。
- **Evaluation contract:** Primary object=`User Path / Page Sequence`、measurement=`Observable Structural Support`、Behavioral Performance=`EXCLUDED`。
- **Included / Excluded:** PD-16でreviewしたCTA/navigation/path/transition semanticsを正式採用し、CTR/CVR/session/attribution/revenue/CRM/off-site/actual outcomeを除外。
- **Adjacent boundaries:** `informationHierarchy`、`decisionSupport`、`valueProposition`、`trustStructure`、`differentiationClarity`とのPD-16 boundaryを正式採用。
- **Canonical ID:** `userFlowQuality = DECIDED`。`camelCase` policyに整合。
- **Legacy ID:** `funnelStrength = NOT_CANONICAL / RENAME_CANDIDATE / LEGACY_MIGRATION_SOURCE`。Canonical aliasにしない。
- **Canonical ID overall:** `5 / 6 DECIDED / NEEDS_DISCOVERY` → `6 / 6 DECIDED / DECIDED`。
- **1 Axis = 1 Canonical ID:** 整合。Formal Common 6 AxisすべてのProduct Domain IDが確定。
- **PD-02B / PD-02:** `NEEDS_DISCOVERY`を維持。
- **Remaining:** Canonical Order、other five Definitions、Versioning=`NEEDS_DISCOVERY`、Backend Wire ID=`BLOCKED`。
- **Handoff:** PD-02C/PD-02Dは6-axis domain identityを参照可能。Formula、Backend schema/wire、missing/partial representationは別Decision。
- **Standardization:** 6-axis metadata/type/lookup/accessibility/mapping/Industry alignment/Funnel migration planningを解禁。Source実装は行わない。
- **Next review:** Canonical Order Discoveryを第一推奨。Remaining Axis Definitions Discoveryを代替とする。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-17 Approval Record](../audit/75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)、[PD-16 Decision Review](../audit/74-pd02b-funnel-axis-definition-canonical-id-decision-review.md)

#### Phase PD-18 PD-02B Remaining Five Axis Definitions Discovery

- **Status:** `DISCOVERY_COMPLETE / AWAITING_DECISION_REVIEW`。Product Owner approvalなし。
- **Starting state:** Formal Axis Set / Labels / IDsはDECIDED、Canonical IDsは6/6 DECIDED、Funnel DefinitionはDECIDED。残り5 Definitionは未決定。
- **`valueProposition`:** Value Messaging / Proposition Communicationを評価。absolute value/benefit/offerとrelative differentiationを分離。`READY_FOR_DECISION / NOT_APPROVED`。
- **`informationHierarchy`:** Content Structure / Information Hierarchyを評価。information grouping/orderとpath/decision-content sufficiencyを分離。`READY_FOR_DECISION / NOT_APPROVED`。
- **`trustStructure`:** Trust Evidence / Credibility Structureを評価。FAQ/caseはcontent purposeでDecision Supportと分離。`READY_FOR_DECISION / NOT_APPROVED`。
- **`differentiationClarity`:** Competitive Positioning / Differentiating Messageを評価。explicit comparisonを必須にせずevidence-supported uniquenessを含む。`READY_FOR_DECISION / NOT_APPROVED`。
- **`decisionSupport`:** Decision Information / Decision Readiness Supportを評価。pricingはcontextual sufficiencyとし、CTA/pathとは分離。`READY_FOR_DECISION / NOT_APPROVED`。
- **Evidence classification:** 主Definitionは`OBSERVABLE_FROM_SITE`。actual outcome、behavior analytics、external performanceは除外。
- **Boundary result:** 6軸Cross-Axis Matrix、Multi-Axis Evidence Policy、Primary/Supporting Evidence candidateを整理。Formula/weightは決定していない。
- **Owner:** Product Owner + Analysis/Data Owner。Consulted: Frontend、Backend/API、Design。
- **PD-02B / PD-02:** `NEEDS_DISCOVERY`を維持。
- **Dependencies:** DefinitionはCanonical Order、PD-02C Formula、PD-02D Missing / Partial、Versioningの入力。Backend Wire IDは`BLOCKED`。
- **Source impact:** Documentationのみ。Source、fixture、mapping、order、Rails/BFF/OpenAPI変更なし。
- **Next review:** Remaining Five Axis Definitions Decision Review。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-18 Discovery](../audit/76-pd02b-remaining-five-axis-definitions-discovery.md)、[PD-17 Approval Record](../audit/75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)

#### Phase PD-19 PD-02B Remaining Five Axis Definitions Decision Review

- **Review status:** `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`。
- **Approval Evidence / Product Owner Decision:** `NOT_PROVIDED`。承認文例はactual approvalとして扱わない。Decision Owner / Dateは未記録。
- **`valueProposition`:** Absolute value/benefit/problem/offer communicationを評価するFinal Proposal。`READY_FOR_DECISION / NOT_APPROVED`。
- **`informationHierarchy`:** Information order/hierarchy/groupingのObservable Structural Qualityを評価するFinal Proposal。`READY_FOR_DECISION / NOT_APPROVED`。
- **`trustStructure`:** Proof/authority/transparencyの提示・構成を評価するFinal Proposal。`READY_FOR_DECISION / NOT_APPROVED`。
- **`differentiationClarity`:** Relative distinctiveness/reason-to-chooseを評価し、supportable implicit uniquenessを許可するFinal Proposal。`READY_FOR_DECISION / NOT_APPROVED`。
- **`decisionSupport`:** Choice/contract informationのcontextual sufficiencyを評価し、non-public pricingを自動減点しないFinal Proposal。`READY_FOR_DECISION / NOT_APPROVED`。
- **Boundaries:** Value vs Differentiation、Hierarchy vs Flow、Hierarchy vs Decision、Trust vs Decision、Decision vs Flowをreview済み。
- **Multi-Axis Evidence Policy:** `READY_FOR_DECISION / NOT_APPROVED`。Semantic reuseを許可し、Formula double counting policyとは分離。
- **Primary / Supporting Evidence Policy:** conceptは`READY_FOR_DECISION / NOT_APPROVED`。WeightはPD-02Cへ送る。
- **FAQ:** UI形式ではなくcontent purposeでTrust / Decision / otherへ分類。
- **Definition overall:** `1 / 6 DECIDED`、`5 / 6 READY_FOR_DECISION / NOT_APPROVED`、overall `NEEDS_DISCOVERY`。
- **PD-02B / PD-02:** `NEEDS_DISCOVERY`。Canonical Order / Versioning=`NEEDS_DISCOVERY`、Backend Wire ID=`BLOCKED`。
- **Source impact:** Documentationのみ。Source、fixture、mapping、order、Rails/BFF/OpenAPI変更なし。
- **Next review:** Remaining Five Axis Definitions Explicit Product Owner Approval。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-19 Decision Review](../audit/77-pd02b-remaining-five-axis-definitions-decision-review.md)、[PD-18 Discovery](../audit/76-pd02b-remaining-five-axis-definitions-discovery.md)

#### Phase PD-20 PD-02B Remaining Five Axis Definitions Explicit Product Owner Approval Record

- **Approval Evidence:** 「PD-02BのRemaining Five Axis Definitions Proposalを承認する。」
- **Approval Status:** `APPROVED`。
- **Approval Date:** 2026-08-20。
- **Decision Owner:** Product Owner。
- **`valueProposition`:** Formal Definition、Primary Object、Included / Excluded Semanticsを`DECIDED`。
- **`informationHierarchy`:** Formal Definition、Primary Object、Included / Excluded Semanticsを`DECIDED`。
- **`trustStructure`:** Formal Definition、Primary Object、Included / Excluded Semanticsを`DECIDED`。
- **`differentiationClarity`:** Formal Definition、Primary Object、Included / Excluded Semanticsを`DECIDED`。
- **`decisionSupport`:** Formal Definition、Primary Object、Included / Excluded Semanticsを`DECIDED`。
- **Definition overall:** `1 / 6 DECIDED / NEEDS_DISCOVERY`から`6 / 6 DECIDED / DECIDED`へ遷移。
- **Cross-Axis Boundaries:** Value vs Differentiation、Hierarchy vs Flow、Hierarchy vs Decision、Trust vs Decision、Decision vs Flowを`DECIDED`。PD-17のFunnel boundariesと矛盾なし。
- **Multi-Axis Evidence Policy:** `DECIDED`。同一observable evidenceのsemantic reuseを許可し、Axisごとの評価観点を分離。
- **Formula Double Counting:** `NOT_DECIDED`。Score contribution、Weight、Deduplication Formula、Evidence Count CapとともにPD-02Cへ送る。
- **Primary / Supporting Evidence:** PD-19 ScopeとFinal Proposalに明示されていたためconceptを`DECIDED`。Weight、required count、score contribution、thresholdは`NOT_DECIDED`。
- **FAQ Policy:** content purposeによる分類を`DECIDED`。
- **Non-public Pricing:** contextual sufficiencyを認め、自動low scoreとしないPolicyを`DECIDED`。
- **Explicit / Implicit Differentiation:** observable and supportableなimplicit uniquenessを許可するPolicyを`DECIDED`。
- **Observable Evidence Boundary:** public site上のobservable evidenceを対象とし、actual behavior/outcome等を除外する境界を`DECIDED`。
- **Canonical ID overall:** `6 / 6 DECIDED`を維持。
- **Canonical Order / Versioning:** `NEEDS_DISCOVERY`。
- **Backend Wire ID:** `BLOCKED`。
- **PD-02B / PD-02:** 未決項目が残るため`NEEDS_DISCOVERY`を維持。
- **PD-02C handoff:** Identity + Meaningを正式参照可能。Backend Contract dependencyの`BLOCKED`は解除しない。
- **PD-02D handoff:** 6 AxisのID / Label / Definitionを正式参照可能。Missing / Partial Contractの`BLOCKED`は解除しない。
- **Source impact:** Documentationのみ。Source、fixture、mapping、order、Frontend Inventory、Rails、BFF、OpenAPI変更なし。
- **Next review:** PD-02B Canonical Order Discovery。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-20 Approval Record](../audit/78-pd02b-remaining-five-axis-definitions-explicit-approval-record.md)、[PD-19 Decision Review](../audit/77-pd02b-remaining-five-axis-definitions-decision-review.md)、[PD-17 Funnel Approval](../audit/75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)

#### Phase PD-21 PD-02B Canonical Order Discovery

- **Status:** `DISCOVERY_COMPLETE / AWAITING_DECISION_REVIEW`。Canonical Order自体は`NEEDS_DISCOVERY`。
- **Approval Evidence:** `NOT_PROVIDED`。Discovery recommendationをDecisionへ昇格しない。
- **Necessity:** Canonical Orderはdocumentation consistency、domain metadata default、accessibility planning、radar comparability、fixture/test drift抑制のため`YES_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`。
- **Semantics:** `DOMAIN_CONCEPTUAL_ORDER / READY_FOR_DECISION / NOT_APPROVED`を推奨。default representational orderであり、UI、User Journey、Analysis Processing、Evidence Collection、Storytelling、Formula、Backend serialization orderではない。
- **Recommended candidate:** Candidate A — `valueProposition` → `informationHierarchy` → `userFlowQuality` → `trustStructure` → `differentiationClarity` → `decisionSupport`。`READY_FOR_DECISION / NOT_APPROVED`。
- **Candidate basis:** historical Product A1–A6とPD-20 documentationで反復され、feature / formula / backendに比較的neutral。Causal sequenceやlinear user journeyとは解釈しない。
- **Existing UI:** Self / Competitor / preview Industryはvalue → flow → differentiation → information → trust → decisionで一致するが、Product rationaleは`UNKNOWN`。現行visual contractとしてのみ扱う。
- **Other orders:** Industry seed Bは`FIXTURE / RATIONALE_UNKNOWN`、mock snapshot Cは`MOCK / DEV_TEST / RATIONALE_UNKNOWN`。Product specへ昇格しない。
- **Override Policy:** OP-B — Domain Orderをdefaultとし、feature-specific reason、owner、explicit configuration、accessibility/radar impact、review conditionを伴うoverrideを許可。`READY_FOR_DECISION / NOT_APPROVED`。
- **Metadata representation:** ordered Canonical ID listをsingle source of truthとするOM-Bを推奨。numeric `order`との二重管理を避ける。Source実装は行わない。
- **Radar:** orderはpolygon shapeへ影響。Candidate A採用時はSelf / Competitor / Industry comparabilityとvisual regressionを別Implementation Phaseで確認。
- **Snapshot lineage:** `SNAPSHOT_ORDER_LINEAGE_UNKNOWN`。Current radar arrayにCanonical ID / order versionなし。
- **Formula / Backend / Missing:** indexやarray positionではなくCanonical IDで識別するProposal。FormulaとPD-02C / PD-02D statusは変更しない。
- **Versioning:** Order変更のsemantic/presentation boundaryは`NEEDS_DISCOVERY`。
- **Owner:** Product Owner。Consulted: Analysis/Data、Frontend、Design、Backend/API。
- **Decision Questions:** 必要性、semantics、Candidate A、UI default、override、Radar、documentation、causal/user-journey除外、versioning、Snapshot lineage、Backend position禁止、ordered ID listを確認。
- **PD-02B / PD-02:** `NEEDS_DISCOVERY`を維持。Backend Wire IDは`BLOCKED`。
- **Next review:** PD-22 Canonical Order Decision Review。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-21 Discovery Audit](../audit/79-pd02b-canonical-order-discovery.md)、[PD-20 Approval Record](../audit/78-pd02b-remaining-five-axis-definitions-explicit-approval-record.md)、[PD-8 Axis Identity Discovery](../audit/66-pd02b-canonical-axis-identity-discovery.md)

#### Phase PD-22 PD-02B Canonical Order Decision Review

- **Review status:** `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`。
- **Necessity proposal:** `YES / READY_FOR_DECISION / NOT_APPROVED`。Formal Common 6 Axisのstable domain listingを持つ。
- **Semantics proposal:** `DOMAIN_CONCEPTUAL_ORDER / READY_FOR_DECISION / NOT_APPROVED`。serialization-neutralなstandard conceptual orderingとする。
- **Order proposal:** Candidate A `valueProposition → informationHierarchy → userFlowQuality → trustStructure → differentiationClarity → decisionSupport` / `READY_FOR_DECISION / NOT_APPROVED`。
- **Candidate review:** BはJourney-specific、CはStorytelling寄りの代替、DはAnalysis-firstで非推奨、EはCurrent Active UI baselineとして保持する。
- **Non-meaning:** importance、priority、weight、causality、maturity、journey、mandatory UI order、processing、collection、serialization position、rankingを意味しない。
- **Override proposal:** OP-B Domain default + explicit feature override / `READY_FOR_DECISION / NOT_APPROVED`。reason、owner、configuration、affected feature、accessibility、comparison impact、review / removal criteriaを要求する。
- **Metadata proposal:** OM-B ordered Canonical ID list as single source of truth / `READY_FOR_DECISION / NOT_APPROVED`。numeric orderとの二重正本を作らない。
- **Radar comparability:** 同一comparison context内で同一Axis Orderを使うPolicyは`READY_FOR_DECISION / NOT_APPROVED`。Canonical Order承認だけではactive Radarをreorderしない。
- **Snapshot / versioning:** `SNAPSHOT_ORDER_LINEAGE_UNKNOWN`、Order Versioning=`NEEDS_DISCOVERY`、Existing Snapshot Migration=`BLOCKED / NOT_PLANNED`。
- **Approval evidence:** `NOT_PROVIDED`。承認文例やDecision ProposalをProduct Owner本人の承認として扱わない。
- **Owner:** Product Owner。Consulted: Analysis/Data Owner、Frontend、Design、Backend/API。
- **Status after review:** Canonical Order、PD-02B、PD-02は`NEEDS_DISCOVERY`。Backend Wire ID、PD-02C、PD-02Dは`BLOCKED`。
- **Implementation:** Documentation / Decision Review only。Source、array、Radar、fixture、mapping、metadata、TypeScript、Svelte、UI、CSS、Tailwind、Rails、BFF、OpenAPI、Formula変更なし。
- **Next review:** 明示承認が得られた場合のみPD-23 Canonical Order Explicit Product Owner Approval Record。代替はSnapshot Order Lineage Evidence WorkshopまたはVersioning Discovery。
- **References:** [PD-22 Decision Review](../audit/80-pd02b-canonical-order-decision-review.md)、[PD-21 Discovery](../audit/79-pd02b-canonical-order-discovery.md)、[Score / Axis Data Dictionary](./score-axis-data-dictionary.md)

#### Phase PD-23 PD-02B Canonical Order Explicit Product Owner Approval Record

- **Approval Evidence:** 「PD-02BのCanonical Order Proposalを承認する。」
- **Approval Date:** 2026-08-20。
- **Decision Owner:** Product Owner。
- **Approval Status:** `APPROVED`。
- **Necessity:** Formal Common 6 AxisはCanonical Orderを持つ。`YES / DECIDED`。
- **Semantics:** Product Domain上のstandard conceptual ordering。`DOMAIN_CONCEPTUAL_ORDER / DECIDED`。
- **Formal Canonical Order:** `valueProposition → informationHierarchy → userFlowQuality → trustStructure → differentiationClarity → decisionSupport`。Candidate Aを正式採用し`DECIDED`。
- **Non-Meaning / Independence:** importance、priority、weight、ranking、causality、maturity、journey、mandatory UI、processing、collection、Backend positionを意味せず、Axis dependency graphではない。`DECIDED`。
- **Domain boundaries:** UI非強制、Journey非同一、Formula ID-based、Processing / Evidence Collection独立、Backend position非依存を`DECIDED`。Backend Wire ID/schema自体は未決定。
- **Override Policy:** OP-B Domain default + explicit feature overrideを`DECIDED`。reason、owner、configuration、affected feature、UX/Product rationale、accessibility、comparison、review/removal criteriaを要求する。
- **Documentation / Accessibility:** Canonical Orderをstandard documentation defaultとし、別orderは目的を明記する。Accessibility planning referenceにはできるがmandatory DOM orderではない。`DECIDED`。
- **Metadata:** OM-B ordered Canonical ID list as single source of truthを`DECIDED`。numeric orderとの二重正本を禁止する。
- **Existing UI:** Self / Competitor / preview Industryのactive UI baselineは変更しない。Canonical Order approvalはimmediate UI migrationではない。
- **Radar comparability:** PD-22でApproval Scope外に分離されていたため`READY_FOR_DECISION / NOT_APPROVED`を維持する。Radar reorderは`VISUAL_REGRESSION_RELEVANT`。
- **Snapshot / versioning:** `SNAPSHOT_ORDER_LINEAGE_UNKNOWN`、Existing Snapshot Migration=`BLOCKED / NOT_PLANNED`、Order Versioning=`NEEDS_DISCOVERY`。
- **Status after approval:** Canonical Order=`DECIDED`。PD-02B / PD-02=`NEEDS_DISCOVERY`、Backend Wire ID / PD-02C / PD-02D=`BLOCKED`。
- **Standardization:** canonicalAxisOrder、documentation normalization、metadata/order model、explicit override、order-aware test/fixture、accessibility/Radar migration assessmentのplanningを解禁。Source migrationは未解禁。
- **Implementation:** Documentation / Decision Record only。Source、array、Radar、fixture、mapping、metadata、TypeScript、Svelte、UI、CSS、Tailwind、Rails、BFF、OpenAPI、Formula変更なし。
- **Next review:** PD-24 Snapshot Order Lineage Evidence Workshopを第一推奨。その後PD-25 Axis / Order Versioning Discovery。SnapshotがVersioningへ影響しないEvidenceが既に十分な場合のみPD-24を省略可能。
- **References:** [PD-23 Approval Record](../audit/81-pd02b-canonical-order-explicit-product-owner-approval-record.md)、[PD-22 Decision Review](../audit/80-pd02b-canonical-order-decision-review.md)、[Score / Axis Data Dictionary](./score-axis-data-dictionary.md)

#### Phase PD-24 PD-02B Snapshot Order Lineage Evidence Workshop

- **Workshop status:** `EVIDENCE_COMPLETE / NO_PRODUCT_DECISION`。
- **Snapshot types:** Production presentation payload/current-stable state、dev mock/localStorage snapshot、dummy/preview fixture、draft OpenAPI record、legacy documentation、planned screenshot artifactを区別した。
- **Production implementation:** Canonical production Snapshot persistenceは`NOT_IMPLEMENTED`。Production business client、Rails schema/routes、canonical BFFにSnapshot business implementationはない。
- **Persistence boundary:** dev mockだけがbrowser localStorage `panoptes.mock.v3_3.state`へFrontend-shaped JSONを保存し、SSRはmodule memory。FixtureをPersistence Contractへ昇格しない。
- **Evidence classification:** Self / Industry mockはlabel-bearing ordered arrays、Competitorはaggregate scoreからruntime reconstruction、canonical production persistenceは未実装。
- **Snapshot Order Lineage:** `SNAPSHOT_ORDER_LINEAGE_UNKNOWN`から`KNOWN_PARTIALLY_ORDER_SENSITIVE / OLC-F MIXED`へ更新。
- **Axis identity / order:** Canonical ID、explicit `axisOrder`、`orderVersion`は保存されない。Self / IndustryはJapanese label + implicit array order、Competitorはruntime fixed label order。
- **Compatibility risk:** `HIGH`。Radar index geometry、label-as-identity、alternate/short labels、legacy `funnelStrength` fixture key、explicit lineage version不在、方式混在による。ただしproduction database recordの存在は主張しない。
- **Version metadata:** `NO_EXPLICIT_VERSION_METADATA`。`versionLabel` / draft integer `version`はAxis、Order、Definition、Formula versionとして定義されていない。
- **Formula / Definition lineage:** `NOT_TRACEABLE`。
- **Radar Comparability:** Evidenceにより必要性は強まったが`READY_FOR_DECISION / NOT_APPROVED`を維持。
- **Immutable Historical Interpretation Principle:** `READY_FOR_DECISION / NOT_APPROVED`。Product Owner approvalなしにDecisionへ昇格しない。
- **Versioning readiness:** `PARTIALLY_READY`。PD-25 Axis / Order Versioning Discoveryは開始可能だが、formal persistence design / implementationはBackend Contractにblockedされる。
- **Backend dependency:** Rails/business backend + PostgreSQL / analysis artifact metadataをfuture source-of-truth候補とする。Backend Wire ID / PD-02C / PD-02Dは`BLOCKED`維持。
- **PD-02B / PD-02:** 未決Versioning、Radar policy、Backend/Formula/Missing dependenciesが残るため`NEEDS_DISCOVERY`維持。
- **Implementation:** Documentation / Evidence only。Snapshot schema、metadata、migration、mapper、Radar、array、fixture、TypeScript、Svelte、Rails、BFF、OpenAPI、Database、Formula変更なし。
- **Next review:** PD-25 PD-02B Axis / Order Versioning Discovery。Alternative AはBackend Snapshot Contract Discovery、Alternative BはRadar Comparability Decision Review。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-24 Evidence Workshop](../audit/82-pd02b-snapshot-order-lineage-evidence-workshop.md)、[PD-23 Approval Record](../audit/81-pd02b-canonical-order-explicit-product-owner-approval-record.md)

#### Phase PD-25 PD-02B Axis / Order Versioning Discovery

- **Discovery status:** `DISCOVERY_COMPLETE / DECISION_READY / NOT_APPROVED`。Product Decisionは行っていない。
- **Versioning status:** `PARTIALLY_READY`から`DECISION_READY / NOT_APPROVED`へ更新。Implementation readinessではない。
- **Recommended architecture:** V-3 Hybrid。Immutable `axisContractVersion`へSet、Identity、Canonical Labels、Definitions、boundaries、Canonical Order、semantic policiesをまとめ、`formulaVersion`、`snapshotSchemaVersion`、`analysisPipelineVersion`、actual order profile/ordered IDs、Backend Contract versionを分離する。
- **Single / granular assessment:** V-1 Singleは責務混同、V-2 Fully Granularはcoordination/metadata過剰のため非推奨候補。
- **Immutable Historical Interpretation:** `READY_FOR_DECISION / NOT_APPROVED`。Historical resultをfuture Definition/Order/Formulaで暗黙再解釈せず、current stylingとcurrent semanticsを分離する。
- **Published immutability:** `READY_FOR_DECISION / NOT_APPROVED`。Published versionはimmutable、Lifecycleは`DRAFT → ACTIVE → DEPRECATED → RETIRED`をProposalとする。
- **Axis Contract strategy:** `READY_FOR_DECISION / NOT_APPROVED`。Primary identifierはimmutable integerを推奨し、SemVer/date/hashをprimaryにしない。
- **Order strategy:** `READY_FOR_DECISION / NOT_APPROVED`。Canonical OrderはAxis Contractへ含め、actual feature/Snapshot orderは`orderProfileId/version`またはexplicit ordered IDsでlineage化する。
- **Formula Version separation:** `READY_FOR_DECISION / NOT_APPROVED`。異Formula version scoreはcalibration contractなしに直接比較不可候補。
- **Snapshot Schema Version separation:** `READY_FOR_DECISION / NOT_APPROVED`。Array→ID object、label→ID、metadata追加をsemantic versionから分離する。
- **Analysis Pipeline:** `analysisPipelineVersion`をAnalysis/Data + Backend/Architecture ownership候補とし、provider/prompt detailをAxis Contractへ埋め込まない。
- **Current Contract v1:** 決定済み6 Axis Contractを`PRODUCT_CONTRACT_V1_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`とする。正式発行はしていない。
- **Compatibility classes:** `COMPATIBLE`、`PRESENTATION_COMPATIBLE`、`SEMANTICALLY_INCOMPATIBLE`、`SCORE_INCOMPARABLE`、`MIGRATION_REQUIRED`、`UNSUPPORTED`、`UNKNOWN`を`READY_FOR_DECISION / NOT_APPROVED`。
- **Legacy migration:** `funnelStrength`、Japanese/short labels、positional arraysはknown source/schema/order profile限定のread mapping候補。`LEGACY_UI_ORDER_V1`はmigration-only profile候補でFormal Canonical Orderではない。
- **Snapshot policy:** `STRICT_SEMANTICS / CURRENT_PRESENTATION`を推奨。Historical Radarは生成時order、normalized comparisonはCanonical ID alignment + 同一明示display order。
- **Radar Comparability:** `READY_FOR_DECISION / NOT_APPROVED`維持。同一comparison contextでID set、display order、Definition、Formula compatibilityを確認するProposal。
- **Backend Wire ownership:** Semantic IDsはPD-02Bで完了。Wire casing/enum/API/DB representationは`PD-02C_HANDOFF_RECOMMENDED / READY_FOR_DECISION`。明示Decisionまでは`BLOCKED`維持。
- **PD-02B close readiness:** `DECISION_READY / NOT_APPROVED`。Historical principle、Hybrid strategy、Order profile、Formula/Schema separation、immutability、v1、compatibility/migration、Backend Wire handoffの承認後にsemantic discoveryをclose可能。
- **PD-02B / PD-02:** `NEEDS_DISCOVERY`維持。PD-02C / PD-02D=`BLOCKED`維持。
- **Implementation:** Documentation / Discovery only。Version constant/field、Snapshot schema、Axis metadata、mapper、Radar、TypeScript、Rails、BFF、OpenAPI、Database、Formula変更なし。
- **Next review:** PD-26 Axis / Order Versioning Decision Review。Alternative AはBackend Snapshot Contract Discovery、Alternative BはRadar Comparability Decision Review。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-25 Versioning Discovery](../audit/83-pd02b-axis-order-versioning-discovery.md)、[PD-24 Snapshot Lineage](../audit/82-pd02b-snapshot-order-lineage-evidence-workshop.md)

#### Phase PD-26 PD-02B Axis / Order Versioning Decision Review

- **Review status:** `REVIEWED / READY_FOR_DECISION / NOT_APPROVED`。
- **Approval Evidence:** `NOT_PROVIDED`。将来の承認文例をProduct Owner本人の承認として扱わない。
- **Decision Owner:** Product Owner。Approval Dateは未記録。17 Decision対象は個別承認・却下・差戻し可能。
- **Immutable Historical Interpretation:** Future Definition/Order/Formula/Pipelineによる過去結果の暗黙再解釈を禁止し、current stylingとhistorical semanticsを分離するFinal Proposal。`READY_FOR_DECISION / NOT_APPROVED`。
- **Hybrid Strategy:** Axis Contract、Formula、Snapshot Schema、Pipeline、actual Order、Backend Contractを分離し、Single/Fully Granularを採用しない。`READY_FOR_DECISION / NOT_APPROVED`。
- **Axis Contract Scope:** Set、IDs/Labels、Definitions、boundaries、Canonical Order、semantic evidence policiesを含み、Formula/schema/wire/pipeline/actual UI order/CSSを除外。`READY_FOR_DECISION / NOT_APPROVED`。
- **Order Strategy:** Canonical OrderはAxis Contractへ含め、actual orderはprofile/ordered IDsでlineage化。`READY_FOR_DECISION / NOT_APPROVED`。
- **Formula Version:** 独立管理し、compatibility/calibrationなしの異version scoreを直接比較不可とするProposal。`READY_FOR_DECISION / NOT_APPROVED`。
- **Snapshot Schema Version:** Persisted shape/identity/metadataをsemantic contractから分離。`READY_FOR_DECISION / NOT_APPROVED`。
- **Pipeline Boundary:** Extraction/model/prompt/rulesをAxis semanticsから分離し、詳細をAnalysis/Data + Backendへhandoff。`READY_FOR_DECISION / NOT_APPROVED`。
- **Identifier / Immutability / Lifecycle:** Positive integer、published immutable、`DRAFT → ACTIVE → DEPRECATED → RETIRED`。すべて`READY_FOR_DECISION / NOT_APPROVED`。
- **Current Contract v1:** Current decided Formal 6 Axis semantic contractのみをAxis Contract 1 / ACTIVE候補とする。`PRODUCT_CONTRACT_V1_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`。
- **Compatibility Policy:** 7 classes、change taxonomy、cross-version comparison rulesをFinal Proposal化。`READY_FOR_DECISION / NOT_APPROVED`。
- **Migration Policy:** Known schema/identity/orderだけautomatic mapping、guess/fuzzy mapping禁止、7 migration categories、`LEGACY_UI_ORDER_V1`をmigration-only profile候補。`READY_FOR_DECISION / NOT_APPROVED`。
- **Snapshot Compatibility:** `STRICT_SEMANTICS / CURRENT_PRESENTATION`。`READY_FOR_DECISION / NOT_APPROVED`。
- **Radar Comparability:** Historical viewは生成時order、comparisonはID align + 同一explicit order。HIGH riskとOrder Profileへ直接関係するためApproval Scope / Close Criteriaへ含める。`READY_FOR_DECISION / NOT_APPROVED`。
- **Backend Wire Handoff:** PD-02C ownershipへ正式handoffするProposal。`PD-02C_HANDOFF_RECOMMENDED / READY_FOR_DECISION / NOT_APPROVED`。Wire implementationは`BLOCKED`。
- **PD-02B Close Criteria:** 14 Decision群を承認条件とし、Backend fields/schema implementationはPD-02Cへhandoff可能。
- **Close readiness:** `DECISION_READY / BLOCKED_BY_PRODUCT_OWNER_APPROVAL`。Radarを除外して承認した場合はcloseしない。
- **Status after review:** Versioning=`REVIEWED / READY_FOR_DECISION / NOT_APPROVED`、PD-02B / PD-02=`NEEDS_DISCOVERY`、PD-02C / PD-02D=`BLOCKED`。
- **Implementation:** Documentation / Decision Review only。Version constants、Snapshot/DB schema、mapper、Radar、Formula、TypeScript、Svelte、Rails、BFF、OpenAPI変更なし。
- **Next review:** Product Owner明示承認後にPD-27 Axis / Order Versioning Explicit Product Owner Approval Record。未承認時は明示Approval待ち。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-26 Decision Review](../audit/84-pd02b-axis-order-versioning-decision-review.md)、[PD-25 Discovery](../audit/83-pd02b-axis-order-versioning-discovery.md)

#### Phase PD-27 PD-02B Axis / Order Versioning Explicit Product Owner Approval Record

- **Approval Evidence:** 「PD-02BのAxis / Order Versioning Proposalを承認する。」
- **Approval Date / Owner:** 2026-08-21 / Product Owner。
- **Approval scope:** Phase PD-26の17 Decision対象をすべて`DECIDED`とする。
- **Historical Interpretation:** Future Definition/Order/Formula/Pipelineで過去結果を暗黙再解釈せず、current presentationとhistorical semanticsを分離。`DECIDED`。
- **Hybrid Version Architecture:** Axis Contract、Formula、Snapshot Schema、Analysis Pipeline、actual Order、Backend Contractを分離。`DECIDED`。
- **Axis Contract v1:** Current decided Formal Common 6 Axis semantic contractを`Axis Contract v1 / ACTIVE`とする。Formula/schema/pipeline/wire/CSSはscope外。
- **Version policy:** Positive integer、published immutable、`DRAFT → ACTIVE → DEPRECATED → RETIRED`、Canonical Order inclusion、actual order lineageを`DECIDED`。
- **Compatibility / Migration:** 7 compatibility classes、7 migration categories、known sourceだけautomatic mapping、unknown/ambiguous dataのguess禁止を`DECIDED`。
- **Snapshot / Radar:** `STRICT_SEMANTICS / CURRENT_PRESENTATION`、ID align + 同一explicit orderによるRadar comparisonを`DECIDED`。
- **Backend Wire Handoff:** DB/API fields、wire representation、validation、persistence、mapper/registry implementationをPD-02C / Backendへ正式handoff。PD-02Bのownership blockerを除去するが、実装は`BLOCKED`。
- **Close result:** Versioning=`DECIDED`、PD-02B=`DECIDED / COMPLETE`。PD-26のClose Criteriaをすべて充足した。
- **Parent / dependencies:** PD-02は`NEEDS_DISCOVERY`、PD-02C / PD-02Dは`BLOCKED`を維持する。
- **Implementation:** Documentation only。Version constants、Snapshot/DB schema、mapper、Radar、Formula、TypeScript、Svelte、Rails、BFF、OpenAPI変更なし。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-27 Approval Record](../audit/85-pd02b-axis-order-versioning-explicit-product-owner-approval-record.md)、[PD-26 Decision Review](../audit/84-pd02b-axis-order-versioning-decision-review.md)

#### Phase PD-28 PD-02C Score Formula / Backend Contract Discovery

- **Discovery status:** `DISCOVERY_COMPLETE / NEEDS_DISCOVERY`。Formula/Backend schema/Product semanticsは決定していない。
- **Formula Source of Truth:** `MIXED`。Formula v2.1 / Display MappingのDocumentation候補、mock/fixture値、production presentation heuristicが併存し、承認・実装・lineage済み正本はない。
- **Axis Formula:** `NEEDS_DISCOVERY`。atomic observation/submetric→Canonical Axis scoreの式、eligibility、aggregation unitが未確認。
- **Overall Formula:** `READY_FOR_DECISION`。Internal 0.55 / Visual 0.45をconfidence調整する具体候補はあるが未承認・未実装。
- **Score hierarchy:** Internal/Visual observationと6 Axis、Internal/Visual/Overall outputは確認。Axis→layerとlayer→overallはDocumentation候補、submetric→Axisは`NOT_CONFIRMED`。
- **Weight / Normalization / Threshold:** market profiles、fusion weights、robust normalization/threshold候補はDocumentationに存在するが、Product Decisionではない。
- **Formula Version:** Weight/profile、Normalization、submetric/Axis/layer/overall Aggregation、Formula-level Threshold/eligibility/roundingのsemantic変更をnew version候補とする。`READY_FOR_DECISION`。
- **Backend Requirements:** Canonical ID mapping、raw/normalized、layer/overall、version lineage、provenance、completeness hookが必要。`READY_FOR_DECISION`。
- **Backend Wire:** Ownership handoff済み。OpenAPI payloadはuntyped、Rails score schemaなし、canonical business client unavailable。`READY_FOR_BACKEND_DISCOVERY`でありimplementation-readyではない。
- **Historical Comparability:** Current Snapshotはformula/axis/pipeline versionとprovenanceを持たず`UNKNOWN / NOT_VERIFIABLE`。異Formula scoreはcalibration/compatibilityなしに直接比較しない。
- **PD-02D boundary:** Missing/Partial/completeness/zero distinction/aggregation eligibilityをPD-02Dへhandoffし、本Phaseでは決定しない。
- **Status result:** PD-02Cの旧ownership blockerを解除し`NEEDS_DISCOVERY`へ移行。PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- **Implementation:** Documentation only。Formula、Weight、Threshold、Normalization、TypeScript、Svelte、Rails、BFF、OpenAPI変更なし。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-28 Discovery Audit](../audit/86-pd02c-score-formula-backend-contract-discovery.md)、[PD-27 Approval Record](../audit/85-pd02b-axis-order-versioning-explicit-product-owner-approval-record.md)

#### Phase PD-29 PD-02C Axis Formula / Submetric Evidence Workshop

- **Workshop status:** `EVIDENCE_WORKSHOP_COMPLETE / NEEDS_MORE_EVIDENCE`。Formula/Weight/Threshold/Backend schemaは決定していない。
- **Observation boundary:** Public site content/DOM/link/page/screenshot contextだけを対象とし、CTR/CVR/sales/outcome/unsupported external inferenceを除外。
- **Repository implementation:** Production crawler / Observation Output Contract / canonical atomic-submetric registryは`NOT_IMPLEMENTED / UNKNOWN`。Archiveは`LEGACY / DOCUMENTED_CANDIDATE`。
- **Value Proposition:** message、audience/problem/benefit/offer、first-view visibilityから5 Submetric候補。`READY_FOR_FORMULA_DISCOVERY`。
- **Information Hierarchy:** heading tree、section order/grouping、navigation taxonomy、proximity/priorityから5候補。`READY_FOR_FORMULA_DISCOVERY`。
- **User Flow Quality:** CTA/destination、link graph、reachability、continuity/dead-end、stage coverageから6候補。`READY_FOR_FORMULA_DISCOVERY`。
- **Trust Structure:** case/testimonial/authority/transparency/security/assurance/FAQのcoverage/contextから5候補。`READY_FOR_FORMULA_DISCOVERY`。
- **Differentiation Clarity:** unique/specialized/proprietary/positioning/comparison候補はあるがgeneric-vs-distinctive calibration不足。`NEEDS_MORE_EVIDENCE`。
- **Decision Support:** pricing/plan/scope/condition/process/FAQ/onboarding候補はあるがcontextual necessity/non-public pricing calibration不足。`NEEDS_MORE_EVIDENCE`。
- **Formula Spec compatibility:** `PARTIALLY_SUPPORTED`。Axis weight/layer方向は支持するがAtomic→Submetric→Axis derivationなし。`funnelStrength`はlegacy identity。
- **Cross-Axis:** Evidence reuse=`ALLOWED`、Semantic aspect=`MUST_BE_SEPARATED`。Navigation、case、comparison/pricing、FAQをpurpose別に分離。double-count Formulaは未決定。
- **Backend requirements:** Axis/Submetric identity、atomic value、URL/page/DOM/screenshot provenance、layer、scope/coverage、pipeline/classifier version、semantic aspect、link graph、completeness hook。
- **Status result:** Axis Formula overall=`NEEDS_MORE_EVIDENCE`。PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Backend Wire=`READY_FOR_BACKEND_DISCOVERY`。
- **Implementation:** Documentation only。Formula、Weight、Threshold、Normalization、TypeScript、Svelte、Rails、BFF、OpenAPI変更なし。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-29 Workshop Audit](../audit/87-pd02c-axis-formula-submetric-evidence-workshop.md)、[PD-28 Discovery](../audit/86-pd02c-score-formula-backend-contract-discovery.md)

#### Phase PD-30 PD-02C Differentiation / Decision Support Evidence Calibration Workshop

- **Workshop status:** `CALIBRATION_COMPLETE / READY_FOR_FORMULA_DISCOVERY`。Formula/Weight/Threshold/Backend schemaは決定していない。
- **Differentiation rule:** Generic adjective/outcomeと、contrast referent + specific mechanism/scope + reason-to-choose + observable supportを分離。単語辞書だけで判定しない。
- **Explicit / Implicit:** Explicit comparisonは直接contrast、Implicitはconcrete specialization/proprietary approach/unique capability/exclusive scopeをEvidence候補とし、市場優位を推測しない。
- **Differentiation strength:** `STRONG / MODERATE / WEAK / AMBIGUOUS`のCalibration Candidateを整理。正式Thresholdなし。
- **Differentiation Submetrics:** Distinctiveness Specificity、Positioning Clarity、Reason-to-Choose Coverage、Comparative Support、Differentiation Evidence Support。
- **Differentiation readiness:** `READY_FOR_FORMULA_DISCOVERY`。
- **Decision context:** Self-service、Enterprise B2B、Professional Service、Complex/RegulatedのContext Profile候補ごとにhigher-relevance informationを分離。固定Required Setは未決定。
- **Non-public Pricing:** Public、non-public but guided、non-public and unguidedのCase A/B/Cを区別。Case Bをautomatic low/missingにしない。
- **Decision Support Submetrics:** Commercial Information Coverage、Option Comparison Support、Scope/Specification/Condition Clarity、Process/Implementation Transparency、Purchase/Inquiry Readiness、Risk/Objection Resolution Coverage。
- **Decision Support readiness:** `READY_FOR_FORMULA_DISCOVERY`。
- **Deterministic / Semantic:** presence/link/count/page等と、distinctiveness/support/context/sufficiency/applicability判断を分離し、versioned provenanceを要求。
- **Risks:** false positive/negative、Cross-Axis ambiguity、industry/page dependence、LLM dependence、veracity boundary。
- **PD-02D handoff:** `REQUIRED / OPTIONAL / NOT_APPLICABLE / UNKNOWN`、Pricing Case A/B/C、absent/not-applicable、partial coverage、unknown context。
- **Status result:** Axis Formula overall=`READY_FOR_FORMULA_DISCOVERY`。PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Backend Wire=`READY_FOR_BACKEND_DISCOVERY`。
- **Implementation:** Documentation only。Formula、Weight、Threshold、Normalization、TypeScript、Svelte、Rails、BFF、OpenAPI変更なし。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-30 Calibration Audit](../audit/88-pd02c-differentiation-decision-support-evidence-calibration.md)、[PD-29 Workshop](../audit/87-pd02c-axis-formula-submetric-evidence-workshop.md)

#### Phase PD-31 PD-02C Observation Output Contract Discovery

- **Discovery status:** `DISCOVERY_COMPLETE / READY_FOR_DECISION`。Formula、JSON Schema、DB/API fields、Worker/Rails実装は決定していない。
- **Existing state:** Master/MVPはdual-layer Observation Bundleを要求するがfield contractなし。Archive=`LEGACY / DOCUMENTED_CANDIDATE`、Frontend result=`PARTIAL_PRODUCTION`、mock=`MOCK`、canonical Worker/Rails contract=`NOT_IMPLEMENTED`。
- **Identity:** instance=`observationId`、definition registry=`observationType`の2段階候補。Formula mappingにCanonical Axis、versioned Submetric、Semantic Aspectが必要。
- **Evidence lineage:** `evidenceId`で原Evidenceを共有し、semantic derived resultは`derivedFromObservationIds`を参照。
- **Required core:** identity/mapping、typed value、measurement mode、Internal/Visual layer、scope/source、completeness、capturedAt、Axis/Pipeline/Observation Schema versions。
- **Value types:** BOOLEAN、COUNT、RATIO、ENUM、TEXT/LABEL、SEMANTIC_CLASSIFICATION、STRUCTURED。
- **Scope / provenance:** SITE/PAGE/SECTION/COMPONENT/ELEMENT/LINK_GRAPH/PATH/SCREENSHOTと、job/run、URL/page、DOM/HTML/screenshot/evidence span、worker/classifier lineage。
- **Coverage:** observed/eligible/total、coverage ratio、scanned/expected pagesをconditional候補とし、unknown denominatorを0にしない。
- **Completeness:** `PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`候補でzero/unobserved/N/Aを分離。処理はPD-02D。
- **Confidence:** deterministicでは不要候補、semantic/hybridではconfidence source、classifier、rule/prompt/model version、rationaleをconditional required。
- **Multi-Axis / Dedup:** shared evidence IDからSemantic Aspect別Observation。DOM/VisualはLayer別、LLMはderived。Fingerprint候補は持つがAlgorithm/Formula double-countは未決定。
- **Versioning:** Axis Contract、Analysis Pipeline、Observation SchemaをObservationに保持。Formula Versionはpre-formulaでは不要、Snapshot Schemaと分離。
- **Responsibility:** Python Worker=crawl/capture/extraction/candidate output、Rails=ownership/validation/persistence/registry/orchestration、Frontend/BFF=validated result consumer候補。
- **v1 Candidate:** identity、mapping、evidence、typed value、measurement、provenance、conditional coverage、completeness、conditional confidence、lineageの最小概念構造。
- **Status result:** Observation Output Contract=`READY_FOR_DECISION`、Axis Formula=`READY_FOR_FORMULA_DISCOVERY`、PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- **Implementation:** Documentation only。TypeScript、Svelte、Python Worker、Rails、BFF、OpenAPI変更なし。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-31 Discovery Audit](../audit/89-pd02c-observation-output-contract-discovery.md)、[PD-30 Calibration](../audit/88-pd02c-differentiation-decision-support-evidence-calibration.md)

#### Phase PD-32 PD-02C Observation Output Contract Decision Review

- **Review status:** `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`。Approval Evidence=`NOT_PROVIDED`。
- **Recommended owner:** Product Owner + Analysis/Data Owner + Backend/API/Architecture Owner。Frontend=Consulted。
- **Identity:** Instance IDとstable Observation Typeを分離。Axis/Submetric/Semantic Aspect/Evidenceをinstance IDへ埋め込まない。`DECIDE NOW`。
- **Core fields:** identity/mapping、typed value、mode、layer、scope/source、provenance、completeness、coverage availability、capturedAt、version lineage=`REQUIRED` Proposal。Source-specific refs/coverage/confidence=`CONDITIONAL`。
- **Value Types:** BOOLEAN、COUNT、NUMBER、RATIO、ENUM、TEXT、SEMANTIC_CLASSIFICATION、bounded STRUCTURED。Standalone LABELとuntyped JSONを`REJECT`。
- **Measurement Mode:** `DETERMINISTIC / SEMANTIC`をProposal化。HYBRIDはseparate + derived Observationsへ分解しv1から`REJECT`。
- **Layer:** `INTERNAL / VISUAL`を別Observationとして保持。FusionはFormulaへhandoff。
- **Provenance:** Job + source artifact + capturedAt + pipeline core。Run/page/DOM/HTML/screenshot/bounding-box/evidence span/component lineageはtype-conditional。
- **Scope:** SITE、PAGE、SECTION、COMPONENT、ELEMENT、LINK_GRAPH、PATH、SCREENSHOTをProposal化。
- **Coverage:** availability always explicit、metrics conditional、unknown denominator≠0。Exact availability enumはcandidate。
- **Completeness:** `PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`をProposal化。Score treatmentはPD-02D。
- **Confidence:** deterministic原則不要、semanticはconfidence/source/classifier/applicable version/rationaleをconditional required。Scale/thresholdはdefer。
- **Multi-Axis:** 1 Evidence→semantic aspect別multiple ObservationsをProposal化。
- **Dedup boundary:** Evidence ID required、derived refs conditional、group/fingerprint candidate、Algorithm/double-count defer。
- **Versioning:** Axis Contract / Analysis Pipeline / Observation Schema required。pre-formula Formula VersionとObservationとしてのSnapshot Schema Versionをreject。
- **Responsibilities:** Mechanical Crawler/Capture、Vision/Semantic Analysis、Rails ownership/validation/persistence/orchestration、Frontend validated result consumptionを分離Proposal化。
- **Deferred:** Formula、Missing/Partial treatment、exact schema/ID format、registry storage、DB/OpenAPI、Dedup、confidence calibration、Worker/Rails topology/implementation。
- **Status result:** Observation Contract=`READY_FOR_APPROVAL / NOT_APPROVED`、Axis Formula=`READY_FOR_FORMULA_DISCOVERY`、PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- **Implementation:** Documentation only。TypeScript、Svelte、Python Worker、Rails、BFF、OpenAPI変更なし。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-32 Decision Review](../audit/90-pd02c-observation-output-contract-decision-review.md)、[PD-31 Discovery](../audit/89-pd02c-observation-output-contract-discovery.md)

#### Phase PD-33 PD-02C Observation Output Contract Explicit Product Owner Approval

- **Approval Evidence:** Product Owner本人の明示文「PD-02CのObservation Output Contract v1 Proposalを承認する。」を2026-08-24に受領。
- **Decision Owner:** Product Owner。
- **Decision status:** Observation Output Contract=`DECIDED / APPROVED`。
- **Contract version/status:** `v1 / APPROVED CONTRACT`。
- **Identity/Core:** instance=`observationId`、definition=`observationType`を分離。Axis/Submetric/Evidenceをinstance IDへ埋め込まない。identity/mapping、Evidence、typed value、mode、layer、scope/source、provenance、completeness、coverage availability、capturedAt、version lineageをCoreとする。
- **Value/Measurement/Layer:** 8 Value Types、`DETERMINISTIC / SEMANTIC`、`INTERNAL / VISUAL`を承認。HYBRID、standalone LABEL、untyped JSONは不採用。
- **Provenance/Scope/Coverage:** Job/source artifact/capturedAt/pipeline core、source-specific refs conditional、8 Scopes、explicit coverage availability、unknown denominator≠0を承認。
- **Completeness/Confidence:** 5 Completeness statesを承認。Deterministic confidenceは原則不要、Semantic confidence metadataはconditional。score treatment/calibrationは未決定。
- **Multi-Axis/Dedup/Versioning:** Evidence reuse + semantic aspect分離、Evidence/derived traceability、Axis Contract / Pipeline / Observation Schema lineageを承認。Dedup Algorithm、Formula Version、Snapshot Schemaは分離。
- **Responsibilities:** Mechanical Crawler/Capture、Vision/Semantic、Python Worker、Rails、Frontend/BFFのlogical responsibility boundaryを承認。service topologyと実装は未承認。
- **Implementation:** `NOT_IMPLEMENTED`。Documentation only。Source、Rails、OpenAPI変更なし。
- **Status result:** Axis Formula=`READY_FOR_FORMULA_DISCOVERY`、PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- **Remaining PD-02C:** Exact Axis Formula、Atomic→Submetric→Axis aggregation、Internal/Visual contribution、Formula Version、Backend Wire/DB/OpenAPI Contract、Formula provenance。
- **Deferred:** Weight、normalization、threshold、rounding、layer ratio、missing/partial scoring、confidence calibration、dedup algorithm、exact JSON、DB/OpenAPI、Worker/Rails implementation。
- **Recommended next:** PD-34候補 — PD-02C Axis Formula Candidate Discovery。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-33 Explicit Approval Record](../audit/91-pd02c-observation-output-contract-explicit-product-owner-approval-record.md)、[PD-32 Decision Review](../audit/90-pd02c-observation-output-contract-decision-review.md)

#### Phase PD-34 PD-02C Axis Formula Candidate Discovery

- **Discovery status:** `DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`。Exact Formula/parameterは未承認。
- **Hierarchy:** Atomic Observation → normalized Submetric → layer-specific Axis → Internal/Visual Layer Score → Overall late fusion。
- **Atomic→Submetric:** binary aggregation、denominator付きcount/ratio/coverage、type-specific normalization、semantic class mapping候補。
- **Submetric→Axis:** Equal、Weighted、Coverage-adjusted、Eligibility-aware、Deterministic/Semantic Hybridを比較。Eligibility-aware baselineを第一候補とする。
- **Normalization:** Submetric boundaryを優先。linear/capped linear/logistic/robust/ratio/class mappingをinput type別に使い分ける候補。Presentation clampと分離。
- **Eligibility:** Formulaは5 Completeness statesとcoverageを必要とする。score treatmentはPD-02Dへhandoff。
- **Layer/Overall:** Internal/Visualを最後まで別系統で集約しlate fusion。0.55/0.45は`DOCUMENTED_CANDIDATE / NOT_APPROVED`。
- **Confidence/Coverage:** Separate Quality Indicator / eligibility metadataを優先し、calibrationなしのweight modifierを非推奨候補とする。
- **Semantic integration:** deterministic inputを参照するderived semantic Observationを推奨。HYBRID Observation/LLM-only scoreは不採用。
- **Multi-Axis:** Evidence reuse + semantic aspect separationを維持。Dedup/contribution cap/double-count ruleは未決定。
- **Provenance:** Formula/Axis/Observation/Pipeline versions、input IDs、profiles、eligibility/completeness/coverage、output identity、job/snapshot、calculatedAtを最小候補とする。
- **Formula Version:** weight、normalization、aggregation、eligibility、confidence handling、score threshold/roundingのsemantic変更をversion change候補とする。editorial/refactor/CSS/display safetyは除外。
- **Candidates:** A=Layer-first baseline、B=Axis-first unified、C=Layer-first Common Core + Axis-specific profiles。
- **Recommendation:** Candidate CをDecision Reviewへ送る。Candidate Aをinitial default/fallbackとして内包する。
- **Backend handoff:** Formula/Axis/Submetric/Layer/Overall scores、input lineage、completeness、coverage、provenanceを運べる必要がある。Exact schemaは未決定。
- **Status result:** Axis Formula Candidate=`READY_FOR_DECISION_REVIEW`、PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Implementation=`NOT_IMPLEMENTED`。
- **Recommended next:** PD-35候補 — Axis Formula Architecture Decision Review。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-34 Discovery Audit](../audit/92-pd02c-axis-formula-candidate-discovery.md)、[PD-33 Observation Contract Approval](../audit/91-pd02c-observation-output-contract-explicit-product-owner-approval-record.md)

#### Phase PD-35 PD-02C Axis Formula Architecture Decision Review

- **Review status:** `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`。Approval Evidence=`NOT_PROVIDED`。
- **Final candidate:** Candidate C — Layer-first Common Core + Axis-specific Versioned Profiles。
- **Common Core:** eligibility hook、typed handling、Submetric normalization boundary、aggregation envelope、Layer preservation、provenance/version/explainabilityを`DECIDE NOW` Proposal化。
- **Axis profiles:** Submetric set、normalization/aggregation method、weight、applicability refsをAxis Definition/Coreから分離したversioned profileとするProposal。
- **Atomic→Submetric:** type/profile-defined normalizationで共通0–100 Submetricへ変換。Exact method/parameterはprofile candidate。
- **Submetric→Axis:** eligibility-aware framework。Equal/eligible meanはdefault/fallback、weighted profileはfuture candidate。
- **Internal/Visual:** Observation→Submetric→Axisまで別系統。Layer Score後にOverall late fusion。
- **Layer/Overall:** eligible-axis meanはbaseline profile候補。Exact ratio/dynamic adjustmentは未決定。0.55/0.45=`UNAPPROVED CANDIDATE`。
- **Confidence:** Separate Quality Indicatorをv1 Direction Proposal。Gate/modifierは`DEFER`。
- **Coverage:** direct score coverage Submetricとcrawl/observation quality metadataを分離するProposal。
- **Semantic/Deterministic:** derived semantic Observationを許可。HYBRID Observation/LLM-only Axis Scoreを`REJECT`。
- **Multi-Axis:** Evidence reuse、semantic aspect separation、lineage保持。Dedup/cap/double-countは`DEFER`。
- **Explainability/Provenance:** Score→Evidence trace、各contribution、version、missing/coverage reason、historical reconstructionを要求。
- **Formula Version:** Weight、Normalization、Aggregation、Eligibility、Confidence、score threshold/business rounding、Layer fusion、profile behaviorのsemantic変更を対象候補とする。
- **Candidate A:** Candidate C内のdefault/fallback/initial calibration profileとして`KEEP AS PROFILE CANDIDATE`。独立最終Architectureにはしない。
- **Candidate B:** Axis-first Unified Fusionをv1 Architectureとして`REJECT`。
- **Backend handoff:** Formula/profile refs、Submetric/Axis/Internal/Visual/Layer/Overall scores、raw/normalized、provenance、completeness、coverage、input lineage。
- **Status result:** Axis Formula Architecture=`READY_FOR_APPROVAL / NOT_APPROVED`、PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Implementation=`NOT_IMPLEMENTED`。
- **Recommended next:** Explicit Product Owner approval受領時のみPD-36 Approval Record。未承認時は差戻し。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-35 Decision Review](../audit/93-pd02c-axis-formula-architecture-decision-review.md)、[PD-34 Discovery](../audit/92-pd02c-axis-formula-candidate-discovery.md)

#### Phase PD-36 PD-02C Axis Formula Architecture Explicit Product Owner Approval

- **Approval Evidence:** 「PD-02CのAxis Formula Architecture Proposal（Candidate C）を承認する。」
- **Approval Date / Owner:** 2026-08-24 / Product Owner。
- **Final status:** Axis Formula Architecture=`DECIDED / APPROVED`。Candidate C=`APPROVED ARCHITECTURE`。
- **Approved hierarchy:** Atomic Observation → Normalized Submetric → Layer-specific Axis Score → Internal/Visual Layer Score → Overall late fusion。
- **Common Core:** eligibility hook、typed handling、normalization/aggregation framework、Layer preservation、provenance/version/explainabilityを承認。
- **Axis Profiles:** Submetric set、normalization/aggregation method、weight、applicability refsをversioned profileとして管理。Axis Definitionとは別Contract。
- **Atomic→Submetric:** profile-defined normalization Architectureを承認。Exact method/parameterは`NOT_DECIDED`。
- **Submetric→Axis:** eligibility-aware Architectureを承認。Candidate Aをdefault/fallback/initial calibration profile候補として保持。
- **Internal/Visual:** Observation→Submetric→Axisまで別系統。Layer Score後にOverall late fusion。
- **Layer/Overall:** eligible-axis mean/weighted layer profileはcandidate。Exact ratioは未決定、0.55/0.45=`UNAPPROVED CANDIDATE`。
- **Confidence/Coverage:** Separate Quality Indicator、Product CoverageとCrawl Coverageの分離を承認。Gate/modifier/calibrationはdefer。
- **Semantic/Multi-Axis:** Derived Semanticを許可、HYBRID/LLM-only Axis Scoreを不採用。Evidence reuse + semantic aspect separation + lineageを維持。
- **Explainability/Provenance:** Score→Evidence trace、Layer contribution、versions、completeness/coverage/reason、historical reconstructionを要求。
- **Formula Version:** Weight、Normalization、Aggregation、Eligibility、Confidence、score threshold/business rounding、Layer fusion、profile behaviorのsemantic changeを対象。CSS/display/layout/clampは除外。
- **Candidate A:** `KEEP AS PROFILE CANDIDATE`。
- **Candidate B:** `REJECTED FOR V1`。
- **Implementation:** `NOT_IMPLEMENTED`。Exact Formula Parameters=`NOT_DECIDED`。
- **Status result:** PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- **Remaining:** Formula profile/parameter policy、Exact normalization、fusion profile、Formula Version concrete contract、Backend Wire/DB/OpenAPI、provenance wire representation。
- **Recommended next:** PD-37候補 — Formula Profile / Parameter Policy Discovery。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-36 Approval Record](../audit/94-pd02c-axis-formula-architecture-explicit-product-owner-approval-record.md)、[PD-35 Decision Review](../audit/93-pd02c-axis-formula-architecture-decision-review.md)

#### Phase PD-37 PD-02C Formula Profile / Parameter Policy Discovery

- **Discovery status:** `DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`。Exact Formula Parameters=`NOT_DECIDED`。
- **Taxonomy:** Structural、Numeric、Presentation、Calibration Parameterを分離。
- **Authority:** Architecture/method=Product + Analysis/Data Contract、numeric value=Dataset/Statistical Evaluation/domain review、Eligibility=PD-02D、technical precision=Backend、display=Presentation Rule。
- **Initial baseline:** Candidate A Equal/Eligibility-aware=`UNCALIBRATED CALIBRATION BASELINE`。最適値/確定値とは扱わない。
- **Submetric Weight:** Equal baseline→Calibration-derived laterを推奨。Expert-only/non-equal weightはevidence不足。
- **Axis/Layer Weight:** Canonical Order≠Weight≠Importance。Global equal/eligible baselineをinitial candidateとしnon-equalはcalibration待ち。
- **Fusion:** v1はnon-dynamic fixed policy候補。Ratio未決定、0.55/0.45=`UNAPPROVED CANDIDATE`、dynamic fusion=defer。
- **Normalization:** Value Type/Submetric別method。Static/profile/calibration/dataset-specific parameterを分離。
- **Calibration Dataset:** market/context/size/page/content/Layer/crawl diversity、provenance、held-out、rubric/versionが必要。
- **Ground Truth:** observable-site rubric + multi-reviewer + blind pairwise。External outcomesはsecondary validation。
- **Threshold/Rounding:** Product/Eligibility/Confidence/UI thresholdを分離。Storage precision、Business rounding、Presentation roundingを分離。
- **Confidence/Coverage:** ConfidenceとCrawl CoverageはScore modifierにせずquality metadata。Product CoverageだけSubmetric candidate。
- **Eligibility:** 5 statesのrule referenceをProfileが持ち、score treatmentはPD-02Dへhandoff。
- **Version/Immutability:** Formula Versionがimmutable Profile revisionsを解決。Published recordをmutationせずsemantic changeはnew versions。
- **Fallback:** Equal baseline=temporary calibration、unapproved ratio/semantic/context weight=production unsupported。
- **Context:** v1はGlobal baseline。Industry/Context Profileはdataset不足によりdefer candidate。Hybridはfuture candidate。
- **Registry:** Formula/Profile identity、lifecycle、Axis/Submetric、methods/parameters、applicability/fusion、calibration/approval metadataを保持するlogical candidate。
- **Explainability:** source、rationale、dataset、evaluation、approval/effective/change/compatibility metadataを候補化。
- **Status result:** PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Implementation=`NOT_IMPLEMENTED`。
- **Recommended next:** PD-38候補 — Formula Profile / Parameter Policy Decision Review。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-37 Discovery Audit](../audit/95-pd02c-formula-profile-parameter-policy-discovery.md)、[PD-36 Architecture Approval](../audit/94-pd02c-axis-formula-architecture-explicit-product-owner-approval-record.md)

#### Phase PD-38 PD-02C Formula Profile / Parameter Policy Decision Review

- **Review status:** `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`。Approval Evidence=`NOT_PROVIDED`。
- **Final Proposal:** Uncalibrated baseline、calibration-first non-equal weights、typed normalization、non-dynamic fixed fusion、quality separation、immutability、canonical formulaVersion、silent fallback prohibition、Global v1、PD-02D boundary。
- **Taxonomy:** Structural、Numeric、Presentation、Calibrationを`DECIDE NOW` Proposal化。
- **Authority:** Method=Product + Analysis/Data、Numeric=Dataset/Statistics/Domain Review、Eligibility=PD-02D、Display=Presentation。Preference-only numeric decisionを`REJECT`。
- **Baseline:** Equal/Eligibility-aware=`UNCALIBRATED CALIBRATION BASELINE` Proposal。Profile valuesはCalibration Candidate。
- **Submetric Weight:** Equal→Calibration-derived later。Expert-only primary defaultを`REJECT`。
- **Axis Weight:** Canonical Order-derived weightを`REJECT`。Equal/eligibleまたはno explicit weightをCalibration Candidate。
- **Fusion:** non-dynamic fixed directionをProposal化。Exact ratioはcandidate、0.55/0.45=`UNAPPROVED CANDIDATE`、dynamic=defer。
- **Normalization:** Type/Submetric-specific method。One-sizeを`REJECT`。Exact method/parameterはCalibration Candidate。
- **Dataset/Ground Truth:** representative + held-out、observable rubric + multi-reviewer + blind pairwise。External outcome-onlyを`REJECT`。
- **Threshold/Rounding:** Product/Eligibility/Confidence/UIとStorage/Business/Presentationを分離。
- **Confidence/Coverage:** ConfidenceはSeparate、Crawl Coverageはquality metadata。gate/modifier/calibrationはdefer。
- **Eligibility:** Profileは5 statesを参照し、treatmentはPD-02Dへ委譲。
- **Version/Immutability:** formulaVersionをCanonical Formula Identityとしimmutable Profile revisionsを解決。Published mutationを`REJECT`。
- **Fallback:** Silent substitutionを`REJECT`。Uncalibrated/unsupported/unknown/N/Aを明示可能にする。
- **Context:** v1 Global baseline。Industry profile=defer、limited Context Hybrid=Calibration Candidate。
- **Registry/Metadata:** logical parameter registryとsource/rationale/dataset/evaluation/approval/effective/change/compatibility metadataをProposal化。
- **Status result:** Exact Formula Parameters=`NOT_DECIDED`、PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Implementation=`NOT_IMPLEMENTED`。
- **Recommended next:** Explicit Product Owner approval受領時のみPD-39 Approval Record。未承認時は差戻し。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-38 Decision Review](../audit/96-pd02c-formula-profile-parameter-policy-decision-review.md)、[PD-37 Discovery](../audit/95-pd02c-formula-profile-parameter-policy-discovery.md)

#### Phase PD-39 PD-02C Formula Profile / Parameter Policy Explicit Product Owner Approval

- **Approval Evidence:** 「PD-02CのFormula Profile / Parameter Policy Proposalを承認する。」
- **Approval Date / Owner:** 2026-08-24 / Product Owner。
- **Final status:** Formula Profile / Parameter Policy=`DECIDED / APPROVED`。
- **Core Policy:** Calibration-first、Typed Normalization、Non-dynamic Fusion、Quality Separation、Immutability、Silent Fallback Prohibition、Global Baseline。
- **Taxonomy:** Structural、Numeric、Presentation、Calibrationを承認。
- **Authority:** Method=Product + Analysis/Data、Numeric=Dataset/Statistics/Domain Review、Eligibility=PD-02D、Display=Presentation。Preference-only numeric decisionを不採用。
- **Baseline:** Equal/Eligibility-aware=`UNCALIBRATED CALIBRATION BASELINE`。
- **Weights:** Equal→Calibration-derived later。Canonical Order≠Weight≠Importance≠Priority。Exact Weight未決定。
- **Fusion:** v1 non-dynamic fixed direction。Exact ratio未決定、0.55/0.45=`UNAPPROVED CANDIDATE`、dynamic=defer。
- **Normalization:** Type/Submetric-specific。One-size不採用。Parameterはstatic/profile/calibration/dataset-specific。
- **Dataset/Ground Truth:** representative + held-out、observable rubric + multi-reviewer + blind pairwise、external outcome=secondary。
- **Threshold/Rounding:** Product/Eligibility/Confidence/UIとStorage/Business/Presentationを分離。
- **Confidence/Coverage:** Confidence=Separate、Crawl Coverage=quality metadata、Product Coverage=Submetric candidate。
- **Eligibility:** 5 statesを参照し、Score TreatmentはPD-02Dへ委譲。
- **Version/Immutability:** formulaVersion=Canonical Formula Identity、published Formula/Profile=`IMMUTABLE`、変更=new revisions。
- **Fallback:** Silent substitution禁止。Unsupported/Unknown/Uncalibrated/N/Aを隠さない。
- **Context:** v1 Global baseline、Industry-specific=`DEFER`、limited Context Hybrid=future candidate。
- **Registry/Explainability:** logical registryとsource/rationale/dataset/evaluation/approval/effective/change/compatibility/limitations metadata。
- **Exact Parameters:** `NOT_DECIDED`。
- **Implementation:** `NOT_IMPLEMENTED`。
- **Status result:** PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- **Remaining:** Exact calibration、fusion profile、Formula Version concrete representation、Backend Wire/DB/OpenAPI、provenance wire、PD-02D treatment。
- **Recommended next:** PD-40候補 — Calibration Dataset / Evaluation Protocol Discovery。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-39 Approval Record](../audit/97-pd02c-formula-profile-parameter-policy-explicit-product-owner-approval-record.md)、[PD-38 Decision Review](../audit/96-pd02c-formula-profile-parameter-policy-decision-review.md)

#### Phase PD-40 PD-02C Formula Version / Backend Wire Contract Discovery

- **Discovery status:** Formula Version=`READY_FOR_DECISION_REVIEW`、Backend Wire Logical Contract=`READY_FOR_DECISION_REVIEW`。
- **Current backend:** OpenAPI Snapshot payload=untyped、Formula lineageなし。Rails Project/Job/Snapshot/Formula/Score=`NOT_IMPLEMENTED`。
- **Formula identity:** Published immutable positive integer `formulaVersion`をCanonical Formula Identity候補とする。Lifecycle DRAFT/ACTIVE/DEPRECATED/RETIRED。
- **Resolution:** Architecture、Axis Contract、Profiles、Submetrics、Normalization/Aggregation/Weights/Fusion/Eligibility、Calibration/compatibility/approval metadataを一意解決。
- **Formula/Profile Registry:** Rails canonical ownership候補。Profile revisionはsubordinateで第二のcomparison identityにしない。
- **Score hierarchy:** Raw Observation→Normalized Submetric→Layer-specific Axis→Layer→Overall→Presentation。
- **Score identity:** Root + child logical identityを要求候補。Exact physical ID未決定、array position禁止。
- **Submetric:** Canonical IDs/Layer、normalized/non-calculated result、input Observations、resolved refs、formulaVersion、completeness/eligibility、calculatedAt。
- **Axis:** axisId + Layer、input Submetric results、Profile、completeness/coverage、formulaVersion。
- **Layer:** Layer、input Axis identities、aggregation、completeness、formulaVersion。
- **Overall:** Internal/Visual Layer refs、Fusion ref、quality context、formulaVersion。Unapproved ratioをdefaultにしない。
- **Provenance:** Formula/Axis/Observation/Pipeline versions、resolved refs、input IDs、Job/Snapshot、result IDs、calculatedAt。
- **Job/Snapshot:** ResultはJob必須、Snapshot optional/commit後。Snapshotはgeneration-time lineageを保持しsilent reinterpret禁止。
- **Compatibility:** Formula差は自動compatibleにせず、明示contractなしは`SCORE_INCOMPARABLE / UNKNOWN`候補。
- **Completeness/Quality:** 5 states/eligibility/reason/coverageを表現可能にし、Confidence/Crawl CoverageはScoreから分離。TreatmentはPD-02D。
- **Ownership:** Option C Worker engine + Rails registry/orchestration/validation/persistenceを推奨。WorkerはRegistry正本を持たない。
- **BFF/Frontend:** BFF=auth/org proxy、Frontend=validated display/explanation。Formula Business Logicなし。
- **OpenAPI/DB handoff:** typed hierarchy、lineage、quality/completeness、resources/registry/results/persistence concerns。Exact schema未決定。
- **Closure assessment:** Option B推奨。Version/Wire logical contract承認まででPD-02C Decision-complete、Calibration/Schema/Implementationは後続handoff。
- **Status result:** Exact Parameters=`NOT_DECIDED`、Implementation=`NOT_IMPLEMENTED`、PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- **Recommended next:** PD-41候補 — Formula Version / Backend Wire Contract Decision Review。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-40 Discovery Audit](../audit/98-pd02c-formula-version-backend-wire-contract-discovery.md)、[PD-39 Parameter Policy Approval](../audit/97-pd02c-formula-profile-parameter-policy-explicit-product-owner-approval-record.md)

#### Phase PD-41 PD-02C Formula Version / Backend Wire Contract Decision Review

- **Review status:** `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`。Product Owner Approval Evidence=`NOT_PROVIDED`。
- **Formula Identity:** Published immutable positive integer `formulaVersion`を唯一のCanonical Formula IdentityとするFinal Proposal。Profile revisionを第二Source of Truthにしない。
- **Resolution:** Architecture、Axis Contract、Profile revisions、Submetrics、Normalization/Aggregation/Weight/Fusion/Eligibility、Calibration、compatibility/approval metadataをimmutable Manifestから一意解決。
- **Registry:** Rails-owned logical `FormulaDefinition` Registry。Profile RegistryはAxis-specific immutable subordinate revisions。
- **Score hierarchy:** Raw Observation→Normalized Submetric→Internal/Visual Axis→Internal/Visual Layer→Overall→Presentation。
- **Score identity:** Root `scoreResultId` + child logical identities。Array index identityを不採用。Physical IDはimplementation detail。
- **Logical contracts:** Submetric/Axis/Layer/Overallはscore/non-calculated state、input refs、resolved refs、formulaVersion、completeness/quality、calculatedAtを階層別に保持。
- **Provenance:** Formula/Axis/Observation/Pipeline versions、resolved refs、input IDs、AnalysisJob、conditional Snapshot、result IDs、calculatedAtからEvidenceまで追跡。
- **Job/Snapshot:** Organization-scoped AnalysisJobをruntime anchorとし、Snapshotはgeneration-time lineageを固定。Snapshot Schema VersionとFormula Versionを分離。
- **Compatibility:** Formula Version差は自動比較可能とせず、explicit taxonomy/metadataがない場合は`SCORE_INCOMPARABLE / UNKNOWN`。
- **Completeness/Quality:** 5 states + reason/coverageを伝達可能にし、Semantic confidence、quality、crawl coverage、completeness、product coverageを単一Scoreへ統合しない。
- **Ownership Final Proposal:** Option C — Worker calculation engine + Rails canonical orchestration/registry/validation/persistence。
- **BFF/Frontend:** BFF=auth/session + Organization-scoped transport、Frontend=validated consumption/explanation/presentation。Formula Business Logicなし。
- **Backend Wire root:** Logical `AnalysisScoreResult`にidentity、org/job/snapshot、formula lineage、Submetric/Axis/Layer/Overall、completeness、quality、provenance、calculatedAtを持たせる。
- **OpenAPI/DB:** logical requirements/persistence concernsまでを決め、exact operation/path/schema/table/JSON/field casingはdefer。
- **Calibration/PD-02D:** Exact Parameter/Datasetは後続Validation、Missing/Partial/Eligibility TreatmentはPD-02D。いずれもWireで表現可能にする。
- **Closure Final Proposal:** Option B。Version Contract、Wire Contract、Ownership Option C、handoff boundary承認後にPD-02C=`DECISION_COMPLETE`。
- **Readiness:** Formula Version、Backend Wire、Ownership、Closureはいずれも`READY_FOR_APPROVAL / NOT_APPROVED`。
- **Current status:** Exact Parameters=`NOT_DECIDED`、Implementation=`NOT_IMPLEMENTED`、PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- **Recommended next:** 明示承認受領時のみPD-42 Explicit Product Owner Approval Record。差戻し時は対象Proposalのみ再Review。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-41 Decision Review](../audit/99-pd02c-formula-version-backend-wire-contract-decision-review.md)、[PD-40 Discovery](../audit/98-pd02c-formula-version-backend-wire-contract-discovery.md)

#### Phase PD-42 PD-02C Formula Version / Backend Wire Contract Explicit Product Owner Approval

- **Approval Evidence:** 「PD-02CのFormula Version / Backend Wire Contract Proposal、Formula Calculation Ownership Option C、およびPD-02C Closure Option Bを承認する。」
- **Approval Date / Owner:** 2026-08-24 / Product Owner。
- **Formula Version Contract:** `DECIDED / APPROVED`。Published immutable positive integer formulaVersionをCanonical Formula Identityとし、immutable Manifestを一意解決する。
- **Formula/Profile Registry:** Rails-owned `FormulaDefinition` Registryを正本とし、Axis-specific Profile Revisionはimmutable subordinate revisionとしてformulaVersionから解決する。
- **Score hierarchy:** Raw Observation→Normalized Submetric→Internal/Visual Axis→Internal/Visual Layer→Overall→Presentation。
- **Score identity/provenance:** Root `scoreResultId` + child logical identities。Formula/Axis/Observation/Pipeline、resolved refs、inputs、Job/Snapshot、engine、calculatedAtからEvidenceまで追跡。
- **Job/Snapshot/history:** Organization-scoped AnalysisJobをruntime/lineage/auth anchorとし、generation-time Snapshot lineageを固定。Current Formulaでsilent reinterpretしない。
- **Compatibility/completeness/quality:** Formula差を自動比較可能とせず、7 taxonomyを使用。5 completeness statesを運搬し、Quality/ConfidenceはScoreと分離。
- **Formula Calculation Ownership:** Option C=`DECIDED / APPROVED`。Worker engine + Rails canonical orchestration/registry/validation/persistence。
- **BFF/Frontend:** BFF=auth/session + Organization-scoped transport、Frontend=validated consumption/explanation/presentation。Formula Business Logicなし。
- **Backend Wire Logical Contract:** `DECIDED / APPROVED`。Logical root=`AnalysisScoreResult`。Exact JSON/OpenAPI/DBはhandoff。
- **Closure:** Option B=`DECIDED / APPROVED`。PD-02C=`DECISION_COMPLETE`。
- **Non-completion boundary:** Implementation=`NOT_IMPLEMENTED`、Exact Formula Parameters=`NOT_DECIDED`、Calibration=`NOT_PERFORMED`。
- **Parent status:** PD-02=`NEEDS_DISCOVERY`。PD-02D未完了のため閉じない。
- **PD-02D reassessment:** PD-02C dependencyは解消。PD-04のpartial Snapshot/Job workflowとRails canonical backend semanticsが未解決のため`BLOCKED / PD-04_BACKEND_WORKFLOW_DEPENDENCY`を維持。
- **Recommended next:** PD-43 PD-02D / PD-04 Dependency and Discovery Readiness Review。PD-02D Discovery自体はまだ開始しない。
- **Detail parent:** [Score / Axis Data Dictionary](./score-axis-data-dictionary.md)
- **References:** [PD-42 Approval Record](../audit/100-pd02c-formula-version-backend-wire-contract-explicit-product-owner-approval-record.md)、[PD-41 Decision Review](../audit/99-pd02c-formula-version-backend-wire-contract-decision-review.md)

#### Phase PD-43 PD-02D / PD-04 Dependency and Discovery Readiness Review

- **Previous blocker:** PD-02D=`BLOCKED / PD-04_BACKEND_WORKFLOW_DEPENDENCY`。
- **Canonical Job:** 14 states、terminal=`completed / failed / cancelled / timed_out / partially_completed`を維持。新stateなし。
- **Partial distinction:** Observation PARTIAL、Axis PARTIAL、Job `partially_completed`、partial Snapshotを別conceptとする。
- **Cause boundary:** Product absence、Observation failure、scope unknown、not applicable、partialを区別する。Exact taxonomy/treatmentはPD-02D scope。
- **Snapshot dependency:** Exact persistence/current promotionはPD-02D blockerではない。Score ResultがSnapshot前に存在し、materialize時にlineageを保持できるlogical boundaryで足りる。
- **Strategy dependency:** Formula eligibilityとStrategy Source promotion eligibilityを分離。No auto-promotionはcurrent safe boundary、final policyはPD-04。
- **Reanalysis:** New Job/new result lineageだけがPD-02Dに必要。replacement、billing、retention、UI workflowはPD-04/implementation。
- **Unsupported:** Formula/profile unavailable、required Observation unavailable、historical incompatibility、required Layer不足をnon-calculated候補としてPD-02Dへ送る。
- **Rails boundary:** State setとWire carrierはavailable。Snapshot promotion、Strategy promotion、reanalysis/usageはPD-04 Product gaps。Model/table/OpenAPIはimplementation-only。
- **Minimum unblock set:** Axis/Formula identity、5 completeness states、reason/coverage carrier、Job partial terminal、pre-Snapshot result identity/provenance、Formula/Strategy eligibility separationはすべて充足。
- **PD-04 scope:** Job outcome、Snapshot lifecycle、Strategy promotion、reanalysis/history/usageの4 workstreams。まだ正式sub-decisionへ分割しない。
- **Dependency result:** `PD-02D → PD-04全体`依存を解除。開始をblockするcircular dependencyなし。
- **PD-02D readiness:** `READY_FOR_DISCOVERY`。
- **PD-04 readiness:** `READY_FOR_DISCOVERY / NON_BLOCKING_TO_PD-02D`。
- **Recommended option:** Option A — PD-02Dを直接開始。PD-04 Full Discoveryは並行または後続。
- **Parent status:** PD-02=`NEEDS_DISCOVERY`。
- **References:** [PD-43 Readiness Review](../audit/101-pd02d-pd04-dependency-discovery-readiness-review.md)、[PD-42 Approval Record](../audit/100-pd02c-formula-version-backend-wire-contract-explicit-product-owner-approval-record.md)

#### Phase PD-44 PD-02D Missing / Partial Score Contract Discovery

- **Discovery status:** `DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`。RecommendationはModel B、未承認。
- **Completeness:** 承認済み5 statesを維持。0、Missing、Unknown、N/A、Partial、Technical Failureを分離。
- **Eligibility:** `ELIGIBLE / INELIGIBLE / CONDITIONALLY_ELIGIBLE / UNDETERMINED`候補をCompletenessと分離。
- **Score State:** `CALCULATED / NON_CALCULATED`候補。Non-calculatedへ0/neutral/last-known値をsilent代入しない。
- **MISSING:** 常にnegativeではない。意味のあるProduct absenceだけをexplicit Submetric semantic mapping候補とし、generic penaltyを非推奨。
- **N/A:** eligible denominator除外を推奨。0/neutral mappingは不採用候補。
- **UNKNOWN/PARTIAL:** 0投入せず、reason/coverage、conditional eligibility、quality warning、reanalysis signal候補を保持。
- **Submetric:** Eligibility-aware framework + Type-specific Profile ruleを推奨。Strict/coverage gateはrequired/profile候補、Exact thresholdはdefer。
- **Axis/Layer:** required conditionsを満たしたeligible calculated contributorsを集約し、counts/coverageを別保持。
- **Overall:** approved Fusion Profileを要求。One-layer fallback/weight redistribution禁止。Partial Overallはvisible provisional/partial labeling候補。
- **Quality boundary:** Product Score、Observation Quality、Completeness、Confidence、Crawl Coverageを分離。
- **Evidence Role:** `REQUIRED / OPTIONAL / CONDITIONAL / NOT_APPLICABLE`候補。Runtime Completeness/Eligibilityと分離。
- **Denominator:** Hybridを推奨。eligible expected setをcoverage母数、allowed calculated contributorsをaggregationへ利用。
- **Penalty:** Generic Missing/Partial direct penaltyは非推奨。Product absenceだけexplicit semantic mapping、coverage-adjusted scoreはCalibrationまでdefer。
- **Mixed/unsupported:** Semantic failure=`UNKNOWN + technical reason`候補。Silent deterministic fallback禁止。Unsupported historical inputはnon-calculated。
- **Snapshot/Strategy:** Score value/state/completeness/eligibility/reason/quality/lineageをmaterialize可能にし、promotion/lifecycleはPD-04。
- **Comparability:** Partial vs completeは自動比較せず、Formula/Profile/treatment/coverage compatibilityを確認。
- **Logical Contract:** identity、level、Score State/value、Completeness/reason、Eligibility/rule、input summaries、coverage、quality、lineage、formulaVersion/Profile、optional reanalysis signal。
- **Model A:** Strict Complete-only。required inputの局所policy候補。
- **Model B:** Eligibility-aware Calculation + Separate Quality Metadata=`RECOMMENDED / NOT_APPROVED`。
- **Model C:** Coverage-adjusted Scoring=`DEFER / CALIBRATION_REQUIRED`。
- **Parent status:** PD-02=`NEEDS_DISCOVERY`、PD-04=`READY_FOR_DISCOVERY / NON_BLOCKING_TO_PD-02D`。
- **Recommended next:** PD-45 Missing / Partial Score Contract Decision Review。
- **References:** [PD-44 Discovery](../audit/102-pd02d-missing-partial-score-contract-discovery.md)、[PD-43 Readiness Review](../audit/101-pd02d-pd04-dependency-discovery-readiness-review.md)

#### Phase PD-45 PD-02D Missing / Partial Score Contract Decision Review

- **Review status:** `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`。Approval Evidence=`NOT_PROVIDED`。
- **Completeness:** 5 statesを維持し、value=0、Score、Product qualityと分離するFinal Proposal。
- **Eligibility:** `ELIGIBLE / INELIGIBLE / CONDITIONALLY_ELIGIBLE / UNDETERMINED`をProfile ruleで解決し、Completenessと分離。
- **Score State:** `CALCULATED / NON_CALCULATED`。Non-calculatedはvalueなし + explicit reason。
- **MISSING:** Product absenceだがautomatic 0/Penaltyではない。Generic Missing Penalty=`REJECT`。
- **N/A:** eligible expected denominatorから除外。0/neutral mapping=`REJECT`。
- **UNKNOWN/Failure:** 0/MISSING/negative evidenceへ変換しない。Technical direct penalty=`REJECT`。
- **PARTIAL:** reason + coverage + lineage、conditional eligibility/qualityで扱う。Direct penalty=`REJECT`。
- **Evidence Role:** `REQUIRED / OPTIONAL / CONDITIONAL / NOT_APPLICABLE`をruntime stateから分離。Exact setはProfile-specific。
- **Denominator:** Hybrid Model。eligible expected setとnumeric calculated contributor setを分離。Observed-only default=`REJECT`。
- **Submetric:** Type/Profile-specific Eligibility-aware Calculation。Strict ruleはlocal Profile policy。
- **Axis/Layer:** required条件を満たしたeligible calculated contributorsをaggregate。Counts/coverage/qualityを別保持。
- **Overall:** 両Required Layer + approved Fusionでnormal score。Silent one-layer fallback/redistribution=`REJECT`。
- **Limited Score:** `CALCULATED + PARTIAL + reason/coverage/limitations`。Complete Scoreと無標識で同一表示しない。
- **Quality:** Product Score、Observation Quality、Completeness、Confidence、Crawl Coverageを分離。
- **Mixed/unsupported:** Semantic failureはUNKNOWN + technical reason。Silent deterministic fallback禁止。Unsupported historyはnon-calculated。
- **Snapshot/Strategy:** Score Calculation EligibilityのみPD-02D。Snapshot/Strategy lifecycleはPD-04。
- **Comparability:** Formula/Profile/Treatment/Completeness/Coverageを確認し、explicit compatibilityなしに比較可能としない。
- **Logical Contract:** identity/level、Score State/value、Completeness/reason、Eligibility/rule、counts、coverage/quality、limitations、lineage、formulaVersion/Profile、optional reanalysis signal。
- **Model A:** `KEEP AS LOCAL PROFILE POLICY`。
- **Model B:** `APPROVAL CANDIDATE / READY_FOR_APPROVAL`。
- **Model C:** `DEFER UNTIL CALIBRATION`。
- **Closure:** PD-02D Contract + Model B承認後にPD-02D=`DECISION_COMPLETE`。Threshold/Calibration/schema/implementationはblockerにしない。
- **Parent impact:** PD-02D承認後、PD-02 parent=`READY_FOR_CLOSURE_REVIEW`候補。現在は`NEEDS_DISCOVERY`。
- **Recommended next:** 明示承認時のみPD-46 Explicit Product Owner Approval Record。
- **References:** [PD-45 Decision Review](../audit/103-pd02d-missing-partial-score-contract-decision-review.md)、[PD-44 Discovery](../audit/102-pd02d-missing-partial-score-contract-discovery.md)

#### Phase PD-46 PD-02D Explicit Product Owner Approval Record

- **Approval Evidence:** 「PD-02DのMissing / Partial Score Contract Proposal、Treatment Model B、およびPD-02D Closure Proposalを承認する。」
- **Approval Date / Owner:** 2026-08-24 / Product Owner。
- **Contract:** Completeness、Eligibility、Score State、Missing/N/A/Unknown/Failure/Partial、Evidence Role、Hybrid Denominator、Submetric/Axis/Layer/Overall treatment、limited calculation、quality/comparability/explainability、logical contractを`DECIDED / APPROVED`。
- **Model disposition:** A=`KEEP AS LOCAL PROFILE POLICY`、B=`DECIDED / APPROVED / V1 DEFAULT TREATMENT MODEL`、C=`DEFER UNTIL CALIBRATION`。
- **Closure:** PD-02D Closure Proposal=`DECIDED / APPROVED`、PD-02D=`DECISION_COMPLETE`。
- **Non-completion boundary:** Implementation=`NOT_IMPLEMENTED`、Exact Thresholds/Required Sets=`NOT_DECIDED`、Calibration=`NOT_PERFORMED`。Exact JSON/DB/OpenAPIとRails/Worker/Frontend implementationはdeferred。
- **PD-04 boundary:** Snapshot/Strategy lifecycle、reanalysis/history/usage/billingはPD-04責務を維持。
- **Parent impact:** PD-02A〜Dがdecision-completeとなったためPD-02 parent=`READY_FOR_CLOSURE_REVIEW`。自動`COMPLETE`にはしない。
- **Recommended next:** PD-47 PD-02 Parent Closure Review。
- **References:** [PD-46 Approval Record](../audit/104-pd02d-missing-partial-score-contract-explicit-product-owner-approval-record.md)、[PD-45 Decision Review](../audit/103-pd02d-missing-partial-score-contract-decision-review.md)

#### Phase PD-47 PD-02 Parent Closure Review

- **Scope result:** Common 6 Axis identity/label/definition/boundary/order/versioning、Observation Contract、Formula Architecture/Policy/Version/Wire、Missing/Partial/Eligibility ContractはDecision上すべて閉じている。
- **Child status:** PD-02A=`DECIDED`、PD-02B=`DECIDED / COMPLETE`、PD-02C=`DECISION_COMPLETE`、PD-02D=`DECISION_COMPLETE`。
- **Contract chain:** Axis → Observation → Submetric/Formula → Formula Version/Wire → Missing/Partial Treatment → AnalysisScoreResultはidentity、lineage、Completeness、Eligibility、provenance、Score Stateで整合。
- **Versioning:** Axis Contract、Formula、Observation Schema、Analysis Pipeline、Snapshot Schemaを分離。Published immutability、historical reconstruction、silent reinterpret禁止を維持。
- **Residual classification:** Validation、Implementation、PD-04、Presentation handoff。`CLOSURE_BLOCKER=0`。
- **Closure recommendation:** `CLOSE_WITH_DEFERRED_ITEMS`。
- **Approval boundary:** Parent ClosureのProduct Owner明示承認は`NOT_PROVIDED`。Parent=`READY_FOR_CLOSURE_APPROVAL`とし、`DECIDED / COMPLETE`へは進めない。
- **Recommended next:** 明示承認受領時のみPD-48 PD-02 Parent Closure Explicit Product Owner Approval Record。
- **References:** [PD-47 Parent Closure Review](../audit/105-pd02-parent-closure-review.md)、[PD-46 Approval Record](../audit/104-pd02d-missing-partial-score-contract-explicit-product-owner-approval-record.md)

#### Phase PD-48 PD-02 Parent Closure Explicit Product Owner Approval Record

- **Approval Evidence:** 「PD-02 Common 6 Axis / Score Contract Parent Decisionを、Deferred Itemsを後続Phaseへ引き継ぐ条件でClosureすることを承認する。」
- **Closure Date / Owner:** 2026-08-24 / Product Owner。
- **Child status:** PD-02A=`DECIDED`、PD-02B=`DECIDED / COMPLETE`、PD-02C=`DECISION_COMPLETE`、PD-02D=`DECISION_COMPLETE`。
- **Six Axis:** Axis Contract v1=`ACTIVE`。6/6のID、Label、Definition、Boundary、Order、Version ownershipを維持。
- **Contract status:** Axis→Observation→Formula→Version/Wire→Missing/Partial/Eligibility→AnalysisScoreResultはDecision上整合。
- **Closure result:** blocker=0、Disposition=`CLOSE_WITH_DEFERRED_ITEMS`、Parent=`DECIDED / COMPLETE`、auxiliary=`CLOSED_WITH_DEFERRED_ITEMS`。
- **Deferred Ledger:** Validation、Implementation、PD-04、Presentation handoffを保持。`Deferred ≠ Forgotten`。
- **Non-completion boundary:** Exact Parameters=`NOT_DECIDED`、Calibration=`NOT_PERFORMED`、Implementation=`NOT_IMPLEMENTED`。
- **Recommended next:** PD-04 `partially_completed Snapshot Workflow` Full Discovery。
- **References:** [PD-48 Parent Closure Approval Record](../audit/106-pd02-parent-closure-explicit-product-owner-approval-record.md)、[PD-47 Parent Closure Review](../audit/105-pd02-parent-closure-review.md)

### PD-03 — Strategy Plan Rail

- **Status:** `NEEDS_DISCOVERY`
- **PD-60 inventory disposition:** `DEFERRED_NON_BLOCKER` / Class F。技術棚卸し済み、Product Discovery未完了、正式Review完了・Approval・Closureの記録なし。承認済みへ昇格させない。
- **Inventory Closure blocker:** No。既存B-3TのDEFER 2件とProduct handoffを維持。一般October標準化をblockしないが、当該2件のProduct意味変更・移動・削除前には判断とowner確定が必要。
- **Audit reference:** [PD-60 PD-03 status check](../audit/118-remaining-product-decision-closure-audit.md#pd-03-deep-status-check)
- **Problem:** `StrategyAnalysisPlanRail`と`StrategyAnalysisPlanRailCard`はproduction callerがなく`DEFER`である。現行Roadmap/Project RailとのProduct上の役割が不明である。
- **Why decision is needed:** 未到達2 componentを将来機能として保持するか、Roadmapへ概念統合するか、再定義/削除するかはStrategy IAの判断を要する。
- **Current behavior (`KNOWN`):** 親Railはcard modelを受け、選択・新規作成callbackを提供する。Cardはproject/site、day、progress、priority、fit score、status等を表示する。production routeから到達せず、現行StrategyにはProject Rail/Roadmapと30/60/90 task表現が存在する。
- **Options:** `KEEP_AS_FUTURE_FEATURE`、`MERGE_CONCEPTUALLY_WITH_ROADMAP`、`REDEFINE`、`REMOVE`、`DEFER_FOR_PRODUCT_DESIGN`。
- **Evidence required (`NEEDED`):** target user/use case、Roadmapとの差、navigation、approval関係、用語、interaction、将来release、prototype。存在だけからProduct価値を推測しない。
- **Dependencies:** Strategy Product IA、Product Design、Roadmap workflow。
- **Blocking:** DEFER 2 filesの最終処遇、Strategy内のplan/roadmap用語、重複UI整理。現行production behaviorはblockしない。
- **Owner:** `OWNER_REQUIRED`。推奨Accountable: Product Owner/Strategy Product Owner。Consulted: Product Design、Frontend。
- **Decision timing:** `CAN_DEFER`。ただしFrontend standardizationで当該directory/namingを移動する前、および削除前に再審査する。
- **Recommended next action:** `DEFER_FOR_PRODUCT_DESIGN`を暫定案とし、Roadmapとの比較prototypeと利用シナリオを用意する。判断前にcodeを削除しない。
- **Decision record:** 未決定。`DEFER`維持。
- **References:** [Frontend inventory](../inventory/frontend-inventory-summary.md)、[B-3T closure](../audit/58-frontend-inventory-parent-closure-review.md)

### PD-04 — partially_completed Snapshot Workflow

- **Status:** `DECISION_COMPLETE`
- **Auxiliary status:** `CLOSED_WITH_DEFERRED_ITEMS`
- **Decision result:** AnalysisJob outcome、Snapshot lifecycle/current、Strategy Source、reanalysis/history/usageのFinal ProposalとClosure ProposalをProduct Ownerが承認した。
- **Current behavior (`KNOWN`):** Frontendでは`partially_completed`をterminalとしてpollingを止める。結果はcompleted互換の表示へ投影しwarningを出し、reanalysisを可能にする。`committed_snapshot_id`は保持するが、Project current Snapshot更新を推測しない。自動的なStrategy source promotionは認めない。
- **Recommended model:** usable validated resultに基づくJob outcome、S-B Limited Snapshot、C-D/B/C current policy、P-D Partial Evidence-only、R-C new Job reanalysis、Explicit Reuse Profile、U-E Plan-specific Usage + U-C usable-result baseline。
- **Evidence status:** Canonical state/terminal ownership、Frontend mapping、PD-02 Score/Completeness/lineage boundaryは`KNOWN`。Exact cost、plan entitlement、retention、threshold、UXは後続Validation/Implementation/Presentation evidence。
- **Dependencies:** PD-02は`DECIDED / COMPLETE`。Rails physical implementationはDecision Review開始条件ではない。
- **Blocking:** 解消済み。Exact threshold、usage/price、retention、schema、implementationは後続handoffでありClosure blockerではない。
- **Owner:** Product Owner（PD-51 Approval Evidence）。Consulted: Backend/API、Analysis/Strategy、Frontend。実装担当者の割当は後続handoff。
- **Decision timing:** 2026-09-07にClosure。Backend connection/implementationは承認済みContractとDeferred Ledgerを参照する。
- **Recommended next action:** Marketing DecisionはPD-54、PD-01 ParentはPD-59で完了。PD-04 lifecycle/usage/retention/schema/Stripe/Presentationは承認済みhandoffに従う。
- **Decision record:** Approval Evidence「PD-04のpartially_completed Snapshot Workflow Proposal、およびPD-04 Closure Proposalを承認する。」を2026-09-07、Decision Owner=Product Ownerとして記録。PD-04=`DECISION_COMPLETE`、Implementation=`NOT_IMPLEMENTED`。
- **References:** [PD-51 Approval Record](../audit/109-pd04-partially-completed-snapshot-workflow-explicit-product-owner-approval-record.md)、[PD-50 Decision Review](../audit/108-pd04-partially-completed-snapshot-workflow-decision-review.md)、[PD-49 Full Discovery](../audit/107-pd04-partially-completed-snapshot-workflow-full-discovery.md)

#### Phase PD-49 PD-04 Full Discovery

- **Outcome:** `partially_completed`を、usable validated resultが存在するがrequired processingの一部が未完了で、limitationsを説明できるJob-level terminal outcomeとするCandidate。`failed`はvalid Product Result不成立。
- **Cancel/timeout:** terminal reasonを維持し、後からpartialへsilent rewriteしない。途中Evidence保持とFormal Snapshot作成を分離。
- **Snapshot:** S-B limitations付きpartial Snapshotを推奨。completed=`CAN_CREATE`、partial=`CONDITIONAL`、failed/cancelled/timed_out=`CANNOT_CREATE`。
- **Current:** latest/current/strategy sourceを分離。Completedだけpolicy-driven auto-promotion、Partialは自動昇格せず明示例外のみを推奨。
- **Strategy:** completedはvalidation後eligible。Partial v1はP-D Evidence reference onlyを推奨し、Formal Sourceへauto/manual promotionしない。
- **Reanalysis:** 全terminalからpolicy条件下でnew Jobを作成可能。Old Job/Result/Snapshotをmutationせずlineageを保持。Evidence reuseはexplicit reuse profileを推奨。
- **Usage:** U-E Plan-specific policy + U-C usable-result v1 default candidate。Usage entitlementとStripe chargeを分離。
- **Ownership:** Workerはtechnical execution/result、Railsはcanonical Business outcome、Snapshot/promotion/reanalysis/usage、Frontendはvalidated display/request。
- **Readiness:** Outcome、Snapshot、Strategy、Reanalysis/Usageの全workstream=`READY_FOR_DECISION_REVIEW`。PD-04 overall=`READY_FOR_DECISION_REVIEW / NOT_APPROVED`。
- **Deferred:** Exact threshold、usage unit/price、retention、schema、implementation、UI、Stripe、retry/queue code。
- **Recommended next:** PD-50 PD-04 Decision Review。
- **Reference:** [PD-49 Full Discovery](../audit/107-pd04-partially-completed-snapshot-workflow-full-discovery.md)

#### Phase PD-50 PD-04 Decision Review

- **Review status:** `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`。Approval Evidence=`NOT_PROVIDED`。
- **Job outcome:** usable validated Product Result + explicit limitationsを`partially_completed`とし、Observation/Axis/Score/Snapshot PARTIALから分離するFinal Proposal。
- **Failed/cancel/timeout:** valid Result不成立はfailed。Cancel/timeoutをterminal後にpartialへsilent rewriteせず、途中artifactとProduct Snapshotを分離。
- **Snapshot:** S-B Limited Snapshot。completed=`CAN_CREATE`、partial=`CONDITIONAL`、failed/cancelled/timed_out=`CANNOT_CREATE` baseline。
- **Current:** latest/current/strategy-sourceを分離。Completedはpolicy-driven auto-promotion可、Partialはauto不可でcontrolled exceptionのみ。
- **Strategy:** Completedはvalidation後eligible。Partial v1=P-D Evidence-onlyでFormal Sourceにしない。
- **Reanalysis/reuse:** R-C new identities + immutable lineage。Versioned Explicit Reuse Profile、recollection default、silent reuse禁止。
- **Usage:** U-E Plan-specific policy + U-C usable-result baseline。Usage EntitlementとStripe chargeを分離。
- **Ownership:** Rails=canonical Business outcome/lifecycle/promotion/reanalysis/usage、Worker=technical execution/facts、Frontend=validated display/request。
- **Closure:** Final Proposal承認後にPD-04=`DECISION_COMPLETE`。Exact threshold/price/retention/schema/implementationはblockerにしない。
- **Readiness:** Outcome、Snapshot、Strategy、Reanalysis/Usage、Closure Proposal、PD-04 overall=`READY_FOR_APPROVAL / NOT_APPROVED`。
- **Recommended next:** 明示承認時のみPD-51 Explicit Product Owner Approval Record。
- **Reference:** [PD-50 Decision Review](../audit/108-pd04-partially-completed-snapshot-workflow-decision-review.md)

#### Phase PD-51 PD-04 Explicit Product Owner Approval Record

- **Approval Evidence:** 「PD-04のpartially_completed Snapshot Workflow Proposal、およびPD-04 Closure Proposalを承認する。」
- **Approval Date / Owner:** 2026-09-07 / Product Owner。
- **Outcome:** usable validated Result + limitationsを`partially_completed`とし、failed/cancel/timeoutおよびObservation/Axis/Score PARTIALから分離。
- **Snapshot/current:** S-B Limited Snapshot、latest/current/source分離、Completed auto-promotion baseline、Partial no-auto + future controlled exception、immutable history。
- **Strategy:** Completedはvalidation後eligible。Partial v1=P-D `EVIDENCE_ONLY`でFormal Sourceへauto/manual promotionしない。
- **Reanalysis/reuse:** R-C new identities + lineage、Versioned Explicit Reuse Profile、recollection default、silent reuse禁止。
- **Usage:** U-E Plan-specific Policy + U-C usable-result baseline。Usage EntitlementとStripe chargeを分離。
- **Ownership:** Rails=canonical Business outcome/lifecycle/promotion/reanalysis/usage、Worker=technical execution/facts、Frontend=validated display/request。
- **Logical Contract:** AnalysisJobOutcome、Snapshot、StrategySource、Reanalysis、UsageDecision=`DECIDED / APPROVED`。
- **Closure:** PD-04 Closure Proposal=`DECIDED / APPROVED`、PD-04=`DECISION_COMPLETE`、auxiliary=`CLOSED_WITH_DEFERRED_ITEMS`。
- **Non-completion boundary:** Implementation=`NOT_IMPLEMENTED`。Threshold、usage/price、retention、schema、implementationは6分類のDeferred Ledgerへhandoff。
- **Recommended next:** PD-01 Marketing Route Intent External Evidence Review。
- **Reference:** [PD-51 Approval Record](../audit/109-pd04-partially-completed-snapshot-workflow-explicit-product-owner-approval-record.md)

## Resolved Decisions

### PD-05 — Settings Route Lifecycle

- **Status:** `DECIDED`
- **Original problem（削除前）:** `/app/login/settings`はprotected production route上のstarter scaffoldで、settings feature・内部導線・owner・期限がなかった。現行処遇は下記PD-3の削除済み記録を参照。
- **Why decision is needed:** Temporary route policyが要求するowner、purpose、exposure、review date、removal criteriaを満たさず、URL名もaccount/organization/authのどのsettingsかを表していない。
- **Current behavior (`KNOWN`):** Phase PD-3でroute fileと空directoryを削除した。production route inventoryから除外済みで、redirectやdedicated 404 UIは追加していない。`/app`、`/app/analysis`、App layout、Auth/Organization behaviorは不変である。
- **Options:** (A) 機能が承認されるまでrouteを削除する。(B) owner・purpose・review date付きの非導線temporary routeとして保持し、後続Phaseで承認済みholding UIへ置換する。(C) account/organization/auth settingsのどれかとしてfeature briefとURL contractを定義する。
- **Evidence:** Settings functionality、API、persistence、navigation、Product scope、feature ownerがないことを確認した。repository外bookmark/direct linkの不存在は証明できないが、Product Decisionはその失効リスクを受容した。
- **Dependencies:** Product route ownership decisionを充足。将来SettingsではAuth/Organization settings scopeの新規discoveryが必要。
- **Blocking:** 解消済み。temporary route cleanupとproduction exposureをPhase PD-3で終了した。
- **Owner:** Product Owner（Phase PD-3 implementation instructionでOption Aを明示承認）。Consulted: Auth/Organization Owner、Engineering。
- **Decision timing:** 2026-08-19に決定。
- **Recommended next action:** PD-3で実装・同期済み。今回追加作業なし。将来Settingsは別Product scopeで再審査する。
- **Decision record:** Option A — Remove Temporary Routeを2026-08-19に承認。実装開始時statusは`APPROVED_FOR_IMPLEMENTATION`。
- **References:** [PD-3 implementation](../audit/61-pd05-settings-route-removal-implementation.md)、[B-3Q audit](../audit/54-phase-b3q-route-ownership-refactor.md)、[Structure policy](../architecture/frontend-structure-policy.md)

#### PD-05 Decision Proposal

| Field             | Proposal                                                                               |
| ----------------- | -------------------------------------------------------------------------------------- |
| Decision ID       | PD-05                                                                                  |
| Question          | `/app/login/settings`をclosed betaへ残すか                                             |
| Option A          | 機能承認までrouteを削除                                                                |
| Option B          | owner・purpose・review date・removal criteria付きで一時保持                            |
| Option C          | settings種別を定義し、正式feature entryとして再設計                                    |
| Recommendation    | owner・purpose・期限を提示できない場合はOption A                                       |
| Reason            | 未接続starter scaffoldのproduction exposureを終え、将来の正式URLを誤って固定しないため |
| Tradeoffs         | 直接bookmarkがあれば失効する。B/Cは管理責任と後続実装が必要                            |
| Migration impact  | 決定後にroute removal/holding UI/正式feature化を別実装Phaseで行う                      |
| Decision owner    | Product Owner（Auth/Organization、Engineering consulted）                              |
| Required approval | Product Ownerの明示承認と決定日                                                        |

#### Phase PD-2 Decision Review（historical pre-decision）

- **Status:** `READY_FOR_DECISION`を維持する。Product Ownerの明示承認、Decision Owner名、Decision Dateが提示されていないため`DECIDED`へ変更しない。
- **Owner:** `OWNER_REQUIRED`。Product OwnerをAccountable候補、Auth/Organization OwnerとEngineeringをConsulted候補とするが、Codexが実在のOwnerを代入しない。
- **Evidence (`KNOWN`):** routeとPageは実在する。PageはSvelte starter本文とSvelte公式文書への外部リンクだけを描画する。App layoutを継承し、server hookのdefault protected policyにより認証とactive Organization membershipを要求する。内部navigationはなく、unit testとproduction smokeがrouteを参照する。direct URL、bookmark、browser historyによる到達可能性はある。
- **Evidence (`UNKNOWN`):** 実在bookmark/external inbound link、Product roadmap、settings owner、purpose、review date、release時期、User/Account/Organization/Auth/Notification/Billing/Workspaceのどのscopeか。
- **Functionality assessment:** settings form、persistence、settings API、account setting、organization setting、authentication settingは確認できない。routeの保護境界をsettings機能のscope Evidenceとして扱わない。
- **Route semantics:** `/app/login/settings`はauthenticated App配下にありながら`login`配下を名乗るため、現行責務とhierarchyが整合せず曖昧である。rename先はProduct IAなしに推測しない。
- **Options:** Option Aはtemporary route削除、Option Bはowner/purpose/review date/removal criteria付きplaceholder保持、Option CはSettings Product Scopeへの正式commitである。
- **Recommendation:** owner、purpose、期限がない現状ではOption Aを推奨する。ただしRecommendationとDecisionを区別し、本Reviewではrouteを削除しない。
- **Decision:** 未承認。Selected Option、Rationale、Approval、Decision Dateは空欄のままとする。
- **Timing:** `NOW`、遅くとも`BEFORE_CLOSED_BETA`。
- **Blocking:** temporary route cleanup、正式なsettings IA/name、production exposureの終結だけをblockする。現行App、Auth、Organization、一般Frontend Standardizationはblockしない。
- **Standardization impact:** 全体は`NON_BLOCKING`。当該routeのnaming/page taxonomyだけはDecisionまで`PARTIAL`として除外する。
- **Architecture impact:** Route Entry/Temporary Route/Naming/Page taxonomy policyの変更は不要。現状はTemporary Route Policyの必須metadataを満たしておらず、その解消方法をProductが選ぶ段階である。Layout/Auth/Organization boundaryは変更対象外。
- **Technical Debt linkage:** 専用の既存Technical Debt IDは確認できない。PD-05が本件のcanonical Product Decision IDであり、新しい重複Debt IDは作成しない。実装前に`RESOLVED`とはしない。
- **Implementation handoff:** Product OwnerがOption Aを承認した場合のみ、別のPD-05 Implementation Phaseでroute、route ownership test、smoke、inventory/Active Graph/docsを同期する。Option Bはowner/purpose/review date/removal criteriaと承認済みplaceholder UX、Option CはSettings taxonomy・ownership・permissions・data/API・Design・navigation・MVP priorityのdiscoveryを前提とする。
- **References:** [Phase PD-2 audit](../audit/60-pd05-settings-route-decision-review.md)、[Route ownership](../architecture/frontend-route-ownership.md)、[Temporary Route Policy](../architecture/frontend-structure-policy.md)、[PD-1 audit](../audit/59-product-decision-backlog-review.md)

#### Conditional Option A Implementation Contract

| Field                    | Handoff                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Implementation Objective | 未承認starter scaffold routeを削除し、将来Settingsを正式なIA/routeとして再設計可能にする                                             |
| Allowed Changes          | `src/routes/app/login/settings`削除、対応test/smoke/inventory/Active Graph/route ownership/docs同期                                  |
| Forbidden Changes        | 他routeのrename/redirect、Settings実装、UI/navigation変更、Auth/Organization policy変更、Rails/BFF/OpenAPI変更                       |
| Acceptance Criteria      | route削除、内部参照0、unresolved import 0、inventory同期、smoke更新、他Product URL不変、Auth/Organization behavior不変、quality PASS |
| Migration Notes          | 実在bookmark/external inbound linkを実装前に再確認し、必要ならProduct承認済みのgone/redirect方針を別途定める                         |
| Tests                    | route ownership test、production route smoke、inventory check、既存auth smoke、full quality                                          |
| Documentation Updates    | Product Decision Register、route ownership、Active Graph、inventory、Development Log、implementation audit                           |

#### Phase PD-3 Approved Decision

| Field                 | Decision Record                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Decision              | Remove `/app/login/settings`                                                                                                                     |
| Selected Option       | Option A — Remove Temporary Route                                                                                                                |
| Decision Owner        | Product Owner（PD-3指示書による明示承認）                                                                                                        |
| Decision Date         | 2026-08-19                                                                                                                                       |
| Reason                | Settings functionality、API、persistence、navigation、Product scope、feature ownerがなく、starter scaffoldを将来のProduct IAとして固定しないため |
| Product Scope Impact  | 未定義SettingsをMVP/Closed Beta scopeへ暗黙追加しない                                                                                            |
| User Impact           | repository外のbookmark/direct linkはSvelteKit標準not-foundとなるリスクを受容。redirectは追加しない                                               |
| Future Rule           | Settingsが必要になった場合は、User/Organization/Auth等のscope、ownership、IAをProduct Discoveryで定義してから正式routeを新設する                 |
| Implementation Status | `IMPLEMENTED`                                                                                                                                    |
| Implementation Phase  | PD-3                                                                                                                                             |
| Result                | `/app/login/settings` route fileと空directoryを削除。redirectなし。production routes 9→8、quality PASS                                           |
| Revisit Condition     | Settings Product Discoveryと新しいProduct Decisionが承認された場合。現在のPD-05を単純にreopen/rollbackしない                                     |

## Decision Dependency Matrix

| Decision | Upstream evidence/authority                       | Downstream work                                       | Cycle |
| -------- | ------------------------------------------------- | ----------------------------------------------------- | ----- |
| PD-01    | Marketing IA、SEO、campaign、analytics            | Marketing route lifecycle、metadata、naming           | なし  |
| PD-01A   | Product Owner承認、現行App navigation             | App Route Role（Decision済み、source変更なし）        | なし  |
| PD-01B   | App state/share/security contract                 | route-aware state、bookmark/share                     | なし  |
| PD-02    | Product metric、Analysis domain、Backend schema   | axis mapping、semantic tokens、shared score UI        | なし  |
| PD-03    | Strategy IA、Product Design                       | DEFER file処遇、roadmap重複整理                       | なし  |
| PD-04    | Rails AnalysisJob/Snapshot/usage/lineage contract | BFF/client、Snapshot/Strategy workflow、UI regulation | なし  |
| PD-05    | Product/Auth/Organization ownership               | Phase PD-3でroute cleanup完了                         | なし  |

Standardizationは決定結果のconsumerであり、Product semanticsを逆向きに定義しない。循環依存は確認されていない。

## Decision Timing

| Order | Decision | Timing                            | Reason                                   |
| ----: | -------- | --------------------------------- | ---------------------------------------- |
|     1 | PD-01    | `BEFORE_PUBLIC_INDEXING`          | Marketing URL・SEOを固定する前に必要     |
|     2 | PD-01B   | `BEFORE_CLOSED_BETA`              | stateful deep-link/share公開前に必要     |
|     3 | PD-02    | `BEFORE_FRONTEND_STANDARDIZATION` | semantic score/axis共有化をblockする     |
|     4 | PD-04    | `BEFORE_BACKEND_CONNECTION`       | Backend contractと共同で決める必要がある |
|     5 | PD-03    | `CAN_DEFER`                       | production非到達で現行機能をblockしない  |

PD-04のBackend discoveryは、上記順序とは別に並行開始できる。

## Frontend Standardization Impact

| Area               | Impact         | Boundary                                                               |
| ------------------ | -------------- | ---------------------------------------------------------------------- |
| Component taxonomy | `NON_BLOCKING` | 5件とも一般taxonomyを妨げない                                          |
| Directory          | `PARTIAL`      | PD-03対象の移動・削除判断は保留                                        |
| Design Token       | `PARTIAL`      | PD-02承認済み尺度/identityを入力。exact tone/token値はPresentationへ   |
| Tailwind           | `NON_BLOCKING` | Product decisionと独立                                                 |
| Responsive         | `NON_BLOCKING` | 一般baselineは進行可。workflow固有画面は決定後に確認                   |
| UI Regulation      | `PARTIAL`      | PD-02/04意味は承認済み。exact UI/copy/accessibilityは後続              |
| Naming             | `PARTIAL`      | App/Marketing roleとAxis identityは承認済み。PD-03と具体的表示名は保留 |

October Standardization全体は`PARTIAL`であり、全面blockではない。generic structure、基礎token、responsive/accessibility baselineは進め、Product意味を含む命名・formula・route lifecycleは本Registerを参照する。

## Resolved Decisions Summary

| ID              | Decision                                       | Date       | Implementation                                       | Revisit condition                                                  |
| --------------- | ---------------------------------------------- | ---------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| PD-01 Marketing | Public Marketing Route / Canonical Contract    | 2026-09-07 | `NOT_IMPLEMENTED`、branch Decision Complete          | Product intent変更またはdeferred dispositionを決定する場合         |
| PD-01A          | A-A — Distinct App Route Roles, Shared Runtime | 2026-08-20 | `NO_IMMEDIATE_SOURCE_CHANGE`、現行shared Shellを承認 | route-aware state/share linkを設計する場合                         |
| PD-05           | Option A — Remove `/app/login/settings`        | 2026-08-19 | Phase PD-3 `IMPLEMENTED`、redirectなし、quality PASS | Settings Product Discoveryと新しいProduct Decisionが承認された場合 |

## References

- [Frontend Inventory Summary](../inventory/frontend-inventory-summary.md)
- [Frontend Inventory Parent Closure Review](../audit/58-frontend-inventory-parent-closure-review.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Phase PD-1 Audit](../audit/59-product-decision-backlog-review.md)
- [Phase PD-2 Audit](../audit/60-pd05-settings-route-decision-review.md)
- [Phase PD-3 Implementation Audit](../audit/61-pd05-settings-route-removal-implementation.md)
- [Phase PD-4 Route Intent Discovery](../audit/62-pd01-route-intent-discovery.md)
- [Phase PD-5 App Route Role Decision](../audit/63-pd01a-app-route-role-decision.md)
- [Phase PD-6 Score / Axis Discovery](../audit/64-pd02-score-common-axes-data-dictionary-discovery.md)
- [Phase PD-7 Display Scale / Presentation Decision](../audit/65-pd02a-display-scale-presentation-boundary-decision.md)
- [Phase PD-8 Canonical Axis Identity Discovery](../audit/66-pd02b-canonical-axis-identity-discovery.md)
- [Phase PD-9 Axis Set / Label Identity Decision Review](../audit/67-pd02b-axis-set-label-identity-decision.md)
- [Phase PD-10 Product Owner Approval Check](../audit/68-pd02b-product-owner-approval-decision-record.md)
- [Phase PD-11 Explicit Product Owner Approval Record](../audit/69-pd02b-explicit-product-owner-approval-record.md)
- [Phase PD-12 Canonical ID & Funnel Naming Discovery](../audit/70-pd02b-canonical-id-funnel-naming-discovery.md)
- [Phase PD-13 Five Canonical IDs Decision Review](../audit/71-pd02b-five-canonical-ids-decision-review.md)
- [Phase PD-14 Five Canonical IDs Explicit Approval Record](../audit/72-pd02b-five-canonical-ids-explicit-approval-record.md)
- [Phase PD-15 Funnel Axis Definition Evidence Workshop](../audit/73-pd02b-funnel-axis-definition-evidence-workshop.md)
- [Phase PD-16 Funnel Axis Definition / Canonical ID Decision Review](../audit/74-pd02b-funnel-axis-definition-canonical-id-decision-review.md)
- [Phase PD-17 Funnel Axis Explicit Product Owner Approval Record](../audit/75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)
- [Phase PD-18 Remaining Five Axis Definitions Discovery](../audit/76-pd02b-remaining-five-axis-definitions-discovery.md)
- [Phase PD-19 Remaining Five Axis Definitions Decision Review](../audit/77-pd02b-remaining-five-axis-definitions-decision-review.md)
- [Phase PD-20 Remaining Five Axis Definitions Explicit Approval](../audit/78-pd02b-remaining-five-axis-definitions-explicit-approval-record.md)
- [Phase PD-21 Canonical Order Discovery](../audit/79-pd02b-canonical-order-discovery.md)
- [Phase PD-22 Canonical Order Decision Review](../audit/80-pd02b-canonical-order-decision-review.md)
- [Phase PD-23 Canonical Order Explicit Approval](../audit/81-pd02b-canonical-order-explicit-product-owner-approval-record.md)
- [Phase PD-24 Snapshot Order Lineage Evidence Workshop](../audit/82-pd02b-snapshot-order-lineage-evidence-workshop.md)
- [Phase PD-25 Axis / Order Versioning Discovery](../audit/83-pd02b-axis-order-versioning-discovery.md)
- [Phase PD-26 Axis / Order Versioning Decision Review](../audit/84-pd02b-axis-order-versioning-decision-review.md)
- [Phase PD-27 Axis / Order Versioning Explicit Product Owner Approval Record](../audit/85-pd02b-axis-order-versioning-explicit-product-owner-approval-record.md)
- [Phase PD-28 Score Formula / Backend Contract Discovery](../audit/86-pd02c-score-formula-backend-contract-discovery.md)
- [Phase PD-29 Axis Formula / Submetric Evidence Workshop](../audit/87-pd02c-axis-formula-submetric-evidence-workshop.md)
- [Phase PD-30 Differentiation / Decision Support Calibration](../audit/88-pd02c-differentiation-decision-support-evidence-calibration.md)
- [Phase PD-31 Observation Output Contract Discovery](../audit/89-pd02c-observation-output-contract-discovery.md)
- [Phase PD-32 Observation Output Contract Decision Review](../audit/90-pd02c-observation-output-contract-decision-review.md)
- [Phase PD-41 Formula Version / Backend Wire Contract Decision Review](../audit/99-pd02c-formula-version-backend-wire-contract-decision-review.md)
- [Phase PD-42 Formula Version / Backend Wire Contract Explicit Product Owner Approval Record](../audit/100-pd02c-formula-version-backend-wire-contract-explicit-product-owner-approval-record.md)
- [Phase PD-43 PD-02D / PD-04 Dependency and Discovery Readiness Review](../audit/101-pd02d-pd04-dependency-discovery-readiness-review.md)
- [Phase PD-44 PD-02D Missing / Partial Score Contract Discovery](../audit/102-pd02d-missing-partial-score-contract-discovery.md)
- [Phase PD-45 PD-02D Missing / Partial Score Contract Decision Review](../audit/103-pd02d-missing-partial-score-contract-decision-review.md)
- [Phase PD-46 PD-02D Missing / Partial Score Contract Explicit Product Owner Approval Record](../audit/104-pd02d-missing-partial-score-contract-explicit-product-owner-approval-record.md)
- [Phase PD-47 PD-02 Parent Closure Review](../audit/105-pd02-parent-closure-review.md)
- [Phase PD-48 PD-02 Parent Closure Explicit Product Owner Approval Record](../audit/106-pd02-parent-closure-explicit-product-owner-approval-record.md)
- [Phase PD-49 PD-04 partially_completed Snapshot Workflow Full Discovery](../audit/107-pd04-partially-completed-snapshot-workflow-full-discovery.md)
- [Phase PD-50 PD-04 partially_completed Snapshot Workflow Decision Review](../audit/108-pd04-partially-completed-snapshot-workflow-decision-review.md)
- [Phase PD-51 PD-04 partially_completed Snapshot Workflow Explicit Product Owner Approval Record](../audit/109-pd04-partially-completed-snapshot-workflow-explicit-product-owner-approval-record.md)
- [Phase PD-52 PD-01 Marketing Route Intent External Evidence Review](../audit/110-pd01-marketing-route-intent-external-evidence-review.md)
- [Phase PD-53 PD-01 Marketing Route Intent Decision Review](../audit/111-pd01-marketing-route-intent-decision-review.md)
- [Phase PD-54 PD-01 Marketing Route Intent Explicit Product Owner Approval Record](../audit/112-pd01-marketing-route-intent-explicit-product-owner-approval-record.md)
- [Phase PD-55 PD-01B App Deep-link / State Restoration Contract Discovery](../audit/113-pd01b-app-deeplink-state-restoration-contract-discovery.md)
- [Phase PD-56 PD-01B App Deep-link / State Restoration Contract Decision Review](../audit/114-pd01b-app-deeplink-state-restoration-contract-decision-review.md)
- [Phase PD-57 PD-01B Explicit Product Owner Approval Record](../audit/115-pd01b-app-deeplink-state-restoration-contract-explicit-product-owner-approval-record.md)
- [Phase PD-58 PD-01 Parent Closure Review](../audit/116-pd01-parent-closure-review.md)
- [Phase PD-59 PD-01 Parent Explicit Product Owner Approval Record](../audit/117-pd01-parent-explicit-product-owner-approval-record.md)
- [Phase PD-60 Remaining Product Decision Closure Audit](../audit/118-remaining-product-decision-closure-audit.md)
- [Phase PD-61 Inventory Parent Closure Review](../audit/119-aug-sep-frontend-inventory-parent-closure-review.md)
- [Phase PD-62 Inventory Parent Explicit Product Owner Approval Record](../audit/120-aug-sep-frontend-inventory-parent-explicit-product-owner-approval-record.md)
- [Development Log](../DEVELOPMENT_LOG.md)

## Next Decision Review

- **Next Product Decision:** PD-03はProduct化・移動・削除のreopen condition成立時に再審査する。それまでは`NEEDS_DISCOVERY / DEFERRED_NON_BLOCKER`。
- **Next Major Phase:** October Frontend Standardization Kickoff（Phase IDは開始時に決定）。
- **Input:** PD-62 Approval Record、Frontend Inventory Parent、Structure Policy、Deferred Ledger。
- **Boundary:** Inventory ClosureをSource実装、PD-03 Closure、October作業完了、production readinessへ拡張しない。
