$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\PharmaFlow"

$PostgresBin = "$ProjectRoot\runtime\pgsql\bin"
$DatabaseDir = "$ProjectRoot\database"
$PostgresLog = "$ProjectRoot\runtime\postgres.log"
$BackupDir = "$ProjectRoot\backups"

$Node = "$ProjectRoot\runtime\node\node.exe"

# ------------------------------------------------------------
# Backend
# ------------------------------------------------------------

$BackendDir = "$ProjectRoot\apps\backend"
$BackendServer = "$BackendDir\dist\server.js"

# ------------------------------------------------------------
# Frontend - Next.js standalone
# ------------------------------------------------------------

$WebDir = "$ProjectRoot\apps\web\.next-new\standalone\apps\web"
$WebServer = "$WebDir\server.js"

# ------------------------------------------------------------
# PostgreSQL
# ------------------------------------------------------------

if (-not (Test-Path "$PostgresBin\pg_ctl.exe")) {
    throw "PharmaFlow PostgreSQL runtime not found."
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

# ------------------------------------------------------------
# Wait for PostgreSQL
# ------------------------------------------------------------

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

$env:DATABASE_URL = "postgresql://postgres:sitansu123@127.0.0.1:5432/pharmaflow"

Remove-Item Env:PORT -ErrorAction SilentlyContinue

if (-not (Test-Path $BackendServer)) {
    throw "Backend server not found: $BackendServer"
}

$backend = Start-Process `
    -FilePath $Node `
    -ArgumentList "`"$BackendServer`"" `
    -WorkingDirectory $BackendDir `
    -WindowStyle Hidden `
    -PassThru

# ------------------------------------------------------------
# Wait for backend
# ------------------------------------------------------------

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
    catch {
    }
}

if (-not $backendReady) {
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    throw "Backend failed to start."
}

# ------------------------------------------------------------
# Frontend
# ------------------------------------------------------------

if (-not (Test-Path $WebServer)) {
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    throw "Frontend server not found: $WebServer"
}

$env:PORT = "3417"

$web = Start-Process `
    -FilePath $Node `
    -ArgumentList "`"$WebServer`"" `
    -WorkingDirectory $WebDir `
    -WindowStyle Hidden `
    -PassThru

# ------------------------------------------------------------
# Wait for frontend
# ------------------------------------------------------------

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
    catch {
    }
}

if (-not $frontendReady) {
    Stop-Process -Id $web.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    throw "Frontend failed to start."
}

# ------------------------------------------------------------
# Success
# ------------------------------------------------------------

Write-Host "====================================="
Write-Host " PharmaFlow started successfully"
Write-Host " Frontend : http://127.0.0.1:3417"
Write-Host " Backend  : http://127.0.0.1:5001"
Write-Host " Database : 127.0.0.1:5432"
Write-Host "====================================="