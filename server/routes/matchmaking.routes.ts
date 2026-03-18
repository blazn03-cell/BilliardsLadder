/**
 * matchmaking.routes.ts — FACEIT-style intelligent matchmaking endpoints
 */

import type { Express, Request, Response } from "express";
import { requireAnyAuth } from "../middleware/auth";
import {
  findMatches,
  getPlayerLeaderboard,
  getPlayerStats,
} from "../services/matchmakingService";

export function setupMatchmakingRoutes(app: Express) {
  /**
   * GET /api/matchmaking/find/:playerId
   * Returns ranked opponent candidates for a given player.
   * Query param: tableType = "9ft" | "8ft" | "barbox"
   */
  app.get(
    "/api/matchmaking/find/:playerId",
    requireAnyAuth,
    async (req: Request, res: Response) => {
      try {
        const { playerId } = req.params;
        const { tableType } = req.query as { tableType?: string };
        const result = await findMatches(playerId, tableType);
        res.json(result);
      } catch (error: any) {
        res.status(500).json({ message: error.message ?? "Matchmaking failed" });
      }
    }
  );

  /**
   * GET /api/matchmaking/leaderboard
   * Enriched leaderboard with win-rates, VIP tiers, streaks.
   * Query param: limit (default 50)
   */
  app.get(
    "/api/matchmaking/leaderboard",
    async (req: Request, res: Response) => {
      try {
        const limit = parseInt((req.query.limit as string) ?? "50", 10);
        const leaderboard = await getPlayerLeaderboard(limit);
        res.json(leaderboard);
      } catch (error: any) {
        res.status(500).json({ message: error.message ?? "Leaderboard fetch failed" });
      }
    }
  );

  /**
   * GET /api/matchmaking/stats/:playerId
   * Full player stats card — rating, rank, win-rate, streak, tier.
   */
  app.get(
    "/api/matchmaking/stats/:playerId",
    async (req: Request, res: Response) => {
      try {
        const stats = await getPlayerStats(req.params.playerId);
        if (!stats) return res.status(404).json({ message: "Player not found" });
        res.json(stats);
      } catch (error: any) {
        res.status(500).json({ message: error.message ?? "Stats fetch failed" });
      }
    }
  );
}
