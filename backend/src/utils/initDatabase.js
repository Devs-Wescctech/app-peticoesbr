import pool from '../config/database.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function initDatabase() {
  try {
    const schemaSQL = fs.readFileSync(
      join(__dirname, '../config/schema.sql'),
      'utf-8'
    );
    
    await pool.query(schemaSQL);
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}
