# Phase PD-36 — PD-02C Axis Formula Architecture Explicit Product Owner Approval Record

Date: 2026-08-24  
Decision: PD-02C Axis Formula Architecture  
Status: `DECIDED / APPROVED`  
Architecture: `CANDIDATE C / APPROVED ARCHITECTURE`  
Implementation: `NOT_IMPLEMENTED`  
Exact Formula Parameters: `NOT_DECIDED`

## 1. Approval Evidence

Product Ownerから2026-08-24に次の明示承認を受領した。

> PD-02CのAxis Formula Architecture Proposal（Candidate C）を承認する。

Decision OwnerはProduct Ownerである。承認対象はPD-35 Final ProposalのArchitecture原則であり、Exact Weight、ratio、normalization parameter、threshold、Missing/Partial処理、Backend schema、実装を含まない。

## 2. Approved Architecture

Candidate C `Layer-first Common Core + Axis-specific Versioned Profiles`を正式Architectureとして承認する。

```text
Atomic Observation
  → Normalized Submetric
  → Layer-specific Axis Score
  → Internal / Visual Layer Score
  → Overall Score Late Fusion
```

Internal/VisualはObservation、Submetric、Axis Scoreまで別系統で保持し、Layer Score生成後にOverallへlate fusionする。

## 3. Approved Common Core

- Observation eligibility hook
- typed Observation handling envelope
- normalization frameworkとSubmetric boundary
- Submetric aggregation framework
- Axis aggregation framework
- Internal/Visual Layer preservation
- Formula provenance
- version references
- explainability and historical reconstruction requirements

Axis固有Submetric、normalization method、weight、parameter、applicability ruleはCommon Coreへ固定埋め込みしない。

## 4. Approved Axis-specific Profile Boundary

Axisごとの差異はversioned Formula Profileとして管理する。Profile責務候補はSubmetric set、normalization method、aggregation method、weight configuration、applicability rule referencesである。Exact valuesは未決定である。

Axis DefinitionはProduct semantics、Formula Profileはscore projection configurationであり、別Contractを維持する。score semanticsを変えるProfile revisionはFormula Version lineageへ含める。

## 5. Approved Atomic → Submetric and Submetric → Axis Direction

Typed Observationをprofile-defined normalizationで共通Score ScaleのSubmetricへ変換するArchitectureを承認する。Binary ratio、denominator-aware count/ratio、coverage、capped linear、robust normalization、semantic class mappingは候補方式であり、Exact method/parameterは未決定である。

Submetric→AxisはEligibility-aware Aggregation Architectureとする。Candidate AのLayer-first Equal / Eligibility-aware BaselineはCandidate C内のdefault/fallback/initial calibration profile候補として保持し、将来のversioned weighted profileを許容する。State別score treatmentとExact Weightは未決定である。

## 6. Approved Layer Score and Overall Direction

Internal/Visualそれぞれについて6 AxisからLayer Scoreを生成する。Eligible-axis meanはinitial baseline candidate、versioned weighted layer profileはfuture candidateとして保持する。Canonical OrderはWeight、Importance、Priorityを意味しない。

Internal Layer ScoreとVisual Layer Scoreを最後にOverall Scoreへ統合するlate-fusion Architectureを承認する。Exact ratio、dynamic weighting、confidence/completeness adjustmentは未決定で、0.55 Internal / 0.45 Visualは`UNAPPROVED CANDIDATE`を維持する。

## 7. Approved Confidence and Coverage Boundary

v1ではConfidenceをScoreから分離した`Separate Quality Indicator`とする。Eligibility Gate、Weight Modifier、confidence threshold、calibration methodはdeferする。

Product/Content Coverageがqualityを直接測る場合はSubmetric componentになり得る。一方、Observation/Crawl Coverageはcollection quality/completenessであり、Quality MetadataまたはEligibility情報として扱う。両者を混同しない。

## 8. Approved Semantic / Deterministic and Multi-Axis Rule

`DETERMINISTIC / SEMANTIC` Observationを分離し、deterministic inputを参照するDerived Semantic Observationを許可する。HYBRID ObservationとLLM-only Axis Scoreはv1で不採用とする。

Evidence reuse=`ALLOWED`、semantic aspect=`MUST_BE_SEPARATED`を維持する。複数Axis利用に必要なEvidence/derived lineageを保持するが、contribution cap、Dedup Algorithm、double-count prevention ruleは未決定である。

## 9. Approved Explainability and Formula Provenance Principle

Axis ScoreからSubmetric、Observation、Evidenceへ追跡でき、Internal/Visual Layer contribution、Formula/Axis/Profile references、completeness、coverage、Missing/Partial reason、generation-time lineageを再現可能にする。

Formula provenance Architectureは次を保持可能にする。

- `formulaVersion`
- `axisContractVersion`
- `observationSchemaVersion`
- `analysisPipelineVersion`
- Axis/Profile references
- normalization/aggregation profile references
- input Observation IDs / Submetric IDs
- completeness / coverage context
- output identity
- AnalysisJob / Snapshot linkage
- `calculatedAt`

Exact schema、field name、wire representationは未決定である。

## 10. Approved Formula Version Boundary

Weight、Normalization、Aggregation、Eligibility、Confidence handling、score-level threshold、business rounding、Layer fusion、Axis/Profile behaviorのsemantic changeをFormula Version変更対象とする。

CSS、display-only formatting、layout、presentation clampはFormula Version対象外とする。Axis meaningとpersisted schemaのversion lineageはFormula Versionから分離する。

## 11. Candidate Disposition

- Candidate C: `APPROVED ARCHITECTURE`。
- Candidate A: `KEEP AS PROFILE CANDIDATE`。Candidate C内のdefault/fallback/initial calibration用途。
- Candidate B: `REJECTED FOR V1`。Layer lineage、explainability、auditability、Observation Contract整合が弱い。

## 12. Status Transition and Deferred Scope

Axis Formula Architectureは`REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`から`DECIDED / APPROVED`へ遷移した。Implementationは`NOT_IMPLEMENTED`、Exact Formula Parametersは`NOT_DECIDED`である。

Deferred:

- Exact Submetric / Axis Weight
- Exact Internal / Visual ratio
- Exact normalization method/parameter
- Exact threshold / rounding constant
- Missing / Partial score treatment
- confidence calibration/gate/modifier
- Dedup Algorithm / double-count cap
- DB Schema / JSON Schema / OpenAPI
- Rails / Python Worker implementation

## 13. PD-02C Status and Remaining Work

PD-02CとPD-02 parentは`NEEDS_DISCOVERY`、PD-02Dは既存の`BLOCKED`を維持する。Architecture承認だけでPD-02Cをcompleteにしない。

Remaining PD-02C:

- Formula parameter / profile policy
- Exact normalization behavior
- Internal / Visual fusion profile
- Formula Version concrete contract
- Backend Wire / DB / OpenAPI Contract
- Formula provenance wire representation

## 14. Validation and References

Approval-only / Documentation-onlyとして、Approval Evidence、Decision Owner、Approval Date、status transition、candidate disposition、parent/audit/log referencesを確認した。Source、Rails、Worker、OpenAPI変更およびfull quality gate実行は行っていない。

- [PD-35 Architecture Decision Review](./93-pd02c-axis-formula-architecture-decision-review.md)
- [PD-34 Formula Candidate Discovery](./92-pd02c-axis-formula-candidate-discovery.md)
- [PD-33 Observation Contract Approval](./91-pd02c-observation-output-contract-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Development Log](../DEVELOPMENT_LOG.md)
