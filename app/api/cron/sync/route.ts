import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncAll } from "@/lib/sync";

export const maxDuration = 300;

// Vercel Cron calls this daily (vercel.json) with "Authorization: Bearer $CRON_SECRET".
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await syncAll(createAdminClient()));
  } catch (e) {
    console.error("sync failed", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
