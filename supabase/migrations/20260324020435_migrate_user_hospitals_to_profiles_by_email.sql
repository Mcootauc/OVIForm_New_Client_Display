
INSERT INTO public.profiles (id, hospital_id, email, role, is_active, created_at)
SELECT au.id, uh.hospital_id, uh.email, uh.role, uh.is_active, uh.created_at
FROM public.user_hospitals uh
JOIN auth.users au ON lower(uh.email) = lower(au.email)
ON CONFLICT (id) DO NOTHING;
