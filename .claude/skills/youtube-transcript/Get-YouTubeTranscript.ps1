# Get-YouTubeTranscript.ps1 — Full pipeline: metadata, subtitles, parse, output
param(
    [Parameter(Mandatory)]
    [string]$Url,
    [string]$OutputPath
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ── 1. Setup ──────────────────────────────────────────────────────────────────

# Extract video ID from URL
if ($Url -match '[?&]v=([A-Za-z0-9_-]{11})') {
    $VideoId = $Matches[1]
} elseif ($Url -match 'youtu\.be/([A-Za-z0-9_-]{11})') {
    $VideoId = $Matches[1]
} elseif ($Url -match 'shorts/([A-Za-z0-9_-]{11})') {
    $VideoId = $Matches[1]
} else {
    Write-Error "Could not extract video ID from URL: $Url"
    exit 1
}

$TempDir = $env:TEMP
$SubFileBase = Join-Path $TempDir "yt-transcript-$VideoId"
$SavePayloadPath = Join-Path $TempDir "yt-save-$VideoId.json"

try {
    # ── 2. Fetch metadata ─────────────────────────────────────────────────────

    $metaOutput = & yt-dlp --print title --print channel --print id --print uploader_url --skip-download $Url 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "yt-dlp failed to fetch metadata (exit code $LASTEXITCODE). Video may be unavailable or private."
        exit 1
    }

    $metaLines = $metaOutput -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne '' }
    if ($metaLines.Count -lt 4) {
        Write-Error "yt-dlp returned incomplete metadata ($($metaLines.Count) lines, expected 4)."
        exit 1
    }

    $VideoTitle  = $metaLines[0]
    $ChannelName = $metaLines[1]
    $VideoId     = $metaLines[2]
    $ChannelUrl  = $metaLines[3]

    $ChannelHandle = ''
    if ($ChannelUrl -match '/@([^/\s]+)') {
        $ChannelHandle = "@$($Matches[1])"
    }

    # ── 3. Download subtitles ─────────────────────────────────────────────────

    & yt-dlp --write-auto-sub --write-sub --sub-lang en --skip-download --sub-format json3 -o "$SubFileBase" $Url 2>$null

    # Glob for the subtitle file (yt-dlp appends .en.json3 or similar)
    $SubFile = Get-ChildItem "$SubFileBase*.json3" -ErrorAction SilentlyContinue | Select-Object -First 1

    if (-not $SubFile) {
        Write-Error "No subtitle file found. This video may not have English subtitles."
        exit 2
    }

    # ── 4. Parse JSON3 ────────────────────────────────────────────────────────

    $json = Get-Content -Raw -Encoding UTF8 $SubFile.FullName | ConvertFrom-Json
    $events = @($json.events | Where-Object { $_.segs })

    $Lines = [System.Collections.Generic.List[string]]::new()
    $Segments = [System.Collections.Generic.List[object]]::new()
    $lastLine = ''

    foreach ($evt in $events) {
        $startMs = if ($null -ne $evt.tStartMs) { [long]$evt.tStartMs } else { 0 }
        $durationMs = if ($null -ne $evt.dDurationMs) { [double]$evt.dDurationMs } else { 0 }
        $startSec = [math]::Floor($startMs / 1000)
        $durationSec = [math]::Round($durationMs / 1000, 2)

        $h = [int][math]::Floor($startSec / 3600)
        $m = [int][math]::Floor(($startSec % 3600) / 60)
        $s = [int]($startSec % 60)

        if ($h -gt 0) {
            $ts = '{0:D2}:{1:D2}:{2:D2}' -f $h, $m, $s
        } else {
            $ts = '{0:D2}:{1:D2}' -f $m, $s
        }

        $text = ($evt.segs | ForEach-Object {
            if ($_.utf8) { $_.utf8 } else { '' }
        }) -join ''
        $text = ($text -replace "`n", ' ').Trim()

        if ($text -eq '' -or $text -eq $lastLine) { continue }
        $lastLine = $text

        $Lines.Add("**$ts** $text")
        $Segments.Add(@{
            text     = $text
            offset   = [int]$startSec
            duration = $durationSec
        })
    }

    # ── 5. Optional: route to LiteYT for archival ─────────────────────────────
    # Optional: route to LiteYT for archival
    $archiveStatus = 'Not saved'

    # ── 6. Build and output markdown ──────────────────────────────────────────

    $exportDate = Get-Date -Format 'yyyy-MM-dd HH:mm'
    $transcript = $Lines -join "`n`n"

    $Markdown = @"
# $ChannelName - $VideoTitle
**URL:** https://youtube.com/watch?v=$VideoId
**Channel:** $ChannelHandle
**Exported:** $exportDate
**Archived:** $archiveStatus

---

$transcript
"@

    if ($OutputPath) {
        $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
        [System.IO.File]::WriteAllText($OutputPath, $Markdown, $utf8NoBom)
        Write-Host "Written to: $OutputPath" -ForegroundColor Cyan
    }

    Write-Output $Markdown

} finally {
    # ── 7. Cleanup ────────────────────────────────────────────────────────────
    Remove-Item "$SubFileBase*.json3" -Force -ErrorAction SilentlyContinue
    Remove-Item $SavePayloadPath -Force -ErrorAction SilentlyContinue
}
