@echo off
echo Checking for Node.js installation...
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [NOT INSTALLED] Node.js is not found on your system.
    echo.
    echo To install Node.js:
    echo 1. Visit: https://nodejs.org/
    echo 2. Download the LTS version (recommended)
    echo 3. Run the installer
    echo 4. Restart your computer
    echo 5. Run this script again to verify
    echo.
    echo After installation, you can run INSTALL_ALL.bat
    pause
    exit /b 1
) else (
    echo [INSTALLED] Node.js is found!
    echo.
    echo Node.js version:
    node --version
    echo.
    echo npm version:
    npm --version
    echo.
    echo You can now run INSTALL_ALL.bat to install the platform!
    echo.
    pause
)

