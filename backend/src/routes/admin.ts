import { Router, Response } from 'express';
import { AuthRequest } from '../types/express.js';
import {
  getPendingJoiners,
  approveJoiner,
  rejectJoiner,
  getActiveTenants,
  searchTenants,
  updateTenantPresence,
  vacateTenant,
  shiftTenant,
  getRooms,
  updateRoomCapacity,
  getPaymentsByPG,
  markPaymentAsPaid,
  getDashboardStats,
  getTenantById
} from '../services/database.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { pool } from '../utils/db.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminOnly);

// ==================== DASHBOARD ====================

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const pgType = req.pgType as 'boys' | 'girls';
    if (!pgType) {
      return res.status(400).json({ success: false, error: 'Invalid PG type' });
    }

    const stats = await getDashboardStats(pgType);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const pgType = req.pgType as 'boys' | 'girls';
    if (!pgType) {
      return res.status(400).json({ success: false, error: 'Invalid PG type' });
    }

    const [rooms, tenants, joiners, payments] = await Promise.all([
      getRooms(pgType),
      getActiveTenants(pgType),
      getPendingJoiners(pgType),
      getPaymentsByPG(pgType)
    ]);

    res.json({ success: true, data: { rooms, tenants, joiners, payments } });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ==================== JOINER APPROVALS ====================

router.get('/joiners', async (req: AuthRequest, res: Response) => {
  try {
    const pgType = req.pgType as 'boys' | 'girls';
    if (!pgType) {
      return res.status(400).json({ success: false, error: 'Invalid PG type' });
    }

    const joiners = await getPendingJoiners(pgType);
    res.json({ success: true, data: joiners });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/joiners/:joinerId/approve', async (req: AuthRequest, res: Response) => {
  try {
    const { joinerId } = req.params;
    const { roomId, rent, deposit } = req.body;

    if (!roomId || !rent || !deposit) {
      return res.status(400).json({ success: false, error: 'Room ID, rent, and deposit required' });
    }

    const result = await approveJoiner(joinerId, roomId, rent, deposit);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/joiners/:joinerId/reject', async (req: AuthRequest, res: Response) => {
  try {
    const { joinerId } = req.params;
    const result = await rejectJoiner(joinerId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ==================== TENANT MANAGEMENT ====================

router.get('/tenants', async (req: AuthRequest, res: Response) => {
  try {
    const pgType = req.pgType as 'boys' | 'girls';
    const { search } = req.query;

    if (!pgType) {
      return res.status(400).json({ success: false, error: 'Invalid PG type' });
    }

    let tenants;
    if (search && typeof search === 'string') {
      tenants = await searchTenants(pgType, search);
    } else {
      tenants = await getActiveTenants(pgType);
    }

    res.json({ success: true, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/tenants/:tenantId', async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    const tenant = await getTenantById(tenantId);

    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    if (tenant.pgType !== req.pgType) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    res.json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.patch('/tenants/:tenantId/presence', async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { status } = req.body;

    if (!status || !['present', 'on-leave'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const result = await updateTenantPresence(tenantId, status);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/tenants/:tenantId/vacate', async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    const result = await vacateTenant(tenantId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/tenants/:tenantId/shift', async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { newRoomId } = req.body;

    if (!newRoomId) {
      return res.status(400).json({ success: false, error: 'New room ID required' });
    }

    const result = await shiftTenant(tenantId, newRoomId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ==================== ROOM MANAGEMENT ====================

router.get('/rooms', async (req: AuthRequest, res: Response) => {
  try {
    const pgType = req.pgType as 'boys' | 'girls';
    if (!pgType) {
      return res.status(400).json({ success: false, error: 'Invalid PG type' });
    }

    const rooms = await getRooms(pgType);
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/rooms', async (req: AuthRequest, res: Response) => {
  try {
    const { room_number, floor, capacity } = req.body;
    const pgType = req.pgType as 'boys' | 'girls';

    if (!pgType || !room_number || !floor || !capacity) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (![2, 3].includes(capacity)) {
      return res.status(400).json({ success: false, error: 'Capacity must be 2 or 3' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO rooms (pg_type, room_number, floor, capacity, occupants, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [pgType, room_number, floor, capacity, 0, 'available']
      );
      res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
      console.error('Room creation error:', error);
      // If duplicate, try to fetch existing room
      if (error.code === '23505') {
        const existingResult = await pool.query(
          'SELECT * FROM rooms WHERE pg_type = $1 AND room_number = $2 LIMIT 1',
          [pgType, room_number]
        );
        
        if (existingResult.rows.length > 0) {
          return res.json({ success: true, data: existingResult.rows[0], message: 'Room already exists' });
        }
      }
      return res.status(400).json({ success: false, error: error.message });
    }
  } catch (error) {
    console.error('Room creation exception:', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.patch('/rooms/:roomId/capacity', async (req: AuthRequest, res: Response) => {
  try {
    const { roomId } = req.params;
    const { capacity } = req.body;

    if (!capacity || ![2, 3].includes(capacity)) {
      return res.status(400).json({ success: false, error: 'Capacity must be 2 or 3' });
    }

    const result = await updateRoomCapacity(roomId, capacity);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ==================== PAYMENT MANAGEMENT ====================

router.get('/payments', async (req: AuthRequest, res: Response) => {
  try {
    const pgType = req.pgType as 'boys' | 'girls';
    if (!pgType) {
      return res.status(400).json({ success: false, error: 'Invalid PG type' });
    }

    const payments = await getPaymentsByPG(pgType);
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/payments/:paymentId/mark-paid', async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod, transactionId } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ success: false, error: 'Payment method required' });
    }

    const result = await markPaymentAsPaid(paymentId, paymentMethod, transactionId);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
