create table if not exists public.hospitals_v2 (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique,
  created_at timestamptz not null default now()
);

alter table public.hospitals_v2 enable row level security;

-- Authenticated users can only see their own hospital row.
create policy "hospitals_v2 select own hospital"
  on public.hospitals_v2
  for select
  to authenticated
  using (id = internal.current_user_hospital_v2_id());

-- No insert/update/delete policies for authenticated. Hospital provisioning
-- is an admin-only operation done via service_role.

comment on table public.hospitals_v2 is
  'V2 hospitals table with uuid PK. Will replace public.hospitals at Phase 6 cutover.';