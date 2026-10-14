# Phase PD-32 — PD-02C Observation Output Contract Decision Review

Date: 2026-08-24  
Decision: PD-02C Observation Output Contract v1  
Status: `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`

## 1. Review Scope and Approval Status

PD-31のObservation Output Contract v1 CandidateをProduct / Technical Contractとしてreviewした。Approval Evidenceは`NOT_PROVIDED`であり、本Phaseでは`DECIDED / ACTIVE`へ変更しない。推奨Decision OwnerはProduct Owner + Analysis/Data Owner + Backend/API/Architecture Owner、FrontendはConsultedとする。

Exact Formula、Weight、Normalization、Threshold、Rounding、Layer aggregation、Missing/Partial score treatment、Dedup Algorithm、JSON/DB/OpenAPI schema、Rails/Worker実装は対象外である。

## 2. Review Disposition Summary

| Area | Disposition | Review result |
| --- | --- | --- |
| Instance / Definition Identity separation | `DECIDE NOW` | instance IDとstable typeを分離し、Axis/Submetric/Evidenceを埋め込まない |
| Core logical field groups | `DECIDE NOW` | identity、mapping、typed value、mode、layer、scope、provenance、completeness、coverage availability、lineage |
| Exact JSON field names / schema | `DEFER` | Conceptual Contract承認後のTechnical design |
| Value Type Contract | `DECIDE NOW` | 8 discriminated typesを採用Proposal化 |
| Measurement Mode | `DECIDE NOW` | `DETERMINISTIC / SEMANTIC`のみ。`HYBRID`はv1から`REJECT` |
| Internal / Visual separation | `DECIDE NOW` | Layer別Observation。統合はFormula責務 |
| Conditional provenance | `DECIDE NOW` | Source type/scopeに応じたrequired fieldsを許可 |
| Scope vocabulary | `DECIDE NOW` | 8 scope typesを採用Proposal化 |
| Coverage availability + conditional metrics | `DECIDE NOW` | denominator不明を0にしない |
| Completeness 5 states | `DECIDE NOW` | zero / missing / unknown / N/A / partialを分離 |
| Semantic confidence envelope | `DECIDE NOW` | Semantic時required、threshold/scaleは`DEFER` |
| Multi-Axis shared evidence | `DECIDE NOW` | 1 Evidence → semantic aspect別Observations |
| Dedup-capable references | `DECIDE NOW` | evidence/derived referencesを持つ。Algorithmは`DEFER` |
| Evidence group / fingerprint | `KEEP AS CANDIDATE` | type-/implementation-dependent |
| Observation version lineage | `DECIDE NOW` | Axis Contract / Pipeline / Observation Schema |
| `formulaVersion` on pre-formula Observation | `REJECT` | Score artifact側で保持 |
| `snapshotSchemaVersion` as Observation version | `REJECT` | Snapshot materialization lineageと分離 |
| Worker / Rails responsibility boundary | `DECIDE NOW` | logical ownershipをProposal化。deployment/queueは`DEFER` |

## 3. Observation Identity and Core Field Set

Instance IdentityとDefinition Identityを正式に分離するProposalとする。

- `observationId`: immutable observation instance identity。
- `observationType`: stable Atomic Observation definition/registry identity。
- `axisId`: Canonical Axis identityへのmapping。
- `submetricId`: versioned Submetric definitionへのmapping。
- `semanticAspect`: Multi-Axis reuse時のevaluation meaning。
- `evidenceId`: 原Evidence identity。Observation instanceと混同しない。

`observationId`へAxis/Submetric/Evidence identityをencodeせず、array indexもidentityに使わない。Exact field name、ID format、registry persistenceはApproval後に決める。

Core classification:

| Classification | Logical fields/groups |
| --- | --- |
| `REQUIRED` | observation instance/type、Axis/Submetric/Semantic mapping、evidence reference、typed value、measurement mode、layer、scope、source type、provenance core、completeness、coverage availability、capturedAt、version lineage |
| `CONDITIONAL` | derived-from IDs、crawl run、page URL/ID/type、DOM/HTML/screenshot/bounding-box/evidence-span refs、coverage metrics、semantic confidence/classifier metadata |
| `OPTIONAL` | evidence group/fingerprint、nonessential display/debug metadata |
| `DEFER` | exact property names、JSON structure、DB columns、OpenAPI representation、registry storage |

## 4. Value Type and Measurement Mode Contract

v1 Value Types Proposal:

- `BOOLEAN`: true/false observation。
- `COUNT`: non-negative discrete count。
- `NUMBER`: count/ratioでないnumeric measurement（depth、distance等）。
- `RATIO`: numerator/denominatorを伴うrelative measure。
- `ENUM`: versioned closed vocabulary。
- `TEXT`: free/extracted textまたはnormalized text value。Large raw artifactはreferenceへ分離。
- `SEMANTIC_CLASSIFICATION`: class + semantic confidence/rationale/provenance。
- `STRUCTURED`: link graph/path/relationship/bounding-box等のbounded type-specific structure。arbitrary untyped JSONにはしない。

Standalone `LABEL` typeは`ENUM`または`TEXT`と重複するため`REJECT`。Raw Evidence artifactとFormula input valueを同一`value`へ埋め込まない。

Measurement Modeは`DETERMINISTIC / SEMANTIC`を`DECIDE NOW`。`HYBRID`は監査境界を曖昧にするためv1から`REJECT`し、deterministic Observationと、それを参照するderived semantic Observationへ分解する。

## 5. Internal / Visual Layer and Provenance

Layerは`INTERNAL / VISUAL`を正式Proposalとする。同一CTA等を両Layerで観測した場合、同じEvidence Group候補へ紐づく別Observationとして保持する。Layer間のagreement、fusion、score ratioはFormulaで扱う。

Provenance coreは`analysisJobId`、source artifact identity/reference、`capturedAt`、analysis pipeline lineage。次はObservation type/scopeに応じて`CONDITIONAL`とする。

- `crawlRunId`: crawler-generated observation。
- `pageUrl / pageId / pageType`: PAGE以下またはpage-linked observation。
- DOM selector/node/HTML artifact: Internal DOM/content observation。
- Screenshot artifact/viewport/bounding box: Visual/spatial observation。
- Evidence span: text/semantic classification。
- Worker/classifier/model/rule/prompt lineage: applicable componentで保持。

Organization/Project ownershipを各Observationへ重複格納することは必須にせず、Railsが`analysisJobId`のownershipから検証する候補とする。

## 6. Scope and Coverage / Denominator

v1 Scope Proposal:

- `SITE`: crawl対象site/corpus全体。
- `PAGE`: 単一URL/rendered page。
- `SECTION`: page内semantic/content grouping。
- `COMPONENT`: repeated/shared or classified content block。
- `ELEMENT`: single DOM/visual node。
- `LINK_GRAPH`: nodes/edgesとしてのsite connectivity。
- `PATH`: ordered pages/elements/actions。
- `SCREENSHOT`: captured visual coordinate space。

ArtifactはProvenanceでありScopeへ追加しない。ScopeはFormula denominator/coverage interpretationに必須とする。

CoverageはavailabilityをContractで明示する。`coverageAvailability`相当のlogical statusを`REQUIRED`、observed/eligible/total count、coverage ratio、scanned/expected page countを`CONDITIONAL`とする。Exact enumは`KEEP AS CANDIDATE`。Denominator `UNKNOWN`を0として保存・計算しない。

## 7. Completeness and Confidence

Completenessの5 statesをv1 Proposalとして採用する。

- `PRESENT`: 観測が完了し、値0を含むvalid valueがある。
- `MISSING`: applicable/expectedだがvalue/evidenceがない候補。
- `NOT_APPLICABLE`: rule/context上対象外。
- `UNKNOWN`: applicability/value/coverageを判定できない。
- `PARTIAL`: applicable scopeの一部だけ観測できた。

Formal score treatmentとMISSING/PARTIAL判定ruleはPD-02Dへhandoffする。

Deterministic Observationにconfidenceは原則不要とし、extraction/run qualityはcoverage、completeness、provenanceで表す。Semantic Observationではconfidence、confidence source、classifier type、適用可能なmodel/rule/prompt version、rationaleを`CONDITIONAL REQUIRED`とする。Scale、threshold、calibrationは`DEFER`。

## 8. Multi-Axis Evidence and Deduplication Boundary

1 Evidenceから複数Observationを生成するContractを正式Proposalとする。各Observationは独立した`axisId / submetricId / semanticAspect`を持ち、同じ`evidenceId`を参照する。Evidence reuse=`ALLOWED`、Semantic aspect=`MUST_BE_SEPARATED`を維持する。

Dedup可能なidentity/provenanceとDedup Algorithmを分離する。

- `evidenceId`: `REQUIRED`。
- `derivedFromObservationIds`: semantic/derived resultで`CONDITIONAL`。
- `evidenceGroupId`: Layer/capture/sourceを横断するgroupとして`KEEP AS CANDIDATE`。
- fingerprint/dedup key: implementation候補として`KEEP AS CANDIDATE`。
- merge rule、canonical node resolution、cross-page component handling、Formula double-count prevention: `DEFER`。

## 9. Version Lineage

Observation v1は次を`REQUIRED` Proposalとする。

- `axisContractVersion`: Axis identity/meaning lineage。
- `analysisPipelineVersion`: crawler/extractor/vision/semantic generation lineage。
- `observationSchemaVersion`: envelope、value types、Observation/Submetric registry compatibility。

Worker/classifier/model/rule/prompt versionはapplicable componentで`CONDITIONAL`。`formulaVersion`はpre-formula Observationから`REJECT`し、Axis Score/Formula outputで保持する。`snapshotSchemaVersion`もObservation contract versionとしては`REJECT`し、Snapshot materialization側へ分離する。

## 10. Worker / Rails Responsibility Review

既存Architectureの「Python crawler=mechanical observation、AI=understanding、Rails=business boundary」と整合するlogical responsibility Proposal:

- **Python Crawler / Capture Worker:** crawl、HTML/DOM extraction、link/page metadata、screenshots、deterministic Observation、artifact/provenance出力。
- **Vision / Semantic Analysis Worker candidate:** visual/semantic classificationを元Evidence参照付きで生成。Python crawler本体へAI責務を混ぜる案は`REJECT`し、exact service placementは`DEFER`。
- **Rails / Backend:** Organization/Project/AnalysisJob ownership、canonical validation、registry/version resolution、persistence/immutability、artifact association、orchestration、Formula handoff。
- **Frontend / BFF:** raw Observationを再計算せず、validated Snapshot/Score viewを消費。

Queue、deployment topology、language/runtime、transaction boundary、retention policyは`DEFER`。

## 11. Observation Output Contract v1 Final Proposal

```text
Observation v1
  Identity: instance ID + stable observation type
  Mapping: canonical Axis + versioned Submetric + semantic aspect
  Evidence: source Evidence ID + conditional derived/group references
  Value: discriminated typed value
  Measurement: deterministic or semantic
  Layer: Internal or Visual
  Scope: one of 8 explicit scopes
  Provenance: job + source artifact + capture/pipeline lineage
  Completeness: one of 5 explicit states
  Coverage: availability always explicit; metrics conditional
  Confidence: required only for semantic observations
  Lineage: Axis Contract + Analysis Pipeline + Observation Schema
```

Formula Discoveryへidentity、typed value、mapping、mode、layer、scope、completeness、coverage/confidence availability、provenance、version lineageをhandoffする。

## 12. Readiness, Deferred Items, and References

Observation Output Contract final readinessは`READY_FOR_APPROVAL / NOT_APPROVED`。Approval Evidenceがないため`DECIDED / ACTIVE`へ変更しない。Axis Formula overallは`READY_FOR_FORMULA_DISCOVERY`、PD-02C / PD-02 parentは`NEEDS_DISCOVERY`、PD-02Dは`BLOCKED`を維持する。

Deferred: exact Formula/Weight/Normalization/Threshold/Rounding/Layer ratio、Missing/Partial treatment、confidence scale/threshold、Dedup Algorithm、registry implementation、exact JSON/DB/OpenAPI schema、Worker/Rails implementation/topology、retention。

References:

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-31 Discovery](./89-pd02c-observation-output-contract-discovery.md)
- [PD-30 Calibration](./88-pd02c-differentiation-decision-support-evidence-calibration.md)
- [PD-29 Axis/Submetric Workshop](./87-pd02c-axis-formula-submetric-evidence-workshop.md)
- [Development Log](../DEVELOPMENT_LOG.md)
