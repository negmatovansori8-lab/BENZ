import { query } from '../config/db.js';
import { NotificationModel } from '../models/Notification.js';

export async function notify({ userId, type, title, body, relatedId }) {
  return NotificationModel.create({ userId, type, title, body, relatedId });
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
    const trunc = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' }[period] || 'month';
    const interval = { daily: '30 days', weekly: '12 weeks', monthly: '12 months', yearly: '5 years' }[period];
    const { rows } = await query(
      `SELECT date_trunc('${trunc}', COALESCE(sold_at, created_at)) AS bucket,
              COUNT(*)::int AS count,
              COALESCE(SUM(price_usd), 0)::float AS gmv,
              COALESCE(SUM(price_usd) * 0.03, 0)::float AS revenue
       FROM cars
       WHERE status = 'SOLD' AND COALESCE(sold_at, created_at) >= NOW() - INTERVAL '${interval}'
       GROUP BY 1 ORDER BY 1`
    );
    return rows;
  },

  async popularBrands() {
    const { rows } = await query(`
      SELECT b.name, SUM(c.views)::int AS views, COUNT(*)::int AS listings,
             SUM(c.favorites_count)::int AS favorites
      FROM cars c JOIN brands b ON b.id = c.brand_id
      WHERE c.status IN ('APPROVED', 'SOLD')
      GROUP BY b.name ORDER BY views DESC LIMIT 12
    `);
    return rows;
  },

  async userGrowth() {
    const { rows } = await query(`
      SELECT date_trunc('month', created_at) AS bucket, COUNT(*)::int AS count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY 1 ORDER BY 1
    `);
    return rows;
  },

  async revenue() {
    const { rows } = await query(`
      SELECT date_trunc('month', COALESCE(sold_at, created_at)) AS bucket,
             COALESCE(SUM(price_usd) * 0.03, 0)::float AS revenue
      FROM cars
      WHERE status = 'SOLD' AND COALESCE(sold_at, created_at) >= NOW() - INTERVAL '12 months'
      GROUP BY 1 ORDER BY 1
    `);
    return rows;
  },
};
