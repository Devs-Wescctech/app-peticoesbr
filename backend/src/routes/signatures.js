import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { petition_id } = req.query;
    
    let query = 'SELECT * FROM signatures ORDER BY created_date DESC';
    let params = [];
    
    if (petition_id) {
      query = 'SELECT * FROM signatures WHERE petition_id = $1 ORDER BY created_date DESC';
      params = [petition_id];
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
      'SELECT * FROM signatures WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Signature not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      petition_id, name, email, phone, city, state, cpf, comment
    } = req.body;
    
    if (!petition_id || !name || !email) {
      return res.status(400).json({ 
        error: 'petition_id, name e email são obrigatórios' 
      });
    }
    
    const result = await pool.query(
      `INSERT INTO signatures (
        petition_id, name, email, phone, city, state, cpf, comment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [petition_id, name, email, phone, city, state, cpf, comment]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM signatures WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Signature not found' });
    }
    
    res.json({ message: 'Signature deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
