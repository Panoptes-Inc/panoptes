# Phase PD-17 — PD-02B Funnel Axis Explicit Product Owner Approval Record

更新日: 2026-08-20  
Decision: PD-02B Funnel Axis Definition & Canonical ID  
Approval Status: `APPROVED`

## 1. Scope

PD-16でDecision-readyとなった「導線強度」のFormal Product DefinitionとCanonical ID `userFlowQuality`に対するProduct Ownerの明示承認を正式なDecision Recordへ反映する。新規Discovery、source implementation、Canonical Order、他5軸Definition、Versioning、Backend Wire ID、Formula、Missing / Partial contractは対象外とする。

## 2. Previous State

- PD-02 parent / PD-02B: `NEEDS_DISCOVERY`
- Funnel Definition: `READY_FOR_DECISION / NOT_APPROVED`
- `userFlowQuality`: `READY_FOR_DECISION / NOT_APPROVED`
- `funnelStrength`: `NOT_CANONICAL / RENAME_CANDIDATE`
- Canonical IDs: `5 / 6 DECIDED / NEEDS_DISCOVERY`

## 3. Approval Evidence

> PD-02BのFunnel Axis Definition & Canonical ID Proposalを承認する。

これはCodex recommendationではなく、Phase PD-17指示書に記録されたProduct Owner本人の明示承認として扱う。

## 4. Approval Date

2026-08-20

## 5. Decision Owner

Product Owner

## 6. Funnel Definition

Canonical Label: 導線強度  
Formal Definition:

> ユーザーが次に取るべきActionを識別でき、CTA・リンク・ナビゲーション・ページ遷移によって、主要な目的地点までの経路が途切れず接続されている度合い。

Status: `DECIDED`

## 7. Included Semantics

- CTA existence / placement / progression / destination clarity
- Internal links / internal navigation reachability
- Major user path continuity
- Page-to-page transitions
- Next-action visibility
- Stage-to-stage connection
- Dead-end avoidance
- Conversion path structure

Conversion PathはAxisの一部だが、Axis全体をConversion Funnelへ限定しない。

## 8. Excluded Semantics

- Actual CTR / CVR
- Session behavior / analytics-derived behavioral performance
- Attribution
- Revenue conversion / lead quality
- CRM stage / sales pipeline
- Off-site customer journey
- Actual user decision outcome

## 9. Primary Evaluation Object

Primary Evaluation Object: `User Path / Page Sequence`。Supporting ObjectsはCTA、Link、Navigation、Page Transition、Stage-to-stage Connectionとする。単一UI elementではなく、主要path全体の接続性を評価する。

## 10. Structural / Behavioral Boundary

評価対象は`Observable Structural Support`であり、`Behavioral Performance`は評価しない。実際にユーザーがpathを利用したかではなく、ユーザーが進める構造がWeb上に存在するかを評価する。Status: `DECIDED`。

## 11. Information Hierarchy Boundary

`informationHierarchy`は情報の順序、grouping、heading/content structureを所有する。`userFlowQuality`は情報・ページ間を通じて次Action・次destinationへ進めるpathを所有する。

## 12. Decision Support Boundary

`decisionSupport`は判断に必要な情報と比較・選択材料を所有する。`userFlowQuality`は判断中または判断後に次Actionへ移動できるpathを所有する。

## 13. Value Proposition Boundary

`valueProposition`はProduct / Serviceの価値・benefitの伝達を所有する。`userFlowQuality`は価値理解後に次Actionへ進める構造を所有する。

## 14. Trust Structure Boundary

`trustStructure`はproof、credibility、authorityの存在・構造を所有する。`userFlowQuality`はproofへの到達と確認後の次Actionへのpathを所有する。

## 15. Differentiation Boundary

`differentiationClarity`は競合との差異・独自性の明確な伝達を所有する。`userFlowQuality`はその理解を次Actionへ接続する構造を所有する。

## 16. `userFlowQuality` Decision

Canonical ID: `userFlowQuality`  
Format: `camelCase`  
Status: `DECIDED`

Actual User Behaviorではなく、Website上で観測可能なUser Path / Page Sequenceのstructural qualityを意味する。continuity、reachability、next-action support、transition structure、structural completenessを包含する。

## 17. `funnelStrength` Status

Final status: `NOT_CANONICAL / RENAME_CANDIDATE / LEGACY_MIGRATION_SOURCE`。Conversion Funnelへ意味を狭めるためCanonical IDには採用しない。本Phaseではsourceをrenameせず、将来migrationのcompatibility sourceとしてのみ扱う。

## 18. 1 Axis = 1 ID Consistency

導線強度の唯一のCanonical IDは`userFlowQuality`である。`funnelStrength`をcanonical aliasとして併存させないため、PD-14でDECIDED済みの`1 Formal Axis Identity = 1 Canonical ID` policyと整合する。

## 19. Canonical ID 6 / 6 Status

| Canonical Label | Canonical ID | Status |
| --- | --- | --- |
| 価値訴求 | `valueProposition` | `DECIDED` |
| 情報階層 | `informationHierarchy` | `DECIDED` |
| 導線強度 | `userFlowQuality` | `DECIDED` |
| 信頼構造 | `trustStructure` | `DECIDED` |
| 差別化明確性 | `differentiationClarity` | `DECIDED` |
| 意思決定支援 | `decisionSupport` | `DECIDED` |

Canonical ID decided countは`5 / 6`から`6 / 6`へ、overallは`NEEDS_DISCOVERY`から`DECIDED`へ遷移した。

## 20. Legacy Migration Considerations

将来の実装Phaseでは次の順序を候補とする。

1. Canonical Axis metadata
2. compatibility mapping
3. fixture key migration
4. mapping migration
5. test migration
6. legacy alias removal

本Phaseではいずれも実装しない。

## 21. PD-02C Handoff

PD-02CはFormal Common 6 Axis Domain IDsを正式参照できる。ただしFormula、Weight、Aggregation、Backend schema、Backend Wire ID、Validation、Versioningは未決定で、Backend implementationは開始しない。

## 22. PD-02D Handoff

PD-02Dはmissing / partial対象のAxisを6つのCanonical IDsで完全識別できる。ただしmissing representation、null behavior、fallback、completeness metadata、`partially_completed` semantics、Backend schemaは未決定である。

## 23. Standardization Impact

Planning levelでFull 6-axis canonical metadata、common Axis identifier type、canonical/short-label lookup、stable accessibility identifiers、Self / Competitor mapping normalization、Industry alignment、Axis-aware shared presentation contract、Funnel legacy migrationを新たに解禁する。

Source implementation、Canonical Order、他5軸Definition、Formula、Weight、Threshold、Semantic Color、Missing / Partial UI、Backend Wire ID/schema、Versioned Axis Contractは引き続きblockedとする。

## 24. Remaining PD-02B Items

- Canonical Order: `NEEDS_DISCOVERY`
- Other five Axis Definitions: `NEEDS_DISCOVERY`
- Versioning: `NEEDS_DISCOVERY`
- Backend Wire ID: `BLOCKED`
- PD-02B overall: `NEEDS_DISCOVERY`
- PD-02 parent: `NEEDS_DISCOVERY`

Recommended next Product Decision / PhaseはCanonical Order Discoveryとする。Alternative AはRemaining Five Axis Definitions Discovery、Alternative BはVersioning Discoveryとする。

## 25. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-16 Decision Review](./74-pd02b-funnel-axis-definition-canonical-id-decision-review.md)
- [PD-15 Evidence Workshop](./73-pd02b-funnel-axis-definition-evidence-workshop.md)
- [PD-14 Five Canonical IDs Approval Record](./72-pd02b-five-canonical-ids-explicit-approval-record.md)
- [PD-12 Canonical ID Discovery](./70-pd02b-canonical-id-funnel-naming-discovery.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Development Log](../DEVELOPMENT_LOG.md)

## Quality Result

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
