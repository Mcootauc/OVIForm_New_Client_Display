create table if not exists public.clients_v2 (
  id                            uuid primary key default gen_random_uuid(),
  hospital_id                   uuid not null references public.hospitals_v2 (id) on delete restrict,
  owner_name                    text not null,
  secondary_contact_name        text,
  secondary_contact_cell_phone  text,
  street                        text,
  city                          text,
  state                         text,
  zip_code                      text,
  cell_phone                    text,
  email                         text,
  initials                      text,
  created_at                    timestamptz not null default now()
);

create index if not exists clients_v2_hospital_email_idx
  on public.clients_v2 (hospital_id, lower(email));

create index if not exists clients_v2_hospital_phone_idx
  on public.clients_v2 (hospital_id, cell_phone)
  where cell_phone is not null;

create index if not exists clients_v2_hospital_owner_idx
  on public.clients_v2 (hospital_id, lower(owner_name));

alter table public.clients_v2 enable row level security;

create policy "clients_v2 select own hospital"
  on public.clients_v2
  for select
  to authenticated
  using (hospital_id = internal.current_user_hospital_v2_id());

create policy "clients_v2 insert own hospital"
  on public.clients_v2
  for insert
  to authenticated
  with check (hospital_id = internal.current_user_hospital_v2_id());

create policy "clients_v2 update own hospital"
  on public.clients_v2
  for update
  to authenticated
  using      (hospital_id = internal.current_user_hospital_v2_id())
  with check (hospital_id = internal.current_user_hospital_v2_id());

-- No DELETE policy for authenticated. Deletion is admin-only via service_role.