import { query } from '../config/db.js';

export const FavoriteModel = {
  async list(userId) {
    const { rows } = await query(
      `SELECT f.id, f.car_id, f.created_at
       FROM favorites f WHERE f.user_id = $1 ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async ids(userId) {
    const { rows } = await query(`SELECT car_id FROM favorites WHERE user_id = $1`, [userId]);
    return rows.map((r) => r.car_id);
  },

  async add(userId, carId, client = { query }) {
    const { rows } = await client.query(
      `INSERT INTO favorites (user_id, car_id) VALUES ($1, $2)
       ON CONFLICT (user_id, car_id) DO NOTHING
       RETURNING *`,
      [userId, carId]
    );
    return rows[0] || null;
  },

  async remove(userId, carId) {
    const { rowCount } = await query(
      `DELETE FROM favorites WHERE user_id = $1 AND car_id = $2`,
      [userId, carId]
    );
    return rowCount > 0;
  },
};
