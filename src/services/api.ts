// Frontend API Client for PG-Pal Backend
// Place this in src/services/api.ts

import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';
import {
  JoinerApplication,
  Tenant,
  Payment,
  Room,
  Leave,
  DashboardStats,
  ApiResponse,
  Admin
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

class PGPalAPI {
  private apiClient: AxiosInstance;
  private socket: Socket | null = null;
  private token: string | null = null;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to every request
    this.apiClient.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Load token from localStorage on init
    this.token = localStorage.getItem('pgpal_token');
  }

  // ==================== AUTHENTICATION ====================

  async adminLogin(email: string, password: string): Promise<{ token: string; admin: Admin }> {
    const response = await this.apiClient.post('/auth/admin/login', { email, password });
    const { token, admin } = response.data.data;
    this.setToken(token);
    return { token, admin };
  }

  async adminRegister(
    email: string,
    password: string,
    pgType: 'boys' | 'girls'
  ): Promise<{ token: string; admin: Admin }> {
    const response = await this.apiClient.post('/auth/admin/register', {
      email,
      password,
      pgType
    });
    const { token, admin } = response.data.data;
    this.setToken(token);
    return { token, admin };
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      await this.apiClient.post('/auth/verify-token', { token });
      return true;
    } catch {
      return false;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('pgpal_token', token);
    this.apiClient.defaults.headers.Authorization = `Bearer ${token}`;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('pgpal_token');
    delete this.apiClient.defaults.headers.Authorization;
    this.disconnect();
  }

  // ==================== TENANT ROUTES ====================

  async submitJoinerApplication(data: Partial<JoinerApplication>) {
    const response = await this.apiClient.post('/tenant/join', data);
    return response.data.data;
  }

  async getTenantProfile(tenantId: string): Promise<{ tenant: Tenant; room: Room }> {
    const response = await this.apiClient.get(`/tenant/profile/${tenantId}`);
    return response.data.data;
  }

  async getPaymentHistory(tenantId: string): Promise<Payment[]> {
    const response = await this.apiClient.get(`/tenant/payments/${tenantId}`);
    return response.data.data;
  }

  async getLeaveRequests(tenantId: string): Promise<Leave[]> {
    const response = await this.apiClient.get(`/tenant/leaves/${tenantId}`);
    return response.data.data;
  }

  async requestLeave(tenantId: string, startDate: string, endDate: string, reason?: string) {
    const response = await this.apiClient.post(`/tenant/leaves/${tenantId}`, {
      startDate,
      endDate,
      reason
    });
    return response.data.data;
  }

  // ==================== ADMIN ROUTES ====================

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.apiClient.get('/admin/stats');
    return response.data.data;
  }

  async getPendingJoiners(): Promise<JoinerApplication[]> {
    const response = await this.apiClient.get('/admin/joiners');
    return response.data.data;
  }

  async approveJoiner(joinerId: string, roomId: string, rent: number, deposit: number) {
    const response = await this.apiClient.post(`/admin/joiners/${joinerId}/approve`, {
      roomId,
      rent,
      deposit
    });
    return response.data.data;
  }

  async rejectJoiner(joinerId: string) {
    const response = await this.apiClient.post(`/admin/joiners/${joinerId}/reject`);
    return response.data;
  }

  async getActiveTenants(search?: string): Promise<Tenant[]> {
    const response = await this.apiClient.get('/admin/tenants', {
      params: { search }
    });
    return response.data.data;
  }

  async getTenantById(tenantId: string): Promise<Tenant> {
    const response = await this.apiClient.get(`/admin/tenants/${tenantId}`);
    return response.data.data;
  }

  async updateTenantPresence(tenantId: string, status: 'present' | 'on-leave') {
    const response = await this.apiClient.patch(`/admin/tenants/${tenantId}/presence`, {
      status
    });
    return response.data.data;
  }

  async vacateTenant(tenantId: string) {
    const response = await this.apiClient.post(`/admin/tenants/${tenantId}/vacate`);
    return response.data;
  }

  async shiftTenant(tenantId: string, newRoomId: string) {
    const response = await this.apiClient.post(`/admin/tenants/${tenantId}/shift`, {
      newRoomId
    });
    return response.data.data;
  }

  async getRooms(): Promise<Room[]> {
    const response = await this.apiClient.get('/admin/rooms');
    return response.data.data;
  }

  async updateRoomCapacity(roomId: string, capacity: number) {
    const response = await this.apiClient.patch(`/admin/rooms/${roomId}/capacity`, {
      capacity
    });
    return response.data.data;
  }

  async getPayments(): Promise<Payment[]> {
    const response = await this.apiClient.get('/admin/payments');
    return response.data.data;
  }

  async markPaymentAsPaid(
    paymentId: string,
    paymentMethod: string,
    transactionId?: string
  ) {
    const response = await this.apiClient.post(
      `/admin/payments/${paymentId}/mark-paid`,
      { paymentMethod, transactionId }
    );
    return response.data.data;
  }

  // ==================== WEBSOCKET ====================

  connectSocket(onConnect?: () => void, onError?: (error: any) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(WS_URL, {
          auth: {
            token: this.token
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
          console.log('✓ WebSocket connected');
          onConnect?.();
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('✗ WebSocket error:', error);
          onError?.(error);
          reject(error);
        });

        this.socket.on('error', (error) => {
          console.error('✗ Socket error:', error);
          onError?.(error);
        });

        this.socket.on('disconnect', () => {
          console.log('✗ WebSocket disconnected');
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Listen to events
  on(eventName: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  off(eventName: string) {
    if (this.socket) {
      this.socket.off(eventName);
    }
  }

  // Emit events
  emit(eventName: string, data: any) {
    if (this.socket) {
      this.socket.emit(eventName, data);
    }
  }

  // Real-time event listeners
  onJoinerSubmitted(callback: (data: any) => void) {
    this.on('joiner:new', callback);
  }

  onJoinerApproved(callback: (data: any) => void) {
    this.on('joiner:approved', callback);
  }

  onTenantLeft(callback: (data: any) => void) {
    this.on('tenant:left', callback);
  }

  onPresenceChanged(callback: (data: any) => void) {
    this.on('presence:changed', callback);
  }

  onPaymentRecorded(callback: (data: any) => void) {
    this.on('payment:recorded', callback);
  }

  onNotification(callback: (data: any) => void) {
    this.on('notification:received', callback);
  }

  // Emit events
  emitJoinerSubmitted(data: any) {
    this.emit('joiner:submitted', data);
  }

  emitTenantVacated(data: any) {
    this.emit('tenant:vacated', data);
  }

  emitPresenceUpdated(data: any) {
    this.emit('presence:updated', data);
  }

  emitPaymentMade(data: any) {
    this.emit('payment:made', data);
  }

  sendNotification(to: string, message: string, type: string) {
    this.emit('notification:send', { to, message, type });
  }
}

// Export singleton instance
export const pgpalAPI = new PGPalAPI();
export default pgpalAPI;
