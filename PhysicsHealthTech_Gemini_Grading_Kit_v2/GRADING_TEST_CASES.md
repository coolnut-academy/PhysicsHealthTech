# GRADING_TEST_CASES.md — Mandatory New Tests (all NOT RUN)

| ID | Scenario | Required outcome |
|---|---|---|
| GR01 | Import grade M4 8 or 10 worksheet rows | Reject publish; exactly 9 required |
| GR02 | Import 9 M4 and 9 M5 with approved codes, 20×100 meeting metadata | Accept structurally after Task totals pass; preserve grade separation |
| GR03 | Task full marks sum 99.50 or 100.50 | Reject publish; exact 100.00 for unique base Task IDs |
| GR04 | Task appears on W03 and W04 | Course score includes Task once; worksheet display may show twice |
| GR05 | Student has Task not graded | API returns `null/pending`, UI `รอตรวจ`, not zero |
| GR06 | Teacher explicitly scores and publishes zero | Score 0 displayed with state graded and full mark correct |
| GR07 | Teacher saves draft 8/10, not published | Student still sees `รอตรวจ`, teacher sees draft |
| GR08 | Teacher publishes 8/10, then edits to 9/10 with reason | Student shows 9/10; immutable old/new audit and revision chain |
| GR09 | Rubric criteria total inconsistent with Task component max | Reject server and no partial score publication |
| GR10 | Student crafts teacher grade RPC / modifies value from browser | Deny and no mutation |
| GR11 | Student A requests Student B's score, bonus, feedback or grade history | Deny without B metadata, via direct RPC and crafted IDs |
| GR12 | Submitted multiple photos / 3 versions | Worksheet submission count exactly 1 |
| GR13 | Submitted and not yet graded | Main status submitted, numeric marks blank, no automatic zero |
| GR14 | Teacher requests revision | Main status revision_required; feedback visible; overdue independent |
| GR15 | Student resubmits after revision | New immutable version, main status submitted, old marks not misrepresented as current |
| GR16 | Teacher grades linked Tasks partially | Main status submitted, secondary partial grading, Task-specific published marks visible |
| GR17 | Teacher grades all linked Tasks for current version | Main status graded; counts and dashboard update |
| GR18 | Due date crossed on a pending submission | Main state preserved; overdue badge only, respecting extension |
| GR19 | Bonus from coloring is published once, user has 99 base + 4 bonus | Effective course accumulated score = 100; raw base+bonus preserved in audit |
| GR20 | Duplicate bonus request or duplicate publish RPC | Idempotent outcome, no double credit |
| GR21 | Shared group points 12 and distinct member individual component scores | Each member receives appropriate shared+own individual result; peer marks hidden |
| GR22 | Group member removed/added after score publication | Historical member attribution frozen; change needs teacher reassessment |
| GR23 | Out-of-roster cross-grade submission | Upload accepted, teacher inbox flag, not silently in official scorebook |
| GR24 | Teacher reconciles out-of-roster correctly | Official grade allowed with audit; original submission attribution preserved |
| GR25 | Teacher matrix has rolls 1,2,10 and Task with 2 worksheet refs | Sorted numerically, no score duplication or worksheet count inflation |
| GR26 | New B.E. year created from prior year | Exactly 9 draft worksheets/grade, versioned new syllabus, prior grades untouched |
| GR27 | Export gradebook with pending grades and malicious student name `=cmd` | Pending empty/status, cell inert; only teacher can export |
| GR28 | Syllabus modified after publication | No silent current-year score rewrite; explicit migration/snapshot rules |
| GR29 | Course has all required Tasks graded and no eligible pending Tasks | Teacher finalization available; total max100 including bounded bonus |
| GR30 | One required Task pending | Finalization blocked; provisional accumulation displayed clearly |
| GR31 | Concurrent teacher grade updates | One canonical latest revision, conflict or retry; audit not lost |
| GR32 | Interrupted batch group publish | Consistency recovery, no half-published member marks visible |

**Execution evidence:** add PASS/FAIL/BLOCKED/NOT_RUN per case in `PROGRESS.md` with commands, environment, synthetic fixture identity, result summaries. No tests in this file have been run by preparing the package.
