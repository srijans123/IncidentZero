@echo off
title Incident-Zero Private GitHub Version Uploader
cd /d "%~dp0\.."
echo ============================================================
echo   Incident-Zero: Uploading New Version to Private GitHub...
echo ============================================================
set /p COMMIT_MSG="Enter brief change note (or press Enter for auto-sync): "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Manual one-click team update
bash upload/update_github.sh "%COMMIT_MSG%"
echo.
pause
