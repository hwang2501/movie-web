# Commit Plan - MW-xx

## Mapping commits (25–35 commits)

| Commit | Message |
|--------|---------|
| 1 | chore: init repo structure, gitignore (MW-01) |
| 2 | infra: docker compose postgres+redis (MW-04) |
| 3 | infra: backend env.example, README (MW-04) |
| 4 | feat: init NestJS backend health endpoint (MW-02) |
| 5 | feat: Prisma schema users movies episodes comments (MW-05) |
| 6 | feat: Prisma migrate + seed admin/member/movies (MW-05) |
| 7 | feat(auth): register endpoint (MW-06) |
| 8 | feat(auth): login endpoint access/refresh JWT (MW-07) |
| 9 | feat(auth): refresh token hash + reuse revoke (MW-08) |
| 10 | feat(auth): logout revoke refresh token (MW-09) |
| 11 | feat(auth): RolesGuard protect /admin (MW-10) |
| 12 | feat: Movies CRUD API (MW-16) |
| 13 | feat: Episodes CRUD API (MW-17) |
| 14 | feat: Comments REST API (MW-21) |
| 15 | feat: Socket.IO realtime comments (MW-21) |
| 16 | feat: Redis cache movies + rate limit auth (MW-22) |
| 17 | feat: Init Next.js frontend (MW-03) |
| 18 | feat(ui): Home, Movie detail, Watch pages (MW-23) |
| 19 | feat(ui): Auth Login/Register (MW-23) |
| 20 | feat(ui): Admin movies, Favorites (MW-23) |
| 21 | docs: plan, demo_script, testcases (MW-24, MW-25) |

## Workflow

```powershell
git checkout -b feature/MW-06-register
# ... code ...
git add .
git commit -m "feat(auth): register endpoint (MW-06)"
git push -u origin feature/MW-06-register
# Có thể merge main sau
```
