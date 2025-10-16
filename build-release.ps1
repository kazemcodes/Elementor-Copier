# Elementor Copier Extension - Build Release Script
# This script creates a clean release build in the 'release' folder

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Elementor Copier - Release Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean release folder
Write-Host "[1/4] Cleaning release folder..." -ForegroundColor Yellow
if (Test-Path "release") {
    Remove-Item "release" -Recurse -Force
    Write-Host "  [OK] Removed old release folder" -ForegroundColor Green
}
New-Item -ItemType Directory -Path "release" | Out-Null
Write-Host "  [OK] Created new release folder" -ForegroundColor Green
Write-Host ""

# Step 2: Copy core files
Write-Host "[2/4] Copying core files..." -ForegroundColor Yellow
$coreFiles = @(
    "manifest.json",
    "background.js",
    "content-v2.js",
    "offscreen.js",
    "offscreen.html",
    "page-bridge.js"
)

foreach ($file in $coreFiles) {
    $sourcePath = "chrome-extension/$file"
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath "release/$file"
        Write-Host "  [OK] Copied $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
    }
}
Write-Host ""

# Step 3: Copy module files
Write-Host "[3/4] Copying module files..." -ForegroundColor Yellow
$moduleFiles = @(
    "elementor-format-converter.js",
    "elementor-editor-detector.js",
    "clipboard-manager.js",
    "paste-interceptor.js",
    "editor-injector.js",
    "media-url-handler.js",
    "version-compatibility.js",
    "content-sanitizer.js",
    "notification-manager.js",
    "error-handler.js"
)

foreach ($file in $moduleFiles) {
    $sourcePath = "chrome-extension/$file"
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath "release/$file"
        Write-Host "  [OK] Copied $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
    }
}
Write-Host ""

# Step 4: Copy directories
Write-Host "[4/4] Copying directories..." -ForegroundColor Yellow
$directories = @("icons", "popup", "styles")

foreach ($dir in $directories) {
    $sourcePath = "chrome-extension/$dir"
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath "release/$dir" -Recurse -Force
        $fileCount = (Get-ChildItem "release/$dir" -Recurse -File).Count
        Write-Host "  [OK] Copied $dir ($fileCount files)" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $dir" -ForegroundColor Red
    }
}
Write-Host ""

# Create README
Write-Host "Creating README..." -ForegroundColor Yellow
$readmeContent = @"
# Elementor Copier Extension - Release Build

## Installation Instructions

### Step 1: Load the Extension

1. Open Chrome and go to: ``chrome://extensions``
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select this ``release`` folder
5. The extension should now appear in your extensions list

### Step 2: Verify Installation

You should see:
- Extension name: "Elementor Copier"
- Version: 1.0.0
- No errors displayed
- Extension icon in your browser toolbar

### Step 3: Test Copy Function

1. Go to any WordPress site with Elementor
2. Right-click on any Elementor widget
3. Select "Copy Widget" from the context menu
4. You should see a success message

### Step 4: Test Paste Function

1. Go to YOUR WordPress site
2. Open a page in Elementor editor
3. Click on a section or column
4. Press **Ctrl+V** (or Cmd+V on Mac)
5. The widget should appear!

## Console Messages

Open browser console (F12) and look for:

``````
🚀 [v2.0] Content script starting...
🔧 [v2.0] About to inject critical classes...
[Inline] Injection script added to HEAD
[Inline] ElementorEditorDetector injected
[Inline] EditorContextInjector injected
✨ [v2.0] Elementor Copier: Content script loaded - NEW VERSION
``````

## Features

- Copy widgets, sections, columns, and pages
- Paste directly into Elementor editor (no plugin needed)
- Preserves all settings and styles
- Handles media URLs automatically
- Version compatibility (Elementor 2.x, 3.x, 4.x)
- Content sanitization for security

## Requirements

- Chrome 109+ (or Edge, Brave)
- WordPress with Elementor plugin
- Clipboard permissions

## Version

**Version**: 1.0.0 (v2.0 internal)
**Release Date**: $(Get-Date -Format "MMMM dd, yyyy")
"@

Set-Content -Path "release/README.md" -Value $readmeContent
Write-Host "  [OK] Created README.md" -ForegroundColor Green
Write-Host ""

# Verify build
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalFiles = (Get-ChildItem "release" -Recurse -File).Count
$totalSize = [math]::Round(((Get-ChildItem "release" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1KB), 2)

Write-Host "Total files: $totalFiles" -ForegroundColor Cyan
Write-Host "Total size: $totalSize KB" -ForegroundColor Cyan
Write-Host ""

# Check critical files
Write-Host "Critical files check:" -ForegroundColor Yellow
$criticalFiles = @(
    "manifest.json",
    "content-v2.js",
    "background.js",
    "offscreen.js"
)

$allPresent = $true
foreach ($file in $criticalFiles) {
    if (Test-Path "release/$file") {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
        $allPresent = $false
    }
}
Write-Host ""

# Final status
Write-Host "========================================" -ForegroundColor Cyan
if ($allPresent) {
    Write-Host "  BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Go to chrome://extensions" -ForegroundColor White
    Write-Host "  2. Remove any old 'Elementor Copier' extensions" -ForegroundColor White
    Write-Host "  3. Click 'Load unpacked'" -ForegroundColor White
    Write-Host "  4. Select the 'release' folder" -ForegroundColor White
    Write-Host "  5. Test in Elementor editor" -ForegroundColor White
    Write-Host ""
    Write-Host "Release folder: $(Resolve-Path 'release')" -ForegroundColor Cyan
} else {
    Write-Host "  BUILD COMPLETED WITH WARNINGS" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Some files are missing. Check the errors above." -ForegroundColor Red
}
Write-Host ""
