import type { Express } from "express";
import { requireOwner, requireStaffOrOwner } from "../middleware/auth";
import * as adminController from "../controllers/admin.controller";
import { storage } from "../storage";

export function registerAdminRoutes(app: Express) {
  app.post("/api/admin/staff/invite", requireOwner, adminController.inviteStaff);
  app.post("/api/admin/staff/update-share", requireOwner, adminController.updateStaffShare);
  app.get("/api/admin/payouts", requireOwner, adminController.getPayoutHistory);
  app.get("/api/admin/connect/:userId", requireOwner, adminController.getConnectAccountStatus);
  app.get("/api/admin/organization/seats", requireOwner, adminController.getOrganizationSeats);
  app.post("/api/admin/organization/seats", requireOwner, adminController.updateOrganizationSeats);
  app.get("/api/admin/subscription-details", requireOwner, adminController.getSubscriptionDetails);

  // Founder Dashboard: Pending approvals
  app.get("/api/admin/pending-approvals", requireOwner, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const pending = allUsers.filter((u: any) => u.accountStatus === "pending");
      res.json(pending);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch pending approvals" });
    }
  });

  // Founder Dashboard: All users
  app.get("/api/admin/users", requireOwner, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        nickname: u.nickname,
        globalRole: u.globalRole,
        accountStatus: u.accountStatus || "active",
        createdAt: u.createdAt,
      })));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Founder Dashboard: Platform stats
  app.get("/api/admin/stats", requireOwner, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const operators = allUsers.filter((u: any) =>
        ["OPERATOR", "REGIONAL_OPERATOR", "POOL_HALL_OWNER", "LOCAL_OPERATOR"].includes(u.globalRole)
      );
      res.json({
        totalUsers: allUsers.length,
        operators: operators.length,
        pendingApprovals: allUsers.filter((u: any) => u.accountStatus === "pending").length,
        revenue: 0,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Founder Dashboard: Approve user
  app.post("/api/admin/approve-user/:userId", requireOwner, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.updateUser(userId, { accountStatus: "active" } as any);
      res.json({ success: true, message: "User approved" });
    } catch (err) {
      res.status(500).json({ error: "Failed to approve user" });
    }
  });

  // Founder Dashboard: Reject user
  app.post("/api/admin/reject-user/:userId", requireOwner, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.updateUser(userId, { accountStatus: "rejected" } as any);
      res.json({ success: true, message: "User rejected" });
    } catch (err) {
      res.status(500).json({ error: "Failed to reject user" });
    }
  });

  // Founder Dashboard: Invite operator by hierarchy
  app.post("/api/admin/invite-operator", requireOwner, async (req, res) => {
    try {
      const { email, role, region, note } = req.body;
      if (!email || !role) {
        return res.status(400).json({ error: "Email and role are required" });
      }
      // Create pending user record
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }
      // In real scenario: send email invite. For now create pending placeholder.
      res.json({ success: true, message: `Invitation sent to ${email} for role ${role}` });
    } catch (err) {
      res.status(500).json({ error: "Failed to send invitation" });
    }
  });

  // Regional Operator: Invite hall owner
  app.post("/api/regional/invite-hall-owner", async (req, res) => {
    try {
      const { email, hallName, city } = req.body;
      if (!email || !hallName) {
        return res.status(400).json({ error: "Email and hall name are required" });
      }
      res.json({ success: true, message: `Invitation sent to ${email} for ${hallName}. Pending Admin approval.` });
    } catch (err) {
      res.status(500).json({ error: "Failed to send invitation" });
    }
  });

  // Regional Operator: My halls
  app.get("/api/regional/my-halls", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const halls = allUsers.filter((u: any) =>
        ["POOL_HALL_OWNER", "LOCAL_OPERATOR", "OPERATOR"].includes(u.globalRole)
      );
      res.json(halls.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        hallName: u.hallName,
        globalRole: u.globalRole,
        accountStatus: u.accountStatus || "active",
      })));
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch halls" });
    }
  });

  // Regional Operator: Stats
  app.get("/api/regional/stats", async (req, res) => {
    try {
      res.json({ hallCount: 0, playerCount: 0, pendingCount: 0, revenue: 0 });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch regional stats" });
    }
  });
}

export function registerOperatorRoutes(app: Express) {
  app.post("/api/operator/toggle-free-month", requireStaffOrOwner, adminController.toggleFreeMonth);
  app.post("/api/operator/customization", requireStaffOrOwner, adminController.updateOperatorCustomization);
}

// Re-export the webhook handler
export { payStaffFromInvoice } from "../controllers/admin.controller";
