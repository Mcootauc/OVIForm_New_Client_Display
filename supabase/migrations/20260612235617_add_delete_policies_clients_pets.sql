CREATE POLICY "pets_v2 delete own hospital"
  ON public.pets
  FOR DELETE
  TO authenticated
  USING (hospital_id = internal.current_user_hospital_v2_id());

CREATE POLICY "clients_v2 delete own hospital"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING (hospital_id = internal.current_user_hospital_v2_id());