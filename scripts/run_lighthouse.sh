#!/usr/bin/env bash
set -euo pipefail

# Canonical WSL-first Lighthouse runner
# - starts Next.js in WSL
# - launches Windows Chrome with remote debugging via PowerShell (captures PID)
# - runs lighthouse connecting to port 9222
# - writes ./app/lighthouse-report.json
# - cleans up Next and Chrome

APP_WIN_PATH="/mnt/c/Users/ajhar/code/games/app"
TMP_CHROME_PID="/mnt/c/Temp/chrome_lighthouse_pid.txt"

cd "$APP_WIN_PATH"

echo "Starting Next.js in WSL (background)"
npm run start > /tmp/next.log 2>&1 &
NEXT_PID=$!
echo "$NEXT_PID" > /tmp/next.pid
echo "Next PID=$NEXT_PID"

# Start Windows Chrome with remote debugging via PowerShell and capture PID to a file
WIN_CHROME_PATH_WIN='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
if [ -f "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" ]; then
  echo "Launching Windows Chrome with remote debugging on port 9222"
   # Start Chrome and write PID to C:\Temp\chrome_lighthouse_pid.txt using escaped PowerShell variables
   powershell.exe -NoProfile -Command "& { \$p = Start-Process -FilePath '$WIN_CHROME_PATH_WIN' -ArgumentList '--remote-debugging-port=9222','--user-data-dir=C:\\Temp\\lighthouse-profile','--no-first-run','--no-default-browser-check' -PassThru; [System.IO.File]::WriteAllText('C:\\Temp\\chrome_lighthouse_pid.txt',\$p.Id) }"
  # Wait briefly for chrome to start
  sleep 2
  if [ -f "/mnt/c/Temp/chrome_lighthouse_pid.txt" ]; then
    CHROME_PID_WSL=$(cat /mnt/c/Temp/chrome_lighthouse_pid.txt)
    echo "Windows Chrome PID: $CHROME_PID_WSL"
    CHROME_STARTED=true
  else
    echo "Warning: Chrome PID file not found; proceeding but may fail to connect"
    CHROME_STARTED=false
  fi
else
  echo "Windows Chrome not found at /mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
  CHROME_STARTED=false
fi

# Wait for Next to be healthy
echo "Waiting for Next to respond on http://127.0.0.1:3000"
for i in $(seq 1 60); do
  if curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200"; then
    echo "Server up"
    break
  fi
  sleep 1
done

if ! curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000 | grep -q "200"; then
  echo "Server did not start in time"
  kill "$NEXT_PID" || true
  [ -n "${CHROME_PID_WSL:-}" ] && powershell.exe -NoProfile -Command "Stop-Process -Id ${CHROME_PID_WSL} -Force" || true
  exit 2
fi

# Run Lighthouse
REPORT_PATH="./lighthouse-report.json"
if [ "$CHROME_STARTED" = true ]; then
  echo "Running Lighthouse connecting to Chrome on port 9222"
  # Wait for Chrome remote-debugging endpoint to be available before running Lighthouse
  echo "Waiting for Chrome remote-debugging on http://127.0.0.1:9222"
  for j in $(seq 1 20); do
    if curl -sS http://127.0.0.1:9222/json/version > /dev/null 2>&1; then
      echo "Chrome remote-debugging is available"
      break
    fi
    sleep 1
  done
  if ! curl -sS http://127.0.0.1:9222/json/version > /dev/null 2>&1; then
    echo "Warning: Chrome remote-debugging endpoint not responding; attempting Lighthouse anyway"
  fi
  npx --yes lighthouse http://127.0.0.1:3000 --port=9222 --output=json --output-path "$REPORT_PATH" --quiet || LH_EXIT=$?
else
  echo "Running Lighthouse (default headless)"
  npx --yes lighthouse http://127.0.0.1:3000 --output=json --output-path "$REPORT_PATH" --chrome-flags='--headless --no-sandbox' --quiet || LH_EXIT=$?
fi

LH_EXIT=${LH_EXIT:-0}

echo "Lighthouse exit code: $LH_EXIT"

# Cleanup Next and Chrome
echo "Cleaning up: killing Next PID $NEXT_PID"
kill "$NEXT_PID" || true
rm -f /tmp/next.pid

if [ -n "${CHROME_PID_WSL:-}" ]; then
  echo "Stopping Windows Chrome PID $CHROME_PID_WSL"
  powershell.exe -NoProfile -Command "Try { Stop-Process -Id ${CHROME_PID_WSL} -Force } Catch { }"
  rm -f /mnt/c/Temp/chrome_lighthouse_pid.txt || true
fi

exit $LH_EXIT
