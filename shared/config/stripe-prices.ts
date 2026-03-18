/**
 * stripe-prices.ts — Central registry of all Stripe Price IDs.
 *
 * WHY THIS FILE EXISTS:
 *   Price IDs were hardcoded in multiple places in routes.ts and referenced inconsistently.
 *   This file consolidates them and supports env-var overrides so the same codebase
 *   can work against different Stripe accounts (test vs. live).
 *
 * USAGE:
 *   import { STRIPE_PRICES } from "../../shared/config/stripe-prices";
 *   const priceId = STRIPE_PRICES.player.basic;
 *
 * ENV OVERRIDES:
 *   Set STRIPE_PRICE_FREE, STRIPE_PRICE_BASIC, etc. in your .env to override defaults.
 *   This lets staging use different prices than production.
 *
 * TIERS (aligned with Master Business Plan v1.0):
 *   Player:   free ($0) | basic ($9.99) | premium ($19.99) | family ($29.99) | elite ($49.99)
 *   Operator: starter ($99) | pro ($199) | enterprise ($499)
 */

// ─── Player subscription plan price IDs ───────────────────────────────────────
const playerPrices = {
  // Monthly price IDs — override via environment variables for production.
  free:    process.env.STRIPE_PRICE_FREE    ?? "price_free_placeholder",
  basic:   process.env.STRIPE_PRICE_BASIC   ?? "price_basic_placeholder",
  premium: process.env.STRIPE_PRICE_PREMIUM ?? "price_premium_placeholder",
  family:  process.env.STRIPE_PRICE_FAMILY  ?? "price_family_placeholder",
  elite:   process.env.STRIPE_PRICE_ELITE   ?? "price_elite_placeholder",
  // Add-on prices
  childUnder12: process.env.STRIPE_PRICE_CHILD ?? "price_child_placeholder",
  teen13to17:   process.env.STRIPE_PRICE_TEEN  ?? "price_teen_placeholder",
} as const;

// ─── Annual player price IDs ───────────────────────────────────────────────────
const playerPricesAnnual = {
  basic:   process.env.STRIPE_PRICE_BASIC_ANNUAL   ?? "price_basic_annual_placeholder",
  premium: process.env.STRIPE_PRICE_PREMIUM_ANNUAL ?? "price_premium_annual_placeholder",
  family:  process.env.STRIPE_PRICE_FAMILY_ANNUAL  ?? "price_family_annual_placeholder",
  elite:   process.env.STRIPE_PRICE_ELITE_ANNUAL   ?? "price_elite_annual_placeholder",
} as const;

// ─── Operator tier price IDs ───────────────────────────────────────────────────
const operatorPrices = {
  starter:    process.env.STRIPE_PRICE_OP_STARTER    ?? process.env.SMALL_PRICE_ID  ?? "price_op_starter_placeholder",
  pro:        process.env.STRIPE_PRICE_OP_PRO        ?? process.env.MEDIUM_PRICE_ID ?? "price_op_pro_placeholder",
  enterprise: process.env.STRIPE_PRICE_OP_ENTERPRISE ?? process.env.LARGE_PRICE_ID  ?? "price_op_enterprise_placeholder",
} as const;

// ─── Annual operator price IDs ─────────────────────────────────────────────────
const operatorPricesAnnual = {
  starter:    process.env.STRIPE_PRICE_OP_STARTER_ANNUAL    ?? "price_op_starter_annual_placeholder",
  pro:        process.env.STRIPE_PRICE_OP_PRO_ANNUAL        ?? "price_op_pro_annual_placeholder",
  enterprise: process.env.STRIPE_PRICE_OP_ENTERPRISE_ANNUAL ?? "price_op_enterprise_annual_placeholder",
} as const;

// ─── Charity / donation price IDs ─────────────────────────────────────────────
const charityPrices = {
  oneTime:   process.env.STRIPE_PRICE_CHARITY_ONE_TIME   ?? "price_charity_one_time_placeholder",
  recurring: process.env.STRIPE_PRICE_CHARITY_RECURRING  ?? "price_charity_recurring_placeholder",
} as const;

// ─── Exports ───────────────────────────────────────────────────────────────────
export const STRIPE_PRICES = {
  player:         playerPrices,
  playerAnnual:   playerPricesAnnual,
  operator:       operatorPrices,
  operatorAnnual: operatorPricesAnnual,
  charity:        charityPrices,
} as const;

// Flat lookup for quick access by plan ID string (monthly)
export const PLAYER_PRICE_IDS: Record<string, string> = {
  free:         playerPrices.free,
  basic:        playerPrices.basic,
  premium:      playerPrices.premium,
  family:       playerPrices.family,
  elite:        playerPrices.elite,
  childUnder12: playerPrices.childUnder12,
  teen13to17:   playerPrices.teen13to17,
};

// Flat lookup for annual player prices
export const PLAYER_PRICE_IDS_ANNUAL: Record<string, string> = {
  basic:   playerPricesAnnual.basic,
  premium: playerPricesAnnual.premium,
  family:  playerPricesAnnual.family,
  elite:   playerPricesAnnual.elite,
};

export const OPERATOR_PRICE_IDS: Record<string, string> = {
  starter:    operatorPrices.starter,
  pro:        operatorPrices.pro,
  enterprise: operatorPrices.enterprise,
};

export const OPERATOR_PRICE_IDS_ANNUAL: Record<string, string> = {
  starter:    operatorPricesAnnual.starter,
  pro:        operatorPricesAnnual.pro,
  enterprise: operatorPricesAnnual.enterprise,
};

// Type guards
const ALL_PRICE_IDS = new Set<string>([
  ...Object.values(playerPrices),
  ...Object.values(playerPricesAnnual),
  ...Object.values(operatorPrices),
  ...Object.values(operatorPricesAnnual),
  ...Object.values(charityPrices),
]);

export function isValidPriceId(id: string): boolean {
  return ALL_PRICE_IDS.has(id);
}
