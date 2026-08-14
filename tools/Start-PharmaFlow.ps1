$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\PharmaFlow"

$PostgresBin = "P:\PharmaFlow\runtime\pgsql\bin"
$DatabaseDir = "P:\PharmaFlow\database"
$PostgresLog = "P:\PharmaFlow\runtime\postgres.log"
$BackupDir = "P:\PharmaFlow\backups"

$Node = "P:\PharmaFlow\runtime\node\node.exe"
$BackendDir = "P:\PharmaFlow\app\backend"
$BackendServer = "$BackendDir\dist\server.js"

$WebDir = "P:\PharmaFlow\app\web"
$WebServer = "$WebDir\server.js"

# ------------------------------------------------------------
# PostgreSQL
# ------------------------------------------------------------

if (-not (Test-Path "$PostgresBin\pg_ctl.exe")) {
    throw "PharmaFlow SSD not found."
}

& "$PostgresBin\pg_ctl.exe" -D $DatabaseDir status *> $null

if ($LASTEXITCODE -ne 0) {
    Write-Host "Starting PostgreSQL..."

    & "$PostgresBin\pg_ctl.exe" `
        -D $DatabaseDir `
        -l $PostgresLog `
        start

    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL failed to start."
    }
}

# Wait for PostgreSQL
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1

    $connection = Get-NetTCPConnection `
        -LocalPort 5432 `
        -State Listen `
        -ErrorAction SilentlyContinue

    if ($connection) {
        break
    }
}

# ------------------------------------------------------------
# Backup
# ------------------------------------------------------------

New-Item -ItemType Directory -Force $BackupDir | Out-Null

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupFile = Join-Path $BackupDir "pharmaflow_$timestamp.dump"

& "$PostgresBin\pg_dump.exe" `
    -U postgres `
    -h 127.0.0.1 `
    -p 5432 `
    -d pharmaflow `
    -F c `
    -f $backupFile

if ($LASTEXITCODE -ne 0) {
    Write-Warning "Database backup failed. Continuing startup."
}
else {
    Get-ChildItem $BackupDir -Filter "pharmaflow_*.dump" |
        Sort-Object LastWriteTime -Descending |
        Select-Object -Skip 7 |
        Remove-Item -Force
}

# ------------------------------------------------------------
# Backend
# ------------------------------------------------------------
Remove-Item Env:PORT -ErrorAction SilentlyContinue
$backend = Start-Process `
    -FilePath $Node `
    -ArgumentList "`"$BackendServer`"" `
    -WorkingDirectory $BackendDir `
    -WindowStyle Hidden `
    -PassThru

# Wait for backend
$backendReady = $false

for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1

    try {
        $response = Invoke-WebRequest `
            -Uri "http://127.0.0.1:5001/health" `
            -UseBasicParsing `
            -TimeoutSec 2

        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    }
    catch {}
}

if (-not $backendReady) {
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    throw "Backend failed to start."
}

# ------------------------------------------------------------
# Frontend
# ------------------------------------------------------------
$env:PORT = "3417"
$web = Start-Process `
    -FilePath $Node `
    -ArgumentList "`"$WebServer`"" `
    -WorkingDirectory $WebDir `
    -WindowStyle Hidden `
    -PassThru

# Wait for frontend
$frontendReady = $false

for ($i = 0; $i -lt 60; $i++) {
    Start-Sleep -Seconds 1

    try {
        $response = Invoke-WebRequest `
            -Uri "http://127.0.0.1:3417/login" `
            -UseBasicParsing `
            -TimeoutSec 2

        if ($response.StatusCode -ge 200 -and
            $response.StatusCode -lt 500) {

            $frontendReady = $true
            break
        }
    }
    catch {}
}

if (-not $frontendReady) {
    Stop-Process -Id $web.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    throw "Frontend failed to start."
}

# ------------------------------------------------------------
# Open PharmaFlow
# ------------------------------------------------------------


Write-Host "====================================="
Write-Host " PharmaFlow started successfully"
Write-Host " Frontend : http://127.0.0.1:3417"
Write-Host " Backend  : http://127.0.0.1:5001"
Write-Host " Database : 127.0.0.1:5432"
Write-Host "====================================="