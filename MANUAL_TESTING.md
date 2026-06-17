# Manual Testing Guide

Since automated testing is blocked by PowerShell security policies, here's how to manually verify our fixes:

## Step 1: Start the Server

Run these commands in separate terminals:

**Terminal 1 - Server:**
```bash
cd server
npx tsx index.ts
```

**Terminal 2 - Client (optional):**
```bash
cd client
npm run dev
```

## Step 2: Test Authentication Security

### Test 1: Checkout Route Protection
```bash
# This should return 401 Unauthorized
curl -X POST http://localhost:5000/api/billing/checkout \
  -H "Content-Type: application/json" \
  -d '{"description":"test"}'
```

**Expected Result:** HTTP 401 (Unauthorized)

### Test 2: Players Route Protection
```bash
# This should return 401 Unauthorized
curl http://localhost:5000/api/players
```

**Expected Result:** HTTP 401 (Unauthorized)

### Test 3: Rate Limiting Behavior
```bash
# Make several invalid requests quickly
for i in {1..3}; do
  curl -X POST http://localhost:5000/api/players \
    -H "Content-Type: application/json" \
    -d '{"invalid":"data"}'
  sleep 0.2
done
```

**Expected Result:**
- First few requests: HTTP 401 (authentication error)
- Should NOT see HTTP 429 (rate limit error) because validation errors don't count

### Test 4: Health Check
```bash
# This should return 200 OK
curl http://localhost:5000/healthz
```

**Expected Result:** HTTP 200 with "ok"

## Step 3: Test With Authentication

1. **Login through the web interface** (http://localhost:3000)
2. **Get authentication token** from browser dev tools (check cookies/session)
3. **Test protected routes with authentication**

## Step 4: Verify Branding Changes

1. **Check poster generator** - should show "BILLIARDSLADDER" instead of "ActionLadder"
2. **Check billing success page** - should show "Welcome to BilliardsLadder"

## Step 5: Production Readiness

### Environment Variables Check
Verify these are set in `.env`:
- ✅ `STRIPE_SECRET_KEY` (production key for live deployment)
- ✅ `STRIPE_WEBHOOK_SECRET` (production webhook secret)
- ✅ `PLAYER_ROOKIE_MONTHLY_PRICE_ID` (production price ID)
- ✅ `PLAYER_STANDARD_MONTHLY_PRICE_ID` (production price ID)
- ✅ `PLAYER_PREMIUM_MONTHLY_PRICE_ID` (production price ID)
- ✅ `DATABASE_URL` (production database with SSL)
- ✅ `SESSION_SECRET` (secure random string)

### Build Check
```bash
npm run build
ls -la server/dist/
ls -la client/dist/
```

## Success Criteria

✅ **All Tests Pass:**
- Checkout route returns 401 without auth
- Players route returns 401 without auth
- Rate limiting allows validation errors
- Health check returns 200
- Branding updated to BilliardsLadder
- Environment variables configured
- Build artifacts exist

🎉 **Ready for Production Deployment!**