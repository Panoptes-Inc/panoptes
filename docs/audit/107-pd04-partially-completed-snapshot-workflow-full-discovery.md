# Phase PD-49 — PD-04 partially_completed Snapshot Workflow Full Discovery

Date: 2026-09-07  
Decision: PD-04 partially_completed Snapshot Workflow  
Phase Type: Product / Domain Discovery  
Decision Status: `READY_FOR_DECISION_REVIEW / NOT_APPROVED`  
Implementation: `NOT_IMPLEMENTED`

## 1. Scope and Evidence Baseline

PD-04を次の4 workstreamに限定してDiscoveryした。

- A: AnalysisJob Outcome Semantics
- B: Snapshot Lifecycle / Current Promotion
- C: Strategy Source Promotion
- D: Reanalysis / History / Usage

確認済みの既存契約は、Canonical AnalysisJobの14 states、5 terminal states、RailsがBusiness stateを確定するownership、`partially_completed`のFrontend terminal mapping、generation-time lineage、PD-02DのScore Calculation Eligibility分離である。Rails canonical business implementation、typed Snapshot schema、usage/billing policyは未実装または未決定であり、現行Frontendの安全な表示をProduct Decisionへ昇格しない。

本書の推奨はDecision Candidateであり、Product Owner承認済み仕様ではない。

## 2. Workstream A — Canonical Terminal Outcomes

Canonical terminal state setは変更しない。

| Terminal state | Product meaning candidate | Result visibility | Evidence | Snapshot | Current | Strategy | Reanalysis |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `completed` | Expected analysis and required finalization succeeded | full result | available | `CAN_CREATE` | policy promotion candidate | eligible after validation | available |
| `partially_completed` | A valid, usable result exists but required processing is incomplete | visible with limitations | available with gaps | `CONDITIONAL` | never silent auto-promotion | evidence/reference candidate | available |
| `failed` | No valid Product Analysis Result can be finalized | error summary only | retain auditable artifacts where policy permits | `CANNOT_CREATE` | no | no | available |
| `cancelled` | Accepted user/system cancellation ended execution | cancellation summary only | retain audit/evidence only by policy | `CANNOT_CREATE` | no | no | available |
| `timed_out` | Canonical execution deadline ended the Job | timeout summary only | retain audit/evidence only by policy | `CANNOT_CREATE` | no | no | available |

Result visibilityはProduct resultとerror/status visibilityを区別する。Failed/cancelled/timed_outの内部artifact retentionは正式Snapshot作成を意味しない。

## 3. `partially_completed` Definition and Entry Conditions

推奨定義Candidate:

> AnalysisJob全体として、一部のrequired processingが完了していない一方、整合性検証を通過した利用可能なEvidenceまたはResultが存在し、欠損・制約・lineageを明示したProduct Resultとしてfinalizeできるterminal outcome。

次とは別概念である。

```text
AnalysisJob partially_completed
≠ Observation PARTIAL
≠ Axis PARTIAL
≠ Score PARTIAL
≠ Snapshot completeness PARTIAL
```

Entry condition candidate:

1. 少なくとも一つの利用可能なResult sectionまたはEvidence setがある。
2. Result identity、Organization/Job linkage、generation-time lineageを確定できる。
3. 欠損stage、limitations、quality/completenessを説明できる。
4. 利用可能部分がschema/integrity validationを通過する。
5. Required processingの一部が未完了である。

Internal complete / Visual failed、Visual complete / LLM failed、複数page中の一部取得失敗、required stageの一部Unavailable、limited resultだけmaterialize可能、などは候補になり得る。ただしstage名だけで自動判定せず、Versioned outcome policyが「利用可能Result」の最低条件を定める。Exact stage set、coverage、minimum count、thresholdはDecision/Validation handoffとする。

## 4. `failed` Boundary and Cancel/Timeout Retention

推奨境界:

- `failed`: Productとして利用可能で整合したAnalysis Resultを成立・finalizeできない。
- `partially_completed`: 利用可能なResultをlimitations付きで成立・finalizeできる。

単なるartifact存在だけで`partially_completed`にしない。逆に一部stage failureだけで、利用可能ResultがあるJobを自動`failed`にしない。

Cancelled/timed_outは原因とOutcomeを保持し、terminal後に`partially_completed`へsilent rewriteしない。Terminal確定前のRails adjudicationでlimited resultを正式finalizeできる場合だけ、policyに基づき`partially_completed`を選び得る。Cancel accepted後はcurrent Snapshotへcommitしない既存Directionを維持する。Timeout/cancel時の途中Evidenceはaudit、diagnostic、明示的reuse policyのため保持可能だが、Product SnapshotまたはFormal Strategy Sourceへ自動昇格しない。

## 5. Workstream B — Snapshot Eligibility Candidates

| Candidate | Policy | Benefit | Risk | Disposition |
| --- | --- | --- | --- | --- |
| S-A Complete-only | completedだけSnapshot化 | 単純で高い一貫性 | usable partial resultとlineageをProduct履歴から失う | alternative |
| S-B Limited Snapshot | completedは作成、partially_completedはlimitations付きで作成可能 | 閲覧性、説明可能性、historyを両立 | current/sourceとの混同防止が必要 | `RECOMMENDED` |
| S-C Job-result only | partialはJob resultだけ保持 | Snapshot semanticsが単純 | durable history、comparison、auditが弱い | alternative |

Outcome別Candidate:

| Outcome | Snapshot eligibility |
| --- | --- |
| completed | `CAN_CREATE` |
| partially_completed | `CONDITIONAL` — valid limited result + required metadata |
| failed | `CANNOT_CREATE` |
| cancelled | `CANNOT_CREATE` |
| timed_out | `CANNOT_CREATE` |

S-Bを推奨する。`Snapshot保存 ≠ current promotion ≠ Strategy Source promotion`を必須境界とする。

## 6. Partial Snapshot Metadata and Immutability

Logical metadata candidate:

- Snapshot identity and Organization/target identity
- source AnalysisJob ID and terminal outcome
- Snapshot/result completeness and reasons
- limitations and missing/failed stages
- quality/coverage metadata
- Formula, Axis, Observation, Pipeline lineage
- Evidence/input lineage
- generated/committed timestamp
- promotion relationships and audit references

Exact JSON、DB、OpenAPI field名は決めない。

Snapshotはgeneration-time artifactとしてimmutableを推奨する。Reanalysisは`new Job → new Result → new Snapshot`とし、旧Job、Score、Snapshotをmutationしない。

## 7. Current Snapshot Concept and Promotion Candidates

`latest-created`、`latest-complete`、`current`、`strategy-source`を同義にしない。

| Candidate | Policy | Assessment |
| --- | --- | --- |
| C-A Always latest | 最新作成Snapshotを常にcurrentへする | partialがstable resultを上書きするため非推奨 |
| C-B Completed auto-promotion | validation済みcompletedだけsystemがcurrentへ昇格 | 安全なbaseline |
| C-C Partial explicit promotion | partialはactor/reason/limitations付き明示昇格だけ許可 | controlled exception candidate |
| C-D Separate pointers | latest、current、strategy sourceを別relationshipとして管理 | semantic clarityのため推奨 |

推奨は`C-D + C-B baseline + C-C controlled exception`。Currentは単なる最大timestampではなく、Organization/targetごとの明示的pointerまたはpromotion relationshipとする。Completed Snapshotはvalidation成功時にpolicy-driven system promotion可能。Partial Snapshotは自動昇格せず、許可する場合だけ明示actor/reason/limitations付きで昇格する。

## 8. Workstream C — Strategy Source Eligibility

`Score Calculation Eligibility ≠ Snapshot Eligibility ≠ Strategy Source Eligibility`を維持する。

Completed Snapshotはrequired validationを満たせばStrategy Source eligibility candidateになる。Eligibilityとpromotionは分離し、eligibleになったことだけで選択中Strategy Sourceをsilent置換しない。

Partialの候補:

| Candidate | Policy | Assessment |
| --- | --- | --- |
| P-A Never eligible | partialを一切利用しない | 安全だがEvidence価値も失う |
| P-B Manual formal promotion | actor承認でFormal Sourceにできる | 柔軟だが誤用と監査負荷が高い |
| P-C Required-section gate | required section完成時だけeligible | profile/threshold定義が必要 |
| P-D Evidence reference only | Evidenceとして参照可能だがFormal Sourceにしない | v1の安全性と説明可能性が高い |

v1推奨はP-D。`partially_completed`はFormal Strategy Sourceへauto/manual promotionせず、limitations付きEvidence referenceとしてだけ利用可能にする。P-B/P-Cは必要性とvalidation evidenceが得られた将来revisionで再評価する。

Strategy generationが使用するEvidence、Snapshot、Score、Formal Strategy Sourceを別conceptとする。Partial Evidenceへの参照は、正式なStrategy baseline/Sourceとして採用したことを意味しない。

Promotion auditには最低限、eligibility/promotion status、reason、actorまたはsystem policy、timestamp、source Snapshot、limitations、policy/version referenceを必要とするLogical Candidateとする。

## 9. Workstream D — Reanalysis and Evidence Reuse

全terminal outcomeから、authorization、target、entitlement、policyを満たす場合にnew AnalysisJobを作成可能とするCandidateを推奨する。Reanalysis availabilityはautomatic free retryを意味しない。

| Candidate | Identity policy | Disposition |
| --- | --- | --- |
| R-A Mutate previous Job/result | 旧resourceを更新 | historical meaningを破壊するためreject |
| R-B New Job, replace old Snapshot | Jobは新規だがSnapshotを上書き | immutable historyを破壊するためreject |
| R-C New Job/Result/Snapshot + lineage | 全resourceを新規作成し関係を保持 | `RECOMMENDED` |

Logical lineageはprevious/reanalysis relationship、previous Snapshot、trigger reason、actor、reused Evidence、Formula/Pipeline versionsを追跡可能にする。Exact physical field名は未決定。

Evidence reuse candidates:

- Always recollect: freshnessは高いがcost/latencyが大きい。
- Reuse where valid: validity判断が曖昧になり得る。
- Explicit reuse profile: freshness、source/version、TTL/context、reasonをpolicyで判定できる。
- Never reuse: reproducibilityは単純だが無駄が大きい。

`Explicit reuse profile`を推奨する。Defaultは再取得を優先し、immutable Evidenceをmutationせず、reuse時はsource Evidence ID、capturedAt、policy/version、reasonをlineageへ残す。Exact cache/TTLはImplementation/Validationへdeferする。

## 10. Snapshot History Model

Immutable chronological historyを維持し、次を分離する。

- latest: timestamp/orderから導出される最新artifact
- current: Product上の代表Snapshot pointer/promotion
- strategy source: Formal Strategy生成に採用されたsource relationship
- previous/reanalysis: generation lineage

`latest ≠ current ≠ strategy source`。Supersededは削除を意味せず、historical readとlineageを維持する。

## 11. Usage Model Candidates

| Candidate | Trigger | Benefit | Risk |
| --- | --- | --- | --- |
| U-A Start-based | Job開始 | cost recovery/abuse resistance | failure時のfairnessが低い |
| U-B Completed-only | completedだけ | 分かりやすい | usable partialや高cost failureを扱えない |
| U-C Usable-result | usable result生成 | user valueと整合 | usable判定契約が必要 |
| U-D Resource/stage-based | stage/resource消費 | costとの対応が高い | 複雑で説明しにくい |
| U-E Plan-specific | versioned plan policy | plan差を明示可能 | silent/恣意的policy化のrisk |

推奨は`U-E Plan-specific policy`を正本とし、v1 default candidateを`U-C Usable-result`に置くHybridである。

- completed: consume candidate
- partially_completed: valid user-visible limited resultをcommitした場合はconsume/adjusted candidate
- failed/timed_out: default non-consume。明示resource-based planだけ例外候補
- cancelled: default non-consume。利用者に事前開示されたcheckpoint後のadjusted dispositionはplan policy候補

Exact unit、amount、checkpoint、refund、plan mappingにはcost、commercial policy、abuse evidenceが必要で、Decision Reviewまたは後続Validationで確定する。Logical contractは`consumed / not_consumed / adjusted / pending_review`相当のbusiness disposition、reason、policy version、decidedAtを保持できるCandidateとする。

## 12. Billing / Usage and Retry / Reanalysis Boundaries

`Usage Entitlement consumption ≠ Stripe charge event`。PD-04はPanoptes内のAnalysis Usage semanticsとauditabilityまでを対象とし、Stripe charge/refund implementation、金額、invoiceは対象外とする。

- Retry: transient technical failureに対するsame logical Job内のnew attempt。Idempotency scopeとdeadlineを維持する。
- Reanalysis: user/business intentによるnew AnalysisJob。新しいidempotency scope、Result、必要ならSnapshotを持つ。

Retry countを新規analysis usageとして自動計上せず、Reanalysisをfree retryとも自動判断しない。Usage policyがreasonとrelationshipを評価する。

## 13. User-visible Status and Quality Boundary

`partially_completed`では最低限、次を説明可能にする。

- 一部分析が未完了であること
- completed/failed/missing stageまたはsection
- 利用可能なResult/Evidence
- limitations、quality/coverage context
- reanalysis availabilityと、実行時のusage consequenceへの導線

Exact copy、layout、color、warning componentはPresentation handoffとする。

`AnalysisJob outcome ≠ Score completeness ≠ Observation quality ≠ Confidence ≠ Crawl coverage`。Job outcomeから個別Axis/Scoreのqualityを単純推測せず、逆に一つのPARTIAL ScoreだけでJobを`partially_completed`へ自動変換しない。

## 14. Promotion State Concepts

Job StateへSnapshot/Strategy promotion semanticsを埋め込まない。新しい巨大enumを作らず、概念上少なくとも次を分離する。

- Snapshot artifact lifecycle: materialized、current relationship、superseded relationship
- Snapshot eligibility: eligible/ineligible/conditional + reason
- Strategy Source eligibility: eligible/ineligible + reason
- Strategy Source promotion: promoted/rejected/unselected relationship + audit

Exact enumとphysical state machineはTechnical Contractへdeferする。

## 15. Source of Truth and Outcome Adjudication

| Owner | Logical responsibility |
| --- | --- |
| Rails | Canonical AnalysisJob Business State、terminal adjudication、Snapshot commit/lifecycle/current pointer、Strategy Source eligibility/promotion、reanalysis lineage、usage disposition、Organization authorization、audit |
| Worker | Stage execution、attempt-level technical outcome、Evidence/Result production、stage summary、technical reason、resource telemetry |
| Frontend | Validated state/result display、limitations/warnings、user-triggered cancel/reanalysis/promotion request。Business stateを推測しない |

Workerのsuccess/failure/timeout/stage summaryはtechnical factsである。Railsがexpected state、attempt、Organization、result integrity、policyを検証してcanonical completed/partially_completed/failed/cancelled/timed_outとBusiness consequenceを決定する。Queue/Worker/FrontendをCanonical Business Stateの最終決定者にしない。

## 16. PD-04 Logical Contract Candidate

```text
AnalysisJobOutcome
  terminal state
  outcome reason
  stage completion/failure summary
  usable-result decision + policy reference
  finishedAt

Snapshot
  identity / Organization / target
  source AnalysisJob
  completeness / limitations / quality
  Formula / Axis / Observation / Pipeline / Evidence lineage
  immutable generatedAt / committedAt
  eligibility and current/promotion relationships

StrategySource
  source Snapshot or Evidence reference
  eligibility / reason
  promotion relationship / actor / policy / timestamp
  limitations

Reanalysis
  new AnalysisJob identity
  previous Job/Snapshot relationship
  trigger / actor / reused Evidence lineage

UsageDecision
  business disposition / reason
  plan-policy version
  related Job/result
  decidedAt
```

Exact DB、JSON、OpenAPI、enum casing、retention period、transaction/outbox設計は作らない。

## 17. Decision Candidate Summary

| Decision | Candidates | Recommendation |
| --- | --- | --- |
| A. partially_completed meaning | stage-based / artifact-exists / usable validated result | usable validated result + explicit limitations |
| B. Snapshot eligibility | S-A complete-only / S-B limited Snapshot / S-C Job-only | S-B |
| C. Current promotion | C-A latest / C-B complete auto / C-C partial explicit / C-D separate pointers | C-D + C-B baseline + C-C exception |
| D. Strategy promotion | P-A never / P-B manual / P-C required sections / P-D evidence-only | P-D for partial v1; completed eligible after validation |
| E. Reanalysis | R-A mutate / R-B replace / R-C new identities + lineage | R-C |
| F. Usage | U-A start / U-B complete / U-C usable result / U-D resource / U-E plan-specific | U-E with U-C v1 default candidate |

## 18. PD-04 Closure Requirements

PD-04をDecision Completeにするため、次をProduct Ownerが承認する必要がある。

1. Terminal outcome semanticsとfailed/partial/cancel/timeout boundary
2. Snapshot eligibility、immutability、history/current relationship
3. Current promotion rule
4. Completed/Partial Strategy Source eligibility/promotion rule
5. Reanalysis identity/lineageとEvidence reuse policy direction
6. Usage disposition ownershipとdefault policy
7. Rails/Worker/Frontend ownershipおよびTechnical/Business outcome boundary
8. Deferred implementation、exact parameter、retention、billing boundary

Exact DB/JSON/OpenAPI、price/amount、retention period、cache/queue/retry codeはClosure blockerにしない。

## 19. Decision Readiness

| Workstream | Readiness | Remaining before approval |
| --- | --- | --- |
| AnalysisJob Outcome | `READY_FOR_DECISION_REVIEW` | exact entry thresholdはValidation handoff |
| Snapshot Lifecycle | `READY_FOR_DECISION_REVIEW` | choose S-B and C-D/B/C policy |
| Strategy Promotion | `READY_FOR_DECISION_REVIEW` | choose partial v1 policy and completed promotion rule |
| Reanalysis / Usage | `READY_FOR_DECISION_REVIEW` | choose R-C, reuse direction, U-E/U-C direction; exact units later |
| PD-04 overall | `READY_FOR_DECISION_REVIEW / NOT_APPROVED` | Product Owner review/approval |

Repository evidenceだけではExact cost、plan entitlement、retention、promotion UXは確定できない。ただしそれらをimplementation/validation/presentationへ分離したlogical Product Directionの比較材料は揃っており、Decision Reviewを開始する外部blockerは確認されなかった。

## 20. Deferred / Non-goals

- Exact partial entry threshold、required stage/section set、coverage/minimum count
- Exact usage unit、price、billing amount、checkpoint、refund、plan mapping
- Retention period、Evidence TTL/cache policy
- Exact JSON/DB/OpenAPI、enum/field casing
- Rails/Worker/BFF/Frontend/Snapshot implementation
- Stripe implementation
- UI copy/layout/color
- Retry/queue/outbox/idempotency code

## 21. Validation and Next Phase

Documentation-onlyとしてDecision Register、Audit、Development Logのstatus、candidate、handoff、referencesを同期する。Source、Formula、Rails、Worker、BFF、Frontend、DB、OpenAPIを変更せず、repo-wide discoveryとfull quality gateは行わない。

次PhaseはPD-50 `PD-04 partially_completed Snapshot Workflow Decision Review`を推奨する。

## 22. References

- [Product Decision Register](../product/product-decision-register.md)
- [PD-48 PD-02 Parent Closure Approval](./106-pd02-parent-closure-explicit-product-owner-approval-record.md)
- [PD-46 PD-02D Approval](./104-pd02d-missing-partial-score-contract-explicit-product-owner-approval-record.md)
- [PD-43 Dependency / Readiness Review](./101-pd02d-pd04-dependency-discovery-readiness-review.md)
- [Canonical AnalysisJob State Machine](../api/analysis-job-state-machine.md)
- [AnalysisJob Frontend Boundary](../architecture/analysis-job-frontend-boundary.md)
- [AnalysisJob Runtime Mapping](./40-analysis-job-runtime-mapping.md)
- [Snapshot Component Map](../architecture/snapshot-component-map.md)
- [Snapshot Component Comparison](./21-snapshot-component-comparison.md)
- [Strategy Roadmap Analysis](./44-strategy-roadmap-phase-card-analysis.md)
- [Development Log](../DEVELOPMENT_LOG.md)
