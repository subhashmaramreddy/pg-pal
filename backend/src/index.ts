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

// ✅ FIXED CORS (simple & reliable)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://pg-pal-black.vercel.app"
  ]
}));

// Debug logging (keep for now)
app.use((req: Request, res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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
    version: '1.0.0'
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
    httpServer.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();