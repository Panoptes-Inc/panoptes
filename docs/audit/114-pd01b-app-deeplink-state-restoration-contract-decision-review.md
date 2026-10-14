# Phase PD-56 — PD-01B App Deep-link / State Restoration Contract Decision Review

- **Date:** 2026-09-07
- **Status:** `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`
- **Category:** Product / Domain Contract Decision Review
- **Source impact:** `NONE`
- **Decision Owner:** Product Owner / PM (`APPROVAL_REQUIRED`)

## Objective and review boundary

PD-55でDecision Review可能になったAuthenticated App deep-link / state restoration候補を、既決定のPD-01A route role、PD-02 historical interpretation、PD-04 AnalysisJob/Snapshot workflow、Auth/Organization boundaryと照合し、Product Ownerが明示承認できるv1 Proposalへ固定する。

本PhaseはDocumentation-onlyであり、Product Ownerの代理承認を行わない。exact URL schema、route、current pointer、DB、OpenAPI、Rails、BFF、Frontend、public sharing、draft persistence、UI、E2Eは設計・実装しない。

## Evidence and invariants

### Approved invariants

- `/app` = App Home / Analysis Entry。
- `/app/analysis` = Analysis-focused Workspace / Result Entry。
- shared runtime + distinct route semantics。
- `latest != current != Strategy source`。
- Snapshotはgeneration-time lineageを持つimmutable artifactで、current formulaやcurrent semanticsへsilent reinterpretしない。
- AnalysisJobはOrganization-scoped runtime / lineage anchorで、`partially_completed`を含むcanonical outcomeをFrontendが推測しない。
- URLやbrowser sessionはauthorization authorityではなく、Railsがmembership、role、resource ownershipを検証する。

### Current implementation evidence

- `/app`と`/app/analysis`は同じShellへ`activeOrganizationId`だけを渡し、resource、Job、Snapshot、tabをURLから復元しない。
- `activeTab`、selected competitor、draft inputはlocal stateである。
- project selectionはsession store、確認範囲ではOrganization-scopedでないlocalStorage、first projectの順に依存する。
- safe pathname/search return-to、server-side authentication、active Organization membership guardは存在する。
- canonical project/Job/Snapshot restoration endpointsとexplicit Snapshot selectionは未実装である。

Implementation gapはDecisionの必要性を裏づけるが、Logical Contract approvalのblockerではない。

## Review disposition matrix

| Review item | Disposition | v1 treatment |
| --- | --- | --- |
| Deep-link definition | `DECIDE NOW` | authenticated stable resource/context/view selectorとして定義 |
| Restoration source hierarchy | `DECIDE NOW` | selector priorityとcanonical authorityを分離 |
| URL-owned state | `DECIDE NOW` | stable/meaningful/shareable stateの基準を承認対象化 |
| `/app` direct semantics | `DECIDE NOW` | Home / Analysis Entryを維持 |
| `/app/analysis` direct semantics | `DECIDE NOW` | current pointer、なければEntry/empty |
| Resource identity principle | `DECIDE NOW` | Project/Job/Snapshot/currentの役割を分離 |
| Current vs Historical | `DECIDE NOW` | explicit immutable Snapshotでhistoryを表現 |
| AnalysisJob deep-link | `DECIDE NOW` | Rails canonical process/outcomeを表示 |
| Snapshot deep-link | `DECIDE NOW` | v1 Logical Contract requirement |
| Organization restoration | `DECIDE NOW` | resource-derived/backend-authorized |
| Cross-Organization behavior | `DECIDE NOW` | route scope可、persistent silent switch不可 |
| Authentication return-to | `DECIDE NOW` | validated same-origin intentを保持し再認可 |
| Authorization failure | `DECIDE NOW` | disclosure riskとsame-org role不足を区別 |
| Missing resource | `DECIDE NOW` | explicit failure、intent-changing fallback禁止 |
| Historical incompatibility | `DECIDE NOW` | view-onlyまたはunsupported、reinterpret禁止 |
| Reload / Back / Forward | `DECIDE NOW` | URL-owned semantic stateを再取得・復元 |
| Tab / Filter ownership | `DECIDE NOW` | ownership criteriaのみ。serializationはdefer |
| Client cache | `DECIDE NOW` | non-canonical、scoped、version-aware |
| Rails / BFF / Frontend responsibility | `DECIDE NOW` | authority/transport/presentationを分離 |
| Silent fallback prohibition | `DECIDE NOW` | explicit linkの意図を別resourceへ変更しない |
| Model C | `DECIDE NOW` | v1 Default Restoration Model |
| PD-01B Closure condition | `DECIDE NOW` | Logical Contract approvalでclosure可能 |

## Final Proposal for approval

### Deep-link definition

App Deep-linkは、Authenticated App内のstable resource / context / meaningful viewをURLで指定し、次のflowで復元するnavigationである。

`URL selector -> authenticated BFF -> Rails authorization / canonical resolution -> Frontend render`

Marketing public URL、transient UI state、local component state、external public share URLとは別概念とする。

### Restoration source hierarchy

#### Selector priority

1. Explicit URL resource identity
2. Server-owned current pointer
3. Organization-scoped preference
4. UI default

#### Canonical fact authority

1. Authenticated session / actor
2. Rails canonical resource and authorization state
3. Persisted AnalysisJob / Snapshot state and lineage
4. Validated, scoped, version-aware client cache
5. Transient Frontend state

URLは選択意図でありBusiness Factの正本ではない。Frontend memoryやcacheだけからcanonical resourceを復元しない。

### URL-owned state policy

URLに保持できるのは、bookmarkable、reload-safe、history上意味があり、authorized scope内で共有可能かつsemantically stableなstateとする。

- stable resource identity
- AnalysisJob identity
- Snapshot identity
- meaningful semantic view/tab
- meaningful comparison target
- stable、privacy-safe、shareable filter/sort

Exact parameter名、default省略、serializationはImplementation Detailとしてdeferする。

### Non-URL state policy

modal、hover、temporary accordion、animation、loading、notification、unsaved input、ephemeral display preferenceはFrontend-localをbaselineとする。Product meaningを獲得したstateだけを別DecisionでURL ownershipへ昇格できる。

### `/app` direct semantics

`/app`はApp Home / Analysis Entryを維持する。direct accessではHome、authorized Organization context summary、利用可能なcurrent analysis summary、new analysis entryを表示できる。`/app/analysis`へsilent auto-redirectしない。

### `/app/analysis` direct semantics

Explicit identityのない`/app/analysis`は、active Organizationにおけるserver-authorized **Current Analysis Entry**を意味する。

- currentが存在する: Current Analysis Workspaceを表示する。
- currentが存在しない: Analysis Entry / Empty Stateを表示する。
- chronological latest、historical Snapshot、Strategy sourceを意味しない。
- latest Analysisへのsilent fallbackを行わない。

### Resource identity policy

| Identity | Approved-candidate semantic role |
| --- | --- |
| Project / Analysis Target ID | mutable workspace/domain context |
| AnalysisJob ID | stable process / outcome identity |
| Snapshot ID | immutable historical artifact identity |
| Current Pointer | server-owned mutable convenience relationship |
| Result ID | canonical ownership未確立のため`DEFER` |

Exact route shapeは未決定だが、JobとSnapshotを同じsemantic identityとして扱わない。

### Current / Historical boundary

`latest != current != Strategy source != historical Snapshot`をv1 invariantとする。Historical reproducibilityが必要なURLはexplicit immutable Snapshot identityを使い、current pointerで代替しない。current URLはmutable convenienceであり、特定Snapshotの永久参照を保証しない。

### AnalysisJob deep-link policy

AnalysisJob deep-linkはRails canonical Job stateをprocess/outcomeとして表示する。

| Outcome | Restoration policy |
| --- | --- |
| running | canonical progressまたはconfirmation state |
| `completed` | completed outcomeと、存在するcommitted Snapshotへの明示的関係 |
| `partially_completed` | limitation付きterminal partial outcome。completedやStrategy sourceへ昇格しない |
| `failed` | failed outcomeと許可されたretry。stable prior Snapshotを当該Job結果として扱わない |
| `cancelled` | cancelled outcome。formal Snapshotへfallbackしない |
| `timed_out` | canonical domain timeout。HTTP client timeoutと混同しない |

FrontendはURL、経過時間、local storeからJob outcomeを推測しない。

### Snapshot deep-link policy

Snapshot-specific deep-linkをv1 Logical Contract Requirementとする。目的はhistorical reproducibility、audit、comparison、same-Organization internal sharing、Strategy evidence traceabilityである。Snapshot immutabilityとgeneration-time version lineageを維持する。

### Organization Context policy

Explicit resource deep-linkでは、resource ownershipからOrganizationをRailsが解決・検証する。URL-declared Organizationはrouting selectorにはできるがauthorityではない。session-current Organizationはidentity-less routeのdefault contextに限定し、explicit resource ownershipを上書きしない。

### Cross-Organization policy

- Userがmembershipを持つ別Organizationのexplicit resourceは、backend-authorized route-scoped contextで表示できる。
- persistent active Organization preferenceを変更する場合はexplicit action / confirmationを要求する。
- silent Organization switchは`REJECT`する。
- membershipがないcross-Organization resourceはexistenceを漏らさないfailureとする。
- session-current mismatchだけを理由に別resourceへfallbackしない。

### Authentication return-to policy

Unauthenticated userがdeep-linkを開いた場合、validated same-origin return-to intentを保持し、login後にresource authorizationを再検証してoriginal destinationへ戻す。Open redirectを許可しない。Authentication成功はresource access許可を意味しない。

### Authorization failure policy

- Cross-Organization / existence disclosure risk: non-disclosing Not Found。
- Same Organization / insufficient role: Forbidden。
- Exact HTTP status mappingとcopy/layoutはSecurity / Implementation Contractへhandoffできるが、logical distinctionはv1 Contractに含める。

### Resource missing policy

deleted、expired、invalid、unknownなexplicit identityは明示的Failure Stateを表示する。current、latest、another Snapshot、`/app`、another Organizationへsilent fallbackしない。

### Historical incompatibility policy

unsupported formulaVersion、schema、retired contract、pipelineを持つhistorical resourceは、generation-time semanticsを保持したview-onlyまたはexplicit unsupported stateとする。current semanticsによるsilent reinterpretを禁止する。

### Reload semantics

- Explicit identity URL: reload時も同じresource identityをbackendから再取得する。
- Current-pointer URL: reload時点のserver-authorized currentを意味する。
- 同一historical Snapshotの保証が必要な場合: explicit Snapshot identityを使う。

### Back / Forward semantics

browser historyはURL-owned resource、meaningful view、comparison、stable filterを復元する。modal、hover、loading、notification、unsaved input等の完全復元はProduct Contractに要求しない。

### Tab / View URL policy

現行`competitor`、`industry`、`self`、`strategy`を含むmeaningful view/tabは、shareable、bookmarkable、browser history上意味がある場合にURL-ownedとできる。どれを必須URL stateにするか、path/query shape、labelはdeferする。

### Filter / Sort boundary

stable meaning、authorized shareability、privacy safety、reload/history valueを満たすfilter/sortだけをURL-ownedとする。ephemeral display convenienceはclient-localとする。

### Unsaved State boundary

unsaved stateはcanonical restoration対象外をbaselineとする。Stable Server Draft Identityが別途決定・実装された場合だけ将来のrestoration対象へ昇格できる。draft persistenceとdiscard warningはdeferする。

### Restoration UI requirement

Frontendは少なくとも`authentication required`、`loading`、`restored`、`unavailable`、`forbidden`、`missing`、`unsupported historical`、`incomplete context`を区別して表現可能にする。Exact UI copy/layoutはPresentation handoffとする。

### Client cache policy

Client cacheはperformance optimizationでありcanonical Source of Truthではない。利用時はOrganization、resource、versionでscopeし、backend revalidationを行う。stale cacheでOrganization、current/history、Job generationを混同しない。

### Responsibility boundary

| Owner | v1 responsibility | Excluded responsibility |
| --- | --- | --- |
| BFF | session/cookie、same-origin authenticated boundary、Organization transport、Rails proxy、safe return-to transport | independent Product restoration logic、resource authority、Job/Snapshot inference |
| Rails | membership、role、resource ownership、Organization authorization、current pointer、AnalysisJob state、Snapshot resolution、historical validity、canonical response | browser presentation state |
| Frontend | URL selector parsing、semantic navigation、validated response rendering、restoration/failure UI、transient local state | authorization authority、canonical Business State inference |

### URL Security boundary

URL identityはrequest selectorでありauthorization proofではない。全resource accessをbackendで認可する。query stringへsecret、access token、sensitive payloadを載せない。Signed/public linkはEvidenceがなくv1で仮定しない。

### Shareability boundary

v1 Deep-link対象はsame-user bookmarkとsame-Organization internal sharingである。External Public Sharingは別Product Decisionへdeferし、Authenticated App deep-linkとPublic Share URLを混同しない。

### App Semantic URL policy

App deep-linkはauthenticated semantic resource identityであり、Marketing SEO canonicalとは別概念である。public indexingやSearch canonical ruleをAuthenticated App resource identityへ流用しない。

### Restoration failure and silent fallback

authentication required、authorization denied、resource missing、unsupported historical、backend unavailable、incomplete contextを区別する。すべてをgeneric `/app` redirectへ吸収しない。

Explicit deep-link contextの失敗時にlatest Analysis、current Snapshot、another Snapshot、another Organization、another resourceへユーザー意図を変えるsilent fallbackを行わない。

## Treatment Model final review

| Model | Disposition | Reason |
| --- | --- | --- |
| Model A — Session-driven Restoration | `REJECT AS CANONICAL MODEL` | non-deterministic、sharing/historyが弱い、Organization ambiguity、historical correctness不足 |
| Model B — Explicit Resource only | `KEEP AS STRICT RESOURCE PATTERN` | explicit Job/Snapshotには必要だがidentity-less App Entryの単独global modelにはしない |
| Model C — Hybrid Current Pointer + Explicit Historical Resource | `READY_FOR_APPROVAL` | convenience entry、determinism、security、historical correctness、PD-01A semanticsを両立 |

## Recommended v1 Restoration Model

Model CをPD-01B v1 Default Restoration Modelとして承認候補にする。

- Convenience entry: identity-less route + server-authorized current pointer。
- Explicit process/outcome navigation: AnalysisJob identity。
- Explicit historical navigation: immutable Snapshot identity。
- Missing explicit resource: explicit failure。
- Security: every fetchでbackend authorization。
- Cache/transient state: non-canonical。

## PD-01B Logical Contract approval packet

Product Ownerの一括承認対象は次のとおり。

1. Deep-linkをstable authenticated resource selectorと定義する。
2. Model Cをv1 Default Restoration Modelとする。
3. `/app`をHome / Analysis Entryとして維持する。
4. identity-less `/app/analysis`をserver-authorized current、なければEntry/emptyとする。
5. Project、Job、Snapshot、current pointerのsemantic identityを分離する。
6. Snapshot-specific deep-linkをv1 requirementとする。
7. resource-derived/backend-authorized Organizationとsafe auth return-toを採用する。
8. current/history、reload/history navigation、failure semanticsを採用する。
9. URL/transient/cacheとRails/BFF/Frontend ownershipを分離する。
10. silent intent-changing fallbackとsilent Organization switchを禁止する。

## PD-01B Closure Proposal

上記Logical ContractのProduct Owner明示承認をもって、PD-01Bを`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`にできる。

### Closure blockers

- Product Ownerの明示承認Evidence
- Approval Date
- Decision Owner

### Not closure blockers

- exact URL shape / naming / serialization
- current-pointer implementation
- DB / OpenAPI
- Rails / BFF / Frontend implementation
- public sharing / signed link
- draft persistence
- UI copy/layout
- E2E implementation

## Decision readiness

| Area | Result |
| --- | --- |
| Deep-link Contract | `READY_FOR_APPROVAL / NOT_APPROVED` |
| State Restoration Contract | `READY_FOR_APPROVAL / NOT_APPROVED` |
| Ownership Boundary | `READY_FOR_APPROVAL / NOT_APPROVED` |
| Model C | `READY_FOR_APPROVAL / NOT_APPROVED` |
| PD-01B Closure Proposal | `READY_FOR_APPROVAL / NOT_APPROVED` |
| PD-01B Overall | `READY_FOR_APPROVAL / NOT_APPROVED` |

追加Product Evidenceはapproval前提として必須ではない。Product OwnerがProposalを差し戻す場合は、該当boundaryだけを再Reviewする。

## PD-01 Parent impact

PD-01Aは`DECIDED`、Marketing Route Branchは`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`、PD-01Bは本Review後も未承認であるため、PD-01 Parentは`PARTIALLY_READY`を維持する。

PD-01Bが明示承認されDecision Completeになれば、PD-01 Parentは`READY_FOR_CLOSURE_REVIEW`へ進める。他のProduct Decision blockerは確認されていない。Marketing implementationと`/lp`・`/plan` external footprintは承認済みDeferred Ledgerであり、Parent Decision Closure blockerではない。

## Deferred / implementation handoff

- exact route/path/query/naming/serializationとcanonical App link builder
- Organization-scoped current pointer、project/Job/Snapshot endpoints、DB/OpenAPI
- Rails/BFF/Frontend implementationとroute migration
- exact HTTP/error mapping、restoration copy/layout、Presentation Design
- public sharing、signed link、expiry、revocation
- server/local draft persistenceとdiscard warning
- URL privacy、analytics、support playbook、browser E2E
- historical renderer/version compatibility implementation

## Validation

- 対象Audit、Product Decision Register、Development Logのstatus/referenceを同期する。
- 対象Markdownのformatと追加referenceの存在を直接確認する。
- Source、route、DB、OpenAPI、Rails、BFF、Frontendを変更しない。
- Repo-wide discoveryとfull quality gateを実行しない。
- `.git` metadataが利用できない場合、git失敗を品質失敗とせず、対象文書の直接確認で代替する。

## References

- [PD-55 Contract Discovery](./113-pd01b-app-deeplink-state-restoration-contract-discovery.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-01A App Route Role Decision](./63-pd01a-app-route-role-decision.md)
- [PD-54 Marketing Route Approval Record](./112-pd01-marketing-route-intent-explicit-product-owner-approval-record.md)
- [PD-04 Snapshot Workflow Approval](./109-pd04-partially-completed-snapshot-workflow-explicit-product-owner-approval-record.md)
- [PD-02 Formula Version / Backend Wire Approval](./100-pd02c-formula-version-backend-wire-contract-explicit-product-owner-approval-record.md)
- [AnalysisJob State Machine](../api/analysis-job-state-machine.md)
- [AnalysisJob Frontend Boundary](../architecture/analysis-job-frontend-boundary.md)
- [Organization-scoped Command Flow](../architecture/organization-scoped-command-flow.md)
- [Development Log](../DEVELOPMENT_LOG.md)

## Recommended next phase

Phase PD-57 — PD-01B App Deep-link / State Restoration Contract Explicit Product Owner Approval Record。Product Ownerから明示承認が提供された場合だけ実施し、Approval Evidence、Date、Owner、approved Logical Contract、Closure disposition、PD-01 Parent impactを正本化する。
