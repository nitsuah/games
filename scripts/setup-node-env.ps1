# Refresh environment variables after installing Node.js
Write-Host "Setting up Node.js environment..." -ForegroundColor Green

# Get system and user PATH
$machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")

# Combine and set for current session
$env:Path = $machinePath + ";" + $userPath

# Verify Node.js is available
$nodeVersion = node --version 2>$null
$npmVersion = npm --version 2>$null

if ($nodeVersion) {
    Write-Host "✓ Node.js $nodeVersion installed" -ForegroundColor Cyan
    Write-Host "✓ npm $npmVersion installed" -ForegroundColor Cyan
} else {
    Write-Host "✗ Node.js not found in PATH" -ForegroundColor Red
    Write-Host "Please restart VS Code or run: winget install OpenJS.NodeJS.LTS" -ForegroundColor Yellow
}

Write-Host "`nReady to run npm commands!" -ForegroundColor Green
