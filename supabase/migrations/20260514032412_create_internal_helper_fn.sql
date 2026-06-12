create schema if not exists internal;

revoke all on schema internal from public, anon, authenticated;
grant usage on schema internal to postgres, service_role;

-- Returns the hospital_v2 uuid for the currently-authenticated user, based on
-- their active profile. Returns NULL if no active profile (RLS policies treat
-- NULL = no access).
create or replace function internal.current_user_hospital_v2_id()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select lim.new_id
  from public.profiles p
  join public.legacy_id_map lim
    on lim.source_table = 'hospitals'
   and lim.source_id    = p.hospital_id
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;

revoke execute on function internal.current_user_hospital_v2_id() from public, anon;
grant  execute on function internal.current_user_hospital_v2_id() to authenticated;