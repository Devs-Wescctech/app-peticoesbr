import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = 'SELECT * FROM message_templates ORDER BY created_at DESC';
    let params = [];
    
    if (type) {
      query = 'SELECT * FROM message_templates WHERE type = $1 ORDER BY created_at DESC';
      params = [type];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM message_templates WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, type, subject, content, variables } = req.body;
    
    if (!name || !type || !content) {
      return res.status(400).json({ error: 'name, type e content são obrigatórios' });
    }
    
    const result = await pool.query(
      `INSERT INTO message_templates (
        name, type, subject, content, variables
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [name, type, subject, content, variables || []]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, subject, content, variables } = req.body;
    
    const result = await pool.query(
      `UPDATE message_templates SET
        name = COALESCE($1, name),
        type = COALESCE($2, type),
        subject = COALESCE($3, subject),
        content = COALESCE($4, content),
        variables = COALESCE($5, variables),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *`,
      [name, type, subject, content, variables, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
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
      'DELETE FROM message_templates WHERE id = $1 RETURNING *',
      [id]
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
