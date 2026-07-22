create table public.hospitals_v2 (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  created_at timestamptz not null default now()
);

create table public.clients_v2 (
  id uuid primary key default gen_random_uuid(),
  hospital_id uuid not null references public.hospitals_v2(id),
  owner_name text not null,
  secondary_contact_name text,
  secondary_contact_cell_phone text,
  street text,
  city text,
  state text,
  zip_code text,
  cell_phone text,
  email text,
  initials text,
  created_at timestamptz not null default now()
);

create table public.pets_v2 (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients_v2(id),
  hospital_id uuid not null references public.hospitals_v2(id),
  pet_name text not null,
  species text,
  breed text,
  birth_date date,
  sex text,
  spayed_or_neutered text,
  color text,
  microchip text,
  initials text,
  created_at timestamptz not null default now()
);

create table public.legacy_id_map (
  source_table text not null check (source_table = any (array['hospitals','clients','pets'])),
  source_id bigint not null,
  new_id uuid not null,
  migrated_at timestamptz not null default now(),
  primary key (source_table, source_id)
);
comment on table public.legacy_id_map is
  'Audit trail mapping legacy bigint IDs to new uuid IDs across the v2 migration. Permanent.';

create table public.pets_unmatched (
  id uuid primary key default gen_random_uuid(),
  source_pet_id bigint not null,
  legacy_hospital_id bigint not null,
  pet_name text, species text, breed text, birth_date date, sex text,
  spayed_or_neutered text, color text, microchip text, initials text,
  owner_name text, email text, cell_phone text,
  candidate_match_count integer not null default 0,
  candidate_client_ids uuid[] not null default '{}'::uuid[],
  source_created_at timestamptz,
  quarantined_at timestamptz not null default now()
);
comment on table public.pets_unmatched is
  'Pets that could not be auto-matched to a client during the v2 migration. Manual review required.';