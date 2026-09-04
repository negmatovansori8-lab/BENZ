import { query } from '../config/db.js';

export const NotificationModel = {
  async create({ userId, type, title, body, relatedId }) {
    const { rows } = await query(
      `INSERT INTO notifications (user_id, type, title, body, related_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, type, title, body || null, relatedId || null]
    );
    return rows[0];
  },

  async list(userId, limit = 40) {
    const { rows } = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return rows;
  },

  async markRead(id, userId) {
    await query(`UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`, [id, userId]);
  },

  async markAllRead(userId) {
    await query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`, [userId]);
  },

  async unreadCount(userId) {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return rows[0].total;
  },
};
