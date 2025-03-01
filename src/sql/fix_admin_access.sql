-- Fix admin access to see all users and time entries

-- First, drop the current policies
DROP POLICY IF EXISTS users_admin_policy ON public.users;
DROP POLICY IF EXISTS users_self_policy ON public.users;
DROP POLICY IF EXISTS admin_time_entries_policy ON public.time_entries;
DROP POLICY IF EXISTS user_time_entries_policy ON public.time_entries;

-- Create policies for users table
CREATE POLICY users_admin_policy ON public.users
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE (user_metadata->>'user_type')::text = 'admin'
    )
  );

CREATE POLICY users_self_policy ON public.users
  USING (auth.uid() = id);

-- Create policies for time_entries table
CREATE POLICY admin_time_entries_policy ON public.time_entries
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE (user_metadata->>'user_type')::text = 'admin'
    )
  );

CREATE POLICY user_time_entries_policy ON public.time_entries
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
