import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const founderLoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
  twoFactorCode: z.string().optional(),
});
type FounderLoginData = z.infer<typeof founderLoginSchema>;

export default function FounderLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const { toast } = useToast();

  // Reveal animation
  useEffect(() => {
    const t = setTimeout(() => setUnlocked(true), 200);
    return () => clearTimeout(t);
  }, []);

  const form = useForm<FounderLoginData>({
    resolver: zodResolver(founderLoginSchema),
    defaultValues: { email: "", password: "", twoFactorCode: "" },
  });

  const loginMutation = useMutation({
    mutationFn: (data: FounderLoginData) =>
      apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: (response: any) => {
      if (response.requires2FA) {
        setRequires2FA(true);
        toast({ title: "2FA Required", description: "Enter your authenticator code." });
      } else {
        const user = response.user;
        if (user?.globalRole !== "OWNER") {
          toast({ title: "Access Denied", description: "Founder credentials only.", variant: "destructive" });
          return;
        }
        toast({ title: "Welcome, Founder.", description: "Initializing control panel..." });
        setTimeout(() => { window.location.href = "/founder-dashboard"; }, 800);
      }
    },
    onError: (error: any) => {
      toast({ title: "Authentication Failed", description: error.message || "Invalid credentials", variant: "destructive" });
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 0%, #1a0f00 0%, #0a0600 60%, #000 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Georgia', serif",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Decorative background lines */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
      }}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            top: `${i * 9}%`,
            left: "-100%",
            right: "-100%",
            height: "1px",
            background: `linear-gradient(90deg, transparent, rgba(212,170,0,${0.03 + i * 0.005}), transparent)`,
            transform: `rotate(${-15 + i * 0.5}deg)`,
          }} />
        ))}
        {/* Corner crests */}
        {[
          { top: 20, left: 20 }, { top: 20, right: 20 },
          { bottom: 20, left: 20 }, { bottom: 20, right: 20 }
        ].map((pos, i) => (
          <div key={i} style={{
            position: "absolute", ...pos, width: 60, height: 60,
            border: "1px solid rgba(212,170,0,0.2)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: 40, height: 40, border: "1px solid rgba(212,170,0,0.15)",
              borderRadius: "50%",
            }} />
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        background: "linear-gradient(160deg, rgba(30,18,0,0.95) 0%, rgba(12,8,0,0.98) 100%)",
        border: "1px solid rgba(212,170,0,0.3)",
        borderRadius: 2,
        padding: "48px 40px",
        boxShadow: "0 0 80px rgba(212,170,0,0.08), 0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(212,170,0,0.2)",
        opacity: unlocked ? 1 : 0,
        transform: unlocked ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
      }}>

        {/* Top ornament */}
        <div style={{ textAlign: "center", marginBottom: 36, position: "relative" }}>
          <div style={{
            display: "inline-block",
            width: 56, height: 56,
            background: "linear-gradient(135deg, rgba(212,170,0,0.15), rgba(212,170,0,0.05))",
            border: "1px solid rgba(212,170,0,0.4)",
            borderRadius: "50%",
            marginBottom: 20,
            position: "relative",
          }}>
            {/* Crown SVG */}
            <svg viewBox="0 0 24 24" style={{ width: 28, height: 28, position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} fill="none" stroke="#d4aa00" strokeWidth="1.5">
              <path d="M2 20h20M5 20V10l7-6 7 6v10" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="1" fill="#d4aa00"/>
              <circle cx="5" cy="10" r="1" fill="#d4aa00"/>
              <circle cx="19" cy="10" r="1" fill="#d4aa00"/>
            </svg>
          </div>

          {/* Divider lines */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(212,170,0,0.4))" }} />
            <span style={{ color: "rgba(212,170,0,0.5)", fontSize: 10, letterSpacing: 4, textTransform: "uppercase" }}>Founder Access</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(212,170,0,0.4), transparent)" }} />
          </div>

          <h1 style={{
            color: "#d4aa00",
            fontSize: 22,
            fontWeight: "normal",
            letterSpacing: 2,
            margin: 0,
            textTransform: "uppercase",
          }}>Billiards Ladder</h1>
          <p style={{ color: "rgba(180,140,0,0.6)", fontSize: 11, letterSpacing: 3, marginTop: 6, textTransform: "uppercase" }}>
            Founder Control Panel
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit((d) => loginMutation.mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Email */}
          <div>
            <label style={{ display: "block", color: "rgba(212,170,0,0.7)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <svg viewBox="0 0 24 24" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 14, height: 14 }} fill="none" stroke="rgba(212,170,0,0.5)" strokeWidth="1.5">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
                <path d="M22 6l-10 7L2 6"/>
              </svg>
              <input
                {...register("email")}
                type="email"
                placeholder="founder@billiardsladder.com"
                style={{
                  width: "100%", padding: "12px 14px 12px 38px",
                  background: "rgba(212,170,0,0.04)",
                  border: "1px solid rgba(212,170,0,0.2)",
                  borderRadius: 2,
                  color: "#fff",
                  fontSize: 14,
                  letterSpacing: 0.5,
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(212,170,0,0.6)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(212,170,0,0.2)"}
              />
            </div>
            {errors.email && <p style={{ color: "#ff6b6b", fontSize: 11, marginTop: 4 }}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", color: "rgba(212,170,0,0.7)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <svg viewBox="0 0 24 24" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 14, height: 14 }} fill="none" stroke="rgba(212,170,0,0.5)" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                style={{
                  width: "100%", padding: "12px 44px 12px 38px",
                  background: "rgba(212,170,0,0.04)",
                  border: "1px solid rgba(212,170,0,0.2)",
                  borderRadius: 2,
                  color: "#fff",
                  fontSize: 14,
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(212,170,0,0.6)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(212,170,0,0.2)"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(212,170,0,0.4)",
                }}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {errors.password && <p style={{ color: "#ff6b6b", fontSize: 11, marginTop: 4 }}>{errors.password.message}</p>}
          </div>

          {/* 2FA */}
          {requires2FA && (
            <div>
              <label style={{ display: "block", color: "rgba(212,170,0,0.7)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                Authenticator Code
              </label>
              <input
                {...register("twoFactorCode")}
                placeholder="000000"
                maxLength={6}
                style={{
                  width: "100%", padding: "12px 14px",
                  background: "rgba(212,170,0,0.04)",
                  border: "1px solid rgba(212,170,0,0.4)",
                  borderRadius: 2,
                  color: "#d4aa00",
                  fontSize: 20,
                  letterSpacing: 8,
                  textAlign: "center",
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: "monospace",
                }}
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: 8,
              background: loginMutation.isPending
                ? "rgba(212,170,0,0.1)"
                : "linear-gradient(135deg, #b8920a 0%, #d4aa00 50%, #b8920a 100%)",
              border: "1px solid rgba(212,170,0,0.5)",
              borderRadius: 2,
              color: loginMutation.isPending ? "rgba(212,170,0,0.4)" : "#000",
              fontSize: 12,
              fontWeight: "bold",
              letterSpacing: 3,
              textTransform: "uppercase",
              cursor: loginMutation.isPending ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
          >
            {loginMutation.isPending ? "Authenticating..." : "Enter Control Panel"}
          </button>
        </form>

        {/* Footer notice */}
        <div style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: "1px solid rgba(212,170,0,0.1)",
          textAlign: "center",
        }}>
          <p style={{ color: "rgba(212,170,0,0.3)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", lineHeight: 1.8 }}>
            Restricted access · Founders only<br />
            All sessions are logged and monitored
          </p>
          <div style={{ marginTop: 16 }}>
            <a href="/login" style={{ color: "rgba(212,170,0,0.35)", fontSize: 11, textDecoration: "none", letterSpacing: 1 }}>
              ← Back to general login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
