# Panoptes Formula Specification v2.1 Precision Hardened

## 0. Why This Version Exists

This version exists because Panoptes should not treat formula quality as a later-stage polish item.

For Panoptes, score quality is product trust.
That means even MVP-stage displayed values such as:

- overall score
- internal score
- visual score
- benchmark gap
- confidence
- opportunity
- priority
- market pressure
- improvement slack
- risk labels

must already be designed to a level that would still be acceptable in a completed product.

This document upgrades v2 by hardening the formula system for:

- stronger statistical robustness
- more realistic benchmark handling
- better confidence quality
- more trustworthy UI-facing metrics
- reduced sensitivity to outliers and noisy competitors
- stronger compatibility with monitoring and feed systems

This document should be treated as the preferred precision-oriented formula layer for Panoptes.

---

## 1. Precision Design Philosophy

### 1.1 MVP numbers must be production-trustworthy
MVP may have fewer features.
But the numbers it shows should already be good enough that they do not feel like “temporary prototype metrics.”

### 1.2 Wrong confidence is worse than no confidence
Confidence values must be conservative and evidence-linked.
Panoptes should avoid inflated confidence percentages.

### 1.3 Benchmark quality matters more than isolated scoring quality
Many Panoptes numbers are comparative.
So benchmark construction is as important as scoring itself.

### 1.4 Robust statistics over naive averages
Where competitor sets may contain outliers, Panoptes should prefer robust statistics over naive means.

### 1.5 Precision must remain explainable
Even when formulas become more sophisticated, Panoptes must still be able to explain the score chain in plain language.

---

## 2. What Changes from v2

v2.1 hardens the system in five major ways.

1. benchmark aggregation is upgraded from naive mean-first logic to robust benchmark logic
2. competitor weighting is introduced
3. confidence calculation is expanded and made more conservative
4. market-type-specific weight profiles are introduced
5. UI-facing values become explicitly derived from hardened score families rather than loose directional numbers

---

## 3. Robust Benchmark Model

## 3.1 Problem
A simple arithmetic mean can be distorted when competitor sets include:

- very weak fringe sites
- unusually polished aspirational sites
- structurally mismatched sites
- crawl-quality-noisy sites

For Panoptes, this would make benchmark deltas unstable and reduce user trust.

## 3.2 Canonical benchmark rule
Panoptes should no longer treat the arithmetic mean as the default benchmark center.

The canonical benchmark center should be:

`robust_center = 0.50 * median + 0.30 * trimmed_mean_20 + 0.20 * weighted_mean`

Where:
- `median` = median across competitor set
- `trimmed_mean_20` = mean after removing top 20% and bottom 20% extremes when set size allows
- `weighted_mean` = competitor-weighted mean using relevance weights

This hybrid center reduces outlier distortion while still reflecting the competitive field.

## 3.3 Small-set fallback
If competitor count is too small for trimming:

- 8 competitors or more -> full robust center
- 5 to 7 competitors -> median + weighted mean blend
- below 5 competitors -> weighted mean only, with confidence penalty

Fallback formulas:

### 5 to 7 competitors
`robust_center_small = 0.65 * median + 0.35 * weighted_mean`

### below 5 competitors
`robust_center_tiny = weighted_mean`

But benchmark confidence must then be reduced.

## 3.4 Robust spread
Instead of standard deviation alone, benchmark spread should use:

`robust_spread = 0.60 * IQR_scaled + 0.40 * std_capped`

Where:
- `IQR_scaled = IQR / 1.349` for normal-equivalent scale intuition
- `std_capped` = standard deviation capped against outlier blow-up

This gives more stable spread estimates for confidence and pressure logic.

---

## 4. Competitor Weighting Model

## 4.1 Why weighting is required
Not all competitors should influence benchmark equally.
Panoptes should distinguish:

- direct competitors
- adjacent competitors
- aspirational competitors
- structurally weak fringe competitors

## 4.2 Competitor relevance weight
Each competitor gets a relevance weight from 0.30 to 1.00.

Formula:

`competitor_relevance = 0.35 * type_similarity + 0.25 * audience_similarity + 0.20 * offer_similarity + 0.20 * funnel_similarity`

Then clamp to:

`relevance_weight = clamp(competitor_relevance, 0.30, 1.00)`

## 4.3 Weight classes
For implementation simplicity, Panoptes may also bucket weights:

- direct competitor = 1.00
- close adjacent competitor = 0.80
- aspirational / top-tier comparator = 0.65
- fringe / low-match comparator = 0.40

This is especially useful in MVP if full continuous weighting is too expensive.

## 4.4 Weighted benchmark mean
For any score family:

`weighted_mean = Σ(score_i * relevance_weight_i) / Σ(relevance_weight_i)`

This should be used in the robust center formula.

---

## 5. Market-Type Weight Profiles

## 5.1 Why global fixed weights are not enough
A strong formula system should recognize that different market structures punish different weaknesses.

Examples:
- urgent-response market -> funnel and trust matter more
- comparison-heavy SaaS market -> decision support and differentiation matter more
- brand-led premium market -> value proposition and trust presentation matter more

## 5.2 Canonical market-type profiles
Panoptes should define market-type weight presets.

### A. Comparison-heavy market
Axis weights:
- value proposition: 0.16
- information hierarchy: 0.15
- funnel strength: 0.19
- trust structure: 0.16
- differentiation clarity: 0.16
- decision support: 0.18

### B. Trust-heavy / reassurance-heavy market
Axis weights:
- value proposition: 0.15
- information hierarchy: 0.15
- funnel strength: 0.17
- trust structure: 0.22
- differentiation clarity: 0.13
- decision support: 0.18

### C. Brand-led market
Axis weights:
- value proposition: 0.21
- information hierarchy: 0.15
- funnel strength: 0.14
- trust structure: 0.18
- differentiation clarity: 0.18
- decision support: 0.14

### D. Urgent-intent market
Axis weights:
- value proposition: 0.17
- information hierarchy: 0.14
- funnel strength: 0.22
- trust structure: 0.19
- differentiation clarity: 0.11
- decision support: 0.17

## 5.3 MVP rule
If market type is inferred confidently enough, use the corresponding weight profile.
Otherwise use default global profile and apply confidence moderation.

---

## 6. Confidence System Upgrade

## 6.1 Confidence should become multi-layered
Panoptes confidence should not be one loose percentage.
It should be built from multiple components.

### confidence families
1. observation confidence
2. competitor-set confidence
3. inference confidence
4. strategic confidence

## 6.2 Observation confidence
Measures whether the raw site evidence is sufficient and clean.

Components:
- crawl completeness
- page coverage quality
- parser success rate
- internal observation density
- visual observation quality

Formula:

`observation_confidence = 0.25 * crawl_completeness + 0.20 * page_coverage + 0.20 * parser_success + 0.15 * internal_density + 0.20 * visual_quality`

## 6.3 Competitor-set confidence
Measures whether the competitor group is coherent enough to benchmark against.

Components:
- competitor count sufficiency
- relevance-weight density
- structural cohesion
- variance controllability

Formula:

`competitor_set_confidence = 0.25 * count_sufficiency + 0.30 * relevance_density + 0.25 * structural_cohesion + 0.20 * variance_control`

## 6.4 Inference confidence
Used for market type / structure type / site scale inference.

Components:
- bootstrap signal agreement
- Internal vs Visual agreement
- page-pattern consistency
- benchmark alignment

Formula:

`inference_confidence = 0.30 * signal_agreement + 0.25 * internal_visual_agreement + 0.20 * pattern_consistency + 0.25 * benchmark_alignment`

## 6.5 Strategic confidence
Measures how strongly Panoptes can support its strategic recommendation.

Components:
- opportunity evidence strength
- priority stability
- theme clustering confidence
- benchmark confidence

Formula:

`strategic_confidence = 0.30 * evidence_strength + 0.25 * priority_stability + 0.20 * theme_cluster_confidence + 0.25 * benchmark_confidence`

## 6.6 UI confidence output
User-visible confidence should be conservative:

`ui_confidence = round(100 * min(inference_confidence, competitor_set_confidence, strategic_confidence * 0.95 + observation_confidence * 0.05))`

This prevents a single inflated component from making confidence look artificially high.

## 6.7 Confidence label thresholds
- 88 to 100 = high
- 72 to 87 = medium
- below 72 = low

These thresholds are intentionally stricter than v2.

---

## 7. Agreement Logic Upgrade

## 7.1 Internal / Visual agreement
Agreement should not be binary or cosmetic.

For each axis:

`axis_agreement = 1 - min(abs(internal_axis - visual_axis) / 35, 1)`

This measures whether both layers are telling a similar story.

## 7.2 Global agreement

`global_agreement = weighted_mean(axis_agreement_i using axis weights)`

This value feeds confidence and strategy explanation quality.

---

## 8. Layer Fusion Upgrade

## 8.1 Default layer fusion
Default remains slightly Internal-first, but now confidence-aware.

`overall_score_raw = internal_weight * internal_score + visual_weight * visual_score`

Base weights:
- internal_weight = 0.55
- visual_weight = 0.45

## 8.2 Confidence-aware layer fusion
If Visual confidence is substantially lower than Internal confidence, reduce Visual contribution slightly.

`visual_adjustment = clamp((visual_confidence - internal_confidence) * 0.10, -0.05, 0.05)`

`internal_weight_adj = 0.55 - visual_adjustment`
`visual_weight_adj = 0.45 + visual_adjustment`

Then normalize if needed.

This keeps late fusion robust when one layer is noisy.

---

## 9. Opportunity Formula Upgrade

## 9.1 Opportunity should include not only gap, but exploitability
Upgrade opportunity formula to:

`opportunity = 100 * (0.30 * gap_component + 0.20 * leverage_component + 0.15 * confidence_component + 0.15 * competitor_pressure_component + 0.10 * exploitability_component + 0.10 * readiness_component)`

Where:
- `gap_component` = benchmark-relative weakness magnitude
- `leverage_component` = how much strategic movement this axis typically creates
- `confidence_component` = evidence quality and benchmark quality
- `competitor_pressure_component` = top-of-market punishment level
- `exploitability_component` = whether the weakness is fixable with specific actions
- `readiness_component` = whether prerequisites are already partly in place

This is stronger than v2 because it separates “bad score” from “good target to attack.”

---

## 10. Priority Formula Upgrade

Priority should become more implementation-realistic.

`priority = 100 * (0.35 * opportunity_norm + 0.20 * impact_norm + 0.15 * urgency_norm + 0.15 * confidence_norm + 0.15 * execution_readiness_norm)`

Rationale:
- opportunity alone is not enough
- if confidence is low, priority should not inflate
- if execution readiness is too low, roadmap placement should shift later

---

## 11. Strategic Fit Upgrade

Strategic Fit should explicitly compare selected strategy vs actual top strategic need.

`strategic_fit = 100 * (0.35 * top_priority_alignment + 0.25 * weak_axis_relevance + 0.15 * market_pressure_match + 0.15 * dependency_match + 0.10 * confidence_match)`

This makes “戦略適合指数” more trustworthy and less cosmetic.

---

## 12. Improvement Slack Upgrade

## 12.1 Problem
Improvement slack can feel fake if it is just a loose percentage.

## 12.2 Hardened formula
Use:

`slack = 100 * mean(top_3_theme_lift_potential)`

Where each theme lift potential is:

`theme_lift_potential = gap_norm * leverage * confidence * readiness * non_saturation * market_room`

Where:
- `gap_norm` = normalized benchmark gap
- `leverage` = strategic leverage weight
- `confidence` = strategic confidence
- `readiness` = execution readiness
- `non_saturation` = 1 - saturation_penalty
- `market_room` = 1 - benchmark_competition_density_penalty

This makes improvement slack a controlled directional estimate rather than decorative optimism.

---

## 13. Market Pressure Upgrade

Market pressure should reflect not just average quality but how punishing the market is structurally.

`market_pressure = 0.25 * benchmark_concentration + 0.20 * top_quartile_gap_severity + 0.20 * convergence_pressure + 0.20 * decision_stage_competition + 0.15 * trust_funnel_intensity`

Labels:
- 0.00 to 0.32 = Low
- 0.33 to 0.62 = Medium
- 0.63 to 1.00 = High

This is more nuanced than a simple variance-based label.

---

## 14. Risk Flags Upgrade

Risk labels should be generated from explicit families.

For each risk family:
- comparison-route deficiency
- trust deficiency
- differentiation ambiguity
- hierarchy disorder
- CTA fragmentation
- credibility proof insufficiency

Use:

`risk_score = 100 * (0.40 * severity + 0.20 * breadth + 0.20 * urgency + 0.20 * benchmark_exposure)`

Where:
- `severity` = magnitude of weakness
- `breadth` = how many pages/components are affected
- `urgency` = whether this weakness blocks decision progress
- `benchmark_exposure` = how far below benchmark the site is in this area

Label bands:
- 78 to 100 = high
- 52 to 77 = medium
- below 52 = low

---

## 15. Benchmark Delta Upgrade

Delta labels shown to users should not rely on raw point differences alone.

Use:

`normalized_delta = (self_score - robust_center) / max(robust_spread, spread_floor)`

User-facing point delta can still be shown, but interpretation labels should be driven by normalized delta.

### Interpretation labels
- normalized_delta >= 0.80 -> meaningfully above benchmark
- 0.25 to 0.79 -> moderately above benchmark
- -0.24 to 0.24 -> near benchmark
- -0.79 to -0.25 -> moderately below benchmark
- <= -0.80 -> meaningfully below benchmark

This gives more trustworthy interpretation than raw point cutoffs alone.

---

## 16. Position Map Upgrade

Position maps should also use robust-relative placement.

### X-axis
Structural maturity index

`structural_maturity = 0.28 * hierarchy + 0.28 * funnel + 0.22 * trust + 0.22 * decision_support`

### Y-axis
Differentiation strength index

`differentiation_strength = 0.60 * differentiation_clarity + 0.40 * value_proposition`

### Zone assignment
Use robust benchmark quartiles, not absolute fixed cuts only.

This allows the same market map to behave sensibly across industries.

---

## 17. Monitoring / Feed Precision Upgrade

If Panoptes is to become a strategy database and monitoring platform, event quality must also be hardened.

## 17.1 Event severity

`event_severity = 100 * (0.30 * surface_area + 0.25 * semantic_shift + 0.20 * strategic_area_importance + 0.15 * visibility + 0.10 * recurrence_novelty)`

## 17.2 Event importance

`event_importance = 100 * (0.35 * severity_norm + 0.25 * strategic_impact_estimate + 0.15 * competitor_relevance + 0.15 * recurrence_pattern + 0.10 * benchmark_context)`

This makes feed events consistent with the scoring vocabulary instead of feeling like a separate ad-hoc system.

---

## 18. MVP Minimum Precision Requirement

For MVP, the following must already use hardened formulas rather than lightweight placeholders:

- six axis scores
- internal score
- visual score
- overall score
- benchmark center
- benchmark delta
- confidence
- opportunity
- priority
- risk labels
- strategy card source ranking

These are trust-facing metrics and should not be approximate in a weak sense.

## 18.1 Can still be slightly simplified in MVP if architecture is preserved
- strategic fit index
n- improvement slack
- market pressure
- monitoring event importance

But even these should use real formulas, not fake constants.

---

## 19. Implementation Recommendation

For MVP implementation, the recommended approach is:

### phase 1
Implement hardened benchmark and confidence first.
Because benchmark trust and confidence trust affect almost every displayed number.

### phase 2
Implement opportunity / priority / risk on top of the hardened score base.

### phase 3
Implement strategic fit, improvement slack, and market pressure using the same base vocabulary.

This allows Panoptes MVP to show numbers that already feel “finished.”

---

## 20. Final Position

If Panoptes wants MVP trust to feel completion-grade, then formulas cannot be treated as provisional decoration.

v2.1 defines a precision-hardened scoring model where:

- averages are robust, not naive
- competitor groups are weighted, not flat
- confidence is conservative and multi-layered
- market types can change weighting behavior
- benchmark comparisons are normalized, not only point-based
- UI-facing metrics derive from real strategy logic

This is the level at which Panoptes can show MVP data with confidence while remaining compatible with the completed-product vision.

