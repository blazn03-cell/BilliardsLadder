# Production Deployment Checklist

## 🎯 Executive Summary

This checklist ensures BilliardsLadder is production-ready before deploying to Replit.

**Production Details:**
- Domain: https://BilliardsLadder.replit.app
- Replit ID: 278e4ed0-194c-48a8-b073-5ee9b09d0e35

---

## ✅ Phase 1: Security Verification (COMPLETED)

- [x] Checkout route protected with authentication
- [x] Players route protected with authentication
- [x] Rate limiting fixed (doesn't mask validation errors)
- [x] Health check endpoint working
- [x] All security tests passed
- [x] Branding updated to BilliardsLadder

---

## ✅ Phase 2: Environment Configuration

### **Step 1: Verify Environment Variables**

```bash
node -e "console.log(process.env.STRIPE_SECRET_KEY ? '✅' : '❌')"
```

**Required Variables in `.env`:**
- [ ] `STRIPE_SECRET_KEY` (test key for dev, live key for prod)
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `DATABASE_URL` (with ?sslmode=require for production)
- [ ] `SESSION_SECRET` (long random string)
- [ ] `REPLIT_DOMAINS` (BilliardsLadder.replit.app)
- [ ] `REPL_ID` (278e4ed0-194c-48a8-b073-5ee9b09d0e35)

### **Step 2: Verify Stripe Price IDs**

```bash
npm run validate:stripe
```

**Should see:**
- ✅ All 7 price IDs found in Stripe
- ✅ Products and prices correct
- ✅ Amounts match your business model

If price IDs are missing:
1. Read `STRIPE_SETUP_GUIDE.md`
2. Create products in Stripe Dashboard
3. Copy correct price IDs
4. Update `.env`
5. Run validation again

---

## ✅ Phase 3: Database Setup

### **Step 1: Create Database Tables**

```bash
npm run setup:database
```

**Should see:**
- ✅ Connecting to database...
- ✅ Schema pushed successfully
- ✅ All required tables exist
- ✅ webhook_events table created

If database setup fails:
1. Check `DATABASE_URL` is correct
2. Verify database server is running
3. Check network connectivity
4. Review troubleshooting in `STRIPE_SETUP_GUIDE.md`

### **Step 2: Verify Database Schema**

```bash
npm run validate:database
```

**Should show tables:**
- ✅ users
- ✅ players
- ✅ webhook_events
- ✅ sessions
- ✅ matches
- ✅ tournaments
- ✅ pool_players

---

## ✅ Phase 4: Complete Production Validation

Run the comprehensive validation:

```bash
validate-production.bat
```

Or via npm:

```bash
npm run validate:production
```

**Checks:**
1. [ ] All environment variables set
2. [ ] Stripe price IDs valid
3. [ ] Database tables created
4. [ ] Security fixes verified

---

## 🚀 Phase 5: Deployment to Production

### **Step 1: Update to Production Stripe Keys**

In `.env`:
```bash
# Replace test keys with live keys
STRIPE_SECRET_KEY=sk_live_your_live_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_prod_webhook_secret_here
```

**Important:** Use LIVE keys only for production!

---

### **Step 2: Update Database for Production**

In `.env`:
```bash
# Ensure SSL is enabled
DATABASE_URL=postgresql://user:pass@prod-host:5432/db?sslmode=require
```

---

### **Step 3: Build for Production**

```bash
npm run build
```

**Creates:**
- ✅ `dist/index.js` (server)
- ✅ `client/dist/` (frontend)

---

### **Step 4: Push to Replit**

```bash
git add .
git commit -m "Production deployment: security fixes, Stripe config, database setup"
git push
```

---

### **Step 5: Replit Setup**

On Replit Dashboard:

1. Add Secrets (Settings → Secrets):
   - `STRIPE_SECRET_KEY` (live key)
   - `STRIPE_WEBHOOK_SECRET` (production)
   - `DATABASE_URL` (production DB)
   - Other required vars from `.env`

2. Run Database Setup:
   ```bash
   npm run setup:database
   ```

3. Start Server:
   ```bash
   npm start
   ```

---

## 🧪 Phase 6: Post-Deployment Testing

### **Test 1: Health Check**

```bash
curl https://BilliardsLadder.replit.app/healthz
```

Expected: `ok`

---

### **Test 2: Authentication**

```bash
curl -X POST https://BilliardsLadder.replit.app/api/billing/checkout
```

Expected: HTTP 401 (Unauthorized)

---

### **Test 3: Payment Flow**

1. Login to https://BilliardsLadder.replit.app
2. Try to subscribe
3. Verify Stripe checkout loads
4. Complete test payment
5. Verify webhook received

---

### **Test 4: Monitor Stripe Events**

Go to Stripe Dashboard → Events:
- [ ] customer.created
- [ ] charge.succeeded
- [ ] customer.subscription.updated
- [ ] invoice.payment_succeeded

---

## 📊 Final Verification

### **Security Checklist**

- [ ] All routes require authentication
- [ ] No test credentials in production
- [ ] Database has SSL enabled
- [ ] Stripe webhooks configured
- [ ] Rate limiting active
- [ ] Error messages don't leak sensitive info

### **Functionality Checklist**

- [ ] Login/signup works
- [ ] Player routes protected
- [ ] Checkout flow works
- [ ] Payments process correctly
- [ ] Webhooks trigger predictably
- [ ] Branding shows "BilliardsLadder"

### **Performance Checklist**

- [ ] Health check responds fast
- [ ] Checkout loads in < 3 seconds
- [ ] No database connection errors
- [ ] Memory usage stable
- [ ] No memory leaks after 1 hour

---

## 🎉 Deployment Complete!

When all checks pass:

**Status: PRODUCTION READY ✅**

- Application: https://BilliardsLadder.replit.app
- Security: All critical fixes verified ✅
- Payments: Stripe integrated and validated ✅
- Database: Tables created and tested ✅
- Monitoring: Webhooks active ✅

---

## 🆘 Emergency Contacts & Resources

### **If Payment Processing Fails:**
1. Check Stripe Dashboard for errors
2. Verify webhook secret is correct
3. Check server logs for validation errors

### **If Database Connection Fails:**
1. Verify DATABASE_URL format
2. Check network connectivity
3. Ensure SSL certificate is valid

### **If Users Can't Login:**
1. Check SESSION_SECRET is set
2. Verify authentication middleware
3. Check Replit auth configuration

### **Support Resources:**
- Stripe: https://stripe.com/docs
- PostgreSQL: https://www.postgresql.org/docs
- Express: https://expressjs.com
- Drizzle ORM: https://orm.drizzle.team