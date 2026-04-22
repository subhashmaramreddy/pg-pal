import dotenv from 'dotenv';
dotenv.config();

import { supabase } from './src/utils/supabase.js';

async function seedRooms() {
  try {
    console.log('Seeding rooms for boys PG...');
    
    const boysRooms = [
      { pg_type: 'boys', room_number: '101', floor: 1, capacity: 2, occupants: 0, status: 'available' },
      { pg_type: 'boys', room_number: '102', floor: 1, capacity: 2, occupants: 0, status: 'available' },
      { pg_type: 'boys', room_number: '103', floor: 1, capacity: 3, occupants: 0, status: 'available' },
      { pg_type: 'boys', room_number: '201', floor: 2, capacity: 2, occupants: 0, status: 'available' },
      { pg_type: 'boys', room_number: '202', floor: 2, capacity: 3, occupants: 0, status: 'available' },
    ];

    const { data: boysData, error: boysError } = await supabase
      .from('rooms')
      .insert(boysRooms);

    if (boysError) throw boysError;
    console.log(`✓ Created ${boysRooms.length} boys rooms`);

    console.log('Seeding rooms for girls PG...');
    
    const girlsRooms = [
      { pg_type: 'girls', room_number: '101', floor: 1, capacity: 2, occupants: 0, status: 'available' },
      { pg_type: 'girls', room_number: '102', floor: 1, capacity: 2, occupants: 0, status: 'available' },
      { pg_type: 'girls', room_number: '201', floor: 2, capacity: 3, occupants: 0, status: 'available' },
    ];

    const { data: girlsData, error: girlsError } = await supabase
      .from('rooms')
      .insert(girlsRooms);

    if (girlsError) throw girlsError;
    console.log(`✓ Created ${girlsRooms.length} girls rooms`);

    // Verify
    const { data: allRooms, error: countError } = await supabase
      .from('rooms')
      .select('count');

    if (countError) throw countError;

    console.log(`\n✅ Total rooms in database: ${boysRooms.length + girlsRooms.length}`);
  } catch (error) {
    console.error('❌ Error seeding rooms:', error);
    process.exit(1);
  }
}

seedRooms();
