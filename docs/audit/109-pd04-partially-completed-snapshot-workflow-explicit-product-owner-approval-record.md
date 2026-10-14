# Phase PD-51 — PD-04 partially_completed Snapshot Workflow Explicit Product Owner Approval Record

Date: 2026-09-07  
Decision Owner: Product Owner  
PD-04 Final Proposal: `DECIDED / APPROVED`  
PD-04 Closure Proposal: `DECIDED / APPROVED`  
PD-04 Status: `DECISION_COMPLETE`  
Auxiliary Status: `CLOSED_WITH_DEFERRED_ITEMS`  
Implementation: `NOT_IMPLEMENTED`

## 1. Approval Evidence

Product Ownerから次の明示承認を受領した。

> 「PD-04のpartially_completed Snapshot Workflow Proposal、およびPD-04 Closure Proposalを承認する。」

- Approval Date: 2026-09-07
- Decision Owner: Product Owner
- Approved subjects: PD-50 Final Proposal一式とPD-04 Closure Proposal

このEvidenceによりPD-04のProduct/Domain Decision Scopeを正式Closureする。Exact threshold、usage/price、retention、physical schema、implementationを承認済みとは扱わない。

## 2. Canonical Outcome Contract

Canonical terminal statesは`completed / partially_completed / failed / cancelled / timed_out`を維持し、state追加・renameを行わない。

`partially_completed`は、利用可能かつ検証可能なProduct Resultが存在するが、required processingの一部が未完了であり、limitationsを明示できるAnalysisJob-level terminal outcomeとする。Observation/Axis/Scoreの`PARTIAL`およびPartial Snapshot completenessとは別概念である。

成立にはvalid Result integrity、AnalysisJob identity、Organization ownership、Formula/Evidence lineage、missing/failed stagesの特定、limitationsの説明可能性を要求する。Exact technical thresholdは未決定である。

`failed`は利用可能なProduct ResultをfinalizeできないOutcomeとする。Technical stage failure数だけでCanonical Outcomeを決めない。Timed out/cancelledをterminal後に別Outcomeへsilent rewriteせず、途中Evidenceはaudit/diagnostics目的で保持可能だがFormal Snapshotへ自動昇格しない。

## 3. Snapshot Lifecycle and Current Promotion

Snapshot eligibility baseline:

| Outcome | Status |
| --- | --- |
| completed | `CAN_CREATE` |
| partially_completed | `CONDITIONAL` |
| failed | `CANNOT_CREATE` |
| cancelled | `CANNOT_CREATE` |
| timed_out | `CANNOT_CREATE` |

S-B Limited Snapshotを承認する。Partial Snapshotにはvalid Result、source Job、outcome、completeness、limitations、missing stages、quality/coverage、Formula/Evidence lineage、timestampsを要求する。

`latest ≠ current ≠ strategy source`とし、Currentをexplicit pointerまたはpromotion relationshipとして管理する。C-D Separate Pointers + C-B Completed Auto-promotion Baseline + C-C Partial Controlled Exceptionを承認する。

- Completed Snapshotはpolicy条件を満たす場合にcurrentへ自動昇格可能。
- Partial Snapshotは自動昇格しない。将来必要な場合だけexplicit controlled promotionを許容可能。
- Failed/cancelled/timed_outはcurrent昇格対象外。

Snapshotはgeneration-time artifactとしてimmutableで、Reanalysisはnew Job/Result/eligible Snapshotを生成し、既存resourceをmutationしない。

## 4. Strategy Source Contract

`Score Calculation Eligibility ≠ Snapshot Eligibility ≠ Strategy Source Eligibility`を維持し、PD-04がStrategy Source lifecycle/promotionを所有する。

- Completed Snapshotはrequired validation後にStrategy Source eligible。ただしeligibleはselected sourceを意味せず、既存Sourceをsilent置換しない。
- Partially completed Result/Snapshotはv1 P-D `EVIDENCE_ONLY`。Evidenceとして閲覧・参照可能だがFormal Strategy Sourceへauto/manual promotionせず、Formal Strategy Sourceとして利用しない。

Current/Strategy promotionはstatus、reason、actor/system policy、timestamp、source Snapshot、limitations、policy/versionをLogical Audit Metadataとして保持可能にする。Exact schemaはdeferする。

## 5. Reanalysis, Lineage, and Evidence Reuse

全terminal outcomeからauthorization、target validity、entitlement、Product policyを満たす場合にReanalysisを開始可能とする。

R-Cを承認する。Reanalysisはnew AnalysisJob + new Result + new eligible Snapshotを生成し、previous Job/Result/Snapshotをmutationしない。Previous Job/Snapshot、trigger、actor、reused Evidence、Formula Version、Pipeline Versionを追跡可能にする。

Evidence reuseはVersioned Explicit Reuse Profileを承認する。v1はrecollection priorityで、explicit approved ruleが許可した場合だけreuseする。Reuse reason、source Evidence、freshness、version compatibilityを保持し、silent reuseを`REJECT`する。Exact TTL/cache ruleはdeferする。

Immutable chronological Snapshot historyとlatest/current/strategy-source/reanalysis relationshipsを分離する。

## 6. Usage and Retry Contract

U-E Plan-specific Policy + U-C Usable-result v1 Baselineを承認する。Usable Product Resultが成立した場合をAnalysis Usage消費対象のbaselineとし、Versioned Plan/Usage Policyによる明示overrideを許可する。

| Outcome | Logical baseline |
| --- | --- |
| completed | `CONSUMED` candidate |
| partially_completed | usable Result成立時`CONSUMED / ADJUSTED` candidate |
| failed | `NOT_CONSUMED` baseline |
| cancelled | `NOT_CONSUMED` baseline |
| timed_out | `NOT_CONSUMED` baseline |

Exact Usage Outcome enum、unit、count、price、refund/credit、plan-specific exact ruleは後続へhandoffする。

`Panoptes Usage Entitlement Consumption ≠ Stripe Charge / Payment Event`を正式境界とする。PD-04はAnalysis Usage Business Semanticsまでを所有し、Stripe Payment implementationを所有しない。

Retryは同一AnalysisJob内のtechnical attempt、Reanalysisはnew Business AnalysisJobとする。RetryでBusiness Job identityを増やさず、Reanalysisではnew identityを発行する。

## 7. User-visible, Quality, and Promotion Boundaries

`partially_completed`についてcompleted/incomplete portions、limitations、usable Result、Snapshot status、reanalysis availability、usage consequenceを説明可能にする。Exact UI copy/layoutはPresentation handoffとする。

`AnalysisJob Outcome ≠ Score Completeness ≠ Observation Quality ≠ Confidence ≠ Crawl Coverage`を維持する。Job outcomeからScore Qualityを一律推測しない。

Job Stateへcurrent/promoted/strategy-sourceを混在させず、Snapshot lifecycleとStrategy lifecycleのseparate relationshipsとして扱う。Exact enumはdeferする。

## 8. Ownership and Technical / Business Boundary

| Owner | Approved responsibility |
| --- | --- |
| Rails | Canonical AnalysisJob Business Outcome、Snapshot lifecycle/current、Strategy Source eligibility/promotion、reanalysis identity/lineage、UsageDecision、authorization、audit |
| Worker | Stage execution、attempt-level technical outcome、Evidence/Result production、stage summary、resource telemetry |
| Frontend | Validated state/result/limitations displayとuser request。Business outcome/promotion/usageを推測しない |

Workerはtechnical factsを返し、RailsがResult integrityとProduct Policyを評価してCanonical Business Outcomeを決定する。Worker stage failureをautomatic Job `failed`へ1対1変換しない。

## 9. Approved PD-04 Logical Contract

次の5 Logical Objectsを承認する。

- `AnalysisJobOutcome`: state、reason、stage summary、limitations
- `Snapshot`: identity、source Job、completeness、limitations、lineage、current relationship
- `StrategySource`: eligibility、promotion/selection relationship、source Snapshot
- `Reanalysis`: new Job identity、previous lineage、trigger
- `UsageDecision`: consumed/adjusted/not-consumed等のpolicy outcome、reason、policy reference

Exact JSON、DB、OpenAPI representationは未決定である。

## 10. v1 Direction and Closure

- Job: usable validated Result + explicit limitations = `partially_completed`
- Snapshot: Limited Snapshot allowed conditionally
- Current: latest/current/sourceを分離。Completedはpolicy-driven auto-promotion可、Partialはauto-promotion不可
- Strategy: Completedはvalidation後eligible、Partialはv1 `EVIDENCE_ONLY`
- Reanalysis: new Job/Result/Snapshot + immutable history
- Usage: Versioned Plan-specific Policy + usable-result baseline

Product Owner承認により、Job Outcome、Snapshot/current、Strategy Source、Reanalysis/reuse、Usage、Retry distinction、ownership、Logical ContractのDecision Scopeが満たされた。PD-04を`DECISION_COMPLETE`、補助Statusを`CLOSED_WITH_DEFERRED_ITEMS`とする。

`Decision Complete ≠ Implementation Complete`。Implementationは`NOT_IMPLEMENTED`である。

## 11. Deferred Ledger

| Classification | Items |
| --- | --- |
| `PRODUCT / VALIDATION HANDOFF` | Exact partial threshold、Evidence reuse calibration/policy details |
| `USAGE / BILLING HANDOFF` | Usage unit/count/price/refund/credit、plan-specific exact policy |
| `DATA / IMPLEMENTATION HANDOFF` | JSON/DB/OpenAPI/persistence、Rails/Worker/BFF/Frontend/Snapshot implementation |
| `OPERATIONS HANDOFF` | Retention、Evidence TTL、queue/retry implementation |
| `PRESENTATION HANDOFF` | partially_completed wording、warning/limitations/usage consequence UI |
| `STRIPE HANDOFF` | Payment/billing integration |

`Deferred ≠ Forgotten`。これらはPD-04 Closure blockerではなく、決定・検証・実装済みとも扱わない。

## 12. Scope and Validation

Approval-only / Documentation-onlyとしてDecision Register、Audit、Development LogのApproval Evidence、Closure、Deferred Ledger、referencesのみ同期する。Repo-wide discovery、Source、Rails、Worker、DB、OpenAPI、Stripe変更、full quality gateは行わない。

## 13. References

- [PD-50 Decision Review](./108-pd04-partially-completed-snapshot-workflow-decision-review.md)
- [PD-49 Full Discovery](./107-pd04-partially-completed-snapshot-workflow-full-discovery.md)
- [PD-43 Dependency / Readiness Review](./101-pd02d-pd04-dependency-discovery-readiness-review.md)
- [PD-02D Approval Record](./104-pd02d-missing-partial-score-contract-explicit-product-owner-approval-record.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Development Log](../DEVELOPMENT_LOG.md)
