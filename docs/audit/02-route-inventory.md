# SvelteKit ルート棚卸し

server load、form action、API route、`hooks.*` は全て0件です。認証guardもありません。

| URL | files / layout | 目的・利用UI | data/state | 到達性・状態 |
|---|---|---|---|---|
| `/` | `src/routes/+page.svelte`（空）、root layout | LP。root layoutがHeaderと2つのLanding heroを常時描画 | `$page`のみ | Headerから到達。page自体は空 |
| `/lp` | `src/routes/lp/+page.svelte`（空）、`lp/+layout.svelte` | `/`と同じLP | `$page`のみ | 内部linkなし。root layoutと子layoutが同じLP UIを重ねて描画する可能性 |
| `/plan` | `src/routes/plan/+page.svelte`（空）、`plan/+layout.svelte` | 現状LPの複製 | `$page`のみ | 内部linkなし。`/lp`とlayout完全一致 |
| `/admin` | `src/routes/admin/+page.svelte` | admin console/dashboard/log placeholder | dummy admin data、local `$state` | auth不要でURL直打ち可能。解決不能importによりbuild破損 |
| `/app` | `src/routes/app/+page.svelte` + app layout | Panoptes shellとtop hero | 6 writable stores、selectors、API client | Headerから到達。production API routeは未実装 |
| `/app/analysis` | page + 空layout | `/app`と同じ`PanoptesShellEntryPage` | `/app`と同一 | search barの`goto`で到達。page内容は完全重複 |
| `/app/dev/ui` | page | top/analysis/snapshot/adminの総合preview | mock snapshot、local runes | navigationなし。dev専用だがproduction routeから除外されない。admin broken importを含む |
| `/app/login/settings` | page | Svelte starter placeholder | なし | navigationなし。仮実装、外部docs linkのみ |
| `/dev/analysis-preview` | 259行page | loading UI各stageのpreview | local `$state`、mock data | navigationなし。production routeから除外されない |

## レイアウト継承

- root `+layout.svelte` は `/app` と `/admin` 以外でLP用Header/Heroを描画する。
- `/lp` と `/plan` のlayoutも同じHeader/Heroを描画するため、親子で二重描画となる構造。
- `/app/+layout.svelte` はfixed header、`padding-top:88px`、`min-height:100dvh`を持つ。`/app/analysis/+layout.svelte` はchildrenをrenderするだけ。

## ナビゲーション整合性

`PanoptesSiteHeader.svelte:58-69` は `/`、`/app`、`/app/survey`、`/app/contact`、`/app/share`、`/app/login` を示します。survey/contact/loginは`preventDefault()`でmodalを開くため通常clickでは404になりませんが、リンク先route自体は存在しません。shareはpreventDefaultがなくrouteもないため404になります。

内部navigationから到達できない実在routeは `/lp`、`/plan`、`/admin`、`/app/dev/ui`、`/app/login/settings`、`/dev/analysis-preview` です。空directory `/app/contact`、`history`、`plan`、`share`、`survey` などはrouteではありません。

## 認証・想定ユーザー

コード上の認証要否は全route「なし」です。意図としては `/admin` が管理者、`/app*` が利用者向けと推測されますが、これは名称/UIからの推測であり、server-side enforcementはありません。

## scroll / responsive

- app layoutはdocument scroll主体。shell内にgrid、preview/admin stageに`overflow:auto`がある。
- loading previewは`100vh`、app/admin/modalは`100dvh`を併用。
- headerはfixed、analysis overlayはsticky、sheet/modal/toastはfixed。
- media queryは多数あるが、headerは980px以下で一部linkを隠すのみでmobile navigation代替がない。
- `zoom`をLanding hero 2件とshell 1件で利用しており、200% zoomやブラウザ差に弱い。

