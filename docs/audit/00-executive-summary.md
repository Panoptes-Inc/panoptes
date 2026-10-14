# Panoptes コードベース調査 エグゼクティブサマリー

調査日: 2026-08-06  
対象ルート: `C:\\Users\\ibuki\\OneDrive\\デスクトップ\\panoptes-mvp\\panoptes`

## 結論

現状は「Svelte 5で作られたUIプロトタイプ」と「Rails APIを想定したフロントエンド状態機械」が同居した段階です。主要アプリ画面は `src/lib/panoptes` のAPI契約・store・action・selectorを経由する構造に整理されつつありますが、実APIを受けるSvelteKit server route、認証・認可、Organization境界、テスト、Tailwindは未実装です。

静的調査で確認した規模は、Svelteファイル136件（ルート14件、`src/lib/components` 122件）、TypeScript 40件、JavaScript 5件です。コンポーネント122件のうち97件は何らかのルートからimportグラフ上到達可能、25件は到達不能です。ただし到達可能でも、管理画面系は解決不能importによりproduction buildを失敗させます。

## 最重要発見

1. **P0: production buildが失敗する。** `npm run build` は `src/lib/components/ComponentsBase/admin/AdminDashboard.svelte:2` の `../AdminDashboard.svelte` を解決できず停止した。同じ形式の壊れたadmin wrapperが6件あり、`/admin` と `/app/dev/ui` の依存グラフに入っている。
2. **P0: 認証・認可・Organization境界がない。** `src/routes/admin/+page.svelte` を含む全ルートにserver load、hook、guardがなく、API clientにもtenant識別子の注入処理がない。Rails導入前に境界を契約化する必要がある。
3. **P0: 秘密値の配置リスク。** `.env` に `SUPABASE_SERVICE_ROLE_KEY` というprivate key名が存在する（値は未取得・未出力）。`.gitignore` は `.env*` を除外するが、frontend project直下にservice-role credentialを置く運用は誤露出時の影響が大きい。
4. **P1: 実API経路が未成立。** `src/lib/panoptes/api/client.ts:135-218` は8本の同一origin `/api/...` を呼ぶが、`src/routes` に `+server.*` は0件。`PUBLIC_USE_MOCK_API=true` のときだけbrowser localStorageベースのmockが動く。
5. **P1: UI重複と死蔵コードが多い。** ルート到達不能コンポーネント25件、空コンポーネント4件、空ページ3件、同一内容のページ/レイアウト、旧wrapper、`dummy`/`mock`/previewが並存する。
6. **P1: 巨大コンポーネントに外部I/Oと業務判断が集中。** `SignUpForm.svelte` は1,075行でSupabase Auth、Turnstile、waitlist fetch、validation、cooldown、表示を担当する。`PanoptesShellPage.svelte` は336行でbootstrap、polling、project/strategy操作、5 stores、表示分岐を統括する。
7. **P1: テスト・型検査・品質ゲートがない。** unit/component/E2E/a11y/visual/Python testはいずれも未確認。`svelte-check`、TypeScript直接依存、lint、formatter scriptもない。
8. **P2: デザイン値が分散。** Tailwind未導入。99コンポーネントがscoped `<style>` を持ち、色282種類・半径19種類・shadow 37種類が文字列として分散している。頻出色は `#ff6200`、`#564aff`、`#7b7067`、頻出radiusは `999px`、`8px`。
9. **P2: レスポンシブ/アクセシビリティは部分対応。** media query、semantic button、label、ARIAは存在する一方、modalは初期focusとEscapeのみでfocus trap/復帰がなく、`zoom` による縮小が3箇所ある。

## 現在の良い構造

- Svelte 5 runesに統一され、`export let`、legacy `$:`、dispatcher、slotは検出されなかった。
- `src/lib/panoptes` は `api -> actions -> stores/domain -> selectors -> UI` の方向が概ね成立している。
- API contractは `PanoptesApiClient` に集約され、snake_case/camelCase変換とerror envelope処理がある。
- pollingは単一timerを停止でき、stale update・単調progress・stable snapshot保持のguardが用意されている。
- URL入力はclient側でHTTP/HTTPSを検査している。ただしcrawler側のSSRF防御には代えられない。

## 推奨順序

1. P0のbuild破損を解消し、`build` と`check`をCI必須にする。
2. `/admin`、dev preview、mock機能をproductionから隔離し、auth/org guardをSvelteKit server境界に置く。
3. Rails API contractとBFF方針を確定し、現行8 APIをserver-side proxyへ移す。
4. active graphとdead graphを分離し、空・壊れたwrapper・旧dummyを事実確認後に整理する。
5. design tokenを先に定義し、その後Tailwindへ段階移行する。
6. auth、Organization境界、analysis state machine、modal、formを優先テストする。

## 調査の制約

コード、DB、外部サービス、本番データは変更・参照していません。`.env` はキー名だけを確認し値は出力していません。Git metadataは対象ルートで利用できず、履歴による利用判定はしていません。buildは最初の解決不能importで停止するため、その先の潜在エラーは未確定です。

