# Fix User Sync Issue - Quick Guide

## Problem

Your Supabase `users` table is empty even though users exist in Clerk. This means the database trigger isn't working properly.

## Quick Solution

### Option 1: Run SQL Script (Recommended)

1. Open Supabase SQL Editor
2. Copy and paste the entire contents from `fix-user-sync.sql`
3. Run the script - it will:
   - ✅ Fix the database trigger
   - ✅ Sync all existing Clerk users to Supabase
   - ✅ Create initial financial data for each user
   - ✅ Verify the sync worked

### Option 2: Test Individual User Sync

If you want to test with just your current user first:

1. Add the UserSyncHelper component to your Dashboard temporarily:

```tsx
// In Dashboard.tsx, add this import:
import UserSyncHelper from "./UserSyncHelper";

// Add this component somewhere in your Dashboard JSX:
<UserSyncHelper />;
```

2. Click "Sync User to Database" button
3. Check if your user appears in Supabase

## What the Fix Does

### Database Trigger Repair

- Drops and recreates the `on_auth_user_created` trigger
- Adds error handling and logging
- Ensures new signups automatically create Supabase records

### Bulk User Sync

- Copies all existing `auth.users` to `public.users`
- Extracts metadata from Clerk (name, company, etc.)
- Creates initial financial data for each user
- Skips users who already exist (safe to run multiple times)

### Verification

- Shows counts of synced users
- Displays sample user data
- Confirms financial data creation

## Expected Results

After running the fix:

```sql
-- You should see matching counts
Total auth.users: X
Total public.users: X
Total financial_data records: X
```

## Test New User Registration

After the fix, test that new users work:

1. Sign out
2. Create new account
3. Complete onboarding
4. Verify user appears in both `auth.users` and `public.users`

## Troubleshooting

If users still don't sync:

1. Check Supabase logs for trigger errors
2. Verify RLS policies allow user insertion
3. Ensure Clerk metadata format matches expected fields
4. Run the verification queries in the script

The trigger should now work for all future user registrations!
