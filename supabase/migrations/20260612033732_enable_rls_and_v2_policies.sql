alter table public.hospitals_v2     enable row level security;
alter table public.clients_v2       enable row level security;
alter table public.pets_v2          enable row level security;
alter table public.legacy_id_map    enable row level security;
alter table public.pets_unmatched   enable row level security;
alter table public.breeds           enable row level security;

-- hospitals
create policy "hospitals_v2 select own hospital" on public.hospitals_v2
  for select to authenticated
  using (id = internal.current_user_hospital_v2_id());

-- clients
create policy "clients_v2 select own hospital" on public.clients_v2
  for select to authenticated
  using (hospital_id = internal.current_user_hospital_v2_id());
create policy "clients_v2 insert own hospital" on public.clients_v2
  for insert to authenticated
  with check (hospital_id = internal.current_user_hospital_v2_id());
create policy "clients_v2 update own hospital" on public.clients_v2
  for update to authenticated
  using (hospital_id = internal.current_user_hospital_v2_id())
  with check (hospital_id = internal.current_user_hospital_v2_id());

-- pets
create policy "pets_v2 select own hospital" on public.pets_v2
  for select to authenticated
  using (hospital_id = internal.current_user_hospital_v2_id());
create policy "pets_v2 insert own hospital" on public.pets_v2
  for insert to authenticated
  with check (exists (
    select 1 from public.clients_v2 c
    where c.id = pets_v2.client_id
      and c.hospital_id = internal.current_user_hospital_v2_id()));
create policy "pets_v2 update own hospital" on public.pets_v2
  for update to authenticated
  using (hospital_id = internal.current_user_hospital_v2_id())
  with check (hospital_id = internal.current_user_hospital_v2_id());

-- read-only support / reference tables
create policy "legacy_id_map readable to authenticated" on public.legacy_id_map
  for select to authenticated using (true);
create policy "pets_unmatched readable to authenticated" on public.pets_unmatched
  for select to authenticated using (true);
create policy "breeds readable to authenticated" on public.breeds
  for select to authenticated using (true);