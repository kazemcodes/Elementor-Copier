# Disable Elementor Copier Plugin
Write-Host "Disabling Elementor Copier Plugin..." -ForegroundColor Yellow

$pluginPath = "C:\Users\PC\Local Sites\test\app\public\wp-content\plugins\elementor-copier-v1.0.0"
$disabledPath = "C:\Users\PC\Local Sites\test\app\public\wp-content\plugins\elementor-copier-v1.0.0-DISABLED"

if (Test-Path $pluginPath) {
    Rename-Item -Path $pluginPath -NewName "elementor-copier-v1.0.0-DISABLED"
    Write-Host "✓ Plugin disabled successfully!" -ForegroundColor Green
    Write-Host "You can now access wp-admin" -ForegroundColor Green
} else {
    Write-Host "Plugin folder not found or already disabled" -ForegroundColor Red
}

Read-Host "Press Enter to exit"
