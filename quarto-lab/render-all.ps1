# render-all.ps1 — audience x period batch render for quarto-lab.
# Usage (from quarto-lab/): pwsh ./render-all.ps1 [-Week 2026-08-10]
# Requires: quarto CLI; jupyter + duckdb + pandas + great_tables + plotnine for weekly.qmd.
param([string]$Week = "2026-08-10")

$audiences = @("exec", "ops", "shift", "qa", "analyst")
foreach ($a in $audiences) {
  quarto render weekly.qmd -P audience:$a -P week_start:$Week `
    --output-file "_out/$a-$Week.docx" --to docx
  if ($LASTEXITCODE -ne 0) { throw "docx render failed for $a" }
  quarto render weekly.qmd -P audience:$a -P week_start:$Week `
    --output-file "_out/$a-$Week.pdf" --to typst
  if ($LASTEXITCODE -ne 0) { throw "typst render failed for $a" }
}
Write-Output "OK - 10 reports in _out/"
