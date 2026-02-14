# Movie Web

Đồ án web xem phim - Next.js + NestJS + PostgreSQL + Redis.

## Links

- **GitHub**: https://github.com/hwang2501/movie-web.git
- **Jira Plan**: \<paste_here\> *(dán link Jira nếu có)*

## Tech Stack

- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL
- **Frontend**: Next.js, TypeScript
- **Cache/Rate limit**: Redis
- **Realtime**: Socket.IO

## Hướng dẫn chạy (Windows)

### 1. Chuẩn bị môi trường

- Cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 18+ và npm/pnpm

### 2. Khởi động Postgres + Redis

```powershell
docker compose up -d
```

### 3. Backend

```powershell
cd backend
copy .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### 4. Frontend

```powershell
cd frontend
npm install
npm run dev
```

- Backend: http://localhost:3001  
- Frontend: http://localhost:3000

## Cấu trúc

```
movie-web/
├── backend/      # NestJS API
├── frontend/     # Next.js app
├── docs/         # Tài liệu, plan, demo script
└── docker-compose.yml
```
