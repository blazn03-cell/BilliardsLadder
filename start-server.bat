@echo off
REM Kill any process using port 5000 and start the server

echo.
echo ====================================
echo BilliardsLadder Server Startup
echo ====================================
echo.

REM Find process using port 5000
echo [1] Checking for process on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Found process ID: %%a
    echo Killing process %%a...
    taskkill /PID %%a /F
)

echo.
echo [2] Starting server...
echo.

cd /d C:\Users\USER\.gemini\antigravity\scratch\BilliardsLadder
npx cross-env NODE_ENV=development tsx server/index.ts

pause