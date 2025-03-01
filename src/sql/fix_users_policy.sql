-- Drop the problematic policy that's causing infinite recursion
DROP POLICY IF EXISTS users_admin_policy ON public.users;

-- Create a new admin policy that avoids the recursion by using auth.jwt() instead
CREATE POLICY users_admin_policy ON public.users
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type' = 'admin'
  );

-- This policy uses the JWT metadata directly instead of querying the users table again,
-- which prevents the infinite recursion while maintaining the same functionality
