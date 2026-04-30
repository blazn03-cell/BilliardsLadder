import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { db } from "../config/db";
import { rackPointsLedger, users } from "@shared/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import * as rackPoints from "../services/rackPointsService";

/**
 * Admin tools for Rack Points.
 *
 * These endpoints let staff/owner manually grant or revoke points (for
 * dispute resolution, manual rewards, refunds for buggy match results, etc).
 *
 * Every adjustment writes a ledger row with:
 *   - reason   = "admin_adjustment"
 *   - refType  = "admin"
 *   - refId    = a fresh UUID (so the partial-unique index never collides)
 *   - metadata = { adminId, adminEmail?, note }
 *
 * Auth: gated by `requireStaffOrOwner` at the route level — same permission
 * level as the existing user ban/suspend tools.
 */

const adjustBodySchema = z.object({
  userId: z.string().min(1, "userId is required").max(128),
  delta: z
    .number()
    .int("delta must be an integer")
    .refine((n) => n !== 0, "delta cannot be zero")
    .refine((n) => Math.abs(n) <= 100_000, "delta exceeds ±100,000 cap"),
  note: z.string().trim().max(500).optional(),
});

function getAdminId(req: Request): string | null {
  const u: any = req.user;
  const raw = u?.claims?.sub ?? u?.id;
  return raw == null ? null : String(raw);
}

export async function adjustRackPoints(req: Request, res: Response) {
  const adminId = getAdminId(req);
  if (!adminId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const parsed = adjustBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid request",
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }
  const { userId, delta, note } = parsed.data;

  // Confirm the target user exists so we can return a clean 404 instead of
  // a silent no-op (award/deduct return null on missing user).
  const [targetUser] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, userId));

  if (!targetUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const refId = randomUUID();
  const metadata = {
    adminId,
    note: note || null,
    source: "admin_panel",
  };

  let result;
  if (delta > 0) {
    result = await rackPoints.award(userId, delta, "admin_adjustment", {
      refType: "admin",
      refId,
      metadata,
    });
  } else {
    // Negative delta: deduct() takes a positive amount.
    result = await rackPoints.deduct(
      userId,
      Math.abs(delta),
      "admin_adjustment",
      { refType: "admin", refId, metadata },
    );
    if (!result) {
      return res
        .status(409)
        .json({ error: "Insufficient balance for deduction" });
    }
  }

  if (!result) {
    return res.status(500).json({ error: "Adjustment failed" });
  }

  return res.json({
    ok: true,
    target: { id: targetUser.id, email: targetUser.email, name: targetUser.name },
    delta,
    state: result,
  });
}

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export async function getRecentAdjustments(req: Request, res: Response) {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query" });
  }
  const { limit } = parsed.data;

  const rows = await db
    .select({
      id: rackPointsLedger.id,
      userId: rackPointsLedger.userId,
      delta: rackPointsLedger.delta,
      balanceAfter: rackPointsLedger.balanceAfter,
      metadata: rackPointsLedger.metadata,
      createdAt: rackPointsLedger.createdAt,
      targetEmail: users.email,
      targetName: users.name,
    })
    .from(rackPointsLedger)
    .leftJoin(users, eq(users.id, rackPointsLedger.userId))
    .where(eq(rackPointsLedger.reason, "admin_adjustment"))
    .orderBy(desc(rackPointsLedger.createdAt))
    .limit(limit);

  return res.json(rows);
}
