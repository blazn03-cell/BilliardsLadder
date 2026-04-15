# BilliardsLadder Competition System — Technical Assessment Report

**Document Version:** 1.0  
**Date:** April 15, 2026  
**Project:** BilliardsLadder (ActionLadder)  
**Scope:** Competition features readiness for beta testing  

---

## 1. Executive Summary

This report provides a technical assessment of all competition-related features within the BilliardsLadder platform. The competition system encompasses individual ladder play, tournaments, team divisions, money games, challenges, and league standings. Each feature has been evaluated against three readiness categories: **Beta-Ready**, **Near-Complete**, and **Not Yet Implemented**. A prioritized implementation plan is provided at the end of this document.

---

## 2. Feature Readiness Assessment

### 2.1 Beta-Ready (Functional & Testable)

These features have working backend logic, frontend UI, database persistence, and can be tested by real users in a beta environment.

#### 2.1.1 Individual Ladder System
- **Status:** Complete
- **Key Files:** `client/src/components/ladder.tsx`, `client/src/pages/LadderPage.tsx`
- **What Works:**
  - Two-division system: "600+ Killers" (Elite) and "599 & Below Grinders" (Contenders)
  - "Big Dog Throne" display for 9-foot table champions (650+ rating)
  - Podium visualization for top 3 players
  - Streak bonuses (+25 points for 3 consecutive wins)
  - "King's Rule" — losing player drops 3–7 ladder positions
  - Respect Points tracking
  - AI-assisted strategy analysis via `/api/ai/community-chat`
  - Live bounty display on ranked players

#### 2.1.2 Kelly Pool
- **Status:** Complete
- **Key Files:** `client/src/components/kelly-pool.tsx`, `server/controllers/pool.controller.ts`
- **What Works:**
  - Full game lifecycle: create, join, start, complete
  - Entry fee system ($20 default)
  - Ball assignment (pill draw simulation)
  - Prize pool calculation and distribution
  - Game state management (open / active / completed)

#### 2.1.3 Quick Challenges & Matchmaking
- **Status:** Complete
- **Key Files:** `client/src/components/QuickChallengeDialog.tsx`, `server/controllers/quickChallenge.controller.ts`
- **What Works:**
  - Player-to-player challenge creation with Zod-validated input
  - Smart matchmaking suggestions based on rating proximity
  - Challenge time calculation and auto-approval settings
  - Fee configuration per challenge

#### 2.1.4 Side Pots
- **Status:** Complete
- **Key Files:** `server/controllers/pool.controller.ts` (lines 294–394)
- **What Works:**
  - Side pot creation, resolution, and dispute handling
  - 12-hour dispute window with automated resolution
  - Immediate credit distribution to winners via wallet ledger
  - Premium subscription gating for high-stakes pots (over $300)

#### 2.1.5 Tournament Entry & Bracket Management
- **Status:** Complete (Single Elimination)
- **Key Files:** `client/src/pages/TournamentPage.tsx`, `client/src/pages/TournamentBrackets.tsx`, `server/controllers/tournament.controller.ts`
- **What Works:**
  - Tournament creation with configurable format and entry fees
  - Stripe-integrated entry fee collection
  - Waitlist system for tournaments at capacity
  - Single elimination bracket generation
  - OCR photo scanning (via Tesseract.js) for automated score entry from match photos
  - Champion poster generation
  - Calcutta (player auction) bidding system with backend logic

#### 2.1.6 Challenge Calendar
- **Status:** Complete
- **Key Files:** `client/src/pages/ChallengeCalendar.tsx`
- **What Works:**
  - Visual calendar display for upcoming challenges and events
  - Date-based filtering and navigation

---

### 2.2 Near-Complete (70–90% Done)

These features have significant implementation but contain gaps — typically mocked data, incomplete backend wiring, or missing validation flows — that prevent full beta readiness.

#### 2.2.1 Escrow Challenges
- **Status:** ~75% Complete
- **Key Files:** `client/src/components/escrow-challenges.tsx`, `server/controllers/pool.controller.ts` (lines 605–690)
- **What Works:**
  - Stripe PaymentIntent integration for holding stakes
  - Challenge creation with escrow deposit
  - Accept challenge flow (basic)
- **What's Missing:**
  - `getEscrowChallenges()` returns hardcoded mock data (lines 606–637) instead of querying the database
  - `getEscrowChallengeStats()` returns hardcoded stats (`totalVolume: 125000`, `activeChallenges: 8`, etc.) instead of computing from real data
  - No escrow release/refund flow after match completion
  - No dispute resolution specific to escrow (separate from side pots)

#### 2.2.2 Double Elimination Tournaments
- **Status:** ~70% Complete
- **Key Files:** `client/src/pages/TournamentBrackets.tsx` (line 152+)
- **What Works:**
  - `buildDoubleElim()` function generates winners and losers bracket structures
  - Format toggle between single and double elimination in UI
  - Loser propagation logic (winners bracket losers drop to losers bracket)
- **What's Missing:**
  - Losers bracket progression is described as "stubbed" in code comments (line 36)
  - Grand finals logic (losers bracket winner vs. winners bracket winner) not implemented
  - No reset bracket scenario (if losers bracket winner beats winners bracket winner)

#### 2.2.3 Match Result Confirmation
- **Status:** ~60% Complete
- **What Works:**
  - Either player can report a match result
  - Results are persisted and update ladder standings
- **What's Missing:**
  - No opponent confirmation/verification step before results are locked
  - No dispute mechanism if the opponent disagrees with the reported result
  - No time-based auto-confirmation (e.g., result stands after 24 hours if unchallenged)

#### 2.2.4 Money Games
- **Status:** ~65% Complete
- **Key Files:** `server/controllers/pool.controller.ts`
- **What Works:**
  - Game types: straight-lag, rail-first, progressive
  - Join/start state management (waiting / active / full)
  - Player list and prize pool tracking
- **What's Missing:**
  - No payout/settlement logic after game completion
  - No integration with wallet/ledger for automatic payouts
  - Limited frontend UI for game management

#### 2.2.5 Sportsmanship / Vote-Out System
- **Status:** ~50% Complete
- **Key Files:** `client/src/components/sportsmanship-system.tsx`
- **What Works:**
  - Attitude voting UI with role-weighted votes (operator 2x, player 1x, spectator 0.5x)
  - Vote session display and participation
- **What's Missing:**
  - Uses `MOCK_SESSION` with hardcoded `userId`, `sessionId`, `venueId`, and `operatorId` instead of real auth context
  - Not connected to actual user session/authentication
  - No backend enforcement of vote outcomes (e.g., temporary ban)

---

### 2.3 Not Yet Implemented (Scaffolding Only)

These features have schema definitions, route stubs, or UI shells but lack functional backend logic and real data integration.

#### 2.3.1 League / Hall Standings
- **Status:** Mock Data Only
- **Key Files:** `server/controllers/league.controller.ts` (all 109 lines)
- **Current State:**
  - All four endpoints return hardcoded static arrays:
    - `GET /api/league/standings` — returns one fake hall ("Rack & Roll Billiards") with fabricated win/loss record
    - `GET /api/league/seasons` — returns one fake season ("Spring 2024 Championship")
    - `GET /api/league/stats` — returns hardcoded aggregate stats (`totalHalls: 6`, `totalPlayers: 78`, etc.)
    - `GET /api/league/upcoming-matches` — returns one fake scheduled match
  - No database queries, no schema tables for league seasons or hall standings
- **Required Work:**
  - Create `league_seasons`, `league_standings` tables (or derive standings from existing match data)
  - Replace all four controller functions with real database queries
  - Aggregate standings from actual match results per hall
  - Implement season lifecycle (create, activate, complete, archive)

#### 2.3.2 Team Competition (Hall-vs-Hall, City, State)
- **Status:** Mock Data / Scaffolding
- **Key Files:** `client/src/components/match-divisions.tsx`, `client/src/pages/TeamMatches.tsx`
- **Current State:**
  - Frontend uses `mockTeams` array (line 92) with hardcoded team data
  - Three competition tiers displayed: Poolhall, City, State
  - Stripe Connect onboarding UI for team payout accounts exists
  - Backend `team.routes.ts` exists but focuses on Stripe onboarding rather than match logic
- **Required Work:**
  - Replace `mockTeams` with real API-backed team CRUD
  - Implement team roster management (add/remove players, set captain)
  - Build team challenge system (challenge creation, acceptance, scheduling)
  - Implement team match scoring and result tracking
  - Wire up inter-hall standings aggregation

#### 2.3.3 Dedicated Ladder Rankings API
- **Status:** Not Implemented
- **Current State:**
  - Ladder rankings are computed entirely on the frontend by sorting player data from `/api/players`
  - No server-side ranking calculation or persistence
  - No official "ladder position" field in the database
- **Required Work:**
  - Create a dedicated `/api/ladder/standings` endpoint
  - Implement server-side ranking algorithm (considering rating, streak, activity)
  - Add `ladderPosition` field to players table or compute dynamically
  - Ensure consistency across all clients viewing the ladder

---

## 3. Implementation Plan — Priority Order

The following plan is ordered by impact on the beta testing experience, with dependencies noted.

### Phase 1: Critical Path (Required for Beta Launch)

| Priority | Task | Effort Estimate | Dependencies |
|----------|------|-----------------|--------------|
| P1 | **Match Result Confirmation Flow** — Add opponent verification step, 24-hour auto-confirm, and dispute mechanism | 3–4 days | None |
| P2 | **Escrow Challenges — Wire to Real Data** — Replace mock data in `getEscrowChallenges()` and `getEscrowChallengeStats()` with database queries; add escrow release/refund on match completion | 2–3 days | P1 (match confirmation informs escrow release) |
| P3 | **Dedicated Ladder Rankings API** — Create server-side ranking endpoint to prevent client-side ranking inconsistencies | 1–2 days | None |
| P4 | **Sportsmanship System — Connect to Auth** — Replace `MOCK_SESSION` with real authenticated user context | 1 day | None |

### Phase 2: Core Competition Features

| Priority | Task | Effort Estimate | Dependencies |
|----------|------|-----------------|--------------|
| P5 | **League Standings — Replace Mock Data** — Build real database queries for standings, seasons, stats, and upcoming matches; aggregate from match history | 3–4 days | P3 (needs consistent ranking data) |
| P6 | **Double Elimination — Complete Losers Bracket** — Finish losers bracket progression, grand finals, and reset bracket logic | 2–3 days | None |
| P7 | **Money Games — Settlement Logic** — Add payout/settlement flow, wallet/ledger integration for automatic payouts after game completion | 2–3 days | None |

### Phase 3: Team & League System

| Priority | Task | Effort Estimate | Dependencies |
|----------|------|-----------------|--------------|
| P8 | **Team CRUD & Roster Management** — Replace `mockTeams` with API-backed team creation, roster management, captain assignment | 3–4 days | None |
| P9 | **Team Challenge System** — Build team-vs-team challenge flow (creation, acceptance, scheduling, scoring) | 3–4 days | P8 (requires team CRUD) |
| P10 | **Inter-Hall League Integration** — Wire team match results into league standings; implement city/state tier progression | 2–3 days | P5, P8, P9 |

### Phase 4: Polish & Edge Cases

| Priority | Task | Effort Estimate | Dependencies |
|----------|------|-----------------|--------------|
| P11 | **Escrow Dispute Resolution** — Build dispute flow specific to escrow challenges (separate from side pot disputes) | 2 days | P2 |
| P12 | **Money Game Frontend** — Expand UI for game management, player views, and result entry | 1–2 days | P7 |
| P13 | **Tournament Season Championships** — Connect season data to tournament scheduling and "Added Money Fund" logic | 2–3 days | P5, P6 |

---

## 4. Total Estimated Effort

| Phase | Tasks | Estimated Duration |
|-------|-------|--------------------|
| Phase 1 — Critical Path | P1–P4 | 7–10 days |
| Phase 2 — Core Competition | P5–P7 | 7–10 days |
| Phase 3 — Team & League | P8–P10 | 8–11 days |
| Phase 4 — Polish | P11–P13 | 5–7 days |
| **Total** | **13 tasks** | **27–38 days** |

---

## 5. Risk Factors

| Risk | Impact | Mitigation |
|------|--------|------------|
| Client-side ranking inconsistency | Players see different ladder positions on different devices | P3 (dedicated ranking API) addresses this |
| Match result disputes without confirmation flow | Players lose trust; incorrect standings | P1 (match confirmation) is highest priority |
| Escrow funds stuck without release logic | Real money locked in Stripe with no resolution path | P2 (escrow completion) must precede any real-money beta |
| Mock data in production | Users see fake halls/stats, breaking immersion | P4 and P5 replace all mock data sources |
| Team system blocks league system | League standings depend on team match data that doesn't exist yet | Phase 3 dependency chain must be sequential |

---

## 6. Recommendation

**For a minimum viable beta**, complete **Phase 1** (P1–P4). This ensures that the core individual competition loop — challenge, play, report, verify, rank — works end-to-end with real data and proper validation. Phases 2–4 can be released incrementally as the beta progresses.

---

*Report generated by BilliardsLadder Engineering — April 15, 2026*
