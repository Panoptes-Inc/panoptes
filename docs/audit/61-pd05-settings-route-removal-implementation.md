# Phase PD-3 — PD-05 Settings Temporary Route Removal Implementation

実施日: 2026-08-19

## 1. Decision

Product Owner判断としてPD-05 Option A — Remove Temporary Routeを採用した。

```text
Decision: Remove /app/login/settings
Implementation: Route removed, no redirect
```

Settings機能が必要になった場合は、現在のURLやscopeを復元せず、User/Organization/Auth等の責任範囲、ownership、Product scope、IAを新しいProduct Discovery/Decisionで定義してから正式routeを設計する。

## 2. Source Before

削除前の`src/routes/app/login`配下は次の1 fileだけだった。

```text
src/routes/app/login/settings/+page.svelte
```

PageはSvelte starterのheading、本文、Svelte公式documentへのlinkだけを描画し、component、form、load/action、persistence、API callを持たなかった。App layoutとdefault auth policyを継承していた。

削除前baseline:

- production routes: 9
- route Svelte: 13
- total Svelte: 137
- reusable: 124
- production reachable/canonical: 119

## 3. References Before

Runtime/internal navigation referenceは0件だった。`src`内にSvelte link、`goto()`、redirect、server redirectは存在しなかった。

実装更新対象:

- `tests/unit/route-ownership.test.ts` — starter scaffold存在testとnavigation非参照test
- `scripts/smoke-routes.mjs` — production routeとして未認証303を期待
- machine-readable component inventory 2 files
- Active Graph、Route Ownership、Structure Policy、parent inventory、Product Decision Register、Development Log

過去Auditと旧inventory記述は当時のEvidenceとして保持した。repository外のbookmark、browser history、external direct linkが存在しないとは断定しない。Product Decisionはその失効リスクを受容している。

## 4. Deleted Files and Directories

- Deleted file: `src/routes/app/login/settings/+page.svelte`
- Removed empty directory: `src/routes/app/login/settings`
- Removed empty parent directory: `src/routes/app/login`

他のroute/componentは削除していない。

## 5. Route Behavior After

- `/app/login/settings`はproduction route inventoryに存在しない。
- redirectは追加していない。
- dedicated 404 UIは追加していない。
- active memberがguardを通過した後のdirect accessはSvelteKit標準not-foundとなる。
- 未認証requestには既存default auth policyが先に適用され得るが、removed route専用redirectは存在しない。
- `/app`、`/app/analysis`、App layout、Header、Shell、BFF/runtime behaviorは変更していない。

## 6. Inventory Impact

`npm run audit:frontend-inventory`でmachine-readable inventoryを再生成した。

| Metric | Before | After |
|---|---:|---:|
| production routes | 9 | 8 |
| route Svelte | 13 | 12 |
| total Svelte | 137 | 136 |
| reusable Svelte | 124 | 124 |
| production reachable/canonical | 119 | 119 |
| wrappers | 0 | 0 |
| dev-only | 3 | 3 |
| DEFER | 2 | 2 |
| unresolved imports | 0 | 0 |
| cycles | 0 | 0 |
| inventory stale | 0 | 0 |

新規UNREACHABLE componentは0件である。Route-local scaffoldだけの削除だったため、reusable reachabilityは変化しなかった。

## 7. Active Graph Impact

[Frontend Active Graph](../architecture/frontend-active-graph.md)からcurrent route rowを削除し、route/total Svelte実測値とPD-3 post-closure historyを追加した。Canonical feature graph、App graph、production reachable 119は不変である。

## 8. Route Ownership Impact

[Frontend Route Ownership](../architecture/frontend-route-ownership.md)のcurrent route mapとProduct-decision boundaryから対象routeを除外した。Removed route historyへDecision、redirectなし、standard not-found、新しいProduct Discoveryをrevisit conditionとして記録した。

[Frontend Structure Policy](../architecture/frontend-structure-policy.md)の原則は変更していない。PD-05をTemporary Route lifecycleの解消例として同期し、current exception/Product Decision Requiredから除外した。新しいArchitecture Decisionは作成していない。

## 9. Tests

- route ownership testをstarter存在確認からroute非存在確認へ変更
- internal navigation非参照testを維持
- production smoke listからremoved routeを削除（11 routesから10 routes）
- inventory regressionをsourceから再生成・check
- existing auth/Organization smokeを維持

固定数を推測せず、source再生成結果を使用した。

## 10. Quality

- `npm run quality`: PASS（exit 0）
- `npm run check`: Svelte errors 0 / warnings 0
- `npm run lint`: ESLint errors 0 / warnings 38
- `npm run format:check`: PASS
- `npm run check:openapi`: 18 operations / 18 unique operation IDs PASS
- `npm run check:frontend-inventory`: reusable 124、production canonical 119、route Svelte 12、total Svelte 136、DEFER 2、unresolved/cycles/stale 0
- `npm run test`: 22 files / 257 tests PASS
- `npm run test:auth-smoke`: 5 scenarios PASS。member `/app` 200を含む
- `npm run build`: PASS。removed Settings pageはserver build entryに存在しない
- `npm run test:secrets`: 63 build files PASS
- `npm run test:smoke`: source再計算後の10 routes PASS。`/app`と`/app/analysis`は未認証303を維持

実ブラウザー確認はbrowser skillの接続手順を実行したが、このセッションで利用可能なbrowser instanceが0件だったため`UNAVAILABLE`。CLI smoke/auth smoke/buildでroute回帰を確認した。

## 11. Decision Register Synchronization

[Product Decision Register](../product/product-decision-register.md)でPD-05を`DECIDED`へ更新し、次を記録した。

- Decision Owner: Product Owner（PD-3指示書による明示承認）
- Decision Date: 2026-08-19
- Selected Option: Option A — Remove Temporary Route
- Reason/User/Product impact
- Future rule/Revisit condition
- Implementation Phase: PD-3

品質確認前は`APPROVED_FOR_IMPLEMENTATION`、品質PASS後は`IMPLEMENTED`へ同期した。

## 12. Frontend Inventory Parent

[Frontend Inventory Summary](../inventory/frontend-inventory-summary.md)はB-3T closureを再オープンしていない。Current baseline、current Page Structure、PD-05 ledger、Product Decision一覧だけをpost-closure updateとして同期し、B-3T Final Quality Baselineは履歴として保持した。

## 13. Remaining

- repository外bookmark/external linkはrepoから不存在を証明できない
- Settings Product scopeは定義していない
- dedicated gone/redirect/404 UIはProduct Decision外のため追加していない

## 14. Revisit Condition

Settings Product Discoveryが承認され、scope、ownership、IA、permissions、data/API、Design、navigation、MVP priorityを定義した場合にのみ、新しいProduct Decisionとして正式routeを検討する。現在のPD-05を単純にreopenまたはrollbackしない。
