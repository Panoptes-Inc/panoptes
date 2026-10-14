# Phase PD-42 — PD-02C Formula Version / Backend Wire Contract Explicit Product Owner Approval Record

Date: 2026-08-24  
Decision Owner: Product Owner  
Formula Version Contract: `DECIDED / APPROVED`  
Backend Wire Logical Contract: `DECIDED / APPROVED`  
Formula Calculation Ownership: `OPTION C / DECIDED / APPROVED`  
PD-02C Closure: `OPTION B / DECIDED / APPROVED`  
PD-02C: `DECISION_COMPLETE`  
Implementation: `NOT_IMPLEMENTED`  
Exact Formula Parameters: `NOT_DECIDED`  
Calibration: `NOT_PERFORMED`

## 1. Approval Evidence

Product Ownerから2026-08-24に次の明示承認を受領した。

> PD-02CのFormula Version / Backend Wire Contract Proposal、Formula Calculation Ownership Option C、およびPD-02C Closure Option Bを承認する。

このApproval EvidenceはPD-41で`READY_FOR_APPROVAL`とした次の4対象を明示的に承認する。

1. Formula Version Contract
2. Backend Wire Logical Contract
3. Formula Calculation Ownership Option C
4. PD-02C Closure Option B

承認はlogical contractとArchitecture/Closure boundaryに限定される。Exact Formula Parameter、Calibration Dataset、physical schema、OpenAPI operation、DB design、Rails/Worker/BFF/Frontend実装を承認しない。

## 2. Approved Formula Identity and Resolution

Published immutable positive integer `formulaVersion`をHistorical Comparison / Interpretationにおける唯一のCanonical Formula Identityとする。Published Formula VersionとManifestはimmutableで、semantic changeはexisting version mutationではなくnew formulaVersionとして発行する。

Formula Version Manifestは最低限、次を一意に解決可能にする。

- Formula Architecture
- Axis Contract
- Axis-specific immutable Profile revisions
- Submetric references
- Normalization references
- Aggregation references
- Weight configuration
- Internal / Visual Fusion reference
- Applicability / Eligibility references
- Calibration lineage where applicable
- Compatibility metadata
- Approval / effective / supersedes metadata

Profile revision、human label、fingerprint、engine buildを第二のCanonical Formula Identityにしない。未承認・unknown・uncalibrated・unsupported definitionをACTIVE production Formulaへsilent substitutionしない。

## 3. Approved Formula and Profile Registry

Rails-owned logical `FormulaDefinition` RegistryをCanonical Formula Registryとする。formulaVersion resolution、lifecycle、immutable Manifest ownership、compatibility、approval/effective metadata、supersedes、historical accessを担当する。

Axis-specific Profile Revisionはimmutableかつrevision-controlledとし、formulaVersion Manifestから使用revisionを一意解決する。Profile Revision単独をHistorical Comparisonの正本にしない。Exact DB schema、table、cache、deployment topologyは未決定である。

## 4. Approved Score Output Hierarchy

```text
Raw Atomic Observation
  → Normalized Submetric Score
  → Internal / Visual Axis Score
  → Internal / Visual Layer Score
  → Overall Score
  → Presentation Transformation
```

Raw、Normalized、Derived Score、Presentation Valueを分離する。Internal/Visual Axis Scoreを別結果として保持し、途中でUnified Axis Scoreへ潰さない。Presentation clamp、formatting、roundingでCanonical Scoreをmutationしない。

## 5. Approved Submetric Score Logical Contract

Submetric Scoreはlogical identity、submetricId、axisId、Layer、normalized scoreまたはnon-calculated state、input Observation references、completeness/eligibility context、resolved Normalization/Aggregation/Profile references、formulaVersion、calculatedAtを保持可能にする。

Raw inputとNormalized Scoreを分離する。Exact JSON shape、nullable union、field nameは後続Technical Contractで決める。

## 6. Approved Axis Score Logical Contract

Axis Scoreはlogical identity、Canonical axisId、Layer、scoreまたはnon-calculated state、input Submetric references、completeness summary、quality metadata references、resolved Profile reference、formulaVersion、calculatedAtを保持可能にする。

Internal / Visual Axis Scoreは別結果とし、Array positionをAxis identityにしない。

## 7. Approved Layer Score Logical Contract

Layer Scoreはlogical identity、Layer、scoreまたはnon-calculated state、input Axis references、eligible Axis summary、Aggregation reference、completeness/quality context、formulaVersion、calculatedAtを保持可能にする。

Canonical OrderをWeight、Importance、Priorityとして使用しない。

## 8. Approved Overall Score Logical Contract

Overall Scoreはlogical identity、scoreまたはnon-calculated state、Internal Layer Score reference、Visual Layer Score reference、Fusion reference、completeness/quality context、formulaVersion、calculatedAtを保持可能にする。

Exact Fusion Ratioは`NOT_DECIDED`。未承認ratioをBackend defaultへ埋め込まず、承認済みFusionを解決できない場合にsilent Overall Scoreを生成しない。

## 9. Approved Score Identity and Provenance

Root `scoreResultId`をScore Result identityとし、Submetric/Axis/Layer/Overall childにもunambiguous logical identityを持てる構造とする。Array indexをIdentityにしない。UUID/composite key等のphysical representationはdeferする。

Score Resultから最低限、次を追跡可能にする。

- formulaVersion
- axisContractVersion
- observationSchemaVersion
- analysisPipelineVersion
- resolved Profile / Normalization / Aggregation / Fusion references
- input Observation IDs / Submetric IDs
- AnalysisJob ID
- Snapshot ID where applicable
- root / child result identities
- required calculation engine lineage
- calculatedAt

ScoreからSubmetric、Observation、Evidenceまで遡れるExplainabilityを維持する。

## 10. Approved AnalysisJob and Snapshot Linkage

`AnalysisScoreResult`はOrganization-scoped AnalysisJobに所属する。AnalysisJobをruntime ownership anchor、lineage anchor、authorization boundaryとして扱う。Score ResultはSnapshot確定前にも存在可能である。

Snapshot生成時にはgeneration-time Formula lineageを固定する。`snapshotSchemaVersion`とformulaVersionを分離し、Historical SnapshotをCurrent Formulaでsilent reinterpretしない。Partial resultのSnapshot commit/promotion/usage処理はPD-02D/PD-04へhandoffする。

## 11. Approved Historical Reconstruction and Compatibility

Historical Score Result → formulaVersion → immutable Formula Manifest → resolved Profile revisions → Submetric/Observation inputs → Evidence → AnalysisJob/Snapshotの追跡可能性を正式要件とする。Published Formula/Profile mutationによるHistorical meaning変更を禁止する。

Formula Versionが異なることだけではScore比較可能とみなさない。次のCompatibility taxonomyを使用可能とする。

- `COMPATIBLE`
- `PRESENTATION_COMPATIBLE`
- `SEMANTICALLY_INCOMPATIBLE`
- `SCORE_INCOMPARABLE`
- `MIGRATION_REQUIRED`
- `UNSUPPORTED`
- `UNKNOWN`

明示的Compatibility Evidenceがない場合、比較可能と推測しない。

## 12. Approved Completeness, Eligibility, Confidence, and Quality Wire

Score Contractは`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`をstatus、reason、coverage contextとして保持・運搬可能にする。0、missing、unknown、N/A、unsupportedを区別する。具体的Score TreatmentはPD-02Dへ委譲する。

Semantic confidence、Observation quality、Crawl coverage、Completeness、Product/Content Coverageを単一値へ統合せず、v1 `Separate Quality Indicator` Policyを維持する。

## 13. Approved Rails and Worker Responsibility

RailsはFormula Registry ownership、Profile resolution、Organization authorization、AnalysisJob orchestration、canonical input/output validation、Score persistence、Snapshot linkage、version lineage、historical resolution、compatibility ownershipを担当する。

Python WorkerはRails-resolved immutable Formula Manifestを受け取り、crawl/analytical/scoring executionを行い、calculated Score Resultとcomplete input/output lineageを返す。Worker自身をFormula RegistryのCanonical Source of Truthにしない。

## 14. Approved Formula Calculation Ownership Option C

次を正式Architecture Directionとする。

```text
Worker Calculation Engine
  + Rails Canonical Orchestration / Registry / Validation / Persistence
```

Python Workerはanalytical calculation engine、Railsはbusiness ownership、canonical Formula resolution、authorization、orchestration、validation、persistence、historical/version managementを担当する。Queue、transaction、retry、runtime topologyは実装詳細である。

## 15. Approved BFF and Frontend Responsibility

BFFはauthentication/session boundary、Organization-scoped transport/proxy、validated contract transportを担当する。Frontendはvalidated Score Result consumption、explanation、visualization、presentation rounding/clampを担当する。

Formula Business LogicをBFF/Frontendへ置かず、Presentation valueをCanonical Backend Scoreとして保存しない。

## 16. Approved Backend Wire Logical Contract

Logical rootを`AnalysisScoreResult`とする。最低限、identity、Organization/AnalysisJob linkage、optional Snapshot linkage、Formula lineage、Submetric/Axis/Layer/Overall Score results、completeness、quality metadata、provenance、calculatedAtを包含可能にする。

OpenAPIへtyped Score Result、Formula lineage、Score hierarchy、completeness、quality metadata、provenance references、timestamps、non-calculated state representationをhandoffする。Operation、path、exact schemaは未決定である。

DBへFormula Definition、Profile Revision、Score Result、Submetric/Axis/Layer/Overall Result、Provenance linkage、Organization ownership、immutability、historical accessのPersistence Concernをhandoffする。Table design、normalization、indexは未決定である。

## 17. Approved Calibration and PD-02D Boundary

Exact Weight、Exact Internal/Visual Fusion Ratio、Exact Normalization Parameter、Exact Threshold、Calibration Dataset ConstructionをPD-02C Closure blockerにしない。後続Calibration/Validation Phaseで扱い、semantic changeはnew Profile Revision + new formulaVersionとして発行する。

PD-02DへCompleteness semantics、Eligibility Treatment、MISSING/PARTIAL/NOT_APPLICABLE/UNKNOWN/unsupported calculation treatmentを正式handoffする。PD-02C Backend Wireはこれらを表現する器までを所有し、具体Ruleを決めない。

## 18. Approved PD-02C Closure Option B

Architecture、Policy、Formula Version Contract、Backend Wire Logical Contract、Formula Calculation Ownership、handoff boundaryが承認されたため、PD-02Cの設計棚卸しを`DECISION_COMPLETE`とする。

`DECISION_COMPLETE`はProduction implementation completeを意味しない。Exact Formula Calibration、physical schema、OpenAPI/DB/Rails/Worker/BFF/Frontend実装はPD-02C Closure blockerではなく、後続Validation/Implementationへhandoffする。

## 19. Status Transition

| Subject | Previous | Current |
| --- | --- | --- |
| Formula Version Contract | `READY_FOR_APPROVAL / NOT_APPROVED` | `DECIDED / APPROVED` |
| Backend Wire Logical Contract | `READY_FOR_APPROVAL / NOT_APPROVED` | `DECIDED / APPROVED` |
| Formula Calculation Ownership Option C | `READY_FOR_APPROVAL / NOT_APPROVED` | `DECIDED / APPROVED` |
| PD-02C Closure Option B | `READY_FOR_APPROVAL / NOT_APPROVED` | `DECIDED / APPROVED` |
| PD-02C | `NEEDS_DISCOVERY` | `DECISION_COMPLETE` |

Implementation=`NOT_IMPLEMENTED`、Exact Formula Parameters=`NOT_DECIDED`、Calibration=`NOT_PERFORMED`を維持する。PD-02 parentはPD-02D未完了のため`NEEDS_DISCOVERY`を維持する。

## 20. PD-02D Readiness Reassessment

PD-02C待ちは解消したが、PD-02Dは`BLOCKED / PD-04_BACKEND_WORKFLOW_DEPENDENCY`を維持する。

既存親成果物ではPD-02DがBackend completenessとPD-04へ依存すると記録されている。今回Backend Wireが5 statesとreason/coverageを運べるlogical器は承認された。一方、PD-04は`partially_completed` JobのSnapshot commit、履歴・比較、Strategy promotion、retry、usage/billing、approvalと、Rails canonical AnalysisJob/Snapshot semanticsを未解決のまま`BLOCKED — BACKEND CONTRACT REQUIRED`としている。

したがってPD-02DのPD-02C dependencyだけは`RESOLVED`だが、PD-04/backend workflow dependencyは`UNRESOLVED`である。新規PD-02D Discoveryは開始せず、PD-04 dependencyを解消またはPD-02Dから分離できるかを後続Phaseでreviewする。

## 21. Deferred Items

- Exact Formula Weight
- Exact Fusion Ratio
- Exact Normalization Parameters / Threshold / Business Rounding
- Calibration Dataset and Formula Calibration
- Missing / Partial / Eligibility Score Treatment
- Physical ID format
- Exact JSON Schema / OpenAPI operation
- DB table design / normalization / indexes
- Rails / Worker / BFF / Frontend implementation
- PD-04 partial Snapshot workflow

## 22. Validation and Next Phase

Approval-only / Documentation-onlyとしてApproval Evidence、Decision Owner、Approval Date、4 Decisionのstatus transition、PD-02C Closure、PD-02 parent、PD-02D blocker、parent/audit/log referencesを同期する。Repo-wide discovery、Source変更、Calibration、Formula/Rails/Worker実装、OpenAPI変更、DB migration、full quality gateは行わない。

次PhaseはPD-43 `PD-02D / PD-04 Dependency and Discovery Readiness Review`を推奨する。目的はPD-04 backend workflow dependencyを解消またはPD-02D discoveryから分離可能か判断することであり、本PhaseではPD-02D Discoveryを開始しない。

## 23. References

- [PD-41 Decision Review](./99-pd02c-formula-version-backend-wire-contract-decision-review.md)
- [PD-40 Discovery](./98-pd02c-formula-version-backend-wire-contract-discovery.md)
- [PD-39 Parameter Policy Approval](./97-pd02c-formula-profile-parameter-policy-explicit-product-owner-approval-record.md)
- [PD-36 Formula Architecture Approval](./94-pd02c-axis-formula-architecture-explicit-product-owner-approval-record.md)
- [PD-33 Observation Contract Approval](./91-pd02c-observation-output-contract-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Development Log](../DEVELOPMENT_LOG.md)
