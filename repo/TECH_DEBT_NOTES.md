# Panoptes Tech Debt Notes

This note is a companion to `repo/ARCHITECTURE_NOTES.md`.

`ARCHITECTURE_NOTES.md` describes the current responsibility boundaries we want to keep.
This file documents places where responsibilities still overlap, where cleanup may be needed later, and where we should avoid accidental drift during MVP work.

This is not a rewrite plan.
It is a decision support memo for future consolidation.

## 1. ルートや導線の重複候補

### 候補: `/app` と `/app/analysis` の二重入口
- 対象ファイル
  - `src/routes/app/+page.svelte`
  - `src/routes/app/analysis/+page.svelte`
  - `src/lib/components/ComponentsBase/PanoptesAnalysisStartSearchBar.svelte`
- 何がかぶっているか
  - `/app` と `/app/analysis` の両方が `PanoptesShellEntryPage` をそのまま表示している
  - 検索バーは分析開始後に `/app/analysis` へ遷移するが、`/app` も同じ shell を持っている
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - canonical route を `/app` に寄せる
  - `/app/analysis` は redirect へ寄せるか、将来 deep-link 専用 route に用途を限定する

### 候補: feed 系の detail link と app route の整合
- 対象ファイル
  - `src/lib/stores/analysis-feed.js`
  - `src/routes/app/+page.svelte`
  - `src/routes/app/analysis/+page.svelte`
- 何がかぶっているか
  - feed 側の link は `/app/analysis/...` 前提を持っている一方で、app shell の主入口は `/app` でも成立する
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - route canonicalization を決めたタイミングで feed link も一緒に合わせる

## 2. preview / mock / backend の責務重複候補

### 候補: preview snapshot source と mock snapshot source の二重管理
- 対象ファイル
  - `src/lib/db/dummy/panoptes_dummy_ui.ts`
  - `src/lib/panoptes/api/mock/snapshot-factory.ts`
  - `src/lib/panoptes/api/mock-backend.ts`
- 何がかぶっているか
  - snapshot の最終 shape はかなり揃ったが、preview 側には section source と strategy plan / phase task 周辺の独自生成がまだ残っている
  - mock facade 側にも detail assembly と project build が残っている
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - shared snapshot factory の対象をもう一段広げる
  - `strategyPlans` と `phaseTasks` の source of truth をさらに寄せる

### 候補: preview fallback 注入と component 内 dummy fallback の二重化
- 対象ファイル
  - `src/lib/components/ComponentsBase/PanoptesShellEntryPage.svelte`
  - `src/lib/components/ComponentsBase/Competitor/data/competitor-analysis-view-model.ts`
  - `src/lib/components/ComponentsBase/Self/data/self-analysis-view-model.ts`
  - `src/lib/components/ComponentsBase/industry/data/industry-analysis-view-model.ts`
- 何がかぶっているか
  - shell entry は `fallbackSnapshot` を注入している
  - 一方で competitor / self / industry の view-model はそれぞれ `dummySnapshot` を直接 import して default source にしている
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - preview source の入口を `entry` か `view-model fallback` のどちらかに寄せる
  - production component で dummy import を許す範囲を明文化する

### 候補: preview copy と runtime copy の重複
- 対象ファイル
  - `src/lib/db/dummy/panoptes_dummy_ui.ts`
  - `src/lib/panoptes/selectors/presentation.ts`
- 何がかぶっているか
  - `dummyAnalysisPreviewPresentations` と `whitePanelPresentation` が同じ analysis step の文言責務を別々に持っている
  - `dummyHeaderMeta` と shell 内の `headerMeta` も近い責務を持つ
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - preview 用 copy は dev-only constants に集約し、core の step copy と完全に分けるか shared 化する

## 3. domain helper 間の近似責務

### 候補: runtime 組み立てロジックの近似
- 対象ファイル
  - `src/lib/panoptes/domain/runtime-progress.ts`
  - `src/lib/panoptes/domain/project-sync.ts`
  - `src/lib/panoptes/utils/guards.ts`
- 何がかぶっているか
  - `runtime-progress.ts` は poll payload から runtime を組み立てる
  - `project-sync.ts` は project detail / job から runtime を組み立てる
  - 両者とも status / polling / terminal reason の近い判断を持つ
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - 共通の runtime assembler を作るか、少なくとも status mapping の shared helper を切る

### 候補: strategy selection 解決責務の近似
- 対象ファイル
  - `src/lib/panoptes/domain/strategy-snapshot.ts`
  - `src/lib/panoptes/selectors/presentation.ts`
- 何がかぶっているか
  - `buildStrategyUiStateFromSnapshot()` と `selectedSnapshotStrategyPlan` が、snapshot からどの plan を選ぶかの近い判断を持つ
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - 「strategy plan selection resolution」を shared helper 化し、UI state 初期化と selector 参照を同じ基準に寄せる

## 4. stores / selectors / actions 間の責務競合

### 候補: session store の state と selector 側 render mode の重なり
- 対象ファイル
  - `src/lib/panoptes/stores/session.ts`
  - `src/lib/panoptes/selectors/presentation.ts`
- 何がかぶっているか
  - `session.ts` は `mainSurfaceMode` と `rightPanelMode` を持つ
  - 実際の main surface 表示は `mainSurfaceRenderMode` selector が決めている
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - render mode を selector へ寄せる方針を維持し、session 側に残す state は本当に UI control 用だけに絞る

### 候補: detail store の `derivedDisplayState` と selector 側 display 判定
- 対象ファイル
  - `src/lib/panoptes/stores/projects.ts`
  - `src/lib/panoptes/domain/project-sync.ts`
  - `src/lib/panoptes/domain/runtime-progress.ts`
  - `src/lib/panoptes/selectors/presentation.ts`
- 何がかぶっているか
  - `projectDetailStore` 自体が `derivedDisplayState` を持つ
  - さらに selector 側に `derivedProjectDisplayState` がある
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - display state を store field に残すか selector に完全に寄せるかを後で一本化する

### 候補: strategy task list の selector と shell 内ローカル計算
- 対象ファイル
  - `src/lib/panoptes/selectors/presentation.ts`
  - `src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte`
- 何がかぶっているか
  - selector には `selectedPhaseTasks` がある
  - shell でも `snapshotStrategyTasks` をローカル derived で計算している
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - strategy tab 用 task source を selector に寄せるか、shell ローカルを正式 source にするか決める

## 5. core shell に残る責務混在

### 候補: `PanoptesShellPage.svelte` の controller 的責務
- 対象ファイル
  - `src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte`
- 何がかぶっているか
  - UI 表示
  - shell bootstrap
  - network listener attach
  - project selection
  - create / retry / confirm / reanalyze wiring
  - strategy selection / task update wiring
  - header meta の導出
  - snapshot fallback / strategy task filtering
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - いいえ
- 将来どう扱う候補か
  - `PanoptesShellPage.controller.ts` のような controller 分離を最優先候補として扱う
  - ただし shell mount guarantee を壊さないように段階移行する

### 候補: shell entry と shell 本体の preview 責務境界
- 対象ファイル
  - `src/lib/components/ComponentsBase/PanoptesShellEntryPage.svelte`
  - `src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte`
- 何がかぶっているか
  - Step 1-2 で改善済みだが、entry はまだ preview fallback を本番 route から注入できる
  - shell 本体も fallback snapshot 前提の分岐を持つ
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - backend mode が安定したら fallback 注入条件を dev-only 明示フラグへ寄せる

## 6. legacy / unused component 候補

### 候補: dummy wrapper の二重階層
- 対象ファイル
  - `src/lib/components/ComponentsBase/AppTopDummy.svelte`
  - `src/lib/components/ComponentsBase/AppResultsDummy.svelte`
  - `src/lib/components/ComponentsBase/dummy/AppTopDummy.svelte`
  - `src/lib/components/ComponentsBase/dummy/AppResultsDummy.svelte`
- 何がかぶっているか
  - `dummy/` 配下の 2 ファイルは root 側 dummy component の pass-through wrapper になっている
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - import 先をどちらか一方に統一して、片方を削る

### 候補: dev-only UI 群の配置
- 対象ファイル
  - `src/routes/app/dev/ui/+page.svelte`
  - `src/lib/components/ComponentsBase/Panoptes/dev/PanoptesUiPreviewPage.svelte`
  - `src/lib/components/ComponentsBase/Panoptes/dev/panoptes-ui-preview-data.ts`
  - `src/lib/components/ComponentsBase/dummy/PanoptesAppShellDummy.svelte`
- 何がかぶっているか
  - production tree の近くに、preview 専用 surface と dummy shell が同居している
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - `src/lib/dev/` などへ隔離する候補
  - ただし今は UI 調整の速度を優先して現配置でも問題ない

### 候補: 明確な unused production component
- 対象ファイル
  - この確認では「今すぐ削除すべき未使用 production component」は未確定
- 何がかぶっているか
  - 最近の strategy / industry 整理で大きな重複はすでにかなり除去済み
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - 参照確認を伴う cleanup は別タスクで実施する
  - `legacy/` 退避か削除かは、参照ゼロ確認後に決める

## 7. 今は放置してよい重複

### 候補: landing 用 dummy と dev preview 用 dummy の重複
- 対象ファイル
  - `src/lib/components/ComponentsBase/LandingHeroPrimarySection.svelte`
  - `src/lib/components/ComponentsBase/LandingHeroSecondarySection.svelte`
  - `src/lib/components/ComponentsBase/dummy/PanoptesAppShellDummy.svelte`
  - `src/lib/components/ComponentsBase/Panoptes/dev/PanoptesUiPreviewPage.svelte`
- 何がかぶっているか
  - 同じ dummy shell を LP と dev preview の両方で使うため、見せ方用 wrapper が複数ある
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - LP 用 wrapper と dev preview 用 wrapper の目的が分かれている間は維持してよい

### 候補: preview meta / copy の個別保持
- 対象ファイル
  - `src/lib/db/dummy/panoptes_dummy_ui.ts`
  - `src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte`
  - `src/lib/panoptes/selectors/presentation.ts`
- 何がかぶっているか
  - shell header meta、preview meta、preview copy、runtime copy がそれぞれ別管理
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - UI 調整が落ち着くまでは分離維持
  - backend 実装が固まった時点で shared text / meta source を検討する

## 8. 将来的に統合優先度が高いもの

### 優先度 High: shell controller 分離
- 対象ファイル
  - `src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte`
- 何がかぶっているか
  - UI と orchestration glue が同居している
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - いいえ
- 将来どう扱う候補か
  - controller 分離を最優先の整理候補として扱う

### 優先度 High: runtime / display state の一本化
- 対象ファイル
  - `src/lib/panoptes/domain/runtime-progress.ts`
  - `src/lib/panoptes/domain/project-sync.ts`
  - `src/lib/panoptes/selectors/presentation.ts`
  - `src/lib/panoptes/stores/session.ts`
  - `src/lib/panoptes/stores/projects.ts`
- 何がかぶっているか
  - runtime status / display state / render mode の責務が複数層に散っている
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - いいえ
- 将来どう扱う候補か
  - runtime assembly と display resolution の source of truth を整理する

### 優先度 High: preview と mock の source of truth 追加統合
- 対象ファイル
  - `src/lib/db/dummy/panoptes_dummy_ui.ts`
  - `src/lib/panoptes/api/mock/snapshot-factory.ts`
  - `src/lib/panoptes/api/mock-backend.ts`
- 何がかぶっているか
  - snapshot shape は寄ったが、section source と plan/task source はまだ分かれている
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - いいえ
- 将来どう扱う候補か
  - preview と mock の drift を防ぐ次の整理候補として扱う

### 優先度 Medium: route canonicalization
- 対象ファイル
  - `src/routes/app/+page.svelte`
  - `src/routes/app/analysis/+page.svelte`
  - `src/lib/components/ComponentsBase/PanoptesAnalysisStartSearchBar.svelte`
- 何がかぶっているか
  - 同じ shell surface へ 2 ルートが存在する
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - canonical route 決定後に redirect 整理する

### 優先度 Medium: dummy wrapper 統一
- 対象ファイル
  - `src/lib/components/ComponentsBase/AppTopDummy.svelte`
  - `src/lib/components/ComponentsBase/AppResultsDummy.svelte`
  - `src/lib/components/ComponentsBase/dummy/AppTopDummy.svelte`
  - `src/lib/components/ComponentsBase/dummy/AppResultsDummy.svelte`
- 何がかぶっているか
  - 同じ dummy component を複数 import path で見せている
- 今すぐ直すべきか
  - いいえ
- 今はメモで十分か
  - はい
- 将来どう扱う候補か
  - import policy を一本化して pass-through wrapper を減らす

## Quick Rule

When we add new code during MVP:

- do not delete these candidates casually
- do not add a third place that solves the same problem
- if a new overlap is unavoidable, add it here as a memo instead of hiding it
- keep this file aligned with `repo/ARCHITECTURE_NOTES.md`
