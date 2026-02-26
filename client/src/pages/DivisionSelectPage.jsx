import { useState } from "react";

// Each division is its own private page players sign up for.
// Base plan = one division. Adding other 2 sizes = +$13/each.

const DIVISIONS = [
  {
    id: "barbox",
    name: "Kiddie Box King",
    subtitle: "7ft Tables Only",
    emoji: "📐",
    tagline: "Where hustlers are born. Lock in before the break.",
    color: "#22c55e",
    glow: "rgba(34,197,94,0.2)",
    accentBg: "#052010",
    fargo: "Under 500 Fargo",
    addOnPrice: 13,
    tiers: [
      { name: "Barbox Rookie Division", fargo: "Under 400", color: "#86efac", desc: "New to barbox? Start here. Safe entry, smaller rank swings for first 3 matches." },
      { name: "Barbox Contenders", fargo: "499 & Under", color: "#22c55e", desc: "Climb fast. Every win matters. Streak bonuses active." },
      { name: "Barbox Elite", fargo: "500–599", color: "#16a34a", desc: "Top dogs of the 7ft. Rivals tracked. Rematches automatic." },
    ],
    games: [
      { name: "BCA 8-Ball", desc: "Classic barbox 8-ball, standard rules" },
      { name: "Fast 8", desc: "Speed variation — no call shot, race the clock" },
      { name: "9-Ball", desc: "Rotation low to high, last ball wins" },
      { name: "10-Ball", desc: "Call shot rotation — test your precision" },
      { name: "Banks / 9-Ball Banks", desc: "All shots must bank — pure skill" },
      { name: "One Ball (One & Done)", desc: "Single ball elimination, no second chances" },
      { name: "Saratoga", desc: "Regional specialty — local legend format" },
    ],
    rules: [
      "Challenge anyone within ±60 rank (auto-expands to ±220 if <4 opponents found)",
      "48-hour challenge acceptance window — timer shown everywhere",
      "Challenger pays $60 entry fee (tier subscribers only)",
      "Winner takes 94% — 6% to operator",
      "Rookie Division: graduate at 400+ Fargo rating",
      "$20 match commitment deposit required at scheduling",
      "No-show = opponent keeps your deposit",
      "30–60 min late = $10 penalty deducted",
      "Check-in window: 15 min before → 30 min after start",
      "Max 2 paid matches vs same opponent per 14 days (anti-farming)",
      "Rank swing cap: max +18 gain / −10 loss per match",
      "Top of ladder too long → auto-bumped to next division",
    ],
    winLoss: {
      pointsWin: 18,
      pointsLoss: -6,
      streakBonus: "W3+ unlocks Fast Track suggestions",
      lossStreak: "L2+ triggers Protect Your Rank popup",
      bandRange: "Every 100 Fargo points = new band",
    },
    bounties: [
      { amount: 50, target: "Current Division Leader" },
      { amount: 30, target: "#2 Ranked Player" },
    ],
    kiddieBonusPool: true,
  },
  {
    id: "midsize",
    name: "Almost Big Time",
    subtitle: "8ft Tables Only",
    emoji: "📏",
    tagline: "Premium territory. Prove you belong before going all the way.",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.2)",
    accentBg: "#150d00",
    fargo: "500–700 Fargo",
    addOnPrice: 13,
    tiers: [
      { name: "8ft Contenders", fargo: "Rating ≤ 650", color: "#fbbf24", desc: "Fight your way up the 8ft ranks. Fast-track available on win streaks." },
      { name: "8ft Elite", fargo: "Rating ≥ 651", color: "#f59e0b", desc: "Only the sharp survive. Rivals remembered. Calcutta access unlocked." },
    ],
    games: [
      { name: "Straight 8 (Open)", desc: "Open table 8-ball, no call shot" },
      { name: "BCA 8-Ball", desc: "Official tournament rules" },
      { name: "Fast 8", desc: "Speed variation of 8-ball" },
      { name: "14.1 (Straight Pool)", desc: "Continuous rack — 100+ ball runs possible" },
      { name: "Saratoga", desc: "Regional specialty game" },
      { name: "9-Ball", desc: "Rotation game, low to high" },
      { name: "10-Ball", desc: "Call shot rotation" },
      { name: "1-Pocket", desc: "Strategic pocket game — think 3 moves ahead" },
      { name: "Banks", desc: "All shots must bank" },
      { name: "9-Ball Banks", desc: "Banking rotation game" },
      { name: "1 Ball 1 Pocket", desc: "Single ball, one pocket — ultimate pressure" },
    ],
    rules: [
      "8ft Premium access: included in Standard/Premium membership OR $13 add-on",
      "Challenge ranges: 730–600 / 599–500 / 499–300 enforced by system",
      "Cross-tier challenges allowed with rank swing caps",
      "Favorite by 100+: only 1 down-challenge per 7 days",
      "3 wins in a row vs 100+ lower → blocked until playing same/up band",
      "$20 commitment deposit + % deposit for stakes over $300",
      "Stakes: $60 presets up to $1,000,000 custom",
      "Calcutta format available for tournaments (6.5% house + 6.5% TD)",
      "2 guaranteed matches/week for Standard & Premium members",
      "7-day pause bank — rank protected while paused",
      "Handicap system active: lose 2 in a row → opponent owes handicap",
    ],
    winLoss: {
      pointsWin: 18,
      pointsLoss: -10,
      streakBonus: "W2+ unlocks premium match suggestions",
      lossStreak: "L2+ = handicap advantage next match",
      bandRange: "500–599 / 600–699 / 700+",
    },
    bounties: [
      { amount: 50, target: "8ft Division Leader" },
      { amount: 30, target: "Top 8ft Contender" },
    ],
    kiddieBonusPool: false,
  },
  {
    id: "bigdog",
    name: "Big Dog",
    subtitle: "9ft Tables Only",
    emoji: "🏆",
    tagline: "The throne room. Only the best sit here.",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.2)",
    accentBg: "#0d0515",
    fargo: "600+ Fargo",
    addOnPrice: 13,
    tiers: [
      { name: "9ft Champion Division", fargo: "599 & Under", color: "#c084fc", desc: "Earn your spot among the greats. Every match counts double." },
      { name: "9ft Elite", fargo: "600+", color: "#a855f7", desc: "The summit. Top 10 displayed globally. Rivalries forged in fire." },
    ],
    games: [
      { name: "9-Ball", desc: "The king of 9ft — rotation, low to high" },
      { name: "10-Ball", desc: "Call shot rotation — precision required" },
      { name: "14.1 Straight Pool", desc: "The classic — run 100+ or go home" },
      { name: "1-Pocket", desc: "Chess on a pool table" },
      { name: "Banks", desc: "All shots must bank" },
      { name: "BCA 8-Ball", desc: "Official championship format" },
      { name: "Artistic Pool", desc: "Trick shot competition format" },
      { name: "Scotch Doubles", desc: "Team 2v2 alternating shots" },
    ],
    rules: [
      "9ft Big Dog is the pinnacle — highest tier of competition",
      "Challenge ranges strictly enforced: 730–600 / 599–500",
      "Rank swing caps enforced: max +18 gain / −10 loss",
      "Anti-farming: same opponent max 2 paid matches per 14 days",
      "Mandatory % deposit on stakes over $300",
      "Verified stake mode required for stakes over $5,000",
      "Calcutta mandatory for Big Dog tournaments",
      "Weekly 2-match guarantee for Premium members",
      "Top-of-ladder auto-bump rule enforced after 30 days",
      "Coaching only available to Premium members (logged + credited)",
      "Rival tracking active — rematches suggested after every match",
    ],
    winLoss: {
      pointsWin: 18,
      pointsLoss: -10,
      streakBonus: "W3+ = Fast Track + featured on Hot Matches",
      lossStreak: "L3+ = cooldown suggestion + handicap option",
      bandRange: "600–699 / 700+ bands",
    },
    bounties: [
      { amount: 100, target: "9ft Reigning Champion" },
      { amount: 50, target: "Top 9ft Contender" },
    ],
    kiddieBonusPool: false,
  },
];

// ── Opponent finder simulation (G0.1 logic display) ──
function OpponentFinder({ division }) {
  const [expanded, setExpanded] = useState(false);
  const steps = [
    { range: "±60 rank", status: "primary" },
    { range: "±90 rank", status: "expand" },
    { range: "±120 rank", status: "expand" },
    { range: "±160 rank", status: "expand" },
    { range: "±220 rank (max)", status: "expand" },
  ];
  const fallbacks = ["Post Open Challenge", "Play Casual Match", "Practice Drills", "Schedule Any Member (casual)", "Teaching Match (Premium credit)"];

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20, marginTop: 16 }}>
      <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
        🎯 Opponent Finder — Always 4+ Options Guaranteed
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            background: s.status === "primary" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${s.status === "primary" ? "#22c55e" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 6, padding: "5px 12px", fontSize: 11, color: s.status === "primary" ? "#22c55e" : "#666",
          }}>
            Step {i + 1}: {s.range}
          </div>
        ))}
      </div>
      <div style={{ color: "#555", fontSize: 11, marginBottom: 8 }}>If still &lt;4 opponents after ±220 → fallbacks shown:</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {fallbacks.map((f, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 5, padding: "4px 10px", fontSize: 11, color: "#777" }}>
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Streak Engine display ──
function StreakEngine({ division }) {
  const [streak, setStreak] = useState(0);
  const isWin = streak > 0;
  const isLoss = streak < 0;
  const abs = Math.abs(streak);

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20 }}>
      <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
        🔥 Streak Engine (Live on Your Dashboard)
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
        <button onClick={() => setStreak(s => s - 1)} style={{ background: "#ef4444", border: "none", borderRadius: 6, padding: "6px 14px", color: "#fff", cursor: "pointer", fontWeight: 700 }}>− Loss</button>
        <div style={{
          flex: 1, textAlign: "center", padding: "10px 0",
          color: isWin ? "#22c55e" : isLoss ? "#ef4444" : "#666",
          fontSize: 22, fontWeight: 800,
        }}>
          {streak === 0 ? "No streak" : `${isWin ? "W" : "L"}${abs}`}
        </div>
        <button onClick={() => setStreak(s => s + 1)} style={{ background: "#22c55e", border: "none", borderRadius: 6, padding: "6px 14px", color: "#000", cursor: "pointer", fontWeight: 700 }}>+ Win</button>
      </div>
      {isWin && abs >= 2 && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e40", borderRadius: 8, padding: "10px 14px", color: "#22c55e", fontSize: 12 }}>
        ⚡ {abs >= 3 ? "FAST TRACK UNLOCKED — Best opponents surfaced for you!" : "Win one more to unlock Fast Track match suggestions!"}
      </div>}
      {isLoss && abs >= 2 && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid #ef444440", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: 12 }}>
        🛡️ {abs >= 3 ? "Protect Your Rank popup active — cooldown, lighter match, or pause options shown" : "One more loss → Protect Your Rank popup appears"}
      </div>}
      <button onClick={() => setStreak(0)} style={{ background: "none", border: "none", color: "#444", fontSize: 11, cursor: "pointer", marginTop: 8 }}>Reset</button>
    </div>
  );
}

// ── Main Page ──
export default function DivisionSelectPage() {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("overview");
  const [joinModal, setJoinModal] = useState(false);

  const div = DIVISIONS.find(d => d.id === selected);

  if (selected && div) {
    return (
      <div style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${div.accentBg} 0%, #080810 60%)`,
        fontFamily: "'Georgia', serif", padding: "0 0 80px",
      }}>
        {/* Header bar */}
        <div style={{
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)",
          borderBottom: `2px solid ${div.color}30`,
          padding: "16px 32px", display: "flex", alignItems: "center", gap: 16,
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <button onClick={() => setSelected(null)} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "8px 16px", color: "#fff", cursor: "pointer", fontSize: 13,
          }}>← All Divisions</button>
          <span style={{ fontSize: 20 }}>{div.emoji}</span>
          <div>
            <div style={{ color: div.color, fontWeight: 800, fontSize: 18 }}>{div.name}</div>
            <div style={{ color: "#555", fontSize: 11 }}>{div.subtitle}</div>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setJoinModal(true)}
            style={{
              background: `linear-gradient(90deg, ${div.color}, ${div.color}cc)`,
              border: "none", borderRadius: 10, padding: "10px 24px",
              color: "#000", fontWeight: 800, fontSize: 14, cursor: "pointer",
            }}
          >
            Join {div.name}
          </button>
        </div>

        {/* Hero */}
        <div style={{
          textAlign: "center", padding: "60px 20px 40px",
          borderBottom: `1px solid ${div.color}20`,
        }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>{div.emoji}</div>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, margin: "0 0 10px" }}>{div.name}</h1>
          <p style={{ color: div.color, fontSize: 16, margin: "0 0 8px" }}>{div.subtitle} · {div.fargo}</p>
          <p style={{ color: "#777", fontSize: 14, maxWidth: 500, margin: "0 auto" }}>{div.tagline}</p>

          {/* Bounties */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            {div.bounties.map((b, i) => (
              <div key={i} style={{
                background: `${div.color}15`, border: `1px solid ${div.color}40`,
                borderRadius: 10, padding: "10px 20px", display: "flex", gap: 10, alignItems: "center",
              }}>
                <span style={{ color: div.color, fontWeight: 800, fontSize: 20 }}>${b.amount}</span>
                <div>
                  <div style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>ACTIVE BOUNTY</div>
                  <div style={{ color: "#777", fontSize: 11 }}>{b.target}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, padding: "20px 32px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
          {["overview", "games", "rules", "win-loss", "opponents", "streaks"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? div.color : "transparent",
              border: `1px solid ${tab === t ? div.color : "rgba(255,255,255,0.08)"}`,
              borderBottom: "none", borderRadius: "8px 8px 0 0",
              padding: "10px 18px", color: tab === t ? "#000" : "#666",
              cursor: "pointer", fontSize: 12, fontWeight: tab === t ? 800 : 400,
              textTransform: "capitalize", whiteSpace: "nowrap",
            }}>
              {t === "win-loss" ? "Win/Loss System" : t === "opponents" ? "Opponent Finder" : t === "streaks" ? "Streak Engine" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginBottom: 32 }}>
                {div.tiers.map((tier, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.03)", border: `1px solid ${tier.color}30`,
                    borderRadius: 14, padding: 24, borderTop: `3px solid ${tier.color}`,
                  }}>
                    <div style={{ color: tier.color, fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{tier.name}</div>
                    <div style={{ color: "#555", fontSize: 12, marginBottom: 10 }}>{tier.fargo}</div>
                    <p style={{ color: "#bbb", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{tier.desc}</p>
                  </div>
                ))}
              </div>

              {/* Live Activity Strip */}
              <div style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: "14px 20px", display: "flex", gap: 24, flexWrap: "wrap",
              }}>
                <div style={{ color: "#555", fontSize: 11, fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase", alignSelf: "center" }}>Live Activity</div>
                {[
                  { icon: "⚡", label: "Challenges posted last hour", val: "12" },
                  { icon: "🎱", label: "Matches scheduled today", val: "34" },
                  { icon: "🔥", label: "Top grinders this week", val: "8 active" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span>{item.icon}</span>
                    <div>
                      <div style={{ color: div.color, fontWeight: 700, fontSize: 14 }}>{item.val}</div>
                      <div style={{ color: "#444", fontSize: 10 }}>{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add-on pricing */}
              <div style={{
                marginTop: 20, background: `${div.color}08`,
                border: `1px solid ${div.color}25`, borderRadius: 12, padding: "18px 20px",
              }}>
                <div style={{ color: div.color, fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                  💳 Division Access Pricing
                </div>
                <div style={{ color: "#ccc", fontSize: 13, lineHeight: 1.8 }}>
                  Included in your base membership plan. Adding the other 2 table sizes = <strong style={{ color: div.color }}>+$13 each</strong> per month.
                  You can always upgrade inside the app.
                </div>
              </div>
            </div>
          )}

          {/* GAMES */}
          {tab === "games" && (
            <div>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 24 }}>
                {div.emoji} {div.name} — Approved Games
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
                {div.games.map((g, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12, padding: "16px 18px",
                    borderLeft: `3px solid ${div.color}`,
                    transition: "all 0.2s", cursor: "default",
                  }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{g.name}</div>
                    <div style={{ color: "#666", fontSize: 12, lineHeight: 1.5 }}>{g.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RULES */}
          {tab === "rules" && (
            <div>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                📋 {div.name} — Official Rules
              </h2>
              <p style={{ color: "#555", fontSize: 13, marginBottom: 24 }}>All rules enforced automatically by the system. No exceptions without operator override (logged).</p>

              {/* Challenge Handicap */}
              <div style={{
                background: "rgba(255,255,255,0.03)", border: `1px solid ${div.color}30`,
                borderRadius: 14, padding: 24, marginBottom: 20,
              }}>
                <div style={{ color: div.color, fontWeight: 800, fontSize: 15, marginBottom: 12 }}>
                  ⚖️ Challenge Handicap System
                </div>
                {[
                  "Lose 2 in a row to same higher-ranked player → they owe you handicap points",
                  "Lose 3 in a row → handicap points OR opponent pays 1.5× the normal entry fee",
                  "Challenger Rule: receive handicap advantage or opponent pays 1.5× entry fee",
                  "Fair play enforcement — system auto-applies, no manual requests needed",
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                    <span style={{ color: div.color, flexShrink: 0 }}>•</span>
                    <span style={{ color: "#bbb", fontSize: 13 }}>{r}</span>
                  </div>
                ))}
              </div>

              {div.rules.map((rule, i) => (
                <div key={i} style={{
                  display: "flex", gap: 14, padding: "12px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "flex-start",
                }}>
                  <span style={{
                    background: `${div.color}20`, color: div.color,
                    borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ color: "#bbb", fontSize: 13, lineHeight: 1.6 }}>{rule}</span>
                </div>
              ))}
            </div>
          )}

          {/* WIN/LOSS */}
          {tab === "win-loss" && (
            <div>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 24 }}>📊 Win/Loss & Points System</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
                {[
                  { label: "Win Points", val: `+${div.winLoss.pointsWin}`, color: "#22c55e" },
                  { label: "Loss Points", val: `${div.winLoss.pointsLoss}`, color: "#ef4444" },
                  { label: "Max Gain Cap", val: "+18", color: "#22c55e" },
                  { label: "Max Loss Cap", val: "−10", color: "#ef4444" },
                  { label: "Underdog Loss Cap", val: "−6", color: "#f59e0b" },
                  { label: "Favorite Win Cap", val: "+12", color: "#a855f7" },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}25`,
                    borderRadius: 12, padding: "20px", textAlign: "center",
                  }}>
                    <div style={{ color: s.color, fontSize: 32, fontWeight: 800 }}>{s.val}</div>
                    <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar example */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24, marginBottom: 20 }}>
                <div style={{ color: "#fff", fontWeight: 700, marginBottom: 12 }}>📈 Progress to Next Band</div>
                <div style={{ color: "#666", fontSize: 12, marginBottom: 8 }}>Example: You have 340 points in the 300–399 band</div>
                <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, height: 12, marginBottom: 8 }}>
                  <div style={{ background: `linear-gradient(90deg, ${div.color}, ${div.color}80)`, height: "100%", borderRadius: 8, width: "40%" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#555", fontSize: 11 }}>
                  <span>300</span>
                  <span style={{ color: div.color }}>340 pts · ~6 wins to next band</span>
                  <span>400</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { icon: "🔥", title: "Win Streak Bonus", desc: div.winLoss.streakBonus, color: "#22c55e" },
                  { icon: "🛡️", title: "Loss Streak Protection", desc: div.winLoss.lossStreak, color: "#ef4444" },
                  { icon: "🏷️", title: "Band System", desc: div.winLoss.bandRange, color: div.color },
                  { icon: "🆕", title: "Safe Entry (First 3 Matches)", desc: "Smaller rank swings + no spotlight + learning buffer", color: "#a855f7" },
                ].map((item, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.03)", border: `1px solid ${item.color}25`,
                    borderRadius: 12, padding: 18,
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                    <div style={{ color: item.color, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ color: "#777", fontSize: 12, lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OPPONENT FINDER */}
          {tab === "opponents" && (
            <div>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>🎯 Opponent Availability System</h2>
              <p style={{ color: "#555", fontSize: 13, marginBottom: 24 }}>
                The system guarantees you always see 4+ valid opponents. If not enough players exist in your range, it auto-expands. No dead screens, ever.
              </p>
              <OpponentFinder division={div} />

              {/* Challenge timer demo */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20, marginTop: 20 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>⏱️ Challenge Timer (shown everywhere)</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { label: "Fresh Challenge", time: "Expires in 47h 52m", color: "#22c55e" },
                    { label: "Expiring Soon", time: "Expires in 2h 14m", color: "#f59e0b" },
                    { label: "Critical", time: "Expires in 0h 22m", color: "#ef4444" },
                  ].map((c, i) => (
                    <div key={i} style={{
                      background: `${c.color}10`, border: `1px solid ${c.color}30`,
                      borderRadius: 8, padding: "10px 16px", flex: 1, minWidth: 160,
                    }}>
                      <div style={{ color: "#777", fontSize: 11 }}>{c.label}</div>
                      <div style={{ color: c.color, fontWeight: 800, fontSize: 15 }}>{c.time}</div>
                    </div>
                  ))}
                </div>
                <div style={{ color: "#444", fontSize: 11, marginTop: 10 }}>
                  Expired challenges auto-cancel and both players are notified immediately.
                </div>
              </div>

              {/* Auto-rematch */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20, marginTop: 16 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🔄 Auto-Rematch Loop (after every match)</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ background: `${div.color}15`, border: `1px solid ${div.color}40`, borderRadius: 8, padding: "12px 20px", flex: 1 }}>
                    <div style={{ color: div.color, fontWeight: 800, fontSize: 14 }}>Rematch (same stakes)</div>
                    <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>Primary action after every match</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 20px", flex: 1 }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Rematch (new stakes)</div>
                    <div style={{ color: "#666", fontSize: 11, marginTop: 2 }}>Secondary action — raise the stakes</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "10px 14px", color: "#777", fontSize: 12 }}>
                  🏆 Rivalry Record displayed: <strong style={{ color: "#fff" }}>"You 2–1 Them"</strong> — rivalries form naturally
                </div>
              </div>
            </div>
          )}

          {/* STREAKS */}
          {tab === "streaks" && (
            <div>
              <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>🔥 Streak Engine</h2>
              <p style={{ color: "#555", fontSize: 13, marginBottom: 24 }}>
                Win and loss streaks are always visible on your dashboard. They create urgency, dopamine, and a reason to play right now.
              </p>
              <StreakEngine division={div} />

              {/* Daily quests */}
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 20, marginTop: 20 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📋 Daily & Weekly Quests</div>
                {[
                  { quest: "Post 1 challenge", reward: "+50 XP badge", done: true },
                  { quest: "Play 1 ranked match", reward: "+100 XP badge", done: true },
                  { quest: "Complete 1 drill set", reward: "Discount credit", done: false },
                  { quest: "Confirm match result", reward: "+25 XP badge", done: false },
                ].map((q, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      background: q.done ? div.color : "rgba(255,255,255,0.06)",
                      border: `1px solid ${q.done ? div.color : "rgba(255,255,255,0.1)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: "#000",
                    }}>{q.done ? "✓" : ""}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: q.done ? "#777" : "#ccc", fontSize: 13, textDecoration: q.done ? "line-through" : "none" }}>{q.quest}</div>
                    </div>
                    <div style={{ color: div.color, fontSize: 11, fontWeight: 600 }}>{q.reward}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Join Modal */}
        {joinModal && (
          <div style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
            padding: 20,
          }}>
            <div style={{
              background: "#0f0f1a", border: `1px solid ${div.color}40`,
              borderRadius: 20, padding: 40, maxWidth: 480, width: "100%",
            }}>
              <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
                {div.emoji} Join {div.name}
              </div>
              <div style={{ color: "#555", fontSize: 13, marginBottom: 24 }}>
                Your base plan covers one table size. Add other sizes for +$13/each.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {DIVISIONS.map(d => (
                  <label key={d.id} style={{
                    display: "flex", gap: 12, alignItems: "center",
                    background: d.id === div.id ? `${d.color}10` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${d.id === div.id ? d.color : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 10, padding: "12px 16px", cursor: "pointer",
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4,
                      background: d.id === div.id ? d.color : "rgba(255,255,255,0.05)",
                      border: `1px solid ${d.color}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: "#000",
                    }}>{d.id === div.id ? "✓" : ""}</div>
                    <span style={{ color: "#fff", fontSize: 13, flex: 1 }}>{d.emoji} {d.name}</span>
                    <span style={{ color: d.id === div.id ? d.color : "#444", fontSize: 12, fontWeight: 700 }}>
                      {d.id === div.id ? "Included" : `+$${d.addOnPrice}/mo`}
                    </span>
                  </label>
                ))}
              </div>
              <button style={{
                width: "100%", padding: "14px 0",
                background: `linear-gradient(90deg, ${div.color}, ${div.color}cc)`,
                border: "none", borderRadius: 10, color: "#000", fontWeight: 800, fontSize: 15, cursor: "pointer",
              }}>
                Continue to Membership →
              </button>
              <button onClick={() => setJoinModal(false)} style={{
                width: "100%", marginTop: 10, padding: "10px 0",
                background: "none", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, color: "#555", cursor: "pointer", fontSize: 13,
              }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Division Selection Landing ──
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #080810 0%, #0a0a14 100%)",
      fontFamily: "'Georgia', serif", padding: "60px 20px",
    }}>
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div style={{
          fontSize: 11, fontFamily: "monospace", letterSpacing: 6, textTransform: "uppercase",
          background: "linear-gradient(90deg,#22c55e,#f59e0b,#a855f7)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16,
        }}>Billiards Ladder — Choose Your Division</div>
        <h1 style={{ color: "#fff", fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, margin: "0 0 12px" }}>
          Pick Your Table. Own Your Lane.
        </h1>
        <p style={{ color: "#666", fontSize: 15, maxWidth: 520, margin: "0 auto" }}>
          Each division is its own private ladder. Your base membership covers one table size.
          Add the other two for <strong style={{ color: "#fff" }}>+$13/each per month</strong>.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
        {DIVISIONS.map(div => (
          <div
            key={div.id}
            onClick={() => setSelected(div.id)}
            style={{
              background: "rgba(255,255,255,0.025)", border: `1px solid ${div.color}30`,
              borderRadius: 20, padding: "36px 28px", cursor: "pointer",
              transition: "all 0.3s", borderTop: `4px solid ${div.color}`,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = `0 24px 60px ${div.glow}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ fontSize: 44, marginBottom: 14 }}>{div.emoji}</div>
            <h2 style={{ color: div.color, fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>{div.name}</h2>
            <div style={{ color: "#555", fontSize: 12, marginBottom: 10 }}>{div.subtitle} · {div.fargo}</div>
            <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, margin: "0 0 24px" }}>{div.tagline}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
              {div.tiers.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                  <span style={{ color: "#bbb", fontSize: 12 }}>{t.name}</span>
                  <span style={{ color: "#444", fontSize: 11 }}>({t.fargo})</span>
                </div>
              ))}
            </div>

            <div style={{
              background: `${div.color}10`, border: `1px solid ${div.color}25`,
              borderRadius: 10, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: "#666", fontSize: 12 }}>{div.games.length} game formats</span>
              <span style={{ color: div.color, fontSize: 13, fontWeight: 700 }}>Explore → </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 48, color: "#333", fontSize: 12 }}>
        All divisions include: ranked challenges · streak engine · rival tracking · 48h expiry timers · anti-ghosting deposits
      </div>
    </div>
  );
}
