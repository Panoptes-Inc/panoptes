# Phase PD-31 — PD-02C Observation Output Contract Discovery

Date: 2026-08-24  
Decision: PD-02C Observation Output Contract  
Status: `DISCOVERY_COMPLETE / READY_FOR_DECISION`

## 1. Scope

Crawler / Browser / AnalysisからAtomic Observation、Submetric Input、Axis Formulaへ渡すObservation Output Contract候補を整理した。Formula、Weight、Threshold、Eligibility、Missing/Partial処理、JSON Schema、DB/API field、Worker/Rails実装は決定・変更していない。

## 2. Existing Observation Output State

| Source | Classification | Current state |
| --- | --- | --- |
| Master / MVP specifications | `DOCUMENTED_CANDIDATE` | Internal/Visual dual layerとObservation Bundle（site info、pages、internal/visual observations、flow summary）を要求 |
| Archived Crawler Specification | `LEGACY / DOCUMENTED_CANDIDATE` | PageSnapshot、DOM metadata、CTA/link/pricing/FAQ/compare、screenshots、flow/diff summary候補 |
| Frontend mock Snapshot factory | `MOCK` | Observationを経ずにscore/text/result Snapshotを直接生成 |
| Dummy/preview data | `FIXTURE / PREVIEW` | UI表示値とexamples。Observation provenanceなし |
| Frontend Snapshot type | `PARTIAL_PRODUCTION` | result payloadを利用するがatomic observation、axis/submetric mapping、coverage、lineageなし |
| OpenAPI Snapshot payload | `PARTIAL_PRODUCTION` | `payload`はuntyped aggregate object。Observation schemaなし |
| Rails / Python Worker | `UNKNOWN / NOT_IMPLEMENTED` | canonical Observation model、validator、persistence、crawler/worker実装なし |

Existing stateは`DOCUMENTED_CANDIDATE + MOCK / NOT_IMPLEMENTED_CANONICAL_CONTRACT`。Observationの存在、仕様案、canonical contractを混同しない。

## 3. Atomic Observation Identity

Identityは2段階必要である。

- **Instance identity:** `observationId`候補。AnalysisJob/CrawlRun内で生成されたimmutable observation instanceを識別する。
- **Definition identity:** `observationType`候補。`cta.destination.validity`等のstable registry keyとしてAtomic Observationの意味を識別する。`atomicObservationId`を別途持つより、このregistry identityへ統合する候補を優先するがNaming Standardは未決定。

Formula mappingには`canonicalAxisId`、versioned `submetricId`、`semanticAspect`が必要である。同一原Evidenceを追跡する`evidenceId`と、derived semantic resultを元Observationへ結ぶ`derivedFromObservationIds`も必要候補とする。

## 4. Core Field Candidates

| Field candidate | Necessity | Reason |
| --- | --- | --- |
| `observationId` | `REQUIRED` | instance lineage、reference、dedup |
| `observationType` | `REQUIRED` | stable Atomic Observation definition |
| `canonicalAxisId` | `REQUIRED` | positional mappingを避ける |
| `submetricId` | `REQUIRED` | Formula input identity。正式registryは未決定 |
| `semanticAspect` | `REQUIRED` | Multi-Axis reuse時の意味分離 |
| `evidenceId` / evidence references | `REQUIRED` | 原Evidence追跡とreuse |
| `value` + `valueType` | `REQUIRED` | discriminated value representation |
| `measurementMode` | `REQUIRED` | deterministic / semantic / hybridを分離 |
| `layer` | `REQUIRED` | Internal / Visualを保持 |
| `scope` | `REQUIRED` | denominatorの母集団を明示 |
| `sourceType` | `REQUIRED` | crawler/browser/vision/classifier等を識別 |
| `completeness` | `REQUIRED` | zero、unobserved、N/Aを分離 |
| `capturedAt` | `REQUIRED` | temporal provenance |
| `analysisPipelineVersion` | `REQUIRED` | generation lineage |
| `axisContractVersion` | `REQUIRED` | Axis meaning lineage |
| `observationSchemaVersion` | `REQUIRED` | envelope/type registry lineage candidate |
| `pageUrl` / `pageType` | `RECOMMENDED / CONDITIONAL` | PAGE以下のscopeでは必要、SITE/LINK_GRAPHでは必須でない |
| coverage/denominator fields | `RECOMMENDED / CONDITIONAL` | count/ratio/site/path/semantic coverageで必要 |
| confidence/classifier fields | `RECOMMENDED / CONDITIONAL` | semantic/hybridでは必要、deterministicでは不要候補 |
| DOM/artifact/screenshot/bounding-box refs | `OPTIONAL / TYPE_CONDITIONAL` | source/layerに応じて必要 |
| `formulaVersion` | `NOT_NEEDED` | pre-formula observationには適用しない。Score artifact側で保持 |

## 5. Value Representation and Layer

`valueType`はdiscriminated union候補とする。

- `BOOLEAN`: FAQ/pricing/comparison presence。
- `COUNT`: CTA、heading violation、evidence category count。scope必須。
- `RATIO`: valid/eligible等。numerator/denominatorとcoverageが必要。
- `ENUM`: Pricing Case A/B/C、claim/context classification候補。registry/versionが必要。
- `TEXT / LABEL`: detected claim/evidence label。原文はartifact/evidence spanへ分離する候補。
- `SEMANTIC_CLASSIFICATION`: semantic label + confidence/rationale。Formula scoreと混同しない。
- `STRUCTURED`: link graph/path、bounding box、relationship metadata。type-specific schemaが必要。

InternalはHTML/DOM/link/heading/structured content/metadata、Visualはscreenshot/spatial hierarchy/prominence/groupingを所有する。同一CTAを両Layerで観測した場合、同じ`evidenceId`またはevidence groupへ紐づく別Observation instanceとして保持し、Layerを潰さない。Cross-layer aggregationはFormula側へ送る。

## 6. Provenance and Scope

Provenanceの最低核はAnalysisJob/CrawlRun、source artifact、URL/page identity、capture time、pipeline/worker lineageである。DOM observationはselector/node/content-hash/HTML artifact、Visual observationはscreenshot artifact/viewport/bounding box、semantic observationはevidence spans/derived-from IDs/classifier lineageをtype-conditionalに保持する。

Scope vocabulary候補は`SITE`、`PAGE`、`SECTION`、`COMPONENT`、`ELEMENT`、`LINK_GRAPH`、`PATH`、`SCREENSHOT`。CTA countはPAGE、link connectivityはSITE/LINK_GRAPH、path continuityはPATH、visual prominenceはSCREENSHOT/ELEMENTを候補とする。Scopeはvalueとdenominatorを解釈する必須contextである。

## 7. Coverage, Completeness, and Confidence

Coverage候補は`observedCount`、`eligibleCount`、`totalCount`、`coverageRatio`、`scannedPageCount`、`expectedPageCount`。RATIOはnumerator/denominator、SITE/PATH/LINK_GRAPH集計はcrawl boundary、semantic classificationはevaluated/eligible evidence coverageを必要候補とする。Expected count不明を0にしない。

Completenessは`PRESENT / MISSING / NOT_APPLICABLE / UNKNOWN / PARTIAL`候補を必須とする。`COUNT=0 + PRESENT`は「観測した結果0件」、`MISSING/UNKNOWN`は観測不能または判定不能、`NOT_APPLICABLE`は対象外である。Reason、Applicability、coverage detailsは推奨候補。Score処理はPD-02Dで決める。

Deterministic observationにconfidenceは原則`NOT_NEEDED`候補で、抽出成功/coverage/completenessを使う。Semantic/Hybridではconfidence、confidence source、classifier type、rule/prompt/model version、rationaleを`REQUIRED_WHEN_SEMANTIC`候補とする。Thresholdとconfidence scaleの正式契約は未決定。

## 8. Multi-Axis Evidence and Deduplication

同一原Evidenceは1つの`evidenceId`を持ち、Axis/Submetric/Semantic Aspectごとに別Observationを生成する。Evidence reuse=`ALLOWED`、Semantic aspect=`MUST_BE_SEPARATED`をContract上で追跡する。

同一CTAがDOM、Screenshot、LLMで扱われる場合:

- DOMとVisualは同じevidence groupに属するLayer別Observation。
- LLM resultは新しいraw evidenceではなく`derivedFromObservationIds`で元Observationへ紐づくsemantic Observation。
- `evidenceFingerprint` / `dedupKey`候補で同一run内の重複候補を識別する。
- Cross-page repeated component、redirect/canonical URL、content duplicateの正式Dedup Algorithmは決めない。

Formula double counting、contribution cap、supporting evidence weightは本Contract Discoveryの対象外である。

## 9. Version Lineage

- `axisContractVersion`: `REQUIRED`。Axis identity/meaning/order lineage。
- `analysisPipelineVersion`: `REQUIRED`。crawler/extractor/vision/semantic generation lineage。
- `observationSchemaVersion`: `REQUIRED`候補。Envelope、value types、Observation/Submetric registry compatibility。
- Worker/classifier/model/prompt/rule version: `RECOMMENDED / CONDITIONAL`。semantic/visual reproducibility。
- `formulaVersion`: pre-formula Observationでは`NOT_NEEDED`。Formula output/Axis Score artifactで必須となる。
- `snapshotSchemaVersion`: Observation Schemaと別。Snapshotへmaterializeする時点のlineageであり混同しない。

Published Observation artifactをhistorical reconstructionへ使用する場合、version referencesとsource artifact referenceはimmutableである必要候補とする。

## 10. Worker / Backend Responsibility Boundary

**Python Worker候補:** crawl/capture、deterministic extraction、HTML/screenshot artifacts、Internal/Visual observations、semantic/vision candidate生成、instance provenanceの出力。

**Rails / Backend候補:** Organization/Project/AnalysisJob ownership、canonical envelope/ID/version validation、persistence/immutability、artifact association、registry resolution、dedup/aggregation orchestration、Formula/Score pipeline handoff。

Frontend/BFFはraw observationを再計算せず、validated Snapshot/Score viewを消費する。Currentとの差分は、Python Workerが存在せず、RailsにObservation model/validator/persistenceがなく、OpenAPI Snapshot payloadがuntypedで、mockがObservationを介さずfinal resultを直接生成している点である。

## 11. Observation Output Contract v1 Candidate and Formula Handoff

最小概念Contract候補:

```text
Observation {
  identity: observationId + observationType
  mapping: canonicalAxisId + submetricId + semanticAspect
  evidence: evidenceId + derivedFromObservationIds?
  value: valueType + typed value
  measurement: mode + layer + scope + sourceType
  provenance: job/run + page/artifact references + capturedAt
  coverage: conditional denominator/coverage fields
  completeness: status + reason/applicability?
  confidence: required when semantic/hybrid
  lineage: axisContractVersion + analysisPipelineVersion + observationSchemaVersion
}
```

Formula DiscoveryへAtomic Observation IDs、Submetric mapping、typed value、scope/coverage、Internal/Visual layer、measurement mode、completeness、conditional confidence、provenance、version lineageを渡す。Exact Formulaは決めない。

Observation Output Contractは`READY_FOR_DECISION`。Axis Formula overallは`READY_FOR_FORMULA_DISCOVERY`を維持する。PD-02CとPD-02 parentは`NEEDS_DISCOVERY`、PD-02Dは`BLOCKED`、Backend Wireは`READY_FOR_BACKEND_DISCOVERY`である。

## 12. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-30 Calibration](./88-pd02c-differentiation-decision-support-evidence-calibration.md)
- [PD-29 Axis/Submetric Workshop](./87-pd02c-axis-formula-submetric-evidence-workshop.md)
- [PD-28 Formula / Backend Discovery](./86-pd02c-score-formula-backend-contract-discovery.md)
- [MVP Specification](../../src/lib/db/role/panoptes_mvp_spec_final_reviewed_v_1_0.md)
- [Master Specification](../../src/lib/db/role/panoptes_master_spec_v_3_4_strategy_os_db_feed_integrated.md)
- [Archived Crawler Specification](<../../src/lib/db/role/Archive/Panoptes Python Crawler Implementation Specificati.txt>)
- [OpenAPI Draft](../api/openapi-draft.yaml)
- [Development Log](../DEVELOPMENT_LOG.md)
