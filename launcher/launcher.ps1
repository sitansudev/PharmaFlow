$ErrorActionPreference = "Stop"

# ============================================================
# PharmaFlow Production Launcher
# ============================================================

$Root = "C:\PharmaFlow"

$PostgresBin = Join-Path $Root "runtime\pgsql\bin"
$DatabaseDir = Join-Path $Root "database"

$BackendDir = Join-Path $Root "apps\backend"
$BackendServer = Join-Path $BackendDir "dist\server.js"

$WebDir = Join-Path $Root "apps\web"

$LogDir = Join-Path $Root "launcher\logs"

$DatabasePort = 5432
$BackendPort = 5001
$FrontendPort = 3417

$FrontendUrl = "http://127.0.0.1:3417/login"

$startedService = $false

# ------------------------------------------------------------
# Create log directory
# ------------------------------------------------------------

New-Item -ItemType Directory -Force $LogDir | Out-Null

$BackendLog = Join-Path $LogDir "backend.log"
$BackendErrorLog = Join-Path $LogDir "backend-error.log"

$FrontendLog = Join-Path $LogDir "frontend.log"
$FrontendErrorLog = Join-Path $LogDir "frontend-error.log"

$PostgresStartupLog = Join-Path $LogDir "postgres-startup.log"

# ------------------------------------------------------------
# Check whether a TCP port is listening
# ------------------------------------------------------------

function Test-Port {
    param (
        [int]$Port
    )

    try {
        Get-NetTCPConnection `
            -LocalPort $Port `
            -State Listen `
            -ErrorAction Stop | Out-Null

        return $true
    }
    catch {
        return $false
    }
}

# ------------------------------------------------------------
# Wait for TCP port
# ------------------------------------------------------------

function Wait-ForPort {
    param (
        [int]$Port,
        [int]$TimeoutSeconds
    )

    $start = Get-Date

    while (-not (Test-Port $Port)) {

        Start-Sleep -Milliseconds 500

        if (
            ((Get-Date) - $start).TotalSeconds `
            -ge $TimeoutSeconds
        ) {
            throw "Service did not start on port $Port within $TimeoutSeconds seconds."
        }
    }
}

# ------------------------------------------------------------
# Wait for backend + Prisma + PostgreSQL
# ------------------------------------------------------------

function Wait-ForBackendHealth {
    param (
        [int]$TimeoutSeconds = 120
    )

    $start = Get-Date

    while ($true) {

        try {

            $health = Invoke-RestMethod `
                -Uri "http://127.0.0.1:$BackendPort/health" `
                -Method Get `
                -TimeoutSec 5 `
                -ErrorAction Stop

            if (
                $health.status -eq "ok" -and
                $health.database -eq "connected"
            ) {
                return
            }
        }
        catch {
            # Backend or PostgreSQL may still be starting.
        }

        Start-Sleep -Milliseconds 1000

        if (
            ((Get-Date) - $start).TotalSeconds `
            -ge $TimeoutSeconds
        ) {
            throw "PharmaFlow backend/database health check failed."
        }
    }
}

# ============================================================
# 1. PostgreSQL
# ============================================================

$PgCtl = Join-Path $PostgresBin "pg_ctl.exe"

if (-not (Test-Port $DatabasePort)) {

    if (-not (Test-Path $PgCtl)) {
        throw "PostgreSQL pg_ctl.exe was not found: $PgCtl"
    }

    if (-not (Test-Path $DatabaseDir)) {
        throw "PharmaFlow database directory was not found: $DatabaseDir"
    }

    Start-Process `
        -FilePath $PgCtl `
        -ArgumentList @(
            "-D",
            $DatabaseDir,
            "-l",
            $PostgresStartupLog,
            "start"
        ) `
        -WindowStyle Hidden `
        -Wait

    # We only use the port check to know PostgreSQL has started.
    # Actual database readiness is verified by the backend health
    # check below.
    Wait-ForPort `
        -Port $DatabasePort `
        -TimeoutSeconds 60
}

# ============================================================
# 2. Backend
# ============================================================

if (-not (Test-Port $BackendPort)) {

    if (-not (Test-Path $BackendServer)) {
        throw "Backend production build was not found: $BackendServer"
    }

    $Node = (Get-Command node.exe -ErrorAction Stop).Source

    # Force backend to port 5001.
    $oldPort = $env:PORT
    $env:PORT = "$BackendPort"

    Start-Process `
        -FilePath $Node `
        -ArgumentList "`"$BackendServer`"" `
        -WorkingDirectory $BackendDir `
        -RedirectStandardOutput $BackendLog `
        -RedirectStandardError $BackendErrorLog `
        -WindowStyle Hidden

    $startedService = $true

    # Restore launcher environment.
    if ($null -eq $oldPort) {
        Remove-Item Env:PORT -ErrorAction SilentlyContinue
    }
    else {
        $env:PORT = $oldPort
    }

    Wait-ForPort `
        -Port $BackendPort `
        -TimeoutSeconds 60
}

# ============================================================
# 3. Verify Backend + Prisma + PostgreSQL
# ============================================================

Wait-ForBackendHealth `
    -TimeoutSeconds 120

# ============================================================
# 4. Frontend
# ============================================================

if (-not (Test-Port $FrontendPort)) {

    $Pnpm = (Get-Command pnpm.cmd -ErrorAction Stop).Source

    $oldPort = $env:PORT
    $env:PORT = "$FrontendPort"

    Start-Process `
        -FilePath $Pnpm `
        -ArgumentList @(
            "exec",
            "next",
            "start",
            "-p",
            "$FrontendPort"
        ) `
        -WorkingDirectory $WebDir `
        -RedirectStandardOutput $FrontendLog `
        -RedirectStandardError $FrontendErrorLog `
        -WindowStyle Hidden

    $startedService = $true

    # Restore launcher environment.
    if ($null -eq $oldPort) {
        Remove-Item Env:PORT -ErrorAction SilentlyContinue
    }
    else {
        $env:PORT = $oldPort
    }

    Wait-ForPort `
        -Port $FrontendPort `
        -TimeoutSeconds 90
}

# ============================================================
# 5. Open PharmaFlow
# ============================================================

Start-Process $FrontendUrl