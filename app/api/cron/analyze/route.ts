import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeBatch } from "@/lib/analyze";

export const maxDuration = 300;

// Daily: re-analyzes the 20 least recently analyzed channels (vercel.json). Same auth as the sync cron.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const results = await analyzeBatch(createAdminClient(), 20);
  return NextResponse.json({ analyzed: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok) });
}
