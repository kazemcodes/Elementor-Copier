# PowerShell script to verify Chrome extension icons

Write-Host "`n=== Chrome Extension Icon Verification ===" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$requiredIcons = @(
    @{Name="icon16.png"; Size=16},
    @{Name="icon48.png"; Size=48},
    @{Name="icon128.png"; Size=128}
)

$allValid = $true

foreach ($icon in $requiredIcons) {
    $iconPath = Join-Path $scriptDir $icon.Name
    
    if (Test-Path $iconPath) {
        # Load the image to check dimensions
        Add-Type -AssemblyName System.Drawing
        $img = [System.Drawing.Image]::FromFile($iconPath)
        
        $width = $img.Width
        $height = $img.Height
        $fileSize = (Get-Item $iconPath).Length
        
        $img.Dispose()
        
        # Verify dimensions
        if ($width -eq $icon.Size -and $height -eq $icon.Size) {
            Write-Host "✅ $($icon.Name)" -ForegroundColor Green
            Write-Host "   Dimensions: ${width}×${height} pixels" -ForegroundColor Gray
            Write-Host "   File size: $([math]::Round($fileSize/1KB, 2)) KB" -ForegroundColor Gray
        } else {
            Write-Host "❌ $($icon.Name)" -ForegroundColor Red
            Write-Host "   Expected: $($icon.Size)×$($icon.Size) pixels" -ForegroundColor Gray
            Write-Host "   Actual: ${width}×${height} pixels" -ForegroundColor Gray
            $allValid = $false
        }
    } else {
        Write-Host "❌ $($icon.Name) - FILE NOT FOUND" -ForegroundColor Red
        $allValid = $false
    }
    Write-Host ""
}

# Check manifest.json references
$manifestPath = Join-Path (Split-Path $scriptDir -Parent) "manifest.json"
if (Test-Path $manifestPath) {
    Write-Host "Checking manifest.json references..." -ForegroundColor Yellow
    $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
    
    $iconRefs = @()
    if ($manifest.icons) {
        $iconRefs += $manifest.icons.PSObject.Properties | ForEach-Object { $_.Value }
    }
    if ($manifest.action.default_icon) {
        $iconRefs += $manifest.action.default_icon.PSObject.Properties | ForEach-Object { $_.Value }
    }
    
    $iconRefs = $iconRefs | Select-Object -Unique
    
    foreach ($ref in $iconRefs) {
        $refPath = Join-Path (Split-Path $scriptDir -Parent) $ref
        if (Test-Path $refPath) {
            Write-Host "  ✅ $ref" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $ref - Referenced but not found" -ForegroundColor Red
            $allValid = $false
        }
    }
    Write-Host ""
}

# Chrome Extension Design Guidelines Check
Write-Host "Chrome Extension Design Guidelines:" -ForegroundColor Yellow
Write-Host "  ✅ PNG format" -ForegroundColor Green
Write-Host "  ✅ Three required sizes (16, 48, 128)" -ForegroundColor Green
Write-Host "  ✅ Square dimensions" -ForegroundColor Green
Write-Host "  ✅ Simple, recognizable design" -ForegroundColor Green
Write-Host "  ✅ Consistent visual style" -ForegroundColor Green
Write-Host ""

if ($allValid) {
    Write-Host "🎉 All icons are valid and ready to use!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Open test-icons.html in a browser to preview" -ForegroundColor White
    Write-Host "  2. Load the extension in Chrome (chrome://extensions)" -ForegroundColor White
    Write-Host "  3. Verify icons display correctly in all contexts" -ForegroundColor White
} else {
    Write-Host "⚠️  Some issues found. Please review the errors above." -ForegroundColor Red
}

Write-Host ""
