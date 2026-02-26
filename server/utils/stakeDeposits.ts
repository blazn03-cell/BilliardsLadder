/**
 * stakeDeposits.ts
 * Stake deposit calculator — drop-in for match scheduling.
 * All amounts in CENTS (Stripe standard).
 */

export const DEPOSIT_PRICE_IDS = {
  flat:  "price_1T50geDc2BliYufwadeCDY0p",  // $20.00 — stakes ≤ $300
  pct10: "price_1T50u0Dc2BliYufwZyNxLfBc",  // 10%    — stakes $301–$1,000
  pct7:  "price_1T50u2Dc2BliYufwL3u2vZGi",  // 7%     — stakes $1,001–$5,000
  pct5:  "price_1T50u5Dc2BliYufwBztjlQtg",  // 5%     — stakes $5,001+
};

export interface DepositResult {
  depositAmount: number;       // cents to charge each player
  depositPercent: number | null;
  priceId: string;
  tier: "flat" | "10pct" | "7pct" | "5pct";
  description: string;
}

export function calcStakeDeposit(stakeAmountCents: number): DepositResult {
  if (stakeAmountCents <= 30000) {
    return {
      depositAmount: 2000,
      depositPercent: null,
      priceId: DEPOSIT_PRICE_IDS.flat,
      tier: "flat",
      description: "Flat $20.00 commitment deposit",
    };
  }
  if (stakeAmountCents <= 100000) {
    const amt = Math.round(stakeAmountCents * 0.10);
    return {
      depositAmount: amt, depositPercent: 10,
      priceId: DEPOSIT_PRICE_IDS.pct10, tier: "10pct",
      description: `10% deposit — $${(amt / 100).toFixed(2)}`,
    };
  }
  if (stakeAmountCents <= 500000) {
    const amt = Math.round(stakeAmountCents * 0.07);
    return {
      depositAmount: amt, depositPercent: 7,
      priceId: DEPOSIT_PRICE_IDS.pct7, tier: "7pct",
      description: `7% deposit — $${(amt / 100).toFixed(2)}`,
    };
  }
  const amt = Math.round(stakeAmountCents * 0.05);
  return {
    depositAmount: amt, depositPercent: 5,
    priceId: DEPOSIT_PRICE_IDS.pct5, tier: "5pct",
    description: `5% deposit — $${(amt / 100).toFixed(2)}`,
  };
}
