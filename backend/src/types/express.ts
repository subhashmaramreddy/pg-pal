import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: 'admin' | 'tenant';
  pgType?: 'boys' | 'girls';
}

export interface SocketAuthData {
  userId: string;
  userEmail: string;
  userRole: 'admin' | 'tenant';
  pgType?: 'boys' | 'girls';
}
