-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own rates
CREATE POLICY "Users can view own rates" ON user_settings
  FOR SELECT
  USING (user_id = auth.uid());

-- Allow admins to view all rates
CREATE POLICY "Admins can view all rates" ON user_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

-- Allow admins to update all rates
CREATE POLICY "Admins can update all rates" ON user_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'admin'
    )
  );

-- Allow users to update their own rates
CREATE POLICY "Users can update own rates" ON user_settings
  FOR UPDATE
  USING (user_id = auth.uid());