import { useState } from "react";

// ── Stripe Payment Links (TEST MODE) ─────────────────────────────────────────
export const PAYMENT_LINKS = {
  rookie:   "https://buy.stripe.com/test_aFacN56p6b3A35FflP1Jm0a",
  standard: "https://buy.stripe.com/test_fZu9AT5l2efM5dN3D71Jm0b",
  premium:  "https://buy.stripe.com/test_bJe28rfZGdbIcGf5Lf1Jm0c",
  family:   "https://buy.stripe.com/test_bJe9AT8xe4FcfSrgpT1Jm0d",
};

// ── Price IDs — paste these into your backend checkout handler ────────────────
export const PRICE_IDS = {
  // Memberships
  rookie:        "price_1T50oRDc2BliYufwrfHeSzfg",  // $25.99/mo
  standard:      "price_1T50oUDc2BliYufwltyeKc3v",  // $35.99/mo
  premium:       "price_1T50oYDc2BliYufw6h8lK7x9",  // $59.99/mo
  family:        "price_1T50uBDc2BliYufwQ6hMnDSp",  // $45.00/mo
  // Flat commitment deposit (all matches)
  deposit_flat:  "price_1T50geDc2BliYufwadeCDY0p",  // $20 one-time
  // Stake deposits (backend must calculate exact amount & use payment_intent)
  deposit_10pct: "price_1T50u0Dc2BliYufwZyNxLfBc",  // 10% — stakes $301–$1,000
  deposit_7pct:  "price_1T50u2Dc2BliYufwL3u2vZGi",  // 7%  — stakes $1,001–$5,000
  deposit_5pct:  "price_1T50u5Dc2BliYufwBztjlQtg",  // 5%  — stakes $5,001+
};

/**
 * DEPOSIT CALCULATOR UTILITY
 * Use this on your backend when a match is scheduled.
 *
 * Returns: { depositAmount (cents), depositPercent, priceId, tier }
 *
 * Usage:
 *   const dep = calcStakeDeposit(50000); // $500 stake
 *   // => { depositAmount: 5000, depositPercent: 10, priceId: "price_...", tier: "10pct" }
 */
export function calcStakeDeposit(stakeAmountCents) {
  // Always charge flat $20 commitment deposit
  const flat = { depositAmount: 2000, depositPercent: null, priceId: PRICE_IDS.deposit_flat, tier: "flat" };
  if (stakeAmountCents <= 30000) return flat; // $300 or under → flat only

  if (stakeAmountCents <= 100000) {
    // $301–$1,000 → 10%
    const amt = Math.round(stakeAmountCents * 0.10);
    return { depositAmount: amt, depositPercent: 10, priceId: PRICE_IDS.deposit_10pct, tier: "10pct" };
  }
  if (stakeAmountCents <= 500000) {
    // $1,001–$5,000 → 7%
    const amt = Math.round(stakeAmountCents * 0.07);
    return { depositAmount: amt, depositPercent: 7, priceId: PRICE_IDS.deposit_7pct, tier: "7pct" };
  }
  // $5,001+ → 5%
  const amt = Math.round(stakeAmountCents * 0.05);
  return { depositAmount: amt, depositPercent: 5, priceId: PRICE_IDS.deposit_5pct, tier: "5pct" };
}

// ── Plan definitions ──────────────────────────────────────────────────────────
const plans = [
  {
    id: "rookie",
    name: "Rookie",
    icon: "👤",
    price: 25.99,
    color: "#22c55e",
    glow: "rgba(34,197,94,0.2)",
    tagline: "Perfect for new players entering competitive billiards",
    commission: "10%",
    badge: null,
    features: [
      { label: "10% commission rate on all challenges", highlight: true },
      { label: "Access to all ladder divisions (7ft / 8ft / 9ft)" },
      { label: "Ranked challenge match system" },
      { label: "Basic tournament entries" },
      { label: "Match history & stats tracking" },
      { label: "Win / loss streak display & bonuses" },
      { label: "Progress bar to next rank band" },
      { label: "48h challenge expiry with live countdown" },
      { label: "Pre-match rank swing preview (+ / − shown)" },
      { label: "Loss streak protection popup" },
      { label: "Anti-ghosting: $20 match commitment deposit" },
      { label: "Anti-farming rank caps enforced" },
      { label: "Daily & weekly quests (badges / credits)" },
      { label: "Open challenges & casual play" },
      { label: "Auto-rematch loop after every match" },
      { label: "Community tab access" },
    ],
  },
  {
    id: "standard",
    name: "Standard",
    icon: "⭐",
    price: 35.99,
    color: "#a855f7",
    glow: "rgba(168,85,247,0.25)",
    tagline: "For serious players who want every competitive edge",
    commission: "8%",
    badge: "Most Popular",
    features: [
      { label: "8% commission rate on all challenges", highlight: true },
      { label: "Everything in Rookie" },
      { label: "2 guaranteed ranked matches per week" },
      { label: "7-day pause bank — rank protected while paused" },
      { label: "Fast-track promotion on win streaks" },
      { label: "Premium tournament access & seeding priority" },
      { label: "Advanced analytics & performance insights" },
      { label: "Live stream priority placement" },
      { label: "Rival tracking & dedicated rematch button" },
      { label: "Side Bet community tab (spectator bets)" },
      { label: "Hot Matches carousel access" },
      { label: "Weekly season leaderboard eligibility" },
      { label: "Monthly bonus challenge credits" },
      { label: "AI coaching tips & drill recommendations" },
      { label: "On-time reputation badge" },
      { label: "Instant-accept incentive rewards" },
      { label: "Priority customer support" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    icon: "👑",
    price: 59.99,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.25)",
    tagline: "Elite tier for top competitors and content creators",
    commission: "5%",
    badge: "Elite",
    features: [
      { label: "5% commission rate on all challenges", highlight: true },
      { label: "Everything in Standard" },
      { label: "VIP tournament seeding (top bracket placement)" },
      { label: "Personal performance coaching sessions (logged)" },
      { label: "Ability to coach others & earn subscription credits" },
      { label: "Fan tip collection system on public profile" },
      { label: "Exclusive premium-only events & invitationals" },
      { label: "Revenue sharing on content creation" },
      { label: "AI-generated UFC-style standoff profile picture" },
      { label: "Calcutta tournament organizer access" },
      { label: "Multi-division simultaneous ladder entry" },
      { label: "White-glove support (dedicated rep)" },
      { label: "Loyalty discount: 10% off after 6 months" },
      { label: "Referral bonus: $10 credits per referral" },
      { label: "Verified stake mode for big-money matches" },
      { label: "Founder page visibility & featured profile" },
    ],
  },
  {
    id: "family",
    name: "Family",
    icon: "🏠",
    price: 45.00,
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.2)",
    tagline: "2 guardians + up to 2 kids. Upgrade kids anytime.",
    commission: "10%",
    badge: "Family Plan",
    features: [
      { label: "2 guardian accounts included", highlight: true },
      { label: "Up to 2 kid accounts included", highlight: true },
      { label: "Add more kids — upgrade available in-app" },
      { label: "Each guardian gets full Rookie-level access" },
      { label: "Guardians control all kid permissions" },
      { label: "Kids have zero access to adult cash challenges" },
      { label: "Kids Drill League: weekly leaderboard by age group" },
      { label: "Age groups: Under 10 / 11–13 / 14–17" },
      { label: "Monthly prizes: 1st–3rd big reward; all others get credits/badges" },
      { label: "Monthly season loop with leaderboard reset" },
      { label: "Kiddie Box King dedicated kids section" },
      { label: "Safe entry for kids: smaller rank swings first 3 matches" },
      { label: "Guardian dashboard: view all kid activity & stats" },
      { label: "Family pause bank: 7 days/month per account" },
      { label: "Kids earn badges & discount credits (no cash prizes)" },
    ],
    upgradeNote: "Need more kids or guardian Premium access? Upgrade individual accounts inside the app.",
  },
];

// ── Deposit tiers data for the info section ───────────────────────────────────
const depositTiers = [
  { range: "$0 – $300", rule: "Flat $20 deposit each player", pct: null, color: "#22c55e", example: "$20 deposit on a $150 match" },
  { range: "$301 – $1,000", rule: "10% of stake", pct: "10%", color: "#a855f7", example: "$50 deposit on a $500 match" },
  { range: "$1,001 – $5,000", rule: "7% of stake", pct: "7%", color: "#f59e0b", example: "$140 deposit on a $2,000 match" },
  { range: "$5,001+", rule: "5% of stake", pct: "5%", color: "#38bdf8", example: "$500 deposit on a $10,000 match" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [stakeInput, setStakeInput] = useState("");
  const [calcResult, setCalcResult] = useState(null);

  function handleCalc() {
    const dollars = parseFloat(stakeInput);
    if (!dollars || dollars < 60) { setCalcResult({ error: "Minimum stake is $60" }); return; }
    const cents = Math.round(dollars * 100);
    const dep = calcStakeDeposit(cents);
    setCalcResult({
      stake: dollars,
      depositDollars: (dep.depositAmount / 100).toFixed(2),
      pct: dep.depositPercent,
      tier: dep.tier,
    });
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #080810 0%, #0d0d1a 60%, #080d08 100%)",
      fontFamily: "'Georgia', serif",
      padding: "60px 20px 80px",
      position: "relative",
      overflowX: "hidden",
    }}>
      {/* subtle grid bg */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.025, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{
          display: "inline-block", fontSize: 11, fontFamily: "monospace",
          letterSpacing: 6, textTransform: "uppercase", marginBottom: 16,
          background: "linear-gradient(90deg, #22c55e, #a855f7, #f59e0b, #38bdf8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Billiards Ladder — Membership Plans
        </div>
        <h1 style={{
          color: "#fff", fontSize: "clamp(30px, 5vw, 50px)", fontWeight: 800,
          margin: "0 0 14px", textShadow: "0 0 60px rgba(168,85,247,0.25)",
        }}>
          Choose Your Level
        </h1>
        <p style={{ color: "#777", fontSize: 15, maxWidth: 540, margin: "0 auto 24px", lineHeight: 1.7 }}>
          Every plan includes ranked ladder access, full challenge system, and match tracking.
          Higher tiers unlock lower commission rates, guaranteed matches, and elite perks.
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: 8, padding: "10px 20px", color: "#22c55e", fontSize: 13,
        }}>
          ⚡ All plans include a <strong style={{ margin: "0 4px" }}>$20 match commitment deposit</strong> per scheduled match — refunded unless you no-show
        </div>
      </div>

      {/* ── Plan Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(268px, 1fr))",
        gap: 22, maxWidth: 1320, margin: "0 auto",
      }}>
        {plans.map((plan) => {
          const isHov = hoveredPlan === plan.id;
          const isExp = expandedPlan === plan.id;
          const shown = isExp ? plan.features : plan.features.slice(0, 8);

          return (
            <div
              key={plan.id}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{
                position: "relative",
                background: isHov ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.025)",
                border: `1px solid ${isHov ? plan.color : "rgba(255,255,255,0.07)"}`,
                borderRadius: 20, padding: "34px 26px 28px",
                transition: "all 0.3s ease",
                boxShadow: isHov ? `0 0 50px ${plan.glow}, 0 24px 60px rgba(0,0,0,0.5)` : "0 4px 24px rgba(0,0,0,0.35)",
                transform: isHov ? "translateY(-8px)" : "none",
                display: "flex", flexDirection: "column",
              }}
            >
              {plan.badge && (
                <div style={{
                  position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                  background: plan.id === "standard" ? "linear-gradient(90deg,#a855f7,#7c3aed)"
                    : plan.id === "premium" ? "linear-gradient(90deg,#f59e0b,#d97706)"
                    : plan.id === "family" ? "linear-gradient(90deg,#38bdf8,#0284c7)"
                    : "#22c55e",
                  color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: 2,
                  textTransform: "uppercase", padding: "5px 18px", borderRadius: 20,
                  whiteSpace: "nowrap",
                }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ fontSize: 38, marginBottom: 10 }}>{plan.icon}</div>
              <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>{plan.name}</h2>
              <p style={{ color: "#555", fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 }}>{plan.tagline}</p>

              <div style={{ marginBottom: 6 }}>
                <span style={{ color: plan.color, fontSize: 44, fontWeight: 800, lineHeight: 1 }}>
                  ${plan.price.toFixed(2)}
                </span>
                <span style={{ color: "#444", fontSize: 13 }}>/month</span>
              </div>

              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: plan.glow, border: `1px solid ${plan.color}35`,
                borderRadius: 6, padding: "5px 12px", marginBottom: 22,
                color: plan.color, fontSize: 12, fontWeight: 700,
              }}>
                💰 {plan.commission} commission rate
              </div>

              {/* Family upgrade note */}
              {plan.upgradeNote && (
                <div style={{
                  background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)",
                  borderRadius: 8, padding: "8px 12px", marginBottom: 16,
                  color: "#38bdf8", fontSize: 12, lineHeight: 1.5,
                }}>
                  🔼 {plan.upgradeNote}
                </div>
              )}

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {shown.map((f, i) => (
                  <li key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 9,
                    color: f.highlight ? plan.color : "#bbb",
                    fontSize: 13, lineHeight: 1.5, fontWeight: f.highlight ? 700 : 400,
                  }}>
                    <span style={{ color: plan.color, flexShrink: 0, marginTop: 2 }}>✓</span>
                    {f.label}
                  </li>
                ))}
              </ul>

              {plan.features.length > 8 && (
                <button
                  onClick={() => setExpandedPlan(isExp ? null : plan.id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: plan.color, fontSize: 12, padding: "2px 0 14px",
                    textAlign: "left", opacity: 0.75,
                  }}
                >
                  {isExp ? "▲ Show less" : `▼ See all ${plan.features.length} features`}
                </button>
              )}

              <a
                href={PAYMENT_LINKS[plan.id]}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block", padding: "13px 0",
                  background: isHov ? plan.color : "transparent",
                  border: `2px solid ${plan.color}`,
                  borderRadius: 10, color: isHov ? "#000" : plan.color,
                  fontSize: 14, fontWeight: 800, textAlign: "center",
                  textDecoration: "none", transition: "all 0.2s ease",
                  letterSpacing: 0.5,
                }}
              >
                Choose {plan.name}
              </a>
            </div>
          );
        })}
      </div>

      {/* ── Stake Deposit Rules ── */}
      <div style={{ maxWidth: 900, margin: "80px auto 0" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: "0 0 10px" }}>
            Match Stake Deposit Rules
          </h2>
          <p style={{ color: "#666", fontSize: 14, maxWidth: 560, margin: "0 auto" }}>
            To prevent no-shows and protect both players, deposits are collected at scheduling.
            All deposits are refunded after the match is confirmed — forfeited only on no-show.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 48 }}>
          {depositTiers.map((t) => (
            <div key={t.range} style={{
              background: "rgba(255,255,255,0.03)", border: `1px solid ${t.color}30`,
              borderRadius: 14, padding: "22px 20px",
              borderTop: `3px solid ${t.color}`,
            }}>
              <div style={{ color: t.color, fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                {t.pct ?? "$20"}
              </div>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{t.range}</div>
              <div style={{ color: "#777", fontSize: 12, marginBottom: 10 }}>{t.rule}</div>
              <div style={{
                background: `${t.color}12`, borderRadius: 6, padding: "6px 10px",
                color: t.color, fontSize: 11, fontStyle: "italic",
              }}>
                e.g. {t.example}
              </div>
            </div>
          ))}
        </div>

        {/* ── Deposit Calculator ── */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "32px 28px",
        }}>
          <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>
            💵 Deposit Calculator
          </h3>
          <p style={{ color: "#666", fontSize: 13, margin: "0 0 20px" }}>
            Enter a stake amount to see exactly what deposit each player owes at scheduling.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                color: "#555", fontSize: 18, fontWeight: 700,
              }}>$</span>
              <input
                type="number"
                placeholder="Enter stake amount"
                value={stakeInput}
                onChange={(e) => { setStakeInput(e.target.value); setCalcResult(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleCalc()}
                style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10, padding: "12px 16px 12px 32px",
                  color: "#fff", fontSize: 15, width: 220, outline: "none",
                  fontFamily: "monospace",
                }}
              />
            </div>
            <button
              onClick={handleCalc}
              style={{
                background: "linear-gradient(90deg,#a855f7,#7c3aed)",
                border: "none", borderRadius: 10, padding: "12px 28px",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              Calculate Deposit
            </button>
          </div>

          {calcResult && (
            <div style={{ marginTop: 20 }}>
              {calcResult.error ? (
                <div style={{ color: "#ef4444", fontSize: 13 }}>⚠️ {calcResult.error}</div>
              ) : (
                <div style={{
                  background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)",
                  borderRadius: 10, padding: "16px 20px", display: "inline-block",
                }}>
                  <div style={{ color: "#ccc", fontSize: 13, marginBottom: 6 }}>
                    Stake: <strong style={{ color: "#fff" }}>${calcResult.stake.toLocaleString()}</strong> per player
                  </div>
                  <div style={{ color: "#a855f7", fontSize: 22, fontWeight: 800 }}>
                    ${calcResult.depositDollars} deposit per player
                  </div>
                  <div style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
                    {calcResult.tier === "flat"
                      ? "Flat $20 commitment deposit (stake ≤ $300)"
                      : `${calcResult.pct}% of stake (${calcResult.tier === "10pct" ? "$301–$1,000" : calcResult.tier === "7pct" ? "$1,001–$5,000" : "$5,001+"} tier)`}
                    {" · "}Refunded after confirmed match result
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional deposit rules */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 14, marginTop: 20,
        }}>
          {[
            { icon: "🚫", title: "No-Show Rule", desc: "If one player no-shows, the player who showed up keeps the opponent's deposit automatically." },
            { icon: "⏰", title: "Late Penalty", desc: "30–60 min late = $10 penalty deducted. Both late = no penalty. Check-in window: 15 min before to 30 min after start." },
            { icon: "✅", title: "Stake Verification", desc: "Stakes over $300 require admin-verified stake mode OR the % deposit collected immediately at scheduling. No exceptions." },
            { icon: "🔒", title: "Deposits Stacked", desc: "For stakes over $300, the $20 flat deposit AND the % deposit are both collected and clearly shown before payment." },
          ].map((r) => (
            <div key={r.title} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "16px 18px",
            }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{r.icon}</div>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{r.title}</div>
              <div style={{ color: "#666", fontSize: 12, lineHeight: 1.6 }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Full Feature Comparison Table ── */}
      <div style={{ maxWidth: 960, margin: "80px auto 0" }}>
        <h2 style={{ color: "#fff", textAlign: "center", fontSize: 26, fontWeight: 800, marginBottom: 40 }}>
          Full Feature Comparison
        </h2>
        {[
          {
            category: "💰 Pricing",
            rows: [
              ["Monthly Price", "$25.99", "$35.99", "$59.99", "$45.00"],
              ["Commission Rate", "10%", "8%", "5%", "10%"],
              ["Stakes Range", "$60–$1M", "$60–$1M", "$60–$1M", "$60–$1M"],
              ["Match Deposit (≤$300)", "$20 flat", "$20 flat", "$20 flat", "$20 flat"],
              ["Stake Deposit ($301–1k)", "10%", "10%", "10%", "10%"],
              ["Stake Deposit ($1k–5k)", "7%", "7%", "7%", "7%"],
              ["Stake Deposit ($5k+)", "5%", "5%", "5%", "5%"],
            ],
          },
          {
            category: "🏆 Ladder & Challenges",
            rows: [
              ["All divisions (7ft/8ft/9ft)", "✓", "✓", "✓", "✓"],
              ["Ranked challenges", "✓", "✓", "✓", "✓"],
              ["Cross-tier challenges", "✓", "✓", "✓", "✓"],
              ["Guaranteed matches/week", "—", "2", "2", "—"],
              ["Pause bank (rank protected)", "—", "7 days", "7 days", "7 days"],
              ["Fast-track promotion", "—", "✓", "✓", "—"],
            ],
          },
          {
            category: "🎯 Safety & Rules",
            rows: [
              ["48h expiry + countdown", "✓", "✓", "✓", "✓"],
              ["Pre-match swing preview", "✓", "✓", "✓", "✓"],
              ["Loss streak popup", "✓", "✓", "✓", "✓"],
              ["Anti-ghosting deposits", "✓", "✓", "✓", "✓"],
              ["Anti-farming caps", "✓", "✓", "✓", "✓"],
            ],
          },
          {
            category: "📊 Analytics",
            rows: [
              ["Match history & stats", "✓", "✓", "✓", "✓"],
              ["Streak engine", "✓", "✓", "✓", "✓"],
              ["Progress bar to next band", "✓", "✓", "✓", "✓"],
              ["Rival tracking", "—", "✓", "✓", "—"],
              ["Advanced analytics", "—", "✓", "✓", "—"],
            ],
          },
          {
            category: "🎪 Tournaments",
            rows: [
              ["Basic tournament entries", "✓", "✓", "✓", "✓"],
              ["Premium tournament access", "—", "✓", "✓", "—"],
              ["VIP seeding", "—", "—", "✓", "—"],
              ["Calcutta organizer", "—", "—", "✓", "—"],
            ],
          },
          {
            category: "👨‍👩‍👧 Family",
            rows: [
              ["Guardian accounts", "1", "1", "1", "2"],
              ["Kid accounts included", "—", "—", "—", "Up to 2"],
              ["Kids Drill League", "—", "—", "—", "✓"],
              ["Monthly kids prizes", "—", "—", "—", "✓"],
              ["Guardian controls", "—", "—", "—", "✓"],
              ["Upgrade available", "—", "—", "—", "✓"],
            ],
          },
          {
            category: "⭐ Premium Perks",
            rows: [
              ["AI coaching tips", "—", "✓", "✓", "—"],
              ["Personal coaching sessions", "—", "—", "✓", "—"],
              ["Coach others for credits", "—", "—", "✓", "—"],
              ["Fan tip collection", "—", "—", "✓", "—"],
              ["Revenue sharing", "—", "—", "✓", "—"],
              ["AI standoff profile pic", "—", "—", "✓", "—"],
              ["Loyalty discount (6mo+)", "—", "—", "10% off", "—"],
              ["Referral bonus", "—", "—", "$10 credit", "—"],
            ],
          },
        ].map((section) => (
          <div key={section.category} style={{ marginBottom: 36 }}>
            <div style={{
              color: "#666", fontSize: 11, letterSpacing: 3,
              textTransform: "uppercase", marginBottom: 10, paddingLeft: 4,
              fontFamily: "monospace",
            }}>
              {section.category}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: "left", width: "38%" }}>Feature</th>
                  {[["Rookie","#22c55e"],["Standard","#a855f7"],["Premium","#f59e0b"],["Family","#38bdf8"]].map(([label, col]) => (
                    <th key={label} style={{ ...th, color: col }}>{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map(([feat, ...vals], ri) => (
                  <tr key={ri} style={{ background: ri % 2 === 0 ? "rgba(255,255,255,0.018)" : "transparent" }}>
                    <td style={{ ...td, color: "#bbb", textAlign: "left" }}>{feat}</td>
                    {vals.map((v, vi) => {
                      const cols = ["#22c55e","#a855f7","#f59e0b","#38bdf8"];
                      return (
                        <td key={vi} style={{
                          ...td,
                          color: v === "✓" ? cols[vi] : v === "—" ? "#2a2a2a" : "#e5e5e5",
                          fontWeight: v !== "—" && v !== "✓" ? 600 : 400,
                          fontSize: v === "✓" || v === "—" ? 16 : 12,
                        }}>
                          {v}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* ── Footer note ── */}
      <div style={{ maxWidth: 680, margin: "60px auto 0", textAlign: "center" }}>
        <p style={{ color: "#444", fontSize: 12, lineHeight: 1.9 }}>
          All plans billed monthly. Cancel anytime. Deposits refunded after confirmed results.
          Late arrival (30–60 min) incurs a $10 penalty. Operator overrides are logged.
          Stakes over $300 require verification or % deposit — no exceptions.
        </p>
        <p style={{ color: "#2a2a2a", fontSize: 11, marginTop: 8 }}>
          ⚠️ Test mode active — no real charges
        </p>
      </div>
    </div>
  );
}

const th = {
  padding: "9px 12px", color: "#444", fontSize: 11, fontWeight: 700,
  textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.05)",
  fontFamily: "monospace", letterSpacing: 1,
};
const td = {
  padding: "8px 12px", textAlign: "center",
  borderBottom: "1px solid rgba(255,255,255,0.035)",
};
