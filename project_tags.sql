-- Create project_tags table
CREATE TABLE IF NOT EXISTS project_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, name)
);

-- Create time_entry_tags table for many-to-many relationship
CREATE TABLE IF NOT EXISTS time_entry_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time_entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES project_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(time_entry_id, tag_id)
);

-- Add RLS policies
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entry_tags ENABLE ROW LEVEL SECURITY;

-- Project tags can be read by any authenticated user
CREATE POLICY project_tags_select_policy ON project_tags
  FOR SELECT USING (auth.role() = 'authenticated');

-- Project tags can be modified by admins or project owners
CREATE POLICY project_tags_insert_policy ON project_tags
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY project_tags_update_policy ON project_tags
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  );

CREATE POLICY project_tags_delete_policy ON project_tags
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM projects WHERE id = project_id AND user_id = auth.uid())
  );

-- Time entry tags can be read by any authenticated user
CREATE POLICY time_entry_tags_select_policy ON time_entry_tags
  FOR SELECT USING (auth.role() = 'authenticated');

-- Time entry tags can be modified by the time entry owner
CREATE POLICY time_entry_tags_insert_policy ON time_entry_tags
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM time_entries WHERE id = time_entry_id AND user_id = auth.uid())
  );

CREATE POLICY time_entry_tags_delete_policy ON time_entry_tags
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    EXISTS (SELECT 1 FROM time_entries WHERE id = time_entry_id AND user_id = auth.uid())
  );
