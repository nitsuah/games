#!/usr/bin/env bash
set -euo pipefail
cd /mnt/c/Users/ajhar/code/games/app
npm run start > /tmp/next.log 2>&1 &
echo $! > /tmp/next.pid
echo "Started next with PID $(cat /tmp/next.pid)"
