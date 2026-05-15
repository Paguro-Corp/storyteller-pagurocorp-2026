create table if not exists public.app_memory (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_memory enable row level security;

drop policy if exists "deny client reads" on public.app_memory;
drop policy if exists "deny client writes" on public.app_memory;

create policy "deny client reads"
on public.app_memory
for select
using (false);

create policy "deny client writes"
on public.app_memory
for all
using (false)
with check (false);
