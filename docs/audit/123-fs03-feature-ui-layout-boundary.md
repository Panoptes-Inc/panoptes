# Phase FS-03 — Feature / UI / Layout Boundary

Date: 2026-09-14  
Status: `COMPLETED / APPROVED`  
Source Changes: `NONE`  
Next Phase: `FS-04 Directory Structure`

## Scope and canonical boundary

[FS-02 Taxonomy](./122-fs02-component-taxonomy.md)を変更せず、Feature、UI / Presentation、Layout / Shellのstate、controller、command、callback、mapping、loading/error、Header/Hero/Shell、composition、import方向を具体化した。代表11 filesだけを確認し、全component監査は行っていない。

| Boundary | May own | Must not own |
| --- | --- | --- |
| Feature | use-case orchestration、view-model composition、controller lifecycle、command invocation、feature state、server response mapping、child coordination | Rails business rules、global/persistent route layout、direct raw transport、他featureの内部state |
| UI / Presentation | rendering、accessibility、presentation/transient state、props由来のdisplay mapping、typed callback emission | API/client、controller/command orchestration、store mutation、business rules、Organization authorization |
| Layout / Shell | persistent structural composition、navigation frame、shared chrome、verified context配布、slot/children arrangement | use-case orchestration、feature commands、domain state、page固有content、authorization decision |

Business Logicとcanonical server stateの正本はRails。Frontend Featureは結果をview stateへ写像してuse caseを調整できるが、formula、eligibility、authorization、workflow outcomeを作らない。

## State ownership

| State class | Owner | Rules |
| --- | --- | --- |
| Server / canonical | Rails | BFF/Client経由で取得。Frontend store/cacheはcopyでありauthorityではない |
| Feature | Feature controller/store/component | request lifecycle、polling、mutation status、coordinated selection。mutationはFeature action/controller経由 |
| Presentation | UI/Compositeまたはpure view-model mapping | label/tone/format/derived visibility。canonical valueを変更しない |
| Transient interaction | nearest UI/Composite/Page | modal、expanded、focus、draft。複数child coordinationまたはlifecycle継続時だけFeatureへlift |

Layoutが持てるstateはnavigation/chrome、route-family lifecycle、verified contextの配布状態まで。session/auth dataのcanonical ownerやOrganization authorizationにはならない。

## Controller, command, callback, and mapping

- Controllerの作成、mount/destroy、async lifecycle、retry/abort、store coordinationはFeatureが所有する。
- Command invocationはFeatureまたは明示Page Entryが行う。Organization-scoped commandはexplicit inputを必要とし、Rails decisionを推測しない。
- UI/Compositeはtyped callbackでsemantic intentを上げる。例: `(projectId: string) => void`、`onRetry: () => void`。UIからcontroller、command、clientをimportしない。
- data/stateはownerからchildへ、interaction intentはchildからcallbackでownerへ流す。
- Propsを局所treeのdefault、contextを安定したroute-family infrastructure、storeを同一Feature stateの複数consumer/lifecycleに限定する。どの手段でもownerは変わらない。
- Server/domain responseからdisplay-safe View ModelへのmappingはFeature。UIは受け取ったvalueのformattingとpresentation-derived stateまで。
- Loading/error reasonとrequest lifecycleはClient/Controller/Featureが保持する。UIはdiscriminated stateを表示し、retry/cancel intentをcallbackで返す。silent success/fallbackやbusiness outcomeを生成しない。

## Header, Hero, and Shell ownership

| Surface | Composition owner | Internal responsibility | Decision |
| --- | --- | --- | --- |
| Marketing Header | `MarketingLandingPage` Page Entry | `PanoptesSiteHeader`はnavigation、modal visibility、native auth actionのUI | Page-ownedを維持 |
| App Header | `src/routes/app/+layout.svelte` | route family全体のpersistent chrome | Layout-ownedを維持 |
| Marketing Primary/Secondary Hero | `MarketingLandingPage` Page Entry | Hero/Visualはrenderingとanimation | Page-owned。同一HeroをLayoutへ重複配置しない |
| App Top Hero | `src/routes/app/+layout.svelte` | `/app` path条件のroute-family chrome | documented Layout exceptionを維持。use-case state/commandなし |
| SvelteKit App Shell | `src/routes/app/+layout.svelte` | Header/Hero/children arrangement | Layout |
| Panoptes Feature Shell | `PanoptesShellPage.svelte` | controller、stores、commands、Feature composition | Feature Orchestrator。名称だけでLayout扱いしない |
| Main surface | `PanoptesShellMainSurface.svelte` | supplied runtime/view stateのbranch renderingとcallback forwarding | Feature view surface。controller ownerではない |

`PanoptesSiteHeader`のmodal open stateはcomponent-local transient stateとして許容する。current path awarenessはshared UIとroute boundaryが混在する既存例で、FS-04のplacement/public contract検討へ送る。認証・Organization判断はHeaderに置かない。

## Import direction

```text
Route Entry
  -> Page Entry
     -> Feature
        -> Composite
           -> UI / Presentation
              -> Primitive

Layout / Shell
  -> Page Entry children + UI / Primitive + approved context
```

Allowed:

- Feature → feature-local controller/command/mapping/types、Composite、UI、Primitive。
- Composite → same-feature Composite、UI、Primitive。
- UI → Primitive、presentation-only types/helpers。
- Feature間はstable public entry contractだけ。feature内部のdeep importはfeature内に限定。

Forbidden:

- UI/Composite/Layout → Feature controller、command、client、feature store。
- UI/Primitive → BFF、Rails、server-only module。
- Feature → Route EntryまたはLayout。
- Shared UI → domain Feature、Preview → actual runtime controller。
- import directionを隠すためのbarrelや透明wrapper。

現行`features -> ComponentsBase`と`ComponentsBase -> features`は段階移行中の例外で、新規cross-directionを増やさない。Exact target pathとmigration batchはFS-04で決める。

## Representative validation

| File | Boundary evidence |
| --- | --- |
| `src/routes/+layout.svelte` | global CSS/headとchildrenだけ。global Layout |
| `src/routes/app/+layout.svelte` | App Header、conditional Top Hero、childrenを所有。Feature commandなし |
| `MarketingLandingPage.svelte` | Marketing HeaderとHeroesのPage composition owner |
| `LandingHeroPrimarySection.svelte` | visual/preview rendering。page ownerから利用 |
| `PanoptesSiteHeader.svelte` | navigationとmodal local state。Marketing/Appでcomposition ownerが異なる |
| `PanoptesShellEntryPage.svelte` | route input/fallbackをFeatureへ接続するPage Entry |
| `PanoptesShellPage.svelte` | controller、複数store、create/retry/select commandを所有するFeature Orchestrator |
| `PanoptesShellMainSurface.svelte` | typed view state/callbackを受け、branch renderとforwardingを行うFeature surface |
| `PanoptesTabNav.svelte` | props表示と`onChange(tabId)` callbackだけのUI |
| `CompetitorAnalysisCompanyCard.svelte` | view model表示とtyped detail/compare callbacksのUI |
| `SignUpForm.svelte` | signup controller、form lifecycle、submit/resend/navigationを所有するFeature |

11 / 11 filesでCanonical Boundaryを適用できる。配置がCategoryと一致しない例はFS-04 debtであり、FS-03のSource変更理由にはしない。

## FS-04 handoff

FS-04は本BoundaryとFS-02 Taxonomyをplacementへ写像する。最低限の検討対象は次のとおり。

- `ComponentsBase`にあるFeature (`PanoptesShellPage`、`SignUpForm`) のtarget ownershipと段階migration。
- shared-looking `PanoptesSiteHeader`のroute-awareness、public contract、placement。
- Feature → legacy `ComponentsBase`依存を増やさないtarget import rule。
- Page Entry、Feature public entry、Layout、UI/Primitiveのconceptual directory map。
- aliasをdefaultにしないtouch-and-migrate rule。

FS-04はProduct semantics、PD-03、Token/Tailwind、全directory一括移動を扱わない。

## Definition of Done

| # | Requirement | Result |
| ---: | --- | --- |
| 1 | Feature responsibility defined | PASS |
| 2 | UI responsibility defined | PASS |
| 3 | Layout responsibility defined | PASS |
| 4 | State ownership defined | PASS |
| 5 | Controller/Command boundary defined | PASS |
| 6 | Callback boundary defined | PASS |
| 7 | Header/Hero/Shell ownership defined | PASS |
| 8 | Import direction defined | PASS |
| 9 | Representative examples validated | PASS |
| 10 | FS-04 handoff ready | PASS |

FS-03 DoDは**10 / 10 PASS**。October Parent Closure Criterion 2をPASSへ更新した。

## Verification

Parent/Policy/Audit/LogのStatus、Boundary、FS-04 handoffを直接確認した。代表fileは11/11、DoDは10/10 PASS、Parent Criteriaは2 PASS / 8 PENDING。更新4文書のMarkdown参照先ファイル欠落0、競合marker 0だった。

Git metadataが存在しないためGit差分検証は行えず、対象文書を直接確認した。Source変更、build、test、quality、inventory recountは実行していない。
