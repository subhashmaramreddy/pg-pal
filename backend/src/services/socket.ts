import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from '../utils/jwt.js';
import { SocketAuthData } from '../types/express.js';

export function initializeSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  // Middleware for authentication
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('No token provided'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      socket.data.auth = {
        userId: decoded.id,
        userEmail: decoded.email,
        userRole: decoded.role,
        pgType: decoded.pgType
      } as SocketAuthData;

      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', (socket: Socket) => {
    const auth = socket.data.auth as SocketAuthData;
    console.log(`✓ User connected: ${auth.userEmail} (${auth.userRole})`);

    // Join PG-specific room
    if (auth.pgType) {
      socket.join(`pg:${auth.pgType}`);
      socket.join(`role:${auth.userRole}`);
    }

    // ==================== ADMIN EVENTS ====================

    // New joiner application received
    socket.on('joiner:submitted', (data) => {
      if (auth.userRole === 'admin') {
        io.to(`pg:${data.pgType}`).to('role:admin').emit('joiner:new', data);
      }
    });

    // Joiner approved
    socket.on('joiner:approved', (data) => {
      const { joinerId, pgType } = data;
      io.to(`pg:${pgType}`).emit('joiner:approved', { joinerId });
    });

    // Joiner rejected
    socket.on('joiner:rejected', (data) => {
      const { joinerId, pgType } = data;
      io.to(`pg:${pgType}`).emit('joiner:rejected', { joinerId });
    });

    // Tenant vacated
    socket.on('tenant:vacated', (data) => {
      const { tenantId, pgType } = data;
      io.to(`pg:${pgType}`).emit('tenant:left', { tenantId });
    });

    // Tenant shifted to new room
    socket.on('tenant:shifted', (data) => {
      const { tenantId, oldRoomId, newRoomId, pgType } = data;
      io.to(`pg:${pgType}`).emit('tenant:roomChanged', { tenantId, oldRoomId, newRoomId });
    });

    // Room capacity updated
    socket.on('room:capacityUpdated', (data) => {
      const { roomId, capacity, pgType } = data;
      io.to(`pg:${pgType}`).emit('room:updated', { roomId, capacity });
    });

    // ==================== TENANT EVENTS ====================

    // Tenant presence updated
    socket.on('presence:updated', (data) => {
      const { tenantId, status, pgType } = data;
      io.to(`pg:${pgType}`).emit('presence:changed', { tenantId, status });
    });

    // Payment made
    socket.on('payment:made', (data) => {
      const { paymentId, tenantId, amount, pgType } = data;
      io.to(`pg:${pgType}`).emit('payment:recorded', { paymentId, tenantId, amount });
    });

    // Leave requested
    socket.on('leave:requested', (data) => {
      const { leaveId, tenantId, startDate, endDate, pgType } = data;
      io.to(`pg:${pgType}`).emit('leave:new', { leaveId, tenantId, startDate, endDate });
    });

    // ==================== SHARED EVENTS ====================

    // Get online users count
    socket.on('users:count', (callback) => {
      const count = io.engine.clientsCount;
      callback({ count });
    });

    // Send notification
    socket.on('notification:send', (data) => {
      const { to, message, type } = data;
      if (to === 'admin') {
        io.to('role:admin').emit('notification:received', { message, type });
      } else if (to === 'tenant') {
        io.to('role:tenant').emit('notification:received', { message, type });
      } else if (to === 'pgType') {
        io.to(`pg:${auth.pgType}`).emit('notification:received', { message, type });
      }
    });

    // ==================== CONNECTION EVENTS ====================

    socket.on('disconnect', () => {
      console.log(`✗ User disconnected: ${auth.userEmail}`);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
}

// Helper function to emit events from the backend
export function broadcastUpdate(
  io: SocketIOServer,
  eventName: string,
  data: any,
  pgType?: 'boys' | 'girls'
) {
  if (pgType) {
    io.to(`pg:${pgType}`).emit(eventName, data);
  } else {
    io.emit(eventName, data);
  }
}

export function notifyAdmins(
  io: SocketIOServer,
  message: string,
  data?: any,
  pgType?: 'boys' | 'girls'
) {
  const eventData = { message, ...data };
  if (pgType) {
    io.to(`pg:${pgType}`).to('role:admin').emit('notification:received', eventData);
  } else {
    io.to('role:admin').emit('notification:received', eventData);
  }
}

export function notifyTenant(
  io: SocketIOServer,
  tenantId: string,
  message: string,
  data?: any
) {
  const eventData = { message, ...data };
  io.to(`user:${tenantId}`).emit('notification:received', eventData);
}
