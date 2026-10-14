# Phase PD-21 — PD-02B Canonical Order Discovery

更新日: 2026-08-20  
Status: `DISCOVERY_COMPLETE / AWAITING_DECISION_REVIEW`  
Source changes: none

## 1. Scope

Formal Common 6 AxisのCanonical Orderが必要か、必要なら何のためのOrderかを定義し、existing orders、candidate models、override、Radar、Snapshot、accessibility、documentation、Formula / Backend境界をEvidenceベースで整理する。Formula、Weight、Threshold、Backend Wire / Schema、Missing / Partial、Versioning、Source implementationは決定しない。

## 2. Starting State

- PD-02 / PD-02B: `NEEDS_DISCOVERY`
- Formal Axis Set / Labels: `DECIDED`
- Canonical IDs: `6 / 6 DECIDED`
- Definitions: `6 / 6 DECIDED`
- Canonical Order: `NEEDS_DISCOVERY`
- Canonical Order necessity: `NOT_DECIDED`
- Versioning: `NEEDS_DISCOVERY`
- Backend Wire ID: `BLOCKED`

Product Ownerの明示承認はなく、本Phaseでは`DECIDED`へ移行しない。

## 3. Order Type Taxonomy

| Type | Definition | Domain relation |
| --- | --- | --- |
| Domain Canonical Order | Product Domainとして6軸を安定列挙する標準概念順 | canonical candidate |
| UI Display Order | feature / component上の表示・reading order | Domain default + explicit override候補 |
| Analysis Processing Order | Engine / jobの計算・処理順 | independent |
| Evidence Collection Order | crawler / parser / analysisの取得順 | independent |
| User Decision Journey Order | 非線形な理解・比較・判断・行動の概念順 | canonical非推奨 |
| Storytelling Order | report / UI / presentationの説明順 | use-case specific |

## 4. Existing Order Inventory

| Source / Feature | Order | Source Type | Rationale Known? | Aligns with Candidate A? |
| --- | --- | --- | --- | --- |
| Historical A1–A6 Product draft | value → information → flow → trust → differentiation → decision | `PRODUCT_PROPOSAL / LEGACY_DOCUMENTATION` | Partially。fixed axis listing / submetric grouping | yes |
| PD-20 Semantic Contract docs | value → information → flow → trust → differentiation → decision | `DOCUMENTATION / PRODUCT_PROPOSAL` | Formal Set listing。Order承認ではない | yes |
| Active Self | value → flow → differentiation → information → trust → decision | `PRODUCTION_PRESENTATION` | no | no |
| Active Competitor | value → flow → differentiation → information → trust → decision | `PRODUCTION_PRESENTATION` | visual preservation only | no |
| Preview Industry / dummy Snapshot | value → flow → differentiation → information → trust → decision | `PREVIEW / FIXTURE_DERIVED_PRESENTATION` | shared `AXIS_KEYS` mapping | no |
| Industry seed record | value → trust → information → differentiation → flow → decision | `FIXTURE` | no | no |
| Mock snapshot Self radar | information → flow → differentiation → decision → trust → value | `MOCK / DEV_TEST` | no | no |

Strategyはcommon-six-axis collectionを持たず、subset impact stringsのobject orderはCanonical Order evidenceにしない。

## 5. Existing Order Classification

Latest RepositoryではSelfとCompetitorのproduction presentationがA順で一致し、dummy builderはIndustryとSelf radarを同じ`AXIS_KEYS`のA順へmapする。一方、Industry seed Bはruntime display orderではなく、mock snapshot Cもmock固有のlabel-bearing arrayである。Fixture / mock insertion orderをProduct specへ昇格しない。

Active A順のProduct rationaleは`RATIONALE_UNKNOWN`。CompetitorではB-2 visual contract preservation、Selfでは既存presentation preservationのEvidenceはあるが、なぜDomain上この順であるべきかは記録されていない。

## 6. Candidate A

Current Product Candidate:

`valueProposition` → `informationHierarchy` → `userFlowQuality` → `trustStructure` → `differentiationClarity` → `decisionSupport`

「何の価値か → 情報が整理されているか → 次へ進めるか → 信用できるか → 他と何が違うか → 判断できるか」と説明可能。Historical A1–A6とPD-20 documentationに反復Evidenceがある。

## 7. Candidate B

Decision Journey:

`valueProposition` → `differentiationClarity` → `trustStructure` → `informationHierarchy` → `decisionSupport` → `userFlowQuality`

Value → Why this → Trust → Understand → Decide → Actとして説明しやすい。ただしactual user journeyを直線化し、Hierarchyを遅く置くためDomain neutralではない。

## 8. Candidate C

Information-to-Action:

`valueProposition` → `informationHierarchy` → `differentiationClarity` → `trustStructure` → `decisionSupport` → `userFlowQuality`

Message / Structure → Distinctiveness / Trust → Decision / Actionのstoryとして整合するが、Repository内のstable order evidenceが弱く、Storytelling OrderをDomain Orderへ混入する懸念がある。

## 9. Candidate D

Structural First:

`informationHierarchy` → `valueProposition` → `differentiationClarity` → `trustStructure` → `decisionSupport` → `userFlowQuality`

Analysis modelとして構造から始める合理性はあるが、Analysis Processing / Interpretation視点へ偏り、Product DomainとUI neutralityが低い。

## 10. Existing UI Candidate

Candidate E:

`valueProposition` → `userFlowQuality` → `differentiationClarity` → `informationHierarchy` → `trustStructure` → `decisionSupport`

Self / Competitor / preview Industryのcurrent-state alignmentとmigration costでは最強。ただしintentが`RATIONALE_UNKNOWN`であり、historical implementation / visual layout都合をProduct semanticsへ昇格するEvidenceがない。UI migration baselineとして保持し、Domain recommendationにはしない。

## 11. Candidate Matrix

| Candidate | Order | Semantic rationale | Stability | UI neutrality | Product fit | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| A | V → I → F → T → Df → Ds | stable conceptual listing | High | High | High | `RECOMMENDED / READY_FOR_DECISION` |
| B | V → Df → T → I → Ds → F | linear decision journey | Medium | Low | Medium | Journey-only alternative |
| C | V → I → Df → T → Ds → F | information-to-action story | Medium | Medium | Medium–High | Secondary alternative |
| D | I → V → Df → T → Ds → F | structural analysis first | Low–Medium | Low | Low–Medium | Reject as Domain Order |
| E | V → F → Df → I → T → Ds | active UI alignment | High for current UI | Medium | Medium / rationale unknown | UI baseline only |

V=Value、I=Information、F=Flow、T=Trust、Df=Differentiation、Ds=Decision Support。

## 12. Domain vs UI

Domain Canonical Orderはdefault representational orderであり、すべてのUIへ強制するdisplay orderではない。UIは原則Domain defaultを利用し、feature-specific semanticsがある場合だけ明示overrideを許可するProposalとする。Current UI A順を無断変更しない。

## 13. Domain vs User Journey

User behaviorは非線形であり、Canonical Orderを「ユーザーが必ず通る順」「conversion funnel」「causal sequence」と解釈しない。User Decision Journey Orderは説明・research用の別orderである。

## 14. Domain vs Formula

Canonical OrderはFormula input orderやWeight lookupではない。Formula / WeightはCanonical IDへ明示的に紐付け、Axis index変更でscore semanticsが変わらない設計をProposalとする。PD-02Cは`BLOCKED`維持。

## 15. Domain vs Backend

Backend array positionへ意味を依存させない。`scores[0] = valueProposition`等のimplicit positional contractを避け、Canonical IDで識別するProposalとする。Backend Wire ID / schema / serialization formatは`BLOCKED`で未決定。

## 16. Radar Impact

Radar Axis orderはpolygon shapeと比較知覚を変える。Self / Competitor / preview Industryは現状A順で比較可能だが、mock Cは異なる。Candidate A採用時はactive Radarを並べ替えるImplementation Phase、visual regression、同一比較文脈のdefault統一、legacy snapshot表示を別途検討する。本Phaseではreorderしない。

## 17. Snapshot Lineage

Status: `SNAPSHOT_ORDER_LINEAGE_UNKNOWN`。

`PanoptesSelfData.radar`は`Array<{ label, self, industry }>`で、Canonical ID / order versionを保持しない。Dummy output Aとmock factory Cが共存する。過去Snapshotがsequenceを永続化するBackend evidenceは未確定であり、再描画時のoriginal order preservation、ID mapping、order versionをVersioning / Backend Contractで確認する。

## 18. Accessibility

Domain Orderはscreen reader向けdefault reading orderやdocumentation consistencyのplanning inputになり得る。ただし実際のDOM、keyboard flow、heading order、task priorityが優先される。UI overrideではaccessible reading order impactを必須記録候補とする。

## 19. Documentation Impact

同じ6軸を異なる順で列挙すると比較・review・onboardingの認知負荷が増える。Canonical Orderの最も確実な価値はdocumentation / metadataのstable listingである。承認後はProduct / Architecture / Analysis docsでCanonical Orderをdefaultとし、別orderにはpurpose labelを付けるProposalとする。

## 20. Axis Independence

6 Axesは独立したsemantic dimensionsであり、Candidate Aの隣接関係にcausal dependenceや優先度を持たせない。Canonical Orderは`representational convention`であって、rank、importance、weight、processing dependency、journey inevitabilityではない。

## 21. Canonical Order Necessity

Canonical Order Needed?: `YES_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`。

根拠はdocumentation consistency、metadata default、accessibility planning、Radar comparability、fixture/test drift抑制。CO-0は自由度が高いがdriftを固定化し、CO-1はoverrideの正当な例外を扱いにくい。CO-2「Domain default + explicit feature override」を推奨する。

## 22. Canonical Order Semantics

Recommended semantics: `DOMAIN_CONCEPTUAL_ORDER / READY_FOR_DECISION / NOT_APPROVED`。

Serialization-neutralなProduct Domainの標準概念列挙順 / default representational orderとする。`DEFAULT_PRESENTATION_ORDER`には利用できるが同一ではない。`USER_JOURNEY_ORDER`、`ANALYSIS_ORDER`、`HYBRID`は不採用推奨。

## 23. Recommended Candidate

Candidate Aを第一推奨し、Statusは`READY_FOR_DECISION / NOT_APPROVED`。Historical Product listingと正式6-axis Semantic Contractの列挙に整合し、Candidate B–Dよりfeature / journey / analysis neutralである。Active UIとのmigration costはあるため承認と実装を分離する。

## 24. Override Policy

OP-Bを推奨し、`READY_FOR_DECISION / NOT_APPROVED`。

Domain Canonical Orderをdefaultとし、feature-specific semanticsがある場合のみoverrideを許可する。Overrideにはreason、owner、explicit configuration、accessibility impact、Radar comparability、review / removal conditionを要求し、raw array insertion orderによるimplicit overrideを禁止候補とする。

## 25. Metadata Representation

OM-Bのordered Canonical ID listをsingle source of truthとして推奨する。各Axis metadataにnumeric `order`を複製するOM-Aや、両方を持つOM-Cはdriftを生む。Source例は`canonicalAxisOrder = [valueProposition, informationHierarchy, userFlowQuality, trustStructure, differentiationClarity, decisionSupport]`だが、本Phaseでは実装しない。

## 26. Product Owner Questions

1. Canonical Orderは必要か。
2. Domainの標準概念列挙順とするか。
3. UI Display Orderのdefaultにも使うか。
4. Feature overrideを許可するか。
5. Overrideに理由・ownerを必須とするか。
6. 同一比較文脈のRadarを統一するか。
7. Documentationでは常にdefault利用するか。
8. User Journey Orderをcanonicalから除外するか。
9. Causal / priority / weight意味を持たせないか。
10. Order変更をVersion対象にするか。
11. Snapshot lineageへID / order metadataが必要か。
12. Backend array positionへ意味を持たせないか。
13. Axis metadataへnumeric orderを持たせるか。
14. Ordered ID listをsingle source of truthとするか。

## 27. Decision Readiness

| Decision | Readiness |
| --- | --- |
| Canonical Order Necessity | `READY_FOR_DECISION / NOT_APPROVED` |
| Canonical Order Semantics | `READY_FOR_DECISION / NOT_APPROVED` |
| Candidate A | `READY_FOR_DECISION / NOT_APPROVED` |
| Override Policy OP-B | `READY_FOR_DECISION / NOT_APPROVED` |

Recommended AccountableはProduct Owner。ConsultedはAnalysis/Data Owner、Frontend、Design、Backend/API。

## 28. Versioning Dependency

Canonical Orderが承認された後、Order変更がBreaking Product Semantic ChangeかPresentation-only ChangeかをVersioning Phaseで判断する。Snapshot lineage、Radar shape、documentation、override historyが入力になる。Versioningは`NEEDS_DISCOVERY`を維持する。

## 29. Remaining

- Canonical Order Necessity / Semantics / Candidate / OverrideのProduct Owner Decision Review
- Canonical Order implementationとactive A順からのmigration assessment
- Radar comparability / visual regression
- Snapshot order lineage evidence
- Versioning: `NEEDS_DISCOVERY`
- Backend Wire ID / PD-02C / PD-02D: `BLOCKED`
- PD-02B / PD-02: `NEEDS_DISCOVERY`

次PhaseはPD-22 Canonical Order Decision Reviewを推奨する。Alternative AはSnapshot Order Lineage Evidence Workshop、Alternative BはVersioning Discovery。

## 30. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-20 Approval Record](./78-pd02b-remaining-five-axis-definitions-explicit-approval-record.md)
- [PD-8 Axis Identity Discovery](./66-pd02b-canonical-axis-identity-discovery.md)
- [Self Overview Audit](./48-self-analysis-overview-panel-analysis.md)
- [Competitor Expanded Audit](./46-competitor-expanded-card-analysis.md)
- [PD-17 Funnel Approval](./75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Development Log](../DEVELOPMENT_LOG.md)
- Historical Product candidate: `src/lib/db/role/Archive/Panoptes_Strategic_Engine_Complete_Spec_v1.txt`
- Active Self order: `src/lib/components/ComponentsBase/Self/data/self-analysis-overview-presentation.ts`
- Active Competitor order: `src/lib/components/ComponentsBase/Competitor/data/competitor-card-presentation.ts`
- Fixture / runtime order: `src/lib/db/dummy/panoptes_dummy_ui.ts` and `panoptes_dummy_seed_v1_1_mapping_aligned.json`
- Mock C order: `src/lib/panoptes/api/mock/snapshot-factory.ts`

## Quality Result

- `npm run check`: PASS（0 errors / 0 warnings）
- `npm run lint`: PASS（0 errors / 38 warnings）
- `npm run format:check`: PASS
- `npm run check:openapi`: PASS（18 operations / 18 unique operationIds）
- `npm run check:frontend-inventory`: PASS（reusable 124、ACTIVE_CANONICAL 119、unresolved imports 0、cycles 0）
- `npm run test`: PASS（22 files / 257 tests）
- `npm run test:auth-smoke`: PASS（5 cases）
- `npm run build`: PASS
- `npm run test:secrets`: PASS（63 build files scanned）
- `npm run test:smoke`: PASS（10 routes）
- `npm run quality`: PASS（exit 0）
