import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function seedRoomsRaw() {
  try {
    console.log('Creating rooms via raw SQL...');
    
    // Try raw SQL approach
    const { data, error } = await supabase.rpc('create_rooms_bypass_rls');
    
    if (error) {
      console.log('RPC failed, trying direct insert...');
      throw error;
    }
    
    console.log('✓ Rooms created via RPC');
  } catch (err) {
    console.error('Error:', err);
    
    // Fallback: Show user how to create manually
    console.log(`\n⚠️  RLS STILL BLOCKING INSERTS`);
    console.log(`\nTo fix, run this in your Supabase SQL Editor:`);
    console.log(`
-- Disable RLS on rooms table
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;

-- Then create rooms:
DELETE FROM public.rooms WHERE pg_type = 'boys';
INSERT INTO public.rooms (pg_type, room_number, floor, capacity, occupants, status) VALUES
('boys', '101', 1, 2, 0, 'available'),
('boys', '102', 1, 2, 0, 'available'),
('boys', '201', 2, 3, 0, 'available');

-- Verify:
SELECT * FROM public.rooms WHERE pg_type = 'boys';
    `);
  }
}

seedRoomsRaw();
