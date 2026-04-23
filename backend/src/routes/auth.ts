import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateToken, verifyToken } from '../utils/jwt.js';
import { getAdminByEmail, createAdmin } from '../services/database.js';
import { AuthRequest } from '../types/express.js';
import pool from '../utils/db.js';

const router = Router();

// Admin Login
router.post('/admin/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }

    // 2. Get admin
    const adminResult = await pool.query(
      'SELECT * FROM admins WHERE email = $1',
      [email]
    );

    if (adminResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const admin = adminResult.rows[0];

    // 3. Check password (bcrypt)
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // 4. Fetch PGs
    const pgResult = await pool.query(
      'SELECT id, pg_type, name FROM pgs WHERE admin_id = $1',
      [admin.id]
    );

    // 5. Generate token using utility — include pg_type so authMiddleware can set req.pgType
    const token = generateToken(admin.id, admin.email, 'admin', admin.pg_type);

    // 6. Response — pgType only (camelCase). pg_type stays in DB but never on the API surface.
    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        pgType: admin.pg_type,
      },
      pgs: pgResult.rows
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Admin Register (for first-time setup)
router.post('/admin/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, pgType } = req.body;

    if (!email || !password || !pgType) {
      return res.status(400).json({ success: false, error: 'Email, password, and pgType required' });
    }

    // Check if admin already exists
    const existing = await getAdminByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Admin already exists' });
    }

    const result = await createAdmin(email, password, pgType);
    if (!result.success) {
      return res.status(400).json(result);
    }

    const adminData = await getAdminByEmail(email);
    if (!adminData) {
      return res.status(404).json({ success: false, error: 'Failed to create admin' });
    }

    const token = generateToken(adminData.id, adminData.email, 'admin', adminData.pgType);

    res.status(201).json({
      success: true,
      data: {
        token,
        admin: { id: adminData.id, email: adminData.email, pgType: adminData.pgType }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Verify Token
router.post('/verify-token', (req: Request, res: Response) => {
  try {
    console.log("VERIFY-TOKEN called, auth header present:", !!req.headers.authorization);

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(400).json({ success: false, error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(400).json({ success: false, error: 'No token in header' });
    }

    // Use the utility function (same JWT_SECRET as login)
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }

    return res.json({
      success: true,
      user: decoded
    });

  } catch (err) {
    console.error('Verify token error:', err);
    return res.status(401).json({ success: false, error: 'Token verification failed' });
  }
});

export default router;
