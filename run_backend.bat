@echo off
title Incident-Zero Backend (Spring Boot :8080)
cd /d "%~dp0"

echo ============================================================
echo   Incident-Zero Backend (Spring Boot 3.5.3 + Java 22)
echo ============================================================

rem 1. Load .env variables
if exist .env (
    echo [1/3] Loading configuration from .env...
    for /f "usebackq tokens=1* delims==" %%A in (`findstr /v "^#" .env ^| findstr /r "^[A-Za-z_]"`) do (
        set "%%A=%%B"
    )
) else (
    echo [WARNING] .env file not found in root!
)

rem 2. Configure Java 22 / JDK
if "%JAVA_HOME%"=="" (
    if exist "C:\Users\Srijan Shukla\.jdks\corretto-22.0.2" (
        set "JAVA_HOME=C:\Users\Srijan Shukla\.jdks\corretto-22.0.2"
    )
)
if exist "%JAVA_HOME%\bin" (
    set "PATH=%JAVA_HOME%\bin;%PATH%"
)

rem 3. Detect Maven
set "MVN_CMD=mvn"
if exist "%~dp0tools\apache-maven-3.9.9\bin\mvn.cmd" (
    set "MVN_CMD=%~dp0tools\apache-maven-3.9.9\bin\mvn.cmd"
)

echo [2/3] Java Home: %JAVA_HOME%
echo [3/3] Starting Spring Boot on http://localhost:8080...
echo.

cd backend
"%MVN_CMD%" spring-boot:run
pause
