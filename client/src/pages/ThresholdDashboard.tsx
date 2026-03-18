/**
 * ThresholdDashboard.tsx — Player threshold, rewards vault, and program info page.
 *
 * DATA SOURCE:
 *   Static data in this file is for UI demonstration. In production, PLAYER,
 *   NEXT_MATCH, and RECENT arrays should be replaced with data from:
 *     - useQuery("/api/player/stats") for player stats
 *     - useQuery("/api/wallet") for earnings + threshold progress
 *     - useQuery("/api/challenges/upcoming") for next matchup
 *     - useQuery("/api/matches/recent") for recent match history
 *
 *   Subscription tiers, badge rules, and rewards are platform constants
 *   defined here (they do not change per-user).
 *
 *   Pricing constants are locked — see shared/config/plans.ts for the
 *   authoritative source. Do not duplicate prices here.
 *
 * ROUTING:
 *   Mounted at tab="player-threshold" in App.tsx.
 *   Added to Finance section of the nav.
 */

import { useState } from "react";

// ─── Existing Player / Match Data (replace with API hooks in production) ──────
const PLAYER = {
  name: "Marcus 'Eight Ball' Reyes",
  tier: "Premium",
  tierColor: "#f59e0b",
  hallName: "Cue Masters — Austin TX",
  weeklyThreshold: 600,
  currentEarnings: 447,
  weeksConsistent: 4,
  rank: 3,
  totalPlayers: 28,
  streakBonus: 25,
  payoutWindow: "Fri–Mon",
  nextPayoutDate: "Mar 7",
  depositsHeld: 75,
};

const NEXT_MATCH = {
  opponent: "D. 'Scratch' Holloway",
  opponentRank: 1,
  opponentWinRate: 71,
  stakeAmount: 120,
  escrowAmount: 30,
  scheduledTime: "Tonight · 8:30 PM",
  hall: "Cue Masters — Table 4",
  tier: "COMPETITIVE",
};

const RECENT = [
  { opponent: "T. Briggs",        result: "W", earned: 94,  stake: 100, date: "Mon" },
  { opponent: "J. 'Ace' Morales", result: "W", earned: 141, stake: 150, date: "Tue" },
  { opponent: "R. Quinn",         result: "L", earned: -80, stake: 80,  date: "Wed" },
  { opponent: "C. 'Break' Davis", result: "W", earned: 188, stake: 200, date: "Thu" },
  { opponent: "S. Park",          result: "L", earned: -75, stake: 80,  date: "Thu" },
  { opponent: "T. Briggs",        result: "W", earned: 179, stake: 190, date: "Fri" },
];

// ─── Subscription Tiers ───────────────────────────────────────────────────────
// Aligned with Master Business Plan v1.0. Canonical source: shared/config/plans.ts
const SUBSCRIPTIONS = [
  {
    name: "Free",
    price: "Free",
    annualPrice: "Free",
    color: "#9ca3af",
    emoji: "🎱",
    popular: false,
    features: [
      "Player profile & career page",
      "Basic ladder participation",
      "2 active challenges at a time",
      "Service fee: 8% per match stake",
      "Max single stake: $50",
      "Earn all 48 rewards — collect only, no cashout",
      "Badge exchange: Locked",
      "Performance pay: manual request only",
    ],
    note: "Get on the ladder, build your record, and see what the platform can do.",
  },
  {
    name: "Basic",
    price: "$9.99/mo",
    annualPrice: "$89.99/yr",
    color: "#60a5fa",
    emoji: "⭐",
    popular: false,
    features: [
      "Unlimited challenges",
      "Earnings dashboard — track every dollar",
      "Service fee: 5% per match stake",
      "Max single stake: $150",
      "Weekly threshold: $50–$150",
      "Performance pay: Tuesday after window",
      "Badge exchange: gear & event entries",
      "Tournament entry: $36",
    ],
    note: "Serious competitor. Full platform access, 5% fee, on-schedule pay.",
  },
  {
    name: "Premium",
    price: "$19.99/mo",
    annualPrice: "$179.99/yr",
    color: "#a78bfa",
    emoji: "👑",
    popular: true,
    features: [
      "Everything in Basic",
      "Priority matchmaking & challenge scheduling",
      "Coach marketplace access",
      "Advanced analytics: win rate, earnings history, Fargo progression",
      "Service fee: 3% — major reduction",
      "Max single stake: $500",
      "Weekly threshold: $50–$500",
      "Performance pay: Fri–Mon window",
      "Full cashout on all 48 rewards",
      "Badge exchange: Full — cash payouts up to $100/wk",
      "Tournament entry: $30 (save $10 per event)",
      "No platform ads",
      "Verified Premium badge on profile",
    ],
    note: "The most popular tier. Priority matching, coach access, no ads, 3% fee.",
  },
  {
    name: "Family Plan",
    price: "$29.99/mo",
    annualPrice: "$269.99/yr",
    color: "#f472b6",
    emoji: "👨‍👩‍👧",
    popular: false,
    features: [
      "Up to 4 player profiles under one account",
      "Shared earnings dashboard across all profiles",
      "All adults: Basic-level stakes, 5% fee, Fri–Mon pay",
      "Tournament entry: $30 for adults",
      "Add-on: +$3.99/child under 12 · +$4.99/teen 13–17",
      "Kids: Drill challenges & competitions only — no match stakes",
    ],
    note: "Four people for one price. Best deal for competitive families.",
  },
  {
    name: "Elite Player",
    price: "$49.99/mo",
    annualPrice: "$449.99/yr",
    color: "#fbbf24",
    emoji: "🏆",
    popular: false,
    features: [
      "Everything in Premium",
      "Elite Player badge — publicly certified ranking",
      "Travel challenge access: cross-city & cross-state",
      "Service fee: 2% — platform minimum",
      "Max single stake: $1,000 (up to $1,100 with approval)",
      "Weekly threshold: $50–$1,000+",
      "Performance pay: Fri–Mon, priority processing",
      "Full cashout on all 48 rewards",
      "Badge exchange: Full — cash payouts up to $100/wk",
      "Tournament entry: $25 (save $15 per event)",
      "AI opponent scouting & performance coaching",
      "VIP tournament seeding",
      "Dedicated support line",
    ],
    note: "For top competitors. Certified ranking, travel challenges, lowest 2% fee.",
  },
];

// ─── Weekly Badge Rules ───────────────────────────────────────────────────────
const BADGE_RULES = [
  { emoji: "📅", rule: "Badges earned Monday through Sunday" },
  { emoji: "🔄", rule: "Exchange window: Sunday 12 PM–11:59 PM only" },
  { emoji: "⏰", rule: "Streak badges reset Monday 12:00 AM sharp" },
  { emoji: "♻️", rule: "Win / stake / social badges roll over if unused" },
  { emoji: "🚫", rule: "Max 3 of the same badge type per week (anti-farming)" },
  { emoji: "📈", rule: "Fargo rating gates which rarity tiers are accessible" },
  { emoji: "💵", rule: "Minimum $10 balance to redeem cash — Stripe verified only" },
  { emoji: "💰", rule: "Max $100 cash redemption per week per competitor" },
  { emoji: "🔒", rule: "Cash redemptions require Premium or Family Plan" },
  { emoji: "⛔", rule: "Accounts under 7 days old cannot redeem cash" },
  { emoji: "⏳", rule: "Credits never expire — cash expires in 90 days" },
];

// ─── 48 Rewards Vault ────────────────────────────────────────────────────────
const RARITY_TABS = ["All", "Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;
type RarityTab = typeof RARITY_TABS[number];
type Rarity = Exclude<RarityTab, "All">;

const RARITY_COLORS: Record<Rarity, { bg: string; border: string; text: string; dot: string }> = {
  Common:    { bg: "rgba(156,163,175,0.08)", border: "#4b5563",  text: "#9ca3af", dot: "#9ca3af" },
  Uncommon:  { bg: "rgba(52,211,153,0.08)",  border: "#065f46",  text: "#34d399", dot: "#34d399" },
  Rare:      { bg: "rgba(96,165,250,0.08)",  border: "#1e3a5f",  text: "#60a5fa", dot: "#60a5fa" },
  Epic:      { bg: "rgba(192,132,252,0.08)", border: "#4c1d95",  text: "#c084fc", dot: "#c084fc" },
  Legendary: { bg: "rgba(251,191,36,0.08)",  border: "#78350f",  text: "#fbbf24", dot: "#fbbf24" },
};

const REWARDS = [
  // -- Common (10) --
  { id: 1,  rarity: "Common" as Rarity,    emoji: "🎱", name: "First Rack",         prize: "$3 App Credit",                         req: "Win your first match stake" },
  { id: 2,  rarity: "Common" as Rarity,    emoji: "💵", name: "Pocket Change",      prize: "$7 App Credit",                         req: "Win 3 stakes in a single week" },
  { id: 3,  rarity: "Common" as Rarity,    emoji: "📈", name: "Ladder Climber",     prize: "Bronze Profile Frame",                  req: "Climb 5 ladder positions" },
  { id: 4,  rarity: "Common" as Rarity,    emoji: "🤝", name: "Social Butterfly",   prize: "$3 Credit + Social badge",              req: "Challenge 5 different competitors" },
  { id: 5,  rarity: "Common" as Rarity,    emoji: "📅", name: "Showing Up",         prize: "Bronze Hall badge",                     req: "Log in and compete 5 consecutive days" },
  { id: 6,  rarity: "Common" as Rarity,    emoji: "🆕", name: "Welcome to the Hall",prize: "Starter Pack (chalk + grip)",           req: "Complete profile + first match" },
  { id: 7,  rarity: "Common" as Rarity,    emoji: "📊", name: "On the Board",       prize: "$3 App Credit",                         req: "Appear on hall ladder for first time" },
  { id: 8,  rarity: "Common" as Rarity,    emoji: "🔔", name: "Plugged In",         prize: "1 week Premium trial",                  req: "Enable push notifications + play 1 match" },
  { id: 9,  rarity: "Common" as Rarity,    emoji: "👀", name: "Scout",              prize: "Bronze Frame variant",                  req: "View 10 different competitor profiles" },
  { id: 10, rarity: "Common" as Rarity,    emoji: "🎯", name: "Called Shot",        prize: "Custom emoji on profile",               req: "Win a match after calling your final shot" },
  // -- Uncommon (12) --
  { id: 11, rarity: "Uncommon" as Rarity,  emoji: "🔥", name: "Weekly Grinder",     prize: "$10 Cash",                              req: "7-day consecutive competition streak" },
  { id: 12, rarity: "Uncommon" as Rarity,  emoji: "🎟️", name: "Event Regular",      prize: "Free Monthly Entry + Silver Name Glow", req: "Complete 3 competition events" },
  { id: 13, rarity: "Uncommon" as Rarity,  emoji: "🎲", name: "High Staker",        prize: "$17 Cash",                              req: "$200 in total verified stake earnings" },
  { id: 14, rarity: "Uncommon" as Rarity,  emoji: "🏃", name: "Hot Streak",         prize: "$13 Credit + Hot Streak badge",         req: "Win 3 matches in a row" },
  { id: 15, rarity: "Uncommon" as Rarity,  emoji: "💪", name: "Comeback",           prize: "$10 Cash + Comeback badge",             req: "Win after losing 2 in a row same week" },
  { id: 16, rarity: "Uncommon" as Rarity,  emoji: "🌙", name: "Night Owl",          prize: "Night Owl animated badge + $7 credit",  req: "Compete in 5 matches after 9 PM" },
  { id: 17, rarity: "Uncommon" as Rarity,  emoji: "☀️", name: "Early Bird",         prize: "10% off next 2 event entries",          req: "Register for 3 events 2+ weeks early" },
  { id: 18, rarity: "Uncommon" as Rarity,  emoji: "👥", name: "Recruiter",          prize: "$13 Cash + Recruiter badge",            req: "Refer 1 competitor who subscribes" },
  { id: 19, rarity: "Uncommon" as Rarity,  emoji: "🏠", name: "Hall Regular",       prize: "Uncommon Profile Frame + $8 credit",    req: "Compete against 8 different opponents" },
  { id: 20, rarity: "Uncommon" as Rarity,  emoji: "🥊", name: "The Challenger",     prize: "$10 Credit + Challenger badge",         req: "Issue 10 challenge requests in a month" },
  { id: 21, rarity: "Uncommon" as Rarity,  emoji: "🤺", name: "Rivalry",            prize: "Rivalry animated badge + $7 credit",    req: "Compete against same opponent 3x in different weeks" },
  { id: 22, rarity: "Uncommon" as Rarity,  emoji: "📱", name: "App Loyalist",       prize: "Silver Name Effect + $10 cash",         req: "Open app and compete 20 days in a month" },
  // -- Rare (12) --
  { id: 23, rarity: "Rare" as Rarity,      emoji: "🎯", name: "Sharpshooter",       prize: "$33 Cash + Gold Title Badge",            req: "5-match win streak" },
  { id: 24, rarity: "Rare" as Rarity,      emoji: "🏆", name: "Event Champion",     prize: "$50 Cash + Champion Banner",             req: "Win 1 monthly competition event" },
  { id: 25, rarity: "Rare" as Rarity,      emoji: "🛡️", name: "The Untouchable",    prize: "$67 Cash + Animated Crown",              req: "Hold #1 rank for 30 consecutive days" },
  { id: 26, rarity: "Rare" as Rarity,      emoji: "🔒", name: "Lockdown",           prize: "$40 Cash + Lockdown badge",              req: "Win 5 matches in a week without losing a set" },
  { id: 27, rarity: "Rare" as Rarity,      emoji: "📈", name: "Rapid Riser",        prize: "$33 Cash + Rising Star badge",           req: "Climb from bottom 25% to top 25% in one month" },
  { id: 28, rarity: "Rare" as Rarity,      emoji: "💰", name: "Stake King",         prize: "$50 Cash + Gold Border effect",          req: "$500 in total verified stake earnings" },
  { id: 29, rarity: "Rare" as Rarity,      emoji: "🌟", name: "Hall Star",          prize: "$53 Cash + Animated Star Frame",         req: "Voted Most Valuable by hall admin (monthly)" },
  { id: 30, rarity: "Rare" as Rarity,      emoji: "🏅", name: "Triple Crown",       prize: "$60 Cash + Triple Crown badge",          req: "Win event + hold #1 + 5-win streak — same month" },
  { id: 31, rarity: "Rare" as Rarity,      emoji: "🤝", name: "Mentor",             prize: "$33 Credit + Mentor badge (permanent)",  req: "Be the first ranked opponent a Rookie defeats" },
  { id: 32, rarity: "Rare" as Rarity,      emoji: "🎪", name: "Event Veteran",      prize: "$40 Cash + Veteran tag",                 req: "Enter and complete 10 total competition events" },
  { id: 33, rarity: "Rare" as Rarity,      emoji: "🌙", name: "The Grind",          prize: "$37 Cash + Grinder badge",               req: "Complete 50 total matches on the platform" },
  { id: 34, rarity: "Rare" as Rarity,      emoji: "⚡", name: "Speed Demon",        prize: "$33 Cash + Speed badge",                 req: "Win 5 match stakes in a single week" },
  // -- Epic (8) --
  { id: 35, rarity: "Epic" as Rarity,      emoji: "⚔️", name: "Quarterly Conqueror",prize: "$134 Cash + Epic Title + Free Year Pass", req: "Win 1 quarterly championship" },
  { id: 36, rarity: "Epic" as Rarity,      emoji: "🐋", name: "The Whale",          prize: "$167 Cash + Permanent Whale Badge",       req: "$1,000 in lifetime verified stake earnings" },
  { id: 37, rarity: "Epic" as Rarity,      emoji: "🔱", name: "Dynasty Builder",    prize: "$117 Cash + Dynasty animated banner",     req: "Win back-to-back monthly events" },
  { id: 38, rarity: "Epic" as Rarity,      emoji: "💎", name: "Diamond Hands",      prize: "$120 Cash + Diamond animated border",     req: "Stay in top 3 on ladder for 3 consecutive months" },
  { id: 39, rarity: "Epic" as Rarity,      emoji: "🦁", name: "The Lion",           prize: "$134 Cash + Animated Lion Frame",         req: "Win 100 total match stakes on the platform" },
  { id: 40, rarity: "Epic" as Rarity,      emoji: "🎯", name: "Assassin",           prize: "$107 Cash + Assassin badge",              req: "Beat 5 competitors ranked higher than you in one month" },
  { id: 41, rarity: "Epic" as Rarity,      emoji: "🏰", name: "Hall Guardian",      prize: "$127 Cash + Guardian Crown",              req: "Hold #1 on ladder for 3 separate months (non-consecutive)" },
  { id: 42, rarity: "Epic" as Rarity,      emoji: "💸", name: "Big Money",          prize: "$147 Cash + Gold Money badge",            req: "$2,500 in total lifetime stake earnings" },
  // -- Legendary (6) --
  { id: 43, rarity: "Legendary" as Rarity, emoji: "👑", name: "Hall of Legends",    prize: "$335 Cash + Name in gold in Hall of Fame (all halls, forever)", req: "Win 3 competition events in a row" },
  { id: 44, rarity: "Legendary" as Rarity, emoji: "🌌", name: "The Immortal",       prize: "$335 Cash + Immortal animated halo (every leaderboard, forever)", req: "Hold #1 rank for 6 total months (any order)" },
  { id: 45, rarity: "Legendary" as Rarity, emoji: "💰", name: "The Baron",          prize: "$335 Cash + Baron title in animated gold (every ladder, forever)", req: "$5,000 in lifetime verified stake earnings" },
  { id: 46, rarity: "Legendary" as Rarity, emoji: "🏛️", name: "Legacy Builder",     prize: "$335 Cash + Stats permanently engraved in Hall of Fame as founding legend", req: "Complete 500 total matches on the platform" },
  { id: 47, rarity: "Legendary" as Rarity, emoji: "🌟", name: "Grand Champion",     prize: "$335 Cash + Champion animated banner + All-Time Champions board (platform-wide)", req: "Win the Year-End Championship" },
  { id: 48, rarity: "Legendary" as Rarity, emoji: "⚡", name: "Platinum Legend",    prize: "$335 Cash + Platinum Aura + name in platform-wide Platinum Hall of Fame (permanent)", req: "Be top competitor when your hall reaches Platinum tier" },
];

// ─── Kids Prizes ──────────────────────────────────────────────────────────────
const KIDS_PRIZES = [
  {
    place: "🥇 1st",
    placeBg: "rgba(255,215,0,0.06)",
    placeColor: "#ffd700",
    prize: "$50 Amazon Gift Card",
    extras: "Champion's Bundle (full gear kit) + Diamond Profile Frame + $25 free event entry",
  },
  {
    place: "🥈 2nd",
    placeBg: "rgba(173,181,189,0.06)",
    placeColor: "#adb5bd",
    prize: "$30 Gift Card (Amazon / Roblox / Steam / PlayStation — their choice)",
    extras: "Custom cue + Silver Name Glow + $15 credit",
  },
  {
    place: "🥉 3rd",
    placeBg: "rgba(205,127,50,0.06)",
    placeColor: "#cd7f32",
    prize: "$20 Gift Card (Amazon / Roblox / Nintendo eShop / Steam)",
    extras: "Pro Chalk Set + $10 credit",
  },
  {
    place: "4th–6th",
    placeBg: "rgba(96,165,250,0.06)",
    placeColor: "#60a5fa",
    prize: "$10 Gift Card (Amazon / Roblox / Google Play / App Store)",
    extras: "Custom t-shirt + Bronze Frame + $5 credit",
  },
  {
    place: "Bottom Half — ALL EQUAL",
    placeBg: "rgba(167,139,250,0.06)",
    placeColor: "#a78bfa",
    prize: "$5 Roblox OR App Store (their choice)",
    extras: "Participation badge (permanent) + 1 month free Basic + sticker pack",
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page:     { background: "#070707", minHeight: "100vh", color: "#ccc", fontFamily: "system-ui, sans-serif", padding: "0 0 80px" } as React.CSSProperties,
  wrap:     { maxWidth: 820, margin: "0 auto", padding: "0 20px" } as React.CSSProperties,
  header:   { background: "linear-gradient(160deg,#0d0b00,#080600)", borderBottom: "1px solid rgba(245,158,11,0.15)", padding: "32px 20px 28px", marginBottom: 28 } as React.CSSProperties,
  h1:       { fontSize: 28, fontWeight: 900, color: "#f59e0b", margin: 0 } as React.CSSProperties,
  sub:      { fontSize: 13, color: "#5a4a00", marginTop: 4 } as React.CSSProperties,
  section:  { background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 12, padding: 24, marginBottom: 20 } as React.CSSProperties,
  sTitle:   { fontSize: 15, fontWeight: 700, color: "#f59e0b", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 } as React.CSSProperties,
  divider:  { borderTop: "1px solid #1e1e1e", margin: "28px 0 24px", display: "flex", alignItems: "center", gap: 12 } as React.CSSProperties,
  divTxt:   { color: "#333", fontSize: 11, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.08em" } as React.CSSProperties,
  divLine:  { flex: 1, borderTop: "1px solid #1e1e1e" } as React.CSSProperties,
  table:    { width: "100%", borderCollapse: "collapse", fontSize: 13 } as React.CSSProperties,
  th:       { textAlign: "left", padding: "8px 12px", background: "rgba(245,158,11,0.06)", color: "#f59e0b", fontWeight: 600, fontSize: 11, borderBottom: "1px solid #1e1e1e" } as React.CSSProperties,
  td:       { padding: "9px 12px", borderBottom: "1px solid #111", verticalAlign: "top" } as React.CSSProperties,
  pill:     { display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: "1px solid" } as React.CSSProperties,
  badge:    { display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, border: "1px solid" } as React.CSSProperties,
  filterBar:{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 } as React.CSSProperties,
  filterBtn:{ padding: "5px 14px", borderRadius: 20, border: "1px solid #2a2a2a", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s" } as React.CSSProperties,
  card:     { background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: 16 } as React.CSSProperties,
  grid2:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } as React.CSSProperties,
  infoBox:  { background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#7a5a00", marginBottom: 12 } as React.CSSProperties,
  warnBox:  { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#b91c1c", marginBottom: 12 } as React.CSSProperties,
  greenBox: { background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "#065f46" } as React.CSSProperties,
};

// ─── Components ───────────────────────────────────────────────────────────────
function SectionDivider({ emoji, title }: { emoji: string; title: string }) {
  return (
    <div style={S.divider}>
      <div style={S.divLine} />
      <span style={S.divTxt}>{emoji} {title}</span>
      <div style={S.divLine} />
    </div>
  );
}

function ThresholdBar({ current, target, streakWeeks }: { current: number; target: number; streakWeeks: number }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  const barColor = pct >= 100 ? "#10b981" : pct >= 75 ? "#f59e0b" : pct >= 40 ? "#60a5fa" : "#ef4444";
  return (
    <div style={S.section}>
      <div style={S.sTitle}>📊 Weekly Performance Threshold</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#555", marginBottom: 6 }}>
        <span>Current: <strong style={{ color: "#ccc" }}>${current.toLocaleString()}</strong></span>
        <span>Target: <strong style={{ color: "#f59e0b" }}>${target.toLocaleString()}</strong></span>
      </div>
      <div style={{ height: 14, background: "#1a1a1a", borderRadius: 7, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 7, transition: "width 0.6s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
        <span style={{ color: barColor, fontWeight: 700 }}>{pct}% to threshold</span>
        <span style={{ color: "#555" }}>
          {streakWeeks >= 3 && <span style={{ color: "#f59e0b", marginRight: 8 }}>🔥 {streakWeeks}-wk streak</span>}
          {pct >= 100 ? "✅ THRESHOLD HIT" : `$${(target - current).toLocaleString()} to go`}
        </span>
      </div>
    </div>
  );
}

function PayoutGate({ player }: { player: typeof PLAYER }) {
  const hit = player.currentEarnings >= player.weeklyThreshold;
  return (
    <div style={{ ...S.section, border: `1px solid ${hit ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)"}` }}>
      <div style={S.sTitle}>{hit ? "✅" : "🔒"} Payout Gate</div>
      <div style={{ fontSize: 13, color: hit ? "#10b981" : "#ef4444", fontWeight: 700, marginBottom: 8 }}>
        {hit ? "THRESHOLD MET — PAYOUT ELIGIBLE" : "Threshold not met — no payout this week"}
      </div>
      <div style={{ fontSize: 12, color: "#555", lineHeight: 1.7 }}>
        <div>Payout window: <span style={{ color: "#ccc" }}>{player.payoutWindow}</span></div>
        <div>Next payout date: <span style={{ color: "#f59e0b" }}>{player.nextPayoutDate}</span></div>
        <div>Deposits held in escrow: <span style={{ color: "#60a5fa" }}>${player.depositsHeld}</span></div>
        {player.streakBonus > 0 && (
          <div>Streak bonus: <span style={{ color: "#10b981" }}>+${player.streakBonus}</span></div>
        )}
      </div>
    </div>
  );
}

function NextMatchup({ match }: { match: typeof NEXT_MATCH }) {
  return (
    <div style={{ ...S.section, border: "1px solid rgba(245,158,11,0.2)" }}>
      <div style={S.sTitle}>⚔️ Next Matchup</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#ccc" }}>{match.opponent}</div>
          <div style={{ fontSize: 12, color: "#555" }}>Rank #{match.opponentRank} · {match.opponentWinRate}% win rate</div>
        </div>
        <span style={{ ...S.pill, background: "rgba(245,158,11,0.1)", borderColor: "#b45309", color: "#f59e0b" }}>
          {match.tier}
        </span>
      </div>
      <div style={{ ...S.grid2, fontSize: 12, color: "#555" }}>
        <div>Match Stake: <strong style={{ color: "#f59e0b" }}>${match.stakeAmount}</strong></div>
        <div>Escrow: <strong style={{ color: "#60a5fa" }}>${match.escrowAmount}</strong></div>
        <div>When: <strong style={{ color: "#ccc" }}>{match.scheduledTime}</strong></div>
        <div>Where: <strong style={{ color: "#ccc" }}>{match.hall}</strong></div>
      </div>
    </div>
  );
}

function RecentMatches({ matches }: { matches: typeof RECENT }) {
  const totalEarned = matches.reduce((s, m) => s + m.earned, 0);
  return (
    <div style={S.section}>
      <div style={{ ...S.sTitle, justifyContent: "space-between" }}>
        <span>📋 Recent Matches</span>
        <span style={{ fontSize: 13, color: totalEarned >= 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
          Net: {totalEarned >= 0 ? "+" : ""}${totalEarned}
        </span>
      </div>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Opponent</th>
            <th style={S.th}>Result</th>
            <th style={S.th}>Performance Pay</th>
            <th style={S.th}>Match Stake</th>
            <th style={S.th}>Day</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m, i) => (
            <tr key={i}>
              <td style={S.td}>{m.opponent}</td>
              <td style={S.td}>
                <span style={{ ...S.badge, background: m.result === "W" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", borderColor: m.result === "W" ? "#065f46" : "#b91c1c", color: m.result === "W" ? "#10b981" : "#ef4444" }}>
                  {m.result}
                </span>
              </td>
              <td style={{ ...S.td, color: m.earned >= 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                {m.earned >= 0 ? "+" : ""}${Math.abs(m.earned)}
              </td>
              <td style={{ ...S.td, color: "#555" }}>${m.stake}</td>
              <td style={{ ...S.td, color: "#555" }}>{m.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubscriptionTiersSection() {
  return (
    <div style={S.section}>
      <div style={S.sTitle}>📱 Subscription Tiers</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {SUBSCRIPTIONS.map((sub) => (
          <div key={sub.name} style={{ background: "#111", border: `1px solid ${sub.color}22`, borderLeft: `3px solid ${sub.color}`, borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: sub.color }}>{sub.emoji} {sub.name}</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: sub.color }}>{sub.price}</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "#888", lineHeight: 1.8 }}>
              {sub.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            <div style={{ marginTop: 8, fontSize: 12, color: "#555", fontStyle: "italic" }}>{sub.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeeklyBadgeRulesSection() {
  return (
    <div style={S.section}>
      <div style={S.sTitle}>🔥 Weekly Badge Rules</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {BADGE_RULES.map((r, i) => (
          <div key={i} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#888", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ fontSize: 14, lineHeight: "1" }}>{r.emoji}</span>
            <span>{r.rule}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RewardsVaultSection() {
  const [filter, setFilter] = useState<RarityTab>("All");
  const visible = filter === "All" ? REWARDS : REWARDS.filter(r => r.rarity === filter);
  return (
    <div style={S.section}>
      <div style={S.sTitle}>🏛️ RewardsVault — All 48 Champion Rewards</div>
      <div style={{ ...S.infoBox, marginBottom: 14, fontSize: 12 }}>
        <strong>Fargo gates:</strong> Rare = 600+ · Epic = 700+ · Legendary = 800+. Below the gate you earn at 20% / 10% / 5% of the requirement rate. Common and Uncommon: full access for everyone. Max 3 of the same badge type per week (anti-farming). Cash values are 33% below face to keep rewards meaningful.
      </div>
      <div style={S.filterBar}>
        {RARITY_TABS.map(tab => {
          const active = filter === tab;
          const rc = tab === "All" ? null : RARITY_COLORS[tab as Rarity];
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                ...S.filterBtn,
                background: active ? (rc ? rc.bg : "rgba(245,158,11,0.1)") : "none",
                borderColor: active ? (rc ? rc.border : "#f59e0b") : "#2a2a2a",
                color: active ? (rc ? rc.text : "#f59e0b") : "#555",
              }}
            >
              {tab}
              <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.7 }}>
                ({tab === "All" ? 48 : REWARDS.filter(r => r.rarity === tab).length})
              </span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 10 }}>
        {visible.map(r => {
          const rc = RARITY_COLORS[r.rarity];
          return (
            <div key={r.id} style={{ background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: rc.text }}>{r.emoji} {r.name}</span>
                <span style={{ ...S.badge, background: rc.bg, borderColor: rc.border, color: rc.text }}>{r.rarity}</span>
              </div>
              <div style={{ fontSize: 12, color: "#10b981", marginBottom: 4 }}>🏆 {r.prize}</div>
              <div style={{ fontSize: 12, color: "#555" }}>📋 {r.req}</div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: "center", fontSize: 12, color: "#333", marginTop: 14 }}>
        Showing {visible.length} of 48 rewards
      </div>
    </div>
  );
}

function KidsProgramSection() {
  return (
    <div style={S.section}>
      <div style={S.sTitle}>🧒 Kids Drill Challenge & Program</div>
      <div style={{ ...S.warnBox, marginBottom: 14 }}>
        <strong>🔒 Kids Participation Requirements — Non-Negotiable</strong>
        <ol style={{ paddingLeft: 20, marginTop: 8, lineHeight: "2", fontSize: 12 }}>
          <li><strong>Must be related to one of the adults</strong> — parent, grandparent, aunt/uncle, or legal guardian. Verified at hall check-in.</li>
          <li><strong>Must complete at least 2 different drills</strong> before entering any family competition event.</li>
          <li><strong>Each drill minimum 30 minutes</strong> — logged in-app by the hall operator.</li>
          <li><strong>Both drills must be completed within 2 weeks</strong> of the event date.</li>
        </ol>
        <div style={{ marginTop: 8, color: "#888", fontSize: 11 }}>This protects kids from being dragged into events unprepared and ensures they actually want to be there.</div>
      </div>
      <div style={{ ...S.grid2, marginBottom: 16 }}>
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f472b6", marginBottom: 8 }}>👨‍👩‍👧 Eligibility</div>
          <ul style={{ paddingLeft: 16, fontSize: 12, color: "#888", lineHeight: "1.9" }}>
            <li>Must be related to one of the adults</li>
            <li>Under 12: competes in Under-12 bracket</li>
            <li>Ages 13–17: compete in Teen bracket</li>
            <li>Drill requirement applies to all age groups</li>
            <li>Flat entry rate: $15/kid regardless of parent plan</li>
            <li>Adults on Family Plan get $25 tournament entry</li>
          </ul>
        </div>
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981", marginBottom: 8 }}>📋 Drill Requirements</div>
          <ul style={{ paddingLeft: 16, fontSize: 12, color: "#888", lineHeight: "1.9" }}>
            <li>Minimum 2 different drills required</li>
            <li>Each drill: at least 30 minutes</li>
            <li>Must be completed within 2 weeks of event</li>
            <li>Logged in-app by hall operator only</li>
            <li>Cannot repeat the same drill twice</li>
            <li>Drill log visible on family dashboard</li>
          </ul>
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#ccc", marginBottom: 10 }}>🎁 Kids Drill Challenge — Prize Structure</div>
      <div style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>Real gift cards. Bottom half all equal. No kid goes home embarrassed.</div>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Place</th>
            <th style={S.th}>Prize</th>
            <th style={S.th}>Extras</th>
          </tr>
        </thead>
        <tbody>
          {KIDS_PRIZES.map((k, i) => (
            <tr key={i} style={{ background: k.placeBg }}>
              <td style={{ ...S.td, fontWeight: 700, color: k.placeColor, whiteSpace: "nowrap" }}>{k.place}</td>
              <td style={{ ...S.td, fontWeight: 700, color: k.placeColor }}>{k.prize}</td>
              <td style={{ ...S.td, color: "#666", fontSize: 12 }}>{k.extras}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ ...S.greenBox, marginTop: 14, fontSize: 12 }}>
        <strong>Why gift cards replaced gear:</strong> A chalk set means nothing to a 9-year-old. A $5 Roblox card? They run to their parent and say "I want to come back next time." Gift card choice by platform — Amazon, Roblox, Steam, PlayStation, Nintendo — means every age group gets something they actually use.
      </div>
    </div>
  );
}

function GrandparentTournamentSection() {
  return (
    <div style={S.section}>
      <div style={S.sTitle}>🧓 Grandparent/Grandkid Stock Doubles</div>
      <div style={{ ...S.infoBox, marginBottom: 14 }}>
        <strong>What Is It?</strong> One competitor aged 65+ paired with one grandchild — or any trusted young partner (<em>does not need to be blood-related</em>). Stock doubles format: both competitors alternate shots. Handicap system ensures competitive matches regardless of age or skill gap. Runs during Family Championship events.
      </div>
      <div style={{ ...S.grid2, marginBottom: 16 }}>
        <div style={{ background: "#111", border: "1px solid rgba(251,146,60,0.2)", borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fb923c", marginBottom: 8 }}>🧓 Senior Eligibility</div>
          <ul style={{ paddingLeft: 16, fontSize: 12, color: "#888", lineHeight: "1.9" }}>
            <li>65 years old or older</li>
            <li>Does NOT need to be on Family Plan</li>
            <li>Partner does not need to be family</li>
            <li>Any trusted person 65+ can enter with any young partner</li>
            <li>Must have active subscription (any tier)</li>
          </ul>
        </div>
        <div style={{ background: "#111", border: "1px solid rgba(251,146,60,0.2)", borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fb923c", marginBottom: 8 }}>🎱 Format</div>
          <ul style={{ paddingLeft: 16, fontSize: 12, color: "#888", lineHeight: "1.9" }}>
            <li>Stock doubles — partners alternate shots</li>
            <li>Handicap system for age and skill gaps</li>
            <li>Runs during Family Championship events</li>
            <li>Grandkid/young partner: under 25 preferred, no hard limit</li>
            <li>All bracket sizes — even a 2-team field runs</li>
          </ul>
        </div>
      </div>
      <div style={{ ...S.greenBox, marginBottom: 14, fontSize: 12 }}>
        <strong>⭐ Every single participant — win or lose — automatically earns an Uncommon reward just for completing the event.</strong> No exceptions. This is the only event where participation alone guarantees a meaningful reward.
      </div>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Place</th>
            <th style={S.th}>Automatic Reward</th>
            <th style={S.th}>Additional Performance Bonus</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ background: "rgba(251,191,36,0.05)" }}>
            <td style={{ ...S.td, fontWeight: 700, color: "#fbbf24" }}>🥇 1st Place Team</td>
            <td style={S.td}><span style={{ ...S.badge, background: "rgba(52,211,153,0.1)", borderColor: "#065f46", color: "#34d399" }}>Uncommon (auto)</span></td>
            <td style={S.td}><span style={{ ...S.badge, background: "rgba(251,191,36,0.1)", borderColor: "#78350f", color: "#fbbf24", marginRight: 6 }}>+ Legendary</span> $100 cash each + permanent Champion banner</td>
          </tr>
          <tr style={{ background: "rgba(156,163,175,0.03)" }}>
            <td style={{ ...S.td, fontWeight: 700, color: "#9ca3af" }}>🥈 2nd Place Team</td>
            <td style={S.td}><span style={{ ...S.badge, background: "rgba(52,211,153,0.1)", borderColor: "#065f46", color: "#34d399" }}>Uncommon (auto)</span></td>
            <td style={S.td}><span style={{ ...S.badge, background: "rgba(192,132,252,0.1)", borderColor: "#4c1d95", color: "#c084fc", marginRight: 6 }}>+ Epic</span> $50 cash each</td>
          </tr>
          <tr style={{ background: "rgba(205,127,50,0.03)" }}>
            <td style={{ ...S.td, fontWeight: 700, color: "#cd7f32" }}>🥉 3rd Place Team</td>
            <td style={S.td}><span style={{ ...S.badge, background: "rgba(52,211,153,0.1)", borderColor: "#065f46", color: "#34d399" }}>Uncommon (auto)</span></td>
            <td style={S.td}><span style={{ ...S.badge, background: "rgba(96,165,250,0.1)", borderColor: "#1e3a5f", color: "#60a5fa", marginRight: 6 }}>+ Rare</span> $25 cash each</td>
          </tr>
          <tr>
            <td style={{ ...S.td, color: "#555" }}>All Others</td>
            <td style={S.td}><span style={{ ...S.badge, background: "rgba(52,211,153,0.1)", borderColor: "#065f46", color: "#34d399" }}>Uncommon (auto) — guaranteed</span></td>
            <td style={{ ...S.td, color: "#555", fontSize: 12 }}>Grandparent/Grandkid participation badge (permanent on both profiles)</td>
          </tr>
        </tbody>
      </table>
      <div style={{ ...S.infoBox, marginTop: 14, fontSize: 12 }}>
        <strong>Why this is viral:</strong> A photo of an 80-year-old and their 10-year-old grandkid fist-bumping after winning a competition event will be shared everywhere — Facebook, local news, senior center newsletters. Senior demographics are completely untapped in billiards apps. This event alone can bring 5 new halls from the press it generates.
      </div>
    </div>
  );
}

function EscrowRules() {
  return (
    <div style={S.section}>
      <div style={S.sTitle}>💵 Match Stake &amp; Escrow Structure</div>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Match Stake Size</th>
            <th style={S.th}>Escrow (Each Competitor)</th>
            <th style={S.th}>Minimum</th>
            <th style={S.th}>How It Works</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>Any amount</td>
            <td style={{ ...S.td, color: "#f59e0b", fontWeight: 700 }}>25% each</td>
            <td style={{ ...S.td, color: "#ef4444", fontWeight: 700 }}>$10 min</td>
            <td style={{ ...S.td, color: "#888", fontSize: 12 }}>Both held in escrow — released to winner as performance pay</td>
          </tr>
          <tr>
            <td style={S.td}>$1,100+</td>
            <td style={{ ...S.td, color: "#ef4444", fontWeight: 700 }}>40% each</td>
            <td style={S.td}>—</td>
            <td style={{ ...S.td, color: "#888", fontSize: 12 }}>High-tier verified only — larger escrow prevents no-shows</td>
          </tr>
        </tbody>
      </table>
      <div style={{ ...S.infoBox, marginTop: 12, fontSize: 12 }}>
        <strong>Example — $100 match stake:</strong> Both contribute $25 to escrow → $50 held. Winner receives $94 performance pay + $50 escrow release = <strong style={{ color: "#10b981" }}>$144 total</strong>. Service fee to platform: $6 (6% Premium rate).
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ThresholdDashboard() {
  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 20px" }}>
          <div style={S.h1}>🎱 {PLAYER.hallName}</div>
          <div style={S.sub}>
            {PLAYER.name} · {PLAYER.tier} · Rank #{PLAYER.rank} of {PLAYER.totalPlayers}
          </div>
        </div>
      </div>

      <div style={S.wrap}>
        {/* Core Performance */}
        <ThresholdBar
          current={PLAYER.currentEarnings}
          target={PLAYER.weeklyThreshold}
          streakWeeks={PLAYER.weeksConsistent}
        />
        <PayoutGate player={PLAYER} />
        <NextMatchup match={NEXT_MATCH} />
        <RecentMatches matches={RECENT} />
        <EscrowRules />

        {/* Platform Info Sections */}
        <SectionDivider emoji="📱" title="Platform Tiers & Features" />
        <SubscriptionTiersSection />

        <SectionDivider emoji="🔥" title="Weekly Badge Exchange Rules" />
        <WeeklyBadgeRulesSection />

        <SectionDivider emoji="🏛️" title="RewardsVault — 48 Rewards" />
        <RewardsVaultSection />

        <SectionDivider emoji="🧒" title="Kids Program & Drill Challenge" />
        <KidsProgramSection />

        <SectionDivider emoji="🧓" title="Grandparent / Grandkid Tournament" />
        <GrandparentTournamentSection />
      </div>
    </div>
  );
}
