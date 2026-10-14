# Phase PD-12 — PD-02B Canonical ID & Funnel Naming Discovery

Date: 2026-08-20  
Status: Completed / `DISCOVERY_COMPLETE`  
Decision status: Proposal only; Product Owner approval required

## 1. Scope

Formal Common 6 Axisに対するdomain-level Canonical ID候補を調査し、特に「導線強度」と現行fixture key `funnelStrength`のsemantic mismatchを評価した。Canonical Order、正式Axis Definition本文、Versioning、Backend Wire ID、formula、weight、threshold、missing/partial contractは対象外である。Svelte、TypeScript、fixture、mapping、label、order、Rails、BFF、OpenAPIは変更していない。

## 2. Evidence

- 現行6 keysは`src/lib/db/dummy/panoptes_dummy_ui.ts`とSelf presentation mappingに集中し、dummy seedのaxis scores、delta、expected liftに使用される。
- OpenAPI、Rails、production BFFには同じ6-key contractがない。したがってFrontend fixture/mapping evidenceであってBackend contractではない。
- 現行role/spec資料は6 conceptsをSelf / Competitor / Industry / Snapshotで安定して扱う設計証拠を持つが、Product Owner承認済みCanonical IDの証拠ではない。
- Historical specの導線軸は`primary_cta_presence`、`cta_progression_logic`、`internal_navigation_strength`、`conversion_path_visibility`を含む。またPanoptesは導線を単体ページでなく流れとして扱い、primary path、stage coverage、trust/compare timingを観察する。
- 現行dummy evidenceはcomparison phaseの離脱、service → pricing → CTAの分断、comparison/pricing page links、CTA位置・文言、pricing page transitionを導線改善として扱う。期待liftは`funnelStrength +8`と`decisionSupport +6`を分けている。

## 3. ID design principles

Canonical IDはProduct conceptの安定したmachine/domain identityであり、表示label、short label、locale、feature、一時fixtureから独立させる。1 AxisにつきCanonical IDは1つとし、legacy/fixture keyは必要ならmigration aliasとして別管理する。Self / Competitor / Industry間で共有でき、将来Backend/APIへ明示mapping可能であることを求める。

## 4. ID format assessment

| Format | Assessment |
| --- | --- |
| `camelCase` | 推奨。既存TypeScript keys、object access、migration costと整合する |
| `snake_case` | wire/persistenceでは候補になり得るが、Frontend domain慣行と不一致。Backend Wire IDは対象外 |
| `kebab-case` | quoted property accessを要し、既存慣行と安定性に不利 |

Recommended frontend domain format: `camelCase`。これはProduct Owner承認待ちのProposalであり、Backend Wire ID formatを決めない。

## 5. valueProposition assessment

Historical evidenceはhero value clarity、problem-solution alignment、benefit specificity、offer visibilityを測る。`valueProposition`は「価値訴求」と強く一致する。一方、product valueそのものと伝達品質を混同する余地があるため、正式definitionでは「ユーザーへ伝達された価値提案」を明記する。

Recommendation: `KEEP` / Proposed Canonical ID `valueProposition` / `READY_FOR_DECISION`。

## 6. informationHierarchy assessment

Evidenceはheading structure、section order、navigation information、content groupingである。Information Architecture全体ではなく、内容の優先順位と構造の理解しやすさを評価するため`informationHierarchy`が適合する。

Recommendation: `KEEP` / Proposed Canonical ID `informationHierarchy` / `READY_FOR_DECISION`。

## 7. funnelStrength assessment

`funnelStrength`はconversion pathを表せるが、「conversion funnel」を第一義に想起させる。Repository evidenceはCTA、internal navigation、link structure、comparison/pricing transition、primary path、stage progressionまで含み、実績conversion rateやacquisition funnelの計測は確認できない。このため範囲が狭く、`strength`もpresence、logic、visibility、coverageを説明しにくい。

Recommendation: `RENAME` / `NEEDS_DISCOVERY`。Source keyは今回変更しない。

## 8. Funnel naming candidates

| Candidate | Semantic coverage | Main risk | Result |
| --- | --- | --- | --- |
| `funnelStrength` | conversion path | analytics/conversion funnelへ限定 | Reject as first candidate |
| `navigationStrength` | internal navigation | CTA/stage/conversionを欠く | Partial |
| `pathwayStrength` | path/transition | 抽象的、`strength`が曖昧 | Partial |
| `conversionPathStrength` | conversion path | 非conversion回遊を欠く | Partial |
| `decisionPathStrength` | decision-page path | Axis 6と衝突 | Reject |
| `userFlowStrength` | navigation/path/CTA | `strength`が測定内容を表しにくい | Strong but second tier |
| `journeyStrength` | broad journey | customer journey全体と誤解 | Reject |
| `flowStrength` | flow | engineering/data flowと衝突 | Reject |
| `userFlowQuality` | path、navigation、CTA progression、transition | 正式definitionが必要 | Recommended replacement candidate |
| `navigationFlowQuality` | navigation + flow | conversion pathが弱まる | Alternative candidate |

`effectiveness`は行動成果やconversion実績の測定を暗示するため、現証拠では`quality`より不適切である。Recommended replacement candidateは`userFlowQuality`だが、Canonical IDとして未決定である。

## 9. Funnel semantic evidence

| Term | Status | Evidence boundary |
| --- | --- | --- |
| CTA | `SUPPORTED` | presence、position/text、progression |
| link structure | `SUPPORTED` | related/comparison/pricing links |
| navigation | `SUPPORTED` | internal navigation、回遊設計 |
| internal path | `SUPPORTED` | likely primary paths、comparison phase path |
| conversion | `SUPPORTED` | conversion path visibility、trust timing |
| user flow | `SUPPORTED` | 単体ページではなく流れ、service → pricing → CTA |
| decision flow | `PARTIAL` | decision pageへの移動は含むがdecision materialはAxis 6 |
| funnel | `PARTIAL` | conversion funnelは一部で全体ではない |
| pathway | `SUPPORTED` | page/path progression |
| journey | `UNKNOWN` | customer journey全体の明示証拠なし |
| transition | `SUPPORTED` | pricing/stage transition |

Included semantics: CTA presence/progression、internal navigation/link structure、主要path、stage coverage、comparison/pricing transitions、conversion path visibility。Excluded/unknown semantics: acquisition funnel、traffic/conversion analytics、customer journey全体、実際のdecision outcome、trust evidence品質、pricing/comparison contentの十分性、heading/content grouping。

## 10. trustStructure assessment

Evidenceはsocial proof、case evidence、brand authority/identity、credibility、FAQ/objection handlingである。単一signalではなく複数の信頼根拠の配置と構成を表すため`trustStructure`が適合する。

Recommendation: `KEEP` / Proposed Canonical ID `trustStructure` / `READY_FOR_DECISION`。

## 11. differentiationClarity assessment

Evidenceはunique claim、competitive positioning signal、message distinctiveness、comparison supportである。Canonical Label「差別化明確性」と直接対応し、Short Label「差別化」ともidentityを保つ。

Recommendation: `KEEP` / Proposed Canonical ID `differentiationClarity` / `READY_FOR_DECISION`。

## 12. decisionSupport assessment

Evidenceはpricing visibility、compare support、decision friction reduction、conversion readinessである。意思決定に必要な材料と摩擦削減を表し、移動mechanicsを所有する導線軸から分離できる。

Recommendation: `KEEP` / Proposed Canonical ID `decisionSupport` / `READY_FOR_DECISION`。

## 13. Candidate ID Matrix

| Canonical Label | Current Candidate | Semantic Fit | Stability | Ambiguity | Recommendation | Readiness |
| --- | --- | --- | --- | --- | --- | --- |
| 価値訴求 | `valueProposition` | Strong | High | Medium | KEEP | `READY_FOR_DECISION` |
| 情報階層 | `informationHierarchy` | Strong | High | Low–Medium | KEEP | `READY_FOR_DECISION` |
| 導線強度 | `funnelStrength` | Partial | Low | High | RENAME | `NEEDS_DISCOVERY` |
| 信頼構造 | `trustStructure` | Strong | High | Medium | KEEP | `READY_FOR_DECISION` |
| 差別化明確性 | `differentiationClarity` | Strong | High | Low | KEEP | `READY_FOR_DECISION` |
| 意思決定支援 | `decisionSupport` | Strong | High | Medium | KEEP | `READY_FOR_DECISION` |

Canonical ID overall readiness: `NEEDS_DISCOVERY`。5 IDsは個別Decision Reviewへ分離可能である。

## 14. Adjacent axis boundaries

- 導線強度 vs 意思決定支援: 移動・順序・到達可能性・CTA/path visibility vs pricing/comparison材料・摩擦削減・decision readiness。
- 情報階層 vs 意思決定支援: heading/section order/navigation information/content grouping vs 意思決定情報の十分性。
- 価値訴求 vs 差別化明確性: 絶対的な価値・便益・offerの伝達 vs 競合に対する固有性・positioning。
- 信頼構造 vs 意思決定支援: proof/authority/credibility/FAQ vs pricing/comparisonとdecision friction。

同一UI elementが複数axisへevidenceを提供し得るが、identityは「何を評価するか」で分離する。

## 15. Legacy key considerations

Canonical IDが現行keyと異なる場合は、即時renameではなくmapping compatibility → consumer移行 → contract test → legacy除去の順を推奨する。`funnelStrength`はfixture key/migration aliasとして一時保持できるが、Canonical IDの別名として恒久併存させない。Backend Wire IDは独立mappingを選択可能である。

## 16. Per-axis readiness

- `valueProposition`: `READY_FOR_DECISION`
- `informationHierarchy`: `READY_FOR_DECISION`
- funnel axis ID: `NEEDS_DISCOVERY`
- `trustStructure`: `READY_FOR_DECISION`
- `differentiationClarity`: `READY_FOR_DECISION`
- `decisionSupport`: `READY_FOR_DECISION`
- Canonical ID overall: `NEEDS_DISCOVERY`
- Axis Definition: funnel axisでは`BLOCKING_DEPENDENCY`
- Canonical Order / Versioning: `NEEDS_DISCOVERY`
- Backend Wire ID: `BLOCKED`

## 17. Product Owner questions

1. Canonical IDをEnglish domain IDとするか。
2. Frontend domain ID formatを`camelCase`とするか。
3. `valueProposition`を承認するか。
4. `informationHierarchy`を承認するか。
5. `trustStructure`を承認するか。
6. `differentiationClarity`を承認するか。
7. `decisionSupport`を承認するか。
8. `funnelStrength`をrenameするか。
9. 導線軸にCTA progressionを含めるか。
10. internal navigation/link structureを含めるか。
11. conversion pathを含め、conversion analyticsを除外するか。
12. decision pageへの移動を含め、decision materialをAxis 6へ分離するか。
13. `userFlowQuality`を第一rename候補としてdefinition reviewへ進めるか。
14. Backend Wire IDとの同一性を別Decisionにするか。
15. Legacy keyをmapping compatibilityで段階移行するか。

Recommended owner: Product Owner + Analysis/Data Owner。Backend/API、FrontendはConsulted。

## 18. Dependencies

導線軸Canonical IDはincluded/excluded semanticsとAxis 6境界の正式定義に依存する。PD-02Cは決定済みAxis Identityを参照できるが、Canonical ID未決定のためBackend schema implementationを開始しない。PD-02Dは6 axesをmissing/partial対象にできるがrepresentationは未決定。Canonical OrderとVersioningは本Phaseから独立している。

## 19. Standardization impact

5 IDsが承認されればcanonical axis metadata keys、domain type、label metadata lookup、stable accessibility identifiers、Self/Competitor mapping normalization planningを追加で解禁できる。現時点では新たに解禁しない。ID enum、source/fixture rename、canonical order、Backend/OpenAPI schema、formula/threshold、semantic color、missing UI、versioningはblockedである。

## 20. Remaining

- 5 `KEEP` candidatesのProduct Owner / Analysis Data Decision Review。
- Funnel Axis Definition Evidence Workshopと`userFlowQuality`評価。
- Canonical Order、Axis Definition本文、Versioning、Backend Wire ID。
- PD-02C formula/weight/thresholdとPD-02D missing/partial contract。

Quality result: `npm run quality` exit 0。Svelte check 0 errors / 0 warnings、ESLint 0 errors / 38 warnings、OpenAPI 18/18、Frontend Inventory unresolved imports 0 / cycles 0、22 files / 257 tests、build、auth smoke、route smoke、client secret boundary 63 build filesがPASSした。

Recommended next Product Decision / Phase: PD-13として5 Canonical IDs Decision Review。Alternative AはFunnel Axis Definition Evidence Workshop、Alternative BはPD-02D Missing / Partial Contract Discoveryである。

## 21. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-02 Score / Common Axes Discovery](64-pd02-score-common-axes-data-dictionary-discovery.md)
- [PD-02B Canonical Axis Identity Discovery](66-pd02b-canonical-axis-identity-discovery.md)
- [PD-02B Axis Set / Label Decision Review](67-pd02b-axis-set-label-identity-decision.md)
- [PD-02B Explicit Product Owner Approval](69-pd02b-explicit-product-owner-approval-record.md)
- `src/lib/db/dummy/panoptes_dummy_ui.ts`
- `src/lib/db/dummy/panoptes_dummy_ui.seed.json`
- `src/lib/components/ComponentsBase/Self/data/self-analysis-overview-presentation.ts`
- `src/lib/db/role/panoptes_master_spec_v_3_4_strategy_os_db_feed_integrated.md`
- `src/lib/db/role/panoptes_mvp_spec_final_reviewed_v_1_0.md`
- `src/lib/db/role/Archive/Panoptes_Strategic_Engine_Complete_Spec_v1.txt`
