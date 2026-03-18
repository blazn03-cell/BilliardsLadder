import express, { type Express, type RequestHandler } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupMatchmakingRoutes } from "./routes/matchmaking.routes";
import { getPlayerLeaderboard, getPlayerStats } from "./services/matchmakingService";
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
import { registerAuthRoutes } from "./routes/auth.routes";
import { requireStaffOrOwner, requireAnyAuth } from "./middleware/auth";
import { registerHallRoutes } from "./routes/hall.routes";
import { registerPlayerBillingRoutes } from "./services/playerBilling";
import { registerQuickChallengeRoutes } from "./routes/quickChallenge.routes";
import { getCareerStats, getPlayerEarnings, getPlayerServices, createPlayerService, activatePlayerService, withdrawNow } from "./controllers/playerCareer.controller";
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
import { FEATURE_FLAGS, featureNotLive } from "./config/featureFlags";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);

// Stripe Price IDs for BilliardsLadder Commission System
const prices = {
  rookie_monthly: "price_1S36UcDc2BliYufwVpgpOph9", // BilliardsLadder Rookie Pass ($20/month → $4 operator commission)
  basic_monthly: "price_1S36UcDc2BliYufwF8R8w5BY", // BilliardsLadder Basic Membership ($25/month → $7 operator commission)
  pro_monthly: "price_1S36UdDc2BliYufwGZmAEVPq", // BilliardsLadder Pro Membership ($60/month → $10 operator commission)
  small: process.env.SMALL_PRICE_ID, // Operator subscription tiers
  medium: process.env.MEDIUM_PRICE_ID,
  large: process.env.LARGE_PRICE_ID,
  mega: process.env.MEGA_PRICE_ID,
  // Charity Donation System
  charity_product: "prod_Sz4wWq0exnJOBv", // BilliardsLadder Charity Donations
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
  
  // Health check endpoints
  // /healthz  — used by deployment infra (plain text)
  // /api/health — used by monitoring dashboards (JSON, matches runbook docs)
  app.get("/healthz", (_, res) => res.send("ok"));
  app.get("/api/health", (_, res) => res.json({
    status: "ok",
    uptime: process.uptime(),
    ts: new Date().toISOString(),
  }));
  
  // Register authentication routes
  registerAuthRoutes(app);
  
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
  
  // Player Career Dashboard API Routes
  app.get('/api/player/career-stats', getCareerStats);
  app.get('/api/player/earnings', getPlayerEarnings);
  app.get('/api/player/services', getPlayerServices);
  app.post('/api/player/services', createPlayerService);
  app.post('/api/player/services/:id/activate', activatePlayerService);
  app.post('/api/player/withdraw', withdrawNow);

  // Forgot Password Routes
  setupForgotPasswordRoutes(app);

  // Object Carom Games — stub, gated by feature flag
  app.get('/api/object-carom-games', (_req, res) => {
    if (!FEATURE_FLAGS.OBJECT_CAROM_GAMES) {
      const r = featureNotLive("Object Carom Games");
      return res.status(r.status).json(r.body);
    }
    return res.json([]);
  });
  app.post('/api/object-carom-games', (_req, res) => {
    if (!FEATURE_FLAGS.OBJECT_CAROM_GAMES) {
      const r = featureNotLive("Object Carom Games");
      return res.status(r.status).json(r.body);
    }
    return res.json({ id: 'stub', message: 'Coming soon' });
  });
  // Poolhall Matches — stub, gated by feature flag
  app.get('/api/poolhall-matches', (_req, res) => {
    if (!FEATURE_FLAGS.POOLHALL_MATCHES) {
      const r = featureNotLive("Poolhall Matches");
      return res.status(r.status).json(r.body);
    }
    return res.json([]);
  });
  app.post('/api/poolhall-matches', (_req, res) => {
    if (!FEATURE_FLAGS.POOLHALL_MATCHES) {
      const r = featureNotLive("Poolhall Matches");
      return res.status(r.status).json(r.body);
    }
    return res.json({ id: 'stub', message: 'Coming soon' });
  });
  // Game Voting — stub, gated by feature flag
  app.get('/api/game-voting/current', (_req, res) => {
    if (!FEATURE_FLAGS.GAME_VOTING) { const r = featureNotLive("Game Voting"); return res.status(r.status).json(r.body); }
    return res.json(null);
  });
  app.get('/api/game-voting/history', (_req, res) => {
    if (!FEATURE_FLAGS.GAME_VOTING) { const r = featureNotLive("Game Voting"); return res.status(r.status).json(r.body); }
    return res.json([]);
  });
  app.post('/api/game-voting', (_req, res) => {
    if (!FEATURE_FLAGS.GAME_VOTING) { const r = featureNotLive("Game Voting"); return res.status(r.status).json(r.body); }
    return res.json({ id: 'stub', message: 'Coming soon' });
  });
  app.post('/api/game-voting/vote', (_req, res) => {
    if (!FEATURE_FLAGS.GAME_VOTING) { const r = featureNotLive("Game Voting"); return res.status(r.status).json(r.body); }
    return res.json({ message: 'Coming soon' });
  });
  // Spot Shots — stub, gated by feature flag
  app.get('/api/spot-shots', (_req, res) => {
    if (!FEATURE_FLAGS.SPOT_SHOTS) { const r = featureNotLive("Spot Shots"); return res.status(r.status).json(r.body); }
    return res.json([]);
  });
  app.post('/api/spot-shots', (_req, res) => {
    if (!FEATURE_FLAGS.SPOT_SHOTS) { const r = featureNotLive("Spot Shots"); return res.status(r.status).json(r.body); }
    return res.json({ id: 'stub', message: 'Coming soon' });
  });

  app.get('/api/admin/disputes', requireStaffOrOwner, async (_req, res) => {
    try {
      const disputes = await storage.getDisputeResolutionsByStatus('open');
      res.json(disputes ?? []);
    } catch { res.json([]); }
  });
  app.get('/api/admin/global-stats', requireStaffOrOwner, async (_req, res) => {
    try {
      const [players, matches, halls] = await Promise.all([
        storage.getPlayers(), storage.getMatches(), storage.getPoolHalls(),
      ]);
      res.json({
        totalPlayers: players.length,
        totalMatches: matches.length,
        totalRevenue: 0, // populated by financial controller
        activeHalls: halls.length,
      });
    } catch { res.json({ totalPlayers: 0, totalMatches: 0, totalRevenue: 0, activeHalls: 0 }); }
  });
  app.get('/api/admin/operators', requireStaffOrOwner, (_req, res) => {
    if (!FEATURE_FLAGS.ADMIN_OPERATORS) { const r = featureNotLive("Admin Operators List"); return res.status(r.status).json(r.body); }
    return res.json([]);
  });
  app.get('/api/admin/organizations', requireStaffOrOwner, (_req, res) => {
    if (!FEATURE_FLAGS.ADMIN_OPERATORS) { const r = featureNotLive("Admin Organizations List"); return res.status(r.status).json(r.body); }
    return res.json([]);
  });
  app.get('/api/admin/staff', requireStaffOrOwner, (_req, res) => {
    if (!FEATURE_FLAGS.ADMIN_STAFF) { const r = featureNotLive("Admin Staff List"); return res.status(r.status).json(r.body); }
    return res.json([]);
  });
  app.get('/api/attitude-votes', (_req, res) => res.json([]));
  app.get('/api/challenge-entries/user', (_req, res) => res.json([]));
  app.get('/api/challenge-pools', (_req, res) => res.json([]));
  app.get('/api/earnings/breakdown', requireAnyAuth, (_req, res) => res.json({ items: [], total: 0 }));
  app.get('/api/earnings/dashboard', requireAnyAuth, (_req, res) => res.json({ totalEarnings: 0, monthlyEarnings: 0, pendingPayouts: 0, recentTransactions: [] }));
  app.get('/api/game-voting', (_req, res) => res.json([]));
  app.get('/api/operator/settings', requireAnyAuth, (_req, res) => res.json({ hallName: '', city: '', state: '', tableCount: 0 }));
  app.get('/api/player/challenges', requireAnyAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const playerId = user?.claims?.sub ?? user?.id;
      if (!playerId) return res.json([]);
      const challenges = await storage.getChallengesByPlayer(playerId);
      res.json(challenges ?? []);
    } catch { res.json([]); }
  });
  app.get('/api/player/leaderboard', async (_req, res) => {
    try { res.json(await getPlayerLeaderboard(50)); }
    catch (e: any) { res.status(500).json({ message: e.message }); }
  });
  app.get('/api/player/stats', requireAnyAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const playerId = user?.claims?.sub ?? user?.id;
      if (!playerId) return res.json({ wins: 0, losses: 0, winRate: 0, streak: 0, rating: 500 });
      const stats = await getPlayerStats(playerId);
      res.json(stats ?? { wins: 0, losses: 0, winRate: 0, streak: 0, rating: 500 });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // Profile settings — nickname + email privacy
  app.get('/api/profile', requireAnyAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user?.claims?.sub ?? user?.id;
      if (!userId) return res.status(401).json({ message: 'Not authenticated' });
      const u = await storage.getUser(userId);
      if (!u) return res.status(404).json({ message: 'User not found' });
      // Find linked player record
      const players = await storage.getPlayers();
      const player = players.find(p => p.userId === userId);
      res.json({
        id: u.id,
        email: u.email,
        name: u.name,
        nickname: u.nickname ?? player?.nickname ?? null,
        emailHidden: u.emailHidden ?? true,
        playerNickname: player?.nickname ?? null,
        playerId: player?.id ?? null,
        city: player?.city ?? null,
        birthday: player?.birthday ?? null,
        theme: player?.theme ?? "green",
      });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.patch('/api/profile', requireAnyAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user?.claims?.sub ?? user?.id;
      if (!userId) return res.status(401).json({ message: 'Not authenticated' });
      const { nickname, emailHidden, city, birthday, theme } = req.body;
      const cleanNickname = typeof nickname === 'string'
        ? nickname.trim().slice(0, 30).replace(/[<>"']/g, '') || null
        : undefined;
      const cleanCity = typeof city === 'string' ? city.trim().slice(0, 100) || null : undefined;
      const cleanBirthday = typeof birthday === 'string' ? birthday.trim().slice(0, 5).replace(/[^0-9-]/g, '') || null : undefined;
      const validThemes = ['green', 'blue', 'red', 'purple', 'gold', 'orange', 'cyan'];
      const cleanTheme = typeof theme === 'string' && validThemes.includes(theme) ? theme : undefined;
      const updates: Record<string, any> = {};
      if (cleanNickname !== undefined) updates.nickname = cleanNickname;
      if (typeof emailHidden === 'boolean') updates.emailHidden = emailHidden;
      const updatedUser = await storage.updateUser(userId, updates);
      const players = await storage.getPlayers();
      const player = players.find(p => p.userId === userId);
      if (player) {
        const playerUpdates: Record<string, any> = {};
        if (cleanNickname !== undefined) playerUpdates.nickname = cleanNickname;
        if (cleanCity !== undefined) playerUpdates.city = cleanCity;
        if (cleanBirthday !== undefined) playerUpdates.birthday = cleanBirthday;
        if (cleanTheme !== undefined) playerUpdates.theme = cleanTheme;
        if (Object.keys(playerUpdates).length > 0) {
          await storage.updatePlayer(player.id, playerUpdates);
        }
      }
      res.json({ success: true, nickname: updatedUser?.nickname, emailHidden: updatedUser?.emailHidden });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  // FACEIT-style matchmaking routes
  setupMatchmakingRoutes(app);
  app.get('/api/posters', (_req, res) => res.json([]));
  app.get('/api/stripe/session', requireAnyAuth, (_req, res) => res.json(null));
  app.get('/api/wallet', requireAnyAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const userId = user?.claims?.sub ?? user?.id;
      if (!userId) return res.json({ balance: 0, pendingCredits: 0, transactions: [] });
      const wallet = await storage.getWallet(userId);
      const transactions = await storage.getLedgerByUser(userId);
      res.json({
        balance: wallet?.balanceCredits ?? 0,
        pendingCredits: wallet?.balanceLockedCredits ?? 0,
        transactions: transactions ?? [],
      });
    } catch { res.json({ balance: 0, pendingCredits: 0, transactions: [] }); }
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
