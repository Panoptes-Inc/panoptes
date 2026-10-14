# Phase B-2 Snapshot Component Comparison

実施日: 2026-08-07

## 結論

旧Snapshot 11件を表示要素単位で現行Feature component、View Model、`PanoptesAnalysisSnapshotPayload`、OpenAPIの`AnalysisSnapshot.payload`と比較した。最終判定は次のとおり。

- ALREADY_COVERED: 9件
- PORT: 2件
- DISCARD / REDESIGN_LATER / PRODUCT_DECISION: 0件
- DELETE_NO_PORT: 9件
- DELETE_AFTER_PORT: 2件
- KEEP_TEMPORARILY / DEFER: 0件

必要な移植とテスト後、旧11件はすべて削除した。Strategy Plan Rail 2件は変更していない。

## 正本

| Domain | Feature Container | Domain View / Composite | View Model |
|---|---|---|---|
| Competitor | `CompetitorAnalysisTab.svelte` | `CompetitorAnalysisCompanyCard`、`CompetitorAnalysisExpandedCard`、`CompetitorAnalysisRadarChart` | `competitor-analysis-view-model.ts` |
| Industry | `IndustryAnalysisTab.svelte` | `IndustryAnalysis*Section` → `industry/shared/*` | `industry-analysis-view-model.ts` |
| Self | `SelfAnalysisTab.svelte` | `SelfAnalysisOverviewPanel`、`SelfAnalysisComparisonPanel`、Evaluation / Recommendation | `self-analysis-view-model.ts` |

`PanoptesSnapshotSurface`はtab routingとSnapshot metadataの表示だけを担う。API fetch、Organization認可、polling、global state mutationはUI componentへ追加していない。

## 11件の最終処理

| Legacy component | Element decision | 最終処理 | 根拠 |
|---|---|---|---|
| `PanoptesCompetitorCard` | ALREADY_COVERED | DELETE_NO_PORT | 企業名、service、3 score、fit、選択、比較操作は現行card/gridが上位互換。 |
| `PanoptesCompetitorDetailPanel` | PORT | DELETE_AFTER_PORT | URL、insight、action、詳細開閉をView Modelとexpanded cardへ移植。 |
| `PanoptesIndustryDistributionPanel` | ALREADY_COVERED | DELETE_NO_PORT | primary/secondary分布、stats、leaders、insightを現行distribution shared群が表示。 |
| `PanoptesIndustryMarketTypeCard` | ALREADY_COVERED | DELETE_NO_PORT | type、confidence、description、detailを現行market type cardが表示。 |
| `PanoptesIndustryOpportunityPanel` | ALREADY_COVERED | DELETE_NO_PORT | lanes、gaps、actions、summary、insightを現行opportunity shared群が表示。 |
| `PanoptesIndustryPositionPanel` | ALREADY_COVERED | DELETE_NO_PORT | pressure、cards、matrix、insightを現行position shared群が表示。 |
| `PanoptesIndustryRatingPanel` | ALREADY_COVERED | DELETE_NO_PORT | metricsに加え、現行はpayloadのhighlights/insightも表示する。 |
| `PanoptesIndustrySignalPills` | ALREADY_COVERED | DELETE_NO_PORT | 現行signal pillsがsemantic listとaria-label付きで表示。 |
| `PanoptesSelfActionPanel` | PORT | DELETE_AFTER_PORT | breakdown/actionは既に存在。Self画面がStrategy改善案を流用しないよう、Self actionCardsを正本化。 |
| `PanoptesSelfRadarPanel` | ALREADY_COVERED | DELETE_NO_PORT | 6軸self/industry比較は現行comparison panelが表示。 |
| `PanoptesSelfScorePanel` | ALREADY_COVERED | DELETE_NO_PORT | overall、structure、visual、gap、strength、issue、detailは現行overviewが表示。 |

## Competitor比較

| 表示・操作 | Legacy | Current（変更後） | Decision |
|---|---|---|---|
| 競合名 / service名 | card/detail title | card/expanded title | ALREADY_COVERED |
| URL / CTA | detailの外部link | expanded cardの`URLを開く` | PORT |
| overall / structure / visual score | ring + bars | ring + bars | ALREADY_COVERED |
| 6軸score / radar | なし | 既存3 scoreからdisplay-only派生 | KEEP_CURRENT |
| fit / market type / tags | fit text | market position、type、descriptor badges | ALREADY_COVERED |
| insight / action | detail lists | expanded cardの2 column lists | PORT |
| 詳細表示 | 条件付きpanel | detail buttonでexpanded cardを開閉 | PORT |
| 複数比較 | なし | 最大2件のcompare stage | KEEP_CURRENT |
| Screenshot | fieldなし | fieldなし | ADD_TO_API_LATER（要件化時のみ） |
| loading/error/empty | 独自実装なし | Feature外側のSnapshot状態を維持。cards空でもcrashしない | KEEP_CURRENT |

Interactionはnative button/linkを維持し、Tab/Enter操作とfocusをブラウザ標準に委ねる。新しいURL linkは別tabで開き、`rel="noreferrer"`を指定する。

## Industry比較

現行`IndustryAnalysisViewModel`は`PanoptesIndustryData`そのものであり、API payloadから別名fieldへ再変換しない。Sectionは責務ごとのshared componentへ同じobjectを渡す。

| 領域 | Legacy要素 | Current | Decision |
|---|---|---|---|
| Overview | market type、confidence、説明、詳細、signal | MarketTypeCard + semantic SignalPills | ALREADY_COVERED |
| Rating | 6軸metric | metrics + highlights + insight | ALREADY_COVERED |
| Position | pressure、matrix、summary cards | matrix + summary stack + insight | ALREADY_COVERED |
| Distribution | primary/secondary、stats、leaders | ring cluster + summary + insight | ALREADY_COVERED |
| Opportunity | lanes、gap、action、battlefield、priority | lane grid + summary + insight | ALREADY_COVERED |
| Snapshot時刻 | legacy各panelにはなし | Surfaceのversion/date metadata | KEEP_CURRENT |

Distributionと現行業界UIの差は構成単位だけで、data欠落はない。Market Type CardとSignal Pillsは現行要件に必要で、すでにoverview正本に存在する。Opportunityのactionは業界機会の仮説であり、Strategyの実行Roadmapとは別責務。Positionは市場座標、Self Analysisは自社のscore差分であり責務が重ならない。Ratingのoverall score重複はなく、Industryはaxis評価、Selfは自社overallを表示する。

## Self比較と責務境界

| 領域 | Legacy | Current（変更後） | Decision |
|---|---|---|---|
| overall / structure / visual | score panel | overview gauge/cards | ALREADY_COVERED |
| gap badges | score panel | delta badges | MAP_EXISTING |
| strength / issue | score panel | TOP3 lists | ALREADY_COVERED |
| breakdown / finding | action panel | overview breakdown table | ALREADY_COVERED |
| 6軸radar / industry差 | radar panel | comparison panel | ALREADY_COVERED |
| analysis action candidate | action panelの`actionCards` | evaluation/recommendation表示を`self.actionCards`から生成 | PORT |
| execution plan / roadmap | なし | Strategy tabのみ | KEEP_CURRENT |
| confidence | fieldなし | fieldなし | ADD_TO_API_LATER（要件化時のみ） |

Selfは現状・差分・分析由来の改善候補までを表示する。承認済みStrategy proposal、phase task、進捗、実行状態はStrategyに限定する。B-2前はSelf recommendationが`strategy.improvements`を優先していたため、この依存を除去した。

## Visual / responsive比較

Legacyはrouteから到達せず、同一fixtureの実画面比較entryも存在しないため、旧画面はDOM/CSS/component構造で比較した。現行previewのブラウザ確認も試みたが、in-app browserのlocalhost URL policyが接続失敗pageからの復帰を拒否したため、実画面Screenshotは取得できなかった。

- Desktop / Tablet / Mobile: breakpoint、grid/flex、width、overflow、text wrappingをCSSで確認
- Competitor詳細: DOM条件分岐、native button/link、mobile 1 column ruleを確認
- Industry / Self: 全fieldのrender pathとresponsive ruleを静的に確認
- runtime render: `svelte-check`、production build、development auth smoke、route smokeで確認

旧CSSの見た目そのものは正本へ戻していない。現行Feature UIを正本とし、旧実装だけに存在した情報要素のみを移植したため、旧画面とのpixel一致を必要とする項目はない。主観的なvisual判断が必要な要素は移植・削除根拠にしていない。本格的なScreenshot比較はB-3 backlogへ送る。

## Accessibility

- current Industry shared群のsection `aria-label`、signalのsemantic listを維持
- score/radarは数値表示を併設し、色だけに依存しない
- chartには`aria-label`がある
- detail/compareはnative button、URLはnative anchor
- 新規a11y warningなし
- tooltip/modal/accordionは旧11件にも要件がなく、追加していない

## API契約

OpenAPIのSnapshot payloadは現時点で`type: object` / `additionalProperties: true`のMVP aggregateであり、各UI fieldはfrontendの`PanoptesAnalysisSnapshotPayload`で型付けされる。Rails/OpenAPIへfieldを追加していない。Screenshotとconfidenceは将来必要になった場合の`ADD_TO_API_LATER`として記録だけ行った。
