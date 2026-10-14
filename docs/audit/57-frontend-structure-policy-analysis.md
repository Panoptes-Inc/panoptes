# Phase B-3S Frontend Structure Policy Analysis

更新日: 2026-08-18

## Conclusion

B-3A〜B-3Rで実証されたroute ownership、feature controller/mapping、canonical client、preview/runtime分離、wrapper 0の状態をFrontend Structure Policyとして正本化する。実装判断は「新規コードから適用、既存コードはtouch-and-migrate、明確な横断debtだけ専用Phase、big-bang禁止」とする。

`ComponentsBase`は単一責務のbase layerではなくlegacy bucketであるため`GRADUAL_DEPRECATION`。ただし124 reusable / 119 production canonicalが安定している現時点で一括移動する利益は、import churnとvisual/regression riskを上回らない。

## Evidence from B-3A–B-3R

| Evidence | Structural decision |
| --- | --- |
| B-3A–D: Auth/Survey/Contactをcomponents/controller/service/validationへ分離 | feature-local lifecycleとpresentationを分ける |
| B-3E–H: Hero view/animation、layout ownership、runtime errorを分離 | Page固有Heroをlayoutへ置かず、visual helperをpureに保つ |
| B-3I: Shell controller/mapping/main surfaceを分離 | componentからasync lifecycle/polling/store coordinationを抽出 |
| B-3J: canonical AnalysisJob adapter | API modelとruntime/display modelを同一typeにしない |
| B-3K: Organization-scoped command/client | explicit `organizationId`、AbortSignal、client injection、mock fallback禁止 |
| B-3L–O: Strategy/Self/Competitor mapping/view split | pure presentation mappingを共有し、Product formulaは統合しない |
| B-3P: inventory/Active Graph | reachability、unresolved、cycleをmachine-checkする |
| B-3Q: route ownership | thin route entryとshared compositionを分ける |
| B-3R: wrapper consolidation | canonical importを優先し透明alias/pass-through layoutを常態化させない |

## Current structure inventory

| Location | Current Responsibility | Problems | Future Responsibility |
| --- | --- | --- | --- |
| `src/routes` | SvelteKit page/layout/server/BFF endpoints | `/app/login/settings` temporary、Product alias未決定 | thin route entry、persistent layout、server/BFF boundary |
| `src/lib/components` | 122 files。UI、legacy composition、preview、analysis dev UI | `ComponentsBase`中心に責務混在 | shared presentation + 段階移行中legacy canonical |
| `src/lib/components/ComponentsBase` | Admin/Auth/Landing/Shell/Self/Competitor/Strategy/Industry/preview/data | domain/casing/feature/data/helperが混在するlegacy bucket | `GRADUAL_DEPRECATION`; 新規配置禁止 |
| `src/lib/features` | 59 files。auth/contact/survey/landing/shell/analysis-job/organization | 部分導入。indexからComponentsBaseへ逆参照あり | feature composition/controller/command/mapping/typesの主配置 |
| `src/lib/panoptes` | 29 files。actions、api、domain、polling、selectors、stores、types/utils | feature横断runtimeとlegacy/mock clientが同居 | browser runtime/API abstraction。backend contractに沿い段階整理 |
| `src/lib/server` | 10 files。auth、Supabase、Rails proxy | business BFF endpointはRails未実装 | server-only session/cookie/BFF/Rails utility |
| `src/lib/stores` | legacy `analysis-feed.js` 1件 | ownership/lifecycle不明 | 新規global store defaultにしない。利用監査後移行/削除判定 |
| `src/lib/db`, `mock`, `mocks` | dummy/fixture/mock data | preview/test/runtime mock namingが分散 | Preview FixtureとMock transportを分類して配置 |

現行補助責務は`features/*/{controller,state,mapping,services,utils}`、`panoptes/{api,domain,polling,selectors,stores,utils}`、`ComponentsBase/*/data`に分散している。特にview model/mappingが`ComponentsBase/*/data`にある点はtarget policyに対してlegacyだが、B-3Sでは移動しない。

## Current dependency findings

- 正方向は`routes -> feature/page entry -> Shell controller/actions -> client -> BFF`としてShell/Authで成立している。
- client Svelte componentから`src/lib/server`へのimportは確認されない。
- `features/landing`と`features/panoptes-shell`は既存`ComponentsBase` canonical viewをimportする。
- `ComponentsBase`側もAuth/Survey/Contact/Landing/Shell featureをimportするため、layer間の方向は現状`PARTIAL`。inventory上cycle 0だが、新規逆方向を増やさない。
- `features/{auth/signup,contact,survey}/index.ts`が`ComponentsBase` entryをexportする。現行public entryとして保持し、対象を移す時に同時是正する。
- `src/lib/panoptes/domain`がAnalysisJob feature mappingを参照する箇所は、将来domain/presentation層名を見直す候補。現在はpure status helperでcycleなし。

## Taxonomy decisions

正式分類はRoute Entry、Page Entry、Layout/Shell、Feature Component、Composite Component、Presentation Component、Preview Component。WrapperはComponent taxonomyと別軸でRoute Entry、Feature Entry、Compatibility、Preview Alias、Legacyを管理する。

主要判断:

- Route entryは薄くてよく、SvelteKit framework boundaryとして保持する。
- PresentationはAPI/business mutation/store mutationを持たない。
- Composite/Featureはview modelとcallback/commandを接続する。
- Shellはpage-level orchestrationとlocal navigationを持てるがraw HTTPを持たない。
- Previewはproduction reachableでもruntimeではなく、deterministic fixtureで描画する。

## Route, layout, and Header

- `/`、`/lp`、`/plan`はroute entryを保持し、`MarketingLandingPage`でcomposition共有。
- `/app`、`/app/analysis`はroute entryを保持し、`PanoptesShellEntryPage`を共有。
- root layoutはglobal bootstrap、App layoutはpersistent Header/Top Hero/shellを所有。
- page-specific HeroはPage composition所有。children-only analysis layoutはB-3Rで削除済み。
- Marketing Page-owned Header / App Layout-owned Headerの`MIXED_INTENTIONAL`を正式許可する。

## Preview and naming findings

Marketing previewはActual Appではない。`AppTopDummy`/`AppResultsDummy`がpreset、`PanoptesAppShellDummy`がpreview shell、`HeaderDummy`/`SearchBarDummy`がpreview childである。これらは`PREVIEW_COMPONENT + LEGACY_NAMING`。fixture dataはruntime store/BFFへ接続せず、production client failureからmock fallbackしない。

Naming debt:

- `ComponentsBase`: responsibilityを表さないlegacy bucket。
- `Dummy`: production visualの実態はPreview。
- `Self/strategy/SelfAnalysisStrategyRecommendation*`: Improvement Candidateとの意味不一致。
- `PanoptesPanoaiTab`: Product naming/casingの一貫性要確認。
- `Self`/`Strategy`/`Competitor`等のdirectory casing混在。

今回はrenameせず、touch-and-migrateまたはexplicit rename Phaseへ送る。

## View model, mapping, and Product formula

View Modelはraw domain/APIをdisplay-safeにし、fallback、format、derived display state、normalized listを提供する。API/persistence/mutationは持たない。Presentation helperはlabel/tone/percentage/safe URL/display sortingまでとする。

Canonical score formula、axis definition、business threshold、Strategy eligibility、plan usageはProduct/Rails contractでありFrontendで正本化しない。Competitor Company/Expanded ringの24°/30°差はlegacy behaviorとして別helperを維持する。

## Controller, command, client, state

- Controller: async lifecycle、polling/retry/abort、reconnect、command coordination、state transition、cleanup。
- Command: typed input、explicit Organization ID、AbortSignal、client injection。global storeからscopeを推測しない。
- Client: typed same-origin `/api/panoptes/v1` transport、timeout/abort/error mapping。production mock fallbackと未実装legacy request禁止。
- State: local UIはcomponent、derived displayはmapping/selector、runtimeはcontroller/store、server/business source of truthはRails。
- Store: shared lifecycleが必要なstateだけ。単一component stateのglobal化禁止。

## Shared and duplicate decisions

Same visualだけでは共有しない。Same responsibility、Product semantics、lifecycle、interaction contract、dependency directionを満たす場合だけshared化する。新規作成前に`rg`、Active Graph、inventory CSV、既存mapping/helper、canonical ownerを確認する。

Large componentは行数thresholdではなく、state/side effect/mapping/markup/style/reuseと変更理由の集中で監査する。

## Policy compliance spot check

| Area | Result | Compliant evidence | Gap / exception |
| --- | --- | --- | --- |
| Landing | `PARTIAL` | Page-owned composition、pure wave/visual、route entry共有 | feature↔ComponentsBase、Preview legacy naming |
| Shell | `PARTIAL` | controller/mapping/main surface/client境界 | Shell/EntryがComponentsBase、dummy fallback/dependency breadth |
| Self | `PARTIAL` | display-safe view model、view split、APIなし | mappingがcomponent data配下、Strategy legacy name、responsive debt |
| Competitor | `PARTIAL` | view model/helper共有、Product formula分離 | mapping配置、score contract/Product decision |
| Strategy | `PARTIAL` | roadmap view/mapping split、task callback境界 | Plan Rail DEFER、mapping配置、hard-coded presentation |
| Auth | `PARTIAL` | controller/service/validation/feature structure | public feature indexがComponentsBase compositionをexport |

全領域で重要なruntime責務分離は成立しているため`LEGACY`全面判定ではない。主な未適合は配置と命名であり、動作を変えない段階移行対象とする。

## Exceptions

| Exception | Reason | Owner | Revisit condition |
| --- | --- | --- | --- |
| thin Marketing/App entries | URL contract | Product + Frontend | canonical/alias decision |
| mixed Header ownership | route-family lifecycle差 | Frontend Architecture | Header contract変更 |
| ComponentsBase canonical paths | regression/import churn回避 | Frontend Architecture | touch or dedicated migration |
| production `Dummy` names | preview contractを先に確定 | Marketing/Frontend | naming/dependency audit |
| Strategy Plan Rail 2件 | Product semantics不明 | Product/Strategy | plan/project decision |
| temporary settings route | purpose/owner未確定 | Product/Auth | lifecycle decision |

## Decision matrix

| Concern | Current | Target | Migration | Timing |
| --- | --- | --- | --- | --- |
| ComponentsBase | mixed bucket | feature/shared owners | gradual deprecation | P1/P2 |
| features | partial | main feature boundary | new/touched code | P0/P1 |
| Route Entry | thin entries | framework boundary | keep | current |
| Preview | legacy names/fixtures | deterministic Preview/Fixture | contract then rename | P2 |
| Wrapper | production 0 | exceptional only | prevention | P0 |
| Mapping | feature + component/data | feature-local pure mapping | touch-and-migrate | P1 |
| Controller | selected features | lifecycle boundary | criteria-based | P0/P1 |
| Client | canonical identity, business unavailable | typed BFF clients | Rails implementation後 | dependency |
| Naming | casing/legacy mix | responsibility naming | no big bang | P1/P2 |

## Migration and no-big-bang decision

- P0: new codeにPolicyを適用。
- P1: touched existing codeを安全な範囲で移行。
- P2: 横断debtを専用Phaseで処理。
- P3: 全directory/rename/component再配置は禁止。

一括移行はregression、history/blame、import churn、delivery停止、Product判断混入を招く。現在のquality baselineと119 canonical reachabilityを維持しながら移行する。

## Technical debt register

| Description | Risk | Priority | Dependency | Recommended timing | Status |
| --- | --- | --- | --- | --- | --- |
| `ComponentsBase` mixed ownership | wrong placement/逆依存 | high | structure policy | touch + dedicated slices | active |
| production `Dummy` naming | preview/runtime混同 | high | preview contract/visual baseline | next technical-debt audit | active |
| Preview dependency/extraction | runtime誤接続/large surface | medium | visual regression | after naming audit | active |
| Header responsibility | modal/nav/auth集中 | medium | route/header UX | dedicated audit | active |
| directory casing | import/name churn | low | naming plan | touch-and-migrate | active |
| Self legacy Strategy naming | Product概念誤認 | medium | Product naming | explicit rename Phase | active |
| `PanoptesPanoaiTab` naming | taxonomy不一致 | low | Product naming | touched/dedicated rename | active |
| Product route intent | duplicate URL lifecycle不明 | high | Product decision | before redirect/deletion | deferred |
| Strategy Plan Rail 2件 | wrong merge/delete | high | Product semantics | decision後 | DEFER |
| score/axis contract | inconsistent formula/labels | high | Product/Backend contract | standardization前 | deferred |
| browser E2E/visual regression | visual regression検出不足 | high | test infrastructure | next quality roadmap | active |
| responsive behavior | overflow/layout risk | high | visual baseline | standardization Phase | active |
| Design Token | hard-coded visual drift | medium | taxonomy/responsive | October | planned |
| Tailwind | migration churn | low until token | Design Token | token後のみ | deferred |
| `/app/login/settings` | exposed orphan scaffold | medium | Product/Auth owner | closure decision | active |
| legacy global `analysis-feed` store | ownership不明 | low | usage audit | touched/technical audit | active |

## Product Decision Required

| Decision | Why architecture cannot decide it |
| --- | --- |
| `/`, `/lp`, `/plan` canonical meaning | campaign/plan URLはProduct contract |
| `/app`, `/app/analysis` behavior | deep-linkとinitial modeはworkflow |
| settings route lifecycle | feature intent/ownerが必要 |
| common axes names/order/formula | metric semantics |
| score ring/threshold formula | Product score meaning |
| Strategy Plan vs Project selection | workflow/domain distinction |
| partial Snapshot UX | usable output/retry policy |

## DEFER

- `StrategyAnalysisPlanRail` / `StrategyAnalysisPlanRailCard`: `PRODUCT_DECISION_REQUIRED`、owner Product/Strategy、plan/project selection決定後に再開。
- score/axis standardization: `PRODUCT_DECISION_REQUIRED`、owner Product/Data、canonical metric contract後。
- responsive repair/preview extraction: `VISUAL_BASELINE_REQUIRED`、owner Frontend/Design、browser baseline後。
- canonical business client: `BACKEND_DEPENDENCY`、owner Rails/Frontend、13 business endpoint実装後。

## Backlog closure assessment

| Backlog child | B-3S status | Reason |
| --- | --- | --- |
| Large component responsibility cleanup | `READY_TO_CLOSE` | major targets audited/split、criteria formalized |
| Page structure / responsibility | `READY_TO_CLOSE` | route/layout/Header policy formalized |
| Component structure / dependencies | `READY_TO_CLOSE` | taxonomy/direction/inventory gate formalized |
| Unnecessary / unused code | `READY_TO_CLOSE` | unreachable 0、delete candidate 0、DEFER explicit |
| Duplicate code / components | `READY_TO_CLOSE` | wrapper 0、shared criteria/Product defers explicit |
| Technical debt audit | `SUBSTANTIALLY_COVERED` | register complete。個別解消は後続backlog |
| Frontend structure policy | `READY_TO_CLOSE` | canonical policy created |

8〜9月の親課題は**closure review ready**。追加の無理なrefactorではなく、成果物レビューと未完了debtの10月/個別backlog移管へ進める。

## October handoff

Structureとして確定:

- component/feature/route/layout taxonomy。
- wrapper/canonical import/dependency direction。
- Preview/Fixture/Mock/Actual Runtime境界。
- controller/command/client/state/store責務。
- gradual migrationとexception/DEFER policy。

10月に設計:

- Design Token名・値、responsive breakpoint/baseline。
- accessibility/UI Regulationの具体的checklistとcomponent contract。
- Tailwind採否・migration plan（Token後）。
- naming/casing migration batches、shared visual primitives。

Planned parent artifactは`docs/architecture/frontend-standardization-plan.md`。今回は作成しない。

## Scope protection

Source、route、Rails、BFF、OpenAPI、AnalysisJob、Organization、Supabase Auth、Product behavior、Tailwind、Design Token実装は変更していない。directory移動・renameも行っていない。

## Validation

- `npm run check`: PASS（0 errors / 0 warnings）。
- `npm run lint`: PASS（0 errors / 38 warnings）。
- `npm run format:check`: PASS。
- `npm run check:openapi`: PASS（18 operations / 18 unique operation IDs）。
- `npm run check:frontend-inventory`: PASS（124 reusable / 119 canonical / wrapper 0 / unresolved 0 / cycles 0 / stale 0）。packageに`check:inventory` aliasがないため既存canonical scriptを使用した。
- `npm run test`: PASS（22 files / 257 tests）。Documentation/Policy-only Phaseのためtest追加なし。
- `npm run test:auth-smoke`: PASS（5 cases）。
- `npm run build`: PASS。
- `npm run test:secrets`: PASS（64 build files）。
- `npm run test:smoke`: PASS（11 routes）。
- `npm run quality`: PASS（exit 0）。

## References

- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [Frontend inventory summary](../inventory/frontend-inventory-summary.md)
- [Frontend active graph](../architecture/frontend-active-graph.md)
- [Frontend route ownership](../architecture/frontend-route-ownership.md)
- [Shell responsibility](./38-panoptes-shell-responsibility-analysis.md)
- [AnalysisJob mapping](./40-analysis-job-runtime-mapping.md)
- [Organization-scoped BFF](./42-organization-scoped-bff-client-analysis.md)
- [B-3R wrapper consolidation](./55-compatibility-wrapper-route-entry-analysis.md)
