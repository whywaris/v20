# YouTube Niches Library

Next.js 15 + Supabase. Phase 0: schema, RLS, Google login.

## Setup
1. Create a Supabase project. In the SQL editor, run `supabase/migrations/0001_init.sql`.
2. Google Cloud Console → APIs & Services → Credentials → OAuth client (Web).
   Authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`.
3. Supabase → Authentication → Providers → Google: paste the client ID and secret.
   Authentication → URL Configuration: Site URL `http://localhost:3000`; add `http://localhost:3000/auth/callback` (and your production URL) to Redirect URLs.
4. Copy `.env.example` to `.env.local` and fill it in.
5. `npm run dev`, open http://localhost:3000, and log in with Google.
6. Make yourself admin (SQL editor): `update profiles set role = 'admin' where email = 'you@gmail.com';`

## Phase 1: data
- `supabase/migrations/0002_seed_niches.sql` loads 30 starter niches (safe to re-run).
- `/admin` (admin/editor only): paste channel URLs or @handles (one per line, up to 100), pick a niche, add. Also: add niches, "Sync all now".
- Daily sync: `vercel.json` cron calls `/api/cron/sync` at 03:00 UTC with `Authorization: Bearer $CRON_SECRET`. It refreshes every channel, stores one `channel_stats_daily` row per channel per day, pulls the latest 10 videos, and marks channels YouTube no longer returns as `removed`.
  Manual run: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/sync`
- Quota: about 1 unit per 50 channels + 2 units per channel for videos. The free 10k/day covers ~4,000 channels.
- Pages: `/` (search, niche filter, sort; 12 channels when logged out), `/channel/[handle]`, `/niche/[slug]` (noindex under 5 channels), `/niches`, `/sitemap.xml`, `/robots.txt`.

## Access tiers (enforced by RLS)
- Anyone: `niches`, `channels`, `channel_niches`, `videos`
- Logged in: `channel_stats_daily`, `channel_analysis`, `offers`, `funnels`
- Staff (`role` admin/editor): write everything, read submissions and newsletter
- Users can only change their own name/avatar, never `plan` or `role`

## Checks
`node --test lib/*.test.ts`: login redirects can't point to another domain; YouTube URL/handle and duration parsing.
Don't run `npm run build` while `npm run dev` is running: both write to `.next` and the dev server breaks.
