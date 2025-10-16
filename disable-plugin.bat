@echo off
echo Disabling Elementor Copier Plugin...
cd "C:\Users\PC\Local Sites\test\app\public\wp-content\plugins"
if exist "elementor-copier-v1.0.0" (
    ren "elementor-copier-v1.0.0" "elementor-copier-v1.0.0-DISABLED"
    echo Plugin disabled successfully!
    echo You can now access wp-admin
) else (
    echo Plugin folder not found or already disabled
)
pause
