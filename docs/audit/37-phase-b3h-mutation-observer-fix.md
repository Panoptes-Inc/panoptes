# Phase B-3H MutationObserver Fix Decision

## Decision

Panoptes production codeの修正は行わない。

根本原因はCodex In-app Browserのiframe automation injectionであり、分類は`BROWSER_ENVIRONMENT`である。Panoptes側にguard、observer、cleanup、dependency overrideを追加すると、外部環境の例外を直せないままproduction codeへ不要な分岐を持ち込むため不採用とした。

## 変更

- 追加: `docs/audit/36-mutation-observer-runtime-investigation.md`
- 追加: 本文書
- 更新: `docs/DEVELOPMENT_LOG.md`
- Production source: 変更なし
- Test source: 変更なし
- Dependency: 変更なし
- Rails / OpenAPI: 変更なし

調査用の`src/app.html` instrumentation、blank/Panoptes iframe fixture、clean Chrome CDP scriptはすべて削除済みで、成果物には残していない。

## Test

Application bugではないためMutationObserver mock testは追加していない。既存108 unit testsと全quality gateを回帰確認する。

## Browser確認

- Devの6 route × 3 viewport: 対象error 0。
- Production previewの6 route: 対象error 0。
- `/app`、`/app/analysis`のanonymous auth redirect: crashなし、対象error 0。
- Clean ChromeでContactModal / SurveyModal: 各open 1、close後継続、runtime exception 0。
- Codex In-app Browserのblank 18 iframe: 18件再現。
- Clean Chrome extensions disabledの同blank 18 iframe: 0件。

Hero animationは通常routeで描画・待機中に対象error 0。Hero、copy、SVG、GSAP、responsive、UIには変更を加えていない。

## Regression risk

Production codeを変更していないため、Panoptesへのregression riskはない。残るriskはBrowser toolingのiframe QAでconsole noiseが再発することだけである。

## Quality

- `npm run quality`: exit 0（138.3秒）
- `svelte-check`: 0 errors / 0 warnings
- ESLint: 0 errors / 60 warnings
- Unit test: 11 files / 108 tests PASS
- OpenAPI: 18 operations / 18 unique operation IDs PASS
- Auth smoke: 5 scenarios PASS
- Production build: PASS、unresolved import 0
- Secret scan: 65 build files PASS
- Route smoke: 7 routes PASS
