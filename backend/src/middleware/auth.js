import { extractTokenFromHeader, verifyAccessToken } from '../utils/auth.js';

/**
 * Middleware de autenticação
 * Verifica se o usuário está autenticado via JWT
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  const decoded = verifyAccessToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
  
  // Adiciona informações do usuário ao request
  req.user = {
    userId: decoded.userId,
    email: decoded.email,
    tenantId: decoded.tenantId,
  };
  
  next();
}

/**
 * Middleware opcional de autenticação
 * Não bloqueia se não houver token, apenas adiciona user se existir
 */
export function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);
  
  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        tenantId: decoded.tenantId,
      };
    }
  }
  
  next();
}

/**
 * Middleware que requer tenant
 * Verifica se o usuário tem um tenantId no token
 */
export function requireTenant(req, res, next) {
  if (!req.user || !req.user.tenantId) {
    return res.status(403).json({ error: 'Tenant não selecionado' });
  }
  next();
}
