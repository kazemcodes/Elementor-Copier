# Elementor Copier - Release Build Script
# This script creates a production-ready ZIP file for Chrome Web Store submission

$ErrorActionPreference = "Stop"

# Configuration
$extensionName = "elementor-copier"
$version = "1.0.0"
$outputDir = "../releases"
$tempDir = "../temp-build"
$outputFile = "$extensionName-v$version.zip"
$zipPath = Join-Path $outputDir -ChildPath $outputFile

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Elementor Copier - Release Builder" -ForegroundColor Cyan
Write-Host "Version: $version" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create output directory if it doesn't exist
if (-not (Test-Path $outputDir)) {
    Write-Host "Creating releases directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Clean up temp directory if it exists
if (Test-Path $tempDir) {
    Write-Host "Cleaning up temp directory..." -ForegroundColor Yellow
    Remove-Item -Path $tempDir -Recurse -Force
}

# Create temp directory
Write-Host "Creating temporary build directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Files and directories to include in release
$includeItems = @(
    "manifest.json",
    "background.js",
    "content.js",
    "offscreen.js",
    "offscreen.html",
    "icons",
    "popup",
    "styles",
    "clipboard-manager.js",
    "content-sanitizer.js",
    "editor-injector.js",
    "elementor-editor-detector.js",
    "elementor-format-converter.js",
    "error-handler.js",
    "fallback-strategies.js",
    "media-url-handler.js",
    "notification-manager.js",
    "paste-interceptor.js",
    "verify-sanitization.js",
    "version-compatibility.js",
    "README.md"
)

# Copy extension files to temp directory
Write-Host ""
Write-Host "Copying extension files..." -ForegroundColor Green
foreach ($item in $includeItems) {
    $sourcePath = Join-Path "." -ChildPath $item
    $destPath = Join-Path $tempDir -ChildPath $item
    
    if (Test-Path $sourcePath) {
        if ((Test-Path $sourcePath -PathType Container)) {
            Write-Host "  - Copying directory: $item" -ForegroundColor Gray
            Copy-Item -Path $sourcePath -Destination $destPath -Recurse
        } else {
            Write-Host "  - Copying file: $item" -ForegroundColor Gray
            Copy-Item -Path $sourcePath -Destination $destPath
        }
    } else {
        Write-Host "  ! Warning: $item not found, skipping..." -ForegroundColor Yellow
    }
}

# Patterns to exclude from temp directory
$excludePatterns = @(
    "test-*.html",
    "test-*.js",
    "*.ps1",
    "*TEST*.md",
    "*GUIDE*.md",
    "*SUMMARY*.md",
    "*IMPLEMENTATION*.md",
    "*VERIFICATION*.md",
    "ICONS_NEEDED.md"
)

# Remove unnecessary files
Write-Host ""
Write-Host "Cleaning up unnecessary files..." -ForegroundColor Yellow
foreach ($pattern in $excludePatterns) {
    $filesToRemove = Get-ChildItem -Path $tempDir -Recurse -Filter $pattern -ErrorAction SilentlyContinue
    foreach ($file in $filesToRemove) {
        $relativePath = $file.FullName.Replace($tempDir, "")
        if ($file.Name -eq "README.md" -and $file.Directory.FullName -eq $tempDir) {
            Write-Host "  - Keeping: $relativePath" -ForegroundColor DarkGray
            continue
        }
        Write-Host "  - Removing: $relativePath" -ForegroundColor DarkGray
        Remove-Item -Path $file.FullName -Force
    }
}

# Verify required files exist
Write-Host ""
Write-Host "Verifying required files..." -ForegroundColor Green

$requiredFiles = @(
    "manifest.json",
    "background.js",
    "content.js",
    "popup/popup.html",
    "popup/popup.js",
    "popup/popup.css",
    "icons/icon16.png",
    "icons/icon48.png",
    "icons/icon128.png"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $tempDir -ChildPath $file
    if (Test-Path $filePath) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "ERROR: Some required files are missing!" -ForegroundColor Red
    Write-Host "Build aborted." -ForegroundColor Red
    Remove-Item -Path $tempDir -Recurse -Force
    exit 1
}

# Remove existing ZIP file if it exists
if (Test-Path $zipPath) {
    Write-Host ""
    Write-Host "  - Removing existing ZIP file..." -ForegroundColor Yellow
    Remove-Item -Path $zipPath -Force
}

# Create ZIP file using .NET compression
Write-Host ""
Write-Host "Creating release package..." -ForegroundColor Green
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath)

# Get file size
$fileSize = (Get-Item $zipPath).Length
$fileSizeKB = [Math]::Round($fileSize / 1KB, 2)
$fileSizeMB = [Math]::Round($fileSize / 1MB, 2)

# Clean up temp directory
Write-Host "  - Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item -Path $tempDir -Recurse -Force

# Success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Release package created successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Package Details:" -ForegroundColor Cyan
Write-Host "  Name:     $outputFile" -ForegroundColor White
Write-Host "  Version:  $version" -ForegroundColor White
Write-Host "  Size:     $fileSizeKB KB ($fileSizeMB MB)" -ForegroundColor White
Write-Host "  Location: $zipPath" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Test the extension by loading it unpacked in Chrome" -ForegroundColor White
Write-Host "  2. Upload to Chrome Web Store Developer Dashboard" -ForegroundColor White
Write-Host "  3. Fill in store listing details" -ForegroundColor White
Write-Host "  4. Submit for review" -ForegroundColor White
Write-Host ""
Write-Host "Chrome Web Store: https://chrome.google.com/webstore/devconsole" -ForegroundColor Gray
Write-Host ""
