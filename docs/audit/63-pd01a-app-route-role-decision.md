# Phase PD-5 — PD-01A App Route Role Decision

Decision Date: 2026-08-20  
Decision Owner: Product Owner  
Status: `DECIDED`

## 1. Scope

本Decisionは`/app`と`/app/analysis`のProduct上のRoute Roleだけを確定する。Marketing route `/`、`/lp`、`/plan`、およびpathnameからのstate restoration、bookmark、share、browser history契約は対象外である。

## 2. Evidence

- `/app`と`/app/analysis`は独立したSvelteKit route entryを持つ。
- 両routeはroot layoutと`app/+layout.svelte`を継承し、同じ認証・active Organization membership policyを受ける。
- 両Pageは同じ`activeOrganizationId`を同じ`PanoptesShellEntryPage`へ渡す。
- `PanoptesShellPage`の初期tabは両routeとも`strategy`で、pathnameからtab、project、snapshot、queryを導出しない。
- App layoutはpathnameが`/app`の場合だけ`PanoptesTopHero`とSearch entryを描画する。
- `PanoptesAnalysisStartSearchBar`は分析開始成功後に`goto('/app/analysis')`する。
- Site HeaderとAuthのdefault/fallback entryは`/app`を指す。

## 3. Current behavior

| Concern | `/app` | `/app/analysis` |
| --- | --- | --- |
| Authentication | required | required |
| Active Organization | membership required | membership required |
| Layout | root + App | root + App |
| Feature entry | `PanoptesShellEntryPage` | `PanoptesShellEntryPage` |
| Runtime model | shared | shared |
| Initial tab | `strategy` | `strategy` |
| Top Hero / Search | shown | hidden |
| Confirmed navigation | Header/Auth default | Search success destination |

Runtime equivalenceはShell state modelに限られる。presentation compositionとnavigation roleには既に差がある。

## 4. Options

### A-A — Distinct Semantic Routes, Shared Runtime

`/app`をApp Home / Analysis Entry、`/app/analysis`をanalysis-focused Workspace / Result Entryとする。同じShell/runtimeの共有を許可する。

- Advantages: 現在のSearch navigationと一致し、Homeを維持しながら将来deep-linkを拡張できる。
- Risks: 現時点のruntime state差は限定的で、state restoration契約は別途必要。

### A-B — Semantic Alias

現行の同一Shellには近いが、Top Hero差とSearchが`/app/analysis`へ遷移する理由を説明できず、2 URLのProduct上の意味が曖昧になる。

### A-C — `/app/analysis` Deprecation Candidate

URLを単純化できる一方、現在のSearch navigationと矛盾し、将来deep-linkの余地を失う。redirect/navigation migrationが必要になる。

### A-D — Continue Undecided

source変更を避けられるが、既に揃ったevidenceをDecisionへ進めず、route naming/navigation debtを維持する。

## 5. Decision

**Option A-A — Distinct Semantic Routes, Shared Runtime**を採用する。

| Route | Formal Product role |
| --- | --- |
| `/app` | Panoptes App Home / Analysis Entry |
| `/app/analysis` | Analysis-focused Workspace / Result Entry |

正式UI名称は決定していないため、UI labelは変更しない。`Analysis-focused Workspace / Result Entry`はRoute Roleの記述であり、画面表示名ではない。

## 6. Rationale

`/app`だけにTop Hero/Searchがあり、Header/AuthのentryでもあることはHome/Analysis Entryを支持する。Search成功後の明示的な`/app/analysis`遷移とTop Hero非表示は、analysis-focused entryを支持する。異なるRoute Roleは異なるruntime architectureを要求しないため、現行のshared Shellを保持できる。

## 7. Tradeoffs

- URL semanticsと現行presentation/navigationが一致する。
- route削除、redirect、runtime分岐を発生させない。
- 一方、`/app/analysis`がreload時にanalysis固有stateを復元しないgapは残る。
- 将来state-aware URLを設計する場合、Organization権限、stale resource、share失効、history UXを同時に決める必要がある。

## 8. Architecture impact

`/app`と`/app/analysis`が同じ`PanoptesShellEntryPage`とruntime modelを共有する現在のArchitectureはDecisionと整合する。新しいLayout、Page、controller、storeは不要である。Route Ownership文書にはDecision referenceとroleだけを追記し、Product Decisionの詳細はRegisterを正本とする。

## 9. Implementation impact

`NO_IMMEDIATE_SOURCE_CHANGE`。現行route、navigation、presentationがA-Aの最低限のRoute Roleを既に満たすため、実装Phaseを追加しない。本Phaseでsource、redirect、metadata、UI label、active tab、pathname mappingを変更していない。

## 10. Excluded state contract — PD-01B

次を`PD-01B App Deep-link / State Restoration Contract`として`NEEDS_DISCOVERY`へ分離する。

- tab、project、snapshot、queryのURL表現と復元
- reload、bookmark、share、browser back/forward
- stale/deleted resource behavior
- Organization境界、権限エラー、share失効

PD-01BはPD-01Aをblockせず、今回のDecisionからdistinct state実装を推測しない。

## 11. Remaining

- Marketing route intentは`NEEDS_DISCOVERY`のまま維持する。
- PD-01 parentも`NEEDS_DISCOVERY`を維持する。
- `/app/analysis`の正式UI namingはProduct/Design判断へdeferする。
- analytics、metadata、share/security、state restorationは別Decision後に実装する。

Technical Debt `PD-01`は部分解消とする。App Route Role debtは解消したが、MarketingとPD-01Bが残るため全体をresolvedにはしない。

## 12. Revisit condition

route-aware analysis state、project/snapshot URL、bookmark/share link、browser history UXのいずれかを設計するとき、またはshared runtimeではRoute Roleを満たせない具体的要件が承認されたときにPD-01Bをreviewする。PD-01A自体はProduct IAが変更される場合だけ再審査する。

## 13. Quality results

- `npm run check`: Svelte 0 errors / 0 warnings
- `npm run lint`: ESLint 0 errors / 38 warnings
- `npm run format:check`: PASS
- `npm run check:openapi`: 18 / 18 operations PASS
- `npm run check:frontend-inventory`: unresolved import 0、cycle 0、inventory stale 0
- `npm run test`: 22 files / 257 tests PASS
- `npm run build`: PASS
- `npm run test:secrets`: 63 build files PASS
- `npm run test:smoke`: public/protected route期待値PASS
- `npm run quality`: exit 0

Production routes 8、Route Svelte 12、reusable components 124、production reachable 119を維持した。

## 14. References

- [Product Decision Register](../product/product-decision-register.md)
- [PD-01 Route Intent Discovery](./62-pd01-route-intent-discovery.md)
- [PD-1 Product Decision Backlog Review](./59-product-decision-backlog-review.md)
- [Frontend Route Ownership](../architecture/frontend-route-ownership.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [B-3Q Route Ownership](./54-phase-b3q-route-ownership-refactor.md)
