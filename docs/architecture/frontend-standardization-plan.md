# Panoptes October Frontend Standardization Plan

更新日: 2026-09-14（Phase FS-10 Explicit Product Owner Approval Record）  
Status: `CLOSE_WITH_DEFERRED_ITEMS / CLOSED`  
Current Phase: `FS-10`  
Next Phase: `Panoptes Technical Bootcamp`

## 1. Purpose and authority

本書はOctober Frontend StandardizationのParent / Source of Truthである。8〜9月Frontend Inventory Closureで確定した現状・責務・Deferredを入力に、7 workstreamの順序、依存、成果物、Definition of Done、Parent Closure条件を管理する。

このPhaseの目的は、既存UIの全面再実装ではなく、今後の変更を安全に判断できる共通基準と段階移行規則を確立することである。各workstreamのDecisionと実装結果は、完了時に本書へ同期する。

### Identifier namespace

本書の`FS-01`〜`FS-10`は**October Phase ID**である。Frontend Inventoryに既存のTechnical Debt ID `FS-01`〜`FS-03`とは別namespaceであり、既存Debt IDは変更しない。参照時は`Phase FS-xx`または`Debt FS-xx`と明記する。

## 2. Current baseline

[Frontend Inventory Parent](../inventory/frontend-inventory-summary.md)のPD-62 Closure時点を参照し、本Phaseでは再集計しない。

| Metric | Closure baseline |
| --- | ---: |
| `src/lib/components/**/*.svelte` | 107 |
| `src/lib/features/**/*.svelte` | 17 |
| reusable Svelte | 124 |
| route Svelte | 12 |
| total Svelte | 136 |
| unresolved local imports | 0 |
| import cycles | 0 |

Baselineは比較基準であり、Octoberの完了目標件数ではない。分類や配置変更で件数が変わる場合は、対象Phaseで理由と検証結果を記録する。

## 3. Inputs

| Input | Authority in this program |
| --- | --- |
| [Frontend Inventory Parent](../inventory/frontend-inventory-summary.md) | Closure baseline、Active/Deferred分類、Technical Debt、既存Handoff |
| [Frontend Structure Policy](./frontend-structure-policy.md) | 現行責務、依存方向、migration原則 |
| [Product Decision Register](../product/product-decision-register.md) | Product semantics、承認済み境界、PD-03 preservation |
| [Development Log](../DEVELOPMENT_LOG.md) | Phase履歴と確認済みquality baseline |
| [PD-62 Approval Record](../audit/120-aug-sep-frontend-inventory-parent-explicit-product-owner-approval-record.md) | Inventory Closure Contract、October/Bootcamp handoff |

Input間で矛盾が見つかった場合は、実装で補完せず、該当ownerとSource of Truthを特定してParentへ記録する。

## 4. Established structure principles

次をOctoberの前提として維持する。

- feature-centric architecture。
- Feature / UI / Layoutの責務分離。
- internal consumerはdirect canonical importsを使用。
- `ComponentsBase`へ新規componentを追加しない。既存正本は段階移行。
- presentation mappingは表示用変換まで。Product formulaを所有しない。
- Business Logicとcanonical business stateはRailsが所有。
- No Big Bang。new-code-firstとtouch-and-migrateを使う。
- 実行順序はresponsibility cleanup → Design Token → Tailwind。

既存Structure Policyの再議論は、矛盾または新しいEvidenceがある場合に限定する。

## 5. Workstream plan

| Phase | Workstream | Scope / goal | Required input | Definition of Done |
| --- | --- | --- | --- | --- |
| FS-02 | Component Taxonomy | Layout、Feature、UI、Composite、Primitive、Route-level、Domain-specific reusableの分類基準と例外を決める | Structure Policy、Inventory taxonomy | 用語、判定基準、責務、代表例、例外、review ruleが承認済み |
| FS-03 | Feature / UI / Layout Boundary | ownership、state、business logic、composition、import directionを標準化する | FS-02、Structure Policy | 各boundaryのowns/must-not-own、state/API/import規則、例外processが承認済み |
| FS-04 | Directory Structure | 確定taxonomyとboundaryを配置・命名・public entryへ写像する | FS-02、FS-03 | target policy、段階移行、canonical import、rename/alias規則が承認済み |
| FS-05 | Design Token | color、typography、spacing、radius、shadow、breakpoint、sizingの基盤を決める | FS-02〜04、既存visual evidence | token taxonomy、naming、ownership、値のSource、適用・例外・versioningが承認済み |
| FS-06 | Tailwind | Token利用、utility convention、arbitrary value、styling ownership、migration ruleを決める | FS-05 | standard/config方針、Token接続、境界、段階migration、例外が承認済み |
| FS-07 | Responsive | breakpoint、mobile-first/desktop behavior、layout adaptation、component責務、content priorityを決める | FS-03、FS-05、必要なvisual baseline | policy、viewport acceptance、owner、検証方法、例外が承認済み |
| FS-08 | UI Regulation | visual consistency、interaction、state representation、accessibility、component usage、exception processをまとめる | FS-02〜07、Product contracts | minimum regulation、review checklist、例外・更新processが承認済み |
| FS-09 | October Parent Closure Review | 7成果物、migration/deferred、検証、Bootcamp handoffを評価する | FS-02〜08、本Parent | Closure Criteriaを評価し、blockerと承認候補を記録済み |
| FS-10 | Explicit Product Owner Approval Record | Product Owner承認を記録しParentを正式Closeする | FS-09、明示Approval Evidence | final status、criteria、deferred、Bootcamp handoffを承認記録へ同期済み |

FS-01では各workstreamの具体的なtaxonomy、directory、Token値、Tailwind設定、breakpoint、UI ruleを確定しない。

### FS-02 result — Component Taxonomy

Status: `APPROVED / COMPLETE`。正本は[FS-02 Audit](../audit/122-fs02-component-taxonomy.md)。

- Primary roleは`Route Entry`、`Page Entry`、`Layout / Shell`、`Feature`、`Composite`、`UI / Presentation`、`Primitive`、`Preview`の8種。
- `Domain-specific reusable`はPrimary roleではなくReuse Scope Qualifierとして使用する。
- Categoryはfile名やdirectoryではなく、primary responsibility、composition depth、state owner、reuse scopeで決める。
- `Route-level`という曖昧語はcanonical labelにせず、framework URL boundaryには`Route Entry`を使う。
- 代表16 filesを限定確認。全componentの再分類、directory移動、Source変更は行っていない。
- Ambiguous handoff: `PanoptesShellPage`のFeature Orchestrator境界、Page EntryとFeatureのstate分担、Composite/UIのcallback境界、Primitive抽出条件をFS-03で具体化する。

### FS-03 result — Feature / UI / Layout Boundary

Status: `APPROVED / COMPLETE`。正本は[FS-03 Audit](../audit/123-fs03-feature-ui-layout-boundary.md)。

- Featureはuse-case state、controller、command invocation、server-response mapping、child coordinationを所有する。Rails business ruleとglobal layoutは所有しない。
- UI/Presentationはrendering、presentation/transient state、typed callback emissionを所有し、API/command/store/authorizationを所有しない。
- Layoutはpersistent route-family chrome、navigation frame、context/slot arrangementを所有し、feature commandやdomain stateを所有しない。
- stateをserver/canonical、feature、presentation、transient interactionの4種へ分類し、ownerとmutation pathを確定した。
- Marketing Header/HeroはPage Entry、App Headerと既存App Top HeroはApp Layout、SvelteKit layoutとFeature Orchestrator shellは別責務とした。
- 代表11 filesを限定確認。placement変更はFS-04へ送り、Sourceは変更していない。

### FS-04 result — Directory Structure

Status: `APPROVED / COMPLETE`。正本は[FS-04 Audit](../audit/124-fs04-directory-structure.md)。

- `src/routes`をFramework Route Entry/Layout、`src/lib/features/<feature>/pages`をPage Entry、Feature内をuse-case ownerとするtarget modelを承認した。
- reusable structural shellは`src/lib/layouts`、stable cross-feature presentationは`src/lib/ui/components`、semantics-neutral Primitiveは`src/lib/ui/primitives`へ写像した。
- Domain-specific reusableは独立directoryにせずowning feature内のReuse Scope Qualifierとし、利用回数2回だけでshared化しない。
- direct canonical importをdefaultとし、`index.ts`は意図したFeature public contractのexplicit named exportに限定した。
- new-code-first、touch-and-migrate、workspace consumer同時更新、期限付きCompatibility Wrapper縮退という段階migrationを確定した。
- 代表12 locationsを限定確認。Source移動、import rewrite、build/test/quality、inventory再集計は行っていない。

### FS-05 result — Design Token Foundation

Status: `APPROVED / COMPLETE`。正本は[FS-05 Audit](../audit/125-fs05-design-token-foundation.md)。

- `color / typography / spacing / sizing / radius / border / shadow / z-index / breakpoint / motion`をToken taxonomyとして承認した。必要範囲だけをToken化する制約を含む。
- Raw/FoundationとSemanticを分離し、ComponentはSemantic tokenをdefaultで利用するcontractを確定した。
- namingを`--p-raw-{category}-{scale-key}`と`--p-{category}-{role}-{variant?}-{state?}`に固定した。
- v1の実行時Source of Truthを、将来実装する単一の`src/lib/ui/tokens.css`とし、Tailwind/TS mirrorを別正本にしない。
- hardcoded exception、段階migration、visual changeを含むversion/change policy、FS-06/07/08へのhandoffを確定した。
- 代表10 stylesを限定確認。Token/CSS/Tailwind/Source、build/test/quality、inventoryは変更・再実行していない。

### FS-06 result — Tailwind Standard

Status: `APPROVED / COMPLETE`。正本は[FS-06 Audit](../audit/126-fs06-tailwind-standard.md)。

- TailwindをDesign Token Source of Truthではなく、`tokens.css -> adapter -> semantic utility -> Component`のStyling Consumerとした。
- adapterはSemantic CSS Custom Propertyだけを参照し、Tailwind側へDesign値を複製しない。Raw/default palette direct useをstandardにしない。
- utility convention、責務別styling、typed variant優先のcomponent class boundary、class extraction criteriaを確定した。
- arbitrary value、existing CSS/Svelte style共存、reset/Preflight owner、custom utility/variantの例外規則を定義した。
- Token実装後にnew code、Shared UI/Layout、touched Feature UIへ進む段階migrationとFS-07 handoffを確定した。
- 代表10 stylesを限定確認。`tokens.css`とTailwind dependency/configは未実装で、Source/build/test/quality/inventoryは変更・再実行していない。

### FS-07 result — Responsive Standard

Status: `APPROVED / COMPLETE`。正本は[FS-07 Audit](../audit/127-fs07-responsive-standard.md)。

- Mobile-firstをdefaultとし、`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`をdevice名ではなくlayout thresholdとして承認した。
- Component、Composite/Feature、Layout、Page Entryのadaptation ownerと、Marketing/App navigationの責務を確定した。
- content priorityとwrap/stack/collapse/reorder/local scroll/truncate/hideの選択条件、dense UI、overflow/exception規則を定義した。
- `320x568 / 390x844 / 768x1024 / 1024x768 / 1440x900 / 1920x1080`をglobal viewport acceptance setとした。
- 代表11 UIを限定確認し、既存breakpoint乱立、Header reachability、Hero scale、Tabs/grid/chartの実装課題をhandoffした。
- Responsive/Token/Tailwind/Source、build/test/quality/inventoryは変更・再実行していない。

### FS-08 result — UI Regulation

Status: `APPROVED / COMPLETE`。正本は[FS-08 Audit](../audit/128-fs08-ui-regulation.md)。

- Visual consistency、interaction、canonical state、accessibility、component usageをUI Regulation v1へ統合した。
- Loading、Empty、No current analysis、Success、Warning、Error/Failed、Unavailable、Forbidden、Disabled、Partial、Limited、Unsupported historicalを区別した。
- Semantic HTML、keyboard/focus/name/label、contrast、reduced motion、target size、not-color-only、live feedbackのv1 baselineを定義した。
- Token/Tailwind/Responsive compliance、Form/control、Feedback channel、Analysis state、Motionの運用規則を確定した。
- Exception recordと`PASS / PASS_WITH_TRACKED_EXCEPTION / BLOCKED`のlightweight review processを承認した。
- 代表12 UIを限定確認し、既存UI全体の適合宣言とはせず、改善候補をFS-09 handoffへ記録した。Source/build/test/quality/inventoryは変更・再実行していない。

### FS-09 result — October Parent Closure Review

Status: `COMPLETE / READY_FOR_APPROVAL / NOT_APPROVED`。正本は[FS-09 Audit](../audit/129-fs09-october-frontend-standardization-parent-closure-review.md)。

- FS-02〜08の7標準はすべて`APPROVED / COMPLETE`、Structure Policyとの整合はPASS。
- Closure Criteriaは`PASS 9 / PENDING_NON_BLOCKER 1 / BLOCKED 0`。Criterion 9は未実装Source/verificationを理由に`PENDING_NON_BLOCKER`。
- Migration/Deferredを7 handoff classへ集約し、owner、dependency、verification、review triggerを追跡可能にした。
- PD-03 Strategy Plan Railの保護を維持し、Product Decision Registerとの限定整合でPolicyの旧status記述だけを最小同期した。
- October Closure Blocker Countは`0`、推奨Dispositionは`CLOSE_WITH_DEFERRED_ITEMS`、Parentは`READY_FOR_APPROVAL / NOT_APPROVED`。
- Technical Bootcamp readinessはPASS。Product Owner承認前に正式Closeせず、Bootcamp資料も作成していない。

### FS-10 result — Explicit Product Owner Approval Record

Status: `APPROVED / COMPLETE`。正本は[FS-10 Approval Record](../audit/130-october-frontend-standardization-explicit-product-owner-approval-record.md)。

- Approval Date `2026-09-14`、Decision Owner `Product Owner`として明示Approval Evidenceを記録した。
- Parent final statusを`CLOSE_WITH_DEFERRED_ITEMS / CLOSED`へ更新し、Closure Blocker Count `0`を確定した。
- 7標準の`APPROVED / COMPLETE`とCriteria `PASS 9 / PENDING_NON_BLOCKER 1 / BLOCKED 0`を維持した。
- Directory、Token、Tailwind、new/touched adoption、legacy CSS、Responsive、UI remediation、browser/accessibility verificationの8項目を正式handoffした。
- PD-03保護と`Closure != Source Migration Completion != Production Readiness`を維持した。
- 正式次段階をPanoptes Technical Bootcampとした。教材とSourceは変更していない。

## 6. Execution order

```text
FS-01 Kickoff
  -> FS-02 Component Taxonomy
  -> FS-03 Feature / UI / Layout Boundary
  -> FS-04 Directory Structure
  -> FS-05 Design Token
  -> FS-06 Tailwind
  -> FS-07 Responsive
  -> FS-08 UI Regulation
  -> FS-09 October Parent Closure Review
  -> FS-10 Explicit Product Owner Approval Record
  -> Panoptes Technical Bootcamp
```

実装を分割する場合も、この依存順を変えず、同じDecisionを重複するPhaseは作らない。

## 7. Dependency and gate rules

1. Taxonomy承認前にdirectory分類を正本化しない。
2. Feature/UI/Layout boundary承認前に大規模移動やshared化を行わない。
3. Directory policyはFS-02とFS-03を入力にする。
4. Design Token foundation承認前に大規模Tailwind migrationを開始しない。
5. TailwindはTokenとstyling boundaryを実装する手段として扱い、単純なCSS置換にしない。
6. ResponsiveはLayout/Component ownershipとToken breakpointの整合を確認する。
7. UI Regulationは先行6 workstreamと承認済みProduct semanticsを統合する。
8. Product formula、workflow、URL意味はFrontend標準化で決定しない。
9. Source変更を伴うPhaseは、変更範囲に応じたcheck、lint、format、test、build、inventory、browser/visual確認をDefinition of Doneへ追加する。
10. FS-09は未検証Source変更または追跡不能なDeferredをClosureできない。

## 8. Implementation boundaries

Phase FS-01〜10はPlanning / Documentation-onlyである。Source、component、route、CSS、Tailwind、Token、responsive behavior、Rails/BFF/API、Product behaviorを変更していない。

後続Phaseでは、Decision-onlyとImplementationを明示的に区別する。変更を実施した場合は、対象、migration path、互換性、visual/behavior impact、検証結果、残件をParentへ同期する。全directoryや全CSSの一括移行は行わない。

## 9. Deferred preservation and handoff

PD-03 `Strategy Plan Rail`は`NEEDS_DISCOVERY / DEFERRED_NON_BLOCKER`を維持する。

- `StrategyAnalysisPlanRail`
- `StrategyAnalysisPlanRailCard`

標準化を理由に削除、移動、rename、Product化しない。対象を変更する前にPD-03を再審査する。

既存Debt `FA-01〜02`、`FS-01〜03`、`VB-01〜02`、`TI-01`、`BD-01`と、PD-60の10分類Deferred Ledgerは失効しない。各workstreamは関連項目を取り込む場合にorigin、owner、dependency、reopen conditionを保持し、対象外項目は元Ledgerへ残す。

### October implementation / migration handoff

| ID | Handoff | Owner | Dependency / review trigger | Status |
| --- | --- | --- | --- | --- |
| `OCT-FE-M01` | target directory touch-and-migrate | Frontend Architecture + Feature owner | legacy fileを機能変更で触る時 | `DEFERRED_NON_BLOCKER` |
| `OCT-FE-M02` | `src/lib/ui/tokens.css`最小実装 | Frontend UI / Design | visual baselineとToken Contract v1 | `DEFERRED_NON_BLOCKER` |
| `OCT-FE-M03` | Tailwind adapter、version、reset/base owner接続 | Frontend Platform / UI | M02完了後 | `DEFERRED_NON_BLOCKER` |
| `OCT-FE-M04` | new/touched code adoption、Shared UI/Layout | Component / Feature owner | UI変更時のFS-02〜08 review | `DEFERRED_NON_BLOCKER` |
| `OCT-FE-M05` | legacy CSS cleanup | Component / Feature owner | M02/M03後にlegacy styleを触る時 | `DEFERRED_NON_BLOCKER` |
| `OCT-FE-M06` | responsive owner単位migration | Layout / Page / Component owner | FS-07 viewportsとvisual parity | `DEFERRED_NON_BLOCKER` |
| `OCT-FE-M07` | UI Regulation remediation | Frontend UI + Feature owner | 該当UI変更/accessibility Phase | `DEFERRED_NON_BLOCKER` |
| `OCT-FE-M08` | browser/accessibility/visual verification | Frontend Quality + Design | Source migrationごと | `DEFERRED_NON_BLOCKER` |

`Deferred != Forgotten`。各handoffは個別Phaseへ移す時もorigin ID、owner、dependency、verification、review/closure evidenceを保持する。

## 10. October Parent Closure Criteria

FS-09で次の10条件を評価した。結果は`PASS 9 / PENDING_NON_BLOCKER 1 / BLOCKED 0`である。

| # | Criterion | Required evidence | Current |
| ---: | --- | --- | --- |
| 1 | Taxonomy approved | FS-02 decision record | PASS |
| 2 | Feature/UI/Layout boundary approved | FS-03 decision record | PASS |
| 3 | Directory policy approved | FS-04 decision record | PASS |
| 4 | Design Token foundation approved | FS-05 decision record | PASS |
| 5 | Tailwind standard approved | FS-06 decision record | PASS |
| 6 | Responsive policy approved | FS-07 decision record | PASS |
| 7 | UI Regulation approved | FS-08 decision record | PASS |
| 8 | Migration/deferred items tracked | Parent ledger with owner/dependency/reopen condition | PASS |
| 9 | Required source changes verified | Phase-specific quality and visual evidence | PENDING_NON_BLOCKER |
| 10 | Technical Bootcamp handoff ready | approved scope、prerequisites、source references | PASS |

Criterion 9は、FS-01〜09にSource変更がなく、将来のToken/Tailwind/directory/responsive/UI remediationとbrowser/accessibility/visual verificationが未実施のため`PASS`にしない。これらは上記Ledgerで追跡可能であり、October Parent Closure blockerではない。

```text
October Closure Blocker Count: 0
Recommended Disposition: CLOSE_WITH_DEFERRED_ITEMS
Parent Final Status: CLOSE_WITH_DEFERRED_ITEMS / CLOSED
Approval Date: 2026-09-14
Decision Owner: Product Owner
```

## 11. Parent maintenance and handoff

各Phaseは本書のCurrent Phase、workstream status、Decision、evidence、Deferredを更新する。Structure Policyを変更する場合は、既存ruleとの矛盾と変更理由を明記する。

October Parent Closure後、承認済みstandard、実装例、migration/deferred、運用checklistをPanoptes Technical Bootcampへ渡す。Bootcamp資料はOctober Closure前に正本化しない。

Product Owner Approval Evidence:

> 2026年10月 Panoptes Frontend標準化フェーズについて、Component Taxonomy、Feature/UI/Layout Boundary、Directory Structure、Design Token、Tailwind、Responsive、UI Regulationの標準化を完了し、残る実装・Migration項目を後続へ引き継ぐ条件でCLOSE_WITH_DEFERRED_ITEMSとして正式Closureすることを承認する。

Approval Date: `2026-09-14`  
Decision Owner: `Product Owner`

正式次段階は**Panoptes Technical Bootcamp**。Bootcampは一般論、Panoptes上の対応箇所、実コード、確認問題で構成する。教材はFS-10で作成しておらず、未実装standardと現行codeを区別する。

## References

- [Frontend Inventory Parent](../inventory/frontend-inventory-summary.md)
- [Frontend Structure Policy](./frontend-structure-policy.md)
- [Product Decision Register](../product/product-decision-register.md)
- [PD-62 Inventory Closure Approval](../audit/120-aug-sep-frontend-inventory-parent-explicit-product-owner-approval-record.md)
- [FS-01 Kickoff Audit](../audit/121-october-frontend-standardization-kickoff.md)
- [FS-02 Component Taxonomy](../audit/122-fs02-component-taxonomy.md)
- [FS-03 Feature / UI / Layout Boundary](../audit/123-fs03-feature-ui-layout-boundary.md)
- [FS-04 Directory Structure](../audit/124-fs04-directory-structure.md)
- [FS-05 Design Token Foundation](../audit/125-fs05-design-token-foundation.md)
- [FS-06 Tailwind Standard](../audit/126-fs06-tailwind-standard.md)
- [FS-07 Responsive Standard](../audit/127-fs07-responsive-standard.md)
- [FS-08 UI Regulation](../audit/128-fs08-ui-regulation.md)
- [FS-09 October Parent Closure Review](../audit/129-fs09-october-frontend-standardization-parent-closure-review.md)
- [FS-10 Explicit Product Owner Approval Record](../audit/130-october-frontend-standardization-explicit-product-owner-approval-record.md)
