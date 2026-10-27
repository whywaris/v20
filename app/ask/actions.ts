"use server";

import { askLibrary, type AskAnswer } from "@/lib/ask";
import { createClient } from "@/lib/supabase/server";

export type AskState = { question: string; answer?: AskAnswer; error?: string; remaining?: number } | null;

export async function ask(_: AskState, formData: FormData): Promise<AskState> {
  const question = String(formData.get("q") ?? "").trim().slice(0, 500);
  if (question.length < 5) return { question, error: "Type a longer question." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { question, error: "Log in to ask questions." };

  // Uses one question from today's quota (3 free, 50 Pro) atomically in the database.
  const { data: remaining, error: quotaError } = await supabase.rpc("use_ai_quota");
  if (quotaError) return { question, error: "Could not check your question limit." };
  if (remaining < 0) return { question, error: "You've used today's questions. Pro gets 50 a day.", remaining: 0 };
  await supabase.from("ask_log").insert({ user_id: user.id, question });

  try {
    return { question, answer: await askLibrary(supabase, question), remaining };
  } catch (e) {
    console.error("ask failed", e);
    return { question, error: "Something went wrong answering that. Try rephrasing.", remaining };
  }
}
