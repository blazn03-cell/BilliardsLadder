# Option 1: Manual Server Testing - Step by Step

## 🚀 Step 1: Build the Application

In your terminal:
```bash
npm run build
```

Wait for it to complete. This creates:
- `server/dist/index.js` (production-ready server)
- `client/dist/` (production-ready client)

**Status Check:**
- ✓ No errors
- ✓ Both directories created

---

## 🖥️ Step 2: Start the Development Server

Open a **NEW** terminal and run **FROM THE ROOT DIRECTORY**:

**Option A - Using npm script (Easiest):**
```bash
npm run dev
```

**Option B - Using tsx directly:**
```bash
npx tsx server/index.ts
```

**Wait for these messages:**
```
✓ Server running on port 5000
✓ Database connected
✓ Authentication initialized
```

**If you see errors:**
- Module not found error → Make sure you're in the ROOT directory, not the server folder
- Database connection error → Check `.env` DATABASE_URL
- Port already in use → Kill other process or restart
- Module errors → Run `npm install` first

---

## ✅ Step 3: Keep Server Running & Test in Another Terminal

**Open a SECOND terminal window** (keep the first one running with the server)

Then run:
```bash
cd c:\Users\USER\.gemini\antigravity\scratch\BilliardsLadder
test-endpoints.bat
```

This will automatically run all security tests.

---

## 🧪 Manual Testing (If batch script doesn't work)

Copy and paste these commands one at a time into PowerShell:

### Test 1: Health Check
```powershell
$response = Invoke-WebRequest http://localhost:5000/healthz -ErrorAction SilentlyContinue
Write-Host "Health Check: $($response.StatusCode)" -ForegroundColor Green
```
**Expected:** `200`

---

### Test 2: Checkout Route (Should be 401)
```powershell
try {
  $response = Invoke-WebRequest -Uri http://localhost:5000/api/billing/checkout `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"description":"test"}' `
    -ErrorAction Stop
} catch {
  Write-Host "Checkout Protection: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
}
```
**Expected:** `401` (Unauthorized)

---

### Test 3: Players Route (Should be 401)
```powershell
try {
  $response = Invoke-WebRequest http://localhost:5000/api/players -ErrorAction Stop
} catch {
  Write-Host "Players Route Protection: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
}
```
**Expected:** `401` (Unauthorized)

---

### Test 4: Rate Limiting (Multiple Invalid Requests)
```powershell
for ($i = 1; $i -le 3; $i++) {
  try {
    $response = Invoke-WebRequest -Uri http://localhost:5000/api/players `
      -Method POST `
      -ContentType "application/json" `
      -Body '{"invalid":"data"}' `
      -ErrorAction Stop
  } catch {
    Write-Host "Request $($i): $($_.Exception.Response.StatusCode)" -ForegroundColor Green
  }
  Start-Sleep -Milliseconds 200
}
```
**Expected:** All show `401` (NOT `429`)

---

## 📊 Expected Test Results

✅ **Pass Criteria:**
- Health check: `200`
- Checkout without auth: `401`
- Players without auth: `401`
- Rate limiting: `401` (not `429`)

❌ **Fail Indicators:**
- Checkout/Players return `200` → Auth not working
- Requests return `429` on first try → Rate limiting broken
- Health check fails → Server not running

---

## 🔍 What Each Test Verifies

| Test | What It Tests | Expected |
|------|---------------|----------|
| Health Check | Server is responding | 200 OK |
| Checkout Auth | Security fix #1 | 401 Unauthorized |
| Players Auth | Security fix #2 | 401 Unauthorized |
| Rate Limiting | Doesn't mask errors | 401 (not 429) |

---

## 🐛 Troubleshooting

### Server won't start
```
Error: Cannot find module...
```
**Fix:** Run `npm install` first

### Port already in use (5000)
```
Error: listen EADDRINUSE :::5000
```
**Fix:** Kill other Node processes or change PORT env var

### Database connection error
```
Error: connect ECONNREFUSED
```
**Fix:** Check `.env` DATABASE_URL is correct

### API returns 500 errors
Check server terminal for error messages and share them

---

## 📝 When Tests Are Done

Share the results:
1. Did health check return 200?
2. Did checkout return 401?
3. Did players return 401?
4. Did rate limiting tests show 401 (not 429)?

I'll verify everything passed and we can proceed to production deployment! 🎉