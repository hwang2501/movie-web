Movie Web

Ứng dụng web xem phim được xây dựng với Next.js (Frontend) và NestJS (Backend).
Hệ thống hỗ trợ video streaming, quản lý phim và tối ưu hiệu năng bằng Redis.

Links

GitHub: https://github.com/hwang2501/movie-web

Tech Stack

Backend

NestJS

TypeScript

Prisma ORM

PostgreSQL

Frontend

Next.js

TypeScript

Infrastructure

Redis (Cache / Rate Limiting)

Socket.IO (Realtime)

Docker Compose (Local environment)

Setup & Run (Windows)
1. Requirements

Docker Desktop

Node.js 18+

npm hoặc pnpm

2. Start PostgreSQL & Redis
docker compose up -d

Ports used:

PostgreSQL → 5434

Redis → 6381

(Ports được đổi để tránh conflict với project khác)

3. Run Backend
cd backend
copy .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev

Backend chạy tại:

http://localhost:3001
4. Run Frontend
cd frontend
npm install
npm run dev

Frontend chạy tại:

http://localhost:3000
