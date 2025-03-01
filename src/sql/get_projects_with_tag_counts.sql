CREATE OR REPLACE FUNCTION get_projects_with_tag_counts()
RETURNS TABLE (
  project_id uuid,
  project_name text,
  project_color text,
  customer_id uuid,
  customer_name text,
  tag_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as project_id,
    p.name as project_name,
    p.color as project_color,
    p.customer_id,
    c.name as customer_name,
    COUNT(pt.id) as tag_count
  FROM 
    projects p
  LEFT JOIN 
    customers c ON p.customer_id = c.id
  LEFT JOIN 
    project_tags pt ON p.id = pt.project_id
  GROUP BY 
    p.id, p.name, p.color, p.customer_id, c.name
  ORDER BY 
    p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
