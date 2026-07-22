create schema if not exists internal;

create or replace function internal.current_user_hospital_v2_id()
returns uuid language sql stable security definer as $$
  select p.hospital_id_v2
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;