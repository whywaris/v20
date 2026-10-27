import { NextResponse } from "next/server";
import { SITE, SITE_SOURCE } from "@/lib/seo";

export const dynamic = "force-dynamic";

// Uptime check + which public URL the site uses (no secrets).
export function GET() {
  return NextResponse.json({
    ok: true,
    site: SITE,
    siteSource: SITE_SOURCE,
    vercelEnv: process.env.VERCEL_ENV ?? null,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
  });
}
