import { query } from '../config/db.js';
import { phoneLookupVariants } from '../utils/supabaseAuth.js';

const PUBLIC_USER = 'id, name, email, phone, avatar, role, is_blocked, created_at, last_login_at';
const DEMO_ADMIN_EMAIL = 'admin@autohub.tj';

function ownerAdminEmails() {
  const extra = String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([
    'negmatovansori8@gmail.com',
    'negmatovansi8@gmail.com',
    'nurjahonismoilov531@gmail.com',
    ...extra,
  ])];
}

export const UserModel = {
  async findByEmail(email) {
    const normalized = String(email || '').trim().toLowerCase();
    const { rows } = await query(
      `SELECT * FROM users WHERE lower(email) = $1 LIMIT 1`,
      [normalized]
    );
    return rows[0] || null;
  },

  async findByPhone(phone) {
    const variants = phoneLookupVariants(phone);
    if (!variants.length) return null;
    const { rows } = await query(
      `SELECT * FROM users
       WHERE regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') = ANY($1::text[])
       LIMIT 1`,
      [variants]
    );
    return rows[0] || null;
  },

  async findByLogin(identifier) {
    const raw = String(identifier || '').trim();
    if (!raw) return null;
    if (raw.includes('@')) return this.findByEmail(raw);
    return this.findByPhone(raw);
  },

  async updatePassword(id, passwordHash) {
    await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [passwordHash, id]);
    return this.findById(id);
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

  isOwnerEmail(email) {
    return ownerAdminEmails().includes(String(email || '').trim().toLowerCase());
  },

  async isOwnerAccount(user) {
    if (!user) return false;
    if (this.isOwnerEmail(user.email)) return true;
    return String(user.name || '').toLowerCase().includes('ismoil');
  },

  isDemoAdminEmail(email) {
    return String(email || '').trim().toLowerCase() === DEMO_ADMIN_EMAIL;
  },

  async ensureOwnerAdmin(email) {
    const normalized = String(email || '').trim().toLowerCase();
    const { rows } = await query(
      `UPDATE users SET role = 'ADMIN', is_blocked = false, updated_at = NOW()
       WHERE lower(email) = $1
         AND (
           lower(email) = ANY($2::text[])
           OR lower(name) LIKE '%ismoil%'
         )
       RETURNING ${PUBLIC_USER}`,
      [normalized, ownerAdminEmails()]
    );
    return rows[0] || null;
  },

  async lockPublicDemoAdmin() {
    await query(
      `UPDATE users SET role = 'USER', is_blocked = true, updated_at = NOW()
       WHERE lower(email) = $1`,
      [DEMO_ADMIN_EMAIL]
    );
  },

  async promoteOwnerAdmins() {
    await this.lockPublicDemoAdmin();
    const emails = ownerAdminEmails();
    if (emails.length) {
      await query(
        `UPDATE users SET role = 'ADMIN', is_blocked = false, updated_at = NOW()
         WHERE lower(email) = ANY($1::text[])`,
        [emails]
      );
    }
    // Site owner accounts by display name (ISMOIL / ISMOILJON)
    await query(
      `UPDATE users SET role = 'ADMIN', is_blocked = false, updated_at = NOW()
       WHERE lower(name) LIKE '%ismoil%'`
    );
  },

  /** Remove seeded fake *@autohub.tj accounts; keep real registrants. */
  async removeDemoAccounts() {
    const { rows: admins } = await query(
      `SELECT id FROM users
       WHERE role = 'ADMIN' AND lower(email) NOT LIKE '%@autohub.tj'
       ORDER BY id LIMIT 1`
    );
    const adminId = admins[0]?.id || null;
    if (adminId) {
      await query(
        `UPDATE cars SET seller_id = $1
         WHERE seller_id IN (SELECT id FROM users WHERE lower(email) LIKE '%@autohub.tj')`,
        [adminId]
      );
      await query(
        `UPDATE properties SET seller_id = $1
         WHERE seller_id IN (SELECT id FROM users WHERE lower(email) LIKE '%@autohub.tj')`,
        [adminId]
      );
    }
    const result = await query(`DELETE FROM users WHERE lower(email) LIKE '%@autohub.tj'`);
    return result.rowCount || 0;
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
