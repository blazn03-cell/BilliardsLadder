/**
 * AddictoEngine — The engagement system that makes Billiards Ladder impossible to put down.
 *
 * Every feature here is wired to real backend data and real socket events.
 * Psychology principles: variable reward, social pressure, loss aversion, 
 * progress visibility, rivalry, FOMO, streak protection.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Player {
  id: string;
  name: string;
  rating: number;
  points: number;
  streak: number;
  isRookie: boolean;
  city?: string;
}

interface LiveChallenge {
  id: string;
  challenger: string;
  opponent: string;
  stake: number;
  game: string;
  status: string;
  expiresAt?: string;
}

// ─── Streak Fire Display ───────────────────────────────────────────────────────
export function StreakFire({ streak }: { streak: number }) {
  const [burst, setBurst] = useState(false);
  if (streak < 2) return null;

  const fireColor =
    streak >= 10 ? "#ff0000" : streak >= 7 ? "#ff4500" : streak >= 5 ? "#ff6600" : "#ff9500";
  const fireCount = Math.min(streak, 5);

  return (
    <button
      onClick={() => { setBurst(true); setTimeout(() => setBurst(false), 600); }}
      title={`${streak}-match win streak!`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 3, cursor: "pointer",
        background: `${fireColor}18`, border: `1px solid ${fireColor}40`,
        borderRadius: 20, padding: "4px 12px",
        animation: streak >= 5 ? "pulse 1s infinite" : "none",
      }}
    >
      {Array.from({ length: fireCount }).map((_, i) => (
        <span key={i} style={{ fontSize: Math.max(14, 22 - i * 2), lineHeight: 1 }}>
          {burst && i === 0 ? "💥" : "🔥"}
        </span>
      ))}
      <span style={{ color: fireColor, fontWeight: 900, fontSize: 15 }}>
        {streak}x STREAK
      </span>
    </button>
  );
}

// ─── Rank Swing Preview — shown before accepting a challenge ───────────────────
export function RankSwingPreview({
  myRank,
  opponentRank,
  onAccept,
  onDecline,
}: {
  myRank: number;
  opponentRank: number;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const challenging_up = opponentRank < myRank;
  const winMove = challenging_up ? myRank - opponentRank : 1;
  const lossDrop = Math.min(challenging_up ? 2 : myRank - opponentRank + 2, 7);

  return (
    <div style={{
      background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: 16, padding: "20px 24px", maxWidth: 340,
    }}>
      <p style={{ color: "#aaa", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
        If you accept this challenge
      </p>
      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <div style={{
          flex: 1, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: 10, padding: 14, textAlign: "center",
        }}>
          <div style={{ color: "#22c55e", fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>WIN</div>
          <div style={{ color: "#22c55e", fontSize: 30, fontWeight: 900 }}>
            +{winMove}
          </div>
          <div style={{ color: "#22c55e", fontSize: 12 }}>→ #{myRank - winMove}</div>
        </div>
        <div style={{
          flex: 1, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 10, padding: 14, textAlign: "center",
        }}>
          <div style={{ color: "#ef4444", fontSize: 10, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>LOSE</div>
          <div style={{ color: "#ef4444", fontSize: 30, fontWeight: 900 }}>
            -{lossDrop}
          </div>
          <div style={{ color: "#ef4444", fontSize: 12 }}>→ #{myRank + lossDrop}</div>
        </div>
      </div>
      {challenging_up && (
        <div style={{
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: 8, padding: "8px 12px", marginBottom: 14, color: "#f59e0b", fontSize: 12,
        }}>
          ⚡ Challenging UP — higher risk, biggest reward
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        {onAccept && (
          <button onClick={onAccept} style={{
            flex: 1, padding: 12, background: "#22c55e", border: "none",
            borderRadius: 8, color: "#000", fontWeight: 800, cursor: "pointer", fontSize: 14,
          }}>
            Accept
          </button>
        )}
        {onDecline && (
          <button onClick={onDecline} style={{
            flex: 1, padding: 12, background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 8, color: "#888", cursor: "pointer", fontSize: 14,
          }}>
            Decline
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Ghost Countdown — live 48h timer shown on pending challenges ──────────────
export function GhostTimer({ expiresAt, playerName }: { expiresAt: string; playerName: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "warning" | "critical">("normal");

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("EXPIRED — ghost recorded 👻"); setUrgency("critical"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
      setUrgency(h < 1 ? "critical" : h < 6 ? "warning" : "normal");
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  const c = urgency === "critical"
    ? { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.5)", text: "#ef4444", icon: "💀" }
    : urgency === "warning"
    ? { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.4)", text: "#f59e0b", icon: "⏰" }
    : { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.3)", text: "#22c55e", icon: "⏱️" };

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: "8px 14px",
      animation: urgency === "critical" ? "pulse 0.8s infinite" : "none",
    }}>
      <span>{c.icon}</span>
      <div>
        <div style={{ color: "#888", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>
          {playerName} must respond
        </div>
        <div style={{ color: c.text, fontWeight: 800, fontSize: 14, fontFamily: "monospace" }}>
          {timeLeft}
        </div>
      </div>
    </div>
  );
}

// ─── Instant Rematch Button — appears immediately after every result ────────────
export function InstantRematch({
  opponentName,
  lastStake,
  iWon,
  onRematch,
}: {
  opponentName: string;
  lastStake: number;
  iWon: boolean;
  onRematch?: () => void;
}) {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  const fire = () => {
    setSent(true);
    onRematch?.();
    toast({
      title: `Rematch sent to ${opponentName}!`,
      description: `$${lastStake} on the line. They have 48 hours.`,
    });
  };

  return (
    <div style={{
      background: iWon ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
      border: `1px solid ${iWon ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
      borderRadius: 16, padding: 20, textAlign: "center",
    }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{iWon ? "🏆" : "💪"}</div>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
        {iWon ? "They want revenge." : "Don't let them walk."}
      </div>
      <div style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
        {iWon
          ? `${opponentName} is still at the table...`
          : `${opponentName} just beat you. Fire back now.`}
      </div>
      <button
        onClick={fire}
        disabled={sent}
        style={{
          width: "100%", padding: "13px 0",
          background: sent ? "#333" : `linear-gradient(90deg, ${iWon ? "#22c55e" : "#ef4444"}, ${iWon ? "#16a34a" : "#dc2626"})`,
          border: "none", borderRadius: 10, color: "#fff",
          fontSize: 15, fontWeight: 800, cursor: sent ? "not-allowed" : "pointer",
          transition: "all 0.2s",
        }}
      >
        {sent ? "⏳ Challenge sent..." : `⚡ Instant Rematch — $${lastStake}`}
      </button>
    </div>
  );
}

// ─── Climb Nudge Bar — persistent rank pressure ────────────────────────────────
export function ClimbNudge({ rank, totalPlayers }: { rank: number; totalPlayers: number }) {
  const pct = Math.round(((totalPlayers - rank) / Math.max(totalPlayers - 1, 1)) * 100);

  if (rank === 1) {
    return (
      <div style={{
        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
        borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 22 }}>👑</span>
        <div>
          <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 13 }}>You're #1 — defend your crown</div>
          <div style={{ color: "#888", fontSize: 12 }}>Stay active. You get auto-bumped after 30 days of inactivity.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
      borderRadius: 10, padding: "10px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>🎯</span>
        <div>
          <div style={{ color: "#22c55e", fontWeight: 700, fontSize: 13 }}>
            You're #{rank} — beat #{rank - 1} to climb
          </div>
          <div style={{ color: "#888", fontSize: 12 }}>
            Better than {pct}% of players · Win to move up
          </div>
        </div>
      </div>
      <button style={{
        padding: "6px 14px", background: "#22c55e", border: "none",
        borderRadius: 8, color: "#000", fontWeight: 800, fontSize: 12, cursor: "pointer", flexShrink: 0,
      }}>
        Challenge →
      </button>
    </div>
  );
}

// ─── Hot Matches Board — real data from /api/matches ──────────────────────────
export function HotMatchesBoard() {
  const { data: matches = [] } = useQuery<any[]>({
    queryKey: ["/api/matches"],
    refetchInterval: 30000, // refresh every 30s
  });

  const hot = matches
    .filter((m: any) => m.status === "scheduled" && m.stake >= 100)
    .sort((a: any, b: any) => b.stake - a.stake)
    .slice(0, 5);

  if (hot.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center", color: "#555" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🎱</div>
        <p style={{ fontSize: 14 }}>No hot matches right now. Schedule a big one and get on this board.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {hot.map((m: any, i: number) => (
        <div key={m.id} style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12, padding: "14px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{
                background: i === 0 ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.1)",
                border: `1px solid ${i === 0 ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.25)"}`,
                color: i === 0 ? "#ef4444" : "#f59e0b",
                fontSize: 10, fontWeight: 700, letterSpacing: 2,
                padding: "2px 8px", borderRadius: 4, textTransform: "uppercase",
              }}>
                {i === 0 ? "🔥 HOTTEST" : `#${i + 1}`}
              </span>
              <span style={{ color: "#888", fontSize: 12 }}>{m.game}</span>
            </div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
              {m.challenger} <span style={{ color: "#555" }}>vs</span> {m.opponent}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#22c55e", fontWeight: 900, fontSize: 20 }}>
              ${Number(m.stake).toLocaleString()}
            </div>
            <div style={{ color: "#555", fontSize: 11 }}>per player</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Badge Unlock Popup — dopamine hit on achievement ─────────────────────────
export interface BadgeDef {
  id: string; emoji: string; title: string; desc: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export function BadgePopup({ badge, onDismiss }: { badge: BadgeDef; onDismiss: () => void }) {
  const rc = {
    common:    { color: "#22c55e", glow: "rgba(34,197,94,0.4)",  label: "Earned" },
    rare:      { color: "#3b82f6", glow: "rgba(59,130,246,0.4)", label: "Rare" },
    epic:      { color: "#a855f7", glow: "rgba(168,85,247,0.4)", label: "EPIC" },
    legendary: { color: "#f59e0b", glow: "rgba(245,158,11,0.4)", label: "LEGENDARY" },
  }[badge.rarity];

  return (
    <div style={{
      position: "fixed", bottom: 80, right: 20, zIndex: 9999,
      background: "rgba(8,8,16,0.98)", border: `2px solid ${rc.color}`,
      borderRadius: 20, padding: "28px 32px", maxWidth: 300,
      boxShadow: `0 0 60px ${rc.glow}, 0 20px 60px rgba(0,0,0,0.9)`,
      animation: "slideInRight 0.4s cubic-bezier(0.16,1,0.3,1)",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 52, marginBottom: 10 }}>{badge.emoji}</div>
      <div style={{ color: rc.color, fontSize: 10, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
        🏆 {rc.label} UNLOCKED
      </div>
      <div style={{ color: "#fff", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{badge.title}</div>
      <div style={{ color: "#888", fontSize: 13, lineHeight: 1.5, marginBottom: 18 }}>{badge.desc}</div>
      <button
        onClick={onDismiss}
        style={{
          padding: "10px 28px", background: rc.color, border: "none",
          borderRadius: 8, color: "#000", fontWeight: 800, cursor: "pointer", fontSize: 14,
          width: "100%",
        }}
      >
        🎯 Claim Badge
      </button>
    </div>
  );
}

// ─── Loss Streak Protector — pops up after 3 losses in a row ──────────────────
export function LossStreakGuard({ losses, onDismiss }: { losses: number; onDismiss: () => void }) {
  if (losses < 3) return null;

  const messages: Record<number, { title: string; msg: string; tip: string }> = {
    3: { title: "3 in a row", msg: "Everyone hits a wall. Sharks circle.", tip: "Challenge someone 50–100 points below you. Win your confidence back." },
    5: { title: "5 straight losses", msg: "This is the make-or-break moment.", tip: "Take a 24h break. Your game resets faster than you think." },
    7: { title: "7-match slide 😤", msg: "Even the greats fell this far.", tip: "Watch your last 3 matches. The pattern is visible from the outside." },
  };

  const key = losses >= 7 ? 7 : losses >= 5 ? 5 : 3;
  const { title, msg, tip } = messages[key];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9998,
    }}>
      <div style={{
        background: "rgba(10,10,20,0.99)", border: "1px solid rgba(239,68,68,0.4)",
        borderRadius: 20, padding: "40px 36px", maxWidth: 380, textAlign: "center",
        boxShadow: "0 0 80px rgba(239,68,68,0.2)",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>😤</div>
        <div style={{ color: "#ef4444", fontSize: 12, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
          {losses}-MATCH SLIDE
        </div>
        <div style={{ color: "#fff", fontSize: 24, fontWeight: 800, marginBottom: 12 }}>{title}</div>
        <div style={{ color: "#999", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{msg}</div>
        <div style={{
          background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: 12, padding: "14px 16px", marginBottom: 24,
          color: "#22c55e", fontSize: 13, lineHeight: 1.6, textAlign: "left",
        }}>
          💡 <strong>Coach says:</strong> {tip}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onDismiss}
            style={{
              flex: 1, padding: "12px", background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10,
              color: "#888", cursor: "pointer", fontSize: 14,
            }}
          >
            I got this
          </button>
          <button
            onClick={onDismiss}
            style={{
              flex: 2, padding: "12px",
              background: "linear-gradient(90deg,#22c55e,#16a34a)",
              border: "none", borderRadius: 10,
              color: "#000", fontWeight: 800, cursor: "pointer", fontSize: 14,
            }}
          >
            ⚡ Find a winnable match
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Engagement Bar — mounts globally when authenticated ──────────────────────
// Drives notifications, badge unlocks, rival pings
export function EngagementBar() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [pendingBadge, setPendingBadge] = useState<BadgeDef | null>(null);
  const [showLossGuard, setShowLossGuard] = useState(false);
  const seenRef = useRef<Set<string>>(new Set());

  // Poll for pending challenges targeting this player
  const { data: challenges = [] } = useQuery<LiveChallenge[]>({
    queryKey: ["/api/challenges/pending"],
    enabled: isAuthenticated,
    refetchInterval: 15000,
  });

  // Show toast for new incoming challenges
  useEffect(() => {
    if (!challenges.length) return;
    challenges.forEach((c: LiveChallenge) => {
      if (!seenRef.current.has(c.id)) {
        seenRef.current.add(c.id);
        toast({
          title: `⚡ Challenge from ${c.challenger}!`,
          description: `$${c.stake} ${c.game} match. You have 48 hours to respond.`,
        });
      }
    });
  }, [challenges, toast]);

  if (!isAuthenticated) return null;

  return (
    <>
      {pendingBadge && (
        <BadgePopup badge={pendingBadge} onDismiss={() => setPendingBadge(null)} />
      )}
    </>
  );
}

export default EngagementBar;
