# BilliardsLadder Billiards

A competitive billiards ladder and tournament platform — built for pool halls, by pool players.

**Stack:** React + Vite · Express + TypeScript · PostgreSQL (Neon) · Drizzle ORM · Stripe · Socket.IO · OpenAI

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your values (DATABASE_URL, Stripe keys, etc.)

# 3. Set up the database (first time)
npm run db:push

# 4. Start dev server
npm run dev
# → http://localhost:5000
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Express + Vite HMR, port 5000) |
| `npm run build` | Production build (Vite + esbuild) |
| `npm start` | Run production build |
| `npm run check` | TypeScript type check |
| `npm run db:push` | Push schema changes to database |

---

## Project Structure

```
BilliardsLadder/
├── docs/                    ← All documentation (START HERE)
│   ├── architecture.md      ← System overview + data flow
│   ├── api-contract.yaml    ← All API endpoints + request/response shapes
│   ├── data-model.md        ← Database tables + relationships
│   ├── state-machines.md    ← Payment, match, tournament state machines
│   ├── role-matrix.md       ← Who can do what (role permissions)
│   ├── runbook.md           ← How to deploy + operate
│   └── troubleshooting.md   ← Common errors + fixes
│
├── client/src/              ← React frontend
│   ├── App.tsx              ← Router + navigation
│   ├── pages/               ← Page components
│   ├── components/          ← Reusable UI components
│   │   └── ui/              ← shadcn/ui primitives
│   ├── hooks/               ← Custom React hooks
│   └── lib/                 ← queryClient, utils
│
├── server/                  ← Express backend
│   ├── index.ts             ← Server bootstrap
│   ├── routes.ts            ← Main route registration
│   ├── storage.ts           ← Database access layer (IStorage interface)
│   ├── config/
│   │   ├── env.ts           ← Env validation (fails fast if vars missing)
│   │   ├── db.ts            ← Drizzle DB connection
│   │   └── stripe.ts        ← Stripe client
│   ├── controllers/         ← HTTP in/out (thin layer)
│   ├── services/            ← Business logic (thick layer)
│   ├── routes/              ← Route modules by feature
│   ├── middleware/
│   │   ├── auth.ts          ← isAuthenticated, requireRole
│   │   ├── errorHandler.ts  ← Global error handler + requestId
│   │   └── sanitizeMiddleware.ts
│   ├── lib/
│   │   ├── logger.ts        ← Structured logger
│   │   └── errors.ts        ← Typed error classes
│   └── utils/               ← Helper utilities
│
├── shared/
│   ├── schema.ts            ← Drizzle schema (source of truth for all types)
│   └── validators/          ← Shared Zod validators
│
└── .env.example             ← All required env variables documented
```

---

## Key Concepts

### 1. Error Handling
All errors return a consistent JSON shape:
```json
{
  "code": "NOT_FOUND",
  "message": "Player not found",
  "requestId": "abc123"
}
```
Use `requestId` to find the full log entry.

### 2. Auth + Roles
Authentication uses Replit OIDC. Authorization uses role-based access:
`OWNER > TRUSTEE > OPERATOR > STAFF > PLAYER`
See `docs/role-matrix.md` for the full permission matrix.

### 3. Payments
All payments go through Stripe. Webhooks update subscription state.
Never trust client-side payment status — always verify via Stripe webhook.
See `docs/state-machines.md` for the payment state machine.

### 4. Environment Variables
All env vars are validated at startup by `server/config/env.ts`.
If the server won't start, check the error message for the missing variable.
See `.env.example` for the complete list.

---

## Deploying to Replit

1. Add all variables from `.env.example` to Replit Secrets
2. Set Run command: `npm start`
3. Set Build command: `npm run build`
4. Set up Stripe webhook to: `https://your-app.repl.co/api/stripe/webhook`

See `docs/runbook.md` for detailed deployment instructions.

---

## Debugging

Common errors and fixes: see `docs/troubleshooting.md`

AI debugging prompt template:
```
Goal: [what should happen]
Actual: [what happens]
Error: [paste full stack trace]
Files: [list file paths]
Constraints: [don't change X, keep Y the same]
Expected response: { ... }
```
