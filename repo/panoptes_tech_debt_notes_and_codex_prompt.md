# Panoptes 重複・統合候補メモ

このメモは、今すぐ削除・統合するための一覧ではなく、**将来的な統合候補・責務競合・重複管理ポイント** を見失わないための実務メモです。  
MVP進行を止めずに、あとで安全に整理できるように残します。

---

## 1. ルート入口の機能かぶり候補

### 対象
- `/app`
- `/app/analysis`

### 状態
入口コンポーネントは統一済みだが、URLは2本ある。

### 何がかぶっているか
- shell 入口としての役割
- 分析画面への導線

### 判断
- **今すぐ直す必要はない**
- 今は導線重複候補としてメモで十分

### 将来どう扱う候補か
- `/app` を正規ルートに寄せる
- `/app/analysis` を redirect へ寄せる可能性あり

---

## 2. preview dummy と mock API の snapshot 生成

### 対象
- `src/lib/db/dummy/panoptes_dummy_ui.ts`
- `src/lib/panoptes/api/mock/snapshot-factory.ts`
- `src/lib/panoptes/api/mock-backend.ts`

### 状態
最終 payload shape はかなり統一されたが、中身の一部はまだ preview 側に残る。

### 何がかぶっているか
- snapshot の一部内容生成
- strategy plan / phase task の source
- preview 用 section データ生成

### 判断
- **今すぐ全面統合は不要**
- ただし中期的には統合優先度が高い

### 将来どう扱う候補か
- shape だけでなく section 内容 source も shared helper 側へ寄せる
- 特に `strategyPlans` と `phaseTasks` は統合本命候補

---

## 3. runtime 組み立てロジックの近似重複

### 対象
- `src/lib/panoptes/domain/runtime-progress.ts`
- `src/lib/panoptes/domain/project-sync.ts`

### 状態
runtime 組み立てや判定の考え方が一部近い。

### 何がかぶっているか
- runtime の次状態組み立て
- status / step 周辺の判定ロジックの思想

### 判断
- **今すぐ共通化しない方がよい**
- 近似責務として記録しておく価値あり

### 将来どう扱う候補か
- 実装がもう少し増えてから、共通化すべきか判断する
- 早い抽象化は避ける

---

## 4. strategy snapshot 更新の二重反映

### 対象
- `currentSnapshot`
- `lastStableSnapshot`
- `src/lib/panoptes/domain/strategy-snapshot.ts`

### 状態
strategy 選択や task 更新を両方へ反映している。

### 何がかぶっているか
- snapshot 更新先が複数ある
- 同じ update intent を複数 snapshot に反映している

### 判断
- **これは不要重複ではなく、現状は意図的な同期処理**
- 今は削減対象ではなく、監視対象

### 将来どう扱う候補か
- snapshot 運用が増えた時に更新条件を明確化する
- 更新対象選定ルールを helper へ寄せる可能性あり

---

## 5. render 判定と session state の二重化候補

### 対象
- `src/lib/panoptes/stores/session.ts`
- `src/lib/panoptes/selectors/presentation.ts`

### 状態
session store に write-only 気味 state があり、実際の render 判定は selector が強く持っている可能性がある。

### 何がかぶっているか
- UI状態の保持責務
- render mode の判断責務

### 判断
- **優先度は高め**
- ただし即削除ではなく、読者の有無を確認してから整理する

### 将来どう扱う候補か
- selector に寄せるべき render 判定は stores に持たせない
- session に残す state は「誰が読むか」を明確にしたものだけ残す

---

## 6. shell 内 controller 的責務

### 対象
- `src/lib/components/ComponentsBase/Panoptes/PanoptesShellPage.svelte`
- 将来の `PanoptesShellPage.controller.ts` 分離候補

### 状態
表示本体だが、まだ controller 的責務が一部残っている。

### 何がかぶっているか
- UI表示責務
- event wiring を超える制御責務
- shell 本体と controller 的処理の混在

### 判断
- **優先度は高め**
- ただし単体で大改修せず、機能追加のついでに薄くする

### 将来どう扱う候補か
- entry / controller / shell の責務境界をさらに明確化する

---

## 7. mock-backend 内の残存組み立て責務

### 対象
- `src/lib/panoptes/api/mock-backend.ts`
- `src/lib/panoptes/api/mock/snapshot-factory.ts`
- `src/lib/panoptes/api/mock/runtime-ticker.ts`
- `src/lib/panoptes/api/mock/state.ts`

### 状態
snapshot/tick の膨張源は切り出せたが、persistence や detail assembly は facade 側に残っている。

### 何がかぶっているか
- facade と assembly の責務近接
- mock state 管理と detail 生成の集中

### 判断
- **今すぐ全面整理は不要**
- ただし今後また肥大化しやすい監視対象

### 将来どう扱う候補か
- detail assembly の helper 化
- persistence と assembly の責務線を見直す

---

## 8. preview 専用補助データ群

### 対象
- `dummyProjectSummaries`
- `dummyHeaderMeta`
- `dummyAnalysisPreviewPresentations`
- `createDummyAnalysisRuntime()`

### 状態
preview を便利にする専用データとして残っている。

### 何がかぶっているか
- 一部、本番に近い見た目の再現に使うダミー構造

### 判断
- **今は放置してよい重複**
- preview 専用である限り問題は小さい

### 将来どう扱う候補か
- core へ混ざり始めたら整理対象
- preview 側に閉じている限り維持可

---

## 9. 未使用 component 群

### 対象
- 旧 snapshot leaf component 群

### 状態
現在参照されていない候補がある。

### 何がかぶっているか
- 現行 wrapper 構成と役割が重なる UI 部品
- あるいは過去構成の残骸

### 判断
- **中優先度の整理候補**
- まず参照確認してから legacy 退避か削除を判断する

### 将来どう扱う候補か
- `legacy/` へ退避
- 使われていなければ削除

---

## 今の時点で強く意識したいもの

### 優先して監視したい
- `stores/session.ts` と `selectors/presentation.ts` の責務競合
- `PanoptesShellPage.svelte` に残る controller 的責務
- preview と mock の `strategyPlans / phaseTasks` source の分離残り

### メモだけで十分なもの
- `/app` と `/app/analysis`
- `runtime-progress.ts` と `project-sync.ts` の近似
- preview 専用補助データ

### 将来の掃除候補
- 未使用 component
- `mock-backend.ts` 残責務
- seed 文言の文字コード揺れ

---

# codex に渡す用プロンプト

```text
現在の Panoptes コードベースについて、
「重複している機能」「責務が競合している箇所」「将来的に統合候補になりそうな箇所」を
TECH_DEBT_NOTES.md として整理してください。

# 目的
- 今すぐ消さないが、将来の統合・整理候補を明文化する
- 実装者が後で見返して判断しやすくする
- MVP進行中に構造の危険箇所を見失わないようにする

# 分類してほしい内容
1. ルートや導線の重複候補
2. preview / mock / backend の責務重複候補
3. domain helper 間の近似責務
4. stores / selectors / actions 間の責務競合
5. core shell に残る責務混在
6. legacy / unused component 候補
7. 今は放置してよい重複
8. 将来的に統合優先度が高いもの

# 出力形式
- 項目名
- 対象ファイル
- 何がかぶっているか
- 今すぐ直すべきか
- 今はメモで十分か
- 将来どう扱う候補か

# 制約
- 全面改修前提にしない
- 現在の実装を前提にする
- 今すぐ消すものと、メモだけでよいものを分ける
- ARCHITECTURE_NOTES.md と矛盾しないようにする
```

---

## 補足

このメモの役割は、**今すぐ全部直すことではなく、重複や競合を“見える化”しておくこと** です。  
MVPの進行を止めず、必要になったタイミングで安全に整理するための判断材料として使います。