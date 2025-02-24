-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Drop existing table if exists
drop table if exists invitations;

-- Create invitations table
create table invitations (
  id uuid default uuid_generate_v4() primary key,
  email text not null,
  token text not null unique,
  role text not null default 'user',
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references auth.users(id),
  metadata jsonb default '{}'::jsonb,
  constraint valid_role check (role in ('admin', 'developer', 'designer', 'user'))
);

-- Add indexes for performance
create index idx_invitations_token on invitations(token);
create index idx_invitations_email on invitations(email);
create index idx_invitations_created_by on invitations(created_by);

-- Enable RLS
alter table invitations enable row level security;

-- Drop existing policies if any
drop policy if exists "Admins can create invitations" on invitations;
drop policy if exists "Admins can view all invitations" on invitations;
drop policy if exists "Users can view their own invitations" on invitations;
drop policy if exists "Anyone can validate invitations" on invitations;
drop policy if exists "Admins can update invitations" on invitations;

-- Create new policies
create policy "Admins can create invitations"
  on invitations for insert
  to authenticated
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin'
  );

create policy "Admins can view all invitations"
  on invitations for select
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin'
  );

create policy "Users can view their own invitations"
  on invitations for select
  to authenticated
  using (email = auth.jwt() ->> 'email');

create policy "Anyone can validate invitations"
  on invitations for select
  using (
    used_at is null and
    expires_at > now()
  );

create policy "Admins can update invitations"
  on invitations for update
  to authenticated
  using (
    (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin'
  )
  with check (
    (auth.jwt() -> 'user_metadata' ->> 'user_type') = 'admin'
  );

-- Function to check invitation token
create or replace function check_invitation_token(p_token text)
returns table (
  is_valid boolean,
  email text,
  role text,
  metadata jsonb
) 
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select 
    true as is_valid,
    i.email,
    i.role,
    i.metadata
  from invitations i
  where i.token = p_token
    and i.used_at is null
    and i.expires_at > now();
    
  if not found then
    return query select false, null::text, null::text, null::jsonb;
  end if;
end;
$$;