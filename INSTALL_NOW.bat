@echo off
echo ========================================
echo Web44AI Platform Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and install it.
    echo.
    pause
    exit /b 1
)

echo [1/4] Node.js found: 
node --version
echo.

echo [2/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [3/4] Seeding database with initial content...
call node scripts/seed-data.js
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database seeding had issues, but continuing...
)
echo.

echo [4/4] Setup complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Create admin user:
echo    node scripts/init-admin.js
echo.
echo 2. Start development server:
echo    npm run dev
echo.
echo 3. Open http://localhost:3000
echo.
echo ========================================
echo.
echo IMPORTANT: Update JWT_SECRET in .env.local
echo Generate one at: https://randomkeygen.com/
echo.
pause

