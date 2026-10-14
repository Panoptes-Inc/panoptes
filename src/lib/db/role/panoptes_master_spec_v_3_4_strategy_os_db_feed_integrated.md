# Panoptes Master Spec v3.4

## 0. Positioning of This Document

This document is the updated master specification for Panoptes.
It supersedes the stability-hardened master specification where this document defines a broader or newer canonical product direction.

Panoptes is not defined as a narrow competitor-analysis tool.
Panoptes is defined as a strategy OS that can expand into a strategy database and competitive environment monitoring platform.

This document exists to unify:

- MVP execution architecture
- stability rules
- snapshot world
- strategic engine design
- history architecture
- feed / radar architecture
- monitoring architecture
- future org-scale operating model

This document should be treated as the top-level canonical product design document.

---

## 1. Product Definition

Panoptes is:

**A strategy OS that reads the structure of self, competitors, and industry, explains causal gaps, generates strategic options, and converts them into execution priority.**

Panoptes is not:

- an analytics tool
- an SEO tool
- a traffic estimation tool
- a generic chat AI
- a general project management suite

Panoptes is:

- a structural observation system
- a strategic interpretation system
- a causal explanation system
- an execution prioritization engine
- a strategic memory system
- a competitive environment monitoring system

Panoptes must be understood as a system that continuously performs:

**observation -> understanding -> calculation -> strategy -> execution prioritization -> memory -> monitoring**

---

## 2. Core Product Identity

The heart of Panoptes consists of the following pillars:

1. Crawler
2. Strategic Engine
3. Snapshot World
4. Strategy Generation

In the expanded completion vision, these are extended by:

5. Strategic Memory
6. Feed / Radar
7. Monitoring / Watch

The first four are the original heart.
The latter three transform Panoptes from a one-time analysis product into a strategic operating system and strategic database.

---

## 3. Product Scope by Maturity

### 3.1 MVP scope
MVP proves that Panoptes can:

1. accept URL input
2. analyze self structure
3. analyze 10 competitors
4. estimate industry structure
5. compute self gaps
6. generate 3 strategy cards
7. generate a 30/60/90 roadmap
8. save results as snapshots

### 3.2 Completion scope
The completed Panoptes product additionally must:

- preserve historical strategic memory
- distinguish generalized vs project-specific learning
- monitor competitors continuously
- surface meaningful changes via feed and radar
- compare past and present strategic states
- support team interpretation and execution over time

Completion is not defined as “more UI.”
Completion is defined as “Panoptes becomes a persistent strategic operating system.”

---

## 4. Product Layer Model

Panoptes should be designed as a seven-layer product.

1. Analysis Engine
2. Strategic Intelligence
3. Execution System
4. Knowledge / Memory Layer
5. Intelligence Feed Layer
6. Monitoring / Watch Layer
7. Org / SaaS Operating Layer

### 4.1 Analysis Engine
Responsible for structured observation of self / competitors / industry.

### 4.2 Strategic Intelligence
Responsible for scoring, opportunity identification, strategy option generation, and explanation.

### 4.3 Execution System
Responsible for roadmap generation, prioritization, and taskable strategy conversion.

### 4.4 Knowledge / Memory Layer
Responsible for storing reusable strategic knowledge and project-specific decision memory.

### 4.5 Intelligence Feed Layer
Responsible for surfacing meaningful new signals to users in a digestible stream.

### 4.6 Monitoring / Watch Layer
Responsible for recurring crawl, diff detection, interpretation, and event generation.

### 4.7 Org / SaaS Operating Layer
Responsible for roles, permissions, comments, approvals, notifications, billing, and multi-user operation.

---

## 5. Fundamental Design Principles

### 5.1 Panoptes does not do AI crawling
Panoptes does not rely on AI to crawl websites.
Python crawler performs mechanical observation.
AI is used for understanding, synthesis, explanation, and strategy generation.

Reasons:

- lower cost
- higher reproducibility
- reliable diff detection
- stable feed/radar generation
- more controllable pipeline

### 5.2 Observation is dual-layer by default
All observation is performed across two permanent layers.

- Internal = HTML / DOM / information structure
- Visual = layout / visual hierarchy

### 5.3 Strategy evaluation remains fixed at six axes
Panoptes evaluates through six stable strategic axes.

1. value proposition
2. information hierarchy
3. funnel strength
4. trust structure
5. differentiation clarity
6. decision support

These axes remain stable across self, competitor, industry, and snapshot comparison.

### 5.4 Snapshot world is first-class
Analysis results are never treated as disposable output.
They are preserved as part of the snapshot world.

### 5.5 Memory is a product feature, not a side effect
History storage is not merely logging.
Strategic memory is a core product function.

### 5.6 Monitoring is not auxiliary
Monitoring is not an optional add-on.
It is a core expansion path built into the architecture from the beginning.

---

## 6. Crawl Architecture

Panoptes has three crawl modes.

### 6.1 bootstrap crawl
Purpose:
- site structure estimation
- initial inference generation
- project creation flow

### 6.2 analysis crawl
Purpose:
- full self analysis
- competitor analysis
- industry synthesis inputs
- strategic engine evidence preparation

### 6.3 monitoring crawl
Purpose:
- periodic competitor watch
- self-site watch if enabled
- feed event generation
- radar signal generation
- historical change accumulation

Monitoring crawl is part of canonical architecture even if MVP only lightly exercises it.

---

## 7. Internal Observation Specification

Python crawler must be able to extract at minimum:

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

Future enrichment may include:

- sticky CTA behavior
- navigation depth
- repeated block patterns
- testimonial formats
- offer framing blocks
- guarantee blocks
- urgency indicators

---

## 8. Visual Observation Specification

Visual observation is performed by:

1. page screenshot capture
2. AI vision interpretation

Primary evaluation targets include:

- visual hierarchy
- CTA strength
- layout density
- trust elements
- emphasis balance
- scanability
- visual friction

Visual interpretation should never replace internal extraction.
It complements internal extraction as a second observation layer.

---

## 9. Observation Bundle

Strategic Engine input is an Observation Bundle.

It includes:

- site info
- page list
- internal observations
- visual observations
- flow summary

Future versions may include additional interpreted layers, but the bundle must preserve traceability from evidence to strategy output.

---

## 10. Strategic Engine

Strategic Engine transforms observation into strategic interpretation.

### 10.1 Engine outputs
At minimum, the engine computes:

- internal score
- visual score
- overall score
- industry benchmark
- opportunity
- priority

### 10.2 Engine role
The engine is not only a scoring device.
It is the mechanism that turns evidence into ranked strategic pressure.

### 10.3 Explanation requirement
Strategic Engine outputs must remain explainable.
Panoptes should always be able to answer:

- why this opportunity was raised
- which evidence mattered
- which competitive structure shaped the conclusion
- which self weakness or strength influenced the priority

---

## 11. Strategy Generation

Strategy generation creates strategic options from top priorities.

### 11.1 MVP strategy output
MVP generates 3 strategy cards.
Each card contains:

- intent
- evidence
- execution

### 11.2 Completion strategy output
Completed Panoptes should support multiple strategic postures, such as:

- conservative strategy
- standard strategy
- aggressive strategy

Each option should be explainable in terms of:

- positioning logic
- assumptions
- required effort
- risk
- expected short-term effect
- expected mid-term effect
- organizational fit

Panoptes should evolve toward decision-support among options, not a single unexplained answer.

---

## 12. Roadmap / Execution

### 12.1 MVP execution output
Strategy cards generate a 30/60/90 roadmap.

### 12.2 Completion execution model
Completed Panoptes should convert strategy into managed execution state:

- phase goals
- tasks
- priority
- assignees
- blockers
- dependencies
- completion state
- progress visibility

The execution layer is not meant to replace all PM tools.
Its role is to preserve the strategic chain from evidence to execution priority.

---

## 13. Snapshot World

Panoptes operates in a snapshot world.
The canonical MVP snapshot-linked entities include:

- project
- analysis job
- snapshot
- strategy plan
- phase task

A project may legally exist with no current snapshot.
Ready state requires a committed current snapshot pointer.

Snapshots are not only storage objects.
They are the historical state containers that enable:

- comparison over time
- reanalysis continuity
- strategy drift understanding
- feed event context
- memory formation

---

## 14. History Architecture

Panoptes stores history in two major classes.

### 14.1 Generic history
Reusable abstract strategic knowledge shared across the system.

Examples:

- patterns that often matter in an industry
- recurring competitive structures
- repeated winning design/structure tendencies
- commonly observed trust patterns
- frequently effective strategy patterns

Generic history must be abstracted enough to avoid leaking project-specific or customer-specific confidential detail.

### 14.2 Unique history
Project-specific or user-specific history.

Examples:

- why a strategy was selected or rejected
- organization-specific constraints
- project-specific competitor behavior
- target KPI priorities
- brand constraints
- prior decisions and their context

### 14.3 Additional history classes
Panoptes should conceptually distinguish:

- raw evidence history
- snapshot history
- decision history
- change history
- generalized pattern memory
- project-specific strategic memory

These may not all surface equally in MVP, but architecture should not block them.

---

## 15. Strategic Database Vision

Panoptes should evolve into a strategic database.

That means it should not only generate results, but retain retrievable strategic memory such as:

- prior snapshots
- prior strategy options
- competitor change history
- industry change history
- decision rationale
- reusable generalized patterns
- similar case patterns

A strategic database requires not only storage but retrievability.
Future product layers should support search across strategic memory.

---

## 16. Feed / Radar

Feed and Radar are core completed-product surfaces.

### 16.1 Feed
Feed shows meaningful relevant changes to the user.
It is not a raw notification dump.
It should surface interpreted events such as:

- competitor A updated pricing structure
- competitor B changed CTA architecture
- competitor C added FAQ / trust content
- self-site structure changed
- reanalysis completed
- strategic priority shifted

Feed contains at least two broad categories:

#### User-relevant feed
Events connected to the user’s monitored projects, competitors, and active strategic context.

#### Shared intelligence feed
Abstracted cross-user strategic patterns that can be safely generalized without exposing customer-specific private details.

### 16.2 Radar
Radar represents broader industry-structure and trend shifts.
It should identify patterns such as:

- increasing trust emphasis in an industry
- growing comparison-page prevalence
- narrowing differentiation pattern space
- repeated funnel-structure convergence

### 16.3 Feed design principles
Feed must include:

- importance ranking
- recency awareness
- event bundling where appropriate
- strategic interpretation, not only raw diff

---

## 17. Monitoring / Watch

Competitor monitoring is a core completed-product function.

### 17.1 Monitoring targets
Monitoring should be able to detect at least:

- page updates
- pricing changes
- CTA changes
- FAQ additions/removals
- trust element changes
- section structure changes
- offer framing changes
- comparison structure changes

### 17.2 Diff layers
Panoptes performs multi-layer change detection.

- URL diff
- HTML diff
- structural diff
- semantic diff

### 17.3 Monitoring interpretation layers
Monitoring should evolve in three levels:

#### Layer 1: raw change detection
Literal changes in content, DOM, page set, and screenshot.

#### Layer 2: structured interpretation
Change converted to interpretable categories such as:
- CTA strengthening
- trust addition
- comparison emphasis increase
- visual simplification
- friction reduction

#### Layer 3: strategic impact estimation
Change translated into strategic meaning such as:
- this competitor may be increasing conversion pressure
- reassurance competition is intensifying
- self differentiation room may be shrinking
- comparison-led decision support is becoming more important

This third layer is what turns monitoring into strategic value.

---

## 18. Event Architecture

Feed / Radar / monitoring rely on meaningful event generation.

Event families should include at minimum:

- Project Events
- Competitor Events
- Industry Events
- Platform Intelligence Events

Each event should carry concepts such as:

- source entity
- timestamp
- importance
- evidence summary
- interpreted meaning
- strategic implication

Importance levels should support at least:

- critical
- high
- medium
- low

This prevents the product from degrading into alert noise.

---

## 19. UI Surface Model

Panoptes has two major surface modes in product maturity.

### 19.1 Analysis surface
Used to progress through active analysis.
In MVP, this includes the central white panel flow:

- target_scan
- inference_review
- competitor_analysis
- industry_analysis
- strategy_synthesis

The white panel frame remains mounted.
Only content transitions.
Step transitions must be driven by server-confirmed milestones.

### 19.2 Strategic operating surface
Used after snapshot creation and in completion vision.
This includes:

- snapshot dashboard
- strategy view
- roadmap / task view
- feed
- radar
- monitoring summaries
- project memory surfaces

Panoptes must feel like an operating surface, not just a result page.

---

## 20. Stability Rules

The previously hardened stability rules remain canonical.

### 20.1 Stale job protection
Only the latest relevant job for the active project may mutate active analysis UI.

### 20.2 Monotonic progress
Visible step must never regress within the same job.

### 20.3 No destructive switch blanking
Project switching must preserve last stable view until hydration succeeds.

### 20.4 Ready requires committed snapshot
Completed job status alone is insufficient.
Ready requires committed current snapshot.

### 20.5 Reanalysis preserves old snapshot
Old snapshot remains visible until new commit succeeds.

### 20.6 White panel remains mounted
Do not remount the panel on every progress transition.

These rules are not implementation details.
They are product guarantees.

---

## 21. Token / Usage Design

Panoptes uses a token-cap model.
Users may select analysis load modes such as:

- high load
- medium load
- low load

SPU consumption applies only to AI processing.
Crawler execution itself does not consume SPU.

This distinction is important for both pricing and product trust.

---

## 22. Plan Concepts

Current plan concepts include:

- prime: 89800 JPY
- dominion: 129800 JPY
- sovereign: 249800 JPY

These concepts may evolve, but the architecture should support differentiated compute / intelligence / operating modes without breaking the product model.

---

## 23. Org / SaaS Layer

The completion vision includes team and organization operation.

Key capabilities include:

- org-based access
- multi-member collaboration
- roles and permissions
- comments
- approvals
- notifications
- auditability
- billing alignment

Panoptes should remain strategy-centered even as these layers are added.
It should not drift into generic work management software.

---

## 24. Future Expansion Inputs

Panoptes may expand beyond site structure alone by reading additional materials such as:

- financial statements
- management plans
- KPI inputs

This expansion should strengthen AI strategy consulting capability while preserving the original observation-first design.

---

## 25. What Panoptes Must Not Become

Even as it expands, Panoptes should not become:

- a pure analytics platform
- a pure SEO platform
- a pure ad operations platform
- a CRM
- a marketing automation suite
- a generic chat workspace
- a no-code site builder

Its center must remain:

**structure -> understanding -> calculation -> strategy -> execution priority -> memory -> monitoring**

---

## 26. Final Definition of Product Completion

Panoptes is complete not when it has “many features.”
It is complete when it can do all of the following as one coherent operating system:

- observe self, competitors, and industry structurally
- interpret strategic meaning from evidence
- generate explainable strategic options
- convert options into execution priority
- preserve historical strategic states
- distinguish generic vs unique strategic memory
- monitor competitive changes continuously
- surface meaningful signals via feed and radar
- support team use without losing product focus

That is the completed form of Panoptes.

