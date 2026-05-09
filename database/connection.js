const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'prisma_backend',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('[PostgreSQL] Connected to database');
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected error:', err);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.log('[PostgreSQL] Slow query:', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('[PostgreSQL] Query error:', error);
    throw error;
  }
}

async function getClient() {
  return await pool.connect();
}

module.exports = {
  query,
  getClient,
  pool
};
