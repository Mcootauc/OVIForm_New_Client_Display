-- 3.1 Hospitals copied 1:1
select 'hospitals' as table_name,
       (select count(*) from public.hospitals)     as legacy_count,
       (select count(*) from public.hospitals_v2)  as v2_count,
       (select count(*) from public.legacy_id_map
         where source_table = 'hospitals')         as mapped_count;

-- 3.2 Clients copied 1:1 (we are not deduping; VVH_Clients is excluded by design)
select 'clients' as table_name,
       (select count(*) from public.clients)       as legacy_count,
       (select count(*) from public.clients_v2)    as v2_count,
       (select count(*) from public.legacy_id_map
         where source_table = 'clients')           as mapped_count;

-- 3.3 Every legacy clients row has a mapping entry
select count(*) as clients_missing_from_map
from public.clients c
left join public.legacy_id_map lim
  on lim.source_table = 'clients' and lim.source_id = c.id
where lim.new_id is null;

-- 3.4 Pets count: should equal (clients with pet_name) + (matched standalone pets)
select
  (select count(*) from public.clients where pet_name is not null) as expected_from_clients,
  (select count(*) from public.legacy_id_map where source_table = 'pets') as expected_from_pets,
  (select count(*) from public.pets_v2) as actual_pets_v2,
  (select count(*) from public.pets_unmatched) as quarantined;

-- 3.5 No NULL FK columns in pets_v2
select count(*) as pets_v2_with_null_fk
from public.pets_v2
where client_id is null or hospital_id is null;

-- 3.6 pets_v2.hospital_id matches its parent client's hospital_id
select count(*) as pets_v2_hospital_mismatches
from public.pets_v2 p
join public.clients_v2 c on c.id = p.client_id
where p.hospital_id <> c.hospital_id;

-- 3.7 Created_at preservation: range should match source for clients
select 'clients_v2' as scope,
       min(created_at) as min_at, max(created_at) as max_at,
       count(*) as n
from public.clients_v2
union all
select 'clients (legacy)',
       min(created_at), max(created_at), count(*)
from public.clients;

-- 3.8 Created_at preservation: range should match source for pets_v2
-- (combined source = clients.created_at where pet_name is not null + pets.created_at)
select 'pets_v2' as scope,
       min(created_at) as min_at, max(created_at) as max_at,
       count(*) as n
from public.pets_v2
union all
select 'pets sources combined',
       least(
         (select min(created_at) from public.clients where pet_name is not null),
         (select min(created_at) from public.pets)
       ),
       greatest(
         (select max(created_at) from public.clients where pet_name is not null),
         (select max(created_at) from public.pets)
       ),
       (select count(*) from public.clients where pet_name is not null)
       + (select count(*) from public.pets);

-- 3.9 Spot check: pick 5 random legacy clients and verify field-by-field
select
  c.id            as legacy_id,
  cv.id           as new_id,
  c.owner_name    = cv.owner_name        as owner_match,
  coalesce(c.email,'')      = coalesce(cv.email,'')      as email_match,
  coalesce(c.cell_phone,'') = coalesce(cv.cell_phone,'') as phone_match,
  coalesce(c.zip_code,'')   = coalesce(cv.zip_code,'')   as zip_match,
  c.created_at    = cv.created_at        as created_at_match
from public.clients c
join public.legacy_id_map lim
  on lim.source_table = 'clients' and lim.source_id = c.id
join public.clients_v2 cv on cv.id = lim.new_id
order by random()
limit 5;

-- 3.10 Quarantine review — list any pets_unmatched rows
select id, source_pet_id, owner_name, email, cell_phone,
       pet_name, candidate_match_count, candidate_client_ids
from public.pets_unmatched
order by source_pet_id;

-- 3.11 RLS sanity: confirm policies exist as expected on the new tables
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename in ('hospitals_v2','clients_v2','pets_v2','breeds','legacy_id_map','pets_unmatched')
order by tablename, policyname;

-- 3.12 NULL owner_name remediation count (Phase 2 substitutes '(unknown)')
select count(*) as substituted_owner_name
from public.clients_v2 cv
join public.legacy_id_map lim
  on lim.source_table = 'clients' and lim.new_id = cv.id
join public.clients c on c.id = lim.source_id
where c.owner_name is null;