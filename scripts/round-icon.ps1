[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$InputPath,
    [string]$OutDir = "packages/client/public",
    [int]$RadiusPercent = 22,
    [int]$PaddingPercent = 6
)

Add-Type -AssemblyName System.Drawing

function Get-TrimmedBitmap {
    param([System.Drawing.Bitmap]$Src, [int]$PaddingPercent)
    $w = $Src.Width; $h = $Src.Height
    $minX = $w; $maxX = -1; $minY = $h; $maxY = -1
    $step = [Math]::Max(1, [int]([Math]::Min($w, $h) / 512))
    for ($y = 0; $y -lt $h; $y += $step) {
        for ($x = 0; $x -lt $w; $x += $step) {
            if ($Src.GetPixel($x, $y).A -gt 8) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
    if ($maxX -lt 0) { return $Src }

    $bw = $maxX - $minX + 1
    $bh = $maxY - $minY + 1
    $side = [Math]::Max($bw, $bh)
    $cx = ($minX + $maxX) / 2.0
    $cy = ($minY + $maxY) / 2.0
    $padded = [int]($side * (1 + $PaddingPercent / 50.0))
    $half = [int]($padded / 2)
    $sx = [int]($cx - $half)
    $sy = [int]($cy - $half)

    $out = New-Object System.Drawing.Bitmap $padded, $padded, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($out)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($Src, -$sx, -$sy)
    $g.Dispose()
    return $out
}

function Get-BestSourceBitmap {
    param([string]$Path)
    $ext = [System.IO.Path]::GetExtension($Path).ToLower()
    if ($ext -ne ".ico") {
        return [System.Drawing.Image]::FromFile($Path)
    }
    $bytes = [System.IO.File]::ReadAllBytes($Path)
    $count = [BitConverter]::ToUInt16($bytes, 4)
    $best = -1; $bestW = 0
    for ($i = 0; $i -lt $count; $i++) {
        $o = 6 + $i * 16
        $w = $bytes[$o]; if ($w -eq 0) { $w = 256 }
        if ($w -gt $bestW) { $bestW = $w; $best = $i }
    }
    $o = 6 + $best * 16
    $size = [BitConverter]::ToUInt32($bytes, $o + 8)
    $offset = [BitConverter]::ToUInt32($bytes, $o + 12)
    $frame = New-Object byte[] $size
    [Array]::Copy($bytes, $offset, $frame, 0, $size)

    if ($frame[0] -eq 0x89 -and $frame[1] -eq 0x50) {
        $ms = New-Object System.IO.MemoryStream(, $frame)
        return [System.Drawing.Image]::FromStream($ms)
    }
    $icon = New-Object System.Drawing.Icon($Path, $bestW, $bestW)
    $bmp = $icon.ToBitmap()
    $icon.Dispose()
    return $bmp
}

function New-RoundedBitmap {
    param([System.Drawing.Image]$Src, [int]$Size, [int]$RadiusPercent)

    $sw = $Src.Width; $sh = $Src.Height
    $cropSize = [Math]::Min($sw, $sh)
    $sx = [int](($sw - $cropSize) / 2)
    $sy = [int](($sh - $cropSize) / 2)

    $square = New-Object System.Drawing.Bitmap $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $sg = [System.Drawing.Graphics]::FromImage($square)
    $sg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $sg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $sg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $sg.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $attr = New-Object System.Drawing.Imaging.ImageAttributes
    $attr.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
    $destRect = New-Object System.Drawing.Rectangle 0, 0, $Size, $Size
    $sg.DrawImage($Src, $destRect, $sx, $sy, $cropSize, $cropSize, [System.Drawing.GraphicsUnit]::Pixel, $attr)
    $sg.Dispose()
    $attr.Dispose()

    $out = New-Object System.Drawing.Bitmap $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($out)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $r = [int]($Size * $RadiusPercent / 100)
    $d = $r * 2
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $d, $d, 180, 90) | Out-Null
    $path.AddArc($Size - $d, 0, $d, $d, 270, 90) | Out-Null
    $path.AddArc($Size - $d, $Size - $d, $d, $d, 0, 90) | Out-Null
    $path.AddArc(0, $Size - $d, $d, $d, 90, 90) | Out-Null
    $path.CloseFigure()

    $brush = New-Object System.Drawing.TextureBrush $square
    $brush.WrapMode = [System.Drawing.Drawing2D.WrapMode]::Clamp
    $g.FillPath($brush, $path)
    $brush.Dispose()
    $g.Dispose()
    $path.Dispose()
    $square.Dispose()
    return $out
}

function Save-Png {
    param([System.Drawing.Bitmap]$Bitmap, [string]$Path)
    $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "  -> $Path  ($($Bitmap.Width)x$($Bitmap.Height))"
}

function Save-MultisizeIco {
    param([System.Drawing.Image]$Src, [string]$IcoPath, [int[]]$Sizes, [int]$RadiusPercent)
    $pngs = @()
    foreach ($s in $Sizes) {
        $bmp = New-RoundedBitmap -Src $Src -Size $s -RadiusPercent $RadiusPercent
        $ms = New-Object System.IO.MemoryStream
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $pngs += , @{ size = $s; bytes = $ms.ToArray() }
        $ms.Dispose(); $bmp.Dispose()
    }

    $stream = [System.IO.File]::Create($IcoPath)
    $bw = New-Object System.IO.BinaryWriter $stream
    $bw.Write([UInt16]0); $bw.Write([UInt16]1); $bw.Write([UInt16]$pngs.Count)
    $offset = 6 + 16 * $pngs.Count
    foreach ($p in $pngs) {
        $w = $p.size; if ($w -ge 256) { $w = 0 }
        $bw.Write([byte]$w); $bw.Write([byte]$w)
        $bw.Write([byte]0); $bw.Write([byte]0)
        $bw.Write([UInt16]1); $bw.Write([UInt16]32)
        $bw.Write([UInt32]$p.bytes.Length)
        $bw.Write([UInt32]$offset)
        $offset += $p.bytes.Length
    }
    foreach ($p in $pngs) { $bw.Write($p.bytes) }
    $bw.Dispose(); $stream.Dispose()
    Write-Host "  -> $IcoPath  (sizes: $($Sizes -join ', '))"
}

$inputFull = (Resolve-Path -LiteralPath $InputPath).Path
$outFull = (Resolve-Path -LiteralPath $OutDir).Path
$iconsDir = Join-Path $outFull "icons"
if (-not (Test-Path $iconsDir)) { New-Item -ItemType Directory -Path $iconsDir | Out-Null }

Write-Host "In:  $inputFull"
Write-Host "Out: $outFull"

$rawSrc = Get-BestSourceBitmap -Path $inputFull
Write-Host ("Source bitmap: {0}x{1}" -f $rawSrc.Width, $rawSrc.Height)
$src = Get-TrimmedBitmap -Src $rawSrc -PaddingPercent $PaddingPercent
if ($src -ne $rawSrc) {
    Write-Host ("Trimmed: {0}x{1} (pad {2}%)" -f $src.Width, $src.Height, $PaddingPercent)
    $rawSrc.Dispose()
}
if ($src.Width -lt 512) {
    Write-Warning "Source is only $($src.Width)px. For sharp 512px PWA icon use a 1024px+ source."
}

foreach ($s in @(192, 512)) {
    $bmp = New-RoundedBitmap -Src $src -Size $s -RadiusPercent $RadiusPercent
    Save-Png -Bitmap $bmp -Path (Join-Path $iconsDir "icon-$s.png")
    $bmp.Dispose()
}

Save-MultisizeIco -Src $src -IcoPath (Join-Path $outFull "favicon.ico") -Sizes @(16, 32, 48, 64, 128, 256) -RadiusPercent $RadiusPercent

$src.Dispose()
Write-Host "Done."
