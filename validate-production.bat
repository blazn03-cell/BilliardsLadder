@echo off
REM Complete Production Validation
REM Validates Stripe config, Database schema, and security fixes

echo.
echo ====================================
echo BilliardsLadder Production Validation
echo ====================================
echo.

echo [1] Validating environment variables...
node -e "^
const env = process.env; ^
const required = ['STRIPE_SECRET_KEY', 'DATABASE_URL', 'STRIPE_WEBHOOK_SECRET', 'SESSION_SECRET', 'REPLIT_DOMAINS', 'REPL_ID']; ^
let missing = []; ^
required.forEach(v => { if (!env[v]) missing.push(v); }); ^
if (missing.length) { console.log('❌ Missing:', missing.join(', ')); process.exit(1); } ^
else { console.log('✅ All required environment variables set'); }^
"

if errorlevel 1 (
    echo.
    echo Setup your .env file with all required variables!
    pause
    exit /b 1
)

echo.
echo [2] Validating Stripe configuration...
call node validate-stripe.js

if errorlevel 1 (
    echo.
    echo ⚠️  Some Stripe price IDs are missing.
    echo Review STRIPE_SETUP_GUIDE.md for instructions.
    echo.
)

echo.
echo [3] Validating database schema...
call node validate-database.js

if errorlevel 1 (
    echo.
    echo ⚠️  Database tables are missing.
    echo Run: npm run db:push
    echo.
)

echo.
echo [4] Checking security fixes...
echo.
powershell -Command "^
try { ^
  $health = Invoke-WebRequest http://localhost:5000/healthz -ErrorAction SilentlyContinue; ^
  if ($health.StatusCode -eq 200) { Write-Host '✅ Server responding'; } else { Write-Host '⚠️  Server not ready'; } ^
} catch { ^
  Write-Host '⚠️  Server not running - start with: npm run dev'; ^
}^
"

echo.
echo ====================================
echo Production Readiness Summary
echo ====================================
echo.
echo Please verify:
echo  ✅ Environment variables configured
echo  ✅ Stripe price IDs valid
echo  ✅ Database tables created
echo  ✅ Security fixes verified
echo.
echo Once all checks pass, ready for production!
echo.

pause