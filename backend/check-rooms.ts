import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function test() {
  console.log('Checking rooms in database...');
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('pg_type', 'boys');

  if (error) {
    console.log('Error:', error);
  } else {
    console.log(`Found ${data?.length} rooms`);
    data?.forEach((r: any) => console.log(`  - ${r.room_number}`));
  }

  process.exit(0);
}

test();
