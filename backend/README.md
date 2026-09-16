# Briqbi HR — backend

Node.js + Express + MongoDB (Mongoose). This is the security boundary
between the frontend and the database, and — once the remaining endpoints
exist — between the public forms and Dataverse.

**Status: login, Job Openings, and Team Members are real. The other 7
tables aren't ported yet.** The console signs in through actual Firebase
Auth (Microsoft as the identity provider, same project as
intranet.briqbi.com), and `POST /api/session` here really verifies that
sign-in server-side. Job Openings is synced from the live careers API.
Team Members is fully CRUD (list + create) against MongoDB. Background
Check, Document, Joining Task, Asset, Candidate, Interview, Offer, and
Training Record still live only in `../frontend/src/lib/mockApi.ts`.

## What's implemented

- **`GET /api/health`** — `{ ok: true, mongo: 'connected' | ... }`.
- **`POST /api/session`** (`src/routes/session.route.ts`) — the frontend
  calls this right after `signInWithPopup` resolves (and again on every
  restored session), passing the Firebase ID token as
  `Authorization: Bearer <token>`. Verifies it via `firebase-admin`
  (`src/lib/firebaseAdmin.ts`), then applies the allowlist
  (`src/lib/allowlist.ts`) — the same `@briqbi.com` check the frontend used
  to apply client-side, except this one actually gates access. Returns
  `{ uid, email, name }` on success, 401 on a bad/expired/missing token, 403
  on an email outside the allowlist.
- **`GET /api/team-members`** / **`POST /api/team-members`** /
  **`PATCH /api/team-members/:id`** / **`DELETE /api/team-members/:id`**
  (`src/routes/teamMembers.route.ts`, model at `src/models/TeamMember.ts`) —
  full CRUD against MongoDB. Creating one auto-assigns
  `memberId` (EMP-/CON-/INT- + a shared sequence seeded at 1000, mirroring
  the doc's "assign member ID" flow), defaults `memberStatus` to Joining and
  `onboardingStage` to Offer. Only Full Name / Person Type / Department /
  Work Email are collected at creation — PAN, bank details, personal email,
  and emergency contact are meant to come later through the joiner form
  (still mocked, see below), not entered by HR up front. `pan` and
  `bankAccountRef` are secured columns in Dataverse — mask them in any list
  response once that matters for real; they're stored plain here for now.
  `PATCH` also allows changing `memberStatus` directly (Joining/Active/On
  Notice/Left) — a stand-in for the real status-transition flows (e.g. the
  Exit form) until those are ported off the mock too.
- **`GET /api/job-openings`** / **`POST /api/job-openings/sync`**
  (`src/routes/jobOpenings.route.ts`) — real data, not mocked. Every server
  start pulls all pages from `https://api.intranet.briqbi.com/api/job-postings`
  (`src/services/jobPostingsSync.ts`) and upserts them into our own
  `JobOpening` collection by the source's `_id` (stored as `externalId`), so
  the frontend reads from our DB, never the external API directly (avoids
  CORS, and keeps us working if that API is briefly down). `GET
  /api/job-openings?active=true` filters to `isActive: true` — used by the
  public `/apply` picker; the unfiltered list backs the dashboard's Job
  Openings page.
- The Firebase Admin service account key
  (`briqbi-intranet-firebase-adminsdk-fbsvc-c319759841.json`, gitignored)
  lives at this package's root — never move it into `frontend/`.

### Why `allowlist.ts` duplicates `shared/access.ts` instead of importing it

`shared/` is consumed by `frontend/` through Vite, which bundles everything
itself and doesn't care about `tsc`'s rootDir rules. This package is
compiled by plain `tsc`, which needs every emitted file under one rootDir —
importing `shared/*.ts` directly forces the build to also try to emit
`shared/`'s output, nested and useless. `allowlist.ts` is small enough that
a hand-synced copy was the pragmatic call. Once `forms.ts`/`optionSets.ts`
need sharing too (building out the other 9 models and their routes), that
duplication stops being worth it — set up real TS project references or an
npm workspace at that point instead.

## Local development

Needs a MongoDB reachable at `MONGODB_URI` — a local `mongod` is enough for
dev (`mongod --version` / `mongosh` should already work if it's installed).

```bash
npm install
cp .env.example .env       # adjust PORT / MONGODB_URI / CORS_ORIGIN if needed
npm run dev                 # tsx watch — reloads on change, :4000 by default
# or: npm run build && npm start
```

The frontend's Vite dev server proxies `/api` to `:4000` (see
`../frontend/vite.config.ts`) — keep both in sync if the port changes.

## Note on the handover doc

`Briqbi-HR-Developer-Handover.docx` describes the data model (10 tables, 115
columns, choice sets) in terms of a Dataverse solution reached through an
Azure Function. That's still the best reference for *what* each table needs
to hold and *why* — but the actual system of record here is MongoDB via
this Express API, not Dataverse. Treat the doc as a spec for shape and
business rules, not as the literal hosting/storage plan.
