import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM linkbio_pages ORDER BY created_at DESC'
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

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM linkbio_pages WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'LinkBio page not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      title, slug, description, avatar_url, background_color, text_color, bio, links
    } = req.body;
    
    if (!title || !slug) {
      return res.status(400).json({ error: 'title e slug são obrigatórios' });
    }
    
    const result = await pool.query(
      `INSERT INTO linkbio_pages (
        title, slug, description, avatar_url, background_color, text_color, bio, links
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        title, slug, description, avatar_url,
        background_color || '#ffffff',
        text_color || '#000000',
        bio,
        JSON.stringify(links || [])
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
      title, slug, description, avatar_url, background_color, text_color, bio, links
    } = req.body;
    
    const result = await pool.query(
      `UPDATE linkbio_pages SET
        title = COALESCE($1, title),
        slug = COALESCE($2, slug),
        description = COALESCE($3, description),
        avatar_url = COALESCE($4, avatar_url),
        background_color = COALESCE($5, background_color),
        text_color = COALESCE($6, text_color),
        bio = COALESCE($7, bio),
        links = COALESCE($8, links),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *`,
      [title, slug, description, avatar_url, background_color, text_color, bio, links ? JSON.stringify(links) : null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'LinkBio page not found' });
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
      'DELETE FROM linkbio_pages WHERE id = $1 RETURNING *',
      [id]
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
