# Fix: Requirement → poster contact + AI chat

## Background (user report)
- "Jo bhi requirement post hai, us user se contact karao" — `/requirements` page loads, but cards show
  no poster name / phone / WhatsApp-Call buttons, so contacting the poster is impossible.
- "AI chat bot kyun nahi chal raha" — root cause: `GROQ_API_KEY` in `.env.local` is INVALID (Groq API
  returns 401 Invalid API Key). Offline DB-backed fallback (`src/lib/ai-fallback.ts`, wired in
  `src/app/api/chat/route.ts`) is already implemented and answers rent/sale/contact/favorites/post
  queries from live data.
- User chose: fix requirements FIRST. Provided key `sb_publishable_...` is the Supabase anon key, NOT a
  Groq key — cannot be used as GROQ_API_KEY. Keep offline fallback; real LLM deferred until a valid
  `gsk_` key is provided.

## Task 1 — Requirement poster contact
1. `src/lib/queries.ts` `fetchRequirements()`: add `contact_preference: row.contact_preference` to the
   mapped object (name/phone already included via `profile:profiles!requirements_user_id_fkey(name, phone)`).
2. `src/app/requirements/page.tsx`: `const user = await getAuthUser();` pass
   `isLoggedIn={Boolean(user)}` to `RequirementsBoard`.
3. `src/components/requirements/RequirementsBoard.tsx` (only consumer of the board):
   - Import `MessageCircle`, `Phone`, `User` (lucide), `whatsappLink`/`telLink`
     (`@/lib/whatsapp`), `Link` (next/link).
   - Add `isLoggedIn` prop (default `false`).
   - Card footer:
     - "Posted by {user_name || 'MeraGhar User'}"
     - if `status === "open"`:
       - logged in + `user_phone`: show phone row + WhatsApp/Call buttons per
         `contact_preference` (`whatsapp`/`both` → WhatsApp, `call`/`both` → Call), prefilled
         Hinglish message mirroring PropertyDetails.
       - logged in but no phone: fallback "Contact MeraGhar: 8950056231".
       - not logged in: "Login to contact" button → `/login?next=/requirements` (privacy-consistent
         with property owner contact).
4. Verify: `npm run lint`, `npm run build`, GET `/requirements` (logged-out → shows Login to
   contact; logged-in via demo user → WhatsApp/Call buttons).

## Task 2 — AI chat (deferred)
- Do NOT set `GROQ_API_KEY` to the Supabase anon key.
- Offline fallback stays active so the bot always replies.
- Once user provides a valid `gsk_` key: update `.env.local`, restart dev, POST /api/chat live test.

## Files
- `src/components/requirements/RequirementsBoard.tsx`
- `src/app/requirements/page.tsx`
- `src/lib/queries.ts`