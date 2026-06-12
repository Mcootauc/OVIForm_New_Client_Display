begin;

with src as materialized (
  select
    h.id          as legacy_id,
    h.name,
    h.slug,
    h.created_at,
    gen_random_uuid() as new_id
  from public.hospitals h
),
ins as (
  insert into public.hospitals_v2 (id, name, slug, created_at)
  select new_id, name, slug, created_at
  from src
  returning id
)
insert into public.legacy_id_map (source_table, source_id, new_id)
select 'hospitals', legacy_id, new_id from src;

commit;