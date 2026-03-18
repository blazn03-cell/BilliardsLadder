/**
 * ProfileSettings.tsx — Player profile settings
 *
 * Nickname: optional alias shown on leaderboards instead of real name.
 *   - Max 30 characters
 *   - Shown publicly on all ladders, standings, and match history
 *   - Real name still used internally / for admin
 *
 * Email privacy: toggle whether other players can see your email.
 *   - Default: hidden (true) — email is never shown to other players
 *   - You always see your own email
 *
 * Also: city, theme colour preference, birthday (for birthday bonuses)
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  User, Mail, EyeOff, Eye, Tag, MapPin, Palette,
  Cake, CheckCircle2, AlertCircle, Save, Lock, Unlock,
  Shield, Info,
} from "lucide-react";

// ─── Colour palette ───────────────────────────────────────────────────────────
const C = {
  bg:     "#07090c",
  card:   "#0d1117",
  border: "#1a2332",
  accent: "#22c55e",
  accentD:"#16a34a",
  text:   "#e2eaf2",
  sub:    "#4b6280",
  warn:   "#f59e0b",
  err:    "#ef4444",
  ok:     "#22c55e",
};

const THEMES = [
  { id: "green",  label: "Felt Green",   color: "#16a34a" },
  { id: "blue",   label: "Pool Blue",    color: "#1d4ed8" },
  { id: "red",    label: "Hustle Red",   color: "#dc2626" },
  { id: "gold",   label: "Trophy Gold",  color: "#d97706" },
  { id: "purple", label: "Chalk Purple", color: "#7c3aed" },
  { id: "white",  label: "Cue White",    color: "#cbd5e1" },
];

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ icon: Icon, label, hint, children }: {
  icon: React.ElementType; label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon size={13} color={C.accent} />
        <label style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{label}</label>
      </div>
      {hint && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 5, color: C.sub, fontSize: 11 }}>
          <Info size={11} style={{ flexShrink: 0, marginTop: 1 }} />
          {hint}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ value, onChange, labelOn, labelOff, iconOn: IconOn, iconOff: IconOff, color = C.accent }: {
  value: boolean; onChange: (v: boolean) => void;
  labelOn: string; labelOff: string;
  iconOn: React.ElementType; iconOff: React.ElementType;
  color?: string;
}) {
  return (
    <button onClick={() => onChange(!value)} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px", borderRadius: 8, cursor: "pointer", width: "100%",
      background: value ? `rgba(${color === C.accent ? "34,197,94" : "239,68,68"},0.1)` : "rgba(255,255,255,0.03)",
      border: `1px solid ${value ? color + "44" : C.border}`,
      transition: "all 0.2s", textAlign: "left",
    }}>
      <div style={{
        width: 38, height: 22, borderRadius: 11, position: "relative",
        background: value ? color : "rgba(255,255,255,0.1)",
        transition: "background 0.2s", flexShrink: 0,
        boxShadow: value ? `0 0 10px ${color}44` : "none",
      }}>
        <div style={{
          position: "absolute", top: 3, left: value ? 19 : 3,
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        }} />
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {value ? <IconOn size={13} color={color} /> : <IconOff size={13} color={C.sub} />}
          <span style={{ color: value ? color : C.sub, fontWeight: 700, fontSize: 13 }}>
            {value ? labelOn : labelOff}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Save status ──────────────────────────────────────────────────────────────
function SaveStatus({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  const cfg = {
    saving: { icon: null,           color: C.warn, text: "Saving…" },
    saved:  { icon: CheckCircle2,   color: C.ok,   text: "Saved!"  },
    error:  { icon: AlertCircle,    color: C.err,  text: "Error saving. Try again." },
  }[state];
  const Icon = (cfg as any).icon;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "8px 14px", borderRadius: 7,
      background: `rgba(${state === "saved" ? "34,197,94" : state === "error" ? "239,68,68" : "245,158,11"},0.1)`,
      border: `1px solid ${(cfg as any).color}33`,
      color: (cfg as any).color, fontSize: 12, fontWeight: 600,
    }}>
      {Icon && <Icon size={13} />}
      {(cfg as any).text}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProfileSettings() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Fetch current profile
  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["/api/profile"],
    queryFn: () => fetch("/api/profile").then(r => r.json()),
  });

  // Local form state
  const [nickname, setNickname]       = useState("");
  const [emailHidden, setEmailHidden] = useState(true);
  const [city, setCity]               = useState("");
  const [birthday, setBirthday]       = useState("");
  const [theme, setTheme]             = useState("green");

  // Populate from server once loaded
  useEffect(() => {
    if (!profile) return;
    setNickname(profile.nickname ?? "");
    setEmailHidden(profile.emailHidden ?? true);
    setCity(profile.city ?? "");
    setBirthday(profile.birthday ?? "");
    setTheme(profile.theme ?? "green");
  }, [profile]);

  const saveMut = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", "/api/profile", data),
    onMutate:  () => setSaveState("saving"),
    onSuccess: () => {
      setSaveState("saved");
      qc.invalidateQueries({ queryKey: ["/api/profile"] });
      setTimeout(() => setSaveState("idle"), 2500);
      toast({ title: "Profile updated", description: nickname ? `Showing as "${nickname}" on leaderboards` : "Changes saved" });
    },
    onError: () => {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    },
  });

  const handleSave = () => {
    saveMut.mutate({
      nickname:    nickname.trim() || null,
      emailHidden,
      city:        city.trim() || null,
      birthday:    birthday || null,
      theme,
    });
  };

  const nicknamePreview = nickname.trim() || profile?.name || "Your Name";
  const hasNickname     = !!nickname.trim();

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: C.sub, fontSize: 14 }}>Loading profile…</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "sans-serif", padding: "32px 20px",
    }}>
      <style>{`
        @keyframes ps-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}
        input:focus{outline:none;border-color:#16a34a !important;box-shadow:0 0 0 2px rgba(22,163,74,0.15);}
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28, animation: "ps-in 0.3s ease" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10,
            padding: "3px 12px", borderRadius: 16,
            background: "rgba(34,197,94,0.1)", border: `1px solid ${C.accentD}44`,
            color: C.accent, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
          }}>
            <User size={10} /> Profile Settings
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>
            Your Identity
          </h1>
          <p style={{ color: C.sub, fontSize: 14, marginTop: 4 }}>
            Control what other players see — nickname, email visibility, and more.
          </p>
        </div>

        <div style={{ display: "grid", gap: 16 }}>

          {/* ── Nickname card ───────────────────────────────────────────── */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "20px", animation: "ps-in 0.35s 0.05s ease both",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7, marginBottom: 16,
              paddingBottom: 12, borderBottom: `1px solid ${C.border}`,
            }}>
              <Tag size={15} color={C.accent} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Nickname</span>
              {hasNickname && (
                <span style={{
                  background: "rgba(34,197,94,0.12)", color: C.accent,
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, marginLeft: "auto",
                }}>
                  Active
                </span>
              )}
            </div>

            <Field
              icon={Tag}
              label="Display name (shown on leaderboards)"
              hint="Leave blank to use your real name. Max 30 characters. Other players see this — not your account name."
            >
              <div style={{ position: "relative" }}>
                <input
                  value={nickname}
                  onChange={e => setNickname(e.target.value.slice(0, 30))}
                  placeholder="e.g. CueKing, The Shark, Eight-Ball Eddie…"
                  maxLength={30}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "10px 14px", borderRadius: 7,
                    background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                    color: C.text, fontSize: 14, transition: "border-color 0.2s",
                  }}
                />
                <span style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  color: C.sub, fontSize: 11,
                }}>
                  {nickname.length}/30
                </span>
              </div>
            </Field>

            {/* Live preview */}
            <div style={{
              marginTop: 12, padding: "10px 14px", borderRadius: 7,
              background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)",
            }}>
              <div style={{ color: C.sub, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>
                PREVIEW — how you appear on the ladder
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg,#16a34a,#065f46)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: "#f0fdf4",
                }}>
                  {nicknamePreview.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: "#f0fdf4", fontWeight: 700, fontSize: 15 }}>{nicknamePreview}</div>
                  {hasNickname && (
                    <div style={{ color: C.sub, fontSize: 10 }}>
                      Real name: {profile?.name ?? "—"} (only you and admins see this)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Email privacy card ───────────────────────────────────────── */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "20px", animation: "ps-in 0.35s 0.1s ease both",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7, marginBottom: 16,
              paddingBottom: 12, borderBottom: `1px solid ${C.border}`,
            }}>
              <Shield size={15} color={C.accent} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Email Privacy</span>
            </div>

            <Field
              icon={Mail}
              label="Email visibility"
              hint="Your email is used for login and notifications. This only controls whether other players can see it on your public profile."
            >
              <Toggle
                value={emailHidden}
                onChange={setEmailHidden}
                labelOn="Email hidden from other players"
                labelOff="Email visible to other players"
                iconOn={EyeOff}
                iconOff={Eye}
                color={emailHidden ? C.ok : C.warn}
              />
            </Field>

            {/* Always visible to you */}
            <div style={{
              marginTop: 12, padding: "10px 14px", borderRadius: 7,
              background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
              display: "flex", gap: 8, alignItems: "center",
            }}>
              <Lock size={12} color={C.sub} />
              <div>
                <div style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>
                  Your email: {profile?.email ?? "—"}
                </div>
                <div style={{ color: C.sub, fontSize: 10, marginTop: 2 }}>
                  Always visible to you. {emailHidden ? "Hidden from other players." : "Currently visible to other players."}
                </div>
              </div>
            </div>
          </div>

          {/* ── Additional profile fields ────────────────────────────────── */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: "20px", animation: "ps-in 0.35s 0.15s ease both",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7, marginBottom: 16,
              paddingBottom: 12, borderBottom: `1px solid ${C.border}`,
            }}>
              <User size={15} color={C.accent} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Public Profile</span>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <Field icon={MapPin} label="City" hint="Shown on the leaderboard next to your name (optional)">
                <input
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Las Vegas, Chicago…"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "10px 14px", borderRadius: 7,
                    background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                    color: C.text, fontSize: 14, transition: "border-color 0.2s",
                  }}
                />
              </Field>

              <Field icon={Cake} label="Birthday (MM-DD)" hint="Unlocks birthday-month bonuses — one free tournament entry. Year is never stored or shown.">
                <input
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                  placeholder="e.g. 03-15"
                  maxLength={5}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "10px 14px", borderRadius: 7,
                    background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                    color: C.text, fontSize: 14, transition: "border-color 0.2s",
                  }}
                />
              </Field>

              <Field icon={Palette} label="Profile theme colour" hint="Accent colour used on your profile card and match cards.">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => setTheme(t.id)} title={t.label} style={{
                      width: 36, height: 36, borderRadius: 8, cursor: "pointer",
                      background: t.color, border: `2px solid ${theme === t.id ? "#fff" : "transparent"}`,
                      boxShadow: theme === t.id ? `0 0 12px ${t.color}88` : "none",
                      transition: "all 0.15s", flexShrink: 0,
                    }} />
                  ))}
                </div>
                <div style={{ color: C.sub, fontSize: 11, marginTop: 4 }}>
                  Selected: {THEMES.find(t => t.id === theme)?.label}
                </div>
              </Field>
            </div>
          </div>

          {/* ── Privacy summary ──────────────────────────────────────────── */}
          <div style={{
            background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.15)",
            borderRadius: 10, padding: "14px 16px",
            animation: "ps-in 0.35s 0.2s ease both",
          }}>
            <div style={{ color: C.accent, fontWeight: 700, fontSize: 12, marginBottom: 8, display: "flex", gap: 5, alignItems: "center" }}>
              <Shield size={12} /> What other players see
            </div>
            <div style={{ display: "grid", gap: 5 }}>
              {[
                { label: "Display name", value: hasNickname ? `"${nickname.trim()}"` : profile?.name ?? "—", show: true },
                { label: "City",         value: city.trim() || "Hidden",        show: !!city.trim() },
                { label: "Email",        value: emailHidden ? "🔒 Hidden"        : profile?.email,      show: !emailHidden },
                { label: "Win rate",     value: "Always visible",                show: true },
                { label: "Real name",    value: "Only you + admins",             show: true },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: C.sub }}>{r.label}</span>
                  <span style={{ color: r.show ? C.text : C.sub, fontWeight: r.show ? 600 : 400 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Save button ──────────────────────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, animation: "ps-in 0.35s 0.25s ease both" }}>
            <button onClick={handleSave} disabled={saveMut.isPending} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "12px 28px", borderRadius: 8, cursor: saveMut.isPending ? "not-allowed" : "pointer",
              background: saveMut.isPending ? "rgba(34,197,94,0.1)" : "linear-gradient(135deg,#16a34a,#15803d)",
              border: "none", color: "#f0fdf4", fontWeight: 700, fontSize: 14,
              boxShadow: saveMut.isPending ? "none" : "0 0 20px rgba(34,197,94,0.2)",
              transition: "all 0.15s", opacity: saveMut.isPending ? 0.7 : 1,
            }}>
              <Save size={14} />
              {saveMut.isPending ? "Saving…" : "Save Changes"}
            </button>
            <SaveStatus state={saveState} />
          </div>
        </div>
      </div>
    </div>
  );
}
