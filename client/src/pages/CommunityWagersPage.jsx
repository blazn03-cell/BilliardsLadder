import { useState } from "react";

// Legally safe naming: "Wagers" / "Side Action" / "Predictions" / "Pledges"
// NOT "bets" or "gambling"

const WAGER_TYPES = [
  "Match Winner", "Total Games Played", "First to 3 Wins",
  "Winning Margin", "Longest Run", "Custom Prediction"
];

const MOCK_ACTIVE = [
  {
    id: 1, title: "Who takes the 9ft title match?",
    type: "Match Winner", wager: 50, locked: false,
    lockTime: "Tonight 7:00 PM", joinType: "open",
    participants: 4, totalPool: 200,
    status: "Open", match: "Rodriguez vs Kimura — 9ft Elite",
    creator: "PoolShark99", expiresIn: "4h 22m",
  },
  {
    id: 2, title: "Kimura breaks 5+ in opening rack",
    type: "Custom Prediction", wager: 25, locked: true,
    lockTime: "Locked", joinType: "invite-only",
    participants: 6, totalPool: 150,
    status: "Locked", match: "Rodriguez vs Kimura — 9ft Elite",
    creator: "BankShotKing", expiresIn: null,
  },
  {
    id: 3, title: "8ft contender match goes 5+ games",
    type: "Total Games Played", wager: 30, locked: false,
    lockTime: "Match Start", joinType: "open",
    participants: 2, totalPool: 60,
    status: "Open", match: "Davis vs Nguyen — 8ft Contenders",
    creator: "TableTime", expiresIn: "11h 05m",
  },
];

const STATUS_COLORS = { Open: "#22c55e", Locked: "#f59e0b", Resolved: "#a855f7", Closed: "#555" };

export default function CommunityWagersPage() {
  const [tab, setTab] = useState("active");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "", type: WAGER_TYPES[0], matchLink: "",
    wagerAmount: "", rules: "", lockTime: "match_start", joinType: "open",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!form.title || !form.wagerAmount) return;
    setSubmitted(true);
    setTimeout(() => { setCreating(false); setSubmitted(false); setForm({ ...form, title: "", wagerAmount: "", rules: "" }); }, 2000);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #08080f 0%, #0f0a00 100%)",
      fontFamily: "'Georgia', serif", padding: "40px 20px 80px",
    }}>
      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#f59e0b", fontFamily: "monospace", marginBottom: 8 }}>
            Community → Side Action
          </div>
          <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, margin: "0 0 8px" }}>
            🎯 Side Action
          </h1>
          <p style={{ color: "#666", fontSize: 14, maxWidth: 540, lineHeight: 1.7, margin: 0 }}>
            Spectators pledge against each other on match outcomes. Separate from ladder rankings —
            this is purely between community members watching. Lock in before match starts.
          </p>
        </div>

        {/* Legal disclaimer */}
        <div style={{
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 10, padding: "10px 16px", marginBottom: 28,
          color: "#f59e0b", fontSize: 12, lineHeight: 1.6,
        }}>
          ⚠️ Side Action is a community pledge system between consenting adult spectators.
          Funds are held in escrow and released upon result confirmation. All activity logged by operator.
          Participation is voluntary and governed by your local jurisdiction.
        </div>

        {/* Tabs + Create button */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
          {["active", "my-pledges", "resolved"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? "#f59e0b" : "rgba(255,255,255,0.04)",
              border: `1px solid ${tab === t ? "#f59e0b" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 8, padding: "9px 18px", color: tab === t ? "#000" : "#666",
              cursor: "pointer", fontSize: 12, fontWeight: tab === t ? 800 : 400,
              textTransform: "capitalize",
            }}>
              {t === "active" ? "Active Side Action" : t === "my-pledges" ? "My Pledges" : "Resolved"}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setCreating(true)}
            style={{
              background: "linear-gradient(90deg,#f59e0b,#d97706)",
              border: "none", borderRadius: 10, padding: "10px 22px",
              color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer",
            }}
          >
            + Create Side Action
          </button>
        </div>

        {/* Active wagers list */}
        {tab === "active" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {MOCK_ACTIVE.map(w => (
              <div key={w.id} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: 24,
                borderLeft: `4px solid ${STATUS_COLORS[w.status]}`,
              }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{
                        background: `${STATUS_COLORS[w.status]}20`, color: STATUS_COLORS[w.status],
                        fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase",
                        padding: "3px 10px", borderRadius: 5,
                      }}>{w.status}</span>
                      <span style={{ background: "rgba(255,255,255,0.04)", color: "#555", fontSize: 10, padding: "3px 8px", borderRadius: 5 }}>{w.type}</span>
                      <span style={{ background: "rgba(255,255,255,0.04)", color: "#555", fontSize: 10, padding: "3px 8px", borderRadius: 5 }}>
                        {w.joinType === "open" ? "🌐 Open" : "🔒 Invite only"}
                      </span>
                    </div>
                    <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{w.title}</div>
                    <div style={{ color: "#555", fontSize: 12, marginBottom: 10 }}>
                      📺 {w.match} · by {w.creator}
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ color: "#f59e0b", fontSize: 18, fontWeight: 800 }}>${w.totalPool}</div>
                        <div style={{ color: "#444", fontSize: 10 }}>total pool</div>
                      </div>
                      <div>
                        <div style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>{w.participants}</div>
                        <div style={{ color: "#444", fontSize: 10 }}>participants</div>
                      </div>
                      <div>
                        <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>${w.wager}</div>
                        <div style={{ color: "#444", fontSize: 10 }}>pledge each</div>
                      </div>
                      {w.expiresIn && (
                        <div>
                          <div style={{ color: "#ef4444", fontSize: 14, fontWeight: 700 }}>⏱ {w.expiresIn}</div>
                          <div style={{ color: "#444", fontSize: 10 }}>to lock in</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 120 }}>
                    {w.status === "Open" && (
                      <>
                        <button style={{
                          background: "#f59e0b", border: "none", borderRadius: 8,
                          padding: "10px 16px", color: "#000", fontWeight: 800, fontSize: 13, cursor: "pointer",
                        }}>Join · ${w.wager}</button>
                        <button style={{
                          background: "none", border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8, padding: "8px 16px", color: "#666", fontSize: 12, cursor: "pointer",
                        }}>Watch</button>
                      </>
                    )}
                    {w.status === "Locked" && (
                      <div style={{
                        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                        borderRadius: 8, padding: "10px 14px", color: "#f59e0b", fontSize: 12, textAlign: "center",
                      }}>🔒 Locked — in play</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "my-pledges" && (
          <div style={{ color: "#555", textAlign: "center", padding: 60, fontSize: 14 }}>
            No active pledges yet. Join a side action above or create your own.
          </div>
        )}

        {tab === "resolved" && (
          <div style={{ color: "#555", textAlign: "center", padding: 60, fontSize: 14 }}>
            No resolved side actions yet.
          </div>
        )}
      </div>

      {/* Create Modal */}
      {creating && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 999, padding: 20,
        }}>
          <div style={{
            background: "#0f0f1a", border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 20, padding: 36, maxWidth: 520, width: "100%",
            maxHeight: "90vh", overflowY: "auto",
          }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <div style={{ color: "#22c55e", fontSize: 18, fontWeight: 800 }}>Side Action Created!</div>
                <div style={{ color: "#555", fontSize: 13, marginTop: 8 }}>Others can join before the lock time.</div>
              </div>
            ) : (
              <>
                <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Create Side Action</div>
                <div style={{ color: "#555", fontSize: 13, marginBottom: 24 }}>Fill in under 60 seconds. Locks at match start by default.</div>

                {[
                  { label: "Prediction Title *", key: "title", placeholder: "e.g. Rodriguez wins in under 5 games" },
                  { label: "Match / Event Link", key: "matchLink", placeholder: "Paste match URL (optional)" },
                  { label: "Pledge Amount ($) *", key: "wagerAmount", placeholder: "e.g. 25", type: "number" },
                  { label: "Rules / Notes", key: "rules", placeholder: "Any additional rules or clarifications..." },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom: 16 }}>
                    <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 6 }}>{field.label}</label>
                    {field.key === "rules" ? (
                      <textarea
                        value={form[field.key]}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        rows={3}
                        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "Georgia, serif" }}
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        value={form[field.key]}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        placeholder={field.placeholder}
                        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                      />
                    )}
                  </div>
                ))}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 6 }}>Prediction Type</label>
                    <select
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                      style={{ width: "100%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none" }}
                    >
                      {WAGER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 6 }}>Lock Time</label>
                    <select
                      value={form.lockTime}
                      onChange={e => setForm({ ...form, lockTime: e.target.value })}
                      style={{ width: "100%", background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none" }}
                    >
                      <option value="match_start">Match Start (default)</option>
                      <option value="1h_before">1 Hour Before</option>
                      <option value="30m_before">30 Min Before</option>
                      <option value="custom">Custom Time</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ color: "#888", fontSize: 12, display: "block", marginBottom: 8 }}>Who Can Join?</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["open", "invite-only"].map(jt => (
                      <button key={jt} onClick={() => setForm({ ...form, joinType: jt })} style={{
                        flex: 1, padding: "10px 0",
                        background: form.joinType === jt ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${form.joinType === jt ? "#f59e0b" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 8, color: form.joinType === jt ? "#f59e0b" : "#555",
                        cursor: "pointer", fontSize: 12, fontWeight: 700,
                        textTransform: "capitalize",
                      }}>
                        {jt === "open" ? "🌐 Open" : "🔒 Invite Only"}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  style={{
                    width: "100%", padding: "14px 0",
                    background: form.title && form.wagerAmount ? "linear-gradient(90deg,#f59e0b,#d97706)" : "rgba(255,255,255,0.05)",
                    border: "none", borderRadius: 10,
                    color: form.title && form.wagerAmount ? "#000" : "#333",
                    fontWeight: 800, fontSize: 15, cursor: form.title && form.wagerAmount ? "pointer" : "not-allowed",
                    marginBottom: 10,
                  }}
                >
                  Create Side Action
                </button>
                <button onClick={() => setCreating(false)} style={{
                  width: "100%", padding: "10px 0", background: "none",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10,
                  color: "#555", cursor: "pointer", fontSize: 13,
                }}>Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
