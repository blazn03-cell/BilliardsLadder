# server/repositories/ — Domain Repository Pattern

## Why this folder exists

`server/storage.ts` is a 318KB monolith that handles every domain in one file.
This creates hidden dependencies, makes parallel dev work risky, and makes
AI-assisted edits dangerous (one "simple fix" can break unrelated flows).

## The Plan

Split `server/storage.ts` into domain-scoped repositories:

| Repository | Responsibility |
|---|---|
| `playerRepo.ts` | Player CRUD, profile, ratings, streaks |
| `matchRepo.ts` | Match creation, results, history, disputes |
| `tournamentRepo.ts` | Brackets, calcutta, prize pools |
| `billingRepo.ts` | Wallets, ledger, escrow, payouts |
| `operatorRepo.ts` | Halls, operators, subscriptions, QR |
| `trainingRepo.ts` | Sessions, coach feedback, rewards |
| `adminRepo.ts` | Users, roles, alerts, moderation |

## Current Status

**Not yet split.** `server/storage.ts` still handles all domains.

When you split a domain:
1. Create `server/repositories/<domain>Repo.ts`
2. Extract only that domain's methods from `IStorage`
3. Update the relevant services to import from the repo instead of `storage`
4. Add a type test to ensure the repo implements the right interface
5. Update this file

## IStorage Interface Contract

The `IStorage` interface in `storage.ts` is the contract.
Any new repo must implement the matching subset of that interface.
Do not add methods to a repo that are not in `IStorage` without adding them to the interface first.

## Migration Order (recommended)

1. `billingRepo.ts` — least coupled, cleanest domain boundary
2. `operatorRepo.ts` — operator-only, no player deps
3. `trainingRepo.ts` — isolated feature
4. `adminRepo.ts` — admin-only, rarely touched
5. `matchRepo.ts` — high traffic, do last
6. `tournamentRepo.ts` — complex, do last
7. `playerRepo.ts` — most coupled, do last
