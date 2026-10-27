import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Posts", robots: { index: false } };

export default async function AdminPostsPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase.from("posts").select("id, slug, title, status, updated_at").order("updated_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <nav className="text-sm text-neutral-500"><Link href="/admin" className="hover:underline">Admin</Link> / Posts</nav>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog posts</h1>
        <Link href="/admin/posts/new" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">New post</Link>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="text-neutral-500"><tr><th className="py-2">Title</th><th>Status</th><th>Updated</th></tr></thead>
        <tbody>
          {posts?.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="py-2"><Link href={`/admin/posts/${p.id}`} className="hover:underline">{p.title}</Link></td>
              <td>{p.status}</td>
              <td>{new Date(p.updated_at).toISOString().slice(0, 10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!posts?.length && <p className="text-neutral-500">No posts yet.</p>}
    </main>
  );
}
