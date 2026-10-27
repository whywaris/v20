"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseChannelInput, resolveChannel } from "@/lib/youtube";

export type CheckState = {
  input: string;
  error?: string;
  result?: { title: string; handle: string | null; avatar: string | null; subscribers: number | null; views: number; videos: number; created: string; country: string | null; trackedHandle: string | null };
} | null;

const PER_DAY = 20;

// Public tool: rate-limited per (hashed) IP because every check spends YouTube quota.
export async function checkChannel(_: CheckState, formData: FormData): Promise<CheckState> {
  const input = String(formData.get("channel") ?? "").trim().slice(0, 300);
  const ref = parseChannelInput(input);
  if (!ref) return { input, error: "Paste a channel link like youtube.com/@name, an @handle or a UC… id." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const key = `stats:${createHash("sha256").update(ip).digest("hex").slice(0, 32)}`;
  const db = createAdminClient();
  const { data: allowed } = await db.rpc("hit_rate_limit", { p_key: key, p_max: PER_DAY });
  if (!allowed) return { input, error: `Limit reached (${PER_DAY} checks a day). Try again tomorrow.` };

  const c = await resolveChannel(ref).catch(() => null);
  if (!c) return { input, error: "We couldn't find that channel." };

  const { data: tracked } = await db.from("channels").select("handle").eq("yt_channel_id", c.id).eq("status", "active").maybeSingle();
  if (!tracked) {
    // Untracked channels go to the admin review queue, once.
    const { count } = await db.from("submissions").select("*", { count: "exact", head: true }).eq("channel_url", `https://www.youtube.com/channel/${c.id}`);
    if (!count) await db.from("submissions").insert({ channel_url: `https://www.youtube.com/channel/${c.id}` });
  }

  return {
    input,
    result: {
      title: c.snippet.title,
      handle: c.snippet.customUrl ?? null,
      avatar: c.snippet.thumbnails.default?.url ?? null,
      subscribers: c.statistics.subscriberCount ? Number(c.statistics.subscriberCount) : null,
      views: Number(c.statistics.viewCount),
      videos: Number(c.statistics.videoCount),
      created: c.snippet.publishedAt.slice(0, 10),
      country: c.snippet.country ?? null,
      trackedHandle: tracked?.handle ?? null,
    },
  };
}
