#!/usr/bin/env bash
set -euo pipefail
cd /mnt/c/Users/ajhar/code/games/app

# Start Next.js in background and capture PID
npm run start > /tmp/next.log 2>&1 &
PID=$!
echo "Started next PID=$PID"

# Wait for server up to 60s
for i in $(seq 1 60); do
  if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200"; then
    echo "Server up"
    break
  fi
  sleep 1
done

if ! curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200"; then
  echo "Server did not start in time"
  kill "$PID" || true
  exit 2
fi

# Run Lighthouse (headless) and write JSON to app directory
npx --yes lighthouse http://127.0.0.1:3000 --output=json --output-path ./lighthouse-report.json --chrome-flags='--headless --no-sandbox' --quiet
EXIT_CODE=$?

# Stop server
# If Windows Chrome exists, try running Lighthouse with that chrome binary to avoid WSL Chrome issues
WIN_CHROME_PATH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
if [ -x "$WIN_CHROME_PATH" ]; then
  echo "Found Windows Chrome at $WIN_CHROME_PATH — using it for Lighthouse"
  npx --yes lighthouse http://127.0.0.1:3000 --output=json --output-path ./lighthouse-report.json --chrome-path="$WIN_CHROME_PATH" --chrome-flags='--headless --no-sandbox --disable-gpu' --quiet
  EXIT_CODE=$?
else
  echo "Windows Chrome not found at $WIN_CHROME_PATH — attempting default Lighthouse launch"
  npx --yes lighthouse http://127.0.0.1:3000 --output=json --output-path ./lighthouse-report.json --chrome-flags='--headless --no-sandbox' --quiet
  EXIT_CODE=$?
fi

kill "$PID" || true
exit $EXIT_CODE
