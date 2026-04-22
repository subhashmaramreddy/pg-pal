import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function seedRooms() {
  try {
    console.log('🔄 Seeding rooms (RLS now disabled)...');
    
    // Delete existing rooms for clean slate
    const { error: deleteError } = await supabase
      .from('rooms')
      .delete()
      .eq('pg_type', 'boys');

    if (deleteError) console.log('ℹ️  Delete note:', deleteError.message);

    // Insert boys rooms
    const boysRooms = [
      { pg_type: 'boys', room_number: '101', floor: 1, capacity: 2, occupants: 0, status: 'available' },
      { pg_type: 'boys', room_number: '102', floor: 1, capacity: 2, occupants: 0, status: 'available' },
      { pg_type: 'boys', room_number: '201', floor: 2, capacity: 3, occupants: 0, status: 'available' },
    ];

    const { error: insertError } = await supabase
      .from('rooms')
      .insert(boysRooms);

    if (insertError) {
      throw insertError;
    }

    // Verify
    const { data: rooms, error: verifyError } = await supabase
      .from('rooms')
      .select('*')
      .eq('pg_type', 'boys');

    if (verifyError) throw verifyError;

    console.log('✅ Rooms created successfully');
    console.log(`   Created ${rooms?.length || 0} rooms:`);
    rooms?.forEach((r: any) => {
      console.log(`   - Room ${r.room_number} (Floor ${r.floor}, Capacity: ${r.capacity})`);
    });
  } catch (error) {
    console.error('❌ Error seeding rooms:', error);
    process.exit(1);
  }
}

seedRooms();
