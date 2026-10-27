import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeBatch, countUnanalyzed } from "@/lib/analyze";

export const maxDuration = 300;

// Daily (vercel.json) and from `npm run analyze:all`. ?limit=N (max 300, default ANALYZE_PER_RUN or 60).
// Stops starting new channels after 4 minutes; the rest wait for the next call.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const limit = Math.min(300, Number(new URL(request.url).searchParams.get("limit")) || Number(process.env.ANALYZE_PER_RUN) || 60);
  const db = createAdminClient();
  const results = await analyzeBatch(db, limit, undefined, Date.now() + 240_000);
  return NextResponse.json({
    analyzed: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok),
    remaining_unanalyzed: await countUnanalyzed(db),
  });
}
