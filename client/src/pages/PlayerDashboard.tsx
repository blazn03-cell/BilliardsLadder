import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Trophy, Users, DollarSign, Star, Zap, Calendar, TrendingUp, Bell, Flame, Swords, ChevronRight } from "lucide-react";
import SafeText from "@/components/SafeText";
import { QuickChallengeDialog } from "@/components/QuickChallengeDialog";

function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const step = end / 20;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.round(start));
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display}{suffix}</>;
}

function StreakFire({ streak }: { streak: number }) {
  if (streak < 2) return null;
  return <span className="ml-2 animate-pulse">{streak >= 10 ? "🔥🔥🔥" : streak >= 5 ? "🔥🔥" : "🔥"}</span>;
}

function Countdown({ hoursLeft }: { hoursLeft: number }) {
  const h = Math.floor(hoursLeft);
  const m = Math.round((hoursLeft - h) * 60);
  const urgent = hoursLeft < 6;
  return (
    <span className={`text-xs font-mono font-bold ${urgent ? "text-red-400 animate-pulse" : "text-amber-400"}`}>
      {urgent ? "⚠️ " : "⏰ "}{h}h {m}m left
    </span>
  );
}

export default function PlayerDashboard() {
  const [isQuickChallengeOpen, setIsQuickChallengeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "challenges" | "leaderboard" | "quests">("overview");
  const [toast, setToast] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: playerStats } = useQuery({ queryKey: ["/api/player/stats"], refetchInterval: 30000, retry: false });
  const { data: challenges = [] } = useQuery({ queryKey: ["/api/player/challenges"], refetchInterval: 15000, retry: false });
  const { data: leaderboard = [] } = useQuery({ queryKey: ["/api/player/leaderboard"], refetchInterval: 60000, retry: false });
  const { data: dailyQuests = [] } = useQuery({ queryKey: ["/api/quests/daily"], retry: false });
  const { data: weeklyQuests = [] } = useQuery({ queryKey: ["/api/quests/weekly"], retry: false });
  const { data: walletData } = useQuery({ queryKey: ["/api/wallet"], refetchInterval: 60000, retry: false });
  const { data: notifications } = useQuery({ queryKey: ["/api/notifications"], refetchInterval: 20000, retry: false });
  const { data: liveFeed } = useQuery({ queryKey: ["/api/live-feed"], refetchInterval: 10000, retry: false });
  const { data: streakLeaderboard = [] } = useQuery({ queryKey: ["/api/streaks/leaderboard"], retry: false });
  const { data: gameVote } = useQuery({ queryKey: ["/api/game-voting/current"], retry: false });

  const voteMutation = useMutation({
    mutationFn: async ({ gameId, optionIndex }: { gameId: string; optionIndex: number }) => {
      const res = await fetch(`/api/game-voting/${gameId}/vote`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ optionIndex }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/game-voting/current"] });
      setToast("Vote cast! +15 credits 🎉");
      setTimeout(() => setToast(null), 3000);
    },
  });

  const stats = playerStats as any;
  const wallet = walletData as any;
  const notifs = notifications as any;
  const feed = liveFeed as any;
  const winStreak = stats?.winStreak || 0;
  const hotStreak = winStreak >= 3 || stats?.hotStreak;
  const urgentChallenges = (challenges as any[]).filter((c: any) => c.urgent).length;
  const pendingCount = (challenges as any[]).filter((c: any) => c.status === "pending").length;

  const tabs = [
    { id: "overview", label: "📊 Overview", badge: null },
    { id: "challenges", label: "⚔️ Challenges", badge: pendingCount || null },
    { id: "leaderboard", label: "🏆 Rankings", badge: null },
    { id: "quests", label: "🎯 Quests", badge: (dailyQuests as any[]).filter((q: any) => !q.completed).length || null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 p-4 md:p-6">

      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-sm animate-bounce">
          {toast}
        </div>
      )}

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
            <Target className="mr-3 text-neon-green" />
            <SafeText>{stats?.playerName || "Player"}</SafeText>
            {hotStreak && <StreakFire streak={winStreak} />}
          </h1>
          <p className="text-gray-400 mt-1 flex items-center gap-3 flex-wrap">
            <SafeText>{stats?.tier || "Rookie"} Division</SafeText>
            {hotStreak && <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/30 animate-pulse font-bold">🔥 ON FIRE</span>}
            {notifs?.urgentCount > 0 && <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500/30 font-bold">🚨 {notifs.urgentCount} urgent</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {feed?.liveCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5 bg-red-600/20 border border-red-600/40 text-red-400 text-xs px-3 py-1.5 rounded-full animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full" />{feed.liveCount} LIVE
            </div>
          )}
          <Button onClick={() => setIsQuickChallengeOpen(true)} className="bg-neon-green hover:bg-green-400 text-black font-black text-sm shadow-lg shadow-green-900/40">
            ⚡ Challenge Now
          </Button>
        </div>
      </div>

      {notifs?.notifications?.length > 0 && (
        <div className="mb-4 space-y-2">
          {notifs.notifications.slice(0, 2).map((n: any) => (
            <div key={n.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm border ${n.urgent ? "bg-red-900/30 border-red-600/40 text-red-200" : "bg-amber-900/20 border-amber-600/30 text-amber-200"}`}>
              <Bell className={`w-4 h-4 flex-shrink-0 ${n.urgent ? "text-red-400" : "text-amber-400"}`} />
              <span className="font-bold">{n.title}</span>
              <span className="text-gray-400 hidden md:block">— {n.body}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-black/60 backdrop-blur-sm border border-neon-green/30">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-gray-400 mb-1">Fargo Rating</div>
            <div className="text-2xl font-bold text-white"><AnimatedNumber value={stats?.fargoRating || 450} /></div>
            <div className={`text-xs ${(stats?.ratingChange || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
              {(stats?.ratingChange || 0) >= 0 ? "▲" : "▼"} {Math.abs(stats?.ratingChange || 0)} this week
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black/60 backdrop-blur-sm border border-yellow-500/30">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-gray-400 mb-1">Ladder Rank</div>
            <div className="text-2xl font-bold text-white">#<AnimatedNumber value={stats?.ladderRank || 999} /></div>
            <div className="text-xs text-gray-400">{stats?.division || "Rookie"} Division</div>
          </CardContent>
        </Card>
        <Card className={`bg-black/60 backdrop-blur-sm ${hotStreak ? "border border-orange-500/60" : "border border-blue-500/30"}`}>
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-gray-400 mb-1">Win Streak</div>
            <div className={`text-2xl font-bold ${hotStreak ? "text-orange-400" : "text-white"}`}><AnimatedNumber value={winStreak} />{hotStreak && " 🔥"}</div>
            <div className="text-xs text-gray-400">Best: {stats?.recordStreak || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-black/60 backdrop-blur-sm border border-purple-500/30">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="text-xs text-gray-400 mb-1">Wallet</div>
            <div className="text-2xl font-bold text-green-400">$<AnimatedNumber value={Math.round(wallet?.balance || 0)} /></div>
            <div className="text-xs text-purple-400">{wallet?.bonusCredits || 0} credits{wallet?.welcomeBonus && <span className="ml-1 text-yellow-400">🎁</span>}</div>
          </CardContent>
        </Card>
      </div>

      {stats?.nextRankGap != null && (
        <div className="mb-5 bg-black/40 rounded-xl border border-white/5 px-5 py-3">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Progress to next rank</span>
            <span className="text-neon-green font-bold">{50 - (stats.nextRankGap || 50)} / 50 pts</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-neon-green to-emerald-400 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, ((50 - (stats.nextRankGap || 50)) / 50) * 100)}%` }} />
          </div>
          {stats?.streakBonus > 0 && <div className="text-xs text-orange-400 mt-1">🔥 Streak bonus active: +{stats.streakBonus} pts/win</div>}
        </div>
      )}

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-neon-green text-black shadow-lg" : "bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60"}`}>
            {tab.label}
            {tab.badge != null && tab.badge > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${activeTab === tab.id ? "bg-black text-green-400" : "bg-red-500 text-white"}`}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="bg-black/60 backdrop-blur-sm border border-neon-green/30">
              <CardHeader className="pb-2"><CardTitle className="text-lg font-bold text-white flex items-center"><Swords className="mr-2 text-neon-green w-5 h-5" />Challenge Center</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => setIsQuickChallengeOpen(true)} className="w-full bg-neon-green hover:bg-green-400 text-black font-black">⚡ Issue Quick Challenge</Button>
                <Button variant="outline" className="w-full border-neon-green/40 text-neon-green hover:bg-neon-green/10 text-sm">Browse Open Challenges</Button>
                <div className="bg-green-900/20 border border-green-600/20 rounded-lg p-3">
                  <div className="text-sm text-green-300 font-bold">{pendingCount} pending challenges</div>
                  <div className="text-xs text-green-500 mt-0.5">{stats?.nearbyActivePlayers || 0} players active nearby</div>
                  {urgentChallenges > 0 && <div className="text-xs text-red-400 mt-1 animate-pulse font-bold">⚠️ {urgentChallenges} expiring soon!</div>}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black/60 backdrop-blur-sm border border-blue-500/30">
              <CardHeader className="pb-2"><CardTitle className="text-lg font-bold text-white flex items-center"><TrendingUp className="mr-2 text-blue-400 w-5 h-5" />Performance</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-green-900/20 rounded-lg p-3"><div className="text-2xl font-black text-green-400">{stats?.wins || 0}</div><div className="text-xs text-gray-400">Wins</div></div>
                  <div className="bg-red-900/20 rounded-lg p-3"><div className="text-2xl font-black text-red-400">{stats?.losses || 0}</div><div className="text-xs text-gray-400">Losses</div></div>
                  <div className="bg-blue-900/20 rounded-lg p-3"><div className="text-xl font-black text-blue-400">{stats?.totalMatches || 0}</div><div className="text-xs text-gray-400">Total</div></div>
                  <div className="bg-purple-900/20 rounded-lg p-3"><div className="text-xl font-black text-purple-400">{stats?.totalMatches > 0 ? Math.round((stats.wins / stats.totalMatches) * 100) : 0}%</div><div className="text-xs text-gray-400">Win Rate</div></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black/60 backdrop-blur-sm border border-amber-500/30">
              <CardHeader className="pb-2"><CardTitle className="text-lg font-bold text-white flex items-center"><DollarSign className="mr-2 text-amber-400 w-5 h-5" />Earnings</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Available</span><span className="text-green-400 font-black text-lg">${(wallet?.balance || 0).toFixed(2)}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Pending</span><span className="text-amber-400 font-bold">${(wallet?.pendingEarnings || 0).toFixed(2)}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Credits</span><span className="text-purple-400 font-bold">{wallet?.bonusCredits || 0} pts</span></div>
                <Button variant="outline" className="w-full border-amber-500/40 text-amber-400 hover:bg-amber-900/20 text-sm">View Full Wallet</Button>
              </CardContent>
            </Card>
          </div>

          {feed?.events?.length > 0 && (
            <Card className="bg-black/60 backdrop-blur-sm border border-red-500/20">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-white flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />Live Activity</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {(feed.events as any[]).slice(0, 6).map((event: any, i: number) => (
                    <div key={i} className={`flex-shrink-0 text-xs px-3 py-2 rounded-lg border ${event.hot ? "bg-orange-900/30 border-orange-500/30 text-orange-300" : "bg-gray-800/50 border-gray-700 text-gray-400"}`}>
                      {event.type === "match_live" ? "🎱 Match LIVE" : "⚔️ Challenge Open"}
                      {event.stakeAmount > 0 && <span className="ml-1 text-green-400 font-bold">${event.stakeAmount}</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {gameVote && (
            <Card className="bg-black/60 backdrop-blur-sm border border-purple-500/30">
              <CardHeader className="pb-2"><CardTitle className="text-lg font-bold text-white flex items-center"><Star className="mr-2 text-purple-400 w-5 h-5" />Community Vote — Earn 15 Credits</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-300 font-medium mb-3">{(gameVote as any).title}</p>
                <div className="space-y-2">
                  {(gameVote as any).options.map((opt: string, i: number) => {
                    const votes = (gameVote as any).votes[i] || 0;
                    const total = (gameVote as any).totalVotes || 1;
                    const pct = Math.round((votes / total) * 100);
                    return (
                      <button key={i} onClick={() => voteMutation.mutate({ gameId: (gameVote as any).gameId, optionIndex: i })} className="w-full text-left group">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-200 group-hover:text-white">{opt}</span>
                          <span className="text-purple-400 font-bold">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-600 to-purple-400 h-1.5 rounded-full transition-all duration-700 group-hover:from-purple-500 group-hover:to-pink-400" style={{ width: `${pct}%` }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-purple-400 mt-3 text-right">{(gameVote as any).totalVotes} total votes</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "challenges" && (
        <div className="space-y-3">
          {(challenges as any[]).length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎱</div>
              <p className="text-gray-400 text-lg mb-2">No active challenges</p>
              <p className="text-gray-600 text-sm mb-6">Issue a challenge to climb the ladder!</p>
              <Button onClick={() => setIsQuickChallengeOpen(true)} className="bg-neon-green hover:bg-green-400 text-black font-black px-8 py-3">⚡ Issue Challenge Now</Button>
            </div>
          ) : (
            (challenges as any[]).map((c: any, i: number) => (
              <Card key={c.id || i} className={`bg-black/60 backdrop-blur-sm ${c.urgent ? "border border-red-500/60 shadow-red-900/20 shadow-lg" : "border border-gray-700/40"}`}>
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.status === "pending" ? "bg-amber-500/20 text-amber-400" : c.status === "accepted" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>{c.status?.toUpperCase()}</span>
                        {c.urgent && <span className="text-xs text-red-400 font-bold animate-pulse">⚠️ URGENT</span>}
                      </div>
                      <div className="text-white font-bold">{c.challengerName || "Challenge"} vs {c.defenderName || "Opponent"}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        Stake: <span className="text-green-400 font-bold">${c.stakeAmount || 0}</span>
                        {c.ratingSwingPreview && <span className="ml-3 text-purple-400">±{c.ratingSwingPreview} rating</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {c.hoursLeft != null && <Countdown hoursLeft={c.hoursLeft} />}
                      {c.status === "pending" && <Button size="sm" className="mt-2 bg-neon-green hover:bg-green-400 text-black text-xs font-black">Accept</Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <div className="pt-4">
            <Button onClick={() => setIsQuickChallengeOpen(true)} className="w-full bg-neon-green hover:bg-green-400 text-black font-black py-4 text-base">⚡ Issue New Challenge</Button>
          </div>
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div className="space-y-5">
          <Card className="bg-black/60 backdrop-blur-sm border border-yellow-500/30">
            <CardHeader className="pb-2"><CardTitle className="text-lg font-bold text-white flex items-center"><Trophy className="mr-2 text-yellow-400 w-5 h-5" />Division Leaderboard</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(leaderboard as any[]).slice(0, 15).map((p: any, i: number) => (
                  <div key={p.id || i} className={`flex items-center gap-3 p-3 rounded-lg ${i < 3 ? "bg-yellow-900/10 border border-yellow-800/20" : "bg-gray-900/30"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${i === 0 ? "bg-yellow-400 text-black" : i === 1 ? "bg-gray-300 text-black" : i === 2 ? "bg-amber-600 text-white" : "bg-gray-700 text-gray-300"}`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm truncate">{p.name}{p.hotStreak && <span className="ml-1">🔥</span>}{p.isOnline && <span className="ml-1.5 w-2 h-2 bg-green-500 rounded-full inline-block" />}</div>
                      <div className="text-xs text-gray-400">{p.wins}W – {p.losses}L • {p.tier}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white font-bold text-sm">{p.fargoRating}</div>
                      {p.streak > 0 && <div className="text-xs text-orange-400">🔥{p.streak}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {(streakLeaderboard as any[]).length > 0 && (
            <Card className="bg-black/60 backdrop-blur-sm border border-orange-500/30">
              <CardHeader className="pb-2"><CardTitle className="text-lg font-bold text-white flex items-center"><Flame className="mr-2 text-orange-400 w-5 h-5" />Hottest Streaks Right Now</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(streakLeaderboard as any[]).slice(0, 8).map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-gray-900/40 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs w-5 text-center">{i + 1}</span>
                        <span className="text-white font-semibold text-sm">{p.name}</span>
                        <span className="text-xs text-gray-500">{p.tier}</span>
                      </div>
                      <span className={`text-sm font-black ${p.fireLevel === "inferno" ? "text-red-400" : p.fireLevel === "hot" ? "text-orange-400" : "text-amber-400"}`}>
                        {p.fireLevel === "inferno" ? "🔥🔥🔥" : p.fireLevel === "hot" ? "🔥🔥" : "🔥"} {p.streak}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "quests" && (
        <div className="space-y-5">
          <Card className="bg-black/60 backdrop-blur-sm border border-blue-500/30">
            <CardHeader className="pb-2"><CardTitle className="text-lg font-bold text-white flex items-center"><Zap className="mr-2 text-blue-400 w-5 h-5" />Daily Quests <span className="ml-2 text-xs text-gray-400 font-normal">Resets in 24h</span></CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(dailyQuests as any[]).map((q: any) => (
                <div key={q.id} className={`p-4 rounded-xl border ${q.completed ? "bg-green-900/20 border-green-700/30" : "bg-gray-900/40 border-gray-700/30"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-white font-bold text-sm">{q.title}{q.completed && <span className="ml-2 text-green-400">✓</span>}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{q.description}</div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${q.completed ? "bg-green-500/20 text-green-400" : "bg-amber-500/15 text-amber-400 border border-amber-500/20"}`}>{q.reward}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-700 ${q.completed ? "bg-green-500" : "bg-blue-600"}`} style={{ width: `${q.progress || 0}%` }} />
                  </div>
                  {q.streak && <div className="text-xs text-purple-400 mt-1">🔥 {q.streak} day streak</div>}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-black/60 backdrop-blur-sm border border-purple-500/30">
            <CardHeader className="pb-2"><CardTitle className="text-lg font-bold text-white flex items-center"><Trophy className="mr-2 text-purple-400 w-5 h-5" />Weekly Challenges <span className="ml-2 text-xs text-gray-400 font-normal">Resets Sunday</span></CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(weeklyQuests as any[]).map((q: any) => (
                <div key={q.id} className={`p-4 rounded-xl border ${q.completed ? "bg-green-900/20 border-green-700/30" : "bg-gray-900/40 border-gray-700/30"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-white font-bold text-sm">{q.title}{q.completed && <span className="ml-2 text-green-400">✓</span>}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{q.description}</div>
                      {q.current != null && <div className="text-xs text-gray-500 mt-1">{q.current}/{q.target} completed</div>}
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${q.completed ? "bg-green-500/20 text-green-400" : "bg-purple-500/15 text-purple-400 border border-purple-500/20"}`}>{q.reward}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-700 ${q.completed ? "bg-green-500" : "bg-purple-600"}`} style={{ width: `${q.progress || 0}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="bg-gradient-to-r from-neon-green/10 to-emerald-900/20 border border-neon-green/30 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">🎱</div>
            <h3 className="text-white font-black text-xl mb-1">Ready to Grind?</h3>
            <p className="text-gray-400 text-sm mb-4">Every match earns XP, credits, and ladder progress</p>
            <Button onClick={() => setIsQuickChallengeOpen(true)} className="bg-neon-green hover:bg-green-400 text-black font-black px-8 py-3 text-base shadow-lg shadow-green-900/40">⚡ Find a Match Now</Button>
          </div>
        </div>
      )}

      <QuickChallengeDialog isOpen={isQuickChallengeOpen} onClose={() => setIsQuickChallengeOpen(false)} />
    </div>
  );
}
