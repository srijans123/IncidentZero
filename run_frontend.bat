@echo off
title Incident-Zero Frontend (React 19 + Vite :3000)
cd /d "%~dp0frontend"

echo ============================================================
echo   Incident-Zero Frontend (React 19 + Vite + Tailwind)
echo ============================================================

if not exist node_modules (
    echo [1/2] Installing frontend dependencies...
    call npm install
)

echo [2/2] Launching Vite Dev Server on http://localhost:3000...
echo.
call npm run dev
pause
