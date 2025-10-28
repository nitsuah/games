# Run Lighthouse on Windows against local Next server
Set-StrictMode -Version Latest
$appDir = 'C:\Users\ajhar\code\games\app'
Push-Location $appDir

# Start Next server via cmd to get a reliable process object
Write-Output "Starting Next server in $appDir"
$server = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c','npm run start' -WorkingDirectory $appDir -PassThru
$serverPid = $server.Id
Write-Output "Started Next PID=$serverPid"

# Wait for server up to 60s
$max = 60
for ($i = 0; $i -lt $max; $i++) {
    try {
        $r = Invoke-WebRequest -Uri 'http://127.0.0.1:3000' -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { Write-Output 'Server up'; break }
    } catch { }
    Start-Sleep -Seconds 1
}

if ($i -ge $max) {
    Write-Output 'Server did not start in time'
    Try { Stop-Process -Id $serverPid -Force } Catch { }
    Pop-Location
    exit 2
}

# Launch Chrome with remote-debugging-port
$chromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-Not (Test-Path $chromePath)) {
    Write-Output "Chrome not found at $chromePath"
} else {
    Write-Output "Starting Chrome with remote debugging"
    $chrome = Start-Process -FilePath $chromePath -ArgumentList '--remote-debugging-port=9222','--user-data-dir=C:\Temp\lighthouse-profile','--no-first-run','--no-default-browser-check' -PassThru
}

# Run Lighthouse connecting to port 9222 (if chrome started) or default
$lighthouseCmd = "npm exec --yes -- lighthouse http://127.0.0.1:3000 --output=json --output-path .\\lighthouse-report.json"
if ($chrome) {
    $lighthouseCmd += " --port=9222"
}
Write-Output "Running: $lighthouseCmd"
Invoke-Expression $lighthouseCmd
$exit = $LASTEXITCODE

# Cleanup
if ($chrome) { Try { Stop-Process -Id $chrome.Id -Force } Catch { } }
Try { Stop-Process -Id $serverPid -Force } Catch { }
Pop-Location
exit $exit
