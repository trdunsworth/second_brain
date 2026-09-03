<#
.SYNOPSIS
    Export an Obsidian markdown note to PDF using Quarto + Typst.

.DESCRIPTION
    Converts a .md file from the vault to a formatted PDF.
    Strips Obsidian-specific syntax (wikilinks, callouts, frontmatter)
    and renders via Quarto's Typst engine.

.PARAMETER InputFile
    Path to the .md file (absolute or relative to vault root).

.PARAMETER OutputDir
    Directory for the PDF output. Defaults to same folder as input.

.EXAMPLE
    .\Export-NoteToPDF.ps1 -InputFile "ALX_Notes\Ad Hoc Statistics\my-query.md"

.EXAMPLE
    .\Export-NoteToPDF.ps1 -InputFile "Test.md" -OutputDir "C:\Users\tony.dunsworth\Desktop"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$InputFile,

    [string]$OutputDir = ""
)

$ErrorActionPreference = "Stop"

# Resolve paths
$vaultRoot = "C:\Users\tony.dunsworth\projects\second_brain"
$inputPath = Resolve-Path -Path $InputFile -ErrorAction SilentlyContinue
if (-not $inputPath) {
    $inputPath = Join-Path $vaultRoot $InputFile
}
if (-not (Test-Path $inputPath)) {
    Write-Error "File not found: $inputPath"
    exit 1
}

$baseName = [System.IO.Path]::GetFileNameWithoutExtension($inputPath)
$tempQmd = Join-Path $env:TEMP "$baseName-export.qmd"

if ($OutputDir -eq "") {
    $OutputDir = Split-Path -Parent $inputPath
}
$pdfPath = Join-Path $OutputDir "$baseName.pdf"

# Read source content
$content = Get-Content -Path $inputPath -Raw

# Strip YAML frontmatter (only the first block at the start of the file)
$lines = $content -split "`n"
$frontMatterEnd = -1
if ($lines[0].Trim() -eq '---') {
    for ($i = 1; $i -lt $lines.Count; $i++) {
        if ($lines[$i].Trim() -eq '---') {
            $frontMatterEnd = $i
            break
        }
    }
}
if ($frontMatterEnd -gt 0) {
    $content = ($lines[($frontMatterEnd+1)..($lines.Count-1)] -join "`n")
}

# Convert Obsidian wikilinks to plain text: [[text]] -> text
$content = $content -replace '\[\[([^\]|]+)\|([^\]]+)\]\]', '$2'
$content = $content -replace '\[\[([^\]]+)\]\]', '$1'

# Convert bold/italic
# Keep markdown bold/italic as-is for Quarto

# Convert callout blocks to blockquotes (Quarto compatible)
$content = $content -replace '(?m)^>\s*\*\*Note:\*\*', '> **Note:**'
$content = $content -replace '(?m)^>\s*\*\*Warning:\*\*', '> **Warning:**'
$content = $content -replace '(?m)^>\s*\*\*Tip:\*\*', '> **Tip:**'

# Build Quarto wrapper
$dateStr = Get-Date -Format "yyyy-MM-dd"
$wrapper = @"
---
title: "$baseName"
author: "Tony Dunsworth"
date: "$dateStr"
format:
  typst:
    columns: 1
    margin:
      top: 2cm
      bottom: 2cm
      left: 2.5cm
      right: 2.5cm
    fontsize: 11pt
---

$content
"@

# Write temp .qmd
Set-Content -Path $tempQmd -Value $wrapper -Encoding UTF8

# Render with Quarto (output goes to same dir as input)
Write-Host "Rendering $baseName to PDF..." -ForegroundColor Cyan
$tempDir = Split-Path -Parent $tempQmd
quarto render $tempQmd --to typst --output "$baseName.pdf"

$renderedPdf = Join-Path $tempDir "$baseName.pdf"

if (Test-Path $renderedPdf) {
    Move-Item -Path $renderedPdf -Destination $pdfPath -Force
    Write-Host "PDF exported: $pdfPath" -ForegroundColor Green
} else {
    # Fallback: search vault root
    $fallback = Join-Path $vaultRoot "$baseName.pdf"
    if (Test-Path $fallback) {
        Move-Item -Path $fallback -Destination $pdfPath -Force
        Write-Host "PDF exported (from fallback): $pdfPath" -ForegroundColor Green
    } else {
        Write-Error "PDF render failed. Check Quarto output above."
    }
}

# Cleanup
Remove-Item -Path $tempQmd -Force -ErrorAction SilentlyContinue
