# Panoptes File Consolidation / Strengthening Map v2

## 0. Purpose

This document defines how the Panoptes document set should be organized after the latest specification updates.

Its purpose is to clarify:

- which files are canonical current documents
- which files are implementation-support documents
- which files are working-transition documents
- which files should be archived after absorption or replacement
- which documents must be updated when the master spec changes

This is not a product spec.
This is the document-governance map for the Panoptes knowledge base.

---

## 1. Document Governance Principle

Panoptes documents must be managed by role, not by creation date alone.

A file should belong to one of the following classes:

1. Canonical product specification
2. Canonical implementation specification
3. Working / transitional document
4. Handoff / summary document
5. Archive document

The goal is to prevent confusion between:

- true source-of-truth documents
- intermediate documents used during convergence
- historical references kept only for traceability

---

## 2. Current Canonical Hierarchy

As of this version, the recommended canonical hierarchy is:

### Tier A — Top-level canonical product docs
These define the product itself.

1. `Panoptes_Master_Spec_v3_4_StrategyOS_DB_Feed_Integrated`
2. `Panoptes_MVP_Spec_Integrated_Update_vNext`

### Tier B — Canonical implementation docs
These define how the product is implemented safely.

3. `Panoptes_DB_Migration_v3_3_Complete.sql`
4. `Panoptes_Types_Zod_v3_3_Complete.ts`
5. `Panoptes_API_Contract_v3_3_Complete.md`
6. `Panoptes Frontend State Machine Store Design v3.txt`
7. `Panoptes Svelte Store Skeleton V3 3 Complete`

### Tier C — Codex implementation docs
These guide implementation execution.

8. `Panoptes Codex Implementation Brief V3 3`
9. `Panoptes Codex Short Execution Prompt V3 3`

### Tier D — Transitional / governance docs
These exist to support convergence and organization.

10. `Panoptes_File_Consolidation_Strengthening_Map_v2`

### Tier E — Archive / historical handoff docs
These are preserved for reference but should not be treated as current source-of-truth after absorption.

11. `Panoptes 引き継ぎ資料（重要設計まとめ）`
12. older master specs and older merged intermediary specs
13. older file consolidation maps

---

## 3. Folder Model Recommendation

Recommended document folder model:

### `00_Current`
Store only the currently authoritative docs here.

Recommended contents:

- Master spec current
- MVP spec current
- DB migration current
- Types/Zod current
- API contract current
- Frontend state machine/store current
- Svelte store skeleton current
- Codex implementation brief current
- Codex short prompt current
- file consolidation map current

### `01_Working`
Store active in-progress drafts here.

Examples:

- next master spec draft
- next API revision draft
- watch/feed event model draft
- roadmap restructuring draft

### `99_Archive`
Store absorbed, superseded, or historical materials here.

Examples:

- prior master specs
- prior consolidation maps
- absorbed handoff summaries
- patch or intermediary integration docs no longer used as canon

This keeps active reference clean while retaining project memory.

---

## 4. Current File-by-File Classification

## 4.1 Canonical current product docs

### A. Master spec
**File:** `Panoptes_Master_Spec_v3_4_StrategyOS_DB_Feed_Integrated`

**Role:**
Top-level canonical product design document.

**Status:**
Current / canonical.

**Reason:**
This is the latest unified product definition that includes:
- strategy OS positioning
- strategy database direction
- generic / unique history
- feed / radar
- monitoring / watch
- completion vision

**Action:**
Keep in `00_Current`.
Do not archive.

---

### B. MVP spec
**File:** `Panoptes_MVP_Spec_Integrated_Update_vNext`

**Role:**
Canonical MVP scope and MVP-stage design-principle document.

**Status:**
Current, but recommended for later formal naming cleanup.

**Reason:**
It clearly distinguishes:
- MVP implementation scope
- fixed design principles
- future-compatible architecture assumptions

**Action:**
Keep in `00_Current`.
Rename later if desired, but do not archive now.

---

## 4.2 Canonical current implementation docs

### C. DB migration
**File:** `Panoptes_DB_Migration_v3_3_Complete.sql`

**Role:**
Canonical implementation database base.

**Status:**
Current implementation canon.

**Reason:**
Still valid as core implementation foundation unless DB-level structures are explicitly expanded for feed/history/watch next.

**Action:**
Keep in `00_Current`.
Future update only when schema must absorb feed/history/watch structures.

---

### D. Types / Zod
**File:** `Panoptes_Types_Zod_v3_3_Complete.ts`

**Role:**
Canonical shared domain types and validation base.

**Status:**
Current implementation canon.

**Reason:**
Still valid for MVP and current orchestration implementation.

**Action:**
Keep in `00_Current`.
Future update only after schema/API changes.

---

### E. API Contract
**File:** `Panoptes_API_Contract_v3_3_Complete.md`

**Role:**
Canonical API behavior contract.

**Status:**
Current implementation canon.

**Reason:**
Still aligned to MVP flow and stable orchestration model.

**Action:**
Keep in `00_Current`.
Future update only if backend contract evolves.

---

### F. Frontend state machine/store spec
**File:** `Panoptes Frontend State Machine Store Design v3.txt`

**Role:**
Canonical frontend orchestration safety specification.

**Status:**
Current implementation canon.

**Reason:**
Still aligned to active frontend behavior guarantees.

**Action:**
Keep in `00_Current`.
Recommended future filename normalization, but not required immediately.

---

### G. Svelte store skeleton
**File:** `Panoptes Svelte Store Skeleton V3 3 Complete`

**Role:**
Canonical code-oriented frontend scaffold.

**Status:**
Current implementation support canon.

**Reason:**
Directly supports implementation of the frontend state machine/store spec.

**Action:**
Keep in `00_Current`.

---

## 4.3 Codex implementation docs

### H. Codex implementation brief
**File:** `Panoptes Codex Implementation Brief V3 3`

**Role:**
Detailed Codex execution contract.

**Status:**
Current support doc.

**Action:**
Keep in `00_Current` while implementation is active.

---

### I. Codex short execution prompt
**File:** `Panoptes Codex Short Execution Prompt V3 3`

**Role:**
Operational prompt for quick Codex execution.

**Status:**
Current support doc.

**Action:**
Keep in `00_Current` while implementation is active.

---

## 4.4 Transitional / governance docs

### J. File consolidation map
**File:** `Panoptes_File_Consolidation_Strengthening_Map_v2`

**Role:**
Canonical document-governance map.

**Status:**
Current governance document.

**Reason:**
Replaces v1 and reflects the new canonical set.

**Action:**
Keep in `00_Current`.
Archive v1 after confirming this version is accepted.

---

## 4.5 Archive candidates

### K. Handoff summary
**File:** `Panoptes 引き継ぎ資料（重要設計まとめ）`

**Role:**
High-value handoff summary document.

**Status:**
Archive candidate after absorption.

**Reason:**
Its critical content has now been absorbed into:
- Master spec v3.4
- MVP integrated update
- memory/feed/monitoring product direction

It remains useful as historical provenance but should not remain a primary source-of-truth.

**Action:**
Move to `99_Archive` after confirming no missing content remains.

---

### L. Prior consolidation map
**File:** `Panoptes_File_Consolidation_Strengthening_Map_v1.txt`

**Role:**
Older governance map.

**Status:**
Superseded.

**Reason:**
It predates the new master spec structure and therefore no longer reflects the correct canonical hierarchy.

**Action:**
Move to `99_Archive` after adopting v2.

---

### M. Prior master spec
**File:** `Panoptes_Master_Spec_v3_3_Stability_Hardened.txt`

**Role:**
Older master spec.

**Status:**
Superseded but historically important.

**Reason:**
Still valuable as the stability-focused predecessor, but no longer the top-level canonical product definition after v3.4.

**Action:**
Move to `99_Archive` once v3.4 is accepted as active master.

---

## 5. Update Dependency Rules

When the master spec changes, the following documents must be reviewed.

### 5.1 Always review after master spec change
- MVP spec
- file consolidation map
- Codex implementation brief
- Codex short execution prompt

### 5.2 Review when product model change affects implementation
- DB migration
- Types/Zod
- API contract
- frontend state machine/store spec
- Svelte store skeleton

Not every master-spec update forces implementation changes immediately.
But every master-spec update requires at least a compatibility check.

---

## 6. Recommended Current Placement for the Files Visible in the User Folder

Based on the current observed file list, recommended handling is:

### Keep in active/current
- `Panoptes_Master_Spec_v3_4_StrategyOS_DB_Feed_Integrated`
- `Panoptes_MVP_Spec_Integrated_Update_vNext`
- `Panoptes_DB_Migration_v3_3_Complete.sql`
- `Panoptes_Types_Zod_v3_3_Complete.ts`
- `Panoptes_API_Contract_v3_3_Complete.md`
- `Panoptes Frontend State Machine Store Design v3.txt`
- `Panoptes Svelte Store Skeleton V3 3 Complete`
- `Panoptes Codex Implementation Brief V3 3`
- `Panoptes Codex Short Execution Prompt V3 3`
- `Panoptes_File_Consolidation_Strengthening_Map_v2`

### Move to archive after acceptance
- `Panoptes 引き継ぎ資料（重要設計まとめ）`
- `Panoptes_File_Consolidation_Strengthening_Map_v1.txt`
- `Panoptes_Master_Spec_v3_3_Stability_Hardened.txt`

### Keep temporarily until corresponding newer doc is physically added
If the newer replacement file is not yet exported into the file system, temporarily keep the previous file in place until replacement is confirmed.

This avoids losing the only accessible local copy.

---

## 7. Practical Adoption Sequence

Recommended sequence:

1. accept Master spec v3.4 as active master
2. accept this v2 consolidation map as active governance file
3. confirm MVP integrated update as active MVP canon
4. export / place any newer current docs into the local project folder if needed
5. move superseded files into `99_Archive`
6. optionally normalize filenames later

Do not archive old files before the newer replacements are physically available in the working document set.

---

## 8. Final Rule

A Panoptes file should be archived when all three are true:

1. its important content has been absorbed into a newer canonical document
2. its role is no longer needed as an active source-of-truth
3. a newer replacement is physically present and accessible in the current working set

If one of these is false, keep the file active temporarily.

This prevents accidental loss of working knowledge during document transitions.

