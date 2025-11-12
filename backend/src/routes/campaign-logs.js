import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { campaign_id } = req.query;
    
    let query = 'SELECT * FROM campaign_logs ORDER BY created_at DESC';
    let params = [];
    
    if (campaign_id) {
      query = 'SELECT * FROM campaign_logs WHERE campaign_id = $1 ORDER BY created_at DESC';
      params = [campaign_id];
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      campaign_id, recipient_name, recipient_contact, status,
      response_status, response_body, error_message
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO campaign_logs (
        campaign_id, recipient_name, recipient_contact, status,
        response_status, response_body, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [campaign_id, recipient_name, recipient_contact, status, response_status, response_body, error_message]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
