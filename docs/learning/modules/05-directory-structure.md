# Module 05 — Directory Structure

Status: `COMPLETE / READY_FOR_M06`  
Phase: `TB-06`  
Prerequisites: `M01`, `M02`, `M03`, `M04`  
Primary standards: [Frontend Structure Policy](../../architecture/frontend-structure-policy.md), [Frontend Standardization Plan](../../architecture/frontend-standardization-plan.md)

## 1. 学習目標（Learning goals）

このModuleを終えた学習者は、Panoptes Frontendのfileについて次の内容を説明し、判断できます。

1. Directory Structureをfolder美化ではなくownershipとdependencyの仕組みとして説明する。
2. Route Entry、Page Entry、Feature、Layout、UI、Primitiveをcanonical targetへ写像する。
3. Feature-localをdefaultとし、Sharedへ昇格できる条件を判断する。
4. direct canonical importと限定的な`index.ts` public entryを使い分ける。
5. `CURRENT`、`TARGET`、`DEFERRED MIGRATION`を混同しない。
6. legacy fileを一括移動せず、安全なmigration順序を設計する。

本ModuleはFS-04を教材化します。新しいdirectory標準、全file再配置計画、実際のSource移動は作りません。

## 用語ガイド

- **Directory Structure:** fileを見つけやすくするだけでなく、責務と依存方向を配置で表す仕組み。
- **Canonical path（正規の参照先）:** 同じ責務へ到達する複数の経路を作らず、正式なimport先として採用するpath。
- **Feature-local:** 特定のFeatureのstateやuse caseへ強く依存し、そのFeature内に置くもの。
- **Shared:** 複数Featureから利用でき、特定Featureのcommandやstateへ依存しないもの。
- **Compatibility wrapper:** 移行中の古いimportを一時的に受け止め、正規の実装へ接続する薄い互換層。

## 2. Directory Structureの目的

Directory Structureは、設計上の役割分担をファイル配置で表す仕組みです。コードを探す人にも、importを追加する人にも、そのファイルが何を担当するか伝わるようにします。

| 目的                 | Directoryが支えること                                                          |
| -------------------- | ------------------------------------------------------------------------------ |
| Ownership visibility | そのfileがroute、use case、structure、presentationのどれを所有するか推測できる |
| Dependency control   | 下位presentationから上位Featureへ逆importする等の越境を見つけやすくする        |
| Discoverability      | 変更理由から関係fileを探せる                                                   |
| Change locality      | 一つのuse caseの変更をFeature内へ閉じ込める                                    |
| Reuse boundary       | Feature-localとstable shared contractを区別する                                |
| Migration safety     | current placementとtarget placementの差を追跡し、段階的に移す                  |

Folder名だけを整えても、UIがFeatureのStoreを直接変更したり、Featureがrouteファイルへ依存したりしていれば、責務の境界は改善しません。先にM03の分類とM04の管理責任を判断し、その結果に合う配置を選びます。

```text
Responsibility -> Taxonomy -> Reuse scope -> Directory -> Import boundary
```

## 3. Canonical Target Structure

FS-04で承認済みのtargetは次のとおりです。

```text
src/
├─ routes/                              # SvelteKit framework boundary
│  └─ **/+page.svelte, +layout.svelte   # thin Route Entry / Framework Layout
└─ lib/
   ├─ features/<feature>/
   │  ├─ pages/                         # Page Entry（必要なfeatureのみ）
   │  ├─ components/                    # Feature / feature-local Composite・UI
   │  ├─ controller/, commands/, state/ # 必要なfeatureのみ
   │  ├─ mapping/                       # pure view-model mapping
   │  ├─ preview/, fixtures/            # 必要なfeatureのみ
   │  ├─ types.ts
   │  └─ index.ts                       # optional intentional public entry
   ├─ layouts/                          # reusable structural shells only
   ├─ ui/
   │  ├─ components/                    # stable cross-feature presentation
   │  └─ primitives/                    # semantics-neutral building blocks
   ├─ panoptes/                         # current browser runtime/client boundary
   └─ server/                           # server-only auth/BFF/Rails adapters
```

すべてのFeatureへ空の`pages/`、`commands/`、`state/`を作る規則ではありません。その役割を担う実装がある場合だけ作成します。目標のdirectory構造は、既に確定した責任分担を表すために使います。

### Taxonomyとの対応

| Taxonomy                     | 正式な配置先                                                              |
| ---------------------------- | ------------------------------------------------------------------------- |
| Route Entry                  | `src/routes/**/+page.svelte`, `+server.ts`等                              |
| Framework Layout             | `src/routes/**/+layout.svelte`                                            |
| Page Entry                   | `src/lib/features/<feature>/pages`                                        |
| Feature                      | `src/lib/features/<feature>`                                              |
| Feature-local Composite / UI | owning featureの`components/`                                             |
| Reusable Layout / Shell      | `src/lib/layouts`                                                         |
| Stable cross-feature UI      | `src/lib/ui/components`                                                   |
| Primitive                    | `src/lib/ui/primitives`                                                   |
| Preview / Fixture            | owning featureの`preview/`, `fixtures/`。URL exposureは`src/routes/dev`等 |

`Domain-specific reusable`はdirectoryではありません。Feature、Composite、UI等へ付けるReuse Scope Qualifierです。

## 4. Route / Page / Feature placement

### 4.1 Route Entry — `src/routes`

`src/routes`はSvelteKitが解釈するframework boundaryです。

置くもの:

- `+page.svelte`、`+layout.svelte`、`+server.ts`等のrouting file。
- server `load`、action、route parameter/dataの受渡し。
- URLからcanonical Page Entryを選び接続する薄い処理。

置かないもの:

- Feature controllerの実装。
- 大量のpresentation markup。
- raw transportやbusiness formula。
- routeと無関係なshared component。

現行`src/routes/+page.svelte`はroute dataを`MarketingLandingPage`へ渡すだけで、thin boundaryの正例です。薄いroute fileは不要wrapperではなく、URL/framework boundaryを表します。

### 4.2 Page Entry — `src/lib/features/<feature>/pages`

Page EntryはRoute EntryとFeature compositionの接点です。

所有できるもの:

- route-specific composition。
- Feature assembly。
- section ordering。
- route contextをFeature/UIへ渡す処理。

所有しないもの:

- raw API transport。
- controller lifecycleの中心。
- canonical business decision。

RouteファイルからPage Entryを分けると、SvelteKit固有のURLとの接続部分を薄く保ち、pageの構成をFeatureの文脈で読めます。別URLが同じ構成を使う場合も、Route Entryはframeworkとの接点として残せます。

### 4.3 Feature — `src/lib/features/<feature>`

Featureは一つのuse caseまたは変更理由を閉じ込める。必要に応じて次を配置します。

| Location                | 責務                                                        |
| ----------------------- | ----------------------------------------------------------- |
| `components/`           | Feature orchestrator、feature-local Composite/UI            |
| `controller/`           | lifecycle、async coordination、cleanup、state transition    |
| `commands/`             | typed use-case invocation                                   |
| `state/`                | feature-owned state/store                                   |
| `mapping/`              | domain/API modelからdisplay-safe view modelへのpure mapping |
| `types.ts`              | Feature contract                                            |
| `preview/`, `fixtures/` | deterministic previewと入力                                 |

Exact subdirectoryは責務がある場合だけ使います。たとえば`src/lib/features/panoptes-shell/controller/`は既にcontroller ownershipを表しています。これを「標準形を揃えるため」に別folderへ再移動する必要はありません。

## 5. Layout / UI / Primitive placement

### 5.1 Framework LayoutとReusable Layout

```text
src/routes/**/+layout.svelte  = SvelteKit route-family framework layout
src/lib/layouts/*             = 複数pageで再利用するstructural shell component
```

`+layout.svelte`はroute familyのpersistent chrome、verified context、children arrangementを担当します。`src/lib/layouts`はframework fileではなく、再利用可能なstructural shellのcanonical targetです。

名前に`Shell`があってもLayoutとは限りません。`PanoptesShellPage`はcontroller、stores、command callbacksを所有するためFeatureであり、`src/lib/layouts`へ置く対象ではありません。

### 5.2 Shared UI — `src/lib/ui/components`

置けるもの:

- 複数の独立Featureで同じ意味を持つpresentation。
- props/callback中心で、Feature command/stateへ依存しないsurface。
- accessibilityとinteraction contractが安定したUI。

見た目が同じ、二回使われている、名前が汎用的という理由だけではSharedへ移せません。`PanoptesTabNav`はprops/callback型ですが、現状は`分析タブ`というPanoptes固有のAccessibility上の意味とShellの文脈を持ちます。契約を一般化して検証するまでは、Feature-localを維持する方が安全です。

### 5.3 Primitive — `src/lib/ui/primitives`

Primitiveは小さいcomponentではなく、semantics-neutralで安定した最小UI contractです。

候補条件:

- domain copy/modelを持たない。
- Feature/Compositeへ依存しない。
- native semantics、accessibility、Token適用を安定して包む。
- cross-featureで同じ意味とinteractionを保てる。

`SignUpBtn`やbrand logoは小さくてもAuth/Brand semanticsがあるため、自動的にPrimitiveではありません。現時点でcanonical正例が未確定なら、無理にPrimitive directoryへ昇格させません。

## 6. Feature-local vs Shared

Panoptesでは、原則として**Feature-local**に配置します。Sharedへ移すかどうかは、利用回数ではなく、複数の利用元で同じ契約を安定して使えるかで判断します。

### Sharedへ昇格できる条件

1. 複数の独立Featureで責務が同じ。
2. Product semanticsが同じ。
3. lifecycleとstate ownershipが同じ。
4. interaction/accessibility contractが同じ。
5. Feature controller、command、store、API、authorizationへ依存しない。
6. 共通化後もcondition分岐の寄せ集めにならない。

### Feature-localを維持する条件

- 一つのuse caseに強く依存する。
- domain-specific view model/copyを持つ。
- Feature state/controllerと同時に変わる。
- 二つのconsumerが偶然似たvisualを持つだけ。
- 将来の再利用を予測しているだけ。

### Reuse Scope Qualifierとの関係

```text
Primary Category: 何者か
Reuse Scope:       どこまで同じ意味で再利用するか
```

例:

- `StrategyAnalysisRoadmapPhaseCard`は**Composite**で、Reuse Scopeは**Strategy domain-specific / feature-local**。
- `CompetitorAnalysisCompanyCard`は**UI / Presentation**で、Reuse Scopeは**Competitor domain-specific / feature-local**。
- Qualifierを付けてもAPI accessやbusiness rule ownershipは許可されない。

## 7. Dependency direction and canonical imports

Canonical direction:

```text
Route Entry -> Page Entry -> Feature -> Composite -> UI -> Primitive
Layout -> Page children / UI / Primitive / approved context
```

Directory Structureはこの方向を目で確認しやすくします。次は原則禁止。

- `ui`からFeature implementation/storeをimportする。
- Featureから`src/routes`をimportする。
- LayoutからFeature controller/commandをimportする。
- Shared UIからfeature-local implementationをimportする。
- Compatibility pathを新規canonical pathとして使う。

### Direct canonical import

Internal callerは意味のあるcanonical fileを直接importします。Temporary aliasやlegacy wrapperはmigration期間に限り、target、consumer、owner、除去条件を記録します。新しいlegacy pathを増やしません。

### `index.ts` / barrel rule

`index.ts`はoptionalで、Feature外consumerへ公開する**少数のstable contract**をexplicit named exportするときだけ使います。

許容例:

```ts
export { default as PanoptesShellEntryPage } from './pages/PanoptesShellEntryPage.svelte';
export type { PanoptesShellInput } from './types';
```

避ける例:

```ts
export * from './components';
export * from './controller';
export * from './commands';
export * from './state';
```

すべてをexportすると、内部実装まで公開され、深い依存が見えにくくなり、循環依存や複雑な再exportの経路が生まれやすくなります。Barrelの作成自体を標準にせず、公開する境界が不要なら正規の実装を直接importします。

## 8. CURRENT / TARGET / DEFERRED MIGRATION

| 呼称                 | 意味                                                     |
| -------------------- | -------------------------------------------------------- |
| `CURRENT`            | 現Repositoryで実在し、現在importされる配置・実装         |
| `TARGET`             | FS-04で承認済みのcanonical placement/方向                |
| `DEFERRED MIGRATION` | Targetは決まっているが、移動・consumer更新・検証が未実施 |

Target directoryがまだ存在しなくても設計未決定とは限りません。現在、`src/lib/layouts`、`src/lib/ui/components`、`src/lib/ui/primitives`は未作成だが、canonical targetは承認済みです。一方、個々のcomponentがShared/Primitiveへ昇格できるかはcontract evidenceが必要で、target categoryまで自動確定するわけではありません。

`src/lib/components`と`src/lib/stores`はlegacy migration sourceで、新規placementのdefaultではありません。既存fileは未使用と断定せず、一括削除・移動しません。`src/lib/panoptes`は現行runtime/client boundaryとして維持し、ownershipと重複が明確になるまで機械的にFeature配下へ動かしません。

## 9. Migration strategy

FS-04の段階migration:

1. **new-code-first** — 新規codeは承認済みtargetとboundaryに従う。
2. **touch-and-migrate** — legacy fileを機能変更で触る際、responsibilityとconsumerが明確なら移す。
3. **update consumers** — workspace内imports、tests、docsを同じchangeでcanonical pathへ更新する。
4. **temporary wrapper shrink** — external risk等で必要なwrapperだけ期限・owner・除去条件付きで残す。
5. **validate** — import、cycle、type、test、build、必要なbrowser behaviorを変更riskに応じて確認する。
6. **docs sync** — Current/Target/Deferredと例外を同期する。

一括移動は、巨大diff、merge conflict、review困難、alias長期化、visual/behavior regressionを同時に生みます。Directory migrationはbusiness behaviorを変えない小さな単位で行います。

### Product Decisionが優先する例 — PD-03

`StrategyAnalysisPlanRail`と`StrategyAnalysisPlanRailCard`はPD-03再審査まで保護対象です。Directory Standardからplacement候補を推測できても、削除、移動、rename、Product化を行いません。

```text
Directory fit != authorization to migrate
Product Decision / preservation constraint > routine directory migration
```

## 10. Representative repository mapping

以下は教材作成時に限定確認した11 fileであり、全Repository再分類ではありません。Target pathは承認済みruleの適用先を示し、実際の移動承認や詳細migration planではありません。

| Current path                                                                                                              | Taxonomy / responsibility                                          | Target placement                                                                                  | 状態                              |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | --------------------------------- |
| `src/routes/+page.svelte`                                                                                                 | Route Entry。route dataをMarketing Pageへ渡す                      | 同じ`src/routes/+page.svelte`                                                                     | `CURRENT = TARGET`                |
| `src/routes/app/+layout.svelte`                                                                                           | Framework Layout。App Header、Hero condition、children arrangement | 同じ`src/routes/app/+layout.svelte`                                                               | `CURRENT = TARGET`                |
| `src/lib/features/landing/components/MarketingLandingPage.svelte`                                                         | Page Entry。Marketing Header/Hero composition                      | `src/lib/features/landing/pages/MarketingLandingPage.svelte`                                      | `DEFERRED MIGRATION`              |
| `src/lib/components/ComponentsBase/PanoptesShellEntryPage.svelte`                                                         | Page Entry。default/route inputをShell Featureへ接続               | `src/lib/features/panoptes-shell/pages/PanoptesShellEntryPage.svelte`                             | `LEGACY / DEFERRED MIGRATION`     |
| `src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte`                                                     | Feature Orchestrator。controller/store/view-model/callback owner   | `src/lib/features/panoptes-shell/components/PanoptesShellPage.svelte`                             | `LEGACY / DEFERRED MIGRATION`     |
| `src/lib/features/panoptes-shell/controller/panoptes-shell-controller-adapter.ts`                                         | Feature controller adapter。dependency wiringとFeature action接続  | 同じFeature `controller/`                                                                         | `CURRENT = TARGET`                |
| `src/lib/components/ComponentsBase/SignUpForm.svelte`                                                                     | Signup Feature。controller、submit/resend、form lifecycle          | `src/lib/features/auth/signup/components/SignUpForm.svelte`                                       | `LEGACY / DEFERRED MIGRATION`     |
| `src/lib/components/ComponentsBase/Strategy/roadmap/StrategyAnalysisRoadmapPhaseCard.svelte`                              | Strategy domain-specific Composite                                 | `src/lib/features/strategy/components/StrategyAnalysisRoadmapPhaseCard.svelte`                    | `LEGACY / DEFERRED MIGRATION`     |
| `src/lib/components/ComponentsBase/Competitor/cards/CompetitorAnalysisCompanyCard.svelte`                                 | Competitor domain-specific UI                                      | `src/lib/features/competitor/components/CompetitorAnalysisCompanyCard.svelte`                     | `LEGACY / DEFERRED MIGRATION`     |
| `src/lib/components/ComponentsBase/Panoptes/shared/PanoptesTabNav.svelte`                                                 | callback-driven UIだがPanoptes固有contract                         | owning `panoptes-shell/components/`をdefault候補とし、cross-feature evidence後のみ`ui/components` | `CLASSIFICATION BEFORE MIGRATION` |
| `src/lib/components/ComponentsBase/Strategy/rail/StrategyAnalysisPlanRail.svelte` / `StrategyAnalysisPlanRailCard.svelte` | Strategy presentation。PD-03保護対象                               | 再審査までtarget moveを確定しない                                                                 | `PRESERVED / DEFERRED`            |

この表から分かるのは、「Target modelがある」と「全fileの最終移動が承認済み」は別という点です。特にShared昇格とPD-03は追加evidenceまたはProduct Decisionを要します。

## 11. Decision heuristic — このfileをどこへ置くか

1. **SvelteKit framework boundaryか？**  
   Yes → `src/routes`。
2. **Route固有compositionをFeatureへ接続するPage Entryか？**  
   Yes → `src/lib/features/<feature>/pages`。
3. **Use-case owner、controller、command、Feature stateか？**  
   Yes → owning `src/lib/features/<feature>`。
4. **複数pageで再利用するpersistent structural shellか？**  
   Yes → `src/lib/layouts`。Framework `+layout`なら`src/routes`。
5. **Feature非依存でcontractが安定したcross-feature presentationか？**  
   Yes → `src/lib/ui/components`。
6. **Semantics-neutralで安定した最小contractか？**  
   Yes → `src/lib/ui/primitives`。
7. **Feature/domain固有のreuseか？**  
   Yes → owning Feature内を維持。
8. **Product preservationやframework constraintがあるか？**  
   Yes → exception/deferredを記録し、標準を理由に動かしません。

配置は、「管理・決定の責任を持つ主体→分類→再利用範囲→配置先」の順に判断します。名前だけでfolderを決めません。

## 12. Common misunderstandings

### 「reuse回数が多い = Shared」

回数ではなくsemantics、lifecycle、interaction、dependencyが同じかを見ます。三回使われても一つのFeature内ならfeature-localで構いません。

### 「小さい = Primitive」

Primitiveはsizeではなくsemantics-neutralなstable contract。Auth文言を持つbuttonは小さくてもUIです。

### 「Pageという名前 = `pages/`」

`PanoptesShellPage`はFeature Orchestrator。file名ではなくcontroller/command/state ownershipで判定します。

### 「Shellという名前 = `layouts/`」

Persistent structureならLayout、use-case lifecycle ownerならFeature。

### 「shared directory = 何でも置く場所」

Sharedは最も厳しいdependency/contract安定性を求める場所であり、owner不明fileの待避所ではありません。

### 「`index.ts` = 全exportしてよい」

Public contractだけをexplicit exportします。Internal controller/storeを隠れて公開しません。

### 「Target pathが決まった = Migration完了」

Source move、consumer更新、verification、docs同期が完了して初めてmigration完了です。

### 「Directory StandardはProduct Decisionより常に優先」

PD-03のようなpreservation constraintが優先します。Architecture policyは未承認Product変更の根拠になりません。

## 13. Practice

### 13.1 Knowledge Check

1. Directory Structureをfolder美化として扱ってはいけない理由は何か。
2. Route EntryとPage Entryの配置と責務の違いは何か。
3. Framework `+layout.svelte`と`src/lib/layouts`の違いは何か。
4. Shared UIへ昇格するため、利用回数以外に何を確認するか。
5. Primitiveをcomponent sizeで判断できない理由は何か。
6. `index.ts`をEverything exportにしない理由は何か。
7. `TARGET`と`DEFERRED MIGRATION`の違いは何か。
8. PD-03対象をDirectory Standardだけで移動できない理由は何か。

### 13.2 Placement Exercise

次をcanonical targetへ分類します。

1. URL paramを受けPage Entryへ渡す`+page.svelte`。
2. Analysis retry/polling controller。
3. Marketing section orderを所有するPage component。
4. 複数pageを包む再利用可能なnavigation shell。
5. Strategy taskのdomain copyを表示するCard。
6. Domainを知らないaccessible button wrapper。
7. Signup Feature専用のvalidation presentation。
8. server-only Rails proxy adapter。

### 13.3 Current vs Target Exercise

次の判定が正しいか答え、理由を示します。

1. `src/lib/layouts`が未作成なのでLayout targetは未決定である。
2. `MarketingLandingPage`は現在Feature内にあるのでmigration不要である。
3. `PanoptesShellPage`は名前にShellがあるので`src/lib/layouts`へ移す。
4. controller adapterは既にFeature `controller/`にあり、placement上はCurrent=Targetである。
5. legacy `ComponentsBase`にあるfileはすべて即削除できる。

### 13.4 Shared Decision Exercise

`PanoptesTabNav`を`src/lib/ui/components`へ移す提案をreviewしてください。次を確認します。

- 他Featureのconsumerは存在するか。
- `分析タブ`というaccessible nameはcross-featureでも同じ意味か。
- tab semantics、keyboard behavior、props/callback contractは安定しているか。
- Panoptes Shell state/storeへ依存していないか。
- Feature-local維持とShared化のどちらが変更局所性を高めるか。

### 13.5 Migration Exercise

`PanoptesShellEntryPage.svelte`をlegacy locationからtarget `pages/`へ移す安全な順序を設計してください。少なくともconsumer、wrapper、verification、docsを含めます。

## 14. Answers / Explanation Guide

### 14.1 Knowledge Check要点

1. Folderだけ変えてもownership/dependencyは直らず、巨大diffが目的化するため。Directoryは責務を可視化する手段。
2. Route Entryは`src/routes`のframework/URL boundary。Page EntryはFeature `pages/`でroute-specific compositionを所有する。
3. `+layout.svelte`はSvelteKit route family boundary。`src/lib/layouts`は再利用するstructural component。
4. 責務、Product semantics、lifecycle、interaction/accessibility contract、Feature dependencyの不在。
5. 小さくてもdomain/brand/Auth semanticsを持てるため。Primitiveはsemantics-neutral contractで判断する。
6. Internal dependencyをpublic化し、cycle/re-export mazeと変更影響を増やすため。
7. Targetは承認済み方向、Deferred MigrationはSource moveと検証が未完了の状態。
8. Directory policyはProduct ownershipを上書きせず、PD-03 preservationが明示されているため。

### 14.2 Placement回答

1. `src/routes/**/+page.svelte`。
2. `src/lib/features/<analysis-feature>/controller`。
3. `src/lib/features/landing/pages`。
4. `src/lib/layouts`。ただしframework route layoutなら`src/routes`。
5. owning Strategy Featureの`components/`。Shared/Primitiveではない。
6. contract evidenceが揃えば`src/lib/ui/primitives`。
7. `src/lib/features/auth/signup/components`。
8. `src/lib/server`。

### 14.3 Current vs Target回答

1. **誤り。** Directory未作成でもFS-04 targetは承認済み。
2. **誤り。** Page EntryはFeature内でもcanonical `pages/`へ写像される。現在は`components/`なのでdeferred migration。
3. **誤り。** use-case controller ownerなのでFeature `components/`。
4. **正しい。** `src/lib/features/panoptes-shell/controller`は責務とplacementが一致する。
5. **誤り。** Legacyはmigration source。consumer、Product decision、regression riskを確認して段階移行する。

### 14.4 Shared Decision回答例

現時点ではFeature-local維持が妥当。Componentはprops/callback型だが、確認したcontractはPanoptes analysis tabsに結び付き、cross-featureで同じsemanticsというevidenceがありません。先にFeature-local targetへ置き、独立Featureで同じaccessibility/interaction contractが確認された時だけShared昇格をreviewします。見た目や利用予測だけでは移しません。

### 14.5 Migration回答例

1. Current owner、全workspace consumer、target path、受入条件を確認する。
2. `src/lib/features/panoptes-shell/pages/PanoptesShellEntryPage.svelte`へ責務を保ったまま移す。
3. Route/consumer importsを同じchangeでdirect canonical pathへ更新する。
4. External consumer riskがなければ旧fileを残さない。必要ならowner・期限・除去条件付きCompatibility Wrapperに限定する。
5. unresolved import、cycle、type/test/build、対象routeのbehaviorを変更riskに応じて検証する。
6. Current/Target/Migration docsを同期する。

このexerciseはmigration設計であり、本Phaseでは実際に移動しません。

## 15. Completion Criteria

| Criterion                                         | Result |
| ------------------------------------------------- | ------ |
| 1. Directory purpose explained                    | `PASS` |
| 2. Canonical target structure explained           | `PASS` |
| 3. Route/Page/Feature placement explained         | `PASS` |
| 4. Layout/UI/Primitive placement explained        | `PASS` |
| 5. Feature-local vs Shared rule explained         | `PASS` |
| 6. Dependency and import rules explained          | `PASS` |
| 7. index.ts/barrel rule explained                 | `PASS` |
| 8. Current/Target/Migration distinction explained | `PASS` |
| 9. Representative mapping included                | `PASS` |
| 10. Exercises + answers included                  | `PASS` |

M05 Authoring DoD: `10 / 10 PASS`  
Module status: `COMPLETE / READY_FOR_M06`

このstatusは教材artifactの完成を示します。Learner assessment合格、全file分類、Directory migration、Source verification完了を意味しません。

## 16. Handoff to M06

次は`M06 — State / Controller / Command`。M04で確定したownershipとM05のFeature placementを前提に、state classification、controller lifecycle、typed command、store mutation pathを実際のPanoptes flowへ接続します。

## References

- [Panoptes Technical Bootcamp](../panoptes-technical-bootcamp.md)
- [M01 Panoptes Overall Architecture](./01-panoptes-overall-architecture.md)
- [M02 Svelte / SvelteKit](./02-svelte-sveltekit.md)
- [M03 Component Taxonomy](./03-component-taxonomy.md)
- [M04 Feature / UI / Layout Boundary](./04-feature-ui-layout-boundary.md)
- [Frontend Structure Policy](../../architecture/frontend-structure-policy.md)
- [Frontend Standardization Plan](../../architecture/frontend-standardization-plan.md)
- [Product Decision Register](../../product/product-decision-register.md)
