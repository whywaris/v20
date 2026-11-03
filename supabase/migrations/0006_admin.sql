-- Admin v2: live channel/niche edits, contact inbox and channel submissions. Safe to run more than once.

-- ---------- channel / niche edits made in /admin ----------
-- The JSON files in data/ stay the base catalog; a row here changes (data), hides (hidden) or adds an item.
create table if not exists public.content_overrides (
  kind text not null check (kind in ('channel', 'niche')),
  key text not null check (length(key) between 1 and 200),
  data jsonb not null default '{}'::jsonb,
  hidden boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users on delete set null,
  primary key (kind, key)
);
alter table public.content_overrides enable row level security;
-- Public catalog data, so anyone may read it. Writes go through the service role only (no write policy).
drop policy if exists "content_overrides are public" on public.content_overrides;
create policy "content_overrides are public" on public.content_overrides for select using (true);

-- ---------- contact form ----------
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  name text not null check (length(name) between 1 and 120),
  email text not null check (length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject text check (length(subject) <= 200),
  body text not null check (length(body) between 1 and 5000),
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security; -- no policies: service role only

-- ---------- "suggest a channel" ----------
create table if not exists public.submissions (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete set null,
  channel_url text not null check (length(channel_url) <= 300),
  suggested_niche text check (length(suggested_niche) <= 100),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
alter table public.submissions add column if not exists email text check (length(email) <= 200);
alter table public.submissions add column if not exists note text check (length(note) <= 1000);
alter table public.submissions enable row level security;
-- Older policies from 0001 let signed-in users insert directly; the API route uses the service role instead.
drop policy if exists "submit" on public.submissions;

notify pgrst, 'reload schema';
