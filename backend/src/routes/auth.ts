import { Router, Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { generateToken, verifyToken } from '../utils/jwt.js';
import { getAdminByEmail, verifyAdminPassword, createAdmin } from '../services/database.js';

const router = Router();

// Admin Login
router.post('/admin/login', async (req, res) => {
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

    // 3. Check password (bcrypt assumed)
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // 4. 🔥 FETCH PGs (NEW LOGIC)
    const pgResult = await pool.query(
      'SELECT id, pg_type, name FROM pgs WHERE admin_id = $1',
      [admin.id]
    );

    // 5. Generate token (if you are using JWT)
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 6. ✅ FINAL RESPONSE (UPDATED)
    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email
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

    const admin = await getAdminByEmail(email);
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Failed to create admin' });
    }

    const token = generateToken(admin.id, admin.email, 'admin', admin.pgType);

    res.status(201).json({
      success: true,
      data: {
        token,
        admin: { id: admin.id, email: admin.email, pgType: admin.pgType }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Verify Token
router.post('/verify-token', (req, res) => {
  try {
    console.log("HEADERS:", req.headers); // 👈 TEMP DEBUG — remove after fix confirmed

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(400).json({ success: false });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(400).json({ success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.json({
      success: true,
      user: decoded
    });

  } catch (err) {
    return res.status(401).json({
      success: false
    });
  }
});

export default router;
