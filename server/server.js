import './config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';

import { pool, initDb, dbMode, lastDbError } from './config/db.js';
import authRoutes from './routes/auth.js';
import carRoutes from './routes/cars.js';
import favoriteRoutes from './routes/favorites.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import { notificationRouter, metaRouter, reviewRouter, profileRouter } from './routes/meta.js';
import homesRoutes from './routes/homes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { fetchLiveRates } from './utils/currency.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const isProd = process.env.NODE_ENV === 'production';

if (isProd && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change-this'))) {
  throw new Error('Set a strong JWT_SECRET in Railway before starting.');
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const extra = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (extra.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return !isProd;
    if (hostname.endsWith('.vercel.app')) return true;
  } catch {
    return false;
  }
  return false;
}

const uploadDir = path.resolve(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, status: 'ok', db: dbMode });
  } catch (err) {
    res.status(503).json({
      success: false,
      status: 'degraded',
      db: 'disconnected',
      error: lastDbError || err.code || 'query_failed',
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/homes', homesRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRouter);
app.use('/api/meta', metaRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/users', profileRouter);

app.use(notFound);
app.use(errorHandler);

fetchLiveRates().catch(() => {});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`BENZ API running on http://0.0.0.0:${PORT}`);
});

try {
  await initDb();
  console.log(`Database ready [${dbMode}]`);
} catch (err) {
  console.error('Database init failed:', err.message);
}
