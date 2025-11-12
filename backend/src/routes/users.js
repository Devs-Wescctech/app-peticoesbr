import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/users - List all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      role = 'user',
      phone,
      avatar_url,
      preferences = {},
      email_verified = false
    } = req.body;

    const result = await pool.query(
      `INSERT INTO users (
        email, password, full_name, role, phone, avatar_url, 
        preferences, email_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [email, password, full_name, role, phone, avatar_url, preferences, email_verified]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      password,
      full_name,
      role,
      phone,
      avatar_url,
      preferences,
      email_verified
    } = req.body;

    const result = await pool.query(
      `UPDATE users SET
        email = COALESCE($2, email),
        password = COALESCE($3, password),
        full_name = COALESCE($4, full_name),
        role = COALESCE($5, role),
        phone = COALESCE($6, phone),
        avatar_url = COALESCE($7, avatar_url),
        preferences = COALESCE($8, preferences),
        email_verified = COALESCE($9, email_verified)
      WHERE id = $1
      RETURNING *`,
      [id, email, password, full_name, role, phone, avatar_url, preferences, email_verified]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
