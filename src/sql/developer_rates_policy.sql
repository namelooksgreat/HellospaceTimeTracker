-- Enable RLS
ALTER TABLE developer_rates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own rates" ON developer_rates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rates" ON developer_rates
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rates" ON developer_rates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rates" ON developer_rates
  FOR DELETE
  USING (auth.uid() = user_id);
