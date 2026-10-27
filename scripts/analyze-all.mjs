// Analyze every never-analyzed channel by calling /api/cron/analyze until none are left.
// Usage: npm run analyze:all                 (local dev server, reads .env.local)
//        npm run analyze:all -- https://your-site.com
try { process.loadEnvFile(".env.local"); } catch { /* use the shell's env */ }
const base = process.argv[2] ?? "http://localhost:3000";
const secret = process.env.CRON_SECRET;
if (!secret) throw new Error("CRON_SECRET is not set");

let stuck = 0;
for (let round = 1; ; round++) {
  const res = await fetch(`${base}/api/cron/analyze?limit=100`, { headers: { authorization: `Bearer ${secret}` } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const r = await res.json();
  console.log(`round ${round}: analyzed ${r.analyzed}, failed ${r.failed.length}, never analyzed left ${r.remaining_unanalyzed}`);
  for (const f of r.failed) console.log(`  failed @${f.handle}: ${f.error}`);
  if (r.remaining_unanalyzed === 0) break;
  stuck = r.analyzed === 0 ? stuck + 1 : 0;
  if (stuck >= 2) { console.log("No progress twice in a row, stopping."); break; }
}
