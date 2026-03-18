/**
 * plans.ts — SINGLE SOURCE OF TRUTH for all BilliardsLadder pricing.
 *
 * WHY THIS FILE EXISTS:
 *   Before this file, subscription prices, commission rates, and fee rules were
 *   duplicated across server/config/revenueConfig.ts, server/services/pricing-service.ts,
 *   server/services/playerBilling.ts, server/utils/commissionCalculator.ts, and
 *   inline in routes.ts. They disagreed with each other and with the product spec.
 *
 *   Now there is ONE place to look. Everything else imports from here.
 *   If prices change → edit ONLY this file.
 *
 * CURRENT LOCKED PRICING (aligned with Master Business Plan v1.0):
 *   Free         $0/mo       — 2 active challenges, basic ladder
 *   Basic        $9.99/mo    — Unlimited challenges, earnings dashboard, 5% service fee
 *   Premium      $19.99/mo   — Priority matching, coach access, analytics, 3% service fee
 *   Family Plan  $29.99/mo   — Up to 4 player profiles, shared earnings dashboard
 *   Elite        $49.99/mo   — Certified ranking, travel challenges, 2% service fee
 *
 * OPERATOR TIERS (B2B SaaS):
 *   Starter      $99/mo      — 1 hall, 100 players, basic analytics
 *   Pro          $199/mo     — 3 halls, unlimited players, full analytics, API access
 *   Enterprise   $499/mo     — Unlimited halls, white-label, dedicated support
 */

// ─── Plan IDs ─────────────────────────────────────────────────────────────────
export type PlanId = "free" | "basic" | "premium" | "family" | "elite";
export type OperatorPlanId = "starter" | "pro" | "enterprise";

// ─── Prices in cents (used for Stripe + math) ─────────────────────────────────
export const PLAN_PRICES_CENTS = {
  free:    0,      // $0/mo
  basic:   999,    // $9.99/mo
  premium: 1999,   // $19.99/mo
  family:  2999,   // $29.99/mo — up to 4 profiles
  elite:   4999,   // $49.99/mo
} as const satisfies Record<PlanId, number>;

// ─── Annual prices in cents (discounted) ──────────────────────────────────────
export const PLAN_PRICES_ANNUAL_CENTS = {
  free:    0,      // $0/yr
  basic:   8999,   // $89.99/yr  (save ~$10)
  premium: 17999,  // $179.99/yr (save ~$40)
  family:  26999,  // $269.99/yr (save ~$90)
  elite:   44999,  // $449.99/yr (save ~$55)
} as const satisfies Record<PlanId, number>;

// ─── Prices as display strings ────────────────────────────────────────────────
export const PLAN_PRICES_DISPLAY = {
  free:    "Free",
  basic:   "$9.99/mo",
  premium: "$19.99/mo",
  family:  "$29.99/mo",
  elite:   "$49.99/mo",
} as const satisfies Record<PlanId, string>;

export const PLAN_PRICES_ANNUAL_DISPLAY = {
  free:    "Free",
  basic:   "$89.99/yr",
  premium: "$179.99/yr",
  family:  "$269.99/yr",
  elite:   "$449.99/yr",
} as const satisfies Record<PlanId, string>;

// ─── Operator tier prices ─────────────────────────────────────────────────────
// Pool hall owners (operators) do not pay a subscription fee.
// Their revenue percentage from match service fees is set lower in REVENUE_SPLITS.
export const OPERATOR_PRICES_CENTS = {
  starter:    0,  // Free for pool hall owners
  pro:        0,  // Free for pool hall owners
  enterprise: 0,  // Free for pool hall owners
} as const satisfies Record<OperatorPlanId, number>;

export const OPERATOR_PRICES_ANNUAL_CENTS = {
  starter:    0,  // Free for pool hall owners
  pro:        0,  // Free for pool hall owners
  enterprise: 0,  // Free for pool hall owners
} as const satisfies Record<OperatorPlanId, number>;

export const OPERATOR_PRICES_DISPLAY = {
  starter:    "Free",
  pro:        "Free",
  enterprise: "Free",
} as const satisfies Record<OperatorPlanId, string>;

// ─── Service fee rates (basis points: 100 bp = 1%) ───────────────────────────
// Applied to match stake amounts. Winner keeps (100% − fee%).
// Business plan target blended rate: 6% across all active players.
export const STAKE_FEE_BPS = {
  nonMember: 900,  //  9% — no subscription (above market, encourages sign-up)
  free:      800,  //  8% — free tier, limited access
  basic:     500,  //  5% — Basic tier
  premium:   300,  //  3% — Premium tier
  family:    500,  //  5% — Family (adults) — same as Basic
  elite:     200,  //  2% — Elite tier (lowest fee)
} as const satisfies Record<PlanId | "nonMember", number>;

// ─── Max single stake per plan ────────────────────────────────────────────────
export const MAX_STAKE_CENTS = {
  free:    5000,    // $50  — limited, encourages upgrade
  basic:   15000,   // $150
  premium: 50000,   // $500
  family:  15000,   // $150 — same as Basic for adults
  elite:   100000,  // $1,000 (up to $1,100 with trustee approval)
} as const satisfies Record<PlanId, number>;

// ─── Weekly threshold ranges (min/max performance pay target) ─────────────────
export const THRESHOLD_CENTS = {
  free:    { min: 0,    max: 5000   },  // $0–$50 (capped, collect only)
  basic:   { min: 5000, max: 15000  },  // $50–$150
  premium: { min: 5000, max: 50000  },  // $50–$500
  family:  { min: 5000, max: 15000  },  // $50–$150 for adults
  elite:   { min: 5000, max: 100000 },  // $50–$1,000 (+$1,100 with approval)
} as const satisfies Record<PlanId, { min: number; max: number }>;

// ─── Tournament entry fees per plan ──────────────────────────────────────────
export const TOURNAMENT_ENTRY_CENTS = {
  noSub:    4000,  // $40 — no subscription
  free:     4000,  // $40 — same as non-member
  basic:    3600,  // $36
  premium:  3000,  // $30
  family:   3000,  // $30 — adults get same as Premium
  elite:    2500,  // $25 — best deal
  kids:     1500,  // $15 — kids drill challenge entry
} as const;

// ─── Payout timing per plan ───────────────────────────────────────────────────
// Free player tournament winnings are locked until the next Friday payday.
// No upgrade required — prize releases automatically on payday.
export const PAYOUT_TIMING = {
  free:    "Locked until next Friday payday — auto-releases, no upgrade needed",
  basic:   "Tuesday following payout window",
  premium: "Friday–Monday window",
  family:  "Friday–Monday window",
  elite:   "Friday–Monday, priority processing",
} as const satisfies Record<PlanId, string>;

// ─── Active challenge limits ──────────────────────────────────────────────────
export const ACTIVE_CHALLENGE_LIMIT = {
  free:    2,          // 2 active challenges max
  basic:   Infinity,   // unlimited
  premium: Infinity,   // unlimited
  family:  Infinity,   // unlimited
  elite:   Infinity,   // unlimited
} as const satisfies Record<PlanId, number>;

// ─── Revenue splits (from match stake service fee) ────────────────────────────
// Platform = 85%, Operators = 8%, Hall Owner = 7%
// Operators receive a reduced revenue share since they no longer pay a subscription fee.
export const REVENUE_SPLITS = {
  platform:  0.85,
  operators: 0.08,
  hallOwner: 0.07,
} as const;

// ─── Consistency bonuses (hit threshold N consecutive weeks) ─────────────────
export const CONSISTENCY_BONUSES_CENTS = [
  { weeksRequired: 3,  bonusCents: 2500,  badge: null },
  { weeksRequired: 6,  bonusCents: 5000,  badge: null },
  { weeksRequired: 12, bonusCents: 10000, badge: "Consistency Champion" },
  { weeksRequired: 26, bonusCents: 20000, badge: "Half-Year Legend" },
] as const;

// ─── Plan details (human-readable for UI) ────────────────────────────────────
export interface PlanDetail {
  id: PlanId;
  name: string;
  emoji: string;
  priceDisplay: string;
  priceAnnualDisplay: string;
  priceCents: number;
  priceAnnualCents: number;
  maxStakeCents: number;
  stakeFeeBps: number;
  tournamentEntryCents: number;
  payoutTiming: string;
  activeChallengeLimit: number | typeof Infinity;
  includes: string[];
  badgeExchange: string;
  note: string;
  popular?: boolean;
}

export const PLANS: Record<PlanId, PlanDetail> = {
  free: {
    id: "free",
    name: "Free",
    emoji: "🎱",
    priceDisplay: PLAN_PRICES_DISPLAY.free,
    priceAnnualDisplay: PLAN_PRICES_ANNUAL_DISPLAY.free,
    priceCents: PLAN_PRICES_CENTS.free,
    priceAnnualCents: PLAN_PRICES_ANNUAL_CENTS.free,
    maxStakeCents: MAX_STAKE_CENTS.free,
    stakeFeeBps: STAKE_FEE_BPS.free,
    tournamentEntryCents: TOURNAMENT_ENTRY_CENTS.free,
    payoutTiming: PAYOUT_TIMING.free,
    activeChallengeLimit: ACTIVE_CHALLENGE_LIMIT.free,
    includes: [
      "Player profile & career page",
      "Basic ladder participation",
      "2 active challenges at a time",
      "Match history tracking",
      "Service fee: 8% per match stake",
      "Max single stake: $50",
      "Tournament winnings locked until next Friday payday — releases automatically",
      "Earn all 48 rewards — collect only, no cashout",
    ],
    badgeExchange: "Locked",
    note: "Get on the ladder, build your record. Tournament prizes release every Friday — no upgrade needed.",
  },
  basic: {
    id: "basic",
    name: "Basic",
    emoji: "⭐",
    priceDisplay: PLAN_PRICES_DISPLAY.basic,
    priceAnnualDisplay: PLAN_PRICES_ANNUAL_DISPLAY.basic,
    priceCents: PLAN_PRICES_CENTS.basic,
    priceAnnualCents: PLAN_PRICES_ANNUAL_CENTS.basic,
    maxStakeCents: MAX_STAKE_CENTS.basic,
    stakeFeeBps: STAKE_FEE_BPS.basic,
    tournamentEntryCents: TOURNAMENT_ENTRY_CENTS.basic,
    payoutTiming: PAYOUT_TIMING.basic,
    activeChallengeLimit: ACTIVE_CHALLENGE_LIMIT.basic,
    includes: [
      "Unlimited challenges",
      "Earnings dashboard — track every dollar",
      "Service fee: 5% per match stake",
      "Max single stake: $150",
      "Weekly threshold: $50–$150",
      "Performance pay: Tuesday after window",
      "Badge exchange: gear & event entries",
      "Tournament entry: $36",
    ],
    badgeExchange: "Gear and event entries only",
    note: "Serious competitor. Full platform access, 5% fee, on-schedule pay.",
  },
  premium: {
    id: "premium",
    name: "Premium",
    emoji: "👑",
    priceDisplay: PLAN_PRICES_DISPLAY.premium,
    priceAnnualDisplay: PLAN_PRICES_ANNUAL_DISPLAY.premium,
    priceCents: PLAN_PRICES_CENTS.premium,
    priceAnnualCents: PLAN_PRICES_ANNUAL_CENTS.premium,
    maxStakeCents: MAX_STAKE_CENTS.premium,
    stakeFeeBps: STAKE_FEE_BPS.premium,
    tournamentEntryCents: TOURNAMENT_ENTRY_CENTS.premium,
    payoutTiming: PAYOUT_TIMING.premium,
    activeChallengeLimit: ACTIVE_CHALLENGE_LIMIT.premium,
    popular: true,
    includes: [
      "Everything in Basic",
      "Priority matchmaking & challenge scheduling",
      "Coach marketplace access",
      "Advanced analytics: win rate, earnings history, Fargo progression",
      "Service fee: 3% — major reduction",
      "Max single stake: $500",
      "Weekly threshold: $50–$500",
      "Performance pay: Fri–Mon window",
      "Full cashout on all 48 rewards",
      "Badge exchange: Full — cash payouts up to $100/wk",
      "Tournament entry: $30 (save $10 per event)",
      "No platform ads",
      "Verified Premium badge on profile",
    ],
    badgeExchange: "Full — including cash payouts up to $100/week",
    note: "The most popular tier. Priority matching, coach access, no ads, 3% fee.",
  },
  family: {
    id: "family",
    name: "Family Plan",
    emoji: "👨‍👩‍👧",
    priceDisplay: PLAN_PRICES_DISPLAY.family,
    priceAnnualDisplay: PLAN_PRICES_ANNUAL_DISPLAY.family,
    priceCents: PLAN_PRICES_CENTS.family,
    priceAnnualCents: PLAN_PRICES_ANNUAL_CENTS.family,
    maxStakeCents: MAX_STAKE_CENTS.family,
    stakeFeeBps: STAKE_FEE_BPS.family,
    tournamentEntryCents: TOURNAMENT_ENTRY_CENTS.family,
    payoutTiming: PAYOUT_TIMING.family,
    activeChallengeLimit: ACTIVE_CHALLENGE_LIMIT.family,
    includes: [
      "Up to 4 player profiles under one account",
      "Shared earnings dashboard across all profiles",
      "All adults: Basic-level stakes, 5% fee, Fri–Mon pay",
      "Tournament entry: $30 for adults",
      "Add-on: +$3.99/child under 12 · +$4.99/teen 13–17",
      "Kids: Drill challenges & competitions only — no match stakes",
    ],
    badgeExchange: "Gear and event entries only",
    note: "Four people for one price. Best deal for competitive families.",
  },
  elite: {
    id: "elite",
    name: "Elite Player",
    emoji: "🏆",
    priceDisplay: PLAN_PRICES_DISPLAY.elite,
    priceAnnualDisplay: PLAN_PRICES_ANNUAL_DISPLAY.elite,
    priceCents: PLAN_PRICES_CENTS.elite,
    priceAnnualCents: PLAN_PRICES_ANNUAL_CENTS.elite,
    maxStakeCents: MAX_STAKE_CENTS.elite,
    stakeFeeBps: STAKE_FEE_BPS.elite,
    tournamentEntryCents: TOURNAMENT_ENTRY_CENTS.elite,
    payoutTiming: PAYOUT_TIMING.elite,
    activeChallengeLimit: ACTIVE_CHALLENGE_LIMIT.elite,
    includes: [
      "Everything in Premium",
      "Elite Player badge — publicly certified ranking",
      "Travel challenge access: cross-city & cross-state",
      "Service fee: 2% — platform minimum",
      "Max single stake: $1,000 (up to $1,100 with approval)",
      "Weekly threshold: $50–$1,000+",
      "Performance pay: Fri–Mon, priority processing",
      "Full cashout on all 48 rewards",
      "Badge exchange: Full — cash payouts up to $100/wk",
      "Tournament entry: $25 (save $15 per event)",
      "AI opponent scouting & performance coaching",
      "VIP tournament seeding",
      "Dedicated support line",
    ],
    badgeExchange: "Full — including cash payouts up to $100/week",
    note: "For top competitors. Certified ranking, travel challenges, lowest fee in the house.",
  },
};

// ─── Operator Plan Details ────────────────────────────────────────────────────
export interface OperatorPlanDetail {
  id: OperatorPlanId;
  name: string;
  emoji: string;
  priceDisplay: string;
  priceAnnualDisplay: string;
  priceCents: number;
  priceAnnualCents: number;
  maxHalls: number | typeof Infinity;
  maxPlayers: number | typeof Infinity;
  includes: string[];
  note: string;
}

export const OPERATOR_PLANS: Record<OperatorPlanId, OperatorPlanDetail> = {
  starter: {
    id: "starter",
    name: "Operator Starter",
    emoji: "🏠",
    priceDisplay: OPERATOR_PRICES_DISPLAY.starter,
    priceAnnualDisplay: "Free",
    priceCents: OPERATOR_PRICES_CENTS.starter,
    priceAnnualCents: OPERATOR_PRICES_ANNUAL_CENTS.starter,
    maxHalls: 1,
    maxPlayers: 100,
    includes: [
      "Free access — no subscription fee",
      "1 hall registration",
      "Up to 100 active players",
      "Basic analytics dashboard",
      "Ladder & division management",
      "QR check-in system",
      "Challenge & match oversight",
      "Basic dispute tools",
      "8% revenue share on match service fees",
    ],
    note: "Free for pool hall owners. No subscription required to run your hall on the platform.",
  },
  pro: {
    id: "pro",
    name: "Operator Pro",
    emoji: "🏢",
    priceDisplay: OPERATOR_PRICES_DISPLAY.pro,
    priceAnnualDisplay: "Free",
    priceCents: OPERATOR_PRICES_CENTS.pro,
    priceAnnualCents: OPERATOR_PRICES_ANNUAL_CENTS.pro,
    maxHalls: 3,
    maxPlayers: Infinity,
    includes: [
      "Free access — no subscription fee",
      "Up to 3 hall locations",
      "Unlimited active players",
      "Full analytics: revenue per table, peak hours, player retention",
      "API access for integrations",
      "Tournament hosting tools",
      "8% revenue share on on-premises match service fees",
      "Advanced dispute arbitration",
      "Hall-vs-hall battle events",
    ],
    note: "Free for multi-location operators. Full data and control at no monthly cost.",
  },
  enterprise: {
    id: "enterprise",
    name: "Operator Enterprise",
    emoji: "🏛️",
    priceDisplay: OPERATOR_PRICES_DISPLAY.enterprise,
    priceAnnualDisplay: "Free",
    priceCents: OPERATOR_PRICES_CENTS.enterprise,
    priceAnnualCents: OPERATOR_PRICES_ANNUAL_CENTS.enterprise,
    maxHalls: Infinity,
    maxPlayers: Infinity,
    includes: [
      "Free access — no subscription fee",
      "Unlimited hall locations",
      "White-label branding option",
      "Dedicated account manager & support",
      "Custom analytics & reporting",
      "Priority onboarding for new locations",
      "Custom ladder rules & division configurations",
      "Streaming integration support",
      "SLA: 99.9% uptime guarantee",
    ],
    note: "Free for chains, franchises, and regional operators. Full white-glove service at no cost.",
  },
};

// ─── Helper functions ─────────────────────────────────────────────────────────

/** Convert cents to display string: 2999 → "$29.99" */
export function centsToDisplay(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(2)}`;
}

/** Get stake fee percentage as a human-readable string: 300 → "3%" */
export function feeBpsToDisplay(bps: number): string {
  return `${bps / 100}%`;
}

/** Calculate platform service fee on a given stake amount in cents */
export function calcStakeFee(stakeCents: number, planId: PlanId | "nonMember"): number {
  const bps = STAKE_FEE_BPS[planId];
  return Math.ceil(stakeCents * bps / 10000);
}

/** Calculate how much winner keeps after platform service fee */
export function calcWinnerKeeps(stakeCents: number, planId: PlanId | "nonMember"): number {
  return stakeCents - calcStakeFee(stakeCents, planId);
}

/** Check if a plan allows unlimited challenges */
export function hasUnlimitedChallenges(planId: PlanId): boolean {
  return ACTIVE_CHALLENGE_LIMIT[planId] === Infinity;
}
