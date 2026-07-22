-- 1. drop the old FK constraint on hospital_id_v2
alter table public.profiles drop constraint profiles_hospital_id_v2_fkey;

-- 2. drop the legacy bigint column (no constraint left on it)
alter table public.profiles drop column hospital_id;

-- 3. rename uuid column to clean name
alter table public.profiles rename column hospital_id_v2 to hospital_id;

-- 4. re-add FK under clean constraint name pointing at the new uuid hospitals table
alter table public.profiles
  add constraint profiles_hospital_id_fkey
  foreign key (hospital_id) references public.hospitals(id) on delete restrict;

-- 5. update helper to read renamed column
create or replace function internal.current_user_hospital_v2_id()
returns uuid language sql stable security definer as $$
  select p.hospital_id
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;