#!/bin/bash
# start.sh — XGRC LinkedIn Content Studio launcher

cd "$(dirname "$0")"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Kill any lingering Next.js dev servers
NEXT_PIDS=$(pgrep -f "next dev" 2>/dev/null)
if [ -n "$NEXT_PIDS" ]; then
  echo "Stopping previous Next.js instances..."
  echo "$NEXT_PIDS" | xargs kill -9 2>/dev/null
  sleep 1
fi

# Also free port 3000 if anything else holds it
PORT_PID=$(lsof -ti :3000 2>/dev/null)
if [ -n "$PORT_PID" ]; then
  echo "Freeing port 3000 (PID $PORT_PID)..."
  kill -9 $PORT_PID 2>/dev/null
  sleep 1
fi

npx prisma migrate deploy 2>/dev/null || npx prisma db push

npm run dev &
SERVER_PID=$!

echo "Starting XGRC LinkedIn Studio..."
until curl -s http://localhost:3000 > /dev/null 2>&1; do
  sleep 1
done

# Open via xgrc.local if hosts entry exists, otherwise localhost
if grep -q "xgrc.test" /etc/hosts 2>/dev/null; then
  open "http://xgrc.test:3000"
  echo "App running at http://xgrc.test:3000 — press Ctrl+C to stop"
else
  open "http://localhost:3000"
  echo "App running at http://localhost:3000 — press Ctrl+C to stop"
  echo ""
  echo "Tip: run the two commands below once to get http://xgrc.test:3000 instead:"
  echo "  sudo sh -c 'echo \"127.0.0.1 xgrc.test\" >> /etc/hosts'"
  echo "  sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder"
fi

wait $SERVER_PID
