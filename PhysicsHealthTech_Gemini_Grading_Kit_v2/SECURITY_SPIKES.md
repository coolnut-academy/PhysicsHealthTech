# SECURITY_SPIKES.md — Required pre-implementation experiments (P0)

## v2.0 Scoring Integrity Feasibility Tests
Add SP09: test draft/publish audit, Sheet partial writes/reconciliation, concurrent grade edits and idempotent group release; SP10: verify direct score/feedback/CSV RPC authorization and IDOR, including group individual-score privacy; SP11: test approved syllabus import 9 worksheet codes and distinct Task max100/grade. These supplement, not replace, original student credential, teacher OIDC, upload and preview spikes. Real source and school deployment still required for final gate.

**Purpose:** settle real technical feasibility in target Google Apps Script deployment, not claim Apps Script is inherently unsafe or safe.

| Spike | Required experiment | Success proof | If blocked |
|---|---|---|---|
| SP01 | Choose Apps Script access/executeAs mode for student+teacher, check whether `Session.getActiveUser()` identity is reliable in **that exact mode** | browser/domain matrix + observed anonymized principal | keep student execute-as-owner private-files model; test verified teacher Google OIDC or owner-approved separate teacher deployment |
| SP02 | Teacher Google Identity Services in HTML Service iframe (Google Chrome + iOS Safari) with cryptographically verified ID token and trusted allowlist | signed test payload validation; `aud/iss/exp/sub/email_verified`, optional `hd`, nonce/CSRF plan; forged tokens fail | document conflict and secure alternative with explicit owner approval; never parse JWT payload without signature |
| SP03 | Student credentials, durable throttling and **cryptographically unpredictable** app session tokens | 5-digit code alone fails; verifier proof; repeated failures slow/block; random/session construction reviewed | use secure CSPRNG-derived **offline-generated** root secret + HMAC-based unique token derivation with durable counter and rotation, or identity approach approved by owner. No `Math.random`/UUID-as-CSPRNG claim |
| SP04 | `google.script.run` file-upload transport, Blob or HTML form input, 0.5/1/2 MiB, retries, runtime costs | metrics by device and content type, no missing writes | downsize limit, alternative within approved stack; don't advertise upload support without evidence |
| SP05 | iPhone camera and photo library JPEG/HEIC handling, including HEIC unsupported scenario | exact iOS/browser versions, JPEG normalization success, manual fallback success | show actionable error + user choice to provide JPEG, don't claim silent HEIC support |
| SP06 | Secure Drive preview through server-checked opaque ref and bounded payload; no public link | A opens A, A cannot open B; no direct Drive public access; memory/performance metrics | thumbnails/smaller image limits, explicit controlled error; reconsider platform only with owner's approval |
| SP07 | 10/20/40 synthetic concurrent uploads and short-lock operations | duplicate-free, no lost rows, logs incl. p95/failed reason/remaining quota | add admission throttling, queue/retry; do not claim 80 uploads simultaneously supported |
| SP08 | Sheets protection / Drive sharing / dev/prod separation / service account ownership | test with unprivileged Google account, manual `Anyone with link` audit | no launch until corrected |

## Mandatory security design detail
- **App session construction**: derive unpredictable token from a securely generated high-entropy server secret stored in Script Properties and a unique durable monotonic counter (guarded with lock) using HMAC-SHA256. Store only a one-way digest/token verifier in persisted Sessions. Provide rotation/invalidations. Don't equate this with proven security until code+negative tests are reviewed. If genuine cryptographic primitives or secure provisioning cannot be implemented in Apps Script, stop and request owner decision.
- **Student secret**: ideally teacher distributes unique 12+ random unambiguous characters generated via trusted secure tool **outside** Apps Script, imported through a secure one-time provisioning workflow that never commits plaintext. Verifier can be HMAC-SHA256(salt || secret) with server-side pepper **only because the secrets are high entropy**. Plain 6-digit PIN/password hashes without adequate KDF and rate limiting are not acceptable defaults. Determine exact entropy, verifier and rotation process before writing code.
- **Never expose sheet/Drive secrets to students**: an `execute as accessing user` deployment would use the student's Google permissions and may fail accessing owner-private Drive; do not make Drive public to solve this.
- **Google OIDC verification**: Google's documentation recommends production cryptographic verification of keys/issuer/audience/expiration; using development/debugging `tokeninfo` API as sole production verifier is not allowed by this plan.
- **Risk gate**: P0 may produce failing/inconclusive tests; those are informative, not reasons to install a fake teacher-login button or skip authorization.

## Record each spike
Date | deployment ID (redacted) | account class (anonymous/school teacher/student) | device/browser | method | expected | actual | PASS/FAIL/BLOCKED | logs/evidence path | decision.

## Official references
- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/guides/html/communication
- https://developers.google.com/apps-script/reference/base/session
- https://developers.google.com/apps-script/guides/services/quotas
- https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
- https://developers.google.com/apps-script/reference/lock/lock-service
