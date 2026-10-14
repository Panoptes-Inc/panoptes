# Phase B-3H MutationObserver Runtime Investigation

## 結論

最終分類は **BROWSER_ENVIRONMENT** である。既知エラーはPanoptes、Svelte、GSAP、modal、hydrationに起因せず、Codex In-app Browserがiframeへ注入するbrowser automation runtimeの観測処理で発生する。

Panoptesを通常のtop-level documentとして読み込む条件では、dev・production previewとも対象routeで0件だった。PanoptesもSvelteも含まない空HTMLを18 iframeで同時に読み込むと、Codex In-app Browserでは18件、拡張機能を無効化したclean Chrome headlessでは0件だった。このためproduction codeは変更していない。

## Error全文

```text
Uncaught TypeError: Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.
```

| Field | 観測値 |
|---|---|
| Error name | `TypeError` |
| Message | `Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.` |
| Stack | In-app Browserのconsole取得面はこの例外についてstackを返さなかった |
| Source URL | 取得結果に含まれなかった |
| Line / column | 取得結果に含まれなかった |
| Invalid target value | Browserのisolated/injected world内の値であり、page worldから取得不可 |

stack、source、line、columnが空であること自体を隠さず記録する。page worldで`MutationObserver`を一時wrapper化し、全`observe`呼出しと例外をDOMへ出力したが、エラー発生時にもPanoptes側の`observeCalls`、`errors`、`unhandledrejection`はすべて0件だった。したがって不正targetはPanoptes page worldへ渡された値ではない。

## Browser injection sourceの照合

In-app Browser plugin bundleには、Playwright由来のinjected scriptとして次のobserverが含まれる。

```text
browser-client.mjs:1071
InjectedScript._setupGlobalListenersRemovalDetection()
new MutationObserver(...).observe(this.document, { childList: true })
```

これはrepository外の `C:\Users\ibuki\.codex\plugins\cache\openai-bundled\browser\26.730.61639\scripts\browser-client.mjs` にある。console entryにsource URLがないため、この関数をstack上の確定frameとは表現しない。ただし、空iframe 1件につき例外1件、page-world observer 0件、clean Chrome 0件という結果と、同plugin内のobserver実装が一致する。iframe attach時にinjected scriptのdocument targetがNodeとして扱えないintegration raceが根本原因と判断した。

## 再現条件

### 通常route

Fresh dev serverで次の18条件を確認した。

| Route | 1440px | 768px | 390px | 備考 |
|---|---:|---:|---:|---|
| `/` | 0 | 0 | 0 | Hero animation開始後まで待機 |
| `/lp` | 0 | 0 | 0 | Hero animation開始後まで待機 |
| `/plan` | 0 | 0 | 0 | Hero animation開始後まで待機 |
| `/login` | 0 | 0 | 0 | hydration後まで待機 |
| `/app` | 0 | 0 | 0 | anonymousで`/login?returnTo=%2Fapp`へredirect |
| `/app/analysis` | 0 | 0 | 0 | anonymousで`/login?returnTo=%2Fapp%2Fanalysis`へredirect |

初回load、hydration直後、Hero animation開始後、auth redirect、reloadの通常top-level条件では再現しない。clean ChromeではContactModalとSurveyModalを各1回open/closeし、runtime exception 0件を確認した。

### 再現fixture

調査中のみ次のfixtureを作成し、完了時に削除した。

- Panoptes 6 route × 3 widthを18 iframeで同時load
- script・Svelte・Heroを一切含まない空HTMLを18 iframeで同時load

結果:

| Environment | Dev / Preview | Fixture | Error |
|---|---|---|---:|
| Codex In-app Browser | dev | Panoptes 18 iframe | 再現（初回4件、reload時は追加発生） |
| Codex In-app Browser | dev | blank 18 iframe | 18件 |
| Codex In-app Browser | production preview | Panoptes 18 iframe | 2件 |
| Codex In-app Browser | production preview | blank 18 iframe | 18件 |
| Clean Chrome headless, extensions disabled | dev | blank 18 iframe | 0件 |

件数差はIn-app Browser側のiframe attach timingに依存する。blank fixtureの18/18再現が最小再現条件である。

## Dev / Production比較

- 通常top-level route: dev 0件、production preview 0件。
- iframe fixture: devとproduction previewの両方で再現。
- Vite HMRを除いたproduction previewでも再現するため`DEV_ONLY`ではない。
- clean Chromeでは同fixtureが0件のためPanoptes production bundleの問題ではない。

## Repository検索

検索語は`MutationObserver`、`.observe(`、`observer.observe`、`new MutationObserver`。`src/`、`scripts/`、`tests/`に直接利用は0件だった。

frontend dependencyの非minified sourceでは次を確認した。

| Package | Version | 利用箇所 | 判断 |
|---|---:|---|---|
| Svelte | 5.48.2 | select binding、customizable select | 実Nodeの`select`をobserve。blank HTMLでも再現するため除外 |
| Vite | 7.3.1 | modulepreload polyfill | `document`をobserve。production previewとblank staticでも同じため原因ではない |
| GSAP | 3.14.2 | 実装なし（コメント内の言及のみ） | 除外 |
| Supabase | 2.112.1 / SSR 0.12.4 | 該当利用なし | 除外 |

Turnstile controller、Contact/Survey focus utility、modal helperにもobserver利用はない。

## 原因候補と除外

| Candidate | Result | Evidence |
|---|---|---|
| Primary / Secondary Visual | 除外 | blank HTMLで再現、通常Hero routeでは0件 |
| shared wave helper / GSAP ticker・timeline・gradient | 除外 | MutationObserver利用0、blank HTMLで再現 |
| Svelte hydration | 除外 | Svelteなしblank HTMLで再現 |
| Contact / Survey modal・focus trap | 除外 | observer利用0、modal操作でclean Chrome exception 0 |
| SignUpForm / Turnstile | 除外 | login routeの通常loadで0、blank HTMLで再現 |
| Supabase Auth / auth redirect | 除外 | public routeとblank HTMLで再現、通常redirectでは0 |
| Vite HMR / dev overlay | 除外 | production previewでも再現 |
| Codex In-app Browser injection | 採用 | blank iframe 18/18、page world 0、clean Chrome 0、plugin bundle内observerあり |

## DOM lifecycleとの関係

Panoptes componentの`onMount`、`$effect`、`bind:this`、conditional render、destroy、async callback、GSAP cleanupには相関がない。相関があるlifecycle eventはIn-app Browser側のiframe document attachである。Panoptes側へ`instanceof Node` guardやcleanupを追加しても、isolated injection worldの例外には作用しない。

## 最終分類・severity・production影響

- Classification: **BROWSER_ENVIRONMENT**
- Panoptes production severity: **None / Informational**
- QA tooling severity: **Low**（大量iframe fixtureでconsole noiseになる）
- Runtime crash: なし
- UI impact: なし
- Production impact: clean Chrome相当で0件。一般利用者へ影響する根拠なし
- Rails / OpenAPI impact: なし

## 未解決事項

- In-app Browserのconsole APIがisolated-world exceptionのstack/source/line/columnとtarget実値を公開しないため、それらの生値は未取得。
- Browser plugin側でiframe injected-documentの初期化順を修正するには、plugin/runtime側のupstream調査が必要。
- Panoptesの不具合として追跡する必要はない。Browser tooling更新後にblank iframe fixture相当で再確認すればよい。

