import { Request, Response } from "express";
import { storage } from "../storage";
import {
  hashPassword,
  verifyPassword,
  checkAccountLockout,
  incrementLoginAttempts,
  resetLoginAttempts,
  createUserSession,
  generateTwoFactorSecret,
  verifyTwoFactor,
} from "../middleware/auth";
import {
  createOwnerSchema,
  createOperatorSchema,
  createPlayerSchema,
  loginSchema,
} from "@shared/schema";

// ── helpers ───────────────────────────────────────────────────────────────────

/** Works for BOTH OIDC (claims.sub) and password-auth (user.id) sessions */
function getUserId(user: any): string | null {
  if (user?.claims?.sub) return user.claims.sub;
  if (user?.id) return String(user.id);
  return null;
}

/** Role → dashboard path */
function dashboardPath(globalRole: string): string {
  switch (globalRole) {
    case "OWNER":
    case "STAFF":
      return "/founder-dashboard";
    case "OPERATOR":
      return "/operator-dashboard";
    default:
      return "/dashboard";
  }
}

// ── login ─────────────────────────────────────────────────────────────────────

export async function login(req: Request, res: Response) {
  try {
    const { email, password, twoFactorCode } = loginSchema.parse(req.body);

    if (await checkAccountLockout(email)) {
      return res.status(423).json({
        message: "Account temporarily locked due to multiple failed login attempts",
      });
    }

    const user = await storage.getUserByEmail(email);
    if (!user || !user.passwordHash) {
      await incrementLoginAttempts(email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      await incrementLoginAttempts(email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2FA check
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!twoFactorCode) {
        return res.status(200).json({ requires2FA: true });
      }
      if (!verifyTwoFactor(twoFactorCode, user.twoFactorSecret)) {
        await incrementLoginAttempts(email);
        return res.status(401).json({ message: "Invalid two-factor code" });
      }
    }

    await resetLoginAttempts(email);

    const userSession = createUserSession(user);
    req.login(userSession, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }

      // ✅ Return user + redirect path so the frontend knows where to go
      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          globalRole: user.globalRole,
          hallName: user.hallName,
          city: user.city,
          state: user.state,
          onboardingComplete: user.onboardingComplete,
        },
        redirectTo: dashboardPath(user.globalRole),
      });
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

// ── signupPlayer ──────────────────────────────────────────────────────────────

export async function signupPlayer(req: Request, res: Response) {
  try {
    const playerData = createPlayerSchema.parse(req.body);

    const existingUser = await storage.getUserByEmail(playerData.email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await hashPassword(playerData.password);

    // ✅ Save nickname during signup
    const newUser = await storage.createUser({
      email: playerData.email,
      name: playerData.name,
      nickname: playerData.nickname || playerData.name,
      globalRole: "PLAYER",
      passwordHash,
      accountStatus: "active",
      onboardingComplete: false,
      profileComplete: false,
    });

    const player = await storage.createPlayer({
      name: playerData.name,
      userId: newUser.id,
      membershipTier: playerData.membershipTier,
      isRookie: playerData.tier === "rookie",
      rookiePassActive: playerData.tier === "rookie",
    });

    // ✅ Auto-login after signup
    const userSession = createUserSession(newUser);
    req.login(userSession, (err) => {
      if (err) {
        // Still return success even if auto-login fails
        return res.status(201).json({
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            nickname: newUser.nickname,
            globalRole: newUser.globalRole,
          },
          player: { id: player.id, name: player.name },
          redirectTo: "/dashboard",
          message: "Account created! Please log in.",
        });
      }

      return res.status(201).json({
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          nickname: newUser.nickname,
          globalRole: newUser.globalRole,
        },
        player: { id: player.id, name: player.name },
        redirectTo: "/dashboard",
        message: "Account created successfully!",
      });
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

// ── signupOperator (public) ───────────────────────────────────────────────────

export async function signupOperator(req: Request, res: Response) {
  try {
    const operatorData = createOperatorSchema.parse(req.body);

    const existingUser = await storage.getUserByEmail(operatorData.email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await hashPassword(operatorData.password);

    const newUser = await storage.createUser({
      email: operatorData.email,
      name: operatorData.name,
      globalRole: "OPERATOR",
      passwordHash,
      hallName: operatorData.hallName,
      city: operatorData.city,
      state: operatorData.state,
      subscriptionTier: operatorData.subscriptionTier,
      accountStatus: "pending", // Operators need admin approval
      onboardingComplete: false,
      profileComplete: false,
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        globalRole: newUser.globalRole,
        hallName: newUser.hallName,
        subscriptionTier: newUser.subscriptionTier,
      },
      redirectTo: "/operator-pending",
      message: "Operator account created! Awaiting admin approval before you can log in.",
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

// ── createOwner (admin only) ──────────────────────────────────────────────────

export async function createOwner(req: Request, res: Response) {
  try {
    const userData = createOwnerSchema.parse(req.body);

    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await hashPassword(userData.password);
    let twoFactorSecret;
    if (userData.twoFactorEnabled) {
      twoFactorSecret = generateTwoFactorSecret();
    }

    const newUser = await storage.createUser({
      email: userData.email,
      name: userData.name,
      globalRole: "OWNER",
      passwordHash,
      twoFactorEnabled: userData.twoFactorEnabled,
      twoFactorSecret,
      phoneNumber: userData.phoneNumber,
      accountStatus: "active",
      onboardingComplete: true,
      profileComplete: true,
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        globalRole: newUser.globalRole,
      },
      ...(twoFactorSecret && { twoFactorSecret }),
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

// ── assignRole ────────────────────────────────────────────────────────────────
// ✅ Fixed: works for BOTH OIDC and password-auth users

export async function assignRole(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = getUserId(req.user);
    if (!userId) {
      return res.status(401).json({ message: "Cannot identify user session" });
    }

    const { role, ...additionalData } = req.body;

    if (!["player", "operator"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'player' or 'operator'" });
    }

    const dbUser = await storage.getUser(userId);
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (role === "operator") {
      const { hallName, city, state, subscriptionTier } = additionalData;
      if (!hallName || !city || !state || !subscriptionTier) {
        return res.status(400).json({
          message: "Missing required operator fields: hallName, city, state, subscriptionTier",
        });
      }

      await storage.updateUser(dbUser.id, {
        globalRole: "OPERATOR",
        hallName,
        city,
        state,
        subscriptionTier,
        accountStatus: "pending", // Needs admin approval
        onboardingComplete: false,
        profileComplete: false,
      });

      return res.json({
        success: true,
        redirectTo: "/operator-pending",
        message: "Operator role assigned. Awaiting admin approval.",
      });
    }

    // Player role
    const { city, state, tier, membershipTier, nickname } = additionalData;
    if (!city || !state || !tier) {
      return res.status(400).json({
        message: "Missing required player fields: city, state, tier",
      });
    }

    await storage.updateUser(dbUser.id, {
      globalRole: "PLAYER",
      nickname: nickname || dbUser.nickname || dbUser.name,
      city,
      state,
      accountStatus: "active",
      onboardingComplete: false,
      profileComplete: false,
    });

    // Create player profile if it doesn't exist
    const existingPlayer = await storage.getPlayerByUserId(dbUser.id).catch(() => null);
    if (!existingPlayer) {
      await storage.createPlayer({
        name: dbUser.name || dbUser.email,
        userId: dbUser.id,
        membershipTier: membershipTier || "none",
        isRookie: tier === "rookie",
        rookiePassActive: tier === "rookie",
      });
    }

    return res.json({
      success: true,
      redirectTo: "/dashboard",
      message: "Player profile created successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

// ── getCurrentUser / authMe ───────────────────────────────────────────────────

export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = getUserId(req.user);
    if (!userId) return res.status(401).json({ message: "Cannot identify user" });

    const dbUser = await storage.getUser(userId);
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    res.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      nickname: dbUser.nickname,
      globalRole: dbUser.globalRole,
      hallName: dbUser.hallName,
      city: dbUser.city,
      state: dbUser.state,
      subscriptionTier: dbUser.subscriptionTier,
      accountStatus: dbUser.accountStatus,
      onboardingComplete: dbUser.onboardingComplete,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function authMe(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const userId = getUserId(req.user);
    if (!userId) return res.status(401).json({ message: "Cannot identify user" });

    const dbUser = await storage.getUser(userId);
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    return res.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      nickname: dbUser.nickname,
      globalRole: dbUser.globalRole,
      hallName: dbUser.hallName,
      city: dbUser.city,
      state: dbUser.state,
      subscriptionTier: dbUser.subscriptionTier,
      accountStatus: dbUser.accountStatus,
      onboardingComplete: dbUser.onboardingComplete,
      profileComplete: dbUser.profileComplete,
    });
  } catch (error) {
    console.error("authMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

// ── authSuccess (OIDC callback) ───────────────────────────────────────────────

export async function authSuccess(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const session = req.session as any;
    const intendedRole = session.intendedRole || "player";
    delete session.intendedRole;

    const user = req.user as any;
    if (user?.claims?.sub) {
      try {
        let dbUser = await storage.getUser(user.claims.sub);
        if (!dbUser) {
          dbUser = await storage.upsertUser({
            id: user.claims.sub,
            email: user.claims.email,
            name:
              `${user.claims.first_name || ""} ${user.claims.last_name || ""}`.trim() ||
              user.claims.email ||
              "Unknown User",
          });
        }

        let globalRole: import("@shared/schema").GlobalRole = "PLAYER";
        if (intendedRole === "admin") globalRole = "OWNER";
        else if (intendedRole === "operator") globalRole = "STAFF";

        if (dbUser.globalRole !== globalRole) {
          await storage.updateUser(user.claims.sub, { globalRole });
        }
      } catch (error) {
        console.error("Error updating user role:", error);
      }
    }

    res.json({ role: intendedRole, success: true });
  } catch (error) {
    console.error("authSuccess error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
}

// ── logout ────────────────────────────────────────────────────────────────────

export function logout(req: Request, res: Response) {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logged out successfully", redirectTo: "/" });
  });
}

// ── changePassword ────────────────────────────────────────────────────────────

export async function changePassword(req: Request, res: Response) {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = getUserId(req.user);
    if (!userId) return res.status(401).json({ message: "Cannot identify user" });

    const dbUser = await storage.getUser(userId);
    if (!dbUser || !dbUser.passwordHash) {
      return res.status(400).json({ message: "Password change not supported for this account" });
    }

    const passwordValid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const newPasswordHash = await hashPassword(newPassword);
    await storage.updateUser(dbUser.id, {
      passwordHash: newPasswordHash,
      loginAttempts: 0,
      lockedUntil: undefined,
    });

    res.json({ message: "Password changed successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

// Alias
export const createOperator = signupOperator;
cat shared/schema.ts | grep -n "nickname"
cat server/storage.ts | grep -n "getPlayerByUserId"
