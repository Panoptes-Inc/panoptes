# Panoptes Technical Bootcamp

Updated: 2026-10-08 — Phase TB-30 Parent Closure Review  
Status: `BOOTCAMP_MATERIALS_COMPLETE / READY_FOR_LEARNING_PHASE / CLOSED`  
Current Phase: `TB-30`  
Recommended Next Phase: `Panoptes Technical Bootcamp Learning / Assessment`

## 1. Purpose and authority

本書はPanoptes Technical BootcampのParent / Curriculum Source of Truthである。Panoptesのコード、設計、処理、Product contractを依存関係順に学び、実装を読めるだけでなく、責務境界と設計理由を説明し、安全な変更案を判断できる状態を目指す。

TB-01はCurriculum設計のみを扱う。Module教材本文、Source変更、未実装機能の仕様決定、Production readiness判定は行わない。

## 2. Audience

- Panoptesへ参加するFrontend / Backend / Worker / Platform engineer
- 自分の担当領域以外を含むend-to-end flowを理解したい既存member
- Product semanticsとtechnical boundaryを区別してreviewするtechnical lead

Svelte、HTTP、SQL、非同期処理の基礎経験は有用だが、Panoptes固有知識は前提としない。不足する一般知識は各Moduleの「一般論」で補う。

## 3. Current baseline and inputs

October Frontend Standardizationは`CLOSE_WITH_DEFERRED_ITEMS / CLOSED`であり、7標準は`APPROVED / COMPLETE`である。ただし、Frontend Standardization ClosureはSource Migration CompletionまたはProduction Readinessを意味しない。教材では、承認済みcontract、現行実装、未実装/deferredを混同しない。

| Input | Bootcampでの役割 |
| --- | --- |
| [October Frontend Standardization Plan](../architecture/frontend-standardization-plan.md) | 7標準、実装境界、migration/deferred handoff |
| [Frontend Structure Policy](../architecture/frontend-structure-policy.md) | Frontend責務、依存方向、state/controller/command、UI標準 |
| [Frontend Inventory Summary](../inventory/frontend-inventory-summary.md) | Closure baseline、active/deferred、現行構造の入口 |
| [Product Decision Register](../product/product-decision-register.md) | Route、Axis、Formula、Missing/Partial、Snapshot等の承認済み意味 |
| [Development Log](../DEVELOPMENT_LOG.md) | 実装/Decisionの時系列と検証済みbaseline |

PD-03 `StrategyAnalysisPlanRail` / `StrategyAnalysisPlanRailCard`は`NEEDS_DISCOVERY / DEFERRED_NON_BLOCKER`のまま保護する。教材作成を理由に削除、移動、rename、Product化しない。

## 4. Learning principles

各Moduleは原則として次の順で構成する。

1. **一般論** — 技術概念と失敗しやすい境界を理解する。
2. **Panoptesでの対応箇所** — canonical docsと責務ownerを特定する。
3. **実コード / Directory / Data Flow** — 少数の代表箇所を追跡する。
4. **なぜこの設計か** — 代替案、trade-off、deferredとの違いを説明する。
5. **確認問題 / Design Exercise** — 暗記ではなく読解・説明・判断で確認する。

全Moduleに次の横断原則を適用する。

- `documented decision`、`implemented behavior`、`planned/deferred`を明示的に区別する。
- Business Logicとcanonical business stateのSource of TruthはRailsとする。
- Frontendはpresentation、local interaction、composition、view-model mapping、typed command invocationまでを扱う。
- Organization scope、authorization、version/lineage、partial state、idempotencyを暗黙化しない。
- Repo-wide読解や大量コード引用を学習の代わりにしない。

## 5. Difficulty model

| Level | 意味 | Learnerに求める成果 |
| --- | --- | --- |
| `FOUNDATION` | 用語、責務、主要entryを理解する | 図と自分の言葉で説明し、代表codeを見つけられる |
| `INTERMEDIATE` | 複数layerをまたぐflowとcontractを追う | input/output、owner、failure pathを説明できる |
| `ADVANCED` | distributed state、reliability、trade-offを評価する | evidenceに基づく設計案、risk、verificationを提示できる |

DifficultyはModuleの価値や履修順を表さない。`ADVANCED`を先取りせず、prerequisite evidenceを満たして進む。

## 6. Canonical learning order

```text
Stage A — System orientation
M01 Architecture -> M02 Svelte/SvelteKit -> M03 Taxonomy
                 -> M04 Feature/UI/Layout Boundary -> M05 Directory Structure

Stage B — Request, identity, and canonical state
M04/M05 -> M06 State/Controller/Command -> M07 BFF -> M08 Rails -> M09 PostgreSQL
M07-M09 -> M10 Auth/Authorization/Organization -> M11 API/OpenAPI

Stage C — Analysis execution and history
M08-M11 -> M12 AnalysisJob Lifecycle -> M13 Async Job Reliability
M12/M13 -> M14 Python Worker/Chromium/Collection -> M15 Snapshot/History/Lineage

Stage D — Analysis domain
M08/M15 -> M16 Common 6 Axis -> M17 Observation/Submetric/Formula
M16/M17 -> M18 Missing/Partial/Eligibility

Stage E — Presentation standard
M03/M04/M05 -> M19 Design Token -> M20 Tailwind -> M21 Responsive -> M22 UI Regulation/A11y

Stage F — Delivery and assurance
M10/M13/M18/M22 -> M23 Security -> M24 Testing/CI/CD -> M25 Logging/Monitoring/Audit

Stage G — Platform and growth
M13/M23/M25 -> M26 Infrastructure/Cloud -> M27 Stripe/Billing/CRM/Webhook
M12/M14/M24/M25/M26 -> M28 Performance/Scalability
```

Stage DとStage Eは、Stage Bの完了後であれば並行学習できる。ただし、M22のstate表現演習はM18、M23以降のassuranceは両Stageの完了を前提とする。

## 7. Module curriculum

### Stage A — System orientation

| ID / Module | Level / prerequisite | 学ぶこと・Panoptesで重要な理由 | 到達目標 | Representative code/docs | Practice |
| --- | --- | --- | --- | --- | --- |
| **M01 Panoptes全体Architecture** | `FOUNDATION` / none | Browser、SvelteKit、BFF、Rails、PostgreSQL、Worker、外部serviceの責務とSource of Truth。局所変更を全体flowへ位置付ける入口。 | context/container diagramを描き、implemented/deferredを分けて説明できる。 | Structure Policy §2; Inventory Summary; Development Log | diagram exercise、architecture explanation |
| **M02 Svelte / SvelteKit** | `FOUNDATION` / M01 | component、reactivity、route/layout、SSR/client/server boundary。Frontend entryとserver-only処理を混同しないため。 | 代表routeからrender/data boundaryを追い、browser/server実行位置を説明できる。 | `src/routes`; Frontend Active Graph; Route Ownership | code reading、route tracing |
| **M03 Component Taxonomy** | `FOUNDATION` / M02 | Route Entry、Page Entry、Layout/Shell、Feature、Composite、UI、Primitive、Previewとreuse qualifier。 | componentのprimary responsibilityと禁止ownershipを根拠付きで分類できる。 | Structure Policy §3; October Plan FS-02 result | classification check、ambiguous-case exercise |
| **M04 Feature / UI / Layout Boundary** | `FOUNDATION` / M03 | orchestration、presentation、persistent shellの所有境界。Business ruleやcommandがUIへ漏れるのを防ぐ。 | state、callback、Header/Hero/Shell、import directionを説明できる。 | Structure Policy §§4–5; Landing Route Ownership; Panoptes Shell Flow | dependency tracing、boundary review |
| **M05 Directory Structure** | `FOUNDATION` / M03–M04 | feature-local/shared、route/page/layout placement、canonical import、migration exception。 | target placementを提案し、legacy locationとcanonical locationを区別できる。 | Structure Policy §§12, 15; October Plan FS-04 result | placement exercise、import-path review |

### Stage B — Request, identity, and canonical state

| ID / Module | Level / prerequisite | 学ぶこと・Panoptesで重要な理由 | 到達目標 | Representative code/docs | Practice |
| --- | --- | --- | --- | --- | --- |
| **M06 State / Controller / Command** | `INTERMEDIATE` / M04–M05 | server/canonical、feature、presentation、transient stateとmutation path。 | UI interactionからtyped commandまでを追い、各state ownerを特定できる。 | Structure Policy §§10–11; Panoptes Shell Flow; Organization-scoped Command Flow | state inventory、tracing exercise |
| **M07 BFF** | `INTERMEDIATE` / M01, M06 | same-origin boundary、cookie/session forwarding、Organization明示input、safe error shaping。 | browser→BFF→Railsのrequest/failure flowを説明できる。 | API Boundary; Organization-scoped Command Flow; `src/routes/api` | request trace、error-mapping review |
| **M08 Rails Business Backend** | `INTERMEDIATE` / M07 | API-only Rails、business rule、authorization、workflow/formula ownership。 | Frontend/BFFに置けないlogicを判断し、Rails側contractを説明できる。 | Rails Foundation; Rails Authentication; Rails Organization Authorization | controller/service reading、ownership exercise |
| **M09 PostgreSQL / Source of Truth** | `INTERMEDIATE` / M08 | canonical persistence、identity、constraint、transaction、tenant scope、derived/cacheとの違い。 | domain stateのauthoritative record、invariant、transaction boundaryを示せる。 | Rails Foundation; Rails models/migrations（Module作成時に限定選定） | schema reading、invariant exercise |
| **M10 Auth / Authorization / Organization** | `INTERMEDIATE` / M07–M09 | authentication、role/membership、active organization、resource authorization、404/403境界。 | identityからOrganization-scoped resource判定までをlayer別に説明できる。 | Rails Authentication; Rails Organization Authorization; Structure Policy §§10–11 | threat scenario、authorization trace |
| **M11 API / OpenAPI** | `INTERMEDIATE` / M07–M10 | resource/operation contract、status/error、schema/version boundary、contract-first review。 | endpointをOpenAPIとimplementation boundaryへ照合し、推測APIを識別できる。 | Panoptes API v1; OpenAPI Draft; API Boundary | contract reading、breaking-change exercise |

### Stage C — Analysis execution and history

| ID / Module | Level / prerequisite | 学ぶこと・Panoptesで重要な理由 | 到達目標 | Representative code/docs | Practice |
| --- | --- | --- | --- | --- | --- |
| **M12 AnalysisJob lifecycle** | `INTERMEDIATE` / M08–M11 | Job state machine、terminal/non-terminal state、command、poll/read model、failure。 | Job開始からresult表示までを状態遷移図で説明できる。 | AnalysisJob State Machine; AnalysisJob Frontend Boundary | state-machine exercise、bug investigation |
| **M13 Async Job / Queue / Retry / Idempotency** | `ADVANCED` / M12 | delivery semantics、deduplication、retry/backoff、timeout、cancellation、poison job。 | duplicateやpartial failureに耐えるcommand/job contractを設計できる。 | AnalysisJob State Machine; API v1; future Queue implementation evidence | failure matrix、idempotency design |
| **M14 Python Worker / Chromium / Collection** | `ADVANCED` / M12–M13 | queue consumption、browser automation、collection boundary、artifact/evidence、sandbox/resource limits。 | input→collection→observation/outputを追い、backendとのtrust boundaryを示せる。 | Inventory/Development LogのWorker handoff; future Worker canonical docs/code | tracing plan、collection failure investigation |
| **M15 Snapshot / History / Lineage** | `ADVANCED` / M09, M12–M14 | immutable Snapshot、Jobとの関係、historical compatibility、version/lineage、restoration。 | current resultとhistorical Snapshotを混同せず、lineageを説明できる。 | Snapshot Component Map; Product Decision Register PD-01/04; Score/Axis Data Dictionary | lineage diagram、historical-case exercise |

### Stage D — Analysis domain

| ID / Module | Level / prerequisite | 学ぶこと・Panoptesで重要な理由 | 到達目標 | Representative code/docs | Practice |
| --- | --- | --- | --- | --- | --- |
| **M16 Common 6 Axis** | `INTERMEDIATE` / M08, M15 | six canonical identities、labels、definitions、order、version contract。UI fixture keyをProduct identityへ昇格させないため。 | 6 Axisのidentity/label/order/definitionを区別し、canonical参照を示せる。 | Score/Axis Data Dictionary; Product Decision Register PD-02B | contract reading、mapping exercise |
| **M17 Observation → Submetric → Formula** | `ADVANCED` / M16 | evidence observation、submetric、axis aggregation、formula profile/version、backend wire boundary。 | input evidenceからscore出力までの責務と未確定/確定部分を説明できる。 | Score/Axis Data Dictionary; Product Decision Register PD-02C | data-flow diagram、formula architecture review |
| **M18 Missing / Partial / Eligibility** | `ADVANCED` / M16–M17 | missing、unavailable、ineligible、partial、completed stateとfallback禁止。 | score値とavailabilityを分離し、partial resultのUI/API contractを設計できる。 | Product Decision Register PD-02D/PD-04; AnalysisJob State Machine | edge-case matrix、state representation exercise |

### Stage E — Presentation standard

| ID / Module | Level / prerequisite | 学ぶこと・Panoptesで重要な理由 | 到達目標 | Representative code/docs | Practice |
| --- | --- | --- | --- | --- | --- |
| **M19 Design Token** | `FOUNDATION` / M03–M05 | raw/semantic token、taxonomy、naming、application/exception/change policy。 | hardcoded値、raw token、semantic tokenの適切な境界を判断できる。 | Structure Policy §17; October Plan FS-05 result | token mapping、exception review |
| **M20 Tailwind** | `INTERMEDIATE` / M19 | TailwindをToken consumerとするrule、utility、arbitrary、CSS coexistence、migration。 | styling choiceをToken contractへ結び、二重正本を避けられる。 | Structure Policy §17; October Plan FS-06 result | class review、migration proposal |
| **M21 Responsive** | `INTERMEDIATE` / M04, M19–M20 | breakpointをlayout thresholdとして扱い、Layout/Page/Component adaptation、content priority、dense UI overflowを決める。 | acceptance viewportごとのownerとadaptationを説明できる。 | Structure Policy §17; October Plan FS-07 result | viewport matrix、layout exercise |
| **M22 UI Regulation / Accessibility** | `INTERMEDIATE` / M18–M21 | visual/interaction/state、semantic HTML、keyboard/focus/name/contrast/motion、form/feedback/exception review。 | UI変更をregulation checklistで評価し、canonical stateを正しく表現できる。 | Structure Policy §§17–18; October Plan FS-08 result | accessibility review、state UI exercise |

### Stage F — Delivery and assurance

| ID / Module | Level / prerequisite | 学ぶこと・Panoptesで重要な理由 | 到達目標 | Representative code/docs | Practice |
| --- | --- | --- | --- | --- | --- |
| **M23 Security fundamentals** | `INTERMEDIATE` / M10, M13, M22 | trust boundary、least privilege、secret、input/output validation、CSRF/XSS/SSRF、dependency/privacy/data handling。 | threat modelを作り、Frontend/BFF/Rails/Workerごとのcontrolを提案できる。 | Rails Auth/Organization docs; API Boundary; Development Log security handoff | threat modeling、abuse-case review |
| **M24 Testing / CI/CD** | `INTERMEDIATE` / M11, M12, M18, M22–M23 | unit/contract/integration/E2E/visual/accessibility test、quality gate、deployment verification。 | change riskに比例したtest strategyとCI gateを選べる。 | `package.json`; `tests`; `.github/workflows`; Development Log quality history | test selection、failed-pipeline diagnosis |
| **M25 Logging / Monitoring / Audit** | `ADVANCED` / M13, M23–M24 | structured log、correlation、metric/trace、SLO/alert、security/business audit、PII boundary。 | user actionからJob/Workerまでcorrelationし、observable failure contractを設計できる。 | Development Log observability handoff; future canonical telemetry docs | signal map、incident tracing exercise |

### Stage G — Platform and growth

| ID / Module | Level / prerequisite | 学ぶこと・Panoptesで重要な理由 | 到達目標 | Representative code/docs | Practice |
| --- | --- | --- | --- | --- | --- |
| **M26 Infrastructure / Cloud Boundary** | `ADVANCED` / M13, M23–M25 | runtime、network、TLS、secret/config、database/queue/storage、deployment/rollback、environment separation。 | component deployment diagramとfailure/security boundaryを説明できる。 | Development Log platform handoff; future approved cloud architecture | deployment diagram、failure-domain exercise |
| **M27 Stripe / Billing / CRM / Webhook** | `ADVANCED` / M08–M11, M13, M23, M26 | external event、signature、idempotency、subscription state、CRM sync、reconciliation、privacy。 | provider eventとcanonical billing entitlementを分離したworkflowを設計できる。 | Product Decision Register/Development Logのfuture handoff; future approved contracts | webhook sequence、reconciliation exercise |
| **M28 Performance / Scalability** | `ADVANCED` / M12–M15, M24–M26 | latency/throughput、profiling、cache、DB/query、queue backpressure、Chromium resource、capacity/cost。 | bottleneckを計測可能な仮説へ分解し、安全なscale planを提示できる。 | AnalysisJob docs; future telemetry/load evidence | bottleneck investigation、capacity design |

## 8. Dependency model

- **Hard prerequisite:** Module contractの理解に不可欠。該当Moduleのassessment evidenceが`PASS`または`PASS_WITH_FEEDBACK`であること。
- **Recommended prerequisite:** 学習効率を高めるが、mentor判断で並行履修可能。
- **Future implementation dependency:** M13、M14、M25〜M28のように現行canonical implementationが不足する領域。教材は架空の実装で埋めず、一般論、承認済みboundary、現行evidence、未実装点を分離する。
- **Product decision dependency:** Product Registerのstatusを尊重する。特にPD-03を教材内で決定済みにしない。

Module追加は既存Moduleで扱えない独立したlearning outcomeがある場合だけ行う。Data governance/privacy、event contract、cost、reliabilityは現時点ではM23、M25〜M28へ統合し、不要なlayerを増やさない。

## 9. Practice model

| Practice | 目的 | Expected evidence |
| --- | --- | --- |
| Code reading | canonical entryと責務を見つける | 読んだ範囲、owner、input/outputの短い記録 |
| Tracing exercise | request/state/eventを複数layerで追う | sequenceまたはstate diagram |
| Diagram exercise | system、deployment、lineageを外在化する | boundaryとSource of Truthを示す図 |
| Bug investigation | symptomからlayer/contract violationを絞る | hypothesis、evidence、反証、verification案 |
| Design question | trade-offと例外を判断する | decision、alternatives、risk、deferred |
| Small modification exercise | standardに沿う変更計画を作る | scoped diff案とtest plan。実編集は当該Module Phaseの許可時のみ |

各Moduleは2〜4種類を選び、全種類を機械的に課さない。TB-01では演習を実行せず、Sourceも変更しない。

## 10. Assessment model

| Assessment | 判定対象 | 使用方法 |
| --- | --- | --- |
| Knowledge Check | 用語、owner、禁止境界 | 短答。暗記だけで合格にしない |
| Code Reading Check | canonical path、flow、state owner | 初見に近い代表codeから説明する |
| Architecture Explanation | layer、Source of Truth、failure/deferred | 図を使い、自分の言葉でend-to-end説明する |
| Design Exercise | change、trade-off、security、verification | 複数案を比較し、根拠とriskを提示する |

Module結果は`NOT_STARTED / IN_PROGRESS / PASS_WITH_FEEDBACK / PASS / REVISIT`で記録する。`PASS`は全問正解ではなく、根拠を示して境界を判断できることを意味する。誤答は再学習対象を特定するdiagnostic evidenceとして扱う。

最終assessmentは、代表use caseを用いてBrowser interactionからBFF、Rails、PostgreSQL、AnalysisJob、Worker、Snapshot、analysis domain、UI state、observabilityまでを説明し、安全な小変更とverification planを提示するcapstoneとする。

## 11. Progress tracking

Learnerごとに次の最小recordを保持する。

| Field | 内容 |
| --- | --- |
| Module | ID / title / artifact version |
| Status | defined progression status |
| Evidence | exercise、diagram、explanation、review link |
| Feedback | 正しい点、誤解、再学習箇所 |
| Completed at | completion date |
| Reviewer | self / mentor / reviewer |

進捗率だけで理解を判定しない。Module artifactが変わった場合は、breaking contract changeに影響されるModuleだけを`REVISIT`候補にする。

## 12. Module artifact strategy

後続Phaseでは1 Moduleまたは密接な小群を単位として、`docs/learning/modules/NN-<slug>.md`へ教材を追加する。最初のartifactはTB-02で作成した`docs/learning/modules/01-panoptes-overall-architecture.md`である。

各Module artifactは最低限次を持つ。

1. learning goals / prerequisites
2. general concept
3. Panoptes mapping and canonical references
4. representative code/data-flow reading scope
5. design rationale and alternatives
6. implemented / documented / deferred boundary
7. exercises
8. assessment and answer-review guide
9. progress evidence fields

Parentはorder、dependency、共通評価contractを所有し、Module本文を重複保持しない。Module Phaseは必要なcodeだけを限定確認し、Source変更は明示的に許可されたexercise Phaseへ分離する。

## 13. Learning-phase completion criteria

教材制作Closure後の実学習フェーズは、次をすべて満たしたときにlearning completion reviewへ進める。これらは教材制作のClosure条件ではなく、受講者の学習完了条件である。

1. M01〜M28にapproved Module artifactまたは明示的なdefer dispositionがある。
2. Hard prerequisite順とimplemented/documented/deferred境界が維持されている。
3. Learnerが必須Moduleのassessment evidenceを提出している。
4. Frontend、BFF、Rails、PostgreSQL、Job/Worker、analysis domain、UI/operationsのend-to-end説明ができる。
5. Capstone Architecture ExplanationとDesign Exerciseが`PASS`または`PASS_WITH_FEEDBACK`である。
6. PD-03を含む未決定Product semanticsを教材が勝手に確定していない。
7. outdated reference、security-sensitive内容、implementation driftのreview ownerが明確である。
8. 残課題がimplementation、product decision、validation、platformのhandoffへ分類されている。

Bootcamp完了はProduction readinessや全機能実装を意味しない。

## 14. TB-01 completion result

| Criterion | Result |
| --- | --- |
| 1. Curriculum scope defined | `PASS` — 28 Modules / 7 Stages |
| 2. Learning order defined | `PASS` — dependency-based canonical order |
| 3. Module dependency defined | `PASS` — per-Module prerequisite + dependency rules |
| 4. Difficulty assigned | `PASS` — FOUNDATION / INTERMEDIATE / ADVANCED |
| 5. Goals defined | `PASS` — learning value and observable outcome per Module |
| 6. Practice model defined | `PASS` — six evidence-oriented practice types |
| 7. Assessment model defined | `PASS` — four assessment types + capstone |
| 8. Parent artifact created | `PASS` — this document |
| 9. Module generation strategy defined | `PASS` — one/small-group artifacts under `docs/learning/modules` |
| 10. TB-02 handoff possible | `PASS` — M01 authoring scope ready |

TB-01 DoD: `10 / 10 PASS`  
Planning blocker count: `0`  
Disposition: `COMPLETE / READY_FOR_TB-02`

## 15. TB-01 handoff result

TB-01で定義した`TB-02 — Module 01: Panoptes Overall Architecture` handoffは完了した。M01だけを対象に、一般論、Panoptes context/container、implemented/deferred境界、代表directory、diagram exercise、Architecture Explanation checkを作成し、M02以降の教材やSourceは変更していない。

## 16. TB-02 / M01 completion record

| Field | Result |
| --- | --- |
| Module | `M01 — Panoptes Overall Architecture` |
| Artifact | [01-panoptes-overall-architecture.md](./modules/01-panoptes-overall-architecture.md) |
| Status | `COMPLETE / READY_FOR_M02` |
| Prerequisite | none |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-03 — M02 Svelte / SvelteKit` |

M01はCurrent/Target/Deferredを分離し、System ArchitectureとAnalysis Request Flow、layer responsibility、Source of Truth、practice/answer guideを確定した。教材完成はLearner assessment合格またはTarget Architecture実装完了を意味しない。

## 17. TB-03 / M02 completion record

| Field | Result |
| --- | --- |
| Module | `M02 — Svelte / SvelteKit` |
| Artifact | [02-svelte-sveltekit.md](./modules/02-svelte-sveltekit.md) |
| Status | `COMPLETE / READY_FOR_M03` |
| Prerequisite | `M01 — Panoptes Overall Architecture` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-04 — M03 Component Taxonomy` |

M02はSvelte 5 runes/component model、SvelteKit route/server/rendering model、PanoptesのRoute/Page/Layout、BFF、state/props/callback境界を確定した。教材完成はLearner assessment合格、全Svelte fileの適合、Directory migration完了を意味しない。

## 18. TB-04 / M03 completion record

| Field | Result |
| --- | --- |
| Module | `M03 — Component Taxonomy` |
| Artifact | [03-component-taxonomy.md](./modules/03-component-taxonomy.md) |
| Status | `COMPLETE / READY_FOR_M04` |
| Prerequisite | `M01 — Panoptes Overall Architecture`, `M02 — Svelte / SvelteKit` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-05 — M04 Feature / UI / Layout Boundary` |

M03はFS-02の8 Category、dependency direction、classification heuristic、5つの曖昧例、`PanoptesShellPage`訂正、Target directory mappingを教材化した。教材完成はLearner assessment合格、全Component分類、Directory migration完了を意味しない。

## 19. TB-05 / M04 completion record

| Field | Result |
| --- | --- |
| Module | `M04 — Feature / UI / Layout Boundary` |
| Artifact | [04-feature-ui-layout-boundary.md](./modules/04-feature-ui-layout-boundary.md) |
| Status | `COMPLETE / READY_FOR_M05` |
| Prerequisite | `M01`, `M02`, `M03` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-06 — M05 Directory Structure` |

M04はFeature/UI/Layoutのstate、controller、command、mapping、loading/error、Data Down / Callback Upと6種の越境patternを教材化した。教材完成はLearner assessment合格、全Component Boundary audit、Source migration完了を意味しない。

## 20. TB-06 / M05 completion record

| Field | Result |
| --- | --- |
| Module | `M05 — Directory Structure` |
| Artifact | [05-directory-structure.md](./modules/05-directory-structure.md) |
| Status | `COMPLETE / READY_FOR_M06` |
| Prerequisite | `M01`, `M02`, `M03`, `M04` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-07 — M06 State / Controller / Command` |

M05はFS-04のtarget directory、Route/Page/Feature/Layout/UI/Primitive placement、Feature-local/Shared判定、canonical import、限定barrel、Current/Target/Deferred Migrationと段階移行を教材化した。教材完成はLearner assessment合格、全file再分類、Directory migration完了を意味しない。

## 21. TB-07 / M06 completion record

| Field | Result |
| --- | --- |
| Module | `M06 — State / Controller / Command` |
| Artifact | [06-state-controller-command.md](./modules/06-state-controller-command.md) |
| Status | `COMPLETE / READY_FOR_M07` |
| Prerequisite | `M01`, `M02`, `M03`, `M04`, `M05` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-08 — M07 BFF` |

M06はState class/owner、derived state、Controller/Store/View Model、Command/Client、UI intentからRails response表示までのflow、loading/error/retry境界を教材化した。教材完成はLearner assessment合格、全Feature state audit、Command migration、Backend実装完了を意味しない。

## 22. TB-08 / M07 completion record

| Field | Result |
| --- | --- |
| Module | `M07 — BFF` |
| Artifact | [07-bff.md](./modules/07-bff.md) |
| Status | `COMPLETE / READY_FOR_M08` |
| Prerequisite | `M01`, `M02`, `M03`, `M04`, `M05`, `M06` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-09 — M08 Rails Business Backend` |

M07はBFF fundamentals、Browser/Client/BFF/Rails責務、Supabase SSR cookie/session、route guardとbusiness authorization、Organization scope、explicit proxy、response/error/redirect securityを教材化した。教材完成はLearner assessment合格、全BFF endpoint/security audit、Production Analysis API実装完了を意味しない。

## 23. TB-09 / M08 completion record

| Field | Result |
| --- | --- |
| Module | `M08 — Rails Business Backend` |
| Artifact | [08-rails-business-backend.md](./modules/08-rails-business-backend.md) |
| Status | `COMPLETE / READY_FOR_M09` |
| Prerequisite | `M01`, `M02`, `M03`, `M04`, `M05`, `M06`, `M07` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-10 — M09 PostgreSQL / Source of Truth` |

M08はRails/API-only、CURRENT Organization request lifecycle、business authorization/rule/state transition、transaction/persistence、Rails/Worker、PD-04 Partial/Snapshot、Usage/Audit境界を教材化した。教材完成はLearner assessment合格、Production Analysis backend、Job/Queue/Worker、Snapshot/Usage schema実装完了を意味しない。

## 24. TB-10 / M09 completion record

| Field | Result |
| --- | --- |
| Module | `M09 — PostgreSQL / Source of Truth` |
| Artifact | [09-postgresql-source-of-truth.md](./modules/09-postgresql-source-of-truth.md) |
| Status | `COMPLETE / READY_FOR_M10` |
| Prerequisite | `M01`, `M02`, `M03`, `M04`, `M05`, `M06`, `M07`, `M08` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-11 — M10 Auth / Authorization / Organization` |

M09はRDB/PostgreSQL基礎、Decision OwnershipとDurable Data Ownership、CURRENT Identity/Organization schema、key/constraint、transaction/concurrency、Snapshot/history/lineage、derived/cache境界を教材化した。Stage BのM08–M11番号は実施済みModule briefに同期した。教材完成はLearner assessment合格、Project/AnalysisJob/Snapshot/Usage/Audit schema実装、migration実行、Production Readinessを意味しない。

## 25. TB-11 / M10 completion record

| Field | Result |
| --- | --- |
| Module | `M10 — Auth / Authorization / Organization` |
| Artifact | [10-auth-authorization-organization.md](./modules/10-auth-authorization-organization.md) |
| Status | `COMPLETE / READY_FOR_M11` |
| Prerequisite | `M01`, `M02`, `M03`, `M04`, `M05`, `M06`, `M07`, `M08`, `M09` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-12 — M11 API / OpenAPI` |

M10はAuthentication/Authorization、Supabase SSR session/cookie、SvelteKit Route/BFF guard、Rails JWT/User mapping、Organization/Membership/Role、resource ownership、multi-tenant isolation、PD-01B deep-link/current Organization境界を教材化した。BFF `organization_owner`とRails `owner`の語彙差は、同一性を推測せずcontract verification handoffとして保持した。教材完成はLearner assessment合格、全Route permission監査、Project/AnalysisJob/Snapshot authorization実装、production Supabase verificationを意味しない。

## 26. TB-12 / M11 completion record

| Field | Result |
| --- | --- |
| Module | `M11 — API / OpenAPI` |
| Artifact | [11-api-openapi.md](./modules/11-api-openapi.md) |
| Status | `COMPLETE / READY_FOR_M12` |
| Prerequisite | `M01`, `M02`, `M03`, `M04`, `M05`, `M06`, `M07`, `M08`, `M09`, `M10` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-13 — M12 AnalysisJob lifecycle` |

M11はAPI/HTTP contract、request/response/status/error、validation/auth、Client/BFF/Rails/OpenAPI、schema/operationId、versioning/compatibilityを教材化した。OpenAPI draftは`18 operations / 18 unique operationIds`、CURRENT Rails/BFFは5 read endpointであることを分離した。API proseのError例とOpenAPI/CURRENT Railsの`request_id`配置差は、解消済みとせずcontract maintenance handoffとして保持した。教材完成はLearner assessment合格、Target operation実装、OpenAPI lint/breaking diff、Production Readinessを意味しない。

## 27. TB-13 / M12 completion record

| Field | Result |
| --- | --- |
| Module | `M12 — AnalysisJob Lifecycle` |
| Artifact | [12-analysis-job-lifecycle.md](./modules/12-analysis-job-lifecycle.md) |
| Status | `COMPLETE / READY_FOR_M13` |
| Prerequisite | `M01`, `M02`, `M03`, `M04`, `M05`, `M06`, `M07`, `M08`, `M09`, `M10`, `M11` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-14 — M13 Async Job / Queue / Retry / Idempotency` |

M12はJob identity、canonical lifecycle、Request/Job/Worker/Product state、terminal outcomes、PD-04 Partial、Rails/Worker ownership、Retry/Reanalysis、Snapshot eligibilityを教材化し、state flowとidentity flowの2図を収録した。Phase A-5 state-machine文書のSnapshot/current記述と後発PD-04の差は、PD-04を優先してdocument sync handoffとして保持した。教材完成はLearner assessment合格、Rails/Queue/Worker/Job persistence実装、Production Readinessを意味しない。

## 28. TB-14 / M13 completion record

| Field | Result |
| --- | --- |
| Module | `M13 — Async Job / Queue / Retry / Idempotency` |
| Artifact | [13-async-job-queue-retry-idempotency.md](./modules/13-async-job-queue-retry-idempotency.md) |
| Status | `COMPLETE / READY_FOR_M14` |
| Prerequisite | `M01`, `M02`, `M03`, `M04`, `M05`, `M06`, `M07`, `M08`, `M09`, `M10`, `M11`, `M12` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-15 — M14 Python Worker / Chromium / Collection` |

M13はSync/Async、Queue delivery、Producer/Consumer、AnalysisJob/Message/Attempt、Retry/Reanalysis、Idempotency、duplicate delivery、timeout/cancellation、DLQ/heartbeat、Rails/Queue/Worker境界を教材化し、async flowとduplicate deliveryの2図を収録した。CURRENT frontend/mockとTARGET architecture、未実装Production Queue/Worker/idempotency enforcementを分離した。教材完成はQueue製品選定、Production実装、retry policy具体値、DLQ/heartbeat/cancellation実装完了を意味しない。

## 29. TB-15 / M14 completion record

| Field | Result |
| --- | --- |
| Module | `M14 — Python Worker / Chromium / Collection` |
| Artifact | [14-python-worker-chromium-collection.md](./modules/14-python-worker-chromium-collection.md) |
| Status | `COMPLETE / READY_FOR_M15` |
| Prerequisite | `M01`, `M02`, `M03`, `M04`, `M05`, `M06`, `M07`, `M08`, `M09`, `M10`, `M11`, `M12`, `M13` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-16 — M15 Snapshot / History / Lineage` |

M14はWorker責務、HTTP/Browser使い分け、Collection Pipeline、HTML/DOM/Screenshot Evidence、Observation/Artifact/Product Result/Snapshot境界、failure/retry、resource/security、Rails/Queue/Worker/Artifact Store境界を教材化し、CollectionとEvidence hierarchyの2図を収録した。Production Python/Chromium実装が存在しないことと、Observation Output Contractが承認済みでも未実装であることを明示した。教材完成はWorker runtime、library、storage、resource limit、security hardeningの決定・実装完了を意味しない。

## 30. TB-16 / M15 completion record

| Field | Result |
| --- | --- |
| Module | `M15 — Snapshot / History / Lineage` |
| Artifact | [15-snapshot-history-lineage.md](./modules/15-snapshot-history-lineage.md) |
| Status | `COMPLETE / READY_FOR_M16` |
| Prerequisite | `M01`, `M02`, `M03`, `M04`, `M05`, `M06`, `M07`, `M08`, `M09`, `M10`, `M11`, `M12`, `M13`, `M14` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-17 — M16 Common 6 Axis` |

M15はSnapshot/history、latest/current/Strategy Source、Evidence/Artifact/Observation/Result/Snapshot、immutability、lineage/version、PD-04 Limited Snapshot、PD-01 deep-link/authorizationを教材化し、Evidence lineageとpointer separationの2図を収録した。CURRENT mock aggregateのmutable strategy/task投影はProduction immutabilityの証拠ではなくimplementation gapとして明記した。教材完成はRails persistence、history UI、lineage/compatibility、retention実装完了を意味しない。

## 31. TB-17 / M16 completion record

| Field | Result |
| --- | --- |
| Module | `M16 — Common 6 Axis` |
| Artifact | [16-common-six-axis.md](./modules/16-common-six-axis.md) |
| Status | `COMPLETE / READY_FOR_M17` |
| Prerequisite | `M01`, `M02`, `M03`, `M04`, `M05`, `M06`, `M07`, `M08`, `M09`, `M10`, `M11`, `M12`, `M13`, `M14`, `M15` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-18 — M17 Observation → Submetric → Formula` |

M16はAxis Contract v1の6 ID/Label/Definition/Order、Axis boundary、Evidence/Observation/Submetric/Score、Internal/Visual、PD-02D Missing/Partial、comparison/Strategy境界を教材化し、Evidence flowとSix Axis mapの2図を収録した。CURRENT fixture/UIのlegacy `funnelStrength`、非Canonical順、synthetic score、missing fallbackはProduct/Formula正本ではないと明記した。教材完成はexact parameter、calibration、legacy migration、Worker/Rails/Frontend実装完了を意味しない。

## 32. TB-18 / M17 completion record

| Field | Result |
| --- | --- |
| Module | `M17 — Observation → Submetric → Formula` |
| Artifact | [17-observation-submetric-formula.md](./modules/17-observation-submetric-formula.md) |
| Status | `COMPLETE / READY_FOR_M18` |
| Prerequisite | `M01`, `M02`, `M03`, `M04`, `M05`, `M06`, `M07`, `M08`, `M09`, `M10`, `M11`, `M12`, `M13`, `M14`, `M15`, `M16` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-19 — M18 Missing / Partial / Eligibility` |

M17はEvidence→Observation→Submetric→Internal/Visual Axis/Layer→Overall、Observation Output Contract、Formula Architecture/Policy/Version/Wire、PD-02D completeness/eligibility、Rails/Worker ownership、Calibration境界を教材化し、measurement pipelineとownershipの2図を収録した。承認済みlogical architectureと未決定exact parameter/calibration/physical implementationを分離した。教材完成はFormula数値、Calibration、schema、runtime実装完了を意味しない。

## 33. TB-19 / M18 completion record

| Field | Result |
| --- | --- |
| Module | `M18 — Missing / Partial / Eligibility` |
| Artifact | [18-missing-partial-eligibility.md](./modules/18-missing-partial-eligibility.md) |
| Status | `COMPLETE / READY_FOR_M19` |
| Prerequisite | `M01`–`M17` |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-20 — M19 Design Token` |

M18はPD-02D Treatment Model Bに基づき、Missing、N/A、Unknown、Partial、Valid Zero、Completeness、Eligibility、Score Stateを分離して教材化した。Job-level `partially_completed`、Axis/Score state、Limited Snapshot、Comparison/Strategyの境界を接続し、missing→0、silent one-layer fallback、未承認thresholdの発明を禁止した。教材完成はExact Threshold、Required Set、Calibration、physical schema、Production implementationの完成を意味しない。

## 34. TB-20 / M19 completion record

| Field | Result |
| --- | --- |
| Module | `M19 — Design Token` |
| Artifact | [19-design-token.md](./modules/19-design-token.md) |
| Status | `COMPLETE / READY_FOR_M20` |
| Prerequisite | `M01`–`M18`（direct curriculum dependency: `M03`–`M05`） |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-21 — M20 Tailwind` |

M19はFS-05 Design Token Contract v1に基づき、Raw/Semantic境界、10 Category、命名、`tokens.css` Source of Truth、Component/Tailwind/Responsive/Motion/Productの境界、例外・変更・migrationを教材化した。Target `src/lib/ui/tokens.css`とCURRENT未実装状態を区別し、TokenやTailwindの実装済み誤認を防いだ。教材完成はToken実装、Source migration、visual/accessibility verificationの完了を意味しない。

## 35. TB-21 / M20 completion record

| Field | Result |
| --- | --- |
| Module | `M20 — Tailwind` |
| Artifact | [20-tailwind.md](./modules/20-tailwind.md) |
| Status | `COMPLETE / READY_FOR_M21` |
| Prerequisite | `M01`–`M19`（direct curriculum dependency: `M19`） |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-22 — M21 Responsive` |

M20はFS-06 Tailwind Standardに基づき、Utility-first、Token/Tailwind boundary、7 Utility Category、responsive/state、CSS coexistence、arbitrary value、class extraction、migration/visual parityを教材化した。CURRENT repositoryにTailwind dependency/configおよび`tokens.css`がないことをTargetと分離した。教材完成はTailwind install/config、Token implementation、CSS migration、browser/visual/accessibility verificationの完了を意味しない。

## 36. TB-22 / M21 completion record

| Field | Result |
| --- | --- |
| Module | `M21 — Responsive` |
| Artifact | [21-responsive.md](./modules/21-responsive.md) |
| Status | `COMPLETE / READY_FOR_M22` |
| Prerequisite | `M01`–`M20`（direct curriculum dependencies: `M04`, `M19`, `M20`） |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-23 — M22 UI Regulation / Accessibility` |

M21はFS-07 Responsive Contract v1に基づき、Mobile-first、Canonical Breakpoint、Layout/Page/Component responsibility、Content Priority、dense UI、Navigation、Typography/Spacing、Root/Local Overflow、6 Acceptance Viewportsを教材化した。既存breakpoint群をmigration evidenceとして扱い、Canonical thresholdへの機械変換やvisual合否の推測を避けた。教材完成はResponsive Source migration、browser実測、visual regression、accessibility verificationの完了を意味しない。

## 37. TB-23 / M22 completion record

| Field | Result |
| --- | --- |
| Module | `M22 — UI Regulation / Accessibility` |
| Artifact | [22-ui-regulation-accessibility.md](./modules/22-ui-regulation-accessibility.md) |
| Status | `COMPLETE / READY_FOR_M23` |
| Prerequisite | `M01`–`M21`（direct curriculum dependencies: `M03`–`M05`, `M18`–`M21`） |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-24 — M23 Security Fundamentals` |

M22はFS-08 UI Regulation v1に基づき、Visual/Interaction consistency、Canonical UI state、Semantic HTML、Keyboard/Focus、Name/Label、Contrast/Target/Motion、Form/Feedback、Empty/Error/Partial、Component/Responsive/Token接続、Exception/Reviewを教材化した。Source上の良いpatternとgapを区別し、Documentation completionとruntime Accessibility verificationを明確に分離した。教材完成はAccessibility conformanceやUI remediationの完了を意味しない。

## 38. TB-24 / M23 completion record

| Field | Result |
| --- | --- |
| Module | `M23 — Security Fundamentals` |
| Artifact | [23-security-fundamentals.md](./modules/23-security-fundamentals.md) |
| Status | `COMPLETE / READY_FOR_M24` |
| Prerequisite | `M01`–`M22`（direct curriculum dependencies: `M07`–`M15`, `M22`） |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-25 — M24 Testing / CI/CD` |

M23はCIA、Asset/Threat/Trust Boundary、Defense in Depth、Authentication/Authorization、Session/Cookie/CSRF/XSS、API/Multi-tenant/Secret/Data保護、Worker/External Web/Chromium/LLM、Queue/Retry/Idempotency、Logging/Audit/Supply Chainを教材化した。CURRENTの認証・Organization scope・安全なerror/logging実装と、TARGETのWorker/外部入力防御、DEFERREDの運用検証・hardeningを分離した。教材完成はpenetration test、脆弱性修正、Production security readinessの完了を意味しない。

## 39. TB-25 / M24 completion record

| Field | Result |
| --- | --- |
| Module | `M24 — Testing / CI/CD` |
| Artifact | [24-testing-cicd.md](./modules/24-testing-cicd.md) |
| Status | `COMPLETE / READY_FOR_M25` |
| Prerequisite | `M01`–`M23`（direct curriculum dependencies: `M03`, `M04`, `M06`–`M18`, `M22`, `M23`） |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-26 — M25 Logging / Monitoring / Audit` |

M24はTesting fundamentals、Unit/Integration/Contract、Component/E2E、Static/Build/Type/Lint、Authorization/Async/Formula/Snapshot、Regression/Flaky/Isolation、CI/CD/Deployment Gateを教材化した。CURRENTのVitest/Minitest/OpenAPI/quality workflowsと、TARGETのlayer-aligned portfolio/critical E2E/CD gate、DEFERREDのfull browser・performance・Production deployment automationを分離した。教材完成はTest実行、CI required gate設定、Production deployment readinessの完了を意味しない。

## 40. TB-26 / M25 completion record

| Field | Result |
| --- | --- |
| Module | `M25 — Logging / Monitoring / Audit` |
| Artifact | [25-logging-monitoring-audit.md](./modules/25-logging-monitoring-audit.md) |
| Status | `COMPLETE / READY_FOR_M26` |
| Prerequisite | `M01`–`M24`（direct curriculum dependencies: `M07`–`M15`, `M18`, `M23`, `M24`） |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-27 — M26 Infrastructure / Cloud Boundary` |

M25はObservability、Structured Logging、Metrics/Monitoring、Alerting、Request/Job/Attempt Correlation、Job/Queue/Worker/API observability、Audit、Lineage、Security/Privacyを教材化した。CURRENTのrequest ID、BFF forwarding、Rails safe error/log、Frontend Job diagnosticsと、TARGETのcentral visibility/Audit、DEFERREDのvendor/SLO/threshold/retention/on-callを分離した。教材完成はMonitoring導入、Production Alert運用、Business Audit persistenceの完了を意味しない。

## 41. TB-27 / M26 completion record

| Field | Result |
| --- | --- |
| Module | `M26 — Infrastructure / Cloud Boundary` |
| Artifact | [26-infrastructure-cloud-boundary.md](./modules/26-infrastructure-cloud-boundary.md) |
| Status | `COMPLETE / READY_FOR_M27` |
| Prerequisite | `M01`–`M25`（direct curriculum dependencies: `M01`, `M07`–`M15`, `M23`–`M25`） |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-28 — M27 Stripe / Billing / CRM / Webhook` |

M26はApplication/Infrastructure/Cloudの3層、Compute/Network、PostgreSQL/Queue/Worker/Artifact、Scaling、Availability/Backup/Recovery、Environment/Deployment、Portability/Security/Costを教材化した。CURRENTのadapter-auto、Supabase/Auth environment、Rails PostgreSQL/Docker/development compose/quality CIと、TARGETのseparable runtime、DEFERREDのprovider/service/topology/sizing/RPO/RTO/IaCを分離した。教材完成はCloud選定、Infrastructure構築、Production deployment readinessの完了を意味しない。

## 42. TB-28 / M27 completion record

| Field | Result |
| --- | --- |
| Module | `M27 — Stripe / Billing / CRM / Webhook` |
| Artifact | [27-stripe-billing-crm-webhook.md](./modules/27-stripe-billing-crm-webhook.md) |
| Status | `COMPLETE / READY_FOR_M28` |
| Prerequisite | `M01`–`M26`（direct curriculum dependencies: `M08`–`M18`, `M23`–`M26`） |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-29 — M28 Performance / Scalability` |

M27はPlan/Subscription/Entitlement、Usage/Charge/Technical Cost、Provider identity/state、Webhook security/idempotency/order、Reconciliation、CRM field ownership、Commercial Auditを教材化した。PD-04のapproved Usage directionとCURRENT mock displayを、TARGETのRails-owned Commercial Domain、DEFERREDのStripe/CRM/Pricing/Charge/Quota/schemaから分離した。教材完成はStripe/CRM導入、Webhook/Checkout実装、Commercial production readinessの完了を意味しない。

## 43. TB-29 / M28 completion record

| Field | Result |
| --- | --- |
| Module | `M28 — Performance / Scalability` |
| Artifact | [28-performance-scalability.md](./modules/28-performance-scalability.md) |
| Status | `COMPLETE / READY_FOR_BOOTCAMP_CLOSURE_REVIEW` |
| Prerequisite | `M01`–`M27`（direct curriculum dependencies: `M01`, `M06`–`M18`, `M24`–`M27`） |
| Completion | Authoring DoD `10 / 10 PASS` |
| Handoff | `TB-30 — Panoptes Technical Bootcamp Parent Closure Review` |

M28はPerformance/Scalability、Latency/Throughput/Concurrency/Saturation、Frontend/BFF/Rails/DB、Queue/Worker/Chromium、Cache/Backpressure、Capacity/Cost、Testing/Observabilityを教材化した。CURRENTのpolling/timeout/query/thread/connection設定を性能実測と区別し、TARGETのend-to-end measurementとDEFERREDのSLO/load/cache/autoscaling/tuningを分離した。M01〜M28のModule authoringが揃い、Parent Closure Reviewへhandoff可能である。

## 44. TB-30 Parent Closure Review

M01〜M28の28 artifact、canonical order、status、prerequisite/handoff、Authoring DoD、主要Architecture/Product contract、CURRENT/TARGET/DEFERRED境界、relative documentation linkを確認した。Closure blockerは`0`、教材制作Closure Criteriaは`10 / 10 PASS`である。

Panoptes Technical Bootcampの**教材制作フェーズ**を`BOOTCAMP_MATERIALS_COMPLETE / READY_FOR_LEARNING_PHASE / CLOSED`として正式にCloseする。これは教材とCurriculumが実学習を開始できる状態になったことを示す。受講者のassessment evidence、Architecture Explanation、Design Exercise、Capstoneは次のLearning / Assessment Phaseで実施し、上記「Learning-phase completion criteria」で判定する。

実装gapは各ModuleのCURRENT/TARGET/DEFERREDとして引き続き追跡する。教材完成はSource migration、Production Queue/Worker、Snapshot/Formula runtime、Tailwind/token実装、Security/Accessibility/Monitoring/Cloud/Commercial/Performance対応、またはProduction readinessの完了を意味しない。

Closure根拠は[TB-30 Parent Closure Review](../audit/131-panoptes-technical-bootcamp-parent-closure-review.md)を正本とする。
