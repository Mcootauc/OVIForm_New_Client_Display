-- drop legacy RPCs
drop function if exists public.create_client(jsonb);
drop function if exists public.create_pet(jsonb);
drop function if exists public.create_vvh_client(jsonb);

-- drop legacy bigint FK from profiles before dropping hospitals_legacy
alter table public.profiles drop constraint profiles_hospital_id_fkey;

-- drop legacy tables (children before parent)
drop table public.clients_legacy;
drop table public.pets_legacy;
drop table public."VVH_Clients_legacy";
drop table public.hospitals_legacy;