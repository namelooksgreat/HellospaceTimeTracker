-- Drop all existing policies on users table to start fresh
DROP POLICY IF EXISTS users_insert_policy ON public.users;
DROP POLICY IF EXISTS users_select_policy ON public.users;
DROP POLICY IF EXISTS users_update_policy ON public.users;
DROP POLICY IF EXISTS users_admin_policy ON public.users;

-- Allow public registration
CREATE POLICY users_insert_policy ON public.users
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

-- Allow users to read their own data only
CREATE POLICY users_select_policy ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own data only
CREATE POLICY users_update_policy ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins full access using JWT metadata to avoid recursion
CREATE POLICY users_admin_policy ON public.users
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin'
  );

-- Fix policies for other tables to use JWT metadata for admin checks
-- This prevents infinite recursion while maintaining security

-- Drop existing policies
DROP POLICY IF EXISTS "Admins and developers can manage customers" ON customers;
DROP POLICY IF EXISTS "Admins and developers can manage projects" ON projects;
DROP POLICY IF EXISTS "Admins and developers can manage time entries" ON time_entries;
DROP POLICY IF EXISTS "Admins and developers can manage user projects" ON user_projects;

-- Recreate policies using JWT metadata
CREATE POLICY "Admins and developers can manage customers"
ON customers FOR ALL
USING (
  ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type') IN ('admin', 'developer')
);

CREATE POLICY "Admins and developers can manage projects"
ON projects FOR ALL
USING (
  ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type') IN ('admin', 'developer')
);

CREATE POLICY "Admins and developers can manage time entries"
ON time_entries FOR ALL
USING (
  ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type') IN ('admin', 'developer')
);

CREATE POLICY "Admins and developers can manage user projects"
ON user_projects FOR ALL
USING (
  ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type') IN ('admin', 'developer')
);

-- Ensure regular users can only see their own data
-- These policies remain unchanged as they don't cause recursion
