# Panoptes 2026/08/17 MTG Speaker Notes

**Deck:** [Slide Storyboard](./2026-08-17-mtg-slide-storyboard.md)  
**Standard:** 10〜15分  
**Short:** 5〜7分  
**目的:** 完成報告ではなく、現在地と最大3か月の推奨検証順序を共有し、MVP境界と最小Vertical Sliceの合意へ進む。

## Opening Script — 30〜60秒

今日は、Panoptesの実装を日常的に見ていない方にも分かる形で、現在地と次の進め方を共有します。ここまでコードベース、認証、Organization境界、品質基盤、API契約を整理したことで、できている部分と、まだつながっていない部分がかなり明確になりました。

今日は完成報告ではありません。Panoptesの中心価値を本番相当の一連の流れにするため、最大3か月を目安に、どの順番で棚卸し、設計、検証するかをご相談する場です。特に、MVPをどこまでとするか、最初のVertical Sliceを何にするか、この二点を中心に揃えたいと思います。

## Standard Version — 10〜15分

### Slide 1 — Webの証跡を、戦略と実行へつなぐ

Panoptesが目指しているのは、Webサイトを単に採点したり、SEO指標を並べたりすることではありません。HTMLやDOM、Screenshot、画面上の情報の強弱を証跡として、自社、競合、業界を同じ視点で観測します。その差を説明し、複数の戦略候補と30日、60日、90日の実行優先順位へつなぐStrategy OSです。

今日の技術整理も、このProduct価値を実際に動く仕組みにするために行っています。まずProductのゴールを揃え、その後に現在地を見ていきます。

**質問された場合のみ:** 継続監視や履歴差分は将来方向として設計されていますが、現在のMVPで稼働している機能ではありません。最初は保存可能な1回の分析loopを成立させる方針です。

**Sources**

- [M-1 Current State — Product / Business Overview](./2026-08-17-mtg-panoptes-current-state.md#2-product--business-overview)

### Slide 2 — 基盤は整った。中心のBusiness Loopは未接続

現在、主要なUI、Supabaseを使った認証、Organizationの境界、buildやtestを自動で確認する品質ゲートがあります。APIも18の操作を契約として定義しています。

一方で、Railsで実装されているのはhealth、current user、Organizationなど5つのread操作です。Project、AnalysisJob、Snapshot、Strategy、Roadmapなど残る13のBusiness操作は未実装です。Python Worker、Queue、Artifact Storageも設計段階です。

つまり、基盤と画面があることと、PanoptesのBusiness価値が端から端まで動くことは別です。ここを過大にも過小にも評価しないことが、今回の資料の前提です。

**質問された場合のみ:** Authもstaging実接続、password reset、OTPなどが残るため、Product全体としてproduction-readyとは表現しません。

**Sources**

- [M-1 Current-state Scorecard](./2026-08-17-mtg-panoptes-current-state.md#3-current-state-scorecard)
- [M-1 API and Data Boundary](./2026-08-17-mtg-panoptes-current-state.md#6-api-and-data-boundary)

### Slide 3 — SvelteKit・Rails・Pythonは、別の責任を持つ

システムの責任は三つに分けています。SvelteKitは、画面体験、session、ブラウザから使うAPIの窓口を担当します。Railsは、Organization境界、ProjectやAnalysisJobのBusiness rule、データ永続化の正本です。Python Workerは、Web取得、Screenshot、visual analysis、LLM処理など、時間や計算資源を使う非同期処理を担当する計画です。

Supabaseは認証providerとして使い続けますが、Projectや分析結果の正本にする計画ではありません。現在はSvelteKitとRailsのidentity/Organization部分までが実装され、Queue以降は設計段階です。

**質問された場合のみ:** SvelteKitがRailsを置き換えるのではなく、Browser向けBFFとしてsessionとresponseを整える位置づけです。

**Sources**

- [Implemented Architecture Today](./2026-08-17-mtg-panoptes-current-state.md#4-implemented-architecture-today)
- [Planned Target Architecture](./2026-08-17-mtg-panoptes-current-state.md#5-planned-target-architecture)
- [API Boundary](../architecture/api-boundary.md)

### Slide 4 — 整理によって、次に接続すべき場所が見えた

ここまでの整理は、大きく四つです。一つ目は、production buildを復旧し、check、lint、test、build、API契約などをCIで確認できるようにしたこと。二つ目は、Supabase SSR Auth、Organization guard、production secure default、RailsでのJWT再検証です。

三つ目は、SvelteKit、Rails、Pythonの責任境界とOpenAPIを正本化し、Frontendの到達不能や重複、巨大component、Landing Heroの所有問題を整理したこと。四つ目は、その判断をAudit、Architecture、Development Logへ残したことです。

B-3H時点で、108 tests、11 test files、ESLint error 0、warning 60、OpenAPI 18 operations、quality PASSです。重要なのは数字だけでなく、次の変更を検証できる基盤ができたことです。

**質問された場合のみ:** Explicit component deletionは18件です。現在のreusable Svelte componentは119件ですが、責任分割でfeature componentも増えているため、単純な減少率を品質指標にはしません。

**Sources**

- [Phase Digest](./2026-08-17-mtg-panoptes-current-state.md#7-phase-a-1b-3h-accomplishment-digest)
- [Metrics Snapshot](./2026-08-17-mtg-panoptes-current-state.md#8-metrics-snapshot)
- [Development Log](../DEVELOPMENT_LOG.md)

### Slide 5 — 最大のGapは、分析Pipelineが一度も縦につながっていないこと

次に接続すべき最大のGapは、1 URLを最後まで処理するBusiness Analysis Pipelineです。URL登録画面とAPI契約はあります。分析結果、Snapshot、Strategy、RoadmapのUIと契約もあります。しかし、実際にWebを取得し、HTMLやScreenshotを保存し、internal analysisやvisual analysisを実行し、Snapshotとして返すbackendとworkerがありません。

ここは失敗ではなく、UIと基盤を先に整理した結果、次に検証すべき単位が明確になったと捉えています。最初の候補は、1 Organization、1 Project、1 URL、1 AnalysisJob、1 Snapshotです。この一本を端から端まで通すことが、次の大きな証拠になります。

**質問された場合のみ:** 競合10社、継続監視、完全なLLM戦略生成までを最初のsliceへ入れるとは決めていません。

**Sources**

- [MVP Capability Matrix](./2026-08-17-mtg-panoptes-current-state.md#mvp-capability-matrix)
- [Technical Debt Inventory](./2026-08-17-mtg-panoptes-current-state.md#9-technical-debt-inventory)

### Slide 6 — 順序を飛ばすと、同じ機能を二度作る

では、なぜすぐに画面や機能を増やさないのか。理由は、画面のfieldが観測事実なのか、AIの推論なのか、ユーザーが選んだ意思決定なのかを揃えずにbackendを作ると、APIやDBを作り直す可能性が高いからです。

また、Workerが1 URLを処理する時間、保存するScreenshotやHTMLの量が分からないままCloudを決めても、costやsecurityを比較できません。先に責任とデータの意味を揃え、最小Vertical SliceをStagingで動かし、実測してから本番構成を判断します。整理は機能開発の停止ではなく、やり直しを減らすための実装順序です。

**質問された場合のみ:** Design Systemも同様で、Tokenやvisual baselineより先に全面Tailwind移行を始めると二重移行になる可能性があります。

**Sources**

- [Roadmap Planning Principles](./2026-08-17-three-month-inventory-roadmap.md#1-planning-principles)
- [Dependency Map](./2026-08-17-three-month-inventory-roadmap.md#2-dependency-map)

### Slide 7 — 6つのTimeboxで、最小の実働Loopへ進む

推奨順序は6つのtimeboxです。8月後半は、既に進んでいるFrontend安定化を継続しながら、MVP境界、最小Slice、ownerを確定します。9月前半はactive graph、Shell、残る大きなcomponent、visual baseline。9月後半はUI fieldの意味、component taxonomy、Design Token、test pilotを扱います。

10月前半はRailsでProjectとAnalysisJob、Organization policy、Outboxまでを最小実装し、後半にQueueとPython Workerで1 URLを処理します。11月前半はStagingで一連のloopを再現し、処理時間、保存量、失敗率を測り、Cloud比較の入力を作ります。

これは納期commitmentではありません。後半はteam、provider、workloadが未確定なためconfidenceをLOWとしています。必要性が低いのではなく、予測幅が大きいという意味です。

**Sources**

- [Timeboxed Roadmap](./2026-08-17-three-month-inventory-roadmap.md#3-timeboxed-roadmap)
- [Phase Details](./2026-08-17-three-month-inventory-roadmap.md#4-phase-details)

### Slide 8 — 依存関係が、実施順序を決める

三つの依存関係があります。Frontendは、componentの正本整理からtaxonomy、Design Tokenへ進み、その後にTailwindを採用する場合の小さなsliceを試します。Backendは、API契約、Rails domain、AnalysisJob、Queue、Workerの順です。

Infrastructureは、実workload、Stagingでの測定、Cloud比較、最終判断の順です。URL数、page数、処理時間、Screenshot容量が分からない現在、Cloud providerやinstance sizeを先に固定しても、根拠ある比較にはなりません。この依存関係が、roadmapの順番を決めています。

**質問された場合のみ:** 各workstreamをどこまで並行できるかはteam人数と稼働率次第で、現時点ではTBDです。

**Sources**

- [Roadmap Dependency Map](./2026-08-17-three-month-inventory-roadmap.md#2-dependency-map)
- [Decision Gates](./2026-08-17-three-month-inventory-roadmap.md#6-decision-gates)

### Slide 9 — 今日決めるのは、MVP・最小Slice・優先順位

今日最優先で合意したいのは三つです。一つ目は、MVPを1回の保存可能なAnalysis Loopとして切るか。二つ目は、最小Vertical Sliceを1 Organization、1 Project、1 URL、1 Job、1 Snapshotにするか。三つ目は、この6つの推奨順序を採用するかです。

次に、SvelteKit、Rails、Pythonの責任、teamの担当と稼働率、Stagingの成功条件について、すべてを詳細決定できなくてもownerと次回期限を決めたいです。Cloudはproviderを決めるのではなく、PoCを始めるために何を測るかを合意します。

**進行用の確認:** Priority Aの3点について、異論、除外したい範囲、追加すべきacceptance conditionを順に確認する。

**Sources**

- [8/17 MTGで決めること](./2026-08-17-mtg-panoptes-current-state.md#11-817-mtgで決めること)

### Slide 10 — 今は、製品名や細かな容量を固定しない

逆に、今日決めなくてよいことも明確にします。AWSかAzureか、Kubernetesを使うか、instance sizeやworker concurrencyをどうするか、Queue、Storage、LLM providerを永久固定するかは、まだ実workloadがありません。

Tailwindの全面移行日やDB indexの詳細も、今のMVP判断には不要です。先にMVP境界、最小Slice、ownerを合意し、Stagingで測れる状態を作る。その証拠をもとに本番構成を判断する順序で進めたいと考えています。

**進行用の確認:** 保留事項に、今日決めなければ後続が止まるものがないかだけを確認する。

**Sources**

- [まだ決めないこと](./2026-08-17-mtg-panoptes-current-state.md#12-まだ決めないこと)
- [Assumptions and Unknowns](./2026-08-17-three-month-inventory-roadmap.md#8-assumptions-and-unknowns)

## Closing Script — 約30秒

まとめると、PanoptesはUI、認証、Organization境界、品質、API契約、Rails基礎まで整い、次に接続すべき場所が明確になりました。次の一手は、機能を横に増やすことではなく、1 URLを取得、分析、保存し、Snapshotとして戻す最小Vertical Sliceを縦に通すことです。

今日は、その前提となるMVP境界、最小Slice、最大3か月の推奨順序を合意し、ownerと次回の判断期限を置くところまで進めたいと思います。

## Short Version — 5〜7分

### 使用するSlide

| Slide             | Treatment                                         | Target time |
| ----------------- | ------------------------------------------------- | ----------: |
| 1                 | 使用。Product定義のみ                             |        35秒 |
| 2                 | 使用。基盤と未接続を一言ずつ                      |        45秒 |
| 3                 | 省略。必要ならSlide 2で三層責任を一文補足         |         0秒 |
| 4                 | 短縮。数値と4カテゴリだけ                         |        35秒 |
| 5                 | 使用。最重要                                      |        60秒 |
| 6                 | 省略。Slide 7導入で「やり直しを減らす順序」と説明 |         0秒 |
| 7                 | 使用。6期間を1分以内                              |        60秒 |
| 8                 | 短縮。Cloud判断の依存だけ                         |        30秒 |
| 9                 | 使用。Priority Aを中心に                          |        60秒 |
| 10                | 使用。保留項目を一括確認                          |        30秒 |
| Opening / Closing | 使用                                              |        70秒 |

### Short talk track

1. PanoptesはWebの証跡を、自社・競合・業界の差分、戦略、30/60/90日の行動へつなぐProductです。
2. UI、認証、Organization、品質、API契約、Rails基礎まではあります。一方、取得・分析・Artifact・SnapshotをつなぐWorkerとBusiness backendは未実装です。
3. ここまでの整理で108 tests、quality PASS、18 API operationsを維持でき、次のGapが見えました。
4. 次は1 Org / 1 Project / 1 URL / 1 Job / 1 Snapshotを通すVertical Sliceです。
5. 8月後半から11月前半は、Frontend継続整理、UI/domain意味合わせ、Rails、Worker、Stagingの順で検証します。納期commitmentではありません。
6. Cloudはworkload測定後に比較します。
7. 今日決めたいのは、MVP境界、最小Slice、推奨順序の三点です。

## Standard pacing guide

| Section                          | Slides | Approx. time |
| -------------------------------- | ------ | -----------: |
| Opening / Product                | 1      |        1.5分 |
| Current state / Architecture     | 2–3    |        2.5分 |
| Progress / Core gap              | 4–5    |          3分 |
| Rationale / Roadmap / Dependency | 6–8    |          4分 |
| Decisions / Deferrals / Closing  | 9–10   |          3分 |

質疑時間を確保する場合、Slide 3と6は口頭一文へ短縮できる。Slide 5、7、9は省略しない。

## Delivery cautions

- `Implemented`、`Partially Implemented`、`Designed`、`TBD`を言い換えで曖昧にしない。
- 3か月を完成期限として読まれそうな場合、Slide 7のfooterを読み上げる。
- LOW confidenceは優先度ではなく予測幅だと必ず補足する。
- Team人数、URL数、cost等を問われたら推測せずQ&AのTBD回答へ移る。
- 技術選定の議論が始まったら、Slide 8の「実測後に比較」へ戻す。
