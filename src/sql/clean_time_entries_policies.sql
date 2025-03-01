-- First, drop ALL existing policies on time_entries table
DROP POLICY IF EXISTS "Admins and developers can manage all time entries" ON time_entries;
DROP POLICY IF EXISTS "Admins can do everything with time_entries" ON time_entries;
DROP POLICY IF EXISTS "All users can view time entries" ON time_entries;
DROP POLICY IF EXISTS "customer_time_entries_policy" ON time_entries;
DROP POLICY IF EXISTS "time_entries_admin_policy" ON time_entries;
DROP POLICY IF EXISTS "time_entries_self_policy" ON time_entries;
DROP POLICY IF EXISTS "Users can delete own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can delete their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can insert own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can insert their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can only see and manage their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can view all time entries if admin" ON time_entries;
DROP POLICY IF EXISTS "Users can view own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can view their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Admins and developers can manage time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can manage their own time entries" ON time_entries;

-- Make sure RLS is enabled
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create just TWO clean policies:

-- 1. Regular users can only access their own time entries
CREATE POLICY "user_time_entries_policy" ON time_entries
FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- 2. Admins can access all time entries (using JWT to avoid recursion)
CREATE POLICY "admin_time_entries_policy" ON time_entries
FOR ALL
TO authenticated
USING (
  ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type') = 'admin'
);

-- Verify policies are in place
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'time_entries';
