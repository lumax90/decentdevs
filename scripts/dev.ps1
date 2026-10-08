$ErrorActionPreference = 'Stop'
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    $portable = Join-Path $env:LOCALAPPDATA 'Temp\opencode\runtimes\node-v24.21.0-win-x64'
    if (-not (Test-Path (Join-Path $portable 'node.exe'))) {
        throw 'Node.js 24 LTS gerekli. Node kurulduktan sonra npm install ve npm run dev komutlarini calistirin.'
    }
    $env:Path = "$portable;$env:Path"
}
$env:NEXT_TELEMETRY_DISABLED = '1'
Push-Location (Split-Path $PSScriptRoot -Parent)
try { & npm.cmd run dev } finally { Pop-Location }
