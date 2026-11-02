# Mandatory Guidelines: Rigorous Engineering & Complete Lifecycle Verification

These rules are unconditionally active for all coding, refactoring, and debugging tasks to ensure thoroughness, high reliability, zero phantom artifacts, and zero band-aid loops.

---

## 1. Zero Phantom Artifacts
- **Physical Existence Verification:** Any class, function, script tag, or module referenced in code or described in documentation MUST have an actual, working file and implementation in the codebase.
- **Never Assume or Defer Silently:** If a component name is introduced (e.g. `ImageCropper`, helper libraries), verify that its source file exists, is syntactically valid, and is included in the script loader (e.g. `index.html`) before declaring the task done.

---

## 2. Root Cause First vs. Band-Aid Avoidance
- **Never Mask Database Flaws with Client Caches:** If data disappears after a page reload or refresh (`F5`), DO NOT rush to write client `localStorage` workarounds or force DOM overrides. Inspect the **Source of Truth (Database / Sheets / Storage)** first.
- **The Simplest Direct Fix at the Source:** Check if the physical table/schema simply lacks columns. Often, adding missing columns at the source solves the problem in seconds with 100% reliability, without introducing fragile client synchronization logic.
- **Display State != Persistent State:** Rendering an element on screen after a click only proves the UI was updated; it does NOT prove persistence.

---

## 3. The "Silent Dropped Column" Trap
- In dynamic mapping systems (Google Sheets, CSVs, NoSQL):
  - Mapping an object to row values based on existing table headers silently drops new properties if the column header is missing in row 1, without returning any error.
  - Always verify that the physical database schema contains all required fields of the data model.

---

## 4. Complete End-to-End Data Lifecycle Tracing
Whenever data is created, uploaded, modified, or fetched, trace the complete 5-stage pipeline:
1. **Input & Validation:** Ensure user inputs (files, formats, dimensions) are properly processed and interactively rendered.
2. **Network Protocol:** Ensure payload, action names, and responses conform to the backend contract.
3. **Storage & Schema Resilience:** Never assume the database, sheet, or storage container already has new columns or headers.
4. **Cache Invalidation:** When mutating state (saving, uploading, deleting), immediately purge or update stale caches (`sessionStorage`, `localStorage`, SWR caches) so old or null values do not overwrite fresh data.
5. **Instant DOM & UI Synchronization:** Reflect changes on the UI immediately upon action completion. Do not leave the user staring at an outdated placeholder or stale state.

---

## 5. Live State Inspection Before Concluding
- **Do Not Stop at "HTTP 200 / ok: true":** Verify the actual payload returned and query the resulting state (e.g., confirming that a newly saved item is present and non-null in subsequent queries).
- **Test Page Refresh & Cold Reload:** Ensure that reloading the page or starting from a fresh session retains the updated state without regression.
- **Remote Synchronization:** If running against a deployed or hosted web client (e.g. GitHub Pages), ensure the commit is pushed to `origin/main` before asking the user to test.
