import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountPage() {
  const v = await getViewer();
  if (!v.user) redirect("/login?next=/account");
  const supabase = await createClient();
  const [{ data: p }, { count: saved }, { data: usage }] = await Promise.all([
    supabase.from("profiles").select("plan, plan_status, plan_renews_at, portal_url").eq("id", v.user.id).single(),
    supabase.from("saved_channels").select("*", { count: "exact", head: true }),
    supabase.from("ai_usage").select("count").eq("day", new Date().toISOString().slice(0, 10)).maybeSingle(),
  ]);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold">Your account</h1>
      <dl className="divide-y rounded-lg border text-sm">
        <Row label="Email">{v.user.email}</Row>
        <Row label="Plan">
          {v.plan === "pro" ? "Pro" : "Free"}
          {v.isStaff && v.plan !== "pro" && " (staff: Pro features on)"}
          {p?.plan_status && ` · ${p.plan_status.replace("_", " ")}`}
        </Row>
        {p?.plan_renews_at && <Row label={p.plan_status === "cancelled" ? "Pro until" : "Renews"}>{new Date(p.plan_renews_at).toISOString().slice(0, 10)}</Row>}
        <Row label="Saved channels"><Link href="/saved" className="underline">{saved ?? 0}{v.isPro ? "" : " of 10"}</Link></Row>
        <Row label="AI questions today">{usage?.count ?? 0} of {v.isPro ? 50 : 3}</Row>
      </dl>
      <div className="flex flex-wrap gap-3">
        {p?.portal_url
          ? <a href={p.portal_url} className="rounded-md border px-4 py-2 text-sm">Manage subscription</a>
          : v.plan !== "pro" && <Link href="/pricing" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">Upgrade to Pro</Link>}
        <form action="/auth/signout" method="post"><button className="rounded-md border px-4 py-2 text-sm">Log out</button></form>
      </div>
    </main>
  );
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex justify-between gap-4 p-3"><dt className="text-neutral-500">{label}</dt><dd className="text-right">{children}</dd></div>
);
