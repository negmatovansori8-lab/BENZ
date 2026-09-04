# AUTOHUB

**Мошини худро пайдо кун. Бо боварӣ хар.**

Professional car marketplace: search, compare, favorites, listings, messaging, seller dashboard, and admin analytics.

## 1. Installation

Requirements: **Node.js 20+**, **PostgreSQL 14+** (or Docker).

```bash
cd autohub
copy .env.example .env
npm run install:all
```

On macOS/Linux use `cp .env.example .env`.

## 2. Environment Variables

Edit `.env` in the project root:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port (default `5000`) |
| `CLIENT_URL` | Frontend origin for CORS |
| `JWT_SECRET` | Long random secret — never commit a real one |
| `JWT_EXPIRES_IN` | Token lifetime (`7d`) |
| `FX_USD_TJS` / `FX_USD_EUR` / `FX_USD_RUB` | Fallback FX rates |
| `FX_API_URL` / `FX_API_KEY` | Optional live FX provider |

Secrets stay on the server. The React app never stores API keys.

## 3. Database Setup

Start PostgreSQL, create database `autohub`, then load schema + demo data:

```bash
docker compose up -d
cd server
npm run seed
```

Without Docker:

```sql
CREATE DATABASE autohub;
```

```bash
cd server
npm run seed
```

Seed includes **30 cars**, **11 users** (1 admin, 5 sellers, 5 buyers), **12 brands**, locations, messages, favorites, and reviews.

Schema lives in `database/schema.sql`.

## 4. Run Frontend

```bash
cd client
npm run dev
```

Opens **http://localhost:5173** (proxies `/api` and `/uploads` to the backend).

## 5. Run Backend

```bash
cd server
npm run dev
```

API: **http://localhost:5000**  
Health: `GET /api/health`

## 6. API Documentation

All JSON responses use `{ success, data|user|message, details? }`.  
Send `Authorization: Bearer <token>` for protected routes.

### Auth
- `POST /api/auth/register` — `{ name, email, password, phone? }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/auth/me`
- `PUT /api/auth/me`

### Cars
- `GET /api/cars` — filters: `q`, `brand`, `model`, `minPrice`, `maxPrice`, `yearFrom`, `yearTo`, `minMileage`, `maxMileage`, `fuel`, `transmission`, `body`, `country`, `city`, `sort`, `page`, `limit`, `featured`
- `GET /api/cars/featured` · `/recent` · `/popular`
- `GET /api/cars/:id`
- `POST /api/cars` — multipart listing (auth)
- `PUT /api/cars/:id`
- `DELETE /api/cars/:id`
- `POST /api/cars/:id/sold` · `/pause`
- `GET /api/cars/mine` · `/dashboard`

### Favorites / Messages
- `GET|POST /api/favorites` · `DELETE /api/favorites/:id`
- `GET /api/messages` · `POST /api/messages` `{ car_id, content }`
- `GET /api/messages/:id` · `POST /api/messages/:id` `{ content }`

### Admin (role `ADMIN`)
- `GET /api/admin/stats`
- `GET /api/admin/analytics?period=daily|weekly|monthly|yearly`
- `GET /api/admin/users` · `GET /api/admin/users/:id`
- `POST /api/admin/users/:id/block` · `/unblock` · `DELETE /api/admin/users/:id`
- `GET /api/admin/cars`
- `POST /api/admin/cars/:id/approve` · `/reject` · `/feature`
- `PUT|DELETE /api/admin/cars/:id`

### Meta
- `GET /api/meta/brands` · `/locations` · `/rates`

Sort values: `newest`, `oldest`, `price_asc`, `price_desc`, `mileage_asc`, `popular`.

Listing statuses: `PENDING` · `APPROVED` · `REJECTED` · `SOLD` · `PAUSED`.

## 7. Admin Login

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@autohub.tj` | `Admin123!` |
| Seller | `rustam@autohub.tj` | `Password123!` |
| Buyer | `nigina@autohub.tj` | `Password123!` |

Admin panel: **http://localhost:5173/admin**

---

### Production notes

- Set a strong `JWT_SECRET` and `NODE_ENV=production`.
- Put PostgreSQL and the API behind TLS.
- Serve `client/dist` (`npm run build` in `client`) from Nginx or a CDN; proxy `/api` and `/uploads` to Node.
- Swap FX fallbacks for a live provider via `FX_API_URL`.
- Rate limiting, Helmet, CORS, bcrypt (cost 12), parameterized SQL, and role checks are already enabled.
