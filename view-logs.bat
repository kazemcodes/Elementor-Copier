@echo off
echo Opening Elementor Copier Debug Log...
echo.
set LOGFILE=C:\Users\PC\Local Sites\test\app\public\wp-content\elementor-copier-debug.log

if exist "%LOGFILE%" (
    echo Log file found!
    echo Opening in Notepad...
    notepad "%LOGFILE%"
) else (
    echo Log file not found at: %LOGFILE%
    echo.
    echo The log file will be created when you try to access wp-admin
    echo After accessing wp-admin, run this script again to view the logs
)

pause
