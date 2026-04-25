import type { Express, Request, Response } from "express";
import {
  getRackPointsState,
  getLedger,
} from "../services/rackPointsService";

/**
 * Pull the canonical user id off the session for either auth path:
 *  - Replit OAuth stores it under `req.user.claims.sub`
 *  - Password login stores it under `req.user.id`
 */
function getSessionUserId(req: Request): string | null {
  if (!req.isAuthenticated || !req.isAuthenticated()) return null;
  const u: any = req.user;
  const raw = u?.claims?.sub ?? u?.id;
  return raw == null ? null : String(raw);
}

export function setupMeRoutes(app: Express) {
  /**
   * GET /api/me/rack-points
   * Returns the current user's points balance + streak state.
   */
  app.get("/api/me/rack-points", async (req: Request, res: Response) => {
    const userId = getSessionUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const state = await getRackPointsState(userId);
      if (!state) {
        return res
          .status(200)
          .json({ rackPoints: 0, streakDays: 0, streakLastDay: null });
      }
      return res.json(state);
    } catch (err: any) {
      console.error("[GET /api/me/rack-points] failed:", err?.message);
      return res.status(500).json({ message: "Failed to load rack points" });
    }
  });

  /**
   * GET /api/me/rack-points/ledger?limit=20
   * Returns the user's most recent ledger entries (newest first).
   */
  app.get(
    "/api/me/rack-points/ledger",
    async (req: Request, res: Response) => {
      const userId = getSessionUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const rawLimit = Number.parseInt(String(req.query.limit ?? "20"), 10);
      const limit =
        Number.isFinite(rawLimit) && rawLimit > 0
          ? Math.min(rawLimit, 100)
          : 20;
      try {
        const entries = await getLedger(userId, limit);
        return res.json(entries);
      } catch (err: any) {
        console.error(
          "[GET /api/me/rack-points/ledger] failed:",
          err?.message
        );
        return res.status(500).json({ message: "Failed to load ledger" });
      }
    }
  );
}
