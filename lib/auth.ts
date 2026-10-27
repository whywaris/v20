import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Viewer = {
  user: { id: string; email?: string } | null;
  plan: "free" | "pro";
  role: "user" | "editor" | "admin";
  isPro: boolean;
  isStaff: boolean;
};

// Who is looking at this page, read once per request.
export const getViewer = cache(async (): Promise<Viewer> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, plan: "free", role: "user", isPro: false, isStaff: false };
  const { data } = await supabase.from("profiles").select("plan, role").eq("id", user.id).single();
  const role = (data?.role ?? "user") as Viewer["role"];
  const isStaff = role === "admin" || role === "editor";
  const plan = (data?.plan ?? "free") as Viewer["plan"];
  return { user: { id: user.id, email: user.email }, plan, role, isPro: plan === "pro" || isStaff, isStaff };
});

// Throws unless the logged-in user is admin/editor. Call at the top of every admin server action.
export async function requireStaff() {
  const v = await getViewer();
  if (!v.user) throw new Error("Not logged in");
  if (!v.isStaff) throw new Error("Not allowed");
  return v.user;
}
