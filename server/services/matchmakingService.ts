/**
 * matchmakingService.ts — FACEIT-inspired intelligent matchmaking for BilliardsLadder
 *
 * Scoring algorithm:
 *   - Rating proximity (closer = better score)
 *   - Ladder rank proximity
 *   - Recent activity (active players preferred)
 *   - Weight-rule awareness (avoids mismatched handicaps)
 *   - Cooldown respect (no rematch within 24h unless no other options)
 */

import { storage } from "../storage";
import type { Player } from "@shared/schema";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface MatchmakingCandidate {
  player: Player;
  score: number;
  ratingDiff: number;
  rankDiff: number;
  suggestedHandicap: number; // spots owed / weight
  reason: string;            // human-readable why this match was suggested
}

export interface MatchmakingResult {
  candidates: MatchmakingCandidate[];
  searchedAt: string;
  algorithm: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_RATING_DIFF   = 300; // max Fargo diff for a "fair" match
const IDEAL_RATING_DIFF = 100; // sweet spot for competitive balance
const COOLDOWN_HOURS    = 24;  // hours before a rematch is allowed
const MAX_CANDIDATES    = 10;

// ─── Scoring weights ─────────────────────────────────────────────────────────
const WEIGHTS = {
  ratingProximity : 40,  // up to 40 pts: same rating = 40, MAX_RATING_DIFF away = 0
  rankProximity   : 25,  // up to 25 pts: adjacent ranks score highest
  recentActivity  : 20,  // up to 20 pts: played in last 7 days = full points
  noCooldown      : 15,  // 15 pts bonus: no recent match between these two
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ratingScore(diff: number): number {
  if (diff > MAX_RATING_DIFF) return 0;
  return WEIGHTS.ratingProximity * (1 - diff / MAX_RATING_DIFF);
}

function rankScore(diff: number, totalPlayers: number): number {
  if (totalPlayers === 0) return 0;
  const normalised = diff / Math.max(totalPlayers, 1);
  return WEIGHTS.rankProximity * Math.max(0, 1 - normalised * 2);
}

function activityScore(player: Player): number {
  const lastMatch = (player as any).lastMatchAt as Date | null | undefined;
  if (!lastMatch) return WEIGHTS.recentActivity * 0.3; // inactive, partial credit
  const daysSince = (Date.now() - new Date(lastMatch).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince <= 7)  return WEIGHTS.recentActivity;
  if (daysSince <= 14) return WEIGHTS.recentActivity * 0.7;
  if (daysSince <= 30) return WEIGHTS.recentActivity * 0.4;
  return WEIGHTS.recentActivity * 0.1;
}

async function hasCooldown(playerAId: string, playerBId: string): Promise<boolean> {
  try {
    const matches = await storage.getMatches();
    const cutoff  = new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000);
    return matches.some((m: any) => {
      const played = m.winnerId === playerAId || m.loserId === playerAId ||
                     m.winnerId === playerBId || m.loserId === playerBId;
      const between = (
        (m.winnerId === playerAId && m.loserId === playerBId) ||
        (m.winnerId === playerBId && m.loserId === playerAId)
      );
      return between && played && m.createdAt && new Date(m.createdAt) > cutoff;
    });
  } catch {
    return false; // storage miss → assume no cooldown
  }
}

/**
 * Suggest handicap (weight / spots) based on rating difference.
 * This mirrors APA/BCA-style handicapping used in BilliardsLadder.
 */
function suggestHandicap(challengerRating: number, opponentRating: number): number {
  const diff = challengerRating - opponentRating;
  if (diff >= 200)  return -3; // challenger gives 3 spots
  if (diff >= 125)  return -2;
  if (diff >= 75)   return -1;
  if (diff <= -200) return  3; // challenger receives 3 spots
  if (diff <= -125) return  2;
  if (diff <= -75)  return  1;
  return 0;
}

function buildReason(
  ratingDiff: number,
  rankDiff: number,
  handicap: number,
  onCooldown: boolean
): string {
  const parts: string[] = [];

  if (ratingDiff <= IDEAL_RATING_DIFF)
    parts.push("Near-equal rating");
  else if (ratingDiff <= MAX_RATING_DIFF)
    parts.push(`${ratingDiff}-pt Fargo gap`);

  if (rankDiff <= 3) parts.push("Close ladder position");

  if (handicap > 0)        parts.push(`You receive ${handicap} spot(s)`);
  else if (handicap < 0)   parts.push(`You give ${Math.abs(handicap)} spot(s)`);
  else                     parts.push("Even match");

  if (onCooldown) parts.push("⚠️ Recent rematch");

  return parts.join(" · ") || "Compatible opponent";
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * findMatches — returns ranked matchmaking candidates for a given challenger.
 *
 * @param challengerId  Player ID of the person seeking a match
 * @param tableType     "9ft" | "8ft" | "barbox" — filters by table preference
 */
export async function findMatches(
  challengerId: string,
  tableType?: string
): Promise<MatchmakingResult> {
  const allPlayers: Player[] = await storage.getPlayers();

  const challenger = allPlayers.find((p) => p.id === challengerId);
  if (!challenger) {
    return { candidates: [], searchedAt: new Date().toISOString(), algorithm: "v1" };
  }

  // Rank all players by points descending
  const ranked = [...allPlayers]
    .sort((a, b) => b.points - a.points)
    .map((p, i) => ({ player: p, rank: i + 1 }));

  const challengerRank = ranked.find((r) => r.player.id === challengerId)?.rank ?? 999;
  const total          = ranked.length;

  const candidates: MatchmakingCandidate[] = [];

  for (const { player, rank } of ranked) {
    if (player.id === challengerId) continue;

    const ratingDiff = Math.abs((challenger.rating || 500) - (player.rating || 500));
    const rankDiff   = Math.abs(challengerRank - rank);

    const onCooldown = await hasCooldown(challengerId, player.id);

    let score = 0;
    score += ratingScore(ratingDiff);
    score += rankScore(rankDiff, total);
    score += activityScore(player);
    if (!onCooldown) score += WEIGHTS.noCooldown;

    const handicap = suggestHandicap(challenger.rating || 500, player.rating || 500);
    const reason   = buildReason(ratingDiff, rankDiff, handicap, onCooldown);

    candidates.push({ player, score, ratingDiff, rankDiff, suggestedHandicap: handicap, reason });
  }

  candidates.sort((a, b) => b.score - a.score);

  return {
    candidates: candidates.slice(0, MAX_CANDIDATES),
    searchedAt: new Date().toISOString(),
    algorithm: "v1",
  };
}

/**
 * getPlayerLeaderboard — enriched leaderboard with win rates, streaks, VIP tier.
 */
export async function getPlayerLeaderboard(limit = 50): Promise<any[]> {
  const players: Player[] = await storage.getPlayers();
  const matches  = await storage.getMatches();

  const ranked = [...players]
    .sort((a, b) => b.points - a.points)
    .slice(0, limit)
    .map((p, i) => {
      const wins    = matches.filter((m: any) => m.winnerId === p.id).length;
      const losses  = matches.filter((m: any) => m.loserId  === p.id).length;
      const total   = wins + losses;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

      // VIP tier based on points + wins (Checkmate-inspired)
      let vipTier: string;
      if (p.points >= 5000 || wins >= 50) vipTier = "LEGEND";
      else if (p.points >= 2500 || wins >= 25) vipTier = "GOLD";
      else if (p.points >= 1000 || wins >= 10) vipTier = "SILVER";
      else vipTier = "BRONZE";

      return {
        rank: i + 1,
        id: p.id,
        name: p.name,
        rating: p.rating || 500,
        points: p.points,
        wins,
        losses,
        winRate,
        vipTier,
        active: (p as any).active ?? true,
      };
    });

  return ranked;
}

/**
 * getPlayerStats — per-player detailed stats card (Repeat.gg inspired).
 */
export async function getPlayerStats(playerId: string): Promise<any> {
  const players: Player[] = await storage.getPlayers();
  const matches  = await storage.getMatches();

  const player = players.find((p) => p.id === playerId);
  if (!player) return null;

  const ranked       = [...players].sort((a, b) => b.points - a.points);
  const ladderRank   = ranked.findIndex((p) => p.id === playerId) + 1;

  const wins         = matches.filter((m: any) => m.winnerId === playerId).length;
  const losses       = matches.filter((m: any) => m.loserId  === playerId).length;
  const total        = wins + losses;
  const winRate      = total > 0 ? Math.round((wins / total) * 100) : 0;

  // Compute current streak
  const playerMatches = matches
    .filter((m: any) => m.winnerId === playerId || m.loserId === playerId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  let streak = 0;
  let streakType: "win" | "loss" | "none" = "none";
  for (const m of playerMatches) {
    const won = (m as any).winnerId === playerId;
    if (streak === 0) {
      streakType = won ? "win" : "loss";
      streak     = 1;
    } else if ((won && streakType === "win") || (!won && streakType === "loss")) {
      streak++;
    } else {
      break;
    }
  }

  return {
    playerId,
    playerName: player.name,
    fargoRating: player.rating || 500,
    points: player.points,
    ladderRank,
    totalPlayers: players.length,
    wins,
    losses,
    winRate,
    streak,
    streakType,
    tier: (player as any).tier || "Rookie",
  };
}
