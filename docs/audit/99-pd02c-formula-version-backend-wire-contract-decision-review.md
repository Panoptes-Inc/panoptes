# Phase PD-41 — PD-02C Formula Version / Backend Wire Contract Decision Review

Date: 2026-08-24  
Decision: PD-02C Formula Version / Backend Wire Logical Contract  
Review Status: `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`  
Formula Version Contract: `READY_FOR_APPROVAL / NOT_APPROVED`  
Backend Wire Logical Contract: `READY_FOR_APPROVAL / NOT_APPROVED`  
Formula Calculation Ownership: `READY_FOR_APPROVAL / NOT_APPROVED`  
PD-02C Closure Proposal: `READY_FOR_APPROVAL / NOT_APPROVED`  
Exact Formula Parameters: `NOT_DECIDED`  
Implementation: `NOT_IMPLEMENTED`

## 1. Review Scope and Disposition

PD-40のDiscoveryを、承認可能なlogical contractへ整理した。Exact DB/JSON/OpenAPI、physical ID、Calibration、Exact Parameter、PD-02D Score Treatment、Rails/Worker/BFF/Frontend実装は対象外である。

| Subject | Disposition | Review result |
| --- | --- | --- |
| Formula Identity / immutable Version Manifest | `DECIDE NOW` | Final Proposal化 |
| Formula/Profile Registry responsibility | `DECIDE NOW` | Final Proposal化 |
| Score hierarchy / logical result contracts | `DECIDE NOW` | Final Proposal化 |
| Provenance / Job / Snapshot / history / compatibility | `DECIDE NOW` | Final Proposal化 |
| Rails/Worker/BFF/Frontend responsibility | `DECIDE NOW` | Final Proposal化 |
| Formula calculation ownership Option C | `DECIDE NOW` | Final Proposal化 |
| Backend Wire logical root and required concerns | `DECIDE NOW` | Final Proposal化 |
| PD-02C Closure Option B | `DECIDE NOW` | Final Proposal化 |
| Exact formula values / Calibration Dataset | `DEFER` | Validation/Calibrationへhandoff |
| Missing/Partial/Eligibility Score Treatment | `DEFER` | PD-02Dへhandoff |
| Exact DB/JSON/OpenAPI shape and implementation | `KEEP AS IMPLEMENTATION DETAIL` | Backend design/implementationへhandoff |

Product Ownerの明示承認はまだ提供されていないため、本Reviewは`DECIDED / APPROVED`へ遷移させない。

## 2. Formula Identity Final Proposal

Published `formulaVersion`をHistorical Score comparison上の唯一のCanonical Formula Identityとする。表現はimmutable positive integerとし、1つのpublished formulaVersionから1つのimmutable Formula Definition Manifestを一意に解決する。

- Published Formula Versionはimmutableとする。
- Lifecycleは`DRAFT → ACTIVE → DEPRECATED → RETIRED`をlogical lifecycleとする。
- DRAFTの編集可能性とpublish時のidentity発行・固定を分離する。
- Human label、fingerprint、engine build、Profile revisionはCanonical Formula Identityにしない。
- Profile revisionを第二のHistorical Comparison Source of Truthにしない。

Mutable published Formula、同じformulaVersionのsemantic mutation、Profile revision単独でのHistorical Score解釈は`REJECT`する。Integer採番方法、sequence、ID column typeはimplementation detailである。

## 3. Formula Version Resolution Final Proposal

Published formulaVersionは次を一意に解決するimmutable Manifestとする。

- Formula Architecture revision/reference
- `axisContractVersion`
- Axis-specific immutable Profile revisions
- Submetric definitions/references
- Normalization references
- Aggregation references
- Weight profile
- Internal/Visual Layer aggregation and Fusion profile
- Applicability/Eligibility references
- Calibration lineage
- compatible Observation Schema / Analysis Pipeline constraints
- Compatibility、approval、effective、limitations、supersedes metadata

Unapproved、unknown、uncalibrated、unsupported resolutionをACTIVE production Formulaへsilent substitutionしない。Exact Manifest field名・nestingはimplementation detailとする。

## 4. Formula and Profile Registry Final Proposal

Rails-owned logical `FormulaDefinition` RegistryをCanonical Registryとする。責務はformulaVersion resolution、lifecycle、immutability、compatibility、approval/effective metadata、supersedes、historical access、Organization/Job assignment validationである。

Profile RegistryはAxis-specific immutable revisionsを保持し、formulaVersionから使用revisionを固定解決する。Profile revisionはFormula Definitionのsubordinate resolution identityであり、単独でScoreの比較可能性や意味を決めない。

Worker-owned Formula Registry、BFF/Frontend-owned Formula Registry、runtime独自defaultを`REJECT`する。DB table構成、normalization、cache、deployment topologyはimplementation detailとしてdeferする。

## 5. Score Output Hierarchy Final Proposal

Backend logical hierarchyを次で固定するProposalとする。

```text
Raw Atomic Observation
  → Normalized Submetric Score
  → Internal / Visual Axis Score
  → Internal / Visual Layer Score
  → Overall Score
  → Presentation Transformation
```

Raw、Normalized、Derived、Presentationを別Contract境界とする。Internal/VisualはAxis結果まで分離し、途中でUnified Axis Scoreを生成しない。Presentation値をCanonical Backend Scoreとして保存しない。

## 6. Submetric Score Logical Contract

Submetric Scoreは最低限、logical identity、`submetricId`、`axisId`、Layer、normalized scoreまたは明示的non-calculated state、input Observation references、completeness/eligibility context、Normalization/Aggregation/Profile references、formulaVersion、calculatedAtを持つ。

Raw Observation値とNormalized Scoreを分離し、raw artifactの無制限duplicateを避けてidentity/referenceで追跡する。Exact nullable union、field name、serializationはdeferする。

## 7. Axis Score Logical Contract

Axis Scoreはlogical identity、Canonical `axisId`、Layer、scoreまたは明示的non-calculated state、input Submetric result references、eligibility/completeness summary、quality metadata reference、Profile reference、formulaVersion、calculatedAtを持つ。

Internal Axis ScoreとVisual Axis Scoreは別結果として保持する。Array positionによるAxis identificationと中間Unified Axis Scoreを`REJECT`する。

## 8. Layer Score Logical Contract

Layer Scoreはlogical identity、Layer、scoreまたはnon-calculated state、input Axis references、eligible/considered Axis summary、Aggregation reference、completeness/quality context、formulaVersion、calculatedAtを持つ。

Canonical OrderをWeight、Importance、Priorityとして利用しない。Axis identityをinput mappingに使用する。

## 9. Overall Score Logical Contract

Overall Scoreはlogical identity、scoreまたはnon-calculated state、Internal Layer Score reference、Visual Layer Score reference、Fusion reference、completeness/quality context、formulaVersion、calculatedAtを持つ。

Exact Fusion Ratioは未決定である。未承認ratio、0.55/0.45、dynamic adjustmentをWire defaultへ埋め込まず、承認済みFusionを解決できない場合はsilent score生成を行わない。

## 10. Score Identity Final Proposal

Root `scoreResultId`を必須logical identityとし、Submetric/Axis/Layer/Overall結果にもunambiguous logical identityを要求する。同一formulaVersionから複数Score Resultを生成できるため、formulaVersionとresult identityを混同しない。

Array indexをidentityとして使うことは`REJECT`する。UUID、root-scoped composite key、embedded child identity等のphysical representationはimplementation detailとしてdeferする。

## 11. Formula Provenance Wire Final Proposal

Score Resultは最低限、次のlineageを保持・伝達可能にする。

- formulaVersion
- axisContractVersion
- observationSchemaVersion
- analysisPipelineVersion
- resolved Profile / Normalization / Aggregation / Fusion references
- input Observation IDs / Submetric Score IDs
- AnalysisJob ID
- Snapshot ID where applicable
- root / child result identities
- completeness / eligibility / coverage references
- required execution engine artifact lineage
- calculatedAt

ScoreからFormula Definition、Profile revisions、Submetric、Observation、Evidenceまで追跡可能にする。Exact field nestingはdeferする。

## 12. AnalysisJob and Snapshot Linkage Final Proposal

`AnalysisScoreResult`は1つのOrganization-scoped AnalysisJobへ所属し、AnalysisJobをruntime ownership/lineage anchorとする。Score ResultはSnapshot確定前にも存在できる。Organization境界、Job ownership、formula assignment、returned lineageをRailsが検証する。

Snapshot作成時にはgeneration-time formulaVersion、Axis/Observation/Pipeline lineage、actual Axis/order、completeness、Score Result referenceを固定保存可能にする。`snapshotSchemaVersion`とformulaVersionを分離し、Current FormulaによるHistorical Snapshotのsilent reinterpretを`REJECT`する。

Partial resultのcommit/promotion/usage treatmentはPD-02D/PD-04へdeferする。

## 13. Historical Reconstruction Final Proposal

次のresolution chainを正式要件Proposalとする。

```text
Historical Score Result
  → formulaVersion
  → immutable Formula Manifest
  → immutable Profile revisions
  → Submetric / Observation inputs
  → Evidence
  → AnalysisJob / Snapshot
```

Published Formula/Profileのsilent mutationを禁止する。Artifact retention期間とphysical archival方式は別Contractだが、unavailable artifactもidentityとreasonを説明可能にする。

## 14. Compatibility Final Proposal

Formula Version差は自動比較可能性を意味しない。既存taxonomyを維持する。

- `COMPATIBLE`
- `PRESENTATION_COMPATIBLE`
- `SEMANTICALLY_INCOMPATIBLE`
- `SCORE_INCOMPARABLE`
- `MIGRATION_REQUIRED`
- `UNSUPPORTED`
- `UNKNOWN`

Explicit compatibility/calibration evidenceがない異Formula Versionは`SCORE_INCOMPARABLE`または`UNKNOWN`として扱い、同じ0–100表示尺度だけから比較可能と推測しない。

## 15. Raw, Normalized, Presentation, Completeness, and Quality Boundary

Raw Observation Value、Normalized Submetric Score、Axis/Layer/Overall Score、Presentation Valueを正式に分離する。Presentation clamp、formatting、display roundingはCanonical Backend Scoreをmutationしない。

Backend Wireは`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`をstatus、reason、coverage contextとして保持・伝達可能にする。0、missing、unknown、N/A、unsupportedを区別する。具体的Score Treatment、renormalization、null ruleはPD-02Dへhandoffする。

Semantic confidence、Observation quality、Crawl coverage、Completeness、Product/content coverageを単一Scoreへ統合しない。v1の`Separate Quality Indicator` Policyを維持する。

## 16. Rails, Worker, BFF, and Frontend Responsibility

Railsの正式Architecture Direction Proposal:

- Formula/Profile Registry ownership and resolution
- Organization authorization and AnalysisJob orchestration
- canonical input/output validation
- Score persistence and Snapshot linkage
- version lineage、compatibility、historical resolution

Python Workerの正式Direction Proposal:

- Rails-resolved immutable Formula Manifestを受領
- Observation/analytical processingとscore calculationを実行
- complete input/output lineage、status、errorを返却

BFFはauthentication/session boundary、Organization-scoped transport/proxy、response contract transportを担当する。Frontendはvalidated Score Result consumption、explanation、visualization、presentation rounding/clampを担当する。Formula Business LogicをBFF/Frontendへ置くことを`REJECT`する。

## 17. Formula Calculation Ownership Final Proposal

| Option | Disposition | Reason |
| --- | --- | --- |
| A: Worker owns Formula | `REJECT` | Registry/version/business authorityがWorkerへ分散する |
| B: Rails owns calculation | `DEFER / NOT SELECTED` | Authorityは明確だがPython分析処理との距離とperformance concernがある |
| C: Worker engine + Rails canonical orchestration/registry/validation | `DECIDE NOW / RECOMMENDED` | analytical capabilityとcanonical authority、再現性、監査性を両立する |

Option Cを正式Architecture Direction Final Proposalとする。RailsがformulaVersionとresolved immutable Manifestを所有・発行し、Workerが計算し、Railsがidentity/lineage/resolutionを検証してcanonical persistする。Runtime topology、queue、transaction、retryはimplementation detailである。

## 18. Backend Wire Root Contract Final Proposal

Logical rootを`AnalysisScoreResult`とする。

```text
AnalysisScoreResult
  identity / status
  organization / project / analysisJob linkage
  conditional snapshot linkage
  formula lineage
  submetricScores
  axisScores
  layerScores
  overallScore
  completeness / eligibility context
  separate quality metadata
  provenance
  calculatedAt
```

Organization/Projectのexact wire placementはdeferするが、Organization-scoped authorizationとJob linkageを失わない。Exact JSON、nesting、required/nullability、endpointはimplementation detailである。

## 19. OpenAPI and DB Handoff Boundary

OpenAPIへtyped Score Result、Formula lineage、score hierarchy、completeness/eligibility/non-calculation、separate quality metadata、provenance references、Job/Snapshot linkage、timestamps、compatibility/unsupported errorをhandoffする。本Phaseではoperation、path、schema、field casingを決定しない。

DBへFormula Definition、Profile Revision、compatibility/calibration/approval、Score Result root、Submetric/Axis/Layer/Overall result、Provenance linkage、immutability、uniqueness、Organization ownershipのPersistence Concernをhandoffする。Table分割、JSON artifact、normalization/denormalization、index/foreign keyはimplementation detailである。

## 20. Calibration and PD-02D Handoff

Exact Weight、Internal/Visual Ratio、Normalization Parameter、Threshold、Business Rounding、Calibration DatasetはPD-02C Closure blockerにしない。後続Validation/Calibrationでnew immutable Profile revision + new formulaVersionとして扱う。

PD-02DへCompleteness semantics、Eligibility Treatment、missing/partial/N/A/unknown/unsupported calculation handlingを正式handoffする。PD-02C Backend Wireは状態を表現する器までを所有し、Treatmentを決めない。

## 21. PD-02C Closure Final Proposal

Closure Option BをFinal Proposalとする。次の4条件がProduct Ownerに承認されればPD-02Cを`DECISION_COMPLETE`とする。

1. Formula Version Contract承認
2. Backend Wire Logical Contract承認
3. Formula Calculation Ownership Option C承認
4. Calibration、Exact Schema/Implementation、PD-02D Treatmentのhandoff承認

Exact Formula Parameter Calibration、Calibration Dataset、Exact Internal/Visual Ratio、Exact non-equal Weight、DB/JSON/OpenAPI schema、Rails/Worker実装をPD-02Cの設計棚卸しClosure条件に含めない。これらは承認済みlogical/version boundaryを実現・検証する後続作業である。

Product Owner承認なしにClosureを確定しないため、現時点のPD-02C statusは`NEEDS_DISCOVERY`を維持する。

## 22. Decision Readiness

| Decision | Readiness | Approval |
| --- | --- | --- |
| Formula Version Contract | `READY_FOR_APPROVAL` | `NOT_APPROVED` |
| Backend Wire Logical Contract | `READY_FOR_APPROVAL` | `NOT_APPROVED` |
| Formula Calculation Ownership Option C | `READY_FOR_APPROVAL` | `NOT_APPROVED` |
| PD-02C Closure Option B | `READY_FOR_APPROVAL` | `NOT_APPROVED` |

Identity、immutability、resolution、hierarchy、provenance、ownership、logical handoff、Closure boundaryに追加Evidence blockerは確認されなかった。Product Ownerが各Proposalを個別に承認・差戻しできる。

## 23. Deferred and Rejected Items

Deferred:

- Exact Submetric / Axis Weight
- Exact Internal / Visual Ratio and Fusion parameter
- Exact Normalization method/parameter、threshold、Business Rounding
- Calibration Dataset construction/evaluation
- Missing/Partial/Eligibility Score Treatment
- Confidence calibration、dynamic fusion、dedup/double-count rule
- Exact JSON/DB/OpenAPI schema and operation
- Rails/Worker/BFF/Frontend implementation

Rejected:

- Published Formula/Profileのsemantic mutation
- Profile revisionを第二Canonical Formula Identityにすること
- Array indexをScore/Axis identityにすること
- Current FormulaによるHistorical Score/Snapshotのsilent reinterpret
- Formula Version差を自動比較可能と推測すること
- Presentation valueをCanonical Scoreとして保存すること
- Unapproved ratio/parameterのsilent production default
- Worker/BFF/FrontendをFormula RegistryのSource of Truthにすること
- BFF/FrontendへFormula Business Logicを置くこと

Implementation detail:

- physical ID形式、field naming/casing/nesting、nullable union
- endpoint/path、pagination、error payload shape
- DB tables、JSON artifact、normalization/denormalization、index/foreign key
- queue、transaction、retry、cache、deployment topology

## 24. Status and Next Phase

PD-41は`COMPLETED / REVIEWED`。4 Decisionは`READY_FOR_APPROVAL / NOT_APPROVED`、Exact Formula Parameters=`NOT_DECIDED`、Implementation=`NOT_IMPLEMENTED`である。PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`を維持する。

次PhaseはProduct Ownerの明示承認が得られた場合のみPD-42 `Formula Version / Backend Wire Contract Explicit Product Owner Approval Record`を推奨する。未承認または一部差戻しの場合は、差戻し対象だけを追加Reviewする。

## 25. Validation and References

Documentation-onlyとしてparent/audit/log同期、status整合、Markdown referenceを確認する。Repo-wide discovery、Source変更、Calibration、Rails/Worker実装、OpenAPI変更、DB migration、full quality gateは行わない。

- [PD-40 Discovery](./98-pd02c-formula-version-backend-wire-contract-discovery.md)
- [PD-39 Parameter Policy Approval](./97-pd02c-formula-profile-parameter-policy-explicit-product-owner-approval-record.md)
- [PD-36 Formula Architecture Approval](./94-pd02c-axis-formula-architecture-explicit-product-owner-approval-record.md)
- [PD-33 Observation Contract Approval](./91-pd02c-observation-output-contract-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Development Log](../DEVELOPMENT_LOG.md)
