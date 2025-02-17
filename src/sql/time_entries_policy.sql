-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Allow users to view all time entries if they are admin
CREATE POLICY "Users can view all time entries if admin" ON time_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

-- Allow users to view their own time entries
CREATE POLICY "Users can view own time entries" ON time_entries
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow users to insert their own time entries
CREATE POLICY "Users can insert own time entries" ON time_entries
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own time entries
CREATE POLICY "Users can update own time entries" ON time_entries
  FOR UPDATE
  USING (user_id = auth.uid());

-- Allow users to delete their own time entries
CREATE POLICY "Users can delete own time entries" ON time_entries
  FOR DELETE
  USING (user_id = auth.uid());