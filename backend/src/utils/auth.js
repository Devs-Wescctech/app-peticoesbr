import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// CRITICAL: JWT secrets must be set via environment variables
// The server will fail to start if these are not defined
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Authentication cannot work without it.');
}

if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('FATAL: JWT_REFRESH_SECRET environment variable is not set. Authentication cannot work without it.');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRES_IN = '1h'; // Access token expira em 1 hora
const JWT_REFRESH_EXPIRES_IN = '7d'; // Refresh token expira em 7 dias

/**
 * Hash de senha com bcrypt
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifica se senha corresponde ao hash
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Gera Access Token (JWT)
 */
export function generateAccessToken(user, tenantId = null) {
  const payload = {
    userId: user.id,
    email: user.email,
    tenantId: tenantId,
    isSuperAdmin: user.is_super_admin || false,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Gera Refresh Token
 */
export function generateRefreshToken(userId) {
  const payload = { userId };
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

/**
 * Verifica Access Token
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Verifica Refresh Token
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Extrai token do header Authorization
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
