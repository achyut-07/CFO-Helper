-- =====================================================
-- Check and Fix RLS Policies for Direct User Creation
-- =====================================================
-- Run these to check and fix Row Level Security policies

-- Check current RLS policies on users table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'users';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Temporarily disable RLS for testing (ONLY for development)
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Or create a policy that allows service role to insert
CREATE POLICY "Allow service role full access" ON public.users
FOR ALL USING (true)
WITH CHECK (true);

-- Check the service role permissions
-- This query shows what roles can access the table
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'users' AND table_schema = 'public';

-- Test direct insert to see what error we get
INSERT INTO public.users (
  id, 
  email, 
  full_name, 
  company_name, 
  organization_type, 
  team_size
) VALUES (
  'test-user-id-123',
  'test@example.com',
  'Test User',
  'Test Company',
  'startup',
  5
);

-- Clean up test user
DELETE FROM public.users WHERE id = 'test-user-id-123';