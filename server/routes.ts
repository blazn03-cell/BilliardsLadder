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

  // Player Queue (Join Page) - in-memory store
  const playerQueue: any[] = [];

  app.get("/api/player-queue", (_req, res) => {
    res.json(playerQueue);
  });

  app.post("/api/player-queue", (req, res) => {
    const { name, email, phone, city, experience, preferredGames } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    const entry = {
      id: crypto.randomUUID(),
      name,
      email,
      phone: phone || "",
      city: city || "",
      experience: experience || "intermediate",
      preferredGames: preferredGames || [],
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    playerQueue.push(entry);
    res.status(201).json(entry);
  });

  app.get("/api/player/earnings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const userId = (req.user as any).id;
      const allMatches = await storage.getMatches();
      const playerMatches = allMatches.filter(
        (m: any) => (m.player1Id === userId || m.player2Id === userId) && m.status === "completed"
      );

      let wins = 0, losses = 0, draws = 0;
      let totalWinnings = 0, totalLosses = 0;
      let currentStreak = 0, bestStreak = 0;
      let streakType: "win" | "loss" | "none" = "none";
      const recentMatches: any[] = [];
      const monthlyMap = new Map<string, any>();

      const sorted = playerMatches.sort((a: any, b: any) =>
        new Date(a.completedAt || a.createdAt).getTime() - new Date(b.completedAt || b.createdAt).getTime()
      );

      let tempStreak = 0;
      let tempStreakType: "win" | "loss" | "none" = "none";

      for (const match of sorted) {
        const isPlayer1 = match.player1Id === userId;
        let result: "win" | "loss" | "draw";
        const amount = match.entryFee || 0;

        if (match.winnerId === userId) {
          result = "win";
          wins++;
          totalWinnings += amount;
          if (tempStreakType === "win") { tempStreak++; } else { tempStreak = 1; tempStreakType = "win"; }
        } else if (match.winnerId) {
          result = "loss";
          losses++;
          totalLosses += amount;
          if (tempStreakType === "loss") { tempStreak++; } else { tempStreak = 1; tempStreakType = "loss"; }
        } else {
          result = "draw";
          draws++;
          tempStreak = 0;
          tempStreakType = "none";
        }

        if (tempStreakType === "win" && tempStreak > bestStreak) bestStreak = tempStreak;

        const matchDate = new Date(match.completedAt || match.createdAt);
        const monthKey = matchDate.toLocaleString("en-US", { month: "long", year: "numeric" });

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { month: monthKey, wins: 0, losses: 0, draws: 0, earnings: 0, spent: 0, net: 0 });
        }
        const m = monthlyMap.get(monthKey);
        if (result === "win") { m.wins++; m.earnings += amount; }
        else if (result === "loss") { m.losses++; m.spent += amount; }
        else { m.draws++; }
        m.net = m.earnings - m.spent;

        const players = await storage.getPlayers();
        const opponentId = isPlayer1 ? match.player2Id : match.player1Id;
        const opponent = players.find((p: any) => p.id === opponentId);

        recentMatches.push({
          id: match.id,
          opponent: opponent?.nickname || opponent?.username || "Unknown",
          result,
          amount,
          date: matchDate.toLocaleDateString(),
          division: match.division || "Open",
        });
      }

      currentStreak = tempStreak;
      streakType = tempStreakType;
      const totalGames = wins + losses + draws;
      const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
      const netEarnings = totalWinnings - totalLosses;

      res.json({
        record: {
          totalGames, wins, losses, draws, winRate,
          totalWinnings, totalLosses, netEarnings,
          currentStreak, streakType, bestStreak,
        },
        recentMatches: recentMatches.reverse().slice(0, 20),
        monthlyData: Array.from(monthlyMap.values()).reverse(),
      });
    } catch (error) {
      console.error("Error fetching player earnings:", error);
      res.status(500).json({ message: "Failed to fetch earnings data" });
    }
  });

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
