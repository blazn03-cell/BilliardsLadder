import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Minus, Trophy, Target, BarChart3, Calendar } from "lucide-react";

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
      } else {
        setRecord({
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
        setRecentMatches([]);
        setMonthlyData([]);
      }
    } catch {
      // defaults already set
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6" data-testid="page-player-earnings">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-400">
              Your Earnings
            </h1>
            <p className="text-gray-400 mt-2">
              Track your wins, losses, and overall standing
            </p>
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
            <Badge variant="outline" className={`${getNetColor(record.netEarnings)} border-current`} data-testid="badge-net-status">
              {getNetLabel(record.netEarnings)}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-600" data-testid="tab-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-green-600" data-testid="tab-history">
              Match History
            </TabsTrigger>
            <TabsTrigger value="monthly" className="data-[state=active]:bg-green-600" data-testid="tab-monthly">
              Monthly Breakdown
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900 border-green-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Total Winnings
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    From {record.wins} wins
                  </CardDescription>
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
                    <TrendingDown className="h-5 w-5" />
                    Total Losses
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    From {record.losses} losses
                  </CardDescription>
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
                  <CardDescription className="text-gray-400">
                    {getNetLabel(record.netEarnings)}
                  </CardDescription>
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
                    <Target className="h-5 w-5" />
                    Win Rate
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {record.totalGames} total games
                  </CardDescription>
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
                    <BarChart3 className="h-5 w-5" />
                    Game Record
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Wins</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${record.totalGames ? (record.wins / record.totalGames) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-green-400 font-bold w-8 text-right" data-testid="text-wins-count">{record.wins}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Losses</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${record.totalGames ? (record.losses / record.totalGames) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-red-400 font-bold w-8 text-right" data-testid="text-losses-count">{record.losses}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Draws</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: `${record.totalGames ? (record.draws / record.totalGames) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-yellow-400 font-bold w-8 text-right" data-testid="text-draws-count">{record.draws}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Streaks
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

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Matches
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your latest game results and earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentMatches.length > 0 ? (
                  <div className="space-y-3">
                    {recentMatches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700"
                        data-testid={`row-match-${match.id}`}
                      >
                        <div className="flex items-center gap-4">
                          {getResultBadge(match.result)}
                          <div>
                            <p className="text-white font-medium">vs {match.opponent}</p>
                            <p className="text-sm text-gray-400">{match.division} &middot; {match.date}</p>
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

          <TabsContent value="monthly" className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Breakdown
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your earnings by month
                </CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <div className="space-y-3">
                    {monthlyData.map((month) => (
                      <div
                        key={month.month}
                        className="p-4 rounded-lg bg-gray-800 border border-gray-700"
                        data-testid={`row-month-${month.month}`}
                      >
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
                              <span className="text-green-400">{month.wins}W</span>
                              {" - "}
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
        </Tabs>
      </div>
    </div>
  );
}
