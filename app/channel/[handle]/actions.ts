"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SaveState = { saved: boolean; message?: string };

// Runs as the user: RLS limits it to their own rows and the DB trigger caps free users at 10.
export async function toggleSave(prev: SaveState, formData: FormData): Promise<SaveState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ...prev, message: "Log in to save channels." };
  const channelId = Number(formData.get("channel_id"));

  if (prev.saved) {
    await supabase.from("saved_channels").delete().eq("user_id", user.id).eq("channel_id", channelId);
    revalidatePath("/saved");
    return { saved: false };
  }
  const { error } = await supabase.from("saved_channels").insert({ user_id: user.id, channel_id: channelId });
  if (error) return { saved: false, message: error.code === "P0001" ? error.message : "Could not save." };
  revalidatePath("/saved");
  return { saved: true };
}
