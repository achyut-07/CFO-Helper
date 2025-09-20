-- =====================================================
-- Simple User Sync Fix - Supabase Database Setup
-- =====================================================
-- This is a simplified, error-proof version of the user sync fix

-- Step 1: Check if we have any auth users
SELECT 'Auth users found:' as info, COUNT(*) as count FROM auth.users;

-- Step 2: Check current public users
SELECT 'Public users found:' as info, COUNT(*) as count FROM public.users;

-- Step 3: Drop and recreate the user function (safe approach)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 4: Create the enhanced user handling function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert new user with metadata from Clerk
  INSERT INTO public.users (
    id, 
    email, 
    full_name,
    company_name,
    industry,
    organization_type,
    team_size
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'industry', ''),
    COALESCE(NEW.raw_user_meta_data->>'organization_type', 'other'),
    COALESCE((NEW.raw_user_meta_data->>'team_size')::integer, 1)
  );
  
  -- Create initial financial data
  INSERT INTO public.financial_data (
    user_id, current_funds, monthly_revenue, monthly_expenses, employees
  )
  VALUES (
    NEW.id, 0, 0, 0, 
    COALESCE((NEW.raw_user_meta_data->>'team_size')::integer, 1)
  );
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Don't fail auth, just log
    RETURN NEW;
END;
$$;

-- Step 5: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Sync existing users (simple approach)
INSERT INTO public.users (id, email, full_name, company_name, industry, organization_type, team_size, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    SPLIT_PART(au.email, '@', 1)
  ),
  COALESCE(au.raw_user_meta_data->>'company_name', ''),
  COALESCE(au.raw_user_meta_data->>'industry', ''),
  COALESCE(au.raw_user_meta_data->>'organization_type', 'other'),
  COALESCE((au.raw_user_meta_data->>'team_size')::integer, 1),
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id)
ON CONFLICT (id) DO NOTHING;

-- Step 7: Create financial data for synced users
INSERT INTO public.financial_data (user_id, current_funds, monthly_revenue, monthly_expenses, employees, created_at)
SELECT 
  u.id, 0, 0, 0, u.team_size, u.created_at
FROM public.users u
WHERE NOT EXISTS (SELECT 1 FROM public.financial_data fd WHERE fd.user_id = u.id)
ON CONFLICT DO NOTHING;

-- Step 8: Verify results
SELECT 
  'Auth users' as table_name, COUNT(*) as count FROM auth.users
UNION ALL
SELECT 
  'Public users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 
  'Financial data records' as table_name, COUNT(*) as count FROM public.financial_data;

-- Step 9: Show sample synced data
SELECT 
  email, full_name, company_name, organization_type, team_size
FROM public.users 
ORDER BY created_at DESC 
LIMIT 5;