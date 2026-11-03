-- Blog v2: SEO fields on posts and a public bucket for images uploaded in /admin/blog. Safe to run more than once.

alter table public.posts add column if not exists seo_title text check (length(seo_title) <= 70);
alter table public.posts add column if not exists seo_description text check (length(seo_description) <= 170);

-- Images are uploaded by the admin API with the service role; anyone can view them through the public URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

notify pgrst, 'reload schema';
