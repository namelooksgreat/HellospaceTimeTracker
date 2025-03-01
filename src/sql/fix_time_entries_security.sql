-- Drop existing time entries policies
DROP POLICY IF EXISTS "Users can manage their own time entries" ON time_entries;
DROP POLICY IF EXISTS "Admins and developers can manage time entries" ON time_entries;

-- Create strict policy for regular users to only see their own time entries
CREATE POLICY "Users can only see and manage their own time entries"
ON time_entries FOR ALL
USING (user_id = auth.uid());

-- Create admin/developer policy using JWT metadata to avoid recursion
CREATE POLICY "Admins and developers can manage all time entries"
ON time_entries FOR ALL
USING (
  ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'user_type') IN ('admin', 'developer')
);

-- Verify the policies are working correctly
COMMENT ON POLICY "Users can only see and manage their own time entries" ON time_entries 
IS 'Ensures users can only access their own time entries by user_id';

COMMENT ON POLICY "Admins and developers can manage all time entries" ON time_entries 
IS 'Allows admins and developers to access all time entries using JWT metadata';
