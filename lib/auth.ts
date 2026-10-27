import "server-only";
import { createClient } from "@/lib/supabase/server";

// Throws unless the logged-in user is admin/editor. Call at the top of every admin server action.
export async function requireStaff() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (data?.role !== "admin" && data?.role !== "editor") throw new Error("Not allowed");
  return user;
}
