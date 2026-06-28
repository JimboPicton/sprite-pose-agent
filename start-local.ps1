$ErrorActionPreference = "Stop"

$nodeCandidates = @(
    (Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -ErrorAction SilentlyContinue),
    "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) }

if (-not $nodeCandidates) {
    Write-Host "Node.js was not found. Install Node.js 20 or newer, then run this file again." -ForegroundColor Red
    Read-Host "Press Enter to close"
    exit 1
}

$node = $nodeCandidates[0]
$project = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $project

Write-Host "Starting Sprite Pose Agent v0.4.0..." -ForegroundColor Green
Write-Host "Keep this window open while using ComfyUI generation."
Write-Host "Open http://127.0.0.1:4173 in your browser."
& $node "$project\server.mjs"
