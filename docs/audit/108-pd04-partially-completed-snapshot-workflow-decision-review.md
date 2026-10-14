# Phase PD-50 — PD-04 partially_completed Snapshot Workflow Decision Review

Date: 2026-09-07  
Decision: PD-04 partially_completed Snapshot Workflow  
Review Status: `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`  
PD-04 Closure Proposal: `READY_FOR_APPROVAL / NOT_APPROVED`  
Implementation: `NOT_IMPLEMENTED`

## 1. Review Scope and Disposition

PD-49の4 workstreamをProduct Ownerが承認可能なFinal Proposalへ整理した。Canonical terminal state set、PD-02のScore/Completeness/Eligibility contract、published version immutabilityを変更しない。

| Subject | Disposition |
| --- | --- |
| Job outcome semantics and failed/partial boundary | `DECIDE NOW` |
| Snapshot eligibility, current semantics, immutability | `DECIDE NOW` |
| Strategy Source eligibility and Partial Evidence-only rule | `DECIDE NOW` |
| Reanalysis identity/lineage and Evidence reuse direction | `DECIDE NOW` |
| Usage semantics and Retry/Reanalysis separation | `DECIDE NOW` |
| Rails/Worker/Frontend ownership | `DECIDE NOW` |
| Exact threshold, usage unit/price/refund, retention/TTL | `DEFER` |
| Exact JSON/DB/OpenAPI and UI copy/layout | `KEEP AS IMPLEMENTATION / PRESENTATION DETAIL` |
| Rails/Worker/BFF/Frontend/Stripe/queue implementation | `KEEP AS IMPLEMENTATION DETAIL` |
| Silent terminal rewrite, latest=current, old-resource mutation, silent Evidence reuse | `REJECT` |

Product Owner Approval Evidenceはまだ提供されていない。PD-04を`DECISION_COMPLETE`へ変更しない。

## 2. Canonical Terminal Outcomes and `partially_completed`

Canonical terminal statesは`completed / partially_completed / failed / cancelled / timed_out`を維持し、新規state追加・renameを行わない。

Final Proposal:

> `partially_completed`は、利用可能かつ検証可能なProduct Resultが存在するが、required processingの一部が未完了であり、limitationsを明示できるAnalysisJob-level terminal outcomeである。

Observation、Axis、Score、Snapshot completenessの各`PARTIAL`とは別概念とする。

Entry conditions:

- valid Result integrity
- AnalysisJob identityとOrganization ownership
- Result/Formula/Evidence lineage
- missing/failed stagesの特定
- limitationsと利用可能範囲の説明可能性

Exact stage set、coverage、minimum count、technical thresholdはdeferする。Technical stage failure数だけでJob outcomeを決めない。

## 3. Failed, Timeout, and Cancellation Policy

- `failed`: 利用可能なProduct Resultをfinalizeできない。
- `partially_completed`: limitations付きでも利用可能なProduct Resultを成立・finalizeできる。

Cancelled/timed_outをterminal後に`partially_completed`へsilent rewriteしない。途中Evidenceはdiagnostic/audit目的または明示reuse policyのため保持可能だが、Product Result、Snapshot、Strategy Sourceへ自動昇格しない。Terminal確定前にRailsがvalid limited Resultを正式finalizeできると判定した場合だけ、policyに基づき`partially_completed`を選択できる。

## 4. Snapshot Eligibility and Limited Snapshot

S-B Limited SnapshotをFinal Proposalとする。

| Job outcome | Snapshot eligibility |
| --- | --- |
| `completed` | `CAN_CREATE` |
| `partially_completed` | `CONDITIONAL` |
| `failed` | `CANNOT_CREATE` baseline |
| `cancelled` | `CANNOT_CREATE` baseline |
| `timed_out` | `CANNOT_CREATE` baseline |

Partial Snapshotにはvalid Result、source Job、outcome、completeness、limitations、missing stages、quality/coverage、Formula/Evidence lineage、timestampsを要求する。Diagnostic artifact retentionはSnapshot creationと分離する。

`Snapshot保存 ≠ current promotion ≠ Strategy Source promotion`を正式境界Proposalとする。

## 5. Current Snapshot and Promotion

`latest ≠ current ≠ strategy source`を正式分離し、CurrentをOrganization/targetに対するexplicit pointerまたはpromotion relationshipとする。Latest-createdをCurrentと同義にしない。

Final Proposalは`C-D Separate pointers + C-B Completed auto-promotion baseline + C-C Partial controlled exception`。

- Completed Snapshot: validationとpolicy条件を満たす場合、systemがcurrentへ自動昇格可能。
- Partially completed Snapshot: 自動昇格しない。必要性がある場合だけactor、reason、limitations、policy/versionを伴うexplicit controlled promotionを許可。
- Failed/cancelled/timed_out: current昇格対象外。

Exact approval UXはPresentation/Implementationへdeferする。

## 6. Snapshot Immutability and History

Snapshotはgeneration-time artifactとしてimmutableとする。Reanalysisは`new Job → new Result → new Snapshot`を作り、既存Job、Result、Snapshotをmutationしない。

Immutable chronological historyとlatest relationship、current relationship、strategy source relationship、reanalysis lineageを分離する。Supersededは削除や意味の上書きを表さない。

## 7. Strategy Source Eligibility and Promotion

`Score Calculation Eligibility ≠ Snapshot Eligibility ≠ Strategy Source Eligibility`を維持し、PD-04がStrategy Source eligibility/promotionを所有する。

- Completed Snapshot: required validationを満たした場合にStrategy Source eligible。Eligibleになっただけでcurrently selected sourceをsilent置換しない。
- Partially completed Result/Snapshot: v1はP-D `EVIDENCE_ONLY`。閲覧・参照は可能だがFormal Strategy Sourceへauto/manual promotionせず、Formal Strategy生成のsourceとして使用しない。
- Manual promotionとrequired-section gateは将来Candidateとしてdeferする。

Promotion auditはstatus、reason、actor/system policy、timestamp、source Snapshot、limitations、policy/versionを保持可能にする。Exact schemaはdeferする。

## 8. Reanalysis and Evidence Reuse

全terminal outcomeから、authorization、target、entitlement、policyを満たす場合にReanalysisを開始可能とする。Reanalysis availabilityはautomatic free executionを意味しない。

R-CをFinal Proposalとする。

```text
new AnalysisJob
  → new Result
  → new Snapshot where eligible
```

Previous Job/Result/Snapshotをmutationしない。Previous Job、previous Snapshot、triggering reason、actor、reused Evidence、Formula Version、Pipeline Versionを追跡可能にする。Exact physical fieldsはdeferする。

Evidence reuseはVersioned Explicit Reuse Profileを採用Proposalとする。Defaultはrecollectionを優先し、明示Ruleが許可した場合だけreuseする。Reuse reason、source Evidence、freshness、version compatibilityをlineageへ保持し、silent reuseを`REJECT`する。Exact cache/TTLはdeferする。

## 9. Usage Semantics Final Proposal

U-E Plan-specific policyを正本とし、U-C Usable-resultをv1 baselineとするHybridをFinal Proposalとする。

> 利用可能なProduct Resultが成立・commitした場合をAnalysis Usage消費のbaselineとし、versioned Plan/Usage Policyによる明示overrideを許可する。

| Job outcome | v1 usage baseline |
| --- | --- |
| `completed` | `CONSUMED` candidate |
| `partially_completed` | usable limited Result成立時は`CONSUMED`またはplan-defined `ADJUSTED` candidate |
| `failed` | `NOT_CONSUMED` baseline |
| `cancelled` | `NOT_CONSUMED` baseline。disclosed checkpoint後のadjustmentはplan policy candidate |
| `timed_out` | `NOT_CONSUMED` baseline。明示resource policyだけ例外候補 |

Logical UsageDecisionはconsumed/not-consumed/adjusted/pending-review相当のoutcome、reason、policy reference/version、related Job/Result、decidedAtを保持可能にする。Exact enum、unit、count、price、refund/credit、checkpoint、plan mappingはdeferする。

`Panoptes Usage Entitlement Consumption ≠ Stripe Charge / Payment Event`。PD-04はAnalysis Usage Business Semanticsまでを所有し、Stripe実装・金額・invoiceを所有しない。

## 10. Retry and Reanalysis

- Retry: same logical AnalysisJob内のtechnical attempt。Business identityを増やさない。
- Reanalysis: new AnalysisJobを作るBusiness execution。新しいBusiness identityを発行する。

Retry attemptを新しいAnalysis Usageとして自動計上せず、Reanalysisをfree retryとも自動判断しない。Usage Policyがoutcome、reason、relationshipを評価する。

## 11. User-visible and Quality Requirements

`partially_completed`ではcompleted portions、incomplete portions、limitations、available Result、Snapshot/current status、reanalysis availability、usage consequenceを説明可能にする。Exact copy、layout、colorはPresentationへhandoffする。

`AnalysisJob Outcome ≠ Score Completeness ≠ Observation Quality ≠ Confidence ≠ Crawl Coverage`を正式分離Proposalとする。Job outcomeから全Scoreを一律低Qualityと推測せず、一つのPARTIAL ScoreからJob outcomeを自動決定しない。

## 12. Promotion State Model

Job stateにcurrent/promoted/strategy-source semanticsを混在させない。

- Snapshot: materialized artifact、eligibility、current relationship、superseded/history relationship
- Strategy: eligibility、selected/promoted/rejected relationship

巨大な共通enumを作らず、separate logical relationshipsとして扱う。Exact enum/state machineはdeferする。

## 13. Rails, Worker, and Frontend Ownership

| Owner | Final responsibility proposal |
| --- | --- |
| Rails | Canonical AnalysisJob Business Outcome、Snapshot lifecycle/current、Strategy eligibility/promotion、reanalysis identity/lineage、UsageDecision、authorization、audit |
| Worker | Stage execution、attempt-level technical outcome、Evidence/Result production、stage summary、resource telemetry |
| Frontend | Validated state/result/limitations displayとuser request。Business outcome/promotion/usageを推測しない |

Workerはtechnical factsを返し、RailsがResult integrity、expected state/attempt、Organization、Product Policyを評価してcanonical Business Outcomeを確定する。Worker stage failureをautomatic Job `failed`へ1対1変換しない。

## 14. PD-04 Logical Contract Final Proposal

```text
AnalysisJobOutcome
  state / reason / stage summary / limitations
  usable-result decision / policy reference / finishedAt

Snapshot
  identity / Organization / target / source Job
  completeness / limitations / quality
  Formula / Axis / Observation / Pipeline / Evidence lineage
  immutable timestamps / eligibility / current relationships

StrategySource
  source Snapshot or Evidence reference
  eligibility / reason / selection-promotion relationship
  actor / policy / timestamp / limitations

Reanalysis
  new Job identity / previous lineage / trigger / actor
  reused Evidence and Formula/Pipeline lineage

UsageDecision
  business disposition / reason / policy reference
  related Job/Result / decidedAt
```

Exact JSON、DB、OpenAPI、enum casing、transaction/outbox、retentionはdeferする。

## 15. Recommended Model Summary

- Job: usable validated Result + explicit limitations = `partially_completed`。
- Snapshot: Limited Snapshotをconditionalに許可。
- Current: latest/current/sourceを分離。Completedはpolicy-driven auto-promotion可、Partialは自動昇格不可。
- Strategy: Completedはvalidation後eligible、Partial v1はEvidence-only。
- Reanalysis: new Job/Result/Snapshot + immutable history。
- Usage: Plan-specific policy + usable-result baseline。

## 16. PD-04 Closure Proposal

次をProduct Ownerが承認した場合、PD-04を`DECISION_COMPLETE`とするProposalを提示する。

1. Job Outcome semanticsとfailed/partial/cancel/timeout boundary
2. Snapshot eligibility、Limited Snapshot、current promotion、immutability/history
3. Strategy Source eligibility、completed policy、Partial Evidence-only rule
4. Reanalysis identity/lineage、Evidence reuse direction
5. Usage semantics、Billing separation、Retry/Reanalysis separation
6. User-visible/quality boundary、promotion state separation
7. Rails/Worker/Frontend ownershipとTechnical/Business outcome boundary
8. PD-04 Logical Contractとdeferred boundary

Exact threshold、usage unit/price/refund、retention/TTL、JSON/DB/OpenAPI、implementationはClosure blockerにしない。Product Owner承認なしにClosureしない。

## 17. Decision Readiness

| Subject | Status |
| --- | --- |
| AnalysisJob Outcome | `READY_FOR_APPROVAL / NOT_APPROVED` |
| Snapshot Lifecycle | `READY_FOR_APPROVAL / NOT_APPROVED` |
| Strategy Promotion | `READY_FOR_APPROVAL / NOT_APPROVED` |
| Reanalysis / Usage | `READY_FOR_APPROVAL / NOT_APPROVED` |
| PD-04 Closure Proposal | `READY_FOR_APPROVAL / NOT_APPROVED` |
| PD-04 overall | `READY_FOR_APPROVAL / NOT_APPROVED` |

Additional Discovery blockerは確認されなかった。Exact commercial/technical valuesが未決定でも、logical policyとownershipを承認できる。

## 18. Deferred / Non-goals

- Exact partial threshold、stage/section set、coverage/minimum count
- Exact usage unit、count、price、refund/credit、checkpoint、plan mapping
- Evidence TTL、retention period、cache policy
- Exact JSON Schema、DB Schema、OpenAPI、enum/field casing
- Rails/Worker/BFF/Frontend/Snapshot/Stripe implementation
- Exact UI copy/layout/color
- Queue/retry/outbox/idempotency implementation

## 19. Status and Next Phase

PD-50は`COMPLETED / REVIEWED`。PD-04の4 workstream、Logical Contract、Closure Proposalは`READY_FOR_APPROVAL / NOT_APPROVED`。PD-04 overallも`READY_FOR_APPROVAL / NOT_APPROVED`を維持する。

次PhaseはProduct Ownerの明示承認が得られた場合のみPD-51 `PD-04 partially_completed Snapshot Workflow Explicit Product Owner Approval Record`を推奨する。未承認または一部差戻しなら対象Proposalだけを再Reviewする。

## 20. Validation and References

Documentation-onlyとしてDecision Register、Audit、Development Logのstatus、Final Proposal、deferred boundary、referencesを同期する。Repo-wide discovery、Source、Rails、Worker、DB、OpenAPI、Stripe変更、full quality gateは行わない。

- [PD-49 Full Discovery](./107-pd04-partially-completed-snapshot-workflow-full-discovery.md)
- [PD-43 Dependency / Readiness Review](./101-pd02d-pd04-dependency-discovery-readiness-review.md)
- [PD-02D Approval Record](./104-pd02d-missing-partial-score-contract-explicit-product-owner-approval-record.md)
- [Canonical AnalysisJob State Machine](../api/analysis-job-state-machine.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Development Log](../DEVELOPMENT_LOG.md)
