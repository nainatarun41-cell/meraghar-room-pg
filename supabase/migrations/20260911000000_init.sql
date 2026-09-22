-- ============================================================
-- MeraGhar - Initial schema, triggers, RLS policies and seed base
-- Run this in the Supabase SQL editor (or via `supabase db push`)
--
-- Order-safe version: tables are created first, then functions/
-- views/triggers (which query those tables), then RLS policies,
-- storage, and seed data. Safe to re-run (idempotent).
-- ============================================================

-- ------------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text not null default '',
  phone       text not null default '',
  avatar_url  text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

create table if not exists public.localities (
  id         uuid primary key default gen_random_uuid(),
  city       text not null,
  locality   text not null,
  created_at timestamptz not null default now(),
  constraint localities_city_locality_key unique (city, locality)
);

create index if not exists idx_localities_city on public.localities (city);

create table if not exists public.properties (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  slug            text,
  title           text not null,
  description     text not null default '',
  purpose         text not null check (purpose in ('rent', 'sale')),
  property_type   text not null check (
                    property_type in ('room', 'pg', '1 bhk', '2 bhk', '3 bhk',
                                      'flat', 'house', 'shop', 'office', 'plot', 'other')
                  ),
  city            text not null,
  locality        text not null default '',
  address         text not null default '',
  pincode         text not null default '',
  latitude        numeric(9,6),
  longitude       numeric(9,6),
  price           numeric(12,2) not null check (price >= 0),
  rent_period     text not null default 'monthly' check (
                    rent_period in ('monthly', 'quarterly', 'half_yearly', 'yearly', 'one_time')
                  ),
  security_deposit numeric(12,2),
  bhk             int check (bhk >= 0),
  bathrooms       int check (bathrooms >= 0),
  furnishing      text not null default 'unfurnished' check (
                    furnishing in ('fully_furnished', 'semi_furnished', 'unfurnished')
                  ),
  area_sqft       numeric(10,2),
  available_from  date,
  status          text not null default 'pending' check (
                    status in ('pending', 'approved', 'rejected', 'rented', 'sold')
                  ),
  is_verified     boolean not null default false,
  is_featured     boolean not null default false,
  featured_until  timestamptz,
  amenities       text[] not null default '{}',
  views           bigint not null default 0,
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_properties_city          on public.properties (city);
create index if not exists idx_properties_purpose       on public.properties (purpose);
create index if not exists idx_properties_type          on public.properties (property_type);
create index if not exists idx_properties_status        on public.properties (status);
create index if not exists idx_properties_owner         on public.properties (owner_id);
create index if not exists idx_properties_created       on public.properties (created_at desc);
create index if not exists idx_properties_featured      on public.properties (is_featured) where is_featured;
create unique index if not exists idx_properties_owner_slug on public.properties (owner_id, slug);

create table if not exists public.property_images (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references public.properties(id) on delete cascade,
  image_url     text not null,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists idx_property_images_property on public.property_images (property_id, display_order);

create table if not exists public.favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint favorites_user_property_key unique (user_id, property_id)
);

create index if not exists idx_favorites_user     on public.favorites (user_id);
create index if not exists idx_favorites_property on public.favorites (property_id);

create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  reported_by uuid not null references public.profiles(id) on delete cascade,
  reason      text not null,
  status      text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_reports_property on public.reports (property_id);
create index if not exists idx_reports_status   on public.reports (status);
create index if not exists idx_reports_by       on public.reports (reported_by);

create table if not exists public.requirements (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  title              text not null default '',
  city               text not null,
  locality           text not null default '',
  property_type      text not null,
  purpose            text not null check (purpose in ('rent', 'sale')),
  budget_min         numeric(12,2),
  budget_max         numeric(12,2),
  bhk                text not null default '',
  description        text not null default '',
  contact_preference text not null default 'both' check (contact_preference in ('call', 'whatsapp', 'both')),
  status             text not null default 'open' check (status in ('open', 'closed')),
  created_at         timestamptz not null default now()
);

create index if not exists idx_requirements_city on public.requirements (city);
create index if not exists idx_requirements_status on public.requirements (status);
create index if not exists idx_requirements_user on public.requirements (user_id);

-- ------------------------------------------------------------------
-- 2. FUNCTIONS, VIEWS AND TRIGGERS (tables already exist)
-- ------------------------------------------------------------------

-- Helper functions (security definer so RLS policies can use them)
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'anon'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- Public subset of owner info (name, phone, avatar only - never role/email internals)
create or replace view public.public_owners
with (security_invoker = true) as
select id, name, phone, avatar_url
from public.profiles;

-- Profile is auto-created when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sync profile email when auth email changes
create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email on auth.users
  for each row execute function public.sync_profile_email();

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger
language plpgsql as
$$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.touch_updated_at();

-- owner can manage their own properties (used by image policies)
create or replace function public.can_manage_property(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.properties
    where id = pid and owner_id = auth.uid()
  );
$$;

-- Small helper used by the details page to track listing views (admin client)
create or replace function public.increment_property_views(property_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.properties set views = views + 1 where id = property_id;
$$;

-- ------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ------------------------------------------------------------------

alter table public.profiles         enable row level security;
alter table public.localities       enable row level security;
alter table public.properties       enable row level security;
alter table public.property_images  enable row level security;
alter table public.favorites        enable row level security;
alter table public.reports          enable row level security;
alter table public.requirements     enable row level security;

-- ----- profiles -----
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
  );

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (public.is_admin());

-- extra safety: never let a regular user change their own role
revoke update (role) on public.profiles from authenticated;

-- ----- localities -----
drop policy if exists "localities_select_public" on public.localities;
create policy "localities_select_public"
  on public.localities for select
  using (true);

drop policy if exists "localities_write_admin" on public.localities;
create policy "localities_write_admin"
  on public.localities for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----- properties -----
drop policy if exists "properties_select_public" on public.properties;
create policy "properties_select_public"
  on public.properties for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "properties_select_owner" on public.properties;
create policy "properties_select_owner"
  on public.properties for select
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "properties_select_admin" on public.properties;
create policy "properties_select_admin"
  on public.properties for select
  to authenticated
  using (public.is_admin());

drop policy if exists "properties_insert_owner" on public.properties;
create policy "properties_insert_owner"
  on public.properties for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "properties_update_owner" on public.properties;
create policy "properties_update_owner"
  on public.properties for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "properties_update_admin" on public.properties;
create policy "properties_update_admin"
  on public.properties for update
  to authenticated
  using (public.is_admin());

drop policy if exists "properties_delete_owner" on public.properties;
create policy "properties_delete_owner"
  on public.properties for delete
  to authenticated
  using (owner_id = auth.uid());

drop policy if exists "properties_delete_admin" on public.properties;
create policy "properties_delete_admin"
  on public.properties for delete
  to authenticated
  using (public.is_admin());

-- ----- property_images -----
drop policy if exists "images_select_public" on public.property_images;
create policy "images_select_public"
  on public.property_images for select
  to anon, authenticated
  using (exists (
    select 1 from public.properties p
    where p.id = property_id and p.status = 'approved'
  ));

drop policy if exists "images_select_owner" on public.property_images;
create policy "images_select_owner"
  on public.property_images for select
  to authenticated
  using (exists (
    select 1 from public.properties p
    where p.id = property_id and p.owner_id = auth.uid()
  ));

drop policy if exists "images_select_admin" on public.property_images;
create policy "images_select_admin"
  on public.property_images for select
  to authenticated
  using (public.is_admin());

drop policy if exists "images_insert_owner" on public.property_images;
create policy "images_insert_owner"
  on public.property_images for insert
  to authenticated
  with check (public.can_manage_property(property_id));

drop policy if exists "images_delete_owner" on public.property_images;
create policy "images_delete_owner"
  on public.property_images for delete
  to authenticated
  using (public.can_manage_property(property_id));

drop policy if exists "images_admin_all" on public.property_images;
create policy "images_admin_all"
  on public.property_images for all
  to authenticated
  using (public.is_admin());

-- ----- favorites -----
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
  on public.favorites for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
  on public.favorites for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
  on public.favorites for delete
  to authenticated
  using (user_id = auth.uid());

-- ----- reports -----
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
  on public.reports for insert
  to authenticated
  with check (reported_by = auth.uid());

drop policy if exists "reports_select_admin" on public.reports;
create policy "reports_select_admin"
  on public.reports for select
  to authenticated
  using (public.is_admin());

drop policy if exists "reports_update_admin" on public.reports;
create policy "reports_update_admin"
  on public.reports for update
  to authenticated
  using (public.is_admin());

-- ----- requirements -----
drop policy if exists "requirements_select_open" on public.requirements;
create policy "requirements_select_open"
  on public.requirements for select
  to anon, authenticated
  using (status = 'open');

drop policy if exists "requirements_select_own" on public.requirements;
create policy "requirements_select_own"
  on public.requirements for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "requirements_insert_own" on public.requirements;
create policy "requirements_insert_own"
  on public.requirements for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "requirements_update_own" on public.requirements;
create policy "requirements_update_own"
  on public.requirements for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "requirements_delete_own" on public.requirements;
create policy "requirements_delete_own"
  on public.requirements for delete
  to authenticated
  using (user_id = auth.uid());

-- ------------------------------------------------------------------
-- 4. STORAGE: property-images bucket
-- ------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- anyone can view images in the public bucket
drop policy if exists "property_images_public_read" on storage.objects;
create policy "property_images_public_read"
  on storage.objects for select
  using (bucket_id = 'property-images');

-- authenticated users upload into their own folder: <user_id>/<file>
drop policy if exists "property_images_owner_write" on storage.objects;
create policy "property_images_owner_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- owners can delete their own uploads
drop policy if exists "property_images_owner_delete" on storage.objects;
create policy "property_images_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- admins can delete anything
drop policy if exists "property_images_admin_delete" on storage.objects;
create policy "property_images_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'property-images' and public.is_admin());

-- ------------------------------------------------------------------
-- 5. DEFAULT BASE LOCALITIES (can be extended by admins later)
-- ------------------------------------------------------------------

insert into public.localities (city, locality) values
  ('Kaithal', 'City Centre'),
  ('Kaithal', 'Pehowa Road'),
  ('Kaithal', 'Kurukshetra Road'),
  ('Kaithal', 'Guhla Road'),
  ('Kaithal', 'Division Chowk'),
  ('Kaithal', 'New Colony'),
  ('Kaithal', 'Old Market'),
  ('Pundri', 'Main Bazaar'),
  ('Pundri', 'Rajound Road'),
  ('Pundri', 'Bus Stand Road'),
  ('Pundri', 'Kaithal Road')
on conflict (city, locality) do nothing;