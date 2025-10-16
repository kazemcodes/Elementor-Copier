# PowerShell script to generate Chrome extension icons
# This script creates PNG icons using .NET System.Drawing

Write-Host "Generating Chrome Extension Icons..." -ForegroundColor Cyan

# Load System.Drawing assembly
Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param(
        [int]$size,
        [string]$outputPath
    )
    
    # Create bitmap
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Enable anti-aliasing for smooth edges
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Background gradient (Elementor purple to pink)
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $color1 = [System.Drawing.Color]::FromArgb(255, 102, 126, 234)  # Purple #667eea
    $color2 = [System.Drawing.Color]::FromArgb(255, 146, 0, 59)     # Pink #92003B
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $color1, $color2, 45)
    
    # Draw rounded rectangle background
    $radius = [Math]::Max(2, [int]($size / 8))
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    
    $diameter = $radius * 2
    $path.AddArc(0, 0, $diameter, $diameter, 180, 90)
    $path.AddArc($size - $diameter, 0, $diameter, $diameter, 270, 90)
    $path.AddArc($size - $diameter, $size - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc(0, $size - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    
    $graphics.FillPath($brush, $path)
    
    # Draw copy icon symbol (two overlapping squares)
    $penWidth = [Math]::Max(1, [int]($size / 16))
    $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, $penWidth)
    $whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    
    $margin = [int]($size * 0.25)
    $squareSize = [int]($size * 0.35)
    $offset = [int]($size * 0.1)
    
    # Back square
    $backX = $margin + $offset
    $backY = $margin + $offset
    $graphics.DrawRectangle($whitePen, $backX, $backY, $squareSize, $squareSize)
    
    # Front square (filled)
    $frontX = $margin
    $frontY = $margin
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $graphics.FillRectangle($whiteBrush, $frontX, $frontY, $squareSize, $squareSize)
    
    # Add a small "E" for Elementor on larger icons
    if ($size -ge 48) {
        $fontSize = [Math]::Max(8, [int]($size / 8))
        $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
        $textColor = [System.Drawing.Color]::FromArgb(255, 102, 126, 234)
        $textBrush = New-Object System.Drawing.SolidBrush($textColor)
        $text = "E"
        $textSize = $graphics.MeasureString($text, $font)
        $textX = $frontX + ($squareSize - $textSize.Width) / 2
        $textY = $frontY + ($squareSize - $textSize.Height) / 2
        $graphics.DrawString($text, $font, $textBrush, $textX, $textY)
        $font.Dispose()
        $textBrush.Dispose()
    }
    
    # Save the image
    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $graphics.Dispose()
    $bitmap.Dispose()
    $brush.Dispose()
    $whitePen.Dispose()
    $whiteBrush.Dispose()
    $path.Dispose()
    
    Write-Host "Created: $outputPath ($size x $size)" -ForegroundColor Green
}

# Generate all icon sizes
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sizes = @(16, 48, 128)

foreach ($size in $sizes) {
    $outputPath = Join-Path $scriptDir "icon$size.png"
    try {
        Create-Icon -size $size -outputPath $outputPath
    }
    catch {
        Write-Host "Error creating icon$size.png: $_" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`nIcon generation complete!" -ForegroundColor Cyan
Write-Host "Generated files:" -ForegroundColor Yellow
Get-ChildItem -Path $scriptDir -Filter "icon*.png" | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor White
}
