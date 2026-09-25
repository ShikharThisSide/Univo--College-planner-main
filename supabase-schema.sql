create table if not exists public.univo_user_data (
  email text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists univo_user_data_email_idx on public.univo_user_data (email);

create table if not exists public.univo_access_requests (
  email text primary key,
  requested_role text not null,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz
);
