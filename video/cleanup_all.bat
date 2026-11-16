@echo off
title IncidentZero Complete Video Toolchain Cleanup
echo ============================================================
echo   IncidentZero — Complete Video Toolchain Cleanup
echo ============================================================

rem 1. Run voice stack cleanup
call "%~dp0cleanup_voice_stack.bat"

rem 2. Remove Remotion node_modules
if exist "%~dp007_remotion\node_modules" (
    echo [*] Removing Remotion node_modules...
    rmdir /s /q "%~dp007_remotion\node_modules"
)

rem 3. Remove ffprobe copied binary if requested
if exist "%USERPROFILE%\.local\bin\ffprobe.exe" (
    echo [*] Removing ffprobe from .local/bin...
    del /f /q "%USERPROFILE%\.local\bin\ffprobe.exe" >nul 2>&1
)

echo [*] Complete video toolchain cleanup complete.

