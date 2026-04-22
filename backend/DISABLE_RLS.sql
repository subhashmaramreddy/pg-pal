Run this SQL in your Supabase SQL Editor to disable RLS on all tables:

-- Disable RLS on all tables that need write access
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.joiners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_tenants DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT table_name, row_security_active
FROM information_schema.tables
WHERE table_schema = 'public' AND row_security_active = true;
