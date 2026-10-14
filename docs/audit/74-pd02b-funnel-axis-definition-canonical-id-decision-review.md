# Phase PD-16 — PD-02B Funnel Axis Definition & Canonical ID Decision Review

更新日: 2026-08-20  
Decision: PD-02B Canonical Axis Identity  
Review status: `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`

## 1. Scope

本監査は、Formal Common Axis SetでDECIDED済みの「導線強度」について、Formal DefinitionとFrontend/Product Domain Canonical IDをProduct Ownerが個別に判断できるDecision Proposalへ確定する。Canonical Order、他5軸のDefinition、Versioning、Backend Wire ID、Formula、Weight、Threshold、Missing / Partial、Backend schemaは対象外とする。Source、fixture、Svelte、Rails、BFF、OpenAPIは変更しない。

## 2. Previous status

- PD-02B: `NEEDS_DISCOVERY`
- Funnel Axis Definition: `READY_FOR_DECISION / NOT_APPROVED`
- Funnel Axis Canonical ID: `READY_FOR_DECISION / NOT_APPROVED`
- `funnelStrength`: `NOT_CANONICAL / RENAME_CANDIDATE`
- `userFlowQuality`: `KEEP_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`
- Canonical IDs: `5 / 6 DECIDED`

## 3. Evidence summary

PD-15で、production presentation、設計文書、fixture、preview/test、legacy inputを横断確認した。EvidenceはCTA、CTA progression、internal links、navigation reachability、page continuity、major path completeness、dead-end avoidance、stage coverage、page transitionを一貫して示す。一方、CTR、CVR、session behavior、attribution、revenue、CRM / sales stage、off-site customer journey、actual user outcomeを測るcanonical production formulaは存在しない。したがって、現時点で支持されるのはWeb上のObservable Structural Supportであり、Behavioral Performanceではない。

## 4. Definition A

> ユーザーが次に取るべきActionを識別でき、CTA・リンク・ナビゲーション・ページ遷移によって、主要な目的地点までの経路が途切れず接続されている度合い。

Assessment: `STRONG`。CTAだけでなくnavigationとpage sequenceを含み、観測可能な構造として説明できる。第一推奨とする。

## 5. Definition B

> 主要Conversion Goalへ向けたFunnelが構成され、各Stage間の遷移が支援されている度合い。

Assessment: `PARTIAL / TOO_NARROW`。Conversion Funnelへ意味を限定し、一般的なnavigation、主要path、非conversion destinationを十分に表現しない。

## 6. Definition C

> サイト内の主要User Flowが、発見・理解・比較・行動まで連続的につながっている度合い。

Assessment: `STRONG_WITH_BOUNDARY`。「理解」はInformation Hierarchy / Value Propositionへ、「比較」はDecision Supportへ侵入し得る。Stage contentではなく、Stage間connectionを評価するという明示が必要である。

## 7. Recommended Definition

Formal Definition Proposal:

> ユーザーが次に取るべきActionを識別でき、CTA・リンク・ナビゲーション・ページ遷移によって、主要な目的地点までの経路が途切れず接続されている度合い。

この文言はDecision Proposalであり、Product Ownerの明示承認なしにDECIDEDとはしない。

## 8. Included semantics

- CTA existence / placement / progression / destination clarity
- internal links
- internal navigation reachability
- major user path continuity
- page-to-page transitions
- next-action visibility
- stage-to-stage connection
- dead-end avoidance
- conversion path structure

## 9. Excluded semantics

- actual CTR / CVR
- analytics-based behavior / session metrics
- attribution
- revenue conversion / lead quality
- CRM stage / sales pipeline
- off-site customer journey
- actual user outcome or behavioral performance

## 10. Primary evaluation object

Primary Evaluation Objectは`User Path / Page Sequence`とする。CTA、link、navigation、page transitionはSupporting Objectsであり、単一UI elementではなくpath全体の接続性を評価する。

## 11. Structural / Behavioral decision

Measurement natureは`Observable Structural Support`とする。「実際にユーザーが経路を利用したか」ではなく、「ユーザーが進める構造がWeb上に存在し、次のActionと主要目的地点までの接続が観測できるか」を評価する。`Behavioral Performance`は除外する。

## 12. Adjacent Axis boundaries

| Adjacent Axis | Adjacent Axisが所有するもの | Funnel Axisが所有するもの |
| --- | --- | --- |
| 情報階層 / `informationHierarchy` | 情報の順序、grouping、heading/content structure | 情報・ページ間を通じて次のActionへ進めるpath |
| 意思決定支援 / `decisionSupport` | 判断に必要な情報、比較・選択材料 | 判断中・判断後に次のActionへ移動できるpath |
| 価値訴求 / `valueProposition` | Product / Serviceの価値と理由 | 価値理解後に何をするかを接続するpath |
| 信頼構造 / `trustStructure` | Evidence / proofの存在と信頼判断支援 | Evidenceへの到達と確認後のActionへのpath |
| 差別化明確性 / `differentiationClarity` | 競合との差異・独自性の明確さ | 差異理解後のActionへのpath |

## 13. `funnelStrength` assessment

`funnelStrength`はconversion funnelを強く想起させ、internal navigation、general page path、next-action clarity、structural quality全体を十分に表現しない。Canonical IDとしてはrejectを推奨する。今回sourceは変更せず、正式statusは`NOT_CANONICAL / RENAME_CANDIDATE`、将来migrationのlegacy sourceとして保持する。

## 14. `userFlowQuality` assessment

Advantages:

- CTA、navigation、page transition、path continuityを包含できる。
- conversion pathをsubsetとして扱える。
- actual behaviorではなくstructural qualityとしてFormal Definitionで制御できる。
- `camelCase` policyおよび他5 Canonical IDsと粒度が近い。

Risks:

- actual user behavior、full customer journey、UX全体の品質と誤読され得る。

Risk control:

- metadataとDefinitionで`on-site`、`observable structural support`、behavior analytics excludedを明記する。

Assessment: `KEEP_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`。

## 15. Alternative IDs

| Candidate | Assessment |
| --- | --- |
| `siteFlowQuality` | Site内であることは明確だが、一般的なdomain termとして弱い。 |
| `pathwayQuality` | pathを示すが、Website/User contextが弱くgeneric。 |
| `pathContinuity` | structural natureは明確だが、CTA clarity / navigation qualityを狭める。 |
| `navigationQuality` | Web conceptとして理解しやすいが、CTA / conversion path / page sequenceをnavigationに縮小する。 |
| `flowQuality` | 短いが、data flow / application flowと混同しやすい。 |

## 16. Canonical ID recommendation

Canonical Label「導線強度」に対するFrontend/Product Domain Canonical IDは`userFlowQuality`を第一推奨とする。literal translationよりProduct semanticsを優先する。対象はclarity、continuity、completeness、reachability、structural supportの複合的qualityであり、`strength`より`quality`が適合する。

## 17. Product Owner Approval

- Approval Evidence: `NOT_PROVIDED`
- Product Owner Decision: `NOT_PROVIDED`
- Decision Owner: Product Owner（承認者として想定。記録なし）
- Decision Date: 未記録

本Phaseの入力には「PD-02BのFunnel Axis Definition & Canonical ID Proposalを承認する」等の明示承認がない。RecommendationをApprovalとして代用せず、DefinitionとIDは個別承認可能な状態で維持する。

## 18. Definition decision

- Recommendation: Definition Aを`APPROVE`
- Final status: `READY_FOR_DECISION / NOT_APPROVED`
- Status transition: なし

## 19. ID decision

- Recommendation: `userFlowQuality`を`APPROVE`
- Final status: `READY_FOR_DECISION / NOT_APPROVED`
- `funnelStrength`: `NOT_CANONICAL / RENAME_CANDIDATE`
- Status transition: なし

## 20. Canonical ID overall status

承認がないためCanonical IDは`5 / 6 DECIDED`、overallは`NEEDS_DISCOVERY`を維持する。`userFlowQuality`はまだ6番目のCanonical IDではなく、`funnelStrength`を別canonical aliasとして保持しないため、`1 Formal Axis Identity = 1 Canonical ID` policyとも矛盾しない。

## 21. Migration considerations

将来、Definitionと`userFlowQuality`が承認された場合のみ、次の段階移行を別実装Phaseで検討する。

1. canonical metadataの導入
2. `funnelStrength`から`userFlowQuality`へのcompatibility mapping
3. fixture migration
4. mapping migration
5. test update
6. legacy alias removal

本Phaseではrename、alias、type、fixture、mappingの実装を行わない。

## 22. PD-02C handoff

承認後は6つのFrontend/Product Domain IDsを参照可能になる。ただしFormula、aggregation、weight、Backend schema、Wire IDは未決定であり、PD-02Cの実装開始条件を満たしたとは判断しない。

## 23. PD-02D handoff

承認後はmissing / partial contractでFormal 6 Axisを完全識別するためのdomain identityが揃う。ただしrepresentation、completeness semantics、partial scoreの意味は未決定であり、PD-02Dは引き続き未完了とする。

## 24. Standardization impact

現時点で新たにunblockされたstandardizationはない。承認後はFull 6-axis canonical metadata、Axis identifier union/type、label / short-label lookup、accessibility identifiers、Self / Competitor mapping normalization、Industry alignment、fixture migrationのplanningを追加で解禁できる。Source implementation、Rails/BFF/OpenAPI、Formula、Wire ID、missing contractはなお別Decisionを要する。

## 25. Remaining

- DefinitionとCanonical IDに対するProduct Ownerの明示承認
- Canonical Order
- 他5軸のFormal Definitions
- Versioning
- Backend Wire ID
- PD-02C Formula / Backend Contract
- PD-02D Missing / Partial Contract

Recommended next Product DecisionはDefinitionと`userFlowQuality`の明示承認である。承認入力が得られた場合の次PhaseはPD-17 Explicit Product Owner Approval Recordを推奨する。代替AはAnalysis/Data Ownerによる追加Evidence Review、代替BはCanonical Order Discoveryとする。

## 26. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-15 Funnel Axis Definition Evidence Workshop](./73-pd02b-funnel-axis-definition-evidence-workshop.md)
- [PD-14 Five Canonical IDs Explicit Approval Record](./72-pd02b-five-canonical-ids-explicit-approval-record.md)
- [PD-12 Canonical ID & Funnel Naming Discovery](./70-pd02b-canonical-id-funnel-naming-discovery.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Development Log](../DEVELOPMENT_LOG.md)

## Quality result

- `npm run check`: PASS（0 errors / 0 warnings）
- `npm run lint`: PASS（0 errors / 38 warnings）
- `npm run format:check`: PASS
- `npm run check:openapi`: PASS（18 operations / 18 unique operationIds）
- `npm run check:frontend-inventory`: PASS（reusable 124、ACTIVE_CANONICAL 119、unresolved imports 0、cycles 0）
- `npm run test`: PASS（22 files / 257 tests）
- `npm run build`: PASS
- `npm run test:secrets`: PASS（63 build files）
- `npm run test:smoke`: PASS
- `npm run quality`: PASS（exit 0。`test:auth-smoke`を含む）

最初の独立`test:smoke`はbuildと並列実行したため、server output生成前にpreviewが起動して失敗した。build完了後の直列再実行および最終`quality`内の順序付き実行はいずれもPASSしており、route/runtime defectではなく実行順競合と判定した。
