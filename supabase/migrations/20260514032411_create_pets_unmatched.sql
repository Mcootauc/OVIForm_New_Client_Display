create table if not exists public.pets_unmatched (
  id                    uuid primary key default gen_random_uuid(),
  source_pet_id         bigint not null,
  legacy_hospital_id    bigint not null,
  pet_name              text,
  species               text,
  breed                 text,
  birth_date            date,
  sex                   text,
  spayed_or_neutered    text,
  color                 text,
  microchip             text,
  initials              text,
  owner_name            text,
  email                 text,
  cell_phone            text,
  candidate_match_count integer not null default 0,
  candidate_client_ids  uuid[]  not null default '{}',
  source_created_at     timestamptz,
  quarantined_at        timestamptz not null default now()
);

alter table public.pets_unmatched enable row level security;

-- Readable to authenticated for now (later you can scope to admins).
create policy "pets_unmatched readable to authenticated"
  on public.pets_unmatched
  for select
  to authenticated
  using (true);

comment on table public.pets_unmatched is
  'Pets that could not be auto-matched to a client during the v2 migration. Manual review required.';