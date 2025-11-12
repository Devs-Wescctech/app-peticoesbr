import express from 'express';
import pool from '../config/database.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/tenants', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.slug,
        t.plan,
        t.status,
        t.created_date,
        COUNT(DISTINCT tu.user_id) as user_count,
        COUNT(DISTINCT p.id) as petition_count
      FROM tenants t
      LEFT JOIN tenant_users tu ON t.id = tu.tenant_id
      LEFT JOIN petitions p ON t.id = p.tenant_id
      GROUP BY t.id, t.name, t.slug, t.plan, t.status, t.created_date
      ORDER BY t.created_date DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tenants/:id', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const tenantResult = await pool.query(
      'SELECT * FROM tenants WHERE id = $1',
      [id]
    );
    
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const usersResult = await pool.query(`
      SELECT 
        au.id,
        au.email,
        au.full_name,
        tu.role,
        tu.joined_date
      FROM tenant_users tu
      JOIN auth_users au ON tu.user_id = au.id
      WHERE tu.tenant_id = $1
      ORDER BY tu.joined_date DESC
    `, [id]);
    
    const petitionsResult = await pool.query(
      'SELECT id, title, slug, status, created_date FROM petitions WHERE tenant_id = $1 ORDER BY created_date DESC',
      [id]
    );
    
    const campaignsResult = await pool.query(
      'SELECT id, name, type, status, created_date FROM campaigns WHERE tenant_id = $1 ORDER BY created_date DESC',
      [id]
    );
    
    res.json({
      tenant: tenantResult.rows[0],
      users: usersResult.rows,
      petitions: petitionsResult.rows,
      campaigns: campaignsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        au.id,
        au.email,
        au.full_name,
        au.email_verified,
        au.is_super_admin,
        au.created_date,
        COUNT(DISTINCT tu.tenant_id) as tenant_count
      FROM auth_users au
      LEFT JOIN tenant_users tu ON au.id = tu.user_id
      GROUP BY au.id, au.email, au.full_name, au.email_verified, au.is_super_admin, au.created_date
      ORDER BY au.created_date DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const tenantsResult = await pool.query('SELECT COUNT(*) as count FROM tenants');
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM auth_users');
    const petitionsResult = await pool.query('SELECT COUNT(*) as count FROM petitions');
    const signaturesResult = await pool.query('SELECT COUNT(*) as count FROM signatures');
    const campaignsResult = await pool.query('SELECT COUNT(*) as count FROM campaigns');
    
    const recentTenantsResult = await pool.query(`
      SELECT id, name, slug, created_date 
      FROM tenants 
      ORDER BY created_date DESC 
      LIMIT 5
    `);
    
    const recentUsersResult = await pool.query(`
      SELECT id, email, full_name, created_date 
      FROM auth_users 
      ORDER BY created_date DESC 
      LIMIT 5
    `);
    
    res.json({
      totals: {
        tenants: parseInt(tenantsResult.rows[0].count),
        users: parseInt(usersResult.rows[0].count),
        petitions: parseInt(petitionsResult.rows[0].count),
        signatures: parseInt(signaturesResult.rows[0].count),
        campaigns: parseInt(campaignsResult.rows[0].count)
      },
      recentTenants: recentTenantsResult.rows,
      recentUsers: recentUsersResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/tenants/:id/status', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'suspended', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    const result = await pool.query(
      'UPDATE tenants SET status = $1, updated_date = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/tenants/:id', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('BEGIN');
    
    await pool.query('DELETE FROM tenant_users WHERE tenant_id = $1', [id]);
    await pool.query('DELETE FROM signatures WHERE petition_id IN (SELECT id FROM petitions WHERE tenant_id = $1)', [id]);
    await pool.query('DELETE FROM petitions WHERE tenant_id = $1', [id]);
    await pool.query('DELETE FROM campaigns WHERE tenant_id = $1', [id]);
    await pool.query('DELETE FROM message_templates WHERE tenant_id = $1', [id]);
    await pool.query('DELETE FROM linkbio_pages WHERE tenant_id = $1', [id]);
    await pool.query('DELETE FROM linktree_pages WHERE tenant_id = $1', [id]);
    
    const result = await pool.query('DELETE FROM tenants WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    await pool.query('COMMIT');
    
    res.json({ message: 'Tenant deleted successfully', tenant: result.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

export default router;
