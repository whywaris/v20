-- Core schema for the YouTube niches platform.
-- Access tiers: public (anon) -> logged in (authenticated) -> pro (profiles.plan = 'pro').

create extension if not exists pg_trgm;

-- ---------- users ----------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  role text not null default 'user' check (role in ('user', 'editor', 'admin')),
  created_at timestamptz not null default now()
);

-- Create a profile row on every new sign-up (Google fills raw_user_meta_data).
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role/plan helpers used by policies. security definer avoids RLS recursion on profiles.
create function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'));
$$;

create function public.is_pro() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and (plan = 'pro' or role in ('admin', 'editor')));
$$;

-- ---------- catalog (public) ----------
create table public.niches (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  parent_id bigint references public.niches on delete set null,
  description text,
  seo_intro text,
  avg_rpm_band text,
  difficulty smallint check (difficulty between 1 and 5),
  is_indexable boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.channels (
  id bigint generated always as identity primary key,
  yt_channel_id text not null unique,
  handle text unique,
  title text not null,
  summary text,
  avatar_url text,
  country text,
  language text,
  created_at_yt timestamptz,
  is_faceless boolean,
  is_ai_avatar boolean,
  format text,
  subscribers bigint,
  total_views bigint,
  video_count integer,
  status text not null default 'active' check (status in ('active', 'hidden', 'removed')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);
create index channels_title_trgm on public.channels using gin (title gin_trgm_ops);
create index channels_subscribers on public.channels (subscribers desc);

create table public.channel_niches (
  channel_id bigint references public.channels on delete cascade,
  niche_id bigint references public.niches on delete cascade,
  is_primary boolean not null default false,
  primary key (channel_id, niche_id)
);
create index channel_niches_niche on public.channel_niches (niche_id);

create table public.videos (
  yt_video_id text primary key,
  channel_id bigint not null references public.channels on delete cascade,
  title text not null,
  published_at timestamptz,
  duration_seconds integer,
  views bigint,
  is_short boolean,
  thumbnail_url text
);
create index videos_channel_published on public.videos (channel_id, published_at desc);

-- ---------- gated: logged-in users ----------
create table public.channel_stats_daily (
  channel_id bigint references public.channels on delete cascade,
  date date not null,
  subscribers bigint,
  total_views bigint,
  video_count integer,
  primary key (channel_id, date)
);

create table public.channel_analysis (
  channel_id bigint primary key references public.channels on delete cascade,
  persona text,
  audience text,
  pillars text[],
  title_patterns text[],
  thumbnail_notes text,
  why_it_works text[],
  ai_tools_guess text[],
  updated_at timestamptz not null default now(),
  edited_by uuid references auth.users
);

create table public.offers (
  id bigint generated always as identity primary key,
  channel_id bigint not null references public.channels on delete cascade,
  type text,
  name text,
  price numeric(10, 2),
  currency text default 'USD',
  platform text,
  url text,
  evidence text,
  checked_at timestamptz
);
create index offers_channel on public.offers (channel_id);

create table public.funnels (
  channel_id bigint primary key references public.channels on delete cascade,
  steps jsonb not null default '[]',
  link_rate numeric(5, 2),
  notes text,
  checked_at timestamptz
);

-- ---------- user data ----------
create table public.saved_channels (
  user_id uuid references auth.users on delete cascade,
  channel_id bigint references public.channels on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, channel_id)
);

create table public.submissions (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete set null,
  channel_url text not null check (length(channel_url) <= 300),
  suggested_niche text check (length(suggested_niche) <= 100),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  email text primary key check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source text,
  created_at timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.niches enable row level security;
alter table public.channels enable row level security;
alter table public.channel_niches enable row level security;
alter table public.videos enable row level security;
alter table public.channel_stats_daily enable row level security;
alter table public.channel_analysis enable row level security;
alter table public.offers enable row level security;
alter table public.funnels enable row level security;
alter table public.saved_channels enable row level security;
alter table public.submissions enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- profiles: read/edit own row. Users may only change name/avatar; plan and role are staff-only.
create policy "own profile read" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "own profile update" on public.profiles for update using (id = auth.uid() or public.is_staff());
revoke update on public.profiles from authenticated, anon;
grant update (full_name, avatar_url) on public.profiles to authenticated;
-- ponytail: staff change plan/role via Supabase Studio or service role until the admin panel exists.

-- public catalog
create policy "public read" on public.niches for select using (true);
create policy "public read" on public.channels for select using (status = 'active' or public.is_staff());
create policy "public read" on public.channel_niches for select using (true);
create policy "public read" on public.videos for select using (true);

-- logged-in only (the Google login gate)
create policy "auth read" on public.channel_stats_daily for select to authenticated using (true);
create policy "auth read" on public.channel_analysis for select to authenticated using (true);
create policy "auth read" on public.offers for select to authenticated using (true);
create policy "auth read" on public.funnels for select to authenticated using (true);

-- staff write on catalog tables
create policy "staff write" on public.niches for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write" on public.channels for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write" on public.channel_niches for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write" on public.videos for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write" on public.channel_stats_daily for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write" on public.channel_analysis for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write" on public.offers for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write" on public.funnels for all using (public.is_staff()) with check (public.is_staff());

-- saved channels: own rows only
create policy "own saved" on public.saved_channels for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- submissions: logged-in users submit, staff review
create policy "submit" on public.submissions for insert to authenticated with check (user_id = auth.uid());
create policy "own or staff read" on public.submissions for select using (user_id = auth.uid() or public.is_staff());
create policy "staff update" on public.submissions for update using (public.is_staff());

-- newsletter: anyone can subscribe, only staff can read the list
create policy "subscribe" on public.newsletter_subscribers for insert with check (true);
create policy "staff read" on public.newsletter_subscribers for select using (public.is_staff());
