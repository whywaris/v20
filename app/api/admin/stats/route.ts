import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export async function GET() {
  const dataDir = path.join(process.cwd(), 'data');
  const channelsPath = path.join(dataDir, 'unified_channels.json');
  const nichesPath = path.join(dataDir, 'unified_niches.json');
  const outliersPath = path.join(dataDir, 'unified_outliers.json');

  let channelsCount = 0;
  let nichesCount = 0;
  let outliersCount = 0;

  try {
    if (fs.existsSync(channelsPath)) {
      const c = JSON.parse(fs.readFileSync(channelsPath, 'utf8'));
      channelsCount = c.length;
    }
    if (fs.existsSync(nichesPath)) {
      const n = JSON.parse(fs.readFileSync(nichesPath, 'utf8'));
      nichesCount = n.length;
    }
    if (fs.existsSync(outliersPath)) {
      const o = JSON.parse(fs.readFileSync(outliersPath, 'utf8'));
      outliersCount = o.length;
    }
  } catch (e) {
    console.error('Error reading stats:', e);
  }

  return NextResponse.json({
    channelsCount,
    nichesCount,
    outliersCount,
    blogPostsCount: 4,
    status: 'healthy',
    canonicalUrl: 'https://ytniches.com/',
    siteName: 'YT Niches'
  });
}
