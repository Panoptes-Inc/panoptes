# Competitor Company Card Responsibility and Duplication Analysis

## Conclusion

`src/lib/components/ComponentsBase/Competitor/cards/CompetitorAnalysisCompanyCard.svelte` is `ACTIVE_CANONICAL`. It is the canonical compact summary card in the production Competitor grid and is not a wrapper or duplicate of the Expanded Card. The Component decision is `SPLIT_MAPPING`: retain the cohesive Identity/Score/Metrics/Controls view, move deterministic score/action presentation into the B-3M mapping home, and avoid small child-component proliferation.

The Company and Expanded Cards consume the same canonical view model and overall/internal/visual metrics, but their score-ring formulas are not identical: Company preserves a 24-degree violet accent and Expanded preserves 30 degrees. This is classified as `SAME_VISUAL_DIFFERENT_FORMULA`; the Product metric is the same `overallScore`, but the reason for the formula difference is unknown. Shared clamp/gradient construction is safe; public formula unification is `DEFER / Product Decision Required`.

## Reachability

| Item | Finding |
| --- | --- |
| Real path | `src/lib/components/ComponentsBase/Competitor/cards/CompetitorAnalysisCompanyCard.svelte` |
| Production routes | `/app`, `/app/analysis` |
| Production path | route -> Panoptes Shell -> Snapshot -> Competitor Tab -> Card Grid -> Company Card |
| Direct parent | `CompetitorAnalysisCardGrid.svelte` |
| Children | none |
| Dev-only path | dev/dummy shell reaches the same canonical grid; no alternate Company Card |
| Tests before B-3O | indirect Snapshot/view-model tests only |
| Wrapper/duplicate | none; Expanded Card is a different detail surface |
| Compare view relation | Company initiates compare; selected competitors move to Expanded Cards in Compare Stage |
| Classification | `ACTIVE_CANONICAL` |

## Before line breakdown

| Total | Script | Markup | Style | Comments |
| ---: | ---: | ---: | ---: | ---: |
| 261 | 23 | 39 | 199 | 0 |

## Responsibility inventory

| Responsibility | Location before B-3O | Kind | Risk | Action |
| --- | --- | --- | --- | --- |
| Company/service identity | Company Card | UI/view data | long values rely on visual clamp | keep; semantic heading |
| Logo/favicon | absent | none | no domain field/requirement | do not invent |
| URL/domain | absent from Company; URL in view model/Expanded | none | accidental duplicate navigation | keep absent |
| Overall score | Company Card | UI | same Product metric as Expanded | keep |
| Score ring | inline `$derived` formula | Derived View State | duplicates algorithm but differs by 6 degrees | move to named Company helper; preserve formula |
| Internal/visual score bars | Company Card | UI/formatting | duplicate percentage/clamp behavior | share percentage helper |
| Axis metrics | absent | none | summary could be confused with detail | keep in Expanded radar only |
| Selected state | prop/class | UI state presentation | may be mistaken as Card-owned state | keep parent-owned prop; add `aria-pressed` |
| Compared state | prop/class/label | UI state presentation | currently unreachable in visible production grid after parent filtering | retain contract; document parent alignment debt |
| Compare limit/replace-oldest | Competitor Tab | business/UI orchestration | moving into Card would duplicate policy | keep in parent |
| Metadata | market type/position summary | UI/view data | low | keep |
| Badges | absent | none | Expanded-only metadata | keep absent |
| Callbacks | inline detail/compare callbacks | UI-local | low | preserve exact competitor ID dispatch |
| Fallback | canonical view model | mapping | low | reuse existing company/service/score fallback |
| Responsive/style | Card + parent grid | UI/CSS | fixed width and duplicated visual CSS | keep values; record debt/tokens |
| Accessibility | Card | UI | no heading/pressed/score accessible name | add semantic heading, score name, pressed state |

## Props

| Prop | Type | Required/default | Source | Purpose | Decision |
| --- | --- | --- | --- | --- | --- |
| `card` | `CompetitorAnalysisCardViewModel` | required | Card Grid | normalized identity/score/metadata | keep |
| `selected` | `boolean` | optional, `false` | parent detail selection | selected presentation | keep; `aria-pressed` on detail control |
| `compared` | `boolean` | optional, `false` | parent compared IDs | compare label/presentation | keep; parent owns value |
| `compact` | `boolean` | optional, `false` | compare-mode Card Grid | denser summary presentation | keep |
| `onOpenDetail` | `(competitorId: string) => void` | optional, no-op | Competitor Tab via Grid | detail intent | keep |
| `onOpenCompare` | `(competitorId: string) => void` | optional, no-op | Competitor Tab via Grid | compare intent | keep |

No prop duplicates raw domain data: `card` is the canonical view model, while selection/compact props are parent-owned display state.

## State and side effects

- `$state`: none.
- `$effect`: none.
- Derived View State: score-ring CSS and action labels only.
- Local/Server/Business/Orchestration State: none.
- Selected/compared/compact: immutable props from the parent.
- Side effects: two `UI_LOCAL` callbacks. No fetch, API, store mutation, timer, browser API, navigation, external link, dispatch, or observer.

## Data flow and compare ownership

```text
Competitor Snapshot
  -> createCompetitorAnalysisViewModel
  -> CompetitorAnalysisTab
       -> visible/selected/compared derivation
       -> CompetitorAnalysisCardGrid
            -> CompetitorAnalysisCompanyCard
                 -> summary score + detail/compare intents
       -> Expanded Card / Compare Stage
```

`CompetitorAnalysisTab` owns `detailCompetitorId`, `comparedCompetitorIds`, maximum two entries, and replacement of the oldest entry. The Company Card is presentation plus UI callback only. Because the parent removes compared cards from `visibleCards`, `compared=true` and its Company-card visual/label are not currently reachable in the production grid; compare removal occurs from the Expanded Card in Compare Stage. The public prop is retained until Product/parent-flow intent is confirmed.

## Company versus Expanded comparison

| Concern | Company Card | Expanded Card | Same semantics? | Same formula? | Shared candidate? |
| --- | --- | --- | --- | --- | --- |
| Company identity | company + service, clamped summary | company + service heading | yes | n/a | view-model data only; views separate |
| URL | not rendered | safe external link | no | n/a | no |
| Overall score | `overallScore` | `overallScore` | yes | value yes | yes, mapping input |
| Score ring | compact 72/54px conic ring, +24° accent | 126px conic ring, +30° accent | same metric | no | private construction/clamp only |
| Score bars | structure/visual percentage | structure/visual percentage | yes | yes | percentage helper |
| Axis metrics | absent | six-axis radar | no | n/a | no |
| Tone/color | orange/violet/neutral | orange/violet/neutral | visually related | token values mostly same | Design Token candidate, not shared view |
| Compare state | initiates compare; prop currently filtered out when active | active compare remove/select actions | related, different surface role | label same | compare-label helper only |
| External link | absent | HTTP(S) link | no | n/a | no |
| Fallback | canonical view model | canonical view model | yes | yes | reuse mapping |

## Score-ring formula audit

Both rings use CSS `conic-gradient`; there is no SVG geometry, `dasharray`, `dashoffset`, rotation, or rounding step.

| Attribute | Company | Expanded |
| --- | --- | --- |
| Input | `card.overallScore` | `card.overallScore` |
| Range/fallback | clamp 0–100; non-finite -> 0 | clamp 0–100; non-finite -> 0 |
| Main angle | `score * 3.6` | `score * 3.6` |
| Violet accent | score angle to `+24°` | score angle to `+30°` |
| Remaining tone | neutral through 360° | neutral through 360° |
| Meaning | compact overall score | expanded overall score |
| Classification | `SAME_VISUAL_DIFFERENT_FORMULA` | `SAME_VISUAL_DIFFERENT_FORMULA` |

No source explains the 24/30-degree difference. B-3O extracts a shared private gradient constructor and retains two explicit public helpers. The difference is regression-tested as legacy/current behavior preservation, not endorsed as the final Product formula.

## Score bars and common axes

Both surfaces render `internalStructureScore` and `visualScore` as percentage widths using the same orange/violet gradients. Heights, layout, typography, and size differ, so only `formatCompetitorScorePercentage` is shared. Valid values render identically; low/high/non-finite values are display-safe.

Company Card does not show common axes, names, icons, or axis scores. Those remain detail responsibilities in Expanded Metrics/Radar. The B-3M Competitor axis labels and B-3N Self differences are unchanged. No global registry or shared axis component was added.

## B-3M mapping reuse decision

- Mapping module: `EXTEND`.
- Clamp/gradient construction: shared privately.
- Score percentage and compare label: `SHARE_PRESENTATION_HELPER`.
- Company/Expanded named ring helpers: `KEEP_SEPARATE` pending Product decision.
- Full Score view/component: `KEEP_SEPARATE`.
- Six-axis view: `KEEP_SEPARATE`.

The existing module remains a bounded Competitor presentation home; no second competing helper module was created.

## Render, style, responsive, and accessibility

- Identity, score, two metrics, and two controls form one cohesive compact Card; view splitting would create low-value primitives.
- Hard-coded orange/violet gradients, neutral track, surface, selected/compared shadows, radius, spacing, typography, 180px width, 72/54px ring sizes, and button sizes remain.
- Company and Expanded CSS duplicate palette, bar, ring-inner, and surface rules. This is visual/token duplication, not proof of identical Product semantics.
- Parent grid changes 5/4/3/2/1 columns at 1600/1280/900/560px. Card still declares `width: 180px`; mobile becomes one column but does not become full width.
- The same rule block declares `height: 240px` and later `height: 100%`, so the first declaration is overridden. Compact mode adds `min-height: 240px`.
- Long company/position text is visually clamped to two lines. URL/domain, badges, and axes do not render here. Narrow action controls may be dense at 180px.
- The root remains an `article`; identity is now an `h3`. Score ring has an accessible numeric name. Native buttons remain keyboard operable; detail and compare controls expose `aria-pressed`. Selected/compared visuals are not color-only because controls expose state and labels/numeric scores remain visible.

## Final decisions

Component: `SPLIT_MAPPING`.

Expanded reuse:

- `SHARE_PRESENTATION_HELPER` for clamp, gradient construction, bar width, and compare label.
- `KEEP_SEPARATE` for Card views, sizes, layouts, URL, axes, and interactions.
- `DEFER_PRODUCT_DECISION` for 24° versus 30° ring formula convergence.

## Design Token candidates

- competitor card surface, radius, shadow, spacing;
- overall/internal/visual score orange/violet/neutral tones;
- metric track/fill and ring-inner surface;
- selected detail and compared state rings/shadows;
- compact/expanded typography and control sizes;
- focus/pressed treatment and responsive card width.

## Deferred

- Product decision and rationale for the score-ring accent formula.
- Decide whether Company `compared` presentation should remain when compared cards are filtered from the grid.
- Visual regression for normal/selected/compared/compact/long/low/high/invalid states.
- Responsive width and duplicate height cleanup after a browser baseline.
- Competitor CSS/Design Token standardization; no Tailwind work in B-3O.
- Shared axes/score view components and global axis registry.
- Rails/BFF/OpenAPI/AnalysisJob/Organization/Auth and Strategy semantics.
