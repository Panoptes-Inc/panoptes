# 依存関係マップ

## 現行主経路

```mermaid
flowchart LR
  Routes[src/routes/app] --> Entry[PanoptesShellEntryPage]
  Entry --> Shell[PanoptesShellPage]
  Entry --> Dummy[src/lib/db/dummy]
  Shell --> Actions[src/lib/panoptes/actions]
  Shell --> Stores[src/lib/panoptes/stores]
  Shell --> Selectors[src/lib/panoptes/selectors]
  Actions --> Api[panoptes/api/client]
  Actions --> Domain[panoptes/domain]
  Domain --> Types[panoptes/types.ts]
  Selectors --> Stores
  Api --> Mock[mock-backend]
  Mock --> BrowserStorage[(localStorage)]
  Api --> SameOrigin[/api/*]
  Shell --> Surfaces[analysis/snapshot UI]
  Surfaces --> LegacyVM[Competitor/industry/Self/Strategy view models]
```

この経路は概ね一方向で、静的import cycleは確認できませんでした。ただし`client.ts`が常にmock implementationもimportするため、production buildでもmock codeがbundle候補になります。環境分岐をserver側またはdynamic importへ移す余地があります。

## 主要参照数

- `PanoptesSiteHeader`: 4 direct imports（root/app/lp/plan layout）
- `PanoptesShellEntryPage`: 2 routes
- `LandingHeroPrimarySection` / `SecondarySection`: 各3 layouts
- `PanoptesSnapshotSurface`、`PanoptesAnalysisSurface`、`PanoptesTabNav`: 各3 imports
- それ以外の多くは1 importで、feature treeに強く閉じている。

## 深いimportと結合

- `$lib` aliasは一貫して利用される領域と、`../../..` relative wrapperが混在する。
- 壊れたimportはadmin wrapper 6件とparts wrapper 2件。後者は現在到達不能。
- `PanoptesShellPage`はactions 3群、stores 5群、selectors 5種、UI 8種へ直接依存し、composition rootとして妥当な面と、変更集中点という面がある。
- `PanoptesSnapshotSurface`からstrategy tabへ20超のprops/callbackを伝播し、その先のrail/roadmapへ渡すためprops drillingが深い。
- UIから`src/lib/db/dummy/panoptes_dummy_ui.ts`への直接依存が`PanoptesShellEntryPage`にある。production fallbackとdummyの境界が曖昧。
- `SignUpForm`はUIからSupabase clientと`/api/waitlist/join`へ直接接続するが、routeからは到達不能。

## server/client境界

server-only moduleは0件です。`$env/dynamic/public` と`$env/static/public`だけを使い、private env importはありません。browser-only accessは`$app/environment.browser`でguardされたmock/project persistenceと、componentの`onMount`/`$effect`内DOM操作です。

## barrel export

`src/lib/index.js`は空でbarrelとして機能していません。現在はdeep importが明示的で依存は追いやすいものの、component pathが長く、directory再編の影響が大きいです。全体barrelを作るより、featureごとのpublic entry pointだけを限定して作る方が安全です。
# Historical baseline notice

This dependency map is retained as the initial audit record. The current graph is [`frontend-active-graph.md`](../architecture/frontend-active-graph.md), regenerated and verified in Phase B-3P.

