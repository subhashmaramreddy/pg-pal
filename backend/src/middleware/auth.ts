import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express.js';
import { verifyToken } from '../utils/jwt.js';

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    req.pgType = decoded.pgType;

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}

export function tenantOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'tenant') {
    return res.status(403).json({ success: false, error: 'Tenant access required' });
  }
  next();
}

export function errorHandler(
  err: Error,
  req: any,
  res: Response,
  next: NextFunction
) {
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
}
