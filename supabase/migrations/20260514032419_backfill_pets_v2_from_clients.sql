begin;

insert into public.pets_v2 (
  client_id,
  hospital_id,
  pet_name,
  species,
  breed,
  birth_date,
  sex,
  spayed_or_neutered,
  color,
  microchip,
  initials,
  created_at
)
select
  cl.new_id                                           as client_id,
  hl.new_id                                           as hospital_id,
  c.pet_name,
  c.species,
  c.breed,
  c.birth_date::date,
  c.sex,
  c.spayed_or_neutered,
  c.color,
  c.microchip,
  c.initials,
  coalesce(c.created_at, now())                       as created_at
from public.clients c
join public.legacy_id_map cl
  on cl.source_table = 'clients'
 and cl.source_id    = c.id
join public.legacy_id_map hl
  on hl.source_table = 'hospitals'
 and hl.source_id    = c.hospital_id
where c.pet_name is not null;

commit;