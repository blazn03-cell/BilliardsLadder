import { db } from "../config/db";
import { users, rackPointsLedger } from "@shared/schema";
import { eq, sql, desc } from "drizzle-orm";

/**
 * Rack Points Service
 *
 * The single chokepoint for every Rack Points transaction. Every earn, spend,
 * or admin adjustment in the system flows through these functions.
 *
 * Design rules:
 *   - Atomicity: balance update + ledger insert happen in one transaction.
 *     The ledger's `balance_after` is always consistent with users.rack_points.
 *   - Streak math is UTC-based to avoid timezone edge cases.
 *   - Award functions are no-ops on missing userId (never throw — points are
 *     promotional, they should never block a user-facing action).
 *   - All reasons are short string codes so analytics queries stay simple.
 */

export type AwardReason =
  | "login_streak"
  | "match_win"
  | "upset_bonus"
  | "admin_adjustment"
  | string; // future codes — typed loosely on purpose

export type StreakResult = "extended" | "held" | "reset" | "started";

export interface AwardOptions {
  refType?: "match" | "challenge" | "admin" | string | null;
  refId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RackPointsState {
  rackPoints: number;
  streakDays: number;
  streakLastDay: string | null;
}

/**
 * Returns today's date in UTC as a YYYY-MM-DD string.
 * Used as the streak day key — chosen so streaks behave identically
 * for every user regardless of their local timezone.
 */
function utcDateString(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Difference in calendar days between two YYYY-MM-DD strings (UTC).
 * Returns positive if `b` is after `a`.
 */
function daysBetween(a: string, b: string): number {
  const ms = Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z");
  return Math.round(ms / 86_400_000);
}

/**
 * Award points to a user. Atomic: balance + ledger update together.
 * Returns the new state, or null if the userId was missing or the user doesn't exist.
 */
export async function award(
  userId: string | undefined | null,
  amount: number,
  reason: AwardReason,
  opts: AwardOptions = {}
): Promise<RackPointsState | null> {
  if (!userId || !Number.isFinite(amount) || amount === 0) return null;
  const delta = Math.trunc(amount);

  try {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(users)
        .set({ rackPoints: sql`${users.rackPoints} + ${delta}` })
        .where(eq(users.id, userId))
        .returning({
          rackPoints: users.rackPoints,
          streakDays: users.streakDays,
          streakLastDay: users.streakLastDay,
        });

      if (!updated) return null;

      await tx.insert(rackPointsLedger).values({
        userId,
        delta,
        balanceAfter: updated.rackPoints,
        reason,
        refType: opts.refType ?? null,
        refId: opts.refId ?? null,
        metadata: opts.metadata ?? null,
      });

      return {
        rackPoints: updated.rackPoints,
        streakDays: updated.streakDays,
        streakLastDay: updated.streakLastDay,
      };
    });
  } catch (err: any) {
    console.warn(`[rackPoints.award] failed for user ${userId}:`, err?.message);
    return null;
  }
}

/**
 * Deduct points from a user. Reserved for the future spending menu.
 * Returns the new state, or null if balance is insufficient or user is missing.
 *
 * Phase 1: stubbed but unused — the redemption store comes in Phase 2.
 */
export async function deduct(
  userId: string | undefined | null,
  amount: number,
  reason: string,
  opts: AwardOptions = {}
): Promise<RackPointsState | null> {
  if (!userId || !Number.isFinite(amount) || amount <= 0) return null;
  const cost = Math.trunc(amount);

  try {
    return await db.transaction(async (tx) => {
      const [current] = await tx
        .select({ rackPoints: users.rackPoints })
        .from(users)
        .where(eq(users.id, userId))
        .for("update");

      if (!current || current.rackPoints < cost) return null;

      const [updated] = await tx
        .update(users)
        .set({ rackPoints: sql`${users.rackPoints} - ${cost}` })
        .where(eq(users.id, userId))
        .returning({
          rackPoints: users.rackPoints,
          streakDays: users.streakDays,
          streakLastDay: users.streakLastDay,
        });

      if (!updated) return null;

      await tx.insert(rackPointsLedger).values({
        userId,
        delta: -cost,
        balanceAfter: updated.rackPoints,
        reason,
        refType: opts.refType ?? null,
        refId: opts.refId ?? null,
        metadata: opts.metadata ?? null,
      });

      return {
        rackPoints: updated.rackPoints,
        streakDays: updated.streakDays,
        streakLastDay: updated.streakLastDay,
      };
    });
  } catch (err: any) {
    console.warn(`[rackPoints.deduct] failed for user ${userId}:`, err?.message);
    return null;
  }
}

/**
 * Extend (or hold or reset) the user's daily login streak.
 *
 *   - "started": user had no prior streak — set to 1
 *   - "extended": last extension was yesterday — increment to N+1
 *   - "held": last extension was already today — no change
 *   - "reset": gap of 2+ days — restart at 1
 *
 * Returns { result, streakDays } so the caller knows whether to award the
 * login bonus (only on "started" or "extended").
 */
export async function extendStreak(
  userId: string | undefined | null
): Promise<{ result: StreakResult; streakDays: number } | null> {
  if (!userId) return null;
  const today = utcDateString();

  try {
    return await db.transaction(async (tx) => {
      const [user] = await tx
        .select({
          streakDays: users.streakDays,
          streakLastDay: users.streakLastDay,
        })
        .from(users)
        .where(eq(users.id, userId))
        .for("update");

      if (!user) return null;

      let result: StreakResult;
      let newDays: number;

      if (!user.streakLastDay) {
        result = "started";
        newDays = 1;
      } else if (user.streakLastDay === today) {
        return { result: "held", streakDays: user.streakDays };
      } else {
        const gap = daysBetween(user.streakLastDay, today);
        if (gap === 1) {
          result = "extended";
          newDays = user.streakDays + 1;
        } else {
          result = "reset";
          newDays = 1;
        }
      }

      await tx
        .update(users)
        .set({ streakDays: newDays, streakLastDay: today })
        .where(eq(users.id, userId));

      return { result, streakDays: newDays };
    });
  } catch (err: any) {
    console.warn(`[rackPoints.extendStreak] failed for user ${userId}:`, err?.message);
    return null;
  }
}

/**
 * Read-only state fetcher for the UI badge.
 */
export async function getRackPointsState(
  userId: string
): Promise<RackPointsState | null> {
  try {
    const [row] = await db
      .select({
        rackPoints: users.rackPoints,
        streakDays: users.streakDays,
        streakLastDay: users.streakLastDay,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return row ?? null;
  } catch (err: any) {
    console.warn(`[rackPoints.getRackPointsState] failed for user ${userId}:`, err?.message);
    return null;
  }
}

/**
 * Recent ledger entries for a user — used by the admin tools and (later) the
 * player's own activity feed.
 */
export async function getLedger(userId: string, limit = 50) {
  try {
    return await db
      .select()
      .from(rackPointsLedger)
      .where(eq(rackPointsLedger.userId, userId))
      .orderBy(desc(rackPointsLedger.createdAt))
      .limit(limit);
  } catch (err: any) {
    console.warn(`[rackPoints.getLedger] failed for user ${userId}:`, err?.message);
    return [];
  }
}
