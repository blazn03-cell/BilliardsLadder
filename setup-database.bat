@echo off
REM Database Setup Script
REM Creates all required tables for BilliardsLadder

echo.
echo ====================================
echo BilliardsLadder Database Setup
echo ====================================
echo.

echo [1] Validating database connection...
node validate-database.js

if errorlevel 1 (
    echo.
    echo ❌ Database validation failed!
    echo.
    echo Please fix the issues above and try again.
    pause
    exit /b 1
)

echo.
echo [2] Pushing database schema...
echo.

call npm run db:push

if errorlevel 1 (
    echo.
    echo ❌ Database push failed!
    echo.
    pause
    exit /b 1
)

echo.
echo [3] Verifying tables created...
node validate-database.js

if errorlevel 0 (
    echo.
    echo ✅ Database setup complete!
    echo.
    echo All required tables have been created successfully.
    echo.
)

pause