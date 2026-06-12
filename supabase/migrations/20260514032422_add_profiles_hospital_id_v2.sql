begin;

-- 1. Add column (nullable initially)
alter table public.profiles
  add column hospital_id_v2 uuid
  references public.hospitals_v2(id) on delete restrict;

-- 2. Backfill via legacy_id_map
update public.profiles p
set hospital_id_v2 = lim.new_id
from public.legacy_id_map lim
where lim.source_table = 'hospitals'
  and lim.source_id    = p.hospital_id
  and p.hospital_id_v2 is null;

-- 3. Assert every row backfilled (fail the txn if not)
do $$
declare missing int;
begin
  select count(*) into missing from public.profiles where hospital_id_v2 is null;
  if missing > 0 then
    raise exception 'profiles.hospital_id_v2 backfill incomplete: % rows null', missing;
  end if;
end $$;

-- 4. Lock down with NOT NULL + helpful index
alter table public.profiles
  alter column hospital_id_v2 set not null;

create index if not exists profiles_hospital_id_v2_idx
  on public.profiles (hospital_id_v2);

-- 5. Update the RLS helper to read the column directly
create or replace function internal.current_user_hospital_v2_id()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select p.hospital_id_v2
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;

commit;
