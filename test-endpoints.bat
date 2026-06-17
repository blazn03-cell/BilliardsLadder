@echo off
REM BilliardsLadder Authentication & Security Tests
REM Run this AFTER the server is started
REM
REM Prerequisites:
REM  1. Server running: cd server && npx tsx index.ts
REM  2. Wait for "Server running on port 5000"
REM  3. Run this script

echo.
echo ====================================
echo BilliardsLadder Security Tests
echo ====================================
echo.
echo IMPORTANT: Make sure server is running on http://localhost:5000
echo.

:: Test 1: Health Check
echo [TEST 1] Health Check
echo Testing: GET /healthz
curl -s -o NUL -w "Status Code: %%{http_code}\n" http://localhost:5000/healthz
echo Expected: 200
echo.

:: Test 2: Checkout Route - No Auth
echo [TEST 2] Checkout Route Without Authentication
echo Testing: POST /api/billing/checkout
curl -s -o NUL -w "Status Code: %%{http_code}\n" ^
  -X POST http://localhost:5000/api/billing/checkout ^
  -H "Content-Type: application/json" ^
  -d "{\"description\":\"test\"}"
echo Expected: 401 (Unauthorized)
echo.

:: Test 3: Players Route - No Auth (GET)
echo [TEST 3] Players Route Without Authentication (GET)
echo Testing: GET /api/players
curl -s -o NUL -w "Status Code: %%{http_code}\n" http://localhost:5000/api/players
echo Expected: 401 (Unauthorized)
echo.

:: Test 4: Players Route - No Auth (POST)
echo [TEST 4] Players Route Without Authentication (POST)
echo Testing: POST /api/players
curl -s -o NUL -w "Status Code: %%{http_code}\n" ^
  -X POST http://localhost:5000/api/players ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"test\"}"
echo Expected: 401 (Unauthorized)
echo.

:: Test 5: Rate Limiting (Invalid Requests)
echo [TEST 5] Rate Limiting with Invalid Requests
echo Making 3 quick requests to test rate limiting...
echo.
for /L %%i in (1,1,3) do (
    echo Request %%i:
    curl -s -o NUL -w "  Status Code: %%{http_code}\n" ^
      -X POST http://localhost:5000/api/players ^
      -H "Content-Type: application/json" ^
      -d "{\"invalid\":\"data\"}"
    timeout /t 1 /nobreak > nul
)
echo Expected: All should be 401 (NOT 429)
echo.

:: Test 6: Full Response Check
echo [TEST 6] Full Response - Checkout Route (showing body)
echo Testing: POST /api/billing/checkout with full response
curl -s -X POST http://localhost:5000/api/billing/checkout ^
  -H "Content-Type: application/json" ^
  -d "{\"description\":\"test\"}" ^
  -H "Content-Type: application/json"
echo.
echo Expected: Error message like "Unauthorized"
echo.

echo ====================================
echo TEST SUMMARY
echo ====================================
echo ✓ All endpoints should return 401 without authentication
echo ✓ No requests should return 429 (rate limit) for invalid data
echo ✓ Health check should return 200
echo.
pause