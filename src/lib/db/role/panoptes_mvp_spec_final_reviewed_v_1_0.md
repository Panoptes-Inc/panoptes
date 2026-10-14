# Panoptes MVP Specification Final Reviewed v1.0

## 0. Role of This Document

This document is the final reviewed MVP specification for Panoptes after alignment with the latest master direction.

Its purpose is to define, with minimal ambiguity:

1. what Panoptes MVP must implement now
2. what Panoptes MVP must already assume as fixed product architecture
3. what must remain future-compatible so the product can grow into the completed Panoptes vision without structural breakage

This document is not the full completion spec.
It is the authoritative MVP scope and MVP-stage design contract.

---

## 1. Product Definition at MVP Stage

Even at MVP stage, Panoptes is defined as:

**A strategy OS that reads the structure of self, competitors, and industry, explains causal gaps, generates strategic options, and converts them into execution priority.**

Panoptes is not defined as:

- an analytics tool
- an SEO tool
- a traffic estimation tool
- a generic chat AI
- a generic work-management suite

Panoptes is defined as:

- a structural observation system
- a strategic interpretation system
- a causal explanation system
- an execution prioritization engine

The MVP does not implement the entire future product surface, but it must already express the correct product identity.

---

## 2. MVP Core Goal

The MVP must prove that Panoptes can complete one stable end-to-end strategy generation loop.

That loop is:

1. accept URL input
2. analyze self-site structure
3. analyze 10 competitors
4. infer industry structure
5. identify self gaps against competitors/industry
6. generate 3 strategy cards
7. generate a 30/60/90 roadmap
8. save the result as a snapshot

The MVP succeeds when this flow is stable, explainable, and persistable.

---

## 3. MVP Functional Scope

## 3.1 URL input and project creation
The MVP must support:

- URL input by the user
- URL normalization
- reachability check
- project shell creation
- first analysis job creation
- idempotent create-and-start flow

A project may validly exist before a committed snapshot exists.

---

## 3.2 Bootstrap inference flow
The MVP must support bootstrap analysis for initial understanding of the target site.

This includes:

- initial crawl
- structure-type inference
- industry inference
- site-scale inference
- inference review step in the UI
- user confirmation before deeper analysis proceeds

This step is important because Panoptes should not treat all URLs as already-understood cases.

---

## 3.3 Competitor and industry analysis
The MVP must support:

- selection/discovery of 10 competitors
- competitor analysis based on Panoptes observation model
- industry-structure inference from competitor group patterns
- self-vs-competitor-vs-industry gap interpretation

The MVP does not need every future comparison mode, but this triad must already work:

- self
- competitors
- industry

---

## 3.4 Strategy generation
The MVP must generate 3 strategy cards from top-ranked priorities.

Each strategy card must contain at minimum:

- strategic intent
- evidence / rationale
- execution direction

The MVP must not generate opaque strategy text disconnected from evidence.
Even if explanation is lightweight, the chain from observation to strategy must still be visible.

---

## 3.5 Roadmap generation
The MVP must generate a 30/60/90 roadmap from strategy cards.

This includes:

- 30-day actions
- 60-day actions
- 90-day actions
- initial taskable structure for execution

The MVP roadmap does not need full enterprise work-management depth, but it must preserve strategy-to-execution continuity.

---

## 3.6 Snapshot persistence
The MVP must save analysis results as snapshots.

At minimum the following entities must be coherently linked:

- project
- analysis job
- snapshot
- strategy plan
- phase task

Rules:

- a project may legally have `current_snapshot_id = null`
- `ready` state requires committed current snapshot
- completed job status alone is not sufficient for ready UI
- snapshot persistence must survive refresh / reconnect

---

## 4. MVP UI Flow Requirements

## 4.1 Canonical visible steps
The MVP analysis flow uses these visible steps:

1. `target_scan`
2. `inference_review`
3. `competitor_analysis`
4. `industry_analysis`
5. `strategy_synthesis`

These are user-facing fixed steps for the white analysis panel.

---

## 4.2 White panel requirements
The center white analysis panel must follow these rules:

- the panel frame remains mounted
- only internal content changes
- visible step changes only on server-confirmed milestones
- local timers may animate but must not define truth
- the panel must avoid flicker, collapse, and destructive remounts

This is a product guarantee, not only a frontend implementation preference.

---

## 4.3 Safe project switching
The MVP must preserve UI stability during project switching.

Rules:

- do not blank the main surface immediately on project switch
- keep last stable view visible while new project detail hydrates
- if hydration fails, revert to the last stable view
- selecting a project with no snapshot is valid and must render safely

---

## 4.4 Safe create / retry / reanalysis behavior
The MVP must preserve stability under repeated actions.

Rules:

- create-and-start must use idempotency
- duplicate submit must not create duplicate jobs
- stale job responses must be ignored
- visible progress must be monotonic within a job
- old snapshot must remain visible during reanalysis until new snapshot commit succeeds

If reanalysis is included in MVP behavior, it must obey the same safety guarantees as the primary flow.

---

## 5. Observation Architecture Fixed at MVP Stage

These are treated as fixed product architecture even at MVP stage.

## 5.1 Dual-layer observation
All Panoptes observation is dual-layer by default.

### Internal
- HTML
- DOM
- information structure

### Visual
- layout
- visual hierarchy
- emphasis distribution

The MVP must already preserve this distinction.
It should not collapse Panoptes into a single undifferentiated “AI reads page” flow.

---

## 5.2 Six strategic axes
Panoptes evaluates using six fixed strategic axes.

1. value proposition
2. information hierarchy
3. funnel strength
4. trust structure
5. differentiation clarity
6. decision support

The axes remain stable across self, competitor, and industry interpretation.
The MVP must already be designed around these fixed axes, even if later versions deepen evidence granularity.

---

## 5.3 Non-AI crawl principle
Panoptes does not do AI crawling.

- Python crawler performs mechanical observation
- AI performs understanding, synthesis, explanation, and strategy generation

This is a fixed architecture principle.
It exists for:

- reproducibility
- lower cost
- better diff capability
- better monitoring compatibility
- clearer observation boundaries

---

## 5.4 Canonical crawl modes
Panoptes has three crawl modes architecturally:

- bootstrap crawl
- analysis crawl
- monitoring crawl

The MVP primarily uses bootstrap crawl and analysis crawl.
Monitoring crawl does not need full product realization in MVP, but the architecture must not block it.

---

## 6. MVP Observation Specification

## 6.1 Internal extraction minimum
The Python crawler must be able to extract at least:

- title
- h1 / h2
- CTA
- form
- FAQ
- pricing
- compare
- trust block
- case block
- internal links

This is the minimum evidence base for the MVP.

---

## 6.2 Visual interpretation minimum
The MVP visual layer must support:

- screenshot capture
- AI vision interpretation

Primary visual interpretation targets include:

- visual hierarchy
- CTA strength
- layout density
- trust elements

Visual interpretation complements internal extraction.
It does not replace it.

---

## 6.3 Observation Bundle
The Strategic Engine input is an Observation Bundle.

At minimum it includes:

- site info
- page list
- internal observations
- visual observations
- flow summary

The MVP must keep the observation-to-engine boundary explicit.

---

## 7. Strategic Engine Requirements at MVP Stage

The MVP Strategic Engine must transform observation into ranked strategic output.

At minimum it must compute or derive the equivalents of:

- internal score
- visual score
- overall score
- industry benchmark
- opportunity
- priority

The Strategic Engine must not behave like a free-form text generator.
It must act as the structured bridge from evidence to strategic pressure.

---

## 8. Data / Persistence Rules

## 8.1 Snapshot-world-first rule
Analysis results are not disposable output.
They are part of the snapshot world.

The MVP must therefore preserve:

- project state
- analysis-job state
- snapshot state
- strategy-plan state
- roadmap/task state

The product must remain reload-safe and reconnect-safe.

---

## 8.2 History principle fixed at MVP stage
Even if not fully surfaced yet, Panoptes must already preserve the conceptual distinction between:

### Generic history
Reusable abstract strategic memory that can safely generalize across projects.

### Unique history
Project-specific / user-specific memory, decisions, and constraints.

The MVP does not need to expose the full future strategic-database experience, but its persistence model must not block this two-layer history architecture.

---

## 8.3 Change-history compatibility
The MVP architecture must remain compatible with future storage of:

- raw evidence history
- snapshot history
- decision history
- change history
- generalized pattern memory
- project-specific strategic memory

This does not mean fully building all of them now.
It means not painting the architecture into a corner.

---

## 9. Non-Functional MVP Rules

## 9.1 Token-cap product model
Panoptes is designed as a token-cap product.
The user may choose analysis-load modes such as:

- high load
- medium load
- low load

The MVP does not need every pricing nuance finalized, but the product model must remain compatible with usage-governed intelligence.

---

## 9.2 SPU rule
SPU consumption applies to AI processing only.
Crawler execution itself does not consume SPU.

This distinction must remain stable because it affects pricing clarity and long-term product trust.

---

## 9.3 Stability over cleverness
At MVP stage, stability beats feature breadth.

The MVP must prioritize:

- deterministic state restoration
- stale-response protection
- progress monotonicity
- idempotent create/retry flows
- safe snapshot commit semantics

A visually impressive but state-unsafe MVP is considered incorrect.

---

## 10. Future-Compatible Structures the MVP Must Respect

The following are part of the completion vision and do not need full realization in MVP, but MVP architecture must remain compatible with them.

## 10.1 Feed / Radar
Panoptes completion vision includes:

- feed for meaningful relevant changes
- radar for broader industry-structure shifts

Examples:

- pricing change
- CTA change
- FAQ addition
- trust-structure shift
- competitor pattern shift

The MVP does not need full feed/radar surfaces, but should preserve future compatibility with event generation and historical comparison.

---

## 10.2 Monitoring / Watch
Panoptes completion vision includes monitoring crawl and competitor watch.

Future-compatible change detection layers include:

- URL diff
- HTML diff
- structural diff
- semantic diff

The MVP does not need full competitive-monitoring productization, but must not block it architecturally.

---

## 10.3 Strategic database direction
The completion vision includes Panoptes as a strategy database.

This means future retrievability of:

- prior snapshots
- strategy history
- change history
- generalized patterns
- decision rationale

The MVP does not need full retrieval UX, but should preserve this direction conceptually.

---

## 10.4 Team operation
Future-compatible org-layer features include:

- roles
- permissions
- comments
- approvals
- notifications

The MVP does not need all of them, but its data and state model should not assume a permanently single-user world.

---

## 11. What the MVP Explicitly Does Not Need to Become

The MVP should not be judged by whether it contains:

- full analytics instrumentation
- SEO ranking platform features
- ad-operations features
- CRM functionality
- MA functionality
- generic team chat
- generic PM suite behavior

Panoptes remains centered on:

**observation -> understanding -> calculation -> strategy -> execution priority -> snapshot persistence**

That is the MVP center of gravity.

---

## 12. MVP Success Criteria

The MVP is considered successful only when all of the following are true:

1. URL input to committed snapshot works end-to-end
2. self / competitor / industry / strategy flow remains coherent
3. 3 strategy cards are generated
4. 30/60/90 roadmap is generated
5. project / analysis job / snapshot state do not break under refresh or reconnect
6. stale responses do not corrupt current UI
7. project switching does not destructively blank stable UI
8. ready state requires committed snapshot pointer
9. the product clearly reads as a strategy OS, not just a page-summary tool
10. the architecture remains future-compatible with memory, feed/radar, and monitoring

---

## 13. Final Definition of MVP

Panoptes MVP is not the smallest possible prototype.
It is the smallest structurally correct form of Panoptes.

What the MVP must prove is not merely that “AI can analyze a site.”
It must prove that Panoptes can:

- observe self / competitors / industry structurally
- turn that into ranked strategic interpretation
- generate explainable strategy options
- convert them into roadmap priority
- preserve the result as snapshot-world state
- do so in a stable, future-compatible architecture

That is the correct meaning of Panoptes MVP.

