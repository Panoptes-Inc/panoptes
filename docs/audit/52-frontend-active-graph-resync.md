# Phase B-3P Frontend Active Graph / Component Inventory Resync

更新日: 2026-08-18

## 結論

現行`src`を正本としてSvelte component inventoryとimport graphを再生成した。再利用Svelte componentは126件で、production到達121件、dev-only 3件、Product判断待ち`DEFER` 2件、未分類の`UNREACHABLE`と`UNKNOWN`は0件である。安全性を断定できる削除対象はない。

次のbacklog子課題は **Page構造・責務整理** とし、具体的にはMarketing 3 routeとApp 2 routeの完全一致page、`PanoptesSiteHeader`、Landing Heroからproduction dummy shellへ広がる依存を同じroute ownership監査で扱う。

## 再計算方法

- 対象: `src/lib/components`、`src/lib/features`、`src/routes`。必要なimport解決のため`src/lib/panoptes`、`src/lib/stores`、`src/lib/server`とtest entryもgraphへ含めた。
- `$lib`、relative import、barrel export、dynamic literal importを解決する。
- route pageは祖先`+layout.svelte`を継承する。
- `/dev/`を含むpageはdev graphへ分離する。
- generated `./$types`と画像等のasset importはcomponent dependency対象外とする。
- production、dev、testの順に到達性を判定し、既知のcompatibility wrapperとProduct依存DEFERは明示metadataで分類する。
- `npm run check:frontend-inventory`がCSV stale、解決不能local import、cycleを検出する。

正本scriptは`scripts/audit-frontend-components.mjs`、machine-readable正本は`frontend-component-inventory.csv`である。旧`component-inventory.csv`は互換参照のため同じ生成結果に同期する。

## Current counts

| Metric | Count |
| --- | ---: |
| Reusable Svelte components | 126 |
| `src/lib/components` | 110 |
| `src/lib/features` | 16 |
| Route Svelte files | 14 |
| Total Svelte files | 140 |
| Production reachable | 121 |
| `ACTIVE_CANONICAL` | 118 |
| `ACTIVE_WRAPPER` | 3 |
| `DEV_ONLY` | 3 |
| `TEST_ONLY` | 0 |
| `DEFER` | 2 |
| `UNREACHABLE` | 0 |
| `UNKNOWN` | 0 |
| Unresolved local imports | 0 |
| Import cycles | 0 |

`production reachable`は静的import graphの値であり、conditional renderやauth guardで実際に描画されないcomponentも含む。

## Production routes

| Route | Reached reusable components | Main ownership |
| --- | ---: | --- |
| `/` | 90 | Header + Primary/Secondary Hero + embedded dummy shell graph |
| `/lp` | 90 | `/`と同一page composition |
| `/plan` | 90 | `/`と同一page composition |
| `/login` | 6 | SignUp/Login form feature |
| `/organization/select` | 0 | route-local markup only |
| `/app` | 96 | App layout + Shell entry + Panoptes surfaces |
| `/app/analysis` | 96 | `/app`と同一Shell entry、追加pass-through layout |
| `/app/login/settings` | 17 | placeholder page + App layout static imports |
| `/admin` | 8 | Admin compatibility wrapper + canonical Admin Console tree |

Dev-only routes are `/app/dev/ui` and `/dev/analysis-preview`. Production guardで404となるためproduction graphには含めない。

## Production active graph

```text
/, /lp, /plan
├─ PanoptesSiteHeader
│  ├─ SurveyModal → Survey feature views
│  └─ ContactModal → Contact feature views
├─ LandingHeroPrimarySection
│  ├─ LandingHeroPrimaryVisual
│  └─ AppTopDummy wrapper → AppTopDummy → PanoptesAppShellDummy
└─ LandingHeroSecondarySection
   ├─ LandingHeroSecondaryVisual
   └─ AppResultsDummy wrapper → AppResultsDummy → PanoptesAppShellDummy

/app, /app/analysis
├─ app/+layout
│  ├─ PanoptesSiteHeader
│  └─ PanoptesTopHero → Search Area / Brand
└─ PanoptesShellEntryPage
   └─ PanoptesShellPage
      ├─ PanoptesShellMainSurface
      │  ├─ Analysis Surface / Overlay
      │  └─ Snapshot Surface
      ├─ Header Meta / Tab Nav / Toast Stack
      └─ Create Project Sheet

Snapshot Surface
├─ Industry → overview / distribution / opportunity / position / rating
├─ Competitor → summary / company grid / expanded detail / compare
├─ Self → overview / comparison / evaluation / improvement candidates
├─ Strategy → project rail / overview / improvement / roadmap
└─ Panoai tab

/login → SignUpForm → fields / terms / Turnstile / feedback / button
/admin → AdminConsole wrapper → canonical AdminConsole → tabs / dashboard / metrics / users
/organization/select → route-local UI
```

Landing Heroがvisual mockとして`PanoptesAppShellDummy`を描画するため、Marketing routeはSnapshot以下の現行domain componentまでproduction static graph上で到達する。これはfalse positiveではなく現行production dependencyである。

## Dev and test graph

| Classification | Components |
| --- | --- |
| `DEV_ONLY` | `AnalysisLoadingShell`、`AnalysisLoadingStageContent`、`PanoptesUiPreviewPage` |
| `TEST_ONLY` | none |

Dev previewからproduction componentも参照されるが、productionからも到達するcomponentは`ACTIVE_CANONICAL`を優先した。

## Parent / child boundary updates from B-3A–B-3O

| Area | Current parent | Current children / boundary | Import direction |
| --- | --- | --- | --- |
| Signup | `SignUpForm` | Fields、Terms、Turnstile、Feedback、controller | route/modal → public form → feature internals |
| Survey | `SurveyModal` | ModalFrame、Form、QuestionList、Navigation、Feedback | Header → modal → feature internals |
| Contact | `ContactModal` | ModalFrame、Form、Fields、Feedback | Header → modal → feature internals |
| Landing | Primary/Secondary Section | Visual + dummy preview composition | page → section → visual/dummy |
| Panoptes Shell | `PanoptesShellEntryPage` / `PanoptesShellPage` | controller/actions/mapping + MainSurface | route → entry → shell → surface |
| Strategy Roadmap | `StrategyAnalysisRoadmapSection` | PhaseCard → TaskList / StatusActions | Snapshot → Strategy → Roadmap |
| Competitor | `CompetitorAnalysisTab` | CardGrid / CompanyCard / CompareStage / ExpandedCard → Metrics / Evidence / Radar | Snapshot → Competitor composition → display views |
| Self | `SelfAnalysisTab` | OverviewPanel → Summary / Evidence; Comparison / Evaluation / Candidate Grid are siblings | Snapshot → Self composition → display views |

Feature内からrouteやserverへの逆importはなく、cycleは0件である。

## Unreachable and deferred review

Production非到達は5件だが、3件はdev-onlyであり、残る2件はB-1/B-2から継続するProduct判断待ちである。

| Component | Classification | References | Decision |
| --- | --- | --- | --- |
| `StrategyAnalysisPlanRail` | `DEFER` | child Cardを1件参照 | plan選択とproject選択の意味が確定するまで保持 |
| `StrategyAnalysisPlanRailCard` | `DEFER` | deferred parentのみ | 親判断まで保持 |

未分類`UNREACHABLE`、`UNKNOWN`、import countだけを根拠にした削除候補は0件である。

## Wrapper review

| Wrapper | Canonical target | Current reachability | Decision |
| --- | --- | --- | --- |
| `admin/AdminConsole.svelte` | `ComponentsBase/AdminConsole.svelte` | `/admin`、dev preview | `KEEP_WRAPPER`; route compatibility alias |
| `dummy/AppTopDummy.svelte` | `ComponentsBase/AppTopDummy.svelte` | Marketing Primary Hero | `KEEP_WRAPPER`; Landing compatibility alias |
| `dummy/AppResultsDummy.svelte` | `ComponentsBase/AppResultsDummy.svelte` | Marketing Secondary Hero | `KEEP_WRAPPER`; Landing compatibility alias |

3件ともpass-through onlyであり`MERGE_CANDIDATE`ではあるが、現行route/section importを変更する別Phaseまでは削除しない。

## Duplicate / shared candidate reconciliation

追跡候補は14件である。5件はexact page/alias duplicate candidate、9件はB-3Oまでに記録したbounded shared-presentation candidateである。

| Candidate | Locations | Same responsibility? | Same Product semantics? | Decision | Revisit |
| --- | --- | --- | --- | --- | --- |
| Marketing page composition | `/`、`/lp`、`/plan` | exact file content | yes at present | `SHARE_LATER` via route ownership | next Page phase |
| App Shell entry page | `/app`、`/app/analysis` | exact file content | yes at present | `SHARE_LATER`; confirm route intent | next Page phase |
| Admin Console alias | lower-case admin wrapper / root canonical | pass-through duplicate | yes | `MERGE_CANDIDATE` | next Page phase |
| App Top Dummy alias | dummy wrapper / root canonical | pass-through duplicate | yes | `MERGE_CANDIDATE` | Landing route phase |
| App Results Dummy alias | dummy wrapper / root canonical | pass-through duplicate | yes | `MERGE_CANDIDATE` | Landing route phase |
| Company identity | Company / Expanded | related summary/detail | yes | `KEEP_SEPARATE` views | taxonomy phase |
| Overall score input | Company / Expanded | same input | yes | `SHARE_NOW` mapping already done | Product contract phase |
| Score-ring formula | Company +24° / Expanded +30° | related visual | unknown contract | `PRODUCT_DECISION_REQUIRED` | Product decision |
| Score-bar percentage | Company / Expanded | same formatter | yes | `SHARE_NOW` done | regression coverage |
| Score CSS | Company / Expanded | partial visual duplicate | layout differs | `SHARE_LATER` token candidate | standardization |
| Compare label | Company / Expanded | same | yes | `SHARE_NOW` done | compare policy change |
| Compare interaction | grid / compare stage | different roles | related | `KEEP_SEPARATE` | parent flow audit |
| URL/external link | Expanded only | no | n/a | `KEEP_SEPARATE` | none |
| Six-axis presentation | Expanded / Self-related axes | different current labels/formulas | undecided | `PRODUCT_DECISION_REQUIRED` | Product axis contract |

## Top 20 production-active reusable components by lines

| Rank | Component | Lines | Evaluation |
| ---: | --- | ---: | --- |
| 1 | `PanoptesSiteHeader` | 313 | next Page ownership candidate; nav/modal/auth/CSS concentration |
| 2 | `CompetitorAnalysisCompanyCard` | 289 | B-3O audited; size alone is not next priority |
| 3 | `StrategyAnalysisProgressOverviewPanel` | 261 | active, unaudited concentration |
| 4 | `PanoptesAnalysisStartSearchBar` | 250 | active search/analysis entry responsibility |
| 5 | `HeaderDummy` | 239 | production-reachable through Landing dummy shell |
| 6 | `StrategyAnalysisImprovementSection` | 231 | active Strategy display concentration |
| 7 | `LandingHeroSecondaryVisual` | 226 | B-3E/G audited visual responsibility |
| 8 | `StrategyAnalysisRoadmapTaskList` | 223 | B-3L extracted cohesive view |
| 9 | `SelfAnalysisComparisonPanel` | 221 | active, Product-axis dependency |
| 10 | `LandingHeroPrimaryVisual` | 210 | B-3E/G audited visual responsibility |
| 11 | `PanoptesAppShellDummy` | 202 | production dependency breadth requires Page audit |
| 12 | `CompetitorAnalysisExpandedMetrics` | 193 | B-3M extracted cohesive view |
| 13 | `PanoptesShellPage` | 183 | B-3I/K split composition root |
| 14 | `SelfAnalysisOverviewSummary` | 178 | B-3N extracted cohesive view |
| 15 | `PanoptesHeaderMeta` | 171 | shared shell metadata presentation |
| 16 | `StrategyAnalysisRoadmapPhaseCard` | 169 | B-3L audited composition boundary |
| 17 | `PanoptesCreateProjectSheet` | 160 | active form/sheet candidate |
| 18 | `SearchBarDummy` | 155 | production-reachable through Landing dummy shell |
| 19 | `PanoptesShellMainSurface` | 154 | B-3I extracted orchestration view |
| 20 | `SelfAnalysisOverviewEvidence` | 152 | B-3N extracted cohesive view |

## Responsibility coverage matrix

| Area | Major component | Reachability audited | Responsibility audited | Refactored | Remaining |
| --- | --- | --- | --- | --- | --- |
| Auth | `SignUpForm` | yes | yes | B-3A | provider/E2E/Product auth UX |
| Landing | Hero Sections / Visuals | yes | yes | B-3E–H | route duplication and dummy dependency breadth |
| Shell | Entry / Shell / MainSurface | yes | yes | B-3I–K | route aliases, Header ownership, props drilling |
| Self | Overview / Comparison / Candidate | yes | Overview yes | B-3N | axis contract, naming, comparison responsive |
| Competitor | Company / Expanded / Compare | yes | Company and Expanded yes | B-3M/O | score formula and compare flow |
| Industry | Analysis sections | yes | partial/B-2 | B-2 canonicalized | responsibility/CSS/responsive audit |
| Strategy | Roadmap / overview / improvement / rails | yes | Roadmap Phase Card yes | B-3L | Plan Rail decision, props flow, remaining panels |
| Admin | Console / Dashboard | yes | A-1 canonical check | wrappers repaired | auth guard task separate; wrapper/page ownership |

## Backlog child progress

| Backlog child | Status | Evidence / remaining |
| --- | --- | --- |
| 1. Large component responsibility cleanup | `SUBSTANTIALLY_COVERED` | B-3A–O; remaining Header and unaudited panels are risk-selected, not line-order queue |
| 2. Page structure / responsibility | `IN_PROGRESS` | Landing Hero ownership and Shell split completed; exact route duplicates/Header ownership remain |
| 3. Component structure / dependencies | `READY_TO_CLOSE` | B-3P regenerated graph/CSV and automated stale/cycle/unresolved checks |
| 4. Unnecessary / unused code | `SUBSTANTIALLY_COVERED` | no unknown unreachable; only Product-dependent DEFER 2件 |
| 5. Duplicate code / components | `IN_PROGRESS` | 14 candidates classified; route/wrapper candidates not yet consolidated |
| 6. Technical debt audit | `IN_PROGRESS` | parent debt table synchronized; browser/responsive/Product/backend debt remains |
| 7. Frontend structure policy | `NOT_STARTED` | handoff candidates exist; formal taxonomy/directory policy is not approved |

## B-3A–B-3O changes reflected

- Deleted: B-3C unreachable `LoginModal`; B-1/B-2 deletion results remain absent from current tree.
- New split views: Signup 4、Survey 5、Contact 4、Landing Visual 2、Shell MainSurface、Roadmap 2、Competitor detail 2、Self overview 2。
- New controllers/mappings: Signup/Survey/Contact state、Landing wave/runtime、Shell controller/actions/mapping、AnalysisJob adapter、Organization-scoped BFF command/client、Strategy/Competitor/Self presentation mapping。
- Canonical boundaries: Form/Modal shells、Landing page-owned Hero、Panoptes Shell entry/composition、Roadmap Phase Card、Competitor Company/Expanded、Self Overview。
- Wrapper changes: B-1 deleted Signup transparent wrappers; A-1 admin import wrappers repaired; current compatibility wrapperは3件。
- Reachability changes: dev previewをproductionから分離し、Landing dummy compositionがproduction graphであることを明示した。

## Naming debt

| Debt | Decision | Reason |
| --- | --- | --- |
| Self improvement components retain `StrategyRecommendation` filenames | `RENAME_LATER` | current imports alias the correct Self responsibility; directory policy pending |
| `ComponentsBase` contains domain, shell, dummy, wrappers, and generic UI | `RENAME_LATER` | broad move would create churn before taxonomy policy |
| `industry/admin` casing differs from `Competitor/Self/Strategy` | `RENAME_LATER` | Windows case behavior and import migration risk |
| Production Landing uses `Dummy`-named components | `DEFER` | visual mock intent and route ownership must be decided first |
| `PanoptesPanoaiTab` terminology | `PRODUCT_DEPENDENT` | feature naming/product scope is not established |
| `/app/login/settings` serves generic scaffold content | `DEFER` | route ownership/removal decision required |

No large rename is performed in B-3P.

## Directory debt

- `ComponentsBase` is both legacy umbrella and current canonical home.
- `features` is adopted for Signup/Survey/Contact/Landing/Shell only; Industry/Competitor/Self/Strategy remain under `ComponentsBase`.
- `data`, `mapping`, `controller`, `api`, and `server` names encode different abstraction levels across features.
- Deep imports are common; public feature entry points exist only for selected features.
- Dummy fixtures and production visual previews are not cleanly separated by directory or dependency rule.

October policy should define route composition, feature public entry, domain display, pure mapping, controller, primitive, fixture/dev-only, and server-only categories before moving files.

## Technical debt resync

| Debt | Status | Risk | Priority | Dependency | Timing |
| --- | --- | --- | --- | --- | --- |
| Stale component inventory/active graph | resolved in B-3P | wrong cleanup decisions | high | automated check | keep in quality |
| Legacy Snapshot 11 | resolved in B-2 | duplicate Product/UI contract | high | B-2 evidence | closed |
| Exact Marketing/App page duplication | new | route intent and ownership drift | high | route Product intent | next Page phase |
| Landing Hero → full dummy shell production dependency | new | bundle/ownership/test graph breadth | high | visual ownership decision | next Page phase |
| Compatibility wrappers 3 | active | alias/directory ambiguity | medium | caller migration | Page/taxonomy phase |
| Business API operations absent from Rails | active | production workflow unavailable | highest | backend vertical slice | dedicated backend phase |
| Browser E2E/visual regression absent | active | responsive/interaction regressions | high | browser runtime/fixtures | before release candidate |
| Strategy props drilling | active | contract evolution cost | medium | Product Strategy contract | after read slice |
| Strategy Plan Rail pair | active/deferred | accidental deletion or wrong merge | high | Product decision | decision phase |
| Competitor 24°/30° formula difference | active | score meaning drift | high | Product score contract | before score sharing |
| Self/Competitor axis mismatch | active | premature commonization | medium | Product axis contract | standardization phase |
| Responsive inconsistencies | active | mobile overflow/layout defects | high | visual baseline | before release candidate |
| Hard-coded CSS/token duplication | active | maintenance drift | medium | Design Token policy | October standardization |
| ESLint warning baseline | active | maintenance friction | medium | touched-area cleanup | incremental |

## Deferred resync

- `StrategyAnalysisPlanRail` / `StrategyAnalysisPlanRailCard`: Product Decision Required.
- Marketing aliases `/`、`/lp`、`/plan` and App aliases `/app`、`/app/analysis`: confirm route semantics before consolidation.
- `/app/login/settings`: retain/remove/implement decision.
- Competitor score formula and application-wide six-axis contract.
- Self improvement candidate naming/schema and Self/Competitor shared-axis decision.
- Rails/BFF/OpenAPI/Auth/Organization changes outside this inventory phase.
- Tailwind、Design Token、large directory migration、large rename/delete。

## October frontend-standardization handoff

- Component taxonomy and feature public-entry rules.
- `ComponentsBase` retirement/migration criteria and directory casing policy.
- Production fixture/dummy/dev-preview dependency rule.
- Design Tokens for surface, score, status, spacing, radius, shadow, typography.
- Responsive Desktop/Tablet/Mobile baseline and stacking/overflow rules.
- Accessibility standard for dialog, navigation, score/status, comparison, external link, focus.
- UI regulation for props/callback naming, fallback/empty/partial states, long text, selected/disabled states.
- Tailwind adoption criteria after token and visual baseline decisions.

## Delete candidates

High-confidence safe deletion candidate is **0**. The following are review candidates, not deletion authorization.

| Candidate | Reachability | References | Reason | Confidence | Recommended Phase |
| --- | --- | --- | --- | --- | --- |
| Admin Console wrapper | production | `/admin`, dev preview | pass-through alias | medium | next Page phase |
| App Top Dummy wrapper | production | Primary Hero | pass-through alias | medium | Landing/Page phase |
| App Results Dummy wrapper | production | Secondary Hero | pass-through alias | medium | Landing/Page phase |
| Strategy Plan Rail | none | deferred child | potentially superseded by Project Rail | low | Product decision phase |
| Strategy Plan Rail Card | deferred subgraph | Plan Rail only | removable only with parent decision | low | Product decision phase |

## Next backlog recommendation

### Recommended — Page structure / responsibility

**Phase B-3Q: Marketing/App Route Alias and Header Ownership Audit**

- `/`、`/lp`、`/plan`の完全一致pageを、route semanticsとURL維持を前提に共通compositionへ寄せられるか判定する。
- `/app`、`/app/analysis`の完全一致Shell entryと不要なpass-through layoutを判定する。
- `PanoptesSiteHeader`のroute ownership、modal ownership、auth action、およびLanding dummy shellへの重複Header依存を監査する。

選定理由はproduction impactが広く、exact duplicateの根拠が強く、B-3Pで初めて可視化された90/96-component route graphを縮約または正当化できるためである。

### Alternative A — Duplicate code / component confirmation

Compatibility wrapper 3件とMarketing/App exact page duplicatesだけを対象に、direct import移行または共通route compositionを設計する。範囲は狭いがHeader/dummy ownershipを残す。

### Alternative B — Technical debt audit

Browser visual baselineとDesktop/Tablet/Mobile responsive監査を先行する。release riskには効くが、現在の実行環境では操作可能browserがないため外部browser/fixture準備がdependencyとなる。

## Validation

- Inventory generation/check: PASS
- Unresolved local imports: 0
- Cycles: 0
- No component deletion, large refactor, product logic, API, design, Tailwind, directory migration, or rename was performed.

Quality details are finalized in the B-3P Development Log entry after the full gate.

## References

- [Frontend component inventory](./frontend-component-inventory.csv)
- [Compatibility component inventory](./component-inventory.csv)
- [Frontend active graph](../architecture/frontend-active-graph.md)
- [B-1 reachability decision](./19-component-reachability-final.md)
- [B-2 implementation](./22-phase-b2-implementation.md)
- [Frontend inventory summary](../inventory/frontend-inventory-summary.md)

