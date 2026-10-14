# Panoptes 8/17 MTG向け現状整理

**基準日:** 2026-08-10  
**会議日:** 2026-08-17  
**対象:** Phase A-1〜B-3H、Rails Phase R-1  
**目的:** 実装済み、設計済み、未実装を分離し、次の最大3か月の棚卸し順序を判断できる状態にする。

## 1. Executive Summary

Panoptesは、登録したURLから自社・競合・業界の構造を観測し、差分を説明し、戦略候補と30/60/90日の実行優先順位へ接続する「Strategy OS」を目指す。現在は、MVPの主要画面、mock/view model、認証・Organization境界、API契約、Railsのidentity/organization read基盤まで存在する。一方、URL取得から分析、artifact保存、snapshot生成までをつなぐ業務処理は未実装であり、production-readyなMVPではない。

Phase A-1〜B-3Hにより、frontend build、品質ゲート、SSR認証、route guard、API境界、Rails R-1、到達不能component整理、巨大component分割、Landing Hero ownership/SVG/runtime調査までを完了した。次の焦点は機能追加の量ではなく、MVP境界の合意、frontend残債の限定、Rails業務domain、Queue/Python worker/Artifactの最小vertical slice、stagingでの実証である。

## 2. Product / Business Overview

### Product concept

Panoptesは、企業Webサイトを外部から継続観測できる形で収集し、自社・競合・業界の構造差を説明可能な証跡へ変換し、事業・product・marketingの意思決定者が戦略と実行順序を選ぶことを支援する構想である。汎用analytics、SEO checker、chat UI、project managerそのものを目的とせず、「何が観測されたか」「そこから何を推論したか」「何を選ぶか」を接続する。

### Core value

1. 外部Webを、単なるSEO指標ではなくHTML/DOM・情報構造とvisual hierarchyの両面から観測する。
2. 自社、競合10社、業界構造を同じ観測モデルで比較する。
3. 観測事実と推論を区別しながら、自社との差分と原因を説明する。
4. 3つの戦略案を、根拠、fit、優先順位とともに提示する。
5. 選択した戦略を30/60/90日のroadmapとsnapshotへ接続する。

「継続監視、差分履歴、feed/radar」は将来方向として仕様に含まれるが、現MVPの実装済み機能ではない。MVPの中心は、まず1回の分析loopを永続化可能な形で端から端まで成立させることである。

| Value / evidence             | Current interpretation                                                   | Implementation state                  |
| ---------------------------- | ------------------------------------------------------------------------ | ------------------------------------- |
| External web observation     | URL/page/siteを継続観測可能なbundleとして扱う                            | Designed; one-shot pipelineも未実装   |
| HTML / DOM evidence          | Raw/normalized HTML、DOM、information structureをinternal evidenceとする | Designed                              |
| Screenshot / visual evidence | Layout、hierarchy、emphasisをvisual evidenceとして保持する               | Designed                              |
| Internal analysis            | HTML/DOM、content、navigation、funnel、trustを分析する                   | Designed; UI/mock exists              |
| Visual analysis              | Screenshotから配置、強弱、導線を分析する                                 | Designed; UI/mock exists              |
| LLM analysis                 | 理解、統合、説明、strategy synthesisを担当し、crawlerと分離する          | Designed                              |
| History / diff               | URL、HTML、structure、semanticの変化を追跡する                           | Planned; MVP後段                      |
| Strategy proposal            | 根拠付き3案と30/60/90 roadmapへ接続する                                  | Designed; UI/mock/API contract exists |

### Intended MVP loop

```text
URL登録
  -> 自社構造分析
  -> 競合10社分析
  -> 業界構造分析
  -> 自社との差分説明
  -> 戦略案3件
  -> 戦略選択
  -> 30/60/90 roadmap
  -> snapshot保存・再表示
```

### MVP capability matrix

| Capability            | Designed | UI Exists | Mock / View Model | API Contract | Backend | Worker | Production Ready |
| --------------------- | -------- | --------- | ----------------- | ------------ | ------- | ------ | ---------------- |
| URL登録・分析開始     | Yes      | Yes       | Yes               | Yes          | No      | No     | No               |
| 自社構造分析          | Yes      | Yes       | Yes               | Yes          | No      | No     | No               |
| 競合10社分析          | Yes      | Yes       | Yes               | Yes          | No      | No     | No               |
| 業界構造分析          | Yes      | Yes       | Yes               | Yes          | No      | No     | No               |
| 自社との差分・gap説明 | Yes      | Yes       | Yes               | Yes          | No      | No     | No               |
| 戦略案3件・選択       | Yes      | Yes       | Yes               | Yes          | No      | No     | No               |
| 30/60/90 roadmap      | Yes      | Yes       | Yes               | Yes          | No      | No     | No               |
| Snapshot保存・再表示  | Yes      | Yes       | Yes               | Yes          | No      | No     | No               |

`API Contract: Yes`はOpenAPI上の契約があることを示し、endpointが稼働することを意味しない。

## 3. Current-state scorecard

判定語は `Implemented`、`Partially Implemented`、`Designed`、`Planned`、`Unknown / TBD` のみに限定する。

| Area                         | Status                | Evidence-based current state                                                 | Main gap                                                     |
| ---------------------------- | --------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Product / Business           | Designed              | MVP loop、観測bundle、分析軸、将来監視像が仕様化済み                         | 顧客検証、成功指標、MVP外境界の会議合意                      |
| Frontend                     | Partially Implemented | SvelteKit UI、主要route、mock/view model、active graphが存在                 | 業務API接続、shell分割、responsive、残るlegacy 2件           |
| Auth                         | Partially Implemented | Supabase SSR cookie、callback、refresh、logout、safe return先を実装          | staging実接続、password reset、OTP、運用手順                 |
| Organization / Authorization | Partially Implemented | secure-default route guard、Rails membership read/authorizationを実装        | Project以降のresource policy、role語彙統一、write権限        |
| API Contract                 | Designed              | OpenAPI 18 operations / 18 unique operation IDs                              | 実装は5 read operationsのみ、contract conformance未導入      |
| Rails                        | Partially Implemented | API-only、JWT検証、User/Organization/Membership/SystemRole、5 read endpoints | Project、AnalysisJob、Snapshot、Strategy、Roadmap、write API |
| Python Worker                | Designed              | crawler/AI責務、job state、artifact概念を文書化                              | repository内のworker実装は0                                  |
| Database                     | Partially Implemented | PostgreSQL identity/organization schema、1 migration                         | Product/Job/Snapshot/Artifact domain schema                  |
| Queue / Jobs                 | Designed              | AnalysisJob state machine、cancel/confirm、outbox方向を設計                  | Queue製品、dispatcher、retry/idempotency、実装               |
| Storage / Artifacts          | Designed              | observation bundle、checksum/metadata、snapshot境界を設計                    | object storage、retention、容量見積り、実装                  |
| Testing / Quality            | Partially Implemented | frontend/Rails CI、check/lint/test/build/contract/security gate              | component test、browser E2E、visual regression、staging test |
| Design System                | Planned               | 初期style監査と分割実績あり                                                  | token正本、responsive方針、Tailwind採否/移行順序             |
| Infrastructure / Cloud       | Partially Implemented | local Docker Compose/PostgreSQL、CIが存在                                    | production adapter、staging、cloud、TLS/network/monitoring   |
| Security / Operations        | Partially Implemented | JWT、secret境界、org access、production dev-route 404、scan                  | SSRF防御、rate limit、backup、alert、incident/runbook        |
| Documentation                | Implemented           | audit、architecture、API、Rails、Development Logを正本化                     | 初期監査値の再計測、owner/更新規約の継続運用                 |

## 4. Implemented architecture today

```text
Browser
  -> SvelteKit routes / Svelte UI
       -> mock data + view models (business screens)
       -> Supabase SSR Auth (cookie session)
       -> SvelteKit BFF /api/panoptes/v1 (identity/org reads only)
            -> Rails API /api/v1
                 -> JWT verification
                 -> PostgreSQL
                    User / Organization / OrganizationMembership / SystemRole
```

実装済みのRails/BFF read surfaceは次の5種である。

- health
- current user (`me`)
- organization list
- organization detail
- current membership for an organization

Frontend business screenは主としてmock/view modelで動作しており、crawler、AI synthesis、Queue、Artifact storageを経由していない。

## 5. Planned target architecture

```text
Browser
  -> SvelteKit UI / BFF
       -> Rails Business API
            -> PostgreSQL domain models
            -> AnalysisJob + transactional outbox
                 -> Queue
                      -> Python Worker
                           -> crawler / visual observation / AI synthesis
                           -> Object Storage artifacts
                      -> Rails snapshot/status projection
       <- Snapshot / Strategy / Roadmap API
```

Targetのうち、`Project`、`AnalysisJob`、業務domain DB、Queue、Python Worker、Object Storage、Snapshot生成はまだ実装されていない。AWS/Azure等のcloud選択も未決定である。

## 6. API and data boundary

OpenAPI正本には18 operationsがある。内訳はidentity/organization 5件と、未実装のbusiness operations 13件である。

| Group                                 | Contracted | Implemented in Rails | State                             |
| ------------------------------------- | ---------: | -------------------: | --------------------------------- |
| Health / Me / Organization            |          5 |                    5 | Read foundation implemented       |
| Project list / bootstrap              |          2 |                    0 | Designed                          |
| AnalysisJob create/get/confirm/cancel |          5 |                    0 | Designed                          |
| Snapshot read/latest                  |          2 |                    0 | Designed                          |
| Strategy list/select                  |          2 |                    0 | Designed                          |
| Roadmap read/task update              |          2 |                    0 | Designed                          |
| **Total**                             |     **18** |                **5** | **13 business operations remain** |

Organizationの正本はRails/PostgreSQLへ置いたが、Svelte transitional auth contextはrole名に`organization_owner`を使い、Railsは`owner`を使う。write APIへ進む前に、mappingで吸収するか語彙を統一する必要がある。

## 7. Phase A-1〜B-3H accomplishment digest

| Phase | Outcome                                                                          |
| ----- | -------------------------------------------------------------------------------- |
| A-1   | 8件のbroken wrapper/importを正本化しproduction buildを復旧                       |
| A-2   | check/lint/format/test/build/qualityとCI品質ゲートを導入                         |
| A-3   | Auth/Role/Organization境界を設計しsecure-default route guardを導入               |
| A-4   | Supabase SSR cookie認証とserver-only secret境界を実装                            |
| A-5   | SvelteKit BFF / Rails API境界、18-operation OpenAPI、job状態契約を正本化         |
| R-1   | Rails API-only、JWT、identity/organization DB、5 read endpointsを実装            |
| B-1   | 旧到達不能25件をKEEP 6 / DELETE 6 / MERGE 11 / DEFER 2に最終判定                 |
| B-2   | Snapshot旧11 componentsを現行正本へ統合し削除                                    |
| B-3A  | SignUpFormを1,131行から43行のcompositionへ分割                                   |
| B-3B  | SurveyModalを455行から29行のcompositionへ分割                                    |
| B-3C  | 到達不能LoginModal 449行を確認後削除                                             |
| B-3D  | ContactModalを431行から21行のcompositionへ分割                                   |
| B-3E  | Secondary Hero 408行をsection/visual/helperへ分離                                |
| B-3F  | `/lp`、`/plan`のHero二重所有をpage ownershipへ統一                               |
| B-3G  | Primary/Secondary wave coreを共有しduplicate SVG IDを6件から0件へ削減            |
| B-3H  | MutationObserver errorをbrowser automation環境由来と切り分け、production変更なし |

## 8. Metrics snapshot

| Metric                                      |                                  Value | Interpretation                                   |
| ------------------------------------------- | -------------------------------------: | ------------------------------------------------ |
| Initial audited reusable components         |                                    122 | Phase開始時の`src/lib/components`監査値          |
| Current reusable Svelte components          |                                    119 | 現在のfilesystem: components 104 + features 15   |
| Current route Svelte files                  |                                     14 | component数から分離                              |
| Explicit component deletions                |                                     18 | B-1: 6、B-2: 11、B-3C: 1                         |
| Initial unreachable candidates              |                                     25 | 初期静的監査値                                   |
| Final dispositions                          | KEEP 6 / DELETE 6 / MERGE 11 / DEFER 2 | 25件すべてを判定済み                             |
| Remaining known unreachable legacy subgraph |                                      2 | StrategyAnalysisPlanRail / Card、product判断待ち |
| Frontend unit tests                         |                        108 in 11 files | B-3H verified baseline                           |
| ESLint                                      |                 0 errors / 60 warnings | B-3H verified baseline                           |
| OpenAPI                                     |          18 operations / 18 unique IDs | Contract gate active                             |
| Rails product/identity models               |                                      6 | identity/org foundationのみ                      |
| Rails migrations                            |                                      1 | identity/org boundaryのみ                        |
| Repository Python worker files              |                                      0 | dependency配下を除く現物確認                     |

初期CSS監査では、色282、radius 19、shadow 37、scoped style component 99が観測された。これはPhase開始時のbaselineであり、M-1で再計測していないため現在値として扱わない。

## 9. Technical debt inventory

| Category              | Debt                                                            | Consequence                            | Priority |
| --------------------- | --------------------------------------------------------------- | -------------------------------------- | -------- |
| Product semantics     | mock画面と実データの意味、MVP外の継続監視境界が未合意           | backendがUIの推測実装になる            | High     |
| Frontend architecture | PanoptesShellPage 336行、roadmap phase card 400行、header 313行 | 変更影響とresponsive修正コストが高い   | High     |
| Legacy graph          | StrategyAnalysisPlanRail / Cardが到達不能のままDEFER            | 類似概念が並存                         | Medium   |
| Design / Responsive   | token、responsive基準、visual regressionがない                  | Tailwind移行やmobile修正でvisual drift | High     |
| API implementation    | 18契約中13 business operationsが未実装                          | UIがmockから抜けられない               | Critical |
| Data model            | Project/Job/Snapshot/Artifact schemaが未実装                    | 永続的なanalysis loopを作れない        | Critical |
| Worker / Queue        | 実装0、製品/再試行/冪等性未確定                                 | crawl/AI処理が実行不能                 | Critical |
| Storage               | artifact量、retention、PII/robots policy未確定                  | cost/security設計ができない            | High     |
| Authz contract        | Svelte `organization_owner`とRails `owner`の差                  | write権限で誤判定し得る                | High     |
| Quality               | component/E2E/visual/staging testがない                         | 統合時の回帰検出が弱い                 | High     |
| Operations            | staging、monitoring、backup、runbookがない                      | 障害検知・復旧不能                     | High     |
| Capacity              | backend/worker/cloud担当と実稼働量が未確定                      | roadmapの確度を上げられない            | High     |

### Remaining issue checklist

**Frontend**

- `PanoptesShellPage`、roadmap phase card、site header等のoversized responsibility。
- Remaining unreachable legacy subgraph 2件、directory ownership、component taxonomy。
- Tablet/mobile responsive、mobile overflow、ESLint warning 60件の段階的解消。

**Design System**

- Design Token、shared primitive、responsive ruleが未確定。
- Tailwindは未導入。tokenとvisual regressionより先に全面移行しない。

**Product Integration**

- Contact actual submission、Survey persistence、Waitlist endpoint。
- Password reset、OTP login。

**Backend / Data**

- Rails R-2以降のProject、AnalysisJob、Snapshot persistence、Strategy、Roadmap、Usage、Audit。
- Organization-scoped write policy、role語彙、contract conformance。

**Worker / Analysis**

- Python worker contractの実装、crawl、Chromium、screenshot、visual analysis、LLM boundary。
- Retry、cancel、timeout、idempotency、SSRF防御、artifact checksum。

**Infrastructure / Operations**

- Cloud comparison、staging、deployment、monitoring、object storage、Queue、backup、cost model。

**Testing**

- Component test、browser E2E、visual regression、staging integration。

## 10. Risks

| Severity | Risk                                        | Impact                                     | Immediate mitigation                              |
| -------- | ------------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| Critical | Business pipelineが端から端まで未実装       | 現在のUIをMVP提供価値として出荷できない    | 1 project / 1 URLのvertical sliceを最優先に定義   |
| High     | Product semanticsとmock/backend間に差がある | API/DBを作り直す                           | 画面項目をobservation/inference/decisionに分類    |
| High     | Worker workloadとartifact量が不明           | cloud/Queue/storage費用とSLAを判断できない | URL上限、page上限、頻度、timeout、retentionを計測 |
| High     | Organization role語彙が二重                 | 権限漏れまたは過剰拒否                     | Rails正本へのmapping決定とcontract test           |
| High     | Team capacity/ownershipが未確定             | 3か月計画が約束化して崩れる                | workstream ownerと同時進行数を会議で決める        |
| Medium   | Cloudが未決定                               | production topologyの詳細化が遅れる        | workload前提を先に作り、2案PoCで比較              |
| Medium   | Responsive/visual regression不足            | frontend整理で見た目が崩れる               | 代表route/viewportのbaselineを先に固定            |
| Medium   | npm/外部依存の脆弱性・更新                  | quality/security gate劣化                  | 定期更新、例外期限、dependency ownerを設定        |

## 11. 8/17 MTGで決めること

1. MVP境界を「1回の保存可能なanalysis loop」とし、継続監視を次段階へ分けるか。
2. 8月後半〜11月前半を約束ではなく、棚卸し・設計・vertical slice検証のtimeboxとして扱うか。
3. SvelteKit BFF / Rails Business API / Python Workerの責務分離を維持するか。
4. 最初のbackend vertical sliceを「1 Organization / 1 Project / 1 URL / 1 AnalysisJob / 1 Snapshot」にするか。
5. Frontendは先にactive graph、shell、token、visual baselineを安定させ、Tailwind全面移行を開始しない方針でよいか。
6. staging success criteriaをどこまで要求するか（auth、job、artifact、snapshot、monitoring）。
7. 各workstreamのowner、利用可能工数、同時進行数、次のreview日をどう置くか。

## 12. まだ決めないこと

- AWSかAzureかの最終採用、Kubernetes採否、instance size。
- 5年TCOや本番scale。workload測定前の精密値は作らない。
- Tailwindの個別class設計や全component移行日。
- Queue/object storage/LLM providerの永久固定。
- DB index、worker concurrency、retention日数の最終値。
- Continuous monitoring、billing、enterprise team機能の詳細。

## 13. References

- [Development Log](../DEVELOPMENT_LOG.md)
- [Initial Executive Summary](../audit/00-executive-summary.md)
- [Component Reachability Final](../audit/19-component-reachability-final.md)
- [Frontend Active Graph](../architecture/frontend-active-graph.md)
- [API Boundary](../architecture/api-boundary.md)
- [Panoptes API v1](../api/panoptes-api-v1.md)
- [OpenAPI Draft](../api/openapi-draft.yaml)
- [Analysis Job State Machine](../api/analysis-job-state-machine.md)
- [Rails Foundation](../rails/01-foundation.md)
- [Rails Authentication](../rails/02-authentication.md)
- [Rails Organization Authorization](../rails/03-organization-authorization.md)
- [Phase B-3H Runtime Investigation](../audit/36-mutation-observer-runtime-investigation.md)
