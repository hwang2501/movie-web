# Test Cases

## Auth
| Case | Input | Expected |
|------|-------|----------|
| Register success | email mới, pass 6+ ký tự | 201, accessToken + refreshToken |
| Register duplicate | email đã tồn tại | 409 Conflict |
| Login success | admin@movie.web, admin123 | 200, tokens |
| Login fail | sai mật khẩu | 401 Unauthorized |
| Me (no token) | - | 401 |
| Me (valid token) | Bearer accessToken | 200, user info |
| Refresh | refreshToken | 200, new tokens |
| Logout | refreshToken | 200 |

## RBAC
| Case | User | /admin | Expected |
|------|------|--------|----------|
| Not logged in | - | GET | 401 |
| Member | member@movie.web | GET | 403 |
| Admin | admin@movie.web | GET | 200 |

## Rate limit
| Case | Action | Expected |
|------|--------|----------|
| Login 6 lần/1 phút | POST /auth/login | 429 Too Many Requests |
