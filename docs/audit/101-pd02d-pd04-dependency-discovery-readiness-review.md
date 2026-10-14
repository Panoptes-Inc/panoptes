# Phase PD-43 — PD-02D / PD-04 Dependency and Discovery Readiness Review

Date: 2026-08-24  
Phase Type: Dependency / Discovery Readiness Review  
PD-02C: `DECISION_COMPLETE`  
PD-02D: `READY_FOR_DISCOVERY`  
PD-04: `READY_FOR_DISCOVERY / NON_BLOCKING_TO_PD-02D`  
Recommended Next Option: `OPTION A — START PD-02D DISCOVERY`  
Implementation: `NOT_IMPLEMENTED`

## 1. Review Scope

PD-02DをblockしていたPD-04 dependencyを、既存Product Decision Register、Score/Axis Data Dictionary、PD-42 approval、Canonical AnalysisJob state machine、B-3J runtime mapping、Snapshot lineage auditに限定して再評価した。

Missing/Partial Score Treatment自体、Formula変更、Rails/Worker/Snapshot/OpenAPI/Frontend実装は行わない。目的は「PD-02D開始前にPD-04全体または追加Decisionが必要か」の判定である。

## 2. Previous Blocker and Final Finding

Previous statusは`PD-02D = BLOCKED / PD-04_BACKEND_WORKFLOW_DEPENDENCY`。既存記録ではPD-02DがBackend completenessとPD-04へ依存すると一括表現されていた。

PD-42によりBackend Wireは5 completeness states、reason、coverage、non-calculated stateを保持可能なlogical contractとして承認された。PD-04を分解すると、Snapshot commit/current promotion、Strategy source promotion、retry/reanalysis lifecycle、usage/billingはJob/Snapshot workflowのDecisionであり、per-Observation/Submetric/AxisのScore Treatmentを検討する前提ではない。

Final finding:

- PD-02C/backend wire dependency: `RESOLVED`
- Canonical Job terminal/status dependency: `SATISFIED`
- Per-result completeness/reason/lineage carrier: `SATISFIED`
- PD-04 Snapshot/Strategy/reanalysis/usage decisions: `REAL GAPS, BUT NOT PD-02D DISCOVERY BLOCKERS`
- PD-02D external blocker: `NONE IDENTIFIED`

## 3. Canonical AnalysisJob Semantics Status

Current Canonical Contractは次の14 statesで、新しいstateは追加しない。

```text
queued
  → preparing
  → crawling
  → capturing
  → internal_analysis
  → awaiting_confirmation
  → visual_analysis
  → llm_analysis
  → finalizing
  → completed

terminal alternatives:
failed | cancelled | timed_out | partially_completed
```

`completed / failed / cancelled / timed_out / partially_completed`はterminal、`awaiting_confirmation`はnon-terminal business pauseである。B-3J frontend adapterは14 statesとterminal判定を実装済みだが、Rails canonical model/APIは未実装である。

State set、terminal性、polling停止、新しいAnalysisJobとしてのuser reanalysis directionは既存Canonical Contractとして利用できる。`partially_completed`のcurrent Snapshot昇格等はJob state setとは別のProduct semanticsである。

## 4. `partially_completed` Existing Policy Classification

| Concern | Classification | Current meaning |
| --- | --- | --- |
| Terminal / polling stop | `CANONICAL CONTRACT / IMPLEMENTED FRONTEND MAPPING` | terminalとしてpolling停止 |
| Completed-compatible result viewing | `CURRENT SAFE FRONTEND BEHAVIOR` | warning付きで結果surfaceを表示 |
| Warning display | `CURRENT SAFE FRONTEND BEHAVIOR` | Product copy/detailは未決定 |
| Snapshot save | `PRODUCT DECISION REQUIRED` | State-machine draftはcommitted partial Snapshot方向だがPD-04 Option A/B/Cは未選択 |
| Project current Snapshot promotion | `PRODUCT DECISION REQUIRED` | 推測更新しない |
| Formal Strategy Source auto-promotion | `CURRENT SAFE BOUNDARY / FINAL POLICY UNDECIDED` | 自動昇格しない |
| Reanalysis allowed | `CURRENT CAPABILITY + CANONICAL NEW-JOB DIRECTION` | full retry/replacement policyは未決定 |
| Evidence/result lineage retention | `APPROVED LOGICAL REQUIREMENT / IMPLEMENTATION TBD` | PD-42 provenance/history contractで追跡可能性を要求 |

Frontend behaviorをSnapshot persistence/Strategy Product Decisionへ昇格しない。Canonical state-machine draftとPD-04 Product Decisionの差はPD-04 Discoveryで解消する。

## 5. Four Partial Concepts

次を別概念として扱う。

| Concept | Scope | Owner / contract |
| --- | --- | --- |
| Observation-level `PARTIAL` | 一部Evidence/coverageのみ取得 | Observation Contract + PD-02D treatment |
| Axis-level `PARTIAL` | 一部Submetricだけ計算可能 | Score Contract + PD-02D treatment |
| AnalysisJob `partially_completed` | Job全体のterminal outcome | AnalysisJob Contract + PD-04 workflow |
| Partial Snapshot state | 保存されたSnapshot/resultのcompleteness | PD-04 Snapshot lifecycle + Backend implementation |

Jobが`partially_completed`でも全Axisを一律`PARTIAL`にせず、逆に1 Axisの`PARTIAL`だけでJob stateを自動決定しない。Job outcomeとScore input/result completenessのmapping ruleは明示Contractを通す。

## 6. Missing and Technical Failure Boundary

PD-02D Discoveryでは最低限、次を別原因として扱う必要がある。

- Product-side absence: 観測範囲内で対象Evidenceが存在しない。
- Observation failure: crawler/visual/semantic処理が失敗した。
- Scope unknown: 観測不足で存在有無を判断できない。
- Not applicable: Product context上、評価対象外である。
- Partial: 対象の一部だけを観測・計算できた。

Backend Wireがstatus、reason、coverage contextを運ぶ能力はPD-42で承認済みである。Exact reason taxonomyと各Score TreatmentはPD-02D自身のDecision対象であり、PD-04の事前Decisionではない。Technical failureをProduct absenceまたは0 scoreへsilent collapseしない。

## 7. Snapshot Dependency Findings

PD-02D DiscoveryにExact Snapshot DB schema、persistence implementation、current Snapshot promotion ruleは不要である。PD-02Dが必要とするのは、Score ResultがSnapshot commit前にも存在し、Snapshotへmaterializeされる場合はgeneration-time completeness/reason/formula lineageを失わないという承認済みlogical boundaryで足りる。

Partial resultをSnapshotとして保存するか、Project currentへ昇格するか、Job resultだけに留めるかはPD-04のProduct Decisionとして残す。PD-02Dは各選択肢で再利用できるScore Treatment Contractを定義できる。

## 8. Strategy Source Promotion Boundary

`Score exists ≠ Formal Strategy Source eligible`を正式なdependency boundaryとする。

- Formula eligibility: Observation/Submetric/AxisをScore計算へ含めるか。PD-02D scope。
- Snapshot/current promotion: Partial resultを正式Snapshot/currentへするか。PD-04 scope。
- Strategy promotion eligibility: Snapshot/resultをStrategy生成の正式sourceへするか。PD-04/Product workflow scope。

Current safe boundaryとして`partially_completed`をFormal Strategy Sourceへ自動昇格しない。最終的なmanual approval/禁止/条件付き昇格はPD-04で決めるが、PD-02D Discoveryをblockしない。

## 9. Reanalysis Dependency

Canonical directionではuser reanalysisは新AnalysisJobを作り、previous result/evidenceとnew resultのlineageを分離する。現行Frontendにもreanalysis actionがある。

PD-02Dが必要とするのは、過去Score Resultをmutationせず、再計算結果が新しいresult identityとlineageを持つことだけである。Snapshot replacement/new Snapshot、automatic retry、billing、retention期間、UI flowはPD-04/backend implementationへdeferし、PD-02D blockerにしない。

## 10. Unsupported Calculation Findings

Unsupported/non-calculated stateは次のような場合に必要になる。

- Formula/Profile/parameterを解決できない。
- required Observationがfailure/unknownで利用不能。
- historical contractをruntimeが解決できない。
- Formula Versionがincompatible/unsupported。
- required Layerまたはrequired inputが不足する。

Exact enumは未決定。PD-02Dはcompleteness/eligibility原因からScoreを計算する・除外する・non-calculatedにする境界を扱う。Formula registry resolution failureやhistorical compatibility classificationはPD-02C contractを参照し、PD-02DがFormula Version semanticsを再定義しない。

## 11. Rails Semantic Gaps

Rails実装不在とBusiness semantics未決定を分離する。

| Concern | Classification | PD-02D blocker |
| --- | --- | --- |
| Canonical Job state/terminal set | `DOMAIN CONTRACT AVAILABLE` | No |
| Completeness/status/reason carrier | `BACKEND LOGICAL CONTRACT APPROVED` | No |
| Eligibility/treatment ownership | `PD-02D PRODUCT/DOMAIN DECISION` | No; PD-02Dの作業対象 |
| Partial Snapshot commit/current promotion | `PRODUCT_DECISION_REQUIRED / PD-04` | No |
| Strategy Source promotion | `PRODUCT_DECISION_REQUIRED / PD-04` | No |
| Reanalysis/replacement/billing workflow | `PRODUCT + BACKEND LOGICAL CONTRACT REQUIRED / PD-04` | No |
| Rails model/table/transaction/outbox | `IMPLEMENTATION_ONLY` | No |
| OpenAPI exact schema/path/error | `IMPLEMENTATION/TECHNICAL CONTRACT` | No |

PD-04には実際のsemantic gapsがあるが、PD-02DのScore Treatment Discoveryとは直列化しない。

## 12. Minimum Unblock Set

PD-02D開始に必要な最小条件と充足状況:

1. Canonical Axis identity and Formula boundary: `SATISFIED` by PD-02B/PD-02C。
2. Distinct completeness states: `SATISFIED` by Observation/Backend Wire Contract。
3. status/reason/coverageを運ぶlogical carrier: `SATISFIED` by PD-42。
4. AnalysisJob `partially_completed` terminal semantics: `SATISFIED` by Canonical state contract。
5. Score Result identity/provenance before Snapshot commit: `SATISFIED` by PD-42。
6. Formula eligibilityとStrategy promotionのownership separation: `SATISFIED` by approved architecture boundary and this dependency review。

Exact cause taxonomyとtreatment ruleは前提ではなくPD-02D Discoveryの対象である。よって追加のprecondition Decisionは不要である。

## 13. PD-04 Scope Findings

PD-04には少なくとも4 concernがある。

- PD-04A: Partial AnalysisJob outcome/usable-result semantics
- PD-04B: Partial Snapshot commit/current lifecycle
- PD-04C: Strategy Source promotion
- PD-04D: Reanalysis/history/usage lifecycle

この分割は責務分析には有用だが、現時点で4つの新Decision IDへ恒久分割する必要はない。PD-04 Discovery内のworkstreamsとして扱い、Owner、option、dependencyが異なると判明した場合のみ正式sub-decision化する。

PD-04は複数の未決定事項を持つため`READY_FOR_DISCOVERY`。Rails implementationはDiscovery開始条件ではない。

## 14. Dependency Direction and Circularity

旧表現の`PD-02D → PD-04全体`依存を解除する。

```text
PD-02D
  → approved Observation / Formula / Wire contracts
  → defines Score treatment by completeness/eligibility

PD-04
  → consumes PD-02D treatment/result metadata where relevant
  → defines Job/Snapshot/Strategy/reanalysis lifecycle
```

PD-02DはPD-04を待たず開始できる。PD-04はPD-02Dの最終Treatmentを将来consumerとして参照できるが、PD-04 Discovery自体も並行開始できる。相互に開始をblockするcircular dependencyはない。

## 15. Readiness and Recommended Option

PD-02D=`READY_FOR_DISCOVERY`。必要なsemantic inputsとlogical carrierが揃い、残る事項はPD-02D自身が決めるMissing/Partial/Eligibility treatmentである。

PD-04=`READY_FOR_DISCOVERY / NON_BLOCKING_TO_PD-02D`。Snapshot/Strategy/reanalysis/usageのProduct workflowを整理するEvidenceとoptionsは揃っており、Rails implementationを待たずDiscoveryを開始できる。

Recommended next optionは`OPTION A — START PD-02D DISCOVERY`。Focused PD-04 workshopをPD-02Dの前提にせず、必要ならPD-04 Full Discoveryを並行または後続で実施する。

## 16. Status Impact

- PD-02B: `DECIDED / COMPLETE`。
- PD-02C: `DECISION_COMPLETE`。
- PD-02D: `BLOCKED`から`READY_FOR_DISCOVERY`へ遷移。
- PD-04: `BLOCKED — BACKEND CONTRACT REQUIRED`から`READY_FOR_DISCOVERY / NON_BLOCKING_TO_PD-02D`へ遷移。
- PD-02 parent: PD-02D未決定のため`NEEDS_DISCOVERY`を維持。
- Implementation: `NOT_IMPLEMENTED`。

## 17. Deferred / Non-goals

- Missing/Partial/Eligibility Score Treatment
- Exact Formula変更
- Partial Snapshot commit/current promotion Decision
- Strategy Source promotion Decision
- Full reanalysis/replacement/history/usage/billing workflow
- Rails/Worker/BFF/Frontend implementation
- Snapshot DB schema / OpenAPI変更 / migration

## 18. Validation and Next Phase

Documentation-onlyとしてparent/audit/log status、dependency direction、Markdown referencesを同期する。Repo-wide discovery、Source変更、Rails/Worker実装、DB migration、OpenAPI変更、full quality gateは行わない。

次PhaseはPD-44 `PD-02D Missing / Partial Score Contract Discovery`を推奨する。PD-04 Full DiscoveryはPD-02Dのblockerではなく、並行または後続で開始できる。

## 19. References

- [Product Decision Register](../product/product-decision-register.md)
- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [PD-42 Approval Record](./100-pd02c-formula-version-backend-wire-contract-explicit-product-owner-approval-record.md)
- [Canonical AnalysisJob State Machine](../api/analysis-job-state-machine.md)
- [AnalysisJob Runtime Mapping](./40-analysis-job-runtime-mapping.md)
- [AnalysisJob Adapter](./41-phase-b3j-analysis-job-adapter.md)
- [AnalysisJob Frontend Boundary](../architecture/analysis-job-frontend-boundary.md)
- [Snapshot Order Lineage Workshop](./82-pd02b-snapshot-order-lineage-evidence-workshop.md)
- [OpenAPI Draft](../api/openapi-draft.yaml)
- [Development Log](../DEVELOPMENT_LOG.md)
