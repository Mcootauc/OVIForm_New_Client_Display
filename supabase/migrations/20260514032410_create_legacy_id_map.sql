create table if not exists public.legacy_id_map (
  source_table text not null,
  source_id    bigint not null,
  new_id       uuid not null,
  migrated_at  timestamptz not null default now(),
  primary key (source_table, source_id),
  constraint legacy_id_map_source_table_chk
    check (source_table in ('hospitals', 'clients', 'pets'))
);

create index if not exists legacy_id_map_new_id_idx
  on public.legacy_id_map (new_id);

alter table public.legacy_id_map enable row level security;

-- Read-only to authenticated users; no insert/update/delete policies (only
-- the migration code, run as service_role, populates this table).
create policy "legacy_id_map readable to authenticated"
  on public.legacy_id_map
  for select
  to authenticated
  using (true);

comment on table public.legacy_id_map is
  'Audit trail mapping legacy bigint IDs to new uuid IDs across the v2 migration. Permanent.';