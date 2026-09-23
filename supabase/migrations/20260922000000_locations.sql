-- ============================================================
-- MeraGhar - Location registry for SEO location pages
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- Idempotent and safe to re-run.
--
-- Gives every city/town its own seeded row so the dynamic
-- /[location] and /[location]/[category] pages, sitemap and
-- admin panel all work from one source of truth.
-- ============================================================

create table if not exists public.locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  state       text not null default '',
  country     text not null default 'India',
  type        text not null default 'city' check (type in ('city', 'town', 'area')),
  parent_slug text,
  nearby      text[] not null default '{}',
  areas       text[] not null default '{}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists idx_locations_slug        on public.locations (slug);
create index if not exists idx_locations_parent      on public.locations (parent_slug);
create index if not exists idx_locations_active      on public.locations (is_active);

-- ----- RLS -----
alter table public.locations enable row level security;

drop policy if exists "locations_select_public" on public.locations;
create policy "locations_select_public"
  on public.locations for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "locations_select_admin_all" on public.locations;
create policy "locations_select_admin_all"
  on public.locations for select
  to authenticated
  using (public.is_admin());

drop policy if exists "locations_write_admin" on public.locations;
create policy "locations_write_admin"
  on public.locations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----- SEED: initial locations -----
insert into public.locations (name, slug, state, country, type, parent_slug, nearby, areas) values
  ('Kaithal', 'kaithal', 'Haryana', 'India', 'city', null,
   '{pundri,kurukshetra,karnal,panipat}',
   '{"City Centre","Pehowa Road","Kurukshetra Road","Guhla Road","Division Chowk"}'),
  ('Pundri', 'pundri', 'Haryana', 'India', 'town', null,
   '{kaithal,kurukshetra,karnal}',
   '{"Main Bazaar","Rajound Road","Bus Stand Road","Kaithal Road"}'),
  ('Kurukshetra', 'kurukshetra', 'Haryana', 'India', 'city', null,
   '{kaithal,karnal,ambala,pundri}',
   '{"Railway Road","Pipli Chowk","Pehowa Chowk","Ladwa Road","Sarai Road"}'),
  ('Karnal', 'karnal', 'Haryana', 'India', 'city', null,
   '{kaithal,panipat,kurukshetra}',
   '{"GT Road","Ramlila Ground","Mehra Road","Railway Road","Kunjpura Road"}'),
  ('Panipat', 'panipat', 'Haryana', 'India', 'city', null,
   '{karnal,ambala,delhi}',
   '{"GT Road","Krishna Colony","Model Town","Motilal Nehru Park","Madina Chowk"}'),
  ('Ambala', 'ambala', 'Haryana', 'India', 'city', null,
   '{kurukshetra,chandigarh,panipat}',
   '{"Ambala Cantt","Civil Lines","Mahesh Nagar","Prem Nagar","Barara"}'),
  ('Chandigarh', 'chandigarh', 'Chandigarh', 'India', 'city', null,
   '{ambala,panchkula,mohali}',
   '{"Sector 17","Sector 22","Sector 35","Industrial Area Phase 1","Manimajra"}')
on conflict (slug) do nothing;