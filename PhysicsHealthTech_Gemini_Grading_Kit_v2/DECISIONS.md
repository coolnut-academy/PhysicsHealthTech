# DECISIONS.md — Architecture decision log and unresolved gates

## v2.0 New decision gates (unresolved, do NOT invent)
| ID | Topic | Proposed baseline | Owner-dependent release gate |
|---|---|---|---|
| D15 | Official latest Course Syllabus | Teacher-approved Task codes/weights/rubrics/links per grade, 9 worksheets, 20×100, 100 total | **NOT PROVIDED**; production score publish BLOCKED until verified |
| D16 | Rubric/Task grading version | Teacher save draft → Publish; pending=null, 0 only explicit | Confirm required Tasks and release review policy from Syllabus |
| D17 | Optional coloring bonus | Audited separate BonusAwards, course cap100, deduplicated | Confirm maximum eligible award and per-worksheet rules |
| D18 | Resubmission/grading behavior | New evidence version requires re-review, preserve old published audit | Confirm carry-forward exceptions / grade visibility |
| D19 | Out-of-roster score rule | Cross-year upload allowed; official gradebook requires teacher reconciliation | Confirm whether nonofficial review can occur |
| D20 | Group shared/individual score | Frozen member snapshot + individual privacy + one real group presentation | Confirm split/weights from Syllabus |

All other D01–D14 remain valid.

**Planning status:** Owner decisions are intentionally not assumed or fabricated.

| ID | Topic | Proposed choice | Decision needed / risk |
|---|---|---|---|
| D01 | Student sign-in | 5-digit text code + random ≥12-char independent secret, rate limiting and teacher reset | **Owner approval**; if insisting on 6–8 digit PIN, approve greater risk and security design first |
| D02 | Teacher identity | Verified Google OIDC (production signature verifier; not tokeninfo) + explicit teacher allowlist, or identity-tested separate admin deployment | **MANDATORY experimental POC** in Apps Script HTML Service iframe and actual school accounts before committing |
| D03 | Deployment account | School-controlled Google account/Workspace with restricted Drive and Sheet | Confirm owner, drive quota, continuity and backup operator |
| D04 | Image policy | Max 2 MiB per normalized image, 3 images/version, JPEG/PNG; client preview and HEIC fallback | Confirm count/size after actual student worksheet sampling and iPhone tests |
| D05 | Academic year | B.E. integer; create in draft; teacher publishes | Confirm first opening year and template availability |
| D06 | Version editing | Append versions while assignment/year open or teacher grants re-open; old versions always visible | Confirm retention policy and whether student can add vs replace display only |
| D07 | Group round | One project/group/round/year/grade; teacher creates groups | Confirm if only one PBL round/year or multiple distinct rounds |
| D08 | Aggregate privacy | Hide small cohort counts below chosen threshold, default suggested N≥5; never list peer data | Choose minimum display threshold with school privacy policy |
| D09 | Retention/backup | Soft delete; periodic snapshots; tested restore in isolated environment | Choose retention years, backup frequency, deletion owner and lawful school process |
| D10 | Public links | HTTPS GitHub Pages website only, no student PII/health data; validate URLs | Decide whether students may use GitHub custom domains and acceptable content |
| D11 | Teacher statuses | Evidence review only: submitted / evidence confirmed / needs revision | Confirm whether teacher can reopen closed assignments per learner or globally |
| D12 | Out-of-roster reconciliation | Preserve cross-year submissions, separate tray, no roster numerator inflation | Confirm whether teacher may explicitly map a correction to student's roster vs leave flagged |

## Release gates
- **Gate A (P1):** D01, D02, D03 decided and tested (teacher auth POC, 5-digit not standalone).
- **Gate B (P2):** D04 and D06 decided and real iPhone upload/preview tested.
- **Gate C (P4):** D07 decided and group membership intrusion tested.
- **Gate D (P5):** D05, D08, D09, D12 decided, backup restore + cross-year acceptance completed.

## ADR-001: HTML Service over separate GitHub Pages portal
Reason: same-origin Apps Script RPC simplifies front-to-back communication, avoids common cross-origin/CORS headaches; GitHub Pages remains for public **student creations**. Cost: iframe sandbox, restrictive integrations, server-side quota and limited binary serving.

## ADR-002: One workbook, normalized tabs, immutable versions
Reason: stable cross-year account identity, consolidated teacher oversight, archives and simple year cloning. Cost: manual constraints/indexing, concurrent write handling and backup/reconciliation responsibility.

## ADR-003: Authorized previews, no public Drive links
Reason: prevent peer-to-peer ID guessing and inadvertent global access. Cost: base64 payload overhead and performance limits; mitigate with strict file budgets, thumbnailing and load tests.

## ADR-004: Roster not permission gate
Reason: user explicitly requires cross-year/cross-grade submissions. Statistics only use `Enrollments`, and reconciliation must not conflate a submission by an out-of-roster student with a missing roster student's work.


## D13 — Security token entropy and provisioning (P0 hard gate)
**Proposed, not approved:** independent high-entropy credentials generated via a trusted CSPRNG tool (potentially offline, teacher-issued) and server HMAC verifier; session tokens derived from offline-provisioned high-entropy HMAC key plus server-serialized unique counter. Validate cryptographic requirements and secure distribution/revocation. Apps Script `Utilities.getUuid()` or `Math.random()` alone is **not** accepted as proof of CSPRNG security.

## D14 — File/image transfer feasibility (P0/P2 hard gate)
**Not tested:** server-mediated binary preview and 2-MiB-file upload from real iPhone. Original normalized size/count are provisional. Run SP04–SP06 and adjust limits based on evidence, without making Drive images public.
