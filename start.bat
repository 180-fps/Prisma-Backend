@echo off
title Prisma Backend - Fortnite 15.00
color 0A

echo    PRISMA BACKEND 
echo.

echo [1/3] Checking PostgreSQL...
pg_isready -h localhost -p 5432 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL is running
) else (
    echo [!] PostgreSQL is not running
    echo [*] Please start PostgreSQL via pgAdmin 4
    echo.
    pause
    exit
)

echo.
echo [2/3] Checking dependencies...
if not exist "node_modules\" (
    echo [!] Installing dependencies...
    call npm install
) else (
    echo [OK] Dependencies installed
)

echo.
echo [3/3] Starting backend...
echo.
echo    BACKEND READY
echo    Port: 3551
echo    XMPP: 5222
echo    Database: PostgreSQL
echo.

node index.js

pause
