import pool from '../config/database.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function initDatabase() {
  try {
    // 1. Inicializa Control-Plane schema (auth, tenants)
    console.log('🔄 Creating control-plane schema...');
    const controlPlaneSQL = fs.readFileSync(
      join(__dirname, '../config/control-plane-schema.sql'),
      'utf-8'
    );
    await pool.query(controlPlaneSQL);
    console.log('✅ Control-plane schema created');
    
    // 2. Inicializa Tenant schema (petitions, signatures, etc)
    // Este será o schema padrão usado por cada tenant
    console.log('🔄 Creating tenant schema...');
    const tenantSchemaSQL = fs.readFileSync(
      join(__dirname, '../config/schema.sql'),
      'utf-8'
    );
    await pool.query(tenantSchemaSQL);
    console.log('✅ Tenant schema created');
    
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}
