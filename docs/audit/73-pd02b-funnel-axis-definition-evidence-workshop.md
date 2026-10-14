# Phase PD-15 — PD-02B Funnel Axis Definition Evidence Workshop

Date: 2026-08-20  
Status: Completed / `DISCOVERY_COMPLETE`  
Decision status: Definition and Canonical ID are `READY_FOR_DECISION`; not approved

## 1. Scope

Formal Common Axis「導線強度」について、Definition、included/excluded evidence、隣接軸境界、examples、anti-examples、naming implicationsをRepository evidenceから整理した。Canonical IDの正式Decision、Canonical Order、Versioning、Backend Wire ID、formula、Source implementationは対象外である。

## 2. Starting state

- Canonical Label: 導線強度 / `DECIDED`。
- Canonical ID: `NEEDS_DISCOVERY`。
- `funnelStrength`: `NOT_CANONICAL / RENAME_CANDIDATE`のlegacy/fixture key。
- `userFlowQuality`: `PROPOSED / NEEDS_DISCOVERY`。
- Canonical ID policy: `camelCase`、1 Axis = 1 Canonical IDは`DECIDED`。
- PD-02B overallとPD-02 parent: `NEEDS_DISCOVERY`。

## 3. Repository Evidence

| Evidence source | Classification | Evidence | Product-definition weight |
| --- | --- | --- | --- |
| Current master/MVP specifications | `DOCUMENTATION` | crawler observes CTA/internal links; future sticky CTA/navigation depth; visual target CTA strength; monitoring detects CTA architecture | Strong design evidence、正式formulaではない |
| Display metrics / formula specifications | `DOCUMENTATION` | funnel pattern、CTA fragmentation、comparison-route deficiency、回遊設計=funnel + decision-support composite | Strong semantic boundary evidence、Product approval代替ではない |
| Self view model and presentation | `PRODUCTION_PRESENTATION` | 「主要ページ導線評価」「比較検討フェーズで迷わない導線」「主要導線を再設計」 | Current user-facing semantics、scoring logicではない |
| Competitor presentation | `PRODUCTION_PRESENTATION` | 導線強度label、導線構造タイプ、CTA actions | Current display evidence、axis formulaなし |
| Dummy seed/mapping | `FIXTURE` | comparison/pricing paths、service→pricing→CTA、CTA position/wording、expected `funnelStrength +8` | Detailed examples、単独でdefinition正本にしない |
| Mock backend/selectors | `PREVIEW` | 比較導線、導入検討phase、分析中subtitle | Preview semantics、canonical contractではない |
| Unit tests | `TEST` | labels/order、CTA action textをregression保持 | Behavior preservationのみ、Product approvalではない |
| Historical Strategic Engine | `LEGACY` | CTA presence/progression、internal navigation、conversion path visibility、primary paths、stage coverage | Strong historical input、current formulaではない |
| Canonical production score engine | `UNKNOWN` | formula、weights、threshold、actual observation mapping未接続 | Definitionから推測しない |

Search語には導線、CTA、call to action、navigation、internal navigation、path/pathway、flow/user flow、journey、funnel、conversion path、transition、stage coverage、next/primary/secondary action、decision/click path、link structureを含めた。Job/UI animationの`transition`、survey navigation、DB task transitionなど同名異義のEvidenceは除外した。

## 4. Included semantics

| Candidate evidence | Inclusion | Boundary |
| --- | --- | --- |
| CTA existence | `INCLUDED` | next actionが存在するか |
| CTA prominence | `INCLUDED` | 観測可能なvisual/action priority。business効果は含めない |
| CTA wording | `PARTIAL` | action/destination clarityのみ。価値claimの質は価値訴求 |
| CTA destination | `INCLUDED` | 主要pathへ正しく接続されるか |
| internal link structure | `INCLUDED` | relevant pages/next stepsの接続性 |
| navigation hierarchy | `PARTIAL` | movement/reachabilityは導線、grouping/order理解は情報階層 |
| page transition continuity | `INCLUDED` | page-to-page pathが分断されないか |
| major path completeness | `INCLUDED` | intended destinationまで必要stageが接続されるか |
| dead-end presence | `INCLUDED` | 次Actionのない行き止まり構造 |
| stage coverage | `INCLUDED` | discovery/comparison/action等の必要stage接続。stage content品質は別軸 |
| conversion path | `INCLUDED` | major pathの一種。Axis全体をconversionだけに限定しない |
| repeated CTA | `PARTIAL` | continuity/reachabilityへの寄与のみ。反復自体を良としない |
| sticky CTA | `PARTIAL` | action availabilityへの寄与のみ。sticky実装自体を良としない |
| header navigation | `INCLUDED` | major pathへのreachabilityに寄与する部分 |
| footer navigation | `INCLUDED` | dead-end回避/next pathに寄与する部分。Repositoryではconcept evidence中心 |

## 5. Excluded semantics

`EXCLUDED`: actual click-through rate、actual conversion rate、traffic source、session behavior、attribution、lead quality、revenue conversion、website外のcustomer journey、CRM stage、sales pipeline、user intent prediction。

これらはBehavioral Analytics、Sales/CRM、外部推定dataであり、観測可能なsite structureから「実際に進んだ」「成果が出た」と推定しない。Pricing/comparison情報の十分性、testimonialの信頼性、heading hierarchy、unique value claimも別Axisであり導線scoreへ直接含めない。

## 6. Primary evaluation object

優先順位:

1. `User path / Page sequence` — 主要な評価対象。
2. `Site structure` — pathを構成するpage/link/navigation接続。
3. `Page` — next actionとoutbound pathの局所単位。
4. `UI element` — CTA/link/navigationはpath evidence。
5. `Conversion funnel` — major pathの一類型であり主対象ではない。

## 7. Structural vs behavioral boundary

導線軸は`Observable Structural Support`を評価し、`Behavioral Performance`を評価しない。「ユーザーが実際にクリック・転換したか」ではなく、「次Actionを識別し、主要destinationまで進める構造が存在し連続しているか」を評価する。`quality`はこのstructural completeness/clarity/continuityを意味し、成果効率を意味しない。

## 8. Information Hierarchy boundary

- `informationHierarchy`: 情報のheading、section order、grouping、navigation informationがどう整理され理解できるか。
- Funnel Axis: 次Actionと次destinationへどう移動できるか。
- Navigation grouping/orderは情報階層、link destination/reachability/path continuityは導線軸を主責任とする。

## 9. Decision Support boundary

- Funnel Axis: 「次へ進める構造があるか」。
- `decisionSupport`: 「進む判断に必要なpricing、comparison、friction-reduction情報があるか」。
- Pricing comparisonの内容は意思決定支援、pricing pageへのCTA/transitionは導線軸。Flow timingが両方へsignalを与えてもidentityは分離する。

## 10. Value Proposition boundary

- `valueProposition`: Product/serviceの価値、problem-solution、benefit、offerが伝わるか。
- Funnel Axis: 価値理解後の次Actionとdestinationが明確・接続されるか。
- CTA wordingのvalue claimは価値訴求、action verb/destination clarityは導線軸。

## 11. Trust Structure boundary

- `trustStructure`: proof、authority、credibility、FAQ/objection handlingの質と構成。
- Funnel Axis: trust materialへ到達し、その後のActionへ戻れるpath。
- Testimonialの信頼性は信頼構造、testimonial link/placementによるpath continuityは導線軸。

## 12. Differentiation boundary

- `differentiationClarity`: 競合に対する独自性、positioning、distinctive messageの明確さ。
- Funnel Axis: 差別化理解をcomparison、pricing、contact等のnext actionへ接続できるか。
- Unique claim自体は差別化、claim付近のnext-step pathは導線軸。

## 13. Candidate Definition A

「ユーザーがサイト上で次に取るべき行動を理解し、主要な目的地点まで無理なく移動できる導線が構成されている度合い」。

Assessment: `STRONG`。CTA clarity、placement、internal navigation、next-step visibility、page continuity、major pathsと一致する。ただし「無理なく」はbehavior/usability推定に読めるため、observable structureへ限定する補足が必要。

## 14. Candidate Definition B

「主要なConversion Goalへ向けたFunnelが構成され、各Stage間の遷移が支援されている度合い」。

Assessment: `PARTIAL / TOO_NARROW`。Conversion pathとstage progressionには一致するが、Repositoryはcomparison/trust/internal navigationなど非conversion-only pathも扱う。`funnelStrength`を正当化するほどconversion-focusedではない。

## 15. Candidate Definition C

「サイト内の主要User Flowが、発見・理解・比較・行動まで連続的につながっている度合い」。

Assessment: `STRONG_WITH_BOUNDARY`。Flow/path continuityとstage coverageに一致し`userFlowQuality`を支持する。ただし理解の質は情報階層/価値訴求、比較材料の質は意思決定支援なので、「各stageの内容品質」ではなく「stage間の接続」を評価すると限定する必要がある。

## 16. Recommended Definition Draft

Canonical Label: 導線強度  
Definition: サイト上で次に取るべき行動が識別でき、CTA・内部リンク・ナビゲーション・ページ間遷移によって、主要な目的地点までの経路が途切れず接続されている度合い。実際のクリックや転換実績ではなく、ユーザーの移動を支える観測可能な構造の明確さ・接続性・連続性を評価する。  
Included: CTA existence/prominence/action clarity/destination、internal links、navigation reachability、page continuity、major path completeness、dead ends、stage coverage、conversion path as a subtype。  
Excluded: behavioral analytics、attribution、sales/CRM、full off-site journey、actual outcome、他Axisのcontent quality。  
Primary Evaluation Object: User path / Page sequence。  
Observable Evidence: CTA/link/navigation/page set、destinations、path length/coverage、next-step availability、structural dead ends。  
Canonical ID Candidates: `userFlowQuality`、`siteFlowQuality`、`pathwayQuality`、`pathContinuity`。  
Status: `READY_FOR_DECISION` proposal。未承認。

## 17. Examples

1. `REPOSITORY_EVIDENCE`: Service page → pricing page → CTAが連続して接続されている。
2. `REPOSITORY_EVIDENCE`: 主要pageからcomparison pageへのlinkがあり、比較stageへ移れる。
3. `REPOSITORY_EVIDENCE`: Hero/section CTAのactionとdestinationが明確である。
4. `REPOSITORY_EVIDENCE`: Pricing pageへの導線とpricing後のnext actionが途切れない。
5. `REPOSITORY_EVIDENCE`: Case/FAQ/trust materialへのpathがあり、その後のActionへ接続される。
6. `CONCEPT_EXAMPLE`: Header navigationが主要task/destinationへのreachabilityを提供する。
7. `CONCEPT_EXAMPLE`: Footerにrelevant next-step linksがありdead endを避ける。

## 18. Anti-examples

1. Pricing情報が詳しいこと自体 — `decisionSupport`。
2. Testimonialが信頼できること自体 — `trustStructure`。
3. Heading hierarchyが論理的なこと自体 — `informationHierarchy`。
4. Unique value statementが明確なこと自体 — `valueProposition` / `differentiationClarity`。
5. Actual conversion rateが高い — behavioral outcomeでScope外。
6. Traffic attributionが正確 — analyticsでScope外。
7. CTA内のbenefit claimが優れている — value communication。Action/destination clarityだけ導線軸。
8. CRM sales stageが進んだ — website外のsales pipelineでScope外。

## 19. funnelStrength reassessment

Definition EvidenceはConversion Funnelだけでなくinternal navigation、page sequence、comparison/trust paths、dead-end avoidanceを支持する。`funnelStrength`はscopeが狭くanalytics/business funnelを暗示し、`strength`もstructural clarity/continuityを説明しにくい。

Recommendation: `REJECT_AS_CANONICAL_ID`。正式statusはProduct Decisionまで`NOT_CANONICAL / RENAME_CANDIDATE`を維持し、既存fixture keyとしてのみ残す。Source renameは行わない。

## 20. userFlowQuality assessment

Advantages: CTAに限定せずnavigation、transition、path、stage continuityを包含し、`quality`がobservable structural clarity/connectivity/completenessを表せる。`camelCase` policyにも適合する。

Risks: actual behavior flow、full journey、general UX usabilityまで含むと誤解される。Definition metadataで「on-site」「observable structural support」「actual analytics excluded」を明示する必要がある。

Assessment: `KEEP_CANDIDATE / READY_FOR_DECISION`。正式Canonical IDではない。

## 21. Alternative naming candidates

再評価対象: `funnelStrength`、`navigationStrength`、`navigationQuality`、`pathwayStrength`、`pathwayQuality`、`userFlowStrength`、`userFlowQuality`、`flowStrength`、`flowQuality`、`conversionPathStrength`、`decisionPathStrength`。追加候補: `siteFlowQuality`、`pathContinuity`。

## 22. Naming matrix

| Candidate | Precision / scope | Analytics implication | Adjacent-axis risk | Engineering clarity | Result |
| --- | --- | --- | --- | --- | --- |
| `userFlowQuality` | Strong; CTA/navigation/path/transition | Medium; Definitionで制限可能 | Low–Medium | High | `RECOMMENDED` |
| `siteFlowQuality` | Strong; on-siteを明示 | Low | Low | Medium; 一般性がやや低い | Alternative A |
| `pathwayQuality` | Medium–Strong | Low | Low | Medium; 抽象的 | Alternative B |
| `pathContinuity` | Strong for continuity | Low | Low | High | completeness/prominenceを狭める |
| `navigationQuality` | Navigationには明確 | Low | Info hierarchyとMedium | High | CTA/conversion pathを狭める |
| `userFlowStrength` | ScopeはStrong | Medium | Low–Medium | Medium | `strength`が曖昧 |
| `flowQuality` | Broad | Medium | Medium | Low; data/engineering flowと衝突 |
| `funnelStrength` | ConversionにはStrong、axis全体はPartial | High | Decision supportとMedium | Highだが誤解 | Reject as canonical |
| `navigationStrength` | Narrow | Low | Info hierarchyとMedium | Medium | Reject |
| `pathwayStrength` | Medium | Low | Low | Low–Medium | Reject |
| `flowStrength` | Broad/ambiguous | Medium | Medium | Low | Reject |
| `conversionPathStrength` | Narrow | High | Decision supportとHigh | High | Reject |
| `decisionPathStrength` | Narrow | Medium | Decision supportとHigh | High | Reject |

Recommended Canonical ID candidate: `userFlowQuality`。Rationaleはsemantic coverage、structural-quality表現、既存Frontend domain namingとの整合、隣接軸分離、将来mapping安定性の均衡が最も良いため。

## 23. Definition readiness

`READY_FOR_DECISION`。Current documentation、production presentation、fixture、legacy inputsがstructural path supportという共通意味で収束し、included/excluded semantics、隣接軸境界、examplesが揃った。正式Product DefinitionではなくProduct Owner + Analysis/Data Ownerの承認待ちである。

## 24. Canonical ID readiness

`READY_FOR_DECISION`。第一候補`userFlowQuality`と代替候補・tradeoffsを比較可能。`funnelStrength`はcanonical推奨から除外できる。ただしDefinitionと同時承認するまでCanonical IDへ昇格しない。

## 25. Product Decision questions

1. 導線強度をobservable structural User Flow Qualityと定義するか。
2. Conversion Funnelだけに限定しないか。
3. CTAだけでなくinternal navigationを含めるか。
4. Page transition continuityを含めるか。
5. Header/Footer navigationのreachability部分を含めるか。
6. Conversion pathをmajor pathの一種として含めるか。
7. Actual behavioral analyticsを明示的に除外するか。
8. Website外のcustomer journeyを除外するか。
9. Primary evaluation objectをUser path / Page sequenceとするか。
10. English IDでは`strength`より`quality`を採用するか。
11. `userFlowQuality`をCanonical IDとして承認するか。
12. `siteFlowQuality`、`pathwayQuality`、`pathContinuity`のいずれかを選ぶか。
13. DefinitionをProduct Owner + Analysis/Data OwnerのJoint Decisionとするか。
14. Backendでも同じsemantic identityを参照し、wire stringは別Decisionとするか。

## 26. Dependencies

Recommended owner: Product Owner + Analysis/Data Owner。Consulted: Frontend、Backend/API、Design。

Definition/ID Decision後、PD-02CはFormal Common 6 Axisすべてのdomain identityを参照可能になるが、formulaとBackend Wire IDは別Decision。PD-02Dも6軸を完全識別できるがmissing/partial representationは別Decision。Canonical Order、Versioning、Backend Wire IDは本Phaseで進めない。

## 27. Remaining

- Product Owner + Analysis/Data OwnerによるDefinition Draftと`userFlowQuality`のDecision Review。
- Funnel ID決定後のlegacy `funnelStrength` compatibility/migration planning。
- Canonical Order、正式Definitions for other axes、Versioning、Backend Wire ID。
- PD-02C formula/backendとPD-02D missing/partial contract。

推奨次Product Decision / Phase: PD-16 Funnel Axis Definition & Canonical ID Decision Review。Alternative Aは追加Analysis/Data evidence review、Alternative BはPD-02B Canonical Order Discovery。

Quality result: `npm run quality` exit 0。Svelte check 0 errors / 0 warnings、ESLint 0 errors / 38 warnings、OpenAPI 18/18、Frontend Inventory unresolved imports 0 / cycles 0、22 files / 257 tests、production build、auth smoke、route smoke、client secret boundary 63 build filesがPASSした。

## 28. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-8 Canonical Axis Identity Discovery](66-pd02b-canonical-axis-identity-discovery.md)
- [PD-12 Canonical ID & Funnel Naming Discovery](70-pd02b-canonical-id-funnel-naming-discovery.md)
- [PD-14 Five IDs Approval Record](72-pd02b-five-canonical-ids-explicit-approval-record.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- `src/lib/db/role/panoptes_master_spec_v_3_4_strategy_os_db_feed_integrated.md`
- `src/lib/db/role/panoptes_mvp_spec_final_reviewed_v_1_0.md`
- `src/lib/db/role/panoptes_display_metrics_mapping_spec_v_1_0.md`
- `src/lib/db/role/panoptes_formula_spec_v_2_1_precision_hardened.md`
- `src/lib/db/role/Archive/Panoptes_Strategic_Engine_Complete_Spec_v1.txt`
- `src/lib/db/dummy/panoptes_dummy_seed_v1_1_mapping_aligned.json`
- `src/lib/db/dummy/panoptes_dummy_ui.ts`
- `src/lib/components/ComponentsBase/Self/data/self-analysis-view-model.ts`
- `src/lib/components/ComponentsBase/Self/data/self-analysis-overview-presentation.ts`
- `src/lib/components/ComponentsBase/Competitor/data/competitor-analysis-view-model.ts`
- `src/lib/components/ComponentsBase/Competitor/data/competitor-card-presentation.ts`
