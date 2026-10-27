import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { planFor, verifySignature } from "@/lib/billing";

// Lemon Squeezy → Store settings → Webhooks: URL /api/webhooks/lemonsqueezy, events subscription_*.
export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get("x-signature"), process.env.LEMONSQUEEZY_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }
  const body = JSON.parse(raw);
  const event: string = body.meta?.event_name ?? "";
  if (!event.startsWith("subscription_") || body.data?.type !== "subscriptions") return NextResponse.json({ ignored: event });

  const userId: string | undefined = body.meta?.custom_data?.user_id;
  const a = body.data.attributes;
  const update = {
    plan: planFor(a.status),
    plan_status: a.status,
    plan_renews_at: a.ends_at ?? a.renews_at ?? null,
    ls_subscription_id: String(body.data.id),
    portal_url: a.urls?.customer_portal ?? null,
  };

  const db = createAdminClient();
  // Later events may lack custom_data; fall back to the subscription id we stored on the first one.
  const q = db.from("profiles").update(update, { count: "exact" });
  const { error, count } = await (userId ? q.eq("id", userId) : q.eq("ls_subscription_id", update.ls_subscription_id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!count) console.error("lemonsqueezy webhook: no profile for", userId ?? update.ls_subscription_id);
  return NextResponse.json({ ok: true, plan: update.plan, matched: count });
}
