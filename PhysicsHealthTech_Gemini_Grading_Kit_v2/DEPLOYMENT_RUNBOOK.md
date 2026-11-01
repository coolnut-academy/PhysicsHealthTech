# DEPLOYMENT_RUNBOOK.md — Setup, deploy, smoke tests, rollback

## v2.0 Gradebook Release Gate
Block production score publishing unless approved real syllabus exists with 9 worksheet codes/grade, distinct Task maxima totaling exactly 100 per grade, rubric alignment and tested teacher identity. Run GR01–GR32 (and all v1 AC01–AC10), verify students see only their own published grades, pending|null distinctions, group individual score privacy, bonus cap, grade revision logs and exports. Backup Sheet grade rows and Drive evidence together and rehearse restore. A feature flag can keep gradebook unavailable while evidence upload is staged; never fabricate a real grade.

**Not a claim that any deployment has occurred.** Human owner must perform/authorize Google account actions.

## A. Environment prerequisites
- [ ] Decide and record D01/D02/D03 teacher/student identity and school-controlled owner.
- [ ] Prepare separate staging and production **Sheets, Drive roots, Apps Script projects**, with trusted editor/backup operators only; remove public sharing and anonymous Drive links.
- [ ] Review quota (execution, Drive storage, Apps Script project) in target school account; provision recovery operator.
- [ ] Use secure process to generate offline high-entropy HMAC keys and student initial secrets; NEVER paste real values into chat/source.
- [ ] Install supported `clasp` and Node tooling if using Git→Apps Script sync; verify current official commands locally.

## B. Project init in staging
1. Create dev Spreadsheet with restricted sharing; create private dev Drive root + Staging/Backups; record IDs in dev Script Properties, **not HTML**.
2. Create standalone Apps Script under approved school account (or alternate owner per D03), link standard GCP project only if necessary and approved.
3. Run idempotent schema migration in dev and verify tabs/headers/unique indexes; fill synthetic accounts, years, assignments only.
4. Configure `appsscript.json` with smallest scopes that cover required Sheets/Drive and Google sign-in approach. Review permission prompts.
5. Deploy **dev web app** with deliberately chosen access and execution identity; record settings and security consequences. Don't select execute-as-owner public access and presume Google ActiveUser identity exists.
6. Execute SP01–SP08; log actual results in `PROGRESS.md`, no invented URLs or accounts.
7. Run AC01–AC10 on staging; emphasize student A→B denial, teacher role bypass denial, private preview and 2570 year cloning.

## C. Production readiness
- [ ] D01/D02/D03 and privacy retention/aggregate decisions approved.
- [ ] Teacher login cryptographically proved in **the exact production deployment mode** and target browsers.
- [ ] Student credential/session security, throttling, reset/revocation, server authorization complete.
- [ ] Drive permissions/root inheritance reviewed; student file evidence not public.
- [ ] Safe HEIC handling tested with actual iPhone; JPEG fallbacks and retry UX demonstrated.
- [ ] 10/20/40 concurrency tests measured; acceptable policy adopted from results.
- [ ] Script execution quota and Drive storage adequate for expected simultaneous usage.
- [ ] End-to-end evidence + isolated backup-restore drill passes with correct ownership.
- [ ] Read-only archived year/legacy data behavior verified.
- [ ] No production student data in Git, dev, public GitHub Pages or error logs.
- [ ] School owner approves privacy notice/access/retention policy.

## D. Rollout protocol
1. Take pre-release backup of currently live workbook + private files, log source/target snapshots without exposing secret links.
2. Deploy versioned tagged release; use staged rollout with fake accounts first, then small consenting cohort, then rest of classes.
3. Perform smoke tests in production on synthetic/test accounts: student login, teacher login, evidence upload/preview, unauthorized A→B, year list and teacher roster matrix.
4. Monitor `AuditLogs`, upload journal, reconciliation, quotas and actual errors; if confidentiality/data corruption issue discovered disable affected deployment immediately.

## E. Rollback
- Stop new writes / disable old deployment; identify release version.
- Restore code to previous known-good Apps Script version (do not silently wipe new data).
- Do not restore Sheet from backup without planning merge of writes since snapshot. Stage and verify backup before data recovery.
- Revoke sessions and rotate keys on compromise; preserve audit information.
- Record incident in `PROGRESS.md` and school-approved incident log.

## F. Citation/reference
- Official web-app deployment: https://developers.google.com/apps-script/guides/web
- Official quotas: https://developers.google.com/apps-script/guides/services/quotas
- Official HTML RPC: https://developers.google.com/apps-script/guides/html/communication
- Official Google ID token validation: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
