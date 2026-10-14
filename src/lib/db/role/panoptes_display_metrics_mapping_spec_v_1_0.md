# Panoptes Display Metrics Mapping Specification v1.0

## 0. Role of This Document

This document maps every important user-facing metric in Panoptes UI to the canonical formula system.

Its purpose is to make the following unambiguous:

- what each displayed number means
- which underlying formula family produces it
- what raw inputs it depends on
- whether it is MVP-required or completion-oriented
- how it should be labeled in UI
- what should and should not be shown as a hard number

This document should be read together with:

- Panoptes Formula Specification v2.1 Precision Hardened
- Panoptes Master Spec v3.4
- Panoptes MVP Spec Final Reviewed v1.0

This mapping spec exists so that:

- Codex can implement metrics consistently
- dummy data can mirror real formulas
- UI labels stay honest
- no displayed metric becomes decorative or ambiguous

---

## 1. Display-Metric Governance Rules

### 1.1 Every visible metric must have one canonical source
A metric shown in the UI must map to one formula family only.

### 1.2 Numbers and labels are different outputs
Some metrics should show:
- a number
- a label
- both

For example:
- `76` overall score = numeric output
- `挑戦者` = bucketed interpretation output

### 1.3 Not every internal calculation should be user-visible
If a metric is too unstable or too technical, Panoptes should expose a label rather than a raw number.

### 1.4 UI copy must not overclaim
If a metric is directional rather than deterministic, wording must reflect that.
Example:
- good: `改善余地 +22%`
- avoid: `CVが22%改善します`

---

## 2. Surface Areas Covered

This mapping spec covers the following major UI surfaces:

1. app shell / project list
2. analysis flow / inference review
3. competitor analysis
4. industry analysis
5. self analysis
6. strategy analysis
7. roadmap / 30-60-90
8. feed / monitoring placeholder
9. admin / summary where formula-linked values may later appear

---

## 3. Project List / Shell Metrics

## 3.1 Project status
### UI examples
- ready
- analyzing
- failed
- empty

### Source
Derived state logic from project + analysis job status, not formula score math.

### Canonical mapping
- `ready` => `current_snapshot_id != null`
- `analyzing` => latest job in queued/running/waiting state and no committed snapshot ready replacement yet
- `failed` => latest terminal failed/cancelled with no valid snapshot ready
- `empty` => no committed snapshot and no active analysis state

### Display type
- label only

### MVP required
- yes

---

## 3.2 Improvement delta in project card
### UI examples
- `+8`
- `+12`

### Meaning
Difference between previous committed snapshot overall score and current committed snapshot overall score for the same project.

### Formula mapping
`improvement_delta = current_overall_score - previous_overall_score`

If there is no previous committed snapshot:
- show nothing, or
- show neutral placeholder

### Display type
- number with sign

### MVP required
- optional in MVP, but formula should be stable if shown

---

## 3.3 Project age days
### UI examples
- `24日目`

### Meaning
Elapsed days from project creation or selected project baseline.

### Formula mapping
`project_age_days = floor((now - project_created_at) / 1 day)`

### Display type
- number + label

### MVP required
- optional

---

## 4. Analysis Flow / Inference Review Metrics

## 4.1 Visible step
### UI examples
- `分析対象URLを分析中です...`
- `競合を分析中です...`

### Source
Server-confirmed runtime phase mapped to visible step.

### Canonical mapping
- backend runtime / phase state -> visible step enum -> UI label

### Display type
- label only

### MVP required
- yes

---

## 4.2 Inference confidence
### UI examples
- `確信度 高`
- `87%`

### Meaning
Confidence of inference about industry / structure type / scale band.

### Formula mapping
Use hardened inference confidence from Formula Spec v2.1:

`inference_confidence = 0.30 * signal_agreement + 0.25 * internal_visual_agreement + 0.20 * pattern_consistency + 0.25 * benchmark_alignment`

Then UI confidence should be conservative through the global confidence family if shown as a number:

`ui_confidence = round(100 * min(inference_confidence, competitor_set_confidence, strategic_confidence * 0.95 + observation_confidence * 0.05))`

For inference-review-specific display, use:

`inference_ui_confidence = round(100 * min(inference_confidence, observation_confidence))`

### Display type
- percentage + label

### Label bands
- 88 to 100 = 高
- 72 to 87 = 中
- below 72 = 低

### MVP required
- yes

---

## 4.3 Auto-inferred values
### UI examples
- `業界: 水回り修理`
- `構造タイプ: 比較検討型`
- `規模感: 中`

### Source
Inference classification outputs, not direct numeric formula display.

### Formula mapping
Derived from bootstrap inference classifier using:
- structure pattern evidence
- content pattern evidence
- competitor pattern alignment
- scale heuristics

### Display type
- category label + confidence label/percent

### MVP required
- yes

---

## 5. Competitor Analysis Metrics

## 5.1 Competitor overall score
### UI examples
- `76`

### Meaning
Overall structural strength of the competitor based on Panoptes scoring.

### Formula mapping
From Formula Spec v2.1:

`overall_score = round(internal_weight_adj * internal_score + visual_weight_adj * visual_score)`

Where base weights are Internal 0.55 / Visual 0.45 and may be slightly confidence-adjusted.

### Display type
- 0 to 100 number

### MVP required
- yes

---

## 5.2 Competitor internal score
### UI examples
- `Internal 76`

### Meaning
Strength of the competitor on Internal structural evidence only.

### Formula mapping
Weighted mean of internal axis scores using market-type-aware or default profile.

### Display type
- 0 to 100 number

### MVP required
- yes

---

## 5.3 Competitor visual score
### UI examples
- `Visual 68`

### Meaning
Strength of the competitor on Visual evidence only.

### Formula mapping
Weighted mean of visual axis scores using market-type-aware or default profile.

### Display type
- 0 to 100 number

### MVP required
- yes

---

## 5.4 Competitor type label
### UI examples
- `成熟 × 比較検討型`

### Meaning
Structural market/type classification label.

### Formula mapping
Comes from classification layer, not simple score threshold.
Uses:
- market maturity pattern
- funnel pattern
- page-role pattern
- comparison/pricing/FAQ structure

### Display type
- categorical label

### MVP required
- yes

---

## 5.5 Competitor market position summary
### UI examples
- `業界内でのポジションは挑戦者です。`

### Meaning
Bucketed strategic position inside market map.

### Formula mapping
Uses two-dimensional map:
- X = structural maturity index
- Y = differentiation strength index

Then bucket into:
- leader
- strong incumbent
- challenger
- follower
- unstable niche

### Display type
- label / sentence

### MVP required
- yes

---

## 5.6 Competitor badges
### UI examples
- `# D2C`
- `# 低価格帯`
- `# 離脱ポイントあり`

### Meaning
Compressed categorical descriptors.

### Formula mapping
These come from rule-based classification tags on top of observations and risk families.

Examples:
- `離脱ポイントあり` <- funnel risk family / CTA fragmentation / comparison-route deficiency
- `低価格帯` <- pricing semantics classification

### Display type
- label chips

### MVP required
- optional but useful

---

## 6. Industry Analysis Metrics

## 6.1 Industry confidence
### UI examples
- `分析の確信度 87%`

### Meaning
Confidence that the competitor set supports a stable industry-structure interpretation.

### Formula mapping
Primarily from competitor-set confidence, moderated by observation confidence.

Recommended UI formula:

`industry_ui_confidence = round(100 * min(competitor_set_confidence, observation_confidence * 0.85 + inference_confidence * 0.15))`

### Display type
- percentage + label

### MVP required
- yes

---

## 6.2 Industry average axis values
### UI examples
- `価値訴求 78`
- `信頼構造 82`

### Meaning
Robust benchmark center for each axis across competitor set.

### Formula mapping
From Formula Spec v2.1 robust benchmark:

`robust_center = 0.50 * median + 0.30 * trimmed_mean_20 + 0.20 * weighted_mean`

Apply per axis.

### Display type
- 0 to 100 number

### MVP required
- yes

---

## 6.3 Structure stability
### UI examples
- `構造安定性 高`

### Meaning
How structurally coherent the competitor set is.

### Formula mapping
Derived from:
- structural cohesion
- benchmark spread control
- market-type consistency

Recommended formula:

`structure_stability = 100 * (0.45 * structural_cohesion + 0.35 * variance_control + 0.20 * market_type_consistency)`

Label bands:
- 80+ = 高
- 60 to 79 = 中
- below 60 = 低

### Display type
- label, optional hidden number

### MVP required
- recommended

---

## 6.4 Differentiation slack
### UI examples
- `差別化余白 大`

### Meaning
Amount of unused differentiation room in the market.

### Formula mapping
Derived from:
- low benchmark differentiation density
- high sameness convergence
- availability of unclaimed value themes

Recommended formula:

`differentiation_slack = 100 * (0.40 * low_diff_density + 0.35 * sameness_convergence + 0.25 * unclaimed_theme_room)`

Label bands:
- 75+ = 大
- 50 to 74 = 中
- below 50 = 小

### Display type
- label

### MVP required
- optional but strong

---

## 6.5 Market pressure
### UI examples
- `市場競争圧 Low`

### Meaning
How punishing the market is to structural weakness.

### Formula mapping
From Formula Spec v2.1:

`market_pressure = 0.25 * benchmark_concentration + 0.20 * top_quartile_gap_severity + 0.20 * convergence_pressure + 0.20 * decision_stage_competition + 0.15 * trust_funnel_intensity`

Labels:
- 0.00 to 0.32 = Low
- 0.33 to 0.62 = Medium
- 0.63 to 1.00 = High

### Display type
- label, optional hidden normalized value

### MVP required
- recommended, should use real formula if shown

---

## 6.6 Opportunity cards in industry view
### UI examples
- `比較導線の余白`
- `信頼訴求の余白`

### Meaning
Top market-wide opportunity themes.

### Formula mapping
Axis/theme opportunity using hardened formula:

`opportunity = 100 * (0.30 * gap_component + 0.20 * leverage_component + 0.15 * confidence_component + 0.15 * competitor_pressure_component + 0.10 * exploitability_component + 0.10 * readiness_component)`

Displayed theme titles are cluster labels derived from top-scoring opportunity families.

### Display type
- title + summary, optional score hidden/internal

### MVP required
- yes

---

## 7. Self Analysis Metrics

## 7.1 Self overall / internal / visual scores
### UI examples
- `76`
- `Internal 76`
- `Visual 68`

### Meaning
Same score family as competitor scores, but for self site.

### Formula mapping
Same as competitor card formulas.

### Display type
- number

### MVP required
- yes

---

## 7.2 Self vs industry gap per axis
### UI examples
- `価値訴求 -12`
- `情報階層 +10`

### Meaning
Difference between self axis score and robust industry benchmark center for that axis.

### Formula mapping
`axis_delta_points = self_axis_score - industry_axis_robust_center`

For interpretation labels, also use normalized delta:

`normalized_delta = (self_axis_score - robust_center) / max(robust_spread, spread_floor)`

### Display type
- signed number, optionally with interpretation color/label

### MVP required
- yes

---

## 7.3 Strength Top 3 / Issues Top 3
### UI examples
- `情報階層が整理されている`
- `料金ページへの導線が弱い`

### Meaning
Top positive and negative interpreted findings.

### Formula mapping
Generated from ranked axis/theme evidence clusters.

Strength ranking input:
- positive delta
- confidence
- leverage

Issue ranking input:
- negative delta
- opportunity
- risk score
- confidence

### Display type
- sentence list

### MVP required
- yes

---

## 7.4 Structure breakdown rows
### UI examples
- `情報設計 78`
- `回遊設計 65`

### Meaning
Sub-domain composite scores under self analysis.

### Formula mapping
These are secondary grouped composites built from axis-adjacent atomic features.
They should not invent new disconnected score universes.

Examples:
- 情報設計 <- hierarchy-heavy composite
- 回遊設計 <- funnel + decision-support composite
- 訴求一貫性 <- value proposition + differentiation consistency composite
- 技術基盤 <- technical hygiene support composite

### Display type
- number + short finding

### MVP required
- optional but good

---

## 7.5 AI summary in self view
### UI examples
- `業界平均より構造は強い…`

### Meaning
Narrative synthesis of benchmark deltas + opportunity + risk profile.

### Formula mapping
Narrative output based on:
- overall delta
- top weak axes
- top strong axes
- opportunity ranking
- market pressure

### Display type
- paragraph

### MVP required
- yes

---

## 8. Strategy Analysis Metrics

## 8.1 Strategic fit index
### UI examples
- `戦略適合指数 82`

### Meaning
How well the current recommended strategy aligns with the real highest-leverage structural need.

### Formula mapping
From Formula Spec v2.1:

`strategic_fit = 100 * (0.35 * top_priority_alignment + 0.25 * weak_axis_relevance + 0.15 * market_pressure_match + 0.15 * dependency_match + 0.10 * confidence_match)`

### Display type
- number + optional label

### Label bands
- 80+ = 高適合
- 60 to 79 = 中適合
- below 60 = 低適合

### MVP required
- recommended; if shown, must use real formula

---

## 8.2 Previous score
### UI examples
- `74`

### Meaning
Previous committed snapshot overall score.

### Formula mapping
`previous_score = previous_snapshot.overall_score`

### Display type
- number

### MVP required
- optional unless comparison is shown

---

## 8.3 Industry average delta
### UI examples
- `業界平均との差 +4`

### Meaning
Difference between self overall score and industry robust overall benchmark.

### Formula mapping
`industry_average_delta = self_overall_score - industry_overall_robust_center`

### Display type
- signed number

### MVP required
- recommended

---

## 8.4 Current theme
### UI examples
- `回遊導線の再設計`

### Meaning
Top-ranked strategy cluster label.

### Formula mapping
Comes from strategy clustering over top priority themes.
Not a free-form label independent of formulas.

### Display type
- label

### MVP required
- yes

---

## 8.5 Structure risk label
### UI examples
- `比較導線不足：高`

### Meaning
Risk family score interpreted into label.

### Formula mapping
From Formula Spec v2.1:

`risk_score = 100 * (0.40 * severity + 0.20 * breadth + 0.20 * urgency + 0.20 * benchmark_exposure)`

Label bands:
- 78+ = 高
- 52 to 77 = 中
- below 52 = 低

### Display type
- family label + severity label

### MVP required
- yes if risk shown

---

## 8.6 Improvement slack
### UI examples
- `+22% の改善余地`

### Meaning
Directional estimate of strategic room remaining before the site approaches benchmark saturation on top themes.

### Formula mapping
From Formula Spec v2.1:

`theme_lift_potential = gap_norm * leverage * confidence * readiness * non_saturation * market_room`

`improvement_slack_percent = round(100 * mean(top_3_theme_lift_potential))`

### Display type
- signed percent-like value

### UI wording rule
Must be framed as room/potential, not guaranteed KPI uplift.

### MVP required
- recommended; if shown, use real formula

---

## 8.7 Market pressure in strategy view
### UI examples
- `Low`

### Meaning
Same as industry market pressure, reused in strategy context.

### Formula mapping
Same as Section 6.5.

### Display type
- label

### MVP required
- recommended

---

## 8.8 Strategy cards ranking
### UI examples
- `1位 回遊導線の再設計`

### Meaning
Order of recommended strategic themes.

### Formula mapping
Rank by `priority` score, not raw gap alone.

`priority = 100 * (0.35 * opportunity_norm + 0.20 * impact_norm + 0.15 * urgency_norm + 0.15 * confidence_norm + 0.15 * execution_readiness_norm)`

### Display type
- ordinal ranking + title

### MVP required
- yes

---

## 8.9 Strategy evidence bullets
### UI examples
- `導線強度：業界平均より -12`

### Meaning
Most relevant supporting evidence for the strategy card.

### Formula mapping
Evidence bullets should be selected from:
- largest normalized gaps
- highest-confidence findings
- highest-leverage supportive findings

### Display type
- bullet list

### MVP required
- yes

---

## 8.10 Expected impact
### UI examples
- `funnelStrength +8`

### Meaning
Estimated directional lift in target axis if the strategy is executed well.

### Formula mapping
Expected impact is derived from:
- theme lift potential
- targeted weak-axis relevance
- readiness
- benchmark room

Recommended formula:

`expected_axis_lift = round(10 * theme_lift_potential * axis_relevance_multiplier)`

This is an axis-point directional estimate, not guaranteed business performance.

### Display type
- signed small integer by axis

### MVP required
- optional but strong

---

## 9. Roadmap / 30-60-90 Metrics

## 9.1 Phase goal
### UI examples
- `導線の土台を整える`

### Source
Strategy-to-roadmap planning output.

### Formula mapping
Derived from strategy cluster and phase assignment logic.

### Display type
- label / sentence

### MVP required
- yes

---

## 9.2 Progress fraction
### UI examples
- `1/3`

### Meaning
Completed tasks count / total tasks count for phase.

### Formula mapping
`phase_progress_fraction = completed_tasks / total_tasks`

Optional percent:
`phase_progress_percent = round(100 * completed_tasks / total_tasks)`

### Display type
- fraction or percent

### MVP required
- yes if task status shown

---

## 9.3 Owner / execution status
### UI examples
- `タスク実行中`
- `未着手`

### Source
Task / phase status state, not formula scoring.

### Display type
- label

### MVP required
- yes if roadmap state is interactive

---

## 9.4 Next action
### UI examples
- `比較ページ導線を再設計`

### Source
Top readiness action in current phase.

### Formula mapping
Derived from phase assignment + priority rank inside phase.

### Display type
- sentence

### MVP required
- recommended

---

## 10. Feed / Monitoring Metrics

## 10.1 Feed event importance
### UI examples
- `high`
- `medium`

### Meaning
How strategically meaningful the detected event is.

### Formula mapping
From Formula Spec v2.1:

`event_importance = 100 * (0.35 * severity_norm + 0.25 * strategic_impact_estimate + 0.15 * competitor_relevance + 0.15 * recurrence_pattern + 0.10 * benchmark_context)`

Labels:
- 80+ = critical
- 60 to 79 = high
- 35 to 59 = medium
- below 35 = low

### Display type
- label, optional hidden numeric score

### MVP required
- completion-oriented / placeholder in MVP

---

## 10.2 Feed event title
### UI examples
- `競合A社が価格訴求ブロックを更新`

### Meaning
Human-readable event summary.

### Formula mapping
Generated from event classification template:
- raw change
- structured interpretation
- concise label generation

### Display type
- sentence

### MVP required
- placeholder compatible

---

## 10.3 Feed event summary
### UI examples
- `pricing セクションの訴求順と CTA の近接性が変更されました。`

### Meaning
Short explanation of detected change and why it matters.

### Formula mapping
Template generated from:
- raw diff
- structured meaning
- strategic impact estimate

### Display type
- short paragraph

### MVP required
- placeholder compatible

---

## 11. Admin / Summary Metrics

## 11.1 Registered user counts / revenue
### UI examples
- `先行ユーザー 25名`
- `売上 124,500円`

### Meaning
Operational counts, not Panoptes strategy formulas.

### Formula mapping
Pure business/admin aggregation.

### Display type
- numbers

### MVP required
- if admin panel exists

---

## 12. Metrics That Should Usually Remain Internal

These may power logic, but do not always need direct UI exposure.

- robust_spread
- relevance_weight per competitor
- variance_control
- signal_agreement raw value
- benchmark_concentration raw value
- execution_readiness_norm raw value
- saturation_penalty raw value
- market_room raw value

Reason:
These help explanation and auditability, but are too technical for primary UI.

---

## 13. MVP Hard-Requirement Metric Set

The following displayed metrics must already be formula-trustworthy in MVP.

### Required
- visible step
- inference confidence
- competitor overall/internal/visual scores
- industry confidence
- industry benchmark axis values
- self overall/internal/visual scores
- self vs benchmark deltas
- strength top 3 / issues top 3
- strategy card ranking
- risk label if shown
- roadmap phase progress if shown

### Strongly recommended
- market pressure
- strategic fit
- improvement slack
- structure stability
- differentiation slack

These can exist at MVP if formula-backed; they should not be decorative placeholders.

---

## 14. Dummy Data Mapping Rule

Dummy seed data should reflect the same metric names and semantic meanings as this document.

That means:
- `overallScore` in dummy data must mean real overall score
- `industryAverageDelta` must mean benchmark delta
- `strategyFitScore` must mean strategic fit
- `confidencePercent` must map to actual confidence family

Dummy data must not invent UI labels disconnected from formula semantics.

---

## 15. Codex Implementation Rule

Codex should treat this document as the binding map between UI labels and formula families.

If Codex encounters a visible number, it should ask:
1. what UI metric is this?
2. which formula family does it map to?
3. is this numeric, categorical, or both?
4. is this MVP-required or completion-oriented?

Codex should not invent ad-hoc calculations for visible metrics if this mapping spec already defines them.

---

## 16. Final Summary

Panoptes UI metrics now map cleanly from display surface to formula source.

This means the product can maintain trust by ensuring that:

- each visible number has semantic meaning
- each label has a derivation path
- dummy data aligns with real scoring logic
- Codex implementation can stay consistent across screens
- MVP metrics can already feel completion-grade

This is the canonical display-to-formula mapping specification for Panoptes.

