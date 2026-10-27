import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

async function signInWithGoogle(formData: FormData) {
  "use server";
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  const next = safeNext(formData.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?error=1");
  redirect(data.url);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">Log in to see full stats</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Growth charts, what each channel sells, and our full analysis. Free with Google.
        </p>
      </div>
      {error && <p className="text-sm text-red-600">Login failed. Please try again.</p>}
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={safeNext(next)} />
        <button className="w-full rounded-md border px-4 py-2.5 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900">
          Continue with Google
        </button>
      </form>
    </main>
  );
}
