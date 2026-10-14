# Phase PD-40 — PD-02C Formula Version / Backend Wire Contract Discovery

Date: 2026-08-24  
Decision: PD-02C Formula Version / Backend Wire Logical Contract  
Formula Version Status: `DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`  
Backend Wire Status: `DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`  
Exact Formula Parameters: `NOT_DECIDED`  
Implementation: `NOT_IMPLEMENTED`

## 1. Scope and Current Backend Boundary

承認済みObservation Contract、Formula Architecture、Parameter PolicyをBackendで識別・保存・交換・再現するlogical contractを整理した。Exact JSON/DB/OpenAPI、Migration、Rails/Worker/BFF実装、Calibration、Exact Formula Parameterは対象外である。

現行OpenAPIの`AnalysisSnapshot.payload`は`additionalProperties: true`のuntyped aggregateで、`version`はformula lineageを表さない。`AnalysisJob`はOrganization/Project、status/phase、`committed_snapshot_id`等を持つがformula/score lineageを持たない。RailsはUser/Organization/Membership基盤のみで、Project、AnalysisJob、Snapshot、Formula Registry、Score persistenceは`NOT_IMPLEMENTED`である。

## 2. Formula Identity Findings

Published `formulaVersion`をCanonical Formula Identityとする既存Policyを具体化し、immutable positive integerを第一候補とする。SemVer/date/hashをprimary identityにせず、human label/fingerprintはmetadataに限定する。

Lifecycle candidateは`DRAFT → ACTIVE → DEPRECATED → RETIRED`。Published ACTIVE/DEPRECATED/RETIRED definitionはimmutableで、DRAFTのpublish transition時にpositive integer identityを発行する候補とする。`effectiveFrom`、approvedAt/approvedBy role、supersedes、compatibility、fingerprintはlogical metadata候補である。

第二のCanonical Formula Identityは作らない。Profile revision、architecture reference、engine/pipeline versionはformulaVersionが解決または参照するlineageであり、historical score comparisonのprimary identityではない。

## 3. Formula Version Resolution

formulaVersionから次を一意に解決可能にするlogical manifestをCandidateとする。

- Formula Architecture revision/reference
- `axisContractVersion`
- Axis-specific immutable Profile revisions
- Submetric set/revisions
- Normalization method/parameter references
- Aggregation and Weight profile references
- Internal/Visual Layer aggregation and Fusion profile references
- Applicability/Eligibility rule references
- Calibration lineage where applicable
- compatible Observation Schema / Analysis Pipeline constraints
- Lifecycle、approval/effective、supersedes/compatibility metadata

Exact parameterが未決定のFormula DefinitionはDRAFT/UNCALIBRATED等のnon-production statusを明示し、ACTIVE production Formulaとしてsilent resolveしない。

## 4. Formula Registry Logical Contract

Logical `FormulaDefinition` candidate:

- `formulaVersion`: canonical immutable identity
- lifecycle/status and calibration/approval status
- Formula Architecture reference
- `axisContractVersion`
- Observation Schema compatibility
- Analysis Pipeline compatibility/execution lineage requirement
- Axis/Profile revision references
- Layer aggregation/Fusion reference
- Formula provenance/parameter rationale metadata
- approval/effective metadata
- supersedes and compatibility declarations
- optional immutable fingerprint

Formula RegistryはRails Business Backendがcanonical ownership、validation、resolution、authorization、immutability、historical accessを担う候補とする。Exact storage/schemaは未決定である。

## 5. Profile Registry Logical Contract

Axis-specific Profile revision candidate:

- profile identity + immutable revision
- lifecycle/status
- `axisId` and Layer/context scope
- Submetric definition references
- Normalization and Aggregation references
- Weight configuration references
- Applicability/Eligibility references
- Calibration lineage and limitations
- approval/effective metadata
- supersedes/compatibility metadata

Profile revisionはsubordinate resolution identityであり、formulaVersionが使用revisionを固定する。Profile revision単独をHistorical Comparisonの第二Source of Truthにしない。

## 6. Score Output Hierarchy and Value Boundary

```text
Raw Atomic Observation Value
  → Normalized Submetric Score
  → Internal Axis Score / Visual Axis Score
  → Internal Layer Score / Visual Layer Score
  → Overall Score
  → Presentation Value / Label
```

- Raw value: Observation Contractに属し、source/evidence lineageを保持。
- Normalized value: Formula Profileにより生成されたcanonical Submetric score。
- Derived score: Axis/Layer/Overallのcanonical calculated result。
- Presentation value: UI rounding/clamp/format/label。Canonical Scoreをmutationしない。

Internal/VisualはAxisまで別系統で保持し、Unified Axis Scoreを途中生成しない。Canonical numeric resultはreconstructionに必要なprecisionを保持し、presentation-only valueをcanonical fieldへ上書きしない。

## 7. Submetric Score Logical Contract

Required candidate:

- logical Submetric Score identity
- `submetricId`、`axisId`、Layer
- normalized score or explicit non-calculated state
- Formula/Profile/Normalization/Aggregation references
- input Observation IDs
- completeness/eligibility context
- `formulaVersion`
- `calculatedAt`

Conditional candidate:

- raw input/value summary reference
- coverage metadata
- exclusion/unsupported/partial reason
- semantic quality/provenance references

Raw Observation artifactをSubmetric resultへ無制限duplicateせず、explicit IDs/referencesで辿る。Exact nullable/result union、enum、field nameはPD-02D/OpenAPIへdeferする。

## 8. Axis Score Logical Contract

- logical Axis Score identity
- Canonical `axisId`
- Layer=`INTERNAL / VISUAL`
- canonical score or explicit non-calculated state
- input Submetric Score identities
- eligible/considered Submetric summary
- completeness and coverage summary
- resolved Axis Profile reference
- `formulaVersion`
- `calculatedAt`

Array positionをAxis identityにせず、Internal/Visual Axis Scoreを分離する。`eligibleSubmetricCount`はexplainability summary candidateで、score treatmentはPD-02Dへdeferする。

## 9. Layer Score Logical Contract

- logical Layer Score identity
- Layer=`INTERNAL / VISUAL`
- canonical score or non-calculated state
- input Axis Score identities / Canonical Axis IDs
- eligible/considered Axis summary
- Layer aggregation reference
- completeness/coverage summary
- `formulaVersion`
- `calculatedAt`

Canonical OrderをWeightに使わない。Inputはarray positionでなくAxis identityにより対応付ける。

## 10. Overall Score Logical Contract

- logical Overall Score identity
- canonical score or non-calculated state
- Internal Layer Score identity/reference
- Visual Layer Score identity/reference
- resolved Fusion profile/reference
- separate completeness/quality context
- `formulaVersion`
- `calculatedAt`

Exact Internal/Visual ratioをWire defaultへ埋め込まない。Unapproved Fusion ProfileならOverallをsilent計算せずunsupported/uncalibrated stateを表現可能にする。

## 11. Score Identity Findings

Root `scoreResultId`はAnalysisJob単位のcalculation result identityとして`REQUIRED CANDIDATE`。Submetric/Axis/Layer/Overall resultもprovenance inputとして参照できるlogical identityが必要である。

Exact physical representationは個別UUID、root-scoped composite key、typed resource IDのいずれも候補であり未決定。ただしarray indexはidentityにしない。Child recordを独立persist/referenceする場合はstable child ID、embedded immutable bundleの場合は`scoreResultId + result kind + Canonical ID + Layer`相当のunambiguous identityを要求する。

Score instance identityと`formulaVersion`を混同しない。同一Formulaで複数Score Resultを生成できる。

## 12. Formula Provenance Wire

Minimum candidate:

- `formulaVersion`
- `axisContractVersion`
- `observationSchemaVersion`
- `analysisPipelineVersion`
- resolved Profile/Normalization/Aggregation/Fusion references
- input Observation IDs and Submetric Score IDs
- AnalysisJob ID
- conditional Snapshot ID/linkage
- Score Result/child result identities
- completeness/eligibility/coverage references
- execution/calculation engine artifact lineage when required
- `calculatedAt`

このlineageによりScore→Formula Definition→Profile revisions→Submetric→Observation→Evidenceを辿る。Formula semanticsはformulaVersion、execution behaviorはPipeline/engine lineageとして分離する。

## 13. AnalysisJob Linkage

AnalysisScoreResultは必ず1つのOrganization-scoped AnalysisJobへ属する候補とする。Organization/Project ownershipはAnalysisJobからvalidation可能だが、cross-tenant lookupを防ぐためRails canonical boundaryで確認する。

Score Resultは`analysisJobId`、Pipeline version、formulaVersion、calculatedAt、calculation statusを保持する。`partially_completed`でも生成済みsection/result lineageを保持し、欠損・commit可否・promotion・score treatmentはPD-02D/PD-04へ委譲する。

Score ResultはSnapshot commit前にも存在し得る。AnalysisJobの`committed_snapshot_id`とScore Resultのconditional Snapshot linkageを整合検証する。

## 14. Snapshot Linkage

Committed Snapshotは少なくともformulaVersion、axisContractVersion、observationSchemaVersion、analysisPipelineVersion、actual Axis IDs/order lineage、completeness/present/missing Axis context、Score Result referenceをgeneration-time lineageとして保持する候補とする。

Snapshotの現行integer `version`はFormula Versionではない。Snapshot Schema Version/record versionとformulaVersionを分離する。SnapshotはCurrent Formulaでsilent再計算・再解釈せず、生成時Formula/Profile lineageを参照する。

## 15. Historical Reconstruction

Required resolution path:

```text
Historical Score Result
  → formulaVersion
  → immutable Formula Definition
  → immutable Profile revisions
  → Submetric Score / Observation lineage
  → Evidence artifacts/references
```

RailsはDeprecated/Retired registry metadata、Profile revisions、compatibility declarations、Score/Observation lineageをhistorical access可能に保つ候補とする。Artifact retention policyは別Contractだが、削除後もunavailable reason/identityを説明可能にする必要がある。

## 16. Compatibility Findings

Existing taxonomyを維持する。

- `COMPATIBLE`: explicit declared semantic/calibration compatibilityがある。
- `PRESENTATION_COMPATIBLE`: Formula resultは同じで表示だけが異なる。
- `SEMANTICALLY_INCOMPATIBLE`: Axis meaning/profile semanticsが異なる。
- `SCORE_INCOMPARABLE`: Formula/parameter/calibration差で直接比較できない。
- `MIGRATION_REQUIRED`: schema/identity/profile mappingが必要。
- `UNSUPPORTED`: runtime/registryが解決不能。
- `UNKNOWN`: lineage/compatibility evidence不足。

Formula Version差を自動的にcompatibleとしない。明示compatibility/calibration contractがなければ`SCORE_INCOMPARABLE`または`UNKNOWN`をdefault candidateとする。同じ0–100 scaleだけでは比較可能性を証明しない。

## 17. Completeness / Eligibility and Quality Wire

Score階層でObservation Contractの`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`をsummary/contextとして引き継げる必要がある。Logical candidatesはcompleteness status、eligibility status/reference、exclusion/non-calculation reason、partial/coverage metadata、present/missing input IDsである。

Exact enum、aggregation treatment、null/zero、partial renormalizationはPD-02Dへdeferする。Wireは0、missing、unknown、N/A、unsupportedを区別可能にする。

ConfidenceはSeparate Quality Indicator、Observation/Crawl CoverageはQuality/Completeness Metadataとしてnumeric Scoreから分離する。Root/child resultはquality reference/summaryを持てるが、ConfidenceをScore fieldへfoldしない。

## 18. Rails and Worker Responsibility

Rails Business Backend candidate responsibilities:

- Formula/Profile Registry canonical ownership and lifecycle
- Formula/Profile assignment and immutable resolution
- Organization/Project/AnalysisJob authorization/ownership
- Worker request manifest/reference issuance
- returned Score/lineage validation
- canonical Score persistence and Snapshot linkage
- compatibility/historical resolution/audit

Python Worker candidate responsibilities:

- Railsからapproved/resolved Formula manifest/referenceを受け取る
- Observation processing and analytical calculation execution
- Submetric/Axis/Layer/Overall candidate result generation
- input/result/provenance lineageを返す
- deterministic execution/error/partial statusを報告する

WorkerをFormula RegistryのCanonical Source of Truthにせず、Railsと独立したsilent parameter defaultを持たせない。

## 19. Formula Calculation Ownership Options

| Option | Strengths | Weaknesses |
| --- | --- | --- |
| A: Worker calculates | Python analysis/statistics、batch performanceに適合 | registry/version drift、business ownership/validation coupling |
| B: Rails calculates | canonical transaction/ownershipが単純 | analytical capability、performance、Python observation proximityが弱い |
| C: Worker engine + Rails orchestration/validation/registry | analyticsとbusiness authorityを分離、reproducibility/auditに強い | manifest protocol、dual-runtime validation、deployment coordinationが必要 |

RecommendationはOption C。formulaVersionとresolved immutable manifestをRailsが発行/所有し、Workerが計算、Railsがresult identity/lineage/profile resolutionを検証してcanonical persistする。Calculation engine buildはPipeline/execution lineageへ記録し、Formula Identityにしない。

## 20. BFF and Frontend Responsibility

BFFはauthenticated/Organization-scoped proxy、canonical error mapping、presentation-safe transportを担当する。Formula Registry/Score calculation/parameter fallbackを所有しない。

Frontendはvalidated Score Result消費、display mapping、presentation rounding/clamp、explanation UIを担当する。Raw ObservationからBusiness Formulaを再計算せず、presentation valueをcanonical scoreとして送信・保存しない。

## 21. Backend Wire Candidate

Logical root candidate:

```text
AnalysisScoreResult
  identity / result status
  organization/project ownership context
  analysisJobId
  conditional snapshot linkage
  formula lineage
  submetricScores[]
  axisScores[]
  layerScores[]
  overallScore
  completeness context
  separate quality metadata
  calculatedAt
```

Organization/Projectはwire上で明示またはAnalysisJobからcanonical解決する候補。Exact nesting、required/nullability、pagination、resource endpointはOpenAPI Decisionへdeferする。

## 22. OpenAPI and DB Handoff

OpenAPI handoff:

- Organization-scoped resource identity and authorization boundary
- `formulaVersion` and typed formula lineage
- typed Submetric/Axis/Layer/Overall score structures
- raw/normalized/derived/presentation separation
- completeness/eligibility/non-calculation representation
- separate quality metadata and provenance references
- AnalysisJob/Snapshot linkage and timestamps
- compatibility/unsupported errors

DB handoff candidates:

- Formula Definition and Formula/Profile Registry revisions
- Formula compatibility/calibration/approval records
- Analysis Score Result root
- Submetric, Axis, Layer, Overall result persistence or immutable result artifact
- Observation/Evidence/AnalysisJob/Snapshot provenance links
- immutable lifecycle/uniqueness/Organization ownership concerns

Normalization vs immutable JSON artifact/denormalized projectionsは未決定。Exact table/column/index/foreign key/API schemaは後続設計へdeferする。

## 23. Calibration and PD-02D Boundary

Calibration Dataset、Evaluation、Exact Weight/Fusion ratioは本Contractで決めない。後続Calibration Phaseがnew immutable Profile revision + new formulaVersionを発行し、existing historical resultsをmutationしないresolution structureを要求する。

PD-02Dへcompleteness、eligibility、partial/missing/N/A/unknown/unsupported statesとreason/coverage hooksをhandoffする。Backend Wireはこれらを表現可能にするが、Score Treatmentは決めない。

## 24. PD-02C Closure Assessment

Option Bを`RECOMMENDED FOR DECISION REVIEW`とする。コンポーネント/Contract棚卸しとしては、Architecture、Parameter Policy、Formula Version、Backend Wire logical contractまでを承認すればPD-02CをDecision-completeにでき、Exact Calibrationは実データを使う後続Validation/Calibration Phaseへhandoff可能である。

Rationale:

- Exact parameterは代表DatasetなしにProduct Decisionできない。
- Policyはuncalibrated baselineとproduction-calibrated Formulaを既に分離している。
- logical Wireがversioned calibrated revisionを後から発行できる。
- Exact DB/OpenAPI/Rails implementationをProduct discovery closure条件にすると責務が混在する。

ただし現時点ではFormula Version/Backend WireがDiscoveryのみで未承認のためPD-02Cをcompleteにしない。Closure criteria candidateは(1) Formula Version Contract approval、(2) Backend Wire Logical Contract approval、(3) PD-02D handoff明記、(4) Calibration/Exact Schema/Implementation handoff明記である。

## 25. Readiness and Next Review

Formula Version Contract=`DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`。Backend Wire Logical Contract=`DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`。Identity、resolution、registry、score hierarchy、lineage、ownership、handoff、closure optionを比較可能なためである。

Exact Formula Parameters=`NOT_DECIDED`、Implementation=`NOT_IMPLEMENTED`。PD-02CとPD-02 parentは`NEEDS_DISCOVERY`、PD-02Dは`BLOCKED`を維持する。次はPD-41候補としてFormula Version / Backend Wire Contract Decision Reviewを推奨する。

## 26. References

- [PD-39 Parameter Policy Approval](./97-pd02c-formula-profile-parameter-policy-explicit-product-owner-approval-record.md)
- [PD-36 Formula Architecture Approval](./94-pd02c-axis-formula-architecture-explicit-product-owner-approval-record.md)
- [PD-33 Observation Contract Approval](./91-pd02c-observation-output-contract-explicit-product-owner-approval-record.md)
- [PD-28 Formula/Backend Discovery](./86-pd02c-score-formula-backend-contract-discovery.md)
- [AnalysisJob Runtime Mapping](./40-analysis-job-runtime-mapping.md)
- [OpenAPI Draft](../api/openapi-draft.yaml)
- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Development Log](../DEVELOPMENT_LOG.md)
