# 🤖 MASTER AI BUILD PROMPT: YouTube Niches & Swipe-File Directory

> **Instructions for the User:**
> Jab aap apna **New Empty Project Folder** open karein (Cursor, Claude Code, Antigravity, ya VS Code mein), yeh **poora prompt copy kar ke AI ko dein**. AI step-by-step poori website scratch se build kar dega!

---

```markdown
You are a Principal Full-Stack Engineer and World-Class UI/UX Designer specializing in Next.js 15, TypeScript, Tailwind CSS, Supabase, and Programmatic SEO (pSEO).

Your task is to build a production-ready, ultra-fast web application: **"YouTube Niches & Swipe-File Directory"**.
This platform combines the clean, high-converting aesthetic of **AvatarChannels.com** with the viral video research power of **NexLev.io**.

---

### Project Assets & Data Included:
Inside the `/data` folder, we already have complete, clean JSON datasets ready:
1. `/data/unified_channels.json`: 7,467 YouTube Channels (Titles, @handles, Subscribers, Total Views, Avg Views, RPM, Monthly Revenue, Thumbnails, Title Formulas, Offers).
2. `/data/unified_niches.json`: 3,180 Niches & Sub-Niches with benchmark RPM and channel counts.
3. `/data/unified_swipe_videos.json`: 20,217 Viral Outlier Videos with thumbnails and video IDs.

---

### Step-by-Step Build Plan:

#### Step 1: Framework & Dependencies Setup
Initialize or configure Next.js 15 with App Router, TypeScript, Tailwind CSS, and essential libraries:
```bash
npm install lucide-react @supabase/supabase-js @supabase/ssr recharts clsx tailwind-merge @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

#### Step 2: Design System & Aesthetics (AvatarChannels Signature)
Implement a clean, modern aesthetic with glassmorphism and dual light/dark mode:
* **Backgrounds & Surfaces:**
  - Dark Mode: Background `#0A0A09`, Surface `#111110`, Border `rgba(255,255,255,0.08)`, Text `#F5F5F3`
  - Light Mode: Background `#FAFAF8`, Surface `#FFFFFF`, Border `rgba(0,0,0,0.08)`, Text `#141414`
* **Brand Accents:** Vivid Coral `#FF6A3D` & Crimson `#E4572E`.
* **Typography:**
  - Primary font: Inter / sans-serif.
  - Numerics & metrics: JetBrains Mono (monospace) for tabular counts and stats.
* **Glassmorphism:** Sticky headers with `backdrop-blur-xl bg-surface/80 border-b border-white/5`.

#### Step 3: Core Layout & Navigation
Build responsive layout components in `/components/layout/`:
* `Header.tsx`: Brand logo (`NicheVault` or chosen brand), navigation links (`Channels`, `Niches`, `Swipe File`, `Blog`, `Saved`), Dark/Light mode toggle, and "Sign in with Google" button.
* `Footer.tsx`: Niche categories directory links, privacy, terms, and newsletter signup.

#### Step 4: The Master Directory with Filter Engine (`/app/(public)/page.tsx`)
Build the main homepage matching AvatarChannels.com:
1. **Hero Section:**
   - H1: *"YouTube Channels & Viral Niches Library"*
   - Live Counter Pills: `7,467 Channels`, `3,180 Niches`, `20,217 Swipe Videos`.
   - Real-time search bar (`Search channels, niches, personas...`).
   - Newsletter Capture Card: *"The Weekly AI & YouTube Niche Report"*.
2. **Sticky Multi-Faceted Filter Sidebar (`/components/filters/FilterSidebar.tsx`):**
   - Topic / Niche Selector (Cooking, History, Spirituality, Crime, AI, etc.)
   - Subscriber Range (`<1K`, `1K-10K`, `10K-100K`, `100K+`)
   - Format Filter (`Faceless`, `AI Avatar`, `Documentary`, etc.)
   - Monetization Filter (`Ads: Yes`, `Sells a Product`)
   - Offer Type (`Ebook`, `Cookbook`, `Guide`, `Bundle`)
   - Price Filter (`<$20`, `$20-$39`, `$40-$59`, `$60+`)
   - Sort Order (`Most Popular`, `Fastest Growing`, `Newest`, `Subscribers`)
3. **Channel Card Grid (`/components/channels/ChannelCard.tsx`):**
   - Channel Avatar with verified badge.
   - Title, `@handle`, Category tags, Country, Language.
   - Key Stats: Subscribers, Avg Views, Total Views.
   - Top 3 video thumbnails with view duration pills and YouTube link.
   - Monetization Offer badge (e.g. *Selling: Ebook ($29)*).
   - "View Full Stats & Funnel" action link.

#### Step 5: Programmatic Channel Profile (`/app/(public)/channel/[handle]/page.tsx`)
1. Hero overview with banner, avatar, description, and tags.
2. Metrics grid (Subs, Views, Videos, Estimated AdSense RPM).
3. **The Gated Stats & Growth Chart Section:**
   - Unauthenticated users: Blurred chart preview with a frosted overlay (`backdrop-blur-md`) and a CTA button: *"Sign in with Google to view 90-day growth velocity & exact revenue"*.
   - Authenticated users: Interactive Recharts line chart showing daily subscriber and view changes.
4. **"Why It Works" Analysis:** Structured bullet points explaining growth drivers.
5. **Title Patterns & Formulas:** Copy-paste title templates for creators.
6. **Monetization Funnel:** Funnel steps, link-in-bio, and digital products sold.

#### Step 6: 3,180 Programmatic Niche Landing Pages (`/app/(public)/niche/[slug]/page.tsx`)
* Dynamic URL for every niche (`/niche/faceless-history`, `/niche/crystals-spirituality`).
* Automated high-ranking text overview (Channel count, average RPM, total views).
* Grid of top channels in this niche.
* Top viral swipe-file videos for this niche.
* Dynamic Schema.org `CollectionPage` + `ItemList`.

#### Step 7: Viral Video Swipe-File Vault (`/app/(public)/swipe-file/page.tsx`)
* Fast grid of 20,217 viral videos.
* Filter by niche/category or outlier ratio.
* Hover-to-preview thumbnail, video duration, and hook classification.
* "Save to My Swipe File" button (saves to Supabase `user_saved_items`).

#### Step 8: Dedicated SEO Blog Section (`/app/(public)/blog/page.tsx`)
* Markdown/MDX powered blog engine.
* Rich articles with reading time, table of contents, and author bio.
* Pre-populate 3 comprehensive starter guides:
  1. *"Top 10 High RPM YouTube Niches in 2026 (Real Data Breakdown)"*
  2. *"How to Build and Monetize a Faceless YouTube Channel with AI"*
  3. *"The Ultimate YouTube Title Formula Guide (Deconstructed from 20,000 Videos)"*

#### Step 9: Supabase Google Auth & Gating Modal
* Supabase client & server helper in `/lib/supabase/`.
* Auth Callback route in `/app/api/auth/callback/route.ts`.
* Modal dialog: *"Continue with Google"* to unlock full stats, bookmarks, and revenue metrics.

#### Step 10: Sitemaps & Technical SEO Automation
* Automated `sitemap.ts` splitting pages into sitemap indexes:
  - `sitemap/channels.xml`
  - `sitemap/niches.xml`
  - `sitemap/blog.xml`
* OpenGraph image generator in `/app/api/og/route.tsx`.

---
Proceed step-by-step. Write clean, modular, typed code adhering strictly to modern Next.js 15 best practices.
```
