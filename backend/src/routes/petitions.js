import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM petitions ORDER BY created_date DESC'
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

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM petitions WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      title, description, banner_url, logo_url, primary_color,
      share_text, goal, status, slug, collect_phone, collect_city,
      collect_state, collect_cpf, collect_comment
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO petitions (
        title, description, banner_url, logo_url, primary_color,
        share_text, goal, status, slug, collect_phone, collect_city,
        collect_state, collect_cpf, collect_comment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        title, description, banner_url, logo_url, primary_color || '#6366f1',
        share_text, goal || 1, status || 'rascunho', slug,
        collect_phone || false, collect_city || false, collect_state || false,
        collect_cpf || false, collect_comment || false
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

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
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
      WHERE id = $15
      RETURNING *`,
      [
        title, description, banner_url, logo_url, primary_color,
        share_text, goal, status, slug, collect_phone, collect_city,
        collect_state, collect_cpf, collect_comment, id
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

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM petitions WHERE id = $1 RETURNING *',
      [id]
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
