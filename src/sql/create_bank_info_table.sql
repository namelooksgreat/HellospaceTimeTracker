-- Create bank_info table to store user bank information
CREATE TABLE IF NOT EXISTS bank_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  iban TEXT NOT NULL,
  swift_code TEXT,
  branch_name TEXT,
  account_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE bank_info ENABLE ROW LEVEL SECURITY;

-- Users can view and edit only their own bank info
CREATE POLICY "Users can view their own bank info" 
  ON bank_info FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank info" 
  ON bank_info FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank info" 
  ON bank_info FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank info" 
  ON bank_info FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bank_info;
