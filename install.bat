@echo off
title Prisma Backend Installation
color 0B

echo    PRISMA BACKEND INSTALLATION
echo.

echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Download Node.js from: https://nodejs.org/
    pause
    exit
) else (
    echo [OK] Node.js is installed
    node --version
)

echo.
echo [2/5] Checking PostgreSQL...
pg_isready -h localhost -p 5432 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] PostgreSQL is running
) else (
    echo [WARNING] PostgreSQL is not running
    echo Please start PostgreSQL via pgAdmin 4
    echo.
)

echo.
echo [3/5] Installing npm dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit
)

echo.
echo [4/5] Setting up environment...
if not exist ".env" (
    echo [*] Creating .env file...
    copy .env.example .env
    echo [OK] .env file created
    echo [!] IMPORTANT: Edit .env file with your PostgreSQL credentials
) else (
    echo [OK] .env file already exists
)

echo.
echo [5/5] Initializing database...
echo [*] Creating PostgreSQL tables...
call npm run db:init

if %errorlevel% neq 0 (
    echo [ERROR] Failed to initialize database
    echo Check your PostgreSQL credentials in .env
    pause
    exit
)

echo.
echo    The INSTALLATION AS BEEN COMPLETED
echo.
echo Next steps:
echo 1. Edit .env file with your PostgreSQL credentials
echo 2. Make sure PostgreSQL is running (pgAdmin 4)
echo 3. Run start.bat
echo.
echo To connect Fortnite, see LAUNCHER_SETUP.md
echo.

pause
