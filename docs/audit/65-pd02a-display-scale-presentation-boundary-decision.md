# Phase PD-7 — PD-02A Display Scale & Presentation Boundary Decision

Date: 2026-08-20  
Status: Completed / PD-02A `DECIDED`  
Parent: PD-02 `NEEDS_DISCOVERY`

## 1. Scope

Frontend display scale、render clamp、ring/bar/radar transformation、finite-number safetyの責任境界だけを判断した。Axis identity、formula、threshold、missing semantics、Backend schemaは対象外である。

## 2. Evidence

PD-6 Data Dictionary、Self/Competitor/Industry/Strategyのcurrent presentation、Frontend Structure Policyを確認した。Frontend sourceは変更していない。

## 3. Existing display scales

Self/Competitor aggregateとaxis、Industry fixture、Strategy fitは0–100を前提にする。Signed delta、0–1 market/matrix coordinate、progress/count/rankは別value familyである。

## 4. Option A assessment

Standard display scale 0–100はcurrent Product-facing UI、ring 0–360°、bar 0–100%、radar maximum 100のEvidenceと一致する。共通visualizationとuser interpretationの境界も明確になるため採用する。

## 5. Option B assessment

Feature-specific scaleをProduct-facing scoreへ要求するEvidenceはない。0–1値は別概念であり代替scaleの根拠にならない。共有UIと解釈を分岐させるため不採用とする。

## 6. Boundary Option P-A assessment

Presentationが既知のProduct scoreをvisualizationのためだけに変換する境界はStructure PolicyのView Model/Business State方針と一致するため採用する。

## 7. Boundary Option P-B assessment

FrontendによるProduct scoreのnormalize/correctはformula source of truth、Backend validation、説明可能性と衝突するため不採用とする。

## 8. Final recommendation

Option A + Option P-Aを推奨し、Phase指示の明示Decisionに基づき採用した。

## 9. Product Owner decision

Decision 1〜4を承認済みとして記録する。承認EvidenceはPhase PD-7指示書がPD-02AをProduct Owner承認対象として提示し、Registerへ`DECIDED`と記録するよう明示したことである。Decision dateは2026-08-20。

## 10. Display scale decision

Product-facing score/axisのFrontend display scaleは0–100。0/100をminimum/maximum displayed score以上の意味へ拡張しない。Backend raw/persisted scaleは未決定。

## 11. Clamp boundary

`visualDisplayValue = clamp(value, 0, 100)`をrendering safetyのため許可する。Product score correctionには使わない。

## 12. Raw value preservation

Clamp後の値でupstream input、payload、store、business valueを上書きしない。105を100%で描画してもraw/business evidenceは105のままである。

## 13. Ring responsibility

`clampedScore * 3.6deg`はPresentation transformation。Company 24°とExpanded 30° accentは対象外で現行維持する。

## 14. Bar responsibility

Clamped valueを0–100% widthへ変換することはPresentation responsibilityである。

## 15. Radar responsibility

Maximum 100をvisual scaleとし、valueをradius/coordinateへ変換できる。Axis identity/semantics/orderはPD-02Bへ残す。

## 16. Non-finite handling boundary

`NaN`、`Infinity`、`-Infinity`でcomponentを破綻させないことをUI safetyとして要求する。0、`—`、hideの意味選択はPD-02Dへ残す。

## 17. Product responsibilities

Score meaning、formula、aggregation、weight、threshold、axis semantics、missing meaning、normalization semantics、eligibility、rankingをProduct/Analysisが所有する。

## 18. Presentation responsibilities

Rendering clamp、percentage width、ring angle、radar coordinate、finite safety、formatted displayを所有する。Decimal/rounding ruleは未決定である。

## 19. Exclusions

Canonical ID/label/order、formula、weight、threshold、ranking、eligibility、semantic color、missing/partial meaning、Backend schema、historical heuristicは決定していない。

## 20. Standardization impact

Generic score container、percentage/ring visualization、radar max scale、visual clamp helper、score layout tokenは進行可能。Canonical axis component、semantic color/badge、threshold tone、missing UI、Product formula helperは引き続きblockする。Spacing/radius/typography/surface/shadowへの直接影響はない。

## 21. PD-02B/C/D

- PD-02B Canonical Axis Identity: `NEEDS_DISCOVERY`。
- PD-02C Score Formula & Backend Contract: `BLOCKED`。
- PD-02D Missing / Partial Score Contract: `BLOCKED`、PD-04依存。

## 22. Remaining

Axis identity/order、decimal/rounding、formula/Backend、missing/partial、semantic color、historical accent/heuristicの判断が残る。次はPD-02Bを推奨する。

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
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Competitor Company Card Audit](./50-competitor-company-card-analysis.md)
- [Competitor Expanded Card Audit](./46-competitor-expanded-card-analysis.md)
- [Self Overview Audit](./48-self-analysis-overview-panel-analysis.md)
