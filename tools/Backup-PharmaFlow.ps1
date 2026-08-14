$ErrorActionPreference = "Stop"

$PostgresBin = "P:\PharmaFlow\runtime\pgsql\bin"
$BackupDir = "P:\PharmaFlow\backups"
$Database = "pharmaflow"

# Make sure backup directory exists
New-Item -ItemType Directory -Force $BackupDir | Out-Null

# Check PostgreSQL
& "$PostgresBin\pg_ctl.exe" `
    -D "P:\PharmaFlow\database" `
    status *> $null

if ($LASTEXITCODE -ne 0) {
    throw "PostgreSQL is not running."
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$backupFile = Join-Path $BackupDir "pharmaflow_$timestamp.dump"

& "$PostgresBin\pg_dump.exe" `
    -U postgres `
    -h 127.0.0.1 `
    -p 5432 `
    -d $Database `
    -F c `
    -f $backupFile

if ($LASTEXITCODE -ne 0) {
    Remove-Item $backupFile -Force -ErrorAction SilentlyContinue
    throw "Database backup failed."
}

# Keep only the newest 7 backups
Get-ChildItem $BackupDir -Filter "pharmaflow_*.dump" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -Skip 7 |
    Remove-Item -Force

Write-Host "Backup created:"
Write-Host $backupFile