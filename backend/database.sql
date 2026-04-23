-- PG-Pal Database Schema for Supabase PostgreSQL

-- ==================== ADMINS TABLE ====================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  pg_type VARCHAR(20) NOT NULL CHECK (pg_type IN ('boys', 'girls')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== JOINERS TABLE ====================
CREATE TABLE IF NOT EXISTS joiners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  gender VARCHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
  college VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  year INTEGER,
  aadhaar_url TEXT,
  college_id_url TEXT,
  pg_type VARCHAR(20) NOT NULL CHECK (pg_type IN ('boys', 'girls')),
  room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('2-sharing', '3-sharing')),
  join_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ROOMS TABLE ====================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_type VARCHAR(20) NOT NULL CHECK (pg_type IN ('boys', 'girls')),
  room_number VARCHAR(10) NOT NULL,
  floor INTEGER NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity IN (2, 3)),
  occupants INTEGER DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  tenant_ids UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pg_type, room_number)
);

-- ==================== TENANTS TABLE ====================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  joiner_id UUID NOT NULL REFERENCES joiners(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  gender VARCHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
  college VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  year INTEGER,
  aadhaar_url TEXT,
  college_id_url TEXT,
  pg_type VARCHAR(20) NOT NULL CHECK (pg_type IN ('boys', 'girls')),
  room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('2-sharing', '3-sharing')),
  rent DECIMAL(10, 2) NOT NULL,
  deposit DECIMAL(10, 2),
  join_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'present' CHECK (status IN ('active', 'on-leave', 'present')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== PAYMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  pg_type VARCHAR(20) NOT NULL CHECK (pg_type IN ('boys', 'girls')),
  amount DECIMAL(10, 2) NOT NULL,
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('online', 'cash', 'check')),
  transaction_id VARCHAR(255),
  receipt_url TEXT,
  due_date DATE NOT NULL,
  paid_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, month)
);

-- ==================== LEAVES TABLE ====================
CREATE TABLE IF NOT EXISTS leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  pg_type VARCHAR(20) NOT NULL CHECK (pg_type IN ('boys', 'girls')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== PAST TENANTS TABLE ====================
CREATE TABLE IF NOT EXISTS past_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  gender VARCHAR(1) CHECK (gender IN ('M', 'F')),
  college VARCHAR(255),
  pg_type VARCHAR(20) NOT NULL CHECK (pg_type IN ('boys', 'girls')),
  room_number VARCHAR(10),
  join_date DATE,
  vacate_date DATE NOT NULL,
  total_rent DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== INDEXES ====================
CREATE INDEX idx_joiners_pg_type_status ON joiners(pg_type, status);
CREATE INDEX idx_rooms_pg_type_status ON rooms(pg_type, status);
CREATE INDEX idx_tenants_pg_type ON tenants(pg_type);
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_pg_type ON payments(pg_type);
CREATE INDEX idx_leaves_tenant_id ON leaves(tenant_id);

-- ==================== HELPER VIEWS ====================

-- Active tenants view
CREATE OR REPLACE VIEW active_tenants_view AS
SELECT 
  t.*,
  r.room_number,
  r.floor,
  r.capacity,
  COUNT(*) OVER (PARTITION BY t.room_id) as roommates_count
FROM tenants t
LEFT JOIN rooms r ON t.room_id = r.id
WHERE t.status != 'vacated';

-- Payment statistics view
CREATE OR REPLACE VIEW payment_stats_view AS
SELECT 
  pg_type,
  COUNT(*) as total_payments,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_payments,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_collected,
  SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount
FROM payments
GROUP BY pg_type;

-- Occupancy view
CREATE OR REPLACE VIEW occupancy_view AS
SELECT 
  r.pg_type,
  COUNT(*) as total_rooms,
  COUNT(CASE WHEN r.status = 'occupied' THEN 1 END) as occupied_rooms,
  COUNT(CASE WHEN r.status = 'available' THEN 1 END) as available_rooms,
  ROUND(COUNT(CASE WHEN r.status = 'occupied' THEN 1 END)::numeric / COUNT(*) * 100, 2) as occupancy_percentage
FROM rooms r
GROUP BY r.pg_type;

-- ==================== TRIGGERS ====================

-- Update tenants updated_at timestamp
CREATE OR REPLACE FUNCTION update_tenants_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenants_update_timestamp
BEFORE UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION update_tenants_timestamp();

-- Similar triggers for other tables
CREATE OR REPLACE FUNCTION update_table_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rooms_update_timestamp BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_table_timestamp();
CREATE TRIGGER payments_update_timestamp BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_table_timestamp();
CREATE TRIGGER joiners_update_timestamp BEFORE UPDATE ON joiners FOR EACH ROW EXECUTE FUNCTION update_table_timestamp();
CREATE TRIGGER leaves_update_timestamp BEFORE UPDATE ON leaves FOR EACH ROW EXECUTE FUNCTION update_table_timestamp();
