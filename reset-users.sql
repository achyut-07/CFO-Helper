-- =====================================================
-- Reset Users Script - Clean Slate for New User Flow
-- =====================================================
-- Run this in Supabase SQL Editor to reset all user data
-- WARNING: This will delete ALL existing user data!

-- Step 1: Delete all user-related data (cascading deletes will handle related records)
-- This will also delete financial_data, simulations, transactions, monthly_reports, ai_chat_history
DELETE FROM public.users;

-- Step 2: Delete from auth.users table as well (this removes authentication records)
-- WARNING: This will log out all users and they'll need to sign up again
DELETE FROM auth.users;

-- Step 3: Verify deletion
SELECT 'Users table count:' as info, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Auth users count:' as info, COUNT(*) as count FROM auth.users;

-- =====================================================
-- Enhanced User Registration Function
-- =====================================================
-- Updated function to capture more user details during signup

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
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
  
  RETURN NEW;
END;
$$;