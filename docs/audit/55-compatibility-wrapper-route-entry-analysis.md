# Phase B-3R Compatibility Wrapper / Route Entry Analysis

更新日: 2026-08-18

## Scope and baseline

B-3Q完了時点の正本は、127 reusable Svelte、122 production reachable、119 `ACTIVE_CANONICAL`、3 `ACTIVE_WRAPPER`、3 `DEV_ONLY`、2 `DEFER`だった。本監査はproduction wrapper 3件、Marketing route entry 3件、App route entry 2件、`/app/analysis` pass-through layoutだけを対象とする。Product URL、UI、preview state、Auth・Organization境界は変更しない。

## Wrapper taxonomy

| Category | Purpose | Allowed responsibility | Keep when | Remove when |
| --- | --- | --- | --- | --- |
| `ROUTE_ENTRY_WRAPPER` | SvelteKit URLをfeature entryへ接続 | route data/paramsを正本へ渡す | URL契約またはroute固有data contractがある | URL廃止・redirectがProduct決定済み |
| `FEATURE_ENTRY_WRAPPER` | routeと複数UI責務の間のcomposition境界 | orchestration、mapping、feature-level state | 複数route共有または責務境界を明確化する | 単なる別名で利用者が正本を直接参照できる |
| `COMPATIBILITY_WRAPPER` | 公開済みimport pathの互換維持 | props/callback互換のみ | 外部consumerまたは移行中callerが確認できる | 全callerを把握し正本importへ移行済み |
| `PREVIEW_ALIAS_WRAPPER` | previewの用途名を与える | preview presetの選択 | alias自身がpresetやvisual contractを所有する | aliasが別のpreset componentへ透過するだけ |
| `LEGACY_WRAPPER` | 旧path/旧命名の一時維持 | 明示した期限と移行先だけ | 移行計画中で参照リスクが残る | 参照0かつ正本移行を検証済み |

`<Child {...props} />`だけでもsemantic/public boundaryがあれば保持し得る。一方、今回のcomponent wrapper 3件には独自markup、style、state、props変換、callback、feature ownership、fixture、export/barrel、確認可能な外部consumerがなかった。

## Production wrapper inventory

| Wrapper | Parent / production route | Child | Props / markup / script / style | Compatibility and external risk | Classification | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| `src/lib/components/ComponentsBase/admin/AdminConsole.svelte` | `/admin` page、dev UI preview | `ComponentsBase/AdminConsole.svelte` | `$props()`を全透過する7行。独自markup/style/authなし | package/barrel exportなし。workspace内callerは2件 | `REDUNDANT_WRAPPER` | `REPLACE_WITH_CANONICAL_IMPORT`後に削除 |
| `src/lib/components/ComponentsBase/dummy/AppTopDummy.svelte` | Primary Hero経由で`/`、`/lp`、`/plan` | `ComponentsBase/AppTopDummy.svelte` | `$props()`全透過。presetはchildが所有 | importはPrimary Heroの1件だけ | `REDUNDANT_WRAPPER` | 正本importへ置換後に削除 |
| `src/lib/components/ComponentsBase/dummy/AppResultsDummy.svelte` | Secondary Hero経由で`/`、`/lp`、`/plan` | `ComponentsBase/AppResultsDummy.svelte` | `$props()`全透過。presetはchildが所有 | importはSecondary Heroの1件だけ | `REDUNDANT_WRAPPER` | 正本importへ置換後に削除 |

### AdminConsole

root側`AdminConsole.svelte`がA-1で確定したAdmin composition正本であり、tabs/dashboard stateを所有する。小文字`admin/`側はroute entryでもauth boundaryでもなく、props変換もない。`/admin`の認可はserver route policyの責務であり、このaliasを残す根拠にはならない。

### AppTopDummy / AppResultsDummy comparison

| Concern | AppTopDummy canonical | AppResultsDummy canonical | Same? | Wrapper value |
| --- | --- | --- | --- | --- |
| Child | `PanoptesAppShellDummy` | `PanoptesAppShellDummy` | yes | alias側にはなし |
| Props | `activePath='/app'` | `activePath='/app'` | yes | alias側は全透過のみ |
| Preview mode | Header/Hero/Sidebar、industry tab | Headerあり、Hero/Sidebarなし、competitor tab | no | 差異はcanonical childが固定 |
| Route reachability | Marketing 3 route | Marketing 3 route | yes | aliasによる到達性価値なし |
| Visual semantics | top preview | results preview | no | root component名で既に表現 |
| Naming abstraction | Primary preview preset | Secondary preview preset | no | `dummy/` aliasは追加意味なし |

両者は同じshellを異なる固定propsで描画する別々のpreview componentであり、互いを統合しない。削除するのはその手前の透明aliasだけである。

## Route entry inventory

| Routes | Entry | Data | Classification | Decision |
| --- | --- | --- | --- | --- |
| `/`, `/lp`, `/plan` | `MarketingLandingPage` | なし | `ROUTE_ENTRY_WRAPPER` + `PRODUCT_DECISION_REQUIRED` | 3ファイルを保持 |
| `/app`, `/app/analysis` | `PanoptesShellEntryPage` | 同じ`activeOrganizationId` | `ROUTE_ENTRY_WRAPPER` + `PRODUCT_DECISION_REQUIRED` | 2ファイルを保持 |

route `+page.svelte`はSvelteKitのURL entry契約であり、通常のcomponent compatibility wrapperではない。Marketing 3 entryは同一sourceだが、B-3Qでcompositionは既に`MarketingLandingPage`へ共有済みである。追加wrapperは不要で、URL統合・redirectはProduct判断まで行わない。

App 2 entryも同一source、同一server data、paramsなし、pathnameによるtab選択なしで、`PanoptesShellEntryPage`を共有する正式なRoute Entry Patternである。`/app/analysis`へのnavigation sourceは存在するが、現在もshellの初期tabは`strategy`である。URL意味を推測して変更しない。

## `/app/analysis` pass-through layout

削除前のlayoutは`children`を受けて`{@render children()}`するだけで、import、CSS、context、load、auth、Organization処理を持たなかった。auth/Organizationはserver policy/root data、HeaderとApp shellは親`/app/+layout.svelte`が所有する。

分類は`REDUNDANT_PASS_THROUGH`。削除後もSvelteKitは`/app/+layout.svelte`を継承し、render DOM、CSS、auth、Organization dataの意味は変わらない。回帰テストで子layout不在、親layout存在、両App entryの共有正本利用を固定する。

## Duplicate / alias decisions

| Candidate | Classification | Decision |
| --- | --- | --- |
| Marketing route entry source | `KEEP_SEPARATE` route contracts / `SAFE_TO_SHARE` composition | entry保持、compositionは共有済み |
| App route entry source | `KEEP_SEPARATE` route contracts / `PRODUCT_DECISION_REQUIRED` | entry保持、既存shared componentを継続 |
| Admin compatibility alias | `SAFE_TO_INLINE` / `REDUNDANT_WRAPPER` | canonical importへ置換、削除 |
| Top/Results aliases | `SAFE_TO_INLINE` / `REDUNDANT_WRAPPER` | canonical importへ置換、削除 |
| Top vs Results canonical previews | `PRODUCT_SEMANTICS_DIFFER` | 別componentとして保持 |
| analysis pass-through layout | `SAFE_TO_INLINE` / `REDUNDANT_PASS_THROUGH` | 削除 |
| Competitor helpers | `SAFE_TO_SHARE`（B-3Oで実施済み） | 現状維持 |
| score / axis presentation | `PRODUCT_DECISION_REQUIRED` | 統合しない |

Inventory scriptはimport graph、route reachability、unresolved local import、cycle、明示wrapper classificationを検査する。byte-identical route entryは専用route ownership testで検査する。複雑なAST duplicate engineは本Phaseでは追加しない。

## Production `Dummy` naming

| Name | Classification | Note |
| --- | --- | --- |
| `PanoptesAppShellDummy` | `PREVIEW_COMPONENT` + `LEGACY_NAMING` | Marketing preview専用。actual app shellではない |
| `HeaderDummy` | `PREVIEW_COMPONENT` + `LEGACY_NAMING` | preview内部の表示部品 |
| `SearchBarDummy` | `PREVIEW_COMPONENT` + `LEGACY_NAMING` | preview内部の表示部品 |
| `AppTopDummy` | `PREVIEW_COMPONENT` + `LEGACY_NAMING` | top preset正本。削除したaliasとは別 |
| `AppResultsDummy` | `PREVIEW_COMPONENT` + `LEGACY_NAMING` | result preset正本。削除したaliasとは別 |

これらはproduction routeから見えるが実アプリのruntime/data flowではなくMarketing Previewを構成する。renameとpreview surfaceの大規模抽出はFrontend標準化へ送る。

## Delete candidates

| Candidate | Classification | Confidence | Safe now? | Reason |
| --- | --- | --- | --- | --- |
| `admin/AdminConsole.svelte` | `REDUNDANT_WRAPPER` | high | yes, deleted | 全callerと正本を確認、追加責務なし |
| `dummy/AppTopDummy.svelte` | `REDUNDANT_WRAPPER` | high | yes, deleted | caller 1件、presetはchild所有 |
| `dummy/AppResultsDummy.svelte` | `REDUNDANT_WRAPPER` | high | yes, deleted | caller 1件、presetはchild所有 |
| `/app/analysis/+layout.svelte` | `REDUNDANT_PASS_THROUGH` | high | yes, deleted | children透過以外の責務なし |

実装後の新規high-confidence delete candidateは0件。未使用と断定できないfileは削除していない。

## Decisions and deferred

- canonical importを原則とし、互換pathは確認可能なconsumerまたは移行契約がある場合だけ保持する。
- Route Entry Wrapper、Feature Entry、Component Compatibility Wrapperを別分類にする。
- Marketing PreviewからActual App Shellへ直接接続しない。既存preview presetと`PanoptesAppShellDummy`を維持する。
- Product URL統合、redirect、`/app/analysis`の意味、score/axis、Dummy rename、preview extractionは延期する。
- Rails、BFF、OpenAPI、AnalysisJob、Organization、Supabase Authは変更しない。

## References

- [B-3Q route ownership analysis](./53-marketing-app-route-ownership-analysis.md)
- [B-3Q implementation](./54-phase-b3q-route-ownership-refactor.md)
- [B-3R implementation](./56-phase-b3r-wrapper-consolidation.md)
- [Frontend route ownership](../architecture/frontend-route-ownership.md)
- [Frontend inventory summary](../inventory/frontend-inventory-summary.md)
