import express from 'express';
import pool from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { 
  hashPassword, 
  comparePassword, 
  generateAccessToken, 
  generateRefreshToken,
  verifyRefreshToken
} from '../utils/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Registro de novo usuário
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    
    // Validação básica
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, senha e nome completo são obrigatórios' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }
    
    // Hash da senha
    const password_hash = await hashPassword(password);
    
    // Insere usuário
    const result = await pool.query(
      `INSERT INTO auth_users (email, password_hash, full_name, email_verified)
       VALUES ($1, $2, $3, false)
       RETURNING id, email, full_name, avatar_url, email_verified, created_date`,
      [email.toLowerCase(), password_hash, full_name]
    );
    
    const user = result.rows[0];
    
    // Gera tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user.id);
    
    // Salva refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias
    
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    );
    
    res.status(201).json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

/**
 * POST /api/auth/login
 * Login com email e senha
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Busca usuário
    const result = await pool.query(
      `SELECT id, email, password_hash, full_name, avatar_url, email_verified, is_active, is_super_admin
       FROM auth_users
       WHERE email = $1`,
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    const user = result.rows[0];
    
    // Verifica se usuário está ativo
    if (!user.is_active) {
      return res.status(403).json({ error: 'Usuário desativado' });
    }
    
    // Verifica senha
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }
    
    // Busca tenants do usuário
    const tenantsResult = await pool.query(
      `SELECT t.id, t.name, t.slug, tu.role
       FROM tenants t
       INNER JOIN tenant_users tu ON t.id = tu.tenant_id
       WHERE tu.user_id = $1 AND tu.is_active = true AND t.status = 'active'
       ORDER BY t.created_date ASC`,
      [user.id]
    );
    
    const tenants = tenantsResult.rows;
    
    // Se tiver apenas 1 tenant, já seleciona automaticamente
    const selectedTenantId = tenants.length === 1 ? tenants[0].id : null;
    
    // Gera tokens
    const accessToken = generateAccessToken(user, selectedTenantId);
    const refreshToken = generateRefreshToken(user.id);
    
    // Salva refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, refreshToken, expiresAt]
    );
    
    // Atualiza last_login
    await pool.query(
      `UPDATE auth_users SET last_login = NOW() WHERE id = $1`,
      [user.id]
    );
    
    // Remove password_hash da resposta
    delete user.password_hash;
    
    res.json({
      user,
      tenants,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

/**
 * POST /api/auth/refresh
 * Renova o access token usando refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token não fornecido' });
    }
    
    // Verifica refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Refresh token inválido' });
    }
    
    // Busca token no banco
    const result = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()`,
      [refreshToken]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Refresh token expirado ou inválido' });
    }
    
    const userId = decoded.userId;
    
    // Busca usuário
    const userResult = await pool.query(
      `SELECT id, email, full_name, avatar_url FROM auth_users WHERE id = $1 AND is_active = true`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    const user = userResult.rows[0];
    
    // Gera novo access token (mantém tenantId se tiver)
    const accessToken = generateAccessToken(user);
    
    res.json({ accessToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Erro ao renovar token' });
  }
});

/**
 * POST /api/auth/logout
 * Logout (invalida refresh token)
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await pool.query(
        `DELETE FROM refresh_tokens WHERE token = $1`,
        [refreshToken]
      );
    }
    
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Busca dados do usuário
    const userResult = await pool.query(
      `SELECT id, email, full_name, avatar_url, email_verified, last_login, created_date
       FROM auth_users
       WHERE id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const user = userResult.rows[0];
    
    // Busca tenants do usuário
    const tenantsResult = await pool.query(
      `SELECT t.id, t.name, t.slug, t.plan, t.status, tu.role
       FROM tenants t
       INNER JOIN tenant_users tu ON t.id = tu.tenant_id
       WHERE tu.user_id = $1 AND tu.is_active = true
       ORDER BY t.created_date ASC`,
      [userId]
    );
    
    const tenants = tenantsResult.rows;
    
    res.json({
      user,
      tenants,
      currentTenantId: req.user.tenantId || null,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
  }
});

/**
 * POST /api/auth/select-tenant
 * Seleciona um tenant e retorna novo token com tenantId
 */
router.post('/select-tenant', async (req, res) => {
  try {
    const { userId, tenantId } = req.body;
    
    if (!userId || !tenantId) {
      return res.status(400).json({ error: 'userId e tenantId são obrigatórios' });
    }
    
    // Verifica se usuário pertence ao tenant
    const result = await pool.query(
      `SELECT tu.*, t.name as tenant_name, t.slug, u.email, u.full_name
       FROM tenant_users tu
       INNER JOIN tenants t ON tu.tenant_id = t.id
       INNER JOIN auth_users u ON tu.user_id = u.id
       WHERE tu.user_id = $1 AND tu.tenant_id = $2 AND tu.is_active = true AND t.status = 'active'`,
      [userId, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Acesso ao tenant negado' });
    }
    
    const data = result.rows[0];
    const user = {
      id: userId,
      email: data.email,
      full_name: data.full_name,
    };
    
    // Gera novo access token com tenantId
    const accessToken = generateAccessToken(user, tenantId);
    
    res.json({
      accessToken,
      tenant: {
        id: tenantId,
        name: data.tenant_name,
        slug: data.slug,
        role: data.role,
      },
    });
  } catch (error) {
    console.error('Error selecting tenant:', error);
    res.status(500).json({ error: 'Erro ao selecionar tenant' });
  }
});

export default router;
