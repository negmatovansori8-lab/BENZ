import { verifyToken } from '../utils/jwt.js';
import { query } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    const { rows } = await query(
      'SELECT id, name, email, phone, avatar, role, is_blocked, created_at, last_login_at FROM users WHERE id = $1',
      [payload.id]
    );
    if (rows[0] && !rows[0].is_blocked) req.user = rows[0];
  } catch {
    // ignore invalid token for optional routes
  }
  next();
}

export async function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError('Authentication required', 401));
  try {
    const payload = verifyToken(token);
    const { rows } = await query(
      'SELECT id, name, email, phone, avatar, role, is_blocked, created_at, last_login_at FROM users WHERE id = $1',
      [payload.id]
    );
    if (!rows[0]) return next(new AppError('User not found', 401));
    if (rows[0].is_blocked) return next(new AppError('Account is blocked', 403));
    req.user = rows[0];
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError('Authentication required', 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}
