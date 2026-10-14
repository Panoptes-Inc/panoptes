# Phase PD-2 — PD-05 Settings Route Lifecycle Decision Review

実施日: 2026-08-18

## Scope

PD-05 `/app/login/settings`について、現行Product behavior、到達性、命名、Option A/B/C、判断に必要なEvidence、後続実装条件を再確認した。Product Ownerの明示承認は提示されていないため、Recommendationは作成するがProduct Decisionは確定しない。

本PhaseはDecision preparation/reviewである。route削除、rename、redirect、Settings実装、UI/navigation、Frontend Architecture、Rails、BFF、OpenAPIは変更しない。

## 1. Current Behavior

| Question | Result | Evidence class |
|---|---|---|
| Route exists? | Yes — `src/routes/app/login/settings/+page.svelte` | `KNOWN` |
| Protected? | Yes — authenticationとactive Organization membershipが必要 | `KNOWN` |
| Internal navigation exists? | No source found | `KNOWN` |
| Actual settings UI exists? | No | `KNOWN` |
| Form exists? | No | `KNOWN` |
| Persistence exists? | No settings persistence found | `KNOWN` |
| Settings API exists? | No SvelteKit/Rails settings endpoint found | `KNOWN` |
| Account setting exists? | No | `KNOWN` |
| Organization setting exists? | No | `KNOWN` |
| Authentication setting exists? | No | `KNOWN` |

Pageの描画責務は次のstarter scaffoldだけである。

```text
Welcome to SvelteKit
Visit svelte.dev/docs/kit to read the documentation
```

Page固有component、load/action、form、state、API callはない。App layoutからHeaderとshell spacingを継承するが、`/app`専用Top Heroは描画しない。

## 2. Auth Protection and Organization Relation

routeはpublic route set、admin/dev例外、Organization select例外のいずれにも含まれない。このためserver hookのdefault policyが適用される。

- 未認証: `/login?returnTo=...`へ303
- 認証済みだがmembershipなし、またはactive Organization未選択: `/organization/select`へ303
- active Organization membership不一致: 403
- active Organization member: render可能

これはroute access boundaryのEvidenceであり、Organization SettingsやAuthentication Settingsを提供するEvidenceではない。settings data model、role別操作、resource-level authorizationは存在しない。

## 3. Reachability

| Reachability | Result |
|---|---|
| Internal navigation | なし |
| Direct URL | 可能。access policyを満たす必要あり |
| Bookmark | 技術的に可能。実在bookmarkは`UNKNOWN` |
| Browser history | direct access後は技術的に可能 |
| Documentation | repository内のaudit/architecture文書がrouteを記録しているが、利用導線ではない |
| External inbound link | user-facing source/static/READMEからは確認できず、実運用は`UNKNOWN` |
| Test | route ownership unit testがscaffold保持を検証 |
| Smoke | production smokeが未認証303を検証 |
| Page outbound link | Svelte公式文書へのリンクのみ。routeへのinbound linkではない |

内部navigationがないことだけでは「利用されていない」と断定しない。実装前にはbookmark、配布済みURL、外部運用資料をProduct側でも確認する必要がある。

## 4. Route Semantics

現在のhierarchyは次のように読める。

```text
/app      authenticated product area
/login    auth entryを示唆
/settings settings featureを示唆
```

しかし実際には、routeはログイン処理やSettings機能を持たず、認証済みApp配下でstarter本文だけを表示する。したがって`/app/login/settings`は現行Product semanticsと整合せず、scopeも曖昧である。

この評価はrename先を決めるものではない。`/app/settings`、account、organization、auth等の候補はProduct IAとpermissionsなしに選択しない。

## 5. Settings Scope

次のいずれもcurrent sourceでsupportされていない。

- User Settings
- Account Settings
- Organization Settings
- Authentication Settings
- Notification Settings
- Billing Settings
- Workspace Settings

よってsupported settings scopeは`NONE`、将来scopeは`UNKNOWN`である。

## 6. Evidence

### KNOWN

- route/Pageが存在する
- starter scaffoldのみを描画する
- authenticationとactive Organization membershipを要求する
- 内部navigationがない
- unit testとsmokeがrouteを参照する
- settings form/persistence/API/scopeがない
- Temporary Route Policyのowner/purpose/exposure/review date/removal criteriaが揃っていない

### UNKNOWN / NEEDED

- Product roadmapにSettingsが含まれるか
- Product Owner/feature owner
- current URLを維持する必要があるか
- 実在bookmark、外部配布URL、documentation/analytics上の利用
- Settings scopeとpermissions
- Closed Beta前に必要か
- temporary保持する場合のreview date/removal criteria

Product Owner名、approval、Decision Dateは今回の入力に含まれていない。

## 7. Options

### Option A — Remove Temporary Route

**Assessment:** 現行Evidenceに最も整合する推奨案。starter scaffoldと曖昧なURLをproduction graphから除外し、将来の正式IAを誤って固定しない。

**Risk:** 実在bookmark/external inbound linkがあれば失効する。実装前にProduct側の運用Evidenceを再確認する。

### Option B — Keep Explicit Temporary Placeholder

**Assessment:** URL continuityがProduct要件として確認できる場合のみ成立する。最低限、Owner、Purpose、production exposure、Review Date、Removal Criteria、承認済みplaceholder UXが必要である。

**Risk:** 現状のままではtemporary debtが無期限化し、starter contentがproductionに残る。必要metadataがないため、現時点でOption Bの受入条件を満たさない。

### Option C — Commit to Settings Product Scope

**Assessment:** Product roadmapにSettingsを含める明示判断がある場合の選択肢。現在のroute/contentをそのまま正式化する案ではない。

**Required discovery:** Settings taxonomy、User/Organization ownership、route IA、permissions、data model、Backend API、Design、navigation、MVP priority。

**Risk:** Closed Beta/MVP scopeを拡大し、Auth/Organization/Backend responsibilityを同時に確定する必要がある。

## 8. Recommendation

現在のEvidenceでは、Option A — Remove Temporary Routeを推奨する。

理由:

- Settings機能、form、persistence、APIがない
- internal navigationがない
- owner、purpose、期限、review dateがない
- starter scaffoldがproduction routeとして露出する
- route hierarchyが実際の責務と整合しない
- 将来Settingsの正式IAを保持するProduct Evidenceがない

RecommendationはProduct Decisionではない。Product Ownerの承認前にroute削除を実施しない。

## 9. Owner and Decision Timing

- **Decision Owner:** `OWNER_REQUIRED`
- **Accountable candidate:** Product Owner
- **Consulted candidates:** Auth/Organization Owner、Engineering
- **Timing:** `NOW`、遅くとも`BEFORE_CLOSED_BETA`

Codex自身をOwnerにせず、組織上の実在人物を推測して記録しない。

## 10. Decision Result

| Field | Result |
|---|---|
| Decision Owner | `OWNER_REQUIRED` |
| Decision Date | 未設定 |
| Selected Option | 未選択 |
| Reason | Product Owner承認未提示 |
| Product Scope Impact | 未確定 |
| User Impact | 未確定。Option Aではdirect accessが失効する |
| Implementation Requirement | Decision後に別Phase |
| Migration Requirement | bookmark/external link再確認 |
| Rollback / Revisit Condition | Product roadmap、owner、URL continuity evidenceが提示された場合 |
| Final PD-05 Status | `READY_FOR_DECISION` |

`DECIDED`へ進める条件は、Product Owner、Decision Date、Selected Option、Rationale、Approvalの記録である。

## 11. Standardization Impact

- **Overall:** `NON_BLOCKING`
- **Scoped exception:** 当該routeのnaming/page taxonomyは`PARTIAL`

Component taxonomy、generic directory policy、基礎Design Token、Tailwind計画、responsive/accessibility baselineはPD-05を待たずに進められる。Settings固有の名称・Page分類だけをDecisionまで標準化対象から除外する。

## 12. Architecture Impact

- Route Entry Policy: 変更不要
- Temporary Route Policy: 変更不要。現routeが必須metadata未充足であることを再確認
- Naming Policy: 変更不要。現URLを正式名称として採用しない
- Page Taxonomy: Decision後にtemporary removalまたは正式feature entryへ分類
- Layout: 変更なし
- Auth: 変更なし
- Organization: 変更なし

新しいArchitecture Decisionは作成していない。

## 13. Technical Debt Linkage

専用の既存Technical Debt IDは確認できなかった。過去backlogの同一課題はPD-05へ集約済みであるため、新しい重複Debt IDを作成しない。

現在の状態はProduct Decision上`READY_FOR_DECISION`であり、Technical Debtとしても未解消である。Product Decision確定後は`READY_FOR_IMPLEMENTATION`相当へ進められるが、実装前に`RESOLVED`とはしない。

## 14. Conditional Implementation Handoff

### Option Aが承認された場合

- **Implementation Objective:** temporary starter routeを削除し、将来Settingsを正式IAとして再設計可能にする
- **Allowed Changes:** route削除、route ownership test、smoke、inventory、Active Graph、route ownership、docs同期
- **Forbidden Changes:** 他URLのrename/redirect、Settings実装、UI/navigation、Auth/Organization policy、Rails/BFF/OpenAPI変更
- **Acceptance Criteria:** `/app/login/settings`削除、内部参照0、unresolved import 0、inventory同期、route smoke更新、他Product URL不変、Auth/Organization behavior不変、quality PASS
- **Migration Notes:** 実装前に実在bookmark/external linkを確認し、必要ならProduct承認済みgone/redirect方針を別途決定
- **Tests:** route ownership、smoke、inventory、auth smoke、full quality
- **Documentation:** Register、route ownership、Active Graph、inventory、implementation audit、Development Log

### Option Bが承認された場合

Owner、Purpose、Review Date、Removal Criteria、production exposure、承認済みplaceholder UXを実装条件とする。

### Option Cが承認された場合

Settings taxonomy、ownership、permissions、data/API、Design、navigation、MVP priorityをProduct Discovery backlogへ送る。

## 15. Parent Artifacts and Consistency

- [Product Decision Register](../product/product-decision-register.md)へPD-2結果を反映した
- [Frontend Structure Policy](../architecture/frontend-structure-policy.md)のTemporary Route Policyと整合する
- [Frontend Route Ownership](../architecture/frontend-route-ownership.md)の現行分類を変更していない
- 閉鎖済み[Frontend Inventory](../inventory/frontend-inventory-summary.md)は再オープンせず、更新していない

## 16. Changes

- `docs/product/product-decision-register.md`更新
- `docs/audit/60-pd05-settings-route-decision-review.md`新規作成
- `docs/DEVELOPMENT_LOG.md`へPhase PD-2要約を追記

Source、route、UI、Frontend Architecture、Rails、BFF、OpenAPI変更は0件である。

## 17. Validation

- `npm run quality`: PASS（exit 0）
- `npm run check`: Svelte errors 0 / warnings 0
- `npm run lint`: ESLint errors 0 / warnings 38
- `npm run format:check`: PASS
- `npm run check:openapi`: PASS（18 operations / 18 unique operation IDs）
- `npm run check:frontend-inventory`: PASS（124 reusable、119 active canonical、DEFER 2、unresolved imports 0、cycles 0）
- `npm run test`: 22 files / 257 tests PASS
- `npm run test:auth-smoke`: 5 scenarios PASS
- `npm run build`: PASS
- `npm run test:secrets`: PASS（64 build files）
- `npm run test:smoke`: 11 routes PASS。`/app/login/settings`は未認証303を維持

指示書の`check:inventory`に相当する現行script名は`check:frontend-inventory`であり、`quality`に組み込まれている。

## 18. Remaining

- 実在Product Ownerの割当
- Option A/B/Cの明示選択と承認
- Decision DateとRationaleの記録
- bookmark/external inbound linkのProduct運用確認
- 選択Optionに応じた別Implementation/Discovery Phase
