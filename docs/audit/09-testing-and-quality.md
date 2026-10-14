# Testing・Quality・Error State・Security

## 実行結果

`npm run build`を実行し失敗を確認しました。Vite 7.3.1は314 moduleをtransform後、`src/lib/components/ComponentsBase/admin/AdminDashboard.svelte:2` の `../AdminDashboard.svelte` をresolveできず停止しました。調査では修正していません。

unit、component、integration、E2E、visual regression、accessibility、API、Python testはいずれもtest file/config/scriptがありません。`svelte-check`、lint、formatterも未導入です。

## Error / Loading / Empty

Panoptes analysis flowにはempty、loading、inference、failure、retry、stable snapshot overlayが明示され、状態機械との対応は比較的良好です。一方、全体では次が不足します。

- permission denied/auth expired/not found/offline/partial failureの共通page state。
- API timeoutとcancel。fetchはtimeoutなし。
- form errorのfield単位関連付け。
- Contact/Survey/Loginがcallbackなしでも成功/closeする仮挙動の明示。
- admin/LPのerror boundary。

## 優先テスト

1. auth session、admin guard、Organization越境拒否。
2. analysis jobのstale response、progress単調性、terminal遷移、stable snapshot保持。
3. create/reanalyze/confirm/select strategy/update taskのidempotencyと二重submit。
4. modal focus trap/Escape/focus復帰/body scroll lock。
5. form validationとserver error mapping。
6. main navigation、404、dev route非公開。
7. snapshot tabとstrategy roadmap表示。
8. 320/768/1280/1920px、200% zoom、keyboard-onlyのvisual/a11y E2E。

## Security findings

### Critical

確認済みCriticalはありません。秘密値そのものは読み取り・出力していません。

### High

- `/admin`に認証・role guardがない。現状はbuild破損中だが、import修復だけで公開される (`src/routes/admin/+page.svelte`)。
- Organization scopeがAPI contract/request layerで強制されない。Rails導入時にIDOR/tenant越境へつながる。
- `.env`にservice-role key名が存在する。frontend repository/runtimeから分離し、漏えい時rotation手順を持つ必要がある。
- 将来crawlerへ渡すtarget URLはclientでHTTP/HTTPSのみ検査する。private IP、redirect chain、DNS rebinding等のSSRF防御はworker/serverで必須 (`actions/analysis.ts:32-38`)。

### Medium

- dev preview routesがproduction route treeに存在し、admin/mock UIへ到達可能。
- auth/waitlistを巨大client componentから直接操作し、server-side rate limit/CSRF/audit境界がrepository内にない。
- competitor URLを外部linkとして表示する。`target=_blank`と`rel=noreferrer`はあるが、許可protocolをserverで正規化すべき。
- modalにfocus trap/background inertがない。
- localStorage mock/project IDは信頼できない入力としてserver側で再検証が必要。

### Low / 未確認

- `{@html}`、innerHTML、div click、hard-coded secret、private envのclient importは検出されなかった。
- CORS/CSRF/RLS/CSP/security headersはserver実装がないため評価不能。
- dependency vulnerabilityはnetwork auditを実行していないため未確認。

## 品質ゲート案

- `npm run check`（`svelte-check`）、`test:unit`、`test:e2e`、`lint`、`format:check`を追加。
- CI順序: install lockfile -> sync -> check -> unit -> build -> E2E/a11y。
- dev/mock routeとproduction buildの分離をE2Eで確認。

