# Panoptes 2026/08/17 MTG Slide Storyboard

**Deck size:** 10 slides  
**Audience:** 経営／代表、CTO、PM、新規参画者、非エンジニア寄りの関係者  
**Communication job:** MTG終了時に、参加者がPanoptesの「整った基盤」と「未接続の中心価値」を区別し、MVP境界と最小Vertical Slice、その検証順序を判断できるようにする。  
**Narrative arc:** Product value → Current state → Architecture → Progress → Gap → Rationale → Roadmap → Dependencies → Decisions → Deliberate deferrals

## Deck-wide direction

- CurrentとTarget、ImplementedとDesignedを色とラベルで必ず分ける。
- Audience-facing copyは日本語を基本にし、`Vertical Slice`等の用語は初出で短く言い換える。
- Status legendは全編で統一する。
  - Green: Implemented
  - Blue: Partially Implemented
  - Gray outline: Designed / Not Implemented
  - Amber: TBD / Decision Required
- 画面の存在をSaaS完成度の代理指標として使わない。
- 3か月は納期ではなく、依存関係に基づく推奨実施順序として表現する。
- PowerPoint化時の目安は、deck title 50pt以上、slide title 35pt以上、本文16pt以上とする。

## Slide 1 — Webの証跡を、戦略と実行へつなぐ

### Purpose

実装状況の前に、Panoptesが何のためのProductかを揃える。

### Key Message

PanoptesはWebを観測するだけでなく、構造差を説明し、意思決定と行動へつなぐStrategy OSを目指す。

### On-slide Content

**Panoptes**  
外部Webの証跡から、自社・競合・業界の構造差を読み解き、戦略と実行優先順位へつなぐStrategy OS

```text
Observe → Analyze → Compare → Decide → Act
```

Small caption:

> HTML / DOM・Screenshot・Visual hierarchyを根拠に、戦略案と30 / 60 / 90日の行動へ接続する

### Visual

中央に横一列の5-step flow。左端にWeb evidence、右端にStrategy / Roadmap。技術ロゴや実装statusはまだ出さない。Title slideとして余白を広く取り、説明を一文に限定する。

### Speaker Notes

Panoptesの目的は、Webサイトを単に採点することではありません。自社、競合、業界を同じ観点で観測し、何が違うのか、その差がなぜ重要かを説明し、戦略候補と次の行動へつなぐことです。今日の話は、この価値を実際に動く一連の仕組みにするため、どこまで整っていて、次に何をつなぐべきかを共有するものです。

### Avoid

- Phase番号、component数、Rails/Pythonなどの実装詳細。
- 継続監視やLLM分析が既に稼働しているような表現。
- 「完成間近」「AIが自動で戦略を決める」という断定。

## Slide 2 — 基盤は整った。中心のBusiness Loopは未接続

### Purpose

画面が存在することと、SaaSとして一連の価値を提供できることを分離する。

### Key Message

UI、認証、Organization、品質基盤は前進したが、URL取得から戦略提案までの実処理はまだつながっていない。

### On-slide Content

| Area                              | Current Status                     |
| --------------------------------- | ---------------------------------- |
| UI / Frontend                     | Partially Implemented              |
| Auth / Organization               | Foundation Implemented             |
| Quality Gate                      | Implemented                        |
| API Contract                      | Designed: 18 operations            |
| Rails                             | Identity / Organization foundation |
| Python Worker / Queue / Artifacts | Designed; Not Implemented          |
| Production Cloud                  | TBD                                |

Bottom line:

> 画面があることと、Business Pipelineが本番相当で動くことは別

### Visual

左側にImplemented foundation、右側にNot connected business loopを置く二分構成。Status tableは5〜7行に留め、最下部に一本の結論線を置く。

### Speaker Notes

現在、ユーザーが触る主要画面、Supabaseを使った認証、Organizationの境界、buildやtestを止める品質ゲートはあります。APIも18操作まで契約として設計しています。ただしRailsで実装済みなのは認証・Organization周辺の5つのread操作で、残る13のBusiness操作、Python Worker、Queue、Artifact保存は未実装です。したがって、現在は基盤と設計が整った段階であり、SaaSとして完成した状態ではありません。

### Avoid

- Auth全体をproduction-readyと表現すること。staging実接続やpassword reset等は未完。
- `Designed`を「近日完成」と言い換えること。
- 15領域すべてを一枚へ詰め込むこと。

## Slide 3 — SvelteKit・Rails・Pythonは、別の責任を持つ

### Purpose

現在実装とTarget構成を一枚で示し、3層の責任境界を非エンジニアにも理解できるようにする。

### Key Message

体験とsessionはSvelteKit、Businessの正本はRails、重い外部分析はPython Workerへ分ける。

### On-slide Content

```text
Svelte UI / SvelteKit       PARTIAL
体験・session・BFF
          ↓
Rails Business API         FOUNDATION
Organization・業務ルール・永続化
          ↓
PostgreSQL                 PARTIAL
Identity / Organizationのみ
          ↓
Queue → Python Worker      DESIGNED
取得・Screenshot・分析・LLM
          ↓
Artifacts / Snapshot       DESIGNED
証跡保存・結果再表示
```

Side note:

> Supabaseは認証provider。Business dataの正本とは分離する

### Visual

縦型architecture flow。各layerの右端に共通status markerを付ける。現在動く上半分は実線、未実装の下半分は破線。Target全体を一色で「現行」に見せない。

### Speaker Notes

責任は三つに分けています。SvelteKitは画面体験、session、ブラウザ向けの窓口を担当します。RailsはOrganization境界、ProjectやAnalysisJobなどのBusiness ruleと永続化の正本です。Python Workerはcrawl、Screenshot、visual analysis、LLM処理のような長時間・高負荷処理を担当する計画です。Supabaseは認証providerとして残し、Business dataはRails側で管理します。現在は上半分が部分実装、下半分は設計段階です。

### Avoid

- Framework比較や採用理由の詳細。質問された場合にQ&Aで答える。
- Queue、Storage、Cloud vendorを確定済みに見せること。
- 一本の完成済みarchitecture図として描くこと。

## Slide 4 — 整理によって、次に接続すべき場所が見えた

### Purpose

これまでの整理期間が、単なるcleanupではなく安全に次へ進む基盤づくりだったと示す。

### Key Message

Build、Security、Architecture、Frontend、Documentationの不確実性を減らし、次の最大Gapを特定した。

### On-slide Content

**Build / Quality**  
Production build復旧・CI品質ゲート・route smoke・OpenAPI検証・secret scan

**Auth / Security**  
Supabase SSR Auth・Organization guard・production secure default・Rails JWT検証

**Architecture / Frontend**  
責任境界とOpenAPIの正本化・到達不能/重複整理・巨大component分割・Hero ownership整理

**Documentation**  
Development Log・Audit・Architecture・Planningを継続更新

Evidence strip:

> 108 tests / 11 files　｜　ESLint 0 errors / 60 warnings　｜　OpenAPI 18 operations　｜　quality PASS

### Visual

4カテゴリを水平に並べず、一本の「不確実性を減らす」progressionとして配置する。下端に数値を一行で置く。component cleanupは補助数字として「18 explicit deletions」を小さく添えてよい。

### Speaker Notes

ここまでに、壊れていたproduction buildを直し、test、lint、build、API契約を自動で確認できるようにしました。認証とOrganization境界をsecure defaultにし、Rails側でもJWTを再検証します。Frontendでは到達不能や重複を判定し、巨大componentを責任単位へ分け、Landing Heroの二重描画やanimation重複も整理しました。結果として、108 tests、ESLint error 0、18 API operationsの検証を継続できています。整理の成果は、次の問題を安全に切り分けられることです。

### Avoid

- A-1〜B-3Hの番号や全作業を時系列で読み上げること。
- Warning 60件を0件と誤読させること。
- Test数だけでProduct品質を保証すること。

## Slide 5 — 最大のGapは、分析Pipelineが一度も縦につながっていないこと

### Purpose

次の投資先を一つのBusiness flowとして可視化する。

### Key Message

各画面や契約はあるが、1 URLを証跡・分析・Snapshot・Strategyまで通すVertical Sliceは未完成。

### On-slide Content

```text
URL登録        UI / Contract
   ↓
Web取得        Not Implemented
   ↓
HTML / DOM / Screenshot Artifact
               Designed
   ↓
Internal / Visual / LLM Analysis
               Designed + UI Mock
   ↓
Snapshot       UI / Contract
   ↓
Strategy       UI / Contract
   ↓
30 / 60 / 90  UI / Contract
```

Callout:

> 次の目標：1 Organization / 1 Project / 1 URL / 1 Job / 1 Snapshotを端から端まで通す

### Visual

一本のvertical pipeline。UI/Contractは青、Not Implementedは白地の破線、Target calloutは右側に置く。途中を赤い「失敗」表示にせず、未接続区間として示す。

### Speaker Notes

いま最も重要なGapは、画面単体ではなく一連の分析flowです。URL入力や分析結果、Strategy、RoadmapのUIとAPI契約はありますが、実際にWebを取得し、HTMLやScreenshotを保存し、分析し、Snapshotとして戻すworkerとbackendがありません。これは失敗というより、UIと基盤を整理したことで、次に作るべき最小単位が明確になった状態です。まず1 Organization、1 Project、1 URL、1 Job、1 Snapshotを通すことを提案します。

### Avoid

- 競合10社や継続監視まで最初のsliceへ含めること。
- LLMが判断を自動確定するような表現。
- 未実装を障害や品質事故として扱うこと。

## Slide 6 — 順序を飛ばすと、同じ機能を二度作る

### Purpose

「なぜ今すぐ機能だけを増やさないのか」「なぜ最大3か月なのか」へ答える。

### Key Message

責任とデータの意味を先に揃え、Vertical Sliceで検証してから広げる方が再実装を減らす。

### On-slide Content

**機能追加を先行**

```text
曖昧な責任 / Mockとの差 / Cloud未計測
  → 二重実装
  → API・DBの作り直し
  → 運用負債
```

**今回の推奨**

```text
境界と意味を揃える
  → 最小Vertical Slice
  → Stagingで実測
  → 本番構成を判断
```

Bottom line:

> 整理は停止期間ではなく、実装のやり直しを減らすための検証順序

### Visual

上下または左右の二経路比較。左は枝分かれして戻る線、右は4段の直線。UI card風の多数のboxは使わず、因果だけを見せる。

### Speaker Notes

ここでいう整理は、機能開発を止めるという意味ではありません。画面のfieldが観測事実なのかAIの推論なのか、RailsとWorkerのどちらが正本を持つのかが曖昧なまま広げると、API、DB、画面を二度作る可能性があります。先に境界を揃え、最小Vertical SliceをStagingで動かし、実際の処理時間や保存量を測ってから本番構成を決める。最大3か月はこの検証順序の目安です。

### Avoid

- 「3か月はcleanupだけ」と説明すること。
- 技術負債を過去の担当者や個人開発の責任として扱うこと。
- 3か月でProduct全体が完成すると約束すること。

## Slide 7 — 6つのTimeboxで、最小の実働Loopへ進む

### Purpose

最大3か月の推奨実施順序と各期間の成果物を短く共有する。

### Key Message

Frontend整理を継続しながらMVP境界を固定し、Rails、Worker、Stagingへ依存順に進む。

### On-slide Content

| Period | Goal                                    | Main Deliverable                         | Confidence |
| ------ | --------------------------------------- | ---------------------------------------- | ---------- |
| Aug H2 | Frontend安定化継続 + Scope/Baseline確定 | MVP境界・最小Slice・owner                | HIGH       |
| Sep H1 | Frontend Stabilization                  | Active graph・Shell責任・Visual baseline | HIGH       |
| Sep H2 | UI Contract / Design Foundation         | Field意味・Taxonomy・Token・Test pilot   | MEDIUM     |
| Oct H1 | Rails Business Foundation               | Project・AnalysisJob・Org policy・Outbox | MEDIUM     |
| Oct H2 | Worker Vertical Slice                   | Queue・Safe crawl・Artifact・1 URL run   | LOW        |
| Nov H1 | Staging Proof                           | 1 loop・Monitoring・Workload evidence    | LOW        |

Footer:

> 納期commitmentではなく、依存関係に基づく推奨実施順序

### Visual

横長timeline。各timeboxはGoalを一語、Deliverableを一行に制限する。Confidenceは文字と淡い濃度で示し、LOWを「不要」や「失敗」に見せない。Aug H2はFrontend stabilizationが既に進行中であることを示す継続markerを付ける。

### Speaker Notes

ロードマップは6つのtimeboxです。8月後半はFrontendの安定化を継続しながら、MVP境界、最小Slice、ownerを確定します。9月はFrontendの残る責任整理と、UI fieldの意味、Design Token、test方針を揃えます。10月前半にRailsのProjectとAnalysisJob、後半にQueueとPython Workerで1 URLを通します。11月前半にStagingで一連のloopを再現し、処理時間、保存量、失敗率を測る想定です。後半ほど未確定条件が多いためconfidenceを下げています。

### Avoid

- 日単位の開始・終了日、完了率、確定納期。
- LOWを優先度が低いと説明すること。
- Tailwind全面移行、全18 API実装、production releaseを成果物へ加えること。

## Slide 8 — 依存関係が、実施順序を決める

### Purpose

Frontend、Backend、Infrastructureの順序に理由があることを示す。

### Key Message

CloudやTailwindの最終判断は、前提となる意味・構造・実workloadが揃ってから行う。

### On-slide Content

**Frontend**

```text
Component Cleanup → Taxonomy → Design Token → Tailwind Slice
```

**Backend**

```text
API Contract → Rails Domain → AnalysisJob → Queue → Worker
```

**Infrastructure**

```text
Real Workload → Staging Measurement → Cloud Comparison → Decision
```

Callout:

> Cloudを先に決めても、workloadと保存量がなければcost/securityを比較できない

### Visual

3本の平行dependency chain。矢印方向とstatus色を統一する。Cloud provider logoは使わず、比較が中立であることを保つ。

### Speaker Notes

この順番には依存関係があります。Frontendはcomponentの正本と分類が決まってからTokenを定め、その後にTailwindの小さなsliceを試します。BackendはAPI契約からRailsのdomainとJobを作り、QueueとWorkerへつなぎます。Infrastructureは実workloadをStagingで測って初めて、Cloudの費用、managed service、securityを比較できます。そのためAWSかAzureかを今日最終決定するのは早い、という整理です。

### Avoid

- Tailwind採用を確定事項にすること。
- AWS/Azureの一般論比較へ脱線すること。
- 3本を同時に最大並行できると仮定すること。Team capacityはTBD。

## Slide 9 — 今日決めるのは、MVP・最小Slice・優先順位

### Purpose

会議を具体的な意思決定へ収束させる。

### Key Message

最優先の3点を合意し、責任分担とStaging条件を次の実行可能な形にする。

### On-slide Content

**Priority A — 今日合意したい**

1. MVP境界：1回の保存可能なAnalysis Loopを中心にするか
2. 最小Vertical Slice：1 Org / 1 Project / 1 URL / 1 Job / 1 Snapshotか
3. 最大3か月の推奨実施順序を採用するか

**Priority B — Ownerと次回期限を決めたい**

4. SvelteKit / Rails / Pythonの責任分担
5. Team構成・担当・稼働率
6. Stagingの成功条件

**Priority C — 開始条件を決めたい**

7. Cloud PoCを始めるために必要なworkload evidence

### Visual

上からA/B/Cの優先順位。Priority Aを面積の半分程度にし、B/Cは簡潔にする。すべてを同じ重さのchecklistにしない。

### Speaker Notes

今日最優先で決めたいのは三つです。MVPを1回の保存可能なAnalysis Loopと定義するか。最小単位を1 Organization、1 Project、1 URL、1 Job、1 Snapshotにするか。そしてこの依存順のroadmapを採用するかです。次に、各層の責任、担当と稼働率、Stagingの成功条件は、少なくともownerと次回の決定期限を置きたいです。Cloudについてはproviderではなく、PoC開始に必要な実測条件を決めます。

### Avoid

- 7項目すべてを会議中に詳細設計すること。
- 担当者や人数を推測で記入すること。
- 「承認してください」だけで選択肢や保留条件を示さないこと。

## Slide 10 — 今は、製品名や細かな容量を固定しない

### Purpose

議論をMVPと実証条件へ集中させ、未成熟な詳細決定を明示的に保留する。

### Key Message

Providerやcapacityは、実workloadの証拠が揃ってから選ぶ。

### On-slide Content

**Not required on 8/17**

- AWS / Azureの最終決定、Kubernetes採否
- Instance size、Worker concurrency、5年TCO
- Queue / Storage / LLM providerの永久固定
- Artifact retentionの最終値
- Tailwind全面移行日とclass詳細
- DB indexの詳細

**Today’s close**

> まずMVP境界、最小Slice、ownerを合意し、実測できる状態を作る

### Visual

大きなclosing statementを中央に置き、保留項目は周辺に小さく配置する。禁止マークの多用は避け、「later with evidence」の表現にする。

### Speaker Notes

今日決めなくてよいことも明確にします。AWSかAzureか、Kubernetesを使うか、何台・何GBにするか、QueueやStorage、LLMのproviderを永久固定するかは、まだ前提がありません。先にMVP境界、最小Slice、ownerを合意し、StagingでworkloadとArtifact量を測れる状態を作る。その証拠をもって本番構成を判断する、という順序で閉じたいと思います。

### Avoid

- 保留を「検討しない」と受け取らせること。
- Provider候補の優劣をその場で論じること。
- 一般的なThank youだけで終わること。

## PowerPoint conversion notes

- Slide 1、5、7、9をstory anchorとし、Short版でも残す。
- Slide 2のstatus label、Slide 3の実線/破線、Slide 7のconfidenceは同一legendを使う。
- Slide 4の数値はB-3H baselineのまま扱い、「2026-08-10時点」をfooterへ付ける。
- Slide 7のAug H2表現のみ、M-1の進捗文脈に合わせて「Frontend stabilization継続＋Scope/Baseline確定」とした。M-1 Roadmap正本のPhaseや期間は変更しない。
- SourceはPowerPointのspeaker notesへ残し、visible slideへ長いURLを表示しない。

## Sources

- [M-1 Current State](./2026-08-17-mtg-panoptes-current-state.md)
- [M-1 Three-month Roadmap](./2026-08-17-three-month-inventory-roadmap.md)
- [M-1 One-page Summary](./2026-08-17-mtg-one-page-summary.md)
- [Development Log](../DEVELOPMENT_LOG.md)
- [API Boundary](../architecture/api-boundary.md)
- [OpenAPI Draft](../api/openapi-draft.yaml)
- [Rails Foundation](../rails/01-foundation.md)
