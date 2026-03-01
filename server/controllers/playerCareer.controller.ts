import { Request, Response } from "express";
import { db } from "../config/db";
import { eq, and, sql, gte } from "drizzle-orm";
import Stripe from "stripe";
import {
  users, players, serviceListings, serviceBookings,
  playerEarningLedger
} from "../../shared/schema";
import { getStripe } from "../config/stripe";

// ── GET /api/player/career-stats ──────────────────────────────────────────────

export async function getCareerStats(req: Request, res: Response) {
  const user = req.user as any;
  const userId = user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const [player] = await db.select().from(players).where(eq(players.userId, userId)).limit(1);

  if (!dbUser || !player) return res.status(404).json({ error: "Player not found" });

  const activeServicesResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(serviceListings)
    .where(and(eq(serviceListings.sellerUserId, userId), eq(serviceListings.status, "active")));

  const deliveredResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(serviceBookings)
    .where(and(eq(serviceBookings.sellerUserId, userId), eq(serviceBookings.status, "delivered")));

  const fargo = player.rating || 500;
  const delivered = Number(deliveredResult[0]?.count || 0);
  let careerLevel: "ROOKIE" | "HUSTLER" | "PRO" | "LEGEND" = "ROOKIE";
  if (fargo >= 700 && delivered >= 50) careerLevel = "LEGEND";
  else if (fargo >= 600 && delivered >= 20) careerLevel = "PRO";
  else if (fargo >= 500 && delivered >= 5) careerLevel = "HUSTLER";

  res.json({
    playerName: player.name,
    careerLevel,
    fargoRating: fargo,
    ladderRank: player.points ? Math.max(1, Math.floor((1000 - player.points) / 10)) : 99,
    reliabilityScore: 100,
    totalServicesDelivered: delivered,
    fiveStarReviews: delivered,
    activeBookings: Number(activeServicesResult[0]?.count || 0),
    followerCount: player.respectPoints || 0,
  });
}

// ── GET /api/player/earnings ──────────────────────────────────────────────────

export async function getPlayerEarnings(req: Request, res: Response) {
  const user = req.user as any;
  const userId = user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!dbUser) return res.status(404).json({ error: "User not found" });

  const now = new Date();

  const pendingResult = await db
    .select({ total: sql<number>`coalesce(sum(amount_cents), 0)` })
    .from(playerEarningLedger)
    .where(and(
      eq(playerEarningLedger.playerUserId, userId),
      eq(playerEarningLedger.entryType, "EARNED")
    ));

  const availableResult = await db
    .select({ total: sql<number>`coalesce(sum(amount_cents), 0)` })
    .from(playerEarningLedger)
    .where(and(
      eq(playerEarningLedger.playerUserId, userId),
      eq(playerEarningLedger.entryType, "AVAILABLE")
    ));

  const paidMonthResult = await db
    .select({ total: sql<number>`coalesce(sum(amount_cents), 0)` })
    .from(playerEarningLedger)
    .where(and(
      eq(playerEarningLedger.playerUserId, userId),
      eq(playerEarningLedger.entryType, "TRANSFERRED"),
      gte(playerEarningLedger.createdAt, new Date(now.getFullYear(), now.getMonth(), 1))
    ));

  const allTimeResult = await db
    .select({ total: sql<number>`coalesce(sum(amount_cents), 0)` })
    .from(playerEarningLedger)
    .where(and(
      eq(playerEarningLedger.playerUserId, userId),
      eq(playerEarningLedger.entryType, "TRANSFERRED")
    ));

  const nextFriday = new Date();
  const daysUntilFriday = (5 - nextFriday.getDay() + 7) % 7 || 7;
  nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);

  let connectStatus: "not_started" | "pending" | "active" | "restricted" = "not_started";
  if (dbUser.stripeConnectId) {
    try {
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(dbUser.stripeConnectId);
      if (account.charges_enabled && account.payouts_enabled) connectStatus = "active";
      else if (account.requirements?.disabled_reason) connectStatus = "restricted";
      else connectStatus = "pending";
    } catch {
      connectStatus = "pending";
    }
  }

  res.json({
    pendingCents: Number(pendingResult[0]?.total || 0),
    availableCents: Number(availableResult[0]?.total || 0),
    paidOutThisMonthCents: Number(paidMonthResult[0]?.total || 0),
    allTimeEarnedCents: Number(allTimeResult[0]?.total || 0),
    nextPayoutDate: nextFriday.toISOString(),
    connectStatus,
  });
}

// ── GET /api/player/services ──────────────────────────────────────────────────

export async function getPlayerServices(req: Request, res: Response) {
  const user = req.user as any;
  const userId = user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const listings = await db
    .select()
    .from(serviceListings)
    .where(eq(serviceListings.sellerUserId, userId))
    .orderBy(serviceListings.createdAt);

  res.json(listings);
}

// ── POST /api/player/services ─────────────────────────────────────────────────

export async function createPlayerService(req: Request, res: Response) {
  const user = req.user as any;
  const userId = user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { serviceType, title, priceCents, description, durationMinutes, isRecurring } = req.body;

  const validTypes = ["COACHING", "EXHIBITION", "CLINIC", "CONTENT_SUB", "APPEARANCE", "TIP"];
  if (!validTypes.includes(serviceType)) {
    return res.status(400).json({ error: "Invalid service type" });
  }

  const meta: Record<string, { defaultTitle: string; defaultPrice: number }> = {
    COACHING: { defaultTitle: "1-on-1 Coaching Session", defaultPrice: 6000 },
    EXHIBITION: { defaultTitle: "Featured Exhibition Match", defaultPrice: 2500 },
    CLINIC: { defaultTitle: "Group Clinic", defaultPrice: 3500 },
    CONTENT_SUB: { defaultTitle: "Player Subscription", defaultPrice: 999 },
    APPEARANCE: { defaultTitle: "Sponsored Appearance", defaultPrice: 15000 },
    TIP: { defaultTitle: "Fan Tip", defaultPrice: 500 },
  };

  const [newListing] = await db.insert(serviceListings).values({
    sellerUserId: userId,
    sellerRole: "PLAYER",
    serviceType,
    title: title || meta[serviceType].defaultTitle,
    description: description || "",
    priceCents: priceCents || meta[serviceType].defaultPrice,
    durationMinutes: durationMinutes || null,
    isRecurring: isRecurring || serviceType === "CONTENT_SUB",
    recurringInterval: (isRecurring || serviceType === "CONTENT_SUB") ? "month" : null,
    status: "draft",
  }).returning();

  res.json(newListing);
}

// ── POST /api/player/services/:id/activate ────────────────────────────────────

export async function activatePlayerService(req: Request, res: Response) {
  const user = req.user as any;
  const userId = user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.params;
  const [listing] = await db.select().from(serviceListings).where(
    and(eq(serviceListings.id, id), eq(serviceListings.sellerUserId, userId))
  ).limit(1);

  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (listing.status === "active") return res.json(listing);

  const stripe = getStripe();

  const product = await stripe.products.create({
    name: listing.title,
    description: listing.description || undefined,
    metadata: { listingId: listing.id, sellerUserId: userId, serviceType: listing.serviceType },
  });

  const priceData: Stripe.PriceCreateParams = {
    product: product.id,
    unit_amount: listing.priceCents,
    currency: listing.currency.toLowerCase(),
  };
  if (listing.isRecurring && listing.recurringInterval) {
    priceData.recurring = { interval: listing.recurringInterval as "month" | "year" };
  }
  const price = await stripe.prices.create(priceData);

  const [updated] = await db.update(serviceListings)
    .set({
      stripeProductId: product.id,
      stripePriceId: price.id,
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(serviceListings.id, id))
    .returning();

  res.json(updated);
}

// ── POST /api/player/withdraw ─────────────────────────────────────────────────

export async function withdrawNow(req: Request, res: Response) {
  const user = req.user as any;
  const userId = user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!dbUser?.stripeConnectId) {
    return res.status(400).json({ error: "No Stripe Connect account linked" });
  }

  const availableResult = await db
    .select({ total: sql<number>`coalesce(sum(amount_cents), 0)` })
    .from(playerEarningLedger)
    .where(and(
      eq(playerEarningLedger.playerUserId, userId),
      eq(playerEarningLedger.entryType, "AVAILABLE")
    ));

  const availableCents = Number(availableResult[0]?.total || 0);
  const MIN_PAYOUT_CENTS = 1000;

  if (availableCents < MIN_PAYOUT_CENTS) {
    return res.status(400).json({
      error: `Minimum withdrawal is $${MIN_PAYOUT_CENTS / 100}. You have $${(availableCents / 100).toFixed(2)} available.`
    });
  }

  const stripe = getStripe();
  const transfer = await stripe.transfers.create({
    amount: availableCents,
    currency: "usd",
    destination: dbUser.stripeConnectId,
    metadata: { reason: "player_manual_withdrawal", userId },
  });

  await db.insert(playerEarningLedger).values({
    playerUserId: userId,
    entryType: "TRANSFERRED",
    amountCents: -availableCents,
    stripeTransferId: transfer.id,
    description: "Manual withdrawal",
  });

  res.json({ transferId: transfer.id, amountCents: availableCents, status: "succeeded" });
}
