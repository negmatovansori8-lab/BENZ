import { query } from '../config/db.js';

const PUBLIC_USER = 'id, name, email, phone, avatar, role, is_blocked, created_at, last_login_at';

export const UserModel = {
  async findByEmail(email) {
    const { rows } = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query(`SELECT ${PUBLIC_USER} FROM users WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  async findByIdWithHash(id) {
    const { rows } = await query(`SELECT * FROM users WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  async create({ name, email, passwordHash, phone, role = 'USER', avatar }) {
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, phone, role, avatar)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${PUBLIC_USER}`,
      [name, email, passwordHash, phone || null, role, avatar || null]
    );
    return rows[0];
  },

  async update(id, fields) {
    const allowed = ['name', 'phone', 'avatar', 'role'];
    const sets = [];
    const values = [];
    let i = 1;
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = $${i++}`);
        values.push(fields[key]);
      }
    }
    if (!sets.length) return this.findById(id);
    values.push(id);
    const { rows } = await query(
      `UPDATE users SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING ${PUBLIC_USER}`,
      values
    );
    return rows[0];
  },

  async setBlocked(id, blocked) {
    const { rows } = await query(
      `UPDATE users SET is_blocked = $1, updated_at = NOW() WHERE id = $2 RETURNING ${PUBLIC_USER}`,
      [blocked, id]
    );
    return rows[0];
  },

  async remove(id) {
    await query(`DELETE FROM users WHERE id = $1`, [id]);
  },

  async recordLogin(id) {
    try {
      await query(`UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`, [id]);
    } catch {
      /* column may be missing on first boot */
    }
    try {
      await query(`INSERT INTO login_events (user_id) VALUES ($1)`, [id]);
    } catch {
      /* table may not exist yet */
    }
    return this.findById(id);
  },

  async recentLogins(limit = 12) {
    const { rows } = await query(
      `SELECT ${PUBLIC_USER} FROM users WHERE last_login_at IS NOT NULL ORDER BY last_login_at DESC LIMIT $1`,
      [limit]
    );
    return rows;
  },

  async list({ q, role, page, limit, offset }) {
    const where = [];
    const params = [];
    let i = 1;
    if (q) {
      where.push(`(name ILIKE $${i} OR email ILIKE $${i})`);
      params.push(`%${q}%`);
      i++;
    }
    if (role) {
      where.push(`role = $${i++}`);
      params.push(role);
    }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const count = await query(`SELECT COUNT(*)::int AS total FROM users ${clause}`, params);
    const { rows } = await query(
      `SELECT ${PUBLIC_USER} FROM users ${clause} ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
      [...params, limit, offset]
    );
    return { rows, total: count.rows[0].total };
  },

  async counts() {
    const { rows } = await query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE role = 'SELLER')::int AS sellers,
        COUNT(*) FILTER (WHERE role = 'USER')::int AS buyers,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last_30
      FROM users
    `);
    return rows[0];
  },
};
