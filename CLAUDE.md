# CLAUDE.md — Developer Source of Truth

This file is the canonical guide for any developer (human or AI) working on BilliardsLadder.
**Read this before touching any file in this repo.**

---

## What is this app?

BilliardsLadder is a billiards ladder/tournament platform. Players challenge each other for ranked positions, compete in tournaments with real money match stakes, earn performance pay via a weekly threshold system, and collect 48 rewards.

**Three user types:**
- **Player** — competes, earns performance pay, collects rewards
- **Operator** — manages a pool hall, receives commission splits
- **Owner/Trustee** — the platform admin (you)

---

## Single Source of Truth Files

| What | File |
|---|---|
| Pricing (subscriptions, service fees, match stakes) | shared/config/plans.ts |
| Stripe Price IDs | shared/config/stripe-prices.ts |
| Feature Flags (what is live vs stub) | server/config/featureFlags.ts |
| Environment Variables | .env.example |
| API Contract | docs/api-contract.yaml |
| Data Shapes | shared/schema.ts |
| Auth Flow | server/replitAuth.ts + server/middleware/auth.ts |
| Error Types | server/lib/errors.ts |

If you change pricing anywhere, change it in shared/config/plans.ts ONLY.
Do not add prices to route files, controllers, or services. revenueConfig.ts now delegates to plans.ts.

---

## Locked Pricing (as of product spec v3)

| Plan | Price | Notes |
|---|---|---|
| Rookie | $24.99/mo | 8% service fee, $150 max match stake |
| Standard | $29.99/mo | 7% service fee, $500 max match stake |
| Premium | $30.99/mo | 6% service fee, $1,000 max match stake |
| Family | $24.99/mo | 2 adults + 1 child; +$3.99/child under 12; +$4.99/teen 13-17 |
| Senior | $19.99/mo | 65+; partner does NOT need to be family-related |

Do not override these prices inline in route files, controllers, or services.

---

## What is Live vs. Stub vs. Beta

### Live (real DB + business logic)
- Ladder / ranking system
- Challenge matches + escrow release
- Tournaments + brackets
- Player career stats + earnings
- Training sessions
- Subscriptions (Stripe)
- QR registration
- Auth (Replit OIDC)
- Weekly threshold + performance pay
- 48 RewardsVault

### Beta (functional but limited)
- Hall Battles (trustee-unlocked only)
- Live Stream (requires stream URL configured by operator)
- AI Coaching (requires OPENAI_API_KEY env var)
- Matchmaking (FACEIT-style, partially wired)

### Stub / Coming Soon (returns 503 FEATURE_NOT_LIVE)
- Object Carom Games
- Poolhall Matches
- Game Voting
- Spot Shots
- Admin Staff list
- Admin Operators list

All stubs are gated by FEATURE_FLAGS in server/config/featureFlags.ts.
When you implement a stub: implement the real controller, flip the flag to true, remove the 503 guard.

---

## Health Check Endpoints

```
GET /healthz        plain text "ok"    used by Replit/Render deployment infra
GET /api/health     JSON status        used by monitoring dashboards
```

Both exist. Do not remove either.

---

## Auth Flow

```
1. User visits /login
2. Redirect to Replit OIDC: /api/login
3. Replit authenticates -> callback: /api/callback
4. Passport creates session (PostgreSQL sessions table)
5. Subsequent requests: session cookie -> req.user populated
6. server/middleware/auth.ts: isAuthenticated / requireRole guards
```

Auth is registered in ONE place: server/routes.ts calls registerAuthRoutes(app).
Do not add auth route registration anywhere else.

---

## Error Handling

All errors use typed classes from server/lib/errors.ts:

```typescript
throw new NotFoundError("Player not found", { playerId });
throw new ForbiddenError("Insufficient role");
throw new PaymentError("Stripe charge failed", { stripeCode });
throw new ValidationError("Invalid stake amount", { min: 100, max: 50000 });
```

These are caught by server/middleware/errorHandler.ts which returns:

```json
{ "code": "NOT_FOUND", "message": "Player not found", "requestId": "req-xxx" }
```

**Do NOT:**
- Use `catch { return [] }` — this hides real failures from the client and from logs
- Use `catch { return { totalEarnings: 0 } }` — silent failure looks like real data
- Use bare `res.json({})` for error conditions — throw a typed error instead

---

## Repo Structure

```
BilliardsLadder/
  client/src/
    pages/          <- Full-page React components (one per route/tab)
    components/     <- Shared/feature components
    hooks/          <- Custom React hooks (useAuth, usePlayer, etc.)
    lib/            <- Client utilities (queryClient, utils)
    App.tsx         <- Router + navigation (tab-based via ?tab= param)
  server/
    routes.ts       <- All HTTP routes registered here (delegates to storage)
    config/         <- env.ts, featureFlags.ts, revenueConfig.ts
    middleware/     <- auth.ts, errorHandler.ts, rateLimit.ts, sanitize.ts
    lib/            <- errors.ts, logger.ts
    repositories/   <- (Planned) Domain-split storage repos (see README in folder)
    storage.ts      <- DB layer (IStorage interface + DrizzleStorage implementation)
  shared/
    config/         <- plans.ts, stripe-prices.ts (pricing source of truth)
    schema.ts       <- Drizzle schema (all table definitions)
    schema/         <- (Planned) Domain-split schema (see README in folder)
    validators/     <- Zod schemas for shared validation
  docs/             <- Architecture, runbook, API contract, role matrix
  .env.example      <- All env vars documented
  CLAUDE.md         <- This file
```

---

## Running Locally

```bash
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL, SESSION_SECRET, STRIPE_SECRET_KEY, etc.
npm run db:push
npm run dev
```

Dev server runs at: http://localhost:5000

---

## Before Adding a New Feature

1. Check server/config/featureFlags.ts — is there already a stub for this?
2. If yes: implement the real controller, flip the flag to true, remove the 503 guard
3. Add the endpoint to docs/api-contract.yaml
4. Update this file if the live/stub/beta status changes
5. Add Zod validation for any new input shapes in shared/validators/

---

## Common Mistakes to Avoid

- Adding pricing to a route file — use shared/config/plans.ts
- Returning [] in a catch block — throw a typed error instead
- Registering auth routes in more than one place
- Hardcoding Stripe price IDs — use shared/config/stripe-prices.ts
- Adding a stub without a flag in featureFlags.ts
- Editing docs without updating the code (or vice versa)
- Catching errors and swallowing them with silent fallback values
