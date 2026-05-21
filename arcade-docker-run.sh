#!/usr/bin/env bash
# arcade-docker-run.sh
# Find an available port, run the arcade Docker container, and log the port for agent coordination.

set -e

PORT_FILE=".arcade-ports"
DEFAULT_PORT=3000
MAX_PORT=3999

if ! command -v lsof >/dev/null 2>&1; then
  echo "Missing dependency: lsof is required to find an available port." >&2
  exit 1
fi

# Find an available port
echo "Searching for available port..."
PORT=$DEFAULT_PORT
while lsof -i :"$PORT" >/dev/null 2>&1; do
  PORT=$((PORT+1))
  if [ "$PORT" -gt "$MAX_PORT" ]; then
    echo "No available ports in range $DEFAULT_PORT-$MAX_PORT" >&2
    exit 1
  fi
done

CONTAINER_NAME="arcade-$PORT"

echo "Using port $PORT"

if docker ps -aq --filter "name=^${CONTAINER_NAME}$" | grep -q .; then
  docker rm -f "$CONTAINER_NAME" >/dev/null
fi

docker run -d -p "$PORT":3000 --env PORT=3000 --name "$CONTAINER_NAME" games
printf 'PORT=%s\n' "$PORT" > "$PORT_FILE"

echo "Arcade running on http://localhost:$PORT (container port 3000)"
