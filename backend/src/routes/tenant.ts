import { Router, Response } from 'express';
import { AuthRequest } from '../types/express.js';
import {
  submitJoinerApplication,
  getTenantById,
  getPaymentsByTenant,
  getLeavesByTenant,
  requestLeave,
  getRoomById
} from '../services/database.js';
import { authMiddleware, tenantOnly } from '../middleware/auth.js';
import { generateToken } from '../utils/jwt.js';
import { pool } from '../utils/db.js';
import bcrypt from 'bcrypt';

const router = Router();

// ==================== TENANT LOGIN ====================

/**
 * POST /tenant/login
 * Tenant login with email and password
 * Default password: Welcome@123 (set when admin approves joiner)
 * Tenant can change password after login
 */
router.post('/login', async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    // Get tenant by email
    const result = await pool.query(
      'SELECT * FROM tenants WHERE email = $1 AND status = $2 LIMIT 1',
      [email, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const tenant = result.rows[0];

    // Verify password
    const passwordValid = await bcrypt.compare(password, tenant.password);
    if (!passwordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(
      tenant.id,
      tenant.email,
      'tenant',
      tenant.pg_type
    );

    res.json({
      success: true,
      data: {
        id: tenant.id,
        email: tenant.email,
        name: tenant.name,
        pgType: tenant.pg_type,
        roomId: tenant.room_id,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

/**
 * POST /tenant/change-password
 * Tenant change their password
 * Default password is "Welcome@123" - must be changed on first login
 */
router.post('/change-password', authMiddleware, tenantOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Get tenant
    const result = await pool.query('SELECT * FROM tenants WHERE id = $1 LIMIT 1', [req.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    const tenant = result.rows[0];

    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, tenant.password);
    if (!passwordValid) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE tenants SET password = $1, updated_at = $2 WHERE id = $3',
      [hashedPassword, new Date().toISOString(), req.userId]
    );

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ==================== TENANT PROFILE & HISTORY ====================

// Submit joiner application (public - no auth required)
router.post('/join', async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      college,
      department,
      year,
      pgType,
      roomType,
      joinDate,
      aadhaarUrl,
      collegeIdUrl
    } = req.body;

    if (!name || !email || !phone || !gender || !college || !pgType || !roomType || !joinDate) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const result = await submitJoinerApplication({
      name,
      email,
      phone,
      gender,
      college,
      department,
      year,
      pgType,
      roomType,
      joinDate,
      aadhaarUrl,
      collegeIdUrl
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Generate token for the new tenant (they can use it to login before approval)
    const token = generateToken(result.data!.id, result.data!.email, 'tenant', result.data!.pgType);

    res.status(201).json({
      success: true,
      data: {
        application: result.data,
        token
      },
      message: 'Application submitted successfully. Awaiting admin approval.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get tenant profile
router.get('/profile/:tenantId', authMiddleware, tenantOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;

    if (req.userId !== tenantId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const tenant = await getTenantById(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    const room = await getRoomById(tenant.roomId);

    res.json({ success: true, data: { tenant, room } });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get tenant payment history
router.get('/payments/:tenantId', authMiddleware, tenantOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;

    if (req.userId !== tenantId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const payments = await getPaymentsByTenant(tenantId);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Get tenant leaves
router.get('/leaves/:tenantId', authMiddleware, tenantOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;

    if (req.userId !== tenantId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const leaves = await getLeavesByTenant(tenantId);
    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Request leave
router.post('/leaves/:tenantId', authMiddleware, tenantOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { startDate, endDate, reason } = req.body;

    if (req.userId !== tenantId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Start date and end date required' });
    }

    const tenant = await getTenantById(tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    const result = await requestLeave({
      tenantId,
      pgType: tenant.pgType,
      startDate,
      endDate,
      reason
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
