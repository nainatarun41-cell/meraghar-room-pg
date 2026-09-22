-- Contact requests / leads
-- Customers "interested" in a property or requirement contact MeraGhar admin.
-- Owner & poster contact details are shown ONLY to the admin (never on the public site).
create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  requirement_id uuid references public.requirements(id) on delete set null,
  name text not null default '',
  phone text not null default '',
  message text not null default '',
  source text not null default 'property',
  created_at timestamptz not null default now()
);

alter table public.contact_requests enable row level security;

-- Anyone (logged out or in) can drop an interest lead
create policy "contact_requests_insert_public"
  on public.contact_requests for insert
  to anon, authenticated
  with check (true);

-- Only admins can read leads
create policy "contact_requests_select_admin"
  on public.contact_requests for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );