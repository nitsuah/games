# Arcade Docker Run Script (PowerShell)
# Finds an available port, runs the arcade Docker container, and logs the port for agent coordination.

$PortFile = ".arcade-ports"
$DefaultPort = 3000
$MaxPort = 3999
$Port = $DefaultPort

Write-Host "Searching for available port..."

function Test-PortAvailable($port) {
    $tcpListener = $null
    try {
        # Bind to all interfaces (0.0.0.0), matching how docker run -p binds ports
        # Using Loopback (127.0.0.1) could report a port as free while it's already
        # bound on another interface, causing docker run to fail
        $tcpListener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
        $tcpListener.Start()
        $tcpListener.Stop()
        return $true
    } catch {
        if ($tcpListener) { $tcpListener.Stop() }
        return $false
    }
}

while (-not (Test-PortAvailable $Port)) {
    $Port++
    if ($Port -gt $MaxPort) {
        Write-Error "No available ports in range $DefaultPort-$MaxPort"
        exit 1
    }
}

$ContainerName = "arcade-$Port"

Write-Host "Using port $Port"

# Remove any existing container with the same name before starting
$existing = docker ps -aq --filter "name=^${ContainerName}$" 2>$null
if ($existing) {
    docker rm -f $ContainerName | Out-Null
}

# Run the Docker container
docker run -d --name $ContainerName --env PORT=3000 -p "${Port}:3000" games
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

# Overwrite (not append) the port file so it reflects only the current run
Set-Content -Path $PortFile -Value "PORT=$Port"

Write-Host "Arcade running on http://localhost:$Port (container port 3000)"
