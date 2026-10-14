# Refactoring Backlog

## P0

### AUD-001 Production buildを回復する

- 対象: `ComponentsBase/admin/*.svelte`、parts signup wrappers
- 現状/問題: 8件のrelative importが解決不能。buildはadmin dashboardで停止。
- 推奨変更/理由: wrapperと実体の正本を特定し、import pathを一本化。品質検証の前提を回復する。
- 影響: 全deploy、`/admin`、`/app/dev/ui`。
- 依存: admin UI正本の確認。リスク: 誤った旧版を採用。規模: M。
- 受入条件: `npm run build`成功、解決不能import 0、admin smoke test成功。

### AUD-002 Auth・Role・Organization guardを実装する

- 対象: `/admin`、`/app*`、将来API/BFF。
- 現状/問題: server guard 0、org scope 0。
- 推奨変更/理由: SvelteKit server hook/loadとRails authorizationで二重強制。
- 影響: route/API contract/session。依存: auth方式・Rails方針。リスク: session移行。規模: L。
- 受入条件: unauthenticated/別org/非adminアクセスをserverが拒否するintegration test。

### AUD-003 Service-role secretをfrontend境界から隔離する

- 対象: `.env`運用、deploy secrets。
- 現状/問題: frontend project直下にservice-role key名がある。
- 推奨変更/理由: Rails/secure server runtimeだけに配置し、漏えい確認とrotation手順を整備。
- 影響: Supabase管理処理。依存: deployment inventory。リスク: key切替時停止。規模: S。
- 受入条件: client/build環境にservice-roleがなく、secret scanとrotation記録がある。

## P1

### AUD-004 BFFとRails API contractを成立させる

- 対象: `panoptes/api/client.ts`の8 endpoint。
- 現状/問題: 呼び先`+server`が0件、mock時のみ自己完結。
- 推奨変更/理由: SvelteKit server proxy、versioned contract、timeout/error mappingを実装。
- 影響: 全app action。依存: Rails endpoint/auth。リスク: field alias差。規模: L。
- 受入条件: contract test、timeout、401/403/404/409/422/5xx handlingが通る。

### AUD-005 品質ゲートを追加する

- 対象: package scripts/CI。
- 現状/問題: check/test/lintなし、prepareが失敗を握り潰す。
- 推奨変更/理由: svelte-check、unit、E2E、lint、buildを必須化。
- 影響: 全開発。依存: AUD-001。リスク: 初期error大量発見。規模: M。
- 受入条件: clean installから全gate成功、失敗時non-zero。

### AUD-006 dev/mock routeをproductionから分離する

- 対象: `/app/dev/ui`、`/dev/analysis-preview`、mock imports。
- 現状/問題: production route treeに存在し、mock backendも静的import。
- 推奨変更/理由: build flag/route group/authで隔離し、fixtureをdev-only化。
- 影響: bundle/preview workflow。依存: deploy方式。リスク: designer preview低下。規模: M。
- 受入条件: productionで404またはadmin-only、mock codeがproduction pathで実行不能。

### AUD-007 高リスクformを分割する

- 対象: `SignUpForm`、Login/Contact/Survey modal。
- 現状/問題: I/O、validation、DOM、UIが混在。callbackなし成功表示もある。
- 推奨変更/理由: schema、service/action、Dialog、fields、feedbackへ分離。
- 影響: auth/waitlist/contact/survey。依存: backend方針。リスク: UX回帰。規模: L。
- 受入条件: server validation、field error関連付け、success条件の実送信連動、test。

### AUD-008 SSRF防御をserver/workerに実装する

- 対象: target URL -> crawler。
- 現状/問題: clientはHTTP/HTTPS判定だけ。
- 推奨変更/理由: DNS/IP/redirect/protocol/port/size制限をworker入口で強制。
- 影響: analysis create。依存: Python worker。リスク: 正当URLの誤拒否。規模: M。
- 受入条件: private/loopback/link-local/metadata endpointとredirect bypassをtestで拒否。

## P2

### AUD-009 active/dead component graphを整理する

- 対象: 到達不能25件、空7件、旧wrapper/dummy。
- 現状/問題: 正本不明、同名/類似UIが並存。
- 推奨変更/理由: visual比較とowner確認後、archiveではなくGit履歴を前提に統合/削除。
- 影響: component tree。依存: AUD-001/visual QA。リスク: hidden利用。規模: L。
- 受入条件: unused report 0または理由付きallowlist、正本map更新。

### AUD-010 route/layout重複を整理する

- 対象: `/`, `/lp`, `/plan`, `/app/analysis`。
- 現状/問題: 空pageと同一layout/page、親子二重LP。
- 推奨変更/理由: canonical routeとmarketing layoutを定義、必要ならredirect。
- 影響: SEO/navigation。依存: product URL方針。リスク: bookmark/SEO。規模: S。
- 受入条件: route mapに重複なし、canonical/redirect E2E成功。

### AUD-011 State/actionをtestableなfeature層へ再編する

- 対象: `src/lib/panoptes`、`PanoptesShellPage`。
- 現状/問題: global store/timerとcompositionが密結合。
- 推奨変更/理由: command dependency注入、poller lifecycle分離、feature public API化。
- 影響: app全体。依存: test基盤。リスク: state回帰。規模: L。
- 受入条件: state machine unit test、複数mount/abort/timeout testが通る。

### AUD-012 Design tokenとprimitiveを導入する

- 対象: 99 scoped styles、button/modal/panel/status。
- 現状/問題: 282色、19 radius、37 shadowが分散。
- 推奨変更/理由: semantic token -> primitive -> featureの順で統一。
- 影響: 全UI。依存: visual baseline。リスク: pixel差。規模: L。
- 受入条件: token catalog、主要画面visual regression、重複値削減。

## P3

### AUD-013 Tailwind CSSへ段階移行する

- 対象: global/scoped CSS。
- 現状/問題: Tailwind未導入。
- 推奨変更/理由: token接続後にprimitiveから移行し、domain SVG/CSSは必要に応じ維持。
- 影響: style/build。依存: AUD-012。リスク: class肥大/visual drift。規模: L。
- 受入条件: themeにsemantic token、arbitrary value policy、主要画面同等表示。

### AUD-014 Modal/accessibilityを標準化する

- 対象: Login/Contact/Survey/Create sheet。
- 現状/問題: focus trap/復帰/inertなし、error関連付け不統一。
- 推奨変更/理由:共通Dialog primitiveとa11y testを導入。
- 影響: header forms。依存: primitive方針。リスク: focus回帰。規模: M。
- 受入条件: keyboardのみで完結、focus循環/復帰、axe重大違反0。

### AUD-015 Responsive/scrollを再検証する

- 対象: fixed header/modal/sheet、zoom、nested overflow。
- 現状/問題: mobile nav欠落、zoom依存、vh/dvh混在。
- 推奨変更/理由: layout contractとbreakpointを標準化。
- 影響: 全主要画面。依存: token/visual test。リスク: desktop崩れ。規模: M。
- 受入条件: 320px〜desktop、200% zoom、keyboard、mobile navのE2E/visual合格。

## P4

### AUD-016 命名・directoryをtarget architectureへ移行する

- 対象: `ComponentsBase`、`db/UI`、`mock(s)`、綴り誤り。
- 現状/問題: 責務と名称が一致しない。
- 推奨変更/理由: feature/domain/ui/api/stylesへ段階移動しpublic entryを限定。
- 影響: import全般。依存: dead code整理。リスク:巨大diff。規模: L。
- 受入条件: placement rule文書化、deep legacy pathなし、build/test成功。

