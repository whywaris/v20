"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { analyzeBatch, countUnanalyzed } from "@/lib/analyze";
import { requireStaff } from "@/lib/auth";
import { chunk, mapPool } from "@/lib/pool";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncAll, syncChannels } from "@/lib/sync";
import { parseChannelInput, resolveChannel } from "@/lib/youtube";

export type ActionState = { message: string } | null;

// One channel URL/@handle/id per line (up to 500), all tagged with the chosen niche.
export async function addChannels(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const deadline = Date.now() + 240_000;
  const input = lines(formData.get("channels")).slice(0, 500);
  const nicheId = Number(formData.get("niche_id")) || null;

  const resolved = await mapPool(input, 5, async (line) => {
    const ref = parseChannelInput(line);
    return ref ? resolveChannel(ref) : null;
  });
  const found = resolved.flatMap((r) => ("ok" in r && r.ok && r.value ? [r.value] : []));
  const failed = input.filter((_, i) => { const r = resolved[i]; return !("ok" in r && r.ok && r.value); });

  const db = createAdminClient();
  const { ids, videosSkipped } = await syncChannels(db, found, () => true, deadline);
  if (nicheId && ids.length) {
    for (const part of chunk(ids, 500)) {
      await db.from("channel_niches").upsert(
        part.map((channel_id) => ({ channel_id, niche_id: nicheId, is_primary: true })),
        { onConflict: "channel_id,niche_id", ignoreDuplicates: true },
      );
    }
  }
  revalidatePath("/", "layout");
  return {
    message: `Added ${ids.length}.` +
      (videosSkipped ? ` Videos for ${videosSkipped} will load in the daily sync.` : "") +
      (failed.length ? ` Not found (${failed.length}): ${failed.slice(0, 20).join(", ")}${failed.length > 20 ? "…" : ""}` : "") +
      " Next: Run AI analysis.",
  };
}

export async function addNiche(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const name = String(formData.get("name") ?? "").trim();
  const slug = name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) return { message: "Name is required." };
  const { error } = await createAdminClient().from("niches").insert({
    name,
    slug,
    parent_id: Number(formData.get("parent_id")) || null,
    description: String(formData.get("description") ?? "").trim() || null,
  });
  revalidatePath("/admin");
  return { message: error ? error.message : `Niche "${name}" added (/niche/${slug}).` };
}

// One @handle, or empty: as many unanalyzed/oldest channels as fit in ~4 minutes. Click again for more.
export async function runAnalysis(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const handle = String(formData.get("handle") ?? "").trim();
  const db = createAdminClient();
  const results = await analyzeBatch(db, 300, handle || undefined, Date.now() + 240_000);
  revalidatePath("/", "layout");
  const failed = results.filter((r) => !r.ok);
  const remaining = await countUnanalyzed(db);
  return {
    message: `Analyzed ${results.length - failed.length}.` +
      (failed.length ? ` Failed: ${failed.slice(0, 5).map((f) => `${f.handle} (${f.error})`).join("; ")}` : "") +
      (remaining ? ` ${remaining} never analyzed yet: click again.` : " All channels analyzed."),
  };
}

const lines = (v: FormDataEntryValue | null) => String(v ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const text = (v: FormDataEntryValue | null) => String(v ?? "").trim() || null;

// Manual corrections to a channel and its AI analysis (from /admin/channel/[handle]).
export async function updateChannel(formData: FormData) {
  const user = await requireStaff();
  const id = Number(formData.get("id"));
  const handle = String(formData.get("handle"));
  const db = createAdminClient();
  const nicheIds = formData.getAll("niche_ids").map(Number).filter(Boolean);

  const results = await Promise.all([
    db.from("channels").update({
      tagline: text(formData.get("tagline")),
      status: formData.get("status") === "hidden" ? "hidden" : "active",
      is_faceless: formData.get("is_faceless") === "on",
      is_ai_avatar: formData.get("is_ai_avatar") === "on",
      format: text(formData.get("format")),
    }).eq("id", id),
    db.from("channel_analysis").upsert({
      channel_id: id,
      niche_summary: text(formData.get("niche_summary")),
      persona: text(formData.get("persona")),
      audience: text(formData.get("audience")),
      format: text(formData.get("format")),
      thumbnail_notes: text(formData.get("thumbnail_notes")),
      pillars: lines(formData.get("pillars")),
      title_patterns: lines(formData.get("title_patterns")),
      why_it_works: lines(formData.get("why_it_works")),
      updated_at: new Date().toISOString(),
      edited_by: user.id,
    }),
    db.from("channel_niches").delete().eq("channel_id", id),
  ]);
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;
  if (nicheIds.length) {
    const { error } = await db.from("channel_niches").insert(nicheIds.map((niche_id, i) => ({ channel_id: id, niche_id, is_primary: i === 0 })));
    if (error) throw error;
  }
  revalidatePath("/", "layout");
  redirect(`/admin/channel/${handle}?saved=1`);
}

const slugify = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Create (no id) or update a blog post.
export async function savePost(formData: FormData) {
  const user = await requireStaff();
  const id = Number(formData.get("id")) || null;
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") || title));
  if (!title || !slug) throw new Error("Title is required");
  const publish = formData.get("status") === "published";
  const db = createAdminClient();
  const { data: existing } = id ? await db.from("posts").select("published_at").eq("id", id).single() : { data: null };

  const row = {
    title, slug,
    description: text(formData.get("description")),
    cover_url: text(formData.get("cover_url")),
    body_md: String(formData.get("body_md") ?? ""),
    niche_id: Number(formData.get("niche_id")) || null,
    status: publish ? "published" : "draft",
    published_at: publish ? existing?.published_at ?? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = id
    ? await db.from("posts").update(row).eq("id", id).select("id").single()
    : await db.from("posts").insert({ ...row, author_id: user.id }).select("id").single();
  if (error) throw error;
  revalidatePath("/blog", "layout");
  redirect(`/admin/posts/${data.id}?saved=1`);
}

export async function runSync(): Promise<ActionState> {
  await requireStaff();
  const r = await syncAll(createAdminClient());
  revalidatePath("/", "layout");
  return { message: `Synced ${r.synced} channels, ${r.removed} marked removed. Videos refreshed for ${r.videosRefreshed}${r.videosSkipped ? ` (${r.videosSkipped} left for tomorrow)` : ""}.` };
}
