# This script configures MongoDB as a replica set (requires Admin)
$cfgPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg"
$content = Get-Content $cfgPath -Raw
if ($content -notmatch "replSetName") {
    $content = $content -replace "#replication:", "replication:`n  replSetName: rs0"
    Set-Content -Path $cfgPath -Value $content -NoNewline
    Write-Host "Updated mongod.cfg with replica set config"
} else {
    Write-Host "Replica set already configured"
}
Restart-Service MongoDB
Write-Host "MongoDB service restarted"
Start-Sleep -Seconds 3
Write-Host "Done! You can close this window."
Start-Sleep -Seconds 2
