# Panoptes 最大3か月棚卸しRoadmap

**想定期間:** 2026年8月後半〜11月前半  
**位置づけ:** 実装納期のcommitmentではなく、棚卸し、設計、検証、最小vertical sliceのtimebox  
**基準:** [8/17 MTG向け現状整理](./2026-08-17-mtg-panoptes-current-state.md)

## 1. Planning principles

- 現行実装とtarget設計を同時に「完成」と数えない。
- Frontend全面整理、Tailwind全面移行、全business API実装を3か月の約束にしない。
- 最小の端から端の証拠を、横に広げる前に作る。
- Cloud選択は、worker workloadとartifact量の実測後に行う。
- 各timeboxはexit criteriaを満たさなければ次へ自動進行しない。
- Confidenceは技術の難易度だけでなく、product判断、担当者、外部環境の確定度を含む。

## 2. Dependency map

```text
Product/MVP境界
  -> Observation・Inference・Decision語彙
      -> OpenAPI / domain model確定
          -> Rails Project + AnalysisJob
              -> Outbox / Queue
                  -> Python Worker
                      -> Artifact Storage
                          -> Snapshot projection
                              -> BFF / Frontend実データ接続

Frontend active graph
  -> Shell責務分割
      -> Design token / responsive基準
          -> Visual baseline
              -> 最初のTailwind小規模slice（採用時のみ）

Worker workload定義
  -> Queue/Storage候補PoC
      -> Cost/Security比較
          -> Cloud方針
```

## 3. Timeboxed roadmap

| Timebox | Focus                             | Key deliverables                                                                                    | Dependencies                     | Confidence |
| ------- | --------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------- | ---------- |
| Aug H2  | Scope and baseline freeze         | MVP境界、担当、現状metrics、role語彙、vertical slice acceptance                                     | 8/17 decisions                   | HIGH       |
| Sep H1  | Frontend stabilization            | active graph再計測、残るDEFER判定、shell/header/roadmap責務案、visual test baseline                 | Product semantics                | HIGH       |
| Sep H2  | UI contract and design foundation | observation/inference/decision field map、token/responsive方針、component test pilot、OpenAPI差分   | Sep H1                           | MEDIUM     |
| Oct H1  | Rails business foundation         | Project/AnalysisJob最小schema、org-scoped policy、create/get API、outbox、contract tests            | Domain/API approval              | MEDIUM     |
| Oct H2  | Worker vertical slice             | Queue adapter、Python worker skeleton、safe fetch、artifact保存、job retry/idempotency、1 URL run   | Rails job/outbox、workload limit | LOW        |
| Nov H1  | Staging proof and next decision   | Supabase staging、1 end-to-end snapshot、observability、cost/security evidence、cloud decision memo | Worker slice、staging access     | LOW        |

`LOW`は実施価値が低いという意味ではない。現時点でworker実装、製品選択、外部環境、担当工数が未確定であり、日付の予測幅が大きいことを示す。

## 4. Phase details

### Phase 1 — Aug H2: Scope and baseline freeze

**Objective:** MVPと3か月間の対象を合意し、推測でbackendを作らない状態にする。

**Deliverables**

- 1 Organization / 1 Project / 1 URL / 1 AnalysisJob / 1 Snapshotのacceptance scenario。
- 継続監視、billing、enterprise機能を除外したMVP boundary。
- Svelte/Rails間のrole語彙決定 (`organization_owner`対`owner`)。
- Workstream owner、利用可能工数、review cadence。
- Current-state metricsとrisk registerの承認。
- URL/page上限、分析timeout、artifact retentionを測るための仮説値。

**Exit criteria**

- 「何を作ればvertical slice成功か」をproduct/frontend/backend/workerで同じ文章にできる。
- 各workstreamにownerがいる。
- AWS/Azureをこの段階で最終決定しないことが合意される。

**Risks:** Product判断が延びると後続のAPI/DBがすべて遅延する。  
**Confidence:** HIGH

### Phase 2 — Sep H1: Frontend stabilization

**Objective:** 実データ接続前に、UIの到達性と所有責務を限定する。

**Deliverables**

- Route起点のactive import graph再計測とcurrent unreachable count。
- `StrategyAnalysisPlanRail` / `Card`のKEEP/MERGE/DELETE判断。
- `PanoptesShellPage` 336行、roadmap phase card 400行、site header 313行の責務監査。
- Directory ownershipとcomponent taxonomyの現状案、ESLint warning削減の安全な優先順位。
- 代表routeと1440/768/390pxのvisual baseline。
- mock/view modelを、実APIへ残すadapter境界と削除予定fixtureに分類。

**Exit criteria**

- 同じ業務概念に複数の正本がない。
- Shellとfeatureのownershipが文書化される。
- 後続変更を検知できる代表screenshot/E2E方針がある。
- `npm run quality`がexit 0で、warningを増加させない。

**Risks:** 見た目の修正へscopeが拡大する。  
**Confidence:** HIGH

### Phase 3 — Sep H2: UI contract and design foundation

**Objective:** UI項目の意味をAPI/domainへ安全に写し、style移行の前提を作る。

**Deliverables**

- 主要screen fieldを `observation` / `inference` / `decision` / `execution`へ分類。
- MVP snapshotの必須/任意/未知field一覧。
- OpenAPIとUI view modelのgap report。
- Color、spacing、type、radius、breakpointのtoken正本案。
- Component test pilotとvisual regression pilot。
- Tailwindを採用する場合の1 feature限定pilot計画。全面移行は含めない。

**Exit criteria**

- Rails/workerがUI copyやfixtureからdomainを推測しなくてよい。
- Responsiveとtokenの変更ルールがある。
- Pilotでvisual driftを検知できる。

**Risks:** Design議論が全画面再設計へ広がる。  
**Confidence:** MEDIUM

### Phase 4 — Oct H1: Rails business foundation

**Objective:** Organization境界を維持した最小business APIとjob投入基盤を作る。

**Deliverables**

- Project、AnalysisJob、必要最小限のSnapshot/Artifact metadata schema。
- Organization-scoped read/write authorization policy。
- Project bootstrap、AnalysisJob create/getの最小API。
- Transactional outboxまたは同等のjob dispatch整合性。
- OpenAPI conformance、authorization、idempotency tests。
- Migration/rollbackとseed方針。

**Exit criteria**

- 別OrganizationのProject/Jobをread/writeできないことをtestで証明。
- API requestからjob recordとoutbox recordが一貫して作られる。
- 未実装operationは明示的な状態で契約と同期する。

**Risks:** 18 operationsを一度に実装しようとしてvertical sliceが遅れる。  
**Confidence:** MEDIUM

### Phase 5 — Oct H2: Worker vertical slice

**Objective:** 1 URLを安全に取得し、artifactとjob結果を返す最小非同期loopを証明する。

**Deliverables**

- Python worker package、health、structured logging、configuration boundary。
- Queue adapterとjob payload versioning。
- DNS/IP再検証、private network拒否、redirect上限、size/time limitを含むSSRF防御。
- raw/normalized observation artifactのobject storage保存とchecksum。
- retry、timeout、cancel、idempotency、dead-letter方針。
- 1 URL / limited pagesでの計測値: duration、bytes、artifact数、failure種別。

**Exit criteria**

- 同じjobを再配信しても二重確定しない。
- private/local destinationへ到達しないことをtestで証明。
- 成功/失敗がRailsのjob stateへ反映され、artifactを追跡できる。

**Risks:** robots/legal policy、browser runtime、LLM provider、Queue/Storage製品が未確定。  
**Confidence:** LOW

### Phase 6 — Nov H1: Staging proof and next decision

**Objective:** productionを宣言せず、stagingで1本のevidence-backed loopを成立させる。

**Deliverables**

- Supabase stagingとRails JWT/org mappingの実接続。
- URL登録からSnapshot再表示までの1本のhappy path。
- Minimal monitoring: request/job correlation、error rate、latency、queue depth、storage usage。
- Backup/restore、secret rotation、incident ownershipのdraft。
- AWS/Azure等の候補比較memo: workload fit、managed services、security、cost range、team skill。
- 次の90日についてのcontinue/pivot/stop判断材料。

**Exit criteria**

- Stagingで再現可能なrunbook付きdemoがある。
- 失敗jobを追跡し、原因を分類できる。
- 実測に基づくcloud/Queue/Storageの次判断ができる。

**Risks:** Staging access、capacity、external service審査、worker前段の遅延。  
**Confidence:** LOW

## 5. Cross-workstream backlog

### Product / Business

- MVP success metric: time-to-first-snapshot、completion rate、strategy adoption、roadmap action率。
- 観測対象に対する利用規約、robots、customer consent。
- 競合10社選定の手動/自動境界。
- AI inferenceの根拠表示とhuman confirmation。

### Frontend / Design

- Remaining DEFER 2件の判断。
- Oversized componentsとshell ownership。
- Responsive/mobile overflow。
- Component test、Browser E2E、visual regression。
- Token決定前にTailwind全面移行を始めない。

### Backend / Data

- Project、AnalysisJob、Snapshot、Artifactのaggregate boundary。
- State transition、optimistic locking、idempotency key。
- Org-scoped policyをcontrollerだけでなくquery/service境界に置く。
- OpenAPI contract drift prevention。

### Worker / Platform

- CrawlerとAI synthesisを同一process/jobにするか分離するか。
- Browser automationのresource limit。
- Queue delivery semantics、DLQ、backpressure。
- Artifact retention/encryption/deletion。
- Production adapter、network、TLS、observability、backup。

## 6. Decision gates

| Gate               | Evidence required                                   | Decision enabled        |
| ------------------ | --------------------------------------------------- | ----------------------- |
| G1: MVP scope      | accepted scenario、excluded features、owner         | Domain/API work開始     |
| G2: UI semantics   | field classification、active graph、visual baseline | DB/OpenAPI確定          |
| G3: Job foundation | org policy、job/outbox tests                        | Worker接続              |
| G4: Workload proof | duration/bytes/failure/cost measurements            | Queue/Storage/Cloud比較 |
| G5: Staging proof  | repeatable E2E、monitoring、runbook                 | Production roadmap判断  |

## 7. Capacity scenarios

工数が未確定なため、roadmapは次のように縮退させる。

| Available capacity         | Realistic maximum by Nov H1                                                 |
| -------------------------- | --------------------------------------------------------------------------- |
| 1 primary engineer         | Phase 1〜3 + Rails schema/API spike。Workerは設計/PoCまで                   |
| 2 engineers                | Frontend stabilizationとRails foundationを並行し、Worker最小sliceへ進む余地 |
| 3+ cross-functional owners | Staging proofまで狙えるが、product/design/cloud decisionsが期限内に必要     |

人員が少ない場合はphaseを重ねず、MVP semanticsと1 vertical sliceを優先する。

## 8. Assumptions and unknowns

- Team member、稼働率、予算、契約済みcloud/serviceは `Unknown / TBD`。
- Crawl対象URL数、page数、頻度、地域、artifact容量は `Unknown / TBD`。
- LLM model/provider、visual capture方法、Queue/Storage製品は `Unknown / TBD`。
- したがってOct H2以降のconfidenceはLOWであり、8/17時点の納期約束には使わない。

## 9. References

- [Current State](./2026-08-17-mtg-panoptes-current-state.md)
- [One-page Summary](./2026-08-17-mtg-one-page-summary.md)
- [API Boundary](../architecture/api-boundary.md)
- [OpenAPI Draft](../api/openapi-draft.yaml)
- [Analysis Job State Machine](../api/analysis-job-state-machine.md)
- [Rails Foundation](../rails/01-foundation.md)
- [Frontend Active Graph](../architecture/frontend-active-graph.md)
