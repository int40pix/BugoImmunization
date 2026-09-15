@echo off
title Bugo Immunization System - Capstone Runner
echo =====================================================================
echo  Barangay Bugo Immunization Management System - Capstone Development
echo =====================================================================
echo.
echo Starting Backend (Laravel) and Frontend (Vite) concurrently...
echo.

start "Bugo Backend" cmd /k "cd /d %~dp0backend && php artisan serve --port=8000"
start "Bugo Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Servers launched!
echo - Backend API: http://127.0.0.1:8000
echo - Frontend SPA: http://127.0.0.1:5173
echo.
pause
