alter table public.breeds enable row level security;

create policy "breeds readable to authenticated"
  on public.breeds
  for select
  to authenticated
  using (true);