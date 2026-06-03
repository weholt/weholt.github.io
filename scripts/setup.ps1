# Install site + CMS dependencies.
#   .\scripts\setup.ps1
#   .\scripts\setup.ps1 -E2e
param([switch]$E2e)

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$setupArgs = @()
if ($E2e) { $setupArgs += "--e2e" }

node scripts/setup.mjs @setupArgs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
