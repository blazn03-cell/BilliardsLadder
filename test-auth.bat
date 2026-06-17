@echo off
echo 🧪 Testing Authentication Fixes...
echo.

echo 1. Testing /api/billing/checkout without authentication...
curl -s -o /dev/null -w "   Status: %%{http_code}\n" http://localhost:5000/api/billing/checkout -X POST -H "Content-Type: application/json" -d "{\"description\":\"test\"}"
echo.

echo 2. Testing /api/players without authentication...
curl -s -o /dev/null -w "   Status: %%{http_code}\n" http://localhost:5000/api/players
echo.

echo 3. Testing rate limiting with invalid requests...
for /L %%i in (1,1,3) do (
    echo Request %%i:
    curl -s -o /dev/null -w "   Status: %%{http_code}\n" http://localhost:5000/api/players -X POST -H "Content-Type: application/json" -d "{\"invalid\":\"data\"}"
    timeout /t 1 /nobreak > nul
)
echo.

echo 4. Testing health check...
curl -s -o /dev/null -w "   Status: %%{http_code}\n" http://localhost:5000/healthz
echo.

echo 🏁 Authentication tests complete!