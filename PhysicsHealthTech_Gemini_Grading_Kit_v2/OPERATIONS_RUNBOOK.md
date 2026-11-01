# OPERATIONS_RUNBOOK.md — Long-term maintenance, recovery, archiving

## v2.0 Gradebook Operations
Maintain published syllabus snapshots, approved score revisions, member attribution snapshots and bonus audits in backups; reconciliation must flag partial grade publish, missing rubric/Task refs, double-counted Task or repeated bonus, invalid course sum, and out-of-roster score entries. Provide a teacher-only workflow to correct scores with required reason and read-back; no direct Sheet cell edits as the operational grading UI. Exports must be private, audited and CSV injection safe.


## Weekly teacher/admin checks
- Review failed uploads, files stuck in staging, missing Drive references, duplicate idempotency keys and pending out-of-roster items; dry-run reconciliation before any mutation.
- Confirm backup last-success timestamp and backup destination permission isolation; record errors.
- Review suspicious login throttling, privilege denial frequency and revoked teachers; avoid storing raw passwords/IP assertions.
- Check quota consumption/errors against target account limits and Drive storage; follow incident playbook on failures.

## New academic year
1. Verify templates and naming received from teaching-document team; import metadata only (not answer keys).
2. Press teacher-only `สร้างปีการศึกษาใหม่` and preview both M4/M5 changes, including template revision; confirm BE year.
3. Backend idempotently builds year draft, both grades, assignments. If interrupted, retry with same operation ID; never clone duplicates.
4. Teacher checks assignments, enrollment roster, assignment status. Publish year separately.
5. Previous year remains in archive, readable to its authorized students; ensure data can still be found even if a student is now in another grade.

## Backup and restore policy framework (owner must choose frequency/retention)
- Snapshot private Spreadsheet and Drive student evidence under school-approved private backup path; preserve all version links or a mapping manifest.
- Use append-only snapshot catalog: backup ID, timestamp UTC, source project, versions, bytes/files counted, checksum manifest, operator, status.
- Backups alone aren't enough; **restore test** to a separate staging workbook/Drive tree and verify access rules, year mapping, file integrity.
- Never publish raw backups or share backup folder with students. Old backups have retention/security obligations.
- Exact data retention years and lawful school basis require school decision; do not invent a PDPA policy or purge automatically.

## Incident responses
- Unauthorized evidence disclosure → disable affected deployment, revoke sessions, remove Drive sharing, preserve logs, notify authorized school officers per policy, restore only verified permissions.
- Missing file / metadata corruption → freeze affected operation, report student-friendly unavailable state, run dry-run reconciliation, restore from backup or manually resolve with audit.
- Script quota failure → nondeceptive UI error, throttle/queue retries; don't silently mark successful uploads.
- Concurrent version conflict → retry with same idempotency key after status lookup; never create duplicate versions.
- Suspicious authentication → lock/rotate compromised account safely, revoke its sessions, teacher-admin reset path, protect against account enumeration.

## Data changes
- Any schema migration is versioned and can run idempotently; backup before change and validate old snapshots.
- AuditLog immutable metadata; don't include unredacted file bytes/long student prompts or secrets in logs.
- Student deletion = soft delete first; permanent purge is separate audited school policy action (never routine automatic delete).

## Project exit / handoff
- Source repository with phase progress, verified deployment IDs stored securely outside Git, backups, ops owner, privacy policy, restore documentation, security test evidence and known limitations.
