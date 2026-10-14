# Panoptes 8/17 MTG One-page Summary

**基準日:** 2026-08-10  
**会議目的:** 現状を「UIがある」と「MVPが動く」に分け、次の最大3か月で何を検証するか決める。

## Product

Panoptesは、登録URLから自社・競合・業界の構造を観測し、差分を説明し、戦略案と30/60/90日のroadmapへ変換するStrategy OSを目指す。

```text
URL -> 自社 -> 競合10社 -> 業界 -> Gap -> 戦略3案 -> 30/60/90 -> Snapshot
```

継続監視・差分feed/radarは将来方向であり、現時点の実装済みMVPではない。

## Current reality

| Exists now                                               | Not implemented yet                             |
| -------------------------------------------------------- | ----------------------------------------------- |
| SvelteKit主要UI、mock/view model                         | URL crawlからsnapshotまでの業務pipeline         |
| Production buildとfrontend quality gate                  | Railsの13 business operations                   |
| Supabase SSR cookie認証、secure route guard              | Project/AnalysisJob/Snapshot/Artifact DB        |
| Rails API-only、JWT、Organization membership、5 read API | Python worker、Queue、Object Storage            |
| OpenAPI 18 operations、job state設計                     | Staging、本番cloud、monitoring、backup          |
| B-1〜B-3Hのcomponent/hero/runtime整理                    | Component E2E/visual regression、responsive完了 |

**結論:** Auth/Organizationと品質のfoundationはある。Business MVPはUI/契約段階で、production-readyではない。

## Verified baseline

- Current reusable Svelte components: **119**（components 104 + features 15）
- Explicit deletions: **18**
- Legacy unreachable candidates: 25件を全件判定、残るknown DEFER subgraphは **2 components**
- Frontend: **108 tests / 11 files**, ESLint **0 errors / 60 warnings**, quality PASS
- OpenAPI: **18 operations / 18 unique IDs**
- Rails implemented: **5 identity/org read operations**
- Python worker implementation: **0 files**
- Contract mismatch: Svelte `organization_owner` / Rails `owner`

## Maximum three-month sequence — not a delivery commitment

| Period | Focus                                                     | Confidence |
| ------ | --------------------------------------------------------- | ---------- |
| Aug H2 | MVP boundary、owner、role語彙、vertical slice acceptance  | HIGH       |
| Sep H1 | Active graph、shell/large component、visual baseline      | HIGH       |
| Sep H2 | UI field semantics、token/responsive、test pilot、API gap | MEDIUM     |
| Oct H1 | Rails Project/AnalysisJob、org policy、outbox             | MEDIUM     |
| Oct H2 | Queue/Python worker/artifactの1 URL slice                 | LOW        |
| Nov H1 | Staging 1-loop、observability、cloud decision evidence    | LOW        |

## Decide in the meeting

1. MVPを「1回の保存可能なanalysis loop」に限定するか。
2. 3か月を棚卸しとvertical slice検証のtimeboxとして扱うか。
3. SvelteKit BFF / Rails / Python Workerの責務分離を維持するか。
4. 最小sliceを1 Org / 1 Project / 1 URL / 1 Job / 1 Snapshotにするか。
5. Token/visual baseline前にTailwind全面移行を始めないか。
6. Staging success criteriaは何か。
7. Owner、工数、同時進行数、次回review日は何か。

## Do not decide yet

AWS/Azure最終採用、Kubernetes、instance size、5年TCO、Queue/Storage/LLMの永久固定、Tailwind全移行日、worker concurrency、retention最終値。まずworkloadを計測する。

## Top risks

- **Critical:** Business pipeline未実装のため、現在のUIだけでは顧客価値を提供できない。
- **High:** UI fixtureとdomain semanticsの差がAPI/DBの作り直しを生む。
- **High:** Workload/artifact量不明でcloud costとsecurityを評価できない。
- **High:** Role語彙差がwrite authorizationの不具合を生み得る。
- **High:** Team capacity/owner未確定で日程confidenceが上がらない。

## Meeting output expected

- Accepted MVP boundary and one vertical-slice scenario
- Named workstream owners and available capacity
- Gate-based sequence and review dates
- Explicit deferred list
- No premature cloud or full Tailwind commitment

## References

- [Detailed Current State](./2026-08-17-mtg-panoptes-current-state.md)
- [Three-month Inventory Roadmap](./2026-08-17-three-month-inventory-roadmap.md)
- [Development Log](../DEVELOPMENT_LOG.md)
