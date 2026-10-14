# Self Analysis Overview Panel Responsibility Analysis

## Conclusion

`src/lib/components/ComponentsBase/Self/overview/SelfAnalysisOverviewPanel.svelte` is `ACTIVE_CANONICAL`. It is production-reachable from `/app` and `/app/analysis`, receives an already-normalized `SelfAnalysisViewModel`, and owns no server/business/orchestration state or side effects. The selected decision is `SPLIT_VIEW_AND_MAPPING`: keep the Panel as the public composition boundary, extract Summary and Evidence views, and make Self-specific axis, delta, priority, and improvement-candidate naming explicit in the existing Self data home.

## Reachability and B-2 canonical status

| Item | Finding |
| --- | --- |
| Real path | `src/lib/components/ComponentsBase/Self/overview/SelfAnalysisOverviewPanel.svelte` |
| Production routes | `/app`, `/app/analysis` |
| Production path | route -> `PanoptesShellPage` -> Snapshot surface -> `PanoptesSelfTab` -> `SelfAnalysisTab` -> Overview Panel |
| Direct parent | `SelfAnalysisTab.svelte` |
| Child before B-3N | `SelfAnalysisDualRingGauge.svelte` |
| Sibling surfaces | Comparison/6-axis panel, evaluation cards, improvement-candidate grid |
| Dev-only reachability | dev/dummy shell reaches the same canonical Self components; no separate Overview implementation |
| Tests before B-3N | Snapshot view-model regression only |
| Duplicate/wrapper | none found; B-2 removed three legacy Self Snapshot components |
| Classification | `ACTIVE_CANONICAL` |

B-2's canonical boundary remains:

```text
Self = current observation + gap + improvement candidates
Strategy = approved/formalized proposals and roadmap decisions
```

The runtime Self view model consumes only `self.actionCards` for improvement candidates. No Strategy plan, selected Strategy, approval, or Roadmap payload enters the Self UI. The dummy fixture currently constructs `dummySnapshot.self.actionCards` from a Strategy-named seed collection; that is fixture coupling, not a production render dependency, and is recorded as debt rather than changed in this UI phase.

## Before line breakdown

| Total | Script | Markup | Style | Comments |
| ---: | ---: | ---: | ---: | ---: |
| 307 | 6 | 87 | 214 | 0 |

## Responsibility inventory

| Responsibility | Location before split | Kind | Risk | Action |
| --- | --- | --- | --- | --- |
| Self summary/service identity | Overview Panel | UI | low | move to Summary view |
| Overall/internal/visual score | Overview Panel + Gauge | UI | broad score/CSS concentration | move to Summary; keep Gauge child |
| Common six-axis comparison | Comparison sibling/view model | mapping/UI | can be mistaken as Overview-owned or globally canonical | keep sibling; document Self definition |
| Strengths/current positives | Overview Panel | observation UI | low | move to Evidence view |
| Weaknesses/issues | Overview Panel | observation UI | may be mistaken for approved work | move to Evidence view |
| Gaps/industry deltas | Overview Panel + view model | observed gap/mapping | sign formatting embedded in markup | move formatting to pure mapping, render in Summary |
| Improvement candidates | sibling grid + view model | Self candidate UI/mapping | Strategy-named property/components obscure B-2 boundary | rename view-model contract; retain component files pending taxonomy phase |
| `self.actionCards` | view model | domain source | risk of accidental Strategy source re-entry | preserve as sole source |
| Breakdown/current state | Overview Panel | observation UI | low | move to Evidence view |
| AI summary | Overview Panel | observation summary UI | label could be treated as proposal | keep with Evidence, not Strategy |
| Metadata/status/badges | Overview Panel | view data/UI | tone and sign mapping split | map display value once |
| Fallback/empty state | view model | mapping | empty lists must remain renderable | preserve; test malformed/empty cases |
| Responsive/styling | Overview Panel | UI/CSS | 214 lines and ineffective flex breakpoint rules | colocate unchanged CSS; defer redesign |
| Accessibility | Overview/Comparison | UI | scores and chart context need explicit names | add score labels, SVG title, keyed lists |

## Props

| Prop | Type | Required/default | Source | Purpose | Decision |
| --- | --- | --- | --- | --- | --- |
| `viewModel` | `SelfAnalysisViewModel` | required, no default | `SelfAnalysisTab` | normalized current-state display data | keep unchanged on canonical Panel |

The prop is view data rather than raw API/domain data. The Panel has no callbacks or duplicated props. New internal Summary/Evidence views receive the same normalized model to avoid a wide mechanical prop fan-out.

## State and side effects

The Panel has no `$state`, `$derived`, `$effect`, mutable local state, selected/expanded/tab state, filtered state, server state, business state, or orchestration state. It has no fetch, API client, store mutation, timer, browser global, storage, navigation, callback, dispatch, clipboard, or observer usage.

All values are immutable render inputs. Score and gap derivation belongs to the pure view-model/mapping boundary.

## Data flow

```text
Analysis Snapshot payload.self
  -> PanoptesSelfTab
  -> createSelfAnalysisViewModel
       -> observation/current-state fields
       -> observed gap/benchmark fields
       -> self.actionCards -> improvementCandidateCards
  -> SelfAnalysisTab
       -> SelfAnalysisOverviewPanel
            -> Overview Summary
            -> Overview Evidence
       -> Comparison / 6 axes
       -> Improvement Candidate grid
```

The Overview does not directly process raw Snapshot data.

## Self / Strategy boundary

| Concept | Current source | UI ownership | Strategy implication |
| --- | --- | --- | --- |
| Observation | strengths, issues, breakdown, AI summary | Overview Evidence | none |
| Gap | axis delta, gap badge, or radar self-industry difference | Overview Summary / Comparison | none |
| Improvement Candidate | `self.actionCards` | Self candidate grid | candidate only; no approval/selection |
| Strategy Proposal | Strategy payload/view model | Strategy tab only | not present in Self view model |

The misleading internal view-model name `strategyRecommendationCards` was replaced by `improvementCandidateCards`, and the malformed-title fallback changed from `戦略カード` to `改善候補`. Valid Product copy and data are unchanged. The two legacy-named component filenames remain a directory/taxonomy debt; renaming them without a broader compatibility decision is deferred.

## `self.actionCards` audit

- Source: `PanoptesSelfData.actionCards` only.
- Mapping: first three entries become `SelfAnalysisImprovementCandidateCardData`.
- Ordering/priority: source order; labels are `1..3. 優先候補`. There is no independent priority field or sort formula.
- Title/description/action: title, rationale, and bullets map directly with display fallbacks.
- Evidence: current strengths provide observation context; impact maps to the impact label.
- Empty state: empty `actionCards` produces an empty candidate array; no Strategy item is synthesized.
- Strategy/Roadmap dependency: none in production view-model input or output.
- Fixture note: dummy Self action cards are populated from a Strategy-named seed object; separate Self fixture ownership is deferred.

## Common six-axis comparison

The Overview itself shows delta badges. The sibling `SelfAnalysisComparisonPanel` renders metric bars and the six-axis radar. B-3N made the Self definition explicit but did not create a Self/Competitor shared component.

| Axis concept | Self label | Competitor label | Self order | Competitor order | Shared concept | Product decision |
| --- | --- | --- | ---: | ---: | --- | --- |
| Value proposition | 価値訴求 | 価値訴求 | 1 | 1 | yes | canonical naming/order pending |
| Funnel strength | 導線強度 | 導線強度 | 2 | 2 | yes | canonical naming/order pending |
| Differentiation | 差別化明確性 | 差別化 | 3 | 3 | yes | choose long/short label |
| Information hierarchy | 情報階層 | 情報階層 | 4 | 4 | yes | canonical order pending |
| Trust | 信頼構造 | 信頼構造 | 5 | 5 | yes | canonical naming pending |
| Decision support | 意思決定支援 | 意思決定 | 6 | 6 | yes | choose long/short label |

Both existing implementations use the same actual concept order, but that order differs from the order listed as the aspirational Panoptes common definition in the phase instruction. B-3N does not silently reorder either Product surface. Cross-feature terminology, order, formula, component, and token unification are `DEFER / Product Decision Required`.

## Score, metric, and gap mapping

- Overall, structure, visual, radar self, radar industry, and breakdown scores remain clamped to 0–100.
- Non-finite malformed numeric input now maps to the lower bound rather than propagating `NaN` into CSS/text.
- Industry benchmark remains the rounded mean of metric-row industry scores, with the existing empty fallback of 68.
- Gap precedence remains: augmented `axisDeltaScores`, then parseable `gapBadges`, then derived `radar.self - radar.industry`.
- Positive/zero/negative sign display is now pure `formatSelfAnalysisDeltaValue`; tone still follows numeric sign.
- No score formula, rounding policy, benchmark meaning, or tone/color value changed.

Gap is an observed Self-versus-industry difference. It is not a recommendation and does not automatically generate a Strategy proposal.

## Rendering, style, responsive, and accessibility

- Canonical Panel now composes one Summary view and one Evidence view; no small primitive component set was introduced.
- Improvement candidates remain a sibling surface owned by `SelfAnalysisTab`, not incorrectly moved into Overview.
- Hard-coded orange/violet/neutral colors, spacing, typography, radius, shadow, borders, flex proportions, and 1220/1240px breakpoints remain.
- Existing breakpoint rules apply `grid-template-columns` to several flex containers, so they do not guarantee stacking. Candidate grids also remain flex-based. This may cause Tablet/Mobile overflow and requires a visual baseline before repair.
- Long text is not truncated by mapping. Several blocks rely on flex sizing and natural wrapping without explicit `overflow-wrap`; browser verification is required before responsive changes.
- The Overview has no interactive controls, so button/focus/expanded/pressed semantics do not apply.
- Semantic section/article/header/heading/list elements remain. Score cards now have explicit accessible labels; the comparison SVG has a `<title>` and existing `aria-label`; collection loops touched by B-3N are keyed.
- Delta state is not color-only because a signed numeric value is rendered. Scores remain visible as numbers as well as gauge/color presentation.

## Split decision

`SPLIT_VIEW_AND_MAPPING`.

The 307-line production component mixed two cohesive visual surfaces and 214 lines of CSS. The split makes the canonical Panel a 26-line composition boundary, moves summary/score/gap and observation/breakdown/AI rendering into two meaningful children, and centralizes Self-specific presentation constants/formatters. `SPLIT_STATE` is rejected because there is no state. `MERGE`/`DELETE` are rejected because the component is canonical and has no duplicate.

## Deferred

- Product-owned common six-axis terminology, order, descriptions, formula, and shared visual contract.
- Self/Competitor shared axes/score components; explicitly prohibited in B-3N.
- Rename/move legacy `SelfAnalysisStrategyRecommendation*` component files after compatibility and directory-policy review.
- Decouple dummy `self.actionCards` from the Strategy-named fixture seed.
- Explicit Product priority/evidence schema for improvement candidates.
- Responsive stacking/overflow fixes, visual tokens, Tailwind, and directory-wide taxonomy.
- Authenticated Browser E2E and visual regression for normal/empty/long/low/high states.
- Rails/BFF/OpenAPI/AnalysisJob/Organization/Auth and deferred Strategy Plan Rail/Card work.
