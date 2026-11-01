# TRACEABILITY_MATRIX.md — Requirements → implementation → tests

## v2.0 Gradebook Traceability
| New requirement | Module | Screen(s) | Test IDs | Phase |
|---|---|---|---|---|
| Nine worksheets, syllabus Task/100 | Syllabus import/validator, TaskDefinitions | T05/T15 | GR01–GR04, GR28 | P0/P1/P3/P5 |
| Student own pending vs graded score | GradeEntries, Student Dashboard | S02/S04/S10 | GR05–GR08, GR11, GR13, GR17 | P2/P3 |
| Four statuses / overdue | Submission+Grading projection | S02/S05 | GR12–GR18 | P2/P3 |
| Bonus/100 cap | BonusAwards/ScoreEngine | S02/T12 | GR19–GR20, GR29–GR30 | P3/P5 |
| Group vs individual marks | GroupScoreComponents/Snapshots | S08/T09/T12 | GR21–GR22, GR32 | P4 |
| Cross-year/out-of-roster | Enrollment reconciliation | S04/T08 | GR23–GR24 | P2/P3/P5 |
| Teacher-only gradebook and export | Gradebook/Authorization | T03/T14 | GR10–GR11, GR25–GR27, GR31 | P1/P3/P5 |


| Business rule | Core modules | Screen(s) | Test IDs | Delivery phase |
|---|---|---|---|---|
| Authenticated student can see own evidence only | Auth, Authorization, Evidence | S05/S06 | AC01, SEC01, SEC02, SEC04 | P1/P2 |
| Five-digit code alone not proof of identity | Auth, RateLimit, Sessions | S01 | AC02, SEC10 | P1 |
| Teacher identity and server-only privilege | Auth, Policy, Teacher API | T01–T11 | AC09, SEC03, SEC11 | P1/P3 |
| Roster matrix numeric order/missing derivation | Enrollments, Matrix | T02/T03 | AC03, DATA02, DATA03 | P3 |
| Cross-year/grade submitted by authenticated users | Assignments, Submissions | S04/S05/T08 | AC04, DATA04, DATA11 | P2/P3/P5 |
| Out-of-roster excluded from roster numerator | Enrollments, OutOfRoster | T08/T03 | AC04, DATA04 | P3/P5 |
| New year draft clone M4+M5 no overwrite | AcademicYear, Templates | T06 | AC05, DATA07, DATA08 | P5 |
| All submission/portfolio versions retrievable | SubmissionVersion, ProjectArtifact | S06/S07/S08/T04 | AC06, DATA10 | P2/P4 |
| Upload data consistency/repair | UploadOperation, Drive | S05/T11 | AC07, DATA06, DATA12 | P2/P5 |
| Concurrency + safe restore | Lock, Audit, Backup | T10/T11 | AC08, DATA05, DATA09 | P2/P5 |
| Group membership/privacy | Groups, ProjectMembers, Authorization | S08/T09 | SEC05, DATA10 | P4 |
| Mobile camera/HEIC/slow network | Upload UX/preview | S05 | AC10, SEC08 | P2/P5 |
| Public content is safe and appropriately validated | Project URL + text sanitization | S07/S08 | SEC06, SEC07, SEC12 | P4 |
| Aggregate stats not expose small-group identities | Stats service | S02 | SEC11 + manual privacy test | P3/P5 |

## Test evidence protocol
- `NOT_RUN`: planned but not executed.
- `PASS`: tested with actual assertion and saved log/commit/build/device details.
- `FAIL`: case executed and failing.
- `BLOCKED`: cannot execute due to environment/owner gate, never implicitly PASS.

At each phase update: module links/filenames, test runner command, case status, environment (mock/dev/production), evidence location, known limitations. A passing unit test does **not** assert passing actual iPhone or deployed server integration.
