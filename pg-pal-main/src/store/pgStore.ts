import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '@/services/api';

// Types
export interface Joiner {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  parentMobile: string;
  emergencyContact: string;
  gender: 'male' | 'female';
  college: string;
  department: string;
  year: string;
  idProofType: 'aadhaar' | 'college_id';
  aadhaarFile?: string; // base64 or file name
  collegeIdFile?: string; // base64 or file name
  pgType: 'boys' | 'girls';
  roomType: '2_sharing' | '3_sharing';
  joiningDate: string;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  mobile: string;
  parentMobile?: string;
  emergencyContact?: string;
  room: string;
  floor: number;
  college: string;
  department?: string;
  status: 'active' | 'inactive';
  presenceStatus: 'present' | 'on_leave';
  rentStatus: 'paid' | 'pending';
  rentAmount: number;
  depositAmount: number;
  joinDate: string;
  vacateDate?: string;
  aadhaarFile?: string;
  collegeIdFile?: string;
}

export interface PastTenant {
  id: string;
  name: string;
  email: string;
  mobile: string;
  previousRoom: string;
  floor: number;
  college: string;
  joinDate: string;
  vacateDate: string;
  totalPaid: number;
  depositAmount: number;
}

export interface Room {
  number: string;
  floor: number;
  status: 'occupied' | 'available';
  capacity: number;
  tenantIds: string[];
}

export interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  room: string;
  amount: number;
  month: string;
  status: 'paid' | 'pending';
  paidDate?: string;
  method?: 'cash' | 'online';
}

interface PGStore {
  // Data
  rooms: Room[];
  tenants: Tenant[];
  pastTenants: PastTenant[];
  joiners: Joiner[];
  payments: Payment[];
  
  // Actions
  addJoiner: (joiner: Omit<Joiner, 'id' | 'applicationDate' | 'status'>) => Promise<void>;
  approveJoiner: (joinerId: string, roomNumber: string, rentAmount: number, depositAmount: number) => Promise<void>;
  rejectJoiner: (joinerId: string) => Promise<void>;
  updateTenantPresence: (tenantId: string, presenceStatus: 'present' | 'on_leave') => Promise<void>;
  vacateTenant: (tenantId: string) => Promise<void>;
  shiftTenant: (tenantId: string, newRoomNumber: string) => Promise<void>;
  markPayment: (paymentId: string, method: 'cash' | 'online') => Promise<void>;
  setRoomCapacity: (roomNumber: string, capacity: 2 | 3) => Promise<boolean>;
  
  // Data loading methods
  loadRooms: (pgType: 'boys' | 'girls') => Promise<void>;
  loadTenants: (pgType: 'boys' | 'girls') => Promise<void>;
  loadJoiners: (pgType: 'boys' | 'girls') => Promise<void>;
  loadPayments: (pgType: 'boys' | 'girls') => Promise<void>;
  loadAllData: (pgType: 'boys' | 'girls') => Promise<void>;
  
  // Computed
  getStats: () => {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    totalTenants: number;
    presentToday: number;
    onLeaveToday: number;
    totalCollected: number;
    pendingAmount: number;
    pendingApprovals: number;
  };
  getActiveTenants: () => Tenant[];
  getPaymentsByTenant: (tenantId: string) => Payment[];
}

// Generate initial rooms
const generateInitialRooms = (): Room[] => {
  return [];
};

// Initial mock tenants
const initialTenants: Tenant[] = [];

// Initial mock joiners (pending applications)
const initialJoiners: Joiner[] = [];

// Initial past tenants
const initialPastTenants: PastTenant[] = [];

// Generate initial payments
const generateInitialPayments = (tenants: Tenant[]): Payment[] => {
  return [];
};

// Update rooms based on tenants
const updateRoomsWithTenants = (rooms: Room[], tenants: Tenant[]): Room[] => {
  return rooms;
};

const initialRooms = updateRoomsWithTenants(generateInitialRooms(), initialTenants);

export const usePGStore = create<PGStore>()(
  persist(
    (set, get) => ({
      rooms: initialRooms,
      tenants: initialTenants,
      pastTenants: initialPastTenants,
      joiners: initialJoiners,
      payments: generateInitialPayments(initialTenants),

      addJoiner: async (joinerData) => {
        try {
          const apiJoiner = await apiClient.submitJoinerApplication({
            name: joinerData.fullName,
            email: joinerData.email,
            phone: joinerData.mobile,
            gender: joinerData.gender,
            college: joinerData.college,
            pgType: joinerData.pgType,
            roomType: joinerData.roomType,
            joinDate: joinerData.joiningDate,
          });

          const newJoiner: Joiner = {
            id: apiJoiner.id,
            fullName: apiJoiner.name,
            email: apiJoiner.email,
            mobile: apiJoiner.phone,
            parentMobile: '',
            emergencyContact: '',
            gender: apiJoiner.gender,
            college: apiJoiner.college,
            department: '',
            year: '',
            idProofType: 'aadhaar',
            pgType: apiJoiner.pg_type,
            roomType: apiJoiner.room_type,
            joiningDate: apiJoiner.join_date,
            applicationDate: new Date(apiJoiner.created_at).toISOString().split("T")[0],
            status: "pending",
          };
          set((state) => ({
            joiners: [...state.joiners, newJoiner],
          }));
        } catch (error) {
          console.error('Failed to add joiner:', error);
        }
      },

      approveJoiner: async (joinerId, roomNumber, rentAmount, depositAmount) => {
        try {
          const tenant = await apiClient.approveJoiner(joinerId, roomNumber, rentAmount, depositAmount);
          
          const newTenant: Tenant = {
            id: tenant.id,
            name: tenant.name,
            email: tenant.email,
            mobile: tenant.phone,
            parentMobile: '',
            emergencyContact: '',
            room: roomNumber,
            floor: parseInt(roomNumber.charAt(0)),
            college: tenant.college,
            department: '',
            status: "active",
            presenceStatus: "present",
            rentStatus: "pending",
            rentAmount: tenant.rent,
            depositAmount: tenant.deposit,
            joinDate: tenant.join_date,
          };

          const newPayment: Payment = {
            id: `p${Date.now()}`,
            tenantId: tenant.id,
            tenantName: tenant.name,
            room: roomNumber,
            amount: rentAmount,
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            status: "pending",
          };

          set((state) => {
            const updatedJoiners = state.joiners.map((j) => (j.id === joinerId ? { ...j, status: "approved" as const } : j));
            return {
              tenants: [...state.tenants, newTenant],
              joiners: updatedJoiners,
              payments: [...state.payments, newPayment],
            };
          });
        } catch (error) {
          console.error('Failed to approve joiner:', error);
        }
      },

      rejectJoiner: async (joinerId) => {
        try {
          await apiClient.rejectJoiner(joinerId);
          set((state) => ({
            joiners: state.joiners.map((j) => (j.id === joinerId ? { ...j, status: "rejected" as const } : j)),
          }));
        } catch (error) {
          console.error('Failed to reject joiner:', error);
        }
      },

      updateTenantPresence: async (tenantId, presenceStatus) => {
        try {
          const isPresent = presenceStatus === 'present';
          await apiClient.updateTenantPresence(tenantId, isPresent);
          set((state) => ({
            tenants: state.tenants.map((t) => (t.id === tenantId ? { ...t, presenceStatus } : t)),
          }));
        } catch (error) {
          console.error('Failed to update tenant presence:', error);
        }
      },

      vacateTenant: async (tenantId) => {
        try {
          await apiClient.vacateTenant(tenantId);
          const { tenants, rooms, payments, pastTenants } = get();
          const tenant = tenants.find(t => t.id === tenantId);
          if (!tenant || tenant.status === 'inactive') return;

          const vacateDate = new Date().toISOString().split("T")[0];
          
          // Calculate total paid
          const tenantPayments = payments.filter(p => p.tenantId === tenantId && p.status === 'paid');
          const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0);

          // Create past tenant record
          const newPastTenant: PastTenant = {
            id: `pt${Date.now()}`,
            name: tenant.name,
            email: tenant.email,
            mobile: tenant.mobile,
            previousRoom: tenant.room,
            floor: tenant.floor,
            college: tenant.college,
            joinDate: tenant.joinDate,
            vacateDate,
            totalPaid,
            depositAmount: tenant.depositAmount,
          };

          // Update tenant status to inactive
          const updatedTenants = tenants.map(t => 
            t.id === tenantId ? { ...t, status: 'inactive' as const, vacateDate } : t
          );

          // Update room - remove tenant from room
          const updatedRooms = rooms.map(r => {
            if (r.number === tenant.room) {
              const nextTenantIds = r.tenantIds.filter(id => id !== tenantId);
              return {
                ...r,
                status: nextTenantIds.length > 0 ? 'occupied' as const : 'available' as const,
                tenantIds: nextTenantIds,
              };
            }
            return r;
          });

          set({
            tenants: updatedTenants,
            rooms: updatedRooms,
            pastTenants: [...pastTenants, newPastTenant],
          });
        } catch (error) {
          console.error('Failed to vacate tenant:', error);
        }
      },

      shiftTenant: async (tenantId, newRoomNumber) => {
        try {
          const { tenants, rooms } = get();
          const tenant = tenants.find(t => t.id === tenantId);
          if (!tenant || tenant.status === 'inactive') return;

          const newRoom = rooms.find(r => r.number === newRoomNumber);
          if (!newRoom) return;
          if (newRoom.tenantIds.length >= newRoom.capacity) return;

          await apiClient.shiftTenant(tenantId, newRoomNumber);

          const newFloor = parseInt(newRoomNumber.charAt(0));

          // Update tenant room
          const updatedTenants = tenants.map(t => 
            t.id === tenantId ? { ...t, room: newRoomNumber, floor: newFloor } : t
          );

          // Update rooms
          const updatedRooms = rooms.map(r => {
            if (r.number === tenant.room) {
              // Remove from old room
              const nextTenantIds = r.tenantIds.filter(id => id !== tenantId);
              return {
                ...r,
                status: nextTenantIds.length > 0 ? 'occupied' as const : 'available' as const,
                tenantIds: nextTenantIds,
              };
            }
            if (r.number === newRoomNumber) {
              // Add to new room
              const nextTenantIds = [...r.tenantIds, tenantId];
              return {
                ...r,
                status: 'occupied' as const,
                tenantIds: nextTenantIds,
              };
            }
            return r;
          });

          set({
            tenants: updatedTenants,
            rooms: updatedRooms,
          });
        } catch (error) {
          console.error('Failed to shift tenant:', error);
        }
      },

      markPayment: async (paymentId, method) => {
        try {
          await apiClient.markPaymentDone(paymentId);
          set((state) => {
            const updatedPayments = state.payments.map((p) =>
              p.id === paymentId
                ? { ...p, status: "paid" as const, paidDate: new Date().toISOString().split("T")[0], method }
                : p,
            );

            // Also update tenant rent status
            const payment = state.payments.find((p) => p.id === paymentId);
            const updatedTenants = payment
              ? state.tenants.map((t) => (t.id === payment.tenantId ? { ...t, rentStatus: "paid" as const } : t))
              : state.tenants;

            return {
              payments: updatedPayments,
              tenants: updatedTenants,
            };
          });
        } catch (error) {
          console.error('Failed to mark payment:', error);
        }
      },

      setRoomCapacity: async (roomNumber, capacity) => {
        try {
          const { rooms } = get();
          const room = rooms.find((r) => r.number === roomNumber);
          if (!room) return false;
          if (room.tenantIds.length > capacity) return false;

          await apiClient.updateRoom(room.number, { capacity });
          set((state) => ({
            rooms: state.rooms.map((r) => (r.number === roomNumber ? { ...r, capacity } : r)),
          }));
          return true;
        } catch (error) {
          console.error('Failed to set room capacity:', error);
          return false;
        }
      },

      // Data loading methods
      loadRooms: async (pgType: 'boys' | 'girls') => {
        try {
          const apiRooms = await apiClient.getRooms(pgType);
          const rooms: Room[] = apiRooms.map(r => ({
            number: r.room_number,
            floor: r.floor,
            status: r.occupants > 0 ? 'occupied' : 'available',
            capacity: r.capacity,
            tenantIds: [], // Will be populated by loadTenants
          }));
          set({ rooms });
        } catch (error) {
          console.error('Failed to load rooms:', error);
        }
      },

      loadTenants: async (pgType: 'boys' | 'girls') => {
        try {
          const apiTenants = await apiClient.getActiveTenants(pgType);
          const tenants: Tenant[] = apiTenants.map(t => ({
            id: t.id,
            name: t.name,
            email: t.email,
            mobile: t.phone,
            parentMobile: '',
            emergencyContact: '',
            room: `${t.id.substring(0, 3)}`, // Will be populated from API
            floor: 1, // Will be calculated
            college: t.college,
            department: '',
            status: 'active',
            presenceStatus: 'present',
            rentStatus: 'pending',
            rentAmount: t.rent,
            depositAmount: t.deposit,
            joinDate: t.join_date,
          }));
          set({ tenants });
        } catch (error) {
          console.error('Failed to load tenants:', error);
        }
      },

      loadJoiners: async (pgType: 'boys' | 'girls') => {
        try {
          const apiJoiners = await apiClient.getPendingJoiners(pgType);
          const joiners: Joiner[] = apiJoiners.map(j => ({
            id: j.id,
            fullName: j.name,
            email: j.email,
            mobile: j.phone,
            parentMobile: '',
            emergencyContact: '',
            gender: j.gender,
            college: j.college,
            department: '',
            year: '',
            idProofType: 'aadhaar',
            pgType: j.pg_type,
            roomType: j.room_type,
            joiningDate: j.join_date,
            applicationDate: new Date(j.created_at).toISOString().split("T")[0],
            status: j.status as 'pending' | 'approved' | 'rejected',
          }));
          set({ joiners });
        } catch (error) {
          console.error('Failed to load joiners:', error);
        }
      },

      loadPayments: async (pgType: 'boys' | 'girls') => {
        try {
          const apiPayments = await apiClient.getPaymentsByPG(pgType);
          const payments: Payment[] = apiPayments.map(p => ({
            id: p.id,
            tenantId: p.tenant_id,
            tenantName: '', // Will be populated from tenants
            room: '',
            amount: p.amount,
            month: p.month,
            status: p.status as 'paid' | 'pending',
            paidDate: p.paid_date,
            method: 'online',
          }));
          set({ payments });
        } catch (error) {
          console.error('Failed to load payments:', error);
        }
      },

      loadAllData: async (pgType: 'boys' | 'girls') => {
        try {
          const { loadRooms, loadTenants, loadJoiners, loadPayments } = get();
          await Promise.all([
            loadRooms(pgType),
            loadTenants(pgType),
            loadJoiners(pgType),
            loadPayments(pgType),
          ]);
        } catch (error) {
          console.error('Failed to load all data:', error);
        }
      },

      getStats: () => {
        const { rooms, tenants, joiners, payments } = get();
        
        const activeTenants = tenants.filter(t => t.status === 'active');
        const occupiedRooms = rooms.filter((r) => r.status === "occupied").length;
        const presentToday = activeTenants.filter((t) => t.presenceStatus === "present").length;
        const onLeaveToday = activeTenants.filter((t) => t.presenceStatus === "on_leave").length;

        const paidPayments = payments.filter((p) => p.status === "paid");
        const pendingPayments = payments.filter((p) => p.status === "pending");

        const totalCollected = paidPayments.reduce((sum, p) => sum + p.amount, 0);
        const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

        return {
          totalRooms: rooms.length,
          occupiedRooms,
          availableRooms: rooms.length - occupiedRooms,
          totalTenants: activeTenants.length,
          presentToday,
          onLeaveToday,
          totalCollected,
          pendingAmount,
          pendingApprovals: joiners.filter((j) => j.status === "pending").length,
        };
      },

      getActiveTenants: () => {
        return get().tenants.filter(t => t.status === 'active');
      },

      getPaymentsByTenant: (tenantId) => {
        return get().payments.filter(p => p.tenantId === tenantId);
      },
    }),
    {
      name: "pg_manager_store",
      version: 2,
      partialize: (state) => ({
        rooms: state.rooms,
        tenants: state.tenants,
        pastTenants: state.pastTenants,
        joiners: state.joiners,
        payments: state.payments,
      }),
    },
  ),
);
