import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { Niche } from '@/types';

const dataPath = path.join(process.cwd(), 'data', 'unified_niches.json');

function readNiches(): Niche[] {
  try {
    if (fs.existsSync(dataPath)) {
      return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading niches:', e);
  }
  return [];
}

function writeNiches(niches: Niche[]) {
  fs.writeFileSync(dataPath, JSON.stringify(niches, null, 2), 'utf8');
}

// GET: Paginated & filtered list of niches
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').toLowerCase().trim();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const allNiches = readNiches();
  let filtered = allNiches;

  if (search) {
    filtered = allNiches.filter(
      (n) =>
        n.name.toLowerCase().includes(search) ||
        n.slug.toLowerCase().includes(search)
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

// POST: Add new niche
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Niche name required' }, { status: 400 });
    }

    const allNiches = readNiches();
    const slug = body.slug || body.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

    const newNiche: Niche = {
      name: body.name,
      slug: slug,
      channelCount: Number(body.channelCount) || 1,
      avgViews: Number(body.avgViews) || 50000,
      rpm: {
        min: Number(body.rpmMin) || 6.0,
        avg: Number(body.rpmAvg) || 10.5,
        max: Number(body.rpmMax) || 18.0
      },
      saturation: body.saturation || 'Medium',
      demandScore: Number(body.demandScore) || 8.5,
      formatRecommendation: body.formatRecommendation || 'Faceless Voiceover',
      topTitleFormulas: Array.isArray(body.topTitleFormulas) ? body.topTitleFormulas : [
        `[N] Shocking Secrets About ${body.name} Nobody Tells You`,
        `Why Most People Do ${body.name} Wrong (Try This Instead)`,
        `Before You Start ${body.name}, Watch This!`,
        `The Ultimate Guide to ${body.name} in 2026`
      ],
      summary: body.summary || `Comprehensive guide and revenue intelligence for the ${body.name} YouTube niche.`
    };

    allNiches.unshift(newNiche);
    writeNiches(allNiches);

    return NextResponse.json({ success: true, niche: newNiche });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Update niche
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.slug) {
      return NextResponse.json({ error: 'Niche slug required' }, { status: 400 });
    }

    const allNiches = readNiches();
    const index = allNiches.findIndex((n) => n.slug.toLowerCase() === body.slug.toLowerCase());

    if (index === -1) {
      return NextResponse.json({ error: 'Niche not found' }, { status: 404 });
    }

    allNiches[index] = {
      ...allNiches[index],
      ...body,
      rpm: {
        min: body.rpmMin ? Number(body.rpmMin) : allNiches[index].rpm.min,
        avg: body.rpmAvg ? Number(body.rpmAvg) : allNiches[index].rpm.avg,
        max: body.rpmMax ? Number(body.rpmMax) : allNiches[index].rpm.max
      }
    };

    writeNiches(allNiches);
    return NextResponse.json({ success: true, niche: allNiches[index] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete niche
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'Niche slug required' }, { status: 400 });
    }

    const allNiches = readNiches();
    const filtered = allNiches.filter((n) => n.slug.toLowerCase() !== slug.toLowerCase());

    writeNiches(filtered);
    return NextResponse.json({ success: true, deletedCount: allNiches.length - filtered.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
