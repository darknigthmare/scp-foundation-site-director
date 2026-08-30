#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 18 ou plus récent est requis." >&2
  exit 1
fi
if [ ! -f dist/game.js ]; then
  npm run build
fi
node scripts/serve.mjs --dist &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' INT TERM EXIT
sleep 1
URL="http://127.0.0.1:4173"
if command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then open "$URL" >/dev/null 2>&1 || true
fi
echo "SCP Foundation: Site Director est lancé sur $URL"
wait "$SERVER_PID"
