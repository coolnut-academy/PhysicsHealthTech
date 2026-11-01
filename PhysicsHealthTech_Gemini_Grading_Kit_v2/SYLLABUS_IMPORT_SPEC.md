# SYLLABUS_IMPORT_SPEC.md — Authoritative Task & Point Mapping

## Goal
Convert the latest teacher-approved Course Syllabus into immutable, versioned course configuration for `M4` and `M5`, not hand-coded Task scores. This package **does not contain actual real-world Task weights**. An AI must not infer numbers from examples or distribute 100/9.

## Required syllabus metadata per academic year and grade
`academic_year_id`, `grade`, `syllabus_version_id`, `source_name`, `source_checksum`, `teacher_approved_by`, `approved_at`, `course_max_points=100`, `session_count=20`, `minutes_per_session=100`, `state=draft|validated|published|retired`.

## Worksheet rows (exactly nine unique per grade)
- Fields: `worksheet_code`, `title`, `grade`, `worksheet_order` (1..9), `session_start`, `session_end`, `submission_policy`, `due_at`, `required_evidence`, `status`.
- M4 codes `PHT4-W01` through `PHT4-W09`; M5 codes `PHT5-W01` through `PHT5-W09`.
- `session_start`/`session_end` must be between 1 and 20 inclusive. Not every meeting must have a new worksheet; 9 worksheets can span 20 meetings.

## Task definitions (one logical assessed item per syllabus version)
Required: `task_code`, `title`, `assessment_type`, `max_points`, `scoring_scope=individual|group_shared|group_individual|mixed`, `rubric_id`, `component_config`, `publication_rule`, `required`, `category`, `sort_order`.
- Example code syntax shown by user (`T4-03A`, `T5-03A`) is only an illustration, **not proof these codes are in the missing syllabus**.
- Full marks decimal precision in points (suggest 2 decimal places) as **integers of hundredths in computation**; refuse NaN, negative values, mixed precision or over-max scores.
- `mixed` requires components whose maximum sums to exact `task.max_points`, with each component explicitly marked shared or individual.

## Worksheet↔Task mapping
`worksheet_code`, `task_code`, `evidence_relation=primary|supporting`, `display_order`; unique `(syllabus_version_id,worksheet_code,task_code)`.
- The same Task may support several worksheets, but `course_total` sums **distinct Task IDs** once. A Task cannot be duplicated by copying the worksheet record.
- A Task may be related to individual project, group project or presentation artifact; link via `AssessmentEvidenceLinks` without inventing extra score rows.

## Rubric
`rubric_id`, `criterion_code`, `criterion_title`, `criterion_max_points`, `scoring_component`, `ordinal`, `guidance`.
- Sum criterion maxima equals the appropriate Task/component maximum. Grading by rubric must produce exactly one canonical graded Task score.

## Validation & publish gate
1. Parse latest syllabus file as *teacher reviewed* structured JSON/CSV import; no guessed marks or names.
2. Validate grade, exactly 9 worksheet IDs, no duplicate Task IDs, stable year snapshot, 20 sessions ×100 minutes.
3. Sum **distinct required base Task maxima** using integer point units: **exactly 100.00 points** per published course; never add bonus capacity to that 100. Check component/rubric consistency.
4. Ensure all worksheet-to-Task refs exist, no dangling project/presentation assessment links, no duplicate rubric/score path.
5. Print a dry-run report with rows, total max, linked worksheet IDs, duplicate warnings, score source checksum, and teacher approval details.
6. Require verified teacher/admin action for publish; preserve previous published version/scores. If changing a published syllabus, do explicit migration and score-impact review. **Never silently rescale old grades**.
7. Fail closed on missing or mismatched authoritative syllabus. Continue frontend/schema/tests only with clearly labeled **synthetic** Tasks, cannot mark production grade release passed.

## Owner input request (to resolve in project, not a reason to invent)
Please provide the final latest M4/M5 syllabus or verified Task mapping when available. Until then record `D15: SYLLABUS_PENDING` and use fixed synthetic example Tasks solely in tests, clearly not copyable to production.
