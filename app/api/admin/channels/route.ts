import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { Channel } from '@/types';

const dataPath = path.join(process.cwd(), 'data', 'unified_channels.json');

function readChannels(): Channel[] {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading channels:', e);
  }
  return [];
}

function writeChannels(channels: Channel[]) {
  fs.writeFileSync(dataPath, JSON.stringify(channels, null, 2), 'utf8');
}

// GET: Paginated & filtered list of channels
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').toLowerCase().trim();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const allChannels = readChannels();
  let filtered = allChannels;

  if (search) {
    filtered = allChannels.filter(
      (c) =>
        c.title?.toLowerCase().includes(search) ||
        c.handle?.toLowerCase().includes(search) ||
        (c.categories || []).some((cat) => cat.toLowerCase().includes(search))
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return NextResponse.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
}

// POST: Add new channel
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.handle) {
      return NextResponse.json({ error: 'Title and handle are required' }, { status: 400 });
    }

    const allChannels = readChannels();
    const handleClean = body.handle.replace('@', '').toLowerCase().trim();

    const newChannel: Channel = {
      id: body.id || handleClean,
      slug: body.slug || handleClean,
      title: body.title,
      handle: body.handle.startsWith('@') ? body.handle : `@${body.handle}`,
      youtubeUrl: body.youtubeUrl || `https://www.youtube.com/@${handleClean}`,
      thumbnail: body.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=60',
      subscribers: Number(body.subscribers) || 0,
      avgViews: Number(body.avgViews) || 0,
      totalViews: Number(body.totalViews) || 0,
      totalVideos: Number(body.totalVideos) || 0,
      format: body.format || 'faceless',
      avatarStyle: body.avatarStyle || null,
      avatarMotion: 'unknown',
      gender: null,
      monetization: Boolean(body.monetization),
      estimatedRpm: {
        min: Number(body.rpmMin) || 6.0,
        avg: Number(body.rpmAvg) || 9.5,
        max: Number(body.rpmMax) || 15.0
      },
      estimatedMonthlyRevenueUsd: Number(body.estimatedMonthlyRevenueUsd) || null,
      categories: Array.isArray(body.categories) ? body.categories : (body.categories ? body.categories.split(',').map((s: string) => s.trim()) : ['General']),
      tags: Array.isArray(body.tags) ? body.tags : (body.tags ? body.tags.split(',').map((s: string) => s.trim()) : []),
      sells: body.sells ? 'yes' : 'no',
      offers: [],
      popularVideos: body.popularVideos || []
    };

    allChannels.unshift(newChannel);
    writeChannels(allChannels);

    return NextResponse.json({ success: true, channel: newChannel });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Update channel
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.id && !body.handle) {
      return NextResponse.json({ error: 'Channel ID or handle required' }, { status: 400 });
    }

    const allChannels = readChannels();
    const handleClean = (body.handle || body.id || '').replace('@', '').toLowerCase().trim();
    const index = allChannels.findIndex(
      (c) => c.id?.toLowerCase() === handleClean || c.handle?.replace('@', '').toLowerCase() === handleClean
    );

    if (index === -1) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Merge updates
    const existing = allChannels[index];
    allChannels[index] = {
      ...existing,
      ...body,
      subscribers: body.subscribers !== undefined ? Number(body.subscribers) : existing.subscribers,
      avgViews: body.avgViews !== undefined ? Number(body.avgViews) : existing.avgViews,
      estimatedMonthlyRevenueUsd: body.estimatedMonthlyRevenueUsd !== undefined ? Number(body.estimatedMonthlyRevenueUsd) : existing.estimatedMonthlyRevenueUsd,
      monetization: body.monetization !== undefined ? Boolean(body.monetization) : existing.monetization
    };

    writeChannels(allChannels);
    return NextResponse.json({ success: true, channel: allChannels[index] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete channel
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Channel ID required' }, { status: 400 });
    }

    const allChannels = readChannels();
    const idClean = id.replace('@', '').toLowerCase().trim();
    const filtered = allChannels.filter(
      (c) => c.id?.toLowerCase() !== idClean && c.handle?.replace('@', '').toLowerCase() !== idClean
    );

    writeChannels(filtered);
    return NextResponse.json({ success: true, deletedCount: allChannels.length - filtered.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
