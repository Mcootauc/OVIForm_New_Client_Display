create or replace function internal.set_pet_hospital_from_client()
returns trigger language plpgsql as $$
declare
  parent_hospital_id uuid;
begin
  select hospital_id into parent_hospital_id
  from public.clients_v2
  where id = new.client_id;

  if parent_hospital_id is null then
    raise exception 'pets.client_id % does not reference a valid client row', new.client_id;
  end if;

  new.hospital_id := parent_hospital_id;
  return new;
end;
$$;

create trigger pets_v2_set_hospital_id
  before insert on public.pets_v2
  for each row execute function internal.set_pet_hospital_from_client();