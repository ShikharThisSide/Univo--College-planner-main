create table if not exists public.univo_user_data (
  email text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists univo_user_data_email_idx on public.univo_user_data (email);
