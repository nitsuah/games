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
        $tcpListener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
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

Write-Host "Using port $Port"

Add-Content -Path $PortFile -Value "PORT=$Port"



# Run the Docker container (final correct argument order)
docker run -d --name arcade-$Port --env PORT=3000 -p $Port:3000 games

Write-Host "Arcade running on http://localhost:$Port (container port 3000)"