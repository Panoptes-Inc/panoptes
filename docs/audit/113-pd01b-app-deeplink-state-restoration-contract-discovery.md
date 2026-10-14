# Phase PD-55 — PD-01B App Deep-link / State Restoration Contract Discovery

- **Date:** 2026-09-07
- **Status:** `COMPLETED / READY_FOR_DECISION_REVIEW`
- **Category:** Product / Domain Contract Discovery
- **Source impact:** `NONE`
- **Decision state:** `PROPOSED / NOT_APPROVED`

## Objective and boundary

PD-01Aで決定済みのApp route roleを維持しながら、Authenticated Appのdeep-link、direct navigation、reload、browser history、resource restoration、Organization authorizationのProduct / Domain Contract候補をDecision Review可能な粒度へ整理する。

本PhaseはDocumentation-firstのdiscoveryである。route、DB、OpenAPI、Rails、BFF、Frontend、UI、public sharing、draft persistenceは変更・決定しない。Marketing branchも再審議しない。

## Evidence classification

| Class | Meaning |
| --- | --- |
| `KNOWN` | Repositoryまたは承認済みDecisionから確認できる事実 |
| `PROPOSED` | PD-01B Decision Reviewへ提出する候補。未承認 |
| `DEFERRED` | PD-01Bの意味を決めた後のimplementationまたは別Product Decision |

## Existing App route semantics

| Route | Approved semantic role | Current implementation | Direct-navigation implication |
| --- | --- | --- | --- |
| `/app` | App Home / Analysis Entry | App Top Heroとshared `PanoptesShellEntryPage`を描画 | Home、current context summary、new analysis entryを許容する。自動的な`/app/analysis` redirectは前提にしない |
| `/app/analysis` | Analysis-focused Workspace / Result Entry | `/app`と同じShell entry/runtimeを描画し、Top Heroは描画しない | Analysis contextを復元する意味をPD-01Bで定義する必要がある |

`Distinct Route Role != Distinct Runtime Architecture`は維持する。現行の両Pageは同一entryへ`activeOrganizationId`だけを渡し、pathname/queryからresource、tab、snapshotを復元していない。

## Deep-link definition

`PROPOSED`: App Deep-linkとは、Authenticated App内のstable resource / context / meaningful viewへの到達意図をURLで宣言し、認証後にbackend authorizationとcanonical stateの再取得を経て復元できるnavigationである。

URLはresource selectorであり、authorization proofでもBusiness Stateの正本でもない。Marketing public URL、component-local state、browser-local ephemeral state、public share URLとは区別する。

## Restoration ownership and source hierarchy

指示された階層は「選択意図」と「事実の正本」を混同し得るため、次の2系列に分ける。

### Selection precedence (`PROPOSED`)

1. URL-declared stable resource / semantic view selector
2. identity-less routeに対する明示的なserver current-pointer policy
3. Organization-scopedなユーザーpreference（convenience only）
4. transient UI default

### Truth and authorization precedence (`PROPOSED`)

1. authenticated actor/session
2. Railsが検証したOrganization membership、resource ownership、canonical resource state
3. persisted AnalysisJob / Snapshot lineageとcurrent pointer
4. Organization/resource/version-scoped client cache（revalidation前提）
5. transient UI state

URL、Frontend memory、local storage、client cacheだけをcanonical restoration sourceにしない。

## URL-owned and non-URL state

| Boundary | Candidate state | Rule |
| --- | --- | --- |
| URL-owned | stable resource identity、AnalysisJob identity、historical Snapshot identity | reload、bookmark、same-Organization internal shareで同じ意味を保てる |
| Conditionally URL-owned | meaningful top-level tab/view、explicit comparison target、shareable filter/sort | Product meaningがあり、安定した識別子があり、history entryに値する場合だけ |
| Non-URL | modal、hover、temporary accordion、animation、loading、toast/notification | ephemeral presentationとしてFrontendが所有する |
| Deferred draft state | unsaved form、create/edit draft | server draft contractがなければdeep-link対象にせず、discard warning等は別UX決定へ渡す |

現行tab IDは`competitor`、`industry`、`self`、`strategy`で、`activeTab`はPage-localに`strategy`で初期化される。meaningful tabのURL所有は候補だが、exact parameter名、default省略規則、表示labelは未決定である。`selectedCompetitorId`もlocal stateであり、明示比較として共有価値がある場合だけURL候補になる。

## Direct navigation contract candidates

### `/app`

`PROPOSED`: App Home / Analysis Entryを表示する。active Organizationのauthorized contextを読み込み、current analysis summaryやnew analysis entryを表示してよいが、local preferenceだけを理由に`/app/analysis`へredirectしない。

### `/app/analysis`

| Model | Identity-less meaning | Strength | Risk |
| --- | --- | --- | --- |
| A | session/local stateから復元 | 現行実装に近く低コスト | 非決定的、share/history不可、Organization混同、historical不正確 |
| B | explicit resource ID必須 | 最も決定的で監査・共有に強い | no-ID entryのUXを失い、PD-01AのResult Entryを狭める |
| C | server current pointer、なければAnalysis Entry / empty | current利用とexplicit historyを両立 | current pointer API、明確なmutable semantics、追加実装が必要 |
| D | latest Analysis context | 実装概念が単純 | `latest != current`の承認済みDecisionに反し、意図せず表示対象が変わる |

`PROPOSED`: Model Cを採用候補とする。`/app/analysis`単体はactive authenticated Organizationの**current analysis workspace**をRailsの明示的current pointerから解決し、currentがなければAnalysis Entry / empty stateを表示する。chronological latest、historical Snapshot、Strategy sourceを意味しない。

## Resource identity findings

| Identity | Mutability / meaning | Deep-link suitability | Candidate treatment |
| --- | --- | --- | --- |
| Analysis target / Project ID | mutable container/context | workspace contextには適するが、特定時点の結果は再現しない | explicit workspace selector候補 |
| AnalysisJob ID | stable process/outcome identity | progress、confirmation、terminal outcomeの復元に適する | explicit Job link候補 |
| Snapshot ID | immutable generation-time artifact | historical再現、audit、comparison、internal shareに最適 | explicit historical linkに必要 |
| Result ID | canonical logical identityが現行正本で確立していない | 現時点で評価不能 | 新規identityとして仮定しない |
| implicit current pointer | mutable Organization/project-level selection | convenience navigationに適するがhistorical URLではない | identity-less `/app/analysis`だけで使用候補 |

### Current and historical distinction

- `latest != current != Strategy source`を維持する。
- current pointerは明示的にpromotionされた可変参照であり、reload時に新しいcurrentへ変わり得る。
- historical Snapshotはimmutable identityであり、別Snapshotやcurrentへsilentに読み替えない。
- exact historical reproducibilityが必要ならSnapshot IDを使う。current URLに同一Snapshot再現を約束しない。

## AnalysisJob and Snapshot linkage

| AnalysisJob outcome | Explicit Job deep-link restoration candidate |
| --- | --- |
| running (`queued`〜`finalizing`、`awaiting_confirmation`を含む) | backendからcanonical stateを取得し、progressまたはconfirmation viewを表示する |
| `completed` | terminal outcomeを表示し、存在する`committedSnapshotId`を同一Jobの確定Snapshotとして解決できる |
| `partially_completed` | limitationを明示したterminal partial view。許可されたpartial Snapshotがある場合だけ参照し、completedやStrategy sourceへ昇格させない |
| `failed` | failed outcomeと許可されたretry action。current/last-stable Snapshotを当該Jobの結果として見せない |
| `cancelled` | cancelled outcome。formal Snapshotへsilent fallbackしない |
| `timed_out` | canonical timed-out outcome。HTTP client timeoutと混同せず、formal Snapshotへsilent fallbackしない |

FrontendはURLや経過時間からJob stateを推測せず、Rails responseをadapter経由で消費する。明示Job linkの表示中にlast-stable Snapshotを補助表示する場合も、それが別世代であることを区別する。

Snapshot-specific deep-linkは`REQUIRED_CANDIDATE`とする。benefitはhistorical reproducibility、audit、comparison、same-Organization internal share、Strategy evidence traceabilityである。exact URL schemaは未決定。

## Organization, authentication, and authorization

### Organization context

`PROPOSED`: explicit resource linkではresource-derived OrganizationをRailsが解決・検証する。URL-declared Organizationは必要ならrouting selectorにできるがauthorityではない。session-current Organizationはidentity-less routeのdefaultに限り、explicit resource ownershipを上書きしない。

現行`activeOrganizationId`はserver guardからPageへ渡される。BFF/Rails boundaryはrequestされたOrganizationとの一致、active membership、resource ownershipを再検証する。現行local storage key `panoptes.selected_project_id`は確認できる範囲でOrganization-scopedではなく、canonical deep-link sourceには不適格である。

### Cross-Organization behavior

- Membershipがある別Organizationのresource: route-scoped authorized contextを優先候補とする。persistent active Organizationを変更する必要がある場合は明示確認後にswitchし、silent switchしない。
- Membershipがないresource: resource existenceを漏らさないnot-found扱いを候補とする。
- 同一Organizationでrole不足: forbiddenを候補とし、not-foundとの使い分けは既存security boundaryに従う。
- session-current mismatchだけを理由にauthorized explicit linkを別resourceへfallbackしない。

### Authentication return-to

現行guardはfull pathname + searchをsame-origin relative `returnTo`として保持し、loginまたはOrganization selection後に戻せる。`safeReturnTo`は`//`とbackslashを拒否し、open redirectを防ぐ。この方向はPD-01B候補と互換である。

ただし、認証後もresource authorizationを必ず再検証する。signup email callbackのdefault destinationは`/app`であり、任意deep-link継続は現行では確立していない。exact implementationはdeferする。

### Failure semantics

| Condition | Candidate response |
| --- | --- |
| unauthenticated | safe return-toを保持してloginへ進み、認証後に再検証 |
| cross-Organization unauthorized / unknown | non-disclosing not-found |
| same-Organization role insufficient | forbidden |
| deleted / expired / invalid / unknown explicit resource | explicit missing/unavailable state |
| incompatible historical schema/formula/retired contract | versionを保ったview-only、またはexplicit unsupported state |
| backend unavailable | retryable unavailable state。別resourceへfallbackしない |
| incomplete context | explicit context-required state |

generic `/app` redirectですべてを吸収しない。explicit identityが壊れている場合、latest/current/別Organization/別Snapshotへのsilent fallbackは禁止候補とする。historical dataをcurrent semanticsでsilent reinterpretしない。

## Reload, history, and restoration UI

- **Reload:** explicit resource URLは同じidentityとsemantic viewをbackendから再取得する。current-pointer URLは「reload時点のcurrent」を意味するため、同一Snapshot保証が必要ならSnapshot URLを使う。
- **Back / Forward:** URL-owned resource、meaningful tab/view、explicit comparison/filterをhistoryから復元する。modal、hover、loading、toast、未保存inputの完全復元はContractに含めない。
- **Restoration UI:** `authentication_required`、`loading`、`restored`、`unavailable`、`forbidden`、`missing`、`unsupported_historical`、`incomplete_context`を表現可能であることを要求候補とする。exact copy/layoutはPresentation handoffとする。
- **Filter / Sort:** share/reloadで同じ意味が必要で、安定identifierを持ち、URLサイズ・privacy上安全なものだけURLへ置く。表示上の一時sortや未確定filterはclient-localとする。
- **Unsaved state:** stable server draft identityがない限りPD-01B canonical restorationに含めない。local persistenceやdiscard warningはdraft workflow / UXへdeferする。

## Client cache boundary

Client cacheはperformance optimizationであって正本ではない。利用時はOrganization ID、resource ID、contract/formula/schema versionでscopeし、backend revalidationを行う。stale cacheでcurrentとhistorical、Organization、Job generationを混同しない。

## Responsibility boundary

| Owner | Responsibility | Must not own |
| --- | --- | --- |
| BFF | authenticated same-origin boundary、session/cookie、Organization scope transport、Rails proxy、safe return-to | Product restoration business rule、resource ownershipの正本、Job/Snapshot状態推測 |
| Rails | JWT/membership/role/resource ownership、current pointer、AnalysisJob state、Snapshot resolution、historical validity、canonical response | browser-only presentation state |
| Frontend | URL semantic selector parsing/navigation、validated response consumption、loading/failure presentation、transient state | authorization判定の正本、Business Stateの再構築・推測 |

Every resource requestはbackendでOrganization/authorizationを検証する。URL IDはsecretにせず、機密payload、token、authorization claimをqueryへ含めない。signed/public linkはEvidenceがないため仮定しない。

## Shareability and App semantic URL

- same-user bookmark: PD-01B scope内。
- same-Organization internal share: authenticated/authorized deep-linkとして候補。
- external public share: Authenticated App deep-linkと混同せず、別Product Decision。
- URLに含まれるtab/filter等は受領者へ開示してよい情報に限定する。
- App semantic URLはresource/view identityのための概念であり、Marketing SEO canonical、indexing、public discoverabilityとは別である。

## Deep-link Contract candidate

`PROPOSED / NOT_APPROVED`:

1. URLはstable resource / semantic viewのselectorを所有する。
2. authenticationとRails authorizationを通過したcanonical resourceだけを復元する。
3. `/app`はHome / Analysis Entryを維持し、暗黙にAnalysis routeへredirectしない。
4. `/app/analysis`単体はactive Organizationのexplicit current pointer、なければEntry / emptyを意味する。latestを意味しない。
5. explicit AnalysisJob identityはprocess/outcome、explicit Snapshot identityはimmutable historical resultを意味する。
6. explicit resource failureはtyped UI stateとし、別resourceへsilent fallbackしない。
7. URL-owned stateだけをreload/back/forward/bookmarkで意味的に復元する。
8. client cacheとtransient stateはcanonical sourceにしない。

Restoration flowは `URL selector -> authenticated BFF boundary -> Rails authorization/canonical resolution -> Frontend render` とする。

## Restoration model comparison and recommendation

| Criterion | Model A: Session-driven | Model B: Explicit resource | Model C: Hybrid current + explicit historical |
| --- | ---: | ---: | ---: |
| Determinism | Low | High | High for explicit / documented mutable current |
| UX for direct no-ID entry | High | Low | High |
| Bookmark/share | Low | High | High |
| Security clarity | Low | High | High |
| Historical correctness | Low | High | High |
| Implementation complexity | Low | Medium | Medium–High |
| Current code compatibility | High | Low–Medium | Medium |

`RECOMMENDED`: Model C。currentへの便利な入口と、immutable historical identityの厳密さを両立し、PD-01Aと`latest != current`の既決定を守れる。Model Aはtarget contractとしてreject候補、Model Bはexplicit linkの原則として採用しつつ、no-ID routeの唯一モデルにはしない。

## Existing implementation compatibility and gaps

| Area | Current evidence | Target compatibility / gap |
| --- | --- | --- |
| Route role | `/app`と`/app/analysis`はshared runtime、distinct presentation shell | PD-01Aと互換。runtime分割不要 |
| URL restoration | 両Pageはorganization IDだけを渡し、query/resourceをparseしない | 未実装 |
| Tab/view | `activeTab='strategy'`のPage-local state | semantic tab restoration未実装 |
| Project selection | session store -> global localStorage key -> first project | convenienceとして限定可能。Organization/resource canonical sourceには不可 |
| Snapshot selection | explicit selected Snapshot IDなし | historical deep-link未実装 |
| Runtime outcome | canonical AnalysisJob adapter、`committedSnapshotId`、partial/terminal mappingあり | Job link contractの基礎と互換 |
| Stable rendering | reanalysis中はlast-stable Snapshotを保持 | UXとして互換だがexplicit Job/Snapshot identityとの世代区別が必要 |
| Auth return | safe pathname/search return-toあり | directionは互換。resource reauthorizationが必要 |
| Business endpoints | project/job/snapshot canonical BFF clientは未接続 | implementation blockerだがDecision Review blockerではない |

## PD-01B closure requirements

Decision Completeには次をProduct Ownerが明示承認する必要がある。

- Deep-link meaningとshare audience boundary
- resource identity principle（workspace / Job / Snapshot / current pointer）
- `/app`とidentity-less `/app/analysis` semantics
- Organization derivation、cross-Organization、auth return-to
- reload、back/forward、meaningful tab/viewの復元
- current / historical separationとhistorical incompatibility
- invalid/missing/forbidden/unavailable behavior
- URL / transient / cache boundary
- Rails / BFF / Frontend ownership
- silent fallback prohibition

Exact route/query schema、UI、API、DB、implementationはClosure blockerにしない。

## Decision readiness

| Area | Status | Basis |
| --- | --- | --- |
| Deep-link Contract | `READY_FOR_DECISION_REVIEW` | identity、share/security、failure原則を比較可能 |
| State Restoration Contract | `READY_FOR_DECISION_REVIEW` | reload/history/current/historical候補を比較可能 |
| Ownership Boundary | `READY_FOR_DECISION_REVIEW` | URL/BFF/Rails/Frontend/cacheの責務を分離済み |
| PD-01B Overall | `READY_FOR_DECISION_REVIEW` | Model Cとidentity-less route候補を提示。承認Evidenceは未取得 |

PD-01BがDecision Completeになれば、PD-01AとMarketing Branchは既に完了しているため、PD-01 Parentは`READY_FOR_CLOSURE_REVIEW`へ進められる。現時点のProduct Decision blockerはPD-01BのProduct Owner review/approvalである。exact URL schemaとimplementationはParent Decision Closureをblockしないtyped handoff候補である。

## Deferred items

- exact route、path/query parameter、canonical App link builder schema
- project/job/snapshot BFF・Rails・Frontend implementation、DB/OpenAPI変更
- current pointer APIとpromotion policyの実装
- public/external sharing、signed URL、expiry、revocation
- server/local draft persistence、discard warning UX
- exact restoration screen copy/layout、analytics taxonomy
- URL privacy review、retention、support playbook、browser E2E
- historical renderer/version migration実装

## Validation

- Documentation-only diffを確認する。
- Product Decision Register、Audit、Development Logのstatusとreferencesを同期する。
- Source、route、Rails、BFF、OpenAPI、DBは変更しない。
- Full quality gateは実行しない。

## References

- [Product Decision Register](../product/product-decision-register.md)
- [PD-01A App Route Role Decision](./63-pd01a-app-route-role-decision.md)
- [PD-54 Marketing Route Approval Record](./112-pd01-marketing-route-intent-explicit-product-owner-approval-record.md)
- [PD-04 partially_completed Snapshot Workflow Approval](./109-pd04-partially-completed-snapshot-workflow-explicit-product-owner-approval-record.md)
- [AnalysisJob State Machine](../api/analysis-job-state-machine.md)
- [AnalysisJob Frontend Boundary](../architecture/analysis-job-frontend-boundary.md)
- [Organization-scoped Command Flow](../architecture/organization-scoped-command-flow.md)
- [API Boundary](../architecture/api-boundary.md)
- [Panoptes Shell Flow](../architecture/panoptes-shell-flow.md)
- [Development Log](../DEVELOPMENT_LOG.md)

## Recommended next phase

Phase PD-56 — PD-01B App Deep-link / State Restoration Contract Decision Review。Product Owner/PM、Engineering、Security/Auth/Organization、Support/AnalyticsがModel C、identity-less `/app/analysis`、resource identity、share/failure/ownership boundaryをreviewする。明示承認までは`PROPOSED / NOT_APPROVED`である。
