# Phase PD-9 — PD-02B Axis Set & Label Identity Decision Review

Date: 2026-08-20  
Status: Completed / `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`  
PD-02B: `NEEDS_DISCOVERY`

## 1. Scope

PD-8で`READY_FOR_DECISION`となったAxis Set、Canonical Label、Short Label、Semantic EquivalenceだけをReviewした。Canonical ID、order、definition、versioning、Backend Wire IDは決定範囲外とした。

## 2. Evidence

PD-6/7/8の正本、Self/Competitor/Industry関連audit、Frontend Structure Policyを再確認した。SelfとCompetitorは同じ6 positionsを使い、Industry fixtureも同一6 conceptsを持つ。Strategyにはraw six-axis collectionがない。

## 3. Axis Set options

- AS-A: current six-axis setをFormal Common Axis Setにする。
- AS-B: provisional setのままformal decisionを延期する。
- AS-C: axis set自体を再設計する。

AS-Aが最も強くevidenceを持つ。AS-Bはstandardizationを解禁できず、AS-Cに必要な追加/削除evidenceは見つかっていない。

## 4. Axis Set decision

Recommendation: AS-A。Product Ownerの明示承認がないためDecisionは未確定で、Axis Setは`READY_FOR_DECISION`を維持する。

## 5. Canonical Label decision

推奨full labelsは価値訴求、情報階層、導線強度、信頼構造、差別化明確性、意思決定支援。承認がないため`READY_FOR_DECISION`。

## 6. Short Label options

Full label only、governed full + short labels、feature-local arbitrary labelsを比較した。限られたpresentation aliasとしてgoverned short labelを許可する案を推奨する。

## 7. Short Label decision

Recommendation: YES。Short labelは同一Axis IdentityのPresentation Aliasであり、別axis・別concept・別scoreではない。未承認のため`READY_FOR_DECISION`。

## 8. Semantic Equivalence

`差別化`を`差別化明確性`のshort label、`意思決定`を`意思決定支援`のshort labelとする案を推奨する。未承認のため正式な`SAME_SEMANTICS`へは昇格しない。

## 9. Self / Competitor relation

同一Formal Common 6 Axis Identityを使う案を推奨する。score value、calculation、evidence、presentation、feature compositionは同一化しない。

## 10. Industry relation

同一6 Axis Conceptへ整合する方向を推奨する。現在はfixture中心のためBackend/API contract、real-data schema、canonical orderは未決定のままとする。

## 11. Strategy exclusion

StrategyをCommon 6 Axisの直接consumerとして定義しない。impact、fit、priority、progressは別metricである。

## 12. Product Owner decision

`NOT_PROVIDED`。Phase指示書は承認を条件としているが、承認文、承認者名、Decision Dateは提示されていない。Codexの推奨だけで`DECIDED`にしない。

## 13. Rationale

現行表示とdesign evidenceは推奨案に十分だが、Product semanticsの正式決定権限を代替しない。推奨案と承認済みcontractを分離する。

## 14. Canonical ID exclusion

Candidate keysをcanonical IDとして採用しない。特に`funnelStrength`は`RENAME_CANDIDATE`を維持する。

## 15. Order exclusion

Canonical OrderとFeature overrideは決定しない。P/A conflictとProduct rationaleが残る。

## 16. Definition exclusion

6 labelの正式definition、included/excluded evidence、隣接軸との境界、examplesは次Discoveryに残す。

## 17. Versioning exclusion

Axis meaning version、formula version、Backend schema versionの関係は`NEEDS_DISCOVERY`。

## 18. Backend blocker

Backend Wire IDは`BLOCKED`。Frontend candidate keyをenum、object key、API stringとして固定しない。

## 19. Standardization impact

明示承認後はCommon Axis metadata concept、canonical Japanese label metadata、short-label metadata、Self/Competitor label alignment planning、shared chart label planning、axis-aware accessibility namingが解禁候補になる。本Phaseでsource standardizationは行わない。

## 20. Remaining

Product Owner approval、Canonical ID、`funnelStrength` rename、Canonical Order、Axis Definitions、Versioning、Backend Wire IDが残る。Source label/key/order、enum、shared Axis component、Backend schema、semantic color、formula/threshold helperは停止する。

### Quality results

- `npm run check`: PASS（0 errors / 0 warnings）
- `npm run lint`: PASS（0 errors / 38 warnings）
- `npm run format:check`: PASS
- `npm run check:openapi`: PASS（18 operations / 18 unique operationIds）
- `npm run check:frontend-inventory`: PASS（production routes 8 / unresolved imports 0 / cycles 0）
- `npm run test`: PASS（22 files / 257 tests）
- `npm run build`: PASS
- `npm run test:secrets`: PASS（63 build files）
- `npm run test:smoke`: PASS
- `npm run quality`: PASS（exit 0、`test:auth-smoke`を含む）

## 21. References

- [Score / Axis Data Dictionary](../product/score-axis-data-dictionary.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-6 Discovery](./64-pd02-score-common-axes-data-dictionary-discovery.md)
- [PD-7 Display Scale Decision](./65-pd02a-display-scale-presentation-boundary-decision.md)
- [PD-8 Axis Identity Discovery](./66-pd02b-canonical-axis-identity-discovery.md)
- [Self Analysis Audit](./48-self-analysis-overview-panel-analysis.md)
- [Competitor Analysis Audit](./46-competitor-expanded-card-analysis.md)
- [Snapshot Comparison](./21-snapshot-component-comparison.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
