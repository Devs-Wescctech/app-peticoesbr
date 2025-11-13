import express from 'express';
import pool from '../config/database.js';
import { authenticate, requireTenant } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, requireTenant, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const result = await pool.query(
      'SELECT * FROM linkbio_pages WHERE tenant_id = $1 ORDER BY created_date DESC',
      [tenantId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      'SELECT * FROM linkbio_pages WHERE slug = $1',
      [slug]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'LinkBio page not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/slug/:slug/petitions', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const pageResult = await pool.query(
      'SELECT petition_ids FROM linkbio_pages WHERE slug = $1',
      [slug]
    );
    
    if (pageResult.rows.length === 0) {
      return res.status(404).json({ error: 'LinkBio page not found' });
    }
    
    const petitionIds = pageResult.rows[0].petition_ids || [];
    
    if (!Array.isArray(petitionIds) || petitionIds.length === 0) {
      return res.json([]);
    }
    
    const petitionsResult = await pool.query(
      `SELECT 
        p.*,
        (SELECT COUNT(*) FROM signatures WHERE petition_id = p.id) as signature_count
       FROM petitions p
       WHERE p.id = ANY($1::uuid[])
       ORDER BY p.created_date DESC`,
      [petitionIds]
    );
    
    res.json(petitionsResult.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const result = await pool.query(
      'SELECT * FROM linkbio_pages WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'LinkBio page not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, requireTenant, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const {
      title, slug, description, avatar_url, background_color, status, petition_ids
    } = req.body;
    
    if (!title || !slug) {
      return res.status(400).json({ error: 'title e slug são obrigatórios' });
    }
    
    const result = await pool.query(
      `INSERT INTO linkbio_pages (
        title, slug, description, avatar_url, background_color, status, petition_ids, tenant_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        title, slug, description, avatar_url,
        background_color || '#6366f1',
        status || 'rascunho',
        petition_ids || [],
        tenantId
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

router.put('/:id', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const {
      title, slug, description, avatar_url, background_color, status, petition_ids
    } = req.body;
    
    const result = await pool.query(
      `UPDATE linkbio_pages SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        avatar_url = COALESCE($4, avatar_url),
        background_color = COALESCE($5, background_color),
        status = COALESCE($6, status),
        petition_ids = COALESCE($7, petition_ids),
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $8 AND tenant_id = $9
      RETURNING *`,
      [title, slug, description, avatar_url, background_color, status, petition_ids, id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'LinkBio page not found' });
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
      'DELETE FROM linkbio_pages WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'LinkBio page not found' });
    }
    
    res.json({ message: 'LinkBio page deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
