import { query } from '../config/db.js';
import { NotificationModel } from '../models/Notification.js';

export async function notify({ userId, type, title, body, relatedId }) {
  return NotificationModel.create({ userId, type, title, body, relatedId });
}

function periodConfig(period) {
  const map = {
    daily: { trunc: 'day', interval: '30 days', steps: 30, unit: 'day' },
    weekly: { trunc: 'week', interval: '12 weeks', steps: 12, unit: 'week' },
    monthly: { trunc: 'month', interval: '12 months', steps: 12, unit: 'month' },
    yearly: { trunc: 'year', interval: '5 years', steps: 5, unit: 'year' },
  };
  return map[period] || map.monthly;
}

function toIsoDay(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
}

function startOfBucket(date, unit) {
  const d = new Date(date);
  if (unit === 'year') return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  if (unit === 'month') return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  if (unit === 'week') {
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() - (day - 1));
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addBucket(date, unit, n = 1) {
  const d = new Date(date);
  if (unit === 'year') d.setUTCFullYear(d.getUTCFullYear() + n);
  else if (unit === 'month') d.setUTCMonth(d.getUTCMonth() + n);
  else if (unit === 'week') d.setUTCDate(d.getUTCDate() + 7 * n);
  else d.setUTCDate(d.getUTCDate() + n);
  return d;
}

function fillSeries(rows, { steps, unit }, valueKeys) {
  const byKey = new Map(
    (rows || []).map((r) => {
      const key = toIsoDay(startOfBucket(new Date(r.bucket), unit));
      return [key, r];
    })
  );

  const end = startOfBucket(new Date(), unit);
  const start = addBucket(end, unit, -(steps - 1));
  const out = [];
  let cursor = start;
  let prev = null;

  for (let i = 0; i < steps; i++) {
    const key = toIsoDay(cursor);
    const raw = byKey.get(key) || {};
    const point = { bucket: key };
    for (const k of valueKeys) {
      point[k] = Number(raw[k] || 0);
    }
    const primary = valueKeys[0];
    const cur = point[primary];
    const before = prev == null ? null : Number(prev[primary] || 0);
    point.pct = before == null || before === 0
      ? (cur > 0 ? 100 : 0)
      : Math.round(((cur - before) / before) * 1000) / 10;
    out.push(point);
    prev = point;
    cursor = addBucket(cursor, unit, 1);
  }
  return out;
}

export const AnalyticsService = {
  async dashboard() {
    const users = await query(`
      SELECT
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (WHERE role = 'SELLER')::int AS total_sellers,
        COUNT(*) FILTER (WHERE is_blocked)::int AS blocked
      FROM users
    `);
    const cars = await query(`
      SELECT
        COUNT(*)::int AS total_cars,
        COUNT(*) FILTER (WHERE status = 'APPROVED')::int AS active_listings,
        COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'SOLD')::int AS sold_cars,
        COALESCE(SUM(price_usd) FILTER (WHERE status = 'SOLD') * 0.03, 0)::float AS total_revenue,
        COALESCE(SUM(price_usd) FILTER (WHERE status = 'SOLD'), 0)::float AS gmv
      FROM cars
    `);
    const recent = await query(`
      SELECT id, name, email, role, last_login_at
      FROM users
      WHERE last_login_at IS NOT NULL
      ORDER BY last_login_at DESC
      LIMIT 12
    `).catch(() => ({ rows: [] }));
    return { ...users.rows[0], ...cars.rows[0], recent_logins: recent.rows };
  },

  async sales(period = 'monthly') {
    const cfg = periodConfig(period);
    const { rows } = await query(
      `SELECT date_trunc('${cfg.trunc}', COALESCE(sold_at, created_at)) AS bucket,
              COUNT(*)::int AS count,
              COALESCE(SUM(price_usd), 0)::float AS gmv,
              COALESCE(SUM(price_usd) * 0.03, 0)::float AS revenue
       FROM cars
       WHERE status = 'SOLD' AND COALESCE(sold_at, created_at) >= NOW() - INTERVAL '${cfg.interval}'
       GROUP BY 1 ORDER BY 1`
    );
    return fillSeries(rows, cfg, ['count', 'gmv', 'revenue']);
  },

  async popularBrands() {
    const { rows } = await query(`
      SELECT b.name, SUM(c.views)::int AS views, COUNT(*)::int AS listings,
             SUM(c.favorites_count)::int AS favorites
      FROM cars c JOIN brands b ON b.id = c.brand_id
      WHERE c.status IN ('APPROVED', 'SOLD')
      GROUP BY b.name ORDER BY views DESC LIMIT 12
    `);
    const total = rows.reduce((s, r) => s + Number(r.views || 0), 0) || 1;
    return rows.map((r) => ({
      ...r,
      pct: Math.round((Number(r.views || 0) / total) * 1000) / 10,
    }));
  },

  async userGrowth(period = 'monthly') {
    const cfg = periodConfig(period);
    const { rows } = await query(
      `SELECT date_trunc('${cfg.trunc}', created_at) AS bucket, COUNT(*)::int AS count
       FROM users
       WHERE created_at >= NOW() - INTERVAL '${cfg.interval}'
       GROUP BY 1 ORDER BY 1`
    );
    return fillSeries(rows, cfg, ['count']);
  },

  async revenue(period = 'monthly') {
    const cfg = periodConfig(period);
    const { rows } = await query(
      `SELECT date_trunc('${cfg.trunc}', COALESCE(sold_at, created_at)) AS bucket,
              COALESCE(SUM(price_usd) * 0.03, 0)::float AS revenue
       FROM cars
       WHERE status = 'SOLD' AND COALESCE(sold_at, created_at) >= NOW() - INTERVAL '${cfg.interval}'
       GROUP BY 1 ORDER BY 1`
    );
    return fillSeries(rows, cfg, ['revenue']);
  },
};
