# Stripe Production Readiness Checklist

Here are the exact, actionable steps you need to take to make the Stripe integration fully functional for live use or testing in this specific project:

### 1. Fix the Local Environment
Before anything works, you must fix the Node environment issue we saw earlier:
- Open your terminal and run `npm install`.
- Ensure your Postgres database is running or connected via `DATABASE_URL`, and run `npm run db:push` to ensure all Stripe data tables (like `playerEarningLedger` and `webhookEvents`) exist.

### 2. Configure Your Stripe Dashboard (Products & Prices)
The current codebase hardcodes specific Stripe `Price IDs` for things like Memberships and Charity donations. Since you will be using your own Stripe account, you need to recreate these:
- Log into your Stripe Dashboard.
- Go to **Product Catalog** and create the following products/prices:
  1. **Rookie Pass** (e.g., $20/month)
  2. **Basic Membership** (e.g., $25/month)
  3. **Pro Membership** (e.g., $60/month)
  4. **Charity Donation Tiers** (One-time prices for $5, $10, $25, etc.)
  5. **Operator Subscription Tiers** (Small, Medium, Large, Mega)
- **Action:** Copy the generated `price_...` IDs from Stripe and update the `prices` configuration object inside `server/controllers/financial.controller.ts` (lines 19-37) and `server/routes.ts` (lines 66-84).

### 3. Setup Your `.env` File
Create a `.env` file in your project root with your live or test Stripe keys:
```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Map your operator operator tiers here since env.ts looks for them:
SMALL_PRICE_ID=price_...
MEDIUM_PRICE_ID=price_...
LARGE_PRICE_ID=price_...
MEGA_PRICE_ID=price_...
```

### 4. Connect the Webhook to Stripe
Without this, payments will go through, but your database will never update to grant users their memberships or wallet credits.
- In your Stripe Dashboard, go to **Developers > Webhooks**.
- Click **Add endpoint**.
- If testing locally, use the Stripe CLI to forward events: `stripe listen --forward-to localhost:5000/api/stripe/webhook` (This gives you your test `STRIPE_WEBHOOK_SECRET`).
- If deploying to live production, enter `https://your-domain.com/api/stripe/webhook`.
- **Select these specific events to listen to:**
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `payment_intent.succeeded`
  - `charge.refunded`

### 5. Setup Stripe Connect (For Payouts)
If you are planning to pay out tournament winners or operators using the `/api/player/withdraw` endpoint we discussed earlier:
- Go to Stripe Dashboard -> **Connect**.
- Complete your platform profile (Branding, onboarding flows).
- Your users will now be able to go through the Stripe Connect flow to get a `stripeConnectId`, which is required for the `withdrawNow` function to work.
