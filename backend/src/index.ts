// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initializeSocket } from './services/socket.js';
import { errorHandler } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenant.js';
import adminRoutes from './routes/admin.js';
import devRoutes from './routes/dev.js';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.io
const io = initializeSocket(httpServer);
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dev', devRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation
app.get('/api', (req: Request, res: Response) => {
  res.json({
    name: 'PG-Pal Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/admin/login': 'Admin login',
        'POST /api/auth/admin/register': 'Admin registration',
        'POST /api/auth/verify-token': 'Verify JWT token'
      },
      tenant: {
        'POST /api/tenant/join': 'Submit joiner application',
        'GET /api/tenant/profile/:tenantId': 'Get tenant profile',
        'GET /api/tenant/payments/:tenantId': 'Get payment history',
        'GET /api/tenant/leaves/:tenantId': 'Get leave requests',
        'POST /api/tenant/leaves/:tenantId': 'Request leave'
      },
      admin: {
        'GET /api/admin/stats': 'Get dashboard statistics',
        'GET /api/admin/joiners': 'Get pending applications',
        'POST /api/admin/joiners/:joinerId/approve': 'Approve joiner',
        'POST /api/admin/joiners/:joinerId/reject': 'Reject joiner',
        'GET /api/admin/tenants': 'Get active tenants',
        'GET /api/admin/tenants/:tenantId': 'Get tenant details',
        'PATCH /api/admin/tenants/:tenantId/presence': 'Update presence',
        'POST /api/admin/tenants/:tenantId/vacate': 'Vacate tenant',
        'POST /api/admin/tenants/:tenantId/shift': 'Shift tenant room',
        'GET /api/admin/rooms': 'Get all rooms',
        'PATCH /api/admin/rooms/:roomId/capacity': 'Update room capacity',
        'GET /api/admin/payments': 'Get all payments',
        'POST /api/admin/payments/:paymentId/mark-paid': 'Mark payment as paid'
      }
    },
    websocket: {
      'joiner:submitted': 'New joiner application',
      'tenant:vacated': 'Tenant vacated',
      'presence:updated': 'Tenant presence updated',
      'payment:made': 'Payment recorded',
      'room:capacityUpdated': 'Room capacity changed',
      'leave:requested': 'Leave request created'
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Initialize database connection
    // (Pool connects automatically, no initialization needed)

    httpServer.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════╗
║         PG-Pal Backend Server Running          ║
║                                                ║
║  Server: http://localhost:${PORT}                ║
║  API Docs: http://localhost:${PORT}/api          ║
║  WebSocket: ws://localhost:${PORT}               ║
╚════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
