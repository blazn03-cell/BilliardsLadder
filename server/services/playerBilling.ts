import { Express } from "express";
import Stripe from "stripe";
import { storage } from "../storage";
import { requireAnyAuth } from "../middleware/auth";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);

// Player subscription tiers — aligned with Master Business Plan v1.0
// Free | Basic $9.99 | Premium $19.99 | Family $29.99 | Elite $49.99
export function getPlayerSubscriptionTier(tier: string) {
  switch (tier) {
    case "free":
      return {
        tier: "free",
        name: "Free",
        monthlyPrice: 0,
        yearlyPrice: 0,
        priceId: process.env.STRIPE_PRICE_FREE || "price_free_placeholder",
        yearlyPriceId: process.env.STRIPE_PRICE_FREE || "price_free_placeholder",
        activeChallengeLimit: 2,
        perks: [
          "Player profile & career page",
          "Basic ladder participation",
          "2 active challenges at a time",
          "Match history tracking",
          "8% service fee on match stakes",
          "Max single stake: $50",
          "Earn all 48 rewards (collect only)",
          "Community features",
        ],
        commissionRate: 800, // 8% in basis points
        description: "Get on the ladder, build your record, and see what the platform can do.",
      };
    case "basic":
      return {
        tier: "basic",
        name: "Basic",
        monthlyPrice: 999,   // $9.99/month
        yearlyPrice: 8999,   // $89.99/year
        priceId: process.env.STRIPE_PRICE_BASIC || "price_basic_placeholder",
        yearlyPriceId: process.env.STRIPE_PRICE_BASIC_ANNUAL || "price_basic_annual_placeholder",
        activeChallengeLimit: Infinity,
        perks: [
          "Unlimited challenges",
          "Earnings dashboard — track every dollar",
          "5% service fee on match stakes",
          "Max single stake: $150",
          "Weekly threshold: $50–$150",
          "Performance pay: Tuesday after window",
          "Badge exchange: gear & event entries",
          "Tournament entry: $36",
          "Weekly streak bonuses",
        ],
        commissionRate: 500, // 5% in basis points
        description: "Serious competitor. Full platform access, 5% fee, on-schedule pay.",
      };
    case "premium":
      return {
        tier: "premium",
        name: "Premium",
        monthlyPrice: 1999,  // $19.99/month
        yearlyPrice: 17999,  // $179.99/year
        priceId: process.env.STRIPE_PRICE_PREMIUM || "price_premium_placeholder",
        yearlyPriceId: process.env.STRIPE_PRICE_PREMIUM_ANNUAL || "price_premium_annual_placeholder",
        activeChallengeLimit: Infinity,
        perks: [
          "Everything in Basic",
          "Priority matchmaking & challenge scheduling",
          "Coach marketplace access",
          "Advanced analytics: win rate, earnings history, Fargo progression",
          "3% service fee on match stakes",
          "Max single stake: $500",
          "Weekly threshold: $50–$500",
          "Performance pay: Fri–Mon window",
          "Full cashout on all 48 rewards",
          "Badge exchange: Full — cash payouts up to $100/wk",
          "Tournament entry: $30 (save $10 per event)",
          "No platform ads",
          "Verified Premium badge on profile",
        ],
        commissionRate: 300, // 3% in basis points
        description: "The most popular tier. Priority matching, coach access, no ads, 3% fee.",
      };
    case "family":
      return {
        tier: "family",
        name: "Family Plan",
        monthlyPrice: 2999,  // $29.99/month
        yearlyPrice: 26999,  // $269.99/year
        priceId: process.env.STRIPE_PRICE_FAMILY || "price_family_placeholder",
        yearlyPriceId: process.env.STRIPE_PRICE_FAMILY_ANNUAL || "price_family_annual_placeholder",
        activeChallengeLimit: Infinity,
        perks: [
          "Up to 4 player profiles under one account",
          "Shared earnings dashboard across all profiles",
          "All adults: Basic-level stakes, 5% fee, Fri–Mon pay",
          "Tournament entry: $30 for adults",
          "Add-on: +$3.99/child under 12 · +$4.99/teen 13–17",
          "Kids: Drill challenges & competitions only",
        ],
        commissionRate: 500, // 5% in basis points (same as Basic for adults)
        description: "Four people for one price. Best deal for competitive families.",
      };
    case "elite":
      return {
        tier: "elite",
        name: "Elite Player",
        monthlyPrice: 4999,  // $49.99/month
        yearlyPrice: 44999,  // $449.99/year
        priceId: process.env.STRIPE_PRICE_ELITE || "price_elite_placeholder",
        yearlyPriceId: process.env.STRIPE_PRICE_ELITE_ANNUAL || "price_elite_annual_placeholder",
        activeChallengeLimit: Infinity,
        perks: [
          "Everything in Premium",
          "Elite Player badge — publicly certified ranking",
          "Travel challenge access: cross-city & cross-state",
          "2% service fee — platform minimum",
          "Max single stake: $1,000 (up to $1,100 with approval)",
          "Weekly threshold: $50–$1,000+",
          "Performance pay: Fri–Mon, priority processing",
          "Full cashout on all 48 rewards",
          "Badge exchange: Full — cash payouts up to $100/wk",
          "Tournament entry: $25 (save $15 per event)",
          "AI opponent scouting & performance coaching",
          "VIP tournament seeding",
          "Dedicated support line",
        ],
        commissionRate: 200, // 2% in basis points
        description: "For top competitors. Certified ranking, travel challenges, lowest 2% fee.",
      };
    default:
      return null;
  }
}

export function registerPlayerBillingRoutes(app: Express) {

  // Get player subscription tiers and pricing
  app.get("/api/player-billing/tiers", (req, res) => {
    const tiers = ["free", "basic", "premium", "family", "elite"].map(tier => getPlayerSubscriptionTier(tier));
    res.json({ tiers });
  });

  // Get premium user savings breakdown
  app.get("/api/player-billing/premium-savings", requireAnyAuth, async (req, res) => {
    try {
      const userId = (req as any).dbUser.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const subscription = await storage.getMembershipSubscriptionByPlayerId(userId);
      
      if (!subscription || subscription.tier !== 'premium') {
        return res.json({
          isPremium: false,
          message: "Premium subscription required to view savings breakdown"
        });
      }

      // Calculate actual savings for premium users
      const subscriptionCost = 4500; // $45/month
      const commissionSavings = 200 * 0.05 * 100; // $10/month from 5% vs 10% commission on $200 avg bets
      const tutoringValue = 3000; // $30/month free tutoring session
      const tournamentBonus = 100 * 0.05 * 100; // $5/month from 95% vs 90% tournament winnings on $100 avg
      const referralCredits = 1000; // $10/month average referral bonus
      
      // Check loyalty discount eligibility
      const user = await storage.getUser(userId);
      let loyaltyDiscount = 0;
      let loyaltyEligible = false;
      
      if (user?.createdAt) {
        const sixMonthsAgo = new Date().getTime() - (6 * 30 * 24 * 60 * 60 * 1000);
        loyaltyEligible = new Date(user.createdAt).getTime() < sixMonthsAgo;
        if (loyaltyEligible) {
          loyaltyDiscount = subscriptionCost * 0.1; // 10% discount
        }
      }

      const totalSavings = commissionSavings + tutoringValue + tournamentBonus + referralCredits + loyaltyDiscount;
      const netCost = Math.max(subscriptionCost - totalSavings, 0);

      res.json({
        isPremium: true,
        subscriptionCost,
        savings: {
          commissionSavings,
          tutoringValue,
          tournamentBonus,
          referralCredits,
          loyaltyDiscount
        },
        totalSavings,
        netCost,
        loyaltyEligible,
        breakdown: {
          "Lower Commission (5% vs 10%)": `$${(commissionSavings/100).toFixed(0)}/month`,
          "Free Monthly Tutoring": `$${(tutoringValue/100).toFixed(0)}/month`,
          "Tournament Winnings Bonus": `$${(tournamentBonus/100).toFixed(0)}/month`,
          "Referral Credits": `$${(referralCredits/100).toFixed(0)}/month`,
          ...(loyaltyEligible && {"Loyalty Discount": `$${(loyaltyDiscount/100).toFixed(2)}/month`})
        }
      });

    } catch (error: any) {
      console.error("Premium savings calculation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create player subscription checkout session
  app.post("/api/player-billing/checkout", requireAnyAuth, async (req, res) => {
    try {
      const { tier, billingPeriod = "monthly" } = req.body;
      
      if (!tier) {
        return res.status(400).json({ error: "tier required" });
      }

      // Get authenticated user ID from session
      const userId = (req as any).dbUser.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const subscription = getPlayerSubscriptionTier(tier);
      if (!subscription) {
        return res.status(400).json({ error: "Invalid subscription tier" });
      }

      // Get or create Stripe customer for this user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user.id,
            userRole: user.globalRole
          }
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUser(userId, { stripeCustomerId: customerId });
      }

      // Calculate amount based on billing period
      let amount = billingPeriod === "yearly" ? subscription.yearlyPrice : subscription.monthlyPrice;
      
      // Apply loyalty discount for Premium users (10% off after 6 months)
      if (tier === "premium" && user.createdAt && 
          new Date().getTime() - new Date(user.createdAt).getTime() > (6 * 30 * 24 * 60 * 60 * 1000)) {
        amount = Math.floor(amount * 0.9); // 10% loyalty discount
      }

      // Create checkout session with dynamic price (no need for pre-created price IDs)
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${subscription.name} Membership`,
              description: subscription.description,
            },
            unit_amount: amount,
            recurring: {
              interval: billingPeriod === "yearly" ? "year" : "month",
            },
          },
          quantity: 1
        }],
        success_url: `${process.env.APP_BASE_URL || 'http://localhost:5000'}/app?tab=dashboard&subscription=success`,
        cancel_url: `${process.env.APP_BASE_URL || 'http://localhost:5000'}/app?tab=dashboard&subscription=cancelled`,
        client_reference_id: userId,
        subscription_data: {
          metadata: {
            userId,
            tier: subscription.tier,
            billingPeriod,
            userRole: user.globalRole
          }
        },
        metadata: {
          userId,
          tier: subscription.tier,
          billingPeriod,
          type: "player_subscription"
        }
      });

      res.json({ 
        url: session.url, 
        sessionId: session.id,
        subscription: {
          tier: subscription.name,
          price: amount,
          billingPeriod,
          savings: billingPeriod === "yearly" ? subscription.yearlySavings : subscription.monthlySavings
        }
      });

    } catch (error: any) {
      console.error("Player checkout error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get current player subscription status
  app.get("/api/player-billing/status", requireAnyAuth, async (req, res) => {
    try {
      // Get authenticated user ID from session
      const userId = (req as any).dbUser.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Check if user has active subscription in our database
      const subscription = await storage.getMembershipSubscriptionByPlayerId(userId);
      
      if (!subscription) {
        return res.json({ 
          hasSubscription: false,
          tier: null,
          status: "none"
        });
      }

      const tierInfo = getPlayerSubscriptionTier(subscription.tier);
      
      res.json({
        hasSubscription: true,
        tier: subscription.tier,
        tierInfo,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        stripeCustomerId: subscription.stripeCustomerId,
        monthlyPrice: subscription.monthlyPrice,
        perks: subscription.perks || [],
        commissionRate: subscription.commissionRate
      });

    } catch (error: any) {
      console.error("Get subscription status error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel player subscription
  app.post("/api/player-billing/cancel", requireAnyAuth, async (req, res) => {
    try {
      // Get authenticated user ID from session
      const userId = (req as any).dbUser.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const subscription = await storage.getMembershipSubscriptionByPlayerId(userId);
      if (!subscription || !subscription.stripeSubscriptionId) {
        return res.status(404).json({ error: "No active subscription found" });
      }

      // Cancel at period end in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      // Update our database
      await storage.updateMembershipSubscription(subscription.id, {
        cancelAtPeriodEnd: true
      });

      res.json({ success: true, message: "Subscription will cancel at the end of the current period" });

    } catch (error: any) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Reactivate cancelled subscription
  app.post("/api/player-billing/reactivate", requireAnyAuth, async (req, res) => {
    try {
      // Get authenticated user ID from session
      const userId = (req as any).dbUser.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const subscription = await storage.getMembershipSubscriptionByPlayerId(userId);
      if (!subscription || !subscription.stripeSubscriptionId) {
        return res.status(404).json({ error: "No subscription found" });
      }

      // Reactivate in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false
      });

      // Update our database
      await storage.updateMembershipSubscription(subscription.id, {
        cancelAtPeriodEnd: false
      });

      res.json({ success: true, message: "Subscription reactivated successfully" });

    } catch (error: any) {
      console.error("Reactivate subscription error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Player billing portal (manage subscription, payment methods, etc.)
  app.post("/api/player-billing/portal", requireAnyAuth, async (req, res) => {
    try {
      // Get authenticated user ID from session
      const userId = (req as any).dbUser.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({ error: "No customer account found" });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.APP_BASE_URL || 'http://localhost:5000'}/app?tab=dashboard`
      });

      res.json({ url: session.url });

    } catch (error: any) {
      console.error("Billing portal error:", error);
      res.status(500).json({ error: error.message });
    }
  });
}