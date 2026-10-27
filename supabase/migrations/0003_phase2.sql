-- Phase 2: public growth numbers, AI tagline, link/funnel details.

-- Public: shown on cards and the fastest-growing pages. Full daily history stays login-gated.
alter table public.channels
  add column tagline text,
  add column subs_gain_30d bigint,
  add column views_gain_30d bigint,
  add column growth_days smallint,
  add column analyzed_at timestamptz;
create index channels_subs_gain on public.channels (subs_gain_30d desc nulls last);

alter table public.channel_analysis
  add column niche_summary text,
  add column format text;

-- Every outbound link we found: [{url, domain, kind, platform, source, count}]
alter table public.funnels add column links jsonb not null default '[]';

-- Gain since the oldest snapshot in the last 30 days. Called by the daily sync (service role only).
create function public.refresh_growth() returns void
language sql security definer set search_path = '' as $$
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
$$;
revoke execute on function public.refresh_growth() from public, anon, authenticated;
