# Phase PD-8 — PD-02B Canonical Axis Identity Discovery

Date: 2026-08-20  
Status: Completed / PD-02B `NEEDS_DISCOVERY`  
Parent: PD-02 `NEEDS_DISCOVERY`

## 1. Scope

共通6軸のconcept、label variant、candidate ID、order、Self/Competitor/Industry alignmentをDecision-readyに整理した。Label/key/type/order/source/fixture/Backendは変更していない。

## 2. Evidence

Active Frontend、dummy/mocks、current role design documents、historical Archive、PD-6/7正本、Self/Competitor/Industry/Snapshot auditsを調査した。Design/Archive documentをProduct Owner承認の代替にしていない。

## 3. Candidate axis set

候補は価値訴求、情報階層、導線強度、信頼構造、差別化明確性、意思決定支援。Current design documentsは同じ英語6 conceptをSelf/Competitor/Industry/Snapshotでstableとするが、Decision statusはcandidateである。

## 4. Label inventory

17 exact variantsを確認した。Full base 6、Industry `平均`6、Competitor short 2、fixture alternates `信頼根拠`/`差別化指数`、action/gap phrase `信頼補強`へ分類した。

## 5. Semantic equivalence

Base 4 labelsはsurface間で`SAME_SEMANTICS`。`差別化`/`差別化明確性`と`意思決定`/`意思決定支援`はposition、input、audit evidenceから`LIKELY_SAME`。Fixture alternatesは同一と断定しない。

## 6. Candidate ID review

5 keysは`KEEP_CANDIDATE`。`funnelStrength`だけはCTA/conversion funnelとinternal navigation/pathwayを同時に含み、English nameが日本語concept全域を表すか不明なため`RENAME_CANDIDATE`。Canonical IDは存在しない。

## 7. Axis order variants

P（design/historical Product candidate）、A（active Self/Competitor）、B（mock Industry）、C（mock Self）の4 variants。B/Cはfixture、Aのintentはunknown、Pは未承認Product candidateである。

## 8. Order policy options

O-Aはone canonical orderでcross-feature比較に強い。O-Bはfeature自由度が高いが比較を弱める。O-Cはoverride理由とgovernanceが必要。O-Aを推奨し、Pをfirst sequence candidateとするが未決定。

## 9. Full / short label model

`canonicalLabel` + optional governed `shortLabel`を提案する。`差別化`と`意思決定`をshort候補とし、同一IDを維持する。`平均`はcontext suffix、fixture alternatesはshortへ昇格しない。

## 10. Self alignment

Selfはfull 6 labelsとcandidate keysを持つcurrent reference surface。Order A。正式Product definitionやcross-layer enumは持たない。

## 11. Competitor alignment

CompetitorはSelfと同じ6 positions/order Aを使い、2件だけshort label。Radar値はaggregateからsynthetic derivationされるため、identity evidenceとformula approvalを分離する。

## 12. Industry alignment

Industry mockはfull labels + `平均`を持つがorder B。Dummy mappingはcandidate keysを利用する。Common six-axis intentionは強いが、現状はfixture contractである。

## 13. Strategy relation

Strategyはraw six-axis score collectionを持たずimpact stringsだけを使う。Canonical 6 Axis consumerへ昇格するかは決めない。Fit/proposal/roadmapは別metricのまま維持する。

## 14. Snapshot relation

Current Snapshotにcommon axis object/ID enumはない。将来AxisDefinitionをSnapshot contractへ利用可能だが、schema/typeはPD-02Cで扱う。

## 15. Canonical object draft

Documentation-onlyの`AxisDefinition`候補は`id`、`canonicalLabel`、optional `shortLabel`、`description`、`order`、optional `version`。Source typeは追加していない。

## 16. Description gaps

正式descriptionは必要。Funnelのnavigation/conversion範囲、DifferentiationとDecision Supportのcomparison overlap、TrustのFAQ範囲が未定義。Archive submetricはhistorical inputに限る。

## 17. Versioning

Axis meaning change時のID維持、axis contract version、formula versionとの関係は`NEEDS_DISCOVERY`。Backend wire/versionはPD-02C依存。

## 18. Decision questions

正式6軸、2 short pairs、`funnelStrength`、full/short labels、ID、order/override、definition、surface reuse、label change、Backend ID、versionの14問をData Dictionaryへ記録した。

## 19. Readiness

- `READY_FOR_DECISION`: Axis Set、Semantic Equivalence、Canonical Label、Short Label。
- `NEEDS_DISCOVERY`: Canonical ID、Canonical Order、Axis Definition、Versioning。
- `BLOCKED`: Backend Wire ID。
- PD-02B overall: `NEEDS_DISCOVERY`。

## 20. Dependencies

PD-02BはPD-02Cのformula output/Backend schemaとPD-02Dのmissing-axis identityに先行する。PD-02A 0–100 display contractは変更しない。

## 21. Standardization impact

決定後にcanonical axis type、label metadata/component、shared radar order、Self/Competitor consolidationを解禁可能。現在はsource identity/order統合、axis semantic color、Backend enum、formula helperをblockする。

## 22. Remaining

Product approval、`funnelStrength`代替concept、P/A order rationale、正式description、Backend wire ID、versioningが残る。Ready 4 sub-itemsだけを次Decision Reviewへ進める。

### Quality results

- `npm run check`: PASS（0 errors / 0 warnings）
- `npm run lint`: PASS（0 errors / 38 warnings）
- `npm run format:check`: PASS
- `npm run check:openapi`: PASS（18 operations / 18 unique operationIds）
- `npm run check:frontend-inventory`: PASS（unresolved imports 0 / cycles 0）
- `npm run test`: PASS（22 files / 257 tests）
- `npm run build`: PASS
- `npm run test:secrets`: PASS（63 build files）
- `npm run test:smoke`: PASS
- `npm run quality`: PASS（exit 0、`test:auth-smoke`を含む）

## 23. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-6 Discovery Audit](./64-pd02-score-common-axes-data-dictionary-discovery.md)
- [PD-7 Display Boundary Audit](./65-pd02a-display-scale-presentation-boundary-decision.md)
- [Self Overview Audit](./48-self-analysis-overview-panel-analysis.md)
- [Competitor Expanded Audit](./46-competitor-expanded-card-analysis.md)
- [Competitor Company Audit](./50-competitor-company-card-analysis.md)
- [Snapshot Comparison](./21-snapshot-component-comparison.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [MVP Spec Final Reviewed](../../src/lib/db/role/panoptes_mvp_spec_final_reviewed_v_1_0.md)
- [Master Spec v3.4](../../src/lib/db/role/panoptes_master_spec_v_3_4_strategy_os_db_feed_integrated.md)
- [Historical Strategic Engine Axis Draft](../../src/lib/db/role/Archive/Panoptes_Strategic_Engine_Complete_Spec_v1.txt)
