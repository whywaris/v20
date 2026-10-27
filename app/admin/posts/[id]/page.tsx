import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { savePost } from "../../actions";

export const metadata: Metadata = { title: "Edit post", robots: { index: false } };

const input = "w-full rounded-md border bg-transparent px-3 py-2 text-sm";

// /admin/posts/new creates; /admin/posts/123 edits.
export default async function EditPostPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const supabase = await createClient();
  const isNew = id === "new";
  const { data: p } = isNew ? { data: null } : await supabase.from("posts").select("*").eq("id", Number(id)).maybeSingle();
  if (!isNew && !p) notFound();
  const { data: niches } = await supabase.from("niches").select("id, name").order("name");

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <nav className="text-sm text-neutral-500"><Link href="/admin/posts" className="hover:underline">Posts</Link> / {p?.title ?? "New"}</nav>
      {saved && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">Saved. {p && <Link href={`/blog/${p.slug}`} className="underline">View post</Link>}</p>}
      <form action={savePost} className="space-y-4">
        {p && <input type="hidden" name="id" value={p.id} />}
        <label className="block space-y-1 text-sm"><span className="font-medium">Title</span><input name="title" required defaultValue={p?.title} className={input} /></label>
        <label className="block space-y-1 text-sm"><span className="font-medium">URL slug (empty = from title)</span><input name="slug" defaultValue={p?.slug} className={input} /></label>
        <label className="block space-y-1 text-sm"><span className="font-medium">Meta description (≤160 chars)</span><input name="description" maxLength={160} defaultValue={p?.description ?? ""} className={input} /></label>
        <label className="block space-y-1 text-sm"><span className="font-medium">Cover image URL</span><input name="cover_url" type="url" defaultValue={p?.cover_url ?? ""} className={input} /></label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Related niche</span>
          <select name="niche_id" defaultValue={p?.niche_id ?? ""} className={input}>
            <option value="">None</option>
            {niches?.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Body (Markdown: ## heading, **bold**, [link](url), - list)</span>
          <textarea name="body_md" rows={22} defaultValue={p?.body_md ?? ""} className={`${input} font-mono`} />
        </label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="status" value="published" defaultChecked={p?.status === "published"} /> Published</label>
        <button className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">Save</button>
      </form>
    </main>
  );
}
