import express from 'express';
import pool from '../config/database.js';
import { authenticate, requireTenant } from '../middleware/auth.js';

const router = express.Router();

// GET /api/signatures/petition/:petitionId/count - Public endpoint for petition signature count
router.get('/petition/:petitionId/count', async (req, res) => {
  try {
    const { petitionId } = req.params;
    
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM signatures WHERE petition_id = $1',
      [petitionId]
    );
    
    res.json({ count: parseInt(result.rows[0].count), petition_id: petitionId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/public', async (req, res) => {
  try {
    const {
      petition_id, name, email, phone, city, state, cpf, comment
    } = req.body;
    
    if (!petition_id || !name || !email) {
      return res.status(400).json({ 
        error: 'petition_id, name e email são obrigatórios' 
      });
    }
    
    const petitionCheck = await pool.query(
      'SELECT id FROM petitions WHERE id = $1',
      [petition_id]
    );
    
    if (petitionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
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

router.get('/', authenticate, requireTenant, async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { petition_id } = req.query;
    
    let query = `
      SELECT s.* FROM signatures s
      INNER JOIN petitions p ON s.petition_id = p.id
      WHERE p.tenant_id = $1
      ORDER BY s.created_date DESC
    `;
    let params = [tenantId];
    
    if (petition_id) {
      query = `
        SELECT s.* FROM signatures s
        INNER JOIN petitions p ON s.petition_id = p.id
        WHERE p.tenant_id = $1 AND s.petition_id = $2
        ORDER BY s.created_date DESC
      `;
      params = [tenantId, petition_id];
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
      `SELECT s.* FROM signatures s
       INNER JOIN petitions p ON s.petition_id = p.id
       WHERE s.id = $1 AND p.tenant_id = $2`,
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Signature not found' });
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
      petition_id, name, email, phone, city, state, cpf, comment
    } = req.body;
    
    if (!petition_id || !name || !email) {
      return res.status(400).json({ 
        error: 'petition_id, name e email são obrigatórios' 
      });
    }
    
    const petitionCheck = await pool.query(
      'SELECT id FROM petitions WHERE id = $1 AND tenant_id = $2',
      [petition_id, tenantId]
    );
    
    if (petitionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Petition not found' });
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

router.delete('/:id', authenticate, requireTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const result = await pool.query(
      `DELETE FROM signatures s
       USING petitions p
       WHERE s.id = $1 AND s.petition_id = p.id AND p.tenant_id = $2
       RETURNING s.*`,
      [id, tenantId]
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
