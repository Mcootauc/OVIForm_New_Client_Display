begin;

-- Step 1: build a per-row "candidates" set, picking the first non-empty
-- match tier (email → cell_phone → owner_name).
with legacy_pets as (
  select
    p.id            as legacy_pet_id,
    p.hospital_id   as legacy_hospital_id,
    hl.new_id       as hospital_uuid,
    p.pet_name,
    p.species,
    p.breed,
    p.birth_date::date as birth_date,
    p.sex,
    p.spayed_or_neutered,
    p.color,
    p.microchip,
    p.initials,
    p.owner_name,
    p.email,
    p.cell_phone,
    p.created_at
  from public.pets p
  join public.legacy_id_map hl
    on hl.source_table = 'hospitals'
   and hl.source_id    = p.hospital_id
),
matches_email as (
  select lp.legacy_pet_id, array_agg(c.id) as ids
  from legacy_pets lp
  join public.clients_v2 c
    on c.hospital_id = lp.hospital_uuid
   and lp.email is not null
   and lower(c.email) = lower(lp.email)
  group by lp.legacy_pet_id
),
matches_phone as (
  select lp.legacy_pet_id, array_agg(c.id) as ids
  from legacy_pets lp
  join public.clients_v2 c
    on c.hospital_id = lp.hospital_uuid
   and lp.cell_phone is not null
   and c.cell_phone = lp.cell_phone
  where not exists (select 1 from matches_email me where me.legacy_pet_id = lp.legacy_pet_id)
  group by lp.legacy_pet_id
),
matches_owner as (
  select lp.legacy_pet_id, array_agg(c.id) as ids
  from legacy_pets lp
  join public.clients_v2 c
    on c.hospital_id = lp.hospital_uuid
   and lp.owner_name is not null
   and lower(c.owner_name) = lower(lp.owner_name)
  where not exists (select 1 from matches_email me where me.legacy_pet_id = lp.legacy_pet_id)
    and not exists (select 1 from matches_phone mp where mp.legacy_pet_id = lp.legacy_pet_id)
  group by lp.legacy_pet_id
),
final_match as (
  select lp.*,
         coalesce(me.ids, mp.ids, mo.ids, '{}'::uuid[]) as candidate_ids
  from legacy_pets lp
  left join matches_email me on me.legacy_pet_id = lp.legacy_pet_id
  left join matches_phone mp on mp.legacy_pet_id = lp.legacy_pet_id
  left join matches_owner mo on mo.legacy_pet_id = lp.legacy_pet_id
),
to_insert as (
  select fm.*, gen_random_uuid() as new_pet_id
  from final_match fm
  where cardinality(fm.candidate_ids) = 1
),
inserted_pets as (
  insert into public.pets_v2 (
    id, client_id, hospital_id, pet_name, species, breed, birth_date, sex,
    spayed_or_neutered, color, microchip, initials, created_at
  )
  select
    new_pet_id,
    candidate_ids[1],
    hospital_uuid,
    pet_name,
    species,
    breed,
    birth_date,
    sex,
    spayed_or_neutered,
    color,
    microchip,
    initials,
    coalesce(created_at, now())
  from to_insert
  returning id
),
mapping_inserts as (
  insert into public.legacy_id_map (source_table, source_id, new_id)
  select 'pets', legacy_pet_id, new_pet_id from to_insert
)
insert into public.pets_unmatched (
  source_pet_id, legacy_hospital_id, pet_name, species, breed, birth_date,
  sex, spayed_or_neutered, color, microchip, initials, owner_name, email,
  cell_phone, candidate_match_count, candidate_client_ids, source_created_at
)
select
  legacy_pet_id, legacy_hospital_id, pet_name, species, breed, birth_date,
  sex, spayed_or_neutered, color, microchip, initials, owner_name, email,
  cell_phone, cardinality(candidate_ids), candidate_ids, created_at
from final_match
where cardinality(candidate_ids) <> 1;

commit;