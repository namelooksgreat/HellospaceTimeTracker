-- Fix time entries security policy to allow admin access

-- First, drop the existing policies for time_entries
DROP POLICY IF EXISTS admin_time_entries_policy ON public.time_entries;
DROP POLICY IF EXISTS user_time_entries_policy ON public.time_entries;

-- Create a new policy for admin users to see all time entries
CREATE POLICY admin_time_entries_policy ON public.time_entries
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create a policy for regular users to see only their own time entries
CREATE POLICY user_time_entries_policy ON public.time_entries
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
