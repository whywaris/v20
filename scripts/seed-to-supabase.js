/**
 * Seed script to import extracted JSON data into Supabase PostgreSQL
 * Run: node scripts/seed-to-supabase.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
  console.log('Set them in .env.local or pass them directly when running.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  const dataDir = path.join(__dirname, '..', 'data');
  const nichesFile = path.join(dataDir, 'unified_niches.json');
  const channelsFile = path.join(dataDir, 'unified_channels.json');
  const videosFile = path.join(dataDir, 'unified_swipe_videos.json');

  console.log('🚀 Starting Supabase Database Seed...');

  // 1. Seed Niches
  if (fs.existsSync(nichesFile)) {
    const niches = JSON.parse(fs.readFileSync(nichesFile, 'utf8'));
    console.log(`Inserting ${niches.length} niches in batches...`);
    for (let i = 0; i < niches.length; i += 200) {
      const batch = niches.slice(i, i + 200).map(n => ({
        slug: n.slug,
        name: n.name,
        channel_count: n.channelCount,
        total_views: n.totalViews,
        avg_views: n.avgViews,
        rpm_min: n.rpm.min,
        rpm_max: n.rpm.max,
        rpm_avg: n.rpm.avg
      }));
      const { error } = await supabase.from('niches').upsert(batch, { onConflict: 'slug' });
      if (error) console.error(`Error at niche batch ${i}:`, error.message);
      else console.log(`Saved niches ${i} - ${Math.min(i + 200, niches.length)}`);
    }
  }

  // 2. Seed Channels
  if (fs.existsSync(channelsFile)) {
    const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));
    console.log(`Inserting ${channels.length} channels in batches...`);
    for (let i = 0; i < channels.length; i += 200) {
      const batch = channels.slice(i, i + 200).map(c => ({
        slug: c.id,
        title: c.title,
        handle: c.handle,
        yt_channel_id: c.ytChannelId,
        youtube_url: c.youtubeUrl,
        thumbnail_url: c.thumbnail,
        subscribers: c.subscribers,
        avg_views: c.avgViews,
        total_views: c.totalViews,
        total_videos: c.totalVideos,
        avg_video_length_seconds: c.avgVideoLengthSeconds,
        monetization: c.monetization,
        estimated_rpm: c.estimatedRpm?.avg || 7.5,
        estimated_monthly_revenue_usd: c.estimatedMonthlyRevenueUsd || 0,
        categories: c.categories || [],
        tags: c.tags || [],
        avatar_style: c.avatarStyle || null,
        persona_archetype: c.personaArchetype || null,
        uploads_per_week: c.uploadsPerWeek || null,
        sells: c.sells || 'unknown',
        title_patterns: c.titlePatterns || [],
        why_it_works: c.whyItWorks || [],
        offers: c.offers || [],
        popular_videos: c.popularVideos || [],
        source: c.source || 'unified'
      }));
      const { error } = await supabase.from('channels').upsert(batch, { onConflict: 'slug' });
      if (error) console.error(`Error at channel batch ${i}:`, error.message);
      else console.log(`Saved channels ${i} - ${Math.min(i + 200, channels.length)}`);
    }
  }

  // 3. Seed Swipe Videos
  if (fs.existsSync(videosFile)) {
    const videos = JSON.parse(fs.readFileSync(videosFile, 'utf8'));
    console.log(`Inserting ${videos.length} swipe-file videos in batches...`);
    for (let i = 0; i < videos.length; i += 300) {
      const batch = videos.slice(i, i + 300).map(v => ({
        video_id: v.videoId,
        title: v.title,
        thumbnail_url: v.thumbnail,
        video_url: v.videoUrl,
        channel_title: v.channelTitle,
        channel_handle: v.channelHandle,
        categories: v.categories || [],
        tags: v.tags || []
      }));
      const { error } = await supabase.from('swipe_videos').upsert(batch, { onConflict: 'video_id' });
      if (error) console.error(`Error at video batch ${i}:`, error.message);
      else console.log(`Saved videos ${i} - ${Math.min(i + 300, videos.length)}`);
    }
  }

  console.log('🎉 Database seeding complete!');
}

seed().catch(console.error);
