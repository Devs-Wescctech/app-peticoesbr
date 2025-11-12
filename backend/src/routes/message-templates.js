import express from 'express';
import pool from '../config/database.js';
import { authenticate, requireTenant } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, requireTenant, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { type } = req.query;
    
    let query = 'SELECT * FROM message_templates WHERE tenant_id = $1 ORDER BY created_date DESC';
    let params = [tenantId];
    
    if (type) {
      query = 'SELECT * FROM message_templates WHERE tenant_id = $1 AND type = $2 ORDER BY created_date DESC';
      params = [tenantId, type];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const result = await pool.query(
      'SELECT * FROM message_templates WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, requireTenant, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { name, type, subject, content, variables } = req.body;
    
    if (!name || !type || !content) {
      return res.status(400).json({ error: 'name, type e content são obrigatórios' });
    }
    
    const result = await pool.query(
      `INSERT INTO message_templates (
        name, type, subject, content, variables, tenant_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [name, type, subject, content, variables || [], tenantId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const { name, type, subject, content, variables } = req.body;
    
    const result = await pool.query(
      `UPDATE message_templates SET
        name = COALESCE($1, name),
        type = COALESCE($2, type),
        subject = COALESCE($3, subject),
        content = COALESCE($4, content),
        variables = COALESCE($5, variables),
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $6 AND tenant_id = $7
      RETURNING *`,
      [name, type, subject, content, variables, id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const result = await pool.query(
      'DELETE FROM message_templates WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
