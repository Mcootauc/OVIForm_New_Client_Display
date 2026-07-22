create or replace function public.create_client_with_pet(p_client jsonb, p_pet jsonb)
returns jsonb language plpgsql security definer
set search_path to 'public','internal' as $$
declare
  v_hospital  uuid := internal.current_user_hospital_v2_id();
  v_client_id uuid := coalesce((p_client->>'id')::uuid, gen_random_uuid());
  v_pet_id    uuid := coalesce((p_pet->>'id')::uuid,    gen_random_uuid());
begin
  if v_hospital is null then
    raise exception 'caller has no hospital_id (kiosk profile not provisioned)'
      using errcode = '28000';
  end if;

  insert into public.clients_v2 (id, hospital_id, owner_name, secondary_contact_name,
    secondary_contact_cell_phone, street, city, state, zip_code, cell_phone, email, initials)
  values (v_client_id, v_hospital,
    p_client->>'owner_name', p_client->>'secondary_contact_name',
    p_client->>'secondary_contact_cell_phone', p_client->>'street', p_client->>'city',
    p_client->>'state', p_client->>'zip_code', p_client->>'cell_phone',
    p_client->>'email', p_client->>'initials');

  insert into public.pets_v2 (id, client_id, pet_name, species, breed, birth_date,
    sex, spayed_or_neutered, color, microchip, initials)
  values (v_pet_id, v_client_id,
    p_pet->>'pet_name', p_pet->>'species', p_pet->>'breed',
    (p_pet->>'birth_date')::date, p_pet->>'sex', p_pet->>'spayed_or_neutered',
    p_pet->>'color', p_pet->>'microchip', p_pet->>'initials');
  -- pets.hospital_id auto-set by trigger

  return jsonb_build_object('client_id', v_client_id, 'pet_id', v_pet_id);
end;
$$;

create or replace function public.create_pet_for_client(p_pet jsonb)
returns jsonb language plpgsql security definer
set search_path to 'public','internal' as $$
declare
  v_hospital  uuid := internal.current_user_hospital_v2_id();
  v_client_id uuid := (p_pet->>'client_id')::uuid;
  v_pet_id    uuid := coalesce((p_pet->>'id')::uuid, gen_random_uuid());
begin
  if v_hospital is null then
    raise exception 'caller has no hospital_id' using errcode = '28000';
  end if;
  if not exists (select 1 from public.clients_v2 c
                 where c.id = v_client_id and c.hospital_id = v_hospital) then
    raise exception 'client_id % not found in caller hospital', v_client_id
      using errcode = '23503';
  end if;

  insert into public.pets_v2 (id, client_id, pet_name, species, breed, birth_date,
    sex, spayed_or_neutered, color, microchip, initials)
  values (v_pet_id, v_client_id,
    p_pet->>'pet_name', p_pet->>'species', p_pet->>'breed',
    (p_pet->>'birth_date')::date, p_pet->>'sex', p_pet->>'spayed_or_neutered',
    p_pet->>'color', p_pet->>'microchip', p_pet->>'initials');

  return jsonb_build_object('pet_id', v_pet_id);
end;
$$;