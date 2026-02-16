# Demo Script - Movie Web

## Chuẩn bị
- Docker Desktop chạy
- `docker compose up -d`
- `cd backend && npm install && npx prisma migrate dev && npx prisma db seed && npm run start:dev`
- `cd frontend && npm install && npm run dev`

## Demo flow

1. **Home** - Xem danh sách phim (5 phim seed)
2. **Movie detail** - Click vào phim → xem thông tin + danh sách tập
3. **Watch** - Click tập → trang xem (placeholder HLS)
4. **Login** - admin@movie.web / admin123
5. **Admin** - /admin → 403 nếu chưa login admin
6. **Comments** - Xem bình luận ở trang Watch
7. **Register** - Tạo tài khoản mới
8. **Rate limit** - Gọi login/register liên tục → 429
