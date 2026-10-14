# Phase B-3R Wrapper Consolidation

更新日: 2026-08-18

## Objective

B-3Q後に残ったproduction compatibility wrapper 3件と`/app/analysis` pass-through layoutを、Product URL・UI・auth/Organization境界を変えずに安全に整理する。

## Changes

- `/admin`とdev UI previewのAdmin importを`ComponentsBase/AdminConsole.svelte`へ直接接続した。
- Primary/Secondary Heroのpreview importをrootの`AppTopDummy.svelte` / `AppResultsDummy.svelte`へ直接接続した。
- 透明alias 3件を削除した。
- 責務のない`src/routes/app/analysis/+layout.svelte`を削除し、親App layoutの直接継承へ戻した。
- Marketing 3 route entryとApp 2 route entryはSvelteKit URL契約として保持した。
- wrapper consolidation regression testを追加し、inventory/route ownership testを更新した。
- frontend inventory CSV 2件を再生成した。

## Before / after

| Metric | B-3Q | B-3R |
| --- | ---: | ---: |
| reusable Svelte | 127 | 124 |
| production reachable | 122 | 119 |
| `ACTIVE_CANONICAL` | 119 | 119 |
| `ACTIVE_WRAPPER` | 3 | 0 |
| `DEV_ONLY` | 3 | 3 |
| `DEFER` | 2 | 2 |
| route Svelte | 14 | 13 |
| total Svelte | 141 | 137 |

Production reachabilityの3減は正本へ到達したまま透明aliasだけを除いた結果であり、production機能の消失ではない。

## Deleted files

- `src/lib/components/ComponentsBase/admin/AdminConsole.svelte`
- `src/lib/components/ComponentsBase/dummy/AppTopDummy.svelte`
- `src/lib/components/ComponentsBase/dummy/AppResultsDummy.svelte`
- `src/routes/app/analysis/+layout.svelte`

## Import replacements

| Caller | Before | After |
| --- | --- | --- |
| `src/routes/admin/+page.svelte` | `ComponentsBase/admin/AdminConsole.svelte` | `ComponentsBase/AdminConsole.svelte` |
| `PanoptesUiPreviewPage.svelte` | `ComponentsBase/admin/AdminConsole.svelte` | `ComponentsBase/AdminConsole.svelte` |
| `LandingHeroPrimarySection.svelte` | `ComponentsBase/dummy/AppTopDummy.svelte` | `ComponentsBase/AppTopDummy.svelte` |
| `LandingHeroSecondarySection.svelte` | `ComponentsBase/dummy/AppResultsDummy.svelte` | `ComponentsBase/AppResultsDummy.svelte` |

## Behavior preservation

- rendered canonical child、props、callbacks、route URLは同じ。
- Top previewはHeader/Hero/Sidebar + industry、Results previewはHeader + competitorかつHero/Sidebarなしを維持した。
- DOMとCSSを持たないalias/layoutだけを除いたため、materialなDOM・visual変更はない。
- `/app` parent layoutのHeader、conditional Top Hero、spacing、auth/Organization data継承は変更していない。
- Marketing PreviewとActual Appの境界を維持した。

## Tests and inventory

- 局所回帰: 3 files / 18 tests PASS。
- `wrapper-consolidation.test.ts`で正本import、preview preset、削除file不在、route entry保持、親layout継承を検査する。
- inventory: 124 reusable、119 reachable、119 canonical、0 wrapper、3 dev-only、2 DEFER。
- unresolved local import 0、cycle 0、inventory stale 0。

## Quality

- `npm run check`: PASS（0 errors / 0 warnings）。
- `npm run lint`: PASS（0 errors / 38 warnings）。
- `npm run format:check`: PASS。
- `npm run check:openapi`: PASS（18 operations / 18 unique operation IDs）。
- `npm run check:frontend-inventory`: PASS（unresolved 0 / cycles 0 / stale 0）。packageには`check:inventory` aliasがないため、この既存canonical scriptを使用した。
- `npm run test`: PASS（22 files / 257 tests）。
- `npm run test:auth-smoke`: PASS（5 cases）。
- `npm run build`: PASS。
- `npm run test:secrets`: PASS（64 build files）。
- `npm run test:smoke`: PASS（11 routes）。
- `npm run quality`: PASS（exit 0）。

## Remaining

- `/`、`/lp`、`/plan`のcanonical URL/campaign intentはProduct判断が必要。
- `/app`と`/app/analysis`のURL意味およびanalysis-specific初期stateはProduct判断が必要。
- production-reachable `Dummy`はpreview componentだがlegacy namingであり、標準化方針後にrenameを検討する。
- preview surfaceの大規模抽出、Header分割、score/axis統合は本Phaseの範囲外。

## References

- [Analysis and decisions](./55-compatibility-wrapper-route-entry-analysis.md)
- [Frontend route ownership](../architecture/frontend-route-ownership.md)
- [Frontend inventory summary](../inventory/frontend-inventory-summary.md)
