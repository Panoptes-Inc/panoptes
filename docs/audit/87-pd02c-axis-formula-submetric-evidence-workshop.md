# Phase PD-29 — PD-02C Axis Formula / Submetric Evidence Workshop

Date: 2026-08-21  
Decision: PD-02C Axis Formula / Submetric Evidence  
Status: `EVIDENCE_WORKSHOP_COMPLETE / NEEDS_MORE_EVIDENCE`

## 1. Scope and Boundary

Axis Contract v1の6 Formal Definitionsを基準に、公開Webサイトから観測可能なAtomic ObservationとSubmetric候補を整理した。Exact Formula、Weight、Normalization、Threshold、Rounding、Eligibility、Missing/Partial、Overall Aggregation、Backend schemaは決定していない。

同一Evidenceのreuseは`ALLOWED`だが、Axisごとのsemantic aspectは`MUST_BE_SEPARATED`。Actual CTR/CVR、sales、revenue、actual comprehension/outcome、unsupported external inferenceは対象外である。

## 2. Repository Evidence Classification

| Source | Classification | Finding |
| --- | --- | --- |
| PD-17 / PD-20 Definitions | `DOCUMENTED_CANDIDATE / DECIDED_SEMANTICS` | 6軸のmeaning、included/excluded、observable boundaryを確定 |
| Formula Specification v2.1 | `DOCUMENTED_CANDIDATE` | Axis weight profilesとdownstream formulaはあるがatomic/submetric→Axis mappingなし |
| Display Metrics Mapping v1.0 | `DOCUMENTED_CANDIDATE` | Axis→layer weighted mean候補。Atomic Observation Contractなし |
| Archived Strategic Engine v1 | `LEGACY` | 6軸×4 submetrics、null除外weighted mean案。現行Product Formulaではない |
| Archived Crawler Specification | `LEGACY / DOCUMENTED_CANDIDATE` | headings、CTA、links、pricing、FAQ、compare、trust/case blocks、screenshots等の抽出案 |
| Frontend fixture/mock | `FIXTURE / MOCK / PREVIEW` | labels、scores、copy examples。Observation由来でなくFormula evidenceに使えない |
| Production crawler / Observation Output Contract | `UNKNOWN / NOT_IMPLEMENTED` | 実装、typed atomic output、canonical submetric registryなし |

## 3. Axis Evidence Matrix

| Axis | Atomic Observation Candidates | Submetric Candidates | Evidence Strength | Readiness |
| --- | --- | --- | --- | --- |
| `valueProposition` | Hero/primary claim、audience/problem/benefit/offer statements、first-view visibility、problem-solution co-occurrence | Audience & Problem Clarity、Benefit Articulation、Offer Clarity、Problem-Solution Linkage、Primary Value Message Visibility | Strong semantic documentation; semantic classifier absent | `READY_FOR_FORMULA_DISCOVERY` |
| `informationHierarchy` | h1–h3 tree、heading-level skips、section order/grouping、chunk size、navigation taxonomy、related-content proximity、first-view priority | Heading Structure Quality、Section Sequencing、Content Grouping、Priority Visibility、Information Proximity | Strongest mechanical observation candidates | `READY_FOR_FORMULA_DISCOVERY` |
| `userFlowQuality` | CTA presence/destination/status、internal link graph、navigation reachability、path continuity、dead ends、page types/stages、stage coverage | Action Availability、Destination Validity、Navigation Reachability、Path Continuity、Dead-End Avoidance、Stage Coverage | Strong mechanical candidates and decided boundary | `READY_FOR_FORMULA_DISCOVERY` |
| `trustStructure` | testimonial/case/logo/certification/credential/company/security/guarantee blocks、credibility FAQ、placement/coverage | Trust Evidence Coverage、Authority/Credential Evidence、Transparency Coverage、Assurance Evidence、Proof Visibility | Strong category candidates; authenticity not observable | `READY_FOR_FORMULA_DISCOVERY` |
| `differentiationClarity` | unique/specialized/proprietary claims、category positioning、reason-to-choose、distinctive feature、explicit comparison、cross-page consistency | Unique Claim Clarity、Specialization Signal、Proprietary Approach Evidence、Relative Positioning Clarity、Reason-to-Choose Visibility | Semantic/category comparison and generic-vs-distinctive labels absent | `NEEDS_MORE_EVIDENCE` |
| `decisionSupport` | pricing context、plan/options/comparison、scope/spec/condition/process/constraint、FAQ、implementation/onboarding information、coverage by page type | Commercial Context Coverage、Option Comparison Support、Scope & Condition Clarity、Process/Onboarding Clarity、Decision FAQ Coverage | Observable candidates strong; contextual necessity/non-public pricing rules need product context | `NEEDS_MORE_EVIDENCE` |

## 4. Atomic Observation and Measurement Nature

Atomic ObservationはDOM/content/link/screenshot/page classification等の最小観測単位で、Submetricは複数Atomic Observationsを1つのevaluation questionへまとめる候補である。`testimonial exists`はAtomic Observation、`Trust Evidence Coverage`はSubmetric候補であり同一ではない。

- `presence`: CTA、pricing、FAQ、case、credential等。
- `count / ratio / coverage`: heading violations、linked pages、stage/page-type coverage、evidence category coverage。
- `continuity`: source→destination link、major path、dead-end。
- `diversity`: trust evidence/decision material categories。多いほど良いとは決定しない。
- `clarity proxy / structural quality / evidence strength proxy`: message、grouping、positioning、proof context。semantic analysisとprovenanceが必要。

## 5. Formula Spec Compatibility

Formula Spec v2.1は6 Axisのmarket-type weights、Internal/Visual agreement、Axis→layer/overall方向を支えるが、Atomic Observation、Submetric、各Axis score derivationを定義しないためoverall=`PARTIALLY_SUPPORTED`である。

Archived submetricsはsemantic候補として部分整合するが`LEGACY`である。特に以下は境界修正が必要である。

- `funnelStrength`はlegacy identity。`userFlowQuality`へsemantic mappingし、conversion-onlyにしない。
- `nav_information_clarity`はtaxonomy/groupingをHierarchy、reachabilityをFlowへ分離する。
- `faq_objection_handling`はFAQ形式でなくTrust/Decisionのcontent purposeで分離する。
- `comparison_support`はrelative uniquenessをDifferentiation、decision material completenessをDecision Supportへ分離する。
- `conversion_readiness`はbehavior/outcomeを含む読みを禁止し、Decision informationまたはFlow structureへ分解する。
- `brand_identity_trust`はbrand appearanceのみでTrustとせず、observable credibility evidenceへ限定する。

## 6. Cross-Axis Overlap Findings

- Hero/CTA: value claimはValue、action/destinationはFlow、visual priorityは各semantic aspectのsupporting evidence。
- Navigation: taxonomy/groupingはHierarchy、destination/reachabilityはFlow。
- Case/testimonial: proofはTrust、outcome/benefit statementはValue、distinctive capabilityはDifferentiation、selection materialはDecision。
- Comparison/pricing: unique differenceはDifferentiation、material completenessはDecision、pageへの接続はFlow、groupingはHierarchy。
- FAQ: credibility/securityはTrust、price/condition/processはDecision。UI形式だけでAxisを決めない。

Formula double-count prevention、contribution cap、primary/supporting weightは未決定である。

## 7. Missing Evidence and Formula Gaps

- Production crawler、Observation Output Contract、typed atomic observation/submetric IDs、canonical validatorsがない。
- Site/page/section scope、denominator、coverage、required page-typeの定義がない。
- Atomic→Submetric→Axis aggregation、Internal/Visual attribution、eligibility、confidence、normalizationがない。
- Audience/problem/benefit、generic-vs-distinctive、evidence purpose、contextually required decision materialのlabeled examples/calibrationがない。
- Visual observationからvisibility/hierarchy/proof saliencyへ変換するcontractがない。
- Multi-Axis reuseのdedup/contribution rule、inter-rater/benchmark validationがない。
- Missing/Partialとzeroの区別はPD-02D待ちである。

## 8. Backend Data Requirements

Backend内部のObservation/Formula境界は、具体field名を決めず少なくとも次を運べる必要がある。

- Canonical Axis IDと将来のversioned Submetric identity。
- Atomic evidence type、measurement nature/value、source URL/page type、DOM/content/screenshot reference、capture timestamp/hash。
- Internal/Visual layer、scope/denominator/coverage、classifier/pipeline version、confidence/provenance。
- Multi-Axis referencesごとのsemantic aspect、Primary/Supporting classification。
- Link graphのsource/destination/statusとpath/stage metadata。
- Missing/unobservable/not-applicableをzeroから分離できるcompleteness hook。

Raw observation/submetric bundleをpublic UI APIへそのまま返す必要はない。Backendでlineage/reconstruction可能に保持し、Frontendへはvalidated Snapshot viewを返す境界候補を維持する。

## 9. Readiness and Handoff

Axis Formula overallは`NEEDS_MORE_EVIDENCE`。Value、Hierarchy、Flow、TrustはFormula Discoveryを開始可能だが、DifferentiationとDecision Supportはsemantic labeling/context evidenceが不足する。PD-02Cは`NEEDS_DISCOVERY`を維持する。

PD-02DへAxis/Submetric単位のpresent/missing/not-applicable、scope/coverage、required evidence、aggregation eligibility候補をhandoffするが、Missing/Partial treatmentは決めない。Backend Wireは引き続き`READY_FOR_BACKEND_DISCOVERY`である。

## 10. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-28 Discovery](./86-pd02c-score-formula-backend-contract-discovery.md)
- [PD-20 Definitions Approval](./78-pd02b-remaining-five-axis-definitions-explicit-approval-record.md)
- [PD-17 Funnel Approval](./75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)
- [Formula Specification v2.1](../../src/lib/db/role/panoptes_formula_spec_v_2_1_precision_hardened.md)
- [Display Metrics Mapping v1.0](../../src/lib/db/role/panoptes_display_metrics_mapping_spec_v_1_0.md)
- [Archived Strategic Engine v1](../../src/lib/db/role/Archive/Panoptes_Strategic_Engine_Complete_Spec_v1.txt)
- [Archived Crawler Specification](<../../src/lib/db/role/Archive/Panoptes Python Crawler Implementation Specificati.txt>)
- [Development Log](../DEVELOPMENT_LOG.md)
