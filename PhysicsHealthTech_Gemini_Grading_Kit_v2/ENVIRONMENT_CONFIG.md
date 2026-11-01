# ENVIRONMENT_CONFIG.md — Configuration and secret handling contract

## v2.0 Environment Flags and Secrets
Add non-secret config flags `GRADING_ENABLED=false` until approved Syllabus + tests, `SYLLABUS_IMPORT_ENABLED` admin-only, `BONUS_ENABLED` per teacher-approved policy; store actual approved syllabus version/checksum in restricted configured data. No API key or arbitrary client flag grants grade permission; verifying teacher session remains mandatory. Never commit student grades or actual roster in fixtures.


## Environments
| Environment | Data | Access | Deploy |
|---|---|---|---|
| local/unit | synthetic, in-memory mocked Sheets/Drive | developers only | none |
| dev/staging | dummy accounts in separate Sheet and Drive | approved testers | separate Apps Script project/deployment |
| production | real student/teacher restricted records | authorized users | distinct project + restricted Drive/Sheet |

## Config names (not actual secrets)
| Name | Where | Secret? | Purpose |
|---|---|---:|---|
| `ENVIRONMENT` | Script Properties | no | `dev` or `production` |
| `DATA_SPREADSHEET_ID` | Script Properties | sensitive operational identifier, not a password | Google Sheets workbook metadata |
| `PRIVATE_DRIVE_ROOT_ID` | Script Properties | sensitive operational identifier | private evidence root |
| `BACKUP_DRIVE_ROOT_ID` | Script Properties | sensitive operational identifier | restricted backups |
| `SESSION_SIGNING_KEY` | Script Properties | **YES** | high-entropy offline-provisioned session HMAC root; rotate safely |
| `STUDENT_PEPPER_KEY` | Script Properties | **YES** | high-entropy offline-provisioned student-secret verifier key |
| `GOOGLE_OIDC_CLIENT_ID` | Script Properties | public identifier; config | expected `aud`, if chosen OIDC approach |
| `ALLOWED_WORKSPACE_HD` | Script Properties | config | optional Workspace restriction, not sole teacher proof |
| `MAX_IMAGE_BYTES` | Script Properties | config | provisional 2 MiB **normalized file** |
| `MAX_IMAGES_PER_VERSION` | Script Properties | config | provisional 3 |
| `STUDENT_SESSION_IDLE_MIN` | Script Properties | config | provisional 30 |
| `STUDENT_SESSION_ABSOLUTE_HR` | Script Properties | config | provisional 8 |
| `PUBLIC_AGGREGATE_MIN_COHORT` | Script Properties | config | provisional 5; needs school approval |

## Rules
1. Place **actual** secret values only in proper secret provisioning UI; do not commit plaintext, screenshots, copied logs or student real IDs.
2. Do not confuse spreadsheet ID with an API token: ID itself is not an authentication secret, but publication still exposes internal inventory.
3. Config loader validates presence and lengths/types, fails closed in production; dev mocks must be labeled and never imported into production app.
4. Web deployment `execute as` and `access` options must match recorded decisions and P0 experiments; no unattended switch to publicly owned data.
5. Teacher allowlist must be maintained only by validated admin pathway or private admin configuration; if Workspace OIDC, store stable Google `sub` and optional verified `hd`, never trust email string alone.
6. With file privacy, owner-only Google Drive/Sheet access is compatible with execute-as-owner model **only if separate app authz is rigorously enforced**; never share workbook with every student.
7. Record actual Apps Script OAuth scopes in manifest and review that no excessive services are requested; avoid storing deployment URL in student logs with private tokens.
