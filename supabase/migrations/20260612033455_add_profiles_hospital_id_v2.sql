alter table public.profiles
  add column hospital_id_v2 uuid;

alter table public.profiles
  add constraint profiles_hospital_id_v2_fkey
  foreign key (hospital_id_v2) references public.hospitals_v2(id) on delete restrict;