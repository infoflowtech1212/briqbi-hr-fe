# Briqbi HR

Internal HR system for Briqbi Analytics — background verification, joining
checklists, asset tracking, and hiring, closing the structural gaps a bad
exit once exposed. Full background in
[`Briqbi-HR-Developer-Handover.docx`](Briqbi-HR-Developer-Handover.docx) and
the visual system in [`briqbi-hr-design-system.md`](briqbi-hr-design-system.md).

## Structure

```
frontend/   React 18 + Vite + TypeScript — the dashboard (sidebar, all 10
            tables) and the public/signed forms (/apply, /f/<token>).
            Sign-in is real (Firebase Auth, Microsoft provider).
backend/    Node.js + Express + MongoDB (Mongoose). Login verification is
            real (POST /api/session, via firebase-admin) and TeamMember is
            the first real model; the other 9 tables aren't ported yet, so
            frontend/src/lib/mockApi.ts still stands in for those.
shared/     Field schemas, option sets, and the sign-in allowlist, used by
            frontend directly. backend keeps its own small hand-synced copy
            of the allowlist check — see backend/README.md for why.
```

`Briqbi-HR-Developer-Handover.docx` describes the data model in terms of a
Dataverse solution reached through an Azure Function — that's still the
right reference for what each table needs to hold, but the actual backend
here is Express + MongoDB, not Dataverse.

## Local development

Needs a MongoDB reachable locally (a plain `mongod` is enough for dev).

```bash
# backend
cd backend
npm install
cp .env.example .env
npm run dev           # tsx watch — Express on :4000

# frontend
cd frontend
npm install
npm run dev            # Vite on :5173, proxies /api to :4000
```

`npm run typecheck` and `npm run build` should always pass clean in both
`frontend/` and `backend/` before committing.
