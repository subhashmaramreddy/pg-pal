import axios, { AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Admin {
  id: string;
  email: string;
  pgType: 'boys' | 'girls';
  token: string;
}

export interface TenantLoginResponse {
  id: string;
  email: string;
  name: string;
  pgType: 'boys' | 'girls';
  roomId: string;
  token: string;
}

export interface Room {
  id: string;
  pg_type: 'boys' | 'girls';
  room_number: string;
  floor: number;
  capacity: number;
  occupants: number;
  rent: number;
  deposit: number;
  status: 'available' | 'occupied';
  created_at: string;
  updated_at: string;
}

export interface Joiner {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  college: string;
  pg_type: 'boys' | 'girls';
  room_type: '2_sharing' | '3_sharing';
  join_date: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  joiner_id: string;
  room_id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  pg_type: 'boys' | 'girls';
  rent: number;
  deposit: number;
  join_date: string;
  status: 'active' | 'vacated';
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  month: string;
  amount: number;
  paid_date?: string;
  pg_type: 'boys' | 'girls';
  status: 'pending' | 'paid';
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalTenants: number;
  pendingPayments: number;
  monthlyRevenue: number;
  pendingJoiners: number;
}

class ApiClient {
  private client: AxiosInstance;
  private socket: Socket | null = null;
  private token: string | null = localStorage.getItem('auth_token');
  private pgType: 'boys' | 'girls' | null = localStorage.getItem('pg_type') as 'boys' | 'girls' | null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to every request
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // ===== AUTHENTICATION =====
  async adminLogin(email: string, password: string): Promise<Admin> {
    const response = await this.client.post<ApiResponse<Admin>>('/auth/admin/login', {
      email,
      password,
    });

    if (response.data.data) {
      const admin = response.data.data;
      this.token = admin.token;
      this.pgType = admin.pgType;
      localStorage.setItem('auth_token', admin.token);
      localStorage.setItem('pg_type', admin.pgType);
      localStorage.setItem('admin_email', admin.email);
    }

    return response.data.data!;
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.client.post<ApiResponse<{ valid: boolean }>>('/auth/verify-token', {});
      return response.data.data?.valid ?? false;
    } catch {
      return false;
    }
  }

  async tenantLogin(email: string, password: string): Promise<TenantLoginResponse> {
    const response = await this.client.post<ApiResponse<TenantLoginResponse>>('/tenant/login', {
      email,
      password,
    });

    if (response.data.data) {
      const tenant = response.data.data;
      this.token = tenant.token;
      this.pgType = tenant.pgType;
      localStorage.setItem('auth_token', tenant.token);
      localStorage.setItem('pg_type', tenant.pgType);
      localStorage.setItem('tenant_id', tenant.id);
      localStorage.setItem('tenant_name', tenant.name);
      localStorage.setItem('tenant_room_id', tenant.roomId);
    }

    return response.data.data!;
  }

  logout(): void {
    this.token = null;
    this.pgType = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('pg_type');
    localStorage.removeItem('admin_email');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('tenant_name');
    localStorage.removeItem('tenant_room_id');
    this.disconnectSocket();
  }

  // ===== DASHBOARD =====
  async getDashboardStats(pgType: 'boys' | 'girls'): Promise<DashboardStats> {
    const response = await this.client.get<ApiResponse<DashboardStats>>(`/admin/stats?pgType=${pgType}`);
    return response.data.data!;
  }

  // ===== ROOMS =====
  async getRooms(pgType: 'boys' | 'girls'): Promise<Room[]> {
    const response = await this.client.get<ApiResponse<Room[]>>(`/admin/rooms?pgType=${pgType}`);
    return response.data.data ?? [];
  }

  async createRoom(pgType: 'boys' | 'girls', roomNumber: string, floor: number, capacity: number, rent: number, deposit: number): Promise<Room> {
    const response = await this.client.post<ApiResponse<Room>>('/admin/rooms', {
      pg_type: pgType,
      room_number: roomNumber,
      floor,
      capacity,
      rent,
      deposit,
    });
    return response.data.data!;
  }

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<Room> {
    const response = await this.client.patch<ApiResponse<Room>>(`/admin/rooms/${roomId}`, updates);
    return response.data.data!;
  }

  // ===== TENANTS =====
  async getActiveTenants(pgType: 'boys' | 'girls'): Promise<Tenant[]> {
    const response = await this.client.get<ApiResponse<Tenant[]>>(`/admin/tenants?pgType=${pgType}`);
    return response.data.data ?? [];
  }

  async getTenantProfile(tenantId: string): Promise<{ tenant: Tenant; room: Room }> {
    const response = await this.client.get<ApiResponse<{ tenant: Tenant; room: Room }>>(`/tenant/profile/${tenantId}`);
    return response.data.data!;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    const response = await this.client.post<ApiResponse<{ success: boolean }>>('/tenant/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data.data!;
  }

  async updateTenantPresence(tenantId: string, isPresent: boolean): Promise<Tenant> {
    const response = await this.client.patch<ApiResponse<Tenant>>(`/admin/tenants/${tenantId}/presence`, {
      is_present: isPresent,
    });
    return response.data.data!;
  }

  async vacateTenant(tenantId: string): Promise<{ success: boolean }> {
    const response = await this.client.post<ApiResponse<{ success: boolean }>>(`/admin/tenants/${tenantId}/vacate`, {});
    return response.data.data!;
  }

  async shiftTenant(tenantId: string, newRoomId: string): Promise<Tenant> {
    const response = await this.client.post<ApiResponse<Tenant>>(`/admin/tenants/${tenantId}/shift`, {
      new_room_id: newRoomId,
    });
    return response.data.data!;
  }

  // ===== JOINERS / APPLICATIONS =====
  async getPendingJoiners(pgType: 'boys' | 'girls'): Promise<Joiner[]> {
    const response = await this.client.get<ApiResponse<Joiner[]>>(`/admin/joiners?pgType=${pgType}&status=pending`);
    return response.data.data ?? [];
  }

  async approveJoiner(joinerId: string, roomId: string, rent: number, deposit: number): Promise<Tenant> {
    const response = await this.client.post<ApiResponse<Tenant>>('/admin/approve', {
      joiner_id: joinerId,
      room_id: roomId,
      rent,
      deposit,
    });
    return response.data.data!;
  }

  async rejectJoiner(joinerId: string): Promise<{ success: boolean }> {
    const response = await this.client.post<ApiResponse<{ success: boolean }>>('/admin/joiners/{joiner_id}/reject', {
      joiner_id: joinerId,
    });
    return response.data.data!;
  }

  async submitJoinerApplication(data: {
    name: string;
    email: string;
    phone: string;
    gender: 'male' | 'female';
    college: string;
    pgType: 'boys' | 'girls';
    roomType: '2_sharing' | '3_sharing';
    joinDate: string;
  }): Promise<Joiner> {
    const response = await this.client.post<ApiResponse<Joiner>>('/tenant/join', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      gender: data.gender,
      college: data.college,
      pg_type: data.pgType,
      room_type: data.roomType,
      join_date: data.joinDate,
    });
    return response.data.data!;
  }

  // ===== PAYMENTS =====
  async getPaymentsByPG(pgType: 'boys' | 'girls'): Promise<Payment[]> {
    const response = await this.client.get<ApiResponse<Payment[]>>(`/admin/payments?pgType=${pgType}`);
    return response.data.data ?? [];
  }

  async getPaymentsByTenant(tenantId: string): Promise<Payment[]> {
    const response = await this.client.get<ApiResponse<Payment[]>>(`/tenant/payments/${tenantId}`);
    return response.data.data ?? [];
  }

  async createPayment(tenantId: string, month: string, amount: number): Promise<Payment> {
    const response = await this.client.post<ApiResponse<Payment>>('/admin/payments', {
      tenant_id: tenantId,
      month,
      amount,
    });
    return response.data.data!;
  }

  async markPaymentDone(paymentId: string): Promise<Payment> {
    const response = await this.client.patch<ApiResponse<Payment>>(`/admin/payments/${paymentId}/mark-paid`, {
      status: 'paid',
    });
    return response.data.data!;
  }

  // ===== WEBSOCKET =====
  connectSocket(token: string, pgType: 'boys' | 'girls'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(WS_URL, {
          auth: { token },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
          console.log('✓ WebSocket connected');
          this.socket?.emit('join-room', { pgType, role: 'admin' });
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('✗ WebSocket connection error:', error);
          reject(error);
        });

        this.socket.on('disconnect', () => {
          console.log('✗ WebSocket disconnected');
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onSocketEvent(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  offSocketEvent(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
const apiClient = new ApiClient();
export default apiClient;
