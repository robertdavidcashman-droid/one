@echo off
echo ========================================
echo Web44AI Platform - Complete Installation
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Go to: https://nodejs.org/
    echo 2. Download the LTS version
    echo 3. Install it
    echo 4. Restart this script
    echo.
    echo After installing Node.js, run this script again.
    pause
    exit /b 1
)

echo [OK] Node.js found:
node --version
npm --version
echo.

echo ========================================
echo Step 1: Installing Dependencies
echo ========================================
echo This may take a few minutes...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo ========================================
echo Step 2: Setting up Environment
echo ========================================
if not exist .env.local (
    echo Creating .env.local file...
    (
        echo # Environment Variables for Web44AI Platform
        echo JWT_SECRET=change-this-to-a-strong-random-secret-key-in-production
        echo NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ) > .env.local
    echo [OK] .env.local created
    echo.
    echo [IMPORTANT] Please edit .env.local and set a strong JWT_SECRET
    echo Generate one at: https://randomkeygen.com/
    echo.
    timeout /t 5
) else (
    echo [OK] .env.local already exists
)
echo.

echo ========================================
echo Step 3: Seeding Database
echo ========================================
echo Adding police stations and services...
call node scripts/seed-data.js
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Database seeding had issues, but continuing...
) else (
    echo [OK] Database seeded successfully
)
echo.

echo ========================================
echo Step 4: Creating Admin User
echo ========================================
echo You will now be prompted to create an admin user.
echo.
call node scripts/init-admin.js
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Admin user creation had issues
    echo You can create it later by running: node scripts/init-admin.js
) else (
    echo [OK] Admin user created
)
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env.local and set a strong JWT_SECRET
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo.
echo Or double-click START.bat to start the server
echo.
pause

