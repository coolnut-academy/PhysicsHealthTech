# REPOSITORY_STRUCTURE.md — Intended source layout after the agent starts coding

## v2.0 Code Layout Extensions
When implementing, add domain modules e.g. `server/domain/syllabus`, `server/domain/grades`, `server/domain/bonuses`, `server/domain/groupScoring`, `server/domain/metrics`; UI modules for student `dashboard/scores` and teacher `gradebook/rubric/syllabusImport`; synthetic Task fixtures and GR01–GR32 tests. Source-code tree is still a proposal; ZIP contains docs only.


```text
physicshealthtech/
├── GEMINI.md                     # agent contract
├── 00_GEMINI_MASTER_PROMPT.md
├── 02_WEBAPP_CONTEXT.md          # product requirements source
├── docs/                         # move supplementary Markdown here only after updating references
├── appsscript.json               # explicit reviewed scopes, no credentials
├── .clasp.json                   # local only; exclude from Git if it contains sensitive IDs
├── .claspignore
├── .gitignore
├── package.json                  # only dev tooling; no React bundler unless approved
├── src/
│   ├── server/
│   │   ├── Entry.gs             # doGet and one allowlisted api action dispatcher
│   │   ├── AuthService.gs
│   │   ├── Authorization.gs
│   │   ├── SessionService.gs
│   │   ├── RateLimitService.gs
│   │   ├── StudentService.gs
│   │   ├── AcademicYearService.gs
│   │   ├── AssignmentService.gs
│   │   ├── SubmissionService.gs
│   │   ├── ProjectService.gs
│   │   ├── RosterService.gs
│   │   ├── EvidenceService.gs
│   │   ├── SheetRepository.gs
│   │   ├── DriveRepository.gs
│   │   ├── AuditService.gs
│   │   ├── SchemaMigrator.gs
│   │   ├── BackupService.gs
│   │   └── Config.gs
│   ├── client/
│   │   ├── Index.html
│   │   ├── Styles.html          # Apps Script HTML includes or bundled CSS
│   │   ├── Scripts.html         # Apps Script HTML includes or bundled Vanilla JS
│   │   ├── views/
│   │   └── components/
│   └── shared/
│       └── contracts/           # pure JS data validation helpers (testable)
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── security/
│   ├── e2e/
│   └── fixtures/                # synthetic-only names/codes/images
├── scripts/
│   ├── dev-bootstrap/           # developer helper commands; no production secrets
│   └── qa/
└── .github/
    └── ...                     # optional; no workflows unless needed and owner approved
```

## Important implementation notes
- `clasp` files/manifest packaging depend on Apps Script runtime; keep actual deployable `.gs`, `.html` flattened or systematically bundled by tested build script. Don't assume nested file layout transfers 1:1 into the Apps Script editor without tooling.
- Apps Script client code in HTML Service must use the documented `google.script.run` bridge; do not blindly use REST fetch with unapproved CORS assumptions.
- Unit tests should isolate pure logic and provide mocks for `SpreadsheetApp`, `DriveApp`, `LockService`, `PropertiesService`, `Utilities`, etc. Integration/device tests must use actual dev resources to make real claims.
- Source, fixtures and logs must not contain actual student data, passwords or production credentials.
- Only public Apps Script entrypoints intended for browser use; audit all global `.gs` functions and prevent exposed helper functions (private trailing underscore).
- `doGet` must not leak teacher or student data before authenticated API calls; protect HTML template substitutions.
