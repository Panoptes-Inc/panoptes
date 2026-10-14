# Phase B-1 到達不能コンポーネント最終判定

実施日: 2026-08-07

## 結論

旧監査の「到達不能25件」を、現行routeを起点とする静的import graph、ファイル内import、props、表示責務から再判定した。Phase A-1以後、7件は到達可能になっていた。変更前時点で到達不能のままなのは18件である。

最終判定は `KEEP` 6件、`DELETE` 6件、`MERGE` 11件、`DEFER` 2件、`DEV_ONLY` 0件、`REPAIR` 0件。`DELETE` 6件のみ今回削除した。大きなUI統合は行っていない。

## 判定基準

- production graph: 公開routeまたは認証・role・Organization policyで保護されたrouteから静的importで到達するもの
- dev-only graph: productionでは404となる開発routeだけから到達するもの
- legacy graph: どのrouteからも到達せず、現行実装に対応責務があるもの
- `DELETE`: 参照なし、契約なし、代替先が明確で、削除してもruntime graphが変わらない
- `MERGE`: 現行正本に同等責務があるが、propsやUI差分の精査・移植判断が必要
- `DEFER`: 意味または置換単位が異なり、このPhaseで統合・削除を安全に断定できない

## 25件の最終判定

| # | 対象 | 現在の到達性 | 判定 | 正本 / 置換先 | 理由と今回の処置 |
|---:|---|---|---|---|---|
| 1 | `admin/AdminAddUserForm.svelte` | protected `/admin` | KEEP | 自身 | A-1で実体化され、`AdminDashboard`から利用中。入力UIを維持。 |
| 2 | `admin/AdminMetricCard.svelte` | protected `/admin` | KEEP | 自身 | A-1で実体化され、4枚の指標表示に利用中。 |
| 3 | `admin/AdminProgressCard.svelte` | protected `/admin` | KEEP | 自身 | A-1で実体化され、登録枠の進捗表示に利用中。 |
| 4 | `admin/AdminUserTable.svelte` | protected `/admin` | KEEP | 自身 | A-1で実体化され、ユーザー一覧に利用中。 |
| 5 | `Contact.svelte` | unreachable | DELETE | `ContactModal.svelte` | 0 byte・参照0。表示責務は到達可能なmodalに存在。削除。 |
| 6 | `Login.svelte` | unreachable | DELETE | `/login` + `SignUpForm.svelte` | 0 byte・参照0。ログイン画面はrouteとformが正本。削除。 |
| 7 | `PanoptesCompetitorCard.svelte` | unreachable | MERGE | `CompetitorAnalysisCardGrid`配下 | card選択・score表示は現行Competitor graphに存在。B-2で差分確認。 |
| 8 | `PanoptesCompetitorDetailPanel.svelte` | unreachable | MERGE | `CompetitorAnalysisCompareStage`配下 | detail/insight/action責務は現行detail/compare群と重複。削除せず保留。 |
| 9 | `PanoptesIndustryDistributionPanel.svelte` | unreachable | MERGE | `IndustryAnalysisDistributionSection.svelte` | distribution表示の現行正本がある。B-2で表示項目を照合。 |
| 10 | `PanoptesIndustryMarketTypeCard.svelte` | unreachable | MERGE | `IndustryAnalysisOverviewSection.svelte` | market type/confidence責務をoverviewへ集約する候補。 |
| 11 | `PanoptesIndustryOpportunityPanel.svelte` | unreachable | MERGE | `IndustryAnalysisOpportunitySection.svelte` | opportunity/action表示の現行正本がある。 |
| 12 | `PanoptesIndustryPositionPanel.svelte` | unreachable | MERGE | `IndustryAnalysisPositionSection.svelte` | position matrix責務の現行正本がある。 |
| 13 | `PanoptesIndustryRatingPanel.svelte` | unreachable | MERGE | `IndustryAnalysisRatingSection.svelte` | rating/summary責務の現行正本がある。 |
| 14 | `PanoptesIndustrySignalPills.svelte` | unreachable | MERGE | `IndustryAnalysisOverviewSection.svelte`配下 | signal表示をoverview側へ統合する候補。単独削除は未実施。 |
| 15 | `PanoptesSelfActionPanel.svelte` | unreachable | MERGE | `SelfAnalysisEvaluationCard` / `SelfAnalysisStrategyRecommendationGrid` | breakdown/action責務が現行Self graphに分割されている。 |
| 16 | `PanoptesSelfRadarPanel.svelte` | unreachable | MERGE | `SelfAnalysisComparisonPanel.svelte` | self/industry radarの現行正本がある。 |
| 17 | `PanoptesSelfScorePanel.svelte` | unreachable | MERGE | `SelfAnalysisOverviewPanel.svelte` | score/gap/summary責務の現行正本がある。 |
| 18 | `parts/button/signup/SignUpBtn.svelte` | public `/login`（変更前） | DELETE | `ComponentsBase/SignUpBtn.svelte` | props透過だけのwrapper。`SignUpForm`を正本へ直接importに変更し削除。 |
| 19 | `parts/input/signupform/SignUpForm.svelte` | unreachable | DELETE | `ComponentsBase/SignUpForm.svelte` | props透過だけで参照0。削除。 |
| 20 | `SignUp.svelte` | unreachable | DELETE | `ComponentsBase/SignUpForm.svelte` | 0 byte・参照0。signup責務は現行formに存在。削除。 |
| 21 | `ComponentsBase/SignUpBtn.svelte` | public `/login` | KEEP | 自身 | `SignUpForm`から直接利用するbutton正本。 |
| 22 | `ComponentsBase/SignUpForm.svelte` | public `/login` | KEEP | 自身 | login/signup・Supabase接続を持つ現行正本。 |
| 23 | `SignUpModal.svelte` | unreachable | DELETE | `SignUpForm.svelte` / `LoginModal.svelte` | 0 byte・参照0。削除。 |
| 24 | `StrategyAnalysisPlanRail.svelte` | unreachable | DEFER | 未確定。近似: `StrategyAnalysisProjectRail.svelte` | strategy plan選択とproject選択は意味が異なる。visual/業務判断なしでは統合不能。 |
| 25 | `StrategyAnalysisPlanRailCard.svelte` | legacy subgraphのみ | DEFER | 親railと一体で判定 | 親以外から参照なしだが、plan cardの情報量を現行project sidebarが代替するか未確定。 |

## props契約・UI差分

### Admin

4件は旧wrapperではなくA-1で復旧された実体である。`AdminDashboard`からそれぞれ現行契約（add formはpropsなし、metricは`label/value/tone`、progressは`value/max/label`、tableは`users`）で利用される。正本変更もUI変更もない。`/admin`は公開routeではなくsystem-admin/developer policyで保護される。

### Signup

root `SignUpForm.svelte`は`mode?: 'signup' | 'login'`、root `SignUpBtn.svelte`は`label/type/disabled`を持つ。削除したbutton wrapperは任意propsをそのままroot buttonへ渡すだけだったため、直接import後のDOM・style・event挙動は同一である。削除したform wrapperも透過のみで参照0だった。

### Snapshot legacy 11件

旧群はdomain payloadの断片（`card`、`distribution`、`marketType`、`opportunity`、`position`、`rating`、`signals`、`data`）を直接受ける。現行群は`CompetitorAnalysisTab`、`IndustryAnalysisTab`、`SelfAnalysisTab`でpayloadをview modelへ変換し、細分化した表示部品へ渡す。責務は対応するがprops境界と画面構成は一致しない。旧群にはfallback文言や旧layoutが残り、機械的な置換は見た目を変えるため、B-2まで保持する。

### Strategy rail

旧plan railは`siteName/cards/disabled/onSelectStrategyKey/onCreateProject`を受け、`StrategyAnalysisRailCardModel`のday・progress・priority・fit scoreを表示する。現行project railは`projects/selectedProjectId/onSelectProject/onCreateProject`を受け、`PanoptesProjectSidebar`を表示する。選択対象と情報量が違うため同一契約ではない。今回は`DEFER`とした。

## 実施した変更

- `SignUpForm.svelte`のbutton importをroot正本への直接importへ変更
- 透過wrapper 2件を削除
- 0 byte・参照0のplaceholder 4件を削除
- Snapshot legacy 11件とStrategy legacy 2件は削除・移動・書換えをしていない

## 影響

- 意図的な見た目・業務挙動の変更: なし
- import graph: Signupの不要な1段を短縮。新規循環依存なし
- Rails/API契約: 変更なし
- route/auth/Organization policy: 変更なし

## 検証結果

最終結果は本Phaseのquality実行後に確定した。

- `npm run quality`: 成功（exit code 0）
- `svelte-check`: error 0 / warning 0
- ESLint: error 0 / warning 93（既存baseline 93から増加なし）
- unresolved import: 0
- unit tests: 5 files / 32 tests passed
- production build: 成功
- auth smoke: 5 scenarios passed
- route smoke: 7 routes passed（public 200、protected 303、production上のdev-only 404を確認）
- secrets check: passed

## 残課題

Snapshot legacy 11件はB-2で画面比較とdata field対応表を作り、現行群へ必要要素を移植した後に削除可否を決める。Strategy rail 2件はproduct ownerが「plan選択」と「project選択」の関係を決めるまで削除しない。
