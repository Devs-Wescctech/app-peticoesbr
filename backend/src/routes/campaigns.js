import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = 'SELECT * FROM campaigns ORDER BY created_date DESC';
    let params = [];
    
    if (type) {
      query = 'SELECT * FROM campaigns WHERE type = $1 ORDER BY created_date DESC';
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
      name, type, petition_id, message, subject, status, 
      sent_count, success_count, failed_count,
      total_recipients, api_token, sender_email, sender_name,
      target_petitions, target_filters, delay_seconds, messages_per_hour, avoid_night_hours
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
        success_count = COALESCE($8, success_count),
        failed_count = COALESCE($9, failed_count),
        total_recipients = COALESCE($10, total_recipients),
        api_token = COALESCE($11, api_token),
        sender_email = COALESCE($12, sender_email),
        sender_name = COALESCE($13, sender_name),
        target_petitions = COALESCE($14, target_petitions),
        target_filters = COALESCE($15, target_filters),
        delay_seconds = COALESCE($16, delay_seconds),
        messages_per_hour = COALESCE($17, messages_per_hour),
        avoid_night_hours = COALESCE($18, avoid_night_hours),
        updated_date = CURRENT_TIMESTAMP
      WHERE id = $19
      RETURNING *`,
      [name, type, petition_id, message, subject, status, 
       sent_count, success_count, failed_count, total_recipients,
       api_token, sender_email, sender_name, target_petitions, target_filters,
       delay_seconds, messages_per_hour, avoid_night_hours, id]
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
