# Phase PD-33 — PD-02C Observation Output Contract Explicit Product Owner Approval Record

Date: 2026-08-24  
Decision: PD-02C Observation Output Contract v1  
Status: `DECIDED / APPROVED`  
Contract: `v1 / APPROVED CONTRACT`  
Implementation: `NOT_IMPLEMENTED`

## 1. Approval Evidence

Product Ownerから次の明示承認を受領した。

> PD-02CのObservation Output Contract v1 Proposalを承認する。

Decision OwnerはProduct Owner、Approval Dateは2026-08-24である。承認対象はPhase PD-32でFinal Proposal化したObservation Output Contract v1であり、Formula、JSON Schema、DB/OpenAPI、Worker/Rails実装の承認を意味しない。

## 2. Approved Identity and Core Contract

- `observationId`をimmutableなObservation instance identity、`observationType`をstable definition identityとする。
- Axis、Submetric、Evidence identityを`observationId`へ埋め込まない。
- Coreはidentity、Axis/Submetric mapping、Evidence ID、typed value、measurement mode、layer、scope/source、provenance、completeness、coverage availability、`capturedAt`、version lineageで構成する。
- type/source固有情報はconditionalとし、exact field name、ID format、JSON shapeは後続Technical Contractで決める。

## 3. Approved Value, Measurement, and Layer Contract

- Value Typesは`BOOLEAN / COUNT / NUMBER / RATIO / ENUM / TEXT / SEMANTIC_CLASSIFICATION / STRUCTURED`。
- `STRUCTURED`はbounded type-specific structureに限定し、standalone `LABEL`とarbitrary untyped JSONは採用しない。
- Measurement Modeは`DETERMINISTIC / SEMANTIC`。`HYBRID`は持たず、deterministic Observationとderived semantic Observationへ分割する。
- Layerは`INTERNAL / VISUAL`の別Observationとする。Layer aggregationはObservation Contractの責務外である。

## 4. Approved Provenance, Scope, and Coverage Contract

- Provenance coreはAnalysisJob、source artifact、`capturedAt`、analysis pipeline lineageとする。
- CrawlRun、page/URL、DOM/HTML、screenshot、viewport/bounding box、evidence span、worker/classifier lineageはObservation type/scopeに応じてconditionalとする。
- Scopeは`SITE / PAGE / SECTION / COMPONENT / ELEMENT / LINK_GRAPH / PATH / SCREENSHOT`。
- Coverage availabilityは常に明示し、counts、ratio、page coverageはconditionalとする。unknown denominatorを0として扱わない。

## 5. Approved Completeness and Confidence Contract

- Completenessは`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`。
- 0、missing、unknown、not applicableを区別する。score treatmentはPD-02Dへhandoffする。
- Deterministic Observationのconfidenceは原則不要とする。
- Semantic Observationではconfidence、source、classifier、applicable version、rationaleをconditionalとする。scale、threshold、calibrationは未決定である。

## 6. Approved Multi-Axis, Dedup, and Version Boundary

- 1 Evidenceから複数Observationを生成できるが、各Observationの`axisId / submetricId / semanticAspect`を分離する。
- Evidence reuseは許可し、semantic aspectは分離必須とする。
- Evidence identityとderived traceabilityを保持する。Evidence group、fingerprint、dedup algorithm、Formula double-count preventionは未決定である。
- Required lineageはAxis Contract、Analysis Pipeline、Observation Schemaの3系統とする。
- pre-formula Observationに`formulaVersion`を持たせず、`snapshotSchemaVersion`もObservation schema versionの代用にしない。

## 7. Approved Logical Responsibility Boundary

- Mechanical Crawler / Capture: acquisition、capture、mechanical extraction、provenance。
- Vision / Semantic Analysis: Evidence参照付きderived Observation candidate。
- Python Worker: extraction/analysis executionとObservation candidate output。
- Rails: ownership、validation、persistence、registry、orchestration、version lineage。
- Frontend / BFF: validated Observation / Result consumption。raw ObservationからFormulaを再計算しない。

これはlogical architecture directionの承認であり、service topology、queue、runtime、transaction、retention、Worker/Rails implementationの承認ではない。

## 8. Status Transition and Remaining PD-02C Scope

Observation Output Contractは`REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`から`DECIDED / APPROVED`へ遷移し、`v1 / APPROVED CONTRACT`となった。Implementationは`NOT_IMPLEMENTED`である。

Axis Formulaは`READY_FOR_FORMULA_DISCOVERY`、PD-02CとPD-02 parentは`NEEDS_DISCOVERY`、PD-02Dは`BLOCKED`を維持する。PD-02Cの残項目は次のとおり。

- Exact Axis Formula
- Atomic → Submetric → Axis aggregation
- Internal / Visual contribution
- Formula Version
- Backend Wire / DB / OpenAPI Contract
- Formula provenance

## 9. Deferred Items

Weight、normalization、threshold、rounding、layer ratio、missing/partial scoring、confidence calibration、dedup algorithm、exact JSON、DB schema、OpenAPI、Worker implementation、Rails implementationは本承認の対象外である。

## 10. Validation and References

Documentation-only phaseとして、承認Evidence、Decision Owner、Approval Date、contract status、parent status、deferred boundaryの同期だけを確認した。Source、Rails、OpenAPI変更およびfull quality gate実行は行っていない。

- [PD-32 Decision Review](./90-pd02c-observation-output-contract-decision-review.md)
- [PD-31 Discovery](./89-pd02c-observation-output-contract-discovery.md)
- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [Development Log](../DEVELOPMENT_LOG.md)
