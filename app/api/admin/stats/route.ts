import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { overrideCount, pendingSubmissions, postCount, unreadMessages } from '@/lib/admin-queries';
import { getChannels, getNiches, getOutliers } from '@/lib/data';

// Live counts for the admin (the dashboard page reads the same sources server-side).
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const [channels, niches, unread, pending, edits, published, drafts] = await Promise.all([
    getChannels(),
    getNiches(),
    unreadMessages(),
    pendingSubmissions(),
    overrideCount(),
    postCount('published'),
    postCount('draft'),
  ]);
  return NextResponse.json({
    channelsCount: channels.length,
    nichesCount: niches.length,
    outliersCount: getOutliers().length,
    unreadMessages: unread.value,
    pendingSubmissions: pending.value,
    overrides: edits.value,
    publishedPosts: published.value,
    draftPosts: drafts.value,
  });
}
