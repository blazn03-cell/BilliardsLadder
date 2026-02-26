import express, { type Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { AIService } from "./services/ai-service";
import { setupChallengeCalendarRoutes } from "./routes/challengeCalendar.routes";
import { setupForgotPasswordRoutes } from "./routes/forgotPassword.routes";
import { createICalRoutes } from "./routes/ical.routes";
import { createPosterRoutes } from "./routes/poster.routes";
import { setupPaymentOnboardingRoutes } from "./routes/paymentOnboarding.routes";
import { setupPlayerRoutes } from "./routes/player.routes";
import { setupTournamentRoutes } from "./routes/tournament.routes";
import { setupTeamRoutes } from "./routes/team.routes";
import { setupPoolRoutes } from "./routes/pool.routes";
import { setupFinancialRoutes } from "./routes/financial.routes";
import { setupPredictionRoutes } from "./routes/prediction.routes";
import { setupCharityRoutes } from "./routes/charity.routes";
import { setupTrainingRoutes } from "./routes/training.routes";
import { setupAIRoutes } from "./routes/ai.routes";
import { setupSupportRoutes } from "./routes/support.routes";
import { setupStreamRoutes } from "./routes/stream.routes";
import { setupFileRoutes } from "./routes/file.routes";
import { setupQRRoutes } from "./routes/qr.routes";
import { setupLeagueRoutes } from "./routes/league.routes";
import { setupRookieRoutes } from "./routes/rookie.routes";
import { setupCheckinRoutes } from "./routes/checkin.routes";
import { initializeFeeScheduler } from "./services/feeScheduler";
import { initializeSocketManager } from "./services/challengeSocketEvents";
import { registerAdminRoutes, registerOperatorRoutes } from "./routes/admin.routes";
import { registerMissingRoutes } from "./routes/missing.routes";
import { registerAuthRoutes } from "./routes/auth.routes";
import { registerHallRoutes } from "./routes/hall.routes";
import { registerPlayerBillingRoutes } from "./services/playerBilling";
import { registerQuickChallengeRoutes } from "./routes/quickChallenge.routes";
import { registerRevenueAdminRoutes } from "./routes/revenueAdmin.routes";
import { sanitizeResponse } from "./middleware/sanitizeMiddleware";
import { 
  insertPlayerSchema, insertMatchSchema, insertTournamentSchema,
  insertTournamentCalcuttaSchema, insertCalcuttaBidSchema,
  insertSeasonPredictionSchema, insertPredictionEntrySchema,
  insertAddedMoneyFundSchema,
  insertKellyPoolSchema, insertMoneyGameSchema, insertBountySchema, insertCharityEventSchema,
  insertSupportRequestSchema, insertLiveStreamSchema,
  insertWalletSchema, insertChallengePoolSchema, insertChallengeEntrySchema,
  insertLedgerSchema, insertResolutionSchema,
  insertOperatorSubscriptionSchema,
  insertCheckinSchema, insertAttitudeVoteSchema, insertAttitudeBallotSchema, insertIncidentSchema,
  insertMatchDivisionSchema, insertOperatorTierSchema,
  insertMatchEntrySchema, insertPayoutDistributionSchema,
  insertUploadedFileSchema, insertFileShareSchema,
  insertSessionAnalyticsSchema, insertShotSchema,
  type GlobalRole
} from "@shared/schema";
import { generateCoachInsights } from './services/coachService';
import type { SessionData, CoachTip } from './services/coachService';
import { ObjectStorageService, ObjectNotFoundError } from "./services/objectStorage";
import { ObjectPermission, getObjectAclPolicy } from "./utils/objectAcl";
import { emailService } from "./services/email-service";
import { sanitizeBody, createStripeDescription, sanitizeForStorage } from "./utils/sanitize";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);

// Stripe Price IDs for Billiards Ladder Commission System
const prices = {
  rookie_monthly: "price_1S36UcDc2BliYufwVpgpOph9", // Billiards Ladder Rookie Pass ($20/month → $4 operator commission)
  basic_monthly: "price_1S36UcDc2BliYufwF8R8w5BY", // Billiards Ladder Basic Membership ($25/month → $7 operator commission)
  pro_monthly: "price_1S36UdDc2BliYufwGZmAEVPq", // Billiards Ladder Pro Membership ($60/month → $10 operator commission)
  small: process.env.SMALL_PRICE_ID, // Operator subscription tiers
  medium: process.env.MEDIUM_PRICE_ID,
  large: process.env.LARGE_PRICE_ID,
  mega: process.env.MEGA_PRICE_ID,
  // Charity Donation System
  charity_product: "prod_Sz4wWq0exnJOBv", // Billiards Ladder Charity Donations
  charity_donations: {
    "5": "price_1S36mVDc2BliYufwKkppBTdZ",
    "10": "price_1S36mWDc2BliYufw9SnYauG6", 
    "25": "price_1S36mWDc2BliYufwdLec5IH6",
    "50": "price_1S36mWDc2BliYufwnyruktLt",
    "100": "price_1S36mWDc2BliYufwMMQxtrpd",
    "250": "price_1S36mXDc2BliYufw8KoRGk5g",
    "500": "price_1S36mXDc2BliYufwhW9OUZng"
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Global response sanitization (sanitizes all outgoing text)
  app.use(sanitizeResponse());
  
  // Setup authentication middleware FIRST
  const { setupAuth } = await import("./replitAuth");
  await setupAuth(app);
  
  // Health check endpoint (required for production deployment)
  app.get("/healthz", (_, res) => res.send("ok"));
  
  // Register authentication routes
  registerAuthRoutes(app);
  
  app.get("/api/player/earnings", async (req, res) => {
    try {
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const matches = await storage.getMatchesByPlayer(userId).catch(() => []);
      let wins = 0, losses = 0, draws = 0, totalWinnings = 0, totalLosses = 0;
      let currentStreak = 0, streakType: "win" | "loss" | "none" = "none", bestStreak = 0, tempStreak = 0;

      const recentMatches: any[] = [];
      const monthlyMap = new Map<string, { wins: number; losses: number; draws: number; earnings: number; spent: number }>();

      const sortedMatches = (matches || []).sort((a: any, b: any) =>
        new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime()
      );

      for (const match of sortedMatches) {
        const isWinner = match.winnerId === userId;
        const isDraw = !match.winnerId;
        const amount = (match.challengeAmount || match.entryFee || 0) * 100;
        const matchDate = new Date(match.createdAt || match.date || Date.now());
        const monthKey = matchDate.toLocaleDateString("en-US", { year: "numeric", month: "long" });

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { wins: 0, losses: 0, draws: 0, earnings: 0, spent: 0 });
        }
        const monthly = monthlyMap.get(monthKey)!;

        if (isDraw) {
          draws++;
          monthly.draws++;
        } else if (isWinner) {
          wins++;
          totalWinnings += amount;
          monthly.wins++;
          monthly.earnings += amount;
        } else {
          losses++;
          totalLosses += amount;
          monthly.losses++;
          monthly.spent += amount;
        }

        if (recentMatches.length < 20) {
          const opponentId = match.player1Id === userId ? match.player2Id : match.player1Id;
          const opponent = opponentId ? await storage.getPlayer(opponentId).catch(() => null) : null;
          recentMatches.push({
            id: match.id?.toString() || String(recentMatches.length),
            opponent: (opponent as any)?.name || (opponent as any)?.nickname || "Unknown",
            result: isDraw ? "draw" : isWinner ? "win" : "loss",
            amount,
            date: matchDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            division: match.division || "Open",
          });
        }
      }

      let lastResult: string | null = null;
      for (const match of sortedMatches) {
        const result = !match.winnerId ? "draw" : match.winnerId === userId ? "win" : "loss";
        if (lastResult === null) {
          lastResult = result;
          currentStreak = 1;
          streakType = result === "draw" ? "none" : result as "win" | "loss";
        } else if (result === lastResult && result !== "draw") {
          currentStreak++;
        } else {
          break;
        }
      }

      for (const match of sortedMatches) {
        if (match.winnerId === userId) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      const totalGames = wins + losses + draws;
      const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
      const netEarnings = totalWinnings - totalLosses;

      const monthlyData = Array.from(monthlyMap.entries()).map(([month, data]) => ({
        month,
        ...data,
        net: data.earnings - data.spent,
      }));

      res.json({
        record: {
          totalGames, wins, losses, draws, winRate,
          totalWinnings, totalLosses, netEarnings,
          currentStreak, streakType, bestStreak,
        },
        recentMatches,
        monthlyData,
      });
    } catch (error) {
      console.error("Player earnings error:", error);
      res.json({
        record: {
          totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0,
          totalWinnings: 0, totalLosses: 0, netEarnings: 0,
          currentStreak: 0, streakType: "none", bestStreak: 0,
        },
        recentMatches: [],
        monthlyData: [],
      });
    }
  });

  // Fill all missing frontend→backend route gaps + addictiveness endpoints
  registerMissingRoutes(app);
  
  // Register admin routes for staff management and payouts
  registerAdminRoutes(app);
  
  // Register operator settings routes
  registerOperatorRoutes(app);
  
  // Register player billing and subscription routes
  registerPlayerBillingRoutes(app);
  
  // Register hall vs hall match routes
  registerHallRoutes(app);
  
  // Register financial routes (pricing, billing, refunds, wallet, operator subscriptions, stripe webhook)
  setupFinancialRoutes(app, storage);
  
  // Register prediction routes (season predictions, prediction entries)
  setupPredictionRoutes(app, storage);
  
  // Register charity routes (charity events, bounties, added money funds, jackpot)
  setupCharityRoutes(app, storage);
  
  // Register training routes (training sessions, insights, rewards)
  setupTrainingRoutes(app, storage);
  
  // Register AI routes (coaching, commentary, predictions, analysis)
  setupAIRoutes(app);
  
  // Register support routes (support requests)
  setupSupportRoutes(app, storage);

  // Register stream routes (live streams)
  setupStreamRoutes(app, storage);

  // Register file management routes (object storage)
  setupFileRoutes(app, storage);

  // Register QR registration routes
  setupQRRoutes(app);

  // Register league routes (standings, seasons, stats, upcoming matches)
  setupLeagueRoutes(app, storage);

  // Register rookie routes (rookie matches, events, subscriptions, leaderboard, achievements)
  setupRookieRoutes(app, storage);

  // Register check-in routes (check-ins, attitude votes, incidents)
  setupCheckinRoutes(app, storage);

  // ================================
  // CHALLENGE CALENDAR INTEGRATION
  // ================================
  setupChallengeCalendarRoutes(app, storage, stripe);
  
  // ================================
  // COMPETITIVE DOMAIN ROUTES
  // ================================
  setupPlayerRoutes(app, storage);
  setupTournamentRoutes(app, storage, stripe);
  setupTeamRoutes(app, storage, stripe);
  setupPoolRoutes(app, storage, stripe);
  
  // Quick Challenge Routes
  registerQuickChallengeRoutes(app);
  
  // Revenue Configuration Admin Routes
  registerRevenueAdminRoutes(app);
  
  // iCal Calendar Feed Routes
  app.use('/api/ical', createICalRoutes(storage));
  
  // AI Poster Generation Routes
  app.use('/api/poster', createPosterRoutes(storage));
  
  // Payment Onboarding Routes (SetupIntent collection)
  setupPaymentOnboardingRoutes(app, storage);
  
  // Forgot Password Routes
  setupForgotPasswordRoutes(app);
  
  // Initialize auto fee evaluation scheduler
  initializeFeeScheduler(storage, stripe);

  // Initialize monthly training rewards scheduler
  const { initializeTrainingRewardsScheduler } = await import('./trainingRewardsScheduler');
  initializeTrainingRewardsScheduler(storage);

  const httpServer = createServer(app);
  
  // Initialize Socket.IO for real-time challenge updates
  initializeSocketManager(httpServer, storage);

  return httpServer;
}
