import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface GirlsJoiner {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  parentMobile: string;
  emergencyContact: string;
  gender: 'female';
  college: string;
  department: string;
  year: string;
  idProofType: 'aadhaar' | 'college_id';
  aadhaarFile?: string;
  collegeIdFile?: string;
  pgType: 'girls';
  roomType: '2_sharing' | '3_sharing';
  joiningDate: string;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface GirlsTenant {
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

export interface GirlsPastTenant {
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

export interface GirlsRoom {
  number: string;
  floor: number;
  status: 'occupied' | 'available';
  capacity: number;
  tenantIds: string[];
}

export interface GirlsPayment {
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

interface GirlsPGStore {
  rooms: GirlsRoom[];
  tenants: GirlsTenant[];
  pastTenants: GirlsPastTenant[];
  joiners: GirlsJoiner[];
  payments: GirlsPayment[];
  
  addJoiner: (joiner: Omit<GirlsJoiner, 'id' | 'applicationDate' | 'status'>) => void;
  approveJoiner: (joinerId: string, roomNumber: string, rentAmount: number, depositAmount: number) => void;
  rejectJoiner: (joinerId: string) => void;
  updateTenantPresence: (tenantId: string, presenceStatus: 'present' | 'on_leave') => void;
  vacateTenant: (tenantId: string) => void;
  shiftTenant: (tenantId: string, newRoomNumber: string) => void;
  markPayment: (paymentId: string, method: 'cash' | 'online') => void;
  setRoomCapacity: (roomNumber: string, capacity: 2 | 3) => boolean;
  
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
  getActiveTenants: () => GirlsTenant[];
  getPaymentsByTenant: (tenantId: string) => GirlsPayment[];
}

// Generate initial rooms for Girls PG
const generateGirlsRooms = (): GirlsRoom[] => {
  const rooms: GirlsRoom[] = [];
  
  // Floors 1-5: Rooms x01 to x06
  for (let floor = 1; floor <= 5; floor++) {
    for (let room = 1; room <= 6; room++) {
      const roomNumber = `${floor}0${room}`;
      rooms.push({
        number: roomNumber,
        floor,
        status: 'available',
        capacity: 3,
        tenantIds: [],
      });
    }
  }
  
  // Floor 6: Rooms 601-602 only
  for (let room = 1; room <= 2; room++) {
    const roomNumber = `60${room}`;
    rooms.push({
      number: roomNumber,
      floor: 6,
      status: 'available',
      capacity: 3,
      tenantIds: [],
    });
  }
  
  return rooms;
};

// Initial mock tenants
const initialGirlsTenants: GirlsTenant[] = [
  { id: 'g1', name: 'Priya Singh', email: 'priya@email.com', mobile: '9876543301', parentMobile: '9876543300', emergencyContact: '9876543302', room: '101', floor: 1, college: 'ABC Engineering', department: 'Computer Science', status: 'active', presenceStatus: 'present', rentStatus: 'paid', rentAmount: 8000, depositAmount: 16000, joinDate: '2024-08-15' },
  { id: 'g2', name: 'Sneha Gupta', email: 'sneha.g@email.com', mobile: '9876543302', parentMobile: '9876543303', emergencyContact: '9876543304', room: '101', floor: 1, college: 'XYZ College', department: 'Electronics', status: 'active', presenceStatus: 'present', rentStatus: 'paid', rentAmount: 8000, depositAmount: 16000, joinDate: '2024-09-01' },
  { id: 'g3', name: 'Anita Rao', email: 'anita@email.com', mobile: '9876543303', parentMobile: '9876543305', emergencyContact: '9876543306', room: '102', floor: 1, college: 'ABC Engineering', department: 'Mechanical', status: 'active', presenceStatus: 'on_leave', rentStatus: 'pending', rentAmount: 8000, depositAmount: 16000, joinDate: '2024-07-20' },
  { id: 'g4', name: 'Kavya Sharma', email: 'kavya@email.com', mobile: '9876543304', parentMobile: '9876543307', emergencyContact: '9876543308', room: '102', floor: 1, college: 'DEF University', department: 'Civil', status: 'active', presenceStatus: 'present', rentStatus: 'paid', rentAmount: 8000, depositAmount: 16000, joinDate: '2024-10-05' },
  { id: 'g5', name: 'Meera Patel', email: 'meera@email.com', mobile: '9876543305', parentMobile: '9876543309', emergencyContact: '9876543310', room: '201', floor: 2, college: 'XYZ College', department: 'Computer Science', status: 'active', presenceStatus: 'present', rentStatus: 'paid', rentAmount: 8000, depositAmount: 16000, joinDate: '2024-06-10' },
  { id: 'g6', name: 'Riya Menon', email: 'riya@email.com', mobile: '9876543306', parentMobile: '9876543311', emergencyContact: '9876543312', room: '201', floor: 2, college: 'ABC Engineering', department: 'Electronics', status: 'active', presenceStatus: 'on_leave', rentStatus: 'paid', rentAmount: 8000, depositAmount: 16000, joinDate: '2024-11-01' },
];

// Initial past tenants
const initialGirlsPastTenants: GirlsPastTenant[] = [
  { id: 'gpt1', name: 'Neha Sharma', email: 'neha@email.com', mobile: '9876543320', previousRoom: '301', floor: 3, college: 'ABC Engineering', joinDate: '2023-06-15', vacateDate: '2024-05-30', totalPaid: 96000, depositAmount: 16000 },
];

// Initial joiners
const initialGirlsJoiners: GirlsJoiner[] = [
  { id: 'gj1', fullName: 'Deepika Verma', email: 'deepika@email.com', mobile: '9876543307', parentMobile: '9876543313', emergencyContact: '9876543314', gender: 'female', college: 'ABC Engineering', department: 'Computer Science', year: '2', idProofType: 'aadhaar', pgType: 'girls', roomType: '3_sharing', joiningDate: '2025-02-01', applicationDate: '2025-01-28', status: 'pending' },
  { id: 'gj2', fullName: 'Shruti Nair', email: 'shruti@email.com', mobile: '9876543308', parentMobile: '9876543315', emergencyContact: '9876543316', gender: 'female', college: 'XYZ College', department: 'Electronics', year: '3', idProofType: 'college_id', pgType: 'girls', roomType: '2_sharing', joiningDate: '2025-02-05', applicationDate: '2025-01-27', status: 'pending' },
];

// Generate payments
const generateGirlsPayments = (tenants: GirlsTenant[]): GirlsPayment[] => {
  return tenants.filter(t => t.status === 'active').map((tenant, index) => ({
    id: `gp${index + 1}`,
    tenantId: tenant.id,
    tenantName: tenant.name,
    room: tenant.room,
    amount: tenant.rentAmount,
    month: 'January 2025',
    status: tenant.rentStatus,
    paidDate: tenant.rentStatus === 'paid' ? '2025-01-05' : undefined,
    method: tenant.rentStatus === 'paid' ? 'online' : undefined,
  }));
};

// Update rooms based on tenants
const updateRoomsWithTenants = (rooms: GirlsRoom[], tenants: GirlsTenant[]): GirlsRoom[] => {
  return rooms.map(room => {
    const roomTenants = tenants.filter(t => t.room === room.number && t.status === 'active');
    return {
      ...room,
      status: roomTenants.length > 0 ? 'occupied' : 'available',
      tenantIds: roomTenants.map(t => t.id),
    };
  });
};

const initialRooms = updateRoomsWithTenants(generateGirlsRooms(), initialGirlsTenants);

export const useGirlsPGStore = create<GirlsPGStore>()(
  persist(
    (set, get) => ({
      rooms: initialRooms,
      tenants: initialGirlsTenants,
      pastTenants: initialGirlsPastTenants,
      joiners: initialGirlsJoiners,
      payments: generateGirlsPayments(initialGirlsTenants),

      addJoiner: (joinerData) => {
        const newJoiner: GirlsJoiner = {
          ...joinerData,
          id: `gj${Date.now()}`,
          applicationDate: new Date().toISOString().split("T")[0],
          status: "pending",
        };
        set((state) => ({
          joiners: [...state.joiners, newJoiner],
        }));
      },

      approveJoiner: (joinerId, roomNumber, rentAmount, depositAmount) => {
        const { joiners, tenants, rooms, payments } = get();
        const joiner = joiners.find((j) => j.id === joinerId);
        if (!joiner) return;

        const room = rooms.find((r) => r.number === roomNumber);
        if (!room) return;
        if (room.tenantIds.length >= room.capacity) return;

        const floor = parseInt(roomNumber.charAt(0));

        const newTenant: GirlsTenant = {
          id: `gt${Date.now()}`,
          name: joiner.fullName,
          email: joiner.email,
          mobile: joiner.mobile,
          parentMobile: joiner.parentMobile,
          emergencyContact: joiner.emergencyContact,
          room: roomNumber,
          floor,
          college: joiner.college,
          department: joiner.department,
          status: "active",
          presenceStatus: "present",
          rentStatus: "pending",
          rentAmount,
          depositAmount,
          joinDate: joiner.joiningDate,
          aadhaarFile: joiner.aadhaarFile,
          collegeIdFile: joiner.collegeIdFile,
        };

        const newPayment: GirlsPayment = {
          id: `gp${Date.now()}`,
          tenantId: newTenant.id,
          tenantName: newTenant.name,
          room: roomNumber,
          amount: rentAmount,
          month: "February 2025",
          status: "pending",
        };

        const updatedRooms = rooms.map((r) => {
          if (r.number === roomNumber) {
            const nextTenantIds = [...r.tenantIds, newTenant.id];
            return {
              ...r,
              status: "occupied" as const,
              tenantIds: nextTenantIds,
            };
          }
          return r;
        });

        const updatedJoiners = joiners.map((j) => (j.id === joinerId ? { ...j, status: "approved" as const } : j));

        set({
          tenants: [...tenants, newTenant],
          rooms: updatedRooms,
          joiners: updatedJoiners,
          payments: [...payments, newPayment],
        });
      },

      rejectJoiner: (joinerId) => {
        set((state) => ({
          joiners: state.joiners.map((j) => (j.id === joinerId ? { ...j, status: "rejected" as const } : j)),
        }));
      },

      updateTenantPresence: (tenantId, presenceStatus) => {
        set((state) => ({
          tenants: state.tenants.map((t) => (t.id === tenantId ? { ...t, presenceStatus } : t)),
        }));
      },

      vacateTenant: (tenantId) => {
        const { tenants, rooms, payments, pastTenants } = get();
        const tenant = tenants.find(t => t.id === tenantId);
        if (!tenant || tenant.status === 'inactive') return;

        const vacateDate = new Date().toISOString().split("T")[0];
        
        const tenantPayments = payments.filter(p => p.tenantId === tenantId && p.status === 'paid');
        const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0);

        const newPastTenant: GirlsPastTenant = {
          id: `gpt${Date.now()}`,
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

        const updatedTenants = tenants.map(t => 
          t.id === tenantId ? { ...t, status: 'inactive' as const, vacateDate } : t
        );

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
      },

      shiftTenant: (tenantId, newRoomNumber) => {
        const { tenants, rooms } = get();
        const tenant = tenants.find(t => t.id === tenantId);
        if (!tenant || tenant.status === 'inactive') return;

        const newRoom = rooms.find(r => r.number === newRoomNumber);
        if (!newRoom) return;
        if (newRoom.tenantIds.length >= newRoom.capacity) return;

        const newFloor = parseInt(newRoomNumber.charAt(0));

        const updatedTenants = tenants.map(t => 
          t.id === tenantId ? { ...t, room: newRoomNumber, floor: newFloor } : t
        );

        const updatedRooms = rooms.map(r => {
          if (r.number === tenant.room) {
            const nextTenantIds = r.tenantIds.filter(id => id !== tenantId);
            return {
              ...r,
              status: nextTenantIds.length > 0 ? 'occupied' as const : 'available' as const,
              tenantIds: nextTenantIds,
            };
          }
          if (r.number === newRoomNumber) {
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
      },

      markPayment: (paymentId, method) => {
        set((state) => {
          const updatedPayments = state.payments.map((p) =>
            p.id === paymentId
              ? { ...p, status: "paid" as const, paidDate: new Date().toISOString().split("T")[0], method }
              : p,
          );

          const payment = state.payments.find((p) => p.id === paymentId);
          const updatedTenants = payment
            ? state.tenants.map((t) => (t.id === payment.tenantId ? { ...t, rentStatus: "paid" as const } : t))
            : state.tenants;

          return {
            payments: updatedPayments,
            tenants: updatedTenants,
          };
        });
      },

      setRoomCapacity: (roomNumber, capacity) => {
        const { rooms } = get();
        const room = rooms.find((r) => r.number === roomNumber);
        if (!room) return false;
        if (room.tenantIds.length > capacity) return false;

        set((state) => ({
          rooms: state.rooms.map((r) => (r.number === roomNumber ? { ...r, capacity } : r)),
        }));
        return true;
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
      name: "girls_pg_manager_store",
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
