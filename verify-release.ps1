# Verify Release Package

Write-Host "Verifying Elementor Copier Release..." -ForegroundColor Cyan

$version = "1.0.0"
$zipPath = "releases/elementor-copier-v$version.zip"
$extractedDir = "releases/elementor-copier-v$version"

if (-not (Test-Path $zipPath)) {
    Write-Host "ERROR: Release ZIP not found at $zipPath!" -ForegroundColor Red
    exit 1
}

# Use the already extracted folder from build script
$tempDir = $extractedDir

if (-not (Test-Path $tempDir)) {
    Write-Host "ERROR: Extracted folder not found at $tempDir!" -ForegroundColor Red
    Write-Host "Run build-extension.ps1 first to create the release." -ForegroundColor Yellow
    exit 1
}

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

if ($allGood) {
    Write-Host "`nRelease package is VALID!" -ForegroundColor Green
    Write-Host "  ZIP: $zipPath" -ForegroundColor Cyan
    Write-Host "  Extracted: $extractedDir" -ForegroundColor Cyan
    Write-Host "`nReady for installation and Chrome Web Store submission!" -ForegroundColor Green
} else {
    Write-Host "`nRelease package has ERRORS!" -ForegroundColor Red
    exit 1
}
