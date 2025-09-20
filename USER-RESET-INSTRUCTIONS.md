# User Reset and Testing Instructions

## Step 1: Reset Database (Run in Supabase SQL Editor)

**⚠️ WARNING: This will delete ALL existing user data!**

```sql
-- Delete all user-related data (this cascades to all related tables)
DELETE FROM public.users;

-- Delete authentication records (users will need to sign up again)
DELETE FROM auth.users;

-- Verify deletion
SELECT 'Users table count:' as info, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Auth users count:' as info, COUNT(*) as count FROM auth.users;
```

## Step 2: Update User Registration Function

Run this in Supabase SQL Editor to update the user registration function:

```sql
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
```

## Step 3: Test New User Registration

1. **Sign out** of the application (if currently signed in)
2. **Clear browser data** or use incognito mode to ensure clean state
3. **Sign up** with a new account
4. **Complete the onboarding flow** with:
   - Organization type (Event, Enterprise, Startup, Freelance, Other)
   - Company name
   - Team size
   - Industry
   - Optional description

## Step 4: Verify Database Integration

After completing onboarding, check in Supabase SQL Editor:

```sql
-- Check if user was created properly
SELECT 
  u.email,
  u.full_name,
  u.company_name,
  u.industry,
  u.organization_type,
  u.team_size,
  u.created_at
FROM public.users u;

-- Check if financial data was created
SELECT 
  fd.user_id,
  fd.current_funds,
  fd.employees,
  u.company_name
FROM public.financial_data fd
JOIN public.users u ON fd.user_id = u.id;
```

## Step 5: Test Dashboard Integration

1. Navigate to the Dashboard
2. Verify that:
   - User name displays correctly in header
   - Financial simulations work
   - AI chat has access to user context
   - Data persists after refresh

## What Changed

✅ **Enhanced Onboarding**: Now captures organization details during signup
✅ **Database Integration**: User metadata automatically stored in Supabase
✅ **Improved UX**: Organization types updated to match business needs
✅ **Silent Operations**: Database operations happen in background
✅ **Auto-initialization**: Financial data record created automatically

## Organization Types Available

- **Event Organization**: Conferences, weddings, corporate events
- **Enterprise/Company**: Established businesses
- **Startup**: Early-stage companies
- **Freelance/Consulting**: Independent contractors
- **Other**: Non-profits, government, etc.

## Troubleshooting

If users aren't being created properly:

1. Check browser console for errors
2. Verify Clerk environment variables are set
3. Check Supabase logs for trigger errors
4. Ensure RLS policies allow user insertion

The onboarding flow now properly integrates with your database schema and will capture all the organization details you need for better user management and AI context.