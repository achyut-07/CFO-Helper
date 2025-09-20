-- =====================================================
-- Fix User Sync Issues - Supabase Database Setup
-- =====================================================
-- Run these queries in Supabase SQL Editor to fix user sync

-- Step 1: Check current trigger status
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 2: Check if the function exists
SELECT 
  routine_name,
  routine_type,
  routine_schema
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';

-- Step 3: Drop existing trigger if it exists (to recreate properly)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Also drop the function to ensure clean recreation
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 4: Create or replace the user handling function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Log the trigger execution for debugging
  RAISE NOTICE 'Creating user with ID: %, Email: %', NEW.id, NEW.email;
  
  -- Insert new user with enhanced metadata from Clerk
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
  
  -- Create initial financial data record for new user
  INSERT INTO public.financial_data (
    user_id,
    current_funds,
    monthly_revenue,
    monthly_expenses,
    employees
  )
  VALUES (
    NEW.id,
    0,
    0,
    0,
    COALESCE((NEW.raw_user_meta_data->>'team_size')::integer, 1)
  );
  
  RAISE NOTICE 'Successfully created user and financial data for: %', NEW.email;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log any errors but don't fail the auth process
    RAISE NOTICE 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 5: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Verify trigger was created successfully
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 7: Check existing auth.users to understand the data structure
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at
FROM auth.users 
LIMIT 5;

-- Step 8: Manually sync existing Clerk users to Supabase users table
-- This will create user records for all existing Clerk users
DO $$
DECLARE
    user_record RECORD;
    sync_count INTEGER := 0;
BEGIN
    -- Loop through each auth user and insert safely
    FOR user_record IN 
        SELECT 
            au.id,
            au.email,
            COALESCE(
                au.raw_user_meta_data->>'full_name',
                au.raw_user_meta_data->>'name',
                SPLIT_PART(au.email, '@', 1)
            ) as full_name,
            COALESCE(au.raw_user_meta_data->>'company_name', '') as company_name,
            COALESCE(au.raw_user_meta_data->>'industry', '') as industry,
            COALESCE(au.raw_user_meta_data->>'organization_type', 'other') as organization_type,
            COALESCE((au.raw_user_meta_data->>'team_size')::integer, 1) as team_size,
            au.created_at
        FROM auth.users au
        WHERE NOT EXISTS (
            SELECT 1 FROM public.users pu WHERE pu.id = au.id
        )
    LOOP
        BEGIN
            INSERT INTO public.users (
                id, email, full_name, company_name, industry, 
                organization_type, team_size, created_at
            ) VALUES (
                user_record.id, user_record.email, user_record.full_name,
                user_record.company_name, user_record.industry,
                user_record.organization_type, user_record.team_size, user_record.created_at
            );
            sync_count := sync_count + 1;
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'Failed to sync user %: %', user_record.email, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Successfully synced % users', sync_count;
END $$;

-- Step 9: Create initial financial data for existing users who don't have it
INSERT INTO public.financial_data (
  user_id,
  current_funds,
  monthly_revenue,
  monthly_expenses,
  employees,
  created_at
)
SELECT 
  u.id,
  0 as current_funds,
  0 as monthly_revenue,
  0 as monthly_expenses,
  u.team_size as employees,
  u.created_at
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.financial_data fd WHERE fd.user_id = u.id
);

-- Step 10: Verify the sync worked
SELECT 
  'Total auth.users' as table_name, 
  COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
  'Total public.users' as table_name, 
  COUNT(*) as count 
FROM public.users
UNION ALL
SELECT 
  'Total financial_data records' as table_name, 
  COUNT(*) as count 
FROM public.financial_data;

-- Step 11: Check a sample of synced users
SELECT 
  u.email,
  u.full_name,
  u.company_name,
  u.organization_type,
  u.team_size,
  CASE WHEN fd.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_financial_data
FROM public.users u
LEFT JOIN public.financial_data fd ON u.id = fd.user_id
LIMIT 10;