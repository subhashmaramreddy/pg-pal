// Frontend API Types
// Place this in src/types/api.ts

export interface Admin {
  id: string;
  email: string;
  pgType: 'boys' | 'girls';
}

export interface JoinerApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: 'M' | 'F';
  college: string;
  department: string;
  year: number;
  aadhaarUrl?: string;
  collegeIdUrl?: string;
  pgType: 'boys' | 'girls';
  roomType: '2-sharing' | '3-sharing';
  joinDate: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  joinerId: string;
  roomId: string;
  name: string;
  email: string;
  phone: string;
  gender: 'M' | 'F';
  college: string;
  department: string;
  year: number;
  aadhaarUrl?: string;
  collegeIdUrl?: string;
  pgType: 'boys' | 'girls';
  roomType: '2-sharing' | '3-sharing';
  rent: number;
  deposit: number;
  joinDate: string;
  status: 'active' | 'on-leave' | 'present';
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  pgType: 'boys' | 'girls';
  roomNumber: string;
  floor: number;
  capacity: number;
  occupants: number;
  status: 'available' | 'occupied' | 'maintenance';
  tenantIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  pgType: 'boys' | 'girls';
  amount: number;
  month: string;
  status: 'pending' | 'paid';
  paymentMethod?: 'online' | 'cash' | 'check';
  transactionId?: string;
  receiptUrl?: string;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Leave {
  id: string;
  tenantId: string;
  pgType: 'boys' | 'girls';
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'requested' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  activeTenants: number;
  pendingApprovals: number;
  tenantsPresent: number;
  tenantsOnLeave: number;
  totalCollected: number;
  pendingAmount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
