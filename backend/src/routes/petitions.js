import express from 'express';
import pool from '../config/database.js';
import { authenticate, requireTenant, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/petitions - List all petitions for the authenticated tenant
router.get('/', authenticate, requireTenant, async (req, res) => {
  try {
    const { tenantId } = req.user;
    
    const result = await pool.query(
      'SELECT * FROM petitions WHERE tenant_id = $1 ORDER BY created_date DESC',
      [tenantId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/petitions/slug/:slug - Public endpoint (no auth required)
// Used for public petition pages
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'SELECT * FROM petitions WHERE slug = $1',
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/petitions/:id - Get petition by ID (tenant scoped)
router.get('/:id', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const result = await pool.query(
      'SELECT * FROM petitions WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/petitions - Create new petition (tenant scoped)
router.post('/', authenticate, requireTenant, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const {
      title, description, banner_url, logo_url, primary_color,
      share_text, goal, status, slug, collect_phone, collect_city,
      collect_state, collect_cpf, collect_comment
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO petitions (
        title, description, banner_url, logo_url, primary_color,
        share_text, goal, status, slug, collect_phone, collect_city,
        collect_state, collect_cpf, collect_comment, tenant_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        title, description, banner_url, logo_url, primary_color || '#6366f1',
        share_text, goal || 1, status || 'rascunho', slug,
        collect_phone || false, collect_city || false, collect_state || false,
        collect_cpf || false, collect_comment || false, tenantId
      ]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Slug já existe' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/petitions/:id - Update petition (tenant scoped)
router.put('/:id', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const {
      title, description, banner_url, logo_url, primary_color,
      share_text, goal, status, slug, collect_phone, collect_city,
      collect_state, collect_cpf, collect_comment
    } = req.body;
    
    const result = await pool.query(
      `UPDATE petitions SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        banner_url = COALESCE($3, banner_url),
        logo_url = COALESCE($4, logo_url),
        primary_color = COALESCE($5, primary_color),
        share_text = COALESCE($6, share_text),
        goal = COALESCE($7, goal),
        status = COALESCE($8, status),
        slug = COALESCE($9, slug),
        collect_phone = COALESCE($10, collect_phone),
        collect_city = COALESCE($11, collect_city),
        collect_state = COALESCE($12, collect_state),
        collect_cpf = COALESCE($13, collect_cpf),
        collect_comment = COALESCE($14, collect_comment),
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $15 AND tenant_id = $16
      RETURNING *`,
      [
        title, description, banner_url, logo_url, primary_color,
        share_text, goal, status, slug, collect_phone, collect_city,
        collect_state, collect_cpf, collect_comment, id, tenantId
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/petitions/:id - Delete petition (tenant scoped)
router.delete('/:id', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const result = await pool.query(
      'DELETE FROM petitions WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    
    res.json({ message: 'Petition deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
