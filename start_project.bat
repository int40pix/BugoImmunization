@echo off
title Bugo Immunization System - Capstone Runner
echo =====================================================================
echo  Barangay Bugo Immunization Management System - Capstone Development
echo =====================================================================
echo.

:: 1. Check & install backend vendor dependencies if missing (first-time pull)
if not exist "%~dp0backend\vendor\" (
    echo [.Setup Notice] backend\vendor not found. Installing PHP packages (composer install)...
    cd /d "%~dp0backend" && composer install
    cd /d "%~dp0"
    echo.
)

:: 2. Check & create backend .env with application key if missing
if not exist "%~dp0backend\.env" (
    echo [.env Notice] backend\.env not found. Creating from .env.example...
    copy "%~dp0backend\.env.example" "%~dp0backend\.env" >nul
    echo [.env Notice] Generating application encryption key...
    cd /d "%~dp0backend" && php artisan key:generate
    cd /d "%~dp0"
    echo [.env Notice] backend\.env created and initialized successfully!
    echo.
)

:: 3. Check & install frontend node_modules if missing (first-time pull)
if not exist "%~dp0frontend\node_modules\" (
    echo [.Setup Notice] frontend\node_modules not found. Installing Node packages (npm install)...
    cd /d "%~dp0frontend" && npm install
    cd /d "%~dp0"
    echo.
)

echo Starting Backend (Laravel) and Frontend (Vite) concurrently...
echo.

start "Bugo Backend" cmd /k "cd /d %~dp0backend && php artisan serve --port=8000"
start "Bugo Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo =====================================================================
echo  Servers successfully launched!
echo =====================================================================
echo.
echo  👉 OPEN YOUR BROWSER AT: http://127.0.0.1:8000
echo.
echo  (Vite hot-reload asset server is running in background on :5173)
echo  Note: Ensure XAMPP MySQL is running with the 'bugo' database imported.
echo =====================================================================
echo.
pause
