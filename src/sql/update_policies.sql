-- Drop all existing policies for user_projects
DROP POLICY IF EXISTS "user_projects_select_policy" ON user_projects;
DROP POLICY IF EXISTS "user_projects_all_policy" ON user_projects;

-- Create new policies
CREATE POLICY "user_projects_select_policy" ON user_projects
    FOR SELECT USING (true);

CREATE POLICY "user_projects_all_policy" ON user_projects
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.user_type IN ('admin', 'developer')
        )
    );