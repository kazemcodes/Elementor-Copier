# Verify Release Package

Write-Host "Verifying Elementor Copier Release..." -ForegroundColor Cyan

$zipPath = "releases/elementor-copier-v1.0.0.zip"

if (-not (Test-Path $zipPath)) {
    Write-Host "ERROR: Release ZIP not found!" -ForegroundColor Red
    exit 1
}

# Extract to temp
$tempDir = "temp-verify"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}

Expand-Archive -Path $zipPath -DestinationPath $tempDir

Write-Host "`nChecking required files..." -ForegroundColor Yellow

$requiredFiles = @(
    "manifest.json",
    "background.js",
    "content-v2.js",
    "offscreen.html",
    "offscreen.js",
    "icons/icon16.png",
    "icons/icon48.png",
    "icons/icon128.png",
    "popup/popup.html"
)

$allGood = $true

foreach ($file in $requiredFiles) {
    $fullPath = Join-Path $tempDir $file
    if (Test-Path $fullPath) {
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        Write-Host "  MISSING: $file" -ForegroundColor Red
        $allGood = $false
    }
}

# Check manifest
$manifestPath = Join-Path $tempDir "manifest.json"
$manifest = Get-Content $manifestPath | ConvertFrom-Json

Write-Host "`nManifest Info:" -ForegroundColor Yellow
Write-Host "  Name: $($manifest.name)"
Write-Host "  Version: $($manifest.version)"
Write-Host "  Manifest Version: $($manifest.manifest_version)"

# Cleanup
Remove-Item -Recurse -Force $tempDir

if ($allGood) {
    Write-Host "`nRelease package is VALID!" -ForegroundColor Green
    Write-Host "Ready for installation and Chrome Web Store submission!" -ForegroundColor Cyan
} else {
    Write-Host "`nRelease package has ERRORS!" -ForegroundColor Red
    exit 1
}
