#!/usr/bin/env bash
# Movie Web — chạy full stack (Linux / macOS)
# Từ thư mục gốc repo: chmod +x scripts/run.sh && ./scripts/run.sh
#
# Biến môi trường (tuỳ chọn):
#   MOVIE_WEB_FRONTEND_PORT — cổng Next.js (mặc định 3010)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== Movie Web - Run ==="

apiPort="3001"
backendEnv="$ROOT/backend/.env"
if [[ -f "$backendEnv" ]]; then
  # PORT= hoặc PORT = (bỏ khoảng trắng đầu dòng)
  if line="$(grep -E '^[[:space:]]*PORT[[:space:]]*=' "$backendEnv" | head -1)"; then
    apiPort="$(echo "$line" | sed -E 's/^[[:space:]]*PORT[[:space:]]*=[[:space:]]*//;s/"//g;s/\r//' | tr -d '[:space:]')"
  fi
else
  cp "$ROOT/backend/.env.example" "$backendEnv"
fi
[[ -z "${apiPort:-}" ]] && apiPort="3001"

frontendPort="${MOVIE_WEB_FRONTEND_PORT:-3010}"

echo ""
echo "[1] Docker compose..."
docker compose up -d
sleep 2

echo ""
echo "[2] Backend prisma..."
cd "$ROOT/backend"
npm install
npx prisma generate
if ! npx prisma migrate deploy; then
  echo "migrate deploy failed — thử: cd backend && npx prisma migrate dev" >&2
  exit 1
fi
npx prisma db seed
cd "$ROOT"

envLocal="$ROOT/frontend/.env.local"
printf 'NEXT_PUBLIC_API_URL=http://localhost:%s\n' "$apiPort" >"$envLocal"
echo "Wrote $envLocal -> http://localhost:$apiPort"

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo ""
echo "[3] Start backend (http://localhost:$apiPort) — nền..."
(cd "$ROOT/backend" && npm run start:dev) &
BACKEND_PID=$!

echo ""
echo "[4] Start frontend (http://localhost:$frontendPort)..."
cd "$ROOT/frontend"
npm install
npm run dev -- --port "$frontendPort"
