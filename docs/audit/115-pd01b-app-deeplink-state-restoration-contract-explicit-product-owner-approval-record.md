# Phase PD-57 — PD-01B App Deep-link / State Restoration Contract Explicit Product Owner Approval Record

## Approval Evidence

> PD-01B App Deep-link / State Restoration Contract、Model C、およびPD-01B Closure Proposalを承認する。

- **Evidence source:** ユーザー提供のPD-57指示書（添付`7eac8750-8f3b-478d-87a3-bcdd0a990337/pasted-text.txt`）。Product Ownerの明示承認として提示された上記文を原文のまま記録する。
- **Approval Date:** 2026-09-07（指示書指定日）。
- **Decision Owner:** Product Owner。
- **Record Date:** 2026-09-14。Approval Dateを記録作成日で上書きしない。
- **Approval scope:** [PD-56 Decision Review](./114-pd01b-app-deeplink-state-restoration-contract-decision-review.md)のPD-01B Logical Contract、Model C、PD-01B Closure Proposal。正式DirectionおよびLogical Requirementも以下に記録する。
- **Contract status:** `DECIDED / APPROVED`。
- **PD-01B final status:** `DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`。
- **Closure blocker count:** `0`。
- **Implementation status:** `NOT_IMPLEMENTED`。
- **Source changes:** `NONE`。

本PhaseはApproval-only / Documentation-only。PD-55/56の過去の未承認記録は当時の履歴として保持する。新規DiscoveryやSource再監査は実施していない。

## Approved Deep-link and Restoration Contract

Deep-linkはAuthenticated App内のstable Resource / Context / Meaningful ViewをURLで指定し、次のflowで復元する。

`URL Selector -> Authenticated BFF -> Rails Authorization / Canonical Resolution -> Frontend Render`

Marketing Public URL、Public Share URL、Transient UI Stateとは分離する。

### Restoration Source Hierarchy

| Priority | Selector Priority | Canonical Authority |
| --- | --- | --- |
| 1 | Explicit URL Resource Identity | Authenticated Actor / Session |
| 2 | Server Current Pointer | Rails Canonical State |
| 3 | Organization-scoped Preference | Persisted AnalysisJob / Snapshot |
| 4 | UI Default | Validated Client Cache |
| 5 | — | Transient Frontend State |

`DECIDED / APPROVED`。Selectorは到達意図を表し、Railsが認可とresourceの事実を確定する。上表のcache/transientはcanonical authorityを代替できるfallbackではない。Frontend MemoryをCanonical Restoration Sourceにしない。

### State ownership — Approved Direction

| State | Approved boundary |
| --- | --- |
| URL-owned | stable resource identity、AnalysisJob identity、Snapshot identity、meaningful semantic view/tab、meaningful comparison target、stable/privacy-safe filter/sortを保持可能 |
| URL criteria | bookmarkable、reload-safe、history meaningful、authorized-shareable、semantically stable |
| Frontend-local | modal、hover、accordion、animation、loading、notification、unsaved input、ephemeral preferences |
| Promotion to URL ownership | Product meaningを持つ場合のみ別Decisionで昇格可能 |
| Tab / View | `competitor`、`industry`、`self`、`strategy`は既存候補。Share/Bookmark/History上意味のあるSemantic ViewをURL-ownedにできる。全tabの実装を確定したものではない |
| Filter / Sort | stable meaning、authorized shareability、privacy safety、reload/history valueを満たすものはURL-owned。ephemeral display convenienceはclient-local |
| Unsaved State | Canonical Restoration対象外がbaseline。将来Stable Server Draft Identityが成立した場合のみ復元対象へ昇格可能 |

Exact parameter naming、serialization、route shape、Draft Persistence / Discard Warningは`DEFER`。

## Approved Route and Resource Semantics

| Item | Approved v1 Contract |
| --- | --- |
| `/app` | App Home / Analysis Entry。Home、authorized Organization context summary、利用可能なcurrent analysis summary、new analysis entryを表示可能。`/app/analysis`へsilent redirectしない |
| `/app/analysis` without explicit identity | Active Organizationのserver-authorized Current Analysis Entry。currentありならCurrent Analysis Workspace、currentなしならAnalysis Entry / Empty State。chronological latestへのsilent fallbackは禁止 |
| Project / Target | Mutable workspace / domain context |
| AnalysisJob ID | Process / Outcome identity |
| Snapshot ID | Immutable Historical Artifact identity |
| Current Pointer | Server-owned mutable convenience relationship |
| Result ID | App route identityとしてのcanonical ownershipは`DEFER`。既存Score等のlogical ID決定を変更しない |

Current / Historical invariantは`latest != current != strategy source != historical Snapshot`。これは役割・意味を同一視しないという原則であり、同一Snapshotがcurrent等から参照されることを禁じるものではない。Historical ResourceをCurrent Pointerで代替せず、historical reproducibilityにはExplicit Snapshot Identityを使用する。

### AnalysisJob and Snapshot Deep-link

- **AnalysisJob:** `DECIDED / APPROVED`。running、completed、partially_completed、failed、cancelled、timed_outをRails Canonical Job Outcomeから復元する。FrontendでOutcomeを推測しない。
- **Snapshot:** `DECIDED / APPROVED`。Snapshot Deep-linkをv1 Logical Contract Requirementとする。目的はhistorical reproducibility、audit、comparison、Organization internal sharing、Strategy evidence traceability。Snapshot Immutabilityの既存Decisionを維持する。

## Approved Organization / Authentication / Security Boundary

| Item | Approved policy |
| --- | --- |
| Organization Context | Explicit ResourceはResource-derived OrganizationをRailsがresolve/validate。Session-current Organizationはidentity-less route defaultに限定。Session PreferenceをAuthorization Source of Truthにしない |
| Cross-Organization | Authorized Resourceはroute-scoped Organization Contextで表示可能。Persistent Organization Preferenceの変更はexplicit action / confirmationによって行い、silent Organization switchは`REJECT`。確認UIの具体形は未決定 |
| Authentication Return-to | Validated Same-Origin Destination保持 -> Login -> Resource Authorization再検証 -> Original DestinationへReturn。Open Redirectは禁止。Exact implementationはdefer |
| Authorization Failure | Approved Direction: Cross-Organization / Existence Disclosure RiskはNon-disclosing Not Found。同一Organizationのrole不足はForbidden。Exact HTTP status / UX mappingはdefer |
| URL Security | URL IdentityはRequest SelectorでありAuthorization Proofではない。全resource accessにBackend authorizationが必要。queryへsecret、access token、sensitive payloadを含めない |
| Shareability | v1 scopeはsame-user bookmark、same-Organization internal sharing。External Public Sharingは`DEFER / Separate Product Decision` |
| App Semantic URL | Authenticated Semantic Resource Identity。Marketing SEO Canonical / Public Indexingと分離し、SEO Canonical RulesをApp Resource Identityへ流用しない |

## Approved History and Failure Contract

| Item | Approved policy |
| --- | --- |
| Resource Missing | deleted / expired / invalid / unknownなExplicit ResourceはExplicit Failure State。current、latest、another Snapshot、`/app`、another Organization、another Resourceへsilent fallbackしない |
| Historical Incompatibility | unsupported formulaVersion / schema / contract / pipeline等はgeneration-time semanticsを保持。view-onlyまたはexplicit unsupported stateで扱い、Current semanticsへsilent reinterpretしない |
| Reload | Explicit Identity URLは同じResourceを再取得。Current Pointer URLはreload時点のCurrent。同一Historical Snapshot保証にはExplicit Snapshot Identityを使用 |
| Back / Forward | URL-owned resource、meaningful view、comparison、stable filterを復元。Ephemeral Component Stateの完全復元は要求しない |
| Restoration Failure | authentication required、authorization denied、resource missing、unsupported historical、backend unavailable、incomplete contextを区別。Generic `/app` redirectで全Failureを吸収しない |
| Silent Fallback | Explicit Deep-link失敗時、latest、current、another Snapshot、another Organization、another Resourceへsilent fallbackしない。意図を変更するFallbackはexplicit policyなしに行わない |

### Restoration UI Requirement

正式Logical RequirementとしてFrontendは最低限、authentication required、loading、restored、unavailable、forbidden、missing、unsupported historical、incomplete contextを区別可能にする。Exact UIはPresentation Handoff。

## Approved Ownership Boundary

| Owner | Responsibility |
| --- | --- |
| Client Cache | Performance Optimization。Canonical Source of Truthではない。Organization scoped、Resource scoped、Version awareをLogical Requirementとする |
| BFF | session/cookie、same-origin authentication boundary、Organization context transport、Rails proxy、safe return-to transport。Canonical Product Restoration Ruleを独自Business Logicとして持たない |
| Rails | membership、role、resource ownership、Organization authorization、current pointer、AnalysisJob canonical state、Snapshot resolution、historical validity、canonical resource response |
| Frontend | URL selector parsing、semantic navigation、validated backend response rendering、restoration/failure UI、transient local state。Canonical Business Stateを推測しない |

## Restoration Model — Final Disposition

| Model | Final disposition |
| --- | --- |
| A — Session-driven Restoration | `REJECT AS CANONICAL MODEL` |
| B — Explicit Resource Deep-link Only | `KEEP AS STRICT RESOURCE PATTERN` |
| C — Hybrid Current Pointer + Explicit Historical Resource | `DECIDED / APPROVED` — PD-01B v1 Default Restoration Model |

Model Cは、identity-less convenience entryにServer-authorized Current Pointerを用い、AnalysisJob/Snapshot等へのnavigationにExplicit Resource Identityを用いる。HistoricalはImmutable Snapshot Identity、Missing Explicit ResourceはExplicit Failure、SecurityはBackend Authorization Requiredとする。

## PD-01B Logical Contract — DECIDED / APPROVED

| Contract | Approved meaning |
| --- | --- |
| Deep-link | Stable authenticated resource selector |
| Restoration | URL Selector -> Authenticated BFF -> Rails Authorization / Canonical Resolution -> Frontend Render |
| Current | Server-owned mutable pointer |
| Historical | Explicit immutable Snapshot identity |
| Organization | Resource-derived / Backend-authorized |
| Failure | Explicit state |
| Cache | Non-canonical optimization |
| Transient UI | Frontend-local |
| Security | URL Identity != Authorization |
| Fallback | No silent intent-changing fallback |

## Closure and Parent Impact

Approval Evidence、Approval Date、Decision Ownerが揃い、PD-01B Closure Proposalは正式承認された。

| Area | Final status |
| --- | --- |
| Deep-link Contract | `DECIDED / APPROVED` |
| Restoration Contract | `DECIDED / APPROVED` |
| Ownership Boundary | `DECIDED / APPROVED` |
| Model C | `DECIDED / APPROVED` |
| PD-01B Closure | `APPROVED` |
| PD-01B | `DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS` |
| PD-01B Closure blocker count | `0` |
| PD-01A | `DECIDED`（維持） |
| Marketing Route Branch | `DECISION_COMPLETE`（維持） |
| PD-01 Parent | `READY_FOR_CLOSURE_REVIEW` |

PD-01 Parent Closure自体は本承認の対象外であり、実施していない。

## Deferred Ledger

`Deferred != Forgotten`。次の項目は記録して後続へ引き継ぐ。担当領域と再開条件はhandoff先を示し、人員の割当や新しい実装承認を意味しない。

| Class | Deferred items | Handoff / resume condition |
| --- | --- | --- |
| ROUTE / IMPLEMENTATION | Exact URL schema、path/query/nested routes、`/jobs/:id`・`/snapshots/:id`等のshape、naming、serialization、Current Pointer implementation | Route Design / Engineering。承認済みSemantic Identity Contractを入力として別Phaseで具体化 |
| DATA / CONTRACT | DB、OpenAPI、Canonical endpoints、Result ID ownership | Domain / Backend / API。resource契約の具体化Phaseで再開 |
| SOURCE IMPLEMENTATION | Rails、BFF、Frontend、URL-driven restoration、explicit Snapshot selection、Organization-scoped current pointer | Engineering。別implementation scopeの確定後 |
| PRODUCT | Public Sharing、Draft Persistence、関連discard warning | Product Owner。個別workflowのDecision時 |
| PRESENTATION | Restoration UI、Error mapping、HTTP status / UX mapping | Presentation / Security / Engineering。failure契約の実装設計時 |
| ANALYTICS / TEST | Analytics、Browser E2E | Analytics / QA / Engineering。navigation実装と検証計画時 |

PD-01BはSemantic Identity Contractまで正式決定した。Exact URL Schemaの承認や公開を意味しない。

## Implementation Boundary

`Decision Complete != Implementation Complete`。Implementation Statusは`NOT_IMPLEMENTED`、Source Changesは`NONE`。

既知のImplementation GapはPD-55/56から継承する: URL-driven restoration、explicit Snapshot selection、Organization-scoped current pointer、canonical Rails resource endpoints。今回これらを新規調査・実装していない。既存shared runtime / AnalysisJob adapter / safe return-toがあることと、承認済みContract全体の実装完了は区別する。

## Validation and changed artifacts

変更対象は本Audit、[Product Decision Register](../product/product-decision-register.md)、[Development Log](../DEVELOPMENT_LOG.md)の3文書。

確認結果（2026-09-14）:

- Approval Evidence原文を指示書と3文書で照合: PASS。Approval Date=2026-09-07、Decision Owner=Product Ownerを確認。
- 現在のPD-01B final status、Closure blocker=0、PD-01 Parent readinessを同期: PASS。現行PD-01B欄に旧未承認Statusなし。PD-55/56の履歴は保持。
- Deferred Ledgerの6分類と未実装境界を確認: PASS。
- 3文書のローカルMarkdown参照の存在、競合マーカーなし: PASS。
- `.git` metadataなし。Git diffは利用不可のため対象文書の直接確認で代替。リポジトリ全体の差分を確認済みとは扱わない。
- 本Phaseの書き込みは上記3文書のみ。Full quality gate、Source変更、Route変更、DB/OpenAPI変更、Rails/BFF/Frontend実装、新規Discoveryは実施していない。

## References

- [PD-56 Decision Review](./114-pd01b-app-deeplink-state-restoration-contract-decision-review.md)
- [PD-55 Discovery](./113-pd01b-app-deeplink-state-restoration-contract-discovery.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Development Log](../DEVELOPMENT_LOG.md)

## Recommended next Phase

Phase PD-58 — PD-01 Parent Closure Review。PD-01A、Marketing Route Branch、PD-01BのDecision完了とDeferred handoffをParent scopeで確認する。Parent Closureはその後の明示承認対象として扱う。
