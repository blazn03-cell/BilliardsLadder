# Stripe Setup & Configuration Guide

## 🎯 Overview

This guide walks you through setting up all required Stripe products and price IDs for BilliardsLadder.

---

## 📋 Required Products

### **Player Subscriptions** (3 tiers)

1. **Rookie Pass - Monthly**
   - Price: $20/month
   - Description: Basic player subscription with limited features
   - Environment Variable: `PLAYER_ROOKIE_MONTHLY_PRICE_ID`

2. **Standard Membership - Monthly**
   - Price: $25/month
   - Description: Standard player membership with full features
   - Environment Variable: `PLAYER_STANDARD_MONTHLY_PRICE_ID`

3. **Premium Membership - Monthly**
   - Price: $60/month
   - Description: Premium player membership with coaching and analytics
   - Environment Variable: `PLAYER_PREMIUM_MONTHLY_PRICE_ID`

---

### **Operator Subscriptions** (4 tiers)

1. **Small Operator Plan**
   - Use when: Small bars with 1-2 pool tables
   - Environment Variable: `SMALL_PRICE_ID`

2. **Medium Operator Plan**
   - Use when: Medium venues with 3-5 pool tables
   - Environment Variable: `MEDIUM_PRICE_ID`

3. **Large Operator Plan**
   - Use when: Large venues with 6+ pool tables
   - Environment Variable: `LARGE_PRICE_ID`

4. **Mega Operator Plan**
   - Use when: Multi-location operators or leagues
   - Environment Variable: `MEGA_PRICE_ID`

---

## 🔧 Step-by-Step Setup

### **Step 1: Log into Stripe Dashboard**

Go to: https://dashboard.stripe.com/

---

### **Step 2: Create Player Subscription Products**

#### **Rookie Pass - Monthly**

1. Click **Products** → **Add Product**
2. Fill in:
   - **Name:** ActionLadder Rookie Pass
   - **Description:** Monthly subscription for rookie league players
   - **Image/Icon:** (optional)
3. Click **Add recurring price**
4. Fill in:
   - **Billing period:** Monthly
   - **Price:** $20.00
   - **Currency:** USD
5. Click **Save product**
6. **Copy the Price ID** (looks like `price_1...`) and save it

**Action:** Update `.env`:
```
PLAYER_ROOKIE_MONTHLY_PRICE_ID=price_your_copied_id_here
```

---

#### **Standard Membership - Monthly**

Repeat the same process:
1. **Name:** ActionLadder Standard Membership
2. **Price:** $25.00/month
3. **Copy Price ID**

**Action:** Update `.env`:
```
PLAYER_STANDARD_MONTHLY_PRICE_ID=price_your_copied_id_here
```

---

#### **Premium Membership - Monthly**

Repeat the same process:
1. **Name:** ActionLadder Pro Membership
2. **Price:** $60.00/month
3. **Copy Price ID**

**Action:** Update `.env`:
```
PLAYER_PREMIUM_MONTHLY_PRICE_ID=price_your_copied_id_here
```

---

### **Step 3: Create Operator Subscription Products**

Repeat the product creation process for each operator tier:

#### **Small Operator Plan**
- **Name:** BilliardsLadder Small Operator Plan
- **Description:** For venues with 1-2 pool tables
- **Price:** (Set based on your business model)
- **Billing:** Monthly

**Action:** Update `.env`:
```
SMALL_PRICE_ID=price_your_copied_id_here
```

---

#### **Medium Operator Plan**
- **Name:** BilliardsLadder Medium Operator Plan
- **Description:** For venues with 3-5 pool tables
- **Price:** (Set based on your business model)
- **Billing:** Monthly

**Action:** Update `.env`:
```
MEDIUM_PRICE_ID=price_your_copied_id_here
```

---

#### **Large Operator Plan**
- **Name:** BilliardsLadder Large Operator Plan
- **Description:** For venues with 6+ pool tables
- **Price:** (Set based on your business model)
- **Billing:** Monthly

**Action:** Update `.env`:
```
LARGE_PRICE_ID=price_your_copied_id_here
```

---

#### **Mega Operator Plan**
- **Name:** BilliardsLadder Mega Operator Plan
- **Description:** For multi-location operators and leagues
- **Price:** (Set based on your business model)
- **Billing:** Monthly

**Action:** Update `.env`:
```
MEGA_PRICE_ID=price_your_copied_id_here
```

---

## ✅ Verification Steps

### **1. Validate Configuration**

Run this script to verify all price IDs exist in Stripe:

```bash
node validate-stripe.js
```

**Expected output:**
```
✅ PLAYER_ROOKIE_MONTHLY_PRICE_ID
   Price: $20.00
   ...
✅ All price IDs are valid!
```

---

### **2. Test Checkout**

Once configured, test the checkout flow:

```bash
# Start server
npm run dev

# In another terminal, test checkout
curl -X POST http://localhost:5000/api/billing/checkout \
  -H "Content-Type: application/json" \
  -d '{"tier":"small"}'
```

Expected: Should redirect to Stripe checkout page (or return error if not authenticated)

---

## 🚀 Production Deployment

### **For Production:**

1. **Use Stripe Live Keys** (not test keys)
   - Replace `sk_test_...` with `sk_live_...` in `.env`

2. **Set Webhook Secret**
   - Get from Stripe Dashboard → Developers → Webhooks
   - Update `STRIPE_WEBHOOK_SECRET` in `.env`

3. **Test with Real Cards**
   - Use actual test cards provided by Stripe
   - Monitor webhook events in dashboard

4. **Monitor Payments**
   - Check Stripe Dashboard for successful charges
   - Review subscription status
   - Monitor refunds if applicable

---

## 🐛 Troubleshooting

### **Issue: "Price not found" error**

**Cause:** Price ID doesn't exist or is wrong
**Fix:** 
1. Go to Stripe Dashboard
2. Find the product
3. Copy the correct price ID
4. Update `.env`
5. Run `validate-stripe.js` again

---

### **Issue: Checkout won't load**

**Cause:** Missing publishable key or misconfigured
**Fix:**
1. Check `STRIPE_SECRET_KEY` is set
2. Verify database tables exist: `npm run db:push`
3. Check server logs for errors
4. Restart server: `npm run dev`

---

### **Issue: Webhooks not working**

**Cause:** Webhook secret not set or wrong endpoint
**Fix:**
1. Get webhook secret from Stripe Dashboard
2. Set `STRIPE_WEBHOOK_SECRET` in `.env`
3. Verify webhook endpoint is public: `/api/stripe/webhook`
4. Test webhook: Send test event from Stripe Dashboard

---

## 📊 Complete Checklist

- [ ] Created 3 player subscription products
- [ ] Created 4 operator subscription products
- [ ] Copied all 7 price IDs to `.env`
- [ ] Ran `node validate-stripe.js` - all passed
- [ ] Tested checkout flow in development
- [ ] Updated to live keys for production
- [ ] Set webhook secret
- [ ] Tested with real payment flow
- [ ] Monitored webhook events
- [ ] Ready for production deployment ✅