@echo off
echo ========================================
echo Web44AI - Quick Installation
echo ========================================
echo.

REM Refresh PATH
call refreshenv >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    REM Try to add Node.js to PATH manually
    if exist "C:\Program Files\nodejs" (
        set "PATH=%PATH%;C:\Program Files\nodejs"
    )
    if exist "%LOCALAPPDATA%\Programs\nodejs" (
        set "PATH=%PATH%;%LOCALAPPDATA%\Programs\nodejs"
    )
)

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found in PATH
    echo.
    echo Please:
    echo 1. Close this window
    echo 2. Open a NEW Command Prompt or PowerShell
    echo 3. Run this script again
    echo.
    echo OR restart your computer after installing Node.js
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found:
node --version
npm --version
echo.

echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Installation failed
    pause
    exit /b 1
)

echo.
echo [OK] Dependencies installed!
echo.
echo Next: Run node scripts/seed-data.js
pause

