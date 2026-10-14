# Panoptes Development Log

Panoptesの主要な開発・監査・リファクタリング履歴を時系列で記録する。

詳細仕様の正本ではなく、「何を・なぜ・いつ変更したか」を追跡するためのプロジェクトログである。技術仕様、契約、検証根拠は各PhaseのReferencesに示す監査・Architecture・API・Rails文書を正本とする。

## Current Status

- Latest completed phase: Phase TB-30（Panoptes Technical Bootcamp Parent Closure Review）
- Next recommended area: Panoptes Technical Bootcamp Learning / Assessment
- Rails: Phase R-1 completed / frozen
- Frontend Quality Gate: Active
- Production Build: Passing
- OpenAPI Contract Gate: Active（18 operations / 18 unique operation IDs）
- Component Cleanup: Closed with deferred items
- Tailwind Migration: Not started
- Design Token Migration: Not started
- Latest verified quality: 22 test files / 257 tests、ESLint 0 errors / 38 warnings、`npm run quality` PASS

## Phase M-1 — 8/17 MTG Current State and Three-month Inventory Plan

**Status:** Completed  
**Category:** Planning / Documentation  
**Objective:** Phase B-3Hまでの実装、設計、未実装を分離し、2026-08-17 MTGで合意すべき事項と最大3か月の棚卸し・検証順序を正本化する。

### Changes

- Product、Frontend、Auth、Organization、API、Rails、Worker、DB、Queue、Storage、Quality、Design、Infrastructure、Security、Documentationの15領域を共通statusで整理した。
- MVP capabilityをUI、mock、API contract、backend、worker、production readinessに分けて可視化した。
- 8月後半〜11月前半をcommitmentではなく、scope、frontend stabilization、domain/API、Rails、worker、stagingのgate-based timeboxとして整理した。
- MTG用の詳細資料、roadmap、one-page summaryを作成した。

### Result

- 現行はAuth/Organization/quality foundationとUI/API設計が進んでいる一方、business API 13件、Python worker、Queue、Artifact storageが未実装であり、MVPはproduction-readyではないと明示した。
- B-1〜B-3Hの成果、current metrics、technical debt、risk、依存関係を1つのplanning setへ統合した。
- Svelteの`organization_owner`とRailsの`owner`のrole語彙差を、write API前の解決事項として記録した。

### Decisions

- Roadmapは納期約束ではなく、exit criteria付きの最大3か月の棚卸し・vertical slice検証計画とする。
- Current architectureとplanned target architectureを分離し、未実装を完成扱いしない。
- CloudとTailwindの最終判断は、workload、token、visual baselineの前提が揃うまで保留する。

### Deferred / Remaining

- 8/17 MTGでMVP境界、最小vertical slice、workstream owner、capacity、staging success criteriaを決定する。
- AWS/Azure、Queue/Storage/LLM provider、full Tailwind migration、production scaleは未決定とする。
- M-1では`src/`、`rails/`、`tests/`を変更せず、quality baselineの再実行は行っていない。

### References

- [8/17 MTG Current State](./planning/2026-08-17-mtg-panoptes-current-state.md)
- [Three-month Inventory Roadmap](./planning/2026-08-17-three-month-inventory-roadmap.md)
- [8/17 MTG One-page Summary](./planning/2026-08-17-mtg-one-page-summary.md)

## Phase M-2 — 8/17 MTG Slide Story and Scripts

**Status:** Completed  
**Category:** Planning / Communication  
**Objective:** M-1の現在地と最大3か月Roadmapを、Panoptesのコードを日常的に見ない関係者にも短時間で説明し、MVP境界と最小Vertical Sliceの意思決定へつなげる資料原稿へ変換する。

### Changes

- Product価値、現在地、Architecture、整理成果、Business PipelineのGap、Roadmap、依存関係、意思決定を10枚でつなぐSlide Storyboardを作成した。
- 10〜15分のStandard版、5〜7分のShort版、Opening、Closing、各SlideのSpeaker Notesを作成した。
- Rails、Python Worker、Supabase、Cloud、完成時期、MVP、UI、Security、cost等の想定15問をShort Answer / Detail / TBDで整理した。
- Aug H2をMTG上では「Frontend stabilization継続＋Scope/Baseline確定」と表現し、既に進行したB-1〜B-3Hを反映した。

### Result

- Main Messageを「基盤は整ったが中心のBusiness Pipelineは未接続。次は最小Vertical Sliceを依存順に検証する」に統一した。
- 8/17で最優先に決める事項をMVP境界、最小Vertical Slice、最大3か月の推奨実施順序へ絞った。
- Provider、capacity、cost等を推測せず、Decision Required / TBDとして回答できる原稿を用意した。

### Decisions

- 10枚構成とし、Short版ではSlide 3と6を省略可能、Slide 5・7・9を必須anchorとする。
- 3か月を完成期限ではなく、exit criteria付きの推奨実施順序として説明する。
- M-1 Roadmap正本は変更せず、presentation上のAug H2表現だけを補正する。

### Deferred / Remaining

- Team人数、担当、稼働率、workload、Artifact容量、retention、Cloud予算、Product KPI、provider選択はTBD。
- PowerPoint / Google Slides本体、visual design、brand template、実際のMTG決定内容は後続。
- M-2では`src/`、`rails/`、`tests/`を変更せず、full qualityは再実行していない。

### References

- [8/17 MTG Slide Storyboard](./planning/2026-08-17-mtg-slide-storyboard.md)
- [8/17 MTG Speaker Notes](./planning/2026-08-17-mtg-speaker-notes.md)
- [8/17 MTG Q&A](./planning/2026-08-17-mtg-qa.md)
- [M-1 Current State](./planning/2026-08-17-mtg-panoptes-current-state.md)
- [M-1 Three-month Roadmap](./planning/2026-08-17-three-month-inventory-roadmap.md)

## Phase A-1 — Production Build Recovery

**Status:** Completed  
**Category:** Frontend / Architecture / Quality  
**Objective:** 解決不能importを持つAdmin 6件とSignup 2件のwrapperを調査し、現行画面に基づく正本を定めてproduction buildを復旧する。

### Changes

- 親directoryに存在しない実体を参照していたAdmin 6件を、`admin/`配下の実体として正本化した。
- `AdminDashboard`を現行`AdminConsole`のdata contractに合わせて構成した。
- Signup 2件の透過wrapperは、この時点では互換層として残し、存在する`ComponentsBase`正本へimportを修正した。
- 未使用と断定できない実装は削除しなかった。

### Result

- `npm run build`: PASS（exit 0）。
- 静的unresolved import: 0件。
- Svelte個別compile: 136件成功、failure 0、warning 0。
- Import cycle: 0件。
- 主要routeのSSR確認に成功した。

### Decisions

- Adminは不存在の旧参照先ではなく、現行routeの合成元とdata contractを正本判断の根拠とした。
- Signupの実体は`ComponentsBase/SignUpForm.svelte`と`ComponentsBase/SignUpBtn.svelte`を正本とした。
- Auth・Organization guard、Rails、Tailwind、全体再編はこのPhaseに含めなかった。

### Deferred / Remaining

- Signup wrapperの最終削除判断。
- `/admin`の認証・Role・Organization防御。
- 型検査、lint、testの品質ゲート。

### References

- [Phase A-1 Build復旧とWrapper正本化](./audit/12-build-recovery.md)

## Phase A-2 — Quality Gates

**Status:** Completed  
**Category:** Quality  
**Objective:** 型検査、lint、format、unit test、production build、route smokeを一つの再現可能な品質ゲートにまとめ、CIでも継続実行できるようにする。

### Changes

- Svelte check、ESLint、Prettier、Vitest、route smoke testを導入した。
- `npm run quality`を、検査途中の失敗で非ゼロ終了する統合commandとして追加した。
- GitHub Actions workflow、`.editorconfig`、clean-install検証を追加した。
- 既存lint問題は一括自動修正せず、既知カテゴリをwarning baselineとして段階化した。

### Result

- 1 test file / 5 tests passed。
- Svelte check: 0 errors / 0 warnings。
- ESLint: 0 errors / 93 warnings。
- Production buildと6 route smoke: PASS。
- `npm run quality`: PASS（exit 0）。

### Decisions

- 既存UIを大規模にformat・修正せず、93 warningsを改善開始点として記録した。
- component test、browser E2E、visual regression、accessibility testは独立した品質Phaseへ送った。
- deployment target未決のためproduction adapterは固定しなかった。

### Deferred / Remaining

- ESLint warningの小単位解消と、解消済みruleのerror昇格。
- component testと実browser testの共通基盤。
- production adapter選定。

### References

- [Phase A-2 Quality Gates](./audit/13-quality-gates.md)

## Phase A-3 — Auth / Role / Organization Boundary

**Status:** Completed  
**Category:** Security / Architecture / Frontend  
**Objective:** 完成版Authを推測で作らず、SvelteKit入口でのsecure defaultとAuth・Role・Organizationの責任境界を先に確立する。

### Changes

- SvelteKit server guardと`event.locals.auth`を導入した。
- Auth Context、Organization membership、active Organization、SystemAdmin、development capabilityをroute policyへ反映した。
- productionでdev routeを404にし、Mock Authへのfallbackを禁止した。
- protected、admin、organization selectionのroute境界をtest化した。

### Result

- 2 test files / 15 tests passed。
- Svelte check: 0 errors / 0 warnings。
- ESLint: 0 errors / 93 warnings。
- Production buildと`npm run quality`: PASS。

### Decisions

- SvelteKitは入口拒否とSSR contextを担当し、業務resourceの認可とOrganization scopeはRailsでも再検証する。
- Role不足は403、別Organization resourceの存在漏えい防止には404を推奨する境界を定めた。
- Admin backend操作や細粒度業務permissionは実装しなかった。

### Deferred / Remaining

- Supabase実sessionとの接続。
- Rails側のJWT再検証、membership正本、resource-level authorization。
- Password reset、OTP、callback、logoutの完成。

### References

- [Phase A-3 Auth・Role・Organization境界](./audit/14-auth-organization-boundary.md)

## Phase A-4 — Supabase SSR Authentication

**Status:** Completed  
**Category:** Security / Frontend / Architecture  
**Objective:** Supabase browser AuthをSvelteKit SSR cookie sessionへ接続し、callback、refresh、logout、secret境界を一つの検証経路へ統合する。

### Changes

- `@supabase/ssr`によるbrowser/server clientとrequest単位のsession検証を導入した。
- PKCE callback、session refresh、POST logout、安全なreturn URL処理を実装した。
- 検証済みUserからAuth Contextを構築し、Organization guardへ接続した。
- service-role識別子・値のclient bundle混入を検査するsecret scanを品質ゲートへ追加した。

### Result

- 3 test files / 21 tests passed。
- Svelte check: 0 errors / 0 warnings。
- ESLint: 0 errors / 93 warnings。
- Auth smoke、build、client secret scan、route smoke、`npm run quality`: PASS。

### Decisions

- productionで実Supabaseが未設定・失効・障害の場合もMock sessionを生成せず、protected routeを拒否する。
- service-role keyはSvelteKit frontendから参照しないserver-only secretとした。
- Provider sessionの検証をcookie存在確認で代用しない。

### Deferred / Remaining

- Password resetとOTP専用UI・route。
- Actual Supabase staging integration、CSP、監視、依存脆弱性対応。
- Rails側の二重認証・二重認可。

### References

- [Phase A-4 Supabase SSR認証](./audit/15-supabase-ssr-auth.md)

## Phase A-5 — API Contract Canonicalization

**Status:** Completed  
**Category:** Architecture / API  
**Objective:** 現行の外部I/Oを棚卸しし、SvelteKit BFF、Rails API、Python Workerの責任分界と、将来実装する業務API契約の正本を定める。

### Changes

- 外部I/O 16操作を調査した。内訳はPanoptes業務API 9、waitlist 1、Supabase browser Auth 3、server Auth 3である。
- Panoptes業務API 9操作のうち、8操作が現行UIから到達し、usage 1操作が未使用であることを確認した。
- Organizationをpath scopeの正本とするOpenAPI draftを13 operationsから開始した。
- AnalysisJob state machine、共通error、idempotency、BFF/Rails/Worker責任境界を文書化した。
- Rails実装backlogを作成した。

### Result

- 現行SvelteKitにPanoptes業務APIの対応`+server` routeが0本であり、Mock無効時は未接続であることを明確化した。
- `POST /api/waitlist/join`の呼出元は存在する一方、対応routeがrepository内に存在しないことを確定した。
- `GET /api/usage/current`は未使用としてMVP OpenAPIから除外した。

### Decisions

- OpenAPIを正式契約の正本とし、現行MockをRails contractの正本にしない。
- BrowserからRailsを直接呼ばず、SvelteKit BFFを認証cookieとerror shapingの境界にする。
- RailsはJWT、membership、resource ownershipを独立して再検証する。

### Deferred / Remaining

- Project、AnalysisJob、Queue、Worker、Strategy、Roadmapの実装。
- Worker event、timeout、partial result、observabilityの具体化。
- Waitlist BFFと永続化。

### References

- [API・外部I/O棚卸し](./audit/16-api-contract-inventory.md)
- [API Boundary](./architecture/api-boundary.md)
- [Panoptes API v1](./api/panoptes-api-v1.md)
- [AnalysisJob State Machine](./api/analysis-job-state-machine.md)
- [OpenAPI Draft](./api/openapi-draft.yaml)
- [Rails Implementation Backlog](./audit/17-rails-implementation-backlog.md)

## Rails Phase R-1 — Rails Foundation

**Status:** Completed / Frozen  
**Category:** Backend / Security / Architecture / Quality  
**Objective:** 業務機能へ進む前に、API-only Rails、PostgreSQL、Supabase JWT独立検証、User・Organization・Role境界を構築する。

### Changes

- Ruby 3.4.10 / Rails 8.1.3.xのAPI-only applicationを`rails/`へ追加した。
- PostgreSQL UUID schema、User mapping、Organization、OrganizationMembership、Role、SystemRoleを追加した。
- Bearer token、issuer、audience、期限、UUID subject、JWKS取得・cache・rotationを検証するJWT verifierを実装した。
- health、current user、organizations、current membershipと、それらの認証済みread-only SvelteKit BFFを追加した。
- Docker、Compose、Rails CI、RuboCop、Brakeman、Bundler Auditを導入した。
- OpenAPIを18 operationsへ更新した。

### Result

- Rails tests: 18 runs / 71 assertions / 0 failures / 0 errors。
- Frontend: 5 test files / 32 tests passed、ESLint 0 errors / 93 warnings。
- OpenAPI: 18 operations / 18 unique operation IDs、unresolved reference 0。
- Brakeman: 0 warnings。Production Docker imageとCompose smoke: PASS。
- Frontend `npm run quality`: PASS。

### Decisions

- RailsでSupabase JWTとOrganization membershipを必ず独立再検証する。
- R-1 surfaceをidentity・Organization境界のread-only APIに限定した。
- R-1完了後、Rails開発を意図的に凍結した。

### Deferred / Remaining

- Project、AnalysisJob、Queue、Workerは未着手。
- Membership/Role管理write API、edge rate limit、production network policy、observability。
- Rails R-2以降の業務API。

### References

- [Rails R-1 Implementation](./audit/18-rails-r1-implementation.md)
- [Rails Foundation](./rails/01-foundation.md)
- [Rails Authentication](./rails/02-authentication.md)
- [Rails Organization Authorization](./rails/03-organization-authorization.md)

## Phase B-1 — Component Reachability Cleanup

**Status:** Completed  
**Category:** Frontend / Architecture / Refactoring  
**Objective:** 旧監査で到達不能とされた25件を現行route graphから再判定し、安全に断定できる不要componentだけを削除する。

### Changes

- 25件をKEEP 6、DELETE 6、MERGE 11、DEFER 2へ分類した。
- Phase A-1後に7件が到達可能となり、変更前時点の到達不能は18件であることを確認した。
- Signup透過wrapper 2件と、0 byte・参照0のplaceholder 4件を削除した。
- Production、dev-only、legacyのActive Graphを作成した。

### Result

- 削除: `Contact.svelte`、`Login.svelte`、`SignUp.svelte`、`SignUpModal.svelte`、Signup wrapper 2件の計6件。
- 5 test files / 32 tests passed。
- ESLint: 0 errors / 93 warnings。
- Production build、7 route smoke、`npm run quality`: PASS。

### Decisions

- 現行routeからの静的import graphを到達性の根拠とした。
- Snapshot legacy 11件は機械的置換で見た目・propsが変わるためB-2まで保持した。
- Strategy rail 2件は意味が異なり、product判断なしに削除しないこととした。

### Deferred / Remaining

- Snapshot legacy 11件の画面・field比較。
- Strategy plan選択とproject選択の責任判断。

### References

- [Component Reachability Final](./audit/19-component-reachability-final.md)
- [Component Disposition](./audit/component-disposition.csv)
- [Frontend Active Graph](./architecture/frontend-active-graph.md)
- [Component Cleanup Backlog](./audit/20-component-cleanup-backlog.md)

## Phase B-2 — Snapshot Component Canonicalization

**Status:** Completed  
**Category:** Frontend / Architecture / Refactoring  
**Objective:** Competitor 2、Industry 6、Self 3の旧Snapshot component 11件を現行表示と比較し、必要な情報だけを正本へ移植して旧群を廃止する。

### Changes

- 11件をALREADY_COVERED 9、PORT 2と判定した。
- Competitor正本へURL、insight、action、detail stateを移植した。
- Self正本からStrategy依存を除き、Self分析とStrategy提案の責任境界を明示した。
- 旧Snapshot component 11件をすべて削除した。
- Field mappingとcomponent mapを作成し、回帰unit testを追加した。

### Result

- 6 test files / 37 tests passed。
- ESLint: 0 errors / 69 warnings（93から24件削減）。
- Production buildと`npm run quality`: PASS。
- Rails/OpenAPI変更なし。

### Decisions

- 現行componentを正本とし、旧版固有で意味のある情報だけを移植した。
- 旧SelfのStrategy表示を移植せず、Strategy正本側の責務とした。
- API契約をUI整理に合わせて変更しなかった。

### Deferred / Remaining

- StrategyAnalysisPlanRail / Cardのproduct意味と統合判断。

### References

- [Snapshot Component Comparison](./audit/21-snapshot-component-comparison.md)
- [Snapshot Field Mapping](./audit/snapshot-field-mapping.csv)
- [Snapshot Component Map](./architecture/snapshot-component-map.md)
- [Phase B-2 Implementation](./audit/22-phase-b2-implementation.md)

## Phase B-3A — SignUpForm Refactoring

**Status:** Completed  
**Category:** Frontend / Refactoring / Security  
**Objective:** 1,131行のSignUpFormを、UIと既存業務順序を維持したまま、状態・validation・Auth・waitlist・Turnstile等の責務へ分離する。

### Changes

- `SignUpForm.svelte`を1,131行から143行へ縮小した。
- UI component、rune state、state machine、validation、Supabase Auth service、waitlist serviceを分離した。
- Turnstile controller、cooldown controller、error mapper、redirect、DOM focusを分離した。
- Pure/controller unit testを21件追加した。

### Result

- 7 test files / 58 tests passed。
- Svelte check: 0 errors / 0 warnings。
- ESLint: 0 errors / 67 warnings。
- Production build、Auth smoke、secret scan、7 route smoke、`npm run quality`: PASS。

### Decisions

- Supabase Auth成功後にwaitlistへ進む既存順序を維持した。
- Waitlist失敗をAuth失敗へ巻き戻さずpartial successとして扱った。
- 存在しないAPIやcomponent-test依存をこのPhaseで追加しなかった。

### Deferred / Remaining

- `POST /api/waitlist/join`のBFF、Turnstile secret検証、永続化。
- Svelte component test基盤。

### References

- [SignUpForm Responsibility Analysis](./audit/23-signup-form-responsibility-analysis.md)
- [Signup Feature Map](./architecture/signup-feature-map.md)
- [Phase B-3A Signup Refactor](./audit/24-phase-b3a-signup-refactor.md)

## Phase B-3B — SurveyModal Refactoring

**Status:** Completed  
**Category:** Frontend / Refactoring  
**Objective:** 455行のSurveyModalを、公開契約、質問内容、順序、見た目を維持しながらschema、state、validation、modal lifecycle、presentationへ分離する。

### Changes

- `SurveyModal.svelte`を455行から29行の互換facadeへ縮小した。
- SurveyModalFrame、SurveyForm、SurveyQuestionList、SurveyNavigation、SurveyFeedbackを分離した。
- Question schema、answer model、controller、validation、callback service、focus処理を分離した。
- Pure/controller unit testを15件追加した。

### Result

- 8 test files / 73 tests passed。
- ESLint: 0 errors / 60 warnings。
- OpenAPI 18 operations、production build、auth/route smoke、secret scan、`npm run quality`: PASS。

### Decisions

- SurveyをProduct Feedbackとして扱い、`onSubmit` callback契約を正本とした。
- API・永続化は存在しない現状を明記し、架空実装を追加しなかった。
- 共通component-test基盤は独立Phaseへ送った。

### Deferred / Remaining

- Survey回答の保存先・通知先。
- Svelte component test基盤。

### References

- [SurveyModal Responsibility Analysis](./audit/25-survey-modal-responsibility-analysis.md)
- [Survey Feature Map](./architecture/survey-feature-map.md)
- [Phase B-3B Survey Refactor](./audit/26-phase-b3b-survey-refactor.md)

## Phase B-3C — LoginModal Cleanup

**Status:** Completed  
**Category:** Frontend / Refactoring / Security  
**Objective:** 449行のLoginModalの到達性とAuth契約を再確認し、正本が別に存在する旧重複実装を安全に廃止する。

### Changes

- LoginModalを`LEGACY_DUPLICATE`と判定し、production/dev/test/barrel参照0を確認して削除した。
- `/login`から利用される`SignUpForm mode="login"`をLogin UIの正本とした。
- Login controllerを追加し、submit状態、重複送信防止、安全なredirect、破棄後更新抑止を分離した。
- 既存`loginWithPassword`を唯一のpassword login serviceとして維持した。

### Result

- LoginModal: 449行から削除。
- 8 test files / 86 tests passed。
- ESLint: 0 errors / 60 warnings。
- Production build、auth/route smoke、secret scan、`npm run quality`: PASS。

### Decisions

- 到達不能なcallback-only Modalを正本へ統合せず削除した。
- 挙動のないremember checkboxは移植しなかった。
- Password resetとOTPを実装済みのように見せる変更は行わなかった。

### Deferred / Remaining

- Password reset route・callback・UI。
- OTP login。
- Svelte component test基盤。

### References

- [LoginModal Reachability and Responsibility](./audit/27-login-modal-reachability-and-responsibility.md)
- [Login Feature Map](./architecture/login-feature-map.md)
- [Phase B-3C Login Refactor](./audit/28-phase-b3c-login-refactor.md)

## Phase B-3D — ContactModal Refactoring

**Status:** Completed  
**Category:** Frontend / Refactoring  
**Objective:** 現行ContactModalの到達性、問い合わせ契約、実送信の有無を監査し、公開UIを維持した責務分割を行う。

### Changes

- `ContactModal.svelte`を431行から21行の互換facadeへ縮小した。
- `src/lib/features/contact/`をContact featureの正本とした。
- ContactForm、ContactFields、ContactFeedback、ContactModalFrameを分離した。
- Controller、validation、callback service、modal focus utilityを分離した。

### Result

- 9 test files / 95 tests passed。
- ESLint: 0 errors / 60 warnings。
- OpenAPI、production build、auth/route smoke、secret scan、`npm run quality`: PASS。
- ファイル削除なし。Rails/OpenAPI/Auth変更なし。

### Decisions

- ContactModalを`ACTIVE_CANONICAL`な一般問い合わせUIとして維持した。
- Payload `{ name, email, company, message }`を維持した。
- Production Headerはcallback未指定であり、現状はvalidation後にsuccess表示するだけだと明記した。
- 実在しない送信APIを追加しなかった。

### Deferred / Remaining

- 問い合わせの実送信・保存・通知先。これはproduction利用前に解消が必要である。
- 共通Modal/component test基盤。

### References

- [ContactModal Reachability and Responsibility](./audit/29-contact-modal-reachability-and-responsibility.md)
- [Contact Feature Map](./architecture/contact-feature-map.md)
- [Phase B-3D Contact Refactor](./audit/30-phase-b3d-contact-refactor.md)

## Phase B-3E — Landing Hero Secondary Responsibility Split

**Status:** Completed  
**Category:** Frontend / Refactoring / Architecture / Quality  
**Objective:** 408行のLandingHeroSecondarySectionがCSS肥大か責務混在かを監査し、到達性、Primaryとの重複、responsive状態を確認したうえで必要最小限の分割を行う。

### Changes

- 到達性を`ACTIVE_DUPLICATE`、分割判断を`SPLIT_NOW`とした。
- 変更前408行を、composition 30行、SVG visual 229行、animation/geometry helper 159行へ分離した。
- Pure geometry test 4件を追加した。
- GSAP ticker、timeline、gradient tweenのcleanupを明示した。
- Secondary SVG IDをinstanceごとに一意化し、accessible nameとreduced-motion対応を追加した。

### Result

- Styleは49行（12.0%）であり、肥大の主因はscript 187行とinline SVG 163行だった。
- 10 test files / 99 tests passed。
- ESLint: 0 errors / 60 warnings。変更ファイルのwarningは0。
- OpenAPI、production build、auth/route smoke、secret scan、`npm run quality`: PASS。
- Desktop 1440、Tablet 768、Mobile 390で変更前後の座標・寸法・見た目が一致した。

### Decisions

- Secondary Section、Visual、animation/geometryを自然な責任境界として分離した。
- PrimaryとSecondaryはcopy、orientation、previewの意味が異なるため、Section全体はmergeしなかった。
- CSS値、copy、breakpoint、Tailwind、Design Token、responsive designは変更しなかった。

### Deferred / Remaining

- `/lp`と`/plan`でroot layoutとroute layoutがHeroを二重mountする問題。
- Primaryの固定SVG IDとSecondary wave helperへの移行。
- Tablet preview位置、Mobileの63px横overflow。
- QA時に変更前後とも観測された`MutationObserver.observe` errorの発生元特定。
- 独立した大型componentとしては`StrategyAnalysisRoadmapPhaseCard.svelte`が次の監査候補。

### References

- [Landing Secondary Responsibility Analysis](./audit/31-landing-secondary-responsibility-analysis.md)
- [Landing Hero Component Map](./architecture/landing-hero-component-map.md)
- [Phase B-3E Implementation](./audit/32-phase-b3e-landing-secondary.md)

## Phase B-3F — Landing Hero Layout Ownership

**Status:** Completed  
**Category:** Frontend / Architecture / Refactoring / Quality  
**Objective:** Rootと子layoutに重複していたLanding Heroの所有者を一つにし、`/`、`/lp`、`/plan`で意図した回数だけ描画するroute構造へ修正する。

### Changes

- Root layoutからHeader、Primary、Secondaryとpathname条件を除去し、favicon、global CSS、childrenだけにした。
- `/`、`/lp`、`/plan`の各PageへHeader、Primary、Secondaryを移した。
- 責務が空になった`/lp/+layout.svelte`と`/plan/+layout.svelte`を削除した。
- Layout非所有と各PageのHero各1回renderを検証する静的testを4件追加した。

### Result

- `/`: Primary 1 / Secondary 1を維持。
- `/lp`: Primary 2→1 / Secondary 2→1。
- `/plan`: Primary 2→1 / Secondary 2→1。
- Browserで3 route × 1440・768・390pxを確認し、Header→Primary→Secondary、overlap 0、animation継続を確認した。
- 11 test files / 103 tests、ESLint 0 errors / 60 warnings、production build、7 route smoke、`npm run quality` PASS。

### Decisions

- Landing HeroをLayout共通ShellではなくPage固有contentとして正本化した。
- 重複をpathname条件で隠さず、Layoutから所有責務そのものを除去した。
- Hero design、copy、SVG、GSAP、responsive、Rails、OpenAPIは変更しなかった。

### Deferred / Remaining

- Primaryの固定SVG IDとshared wave helper移行。
- Landing HeroのTablet/Mobile responsive設計。
- 既知の`MutationObserver.observe` console error調査。
- 同一内容の`/`、`/lp`、`/plan`を将来統合・redirectするかのproduct判断。

### References

- [Landing Hero Layout Ownership Audit](./audit/33-landing-hero-layout-ownership.md)
- [Landing Route Ownership](./architecture/landing-route-ownership.md)

## Phase B-3G — Primary / Secondary Hero Wave Shared Core

**Status:** Completed  
**Category:** Frontend / Architecture / Refactoring / Quality  
**Objective:** Primaryの固定SVG IDを解消し、Primary / Secondaryで重複していたwave geometryとGSAP lifecycleを、Visual差分を維持したまま一つのanimation coreへ統合する。

### Changes

- Primary内のwave計算と3つの`onMount`を既存shared helperへ移行した。
- Primaryを31行のSection compositionと210行のPrimary Visualへ分離した。
- Primary / Secondary config、SVG ID factory、idempotent cleanupをshared helperへ追加した。
- Primaryの固定6 IDを`$props.id()`由来のinstance固有8 IDへ変更した。
- Wave testを4件から9件へ拡張した。

### Result

- 共通化判断: `SHARE_ANIMATION_CORE`。
- 複数Primaryのduplicate ID: 6→0。
- 3 route × 3 viewportで各Hero 1回、wave / gradient animation、変更前後の同一geometryを確認した。
- Reduced motionでPrimary / Secondary双方が停止する。
- 11 test files / 108 tests、ESLint 0 errors / 60 warnings、production build、7 route smoke、`npm run quality` PASS。

### Decisions

- Geometry、config、ID、GSAP lifecycleだけを共通化し、SVG Visualは統合しなかった。
- Copy、左右配置、preview、gradient方向・色、section layoutを各Hero固有責務として維持した。
- Responsive、route ownership、Rails、OpenAPIは変更しなかった。

### Deferred / Remaining

- Landing HeroのTablet/Mobile responsive設計とMobile overflow。
- 既知の`MutationObserver.observe` errorの独立調査。
- Component test / Browser E2E / visual regression基盤。

### References

- [Landing Wave Shared Analysis](./audit/34-landing-wave-shared-analysis.md)
- [Landing Wave Architecture](./architecture/landing-wave-architecture.md)
- [Phase B-3G Implementation](./audit/35-phase-b3g-landing-wave-refactor.md)

## Phase B-3H — MutationObserver Runtime Investigation

**Status:** Completed  
**Category:** Frontend / Runtime Investigation / Quality  
**Objective:** 既知の`MutationObserver.observe` runtime errorを再現・切り分けし、Panoptes production code由来の場合だけ最小修正する。

### Changes

- 6 route × 3 viewportをdevで、6 routeをproduction previewで確認した。
- Panoptes 18 iframeと空HTML 18 iframeの一時fixture、page-world instrumentation、clean Chrome比較で発生環境を分離した。
- RepositoryとSvelte、Vite、GSAP、Supabase、modal/focus/Turnstile周辺の間接利用を監査した。
- 調査用fixtureとinstrumentationは削除し、audit文書だけを追加した。

### Result

- ErrorはCodex In-app Browserのiframe automation injectionでのみ再現し、最終分類は`BROWSER_ENVIRONMENT`。
- 通常top-level routeはdev・production previewとも0件。空HTML 18 iframeはIn-app Browser 18件、extensions disabled Chrome 0件。
- Panoptes sourceのMutationObserver直接利用は0件。production code、test、dependencyは変更なし。
- 11 test files / 108 tests、ESLint 0 errors / 60 warnings、production build、`npm run quality` PASS。

### Decisions

- Panoptes側のnull guardやlifecycle修正は外部isolated worldへ作用しないため追加しなかった。
- `DEV_ONLY`ではなく`BROWSER_ENVIRONMENT`とし、Panoptes production defect backlogから除外した。
- Responsive、Hero、Rails、OpenAPI、Auth、Shell、Strategyには変更を加えなかった。

### Deferred / Remaining

- Browser plugin/runtime側でiframe injected-document observerのstack/targetを取得し修正するupstream調査。
- Browser tooling更新後のblank iframe条件での再確認。

### References

- [MutationObserver Runtime Investigation](./audit/36-mutation-observer-runtime-investigation.md)
- [Phase B-3H Fix Decision](./audit/37-phase-b3h-mutation-observer-fix.md)

## Phase B-3I — Panoptes Shell Responsibility and Data Flow Refactor

**Status:** Completed  
**Category:** Frontend / Architecture / Refactoring / Quality  
**Objective:** Productionの`/app`と`/app/analysis`が共用する`PanoptesShellPage`の到達性、state、bootstrap、polling、action、render責務を監査し、正本を維持したまま変更理由ごとに分離する。

### Changes

- `PanoptesShellPage`を`ACTIVE_CANONICAL`、分割判断を`SPLIT_BOTH`とし、Pageを336行から178行へ縮小した。
- Bootstrap、network、polling、project/analysis/strategy commandをpure controllerとproduction adapterへ分離した。
- Snapshot表示分岐をMain Surface、header/selection計算をpure mappingへ分離した。
- Polling timerをcontroller化し、request overlap防止、30秒timeout、late result無視、destroy cleanupを追加した。
- Bootstrap、mapping、action dispatch、polling lifecycleのunit testを20件追加した。

### Result

- `/app`と`/app/analysis`は同じcanonical Shellを継続利用し、Snapshot、tab、project selection、reanalysis、confirmation、empty stateをbrowserで確認した。
- Stable Snapshot保持、analysis overlay、既存UIとcommand契約を維持した。意図的なvisual変更はない。
- 13 test files / 128 tests、ESLint 0 errors / 60 warnings、unresolved import 0、cycle 0、production build、`npm run quality` PASS。
- Rails、OpenAPI、Supabase Auth、Organization guard、canonical AnalysisJob stateは変更していない。

### Decisions

- Server stateは既存store、UI transientはPage、session/strategy UI stateは既存storeを正本として維持する。
- Pageはcompositionとlocal UI state、controllerはorchestration、polling controllerはtimer/request lifecycle、mappingはview model計算を所有する。
- Canonical job stateとfrontend mock/runtime statusの不一致は、このUI refactorで推測補完せず明示的な後続契約作業とした。
- Business APIはsame-origin client/action経由を維持し、canonical BFF endpointへの移行は行わなかった。

### Deferred / Remaining

- Canonical AnalysisJob stateとfrontend runtime statusの完全mapping。
- Canonical business BFF endpointとOrganization scopeへの接続。
- `AbortSignal`による実request cancellation、bootstrap専用error/retry UI。
- Component/browser E2E/visual regressionの自動化とresponsive/design変更。

### References

- [Panoptes Shell Responsibility Analysis](./audit/38-panoptes-shell-responsibility-analysis.md)
- [Panoptes Shell Flow](./architecture/panoptes-shell-flow.md)
- [Phase B-3I Panoptes Shell Refactor](./audit/39-phase-b3i-panoptes-shell-refactor.md)

## Phase B-3J — Canonical AnalysisJob Frontend Adapter

**Status:** Completed  
**Category:** Frontend / Architecture / API Boundary / Quality  
**Objective:** Canonical AnalysisJob responseとPanoptes UI runtimeを直接結合せず、state、phase、progress、terminal、confirmation、partial、timeout、unknownを変換する専用adapter境界を確立する。

### Changes

- Canonical 14 stateとFrontend runtime model、pure adapter、共通terminal helperを`features/analysis-job`へ追加した。
- 中間phaseを`running + canonical phase`に分離し、`timed_out`と`partially_completed`をterminalとして正式にmappingした。
- Public frontend job statusから`commit_failed`を除き、Mock stored jobのみに限定して公開時`failed + snapshot_commit_failed`へ変換した。
- Current polling resultをboundary adapterに通し、raw statusをpolling controller/store/UIが解釈しない方向へ統一した。
- Canonical mapping、unknown/malformed、Mock隔離、terminal/polling integrationの43 testsを追加した。

### Result

- Canonicalの中間8 phaseはUI `running`を維持しながらcanonical phaseをruntime modelに保持する。
- `timed_out`はexisting failed/retry presentation、`partially_completed`はcompleted-compatible presentation + warningの最小対応とした。
- 14 test files / 171 tests、ESLint 0 errors / 58 warnings、unresolved import 0、cycle 0、production build、`npm run quality` PASS。
- Browser接続が利用できなかったため実Browser操作は未実施。Pure integration testとroute smokeで代替した。

### Decisions

- Canonical API modelとexisting Panoptes store/UI modelは同一typeにしない。
- Unknown/missing/malformed stateはcompleted扱いにせず、safe terminal failure + diagnostic codeにmappingする。
- `commit_failed`は`MOCK_ONLY + MAP_TO_FAILED`とし、canonical stateに追加しない。
- AdapterはOrganization IDをresponseからmappingするだけで、global stateからscopeを推測しない。

### Deferred / Remaining

- Canonical `/api/panoptes/v1` business BFFとOrganization-scoped command boundaryの実接続。
- `partially_completed`のSnapshot昇格、usable section、warning detail、retry/reanalysis product policy。
- Canonical phaseからPanoptes visible stepへの実mappingとadapter diagnostic observability。
- Browser E2E fixtureによるtimeout/partial/failureのvisual/console確認。

### References

- [AnalysisJob Runtime Mapping](./audit/40-analysis-job-runtime-mapping.md)
- [AnalysisJob Frontend Boundary](./architecture/analysis-job-frontend-boundary.md)
- [Phase B-3J AnalysisJob Adapter](./audit/41-phase-b3j-analysis-job-adapter.md)

## Phase B-3K — Organization-scoped Canonical BFF Client / Command Boundary

**Status:** Completed  
**Category:** Frontend / Architecture / API Boundary / Security / Quality  
**Objective:** Connect the implemented canonical SvelteKit BFF reads through an explicit Organization-scoped feature command while preserving Rails as the authorization authority and preventing legacy-path or mock fallback in production.

### Changes

- Added a typed `/api/panoptes/v1` client for the five implemented identity reads and an explicit Organization boundary command.
- Propagated the verified active Organization ID from route server data into Shell bootstrap without global/response inference.
- Added BFF active-membership/equality checks, client error mapping, timeout, caller abort, response scope validation, and same-interface development mock separation.
- Replaced production calls to nine unresolved legacy business paths with an explicit retryable 503 until Rails implements the canonical business routes.
- Added Organization/client/BFF/Shell lifecycle tests and the B-3K audit/architecture records.

### Result

- Shell organization bootstrap now follows UI -> feature command -> scoped client -> SvelteKit BFF -> Rails, with cross-org hidden as 404 and missing active membership rejected as 403.
- 15 test files / 196 tests pass; ESLint reports 0 errors / 57 warnings; OpenAPI remains 18 operations / 18 operationIds; unresolved imports 0; cycles 0; production build and `npm run quality` pass.
- No controllable browser was available in the session. Pure integration coverage and route smoke passed as the specified substitute.
- No Rails, OpenAPI, layout, typography, responsive, animation, Tailwind, token, Landing, or Strategy visual changes were made.

### Decisions

- Only the five Rails R-1 reads are connectable now; Shell consumes the two scoped Organization reads.
- Browser organization IDs are requests, not authority. SvelteKit verifies the active context and Rails independently revalidates authorization.
- Canonical and mock adapters share an interface, but mock selection is development-only and never a runtime fallback.
- Request timeout remains an HTTP/client error; canonical AnalysisJob `timed_out` remains a terminal domain state.
- `partially_completed` stays terminal, warning-capable, snapshot/reanalysis-compatible, and ineligible for automatic Strategy-source promotion.

### Deferred / Remaining

- Rails implementation and BFF connection of project, AnalysisJob, snapshot, usage, retry/cancel, reanalysis, confirmation, Strategy, and roadmap operations.
- AbortSignal propagation through project switch and actual canonical polling after those endpoints exist.
- Authenticated browser E2E fixtures for canonical success, 503, cross-org, partial, timeout, and stale responses.

### References

- [Organization-scoped BFF Client Analysis](./audit/42-organization-scoped-bff-client-analysis.md)
- [Organization-scoped Command Flow](./architecture/organization-scoped-command-flow.md)
- [Phase B-3K BFF Client Connection](./audit/43-phase-b3k-bff-client-connection.md)

## Phase B-3L — Strategy Roadmap Phase Card Responsibility Refactor

**Status:** Completed  
**Category:** Frontend / Component Audit / Refactoring / Quality  
**Objective:** `StrategyAnalysisRoadmapPhaseCard`の到達性、props、state、interaction、mapping、render、CSS、responsive、accessibilityを監査し、Product Contractとvisualを維持したまま責務境界を明確にする。

### Changes

- productionの`/app`・`/app/analysis`へ到達する`ACTIVE_CANONICAL`と判定した。
- 400行のPhase Cardを、169行のCard composition、Task List、Status Actions、pure presentation mappingへ`SPLIT_VIEW_AND_MAPPING`した。
- status label/tone/action order/checklist transitionをpure mappingへ移し、Strategy view modelも同じtask label mappingを利用するようにした。
- keyed collectionと選択状態の`aria-pressed`を追加し、公開propsとcallback順序を維持した。
- 監査・実装記録に加え、frontend棚卸し親成果物を新規作成した。

### Result

- 16 test files / 204 tests、ESLint 0 errors / 54 warnings、OpenAPI 18 / 18、unresolved imports 0、cycles 0、production build、`npm run quality` PASS。
- 操作可能なBrowserが存在せず実Browser確認は未実施。pure tests、auth/route smoke、buildで代替し、visual確認済みとは記録していない。
- Rails、BFF、OpenAPI、AnalysisJob state、Organization boundary、Supabase Auth、Product Contract、意図的なvisualは変更していない。

### Decisions

- Phase Cardは正本として維持し、shell/header/summary/compositionを所有する。
- Task ListとStatus Actionsは独立したview責務、status presentationはpure mapping責務とした。
- 30/60/90は既存domain/view-model契約として維持し、意味変更やapproval flowはProduct Decision Requiredとした。
- `StrategyAnalysisPlanRail`と`StrategyAnalysisPlanRailCard`はDEFERのまま変更しない。

### Deferred / Remaining

- Strategy Roadmapのauthenticated browser/visual regression fixture。
- 30/60/90 Product Contractとapproval workflowの決定。
- Strategy props drilling、Design Token、Tailwind、responsive standardization。
- 次の推奨監査対象は`CompetitorAnalysisExpandedCard.svelte`。

### References

- [Strategy Roadmap Phase Card Analysis](./audit/44-strategy-roadmap-phase-card-analysis.md)
- [Phase B-3L Refactor](./audit/45-phase-b3l-strategy-roadmap-phase-card-refactor.md)
- [Frontend Inventory Summary](./inventory/frontend-inventory-summary.md)

## Phase B-3M — Competitor Expanded Card Responsibility Refactor

**Status:** Completed  
**Category:** Frontend / Component Audit / Refactoring / Quality  
**Objective:** B-2で正本化された`CompetitorAnalysisExpandedCard`の到達性、props、state、interaction、mapping、render、CSS、responsive、accessibilityを監査し、URL・insight・action・detail/compare・fallback契約とvisualを維持したまま責務境界を明確にする。

### Changes

- `/app`・`/app/analysis`のCompetitor Snapshotから到達する`ACTIVE_CANONICAL`と判定した。
- 373行のCardを、148行のCard composition、Metrics view、Evidence view、pure Competitor presentation mappingへ`SPLIT_VIEW_AND_MAPPING`した。
- 既存の6軸順序・score formulaをpure mappingへ移し、外部URLをHTTP(S)・credentialsなしへ正規化した。
- 公開props、親所有のdetail/compare state、copy、section順序、CSS値、B-2のURL/insight/action/fallback契約を維持した。
- mapping、malformed/empty/long input、B-2回帰、detail/compare action contractの10 testsを追加した。

### Result

- 17 test files / 214 tests、ESLint 0 errors / 50 warnings、OpenAPI 18 / 18、unresolved imports 0、cycles 0、production build、`npm run quality` PASS。
- 操作可能なBrowserが0件で実Browser確認は未実施。pure mapping/action-contract tests、route smoke、Svelte check、buildで代替し、Desktop/Tablet/Mobileのvisual確認済みとは記録していない。
- Rails、BFF、OpenAPI、AnalysisJob、Organization boundary、Supabase Auth、Strategy Plan Rail/Card、Product Contract、意図的なvisualは変更していない。

### Decisions

- Expanded Cardは正本と公開composition境界として維持する。
- score/radar/metaはMetrics view、summary/observed insight/recommended actionはEvidence view、axis/ring/URLはpure mappingが所有する。
- expanded/compared stateは引き続き`CompetitorAnalysisTab`が所有し、Cardはcallback intentだけを通知する。
- 現行6軸の短縮名・順序・式はB-2 visual contractとして維持し、application-wide Product contract化は`DEFER / Product Decision Required`とした。

### Deferred / Remaining

- authenticated Browser E2E / visual regressionとSvelte component rendering test基盤。
- common six axesの正式名称・順序、Competitor score formula、score/tone tokenのProduct/Design判断。
- Competitor CSS、responsive、directory taxonomyのFrontend standardization。
- 次の推奨監査対象は`SelfAnalysisOverviewPanel.svelte`。

### References

- [Competitor Expanded Card Analysis](./audit/46-competitor-expanded-card-analysis.md)
- [Phase B-3M Refactor](./audit/47-phase-b3m-competitor-expanded-card-refactor.md)
- [Frontend Inventory Summary](./inventory/frontend-inventory-summary.md)

## Phase B-3N — Self Analysis Overview Responsibility Refactor

**Status:** Completed  
**Category:** Frontend / Component Audit / Refactoring / Quality  
**Objective:** B-2で正本化された`SelfAnalysisOverviewPanel`の到達性、props、state、mapping、render、CSS、responsive、accessibilityを監査し、Self=current state/gap/improvement candidates、Strategy=formal proposalの境界と`self.actionCards`正本を維持したまま責務を整理する。

### Changes

- `/app`・`/app/analysis`のSelf Snapshotから到達する`ACTIVE_CANONICAL`と判定した。
- 307行のOverviewを、26行のPanel composition、Summary view、Evidence view、Self固有presentation mappingへ`SPLIT_VIEW_AND_MAPPING`した。
- Self軸定義、signed delta、candidate priorityをpure mappingへ移し、non-finite scoreをdisplay-safeにした。
- `strategyRecommendationCards`を`improvementCandidateCards`へ改め、`self.actionCards`だけをsourceとするB-2境界を型・test上でも明示した。
- Overview/Comparison/Improvement Candidateのcollectionをkeyed化し、score labelとradar SVG titleを追加した。

### Result

- 18 test files / 226 tests、ESLint 0 errors / 38 warnings、OpenAPI 18 / 18、unresolved imports 0、cycles introduced 0、production build、`npm run quality` PASS。
- 操作可能なBrowserが0件で実Browser確認は未実施。pure mapping/B-2 regression tests、auth/route smoke、Svelte check、buildで代替し、Desktop/Tablet/Mobileのvisual確認済みとは記録していない。
- Rails、BFF、OpenAPI、AnalysisJob、Organization boundary、Supabase Auth、Strategy Plan Rail/Card、Product formula、意図的なvisualは変更していない。

### Decisions

- Overview Panelは正本とcomposition境界を維持する。Summaryはidentity/score/gap、Evidenceはstrengths/issues/breakdown/AI current-stateを所有する。
- Improvement CandidateはOverviewの子ではなくSelf Tabのsibling surfaceのまま維持し、`self.actionCards`のsource順をpriority順として扱う。
- SelfとCompetitorの6軸は概念順が一致する一方、差別化・意思決定の表示名が異なる。共通Component化・名称統一は`DEFER / Product Decision Required`とした。
- legacy `SelfAnalysisStrategyRecommendation*` filenamesとdummy fixtureのStrategy-named seed couplingは、production依存ではないため今回のdirectory/fixture変更対象外とした。

### Deferred / Remaining

- authenticated Browser E2E / visual regressionと、flex containerへgrid ruleを適用しているresponsive debtの修正。
- common axes、score/gap、improvement priority/evidenceのProduct Contract。
- legacy Self component naming、fixture ownership、Design Token、Tailwind、directory taxonomy。
- 次の推奨監査対象は`CompetitorAnalysisCompanyCard.svelte`。

### References

- [Self Analysis Overview Panel Analysis](./audit/48-self-analysis-overview-panel-analysis.md)
- [Phase B-3N Refactor](./audit/49-phase-b3n-self-analysis-overview-refactor.md)
- [Frontend Inventory Summary](./inventory/frontend-inventory-summary.md)

## Phase B-3O — Competitor Company Card Responsibility and Duplication Audit

**Status:** Completed  
**Category:** Frontend / Component Audit / Duplicate Inventory / Refactoring / Quality  
**Objective:** production正本の`CompetitorAnalysisCompanyCard`を監査し、B-3M Expanded Cardとのscore ring、bar、identity、compare、metric類似が共有可能な表示責務か、Product差異を持つ別実装かを判定する。

### Changes

- `/app`・`/app/analysis`のCompetitor gridから到達する`ACTIVE_CANONICAL`と判定した。
- Componentはview分割せず`SPLIT_MAPPING`とし、inline ring/percentage/compare labelを既存`competitor-card-presentation.ts`へ移した。
- Company +24°とExpanded +30°のring式を別名helperとして維持し、shared private gradient/clampだけを再利用した。
- score-bar percentageとcompare labelを共有し、Company identity heading、score accessible name、detail/compare `aria-pressed`を追加した。
- Frontend棚卸し親成果物へ最初の正式な`Duplicate / Shared Candidate Inventory`を追加した。

### Result

- 19 test files / 238 tests、ESLint 0 errors / 38 warnings、OpenAPI 18 / 18、unresolved imports 0、cycles introduced 0、production build、`npm run quality` PASS。
- 操作可能なBrowserが0件で実Browser確認は未実施。formula/mapping regression、auth/route smoke、Svelte check、buildで代替し、Desktop/Tablet/Mobileのvisual確認済みとは記録していない。
- Rails、BFF、OpenAPI、AnalysisJob、Organization boundary、Supabase Auth、Product formula convergence、common axes、Strategy semantics、意図的なvisualは変更していない。

### Decisions

- Company Cardはidentity/score/metrics/controlsからなるcohesive summary viewとして維持する。
- Company/Expandedは同じ`overallScore`を使うが、ringのviolet accentは24°/30°で異なるため`SAME_VISUAL_DIFFERENT_FORMULA`とした。
- clamp、gradient construction、score percentage、compare labelのみ`SHARE_PRESENTATION_HELPER`。full view、axes、URL、interactionは`KEEP_SEPARATE`とした。
- formula差異はcurrent/legacy behaviorとしてtest固定するだけで、最終的な正しさは`DEFER / Product Decision Required`とした。

### Deferred / Remaining

- 24°/30° ring式のProduct decision。
- parentがcompared cardをgridから除外するため到達不能なCompany `compared=true` contractの整理。
- browser visual/E2E、fixed width/overridden height、responsive、score/surface token。
- 次は大規模Component巡回ではなく、Active Graph / Component Inventoryを現行コードへ再同期する。

### References

- [Competitor Company Card Analysis](./audit/50-competitor-company-card-analysis.md)
- [Phase B-3O Refactor](./audit/51-phase-b3o-competitor-company-card-refactor.md)
- [Frontend Inventory Summary](./inventory/frontend-inventory-summary.md)

## Phase B-3P — Active Graph / Component Inventory Resync

**Status:** Completed  
**Category:** Frontend audit / dependency inventory  
**Objective:** B-3A–B-3Oで変化したcomponent treeを現行sourceから再計算し、production/dev/test reachability、parent/child dependencies、wrapper、duplicate/shared candidate、deferred graphを最新状態へ同期する。

### Changes

- `$lib`、relative、barrel、dynamic literal importとroute layout継承を解析するinventory scriptを追加した。
- 126 reusable Svelte componentsをmachine-readable CSVへ再生成し、旧`component-inventory.csv`も同一sourceから同期した。
- Production Active Graph、親Frontend Inventory、historical audit参照を更新した。
- CSV stale、unresolved local import、cycleを`npm run quality`内で検出するgateと4 regression testsを追加した。

### Result

- `src/lib/components` 110、`src/lib/features` 16、route Svelte 14、total Svelte 140。
- Production reachable 121（canonical 118 / wrapper 3）、dev-only 3、test-only 0、Product-decision DEFER 2、unclassified unreachable/unknown 0。
- Unresolved local import 0、cycle 0。High-confidence safe deletion candidateは0。
- Marketing 3 pageとApp 2 pageのexact duplication、Landing Heroからfull dummy Shellへ広がるproduction dependencyを次Page ownership課題として特定した。
- 20 test files / 242 tests、ESLint 0 errors / 38 warnings、OpenAPI 18 / 18、production build、`npm run quality` PASS。

### Decisions

- `StrategyAnalysisPlanRail`とCardはProduct判断待ち`DEFER`を維持し、削除しない。
- Pass-through wrapper 3件は`ACTIVE_WRAPPER / KEEP_WRAPPER`とし、caller ownershipを変更するPhaseまで保持する。
- 次のbacklog子課題はPage構造・責務整理。推奨Phase B-3QはMarketing/App Route Alias and Header Ownership Auditとする。
- Component全体移動、large rename/delete、Product logic、design、Tailwind、API変更は行わない。

### Deferred / Remaining

- Marketing/App route alias intent、`PanoptesSiteHeader` ownership、Landing dummy dependency breadth。
- Strategy Plan Rail Product decision、Competitor score/axis contract、browser E2E/responsive baseline。
- Frontend taxonomy/directory policy、Design Token、Tailwind、remaining ESLint warnings。

### References

- [Active Graph resync audit](./audit/52-frontend-active-graph-resync.md)
- [Frontend Active Graph](./architecture/frontend-active-graph.md)
- [Frontend component inventory](./audit/frontend-component-inventory.csv)
- [Frontend inventory summary](./inventory/frontend-inventory-summary.md)

## Phase B-3Q — Marketing / App Route Alias and Header Ownership Audit

**Status:** Completed  
**Category:** Frontend Page structure / ownership  
**Objective:** Marketing/App route alias、Page/Layout/Header ownership、Landing production preview dependency、`/app/login/settings`の実態を監査し、Product URLを推測せず安全なcomposition重複だけを解消する。

### Changes

- `/`、`/lp`、`/plan`が重複していたHeader → Primary Hero → Secondary Hero compositionをPage-owned `MarketingLandingPage`へ集約した。
- Route URL、redirect、metadata、auth/Organization policy、visual、copy、SVG、animationは変更していない。
- `/app`・`/app/analysis`は同じShell entryを保持し、Search UIだけが`/app/analysis`へ遷移する現在のnavigation evidenceを固定した。
- Route ownership、Header責務、production Dummy taxonomy、preview/actual App境界、temporary settings routeをaudit/architecture/parent inventoryへ反映した。
- Current route alias behavior preservation testsと更新済みLanding ownership testsを追加した。

### Result

- Reusable Svelte 127、production reachable 122、wrapper 3、DEFER 2、unclassified unreachable 0、unresolved import/cycle 0。
- Marketing routeは同じcanonical compositionを使用し、各routeでHeader/Primary/Secondary各1回を維持する。
- Header ownershipはMarketing Page compositionとApp layoutの`MIXED_INTENTIONAL / KEEP_CURRENT`。
- Landing dummy graphはactual operational Shellではない`PRODUCTION_PREVIEW`で、target directionを`EXTRACT_PREVIEW_SURFACE`とした。
- `/app/login/settings`はunlinked Svelte starter scaffoldの`TEMPORARY_ROUTE`と判定した。
- 21 test files / 251 tests、ESLint 0 errors / 38 warnings、OpenAPI 18 / 18、production build、`npm run quality` PASS。

### Decisions

- Marketing URL intentと`/app/analysis`のdistinct modeは`UNKNOWN_PRODUCT_INTENT`。redirect/deleteしない。
- B-3FのPage-owned Hero boundaryとroot layoutのglobal-only責務を維持する。
- Header split、preview extraction、settings route lifecycleは別Phase/decisionへdeferする。
- 次backlog子課題はDuplicate code/components。推奨B-3RはCompatibility Wrapper and Route Entry Consolidation Audit。

### Deferred / Remaining

- `/lp`・`/plan`のProduct URL意味、`/app/analysis` deep-link behavior、`/app/login/settings`の実装/削除/rename。
- Marketing preview content contractとvisual regression evidence。
- `PanoptesSiteHeader`のnavigation/modal/auth責務分割。
- Compatibility wrapper 3件、thin route wrappers、pass-through analysis layoutの最終判定。

### References

- [Route ownership analysis](./audit/53-marketing-app-route-ownership-analysis.md)
- [B-3Q implementation](./audit/54-phase-b3q-route-ownership-refactor.md)
- [Frontend route ownership](./architecture/frontend-route-ownership.md)
- [Frontend inventory summary](./inventory/frontend-inventory-summary.md)

## Phase B-3R — Compatibility Wrapper / Route Entry Consolidation Audit

**Status:** Completed  
**Category:** Frontend duplicate code / structure / technical debt  
**Objective:** production compatibility wrapper、thin route entry、App entry duplication、pass-through layoutを再分類し、Product URL・behaviorを変えずに安全なindirectionだけを整理する。

### Changes

- AdminとLandingのcaller 4か所を既存canonical componentへ直接接続し、透明component alias 3件を削除した。
- import、CSS、context、load、auth責務のない`/app/analysis/+layout.svelte`を削除し、親App layoutの継承を維持した。
- Marketing 3件とApp 2件の`+page.svelte`は、通常component wrapperではなくURL契約を持つ`ROUTE_ENTRY_WRAPPER`として保持した。
- wrapper taxonomy、canonical import/layout rule、production preview naming debtをaudit、route ownership、Active Graph、親inventoryへ同期した。
- wrapper consolidation回帰testを追加し、inventory CSVを再生成した。

### Result

- Reusable Svelte 124、production reachable/canonical 119、production wrapper 0、dev-only 3、DEFER 2、unclassified unreachable 0。
- Route Svelte 13、全Svelte 137、unresolved local import 0、cycle 0、inventory stale 0。
- 22 test files / 257 tests、ESLint 0 errors / 38 warnings、OpenAPI 18 / 18、build・smoke・`npm run quality` PASS。
- rendered child、preview preset、route URL、Header、CSS、Auth/Organization behaviorへの意図的変更なし。

### Decisions

- internal callerはcanonical componentを直接importし、compatibility wrapperにはconsumerと廃止条件を必須とする。
- Route Entry Wrapper、Feature Entry Wrapper、Component Compatibility Wrapperを別分類にする。
- `/`・`/lp`・`/plan`と`/app`・`/app/analysis`はProduct intentが未決定のためURL entryを保持する。
- 次backlog子課題はFrontend structure policy。推奨B-3Sでtaxonomy、canonical import、directory placement、route lifecycleを正本化する。

### Deferred / Remaining

- Marketing/App canonical URL、redirect、campaign/deep-link semantics。
- production `Dummy` namingとpreview dependency/extraction。
- `PanoptesSiteHeader`責務、`/app/login/settings` lifecycle。
- Strategy Plan Rail、score/axisなどProduct semantics依存の統合判断。

### References

- [Wrapper / route entry analysis](./audit/55-compatibility-wrapper-route-entry-analysis.md)
- [B-3R consolidation](./audit/56-phase-b3r-wrapper-consolidation.md)
- [Frontend route ownership](./architecture/frontend-route-ownership.md)
- [Frontend inventory summary](./inventory/frontend-inventory-summary.md)

## Phase B-3S — Frontend Component / Route / Preview Structure Policy

**Status:** Completed  
**Category:** Frontend Architecture / Inventory Closure  
**Objective:** B-3A〜B-3Rの実装・監査結果からComponent、Feature、Route、Layout、Preview、Mapping、Controller、Command、Client、Stateの責任境界と段階移行方針を正式化する。

### Changes

- `frontend-structure-policy.md`をFrontend構造整理方針の正本として作成した。
- 現行directory、dependency、`ComponentsBase`、Preview/Dummy、View Model/Mapping、Controller/Command/Client、Storeをsourceと過去auditから再監査した。
- `ComponentsBase = GRADUAL_DEPRECATION`、new-code-first / touch-and-migrate / no-big-bangを決定した。
- Landing、Shell、Self、Competitor、Strategy、Authをspot checkし、全領域を`PARTIAL`として具体的gap/exceptionを記録した。
- 親inventory、Active Graph、Route OwnershipへPolicy、technical debt、Product Decision、10月Handoffを同期した。

### Result

- Source/directory/route/APIを移動・変更せず、124 reusable、119 production canonical、wrapper 0のbaselineを維持した。
- 7 backlog子課題は6件`READY_TO_CLOSE`、Technical Debtは`SUBSTANTIALLY_COVERED`。8〜9月親課題はclosure review ready。
- 22 test files / 257 tests、ESLint 0 errors / 38 warnings、OpenAPI 18 / 18、unresolved 0、cycles 0、inventory stale 0、`npm run quality` PASS。

### Decisions

- Route Entryはframework boundary、Feature Entryはcomposition boundary、Compatibility Wrapperは例外として分離する。
- Preview/Fixture/Mock/Actual Runtimeを区別し、production previewをruntime BFF/controllerへ接続しない。
- Product formula、axis、URL、workflowをFrontend architecture/helperで決定しない。
- 次は追加refactorではなく8〜9月Frontend棚卸し親課題のクロージングレビューを推奨する。

### Deferred / Remaining

- `ComponentsBase`、Dummy/casing/Self/Panoai namingの段階移行。
- Product route intent、Strategy Plan Rail、score/axis contract。
- Preview dependency、Header responsibility、browser E2E、responsive、Design Token。
- 10月開始時に`frontend-standardization-plan.md`を作成し、Token/Responsive/Accessibility/UI Regulation/Tailwindを設計する。

### References

- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)
- [B-3S policy analysis](./audit/57-frontend-structure-policy-analysis.md)
- [Frontend inventory summary](./inventory/frontend-inventory-summary.md)
- [Frontend active graph](./architecture/frontend-active-graph.md)

## Phase B-3T — 8〜9月 Frontend Inventory Parent Closure Review

**Status:** Completed / `CLOSE_WITH_DEFERRED_ITEMS`  
**Category:** Frontend Inventory Closure  
**Objective:** B-3A〜B-3Sの成果物、7子課題、Technical Debt、DEFER、Product Decision、10月Handoff、quality baselineを最終レビューし、Frontend棚卸し親課題を正式に閉じられる状態へ確定する。

### Changes

- 親inventoryへClosure Summary、Page Structure Inventory、ID付きDebt台帳、Product/DEFER、Closure Checklist/Status、Backlog転記情報を追加した。
- 重複していたHeader、Preview、route、score/axes、naming、responsive、Plan Rail等をFA/FS/VB/TI/BD/PD IDへ集約した。
- 7子課題を最終評価し、全件`READY_TO_CLOSE`とした。
- Structure Policy、Active Graph、Route Ownership、B-3A〜S audit、Development Log、開始時inventory baselineの参照整合を確認した。
- 新規closure auditを作成し、Already DecidedとOctober Design Workを分離した。

### Result

- Parent backlog decisionは`CLOSE_WITH_DEFERRED_ITEMS`。全11 closure checklistとclosure criteriaがPASS。
- Baselineは124 reusable、119 production canonical、wrapper 0、dev-only 3、DEFER 2、unclassified unreachable/unresolved/cycle/stale 0を維持した。
- 22 test files / 257 tests、ESLint 0 errors / 38 warnings、OpenAPI 18 / 18、build・smoke・`npm run quality` PASS。
- Source、route、UI、Rails/BFF/OpenAPI、Product behaviorは変更していない。

### Decisions

- Technical Debtの未解消はinventory closure blockerではなく、classification、priority、dependency、owner、reopen conditionを伴って後続backlogへ移管する。
- 次の推奨領域はProduct Decision backlog review。Architectureで推測できないPD-01〜05をownerとtiming付きで整理する。
- October Frontend Standardization開始時に`frontend-standardization-plan.md`を次Parent Artifactとして作成する。

### Deferred / Remaining

- FA/FS: ComponentsBase、Header、Preview/Dummy、directory/Self/Panoai naming、Token/Tailwind。
- VB/TI: Marketing Preview extraction、responsive、Browser E2E/visual regression。
- BD: Rails canonical business operationsとfrontend client接続。
- PD: route intent、score/axes、Strategy Plan Rail、partial Snapshot、settings lifecycle。

### References

- [Parent closure review](./audit/58-frontend-inventory-parent-closure-review.md)
- [Final frontend inventory](./inventory/frontend-inventory-summary.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)
- [Frontend Active Graph](./architecture/frontend-active-graph.md)

## Phase PD-1 — Product Decision Backlog Review

**Status:** Completed  
**Category:** Product Decision Preparation / Documentation  
**Objective:** B-3TでArchitectureから分離したPD-01〜PD-05を、Product Ownerが安全に判断できるbacklogへ変換し、owner、Evidence、timing、blocking、Frontend Standardizationへの影響を正本化する。

### Changes

- `docs/product/product-decision-register.md`をProduct Decision Backlogの親成果物として新規作成した。
- PD-01〜PD-05のcurrent behavior、Product questions、options、Evidence gap、owner候補、timing、blocking、dependencyを整理した。
- `READY_FOR_DECISION`のPD-05にはDecision Proposalを作成し、他項目はEvidence不足またはBackend contract待ちとして明示した。
- 閉鎖済みFrontend InventoryにはRegisterへのreferenceだけを追加し、closure statusやinventory分類は変更していない。

### Result

- PD-05は`READY_FOR_DECISION`、PD-01/02/03は`NEEDS_DISCOVERY`、PD-04は`BLOCKED / BACKEND CONTRACT REQUIRED`となった。
- 明示承認がないため`DECIDED`は0件である。Source、UI、route、Frontend Architecture、Rails、BFF、OpenAPI変更も0件である。
- October Frontend Standardizationへの影響は`PARTIAL`であり、generic taxonomy、基礎token、responsive/accessibility baselineは進行可能と判断した。
- 22 test files / 257 tests、ESLint 0 errors / 38 warnings、OpenAPI 18 / 18、build、smoke、`npm run quality` PASS。

### Decisions

- 次の判断対象はPD-05 Settings Route Lifecycleとし、Product Ownerがowner・purpose・期限を提示できない場合はroute removalを推奨案とする。ただし本Phaseではrouteを削除していない。
- PD-04はFrontend判断で進めず、Rails Snapshot/AnalysisJob/usage/lineage contractを必須とする。
- StandardizationはProduct semanticsを逆向きに決めず、未決定領域だけをcheckpointとして除外する。

### Deferred / Remaining

- 5件すべての正式Decision Owner割当と承認日設定。
- PD-01 route intent、PD-02 score/axis data dictionary、PD-03 Strategy Product Designのdiscovery。
- PD-04 Rails/API contract review、PD-05 Product Owner decision。
- October Frontend Standardizationの親成果物作成は別Phaseで行う。

### References

- [Product Decision Register](./product/product-decision-register.md)
- [Phase PD-1 audit](./audit/59-product-decision-backlog-review.md)
- [Frontend Inventory Summary](./inventory/frontend-inventory-summary.md)
- [B-3T parent closure review](./audit/58-frontend-inventory-parent-closure-review.md)

## Phase PD-2 — PD-05 Settings Route Lifecycle Decision Review

**Status:** Completed / `READY_FOR_DECISION` maintained  
**Category:** Product Decision Review / Documentation  
**Objective:** `/app/login/settings`の現行責務、到達性、命名、Settings scope、Option A/B/C、後続実装条件を最終確認し、Product Owner判断に必要なDecision Recordを正本化する。

### Evidence

- routeはApp layoutとserver auth policyを継承し、authenticationとactive Organization membershipを要求する。
- PageはSvelte starter本文だけを表示し、settings form、persistence、API、account/organization/auth settingsを持たない。
- internal navigationはなく、direct URL/bookmark/browser historyでは技術的に到達可能である。実在bookmark/external inbound linkは未確認である。
- route ownership unit testとproduction smokeが現行routeを参照する。

### Result

- owner、purpose、期限がない現状ではOption A — Remove Temporary Routeを推奨した。
- Product Owner、Decision Date、Selected Option、Approvalが提示されていないため、PD-05は`READY_FOR_DECISION`を維持し、`DECIDED`へ変更していない。
- Standardization全体への影響は`NON_BLOCKING`、当該routeのnaming/page taxonomyだけを`PARTIAL`とした。
- Product Decision RegisterへPD-2 Reviewとconditional implementation contractを反映した。

### Recommendation

- Product OwnerがOption A/B/Cを明示選択し、Owner、Decision Date、Rationale、Approvalを記録する。
- Option Aが承認された場合のみ、別のPD-05 Implementation Phaseでroute/test/smoke/inventory/Active Graph/docsを同期する。

### Deferred / Remaining

- 実在Product Ownerの割当と明示承認。
- bookmark、配布URL、external inbound linkのProduct運用確認。
- Option Bの場合のowner/purpose/review date/removal criteria、またはOption Cの場合のSettings Product Discovery。
- route削除、rename、redirect、Settings実装は未実施。

### References

- [Product Decision Register](./product/product-decision-register.md)
- [PD-05 Decision Review](./audit/60-pd05-settings-route-decision-review.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)
- [Frontend Route Ownership](./architecture/frontend-route-ownership.md)

## Phase PD-3 — PD-05 Settings Temporary Route Removal

**Status:** Completed / PD-05 `DECIDED` and `IMPLEMENTED`  
**Category:** Product Decision Implementation / Route cleanup  
**Objective:** Product Owner承認済みOption Aに基づき、`/app/login/settings` temporary starter routeをredirectなしで削除し、route graph、inventory、test、Product Decision Registerを同期する。

### Product Decision

- Decision Owner: Product Owner（PD-3指示書による明示承認）
- Decision Date: 2026-08-19
- Selected Option: Option A — Remove Temporary Route
- Future Settingsは現在routeを復元せず、新しいProduct Discovery/Decisionから設計する。

### Changes

- route-local `+page.svelte`と空になった`settings`/`login`directoryを削除した。
- route ownership testをroute非存在の回帰検証へ変更し、production smoke listから対象routeを削除した。
- component inventoryを再生成し、Active Graph、Route Ownership、Structure Policy、Frontend Inventory current baselineをpost-closure同期した。
- Product Decision Registerを`DECIDED`、Phase PD-3 implementation resultへ更新した。

### Result

- production routes 9→8、route Svelte 13→12、total Svelte 137→136。
- reusable 124、production canonical 119、wrapper 0、dev-only 3、DEFER 2を維持した。
- 新規UNREACHABLE、unresolved import、cycle、inventory staleは0。
- `/app`、`/app/analysis`、App layout、Auth、Organization、Header、Shell、Rails/BFF/OpenAPIは変更していない。

### Quality

- 22 test files / 257 tests、Svelte 0/0、ESLint 0 errors / 38 warnings。
- OpenAPI 18/18、inventory stale/unresolved/cycle 0、build、auth smoke、secret boundary、10 route production smoke PASS。
- `npm run quality` exit 0。
- Browser instanceが利用できなかったため実ブラウザー確認は未実施。CLI smoke/auth smoke/buildで代替確認した。

### References

- [Product Decision Register](./product/product-decision-register.md)
- [PD-05 removal implementation](./audit/61-pd05-settings-route-removal-implementation.md)
- [Frontend Active Graph](./architecture/frontend-active-graph.md)
- [Frontend Route Ownership](./architecture/frontend-route-ownership.md)
- [Frontend Inventory Summary](./inventory/frontend-inventory-summary.md)

## Phase PD-4 — PD-01 Route Intent Discovery

**Status:** Completed / PD-01 overall `NEEDS_DISCOVERY`  
**Category:** Product Discovery / Route intent  
**Objective:** `/`、`/lp`、`/plan`、`/app`、`/app/analysis`の現在動作、SEO/campaign/analytics、navigation、deep-link evidenceを整理し、PD-01を判断可能な問いへ変換する。

### Evidence

- Marketing 3 routeは同じ`MarketingLandingPage`を同じpropsで描画し、route固有load、metadata、campaign処理、analytics差を持たない。
- repository内の内部導線は`/`にあり、`/lp`・`/plan`にはない。外部公開、広告、bookmark、backlink、index状況は`EXTERNAL_EVIDENCE_REQUIRED`とした。
- App 2 routeは同じShell初期stateを使う一方、`/app`だけがTop Hero/search entryを持ち、Search成功後は`/app/analysis`へ遷移する。
- `/app/analysis`はroute単位の到達・safe returnを持つが、pathnameからtab/project/snapshot/queryを復元する契約とshare link要件はない。

### Result

- Marketing route intentを`NEEDS_DISCOVERY`、App URL roleを`READY_FOR_DECISION`、App state/share contractを`NEEDS_DISCOVERY`と判定した。
- PD-01全体は`NEEDS_DISCOVERY`を維持した。
- App sub-itemにA-A〜A-DのDecision Proposalを作成し、A-A（`/app` home/search、`/app/analysis` analysis destination）を推奨した。Product Owner承認前のため`DECIDED`にはしていない。
- Product Decision RegisterへRoute Intent Matrix、readiness、owner、timing、standardization impact、next actionを反映した。

### Decision readiness

- Marketing canonical/campaign/plan: `NEEDS_DISCOVERY`、`BEFORE_PUBLIC_INDEXING`およびcampaign launch前。
- App URL roles: `READY_FOR_DECISION`、`BEFORE_CLOSED_BETA`。
- Ownerは`OWNER_REQUIRED`。Product Owner/PMをAccountable候補とし、Marketing/SEO/Analytics/Engineering consultationが必要。

### Quality

- Svelte 0/0、ESLint 0 errors / 38 warnings、OpenAPI 18/18、inventory unresolved import/cycle/stale 0。
- 22 test files / 257 tests、auth smoke、build、client secret boundary、route smokeがPASS。
- `npm run quality` exit 0。指示書の`check:inventory`はpackageに存在しないため、現行script `check:frontend-inventory`で確認した。

### Deferred / Remaining

- Search Console、広告/CRM、公開済みURL、bookmark/backlink、campaign ownerの外部証拠収集。
- `/app/analysis`のinitial state、reload/back-forward、bookmark/share、Organization境界のProduct契約。
- redirect、route lifecycle、metadata、navigation、analytics、App stateの実装はDecision承認後の別Phaseへdeferした。

### References

- [PD-01 Route Intent Discovery](./audit/62-pd01-route-intent-discovery.md)
- [Product Decision Register](./product/product-decision-register.md)
- [Frontend Route Ownership](./architecture/frontend-route-ownership.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase PD-5 — PD-01A App Route Role Decision

**Status:** Completed / PD-01A `DECIDED`  
**Category:** Product Decision / App Route Role  
**Objective:** `/app`と`/app/analysis`のProduct上のRoute Roleを確定し、shared Shell architectureを維持したままURL semanticsを正本化する。

### Product Decision

- Product Owner承認によりOption A-A — Distinct Semantic Routes, Shared Runtimeを採用した。
- `/app`をPanoptes App Home / Analysis Entryと定義した。
- `/app/analysis`をAnalysis-focused Workspace / Result Entryと定義した。正式UI labelは別Product/Design判断とした。
- 両routeが同じ`PanoptesShellEntryPage`、runtime model、initial `strategy` tabを共有することを承認した。

### Result

- PD-01Aを`DECIDED`、Decision Date 2026-08-20、Owner Product OwnerとしてProduct Decision Registerへ記録した。
- state restoration、bookmark、share、history、stale resourceをPD-01B `NEEDS_DISCOVERY`へ分離した。
- Marketing route intentが残るためPD-01 parentは`NEEDS_DISCOVERY`を維持した。
- Route OwnershipへPD-01A referenceを追加し、Technical Debt PD-01をpartialへ更新した。

### Source impact

- `NO_IMMEDIATE_SOURCE_CHANGE`。現行presentation/navigation/shared runtimeがDecisionを満たす。
- route、navigation、redirect、metadata、UI label、active tab、pathname mapping、Rails/BFF/OpenAPIは変更していない。

### Quality

- Svelte 0/0、ESLint 0 errors / 38 warnings、OpenAPI 18/18、inventory unresolved import/cycle/stale 0。
- 22 test files / 257 tests、build、auth smoke、client secret boundary、route smokeがPASS。
- `npm run quality` exit 0。

### Remaining

- PD-01 Marketing canonical/campaign/plan intent。
- PD-01B App tab/project/snapshot/query restoration、bookmark/share、back/forward、Organization/security、stale resource contract。
- route-aware stateまたはshare link設計時にPD-01Bをreviewする。

### References

- [PD-01A App Route Role Decision](./audit/63-pd01a-app-route-role-decision.md)
- [Product Decision Register](./product/product-decision-register.md)
- [Frontend Route Ownership](./architecture/frontend-route-ownership.md)
- [PD-01 Route Intent Discovery](./audit/62-pd01-route-intent-discovery.md)

## Phase PD-6 — PD-02 Score / Common Axes Data Dictionary Discovery

**Status:** Completed / PD-02 `NEEDS_DISCOVERY`  
**Category:** Product Discovery / Score and axes  
**Objective:** Self、Competitor、Industry、Strategy、Snapshot、fixture、mapping、Backend境界のscore/axis evidenceを収集し、正式Data Dictionaryを作成する。

### Evidence

- 6 candidate machine keysはFrontend dummy seed/mappingとSelf augmented fixtureに存在するが、production payload、OpenAPI、BFF、Railsを横断するcanonical IDではない。
- 5 axis definition sets、4 order variants、axis-related label variants 17件を確認した。
- Current UIは0–100 display、clamp、score×3.6°を広く使う。Company/Expanded accentは24°/30°を維持する。
- Competitor axis offsets、Self benchmark/threshold fallback、Strategy fit/improvement派生等を`PRODUCT_LOGIC_SUSPECTED`として隔離した。
- OpenAPI/BFF/Railsにscore/axis schemaはなく、Backendは`BACKEND_CONTRACT_REQUIRED`。

### Artifacts

- PD-02 detail parentとして`docs/product/score-axis-data-dictionary.md`を作成した。
- Phase Audit `docs/audit/64-pd02-score-common-axes-data-dictionary-discovery.md`を作成した。
- Product Decision RegisterからData Dictionaryを参照し、Frontend Inventoryにはreferenceだけを最小追加した。

### Result

- PD-02は`NEEDS_DISCOVERY`を維持し、正式名称、formula、threshold、weight、ranking、eligibility、color、Backend schemaを決定していない。
- current behaviorとProduct Formula、Presentation、Fixture、Backend contractの境界を分離した。
- Product Owner/Analysis Owner向け15 Decision Questionsを作成した。

### Decision readiness

- `READY_FOR_DECISION`: display scale、presentation angle/clamp boundary。
- `NEEDS_DISCOVERY`: naming、ID、order、formula/weight/threshold、tone。
- `BLOCKED`: Backend ownership/schema、missing/partial contract。
- 推奨OwnerはProduct Owner + Analysis/Data OwnerのJoint Decision。

### Standardization impact

- `BLOCKING`: canonical labels/IDs/order、semantic score colors、shared thresholds、missing/partial UI regulation。
- `PARTIAL`: semantic APIを持つshared score/axis component。
- `NON_BLOCKING`: generic spacing/radius/typography/surface、responsive、accessibility、directory taxonomy、Tailwind mechanics。

### Deferred

- 実データmapping review、overall/layer/formula/weight/eligibility、Backend schema/version/provenance。
- missing/partialおよびPD-04との接続。
- label/formula/threshold/type/component/fixture/CSS/Backend/BFF/OpenAPI変更は後続Decision/Implementationへdeferした。

### Quality

- `check`: PASS（0 errors / 0 warnings）
- `lint`: PASS（0 errors / 38 warnings）
- `format:check`、`check:openapi`、`check:frontend-inventory`: PASS（OpenAPI 18/18、unresolved imports 0、cycles 0）
- `test`: PASS（22 files / 257 tests）
- `build`、`test:secrets`、`test:smoke`: PASS
- `quality`: PASS（exit 0、`test:auth-smoke`を含む）

### References

- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [PD-02 Discovery Audit](./audit/64-pd02-score-common-axes-data-dictionary-discovery.md)
- [Product Decision Register](./product/product-decision-register.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase PD-7 — PD-02A Display Scale & Presentation Boundary Decision

**Status:** Completed / PD-02A `DECIDED`  
**Category:** Product Decision / Display contract  
**Objective:** Product-facing score/axisのFrontend表示尺度と、visualization-only Presentation変換の責任境界を確定する。

### Evidence

- Self/Competitor/Industry fixture/Strategy fitは0–100 displayを前提とする。
- Ringはclamped score×3.6°、barは0–100% width、radarはmaximum 100のcoordinateを使う。
- 0–1 market/matrix coordinate、signed delta、progress/count/rankは別value familyであり、feature-specific score scaleの根拠ではない。
- Frontend Structure PolicyはPresentationへformatting/safe fallbackを許し、canonical formula/threshold/eligibilityを禁止する。

### Decision

- Display Option A: Product-facing Frontend display scaleを0–100とする。
- Boundary Option P-A: Presentationはknown Product scoreをvisualizationのためだけにclamp/transformできる。
- Clampはrendering safetyでありraw/business valueをmutationまたはcorrectしない。
- Ring angle、percentage width、radar coordinate、finite safetyをPresentation responsibilityとする。
- Product meaning、formula、weight、threshold、normalization semantics、eligibility、rankingはPresentation外とする。

### Result

- PD-02Aは`DECIDED`。親PD-02は`NEEDS_DISCOVERY`を維持する。
- PD-02B Canonical Axis Identityは`NEEDS_DISCOVERY`。
- PD-02C Score Formula & Backend ContractとPD-02D Missing / Partial Score Contractは`BLOCKED`。
- Source、helper、type、CSS、fixture、Backend/BFF/OpenAPIは変更していない。

### Standardization impact

- Newly unblocked: generic score container、percentage/ring visualization、radar max scale、visual clamp helper、score layout token。
- Still blocked: canonical axis component/labels/order、semantic score colors/badges、threshold tone、missing-value UI、Product formula helper。
- Generic spacing/radius/typography/surface/shadowへ直接影響しない。

### Remaining

- PD-02Bでcanonical ID、full/short label、order、cross-feature semanticsを判断する。
- Decimal/rounding、formula/Backend schema、missing/partial、semantic colorを後続Decisionへ残す。
- Company 24°／Expanded 30°、Self 75/60、Competitor offset、Strategy derivationをProduct仕様として認定していない。

### Quality

- `check`: PASS（0 errors / 0 warnings）
- `lint`: PASS（0 errors / 38 warnings）
- `format:check`、`check:openapi`、`check:frontend-inventory`: PASS（OpenAPI 18/18、unresolved imports 0、cycles 0）
- `test`: PASS（22 files / 257 tests）
- `build`、`test:secrets`、`test:smoke`: PASS
- `quality`: PASS（exit 0、`test:auth-smoke`を含む）

### References

- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [PD-02A Decision Audit](./audit/65-pd02a-display-scale-presentation-boundary-decision.md)
- [Product Decision Register](./product/product-decision-register.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase PD-8 — PD-02B Canonical Axis Identity Discovery

**Status:** Completed / PD-02B `NEEDS_DISCOVERY`  
**Category:** Product Discovery / Axis identity  
**Objective:** 共通6軸の正式set、label、candidate ID、order、Self/Competitor/Industry semantic equivalenceをProduct Decision可能な粒度へ整理する。

### Evidence

- Active UI、dummy/mocks、current role design documents、historical Archiveを再検索し、6 candidate concepts、6 candidate keys、17 exact label variants、4 order variantsを確認した。
- Current design documentsは同じ英語6軸をSelf/Competitor/Industry/Snapshotにstableとするが、Product Owner Decisionの代替にはしていない。
- Self/Competitorの4 base labelsは一致し、`差別化`/`差別化明確性`と`意思決定`/`意思決定支援`はshort-label hypothesisとして`LIKELY_SAME`。
- Historical submetricsはaxis meaningの手掛かりになるが、現行definition/formulaではない。

### Artifacts

- `docs/product/score-axis-data-dictionary.md`へPD-02B Discoveryを集約した。
- `docs/audit/66-pd02b-canonical-axis-identity-discovery.md`を作成した。
- Product Decision Registerへstatus、readiness、owner、dependencies、next reviewを同期した。

### Result

- Candidate ID 5件を`KEEP_CANDIDATE`、`funnelStrength`を`RENAME_CANDIDATE`と評価した。
- Order policyはO-Aを推奨し、P sequenceをfirst candidateとしたが、active order Aとの差をProduct判断へ残した。
- Full `canonicalLabel` + optional governed `shortLabel` modelとdocumentation-only `AxisDefinition` draftを作成した。
- PD-02B全体は`NEEDS_DISCOVERY`、親PD-02も`NEEDS_DISCOVERY`を維持する。

### Decision readiness

- `READY_FOR_DECISION`: Axis Set、Semantic Equivalence、Canonical Label、Short Label。
- `NEEDS_DISCOVERY`: Canonical ID、Canonical Order、Axis Definition、Versioning。
- `BLOCKED`: Backend Wire ID。
- 推奨OwnerはProduct Owner + Analysis/Data Owner。Design、Frontend、Backend/APIをConsultedとする。

### Dependencies

- PD-02B → PD-02C: formula outputs、Backend schema、Snapshot axis object。
- PD-02B → PD-02D: missing/partial axis identity。
- PD-02Aの0–100 display contractは変更しない。

### Standardization impact

- PD-02B決定後にcanonical axis type、shared label metadata/component、shared radar order、Self/Competitor presentation consolidationを解禁可能。
- 現段階ではsource label/key/order統合、axis semantic color、Backend enum/schema、Product formula helperを禁止する。

### Deferred

- Product Owner承認、`funnelStrength`のsemantic naming、P/A order rationale、正式axis definitions。
- Backend wire ID、axis/formula versioning、missing/partial contract。
- Source、label、key、type、enum、component、order、fixture、radar、CSS、Backend/BFF/OpenAPIは変更していない。

### Quality

- `check`: PASS（0 errors / 0 warnings）
- `lint`: PASS（0 errors / 38 warnings）
- `format:check`、`check:openapi`、`check:frontend-inventory`: PASS（OpenAPI 18/18、unresolved imports 0、cycles 0）
- `test`: PASS（22 files / 257 tests）
- `build`、`test:secrets`、`test:smoke`: PASS
- `quality`: PASS（exit 0、`test:auth-smoke`を含む）

### References

- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [PD-02B Discovery Audit](./audit/66-pd02b-canonical-axis-identity-discovery.md)
- [Product Decision Register](./product/product-decision-register.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase PD-9 — PD-02B Axis Set & Label Identity Decision Review

**Status:** Completed / `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`  
**Category:** Product Decision Review / Axis identity  
**Objective:** PD-8でdecision-readyとなったAxis Set、Canonical Label、Short Label、Semantic EquivalenceをProduct Decision proposalとして確定し、承認状態を正しく記録する。

### Evidence

- PD-6/7/8正本、Self/Competitor/Industry関連audit、Frontend Structure Policyを再確認した。
- Self/Competitorは同じ6 axis positionsを使い、Industry fixtureも同一6 conceptsを支持する。Strategyは直接consumerではない。
- Phase指示書にProduct Ownerの明示承認、承認者名、Decision Dateはない。

### Product Decision Review

- AS-A（current six-axis setをFormal Common Axis Setとする）を推奨。
- Canonical label候補を価値訴求、情報階層、導線強度、信頼構造、差別化明確性、意思決定支援とする。
- governed short labelをpresentation aliasとして許可し、`差別化`と`意思決定`の2件だけを登録候補とする。
- 推奨は完了したが未承認のため、Axis SetとLabel Identityは`READY_FOR_DECISION`、PD-02B全体は`NEEDS_DISCOVERY`を維持する。

### Result

- Data Dictionaryにoption評価、label contract、cross-feature relation、approval recordを追加した。
- Product Decision RegisterにPD-9 Reviewと`NOT_PROVIDED`の承認状態を同期した。
- `docs/audit/67-pd02b-axis-set-label-identity-decision.md`を作成した。

### Standardization impact

- Product Owner承認後はCommon Axis label metadata、short-label metadata、Self/Competitor label alignment planning、shared chart label planningを解禁候補とできる。
- 現時点でsource label/key/order、common enum/component、Backend schema、semantic color、formula/threshold helperは変更しない。

### Remaining

- Product Ownerの承認文、承認者名、Decision Date。
- Canonical ID、`funnelStrength` rename、Canonical Order、Axis Definitions、Versioning、Backend Wire ID。

### Dependencies

- PD-02Cはformula outputのidentityをPD-02Bに依存し、Backend schemaはCanonical ID決定を待つ。
- PD-02Dのmissing-axis conceptはFormal Axis Setに依存する。

### Quality

- `check`: PASS（0 errors / 0 warnings）
- `lint`: PASS（0 errors / 38 warnings）
- `format:check`、`check:openapi`、`check:frontend-inventory`: PASS（OpenAPI 18/18、unresolved imports 0、cycles 0）
- `test`: PASS（22 files / 257 tests）
- `build`、`test:secrets`、`test:smoke`: PASS
- `quality`: PASS（exit 0、`test:auth-smoke`を含む）

### References

- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [PD-9 Decision Review Audit](./audit/67-pd02b-axis-set-label-identity-decision.md)
- [PD-8 Discovery Audit](./audit/66-pd02b-canonical-axis-identity-discovery.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-10 — PD-02B Product Owner Approval & Decision Record

**Status:** Completed / `APPROVAL_NOT_PROVIDED`  
**Category:** Product Decision Record / Approval check  
**Objective:** PD-9 Axis Set / Label Identity proposalに対するProduct Ownerの明示承認を確認し、承認がある場合だけ正本を`DECIDED`へ進める。

### Approval

- Product Owner approval evidenceは`NOT_PROVIDED`。
- 承認文、承認者identity、Decision Dateは提示されていない。
- 承認対象の記載やCodexのrecommendationをApprovalとして扱っていない。

### Product Decision

- Formal Common Axis SetとLabel Identityは`READY_FOR_DECISION`を維持する。
- 6-axis set、6 canonical labels、governed short-label policy、2 semantic-equivalence pairs、Self/Competitor common identityはproposalのままとする。
- PD-02B全体は`NEEDS_DISCOVERY`、PD-02親も`NEEDS_DISCOVERY`を維持する。

### Result

- Data DictionaryにPD-10 Approval Checkと最終statusを追加した。
- Product Decision Registerにapproval evidence、owner、date、dependencies、next reviewを同期した。
- `docs/audit/68-pd02b-product-owner-approval-decision-record.md`を作成した。

### Standardization impact

- 承認がないため、Common Axis metadata、label alignment、shared chart label、accessibility namingの新たな実装解禁はない。
- Source label/key/order、enum、component、Backend schema、formula/threshold、semantic color、missing UIは変更しない。

### Remaining

- Product Ownerの明示承認、owner identity、approval date。
- Canonical ID、`funnelStrength` rename、Canonical Order、Axis Definitions、Versioning、Backend Wire ID。

### Dependencies

- PD-02Cは6-axis proposalを参照できるが、承認とCanonical ID決定までBackend schema implementationを開始しない。
- PD-02Dはsix-axis missing/partial conceptをproposalとして参照できるが、schema、fallback、partial semantics、`partially_completed`は未決定。

### Quality

- `check`: PASS（0 errors / 0 warnings）
- `lint`: PASS（0 errors / 38 warnings）
- `format:check`、`check:openapi`、`check:frontend-inventory`: PASS（OpenAPI 18/18、unresolved imports 0、cycles 0）
- `test`: PASS（22 files / 257 tests）
- `build`、`test:secrets`、`test:smoke`: PASS
- `quality`: PASS（exit 0、`test:auth-smoke`を含む）

### References

- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-10 Approval Audit](./audit/68-pd02b-product-owner-approval-decision-record.md)
- [PD-9 Decision Review](./audit/67-pd02b-axis-set-label-identity-decision.md)

## Phase PD-11 — PD-02B Explicit Product Owner Approval Record

**Status:** Completed / `APPROVED`  
**Category:** Product Decision / Approval record  
**Objective:** Product Ownerの明示承認をPD-02B Axis Set / Label Identityの正式Decision Recordへ反映する。

### Product Owner Approval

- Approval Evidence: 「PD-02BのAxis Set & Label Identity Proposalを承認する。」
- Approval Date: 2026-08-20。
- Decision Owner: Product Owner。

### Decision

- Formal Common Axis Setを価値訴求、情報階層、導線強度、信頼構造、差別化明確性、意思決定支援の6軸とした。
- 同じ6 labelsを正式`canonicalLabel`とした。
- Short Labelをgoverned presentation aliasとして許可し、`差別化`と`意思決定`を同一Axis Identityのshort labelとした。
- Self / CompetitorのCommon 6 Axis IdentityとIndustry alignment directionを承認した。Strategyは直接consumerにしない。

### Status Transition

- Axis Set、Label Identity、Semantic Equivalence、Short Label: `READY_FOR_DECISION` → `DECIDED`。
- Industry: `APPROVED_DIRECTION`。
- PD-02B overallとPD-02 parent: `NEEDS_DISCOVERY`維持。

### Result

- Data DictionaryにFormal Axis / Label contract、governance、status、handoffを反映した。
- Product Decision RegisterにApproval Evidence、date、owner、status transitionを同期した。
- `docs/audit/69-pd02b-explicit-product-owner-approval-record.md`を作成した。

### Standardization Impact

- Axis metadata、canonical/short label metadata、Self/Competitor label alignment、shared chart label、axis accessibility naming、axis-aware component contractのplanningを正式に解禁した。
- Canonical ID enum、key rename、Canonical Order、Backend schema、formula/threshold、semantic color、missing UI、versioned Axis contractの実装は引き続き禁止。

### Remaining

- Canonical ID、`funnelStrength` rename、Canonical Order、Axis Definitions、Versioning、Backend Wire ID。

### Dependencies

- PD-02Cは決定済みFormal Axis Identityを参照可能。Canonical ID未決定のためBackend schema implementationはまだ開始しない。
- PD-02Dは6 Formal Common Axesをmissing / partial対象として参照可能。Representationとsemanticsは未決定。

### Quality

- `check`: PASS（0 errors / 0 warnings）
- `lint`: PASS（0 errors / 38 warnings）
- `format:check`、`check:openapi`、`check:frontend-inventory`: PASS（OpenAPI 18/18、unresolved imports 0、cycles 0）
- `test`: PASS（22 files / 257 tests）
- `build`、`test:secrets`、`test:smoke`: PASS
- `quality`: PASS（exit 0、`test:auth-smoke`を含む）

### References

- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-11 Approval Record](./audit/69-pd02b-explicit-product-owner-approval-record.md)
- [PD-10 Approval Check](./audit/68-pd02b-product-owner-approval-decision-record.md)

## Phase PD-12 — PD-02B Canonical ID & Funnel Naming Discovery

**Status:** Completed / `DISCOVERY_COMPLETE`  
**Category:** Product Decision Discovery / Axis identity  
**Objective:** Formal Common 6 Axisのdomain-level Canonical ID候補を評価し、`funnelStrength`のsemantic mismatchと移行境界をDecision-readyな証拠へ整理する。

### Evidence

- 6 keysはFrontend dummy mapping / seedとSelf presentation mappingに存在するが、Rails、BFF、OpenAPIのcontractには存在しない。
- 5 keysはhistorical/current concept evidenceと強く整合した。
- 導線軸はCTA、internal navigation、link/path、page transition、user flow、conversion pathを含み、conversion funnelだけではない。

### Artifacts

- Data DictionaryへID design principles、format、Candidate ID Matrix、funnel semantics/candidates、axis boundaries、legacy migration、Decision Questionsを追加。
- Product Decision Registerへper-axis readiness、owner、dependencies、next reviewを同期。
- `docs/audit/70-pd02b-canonical-id-funnel-naming-discovery.md`を作成。

### Result / Readiness

- Frontend domain ID formatは`camelCase`を推奨。
- `valueProposition`、`informationHierarchy`、`trustStructure`、`differentiationClarity`、`decisionSupport`は`KEEP / READY_FOR_DECISION`。
- `funnelStrength`は`RENAME / NEEDS_DISCOVERY`。第一rename候補は`userFlowQuality`だが未決定。
- Canonical ID overallは`NEEDS_DISCOVERY`。Canonical Order / Versioningは`NEEDS_DISCOVERY`、Backend Wire IDは`BLOCKED`。

### Dependencies / Standardization impact

- 導線軸IDにはincluded/excluded semanticsと意思決定支援との境界を定めるAxis Definitionが`BLOCKING_DEPENDENCY`。
- 5 IDsが承認されればcanonical metadata keys、domain type、label lookup、accessibility ID、mapping normalization planningを追加解禁できる。
- 現時点でsource、fixture、type、label、order、Rails/BFF/OpenAPI、Frontend Inventoryは変更していない。

### Deferred

- Product Owner + Analysis/Data Ownerによる5 IDsのDecision Review。
- Funnel Axis Definition workshop、Canonical Order、Axis Definitions、Versioning、Backend Wire ID、formula/weight/threshold、missing/partial。

### Quality

- `check`: PASS（0 errors / 0 warnings）。
- `lint`: PASS（0 errors / 38 warnings）。
- `format:check`、`check:openapi`、`check:frontend-inventory`: PASS（OpenAPI 18/18、unresolved imports 0、cycles 0）。
- `test`: PASS（22 files / 257 tests）。
- `build`、`test:auth-smoke`、`test:secrets`（63 build files）、`test:smoke`: PASS。
- `quality`: PASS（exit 0）。

### References

- [PD-12 Audit](./audit/70-pd02b-canonical-id-funnel-naming-discovery.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-11 Approval Record](./audit/69-pd02b-explicit-product-owner-approval-record.md)

## Phase PD-13 — PD-02B Five Canonical IDs Decision Review

**Status:** Completed / `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`  
**Category:** Product Decision Review / Canonical ID  
**Objective:** PD-12でDecision-readyとなった5 Canonical IDsとFrontend/Product Domain ID formatを個別Reviewし、承認可能なDecision Proposalと未決定境界を正本化する。

### Evidence

- PD-8、PD-11、PD-12のidentity、approval、naming evidenceを再確認した。
- 5 recommended keysはsemantic fitと既存TypeScript ecosystemとの整合が高く、現行candidate keyと一致する。
- Phase PD-13入力にはProduct Ownerの明示承認文がない。

### Product Decision / Per-axis result

- Frontend/Product Domain ID formatは`camelCase`を推奨し`READY_FOR_DECISION`。
- `valueProposition`、`informationHierarchy`、`trustStructure`、`differentiationClarity`、`decisionSupport`を個別にKEEP推奨。全件`READY_FOR_DECISION`を維持。
- `1 Axis = 1 Canonical ID` Policyを推奨するが未承認。
- 導線軸は対象外。`funnelStrength`は`RENAME_CANDIDATE / NOT_CANONICAL`、`userFlowQuality`は`PROPOSED / NEEDS_DISCOVERY`。
- PD-02B overallとPD-02 parentは`NEEDS_DISCOVERY`。

### Standardization impact

- 明示承認がないため新たな解禁なし。PD-11で解禁済みのidentity/label planningのみ維持。
- 5 ID承認後はmetadata keys、domain identifier type、label lookup、accessibility ID、Self/Competitor mapping alignment planningを追加解禁可能。
- Funnel ID、order、Backend schema、formula/threshold、semantic colors、missing/versioningは引き続きblock。

### Remaining / Dependencies

- Product Ownerによる5 ID、`camelCase`、1 Axis = 1 ID Policyの明示承認。
- Funnel Axis Definition、Canonical Order、Axis Definitions、Versioning、Backend Wire ID。
- PD-02C、PD-02Dは未完了。Frontend Inventoryは変更せずClosureを維持。
- Source、fixture、type、Svelte、order、CSS/Tailwind、Rails/BFF/OpenAPI変更なし。

### Quality

- `check`: PASS（0 errors / 0 warnings）。
- `lint`: PASS（0 errors / 38 warnings）。
- `format:check`、`check:openapi`、`check:frontend-inventory`: PASS（OpenAPI 18/18、unresolved imports 0、cycles 0）。
- `test`: PASS（22 files / 257 tests）。
- `build`、`test:auth-smoke`、`test:secrets`（63 build files）、`test:smoke`: PASS。
- `quality`: PASS（exit 0）。

### References

- [PD-13 Decision Review Audit](./audit/71-pd02b-five-canonical-ids-decision-review.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-12 Discovery](./audit/70-pd02b-canonical-id-funnel-naming-discovery.md)

## Phase PD-14 — PD-02B Five Canonical IDs Explicit Product Owner Approval Record

**Status:** Completed / `APPROVED`  
**Category:** Product Decision / Approval Record  
**Objective:** PD-13でReview済みのFrontend/Product Domain ID format、5 Canonical IDs、1 Axis = 1 ID Policyに対するProduct Owner明示承認を正式Decision Recordへ反映する。

### Product Owner Approval

- Approval Evidence: 「PD-02BのFive Canonical IDs Proposalを承認する。」
- Approval Date: 2026-08-20。
- Decision Owner: Product Owner。

### Decision / Status Transition

- `camelCase` Frontend/Product Domain ID format: `READY_FOR_DECISION` → `DECIDED`。
- `valueProposition`、`informationHierarchy`、`trustStructure`、`differentiationClarity`、`decisionSupport`: 全件`READY_FOR_DECISION` → `DECIDED`。
- `1 Formal Axis Identity = 1 Canonical ID`: `READY_FOR_DECISION` → `DECIDED`。
- Canonical ID overallは5 / 6 decidedのため`NEEDS_DISCOVERY`。PD-02B overallとPD-02 parentも`NEEDS_DISCOVERY`を維持。
- 導線軸は対象外。`funnelStrength`は`NOT_CANONICAL / RENAME_CANDIDATE`、`userFlowQuality`は`PROPOSED / NEEDS_DISCOVERY`。

### Result / Standardization Impact

- canonical metadata keys、5-axis stable domain identifiers、label lookup、accessibility IDs、Self/Competitor mapping alignment、axis-aware contract、domain Axis typeのPlanningを解禁。
- 5 IDsは現行candidate keysと一致するため`NO_IMMEDIATE_RENAME_REQUIRED`。現行fixture/mappingを正式contractとは認定しない。
- Source implementationは別Phase。Frontend Inventoryは変更せずClosureを維持。

### Remaining / Dependencies

- Funnel Axis ID、Canonical Order、Axis Definitions、Versioningは`NEEDS_DISCOVERY`、Backend Wire IDは`BLOCKED`。
- PD-02Cは5 IDsを参照可能だがFull 6-axis Backend schemaは開始しない。PD-02DはFormal Axis Setと5 IDsを参照可能。
- Svelte、TypeScript、enum/type、fixture、mapping、label、order、CSS/Tailwind、Rails/BFF/OpenAPI変更なし。

### Quality

- `check`: PASS（0 errors / 0 warnings）。
- `lint`: PASS（0 errors / 38 warnings）。
- `format:check`、`check:openapi`、`check:frontend-inventory`: PASS（OpenAPI 18/18、unresolved imports 0、cycles 0）。
- `test`: PASS（22 files / 257 tests）。
- `build`、`test:auth-smoke`、`test:secrets`（63 build files）、`test:smoke`: PASS。
- `quality`: PASS（exit 0）。

### References

- [PD-14 Approval Record](./audit/72-pd02b-five-canonical-ids-explicit-approval-record.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-13 Decision Review](./audit/71-pd02b-five-canonical-ids-decision-review.md)

## Phase PD-15 — PD-02B Funnel Axis Definition Evidence Workshop

**Status:** Completed / `DISCOVERY_COMPLETE`  
**Category:** Product Definition / Naming Discovery  
**Objective:** 未決定のFunnel AxisについてRepository evidenceを再分類し、Definition、included/excluded semantics、adjacent boundaries、examples、Canonical ID候補をDecision-readyにする。

### Evidence

- Current documentationはCTA/internal links、sticky CTA、navigation depth、CTA fragmentation、comparison-route deficiencyを観測対象とする。
- Production presentationは「主要ページ導線評価」、比較検討phase、主要導線再設計、CTA actionsを表示する。
- Fixtureはcomparison/pricing paths、service→pricing→CTA、CTA position/wordingを具体化する。
- Legacy inputはCTA presence/progression、internal navigation、conversion path、primary paths、stage coverageを示す。
- Canonical production scoring formulaは未接続であり、fixture/legacyだけをProduct formulaとして採用しない。

### Definition / Naming Discovery

- 導線軸をactual behaviorではなく`Observable Structural Support`として整理した。
- Primary objectはUser path / Page sequence。CTA、links、navigation、page transitionはpath evidence、conversion funnelは一類型。
- Recommended Definition Draftは、next actionが識別でき、主要destinationまでのpathが途切れず接続される構造の明確さ・接続性・連続性を評価する。
- `userFlowQuality`を`KEEP_CANDIDATE / READY_FOR_DECISION`へ評価。`funnelStrength`はcanonicalとしてreject推奨だが正式status/Sourceは変更しない。

### Result / Readiness

- Axis Definition: `READY_FOR_DECISION / NOT_APPROVED`。
- Canonical ID: `READY_FOR_DECISION / NOT_APPROVED`。第一候補`userFlowQuality`。
- PD-02B / PD-02は`NEEDS_DISCOVERY`、Canonical Order / Versioningは`NEEDS_DISCOVERY`、Backend Wire IDは`BLOCKED`。
- Product Owner approvalは行わず、Source、Frontend Inventory、Rails/BFF/OpenAPIを変更していない。

### Dependencies / Remaining

- Product Owner + Analysis/Data OwnerによるDefinitionとIDのDecision Review。
- Decision後、PD-02C/PD-02Dは6-axis domain identityを参照可能。Formula、wire ID、missing representationは別Decision。
- Legacy `funnelStrength` migration、Canonical Order、他Axis Definitions、Versioning、Backend Wire IDが残る。

### Quality

- `check`: PASS（0 errors / 0 warnings）。
- `lint`: PASS（0 errors / 38 warnings）。
- `format:check`、`check:openapi`、`check:frontend-inventory`: PASS（OpenAPI 18/18、unresolved imports 0、cycles 0）。
- `test`: PASS（22 files / 257 tests）。
- `build`、`test:auth-smoke`、`test:secrets`（63 build files）、`test:smoke`: PASS。
- `quality`: PASS（exit 0）。

### References

- [PD-15 Workshop Audit](./audit/73-pd02b-funnel-axis-definition-evidence-workshop.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-14 Approval Record](./audit/72-pd02b-five-canonical-ids-explicit-approval-record.md)

## Phase PD-16 — PD-02B Funnel Axis Definition & Canonical ID Decision Review

**Status:** Completed / `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`  
**Category:** Product Definition / Canonical ID Decision Review  
**Objective:** PD-15でDecision-readyとなった「導線強度」のFormal DefinitionとCanonical IDを再評価し、Product Ownerが個別承認できるDecision Proposalとして正本化する。

### Evidence

- Production presentation、設計文書、fixture、preview/test、legacy inputは、CTA、internal links、navigation、page continuity、major path completenessをObservable Structural Supportとして支持する。
- CTR、CVR、session behavior、attribution、revenue、CRM / sales stage、off-site journey、actual outcomeを測るcanonical production formulaは確認されていない。
- Primary Evaluation Objectは`User Path / Page Sequence`であり、CTA、link、navigation、page transitionはSupporting Objectsと判断した。

### Definition Proposal

「ユーザーが次に取るべきActionを識別でき、CTA・リンク・ナビゲーション・ページ遷移によって、主要な目的地点までの経路が途切れず接続されている度合い。」を第一推奨とした。Measurement natureは`Observable Structural Support`、Behavioral PerformanceはExcludedとする。

### Canonical ID Proposal

- `userFlowQuality`: 第一推奨 / `KEEP_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`
- `funnelStrength`: canonicalとしてreject推奨。正式statusは`NOT_CANONICAL / RENAME_CANDIDATE`を維持する。
- `1 Formal Axis Identity = 1 Canonical ID` policyを維持し、legacy keyを別canonical aliasとはしない。

### Approval Status

- Product Owner Approval Evidence: `NOT_PROVIDED`
- Product Owner Decision: `NOT_PROVIDED`
- Definition: `READY_FOR_DECISION / NOT_APPROVED`
- Canonical ID: `READY_FOR_DECISION / NOT_APPROVED`
- DefinitionとIDは個別承認可能だが、本Phaseではいずれもstatus transitionなし。

### Result / Readiness

- Canonical IDs: `5 / 6 DECIDED`、overall `NEEDS_DISCOVERY`。
- PD-02B / PD-02 parent: `NEEDS_DISCOVERY`。
- Canonical Order、他5軸Definition、Versioning: `NEEDS_DISCOVERY`。Backend Wire ID: `BLOCKED`。
- Source、fixture、Svelte、Frontend Inventory、Rails、BFF、OpenAPIは変更していない。

### Dependencies / Standardization Impact

- 現時点で新たにunblockされたstandardizationはない。
- 承認後はFull 6-axis metadata、identifier type、label lookup、accessibility ID、mapping normalization、fixture migrationのplanningを追加で解禁できる。
- Formula、Backend schema / Wire ID、Missing / Partial contract、source migrationは引き続き別Decision / Phaseを要する。

### Remaining

- Definitionと`userFlowQuality`に対するProduct Owner明示承認。
- Canonical Order、他5軸Definition、Versioning、Backend Wire ID、PD-02C、PD-02D。
- 承認が得られた場合はPD-17 Explicit Product Owner Approval Recordを推奨する。代替はAdditional Analysis/Data Evidence ReviewまたはCanonical Order Discovery。

### Quality

- `check`: PASS（0 errors / 0 warnings）。
- `lint`: PASS（0 errors / 38 warnings）。
- `format:check`、`check:openapi`、`check:frontend-inventory`: PASS（OpenAPI 18/18、reusable 124、ACTIVE_CANONICAL 119、unresolved imports 0、cycles 0）。
- `test`: PASS（22 files / 257 tests）。
- `build`、`test:auth-smoke`、`test:secrets`（63 build files）、`test:smoke`: PASS。
- `quality`: PASS（exit 0）。
- 初回の独立`test:smoke`はbuildとの並列実行競合でserver output生成前に起動したため失敗。build後の直列再実行と最終`quality`ではPASSし、runtime defectではないことを確認した。

### References

- [PD-16 Decision Review Audit](./audit/74-pd02b-funnel-axis-definition-canonical-id-decision-review.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-15 Evidence Workshop](./audit/73-pd02b-funnel-axis-definition-evidence-workshop.md)

## Phase PD-17 — PD-02B Funnel Axis Explicit Product Owner Approval Record

**Status:** Completed / `APPROVED`  
**Category:** Product Decision / Explicit Approval Record  
**Objective:** PD-16でDecision-readyとなった導線強度のFormal DefinitionとCanonical ID `userFlowQuality`に対するProduct Ownerの明示承認を正式Decision Recordへ反映する。

### Product Owner Approval

- Approval Evidence: 「PD-02BのFunnel Axis Definition & Canonical ID Proposalを承認する。」
- Approval Date: 2026-08-20。
- Decision Owner: Product Owner。
- Approval Status: `APPROVED`。

### Funnel Definition Decision

- 「ユーザーが次に取るべきActionを識別でき、CTA・リンク・ナビゲーション・ページ遷移によって、主要な目的地点までの経路が途切れず接続されている度合い。」を`DECIDED`。
- Primary Evaluation Objectは`User Path / Page Sequence`、measurementは`Observable Structural Support`。Behavioral Performanceを除外。
- PD-16のIncluded / Excluded Semanticsと5 adjacent-axis boundariesを正式採用。

### Canonical ID Decision

- `userFlowQuality`: `READY_FOR_DECISION / NOT_APPROVED` → `DECIDED`。
- `funnelStrength`: `NOT_CANONICAL / RENAME_CANDIDATE / LEGACY_MIGRATION_SOURCE`。Canonical aliasにしない。
- `camelCase`と`1 Formal Axis Identity = 1 Canonical ID` policyに整合。

### Canonical ID Completion / Result

- Canonical ID count: `5 / 6 DECIDED` → `6 / 6 DECIDED`。
- Canonical ID overall: `NEEDS_DISCOVERY` → `DECIDED`。
- PD-02B / PD-02 parentは未決項目が残るため`NEEDS_DISCOVERY`を維持。
- Source、fixture、mapping、Svelte、Frontend Inventory、Rails、BFF、OpenAPIは変更していない。

### Standardization Impact / Dependencies

- 6-axis metadata、identifier type、label lookup、accessibility IDs、Self/Competitor mapping normalization、Industry alignment、Axis-aware presentation、legacy migrationのplanningを解禁。
- PD-02C/PD-02DはFormal Common 6 Axis IDsを正式参照可能。
- Formula、Weight、Aggregation、Missing / Partial、Backend schema/wire、Versioning、source migrationは引き続き別Decision / Phaseを要する。

### Remaining

- Canonical Order、他5軸Formal Definitions、Versioning、Backend Wire ID。
- 次PhaseはCanonical Order Discoveryを第一推奨。Alternative AはRemaining Five Axis Definitions Discovery、Alternative BはVersioning Discovery。

### Quality

- `check`: PASS（0 errors / 0 warnings）。
- `lint`: PASS（0 errors / 38 warnings）。
- `format:check`、`check:openapi`、`check:frontend-inventory`: PASS（OpenAPI 18/18、reusable 124、ACTIVE_CANONICAL 119、unresolved imports 0、cycles 0）。
- `test`: PASS（22 files / 257 tests）。
- `build`、`test:auth-smoke`、`test:secrets`（63 build files）、`test:smoke`: PASS。
- `quality`: PASS（exit 0）。

### References

- [PD-17 Approval Record](./audit/75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-16 Decision Review](./audit/74-pd02b-funnel-axis-definition-canonical-id-decision-review.md)

## Phase PD-18 — PD-02B Remaining Five Axis Definitions Discovery

**Status:** Completed / `DISCOVERY_COMPLETE / AWAITING_DECISION_REVIEW`  
**Category:** Product Definition Discovery  
**Objective:** Funnel以外の5 Formal Axesについて、repository evidenceからDefinition Draft、Primary Object、Included / Excluded Semantics、Observable Evidence、Adjacent Boundaries、Examples、Anti-examples、Decision Readinessを整理する。

### Evidence

- Active Self/Competitor labels、Industry/Snapshot fixture、improvement impact、design documents、historical submetricsを調査。
- Historical submetricsはsemantic evidenceに限定し、現行formula/weightとして採用していない。
- Evidenceを`OBSERVABLE_FROM_SITE`中心に分類し、actual outcome、behavior analytics、external performanceをDefinitionから除外した。

### Definition Drafts / Boundary Analysis

- `valueProposition`: Value Messaging / Proposition Communication。absolute valueとrelative differentiationを分離。
- `informationHierarchy`: Content Structure / Information Hierarchy。content order/groupingとpath/decision sufficiencyを分離。
- `trustStructure`: Trust Evidence / Credibility Structure。FAQ/caseをcontent purposeでDecision Supportと分離。
- `differentiationClarity`: Competitive Positioning / Differentiating Message。explicit/implicit uniquenessをevidence requirement付きで包含。
- `decisionSupport`: Decision Information / Decision Readiness Support。pricingをcontextual sufficiencyとし、CTA/pathとは分離。
- 6-axis Cross-Axis Boundary Matrix、Multi-Axis Evidence Policy、Primary/Supporting Evidence candidateを記録。

### Result / Readiness

- 5 Definitionsすべて個別根拠に基づき`READY_FOR_DECISION / NOT_APPROVED`。
- Examples 15件、Anti-examples 5件。
- Formal Labels / IDs、Funnel Definition、Display ContractのDECIDED状態を変更していない。
- PD-02B / PD-02は`NEEDS_DISCOVERY`を維持。

### Dependencies / Remaining

- Product Owner + Analysis/Data Ownerによる5 Definitionの個別Decision Review。
- Canonical Order、Versioning、Backend Wire ID、PD-02C Formula、PD-02D Missing / Partial。
- 次PhaseはPD-19 Remaining Five Axis Definitions Decision Reviewを推奨。Alternative AはAdditional Evidence Workshop、Alternative BはCanonical Order Discovery。
- Source、fixture、mapping、order、Frontend Inventory、Rails、BFF、OpenAPI変更なし。

### Quality

- `check`: PASS（0 errors / 0 warnings）。
- `lint`: PASS（0 errors / 38 warnings）。
- `format:check`、`check:openapi`、`check:frontend-inventory`: PASS（OpenAPI 18/18、reusable 124、ACTIVE_CANONICAL 119、unresolved imports 0、cycles 0）。
- `test`: PASS（22 files / 257 tests）。
- `build`、`test:auth-smoke`、`test:secrets`（63 build files）、`test:smoke`: PASS。
- `quality`: PASS（exit 0）。

### References

- [PD-18 Discovery Audit](./audit/76-pd02b-remaining-five-axis-definitions-discovery.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-17 Funnel Approval Record](./audit/75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)

## Phase PD-19 — PD-02B Remaining Five Axis Definitions Decision Review

**Status:** Completed / `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`  
**Category:** Product Definition Decision Review  
**Objective:** PD-18でDecision-readyとなった5 Definitionとcross-axis policiesを最終reviewし、Product Ownerが個別承認・却下・差戻しできるFinal Proposalへ正本化する。

### Evidence / Definition Proposals

- PD-18のsite-observable evidence、examples、anti-examples、boundariesを再評価。
- `valueProposition`: absolute value/problem/benefit/offer communication。
- `informationHierarchy`: information order/hierarchy/groupingのObservable Structural Quality。
- `trustStructure`: proof/authority/transparencyの提示・構成。
- `differentiationClarity`: relative distinctiveness/reason-to-choose。Supportable implicit uniquenessを許可。
- `decisionSupport`: choice/contract informationのcontextual sufficiency。Non-public pricingを自動減点しない。

### Cross-Axis Policy / Approval Status

- Value vs Differentiation、Hierarchy vs Flow/Decision、Trust vs Decision、Decision vs Flowの境界をFinal Proposal化。
- Multi-Axis Evidence PolicyとPrimary / Supporting Evidence conceptを`READY_FOR_DECISION / NOT_APPROVED`とした。Formula double counting/weightは未決定。
- FAQはcontent purposeで分類。
- Approval Evidence / Product Owner Decision: `NOT_PROVIDED`。承認文例をactual approvalとして扱っていない。

### Result / Readiness

- 5 Definitions: `READY_FOR_DECISION / NOT_APPROVED`を維持。
- Definition count: `1 / 6 DECIDED`、overall `NEEDS_DISCOVERY`。
- PD-02B / PD-02: `NEEDS_DISCOVERY`。
- Source、fixture、mapping、order、Frontend Inventory、Rails、BFF、OpenAPI変更なし。

### Dependencies / Standardization Impact / Remaining

- 明示承認後のみ6-axis definition metadata、accessible descriptions、shared dictionary、semantic mapping、evidence taxonomy planningを解禁可能。
- Canonical Order、Versioning、Backend Wire ID、PD-02C Formula、PD-02D Missing / Partialは未決定。
- 次PhaseはPD-20 Explicit Product Owner Approval Recordを推奨。Alternative AはAdditional Product/Analysis Review、Alternative BはCanonical Order Discovery。

### Quality

- `npm run quality`: PASS（exit 0）。check 0/0、ESLint 0 errors / 38 warnings、OpenAPI 18/18、Frontend Inventory unresolved imports 0 / cycles 0、22 files / 257 tests、auth smoke、build、secret scan、route smokeを通過。

### References

- [PD-19 Decision Review](./audit/77-pd02b-remaining-five-axis-definitions-decision-review.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-18 Discovery](./audit/76-pd02b-remaining-five-axis-definitions-discovery.md)

## Phase PD-20 — PD-02B Remaining Five Axis Definitions Explicit Product Owner Approval Record

**Status:** Completed / `APPROVED`  
**Category:** Product Definition / Explicit Approval Record  
**Objective:** PD-19 Final ProposalへのProduct Owner明示承認を反映し、Formal Common 6 AxisのMeaningを6 / 6正式確定する。

### Product Owner Approval

- Approval Evidence: 「PD-02BのRemaining Five Axis Definitions Proposalを承認する。」
- Approval Date: 2026-08-20。
- Decision Owner: Product Owner。
- Approval Status: `APPROVED`。

### Five Definition Decisions

- `valueProposition`、`informationHierarchy`、`trustStructure`、`differentiationClarity`、`decisionSupport`のFormal Definition、Primary Evaluation Object、Included / Excluded Semanticsを`DECIDED`。
- Funnel `userFlowQuality`はPD-17の`DECIDED`を維持。
- Definition countは`1 / 6`から`6 / 6`へ、Definition overallは`NEEDS_DISCOVERY`から`DECIDED`へ遷移。

### Cross-Axis / Evidence Policies

- Value vs Differentiation、Hierarchy vs Flow/Decision、Trust vs Decision、Decision vs Flowを`DECIDED`。PD-17 Funnel boundariesと矛盾なし。
- Multi-Axis Evidence、FAQ classification、Non-public Pricing、Explicit / Implicit Differentiation、Observable Evidence Boundaryを`DECIDED`。
- Primary / Supporting EvidenceはPD-19 Formal Approval Scopeに含まれるためconceptを`DECIDED`。Weight、required count、score contribution、thresholdは`NOT_DECIDED`。
- Formula double countingは`NOT_DECIDED`でPD-02Cへ送る。

### Result / Standardization Impact

- Formal Common 6 AxisはCanonical IDsとDefinitionsがともに`6 / 6 DECIDED`。
- Semantic metadata、help text、shared dictionary、accessible descriptions、Self/Competitor/Industry semantic alignment、evidence taxonomyのplanningを解禁。
- Source、fixture、mapping、UI、Frontend Inventory、Rails、BFF、OpenAPIは変更していない。

### Remaining / Dependencies

- Canonical Order / Versioningは`NEEDS_DISCOVERY`、Backend Wire IDは`BLOCKED`。
- PD-02B / PD-02は`NEEDS_DISCOVERY`を維持。
- PD-02CはIdentity + Meaningを参照可能だがBackend Contract dependencyの`BLOCKED`を維持。
- PD-02Dは6 Axis semantic contractを参照可能だがMissing / Partial Contractの`BLOCKED`を維持。
- 次PhaseはPD-21 PD-02B Canonical Order Discoveryを推奨。Alternative AはVersioning Discovery、Alternative BはPD-02C dependency review。

### Quality

- `npm run quality`: PASS（exit 0）。check 0/0、ESLint 0 errors / 38 warnings、OpenAPI 18/18、Frontend Inventory unresolved imports 0 / cycles 0、22 files / 257 tests、auth smoke、build、63-file secret scan、10-route smokeを通過。

### References

- [PD-20 Approval Record](./audit/78-pd02b-remaining-five-axis-definitions-explicit-approval-record.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-19 Decision Review](./audit/77-pd02b-remaining-five-axis-definitions-decision-review.md)
- [PD-17 Funnel Approval Record](./audit/75-pd02b-funnel-axis-explicit-product-owner-approval-record.md)

## Phase PD-21 — PD-02B Canonical Order Discovery

**Status:** Completed / `DISCOVERY_COMPLETE / AWAITING_DECISION_REVIEW`  
**Category:** Product Decision Discovery / Axis Order  
**Objective:** Canonical Orderが必要か、必要なら何のOrderかを定義し、existing variants、candidate models、override、Radar / Snapshot / accessibility / documentation impactをDecision-readyにする。

### Evidence / Existing Orders

- Historical Product / PD-20 docsはvalue → information → flow → trust → differentiation → decision。
- Active Self / Competitorとpreview Industryはvalue → flow → differentiation → information → trust → decision。
- Industry seedは別fixture順、mock snapshot factoryは別mock順で、いずれもrationaleはunknown。
- Active UIの一致は確認したが、Product rationaleは記録されていない。

### Order Semantics / Candidate Models

- Domain、UI、Analysis Processing、Evidence Collection、User Decision Journey、Storytellingを分離。
- Canonical Orderは`DOMAIN_CONCEPTUAL_ORDER` / default representational orderを推奨。
- Candidate A（value → information → flow → trust → differentiation → decision）を第一推奨。
- Candidate B Journey、C Information-to-Action、D Structural First、E Existing UIを比較し、causal / journey / processing meaningをcanonicalへ持たせない。

### Result / Readiness

- Necessity: `YES_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`。
- Semantics: `DOMAIN_CONCEPTUAL_ORDER / READY_FOR_DECISION / NOT_APPROVED`。
- Candidate A: `READY_FOR_DECISION / NOT_APPROVED`。
- Override: OP-B Domain default + explicit reason/owner付きfeature overrideを`READY_FOR_DECISION / NOT_APPROVED`。
- Metadataはordered Canonical ID listをsingle sourceとし、numeric orderの重複を避けるProposal。

### Dependencies / Remaining

- Radar orderはpolygon perceptionへ影響。Candidate採用時はvisual regressionとcomparison alignmentが必要。
- Snapshot radarにCanonical ID / order versionがなく、`SNAPSHOT_ORDER_LINEAGE_UNKNOWN`。
- Formula / Backend / MissingはpositionでなくCanonical IDへ紐付けるProposal。
- Canonical Order / Versioning、PD-02B / PD-02は`NEEDS_DISCOVERY`、Backend Wire ID / PD-02C / PD-02Dは`BLOCKED`。
- Source、fixture、arrays、Radar、mapping、Frontend Inventory、Rails、BFF、OpenAPI変更なし。
- 次PhaseはPD-22 Canonical Order Decision Review。Alternative AはSnapshot Order Lineage Evidence Workshop、Alternative BはVersioning Discovery。

### Quality

- `npm run quality`: PASS（exit 0）。check 0/0、ESLint 0 errors / 38 warnings、OpenAPI 18/18、Frontend Inventory unresolved imports 0 / cycles 0、22 files / 257 tests、auth smoke、build、63-file secret scan、10-route smokeを通過。

### References

- [PD-21 Discovery Audit](./audit/79-pd02b-canonical-order-discovery.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-20 Approval Record](./audit/78-pd02b-remaining-five-axis-definitions-explicit-approval-record.md)
- [PD-8 Axis Identity Discovery](./audit/66-pd02b-canonical-axis-identity-discovery.md)

## Phase PD-22 — PD-02B Canonical Order Decision Review

**Status:** Completed / `REVIEWED / AWAITING_PRODUCT_OWNER_APPROVAL`  
**Category:** Product Decision Review / Axis Order  
**Objective:** PD-21でDecision-readyとなったCanonical Order Proposalを最終reviewし、Product OwnerがNecessity、Semantics、Candidate A、OP-B、OM-Bを個別判断できる正本へ固定する。

### Evidence / Canonical Order Proposal

- PD-21のOrder taxonomy、Repository order variants、Candidate A–E、active UI baseline、Radar / Snapshot影響を再評価。
- Necessity=`YES`、Semantics=`DOMAIN_CONCEPTUAL_ORDER`、Order=Candidate AをFinal Proposalとした。
- Candidate Aは`valueProposition → informationHierarchy → userFlowQuality → trustStructure → differentiationClarity → decisionSupport`。
- Candidate BはJourney-specific、CはStorytelling寄りの代替、DはAnalysis-firstで非推奨、EはCurrent UI baselineとして保持。

### Order Boundaries / Override Policy

- Canonical Orderはimportance、priority、weight、causality、maturity、journey、mandatory UI、processing、collection、Backend position、rankingを意味しない。
- UI、Journey、Formula、Processing、Evidence Collection、BackendとのBoundaryをFinal Proposal化。
- OP-B Domain default + explicit feature overrideを推奨。reason、owner、configuration、affected feature、accessibility、comparison、review/removal criteriaを要求する。
- OM-B ordered Canonical ID listをsingle source of truthとし、numeric orderとの二重正本を避ける。

### Approval Status / Result

- Product Owner本人のApproval Evidenceは`NOT_PROVIDED`。
- Necessity、Semantics、Candidate A、OP-B、OM-B、Radar Comparabilityは`READY_FOR_DECISION / NOT_APPROVED`。
- Canonical Order / PD-02B / PD-02は`NEEDS_DISCOVERY`、Versioningは`NEEDS_DISCOVERY`、Backend Wire ID / PD-02C / PD-02Dは`BLOCKED`を維持。
- Documentation / Decision Reviewのみ。Source、array、Radar、fixture、mapping、metadata、TypeScript、Svelte、UI、CSS、Tailwind、Rails、BFF、OpenAPI、Formula変更なし。

### Dependencies / Remaining

- Product Ownerによる個別明示承認。
- Radar Comparability Policy、Snapshot Order Lineage、Order Versioning、Backend Wire ID、PD-02C、PD-02D。
- 明示承認後のみPD-23 Explicit Product Owner Approval Recordを推奨。代替AはSnapshot Order Lineage Evidence Workshop、代替BはVersioning Discovery。

### Quality

- `npm run quality`: PASS（exit 0）。check 0/0、ESLint 0 errors / 38 warnings、OpenAPI 18/18、Frontend Inventory unresolved imports 0 / cycles 0、22 files / 257 tests、auth smoke 5 cases、build、63-file secret scan、10-route smokeを通過。

### References

- [PD-22 Decision Review](./audit/80-pd02b-canonical-order-decision-review.md)
- [PD-21 Discovery](./audit/79-pd02b-canonical-order-discovery.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-23 — PD-02B Canonical Order Explicit Product Owner Approval Record

**Status:** Completed / `APPROVED / DECIDED`  
**Category:** Product Decision / Explicit Approval Record  
**Objective:** PD-22 Final ProposalへのProduct Owner明示承認を反映し、Canonical Order Contractを正式確定する。

### Product Owner Approval / Canonical Order Decision

- Approval Evidence: 「PD-02BのCanonical Order Proposalを承認する。」
- Approval Date: 2026-08-20。Decision Owner: Product Owner。
- Necessity=`YES / DECIDED`、Semantics=`DOMAIN_CONCEPTUAL_ORDER / DECIDED`。
- Candidate A `valueProposition → informationHierarchy → userFlowQuality → trustStructure → differentiationClarity → decisionSupport`を正式採用。

### Semantics / Non-Meaning / Boundaries

- Canonical OrderをProduct Domain上のstandard conceptual orderingとし、importance、priority、weight、ranking、causality、maturity、journey、mandatory UI、processing、collection、Backend positionを意味しない契約を`DECIDED`。
- 6 Axesのindependence、UI非強制、Journey非同一、Formula ID-based、Processing / Evidence Collection独立、Backend position非依存を`DECIDED`。
- Current Self / Competitor / preview Industry UIは変更せず、Canonical Order approvalとUI migrationを分離。

### Override / Metadata / Result

- OP-B Domain default + explicit feature overrideを`DECIDED`。reason、owner、configuration、UX/Product rationale、accessibility、comparison、review/removal criteriaを要求。
- OM-B ordered Canonical ID list as single source of truthとnumeric order非二重正本化を`DECIDED`。
- Documentation default-order policyとAccessibility Boundaryを`DECIDED`。
- Canonical Order overallは`NEEDS_DISCOVERY`から`DECIDED`へ移行。
- PD-22でApproval Scope外に分離されたRadar Comparabilityは`READY_FOR_DECISION / NOT_APPROVED`を維持。

### Standardization Impact / Dependencies / Remaining

- canonicalAxisOrder design、documentation normalization、metadata/order model、explicit override schema、order-aware test/fixture、accessibility/Radar migration assessmentのplanningを解禁。
- Source order / Radar / Snapshot migration、Versioning implementation、Formula、Weight、Threshold、Missing / Partial、Backend Wire/schemaは未解禁。
- Snapshot Lineage=`UNKNOWN`、Order Versioning=`NEEDS_DISCOVERY`、Backend Wire ID / PD-02C / PD-02D=`BLOCKED`、PD-02B / PD-02=`NEEDS_DISCOVERY`。
- 次PhaseはPD-24 Snapshot Order Lineage Evidence Workshop、その後PD-25 Axis / Order Versioning Discoveryを第一候補とする。
- Documentation / Decision Recordのみ。Source、array、Radar、fixture、mapping、metadata、TypeScript、Svelte、UI、CSS、Tailwind、Rails、BFF、OpenAPI、Formula変更なし。

### Quality

- `npm run quality`: PASS（exit 0）。check 0/0、ESLint 0 errors / 38 warnings、OpenAPI 18/18、Frontend Inventory unresolved imports 0 / cycles 0、22 files / 257 tests、auth smoke 5 cases、build、63-file secret scan、10-route smokeを通過。

### References

- [PD-23 Approval Record](./audit/81-pd02b-canonical-order-explicit-product-owner-approval-record.md)
- [PD-22 Decision Review](./audit/80-pd02b-canonical-order-decision-review.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-24 — PD-02B Snapshot Order Lineage Evidence Workshop

**Status:** Completed / `EVIDENCE_COMPLETE / NO_PRODUCT_DECISION`  
**Category:** Product Evidence / Snapshot Lineage  
**Objective:** Canonical Orderをsourceへ導入する前に、SnapshotがAxis identity、Axis order、Axis meaningをどこで保存・再構築・表示するかを追跡し、historical compatibilityとVersioning readinessを判定する。

### Evidence / Snapshot Persistence

- Production presentation payload、current / last stable state、dev mock、dummy/preview、draft OpenAPI、legacy docs、planned screenshot artifactを区別した。
- Canonical production Snapshot persistenceは`NOT_IMPLEMENTED`。Rails schema/routesとcanonical BFF business clientにSnapshot implementationはない。
- dev mockのみbrowser localStorage `panoptes.mock.v3_3.state`へFrontend-shaped JSONを保存し、SSRはmodule memoryを使う。FixtureをPersistence Contractへ昇格していない。

### Axis / Order Lineage / Radar Impact

- Self / Industry mockはCanonical IDなしのJapanese label-bearing ordered arrayで、array orderを暗黙保存する。
- Competitor snapshotはaggregate scoreのみを持ち、固定label orderとaggregate-derived pointsをruntimeで再構築する。
- Self / Competitor Radarはいずれもitem indexからpolar coordinatesを決める。Canonical Orderとcurrent active orderの差はpolygon shapeを変える。
- `funnelStrength`はdummy/preview named fieldとして残るが、canonical production Snapshotへ永続化されたEvidenceはない。

### Compatibility Risk / Result

- Snapshot Order Lineageを`SNAPSHOT_ORDER_LINEAGE_UNKNOWN`から`KNOWN_PARTIALLY_ORDER_SENSITIVE / OLC-F MIXED`へ更新した。
- Compatibility Riskは`HIGH`。index geometry、label identity、alternate/short labels、legacy key、explicit version不在、feature間の方式混在が根拠である。
- Production database recordは未実装のため、現存production historyの破損を主張していない。
- Axis/Order用version metadataはなく、Formula LineageとDefinition Lineageは`NOT_TRACEABLE`。

### Versioning Readiness / Dependencies

- Axis / Order Versioning Discoveryは`PARTIALLY_READY`。PD-25は開始可能だが、formal persistence design / implementationはBackend Contractにblockedされる。
- Immutable Historical Interpretation PrincipleとRadar Comparabilityは`READY_FOR_DECISION / NOT_APPROVED`。Product Decisionへ昇格していない。
- PD-02B / PD-02=`NEEDS_DISCOVERY`、Backend Wire ID / PD-02C / PD-02D=`BLOCKED`を維持した。
- Minimum metadata candidatesはschema、axis set、definition、canonical order、formula version、timestamp、present/missing axes、completeness。必須項目は未決定。

### Remaining

- OPERSIST option、version semantics、migration policy、Radar Comparability、Immutable Historical Interpretation PrincipleのProduct review。
- Rails/business backend Snapshot schema、BFF mapping、organization scope、partial completeness、formula provenanceの契約化。
- 次PhaseはPD-25 Axis / Order Versioning Discovery。Alternative AはBackend Snapshot Contract Discovery、Alternative BはRadar Comparability Decision Review。
- Documentation / Evidenceのみ。Source、Snapshot schema、metadata、migration、mapper、Radar、array、fixture、TypeScript、Svelte、Rails、BFF、OpenAPI、Database、Formula変更なし。

### References

- [PD-24 Evidence Workshop](./audit/82-pd02b-snapshot-order-lineage-evidence-workshop.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-23 Approval Record](./audit/81-pd02b-canonical-order-explicit-product-owner-approval-record.md)

## Phase PD-25 — PD-02B Axis / Order Versioning Discovery

**Status:** Completed / `DISCOVERY_COMPLETE / DECISION_READY / NOT_APPROVED`  
**Category:** Product / Domain Contract Discovery  
**Objective:** Formal Common 6 Axisについてversion対象、breaking/non-breaking change、historical interpretation、compatibility/migration、Product/Backend ownershipを分離し、Product Ownerが判断できるProposalへ整理する。

### Evidence / Version Taxonomy

- PD-24の`KNOWN_PARTIALLY_ORDER_SENSITIVE / OLC-F MIXED`、`HIGH` risk、production persistence未実装、explicit version metadata不在を入力にした。
- Set、Identity、Definition、Canonical Order、Formula、Snapshot Schema、Backend Contract、Analysis Pipelineを8 version domainsへ分離した。
- V-1 Singleは責務混同、V-2 Fully Granularはcoordination/metadata過剰と評価し、V-3 Hybridを推奨Proposalとした。

### Compatibility / Historical Interpretation

- Immutable `axisContractVersion`へAxis semantic contractをまとめ、Formula、Snapshot Schema、Analysis Pipeline、actual order profile、Backend Contractを分離する。
- Published version immutableと`DRAFT → ACTIVE → DEPRECATED → RETIRED` lifecycleをProposal化した。
- Immutable Historical Interpretationは`READY_FOR_DECISION / NOT_APPROVED`。Current stylingとcurrent semanticsを分離する。
- Current decided 6-axis contractは`PRODUCT_CONTRACT_V1_CANDIDATE / READY_FOR_DECISION / NOT_APPROVED`であり正式発行していない。

### Migration Model / Radar

- `funnelStrength`、Japanese/short labels、positional arraysをknown source/schema/order profile限定のread compatibility mapping候補とした。
- `LEGACY_UI_ORDER_V1`はmigration-only profile候補でありFormal Canonical Orderではない。
- Historical Radarは生成時order、cross-Snapshot comparisonはCanonical ID alignment + 同一明示orderを推奨した。
- Snapshot policyは`STRICT_SEMANTICS / CURRENT_PRESENTATION`、Radar Comparabilityは`READY_FOR_DECISION / NOT_APPROVED`。

### Result / Readiness / Dependencies

- Versioningを`PARTIALLY_READY`から`DECISION_READY / NOT_APPROVED`へ更新した。Implementation readinessではない。
- Formula/Schema separation、Order Profile、Published immutability、Compatibility Policy、Current Contract v1はいずれも`READY_FOR_DECISION / NOT_APPROVED`。
- Backend WireはPD-02C ownershipへのhandoffを推奨するが、明示Decisionまで`BLOCKED`維持。
- PD-02B close readinessは`DECISION_READY / NOT_APPROVED`。PD-02B / PD-02=`NEEDS_DISCOVERY`、PD-02C / PD-02D=`BLOCKED`維持。

### Remaining

- Product Ownerによる18 questionsとApproval Scopeのreview。
- Version registry/fields、Snapshot schema、Backend wire/DB/BFF、migration execution、Formula/Pipeline registry、PD-02D completeness、Radar implementation。
- 次PhaseはPD-26 Axis / Order Versioning Decision Review。Alternative AはBackend Snapshot Contract Discovery、Alternative BはRadar Comparability Decision Review。
- Documentation / Discoveryのみ。Source、Version field、Snapshot schema、mapper、Radar、TypeScript、Rails、BFF、OpenAPI、Database、Formula変更なし。

### References

- [PD-25 Versioning Discovery](./audit/83-pd02b-axis-order-versioning-discovery.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-24 Snapshot Lineage Workshop](./audit/82-pd02b-snapshot-order-lineage-evidence-workshop.md)

## Phase PD-26 — PD-02B Axis / Order Versioning Decision Review

**Status:** Completed / `REVIEWED / READY_FOR_DECISION / NOT_APPROVED`  
**Category:** Product Decision Review / Versioning  
**Objective:** PD-25のHybrid Versioning Proposalを最終Reviewし、17 Decision対象、Approval Scope、Backend handoff、PD-02B Close CriteriaをProduct Ownerが個別判断できる状態へ確定する。

### Evidence / Versioning Proposal

- Snapshot lineage=`KNOWN_PARTIALLY_ORDER_SENSITIVE / OLC-F MIXED`、risk=`HIGH`、production persistence未実装を前提にReviewした。
- Axis Contract、Formula、Snapshot Schema、Pipeline、actual Order Profile、Backend Contractを分離するHybridをFinal Proposalとした。
- Axis Contract scope、positive integer identifier、published immutability、lifecycle、Current Contract v1をApproval Scopeへ確定した。

### Historical Interpretation / Compatibility

- Historical resultをfuture Definition/Order/Formula/Pipelineで暗黙再解釈せず、current stylingとhistorical semanticsを分離するProposalを維持した。
- Compatibility Classes、change taxonomy、cross-version comparison、`STRICT_SEMANTICS / CURRENT_PRESENTATION`をFinal Proposal化した。
- Radar ComparabilityはHIGH riskとactual Order Profileへ直接関係するためApproval ScopeとPD-02B Close Criteriaへ含めた。

### Migration / Backend Boundary

- Known schema/identity/orderだけautomatic mappingし、unknown/ambiguous dataをguessしない。
- `funnelStrength`、Japanese/short labels、positional arrays、`LEGACY_UI_ORDER_V1`のmigration-only rulesをReviewした。
- Backend Wire ownershipはPD-02C handoffを推奨し、implementationは`BLOCKED`を維持した。

### Approval Status / Result / Close Readiness

- Product Owner Approval Evidenceは`NOT_PROVIDED`、Decision OwnerはProduct Owner、Approval Dateは未記録。
- 17 Decision対象はすべて`READY_FOR_DECISION / NOT_APPROVED`。個別承認・却下・差戻しを許可する。
- Versioning overall=`REVIEWED / READY_FOR_DECISION / NOT_APPROVED`。
- PD-02B close readiness=`DECISION_READY / BLOCKED_BY_PRODUCT_OWNER_APPROVAL`。PD-02B / PD-02=`NEEDS_DISCOVERY`、PD-02C / PD-02D=`BLOCKED`。

### Dependencies / Remaining

- Product Owner本人の明示承認文、Decision Owner/Date record、PD-27 Approval Record。
- Version registry/fields、Snapshot/Backend schema、migration/Radar実装、Formula contents、PD-02D completeness。
- Documentation / Decision Reviewのみ。Version constants、Snapshot/DB schema、mapper、Radar、Formula、TypeScript、Svelte、Rails、BFF、OpenAPI変更なし。

### References

- [PD-26 Decision Review](./audit/84-pd02b-axis-order-versioning-decision-review.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-25 Versioning Discovery](./audit/83-pd02b-axis-order-versioning-discovery.md)

## Phase PD-27 — PD-02B Axis / Order Versioning Explicit Product Owner Approval Record

**Status:** Completed / `APPROVED / DECIDED / COMPLETE`  
**Category:** Product Decision Approval / Versioning  
**Objective:** Product Ownerの明示承認を記録し、PD-26の17 Decision対象、Axis Contract v1、Backend Wire handoff、Radar Comparability、PD-02B closeを正式確定する。

### Approval / Decisions

- Approval Evidence「PD-02BのAxis / Order Versioning Proposalを承認する。」を2026-08-21、Decision Owner=Product Ownerとして記録した。
- Immutable Historical Interpretation、Hybrid Version Architecture、Axis Contract scope/order、Formula/Schema/Pipeline separation、identifier/immutability/lifecycleを`DECIDED`とした。
- Current Formal Common 6 Axis semantic contractを`Axis Contract v1 / ACTIVE`とした。Formula、Snapshot Schema、Pipeline、Backend Wireはscope外である。

### Compatibility / Handoff / Result

- Compatibility/Migration rules、`STRICT_SEMANTICS / CURRENT_PRESENTATION`、Radar Comparabilityを`DECIDED`とした。
- Backend Wire/DB/API fields、registry/persistence/validation、mapper implementationをPD-02C / Backendへ正式handoffした。
- Versioning overall=`DECIDED`、PD-02B=`DECIDED / COMPLETE`。親PD-02=`NEEDS_DISCOVERY`、PD-02C / PD-02D=`BLOCKED`を維持した。

### Deferred / Remaining

- 次はPD-02C Score Formula / Backend Contract Discoveryを推奨する。PD-02D Missing / Partial Score Contractも未決定である。
- Documentation only。Version constants、Snapshot/DB schema、mapper、Radar、Formula、TypeScript、Svelte、Rails、BFF、OpenAPI変更なし。
- 指示どおりfull quality gateは再実行せず、Phase PD-26の既存baselineを維持した。

### References

- [PD-27 Approval Record](./audit/85-pd02b-axis-order-versioning-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-26 Decision Review](./audit/84-pd02b-axis-order-versioning-decision-review.md)

## Phase PD-28 — PD-02C Score Formula / Backend Contract Discovery

**Status:** Completed / `DISCOVERY_COMPLETE / NEEDS_DISCOVERY`  
**Category:** Product Decision Discovery / Formula / Backend Contract  
**Objective:** Axis Contract v1を入力に、現行Formula evidence、score hierarchy、formulaVersion、Backend requirement、historical comparability、PD-02D境界を整理する。

### Evidence / Findings

- Formula Source of Truthは`MIXED`。Formula Spec / Display MappingのDocumentation候補、mock/fixture値、presentation heuristicが併存し、承認・実装済み正本はない。
- Axis Formulaはatomic evidence/submetric→Axis score chainが`NOT_CONFIRMED`のため`NEEDS_DISCOVERY`。Overall 0.55/0.45 confidence-adjusted fusion候補は`READY_FOR_DECISION`。
- Current Snapshotにformula/axis/pipeline versionとcalculation provenanceはなく、Historical Comparabilityは`UNKNOWN / NOT_VERIFIABLE`。

### Backend / Status / Remaining

- Canonical ID-based mapping、raw/normalized/layer/overall、version lineage、provenance、completeness hookをBackend requirement候補とした。具体schemaは未決定。
- Backend Wireは`READY_FOR_BACKEND_DISCOVERY`。PD-02Cのownership blockerを解除して`NEEDS_DISCOVERY`へ移し、PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`を維持した。
- 次はAxis Formula / Submetric Evidence Workshopを推奨する。Missing/Partial aggregationはPD-02Dへhandoffする。
- Documentation only。Formula、Weight、Threshold、Normalization、TypeScript、Svelte、Rails、BFF、OpenAPI変更なし。Full quality gateは再実行していない。

### References

- [PD-28 Discovery Audit](./audit/86-pd02c-score-formula-backend-contract-discovery.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-27 Approval Record](./audit/85-pd02b-axis-order-versioning-explicit-product-owner-approval-record.md)

## Phase PD-29 — PD-02C Axis Formula / Submetric Evidence Workshop

**Status:** Completed / `EVIDENCE_WORKSHOP_COMPLETE / NEEDS_MORE_EVIDENCE`  
**Category:** Product Decision Evidence Workshop / Formula  
**Objective:** Axis Contract v1の6軸についてObservable Evidence、Atomic Observation、Submetric候補、measurement nature、overlap、Formula readinessを整理する。

### Findings

- Production crawler / Observation Output Contractは未実装。Archiveのcrawler/submetricsは`LEGACY / DOCUMENTED_CANDIDATE`として参照した。
- Value、Hierarchy、Flow、Trustは`READY_FOR_FORMULA_DISCOVERY`。DifferentiationとDecision Supportはsemantic/context calibration不足で`NEEDS_MORE_EVIDENCE`。
- Formula Spec compatibilityは`PARTIALLY_SUPPORTED`。Axis weights/layer方向はあるがAtomic→Submetric→Axis derivationはない。
- Evidence reuse=`ALLOWED`、Semantic aspect=`MUST_BE_SEPARATED`を維持し、Navigation、case、comparison/pricing、FAQのownershipをpurpose別に整理した。

### Result / Remaining

- Axis Formula overall=`NEEDS_MORE_EVIDENCE`。PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Backend Wire=`READY_FOR_BACKEND_DISCOVERY`。
- Backend requirementへAxis/Submetric identity、atomic provenance、layer、scope/coverage、pipeline version、semantic aspect、link/path metadata、completeness hookを追加した。
- 次はDifferentiation / Decision Support Evidence Calibration Workshopを推奨する。
- Documentation only。Formula、Weight、Threshold、Normalization、TypeScript、Svelte、Rails、BFF、OpenAPI変更なし。Full quality gateは再実行していない。

### References

- [PD-29 Workshop Audit](./audit/87-pd02c-axis-formula-submetric-evidence-workshop.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-28 Discovery](./audit/86-pd02c-score-formula-backend-contract-discovery.md)

## Phase PD-30 — PD-02C Differentiation / Decision Support Evidence Calibration Workshop

**Status:** Completed / `CALIBRATION_COMPLETE / READY_FOR_FORMULA_DISCOVERY`  
**Category:** Product Decision Evidence Calibration / Formula  
**Objective:** Generic/Distinctive boundaryとContext-dependent Decision Information、Non-public Pricing、deterministic/semantic splitをCalibrationし、残る2軸のFormula Discovery readinessを判定する。

### Findings / Result

- Differentiationはcontrast、specificity、approach、reason-to-choose、supportでGeneric claimと分離し、Explicit/Implicitと4 Strength候補を整理した。`READY_FOR_FORMULA_DISCOVERY`。
- Decision Supportはsales motion別Context Profile、Pricing Case A/B/C、代替Decision Information、6 Submetric候補を整理した。`READY_FOR_FORMULA_DISCOVERY`。
- Deterministic observationとsemantic judgmentを分離し、versioned provenance、Context、ApplicabilityをBackend requirementへ追加した。
- Axis Formula overallを`NEEDS_MORE_EVIDENCE`から`READY_FOR_FORMULA_DISCOVERY`へ更新した。PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。

### Remaining / Handoff

- PD-02Dへ`REQUIRED / OPTIONAL / NOT_APPLICABLE / UNKNOWN`、Non-public Pricing Case A/B/C、absent/not-applicable、partial coverage、unknown Contextをhandoffした。
- 次はObservation Output Contract Discoveryを推奨する。Exact Formula、Weight、Threshold、Eligibility、Backend schemaは未決定。
- Documentation only。TypeScript、Svelte、Rails、BFF、OpenAPI変更なし。Full quality gateは再実行していない。

### References

- [PD-30 Calibration Audit](./audit/88-pd02c-differentiation-decision-support-evidence-calibration.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-29 Workshop](./audit/87-pd02c-axis-formula-submetric-evidence-workshop.md)

## Phase PD-31 — PD-02C Observation Output Contract Discovery

**Status:** Completed / `DISCOVERY_COMPLETE / READY_FOR_DECISION`  
**Category:** Product / Backend Contract Discovery  
**Objective:** Atomic ObservationからAxis Formulaへ渡すidentity、value、layer、scope、provenance、coverage/completeness、confidence、lineage、Worker/Backend境界をv1 Candidateとして整理する。

### Findings / Contract Candidate

- Existing stateは`DOCUMENTED_CANDIDATE + MOCK / NOT_IMPLEMENTED_CANONICAL_CONTRACT`。現行mockはObservationを経ずfinal Snapshotを生成し、OpenAPI/Railsにcanonical schema/persistenceはない。
- Instance/definition identity、Axis/Submetric/Semantic mapping、Evidence/derived references、typed value、measurement/layer/scope/source、provenance、quality、version lineageを最小構造候補とした。
- BOOLEAN/COUNT/RATIO/ENUM/TEXT/SEMANTIC_CLASSIFICATION/STRUCTURED、Internal/Visual、8 scope typesを整理した。
- Completeness 5状態でzero/unobserved/N/Aを分離し、semantic confidence、Multi-Axis reuse、Layer別dedup referencesを候補化した。
- Formula Versionはpre-formula Observationへ持たせず、Axis Contract / Pipeline / Observation Schema lineageを要求候補とした。

### Result / Remaining

- Python WorkerとRails/Backendの責務候補、current architectureとの差分を記録した。
- Observation Output Contract=`READY_FOR_DECISION`、Axis Formula=`READY_FOR_FORMULA_DISCOVERY`、PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- 次はObservation Output Contract Decision Reviewを推奨する。Formula、JSON Schema、DB/API fields、Dedup Algorithmは未決定。
- Documentation only。TypeScript、Svelte、Python Worker、Rails、BFF、OpenAPI変更なし。Full quality gateは再実行していない。

### References

- [PD-31 Discovery Audit](./audit/89-pd02c-observation-output-contract-discovery.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-30 Calibration](./audit/88-pd02c-differentiation-decision-support-evidence-calibration.md)

## Phase PD-32 — PD-02C Observation Output Contract Decision Review

**Status:** Completed / `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`  
**Category:** Product / Technical Contract Decision Review  
**Objective:** PD-31 v1 Candidateを個別reviewし、DECIDE NOW / KEEP AS CANDIDATE / DEFER / REJECTとApproval Scopeを確定する。

### Review / Proposal

- Instance/Definition identity、Core fields、8 Value Types、DETERMINISTIC/SEMANTIC、INTERNAL/VISUAL、8 Scopes、conditional provenanceをFinal Proposal化した。
- Coverage availability、Completeness 5 states、semantic confidence、Multi-Axis Evidence、dedup-capable references、3 version lineagesをreviewした。
- HYBRID、standalone LABEL、pre-formula Formula Version、ObservationとしてのSnapshot Schema Version、CrawlerへのAI責務混在をv1からrejectした。
- Python Crawler/Capture、Vision/Semantic Analysis、Rails/Backend、Frontend/BFFのlogical responsibilityを分離した。

### Status / Remaining

- Approval Evidenceは未提供。Observation Contract=`READY_FOR_APPROVAL / NOT_APPROVED`、Axis Formula=`READY_FOR_FORMULA_DISCOVERY`。
- PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`を維持した。
- Formula、Missing/Partial treatment、exact JSON/DB/OpenAPI、Dedup Algorithm、confidence calibration、Worker/Rails implementationをdeferした。
- 次はExplicit Approval Recordを推奨する。Documentation onlyで、source/full quality gate変更なし。

### References

- [PD-32 Decision Review](./audit/90-pd02c-observation-output-contract-decision-review.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-31 Discovery](./audit/89-pd02c-observation-output-contract-discovery.md)

## Phase PD-33 — PD-02C Observation Output Contract Explicit Product Owner Approval Record

**Status:** Completed / `DECIDED / APPROVED`  
**Category:** Product / Technical Contract Approval Record  
**Objective:** Product Ownerの明示承認をEvidenceとして記録し、PD-32 Observation Output Contract v1 Final Proposalを正式契約へ昇格する。

### Changes / Result

- Product Ownerの承認文、Decision Owner、Approval Dateを監査記録へ固定した。
- Observation Output Contractを`v1 / APPROVED CONTRACT`とし、identity、8 Value Types、measurement/layer、provenance、8 Scopes、5 Completeness states、version lineage、logical responsibility boundaryを承認済みとして同期した。
- Implementationは`NOT_IMPLEMENTED`。Source、Rails、OpenAPI変更およびfull quality gate実行は行っていない。

### Decisions / Deferred

- Observation Contract=`DECIDED / APPROVED`、Axis Formula=`READY_FOR_FORMULA_DISCOVERY`。
- PD-02C / PD-02 parent=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`を維持した。
- Formula、aggregation、Internal/Visual contribution、Formula Version/provenance、Backend Wire/DB/OpenAPI、scoring/calibration/dedup、Worker/Rails実装は未決定・未実装である。
- 次はPD-34候補としてAxis Formula Candidate Discoveryを推奨する。

### References

- [PD-33 Explicit Approval Record](./audit/91-pd02c-observation-output-contract-explicit-product-owner-approval-record.md)
- [PD-32 Decision Review](./audit/90-pd02c-observation-output-contract-decision-review.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-34 — PD-02C Axis Formula Candidate Discovery

**Status:** Completed / `DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`  
**Category:** Product / Formula Architecture Discovery  
**Objective:** 承認済みObservation Contractを入力に、Atomic→Submetric→Axis→Layer→OverallのFormula候補をDecision Review可能な粒度へ整理する。

### Changes / Result

- type-specific Atomic aggregation、Submetric normalization、5つのAxis aggregation model、Layer/Overall fusion候補を比較した。
- Layer-first Common Core + Axis-specific versioned profilesを推奨Candidateとし、Layer-first eligibility-aware baselineをinitial default/fallback候補とした。
- confidence/coverage、Semantic/Deterministic、Multi-Axis、Formula provenance/version、Backend handoffの境界を整理した。

### Decisions / Deferred

- Axis Formula Candidate=`READY_FOR_DECISION_REVIEW`。PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- Exact Weight/Threshold/Normalization Parameter/Internal-Visual ratio、Missing/Partial処理、confidence calibration、dedup、DB/OpenAPI、Worker/Rails実装は未決定・未実装。
- Documentation-only。Source変更とfull quality gate実行は行っていない。

### References

- [PD-34 Formula Candidate Discovery](./audit/92-pd02c-axis-formula-candidate-discovery.md)
- [PD-33 Observation Contract Approval](./audit/91-pd02c-observation-output-contract-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-35 — PD-02C Axis Formula Architecture Decision Review

**Status:** Completed / `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`  
**Category:** Product / Formula Architecture Decision Review  
**Objective:** PD-34 Candidate Cを中心にFormula Architecture原則をreviewし、Product Owner承認可能なFinal Proposalへ整理する。

### Review / Result

- Layer-first Common Core + Axis-specific Versioned ProfilesをFinal Candidateとした。
- Candidate AをC内のdefault/fallback profile候補、Candidate Bをv1 Architectureとしてrejectした。
- normalization/eligibility、Layer/late fusion、confidence/coverage、Semantic/Deterministic、explainability、provenance、Formula Version boundaryをDECIDE/KEEP/DEFER/REJECTへ分類した。

### Status / Remaining

- Axis Formula Architecture=`READY_FOR_APPROVAL / NOT_APPROVED`。Approval Evidenceは未提供。
- PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Implementation=`NOT_IMPLEMENTED`。
- Exact Formula/parameter、Missing/Partial、confidence calibration、dedup、DB/OpenAPI、Rails/Worker実装はdeferした。
- Documentation-only。Source変更とfull quality gate実行は行っていない。

### References

- [PD-35 Architecture Decision Review](./audit/93-pd02c-axis-formula-architecture-decision-review.md)
- [PD-34 Candidate Discovery](./audit/92-pd02c-axis-formula-candidate-discovery.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-36 — PD-02C Axis Formula Architecture Explicit Product Owner Approval Record

**Status:** Completed / `DECIDED / APPROVED`  
**Category:** Product / Formula Architecture Approval Record  
**Objective:** Product Ownerの明示承認を記録し、PD-35 Candidate Cを正式Architectureへ昇格する。

### Approval / Result

- Approval Evidence「PD-02CのAxis Formula Architecture Proposal（Candidate C）を承認する。」を2026-08-24、Decision Owner=Product Ownerとして記録した。
- Candidate C Layer-first Common Core + Axis-specific Versioned Profilesを`APPROVED ARCHITECTURE`とした。
- Candidate A=`KEEP AS PROFILE CANDIDATE`、Candidate B=`REJECTED FOR V1`を同期した。

### Status / Remaining

- Axis Formula Architecture=`DECIDED / APPROVED`。Implementation=`NOT_IMPLEMENTED`、Exact Formula Parameters=`NOT_DECIDED`。
- PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- Formula profile/parameter、Exact normalization/fusion、Version concrete contract、Backend Wire/DB/OpenAPI、provenance wireは未決定。
- Approval-only / Documentation-only。Source変更とfull quality gate実行は行っていない。

### References

- [PD-36 Architecture Approval Record](./audit/94-pd02c-axis-formula-architecture-explicit-product-owner-approval-record.md)
- [PD-35 Architecture Decision Review](./audit/93-pd02c-axis-formula-architecture-decision-review.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-37 — PD-02C Formula Profile / Parameter Policy Discovery

**Status:** Completed / `DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`  
**Category:** Product / Formula Parameter Policy Discovery  
**Objective:** 承認済みFormula Architectureに対し、parameter taxonomy、authority、baseline、calibration、version/immutability、fallbackをDecision Review可能にする。

### Changes / Result

- Structural/Numeric/Presentation/Calibration taxonomyとauthority boundaryを整理した。
- Equal/Eligibility-awareをuncalibrated baseline、non-equal weightをcalibration後の候補とし、typed normalization、fixed fusion、confidence/coverage separationを整理した。
- Dataset/ground truth/human evaluation、threshold/rounding、eligibility、immutable registry、Global/Context profile、explainability metadataを候補化した。

### Status / Remaining

- Formula Profile / Parameter Policy=`READY_FOR_DECISION_REVIEW`。Exact Formula Parameters=`NOT_DECIDED`。
- PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Implementation=`NOT_IMPLEMENTED`。
- Dataset構築、Exact constants、Missing/Partial、Backend/Schema/OpenAPI、Rails/Worker実装は未実施・未決定。
- Documentation-only。Source変更とfull quality gate実行は行っていない。

### References

- [PD-37 Parameter Policy Discovery](./audit/95-pd02c-formula-profile-parameter-policy-discovery.md)
- [PD-36 Architecture Approval](./audit/94-pd02c-axis-formula-architecture-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-38 — PD-02C Formula Profile / Parameter Policy Decision Review

**Status:** Completed / `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`  
**Category:** Product / Formula Parameter Policy Decision Review  
**Objective:** PD-37 Candidateを個別reviewし、Parameter決定・変更・version管理原則をProduct Owner承認可能なFinal Proposalへ整理する。

### Review / Result

- Taxonomy、authority、uncalibrated baseline、calibration-first weight、typed normalization、non-dynamic fusion、quality separationをFinal Proposal化した。
- Formula Version/immutability、silent fallback禁止、Global/Context boundary、registry/explainability metadataをreviewした。
- DECIDE NOW / KEEP AS CALIBRATION CANDIDATE / DEFER / REJECTを明示した。

### Status / Remaining

- Formula Profile / Parameter Policy=`READY_FOR_APPROVAL / NOT_APPROVED`。Approval Evidenceは未提供。
- Exact Formula Parameters=`NOT_DECIDED`、PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`、Implementation=`NOT_IMPLEMENTED`。
- Exact parameters、Dataset construction、Missing/Partial、confidence calibration、Backend/Schema/OpenAPI、Rails/Worker実装はdeferした。
- Documentation-only。Source変更とfull quality gate実行は行っていない。

### References

- [PD-38 Parameter Policy Decision Review](./audit/96-pd02c-formula-profile-parameter-policy-decision-review.md)
- [PD-37 Parameter Policy Discovery](./audit/95-pd02c-formula-profile-parameter-policy-discovery.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-39 — PD-02C Formula Profile / Parameter Policy Explicit Product Owner Approval Record

**Status:** Completed / `DECIDED / APPROVED`  
**Category:** Product / Formula Parameter Policy Approval Record  
**Objective:** Product Ownerの明示承認を記録し、PD-38 Formula Profile / Parameter Policy Final Proposalを正式Policyへ昇格する。

### Approval / Result

- Approval Evidence「PD-02CのFormula Profile / Parameter Policy Proposalを承認する。」を2026-08-24、Decision Owner=Product Ownerとして記録した。
- Calibration-first、typed normalization、non-dynamic fusion、quality separation、immutability、silent fallback禁止、Global baselineを正式Policyとした。
- Taxonomy、authority、baseline/weight、Dataset/Ground Truth、threshold/rounding、eligibility、Formula Version、registry/explainabilityを同期した。

### Status / Remaining

- Formula Profile / Parameter Policy=`DECIDED / APPROVED`。Exact Formula Parameters=`NOT_DECIDED`、Implementation=`NOT_IMPLEMENTED`。
- PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- Exact calibration、fusion profile、Formula Version representation、Backend Wire/DB/OpenAPI、provenance wire、PD-02D treatmentが残る。
- Approval-only / Documentation-only。Source変更とfull quality gate実行は行っていない。

### References

- [PD-39 Parameter Policy Approval](./audit/97-pd02c-formula-profile-parameter-policy-explicit-product-owner-approval-record.md)
- [PD-38 Parameter Policy Review](./audit/96-pd02c-formula-profile-parameter-policy-decision-review.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-40 — PD-02C Formula Version / Backend Wire Contract Discovery

**Status:** Completed / `DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`  
**Category:** Product / Backend Logical Contract Discovery  
**Objective:** 承認済みFormula Architecture/PolicyをBackendで識別・保存・交換・再現するFormula Versionとlogical Wire Contractを整理する。

### Changes / Result

- formulaVersion identity/resolution、Formula/Profile Registry、Score hierarchy/identity、provenanceを候補化した。
- AnalysisJob/Snapshot、historical reconstruction、compatibility、raw/normalized/presentation、completeness/quality wireを整理した。
- Worker engine + Rails canonical orchestration/validation/registry/persistenceを推奨し、OpenAPI/DB handoffを整理した。

### Status / Remaining

- Formula Version Contract / Backend Wire Logical Contract=`READY_FOR_DECISION_REVIEW`。
- PD-02C closureはOption B（logical contract承認まででDecision-complete、Calibration/実装は後続）を推奨したが未決定。
- Exact Parameters=`NOT_DECIDED`、Implementation=`NOT_IMPLEMENTED`、PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- Documentation-only。Source/Rails/Worker/BFF/OpenAPI/DB変更とfull quality gate実行は行っていない。

### References

- [PD-40 Formula Version / Wire Discovery](./audit/98-pd02c-formula-version-backend-wire-contract-discovery.md)
- [PD-39 Parameter Policy Approval](./audit/97-pd02c-formula-profile-parameter-policy-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-41 — PD-02C Formula Version / Backend Wire Contract Decision Review

**Status:** Completed / `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`  
**Category:** Product / Backend Logical Contract Decision Review  
**Objective:** PD-40のFormula Version、Backend Wire、Calculation Ownership、PD-02C Closure候補をProduct Owner承認可能なFinal Proposalへ整理する。

### Changes / Result

- immutable formulaVersion/Manifest、Rails-owned Registry、Score hierarchy/identity、provenance、Job/Snapshot/history/compatibilityをFinal Proposal化した。
- Option C「Worker engine + Rails canonical orchestration/registry/validation/persistence」とlogical `AnalysisScoreResult`をFinal Proposal化した。
- Closure Option Bを採用候補とし、Exact Calibration/Schema/ImplementationとPD-02D Treatmentのhandoff境界を明示した。

### Status / Remaining

- Formula Version、Backend Wire、Calculation Ownership、Closureはいずれも`READY_FOR_APPROVAL / NOT_APPROVED`。
- Exact Parameters=`NOT_DECIDED`、Implementation=`NOT_IMPLEMENTED`、PD-02C / PD-02=`NEEDS_DISCOVERY`、PD-02D=`BLOCKED`。
- Documentation-only。Source/Rails/Worker/BFF/OpenAPI/DB変更とfull quality gate実行は行っていない。

### References

- [PD-41 Decision Review](./audit/99-pd02c-formula-version-backend-wire-contract-decision-review.md)
- [PD-40 Discovery](./audit/98-pd02c-formula-version-backend-wire-contract-discovery.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-42 — PD-02C Formula Version / Backend Wire Contract Explicit Product Owner Approval Record

**Status:** Completed / PD-02C `DECISION_COMPLETE`  
**Category:** Product / Backend Logical Contract Approval Record  
**Objective:** Product Ownerの明示承認を記録し、PD-41の4 Proposalを正式Contract／Architecture／Closure Decisionへ遷移させる。

### Approval / Result

- Formula Version Contract、Backend Wire Logical Contract、Formula Calculation Ownership Option C、PD-02C Closure Option Bを`DECIDED / APPROVED`として記録した。
- Published immutable formulaVersion/Manifest、Rails-owned Registry、Score hierarchy/provenance、Job/Snapshot/history/compatibility、logical `AnalysisScoreResult`を正式Contractとした。
- PD-02C=`DECISION_COMPLETE`。Implementation=`NOT_IMPLEMENTED`、Exact Parameters=`NOT_DECIDED`、Calibration=`NOT_PERFORMED`。

### Status / Remaining

- PD-02 parent=`NEEDS_DISCOVERY`。
- PD-02DはPD-02C dependencyを解消したが、PD-04/backend workflow dependencyにより`BLOCKED`を維持した。
- Approval-only / Documentation-only。Source/Rails/Worker/BFF/OpenAPI/DB変更とfull quality gate実行は行っていない。

### References

- [PD-42 Approval Record](./audit/100-pd02c-formula-version-backend-wire-contract-explicit-product-owner-approval-record.md)
- [PD-41 Decision Review](./audit/99-pd02c-formula-version-backend-wire-contract-decision-review.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-43 — PD-02D / PD-04 Dependency and Discovery Readiness Review

**Status:** Completed / PD-02D `READY_FOR_DISCOVERY`  
**Category:** Product / Dependency Readiness Review  
**Objective:** PD-02DをblockしていたPD-04 dependencyを分解し、Score Treatment Discoveryの開始条件を再判定する。

### Changes / Result

- Observation/Axis/Job/Snapshotのpartial概念、absence/failure/unknown/N/A/partial原因、Formula eligibilityとStrategy promotionを分離した。
- Snapshot persistence、Strategy promotion、reanalysis/usageはPD-04固有であり、PD-02D開始条件ではないと判定した。
- `PD-02D → PD-04全体`依存を解除し、circular dependencyなし、Recommended Option Aとした。

### Status / Remaining

- PD-02D=`READY_FOR_DISCOVERY`、PD-04=`READY_FOR_DISCOVERY / NON_BLOCKING_TO_PD-02D`。
- PD-02 parent=`NEEDS_DISCOVERY`、Implementation=`NOT_IMPLEMENTED`。
- Documentation-only。Missing/Partial Treatment、Source、Rails/Worker/BFF/OpenAPI/DB変更とfull quality gate実行は行っていない。

### References

- [PD-43 Readiness Review](./audit/101-pd02d-pd04-dependency-discovery-readiness-review.md)
- [PD-42 Approval Record](./audit/100-pd02c-formula-version-backend-wire-contract-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-44 — PD-02D Missing / Partial Score Contract Discovery

**Status:** Completed / `DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`  
**Category:** Product / Missing and Partial Score Contract Discovery  
**Objective:** 5 Completeness states、Eligibility、Non-calculated、階層別calculation、quality/coverage境界を承認済みFormula/Wire上で候補化する。

### Changes / Result

- 0、Product absence、Technical failure、Unknown、N/A、Partialを分離し、Completeness/Eligibility/Score Stateのlogical candidateを整理した。
- Submetric/Axis/Layer/Overall、Required Evidence、Hybrid denominator、Penalty、mixed/unsupported、comparability、Explainabilityを候補化した。
- Model B「Eligibility-aware Calculation + Separate Quality Metadata」を`RECOMMENDED / NOT_APPROVED`とした。

### Status / Remaining

- PD-02D=`DISCOVERY_COMPLETE / READY_FOR_DECISION_REVIEW`、PD-02 parent=`NEEDS_DISCOVERY`。
- Exact treatment、threshold、required set、reason enum、Overall/comparability ruleは未決定。PD-04 boundaryは不変。
- Documentation-only。Formula/Source/Rails/Worker/Snapshot/OpenAPI/DB変更とfull quality gate実行は行っていない。

### References

- [PD-44 Discovery](./audit/102-pd02d-missing-partial-score-contract-discovery.md)
- [PD-43 Readiness Review](./audit/101-pd02d-pd04-dependency-discovery-readiness-review.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-45 — PD-02D Missing / Partial Score Contract Decision Review

**Status:** Completed / `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`  
**Category:** Product / Missing and Partial Score Contract Decision Review  
**Objective:** PD-44 CandidateをProduct Ownerが承認可能なPD-02D v1 Contract、Treatment Model、Closure Proposalへ整理する。

### Changes / Result

- Completeness/Eligibility/Score State、Missing/N/A/Unknown/Failure/Partial、Evidence Role、Hybrid denominatorをFinal Proposal化した。
- Submetric/Axis/Layer/Overall、limited Score、Quality、comparability、Explainability、PD-04 boundaryをFinal Proposal化した。
- Model A=`KEEP AS LOCAL PROFILE POLICY`、Model B=`READY_FOR_APPROVAL`、Model C=`DEFER UNTIL CALIBRATION`とした。

### Status / Remaining

- PD-02D Contract、Model B、Closure Proposal=`READY_FOR_APPROVAL / NOT_APPROVED`。
- PD-02D承認後はPD-02 parentを`READY_FOR_CLOSURE_REVIEW`へ進めるProposal。現在はParent=`NEEDS_DISCOVERY`。
- Documentation-only。Exact threshold/required set/calibration、Source/Formula/Rails/Worker/Snapshot/OpenAPI/DB変更とfull quality gate実行は行っていない。

### References

- [PD-45 Decision Review](./audit/103-pd02d-missing-partial-score-contract-decision-review.md)
- [PD-44 Discovery](./audit/102-pd02d-missing-partial-score-contract-discovery.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-46 — PD-02D Missing / Partial Score Contract Explicit Product Owner Approval Record

**Status:** Completed / `DECISION_COMPLETE`  
**Category:** Product / Explicit Approval Record  
**Objective:** PD-45のContract、Treatment Model B、Closure Proposalに対するProduct Owner明示承認を正本化する。

### Changes / Result

- Approval Evidence、Approval Date=2026-08-24、Decision Owner=Product Ownerを記録した。
- PD-02D ContractとClosureを`DECIDED / APPROVED`、Model Bを`DECIDED / APPROVED / V1 DEFAULT TREATMENT MODEL`、PD-02Dを`DECISION_COMPLETE`とした。
- PD-02A〜Dがdecision-completeとなったため、PD-02 parentを`READY_FOR_CLOSURE_REVIEW`へ進めた。Parentは未完了。

### Deferred / Remaining

- Implementation=`NOT_IMPLEMENTED`、Exact Thresholds/Required Sets=`NOT_DECIDED`、Calibration=`NOT_PERFORMED`。
- Model C、PD-04 workflows、physical JSON/DB/OpenAPI、Rails/Worker/Frontend implementationはdeferred。
- Documentation-only。Source/Formula/Rails/Worker/DB/OpenAPI/Snapshot実装変更とfull quality gateは行っていない。

### References

- [PD-46 Approval Record](./audit/104-pd02d-missing-partial-score-contract-explicit-product-owner-approval-record.md)
- [PD-45 Decision Review](./audit/103-pd02d-missing-partial-score-contract-decision-review.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-47 — PD-02 Parent Closure Review

**Status:** Completed / `CLOSE_WITH_DEFERRED_ITEMS / READY_FOR_CLOSURE_APPROVAL`  
**Category:** Product / Parent Closure Review  
**Objective:** PD-02A〜DのDecision chain、残件、handoffを確認し、PD-02 ParentのClosure可否を判定する。

### Changes / Result

- Common 6 Axis、Observation、Formula/Wire、Missing/Partial/Eligibility ContractがDecision上閉じ、Contract chainとversion/historical interpretationが整合することを確認した。
- Residual itemsをValidation、Implementation、PD-04、Presentation handoffへ分類し、Closure blockerは0件と判定した。
- 推奨判定を`CLOSE_WITH_DEFERRED_ITEMS`とした。Parent ClosureのProduct Owner明示承認は未提供のため、PD-02 Parent=`READY_FOR_CLOSURE_APPROVAL`とし、未完了を維持した。

### Deferred / Remaining

- Exact Parameters、Calibration Dataset/実施、Model CはValidation handoff。
- Rails/Worker/DB/OpenAPI/BFF/Frontend/Snapshot materializationはImplementation handoff。
- Snapshot/Strategy lifecycleとreanalysisはPD-04、Limited/Partial labelはPresentation handoff。
- Documentation-only。Source/Formula/Rails/Worker/DB/OpenAPI変更とfull quality gateは行っていない。

### References

- [PD-47 Parent Closure Review](./audit/105-pd02-parent-closure-review.md)
- [PD-46 PD-02D Approval Record](./audit/104-pd02d-missing-partial-score-contract-explicit-product-owner-approval-record.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-48 — PD-02 Parent Closure Explicit Product Owner Approval Record

**Status:** Completed / `DECIDED / COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`  
**Category:** Product / Explicit Parent Closure Approval  
**Objective:** PD-47の`CLOSE_WITH_DEFERRED_ITEMS`に対するProduct Owner明示承認を記録し、PD-02 Parentを正式Closureする。

### Changes / Result

- Approval Evidence、Closure Date=2026-08-24、Decision Owner=Product Ownerを記録した。
- Closure blocker=0、Disposition=`CLOSE_WITH_DEFERRED_ITEMS`、PD-02 Parent=`DECIDED / COMPLETE`とした。
- PD-02A〜D、Axis Contract v1、Contract chain、version/historical boundary、Missing/Partial Treatment Model BをClosure scopeとして維持した。

### Deferred / Remaining

- Validation、Implementation、PD-04、PresentationのDeferred Ledgerを後続handoffとして保持した。
- Exact Parameters=`NOT_DECIDED`、Calibration=`NOT_PERFORMED`、Implementation=`NOT_IMPLEMENTED`。
- Documentation-only。Source/Formula/Rails/Worker/DB/OpenAPI変更とfull quality gateは行っていない。

### References

- [PD-48 Parent Closure Approval Record](./audit/106-pd02-parent-closure-explicit-product-owner-approval-record.md)
- [PD-47 Parent Closure Review](./audit/105-pd02-parent-closure-review.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-49 — PD-04 partially_completed Snapshot Workflow Full Discovery

**Status:** Completed / `READY_FOR_DECISION_REVIEW / NOT_APPROVED`  
**Category:** Product / Domain Discovery  
**Objective:** PD-04のAnalysisJob Outcome、Snapshot/current、Strategy Source、Reanalysis/History/UsageをDecision Review可能なCandidateへ整理する。

### Changes / Result

- `partially_completed`をusable validated result + explicit limitationsを持つJob-level terminal outcomeとするCandidateを整理し、`failed`、cancel、timeoutとの境界を定義した。
- Limitations付きpartial Snapshot、latest/current/strategy-source分離、Partialのv1 Evidence-only、immutable new-Job reanalysisを推奨した。
- UsageはPlan-specific policy + usable-result default candidateとし、Usage entitlementとStripe chargeを分離した。
- 4 workstreamすべてとPD-04 overallを`READY_FOR_DECISION_REVIEW / NOT_APPROVED`と判定した。

### Deferred / Remaining

- Exact threshold、usage unit/price、retention、Evidence TTL、JSON/DB/OpenAPI、Rails/Worker/BFF/Frontend、UI、Stripe、retry/queue実装。
- Documentation-only。Source、Formula、Rails、Worker、DB、OpenAPI変更とfull quality gateは行っていない。

### References

- [PD-49 Full Discovery](./audit/107-pd04-partially-completed-snapshot-workflow-full-discovery.md)
- [PD-43 Dependency / Readiness Review](./audit/101-pd02d-pd04-dependency-discovery-readiness-review.md)
- [Canonical AnalysisJob State Machine](./api/analysis-job-state-machine.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-50 — PD-04 partially_completed Snapshot Workflow Decision Review

**Status:** Completed / `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`  
**Category:** Product / Decision Review  
**Objective:** PD-49の4 workstreamをProduct Ownerが承認可能なPD-04 Final ProposalとClosure Proposalへ整理する。

### Changes / Result

- Job outcome、S-B Limited Snapshot、C-D/B/C current policy、P-D Partial Evidence-only、R-C reanalysis、Explicit Reuse ProfileをFinal Proposal化した。
- U-E Plan-specific policy + U-C usable-result baselineをUsage Final Proposalとし、Usage EntitlementとStripe chargeを分離した。
- Rails/Worker/Frontend ownership、Technical/Business outcome、Logical Contract、Closure条件を整理した。
- 4 workstream、Closure Proposal、PD-04 overallを`READY_FOR_APPROVAL / NOT_APPROVED`と判定した。

### Deferred / Remaining

- Exact threshold、usage unit/price/refund、retention/TTL、JSON/DB/OpenAPI、Rails/Worker/BFF/Frontend/Stripe/UI/queue実装。
- Product Owner Approval Evidenceは未提供。PD-04は`DECISION_COMPLETE`にしていない。
- Documentation-only。Source、Rails、Worker、DB、OpenAPI、Stripe変更とfull quality gateは行っていない。

### References

- [PD-50 Decision Review](./audit/108-pd04-partially-completed-snapshot-workflow-decision-review.md)
- [PD-49 Full Discovery](./audit/107-pd04-partially-completed-snapshot-workflow-full-discovery.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-51 — PD-04 partially_completed Snapshot Workflow Explicit Product Owner Approval Record

**Status:** Completed / `DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`  
**Category:** Product / Explicit Approval Record  
**Objective:** PD-50 Final ProposalとPD-04 Closure Proposalに対するProduct Owner明示承認を正本化する。

### Changes / Result

- Approval Evidence、Approval Date=2026-09-07、Decision Owner=Product Ownerを記録した。
- Job outcome、Limited Snapshot/current、Strategy Evidence-only、R-C reanalysis、Explicit Reuse、U-E/U-C Usage、ownership、Logical Contractを`DECIDED / APPROVED`とした。
- PD-04 Closure Proposalを承認済みとし、PD-04=`DECISION_COMPLETE`、補助status=`CLOSED_WITH_DEFERRED_ITEMS`へ更新した。

### Deferred / Remaining

- Product/Validation、Usage/Billing、Data/Implementation、Operations、Presentation、Stripeの6分類でDeferred Ledgerを維持した。
- Implementation=`NOT_IMPLEMENTED`。Exact threshold、usage/price、retention、schema、実装は未決定・未実装。
- Documentation-only。Source、Rails、Worker、DB、OpenAPI、Stripe変更とfull quality gateは行っていない。

### References

- [PD-51 Approval Record](./audit/109-pd04-partially-completed-snapshot-workflow-explicit-product-owner-approval-record.md)
- [PD-50 Decision Review](./audit/108-pd04-partially-completed-snapshot-workflow-decision-review.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-52 — PD-01 Marketing Route Intent External Evidence Review

**Status:** Completed / `READY_FOR_DECISION_REVIEW / NOT_APPROVED`  
**Category:** Product / External Evidence Review  
**Objective:** PD-01のMarketing/Public Route Intent、canonical/SEO、campaign/analytics boundaryを一次資料と既存Panoptes decisionからDecision Review可能な候補へ整理する。

### Changes / Result

- Repository Evidence、Existing Product Decision、External Evidenceを分離し、Marketing 3 routeの現行duplicate renderingとApp/Auth境界を確認した。
- Google Search Central / Google Analytics一次資料とSlack、Notion、HubSpot公式siteのIA例を記録した。
- `/`をPublic Product Marketing Homeとするv1 model、one-resource/one-canonical、canonical page + attribution parameter、Marketing/Product analytics分離を`PROPOSED / NOT_APPROVED`として整理した。
- Marketing Route Intent、Canonical/SEO、Campaign/Analytics Boundaryを`READY_FOR_DECISION_REVIEW`、PD-01 ParentをPD-01B未調査のため`PARTIALLY_READY`とした。

### Decisions

- Product Decisionは行っていない。`/app`・`/app/analysis`のPD-01A contractを維持した。
- `/lp`・`/plan`の外部利用Evidenceが未取得であるため、redirect/removal前のSearch Console、広告、CRM、backlink、bookmark、配布URL監査をconditional implementation gateとした。

### Deferred / Remaining

- Product OwnerによるMarketing model、root semantics、alias lifecycle、canonical/SEO、campaign/analytics boundaryのreview/approval。
- Exact sitemap、metadata、redirect、analytics vendor/event taxonomy、cookie consent、PII/retention、CRM、content/keyword strategy。
- PD-01B App Deep-link / State Restoration Contract。
- Documentation-only。Source、route、Rails、OpenAPI変更とfull quality gateは行っていない。

### References

- [PD-52 External Evidence Review](./audit/110-pd01-marketing-route-intent-external-evidence-review.md)
- [PD-01 Route Intent Discovery](./audit/62-pd01-route-intent-discovery.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-53 — PD-01 Marketing Route Intent Decision Review

**Status:** Completed / `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`  
**Category:** Product / Decision Review  
**Objective:** PD-52 Marketing/Public Route候補をProduct Ownerが明示承認可能なFinal ProposalとMarketing branch Closure Proposalへ固定する。

### Changes / Result

- Root `/`、Marketing/App境界、public URL hierarchy、4 logical route classes、canonical/SEO、campaign/attribution、analytics、metadata/canonical ownership、route stabilityをFinal Proposal化した。
- `/lp`・`/plan`のduplicate renderingをcanonical architectureとして維持しないPrincipleと、exact dispositionを`NEEDS_EXTERNAL_FOOTPRINT_CHECK`へ送るBoundaryを分離した。
- Marketing Route Intent、Canonical/SEO、Campaign/Analytics、Marketing branch Closureを`READY_FOR_APPROVAL / NOT_APPROVED`とした。

### Decisions

- Product Decisionは行っていない。PD-01Aを維持し、PD-01 ParentはPD-01B未調査のため`PARTIALLY_READY`とした。
- Root App redirect、state-dependent Root identity、恒久duplicate rendering、UTMをcanonical identityとする方向、robots/noindexへのsecurity依存をReject候補とした。

### Deferred / Remaining

- Product Ownerの明示承認、Decision Owner、Decision Date。
- `/lp`・`/plan` external footprint、exact disposition、redirect、metadata、canonical、sitemap、analytics、privacy、content/keyword strategy。
- PD-01B App Deep-link / State Restoration Contract。PD-01 Parent Closureは行っていない。
- Documentation-only。Source、route、Rails、OpenAPI変更とfull quality gateは行っていない。

### References

- [PD-53 Decision Review](./audit/111-pd01-marketing-route-intent-decision-review.md)
- [PD-52 External Evidence Review](./audit/110-pd01-marketing-route-intent-external-evidence-review.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-54 — PD-01 Marketing Route Intent Explicit Product Owner Approval Record

**Status:** Completed / `DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`  
**Category:** Product / Explicit Approval Record  
**Objective:** PD-53 Marketing Route Contract、Canonical/SEO、Campaign/Analytics、Marketing branch Closureに対するProduct Owner明示承認を正本化する。

### Changes / Result

- Approval Evidence、Approval Date=2026-09-07、Decision Owner=Product Ownerを記録した。
- Root `/` Intent、Marketing/App境界、public URL hierarchy/classification、canonical/SEO、campaign/analytics、metadata/canonical ownership、route stabilityを`DECIDED / APPROVED`とした。
- Marketing Route branchを`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`へ更新した。
- `/lp`・`/plan`は`NEEDS_EXTERNAL_FOOTPRINT_CHECK`を維持し、exact dispositionを未決定とした。

### Decisions

- PD-01Aを変更せず、Marketing Route Branch ClosureとPD-01 Parent Closureを分離した。
- PD-01 ParentはPD-01B=`NEEDS_DISCOVERY`のため`PARTIALLY_READY`を維持した。

### Deferred / Remaining

- Implementation: redirect、canonical、metadata、sitemap、route classification、external footprint check。
- Analytics/Privacy/Marketing: vendor、UTM taxonomy、consent、PII、retention、content/keyword strategy。
- Product Decision: PD-01B、`/plan` future intent、footprint確認後の`/lp`・`/plan` final disposition。
- Decision CompleteはImplementation Completeを意味しない。Source、route、Rails、OpenAPI変更とfull quality gateは行っていない。

### References

- [PD-54 Approval Record](./audit/112-pd01-marketing-route-intent-explicit-product-owner-approval-record.md)
- [PD-53 Decision Review](./audit/111-pd01-marketing-route-intent-decision-review.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-55 — PD-01B App Deep-link / State Restoration Contract Discovery

**Status:** Completed / `READY_FOR_DECISION_REVIEW`  
**Category:** Product / Domain Contract Discovery  
**Objective:** Authenticated Appのdeep-link、direct navigation、reload/history、resource/Organization restoration、failureとownership boundaryをDecision Review可能にする。

### Changes / Result

- PD-01Aのroute roleと現行Shell/auth/Organization/AnalysisJob/Snapshot evidenceを限定確認した。
- URLをselector、Railsをauthorization/canonical state、cacheをoptimization、Frontendをnavigation/presentationとする候補を整理した。
- Model C（Hybrid Current Pointer + Explicit Historical Resource）を推奨し、PD-01Bの全readinessを`READY_FOR_DECISION_REVIEW / NOT_APPROVED`へ更新した。

### Decisions

- Product Decisionは行っていない。`/app/analysis`単体=current pointer（なければEntry/empty）、Job ID=process/outcome、Snapshot ID=immutable history、explicit failure=no silent fallbackを未承認候補とした。
- PD-01 Parentは`PARTIALLY_READY`を維持し、PD-01B承認後に`READY_FOR_CLOSURE_REVIEW`へ進める候補とした。

### Deferred / Remaining

- Product Owner review/approval、exact URL schema、current-pointer/API/route implementation、public sharing、draft persistence、restoration UI、browser E2E。
- Documentation-only。Source、route、Rails、BFF、OpenAPI、DB変更とfull quality gateは行っていない。

### References

- [PD-55 Contract Discovery](./audit/113-pd01b-app-deeplink-state-restoration-contract-discovery.md)
- [Product Decision Register](./product/product-decision-register.md)
- [PD-01A App Route Role Decision](./audit/63-pd01a-app-route-role-decision.md)
- [PD-54 Marketing Route Approval Record](./audit/112-pd01-marketing-route-intent-explicit-product-owner-approval-record.md)

## Phase PD-56 — PD-01B App Deep-link / State Restoration Contract Decision Review

**Status:** Completed / `REVIEWED / READY_FOR_APPROVAL / NOT_APPROVED`  
**Category:** Product / Domain Contract Decision Review  
**Objective:** PD-55候補を既決定Contractと照合し、PD-01B v1をProduct Ownerが明示承認できるProposalへ固定する。

### Changes / Result

- Deep-link definition、source hierarchy、URL/transient/cache、route semantics、resource identity、Organization/Auth、failure/history、ownershipをFinal Proposal化した。
- Model Aをcanonical modelとしてReject、Model Bをstrict resource patternとしてKeep、Model Cをv1 Default Restoration Modelの承認候補とした。
- Deep-link、State Restoration、Ownership、Model C、Closure Proposal、PD-01B Overallを`READY_FOR_APPROVAL / NOT_APPROVED`へ更新した。

### Decisions

- Product Decisionは行っていない。Approval Evidence、Date、Ownerは未提供である。
- PD-01B承認後は`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`、PD-01 Parentは`READY_FOR_CLOSURE_REVIEW`へ進めるProposalとした。

### Deferred / Remaining

- Product Owner明示承認、exact URL schema、current pointer、DB/OpenAPI、Rails/BFF/Frontend、public sharing、draft persistence、UI、E2E。
- Documentation-only。Source、route、API、DB実装とfull quality gateは行っていない。

### References

- [PD-56 Decision Review](./audit/114-pd01b-app-deeplink-state-restoration-contract-decision-review.md)
- [PD-55 Contract Discovery](./audit/113-pd01b-app-deeplink-state-restoration-contract-discovery.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-57 — PD-01B App Deep-link / State Restoration Contract Explicit Product Owner Approval Record

**Status:** Completed / `DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`  
**Category:** Product / Explicit Approval Record  
**Record Date:** 2026-09-14  
**Objective:** PD-01B Logical Contract、Model C、ClosureのProduct Owner明示承認を正式記録する。

### Changes / Result

- Approval Evidence: 「PD-01B App Deep-link / State Restoration Contract、Model C、およびPD-01B Closure Proposalを承認する。」
- Approval Date=2026-09-07、Decision Owner=Product Ownerを記録し、記録作成日と区別した。
- Deep-link、Restoration、Ownership Boundary、Model Cを`DECIDED / APPROVED`、PD-01Bを`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`、Closure blocker count=0へ更新した。

### Decisions

- Model Cをv1 Default Restoration Modelとし、identity-less `/app/analysis`はserver-authorized current、なければEntry/emptyとする。Snapshotはexplicit immutable identityで参照する。
- PD-01A、Marketing Route Branch、PD-01BのDecisionが揃い、PD-01 Parentを`READY_FOR_CLOSURE_REVIEW`へ更新した。Parent Closure自体は行っていない。

### Deferred / Remaining

- Exact URL/current pointer、DB/OpenAPI/endpoints/Result ID ownership、Rails/BFF/Frontend、public share/draft、UI/error mapping、analytics/E2Eを6分類のDeferred Ledgerへ記録した。
- Implementation=`NOT_IMPLEMENTED`。Source変更、新規Discovery、full quality gateは実施していない。

### References

- [PD-57 Approval Record / Deferred Ledger](./audit/115-pd01b-app-deeplink-state-restoration-contract-explicit-product-owner-approval-record.md)
- [PD-56 Decision Review](./audit/114-pd01b-app-deeplink-state-restoration-contract-decision-review.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-58 — PD-01 Parent Closure Review

**Status:** Completed / `READY_FOR_APPROVAL / NOT_APPROVED`  
**Review Date:** 2026-09-14  
**Objective:** Child Decision整合、Parent scope、blocker、Deferred handoffを照合し、Parent Closure承認候補を作成する。

### Changes / Result

- PD-01A、Marketing、PD-01Bの承認記録とRegisterのPD-02/PD-04契約を照合。Closure criteriaは8/8 PASS、未解決Product Contract blocker=0。
- Parent Contractを集約し、Deferred項目をD01–D09へ整理した。`/lp`・`/plan`は`NEEDS_EXTERNAL_FOOTPRINT_CHECK`を維持する。

### Decisions

- Parentは`READY_FOR_APPROVAL / NOT_APPROVED`。承認後のProposalは`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`。新規Product Decisionや代理承認は行っていない。
- PD-03と後続handoffが残るため8〜9月棚卸し全体Closureは実施していない。

### Deferred / Remaining

- Parent明示承認、Route、SEO、Data/API、Source、Analytics、Privacy、Product、Presentation、Test/Operations。
- Implementation=`NOT_IMPLEMENTED`。Source変更、External Research、新規Discovery、full quality gateは実施していない。

### References

- [PD-58 Parent Closure Review / Ledger](./audit/116-pd01-parent-closure-review.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-59 — PD-01 Parent Explicit Product Owner Approval Record

**Status:** Completed / `DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`  
**Approval Date / Record Created Date:** 2026-09-14 / 2026-09-14  
**Decision Owner:** Product Owner  
**Objective:** PD-01 Parentの明示承認とDeferred handoffを条件とするClosureを正式記録する。

### Changes / Result

- Approval Evidence: 「PD-01 App / Marketing Route Intent、App Deep-link / State Restoration Contract、およびPD-01 Parent Closure Proposalを、Deferred Itemsを後続Phaseへ引き継ぐ条件で承認する。」
- Parent ContractとClosureを正式承認、Parentを`DECISION_COMPLETE / CLOSED_WITH_DEFERRED_ITEMS`、Closure blocker count=0へ更新した。

### Decisions

- Childの既決定とModel C、PD-02/PD-04整合、ownership境界を維持し、D01–D09を正式Parent Handoffとして保持した。
- 主要Route / Navigation / Restoration Product DecisionをClosureした。8〜9月棚卸し全体Closureは行っていない。

### Deferred / Remaining

- PD-03とRemaining Product Decision / Deferred HandoffをPD-60候補へ引き継ぐ。
- Implementation=`NOT_IMPLEMENTED`、`/lp`・`/plan`=`NEEDS_EXTERNAL_FOOTPRINT_CHECK`を維持。Source変更、新規Discovery、External Research、full quality gateは実施していない。

### References

- [PD-59 Parent Approval Record](./audit/117-pd01-parent-explicit-product-owner-approval-record.md)
- [PD-58 Parent Review / Ledger](./audit/116-pd01-parent-closure-review.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase PD-60 — Remaining Product Decision Closure Audit

**Status:** Completed / `READY_FOR_CLOSURE_REVIEW`  
**Date:** 2026-09-14  
**Objective:** 全Product Decisionの現行Status、棚卸しblocker、後続handoffを一度だけ横断確認する。

### Changes / Result

- 正式IDは11（親5、子6）、Marketingは独立IDなしのBranch。A=3/B=7/C=0/D=0/E=0/F=1と分類し、親子を重複した独立作業数として扱わない集計基準を記録した。
- PD-03はNEEDS_DISCOVERYを維持し、既存DEFER 2件を`DEFERRED_NON_BLOCKER`と判定。Inventory Closure blocker=0。
- Registerのstale next action/PD-04 Owner/標準化要約を同期し、既存Frontend Closureを維持したまま最小注記を追加した。

### Decisions

- 新しいProduct承認・PD-03 Closureは行っていない。8〜9月全体は`READY_FOR_CLOSURE_REVIEW`、次はPD-61を推奨。
- `Inventory Closure != Implementation Completion`。既存PolicyをOctoberの入力とし、新規標準化planは作成していない。

### Deferred / Remaining

- PD-03、Product、Calibration、Standardization、Backend/API、Worker、SEO、Analytics/Privacy、Billing、Presentation、Test/Operationsを既存Ledgerへ引き継ぐ。
- Source変更、External Research、build/E2E/broad tests/full quality gateは実行していない。

### References

- [PD-60 Matrix / Handoff](./audit/118-remaining-product-decision-closure-audit.md)
- [Product Decision Register](./product/product-decision-register.md)
- [Frontend Inventory](./inventory/frontend-inventory-summary.md)

## Phase PD-61 — 8〜9月 Inventory Parent Closure Review

**Status:** Completed / `READY_FOR_APPROVAL / NOT_APPROVED`  
**Date:** 2026-09-14  
**Objective:** 8〜9月Frontend棚卸し・構造整理フェーズのParent成果物、Closure Criteria、Deferred/October handoffを最終確認する。

### Changes / Result

- Parentのpost-PD-3 baseline（107 components、17 features、124 reusable、12 route Svelte、136 total）を再集計せず正本として確認した。
- Structure Policy、Product Decision、Deferred 10分類、Implementation/October handoffを確認し、Closure Criteria 10/10 PASS、blocker 0と判定した。
- Recommended Disposition=`CLOSE_WITH_DEFERRED_ITEMS`、Overall=`READY_FOR_APPROVAL / NOT_APPROVED`。Product Owner Approval CandidateとClosure Contractを作成した。

### Decisions

- Codexは承認を代行せず、明示承認前に8〜9月全体を正式Closeしない。既存Frontend Parentの`CLOSE_WITH_DEFERRED_ITEMS`は維持する。
- PD-03は`NEEDS_DISCOVERY / DEFERRED_NON_BLOCKER`、Plan Rail 2件はDEFER。Octoberはtaxonomyから開始し、Token後にTailwind、完了後にTechnical Bootcampへ進む。

### Deferred / Remaining

- 次はPD-62 Explicit Product Owner Approval Record。実装、PD-03 Discovery、October plan、標準化、Bootcampは開始していない。
- Source変更、再Inventory、External Research、build/test/qualityは実行していない。

### References

- [PD-61 Parent Closure Review](./audit/119-aug-sep-frontend-inventory-parent-closure-review.md)
- [Frontend Inventory Parent](./inventory/frontend-inventory-summary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase PD-62 — Inventory Parent Explicit Product Owner Approval Record

**Status:** Completed / `CLOSE_WITH_DEFERRED_ITEMS`（Auxiliary: `CLOSED`）  
**Date:** 2026-09-14  
**Objective:** Product Ownerの明示承認を記録し、2026年8〜9月Frontend棚卸し・構造整理フェーズを正式Closureする。

### Changes / Result

- Approval Date=2026-09-14、Decision Owner=Product Ownerとして承認原文を記録した。
- Closure Criteria 10/10 PASS、Inventory/Product Decision blocker 0を確定し、Parentを`CLOSE_WITH_DEFERRED_ITEMS`（補助Status=`CLOSED`）へ更新した。
- PD-03とDeferred 10分類を後続へ維持し、October StandardizationとTechnical Bootcampの順序を正式Handoffとした。

### Decisions / Deferred

- Inventory ClosureはImplementation CompletionまたはProduction Readinessを意味しない。
- 次はOctober Frontend Standardization Kickoff。開始時にstandardization planを作成し、Technical BootcampはOctober Parent Closure後に実施する。
- Source変更、再Inventory、PD-03 Discovery、External Research、build/test/qualityは実行していない。

### References

- [PD-62 Approval Record](./audit/120-aug-sep-frontend-inventory-parent-explicit-product-owner-approval-record.md)
- [PD-61 Parent Closure Review](./audit/119-aug-sep-frontend-inventory-parent-closure-review.md)
- [Frontend Inventory Parent](./inventory/frontend-inventory-summary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase FS-01 — October Frontend Standardization Kickoff

**Status:** Completed / Program `ACTIVE`  
**Date:** 2026-09-14  
**Objective:** October Frontend StandardizationのParentを作成し、7 workstreamの順序、依存、Definition of Done、Closure条件を固定する。

### Changes / Result

- `frontend-standardization-plan.md`をParent / Source of Truthとして作成した。
- FS-02 TaxonomyからFS-09 Parent Closureまでのsequence、workstream別DoD、10 Closure Criteriaを定義した。
- 既存Structure Policy、Closure baseline、Deferred Ledger、PD-03 preservationを正式Inputとして接続した。

### Decisions / Deferred

- Phase ID `FS-01〜09`と既存Technical Debt ID `FS-01〜03`はnamespaceを明記して区別し、既存IDを変更しない。
- FS-01ではtaxonomy、directory、Token値、Tailwind設定、responsive、UI Regulationを決定していない。次はFS-02 Component Taxonomy。
- Source変更、inventory再集計、build/test/quality、External Researchは実行していない。BootcampはOctober Parent Closure後。

### References

- [October Frontend Standardization Plan](./architecture/frontend-standardization-plan.md)
- [FS-01 Kickoff Audit](./audit/121-october-frontend-standardization-kickoff.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)
- [Inventory Closure Approval](./audit/120-aug-sep-frontend-inventory-parent-explicit-product-owner-approval-record.md)

## Phase FS-02 — Component Taxonomy

**Status:** Completed / `APPROVED`  
**Date:** 2026-09-14  
**Objective:** Frontend ComponentのPrimary Role、責務、禁止事項、依存方向、reuse/state/business logic境界を正式化する。

### Changes / Result

- Route Entry、Page Entry、Layout/Shell、Feature、Composite、UI/Presentation、Primitive、Previewの8 Primary Categoryを承認した。
- Domain-specific reusableはPrimary CategoryではなくReuse Scope Qualifierとした。
- 代表16 filesと曖昧例5件を限定確認し、FS-02 DoD 8/8 PASS。全component再分類は行っていない。

### Decisions / Deferred

- `PanoptesShellPage`は現責務上Feature Orchestrator。name/directoryによる分類を禁止し、具体的state/ownershipはFS-03へ送る。
- Primitiveは条件付き承認。限定sampleに汎用正例はなく、新規抽出やdirectory migrationは行っていない。
- Source変更、build/test/quality、inventory recountは実行していない。

### References

- [FS-02 Component Taxonomy](./audit/122-fs02-component-taxonomy.md)
- [October Frontend Standardization Plan](./architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase FS-03 — Feature / UI / Layout Boundary

**Status:** Completed / `APPROVED`  
**Date:** 2026-09-14  
**Objective:** Feature、UI/Presentation、Layout/Shellのstate、controller、command、callback、mapping、composition、import境界を具体化する。

### Changes / Result

- server/canonical、feature、presentation、transient interactionの4 state ownerを確定した。
- UIはtyped callbackをemitし、Featureがcontroller/commandとloading/error lifecycleを所有する規則を承認した。
- Marketing/AppのHeader/Hero、SvelteKit Layout、Panoptes Feature Shellのownershipを固定し、代表11 filesを確認した。

### Decisions / Deferred

- `PanoptesShellPage`はFeature Orchestrator、App `+layout.svelte`はpersistent Layout。placement差はFS-04へ送る。
- Parent Criterion 2とFS-03 DoD 10/10はPASS。Source、build/test/quality、inventoryは変更・再実行していない。

### References

- [FS-03 Feature / UI / Layout Boundary](./audit/123-fs03-feature-ui-layout-boundary.md)
- [October Frontend Standardization Plan](./architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase FS-04 — Directory Structure

**Status:** Completed / `APPROVED`  
**Date:** 2026-09-14  
**Objective:** FS-02 TaxonomyとFS-03 Boundaryをtarget placement、public entry、canonical import、段階migrationへ写像する。

### Changes / Result

- `routes`、feature-local `pages/components/controller/commands/mapping/state`、reusable `layouts`、shared `ui/components`・`ui/primitives`からなるtarget modelを承認した。
- feature-local/shared、Framework Layout/reusable shell、direct import/optional public entry、legacy/exceptionの判定規則を確定した。
- 代表12 locationsを限定確認し、FS-04 DoD 10/10とOctober Parent Criterion 3をPASSに更新した。

### Decisions / Deferred

- `ComponentsBase`とlegacy storesは新規配置先にせず、new-code-firstとtouch-and-migrateで段階縮退する。利用回数だけでshared化しない。
- PD-03 `StrategyAnalysisPlanRail` / `StrategyAnalysisPlanRailCard`は移動・renameせずDeferredを維持した。
- Source移動、import rewrite、build/test/quality、inventory recountは実行していない。次はFS-05 Design Token。

### References

- [FS-04 Directory Structure](./audit/124-fs04-directory-structure.md)
- [October Frontend Standardization Plan](./architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase FS-05 — Design Token Foundation

**Status:** Completed / `APPROVED`  
**Date:** 2026-09-14  
**Objective:** Panoptes FrontendのToken taxonomy、Raw/Semantic境界、命名、Source of Truth、適用・例外・migration・変更規則を正式化する。

### Changes / Result

- color、typography、spacing、sizing、radius、border、shadow、z-index、breakpoint、motionのToken Contract v1を承認した。
- ComponentはSemantic tokenをdefaultとし、v1実行時正本を将来実装する単一の`src/lib/ui/tokens.css`とした。
- 代表10 stylesを限定確認し、FS-05 DoD 10/10とOctober Parent Criterion 4をPASSに更新した。

### Decisions / Deferred

- hardcoded valueは固有effect、asset intrinsic size、algorithmic/browser constraint、temporary debtに限り追跡可能な例外として許容する。
- exact breakpoint/ResponsiveはFS-07、Tailwind接続はFS-06/07、interaction/accessibility stateはFS-08へ送った。
- Token/CSS/Tailwind/Source変更、build/test/quality、inventory recountは実行していない。次はFS-06 Tailwind。

### References

- [FS-05 Design Token Foundation](./audit/125-fs05-design-token-foundation.md)
- [October Frontend Standardization Plan](./architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase FS-06 — Tailwind Standard

**Status:** Completed / `APPROVED`  
**Date:** 2026-09-14  
**Objective:** TailwindをDesign Token consumerとして利用するintegration、utility、styling、CSS共存、migration標準を正式化する。

### Changes / Result

- `tokens.css -> Tailwind adapter -> semantic utility -> Component`をcanonical directionとし、Tailwind側へのDesign値重複を禁止した。
- utility、責務別styling、typed variant/class passthrough、arbitrary value、CSS/Svelte style共存、class抽出の規則を承認した。
- 代表10 stylesを限定確認し、FS-06 DoD 10/10とOctober Parent Criterion 5をPASSに更新した。

### Decisions / Deferred

- `tokens.css`、Tailwind dependency/configは未実装。reset/Preflight ownerと採用version固有syntaxはImplementation Phaseで決める。
- exact breakpoint、responsive behavior、content priority、viewport acceptanceはFS-07へ送った。
- Source変更、build/test/quality、inventory recountは実行していない。次はFS-07 Responsive。

### References

- [FS-06 Tailwind Standard](./audit/126-fs06-tailwind-standard.md)
- [October Frontend Standardization Plan](./architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase FS-07 — Responsive Standard

**Status:** Completed / `APPROVED`  
**Date:** 2026-09-14  
**Objective:** Breakpoint、mobile-first、Layout/Component/Page adaptation、content priority、dense UI、navigation、overflow、viewport acceptanceを正式化する。

### Changes / Result

- `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`のBreakpoint Contractとowner別adaptationを承認した。
- dense UI、navigation、content priority、overflow/exception、6 viewportのacceptance規則を確定した。
- 代表11 UIを限定確認し、FS-07 DoD 10/10とOctober Parent Criterion 6をPASSに更新した。

### Decisions / Deferred

- 既存560〜1600pxの個別queryはmigration evidenceとし、canonical breakpointへ機械変換しない。
- Header代替navigation、Hero scale、Tabs/grid/chart overflow等の実装・visual検証は後続Implementationへ送った。
- Source、Token/Tailwind、build/test/quality、inventory recountは変更・実行していない。次はFS-08 UI Regulation。

### References

- [FS-07 Responsive Standard](./audit/127-fs07-responsive-standard.md)
- [October Frontend Standardization Plan](./architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase FS-08 — UI Regulation

**Status:** Completed / `APPROVED`  
**Date:** 2026-09-14  
**Objective:** FS-02〜07をvisual、interaction、state、accessibility、component、Token/Tailwind/Responsive、exception/reviewの統合規約へまとめる。

### Changes / Result

- UI Regulation v1としてvisual consistency、interaction、canonical state、accessibility、Form、Feedback、Analysis state、Motionを承認した。
- Token/Tailwind/Responsive complianceと、例外record、lightweight review resultを確定した。
- 代表12 UIを限定確認し、FS-08 DoD 10/10とOctober Parent Criterion 7をPASSに更新した。

### Decisions / Deferred

- Header navigation、Toast close name、Tabs selected state、Chart alternative等は改善候補であり、既存全UIのfailure件数や適合宣言とはしていない。
- Keyboard、screen reader、contrast、target size、reduced motion、6 viewportsの実測はImplementation/Verificationへ送った。
- Source、Token/Tailwind/Responsive、build/test/quality、inventory recountは変更・実行していない。次はFS-09 Parent Closure Review。

### References

- [FS-08 UI Regulation](./audit/128-fs08-ui-regulation.md)
- [October Frontend Standardization Plan](./architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase FS-09 — October Frontend Standardization Parent Closure Review

**Status:** Completed / `READY_FOR_APPROVAL / NOT_APPROVED`  
**Date:** 2026-09-14  
**Objective:** FS-02〜08の7標準、10 Closure Criteria、migration/deferred、verification、Technical Bootcamp readinessをClosure Reviewする。

### Changes / Result

- 7標準はすべて`APPROVED / COMPLETE`、Structure Policy整合はPASSと確認した。
- Criteriaは`PASS 9 / PENDING_NON_BLOCKER 1 / BLOCKED 0`、October Closure Blocker Countは0。
- Migration/Deferredを7 handoff classへ集約し、Bootcamp readinessをPASSとした。

### Decisions / Deferred

- 推奨Dispositionは`CLOSE_WITH_DEFERRED_ITEMS`、Parentは`READY_FOR_APPROVAL / NOT_APPROVED`。Product Owner承認前に正式Closeしない。
- 未実装Sourceとbrowser/accessibility/visual verificationはCriterion 9=`PENDING_NON_BLOCKER`として後続へ維持した。
- PD-03 Plan Rail保護を維持し、Policyの旧Product status記述を現行Registerへ最小同期した。Source/build/test/quality/inventoryは変更・実行していない。

### References

- [FS-09 October Parent Closure Review](./audit/129-fs09-october-frontend-standardization-parent-closure-review.md)
- [October Frontend Standardization Plan](./architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase FS-10 — October Frontend Standardization Explicit Product Owner Approval Record

**Status:** Completed / `CLOSE_WITH_DEFERRED_ITEMS / CLOSED`  
**Date:** 2026-09-14  
**Decision Owner:** Product Owner  
**Objective:** Product Ownerの明示承認を記録し、October Frontend Standardization Parentを正式Closureする。

### Changes / Result

- 提供されたApproval Evidence、Approval Date、Decision Ownerを正式記録した。
- Parentを`CLOSE_WITH_DEFERRED_ITEMS / CLOSED`、Closure Blocker Count 0へ更新した。
- 7標準の`APPROVED / COMPLETE`、Criteria `PASS 9 / PENDING_NON_BLOCKER 1 / BLOCKED 0`を維持した。

### Decisions / Deferred

- Directory、Token、Tailwind、new/touched adoption、legacy CSS、Responsive、UI remediation、browser/accessibility verificationを正式handoffした。`Deferred != Forgotten`。
- PD-03 Plan Rail保護と`Closure != Source Migration Completion != Production Readiness`を維持した。
- Source、build/test/quality、inventoryは変更・実行していない。正式次段階はPanoptes Technical Bootcamp。

### References

- [FS-10 Explicit Product Owner Approval Record](./audit/130-october-frontend-standardization-explicit-product-owner-approval-record.md)
- [October Frontend Standardization Plan](./architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase TB-01 — Panoptes Technical Bootcamp Curriculum / Learning Architecture

**Status:** Completed / `READY_FOR_TB-02`  
**Date:** 2026-09-14  
**Category:** Learning / Architecture / Planning  
**Objective:** Panoptes Technical Bootcampの学習範囲、依存順、到達目標、演習・評価modelを定義する。

### Changes / Result

- Bootcamp Parent / Curriculum Source of Truthを新設し、28 Modulesを7 Stagesへ依存関係順に配置した。
- 各Moduleへdifficulty、prerequisite、learning goal、representative references、practiceを定義した。
- practice、assessment、progress tracking、Module artifact strategy、Bootcamp completion criteriaを確定し、TB-01 DoDは`10 / 10 PASS`、Planning blockerは0。

### Decisions / Deferred

- Curriculumは一般論→Panoptes mapping→実コード/data flow→設計理由→exerciseの順とし、implemented/documented/deferredを常に区別する。
- Module本文の大量生成は行わず、後続で`docs/learning/modules/NN-<slug>.md`へ1 Moduleまたは密接な小群ずつ追加する。
- PD-03 Plan Rail保護を維持した。Source、build/test/quality、Repo-wide調査は変更・実行していない。次はTB-02 M01 Panoptes Overall Architecture。

### References

- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [October Frontend Standardization Plan](./architecture/frontend-standardization-plan.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase TB-02 — Module 01: Panoptes Overall Architecture

**Status:** Completed / `READY_FOR_M02`  
**Date:** 2026-10-05  
**Category:** Learning / Architecture  
**Objective:** Panoptesの主要System、責務、Source of Truth、Analysis request flowをCurrent/Target/Deferredを分けて説明できるM01教材を作成する。

### Changes / Result

- M01教材を作成し、Svelte/SvelteKit、BFF、Rails、PostgreSQL、Queue、Worker、Chromium、LLM、AnalysisJob、Evidence/Snapshotの全体地図を定義した。
- System ArchitectureとAnalysis Request Flowの2図、layer responsibility map、representative repository mapping、practice/answer guideを追加した。
- CurrentはOrganization read flowまで、production Analysis flowは明示的unavailable、Queue/Worker/canonical SnapshotはTarget/Deferredであることを区別した。M01 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Railsをcanonical business decision owner、PostgreSQLをpersistent business data store、Workerをtechnical execution ownerとする既存boundaryを維持した。
- Queue/retry/idempotency、Worker、LLM、Snapshot schema等の詳細実装は後続Moduleへ送り、M01で仕様を創作していない。
- Source、build/test/quality、Repo-wide調査は変更・実行していない。次はTB-03 M02 Svelte / SvelteKit。

### References

- [M01 Panoptes Overall Architecture](./learning/modules/01-panoptes-overall-architecture.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)

## Phase TB-03 — Module 02: Svelte / SvelteKit

**Status:** Completed / `READY_FOR_M03`  
**Date:** 2026-10-05  
**Category:** Learning / Frontend Architecture  
**Objective:** Svelte 5とSvelteKitの役割、Route/Page/Layout、server/client、rendering、state/props/callback境界をPanoptesの代表実装から説明するM02教材を作成する。

### Changes / Result

- Svelte component/runes/store/lifecycle/snippetと、SvelteKit routing/load/action/request/rendering modelを一般論からPanoptes mappingへ接続した。
- `/`、`/app`、`/app/analysis`、root/App Layout、server auth、Organization action、BFF、Shell Feature/UIの代表10 mappingを記録した。
- Knowledge、Code Reading、Route Trace、Design Exerciseと回答を追加し、M02 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- `src/lib/layouts`と`src/lib/ui/*`は承認済みTargetであり、現行配置済みとは扱わない。SvelteKit BFFとRails canonical business backendも分離した。
- 全Svelte file確認、Directory migration、rendering performance tuning、M03以降の教材生成は行っていない。
- Source、build/test/qualityは変更・実行していない。次はTB-04 M03 Component Taxonomy。

### References

- [M02 Svelte / SvelteKit](./learning/modules/02-svelte-sveltekit.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)

## Phase TB-04 — Module 03: Component Taxonomy

**Status:** Completed / `READY_FOR_M04`  
**Date:** 2026-10-05  
**Category:** Learning / Frontend Architecture  
**Objective:** FS-02で承認済みの8 Categoryを、Panoptes Componentの責務から自力で分類できるM03教材へ変換する。

### Changes / Result

- Route Entry、Page Entry、Layout/Shell、Feature、Composite、UI/Presentation、Primitive、Previewのcontractと依存方向を教材化した。
- 12区分の代表mappingと5つの曖昧例を確認し、名前ではなくowner/state/command/composition/reuseで判定するheuristicを定義した。
- `PanoptesShellPage`をFeature Orchestratorとする訂正、Target directory未migration、Primitive正例未確認を明示した。M03 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Taxonomyは再設計せず、Domain-specific reusableをReuse Scope Qualifierとして維持した。
- 全107 Component分類、Directory migration、Primitive抽出、M04以降の教材生成は行っていない。
- Source、build/test/qualityは変更・実行していない。次はTB-05 M04 Feature / UI / Layout Boundary。

### References

- [M03 Component Taxonomy](./learning/modules/03-component-taxonomy.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)

## Phase TB-05 — Module 04: Feature / UI / Layout Boundary

**Status:** Completed / `READY_FOR_M05`  
**Date:** 2026-10-05  
**Category:** Learning / Frontend Architecture  
**Objective:** Feature、UI/Presentation、Layout/Shellのstate、controller、command、callback、composition ownershipを判断できるM04教材を作成する。

### Changes / Result

- Feature/UI/Layout contract、4 state class、Controller/Command ownership、Data Down / Callback Up、Page/Composite境界を教材化した。
- Shell、App Layout、Marketing、Signup、Analysis、Strategy、Tab UIの代表9例を限定確認し、owner/dependency/stateを整理した。
- UI→API、UI→store mutation、Layout→Feature command、Page→business rule、Feature→Rails rule duplication、Composite→use-case ownerの6違反とrefactoring方向を定義した。M04 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Taxonomy/FS-03標準は再設計せず、Railsをbusiness decision owner、Featureをuse-case owner、UIをintent emitter、Layoutをpersistent structure ownerとして維持した。
- 全Component Boundary audit、Source migration、M05以降の教材生成は行っていない。
- Source、build/test/qualityは変更・実行していない。次はTB-06 M05 Directory Structure。

### References

- [M04 Feature / UI / Layout Boundary](./learning/modules/04-feature-ui-layout-boundary.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)

## Phase TB-06 — Module 05: Directory Structure

**Status:** Completed / `READY_FOR_M06`  
**Date:** 2026-10-05  
**Category:** Learning / Frontend Architecture  
**Objective:** Panoptes Frontendの責務をcanonical directoryへ写像し、Feature-local/Shared、import、段階migrationを判断できるM05教材を作成する。

### Changes / Result

- FS-04のtarget structure、Route/Page/Feature/Layout/UI/Primitive placement、Reuse Scope Qualifier、dependency/import ruleを教材化した。
- 代表11 fileを限定確認し、Current path、Taxonomy、Target placement、Migration statusを整理した。
- `index.ts`の限定public entry、direct canonical import、Current/Target/Deferred Migration、new-code-first/touch-and-migrateの実践問題と回答を収録した。M05 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Feature-localをdefaultとし、利用回数だけでShared化しない。`PanoptesTabNav`はcross-feature contract evidenceがないため即Shared化しない教材判断とした。
- PD-03のStrategyAnalysisPlanRail / Cardはpreservationを維持し、Directory Standardを移動承認として扱わない。
- 全file再分類、Source移動、M06以降の教材生成、build/test/qualityは行っていない。次はTB-07 M06 State / Controller / Command。

### References

- [M05 Directory Structure](./learning/modules/05-directory-structure.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase TB-07 — Module 06: State / Controller / Command

**Status:** Completed / `READY_FOR_M07`  
**Date:** 2026-10-05  
**Category:** Learning / Frontend Architecture  
**Objective:** State ownership、Controller lifecycle、Command/Client境界、UI intentからRails response表示までを判断できるM06教材を作成する。

### Changes / Result

- Persistent/Server/Feature/Presentation/Transient/Derived state、owner判断、Svelte `$derived`/store `derived`を教材化した。
- Controller/Store/View ModelとCommand/Clientを分離し、現行ActionsがCommand相当operationとstore/polling coordinationを同居させるCURRENT実装であることを明示した。
- 代表11例、UI→Controller→Action/Command→Client→BFF→Rails flow、request state/business lifecycle、technical retry/bootstrap retry/business reanalysisの違い、演習と回答を収録した。M06 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Railsをbusiness/authorization/AnalysisJob/Snapshotのcanonical ownerとして維持し、Frontend Storeはprojection、Controllerはlifecycle、Commandはoperation intent、Clientはtransportとした。
- 全Feature state audit、ActionsのCommands再編、未実装Backend、M07以降の教材生成は行っていない。
- Source、build/test/qualityは変更・実行していない。次はTB-08 M07 BFF。

### References

- [M06 State / Controller / Command](./learning/modules/06-state-controller-command.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase TB-08 — Module 07: BFF

**Status:** Completed / `READY_FOR_M08`  
**Date:** 2026-10-05  
**Category:** Learning / System Architecture  
**Objective:** PanoptesのSvelteKit BFFについて、Browser/Client/Rails、Auth/Session、Organization、proxy/error/security境界を判断できるM07教材を作成する。

### Changes / Result

- BFF fundamentals、責務map、Supabase SSR cookie/session、route guardとRails business authorization、Organization scopeを教材化した。
- Explicit GET proxy、safe header/token forwarding、upstream status preservation、safe error、same-origin redirect、server load/action/`+server.ts`の使い分けを整理した。
- Currentの5 read-only BFF surfaceとProduction Analysis flowのTarget/Deferredを分離し、代表11例、security violation、Start Analysis API演習と回答を収録した。M07 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- BFFをFrontend-specific session/transport boundary、Railsをbusiness authorization/rule/transition/persistence ownerとして維持した。
- Route guard、active Organization cookie、BFF通過をfinal authorizationと扱わず、Rails revalidationを必須とした。
- 全BFF endpoint/security audit、Production Project/AnalysisJob API、M08以降の教材生成は行っていない。Source、build/test/qualityも変更・実行していない。次はTB-09 M08 Rails Business Backend。

### References

- [M07 BFF](./learning/modules/07-bff.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)

## Phase TB-09 — Module 08: Rails Business Backend

**Status:** Completed / `READY_FOR_M09`  
**Date:** 2026-10-05  
**Category:** Learning / Backend Architecture  
**Objective:** RailsをCanonical Business Decision Ownerとして理解し、authorization、rule、transition、transaction、persistence、Worker境界を判断できるM08教材を作成する。

### Changes / Result

- Rails/API-only fundamentals、Organization detailのCURRENT request lifecycle、Controller/Model/Service/DBの責務を教材化した。
- JWT/User mapping、Organization membership/resource authorization、business rule、AnalysisJob Target state、transaction/persistence、Rails/Worker、error/Usage/Audit境界を整理した。
- PD-04のPartial/Snapshot contractとImplementation未完了を分離し、代表11例、責務/trace/authorization/transition/Snapshot設計演習と回答を収録した。M08 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- CURRENT RailsはIdentity/Organization readのみ。Project、AnalysisJob、Snapshot、Queue/Worker、Usage/AuditはTarget/Deferredとして維持した。
- Railsをcanonical business/authorization/transition owner、PostgreSQLをdurable data boundary、Workerをtechnical execution ownerとした。
- 全Rails監査、Backend再設計、M09以降の教材生成は行っていない。Source、build/test/qualityも変更・実行していない。次はTB-10 M09 PostgreSQL / Source of Truth。

### References

- [M08 Rails Business Backend](./learning/modules/08-rails-business-backend.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase TB-10 — Module 09: PostgreSQL / Source of Truth

**Status:** Completed / `READY_FOR_M10`  
**Date:** 2026-10-05  
**Category:** Learning / Data Architecture  
**Objective:** PostgreSQLをPersistent Canonical Data Storeとして理解し、RailsのDecision OwnershipとDBのdurability/integrity責務を分けて判断できるM09教材を作成する。

### Changes / Result

- RDB/PostgreSQL、Source of Truth、Rails/DB、Entity/Relation、PK/FK/constraint、validation layerを教材化した。
- transaction/concurrency、current/history/Snapshot、lineage、derived/cache、audit、migration/indexをCURRENT/TARGET/DEFERREDで整理した。
- CURRENT Identity/Organization schemaの代表10例と、責務・relation・constraint・transaction・違反検出・AnalysisJob設計演習および回答を収録した。M09 DoDは`10 / 10 PASS`。
- Bootcamp ParentのStage B M08–M11番号を、実施済みModule briefの順序へ同期した。

### Decisions / Deferred

- RailsをCanonical Business Decision Owner、PostgreSQLをPersistent Canonical Data Storeとし、矛盾しない二種類のauthorityとして明示した。
- CURRENT schemaはUser、Organization、OrganizationMembership、SystemRoleまで。Project、AnalysisJob、Snapshot、Usage、Audit、LineageとそのtransactionはTarget/Deferredを維持した。
- 全DB/schema監査、DB再設計、schema/source変更、migration実行、M10以降の教材生成は行っていない。build/test/qualityも実行していない。次はTB-11 M10 Auth / Authorization / Organization。

### References

- [M09 PostgreSQL / Source of Truth](./learning/modules/09-postgresql-source-of-truth.md)
- [M08 Rails Business Backend](./learning/modules/08-rails-business-backend.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase TB-11 — Module 10: Auth / Authorization / Organization

**Status:** Completed / `READY_FOR_M11`  
**Date:** 2026-10-05  
**Category:** Learning / Identity and Authorization  
**Objective:** Authentication、session、Organization contextと、Railsが所有するresource/operation Authorizationを分離して説明・判断できるM10教材を作成する。

### Changes / Result

- Supabase identity、SSR cookie/session、SvelteKit hooks/Route Guard、BFF token forwarding、Rails JWT再検証/User mappingのCURRENT flowを教材化した。
- Organization/Membership/Role、resource ownership、BFF context guardとBusiness Authorization、401/403/404、multi-tenant isolation、safe return-toを整理した。
- PD-01Bのdeep-link/current Organization contract、代表12例、分類・request trace・tenant isolation・違反検出・Snapshot deep-link演習と回答を収録した。M10 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Supabase/Auth ProviderはIdentity、SvelteKit/BFFはsession/transport/entry guard、RailsはApplication Authorization、PostgreSQLはrelation integrityを所有する。
- BFF `organization_owner`とRails `owner`のrole語彙差は同一性を推測せず、production metadata/DB mapping contractのverification handoffとして保持した。
- Project/AnalysisJob/Snapshot authorization、exact deep-link/current pointer API、SSO/Passkey、full Route permission auditはTarget/Deferred。Source変更、build/test/quality、M11以降の教材生成は行っていない。次はTB-12 M11 API / OpenAPI。

### References

- [M10 Auth / Authorization / Organization](./learning/modules/10-auth-authorization-organization.md)
- [M07 BFF](./learning/modules/07-bff.md)
- [M08 Rails Business Backend](./learning/modules/08-rails-business-backend.md)
- [M09 PostgreSQL / Source of Truth](./learning/modules/09-postgresql-source-of-truth.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase TB-12 — Module 11: API / OpenAPI

**Status:** Completed / `READY_FOR_M12`  
**Date:** 2026-10-06  
**Category:** Learning / API Contract  
**Objective:** PanoptesのAPIをmethod・request・response・status・error・auth・versionを含むsystem間contractとして読み、Client/BFF/Rails/OpenAPIの責務を判断できるM11教材を作成する。

### Changes / Result

- API/HTTP fundamentals、endpoint/operation、request/response envelope、status/error、validation/auth boundaryを教材化した。
- Client/Command/BFF/Rails、OpenAPI paths/schema/security/operationId、versioning/backward compatibility、pagination/idempotencyをCURRENT/TARGET/DEFERREDで整理した。
- CURRENT Organization detailをFeatureからRails responseまで追跡し、代表12例、Contract Reading・status・責務・trace・違反検出・Target Analysis API演習と回答を収録した。M11 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- OpenAPI draftはCURRENT確認で`18 operations / 18 unique operationIds`だが、Rails/BFF実装は5 read endpoint。OpenAPI定義をProduction実装完了の証拠にしない。
- API proseのError例は`request_id`を`error`内、OpenAPI/CURRENT Railsは`meta`内に置くため、contract documentation driftとして後続同期へhandoffした。
- 全endpoint監査、API/OpenAPI変更、Target operation実装、lint/breaking diff、build/test/quality、M12以降の教材生成は行っていない。次はTB-13 M12 AnalysisJob lifecycle。

### References

- [M11 API / OpenAPI](./learning/modules/11-api-openapi.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Panoptes Rails API v1 Contract](./api/panoptes-api-v1.md)
- [OpenAPI draft](./api/openapi-draft.yaml)
- [API Boundary](./architecture/api-boundary.md)

## Phase TB-13 — Module 12: AnalysisJob Lifecycle

**Status:** Completed / `READY_FOR_M13`  
**Date:** 2026-10-06  
**Category:** Learning / Analysis Lifecycle  
**Objective:** AnalysisJobのcanonical lifecycle、terminal outcome、Rails/Worker ownership、Retry/Reanalysis、Snapshot eligibilityを説明・判断できるM12教材を作成する。

### Changes / Result

- Job fundamentals、canonical 10-step lifecycleと5 terminal outcomes、Request/Job/Worker/Product/Presentation stateの違いを教材化した。
- PD-04 `partially_completed`、cancel/timeout、Rails/Worker、Retry/Reanalysis、Evidence/Result/Snapshot、progress/error/usage境界を整理した。
- 2つのMermaid図、代表12例、state ordering・classification・outcome・Snapshot eligibility・責務演習と回答を収録した。M12 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Railsをcanonical lifecycle/business outcome owner、Workerをtechnical fact/artifact producerとし、Production Job backendが未実装であることを維持した。
- Phase A-5 state-machine文書のSnapshot/current記述と後発PD-04の差はPD-04を優先し、document synchronization handoffとして記録した。
- Repo-wide Job監査、lifecycle再設計、Rails/Worker/OpenAPI/Source変更、build/test/quality、M13以降の教材生成は行っていない。次はTB-14 M13 Async Job / Queue / Retry / Idempotency。

### References

- [M12 AnalysisJob Lifecycle](./learning/modules/12-analysis-job-lifecycle.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [AnalysisJob State Machine](./api/analysis-job-state-machine.md)
- [AnalysisJob Frontend Boundary](./architecture/analysis-job-frontend-boundary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase TB-14 — Module 13: Async Job / Queue / Retry / Idempotency

**Status:** Completed / `READY_FOR_M14`  
**Date:** 2026-10-06  
**Category:** Learning / Async Reliability  
**Objective:** Panoptesの長時間Analysisについて、Queue delivery、Retry、Idempotency、duplicate execution、timeout/cancellation、DLQ/heartbeat、Rails/Queue/Worker責務を説明・判断できるM13教材を作成する。

### Changes / Result

- Sync/Async、Producer/Consumer、AnalysisJob/Queue Message/Attempt、delivery semantics、Retry/Reanalysis、Idempotencyを教材化した。
- duplicate delivery、atomic claim、out-of-order result、timeout/cancellation、DLQ/poison message、heartbeat/progress、artifact/usage boundaryを整理した。
- 2つのMermaid図、代表12例、classification・retryability・violation detection等の演習と回答を収録した。M13 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Railsをcanonical business owner、Queueをdelivery mechanism、Workerをtechnical executorとして維持し、Queue/Workerがbusiness outcomeを決めない境界を固定した。
- CURRENTはfrontend polling、client key生成、mock replay/conflict、fail-closed clientまでであり、Production Queue/Worker/server-side idempotency enforcementは未実装と明記した。
- Queue製品/保証、Attempt/claim/lease schema、retry具体値、DLQ、heartbeat、cancellation propagation、artifact identityはDEFERRED。Source変更、build/test/quality、M14教材作成は行っていない。次はTB-15 M14 Python Worker / Chromium / Collection。

### References

- [M13 Async Job / Queue / Retry / Idempotency](./learning/modules/13-async-job-queue-retry-idempotency.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [M12 AnalysisJob Lifecycle](./learning/modules/12-analysis-job-lifecycle.md)
- [AnalysisJob State Machine](./api/analysis-job-state-machine.md)
- [API Boundary](./architecture/api-boundary.md)

## Phase TB-15 — Module 14: Python Worker / Chromium / Collection

**Status:** Completed / `READY_FOR_M15`  
**Date:** 2026-10-06  
**Category:** Learning / Worker and Collection  
**Objective:** Panoptes Workerのretrieval、Chromium、Evidence/Artifact生成、technical failure reportingと、Rails/Queue/Worker/Artifact Storeの責務境界を説明・判断できるM14教材を作成する。

### Changes / Result

- Worker fundamentals、HTTP fetchとBrowser execution、Collection Pipeline、preflight/redirect/stabilization/viewport、HTML/DOM/Screenshotの違いを教材化した。
- Raw Evidence→Normalized→Observation→Analysis→Product Result→Snapshotの階層、Artifact identity/provenance、partial technical success、cleanup、resource/security boundaryを整理した。
- 2つのMermaid図、代表12例、classification・HTTP/Chromium判断・partial failure・artifact・violation detection等の演習と回答を収録した。M14 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Workerをtechnical executor、Railsをcanonical business ownerとして維持し、Observation Output Contract v1は承認済みでもimplementation=`NOT_IMPLEMENTED`であることを明記した。
- scoped checkでProduction Python/Playwright/Selenium/BeautifulSoup/Chromium実装・manifestは確認できず、特定libraryや旧prototypeをCURRENT正本へ昇格させていない。
- Worker runtime/topology、Queue integration、wait/viewport、Artifact Store/key/retention、resource limits、retry具体値、security hardening、exact JSON/DB/OpenAPIはDEFERRED。Source変更、Web/crawler/Chromium実行、build/test/quality、M15教材作成は行っていない。次はTB-16 M15 Snapshot / History / Lineage。

### References

- [M14 Python Worker / Chromium / Collection](./learning/modules/14-python-worker-chromium-collection.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [M13 Async Job / Queue / Retry / Idempotency](./learning/modules/13-async-job-queue-retry-idempotency.md)
- [API Boundary](./architecture/api-boundary.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase TB-16 — Module 15: Snapshot / History / Lineage

**Status:** Completed / `READY_FOR_M16`  
**Date:** 2026-10-06  
**Category:** Learning / Snapshot and Lineage  
**Objective:** Snapshot、Current/Latest/History、Result/Artifact、lineage/version、Partial/Strategy Source、deep-link境界を説明・判断できるM15教材を作成する。

### Changes / Result

- Snapshot fundamentals、immutable history、latest/current/Strategy Source/historical separation、Result/Artifact/Snapshot、Evidence chainを教材化した。
- generation-time version、historical compatibility、Reanalysis/new lineage、PD-04 Limited Snapshotと`EVIDENCE_ONLY`、PD-01 Model C/deep-link authorizationを整理した。
- 2つのMermaid図、代表12例、pointer・eligibility・lineage・compatibility・violation detection等の演習と回答を収録した。M15 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- PD-01/PD-04の承認済みContractを維持し、`latest != current != strategy source != historical Snapshot`、new Job/new Snapshot、no silent fallbackを教材の基準とした。
- CURRENT frontend/mockにはcurrent/stable projectionがある一方、mock aggregateはstrategy selection/taskを更新するため、Production immutable Snapshot implementationの証拠ではないと明記した。
- Rails schema/persistence、explicit Snapshot URL/API、history UI、artifact/full lineage、compatibility、Strategy Source persistence、retention/reuse/migrationはDEFERRED。Source変更、build/test/quality、M16教材作成は行っていない。次はTB-17 M16 Common 6 Axis。

### References

- [M15 Snapshot / History / Lineage](./learning/modules/15-snapshot-history-lineage.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Product Decision Register](./product/product-decision-register.md)
- [M12 AnalysisJob Lifecycle](./learning/modules/12-analysis-job-lifecycle.md)
- [M14 Python Worker / Chromium / Collection](./learning/modules/14-python-worker-chromium-collection.md)

## Phase TB-17 — Module 16: Common 6 Axis

**Status:** Completed / `READY_FOR_M17`  
**Date:** 2026-10-06  
**Category:** Learning / Analysis Domain  
**Objective:** Axis Contract v1のCommon 6 Axisについて、意味・境界・Evidence/Observation・Internal/Visual・Missing/Partial・Formula/Strategy境界を説明・判断できるM16教材を作成する。

### Changes / Result

- 6つのCanonical ID/Label/Definition/Order、included/excluded semantics、cross-axis boundary、Hero cross-axis例を教材化した。
- Evidence→Observation→Submetric→Axis→Score、Internal/Visual、Observable Evidence Boundary、PD-02D Treatment Model B、comparison/Strategy boundaryを整理した。
- 2つのMermaid図、代表12例、Axis分類・boundary・Evidence・Missing・comparison・violation detection等の演習と回答を収録した。M16 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Axis Contract v1=`ACTIVE`とCanonical Orderを維持し、Orderをweight/priority/UI/processing順へ読み替えていない。
- CURRENT fixture/UIのlegacy `funnelStrength`、非Canonical順、short label差、synthetic radar、missing→0 fallbackはAxis/Formula正本ではないと明記した。
- Exact parameter/weight/fusion ratio/threshold/rounding、calibration、dedup、physical schema/API、implementation、legacy migrationはDEFERRED。Source変更、build/test/quality、M17教材作成は行っていない。次はTB-18 M17 Observation → Submetric → Formula。

### References

- [M16 Common 6 Axis](./learning/modules/16-common-six-axis.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [M15 Snapshot / History / Lineage](./learning/modules/15-snapshot-history-lineage.md)

## Phase TB-18 — Module 17: Observation → Submetric → Formula

**Status:** Completed / `READY_FOR_M18`  
**Date:** 2026-10-06  
**Category:** Learning / Measurement and Formula  
**Objective:** EvidenceからObservation、Submetric、Formula、Axis/Layer/Overall Scoreへ進むmeasurement pipelineと、version・eligibility・ownershipを説明・判断できるM17教材を作成する。

### Changes / Result

- Observation Output Contract v1、Submetric、Approved Formula Architecture/Policy、Formula Version/Registry、`AnalysisScoreResult` logical outputを教材化した。
- Missing/N/A/Unknown/Partial/Valid Zero、Eligibility/Score State、Rails/Worker ownership、lineage/explainability、Calibration/Strategy boundaryを整理した。
- 2つのMermaid図、数値parameterを発明しないworked example、代表12例、classification・eligibility・version・ownership・violation detection等の演習と回答を収録した。M17 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Formula Architecture・Parameter Policy・Formula Version・Backend Wire Logical Contract・Ownership Option Cが承認済みであることを維持し、Formula全体を未決定とは扱っていない。
- CURRENT frontend/mockのscore/radar/fallback/synthetic mappingはObservation/Formula正本ではなく、Production `AnalysisScoreResult`/lineage実装も存在しないと明記した。
- Exact weight/ratio/normalization/threshold/rounding、Calibration、confidence calibration、dedup、physical JSON/DB/OpenAPI、runtime実装はDEFERRED。Source変更、build/test/quality、M18教材作成は行っていない。次はTB-19 M18 Missing / Partial / Eligibility。

### References

- [M17 Observation → Submetric → Formula](./learning/modules/17-observation-submetric-formula.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [M16 Common 6 Axis](./learning/modules/16-common-six-axis.md)

## Phase TB-19 — Module 18: Missing / Partial / Eligibility

**Status:** Completed / `READY_FOR_M19`  
**Date:** 2026-10-06  
**Category:** Learning / Missing and Eligibility  
**Objective:** PD-02D Treatment Model Bに基づき、Missing、N/A、Unknown、Partial、Valid Zero、Completeness、Eligibility、Score Stateを区別し、Job・Axis・Snapshot・UI/APIまで説明できるM18教材を作成する。

### Changes / Result

- Completeness、Eligibility、Score State、numeric valueを分離し、`PARTIAL + CALCULATED`と`NON_CALCULATED + no value`を説明した。
- Formula/Layer、`partially_completed` Job、Limited Snapshot、comparison/Strategy、API/persistence/UIの境界を接続した。
- Mermaid図2点、代表mapping 12件、分類・Eligibility・API・violation detection演習と回答を収録した。M18 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Missing/N/A/Unknownを0やnegativeへ変換せず、Valid Zeroを独立した正式値として維持する。
- one-layer fallback、weight redistribution、exact threshold、required set、minimum observation count、calibration、physical schema、Production implementationはDEFERRED。
- Source変更、build/test/quality、M19教材作成は行っていない。次はTB-20 M19 Design Token。

### References

- [M18 Missing / Partial / Eligibility](./learning/modules/18-missing-partial-eligibility.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Score / Axis Data Dictionary](./product/score-axis-data-dictionary.md)
- [Product Decision Register](./product/product-decision-register.md)
- [M17 Observation / Submetric / Formula](./learning/modules/17-observation-submetric-formula.md)

## Phase TB-20 — Module 19: Design Token

**Status:** Completed / `READY_FOR_M20`  
**Date:** 2026-10-06  
**Category:** Learning / Frontend Design Foundation  
**Objective:** FS-05 Design Token Contract v1について、Raw/Semantic境界、Category、Source of Truth、consumer/exception/migrationを説明・判断できるM19教材を作成する。

### Changes / Result

- Design TokenとCSS variable、RawとSemantic、SpacingとSizing、TokenとProduct meaningを分離した。
- 承認済み10 Category、Canonical naming、`Raw -> Semantic -> Component`、`tokens.css -> Tailwind adapter -> utility -> Component`を教材化した。
- Mermaid図2点、代表mapping 10件、refactoring・分類・例外・Tailwind boundary・violation detection演習と回答を収録した。M19 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- `src/lib/ui/tokens.css`はTarget Source of Truthであり、CURRENTでは未実装。Tailwind dependency/configも未導入である。
- minimal Token実装、full migration、legacy cleanup、Tailwind connection、visual/accessibility verification、exact adapter/toolingはDEFERRED。
- Token/Source変更、build/test/quality、M20教材作成は行っていない。次はTB-21 M20 Tailwind。

### References

- [M19 Design Token](./learning/modules/19-design-token.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)
- [October Frontend Standardization Plan](./architecture/frontend-standardization-plan.md)
- [FS-05 Design Token Foundation](./audit/125-fs05-design-token-foundation.md)

## Phase TB-21 — Module 20: Tailwind

**Status:** Completed / `READY_FOR_M21`  
**Date:** 2026-10-06  
**Category:** Learning / Frontend Styling  
**Objective:** FS-06 Tailwind Standardについて、Utility-first、Token consumer境界、CSS共存、例外、段階migrationを説明・判断できるM20教材を作成する。

### Changes / Result

- TailwindをDesign System/Token SoTではなくStyling Consumer / Utility Layerとして説明した。
- 7 Utility Category、Mobile-first responsive/state、Global/Component CSS共存、arbitrary value、class extraction、visual parityを教材化した。
- Mermaid図2点、代表mapping 10件、分類・styling decision・responsive・migration・violation detection演習と回答を収録した。M20 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- CURRENT repositoryにはTailwind dependency/config、PostCSS integration、`src/lib/ui/tokens.css`がないため、Tailwindは`TARGET / NOT IMPLEMENTED`として扱う。
- Tailwind install/version/config、Token implementation、adapter/reset connection、CSS migration、browser/visual/accessibility verificationはDEFERRED。
- Source変更、build/test/quality、M21教材作成は行っていない。次はTB-22 M21 Responsive。

### References

- [M20 Tailwind](./learning/modules/20-tailwind.md)
- [M19 Design Token](./learning/modules/19-design-token.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)
- [FS-06 Tailwind Standard](./audit/126-fs06-tailwind-standard.md)

## Phase TB-22 — Module 21: Responsive

**Status:** Completed / `READY_FOR_M22`  
**Date:** 2026-10-06  
**Category:** Learning / Responsive Design  
**Objective:** FS-07 Responsive Contract v1について、Mobile-first、Breakpoint、ownership、content priority、dense UI、overflow、Acceptance Viewportを説明・判断できるM21教材を作成する。

### Changes / Result

- Canonical Breakpointと6 Acceptance Viewportsを区別し、device名ではなくlayout thresholdとして説明した。
- Layout/Page/Component responsibility、Content Priority、dense UI、Navigation、Typography/Spacing、Root/Local Overflowを教材化した。
- Mermaid図2点、代表mapping 11件、責務・Breakpoint・priority・dense UI・overflow・viewport・violation detection演習と回答を収録した。M21 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- 既存`560 / 720 / 900 / 980 / 1180 / 1280 / 1600px`等はmigration evidenceであり、Canonical breakpointへ機械変換しない。
- Full Source migration、全Component remediation、browser/manual verification、screenshot regression、accessibility実測はDEFERRED。
- Source変更、build/test/quality、browser実測、M22教材作成は行っていない。次はTB-23 M22 UI Regulation / Accessibility。

### References

- [M21 Responsive](./learning/modules/21-responsive.md)
- [M20 Tailwind](./learning/modules/20-tailwind.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)
- [FS-07 Responsive Standard](./audit/127-fs07-responsive-standard.md)

## Phase TB-23 — Module 22: UI Regulation / Accessibility

**Status:** Completed / `READY_FOR_M23`  
**Date:** 2026-10-07  
**Category:** Learning / UI Quality and Accessibility  
**Objective:** FS-08 UI Regulation v1について、Visual/Interaction、Canonical State、Accessibility、Form/Feedback、Exception/Reviewを説明・判断できるM22教材を作成する。

### Changes / Result

- Link/Button、Hover/Focus、Pressed/Selected、Disabled/LoadingとProduct/UI state representationを分離した。
- Semantic HTML、Keyboard/Focus、Name/Label、Contrast、Target Size、Reduced Motion、Form/Feedback、Empty/Error/Partialを教材化した。
- Mermaid図2点、代表mapping 12件、semantic element・state・form・responsive accessibility・violation detection演習と回答を収録した。M22 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- UI RegulationはVisual StyleだけでなくComponent Contract、Product state mapping、Accessibility、Exception/Reviewを含む。
- Full accessibility audit、screen reader/keyboard/browser実測、contrast/target measurement、visual regression、全UI remediationはDEFERRED。
- Source変更、build/test/quality、browser実測、M23教材作成は行っていない。次はTB-24 M23 Security Fundamentals。

### References

- [M22 UI Regulation / Accessibility](./learning/modules/22-ui-regulation-accessibility.md)
- [M21 Responsive](./learning/modules/21-responsive.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)
- [FS-08 UI Regulation](./audit/128-fs08-ui-regulation.md)

## Phase TB-24 — Module 23: Security Fundamentals

**Status:** Completed / `READY_FOR_M24`  
**Date:** 2026-10-07  
**Category:** Learning / Security Architecture  
**Objective:** PanoptesのAsset、Threat、Trust Boundary、Defense in Depthと各Layerのsecurity ownershipを説明・判断できるM23教材を作成する。

### Changes / Result

- CIA、Authentication/Authorization、Session/Cookie/CSRF/XSS、Input/API/Tenant/Secret/Data保護をPanoptesの責務境界へ接続した。
- Worker/External Web/SSRF/Chromium/LLM、Queue/Retry/Idempotency、Logging/Audit/Supply Chain、Least Privilegeを教材化した。
- Mermaid図2点、代表mapping 12件、cross-tenant traceを含む演習と回答を収録した。M23 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Securityは単一Layerでは完結せず、Browser/BFF/Rails/DB/Queue/Worker/外部境界を通じたDefense in Depthとして扱う。
- Worker sandbox/egress制御、SSRF防御、LLM prompt injection対策、key rotation、security monitoring、penetration test等の実装・運用検証はDEFERRED。
- Source変更、security hardening、build/test/qualityは行っていない。次はTB-25 M24 Testing / CI/CD。

### References

- [M23 Security Fundamentals](./learning/modules/23-security-fundamentals.md)
- [M22 UI Regulation / Accessibility](./learning/modules/22-ui-regulation-accessibility.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Frontend Structure Policy](./architecture/frontend-structure-policy.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase TB-25 — Module 24: Testing / CI/CD

**Status:** Completed / `READY_FOR_M25`  
**Date:** 2026-10-07  
**Category:** Learning / Quality Engineering and Delivery  
**Objective:** Panoptesの変更Riskに応じてTest Layerを選び、CI/CDの保証範囲と限界を説明できるM24教材を作成する。

### Changes / Result

- Unit/Integration/Contract、Component/E2E、Static/Build/Type/Lintと、Authorization/Async/Formula/SnapshotのTest設計を教材化した。
- Regression、Test Data/Isolation、Mock/Stub/Fake、Flaky Test、CI stage、CD/Deployment Gate、migration/rollbackを整理した。
- Mermaid図2点、代表mapping 12件、cross-tenant Snapshot worked example、10群の演習と回答を収録した。M24 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Testingは単一typeやCoverage値へ依存せず、Layer owner、Contract、Riskに沿ったportfolioとして扱う。
- Full browser/visual/accessibility/performance testing、Worker/Queue complete integration、formal required gate、Production deployment automationはDEFERRED。
- Test/CI workflow/Dependency/Source変更、build/test/quality/security scan/browser E2Eは行っていない。次はTB-26 M25 Logging / Monitoring / Audit。

### References

- [M24 Testing / CI/CD](./learning/modules/24-testing-cicd.md)
- [M23 Security Fundamentals](./learning/modules/23-security-fundamentals.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [M11 API / OpenAPI](./learning/modules/11-api-openapi.md)
- [M13 Async Job / Queue / Retry / Idempotency](./learning/modules/13-async-job-queue-retry-idempotency.md)

## Phase TB-26 — Module 25: Logging / Monitoring / Audit

**Status:** Completed / `READY_FOR_M26`  
**Date:** 2026-10-08  
**Category:** Learning / Observability and Accountability  
**Objective:** PanoptesのLog・Metric・Alert・Correlation・Audit・Lineageを区別し、非同期Flowを適切なIDとsignalで診断できるM25教材を作成する。

### Changes / Result

- Structured Logging、Metric type、Golden Signals、Alert品質、Request/Job/Attempt correlationを教材化した。
- Job/Queue/Worker/External Web/LLM/API/DB/Artifact observabilityと、Logging/Audit/Lineageのpurpose・ownership・privacy境界を整理した。
- Mermaid図2点、代表mapping 12件、slow Analysis worked example、10群の演習と回答を収録した。M25 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Retry attempt、final Job outcome、Partial/Missingを分離し、Development Log/engineering auditをruntime Business Auditとみなさない。
- Monitoring/Logging/Tracing vendor、SLO/Alert threshold、Retention、on-call、Business Audit persistence、Worker/Queue instrumentationはDEFERRED。
- Monitoring/Logging/Tracing/Alert導入、Source変更、build/test/qualityは行っていない。次はTB-27 M26 Infrastructure / Cloud Boundary。

### References

- [M25 Logging / Monitoring / Audit](./learning/modules/25-logging-monitoring-audit.md)
- [M24 Testing / CI/CD](./learning/modules/24-testing-cicd.md)
- [M23 Security Fundamentals](./learning/modules/23-security-fundamentals.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [M15 Snapshot / History / Lineage](./learning/modules/15-snapshot-history-lineage.md)

## Phase TB-27 — Module 26: Infrastructure / Cloud Boundary

**Status:** Completed / `READY_FOR_M27`  
**Date:** 2026-10-08  
**Category:** Learning / Infrastructure Architecture  
**Objective:** PanoptesのApplication Contract、Infrastructure Requirement、Cloud Implementationを分離し、runtime/deployment/recoveryの判断境界を説明できるM26教材を作成する。

### Changes / Result

- Compute/Network、PostgreSQL/Queue/Worker/Chromium/Artifact、Secret/Service Identity、ObservabilityのInfrastructure境界を教材化した。
- Scaling/Backpressure、Availability/Failure Domain、Backup/Restore/HA/DR、Environment/Deployment/Migration、Portability/Vendor lock-in/Security/Costを整理した。
- Mermaid図2点、代表mapping 12件、AnalysisJob二視点worked example、10群の演習と回答を収録した。M26 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- Cloud製品名をBusiness Contractにせず、Web/BFF・Rails・Workerをseparable runtimeとして扱う。`adapter-auto`やdevelopment composeをFinal Architectureとはみなさない。
- Provider/service、network topology、sizing/autoscaling、RPO/RTO、region、HA、IaC/CD、Cost ModelはDEFERRED。
- Cloud選定、Infrastructure/IaC/container追加、Deployment/Network/DB変更、Source変更、build/test/qualityは行っていない。次はTB-28 M27 Stripe / Billing / CRM / Webhook。

### References

- [M26 Infrastructure / Cloud Boundary](./learning/modules/26-infrastructure-cloud-boundary.md)
- [M25 Logging / Monitoring / Audit](./learning/modules/25-logging-monitoring-audit.md)
- [M24 Testing / CI/CD](./learning/modules/24-testing-cicd.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [M14 Python Worker / Chromium / Collection](./learning/modules/14-python-worker-chromium-collection.md)

## Phase TB-28 — Module 27: Stripe / Billing / CRM / Webhook

**Status:** Completed / `READY_FOR_M28`  
**Date:** 2026-10-08  
**Category:** Learning / Commercial and External Integration  
**Objective:** Usage、Billing、Entitlement、Provider/CRM stateを分離し、安全なWebhookとCommercial整合性の判断境界を説明できるM27教材を作成する。

### Changes / Result

- Plan/Subscription/Entitlement、Usage/Charge/Technical Cost、Invoice/Payment、Provider identity/projectionを教材化した。
- Webhook authenticity/idempotency/order、Eventual Consistency/Reconciliation、CRM field ownership、Audit/Security/Test/Monitoringを整理した。
- Mermaid図2点、代表mapping 12件、Analysis executionのCommercial flow、10群の演習と回答を収録した。M27 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- PD-04のPlan-specific Usage＋usable-result baselineとUsage Entitlement/Stripe charge分離を維持し、mock Usage表示をBilling正本とみなさない。
- Stripe/CRM、Pricing/Price ID、Billing schema、Charge/Quota/Partial policy、Webhook catalog、Reconciliation cadenceはDEFERRED。
- Stripe/CRM/API key/Product/Price/Checkout/Webhook導入、External API call、Source変更、build/test/qualityは行っていない。次はTB-29 M28 Performance / Scalability。

### References

- [M27 Stripe / Billing / CRM / Webhook](./learning/modules/27-stripe-billing-crm-webhook.md)
- [M26 Infrastructure / Cloud Boundary](./learning/modules/26-infrastructure-cloud-boundary.md)
- [M25 Logging / Monitoring / Audit](./learning/modules/25-logging-monitoring-audit.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)
- [Product Decision Register](./product/product-decision-register.md)

## Phase TB-29 — Module 28: Performance / Scalability

**Status:** Completed / `READY_FOR_BOOTCAMP_CLOSURE_REVIEW`  
**Date:** 2026-10-08  
**Category:** Learning / Performance Engineering  
**Objective:** Panoptesのcross-layer performanceを測定可能なsignalへ分解し、Optimization、Scaling、Backpressureを根拠から選べるM28教材を作成する。

### Changes / Result

- Latency/Throughput/Concurrency/Saturation、Frontend/BFF/Rails/DB、Queue/Worker/Chromium/LLM/Artifactの性能責務を教材化した。
- Cache correctness、Retry amplification、Backpressure、Capacity/Headroom、Cost/Correctness/Security、Benchmark/Load/Stress/Soakを整理した。
- Mermaid図2点、代表mapping 12件、slow Analysis worked example、11群の演習と回答を収録した。M28 DoDは`10 / 10 PASS`。

### Decisions / Deferred

- 設定値・mock timingを性能実測とみなさず、Measure→Bottleneck→Hypothesis→Optimize/Scale/Backpressure→Validateを標準判断順とした。
- SLO/load target、Cache/CDN、Index/query tuning、Worker concurrency、DB sizing、APM/load tooling、autoscalingはDEFERRED。
- Performance tuning、Cache/Index/Query/Concurrency/Infrastructure/Source変更、Load/Benchmark、build/test/qualityは行っていない。次はTB-30 Bootcamp Parent Closure Review。

### References

- [M28 Performance / Scalability](./learning/modules/28-performance-scalability.md)
- [M27 Stripe / Billing / CRM / Webhook](./learning/modules/27-stripe-billing-crm-webhook.md)
- [M26 Infrastructure / Cloud Boundary](./learning/modules/26-infrastructure-cloud-boundary.md)
- [M25 Logging / Monitoring / Audit](./learning/modules/25-logging-monitoring-audit.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)

## Phase TB-30 — Panoptes Technical Bootcamp Parent Closure Review

**Status:** `BOOTCAMP_MATERIALS_COMPLETE / READY_FOR_LEARNING_PHASE / CLOSED`  
**Date:** 2026-10-08  
**Category:** Learning / Parent Closure  
**Objective:** M01〜M28の教材inventory、status、依存、contract、CURRENT/TARGET/DEFERRED、link、learning readinessを確認し、教材制作フェーズをClosureする。

### Changes / Result

- M01〜M28は`28 / 28 PRESENT`、欠番・重複なし、全ModuleのAuthoring DoDは`10 / 10 PASS`。
- Prerequisiteにblocking issueはなく、broken relative linksは`0`、重大なProduct/Architecture contract矛盾と実装状態の誤分類は検出しなかった。
- Parent Closure Criteriaは`10 / 10 PASS`、Closure blockerは`0`。教材制作フェーズを正式にCloseした。

### Decisions / Deferred

- 教材制作Closureと受講者のlearning completionを分離し、assessment evidenceとCapstoneは次のLearning / Assessment Phaseで扱う。
- Source migration、Tailwind/token、Production Queue/Worker、Snapshot/Formula runtime、Accessibility/Security/Monitoring/Cloud/Commercial/Performance対応は既存Deferredとして保持する。
- Application Source変更、build/test/quality、browser/Web検証は行っていない。

### References

- [TB-30 Parent Closure Review](./audit/131-panoptes-technical-bootcamp-parent-closure-review.md)
- [Panoptes Technical Bootcamp](./learning/panoptes-technical-bootcamp.md)

## Quality Baseline History

監査資料に実行結果が明記されているPhaseのみを記載する。test数は各Phase完了時の全unit test数である。

| Phase | Tests | ESLint Errors | ESLint Warnings | Build | Quality |
| ----- | ----: | ------------: | --------------: | ----- | ------- |
| A-2   |     5 |             0 |              93 | PASS  | PASS    |
| A-3   |    15 |             0 |              93 | PASS  | PASS    |
| A-4   |    21 |             0 |              93 | PASS  | PASS    |
| R-1   |    32 |             0 |              93 | PASS  | PASS    |
| B-1   |    32 |             0 |              93 | PASS  | PASS    |
| B-2   |    37 |             0 |              69 | PASS  | PASS    |
| B-3A  |    58 |             0 |              67 | PASS  | PASS    |
| B-3B  |    73 |             0 |              60 | PASS  | PASS    |
| B-3C  |    86 |             0 |              60 | PASS  | PASS    |
| B-3D  |    95 |             0 |              60 | PASS  | PASS    |
| B-3E  |    99 |             0 |              60 | PASS  | PASS    |
| B-3F  |   103 |             0 |              60 | PASS  | PASS    |
| B-3G  |   108 |             0 |              60 | PASS  | PASS    |
| B-3H  |   108 |             0 |              60 | PASS  | PASS    |
| B-3I  |   128 |             0 |              60 | PASS  | PASS    |
| B-3J  |   171 |             0 |              58 | PASS  | PASS    |
| B-3K  |   196 |             0 |              57 | PASS  | PASS    |
| B-3L  |   204 |             0 |              54 | PASS  | PASS    |
| B-3M  |   214 |             0 |              50 | PASS  | PASS    |
| B-3N  |   226 |             0 |              38 | PASS  | PASS    |
| B-3O  |   238 |             0 |              38 | PASS  | PASS    |
| B-3P  |   242 |             0 |              38 | PASS  | PASS    |
| B-3Q  |   251 |             0 |              38 | PASS  | PASS    |
| B-3R  |   257 |             0 |              38 | PASS  | PASS    |
| B-3S  |   257 |             0 |              38 | PASS  | PASS    |
| B-3T  |   257 |             0 |              38 | PASS  | PASS    |
| PD-1  |   257 |             0 |              38 | PASS  | PASS    |
| PD-2  |   257 |             0 |              38 | PASS  | PASS    |
| PD-3  |   257 |             0 |              38 | PASS  | PASS    |
| PD-4  |   257 |             0 |              38 | PASS  | PASS    |
| PD-5  |   257 |             0 |              38 | PASS  | PASS    |
| PD-6  |   257 |             0 |              38 | PASS  | PASS    |
| PD-7  |   257 |             0 |              38 | PASS  | PASS    |
| PD-8  |   257 |             0 |              38 | PASS  | PASS    |
| PD-9  |   257 |             0 |              38 | PASS  | PASS    |
| PD-10 |   257 |             0 |              38 | PASS  | PASS    |
| PD-11 |   257 |             0 |              38 | PASS  | PASS    |
| PD-12 |   257 |             0 |              38 | PASS  | PASS    |
| PD-13 |   257 |             0 |              38 | PASS  | PASS    |
| PD-14 |   257 |             0 |              38 | PASS  | PASS    |
| PD-15 |   257 |             0 |              38 | PASS  | PASS    |
| PD-16 |   257 |             0 |              38 | PASS  | PASS    |
| PD-17 |   257 |             0 |              38 | PASS  | PASS    |
| PD-18 |   257 |             0 |              38 | PASS  | PASS    |
| PD-19 |   257 |             0 |              38 | PASS  | PASS    |
| PD-20 |   257 |             0 |              38 | PASS  | PASS    |
| PD-21 |   257 |             0 |              38 | PASS  | PASS    |
| PD-22 |   257 |             0 |              38 | PASS  | PASS    |
| PD-23 |   257 |             0 |              38 | PASS  | PASS    |
| PD-24 |   257 |             0 |              38 | PASS  | PASS    |
| PD-25 |   257 |             0 |              38 | PASS  | PASS    |
| PD-26 |   257 |             0 |              38 | PASS  | PASS    |

Phase A-5は設計・棚卸しPhaseであり、参照監査資料にPhase単独のtest・lint・quality実行値が記録されていないため、数値を補完していない。

## Component Cleanup History

- Initial audited component inventory: 122（Phase開始前の`src/lib/components`監査値）。
- B-1 deleted: 6（Signup wrapper 2、空placeholder 4）。
- B-2 deleted: 11（旧Snapshot群）。
- B-3C deleted: 1（LoginModal）。
- B-3A / B-3B / B-3D / B-3E / B-3G / B-3I: 責務分割によりfeature componentを追加。単純な削除数の差し引きは現在値に使用しない。
- B-3R deleted: 3（透明なAdmin/Landing compatibility alias）。責務なしのroute layout 1件も削除。
- Current reusable Svelte components: 124（filesystem再集計。`src/lib/components` 107 + `src/lib/features` 17）。
- Current route Svelte files: 13。Inventory対象の`.svelte`は合計137件で、route fileはreusable component inventoryから分離している。

## Known Deferred Items

1. `POST /api/waitlist/join`のBFF、Turnstile secret検証、永続化 — Auth / Growth backend。
2. Contact実送信・保存・通知先 — Contact backend / Product。
3. Survey回答の保存先・通知先 — Product Feedback backend / Product。
4. Password reset — Auth。
5. OTP login — Auth。
6. Svelte component test基盤 — Frontend Quality。
7. Browser E2E — Frontend Quality。
8. Visual regression — Frontend Quality / Design。
9. StrategyAnalysisPlanRail / Cardの責任・統合判断 — Product / Frontend Architecture。
10. ESLint既存38 warningsの段階的解消 — Frontend Quality。
11. Design Token導入 — Design System。
12. Tailwind移行 — Design System。Tokenとresponsive方針決定前には開始しない。
13. Production adapter選定 — Platform。
14. Cloud deployment、TLS、network policy、observability — Platform / Security。
15. Rails R-2以降のProject、AnalysisJob、Queue、Worker、Strategy、Roadmap — Backend。
16. Actual Supabase staging integration — Auth / Platform。
17. npm dependency vulnerabilitiesの継続評価と更新 — Security / Frontend Quality。
18. Landing HeroのTablet/Mobile responsive設計 — Design / Frontend。

## Logging Rule

以降のすべてのPhase／sub-phase完了時に、この`DEVELOPMENT_LOG.md`へ追記する。

各Phaseの詳細監査資料を正本とし、`DEVELOPMENT_LOG.md`には以下のみを要約する。

1. Objective
2. Changes
3. Result
4. Decisions
5. Deferred / Remaining
6. References

進行中Phaseは完了扱いで記載しない。  
推測した結果を記載しない。  
既存履歴を書き換えず、原則追記する。  
過去Phaseの誤りを修正する場合はCorrectionとして理由を残す。
