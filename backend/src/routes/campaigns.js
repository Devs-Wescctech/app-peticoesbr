import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = 'SELECT * FROM campaigns ORDER BY created_at DESC';
    let params = [];
    
    if (type) {
      query = 'SELECT * FROM campaigns WHERE type = $1 ORDER BY created_at DESC';
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
      'SELECT * FROM campaigns WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      name, type, petition_id, message, subject, status
    } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'name e type são obrigatórios' });
    }
    
    const result = await pool.query(
      `INSERT INTO campaigns (
        name, type, petition_id, message, subject, status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [name, type, petition_id, message, subject, status || 'rascunho']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, type, petition_id, message, subject, status, sent_count, error_count
    } = req.body;
    
    const result = await pool.query(
      `UPDATE campaigns SET
        name = COALESCE($1, name),
        type = COALESCE($2, type),
        petition_id = COALESCE($3, petition_id),
        message = COALESCE($4, message),
        subject = COALESCE($5, subject),
        status = COALESCE($6, status),
        sent_count = COALESCE($7, sent_count),
        error_count = COALESCE($8, error_count),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *`,
      [name, type, petition_id, message, subject, status, sent_count, error_count, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
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
      'DELETE FROM campaigns WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
