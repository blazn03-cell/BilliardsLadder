# shared/schema/ — Domain Schema Split Plan

## Current State

`shared/schema.ts` is a single 128KB file containing every Drizzle table definition,
insert schema, and select type for the entire platform. This creates:
- Long edit cycles (search through 3,000+ lines to find one table)
- Merge conflicts when two devs change different tables
- AI tools that struggle to load the full file in context

## Planned Split

Split by domain into:

| File | Tables |
|---|---|
| `shared/schema/player.ts` | players, users, sessions, playerStreaks, deviceAttestations |
| `shared/schema/match.ts` | matches, matchEntries, matchDivisions, challengePools, challengeEntries, resolutions |
| `shared/schema/tournament.ts` | tournaments, tournamentCalcuttas, calcuttaBids, matchSchedules, brackets |
| `shared/schema/billing.ts` | wallets, ledger, payoutDistributions, operatorSubscriptions, membershipEarnings |
| `shared/schema/training.ts` | trainingSessions, coachFeedback, trainingRewards |
| `shared/schema/social.ts` | sportsmanship, attitudeVotes, attitudeBallots, incidents |
| `shared/schema/events.ts` | charityEvents, bounties, addedMoneyFunds, seasonPredictions |
| `shared/schema/operator.ts` | poolHalls, operatorTiers, checkins, qrRegistrations |
| `shared/schema/media.ts` | liveStreams, uploadedFiles, fileShares, posters |
| `shared/schema/admin.ts` | alerts, staffRoles, globalSettings |
| `shared/schema/index.ts` | Re-exports everything for backward compatibility |

## Current Status

**Not yet split.** `shared/schema.ts` still handles all domains.

## Migration Strategy

1. Create `shared/schema/index.ts` that re-exports from the current schema.ts
   (zero-breaking change, allows incremental migration)
2. Move one domain at a time to its own file
3. Update `shared/schema.ts` to just: `export * from "./schema/index"`
4. After all domains moved, rename `schema.ts` → `schema/_legacy.ts` for reference
5. Delete legacy file when all imports updated

## Key Rule

Every table definition must include:
- Drizzle table declaration
- Insert schema (Zod inferred from table)
- Select type
- Any domain-specific type aliases

Example structure for `shared/schema/player.ts`:
```typescript
import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  // ... columns
});

export const insertPlayerSchema = createInsertSchema(players);
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
```
