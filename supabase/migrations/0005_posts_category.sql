-- Blog posts written in /admin: add a category. Safe to run more than once.
alter table public.posts add column if not exists category text;

-- Tell the API to pick up the new column right away.
notify pgrst, 'reload schema';
