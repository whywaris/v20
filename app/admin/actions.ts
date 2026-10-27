"use server";

import { revalidatePath } from "next/cache";
import { analyzeBatch } from "@/lib/analyze";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncAll, syncChannels } from "@/lib/sync";
import { parseChannelInput, resolveChannel, type YtChannel } from "@/lib/youtube";

export type ActionState = { message: string } | null;

// One channel URL/@handle/id per line, all tagged with the chosen niche.
export async function addChannels(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const lines = String(formData.get("channels") ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 100);
  const nicheId = Number(formData.get("niche_id")) || null;

  const found: YtChannel[] = [];
  const failed: string[] = [];
  for (const line of lines) {
    const ref = parseChannelInput(line);
    const channel = ref ? await resolveChannel(ref).catch(() => null) : null;
    if (channel) found.push(channel);
    else failed.push(line);
  }

  const db = createAdminClient();
  const ids = await syncChannels(db, found);
  if (nicheId && ids.length) {
    await db.from("channel_niches").upsert(
      ids.map((channel_id) => ({ channel_id, niche_id: nicheId, is_primary: true })),
      { onConflict: "channel_id,niche_id" },
    );
  }
  revalidatePath("/", "layout");
  return { message: `Added ${ids.length}.${failed.length ? ` Not found: ${failed.join(", ")}` : ""}` };
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

// One @handle, or empty for the 10 least recently analyzed channels.
export async function runAnalysis(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const handle = String(formData.get("handle") ?? "").trim();
  const results = await analyzeBatch(createAdminClient(), 10, handle || undefined);
  revalidatePath("/", "layout");
  const failed = results.filter((r) => !r.ok);
  return { message: `Analyzed ${results.length - failed.length}.${failed.length ? ` Failed: ${failed.map((f) => `${f.handle} (${f.error})`).join("; ")}` : ""}` };
}

export async function runSync(): Promise<ActionState> {
  await requireStaff();
  const r = await syncAll(createAdminClient());
  revalidatePath("/", "layout");
  return { message: `Synced ${r.synced} channels, ${r.removed} marked removed.` };
}
