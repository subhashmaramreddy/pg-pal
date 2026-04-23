import { pool } from "../utils/db.js";
import { hashPassword, comparePasswords } from '../utils/password.js';
import { JoinerApplication, Tenant, Payment, Room, DashboardStats, PastTenant, Leave } from '../types/index.js';
import { ApiResponse, PaginatedResponse } from '../types/index.js';

// ==================== MAPPERS ====================

function mapTenant(row: any): Tenant {
  if (!row) throw new Error("Cannot map null row to Tenant");
  if (!row.pg_type) throw new Error("Invalid DB row: pg_type missing");

  return {
    id: row.id,
    joinerId: row.joiner_id,
    roomId: row.room_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    gender: row.gender,
    college: row.college,
    department: row.department,
    year: row.year,
    aadhaarUrl: row.aadhaar_url,
    collegeIdUrl: row.college_id_url,
    pgType: row.pg_type,
    roomType: row.room_type,
    rent: row.rent,
    deposit: row.deposit,
    joinDate: row.join_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapJoiner(row: any): JoinerApplication {
  if (!row) throw new Error("Cannot map null row to JoinerApplication");
  if (!row.pg_type) throw new Error("Invalid DB row: pg_type missing");

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    gender: row.gender,
    college: row.college,
    department: row.department,
    year: row.year,
    aadhaarUrl: row.aadhaar_url,
    collegeIdUrl: row.college_id_url,
    pgType: row.pg_type,
    roomType: row.room_type,
    joinDate: row.join_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapRoom(row: any): Room {
  if (!row) throw new Error("Cannot map null row to Room");
  
  return {
    id: row.id,
    pgType: row.pg_type,
    roomNumber: row.room_number,
    floor: row.floor,
    capacity: row.capacity,
    occupants: row.occupants,
    status: row.status,
    tenantIds: [], // Explicitly setting this, as DB might not store it directly on the row
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPayment(row: any): Payment {
  if (!row) throw new Error("Cannot map null row to Payment");
  
  return {
    id: row.id,
    tenantId: row.tenant_id,
    pgType: row.pg_type,
    amount: row.amount,
    month: row.month,
    status: row.status,
    paymentMethod: row.payment_method,
    transactionId: row.transaction_id,
    dueDate: row.due_date || new Date().toISOString(), // Fallback if missing in DB
    paidDate: row.paid_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapLeave(row: any): Leave {
  if (!row) throw new Error("Cannot map null row to Leave");
  
  return {
    id: row.id,
    tenantId: row.tenant_id,
    pgType: row.pg_type,
    startDate: row.start_date,
    endDate: row.end_date,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// ==================== ADMIN OPERATIONS ====================

export async function createAdmin(
  email: string,
  password: string,
  pgType: 'boys' | 'girls'
): Promise<ApiResponse<{ id: string; email: string }>> {
  try {
    const hashedPassword = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO admins (email, password, pg_type)
       VALUES ($1, $2, $3)
       RETURNING id, email`,
      [email, hashedPassword, pgType]
    );

    const data = result.rows[0];
    return { success: true, data: { id: data.id, email: data.email } };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getAdminByEmail(email: string) {
  try {
    const result = await pool.query('SELECT * FROM admins WHERE email = $1 LIMIT 1', [email]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch (error) {
    return null;
  }
}

export async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  const admin = await getAdminByEmail(email);
  if (!admin) return false;
  return comparePasswords(password, admin.password);
}

// ==================== JOINER OPERATIONS ====================

export async function submitJoinerApplication(
  joiner: Omit<JoinerApplication, 'id' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<JoinerApplication>> {
  try {
    // Convert camelCase to snake_case for database
    const dbJoiner = {
      name: joiner.name,
      email: joiner.email,
      phone: joiner.phone,
      gender: joiner.gender,
      college: joiner.college,
      department: joiner.department,
      year: joiner.year,
      aadhaar_url: joiner.aadhaarUrl,
      college_id_url: joiner.collegeIdUrl,
      pg_type: joiner.pgType,
      room_type: joiner.roomType, // Keep as is (2-sharing or 3-sharing)
      join_date: joiner.joinDate,
      status: 'pending'
    };

    const keys = Object.keys(dbJoiner);
    const values = Object.values(dbJoiner);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const result = await pool.query(
      `INSERT INTO joiners (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    return { success: true, data: mapJoiner(result.rows[0]) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getPendingJoiners(pgType: 'boys' | 'girls'): Promise<JoinerApplication[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM joiners WHERE pg_type = $1 AND status = $2 ORDER BY created_at DESC',
      [pgType, 'pending']
    );
    return result.rows.map(mapJoiner);
  } catch (error) {
    console.error('Error fetching pending joiners:', error);
    return [];
  }
}

export async function approveJoiner(
  joinerId: string,
  roomId: string,
  rent: number,
  deposit: number
): Promise<ApiResponse<Tenant>> {
  try {
    // Get joiner details
    const joinerResult = await pool.query('SELECT * FROM joiners WHERE id = $1 LIMIT 1', [joinerId]);
    if (joinerResult.rows.length === 0) throw new Error('Joiner not found');
    const joiner = joinerResult.rows[0];

    // Hash default password: Welcome@123
    const defaultPassword = 'Welcome@123';
    const hashedPassword = await hashPassword(defaultPassword);

    // Convert joiner to tenant with snake_case field names
    const tenantData = {
      joiner_id: joinerId,
      room_id: roomId,
      name: joiner.name,
      email: joiner.email,
      phone: joiner.phone,
      gender: joiner.gender,
      college: joiner.college,
      department: joiner.department,
      year: joiner.year,
      aadhaar_url: joiner.aadhaar_url,
      college_id_url: joiner.college_id_url,
      pg_type: joiner.pg_type,
      room_type: joiner.room_type,
      rent,
      deposit,
      join_date: joiner.join_date,
      status: 'active',
      password: hashedPassword  // Add hashed default password
    };

    const keys = Object.keys(tenantData);
    const values = Object.values(tenantData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    // Create tenant record with default password
    const tenantResult = await pool.query(
      `INSERT INTO tenants (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    const tenant = tenantResult.rows[0];

    // Update joiner status
    await pool.query('UPDATE joiners SET status = $1 WHERE id = $2', ['approved', joinerId]);

    // Update room occupancy
    await updateRoomOccupancy(roomId);

    return { success: true, data: mapTenant(tenant) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function rejectJoiner(joinerId: string): Promise<ApiResponse<null>> {
  try {
    await pool.query('UPDATE joiners SET status = $1 WHERE id = $2', ['rejected', joinerId]);
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==================== TENANT OPERATIONS ====================

export async function getActiveTenants(pgType: 'boys' | 'girls'): Promise<Tenant[]> {
  try {
    // using created_at based on typical snake_case schema (was createdAt)
    const result = await pool.query(
      'SELECT * FROM tenants WHERE pg_type = $1 ORDER BY created_at DESC',
      [pgType]
    );
    return result.rows.map(mapTenant);
  } catch (error) {
    console.error('Error fetching active tenants:', error);
    return [];
  }
}

export async function getTenantById(tenantId: string): Promise<Tenant | null> {
  try {
    const result = await pool.query('SELECT * FROM tenants WHERE id = $1 LIMIT 1', [tenantId]);
    if (result.rows.length === 0) return null;
    return mapTenant(result.rows[0]);
  } catch (error) {
    return null;
  }
}

export async function searchTenants(
  pgType: 'boys' | 'girls',
  query: string
): Promise<Tenant[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM tenants WHERE pg_type = $1 AND (name ILIKE $2 OR email ILIKE $2 OR phone ILIKE $2)',
      [pgType, `%${query}%`]
    );
    return result.rows.map(mapTenant);
  } catch (error) {
    console.error('Error searching tenants:', error);
    return [];
  }
}

export async function updateTenantPresence(
  tenantId: string,
  status: 'present' | 'on-leave'
): Promise<ApiResponse<Tenant>> {
  try {
    const result = await pool.query(
      'UPDATE tenants SET status = $1 WHERE id = $2 RETURNING *',
      [status, tenantId]
    );
    if (result.rows.length === 0) throw new Error('Tenant not found');
    return { success: true, data: mapTenant(result.rows[0]) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function vacateTenant(tenantId: string): Promise<ApiResponse<null>> {
  try {
    const tenant = await getTenantById(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    // Move to past tenants (using column names that attempt to match the original camelCase object usage)
    // Note: To be safe with snake_case vs camelCase mismatch in the original code, we'll quote them.
    await pool.query(
      `INSERT INTO past_tenants (
        "tenantId", name, email, phone, gender, college, "pgType", "roomNumber", "joinDate", "vacateDate", "totalRent"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        tenantId, 
        tenant.name, 
        tenant.email, 
        tenant.phone, 
        tenant.gender, 
        tenant.college, 
        tenant.pgType, 
        tenant.roomId, 
        tenant.joinDate, 
        new Date().toISOString(), 
        tenant.rent
      ]
    );

    // Delete from tenants
    await pool.query('DELETE FROM tenants WHERE id = $1', [tenantId]);

    // Update room occupancy
    await updateRoomOccupancy(tenant.roomId);

    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function shiftTenant(tenantId: string, newRoomId: string): Promise<ApiResponse<Tenant>> {
  try {
    const tenant = await getTenantById(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    // Update tenant room
    const result = await pool.query(
      // using room_id or roomId according to column name, sticking to room_id based on snake_case
      'UPDATE tenants SET room_id = $1 WHERE id = $2 RETURNING *',
      [newRoomId, tenantId]
    );
    if (result.rows.length === 0) throw new Error('Failed to update tenant');
    const updatedTenant = result.rows[0];

    // Update old room occupancy
    await updateRoomOccupancy(tenant.roomId);
    // Update new room occupancy
    await updateRoomOccupancy(newRoomId);

    return { success: true, data: mapTenant(updatedTenant) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==================== ROOM OPERATIONS ====================

export async function getRooms(pgType: 'boys' | 'girls'): Promise<Room[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM rooms WHERE pg_type = $1 ORDER BY floor ASC, room_number ASC',
      [pgType]
    );
    return result.rows.map(mapRoom);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
}

export async function getRoomById(roomId: string): Promise<Room | null> {
  try {
    const result = await pool.query('SELECT * FROM rooms WHERE id = $1 LIMIT 1', [roomId]);
    if (result.rows.length === 0) return null;
    return mapRoom(result.rows[0]);
  } catch (error) {
    return null;
  }
}

export async function updateRoomCapacity(roomId: string, capacity: number): Promise<ApiResponse<Room>> {
  try {
    const result = await pool.query(
      'UPDATE rooms SET capacity = $1 WHERE id = $2 RETURNING *',
      [capacity, roomId]
    );
    if (result.rows.length === 0) throw new Error('Room not found');
    return { success: true, data: mapRoom(result.rows[0]) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function seedRooms(): Promise<ApiResponse<void>> {
  try {
    const boysRooms = [
      { pg_type: 'boys', room_number: '101', floor: 1, capacity: 2, occupants: 0, status: 'available' },
      { pg_type: 'boys', room_number: '102', floor: 1, capacity: 2, occupants: 0, status: 'available' },
      { pg_type: 'boys', room_number: '103', floor: 1, capacity: 3, occupants: 0, status: 'available' },
      { pg_type: 'boys', room_number: '201', floor: 2, capacity: 2, occupants: 0, status: 'available' },
      { pg_type: 'boys', room_number: '202', floor: 2, capacity: 3, occupants: 0, status: 'available' },
    ];

    const girlsRooms = [
      { pg_type: 'girls', room_number: '101', floor: 1, capacity: 2, occupants: 0, status: 'available' },
      { pg_type: 'girls', room_number: '102', floor: 1, capacity: 2, occupants: 0, status: 'available' },
      { pg_type: 'girls', room_number: '201', floor: 2, capacity: 3, occupants: 0, status: 'available' },
    ];

    const allRooms = [...boysRooms, ...girlsRooms];

    for (const room of allRooms) {
      await pool.query(
        `INSERT INTO rooms (pg_type, room_number, floor, capacity, occupants, status) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (pg_type, room_number) DO NOTHING`,
        [room.pg_type, room.room_number, room.floor, room.capacity, room.occupants, room.status]
      );
    }

    return { success: true, data: undefined };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function updateRoomOccupancy(roomId: string): Promise<void> {
  try {
    // using room_id or roomId
    const result = await pool.query(
      'SELECT id FROM tenants WHERE room_id = $1 OR "roomId" = $1',
      [roomId]
    );

    const occupants = result.rows.length;
    const status = occupants === 0 ? 'available' : 'occupied';

    await pool.query(
      'UPDATE rooms SET occupants = $1, status = $2 WHERE id = $3',
      [occupants, status, roomId]
    );
  } catch (error) {
    console.error('Error updating room occupancy:', error);
  }
}

// ==================== PAYMENT OPERATIONS ====================

export async function createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Payment>> {
  try {
    const keys = Object.keys(payment);
    const values = Object.values(payment);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    // Escape keys to handle camelCase safely
    const result = await pool.query(
      `INSERT INTO payments (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    return { success: true, data: mapPayment(result.rows[0]) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getPaymentsByTenant(tenantId: string): Promise<Payment[]> {
  try {
    // Using ILIKE check or just checking if month column exists since old code ordered by 'month'
    // Also tenantId vs tenant_id
    const result = await pool.query(
      'SELECT * FROM payments WHERE "tenantId" = $1 OR tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    return result.rows.map(mapPayment);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
}

export async function getPaymentsByPG(pgType: 'boys' | 'girls'): Promise<Payment[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE pg_type = $1 ORDER BY created_at DESC',
      [pgType]
    );
    return result.rows.map(mapPayment);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
}

export async function markPaymentAsPaid(paymentId: string, paymentMethod: string, transactionId?: string): Promise<ApiResponse<Payment>> {
  try {
    // Attempting to use old camelCase column names as fallback, but typically they are snake_case in Postgres
    const result = await pool.query(
      `UPDATE payments 
       SET status = 'paid', 
           "paymentMethod" = $1, 
           payment_method = $1,
           "transactionId" = $2, 
           transaction_id = $2,
           "paidDate" = $3,
           paid_date = $3
       WHERE id = $4 
       RETURNING *`,
      [paymentMethod, transactionId || null, new Date().toISOString(), paymentId]
    ).catch(async (e) => {
      // If it fails due to column not existing, try a cleaner query with snake_case only
      return await pool.query(
        `UPDATE payments 
         SET status = 'paid', 
             payment_method = $1,
             transaction_id = $2,
             paid_date = $3
         WHERE id = $4 
         RETURNING *`,
        [paymentMethod, transactionId || null, new Date().toISOString(), paymentId]
      );
    });

    if (result.rows.length === 0) throw new Error('Payment not found');
    return { success: true, data: mapPayment(result.rows[0]) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==================== LEAVE OPERATIONS ====================

export async function requestLeave(leave: Omit<Leave, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Leave>> {
  try {
    const dbLeave = { ...leave, status: 'requested' };
    const keys = Object.keys(dbLeave);
    const values = Object.values(dbLeave);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const result = await pool.query(
      `INSERT INTO leaves (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    return { success: true, data: mapLeave(result.rows[0]) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getLeavesByTenant(tenantId: string): Promise<Leave[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM leaves WHERE "tenantId" = $1 OR tenant_id = $1 ORDER BY created_at DESC',
      [tenantId]
    );
    return result.rows.map(mapLeave);
  } catch (error) {
    console.error('Error fetching leaves:', error);
    return [];
  }
}

export async function approveLeave(leaveId: string): Promise<ApiResponse<Leave>> {
  try {
    const result = await pool.query(
      'UPDATE leaves SET status = $1 WHERE id = $2 RETURNING *',
      ['approved', leaveId]
    );
    if (result.rows.length === 0) throw new Error('Leave not found');
    return { success: true, data: mapLeave(result.rows[0]) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==================== DASHBOARD STATISTICS ====================

export async function getDashboardStats(pgType: 'boys' | 'girls'): Promise<DashboardStats> {
  try {
    const [roomsResult, tenantsResult, paymentsResult] = await Promise.all([
      pool.query('SELECT * FROM rooms WHERE pg_type = $1', [pgType]),
      pool.query('SELECT * FROM tenants WHERE pg_type = $1', [pgType]),
      pool.query('SELECT * FROM payments WHERE pg_type = $1', [pgType])
    ]);

    const rooms = roomsResult.rows;
    const tenants = tenantsResult.rows;
    const payments = paymentsResult.rows;

    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const totalRooms = rooms.length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const activeTenants = tenants.length;
    const tenantsPresent = tenants.filter(t => t.status === 'present').length;
    const tenantsOnLeave = tenants.filter(t => t.status === 'on-leave').length;

    // Get pending approvals
    const pendingJoinersResult = await pool.query(
      'SELECT COUNT(*) as count FROM joiners WHERE pg_type = $1 AND status = $2',
      [pgType, 'pending']
    );
    const pendingApprovals = parseInt(pendingJoinersResult.rows[0]?.count || '0', 10);

    // Calculate payment stats
    const totalCollected = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingAmount = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalRooms,
      occupiedRooms,
      occupancyRate,
      activeTenants,
      pendingApprovals,
      tenantsPresent,
      tenantsOnLeave,
      totalCollected,
      pendingAmount
    };
  } catch (error) {
    console.error('Error calculating dashboard stats:', error);
    return {
      totalRooms: 0,
      occupiedRooms: 0,
      occupancyRate: 0,
      activeTenants: 0,
      pendingApprovals: 0,
      tenantsPresent: 0,
      tenantsOnLeave: 0,
      totalCollected: 0,
      pendingAmount: 0
    };
  }
}
