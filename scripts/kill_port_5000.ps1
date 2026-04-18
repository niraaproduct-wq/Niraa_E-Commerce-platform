$lines = netstat -ano | Select-String ":5000"
if (-not $lines) {
  Write-Output 'No listener on port 5000'
  exit 0
}

$pids = $lines | ForEach-Object { if ($_.Line -match '(\d+)\s*$') { $matches[1] } } | Select-Object -Unique
foreach ($thePid in $pids) {
  try {
    Write-Output "Stopping PID $thePid via Stop-Process"
    Stop-Process -Id $thePid -Force -ErrorAction Stop
    Write-Output "Killed PID $thePid"
  } catch {
    Write-Output "Stop-Process failed for $thePid, falling back to taskkill"
    cmd /c "taskkill /PID $thePid /F"
  }
}
