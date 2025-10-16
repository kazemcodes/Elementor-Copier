# PowerShell script to compile PO to MO file
# This creates a binary MO file from the Persian PO file

Write-Host "=== Elementor Copier Translation Compiler ===" -ForegroundColor Cyan
Write-Host ""

$poFile = Join-Path $PSScriptRoot "languages\elementor-copier-fa_IR.po"
$moFile = Join-Path $PSScriptRoot "languages\elementor-copier-fa_IR.mo"

if (-not (Test-Path $poFile)) {
    Write-Host "Error: PO file not found: $poFile" -ForegroundColor Red
    exit 1
}

Write-Host "Reading PO file: $poFile" -ForegroundColor Yellow

# Read and parse PO file
$content = Get-Content $poFile -Raw -Encoding UTF8
$lines = $content -split "`n"

$translations = @{}
$currentMsgid = ""
$currentMsgstr = ""
$inMsgid = $false
$inMsgstr = $false

foreach ($line in $lines) {
    $line = $line.Trim()
    
    # Skip comments and empty lines
    if ($line -eq "" -or $line.StartsWith("#")) {
        if ($currentMsgid -ne "" -and $currentMsgstr -ne "") {
            $translations[$currentMsgid] = $currentMsgstr
        }
        $currentMsgid = ""
        $currentMsgstr = ""
        $inMsgid = $false
        $inMsgstr = $false
        continue
    }
    
    # Check for msgid
    if ($line.StartsWith("msgid ")) {
        if ($currentMsgid -ne "" -and $currentMsgstr -ne "") {
            $translations[$currentMsgid] = $currentMsgstr
        }
        $currentMsgid = $line -replace 'msgid\s+"(.*)"', '$1'
        $currentMsgid = $currentMsgid -replace '\\n', "`n"
        $currentMsgid = $currentMsgid -replace '\\t', "`t"
        $currentMsgid = $currentMsgid -replace '\\"', '"'
        $currentMsgid = $currentMsgid -replace '\\\\', '\'
        $currentMsgstr = ""
        $inMsgid = $true
        $inMsgstr = $false
        continue
    }
    
    # Check for msgstr
    if ($line.StartsWith("msgstr ")) {
        $currentMsgstr = $line -replace 'msgstr\s+"(.*)"', '$1'
        $currentMsgstr = $currentMsgstr -replace '\\n', "`n"
        $currentMsgstr = $currentMsgstr -replace '\\t', "`t"
        $currentMsgstr = $currentMsgstr -replace '\\"', '"'
        $currentMsgstr = $currentMsgstr -replace '\\\\', '\'
        $inMsgid = $false
        $inMsgstr = $true
        continue
    }
    
    # Continuation line
    if ($line.StartsWith('"')) {
        $str = $line -replace '"(.*)"', '$1'
        $str = $str -replace '\\n', "`n"
        $str = $str -replace '\\t', "`t"
        $str = $str -replace '\\"', '"'
        $str = $str -replace '\\\\', '\'
        
        if ($inMsgid) {
            $currentMsgid += $str
        } elseif ($inMsgstr) {
            $currentMsgstr += $str
        }
    }
}

# Save last translation
if ($currentMsgid -ne "" -and $currentMsgstr -ne "") {
    $translations[$currentMsgid] = $currentMsgstr
}

# Remove empty header
$translations.Remove("")

$count = $translations.Count
Write-Host "Found $count translations" -ForegroundColor Green

if ($count -eq 0) {
    Write-Host "Error: No translations found!" -ForegroundColor Red
    exit 1
}

Write-Host "Generating MO file: $moFile" -ForegroundColor Yellow

# Sort translations
$sortedKeys = $translations.Keys | Sort-Object
$originals = @()
$translationsArray = @()

foreach ($key in $sortedKeys) {
    $originals += $key
    $translationsArray += $translations[$key]
}

# Create MO file binary data
# Magic number for little-endian MO files
$magic = [byte[]]@(0xde, 0x12, 0x04, 0x95)
$revision = 0
$numStrings = $count

$headerSize = 28
$originalsTableOffset = $headerSize
$translationsTableOffset = $originalsTableOffset + ($count * 8)
$stringsOffset = $translationsTableOffset + ($count * 8)

# Calculate string offsets
$originalOffsets = @()
$translationOffsets = @()
$currentOffset = $stringsOffset

# UTF-8 encoding
$utf8 = [System.Text.Encoding]::UTF8

foreach ($original in $originals) {
    $bytes = $utf8.GetBytes($original)
    $originalOffsets += @{
        length = $bytes.Length
        offset = $currentOffset
    }
    $currentOffset += $bytes.Length + 1
}

foreach ($translation in $translationsArray) {
    $bytes = $utf8.GetBytes($translation)
    $translationOffsets += @{
        length = $bytes.Length
        offset = $currentOffset
    }
    $currentOffset += $bytes.Length + 1
}

# Build MO file
$stream = [System.IO.MemoryStream]::new()
$writer = [System.IO.BinaryWriter]::new($stream)

# Write header (28 bytes)
$writer.Write($magic)                           # Magic number (4 bytes)
$writer.Write([uint32]$revision)                # Revision (4 bytes)
$writer.Write([uint32]$numStrings)              # Number of strings (4 bytes)
$writer.Write([uint32]$originalsTableOffset)    # Originals table offset (4 bytes)
$writer.Write([uint32]$translationsTableOffset) # Translations table offset (4 bytes)
$writer.Write([uint32]0)                        # Hash table size (4 bytes)
$writer.Write([uint32]0)                        # Hash table offset (4 bytes)

# Write original strings table
foreach ($offset in $originalOffsets) {
    $writer.Write([uint32]$offset.length)
    $writer.Write([uint32]$offset.offset)
}

# Write translation strings table
foreach ($offset in $translationOffsets) {
    $writer.Write([uint32]$offset.length)
    $writer.Write([uint32]$offset.offset)
}

# Write original strings
foreach ($original in $originals) {
    $bytes = $utf8.GetBytes($original)
    $writer.Write($bytes)
    $writer.Write([byte]0)
}

# Write translation strings
foreach ($translation in $translationsArray) {
    $bytes = $utf8.GetBytes($translation)
    $writer.Write($bytes)
    $writer.Write([byte]0)
}

# Save to file
$moData = $stream.ToArray()
[System.IO.File]::WriteAllBytes($moFile, $moData)

$writer.Close()
$stream.Close()

$fileSize = (Get-Item $moFile).Length
Write-Host ""
Write-Host "Success! MO file created." -ForegroundColor Green
Write-Host "File size: $fileSize bytes" -ForegroundColor Cyan
Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Cyan
