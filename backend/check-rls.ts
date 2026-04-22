import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function checkRLS() {
  try {
    console.log('Checking RLS status on all tables...\n');

    const tables = ['rooms', 'joiners', 'tenants', 'payments', 'leaves', 'admins', 'past_tenants'];
    
    for (const table of tables) {
      // Try to insert a test record
      const { error } = await supabase
        .from(table)
        .insert({ id: 'test-rls-check' })
        .select()
        .single();

      if (error?.message.includes('row-level security')) {
        console.log(`❌ ${table}: RLS ENABLED (blocking inserts)`);
      } else if (error?.message.includes('duplicate key')) {
        console.log(`✅ ${table}: RLS DISABLED (can insert)`);
      } else if (error?.code === 'PGRST116') {
        console.log(`⚠️  ${table}: Unknown error`);
      } else {
        console.log(`✅ ${table}: RLS DISABLED`);
      }
    }

    console.log('\n\nIf any tables show "RLS ENABLED", run in Supabase SQL Editor:');
    console.log(`
ALTER TABLE public.joiners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_tenants DISABLE ROW LEVEL SECURITY;
    `);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkRLS();
