-- Quick seed script for testing (RLS disabled)
-- Run in Supabase SQL Editor

-- Create sample rooms for Boys PG
INSERT INTO public.rooms (pg_type, room_number, floor, capacity, occupants, rent, deposit, status, created_at, updated_at) 
VALUES 
  ('boys', '101', 1, 2, 0, 5000, 10000, 'available', NOW(), NOW()),
  ('boys', '102', 1, 2, 0, 5000, 10000, 'available', NOW(), NOW()),
  ('boys', '103', 1, 3, 0, 7500, 15000, 'available', NOW(), NOW()),
  ('boys', '201', 2, 2, 0, 5000, 10000, 'available', NOW(), NOW()),
  ('boys', '202', 2, 3, 0, 7500, 15000, 'available', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create sample rooms for Girls PG
INSERT INTO public.rooms (pg_type, room_number, floor, capacity, occupants, rent, deposit, status, created_at, updated_at) 
VALUES 
  ('girls', '101', 1, 2, 0, 5500, 11000, 'available', NOW(), NOW()),
  ('girls', '102', 1, 2, 0, 5500, 11000, 'available', NOW(), NOW()),
  ('girls', '201', 2, 3, 0, 8000, 16000, 'available', NOW(), NOW())
ON CONFLICT DO NOTHING;

SELECT 'Rooms created successfully!' as status,
       (SELECT COUNT(*) FROM public.rooms WHERE pg_type = 'boys') as boys_rooms,
       (SELECT COUNT(*) FROM public.rooms WHERE pg_type = 'girls') as girls_rooms;
