import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Minus, Trophy, Target, BarChart3, Calendar, Star } from "lucide-react";

interface PlayerGameRecord {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalWinnings: number;
  totalLosses: number;
  netEarnings: number;
  currentStreak: number;
  streakType: "win" | "loss" | "none";
  bestStreak: number;
}

interface RecentMatch {
  id: string;
  opponent: string;
  result: "win" | "loss" | "draw";
  amount: number;
  date: string;
  division: string;
}

interface MonthlyBreakdown {
  month: string;
  wins: number;
  losses: number;
  draws: number;
  earnings: number;
  spent: number;
  net: number;
}

interface SubscriptionTier {
  name: string;
  price: string;
  commission: string;
  color: string;
  features: string[];
  priceId: string;
  paymentLink: string;
}

// ── Subscription tiers — always a real array, never undefined ─────────────────
const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    name: "Rookie",
    price: "$25.99/mo",
    commission: "10%",
    color: "green",
    priceId: "price_1T50oRDc2BliYufwrfHeSzfg",
    paymentLink: "https://buy.stripe.com/test_aFacN56p6b3A35FflP1Jm0a",
    features: [
      "10% commission rate",
      "All ladder divisions (7ft/8ft/9ft)",
      "Ranked challenge system",
      "Match history & stats",
      "Streak bonuses",
      "Daily & weekly quests",
      "Anti-ghosting deposit system",
    ],
  },
  {
    name: "Standard",
    price: "$35.99/mo",
    commission: "8%",
    color: "purple",
    priceId: "price_1T50oUDc2BliYufwltyeKc3v",
    paymentLink: "https://buy.stripe.com/test_fZu9AT5l2efM5dN3D71Jm0b",
    features: [
      "8% commission rate",
      "Everything in Rookie",
      "2 guaranteed matches/week",
      "7-day pause bank",
      "Advanced analytics",
      "Rival tracking & rematch",
      "AI coaching tips",
      "Priority support",
    ],
  },
  {
    name: "Premium",
    price: "$59.99/mo",
    commission: "5%",
    color: "yellow",
    priceId: "price_1T50oYDc2BliYufw6h8lK7x9",
    paymentLink: "https://buy.stripe.com/test_bJe28rfZGdbIcGf5Lf1Jm0c",
    features: [
      "5% commission rate",
      "Everything in Standard",
      "VIP tournament seeding",
      "Personal coaching sessions",
      "Fan tip collection",
      "Revenue sharing on content",
      "AI-generated profile picture",
      "Loyalty discount after 6 months",
      "Referral bonus $10/referral",
    ],
  },
  {
    name: "Family",
    price: "$45.00/mo",
    commission: "10%",
    color: "blue",
    priceId: "price_1T50uBDc2BliYufwQ6hMnDSp",
    paymentLink: "https://buy.stripe.com/test_bJe9AT8xe4FcfSrgpT1Jm0d",
    features: [
      "2 guardian accounts",
      "Up to 2 kid accounts",
      "Add more kids — upgrade available",
      "Kids Drill League",
      "Age-group leaderboards (U10/11-13/14-17)",
      "Monthly kids prizes",
      "Guardian permission controls",
      "Family pause bank",
    ],
  },
];

const TIER_COLOR_MAP: Record<string, { border: string; text: string; bg: string; btn: string }> = {
  green:  { border: "border-green-500/30",  text: "text-green-400",  bg: "bg-green-600/10",  btn: "bg-green-600 hover:bg-green-700" },
  purple: { border: "border-purple-500/30", text: "text-purple-400", bg: "bg-purple-600/10", btn: "bg-purple-600 hover:bg-purple-700" },
  yellow: { border: "border-yellow-500/30", text: "text-yellow-400", bg: "bg-yellow-600/10", btn: "bg-yellow-600 hover:bg-yellow-700" },
  blue:   { border: "border-blue-500/30",   text: "text-blue-400",   bg: "bg-blue-600/10",   btn: "bg-blue-600 hover:bg-blue-700"   },
};

export default function MonetizationDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [record, setRecord] = useState<PlayerGameRecord>({
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    totalWinnings: 0,
    totalLosses: 0,
    netEarnings: 0,
    currentStreak: 0,
    streakType: "none",
    bestStreak: 0,
  });

  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyBreakdown[]>([]);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    try {
      const res = await fetch("/api/player/earnings");
      if (res.ok) {
        const data = await res.json();
        if (data.record) setRecord(data.record);
        if (data.recentMatches) setRecentMatches(data.recentMatches);
        if (data.monthlyData) setMonthlyData(data.monthlyData);
      }
    } catch {
      // defaults already set
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

  const getNetColor = (net: number) => {
    if (net > 0) return "text-green-400";
    if (net < 0) return "text-red-400";
    return "text-yellow-400";
  };

  const getNetLabel = (net: number) => {
    if (net > 0) return "Profit";
    if (net < 0) return "Down";
    return "Break Even";
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case "win":
        return <Badge className="bg-green-600/20 text-green-400 border-green-500/30" data-testid="badge-result-win">W</Badge>;
      case "loss":
        return <Badge className="bg-red-600/20 text-red-400 border-red-500/30" data-testid="badge-result-loss">L</Badge>;
      default:
        return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-500/30" data-testid="badge-result-draw">D</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6" data-testid="page-player-earnings">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-400">Your Earnings</h1>
            <p className="text-gray-400 mt-2">Track your wins, losses, and overall standing</p>
          </div>
          <div className="flex items-center gap-3">
            {record.currentStreak > 0 && (
              <Badge
                variant="outline"
                className={record.streakType === "win" ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}
                data-testid="badge-current-streak"
              >
                {record.currentStreak} {record.streakType === "win" ? "W" : "L"} Streak
              </Badge>
            )}
            <Badge
              variant="outline"
              className={`${getNetColor(record.netEarnings)} border-current`}
              data-testid="badge-net-status"
            >
              {getNetLabel(record.netEarnings)}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-700 flex-wrap h-auto">
            <TabsTrigger value="overview"     className="data-[state=active]:bg-green-600"  data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="history"      className="data-[state=active]:bg-green-600"  data-testid="tab-history">Match History</TabsTrigger>
            <TabsTrigger value="monthly"      className="data-[state=active]:bg-green-600"  data-testid="tab-monthly">Monthly</TabsTrigger>
            <TabsTrigger value="tiers"        className="data-[state=active]:bg-green-600"  data-testid="tab-tiers">Membership Tiers</TabsTrigger>
            <TabsTrigger value="deposits"     className="data-[state=active]:bg-green-600"  data-testid="tab-deposits">Deposit Rules</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW ── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900 border-green-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Total Winnings
                  </CardTitle>
                  <CardDescription className="text-gray-400">From {record.wins} wins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400" data-testid="text-total-winnings">
                    {formatCurrency(record.totalWinnings)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-red-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" /> Total Losses
                  </CardTitle>
                  <CardDescription className="text-gray-400">From {record.losses} losses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400" data-testid="text-total-losses">
                    {formatCurrency(record.totalLosses)}
                  </div>
                </CardContent>
              </Card>

              <Card className={`bg-gray-900 ${record.netEarnings > 0 ? "border-green-500/30" : record.netEarnings < 0 ? "border-red-500/30" : "border-yellow-500/30"}`}>
                <CardHeader className="pb-3">
                  <CardTitle className={`flex items-center gap-2 ${getNetColor(record.netEarnings)}`}>
                    {record.netEarnings > 0 ? <TrendingUp className="h-5 w-5" /> : record.netEarnings < 0 ? <TrendingDown className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                    Net Earnings
                  </CardTitle>
                  <CardDescription className="text-gray-400">{getNetLabel(record.netEarnings)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getNetColor(record.netEarnings)}`} data-testid="text-net-earnings">
                    {record.netEarnings >= 0 ? "+" : ""}{formatCurrency(record.netEarnings)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-blue-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Target className="h-5 w-5" /> Win Rate
                  </CardTitle>
                  <CardDescription className="text-gray-400">{record.totalGames} total games</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400" data-testid="text-win-rate">
                    {record.winRate.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" /> Game Record
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Wins",   count: record.wins,   total: record.totalGames, colorBar: "bg-green-500",  colorText: "text-green-400",  testId: "text-wins-count" },
                    { label: "Losses", count: record.losses, total: record.totalGames, colorBar: "bg-red-500",    colorText: "text-red-400",    testId: "text-losses-count" },
                    { label: "Draws",  count: record.draws,  total: record.totalGames, colorBar: "bg-yellow-500", colorText: "text-yellow-400", testId: "text-draws-count" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-gray-400">{row.label}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full ${row.colorBar} rounded-full`} style={{ width: `${row.total ? (row.count / row.total) * 100 : 0}%` }} />
                        </div>
                        <span className={`${row.colorText} font-bold w-8 text-right`} data-testid={row.testId}>{row.count}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5" /> Streaks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                    <span className="text-gray-400">Current Streak</span>
                    <span className={`font-bold text-lg ${record.streakType === "win" ? "text-green-400" : record.streakType === "loss" ? "text-red-400" : "text-gray-400"}`} data-testid="text-current-streak">
                      {record.currentStreak > 0 ? `${record.currentStreak} ${record.streakType === "win" ? "Wins" : "Losses"}` : "No active streak"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                    <span className="text-gray-400">Best Win Streak</span>
                    <span className="font-bold text-lg text-green-400" data-testid="text-best-streak">{record.bestStreak} Wins</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800">
                    <span className="text-gray-400">Total Games Played</span>
                    <span className="font-bold text-lg text-white" data-testid="text-total-games">{record.totalGames}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {record.totalGames === 0 && (
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="py-12 text-center">
                  <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Games Yet</h3>
                  <p className="text-gray-500">Play your first match to start tracking your earnings and stats.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── MATCH HISTORY ── */}
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Recent Matches
                </CardTitle>
                <CardDescription className="text-gray-400">Your latest game results and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                {recentMatches.length > 0 ? (
                  <div className="space-y-3">
                    {recentMatches.map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700" data-testid={`row-match-${match.id}`}>
                        <div className="flex items-center gap-4">
                          {getResultBadge(match.result)}
                          <div>
                            <p className="text-white font-medium">vs {match.opponent}</p>
                            <p className="text-sm text-gray-400">{match.division} · {match.date}</p>
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${match.result === "win" ? "text-green-400" : match.result === "loss" ? "text-red-400" : "text-yellow-400"}`}>
                          {match.result === "win" ? "+" : match.result === "loss" ? "-" : ""}{formatCurrency(match.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Calendar className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">No matches recorded yet. Your history will appear here after your first game.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── MONTHLY ── */}
          <TabsContent value="monthly" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" /> Monthly Breakdown
                </CardTitle>
                <CardDescription className="text-gray-400">Your earnings by month</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <div className="space-y-3">
                    {monthlyData.map((month) => (
                      <div key={month.month} className="p-4 rounded-lg bg-gray-800 border border-gray-700" data-testid={`row-month-${month.month}`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-semibold">{month.month}</h4>
                          <span className={`text-lg font-bold ${getNetColor(month.net)}`}>
                            {month.net >= 0 ? "+" : ""}{formatCurrency(month.net)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Record</p>
                            <p className="text-white font-medium">
                              <span className="text-green-400">{month.wins}W</span>{" - "}
                              <span className="text-red-400">{month.losses}L</span>
                              {month.draws > 0 && <span className="text-yellow-400"> - {month.draws}D</span>}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Won</p>
                            <p className="text-green-400 font-medium">{formatCurrency(month.earnings)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Lost</p>
                            <p className="text-red-400 font-medium">{formatCurrency(month.spent)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <BarChart3 className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">Monthly data will appear here once you start playing matches.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── MEMBERSHIP TIERS ── */}
          <TabsContent value="tiers" className="space-y-6" data-testid="tab-content-tiers">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Membership Tiers</h2>
              <p className="text-gray-400 text-sm mb-6">
                Higher tiers = lower commission on every match. All tiers include the $20 match commitment deposit system.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {SUBSCRIPTION_TIERS.map((tier) => {
                  const colors = TIER_COLOR_MAP[tier.color];
                  return (
                    <Card key={tier.name} className={`bg-gray-900 ${colors.border}`} data-testid={`card-tier-${tier.name.toLowerCase()}`}>
                      <CardHeader>
                        <CardTitle className={`${colors.text} flex items-center gap-2`}>
                          <Star className="h-5 w-5" />
                          {tier.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400">{tier.price}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className={`${colors.bg} rounded-lg p-3 text-center`}>
                          <div className={`text-2xl font-bold ${colors.text}`}>{tier.commission}</div>
                          <div className="text-xs text-gray-400">commission rate</div>
                        </div>
                        <ul className="space-y-2">
                          {tier.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className={`${colors.text} mt-0.5 flex-shrink-0`}>✓</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                        <a
                          href={tier.paymentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block w-full text-center py-2.5 px-4 rounded-lg text-white font-bold text-sm ${colors.btn} transition-colors`}
                        >
                          Choose {tier.name}
                        </a>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Deposit rules summary */}
              <Card className="bg-gray-900 border-gray-700 mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5" /> Match Deposit Rules (All Tiers)
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Applies regardless of membership tier. Deposits are refunded after confirmed match result.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { range: "≤ $300 stake",        rule: "$20 flat deposit",  color: "green",  example: "$20 on a $150 match" },
                      { range: "$301–$1,000 stake",    rule: "10% deposit",       color: "purple", example: "$50 on a $500 match" },
                      { range: "$1,001–$5,000 stake",  rule: "7% deposit",        color: "yellow", example: "$140 on a $2,000 match" },
                      { range: "$5,001+ stake",        rule: "5% deposit",        color: "blue",   example: "$500 on a $10,000 match" },
                    ].map((d) => {
                      const c = TIER_COLOR_MAP[d.color];
                      return (
                        <div key={d.range} className={`rounded-lg p-4 ${c.bg} border ${c.border}`}>
                          <div className={`text-lg font-bold ${c.text}`}>{d.rule}</div>
                          <div className="text-white text-sm font-medium mt-1">{d.range}</div>
                          <div className="text-gray-500 text-xs mt-1 italic">{d.example}</div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-gray-500 text-xs mt-4">
                    Stakes over $300 require admin-verified stake mode OR the % deposit collected immediately at scheduling.
                    No-show = opponent keeps your deposit. Late 30–60 min = $10 penalty.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── DEPOSIT RULES ── */}
          <TabsContent value="deposits" className="space-y-6" data-testid="tab-content-deposits">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5" /> Anti-Ghosting Deposit System
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Deposits protect both players. Collected at scheduling, refunded after confirmed result.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Deposit tiers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { range: "≤ $300",       rule: "$20 flat", pct: null,  color: "green",  example: "$20 on a $150 match" },
                    { range: "$301–$1,000",  rule: "10%",      pct: "10%", color: "purple", example: "$50 on a $500 match" },
                    { range: "$1,001–$5,000",rule: "7%",       pct: "7%",  color: "yellow", example: "$140 on $2,000" },
                    { range: "$5,001+",      rule: "5%",       pct: "5%",  color: "blue",   example: "$500 on $10,000" },
                  ].map((d) => {
                    const c = TIER_COLOR_MAP[d.color];
                    return (
                      <div key={d.range} className={`rounded-xl p-4 border-t-2 ${c.border} bg-gray-800`}>
                        <div className={`text-2xl font-bold ${c.text}`}>{d.pct ?? "$20"}</div>
                        <div className="text-white text-sm font-semibold mt-1">{d.range} stake</div>
                        <div className="text-gray-400 text-xs mt-1">{d.rule}</div>
                        <div className={`text-xs mt-2 italic ${c.text} opacity-70`}>e.g. {d.example}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Rules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: "🚫", title: "No-Show Rule", desc: "If one player no-shows, the player who showed receives the opponent's full deposit automatically." },
                    { icon: "⏰", title: "Late Penalty", desc: "30–60 min late = $10 penalty. Both players late = no penalty. Check-in window: 15 min before → 30 min after start." },
                    { icon: "✅", title: "Verification Required", desc: "Stakes over $300 require admin-verified stake mode OR the % deposit collected immediately at scheduling." },
                    { icon: "🔒", title: "Stacked Deposits", desc: "For stakes over $300: $20 flat deposit AND the % deposit are both collected. Total shown clearly before payment." },
                  ].map((r) => (
                    <div key={r.title} className="rounded-lg p-4 bg-gray-800 border border-gray-700">
                      <div className="text-2xl mb-2">{r.icon}</div>
                      <div className="text-white font-semibold text-sm mb-1">{r.title}</div>
                      <div className="text-gray-400 text-xs leading-relaxed">{r.desc}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
