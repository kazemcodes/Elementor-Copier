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

# Create ZIP file
$version = "1.0.0"
$zipName = "elementor-copier-v$version.zip"
Write-Host "Creating ZIP file: $zipName..." -ForegroundColor Yellow

if (Test-Path $zipName) {
    Remove-Item -Force $zipName
}

Compress-Archive -Path "$buildDir\*" -DestinationPath $zipName

# Cleanup
Remove-Item -Recurse -Force $buildDir

Write-Host "Build complete: $zipName" -ForegroundColor Green
Write-Host ""
Write-Host "Ready for Chrome Web Store submission!" -ForegroundColor Cyan
Write-Host "Support: bc1qwncc5gfrzt0hwhwt9ad9vyv6eg8gxk4wlg6atm" -ForegroundColor Magenta
