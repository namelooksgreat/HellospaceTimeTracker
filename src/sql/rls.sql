-- Enable RLS
alter table public.customers enable row level security;
alter table public.projects enable row level security;
alter table public.time_entries enable row level security;
alter table public.user_projects enable row level security;

-- Drop existing policies
drop policy if exists "Admins and developers can manage customers" on customers;
drop policy if exists "Admins and developers can manage projects" on projects;
drop policy if exists "Users can only see their assigned projects" on projects;
drop policy if exists "Users can only see customers through their projects" on customers;
drop policy if exists "Users can manage their own time entries" on time_entries;
drop policy if exists "Admins can manage all time entries" on time_entries;

-- Admin and developer policies
create policy "Admins and developers can manage customers"
on customers for all
using (
  exists (
    select 1 from users 
    where id = auth.uid() 
    and user_type in ('admin', 'developer')
  )
);

create policy "Admins and developers can manage projects"
on projects for all
using (
  exists (
    select 1 from users 
    where id = auth.uid() 
    and user_type in ('admin', 'developer')
  )
);

create policy "Admins and developers can manage time entries"
on time_entries for all
using (
  exists (
    select 1 from users 
    where id = auth.uid() 
    and user_type in ('admin', 'developer')
  )
);

-- User policies
create policy "Users can see their assigned projects"
on projects for select
using (
  exists (
    select 1 from user_projects 
    where user_projects.project_id = projects.id 
    and user_projects.user_id = auth.uid()
  )
);

create policy "Users can see customers through their projects"
on customers for select
using (
  exists (
    select 1 from projects
    join user_projects on user_projects.project_id = projects.id
    where projects.customer_id = customers.id
    and user_projects.user_id = auth.uid()
  )
);

create policy "Users can manage their own time entries"
on time_entries for all
using (user_id = auth.uid());

-- User projects policies
create policy "Users can view their project associations"
on user_projects for select
using (user_id = auth.uid());

create policy "Admins and developers can manage user projects"
on user_projects for all
using (
  exists (
    select 1 from users 
    where id = auth.uid() 
    and user_type in ('admin', 'developer')
  )
);
