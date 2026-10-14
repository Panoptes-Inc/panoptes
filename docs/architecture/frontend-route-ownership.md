# Frontend Route Ownership

更新日: 2026-08-20（Phase PD-5 Decision reference sync）

## Ownership rules

```text
Route contract (+page)
└─ Persistent route-family layout
   └─ Feature entry / composition
      └─ Canonical component
```

- root layoutはglobal CSS、favicon、root server-loaded session context、childrenを所有し、Header/Heroは描画しない。
- nested layoutはroute family全体で持続するUI/data責務がある場合だけ置く。
- PageはURL固有entryであり、共通compositionをcanonical feature entryへ委譲できる。
- Product URL aliasはProduct intentが明確になるまでredirectや削除に変えない。
- internal callerはcanonical componentを直接importする。互換wrapperは確認可能なconsumerと移行理由がある場合だけ保持する。

## Current route map

| Route                  | Layout       | Page entry            | Header/Shell owner     | Shared feature           | Status                           |
| ---------------------- | ------------ | --------------------- | ---------------------- | ------------------------ | -------------------------------- |
| `/`                    | root         | Marketing route entry | `MarketingLandingPage` | Header + two Heroes      | Product intent unknown           |
| `/lp`                  | root         | Marketing route entry | same                   | same                     | Product intent unknown           |
| `/plan`                | root         | Marketing route entry | same                   | same                     | Product intent unknown           |
| `/login`               | root         | Auth page             | none                   | `SignUpForm` login mode  | canonical auth entry             |
| `/organization/select` | root         | route-local selection | none                   | membership selection     | canonical policy entry           |
| `/app`                 | root + `app` | App route entry       | `app/+layout`          | `PanoptesShellEntryPage` | PD-01A App Home / Analysis Entry |
| `/app/analysis`        | root + `app` | App route entry       | `app/+layout`          | same                     | PD-01A analysis-focused entry    |
| `/admin`               | root         | Admin route entry     | route-local surface    | canonical `AdminConsole` | auth policy remains server-owned |

## Wrapper / Route Entry Pattern

| Boundary                        | Definition                                 | Allowed work                          | Current example                                  |
| ------------------------------- | ------------------------------------------ | ------------------------------------- | ------------------------------------------------ |
| Route Entry Wrapper             | SvelteKit URL/data contractをfeatureへ接続 | typed route data/paramsの受渡し       | Marketing 3 pages、App 2 pages                   |
| Feature Entry Wrapper           | routeとUI subtree間のcomposition           | orchestration、mapping、feature state | `MarketingLandingPage`, `PanoptesShellEntryPage` |
| Component Compatibility Wrapper | 旧public import pathを一時維持             | contract-preserving delegation        | productionでは0件                                |
| Preview Alias Wrapper           | preview presetへ用途名を与える             | preset所有時のみ                      | productionでは0件                                |
| Legacy Wrapper                  | 期限付き旧path                             | 移行先の明示                          | productionでは0件                                |

Route Entry Wrapperはframework fileであり、通常component wrapperと同じ「重複」として削除しない。Feature Entryはshared compositionの正本であり、さらに同形wrapperを追加しない。Component Compatibility Wrapperはprops透過だけを理由に保持せず、consumer/import contractを根拠に判断する。

## Canonical import rule

1. Workspace内のcallerは既知のcanonical componentを直接importする。
2. compatibility pathを置く場合はconsumer、契約、廃止条件をinventoryに記録する。
3. route `+page.svelte`はURL契約として保持し、共有UIはfeature entryへ移す。
4. children透過だけのnested layoutは、load/context/CSS/auth/持続UIのいずれもなければ置かない。
5. preview presetはActual App runtimeへ接続せず、preview boundary内に留める。

## Marketing ownership

`/`、`/lp`、`/plan`はそれぞれ独立したroute entryを保持し、3件とも`MarketingLandingPage`へ委譲する。feature entryがHeader、Primary Hero、Secondary Hero、modal orchestrationを所有する。各routeは現時点で同一表示だが、canonical URL/campaign/plan semanticsは未決定である。

## App ownership

`/app/+layout.svelte`がfixed Header、pathnameに基づくApp Top Hero、shell width/spacingを所有する。`/app`と`/app/analysis`は同じ`PanoptesShellEntryPage`へ`activeOrganizationId`を渡す。旧`/app/analysis/+layout.svelte`は責務なしのpass-throughだったため削除し、親App layoutを直接継承する。

`/app/analysis`はnavigation sourceを持つが、pathnameからanalysis tabを推測しない。URLやinitial stateの変更はProduct決定後に行う。

Phase PD-5のPD-01Aで、`/app`をApp Home / Analysis Entry、`/app/analysis`をanalysis-focused Workspace / Result Entryと決定した。異なるRoute Roleは異なるruntime architectureを要求せず、shared `PanoptesShellEntryPage`を維持する。state restoration、bookmark、shareはPD-01Bであり、本Architectureから推測しない。Decision詳細は[Product Decision Register](../product/product-decision-register.md)を正本とする。

## Header and preview rules

- Marketing Header: `MarketingLandingPage` ownership。
- App Header: `app/+layout.svelte` ownership。
- Admin/Auth/Organization: route-local ownership。
- `AppTopDummy` / `AppResultsDummy`は異なる固定stateを持つMarketing preview presetである。
- `PanoptesAppShellDummy`はpreview surfaceであり、Actual Appの`PanoptesShellEntryPage`/runtime adapter/BFF command境界とは分離する。

## Product-decision boundaries

- `/`, `/lp`, `/plan`のcanonical URL、redirect、campaign semantics。
- `/app`, `/app/analysis`のRoute RoleはPD-01Aで決定済み。initial tab、state restoration、bookmark/shareはPD-01B。
- preview `Dummy`命名、preview extraction、Header分割。

## Removed route history

| Route                 | Decision                                | Implementation                                          | Current behavior                                                |
| --------------------- | --------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| `/app/login/settings` | PD-05 Option A — Remove Temporary Route | Phase PD-3でroute fileと空directoryを削除。redirectなし | production routeではなく、direct accessはSvelteKit標準not-found |

Settingsが必要になった場合は現在のURLを復元せず、scope、ownership、IAを新しいProduct Discovery/Decisionで定義してから正式routeを作る。

## References

- [B-3Q route ownership analysis](../audit/53-marketing-app-route-ownership-analysis.md)
- [B-3R wrapper/route entry analysis](../audit/55-compatibility-wrapper-route-entry-analysis.md)
- [B-3R consolidation](../audit/56-phase-b3r-wrapper-consolidation.md)
- [Frontend inventory summary](../inventory/frontend-inventory-summary.md)
- [Frontend Structure Policy](./frontend-structure-policy.md)
- [B-3S analysis](../audit/57-frontend-structure-policy-analysis.md)
- [PD-05 removal implementation](../audit/61-pd05-settings-route-removal-implementation.md)
- [PD-01A App Route Role Decision](../audit/63-pd01a-app-route-role-decision.md)
