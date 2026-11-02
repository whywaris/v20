# YouTube Niches & Swipe-File Directory (Starter Package)

A complete production-ready foundation and dataset for building a **YouTube Niche & Swipe-File Platform** inspired by **AvatarChannels.com** and **NexLev.io**.

---

## 📦 What's Included in this Starter Package:

1. **`data/` (Master Datasets):**
   * `unified_channels.json`: 7,467 YouTube Channels with metrics, RPM, revenue estimates, avatars, and title patterns.
   * `unified_niches.json`: 3,180 Niches & Sub-Niches with benchmark RPM and channel counts.
   * `unified_swipe_videos.json`: 20,217 Viral Outlier Videos with thumbnails and video URLs.
2. **`CLAUDE.md`:** Complete guidelines, design tokens, architecture, and coding rules for Claude / AI assistants.
3. **`SECURITY.md`:** Security architecture, Supabase Row Level Security (RLS) policies, and token safety.
4. **`MASTER_BUILD_PROMPT.md`:** The exact system prompt to copy-paste into Claude Code, Cursor, or Antigravity to build the entire app from scratch.
5. **`supabase-schema.sql`:** Complete PostgreSQL database schema with indexes and RLS policies for Supabase.
6. **`scripts/seed-to-supabase.js`:** Automated script to import all 7.4k channels and 20k videos directly into Supabase.
7. **`.env.example`:** Pre-configured environment variable template.

---

## 🚀 How to Use this Package in a New Project:

### Step 1: Copy this Folder
Copy the entire `youtube-niche-platform-starter` folder to wherever you want on your computer and rename it to your project name (e.g., `youtube-niche-vault` or `niche-directory`).

### Step 2: Open in your AI IDE
Open that new folder in **Cursor**, **VS Code**, **Claude Code**, or **Antigravity**.

### Step 3: Run the Master Build Prompt
Open the file **`MASTER_BUILD_PROMPT.md`**, copy the prompt, and paste it into your AI assistant. The AI will read `CLAUDE.md`, load the datasets from `/data`, and build all components, pages, filters, and auth steps automatically!

### Step 4: Supabase Setup (5 Minutes)
1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** -> paste the contents of `supabase-schema.sql` -> click **Run**.
3. Copy your Supabase URL & Service Role Key into `.env.local`.
4. Run `node scripts/seed-to-supabase.js` to populate your database with 7,467 channels and 20,217 videos!
