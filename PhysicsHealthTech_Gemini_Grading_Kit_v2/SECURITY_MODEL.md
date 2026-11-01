# SECURITY_MODEL.md — Threat model, identity and evidence privacy

## v2.0 Grading Threat Boundary
- คะแนน, feedback รายบุคคล, rubric drafts, teacher gradebook exports = **student private data**; `student_uid`, `grade_entry_id`, teacher identity, peer group marks never accepted as permission from client. Test direct RPC IDOR for score, bonus, grade revisions and exports.
- Only authenticated verified teacher actions may save drafts, publish/correct/void grades, award bonus, approve syllabus and export. A hidden client button is not authorization.
- Publish/modify grade requires audit immutable old/new score, teacher ID, reason for regrade, idempotency and expected revision. Draft invisible to student; null pending != 0; group members cannot see others' individual marks.
- Score for out-of-roster submission must not silently enter enrolled course gradebook: manual verified reconciliation is prerequisite. Keep evidence-only cross-year submit policy unchanged.

**Security gate:** no production release until chosen auth design is experimentally validated in actual Apps Script deployment mode.

## 1. Assets, actors and threats
**Assets:** student identity/name, individual evidence images, prompts/answers, group project artifacts, school rosters, Google Drive files, teacher admin actions, login/session credentials, backups.  
**Attackers:** peer guessing a 5-digit ID/file URL, rogue student mutating request payloads, external brute-force attempts, an ex-student, accidental teacher deletion, stolen browser session, malicious HTML/Prompt URL, concurrent race.

## 2. Student login (proposed secure default)
- Teacher pre-provisions stable student UID, 5-digit display code and **independent random high-entropy secret** (recommended ≥12 unambiguous random alphanumeric characters) delivered individually, changed at first login if policy requires and supported by secure verifier.
- A five-digit code identifies account only. A 6-digit PIN is easier but creates a smaller secret space and risk of enumeration. **Do not treat any short numeric PIN as production-safe without measured durable throttling, strong verifier, recovery process and owner risk acceptance**.
- Store per-student salt and a key-derived verifier (e.g., HMAC-SHA256 with server-side secret pepper from Script Properties) **only for randomly issued high-entropy secrets**, not as justification for weak user-selected passwords. Apps Script lacks native password-hardening guarantees of a dedicated identity service; consider reviewed KDF library only if user-chosen passwords are required.
- Return generic invalid-account-or-credential responses, enforce per-account/overall cooldown and audit, teacher-only reset, revoke all earlier sessions on secret rotation.
- Persistent throttle source must survive process restarts and parallel calls; CacheService alone is insufficient; `LockService` guards counter updates. IP-address-based throttling is not assumed available/reliable in Apps Script web apps.
- Protect against denial of service from account lockout by using progressive cooldowns and monitored admin reset instead of arbitrary permanent locks.

## 3. Teacher login: mandatory proof-of-concept
**Preferred:** verified Google identity token (OIDC) against explicit teacher allowlist of stable Google `sub` identifiers; validate cryptographic JWT signature with Google rotating public keys via a reviewed production-grade verifier, `iss`, `aud`, `exp`, `email_verified`, and optional managed Workspace `hd` as needed. Google `tokeninfo` is for development/debugging, **not the selected production verification design**. Bind a login attempt to a server-side anti-CSRF challenge/nonce where supported by the chosen Google identity flow. Never use email text entered in browser or unchecked JWT payload. Treat Google ID token as **one-time proof to create this app's short session**, not as unrestricted Google Drive API credential.

**Deployment caveat:** Apps Script HTML Service iframe / origins / browser anti-tracking can make Google Identity Services flow complex; test sign-in on Chrome, iOS Safari, private mode and Google school account first. If not viable, evaluate a separate teacher-only deployment with `execute as user accessing`, restricted Workspace domain and appropriate Drive/Sheet permissions **after** verifying `Session.getActiveUser()` really works in that mode. Do not ship a fake Google login or trust blank/owner ActiveUser email in an `execute as me` public app.

## 4. Session handling
- Issue an unpredictable opaque bearer token with a **reviewed construction**: securely offline-provisioned server HMAC key + unique durable server-serialized counter and domain separation, or an equivalently reviewed CSPRNG-based design. Store only token digest in Sessions, expiry, principal UID/type and credential version; check every sensitive RPC. Do not treat `Math.random` or UUID alone as documented CSPRNG. Keys never leave backend; rotation and replay defense tested. **P0 SP03 must prove feasibility** before real accounts.
- Keep token in tab-scoped `sessionStorage` or volatile memory (tradeoff: sessionStorage readable by XSS, so robust XSS prevention is vital); avoid URL/query string, long-lived localStorage, and analytics/logs. Idle expiry proposal student 30 min, absolute 8 hr; teacher shorter. Logout and credential resets revoke server record.
- Limit login responses to minimal profile and enabled capabilities; never return `role` to server as evidence of permission.

## 5. Authorization matrix (backend-enforced)
| Action | Student (own) | Student (other) | Student (own group) | Teacher |
|---|---:|---:|---:|---:|
| Browse published/open assignments in any year/grade | Allow | N/A | Allow | Allow |
| Submit to published/open assignment, including out-of-roster | Allow | Deny | Individual owner path only | Managed override with audit |
| Read worksheet evidence and history | Allow | Deny | No, unless group project | Allow |
| Create/modify individual project | Allow | Deny | N/A | Admin correction audited |
| Read/create group project artifacts | N/A | Deny | Allow with active membership | Allow |
| View classmates' names/files | Deny | Deny | Deny except member names within own group | Allow |
| Modify year, templates, roster, reviews, roles | Deny | Deny | Deny | Allow only privileged role |
| Delete/restore/transfer wrong submission | Deny | Deny | Deny | Allow with audit/confirmation |
| View aggregate statistics | If enabled and cell threshold met | Never per-student | N/A | Allow |

**Rule for group artifacts:** group membership is checked against target project → group ID → active membership and project year/grade. Do not trust group_id sent by browser as membership proof.

## 6. Private files
- Private Drive root and children must be non-public: no `Anyone with link`. Periodic permission checks detect accidental sharing.
- Student gets **opaque evidence_ref** only; backend resolves to `SubmissionFiles.drive_file_id` and verifies `SubmissionVersion -> Submission -> student_uid` or `ProjectArtifacts -> Projects -> GroupMembers`. Never expose raw Drive URLs as viewer endpoints.
- `getEvidence` returns bounded data for requested authorized evidence only; verify metadata and bytes, content type allowlist. If size beyond gateway, show controlled error/request conversion rather than sending unbounded base64.
- Explicit file-owner check at each stage, including after cache; after soft-delete deny student preview unless policy explicitly grants historic access.
- Drive storage paths are organization, not ACL. Sharing permissions remain restricted even if a student knows folder structure.

## 7. Input, outputs and browser
- Validate year/grade/assignment status, owner/group and file size/type **on server**. Never trust MIME supplied by browser alone; detect file signature, block SVG/HTML as image and sanitize filename.
- HTML/Prompt/narrative text displayed using `textContent` / safe DOM APIs; no unsafe `innerHTML`; defend stored XSS against all users. If markdown rendering is added, sanitize with vetted library.
- Public GitHub Pages URLs: only absolute HTTPS with known/approved host policies, no `javascript:`, no untrusted script embedding, `rel="noopener noreferrer"`; never fetch arbitrary student-supplied URL via backend (SSRF).
- CSV/Sheets formula injection: escape potentially executable first characters before writing user-provided text to Sheets; treat `code_5_digit` as text.
- Minimize permissions/scopes for Apps Script deployment; don't insert OAuth token, root folder URL, service secret, spreadsheet editing link into HTML. Never log raw credentials or content.
- Session token risk: any successful XSS can steal it. Test XSS thoroughly, especially prompts, titles, reviews and external project links.

## 8. Upload threats and mitigations
| Threat | Defensive design |
|---|---|
| Repeated click/timeout | Idempotency key bound to actor+target+payload digest, operation record |
| Upload successful, Sheet write fails | Staging journal + cleanup/reconciliation + visible recoverable status |
| Sheet metadata references deleted file | Drive existence check before commit + health check |
| Out-of-year/wrong grade | Resolve Assignment server-side; compare its year/grade and open state; recompute roster flag |
| Concurrent version number collision | Script lock + unique `(submission_id,version_no)` validated in service |
| Oversized file and quota exhaustion | Strict server limits, client compression, short server work, backpressure |
| iOS HEIC compatibility | Client converter capability check and concrete JPEG fallback; test on real iPhone |
| Accidental teacher delete | Soft delete + restore + audit and retention policy |
| Guess evidence reference or mutate JSON | Deny by default per-resource server authorization (IDOR negative tests) |

## 9. Retention, backups and incident response
- Owner to set retention for student records and identify lawful school basis and student/guardian notice; do not invent Thai legal advice. Document who can request correction/deletion and retention exceptions.
- Daily or weekly scheduled snapshots chosen per risk tolerance; private backup Drive location with restricted access; test restore to **isolated** workbook and Drive location before production.
- On suspected exposure: revoke sessions, rotate secrets, disable affected deployment, review AuditLogs + Drive sharing, preserve incident evidence, notify responsible school authority per policy.

## 10. Go/no-go checklist
- [ ] Teacher verification works reliably in deployment + browsers
- [ ] No 5-digit-only login and no hard-coded student secret
- [ ] IDOR student A → B denied in every RPC, previews and versions
- [ ] Group outsider and removed member denied
- [ ] Brute force/rate limit test passes; session expiration/revocation passes
- [ ] No private Drive folder or file is accessible via link without authenticated backend
- [ ] Mutation audit + formula/XSS tests pass
- [ ] Backup restore and recovery from interrupted upload demonstrated
