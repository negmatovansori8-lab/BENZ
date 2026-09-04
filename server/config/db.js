import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import './env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

let impl = null;
export let dbMode = 'unknown';

function wrapResult(result) {
  if (!result) return { rows: [], rowCount: 0 };
  const rows = result.rows || [];
  return {
    ...result,
    rows,
    rowCount: result.rowCount ?? result.affectedRows ?? rows.length,
  };
}

export function schemaPath() {
  const candidates = [
    path.resolve(__dirname, '../schema.sql'),
    path.resolve(__dirname, '../../database/schema.sql'),
  ];
  return candidates.find((p) => fs.existsSync(p)) || candidates[0];
}

function needsSsl(url) {
  if (!url) return false;
  if (process.env.PGSSL === 'false') return false;
  if (process.env.PGSSL === 'true') return true;
  return /neon\.tech|sslmode=require|amazonaws\.com/i.test(url);
}

async function bootstrapPostgres(poolImpl) {
  const schema = fs.readFileSync(schemaPath(), 'utf8');
  await poolImpl.query(schema);
  const { rows } = await poolImpl.query('SELECT COUNT(*)::int AS n FROM users');
  if (Number(rows[0]?.n || 0) > 0) return;
  if (process.env.SKIP_SEED === '1' || process.env.SKIP_SEED === 'true') {
    console.log('Empty database — SKIP_SEED is set, not loading demo data.');
    return;
  }
  console.log('Empty database — loading demo data…');
  const { seedDatabase } = await import('../scripts/seed.js');
  await seedDatabase({ close: false, skipSchema: true });
}

export async function initDb() {
  if (impl) return impl;

  const isProd = process.env.NODE_ENV === 'production';
  const url = process.env.DATABASE_URL;
  const allowEmbedded = !isProd && process.env.FORCE_EMBEDDED_DB !== '0';

  if (!url && isProd) {
    throw new Error('DATABASE_URL is required in production (Neon).');
  }

  if (url && process.env.FORCE_EMBEDDED_DB !== '1') {
    try {
      const pool = new Pool({
        connectionString: url,
        max: Number(process.env.PG_POOL_MAX || 10),
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: Number(process.env.PG_TIMEOUT_MS || 20_000),
        ssl: needsSsl(url) ? { rejectUnauthorized: false } : undefined,
      });
      await pool.query('SELECT 1');
      impl = {
        type: 'postgres',
        query: (text, params) => pool.query(text, params),
        connect: () => pool.connect(),
        end: () => pool.end(),
      };
      dbMode = 'postgres';
      console.log('Database: PostgreSQL / Neon');
      await bootstrapPostgres(pool);
      const { migrateAndSeedExtras } = await import('../scripts/seedExtras.js');
      await migrateAndSeedExtras();
      return impl;
    } catch (err) {
      if (isProd) throw err;
      console.warn('PostgreSQL unavailable (%s). Using embedded database.', err.code || err.message);
    }
  }

  if (!allowEmbedded) {
    throw new Error('Database unavailable. Set DATABASE_URL to your Neon connection string.');
  }

  const { PGlite } = await import('@electric-sql/pglite');
  const dataDir = path.resolve(__dirname, '../data/pglite');
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new PGlite(dataDir);
  await db.waitReady;

  impl = {
    type: 'pglite',
    query: async (text, params = []) => wrapResult(await db.query(text, params)),
    transaction: (fn) => db.transaction(fn),
    end: async () => db.close?.(),
    exec: (sql) => db.exec(sql),
  };
  dbMode = 'pglite';
  console.log('Database: embedded PGlite (no PostgreSQL install required)');

  await bootstrapEmbedded();
  const { migrateAndSeedExtras } = await import('../scripts/seedExtras.js');
  await migrateAndSeedExtras();
  return impl;
}

async function bootstrapEmbedded() {
  const schema = fs.readFileSync(schemaPath(), 'utf8');
  await impl.exec(schema);

  const { rows } = await impl.query('SELECT COUNT(*)::int AS n FROM users');
  if (Number(rows[0]?.n) > 0) return;

  console.log('Empty database — loading demo data…');
  const { seedDatabase } = await import('../scripts/seed.js');
  await seedDatabase({ close: false, skipSchema: true });
}

export async function execSql(sql) {
  if (!impl) await initDb();
  if (impl.exec) return impl.exec(sql);
  return impl.query(sql);
}

export async function query(text, params = []) {
  if (!impl) await initDb();
  return wrapResult(await impl.query(text, params));
}

export async function withTransaction(fn) {
  if (!impl) await initDb();
  if (impl.type === 'postgres') {
    const client = await impl.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  return impl.transaction(async (tx) => {
    const client = {
      query: async (text, params = []) => wrapResult(await tx.query(text, params)),
    };
    return fn(client);
  });
}

export const pool = {
  query: (text, params) => query(text, params),
  end: async () => impl?.end?.(),
};
