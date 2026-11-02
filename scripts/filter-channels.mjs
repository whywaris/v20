// Keep only low-competition, creator-friendly channels in data/unified_channels.json, then drop outlier
// videos whose channel is gone (their "View channel" link would 404).
// Usage: node scripts/filter-channels.mjs           (rewrites the files)
//        node scripts/filter-channels.mjs --dry-run (only prints what would be removed)
import fs from 'node:fs';

const FILE = new URL('../data/unified_channels.json', import.meta.url);
const VIDEO_FILES = ['unified_outliers.json', 'unified_swipe_videos.json'].map((f) => new URL(`../data/${f}`, import.meta.url));
const MAX_SUBSCRIBERS = 250_000;

// TV networks, broadcast media and kids-animation mega-channels.
const BLACKLIST = [
  /cocomelon/i, /nursery rhymes/i, /little baby bum/i, /bebefinn/i, /sony liv/i, /hum tv/i, /zee tv/i,
  /colors tv/i, /t-series/i, /set india/i, /aaj tak/i, /geo news/i, /ary digital/i, /wwe/i, /vegas legends/i,
];

function reasonToRemove(c) {
  if (typeof c?.title !== 'string' || !c.title.trim()) return 'missing title';
  if (typeof c.subscribers !== 'number' || !Number.isFinite(c.subscribers) || c.subscribers < 0) return 'invalid subscribers';
  if (c.subscribers > MAX_SUBSCRIBERS) return `over ${MAX_SUBSCRIBERS.toLocaleString('en-US')} subscribers`;
  if (BLACKLIST.some((re) => re.test(c.title))) return 'blacklisted title';
  return null;
}

const dryRun = process.argv.includes('--dry-run');
const channels = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const kept = [];
const removed = {};
for (const c of channels) {
  const reason = reasonToRemove(c);
  if (reason) (removed[reason] ??= []).push(`${c?.title ?? '(no title)'} (${c?.subscribers})`);
  else kept.push(c);
}

console.log(`${channels.length} channels -> ${kept.length} kept, ${channels.length - kept.length} removed`);
for (const [reason, list] of Object.entries(removed)) {
  console.log(`  ${reason}: ${list.length} (e.g. ${list.slice(0, 3).join(', ')})`);
}
if (!dryRun) {
  fs.writeFileSync(FILE, JSON.stringify(kept, null, 2), 'utf8');
  console.log('Wrote data/unified_channels.json');
}

// Same match as app/channel/[handle]: the link is /channel/<channelId || handle>, found by channel id or handle.
const norm = (s) => (s || '').toLowerCase().trim().replace(/^@/, '');
const channelKeys = new Set(kept.flatMap((c) => [norm(c.id), norm(c.handle)]).filter(Boolean));
for (const file of VIDEO_FILES) {
  if (!fs.existsSync(file)) continue;
  const videos = JSON.parse(fs.readFileSync(file, 'utf8'));
  const keptVideos = videos.filter((v) => channelKeys.has(norm(v.channelId || v.channelHandle)));
  const name = file.pathname.split('/').pop();
  console.log(`${name}: ${videos.length} videos -> ${keptVideos.length} kept, ${videos.length - keptVideos.length} removed (channel not in list)`);
  if (!dryRun && keptVideos.length !== videos.length) fs.writeFileSync(file, JSON.stringify(keptVideos, null, 2), 'utf8');
}
if (dryRun) console.log('Dry run: files not changed.');
