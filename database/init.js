require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');

async function initDatabase() {
  console.log('[Database Init] Starting database initialization...');
  
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    
    console.log('[Database Init] Schema created successfully');
    
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('[Database Init] Tables created:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    console.log('[Database Init] Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('[Database Init] Error:', error);
    process.exit(1);
  }
}

initDatabase();
