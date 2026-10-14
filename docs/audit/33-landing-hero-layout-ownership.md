# Phase B-3F Landing Hero Layout Ownership整理

## 結論

Landing Heroの所有者をLayoutからPageへ移した。`/`、`/lp`、`/plan`はそれぞれ`+page.svelte`がHeader、Primary Hero、Secondary Heroをこの順序で1回ずつ描画する。root `+layout.svelte`はfavicon、global CSS、childrenだけを所有し、不要になった`/lp`と`/plan`の子layoutは削除した。

Hero、SVG、copy、GSAP、responsive CSSは変更していない。`/lp`と`/plan`では親子layoutが同じHeroを描画していたため、修正前のPrimary/Secondary各2回から各1回になった。

## 修正前のroute構造

| Route | Layout Hero | Page Hero | Primary回数 | Secondary回数 | 現在の問題 |
|---|---|---|---:|---:|---|
| `/` | root layout | なし（空Page） | 1 | 1 | 回数は正常だがPage固有Heroをroot layoutが所有 |
| `/lp` | root layout + `/lp` layout | なし（空Page） | 2 | 2 | 親子layoutの二重描画 |
| `/plan` | root layout + `/plan` layout | なし（空Page） | 2 | 2 | 親子layoutの二重描画 |

SvelteKitはroot layoutとroute固有layoutを入れ子で描画する。`/lp/+layout.svelte`と`/plan/+layout.svelte`がroot layoutと同じHeader、Primary、Secondaryを再度renderしていたことが直接原因である。

## 修正前のHero import一覧

| File | Primary | Secondary | Header | Role |
|---|---:|---:|---:|---|
| `src/routes/+layout.svelte` | 1 | 1 | 1 | 全public routeへの注入 |
| `src/routes/lp/+layout.svelte` | 1 | 1 | 1 | `/lp`で重複注入 |
| `src/routes/plan/+layout.svelte` | 1 | 1 | 1 | `/plan`で重複注入 |

Dynamic import、barrel経由import、Page側importはなかった。

## Ownership判断

**Page ownership**を採用した。

- Heroは`/`、`/lp`、`/plan`の画面内容そのものであり、全routeに共通するShellではない。
- Root layoutがHeroを所有すると、login、Organization、将来のpublic routeへ条件分岐で漏れやすい。
- 子layoutで同じHeroを重ねる必要はなく、現在の3 Pageは同一表示を明示的に所有できる。
- Headerも3つのLanding PageがHero直前に1回所有する。Footerは現行Landing routeに存在しないため追加しない。
- 重複を隠すpathname条件ではなく、所有者を一つにすることで再発を防ぐ。

## 修正内容

- `src/routes/+layout.svelte`からpathname判定、Header、Primary、Secondaryのimport/renderを除去した。
- `src/routes/+page.svelte`へHeader、Primary、Secondaryを移した。
- `src/routes/lp/+page.svelte`へ同じ3要素を移した。
- `src/routes/plan/+page.svelte`へ同じ3要素を移した。
- 責務が空になった`src/routes/lp/+layout.svelte`と`src/routes/plan/+layout.svelte`を削除した。
- `tests/unit/landing-route-ownership.test.ts`を追加した。

Hero component、Landing visual、animation helper、Auth policy、Rails、OpenAPIは変更していない。Browser確認に使った一時QA routeと一時public policyは確認後に削除・復元した。

## 修正後の所有関係と描画回数

| Route | Layout Hero | Page Hero | Primary回数 | Secondary回数 | Header回数 |
|---|---|---|---:|---:|---:|
| `/` | なし | `/+page.svelte` | 1 | 1 | 1 |
| `/lp` | なし | `/lp/+page.svelte` | 1 | 1 | 1 |
| `/plan` | なし | `/plan/+page.svelte` | 1 | 1 | 1 |

最終的にHeroを直接importするroute fileは上記3 Pageだけである。

## 静的検査

`landing-route-ownership.test.ts`は次を検証する。

- Root layoutがPrimary/Secondaryを参照しない。
- 3 PageがPrimaryとSecondaryをそれぞれちょうど1回renderする。
- 3 Pageが認証状態を渡したHeaderをちょうど1回renderする。

追加した4 testsは成功した。Route sourceを検査するため、将来LayoutとPageの両方へHeroを戻す変更を検出できる。

## Browser確認

Browserスキルを使い、一時QA Page内のsame-origin iframeへ各routeを1440、768、390pxで読み込んだ。確認後、QA Pageと一時policy変更は削除した。

| Route | Viewport | Primary | Secondary | Header→Primary→Secondary | Section overlap | Primary / Secondary height | Animation |
|---|---:|---:|---:|---|---:|---:|---|
| `/` | 1440 | 1 | 1 | PASS | 0px | 868.63 / 868.63px | path変化あり |
| `/` | 768 | 1 | 1 | PASS | 0px | 461.36 / 461.36px | path変化あり |
| `/` | 390 | 1 | 1 | PASS | 0px | 241.36 / 241.36px | path変化あり |
| `/lp` | 1440 | 1 | 1 | PASS | 0px | 868.63 / 868.63px | path変化あり |
| `/lp` | 768 | 1 | 1 | PASS | 0px | 461.36 / 461.36px | path変化あり |
| `/lp` | 390 | 1 | 1 | PASS | 0px | 241.36 / 241.36px | path変化あり |
| `/plan` | 1440 | 1 | 1 | PASS | 0px | 868.63 / 868.63px | path変化あり |
| `/plan` | 768 | 1 | 1 | PASS | 0px | 461.36 / 461.36px | path変化あり |
| `/plan` | 390 | 1 | 1 | PASS | 0px | 241.36 / 241.36px | path変化あり |

- 3 route間の直接navigationと再読込は成功した。
- Header、copy、section内部DOM、SVG、GSAP path animationは維持された。
- 1440pxでは3 routeとも同じ高さ・順序となり、`/lp`と`/plan`の文書高は重複分だけ縮小した。
- Mobileの既存横overflowは維持されており、B-3Eでdeferしたresponsive問題を修正していない。
- Fresh dev server上で500/error UIやroute runtime crashは発生しなかった。
- Browser control surfaceからload時console streamを直接取得できなかったため、B-3Eで既知の`MutationObserver.observe` console errorが解消したとは判定していない。原因調査は引き続きdeferする。

## Quality

| Gate | Result |
|---|---|
| `npm run check` | 0 errors / 0 warnings |
| `npm run lint` | 0 errors / 60 warnings |
| `npm run format:check` | PASS |
| OpenAPI validation | 18 operations / 18 unique operation IDs、PASS |
| `npm run test` | 11 files / 103 tests、PASS |
| Auth smoke | 5 scenarios、PASS |
| `npm run build` | PASS、unresolved import 0 |
| Secret scan | 66 build files、PASS |
| Route smoke | 7 routes、PASS |
| `npm run quality` | exit 0（87.9秒） |

Build・test・import graph実行で新規cycleは検出されていない。RailsとOpenAPIの変更はない。

## 未解決事項

- Primaryの固定SVG IDとSecondary wave helperへの移行。
- Landing HeroのTablet/Mobile responsive設計とMobile overflow。
- B-3Eで観測した`MutationObserver.observe` console errorの発生元特定。
- `/`、`/lp`、`/plan`が現在同じPage内容であるproduct上の意味。今回のOwnership整理ではroute統合・redirectを行わない。
- 共通Page composition componentの要否。3 Pageだけの小さな重複であり、今回は新しいwrapperを作らなかった。

