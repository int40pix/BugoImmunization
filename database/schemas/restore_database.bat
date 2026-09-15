@echo off
title Bugo Immunization - Database Restore Tool
echo =====================================================================
echo  Barangay Bugo Immunization Management System - Database Restore
echo =====================================================================
echo.

set MYSQL_BIN="C:\xampp\mysql\bin\mysql.exe"
if not exist %MYSQL_BIN% (
    set MYSQL_BIN=mysql
)

echo Using MySQL binary: %MYSQL_BIN%
echo Target Database: bugo
echo Restoring from: bugo_schema.sql...
echo.

%MYSQL_BIN% -u root -e "CREATE DATABASE IF NOT EXISTS bugo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
%MYSQL_BIN% -u root bugo < "%~dp0bugo_schema.sql"

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Database 'bugo' restored and seeded successfully!
) else (
    echo.
    echo [ERROR] Database restore failed. Please verify MySQL service is running in XAMPP.
)
echo.
pause
