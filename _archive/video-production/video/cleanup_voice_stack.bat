@echo off
title IncidentZero Voice Stack Cleanup
echo ============================================================
echo   IncidentZero — Voice Stack Cleanup
echo ============================================================

rem 1. Remove video virtual environment
if exist "%~dp0.venv" (
    echo [*] Removing video/.venv...
    rmdir /s /q "%~dp0.venv"
)

rem 2. Purge pip cache
echo [*] Purging pip cache...
py -m pip cache purge >nul 2>&1

rem 3. Cleanup model cache folders if populated by this run
if exist "%USERPROFILE%\.cache\huggingface\hub\models--Qwen--*" (
    echo [*] Removing downloaded Qwen models from cache...
    rmdir /s /q "%USERPROFILE%\.cache\huggingface\hub\models--Qwen--*" >nul 2>&1
)
if exist "%~dp003_audio\models\piper" (
    echo [*] Removing downloaded Piper models...
    rmdir /s /q "%~dp003_audio\models\piper" >nul 2>&1
)

echo [*] Voice stack cleanup complete. Output WAVs and MP4s preserved.

