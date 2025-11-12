import express from 'express';
import pool from '../config/database.js';
import { authenticate, requireSuperAdmin } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

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
        au.is_active,
        au.avatar_url,
        au.last_login,
        au.created_date,
        COUNT(DISTINCT tu.tenant_id) as tenant_count,
        json_agg(
          json_build_object(
            'tenant_id', t.id,
            'tenant_name', t.name,
            'tenant_slug', t.slug,
            'role', tu.role,
            'is_active', tu.is_active
          )
        ) FILTER (WHERE t.id IS NOT NULL) as tenants
      FROM auth_users au
      LEFT JOIN tenant_users tu ON au.id = tu.user_id
      LEFT JOIN tenants t ON tu.tenant_id = t.id
      GROUP BY au.id, au.email, au.full_name, au.email_verified, au.is_super_admin, au.is_active, au.avatar_url, au.last_login, au.created_date
      ORDER BY au.created_date DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { email, password, full_name, is_super_admin = false } = req.body;
    
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, senha e nome completo são obrigatórios' });
    }
    
    const existingUser = await pool.query(
      'SELECT id FROM auth_users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      `INSERT INTO auth_users (email, password_hash, full_name, is_super_admin, email_verified, is_active)
       VALUES ($1, $2, $3, $4, true, true)
       RETURNING id, email, full_name, is_super_admin, email_verified, is_active, created_date`,
      [email.toLowerCase(), passwordHash, full_name, is_super_admin]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, full_name, is_super_admin, is_active, email_verified } = req.body;
    
    const user = await pool.query('SELECT id FROM auth_users WHERE id = $1', [id]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (email !== undefined) {
      const existingEmail = await pool.query(
        'SELECT id FROM auth_users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), id]
      );
      
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({ error: 'Email já está em uso' });
      }
      
      updates.push(`email = $${paramCount++}`);
      values.push(email.toLowerCase());
    }
    
    if (full_name !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(full_name);
    }
    
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramCount++}`);
      values.push(passwordHash);
    }
    
    if (is_super_admin !== undefined) {
      updates.push(`is_super_admin = $${paramCount++}`);
      values.push(is_super_admin);
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    
    if (email_verified !== undefined) {
      updates.push(`email_verified = $${paramCount++}`);
      values.push(email_verified);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    updates.push(`updated_date = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE auth_users SET ${updates.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, email, full_name, is_super_admin, email_verified, is_active, created_date, updated_date`,
      values
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const superAdminEmail = 'tecnologia@wescctech.com.br';
    const protectedUser = await pool.query(
      'SELECT id FROM auth_users WHERE id = $1 AND email = $2',
      [id, superAdminEmail]
    );
    
    if (protectedUser.rows.length > 0) {
      return res.status(403).json({ error: 'Não é possível excluir o super admin principal' });
    }
    
    await pool.query('BEGIN');
    
    await pool.query('DELETE FROM tenant_users WHERE user_id = $1', [id]);
    
    const result = await pool.query(
      'DELETE FROM auth_users WHERE id = $1 RETURNING email, full_name',
      [id]
    );
    
    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    await pool.query('COMMIT');
    
    res.json({ message: 'Usuário excluído com sucesso', user: result.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK');
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

router.post('/tenants', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { 
      name, 
      slug, 
      plan = 'free', 
      max_petitions = 10, 
      max_signatures = 1000, 
      max_campaigns = 5 
    } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'Nome e slug são obrigatórios' });
    }
    
    const existingTenant = await pool.query(
      'SELECT id FROM tenants WHERE slug = $1',
      [slug.toLowerCase()]
    );
    
    if (existingTenant.rows.length > 0) {
      return res.status(400).json({ error: 'Slug já está em uso' });
    }
    
    const result = await pool.query(
      `INSERT INTO tenants (name, slug, database_url, plan, status, max_petitions, max_signatures, max_campaigns)
       VALUES ($1, $2, $3, $4, 'active', $5, $6, $7)
       RETURNING id, name, slug, plan, status, max_petitions, max_signatures, max_campaigns, created_date`,
      [name, slug.toLowerCase(), process.env.DATABASE_URL, plan, max_petitions, max_signatures, max_campaigns]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/tenants/:id', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, plan, max_petitions, max_signatures, max_campaigns } = req.body;
    
    const tenant = await pool.query('SELECT id FROM tenants WHERE id = $1', [id]);
    
    if (tenant.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    
    if (slug !== undefined) {
      const existingSlug = await pool.query(
        'SELECT id FROM tenants WHERE slug = $1 AND id != $2',
        [slug.toLowerCase(), id]
      );
      
      if (existingSlug.rows.length > 0) {
        return res.status(400).json({ error: 'Slug já está em uso' });
      }
      
      updates.push(`slug = $${paramCount++}`);
      values.push(slug.toLowerCase());
    }
    
    if (plan !== undefined) {
      updates.push(`plan = $${paramCount++}`);
      values.push(plan);
    }
    
    if (max_petitions !== undefined) {
      updates.push(`max_petitions = $${paramCount++}`);
      values.push(max_petitions);
    }
    
    if (max_signatures !== undefined) {
      updates.push(`max_signatures = $${paramCount++}`);
      values.push(max_signatures);
    }
    
    if (max_campaigns !== undefined) {
      updates.push(`max_campaigns = $${paramCount++}`);
      values.push(max_campaigns);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    updates.push(`updated_date = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE tenants SET ${updates.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, name, slug, plan, status, max_petitions, max_signatures, max_campaigns, created_date, updated_date`,
      values
    );
    
    res.json(result.rows[0]);
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
    await pool.query('DELETE FROM campaign_logs WHERE campaign_id IN (SELECT id FROM campaigns WHERE tenant_id = $1)', [id]);
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

router.get('/tenant-users', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        tu.id,
        tu.tenant_id,
        tu.user_id,
        tu.role,
        tu.is_active,
        tu.created_date,
        au.email,
        au.full_name,
        t.name as tenant_name,
        t.slug as tenant_slug
      FROM tenant_users tu
      JOIN auth_users au ON tu.user_id = au.id
      JOIN tenants t ON tu.tenant_id = t.id
      ORDER BY tu.created_date DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tenant-users', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { tenant_id, user_id, role = 'member' } = req.body;
    
    if (!tenant_id || !user_id) {
      return res.status(400).json({ error: 'Tenant ID e User ID são obrigatórios' });
    }
    
    const tenant = await pool.query('SELECT id FROM tenants WHERE id = $1', [tenant_id]);
    if (tenant.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }
    
    const user = await pool.query('SELECT id FROM auth_users WHERE id = $1', [user_id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const existing = await pool.query(
      'SELECT id FROM tenant_users WHERE tenant_id = $1 AND user_id = $2',
      [tenant_id, user_id]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já está vinculado a este tenant' });
    }
    
    const result = await pool.query(
      `INSERT INTO tenant_users (tenant_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id, tenant_id, user_id, role, is_active, created_date`,
      [tenant_id, user_id, role]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/tenant-users/:id', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;
    
    const tenantUser = await pool.query('SELECT id FROM tenant_users WHERE id = $1', [id]);
    
    if (tenantUser.rows.length === 0) {
      return res.status(404).json({ error: 'Atribuição não encontrada' });
    }
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }
    
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    updates.push(`updated_date = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await pool.query(
      `UPDATE tenant_users SET ${updates.join(', ')} 
       WHERE id = $${paramCount}
       RETURNING id, tenant_id, user_id, role, is_active, created_date, updated_date`,
      values
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/tenant-users/:id', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM tenant_users WHERE id = $1 RETURNING tenant_id, user_id, role',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Atribuição não encontrada' });
    }
    
    res.json({ message: 'Atribuição removida com sucesso', assignment: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
