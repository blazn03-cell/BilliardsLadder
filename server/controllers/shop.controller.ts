import { Request, Response } from "express";
import { db } from "../config/db";
import { eq } from "drizzle-orm";
import { playerIncentives } from "@shared/schema";

// Shop item catalogue — source of truth for costs and metadata
const SHOP_ITEMS = [
  {
    id: "streak_shield",
    name: "Streak Shield",
    description: "Protects your win streak for one loss — that loss won't reset your streak counter.",
    cost: 150,
    emoji: "🛡️",
    category: "protection",
  },
  {
    id: "rank_freeze",
    name: "Rank Freeze",
    description: "Locks your current ladder rank for 7 days even if you lose matches.",
    cost: 250,
    emoji: "❄️",
    category: "protection",
  },
  {
    id: "mystery_pack",
    name: "Mystery Pack",
    description: "Scratch ticket-style loot drop: credits, a badge unlock, or a free shield.",
    cost: 60,
    emoji: "🎁",
    category: "loot",
  },
  {
    id: "performance_boost",
    name: "Performance Boost",
    description: "Double credit earnings from your next 5 matches (wins and losses).",
    cost: 1800,
    emoji: "⚡",
    category: "boost",
  },
  {
    id: "tournament_entry",
    name: "Tournament Entry Token",
    description: "Free entry token for any upcoming platform tournament (one use).",
    cost: 2200,
    emoji: "🏆",
    category: "entry",
  },
  {
    id: "subscription_credit",
    name: "Subscription Credit",
    description: "$9.99 credit applied to your next monthly membership renewal.",
    cost: 2500,
    emoji: "💳",
    category: "billing",
  },
];

// Badge definitions from Section 02 of the Earning Reference spec
const BADGES = [
  {
    id: "ladder_assassin",
    name: "Ladder Assassin",
    description: "Beat a player ranked 5+ spots above you.",
    emoji: "🗡️",
    difficulty: "easy",
  },
  {
    id: "first_break",
    name: "First Break",
    description: "Win 10+ matches where you're one of the first 3 players to check in at your hall that day.",
    emoji: "🌅",
    difficulty: "medium",
  },
  {
    id: "hot_streak",
    name: "Hot Streak",
    description: "Win 5 matches in a row without a loss.",
    emoji: "🔥",
    difficulty: "medium",
  },
  {
    id: "comeback_king",
    name: "Comeback King",
    description: "Win a match after being down 3+ games in a race-to-5 or longer.",
    emoji: "👑",
    difficulty: "hard",
  },
  {
    id: "iron_man",
    name: "Iron Man",
    description: "Play 30+ matches in a single calendar month.",
    emoji: "⚙️",
    difficulty: "hard",
  },
  {
    id: "gentleman_player",
    name: "Gentleman Player",
    description: "Receive 10+ sportsmanship votes with zero incidents reported.",
    emoji: "🎩",
    difficulty: "medium",
  },
  {
    id: "bounty_hunter",
    name: "Bounty Hunter",
    description: "Collect 3 active bounties in a single season.",
    emoji: "💰",
    difficulty: "hard",
  },
  {
    id: "hall_legend",
    name: "Hall Legend",
    description: "Hold the #1 rank at your home hall for 30 consecutive days.",
    emoji: "🏛️",
    difficulty: "legendary",
  },
  {
    id: "the_callout",
    name: "The Callout",
    description: "Issue a public challenge to a top-10 player and win.",
    emoji: "📣",
    difficulty: "hard",
  },
];

// Daily mission templates (rotated deterministically by day-of-year)
const MISSION_POOL = [
  { id: "play_2_matches", title: "Play 2 Matches", description: "Complete any 2 ladder matches today.", reward: 30, type: "matches" },
  { id: "win_1_match", title: "First Win of the Day", description: "Win at least 1 ladder match.", reward: 25, type: "win" },
  { id: "check_in", title: "Show Up", description: "Check in at any participating hall.", reward: 10, type: "checkin" },
  { id: "challenge_issued", title: "Call Someone Out", description: "Issue a formal challenge to another player.", reward: 20, type: "challenge" },
  { id: "consecutive_login", title: "Daily Login", description: "Log in 3 days in a row.", reward: 15, type: "streak" },
];

function getDailyMissions() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const missions = [];
  for (let i = 0; i < 3; i++) {
    missions.push(MISSION_POOL[(dayOfYear + i) % MISSION_POOL.length]);
  }
  return missions;
}

export async function getPlayerCredits(req: Request, res: Response) {
  try {
    const playerId = req.query.playerId as string;
    if (!playerId) {
      return res.status(400).json({ message: "playerId required" });
    }

    const [incentive] = await db
      .select()
      .from(playerIncentives)
      .where(eq(playerIncentives.playerId, playerId))
      .limit(1);

    const credits = incentive?.streakBonusCredits ?? 0;
    const progressPoints = incentive?.progressPoints ?? 0;
    const currentStreak = incentive?.currentStreak ?? 0;

    res.json({
      balance: credits,
      progressPoints,
      currentStreak,
      longestStreak: incentive?.longestStreak ?? 0,
      earnRates: {
        win: 15,
        loss: 5,
        loginStreak3: 10,
        loginStreak7: 25,
        mysteryChestBase: 20,
        dailyMissionComplete: 30,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getShopItems(req: Request, res: Response) {
  res.json(SHOP_ITEMS);
}

export async function purchaseShopItem(req: Request, res: Response) {
  try {
    const { playerId, itemId } = req.body;
    if (!playerId || !itemId) {
      return res.status(400).json({ message: "playerId and itemId required" });
    }

    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const [incentive] = await db
      .select()
      .from(playerIncentives)
      .where(eq(playerIncentives.playerId, playerId))
      .limit(1);

    const currentBalance = incentive?.streakBonusCredits ?? 0;
    if (currentBalance < item.cost) {
      return res.status(402).json({ message: "Insufficient credits", balance: currentBalance, required: item.cost });
    }

    const newBalance = currentBalance - item.cost;

    if (incentive) {
      await db
        .update(playerIncentives)
        .set({ streakBonusCredits: newBalance, updatedAt: new Date() })
        .where(eq(playerIncentives.playerId, playerId));
    } else {
      await db.insert(playerIncentives).values({
        playerId,
        streakBonusCredits: newBalance,
      });
    }

    res.json({
      success: true,
      item: item.name,
      newBalance,
      message: `${item.emoji} ${item.name} purchased! ${item.description}`,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getPlayerBadges(req: Request, res: Response) {
  const playerId = req.query.playerId as string;
  if (!playerId) {
    return res.status(400).json({ message: "playerId required" });
  }

  // Badges unlock via server-side match events; for now return all as locked
  const badgesWithState = BADGES.map((badge) => ({
    ...badge,
    earned: false,
  }));

  res.json(badgesWithState);
}

export async function getDailyMissionsHandler(req: Request, res: Response) {
  res.json(getDailyMissions());
}
