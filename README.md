# Movie Web

Ứng dụng web xem phim được xây dựng với **Next.js (Frontend)** và **NestJS (Backend)**.  
Hệ thống hỗ trợ video streaming, quản lý phim và tối ưu hiệu năng bằng **Redis**.

---

## Links

- **GitHub:** https://github.com/hwang2501/movie-web

---

## Tech Stack

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL

### Frontend
- Next.js
- TypeScript

### Infrastructure
- Redis (Cache / Rate Limiting)
- Socket.IO (Realtime)
- Docker Compose (Local Environment)

---

## Setup & Run (Windows)

### 1. Requirements
- Docker Desktop
- Node.js 18+
- npm hoặc pnpm

### 2. Start PostgreSQL & Redis

```bash
docker compose up -d
```

**Ports:** PostgreSQL `5434`, Redis `6381`.

### 3. Backend

```bash
cd backend
copy .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

API: `http://localhost:<PORT>` — trong `.env` mặc định `PORT=3001` (hoặc giá trị bạn đặt; `frontend/.env.local` cần `NEXT_PUBLIC_API_URL` trùng cổng đó).

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Web: [http://localhost:3000](http://localhost:3000)

### Admin (local)

Sau `npx prisma db seed`, tài khoản mặc định được khai báo trong `backend/prisma/seed.ts`. Không vào được `/admin` thì chạy lại seed.

### Chạy nhanh (tuỳ chọn)

- **Windows:** từ thư mục gốc repo, `.\scripts\run.ps1` — bật Docker, `prisma migrate deploy`, seed, ghi `frontend/.env.local` theo `PORT` trong `backend/.env`, mở backend ở cửa sổ mới và chạy Next trên cổng `3010` (hoặc biến môi trường `MOVIE_WEB_FRONTEND_PORT`).
- **Linux / macOS:** `chmod +x scripts/run.sh && ./scripts/run.sh` — tương tự; backend chạy nền và **tắt khi bạn dừng frontend** (Ctrl+C).

Cả hai chỉ là tiện ích dev; luôn có thể chạy thủ công theo các bước ở trên.
