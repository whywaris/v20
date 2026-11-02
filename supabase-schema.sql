-- =========================================================
-- Supabase Database Schema for YouTube Niches & Swipe-File
-- Run this in your Supabase SQL Editor
-- =========================================================

-- Enable pg_trgm for ultra-fast text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Niches Table
CREATE TABLE IF NOT EXISTS niches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    channel_count INT DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    avg_views BIGINT DEFAULT 0,
    avg_subscribers BIGINT DEFAULT 0,
    rpm_min NUMERIC(5,2) DEFAULT 4.00,
    rpm_max NUMERIC(5,2) DEFAULT 12.00,
    rpm_avg NUMERIC(5,2) DEFAULT 7.50,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_niches_slug ON niches(slug);
CREATE INDEX IF NOT EXISTS idx_niches_name_trgm ON niches USING gin (name gin_trgm_ops);

-- 2. Channels Table
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    handle TEXT NOT NULL,
    yt_channel_id TEXT,
    youtube_url TEXT,
    thumbnail_url TEXT,
    subscribers BIGINT DEFAULT 0,
    avg_views BIGINT DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    total_videos INT DEFAULT 0,
    avg_video_length_seconds INT,
    monetization BOOLEAN DEFAULT false,
    estimated_rpm NUMERIC(5,2) DEFAULT 7.50,
    estimated_monthly_revenue_usd INT DEFAULT 0,
    categories JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    avatar_style TEXT,
    persona_archetype TEXT,
    uploads_per_week NUMERIC(4,2),
    sells TEXT DEFAULT 'unknown',
    title_patterns JSONB DEFAULT '[]'::jsonb,
    why_it_works JSONB DEFAULT '[]'::jsonb,
    offers JSONB DEFAULT '[]'::jsonb,
    popular_videos JSONB DEFAULT '[]'::jsonb,
    source TEXT DEFAULT 'unified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_channels_slug ON channels(slug);
CREATE INDEX IF NOT EXISTS idx_channels_handle ON channels(handle);
CREATE INDEX IF NOT EXISTS idx_channels_subscribers ON channels(subscribers DESC);
CREATE INDEX IF NOT EXISTS idx_channels_title_trgm ON channels USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_channels_tags ON channels USING gin (tags);

-- 3. Swipe File Videos Table (20,000+ viral outlier videos)
CREATE TABLE IF NOT EXISTS swipe_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    video_url TEXT NOT NULL,
    channel_title TEXT,
    channel_handle TEXT,
    categories JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    is_outlier BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_swipe_videos_video_id ON swipe_videos(video_id);
CREATE INDEX IF NOT EXISTS idx_swipe_videos_title_trgm ON swipe_videos USING gin (title gin_trgm_ops);

-- 4. User Saved Bookmarks / Custom Folders
CREATE TABLE IF NOT EXISTS user_saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('channel', 'video')),
    channel_slug TEXT,
    video_id TEXT,
    folder_name TEXT DEFAULT 'Favorites',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_user_saved_user_id ON user_saved_items(user_id);

-- =========================================================
-- Enable Row Level Security (RLS)
-- =========================================================

ALTER TABLE niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_items ENABLE ROW LEVEL SECURITY;

-- Public can read all niches, channels, and swipe videos (essential for SEO)
CREATE POLICY "Allow public read access to niches" ON niches FOR SELECT USING (true);
CREATE POLICY "Allow public read access to channels" ON channels FOR SELECT USING (true);
CREATE POLICY "Allow public read access to swipe_videos" ON swipe_videos FOR SELECT USING (true);

-- User-specific access for saved bookmarks
CREATE POLICY "Users can read own saved items" ON user_saved_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved items" ON user_saved_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved items" ON user_saved_items FOR DELETE USING (auth.uid() = user_id);
