# MeraGhar — Property Marketplace (Kaithal & Pundri)

A modern, responsive property marketplace built with Next.js 16, TypeScript, Tailwind CSS v4, and Supabase. Owners list their rooms, PGs, flats, houses, shops, and plots. Buyers and tenants search, filter, save, and contact owners directly via WhatsApp or phone.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.3.4 (App Router, Server Components, Server Actions) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"` + `@theme inline`) |
| Database + Auth | Supabase (PostgreSQL, RLS, Auth, Storage) |
| Icons | Lucide React |
| Hosting | Vercel |

## Features included

- Home page with hero, popular localities, featured/latest/rent/sale sections, WhatsApp CTA
- Public listings page with filters (city, locality, purpose, type, price, BHK, furnishing, available immediately, verified only, sort), grid/list toggle, and pagination
- Property detail page with image gallery, owner card, WhatsApp/Call/Contact buttons, report modal, map embed (latitude/longitude), related properties, view counter
- Login, sign up, forgot password, update password (via Supabase Auth email flow)
- Dashboard — manage my properties (edit, delete, mark rented/sold), saved properties, requirements, profile update, security (change password + logout)
- Post requirement form — buyers state exactly what they want; requirements board lists them publicly
- Admin section (admin role only):
  - Overview stats
  - Property management: approve / reject / verify / feature / unfeature / delete
  - User management: view all users, toggle admin role
  - Reports management: resolve or dismiss
  - Localities management: add / remove localities used in filters and popular locations
- SEO: dynamic sitemap.xml and robots.txt, proper metadata on all pages, open graph tags, 404 and error boundaries, loading state
- Graceful degradation: app builds and runs without any Supabase env vars (empty states shown instead of crashing)
- Light theme optimized for South Asian audiences: teal + amber palette, INR formatting, Hindi hero tagline

## Project structure (key files)

```
src/
├── app/
│   ├── (auth)/login, signup, forgot-password, update-password
│   ├── admin/ (layout + pages: dashboard, properties, users, reports, localities)
│   ├── add-property/
│   ├── dashboard/
│   ├── edit-property/[id]/
│   ├── favorites/
│   ├── post-requirement/
│   ├── properties/[city]/[slug]/page.tsx   (SEO redirect to canonical /properties/[id])
│   ├── properties/[id]/page.tsx            (detail page)
│   ├── properties/page.tsx                 (listing page)
│   ├── requirements/
│   ├── auth/callback/route.ts             (OAuth / magic link callback)
│   ├── sitemap.ts, robots.ts
│   ├── layout.tsx, globals.css, not-found.tsx, loading.tsx, error.tsx
│   └── page.tsx (home)
├── components/ (ui, Header, Footer, PropertyCard, PropertyFilters, ImageGallery, PropertyForm, PropertyDetails, SearchBar, Toast, SaveButton, ReportModal, Pagination, auth/*, admin/*, dashboard/*, requirements/*)
├── lib/
│   ├── actions/ (auth, property, favorite, report, profile, requirement, admin)
│   ├── admin-queries.ts
│   ├── auth.ts (getAuthUser, requireUser, requireAdmin)
│   ├── queries.ts (public property fetching helpers)
│   ├── env.ts
│   ├── supabase/server.ts, client.ts
│   ├── validation.ts, constants.ts, utils.ts, whatsapp.ts
├── types/ (database.ts, index.ts)
├── proxy.ts  (Next 16 session-refresh + route protection)
supabase/migrations/
scripts/ (seed.mjs, create-admin.mjs)
```

## Setup instructions

### 1. Clone and install

```bash
git clone <repo-url>
cd meraghar
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note the **Project URL** and **anon/public key** from Settings → API.
3. Note the **service_role key** from Settings → API (⚠️ keep this secret, never expose to frontend).

### 3. Run the database migration

In the Supabase SQL editor, paste and run the contents of:

```
supabase/migrations/20260911000000_init.sql
```

This creates:
- Tables: `profiles`, `localities`, `properties`, `property_images`, `favorites`, `reports`, `requirements`
- Triggers for auto-creating profiles on signup
- Row Level Security policies for anon/authenticated/admin access
- Storage bucket `property-images` with upload policies
- Functions: `current_user_role()`, `is_admin()`, `can_manage_property()`, `increment_property_views()`
- View: `public_owners` (safe public view of owner data)

### 4. Create `.env.local`

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Optional:
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

### 5. Seed demo data

```bash
node --env-file=.env.local scripts/seed.mjs
```

This creates:
- Admin: `admin@meraghar.in` / `MeraGhar@2026`
- Owner: `kaithal.owner@meraghar.in` / `MeraGhar@2026`
- Owner: `pundri.owner@meraghar.in` / `MeraGhar@2026`
- 16 demo properties across Kaithal and Pundri
- 3 sample requirements

Demo properties use placeholder SVG images in `public/demo/`.

To reset demo data: `node --env-file=.env.local scripts/seed.mjs --clean`

### 6. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

## Making a user admin

### Option A — Seed script (recommended)
If you already have a user, the seed script updates the existing user's role:
```bash
node --env-file=.env.local scripts/seed.mjs
```

### Option B — SQL
Run in Supabase SQL editor:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### Option C — Create-admin script (requires existing confirmed user)
```bash
node --env-file=.env.local scripts/create-admin.mjs your@email.com
```

## Deploy to Vercel

```bash
npx vercel --prod
```

In Vercel project settings, add the same environment variables from `.env.local`.

`NEXT_PUBLIC_SITE_URL` should be your production URL (e.g. `https://meraghar.vercel.app`).

The app builds successfully without any env vars configured (empty states shown).

## Google Maps

The property detail page embeds a Google Maps iframe when latitude/longitude are set on a property (no API key needed for the embed).

To use the full Google Maps JavaScript API (e.g. for a map picker in the property form), set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in your environment.

## Roadmap / Monetization ideas

- Featured listing promotions (pay-per-listing or subscription)
- Premium verification badge
- Lead capture forms with pay-per-lead
- SMS/WhatsApp notification integrations for new matching listings
- Rent collection integration
- Analytics dashboard for property owners

## License

MIT