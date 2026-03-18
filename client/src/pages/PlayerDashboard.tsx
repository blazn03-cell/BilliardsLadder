import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target, Trophy, Users, DollarSign, Star, Zap,
  Calendar, TrendingUp, BarChart2, Award, Shield, Flame,
} from "lucide-react";
import SafeText from "@/components/SafeText";
import { QuickChallengeDialog } from "@/components/QuickChallengeDialog";

// ─── VIP tier helper ─────────────────────────────────────────────────────────
const VIP_TIERS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  LEGEND: { label: "LEGEND", color: "#ffd700", bg: "rgba(255,215,0,0.12)",  icon: "👑" },
  GOLD:   { label: "GOLD",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "🥇" },
  SILVER: { label: "SILVER", color: "#9ca3af", bg: "rgba(156,163,175,0.1)", icon: "🥈" },
  BRONZE: { label: "BRONZE", color: "#92400e", bg: "rgba(146,64,14,0.1)",   icon: "🥉" },
};

function getVipTier(points: number, wins: number) {
  if (points >= 5000 || wins >= 50) return "LEGEND";
  if (points >= 2500 || wins >= 25) return "GOLD";
  if (points >= 1000 || wins >= 10) return "SILVER";
  return "BRONZE";
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  title, value, sub, icon: Icon, color,
}: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <Card style={{
      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)",
      border: `1px solid ${color}33`,
      boxShadow: `0 0 20px ${color}11`,
      transition: "box-shadow 0.2s",
    }}>
      <CardHeader style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 4 }}>
        <CardTitle style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {title}
        </CardTitle>
        <Icon size={15} style={{ color }} />
      </CardHeader>
      <CardContent>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#f0fdf4" }}>{value}</div>
        {sub && <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Win-rate ring ────────────────────────────────────────────────────────────
function WinRateRing({ pct }: { pct: number }) {
  const r = 36, circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  const color = pct >= 65 ? "#22c55e" : pct >= 50 ? "#86efac" : pct >= 35 ? "#fbbf24" : "#f87171";
  return (
    <svg width={90} height={90} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
      <circle
        cx={45} cy={45} r={r} fill="none"
        stroke={color} strokeWidth={7}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text x={45} y={45} textAnchor="middle" dominantBaseline="middle"
        style={{ fill: color, fontSize: 15, fontWeight: 800, transform: "rotate(90deg)", transformOrigin: "45px 45px" }}>
        {pct}%
      </text>
    </svg>
  );
}

// ─── Matchmaking candidates (FACEIT-inspired) ────────────────────────────────
function MatchmakingWidget({ playerId }: { playerId?: string }) {
  const { data, isLoading } = useQuery<any>({
    queryKey: ["/api/matchmaking/find", playerId],
    queryFn: () =>
      playerId
        ? fetch(`/api/matchmaking/find/${playerId}`).then((r) => r.json())
        : Promise.resolve(null),
    enabled: !!playerId,
    staleTime: 60_000,
  });

  if (!playerId) return null;

  return (
    <Card style={{
      background: "linear-gradient(135deg,#0d2416,#060e09)",
      border: "1px solid #16a34a33",
      gridColumn: "1 / -1",
    }}>
      <CardHeader style={{ paddingBottom: 8 }}>
        <CardTitle style={{ fontSize: 13, color: "#86efac", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
            boxShadow: "0 0 8px #22c55e", display: "inline-block",
            animation: "mm-pulse 2s infinite",
          }} />
          Intelligent Matchmaking
          <span style={{ marginLeft: "auto", color: "#4b5563", fontSize: 10, fontWeight: 400 }}>
            Powered by FACEIT-style ELO proximity
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <style>{`@keyframes mm-pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

        {isLoading && (
          <div style={{ color: "#4b5563", fontSize: 13, padding: "8px 0" }}>Finding best opponents…</div>
        )}
        {!isLoading && !data?.candidates?.length && (
          <div style={{ color: "#6b7280", fontSize: 13 }}>No active opponents right now. Check back soon.</div>
        )}
        <div style={{ display: "grid", gap: 8 }}>
          {(data?.candidates ?? []).slice(0, 5).map((c: any, i: number) => (
            <div key={c.player.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 8,
              background: i === 0 ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
              border: i === 0 ? "1px solid #16a34a55" : "1px solid #ffffff08",
            }}>
              <span style={{ color: "#6ee7b7", fontWeight: 800, fontSize: 12, minWidth: 18 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#f0fdf4", fontWeight: 600, fontSize: 13 }}>{c.player.name}</div>
                <div style={{ color: "#4b5563", fontSize: 11, marginTop: 2 }}>{c.reason}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#86efac", fontWeight: 700, fontSize: 12 }}>
                  {c.player.rating ?? 500} ELO
                </div>
                {c.suggestedHandicap !== 0 && (
                  <div style={{ fontSize: 10, color: c.suggestedHandicap > 0 ? "#22c55e" : "#f59e0b" }}>
                    {c.suggestedHandicap > 0 ? `+${c.suggestedHandicap} spots` : `${c.suggestedHandicap} spots`}
                  </div>
                )}
              </div>
              <Button size="sm" style={{
                background: "rgba(34,197,94,0.15)", border: "1px solid #16a34a55",
                color: "#22c55e", fontSize: 11, padding: "4px 12px",
              }}>
                CHALLENGE
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Recent activity ─────────────────────────────────────────────────────────
function RecentActivityFeed({ challenges }: { challenges: any[] }) {
  if (!challenges?.length) {
    return (
      <div style={{ color: "#4b5563", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
        No recent activity. Challenge someone to get started!
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {challenges.slice(0, 6).map((c: any, i: number) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 10px", borderRadius: 6,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid #ffffff08",
        }}>
          <span style={{ fontSize: 16 }}>
            {c.result === "win" ? "✅" : c.result === "loss" ? "❌" : "⏳"}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#d1fae5", fontSize: 12, fontWeight: 600 }}>{c.opponent ?? "Unknown"}</div>
            <div style={{ color: "#4b5563", fontSize: 10 }}>{c.date ?? "Pending"}</div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: c.result === "win" ? "#22c55e" : c.result === "loss" ? "#ef4444" : "#fbbf24",
          }}>
            {c.result?.toUpperCase() ?? "PENDING"}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PlayerDashboard() {
  const [isQuickChallengeOpen, setIsQuickChallengeOpen] = useState(false);

  const { data: playerStats } = useQuery<any>({
    queryKey: ["/api/player/stats"],
    retry: false,
  });

  const { data: challenges } = useQuery<any>({
    queryKey: ["/api/player/challenges"],
    retry: false,
  });

  const wins    = playerStats?.wins ?? 0;
  const losses  = playerStats?.losses ?? 0;
  const winRate = playerStats?.winRate ?? (wins + losses > 0 ? Math.round(wins / (wins + losses) * 100) : 0);
  const tier    = getVipTier(playerStats?.points ?? 0, wins);
  const tierCfg = VIP_TIERS[tier];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#000 0%,#0a1a0f 60%,#060a0d 100%)",
      padding: "24px 16px",
    }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .stat-card:hover{box-shadow:0 0 28px rgba(34,197,94,0.12)!important}
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        marginBottom: 28, display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        animation: "fadeUp 0.3s ease",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#f0fdf4", margin: 0 }}>
              Player Dashboard
            </h1>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 10px", borderRadius: 5,
              background: tierCfg.bg, border: `1px solid ${tierCfg.color}55`,
              color: tierCfg.color, fontSize: 11, fontWeight: 700,
            }}>
              {tierCfg.icon} {tierCfg.label}
            </span>
          </div>
          <p style={{ color: "#6b7280", margin: 0, fontSize: 14 }}>
            <SafeText>{`${playerStats?.playerName ?? "Player"} · ${playerStats?.tier ?? "Rookie"} Division · Rank #${playerStats?.ladderRank ?? "—"}`}</SafeText>
          </p>
        </div>
        <Button
          onClick={() => setIsQuickChallengeOpen(true)}
          style={{
            background: "linear-gradient(135deg,#16a34a,#15803d)",
            color: "#f0fdf4", fontWeight: 700, fontSize: 13,
            border: "none", padding: "10px 20px", borderRadius: 8,
            boxShadow: "0 0 20px rgba(34,197,94,0.25)",
            cursor: "pointer",
          }}
        >
          ⚔️ Quick Challenge
        </Button>
      </div>

      {/* ── Stat row ────────────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
        gap: 14, marginBottom: 24, animation: "fadeUp 0.4s ease",
      }}>
        <StatCard title="Fargo Rating"  value={playerStats?.fargoRating ?? 425} sub={`+${playerStats?.ratingChange ?? 0} this week`} icon={Target}     color="#22c55e" />
        <StatCard title="Ladder Rank"   value={`#${playerStats?.ladderRank ?? 23}`} sub={`of ${playerStats?.totalPlayers ?? "?"} players`} icon={Trophy}     color="#f59e0b" />
        <StatCard title="Win Streak"    value={playerStats?.streak ?? 0}        sub={`type: ${playerStats?.streakType === "win" ? "🔥 Win" : playerStats?.streakType === "loss" ? "🧊 Loss" : "—"}`} icon={Flame}      color="#3b82f6" />
        <StatCard title="Total Wins"    value={wins}                            sub={`${losses} losses · ${winRate}% WR`} icon={Award}      color="#8b5cf6" />
      </div>

      {/* ── Win rate + matchmaking row ───────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "auto 1fr",
        gap: 14, marginBottom: 24, animation: "fadeUp 0.45s ease",
        alignItems: "start",
      }}>
        {/* Win rate ring */}
        <Card style={{
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(12px)",
          border: "1px solid #8b5cf633", minWidth: 160,
        }}>
          <CardHeader style={{ paddingBottom: 6 }}>
            <CardTitle style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <WinRateRing pct={winRate} />
            <p style={{ color: "#6b7280", fontSize: 11, margin: 0 }}>
              {wins}W — {losses}L
            </p>
          </CardContent>
        </Card>

        {/* Matchmaking */}
        <MatchmakingWidget playerId={playerStats?.playerId} />
      </div>

      {/* ── Recent Activity ─────────────────────────────────────────────── */}
      <Card style={{
        background: "rgba(0,0,0,0.5)", border: "1px solid #ffffff11",
        marginBottom: 24, animation: "fadeUp 0.5s ease",
      }}>
        <CardHeader>
          <CardTitle style={{ fontSize: 14, color: "#86efac", display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={15} /> Recent Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivityFeed challenges={challenges ?? []} />
        </CardContent>
      </Card>

      {/* ── Quick links ──────────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))",
        gap: 10, animation: "fadeUp 0.55s ease",
      }}>
        {[
          { icon: Trophy,    label: "Tournaments",   href: "/tournaments" },
          { icon: Users,     label: "Team Play",     href: "/teams" },
          { icon: DollarSign,label: "Wallet",        href: "/payments" },
          { icon: Star,      label: "Challenge Pool", href: "/side-betting" },
          { icon: BarChart2, label: "Career Stats",  href: "/career" },
          { icon: Shield,    label: "Leaderboard",   href: "/hall-leaderboard" },
        ].map(({ icon: Icon, label, href }) => (
          <a key={label} href={href} style={{ textDecoration: "none" }}>
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 8, padding: "16px 12px", borderRadius: 10,
              background: "rgba(255,255,255,0.03)", border: "1px solid #ffffff0a",
              cursor: "pointer", transition: "all 0.15s",
              color: "#86efac",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "rgba(34,197,94,0.07)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#16a34a44";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
              (e.currentTarget as HTMLDivElement).style.borderColor = "#ffffff0a";
            }}>
              <Icon size={20} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textAlign: "center" }}>{label}</span>
            </div>
          </a>
        ))}
      </div>

      <QuickChallengeDialog
        isOpen={isQuickChallengeOpen}
        onClose={() => setIsQuickChallengeOpen(false)}
      />
    </div>
  );
}
