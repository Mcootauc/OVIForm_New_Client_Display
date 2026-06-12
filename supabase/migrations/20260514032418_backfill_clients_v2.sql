begin;

with src as materialized (
  select
    c.id          as legacy_id,
    hl.new_id     as hospital_uuid,
    coalesce(c.owner_name, '(unknown)') as owner_name,
    c.secondary_contact_name,
    c.secondary_contact_cell_phone,
    c.street,
    c.city,
    c.state,
    c.zip_code,
    c.cell_phone,
    c.email,
    c.initials,
    coalesce(c.created_at, now()) as created_at,
    gen_random_uuid() as new_id
  from public.clients c
  join public.legacy_id_map hl
    on hl.source_table = 'hospitals'
   and hl.source_id    = c.hospital_id
),
ins as (
  insert into public.clients_v2 (
    id, hospital_id, owner_name, secondary_contact_name, secondary_contact_cell_phone,
    street, city, state, zip_code, cell_phone, email, initials, created_at
  )
  select
    new_id, hospital_uuid, owner_name, secondary_contact_name, secondary_contact_cell_phone,
    street, city, state, zip_code, cell_phone, email, initials, created_at
  from src
  returning id
)
insert into public.legacy_id_map (source_table, source_id, new_id)
select 'clients', legacy_id, new_id from src;

commit;