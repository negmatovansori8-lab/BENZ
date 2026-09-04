# BENZ — деплой (Vercel + Railway + Neon)

Фронт: **Vercel** · Бекенд: **Railway** · База: **Neon**

Аввал коди лоиҳаро ба GitHub пуш кунед.

---

## 1. Neon (база)

1. [neon.tech](https://neon.tech) — лоиҳа созед.
2. **Connection string** гиред (Connection pooling ё Direct).
   - Дар охир `?sslmode=require` бошад.
3. Мисол:
   `postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

Ҳангоми аввалин оғози API, ҷадвалҳо худ сохта мешаванд ва маълумоти демо пур мешавад.
Агар база холӣ мондан хоҳед: `SKIP_SEED=1`.

Демо пас аз seed:
- Admin: `admin@autohub.tj` / `Admin123!`
- Seller: `rustam@autohub.tj` / `Password123!`

---

## 2. Railway (бекенд)

1. [railway.app](https://railway.app) — New Project → Deploy from GitHub.
2. **Root Directory:** `server`
3. Variables:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Neon connection string |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | калимаи дароз ва тасодуфӣ |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://YOUR-APP.vercel.app` (пас аз Vercel) |
| `UPLOAD_DIR` | `uploads` |

4. Generate Domain — URL-ро нусха кунед, масалан `https://benz-api.up.railway.app`
5. Health: `https://YOUR-RAILWAY-URL/api/health` бояд `{ "status": "ok", "db": "postgres" }` диҳад.

Аксҳои боршуда дар диски Railway нест мешаванд агар Volume нагузоред.
Volume: mount `/app/uploads`, `UPLOAD_DIR=uploads`.

---

## 3. Vercel (фронт)

1. [vercel.com](https://vercel.com) — Import GitHub repo.
2. **Root Directory:** `client`
3. Framework: Vite
4. Environment Variables (Production **ва** Preview):

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://YOUR-RAILWAY-URL` (бе `/` дар охир, бе `/api`) |

5. Deploy.
6. Домени Vercel-ро ба Railway `CLIENT_URL` гузоред, сипас Railway-ро Redeploy кунед.

---

## Тартиби дуруст

1. Neon  
2. Railway (`DATABASE_URL` + `JWT_SECRET`)  
3. Vercel (`VITE_API_URL`)  
4. Railway `CLIENT_URL` = домени Vercel  

`VITE_API_URL` ҳангоми **build** хонда мешавад. Агар иваз кунед, Vercel-ро аз нав Deploy кунед.

---

## Локалӣ

```bash
# server
cd server && npm install && npm run dev

# client
cd client && npm install && npm run dev
```

Фронти локалӣ `/api`-ро ба `localhost:5000` прокси мекунад. `VITE_API_URL` лозим нест.
