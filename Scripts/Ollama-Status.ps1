<#
.SYNOPSIS
    Check Ollama status, list models, and verify connectivity.

.DESCRIPTION
    Reads model list from ollama-models.json, checks if Ollama is running,
    lists installed models, and tests connectivity.

.EXAMPLE
    .\Ollama-Status.ps1

.EXAMPLE
    .\Ollama-Status.ps1 -PullMissing
#>

param(
    [switch]$PullMissing
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$configPath = Join-Path $scriptDir "ollama-models.json"

# Load model config
if (-not (Test-Path $configPath)) {
    Write-Host "Config not found: $configPath" -ForegroundColor Red
    exit 1
}
$config = Get-Content $configPath -Raw | ConvertFrom-Json
$ollamaUrl = $config.ollamaUrl

Write-Host "=== Ollama Status ===" -ForegroundColor Cyan
Write-Host ""

# Check if Ollama is running
Write-Host "Checking Ollama at $ollamaUrl ..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$ollamaUrl/api/tags" -Method Get -TimeoutSec 5
    Write-Host "Ollama is running" -ForegroundColor Green
} catch {
    Write-Host "Ollama is NOT running or not reachable" -ForegroundColor Red
    Write-Host "Start it with: ollama serve" -ForegroundColor Yellow
    exit 1
}

# List installed models
Write-Host ""
Write-Host "=== Installed Models ===" -ForegroundColor Cyan
$installed = $response.models | ForEach-Object { $_.name }
if ($installed.Count -eq 0) {
    Write-Host "No models installed" -ForegroundColor Yellow
} else {
    $installed | ForEach-Object { Write-Host "  - $_" }
}

# Check required models
Write-Host ""
Write-Host "=== Required Models ===" -ForegroundColor Cyan
$missing = @()
foreach ($model in $config.models) {
    $found = $installed | Where-Object { $_ -like "$model*" }
    if ($found) {
        Write-Host "  [OK] $model" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $model" -ForegroundColor Red
        $missing += $model
    }
}

# Pull missing models if requested
if ($PullMissing -and $missing.Count -gt 0) {
    Write-Host ""
    Write-Host "=== Pulling Missing Models ===" -ForegroundColor Yellow
    foreach ($model in $missing) {
        Write-Host "Pulling $model ..." -ForegroundColor Cyan
        ollama pull $model
    }
    Write-Host "Done" -ForegroundColor Green
} elseif ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "Run with -PullMissing to download missing models" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Default model: $($config.defaultModel)"
Write-Host "Embedding model: $($config.embeddingModel)"
Write-Host "Installed: $($installed.Count) | Required: $($config.models.Count) | Missing: $($missing.Count)"
