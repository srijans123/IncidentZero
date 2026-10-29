@echo off
title Incident-Zero (I-ITSM) Master Launcher
cd /d "%~dp0"

echo ============================================================
echo   Incident-Zero (I-ITSM v2.2) — Launching Application
echo ============================================================
echo.
echo [1/2] Starting Spring Boot Backend on http://localhost:8080...
start "Incident-Zero Backend (Port 8080)" cmd /k run_backend.bat

echo [2/2] Starting React 19 Frontend on http://localhost:3000...
start "Incident-Zero Frontend (Port 3000)" cmd /k run_frontend.bat

echo.
echo ============================================================
echo   Application servers are launching!
echo   - Backend:  http://localhost:8080
echo   - Frontend: http://localhost:3000
echo.
echo   Waiting for servers to initialize...
echo   Opening http://localhost:3000 in your browser...
echo ============================================================
timeout /t 6 >nul
start http://localhost:3000
