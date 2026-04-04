# Testing & Validation Guide

## Quick Start Testing

### 1. Start Development Environment
```bash
node start-dev.js
```
This will:
- Install dependencies
- Build the application
- Set up the database
- Start the development server

### 2. Run Authentication Tests
```bash
node test-auth-fixes.js
```
This tests:
- Checkout route protection
- Players route protection
- Rate limiting behavior

### 3. Run Full QA Validation
```bash
node qa-validation.js
```
This runs comprehensive tests for:
- Security (authentication)
- Rate limiting
- Branding
- Health checks

### 4. Pre-Deployment Checklist
```bash
node deployment-checklist.js
```
This verifies:
- Environment variables
- Build artifacts
- Security configuration

## Manual Testing Steps

### Authentication Testing
1. **Without Login:**
   - Visit `http://localhost:3000/api/billing/checkout` → Should return 401
   - Visit `http://localhost:3000/api/players` → Should return 401

2. **With Login:**
   - Login through the app
   - Try the same endpoints → Should work (if authorized)

### Rate Limiting Testing
1. Make several invalid API requests quickly
2. Should see validation errors (not rate limit errors)
3. After many requests, should see 429 rate limit error

### Stripe Integration Testing
1. Login as a user
2. Try to make a payment
3. Verify Stripe checkout works
4. Check webhook handling

### Branding Verification
1. Generate a poster → Should show "BILLIARDSLADDER"
2. Complete billing → Should show "Welcome to BilliardsLadder"

## Production Testing

### Before Deployment
```bash
# Run all checks
node deployment-checklist.js
node qa-validation.js

# Build for production
npm run build

# Test production build locally
cd server && npm start
```

### After Deployment
1. Test health endpoint: `GET /healthz`
2. Test authentication flow
3. Test payment processing
4. Verify webhooks are working
5. Check database connectivity

## Troubleshooting

### Common Issues

**Server won't start:**
- Check environment variables
- Verify database connection
- Check build artifacts exist

**Authentication fails:**
- Verify `SESSION_SECRET` is set
- Check Replit auth configuration
- Verify database has user records

**Rate limiting not working:**
- Check rate limiter configuration in `server/index.ts`
- Verify `skipFailedRequests: true` is set

**Stripe errors:**
- Verify price IDs are correct
- Check webhook secret
- Confirm Stripe keys are for correct environment

### Debug Commands
```bash
# Check environment variables
node -e "console.log(process.env)"

# Test database connection
node -e "require('dotenv').config(); const { Client } = require('pg'); const client = new Client(); client.connect().then(() => console.log('DB connected')).catch(console.error)"

# Check build
ls -la server/dist/
ls -la client/dist/
```