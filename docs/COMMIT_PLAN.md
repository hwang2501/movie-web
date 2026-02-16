# Commit Plan - MW-xx

## Current commits (logic flow)

| # | Message | MW |
|---|---------|-----|
| 1 | chore: init repo structure, gitignore | MW-01 |
| 2 | feat: init NestJS backend health endpoint | MW-02 |
| 3 | chore: add env.example template, fix gitignore | MW-04 |
| 4 | infra: docker compose, scripts, README | MW-04 |
| 5 | feat: Prisma schema, migrate, seed | MW-05 |
| 6 | feat(auth): register login refresh logout me, JWT + RBAC | MW-06,07,08,09,10 |
| 7 | feat: Movies CRUD API | MW-16 |
| 8 | feat: Episodes CRUD API | MW-17 |
| 9 | feat: Comments REST + Socket.IO realtime | MW-21 |
| 10 | feat: Redis cache movies + rate limit login/register | MW-22 |
| 11 | feat: Next.js frontend Home Detail Watch Auth Admin Favorites | MW-03, MW-23 |
| 12 | docs: plan, demo_script, testcases, HLS | MW-24, MW-25 |

## Workflow

```powershell
git checkout -b feature/MW-06-register
# ... code ...
git add .
git commit -m "feat(auth): register endpoint (MW-06)"
git push -u origin feature/MW-06-register
# Có thể merge main sau
```
