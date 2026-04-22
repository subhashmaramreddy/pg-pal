// Development-only endpoint for seeding data (NOT FOR PRODUCTION)
import { Router, Response } from 'express';
import { AuthRequest } from '../types/express.js';
import { createAdmin, seedRooms } from '../services/database.js';

const router = Router();

// ⚠️  DEVELOPMENT ONLY - Remove in production!
router.post('/seed-admin', async (req: AuthRequest, res: Response) => {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ success: false, error: 'This endpoint is only available in development' });
  }

  try {
    const { email = 'guesthubpg@gmail.com', password = 'Guesthub117', pgType = 'boys' } = req.body;

    const result = await createAdmin(email, password, pgType);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({ success: true, message: 'Admin account created', data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// ⚠️  DEVELOPMENT ONLY - Remove in production!
router.post('/seed-rooms', async (req: AuthRequest, res: Response) => {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ success: false, error: 'This endpoint is only available in development' });
  }

  try {
    const result = await seedRooms();
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({ success: true, message: 'Rooms seeded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
