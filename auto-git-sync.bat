@echo off
REM Auto Git Sync - Batch Wrapper
REM Dùng để chạy PowerShell script trên Windows

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ========================================
echo   Quiz Auto Solver - Auto Git Sync
echo ========================================
echo.
echo Starting auto-commit & push service...
echo.

REM Chạy PowerShell script
powershell -NoProfile -ExecutionPolicy Bypass -File "auto-git-sync.ps1"

pause
