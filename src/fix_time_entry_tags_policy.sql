-- Fix row-level security policy for time_entry_tags table

-- First, drop existing policies if any
DROP POLICY IF EXISTS "Users can manage their own time entry tags" ON "public"."time_entry_tags";

-- Enable RLS on the table if not already enabled
ALTER TABLE "public"."time_entry_tags" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own time entry tags
CREATE POLICY "Users can manage their own time entry tags"
  ON "public"."time_entry_tags"
  USING (
    EXISTS (
      SELECT 1 FROM "public"."time_entries" te
      WHERE te.id = time_entry_id
      AND te.user_id = auth.uid()
    )
  );

-- Create policy to allow admins to manage all time entry tags
CREATE POLICY "Admins can manage all time entry tags"
  ON "public"."time_entry_tags"
  USING (
    EXISTS (
      SELECT 1 FROM "public"."users" u
      WHERE u.id = auth.uid()
      AND u.user_type = 'admin'
    )
  );
