# Competitor Expanded Card Responsibility Analysis

## Conclusion

`src/lib/components/ComponentsBase/Competitor/detail/CompetitorAnalysisExpandedCard.svelte` is `ACTIVE_CANONICAL`. It is reachable from both `/app` and `/app/analysis` through the canonical Snapshot surface, has no duplicate or wrapper candidate, and owns the B-2 Competitor detail contract. The selected decision is `SPLIT_VIEW_AND_MAPPING`: retain the Card as the public composition boundary, extract two cohesive view surfaces, and move deterministic score/axis/URL presentation rules into the existing Competitor data home.

## Reachability and canonical status

| Item | Finding |
| --- | --- |
| Production routes | `/app`, `/app/analysis` |
| Production path | route -> `PanoptesShellPage` -> Snapshot surface -> `CompetitorAnalysisTab` -> direct detail card or `CompetitorAnalysisCompareStage` -> expanded card |
| Direct parents | `CompetitorAnalysisTab.svelte`, `CompetitorAnalysisCompareStage.svelte` |
| Child before split | `CompetitorAnalysisRadarChart.svelte` |
| Dev-only path | the dummy/dev shell reaches the same canonical Competitor components; it is not a separate implementation |
| Tests before B-3M | indirect view-model/Snapshot coverage; no component-specific test |
| Duplicate/wrapper | none found |
| B-2 relationship | this is the canonical target into which legacy Snapshot URL, insights, actions, detail toggle, safe link, and fallback behavior were consolidated |
| Classification | `ACTIVE_CANONICAL` |

The B-2 legacy Snapshot components remain deleted and were not recreated.

## Before line breakdown

| Total | Script | Markup | Style | Comments |
| ---: | ---: | ---: | ---: | ---: |
| 373 | 20 | 98 | 255 | 0 |

## Responsibility inventory

| Responsibility | Current location before split | Kind | Risk | Action |
| --- | --- | --- | --- | --- |
| Card shell and summary title | Expanded Card | UI | low | keep in canonical Card |
| URL display/link | Expanded Card + raw view-model mapping | UI/mapping/navigation | unsafe schemes could be rendered | normalize in mapping; keep conditional link in Card |
| Overall score ring | Expanded Card | mapping/UI | formula embedded in view | extract pure presentation mapping and Metrics view |
| Internal/visual scores | Expanded Card | UI | low | move as one cohesive Metrics view |
| Common six-axis radar data | view-model-local helper | mapping | labels/order/formulas hidden in a broad mapper | move to Competitor presentation mapping |
| Radar rendering | Radar Chart child | UI | low | keep; add stable loop keys |
| AI/detail summary | Expanded Card | UI | low | move with evidence content |
| Observed insights | Expanded Card | UI | may be confused with recommendation | move to named Evidence view; retain label and data |
| Recommended actions | Expanded Card | UI | may be confused with formal Strategy | keep as Snapshot recommendation, separate from Strategy |
| Detail surface composition | Expanded Card | UI | broad component ownership | keep composition in Card, delegate cohesive sections |
| Expanded/compared state | `CompetitorAnalysisTab` | Local UI State | moving it would duplicate parent control | keep in parent; Card receives `compared` and callbacks |
| Badges/status metadata | Expanded Card/view model | UI/view data | low | keep in Card; keyed render |
| Formatting/fallback | view model | mapping | low | preserve existing mapping and fallback strings |
| Empty collections | view model | mapping | empty UI would lose B-2 fallback | preserve fallback arrays |
| Accessibility | Expanded Card | UI | external-link context and selected meaning | retain native elements; add external link label/rel |
| Responsive/layout/style | Expanded Card | UI/CSS | 255 scoped CSS lines obscure view boundaries | colocate unchanged rules with extracted views |

## Props

| Prop | Type | Required/default | Source | Purpose | Decision |
| --- | --- | --- | --- | --- | --- |
| `card` | `CompetitorAnalysisCardViewModel` | required | `CompetitorAnalysisTab` / Compare Stage | canonical view data | keep unchanged |
| `compared` | `boolean` | optional, `false` | parent comparison state | switches existing action labels | keep unchanged |
| `onOpenDetail` | `(competitorId: string) => void` | optional, no-op | parent | detail select/close intent | keep unchanged |
| `onOpenCompare` | `(competitorId: string) => void` | optional, no-op | parent | compare add/remove intent | keep unchanged |

There is no duplicate prop. `compared` is derived by the parent from its selected competitor IDs; it is correctly passed as view state rather than inferred from domain data.

## State and side effects

The Card owned no `$state`, `$effect`, server state, business state, orchestration state, timer, observer, store mutation, fetch, API client, storage access, clipboard access, `window`, or `document`. Its only local derived view value was the score-ring gradient. Expanded/collapsed and comparison selection remain Local UI State in `CompetitorAnalysisTab`.

| Interaction/effect | Classification | Decision |
| --- | --- | --- |
| `onOpenDetail(id)` | UI-local callback | keep at Card boundary |
| `onOpenCompare(id)` | UI-local callback | keep at Card boundary |
| external HTTP(S) link | browser navigation | keep existing new-tab behavior behind normalized view data |

## Data flow

```text
Snapshot competitor payload
  -> createCompetitorAnalysisViewModel
  -> normalized CompetitorAnalysisCardViewModel
  -> CompetitorAnalysisTab / CompetitorAnalysisCompareStage
  -> CompetitorAnalysisExpandedCard
       -> CompetitorAnalysisExpandedMetrics
       -> CompetitorAnalysisEvidenceSections
```

Raw API/domain data is not consumed by the Card. Mapping remains between Snapshot data and the render surface.

## Common six axes and metric mapping

The pre-B-3M canonical UI used this exact label/order contract:

1. 価値訴求
2. 導線強度
3. 差別化
4. 情報階層
5. 信頼構造
6. 意思決定

The labels and score formulas were hard-coded in the Competitor view-model module. They are now explicit in `competitor-card-presentation.ts`; formulas, order, rounding behavior, colors, and 0–100 clamping are unchanged. This is a Competitor presentation definition, not a new application-wide Product contract. The longer terminology/order listed in the phase instruction differs from the established B-2 visual contract; reconciling those names is `DEFER / Product Decision Required`.

The overall ring uses the existing score-to-degree calculation and two accent segments. Internal structure and visual scores remain percentage-width bars. No Product formula, Snapshot semantics, or tone/color meaning changed.

## Insight/action boundary

- `insightLines` are observed Competitor Snapshot evidence.
- `actionLines` are recommended actions copied from the competitor snapshot's `actionBullets`.
- Neither is a formal Strategy proposal, approval decision, or Roadmap task.

The extracted Evidence view makes this display boundary clearer while preserving the existing labels and values.

## External URL boundary

The mapping now accepts only trimmed absolute `http:` or `https:` URLs without embedded username/password credentials. Empty, malformed, non-string, credential-bearing, and non-HTTP(S) inputs map to an empty string, causing the link not to render. The safe URL string is otherwise preserved. The link retains `target="_blank"`, now has `rel="noopener noreferrer"`, and has a competitor-specific `aria-label`. No new navigation behavior was introduced.

## Render, style, responsive, and accessibility findings

- Card shell/header/badges/footer stay together because they define the public card and callbacks.
- Score ring, metadata, bars, and radar form one Metrics surface.
- Summary, observed insights, and recommended actions form one Evidence surface; they were not fragmented into smaller components.
- Hard-coded color, spacing, type, radius, shadow, 430px card width, and 720px breakpoint remain. CSS was moved with its owning markup without value changes.
- Long names, metadata, summaries, insights, and actions use existing min-width/wrapping behavior. The external URL is represented by the fixed label `URLを開く`, so raw long URLs are not exposed in layout.
- At <=720px the card remains full-width; metrics and evidence columns retain their established single-column behavior. Tablet/Mobile policy was not redesigned.
- The Card uses `article`, `header`, `footer`, headings, sections, lists, native links, and native buttons. Compared state is conveyed in action text. `aria-expanded` is not appropriate on the mounted expanded card: the collapse/select control and visibility ownership are in the parent conditional render. Color-backed scores also include numeric labels.
- Collection loops touched in this phase are keyed. Duplicate user-provided strings remain renderable by using positional keys where no stable item ID exists.

## Split decision

`SPLIT_VIEW_AND_MAPPING`.

The Card remains the canonical public component and keeps its props. Two cohesive view children remove render/CSS responsibility concentration, while a pure mapping module centralizes existing axis, ring, and URL rules. `SPLIT_STATE` is rejected because the Card owns no business/server/orchestration state; `MERGE` and `DELETE` are rejected because there is no duplicate and the component is production-reachable.

## Deferred

- Product-owned canonical terminology/order for the application-wide six axes.
- Formal meaning/versioning of the current derived Competitor axis formulas.
- Shared score, color, spacing, typography, radius, shadow, and breakpoint tokens.
- Authenticated Browser E2E and visual regression at Desktop/Tablet/Mobile sizes.
- A Svelte component-rendering test harness; current coverage uses pure mapping, structural contract tests, route smoke, check, and build.
- Rails/BFF/OpenAPI/AnalysisJob/Organization/Auth and deferred Strategy Plan Rail/Card work.
