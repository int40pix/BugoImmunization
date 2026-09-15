@echo off
title Bugo Immunization - Database Restore Tool
echo =====================================================================
echo  Barangay Bugo Immunization Management System - Database Restore
echo =====================================================================
echo.
echo Restoring bugo_immunization database from bugo_immunization_schema.sql...
echo.

mysql -u root -e "CREATE DATABASE IF NOT EXISTS bugo_immunization CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root bugo_immunization < "%~dp0bugo_immunization_schema.sql"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Database restored successfully!
) else (
    echo.
    echo [ERROR] Database restore failed. Please verify MySQL service is running in XAMPP.
)
echo.
pause
