import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

const TTL_MS = 10 * 60 * 1000;
const COOLDOWN_MS = 60 * 1000;

export const EmailCodeModel = {
  async find(email, purpose) {
    const { rows } = await query(
      `SELECT * FROM email_codes WHERE email = $1 AND purpose = $2`,
      [email, purpose]
    );
    return rows[0] || null;
  },

  async save({ email, purpose, code, payload }) {
    const codeHash = await bcrypt.hash(code, 8);
    const expiresAt = new Date(Date.now() + TTL_MS).toISOString();
    await query(
      `INSERT INTO email_codes (email, purpose, code_hash, payload, expires_at, last_sent_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (email, purpose) DO UPDATE SET
         code_hash = EXCLUDED.code_hash,
         payload = EXCLUDED.payload,
         expires_at = EXCLUDED.expires_at,
         last_sent_at = NOW()`,
      [email, purpose, codeHash, JSON.stringify(payload || {}), expiresAt]
    );
  },

  tooSoon(row) {
    if (!row?.last_sent_at) return false;
    return Date.now() - new Date(row.last_sent_at).getTime() < COOLDOWN_MS;
  },

  async verify(email, purpose, code) {
    const row = await this.find(email, purpose);
    if (!row) return null;
    if (new Date(row.expires_at).getTime() < Date.now()) return { expired: true };
    const ok = await bcrypt.compare(String(code || ''), row.code_hash);
    if (!ok) return { invalid: true };
    return { row };
  },

  async remove(email, purpose) {
    await query(`DELETE FROM email_codes WHERE email = $1 AND purpose = $2`, [email, purpose]);
  },
};

export function randomCode() {
  return String(crypto.randomInt(100000, 1000000));
}
