import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/tenants
 * Lista todos os tenants do usuário autenticado
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { userId } = req.user;
    
    const result = await pool.query(
      `SELECT t.*, tu.role, tu.is_active as user_is_active
       FROM tenants t
       INNER JOIN tenant_users tu ON t.id = tu.tenant_id
       WHERE tu.user_id = $1
       ORDER BY t.created_date DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Erro ao buscar tenants' });
  }
});

/**
 * GET /api/tenants/:id
 * Busca um tenant específico
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    // Verifica se usuário tem acesso ao tenant
    const result = await pool.query(
      `SELECT t.*, tu.role
       FROM tenants t
       INNER JOIN tenant_users tu ON t.id = tu.tenant_id
       WHERE t.id = $1 AND tu.user_id = $2`,
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: 'Erro ao buscar tenant' });
  }
});

/**
 * POST /api/tenants
 * Cria um novo tenant
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, slug, plan = 'free' } = req.body;
    
    if (!name || !slug) {
      return res.status(400).json({ error: 'Nome e slug são obrigatórios' });
    }
    
    // Valida slug (apenas letras minúsculas, números e hífens)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ 
        error: 'Slug inválido. Use apenas letras minúsculas, números e hífens' 
      });
    }
    
    // Por enquanto, usa o mesmo DATABASE_URL para todos os tenants
    // Em produção, cada tenant teria seu próprio banco
    const database_url = process.env.DATABASE_URL;
    
    // Inicia transação
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Cria tenant
      const tenantResult = await client.query(
        `INSERT INTO tenants (name, slug, database_url, plan, status)
         VALUES ($1, $2, $3, $4, 'active')
         RETURNING *`,
        [name, slug, database_url, plan]
      );
      
      const tenant = tenantResult.rows[0];
      
      // Adiciona usuário como owner do tenant
      await client.query(
        `INSERT INTO tenant_users (tenant_id, user_id, role, is_active)
         VALUES ($1, $2, 'owner', true)`,
        [tenant.id, userId]
      );
      
      await client.query('COMMIT');
      
      res.status(201).json(tenant);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating tenant:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug já está em uso' });
    }
    res.status(500).json({ error: 'Erro ao criar tenant' });
  }
});

/**
 * PUT /api/tenants/:id
 * Atualiza um tenant
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { name, plan, status, settings, max_petitions, max_signatures, max_campaigns } = req.body;
    
    // Verifica se usuário é owner ou admin do tenant
    const checkResult = await pool.query(
      `SELECT role FROM tenant_users 
       WHERE tenant_id = $1 AND user_id = $2 AND role IN ('owner', 'admin')`,
      [id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para atualizar este tenant' });
    }
    
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (plan !== undefined) {
      updates.push(`plan = $${paramIndex++}`);
      values.push(plan);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (settings !== undefined) {
      updates.push(`settings = $${paramIndex++}`);
      values.push(JSON.stringify(settings));
    }
    if (max_petitions !== undefined) {
      updates.push(`max_petitions = $${paramIndex++}`);
      values.push(max_petitions);
    }
    if (max_signatures !== undefined) {
      updates.push(`max_signatures = $${paramIndex++}`);
      values.push(max_signatures);
    }
    if (max_campaigns !== undefined) {
      updates.push(`max_campaigns = $${paramIndex++}`);
      values.push(max_campaigns);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    values.push(id);
    
    const result = await pool.query(
      `UPDATE tenants SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ error: 'Erro ao atualizar tenant' });
  }
});

/**
 * DELETE /api/tenants/:id
 * Deleta um tenant (apenas owner)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    // Apenas owner pode deletar
    const checkResult = await pool.query(
      `SELECT role FROM tenant_users 
       WHERE tenant_id = $1 AND user_id = $2 AND role = 'owner'`,
      [id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(403).json({ error: 'Apenas o owner pode deletar o tenant' });
    }
    
    await pool.query('DELETE FROM tenants WHERE id = $1', [id]);
    
    res.json({ message: 'Tenant deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Erro ao deletar tenant' });
  }
});

/**
 * GET /api/tenants/:id/users
 * Lista usuários de um tenant
 */
router.get('/:id/users', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    // Verifica se usuário tem acesso ao tenant
    const checkResult = await pool.query(
      `SELECT 1 FROM tenant_users WHERE tenant_id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para acessar este tenant' });
    }
    
    const result = await pool.query(
      `SELECT 
         u.id, u.email, u.full_name, u.avatar_url,
         tu.role, tu.is_active, tu.created_date as joined_date
       FROM auth_users u
       INNER JOIN tenant_users tu ON u.id = tu.user_id
       WHERE tu.tenant_id = $1
       ORDER BY tu.created_date ASC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tenant users:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários do tenant' });
  }
});

/**
 * POST /api/tenants/:id/users
 * Adiciona um usuário ao tenant
 */
router.post('/:id/users', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { email, role = 'member' } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    
    // Verifica se usuário é owner ou admin
    const checkResult = await pool.query(
      `SELECT role FROM tenant_users 
       WHERE tenant_id = $1 AND user_id = $2 AND role IN ('owner', 'admin')`,
      [id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para adicionar usuários' });
    }
    
    // Busca usuário por email
    const userResult = await pool.query(
      `SELECT id FROM auth_users WHERE email = $1`,
      [email.toLowerCase()]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const targetUserId = userResult.rows[0].id;
    
    // Adiciona usuário ao tenant
    const result = await pool.query(
      `INSERT INTO tenant_users (tenant_id, user_id, role, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [id, targetUserId, role]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding user to tenant:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Usuário já está neste tenant' });
    }
    res.status(500).json({ error: 'Erro ao adicionar usuário' });
  }
});

/**
 * DELETE /api/tenants/:tenantId/users/:userId
 * Remove um usuário do tenant
 */
router.delete('/:tenantId/users/:targetUserId', authenticate, async (req, res) => {
  try {
    const { tenantId, targetUserId } = req.params;
    const { userId } = req.user;
    
    // Verifica se usuário é owner ou admin
    const checkResult = await pool.query(
      `SELECT role FROM tenant_users 
       WHERE tenant_id = $1 AND user_id = $2 AND role IN ('owner', 'admin')`,
      [tenantId, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(403).json({ error: 'Sem permissão para remover usuários' });
    }
    
    // Não permite remover o owner
    const targetResult = await pool.query(
      `SELECT role FROM tenant_users WHERE tenant_id = $1 AND user_id = $2`,
      [tenantId, targetUserId]
    );
    
    if (targetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado no tenant' });
    }
    
    if (targetResult.rows[0].role === 'owner') {
      return res.status(403).json({ error: 'Não é possível remover o owner do tenant' });
    }
    
    await pool.query(
      `DELETE FROM tenant_users WHERE tenant_id = $1 AND user_id = $2`,
      [tenantId, targetUserId]
    );
    
    res.json({ message: 'Usuário removido do tenant com sucesso' });
  } catch (error) {
    console.error('Error removing user from tenant:', error);
    res.status(500).json({ error: 'Erro ao remover usuário' });
  }
});

export default router;
