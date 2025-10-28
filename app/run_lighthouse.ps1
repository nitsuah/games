Set-StrictMode -Version Latest
Set-Location 'C:\Users\ajhar\code\games\app'

# Start Next.js production server
 $proc = Start-Process -FilePath 'npm' -ArgumentList 'run','start' -WorkingDirectory (Get-Location) -PassThru
 $serverPid = $proc.Id
 Write-Output "Started server PID=$serverPid"

# Wait for server (up to 60s)
$max = 60
$i = 0
while ($i -lt $max) {
    try {
        $r = Invoke-WebRequest -Uri 'http://127.0.0.1:3000' -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { Write-Output 'Server up'; break }
    } catch {
        # ignore
    }
    Start-Sleep -Seconds 1
    $i++
}

if ($i -ge $max) {
    Write-Output 'Server did not start in time'
    Try { Stop-Process -Id $serverPid -Force } Catch { }
    exit 2
}

# Run Lighthouse via npm exec using Windows Chrome
$chromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-Not (Test-Path $chromePath)) {
    Write-Output "Chrome not found at $chromePath — trying default launch"
    npm exec --yes -- lighthouse http://127.0.0.1:3000 --output=json --output-path '.\\lighthouse-report.json' --chrome-flags='--headless --no-sandbox'
} else {
    Write-Output "Using Chrome at $chromePath"
    npm exec --yes -- lighthouse http://127.0.0.1:3000 --output=json --output-path '.\\lighthouse-report.json' --chrome-path "$chromePath" --chrome-flags='--headless --no-sandbox'
}

$exit = $LASTEXITCODE
Try { Stop-Process -Id $pid -Force } Catch { }
exit $exit
Try { Stop-Process -Id $serverPid -Force } Catch { }
