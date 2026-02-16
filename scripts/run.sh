#!/bin/bash
# Movie Web - Chạy full stack (Linux/Mac)
# Chạy: ./scripts/run.sh

set -e

echo "=== Movie Web - Run ==="

echo -e "\n[1] Docker compose..."
docker compose up -d
sleep 5

echo -e "\n[2] Backend migrate + seed..."
cd backend
[ -f .env ] || cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
cd ..

echo -e "\n[3] Start backend (background)..."
cd backend && npm run start:dev &
BACKEND_PID=$!
cd ..

echo -e "\n[4] Start frontend..."
cd frontend
[ -f .env.local ] || echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm install
npm run dev
