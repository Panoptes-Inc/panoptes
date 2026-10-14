# Panoptes Phase FS-04 Directory Structure

Date: 2026-09-14  
Status: `APPROVED / COMPLETE`  
Scope: Documentation-only

## 1. Objective and scope

FS-02のCanonical TaxonomyとFS-03のFeature / UI / Layout Boundaryを、今後のFrontend配置、public entry、canonical import、段階migrationへ写像した。本Phaseでは代表12箇所だけを確認し、全file再分類、Source移動、import変更、build/test/quality、inventory再集計は実施していない。

## 2. Approved target directory model

```text
src/
├─ routes/                              # SvelteKit framework boundary
│  └─ **/
│     ├─ +page.svelte                   # thin Route Entry
│     ├─ +layout.svelte                 # Framework Route Layout
│     └─ +page.server.ts / +server.ts   # server/BFF entry where required
└─ lib/
   ├─ features/
   │  └─ <feature>/
   │     ├─ pages/                      # Page Entry
   │     ├─ components/                 # Feature and feature-local Composite/UI
   │     ├─ controller/                 # optional use-case orchestration
   │     ├─ commands/                   # optional typed command boundary
   │     ├─ mapping/                    # pure display/view-model mapping
   │     ├─ state/                      # optional feature-scoped state
   │     ├─ preview/                    # optional deterministic feature preview
   │     ├─ fixtures/                   # optional preview/test input
   │     ├─ types.ts                    # feature-local contract
   │     └─ index.ts                    # optional, intentional public entry only
   ├─ layouts/                          # reusable structural shells only
   ├─ ui/
   │  ├─ components/                    # stable cross-feature presentation
   │  └─ primitives/                    # semantics-neutral UI building blocks
   ├─ panoptes/                         # existing browser runtime/client abstraction
   └─ server/                           # server-only auth/BFF/Rails adapters
```

`pages`、`controller`、`commands`、`state`、`preview`、`fixtures`は必要なfeatureだけが持つ。空directoryや責務のないlayerは作らない。`src/lib/components`と`src/lib/stores`はmigration sourceとなるlegacy locationであり、target modelの新規配置先ではない。

### Why this model

- `src/routes`はURL、load、route lifecycleというSvelteKit固有責務に限定できる。
- Page Entryをfeature内の`pages`に置くことで、route fileを薄くしつつuse-case ownerを明示できる。
- `components/shared`ではなく`ui/components`を採用し、曖昧なshared bucketではなくFS-02のUI責務を配置名へ反映する。
- reusable Layoutは`layouts`へ分離し、Framework LayoutとFeature Orchestratorを混同しない。
- 現行`panoptes`と`server`はcomponent taxonomy外のruntime/server boundaryとして維持し、FS-04を理由に再配置しない。

## 3. Taxonomy-to-directory mapping

| Canonical category | Target placement | Rule |
| --- | --- | --- |
| Route Entry | `src/routes/**/+page.svelte` | URL/loadをPage Entryへ接続する薄いframework adapter |
| Page Entry | `src/lib/features/<feature>/pages/` | route props/dataをfeature compositionへ接続するscreen owner |
| Layout / Shell | Framework: `src/routes/**/+layout.svelte`; reusable: `src/lib/layouts/` | persistent chrome/slot/layoutのみ。Feature-specific shellはowning featureへ置く |
| Feature | `src/lib/features/<feature>/` | use-case orchestration、feature state/controller/command/mappingのowner |
| Composite | default: `src/lib/features/<feature>/components/`; stable cross-feature presentationのみ`src/lib/ui/components/` | composition depthだけでshared化しない |
| UI / Presentation | feature-specific: feature `components/`; stable cross-feature: `src/lib/ui/components/` | API/command/store/authorizationへ依存しない |
| Primitive | `src/lib/ui/primitives/` | Product/domain semanticsを持たない小さなbuilding block。無理に抽出しない |
| Preview | feature preview: `src/lib/features/<feature>/preview/`; route exposure: `src/routes/dev/**`等 | deterministic fixtureを使用し、Actual runtimeへのfallbackにしない |

`Domain-specific reusable`はdirectory layerではない。同じdomain/use-caseを所有するfeature内に留めるReuse Scope Qualifierである。複数consumerがあるだけで`ui`へ移さない。

## 4. Feature-local and shared decision rule

Feature-localをdefaultとし、次のいずれかがあればowning featureへ置く。

- 一つのuse case、domain terminology、Product semanticsへ強く依存する。
- feature state、controller、command、domain typeまたはview-modelへ依存する。
- 変更理由とlifecycle ownerが特定featureにある。
- 複数箇所で使われても、同じfeature/domain内の再利用である。

`src/lib/ui`へ置くには次をすべて満たす。

- 複数の独立featureで同じ責務として再利用できる。
- props、interaction、accessibility、visual semanticsのcontractが安定している。
- feature state/controller/command、API、Organization authorizationへ依存しない。
- Product formulaやdomain-specific branchingを内包しない。
- shared ownerと変更理由を説明できる。

利用回数2回はshared化の根拠にならない。同じ見た目だけの場合や、shared化にfeature switch/conditional propsが必要な場合はfeature-localを維持する。

## 5. Route, Page, and Layout placement

- Route Entryは`src/routes`に残し、route data/paramsを受けてPage Entryをrenderする。
- Page Entryのcanonical placementは`src/lib/features/<feature>/pages/`とする。巨大なuse-case implementationをroute directoryへ置かない。
- SvelteKit `+layout.svelte`はFramework Route Layoutであり`src/routes`に残す。
- 複数route/pageで再利用するpersistent structural shellだけを`src/lib/layouts/`へ置く。
- Feature state/controller/commandを所有する「Shell」は名前にかかわらずFeatureであり、`layouts`へ置かない。
- Marketing Header/HeroはPage Entry composition、App Headerと既存App Top HeroはApp Framework LayoutというFS-03判断を維持する。

## 6. Canonical import and public entry

### Canonical import

- 一つの実体と一つのpublic canonical pathを持つ。
- shared UIはdefaultで具体fileへのdirect canonical importを使い、directory-wide barrelを作らない。
- feature内部はdirect relative/canonical importを許可する。
- routeまたは別featureからの参照は、featureがpublic entryを宣言した場合だけそのentryを使う。宣言しない場合は具体fileへのdirect canonical importを使う。
- UI/PrimitiveからFeatureへの逆import、client codeから`src/lib/server`へのimportを禁止する。
- legacy alias、duplicate re-export、wildcard barrel、複数canonical locationを新規作成しない。

### Public entry

`index.ts`は短いpathを作る目的では導入しない。複数consumerへ安定したFeature contractを公開し、internal placementを隠す必要がある場合だけ`src/lib/features/<feature>/index.ts`にexplicit named exportを置く。公開対象、owner、consumerを明示し、internal helper、UI全件、server-only moduleを再exportしない。Svelte component単体やshared UIはdirect file importをdefaultとする。

## 7. Migration strategy

1. 本書でtarget locationと判定規則を固定する。
2. 新規codeはtarget modelへ直接配置する。新しい`ComponentsBase`、legacy alias、global shared bucketを作らない。
3. legacy fileを機能変更で触る際、owner、consumer、dependencyを限定確認してtouch-and-migrateする。
4. 移動時はworkspace内のimport、test、preview、docsを同一changeで更新し、新旧二重正本を作らない。
5. external consumerを除外できない場合だけ、owner、canonical target、consumer、期限、削除条件を持つCompatibility Wrapperを一時利用する。
6. 対象範囲のcheck/test/build/必要なvisual確認後にwrapper/aliasを縮退し、該当inventory/documentを同期する。

全directoryの一括移動、casing一括変更、見た目変更と同時の構造migrationは行わない。

## 8. Legacy and exception rules

| Case | Handling | Owner / revisit condition |
| --- | --- | --- |
| `src/lib/components/ComponentsBase/**` | legacy migration source。新規追加せず、touched scopeでownerへ移す | Frontend Architecture / fileを機能変更する時 |
| `src/lib/components/loop/**` | legacy naming/location。shared条件確認前に`ui`へ機械移動しない | Frontend / consumer contract確認時 |
| `src/lib/stores/**` | legacy global state。新規global storeのdefaultにしない | Feature owner / lifecycle共有が必要な時 |
| Compatibility Wrapper | migration例外のみ。target/consumer/owner/期限/削除条件必須 | owning migration / consumer 0と検証完了時 |
| Preview/dev route | framework exposureは`src/routes`、implementation/fixtureはowning feature | Frontend Quality / production exposure review時 |
| Framework constraint | `+page`/`+layout`/server entryは`src/routes`に維持 | SvelteKit contract変更時 |
| PD-03 Plan Rail | 削除・移動・rename・Product化しない | Product/Strategy / PD-03再審査後 |

PD-03 preservation対象:

- `StrategyAnalysisPlanRail.svelte`
- `StrategyAnalysisPlanRailCard.svelte`

## 9. Representative validation

全Project再分類は行わず、次の12 representative locationsを確認した。

| # | Current representative | Observed responsibility | Target interpretation |
| ---: | --- | --- | --- |
| 1 | `src/routes/+page.svelte` | thin marketing Route Entry | `src/routes`維持。Feature Page Entryを参照 |
| 2 | `src/routes/app/+layout.svelte` | App Header/Top Heroを持つFramework Layout | `src/routes`維持 |
| 3 | `features/landing/components/MarketingLandingPage.svelte` | Marketing Page Entry | 将来のtouch時は`features/landing/pages/`候補 |
| 4 | `features/panoptes-shell/{components,controller,mapping}` | Feature composition/orchestration/mapping | target modelに適合 |
| 5 | `features/auth/signup/` | components/services/state/validationと小さなpublic entry | feature-local構造と限定`index.ts`の適用例 |
| 6 | `ComponentsBase/PanoptesShellEntryPage.svelte` | Panoptes Page Entry | 将来`features/panoptes-shell/pages/`候補 |
| 7 | `ComponentsBase/Panoptes/PanoptesShellPage.svelte` | Feature Orchestrator | 将来`features/panoptes-shell/`へ集約する候補。Layoutではない |
| 8 | `ComponentsBase/Panoptes/shared/` | Panoptes feature内のshared presentation | global sharedではなくowning feature内をdefaultとする |
| 9 | `components/loop/AppLogo.svelte` | presentation-only brand UI | consumer/contract確認後の`ui/components`候補。利用回数だけでは移動しない |
| 10 | `src/lib/panoptes/` | browser runtime/client/domain abstraction | component target外。現行canonical boundaryを維持 |
| 11 | `src/lib/server/` | auth/Rails/Supabase server-only | component target外。clientからのimport禁止 |
| 12 | `ComponentsBase/Strategy/rail/StrategyAnalysisPlanRail*.svelte` | PD-03 deferred Product surface | placement判断と移動を保留 |

Representative確認により、target modelは現行の部分的feature-centric構造へ適用できる。一方、`ComponentsBase`の混在は実在するため、source変更なしで「移行済み」とは扱わない。

## 10. Decision and DoD

Canonical Directory Structureを`APPROVED`とする。

| # | DoD | Result |
| ---: | --- | --- |
| 1 | target directory model defined | PASS |
| 2 | taxonomy mapping defined | PASS |
| 3 | feature-local/shared criteria defined | PASS |
| 4 | Page/Route placement defined | PASS |
| 5 | Layout placement defined | PASS |
| 6 | canonical import rule defined | PASS |
| 7 | migration strategy defined | PASS |
| 8 | legacy/exception rule defined | PASS |
| 9 | representative validation complete | PASS |
| 10 | FS-05 Design Tokenへhandoff可能 | PASS |

FS-04 DoD: `10 / 10 PASS`。October Parent Closure Criterion 3は`PASS`。

## 11. FS-05 handoff

FS-05は本配置を再議論せず、`ui/components`、`ui/primitives`、`layouts`、feature-local presentationの各ownerが利用できるToken foundationを定義する。最低限color、typography、spacing、radius、shadow、breakpoint、sizingについて、taxonomy、naming、Source、適用境界、例外、versioningを決める。FS-05でdirectory移動、Tailwind migration、responsive redesignは開始しない。

## References

- [October Frontend Standardization Plan](../architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)
- [FS-02 Component Taxonomy](./122-fs02-component-taxonomy.md)
- [FS-03 Feature / UI / Layout Boundary](./123-fs03-feature-ui-layout-boundary.md)
- [Product Decision Register](../product/product-decision-register.md)
