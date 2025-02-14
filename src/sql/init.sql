-- Enable RLS
alter table public.user_projects enable row level security;

-- Create policy for viewing project associations
create policy "View project associations"
  on public.user_projects
  for select
  using (true);  -- Everyone can view associations

-- Create policy for managing project associations
create policy "Manage project associations"
  on public.user_projects
  for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role in ('admin', 'developer')
    )
  );

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on public.user_projects to authenticated;

-- Add indexes for better performance
create index if not exists idx_user_projects_user_id on public.user_projects(user_id);
create index if not exists idx_user_projects_project_id on public.user_projects(project_id);
create index if not exists idx_user_projects_created_at on public.user_projects(created_at);