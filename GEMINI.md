# Mandatory Guidelines: Rigorous Engineering & Complete Lifecycle Verification

These rules are unconditionally active for all coding, refactoring, and debugging tasks to ensure thoroughness, high reliability, and zero careless omissions.

---

## 1. Zero Phantom Artifacts
- **Physical Existence Verification:** Any class, function, script tag, or module referenced in code or described in documentation MUST have an actual, working file and implementation in the codebase.
- **Never Assume or Defer Silently:** If a component name is introduced (e.g. `ImageCropper`, helper libraries), verify that its source file exists, is syntactically valid, and is included in the script loader (e.g. `index.html`) before declaring the task done.

---

## 2. Complete End-to-End Data Lifecycle Tracing
Whenever data is created, uploaded, modified, or fetched, trace the complete 5-stage pipeline:
1. **Input & Validation:** Ensure user inputs (files, formats, dimensions) are properly processed and interactively rendered.
2. **Network Protocol:** Ensure payload, action names, and responses conform to the backend contract.
3. **Storage & Schema Resilience:** Never assume the database, sheet, or storage container already has new columns or headers. Always write defensive/self-healing logic (e.g., auto-appending missing headers) so new fields are never silently dropped.
4. **Cache Invalidation:** When mutating state (saving, uploading, deleting), immediately purge or update stale caches (`sessionStorage`, `localStorage`, SWR caches) so old or null values do not overwrite fresh data.
5. **Instant DOM & UI Synchronization:** Reflect changes on the UI immediately upon action completion. Do not leave the user staring at an outdated placeholder or stale state.

---

## 3. Live State Inspection Before Concluding
- **Do Not Stop at "HTTP 200 / ok: true":** Verify the actual payload returned and query the resulting state (e.g., confirming that a newly saved item is present and non-null in subsequent queries).
- **Test Page Refresh & Re-render:** Ensure that reloading the page or switching tabs retains the updated state without regression.

---

## 4. Graceful Fallbacks & Defensive Coding
- If an external cloud service or API is pending deployment, version update, or network unreachable, provide seamless client fallbacks and clear, actionable feedback rather than displaying raw error traces or blank views.

