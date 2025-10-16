@echo off
echo ========================================
echo   Elementor Copier - Release Builder
echo ========================================
echo.

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%~dp0build-release.ps1"

pause
