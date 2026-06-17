# Production Environment Setup Guide

## Environment Variables for Production

Copy your `.env` file to production and update these values:

### Required Production Variables
```bash
# Stripe (Production Keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database (Production)
DATABASE_URL=postgresql://user:pass@prod-host:5432/dbname?sslmode=require

# Authentication
SESSION_SECRET=your-secure-random-session-secret-here

# Operator Subscription Prices (Production)
SMALL_PRICE_ID=price_live_...
MEDIUM_PRICE_ID=price_live_...
LARGE_PRICE_ID=price_live_...
MEGA_PRICE_ID=price_live_...

# Player Subscription Prices (Production)
PLAYER_ROOKIE_MONTHLY_PRICE_ID=price_live_...
PLAYER_STANDARD_MONTHLY_PRICE_ID=price_live_...
PLAYER_PREMIUM_MONTHLY_PRICE_ID=price_live_...

# Replit Auth (Production Domain)
REPLIT_DOMAINS=yourdomain.com
REPL_ID=your-production-repl-id
```

## Production Deployment Steps

### 1. Database Setup
```bash
# Push schema to production database
npm run db:push
```

### 2. Build Application
```bash
# Build both client and server
npm run build
```

### 3. Start Production Server
```bash
# Start the server
cd server && npm start
```

### 4. Verify Deployment
- Health check: `GET /healthz` should return "ok"
- Authentication: Test login flow
- Payments: Test checkout with real Stripe keys
- Webhooks: Verify Stripe webhooks are received

## Security Checklist

- [ ] All environment variables set with production values
- [ ] Database connection uses SSL (`sslmode=require`)
- [ ] Session secret is long and random
- [ ] Stripe webhook secret is set
- [ ] No test keys in production
- [ ] Rate limiting is configured appropriately
- [ ] Authentication middleware is active on all protected routes