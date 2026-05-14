create table if not exists public.pets_v2 (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references public.clients_v2 (id) on delete restrict,
  hospital_id         uuid not null references public.hospitals_v2 (id) on delete restrict,
  pet_name            text not null,
  species             text,
  breed               text,
  birth_date          date,
  sex                 text,
  spayed_or_neutered  text,
  color               text,
  microchip           text,
  initials            text,
  created_at          timestamptz not null default now()
);

create index if not exists pets_v2_client_idx
  on public.pets_v2 (client_id);

create index if not exists pets_v2_hospital_idx
  on public.pets_v2 (hospital_id);

create index if not exists pets_v2_hospital_microchip_idx
  on public.pets_v2 (hospital_id, microchip)
  where microchip is not null;

-- Trigger function: copies hospital_id from the parent client. Defined as
-- security definer so it succeeds even if the inserting user can't SELECT
-- the parent client row through RLS (RLS still gates the actual pet insert).
create or replace function internal.set_pet_hospital_from_client()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent_hospital_id uuid;
begin
  select hospital_id
    into parent_hospital_id
    from public.clients_v2
   where id = new.client_id;

  if parent_hospital_id is null then
    raise exception 'pets_v2.client_id % does not reference a client_v2 row', new.client_id;
  end if;

  new.hospital_id := parent_hospital_id;
  return new;
end;
$$;

revoke execute on function internal.set_pet_hospital_from_client() from public, anon;

create trigger pets_v2_set_hospital_id
before insert on public.pets_v2
for each row
execute function internal.set_pet_hospital_from_client();

alter table public.pets_v2 enable row level security;

create policy "pets_v2 select own hospital"
  on public.pets_v2
  for select
  to authenticated
  using (hospital_id = internal.current_user_hospital_v2_id());

create policy "pets_v2 insert own hospital"
  on public.pets_v2
  for insert
  to authenticated
  with check (
    -- The trigger will overwrite hospital_id, but RLS WITH CHECK runs AFTER
    -- BEFORE INSERT triggers, so this still validates correctly. We also
    -- gate by the parent client's hospital matching the user's hospital.
    exists (
      select 1
      from public.clients_v2 c
      where c.id = client_id
        and c.hospital_id = internal.current_user_hospital_v2_id()
    )
  );

create policy "pets_v2 update own hospital"
  on public.pets_v2
  for update
  to authenticated
  using      (hospital_id = internal.current_user_hospital_v2_id())
  with check (hospital_id = internal.current_user_hospital_v2_id());