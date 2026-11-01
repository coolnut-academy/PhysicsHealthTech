# TEST_PLAN.md — Acceptance, security, device and recoverability testing

## v2.0 Grading Acceptance (additional mandatory cases)
**Add `GRADING_TEST_CASES.md` GR01–GR32** to original AC01–AC10 and security/data cases. All must have actual PASS/FAIL/BLOCKED/NOT_RUN proof; no tests are run by writing these documents. New release blockers: guessed real Task values, syllabus sum != 100, double counted Task, pending/null coerced to 0, student scoring rights, student peer score leakage, regrade without audit, mixed group/individual scores, unapproved bonus, grade publish without evidence/version validation.

**Status:** Test specification only; NOT executed.

## Test environments
- Dev and staging use synthetic student/teacher accounts, isolated Sheets + private Drive roots.
- Production acceptance uses authorized accounts and carefully controlled test submissions, not copies of real student data in public test runners.
- Desktop browsers: current Chrome/Firefox, teacher 1024/1440 CSS px. Phones: real iPhone Safari with camera HEIC/JPEG variations, Android Chrome; simulated slow network and interrupted uploads.
- All negative auth tests call backend **directly** via crafted RPC, bypassing hidden buttons.

## A. Mandatory Brief B Acceptance Cases (10/10 mapped)
| ID | Scenario | Required outcome | Phase |
|---|---|---|---|
| AC01 | Student A replaces own evidence_ref / submission ID with B's, including old versions or direct RPC | `ACCESS_DENIED`; no file bytes, name, Drive URL or metadata of B | P1/P2/P4 |
| AC02 | Attacker knows B's 5-digit code but not independent secret | Login denied; durable throttling and generic error; no enumeration | P1 |
| AC03 | Teacher selects year 2570, M4, room; submissions and non-submissions | Sorted numeric roll_no; correct roster denominator; status text | P3 |
| AC04 | Authenticated student enrolled M4/2569 submits open M5/2570 assignment | Permitted, flagged out-of-roster, visible teacher separately, excluded from roster completion metrics | P2/P3/P5 |
| AC05 | Create 2570 from templates after 2569 has evidence | Exactly two grade workspaces and proper cloned assignment count in new year; 2569 bytes/IDs unchanged; duplicate create safe | P5 |
| AC06 | Re-submit worksheet and prompt, add individual and group artifacts | All versions retrievable by authorized owners/group teachers; immutable prior versions | P2/P4 |
| AC07 | Upload success and forced Drive/Sheet failures | User sees honest success/error; no completed metadata pointing to missing file; repair can reconcile | P2 |
| AC08 | 10–40 simulated concurrent submitters; teacher soft-delete by mistake | No duplicate version/operation or lost submission; restore available, audit preserved | P2/P3/P5 |
| AC09 | Student invokes `teacher.*` endpoint with forged role / modified browser JS | Denied with no mutation; teacher access based only on server-verified identity | P1/P3 |
| AC10 | iPhone camera, HEIC fallback, slow network, short session expiry | Clear preview/error/retry and session UX; no silent data loss or fake 100% progress | P2/P5 |

## B. Expanded security and boundary cases
| ID | Test | Required outcome |
|---|---|---|
| SEC01 | Missing, expired, revoked, malformed session | Fail closed; no data |
| SEC02 | Student changes client `student_uid`, `owner`, `role`, `year`, `grade`, `group_id` | Server ignores or rejects forged authority; resolves resource from storage |
| SEC03 | Teacher email/Google JWT payload manually changed, wrong audience/issuer/expiry, fake `sub` | Teacher login denied |
| SEC04 | Student guesses evidence ref of an active/archived/soft-deleted B record | Denied for all states |
| SEC05 | Student from group X opens Y; X member removed then opens X | Deny outsider and revoked member; audit membership changes |
| SEC06 | `=HYPERLINK(...)` or leading formula sigils in title/prompt | Written as inert text to Sheets; rendered as inert text to page |
| SEC07 | `<img onerror=...>` embedded in prompt, review comment or title | No script executed; session safe |
| SEC08 | Invalid media (SVG/HTML renamed JPG, oversized file, HEIC unsupported) | Rejected / useful fallback; no permanent object |
| SEC09 | Public Drive root/subfolder/file permissions accidentally changed | Health check detects; release blocked |
| SEC10 | Rapid incorrect logins for one account and global volume | Throttle persists across executions; no account enumeration |
| SEC11 | Student requests teacher roster/student search/whole-sheet dump | Denied by server, even with crafted RPC |
| SEC12 | URL `javascript:` or hostile HTML in GitHub link field | Rejected; safe external link handling |

## C. Data/functional cases
| ID | Test | Required outcome |
|---|---|---|
| DATA01 | Code `00007` stored/read, CSV roster import | Leading zeros preserved |
| DATA02 | Room rolls 1, 2, 10, 11 | Numeric ordering, not lexicographic |
| DATA03 | One person has enrollments in more than one year | Same student_uid, correct roster in each year |
| DATA04 | Out-of-roster submission and subsequently enrollment update | Recomputed reconciliation; original submit flag preserved in version/audit; no phantom completion |
| DATA05 | Two students simultaneously submit their own work to same assignment | Both versions persist with correct owners; no lock corruption |
| DATA06 | Same student double taps upload/complete | Single committed version for idempotency key |
| DATA07 | Year creation interrupted after only M4 templates | Retry completes M5 without duplicate M4; previous year untouched |
| DATA08 | Teacher changes master template after prior years published | Existing Assignments unchanged; next clone uses intended revision |
| DATA09 | Teacher deletes then restores submission | Restored association, files, version history and audit; no hard delete |
| DATA10 | Student tries to add second project to same group round; second individual project | Duplicate group project denied; second individual project permitted |
| DATA11 | Assignment closed and year archived | Historical own data readable; new submissions denied unless policy reopens |
| DATA12 | Missing Drive file referenced by Sheet | Reconciliation reports and shows controlled unavailable state; no false successful preview |

## D. Performance and network
- Load trials: 10, 20, 40 concurrent clients with independent authenticated sessions and normalized 1–2 MiB photos, record p50/p95 submission latency, success/timeout/lock failures, quota exception rate and orphan counts. **No fixed performance claim before testing.**
- Evaluate Sheets scan latency over synthetic 5 academic years × 2 grades × 80–150 students × 20+ assignments (vary room size and number of versions); assert page responsive with pagination and caching.
- Mobile: 3G-like network throttling, interrupted network mid-request, phone background/screen lock, session expires during upload, camera permission denied, iPhone HEIC + JPEG, 200% zoom and 360px wide screens.
- Privacy: assure no teacher credentials/student data cached in public files, indexed search, browser URLs, error dialogs or server logs.

## E. Backup + disaster recovery
- Restore complete versioned row and its Drive file into **isolated** staging environment; verify view matches checksum, correct owner and year, access checks still deny B.
- Simulate partial backup, orphan `staging` Drive file, missing `SubmissionFiles` row, duplicate commit retry, accidentally trashed file, failed year-clone.
- Verify retention and delete policy before any permanent removal; preserve immutable AuditLogs in recovery.

## F. Test execution register (fill during implementation)
| Category | Planned | Passed | Failed | Evidence URI / test run |
|---|---:|---:|---:|---|
| Brief B acceptance (AC01–AC10) | 10 | 0 | 0 | Not run |
| Security expansion (SEC01–SEC12) | 12 | 0 | 0 | Not run |
| Data/functional (DATA01–DATA12) | 12 | 0 | 0 | Not run |
| Load/devices/backup | See checklist | 0 | 0 | Not run |

## Release blockers
Any unauthorized data access, evidence public-link exposure, fake teacher authorization, lost/overwritten version, inability to restore, inconsistent year clone, or untested teacher authentication deployment is an unconditional production release blocker.

## G. v2 test register (additional)
| Category | Planned | Passed | Failed | Status |
|---|---:|---:|---:|---|
| Gradebook cases GR01–GR32 | 32 | 0 | 0 | NOT RUN |

Score publishing is release-blocked while latest teacher-approved syllabus and weights are unavailable.
