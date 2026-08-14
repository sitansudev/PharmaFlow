$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\PharmaFlow"

$PostgresBin = "P:\PharmaFlow\runtime\pgsql\bin"
$DatabaseDir = "P:\PharmaFlow\database"
$PostgresLog = "P:\PharmaFlow\runtime\postgres.log"
$BackupDir = "P:\PharmaFlow\backups"

$BackendDir = "$ProjectRoot\apps\backend"
$WebDir = "$ProjectRoot\apps\web"

# ------------------------------------------------------------
# 1. Check PharmaFlow SSD
# ------------------------------------------------------------

if (-not (Test-Path "$PostgresBin\pg_ctl.exe")) {
    Add-Type -AssemblyName PresentationFramework

    [System.Windows.MessageBox]::Show(
        "PharmaFlow SSD was not found.`n`nPlease connect the PharmaFlow SSD and try again.",
        "PharmaFlow",
        "OK",
        "Error"
    )

    exit 1
}

# ------------------------------------------------------------
# 2. Start PostgreSQL
# ------------------------------------------------------------

& "$PostgresBin\pg_ctl.exe" `
    -D $DatabaseDir `
    status *> $null

if ($LASTEXITCODE -ne 0) {

    & "$PostgresBin\pg_ctl.exe" `
        -D $DatabaseDir `
        -l $PostgresLog `
        start

    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL failed to start."
    }
}

# ------------------------------------------------------------
# 3. Create automatic backup
# ------------------------------------------------------------

try {

    New-Item -ItemType Directory -Force $BackupDir | Out-Null

    $timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
    $backupFile = Join-Path `
        $BackupDir `
        "pharmaflow_$timestamp.dump"

    & "$PostgresBin\pg_dump.exe" `
        -U postgres `
        -h 127.0.0.1 `
        -p 5432 `
        -d pharmaflow `
        -F c `
        -f $backupFile

    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump failed."
    }

    # Keep newest 7 backups
    Get-ChildItem $BackupDir `
        -Filter "pharmaflow_*.dump" |
        Sort-Object LastWriteTime -Descending |
        Select-Object -Skip 7 |
        Remove-Item -Force

}
catch {

    Add-Type -AssemblyName PresentationFramework

    [System.Windows.MessageBox]::Show(
        "Automatic database backup failed.`n`nPharmaFlow will still start, but please create a backup manually.",
        "PharmaFlow Backup Warning",
        "OK",
        "Warning"
    )
}

# ------------------------------------------------------------
# 4. Start production backend
# ------------------------------------------------------------

$backend = Start-Process `
    -FilePath "node.exe" `
    -ArgumentList "dist\server.js" `
    -WorkingDirectory $BackendDir `
    -WindowStyle Hidden `
    -PassThru

# ------------------------------------------------------------
# 5. Wait for backend
# ------------------------------------------------------------

$backendReady = $false

for ($i = 0; $i -lt 60; $i++) {

    Start-Sleep -Seconds 1

    try {

        $response = Invoke-WebRequest `
            -Uri "http://localhost:5001/health" `
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

    Stop-Process `
        -Id $backend.Id `
        -Force `
        -ErrorAction SilentlyContinue

    Add-Type -AssemblyName PresentationFramework

    [System.Windows.MessageBox]::Show(
        "PharmaFlow backend failed to start.",
        "PharmaFlow",
        "OK",
        "Error"
    )

    exit 1
}

# ------------------------------------------------------------
# 6. Start production frontend
# ------------------------------------------------------------

$web = Start-Process `
    -FilePath "cmd.exe" `
    -ArgumentList "/c pnpm.cmd start" `
    -WorkingDirectory $WebDir `
    -WindowStyle Hidden `
    -PassThru

# ------------------------------------------------------------
# 7. Wait for frontend
# ------------------------------------------------------------

$frontendReady = $false

for ($i = 0; $i -lt 90; $i++) {

    Start-Sleep -Seconds 1

    try {

        $response = Invoke-WebRequest `
            -Uri "http://localhost:3000" `
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

    Stop-Process `
        -Id $web.Id `
        -Force `
        -ErrorAction SilentlyContinue

    Stop-Process `
        -Id $backend.Id `
        -Force `
        -ErrorAction SilentlyContinue

    Add-Type -AssemblyName PresentationFramework

    [System.Windows.MessageBox]::Show(
        "PharmaFlow frontend failed to start.",
        "PharmaFlow",
        "OK",
        "Error"
    )

    exit 1
}

# ------------------------------------------------------------
# 8. Open PharmaFlow
# ------------------------------------------------------------

Start-Process "http://localhost:3000/login"