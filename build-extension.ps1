# Build Elementor Copier Extension for Chrome Web Store

$ErrorActionPreference = "Stop"

Write-Host "Building Elementor Copier Extension..." -ForegroundColor Cyan

# Create build directory
$buildDir = "build"
if (Test-Path $buildDir) {
    Remove-Item -Recurse -Force $buildDir
}
New-Item -ItemType Directory -Path $buildDir | Out-Null

# Copy extension files
Write-Host "Copying extension files..." -ForegroundColor Yellow
Copy-Item -Path "chrome-extension\*" -Destination $buildDir -Recurse -Exclude "*.md","build-release.ps1"

# Get version from manifest.json
Write-Host "Reading version from manifest.json..." -ForegroundColor Yellow
$manifestPath = "chrome-extension\manifest.json"
$manifest = Get-Content -Path $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version
Write-Host "Version: $version" -ForegroundColor Cyan

# Create ZIP file
$zipName = "elementor-copier-v$version.zip"
$releasesDir = "releases"
$extractedDir = "$releasesDir\elementor-copier-v$version"

Write-Host "Creating ZIP file: $zipName..." -ForegroundColor Yellow

# Remove old ZIP if exists
if (Test-Path $zipName) {
    Remove-Item -Force $zipName
}

# Create ZIP
Compress-Archive -Path "$buildDir\*" -DestinationPath $zipName

# Cleanup build directory
Remove-Item -Recurse -Force $buildDir

# Ensure releases directory exists
if (-not (Test-Path $releasesDir)) {
    New-Item -ItemType Directory -Path $releasesDir | Out-Null
}

# Move ZIP to releases folder
Write-Host "Moving ZIP to releases folder..." -ForegroundColor Yellow
if (Test-Path "$releasesDir\$zipName") {
    Remove-Item -Force "$releasesDir\$zipName"
}
Move-Item -Path $zipName -Destination $releasesDir -Force

# Remove old extracted folder if exists
if (Test-Path $extractedDir) {
    Write-Host "Removing old extracted folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $extractedDir
}

# Extract ZIP to releases folder
Write-Host "Extracting ZIP to releases folder..." -ForegroundColor Yellow
Expand-Archive -Path "$releasesDir\$zipName" -DestinationPath $extractedDir -Force

Write-Host ""
Write-Host "Build complete!" -ForegroundColor Green
Write-Host "  ZIP: $releasesDir\$zipName" -ForegroundColor Cyan
Write-Host "  Extracted: $extractedDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ready for GitHub Release!" -ForegroundColor Green
Write-Host "Support: bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm" -ForegroundColor Magenta
