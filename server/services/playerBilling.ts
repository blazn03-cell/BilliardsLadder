import { Express } from "express";
import Stripe from "stripe";
import { storage } from "../storage";
import { requireAnyAuth } from "../middleware/auth";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);

// Player subscription tiers per Earning Reference spec
export function getPlayerSubscriptionTier(tier: string) {
  switch (tier) {
    case "rookie":
      return {
        tier: "rookie",
        name: "Rookie Pass",
        monthlyPrice: 999,  // $9.99/month
        yearlyPrice: 9990,  // $99.90/year (save ~$20)
        priceId: process.env.PLAYER_ROOKIE_MONTHLY_PRICE_ID || "price_rookie_monthly",
        yearlyPriceId: process.env.PLAYER_ROOKIE_YEARLY_PRICE_ID || "price_rookie_yearly",
        traditionalLeagueCost: 8000,
        monthlySavings: 7001,
        yearlySavings: 84012,
        challengerFee: 200, // $2 shift deposit per match
        perks: [
          "Access to Rookie ladder",
          "Quarterly cash prizes ($500 / $400 / $300 / $200 / $100 / $50)",
          "Mid-quarter checkpoint cash (V2)",
          "$2 shift deposits per match",
          "Low-stakes challenge matches",
          "Credits convert to cash at quarter end (100 cr = $1)",
          "Match history & leaderboard"
        ],
        commissionRate: 400, // 4% stake fee in basis points
        description: "The entry point — quarterly cash prizes and rookie ladder access"
      };
    case "standard":
    case "basic":
      return {
        tier: "standard",
        name: "Basic",
        monthlyPrice: 2499, // $24.99/month
        yearlyPrice: 25490, // $254.90/year (save ~$44)
        priceId: process.env.PLAYER_STANDARD_MONTHLY_PRICE_ID || "price_standard_monthly",
        yearlyPriceId: process.env.PLAYER_STANDARD_YEARLY_PRICE_ID || "price_standard_yearly",
        traditionalLeagueCost: 8000,
        monthlySavings: 5501,
        yearlySavings: 66012,
        challengerFee: 0,
        perks: [
          "Unlimited challenges",
          "4% stake fee",
          "$150 max stake per match",
          "Full open ladder access",
          "Consistency cash bonuses (3 / 6 / 12 / 26 week streaks)",
          "Monthly tournament access",
          "Shop credits system"
        ],
        commissionRate: 400, // 4% stake fee in basis points
        description: "Full competitive access with consistency bonuses and tournament play"
      };
    case "premium":
      return {
        tier: "premium",
        name: "Premium",
        monthlyPrice: 3499, // $34.99/month
        yearlyPrice: 35690, // $356.90/year (save ~$62)
        priceId: process.env.PLAYER_PREMIUM_MONTHLY_PRICE_ID || "price_premium_monthly",
        yearlyPriceId: process.env.PLAYER_PREMIUM_YEARLY_PRICE_ID || "price_premium_yearly",
        traditionalLeagueCost: 8000,
        monthlySavings: 4501,
        yearlySavings: 54012,
        challengerFee: 0,
        perks: [
          "3% stake fee",
          "$1,000 max stake per match",
          "AI Coach access",
          "Advanced analytics",
          "Priority matchmaking",
          "48-reward vault",
          "$30 tournament entry",
          "No ads",
          "Verified Premium badge"
        ],
        commissionRate: 300, // 3% stake fee in basis points
        description: "Serious players — lower fees, AI coaching, and higher stakes"
      };
    case "family":
      return {
        tier: "family",
        name: "Family Plan",
        monthlyPrice: 4499, // $44.99/month
        yearlyPrice: 45890, // $458.90/year (save ~$80)
        priceId: process.env.PLAYER_FAMILY_MONTHLY_PRICE_ID || "price_family_monthly",
        yearlyPriceId: process.env.PLAYER_FAMILY_YEARLY_PRICE_ID || "price_family_yearly",
        traditionalLeagueCost: 16000, // $160/month for a family in traditional leagues
        monthlySavings: 11501,
        yearlySavings: 138012,
        challengerFee: 0,
        perks: [
          "Up to 4 player profiles on one account",
          "Adults operate at Basic-level stakes",
          "Kids (12 & under) + Teens (13–17) add-ons ($3.99–$4.99 each)",
          "Junior competitions & drills for younger players",
          "Family Tournament access",
          "4% stake fee for adult accounts"
        ],
        commissionRate: 400, // 4% stake fee (Basic-level for adults)
        description: "One account for the whole family — juniors, teens, and adults"
      };
    case "elite":
      return {
        tier: "elite",
        name: "Elite Player",
        monthlyPrice: 9900, // $99/month
        yearlyPrice: 100980, // $1,009.80/year (save ~$178)
        priceId: process.env.PLAYER_ELITE_MONTHLY_PRICE_ID || "price_elite_monthly",
        yearlyPriceId: process.env.PLAYER_ELITE_YEARLY_PRICE_ID || "price_elite_yearly",
        traditionalLeagueCost: 8000,
        monthlySavings: -1900, // Costs more, but premium access pays off at high stakes
        yearlySavings: -22800,
        challengerFee: 0,
        perks: [
          "2% stake fee (lowest on the platform)",
          "$1,000+ max stake (operator approval above $1,000)",
          "Travel / cross-region challenges",
          "AI opponent scouting",
          "VIP tournament seeding",
          "Dedicated support",
          "Hall of Fame eligible",
          "$0–$20 tournament entry scaled by prize pool"
        ],
        commissionRate: 200, // 2% stake fee in basis points
        description: "The top tier — highest stakes, lowest fees, Hall of Fame eligible"
      };
    default:
      return null;
  }
}

export function registerPlayerBillingRoutes(app: Express) {
  
  // Get player subscription tiers and pricing
  app.get("/api/player-billing/tiers", (req, res) => {
    const tiers = ["rookie", "standard", "premium", "family", "elite"].map(tier => getPlayerSubscriptionTier(tier));
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
      const subscriptionCost = 3499; // $34.99/month
      const commissionSavings = 200 * 0.01 * 100; // $2/month from 3% vs 4% stake fee on $200 avg bets
      const tutoringValue = 0; // AI Coach included in tier, standalone session locked until coaching built
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
          "Lower Stake Fee (3% vs 4%)": `$${(commissionSavings/100).toFixed(0)}/month`,
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