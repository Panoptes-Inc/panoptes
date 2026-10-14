# Component Cleanup Backlog

更新日: 2026-08-07

## B-1で完了

- 旧監査25件を現行route/import graphで再判定
- Signup buttonをroot正本へ直接import化
- 透過wrapper 2件と0 byte placeholder 4件を削除
- production / protected / dev-only / legacy graphを文書化
- Rails/API/auth/Organization境界は変更なし

## B-2: Snapshot legacy統合（2026-08-07完了）

比較・移植・旧11件の削除結果は`21-snapshot-component-comparison.md`、`snapshot-field-mapping.csv`、`22-phase-b2-implementation.md`を正本とする。

1. competitor旧2件と現行`CompetitorAnalysis*`群のfield・interaction・visual対応表を作る
2. industry旧6件と現行`IndustryAnalysis*`群のfield・fallback・visual対応表を作る
3. self旧3件と現行`SelfAnalysis*`群のfield・score・radar・recommendation対応表を作る
4. `/app/analysis`とdevelopment previewで同じpayloadを使った画面比較を行う
5. 旧実装にしかない必須表示を現行正本へ小さく移植する
6. product owner確認後、参照0を再確認して旧11件を削除する

完了条件: props contract、表示field、interaction、responsive差分が承認され、quality gateが通ること。

## B-2: Strategy rail判断

優先度: high / product decision required

- `StrategyAnalysisPlanRail`のstrategy key選択と、現行`StrategyAnalysisProjectRail`のproject ID選択が同じ概念か決定する
- day/progress/priority/fit score/statusをproject sidebarへ残す必要があるか決定する
- 同一概念ならview modelを一本化して現行railへ統合する
- 別概念ならplan railを現行画面へ復帰させる要件と配置を定義する
- どちらも不要と承認された場合のみ親子2件を削除する

## 後続の低優先度整理

- `admin/AdminConsole.svelte`互換entryの外部利用有無を再確認し、不要ならrouteをroot正本へ直接import化する
- `/app/login/settings`のscaffoldを正式機能化するかroute廃止するか決定する
- component inventoryを全件再生成し、B-1で削除した6件と新しい到達性を反映する
- warning baseline 93を領域別に減らす。B-1では増加させない

## 今回扱わない事項

- コンポーネント全面再編、directory一括移動
- Tailwind移行
- Rails API契約変更
- Auth・Role・Organization policy変更
- Snapshot UIの見た目変更
