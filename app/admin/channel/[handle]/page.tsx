import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateChannel } from "../../actions";

export const metadata: Metadata = { title: "Edit channel", robots: { index: false } };

const input = "w-full rounded-md border bg-transparent px-3 py-2 text-sm";
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block space-y-1 text-sm"><span className="font-medium">{label}</span>{children}</label>
);

export default async function EditChannelPage({ params, searchParams }: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { handle } = await params;
  const { saved } = await searchParams;
  const supabase = await createClient();
  const { data: c } = await supabase.from("channels").select("*").eq("handle", handle).maybeSingle();
  if (!c) notFound();
  const [{ data: a }, { data: niches }, { data: tagged }] = await Promise.all([
    supabase.from("channel_analysis").select("*").eq("channel_id", c.id).maybeSingle(),
    supabase.from("niches").select("id, name").order("name"),
    supabase.from("channel_niches").select("niche_id, is_primary").eq("channel_id", c.id).order("is_primary", { ascending: false }),
  ]);
  const taggedIds = new Set(tagged?.map((t) => t.niche_id));

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <nav className="text-sm text-neutral-500"><Link href="/admin" className="hover:underline">Admin</Link> / {c.title}</nav>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{c.title}</h1>
        <Link href={`/channel/${c.handle}`} className="text-sm underline">View page</Link>
      </div>
      {saved && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">Saved.</p>}

      <form action={updateChannel} className="space-y-5">
        <input type="hidden" name="id" value={c.id} />
        <input type="hidden" name="handle" value={c.handle} />

        <Field label="Tagline"><input name="tagline" defaultValue={c.tagline ?? ""} maxLength={80} className={input} /></Field>

        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="is_ai_avatar" defaultChecked={!!c.is_ai_avatar} /> AI avatar</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="is_faceless" defaultChecked={!!c.is_faceless} /> Faceless</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="status" value="hidden" defaultChecked={c.status === "hidden"} /> Hidden from site</label>
        </div>

        <fieldset className="text-sm">
          <legend className="mb-2 font-medium">Niches (first checked = primary)</legend>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {niches?.map((n) => (
              <label key={n.id} className="flex items-center gap-2"><input type="checkbox" name="niche_ids" value={n.id} defaultChecked={taggedIds.has(n.id)} /> {n.name}</label>
            ))}
          </div>
        </fieldset>

        <Field label="Niche summary"><input name="niche_summary" defaultValue={a?.niche_summary ?? ""} className={input} /></Field>
        <Field label="Persona"><input name="persona" defaultValue={a?.persona ?? ""} className={input} /></Field>
        <Field label="Audience"><textarea name="audience" rows={2} defaultValue={a?.audience ?? ""} className={input} /></Field>
        <Field label="Format"><input name="format" defaultValue={a?.format ?? c.format ?? ""} className={input} /></Field>
        <Field label="Thumbnails"><textarea name="thumbnail_notes" rows={2} defaultValue={a?.thumbnail_notes ?? ""} className={input} /></Field>
        <Field label="Content pillars (one per line)"><textarea name="pillars" rows={4} defaultValue={a?.pillars?.join("\n") ?? ""} className={input} /></Field>
        <Field label="Title patterns (one per line)"><textarea name="title_patterns" rows={4} defaultValue={a?.title_patterns?.join("\n") ?? ""} className={`${input} font-mono`} /></Field>
        <Field label="Why it works (one per line)"><textarea name="why_it_works" rows={5} defaultValue={a?.why_it_works?.join("\n") ?? ""} className={input} /></Field>

        <button className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">Save</button>
      </form>
      <p className="text-xs text-neutral-500">Running AI analysis again for this channel overwrites these fields.</p>
    </main>
  );
}
