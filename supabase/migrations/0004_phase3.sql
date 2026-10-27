-- Phase 3: billing, saved limits, AI quota, RPM, blog, affiliates, rate limits, outliers.
-- Safe to run more than once: everything checks whether it already exists.

-- ---------- growth fix: clear gains that no longer have a snapshot in the window ----------
create or replace function public.refresh_growth() returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.channels set subs_gain_30d = null, views_gain_30d = null, growth_days = null
  where subs_gain_30d is not null or growth_days is not null;

  update public.channels c set
    subs_gain_30d = c.subscribers - s.subscribers,
    views_gain_30d = c.total_views - s.total_views,
    growth_days = (current_date - s.date)
  from (
    select distinct on (channel_id) channel_id, subscribers, total_views, date
    from public.channel_stats_daily
    where date >= current_date - 30
    order by channel_id, date
  ) s
  where s.channel_id = c.id and s.date < current_date;
end $$;
revoke execute on function public.refresh_growth() from public, anon, authenticated;

-- ---------- billing (written only by the Lemon Squeezy webhook via service role) ----------
alter table public.profiles
  add column if not exists ls_subscription_id text,
  add column if not exists plan_status text,
  add column if not exists plan_renews_at timestamptz,
  add column if not exists portal_url text;

-- ---------- saved channels: free users keep up to 10 ----------
create or replace function public.enforce_saved_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_pro() and (select count(*) from public.saved_channels where user_id = new.user_id) >= 10 then
    raise exception 'Free plan can save up to 10 channels. Upgrade to Pro for unlimited.' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists saved_channels_limit on public.saved_channels;
create trigger saved_channels_limit before insert on public.saved_channels
  for each row execute function public.enforce_saved_limit();

-- ---------- AI "Ask" quota + log ----------
create table if not exists public.ai_usage (
  user_id uuid references auth.users on delete cascade,
  day date not null default current_date,
  count integer not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
drop policy if exists "own usage read" on public.ai_usage;
create policy "own usage read" on public.ai_usage for select using (user_id = auth.uid());

-- Atomically uses one question for the caller. Returns remaining questions today, or -1 when over the limit.
create or replace function public.use_ai_quota() returns integer
language plpgsql security definer set search_path = '' as $$
declare
  lim integer := case when public.is_pro() then 50 else 3 end;
  used integer;
begin
  if auth.uid() is null then return -1; end if;
  insert into public.ai_usage (user_id, day, count) values (auth.uid(), current_date, 1)
  on conflict (user_id, day) do update set count = public.ai_usage.count + 1
    where public.ai_usage.count < lim
  returning count into used;
  if used is null then return -1; end if;
  return lim - used;
end $$;
revoke execute on function public.use_ai_quota() from public, anon;
grant execute on function public.use_ai_quota() to authenticated;

create table if not exists public.ask_log (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete set null,
  question text not null check (length(question) <= 500),
  created_at timestamptz not null default now()
);
alter table public.ask_log enable row level security;
drop policy if exists "own insert" on public.ask_log;
create policy "own insert" on public.ask_log for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "staff read" on public.ask_log;
create policy "staff read" on public.ask_log for select using (public.is_staff());

-- ---------- RPM estimates per niche (USD per 1,000 views, editable in Studio) ----------
alter table public.niches add column if not exists rpm_low numeric(6, 2), add column if not exists rpm_high numeric(6, 2);
-- Only fills niches that have no RPM yet, so your own edits survive a re-run.
update public.niches n set rpm_low = v.lo, rpm_high = v.hi from (values
  ('personal-finance', 8, 20), ('crypto', 6, 15), ('real-estate', 8, 18), ('make-money-online', 6, 15),
  ('retirement', 6, 14), ('tech', 4, 10), ('luxury', 4, 10), ('health', 4, 10), ('cars', 3, 8),
  ('education', 3, 8), ('homesteading', 3, 8), ('ai-avatar', 2, 8), ('true-crime', 3, 7), ('gardening', 3, 7),
  ('space-science', 3, 7), ('psychology', 3, 7), ('history', 2, 6), ('stoicism', 2, 6), ('cooking', 2, 6),
  ('cleaning', 2, 6), ('travel', 2, 6), ('motivation', 2, 5), ('religion', 2, 5), ('news-commentary', 2, 5),
  ('gaming', 1, 4), ('sports', 1, 4), ('animals', 1, 4), ('asmr-sleep', 1, 3), ('kids', 0.5, 2), ('music', 0.5, 2)
) as v(slug, lo, hi) where n.slug = v.slug and n.rpm_low is null;

-- ---------- blog ----------
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  slug text not null unique,
  title text not null,
  description text,
  body_md text not null default '',
  cover_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  niche_id bigint references public.niches on delete set null,
  author_id uuid references auth.users on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.posts enable row level security;
drop policy if exists "public read published" on public.posts;
create policy "public read published" on public.posts for select using (status = 'published' or public.is_staff());
drop policy if exists "staff write" on public.posts;
create policy "staff write" on public.posts for all using (public.is_staff()) with check (public.is_staff());

-- ---------- affiliate tools (edit url/active in Studio) ----------
create table if not exists public.affiliate_tools (
  id bigint generated always as identity primary key,
  name text not null,
  url text not null,
  blurb text,
  tags text[] not null default '{all}',
  active boolean not null default false
);
alter table public.affiliate_tools enable row level security;
drop policy if exists "public read active" on public.affiliate_tools;
create policy "public read active" on public.affiliate_tools for select using (active or public.is_staff());
drop policy if exists "staff write" on public.affiliate_tools;
create policy "staff write" on public.affiliate_tools for all using (public.is_staff()) with check (public.is_staff());
-- Placeholders (only added once): replace url with your affiliate link, then set active = true.
insert into public.affiliate_tools (name, url, blurb, tags)
select * from (values
  ('HeyGen', 'https://www.heygen.com', 'Realistic AI avatars that read your script on camera.', '{ai_avatar}'::text[]),
  ('ElevenLabs', 'https://elevenlabs.io', 'Natural AI voiceovers in many languages.', '{faceless,ai_avatar}'),
  ('InVideo AI', 'https://invideo.io', 'Turn a script into a stock-footage video.', '{faceless}'),
  ('vidIQ', 'https://vidiq.com', 'Keyword research and title ideas for YouTube.', '{all}'),
  ('Canva', 'https://www.canva.com', 'Design thumbnails with templates.', '{all}')
) as t(name, url, blurb, tags)
where not exists (select 1 from public.affiliate_tools);

-- ---------- rate limits for public tools ----------
create table if not exists public.rate_limits (
  key text not null,
  day date not null default current_date,
  count integer not null default 0,
  primary key (key, day)
);
alter table public.rate_limits enable row level security; -- no policies: service role only

create or replace function public.hit_rate_limit(p_key text, p_max integer) returns boolean
language plpgsql security definer set search_path = '' as $$
declare used integer;
begin
  insert into public.rate_limits (key, day, count) values (p_key, current_date, 1)
  on conflict (key, day) do update set count = public.rate_limits.count + 1
  returning count into used;
  return used <= p_max;
end $$;
revoke execute on function public.hit_rate_limit(text, integer) from public, anon, authenticated;

-- ---------- outlier videos: views vs the channel's median recent views ----------
drop view if exists public.video_outliers;
create view public.video_outliers with (security_invoker = true) as
select v.yt_video_id, v.title, v.views, v.published_at, v.thumbnail_url, v.duration_seconds, v.is_short,
       v.channel_id, c.handle, c.title as channel_title, c.subscribers, m.median_views,
       round(v.views::numeric / nullif(m.median_views, 0)::numeric, 1) as ratio
from public.videos v
join public.channels c on c.id = v.channel_id and c.status = 'active'
join (
  select channel_id, percentile_cont(0.5) within group (order by views) as median_views
  from public.videos group by channel_id
) m on m.channel_id = v.channel_id;
grant select on public.video_outliers to anon, authenticated;

-- ---------- per-niche numbers for the niche finder and RPM pages ----------
-- Runs with owner rights on purpose: it exposes only aggregates (e.g. % of channels selling),
-- never the login-gated offer rows themselves.
drop view if exists public.niche_stats;
create view public.niche_stats as
select n.id, n.slug, n.name, n.description, n.rpm_low, n.rpm_high, n.is_indexable,
       count(c.id) as channels,
       percentile_cont(0.5) within group (order by c.subscribers) as median_subs,
       round(avg(c.subs_gain_30d)) as avg_subs_gain,
       sum(coalesce(c.views_gain_30d, 0)) as views_30d,
       round(100.0 * count(c.id) filter (where exists (select 1 from public.offers o where o.channel_id = c.id)) / nullif(count(c.id), 0)) as pct_selling
from public.niches n
left join public.channel_niches cn on cn.niche_id = n.id
left join public.channels c on c.id = cn.channel_id and c.status = 'active'
group by n.id;
grant select on public.niche_stats to anon, authenticated;

-- Tell the API to pick up the new tables and views right away.
notify pgrst, 'reload schema';
