-- Seed script for PG-Pal test data
-- Run this in Supabase SQL editor to bypass RLS policies

-- Insert test admin account
-- Email: guesthubpg@gmail.com, Password: Guesthub117
INSERT INTO admins (email, password, pg_type) 
VALUES ('guesthubpg@gmail.com', '$2a$10$abc123', 'boys')
ON CONFLICT(email) DO NOTHING;

-- Insert sample rooms for Boys PG
INSERT INTO rooms (pg_type, room_number, floor, capacity, occupants, rent, deposit, status)
VALUES 
  ('boys', '101', 1, 2, 0, 5000, 10000, 'available'),
  ('boys', '102', 1, 2, 0, 5000, 10000, 'available'),
  ('boys', '103', 1, 3, 0, 7500, 15000, 'available'),
  ('boys', '201', 2, 2, 0, 5000, 10000, 'available'),
  ('boys', '202', 2, 3, 0, 7500, 15000, 'available')
ON CONFLICT DO NOTHING;

-- Insert sample rooms for Girls PG
INSERT INTO rooms (pg_type, room_number, floor, capacity, occupants, rent, deposit, status)
VALUES 
  ('girls', '101', 1, 2, 0, 5500, 11000, 'available'),
  ('girls', '102', 1, 2, 0, 5500, 11000, 'available'),
  ('girls', '201', 2, 3, 0, 8000, 16000, 'available')
ON CONFLICT DO NOTHING;

SELECT 'Seed data created successfully' as message;
